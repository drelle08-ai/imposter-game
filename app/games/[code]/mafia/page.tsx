'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';

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
  },
};

export default function MafiaGamePage() {
  const params = useParams();
  const code = params.code as string;
  const [copied, setCopied] = useState(false);
  const gameUrl = typeof window !== 'undefined' ? `${window.location.origin}/games/${code}/mafia` : '';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(gameUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: designTokens.colors.background,
      color: designTokens.colors.text,
      fontFamily: designTokens.fonts.body,
      width: '100%',
    }}>
      {/* Header */}
      <header style={{
        borderBottom: `1px solid ${designTokens.colors.border}`,
        padding: `${designTokens.spacing.sm} ${designTokens.spacing.md}`,
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: designTokens.colors.primary,
            fontFamily: designTokens.fonts.heading,
          }}>
            🎭 MAFIA
          </div>
          <Link href="/dashboard" style={{
            color: designTokens.colors.primary,
            textDecoration: 'none',
            padding: `${designTokens.spacing.xs} ${designTokens.spacing.md}`,
            border: `1px solid ${designTokens.colors.primary}`,
            borderRadius: '6px',
            transition: 'all 150ms ease',
            cursor: 'pointer',
          }} onMouseEnter={(e) => {
            e.target.style.backgroundColor = designTokens.colors.primary;
            e.target.style.color = '#000000';
          }} onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent';
            e.target.style.color = designTokens.colors.primary;
          }}>
            Back to Dashboard
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: designTokens.spacing.lg,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 120px)',
      }}>
        <div style={{
          textAlign: 'center',
          background: `linear-gradient(135deg, ${designTokens.colors.surfaceLight}, ${designTokens.colors.surface})`,
          border: `2px solid ${designTokens.colors.primary}`,
          borderRadius: '12px',
          padding: designTokens.spacing.xl,
          maxWidth: '600px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.9)',
        }}>
          <div style={{ fontSize: '4rem', marginBottom: designTokens.spacing.md }}>
            🎭
          </div>

          <h1 style={{
            fontSize: '2.5rem',
            fontFamily: designTokens.fonts.heading,
            color: designTokens.colors.primary,
            margin: 0,
            marginBottom: designTokens.spacing.md,
            letterSpacing: '0.05em',
          }}>
            Mafia Lobby
          </h1>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: designTokens.spacing.lg,
            marginBottom: designTokens.spacing.lg,
            alignItems: 'center',
          }}>
            {/* Game Code */}
            <div style={{
              background: designTokens.colors.background,
              border: `2px solid ${designTokens.colors.primary}`,
              borderRadius: '8px',
              padding: designTokens.spacing.lg,
            }}>
              <p style={{
                fontSize: '1rem',
                color: designTokens.colors.primary,
                margin: 0,
                marginBottom: designTokens.spacing.sm,
                fontWeight: 'bold',
              }}>
                Game Code
              </p>
              <p style={{
                fontSize: '1.8rem',
                color: designTokens.colors.primaryHover,
                margin: 0,
                fontFamily: 'monospace',
                letterSpacing: '0.2em',
                fontWeight: 'bold',
              }}>
                {code}
              </p>
            </div>

            {/* QR Code */}
            <div style={{
              background: designTokens.colors.background,
              border: `2px solid ${designTokens.colors.primary}`,
              borderRadius: '8px',
              padding: designTokens.spacing.md,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <QRCodeSVG
                value={gameUrl}
                size={150}
                bgColor="#000000"
                fgColor="#d4af37"
                level="H"
              />
            </div>
          </div>

          <p style={{
            color: designTokens.colors.textMuted,
            fontSize: '1.1rem',
            lineHeight: '1.6',
            marginBottom: designTokens.spacing.lg,
          }}>
            Game is ready! Players can join using the code above.
          </p>

          <div style={{
            display: 'flex',
            gap: designTokens.spacing.md,
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}>
            <button style={{
              backgroundColor: designTokens.colors.primary,
              color: '#000000',
              padding: `${designTokens.spacing.md} ${designTokens.spacing.lg}`,
              borderRadius: '6px',
              border: 'none',
              fontWeight: 'bold',
              fontSize: '1rem',
              cursor: 'pointer',
              transition: 'all 150ms ease',
              fontFamily: designTokens.fonts.body,
            }} onMouseEnter={(e) => {
              e.target.style.backgroundColor = designTokens.colors.primaryHover;
              e.target.style.transform = 'scale(1.05)';
            }} onMouseLeave={(e) => {
              e.target.style.backgroundColor = designTokens.colors.primary;
              e.target.style.transform = 'scale(1)';
            }}>
              Start Game
            </button>

            <button onClick={handleCopyLink} style={{
              backgroundColor: copied ? designTokens.colors.primary : 'transparent',
              color: copied ? '#000000' : designTokens.colors.primary,
              padding: `${designTokens.spacing.md} ${designTokens.spacing.lg}`,
              borderRadius: '6px',
              border: `2px solid ${designTokens.colors.primary}`,
              fontWeight: 'bold',
              fontSize: '1rem',
              cursor: 'pointer',
              transition: 'all 150ms ease',
              fontFamily: designTokens.fonts.body,
            }} onMouseEnter={(e) => !copied && (e.target.style.backgroundColor = designTokens.colors.primary)} onMouseLeave={(e) => !copied && (e.target.style.backgroundColor = 'transparent')}>
              {copied ? '✓ Copied!' : 'Copy Link'}
            </button>
          </div>

          <p style={{
            color: designTokens.colors.textMuted,
            fontSize: '0.9rem',
            marginTop: designTokens.spacing.lg,
            margin: 0,
          }}>
            Waiting for players to join...
          </p>
        </div>
      </main>
    </div>
  );
}
