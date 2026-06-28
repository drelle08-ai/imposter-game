'use client';

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
    heading: "'Playfair Display', serif",
    body: "'Crimson Text', serif",
  },
  spacing: {
    md: '1.5rem',
    lg: '2rem',
  },
};

interface DiscussionPhaseProps {
  timeLeft: number;
  playerCount: number;
  round: number;
  maxRounds: number;
}

export default function DiscussionPhase({
  timeLeft,
  playerCount,
  round,
  maxRounds,
}: DiscussionPhaseProps) {
  return (
    <div style={{
      padding: designTokens.spacing.lg,
      borderRadius: '12px',
      background: `linear-gradient(135deg, #1a3a1a, #1a1a2e)`,
      border: `2px solid ${designTokens.colors.primary}`,
      textAlign: 'center',
    }}>
      <h2 style={{
        fontSize: '2rem',
        fontFamily: designTokens.fonts.heading,
        color: designTokens.colors.primary,
        margin: 0,
        marginBottom: designTokens.spacing.md,
      }}>
        💬 Discussion Phase
      </h2>

      <p style={{
        fontSize: '1.3rem',
        color: designTokens.colors.text,
        marginBottom: designTokens.spacing.md,
      }}>
        Time to discuss: <strong style={{ color: designTokens.colors.primary }}>{timeLeft}s</strong>
      </p>

      <p style={{
        color: designTokens.colors.textMuted,
        margin: 0,
        marginBottom: designTokens.spacing.md,
      }}>
        {playerCount} players in discussion • Round {round}/{maxRounds}
      </p>

      <div style={{
        backgroundColor: designTokens.colors.surface,
        border: `1px solid ${designTokens.colors.border}`,
        borderRadius: '8px',
        padding: designTokens.spacing.md,
        color: designTokens.colors.textMuted,
        fontSize: '0.95rem',
      }}>
        Discuss who you think should be eliminated. Next vote begins automatically.
      </div>
    </div>
  );
}
