import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: NextRequest) {
  try {
    const { gameId, roundId, playerId, targetId, actionType } = await req.json();

    if (!gameId || !roundId || !playerId || !targetId || !actionType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Update game_round with the action
    const updateData: Record<string, string> = {};

    switch (actionType) {
      case 'kill':
        updateData.mafia_killed_player = targetId;
        break;
      case 'save':
        updateData.doctor_saved_player = targetId;
        break;
      case 'investigate':
        updateData.sheriff_investigated_player = targetId;
        // For now, investigation result is determined when advancing to day phase
        break;
      default:
        return NextResponse.json({ error: 'Invalid action type' }, { status: 400 });
    }

    const { error } = await supabase
      .from('game_rounds')
      .update(updateData)
      .eq('id', roundId);

    if (error) {
      console.error('[Night Action] Error updating round:', error);
      return NextResponse.json({ error: 'Failed to submit action' }, { status: 500 });
    }

    console.log(`[Night Action] ${actionType} submitted for player ${playerId} targeting ${targetId}`);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[Night Action] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
