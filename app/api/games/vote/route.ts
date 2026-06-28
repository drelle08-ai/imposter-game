import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface VoteRequest {
  gameId: string;
  roundId: string;
  voterId: string;
  votedForId: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: VoteRequest = await request.json();
    const { gameId, roundId, voterId, votedForId } = body;

    if (!gameId || !roundId || !voterId || !votedForId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Record the vote
    const { data, error } = await supabase
      .from('game_votes')
      .insert({
        game_id: gameId,
        round_id: roundId,
        voter_id: voterId,
        voted_for_id: votedForId,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, vote: data });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Get vote count for current round
export async function GET(request: NextRequest) {
  try {
    const roundId = request.nextUrl.searchParams.get('roundId');
    const gameId = request.nextUrl.searchParams.get('gameId');

    if (!roundId || !gameId) {
      return NextResponse.json(
        { error: 'Missing roundId or gameId' },
        { status: 400 }
      );
    }

    // Get all votes for this round
    const { data: votes, error } = await supabase
      .from('game_votes')
      .select('voted_for_id, voter_id')
      .eq('round_id', roundId)
      .eq('game_id', gameId);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Count votes by voted_for_id
    const voteCounts: Record<string, number> = {};
    votes?.forEach((vote) => {
      voteCounts[vote.voted_for_id] = (voteCounts[vote.voted_for_id] || 0) + 1;
    });

    return NextResponse.json({
      roundId,
      gameId,
      votes: voteCounts,
      totalVotes: votes?.length || 0,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
