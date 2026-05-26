import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, Menu, X } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Navbar: React.FC = () => {
  const { i18n } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setIsMenuOpen(false);
  };

  const handleNavClick = (id: string) => {
    setIsMenuOpen(false);
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#0B0E14]/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <Link to="/" className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-[#00FFA3]" />
              <span className="text-xl font-bold tracking-wider text-white">
                Strategy <span className="text-[#00FFA3]">Audit</span>
              </span>
            </Link>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-gray-300">
            <button type="button" onClick={() => handleNavClick('home')} className="hover:text-white transition-colors">Trang chủ</button>
            <button type="button" onClick={() => handleNavClick('workflow')} className="hover:text-white transition-colors">Dịch vụ</button>
            <Link to="/library" className={`transition-colors ${location.pathname === '/library' ? 'text-[#00FFA3]' : 'hover:text-white'}`}>Thư Viện Tài Liệu</Link>
            <button type="button" onClick={() => handleNavClick('pricing')} className="hover:text-white transition-colors">Bảng Giá</button>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <div className="flex space-x-2 text-sm font-medium text-gray-400">
              <button onClick={() => changeLanguage('vi')} className={`hover:text-white transition-colors ${i18n.language === 'vi' ? 'text-white' : ''}`}>VN</button>
              <span>|</span>
              <button onClick={() => changeLanguage('en')} className={`hover:text-white transition-colors ${i18n.language === 'en' ? 'text-white' : ''}`}>EN</button>
              <span>|</span>
              <button onClick={() => changeLanguage('zh')} className={`hover:text-white transition-colors ${i18n.language === 'zh' ? 'text-white' : ''}`}>ZH</button>
            </div>
            <button type="button" onClick={() => handleNavClick('audit-form')} className="bg-[#00FFA3] text-black font-bold py-2 px-6 rounded-md hover:bg-green-400 transition-all shadow-[0_0_15px_rgba(0,255,163,0.3)] hover:shadow-[0_0_25px_rgba(0,255,163,0.6)]">
              Bắt đầu
            </button>
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
          <button type="button" onClick={() => handleNavClick('home')} className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-white/5">Trang chủ</button>
          <button type="button" onClick={() => handleNavClick('workflow')} className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-white/5">Dịch vụ</button>
          <Link to="/library" onClick={() => setIsMenuOpen(false)} className={`w-full text-left block px-3 py-2 rounded-md text-base font-medium ${location.pathname === '/library' ? 'text-[#00FFA3]' : 'text-gray-300 hover:text-white hover:bg-white/5'}`}>Thư Viện Tài Liệu</Link>
          <button type="button" onClick={() => handleNavClick('pricing')} className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-white/5">Bảng Giá</button>
          
          <div className="pt-4 pb-2 border-t border-white/5">
            <div className="flex space-x-4 px-3 mb-4 text-gray-400">
              <button onClick={() => changeLanguage('vi')} className={i18n.language === 'vi' ? 'text-white font-bold' : ''}>VN</button>
              <button onClick={() => changeLanguage('en')} className={i18n.language === 'en' ? 'text-white font-bold' : ''}>EN</button>
              <button onClick={() => changeLanguage('zh')} className={i18n.language === 'zh' ? 'text-white font-bold' : ''}>ZH</button>
            </div>
            <button type="button" onClick={() => handleNavClick('audit-form')} className="block w-full text-center bg-[#00FFA3] text-black font-bold py-3 rounded-md shadow-[0_0_15px_rgba(0,255,163,0.3)]">
              Bắt đầu
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
