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

      // Create array of roles to distribute
      const roles: string[] = [];
      for (let i = 0; i < mafiaCount; i++) {
        roles.push('mafia');
      }
      roles.push('doctor');
      roles.push('sheriff');
      while (roles.length < playerCount) {
        roles.push('civilian');
      }

      // Fisher-Yates shuffle for truly random assignment
      for (let i = roles.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [roles[i], roles[j]] = [roles[j], roles[i]];
      }

      // Assign shuffled roles to players
      updatePromises = playersData.map((player, index) => {
        return supabase.from('game_players').update({ role: roles[index] }).eq('id', player.id);
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

    return NextResponse.json({
      success: true,
      message: 'Game started successfully - roles have been assigned to all players',
    });
  } catch (error) {
    console.error('Error starting game:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
