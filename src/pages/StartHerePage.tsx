/**
 * Đảo 1 · Bắt đầu ở đây (/hanh-trinh): trang thu hút cho người mới, thay trò chơi Màn 1–2.
 * Năm màn hình, mỗi màn một hình lớn + một câu: phễu lọc 3D · cái cân · bốn thẻ bị đóng dấu · tờ lịch 3D · câu hỏi chốt.
 * Chữ ở START_HERE trong content/journey.ts.
 */
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { motion, useInView } from 'motion/react';
import { START_HERE } from '../content/journey';
import { FilterScene, CalendarScene } from '../game/world/StartScenes3D';
import { funnel } from '../lib/analytics';

const S = START_HERE;
/** Hiệu ứng chỉ chạy khi phần đó đã lên tới khoảng giữa màn hình, không chạy sớm lúc vừa ló ở mép dưới */
const REACHED = '0px 0px -30% 0px';

/** Đếm số từ 0 lên khi cuộn tới */
function CountUp({ to }: { to: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: REACHED });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const k = Math.min((now - start) / 1400, 1);
      setN(Math.round(to * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, to]);
  return <span ref={ref}>{n}</span>;
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

/** Cái cân: bên trái nhiều khối thắng nhỏ, bên phải vài khối thua to, cân nghiêng về phía thua */
function Scale() {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.8, margin: REACHED });
  const tilt = inView ? 9 : 0;
  const small = Array.from({ length: 9 }, (_, i) => ({ x: (i % 3) * 22, y: -Math.floor(i / 3) * 18 }));
  return (
    <svg ref={ref} viewBox="0 0 420 260" className="w-full max-w-xl" role="img" aria-label={`${S.winRate.wins} và ${S.winRate.losses}, cân nghiêng về phía thua`}>
      <defs>
        <filter id="sa-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Chân cân */}
      <path d="M190 236 L230 236 L214 120 L206 120 Z" fill="#1b2a3a" stroke="#3df2ff" strokeOpacity="0.4" />
      <rect x="160" y="236" width="100" height="10" rx="4" fill="#1b2a3a" stroke="#3df2ff" strokeOpacity="0.4" />
      <motion.g style={{ originX: '210px', originY: '118px' }} animate={{ rotate: tilt }} transition={{ type: 'spring', stiffness: 40, damping: 8, delay: 0.3 }}>
        <rect x="40" y="114" width="340" height="8" rx="4" fill="#3df2ff" filter="url(#sa-glow)" />
        <circle cx="210" cy="118" r="9" fill="#2BFFEA" filter="url(#sa-glow)" />
        {/* Đĩa trái: lệnh thắng nhỏ */}
        <motion.g animate={{ rotate: -tilt }} style={{ originX: '75px', originY: '118px' }} transition={{ type: 'spring', stiffness: 40, damping: 8, delay: 0.3 }}>
          <line x1="75" y1="118" x2="40" y2="176" stroke="#3df2ff" strokeOpacity="0.8" strokeWidth="1.5" />
          <line x1="75" y1="118" x2="110" y2="176" stroke="#3df2ff" strokeOpacity="0.8" strokeWidth="1.5" />
          <rect x="30" y="176" width="90" height="6" rx="3" fill="#2b3647" />
          {small.map((b, i) => (
            <rect key={i} x={45 + b.x} y={158 + b.y} width="16" height="16" rx="3" fill="#2BFFEA" fillOpacity="0.85" filter="url(#sa-glow)" />
          ))}
        </motion.g>
        {/* Đĩa phải: lệnh thua to */}
        <motion.g animate={{ rotate: -tilt }} style={{ originX: '345px', originY: '118px' }} transition={{ type: 'spring', stiffness: 40, damping: 8, delay: 0.3 }}>
          <line x1="345" y1="118" x2="310" y2="176" stroke="#3df2ff" strokeOpacity="0.8" strokeWidth="1.5" />
          <line x1="345" y1="118" x2="380" y2="176" stroke="#3df2ff" strokeOpacity="0.8" strokeWidth="1.5" />
          <rect x="300" y="176" width="90" height="6" rx="3" fill="#2b3647" />
          <rect x="306" y="136" width="38" height="40" rx="5" fill="#3a4656" stroke="#7a8a9a" strokeOpacity="0.5" />
          <rect x="346" y="146" width="38" height="30" rx="5" fill="#3a4656" stroke="#7a8a9a" strokeOpacity="0.5" />
          <rect x="322" y="100" width="44" height="36" rx="5" fill="#3a4656" stroke="#7a8a9a" strokeOpacity="0.5" />
        </motion.g>
      </motion.g>
      <text x="75" y="256" textAnchor="middle" fontSize="13" fill="#2BFFEA">{S.winRate.wins}</text>
      <text x="345" y="256" textAnchor="middle" fontSize="13" fill="#9fb0bf">{S.winRate.losses}</text>
    </svg>
  );
}

/** Bốn thẻ trường phái, con dấu KHÔNG QUA đóng lần lượt khi cuộn tới */
function StampedCards() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.7, margin: REACHED });
  return (
    <div ref={ref} className="grid w-full max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
      {S.popular.cards.map((c, i) => (
        <div key={c.name} className="relative flex min-h-[11rem] flex-col justify-between gap-1 overflow-hidden rounded-2xl sm:aspect-[3/4] border border-[#3df2ff]/30 bg-[#0b1a28] p-4">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#3df2ff]/0 via-[#3df2ff]/60 to-[#3df2ff]/0" />
          <p className="text-base font-bold text-white sm:text-lg">{c.name}</p>
          <div className="pointer-events-none flex w-full justify-center py-2">
            <motion.div
              initial={{ opacity: 0, scale: 2.2, rotate: -24 }}
              animate={inView ? { opacity: 1, scale: 1, rotate: -14 } : { opacity: 0, scale: 2.2, rotate: -24 }}
              transition={{ delay: 0.3 + i * 0.45, type: 'spring', stiffness: 260, damping: 14 }}
              className="whitespace-nowrap rounded-md border-[3px] border-[#ff5a6a] bg-[#0b1a28]/70 px-2.5 py-1 text-sm font-black tracking-wider text-[#ff5a6a] sm:text-base"
            >
              {S.popular.stamp}
            </motion.div>
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
      <Screen id="hero">
        <p className="font-mono text-xs font-semibold uppercase tracking-widest text-[#3df2ff]">{S.hero.kicker}</p>
        <h1 className="mt-3 max-w-3xl text-center text-3xl font-bold leading-tight text-white sm:text-5xl">{S.hero.title}</h1>
        <FilterScene className="mt-2 h-[46vh] min-h-[280px] w-full max-w-2xl" />
        <div className="grid w-full max-w-xl grid-cols-3 gap-2 text-center">
          {S.hero.stats.map((s, i) => (
            <div key={s.label} className={`rounded-xl border px-2 py-3 ${i === 2 ? 'border-[#2BFFEA]/60 bg-[#2BFFEA]/10' : 'border-white/10 bg-white/[0.03]'}`}>
              <p className={`font-mono text-2xl font-bold sm:text-3xl ${i === 2 ? 'text-[#2BFFEA]' : 'text-white'}`}>
                <CountUp to={s.n} />
              </p>
              <p className="mt-0.5 text-[11px] text-gray-400 sm:text-xs">{s.label}</p>
            </div>
          ))}
        </div>
        <p className="mt-8 animate-pulse text-xs text-gray-500">{S.hero.scroll}</p>
      </Screen>

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
