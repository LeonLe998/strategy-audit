/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { Activity, BookOpen, Users, ClipboardCheck, Settings } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Navbar({ activeTab, setActiveTab }: NavbarProps) {
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
    { id: 'home', label: 'Vì sao cần đo?', icon: Activity },
    { id: 'sauo', label: 'Tự kiểm tra 6 ô', icon: ClipboardCheck },
    { id: 'viplibrary', label: '300 chiến lược', icon: BookOpen },
    { id: 'membership', label: 'Thành viên', icon: Users },
  ];

  return (
    <header id="app-header" className="fixed top-0 left-0 w-full z-50 bg-[#07131E]/95 backdrop-blur-md border-b border-[#20394B]">
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
          <img src="/assets/strategy-audit-logo.png" alt="Strategy Audit" className="h-9 w-auto max-w-[190px] object-contain object-left" />
        </button>

        {/* Desktop Nav Links */}
        <nav id="desktop-nav" className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`flex shrink-0 whitespace-nowrap items-center px-2.5 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                  isActive
                    ? 'text-neon-green bg-[#131722] border border-[#1F2937]'
                    : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* CTA Button, Theme Toggle & Admin Link */}
        <div className="flex items-center space-x-2 md:space-x-3">
          <ThemeToggle variant="desktop" />

          <button
            id="cta-start-audit-nav"
            aria-label="Bắt đầu tự đánh giá miễn phí"
            onClick={() => {
              setActiveTab('sauo');
            }}
            className={`inline-flex relative group shrink-0 whitespace-nowrap items-center gap-1.5 px-2.5 py-2 sm:gap-2 sm:px-3.5 md:px-4 md:py-2 rounded-lg text-[10px] sm:text-xs font-bold tracking-wider uppercase transition-all duration-300 overflow-hidden ${
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
            <span className="sm:hidden">Sáu Ô</span><span className="hidden sm:inline">Tự kiểm tra Sáu Ô</span>
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
    </header>
  );
}
