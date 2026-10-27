import { useTheme } from '../context/ThemeContext';

export default function AmbientBackground() {
  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === 'light';

  return (
    <div 
      id="ambient-quant-background" 
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none transition-opacity duration-700"
      aria-hidden="true"
    >
      {/* 1. Large drifting glowing mesh orbs */}
      <div 
        className={`absolute -top-20 -left-20 w-[550px] md:w-[700px] h-[550px] md:h-[700px] rounded-full blur-[130px] transition-all duration-700 animate-ambient-float-1 ${
          isLight ? 'bg-emerald-400/20' : 'bg-neon-green/6'
        }`}
      />
      <div 
        className={`absolute top-1/3 -right-20 w-[500px] md:w-[650px] h-[500px] md:h-[650px] rounded-full blur-[140px] transition-all duration-700 animate-ambient-float-2 ${
          isLight ? 'bg-sky-400/18' : 'bg-coral-red/6'
        }`}
      />
      <div 
        className={`absolute bottom-10 left-1/4 w-[450px] md:w-[600px] h-[450px] md:h-[600px] rounded-full blur-[130px] transition-all duration-700 animate-ambient-float-3 ${
          isLight ? 'bg-rose-400/10' : 'bg-cyan-500/5'
        }`}
      />
      <div 
        className={`absolute top-2/3 right-1/3 w-[350px] md:w-[500px] h-[350px] md:h-[500px] rounded-full blur-[120px] transition-all duration-700 animate-ambient-pulse ${
          isLight ? 'bg-amber-300/15' : 'bg-emerald-500/4'
        }`}
      />

      {/* 2. Institutional Quant Grid Overlay */}
      <svg 
        className="absolute inset-0 w-full h-full opacity-40 md:opacity-60" 
        xmlns="http://www.w3.org/2000/svg"
        width="100%" 
        height="100%"
      >
        <defs>
          <pattern id="quant-grid" width="80" height="80" patternUnits="userSpaceOnUse">
            <path 
              d="M 80 0 L 0 0 0 80" 
              fill="none" 
              stroke={isLight ? 'rgba(15, 23, 42, 0.04)' : 'rgba(255, 255, 255, 0.025)'} 
              strokeWidth="1" 
            />
            {/* Crosshairs at grid intersections */}
            <path 
              d="M 0 5 L 0 -5 M -5 0 L 5 0" 
              fill="none" 
              stroke={isLight ? 'rgba(5, 150, 105, 0.15)' : 'rgba(0, 255, 163, 0.12)'} 
              strokeWidth="1" 
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#quant-grid)" />
      </svg>

      {/* 3. Subtle undulating algorithmic sine wave lines */}
      <div className="absolute inset-0 w-full h-full overflow-hidden opacity-30 md:opacity-40">
        <svg 
          className="absolute top-1/4 left-0 w-[200%] h-48 animate-ambient-wave"
          viewBox="0 0 1440 200" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            d="M0,100 C240,40 480,160 720,90 C960,20 1200,150 1440,80 C1680,10 1920,160 2160,100 C2400,40 2640,140 2880,90" 
            stroke={isLight ? 'rgba(5, 150, 105, 0.18)' : 'rgba(0, 255, 163, 0.12)'} 
            strokeWidth="1.5" 
            strokeDasharray="6 6"
          />
        </svg>
        <svg 
          className="absolute top-1/2 left-0 w-[200%] h-48 animate-ambient-wave-reverse"
          viewBox="0 0 1440 200" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            d="M0,80 C240,150 480,30 720,110 C960,180 1200,60 1440,120 C1680,170 1920,50 2160,110 C2400,160 2640,70 2880,100" 
            stroke={isLight ? 'rgba(14, 165, 233, 0.16)' : 'rgba(255, 51, 102, 0.09)'} 
            strokeWidth="1.5" 
          />
        </svg>
      </div>

      {/* 4. Floating Quantitative Symbols & Watermarks */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Particle 1: Alpha Score */}
        <div 
          className={`absolute top-[12%] left-[8%] font-mono text-xs tracking-widest uppercase transition-opacity animate-float-symbol-1 ${
            isLight ? 'text-emerald-700/25' : 'text-neon-green/20'
          }`}
        >
          <span className="font-bold">α</span> = +1.95 [WFO Valid]
        </div>

        {/* Particle 2: Sharpe Ratio */}
        <div 
          className={`absolute top-[28%] right-[7%] font-mono text-[11px] tracking-wider transition-opacity animate-float-symbol-2 ${
            isLight ? 'text-sky-700/25' : 'text-cyan-400/20'
          }`}
        >
          Sharpe: 2.57 • Sortino: 3.12
        </div>

        {/* Particle 3: Monte Carlo Simulation */}
        <div 
          className={`absolute top-[48%] left-[5%] font-mono text-[11px] tracking-wider transition-opacity animate-float-symbol-3 ${
            isLight ? 'text-slate-600/25' : 'text-gray-400/20'
          }`}
        >
          ∑ N=10,000 (Monte Carlo 99% CI)
        </div>

        {/* Particle 4: Walk-Forward Window */}
        <div 
          className={`absolute top-[65%] right-[10%] font-mono text-xs tracking-wider transition-opacity animate-float-symbol-4 ${
            isLight ? 'text-emerald-700/25' : 'text-neon-green/20'
          }`}
        >
          WFE: 0.68 (Walk-Forward Efficiency)
        </div>

        {/* Particle 5: Risk of Ruin */}
        <div 
          className={`absolute top-[82%] left-[12%] font-mono text-[11px] tracking-wider transition-opacity animate-float-symbol-5 ${
            isLight ? 'text-rose-600/25' : 'text-coral-red/20'
          }`}
        >
          RoR &lt; 0.01% (Safe Horizon)
        </div>

        {/* Particle 6: Out-of-sample data */}
        <div 
          className={`absolute top-[90%] right-[15%] font-mono text-[10px] tracking-widest transition-opacity animate-float-symbol-6 ${
            isLight ? 'text-slate-600/25' : 'text-gray-400/20'
          }`}
        >
          OOS 2024→2026 • Real Alpha
        </div>
      </div>
    </div>
  );
}
