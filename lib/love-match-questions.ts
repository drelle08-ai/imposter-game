// Love Match Question Database
// 4 Categories with Difficulty Levels: Easy, Medium, Hard

export interface QuestionSet {
  easy: string[];
  medium: string[];
  hard: string[];
}

export const LOVE_MATCH_QUESTIONS: Record<string, QuestionSet> = {
  food: {
    easy: [
      "What is your partner's go-to coffee order?",
      "What's your partner's favorite restaurant?",
      "What dessert is your partner's weakness?",
      "What does your partner always order for takeout?",
      "What's your partner's favorite snack?",
    ],
    medium: [
      "What's your partner's weirdest food combo?",
      "Where does your partner hide snacks?",
      "What's your partner's guilty pleasure snack?",
      "If your partner could only eat one cuisine, what would it be?",
      "What restaurant does your partner refuse to go to?",
      "What food makes your partner irrationally angry?",
      "What breakfast does your partner always order?",
      "What's your partner's spice tolerance level?",
      "What's your partner's most hated food?",
    ],
    hard: [
      "What's the most disgusting thing you've seen your partner eat?",
      "What does your partner eat when they think no one is looking?",
      "What would your partner survive on if stuck on an island?",
      "What food combination does your partner love that others think is weird?",
      "What's your partner's favorite homemade meal?",
      "What's your partner's midnight snack of choice?",
    ],
  },

  romance: {
    easy: [
      "Where did you first meet your partner?",
      "What was your first date?",
      "Where did we first kiss?",
      "What's your partner's love language?",
      "What's your partner's favorite thing about you?",
    ],
    medium: [
      "When did you know your partner was 'the one'?",
      "What was your first impression of your partner?",
      "What's your partner's ideal date night?",
      "What was the best gift your partner gave you?",
      "How did your partner win over your parents?",
      "When did your partner first say 'I love you'?",
      "What does your partner do that makes you fall for them more?",
      "How does your partner show affection?",
      "What does your partner call you most often?",
    ],
    hard: [
      "What's your partner's most romantic gesture?",
      "What song was playing during our first kiss?",
      "What's the sweetest thing your partner has ever said?",
      "What's your partner's biggest romantic fantasy?",
      "What was your partner wearing when you first met?",
      "How many dates before you said 'I love you'?",
      "What's your partner's favorite memory of us together?",
      "What's the most thoughtful thing your partner has done?",
    ],
  },

  confessions: {
    easy: [
      "What's your partner's guilty pleasure TV show?",
      "What's your partner's most annoying habit?",
      "What celebrity does your partner have a crush on?",
      "What's your partner's worst habit?",
      "What's your partner's most unpopular opinion?",
    ],
    medium: [
      "What embarrassing thing does your partner do when alone?",
      "What does your partner do that's totally weird?",
      "What does your partner pretend to like but actually hates?",
      "What's your partner's most embarrassing fear?",
      "What's something you've caught them doing and never told them?",
      "What does your partner secretly spend money on?",
      "What does your partner do that drives you crazy?",
      "What's your partner's pettiest pet peeve?",
      "What does your partner do that's totally childish?",
    ],
    hard: [
      "What does your partner do in the shower that would surprise people?",
      "What's your partner's most embarrassing moment?",
      "What does your partner do that nobody else sees?",
      "What's your partner's most embarrassing search history?",
      "What childish fear does your partner still have?",
      "What's something your partner does that's out of character?",
      "What's the most embarrassing thing your partner owns?",
      "What does your partner lie about most?",
      "What's your partner's weirdest talent?",
      "What does your partner absolutely hate admitting?",
    ],
  },

  custom: {
    easy: [],
    medium: [],
    hard: [],
  },
};

/**
 * Get a random question from a category and difficulty
 */
export function getRandomQuestion(
  category: keyof typeof LOVE_MATCH_QUESTIONS,
  difficulty: 'easy' | 'medium' | 'hard' = 'medium'
): string {
  const categoryQuestions = LOVE_MATCH_QUESTIONS[category];
  const questions = categoryQuestions[difficulty];

  if (questions.length === 0) {
    // Fallback to medium if difficulty not available
    return categoryQuestions.medium[Math.floor(Math.random() * categoryQuestions.medium.length)];
  }

  return questions[Math.floor(Math.random() * questions.length)];
}

/**
 * Determine difficulty based on round number
 */
export function getDifficultyForRound(roundNumber: number, maxRounds: number = 10): 'easy' | 'medium' | 'hard' {
  const progress = roundNumber / maxRounds;

  if (progress < 0.4) return 'easy';
  if (progress < 0.7) return 'medium';
  return 'hard';
}

/**
 * Get random questions for a full game with progressive difficulty
 */
export function getGameQuestions(
  numRounds: number = 10,
  customQuestions: string[] = []
) {
  const questions: string[] = [];
  const categories = ['food', 'romance', 'confessions'] as const;

  for (let i = 0; i < numRounds; i++) {
    // Rotate through categories
    const category = categories[i % categories.length];

    // Progressive difficulty
    const difficulty = getDifficultyForRound(i + 1, numRounds);

    // Get random question with difficulty
    const question = getRandomQuestion(category, difficulty);
    questions.push(question);
  }

  // Mix in custom questions if provided
  if (customQuestions.length > 0) {
    const indices = questions
      .map((_, i) => i)
      .sort(() => 0.5 - Math.random())
      .slice(0, customQuestions.length);

    customQuestions.forEach((customQ, idx) => {
      if (indices[idx] !== undefined) {
        questions[indices[idx]] = customQ;
      }
    });
  }

  return questions;
}

/**
 * Get questions for a specific round
 */
export function getQuestionsForRound(
  roundNumber: number,
  maxRounds: number = 10,
  customQuestions: string[] = []
) {
  const allQuestions = getGameQuestions(maxRounds, customQuestions);
  return allQuestions[roundNumber - 1] || allQuestions[0];
}
