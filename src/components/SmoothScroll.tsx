import React, { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Respect user reduced-motion preference
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // buttery exponential out
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      touchMultiplier: 1.6,
      allowNestedScroll: true,
      prevent: (node) => {
        if (!node || typeof (node as any).closest !== 'function') return false;
        return (
          node.hasAttribute('data-lenis-prevent') ||
          Boolean(node.closest('[data-lenis-prevent]')) ||
          Boolean(node.closest('#vip-modal-container')) ||
          Boolean(node.closest('#vip-report-modal')) ||
          Boolean(node.closest('#pdf-viewer-overlay')) ||
          Boolean(node.closest('.overflow-y-auto')) ||
          Boolean(node.closest('.overflow-auto'))
        );
      },
    });
    lenisRef.current = lenis;

    // Expose lenis instance globally for route changes and programmatic scroll
    (window as any).__lenis = lenis;

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      (window as any).__lenis = null;
    };
  }, []);

  return <>{children}</>;
}
