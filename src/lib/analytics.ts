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
  /** Ô Bước tiếp theo cuối trang: từ trang nào sang trang nào ('home' = về bản đồ) */
  nextStep: (from: string, to: string) => track('next_step', { from, to }),
  /** Bấm nút liên hệ: kênh nào, từ đâu (hub / tên trang) */
  contactClick: (channel: 'zalo' | 'telegram', from: string) => track('contact_click', { channel, from }),
  hubIsland: (island: string, via: 'island' | 'label' | 'menu' | 'caption' | 'bot') => track('hub_island', { island, via }),
  /** SA bot: khách trả lời đã từng vào chưa, hỏi lại, mở lại bong bóng */
  hubBot: (action: 'visited_yes' | 'visited_no' | 'reask' | 'open') => track('hub_bot', { action }),
};
