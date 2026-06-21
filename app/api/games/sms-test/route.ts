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

    // Get all players in the game with their phone numbers and roles
    const { data: playersData } = await supabase
      .from('game_players')
      .select(
        `
        id,
        user_id,
        role,
        guest_name,
        guest_phone,
        users(phone_number, username)
      `
      )
      .eq('game_id', gameId);

    if (!playersData || playersData.length === 0) {
      return NextResponse.json({ error: 'No players found' }, { status: 404 });
    }

    const { data: gameData } = await supabase
      .from('games')
      .select('invite_code')
      .eq('id', gameId)
      .single();

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const gameCode = gameData?.invite_code;

    // Show what SMS would be sent (test mode)
    const smsPreview = playersData.map((player) => {
      const isGuest = (player as any).guest_phone && (player as any).guest_name;
      const phoneNumber = isGuest ? (player as any).guest_phone : (player.users as any)?.phone_number;
      const name = isGuest ? (player as any).guest_name : (player.users as any)?.username;
      const role = player.role;

      if (!phoneNumber) {
        return {
          name,
          status: 'skipped',
          reason: 'No phone number',
        };
      }

      const joinLink = `${baseUrl}/games/${gameCode}${isGuest ? '?guest=true&phone=' + encodeURIComponent(phoneNumber) : ''}`;
      const roleEmoji = role === 'imposter' ? '🔴 IMPOSTER' : '🔵 CREWMATE';

      return {
        name,
        phoneNumber,
        role,
        message: `🎮 Imposter Game Started!\n\nYour role: ${roleEmoji}\n\nJoin: ${joinLink}`,
      };
    });

    return NextResponse.json({
      gameId,
      gameCode,
      players: smsPreview,
      totalPlayers: playersData.length,
    });
  } catch (error) {
    console.error('Error in SMS test:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
