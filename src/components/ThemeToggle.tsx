import { motion, AnimatePresence } from 'motion/react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  variant?: 'desktop' | 'mobile';
  id?: string;
}

export default function ThemeToggle({ className = '', variant = 'desktop', id }: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();

  if (variant === 'mobile') {
    return (
      <div 
        id={id || 'theme-toggle-mobile'} 
        className={`flex items-center justify-between px-4 py-3 rounded-xl border border-[#1F2937] bg-[#131722] ${className}`}
      >
        <div className="flex items-center space-x-3 text-sm font-medium">
          {resolvedTheme === 'dark' ? (
            <Moon className="w-4 h-4 text-neon-green" />
          ) : (
            <Sun className="w-4 h-4 text-amber-500" />
          )}
          <span className="text-gray-300">Giao diện</span>
        </div>
        <div className="flex items-center bg-[#0B0E14] p-1 rounded-lg border border-[#1F2937] space-x-1">
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-all flex items-center space-x-1.5 ${
              theme === 'light'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
            title="Giao diện Sáng"
          >
            <Sun className="w-3.5 h-3.5" />
            <span>Sáng</span>
          </button>
          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-all flex items-center space-x-1.5 ${
              theme === 'dark'
                ? 'bg-neon-green/20 text-neon-green border border-neon-green/40 shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
            title="Giao diện Tối"
          >
            <Moon className="w-3.5 h-3.5" />
            <span>Tối</span>
          </button>
          <button
            type="button"
            onClick={() => setTheme('system')}
            className={`px-2 py-1 rounded text-xs font-medium transition-all ${
              theme === 'system'
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                : 'text-gray-400 hover:text-white'
            }`}
            title="Tự động theo hệ thống"
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // Desktop variant: Quick-toggle icon button with smooth animation
  const isDark = resolvedTheme === 'dark';

  return (
    <div className={`relative flex items-center ${className}`}>
      <button
        id={id || 'theme-toggle-btn'}
        type="button"
        onClick={toggleTheme}
        className="relative p-2 rounded-lg border border-[#1F2937] bg-[#131722] hover:bg-[#1c2233] hover:border-gray-700 text-gray-300 hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-neon-green/30"
        title={isDark ? 'Chuyển sang giao diện Sáng (Light Mode)' : 'Chuyển sang giao diện Tối (Dark Mode)'}
        aria-label={isDark ? 'Chuyển sang giao diện Sáng' : 'Chuyển sang giao diện Tối'}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.div
              key="moon"
              initial={{ rotate: -45, opacity: 0, scale: 0.7 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 45, opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.2 }}
            >
              <Moon className="w-4 h-4 text-gray-300 hover:text-neon-green transition-colors" />
            </motion.div>
          ) : (
            <motion.div
              key="sun"
              initial={{ rotate: 45, opacity: 0, scale: 0.7 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: -45, opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.2 }}
            >
              <Sun className="w-4 h-4 text-amber-500 hover:text-amber-600 transition-colors" />
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    </div>
  );
}
