import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { CheckCircle2, FileCog, Cpu, FileBarChart, TriangleAlert } from 'lucide-react';
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

const RiskCalculator = () => {
  const [winrate, setWinrate] = useState(40);
  const [rr, setRr] = useState(1.5);
  
  // EV Formula: EV = (Winrate / 100 * RR_Ratio) - ((1 - (Winrate / 100)) * 1)
  const ev = (winrate / 100 * rr) - ((1 - (winrate / 100)) * 1);
  const isPositive = ev > 0.1;
  
  return (
    <div className="max-w-4xl mx-auto bg-[#131722]/80 backdrop-blur-md border border-white/10 rounded-2xl p-6 md:p-12 shadow-2xl relative z-10">
      <h2 className="text-2xl md:text-3xl font-bold text-center text-white mb-8 md:mb-10">Chiến lược của bạn có sinh tồn được không?</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mb-8 md:mb-10">
        <div>
          <label className="block text-gray-400 mb-2 font-medium">Tỷ lệ Thắng (Winrate %): <span className="text-white">{winrate}%</span></label>
          <input type="range" min="10" max="90" value={winrate} onChange={(e) => setWinrate(parseInt(e.target.value))} className="w-full accent-[#00FFA3]" />
        </div>
        <div>
          <label className="block text-gray-400 mb-2 font-medium">Tỷ lệ Rủi ro/Lợi nhuận (R:R): <span className="text-white">{rr}</span></label>
          <input type="range" min="0.5" max="5" step="0.1" value={rr} onChange={(e) => setRr(parseFloat(e.target.value))} className="w-full accent-[#00FFA3]" />
        </div>
      </div>
      
      <motion.div 
        key={`${winrate}-${rr}`}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={
          isPositive 
            ? "bg-[#00FFA3]/10 border border-[#00FFA3]/50 rounded-xl p-5 md:p-6 text-center shadow-[0_0_20px_rgba(0,255,163,0.15)]"
            : "bg-[#FF3366]/10 border border-[#FF3366]/50 rounded-xl p-5 md:p-6 text-center shadow-[0_0_20px_rgba(255,51,102,0.15)]"
        }
      >
        <p className={
          isPositive
            ? "text-[#00FFA3] font-bold text-base md:text-xl text-left md:text-center"
            : "text-[#FF3366] font-bold text-base md:text-xl text-left md:text-center"
        }>
          {isPositive 
            ? "✅ HỆ THỐNG CÓ ALPHA: Kỳ vọng toán học (EV) Dương. Tuy nhiên, để đảm bảo đây không phải là ảo giác của bẫy Khớp Đường Cong (Curve-fitting), bạn vẫn cần chạy kiểm toán WFO."
            : "⚠️ CẢNH BÁO: Kỳ vọng toán học (EV) đang ÂM. Xác suất cháy quỹ (Risk of Ruin) > 85%. Hệ thống của bạn sẽ sụp đổ, cần tối ưu đa biến ngay lập tức!"
          }
        </p>
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
  const { t, i18n } = useTranslation();
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

  const handleSelectPackage = (pkgName: string) => {
    setSelectedPackage(pkgName);
    document.getElementById('audit-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const renderHeroTitle = () => {
    if (i18n.language === 'en') {
      const parts = t('hero.title').split('SYSTEM OPTIMIZATION');
      return (
        <span className="text-white">
          {parts[0]}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00FFA3] to-[#F59E0B] drop-shadow-[0_0_8px_rgba(0,255,163,0.5)]">SYSTEM OPTIMIZATION</span>
          {parts[1] || ''}
        </span>
      );
    } else if (i18n.language === 'zh') {
      const parts = t('hero.title').split('系统优化');
      return (
        <span className="text-white">
          {parts[0]}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00FFA3] to-[#F59E0B] drop-shadow-[0_0_8px_rgba(0,255,163,0.5)]">系统优化</span>
          {parts[1] || ''}
        </span>
      );
    } else {
      const parts = t('hero.title').split('TỐI ƯU HỆ THỐNG');
      return (
        <span className="text-white">
          {parts[0]}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00FFA3] to-[#F59E0B] drop-shadow-[0_0_8px_rgba(0,255,163,0.5)]">TỐI ƯU HỆ THỐNG</span>
          {parts[1] || ''}
        </span>
      );
    }
  };

  return (
    <div 
      className="flex flex-col min-h-screen relative bg-fixed bg-cover bg-center overflow-x-hidden"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1639322537228-f710d846310a?q=80&w=2000&auto=format&fit=crop')" }}
    >
      {/* Dark Overlay for readability */}
      <div className="absolute inset-0 bg-[#0B0E14]/85 z-0 pointer-events-none"></div>
      
      {/* Scarcity Banner */}
      <div className="sticky top-16 z-40 w-full bg-[#FF3366]/10 border-b border-[#FF3366]/30 py-2 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-center text-xs md:text-sm font-medium text-white text-center">
          <span className="mr-2">⚠️</span>
          <span>Năng lực máy chủ giới hạn: Xử lý tối đa 50 chiến lược/tuần. Còn trống: 07 slots.</span>
          <motion.div animate={{opacity: [1, 0]}} transition={{repeat: Infinity, duration: 1}} className="w-2 h-2 rounded-full bg-[#FF3366] ml-2 md:ml-3 shrink-0"></motion.div>
        </div>
      </div>

      {/* Hero Section */}
      <SectionWrapper id="home" className="scroll-mt-20 relative pt-16 md:pt-24 pb-12 md:pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center z-10">
        <div className="flex flex-col text-left">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4 md:mb-6 leading-tight">
            {renderHeroTitle()}
          </h1>
          <p className="mt-2 md:mt-4 text-lg md:text-xl text-gray-400 mb-8 md:mb-10 max-w-2xl">
            {t('hero.subtitle')}
          </p>
          <div>
            <button 
              type="button"
              onClick={() => document.getElementById('audit-form')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-block bg-[#00FFA3] text-black font-bold text-base md:text-lg py-3 md:py-4 px-8 md:px-10 rounded-lg shadow-[0_0_30px_rgba(0,255,163,0.6)] transform hover:scale-105 hover:bg-green-400 transition-all duration-300 text-center w-full sm:w-auto"
            >
              BẮT ĐẦU KIỂM TOÁN TÀI KHOẢN CỦA BẠN
            </button>
          </div>
        </div>

        <div>
          <HolographicDashboard />
        </div>
      </SectionWrapper>

      {/* Interactive Hook */}
      <SectionWrapper id="risk" className="py-12 md:py-24 px-4 sm:px-6 lg:px-8 relative z-10">
        <RiskCalculator />
      </SectionWrapper>

      {/* SOP Section */}
      <SectionWrapper id="workflow" className="scroll-mt-20 py-12 md:py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h3 className="text-xs md:text-sm uppercase text-gray-500 tracking-wider font-bold mb-2 md:mb-3">USER JOURNEY</h3>
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-3 md:mb-4">Hành trình tối ưu hóa chiến lược</h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-sm md:text-base">
              Mọi ý tưởng giao dịch cảm tính của bạn sẽ được chuyển đổi thành các quy tắc toán học minh bạch và chạy tự động thông qua 3 bước chuẩn hóa.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {[
              { icon: <FileCog size={56} color="#F59E0B" className="drop-shadow-[0_0_15px_rgba(245,158,11,0.5)] md:w-16 md:h-16" />, title: "Bước 1: Kiểm toán", subtitle: "Nhập liệu & Form Intake" },
              { icon: <Cpu size={56} color="#00FFA3" className="drop-shadow-[0_0_15px_rgba(0,255,163,0.5)] md:w-16 md:h-16" />, title: "Bước 2: Ép xung dữ liệu", subtitle: "WFO Optimization" },
              { icon: <FileBarChart size={56} color="#E2E8F0" className="drop-shadow-[0_0_15px_rgba(226,232,240,0.5)] md:w-16 md:h-16" />, title: "Bước 3: Nhận bàn giao", subtitle: "Báo cáo & Cấu hình" }
            ].map((step, idx) => (
              <div 
                key={idx}
                className="bg-[#131722]/80 backdrop-blur-md border border-[#2A2E39] rounded-xl p-8 md:p-10 hover:border-[#00FFA3]/50 transition-all duration-300 relative overflow-hidden flex flex-col items-center text-center shadow-lg"
              >
                <div className="mb-6 md:mb-8 mt-4">{step.icon}</div>
                <h3 className="text-lg md:text-xl font-bold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-gray-400">{step.subtitle}</p>
              </div>
            ))}
          </div>
        </div>
      </SectionWrapper>

      {/* Social Proof (Before & After Visual Story) */}
      <SectionWrapper id="cases" className="py-12 md:py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto relative z-10 w-full">
        <h2 className="text-2xl md:text-4xl font-bold text-center text-white mb-10 md:mb-16">Trước & Sau Kiểm Toán</h2>
        
        {/* Visual Timeline */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-16 relative">
          {/* Connecting Line (Desktop only) */}
          <div className="hidden md:block absolute top-1/2 left-[10%] right-[10%] h-1 bg-gradient-to-r from-[#FF3366] via-gray-600 to-[#00FFA3] -translate-y-1/2 z-0"></div>
          
          <div className="flex flex-col items-center text-center relative z-10 bg-[#0B0E14] px-4 py-6 md:p-4 mb-8 md:mb-0 w-full md:w-1/3">
            <div className="w-16 h-16 rounded-full bg-[#FF3366]/20 border-2 border-[#FF3366] flex items-center justify-center mb-4">
              <span className="text-2xl">🤔</span>
            </div>
            <h4 className="text-[#FF3366] font-bold text-lg">Chiến lược cũ</h4>
            <p className="text-gray-400 text-sm mt-2">(Mơ hồ, cảm tính, dễ cháy)</p>
          </div>
          
          <div className="flex flex-col items-center text-center relative z-10 bg-[#0B0E14] px-4 py-6 md:p-4 mb-8 md:mb-0 w-full md:w-1/3">
            <div className="w-16 h-16 rounded-full bg-[#F59E0B]/20 border-2 border-[#F59E0B] flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(245,158,11,0.5)]">
              <FileCog className="text-[#F59E0B] w-8 h-8" />
            </div>
            <h4 className="text-[#F59E0B] font-bold text-lg">Quant Audit</h4>
            <p className="text-gray-400 text-sm mt-2">(Minh bạch, toán học hóa)</p>
          </div>

          <div className="flex flex-col items-center text-center relative z-10 bg-[#0B0E14] px-4 py-6 md:p-4 w-full md:w-1/3">
            <div className="w-16 h-16 rounded-full bg-[#00FFA3]/20 border-2 border-[#00FFA3] flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(0,255,163,0.5)]">
              <span className="text-2xl">🚀</span>
            </div>
            <h4 className="text-[#00FFA3] font-bold text-lg">Hệ thống tối ưu</h4>
            <p className="text-gray-400 text-sm mt-2">(Lợi nhuận bền vững)</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {/* Before */}
          <div className="bg-[#131722]/80 backdrop-blur-md border border-[#FF3366]/30 rounded-2xl p-6 md:p-8 flex flex-col items-center justify-center relative overflow-hidden group hover:border-[#FF3366] transition-all">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#FF3366]"></div>
            <h3 className="text-gray-400 text-base md:text-lg font-medium mb-4 md:mb-6">Trước Tối Ưu (Before)</h3>
            <div className="text-3xl md:text-4xl font-bold text-[#FF3366] mb-4">Max Drawdown: 15.4%</div>
            <div className="bg-[#FF3366]/20 border border-[#FF3366] text-[#FF3366] font-bold py-2 px-6 rounded-full text-xs md:text-sm uppercase tracking-wider">
              Trượt Quỹ
            </div>
          </div>

          {/* After */}
          <div className="bg-[#131722]/80 backdrop-blur-md border border-[#00FFA3]/30 rounded-2xl p-6 md:p-8 flex flex-col items-center justify-center relative overflow-hidden group hover:border-[#00FFA3] transition-all">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#00FFA3]"></div>
            <h3 className="text-gray-400 text-base md:text-lg font-medium mb-4 md:mb-6">Sau Khi Chạy WFO (After)</h3>
            <div className="text-3xl md:text-4xl font-bold text-[#00FFA3] mb-4 drop-shadow-[0_0_10px_rgba(0,255,163,0.5)]">Max Drawdown: 3.2%</div>
            <div className="bg-[#00FFA3]/20 border border-[#00FFA3] text-[#00FFA3] font-bold py-2 px-6 rounded-full text-xs md:text-sm uppercase tracking-wider">
              Pass Quỹ 100k
            </div>
          </div>
        </div>
      </SectionWrapper>

      {/* Pricing Section */}
      <SectionWrapper id="pricing" className="scroll-mt-20 py-12 md:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10 w-full">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-white mb-10 md:mb-16">Bảng Giá Dịch Vụ</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16 md:mb-24">
          {/* Tier 1 - Highlighted */}
          <div className="bg-[#131722]/80 backdrop-blur-md border border-[#00FFA3] rounded-xl p-6 md:p-8 transform md:scale-105 shadow-[0_0_30px_rgba(0,255,163,0.3)] relative z-10 flex flex-col">
            <div className="absolute top-0 right-0 bg-[#00FFA3] text-black text-[10px] md:text-xs font-bold px-2 md:px-3 py-1 rounded-bl-lg rounded-tr-xl uppercase tracking-wider">Popular</div>
            <h3 className="text-lg md:text-xl font-semibold text-white mb-1">{t('pricing.tier1').split('(')[0]}</h3>
            <p className="text-[#00FFA3] text-xs md:text-sm font-medium mb-3">Dành cho người muốn kiểm tra sức khỏe hệ thống</p>
            <div className="text-2xl md:text-3xl font-bold text-[#00FFA3] mb-4 md:mb-6">1.500.000 VNĐ<span className="text-xs md:text-sm text-gray-400 font-normal">/tháng</span></div>
            <ul className="space-y-3 md:space-y-4 mb-6 md:mb-8 flex-1">
              <li className="flex items-start"><CheckCircle2 className="h-5 w-5 text-[#00FFA3] mr-2 shrink-0" /><span className="text-xs md:text-sm text-gray-300">Basic Walk-Forward</span></li>
              <li className="flex items-start"><CheckCircle2 className="h-5 w-5 text-[#00FFA3] mr-2 shrink-0" /><span className="text-xs md:text-sm text-gray-300">Monthly PDF Report</span></li>
            </ul>
            <button type="button" onClick={() => handleSelectPackage('Gói Trải Nghiệm')} className="w-full bg-[#00FFA3] text-black font-bold py-3 rounded-lg hover:bg-green-400 shadow-[0_0_15px_rgba(0,255,163,0.3)] transition-all text-sm md:text-base">Bắt đầu ngay</button>
          </div>
          
          {/* Tier 2 */}
          <div className="bg-[#131722]/80 backdrop-blur-md border border-[#2A2E39] rounded-xl p-6 md:p-8 flex flex-col">
            <h3 className="text-lg md:text-xl font-semibold text-gray-300 mb-3 md:mb-4">{t('pricing.tier2').split('(')[0]}</h3>
            <div className="text-2xl md:text-3xl font-bold text-white mb-4 md:mb-6">4.000.000 VNĐ<span className="text-xs md:text-sm text-gray-500 font-normal">/tháng</span></div>
            <ul className="space-y-3 md:space-y-4 mb-6 md:mb-8 flex-1">
              <li className="flex items-start"><CheckCircle2 className="h-5 w-5 text-gray-500 mr-2 shrink-0" /><span className="text-xs md:text-sm text-gray-400">Advanced Walk-Forward</span></li>
              <li className="flex items-start"><CheckCircle2 className="h-5 w-5 text-gray-500 mr-2 shrink-0" /><span className="text-xs md:text-sm text-gray-400">Weekly Re-optimization</span></li>
            </ul>
            <button type="button" onClick={() => handleSelectPackage('Gói Nâng Cao')} className="w-full bg-white/10 text-white font-semibold py-3 rounded-lg hover:bg-white/20 transition-colors text-sm md:text-base">Khởi tạo hệ thống</button>
          </div>

          {/* Tier 3 */}
          <div className="bg-[#131722]/80 backdrop-blur-md border border-[#2A2E39] rounded-xl p-6 md:p-8 flex flex-col">
            <h3 className="text-lg md:text-xl font-semibold text-gray-300 mb-1">{t('pricing.tier3').split('(')[0]}</h3>
            <p className="text-[#F59E0B] text-xs md:text-sm font-medium mb-3">Dành cho người muốn chinh phục Prop Firm</p>
            <div className="text-2xl md:text-3xl font-bold text-white mb-4 md:mb-6">9.000.000 VNĐ<span className="text-xs md:text-sm text-gray-500 font-normal">/tháng</span></div>
            <ul className="space-y-3 md:space-y-4 mb-6 md:mb-8 flex-1">
              <li className="flex items-start"><CheckCircle2 className="h-5 w-5 text-gray-500 mr-2 shrink-0" /><span className="text-xs md:text-sm text-gray-400">Custom Scripting</span></li>
              <li className="flex items-start"><CheckCircle2 className="h-5 w-5 text-gray-500 mr-2 shrink-0" /><span className="text-xs md:text-sm text-gray-400">One-off Analysis</span></li>
            </ul>
            <button type="button" onClick={() => handleSelectPackage('Gói Chuyên Nghiệp')} className="w-full bg-[#F59E0B]/20 text-[#F59E0B] font-semibold py-3 rounded-lg hover:bg-[#F59E0B]/30 border border-[#F59E0B]/50 shadow-[0_0_15px_rgba(245,158,11,0.5)] animate-pulse transition-all text-sm md:text-base">Trở thành đối tác</button>
          </div>

          {/* Tier 4 */}
          <div className="bg-[#131722]/80 backdrop-blur-md border border-[#D4AF37]/60 rounded-xl p-6 md:p-8 flex flex-col relative overflow-hidden shadow-[0_0_20px_rgba(212,175,55,0.15)]">
            <div className="absolute top-0 right-0 bg-gradient-to-r from-[#D4AF37] to-[#F59E0B] text-black text-[10px] md:text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-xl uppercase tracking-wider">Limited Access</div>
            <h3 className="text-lg md:text-xl font-semibold text-[#D4AF37] mb-3 md:mb-4">{t('pricing.tier4').split('(')[0]}</h3>
            <div className="text-2xl md:text-3xl font-bold text-[#D4AF37] mb-4 md:mb-6">96.000.000 VNĐ<span className="text-xs md:text-sm text-gray-500 font-normal">/năm</span></div>
            <ul className="space-y-3 md:space-y-4 mb-6 md:mb-8 flex-1">
              <li className="flex items-start"><CheckCircle2 className="h-5 w-5 text-[#D4AF37] mr-2 shrink-0" /><span className="text-xs md:text-sm text-gray-300 font-medium">Cố vấn ưu tiên</span></li>
              <li className="flex items-start"><CheckCircle2 className="h-5 w-5 text-[#D4AF37] mr-2 shrink-0" /><span className="text-xs md:text-sm text-gray-300 font-medium">Phân tích rủi ro định chế</span></li>
              <li className="flex items-start"><CheckCircle2 className="h-5 w-5 text-[#D4AF37] mr-2 shrink-0" /><span className="text-xs md:text-sm text-gray-300 font-medium">Hỗ trợ chiến lược 1-1</span></li>
            </ul>
            <button type="button" onClick={() => handleSelectPackage('Đặc Quyền')} className="w-full bg-transparent text-[#D4AF37] border border-[#D4AF37] font-semibold py-3 rounded-lg hover:bg-[#D4AF37]/10 transition-colors text-sm md:text-base">Yêu cầu tư vấn đặc quyền</button>
          </div>
        </div>

        {/* Brutal Honesty Disclaimer */}
        <div className="max-w-4xl mx-auto bg-[#131722]/90 backdrop-blur-xl border-2 border-[#FF3366] rounded-2xl p-6 md:p-10 shadow-[0_0_50px_rgba(255,51,102,0.15)] relative overflow-hidden">
          <div className="absolute -right-5 -top-5 md:-right-10 md:-top-10 text-[#FF3366]/5 opacity-20">
            <TriangleAlert className="w-32 h-32 md:w-48 md:h-48" />
          </div>
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 relative z-10 text-center md:text-left">
            <div className="bg-[#FF3366]/20 p-4 md:p-5 rounded-full shrink-0">
              <TriangleAlert className="h-10 w-10 md:h-12 md:w-12 text-[#FF3366]" />
            </div>
            <div>
              <h2 className="text-xl md:text-3xl font-black text-white mb-3 md:mb-4 tracking-wide uppercase">SỰ THẬT PHŨ PHÀNG TỪ STRATEGY AUDIT</h2>
              <p className="text-gray-300 text-sm md:text-lg leading-relaxed">
                Nếu chiến lược của bạn chạy qua WFO mà hệ số Walk-Forward Efficiency (WFE) &lt; 0.5, hệ thống của bạn là <span className="font-bold text-[#FF3366]">RÁC</span> và không có Alpha. Chúng tôi sẽ từ chối cung cấp dịch vụ và hoàn trả 100% chi phí. Chúng tôi bán sự thật, không bán ảo vọng.
              </p>
            </div>
          </div>
        </div>
      </SectionWrapper>

      {/* Audit Intake Form Section */}
      <SectionWrapper id="audit-form" className="scroll-mt-20 relative z-10 w-full">
        <IntakeWizard selectedPackage={selectedPackage} />
      </SectionWrapper>

    </div>
  );
};

export default LandingPage;
