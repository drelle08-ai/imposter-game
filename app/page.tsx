'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface User {
  id: string;
  username: string;
}

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          setUser({
            id: session.user.id,
            username: session.user.email?.split('@')[0] || 'Player',
          });
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-[#d4af37] text-2xl" style={{ fontFamily: 'Playfair Display', letterSpacing: '0.1em' }}>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        .hero-title {
          animation: slideIn 0.8s ease-out;
          background: linear-gradient(135deg, #d4af37 0%, #f0d966 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .game-card {
          animation: slideIn 0.6s ease-out forwards;
          opacity: 0;
          transform: perspective(1000px) rotateY(0deg);
          transition: all 0.3s ease;
        }

        .game-card:nth-child(1) { animation-delay: 0.2s; }
        .game-card:nth-child(2) { animation-delay: 0.4s; }
        .game-card:nth-child(3) { animation-delay: 0.6s; }

        .game-card:hover {
          transform: translateY(-10px) scale(1.02);
          box-shadow: 0 20px 40px rgba(212, 175, 55, 0.3);
        }

        .floating {
          animation: float 3s ease-in-out infinite;
        }

        .btn-gradient {
          background: linear-gradient(135deg, #d4af37 0%, #f0d966 100%);
        }
      `}</style>

      {/* Navigation */}
      <nav className="border-b border-[#d4af37] bg-black bg-opacity-50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-[#d4af37]" style={{ fontFamily: 'Playfair Display', letterSpacing: '0.1em' }}>
            🎮 THE GAME
          </h1>
          <div className="flex gap-4 items-center">
            {user ? (
              <>
                <span className="text-[#b8860b]" style={{ fontFamily: 'Crimson Text', fontSize: '1.1em' }}>
                  {user.username}
                </span>
                <Link
                  href="/dashboard"
                  className="bg-[#d4af37] hover:bg-[#f0d966] text-black font-bold py-2 px-4 rounded transition transform hover:scale-105"
                >
                  Dashboard
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-[#d4af37] hover:text-[#f0d966] font-bold transition"
                >
                  Login
                </Link>
                <Link
                  href="/auth/signup"
                  className="bg-[#d4af37] hover:bg-[#f0d966] text-black font-bold py-2 px-4 rounded transition transform hover:scale-105"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-96 flex items-center justify-center px-4 py-20">
        <div className="text-center max-w-4xl">
          <div className="floating mb-6">
            <div className="text-7xl md:text-8xl mb-4">🎭</div>
          </div>
          <h2 className="hero-title text-5xl md:text-7xl font-bold mb-6" style={{ fontFamily: 'Playfair Display', letterSpacing: '0.15em' }}>
            THE GAME
          </h2>
          <p className="text-[#b8860b] text-lg md:text-2xl mb-8" style={{ fontFamily: 'Crimson Text', fontSize: '1.2em' }}>
            Two Legendary Games. Endless Entertainment.
          </p>
          <p className="text-[#888] text-base md:text-lg max-w-2xl mx-auto mb-10" style={{ fontFamily: 'Crimson Text', fontSize: '1.1em' }}>
            Challenge your friends and family with our collection of premium multiplayer party games. Perfect for game nights, team building, or just having fun.
          </p>

          {user ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/dashboard"
                className="btn-gradient text-black font-bold py-4 px-8 rounded-lg transition transform hover:scale-105 text-lg"
                style={{ fontFamily: 'Crimson Text', fontSize: '1.1em', letterSpacing: '0.05em' }}
              >
                🎮 Play Now
              </Link>
            </div>
          ) : (
            <Link
              href="/auth/signup"
              className="btn-gradient text-black font-bold py-4 px-8 rounded-lg transition transform hover:scale-105 text-lg inline-block"
              style={{ fontFamily: 'Crimson Text', fontSize: '1.1em', letterSpacing: '0.05em' }}
            >
              Get Started Free
            </Link>
          )}
        </div>
      </section>

      {/* Games Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-black to-[#0a0a0a]">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-4xl font-bold text-center text-[#d4af37] mb-16" style={{ fontFamily: 'Playfair Display', letterSpacing: '0.1em' }}>
            Choose Your Game
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* IMPOSTER CARD */}
            <div className="game-card bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] border-2 border-blue-600 rounded-lg overflow-hidden shadow-2xl">
              <div className="bg-gradient-to-r from-blue-900 to-blue-700 p-8 text-center">
                <div className="text-6xl mb-4">🕵️</div>
                <h4 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Playfair Display' }}>
                  Imposter
                </h4>
              </div>
              <div className="p-6">
                <p className="text-[#d4af37] mb-4 font-semibold" style={{ fontFamily: 'Crimson Text', fontSize: '1.1em' }}>
                  Spot the Imposter
                </p>
                <ul className="text-[#888] space-y-2 mb-6 text-sm" style={{ fontFamily: 'Crimson Text', fontSize: '1em' }}>
                  <li>✓ 4-8 players</li>
                  <li>✓ Find the imposter among crew</li>
                  <li>✓ Strategic voting & discussion</li>
                  <li>✓ Multiple rounds</li>
                </ul>
                {user ? (
                  <Link
                    href="/dashboard"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded transition transform hover:scale-105 block text-center"
                  >
                    Play Imposter
                  </Link>
                ) : (
                  <Link
                    href="/auth/signup"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded transition transform hover:scale-105 block text-center"
                  >
                    Sign Up to Play
                  </Link>
                )}
              </div>
            </div>

            {/* MAFIA CARD */}
            <div className="game-card bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] border-2 border-purple-600 rounded-lg overflow-hidden shadow-2xl">
              <div className="bg-gradient-to-r from-purple-900 to-purple-700 p-8 text-center">
                <div className="text-6xl mb-4">🎭</div>
                <h4 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Playfair Display' }}>
                  Mafia
                </h4>
              </div>
              <div className="p-6">
                <p className="text-[#d4af37] mb-4 font-semibold" style={{ fontFamily: 'Crimson Text', fontSize: '1.1em' }}>
                  Classic Deception Game
                </p>
                <ul className="text-[#888] space-y-2 mb-6 text-sm" style={{ fontFamily: 'Crimson Text', fontSize: '1em' }}>
                  <li>✓ 5-10 players</li>
                  <li>✓ Mafia vs Civilians</li>
                  <li>✓ Day/Night phases</li>
                  <li>✓ Elimination strategy</li>
                </ul>
                {user ? (
                  <Link
                    href="/dashboard"
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 rounded transition transform hover:scale-105 block text-center"
                  >
                    Play Mafia
                  </Link>
                ) : (
                  <Link
                    href="/auth/signup"
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 rounded transition transform hover:scale-105 block text-center"
                  >
                    Sign Up to Play
                  </Link>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-4xl font-bold text-center text-[#d4af37] mb-16" style={{ fontFamily: 'Playfair Display', letterSpacing: '0.1em' }}>
            Premium Features
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex gap-4 items-start">
              <div className="text-3xl">🌍</div>
              <div>
                <h4 className="text-xl font-bold text-[#d4af37] mb-2" style={{ fontFamily: 'Playfair Display' }}>
                  Real-Time Multiplayer
                </h4>
                <p className="text-[#888]" style={{ fontFamily: 'Crimson Text', fontSize: '1.1em' }}>
                  Play with friends anywhere, anytime. Instant sync across all devices.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="text-3xl">🎨</div>
              <div>
                <h4 className="text-xl font-bold text-[#d4af37] mb-2" style={{ fontFamily: 'Playfair Display' }}>
                  Premium Design
                </h4>
                <p className="text-[#888]" style={{ fontFamily: 'Crimson Text', fontSize: '1.1em' }}>
                  Beautiful, intuitive interface with smooth animations.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="text-3xl">📱</div>
              <div>
                <h4 className="text-xl font-bold text-[#d4af37] mb-2" style={{ fontFamily: 'Playfair Display' }}>
                  Mobile Optimized
                </h4>
                <p className="text-[#888]" style={{ fontFamily: 'Crimson Text', fontSize: '1.1em' }}>
                  Play on phone, tablet, or desktop. Fully responsive.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="text-3xl">⚡</div>
              <div>
                <h4 className="text-xl font-bold text-[#d4af37] mb-2" style={{ fontFamily: 'Playfair Display' }}>
                  Lightning Fast
                </h4>
                <p className="text-[#888]" style={{ fontFamily: 'Crimson Text', fontSize: '1.1em' }}>
                  No lag, no delays. Real-time updates powered by Supabase.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#d4af37] bg-black py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[#888]" style={{ fontFamily: 'Crimson Text', fontSize: '1em' }}>
            © 2026 The Game. All rights reserved.
          </p>
          <div className="flex gap-6">
            <span className="text-[#d4af37] text-sm">Made with ❤️ by Claude</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
