/**
 * Đảo 1 · Bắt đầu ở đây (/hanh-trinh): trang thu hút cho người mới, thay trò chơi Màn 1–2.
 * Năm màn hình, mỗi màn một hình lớn + một câu: phễu lọc 3D · cái cân · bốn thẻ bị đóng dấu · tờ lịch 3D · câu hỏi chốt.
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
import { FilterScene, CalendarScene } from '../game/world/StartScenes3D';
import { funnel } from '../lib/analytics';

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
  on: { fill: '#cfe3ee', opacity: 0.8 },
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

/** Tấm kính: nền mờ trong, mép trên bắt sáng, nghiêng nhẹ theo chuột và có đốm sáng chạy theo con trỏ.
 *  Chỉ đổi transform + biến CSS trên chính tấm này nên không làm cả trang vẽ lại. */
function GlassCard({ children, className = '', tint = 'clear' }: { children: ReactNode; className?: string; tint?: 'clear' | 'cyan' }) {
  const ref = useRef<HTMLDivElement>(null);
  const move = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el || e.pointerType !== 'mouse') return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.transform = `perspective(700px) rotateX(${(0.5 - y) * 10}deg) rotateY(${(x - 0.5) * 12}deg) translateZ(0)`;
    el.style.setProperty('--gx', `${x * 100}%`);
    el.style.setProperty('--gy', `${y * 100}%`);
  };
  const leave = () => {
    if (ref.current) ref.current.style.transform = '';
  };
  return (
    <div
      ref={ref}
      onPointerMove={move}
      onPointerLeave={leave}
      className={`group relative overflow-hidden rounded-2xl border backdrop-blur-md transition-[transform,box-shadow,border-color,background-color] duration-300 ease-out will-change-transform ${
        tint === 'cyan'
          ? 'border-[#9ff6ff]/60 bg-[linear-gradient(150deg,rgba(43,255,234,0.22),rgba(43,255,234,0.05)_55%,rgba(255,255,255,0.03))] shadow-[0_0_40px_rgba(43,255,234,0.35),inset_0_1px_0_rgba(255,255,255,0.45)]'
          : 'border-white/15 bg-[linear-gradient(150deg,rgba(255,255,255,0.10),rgba(255,255,255,0.025)_55%,rgba(255,255,255,0.01))] shadow-[0_24px_48px_-24px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.22)]'
      } ${className}`}
    >
      {/* Vệt phản chiếu chéo cố định + đốm sáng theo chuột */}
      <div className="pointer-events-none absolute -left-1/4 top-0 h-full w-1/3 -skew-x-[20deg] bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" />
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 [background:radial-gradient(circle_at_var(--gx,50%)_var(--gy,0%),rgba(255,255,255,0.16),transparent_55%)]" />
      <div className="relative">{children}</div>
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

/** Cái cân: khối thắng nhỏ rơi vào đĩa trái, vài khối thua to rơi vào đĩa phải, rồi cân nghiêng về phía thua.
 *  Chạy một lần khi cái cân lên tới giữa màn hình. */
function Scale() {
  const ref = useRef<SVGSVGElement>(null);
  const reduce = useReducedMotion();
  useGSAP(
    () => {
      const tl = reduce ? gsap.timeline() : gsap.timeline({ scrollTrigger: { trigger: ref.current, start: 'center 70%', once: true } });
      if (!reduce) {
        tl.from('.sa-win', { y: -90, opacity: 0, stagger: 0.06, ease: 'bounce.out', duration: 0.5 });
        tl.from('.sa-loss', { y: -120, opacity: 0, stagger: 0.18, ease: 'bounce.out', duration: 0.6 }, '>-0.1');
      }
      tl.to('.sa-beam', { rotation: 9, svgOrigin: '210 118', ease: 'power2.inOut', duration: 1 });
      tl.to('.sa-pan-l', { rotation: -9, svgOrigin: '75 118', ease: 'power2.inOut', duration: 1 }, '<');
      tl.to('.sa-pan-r', { rotation: -9, svgOrigin: '345 118', ease: 'power2.inOut', duration: 1 }, '<');
      if (reduce) tl.progress(1);
    },
    { scope: ref, dependencies: [reduce] },
  );
  const small = Array.from({ length: 9 }, (_, i) => ({ x: (i % 3) * 22, y: -Math.floor(i / 3) * 18 }));
  return (
    <svg ref={ref} viewBox="0 0 420 260" className="w-full max-w-xl overflow-visible" role="img" aria-label={`${S.winRate.wins} và ${S.winRate.losses}, cân nghiêng về phía thua`}>
      {/* Chân cân */}
      <path d="M190 236 L230 236 L214 120 L206 120 Z" fill="#1b2a3a" stroke="#3df2ff" strokeOpacity="0.4" />
      <rect x="160" y="236" width="100" height="10" rx="4" fill="#1b2a3a" stroke="#3df2ff" strokeOpacity="0.4" />
      <g className="sa-beam">
        <rect x="38" y="112" width="344" height="12" rx="6" fill="#3df2ff" fillOpacity="0.25" />
        <rect x="40" y="114" width="340" height="8" rx="4" fill="#3df2ff" />
        <circle cx="210" cy="118" r="13" fill="#2BFFEA" fillOpacity="0.25" />
        <circle cx="210" cy="118" r="9" fill="#2BFFEA" />
        {/* Đĩa trái: lệnh thắng nhỏ */}
        <g className="sa-pan-l">
          <line x1="75" y1="118" x2="40" y2="176" stroke="#3df2ff" strokeOpacity="0.8" strokeWidth="1.5" />
          <line x1="75" y1="118" x2="110" y2="176" stroke="#3df2ff" strokeOpacity="0.8" strokeWidth="1.5" />
          <rect x="30" y="176" width="90" height="6" rx="3" fill="#2b3647" />
          {small.map((b, i) => (
            <rect key={i} className="sa-win" x={45 + b.x} y={158 + b.y} width="16" height="16" rx="3" fill="#2BFFEA" fillOpacity="0.85" stroke="#b8fff6" strokeOpacity="0.6" />
          ))}
        </g>
        {/* Đĩa phải: lệnh thua to */}
        <g className="sa-pan-r">
          <line x1="345" y1="118" x2="310" y2="176" stroke="#3df2ff" strokeOpacity="0.8" strokeWidth="1.5" />
          <line x1="345" y1="118" x2="380" y2="176" stroke="#3df2ff" strokeOpacity="0.8" strokeWidth="1.5" />
          <rect x="300" y="176" width="90" height="6" rx="3" fill="#2b3647" />
          <rect className="sa-loss" x="306" y="136" width="38" height="40" rx="5" fill="#3a4656" stroke="#7a8a9a" strokeOpacity="0.5" />
          <rect className="sa-loss" x="346" y="146" width="38" height="30" rx="5" fill="#3a4656" stroke="#7a8a9a" strokeOpacity="0.5" />
          <rect className="sa-loss" x="322" y="100" width="44" height="36" rx="5" fill="#3a4656" stroke="#7a8a9a" strokeOpacity="0.5" />
        </g>
      </g>
      <text x="75" y="256" textAnchor="middle" fontSize="13" fill="#2BFFEA">{S.winRate.wins}</text>
      <text x="345" y="256" textAnchor="middle" fontSize="13" fill="#9fb0bf">{S.winRate.losses}</text>
    </svg>
  );
}

/** Bốn thẻ trường phái, con dấu KHÔNG QUA đóng lần lượt khi cuộn tới, mỗi lần đóng thẻ khẽ rung và viền chuyển đỏ */
function StampedCards() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  useGSAP(
    () => {
      if (reduce) return;
      const tl = gsap.timeline({ scrollTrigger: { trigger: ref.current, start: 'center 70%', once: true } });
      gsap.utils.toArray<HTMLElement>('.sa-card').forEach((card, i) => {
        const at = i * 0.6;
        tl.from(card.querySelector('.sa-stamp'), { opacity: 0, scale: 2.4, rotation: -30, ease: 'back.out(2.5)', duration: 0.45 }, at);
        tl.to(card, { x: 4, yoyo: true, repeat: 3, duration: 0.04, ease: 'none' }, at + 0.4);
        tl.to(card, { borderColor: 'rgba(255,90,106,0.55)', duration: 0.2 }, at + 0.4);
      });
    },
    { scope: ref, dependencies: [reduce] },
  );
  return (
    <div ref={ref} className="grid w-full max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
      {S.popular.cards.map((c) => (
        <div key={c.name} className="sa-card relative flex min-h-[11rem] flex-col justify-between gap-1 overflow-hidden rounded-2xl border border-[#3df2ff]/30 bg-[#0b1a28] p-4 sm:aspect-[3/4]">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#3df2ff]/0 via-[#3df2ff]/60 to-[#3df2ff]/0" />
          <p className="text-base font-bold text-white sm:text-lg">{c.name}</p>
          <div className="pointer-events-none flex w-full justify-center py-2">
            <div className="sa-stamp -rotate-[14deg] whitespace-nowrap rounded-md border-[3px] border-[#ff5a6a] bg-[#0b1a28]/70 px-2.5 py-1 text-sm font-black tracking-wider text-[#ff5a6a] sm:text-base">
              {S.popular.stamp}
            </div>
          </div>
          <p className="font-mono text-xs leading-snug text-gray-400">
            <span className="block text-2xl font-bold text-gray-200">{c.count}</span>
            {S.popular.unit}
          </p>
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
        <CalendarScene className="h-[44vh] min-h-[260px] w-full max-w-3xl" />
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
          <button type="button" onClick={() => go(S.cta.primary.tab)} className="rounded-xl bg-[#2BFFEA] px-7 py-4 text-base font-bold text-black shadow-[0_0_28px_rgba(43,255,234,0.35)]">
            {S.cta.primary.label}
          </button>
          <button type="button" onClick={() => go(S.cta.secondary.tab)} className="rounded-xl border border-white/25 px-7 py-4 text-base font-semibold text-white hover:bg-white/5">
            {S.cta.secondary.label}
          </button>
        </div>
      </Screen>
    </div>
  );
}
