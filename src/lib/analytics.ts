/**
 * Tên event GA4 cho phễu hành trình. Giữ tên ổn định để so sánh số theo tuần.
 */
import { track } from '../analytics';

export const funnel = {
  stageView: (stage: string) => track('stage_view', { stage }),
  stageDone: (stage: string, points: number) => track('stage_done', { stage, points }),
  quizAnswer: (quiz: string, answer: string, correct: boolean) => track('quiz_answer', { quiz, answer, correct }),
  /** Câu hỏi không có đáp án sai — dùng để chia nhóm người chơi theo điều họ tin */
  pollAnswer: (poll: string, answer: string) => track('poll_answer', { poll, answer }),
  cardGuess: (card: string, guess: string, correct: boolean) => track('card_guess', { card, guess, correct }),
  pointsEarn: (source: string, delta: number) => track('points_earn', { source, delta }),
  worldOpen: () => track('world_open', {}),
  /** Sảnh bản đồ ở trang chủ: xem hết / bỏ qua vòng giới thiệu, bấm vào đảo nào */
  hubTour: (action: 'done' | 'skip' | 'replay') => track('hub_tour', { action }),
  hubIsland: (island: string, via: 'island' | 'label' | 'menu' | 'caption') => track('hub_island', { island, via }),
};
