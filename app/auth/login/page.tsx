'use client';

import { useState } from 'react';
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
  },
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      router.push('/dashboard');
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: designTokens.colors.background,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: designTokens.spacing.md,
      fontFamily: designTokens.fonts.body,
    }}>
      <div style={{
        background: `linear-gradient(135deg, ${designTokens.colors.surfaceLight}, ${designTokens.colors.surface})`,
        border: `2px solid ${designTokens.colors.primary}`,
        borderRadius: '12px',
        boxShadow: `0 20px 60px rgba(0, 0, 0, 0.9)`,
        padding: designTokens.spacing.lg,
        width: '100%',
        maxWidth: '450px',
      }}>
        <div style={{ textAlign: 'center', marginBottom: designTokens.spacing.lg }}>
          <div style={{ fontSize: '3rem', marginBottom: designTokens.spacing.sm }}>🎮</div>
          <h1 style={{
            fontSize: '2rem',
            fontFamily: designTokens.fonts.heading,
            color: designTokens.colors.primary,
            margin: 0,
            marginBottom: designTokens.spacing.xs,
            letterSpacing: '0.05em',
          }}>Welcome Back</h1>
          <p style={{
            color: designTokens.colors.textSecondary,
            margin: 0,
            fontSize: '0.95rem',
          }}>Enter if you dare</p>
        </div>

        {error && (
          <div style={{
            backgroundColor: 'rgba(220, 38, 38, 0.1)',
            border: `1px solid ${designTokens.colors.error}`,
            color: '#fca5a5',
            padding: designTokens.spacing.md,
            borderRadius: '6px',
            marginBottom: designTokens.spacing.md,
            fontSize: '0.9rem',
          }}>{error}</div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: designTokens.spacing.md }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.9rem',
              fontWeight: '600',
              color: designTokens.colors.primary,
              marginBottom: designTokens.spacing.xs,
            }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: designTokens.spacing.md,
                backgroundColor: designTokens.colors.background,
                border: `2px solid ${designTokens.colors.border}`,
                borderRadius: '6px',
                color: designTokens.colors.text,
                fontSize: '1rem',
                boxSizing: 'border-box',
              }}
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '0.9rem',
              fontWeight: '600',
              color: designTokens.colors.primary,
              marginBottom: designTokens.spacing.xs,
            }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: designTokens.spacing.md,
                backgroundColor: designTokens.colors.background,
                border: `2px solid ${designTokens.colors.border}`,
                borderRadius: '6px',
                color: designTokens.colors.text,
                fontSize: '1rem',
                boxSizing: 'border-box',
              }}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              background: loading ? '#666666' : `linear-gradient(135deg, ${designTokens.colors.primary}, ${designTokens.colors.primaryHover})`,
              color: '#000000',
              padding: designTokens.spacing.md,
              borderRadius: '6px',
              border: 'none',
              fontWeight: 'bold',
              fontSize: '1rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: designTokens.fonts.body,
            }}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <p style={{
          textAlign: 'center',
          color: designTokens.colors.textMuted,
          marginTop: designTokens.spacing.lg,
          fontSize: '0.9rem',
        }}>
          New player?{' '}
          <Link href="/auth/signup" style={{
            color: designTokens.colors.primary,
            textDecoration: 'none',
            fontWeight: 'bold',
          }}>Create Account</Link>
        </p>
      </div>
    </div>
  );
}
