import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

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

    // Get game code for join link
    const { data: gameData } = await supabase
      .from('games')
      .select('invite_code')
      .eq('id', gameId)
      .single();

    const gameCode = gameData?.invite_code;

    // Generate SMS messages for each player (test mode - not actually sending)
    const smsResults = [];

    for (const player of playersData) {
      const isGuest = (player as any).guest_phone && (player as any).guest_name;
      const phoneNumber = isGuest ? (player as any).guest_phone : (player.users as any)?.phone_number;
      const name = isGuest ? (player as any).guest_name : (player.users as any)?.username;
      const role = player.role;

      if (!phoneNumber) {
        smsResults.push({
          playerId: player.id,
          name,
          status: 'skipped',
          reason: 'No phone number',
        });
        continue;
      }

      const joinLink = `${baseUrl}/games/${gameCode}${isGuest ? '?guest=true&phone=' + encodeURIComponent(phoneNumber) : ''}`;
      const roleEmoji = role === 'imposter' ? '🔴 IMPOSTER' : '🔵 CREWMATE';
      const messageBody = `🎮 Imposter Game Started!\n\nYour role: ${roleEmoji}\n\nJoin: ${joinLink}`;

      console.log(`[SMS TEST MODE] Would send to ${phoneNumber}:`, messageBody);

      smsResults.push({
        playerId: player.id,
        name,
        role,
        phoneNumber,
        status: 'test_mode',
        message: messageBody,
      });
    }

    console.log(`[SMS] Generated ${smsResults.length} messages (test mode)`);

    return NextResponse.json({
      status: 'complete',
      mode: 'test',
      message: 'SMS in test mode - messages shown below but not actually sent',
      results: smsResults,
      totalGenerated: smsResults.length,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : '';
    console.error('Error in SMS endpoint:', { message: errorMessage, stack: errorStack });

    return NextResponse.json(
      {
        error: 'Failed to process SMS',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
