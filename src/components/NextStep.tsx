/**
 * Ô "Bước tiếp theo" cuối mỗi trang: dẫn sang đảo kế tiếp trên bản đồ, kèm nút về bản đồ và nút liên hệ.
 * Thứ tự lấy theo HUB.islands nên đổi thứ tự đảo là ô này đổi theo.
 */
import { CONTACT, HUB, NEXT_STEP } from '../content/journey';
import ContactLinks from './ContactLinks';
import { GlassCard } from './Glass';
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
      <GlassCard tilt={false} className="p-5 sm:p-6">
        {/* Quầng sáng góc phải cho tấm kính có chiều sâu */}
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[#2BFFEA]/15 blur-3xl" />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#3df2ff]">
              {isLast ? NEXT_STEP.lastKicker : NEXT_STEP.kicker}
              {idx >= 0 && !isLast && ` · đảo ${idx + 2}/${HUB.islands.length}`}
            </p>
            <h3 className="mt-1 text-xl font-bold text-white">{next.title}</h3>
            <p className="mt-1 max-w-xl text-sm leading-relaxed text-gray-300">{next.caption}</p>
          </div>
          <div className="flex shrink-0 gap-2">
            <button type="button" onClick={() => go(next.tab)} className="sa-glass-btn rounded-xl px-5 py-3 text-sm font-bold">
              {NEXT_STEP.go}
            </button>
            <button type="button" onClick={() => go('home')} className="sa-glass-ghost rounded-xl px-4 py-3 text-sm text-gray-200">
              {NEXT_STEP.backToMap}
            </button>
          </div>
        </div>
        <div className="mt-5 flex flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-400">{CONTACT.ask}</p>
          <ContactLinks from={tab} className="shrink-0" />
        </div>
      </GlassCard>
    </section>
  );
}
