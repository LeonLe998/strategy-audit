/**
 * Bộ kính dùng chung cho cả web (hướng "phòng thí nghiệm kính", Leon chọn 29/10).
 * Màu và viền nằm ở lớp CSS .sa-glass / .sa-glass-cyan trong index.css (có bản cho chế độ sáng).
 * GlassCard: nghiêng nhẹ theo chuột + đốm sáng chạy theo con trỏ; cache khung bao và đồng bộ qua requestAnimationFrame để không gây layout thrashing.
 */
import { useRef, type PointerEvent, type ReactNode } from 'react';

export function GlassCard({
  children,
  className = '',
  tint = 'clear',
  tilt = true,
}: {
  children: ReactNode;
  className?: string;
  tint?: 'clear' | 'cyan';
  tilt?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const rectRef = useRef<DOMRect | null>(null);
  const rafRef = useRef<number>(0);

  const enter = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse' || !ref.current) return;
    rectRef.current = ref.current.getBoundingClientRect();
  };

  const move = (e: PointerEvent) => {
    const el = ref.current;
    if (!el || e.pointerType !== 'mouse') return;
    const clientX = e.clientX;
    const clientY = e.clientY;
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = 0;
      const r = rectRef.current || el.getBoundingClientRect();
      rectRef.current = r;
      const x = Math.min(Math.max((clientX - r.left) / r.width, 0), 1);
      const y = Math.min(Math.max((clientY - r.top) / r.height, 0), 1);
      if (tilt) {
        el.style.transform = `perspective(900px) rotateX(${((0.5 - y) * 7).toFixed(2)}deg) rotateY(${((x - 0.5) * 9).toFixed(2)}deg) translateZ(0)`;
      }
      el.style.setProperty('--gx', `${(x * 100).toFixed(1)}%`);
      el.style.setProperty('--gy', `${(y * 100).toFixed(1)}%`);
    });
  };

  const leave = () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
    rectRef.current = null;
    if (ref.current) ref.current.style.transform = '';
  };

  return (
    <div
      ref={ref}
      onPointerEnter={enter}
      onPointerMove={move}
      onPointerLeave={leave}
      className={`sa-glass group relative overflow-hidden rounded-2xl transition-[transform,box-shadow,border-color,background-color] duration-200 ease-out ${tint === 'cyan' ? 'sa-glass-cyan' : ''} ${className}`}
    >
      {/* Vệt phản chiếu chéo cố định + đốm sáng theo chuột */}
      <div className="sa-glass-streak pointer-events-none absolute -left-1/4 top-0 h-full w-1/3 -skew-x-[20deg]" />
      <div className="sa-glass-spot pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="relative">{children}</div>
    </div>
  );
}
