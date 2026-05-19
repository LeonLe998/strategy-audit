import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, Menu, X } from 'lucide-react';

const Navbar: React.FC = () => {
  const { i18n } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setIsMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#0B0E14]/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <a href="#" className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-[#00FFA3]" />
              <span className="text-xl font-bold tracking-wider text-white">
                Strategy <span className="text-[#00FFA3]">Audit</span>
              </span>
            </a>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-gray-300">
            <a href="#risk" className="hover:text-white transition-colors">Tính Rủi Ro</a>
            <a href="#sop" className="hover:text-white transition-colors">Quy Trình</a>
            <a href="#cases" className="hover:text-white transition-colors">Case Study</a>
            <a href="#pricing" className="hover:text-white transition-colors">Bảng Giá</a>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <div className="flex space-x-2 text-sm font-medium text-gray-400">
              <button onClick={() => changeLanguage('vi')} className={`hover:text-white transition-colors ${i18n.language === 'vi' ? 'text-white' : ''}`}>VN</button>
              <span>|</span>
              <button onClick={() => changeLanguage('en')} className={`hover:text-white transition-colors ${i18n.language === 'en' ? 'text-white' : ''}`}>EN</button>
              <span>|</span>
              <button onClick={() => changeLanguage('zh')} className={`hover:text-white transition-colors ${i18n.language === 'zh' ? 'text-white' : ''}`}>ZH</button>
            </div>
            <a href="#pricing" className="bg-[#00FFA3] text-black font-bold py-2 px-6 rounded-md hover:bg-green-400 transition-all shadow-[0_0_15px_rgba(0,255,163,0.3)] hover:shadow-[0_0_25px_rgba(0,255,163,0.6)]">
              Bắt đầu
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-300 hover:text-white">
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden bg-[#0B0E14] border-b border-white/5 px-4 pt-2 pb-4 space-y-1 shadow-2xl">
          <a href="#risk" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-white/5">Tính Rủi Ro</a>
          <a href="#sop" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-white/5">Quy Trình</a>
          <a href="#cases" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-white/5">Case Study</a>
          <a href="#pricing" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-white/5">Bảng Giá</a>
          
          <div className="pt-4 pb-2 border-t border-white/5">
            <div className="flex space-x-4 px-3 mb-4 text-gray-400">
              <button onClick={() => changeLanguage('vi')} className={i18n.language === 'vi' ? 'text-white font-bold' : ''}>VN</button>
              <button onClick={() => changeLanguage('en')} className={i18n.language === 'en' ? 'text-white font-bold' : ''}>EN</button>
              <button onClick={() => changeLanguage('zh')} className={i18n.language === 'zh' ? 'text-white font-bold' : ''}>ZH</button>
            </div>
            <a href="#pricing" onClick={() => setIsMenuOpen(false)} className="block w-full text-center bg-[#00FFA3] text-black font-bold py-3 rounded-md shadow-[0_0_15px_rgba(0,255,163,0.3)]">
              Bắt đầu
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
