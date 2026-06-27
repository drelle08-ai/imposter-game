'use client';

import { getCompatibilityMessage } from '@/lib/love-match-scoring';

interface CompatibilityScoreProps {
  teamName: string;
  score: number;
  exactMatches: number;
  closeMatches: number;
  missedMatches: number;
  totalRounds: number;
  finalPoints: number;
  placement: number;
}

export default function CompatibilityScore({
  teamName,
  score,
  exactMatches,
  closeMatches,
  missedMatches,
  totalRounds,
  finalPoints,
  placement,
}: CompatibilityScoreProps) {
  const matchRate = totalRounds > 0 ? ((exactMatches + closeMatches) / totalRounds) * 100 : 0;

  const getMedalEmoji = (placement: number) => {
    switch (placement) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return '💙';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'from-red-600 to-pink-600';
    if (score >= 80) return 'from-pink-600 to-rose-600';
    if (score >= 70) return 'from-purple-600 to-pink-600';
    if (score >= 60) return 'from-blue-600 to-purple-600';
    if (score >= 50) return 'from-cyan-600 to-blue-600';
    return 'from-slate-600 to-cyan-600';
  };

  return (
    <div className="bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] border-2 border-[#d4af37] rounded-lg shadow-2xl p-8 text-center">
      <style>{`
        @keyframes heartBeat {
          0%, 100% { transform: scale(1); }
          25% { transform: scale(1.1); }
          50% { transform: scale(1.05); }
        }

        .heart-beat {
          animation: heartBeat 1.2s ease-in-out infinite;
          display: inline-block;
        }

        .score-ring {
          position: relative;
          width: 200px;
          height: 200px;
          margin: 0 auto;
        }

        .score-ring-circle {
          transform: rotate(-90deg);
          transform-origin: 50% 50%;
        }

        .score-ring-circle-bg {
          stroke: #3a3a3a;
        }

        .score-ring-circle-progress {
          stroke: url(#scoreGradient);
          stroke-linecap: round;
          transition: stroke-dashoffset 0.5s ease;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .stats-item {
          animation: slideUp 0.6s ease-out forwards;
        }

        .stats-item:nth-child(1) { animation-delay: 0.2s; }
        .stats-item:nth-child(2) { animation-delay: 0.4s; }
        .stats-item:nth-child(3) { animation-delay: 0.6s; }
      `}</style>

      {/* Header with Medal */}
      <div className="mb-8">
        <p className="text-6xl mb-4 heart-beat">{getMedalEmoji(placement)}</p>
        <h3 className="text-3xl font-bold text-[#d4af37] mb-2" style={{ fontFamily: 'Playfair Display' }}>
          {teamName}
        </h3>
        <p className="text-[#888] text-sm" style={{ fontFamily: 'Crimson Text', fontSize: '1.1em' }}>
          {placement === 1 && '🎉 WINNERS! 🎉'}
          {placement === 2 && 'Runners Up'}
          {placement === 3 && 'Third Place'}
          {placement > 3 && `Place #${placement}`}
        </p>
      </div>

      {/* Score Circle */}
      <div className="mb-8">
        <svg className="score-ring" viewBox="0 0 200 200">
          <defs>
            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#d4af37', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#f0d966', stopOpacity: 1 }} />
            </linearGradient>
          </defs>
          <circle
            className="score-ring-circle score-ring-circle-bg"
            cx="100"
            cy="100"
            r="90"
            fill="none"
            strokeWidth="8"
          />
          <circle
            className="score-ring-circle score-ring-circle-progress"
            cx="100"
            cy="100"
            r="90"
            fill="none"
            strokeWidth="8"
            strokeDasharray={`${(score / 100) * 565.48} 565.48`}
          />
          <text
            x="100"
            y="115"
            textAnchor="middle"
            className="text-3xl font-bold"
            fill="#d4af37"
            style={{ fontFamily: 'Playfair Display', fontSize: '2.5em', letterSpacing: '0.05em' }}
          >
            {score}%
          </text>
        </svg>
      </div>

      {/* Compatibility Message */}
      <p
        className="text-2xl font-semibold text-[#d4af37] mb-8"
        style={{ fontFamily: 'Crimson Text', fontSize: '1.3em', fontStyle: 'italic' }}
      >
        {getCompatibilityMessage(score)}
      </p>

      {/* Final Points */}
      <div className="bg-[#3a3a3a] border border-[#d4af37] rounded-lg p-4 mb-8">
        <p className="text-[#888] text-sm mb-1" style={{ fontFamily: 'Crimson Text' }}>
          Total Points
        </p>
        <p className="text-4xl font-bold text-[#f0d966]" style={{ fontFamily: 'Playfair Display', letterSpacing: '0.1em' }}>
          {finalPoints}
        </p>
      </div>

      {/* Statistics */}
      <div className="space-y-3">
        <h4 className="text-[#d4af37] font-semibold mb-4" style={{ fontFamily: 'Playfair Display' }}>
          Match Breakdown
        </h4>

        <div className="stats-item flex items-center justify-between p-3 bg-[#3a3a3a] border border-green-700 rounded">
          <div className="flex items-center gap-2">
            <span className="text-2xl">✅</span>
            <span className="text-[#d4af37]" style={{ fontFamily: 'Crimson Text', fontSize: '1.1em' }}>
              Exact Matches
            </span>
          </div>
          <span className="text-green-400 font-bold text-lg">{exactMatches}</span>
        </div>

        <div className="stats-item flex items-center justify-between p-3 bg-[#3a3a3a] border border-yellow-700 rounded">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚠️</span>
            <span className="text-[#d4af37]" style={{ fontFamily: 'Crimson Text', fontSize: '1.1em' }}>
              Close Matches
            </span>
          </div>
          <span className="text-yellow-400 font-bold text-lg">{closeMatches}</span>
        </div>

        <div className="stats-item flex items-center justify-between p-3 bg-[#3a3a3a] border border-red-700 rounded">
          <div className="flex items-center gap-2">
            <span className="text-2xl">❌</span>
            <span className="text-[#d4af37]" style={{ fontFamily: 'Crimson Text', fontSize: '1.1em' }}>
              Misses
            </span>
          </div>
          <span className="text-red-400 font-bold text-lg">{missedMatches}</span>
        </div>
      </div>

      {/* Match Rate */}
      <div className="mt-6 pt-6 border-t border-[#d4af37]">
        <p className="text-[#888] text-sm mb-2" style={{ fontFamily: 'Crimson Text' }}>
          Match Rate
        </p>
        <div className="w-full bg-[#3a3a3a] border border-[#d4af37] rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-[#d4af37] to-[#f0d966] h-full transition-all duration-500"
            style={{ width: `${matchRate}%` }}
          />
        </div>
        <p className="text-[#d4af37] font-semibold mt-2" style={{ fontFamily: 'Playfair Display' }}>
          {matchRate.toFixed(0)}%
        </p>
      </div>
    </div>
  );
}
