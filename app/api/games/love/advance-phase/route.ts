import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { scoreRound } from '@/lib/love-match-scoring';
import { getGameQuestions } from '@/lib/love-match-questions';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: NextRequest) {
  try {
    const { gameId, roundId } = await req.json();

    if (!gameId || !roundId) {
      return NextResponse.json(
        { error: 'Game ID and Round ID are required' },
        { status: 400 }
      );
    }

    // Get current round
    const { data: round, error: roundError } = await supabase
      .from('love_match_rounds')
      .select('*')
      .eq('id', roundId)
      .single();

    if (roundError || !round) {
      return NextResponse.json({ error: 'Round not found' }, { status: 404 });
    }

    // Get game details
    const { data: game, error: gameError } = await supabase
      .from('love_match_rooms')
      .select('*')
      .eq('id', gameId)
      .single();

    if (gameError || !game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    let nextPhase = 'question';
    let nextRoundNumber = round.round_number;
    let nextQuestion = '';
    let timerDuration = 10; // seconds

    // Determine next phase based on current phase
    if (round.phase === 'question') {
      // Question → Answer
      nextPhase = 'answer';
      timerDuration = 30;
    } else if (round.phase === 'answer') {
      // Answer → Reveal (score the round)
      nextPhase = 'reveal';
      timerDuration = 15;

      // Score all answers for this round
      const { data: answers } = await supabase
        .from('love_match_answers')
        .select('*')
        .eq('round_id', roundId);

      if (answers && answers.length > 0) {
        for (const answer of answers) {
          const result = scoreRound(
            answer.hot_seat_answer,
            answer.guesser_answer,
            false
          );

          // Update answer with scoring
          await supabase
            .from('love_match_answers')
            .update({
              match_type: result.type,
              points_awarded: result.points,
            })
            .eq('id', answer.id);

          // Record score for team
          await supabase.from('love_match_round_scores').insert({
            game_id: gameId,
            round_number: round.round_number,
            team_id: answer.team_id,
            round_points: result.points,
            bonus_points: 0,
            total_points: result.points,
          });
        }
      }
    } else if (round.phase === 'reveal') {
      // Reveal → Next Round Question (or End Game)
      if (round.round_number < game.max_rounds) {
        nextPhase = 'question';
        nextRoundNumber = round.round_number + 1;
        timerDuration = 10;

        // Get question for next round
        const { data: questions } = await supabase
          .from('love_match_game_questions')
          .select('question_text')
          .eq('game_id', gameId)
          .eq('round_number', nextRoundNumber)
          .single();

        nextQuestion = questions?.question_text || '';

        // Get teams to rotate hot seat
        const { data: teams } = await supabase
          .from('love_match_teams')
          .select('*')
          .eq('game_id', gameId);

        if (teams && teams.length > 0) {
          // Rotate who is hot seat (player2 becomes player1, etc)
          for (const team of teams) {
            await supabase
              .from('love_match_teams')
              .update({
                is_player1_hot_seat: !team.is_player1_hot_seat,
              })
              .eq('id', team.id);
          }

          // New hot seat is opposite of previous
          const firstTeam = teams[0];
          const newHotSeatPlayer = firstTeam.is_player1_hot_seat
            ? firstTeam.player2_id
            : firstTeam.player1_id;

          // Create next round
          const { data: nextRound } = await supabase
            .from('love_match_rounds')
            .insert({
              game_id: gameId,
              round_number: nextRoundNumber,
              question_text: nextQuestion,
              phase: nextPhase,
              hot_seat_player_id: newHotSeatPlayer,
              timer_end_at: new Date(Date.now() + timerDuration * 1000).toISOString(),
            })
            .select()
            .single();

          if (nextRound) {
            roundId = nextRound.id;
          }
        }
      } else {
        // Game ended - call end game API to save results
        nextPhase = 'ended';

        try {
          await fetch(
            new URL('/api/games/love/end', process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'),
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ gameId }),
            }
          );
        } catch (err) {
          console.error('[Love Match] Error calling end game API:', err);
          // Continue anyway - update room status
          await supabase
            .from('love_match_rooms')
            .update({ status: 'ended', ended_at: new Date().toISOString() })
            .eq('id', gameId);
        }
      }
    }

    // Update round
    const timerEndAt = new Date(Date.now() + timerDuration * 1000).toISOString();

    if (nextPhase !== 'ended') {
      await supabase
        .from('love_match_rounds')
        .update({
          phase: nextPhase,
          timer_end_at: timerEndAt,
        })
        .eq('id', roundId);

      // Update game
      await supabase
        .from('love_match_rooms')
        .update({
          current_phase: nextPhase,
          round_number: nextRoundNumber,
          timer_end_at: timerEndAt,
        })
        .eq('id', gameId);
    }

    console.log(
      `[Love Match] Advanced game ${gameId} to phase: ${nextPhase} (round ${nextRoundNumber})`
    );

    return NextResponse.json({
      success: true,
      round: {
        id: roundId,
        roundNumber: nextRoundNumber,
        phase: nextPhase,
        question: nextQuestion,
        timerEndAt,
      },
    });
  } catch (error) {
    console.error('[Love Match Advance Phase] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
