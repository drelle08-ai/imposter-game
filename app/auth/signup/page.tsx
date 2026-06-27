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

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      if (authData.user) {
        const { error: dbError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email,
            username,
          });

        if (dbError) {
          setError(dbError.message);
          return;
        }

        router.push('/auth/login');
      }
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
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: designTokens.spacing.lg }}>
          <div style={{
            fontSize: '3rem',
            marginBottom: designTokens.spacing.sm,
          }}>
            🎮
          </div>
          <h1 style={{
            fontSize: '2rem',
            fontFamily: designTokens.fonts.heading,
            color: designTokens.colors.primary,
            margin: 0,
            marginBottom: designTokens.spacing.xs,
            letterSpacing: '0.05em',
          }}>
            Create Account
          </h1>
          <p style={{
            color: designTokens.colors.textSecondary,
            margin: 0,
            fontSize: '0.95rem',
          }}>
            Join The Game
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            backgroundColor: 'rgba(220, 38, 38, 0.1)',
            border: `1px solid ${designTokens.colors.error}`,
            color: '#fca5a5',
            padding: designTokens.spacing.md,
            borderRadius: '6px',
            marginBottom: designTokens.spacing.md,
            fontSize: '0.9rem',
          }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: designTokens.spacing.md }}>
          {/* Username */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.9rem',
              fontWeight: '600',
              color: designTokens.colors.primary,
              marginBottom: designTokens.spacing.xs,
            }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{
                width: '100%',
                padding: designTokens.spacing.md,
                backgroundColor: designTokens.colors.background,
                border: `2px solid ${designTokens.colors.border}`,
                borderRadius: '6px',
                color: designTokens.colors.text,
                fontSize: '1rem',
                transition: 'border-color 150ms ease',
                boxSizing: 'border-box',
              }}
              placeholder="Your username"
              onFocus={(e) => e.target.style.borderColor = designTokens.colors.primaryHover}
              onBlur={(e) => e.target.style.borderColor = designTokens.colors.border}
            />
          </div>

          {/* Email */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.9rem',
              fontWeight: '600',
              color: designTokens.colors.primary,
              marginBottom: designTokens.spacing.xs,
            }}>
              Email
            </label>
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
                transition: 'border-color 150ms ease',
                boxSizing: 'border-box',
              }}
              placeholder="your@email.com"
              onFocus={(e) => e.target.style.borderColor = designTokens.colors.primaryHover}
              onBlur={(e) => e.target.style.borderColor = designTokens.colors.border}
            />
          </div>

          {/* Password */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.9rem',
              fontWeight: '600',
              color: designTokens.colors.primary,
              marginBottom: designTokens.spacing.xs,
            }}>
              Password
            </label>
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
                transition: 'border-color 150ms ease',
                boxSizing: 'border-box',
              }}
              placeholder="••••••••"
              onFocus={(e) => e.target.style.borderColor = designTokens.colors.primaryHover}
              onBlur={(e) => e.target.style.borderColor = designTokens.colors.border}
            />
          </div>

          {/* Submit Button */}
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
              transition: 'transform 150ms ease',
              fontFamily: designTokens.fonts.body,
            }}
            onMouseEnter={(e) => !loading && (e.target.style.transform = 'scale(1.02)')}
            onMouseLeave={(e) => !loading && (e.target.style.transform = 'scale(1)')}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        {/* Footer */}
        <p style={{
          textAlign: 'center',
          color: designTokens.colors.textMuted,
          marginTop: designTokens.spacing.lg,
          fontSize: '0.9rem',
        }}>
          Already have an account?{' '}
          <Link href="/auth/login" style={{
            color: designTokens.colors.primary,
            textDecoration: 'none',
            fontWeight: 'bold',
            transition: 'color 150ms ease',
          }} onMouseEnter={(e) => e.target.style.color = designTokens.colors.primaryHover} onMouseLeave={(e) => e.target.style.color = designTokens.colors.primary}>
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
