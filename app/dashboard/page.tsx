'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
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
    error: '#dc2626',
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

interface User {
  id: string;
  username: string;
  email: string;
}

interface Game {
  id: string;
  invite_code: string;
  game_type: string;
  status: string;
  created_at: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [joinCode, setJoinCode] = useState('');
  const [selectedGameType, setSelectedGameType] = useState<'imposter' | 'mafia'>('imposter');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth/login');
        return;
      }

      try {
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        setUser(userData);

        const { data: gamesData } = await supabase
          .from('games')
          .select('*')
          .eq('host_id', session.user.id)
          .order('created_at', { ascending: false });

        setGames(gamesData || []);
      } catch (err) {
        console.error('Error loading dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleCreateGame = async () => {
    setCreating(true);
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    try {
      const { data } = await supabase
        .from('games')
        .insert({
          invite_code: inviteCode,
          game_type: selectedGameType,
          host_id: session.user.id,
          status: 'lobby',
        })
        .select()
        .single();

      if (data) {
        router.push(`/games/${inviteCode}/${selectedGameType}`);
      }
    } catch (error) {
      console.error('Error creating game:', error);
      alert('Failed to create game');
    } finally {
      setCreating(false);
    }
  };

  const handleJoinGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (joinCode.length !== 6) return;

    try {
      const { data } = await supabase
        .from('games')
        .select('*')
        .eq('invite_code', joinCode)
        .single();

      if (data) {
        router.push(`/games/${joinCode}/${data.game_type}`);
      }
    } catch (error) {
      console.error('Error joining game:', error);
      alert('Game not found');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: designTokens.colors.background, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: designTokens.fonts.body }}>
        <div style={{ fontSize: '1.5rem', color: designTokens.colors.primary }}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: designTokens.colors.background, color: designTokens.colors.text, fontFamily: designTokens.fonts.body, width: '100%' }}>
      {/* Header */}
      <header style={{ borderBottom: `1px solid ${designTokens.colors.border}`, padding: `${designTokens.spacing.sm} ${designTokens.spacing.md}`, backgroundColor: 'rgba(0, 0, 0, 0.95)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: designTokens.colors.primary, fontFamily: designTokens.fonts.heading, letterSpacing: '0.1em' }}>
            🎮 THE GAME
          </div>
          <div style={{ display: 'flex', gap: designTokens.spacing.md, alignItems: 'center' }}>
            <span style={{ fontSize: '0.9rem', color: designTokens.colors.textSecondary }}>Welcome, {user?.username || 'Player'}</span>
            <button onClick={handleLogout} style={{
              backgroundColor: '#7f1d1d',
              color: designTokens.colors.primary,
              border: `2px solid ${designTokens.colors.primary}`,
              padding: `${designTokens.spacing.xs} ${designTokens.spacing.md}`,
              borderRadius: '6px',
              cursor: 'pointer',
              fontFamily: designTokens.fonts.body,
              fontWeight: 'bold',
              transition: 'all 150ms ease',
            }} onMouseEnter={(e) => { e.target.style.backgroundColor = '#991b1b'; }} onMouseLeave={(e) => { e.target.style.backgroundColor = '#7f1d1d'; }}>
              Exit
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: designTokens.spacing.lg, width: '100%', boxSizing: 'border-box' }}>
        {/* Action Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: designTokens.spacing.lg, marginBottom: designTokens.spacing.xl }}>
          {/* Create Game Card */}
          <div style={{
            background: `linear-gradient(135deg, ${designTokens.colors.surfaceLight}, ${designTokens.colors.surface})`,
            border: `2px solid ${designTokens.colors.primary}`,
            borderRadius: '12px',
            padding: designTokens.spacing.lg,
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontFamily: designTokens.fonts.heading,
              color: designTokens.colors.primary,
              marginBottom: designTokens.spacing.md,
              margin: 0,
              marginBottom: designTokens.spacing.md,
            }}>Create Game</h2>
            <p style={{ color: designTokens.colors.textMuted, marginBottom: designTokens.spacing.md, margin: 0, marginBottom: designTokens.spacing.md }}>Select a game and invite friends</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: designTokens.spacing.sm, marginBottom: designTokens.spacing.md }}>
              <button
                onClick={() => setSelectedGameType('imposter')}
                style={{
                  padding: `${designTokens.spacing.md}`,
                  borderRadius: '6px',
                  border: 'none',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 150ms ease',
                  backgroundColor: selectedGameType === 'imposter' ? '#3b82f6' : designTokens.colors.surface,
                  color: selectedGameType === 'imposter' ? '#ffffff' : designTokens.colors.primary,
                  fontFamily: designTokens.fonts.body,
                }}
              >
                🕵️ Imposter
              </button>
              <button
                onClick={() => setSelectedGameType('mafia')}
                style={{
                  padding: `${designTokens.spacing.md}`,
                  borderRadius: '6px',
                  border: 'none',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 150ms ease',
                  backgroundColor: selectedGameType === 'mafia' ? '#a855f7' : designTokens.colors.surface,
                  color: selectedGameType === 'mafia' ? '#ffffff' : designTokens.colors.primary,
                  fontFamily: designTokens.fonts.body,
                }}
              >
                🎭 Mafia
              </button>
            </div>

            <button
              onClick={handleCreateGame}
              disabled={creating}
              style={{
                width: '100%',
                padding: designTokens.spacing.md,
                backgroundColor: creating ? '#666666' : designTokens.colors.primary,
                color: '#000000',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 'bold',
                cursor: creating ? 'not-allowed' : 'pointer',
                transition: 'all 150ms ease',
                fontFamily: designTokens.fonts.body,
                fontSize: '1rem',
              }}
              onMouseEnter={(e) => !creating && (e.target.style.backgroundColor = designTokens.colors.primaryHover)}
              onMouseLeave={(e) => !creating && (e.target.style.backgroundColor = designTokens.colors.primary)}
            >
              {creating ? 'Creating...' : 'Create Game'}
            </button>
          </div>

          {/* Join Game Card */}
          <div style={{
            background: `linear-gradient(135deg, ${designTokens.colors.surfaceLight}, ${designTokens.colors.surface})`,
            border: `2px solid ${designTokens.colors.primary}`,
            borderRadius: '12px',
            padding: designTokens.spacing.lg,
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontFamily: designTokens.fonts.heading,
              color: designTokens.colors.primary,
              margin: 0,
              marginBottom: designTokens.spacing.md,
            }}>Join Game</h2>
            <p style={{ color: designTokens.colors.textMuted, margin: 0, marginBottom: designTokens.spacing.md }}>Enter a game code to join</p>

            <form onSubmit={handleJoinGame} style={{ display: 'flex', flexDirection: 'column', gap: designTokens.spacing.md }}>
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="e.g., ABC123"
                maxLength={6}
                style={{
                  padding: designTokens.spacing.md,
                  backgroundColor: designTokens.colors.background,
                  border: `2px solid ${designTokens.colors.border}`,
                  borderRadius: '6px',
                  color: designTokens.colors.primary,
                  fontSize: '1.2rem',
                  textAlign: 'center',
                  fontFamily: 'monospace',
                  letterSpacing: '0.2em',
                  boxSizing: 'border-box',
                }}
              />
              <button
                type="submit"
                disabled={joinCode.length !== 6}
                style={{
                  padding: designTokens.spacing.md,
                  backgroundColor: joinCode.length === 6 ? designTokens.colors.primary : '#666666',
                  color: '#000000',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  cursor: joinCode.length === 6 ? 'pointer' : 'not-allowed',
                  transition: 'all 150ms ease',
                  fontFamily: designTokens.fonts.body,
                  fontSize: '1rem',
                }}
                onMouseEnter={(e) => joinCode.length === 6 && (e.target.style.backgroundColor = designTokens.colors.primaryHover)}
                onMouseLeave={(e) => joinCode.length === 6 && (e.target.style.backgroundColor = designTokens.colors.primary)}
              >
                Join Game
              </button>
            </form>
          </div>
        </div>

        {/* Recent Games */}
        {games.length > 0 && (
          <div style={{
            background: `linear-gradient(135deg, ${designTokens.colors.surfaceLight}, ${designTokens.colors.surface})`,
            border: `2px solid ${designTokens.colors.primary}`,
            borderRadius: '12px',
            padding: designTokens.spacing.lg,
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontFamily: designTokens.fonts.heading,
              color: designTokens.colors.primary,
              margin: 0,
              marginBottom: designTokens.spacing.lg,
            }}>Your Games</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: designTokens.spacing.md }}>
              {games.map((game) => (
                <div key={game.id} style={{
                  background: designTokens.colors.background,
                  border: `1px solid ${designTokens.colors.border}`,
                  borderRadius: '8px',
                  padding: designTokens.spacing.md,
                }}>
                  <p style={{ margin: 0, marginBottom: designTokens.spacing.xs, fontWeight: 'bold', color: designTokens.colors.primary }}>
                    Code: {game.invite_code}
                  </p>
                  <p style={{ margin: 0, marginBottom: designTokens.spacing.xs, color: designTokens.colors.textMuted, fontSize: '0.9rem' }}>
                    {game.game_type.toUpperCase()} • {game.status}
                  </p>
                  <p style={{ margin: 0, color: designTokens.colors.textMuted, fontSize: '0.85rem' }}>
                    {new Date(game.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
