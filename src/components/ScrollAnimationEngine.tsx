/**
 * Scroll Animation Engine
 * Controls:
 * - Bioluminescent scroll progress bar (GPU-composited scaleX, zero React re-renders during scroll)
 * - Active chapter scrollytelling sync with Three.js 3D camera
 * - Nút cuộn lên đầu (thanh CHƯƠNG cũ đã bỏ 30/10: không còn mục nào để nhảy tới)
 * - Toggle to enter Fullscreen 3D Game Mode
 */

import React, { useEffect, useRef, useState } from 'react';
import { Gamepad2, ArrowUp, FileCode } from 'lucide-react';

export interface ScrollAnimationEngineProps {
  /** Có thì hiện nút Chơi Game 3D. Trang chủ đã là bản đồ nên App không truyền nữa. */
  onToggleGameMode?: () => void;
  isGameMode: boolean;
  onSectionChange?: (index: number) => void;
  onOpenCustomInstructions?: () => void;
}

export const CHAPTERS = [
  { id: 'sa-hero', title: 'Khởi đầu' },
  { id: 'sa-method', title: 'Học - Đo - Hành' },
  { id: 'sa-six-grid', title: 'Sáu Ô' },
  { id: 'sa-case-study', title: 'Hồ sơ thật' },
  { id: 'sa-library', title: '300 Chiến lược' },
  { id: 'sa-membership', title: 'Thành viên' }
];

export const ScrollAnimationEngine: React.FC<ScrollAnimationEngineProps> = ({
  onToggleGameMode,
  isGameMode,
  onSectionChange,
  onOpenCustomInstructions
}) => {
  const barRef = useRef<HTMLDivElement>(null);
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);

  useEffect(() => {
    let rafId = 0;
    let ticking = false;
    let lastIdx = -1;

    const updateScroll = () => {
      ticking = false;
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const currentScroll = window.scrollY;
      const progress = totalHeight > 0 ? Math.min(Math.max(currentScroll / totalHeight, 0), 1) : 0;

      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${progress})`;
      }

      const shouldShowTop = currentScroll > 400;
      setShowScrollTop((prev) => (prev !== shouldShowTop ? shouldShowTop : prev));

      if (onSectionChange) {
        let currentIndex = 0;
        const threshold = window.innerHeight * 0.45;
        for (let idx = 0; idx < CHAPTERS.length; idx++) {
          const el = document.getElementById(CHAPTERS[idx].id);
          if (el && el.getBoundingClientRect().top <= threshold) {
            currentIndex = idx;
          }
        }
        if (currentIndex !== lastIdx) {
          lastIdx = currentIndex;
          onSectionChange(currentIndex);
        }
      }
    };

    const handleScroll = () => {
      if (!ticking) {
        ticking = true;
        rafId = requestAnimationFrame(updateScroll);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    updateScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, [onSectionChange]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isGameMode) return null;

  return (
    <>
      {/* Top Fixed Scroll Progress Bar (GPU-composited scaleX) */}
      <div className="fixed top-0 left-0 w-full h-[3px] z-[60] bg-transparent pointer-events-none">
        <div
          ref={barRef}
          className="h-full w-full origin-left bg-gradient-to-r from-neon-green via-cyan-400 to-violet-500 shadow-[0_0_8px_#00ffa3] will-change-transform"
          style={{ transform: 'scaleX(0)' }}
        />
      </div>

      {/* Floating Bottom Right Action Bar: Game Mode Toggle, Custom Instructions & Scroll To Top */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center space-x-2.5">
        {onOpenCustomInstructions && (
          <button
            onClick={onOpenCustomInstructions}
            className="p-2.5 rounded-2xl bg-[#07131e]/90 backdrop-blur border border-violet-500/40 text-violet-400 hover:text-white hover:bg-violet-500/20 transition-all shadow-xl"
            title="Mở Custom Instructions"
          >
            <FileCode className="w-4 h-4" />
          </button>
        )}

        {/* Toggle Game 3D Mode */}
        {onToggleGameMode && <button
          onClick={onToggleGameMode}
          className="group relative flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-neon-green to-emerald-400 text-black font-extrabold text-xs shadow-[0_0_25px_rgba(0,255,163,0.45)] hover:shadow-[0_0_35px_rgba(0,255,163,0.65)] hover:scale-105 active:scale-95 transition-all duration-300"
        >
          <Gamepad2 className="w-4 h-4 animate-bounce" />
          <span>🎮 Chơi Game 3D</span>
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500" />
          </span>
        </button>}

        {/* Scroll To Top Meter */}
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="p-2.5 rounded-2xl bg-[#07131e]/90 backdrop-blur border border-[#20394b] text-gray-300 hover:text-white hover:border-neon-green transition-all shadow-xl"
            title="Cuộn lên đầu trang"
          >
            <ArrowUp className="w-4 h-4 text-neon-green" />
          </button>
        )}
      </div>
    </>
  );
};
