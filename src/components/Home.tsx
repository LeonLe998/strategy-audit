/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  Zap, 
  TrendingDown, 
  TrendingUp, 
  ArrowRight, 
  Cpu, 
  FileText, 
  ShieldAlert as DangerIcon,
  CheckCircle,
  HelpCircle as HelpIcon
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const HolographicDashboard = () => {
  return (
    <div className="relative w-full h-[350px] md:h-[400px] flex items-center justify-center transform scale-90 md:scale-100 mt-8 md:mt-0">
      {/* Center Main Card (z-20) */}
      <motion.div 
        animate={{ y: [0, -15, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="absolute z-20 w-64 md:w-72 bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl shadow-[0_0_40px_rgba(0,255,163,0.1)] p-6 flex flex-col items-center"
      >
         <div className="w-full h-24 mb-6 flex items-end space-x-2 border-b border-white/10 pb-2">
            <div className="w-1/5 bg-[#00FFA3]/40 h-[20%] rounded-t-sm"></div>
            <div className="w-1/5 bg-[#00FFA3]/60 h-[40%] rounded-t-sm"></div>
            <div className="w-1/5 bg-[#00FFA3]/80 h-[60%] rounded-t-sm"></div>
            <div className="w-1/5 bg-[#00FFA3] h-[80%] rounded-t-sm shadow-[0_0_15px_#00FFA3]"></div>
            <div className="w-1/5 bg-[#00FFA3] h-[100%] rounded-t-sm shadow-[0_0_20px_#00FFA3]"></div>
         </div>
         <p className="text-white font-bold text-center tracking-wide text-sm md:text-base">WFO Optimization Complete</p>
      </motion.div>

      {/* Top Right Card (z-30) */}
      <motion.div 
        animate={{ y: [0, -10, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0 }}
        className="absolute z-30 top-4 md:top-8 right-0 md:right-10 bg-[#0B0E14]/80 backdrop-blur-xl border border-[#00FFA3]/40 rounded-xl shadow-2xl p-3 md:p-4 flex items-center space-x-3"
      >
         <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-[#00FFA3] shadow-[0_0_10px_#00FFA3] animate-pulse"></div>
         <p className="text-[#00FFA3] font-bold text-xs md:text-sm tracking-widest uppercase">Alpha Score: 1.95</p>
      </motion.div>

      {/* Bottom Left Card (z-10) */}
      <motion.div 
        animate={{ y: [0, -12, 0] }} transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute z-10 bottom-4 md:bottom-8 left-0 md:left-10 bg-[#0B0E14]/80 backdrop-blur-xl border border-coral-red/40 rounded-xl shadow-2xl p-3 md:p-4"
      >
         <p className="text-coral-red font-bold text-xs md:text-sm tracking-widest uppercase">Max Drawdown: 2.1% (Safe)</p>
      </motion.div>
    </div>
  );
};


interface HomeProps {
  setActiveTab: (tab: string) => void;
}

export default function Home({ setActiveTab }: HomeProps) {
  // Calculator States
  const [winRate, setWinRate] = useState<number>(55);
  const [riskReward, setRiskReward] = useState<number>(1.5);
  const [riskPerTrade, setRiskPerTrade] = useState<number>(1);
  const [initialCapital, setInitialCapital] = useState<number>(100000);

  // Math calculations
  const { ev, isPositiveEv, simData } = useMemo(() => {
    // Math Expectation (EV) = (WinRate * RewardRatio) - (LossRate * 1)
    // RewardRatio is Reward / Risk, loss cost is 1 (the unit of risk)
    const winRatio = winRate / 100;
    const lossRatio = 1 - winRatio;
    const computedEv = (winRatio * riskReward) - lossRatio;
    const isPositive = computedEv > 0;

    // Generate simulated dynamic equity curve (30 trades) based on math parameters
    const data = [];
    let currentEquity = initialCapital;
    data.push({ trade: 0, equity: Math.round(currentEquity), status: 'Start' });

    // Seeded randomness for reproducibility in presentation
    let seed = 42;
    const pseudorandom = () => {
      const x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    };

    for (let i = 1; i <= 30; i++) {
      const randValue = pseudorandom();
      const isWin = randValue < winRatio;
      const profitDollar = initialCapital * (riskPerTrade / 100) * riskReward;
      const lossDollar = initialCapital * (riskPerTrade / 100);

      if (isWin) {
        currentEquity += profitDollar;
      } else {
        currentEquity -= lossDollar;
      }

      data.push({
        trade: i,
        equity: Math.round(currentEquity),
        status: isWin ? 'Win' : 'Loss'
      });
    }

    return {
      ev: parseFloat(computedEv.toFixed(3)),
      isPositiveEv: isPositive,
      simData: data
    };
  }, [winRate, riskReward, riskPerTrade, initialCapital]);

  return (
    <div id="home-view" className="space-y-20 pb-20">
      
      {/* 1. Hero Section */}
      <section id="hero-section" className="relative pt-10 md:pt-16 pb-12 overflow-hidden">
        {/* Soft atmospheric gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neon-green/10 via-transparent to-transparent pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-4 relative z-10 text-center lg:text-left">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center space-x-2 bg-coral-red/10 border border-coral-red/20 px-4 py-1.5 rounded-full text-xs font-mono text-coral-red font-bold uppercase tracking-widest mb-6"
              >
                <DangerIcon className="w-3.5 h-3.5" />
                <span>90% TRADER CÓ KIẾN THỨC VẪN THUA LỖ. TỐI ƯU HỆ THỐNG CHÍNH LÀ VŨ KHÍ BẬC NHẤT.</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl md:text-6xl font-display font-bold tracking-tight text-white leading-tight md:leading-none"
              >
                Chúng tôi kiểm toán, ép xung và <br />
                <span className="text-neon-green font-extrabold relative">
                  tối ưu hóa Walk-Forward
                  <span className="absolute -bottom-1 left-0 w-full h-[3px] bg-neon-green/30"></span>
                </span>{" "}
                chiến lược của bạn.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mt-6 text-gray-400 text-lg max-w-2xl font-sans font-light"
              >
                Ngừng giao dịch theo linh cảm hay tối ưu hóa bừa bãi. Strategy Audit áp dụng chuẩn mực của các Quỹ Định Lượng chuyên nghiệp để đưa hệ thống của bạn vượt qua thử thách WFO.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <HolographicDashboard />
            </motion.div>
          </div>

          {/* Core steps widgets */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12">
            {[
              { num: "01", title: "Mô tả chiến lược", desc: "Nhập quy tắc vào lệnh (EMA, RSI, PA...) và thông số quản lý vốn trong 5 phút.", icon: Cpu },
              { num: "02", title: "Chạy WFO Kiểm Định", desc: "Hệ thống chia nhỏ dữ liệu quá khứ thành từng nhóm, chạy tối ưu Walk-Forward chống overfitting.", icon: Zap },
              { num: "03", title: "Nhận Báo Cáo PDF", desc: "Báo cáo chi tiết định lượng: Kỳ vọng toán học, Risk of Ruin, khả năng vượt quỹ (Prop Firm).", icon: FileText }
            ].map((step, idx) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.num}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + idx * 0.1 }}
                  className="bg-[#131722]/80 backdrop-blur-md border border-[#1F2937] hover:border-neon-green/40 duration-300 p-6 rounded-2xl text-left flex flex-col justify-between h-44"
                >
                  <div className="flex items-start justify-between">
                    <span className="text-3xl font-mono text-neon-green font-bold opacity-30 group-hover:opacity-100">{step.num}</span>
                    <Icon className="w-5 h-5 text-neon-green/80" />
                  </div>
                  <div>
                    <h3 className="text-white text-base font-bold mb-1">{step.title}</h3>
                    <p className="text-gray-400 text-xs leading-relaxed">{step.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Action and Slots info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-12 space-y-4"
          >
            <button
              onClick={() => setActiveTab('audit')}
              className="px-8 py-4 rounded-xl bg-neon-green text-black font-display font-medium text-sm uppercase tracking-wider shadow-[0_0_20px_rgba(0,255,163,0.25)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer inline-flex items-center space-x-2"
            >
              <span>Kiểm toán chiến lược của bạn ngay</span>
              <ArrowRight className="w-4 h-4 text-black" />
            </button>

            {/* Capacity Slot Notice */}
            <div className="flex items-center justify-center space-x-2 text-xs font-mono text-gray-500 bg-[#131722]/40 border border-[#1F2937]/50 max-w-sm mx-auto px-4 py-2 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-coral-red animate-pulse"></span>
              <span>Năng lực máy chủ giới hạn: Xử lý tối đa 50 chiến lược/tuần.</span>
              <span className="text-coral-red font-bold">Còn trống: 07 slots</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. Reality Check Comparison */}
      <section id="reality-check-section" className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <span className="text-xs uppercase tracking-widest font-mono text-neon-green font-bold bg-neon-green/10 px-3 py-1 rounded">Thức Tỉnh (Reality Check)</span>
          <h2 className="text-2xl md:text-4xl font-display font-bold mt-3 text-white">Tư Duy Cảm Tính vs Tư Duy Định Lượng</h2>
          <p className="text-gray-400 text-sm mt-3 max-w-2xl mx-auto">
            Chiến lược không cần "vẽ hoàn hảo" trên biểu đồ quá khứ, nó cần kiếm được tiền ở tương lai. Việc bạn ngồi tinh chỉnh thông số liên tục cho khớp với lịch sử (Curve-fitting) chỉ kéo bạn gần hơn đến cháy quỹ.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Strategy A (Feeling/Overfit) */}
          <div className="bg-[#131722]/60 backdrop-blur-md border border-coral-red/20 hover:border-coral-red/40 transition-all duration-300 rounded-2xl p-8 relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 left-0 w-full h-1 bg-coral-red"></div>
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono font-bold bg-coral-red/10 text-coral-red px-2 py-0.5 rounded uppercase">Thủ Công & Lãng Phí</span>
                <TrendingDown className="w-5 h-5 text-coral-red" />
              </div>
              <h3 className="text-xl font-display font-bold text-white mb-2">Chiến Lược A: Backtest Thủ Công</h3>
              <p className="text-gray-400 text-xs mb-6 font-sans leading-relaxed">
                Backtest bằng cách thủ công replay tua lại nến để mất vài tuần để thu thập đủ 100 lệnh và lãng phí hàng tháng trời chỉ để thử nghiệm đúng 1 kịch bản.
              </p>

              <div className="space-y-3.5 border-t border-[#1F2937] pt-6 text-sm">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">Phương pháp thực thi</span>
                  <span className="text-coral-red font-bold">Thao tác thủ công dậm chân tại chỗ</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">Thời gian tiêu hoang</span>
                  <span className="text-coral-red font-bold">Vài tuần đến vài tháng trời</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">Số lượng cấu hình test</span>
                  <span className="text-coral-red font-bold">Chỉ đúng 1 kịch bản đơn độc</span>
                </div>
              </div>
            </div>

            <div className="mt-8 bg-coral-red/5 border border-coral-red/10 p-3.5 rounded-lg text-xs text-coral-red leading-relaxed font-sans">
              <strong>Hạn chế cốt lõi:</strong> Bạn tốn quá nhiều thời gian vô ích để thu thập mẫu số liệu quá nhỏ, dễ nản chí và chịu rủi ro overfitting cực kỳ cao.
            </div>
          </div>

          {/* Strategy B (Quant/WFO) */}
          <div className="bg-[#131722]/60 backdrop-blur-md border border-neon-green/20 hover:border-neon-green/45 transition-all duration-300 rounded-2xl p-8 relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 left-0 w-full h-1 bg-neon-green"></div>
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono font-bold bg-neon-green/10 text-neon-green px-2 py-0.5 rounded uppercase">Quét Đa Biến Tự Động</span>
                <TrendingUp className="w-5 h-5 text-neon-green" />
              </div>
              <h3 className="text-xl font-display font-bold text-white mb-2">Chiến Lược B: Strategy Audit</h3>
              <p className="text-gray-400 text-xs mb-6 font-sans leading-relaxed">
                Hệ thống Strategy Audit sẽ chạy quét toàn bộ dữ liệu đồng loạt ở hàng trăm cấu hình thông số khác nhau để tìm ra top các cấu hình mang lại Winrate cao nhất, top các cấu hình lợi nhuận tốt nhất.
              </p>

              <div className="space-y-3.5 border-t border-[#1F2937] pt-6 text-sm">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">Phương pháp thực thi</span>
                  <span className="text-neon-green font-bold">Quét dữ liệu đa chiều thông minh</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">Thời gian tiêu hoang</span>
                  <span className="text-neon-green font-bold">Tối ưu tức thì chuẩn xác</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">Số lượng cấu hình test</span>
                  <span className="text-neon-green font-bold">Hàng trăm cấu hình đồng thời</span>
                </div>
              </div>
            </div>

            <div className="mt-8 bg-neon-green/5 border border-neon-green/10 p-3.5 rounded-lg text-xs text-neon-green leading-relaxed font-sans">
              <strong>Thế mạnh định lượng:</strong> Nhanh chóng chỉ ra đâu là vùng thông số mang lại Winrate cao nhất và lợi nhuận tốt nhất cho hệ thống giao dịch của bạn.
            </div>
          </div>
        </div>
      </section>

      {/* 3. Interactive Math Expectation & Risk of Ruin Simulator */}
      <section id="simulator-section" className="max-w-7xl mx-auto px-4">
        <div className="bg-[#131722]/40 border border-[#1F2937]/80 rounded-3xl p-6 md:p-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-neon-green/5 rounded-full blur-[100px] pointer-events-none"></div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Controls */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <span className="text-xs font-mono font-bold text-neon-green tracking-wider uppercase">Alpha Engine Simulator</span>
                <h2 className="text-xl md:text-3xl font-display font-bold text-white mt-2">Tính toán và Mô phỏng alpha quỹ</h2>
                <p className="text-gray-400 text-xs mt-2 font-sans leading-relaxed">
                  Trực tiếp điều chỉnh các tham số hệ thống để mô phỏng biểu đồ tăng trường của 30 lệnh tiếp theo và tính Kỳ Vọng Toán Học (Expected Value) thực tế.
                </p>
              </div>

              <div className="space-y-5 border-t border-[#1F2937] pt-5">
                {/* Account capital size */}
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-gray-400 font-medium">Quy mô vốn tài khoản (USD)</span>
                    <span className="text-white font-mono font-semibold">${initialCapital.toLocaleString()}</span>
                  </div>
                  <input 
                    type="range"
                    min="10000"
                    max="300000"
                    step="10000"
                    value={initialCapital}
                    onChange={(e) => setInitialCapital(Number(e.target.value))}
                    className="w-full accent-neon-green cursor-pointer h-1.5 bg-[#0B0E14] rounded-lg"
                  />
                </div>

                {/* Winrate */}
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-gray-400 font-medium">Tỷ lệ thắng (Win Rate %)</span>
                    <span className="text-neon-green font-mono font-bold">{winRate}%</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input 
                      type="range"
                      min="10"
                      max="90"
                      step="1"
                      value={winRate}
                      onChange={(e) => setWinRate(Number(e.target.value))}
                      className="w-full accent-neon-green cursor-pointer h-1.5 bg-[#0B0E14] rounded-lg"
                    />
                  </div>
                </div>

                {/* Risk:Reward ratio */}
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-gray-400 font-medium">Tỷ lệ Lợi nhuận/Rủi ro (R:R Ratio)</span>
                    <span className="text-neon-green font-mono font-bold">1 : {riskReward}</span>
                  </div>
                  <input 
                    type="range"
                    min="0.3"
                    max="5.0"
                    step="0.1"
                    value={riskReward}
                    onChange={(e) => setRiskReward(Number(e.target.value))}
                    className="w-full accent-neon-green cursor-pointer h-1.5 bg-[#0B0E14] rounded-lg"
                  />
                </div>

                {/* Risk per trade */}
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-gray-400 font-medium">Rủi ro tối đa mỗi lệnh (% tài khoản)</span>
                    <span className="text-coral-red font-mono font-bold">{riskPerTrade}%</span>
                  </div>
                  <input 
                    type="range"
                    min="0.5"
                    max="5.0"
                    step="0.1"
                    value={riskPerTrade}
                    onChange={(e) => setRiskPerTrade(Number(e.target.value))}
                    className="w-full accent-neon-green cursor-pointer h-1.5 bg-[#0B0E14] rounded-lg"
                  />
                  <span className="text-[10px] text-gray-500 block mt-1 leading-normal">
                    *Mức rủi ro an toàn cho quỹ prop firm thường là 0.5% - 1%. Tăng trên 3% rủi ro cháy tài khoản sẽ bùng nổ cực cao do chuỗi thua.
                  </span>
                </div>
              </div>
            </div>

            {/* Right Display Board & Chart */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
              {/* Alpha Card */}
              <div id="ev-card-output" className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#0B0E14] border border-[#1F2937] p-4 rounded-xl text-center">
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest block mb-1">Expectation (EV)</span>
                  <span className={`text-2xl font-mono font-bold font-display ${isPositiveEv ? 'text-neon-green' : 'text-coral-red'}`}>
                    {ev > 0 ? `+${ev}` : ev}
                  </span>
                </div>
                <div className="bg-[#0B0E14] border border-[#1F2937] p-4 rounded-xl text-center">
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest block mb-1">Trung bình Thắng (Avg Win)</span>
                  <span className="text-xl text-white font-mono font-bold">
                    +${(initialCapital * (riskPerTrade / 100) * riskReward).toLocaleString()}
                  </span>
                </div>
                <div className="bg-[#0B0E14] border border-[#1F2937] p-4 rounded-xl text-center">
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest block mb-1">Trung bình Thua (Avg Loss)</span>
                  <span className="text-xl text-coral-red font-mono font-bold">
                    -${(initialCapital * (riskPerTrade / 100)).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Status Message */}
              <div id="ev-message-output">
                {isPositiveEv ? (
                  <div className="bg-neon-green/5 border border-neon-green/20 p-4 rounded-2xl flex items-start space-x-3 text-xs text-neon-green leading-relaxed">
                    <CheckCircle className="w-5 h-5 shrink-0 text-neon-green" />
                    <div>
                      <strong className="font-bold">✅ HỆ THỐNG CÓ ALPHA:</strong> Kỳ vọng toán học (EV) Dương. Tuy nhiên, để đảm bảo đây không phải là ảo giác của bẫy Khớp Đường Cong (Curve-fitting), bạn vẫn cần chạy kiểm toán WFO.
                    </div>
                  </div>
                ) : (
                  <div className="bg-coral-red/5 border border-coral-red/20 p-4 rounded-2xl flex items-start space-x-3 text-xs text-coral-red leading-relaxed">
                    <DangerIcon className="w-5 h-5 shrink-0 text-coral-red" />
                    <div>
                      <strong className="font-bold">⚠️ CẢNH BÁO:</strong> Kỳ vọng toán học (EV) đang ÂM. Xác suất cháy quỹ (Risk of Ruin) &gt; 85%. Hệ thống của bạn sẽ sụp đổ, cần tối ưu đa biến ngay lập tức!
                    </div>
                  </div>
                )}
              </div>

              {/* Equity Chart */}
              <div className="bg-[#0B0E14] border border-[#1F2937] p-4 rounded-2xl h-56 flex flex-col justify-between">
                <div className="flex items-center justify-between pointer-events-none mb-1">
                  <span className="text-[10px] font-mono tracking-wider uppercase text-gray-500">Mô phỏng 30 lệnh giao dịch (Out-of-sample)</span>
                  <span className="text-[10px] font-mono font-bold text-neon-green uppercase">Live Equity Curve</span>
                </div>
                <div className="w-full h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={simData} margin={{ top: 5, right: 5, left: 10, bottom: 5 }}>
                      <defs>
                        <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={isPositiveEv ? '#00FFA3' : '#FF3366'} stopOpacity={0.2}/>
                          <stop offset="95%" stopColor={isPositiveEv ? '#00FFA3' : '#FF3366'} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="trade" stroke="#4b5563" fontSize={9} fontStyle="JetBrains Mono" tickLine={false} />
                      <YAxis 
                        stroke="#4b5563" 
                        fontSize={9} 
                        fontStyle="JetBrains Mono" 
                        domain={['dataMin - 1000', 'dataMax + 1000']}
                        tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#131722', border: '1px solid #1F2937', borderRadius: '8px' }}
                        labelStyle={{ color: '#9ca3af', fontSize: '10px', fontFamily: 'JetBrains Mono' }}
                        itemStyle={{ color: '#fff', fontSize: '11px', fontFamily: 'JetBrains Mono' }}
                        formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Equity']}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="equity" 
                        stroke={isPositiveEv ? '#00FFA3' : '#FF3366'} 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#colorEquity)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Bottom Action CTA */}
      <section id="banner-action-bottom" className="max-w-7xl mx-auto px-4 text-center">
        <div className="bg-gradient-to-r from-neon-green/5 via-coral-red/5 to-transparent border border-[#1F2937] p-8 md:p-12 rounded-3xl max-w-4xl mx-auto flex flex-col items-center">
          <HelpIcon className="w-12 h-12 text-neon-green/80 mb-4 animate-bounce" />
          <h2 className="text-2xl md:text-3xl font-display font-bold text-white uppercase">Chiến lược của bạn đã đủ định lượng chưa?</h2>
          <p className="text-gray-400 text-sm mt-3 max-w-lg">
            Đừng để tài khoản quỹ bốc hơi vì cảm tính thêm một ngày nào nữa. Gửi ngay logic hệ thống để nhận báo cáo ép xung WFO chuyên sâu.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 w-full max-w-md">
            <button 
              onClick={() => setActiveTab('audit')}
              className="w-full sm:w-auto px-6 py-3.5 bg-neon-green text-black font-semibold text-xs rounded-xl tracking-wider uppercase shadow-[0_0_15px_rgba(0,255,163,0.2)] hover:scale-[1.01] active:scale-[0.99] transition duration-200 cursor-pointer"
            >
              Đưa chiến lược lên hệ thống định lượng ngay
            </button>
            <button 
              onClick={() => setActiveTab('vault')}
              className="w-full sm:w-auto px-6 py-3.5 bg-transparent text-gray-300 font-semibold text-xs rounded-xl tracking-wider uppercase border border-[#1F2937] hover:border-gray-500 transition duration-200 cursor-pointer"
            >
              Xem Thư viện tài liệu
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
