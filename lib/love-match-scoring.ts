/**
 * Love Match Scoring System
 */

export interface MatchResult {
  type: 'exact' | 'close' | 'miss';
  points: number;
  message: string;
}

/**
 * Score a round based on answers
 */
export function scoreRound(
  hotSeatAnswer: string,
  guesserAnswer: string,
  isHostApprovedClose: boolean = false
): MatchResult {
  const cleanHot = hotSeatAnswer.toLowerCase().trim();
  const cleanGuess = guesserAnswer.toLowerCase().trim();

  // Empty answers = miss
  if (!cleanHot || !cleanGuess) {
    return {
      type: 'miss',
      points: 0,
      message: '❌ No Answer',
    };
  }

  // Exact match (case-insensitive, whitespace-insensitive)
  if (cleanHot === cleanGuess) {
    return {
      type: 'exact',
      points: 3,
      message: '✅ EXACT MATCH',
    };
  }

  // Close match (host approved)
  if (isHostApprovedClose) {
    return {
      type: 'close',
      points: 1,
      message: '⚠️ CLOSE MATCH',
    };
  }

  // Complete miss
  return {
    type: 'miss',
    points: 0,
    message: '❌ MISS',
  };
}

/**
 * Calculate bonus points for a round
 */
export function calculateBonusPoints(
  matchType: 'exact' | 'close' | 'miss',
  isFirstToMatch: boolean = false,
  hotStreakCount: number = 0
): number {
  let bonus = 0;

  // Fastest exact match bonus
  if (matchType === 'exact' && isFirstToMatch) {
    bonus += 1;
  }

  // Hot streak bonus (3+ exact matches in a row)
  if (hotStreakCount >= 3 && matchType === 'exact') {
    bonus += 5;
  }

  return bonus;
}

/**
 * Calculate compatibility score (0-100)
 * Based on match rate and consistency
 */
export function calculateCompatibilityScore(
  exactMatches: number,
  closeMatches: number,
  missedMatches: number,
  totalRounds: number
): number {
  if (totalRounds === 0) return 0;

  // Exact matches worth 100%, close 50%, miss 0%
  const matchValue = exactMatches * 100 + closeMatches * 50;
  const maxPossible = totalRounds * 100;

  let score = Math.round((matchValue / maxPossible) * 100);

  // Cap at 100
  score = Math.min(score, 100);

  return score;
}

/**
 * Get compatibility message based on score
 */
export function getCompatibilityMessage(score: number): string {
  if (score >= 90) return '❤️ You REALLY know each other!';
  if (score >= 80) return '💛 Great team!';
  if (score >= 70) return '💙 Good connection!';
  if (score >= 60) return '💚 Still getting to know each other 😄';
  if (score >= 50) return '🤍 Time for more date nights!';
  return '💔 Keep trying!';
}

/**
 * Check if answer was submitted
 */
export function isAnswerSubmitted(answer: string | null | undefined): boolean {
  return !!answer && answer.trim().length > 0;
}

/**
 * Truncate answer for display
 */
export function truncateAnswer(answer: string, maxLength: number = 50): string {
  if (answer.length > maxLength) {
    return answer.substring(0, maxLength) + '...';
  }
  return answer;
}

/**
 * Leaderboard sorting and ranking
 */
export interface LeaderboardEntry {
  teamId: string;
  teamName: string;
  points: number;
  placement: number;
}

export function generateLeaderboard(
  teamPoints: Array<{ teamId: string; teamName: string; points: number }>
): LeaderboardEntry[] {
  // Sort by points descending
  const sorted = [...teamPoints].sort((a, b) => b.points - a.points);

  // Assign placements
  return sorted.map((team, idx) => ({
    ...team,
    placement: idx + 1,
  }));
}

/**
 * Get placement medal
 */
export function getPlacementMedal(placement: number): string {
  switch (placement) {
    case 1:
      return '🥇';
    case 2:
      return '🥈';
    case 3:
      return '🥉';
    default:
      return '•';
  }
}
