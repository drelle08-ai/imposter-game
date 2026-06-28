'use client';

import { GamePlayer } from '@/lib/useGamePlayers';
import { VoteCount } from '@/lib/useGameVotes';

const designTokens = {
  colors: {
    primary: '#d4af37',
    primaryHover: '#f0d966',
    background: '#000000',
    surface: '#1a1a1a',
    text: '#ffffff',
    textMuted: '#666666',
    border: '#d4af37',
    success: '#22c55e',
  },
  fonts: {
    heading: "'Playfair Display', serif",
    body: "'Crimson Text', serif",
  },
  spacing: {
    xs: '0.5rem',
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
  },
};

interface VotingPhaseProps {
  players: GamePlayer[];
  votes: VoteCount;
  onVote: (playerId: string) => Promise<void>;
  hasVoted: boolean;
  timeLeft: number;
  currentUserId?: string;
}

export default function VotingPhase({
  players,
  votes,
  onVote,
  hasVoted,
  timeLeft,
  currentUserId,
}: VotingPhaseProps) {
  const activePlayers = players.filter((p) => p.is_alive !== false);
  const maxVotes = Math.max(...Object.values(votes), 0);

  return (
    <div style={{
      padding: designTokens.spacing.lg,
      borderRadius: '12px',
      background: `linear-gradient(135deg, #1a3a3a, #1a1a2e)`,
      border: `2px solid ${designTokens.colors.primary}`,
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: designTokens.spacing.lg,
      }}>
        <h2 style={{
          fontSize: '1.5rem',
          fontFamily: designTokens.fonts.heading,
          color: designTokens.colors.primary,
          margin: 0,
        }}>
          🗳️ Voting Phase
        </h2>
        <div style={{
          fontSize: '1.2rem',
          color: timeLeft <= 10 ? '#ef4444' : designTokens.colors.primary,
          fontWeight: 'bold',
        }}>
          {timeLeft}s
        </div>
      </div>

      {!hasVoted && (
        <p style={{
          color: designTokens.colors.textMuted,
          marginBottom: designTokens.spacing.md,
          margin: 0,
          marginBottom: designTokens.spacing.md,
        }}>
          Vote for who to eliminate:
        </p>
      )}

      {hasVoted && (
        <p style={{
          color: designTokens.colors.success,
          marginBottom: designTokens.spacing.md,
          margin: 0,
          marginBottom: designTokens.spacing.md,
        }}>
          ✓ You've voted. Waiting for others...
        </p>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: designTokens.spacing.md,
      }}>
        {activePlayers.map((player) => {
          const playerVotes = votes[player.id] || 0;
          const votePercentage = maxVotes > 0 ? (playerVotes / maxVotes) * 100 : 0;
          const isCurrentUser = player.user_id === currentUserId;

          return (
            <button
              key={player.id}
              onClick={() => !hasVoted && onVote(player.id)}
              disabled={hasVoted}
              style={{
                background: `linear-gradient(135deg, ${designTokens.colors.surface}, #2a2a2a)`,
                border: `2px solid ${isCurrentUser ? designTokens.colors.primary : '#444'}`,
                borderRadius: '8px',
                padding: designTokens.spacing.md,
                cursor: hasVoted ? 'not-allowed' : 'pointer',
                transition: 'all 150ms ease',
                color: designTokens.colors.text,
                fontFamily: designTokens.fonts.body,
                opacity: hasVoted ? 0.7 : 1,
              }}
              onMouseEnter={(e) => {
                if (!hasVoted) {
                  e.currentTarget.style.borderColor = designTokens.colors.primaryHover;
                  e.currentTarget.style.transform = 'scale(1.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (!hasVoted) {
                  e.currentTarget.style.borderColor = isCurrentUser ? designTokens.colors.primary : '#444';
                  e.currentTarget.style.transform = 'scale(1)';
                }
              }}
            >
              <p style={{
                margin: 0,
                marginBottom: designTokens.spacing.xs,
                fontWeight: 'bold',
                color: designTokens.colors.primary,
                fontSize: '0.95rem',
              }}>
                Player {players.indexOf(player) + 1}
                {isCurrentUser && ' (You)'}
              </p>

              {/* Vote bar */}
              <div style={{
                width: '100%',
                height: '24px',
                backgroundColor: designTokens.colors.background,
                borderRadius: '4px',
                overflow: 'hidden',
                marginBottom: designTokens.spacing.xs,
              }}>
                <div
                  style={{
                    height: '100%',
                    width: `${votePercentage}%`,
                    backgroundColor: designTokens.colors.primary,
                    transition: 'width 300ms ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {playerVotes > 0 && (
                    <span style={{
                      color: '#000000',
                      fontWeight: 'bold',
                      fontSize: '0.8rem',
                    }}>
                      {playerVotes}
                    </span>
                  )}
                </div>
              </div>

              <p style={{
                margin: 0,
                fontSize: '0.85rem',
                color: designTokens.colors.textMuted,
              }}>
                {playerVotes} vote{playerVotes !== 1 ? 's' : ''}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
