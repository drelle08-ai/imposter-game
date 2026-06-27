import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { scoreRound } from '@/lib/love-match-scoring';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: NextRequest) {
  try {
    const { roundId, teamId, hotSeatAnswer, guesserAnswer } = await req.json();

    if (!roundId || !teamId) {
      return NextResponse.json(
        { error: 'Round ID and Team ID are required' },
        { status: 400 }
      );
    }

    // Get round details
    const { data: round, error: roundError } = await supabase
      .from('love_match_rounds')
      .select('*')
      .eq('id', roundId)
      .single();

    if (roundError || !round) {
      return NextResponse.json({ error: 'Round not found' }, { status: 404 });
    }

    // Check if phase is 'answer'
    if (round.phase !== 'answer') {
      return NextResponse.json(
        { error: 'Not in answer phase' },
        { status: 400 }
      );
    }

    // Check if answers already submitted
    const { data: existingAnswers } = await supabase
      .from('love_match_answers')
      .select('id')
      .eq('round_id', roundId)
      .eq('team_id', teamId)
      .single();

    if (existingAnswers) {
      return NextResponse.json(
        { error: 'Answers already submitted for this round' },
        { status: 400 }
      );
    }

    // Store answers (scoring happens at reveal)
    const { data: answers, error: answerError } = await supabase
      .from('love_match_answers')
      .insert({
        round_id: roundId,
        team_id: teamId,
        hot_seat_answer: hotSeatAnswer || '',
        guesser_answer: guesserAnswer || '',
        match_type: 'miss', // Set to 'miss' by default, will be updated on reveal
        points_awarded: 0,
      })
      .select()
      .single();

    if (answerError || !answers) {
      console.error('[Love Match Answer] Error storing answers:', answerError);
      return NextResponse.json(
        { error: 'Failed to submit answers: ' + answerError?.message },
        { status: 500 }
      );
    }

    console.log(`[Love Match] Answers submitted for round ${round.round_number}, team ${teamId}`);

    return NextResponse.json({
      success: true,
      answers: {
        id: answers.id,
        roundId: answers.round_id,
        teamId: answers.team_id,
      },
    });
  } catch (error) {
    console.error('[Love Match Answer] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
