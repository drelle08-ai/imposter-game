import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getGameQuestions } from '@/lib/love-match-questions';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: NextRequest) {
  try {
    const { gameId, action, data } = await req.json();

    if (!gameId || !action) {
      return NextResponse.json(
        { error: 'Game ID and action are required' },
        { status: 400 }
      );
    }

    // Verify host privileges
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: room } = await supabase
      .from('love_match_rooms')
      .select('*')
      .eq('id', gameId)
      .single();

    if (!room || room.host_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Not authorized to perform this action' },
        { status: 403 }
      );
    }

    // Get current round
    const { data: currentRound } = await supabase
      .from('love_match_rounds')
      .select('*')
      .eq('game_id', gameId)
      .order('round_number', { ascending: false })
      .limit(1)
      .single();

    if (!currentRound) {
      return NextResponse.json({ error: 'Round not found' }, { status: 404 });
    }

    let result: any = { success: true };

    // Handle different host actions
    switch (action) {
      case 'skip_question': {
        // Get next question
        const questions = getGameQuestions(room.max_rounds);
        const nextQuestion = questions[(currentRound.round_number - 1 + 1) % room.max_rounds] || questions[0];

        await supabase
          .from('love_match_rounds')
          .update({ question_text: nextQuestion })
          .eq('id', currentRound.id);

        result.question = nextQuestion;
        break;
      }

      case 'extend_timer': {
        const extendSeconds = data?.seconds || 10;
        const newTimerEnd = new Date(
          new Date(currentRound.timer_end_at).getTime() + extendSeconds * 1000
        ).toISOString();

        await supabase
          .from('love_match_rounds')
          .update({ timer_end_at: newTimerEnd })
          .eq('id', currentRound.id);

        await supabase
          .from('love_match_rooms')
          .update({ timer_end_at: newTimerEnd })
          .eq('id', gameId);

        result.newTimerEnd = newTimerEnd;
        result.extendedSeconds = extendSeconds;
        break;
      }

      case 'judge_close_match': {
        const { answerId, isApproved } = data;

        if (!answerId) {
          return NextResponse.json(
            { error: 'Answer ID required for judging' },
            { status: 400 }
          );
        }

        const newMatchType = isApproved ? 'close' : 'miss';
        const newPoints = isApproved ? 1 : 0;

        await supabase
          .from('love_match_answers')
          .update({
            match_type: newMatchType,
            points_awarded: newPoints,
          })
          .eq('id', answerId);

        result.answerId = answerId;
        result.approved = isApproved;
        result.matchType = newMatchType;
        result.points = newPoints;
        break;
      }

      case 'unlock_spicy': {
        // In a future update, this could unlock spicy questions
        // For now, just log the action

        await supabase
          .from('love_match_host_actions')
          .insert({
            game_id: gameId,
            round_number: currentRound.round_number,
            action_type: 'unlock_spicy',
            action_data: { timestamp: new Date().toISOString() },
          });

        result.message = 'Spicy round unlocked!';
        break;
      }

      default:
        return NextResponse.json(
          { error: 'Unknown action: ' + action },
          { status: 400 }
        );
    }

    // Log the host action
    await supabase.from('love_match_host_actions').insert({
      game_id: gameId,
      round_number: currentRound.round_number,
      action_type: action,
      action_data: data || {},
    });

    console.log(`[Love Match] Host action: ${action} on game ${gameId}`);

    return NextResponse.json(result);
  } catch (error) {
    console.error('[Love Match Host Action] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
