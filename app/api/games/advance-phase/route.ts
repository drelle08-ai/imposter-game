import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getRandomKeyword } from '@/lib/keywords';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: NextRequest) {
  try {
    const { gameId, gameType = 'imposter' } = await req.json();

    if (!gameId) {
      return NextResponse.json({ error: 'Game ID is required' }, { status: 400 });
    }

    const { data: gameData } = await supabase
      .from('games')
      .select('*')
      .eq('id', gameId)
      .single();

    if (!gameData) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    const { data: currentRound } = await supabase
      .from('game_rounds')
      .select('*')
      .eq('game_id', gameId)
      .eq('round_number', gameData.current_round)
      .single();

    if (!currentRound) {
      return NextResponse.json({ error: 'Round not found' }, { status: 404 });
    }

    const { data: players } = await supabase
      .from('game_players')
      .select('*')
      .eq('game_id', gameId);

    if (!players) {
      return NextResponse.json({ error: 'Failed to fetch players' }, { status: 500 });
    }

    // Mafia-specific phase advancement
    if (gameType === 'mafia') {
      console.log(`[Advance Phase] Mafia game: advancing from ${currentRound.phase} phase (round ${gameData.current_round})`);
      return await advanceMafiaPhase(gameId, gameData, currentRound, players);
    }

    // Imposter-specific phase advancement
    return await advanceImposterPhase(gameId, gameData, currentRound, players);
  } catch (error) {
    console.error('Error advancing phase:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function advanceMafiaPhase(
  gameId: string,
  gameData: any,
  currentRound: any,
  players: any[]
) {
  if (currentRound.phase === 'night') {
    console.log(`[Night to Day] Processing night actions for round ${gameData.current_round}`);

    // Process night actions: apply kills and saves
    let killedPlayerId = currentRound.mafia_killed_player;
    const savedPlayerId = currentRound.doctor_saved_player;
    const investigatedPlayerId = currentRound.sheriff_investigated_player;

    console.log(`[Night to Day] Actions - Kill: ${killedPlayerId}, Save: ${savedPlayerId}, Investigate: ${investigatedPlayerId}`);

    // Check if killed player was saved
    if (killedPlayerId === savedPlayerId) {
      console.log(`[Night to Day] Killed player was saved!`);
      killedPlayerId = null;
    }

    // Mark killed player as dead
    if (killedPlayerId) {
      const { error: killError } = await supabase
        .from('game_players')
        .update({ is_alive: false })
        .eq('id', killedPlayerId);

      if (killError) {
        console.error('[Night to Day] Error marking player as dead:', killError);
        return NextResponse.json({ error: 'Failed to process kill action' }, { status: 500 });
      }
      console.log(`[Night to Day] Marked player ${killedPlayerId} as dead`);
    }

    // Determine investigation result (is the investigated player mafia?)
    let investigationResult = false;
    if (investigatedPlayerId) {
      const investigatedPlayer = players.find((p) => p.id === investigatedPlayerId);
      investigationResult = investigatedPlayer?.role === 'mafia';
      console.log(`[Night to Day] Investigation result for ${investigatedPlayerId}: ${investigationResult}`);
    }

    // Transition to day
    const { error: phaseError } = await supabase
      .from('game_rounds')
      .update({
        phase: 'day',
        investigation_result: investigationResult,
      })
      .eq('id', currentRound.id);

    if (phaseError) {
      console.error('[Night to Day] Error updating phase to day:', phaseError);
      return NextResponse.json({ error: 'Failed to transition to day phase' }, { status: 500 });
    }

    console.log(`[Night to Day] Successfully transitioned to day phase`);

    return NextResponse.json({
      status: 'phase_advanced',
      phase: 'day',
      round: gameData.current_round,
    });
  } else if (currentRound.phase === 'day') {
    // Tally votes during day phase
    const voteCounts: { [playerId: string]: number } = {};
    players.forEach((player) => {
      if (player.voted_for_user_id) {
        voteCounts[player.voted_for_user_id] = (voteCounts[player.voted_for_user_id] || 0) + 1;
      }
    });

    // Find player with most votes
    let eliminatedPlayerId = '';
    let maxVotes = 0;
    for (const [playerId, voteCount] of Object.entries(voteCounts)) {
      if (voteCount > maxVotes) {
        maxVotes = voteCount;
        eliminatedPlayerId = playerId;
      }
    }

    // Mark eliminated player as dead
    if (eliminatedPlayerId) {
      await supabase
        .from('game_players')
        .update({ is_alive: false })
        .eq('id', eliminatedPlayerId);
    }

    // Reload players to get updated alive status
    const { data: updatedPlayers } = await supabase
      .from('game_players')
      .select('*')
      .eq('game_id', gameId);

    const playersList = updatedPlayers || players;

    // Check win conditions with updated player data
    const alivePlayers = playersList.filter((p) => p.is_alive);
    const aliveMafia = alivePlayers.filter((p) => p.role === 'mafia');
    const aliveCivilians = alivePlayers.filter((p) => p.role !== 'mafia');

    // Check if all Mafia are eliminated - Civilians win!
    if (aliveMafia.length === 0) {
      await supabase.from('games').update({ status: 'ended' }).eq('id', gameId);

      return NextResponse.json({
        status: 'game_ended',
        message: 'Civilians win! All Mafia have been eliminated.',
        winner: 'civilians',
      });
    }

    // Check if all Civilians are eliminated - Mafia wins!
    if (aliveCivilians.length === 0) {
      await supabase.from('games').update({ status: 'ended' }).eq('id', gameId);

      return NextResponse.json({
        status: 'game_ended',
        message: 'Mafia wins! All Civilians have been eliminated.',
        winner: 'mafia',
      });
    }

    // Also check mafia parity (Mafia >= Civilians) - Mafia wins!
    if (aliveMafia.length >= aliveCivilians.length) {
      await supabase.from('games').update({ status: 'ended' }).eq('id', gameId);

      return NextResponse.json({
        status: 'game_ended',
        message: 'Mafia wins! They have reached parity and control voting.',
        winner: 'mafia',
      });
    }

    // Check if max rounds reached - Civilians win by default
    const maxRounds = gameData.max_rounds || 5;
    if (gameData.current_round >= maxRounds) {
      await supabase.from('games').update({ status: 'ended' }).eq('id', gameId);

      return NextResponse.json({
        status: 'game_ended',
        message: 'Civilians win! All rounds completed without Mafia reaching parity.',
        winner: 'civilians',
      });
    }

    // Start next round
    const nextRoundNumber = gameData.current_round + 1;

    const { data: newRound, error: roundError } = await supabase
      .from('game_rounds')
      .insert({
        game_id: gameId,
        round_number: nextRoundNumber,
        phase: 'night',
      })
      .select()
      .single();

    if (roundError) {
      console.error('[Advance Phase] Error creating new round:', roundError);
      return NextResponse.json({ error: 'Failed to create round: ' + roundError.message }, { status: 500 });
    }

    const { error: gameError } = await supabase
      .from('games')
      .update({ current_round: nextRoundNumber })
      .eq('id', gameId);

    if (gameError) {
      console.error('[Advance Phase] Error updating game round:', gameError);
      return NextResponse.json({ error: 'Failed to update game: ' + gameError.message }, { status: 500 });
    }

    // Reset votes for all players
    const { error: voteError } = await supabase
      .from('game_players')
      .update({ voted_for_user_id: null })
      .eq('game_id', gameId);

    if (voteError) {
      console.error('[Advance Phase] Error resetting votes:', voteError);
      return NextResponse.json({ error: 'Failed to reset votes: ' + voteError.message }, { status: 500 });
    }

    console.log(`[Advance Phase] Advanced to round ${nextRoundNumber}, phase: night`);

    return NextResponse.json({
      status: 'round_advanced',
      newRound: nextRoundNumber,
      phase: 'night',
    });
  }

  return NextResponse.json({ error: 'Invalid phase' }, { status: 400 });
}

async function advanceImposterPhase(
  gameId: string,
  gameData: any,
  currentRound: any,
  players: any[]
) {
  let nextPhase: 'discussion' | 'voting' | 'results' = 'discussion';

  if (currentRound.phase === 'discussion') {
    nextPhase = 'voting';
  } else if (currentRound.phase === 'voting') {
    nextPhase = 'results';

    // Tally votes and determine elimination
    const voteCounts: { [playerId: string]: number } = {};
    players.forEach((player) => {
      if (player.voted_for_user_id) {
        voteCounts[player.voted_for_user_id] = (voteCounts[player.voted_for_user_id] || 0) + 1;
      }
    });

    // Find player with most votes
    let eliminatedPlayerId = '';
    let maxVotes = 0;
    for (const [playerId, voteCount] of Object.entries(voteCounts)) {
      if (voteCount > maxVotes) {
        maxVotes = voteCount;
        eliminatedPlayerId = playerId;
      }
    }

    // Mark eliminated player as dead
    if (eliminatedPlayerId) {
      await supabase
        .from('game_players')
        .update({ is_alive: false })
        .eq('id', eliminatedPlayerId);

      // Check if eliminated player is the imposter
      const eliminatedPlayer = players.find((p) => p.id === eliminatedPlayerId);
      const isImposterEliminated = eliminatedPlayer?.role === 'imposter';

      // Update round with results
      await supabase
        .from('game_rounds')
        .update({
          phase: nextPhase,
          imposter_eliminated: isImposterEliminated,
          crewmates_won: isImposterEliminated,
        })
        .eq('id', currentRound.id);

      return NextResponse.json({
        status: 'voting_complete',
        phase: nextPhase,
        round: gameData.current_round,
        eliminatedPlayer: eliminatedPlayerId,
        isImposterEliminated,
      });
    }
  } else if (currentRound.phase === 'results') {
    // Check if max rounds reached
    const maxRounds = gameData.max_rounds || 999;
    console.log(`[Advance Phase] Current round: ${gameData.current_round}, Max rounds: ${maxRounds}`);

    if (gameData.current_round >= maxRounds) {
      // Game is over
      await supabase.from('games').update({ status: 'ended' }).eq('id', gameId);

      return NextResponse.json({
        status: 'game_ended',
        message: 'Game completed after ' + gameData.max_rounds + ' rounds',
        totalRounds: gameData.max_rounds,
      });
    }

    // Start next round
    await supabase
      .from('game_rounds')
      .insert({
        game_id: gameId,
        round_number: gameData.current_round + 1,
        phase: 'discussion',
        imposter_eliminated: false,
        crewmates_won: false,
        keyword: getRandomKeyword(),
      })
      .select()
      .single();

    await supabase
      .from('games')
      .update({ current_round: gameData.current_round + 1 })
      .eq('id', gameId);

    // Reset votes for all players
    await supabase.from('game_players').update({ voted_for_user_id: null }).eq('game_id', gameId);

    return NextResponse.json({
      status: 'round_advanced',
      newRound: gameData.current_round + 1,
      phase: 'discussion',
    });
  }

  // Reset votes if transitioning to voting phase
  if (nextPhase === 'voting') {
    await supabase.from('game_players').update({ voted_for_user_id: null }).eq('game_id', gameId);
  }

  await supabase.from('game_rounds').update({ phase: nextPhase }).eq('id', currentRound.id);

  return NextResponse.json({
    status: 'phase_advanced',
    phase: nextPhase,
    round: gameData.current_round,
  });
}
