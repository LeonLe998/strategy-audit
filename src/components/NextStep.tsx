/**
 * Ô "Bước tiếp theo" cuối mỗi trang: dẫn sang đảo kế tiếp trên bản đồ, kèm nút về bản đồ.
 * Thứ tự lấy theo HUB.islands nên đổi thứ tự đảo là ô này đổi theo.
 */
import { HUB, NEXT_STEP } from '../content/journey';
import { funnel } from '../lib/analytics';

export default function NextStep({ tab, onGo }: { tab: string; onGo: (tab: string) => void }) {
  const idx = HUB.islands.findIndex((s) => s.tab === tab);
  const isLast = idx === HUB.islands.length - 1;
  const nextTab = idx >= 0 && !isLast ? HUB.islands[idx + 1].tab : NEXT_STEP.fallback;
  const next = HUB.islands.find((s) => s.tab === nextTab);
  if (!next || next.tab === tab) return null;

  const go = (to: string) => {
    funnel.nextStep(tab, to);
    onGo(to);
  };

  return (
    <section data-next-step={next.key} className="relative z-10 mx-auto mt-16 max-w-5xl px-4">
      <div className="flex flex-col gap-4 rounded-2xl border border-[#3df2ff]/30 bg-[#040914]/70 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <p className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#3df2ff]">
            {isLast ? NEXT_STEP.lastKicker : NEXT_STEP.kicker}
            {idx >= 0 && !isLast && ` · đảo ${idx + 2}/${HUB.islands.length}`}
          </p>
          <h3 className="mt-1 text-lg font-bold text-white">{next.title}</h3>
          <p className="mt-1 max-w-xl text-sm leading-relaxed text-gray-300">{next.caption}</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button type="button" onClick={() => go(next.tab)} className="rounded-xl bg-[#2BFFEA] px-5 py-3 text-sm font-bold text-black">
            {NEXT_STEP.go}
          </button>
          <button type="button" onClick={() => go('home')} className="rounded-xl border border-white/20 px-4 py-3 text-sm text-gray-200 hover:bg-white/5">
            {NEXT_STEP.backToMap}
          </button>
        </div>
      </div>
    </section>
  );
}
