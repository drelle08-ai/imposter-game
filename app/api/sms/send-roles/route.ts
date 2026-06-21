import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Lazy load Twilio to avoid module loading issues
let twilioClient: any = null;

function getTwilioClient() {
  if (!twilioClient) {
    try {
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;

      if (!accountSid || !authToken) {
        console.warn('Twilio credentials not configured');
        return null;
      }

      // Dynamically import Twilio
      const twilio = require('twilio');
      twilioClient = twilio(accountSid, authToken);
      console.log('Twilio client initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Twilio:', error);
      return null;
    }
  }
  return twilioClient;
}

export async function POST(req: NextRequest) {
  try {
    const { gameId } = await req.json();

    if (!gameId) {
      return NextResponse.json({ error: 'Game ID is required' }, { status: 400 });
    }

    // Get all players in the game with their phone numbers and roles
    const { data: playersData, error: playersError } = await supabase
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

    if (playersError) {
      console.error('Error fetching players:', playersError);
      return NextResponse.json({ error: 'Failed to fetch players' }, { status: 500 });
    }

    if (!playersData || playersData.length === 0) {
      return NextResponse.json({ error: 'No players found' }, { status: 404 });
    }

    // Get game code for join link
    const { data: gameData, error: gameError } = await supabase
      .from('games')
      .select('invite_code')
      .eq('id', gameId)
      .single();

    if (gameError) {
      console.error('Error fetching game:', gameError);
      return NextResponse.json({ error: 'Failed to fetch game' }, { status: 500 });
    }

    const gameCode = gameData?.invite_code;
    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
    const client = getTwilioClient();

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

      try {
        const joinLink = `${baseUrl}/games/${gameCode}${isGuest ? '?guest=true&phone=' + encodeURIComponent(phoneNumber) : ''}`;
        const roleEmoji = role === 'imposter' ? '🔴 IMPOSTER' : '🔵 CREWMATE';
        const messageBody = `🎮 Imposter Game Started!\n\nYour role: ${roleEmoji}\n\nJoin: ${joinLink}`;

        console.log(`[SMS] Attempting to send to ${phoneNumber}`);

        if (client && twilioPhoneNumber) {
          const message = await client.messages.create({
            body: messageBody,
            from: twilioPhoneNumber,
            to: phoneNumber,
          });

          console.log(`[SMS] Sent successfully to ${phoneNumber}. SID: ${message.sid}`);

          smsResults.push({
            playerId: player.id,
            name,
            role,
            phoneNumber,
            status: 'sent',
            messageSid: message.sid,
          });
        } else {
          console.log(`[SMS] Test mode - would send to ${phoneNumber}`);

          smsResults.push({
            playerId: player.id,
            name,
            role,
            phoneNumber,
            status: 'test_mode',
            message: messageBody,
          });
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error(`[SMS] Failed to send to ${phoneNumber}:`, errorMsg);

        smsResults.push({
          playerId: player.id,
          name,
          phoneNumber,
          status: 'failed',
          error: errorMsg,
        });
      }
    }

    const sentCount = smsResults.filter((r) => r.status === 'sent').length;
    const failedCount = smsResults.filter((r) => r.status === 'failed').length;
    const testModeCount = smsResults.filter((r) => r.status === 'test_mode').length;

    console.log(`[SMS] Summary: ${sentCount} sent, ${failedCount} failed, ${testModeCount} test mode`);

    return NextResponse.json({
      status: 'complete',
      results: smsResults,
      summary: {
        total: smsResults.length,
        sent: sentCount,
        failed: failedCount,
        testMode: testModeCount,
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : '';
    console.error('[SMS] Endpoint error:', { message: errorMessage, stack: errorStack });

    return NextResponse.json(
      {
        error: 'Failed to process SMS',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
