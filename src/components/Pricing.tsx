/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Check, Sparkles, MessageCircle, Zap, ShieldAlert, Cpu } from 'lucide-react';

interface PricingProps {
  setActiveTab: (tab: string) => void;
}

export default function Pricing({ setActiveTab }: PricingProps) {
  // 1. Pay-per-Audit
  const auditPlans = [
    {
      id: 'standard',
      name: 'Standard Audit',
      price: '1,500,000đ',
      period: 'một lần',
      desc: 'Phân tích cơ bản với báo cáo PDF chi tiết về hiệu suất và rủi ro.',
      features: [
        'Chạy 1 biến số cố định trên hệ thống Strategy Audit',
        'Phân tích Monte Carlo cơ bản',
        'Báo cáo PDF chi tiết về hiệu suất và rủi ro'
      ],
      isPopular: false,
      ctaText: 'Chọn Gói Này',
      color: 'border-[#1F2937] hover:border-gray-500'
    },
    {
      id: 'deep-opt',
      name: 'Deep Optimization',
      price: '3,500,000đ',
      period: 'một lần',
      desc: 'Tối ưu hóa đa biến và xuất cấu hình khuyến nghị.',
      features: [
        'Bao gồm mọi thứ của Standard Audit',
        'Walk-Forward Optimization (WFO) chuyên sâu',
        'Tối ưu hóa đa biến số',
        'Xuất file cấu hình khuyến nghị (.json)'
      ],
      isPopular: true,
      ctaText: 'Lựa Chọn Phổ Biến',
      color: 'border-neon-green/30 hover:border-neon-green/80 shadow-[0_0_20px_rgba(0,255,163,0.05)]'
    },
    {
      id: 'stress-test',
      name: 'Stress Test Elite',
      price: '5,500,000đ',
      period: 'một lần',
      desc: 'Thử thách Thiên nga đen và đánh giá độ bền vững dài hạn.',
      features: [
        'Bao gồm mọi thứ của Deep Optimization',
        'Stress test đa kịch bản (Thiên nga đen)',
        'Phân tích tương quan danh mục',
        'Đánh giá độ bền vững của chiến lược'
      ],
      isPopular: false,
      ctaText: 'Chọn Gói Này',
      color: 'border-coral-red/30 hover:border-coral-red/60'
    }
  ];

  // 2. Subscription
  const subPlans = [
    {
      id: 'explorer',
      name: 'Gói Explorer',
      price: '2,500,000đ',
      period: 'mỗi tháng',
      desc: 'Phù hợp trader cá nhân muốn kiểm tra nhiều ý tưởng giao dịch.',
      features: [
        '3 lần Standard Audit mỗi tháng',
        'Kiểm tra sức khỏe hệ thống liên tục'
      ],
      isPopular: false,
      ctaText: 'Đăng ký Explorer',
      color: 'border-[#1F2937] hover:border-gray-500'
    },
    {
      id: 'pro-trader',
      name: 'Gói Pro Trader',
      price: '5,500,000đ',
      period: 'mỗi tháng',
      desc: 'Gói chủ lực cho trader thi quỹ và tối ưu hóa liên tục.',
      features: [
        '2 lần Deep Optimization mỗi tháng',
        '1 lần Stress Test Elite mỗi tháng',
        'Ưu tiên slot máy chủ phân tích'
      ],
      isPopular: true,
      ctaText: 'Nâng Cấp Pro',
      color: 'border-neon-green/30 hover:border-neon-green/80 shadow-[0_0_20px_rgba(0,255,163,0.05)]'
    },
    {
      id: 'prop-hunter',
      name: 'Gói Prop Firm Hunter',
      price: '9,000,000đ',
      period: 'mỗi tháng',
      desc: 'Dành cho những người muốn chinh phục nhiều quỹ hoặc vận hành hệ thống phức tạp.',
      features: [
        'Tối ưu hóa không giới hạn (trong hạn mức slot)',
        'Hỗ trợ chuyển đổi logic sang Code Python thực tế',
        'Hỗ trợ chiến lược 1-1 với chuyên gia'
      ],
      isPopular: false,
      ctaText: 'Trở thành Thợ Săn',
      color: 'border-[#F59E0B]/30 hover:border-[#F59E0B]/80 shadow-[0_0_20px_rgba(245,158,11,0.05)]'
    }
  ];

  // 3. Add-ons
  const addons = [
    { name: 'Multi-variant Optimization', price: '+500,000đ', icon: <Cpu className="w-5 h-5 text-neon-green" /> },
    { name: 'Express Audit (Xử lý 12-24h)', price: '+500,000đ', icon: <Zap className="w-5 h-5 text-neon-green" /> },
    { name: 'Multi-symbol Analysis', price: '+1,000,000đ', icon: <ShieldAlert className="w-5 h-5 text-neon-green" /> },
    { name: 'Export Code (EA/Python)', price: '+2,000,000đ', icon: <Sparkles className="w-5 h-5 text-neon-green" /> }
  ];

  return (
    <div id="pricing-view" className="space-y-14 pb-20 pt-6">
      
      {/* HEADER */}
      <section className="text-center max-w-4xl mx-auto px-4">
        <span className="text-xs uppercase tracking-widest font-mono text-neon-green font-bold bg-neon-green/10 px-3 py-1 rounded">Bảng Phí & Gói Dịch Vụ</span>
        <h1 className="text-3xl md:text-5xl font-display font-bold mt-4 text-white">Minh bạch giữa Thành viên & Dịch vụ riêng</h1>
        <p className="text-gray-400 text-sm mt-3.5 leading-relaxed max-w-2xl mx-auto">
          Strategy Audit có 2 hình thức riêng biệt: <strong>(1) Gói Thành viên Cộng đồng</strong> để học tập và truy cập toàn bộ Thư viện VIP 300+, hoặc <strong>(2) Dịch vụ Kiểm định Độc lập Riêng tư</strong> dành cho quỹ và nhà phát triển phương pháp riêng.
        </p>
      </section>

      {/* TRACK 1: COMMUNITY MEMBERSHIP (MAIN FOCUS) */}
      <section className="mx-auto max-w-6xl px-4">
        <div className="relative overflow-hidden rounded-3xl border-2 border-neon-green/40 bg-gradient-to-br from-neon-green/15 via-[#131722] to-[#0B0E14] p-8 md:p-10 shadow-[0_0_30px_rgba(0,255,163,0.1)]">
          <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-neon-green/20 px-3 py-1 text-xs font-bold text-neon-green">
                <Sparkles className="h-3.5 w-3.5" /> GÓI CHÍNH THỨC CỘNG ĐỒNG
              </div>
              <h2 className="mt-3 text-2xl md:text-3xl font-display font-bold text-white">Thành Viên Strategy Audit</h2>
              <p className="mt-2 text-base font-semibold text-neon-green">
                $50 USD tháng đầu tiên · $100 USD/tháng từ tháng thứ hai
              </p>
              <p className="mt-3 text-sm leading-relaxed text-gray-300 max-w-2xl">
                Truy cập toàn bộ 300+ báo cáo kiểm định chuyên sâu trong Thư viện VIP, tham gia nhóm trao đổi riêng tư cùng Leon và cộng đồng, thảo luận các ca kiểm định thực tế hàng tuần. Thanh toán chuyển khoản trực tiếp, xác nhận thủ công, không tự động trừ tiền.
              </p>
            </div>
            <button 
              onClick={() => setActiveTab('membership')} 
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-neon-green px-8 py-4 font-bold text-black hover:scale-[1.02] shadow-[0_0_20px_rgba(0,255,163,0.3)] transition-transform shrink-0"
            >
              Xem chi tiết gói Thành viên <MessageCircle className="h-5 w-5" />
            </button>
          </div>
        </div>
      </section>

      {/* TRACK 2: BESPOKE PRIVATE AUDITS */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <span className="text-xs uppercase tracking-wider font-mono text-gray-400">Dành cho Nhà phát triển, Quỹ & Prop Trader</span>
          <h2 className="text-2xl md:text-3xl font-display font-bold text-white mt-1 mb-3">Dịch vụ kiểm định phương pháp riêng (Bespoke Audit)</h2>
          <p className="text-gray-400 text-sm max-w-2xl mx-auto">
            Nếu bạn có một thuật toán, EA hoặc bộ quy tắc giao dịch độc quyền cần chạy kiểm định độc lập trên máy chủ riêng của Strategy Audit (bảo mật NDA tuyệt đối).
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {auditPlans.map((plan) => (
            <div key={plan.id} className={`bg-[#131722]/80 backdrop-blur-md border rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 relative ${plan.color}`}>
              {plan.isPopular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-neon-green text-black text-[10px] uppercase font-bold tracking-widest px-4 py-1.5 rounded-full flex items-center space-x-1 shadow-[0_0_15px_rgba(0,255,163,0.3)]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Lựa chọn tối ưu</span>
                </div>
              )}
              <div>
                <div className="space-y-2 mb-6">
                  <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">{plan.name}</span>
                  <div className="flex items-baseline space-x-1">
                    <span className="text-3xl md:text-4xl font-display font-black text-white">{plan.price}</span>
                  </div>
                  <p className="text-gray-400 text-xs leading-relaxed font-sans font-light min-h-[48px] pt-2">{plan.desc}</p>
                </div>
                <ul className="space-y-3.5 border-t border-[#1F2937] pt-6 mb-8 text-xs">
                  {plan.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start text-gray-300 font-sans font-light leading-normal">
                      <Check className="w-4 h-4 text-neon-green mr-2.5 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button onClick={() => setActiveTab('audit')} className={`w-full py-3.5 rounded-xl text-center font-bold text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer ${plan.isPopular ? 'bg-neon-green text-black hover:scale-[1.01] shadow-[0_0_15px_rgba(0,255,163,0.2)]' : 'bg-[#0B0E14] text-white border border-[#1F2937] hover:border-gray-500'}`}>
                {plan.ctaText}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 2: SUBSCRIPTION */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-white mb-3">Thuê bao dịch vụ kiểm định</h2>
          <p className="text-gray-400 text-sm">Tối ưu hóa liên tục, đồng hành dài hạn cùng chiến lược của bạn.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {subPlans.map((plan) => (
            <div key={plan.id} className={`bg-[#131722]/80 backdrop-blur-md border rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 relative ${plan.color}`}>
              {plan.isPopular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-neon-green text-black text-[10px] uppercase font-bold tracking-widest px-4 py-1.5 rounded-full flex items-center space-x-1 shadow-[0_0_15px_rgba(0,255,163,0.3)]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Được Ưa Chuộng</span>
                </div>
              )}
              <div>
                <div className="space-y-2 mb-6">
                  <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">{plan.name}</span>
                  <div className="flex items-baseline space-x-1">
                    <span className="text-3xl md:text-4xl font-display font-black text-white">{plan.price}</span>
                    <span className="text-xs text-gray-500 font-sans">/ {plan.period}</span>
                  </div>
                  <p className="text-gray-400 text-xs leading-relaxed font-sans font-light min-h-[48px] pt-2">{plan.desc}</p>
                </div>
                <ul className="space-y-3.5 border-t border-[#1F2937] pt-6 mb-8 text-xs">
                  {plan.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start text-gray-300 font-sans font-light leading-normal">
                      <Check className="w-4 h-4 text-neon-green mr-2.5 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button onClick={() => setActiveTab('audit')} className={`w-full py-3.5 rounded-xl text-center font-bold text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer ${plan.isPopular ? 'bg-neon-green text-black hover:scale-[1.01] shadow-[0_0_15px_rgba(0,255,163,0.2)]' : 'bg-[#0B0E14] text-white border border-[#1F2937] hover:border-gray-500'}`}>
                {plan.ctaText}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 3: ADD-ONS */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-white mb-3">3. Tùy Chọn Nâng Cao (Add-ons)</h2>
          <p className="text-gray-400 text-sm">Mua thêm các tính năng phân tích chuyên sâu cho bất kỳ gói Audit nào.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {addons.map((addon, idx) => (
            <div key={idx} className="bg-[#131722]/60 border border-[#1F2937] hover:border-neon-green/30 rounded-xl p-5 flex flex-col items-center justify-center text-center transition-colors">
              <div className="mb-3">{addon.icon}</div>
              <h4 className="text-gray-300 font-bold mb-2 text-sm">{addon.name}</h4>
              <div className="text-neon-green font-mono font-bold text-base">{addon.price}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CONTACT */}
      <section className="max-w-7xl mx-auto px-4 text-center mt-12">
        <div className="bg-[#131722]/40 border border-[#1F2937]/50 p-6 rounded-2xl max-w-xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3 text-left">
            <div className="w-10 h-10 bg-[#0B0E14] border border-[#1F2937] rounded-xl flex items-center justify-center text-neon-green shrink-0">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Gói Đặc Quyền Ủy Thác / Tổ chức</p>
              <p className="text-sm font-bold text-white">Liên hệ trực tiếp Lê Vĩnh Phú (Leon)</p>
            </div>
          </div>
          <a href="https://zalo.me/0566665511" target="_blank" rel="noopener noreferrer" className="px-4 py-3 sm:py-2 bg-black border border-neon-green/30 hover:border-neon-green hover:bg-[#00FFA3]/5 text-neon-green text-xs font-bold font-mono tracking-wider rounded-lg uppercase w-full sm:w-auto text-center shrink-0">
            Zalo: 05.6666.5511
          </a>
        </div>
      </section>

    </div>
  );
}
