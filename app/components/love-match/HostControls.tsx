'use client';

import { useState } from 'react';

interface CloseMatch {
  teamName: string;
  hotSeatAnswer: string;
  guesserAnswer: string;
  onApprove: () => void;
  onReject: () => void;
}

interface HostControlsProps {
  isHost: boolean;
  currentPhase: string;
  roundNumber: number;
  maxRounds: number;
  closeMatches?: CloseMatch[];
  onSkipQuestion?: () => void;
  onExtendTimer?: (seconds: number) => void;
  onUnlockSpicy?: () => void;
}

export default function HostControls({
  isHost,
  currentPhase,
  roundNumber,
  maxRounds,
  closeMatches = [],
  onSkipQuestion,
  onExtendTimer,
  onUnlockSpicy,
}: HostControlsProps) {
  const [showControls, setShowControls] = useState(false);
  const [extendSeconds, setExtendSeconds] = useState(10);

  if (!isHost) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40">
      {/* Control Button */}
      <button
        onClick={() => setShowControls(!showControls)}
        className="bg-[#d4af37] hover:bg-[#f0d966] text-black font-bold py-3 px-4 rounded-full shadow-2xl transition transform hover:scale-110 flex items-center gap-2"
        title="Host Controls"
      >
        <span className="text-xl">⚙️</span>
        <span className="hidden sm:inline">Host</span>
      </button>

      {/* Controls Panel */}
      {showControls && (
        <div
          className="absolute bottom-16 right-0 bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] border-2 border-[#d4af37] rounded-lg shadow-2xl p-4 w-64 animate-in fade-in slide-in-from-bottom-2"
          style={{ animation: 'slideUp 0.3s ease-out' }}
        >
          <style>{`
            @keyframes slideUp {
              from {
                opacity: 0;
                transform: translateY(10px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `}</style>

          <h3 className="text-lg font-bold text-[#d4af37] mb-4" style={{ fontFamily: 'Playfair Display' }}>
            Host Controls
          </h3>

          {/* Round Info */}
          <div className="mb-4 p-2 bg-[#3a3a3a] rounded border border-[#d4af37]">
            <p className="text-xs text-[#888]" style={{ fontFamily: 'Crimson Text' }}>
              Round {roundNumber}/{maxRounds}
            </p>
            <p className="text-sm text-[#d4af37] font-semibold capitalize">{currentPhase}</p>
          </div>

          {/* Skip Question */}
          {currentPhase === 'question' && (
            <button
              onClick={() => {
                onSkipQuestion?.();
                setShowControls(false);
              }}
              className="w-full bg-orange-900 hover:bg-orange-800 text-orange-200 font-semibold py-2 px-3 rounded mb-3 text-sm transition"
              style={{ fontFamily: 'Crimson Text', fontSize: '0.95em' }}
            >
              ⏭️ Skip Question
            </button>
          )}

          {/* Extend Timer */}
          {(currentPhase === 'answer' || currentPhase === 'reveal') && (
            <div className="mb-3">
              <label className="text-xs text-[#d4af37] mb-2 block" style={{ fontFamily: 'Crimson Text' }}>
                Extend Timer
              </label>
              <div className="flex gap-2">
                <input
                  type="range"
                  min="5"
                  max="60"
                  value={extendSeconds}
                  onChange={(e) => setExtendSeconds(parseInt(e.target.value))}
                  className="flex-1 h-2 bg-[#3a3a3a] rounded appearance-none cursor-pointer"
                  style={{ accentColor: '#d4af37' }}
                />
                <span className="text-[#d4af37] font-bold text-sm w-8">{extendSeconds}s</span>
              </div>
              <button
                onClick={() => {
                  onExtendTimer?.(extendSeconds);
                  setShowControls(false);
                }}
                className="w-full bg-blue-900 hover:bg-blue-800 text-blue-200 font-semibold py-1 px-3 rounded mt-2 text-sm transition"
                style={{ fontFamily: 'Crimson Text', fontSize: '0.95em' }}
              >
                ⏱️ Add {extendSeconds}s
              </button>
            </div>
          )}

          {/* Judge Close Matches */}
          {currentPhase === 'reveal' && closeMatches.length > 0 && (
            <div className="mb-3 p-3 bg-yellow-900 bg-opacity-30 border border-yellow-700 rounded">
              <p className="text-xs text-yellow-300 font-semibold mb-2">⚠️ Close Matches to Judge</p>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {closeMatches.map((match, idx) => (
                  <div key={idx} className="text-xs bg-[#3a3a3a] p-2 rounded border border-[#d4af37]">
                    <p className="font-semibold text-[#d4af37] mb-1">{match.teamName}</p>
                    <div className="space-y-1 text-[#888] mb-2">
                      <p>'{match.hotSeatAnswer}'</p>
                      <p>vs '{match.guesserAnswer}'</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          match.onApprove();
                          setShowControls(false);
                        }}
                        className="flex-1 bg-green-900 hover:bg-green-800 text-green-200 font-semibold py-1 px-2 rounded text-xs transition"
                      >
                        ✓ Count
                      </button>
                      <button
                        onClick={() => {
                          match.onReject();
                          setShowControls(false);
                        }}
                        className="flex-1 bg-red-900 hover:bg-red-800 text-red-200 font-semibold py-1 px-2 rounded text-xs transition"
                      >
                        ✗ Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Unlock Spicy */}
          {roundNumber <= 3 && (
            <button
              onClick={() => {
                onUnlockSpicy?.();
                setShowControls(false);
              }}
              className="w-full bg-purple-900 hover:bg-purple-800 text-purple-200 font-semibold py-2 px-3 rounded text-sm transition"
              style={{ fontFamily: 'Crimson Text', fontSize: '0.95em' }}
            >
              🔥 Unlock Spicy Round
            </button>
          )}

          {/* Collapse */}
          <button
            onClick={() => setShowControls(false)}
            className="w-full text-[#888] hover:text-[#d4af37] text-xs mt-3 py-2 transition"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
