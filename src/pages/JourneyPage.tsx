/**
 * KHUNG trang hành trình 6 màn — chỉ có logic + bố cục tối thiểu.
 * Phần nhìn (màu, animation, bản đồ, con dấu) do Stitch → Antigravity làm lại,
 * giữ nguyên các lời gọi useJourney / useLibraryCards / funnel. Các thuộc tính data-* để bám vào khi style.
 */
import { useEffect, useState } from 'react';
import { useJourney, type StageView } from '../game/useJourney';
import { POINT_NAME, type StageId } from '../game/journeyConfig';
import { Stage1, Stage2, StagePlaceholder } from '../game/JourneyStages';
import { funnel } from '../lib/analytics';

function StageMap({ stages, selected, onSelect }: { stages: StageView[]; selected: StageId; onSelect: (id: StageId) => void }) {
  return (
    <ol data-journey-map className="grid grid-cols-3 gap-2 md:grid-cols-6">
      {stages.map((st) => (
        <li key={st.id}>
          <button
            type="button"
            data-stage={st.id}
            data-status={st.status}
            data-selected={st.id === selected}
            disabled={st.status === 'locked'}
            onClick={() => onSelect(st.id)}
            className={`w-full rounded-xl border p-3 text-left text-xs ${st.id === selected ? 'border-white' : 'border-white/15'} disabled:opacity-40`}
          >
            <span className="block font-mono text-gray-400">Màn {st.order}</span>
            <span className="block font-semibold text-white">{st.title}</span>
            <span className="block text-gray-500">{st.status === 'done' ? 'Đã qua' : st.status === 'open' ? 'Đang mở' : 'Đang khoá'}</span>
          </button>
        </li>
      ))}
    </ol>
  );
}

export default function JourneyPage() {
  const journey = useJourney();
  const [selected, setSelected] = useState<StageId>(journey.current.id);

  useEffect(() => {
    funnel.stageView(selected);
  }, [selected]);

  const finish = (id: StageId) => {
    journey.completeStage(id);
    const next = journey.stages.find((st) => st.order === (journey.stages.find((s) => s.id === id)?.order ?? 0) + 1);
    if (next) setSelected(next.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const stage = journey.stages.find((st) => st.id === selected) ?? journey.current;

  return (
    <div data-journey className="mx-auto max-w-5xl space-y-6 px-4 pb-24">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-300">Hành trình Đo trước khi tin</p>
        <p data-points className="font-mono text-sm text-white">{journey.points} {POINT_NAME}</p>
      </div>
      <StageMap stages={journey.stages} selected={stage.id} onSelect={setSelected} />
      {stage.id === 'khai-niem' && <Stage1 onDone={() => finish('khai-niem')} />}
      {stage.id === 'vi-sao-kiem-dinh' && <Stage2 onDone={() => finish('vi-sao-kiem-dinh')} />}
      {stage.id !== 'khai-niem' && stage.id !== 'vi-sao-kiem-dinh' && <StagePlaceholder stage={stage} />}
    </div>
  );
}
