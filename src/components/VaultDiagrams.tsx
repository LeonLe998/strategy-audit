import { motion } from 'motion/react';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Layers,
  Calendar,
  Clock,
  GitBranch,
  Binary,
  Filter,
  Activity,
  Check,
  X,
  Lock,
  ArrowRight,
  Zap,
} from 'lucide-react';
import {
  RiskOfRuin3DScene,
  AlphaVsBeta3DScene,
  CurveFitting3DScene,
  Probability3DScene,
  MultipleTesting3DScene,
  Correlation3DScene,
  CalendarSeasonality3DScene,
  LookaheadShield3DScene,
  WalkForward3DScene,
  KillSwitch3DScene,
  OrderBookMicro3DScene,
} from './VaultScenes3D';

interface DiagramProps {
  id: string;
  className?: string;
}

/**
 * VaultDiagrams: Motion Graphics & Interactive Visual Infographics
 * Dành riêng cho 11 Báo cáo chuyên đề (BC-01..03) và Hồ sơ nghiên cứu (HS-01..08) của Strategy Audit.
 * Thiết kế theo phong cách Futuristic Glassmorphism: hạt sáng, quét radar, thanh co giãn, xung nhịp pulse.
 */
export default function VaultDiagram({ id, className = '' }: DiagramProps) {
  switch (id) {
    case 'risk-of-ruin':
      return <RiskOfRuinDiagram className={className} />;
    case 'alpha-vs-beta':
      return <AlphaVsBetaDiagram className={className} />;
    case 'curve-fitting':
      return <CurveFittingDiagram className={className} />;
    case 'probability':
      return <ProbabilityDiagram className={className} />;
    case 'statistics-inference':
      return <MultipleTestingDiagram className={className} />;
    case 'linear-algebra':
      return <CorrelationMatrixDiagram className={className} />;
    case 'time-series-stat-arb':
      return <CalendarSeasonalityDiagram className={className} />;
    case 'data-pipeline':
      return <LookaheadBiasDiagram className={className} />;
    case 'backtesting-audit':
      return <WalkForwardDiagram className={className} />;
    case 'risk-sizing-killswitch':
      return <KillSwitchDiagram className={className} />;
    case 'microstructure-execution':
      return <OrderBookMicrostructureDiagram className={className} />;
    default:
      return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// BC-01: Xác suất cháy tài khoản & Hiệu ứng bờ vực (Cliff Effect Motion Graphic)
// ─────────────────────────────────────────────────────────────────────────────
function RiskOfRuinDiagram({ className = '' }: { className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={`relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-[linear-gradient(145deg,rgba(11,28,43,0.95),rgba(4,12,20,0.98))] p-5 shadow-[0_12px_36px_rgba(0,0,0,0.7),0_0_24px_rgba(43,255,234,0.12)] ${className}`}
    >
      {/* Tia sáng quét nền vi tế */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-400/15 text-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.3)]">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <div>
            <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-[#2BFFEA]">
              Hiệu Ứng Bờ Vực & Chuỗi Thua Dài Nhất (Risk of Ruin)
            </h4>
            <span className="text-[10px] text-gray-400">Mô phỏng toán học trên chuỗi N = 1.000 lệnh</span>
          </div>
        </div>
        <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 font-mono text-[10px] font-bold text-amber-300">
          Quy luật xác suất
        </span>
      </div>

      {/* Motion Graphic 3D: Vực thẳm phi tuyến & Bờ vực sụp đổ */}
      <RiskOfRuin3DScene className="mt-4 rounded-xl border border-white/10 bg-black/40" />

      {/* 2 Kịch bản đối chiếu động */}
      <div className="mt-4 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3.5 space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-emerald-300 flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5" /> Kỷ luật (1% vốn/lệnh)
            </span>
            <span className="rounded bg-emerald-500/20 px-2 py-0.5 font-mono text-[9px] font-bold text-emerald-300">
              SỐNG SÓT 99.9%
            </span>
          </div>
          <div className="space-y-1.5 text-[11px] text-gray-300">
            <div className="flex justify-between">
              <span className="text-gray-400">Gặp chuỗi thua 10-12 lệnh:</span>
              <span className="font-mono text-emerald-400 font-bold">Sụt giảm ~10-11%</span>
            </div>
            {/* Dynamic expanding bar */}
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: '11%' }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.3 }}
                className="h-full rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]"
              />
            </div>
            <p className="text-[10px] text-emerald-300/80">Tài khoản giữ trọn đệm chịu đựng để hồi phục khi lợi thế quay lại.</p>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.01 }}
          className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-3.5 space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-rose-300 flex items-center gap-1.5">
              <X className="h-3.5 w-3.5" /> Quá tay (5% vốn/lệnh)
            </span>
            <span className="rounded bg-rose-500/25 px-2 py-0.5 font-mono text-[9px] font-bold text-rose-300 animate-pulse">
              NGUY CƠ CHÁY &gt; 92%
            </span>
          </div>
          <div className="space-y-1.5 text-[11px] text-gray-300">
            <div className="flex justify-between">
              <span className="text-gray-400">Gặp chuỗi thua 10-12 lệnh:</span>
              <span className="font-mono text-rose-400 font-bold">Sụt giảm ~48-55%</span>
            </div>
            {/* Dynamic expanding bar */}
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: '92%' }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, delay: 0.4 }}
                className="h-full rounded-full bg-rose-500 shadow-[0_0_10px_#f43f5e]"
              />
            </div>
            <p className="text-[10px] text-rose-300/80">Rơi thẳng qua mép bờ vực sụp đổ trước khi chuỗi thua kết thúc.</p>
          </div>
        </motion.div>
      </div>

      {/* Visual Loss Streak Tracker */}
      <div className="mt-3.5 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs text-gray-300">
        <div className="flex items-center justify-between mb-2">
          <span className="font-mono text-[11px] text-gray-400">Mô phỏng chuỗi thua 12 lệnh tất yếu trong 1.000 lệnh:</span>
          <span className="font-mono text-[10px] text-amber-300 font-bold">Xác suất xảy ra &gt; 99%</span>
        </div>
        <div className="grid grid-cols-12 gap-1">
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0.5, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.05 * i, duration: 0.3 }}
              className="flex h-6 flex-col items-center justify-center rounded bg-rose-500/20 border border-rose-500/40 text-[9px] font-mono font-bold text-rose-300"
            >
              -{i + 1}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BC-02: Bóc tách Alpha vs Beta (Motion Matrix)
// ─────────────────────────────────────────────────────────────────────────────
function AlphaVsBetaDiagram({ className = '' }: { className?: string }) {
  const regimes = [
    { name: 'Thị Trường Tăng', desc: 'Sóng đẩy mạnh', beta: 'Ăn theo sóng (✓)', alpha: 'Lợi thế chuẩn (✓)', status: 'pass' },
    { name: 'Thị Trường Đi Ngang', desc: 'Biên độ hẹp, quét 2 đầu', beta: 'Bào mòn vốn (✗)', alpha: 'Bảo vệ vốn (✓)', status: 'fail_beta' },
    { name: 'Thị Trường Giảm', desc: 'Áp lực bán tháo', beta: 'Đứt gãy hệ thống (✗)', alpha: 'Đứng vững (✓)', status: 'fail_beta' },
    { name: 'Biến Động Gắt', desc: 'Giờ tin tức, dãn spread', beta: 'Chạm stoploss liên tục (✗)', alpha: 'Khóa rủi ro (✓)', status: 'fail_beta' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={`relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-[linear-gradient(145deg,rgba(11,28,43,0.95),rgba(4,12,20,0.98))] p-5 shadow-[0_12px_36px_rgba(0,0,0,0.7)] ${className}`}
    >
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#2BFFEA]/15 text-[#2BFFEA] shadow-[0_0_12px_rgba(43,255,234,0.3)]">
            <GitBranch className="h-4 w-4" />
          </div>
          <div>
            <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-[#2BFFEA]">
              Phân Tách Lợi Thế Thật (Alpha) vs Ăn May Theo Sóng (Beta)
            </h4>
            <span className="text-[10px] text-gray-400">Đối chiếu qua 4 bối cảnh thị trường thực tế</span>
          </div>
        </div>
        <span className="font-mono text-[10px] text-emerald-300 font-bold bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full">
          15/15 CHẤT GIỮ VỮNG
        </span>
      </div>

      {/* Motion Graphic 3D: Tách biệt Lõi Alpha Độc lập & Vành Beta Nhiễu */}
      <AlphaVsBeta3DScene className="mt-4 rounded-xl border border-white/10 bg-black/40" />

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {regimes.map((regime, i) => (
          <motion.div
            key={regime.name}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 * i, duration: 0.4 }}
            whileHover={{ y: -2 }}
            className="rounded-xl border border-white/10 bg-black/40 p-3.5 space-y-2 flex flex-col justify-between"
          >
            <div>
              <span className="font-mono text-[9px] text-[#2BFFEA] uppercase font-bold tracking-wider">
                Bối cảnh 0{i + 1}
              </span>
              <h5 className="font-bold text-xs text-white mt-0.5">{regime.name}</h5>
              <p className="text-[10px] text-gray-400 mt-0.5">{regime.desc}</p>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-white/5 text-[11px] font-mono">
              <div className="flex items-center justify-between rounded bg-white/[0.02] p-1.5 border border-white/5">
                <span className="text-gray-400 text-[10px]">Beta (Sóng):</span>
                <span className={`text-[10px] font-bold ${regime.status === 'pass' ? 'text-emerald-300' : 'text-rose-400'}`}>
                  {regime.beta}
                </span>
              </div>
              <div className="flex items-center justify-between rounded bg-[#2BFFEA]/10 p-1.5 border border-[#2BFFEA]/30">
                <span className="text-[#2BFFEA] text-[10px] font-bold">Alpha (Quy tắc):</span>
                <span className="text-[10px] font-bold text-emerald-300">{regime.alpha}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3 text-xs text-gray-300 flex items-start gap-2.5">
        <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
        <p>
          <b className="text-emerald-300">Tiêu chuẩn kiểm chứng tại Strategy Audit:</b> Một phương pháp chỉ nhận nhãn <b className="text-white">CHẤT</b> khi có Alpha độc lập, đứng vững qua cả 4 bối cảnh thị trường trong 22 năm và tiếp tục vượt qua kỳ thi lần 2 trên dữ liệu mới hoàn toàn (02/2024 – 07/2026).
        </p>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BC-03: Bẫy Ép Số (Curve-fitting) & 4 Trường Phái
// ─────────────────────────────────────────────────────────────────────────────
function CurveFittingDiagram({ className = '' }: { className?: string }) {
  const cards = [
    { name: 'SMC · ICT', count: 18, trades: '11.420 lệnh', result: '0 / 18 QUA' },
    { name: 'Phá Vỡ Đầu Phiên', count: 7, trades: '4.850 lệnh', result: '0 / 7 QUA' },
    { name: 'RSI Phân Kỳ', count: 12, trades: '4.190 lệnh', result: '0 / 12 QUA' },
    { name: 'MACD Giao Cắt', count: 5, trades: '2.478 lệnh', result: '0 / 5 QUA' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={`relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-[linear-gradient(145deg,rgba(11,28,43,0.95),rgba(4,12,20,0.98))] p-5 shadow-[0_12px_36px_rgba(0,0,0,0.7)] ${className}`}
    >
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/15 text-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.3)]">
            <Filter className="h-4 w-4" />
          </div>
          <div>
            <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-[#2BFFEA]">
              Bẫy Khớp Đường Cong (Curve-fitting) & Sự Thật 4 Trường Phái
            </h4>
            <span className="text-[10px] text-rose-400 font-bold">42 chiến lược kiểm định · 22.938 lệnh đo đạc</span>
          </div>
        </div>
        <span className="font-mono text-[10px] text-rose-400 font-bold bg-rose-500/20 border border-rose-500/30 px-2.5 py-0.5 rounded-full">
          0 QUA BÀI KIỂM TRA
        </span>
      </div>

      {/* Motion Graphic 3D: Con Dấu 3D Đóng Xuống 42 Thước Đo Quá Mức */}
      <CurveFitting3DScene className="mt-4 rounded-xl border border-white/10 bg-black/40" />

      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {cards.map((c, i) => (
          <motion.div
            key={c.name}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 * i, duration: 0.3 }}
            className="relative overflow-hidden rounded-xl border border-rose-500/30 bg-rose-950/20 p-3.5 text-center space-y-1.5"
          >
            <span className="font-bold text-xs text-white block">{c.name}</span>
            <div className="font-mono text-[10px] text-gray-400">{c.count} biến thể · {c.trades}</div>
            <motion.div
              initial={{ rotate: -12, scale: 1.5, opacity: 0 }}
              whileInView={{ rotate: -8, scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + 0.1 * i, type: 'spring' }}
              className="rounded-md border-2 border-rose-500 bg-rose-950/80 py-1 font-mono text-[10px] font-black text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.4)]"
            >
              {c.result}
            </motion.div>
          </motion.div>
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs text-gray-300">
        🎯 <b className="text-[#2BFFEA]">Hình ảnh ẩn dụ:</b> Giống như việc bắn tên lên tường rồi mới lấy bút vẽ hồng tâm bao quanh mũi tên. Càng cố tinh chỉnh tham số chỉ báo cho vừa khít với dữ liệu cũ thì bộ quy tắc càng dễ vỡ vụn khi đưa ra kiểm chứng ngoài mẫu.
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HS-01: Luật số lớn & Quá trình hội tụ (Law of Large Numbers Convergence)
// ─────────────────────────────────────────────────────────────────────────────
function ProbabilityDiagram({ className = '' }: { className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={`relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-[linear-gradient(145deg,rgba(11,28,43,0.95),rgba(4,12,20,0.98))] p-5 shadow-[0_12px_36px_rgba(0,0,0,0.7)] ${className}`}
    >
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#2BFFEA]/15 text-[#2BFFEA] shadow-[0_0_12px_rgba(43,255,234,0.3)]">
            <Activity className="h-4 w-4" />
          </div>
          <div>
            <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-[#2BFFEA]">
              Quy Luật Hội Tụ Của Chuỗi Lệnh (Law of Large Numbers)
            </h4>
            <span className="text-[10px] text-gray-400">Độ lệch chuẩn thu hẹp tỉ lệ nghịch với √N</span>
          </div>
        </div>
        <span className="font-mono text-[10px] text-cyan-300 font-bold bg-cyan-500/15 border border-cyan-500/30 px-2 py-0.5 rounded-full">
          Hội tụ theo N
        </span>
      </div>

      {/* Motion Graphic 3D: Mặt Phẳng Chuông Gauss & Dòng Chảy Hội Tụ N Lớn */}
      <Probability3DScene className="mt-4 rounded-xl border border-white/10 bg-black/40" />

      <div className="mt-4 space-y-4">
        {/* N = 10 */}
        <div className="space-y-1 rounded-xl bg-black/30 p-2.5 border border-white/5">
          <div className="flex justify-between text-xs">
            <span className="font-mono text-gray-400">N = 10 lệnh (Nhiễu ngẫu nhiên)</span>
            <span className="font-mono text-rose-400 font-bold">Dao động cực lớn: 20% — 80%</span>
          </div>
          <div className="relative h-2 w-full rounded-full bg-white/10 overflow-hidden">
            <motion.div
              initial={{ x: '-100%' }}
              whileInView={{ x: '0%' }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="absolute inset-y-0 left-[20%] right-[20%] rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e]"
            />
          </div>
        </div>

        {/* N = 100 */}
        <div className="space-y-1 rounded-xl bg-black/30 p-2.5 border border-white/5">
          <div className="flex justify-between text-xs">
            <span className="font-mono text-gray-400">N = 100 lệnh (Bắt đầu thu hẹp)</span>
            <span className="font-mono text-amber-400 font-bold">Dao động thu hẹp: 42% — 58%</span>
          </div>
          <div className="relative h-2 w-full rounded-full bg-white/10 overflow-hidden">
            <motion.div
              initial={{ x: '-100%' }}
              whileInView={{ x: '0%' }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="absolute inset-y-0 left-[42%] right-[42%] rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]"
            />
          </div>
        </div>

        {/* N = 1.000 */}
        <div className="space-y-1 rounded-xl bg-[#2BFFEA]/[0.06] p-2.5 border border-[#2BFFEA]/30">
          <div className="flex justify-between text-xs">
            <span className="font-mono text-[#2BFFEA] font-bold">N = 1.000 lệnh (Chuẩn kiểm định Strategy Audit)</span>
            <span className="font-mono text-emerald-300 font-bold">Hội tụ về giá trị thực: 51.2% ± 1.5%</span>
          </div>
          <div className="relative h-3 w-full rounded-full bg-white/10 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: '6%' }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.2 }}
              className="absolute inset-y-0 left-[50%] -translate-x-1/2 rounded-full bg-emerald-400 shadow-[0_0_12px_#34d399]"
            />
          </div>
        </div>
      </div>

      <p className="mt-3.5 text-[11px] text-gray-300 border-t border-white/10 pt-2.5">
        📌 <b className="text-white">Kết luận cốt lõi:</b> 10 hay 20 lệnh đầu tiên hoàn toàn là may rủi. Chỉ khi chạy qua chuỗi hàng nghìn lệnh trên giá thật có tính phí, con số thống kê mới phản ánh lợi thế thực sự của hệ thống.
      </p>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HS-02: Bộ lọc Benjamini-Hochberg (FDR Filter Motion)
// ─────────────────────────────────────────────────────────────────────────────
function MultipleTestingDiagram({ className = '' }: { className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={`relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-[linear-gradient(145deg,rgba(11,28,43,0.95),rgba(4,12,20,0.98))] p-5 shadow-[0_12px_36px_rgba(0,0,0,0.7)] ${className}`}
    >
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/15 text-cyan-300 shadow-[0_0_12px_rgba(43,255,234,0.3)]">
            <Filter className="h-4 w-4" />
          </div>
          <div>
            <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-[#2BFFEA]">
              Bộ Lọc Khử Bẫy Thử Nghiệm Hàng Loạt (Benjamini-Hochberg)
            </h4>
            <span className="text-[10px] text-gray-400">Kiểm soát tỉ lệ phát hiện sai lệch (False Discovery Rate)</span>
          </div>
        </div>
        <span className="font-mono text-[10px] text-gray-400">m = 200 lần thử</span>
      </div>

      {/* Motion Graphic 3D: Bộ Lọc Đa Tầng Lượng Tử White's Reality Check */}
      <MultipleTesting3DScene className="mt-4 rounded-xl border border-white/10 bg-black/40" />

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
        <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-3.5 space-y-2">
          <span className="font-bold text-rose-300 flex items-center gap-1.5">
            <X className="h-4 w-4" /> Thử nghiệm thô (Chưa qua lọc)
          </span>
          <p className="text-gray-300 text-[11px] leading-relaxed">
            Khi thử ngẫu nhiên 200 bộ tham số, quy luật xác suất luôn tạo ra khoảng <b className="text-rose-400">10 bộ tham số đạt p &lt; 0.05</b> thuần túy do ăn may ngẫu nhiên.
          </p>
          <div className="flex items-center gap-2 pt-1 font-mono text-[10px] text-rose-400 font-bold">
            <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
            10 bộ tham số "đẹp giả"
          </div>
        </div>

        <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3.5 space-y-2">
          <span className="font-bold text-emerald-300 flex items-center gap-1.5">
            <Check className="h-4 w-4" /> Quy chuẩn Strategy Audit (FDR)
          </span>
          <p className="text-gray-300 text-[11px] leading-relaxed">
            Áp dụng thuật toán Benjamini-Hochberg hiệu chỉnh ngưỡng theo số lần thử m. Toàn bộ 10 bộ đẹp giả bị gạt bỏ hoàn toàn khỏi thư viện.
          </p>
          <div className="flex items-center gap-2 pt-1 font-mono text-[10px] text-emerald-300 font-bold">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
            0 bộ may rủi lọt qua
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HS-03: Ma trận nhiệt tương quan 5 chỉ báo (Interactive Heatmap)
// ─────────────────────────────────────────────────────────────────────────────
function CorrelationMatrixDiagram({ className = '' }: { className?: string }) {
  const indicators = ['RSI', 'Stoch', 'MACD', 'CCI', 'W%R'];
  const values = [
    [1.00, 0.88, 0.82, 0.85, 0.91],
    [0.88, 1.00, 0.79, 0.83, 0.89],
    [0.82, 0.79, 1.00, 0.78, 0.81],
    [0.85, 0.83, 0.78, 1.00, 0.86],
    [0.91, 0.89, 0.81, 0.86, 1.00],
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={`relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-[linear-gradient(145deg,rgba(11,28,43,0.95),rgba(4,12,20,0.98))] p-5 shadow-[0_12px_36px_rgba(0,0,0,0.7)] ${className}`}
    >
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/15 text-cyan-300 shadow-[0_0_12px_rgba(43,255,234,0.3)]">
            <Layers className="h-4 w-4" />
          </div>
          <div>
            <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-[#2BFFEA]">
              Ma Trận Nhiệt Tương Quan 5 Chỉ Báo (Correlation Heatmap)
            </h4>
            <span className="text-[10px] text-gray-400">Đo lường mức độ trùng lặp tín hiệu kỹ thuật</span>
          </div>
        </div>
        <span className="font-mono text-[10px] text-amber-300 font-bold bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full">
          Trùng lặp &gt; 80%
        </span>
      </div>

      {/* Motion Graphic 3D: Chòm Sao Ma Trận Tương Quan 5 Đỉnh */}
      <Correlation3DScene className="mt-4 rounded-xl border border-white/10 bg-black/40" />

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-center text-xs font-mono">
          <thead>
            <tr>
              <th className="p-1 text-left text-gray-400"></th>
              {indicators.map((ind) => (
                <th key={ind} className="p-1 text-gray-300">{ind}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {indicators.map((ind, i) => (
              <tr key={ind}>
                <td className="p-1 text-left font-bold text-gray-300">{ind}</td>
                {values[i].map((val, j) => (
                  <td key={j} className="p-1">
                    <motion.span
                      whileHover={{ scale: 1.15 }}
                      className={`inline-block w-12 py-1 rounded font-bold cursor-pointer transition-transform ${
                        i === j
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                          : val > 0.85
                          ? 'bg-rose-500/25 text-rose-300 border border-rose-500/30 shadow-[0_0_6px_rgba(244,63,94,0.3)]'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {val.toFixed(2)}
                    </motion.span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3.5 rounded-xl border border-white/10 bg-white/[0.03] p-2.5 text-[11px] text-gray-300">
        💡 <b className="text-white">Phân tích định lượng:</b> Cả 5 chỉ báo đều có hệ số tương quan trên 0.78, nghĩa là cùng phản ánh một biến động giá trễ. Dùng đồng thời 5 chỉ báo không hề làm tăng số lớp xác nhận mà chỉ nhân gấp 5 lần độ trễ!
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HS-04: Hiệu ứng Lịch Vàng SEA003 (Motion Calendar)
// ─────────────────────────────────────────────────────────────────────────────
function CalendarSeasonalityDiagram({ className = '' }: { className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={`relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-[linear-gradient(145deg,rgba(11,28,43,0.95),rgba(4,12,20,0.98))] p-5 shadow-[0_12px_36px_rgba(0,0,0,0.7)] ${className}`}
    >
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.3)]">
            <Calendar className="h-4 w-4" />
          </div>
          <div>
            <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-[#2BFFEA]">
              Quy Luật Lịch Vàng: Mua Cuối Tháng — Bán Đầu Tháng (SEA003)
            </h4>
            <span className="text-[10px] text-gray-400">Chiến lược phi chỉ báo vượt qua cả 2 kỳ thi độc lập</span>
          </div>
        </div>
        <span className="font-mono text-[10px] text-emerald-300 font-bold bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full">
          HỒ SƠ CHẤT
        </span>
      </div>

      {/* Motion Graphic 3D: Vòng Tròn Hoàng Đạo / Bánh Xe Lịch SEA003 */}
      <CalendarSeasonality3DScene className="mt-4 rounded-xl border border-white/10 bg-black/40" />

      <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-xl border border-white/10 bg-black/40">
        <div className="text-center sm:text-left space-y-1">
          <span className="font-mono text-[10px] text-gray-400">BƯỚC 1: VÀO LỆNH MUA</span>
          <div className="text-sm font-bold text-[#2BFFEA] flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#2BFFEA] opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#2BFFEA]" />
            </span>
            2 ngày giao dịch cuối tháng
          </div>
          <p className="text-[11px] text-gray-300">Đón chu kỳ dòng tiền chốt sổ tháng của các quỹ lớn</p>
        </div>

        <div className="flex items-center gap-1 font-mono text-[#2BFFEA] text-xs">
          <span>Giữ qua đêm</span>
          <ArrowRight className="h-4 w-4 animate-pulse" />
        </div>

        <div className="text-center sm:text-left space-y-1">
          <span className="font-mono text-[10px] text-gray-400">BƯỚC 2: CHỐT LỜI KỶ LUẬT</span>
          <div className="text-sm font-bold text-amber-300 flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]" />
            Ngày giao dịch thứ 3 tháng mới
          </div>
          <p className="text-[11px] text-gray-300">Đóng lệnh tự động, không dùng chỉ báo dự đoán đỉnh đáy</p>
        </div>
      </div>

      <div className="mt-3.5 flex items-center justify-between text-xs text-gray-300 pt-2 border-t border-white/10">
        <span className="flex items-center gap-1.5">
          <Check className="h-4 w-4 text-emerald-400" /> Kỳ 1 (2019–2023): <b className="text-emerald-300">ĐẠT</b>
        </span>
        <span className="flex items-center gap-1.5">
          <Check className="h-4 w-4 text-emerald-400" /> Kỳ 2 (2024–2026): <b className="text-emerald-300">ĐẠT VỮNG</b>
        </span>
        <span className="font-mono text-[#2BFFEA] font-bold">22 năm kiểm chứng</span>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HS-05: Chặn lỗi nhìn trước tương lai (Look-ahead Shield Motion)
// ─────────────────────────────────────────────────────────────────────────────
function LookaheadBiasDiagram({ className = '' }: { className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={`relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-[linear-gradient(145deg,rgba(11,28,43,0.95),rgba(4,12,20,0.98))] p-5 shadow-[0_12px_36px_rgba(0,0,0,0.7)] ${className}`}
    >
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/15 text-cyan-300 shadow-[0_0_12px_rgba(43,255,234,0.3)]">
            <Clock className="h-4 w-4" />
          </div>
          <div>
            <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-[#2BFFEA]">
              Vách Ngăn Chặn Lỗi Nhìn Trước Tương Lai (Point-in-Time & Shift)
            </h4>
            <span className="text-[10px] text-gray-400">Khóa hàm filtration: tín hiệu Sₜ chỉ đọc từ tập dữ liệu ℱₜ₋₁</span>
          </div>
        </div>
        <span className="font-mono text-[10px] text-emerald-300 font-bold bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full">
          shift(1) BẮT BUỘC
        </span>
      </div>

      {/* Motion Graphic 3D: Tường Lửa Thời Gian & Khiên Chắn shift(1) */}
      <LookaheadShield3DScene className="mt-4 rounded-xl border border-white/10 bg-black/40" />

      <div className="mt-4 flex flex-col sm:flex-row items-center gap-3">
        <div className="flex-1 rounded-xl border border-white/10 bg-black/40 p-3 text-center space-y-1">
          <span className="font-mono text-[10px] text-gray-400">BƯỚC t - 1</span>
          <div className="font-bold text-xs text-white">Nến t - 1 ĐÓNG CỬA</div>
          <div className="text-[10px] text-emerald-300 flex items-center justify-center gap-1 font-mono">
            <Lock className="h-3 w-3" /> Dữ liệu đã cố định
          </div>
        </div>

        <div className="flex flex-col items-center gap-0.5 text-[#2BFFEA] font-mono text-[10px]">
          <span className="px-2 py-0.5 rounded bg-[#2BFFEA]/15 border border-[#2BFFEA]/30 font-bold">
            .shift(1)
          </span>
          <ArrowRight className="h-4 w-4" />
        </div>

        <div className="flex-1 rounded-xl border border-[#2BFFEA]/40 bg-[#2BFFEA]/[0.08] p-3 text-center space-y-1 shadow-[0_0_15px_rgba(43,255,234,0.15)]">
          <span className="font-mono text-[10px] text-[#2BFFEA]">BƯỚC t</span>
          <div className="font-bold text-xs text-white">Nến t MỞ CỬA</div>
          <div className="text-[10px] text-cyan-300 font-mono">
            Mới kích hoạt phát lệnh
          </div>
        </div>
      </div>

      <div className="mt-3.5 rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-2.5 text-xs text-gray-300">
        🛡️ <b className="text-emerald-300">Quy chuẩn sạch:</b> Nếu một bài backtest lấy giá đóng cửa nến t để tính tín hiệu rồi cho khớp ngay ở nến t, kết quả sẽ siêu đẹp nhưng 100% là giả tạo vì khi nến t chưa đóng thì giá đóng cửa chưa hề tồn tại!
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HS-06: Khung Walk-Forward & Embargo (Timeline Motion)
// ─────────────────────────────────────────────────────────────────────────────
function WalkForwardDiagram({ className = '' }: { className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={`relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-[linear-gradient(145deg,rgba(11,28,43,0.95),rgba(4,12,20,0.98))] p-5 shadow-[0_12px_36px_rgba(0,0,0,0.7)] ${className}`}
    >
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#2BFFEA]/15 text-[#2BFFEA] shadow-[0_0_12px_rgba(43,255,234,0.3)]">
            <Layers className="h-4 w-4" />
          </div>
          <div>
            <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-[#2BFFEA]">
              Quy Trình Walk-Forward Với Cắt Tỉa Rò Rỉ (Embargo Gap)
            </h4>
            <span className="text-[10px] text-gray-400">Tách bạch giai đoạn học và giai đoạn chấm thi độc lập</span>
          </div>
        </div>
        <span className="font-mono text-[10px] text-cyan-300 font-bold bg-cyan-500/15 border border-cyan-500/30 px-2 py-0.5 rounded-full">
          2 Kỳ thi độc lập
        </span>
      </div>

      {/* Motion Graphic 3D: Khối Đoàn Tàu Trượt In-Sample & Embargo 3D */}
      <WalkForward3DScene className="mt-4 rounded-xl border border-white/10 bg-black/40" />

      <div className="mt-4 space-y-2">
        <div className="flex h-10 w-full overflow-hidden rounded-xl border border-white/15 text-xs font-mono">
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: '56%' }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex items-center justify-center bg-cyan-950/60 text-cyan-200 border-r border-white/10 font-bold"
          >
            Tập Huấn Luyện (In-Sample)
          </motion.div>
          <div className="flex w-[10%] items-center justify-center bg-rose-950/80 text-rose-300 border-r border-white/10 text-[10px] font-bold">
            Embargo
          </div>
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: '34%' }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex items-center justify-center bg-emerald-950/60 text-emerald-200 font-bold"
          >
            Chấm Thi (Out-of-Sample)
          </motion.div>
        </div>
      </div>

      <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="rounded-lg bg-white/[0.02] p-2.5 border border-white/5 space-y-1">
          <span className="font-mono text-[10px] text-gray-400 font-bold">KỲ THI 1 (2019 – 2023)</span>
          <p className="text-gray-300 text-[11px]">242 chiến lược đo đầy đủ → Sàng lọc chọn ra đúng 15 chiến lược đạt chuẩn CHẤT.</p>
        </div>
        <div className="rounded-lg bg-emerald-950/20 p-2.5 border border-emerald-500/30 space-y-1">
          <span className="font-mono text-[10px] text-emerald-300 font-bold">KỲ THI 2 (02/2024 – 07/2026)</span>
          <p className="text-gray-300 text-[11px]">Cả 15/15 chiến lược CHẤT tiếp tục đứng vững trên dữ liệu vàng mới nhất!</p>
        </div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HS-07: Cầu Dao 3 Tầng (Kill Switch Motion)
// ─────────────────────────────────────────────────────────────────────────────
function KillSwitchDiagram({ className = '' }: { className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={`relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-[linear-gradient(145deg,rgba(11,28,43,0.95),rgba(4,12,20,0.98))] p-5 shadow-[0_12px_36px_rgba(0,0,0,0.7)] ${className}`}
    >
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-400/15 text-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.3)]">
            <ShieldAlert className="h-4 w-4" />
          </div>
          <div>
            <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-[#2BFFEA]">
              Hệ Thống Cầu Dao Tự Động 3 Tầng (3-Tier Kill Switch)
            </h4>
            <span className="text-[10px] text-gray-400">Kiểm soát rủi ro thời gian thực bảo vệ vốn</span>
          </div>
        </div>
        <span className="font-mono text-[10px] text-emerald-300 font-bold bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full">
          BẢO VỆ TỰ ĐỘNG
        </span>
      </div>

      {/* Motion Graphic 3D: Bộ Ngắt Mạch Công Nghiệp Hexagonal Circuit Breaker */}
      <KillSwitch3DScene className="mt-4 rounded-xl border border-white/10 bg-black/40" />

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <motion.div
          whileHover={{ y: -2 }}
          className="rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-3.5 text-center space-y-1.5"
        >
          <div className="font-mono text-[10px] font-bold text-cyan-300 flex items-center justify-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5" /> TẦNG 1: TRƯỚC LỆNH
          </div>
          <div className="font-bold text-white text-xs">Kiểm Tra Ngưỡng Vốn</div>
          <p className="text-[10px] text-gray-300">Tự động chặn nếu quy mô lệnh vượt trần rủi ro quy định</p>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-3.5 text-center space-y-1.5"
        >
          <div className="font-mono text-[10px] font-bold text-amber-300 flex items-center justify-center gap-1">
            <AlertTriangle className="h-3.5 w-3.5" /> TẦNG 2: TRONG PHIÊN
          </div>
          <div className="font-bold text-white text-xs">Đếm Chuỗi Thua (Streak)</div>
          <p className="text-[10px] text-gray-300">Nếu chuỗi thua &ge; 8 lệnh, tự động hạ 50% cỡ lệnh tiếp theo</p>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="rounded-xl border border-rose-500/40 bg-rose-950/30 p-3.5 text-center space-y-1.5"
        >
          <div className="font-mono text-[10px] font-bold text-rose-400 flex items-center justify-center gap-1">
            <Zap className="h-3.5 w-3.5 animate-bounce" /> TẦNG 3: KHẨN CẤP
          </div>
          <div className="font-bold text-rose-300 text-xs">Ngắt Mạch Toàn Bộ</div>
          <p className="text-[10px] text-gray-300">Cắt toàn bộ lệnh và khóa bot khi chạm hạn mức sụt giảm ngày</p>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HS-08: Sổ lệnh vi mô & Chi phí thực thi (Order Book & Slippage Motion)
// ─────────────────────────────────────────────────────────────────────────────
function OrderBookMicrostructureDiagram({ className = '' }: { className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={`relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-[linear-gradient(145deg,rgba(11,28,43,0.95),rgba(4,12,20,0.98))] p-5 shadow-[0_12px_36px_rgba(0,0,0,0.7)] ${className}`}
    >
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/15 text-cyan-300 shadow-[0_0_12px_rgba(43,255,234,0.3)]">
            <Binary className="h-4 w-4" />
          </div>
          <div>
            <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-[#2BFFEA]">
              Cấu Trúc Sổ Lệnh & Tổn Thất Do Trượt Giá (Slippage)
            </h4>
            <span className="text-[10px] text-gray-400">Giá thấy trên màn hình ≠ Giá khớp thực tế trong sổ lệnh</span>
          </div>
        </div>
        <span className="font-mono text-[10px] text-rose-400 font-bold bg-rose-500/15 border border-rose-500/30 px-2 py-0.5 rounded-full">
          Chi phí vô hình
        </span>
      </div>

      {/* Motion Graphic 3D: Bậc Thang Sổ Lệnh Chiều Sâu & Trượt Giá Slippage */}
      <OrderBookMicro3DScene className="mt-4 rounded-xl border border-white/10 bg-black/40" />

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
        {/* Animated Depth Ladder */}
        <div className="rounded-xl border border-white/10 bg-black/40 p-3 space-y-1.5 font-mono text-[11px]">
          <div className="text-[10px] text-gray-400 font-bold uppercase pb-1 border-b border-white/10">
            Sổ lệnh giới hạn (Limit Order Book)
          </div>
          <div className="flex justify-between text-rose-400">
            <span>Ask 2 (Bán 10 lots)</span>
            <span>2650.80</span>
          </div>
          <div className="flex justify-between text-rose-300">
            <span>Ask 1 (Bán 5 lots)</span>
            <span>2650.50</span>
          </div>
          <div className="py-1 text-center text-amber-300 bg-amber-500/15 rounded border border-amber-500/30 text-[10px] font-bold">
            Chênh lệch Spread = 0.30 giá
          </div>
          <div className="flex justify-between text-emerald-300">
            <span>Bid 1 (Mua 6 lots)</span>
            <span>2650.20</span>
          </div>
          <div className="flex justify-between text-emerald-400">
            <span>Bid 2 (Mua 12 lots)</span>
            <span>2649.90</span>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3.5 flex flex-col justify-between space-y-2 text-xs">
          <div>
            <b className="text-white text-xs block mb-1">Tại sao lướt sóng ngắn thường thất bại?</b>
            <p className="text-gray-300 text-[11px] leading-relaxed">
              Khi thị trường chạy nhanh, lệnh quét qua nhiều mức giá (Slippage) cộng với phí spread hai chiều sẽ ăn sạch toàn bộ biên lợi nhuận của các mục tiêu lời nhỏ.
            </p>
          </div>
          <div className="rounded-lg bg-rose-500/20 border border-rose-500/40 p-2 text-rose-300 font-mono text-[10px]">
            Tổng chi phí 1.000 lệnh &gt; Tổng lợi thế lý thuyết
          </div>
        </div>
      </div>
    </motion.div>
  );
}
