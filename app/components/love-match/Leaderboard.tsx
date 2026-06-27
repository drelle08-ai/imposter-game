'use client';

import { getPlacementMedal } from '@/lib/love-match-scoring';

interface Team {
  id: string;
  teamName: string;
  points: number;
  placement?: number;
}

interface LeaderboardProps {
  teams: Team[];
  roundNumber?: number;
  maxRounds?: number;
}

export default function Leaderboard({ teams, roundNumber = 0, maxRounds = 10 }: LeaderboardProps) {
  // Sort teams by points
  const sortedTeams = [...teams].sort((a, b) => b.points - a.points);

  return (
    <div className="bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] border-2 border-[#d4af37] rounded-lg p-6 shadow-2xl">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-[#d4af37]" style={{ fontFamily: 'Playfair Display' }}>
          LEADERBOARD
        </h3>
        {roundNumber > 0 && (
          <div className="text-[#b8860b] text-sm" style={{ fontFamily: 'Crimson Text', fontSize: '1.1em' }}>
            Round {roundNumber}/{maxRounds}
          </div>
        )}
      </div>

      <div className="space-y-2">
        {sortedTeams.length === 0 ? (
          <p className="text-[#666] text-center py-4 italic" style={{ fontFamily: 'Crimson Text' }}>
            Waiting for scores...
          </p>
        ) : (
          sortedTeams.map((team, idx) => (
            <div
              key={team.id}
              className="flex items-center justify-between p-3 border border-[#d4af37] rounded hover:bg-[#3a3a3a] transition"
              style={{ animation: `slideIn 0.5s ease-out ${idx * 0.1}s both` }}
            >
              <div className="flex items-center gap-3 flex-1">
                <span className="text-2xl font-bold w-8 text-center text-[#d4af37]">
                  {getPlacementMedal(idx + 1)}
                </span>
                <span
                  className="font-semibold text-[#d4af37] truncate"
                  style={{ fontFamily: 'Crimson Text', fontSize: '1.1em' }}
                >
                  {team.teamName}
                </span>
              </div>
              <div className="text-right">
                <span
                  className="text-2xl font-bold text-[#f0d966]"
                  style={{ fontFamily: 'Playfair Display', letterSpacing: '0.05em' }}
                >
                  {team.points}
                </span>
                <span className="text-xs text-[#888] ml-2">pts</span>
              </div>
            </div>
          ))
        )}
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
