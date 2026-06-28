import { useEffect, useState } from 'react';
import { supabase } from './supabase';

export interface VoteCount {
  [playerId: string]: number;
}

export const useGameVotes = (roundId: string, gameId: string) => {
  const [votes, setVotes] = useState<VoteCount>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const subscribeToVotes = async () => {
      try {
        // Initial load of votes
        const { data: initialVotes, error: votesError } = await supabase
          .from('game_votes')
          .select('voted_for_id')
          .eq('round_id', roundId)
          .eq('game_id', gameId);

        if (!votesError) {
          const voteCounts: VoteCount = {};
          initialVotes?.forEach((vote) => {
            voteCounts[vote.voted_for_id] = (voteCounts[vote.voted_for_id] || 0) + 1;
          });
          setVotes(voteCounts);
        }
        setLoading(false);

        // Subscribe to real-time changes
        const subscription = supabase
          .channel(`game_votes_${roundId}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'game_votes',
              filter: `round_id=eq.${roundId}`,
            },
            async (payload) => {
              // Fetch updated vote counts
              const { data: updatedVotes } = await supabase
                .from('game_votes')
                .select('voted_for_id')
                .eq('round_id', roundId)
                .eq('game_id', gameId);

              const voteCounts: VoteCount = {};
              updatedVotes?.forEach((vote) => {
                voteCounts[vote.voted_for_id] = (voteCounts[vote.voted_for_id] || 0) + 1;
              });
              setVotes(voteCounts);
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

    subscribeToVotes();
  }, [roundId, gameId]);

  return { votes, loading, error };
};
