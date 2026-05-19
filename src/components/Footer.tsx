import React from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldAlert, Send, LifeBuoy } from 'lucide-react';

const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-surface/50 border-t border-surface mt-auto py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-white font-bold text-lg mb-4 tracking-wide">
              Strategy <span className="text-alpha">Audit</span>
            </h3>
            <p className="text-gray-400 text-sm">
              Institutional grade auditing & Walk-Forward Optimization.
            </p>
          </div>
          <div className="flex flex-col space-y-3">
            <a href="#" className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors">
              <Send className="h-4 w-4" />
              <span>{t('footer.telegram')}</span>
            </a>
            <a href="#" className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors">
              <LifeBuoy className="h-4 w-4" />
              <span>{t('footer.support')}</span>
            </a>
          </div>
          <div>
             {/* Empty column for layout balance, or can put social icons here */}
          </div>
        </div>
        
        <div className="pt-8 border-t border-gray-800">
          <div className="flex items-start space-x-3 text-xs text-gray-500 bg-black/40 p-4 rounded-lg border border-risk/20">
            <ShieldAlert className="h-5 w-5 text-risk flex-shrink-0" />
            <p>
              <span className="font-bold text-risk uppercase block mb-1">Risk Disclaimer</span>
              {t('footer.disclaimer')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
