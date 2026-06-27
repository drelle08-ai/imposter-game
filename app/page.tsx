'use client';

import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
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
          transition: all 0.3s ease;
        }
        .game-card:hover {
          transform: translateY(-10px) scale(1.02);
          box-shadow: 0 20px 40px rgba(212, 175, 55, 0.3);
        }
        .btn-gradient {
          background: linear-gradient(135deg, #d4af37 0%, #f0d966 100%);
        }
      `}</style>

      {/* Header */}
      <header className="border-b border-[#333] sticky top-0 bg-black/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-3xl font-bold text-[#d4af37]" style={{ fontFamily: 'Playfair Display' }}>
            🎮 THE GAME
          </div>
          <div className="flex gap-4">
            <Link href="/auth/login" className="text-[#d4af37] hover:text-[#f0d966]">
              Login
            </Link>
            <Link href="/auth/signup" className="btn-gradient text-black font-bold px-4 py-2 rounded">
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="hero-title text-6xl font-bold mb-6" style={{ fontFamily: 'Playfair Display' }}>
            THE GAME
          </h1>
          <p className="text-[#b8860b] text-2xl mb-4" style={{ fontFamily: 'Crimson Text' }}>
            Two Legendary Games. Endless Entertainment.
          </p>
          <p className="text-[#888] text-lg mb-8" style={{ fontFamily: 'Crimson Text' }}>
            Challenge your friends with premium multiplayer party games.
          </p>
          <Link
            href="/auth/signup"
            className="btn-gradient text-black font-bold py-4 px-8 rounded-lg text-lg inline-block"
          >
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Games */}
      <section className="py-20 px-4 bg-gradient-to-b from-black to-[#0a0a0a]">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-4xl font-bold text-center text-[#d4af37] mb-16" style={{ fontFamily: 'Playfair Display' }}>
            Choose Your Game
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Imposter */}
            <div className="game-card bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] border-2 border-blue-600 rounded-lg overflow-hidden shadow-2xl">
              <div className="bg-gradient-to-r from-blue-900 to-blue-700 p-8 text-center">
                <div className="text-6xl mb-4">🕵️</div>
                <h4 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display' }}>
                  Imposter
                </h4>
              </div>
              <div className="p-6">
                <p className="text-[#d4af37] mb-4 font-semibold" style={{ fontFamily: 'Crimson Text', fontSize: '1.1em' }}>
                  Spot the Imposter
                </p>
                <ul className="text-[#888] space-y-2 mb-6" style={{ fontFamily: 'Crimson Text' }}>
                  <li>✓ 4-8 players</li>
                  <li>✓ Find the imposter</li>
                  <li>✓ Strategic voting</li>
                  <li>✓ Multiple rounds</li>
                </ul>
                <Link
                  href="/auth/signup"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded block text-center"
                >
                  Sign Up to Play
                </Link>
              </div>
            </div>

            {/* Mafia */}
            <div className="game-card bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] border-2 border-purple-600 rounded-lg overflow-hidden shadow-2xl">
              <div className="bg-gradient-to-r from-purple-900 to-purple-700 p-8 text-center">
                <div className="text-6xl mb-4">🎭</div>
                <h4 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display' }}>
                  Mafia
                </h4>
              </div>
              <div className="p-6">
                <p className="text-[#d4af37] mb-4 font-semibold" style={{ fontFamily: 'Crimson Text', fontSize: '1.1em' }}>
                  Classic Deception Game
                </p>
                <ul className="text-[#888] space-y-2 mb-6" style={{ fontFamily: 'Crimson Text' }}>
                  <li>✓ 5-10 players</li>
                  <li>✓ Mafia vs Civilians</li>
                  <li>✓ Day/Night phases</li>
                  <li>✓ Elimination strategy</li>
                </ul>
                <Link
                  href="/auth/signup"
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 rounded block text-center"
                >
                  Sign Up to Play
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
