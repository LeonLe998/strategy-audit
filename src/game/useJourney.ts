/**
 * Hook dùng chung cho giao diện hành trình.
 * Giao diện (Stitch → Antigravity) chỉ đọc giá trị và gọi hàm ở đây, không tự sửa localStorage.
 */
import { useMemo, useSyncExternalStore } from 'react';
import { STAGES, type StageDef, type StageId } from './journeyConfig';
import {
  award, completeStage, getState, pointsOf, recordAnswer, resetJourney, stageStatus, subscribe,
  type StageStatus,
} from './journeyStore';
import { funnel } from '../lib/analytics';

export interface StageView extends StageDef {
  status: StageStatus;
}

export function useJourney() {
  const state = useSyncExternalStore(subscribe, getState, getState);

  return useMemo(() => {
    const points = pointsOf(state);
    const stages: StageView[] = STAGES.map((st) => ({ ...st, status: stageStatus(state, st.id) }));
    const current = stages.find((st) => st.status === 'open') ?? stages[stages.length - 1];

    return {
      points,
      stages,
      /** Màn đầu tiên chưa xong — nơi người chơi đang đứng */
      current,
      answers: state.answers,
      ledger: state.ledger,
      completeStage(id: StageId) {
        const ok = completeStage(id);
        if (ok) funnel.stageDone(id, pointsOf(getState()));
        return ok;
      },
      recordAnswer,
      award,
      reset: resetJourney,
    };
  }, [state]);
}
