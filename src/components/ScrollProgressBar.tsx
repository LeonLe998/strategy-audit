import { motion, useScroll, useSpring } from 'motion/react';

export default function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <div className="fixed top-0 left-0 right-0 h-[2.5px] z-[60] pointer-events-none bg-transparent">
      <motion.div
        className="h-full bg-gradient-to-r from-emerald-500 via-neon-green to-teal-300 origin-left shadow-[0_0_12px_rgba(0,255,163,0.8)]"
        style={{ scaleX }}
      />
    </div>
  );
}
