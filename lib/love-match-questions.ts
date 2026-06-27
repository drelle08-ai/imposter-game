// Love Match Question Database
// 4 Categories: Food, Romance, Confessions, Custom

export const LOVE_MATCH_QUESTIONS = {
  food: [
    "What is your partner's go-to coffee order?",
    "What's your partner's weirdest food combo?",
    "Where does your partner hide snacks?",
    "What's your partner's guilty pleasure snack?",
    "If your partner could only eat one cuisine forever, what would it be?",
    "What's the most disgusting thing you've seen your partner eat?",
    "What food would your partner survive on if stuck on an island?",
    "What restaurant does your partner take you to most?",
    "What's your partner's most hated food?",
    "What breakfast does your partner always order?",
    "What's your partner's takeout order (they always get the same thing)?",
    "What dessert is your partner's weakness?",
    "What does your partner always order at restaurants?",
    "What food makes your partner irrationally angry?",
    "What's your partner's favorite midnight snack?",
    "What does your partner eat when they think no one is looking?",
    "What restaurant does your partner refuse to go to?",
    "What's your partner's spice tolerance level?",
    "What's your partner's favorite homemade meal?",
    "What food combination does your partner love that others think is weird?",
  ],

  romance: [
    "Where did we first kiss?",
    "What was your first impression of your partner?",
    "Where did you first meet your partner?",
    "What's your partner's love language?",
    "Where was our first date?",
    "What was the restaurant for our first date?",
    "How did your partner propose/ask you out?",
    "What's your partner's favorite thing about you?",
    "When did you know your partner was 'the one'?",
    "What's your partner's most romantic gesture?",
    "What was your partner wearing when you first met?",
    "What song was playing during our first kiss?",
    "What does your partner do that makes you fall for them more?",
    "What's your partner's biggest romantic fantasy?",
    "How did your partner win over your parents?",
    "What's your partner's ideal date night?",
    "What was the best gift your partner gave you?",
    "What's the sweetest thing your partner has ever said?",
    "How many dates before you said 'I love you'?",
    "What's your partner's favorite memory of us together?",
    "When did your partner first say 'I love you'?",
    "What was your partner's first impression of you?",
    "What's the most thoughtful thing your partner has done?",
    "How does your partner show affection?",
    "What does your partner call you most often?",
  ],

  confessions: [
    "What embarrassing thing does your partner do when alone?",
    "What's your partner's most annoying habit?",
    "What does your partner do that drives you crazy?",
    "What's something you've caught your partner doing and never told them?",
    "What's your partner's guilty pleasure TV show?",
    "What does your partner do that's totally weird?",
    "What's your partner's most embarrassing fear?",
    "What does your partner pretend to like but actually hates?",
    "What's your partner's worst habit?",
    "What does your partner do in the shower that would surprise people?",
    "What's your partner's most embarrassing moment you know about?",
    "What does your partner do that nobody else sees?",
    "What celebrity does your partner have an embarrassing crush on?",
    "What's your partner's most unpopular opinion?",
    "What does your partner secretly spend money on?",
    "What's something your partner does that's totally out of character?",
    "What childhood fear does your partner still have?",
    "What's your partner's pettiest pet peeve?",
    "What does your partner do when they think nobody is watching?",
    "What's your partner's most embarrassing search history?",
    "What does your partner do that's totally childish?",
    "What's your partner's weirdest talent?",
    "What does your partner absolutely hate admitting?",
    "What's the most embarrassing thing your partner owns?",
    "What does your partner lie about most?",
  ],

  custom: [], // Filled by players during game setup
};

// Question difficulties for question progression
export const QUESTION_DIFFICULTIES = {
  easy: [
    "What is your partner's go-to coffee order?",
    "What was your first date location?",
    "Where did we first kiss?",
    "What's your partner's favorite color?",
    "What restaurant does your partner go to most?",
  ],
  medium: [
    "What's your partner's guilty pleasure snack?",
    "What's your partner's most annoying habit?",
    "When did your partner say 'I love you'?",
    "What does your partner order at our favorite restaurant?",
    "What's your partner's weirdest food combo?",
  ],
  hard: [
    "What embarrassing thing does your partner do alone?",
    "What would your partner order on a first date with someone else?",
    "What's something you've caught your partner doing and never told them?",
    "What does your partner do that drives you most crazy?",
    "What's your partner's most irrational fear?",
  ],
};

/**
 * Get a random question from a category
 */
export function getRandomQuestion(category: keyof typeof LOVE_MATCH_QUESTIONS) {
  const questions = LOVE_MATCH_QUESTIONS[category];
  return questions[Math.floor(Math.random() * questions.length)];
}

/**
 * Get random questions for a full game
 */
export function getGameQuestions(
  numRounds: number = 10,
  customQuestions: string[] = []
) {
  const questions: string[] = [];
  const categories = ['food', 'romance', 'confessions'] as const;

  for (let i = 0; i < numRounds; i++) {
    // Rotate through categories, add custom questions
    const category = categories[i % categories.length];
    const question = getRandomQuestion(category);
    questions.push(question);
  }

  // Mix in custom questions if provided
  if (customQuestions.length > 0) {
    const indices = questions.map((_, i) => i).sort(() => 0.5 - Math.random()).slice(0, customQuestions.length);
    customQuestions.forEach((customQ, idx) => {
      if (indices[idx] !== undefined) {
        questions[indices[idx]] = customQ;
      }
    });
  }

  return questions;
}

/**
 * Get questions for a specific round (with progression)
 */
export function getQuestionsForRound(
  roundNumber: number,
  customQuestions: string[] = []
) {
  const allQuestions = getGameQuestions(10, customQuestions);
  return allQuestions[roundNumber - 1] || allQuestions[0];
}
