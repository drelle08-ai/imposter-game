import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID || '';
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN || '';
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER || '';

async function sendSmsViaTwilio(toNumber: string, message: string): Promise<{ success: boolean; sid?: string; error?: string }> {
  if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
    return { success: false, error: 'Twilio credentials not configured' };
  }

  try {
    const auth = Buffer.from(`${twilioAccountSid}:${twilioAuthToken}`).toString('base64');

    // Format phone number: ensure it has +1 country code
    const formattedNumber = toNumber.startsWith('+') ? toNumber : `+1${toNumber}`;

    const formData = new URLSearchParams();
    formData.append('From', twilioPhoneNumber);
    formData.append('To', formattedNumber);
    formData.append('Body', message);

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      }
    );

    const data = await response.json();

    if (response.ok && (data as any).sid) {
      console.log(`[SMS] Sent to ${toNumber}: ${(data as any).sid}`);
      return { success: true, sid: (data as any).sid };
    } else {
      console.error(`[SMS] Failed to send to ${toNumber}:`, data);
      return { success: false, error: (data as any).message || 'Unknown error' };
    }
  } catch (error) {
    console.error(`[SMS] Error sending to ${toNumber}:`, error);
    return { success: false, error: String(error) };
  }
}

export async function POST(req: NextRequest) {
  try {
    const { gameId } = await req.json();

    if (!gameId) {
      return NextResponse.json({ error: 'Game ID is required' }, { status: 400 });
    }

    const { data: playersData, error: playersError } = await supabase
      .from('game_players')
      .select(`id, user_id, role, guest_name, guest_phone, users(phone_number, username)`)
      .eq('game_id', gameId);

    if (playersError) {
      return NextResponse.json({ error: 'Failed to fetch players' }, { status: 500 });
    }

    if (!playersData || playersData.length === 0) {
      return NextResponse.json({ error: 'No players found' }, { status: 404 });
    }

    const { data: gameData } = await supabase
      .from('games')
      .select('invite_code')
      .eq('id', gameId)
      .single();

    const gameCode = gameData?.invite_code;
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

      // Send SMS via Twilio
      const smsResult = await sendSmsViaTwilio(phoneNumber, messageBody);

      smsResults.push({
        playerId: player.id,
        name,
        role,
        phoneNumber,
        status: smsResult.success ? 'sent' : 'failed',
        message: messageBody,
        sid: smsResult.sid,
        error: smsResult.error,
      });
    }

    const sentCount = smsResults.filter((r) => r.status === 'sent').length;
    console.log(`[SMS] Sent ${sentCount}/${smsResults.length} SMS messages`);

    return NextResponse.json({
      status: 'complete',
      mode: 'twilio',
      smsResults,
      totalGenerated: smsResults.length,
      totalSent: sentCount,
    });
  } catch (error) {
    console.error('[SMS] Error:', error);
    return NextResponse.json(
      { error: 'Failed to process SMS', details: String(error) },
      { status: 500 }
    );
  }
}
