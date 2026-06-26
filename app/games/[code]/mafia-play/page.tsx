'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface GameData {
  id: string;
  invite_code: string;
  status: string;
  current_round: number;
  max_rounds: number;
  host_id: string;
}

interface GameRound {
  id: string;
  round_number: number;
  phase: 'night' | 'day';
  mafia_killed_player: string | null;
  doctor_saved_player: string | null;
  sheriff_investigated_player: string | null;
  investigation_result: boolean | null;
}

interface Player {
  id: string;
  user_id: string | null;
  role: 'mafia' | 'doctor' | 'sheriff' | 'civilian' | 'unassigned';
  is_alive: boolean;
  guest_name?: string;
  users?: {
    username: string;
  };
}

interface CurrentUser {
  id: string;
  username: string;
}

export default function MafiaPlayPage() {
  const router = useRouter();
  const params = useParams();
  const code = params.code as string;

  const [game, setGame] = useState<GameData | null>(null);
  const [currentRound, setCurrentRound] = useState<GameRound | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [currentPlayerData, setCurrentPlayerData] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAdvancingPhase, setIsAdvancingPhase] = useState(false);

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

      const { data: gameData } = await supabase
        .from('games')
        .select('*')
        .eq('invite_code', code.toUpperCase())
        .single();

      if (!gameData) {
        setError('Game not found');
        setLoading(false);
        return;
      }

      setGame(gameData);

      const { data: roundData } = await supabase
        .from('game_rounds')
        .select('*')
        .eq('game_id', gameData.id)
        .eq('round_number', gameData.current_round);

      if (roundData && roundData.length > 0) {
        setCurrentRound(roundData[0]);
      }

      const { data: playersData } = await supabase
        .from('game_players')
        .select(`id, user_id, role, is_alive, guest_name, users(username)`)
        .eq('game_id', gameData.id);

      setPlayers((playersData as any) || []);

      const currentPlayer = (playersData as any)?.find((p: any) => p.user_id === session.user.id);
      setCurrentPlayerData(currentPlayer || null);

      setLoading(false);
    };

    loadGame();

    const subscription = supabase
      .channel(`game:${code}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'game_players' }, () => {
        loadGame();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'game_rounds' }, () => {
        loadGame();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [code, router]);

  const advancePhase = async () => {
    if (isAdvancingPhase || !game) return;
    setIsAdvancingPhase(true);

    try {
      await fetch('/api/games/advance-phase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId: game.id, gameType: 'mafia' }),
      });
    } catch (err) {
      console.error('Failed to advance phase:', err);
    }
    setIsAdvancingPhase(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-600 to-purple-600 flex items-center justify-center">
        <div className="text-white text-xl">Loading game...</div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-600 to-purple-600 flex items-center justify-center p-4">
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

  if (game?.status === 'ended') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-600 to-purple-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">🎭 Game Over!</h2>
          <p className="text-gray-600 mb-6">Game completed after {game.current_round} rounds</p>
          <Link
            href="/dashboard"
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg inline-block"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const aliveCount = players.filter((p) => p.is_alive).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 to-purple-600 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">🎭 Mafia</h1>
            <p className="text-red-100">Round {game.current_round} / {game.max_rounds}</p>
          </div>
          <div className="text-white text-right">
            <p className="text-sm text-red-100">Players Alive: {aliveCount}</p>
            <p className="text-2xl font-bold">{aliveCount} / {players.length}</p>
          </div>
        </div>

        {/* Your Role */}
        {currentPlayerData && (
          <div
            className={`mb-6 rounded-lg shadow-xl p-6 text-center text-white ${
              currentPlayerData.role === 'mafia'
                ? 'bg-red-600'
                : currentPlayerData.role === 'sheriff'
                  ? 'bg-blue-600'
                  : currentPlayerData.role === 'doctor'
                    ? 'bg-green-600'
                    : 'bg-gray-600'
            }`}
          >
            <p className="text-sm mb-1">Your Role</p>
            <p className="text-3xl font-bold capitalize">{currentPlayerData.role}</p>
          </div>
        )}

        {/* Phase Control */}
        {currentRound && (
          <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 capitalize">
                {currentRound.phase} Phase
              </h2>
              {currentRound.phase === 'night' && (
                <p className="text-gray-600 mb-4">Mafia, Doctor, and Sheriff take their actions...</p>
              )}
              {currentRound.phase === 'day' && (
                <p className="text-gray-600 mb-4">Discuss and vote to eliminate someone</p>
              )}
              <button
                onClick={advancePhase}
                disabled={isAdvancingPhase || (game.current_round >= game.max_rounds && currentRound.phase === 'day')}
                className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold py-2 px-6 rounded-lg transition"
              >
                {isAdvancingPhase ? 'Advancing...' : 'Next Phase'}
              </button>
            </div>
          </div>
        )}

        {/* Players List */}
        <div className="bg-white rounded-lg shadow-xl p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Players</h3>
          <div className="space-y-2">
            {players.map((player) => (
              <div
                key={player.id}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  player.is_alive
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-red-50 border border-red-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`font-semibold ${
                      player.is_alive ? 'text-green-800' : 'text-red-800'
                    }`}
                  >
                    {player.guest_name || player.users?.username}
                    {currentUser?.id === player.user_id && ' (You)'}
                  </span>
                </div>
                <span className={player.is_alive ? 'text-green-600' : 'text-red-600'}>
                  {player.is_alive ? '✓ Alive' : '✗ Dead'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
