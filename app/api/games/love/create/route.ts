import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Generate a random 6-character room code (e.g., LOVE42)
 */
function generateRoomCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function POST(req: NextRequest) {
  try {
    const { userId, maxRounds = 10, maxCouples = 8 } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Generate unique room code
    let roomCode = generateRoomCode();
    let codeExists = true;
    let attempts = 0;

    // Ensure unique code (max 10 attempts)
    while (codeExists && attempts < 10) {
      const { data: existing } = await supabase
        .from('love_match_rooms')
        .select('id')
        .eq('room_code', roomCode)
        .single();

      if (!existing) {
        codeExists = false;
      } else {
        roomCode = generateRoomCode();
        attempts++;
      }
    }

    if (codeExists) {
      return NextResponse.json(
        { error: 'Failed to generate unique room code' },
        { status: 500 }
      );
    }

    // Create room
    const { data: room, error: roomError } = await supabase
      .from('love_match_rooms')
      .insert({
        host_id: userId,
        room_code: roomCode,
        status: 'lobby',
        round_number: 0,
        current_phase: 'lobby',
        max_rounds: maxRounds,
        max_couples: maxCouples,
      })
      .select()
      .single();

    if (roomError || !room) {
      console.error('[Love Match Create] Error creating room:', roomError);
      return NextResponse.json(
        { error: 'Failed to create room: ' + roomError?.message },
        { status: 500 }
      );
    }

    console.log(`[Love Match] Room created: ${roomCode} by user ${userId}`);

    return NextResponse.json({
      success: true,
      room: {
        id: room.id,
        roomCode: room.room_code,
        hostId: room.host_id,
        status: room.status,
        maxRounds: room.max_rounds,
        maxCouples: room.max_couples,
      },
    });
  } catch (error) {
    console.error('[Love Match Create] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
