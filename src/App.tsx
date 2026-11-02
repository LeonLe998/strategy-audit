/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Navbar from './components/Navbar';
import AmbientBackground from './components/SoftBackdrop';
import BottomNavigation from './components/BottomNavigation';
import NextStep from './components/NextStep';
import NotFound from './components/NotFound';
import ContactLinks from './components/ContactLinks';
import { ScrollAnimationEngine } from './components/ScrollAnimationEngine';

// Trang nặng (three.js, recharts, html2pdf, markdown) chỉ tải khi mở tới
const IslandHub3D = lazy(() => import('./game/world/IslandHub3D'));
// Các trang chỉ tải khi khách mở tới: gói chính nhẹ đi, bản đồ trang chủ hiện nhanh hơn
const Home = lazy(() => import('./components/HomeStitch'));
const MembershipPage = lazy(() => import('./pages/MembershipPage'));
const SauO = lazy(() => import('./pages/SauOStitch'));
const CustomInstructionsPanel = lazy(() => import('./components/CustomInstructionsPanel').then((m) => ({ default: m.CustomInstructionsPanel })));
const Vault = lazy(() => import('./components/Vault'));
const VIPLibrary = lazy(() => import('./pages/VIPLibrary'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const StartHerePage = lazy(() => import('./pages/StartHerePage'));

const PageLoading = () => <div className="py-24 text-center text-sm text-gray-500">Đang tải…</div>;
const HubLoading = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-[#040914] text-sm text-gray-400">Đang dựng bản đồ…</div>
);

/** Trang chủ là bản đồ đảo 3D; máy không chạy được WebGL thì trang chủ là bản đọc */
const CAN_3D = (() => {
  if (typeof window === 'undefined') return false;
  try {
    const c = document.createElement('canvas');
    return Boolean(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
})();

/** Trang cũ đã ẩn khỏi web (Leon duyệt 30/10). Link cũ khách còn giữ sẽ chuyển về trang hiện tại gần nhất. */
const LEGACY: Record<string, string> = {
  pricing: 'membership',
  services: 'membership',
  audit: 'sauo',
  datascience: 'vault',
};

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
  if (pLower === '/gioi-thieu' || pLower === '/about') {
    return { tab: 'about', subId: null, isSauO: false };
  }
  if (pLower === '/datascience' || pLower === '/math' || pLower === '/toan-hoc' || pLower === '/khoa-hoc-du-lieu') {
    return { tab: LEGACY.datascience, subId: null, isSauO: false };
  }
  if (pLower === '/membership' || pLower === '/thanh-vien') {
    return { tab: 'membership', subId: null, isSauO: false };
  }
  if (pLower === '/services' || pLower === '/dich-vu') {
    return { tab: LEGACY.services, subId: null, isSauO: false };
  }
  if (pLower === '/pricing' || pLower === '/bang-gia') {
    return { tab: LEGACY.pricing, subId: null, isSauO: false };
  }
  if (pLower === '/audit' || pLower === '/bat-dau' || pLower === '/kiem-dinh' || pLower === '/wizard') {
    return { tab: LEGACY.audit, subId: null, isSauO: true };
  }
  if (pLower === '/hanh-trinh' || pLower === '/journey') {
    return { tab: 'journey', subId: null, isSauO: false };
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
    const tab = LEGACY[queryTab] ?? queryTab;
    return { tab, subId: null, isSauO: tab === 'sauo' };
  }

  // Đường dẫn lạ: báo không tìm thấy thay vì âm thầm đưa về bản đồ
  if (pathname !== '/' && pLower !== '/index.html') {
    return { tab: 'notfound', subId: null, isSauO: false };
  }
  return { tab: 'home', subId: null, isSauO: false };
}

function getPathForRoute(tab: string, subId?: string | null): string {
  switch (tab) {
    case 'home':
      return '/';
    case 'about':
      return '/gioi-thieu';
    case 'membership':
      return '/membership';
    case 'admin':
      return '/admin';
    case 'journey':
      return '/hanh-trinh';
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
  const [isCustomInstructionsOpen, setIsCustomInstructionsOpen] = useState<boolean>(false);

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
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
    setRouteInfo({
      tab,
      subId,
      isSauO: tab === 'sauo'
    });
  };

  useEffect(() => {
    const path = getPathForRoute(routeInfo.tab, routeInfo.subId);
    if (routeInfo.tab !== 'notfound' && routeInfo.tab !== 'home' && window.location.pathname.replace(/\/$/, '') !== path) {
      window.history.replaceState(null, '', path + window.location.search);
    }
  }, []);

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

  // Trang chủ: bản đồ đảo toàn màn hình, tự có menu tới các trang
  if (activeTab === 'home' && CAN_3D) {
    return (
      <Suspense fallback={<HubLoading />}>
        <IslandHub3D onNavigate={setActiveTab} />
      </Suspense>
    );
  }

  // Nếu đang ở đường dẫn /sauo, hiển thị trang Sáu Ô độc lập (chuẩn phễu mobile)
  if (routeInfo.isSauO || activeTab === 'sauo') {
    return (
      <Suspense fallback={<PageLoading />}>
        <SauO />
      </Suspense>
    );
  }

  return (
    <div id="quant-app-container" className="min-h-screen bg-[#061624] text-gray-300 relative font-sans antialiased overflow-x-hidden selection:bg-emerald-500 selection:text-white dark:selection:bg-neon-green dark:selection:text-black transition-colors duration-300">
      
      {/* Scroll-Driven Animation Engine (Progress bar, Scroll-to-top button) */}
      <ScrollAnimationEngine isGameMode={false} />

      {/* Dynamic Animated Ambient Background */}
      <AmbientBackground />

      {/* Main navigation header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Custom Instructions Panel Modal */}
      {isCustomInstructionsOpen && (
        <Suspense fallback={null}>
          <CustomInstructionsPanel isOpen onClose={() => setIsCustomInstructionsOpen(false)} />
        </Suspense>
      )}

      {/* Primary body view holder with smooth route animations */}
      <main id="app-main-content" className={`relative z-10 ${activeTab === 'home' || activeTab === 'about' ? 'pt-16' : 'pt-24'} min-h-[calc(100vh-16rem)]`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="w-full"
          >
            <Suspense fallback={<PageLoading />}>
            {(activeTab === 'about' || activeTab === 'home') && (
              <Home
                setActiveTab={setActiveTab}
                activeSectionIndex={0}
              />
            )}
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
            {activeTab === 'journey' && <StartHerePage onGo={setActiveTab} />}
            {activeTab === 'notfound' && <NotFound onGo={setActiveTab} />}
            {activeTab === 'membership' && <MembershipPage setActiveTab={setActiveTab} />}
              {/* Nằm trong Suspense: chỉ hiện khi trang đã tải xong, không trơ trọi dưới chữ "Đang tải…" */}
              {activeTab !== 'admin' && activeTab !== 'notfound' && <NextStep tab={activeTab} onGo={setActiveTab} />}
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </main>

      <BottomNavigation activeTab={activeTab} />

      {/* Premium Footer */}
      <footer id="app-footer" className="relative z-20 bg-[linear-gradient(180deg,#071a29,#040e18)] py-12 mt-12 text-xs text-gray-500">
        <div aria-hidden className="sa-glow-line absolute inset-x-0 top-0 h-px opacity-60" />
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <span className="font-display font-bold text-sm tracking-widest text-white uppercase">
                STRATEGY <span className="text-neon-green">AUDIT</span>
              </span>
              
            </div>
            <p className="max-w-md text-gray-400 font-sans font-light leading-relaxed">
              Strategy Audit kiểm định phương pháp giao dịch bằng dữ liệu: 300 chiến lược đưa vào thư viện, 242 kiểm định đầy đủ trên 22 năm dữ liệu vàng.
            </p>
          </div>

          <div className="space-y-4 md:text-right">
            <div className="text-gray-400 leading-relaxed font-sans space-y-1">
              <p className="font-bold text-white text-xs">Hỗ trợ & Đăng ký:</p>
              <ContactLinks from="footer" className="md:justify-end" />
              <p className="text-[10px] text-gray-500">© {new Date().getFullYear()} Leon · Strategy Audit. Không chia sẻ trái phép.</p>
            </div>
          </div>
        </div>

        {/* Global Risk Disclaimer Box */}
        <div className="max-w-7xl mx-auto px-4 mt-8 pt-8 border-t border-[#1F2937]/30">
          <div className="sa-glass p-4 rounded-xl text-[10px] leading-relaxed text-gray-500 font-sans">
            <strong className="text-gray-400 font-bold">Lưu ý:</strong> Giao dịch tài chính có rủi ro thua lỗ. Kết quả kiểm tra dựa trên dữ liệu quá khứ và không bảo đảm kết quả trong tương lai. Strategy Audit cung cấp nội dung giáo dục, phân tích dữ liệu định lượng, không phải tín hiệu giao dịch hay khuyến nghị đầu tư cá nhân.
          </div>
        </div>
      </footer>

    </div>
  );
}
