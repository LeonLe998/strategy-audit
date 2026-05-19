import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Settings2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const IntakeWizard: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  // Form State
  const [pair, setPair] = useState('XAUUSD');
  const [timeframe, setTimeframe] = useState('H1');
  const [indicator, setIndicator] = useState('EMA 34');
  const [risk, setRisk] = useState(1);
  const [drawdown, setDrawdown] = useState(5);

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else {
      // Simulate submission & navigation to dashboard
      navigate('/dashboard');
    }
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="flex-grow flex items-center justify-center p-4 py-20 bg-background">
      <div className="max-w-2xl w-full bg-surface/40 border border-surface rounded-2xl shadow-2xl p-8 relative overflow-hidden">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 h-1 bg-surface w-full">
          <div 
            className="h-full bg-alpha transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          ></div>
        </div>

        <div className="flex items-center justify-between mb-8 pb-6 border-b border-surface">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center">
              <Settings2 className="mr-2 h-6 w-6 text-alpha" />
              Quant Intake Form
            </h2>
            <p className="text-gray-400 text-sm mt-1">Define your exact mathematical parameters</p>
          </div>
          <div className="text-alpha font-mono bg-alpha/10 px-3 py-1 rounded">
            Step {step}/3
          </div>
        </div>

        <div className="min-h-[250px]">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h3 className="text-xl text-white font-semibold mb-4">{t('wizard.step1')}</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">{t('wizard.pair')}</label>
                    <select 
                      value={pair} 
                      onChange={(e) => setPair(e.target.value)}
                      className="w-full bg-background border border-surface rounded-lg p-3 text-white focus:border-alpha focus:ring-1 focus:ring-alpha outline-none appearance-none"
                    >
                      <option value="XAUUSD">XAUUSD (Gold)</option>
                      <option value="EURUSD">EURUSD</option>
                      <option value="GBPUSD">GBPUSD</option>
                      <option value="BTCUSDT">BTCUSDT</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">{t('wizard.tf')}</label>
                    <select 
                      value={timeframe} 
                      onChange={(e) => setTimeframe(e.target.value)}
                      className="w-full bg-background border border-surface rounded-lg p-3 text-white focus:border-alpha focus:ring-1 focus:ring-alpha outline-none appearance-none"
                    >
                      <option value="M15">M15</option>
                      <option value="H1">H1</option>
                      <option value="H4">H4</option>
                      <option value="D1">D1</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h3 className="text-xl text-white font-semibold mb-4">{t('wizard.step2')}</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">{t('wizard.indicators')}</label>
                    <select 
                      value={indicator} 
                      onChange={(e) => setIndicator(e.target.value)}
                      className="w-full bg-background border border-surface rounded-lg p-3 text-white focus:border-alpha focus:ring-1 focus:ring-alpha outline-none appearance-none"
                    >
                      <option value="EMA 34">EMA 34 Crossover</option>
                      <option value="RSI 14">RSI 14 Divergence</option>
                      <option value="MACD">MACD Default</option>
                      <option value="Bollinger">Bollinger Bands Breakout</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-background border border-surface rounded-lg">
                    <div>
                      <div className="text-white font-medium">Price Action Filter</div>
                      <div className="text-xs text-gray-500">Require engulfing or pinbar</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-surface peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-alpha"></div>
                    </label>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h3 className="text-xl text-white font-semibold mb-4">{t('wizard.step3')}</h3>
                <div className="space-y-8">
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm font-medium text-gray-400">{t('wizard.risk')}</label>
                      <span className="text-alpha font-bold">{risk}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0.1" 
                      max="5" 
                      step="0.1"
                      value={risk} 
                      onChange={(e) => setRisk(parseFloat(e.target.value))}
                      className="w-full h-2 bg-surface rounded-lg appearance-none cursor-pointer accent-alpha"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm font-medium text-gray-400">{t('wizard.drawdown')}</label>
                      <span className="text-risk font-bold">{drawdown}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="1" 
                      max="20" 
                      step="1"
                      value={drawdown} 
                      onChange={(e) => setDrawdown(parseFloat(e.target.value))}
                      className="w-full h-2 bg-surface rounded-lg appearance-none cursor-pointer accent-risk"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex justify-between mt-10 pt-6 border-t border-surface">
          <button 
            onClick={handlePrev}
            disabled={step === 1}
            className={`flex items-center px-4 py-2 rounded-md transition-colors ${step === 1 ? 'text-gray-600 cursor-not-allowed' : 'text-gray-300 hover:text-white hover:bg-surface'}`}
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> {t('wizard.prev')}
          </button>
          <button 
            onClick={handleNext}
            className="flex items-center bg-white text-black px-6 py-2 rounded-md font-bold hover:bg-gray-200 transition-colors"
          >
            {step === 3 ? t('wizard.submit') : t('wizard.next')} <ChevronRight className="h-4 w-4 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default IntakeWizard;
