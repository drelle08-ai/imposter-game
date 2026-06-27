'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';

interface GameData {
  id: string;
  invite_code: string;
  status: string;
  host_id: string;
  game_type: string;
  max_rounds: number;
  current_round: number;
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
  guest_name?: string;
}

interface CurrentUser {
  id: string;
  username: string;
}

export default function MafiaLobbyPage() {
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
  const [maxRounds, setMaxRounds] = useState(5);
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

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
      setMaxRounds(gameData.max_rounds || 5);
      setIsHost(gameData.host_id === session.user.id);

      const { data: playersData } = await supabase
        .from('game_players')
        .select(`id, user_id, role, is_alive, joined_at, guest_name, users(username)`)
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
  };

  const handleStartGame = async () => {
    if (!game) return;

    try {
      const res = await fetch('/api/games/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId: game.id, maxRounds, gameType: 'mafia' }),
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

      router.push(`/games/${game.invite_code}/mafia-play`);
    } catch (err) {
      setError('Error starting game: ' + String(err));
    }
  };

  const copyInviteLink = async () => {
    try {
      await navigator.clipboard.writeText(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/games/${game?.invite_code}`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-[#d4af37] text-2xl" style={{fontFamily: 'Playfair Display', letterSpacing: '0.1em'}}>Loading...</div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] border-2 border-[#d4af37] rounded-lg shadow-2xl p-8 max-w-md text-center">
          <h2 className="text-3xl font-bold text-[#d4af37] mb-4" style={{fontFamily: 'Playfair Display'}}>⚠️</h2>
          <p className="text-[#888] mb-6" style={{fontFamily: 'Crimson Text', fontSize: '1.1em'}}>{error || 'Operation not found'}</p>
          <Link
            href="/dashboard"
            className="inline-block bg-[#d4af37] hover:bg-[#f0d966] text-black font-bold py-2 px-6 rounded transition"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-4">
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

        @keyframes shimmer {
          0% { text-shadow: 0 0 10px #d4af37; }
          50% { text-shadow: 0 0 20px #d4af37, 0 0 30px #b8860b; }
          100% { text-shadow: 0 0 10px #d4af37; }
        }

        .lobby-card {
          animation: slideIn 0.6s ease-out;
        }

        .gold-shimmer {
          animation: shimmer 3s ease-in-out infinite;
        }

        input:focus {
          box-shadow: 0 0 20px rgba(212, 175, 55, 0.3);
        }
      `}</style>

      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-12 pb-6 border-b-2 border-[#d4af37]">
          <Link href="/dashboard" className="text-[#d4af37] hover:text-[#f0d966] transition font-semibold text-lg">
            ← Exit
          </Link>
          <h1 className="text-4xl font-bold text-[#d4af37] text-center gold-shimmer" style={{fontFamily: 'Playfair Display', letterSpacing: '0.15em'}}>
            🎭 THE FAMILY
          </h1>
          <div className="w-12"></div>
        </div>

        {/* Game Code & QR Card */}
        <div className="lobby-card bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] border-2 border-[#d4af37] rounded-lg shadow-2xl p-8 mb-6">
          <div className="text-center mb-8">
            <p className="text-[#b8860b] mb-2 text-sm tracking-widest" style={{fontFamily: 'Crimson Text', fontSize: '1.1em'}}>FACTION CODE</p>
            <h2 className="text-6xl font-bold text-[#d4af37] tracking-wider" style={{fontFamily: 'Playfair Display', letterSpacing: '0.2em'}}>
              {game.invite_code}
            </h2>
          </div>

          {/* QR Code Section */}
          <div className="flex flex-col items-center mb-8">
            <button
              onClick={() => setShowQR(!showQR)}
              className="mb-4 text-[#d4af37] hover:text-[#f0d966] transition font-semibold"
              style={{fontFamily: 'Crimson Text', fontSize: '1.1em'}}
            >
              {showQR ? '← Hide QR Code' : 'Show QR Code →'}
            </button>
            {showQR && (
              <div className="bg-white p-4 rounded-lg mb-6">
                <QRCodeSVG
                  value={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/games/${game?.invite_code}`}
                  size={256}
                  level="H"
                  includeMargin={true}
                />
              </div>
            )}
          </div>

          <button
            onClick={copyInviteLink}
            className="w-full bg-[#d4af37] hover:bg-[#f0d966] text-black font-bold py-3 rounded transition transform hover:scale-105 mb-4"
            style={{fontFamily: 'Crimson Text', fontSize: '1.1em', letterSpacing: '0.05em'}}
          >
            {copied ? '✓ Link Copied' : 'Copy Invite Link'}
          </button>

          {!isJoined && (
            <button
              onClick={handleJoinGame}
              className="w-full bg-gradient-to-r from-[#d4af37] to-[#f0d966] hover:from-[#f0d966] hover:to-[#d4af37] text-black font-bold py-3 rounded transition transform hover:scale-105"
              style={{fontFamily: 'Crimson Text', fontSize: '1.1em', letterSpacing: '0.05em'}}
            >
              Join Family
            </button>
          )}
        </div>

        {error && (
          <div className="lobby-card bg-red-900 border-2 border-red-600 rounded-lg p-4 mb-6">
            <p className="text-red-200 text-center" style={{fontFamily: 'Crimson Text', fontSize: '1.1em'}}>{error}</p>
          </div>
        )}

        {/* Players Card */}
        <div className="lobby-card bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] border-2 border-[#d4af37] rounded-lg shadow-2xl p-8 mb-6">
          <h3 className="text-2xl font-bold text-[#d4af37] mb-6" style={{fontFamily: 'Playfair Display'}}>
            Soldiers ({players.length})
          </h3>
          <div className="space-y-3">
            {players.length === 0 ? (
              <p className="text-[#666] text-center py-8" style={{fontFamily: 'Crimson Text', fontSize: '1.1em', fontStyle: 'italic'}}>Awaiting recruits...</p>
            ) : (
              players.map((player, idx) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between p-3 border border-[#d4af37] rounded hover:bg-[#3a3a3a] transition"
                  style={{animation: `slideIn 0.6s ease-out ${idx * 0.1}s both`}}
                >
                  <span className="text-[#d4af37] font-semibold" style={{fontFamily: 'Crimson Text', fontSize: '1.1em'}}>
                    {player.guest_name || player.users?.username}
                    {currentUser?.id === player.user_id && <span className="ml-2 text-[#b8860b]">(You)</span>}
                    {game.host_id === player.user_id && (
                      <span className="ml-2 bg-[#d4af37] text-black text-xs px-2 py-1 rounded font-bold">Boss</span>
                    )}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Host Controls */}
        {isHost && isJoined && (
          <div className="lobby-card bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] border-2 border-[#d4af37] rounded-lg shadow-2xl p-8">
            <div className="mb-8">
              <label className="text-[#d4af37] font-bold mb-4 block" style={{fontFamily: 'Playfair Display', fontSize: '1.3em', letterSpacing: '0.05em'}}>
                Nights: <span className="text-[#f0d966] text-2xl">{maxRounds}</span>
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={maxRounds}
                onChange={(e) => setMaxRounds(parseInt(e.target.value))}
                className="w-full h-3 bg-[#3a3a3a] border border-[#d4af37] rounded-lg appearance-none cursor-pointer"
                style={{accentColor: '#d4af37'}}
              />
              <div className="flex justify-between text-xs text-[#666] mt-3">
                <span>1 Night</span>
                <span>10 Nights</span>
              </div>
            </div>

            <button
              onClick={handleStartGame}
              disabled={players.length < 4}
              className={`w-full font-bold py-4 rounded transition transform text-lg ${
                players.length < 4
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-[#d4af37] hover:bg-[#f0d966] text-black hover:scale-105'
              }`}
              style={{fontFamily: 'Crimson Text', fontSize: '1.2em', letterSpacing: '0.05em'}}
            >
              {players.length < 4
                ? `Begin War (Need ${4 - players.length} more)`
                : 'BEGIN THE WAR'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
