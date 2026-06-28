import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface EliminateRequest {
  gameId: string;
  roundId: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: EliminateRequest = await request.json();
    const { gameId, roundId } = body;

    console.log('Processing elimination:', { gameId, roundId });

    // Get all votes for this round
    const { data: votes, error: votesError } = await supabase
      .from('game_votes')
      .select('voted_for_id')
      .eq('round_id', roundId);

    console.log('Votes retrieved:', { count: votes?.length, votesError });

    if (votesError || !votes || votes.length === 0) {
      return NextResponse.json(
        { error: 'No votes found for this round' },
        { status: 400 }
      );
    }

    // Count votes per player
    const voteCount = new Map<string, number>();
    for (const vote of votes) {
      const count = voteCount.get(vote.voted_for_id) || 0;
      voteCount.set(vote.voted_for_id, count + 1);
    }

    // Find player with most votes
    let maxVotes = 0;
    let eliminatedPlayerId = '';
    for (const [playerId, count] of voteCount.entries()) {
      if (count > maxVotes) {
        maxVotes = count;
        eliminatedPlayerId = playerId;
      }
    }

    console.log('Elimination result:', { eliminatedPlayerId, votes: maxVotes });

    if (!eliminatedPlayerId) {
      return NextResponse.json(
        { error: 'Could not determine eliminated player' },
        { status: 400 }
      );
    }

    // Mark player as eliminated
    const { error: updateError } = await supabase
      .from('game_players')
      .update({ is_alive: false })
      .eq('id', eliminatedPlayerId);

    if (updateError) {
      console.error('Error eliminating player:', updateError);
      return NextResponse.json(
        { error: `Failed to eliminate player: ${updateError.message}` },
        { status: 500 }
      );
    }

    // Get eliminated player details
    const { data: eliminatedPlayer } = await supabase
      .from('game_players')
      .select('id, user_id, role')
      .eq('id', eliminatedPlayerId)
      .single();

    console.log('Player eliminated:', { eliminatedPlayer, wasImposter: eliminatedPlayer?.role === 'imposter' });

    // Get all players to check win conditions
    const { data: allPlayers } = await supabase
      .from('game_players')
      .select('id, role, is_alive')
      .eq('game_id', gameId);

    console.log('Checking win conditions with players:', { count: allPlayers?.length });

    // Check win conditions
    let gameWon = false;
    let winner = '';

    if (eliminatedPlayer?.role === 'imposter') {
      // Imposter eliminated = Crewmates win
      gameWon = true;
      winner = 'crewmates';
      console.log('Crewmates win! Imposter eliminated.');
    } else {
      // Check if imposter reached parity (equal or more than crewmates)
      const aliveImpostors = allPlayers?.filter((p) => p.role === 'imposter' && p.is_alive).length || 0;
      const aliveCrewmates = allPlayers?.filter((p) => p.role === 'crewmate' && p.is_alive).length || 0;

      console.log('Alive count:', { impostors: aliveImpostors, crewmates: aliveCrewmates });

      if (aliveImpostors >= aliveCrewmates && aliveImpostors > 0) {
        gameWon = true;
        winner = 'imposter';
        console.log('Imposter wins! Reached parity.');
      }
    }

    // If game won, end it
    if (gameWon) {
      const { error: endError } = await supabase
        .from('games')
        .update({ status: 'ended' })
        .eq('id', gameId);

      if (endError) {
        console.error('Error ending game:', endError);
      }

      console.log('Game ended with winner:', winner);

      return NextResponse.json({
        success: true,
        eliminatedPlayer,
        gameWon: true,
        winner,
      });
    }

    // Game continues - advance to next round
    const { data: currentGame } = await supabase
      .from('games')
      .select('current_round, max_rounds')
      .eq('id', gameId)
      .single();

    const nextRound = (currentGame?.current_round || 1) + 1;
    const maxRounds = currentGame?.max_rounds || 10;

    if (nextRound > maxRounds) {
      // Hit max rounds, imposter wins by default
      await supabase
        .from('games')
        .update({ status: 'ended' })
        .eq('id', gameId);

      return NextResponse.json({
        success: true,
        eliminatedPlayer,
        gameWon: true,
        winner: 'imposter',
        reason: 'max_rounds_reached',
      });
    }

    // Create next round
    const { data: newRound, error: roundError } = await supabase
      .from('game_rounds')
      .insert({
        game_id: gameId,
        round_number: nextRound,
        phase: 'role_reveal',
      })
      .select()
      .single();

    if (roundError) {
      console.error('Error creating next round:', roundError);
      return NextResponse.json(
        { error: `Failed to create next round: ${roundError.message}` },
        { status: 500 }
      );
    }

    // Update game current_round
    await supabase
      .from('games')
      .update({ current_round: nextRound })
      .eq('id', gameId);

    console.log('Progressed to round:', nextRound);

    return NextResponse.json({
      success: true,
      eliminatedPlayer,
      gameWon: false,
      nextRound,
      newRoundId: newRound.id,
    });
  } catch (err) {
    console.error('Elimination error:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
