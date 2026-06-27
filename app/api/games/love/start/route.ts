import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getGameQuestions } from '@/lib/love-match-questions';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: NextRequest) {
  try {
    const { gameId, maxRounds = 10 } = await req.json();

    if (!gameId) {
      return NextResponse.json({ error: 'Game ID is required' }, { status: 400 });
    }

    // Update room status to in_progress
    const { error: updateError } = await supabase
      .from('love_match_rooms')
      .update({
        status: 'in_progress',
        round_number: 1,
        current_phase: 'question',
        started_at: new Date().toISOString(),
      })
      .eq('id', gameId);

    if (updateError) {
      console.error('[Love Match Start] Error updating room:', updateError);
      return NextResponse.json(
        { error: 'Failed to start game: ' + updateError.message },
        { status: 500 }
      );
    }

    // Get all teams
    const { data: teams, error: teamsError } = await supabase
      .from('love_match_teams')
      .select('*')
      .eq('game_id', gameId);

    if (teamsError || !teams || teams.length < 2) {
      return NextResponse.json(
        { error: 'Need at least 2 couples to start game' },
        { status: 400 }
      );
    }

    // Get questions for the game
    const questions = getGameQuestions(maxRounds);

    // Create first round with first question
    const { data: round, error: roundError } = await supabase
      .from('love_match_rounds')
      .insert({
        game_id: gameId,
        round_number: 1,
        question_text: questions[0],
        phase: 'question',
        hot_seat_player_id: (teams[0] as any).player1_id,
        timer_end_at: new Date(Date.now() + 10 * 1000).toISOString(), // 10 seconds
      })
      .select()
      .single();

    if (roundError || !round) {
      console.error('[Love Match Start] Error creating round:', roundError);
      return NextResponse.json(
        { error: 'Failed to create round: ' + roundError?.message },
        { status: 500 }
      );
    }

    // Store all questions for the game
    const { error: questionsError } = await supabase
      .from('love_match_game_questions')
      .insert(
        questions.map((q, idx) => ({
          game_id: gameId,
          round_number: idx + 1,
          question_text: q,
        }))
      );

    if (questionsError) {
      console.error('[Love Match Start] Error storing questions:', questionsError);
      // Continue anyway - questions are in memory
    }

    console.log(`[Love Match] Game ${gameId} started with ${teams.length} teams`);

    return NextResponse.json({
      success: true,
      game: {
        gameId,
        status: 'in_progress',
        roundNumber: 1,
        currentPhase: 'question',
        totalTeams: teams.length,
        maxRounds,
      },
      round: {
        id: round.id,
        roundNumber: round.round_number,
        question: round.question_text,
        phase: round.phase,
        timerEndAt: round.timer_end_at,
      },
    });
  } catch (error) {
    console.error('[Love Match Start] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
