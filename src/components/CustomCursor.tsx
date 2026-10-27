import { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'motion/react';
import { useTheme } from '../context/ThemeContext';

export default function CustomCursor() {
  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === 'light';

  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Mouse position values
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Smooth spring physics for outer trailing circle
  const springConfig = { damping: 28, stiffness: 280, mass: 0.4 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  useEffect(() => {
    // Detect touch device
    if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
      setIsTouchDevice(true);
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    // Detect hovering on interactive elements
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const interactive = target.closest('button, a, input, select, textarea, [role="button"], .cursor-pointer');
      setIsHovered(!!interactive);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.body.addEventListener('mouseleave', handleMouseLeave);
    document.body.addEventListener('mouseenter', handleMouseEnter);
    window.addEventListener('mouseover', handleMouseOver, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.removeEventListener('mouseleave', handleMouseLeave);
      document.body.removeEventListener('mouseenter', handleMouseEnter);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, [isVisible, mouseX, mouseY]);

  if (isTouchDevice || !isVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden" aria-hidden="true">
      {/* Outer trailing halo with spring physics - exactly centered on cursor */}
      <motion.div
        style={{
          x: smoothX,
          y: smoothY,
        }}
        animate={{
          scale: isClicking ? 0.75 : isHovered ? 1.6 : 1,
          opacity: isVisible ? (isHovered ? 0.85 : 0.4) : 0,
        }}
        transition={{ duration: 0.15 }}
        className={`absolute top-0 left-0 w-8 h-8 -ml-4 -mt-4 rounded-full border transition-colors duration-300 ${
          isLight
            ? isHovered
              ? 'border-emerald-600 bg-emerald-500/20 shadow-[0_0_16px_rgba(5,150,105,0.3)]'
              : 'border-emerald-500/60 bg-emerald-500/5'
            : isHovered
              ? 'border-neon-green bg-neon-green/20 shadow-[0_0_20px_rgba(0,255,163,0.4)]'
              : 'border-neon-green/60 bg-neon-green/5'
        }`}
      />

      {/* Center precise laser dot tracking mouse instantaneously - exactly on cursor tip */}
      <motion.div
        style={{
          x: mouseX,
          y: mouseY,
        }}
        animate={{
          scale: isClicking ? 1.3 : isHovered ? 0.6 : 1,
          opacity: isVisible ? 1 : 0,
        }}
        transition={{ duration: 0.08 }}
        className={`absolute top-0 left-0 w-2 h-2 -ml-1 -mt-1 rounded-full transition-colors duration-300 ${
          isLight
            ? 'bg-emerald-600 shadow-[0_0_8px_rgba(5,150,105,0.7)]'
            : 'bg-neon-green shadow-[0_0_10px_#00FFA3]'
        }`}
      />
    </div>
  );
}
