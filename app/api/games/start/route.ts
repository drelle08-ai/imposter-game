import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface StartGameRequest {
  gameId: string;
  userId: string;
}

const KEYWORDS = [
  'BANANA',
  'OCEAN',
  'CASTLE',
  'DRAGON',
  'SHADOW',
  'WHISPER',
  'CRYSTAL',
  'THUNDER',
  'FOREST',
  'SUNSET',
  'MIRROR',
  'PUZZLE',
  'SPIRAL',
  'METEOR',
  'PHANTOM',
  'BEACON',
  'CIPHER',
  'ECLIPSE',
  'FORTUNE',
  'GLACIER',
];

function getRandomKeyword(): string {
  return KEYWORDS[Math.floor(Math.random() * KEYWORDS.length)];
}

export async function POST(request: NextRequest) {
  try {
    const body: StartGameRequest = await request.json();
    const { gameId, userId } = body;

    console.log('Starting game:', { gameId, userId });

    if (!gameId || !userId) {
      return NextResponse.json(
        { error: 'Missing gameId or userId' },
        { status: 400 }
      );
    }

    // Get all players in the game
    const { data: players, error: playersError } = await supabase
      .from('game_players')
      .select('id, user_id')
      .eq('game_id', gameId);

    console.log('Players query result:', { players, playersError });

    if (playersError || !players || players.length === 0) {
      return NextResponse.json(
        { error: `No players found: ${playersError?.message || 'empty list'}` },
        { status: 400 }
      );
    }

    // Randomly select one player as imposter
    const imposterIndex = Math.floor(Math.random() * players.length);
    const imposterPlayerId = players[imposterIndex].id;

    // Generate keyword for this round
    const keyword = getRandomKeyword();

    console.log('Assigning imposter:', { imposterPlayerId, keyword });

    // Create current round record
    const { data: round, error: roundError } = await supabase
      .from('game_rounds')
      .insert({
        game_id: gameId,
        round_number: 1,
        phase: 'role_reveal',
        keyword: keyword,
      })
      .select()
      .single();

    console.log('Round creation result:', { round, roundError });

    if (roundError) {
      return NextResponse.json(
        { error: `Failed to create round: ${roundError.message}` },
        { status: 500 }
      );
    }

    // Assign roles to all players
    const roleUpdates = players.map((player) => ({
      id: player.id,
      role: player.id === imposterPlayerId ? 'imposter' : 'crewmate',
      assigned_round_id: round.id,
    }));

    console.log('Updating player roles:', roleUpdates);

    const { error: updateError } = await supabase
      .from('game_players')
      .upsert(roleUpdates, { onConflict: 'id' });

    console.log('Role update result:', { updateError });

    if (updateError) {
      return NextResponse.json(
        { error: `Failed to assign roles: ${updateError.message}` },
        { status: 500 }
      );
    }

    // Update game status
    const { error: gameError } = await supabase
      .from('games')
      .update({
        status: 'in_progress',
        current_round: 1,
      })
      .eq('id', gameId);

    console.log('Game update result:', { gameError });

    if (gameError) {
      return NextResponse.json(
        { error: `Failed to update game status: ${gameError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      roundId: round.id,
      message: 'Game started, roles assigned',
    });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    console.error('Start game error:', errorMsg);
    return NextResponse.json(
      { error: `Server error: ${errorMsg}` },
      { status: 500 }
    );
  }
}
