'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';

interface Room {
  id: string;
  roomCode: string;
  hostId: string;
  status: string;
  maxRounds: number;
  maxCouples: number;
}

interface Team {
  id: string;
  teamName: string;
  player1Id: string;
  player2Id: string | null;
  isPlayer1HotSeat: boolean;
}

interface CurrentUser {
  id: string;
  username: string;
}

export default function LoveMatchLobbyPage() {
  const router = useRouter();
  const params = useParams();
  const code = params.code as string;

  const [room, setRoom] = useState<Room | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isHost, setIsHost] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [maxRounds, setMaxRounds] = useState(10);

  // Form states for joining
  const [partner2Name, setPartner2Name] = useState('');
  const [teamName, setTeamName] = useState('');
  const [joiningAs, setJoiningAs] = useState<'solo' | 'couple'>('solo');
  const [hasJoined, setHasJoined] = useState(false);

  useEffect(() => {
    const loadGame = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          router.push('/auth/login');
          return;
        }

        const { data: userData } = await supabase
          .from('users')
          .select('id, username')
          .eq('id', session.user.id)
          .single();

        setCurrentUser(userData);

        // Get room
        const { data: roomData, error: roomError } = await supabase
          .from('love_match_rooms')
          .select('*')
          .eq('room_code', code.toUpperCase())
          .single();

        if (roomError || !roomData) {
          setError('Room not found');
          setLoading(false);
          return;
        }

        setRoom({
          id: roomData.id,
          roomCode: roomData.room_code,
          hostId: roomData.host_id,
          status: roomData.status,
          maxRounds: roomData.max_rounds,
          maxCouples: roomData.max_couples,
        });

        setIsHost(roomData.host_id === session.user.id);
        setMaxRounds(roomData.max_rounds);

        // Get teams
        const { data: teamsData } = await supabase
          .from('love_match_teams')
          .select('*')
          .eq('game_id', roomData.id);

        setTeams((teamsData as any) || []);

        // Check if current user is already in a team
        const userTeam = (teamsData as any)?.some(
          (t: any) => t.player1_id === session.user.id || t.player2_id === session.user.id
        );
        setHasJoined(!!userTeam);

        setLoading(false);
      } catch (err) {
        console.error('Error loading game:', err);
        setError('Failed to load room');
        setLoading(false);
      }
    };

    loadGame();

    // Subscribe to real-time updates
    const subscription = supabase
      .channel(`game:love:${code}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'love_match_teams' },
        () => {
          loadGame();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'love_match_rooms' },
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
    if (!room || !currentUser) return;

    try {
      const res = await fetch('/api/games/love/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomCode: code,
          player1Id: currentUser.id,
          player1Name: currentUser.username,
          player2Id: null,
          player2Name: joiningAs === 'couple' ? partner2Name : null,
          teamName: teamName || `${currentUser.username}'s Team`,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to join room');
        return;
      }

      setHasJoined(true);
      setPartner2Name('');
      setTeamName('');

      // Reload teams
      const { data: teamsData } = await supabase
        .from('love_match_teams')
        .select('*')
        .eq('game_id', room.id);

      setTeams((teamsData as any) || []);
    } catch (err) {
      setError('Error joining room: ' + String(err));
    }
  };

  const handleStartGame = async () => {
    if (!room) return;

    try {
      const res = await fetch('/api/games/love/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId: room.id,
          maxRounds,
          gameType: 'love-match',
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to start game');
        return;
      }

      router.push(`/games/${code}/love/play`);
    } catch (err) {
      setError('Error starting game: ' + String(err));
    }
  };

  const copyInviteLink = async () => {
    try {
      await navigator.clipboard.writeText(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/games/${code}/love`
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

  if (error && !room) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] border-2 border-[#d4af37] rounded-lg shadow-2xl p-8 max-w-md text-center">
          <h2 className="text-3xl font-bold text-[#d4af37] mb-4" style={{fontFamily: 'Playfair Display'}}>⚠️</h2>
          <p className="text-[#888] mb-6" style={{fontFamily: 'Crimson Text', fontSize: '1.1em'}}>{error}</p>
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

  if (!room) return null;

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

        .lobby-card {
          animation: slideIn 0.6s ease-out;
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
          <h1 className="text-4xl font-bold text-[#d4af37] text-center" style={{fontFamily: 'Playfair Display', letterSpacing: '0.15em'}}>
            ❤️ LOVE MATCH
          </h1>
          <div className="w-12"></div>
        </div>

        {/* Room Code Card */}
        <div className="lobby-card bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] border-2 border-[#d4af37] rounded-lg shadow-2xl p-8 mb-6">
          <div className="text-center mb-8">
            <p className="text-[#b8860b] mb-2 text-sm tracking-widest" style={{fontFamily: 'Crimson Text', fontSize: '1.1em'}}>ROOM CODE</p>
            <h2 className="text-6xl font-bold text-[#d4af37] tracking-wider" style={{fontFamily: 'Playfair Display', letterSpacing: '0.2em'}}>
              {room.roomCode}
            </h2>
          </div>

          {/* QR Code */}
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
                  value={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/games/${code}/love`}
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
        </div>

        {error && (
          <div className="lobby-card bg-red-900 border-2 border-red-600 rounded-lg p-4 mb-6">
            <p className="text-red-200 text-center" style={{fontFamily: 'Crimson Text', fontSize: '1.1em'}}>{error}</p>
          </div>
        )}

        {/* Join Section */}
        {!hasJoined && (
          <div className="lobby-card bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] border-2 border-[#d4af37] rounded-lg shadow-2xl p-8 mb-6">
            <h3 className="text-2xl font-bold text-[#d4af37] mb-6" style={{fontFamily: 'Playfair Display'}}>Join Game</h3>

            <div className="space-y-4">
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-[#d4af37]">
                  <input
                    type="radio"
                    name="join-type"
                    value="solo"
                    checked={joiningAs === 'solo'}
                    onChange={() => setJoiningAs('solo')}
                    className="w-4 h-4"
                  />
                  <span style={{fontFamily: 'Crimson Text', fontSize: '1.1em'}}>I'm joining solo (partner will join later)</span>
                </label>
                <label className="flex items-center gap-2 text-[#d4af37]">
                  <input
                    type="radio"
                    name="join-type"
                    value="couple"
                    checked={joiningAs === 'couple'}
                    onChange={() => setJoiningAs('couple')}
                    className="w-4 h-4"
                  />
                  <span style={{fontFamily: 'Crimson Text', fontSize: '1.1em'}}>We're joining as a couple</span>
                </label>
              </div>

              {joiningAs === 'couple' && (
                <input
                  type="text"
                  placeholder="Partner's name"
                  value={partner2Name}
                  onChange={(e) => setPartner2Name(e.target.value)}
                  className="w-full px-4 py-3 bg-[#3a3a3a] border-2 border-[#d4af37] text-white rounded focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
                  style={{fontFamily: 'Crimson Text', fontSize: '1.1em'}}
                />
              )}

              <input
                type="text"
                placeholder="Team name (optional, e.g., Jake & Sara)"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="w-full px-4 py-3 bg-[#3a3a3a] border-2 border-[#d4af37] text-white rounded focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
                style={{fontFamily: 'Crimson Text', fontSize: '1.1em'}}
              />

              <button
                onClick={handleJoinGame}
                className="w-full bg-[#d4af37] hover:bg-[#f0d966] text-black font-bold py-3 rounded transition transform hover:scale-105"
                style={{fontFamily: 'Crimson Text', fontSize: '1.1em', letterSpacing: '0.05em'}}
              >
                Join Game
              </button>
            </div>
          </div>
        )}

        {/* Teams List */}
        <div className="lobby-card bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] border-2 border-[#d4af37] rounded-lg shadow-2xl p-8 mb-6">
          <h3 className="text-2xl font-bold text-[#d4af37] mb-6" style={{fontFamily: 'Playfair Display'}}>
            Teams ({teams.length}/{room.maxCouples})
          </h3>
          <div className="space-y-3">
            {teams.length === 0 ? (
              <p className="text-[#666] text-center py-8" style={{fontFamily: 'Crimson Text', fontSize: '1.1em', fontStyle: 'italic'}}>Waiting for couples to join...</p>
            ) : (
              teams.map((team, idx) => (
                <div
                  key={team.id}
                  className="flex items-center justify-between p-3 border border-[#d4af37] rounded hover:bg-[#3a3a3a] transition"
                  style={{animation: `slideIn 0.6s ease-out ${idx * 0.1}s both`}}
                >
                  <span className="text-[#d4af37] font-semibold" style={{fontFamily: 'Crimson Text', fontSize: '1.1em'}}>
                    ❤️ {team.teamName}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Host Controls */}
        {isHost && (
          <div className="lobby-card bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] border-2 border-[#d4af37] rounded-lg shadow-2xl p-8">
            <div className="mb-8">
              <label className="text-[#d4af37] font-bold mb-4 block" style={{fontFamily: 'Playfair Display', fontSize: '1.3em', letterSpacing: '0.05em'}}>
                Rounds: <span className="text-[#f0d966] text-2xl">{maxRounds}</span>
              </label>
              <input
                type="range"
                min="1"
                max="20"
                value={maxRounds}
                onChange={(e) => setMaxRounds(parseInt(e.target.value))}
                className="w-full h-3 bg-[#3a3a3a] border border-[#d4af37] rounded-lg appearance-none cursor-pointer"
                style={{accentColor: '#d4af37'}}
              />
              <div className="flex justify-between text-xs text-[#666] mt-3">
                <span>1 Round</span>
                <span>20 Rounds</span>
              </div>
            </div>

            <button
              onClick={handleStartGame}
              disabled={teams.length < 2}
              className={`w-full font-bold py-4 rounded transition transform text-lg ${
                teams.length < 2
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-[#d4af37] hover:bg-[#f0d966] text-black hover:scale-105'
              }`}
              style={{fontFamily: 'Crimson Text', fontSize: '1.2em', letterSpacing: '0.05em'}}
            >
              {teams.length < 2
                ? `Start Game (Need ${2 - teams.length} more couple(s))`
                : 'START GAME'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
