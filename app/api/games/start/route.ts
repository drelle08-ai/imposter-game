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

    // Get all players - order by joined_at to get latest records first
    let { data: allPlayers, error: playersError } = await supabase
      .from('game_players')
      .select('id, user_id, joined_at')
      .eq('game_id', gameId)
      .order('joined_at', { ascending: false });

    console.log('All players query result:', { playersCount: allPlayers?.length, playersError });

    if (playersError || !allPlayers || allPlayers.length === 0) {
      console.error('Players error:', playersError?.message);
      return NextResponse.json(
        { error: `No players found: ${playersError?.message || 'empty list'}` },
        { status: 400 }
      );
    }

    // Deduplicate: keep only the LATEST record per user
    const seenUsers = new Map<string, string>(); // user_id -> record id to keep
    const players = [];
    const recordsToDelete = [];

    for (const player of allPlayers) {
      if (seenUsers.has(player.user_id)) {
        // Already have a record for this user, delete this old one
        recordsToDelete.push(player.id);
        console.log('Marking duplicate for deletion:', { userId: player.user_id, recordId: player.id });
      } else {
        // First record for this user, keep it
        seenUsers.set(player.user_id, player.id);
        players.push(player);
        console.log('Keeping record for user:', { userId: player.user_id, recordId: player.id });
      }
    }

    console.log('Deduplication result:', {
      totalRecords: allPlayers.length,
      uniquePlayers: players.length,
      recordsToDelete: recordsToDelete.length,
    });

    // Delete old duplicate records
    if (recordsToDelete.length > 0) {
      for (const id of recordsToDelete) {
        await supabase.from('game_players').delete().eq('id', id);
      }
      console.log('Deleted duplicate records:', recordsToDelete);
    }

    // Randomly select one player as imposter
    const imposterIndex = Math.floor(Math.random() * players.length);
    const imposterPlayerId = players[imposterIndex].id;
    const keyword = getRandomKeyword();

    console.log('Assigning imposter:', { imposterPlayerId, keyword });

    // Create current round record - without keyword column for now
    const { data: round, error: roundError } = await supabase
      .from('game_rounds')
      .insert({
        game_id: gameId,
        round_number: 1,
        phase: 'role_reveal',
      })
      .select()
      .single();

    console.log('Round creation result:', { roundId: round?.id, roundError: roundError?.message });

    if (roundError) {
      console.error('Round error details:', roundError);
      return NextResponse.json(
        { error: `Failed to create round: ${roundError.message}` },
        { status: 500 }
      );
    }

    if (!round) {
      console.error('Round is null after creation');
      return NextResponse.json(
        { error: 'Round creation returned null' },
        { status: 500 }
      );
    }

    // Assign roles to all players - use update instead of upsert
    console.log('Updating player roles for', players.length, 'players');

    for (const player of players) {
      const role = player.id === imposterPlayerId ? 'imposter' : 'crewmate';
      const { error: updateError } = await supabase
        .from('game_players')
        .update({ role })
        .eq('id', player.id);

      if (updateError) {
        console.error(`Error updating player ${player.id}:`, updateError.message);
        return NextResponse.json(
          { error: `Failed to assign role: ${updateError.message}` },
          { status: 500 }
        );
      }
    }

    console.log('Roles assigned successfully');

    // Update game status
    const { error: gameError } = await supabase
      .from('games')
      .update({
        status: 'in_progress',
        current_round: 1,
      })
      .eq('id', gameId);

    console.log('Game update result:', { gameError: gameError?.message });

    if (gameError) {
      console.error('Game update error:', gameError);
      return NextResponse.json(
        { error: `Failed to update game status: ${gameError.message}` },
        { status: 500 }
      );
    }

    console.log('Game started successfully, returning:', { roundId: round.id, keyword });

    return NextResponse.json({
      success: true,
      roundId: round.id,
      keyword,
      message: 'Game started, roles assigned',
    });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('Start game exception:', errorMsg, err);
    return NextResponse.json(
      { error: `Server error: ${errorMsg}` },
      { status: 500 }
    );
  }
}
