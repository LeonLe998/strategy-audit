/**
 * Đảo 1 · Bắt đầu ở đây (/hanh-trinh): trang thu hút cho người mới, thay trò chơi Màn 1–2.
 * Năm màn hình, mỗi màn một hình lớn + một câu, cùng phong cách kính phát sáng: phễu kính 3D · cái cân 3D · bốn thẻ kính bị đóng dấu
 * · lịch để bàn kính 3D · câu hỏi chốt.
 * Mỗi cảnh chạy một lần khi cuộn tới (motion; đã bỏ GSAP 30/10 để trang nhẹ hơn). Giữ cuộn gốc của trình duyệt, không ghim, không gắn hiệu ứng vào vị trí cuộn:
 * đã thử Lenis + ghim, Leon thấy giật hơn. Không dùng bộ lọc mờ SVG/CSS trên thứ đang chuyển động vì mỗi khung hình phải vẽ lại.
 * Chữ ở START_HERE trong content/journey.ts.
 */
import { Fragment, useEffect, useRef, useState, type ReactNode } from 'react';
import { motion, useInView, useReducedMotion } from 'motion/react';
import { START_HERE } from '../content/journey';
import { FilterScene, ScaleScene, CalendarScene } from '../game/world/StartScenes3D';
import { funnel } from '../lib/analytics';
import { GlassCard } from '../components/Glass';
import ScrollDownHint from '../components/ScrollDownHint';
import { ArrowRight, Sparkles, ClipboardCheck, Database, Check } from 'lucide-react';

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

/** Màn đầu: tiêu đề hiện từng chữ; ba ô lọc dần 300 → 242 → 15 khi đã lên gần hết màn hình.
 *  Dùng motion (đã có sẵn trong web) thay GSAP để trang nhẹ hơn ~50 KB. */
function Hero() {
  const statsRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const reached = useInView(statsRef, { once: true, amount: 0.9, margin: '0px 0px -5% 0px' });
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (reduce) {
      setStep(5);
      return;
    }
    if (!reached) return;
    const ts = [0, 1.3, 1.9, 3, 3.7].map((t, i) => window.setTimeout(() => setStep(i + 1), t * 1000));
    return () => ts.forEach(clearTimeout);
  }, [reached, reduce]);
  const words = S.hero.title.split(' ');
  return (
    <section data-start="hero" className="flex min-h-[86vh] flex-col items-center justify-center py-14">
      <p className="font-mono text-xs font-semibold uppercase tracking-widest text-[#3df2ff]">{S.hero.kicker}</p>
      <h1 className="mt-3 max-w-3xl text-center text-3xl font-bold leading-tight text-white sm:text-5xl">
        {words.map((w, i) => (
          <Fragment key={i}>
            <motion.span
              className="inline-block"
              initial={reduce ? false : { opacity: 0, y: 34 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.07, duration: 0.8, ease: [0.215, 0.61, 0.355, 1] }}
            >
              {w}
            </motion.span>{' '}
          </Fragment>
        ))}
      </h1>
      <FilterScene className="mt-2 h-[58vh] min-h-[340px] w-full max-w-4xl" />
      <div ref={statsRef} className="flex w-full justify-center">
        <FunnelStats step={step} />
      </div>
      <ScrollDownHint label="Lướt xuống để xem tiếp" />
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
  const inView = useInView(ref, { once: true, amount: 0.5, margin: '0px 0px -30% 0px' });
  const on = Boolean(reduce) || inView;
  const easeIn = [0.7, 0, 0.84, 0] as const;
  return (
    <div ref={ref} className="grid w-full max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
      {S.popular.cards.map((c, idx) => {
        const at = 0.9 + idx * 0.5;
        return (
          <motion.div
            key={c.name}
            className="relative h-full"
            style={{ transformPerspective: 900, originX: 0 }}
            initial={reduce ? false : { rotateY: -95, opacity: 0 }}
            animate={on ? { rotateY: 0, opacity: 1, x: [0, 5, -5, 5, 0] } : undefined}
            transition={{
              rotateY: { delay: idx * 0.14, duration: 0.7, ease: [0.34, 1.56, 0.64, 1] },
              opacity: { delay: idx * 0.14, duration: 0.4 },
              x: { delay: at + 0.26, duration: 0.18, ease: 'linear' },
            }}
          >
            <GlassCard className="flex h-full min-h-[11rem] flex-col p-4 sm:aspect-[3/4]">
              <p className="text-base font-bold text-white sm:text-lg">{c.name}</p>
              <div className="pointer-events-none relative my-auto flex w-full justify-center py-4">
                <svg viewBox="0 0 140 110" className="absolute left-1/2 top-1/2 h-28 w-36 -translate-x-1/2 -translate-y-1/2 overflow-visible" aria-hidden>
                  {inkSplat(idx + 1).map((d, k) => (
                    <motion.circle
                      key={k}
                      cx={d.x}
                      cy={d.y}
                      r={d.r}
                      fill="#ff5a6a"
                      fillOpacity={d.o}
                      style={{ transformBox: 'fill-box', originX: 0.5, originY: 0.5 }}
                      initial={reduce ? false : { scale: 0, opacity: 0 }}
                      animate={on ? { scale: 1, opacity: 1 } : undefined}
                      transition={{ delay: at + 0.26 + k * 0.012, duration: 0.3, ease: 'easeOut' }}
                    />
                  ))}
                </svg>
                <motion.div
                  className="relative whitespace-nowrap rounded-md border-[3px] border-[#ff5a6a] bg-[#1a0d14]/60 px-2.5 py-1 text-sm font-black tracking-wider text-[#ff5a6a] shadow-[0_0_18px_rgba(255,90,106,0.35)] sm:text-base"
                  initial={reduce ? { rotate: -14 } : { opacity: 0, scale: 2.6, rotate: -32 }}
                  animate={on ? { opacity: 1, scale: 1, rotate: -14 } : undefined}
                  transition={{ delay: at, duration: 0.28, ease: easeIn }}
                >
                  {S.popular.stamp}
                </motion.div>
              </div>
              <p className="font-mono text-xs leading-snug text-gray-400">
                <span className="block bg-gradient-to-b from-white to-[#9fc4d6] bg-clip-text text-2xl font-bold text-transparent">{c.count}</span>
                {S.popular.unit}
              </p>
            </GlassCard>
            {/* Viền đỏ phát sáng hiện lên đúng lúc dấu dập xuống */}
            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-2xl border border-[#ff5a6a]/60 shadow-[0_0_30px_rgba(255,90,106,0.22)]"
              initial={reduce ? false : { opacity: 0 }}
              animate={on ? { opacity: 1 } : undefined}
              transition={{ delay: at + 0.26, duration: 0.3 }}
            />
          </motion.div>
        );
      })}
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
        <ScrollDownHint label="Lướt xuống để xem tiếp" />
      </Screen>

      {/* 3 · Bốn trường phái bị đóng dấu */}
      <Screen id="popular">
        <StampedCards />
        <div className="mt-10">
          <Line title={S.popular.title} body={S.popular.body} />
        </div>
        <ScrollDownHint label="Lướt xuống để xem tiếp" />
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
        <ScrollDownHint label="Lướt xuống để xem kết luận" />
      </Screen>

      {/* 5 · Câu hỏi chốt: Ám thị định hướng bắt buộc chọn 1 trong 2 lối đi */}
      <Screen id="cta">
        <Line title={S.cta.title} body={S.cta.body} />

        {/* Khối ám thị định hướng rõ ràng */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-7 flex flex-col items-center justify-center text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-[#2BFFEA]/40 bg-[#061e30]/85 px-4 py-1.5 shadow-[0_0_20px_rgba(43,255,234,0.25)]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#2BFFEA] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#2BFFEA]" />
            </span>
            <span className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-[#2BFFEA]">
              CHỌN 1 TRONG 2 BƯỚC ĐỂ TIẾP TỤC
            </span>
            <Sparkles size={13} className="text-[#2BFFEA] animate-pulse" />
          </div>
          <p className="mt-2 text-xs text-gray-400">
            Bấm chọn một lối đi bên dưới để kiểm chứng phương pháp bạn đang dùng:
          </p>
        </motion.div>

        {/* Hai cổng lựa chọn tương tác dạng Card lớn có ám thị thị giác cao */}
        <div className="mt-6 grid w-full max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Lối đi 1: Tự kiểm tra Sáu Ô (Khuyên dùng) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            onClick={() => go(S.cta.primary.tab)}
            className="group relative cursor-pointer overflow-hidden rounded-2xl border-2 border-[#2BFFEA] bg-[linear-gradient(145deg,rgba(14,45,66,0.95),rgba(6,22,36,0.98))] p-6 text-left shadow-[0_12px_36px_rgba(0,0,0,0.8),0_0_30px_rgba(43,255,234,0.35)] transition-all duration-300 hover:-translate-y-1 hover:border-[#2BFFEA] hover:shadow-[0_16px_46px_rgba(0,0,0,0.9),0_0_45px_rgba(43,255,234,0.55)] active:scale-[0.98]"
          >
            {/* Nhãn nổi bật */}
            <div className="mb-3 flex items-center justify-between">
              <span className="rounded-full bg-[#2BFFEA] px-2.5 py-0.5 font-mono text-[10px] font-extrabold uppercase tracking-wider text-black shadow-[0_0_10px_#2BFFEA]">
                🔥 KHUYÊN DÙNG
              </span>
              <span className="font-mono text-xs font-bold text-[#2BFFEA]">Miễn phí</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#2BFFEA]/15 text-[#2BFFEA] shadow-[0_0_14px_rgba(43,255,234,0.3)] transition-transform group-hover:scale-110">
                <ClipboardCheck size={22} />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-[#2BFFEA] transition-colors">
                Tự kiểm tra 6 ô
              </h3>
            </div>

            <p className="mt-3 text-xs leading-relaxed text-gray-300">
              Trả lời 6 câu hỏi đời thường trong 2 phút để biết phương pháp bạn dùng đã đủ chặt chẽ để đem đi đo chưa.
            </p>

            <div className="mt-5 flex items-center gap-2 font-mono text-xs font-bold text-[#2BFFEA] transition-all group-hover:translate-x-1">
              <span>Bắt đầu tự kiểm ngay</span>
              <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
            </div>

            {/* Vệt sáng quét qua khi hover */}
            <div className="pointer-events-none absolute -inset-full top-0 block -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-hover:animate-[shimmer_1.5s_infinite]" />
          </motion.div>

          {/* Lối đi 2: Xem Thư viện 300 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            onClick={() => go(S.cta.secondary.tab)}
            className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/15 bg-[linear-gradient(145deg,rgba(11,28,43,0.85),rgba(4,12,20,0.92))] p-6 text-left shadow-[0_12px_36px_rgba(0,0,0,0.7)] transition-all duration-300 hover:-translate-y-1 hover:border-[#3df2ff]/60 hover:shadow-[0_16px_46px_rgba(0,0,0,0.85),0_0_30px_rgba(61,242,255,0.25)] active:scale-[0.98]"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="rounded-full border border-white/20 bg-white/5 px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-gray-300">
                📊 KHO SỐ THẬT
              </span>
              <span className="font-mono text-xs text-gray-400">22 năm dữ liệu</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-gray-200 transition-transform group-hover:scale-110 group-hover:text-[#3df2ff]">
                <Database size={22} />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-[#3df2ff] transition-colors">
                Xem Thư viện 300
              </h3>
            </div>

            <p className="mt-3 text-xs leading-relaxed text-gray-400">
              Đối chiếu phương pháp của bạn với kết quả đo lường thật của 242 chiến lược kinh điển trên dữ liệu vàng.
            </p>

            <div className="mt-5 flex items-center gap-2 font-mono text-xs font-semibold text-gray-300 transition-all group-hover:text-[#3df2ff] group-hover:translate-x-1">
              <span>Khám phá thư viện</span>
              <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
            </div>
          </motion.div>
        </div>

        {/* 3 Cam kết an tâm tâm lý (Reassurance badges) */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-6 flex flex-wrap items-center justify-center gap-4 text-[11px] text-gray-400 sm:gap-6"
        >
          <span className="flex items-center gap-1.5 text-gray-300">
            <Check size={14} className="text-[#2BFFEA]" /> Hoàn toàn miễn phí
          </span>
          <span className="flex items-center gap-1.5 text-gray-300">
            <Check size={14} className="text-[#2BFFEA]" /> Không cần tạo tài khoản
          </span>
          <span className="flex items-center gap-1.5 text-gray-300">
            <Check size={14} className="text-[#2BFFEA]" /> Không giữ bí mật giao dịch
          </span>
        </motion.div>
      </Screen>
    </div>
  );
}
