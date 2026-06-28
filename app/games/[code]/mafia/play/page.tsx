'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useGamePlayers } from '@/lib/useGamePlayers';
import { useGameVotes } from '@/lib/useGameVotes';
import RoleReveal from '@/app/components/RoleReveal';
import DiscussionPhase from '@/app/components/DiscussionPhase';
import VotingPhase from '@/app/components/VotingPhase';

const designTokens = {
  colors: {
    primary: '#d4af37',
    background: '#000000',
    surface: '#1a1a1a',
    text: '#ffffff',
    textMuted: '#666666',
  },
  fonts: {
    heading: "'Playfair Display', serif",
    body: "'Crimson Text', serif",
  },
  spacing: {
    md: '1.5rem',
    lg: '2rem',
  },
};

type GamePhase = 'role_reveal' | 'discussion' | 'voting' | 'ended';

interface GameState {
  id: string;
  status: string;
  current_round: number;
  max_rounds: number;
}

interface RoundState {
  id: string;
  round_number: number;
  phase: GamePhase;
  keyword: string;
}

interface PlayerRole {
  id: string;
  role: 'imposter' | 'crewmate';
  user_id: string;
}

export default function MafiaPlayPage() {
  const params = useParams();
  const code = params.code as string;

  const [gameState, setGameState] = useState<GameState | null>(null);
  const [roundState, setRoundState] = useState<RoundState | null>(null);
  const [playerRole, setPlayerRole] = useState<PlayerRole | null>(null);
  const [keyword, setKeyword] = useState<string>('');
  const [currentPhase, setCurrentPhase] = useState<GamePhase>('role_reveal');
  const [timeLeft, setTimeLeft] = useState(30);
  const [hasVoted, setHasVoted] = useState(false);
  const [hasSeenRole, setHasSeenRole] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const { players } = useGamePlayers(code);
  const { votes } = useGameVotes(roundState?.id || '', gameState?.id || '');

  // Load initial game state
  useEffect(() => {
    const loadGame = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
        setCurrentUser(userData);
      }

      const { data: game } = await supabase
        .from('games')
        .select('*')
        .eq('invite_code', code.toUpperCase())
        .single();

      if (game) {
        setGameState(game);

        const { data: round } = await supabase
          .from('game_rounds')
          .select('*')
          .eq('game_id', game.id)
          .eq('round_number', game.current_round)
          .single();

        if (round) {
          setRoundState(round);
          setCurrentPhase(round.phase || 'role_reveal');
        }
      }

      setLoading(false);
    };

    loadGame();
  }, [code]);

  // Load player's role
  useEffect(() => {
    if (!gameState || !currentUser) return;

    const loadPlayerRole = async () => {
      try {
        console.log('Loading player role:', { gameId: gameState.id, userId: currentUser.id });

        const { data: player, error } = await supabase
          .from('game_players')
          .select('*')
          .eq('game_id', gameState.id)
          .eq('user_id', currentUser.id)
          .limit(1)
          .single();

        console.log('Player role query result:', { player, error, status: error?.code });

        if (error) {
          console.error('Player role error details:', error);
        }

        if (player) {
          console.log('Setting player role:', { id: player.id, role: player.role });
          setPlayerRole(player);
        } else {
          console.warn('No player found for this user in this game');
        }
      } catch (err) {
        console.error('Exception loading player role:', err);
      }
    };

    loadPlayerRole();
  }, [gameState?.id, currentUser?.id]);

  // Retrieve keyword from localStorage
  useEffect(() => {
    if (!gameState) return;
    const storageKey = `keyword_${gameState.id}`;
    const storedKeyword = localStorage.getItem(storageKey);
    console.log('Retrieved keyword from localStorage:', { storageKey, storedKeyword, allKeys: Object.keys(localStorage) });
    if (storedKeyword) {
      console.log('Setting keyword state to:', storedKeyword);
      setKeyword(storedKeyword);
    } else {
      console.warn('Keyword not found in localStorage for key:', storageKey);
    }
  }, [gameState?.id]);

  // Subscribe to round phase changes
  useEffect(() => {
    if (!roundState) return;

    const subscription = supabase
      .channel(`round_${roundState.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'game_rounds',
          filter: `id=eq.${roundState.id}`,
        },
        (payload) => {
          const updated = payload.new as RoundState;
          setCurrentPhase(updated.phase);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [roundState?.id]);

  // Timer countdown (only for discussion/voting phases)
  useEffect(() => {
    if (currentPhase === 'role_reveal') return;

    const phaseLength = currentPhase === 'discussion' ? 30 : 20;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (currentPhase === 'discussion') {
            setCurrentPhase('voting');
            setHasVoted(false); // Reset vote for new phase
            return 20;
          } else {
            // Voting phase ends - process elimination
            console.log('Voting phase ended, processing elimination...');
            processElimination();
            return 30;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentPhase, gameState?.id, roundState?.id]);

  const processElimination = async () => {
    if (!gameState || !roundState) return;

    try {
      console.log('Calling eliminate API:', { gameId: gameState.id, roundId: roundState.id });

      const response = await fetch('/api/games/eliminate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId: gameState.id,
          roundId: roundState.id,
        }),
      });

      const data = await response.json();
      console.log('Elimination result:', data);

      if (data.gameWon) {
        // Game ended
        console.log('Game won by:', data.winner);
        setCurrentPhase('ended');
      } else {
        // Game continues to next round
        console.log('Advancing to round:', data.nextRound);
        setHasSeenRole(false);
        setCurrentPhase('role_reveal');
        setTimeLeft(30);
        // Reload game state to get new round
        const { data: newGame } = await supabase
          .from('games')
          .select('*')
          .eq('id', gameState.id)
          .single();
        if (newGame) {
          setGameState(newGame);
        }
      }
    } catch (err) {
      console.error('Error processing elimination:', err);
    }
  };

  const handleRoleRevealContinue = () => {
    setHasSeenRole(true);
    // Transition to discussion phase
    if (roundState) {
      supabase
        .from('game_rounds')
        .update({ phase: 'discussion' })
        .eq('id', roundState.id)
        .then(() => {
          setCurrentPhase('discussion');
          setTimeLeft(30);
        });
    }
  };

  const handleVote = async (playerId: string) => {
    if (!gameState || !roundState || !currentUser) return;

    try {
      await fetch('/api/games/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId: gameState.id,
          roundId: roundState.id,
          voterId: currentUser.id,
          votedForId: playerId,
        }),
      });

      setHasVoted(true);
    } catch (err) {
      console.error('Error voting:', err);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: designTokens.colors.background,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: designTokens.colors.primary,
      }}>
        Loading game...
      </div>
    );
  }

  // Show role reveal phase
  if (currentPhase === 'role_reveal' && !hasSeenRole) {
    if (!playerRole) {
      return (
        <div style={{
          minHeight: '100vh',
          backgroundColor: designTokens.colors.background,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: designTokens.colors.primary,
          fontFamily: designTokens.fonts.body,
        }}>
          Loading your role...
        </div>
      );
    }
    return (
      <RoleReveal
        role={playerRole.role}
        keyword={keyword}
        onContinue={handleRoleRevealContinue}
        playerCount={players.length}
        roundNumber={gameState?.current_round || 1}
      />
    );
  }

  // Show game ended screen
  if (currentPhase === 'ended') {
    const isImposter = playerRole?.role === 'imposter';
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: designTokens.colors.background,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: designTokens.spacing.lg,
      }}>
        <div style={{
          textAlign: 'center',
          maxWidth: '600px',
        }}>
          <div style={{
            fontSize: '4rem',
            marginBottom: designTokens.spacing.lg,
          }}>
            🎭
          </div>
          <h1 style={{
            fontSize: '3rem',
            fontFamily: designTokens.fonts.heading,
            color: designTokens.colors.primary,
            marginBottom: designTokens.spacing.md,
          }}>
            GAME OVER
          </h1>
          <p style={{
            fontSize: '1.5rem',
            color: designTokens.colors.text,
            marginBottom: designTokens.spacing.lg,
          }}>
            {gameState?.status === 'ended' ? (
              <span>
                {isImposter ? '🎭 Mafia' : '👥 Townspeople'} Win!
              </span>
            ) : (
              'Game Ended'
            )}
          </p>
          <div style={{
            padding: designTokens.spacing.lg,
            backgroundColor: designTokens.colors.surface,
            borderRadius: '8px',
            border: `1px solid ${designTokens.colors.primary}`,
            marginBottom: designTokens.spacing.lg,
          }}>
            <p style={{
              margin: 0,
              color: designTokens.colors.textMuted,
              marginBottom: designTokens.spacing.md,
            }}>
              {isImposter ? 'You were part of the Mafia' : 'You were a Townsperson'}
            </p>
            {keyword && !isImposter && (
              <p style={{
                margin: 0,
                color: designTokens.colors.primary,
                fontSize: '1.2rem',
                fontWeight: 'bold',
              }}>
                Secret word was: {keyword}
              </p>
            )}
          </div>
          <button
            onClick={() => {
              window.location.href = '/dashboard';
            }}
            style={{
              padding: `${designTokens.spacing.md} ${designTokens.spacing.lg}`,
              backgroundColor: designTokens.colors.primary,
              color: '#000',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontFamily: designTokens.fonts.body,
            }}
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Show gameplay phases
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: designTokens.colors.background,
      color: designTokens.colors.text,
      fontFamily: designTokens.fonts.body,
      padding: designTokens.spacing.lg,
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: designTokens.spacing.lg,
          paddingBottom: designTokens.spacing.md,
          borderBottom: `1px solid ${designTokens.colors.primary}`,
        }}>
          <div style={{
            fontSize: '1.5rem',
            fontFamily: designTokens.fonts.heading,
            color: designTokens.colors.primary,
            fontWeight: 'bold',
          }}>
            🎭 MAFIA - Round {gameState?.current_round}/{gameState?.max_rounds}
          </div>
          <div style={{
            color: designTokens.colors.textMuted,
            fontSize: '0.9rem',
          }}>
            {playerRole && (
              <span>
                {playerRole.role === 'imposter' ? '🎭 Mafia' : '👥 Civilian'} • Players: {players.length}
              </span>
            )}
          </div>
        </div>

        {/* Main gameplay area */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 300px',
          gap: designTokens.spacing.lg,
          marginBottom: designTokens.spacing.lg,
        }}>
          {/* Phase display */}
          <div>
            {currentPhase === 'discussion' && (
              <DiscussionPhase
                timeLeft={timeLeft}
                playerCount={players.length}
                round={gameState?.current_round || 1}
                maxRounds={gameState?.max_rounds || 10}
              />
            )}

            {currentPhase === 'voting' && roundState && (
              <VotingPhase
                players={players}
                votes={votes}
                onVote={handleVote}
                hasVoted={hasVoted}
                timeLeft={timeLeft}
                currentUserId={currentUser?.id}
              />
            )}
          </div>

          {/* Player list sidebar */}
          <div style={{
            background: `linear-gradient(135deg, ${designTokens.colors.surface}, #1a1a1a)`,
            border: `1px solid ${designTokens.colors.primary}`,
            borderRadius: '8px',
            padding: designTokens.spacing.md,
          }}>
            <h3 style={{
              fontSize: '1rem',
              color: designTokens.colors.primary,
              margin: 0,
              marginBottom: designTokens.spacing.md,
              fontWeight: 'bold',
            }}>
              Players
            </h3>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: designTokens.spacing.md,
            }}>
              {players.map((player, idx) => (
                <div
                  key={player.id}
                  style={{
                    padding: designTokens.spacing.md,
                    backgroundColor: designTokens.colors.background,
                    borderRadius: '6px',
                    border: '1px solid #333',
                    opacity: player.is_alive === false ? 0.5 : 1,
                  }}
                >
                  <p style={{
                    margin: 0,
                    fontSize: '0.9rem',
                    color: designTokens.colors.primary,
                    fontWeight: 'bold',
                  }}>
                    Player {idx + 1}
                  </p>
                  <p style={{
                    margin: 0,
                    fontSize: '0.8rem',
                    color: player.is_alive === false ? '#999' : designTokens.colors.textMuted,
                  }}>
                    {player.is_alive === false ? '💀 Eliminated' : '✓ Alive'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div style={{
          textAlign: 'center',
          color: designTokens.colors.textMuted,
          fontSize: '0.9rem',
          padding: designTokens.spacing.md,
          backgroundColor: designTokens.colors.surface,
          borderRadius: '8px',
        }}>
          <p style={{ margin: 0 }}>
            {currentPhase === 'discussion'
              ? 'Discuss who should be eliminated'
              : 'Vote for who to eliminate'}
          </p>
        </div>
      </div>
    </div>
  );
}
