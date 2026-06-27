'use client';

import { SpecialRoundType, SPECIAL_ROUNDS, getWildcardRule } from '@/lib/love-match-scoring';

interface SpecialRoundProps {
  type: SpecialRoundType;
  teamBetAmount?: number;
  isWildcard?: boolean;
}

export default function SpecialRound({
  type,
  teamBetAmount = 0,
  isWildcard = false,
}: SpecialRoundProps) {
  if (!type) return null;

  const config = SPECIAL_ROUNDS[type];
  if (!config) return null;

  // Get wildcard rule if this is a wildcard round
  const wildcardRule = isWildcard && type === 'wildcard' ? getWildcardRule() : null;

  return (
    <div
      className="bg-gradient-to-r from-purple-900 to-pink-900 border-2 border-purple-500 rounded-lg p-6 mb-6 animate-pulse"
      style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}
    >
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }

        @keyframes shimmer {
          0% { left: -100%; }
          100% { left: 100%; }
        }

        .shimmer {
          position: relative;
          overflow: hidden;
        }

        .shimmer::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.2),
            transparent
          );
          animation: shimmer 2s infinite;
        }
      `}</style>

      <div className="text-center">
        {/* Icon */}
        <div className="text-6xl mb-3">{config.icon}</div>

        {/* Title */}
        <h3 className="text-3xl font-bold text-white mb-2 drop-shadow-lg" style={{ fontFamily: 'Playfair Display', letterSpacing: '0.1em' }}>
          🌟 {config.name} 🌟
        </h3>

        {/* Description */}
        <p className="text-purple-100 mb-4" style={{ fontFamily: 'Crimson Text', fontSize: '1.1em' }}>
          {config.description}
        </p>

        {/* Special Round Details */}
        {type === 'double_or_nothing' && teamBetAmount > 0 && (
          <div className="bg-black bg-opacity-40 border border-purple-400 rounded p-3">
            <p className="text-yellow-300 font-bold text-lg">
              💰 You're betting {teamBetAmount} points!
            </p>
            <p className="text-purple-200 text-sm mt-2">
              Match = Win your bet! Miss = Lose your bet!
            </p>
          </div>
        )}

        {type === 'audience_guess' && (
          <div className="bg-black bg-opacity-40 border border-purple-400 rounded p-3">
            <p className="text-pink-300 font-bold">Other couples will guess YOUR answer!</p>
            <p className="text-purple-200 text-sm mt-2">
              If you're the only ones who match: +5 bonus points! 🎯
            </p>
          </div>
        )}

        {type === 'hot_streak' && (
          <div className="bg-black bg-opacity-40 border border-purple-400 rounded p-3">
            <p className="text-orange-300 font-bold">3 exact matches in a row = +5 bonus!</p>
            <p className="text-purple-200 text-sm mt-2">Keep the streak going! 🔥</p>
          </div>
        )}

        {type === 'wildcard' && wildcardRule && (
          <div className="bg-black bg-opacity-40 border border-purple-400 rounded p-3">
            <p className="text-2xl mb-2">{wildcardRule.emoji}</p>
            <p className="text-cyan-300 font-bold text-lg drop-shadow-lg">
              {wildcardRule.rule}
            </p>
            <p className="text-purple-200 text-sm mt-2">
              {wildcardRule.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
