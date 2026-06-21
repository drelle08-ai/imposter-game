import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const twilio = require('twilio');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// Log Twilio config on startup
console.log('Twilio Config:', {
  hasAccountSid: !!accountSid,
  hasAuthToken: !!authToken,
  hasPhoneNumber: !!twilioPhoneNumber,
  phoneNumber: twilioPhoneNumber,
});

let client: any = null;
if (accountSid && authToken) {
  client = twilio(accountSid, authToken);
  console.log('Twilio client initialized successfully');
} else {
  console.warn('Twilio credentials missing, SMS will not work');
}

export async function POST(req: NextRequest) {
  try {
    const { gameId } = await req.json();

    if (!gameId) {
      return NextResponse.json({ error: 'Game ID is required' }, { status: 400 });
    }

    if (!accountSid || !authToken || !twilioPhoneNumber) {
      console.error('Twilio credentials missing:', {
        accountSid: !!accountSid,
        authToken: !!authToken,
        twilioPhoneNumber: !!twilioPhoneNumber,
      });
      return NextResponse.json(
        {
          error: 'Twilio credentials not configured',
          details: {
            hasAccountSid: !!accountSid,
            hasAuthToken: !!authToken,
            hasPhoneNumber: !!twilioPhoneNumber,
          }
        },
        { status: 500 }
      );
    }

    if (!client) {
      return NextResponse.json(
        { error: 'Twilio client not initialized' },
        { status: 500 }
      );
    }

    // Get all players in the game with their phone numbers and roles
    const { data: playersData } = await supabase
      .from('game_players')
      .select(
        `
        id,
        user_id,
        role,
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

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const gameCode = gameData?.invite_code;

    // Send SMS to each player
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

        console.log(`Sending SMS to ${phoneNumber}:`, messageBody);

        const message = await client.messages.create({
          body: messageBody,
          from: twilioPhoneNumber,
          to: phoneNumber,
        });

        console.log(`SMS sent successfully to ${phoneNumber}. SID: ${message.sid}`);

        smsResults.push({
          playerId: player.id,
          name,
          role,
          status: 'sent',
          messageSid: message.sid,
          phoneNumber,
        });
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error(`Failed to send SMS to ${phoneNumber}:`, errorMsg);

        smsResults.push({
          playerId: player.id,
          name,
          status: 'failed',
          error: errorMsg,
          phoneNumber,
        });
      }
    }

    return NextResponse.json({
      status: 'complete',
      results: smsResults,
      totalSent: smsResults.filter((r) => r.status === 'sent').length,
      totalFailed: smsResults.filter((r) => r.status === 'failed').length,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : '';
    console.error('Error in SMS endpoint:', {
      message: errorMessage,
      stack: errorStack,
      error,
    });
    return NextResponse.json(
      {
        error: 'Failed to send SMS notifications',
        details: errorMessage,
        stack: errorStack,
      },
      { status: 500 }
    );
  }
}
