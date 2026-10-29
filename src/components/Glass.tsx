/**
 * Bộ kính dùng chung cho cả web (hướng "phòng thí nghiệm kính", Leon chọn 29/10).
 * Màu và viền nằm ở lớp CSS .sa-glass / .sa-glass-cyan trong index.css (có bản cho chế độ sáng).
 * GlassCard: nghiêng nhẹ theo chuột + đốm sáng chạy theo con trỏ; chỉ đổi transform và biến CSS trên chính tấm này.
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
  const move = (e: PointerEvent) => {
    const el = ref.current;
    if (!el || e.pointerType !== 'mouse') return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    if (tilt) el.style.transform = `perspective(900px) rotateX(${(0.5 - y) * 8}deg) rotateY(${(x - 0.5) * 10}deg) translateZ(0)`;
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
      className={`sa-glass group relative overflow-hidden rounded-2xl transition-[transform,box-shadow,border-color,background-color] duration-300 ease-out ${tint === 'cyan' ? 'sa-glass-cyan' : ''} ${className}`}
    >
      {/* Vệt phản chiếu chéo cố định + đốm sáng theo chuột */}
      <div className="sa-glass-streak pointer-events-none absolute -left-1/4 top-0 h-full w-1/3 -skew-x-[20deg]" />
      <div className="sa-glass-spot pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="relative">{children}</div>
    </div>
  );
}
