import React, { useState, useMemo } from 'react';

import { motion } from 'framer-motion';
import { 
  CheckCircle2, Cpu,
  TrendingDown, TrendingUp, ArrowRight, Zap, FileText,
  ShieldAlert as DangerIcon, CheckCircle 
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import IntakeWizard from './IntakeWizard';

const HolographicDashboard = () => {
  return (
    <div className="relative w-full h-[350px] md:h-[400px] flex items-center justify-center transform scale-90 md:scale-100">
      {/* Center Main Card (z-20) */}
      <motion.div 
        animate={{ y: [0, -15, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="absolute z-20 w-64 md:w-72 bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl shadow-[0_0_40px_rgba(0,255,163,0.1)] p-6 flex flex-col items-center"
      >
         <div className="w-full h-24 mb-6 flex items-end space-x-2 border-b border-white/10 pb-2">
            {/* Simple bars simulating a chart */}
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
        className="absolute z-10 bottom-4 md:bottom-8 left-0 md:left-10 bg-[#0B0E14]/80 backdrop-blur-xl border border-[#FF3366]/40 rounded-xl shadow-2xl p-3 md:p-4"
      >
         <p className="text-[#FF3366] font-bold text-xs md:text-sm tracking-widest uppercase">Max Drawdown: 2.1% (Safe)</p>
      </motion.div>
    </div>
  );
};

const SectionWrapper: React.FC<{ children: React.ReactNode, id?: string, className?: string }> = ({ children, id, className }) => {
  return (
    <motion.section 
      id={id}
      className={className}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      viewport={{ once: true, margin: "-100px" }}
    >
      {children}
    </motion.section>
  );
};

const LandingPage: React.FC = () => {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

  // Calculator States
  const [winRate, setWinRate] = useState<number>(55);
  const [riskReward, setRiskReward] = useState<number>(1.5);
  const [riskPerTrade, setRiskPerTrade] = useState<number>(1);
  const [initialCapital, setInitialCapital] = useState<number>(100000);

  const handleSelectPackage = (pkgName: string) => {
    setSelectedPackage(pkgName);
    document.getElementById('audit-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToAudit = () => {
    document.getElementById('audit-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Math calculations for Simulator
  const { ev, isPositiveEv, simData } = useMemo(() => {
    const winRatio = winRate / 100;
    const lossRatio = 1 - winRatio;
    const computedEv = (winRatio * riskReward) - lossRatio;
    const isPositive = computedEv > 0;

    const data = [];
    let currentEquity = initialCapital;
    data.push({ trade: 0, equity: Math.round(currentEquity), status: 'Start' });

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
    <div className="space-y-20 pb-20 pt-16">
      {/* 1. Hero Section */}
      <section id="hero-section" className="relative pt-10 md:pt-16 pb-12 overflow-hidden">
        {/* Soft atmospheric gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#00FFA3]/10 via-transparent to-transparent pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-4 relative z-10 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center space-x-2 bg-[#FF3366]/10 border border-[#FF3366]/20 px-4 py-1.5 rounded-full text-xs font-mono text-[#FF3366] font-bold uppercase tracking-widest mb-6"
          >
            <DangerIcon className="w-3.5 h-3.5" />
            <span>90% TRADER CÓ KIẾN THỨC VẪN THUA LỖ. TỐI ƯU HỆ THỐNG CHÍNH LÀ VŨ KHÍ BẬC NHẤT.</span>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center text-left w-full mt-8">
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl md:text-5xl lg:text-6xl font-display font-bold tracking-tight text-white leading-tight"
              >
                Chúng tôi kiểm toán, ép xung và <br />
                <span className="text-[#00FFA3] font-extrabold relative">
                  tối ưu hóa Walk-Forward
                  <span className="absolute -bottom-1 left-0 w-full h-[3px] bg-[#00FFA3]/30"></span>
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

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mt-8 space-y-4"
              >
                <button
                  onClick={scrollToAudit}
                  className="px-8 py-4 rounded-xl bg-[#00FFA3] text-black font-display font-medium text-sm uppercase tracking-wider shadow-[0_0_20px_rgba(0,255,163,0.25)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer inline-flex items-center space-x-2"
                >
                  <span>Kiểm toán chiến lược ngay</span>
                  <ArrowRight className="w-4 h-4 text-black" />
                </button>

                <div className="flex items-center space-x-2 text-xs font-mono text-gray-500 bg-[#131722]/40 border border-[#1F2937]/50 max-w-sm px-4 py-2 rounded-lg">
                  <span className="w-2 h-2 rounded-full bg-[#FF3366] animate-pulse"></span>
                  <span>Máy chủ xử lý tối đa 50 slot/tuần.</span>
                  <span className="text-[#FF3366] font-bold">Còn 07 slots</span>
                </div>
              </motion.div>
            </div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <HolographicDashboard />
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. Reality Check Comparison */}
      <SectionWrapper id="cases" className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <span className="text-xs uppercase tracking-widest font-mono text-[#00FFA3] font-bold bg-[#00FFA3]/10 px-3 py-1 rounded">Thức Tỉnh (Reality Check)</span>
          <h2 className="text-2xl md:text-4xl font-display font-bold mt-3 text-white">Tư Duy Cảm Tính vs Tư Duy Định Lượng</h2>
          <p className="text-gray-400 text-sm mt-3 max-w-2xl mx-auto">
            Chiến lược không cần "vẽ hoàn hảo" trên biểu đồ quá khứ, nó cần kiếm được tiền ở tương lai. Việc bạn ngồi tinh chỉnh thông số liên tục cho khớp với lịch sử (Curve-fitting) chỉ kéo bạn gần hơn đến cháy quỹ.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Strategy A (Feeling/Overfit) */}
          <div className="bg-[#131722]/60 backdrop-blur-md border border-[#FF3366]/20 hover:border-[#FF3366]/40 transition-all duration-300 rounded-2xl p-8 relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#FF3366]"></div>
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono font-bold bg-[#FF3366]/10 text-[#FF3366] px-2 py-0.5 rounded uppercase">Thủ Công & Lãng Phí</span>
                <TrendingDown className="w-5 h-5 text-[#FF3366]" />
              </div>
              <h3 className="text-xl font-display font-bold text-white mb-2">Chiến Lược A: Backtest Thủ Công</h3>
              <p className="text-gray-400 text-xs mb-6 font-sans leading-relaxed">
                Backtest bằng cách thủ công replay tua lại nến để mất vài tuần để thu thập đủ 100 lệnh và lãng phí hàng tháng trời chỉ để thử nghiệm đúng 1 kịch bản.
              </p>

              <div className="space-y-3.5 border-t border-[#1F2937] pt-6 text-sm">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">Phương pháp thực thi</span>
                  <span className="text-[#FF3366] font-bold">Thao tác thủ công dậm chân</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">Thời gian tiêu hoang</span>
                  <span className="text-[#FF3366] font-bold">Vài tuần đến vài tháng</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">Số lượng cấu hình test</span>
                  <span className="text-[#FF3366] font-bold">Chỉ 1 kịch bản đơn độc</span>
                </div>
              </div>
            </div>

            <div className="mt-8 bg-[#FF3366]/5 border border-[#FF3366]/10 p-3.5 rounded-lg text-xs text-[#FF3366] leading-relaxed font-sans">
              <strong>Hạn chế cốt lõi:</strong> Bạn tốn quá nhiều thời gian vô ích để thu thập mẫu số liệu quá nhỏ, dễ nản chí và chịu rủi ro overfitting cực kỳ cao.
            </div>
          </div>

          {/* Strategy B (Quant/WFO) */}
          <div className="bg-[#131722]/60 backdrop-blur-md border border-[#00FFA3]/20 hover:border-[#00FFA3]/45 transition-all duration-300 rounded-2xl p-8 relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#00FFA3]"></div>
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono font-bold bg-[#00FFA3]/10 text-[#00FFA3] px-2 py-0.5 rounded uppercase">Quét Đa Biến Tự Động</span>
                <TrendingUp className="w-5 h-5 text-[#00FFA3]" />
              </div>
              <h3 className="text-xl font-display font-bold text-white mb-2">Chiến Lược B: Strategy Audit</h3>
              <p className="text-gray-400 text-xs mb-6 font-sans leading-relaxed">
                Hệ thống Strategy Audit sẽ chạy quét toàn bộ dữ liệu đồng loạt ở hàng trăm cấu hình thông số khác nhau để tìm ra top các cấu hình tối ưu.
              </p>

              <div className="space-y-3.5 border-t border-[#1F2937] pt-6 text-sm">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">Phương pháp thực thi</span>
                  <span className="text-[#00FFA3] font-bold">Quét dữ liệu đa chiều</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">Thời gian tiêu hoang</span>
                  <span className="text-[#00FFA3] font-bold">Tối ưu tức thì chuẩn xác</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">Số lượng cấu hình test</span>
                  <span className="text-[#00FFA3] font-bold">Hàng trăm cấu hình đồng thời</span>
                </div>
              </div>
            </div>

            <div className="mt-8 bg-[#00FFA3]/5 border border-[#00FFA3]/10 p-3.5 rounded-lg text-xs text-[#00FFA3] leading-relaxed font-sans">
              <strong>Thế mạnh định lượng:</strong> Nhanh chóng chỉ ra đâu là vùng thông số mang lại Winrate cao nhất và lợi nhuận tốt nhất cho hệ thống giao dịch của bạn.
            </div>
          </div>
        </div>
      </SectionWrapper>

      {/* 3. Interactive Math Expectation & Risk of Ruin Simulator */}
      <SectionWrapper id="simulator-section" className="max-w-7xl mx-auto px-4">
        <div className="bg-[#131722]/40 border border-[#1F2937]/80 rounded-3xl p-6 md:p-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#00FFA3]/5 rounded-full blur-[100px] pointer-events-none"></div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Controls */}
            <div className="lg:col-span-5 space-y-6 relative z-10">
              <div>
                <span className="text-xs font-mono font-bold text-[#00FFA3] tracking-wider uppercase">Alpha Engine Simulator</span>
                <h2 className="text-xl md:text-3xl font-display font-bold text-white mt-2">Mô phỏng sức mạnh toán học</h2>
                <p className="text-gray-400 text-xs mt-2 font-sans leading-relaxed">
                  Điều chỉnh các tham số để mô phỏng biểu đồ tăng trường của 30 lệnh tiếp theo và tính Kỳ Vọng Toán Học (EV) thực tế.
                </p>
              </div>

              <div className="space-y-5 border-t border-[#1F2937] pt-5">
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-gray-400 font-medium">Quy mô vốn tài khoản (USD)</span>
                    <span className="text-white font-mono font-semibold">${initialCapital.toLocaleString()}</span>
                  </div>
                  <input 
                    type="range" min="10000" max="300000" step="10000"
                    value={initialCapital} onChange={(e) => setInitialCapital(Number(e.target.value))}
                    className="w-full accent-[#00FFA3] cursor-pointer h-1.5 bg-[#0B0E14] rounded-lg"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-gray-400 font-medium">Tỷ lệ thắng (Win Rate %)</span>
                    <span className="text-[#00FFA3] font-mono font-bold">{winRate}%</span>
                  </div>
                  <input 
                    type="range" min="10" max="90" step="1"
                    value={winRate} onChange={(e) => setWinRate(Number(e.target.value))}
                    className="w-full accent-[#00FFA3] cursor-pointer h-1.5 bg-[#0B0E14] rounded-lg"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-gray-400 font-medium">Tỷ lệ Rủi ro/Lợi nhuận (R:R Ratio)</span>
                    <span className="text-[#00FFA3] font-mono font-bold">1 : {riskReward}</span>
                  </div>
                  <input 
                    type="range" min="0.3" max="5.0" step="0.1"
                    value={riskReward} onChange={(e) => setRiskReward(Number(e.target.value))}
                    className="w-full accent-[#00FFA3] cursor-pointer h-1.5 bg-[#0B0E14] rounded-lg"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-gray-400 font-medium">Rủi ro mỗi lệnh (% tài khoản)</span>
                    <span className="text-[#FF3366] font-mono font-bold">{riskPerTrade}%</span>
                  </div>
                  <input 
                    type="range" min="0.5" max="5.0" step="0.1"
                    value={riskPerTrade} onChange={(e) => setRiskPerTrade(Number(e.target.value))}
                    className="w-full accent-[#FF3366] cursor-pointer h-1.5 bg-[#0B0E14] rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* Right Display Board & Chart */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-6 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#0B0E14] border border-[#1F2937] p-4 rounded-xl text-center">
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest block mb-1">Expectation (EV)</span>
                  <span className={`text-2xl font-mono font-bold font-display ${isPositiveEv ? 'text-[#00FFA3]' : 'text-[#FF3366]'}`}>
                    {ev > 0 ? `+${ev}` : ev}
                  </span>
                </div>
                <div className="bg-[#0B0E14] border border-[#1F2937] p-4 rounded-xl text-center">
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest block mb-1">Trung bình Thắng</span>
                  <span className="text-xl text-white font-mono font-bold">
                    +${(initialCapital * (riskPerTrade / 100) * riskReward).toLocaleString()}
                  </span>
                </div>
                <div className="bg-[#0B0E14] border border-[#1F2937] p-4 rounded-xl text-center">
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest block mb-1">Trung bình Thua</span>
                  <span className="text-xl text-[#FF3366] font-mono font-bold">
                    -${(initialCapital * (riskPerTrade / 100)).toLocaleString()}
                  </span>
                </div>
              </div>

              <div>
                {isPositiveEv ? (
                  <div className="bg-[#00FFA3]/5 border border-[#00FFA3]/20 p-4 rounded-2xl flex items-start space-x-3 text-xs text-[#00FFA3] leading-relaxed">
                    <CheckCircle className="w-5 h-5 shrink-0 text-[#00FFA3]" />
                    <div><strong className="font-bold">✅ HỆ THỐNG CÓ ALPHA:</strong> Kỳ vọng toán học (EV) Dương. Tuy nhiên, vẫn cần chạy kiểm toán WFO để tránh Curve-fitting.</div>
                  </div>
                ) : (
                  <div className="bg-[#FF3366]/5 border border-[#FF3366]/20 p-4 rounded-2xl flex items-start space-x-3 text-xs text-[#FF3366] leading-relaxed">
                    <DangerIcon className="w-5 h-5 shrink-0 text-[#FF3366]" />
                    <div><strong className="font-bold">⚠️ CẢNH BÁO:</strong> Kỳ vọng toán học (EV) đang ÂM. Xác suất cháy quỹ (Risk of Ruin) &gt; 85%. Cần tối ưu đa biến ngay lập tức!</div>
                  </div>
                )}
              </div>

              <div className="bg-[#0B0E14] border border-[#1F2937] p-4 rounded-2xl h-56 flex flex-col justify-between">
                <div className="flex items-center justify-between pointer-events-none mb-1">
                  <span className="text-[10px] font-mono tracking-wider uppercase text-gray-500">Mô phỏng 30 lệnh (OOS)</span>
                  <span className="text-[10px] font-mono font-bold text-[#00FFA3] uppercase">Live Equity Curve</span>
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
                        stroke="#4b5563" fontSize={9} fontStyle="JetBrains Mono" 
                        domain={['dataMin - 1000', 'dataMax + 1000']}
                        tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`}
                        tickLine={false} axisLine={false}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#131722', border: '1px solid #1F2937', borderRadius: '8px' }}
                        labelStyle={{ color: '#9ca3af', fontSize: '10px', fontFamily: 'JetBrains Mono' }}
                        itemStyle={{ color: '#fff', fontSize: '11px', fontFamily: 'JetBrains Mono' }}
                        formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Equity']}
                      />
                      <Area type="monotone" dataKey="equity" stroke={isPositiveEv ? '#00FFA3' : '#FF3366'} strokeWidth={2} fillOpacity={1} fill="url(#colorEquity)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SectionWrapper>

      {/* SOP Section / Workflow */}
      <SectionWrapper id="workflow" className="scroll-mt-20 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Core steps widgets from AI Studio */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-12">
          {[
            { num: "01", title: "Mô tả chiến lược", desc: "Nhập quy tắc vào lệnh (EMA, RSI, PA...) và thông số quản lý vốn trong 5 phút.", icon: Cpu, onClick: scrollToAudit },
            { num: "02", title: "Chạy WFO Kiểm Định", desc: "Hệ thống chia nhỏ dữ liệu quá khứ thành từng nhóm, chạy tối ưu Walk-Forward chống overfitting.", icon: Zap },
            { num: "03", title: "Nhận Báo Cáo PDF", desc: "Báo cáo chi tiết định lượng: Kỳ vọng toán học, Risk of Ruin, khả năng vượt quỹ (Prop Firm).", icon: FileText }
          ].map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.num}
                onClick={step.onClick}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className={`bg-[#131722]/80 backdrop-blur-md border border-[#1F2937] hover:border-[#00FFA3]/40 transition-all duration-300 p-6 rounded-2xl text-left flex flex-col justify-between h-44 group ${step.onClick ? 'cursor-pointer' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <span className="text-3xl font-mono text-[#00FFA3] font-bold opacity-30 group-hover:opacity-100 transition-opacity">{step.num}</span>
                  <Icon className="w-5 h-5 text-[#00FFA3]/80" />
                </div>
                <div>
                  <h3 className="text-white text-base font-bold mb-1">{step.title}</h3>
                  <p className="text-gray-400 text-xs leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </SectionWrapper>

      {/* Dịch vụ Audit Lẻ (Pay-per-Audit) */}
      <SectionWrapper id="pricing-pay-per-audit" className="scroll-mt-20 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10 w-full">
        <h2 className="text-2xl md:text-4xl font-display font-bold text-center text-white mb-4">Dịch vụ Audit Lẻ (Pay-per-Audit)</h2>
        <p className="text-center text-gray-400 mb-10 md:mb-16 max-w-2xl mx-auto">Kiểm định chất lượng chiến lược một lần duy nhất với báo cáo chi tiết.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-[#131722]/80 border border-[#1F2937] rounded-xl p-6 flex flex-col">
            <h3 className="text-lg font-semibold text-gray-300 mb-1">Standard Audit</h3>
            <p className="text-gray-400 text-xs font-medium mb-3">Kiểm tra cơ bản với báo cáo PDF</p>
            <div className="text-2xl font-bold text-white mb-4">1.500.000 VNĐ</div>
            <ul className="space-y-3 mb-6 flex-1">
              <li className="flex items-start"><CheckCircle2 className="h-4 w-4 text-gray-500 mr-2 shrink-0" /><span className="text-xs text-gray-400">Chạy 1 biến số cố định trên hệ thống Strategy Audit</span></li>
              <li className="flex items-start"><CheckCircle2 className="h-4 w-4 text-gray-500 mr-2 shrink-0" /><span className="text-xs text-gray-400">Phân tích Monte Carlo cơ bản</span></li>
              <li className="flex items-start"><CheckCircle2 className="h-4 w-4 text-gray-500 mr-2 shrink-0" /><span className="text-xs text-gray-400">Báo cáo PDF chi tiết về hiệu suất và rủi ro</span></li>
            </ul>
            <button onClick={() => handleSelectPackage('Standard Audit')} className="w-full bg-white/10 text-white font-semibold py-3 rounded-lg hover:bg-white/20 transition-colors text-sm">Chọn gói này</button>
          </div>
          
          <div className="bg-[#131722] border border-[#00FFA3] rounded-xl p-6 transform md:scale-105 shadow-[0_0_30px_rgba(0,255,163,0.15)] relative z-10 flex flex-col">
            <div className="absolute top-0 right-0 bg-[#00FFA3] text-black text-[10px] font-bold px-2 py-1 rounded-bl-lg rounded-tr-xl uppercase tracking-wider">Recommended</div>
            <h3 className="text-lg font-semibold text-white mb-1">Deep Optimization</h3>
            <p className="text-[#00FFA3] text-xs font-medium mb-3">Tối ưu hóa đa biến và xuất cấu hình</p>
            <div className="text-2xl font-bold text-[#00FFA3] mb-4">3.500.000 VNĐ</div>
            <ul className="space-y-3 mb-6 flex-1">
              <li className="flex items-start"><CheckCircle2 className="h-4 w-4 text-[#00FFA3] mr-2 shrink-0" /><span className="text-xs text-gray-300">Bao gồm Standard Audit</span></li>
              <li className="flex items-start"><CheckCircle2 className="h-4 w-4 text-[#00FFA3] mr-2 shrink-0" /><span className="text-xs text-gray-300">Walk-Forward Optimization chuyên sâu</span></li>
              <li className="flex items-start"><CheckCircle2 className="h-4 w-4 text-[#00FFA3] mr-2 shrink-0" /><span className="text-xs text-gray-300">Tối ưu hóa đa biến số</span></li>
              <li className="flex items-start"><CheckCircle2 className="h-4 w-4 text-[#00FFA3] mr-2 shrink-0" /><span className="text-xs text-gray-300">Xuất file cấu hình khuyến nghị (.json)</span></li>
            </ul>
            <button onClick={() => handleSelectPackage('Deep Optimization')} className="w-full bg-[#00FFA3] text-black font-bold py-3 rounded-lg hover:bg-green-400 transition-all text-sm">Chọn gói này</button>
          </div>

          <div className="bg-[#131722]/80 border border-[#F59E0B] rounded-xl p-6 flex flex-col">
            <h3 className="text-lg font-semibold text-[#F59E0B] mb-1">Stress Test Elite</h3>
            <p className="text-[#F59E0B]/80 text-xs font-medium mb-3">Thử thách Thiên nga đen</p>
            <div className="text-2xl font-bold text-white mb-4">5.500.000 VNĐ</div>
            <ul className="space-y-3 mb-6 flex-1">
              <li className="flex items-start"><CheckCircle2 className="h-4 w-4 text-gray-500 mr-2 shrink-0" /><span className="text-xs text-gray-400">Bao gồm Deep Optimization</span></li>
              <li className="flex items-start"><CheckCircle2 className="h-4 w-4 text-gray-500 mr-2 shrink-0" /><span className="text-xs text-gray-400">Stress test đa kịch bản</span></li>
              <li className="flex items-start"><CheckCircle2 className="h-4 w-4 text-gray-500 mr-2 shrink-0" /><span className="text-xs text-gray-400">Phân tích tương quan danh mục</span></li>
              <li className="flex items-start"><CheckCircle2 className="h-4 w-4 text-gray-500 mr-2 shrink-0" /><span className="text-xs text-gray-400">Đánh giá độ bền vững dài hạn</span></li>
            </ul>
            <button onClick={() => handleSelectPackage('Stress Test Elite')} className="w-full bg-[#F59E0B]/10 text-[#F59E0B] font-semibold py-3 rounded-lg hover:bg-[#F59E0B]/20 border border-[#F59E0B]/30 transition-all text-sm">Chọn gói này</button>
          </div>
        </div>
      </SectionWrapper>

      {/* Dịch vụ Thuê bao (Subscription) */}
      <SectionWrapper id="pricing-subscription" className="scroll-mt-20 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10 w-full">
        <h2 className="text-2xl md:text-4xl font-display font-bold text-center text-white mb-4">Các Gói Thuê Bao (Subscription)</h2>
        <p className="text-center text-gray-400 mb-10 md:mb-16 max-w-2xl mx-auto">Tối ưu hóa liên tục, đồng hành dài hạn cùng chiến lược của bạn.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-[#131722]/80 border border-[#1F2937] rounded-xl p-6 flex flex-col">
            <h3 className="text-lg font-semibold text-gray-300 mb-1">Gói Explorer</h3>
            <p className="text-gray-400 text-xs font-medium mb-3">Phù hợp cho trader cá nhân muốn kiểm tra sức khỏe hệ thống</p>
            <div className="text-2xl font-bold text-white mb-4">2.500.000 VNĐ<span className="text-xs text-gray-500 font-normal">/tháng</span></div>
            <ul className="space-y-3 mb-6 flex-1">
              <li className="flex items-start"><CheckCircle2 className="h-4 w-4 text-gray-500 mr-2 shrink-0" /><span className="text-xs text-gray-400">3 lần Standard Audit mỗi tháng</span></li>
              <li className="flex items-start"><CheckCircle2 className="h-4 w-4 text-gray-500 mr-2 shrink-0" /><span className="text-xs text-gray-400">Kiểm tra nhiều ý tưởng giao dịch</span></li>
            </ul>
            <button onClick={() => handleSelectPackage('Gói Explorer')} className="w-full bg-white/10 text-white font-semibold py-3 rounded-lg hover:bg-white/20 transition-colors text-sm">Đăng Ký Khám Phá</button>
          </div>
          
          <div className="bg-[#131722] border border-[#00FFA3] rounded-xl p-6 transform md:scale-105 shadow-[0_0_30px_rgba(0,255,163,0.15)] relative z-10 flex flex-col">
            <div className="absolute top-0 right-0 bg-[#00FFA3] text-black text-[10px] font-bold px-2 py-1 rounded-bl-lg rounded-tr-xl uppercase tracking-wider">Premium</div>
            <h3 className="text-lg font-semibold text-white mb-1">Gói Pro Trader</h3>
            <p className="text-[#00FFA3] text-xs font-medium mb-3">Gói chủ lực cho trader thi quỹ và tối ưu hóa liên tục</p>
            <div className="text-2xl font-bold text-[#00FFA3] mb-4">5.500.000 VNĐ<span className="text-xs text-gray-400 font-normal">/tháng</span></div>
            <ul className="space-y-3 mb-6 flex-1">
              <li className="flex items-start"><CheckCircle2 className="h-4 w-4 text-[#00FFA3] mr-2 shrink-0" /><span className="text-xs text-gray-300">2 lần Deep Optimization mỗi tháng</span></li>
              <li className="flex items-start"><CheckCircle2 className="h-4 w-4 text-[#00FFA3] mr-2 shrink-0" /><span className="text-xs text-gray-300">1 lần Stress Test Elite mỗi tháng</span></li>
              <li className="flex items-start"><CheckCircle2 className="h-4 w-4 text-[#00FFA3] mr-2 shrink-0" /><span className="text-xs text-gray-300">Ưu tiên slot máy chủ</span></li>
            </ul>
            <button onClick={() => handleSelectPackage('Gói Pro Trader')} className="w-full bg-[#00FFA3] text-black font-bold py-3 rounded-lg hover:bg-green-400 transition-all text-sm">Nâng Cấp Pro</button>
          </div>

          <div className="bg-[#131722]/80 border border-[#1F2937] rounded-xl p-6 flex flex-col">
            <h3 className="text-lg font-semibold text-gray-300 mb-1">Gói Prop Firm Hunter</h3>
            <p className="text-[#F59E0B] text-xs font-medium mb-3">Dành cho người chinh phục nhiều quỹ</p>
            <div className="text-2xl font-bold text-white mb-4">12.000.000 VNĐ<span className="text-xs text-gray-500 font-normal">/tháng</span></div>
            <ul className="space-y-3 mb-6 flex-1">
              <li className="flex items-start"><CheckCircle2 className="h-4 w-4 text-gray-500 mr-2 shrink-0" /><span className="text-xs text-gray-400">Tối ưu hóa không giới hạn (trong slot)</span></li>
              <li className="flex items-start"><CheckCircle2 className="h-4 w-4 text-gray-500 mr-2 shrink-0" /><span className="text-xs text-gray-400">Hỗ trợ chuyển đổi logic sang Python</span></li>
              <li className="flex items-start"><CheckCircle2 className="h-4 w-4 text-gray-500 mr-2 shrink-0" /><span className="text-xs text-gray-400">Vận hành hệ thống phức tạp</span></li>
            </ul>
            <button onClick={() => handleSelectPackage('Gói Prop Firm Hunter')} className="w-full bg-[#F59E0B]/10 text-[#F59E0B] font-semibold py-3 rounded-lg hover:bg-[#F59E0B]/20 border border-[#F59E0B]/30 transition-all text-sm">Trở thành Thợ Săn</button>
          </div>
        </div>

        {/* Tùy chọn Nâng cao (Add-ons) */}
        <h2 className="text-2xl md:text-3xl font-display font-bold text-center text-white mb-4 mt-16">Các Tùy Chọn Nâng Cao (Add-ons)</h2>
        <p className="text-center text-gray-400 mb-10 md:mb-12 max-w-2xl mx-auto">Mua kèm tính năng phân tích chuyên sâu cho bất kỳ gói Audit nào.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          <div className="bg-[#131722]/80 border border-[#2A2E39] rounded-xl p-4 flex flex-col justify-center items-center text-center">
            <h4 className="text-gray-300 font-bold mb-2 text-sm">Multi-variant Optimization</h4>
            <div className="text-[#00FFA3] font-bold text-base">+500.000 VNĐ</div>
          </div>
          <div className="bg-[#131722]/80 border border-[#2A2E39] rounded-xl p-4 flex flex-col justify-center items-center text-center">
            <h4 className="text-gray-300 font-bold mb-2 text-sm">Express Audit (Ưu tiên xử lý)</h4>
            <div className="text-[#00FFA3] font-bold text-base">+500.000 VNĐ</div>
          </div>
          <div className="bg-[#131722]/80 border border-[#2A2E39] rounded-xl p-4 flex flex-col justify-center items-center text-center">
            <h4 className="text-gray-300 font-bold mb-2 text-sm">Multi-symbol Analysis</h4>
            <div className="text-[#00FFA3] font-bold text-base">+1.000.000 VNĐ</div>
          </div>
          <div className="bg-[#131722]/80 border border-[#2A2E39] rounded-xl p-4 flex flex-col justify-center items-center text-center">
            <h4 className="text-gray-300 font-bold mb-2 text-sm">Export Code (EA/Python)</h4>
            <div className="text-[#00FFA3] font-bold text-base">+2.000.000 VNĐ</div>
          </div>
        </div>
      </SectionWrapper>

      {/* Intake Form Wrapper */}
      <SectionWrapper id="audit-form" className="scroll-mt-20 px-4 sm:px-6 lg:px-8 relative z-20">
        <div className="max-w-4xl mx-auto bg-[#131722] border border-[#1F2937] rounded-2xl shadow-2xl p-6 md:p-10 mb-20 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#00FFA3] to-[#FF3366]"></div>
          <IntakeWizard selectedPackage={selectedPackage} />
        </div>
      </SectionWrapper>
    </div>
  );
};

export default LandingPage;
