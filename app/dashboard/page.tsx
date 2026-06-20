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

    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const { data: gameData, error } = await supabase
      .from('games')
      .insert({
        host_id: session.user.id,
        game_type: 'imposter',
        status: 'lobby',
        invite_code: inviteCode,
        max_players: 8,
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
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-600">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white">Imposter</h1>
            <p className="text-blue-100">Welcome, {user?.username}!</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition"
          >
            Logout
          </button>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Create Game Card */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Create Game</h2>
            <p className="text-gray-600 mb-6">Host a new Imposter game and invite your friends</p>
            <button
              onClick={handleCreateGame}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition text-lg"
            >
              Create New Game
            </button>
          </div>

          {/* Join Game Card */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Join Game</h2>
            <p className="text-gray-600 mb-4">Enter the 6-character invite code from your friend</p>
            <form onSubmit={handleJoinGame} className="space-y-3">
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="e.g., ABC123"
                maxLength={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-lg font-mono"
              />
              <button
                type="submit"
                disabled={joiningGame || joinCode.length !== 6}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-2 rounded-lg transition"
              >
                {joiningGame ? 'Joining...' : 'Join Game'}
              </button>
            </form>
          </div>
        </div>

        {/* Games History */}
        {games.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Games</h2>
            <div className="space-y-3">
              {games.map((game) => (
                <Link
                  key={game.id}
                  href={`/games/${game.invite_code}`}
                  className="block p-4 border border-gray-200 rounded-lg hover:bg-blue-50 transition cursor-pointer"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-gray-800">Code: {game.invite_code}</p>
                      <p className="text-sm text-gray-600 capitalize">
                        Status: {game.status} • Created: {new Date(game.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
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
