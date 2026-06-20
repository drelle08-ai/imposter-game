import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

    const { data: playersData } = await supabase
      .from('game_players')
      .select('*')
      .eq('game_id', gameId);

    if (!playersData) {
      return NextResponse.json({ error: 'Failed to fetch players' }, { status: 500 });
    }

    // Count votes if voting phase
    if (currentRound.phase === 'voting') {
      const votes: Record<string, number> = {};
      const playerVotes: Record<string, string[]> = {};

      playersData.forEach((player) => {
        if (player.voted_for_user_id) {
          votes[player.voted_for_user_id] = (votes[player.voted_for_user_id] || 0) + 1;
          playerVotes[player.voted_for_user_id] = [
            ...(playerVotes[player.voted_for_user_id] || []),
            player.user_id,
          ];
        }
      });

      // Check if all players have voted
      const aliveCount = playersData.filter((p) => p.is_alive).length;
      const votedCount = Object.values(playerVotes).flat().length;

      if (votedCount === aliveCount) {
        // Find player with most votes
        const eliminatedUserId = Object.keys(votes).reduce((a, b) =>
          votes[a] > votes[b] ? a : b
        );

        // Update player status
        await supabase
          .from('game_players')
          .update({ is_alive: false })
          .eq('game_id', gameId)
          .eq('user_id', eliminatedUserId);

        // Check win conditions
        const eliminatedPlayer = playersData.find((p) => p.user_id === eliminatedUserId);
        const isImposterEliminated = eliminatedPlayer?.role === 'imposter';

        // Move to results phase
        await supabase
          .from('game_rounds')
          .update({
            phase: 'results',
            imposter_eliminated: isImposterEliminated,
          })
          .eq('id', currentRound.id);

        return NextResponse.json({
          status: 'voting_complete',
          eliminatedUser: eliminatedUserId,
          wasImposter: isImposterEliminated,
        });
      }
    }

    return NextResponse.json({
      status: currentRound.phase,
      round: gameData.current_round,
    });
  } catch (error) {
    console.error('Error checking round:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
