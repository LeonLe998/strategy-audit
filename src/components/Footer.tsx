import React from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldAlert, Phone, Mail, Clock, MessageCircle, Activity, BarChart2 } from 'lucide-react';

const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-[#0B0E14] border-t border-gray-800 mt-auto pt-12 pb-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main 3 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          
          {/* Column 1: Về StrategyAudit */}
          <div>
            <h3 className="text-white font-bold text-xl mb-4 tracking-wide flex items-center">
              <ShieldAlert className="h-6 w-6 text-[#00FFA3] mr-2" />
              Strategy<span className="text-[#00FFA3]">Audit™</span>
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              Tối ưu hóa chiến lược bằng dữ liệu định lượng.
            </p>
            <div className="flex flex-col space-y-2 text-sm text-gray-500">
              <a href="#" className="hover:text-[#00FFA3] transition-colors">Chính sách bảo mật</a>
              <a href="#" className="hover:text-[#00FFA3] transition-colors">Cam kết bảo mật dữ liệu</a>
            </div>
          </div>
          
          {/* Column 2: Hỗ trợ & Liên hệ */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Hỗ trợ & Liên hệ</h3>
            <div className="flex flex-col space-y-3 text-sm text-gray-400">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-[#F59E0B]" />
                <span>Hotline/Zalo: 05.6666.5511</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-[#F59E0B]" />
                <span>Email: support@strategyaudit.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-[#00FFA3]" />
                <span>Phản hồi trong 24h làm việc</span>
              </div>
            </div>
          </div>
          
          {/* Column 3: Cộng đồng */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Cộng đồng</h3>
            <div className="flex flex-col space-y-3 text-sm text-gray-400">
              <a href="https://zalo.me/0566665511" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 hover:text-white transition-colors group">
                <MessageCircle className="h-4 w-4 text-blue-400 group-hover:text-blue-300" />
                <span>Zalo Official Group</span>
              </a>
              <a href="https://zalo.me/0566665511" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 hover:text-white transition-colors group">
                <MessageCircle className="h-4 w-4 text-blue-500 group-hover:text-blue-400" />
                <span>Zalo Admin</span>
              </a>
              <a href="#" className="flex items-center space-x-2 hover:text-white transition-colors group">
                <BarChart2 className="h-4 w-4 text-gray-300 group-hover:text-white" />
                <span>TradingView Profile</span>
              </a>
            </div>
          </div>
          
        </div>
        
        {/* Risk Disclaimer */}
        <div className="pt-6 border-t border-gray-800 mb-6">
          <div className="flex items-start space-x-3 text-xs text-gray-500 bg-[#131722]/50 p-4 rounded-lg border border-[#FF3366]/20">
            <ShieldAlert className="h-5 w-5 text-[#FF3366] flex-shrink-0" />
            <p>
              <span className="font-bold text-[#FF3366] uppercase block mb-1">Risk Disclaimer</span>
              {t('footer.disclaimer')}
            </p>
          </div>
        </div>

        {/* Status Bar */}
        <div className="pt-4 border-t border-gray-800/50 flex flex-col md:flex-row items-center justify-center md:justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-2 mb-2 md:mb-0">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00FFA3] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#00FFA3]"></span>
            </span>
            <span>Hệ thống đang vận hành: <span className="text-[#00FFA3] font-bold">100%</span></span>
          </div>
          <div className="flex items-center space-x-2">
            <Activity className="h-4 w-4 text-gray-400" />
            <span>Báo cáo định kỳ: <span className="text-white font-medium">1,248</span> chiến lược đang được tối ưu hóa.</span>
          </div>
        </div>
        
      </div>
    </footer>
  );
};

export default Footer;
