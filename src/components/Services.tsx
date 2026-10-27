/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  Check, 
  Cpu, 
  LineChart, 
  Terminal,
  Zap
} from 'lucide-react';

interface ServicesProps {
  setActiveTab: (tab: string) => void;
}

export default function Services({ setActiveTab }: ServicesProps) {
  const coreServices = [
    {
      id: 'wfo',
      icon: Cpu,
      title: 'Kiểm toán & Đầm nén Walk-Forward (WFO)',
      tag: 'Tối ưu bền vững',
      desc: 'Thay vì tối ưu hóa toàn bộ quá khứ cùng lúc (Curve-fitting), WFO chia nhỏ lịch sử thành nhiều cửa sổ (In-Sample và Out-of-Sample) trượt liên tiếp về phía trước để kiểm định khả năng sinh tồn của Bot trong pha thị trường chưa biết.',
      benefits: [
        'Hạn chế bẫy khớp đường cong (Overfitting)',
        'Đo lường độ hiệu quả thực tế WFE (Walk-Forward Efficiency)',
        'Xác định tham số tối ưu trễ tương thích'
      ],
      badgeColor: 'border-neon-green/30 text-neon-green bg-neon-green/5'
    },
    {
      id: 'monte-carlo',
      icon: LineChart,
      title: 'Mô phỏng Regime-Split Monte Carlo',
      tag: 'Căng thẳng rủi ro',
      desc: 'Chia nhỏ thị trường thành 3 xu hướng cốt lõi: Bull (Tăng), Bear (Giảm) và Sideway (Đi ngang). Trộn xáo ngẫu nhiên hàng nghìn chuỗi lệnh để kiểm nghiệm Xác suất Cháy Quỹ (Risk of Ruin) trong tình huống xấu nhất.',
      benefits: [
        'Chứng minh Win Rate có bị bẻ gãy khi sụt giảm bất chợt',
        'Chiết xuất Max Drawdown thống kê khách quan',
        'Xác suất gãy chuỗi tối đa liên tục'
      ],
      badgeColor: 'border-coral-red/30 text-coral-red bg-coral-red/5'
    },
    {
      id: 'export',
      icon: Terminal,
      title: 'Cung cấp Pine Script & Python Skeleton code',
      tag: 'Chuyển giao công nghệ',
      desc: 'Hỗ trợ đóng gói logic của bạn thành code cấu trúc cao trên TradingView (Pine Script v5) hoặc thư viện kiểm thử chuyên nghiệp Python (Backtrader/Vectorbt). Sẵn sàng để tích hợp vào máy chủ Auto-execution.',
      benefits: [
        'Pine Script v5 chuẩn hóa cực ngắn gọn',
        'Python dataframe vectorization cho backtest cực nhanh',
        'API endpoint trigger sẵn sàng gửi lệnh tự động'
      ],
      badgeColor: 'border-blue-400/30 text-blue-400 bg-blue-400/5'
    }
  ];

  return (
    <div id="services-view" className="space-y-20 pb-20 pt-6">
      
      {/* 1. Header Hero */}
      <section className="text-center max-w-4xl mx-auto px-4">
        <span className="text-xs uppercase tracking-widest font-mono text-neon-green font-bold bg-neon-green/10 px-3 py-1 rounded">Our Technology</span>
        <h1 className="text-3xl md:text-5xl font-display font-bold mt-4 text-white">Chúng tôi làm gì để cứu tài khoản của bạn?</h1>
        <p className="text-gray-400 text-sm mt-3.5 leading-relaxed max-w-2xl mx-auto">
          Tại Strategy Audit, chúng tôi không "vẽ rồng vẽ phượng". Chúng tôi tháo dỡ toàn bộ logic, đưa qua các lưới lọc toán định lượng để phát hiện điểm gẫy trước khi bạn nạp tiền thật vào thị trường.
        </p>
      </section>

      {/* 2. core services breakdown */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="space-y-12 max-w-5xl mx-auto">
          {coreServices.map((service, index) => {
            const isEven = index % 2 === 0;

            return (
              <div 
                key={service.id} 
                className={`grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#131722]/50 border border-[#1F2937]/80 rounded-3xl p-8 md:p-10`}
              >
                {/* Text Block */}
                <div className={`lg:col-span-7 space-y-6 ${isEven ? 'lg:order-1' : 'lg:order-2'}`}>
                  <div className="flex items-center space-x-3">
                    <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${service.badgeColor}`}>
                      {service.tag}
                    </span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-display font-bold text-white">{service.title}</h2>
                  <p className="text-gray-400 text-xs leading-relaxed font-sans font-light">{service.desc}</p>
                  
                  <ul className="space-y-3 pt-2">
                    {service.benefits.map((benefit, bIdx) => (
                      <li key={bIdx} className="flex items-center text-xs text-gray-300">
                        <div className="w-4 h-4 rounded-full bg-neon-green/10 border border-[#00FFA3]/30 flex items-center justify-center mr-2.5 shrink-0">
                          <Check className="w-2.5 h-2.5 text-neon-green" />
                        </div>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Animated Visual simulation Block */}
                <div className={`lg:col-span-5 h-64 bg-[#0B0E14] border border-[#1F2937] rounded-2xl flex flex-col justify-between p-5 overflow-hidden relative ${isEven ? 'lg:order-2' : 'lg:order-1'}`}>
                  {service.id === 'wfo' && (
                    <div className="h-full flex flex-col justify-between">
                      <div className="flex items-center justify-between pointer-events-none">
                        <span className="text-[10px] uppercase font-mono text-gray-500">Walk-Forward Model</span>
                        <span className="text-[10px] font-mono text-neon-green leading-none">WFE: 0.68 (Alpha OK)</span>
                      </div>
                      
                      {/* Grid representation */}
                      <div className="space-y-3 my-auto">
                        <div className="flex items-center space-x-1.5">
                          <span className="text-[9px] font-mono w-14 text-gray-500">Window 1:</span>
                          <div className="h-4 bg-[#1F2937] rounded w-24 flex items-center px-1 text-[8px] font-mono text-[#4b5563]">In-Sample</div>
                          <div className="h-4 bg-neon-green/20 border border-neon-green/30 rounded w-12 flex items-center justify-center text-[8px] font-mono text-neon-green">Test</div>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <span className="text-[9px] font-mono w-14 text-gray-500">Window 2:</span>
                          <div className="h-4 w-6"></div>
                          <div className="h-4 bg-[#1F2937] rounded w-24 flex items-center px-1 text-[8px] font-mono text-[#4b5563]">In-Sample</div>
                          <div className="h-4 bg-neon-green/20 border border-neon-green/30 rounded w-12 flex items-center justify-center text-[8px] font-mono text-neon-green">Test</div>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <span className="text-[9px] font-mono w-14 text-gray-500">Window 3:</span>
                          <div className="h-4 w-12"></div>
                          <div className="h-4 bg-[#1F2937] rounded w-24 flex items-center px-1 text-[8px] font-mono text-[#4b5563]">In-Sample</div>
                          <div className="h-4 bg-neon-green/20 border border-neon-green/30 rounded w-12 flex items-center justify-center text-[8px] font-mono text-neon-green">Test</div>
                        </div>
                      </div>

                      <span className="text-[10px] text-gray-500 leading-normal font-sans">
                        Dữ liệu được trượt tịnh tiến, loại bỏ hoàn toàn khả năng can thiệp bằng tay.
                      </span>
                    </div>
                  )}

                  {service.id === 'monte-carlo' && (
                    <div className="h-full flex flex-col justify-between">
                      <div className="flex items-center justify-between pointer-events-none">
                        <span className="text-[10px] uppercase font-mono text-gray-500">Regime Split Probability</span>
                        <span className="text-[10px] font-mono text-coral-red leading-none">Risk of Ruin: 0.1%</span>
                      </div>

                      <div className="space-y-2.5 my-auto">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-gray-400">Bull Market Regime</span>
                          <div className="w-24 bg-gray-800 h-2 rounded overflow-hidden">
                            <div className="bg-neon-green h-full w-[85%]"></div>
                          </div>
                        </div>
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-gray-400">Sideways Regime</span>
                          <div className="w-24 bg-gray-800 h-2 rounded overflow-hidden">
                            <div className="bg-neon-green h-full w-[45%]"></div>
                          </div>
                        </div>
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-gray-400">Bear Market Regime</span>
                          <div className="w-24 bg-gray-800 h-2 rounded overflow-hidden">
                            <div className="bg-coral-red h-full w-[15%]"></div>
                          </div>
                        </div>
                      </div>

                      <span className="text-[10px] text-gray-500 leading-normal font-sans">
                        Phân tích sụt giảm nghiêm trọng trong các giai đoạn thị trường đảo pha đột ngột.
                      </span>
                    </div>
                  )}

                  {service.id === 'export' && (
                    <div className="h-full flex flex-col justify-between">
                      <div className="flex items-center justify-between pointer-events-none mb-1">
                        <span className="text-[10px] uppercase font-mono text-gray-500">pine / python code emitter</span>
                        <span className="text-[10px] font-mono text-blue-400 leading-none">Exportable skeleton</span>
                      </div>

                      <div className="font-mono text-[9px] text-gray-400 leading-normal bg-black/60 p-3 rounded-lg overflow-x-hidden select-none my-auto">
                        <p className="text-blue-400"><span className="text-gray-600">// Pine Script v5 skeleton</span></p>
                        <p><span className="text-coral-red">strategy</span>(<span className="text-green-300">"Quant_Edge"</span>, overlay=true)</p>
                        <p>ema34 = ta.ema(close, 34)</p>
                        <p>buy_cond = close &gt; ema34 and rsi &gt; 50</p>
                        <p className="text-neon-green"><span className="text-neon-green">if</span> (buy_cond)</p>
                        <p>&nbsp;&nbsp;&nbsp;&nbsp;strategy.entry(<span className="text-green-300">"Buy"</span>, strategy.long)</p>
                      </div>

                      <span className="text-[10px] text-gray-500 leading-normal font-sans">
                        Nhận file code mẫu chuyển hóa hoàn chỉnh thuật toán giao dịch của bạn.
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Deliverables List / Call Box */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="bg-[#131722]/40 border border-[#1F2937]/80 rounded-3xl p-8 max-w-4xl mx-auto text-center">
          <Zap className="w-10 h-10 text-neon-green mx-auto mb-4" />
          <h2 className="text-2xl font-display font-bold text-white uppercase">Sẵn Sàng Đánh Giá Hệ Thống Của Bạn?</h2>
          <p className="text-gray-400 text-sm mt-3 max-w-md mx-auto">
            Hợp tác với các chuyên gia định lượng của Strategy Audit để loại bỏ yếu tố may rủi, đưa hệ thống lên cán cân khoa học.
          </p>
          <div className="mt-8 flex justify-center">
            <button 
              onClick={() => setActiveTab('audit')}
              className="px-8 py-3.5 bg-neon-green text-black font-bold text-xs rounded-xl uppercase tracking-wider shadow-[0_0_15px_rgba(0,255,163,0.2)] hover:scale-[1.01] active:scale-[0.99] transition cursor-pointer"
            >
              Kiểm toán chiến lược của bạn ngay
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
