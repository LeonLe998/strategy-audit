/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Navbar from './components/Navbar';
import Home from './components/HomeStitch';
import Services from './components/ServicesRedesign';
import Vault from './components/Vault';
import Pricing from './components/Pricing';
import IntakeWizard from './pages/IntakeWizard';
import VIPLibrary from './pages/VIPLibrary';
import AdminDashboard from './pages/AdminDashboard';
import MembershipPage from './pages/MembershipPage';
import SauO from './pages/SauOStitch';
import AmbientBackground from './components/SoftBackdrop';
import BottomNavigation from './components/BottomNavigation';
import SmoothScroll from './components/SmoothScroll';
import ScrollProgressBar from './components/ScrollProgressBar';

interface RouteInfo {
  tab: string;
  subId: string | null;
  isSauO: boolean;
}

function parseCurrentRoute(): RouteInfo {
  if (typeof window === 'undefined') {
    return { tab: 'home', subId: null, isSauO: false };
  }

  const pathname = window.location.pathname.replace(/\/$/, '') || '/';
  const searchParams = new URLSearchParams(window.location.search);
  const queryStrat = searchParams.get('strat') || searchParams.get('strategy') || searchParams.get('id');
  const queryDoc = searchParams.get('doc');
  const queryTab = searchParams.get('tab');

  if (pathname.toLowerCase() === '/sauo') {
    return { tab: 'sauo', subId: null, isSauO: true };
  }

  // Khớp /vip/:id hoặc /viplibrary/:id hoặc /strategy/:id
  const vipMatch = pathname.match(/^\/(?:vip|viplibrary|strategy)(?:\/([^/]+))?\/?$/i);
  if (vipMatch) {
    const stratId = vipMatch[1] ? decodeURIComponent(vipMatch[1]) : (queryStrat || null);
    return { tab: 'viplibrary', subId: stratId, isSauO: false };
  }

  // Khớp /vault/:docId hoặc /tai-lieu/:docId
  const vaultMatch = pathname.match(/^\/(?:vault|tai-lieu)(?:\/([^/]+))?\/?$/i);
  if (vaultMatch) {
    const docId = vaultMatch[1] ? decodeURIComponent(vaultMatch[1]) : (queryDoc || null);
    return { tab: 'vault', subId: docId, isSauO: false };
  }

  const pLower = pathname.toLowerCase();
  if (pLower === '/membership' || pLower === '/thanh-vien') {
    return { tab: 'membership', subId: null, isSauO: false };
  }
  if (pLower === '/services' || pLower === '/dich-vu') {
    return { tab: 'services', subId: null, isSauO: false };
  }
  if (pLower === '/pricing' || pLower === '/bang-gia') {
    return { tab: 'pricing', subId: null, isSauO: false };
  }
  if (pLower === '/audit' || pLower === '/bat-dau' || pLower === '/kiem-dinh' || pLower === '/wizard') {
    return { tab: 'audit', subId: null, isSauO: false };
  }
  if (pLower === '/admin') {
    return { tab: 'admin', subId: null, isSauO: false };
  }

  if (queryStrat) {
    return { tab: 'viplibrary', subId: queryStrat, isSauO: false };
  }
  if (queryDoc) {
    return { tab: 'vault', subId: queryDoc, isSauO: false };
  }
  if (queryTab) {
    return { tab: queryTab, subId: null, isSauO: queryTab === 'sauo' };
  }

  return { tab: 'home', subId: null, isSauO: false };
}

function getPathForRoute(tab: string, subId?: string | null): string {
  switch (tab) {
    case 'home':
      return '/';
    case 'services':
      return '/services';
    case 'pricing':
      return '/pricing';
    case 'membership':
      return '/membership';
    case 'audit':
      return '/audit';
    case 'admin':
      return '/admin';
    case 'sauo':
      return '/sauo';
    case 'vault':
      return subId ? `/vault/${encodeURIComponent(subId)}` : '/vault';
    case 'viplibrary':
      return subId ? `/vip/${encodeURIComponent(subId)}` : '/vip';
    default:
      return '/';
  }
}

export default function App() {
  const [routeInfo, setRouteInfo] = useState<RouteInfo>(parseCurrentRoute);

  const navigate = (tab: string, subId: string | null = null, replace: boolean = false) => {
    const newPath = getPathForRoute(tab, subId);
    if (typeof window !== 'undefined' && window.location.pathname !== newPath) {
      if (replace) {
        window.history.replaceState(null, '', newPath);
      } else {
        window.history.pushState(null, '', newPath);
      }
    }
    if (typeof window !== 'undefined' && tab !== routeInfo.tab) {
      if ((window as any).__lenis) {
        (window as any).__lenis.scrollTo(0, { immediate: true });
      } else {
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
    }
    setRouteInfo({
      tab,
      subId,
      isSauO: tab === 'sauo'
    });
  };

  useEffect(() => {
    const handlePopState = () => {
      const parsed = parseCurrentRoute();
      setRouteInfo(parsed);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const activeTab = routeInfo.tab;
  const setActiveTab = (tab: string) => navigate(tab, null);

  // Nếu đang ở đường dẫn /sauo, hiển thị trang Sáu Ô độc lập (chuẩn phễu mobile)
  if (routeInfo.isSauO || activeTab === 'sauo') {
    return (
      <SmoothScroll>
        <ScrollProgressBar />
        <SauO />
      </SmoothScroll>
    );
  }

  return (
    <SmoothScroll>
      <div id="quant-app-container" className="min-h-screen bg-[#061624] text-gray-300 relative font-sans antialiased overflow-x-hidden selection:bg-emerald-500 selection:text-white dark:selection:bg-neon-green dark:selection:text-black transition-colors duration-300">
      
      {/* Top Reading Scroll Progress Indicator */}
      <ScrollProgressBar />

      {/* Dynamic Animated Quant Ambient Background */}
      <AmbientBackground />

      {/* Main navigation header */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Primary body view holder with smooth route animations */}
      <main id="app-main-content" className={`relative z-10 ${activeTab === 'home' ? 'pt-16' : 'pt-24'} min-h-[calc(100vh-16rem)]`}>
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
            {activeTab === 'vault' && (
              <Vault 
                setActiveTab={setActiveTab} 
                initialDocId={routeInfo.subId} 
                onDocChange={(docId) => navigate('vault', docId)} 
              />
            )}
            {activeTab === 'viplibrary' && (
              <VIPLibrary 
                setActiveTab={setActiveTab} 
                initialStrategyId={routeInfo.subId} 
                onStrategyChange={(stratId) => navigate('viplibrary', stratId)} 
              />
            )}
            {activeTab === 'admin' && <AdminDashboard setActiveTab={setActiveTab} />}
            {activeTab === 'pricing' && <Pricing setActiveTab={setActiveTab} />}
            {activeTab === 'membership' && <MembershipPage setActiveTab={setActiveTab} />}
            {activeTab === 'audit' && (
              <div className="max-w-4xl mx-auto px-4 mt-8">
                <IntakeWizard selectedPackage={null} />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <BottomNavigation activeTab={activeTab} />

      {/* Premium Footer */}
      <footer id="app-footer" className="relative z-20 border-t border-[#20394B] bg-[#061624] py-12 mt-12 text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <span className="font-display font-bold text-sm tracking-widest text-white uppercase">
                STRATEGY <span className="text-neon-green">AUDIT</span>
              </span>
              <span className="text-[9px] font-mono border border-[#1F2937] px-1.5 py-0.5 rounded text-gray-400">v1.2</span>
            </div>
            <p className="max-w-md text-gray-400 font-sans font-light leading-relaxed">
              Strategy Audit giúp bạn kiểm tra phương pháp giao dịch bằng dữ liệu, hiểu kết quả và biết nên tìm hiểu bước nào tiếp theo.
            </p>
          </div>

          <div className="space-y-4 md:text-right">
            <div className="text-gray-400 leading-relaxed font-sans space-y-1">
              <p className="font-bold text-white text-xs">Hỗ trợ:</p>
              <p><a className="text-neon-green hover:text-white" href="https://t.me/strategyaudit" target="_blank" rel="noreferrer">Nhắn Strategy Audit trên Telegram</a></p>
              <p className="text-[10px] text-gray-500">Tài liệu bản quyền thuộc về Strategy Audit © {new Date().getFullYear()} - Không chia sẻ trái phép.</p>
            </div>
          </div>
        </div>

        {/* Global Risk Disclaimer Box */}
        <div className="max-w-7xl mx-auto px-4 mt-8 pt-8 border-t border-[#1F2937]/30">
          <div className="bg-[#131722]/30 border border-[#1F2937]/30 p-4 rounded-xl text-[10px] leading-relaxed text-gray-600 font-sans">
            <strong className="text-gray-400 font-bold">Lưu ý:</strong> Giao dịch tài chính có rủi ro thua lỗ. Kết quả kiểm tra dựa trên dữ liệu quá khứ và không bảo đảm kết quả trong tương lai. Strategy Audit cung cấp nội dung giáo dục và phân tích dữ liệu, không phải tín hiệu giao dịch hay khuyến nghị đầu tư cá nhân.
          </div>
        </div>
      </footer>

      </div>
    </SmoothScroll>
  );
}
