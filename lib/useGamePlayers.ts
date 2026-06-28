import { useEffect, useState } from 'react';
import { supabase } from './supabase';

export interface GamePlayer {
  id: string;
  user_id: string;
  game_id: string;
  role?: string;
  is_alive?: boolean;
  joined_at: string;
  username?: string;
}

export const useGamePlayers = (gameCode: string) => {
  const [players, setPlayers] = useState<GamePlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const subscribeToPlayers = async () => {
      try {
        // First, get the game ID from the code
        const { data: gameData, error: gameError } = await supabase
          .from('games')
          .select('id')
          .eq('invite_code', gameCode.toUpperCase())
          .single();

        if (gameError || !gameData) {
          setError('Game not found');
          setLoading(false);
          return;
        }

        // Initial load of players
        const { data: initialPlayers, error: playersError } = await supabase
          .from('game_players')
          .select('id, user_id, game_id, role, is_alive, joined_at')
          .eq('game_id', gameData.id)
          .order('joined_at', { ascending: true });

        console.log('Initial players load:', { count: initialPlayers?.length, players: initialPlayers, error: playersError });

        if (!playersError) {
          setPlayers(initialPlayers || []);
        } else {
          console.error('Error loading players:', playersError);
        }
        setLoading(false);

        // Subscribe to real-time changes
        const subscription = supabase
          .channel(`game_players_${gameData.id}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'game_players',
              filter: `game_id=eq.${gameData.id}`,
            },
            async (payload) => {
              // Fetch updated players list
              const { data: updatedPlayers } = await supabase
                .from('game_players')
                .select('id, user_id, game_id, role, is_alive, joined_at')
                .eq('game_id', gameData.id)
                .order('joined_at', { ascending: true });

              setPlayers(updatedPlayers || []);
            }
          )
          .subscribe();

        return () => {
          subscription.unsubscribe();
        };
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      }
    };

    subscribeToPlayers();
  }, [gameCode]);

  return { players, loading, error };
};
