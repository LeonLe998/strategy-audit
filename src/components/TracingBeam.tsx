import React, { useEffect, useRef, useState } from 'react';
import { motion, useTransform, useScroll, useSpring } from 'motion/react';

interface TracingBeamProps {
  children: React.ReactNode;
  className?: string;
}

export default function TracingBeam({
  children,
  className = '',
}: TracingBeamProps) {
  const ref = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [svgHeight, setSvgHeight] = useState(0);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 60%', 'end 70%'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 200,
    damping: 30,
    restDelta: 0.001,
  });

  useEffect(() => {
    if (contentRef.current) {
      setSvgHeight(contentRef.current.offsetHeight);
    }

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === contentRef.current) {
          setSvgHeight(entry.contentRect.height);
        }
      }
    });

    if (contentRef.current) {
      resizeObserver.observe(contentRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  const y1 = useTransform(smoothProgress, [0, 1], [30, Math.max(30, svgHeight - 20)]);

  return (
    <div ref={ref} className={`relative w-full ${className}`}>
      {/* Tracing Beam SVG Line (Hidden on tiny screens or positioned along the steps) */}
      <div className="absolute -left-3 md:-left-8 top-0 bottom-0 pointer-events-none select-none z-10">
        {/* Glowing tracking dot */}
        <motion.div
          style={{ y: y1 }}
          className="absolute -left-[5px] top-0 flex items-center justify-center h-4 w-4 rounded-full border border-neon-green/60 bg-[#061624] shadow-[0_0_15px_rgba(0,255,163,0.8)]"
        >
          <div className="h-1.5 w-1.5 rounded-full bg-neon-green animate-ping" />
          <div className="absolute h-1.5 w-1.5 rounded-full bg-neon-green" />
        </motion.div>

        {/* SVG track line */}
        <svg
          viewBox={`0 0 20 ${svgHeight}`}
          width="20"
          height={svgHeight}
          className="block w-5"
          aria-hidden="true"
        >
          <line
            x1="10"
            y1="0"
            x2="10"
            y2={svgHeight}
            stroke="#20394B"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
          <motion.line
            x1="10"
            y1="0"
            x2="10"
            y2={y1}
            stroke="url(#tracing-beam-gradient)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <defs>
            <linearGradient id="tracing-beam-gradient" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2={svgHeight}>
              <stop stopColor="#059669" stopOpacity="0.2" />
              <stop offset="0.6" stopColor="#00FFA3" stopOpacity="0.8" />
              <stop offset="1" stopColor="#5EEAD4" stopOpacity="1" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div ref={contentRef} className="relative z-0 pl-4 md:pl-0">
        {children}
      </div>
    </div>
  );
}
