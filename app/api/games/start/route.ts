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

    const { data: gameData, error: gameError } = await supabase
      .from('games')
      .select('*')
      .eq('id', gameId)
      .single();

    if (gameError || !gameData) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    const { data: playersData, error: playersError } = await supabase
      .from('game_players')
      .select('*')
      .eq('game_id', gameId);

    if (playersError || !playersData) {
      return NextResponse.json({ error: 'Failed to fetch players' }, { status: 500 });
    }

    // Randomly assign imposter
    const randomIndex = Math.floor(Math.random() * playersData.length);
    const imposterUserId = playersData[randomIndex].user_id;

    // Update roles
    const updatePromises = playersData.map((player) => {
      const role = player.user_id === imposterUserId ? 'imposter' : 'crewmate';
      return supabase.from('game_players').update({ role }).eq('id', player.id);
    });

    await Promise.all(updatePromises);

    // Create first round
    await supabase.from('game_rounds').insert({
      game_id: gameId,
      round_number: 1,
      phase: 'discussion',
      imposter_eliminated: false,
      crewmates_won: false,
    });

    // Get user phone numbers for SMS
    const { data: usersData } = await supabase
      .from('users')
      .select('id, phone_number')
      .in(
        'id',
        playersData.map((p) => p.user_id)
      );

    // Send SMS notifications (Twilio integration would go here)
    if (usersData) {
      for (const user of usersData) {
        const player = playersData.find((p) => p.user_id === user.id);
        if (player) {
          const role = player.user_id === imposterUserId ? 'Imposter' : 'Crewmate';
          console.log(`Sending SMS to ${user.phone_number}: Your role is ${role}`);
          // TODO: Implement actual Twilio SMS sending
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Game started successfully',
    });
  } catch (error) {
    console.error('Error starting game:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
