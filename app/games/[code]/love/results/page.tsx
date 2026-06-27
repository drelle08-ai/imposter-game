'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import CompatibilityScore from '@/app/components/love-match/CompatibilityScore';
import { calculateCompatibilityScore } from '@/lib/love-match-scoring';
import Link from 'next/link';

interface Team {
  id: string;
  teamName: string;
}

interface RoundScore {
  team_id: string;
  total_points: number;
}

interface Answer {
  team_id: string;
  match_type: 'exact' | 'close' | 'miss';
}

interface TeamStats {
  teamId: string;
  teamName: string;
  finalPoints: number;
  exactMatches: number;
  closeMatches: number;
  missedMatches: number;
  totalRounds: number;
  compatibilityScore: number;
  placement: number;
}

export default function LoveMatchResultsPage() {
  const router = useRouter();
  const params = useParams();
  const code = params.code as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [teamStats, setTeamStats] = useState<TeamStats[]>([]);
  const [gameInfo, setGameInfo] = useState<{ roomCode: string; maxRounds: number } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadResults = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          router.push('/auth/login');
          return;
        }

        // Get room
        const { data: room } = await supabase
          .from('love_match_rooms')
          .select('*')
          .eq('room_code', code.toUpperCase())
          .single();

        if (!room) {
          setError('Game not found');
          setLoading(false);
          return;
        }

        setGameInfo({
          roomCode: room.room_code,
          maxRounds: room.max_rounds,
        });

        // Get all teams
        const { data: teams } = await supabase
          .from('love_match_teams')
          .select('*')
          .eq('game_id', room.id);

        if (!teams || teams.length === 0) {
          setError('No teams found');
          setLoading(false);
          return;
        }

        // Get all scores for each team
        const stats: TeamStats[] = [];

        for (const team of teams) {
          // Get all answers for this team
          const { data: answers } = await supabase
            .from('love_match_answers')
            .select('*')
            .eq('team_id', team.id);

          // Calculate stats
          const exactMatches = (answers || []).filter((a) => a.match_type === 'exact').length;
          const closeMatches = (answers || []).filter((a) => a.match_type === 'close').length;
          const missedMatches = (answers || []).filter((a) => a.match_type === 'miss').length;
          const totalRounds = (answers || []).length;

          // Calculate final points
          const finalPoints = (answers || []).reduce((sum, a) => sum + a.points_awarded, 0);

          // Calculate compatibility score
          const compatibilityScore = calculateCompatibilityScore(
            exactMatches,
            closeMatches,
            missedMatches,
            totalRounds
          );

          stats.push({
            teamId: team.id,
            teamName: team.team_name,
            finalPoints,
            exactMatches,
            closeMatches,
            missedMatches,
            totalRounds,
            compatibilityScore,
            placement: 0, // Will be set after sorting
          });
        }

        // Sort by points and assign placements
        const sorted = stats.sort((a, b) => b.finalPoints - a.finalPoints);
        const withPlacements = sorted.map((stat, idx) => ({
          ...stat,
          placement: idx + 1,
        }));

        setTeamStats(withPlacements);
        setLoading(false);
      } catch (err) {
        console.error('Error loading results:', err);
        setError('Failed to load results');
        setLoading(false);
      }
    };

    loadResults();
  }, [code, router]);

  const copyShareLink = async () => {
    const shareText = `🎮 I just played Love Match! Room: ${code.toUpperCase()}\n\nCheck it out: ${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/games/${code}/love`;

    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-[#d4af37] text-2xl" style={{ fontFamily: 'Playfair Display', letterSpacing: '0.1em' }}>
          Calculating Results...
        </div>
      </div>
    );
  }

  if (error || teamStats.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] border-2 border-[#d4af37] rounded-lg p-8 max-w-md text-center">
          <h2 className="text-3xl font-bold text-[#d4af37] mb-4" style={{ fontFamily: 'Playfair Display' }}>
            ⚠️ Error
          </h2>
          <p className="text-[#888] mb-6" style={{ fontFamily: 'Crimson Text', fontSize: '1.1em' }}>
            {error || 'Failed to load results'}
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

  const winner = teamStats[0];

  return (
    <div className="min-h-screen bg-black p-4">
      <style>{`
        @keyframes celebrate {
          0%, 100% { transform: scale(1) rotate(0deg); }
          50% { transform: scale(1.05) rotate(2deg); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        .winner-crown {
          animation: celebrate 1s ease-in-out infinite;
        }

        .confetti {
          animation: float 2s ease-in-out infinite;
        }

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

        .result-card {
          animation: slideIn 0.6s ease-out forwards;
        }

        .result-card:nth-child(1) { animation-delay: 0.2s; }
        .result-card:nth-child(2) { animation-delay: 0.4s; }
        .result-card:nth-child(3) { animation-delay: 0.6s; }
      `}</style>

      <div className="max-w-6xl mx-auto">
        {/* Header with Celebration */}
        <div className="text-center mb-12">
          <div className="text-8xl mb-4 winner-crown">🎉</div>
          <h1 className="text-5xl font-bold text-[#d4af37] mb-2" style={{ fontFamily: 'Playfair Display', letterSpacing: '0.1em' }}>
            ❤️ LOVE MATCH
          </h1>
          <p className="text-[#b8860b] text-lg" style={{ fontFamily: 'Crimson Text', fontSize: '1.2em' }}>
            Game Complete! Room: {gameInfo?.roomCode}
          </p>
        </div>

        {/* Winner Highlight */}
        <div className="bg-gradient-to-br from-yellow-900 to-amber-900 border-2 border-[#d4af37] rounded-lg shadow-2xl p-8 mb-12 text-center">
          <p className="text-2xl mb-4 confetti">👑</p>
          <h2 className="text-4xl font-bold text-[#d4af37] mb-2" style={{ fontFamily: 'Playfair Display' }}>
            🏆 {winner.teamName} 🏆
          </h2>
          <p className="text-[#f0d966] text-lg font-semibold mb-4" style={{ fontFamily: 'Crimson Text', fontSize: '1.2em' }}>
            Compatibility: {winner.compatibilityScore}%
          </p>
          <p className="text-white text-3xl font-bold" style={{ fontFamily: 'Playfair Display', letterSpacing: '0.1em' }}>
            {winner.finalPoints} Points
          </p>
        </div>

        {/* All Results */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {teamStats.map((team) => (
            <div key={team.teamId} className="result-card">
              <CompatibilityScore
                teamName={team.teamName}
                score={team.compatibilityScore}
                exactMatches={team.exactMatches}
                closeMatches={team.closeMatches}
                missedMatches={team.missedMatches}
                totalRounds={team.totalRounds}
                finalPoints={team.finalPoints}
                placement={team.placement}
              />
            </div>
          ))}
        </div>

        {/* Leaderboard Summary */}
        <div className="bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] border-2 border-[#d4af37] rounded-lg shadow-2xl p-8 mb-12">
          <h3 className="text-3xl font-bold text-[#d4af37] mb-8 text-center" style={{ fontFamily: 'Playfair Display' }}>
            Final Leaderboard
          </h3>

          <div className="space-y-3">
            {teamStats.map((team, idx) => (
              <div
                key={team.teamId}
                className="flex items-center justify-between p-4 bg-[#3a3a3a] border border-[#d4af37] rounded hover:bg-[#4a4a4a] transition"
              >
                <div className="flex items-center gap-4 flex-1">
                  <span className="text-3xl font-bold text-[#d4af37] w-12">
                    {idx === 0 && '🥇'}
                    {idx === 1 && '🥈'}
                    {idx === 2 && '🥉'}
                    {idx > 2 && `#${idx + 1}`}
                  </span>
                  <div>
                    <p className="font-semibold text-[#d4af37] text-lg" style={{ fontFamily: 'Crimson Text', fontSize: '1.1em' }}>
                      {team.teamName}
                    </p>
                    <p className="text-xs text-[#888]" style={{ fontFamily: 'Crimson Text' }}>
                      {team.compatibilityScore}% Compatibility • {team.exactMatches} Exact Matches
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-[#f0d966]" style={{ fontFamily: 'Playfair Display', letterSpacing: '0.05em' }}>
                    {team.finalPoints}
                  </p>
                  <p className="text-xs text-[#888]">points</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <button
            onClick={copyShareLink}
            className="bg-[#d4af37] hover:bg-[#f0d966] text-black font-bold py-3 px-8 rounded transition transform hover:scale-105"
            style={{ fontFamily: 'Crimson Text', fontSize: '1.1em', letterSpacing: '0.05em' }}
          >
            {copied ? '✓ Copied!' : '📤 Share Results'}
          </button>

          <Link
            href="/dashboard"
            className="bg-[#3a3a3a] hover:bg-[#4a4a4a] border-2 border-[#d4af37] text-[#d4af37] font-bold py-3 px-8 rounded transition transform hover:scale-105 text-center"
            style={{ fontFamily: 'Crimson Text', fontSize: '1.1em', letterSpacing: '0.05em' }}
          >
            🎮 Play Again
          </Link>
        </div>

        {/* Game Stats Summary */}
        <div className="bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] border-2 border-[#d4af37] rounded-lg shadow-2xl p-8">
          <h3 className="text-2xl font-bold text-[#d4af37] mb-6" style={{ fontFamily: 'Playfair Display' }}>
            Game Statistics
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-[#3a3a3a] rounded border border-[#d4af37]">
              <p className="text-3xl font-bold text-[#f0d966]" style={{ fontFamily: 'Playfair Display' }}>
                {teamStats.length}
              </p>
              <p className="text-xs text-[#888] mt-2" style={{ fontFamily: 'Crimson Text' }}>
                Couples Played
              </p>
            </div>

            <div className="text-center p-4 bg-[#3a3a3a] rounded border border-[#d4af37]">
              <p className="text-3xl font-bold text-[#f0d966]" style={{ fontFamily: 'Playfair Display' }}>
                {gameInfo?.maxRounds}
              </p>
              <p className="text-xs text-[#888] mt-2" style={{ fontFamily: 'Crimson Text' }}>
                Rounds Played
              </p>
            </div>

            <div className="text-center p-4 bg-[#3a3a3a] rounded border border-[#d4af37]">
              <p className="text-3xl font-bold text-[#f0d966]" style={{ fontFamily: 'Playfair Display' }}>
                {teamStats.reduce((sum, t) => sum + t.exactMatches, 0)}
              </p>
              <p className="text-xs text-[#888] mt-2" style={{ fontFamily: 'Crimson Text' }}>
                Total Exact Matches
              </p>
            </div>

            <div className="text-center p-4 bg-[#3a3a3a] rounded border border-[#d4af37]">
              <p className="text-3xl font-bold text-[#f0d966]" style={{ fontFamily: 'Playfair Display' }}>
                {Math.round(
                  (teamStats.reduce((sum, t) => sum + t.exactMatches + t.closeMatches, 0) /
                    (teamStats.length * (gameInfo?.maxRounds || 1))) *
                    100
                )}
                %
              </p>
              <p className="text-xs text-[#888] mt-2" style={{ fontFamily: 'Crimson Text' }}>
                Overall Match Rate
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
