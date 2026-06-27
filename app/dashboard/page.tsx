'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

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
  host_id: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [joinCode, setJoinCode] = useState('');
  const [joiningGame, setJoiningGame] = useState(false);
  const [selectedGameType, setSelectedGameType] = useState<'imposter' | 'mafia' | 'love'>('imposter');

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push('/auth/login');
        return;
      }

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
      setLoading(false);
    };

    checkAuth();
  }, [router]);

  const handleCreateGame = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) return;

    // Love Match uses a different table and flow
    if (selectedGameType === 'love') {
      try {
        const res = await fetch('/api/games/love/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: session.user.id,
            maxRounds: 10,
            maxCouples: 8,
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          alert('Failed to create game: ' + (data.error || 'Unknown error'));
          return;
        }

        const data = await res.json();
        router.push(`/games/${data.room.roomCode}/love`);
        return;
      } catch (error) {
        alert('Error creating game: ' + String(error));
        return;
      }
    }

    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const { data: gameData, error } = await supabase
      .from('games')
      .insert({
        host_id: session.user.id,
        game_type: selectedGameType,
        status: 'lobby',
        invite_code: inviteCode,
        max_players: 8,
        max_rounds: selectedGameType === 'mafia' ? 5 : 3,
        current_round: 1,
      })
      .select()
      .single();

    if (error) {
      alert('Failed to create game: ' + error.message);
      return;
    }

    router.push(`/games/${inviteCode}`);
  };

  const handleJoinGame = async (e: React.FormEvent) => {
    e.preventDefault();
    setJoiningGame(true);

    const { data: gameData, error } = await supabase
      .from('games')
      .select('*')
      .eq('invite_code', joinCode.toUpperCase())
      .single();

    if (error || !gameData) {
      alert('Game not found. Check the invite code.');
      setJoiningGame(false);
      return;
    }

    router.push(`/games/${joinCode.toUpperCase()}`);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-[#d4af37] text-xl" style={{fontFamily: 'Crimson Text', fontSize: '1.5em'}}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black" style={{ width: '100%' }}>
      <div className="px-4 py-8" style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        {/* Header */}
        <div className="flex justify-between items-center mb-12 pb-8 border-b-2 border-[#d4af37]">
          <div>
            <h1 className="text-5xl font-bold text-[#d4af37]" style={{fontFamily: 'Playfair Display'}}>🎭 THE GAME</h1>
            <p className="text-[#b8860b] mt-2" style={{fontFamily: 'Crimson Text', fontSize: '1.2em'}}>Welcome back, {user?.username}</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-900 hover:bg-red-800 text-[#d4af37] font-bold py-2 px-6 border border-[#d4af37] rounded transition transform hover:scale-105"
          >
            Exit
          </button>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Create Game Card */}
          <div className="bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] border-2 border-[#d4af37] rounded-lg shadow-2xl p-8">
            <h2 className="text-3xl font-bold text-[#d4af37] mb-4" style={{fontFamily: 'Playfair Display'}}>Create Operation</h2>
            <p className="text-[#888] mb-6" style={{fontFamily: 'Crimson Text', fontSize: '1.1em'}}>Select a game and begin</p>

            {/* Game Type Selection */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <button
                onClick={() => setSelectedGameType('imposter')}
                className={`py-3 px-4 rounded font-bold transition transform hover:scale-105 ${
                  selectedGameType === 'imposter'
                    ? 'bg-[#d4af37] text-black'
                    : 'bg-[#3a3a3a] text-[#d4af37] border border-[#d4af37]'
                }`}
              >
                🕵️ Imposter
              </button>
              <button
                onClick={() => setSelectedGameType('mafia')}
                className={`py-3 px-4 rounded font-bold transition transform hover:scale-105 ${
                  selectedGameType === 'mafia'
                    ? 'bg-[#d4af37] text-black'
                    : 'bg-[#3a3a3a] text-[#d4af37] border border-[#d4af37]'
                }`}
              >
                🎭 Mafia
              </button>
              <button
                onClick={() => setSelectedGameType('love')}
                className={`py-3 px-4 rounded font-bold transition transform hover:scale-105 ${
                  selectedGameType === 'love'
                    ? 'bg-[#d4af37] text-black'
                    : 'bg-[#3a3a3a] text-[#d4af37] border border-[#d4af37]'
                }`}
              >
                ❤️ Love Match
              </button>
            </div>

            <button
              onClick={handleCreateGame}
              className="w-full bg-[#d4af37] hover:bg-[#f0d966] text-black font-bold py-3 rounded transition transform hover:scale-105"
            >
              Create
            </button>
          </div>

          {/* Join Game Card */}
          <div className="bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] border-2 border-[#d4af37] rounded-lg shadow-2xl p-8">
            <h2 className="text-3xl font-bold text-[#d4af37] mb-4" style={{fontFamily: 'Playfair Display'}}>Join Operation</h2>
            <p className="text-[#888] mb-6" style={{fontFamily: 'Crimson Text', fontSize: '1.1em'}}>Enter the operation code</p>
            <form onSubmit={handleJoinGame} className="space-y-3">
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="e.g., ABC123"
                maxLength={6}
                className="w-full px-4 py-3 bg-[#3a3a3a] border-2 border-[#d4af37] text-[#d4af37] rounded focus:outline-none focus:ring-2 focus:ring-[#f0d966] text-center text-lg font-mono"
              />
              <button
                type="submit"
                disabled={joiningGame || joinCode.length !== 6}
                className="w-full bg-[#d4af37] hover:bg-[#f0d966] disabled:bg-gray-600 text-black font-bold py-3 rounded transition transform hover:scale-105"
              >
                {joiningGame ? 'Joining...' : 'Join'}
              </button>
            </form>
          </div>
        </div>

        {/* Games History */}
        {games.length > 0 && (
          <div className="bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] border-2 border-[#d4af37] rounded-lg shadow-2xl p-8">
            <h2 className="text-3xl font-bold text-[#d4af37] mb-6" style={{fontFamily: 'Playfair Display'}}>Your Operations</h2>
            <div className="space-y-3">
              {games.map((game) => (
                <Link
                  key={game.id}
                  href={`/games/${game.invite_code}`}
                  className="block p-4 border border-[#d4af37] rounded hover:bg-[#3a3a3a] transition cursor-pointer transform hover:scale-102"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-[#d4af37]">Code: {game.invite_code}</p>
                      <p className="text-sm text-[#888] capitalize">
                        {game.status} • {new Date(game.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="bg-[#d4af37] text-black px-3 py-1 rounded-full text-sm font-medium">
                      {game.game_type}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
