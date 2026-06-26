import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getRandomKeyword } from '@/lib/keywords';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: NextRequest) {
  try {
    const { gameId } = await req.json();

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

    let nextPhase: 'discussion' | 'voting' | 'results' = 'discussion';

    if (currentRound.phase === 'discussion') {
      nextPhase = 'voting';
    } else if (currentRound.phase === 'voting') {
      nextPhase = 'results';

      // Tally votes and determine elimination
      const { data: players } = await supabase
        .from('game_players')
        .select('*')
        .eq('game_id', gameId);

      if (players && players.length > 0) {
        // Count votes for each player
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
      }
    } else if (currentRound.phase === 'results') {
      // Start next round
      const { data: newRound } = await supabase
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
      await supabase
        .from('game_players')
        .update({ voted_for_user_id: null })
        .eq('game_id', gameId);

      return NextResponse.json({
        status: 'round_advanced',
        newRound: gameData.current_round + 1,
        phase: 'discussion',
      });
    }

    // Reset votes if transitioning to voting phase
    if (nextPhase === 'voting') {
      await supabase
        .from('game_players')
        .update({ voted_for_user_id: null })
        .eq('game_id', gameId);
    }

    await supabase
      .from('game_rounds')
      .update({ phase: nextPhase })
      .eq('id', currentRound.id);

    return NextResponse.json({
      status: 'phase_advanced',
      phase: nextPhase,
      round: gameData.current_round,
    });
  } catch (error) {
    console.error('Error advancing phase:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
