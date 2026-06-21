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
    const imposterPlayerId = playersData[randomIndex].id;

    // Update roles
    const updatePromises = playersData.map((player) => {
      const role = player.id === imposterPlayerId ? 'imposter' : 'crewmate';
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

    // Send SMS notifications to all players
    let smsResults = null;
    try {
      const smsResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/sms/send-roles`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ gameId }),
        }
      );

      if (!smsResponse.ok) {
        const errorText = await smsResponse.text();
        console.warn('Failed to send SMS notifications:', errorText);
      } else {
        smsResults = await smsResponse.json();
        console.log('SMS Results:', smsResults);
      }
    } catch (smsError) {
      console.warn('Error calling SMS endpoint:', smsError);
    }

    return NextResponse.json({
      success: true,
      message: 'Game started successfully',
      smsResults,
    });
  } catch (error) {
    console.error('Error starting game:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
