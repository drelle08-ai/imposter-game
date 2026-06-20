import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const twilio = require('twilio');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

export async function POST(req: NextRequest) {
  try {
    const { gameId } = await req.json();

    if (!gameId) {
      return NextResponse.json({ error: 'Game ID is required' }, { status: 400 });
    }

    if (!accountSid || !authToken || !twilioPhoneNumber) {
      return NextResponse.json(
        { error: 'Twilio credentials not configured' },
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

    // Send SMS to each player
    const smsResults = [];

    for (const player of playersData) {
      const phoneNumber = (player.users as any)?.phone_number;
      const username = (player.users as any)?.username;
      const role = player.role;

      if (!phoneNumber) {
        smsResults.push({
          userId: player.user_id,
          status: 'skipped',
          reason: 'No phone number',
        });
        continue;
      }

      try {
        const message = await client.messages.create({
          body: `🎮 Imposter Game Started!\n\nYour role: ${role === 'imposter' ? '🔴 IMPOSTER' : '🔵 CREWMATE'}\n\nGood luck!`,
          from: twilioPhoneNumber,
          to: phoneNumber,
        });

        smsResults.push({
          userId: player.user_id,
          username,
          role,
          status: 'sent',
          messageSid: message.sid,
        });
      } catch (error) {
        smsResults.push({
          userId: player.user_id,
          username,
          status: 'failed',
          error: String(error),
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
    console.error('Error sending SMS:', error);
    return NextResponse.json(
      { error: 'Failed to send SMS notifications', details: String(error) },
      { status: 500 }
    );
  }
}
