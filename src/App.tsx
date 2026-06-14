/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Services from './components/Services';
import Vault from './components/Vault';
import Pricing from './components/Pricing';
import IntakeWizard from './pages/IntakeWizard';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('home');

  return (
    <div id="quant-app-container" className="min-h-screen bg-[#0B0E14] text-gray-300 relative font-sans antialiased overflow-x-hidden selection:bg-neon-green selection:text-black">
      
      {/* Background radial overlays */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-neon-green/5 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-coral-red/5 rounded-full blur-[100px] pointer-events-none z-0"></div>

      {/* Main navigation header */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Primary body view holder with smooth route animations */}
      <main id="app-main-content" className="relative z-10 pt-24 min-h-[calc(100vh-16rem)]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="w-full"
          >
            {activeTab === 'home' && <Home setActiveTab={setActiveTab} />}
            {activeTab === 'services' && <Services setActiveTab={setActiveTab} />}
            {activeTab === 'vault' && <Vault setActiveTab={setActiveTab} />}
            {activeTab === 'pricing' && <Pricing setActiveTab={setActiveTab} />}
            {activeTab === 'audit' && (
              <div className="max-w-4xl mx-auto px-4 mt-8">
                <IntakeWizard selectedPackage={null} />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Premium Footer */}
      <footer id="app-footer" className="relative z-20 border-t border-[#1F2937]/50 bg-[#0B0E14] py-12 mt-12 text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <span className="font-display font-bold text-sm tracking-widest text-white uppercase">
                STRATEGY <span className="text-neon-green">AUDIT</span>
              </span>
              <span className="text-[9px] font-mono border border-[#1F2937] px-1.5 py-0.5 rounded text-gray-400">v1.2</span>
            </div>
            <p className="max-w-md text-gray-400 font-sans font-light leading-relaxed">
              Tối ưu hóa bền vững hệ thống giao dịch thuật toán. Sử dụng đo lường WFO (Walk-Forward Optimization) và Monte Carlo để bộc lộ Alpha đích thực của chiến lược.
            </p>
          </div>

          <div className="space-y-4 md:text-right">
            <div className="text-gray-400 leading-relaxed font-sans space-y-1">
              <p className="font-bold text-white text-xs">Hỗ trợ &amp; Điều phối trực tiếp:</p>
              <p>Lê Vĩnh Phú (Leon) • Zalo: <span className="text-neon-green font-mono">05.6666.5511</span></p>
              <p className="text-[10px] text-gray-500">Tài liệu bản quyền thuộc về Strategy Audit © {new Date().getFullYear()} - Không chia sẻ trái phép.</p>
            </div>
          </div>
        </div>

        {/* Global Risk Disclaimer Box */}
        <div className="max-w-7xl mx-auto px-4 mt-8 pt-8 border-t border-[#1F2937]/30">
          <div className="bg-[#131722]/30 border border-[#1F2937]/30 p-4 rounded-xl text-[10px] leading-relaxed text-gray-600 font-sans">
            <strong className="text-gray-400 font-bold">Tuyên bố rủi ro toán học:</strong> Giao dịch tài chính (Forex, Crypto, cổ phiếu) luôn tiềm ẩn rủi ro khớp thua khốc liệt. Kết quả Walk-Forward Optimization trong quá khứ chỉ mang tính tham chiếu xác suất thống kê khoa học và không cam kết đảm bảo lợi nhuận tương lai. Chúng tôi cung cấp giải pháp kiểm toán tối ưu toán phần, tuyệt đối không mời chào ủy thác đầu tư hay kêu gọi rót vốn.
          </div>
        </div>
      </footer>

    </div>
  );
}
