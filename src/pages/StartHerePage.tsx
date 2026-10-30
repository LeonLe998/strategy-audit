/**
 * Đảo 1 · Bắt đầu ở đây (/hanh-trinh): trang thu hút cho người mới, thay trò chơi Màn 1–2.
 * Năm màn hình, mỗi màn một hình lớn + một câu, cùng phong cách kính phát sáng: phễu kính 3D · cái cân 3D · bốn thẻ kính bị đóng dấu
 * · lịch để bàn kính 3D · câu hỏi chốt.
 * Mỗi cảnh chạy một lần khi cuộn tới (GSAP). Giữ cuộn gốc của trình duyệt, không ghim, không gắn hiệu ứng vào vị trí cuộn:
 * đã thử Lenis + ghim, Leon thấy giật hơn. Không dùng bộ lọc mờ SVG/CSS trên thứ đang chuyển động vì mỗi khung hình phải vẽ lại.
 * Chữ ở START_HERE trong content/journey.ts.
 */
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { useGSAP } from '@gsap/react';
import { START_HERE } from '../content/journey';
import { FilterScene, ScaleScene, CalendarScene } from '../game/world/StartScenes3D';
import { funnel } from '../lib/analytics';
import { GlassCard } from '../components/Glass';

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

const S = START_HERE;
/** Hiệu ứng chỉ chạy khi phần đó đã lên tới khoảng giữa màn hình, không chạy sớm lúc vừa ló ở mép dưới */
const REACHED = '0px 0px -30% 0px';

/** Số chạy mượt tới `value`; giá trị đổi (kể cả khi cuộn ngược) thì chạy tiếp từ số đang hiện */
function Counter({ value, ms }: { value: number; ms: number }) {
  const [n, setN] = useState(value);
  const cur = useRef(value);
  useEffect(() => {
    const from = cur.current;
    const start = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const k = Math.min((now - start) / ms, 1);
      cur.current = Math.round(from + (value - from) * (1 - Math.pow(1 - k, 3)));
      setN(cur.current);
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, ms]);
  return <>{n}</>;
}

/** Thứ tự rơi rụng cố định của lưới chấm: hạng nhỏ bị loại trước, chỉ những hạng cuối còn sáng tới ô cuối */
const [N0, N1, N2] = S.hero.stats.map((s) => s.n);
const RANK = (() => {
  const idx = Array.from({ length: N0 }, (_, i) => i);
  let seed = 11;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  const rank: number[] = [];
  idx.forEach((d, r) => (rank[d] = r));
  return rank;
})();
const COLS = 30;

type Dot = 'off' | 'on' | 'dim' | 'hot';
/** Trạng thái một chấm ở ô `card` theo bước của chuỗi hiệu ứng (1: ô 1 sáng · 2–3: ô 2 rụng · 4–5: ô 3 còn lại) */
function dotState(card: number, step: number, r: number): Dot {
  const cut1 = r < N0 - N1;
  if (card === 0) return step >= 1 ? 'on' : 'off';
  if (card === 1) return step < 2 ? 'off' : step === 2 || !cut1 ? 'on' : 'dim';
  if (step < 4) return 'off';
  if (step === 4) return cut1 ? 'dim' : 'on';
  return r >= N0 - N2 ? 'hot' : 'dim';
}
const DOT_STYLE: Record<Dot, { fill: string; opacity: number }> = {
  off: { fill: '#9fb0bf', opacity: 0.08 },
  on: { fill: '#9bb8c9', opacity: 0.9 },
  dim: { fill: '#3a4656', opacity: 0.45 },
  hot: { fill: '#2BFFEA', opacity: 1 },
};

function DotGrid({ card, step }: { card: number; step: number }) {
  return (
    <svg viewBox={`0 0 ${COLS * 10} ${Math.ceil(N0 / COLS) * 10}`} className="mt-2 w-full" aria-hidden>
      {RANK.map((r, d) => {
        const st = dotState(card, step, r);
        const col = d % COLS;
        const row = Math.floor(d / COLS);
        // Sáng lên theo làn sóng chéo; rụng xuống lác đác theo thứ hạng
        const delay = st === 'on' ? (col + row) * 14 : (r % 45) * 13;
        return (
          <rect
            key={d}
            x={col * 10 + 2}
            y={row * 10 + 2}
            width={6}
            height={6}
            rx={1.5}
            style={{
              ...DOT_STYLE[st],
              transition: `fill .5s ${delay}ms, opacity .5s ${delay}ms`,
            }}
          />
        );
      })}
    </svg>
  );
}

/** Mũi tên nối hai ô: luồng sáng chạy qua khi tới lượt, kèm số bị rụng */
function Pass({ on, drop }: { on: boolean; drop: number }) {
  return (
    <div className="flex w-6 flex-col items-center justify-center gap-1 sm:w-12">
      <div className="relative h-0.5 w-full overflow-hidden rounded bg-white/10">
        {on && (
          <motion.span
            initial={{ x: '-100%' }}
            animate={{ x: '200%' }}
            transition={{ duration: 0.6, ease: 'easeIn' }}
            className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-[#2BFFEA] to-transparent"
          />
        )}
      </div>
      <motion.span
        initial={{ opacity: 0, y: -4 }}
        animate={on ? { opacity: 1, y: 0 } : { opacity: 0, y: -4 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="font-mono text-[10px] font-semibold text-[#ff5a6a] sm:text-xs"
      >
        −{drop}
      </motion.span>
    </div>
  );
}

/** Ba ô 300 → 242 → 15: mỗi ô một lưới 300 chấm, chấm rụng dần qua từng ô, ô cuối chỉ còn 15 chấm sáng.
 *  `step` (0–5) do vị trí cuộn quyết định, cuộn ngược thì chạy lùi. */
function FunnelStats({ step }: { step: number }) {
  const counters = [
    { value: step >= 1 ? N0 : 0, ms: 1100 },
    { value: step >= 3 ? N1 : N0, ms: 900 },
    { value: step >= 5 ? N2 : N1, ms: 1400 },
  ];
  const opens = [1, 2, 4];
  const card = (i: number) => {
    const s = S.hero.stats[i];
    const done = i === 2 && step >= 5;
    return (
      <GlassCard tint={done ? 'cyan' : 'clear'} className={`h-full px-2 pb-2 pt-3 text-center transition-opacity duration-700 ${step >= opens[i] ? 'opacity-100' : 'opacity-40'}`}>
        <p
          className={`bg-clip-text font-mono text-2xl font-bold text-transparent sm:text-4xl ${
            i === 2 ? 'bg-gradient-to-b from-white to-[#2BFFEA] drop-shadow-[0_0_14px_rgba(43,255,234,0.55)]' : 'bg-gradient-to-b from-white to-[#9fc4d6]'
          }`}
        >
          {step >= opens[i] ? <Counter value={counters[i].value} ms={counters[i].ms} /> : '–'}
        </p>
        <p className="mt-0.5 text-[11px] leading-tight text-gray-300/80 sm:text-xs">{s.label}</p>
        <DotGrid card={i} step={step} />
        {done && (
          <motion.div
            initial={{ x: '-120%' }}
            animate={{ x: '220%' }}
            transition={{ delay: 1.2, duration: 1.1, ease: 'easeInOut' }}
            className="pointer-events-none absolute inset-y-0 left-0 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/25 to-transparent"
          />
        )}
      </GlassCard>
    );
  };
  return (
    <div className="sa-stats mt-2 flex w-full max-w-3xl items-stretch">
      <div className="flex-1">{card(0)}</div>
      <Pass on={step >= 2} drop={N0 - N1} />
      <div className="flex-1">{card(1)}</div>
      <Pass on={step >= 4} drop={N1 - N2} />
      <div className="flex-1">{card(2)}</div>
    </div>
  );
}

/** Màn đầu: tiêu đề hiện từng chữ; ba ô lọc dần 300 → 242 → 15 khi đã lên gần hết màn hình */
function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);
  useGSAP(
    () => {
      if (reduce) {
        setStep(5);
        return;
      }
      const split = SplitText.create('.sa-title', { type: 'words' });
      gsap.from(split.words, { y: 34, opacity: 0, stagger: 0.07, duration: 0.8, ease: 'power3.out', delay: 0.15 });
      ScrollTrigger.create({
        trigger: '.sa-stats',
        start: 'bottom 95%',
        once: true,
        onEnter: () => [0, 1.3, 1.9, 3, 3.7].forEach((t, i) => gsap.delayedCall(t, () => setStep(i + 1))),
      });
    },
    { scope: ref, dependencies: [reduce] },
  );
  return (
    <section ref={ref} data-start="hero" className="flex min-h-[86vh] flex-col items-center justify-center py-14">
      <p className="font-mono text-xs font-semibold uppercase tracking-widest text-[#3df2ff]">{S.hero.kicker}</p>
      <h1 className="sa-title mt-3 max-w-3xl text-center text-3xl font-bold leading-tight text-white sm:text-5xl">{S.hero.title}</h1>
      <FilterScene className="mt-2 h-[58vh] min-h-[340px] w-full max-w-4xl" />
      <FunnelStats step={step} />
      <p className="mt-8 animate-pulse text-xs text-gray-500">{S.hero.scroll}</p>
    </section>
  );
}

function Screen({ children, id }: { children: ReactNode; id: string }) {
  return (
    <section data-start={id} className="flex min-h-[86vh] flex-col items-center justify-center py-14">
      {children}
    </section>
  );
}

function Line({ title, body }: { title: string; body: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: REACHED }}
      transition={{ duration: 0.5 }}
      className="mx-auto max-w-2xl text-center"
    >
      <h2 className="text-2xl font-bold leading-tight text-white sm:text-4xl">{title}</h2>
      <p className="mt-3 text-sm leading-relaxed text-gray-300 sm:text-base">{body}</p>
    </motion.div>
  );
}

/** Cái cân 3D (cột kính, đòn kim loại, đĩa kính) + hai nhãn dưới hai đĩa */
function Scale() {
  return (
    <div className="w-full max-w-2xl">
      <ScaleScene className="h-[46vh] min-h-[280px] w-full" />
      <div className="-mt-3 grid grid-cols-2 px-[6%] text-center text-xs font-semibold sm:text-sm">
        <span className="text-[#2BFFEA]">{S.winRate.wins}</span>
        <span className="text-gray-400">{S.winRate.losses}</span>
      </div>
    </div>
  );
}

/** Vệt mực loang quanh con dấu: một mảng loang + vài giọt bắn ra, mỗi thẻ một kiểu (cố định theo số thứ tự) */
function inkSplat(seed: number) {
  let n = seed * 9301 + 49297;
  const rnd = () => ((n = (n * 9301 + 49297) % 233280) / 233280);
  const blob = Array.from({ length: 7 }, () => ({ x: 70 + (rnd() - 0.5) * 50, y: 55 + (rnd() - 0.5) * 22, r: 12 + rnd() * 12, o: 0.1 + rnd() * 0.1 }));
  const drops = Array.from({ length: 9 }, () => {
    const a = rnd() * Math.PI * 2;
    const d = 38 + rnd() * 26;
    return { x: 70 + Math.cos(a) * d, y: 55 + Math.sin(a) * d * 0.6, r: 1.5 + rnd() * 3.5, o: 0.45 + rnd() * 0.3 };
  });
  return [...blob, ...drops];
}

/** Bốn thẻ kính lật vào lần lượt, rồi con dấu KHÔNG QUA dập xuống từng thẻ: mực loang, thẻ rung, viền chuyển đỏ */
function StampedCards() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  useGSAP(
    () => {
      if (reduce) {
        gsap.set('.sa-stampcard', { borderColor: 'rgba(255,90,106,0.55)' });
        return;
      }
      const tl = gsap.timeline({ scrollTrigger: { trigger: ref.current, start: 'center 70%', once: true } });
      tl.from('.sa-card', { rotationY: -95, opacity: 0, transformPerspective: 900, transformOrigin: '0% 50%', stagger: 0.14, duration: 0.7, ease: 'back.out(1.3)' });
      gsap.utils.toArray<HTMLElement>('.sa-card').forEach((card, i) => {
        const at = 0.9 + i * 0.5;
        tl.from(card.querySelector('.sa-stamp'), { opacity: 0, scale: 2.6, rotation: -32, ease: 'power4.in', duration: 0.28 }, at);
        tl.from(card.querySelectorAll('.sa-drop'), { scale: 0, opacity: 0, transformOrigin: '50% 50%', stagger: 0.012, duration: 0.3, ease: 'power2.out' }, at + 0.26);
        tl.to(card, { x: 5, yoyo: true, repeat: 3, duration: 0.04, ease: 'none' }, at + 0.26);
        tl.to(card.querySelector('.sa-stampcard'), { borderColor: 'rgba(255,90,106,0.6)', boxShadow: '0 0 30px rgba(255,90,106,0.22), inset 0 1px 0 rgba(255,255,255,0.2)', duration: 0.3 }, at + 0.26);
      });
    },
    { scope: ref, dependencies: [reduce] },
  );
  return (
    <div ref={ref} className="grid w-full max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
      {S.popular.cards.map((c, idx) => (
        <div key={c.name} className="sa-card h-full">
          <GlassCard className="sa-stampcard flex h-full min-h-[11rem] flex-col p-4 sm:aspect-[3/4]">
            <p className="text-base font-bold text-white sm:text-lg">{c.name}</p>
            <div className="pointer-events-none relative my-auto flex w-full justify-center py-4">
              <svg viewBox="0 0 140 110" className="absolute left-1/2 top-1/2 h-28 w-36 -translate-x-1/2 -translate-y-1/2 overflow-visible" aria-hidden>
                {inkSplat(idx + 1).map((d, k) => (
                  <circle key={k} className="sa-drop" cx={d.x} cy={d.y} r={d.r} fill="#ff5a6a" fillOpacity={d.o} />
                ))}
              </svg>
              <div className="sa-stamp relative -rotate-[14deg] whitespace-nowrap rounded-md border-[3px] border-[#ff5a6a] bg-[#1a0d14]/60 px-2.5 py-1 text-sm font-black tracking-wider text-[#ff5a6a] shadow-[0_0_18px_rgba(255,90,106,0.35)] sm:text-base">
                {S.popular.stamp}
              </div>
            </div>
            <p className="font-mono text-xs leading-snug text-gray-400">
              <span className="block bg-gradient-to-b from-white to-[#9fc4d6] bg-clip-text text-2xl font-bold text-transparent">{c.count}</span>
              {S.popular.unit}
            </p>
          </GlassCard>
        </div>
      ))}
    </div>
  );
}

export default function StartHerePage({ onGo }: { onGo: (tab: string) => void }) {
  const go = (tab: string) => {
    funnel.nextStep('journey', tab);
    onGo(tab);
  };
  return (
    <div data-start-here className="mx-auto max-w-5xl px-4">
      {/* 1 · Phễu lọc */}
      <Hero />

      {/* 2 · Cái cân */}
      <Screen id="win-rate">
        <Scale />
        <div className="mt-8">
          <Line title={S.winRate.title} body={S.winRate.body} />
        </div>
      </Screen>

      {/* 3 · Bốn trường phái bị đóng dấu */}
      <Screen id="popular">
        <StampedCards />
        <div className="mt-10">
          <Line title={S.popular.title} body={S.popular.body} />
        </div>
      </Screen>

      {/* 4 · Tờ lịch */}
      <Screen id="calendar">
        <CalendarScene className="h-[48vh] min-h-[300px] w-full max-w-3xl" />
        <div className="mb-6 flex items-center gap-5 text-xs text-gray-300">
          <span className="flex items-center gap-1.5">
            <i className="inline-block h-3 w-3 rounded-sm bg-[#2BFFEA]" /> {S.calendar.buy}
          </span>
          <span className="flex items-center gap-1.5">
            <i className="inline-block h-3 w-3 rounded-sm bg-[#FFDD00]" /> {S.calendar.sell}
          </span>
        </div>
        <Line title={S.calendar.title} body={S.calendar.body} />
      </Screen>

      {/* 5 · Câu hỏi chốt */}
      <Screen id="cta">
        <Line title={S.cta.title} body={S.cta.body} />
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button type="button" onClick={() => go(S.cta.primary.tab)} className="sa-glass-btn rounded-xl px-7 py-4 text-base font-bold">
            {S.cta.primary.label}
          </button>
          <button type="button" onClick={() => go(S.cta.secondary.tab)} className="sa-glass-ghost rounded-xl px-7 py-4 text-base font-semibold text-white">
            {S.cta.secondary.label}
          </button>
        </div>
      </Screen>
    </div>
  );
}
