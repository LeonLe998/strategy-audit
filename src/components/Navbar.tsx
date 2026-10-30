/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { HUB } from '../content/journey';
import { Activity, BookOpen, Users, ClipboardCheck, FileCode, Gamepad2, Settings, Map as MapIcon, FolderOpen, Menu, X } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenCustomInstructions?: () => void;
  onToggleGameMode?: () => void;
}

export default function Navbar({
  activeTab,
  setActiveTab,
  onOpenCustomInstructions,
  onToggleGameMode
}: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showAdminIcon, setShowAdminIcon] = useState<boolean>(() => {
    return localStorage.getItem('quant_show_admin') === 'true';
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'true') {
      localStorage.setItem('quant_show_admin', 'true');
      setShowAdminIcon(true);
      const newUrl = window.location.pathname + window.location.hash;
      window.history.replaceState({}, '', newUrl);
    } else if (params.get('admin') === 'false') {
      localStorage.removeItem('quant_show_admin');
      setShowAdminIcon(false);
      const newUrl = window.location.pathname + window.location.hash;
      window.history.replaceState({}, '', newUrl);
    }
  }, []);

  const navItems = [
    { id: 'home', label: 'Bản đồ', icon: MapIcon },
    { id: 'about', label: 'Vì sao cần đo?', icon: Activity },
    { id: 'sauo', label: 'Tự kiểm tra 6 ô', icon: ClipboardCheck },
    { id: 'viplibrary', label: 'Thư viện 300', icon: BookOpen },
    { id: 'vault', label: 'Hồ sơ nghiên cứu', icon: FolderOpen },
    { id: 'membership', label: 'Thành viên', icon: Users },
  ];

  return (
    <header id="app-header" className="fixed top-0 left-0 w-full z-50 bg-[linear-gradient(180deg,rgba(12,34,52,0.78),rgba(7,19,30,0.72))] backdrop-blur-xl backdrop-saturate-150 shadow-[0_10px_30px_-20px_rgba(43,255,234,0.35)]">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo and Brand */}
        <button
          id="logo-container" 
          type="button"
          className="flex items-center cursor-pointer group bg-transparent border-0 p-0"
          onClick={() => {
            setActiveTab('home');
          }}
        >
          <img src="/assets/strategy-audit-logo.png" alt="Strategy Audit" className="sa-logo-on-dark h-9 w-auto max-w-[190px] object-contain object-left" />
          <img src="/assets/strategy-audit-logo-light.png" alt="" aria-hidden className="sa-logo-on-light h-9 w-auto max-w-[190px] object-contain object-left" />
        </button>

        {/* Desktop Nav Links */}
        <nav id="desktop-nav" className="hidden lg:flex items-center space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`flex shrink-0 whitespace-nowrap items-center px-2 xl:px-2.5 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                  isActive
                    ? 'text-neon-green border border-[#9ff6ff]/30 bg-[linear-gradient(160deg,rgba(43,255,234,0.14),rgba(255,255,255,0.03))] shadow-[0_0_16px_rgba(43,255,234,0.18),inset_0_1px_0_rgba(255,255,255,0.18)]'
                    : 'text-gray-400 hover:text-white hover:bg-white/[0.06] border border-transparent'
                }`}
              >
                <Icon className="hidden xl:block w-4 h-4 mr-1.5" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* CTA Button, Custom Instructions, Game Mode & Theme Toggle */}
        <div className="flex items-center space-x-1.5 sm:space-x-2">
          {/* Custom Instructions Button */}
          {onOpenCustomInstructions && (
            <button
              onClick={onOpenCustomInstructions}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-violet-400 bg-violet-500/10 border border-violet-500/30 hover:bg-violet-500 hover:text-white transition-all flex items-center gap-1.5"
              title="Mở Custom Instructions Engine"
            >
              <FileCode className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">Chỉ dẫn Custom</span>
            </button>
          )}

          {/* Game 3D Button */}
          {onToggleGameMode && (
            <button
              onClick={onToggleGameMode}
              className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-black bg-neon-green hover:bg-emerald-400 transition-all flex items-center gap-1.5 shadow-[0_0_12px_rgba(0,255,163,0.35)]"
              title="Bật Game 3D thám hiểm"
            >
              <Gamepad2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Game 3D</span>
            </button>
          )}

          <ThemeToggle variant="desktop" />

          <button
            id="cta-start-audit-nav"
            aria-label="Bắt đầu tự đánh giá miễn phí"
            onClick={() => {
              setActiveTab('sauo');
            }}
            className={`inline-flex relative group shrink-0 whitespace-nowrap items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg text-[10px] sm:text-xs font-bold tracking-wider uppercase transition-all duration-300 overflow-hidden ${
              activeTab === 'sauo'
                ? 'bg-neon-green text-black shadow-[0_0_15px_rgba(0,255,163,0.4)]'
                : 'bg-neon-green/10 text-neon-green border border-neon-green/40 hover:bg-neon-green hover:text-black'
            }`}
          >
            <span className="relative hidden sm:flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-neon-green opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-neon-green"></span>
            </span>
            <ClipboardCheck className="w-3.5 h-3.5 shrink-0" />
            <span className="xl:hidden">6 ô</span><span className="hidden xl:inline">Tự kiểm tra 6 ô</span>
          </button>

          {/* Dưới lg: menu đầy đủ mọi trang (menu dưới của điện thoại chỉ có 4 mục) */}
          <button
            type="button"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Đóng menu' : 'Mở menu tất cả các trang'}
            onClick={() => setMenuOpen((v) => !v)}
            className="sa-glass-ghost lg:hidden rounded-lg p-2 text-gray-200"
          >
            {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>

          {showAdminIcon && (
            <button 
              onClick={() => {
                setActiveTab('admin');
              }}
              className="text-gray-400 hover:text-white transition-colors p-1"
              title="System Admin"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      <div aria-hidden className="sa-glow-line absolute inset-x-0 bottom-0 h-px opacity-70" />
      {menuOpen && (
        <nav aria-label="Tất cả các trang" className="sa-glass-dark lg:hidden absolute right-3 top-[calc(100%+6px)] w-60 rounded-2xl p-1.5">
          {[{ tab: 'home', label: 'Bản đồ' }, ...HUB.islands.map((s) => ({ tab: s.tab, label: s.title }))].map((m) => (
            <button
              key={m.tab}
              type="button"
              onClick={() => {
                setMenuOpen(false);
                setActiveTab(m.tab);
              }}
              className={`block w-full rounded-xl px-3 py-2.5 text-left text-sm ${activeTab === m.tab ? 'bg-[#2BFFEA]/12 text-[#2BFFEA]' : 'text-gray-200 hover:bg-white/5'}`}
            >
              {m.label}
            </button>
          ))}
        </nav>
      )}
    </header>
  );
}
