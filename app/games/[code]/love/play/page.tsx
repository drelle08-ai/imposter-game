'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Leaderboard from '@/app/components/love-match/Leaderboard';
import Link from 'next/link';

interface Room {
  id: string;
  roomCode: string;
  status: string;
  round_number: number;
  current_phase: string;
  max_rounds: number;
  timer_end_at: string;
}

interface Team {
  id: string;
  teamName: string;
  player1_id: string;
  player2_id: string | null;
  is_player1_hot_seat: boolean;
  total_points: number;
}

interface Round {
  id: string;
  round_number: number;
  question_text: string;
  phase: string;
  hot_seat_player_id: string;
  timer_end_at: string;
}

interface Answer {
  id: string;
  team_id: string;
  hot_seat_answer: string;
  guesser_answer: string;
  match_type: string;
  points_awarded: number;
}

interface CurrentUser {
  id: string;
  username: string;
}

export default function LoveMatchPlayPage() {
  const router = useRouter();
  const params = useParams();
  const code = params.code as string;

  const [room, setRoom] = useState<Room | null>(null);
  const [currentRound, setCurrentRound] = useState<Round | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [userTeam, setUserTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [hotSeatAnswer, setHotSeatAnswer] = useState('');
  const [guesserAnswer, setGuesserAnswer] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Load initial game state
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
        const { data: roomData } = await supabase
          .from('love_match_rooms')
          .select('*')
          .eq('room_code', code.toUpperCase())
          .single();

        if (!roomData) {
          setError('Room not found');
          setLoading(false);
          return;
        }

        setRoom(roomData);

        // Get current round
        const { data: roundData } = await supabase
          .from('love_match_rounds')
          .select('*')
          .eq('id', roomData.id)
          .order('round_number', { ascending: false })
          .limit(1)
          .single();

        if (roundData) {
          setCurrentRound(roundData);
        }

        // Get teams
        const { data: teamsData } = await supabase
          .from('love_match_teams')
          .select('*')
          .eq('game_id', roomData.id);

        setTeams((teamsData as any) || []);

        // Find current user's team
        const team = (teamsData as any)?.find(
          (t: any) => t.player1_id === session.user.id || t.player2_id === session.user.id
        );
        setUserTeam(team);

        // Get answers for current round
        if (roundData) {
          const { data: answersData } = await supabase
            .from('love_match_answers')
            .select('*')
            .eq('round_id', roundData.id);

          setAnswers((answersData as any) || []);

          // Check if current team submitted
          const teamAnswers = (answersData as any)?.find(
            (a: any) => a.team_id === team?.id
          );
          setHasSubmitted(!!teamAnswers);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error loading game:', err);
        setError('Failed to load game');
        setLoading(false);
      }
    };

    loadGame();

    // Subscribe to real-time updates
    const subscription = supabase
      .channel(`love-game:${code}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'love_match_rooms' },
        () => loadGame()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'love_match_rounds' },
        () => loadGame()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'love_match_answers' },
        () => loadGame()
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [code, router]);

  // Timer countdown
  useEffect(() => {
    if (!room || !currentRound) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const endTime = new Date(room.timer_end_at).getTime();
      const remaining = Math.max(0, Math.ceil((endTime - now) / 1000));

      setTimerSeconds(remaining);

      // Auto-advance phase when timer hits 0
      if (remaining === 0 && room.status === 'in_progress') {
        advancePhase();
      }
    }, 100);

    return () => clearInterval(interval);
  }, [room, currentRound]);

  const advancePhase = async () => {
    if (!room || !currentRound) return;

    try {
      const res = await fetch('/api/games/love/advance-phase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId: room.id,
          roundId: currentRound.id,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        console.error('Error advancing phase:', data.error);
        return;
      }

      // Reload game state
      const { data: updatedRoom } = await supabase
        .from('love_match_rooms')
        .select('*')
        .eq('id', room.id)
        .single();

      if (updatedRoom) {
        setRoom(updatedRoom);

        // Get latest round
        const { data: latestRound } = await supabase
          .from('love_match_rounds')
          .select('*')
          .eq('game_id', room.id)
          .order('round_number', { ascending: false })
          .limit(1)
          .single();

        if (latestRound) {
          setCurrentRound(latestRound);
          setHasSubmitted(false);
          setHotSeatAnswer('');
          setGuesserAnswer('');
        }

        // Check if game ended
        if (updatedRoom.status === 'ended') {
          setTimeout(() => router.push(`/games/${code}/love/results`), 2000);
        }
      }
    } catch (err) {
      console.error('Error advancing phase:', err);
    }
  };

  const handleSubmitAnswers = async () => {
    if (!currentRound || !userTeam) return;

    try {
      const res = await fetch('/api/games/love/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roundId: currentRound.id,
          teamId: userTeam.id,
          hotSeatAnswer: hotSeatAnswer.trim(),
          guesserAnswer: guesserAnswer.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to submit answers');
        return;
      }

      setHasSubmitted(true);
    } catch (err) {
      setError('Error submitting answers: ' + String(err));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-[#d4af37] text-2xl" style={{ fontFamily: 'Playfair Display', letterSpacing: '0.1em' }}>
          Loading Game...
        </div>
      </div>
    );
  }

  if (!room || !currentRound || !currentUser || !userTeam) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] border-2 border-[#d4af37] rounded-lg p-8 max-w-md text-center">
          <h2 className="text-3xl font-bold text-[#d4af37] mb-4" style={{ fontFamily: 'Playfair Display' }}>
            ⚠️ Error
          </h2>
          <p className="text-[#888] mb-6" style={{ fontFamily: 'Crimson Text', fontSize: '1.1em' }}>
            {error || 'Failed to load game'}
          </p>
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

  const isHotSeat =
    currentRound.hot_seat_player_id === currentUser.id;

  const leaderboardTeams = teams.map((team) => ({
    id: team.id,
    teamName: team.teamName,
    points: team.total_points,
  }));

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

        .timer {
          font-size: 3.5em;
          font-weight: bold;
          color: #d4af37;
          font-family: 'Playfair Display';
          letter-spacing: 0.1em;
        }

        .timer.warning {
          color: #ff6b6b;
          animation: pulse 1s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        input:focus {
          box-shadow: 0 0 20px rgba(212, 175, 55, 0.3);
        }
      `}</style>

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 pb-4 border-b-2 border-[#d4af37]">
          <div>
            <h1 className="text-3xl font-bold text-[#d4af37]" style={{ fontFamily: 'Playfair Display', letterSpacing: '0.1em' }}>
              ❤️ LOVE MATCH
            </h1>
            <p className="text-[#b8860b] text-sm mt-1">{room.roomCode}</p>
          </div>
          <div className="text-right">
            <p className="text-[#d4af37] font-semibold" style={{ fontFamily: 'Crimson Text', fontSize: '1.1em' }}>
              Round {room.round_number}/{room.max_rounds}
            </p>
            <p className="text-[#888] text-sm" style={{ fontFamily: 'Crimson Text' }}>
              {currentRound.phase.toUpperCase()}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Main Game Area */}
          <div className="lg:col-span-2">
            {/* PHASE 1: QUESTION */}
            {currentRound.phase === 'question' && (
              <div
                className="bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] border-2 border-[#d4af37] rounded-lg shadow-2xl p-8 text-center mb-6"
                style={{ animation: 'slideIn 0.6s ease-out' }}
              >
                <p className="text-[#b8860b] mb-6 text-sm tracking-widest uppercase" style={{ fontFamily: 'Crimson Text', fontSize: '1.1em' }}>
                  The Question
                </p>
                <p
                  className="text-2xl font-bold text-[#d4af37] mb-12"
                  style={{ fontFamily: 'Crimson Text', fontSize: '1.4em', fontStyle: 'italic' }}
                >
                  "{currentRound.question_text}"
                </p>
                <div className="text-center mb-4">
                  <p className="text-[#888] mb-2" style={{ fontFamily: 'Crimson Text' }}>
                    Time Remaining
                  </p>
                  <div className="timer">{timerSeconds}s</div>
                </div>
              </div>
            )}

            {/* PHASE 2: ANSWER */}
            {currentRound.phase === 'answer' && (
              <div
                className="bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] border-2 border-[#d4af37] rounded-lg shadow-2xl p-8 mb-6"
                style={{ animation: 'slideIn 0.6s ease-out' }}
              >
                <div className="mb-8">
                  <p
                    className="text-[#d4af37] font-semibold mb-3"
                    style={{ fontFamily: 'Crimson Text', fontSize: '1.2em' }}
                  >
                    {isHotSeat ? '🔴 YOU\'RE IN THE HOT SEAT!' : '🔵 Guess Your Partner!'}
                  </p>
                  <p className="text-[#888] text-sm mb-4" style={{ fontFamily: 'Crimson Text' }}>
                    {isHotSeat
                      ? 'Answer truthfully (hidden from partner)'
                      : 'What do you think your partner said?'}
                  </p>

                  {/* Question display */}
                  <p
                    className="text-lg font-semibold text-[#d4af37] mb-6 p-4 bg-[#3a3a3a] rounded border border-[#d4af37]"
                    style={{ fontFamily: 'Crimson Text', fontSize: '1.1em' }}
                  >
                    "{currentRound.question_text}"
                  </p>

                  {/* Input fields */}
                  <div className="space-y-4">
                    {isHotSeat && (
                      <input
                        type="text"
                        placeholder="Your honest answer..."
                        value={hotSeatAnswer}
                        onChange={(e) => setHotSeatAnswer(e.target.value)}
                        disabled={hasSubmitted}
                        className="w-full px-4 py-3 bg-[#3a3a3a] border-2 border-[#d4af37] text-white rounded focus:outline-none focus:ring-2 focus:ring-[#d4af37] disabled:opacity-50"
                        style={{ fontFamily: 'Crimson Text', fontSize: '1.1em' }}
                      />
                    )}

                    {!isHotSeat && (
                      <input
                        type="text"
                        placeholder="Your guess..."
                        value={guesserAnswer}
                        onChange={(e) => setGuesserAnswer(e.target.value)}
                        disabled={hasSubmitted}
                        className="w-full px-4 py-3 bg-[#3a3a3a] border-2 border-[#d4af37] text-white rounded focus:outline-none focus:ring-2 focus:ring-[#d4af37] disabled:opacity-50"
                        style={{ fontFamily: 'Crimson Text', fontSize: '1.1em' }}
                      />
                    )}
                  </div>

                  {/* Submit button */}
                  {!hasSubmitted && (
                    <button
                      onClick={handleSubmitAnswers}
                      disabled={
                        (isHotSeat && !hotSeatAnswer.trim()) ||
                        (!isHotSeat && !guesserAnswer.trim())
                      }
                      className="w-full bg-[#d4af37] hover:bg-[#f0d966] disabled:bg-gray-600 text-black font-bold py-3 rounded transition transform hover:scale-105 mt-6"
                      style={{ fontFamily: 'Crimson Text', fontSize: '1.1em', letterSpacing: '0.05em' }}
                    >
                      Submit Answer
                    </button>
                  )}

                  {hasSubmitted && (
                    <div className="w-full bg-green-900 text-green-200 font-bold py-3 rounded mt-6 text-center">
                      ✓ Answer Submitted
                    </div>
                  )}
                </div>

                <div className="text-center mt-6 pt-6 border-t border-[#d4af37]">
                  <p className="text-[#888] mb-2" style={{ fontFamily: 'Crimson Text' }}>
                    Time Remaining
                  </p>
                  <div className={`timer ${timerSeconds <= 5 ? 'warning' : ''}`}>
                    {timerSeconds}s
                  </div>
                </div>
              </div>
            )}

            {/* PHASE 3: REVEAL */}
            {currentRound.phase === 'reveal' && (
              <div
                className="bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] border-2 border-[#d4af37] rounded-lg shadow-2xl p-8 mb-6"
                style={{ animation: 'slideIn 0.6s ease-out' }}
              >
                <h2 className="text-2xl font-bold text-[#d4af37] mb-8 text-center" style={{ fontFamily: 'Playfair Display' }}>
                  ROUND {currentRound.round_number} RESULTS
                </h2>

                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {teams.map((team) => {
                    const teamAnswers = answers.find((a) => a.team_id === team.id);
                    if (!teamAnswers) return null;

                    return (
                      <div
                        key={team.id}
                        className="p-4 border-2 border-[#d4af37] rounded bg-[#2a2a2a]"
                      >
                        <p className="font-semibold text-[#d4af37] mb-3" style={{ fontFamily: 'Crimson Text', fontSize: '1.1em' }}>
                          ❤️ {team.teamName}
                        </p>

                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-[#888]">Their Answer:</span>
                            <span className="text-white" style={{ fontFamily: 'Crimson Text' }}>
                              "{teamAnswers.hot_seat_answer}"
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#888]">Guess:</span>
                            <span className="text-white" style={{ fontFamily: 'Crimson Text' }}>
                              "{teamAnswers.guesser_answer}"
                            </span>
                          </div>
                          <div className="flex justify-between items-center pt-2 border-t border-[#d4af37]">
                            <span
                              className={`font-bold ${
                                teamAnswers.match_type === 'exact'
                                  ? 'text-green-400'
                                  : teamAnswers.match_type === 'close'
                                  ? 'text-yellow-400'
                                  : 'text-red-400'
                              }`}
                            >
                              {teamAnswers.match_type === 'exact' && '✅ EXACT MATCH'}
                              {teamAnswers.match_type === 'close' && '⚠️ CLOSE'}
                              {teamAnswers.match_type === 'miss' && '❌ MISS'}
                            </span>
                            <span className="text-[#f0d966] font-bold text-lg">
                              +{teamAnswers.points_awarded}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="text-center mt-8 pt-6 border-t border-[#d4af37]">
                  <p className="text-[#888] mb-2" style={{ fontFamily: 'Crimson Text' }}>
                    Next Round In
                  </p>
                  <div className={`timer ${timerSeconds <= 3 ? 'warning' : ''}`}>
                    {timerSeconds}s
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Leaderboard Sidebar */}
          <div>
            <Leaderboard
              teams={leaderboardTeams}
              roundNumber={room.round_number}
              maxRounds={room.max_rounds}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
