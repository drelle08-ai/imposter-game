'use client';

import { GamePlayer } from '@/lib/useGamePlayers';

const designTokens = {
  colors: {
    primary: '#d4af37',
    background: '#000000',
    surface: '#1a1a1a',
    text: '#ffffff',
    textMuted: '#666666',
    border: '#d4af37',
  },
  fonts: {
    body: "'Crimson Text', serif",
  },
  spacing: {
    xs: '0.5rem',
    sm: '1rem',
    md: '1.5rem',
  },
};

interface PlayerListProps {
  players: GamePlayer[];
  loading: boolean;
  maxPlayers?: number;
}

export default function PlayerList({ players, loading, maxPlayers = 10 }: PlayerListProps) {
  return (
    <div style={{
      background: designTokens.colors.surface,
      border: `2px solid ${designTokens.colors.border}`,
      borderRadius: '8px',
      padding: designTokens.spacing.md,
      marginTop: designTokens.spacing.md,
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: designTokens.spacing.md,
      }}>
        <p style={{
          fontSize: '1.1rem',
          color: designTokens.colors.primary,
          fontWeight: 'bold',
          margin: 0,
        }}>
          Players Joined
        </p>
        <span style={{
          fontSize: '0.9rem',
          color: designTokens.colors.textMuted,
          backgroundColor: designTokens.colors.background,
          padding: `${designTokens.spacing.xs} ${designTokens.spacing.sm}`,
          borderRadius: '4px',
        }}>
          {players.length}/{maxPlayers}
        </span>
      </div>

      {loading ? (
        <p style={{ color: designTokens.colors.textMuted, margin: 0, fontSize: '0.9rem' }}>
          Loading players...
        </p>
      ) : players.length === 0 ? (
        <p style={{ color: designTokens.colors.textMuted, margin: 0, fontSize: '0.9rem' }}>
          Waiting for players to join...
        </p>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
          gap: designTokens.spacing.sm,
        }}>
          {players.map((player) => (
            <div
              key={player.id}
              style={{
                backgroundColor: designTokens.colors.background,
                border: `1px solid ${designTokens.colors.border}`,
                borderRadius: '6px',
                padding: designTokens.spacing.sm,
                textAlign: 'center',
                animation: 'slideIn 0.3s ease-out',
              }}
            >
              <p style={{
                margin: 0,
                fontSize: '0.9rem',
                color: designTokens.colors.primary,
                fontWeight: 'bold',
                wordBreak: 'break-word',
              }}>
                Player {players.indexOf(player) + 1}
              </p>
              <p style={{
                margin: 0,
                fontSize: '0.75rem',
                color: designTokens.colors.textMuted,
                marginTop: '0.25rem',
              }}>
                ✓ Joined
              </p>
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
