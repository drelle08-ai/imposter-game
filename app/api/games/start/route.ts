import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getRandomKeyword } from '@/lib/keywords';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: NextRequest) {
  try {
    const { gameId, maxRounds, gameType = 'imposter' } = await req.json();

    if (!gameId) {
      return NextResponse.json({ error: 'Game ID is required' }, { status: 400 });
    }

    // Update game with max_rounds
    const roundsToSet = maxRounds || (gameType === 'mafia' ? 5 : 3);
    console.log(`[Game Start] Setting max_rounds to ${roundsToSet} for ${gameType} game`);

    const { error: updateError } = await supabase
      .from('games')
      .update({ max_rounds: roundsToSet })
      .eq('id', gameId);

    if (updateError) {
      console.error('[Game Start] Error updating max_rounds:', updateError);
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

    // Assign roles based on game type
    let updatePromises;

    if (gameType === 'mafia') {
      // Mafia role assignment: 1 mafia per 4 players, 1 doctor, 1 sheriff, rest civilian
      const playerCount = playersData.length;
      const mafiaCount = Math.max(1, Math.floor(playerCount / 4));

      // Shuffle players to randomly assign roles
      const shuffled = [...playersData].sort(() => Math.random() - 0.5);

      updatePromises = shuffled.map((player, index) => {
        let role = 'civilian';
        if (index < mafiaCount) {
          role = 'mafia';
        } else if (index === mafiaCount) {
          role = 'doctor';
        } else if (index === mafiaCount + 1) {
          role = 'sheriff';
        }

        return supabase.from('game_players').update({ role }).eq('id', player.id);
      });

      // Create first round (night phase for mafia)
      const { error: roundError } = await supabase.from('game_rounds').insert({
        game_id: gameId,
        round_number: 1,
        phase: 'night',
        imposter_eliminated: false,
        crewmates_won: false,
      });

      if (roundError) {
        console.error('[Game Start] Error creating round:', roundError);
        return NextResponse.json({ error: 'Failed to create round: ' + roundError.message }, { status: 500 });
      }

      console.log(`[Game Start] Mafia game initialized: ${mafiaCount} mafia, 1 doctor, 1 sheriff, ${playerCount - mafiaCount - 2} civilians`);
    } else {
      // Imposter role assignment
      const randomIndex = Math.floor(Math.random() * playersData.length);
      const imposterPlayerId = playersData[randomIndex].id;

      updatePromises = playersData.map((player) => {
        const role = player.id === imposterPlayerId ? 'imposter' : 'crewmate';
        return supabase.from('game_players').update({ role }).eq('id', player.id);
      });

      // Create first round with keyword
      const keyword = getRandomKeyword();
      console.log(`[Game Start] Creating Imposter round with keyword: ${keyword}`);

      const { error: roundError } = await supabase.from('game_rounds').insert({
        game_id: gameId,
        round_number: 1,
        phase: 'discussion',
        imposter_eliminated: false,
        crewmates_won: false,
        keyword: keyword,
      });

      if (roundError) {
        console.error('[Game Start] Error creating round:', roundError);
        return NextResponse.json({ error: 'Failed to create round: ' + roundError.message }, { status: 500 });
      }

      console.log('[Game Start] Imposter round created successfully with keyword:', keyword);
    }

    await Promise.all(updatePromises);

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
