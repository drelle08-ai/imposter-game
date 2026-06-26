'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/auth/reset-password`,
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      setSuccess('Password reset link sent! Check your email.');
      setEmail('');
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] border-2 border-[#d4af37] rounded-lg shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-[#d4af37] mb-2" style={{fontFamily: 'Playfair Display'}}>🔐</h1>
          <h2 className="text-3xl font-bold text-[#d4af37]" style={{fontFamily: 'Playfair Display'}}>Access Recovery</h2>
          <p className="text-[#b8860b] mt-2 text-sm" style={{fontFamily: 'Crimson Text', fontSize: '1.1em'}}>Reclaim your connection</p>
        </div>

        {error && (
          <div className="bg-red-900 border border-red-600 text-red-200 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-900 border border-green-600 text-green-200 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#d4af37] mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 bg-[#3a3a3a] border border-[#d4af37] text-white rounded focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
              placeholder="your@email.com"
            />
          </div>

          <p className="text-sm text-[#888] mb-4" style={{fontFamily: 'Crimson Text', fontSize: '1.1em'}}>
            We'll send you a reset link.
          </p>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#d4af37] hover:bg-[#f0d966] disabled:bg-gray-600 text-black font-bold py-3 rounded transition transform hover:scale-105"
          >
            {loading ? 'Sending...' : 'Send Recovery Link'}
          </button>
        </form>

        <p className="text-center text-[#888] mt-6 text-sm">
          Back to the game?{' '}
          <Link href="/auth/login" className="text-[#d4af37] hover:text-[#f0d966] font-medium transition">
            Enter
          </Link>
        </p>
      </div>
    </div>
  );
}
