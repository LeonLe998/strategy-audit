/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Activity, ShieldAlert, BookOpen, Layers, Play } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Navbar({ activeTab, setActiveTab }: NavbarProps) {
  const navItems = [
    { id: 'home', label: 'Trang chủ', icon: Activity },
    { id: 'services', label: 'Dịch vụ', icon: Layers },
    { id: 'vault', label: 'Thư Viện Tài Liệu', icon: BookOpen },
    { id: 'pricing', label: 'Bảng Giá', icon: ShieldAlert },
  ];

  return (
    <header id="app-header" className="fixed top-0 left-0 w-full z-50 bg-[#0B0E14]/80 backdrop-blur-md border-b border-[#1F2937]/50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo and Brand */}
        <div 
          id="logo-container" 
          className="flex items-center space-x-2 cursor-pointer group"
          onClick={() => setActiveTab('home')}
        >
          <div className="relative">
            <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-neon-green to-coral-red opacity-30 blur group-hover:opacity-70 transition duration-300"></div>
            <div className="relative w-8 h-8 rounded-lg bg-[#131722] border border-[#1F2937] flex items-center justify-center font-mono text-neon-green font-bold text-sm">
              SΩ
            </div>
          </div>
          <span className="font-display font-medium text-lg tracking-wider text-white">
            STRATEGY <span className="text-neon-green font-black">AUDIT</span>
            <span className="text-[10px] align-super text-coral-red font-mono ml-0.5">™</span>
          </span>
        </div>

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
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium tracking-wide transition-all uppercase duration-200 ${
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

        {/* CTA Button */}
        <button
          id="cta-start-audit-nav"
          onClick={() => setActiveTab('audit')}
          className={`relative group px-5 py-2.5 rounded-lg text-xs font-bold tracking-wider uppercase transition-all duration-300 overflow-hidden ${
            activeTab === 'audit'
              ? 'bg-neon-green text-black shadow-[0_0_15px_rgba(0,255,163,0.3)]'
              : 'bg-black text-neon-green border border-neon-green/30 hover:border-neon-green/80 hover:bg-[#00FFA3]/5'
          }`}
        >
          <div className="relative z-10 flex items-center space-x-2">
            <Play className="w-3 h-3 fill-current shrink-0" />
            <span>Bắt đầu</span>
          </div>
        </button>
      </div>
    </header>
  );
}
