import React from 'react';
import { MessageCircle } from 'lucide-react';

const Footer: React.FC = () => {

  return (
    <footer id="app-footer" className="relative z-20 border-t border-[#1F2937]/50 bg-[#0B0E14] py-12 mt-auto text-xs text-gray-500">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        
        {/* Column 1: Về StrategyAudit */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <span className="font-display font-bold text-sm tracking-widest text-white uppercase">
              STRATEGY <span className="text-[#00FFA3]">AUDIT</span>
            </span>
            <span className="text-[9px] font-mono border border-[#1F2937] px-1.5 py-0.5 rounded text-gray-400">v1.2</span>
          </div>
          <p className="max-w-md text-gray-400 font-sans font-light leading-relaxed">
            Tối ưu hóa bền vững hệ thống giao dịch thuật toán. Sử dụng đo lường WFO (Walk-Forward Optimization) và Monte Carlo để bộc lộ Alpha đích thực của chiến lược.
          </p>
        </div>

        {/* Column 2: Hỗ trợ & Liên hệ */}
        <div className="space-y-3 md:ml-auto">
          <p className="font-bold text-white text-sm">Hỗ trợ & Liên hệ</p>
          <div className="text-gray-400 leading-relaxed font-sans space-y-2">
            <p>Hotline/Zalo: <span className="text-[#00FFA3] font-mono">05.6666.5511</span></p>
            <p>Email: support@strategyaudit.com</p>
            <p className="text-[#00FFA3]">Phản hồi trong 24h làm việc</p>
          </div>
        </div>

        {/* Column 3: Cộng đồng */}
        <div className="space-y-3 md:ml-auto">
          <p className="font-bold text-white text-sm">Cộng đồng</p>
          <div className="flex flex-col space-y-3 text-sm text-gray-400">
            <a href="https://zalo.me/0566665511" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 hover:text-white transition-colors group">
              <MessageCircle className="h-4 w-4 text-[#00FFA3]" />
              <span>Zalo Official Group</span>
            </a>
            <a href="https://zalo.me/0566665511" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 hover:text-white transition-colors group">
              <MessageCircle className="h-4 w-4 text-[#00FFA3]" />
              <span>Zalo Admin</span>
            </a>
          </div>
        </div>
      </div>

      {/* Global Risk Disclaimer Box */}
      <div className="max-w-7xl mx-auto px-4 mt-8 pt-8 border-t border-[#1F2937]/30">
        <div className="bg-[#131722]/30 border border-[#1F2937]/30 p-4 rounded-xl text-[10px] leading-relaxed text-gray-600 font-sans">
          <strong className="text-gray-400 font-bold uppercase block mb-1">Tuyên bố rủi ro toán học:</strong> Giao dịch tài chính (Forex, Crypto, cổ phiếu) luôn tiềm ẩn rủi ro khớp thua khốc liệt. Kết quả Walk-Forward Optimization trong quá khứ chỉ mang tính tham chiếu xác suất thống kê khoa học và không cam kết đảm bảo lợi nhuận tương lai. Chúng tôi cung cấp giải pháp kiểm toán tối ưu toán phần, tuyệt đối không mời chào ủy thác đầu tư hay kêu gọi rót vốn.
        </div>
      </div>

      {/* Status Bar */}
      <div className="max-w-7xl mx-auto px-4 mt-6 pt-4 flex flex-col md:flex-row items-center justify-between text-xs text-gray-500">
        <div className="flex items-center space-x-2 mb-2 md:mb-0">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00FFA3] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00FFA3]"></span>
          </span>
          <span>Hệ thống đang vận hành: <span className="text-[#00FFA3] font-bold">100%</span></span>
        </div>
        <p className="text-[10px] text-gray-600">Tài liệu bản quyền thuộc về Strategy Audit © {new Date().getFullYear()} - Không chia sẻ trái phép.</p>
      </div>
    </footer>
  );
};

export default Footer;
