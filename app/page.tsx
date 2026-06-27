'use client';

import Link from 'next/link';

const designTokens = {
  colors: {
    primary: '#d4af37',
    primaryHover: '#f0d966',
    background: '#000000',
    surface: '#1a1a1a',
    surfaceLight: '#2a2a2a',
    text: '#ffffff',
    textSecondary: '#b8860b',
    textMuted: '#666666',
    border: '#d4af37',
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
    xl: '3rem',
    xxl: '5rem',
  },
};

export default function HomePage() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: designTokens.colors.background,
      color: designTokens.colors.text,
      fontFamily: designTokens.fonts.body,
      width: '100%',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <header style={{
        borderBottom: `1px solid ${designTokens.colors.border}`,
        padding: `${designTokens.spacing.sm} ${designTokens.spacing.md}`,
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        backdropFilter: 'blur(8px)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: designTokens.colors.primary,
            fontFamily: designTokens.fonts.heading,
            letterSpacing: '0.1em',
          }}>
            🎮 THE GAME
          </div>
          <div style={{ display: 'flex', gap: designTokens.spacing.md, alignItems: 'center' }}>
            <Link href="/auth/login" style={{
              color: designTokens.colors.primary,
              textDecoration: 'none',
              transition: 'color 150ms ease',
              cursor: 'pointer',
              fontSize: '1rem',
            }} onMouseEnter={(e) => e.target.style.color = designTokens.colors.primaryHover} onMouseLeave={(e) => e.target.style.color = designTokens.colors.primary}>
              Login
            </Link>
            <Link href="/auth/signup" style={{
              background: `linear-gradient(135deg, ${designTokens.colors.primary}, ${designTokens.colors.primaryHover})`,
              color: '#000000',
              padding: `${designTokens.spacing.xs} ${designTokens.spacing.md}`,
              borderRadius: '6px',
              textDecoration: 'none',
              fontWeight: 'bold',
              transition: 'transform 150ms ease',
              cursor: 'pointer',
              fontSize: '0.95rem',
              display: 'inline-block',
            }} onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'} onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}>
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{
        padding: `${designTokens.spacing.xxl} ${designTokens.spacing.md}`,
        textAlign: 'center',
        background: 'linear-gradient(135deg, #000000 0%, #0a0a0a 100%)',
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h1 style={{
            fontSize: '3.5rem',
            fontFamily: designTokens.fonts.heading,
            background: `linear-gradient(135deg, ${designTokens.colors.primary}, ${designTokens.colors.primaryHover})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: designTokens.spacing.md,
            letterSpacing: '0.05em',
            fontWeight: 900,
          }}>
            THE GAME
          </h1>
          <p style={{
            fontSize: '1.5rem',
            color: designTokens.colors.textSecondary,
            marginBottom: designTokens.spacing.md,
            fontFamily: designTokens.fonts.body,
            letterSpacing: '0.03em',
          }}>
            Two Legendary Games. Endless Entertainment.
          </p>
          <p style={{
            fontSize: '1.1rem',
            color: designTokens.colors.textMuted,
            marginBottom: designTokens.spacing.lg,
            lineHeight: '1.6',
          }}>
            Challenge your friends with premium multiplayer party games. Perfect for game nights, team building, or just having fun.
          </p>
          <Link href="/auth/signup" style={{
            background: `linear-gradient(135deg, ${designTokens.colors.primary}, ${designTokens.colors.primaryHover})`,
            color: '#000000',
            padding: `${designTokens.spacing.md} ${designTokens.spacing.lg}`,
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: 'bold',
            fontSize: '1.1rem',
            display: 'inline-block',
            transition: 'transform 150ms ease, box-shadow 150ms ease',
            cursor: 'pointer',
            boxShadow: `0 10px 30px rgba(212, 175, 55, 0.2)`,
          }} onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-3px)';
            e.target.style.boxShadow = `0 15px 40px rgba(212, 175, 55, 0.3)`;
          }} onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = `0 10px 30px rgba(212, 175, 55, 0.2)`;
          }}>
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Games Section */}
      <section style={{
        padding: `${designTokens.spacing.xxl} ${designTokens.spacing.md}`,
        background: 'linear-gradient(to bottom, #0a0a0a, #000000)',
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '2.5rem',
            fontFamily: designTokens.fonts.heading,
            color: designTokens.colors.primary,
            textAlign: 'center',
            marginBottom: designTokens.spacing.xxl,
            letterSpacing: '0.1em',
          }}>
            Choose Your Game
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: designTokens.spacing.lg,
            maxWidth: '900px',
            margin: '0 auto',
          }}>
            {/* Imposter Card */}
            <GameCard
              emoji="🕵️"
              title="Imposter"
              subtitle="Spot the Imposter"
              features={['4-8 players', 'Find the imposter among crew', 'Strategic voting & discussion', 'Multiple rounds']}
              color="#3b82f6"
              colorHover="#1d4ed8"
            />

            {/* Mafia Card */}
            <GameCard
              emoji="🎭"
              title="Mafia"
              subtitle="Classic Deception Game"
              features={['5-10 players', 'Mafia vs Civilians', 'Day/Night phases', 'Elimination strategy']}
              color="#a855f7"
              colorHover="#6d28d9"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: designTokens.spacing.lg,
        textAlign: 'center',
        borderTop: `1px solid ${designTokens.colors.border}`,
        color: designTokens.colors.textMuted,
        fontSize: '0.9rem',
      }}>
        <p>© 2026 THE GAME. Premium Multiplayer Entertainment.</p>
      </footer>
    </div>
  );
}

function GameCard({ emoji, title, subtitle, features, color, colorHover }) {
  const tokens = {
    colors: {
      primary: '#d4af37',
      primaryHover: '#f0d966',
      background: '#000000',
      surface: '#1a1a1a',
      surfaceLight: '#2a2a2a',
      text: '#ffffff',
      textSecondary: '#b8860b',
      textMuted: '#666666',
      border: '#d4af37',
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

  return (
    <div style={{
      background: `linear-gradient(135deg, ${tokens.colors.surfaceLight}, ${tokens.colors.surface})`,
      border: `2px solid ${color}`,
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: `0 10px 30px rgba(0, 0, 0, 0.5)`,
      transition: 'transform 150ms ease, box-shadow 150ms ease',
      cursor: 'pointer',
    }} onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-8px)';
      e.currentTarget.style.boxShadow = `0 20px 40px rgba(212, 175, 55, 0.3)`;
    }} onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = `0 10px 30px rgba(0, 0, 0, 0.5)`;
    }}>
      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg, ${color}, ${colorHover})`,
        padding: tokens.spacing.lg,
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '3rem', marginBottom: tokens.spacing.sm }}>
          {emoji}
        </div>
        <h3 style={{
          fontSize: '1.8rem',
          fontFamily: tokens.fonts.heading,
          color: '#ffffff',
          margin: 0,
          fontWeight: 'bold',
        }}>
          {title}
        </h3>
      </div>

      {/* Body */}
      <div style={{ padding: tokens.spacing.lg }}>
        <p style={{
          fontSize: '1rem',
          color: tokens.colors.primary,
          marginBottom: tokens.spacing.md,
          fontWeight: '600',
        }}>
          {subtitle}
        </p>

        <ul style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          marginBottom: tokens.spacing.lg,
        }}>
          {features.map((feature, i) => (
            <li key={i} style={{
              color: tokens.colors.textMuted,
              marginBottom: tokens.spacing.xs,
              fontSize: '0.95rem',
            }}>
              ✓ {feature}
            </li>
          ))}
        </ul>

        <Link href="/auth/signup" style={{
          display: 'block',
          width: '100%',
          padding: tokens.spacing.sm,
          backgroundColor: color,
          color: '#ffffff',
          textAlign: 'center',
          textDecoration: 'none',
          borderRadius: '6px',
          fontWeight: 'bold',
          transition: 'background-color 150ms ease, transform 150ms ease',
          cursor: 'pointer',
          fontSize: '0.95rem',
        }} onMouseEnter={(e) => {
          e.target.style.backgroundColor = colorHover;
          e.target.style.transform = 'scale(1.02)';
        }} onMouseLeave={(e) => {
          e.target.style.backgroundColor = color;
          e.target.style.transform = 'scale(1)';
        }}>
          Sign Up to Play
        </Link>
      </div>
    </div>
  );
}
