/**
 * KHUNG trang hành trình 6 màn — chỉ có logic + bố cục tối thiểu.
 * Phần nhìn (màu, animation, bản đồ, con dấu) do Stitch → Antigravity làm lại,
 * giữ nguyên các lời gọi useJourney / useLibraryCards / funnel. Các thuộc tính data-* để bám vào khi style.
 */
import { useEffect, useState } from 'react';
import { useJourney, type StageView } from '../game/useJourney';
import { useLibraryCards, useLibrarySummary } from '../game/useLibraryCards';
import { POINT_NAME, type StageId } from '../game/journeyConfig';
import { STAGE1, STAGE2, type Verdict } from '../content/journey';
import { funnel } from '../lib/analytics';

const fmt = (n?: number) => (typeof n === 'number' ? n.toLocaleString('vi-VN') : '—');

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

function Stage1({ onDone }: { onDone: () => void }) {
  const { answers, recordAnswer } = useJourney();
  const { poll } = STAGE1;
  const picked = answers[poll.key];
  // Ô người chơi chọn lật trước, ba ô còn lại lật sau
  const ordered = picked ? [...poll.options].sort((a, b) => Number(b.id === picked) - Number(a.id === picked)) : poll.options;

  const pick = (id: string) => {
    if (picked) return;
    recordAnswer(poll.key, id);
    funnel.pollAnswer(poll.key, id);
  };

  return (
    <section data-stage-view="khai-niem" className="space-y-6">
      <header>
        <p className="text-xs text-gray-400">{STAGE1.kicker}</p>
        <h1 className="text-2xl font-bold text-white">{STAGE1.title}</h1>
      </header>
      <div className="grid gap-3 md:grid-cols-3">
        {STAGE1.steps.map((s) => (
          <article key={s.key} data-step={s.key} className="rounded-xl border border-white/10 p-4">
            <h2 className="font-semibold text-white">{s.title}</h2>
            <p className="mt-2 text-sm text-gray-300">{s.body}</p>
          </article>
        ))}
      </div>
      <div data-poll={poll.key} className="rounded-xl border border-white/10 p-4">
        <p className="font-semibold text-white">{poll.question}</p>
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          {ordered.map((o) => (
            <button
              key={o.id}
              type="button"
              data-option={o.id}
              data-picked={picked === o.id}
              data-revealed={Boolean(picked)}
              disabled={Boolean(picked)}
              onClick={() => pick(o.id)}
              className={`rounded-lg border p-3 text-left text-sm text-gray-200 ${picked === o.id ? 'border-white' : 'border-white/15'}`}
            >
              <b className="block text-white">{o.label}</b>
              {picked && <span data-fact className="mt-1 block text-xs text-gray-300">{o.fact}</span>}
            </button>
          ))}
        </div>
        {picked && <p data-poll-closing className="mt-3 text-sm text-gray-200">{poll.closing}</p>}
      </div>
      {picked && (
        <button type="button" data-cta onClick={onDone} className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-black">
          {STAGE1.cta}
        </button>
      )}
    </section>
  );
}

function Stage2({ onDone }: { onDone: () => void }) {
  const { answers, recordAnswer } = useJourney();
  const summary = useLibrarySummary();
  const cards = useLibraryCards(STAGE2.cards.map((c) => c.id));
  const allGuessed = STAGE2.cards.every((c) => answers[`card:${c.id}`]);

  const guess = (id: string, v: Verdict, truth: Verdict) => {
    if (answers[`card:${id}`]) return;
    recordAnswer(`card:${id}`, v);
    funnel.cardGuess(id, v, v === truth);
  };

  return (
    <section data-stage-view="vi-sao-kiem-dinh" className="space-y-6">
      <header>
        <p className="text-xs text-gray-400">{STAGE2.kicker}</p>
        <h1 className="text-2xl font-bold text-white">{STAGE2.title}</h1>
        <p className="mt-2 text-sm text-gray-300">{STAGE2.intro}</p>
      </header>

      <div data-library-funnel className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl border border-white/10 p-3"><b className="block text-2xl text-white">{fmt(summary?.tong)}</b><span className="text-xs text-gray-400">{STAGE2.funnelLabels.tong}</span></div>
        <div className="rounded-xl border border-white/10 p-3"><b className="block text-2xl text-white">{fmt(summary?.daChay)}</b><span className="text-xs text-gray-400">{STAGE2.funnelLabels.daChay}</span></div>
        <div className="rounded-xl border border-white/10 p-3"><b className="block text-2xl text-white">{fmt(summary?.verdict?.['CHẤT'])}</b><span className="text-xs text-gray-400">{STAGE2.funnelLabels.chat}</span></div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {STAGE2.facts.map((f) => (
          <article key={f.key} data-fact={f.key} className="rounded-xl border border-white/10 p-4">
            <h2 className="font-semibold text-white">{f.title}</h2>
            <p className="mt-1 text-sm text-gray-300">{f.body}</p>
          </article>
        ))}
      </div>

      <p className="text-sm text-gray-200">{STAGE2.gameIntro}</p>
      <ul data-verdict-legend className="space-y-1 text-sm text-gray-300">
        {STAGE2.verdictLegend.map((l) => (
          <li key={l.verdict} data-legend={l.verdict}>
            <b className="text-white">{l.verdict}</b>: {l.meaning}
          </li>
        ))}
      </ul>
      <div data-card-deck className="grid gap-3 md:grid-cols-3">
        {cards === null && <p className="text-sm text-gray-500">Đang chia bài…</p>}
        {cards?.map((card) => {
          const text = STAGE2.cards.find((c) => c.id === card.id);
          const mine = answers[`card:${card.id}`] as Verdict | undefined;
          return (
            <article key={card.id} data-card={card.id} data-flipped={Boolean(mine)} data-verdict={mine ? card.verdict : undefined} className="rounded-xl border border-white/10 p-4">
              <h3 className="font-semibold text-white">{text?.name ?? card.ten}</h3>
              <p className="mt-1 text-sm text-gray-300">Luật: {text?.rule ?? card.moTa}</p>
              {text?.hint && <p className="mt-1 text-xs text-gray-500">{text.hint}</p>}
              {!mine ? (
                <div className="mt-3 flex gap-2">
                  {STAGE2.verdictChoices.map((v) => (
                    <button key={v} type="button" data-guess={v} onClick={() => guess(card.id, v, card.verdict)} className="rounded-lg border border-white/20 px-3 py-2 text-xs font-bold text-white">
                      {v}
                    </button>
                  ))}
                </div>
              ) : (
                <div data-card-reveal className="mt-3 space-y-1 text-sm">
                  <p className="font-bold text-white" data-stamp={card.verdict}>{card.verdict}</p>
                  <p className="text-gray-400">{mine === card.verdict ? 'Bạn đoán đúng.' : `Bạn đoán ${mine}.`}</p>
                  <p className="text-xs text-gray-400">{STAGE2.reveal.thi1}:</p>
                  <p className="font-mono text-xs text-gray-300">
                    {fmt(card.soLenh)} lệnh · thắng {card.tiLeThang?.toLocaleString('vi-VN')}% số lệnh · {card.namDuong} năm có lời
                  </p>
                  {card.thiLan2 && <p className="font-mono text-xs text-gray-300">{STAGE2.reveal.thi2}: {card.thiLan2}</p>}
                </div>
              )}
            </article>
          );
        })}
      </div>

      {allGuessed && (
        <>
          <p data-stage2-wrapup className="text-sm text-gray-200">{STAGE2.wrapUp}</p>
          <button type="button" data-cta onClick={onDone} className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-black">
            {STAGE2.cta}
          </button>
        </>
      )}
    </section>
  );
}

function StagePlaceholder({ stage }: { stage: StageView }) {
  return (
    <section data-stage-view={stage.id} className="rounded-xl border border-dashed border-white/20 p-6 text-sm text-gray-300">
      <p className="text-xs text-gray-400">Màn {stage.order}</p>
      <h1 className="text-xl font-bold text-white">{stage.title}</h1>
      {stage.id === 'sau-o' ? (
        <p className="mt-2">
          Màn này nối với Sáu Ô và ví điểm trên server ở GĐ2.{' '}
          <a className="underline" href="/sauo?hanh-trinh">Làm Sáu Ô bản hiện tại</a>
        </p>
      ) : (
        <p className="mt-2">Màn này làm ở giai đoạn sau.</p>
      )}
    </section>
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
