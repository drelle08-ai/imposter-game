'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

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
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] border-2 border-[#d4af37] rounded-lg shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-[#d4af37] mb-2" style={{fontFamily: 'Playfair Display'}}>🎮</h1>
          <h2 className="text-3xl font-bold text-[#d4af37]" style={{fontFamily: 'Playfair Display'}}>Create Account</h2>
          <p className="text-[#b8860b] mt-2 text-sm" style={{fontFamily: 'Crimson Text', fontSize: '1.1em'}}>Join The Game</p>
        </div>

        {error && (
          <div className="bg-red-900 border border-red-600 text-red-200 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#d4af37] mb-2">Name</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-2 bg-[#3a3a3a] border border-[#d4af37] text-white rounded focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
              placeholder="Your name"
            />
          </div>

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

          <div>
            <label className="block text-sm font-medium text-[#d4af37] mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 bg-[#3a3a3a] border border-[#d4af37] text-white rounded focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#d4af37] hover:bg-[#f0d966] disabled:bg-gray-600 text-black font-bold py-3 rounded transition transform hover:scale-105"
          >
            {loading ? 'Processing...' : 'Join'}
          </button>
        </form>

        <p className="text-center text-[#888] mt-6 text-sm">
          Already connected?{' '}
          <Link href="/auth/login" className="text-[#d4af37] hover:text-[#f0d966] font-medium transition">
            Enter
          </Link>
        </p>
      </div>
    </div>
  );
}
