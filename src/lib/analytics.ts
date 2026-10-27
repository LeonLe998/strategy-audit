/**
 * Tên event GA4 cho phễu hành trình. Giữ tên ổn định để so sánh số theo tuần.
 */
import { track } from '../analytics';

export const funnel = {
  stageView: (stage: string) => track('stage_view', { stage }),
  stageDone: (stage: string, points: number) => track('stage_done', { stage, points }),
  quizAnswer: (quiz: string, answer: string, correct: boolean) => track('quiz_answer', { quiz, answer, correct }),
  cardGuess: (card: string, guess: string, correct: boolean) => track('card_guess', { card, guess, correct }),
  pointsEarn: (source: string, delta: number) => track('points_earn', { source, delta }),
};
