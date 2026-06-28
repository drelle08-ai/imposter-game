'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { useGamePlayers } from '@/lib/useGamePlayers';
import PlayerList from '@/app/components/PlayerList';
import { supabase } from '@/lib/supabase';

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

export default function ImposterGamePage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;
  const [copied, setCopied] = useState(false);
  const [joining, setJoining] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [gameUrl, setGameUrl] = useState('');
  const [starting, setStarting] = useState(false);
  const { players, loading } = useGamePlayers(code);

  useEffect(() => {
    setGameUrl(`${window.location.origin}/games/${code}/imposter`);
  }, [code]);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
        setCurrentUser(userData);
      }
    };
    checkAuth();
  }, []);

  const handleJoinGame = async () => {
    if (!currentUser) return;
    setJoining(true);

    try {
      const { data: gameData } = await supabase
        .from('games')
        .select('id')
        .eq('invite_code', code.toUpperCase())
        .single();

      if (!gameData) return;

      // Check if already joined
      const { data: existingPlayer } = await supabase
        .from('game_players')
        .select('id')
        .eq('game_id', gameData.id)
        .eq('user_id', currentUser.id)
        .maybeSingle();

      if (existingPlayer) {
        console.log('Already joined this game');
        setIsJoined(true);
        setJoining(false);
        return;
      }

      const { error } = await supabase
        .from('game_players')
        .insert({
          game_id: gameData.id,
          user_id: currentUser.id,
          role: 'unassigned',
        });

      if (!error) {
        setIsJoined(true);
      }
    } catch (err) {
      console.error('Error joining game:', err);
    } finally {
      setJoining(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(gameUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartGame = async () => {
    if (!currentUser) return;
    setStarting(true);

    try {
      const { data: gameData, error: gameError } = await supabase
        .from('games')
        .select('id, invite_code')
        .eq('invite_code', code.toUpperCase())
        .single();

      console.log('Game lookup:', { code: code.toUpperCase(), gameData, gameError });

      if (!gameData) {
        console.error('No game found for code:', code.toUpperCase());
        setStarting(false);
        return;
      }

      // Call start game API to assign roles
      console.log('Calling start game API with:', { gameId: gameData.id, userId: currentUser.id });

      const response = await fetch('/api/games/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId: gameData.id,
          userId: currentUser.id,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Start game success:', { keyword: data.keyword, roundId: data.roundId, gameId: gameData.id });
        // Store keyword in localStorage for gameplay page
        if (data.keyword) {
          console.log('Storing keyword in localStorage:', { key: `keyword_${gameData.id}`, value: data.keyword });
          localStorage.setItem(`keyword_${gameData.id}`, data.keyword);
        } else {
          console.warn('No keyword in response data!');
        }
        // Navigate to gameplay
        router.push(`/games/${code}/imposter/play`);
      } else {
        setStarting(false);
        const text = await response.text();
        console.error('API Error Status:', response.status);
        console.error('API Error Text:', text);
        try {
          const error = JSON.parse(text);
          console.error('API Error JSON:', error);
        } catch (e) {
          console.error('Could not parse error as JSON');
        }
      }
    } catch (err) {
      setStarting(false);
      console.error('Error starting game:', err instanceof Error ? err.message : err);
    }
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
            🕵️ IMPOSTER
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
        width: '100%',
        boxSizing: 'border-box',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: designTokens.spacing.lg,
          alignItems: 'start',
        }}>
          {/* Left Column - Game Info */}
          <div style={{
            textAlign: 'center',
            background: `linear-gradient(135deg, ${designTokens.colors.surfaceLight}, ${designTokens.colors.surface})`,
            border: `2px solid ${designTokens.colors.primary}`,
            borderRadius: '12px',
            padding: designTokens.spacing.xl,
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.9)',
          }}>
            <div style={{ fontSize: '4rem', marginBottom: designTokens.spacing.md }}>
              🕵️
            </div>

            <h1 style={{
              fontSize: '2.5rem',
              fontFamily: designTokens.fonts.heading,
              color: designTokens.colors.primary,
              margin: 0,
              marginBottom: designTokens.spacing.md,
              letterSpacing: '0.05em',
            }}>
              Imposter Lobby
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
                minHeight: '190px',
              }}>
                {gameUrl ? (
                  <QRCodeSVG
                    value={gameUrl}
                    size={150}
                    bgColor="#000000"
                    fgColor="#d4af37"
                    level="H"
                  />
                ) : (
                  <p style={{ color: designTokens.colors.textMuted, margin: 0 }}>Loading...</p>
                )}
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
              <button onClick={handleStartGame} disabled={starting} style={{
                backgroundColor: starting ? '#666666' : designTokens.colors.primary,
                color: '#000000',
                padding: `${designTokens.spacing.md} ${designTokens.spacing.lg}`,
                borderRadius: '6px',
                border: 'none',
                fontWeight: 'bold',
                fontSize: '1rem',
                cursor: starting ? 'not-allowed' : 'pointer',
                transition: 'all 150ms ease',
                fontFamily: designTokens.fonts.body,
                opacity: starting ? 0.7 : 1,
              }} onMouseEnter={(e) => !starting && (e.target.style.backgroundColor = designTokens.colors.primaryHover)} onMouseLeave={(e) => !starting && (e.target.style.backgroundColor = designTokens.colors.primary)}>
                {starting ? 'Starting...' : 'Start Game'}
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
          </div>

          {/* Right Column - Players */}
          <div>
            <PlayerList players={players} loading={loading} maxPlayers={8} />

            {currentUser && !isJoined && (
              <button
                onClick={handleJoinGame}
                disabled={joining}
                style={{
                  width: '100%',
                  marginTop: designTokens.spacing.lg,
                  backgroundColor: joining ? '#666666' : '#22c55e',
                  color: '#ffffff',
                  padding: designTokens.spacing.lg,
                  borderRadius: '8px',
                  border: 'none',
                  fontWeight: 'bold',
                  fontSize: '1.1rem',
                  cursor: joining ? 'not-allowed' : 'pointer',
                  transition: 'all 150ms ease',
                  fontFamily: designTokens.fonts.body,
                }}
                onMouseEnter={(e) => !joining && (e.target.style.backgroundColor = '#16a34a')}
                onMouseLeave={(e) => !joining && (e.target.style.backgroundColor = '#22c55e')}
              >
                {joining ? 'Joining...' : '✓ Join Game'}
              </button>
            )}

            {isJoined && (
              <div style={{
                marginTop: designTokens.spacing.lg,
                padding: designTokens.spacing.md,
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                border: '1px solid #22c55e',
                borderRadius: '8px',
                textAlign: 'center',
                color: '#86efac',
              }}>
                ✓ You've joined the game! Waiting for host to start...
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
