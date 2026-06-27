import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: NextRequest) {
  try {
    const { roomCode, player1Id, player1Name, player2Id, player2Name, teamName } = await req.json();

    if (!roomCode || !player1Id || !player1Name) {
      return NextResponse.json(
        { error: 'Room code, player1Id, and player1Name are required' },
        { status: 400 }
      );
    }

    // Find room
    const { data: room, error: roomError } = await supabase
      .from('love_match_rooms')
      .select('*')
      .eq('room_code', roomCode.toUpperCase())
      .single();

    if (roomError || !room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    // Check room is in lobby status
    if (room.status !== 'lobby') {
      return NextResponse.json(
        { error: 'Game has already started' },
        { status: 400 }
      );
    }

    // Check max couples not reached
    const { data: existingTeams, error: countError } = await supabase
      .from('love_match_teams')
      .select('id')
      .eq('game_id', room.id);

    if (countError) {
      return NextResponse.json(
        { error: 'Failed to check team count' },
        { status: 500 }
      );
    }

    if ((existingTeams?.length || 0) >= room.max_couples) {
      return NextResponse.json(
        { error: `Room is full (${room.max_couples} couples max)` },
        { status: 400 }
      );
    }

    // Create team
    const finalTeamName = teamName || `${player1Name} & ${player2Name || 'Partner'}`;

    const { data: team, error: teamError } = await supabase
      .from('love_match_teams')
      .insert({
        game_id: room.id,
        team_name: finalTeamName,
        player1_id: player1Id,
        player2_id: player2Id || null,
        is_player1_hot_seat: true,
        total_points: 0,
      })
      .select()
      .single();

    if (teamError || !team) {
      console.error('[Love Match Join] Error creating team:', teamError);
      return NextResponse.json(
        { error: 'Failed to join room: ' + teamError?.message },
        { status: 500 }
      );
    }

    console.log(`[Love Match] Team "${finalTeamName}" joined room ${roomCode}`);

    return NextResponse.json({
      success: true,
      team: {
        id: team.id,
        gameId: team.game_id,
        teamName: team.team_name,
        player1Id: team.player1_id,
        player2Id: team.player2_id,
        isPlayer1HotSeat: team.is_player1_hot_seat,
      },
      room: {
        roomCode: room.room_code,
        status: room.status,
        maxRounds: room.max_rounds,
        maxCouples: room.max_couples,
      },
    });
  } catch (error) {
    console.error('[Love Match Join] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
