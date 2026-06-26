'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      const { error: authError } = await supabase.auth.updateUser({
        password: password,
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      setSuccess('Password reset successfully! Redirecting to login...');
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
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
          <h1 className="text-5xl font-bold text-[#d4af37] mb-2" style={{fontFamily: 'Playfair Display'}}>🔓</h1>
          <h2 className="text-3xl font-bold text-[#d4af37]" style={{fontFamily: 'Playfair Display'}}>New Access Code</h2>
          <p className="text-[#b8860b] mt-2 text-sm" style={{fontFamily: 'Crimson Text', fontSize: '1.1em'}}>Secure your connection</p>
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
            <label className="block text-sm font-medium text-[#d4af37] mb-2">New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 bg-[#3a3a3a] border border-[#d4af37] text-white rounded focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#d4af37] mb-2">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-2 bg-[#3a3a3a] border border-[#d4af37] text-white rounded focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
              placeholder="••••••••"
            />
          </div>

          <p className="text-xs text-[#888]">
            Minimum 8 characters required.
          </p>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#d4af37] hover:bg-[#f0d966] disabled:bg-gray-600 text-black font-bold py-3 rounded transition transform hover:scale-105"
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>

        <p className="text-center text-[#888] mt-6 text-sm">
          <Link href="/auth/login" className="text-[#d4af37] hover:text-[#f0d966] font-medium transition">
            Return to Entry
          </Link>
        </p>
      </div>
    </div>
  );
}
