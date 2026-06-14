import React from 'react';

interface PDFTemplateProps {
  id?: string;
  documentType: string;
  customerName: string;
  customerEmail: string;
}

const PDFTemplate: React.FC<PDFTemplateProps> = ({ id = 'pdf-content', documentType, customerName, customerEmail }) => {
  const renderContent = () => {
    switch (documentType) {
      case 'Sự Thật Về Risk Of Ruin (Xác Suất Cháy Quỹ)':
        return (
          <>
            <h2 className="text-2xl font-bold text-[#ffffff] mb-4 border-b-2 border-[#FF3366] pb-2 mt-6">
              1. Sự thật về mặt toán học: Bạn không thể dùng "Cảm tính" để tính RoR
            </h2>
            <p className="text-[#9ca3af] mb-4 leading-relaxed text-justify">
              Nhiều trader nghĩ rằng nếu họ có tỷ lệ thắng (Win Rate) cao thì tài khoản của họ an toàn. Đây là một sai lầm chết người. 
              <strong className="text-[#ffffff]"> Xác suất cháy quỹ (Risk of Ruin - RoR) </strong> được cấu thành từ 3 biến số độc lập bắt buộc phải chạy cùng nhau:
            </p>
            <ul className="list-disc pl-6 text-[#9ca3af] mb-4 space-y-2">
              <li><strong className="text-[#ffffff]">Win Rate:</strong> Tỷ lệ thắng của hệ thống.</li>
              <li><strong className="text-[#ffffff]">Payoff Ratio:</strong> Tỷ lệ Thưởng/Rủi ro (Risk:Reward trung bình thực tế, không phải kỳ vọng).</li>
              <li><strong className="text-[#ffffff]">Risk per Trade:</strong> Phần trăm rủi ro trên mỗi lệnh so với tổng vốn.</li>
            </ul>
            <p className="text-[#9ca3af] mb-6 leading-relaxed text-justify">
              Hệ quả logic: RoR là một hàm số mũ, nó không giảm dần đều mà đi theo dạng "vách đá" (Cliff effect). Nghĩa là ở một mức rủi ro nhất định (ví dụ 1%), RoR của bạn có thể bằng 0%. Nhưng chỉ cần bạn tăng rủi ro lên 3% hoặc 5%, RoR không tăng lên 3% hay 5%, mà nó <strong className="text-[#FF3366]">bùng nổ thẳng lên 100%</strong> (cháy tài khoản chắc chắn xảy ra trong dài hạn).
            </p>

            {/* CHART: Cliff Effect */}
            <div className="break-inside-avoid bg-[#131722] p-6 rounded-lg border border-[#1f2937] mb-8 relative">
              <h4 className="text-[#ffffff] font-bold text-center mb-6 text-sm uppercase tracking-widest">Mô Phỏng "Vách Đá Rủi Ro" (Cliff Effect)</h4>
              <div className="flex items-end justify-center space-x-6 h-40 border-b border-[#374151] pb-2 relative">
                <div className="absolute left-0 bottom-2 text-xs text-[#4b5563] -ml-2">0%</div>
                <div className="absolute left-0 top-6 text-xs text-[#FF3366] -ml-6 font-bold">100%</div>
                
                {/* Bars */}
                <div className="flex flex-col items-center justify-end h-full">
                  <div className="w-10 bg-[#00FFA3] rounded-t-sm" style={{ height: '2%' }}></div>
                  <span className="text-[#9ca3af] text-xs mt-2">Risk 1%</span>
                </div>
                <div className="flex flex-col items-center justify-end h-full">
                  <div className="w-10 bg-[#00FFA3] rounded-t-sm" style={{ height: '4%' }}></div>
                  <span className="text-[#9ca3af] text-xs mt-2">Risk 2%</span>
                </div>
                <div className="flex flex-col items-center justify-end h-full">
                  <div className="w-10 bg-[#F59E0B] rounded-t-sm" style={{ height: '15%' }}></div>
                  <span className="text-[#9ca3af] text-xs mt-2">Risk 3%</span>
                </div>
                <div className="flex flex-col items-center justify-end h-full relative">
                  <span className="text-[#FF3366] font-bold text-xs mb-1">Cháy Quỹ!</span>
                  <div className="w-10 bg-[#FF3366] rounded-t-sm" style={{ height: '80%' }}></div>
                  <span className="text-[#ffffff] font-bold text-xs mt-2">Risk 5%</span>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-[#ffffff] mb-4 border-b-2 border-[#FF3366] pb-2 mt-8">
              2. Ảo tưởng về Win Rate và Cái bẫy của chuỗi thua (Streak of Losses)
            </h2>
            <p className="text-[#9ca3af] mb-4 leading-relaxed text-justify">
              Mọi người thường tập trung vào việc nâng Win Rate lên 70% - 80% và tin rằng mình không thể cháy quỹ. Thực tế, ngay cả với một chiến lược có Win Rate 60%, về mặt xác suất, trong một mẫu gồm 1.000 lệnh, việc xuất hiện một chuỗi thua liên tiếp 10 đến 12 lệnh là <strong className="text-[#ffffff]">hoàn toàn bình thường và chắc chắn sẽ xảy ra</strong>.
            </p>
            <div className="break-inside-avoid bg-[#131722] p-4 rounded-lg border-l-4 border-[#FF3366] mb-6">
              <p className="text-[#e5e7eb] mb-2">▪ <strong className="text-[#ffffff]">Nếu bạn risk 1%/lệnh:</strong> Chuỗi thua 10 lệnh khiến bạn sụt giảm 10% tài khoản. Bạn hoàn toàn sống sót để đi tiếp.</p>
              <p className="text-[#e5e7eb]">▪ <strong className="text-[#ffffff]">Nếu bạn risk 5%/lệnh:</strong> Chuỗi thua 10 lệnh sẽ thổi bay 50% tài khoản. Để về lại bờ, bạn cần một mức tăng trưởng 100% trên số vốn còn lại. Lúc này, tâm lý giao dịch bị bẻ gãy, và quỹ của bạn chính thức bước vào giai đoạn hấp hối.</p>
            </div>

            <h2 className="text-2xl font-bold text-[#ffffff] mb-4 border-b-2 border-[#FF3366] pb-2 mt-8">
              3. Bản chất của Cháy Quỹ (Ruin) trong Trading Prop Firm
            </h2>
            <p className="text-[#9ca3af] mb-4 leading-relaxed text-justify">
              Đối với tài khoản cá nhân, "Ruin" nghĩa là vốn về bằng 0. Nhưng đối với quỹ cấp vốn (Prop Firm - như FTMO, Funding Pips,...), định nghĩa về "Ruin" khắt khe hơn rất nhiều:
            </p>
            <ul className="list-disc pl-6 text-[#9ca3af] mb-6 space-y-2">
              <li><strong className="text-[#ffffff]">Tái định nghĩa số vốn thực:</strong> Nếu bạn cầm quỹ 100.000$ với Max Drawdown 10%, bản chất số vốn thực bạn được quyền kiểm soát chỉ là <strong className="text-[#ffffff]">10.000$</strong>.</li>
              <li><strong className="text-[#ffffff]">Sự thật về cách tính Risk:</strong> Nếu bạn rủi ro 1% trên tổng quy mô quỹ (1.000$), thì thực chất bạn đang rủi ro tới <strong className="text-[#FF3366]">10% trên số vốn sống sót (10.000$)</strong> của mình.</li>
            </ul>
          </>
        );

      case 'Alpha vs Beta trong Giao Dịch Định Lượng':
        return (
          <>
            <h2 className="text-2xl font-bold text-[#ffffff] mb-4 border-b-2 border-[#00FFA3] pb-2 mt-6">
              1. Alpha và Beta là gì? Đừng nhầm lẫn giữa TÀI NĂNG và MAY MẮN
            </h2>
            <p className="text-[#9ca3af] mb-4 leading-relaxed text-justify">
              Trong giới tài chính định lượng, lợi nhuận của bạn luôn được bóc tách làm 2 phần: <strong className="text-[#ffffff]">Beta (Sóng thị trường)</strong> và <strong className="text-[#ffffff]">Alpha (Kỹ năng cốt lõi)</strong>.
            </p>
            
            {/* CHART: Alpha vs Beta */}
            <div className="break-inside-avoid bg-[#131722] p-6 rounded-lg border border-[#1f2937] mb-8 mt-6">
              <h4 className="text-[#ffffff] font-bold text-center mb-4 text-sm uppercase tracking-widest">Phân Tách Lợi Nhuận: Alpha vs Beta</h4>
              <svg viewBox="0 0 500 150" className="w-full h-32 overflow-visible">
                {/* Grid */}
                <line x1="0" y1="25" x2="500" y2="25" stroke="#1f2937" strokeWidth="1" />
                <line x1="0" y1="75" x2="500" y2="75" stroke="#1f2937" strokeWidth="1" />
                <line x1="0" y1="125" x2="500" y2="125" stroke="#1f2937" strokeWidth="1" />
                
                {/* Beta Line (Market) */}
                <path d="M0,125 Q50,50 100,75 T200,100 T300,50 T400,125 T500,50" fill="none" stroke="#6b7280" strokeWidth="2" strokeDasharray="5,5" />
                <text x="410" y="40" fill="#6b7280" fontSize="12" fontWeight="bold">Beta (Sóng TT)</text>

                {/* Alpha Line (Strategy) */}
                <path d="M0,125 L100,110 L200,90 L300,70 L400,40 L500,20" fill="none" stroke="#00FFA3" strokeWidth="3" />
                <text x="430" y="15" fill="#00FFA3" fontSize="12" fontWeight="bold">Tích lũy Alpha</text>
              </svg>
            </div>

            <div className="break-inside-avoid bg-[#131722] p-4 rounded-lg border-l-4 border-[#00FFA3] mb-6">
              <p className="text-[#e5e7eb] mb-2">▪ <strong className="text-[#ffffff]">Beta:</strong> Là lợi nhuận nhờ "thị trường đang lên". Ví dụ: Bạn mua Bitcoin 2021 và x3 tài khoản. Ai mua cũng thắng.</p>
              <p className="text-[#e5e7eb]">▪ <strong className="text-[#ffffff]">Alpha:</strong> Là lợi thế tuyệt đối của chiến lược. Nó tạo ra lợi nhuận độc lập, bất chấp thị trường sập (Downtrend) hay đi ngang.</p>
            </div>

            <h2 className="text-2xl font-bold text-[#ffffff] mb-4 border-b-2 border-[#00FFA3] pb-2 mt-8">
              2. Đa số các Bot và EA trên thị trường chỉ đang "Cưỡi Beta"
            </h2>
            <p className="text-[#9ca3af] mb-6 leading-relaxed text-justify">
              Tại sao một chiến lược bạn test 2 năm qua lợi nhuận cực tốt, nhưng cứ lắp vào chạy thật là lỗ? Vì 2 năm qua là một chu kỳ thị trường cụ thể (Regime). Chiến lược của bạn được tối ưu để khớp với Beta của 2 năm đó. Khi thị trường đổi pha, Beta biến mất, và vì bạn không có Alpha, chiến lược sụp đổ hoàn toàn.
            </p>

            <h2 className="text-2xl font-bold text-[#ffffff] mb-4 border-b-2 border-[#00FFA3] pb-2 mt-8">
              3. Làm sao để đo lường Alpha thực sự?
            </h2>
            <ul className="list-disc pl-6 text-[#9ca3af] mb-6 space-y-2">
              <li>Phải sống sót qua nhiều pha thị trường khác nhau (Uptrend, Downtrend, Sideway).</li>
              <li>Tỷ lệ Sharpe Ratio (Đo lường lợi nhuận trên rủi ro) phải lớn hơn 1.0.</li>
              <li>Phải có hệ số WFE (Walk-Forward Efficiency) {'>'} 0.5 để chứng minh lợi nhuận không đến từ sự trùng hợp.</li>
            </ul>
          </>
        );

      case 'Hiểu Đúng Về Bẫy Khớp Đường Cong (Curve-fitting)':
        return (
          <>
            <h2 className="text-2xl font-bold text-[#ffffff] mb-4 border-b-2 border-[#00FFA3] pb-2 mt-6">
              1. Curve-fitting (Khớp đường cong) là gì?
            </h2>
            <p className="text-[#9ca3af] mb-4 leading-relaxed text-justify">
              Hãy tưởng tượng bạn bắn một mũi tên vào tường, sau đó bạn đi đến và vẽ một vòng tròn hồng tâm bao quanh mũi tên đó. Trông bạn như một xạ thủ thiên tài. Đó chính xác là những gì 95% trader đang làm khi Backtest.
            </p>
            
            {/* CHART: Curve Fitting */}
            <div className="break-inside-avoid bg-[#131722] p-6 rounded-lg border border-[#1f2937] mb-8 mt-6">
              <h4 className="text-[#ffffff] font-bold text-center mb-4 text-sm uppercase tracking-widest">Biểu Đồ Sụp Đổ Của Curve-Fitting</h4>
              <svg viewBox="0 0 500 150" className="w-full h-32 overflow-visible">
                {/* Grid */}
                <line x1="0" y1="125" x2="500" y2="125" stroke="#1f2937" strokeWidth="2" />
                <line x1="250" y1="10" x2="250" y2="140" stroke="#4b5563" strokeWidth="2" strokeDasharray="4,4" />
                
                {/* Text Labels */}
                <text x="70" y="145" fill="#9ca3af" fontSize="12" fontWeight="bold">QUÁ KHỨ (In-sample)</text>
                <text x="320" y="145" fill="#FF3366" fontSize="12" fontWeight="bold">TƯƠNG LAI (Out-of-sample)</text>

                {/* Over-optimized Line */}
                <path d="M0,125 Q50,120 100,90 T200,60 T250,20" fill="none" stroke="#00FFA3" strokeWidth="3" />
                {/* Crash Line */}
                <path d="M250,20 Q300,130 350,110 T450,160" fill="none" stroke="#FF3366" strokeWidth="3" />
              </svg>
            </div>

            <p className="text-[#9ca3af] mb-6 leading-relaxed text-justify">
              <strong className="text-[#ffffff]">Curve-fitting</strong> là hành động bạn liên tục thay đổi thông số của chỉ báo (đổi RSI từ 14 sang 9, đổi MA từ 50 sang 37...) cho đến khi đường cong lợi nhuận trong quá khứ trông thật hoàn hảo.
            </p>

            <h2 className="text-2xl font-bold text-[#ffffff] mb-4 border-b-2 border-[#00FFA3] pb-2 mt-8">
              2. Hậu quả tàn khốc của Curve-fitting
            </h2>
            <div className="break-inside-avoid bg-[#131722] p-4 rounded-lg border-l-4 border-[#FF3366] mb-6">
              <p className="text-[#e5e7eb] mb-2">Thị trường không bao giờ lặp lại quá khứ y hệt 100%. Nó chỉ lặp lại theo "tính chất phân dạng". Khi bạn ép hệ thống của mình phải vừa khít với dữ liệu trong quá khứ, bạn đã tước đi khả năng thích nghi của nó.</p>
              <p className="font-bold mt-2 text-[#FF3366]">— Hậu quả: Đưa vào chạy Live là thua lỗ ngay lập tức.</p>
            </div>

            <h2 className="text-2xl font-bold text-[#ffffff] mb-4 border-b-2 border-[#00FFA3] pb-2 mt-8">
              3. Liều thuốc duy nhất: Walk-Forward Optimization (WFO)
            </h2>
            <p className="text-[#9ca3af] mb-4 leading-relaxed text-justify">
              Thay vì tối ưu toàn bộ quá khứ cùng lúc, WFO chia nhỏ dữ liệu thành nhiều cửa sổ:
            </p>
            <ul className="list-disc pl-6 text-[#9ca3af] mb-6 space-y-2">
              <li>Tối ưu trên Cửa sổ 1 (In-sample).</li>
              <li>Đem thông số đó chạy test mù trên Cửa sổ 2 (Out-of-sample).</li>
              <li>Trượt cửa sổ về phía trước và lặp lại quá trình hàng chục lần.</li>
            </ul>
          </>
        );

      default:
        return <p className="text-[#9ca3af]">Document not found.</p>;
    }
  };

  const getBorderColor = () => {
    if (documentType.includes('Risk')) return 'border-[#FF3366]';
    return 'border-[#00FFA3]';
  };

  const getAccentColor = () => {
    if (documentType.includes('Risk')) return 'text-[#FF3366]';
    return 'text-[#00FFA3]';
  };

  return (
    <div id={id} className="bg-[#0B0E14] text-[#9ca3af] p-10 font-sans w-[800px] mx-auto relative border border-[#1f2937]">
      {/* WATERMARK */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <h1 className="text-9xl font-black text-[#131722] transform -rotate-45 whitespace-nowrap opacity-50">
          CONFIDENTIAL
        </h1>
      </div>

      <div className={`break-inside-avoid relative z-10 border-b-4 ${getBorderColor()} pb-6 mb-8 flex justify-between items-end`}>
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-[#ffffff] uppercase">Strategy Audit</h1>
          <p className="text-[#6b7280] font-bold uppercase tracking-widest text-sm mt-1">Institutional Quant Research</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-[#ffffff] uppercase tracking-widest bg-[#FF336633] px-3 py-1 rounded border border-[#FF33664D] inline-block mb-2">Bản Lưu Hành Nội Bộ</p>
          <p className="text-sm font-semibold text-[#6b7280] mt-2">Dành riêng cho:</p>
          <p className={`text-lg font-bold ${getAccentColor()} uppercase`}>{customerName}</p>
          <p className="text-sm text-[#4b5563]">{customerEmail}</p>
        </div>
      </div>

      <div className="relative z-10">
        <h1 className="break-inside-avoid text-3xl font-black text-center text-[#ffffff] mb-10 uppercase px-4 leading-tight">
          {documentType}
        </h1>
        
        {renderContent()}

        {/* CALL TO ACTION BOX (Universal for all docs) */}
        <div className={`break-inside-avoid mt-12 bg-[#131722] border-l-8 ${getBorderColor()} p-6 rounded-r-lg border border-[#1f2937]`}>
          <h3 className="text-xl font-bold text-[#ffffff] mb-3">
            Giải pháp thực tế: Ngừng đánh bạc, Bắt đầu định lượng
          </h3>
          <p className="text-[#9ca3af] mb-4 leading-relaxed text-justify">
            Để đưa xác suất cháy quỹ về mức bằng 0 một cách tuyệt đối, một nhà quản lý rủi ro chuyên nghiệp không dựa vào vận may. Họ sử dụng kiểm toán <strong className="text-[#ffffff]">Walk-Forward Optimization (WFO)</strong> và <strong className="text-[#ffffff]">Monte Carlo Simulation</strong>.
          </p>
          <p className="text-[#9ca3af] mb-4 leading-relaxed text-justify">
            Chấp nhận sự không hoàn hảo: Hệ thống có lợi thế (Edge) tốt đến đâu vẫn luôn tồn tại những giai đoạn thị trường từ chối nó (Market Regime thay đổi). Hạ thấp rủi ro để sống sót qua giai đoạn "Bad Luck" là cách duy nhất để chạm tới giai đoạn thăng hoa của xác suất.
          </p>
          <a href="https://stategy.netlify.app/intake" className="block bg-[#0B0E14] border border-[#00FFA34D] text-[#00FFA3] p-4 rounded-md text-center font-bold mt-4 uppercase tracking-wider hover:bg-[#00FFA3]/10 transition-colors">
            Chiến lược của bạn đã đủ định lượng chưa? Hãy để Strategy Audit kiểm chứng ngay tại đây.
          </a>
        </div>
      </div>

      {/* FOOTER */}
      <div className="break-inside-avoid relative z-10 mt-12 pt-6 border-t border-[#1f2937] flex flex-col items-center justify-center text-center">
        <p className="text-[#e5e7eb] font-bold text-sm mb-2">
          Hỗ trợ trực tiếp: Lê Vĩnh Phú (Leon) - Zalo: 05.6666.5511
        </p>
        <p className="text-xs text-[#4b5563] uppercase font-bold tracking-widest">
          Tài liệu bản quyền thuộc về Strategy Audit © {new Date().getFullYear()} - Không chia sẻ trái phép
        </p>
      </div>
    </div>
  );
};

export default PDFTemplate;
