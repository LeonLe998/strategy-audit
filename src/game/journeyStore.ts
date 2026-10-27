/**
 * Trạng thái hành trình, lưu trên máy người chơi (localStorage).
 *
 * Giai đoạn này điểm chỉ nằm trên máy: gian được nhưng chưa mở được gì.
 * Từ Màn 3 (có Zalo) ví sẽ chuyển lên server — xem kế hoạch GĐ2.
 */
import { STAGES, type StageId } from './journeyConfig';

const STORAGE_KEY = 'sa_journey_v1';

export interface LedgerEntry {
  /** Khoá duy nhất, chống cộng điểm hai lần cho cùng một việc */
  key: string;
  delta: number;
  reason: string;
  at: string;
}

export interface JourneyState {
  version: 1;
  completed: StageId[];
  ledger: LedgerEntry[];
  /** Câu trả lời của người chơi, ví dụ { 'khai-niem:quiz': 'B', 'card:IND002': 'CHÁT' } */
  answers: Record<string, string>;
}

export type StageStatus = 'locked' | 'open' | 'done';

const emptyState = (): JourneyState => ({ version: 1, completed: [], ledger: [], answers: {} });

function load(): JourneyState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw);
    if (parsed?.version !== 1 || !Array.isArray(parsed.completed) || !Array.isArray(parsed.ledger)) return emptyState();
    return { ...emptyState(), ...parsed };
  } catch {
    return emptyState();
  }
}

function save(next: JourneyState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Trình duyệt chặn lưu: vẫn chơi được trong phiên này
  }
}

let state: JourneyState = load();
const listeners = new Set<() => void>();

function setState(next: JourneyState) {
  state = next;
  save(next);
  listeners.forEach((fn) => fn());
}

export const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

export const getState = () => state;

export const pointsOf = (s: JourneyState) => s.ledger.reduce((sum, e) => sum + e.delta, 0);

export function stageStatus(s: JourneyState, id: StageId): StageStatus {
  if (s.completed.includes(id)) return 'done';
  const idx = STAGES.findIndex((st) => st.id === id);
  if (idx <= 0) return 'open';
  return s.completed.includes(STAGES[idx - 1].id) ? 'open' : 'locked';
}

/** Cộng/trừ điểm một lần duy nhất theo key. Trả về false nếu key đã có. */
export function award(key: string, delta: number, reason: string): boolean {
  if (state.ledger.some((e) => e.key === key)) return false;
  setState({ ...state, ledger: [...state.ledger, { key, delta, reason, at: new Date().toISOString() }] });
  return true;
}

export function recordAnswer(key: string, value: string) {
  setState({ ...state, answers: { ...state.answers, [key]: value } });
}

/** Hoàn thành màn đang mở và nhận thưởng của màn. Màn bị khoá thì không làm gì. */
export function completeStage(id: StageId): boolean {
  if (stageStatus(state, id) !== 'open') return false;
  const def = STAGES.find((st) => st.id === id)!;
  setState({ ...state, completed: [...state.completed, id] });
  if (def.reward > 0) award(`stage:${id}`, def.reward, `Hoàn thành màn ${def.order}: ${def.title}`);
  return true;
}

export function resetJourney() {
  setState(emptyState());
}
