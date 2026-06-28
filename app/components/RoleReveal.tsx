'use client';

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
    xl: '3rem',
  },
};

interface RoleRevealProps {
  role: 'imposter' | 'crewmate';
  keyword?: string;
  onContinue: () => void;
  playerCount: number;
  roundNumber: number;
}

export default function RoleReveal({
  role,
  keyword,
  onContinue,
  playerCount,
  roundNumber,
}: RoleRevealProps) {
  const isImposter = role === 'imposter';

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
        background: `linear-gradient(135deg, ${designTokens.colors.surface}, #1a1a2e)`,
        border: `2px solid ${designTokens.colors.primary}`,
        borderRadius: '16px',
        padding: designTokens.spacing.xl,
        maxWidth: '600px',
        width: '100%',
      }}>
        <div style={{
          fontSize: '5rem',
          marginBottom: designTokens.spacing.md,
        }}>
          {isImposter ? '🕵️' : '👥'}
        </div>

        <h1 style={{
          fontSize: '2.5rem',
          fontFamily: designTokens.fonts.heading,
          color: designTokens.colors.primary,
          margin: 0,
          marginBottom: designTokens.spacing.md,
          letterSpacing: '0.05em',
        }}>
          {isImposter ? 'YOU ARE THE IMPOSTER' : 'YOU ARE A CREWMATE'}
        </h1>

        {isImposter && (
          <div style={{
            backgroundColor: 'rgba(255, 0, 0, 0.1)',
            border: '2px solid #ef4444',
            borderRadius: '12px',
            padding: designTokens.spacing.lg,
            marginBottom: designTokens.spacing.lg,
          }}>
            <p style={{
              color: '#fca5a5',
              fontSize: '1.1rem',
              margin: 0,
              marginBottom: designTokens.spacing.md,
            }}>
              Your mission:
            </p>
            <p style={{
              color: '#fca5a5',
              fontSize: '1rem',
              margin: 0,
              lineHeight: '1.6',
            }}>
              Figure out what the keyword is before you're voted out. Act like you know it, but don't get caught!
            </p>
          </div>
        )}

        {!isImposter && (
          <div style={{
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            border: '2px solid #22c55e',
            borderRadius: '12px',
            padding: designTokens.spacing.lg,
            marginBottom: designTokens.spacing.lg,
          }}>
            <p style={{
              color: '#86efac',
              fontSize: '1rem',
              margin: 0,
              marginBottom: designTokens.spacing.md,
              fontWeight: 'bold',
            }}>
              The Keyword:
            </p>
            <p style={{
              fontSize: '3rem',
              fontFamily: 'monospace',
              color: designTokens.colors.primary,
              margin: 0,
              marginBottom: designTokens.spacing.md,
              letterSpacing: '0.1em',
              fontWeight: 'bold',
            }}>
              {keyword}
            </p>
            <p style={{
              color: '#86efac',
              fontSize: '0.95rem',
              margin: 0,
              lineHeight: '1.6',
            }}>
              Don't let the imposter know! Use this keyword to discuss and identify who doesn't know it.
            </p>
          </div>
        )}

        <div style={{
          backgroundColor: designTokens.colors.surface,
          border: `1px solid ${designTokens.colors.primary}`,
          borderRadius: '8px',
          padding: designTokens.spacing.md,
          marginBottom: designTokens.spacing.lg,
          color: designTokens.colors.textMuted,
          fontSize: '0.95rem',
        }}>
          <p style={{ margin: 0, marginBottom: '0.5rem' }}>
            Round {roundNumber} • {playerCount} players
          </p>
          <p style={{ margin: 0 }}>
            Game starts when all players continue
          </p>
        </div>

        <button
          onClick={onContinue}
          style={{
            backgroundColor: designTokens.colors.primary,
            color: '#000000',
            padding: `${designTokens.spacing.md} ${designTokens.spacing.xl}`,
            borderRadius: '8px',
            border: 'none',
            fontWeight: 'bold',
            fontSize: '1.1rem',
            cursor: 'pointer',
            transition: 'all 150ms ease',
            fontFamily: designTokens.fonts.body,
            width: '100%',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f0d966';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = designTokens.colors.primary;
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          I Understand - Continue to Game
        </button>
      </div>
    </div>
  );
}
