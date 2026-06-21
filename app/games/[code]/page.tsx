'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface GameData {
  id: string;
  invite_code: string;
  status: string;
  host_id: string;
  game_type: string;
}

interface Player {
  id: string;
  user_id: string;
  role: string;
  is_alive: boolean;
  joined_at: string;
  users?: {
    username: string;
  };
}

interface CurrentUser {
  id: string;
  username: string;
}

export default function GameLobbyPage() {
  const router = useRouter();
  const params = useParams();
  const code = params.code as string;

  const [game, setGame] = useState<GameData | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isHost, setIsHost] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [error, setError] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guests, setGuests] = useState<Array<{ name: string; phone: string }>>([]);

  useEffect(() => {
    const loadGame = async () => {
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

      setCurrentUser(userData);

      const { data: gameData, error: gameError } = await supabase
        .from('games')
        .select('*')
        .eq('invite_code', code.toUpperCase())
        .single();

      if (gameError || !gameData) {
        setError('Game not found');
        setLoading(false);
        return;
      }

      setGame(gameData);
      setIsHost(gameData.host_id === session.user.id);

      const { data: playersData } = await supabase
        .from('game_players')
        .select(
          `
          id,
          user_id,
          role,
          is_alive,
          joined_at,
          guest_name,
          guest_phone,
          users(username)
        `
        )
        .eq('game_id', gameData.id);

      setPlayers((playersData as any) || []);

      const isAlreadyJoined = (playersData as any)?.some((p: any) => p.user_id === session.user.id);
      setIsJoined(!!isAlreadyJoined);

      setLoading(false);
    };

    loadGame();

    const subscription = supabase
      .channel(`game:${code}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'game_players' },
        () => {
          loadGame();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [code, router]);

  const handleJoinGame = async () => {
    if (!game || !currentUser) return;

    const { error } = await supabase.from('game_players').insert({
      game_id: game.id,
      user_id: currentUser.id,
      role: 'unassigned',
      is_alive: true,
    });

    if (error) {
      setError('Failed to join game: ' + error.message);
      return;
    }

    setIsJoined(true);

    const { data: playersData } = await supabase
      .from('game_players')
      .select(
        `
        id,
        user_id,
        role,
        is_alive,
        joined_at,
        users(username)
      `
      )
      .eq('game_id', game.id);

    setPlayers((playersData as any) || []);
  };

  const handleAddGuest = async () => {
    if (!game || !guestName.trim() || !guestPhone.trim()) {
      setError('Please enter guest name and phone number');
      return;
    }

    const { error } = await supabase.from('game_players').insert({
      game_id: game.id,
      guest_name: guestName,
      guest_phone: guestPhone,
      role: 'unassigned',
      is_alive: true,
    });

    if (error) {
      setError('Failed to add guest: ' + error.message);
      return;
    }

    setGuests([...guests, { name: guestName, phone: guestPhone }]);
    setGuestName('');
    setGuestPhone('');

    // Reload players
    const { data: playersData } = await supabase
      .from('game_players')
      .select(
        `
        id,
        user_id,
        role,
        is_alive,
        joined_at,
        guest_name,
        guest_phone,
        users(username)
      `
      )
      .eq('game_id', game.id);

    setPlayers((playersData as any) || []);
  };

  const handleStartGame = async () => {
    if (!game) return;

    try {
      const res = await fetch('/api/games/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId: game.id }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError('Failed to start game: ' + (data.error || 'Unknown error'));
        return;
      }

      const { error } = await supabase
        .from('games')
        .update({ status: 'in_progress', started_at: new Date().toISOString() })
        .eq('id', game.id);

      if (error) {
        setError('Failed to update game: ' + error.message);
        return;
      }

      router.push(`/games/${game.invite_code}/play`);
    } catch (err) {
      setError('Error starting game: ' + String(err));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
        <div className="text-white text-xl">Loading game lobby...</div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{error || 'Game not found'}</p>
          <Link
            href="/dashboard"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg inline-block"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-600 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <Link href="/dashboard" className="text-white hover:text-blue-100 font-semibold">
            ← Back
          </Link>
          <h1 className="text-3xl font-bold text-white">Game Lobby</h1>
          <div className="w-20"></div>
        </div>

        {/* Game Info Card */}
        <div className="bg-white rounded-lg shadow-xl p-8 mb-6">
          <div className="text-center mb-6">
            <h2 className="text-4xl font-bold text-gray-800 mb-2">{game.invite_code}</h2>
            <p className="text-gray-600">Game Invite Code</p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg mb-6 text-center">
            <button
              onClick={() => {
                navigator.clipboard.writeText(
                  `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/games/${game.invite_code}`
                );
                alert('Invite link copied!');
              }}
              className="text-blue-600 hover:text-blue-800 font-semibold"
            >
              Copy Invite Link
            </button>
          </div>

          {!isJoined && (
            <button
              onClick={handleJoinGame}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition mb-4"
            >
              Join Game
            </button>
          )}
        </div>

        {/* Guest Management (Host Only) */}
        {isHost && isJoined && (
          <div className="bg-white rounded-lg shadow-xl p-8 mb-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Add Guests</h3>
            <div className="space-y-3 mb-4">
              <input
                type="text"
                placeholder="Guest name"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="tel"
                placeholder="Phone number (e.g., +14075551234)"
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleAddGuest}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition"
              >
                Add Guest
              </button>
            </div>
          </div>
        )}

        {/* Players Card */}
        <div className="bg-white rounded-lg shadow-xl p-8 mb-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            Players ({players.length})
          </h3>
          <div className="space-y-2">
            {players.length === 0 ? (
              <p className="text-gray-600 text-center py-4">Waiting for players to join...</p>
            ) : (
              players.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                >
                  <span className="font-semibold text-gray-800">
                    {(player as any).guest_name || player.users?.username}
                    {currentUser?.id === player.user_id && ' (You)'}
                    {game.host_id === player.user_id && (
                      <span className="ml-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                        Host
                      </span>
                    )}
                    {(player as any).guest_name && (
                      <span className="ml-2 bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                        Guest
                      </span>
                    )}
                  </span>
                  <span className={player.is_alive ? 'text-green-600' : 'text-red-600'}>
                    {player.is_alive ? '✓ Alive' : '✗ Dead'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Host Controls */}
        {isHost && isJoined && (
          <div className="bg-white rounded-lg shadow-xl p-8">
            <button
              onClick={handleStartGame}
              disabled={players.length < 3}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition text-lg"
            >
              {players.length < 3
                ? `Start Game (Need ${3 - players.length} more players)`
                : 'Start Game'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
