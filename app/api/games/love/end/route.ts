import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { calculateCompatibilityScore } from '@/lib/love-match-scoring';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: NextRequest) {
  try {
    const { gameId } = await req.json();

    if (!gameId) {
      return NextResponse.json({ error: 'Game ID is required' }, { status: 400 });
    }

    // Get game
    const { data: game, error: gameError } = await supabase
      .from('love_match_rooms')
      .select('*')
      .eq('id', gameId)
      .single();

    if (gameError || !game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    // Get all teams
    const { data: teams } = await supabase
      .from('love_match_teams')
      .select('*')
      .eq('game_id', gameId);

    if (!teams) {
      return NextResponse.json({ error: 'No teams found' }, { status: 404 });
    }

    // Calculate final results for each team
    const results = [];

    for (const team of teams) {
      // Get all answers for this team
      const { data: answers } = await supabase
        .from('love_match_answers')
        .select('*')
        .eq('team_id', team.id);

      const exactMatches = (answers || []).filter((a) => a.match_type === 'exact').length;
      const closeMatches = (answers || []).filter((a) => a.match_type === 'close').length;
      const missedMatches = (answers || []).filter((a) => a.match_type === 'miss').length;

      const finalPoints = (answers || []).reduce((sum, a) => sum + a.points_awarded, 0);

      const compatibilityScore = calculateCompatibilityScore(
        exactMatches,
        closeMatches,
        missedMatches,
        answers?.length || 0
      );

      results.push({
        team_id: team.id,
        game_id: gameId,
        final_points: finalPoints,
        exact_matches: exactMatches,
        close_matches: closeMatches,
        missed_matches: missedMatches,
        compatibility_score: compatibilityScore,
      });
    }

    // Sort by points to get placements
    const sorted = results.sort((a, b) => b.final_points - a.final_points);

    // Insert results with placements
    const resultsWithPlacements = sorted.map((result, idx) => ({
      ...result,
      placement: idx + 1,
    }));

    const { error: insertError } = await supabase
      .from('love_match_game_results')
      .insert(resultsWithPlacements);

    if (insertError) {
      console.error('[Love Match End] Error inserting results:', insertError);
      return NextResponse.json(
        { error: 'Failed to save results: ' + insertError.message },
        { status: 500 }
      );
    }

    // Update game status to ended
    const { error: updateError } = await supabase
      .from('love_match_rooms')
      .update({
        status: 'ended',
        ended_at: new Date().toISOString(),
      })
      .eq('id', gameId);

    if (updateError) {
      console.error('[Love Match End] Error updating game:', updateError);
      return NextResponse.json(
        { error: 'Failed to update game: ' + updateError.message },
        { status: 500 }
      );
    }

    console.log(`[Love Match] Game ${gameId} ended with results saved`);

    return NextResponse.json({
      success: true,
      results: resultsWithPlacements,
    });
  } catch (error) {
    console.error('[Love Match End] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
