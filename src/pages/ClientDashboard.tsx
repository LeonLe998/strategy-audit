import React from 'react';
import { useTranslation } from 'react-i18next';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Target, TrendingUp, AlertTriangle, Clock } from 'lucide-react';

const mockData = [
  { name: 'Trade 1', inSample: 10000, outOfSample: 10000 },
  { name: 'Trade 20', inSample: 10500, outOfSample: 10200 },
  { name: 'Trade 40', inSample: 10800, outOfSample: 10150 },
  { name: 'Trade 60', inSample: 11200, outOfSample: 10400 },
  { name: 'Trade 80', inSample: 11800, outOfSample: 10600 },
  { name: 'Trade 100', inSample: 12500, outOfSample: 10900 },
];

const ClientDashboard: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="flex-grow bg-background flex">
      {/* Sidebar (simplified for demo) */}
      <div className="hidden md:flex w-64 flex-col border-r border-surface bg-surface/20 p-4">
        <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-4">Active Strategy</div>
        <div className="bg-surface/50 border border-surface rounded-lg p-3 cursor-pointer">
          <div className="text-white font-bold">XAUUSD_EMA34</div>
          <div className="text-alpha text-xs mt-1">Status: Optimized</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <h1 className="text-2xl font-bold text-white mb-6">WFO Audit Report</h1>
        
        {/* Top Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-surface/30 border border-surface rounded-xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Target className="h-16 w-16 text-alpha" />
            </div>
            <div className="text-gray-400 text-sm font-medium mb-1">{t('dashboard.kpi1')}</div>
            <div className="text-3xl font-bold text-alpha">0.75</div>
            <div className="text-xs text-alpha mt-2 bg-alpha/10 inline-block px-2 py-1 rounded">Robust</div>
          </div>
          
          <div className="bg-surface/30 border border-surface rounded-xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <TrendingUp className="h-16 w-16 text-white" />
            </div>
            <div className="text-gray-400 text-sm font-medium mb-1">{t('dashboard.kpi2')}</div>
            <div className="text-3xl font-bold text-white">+$12.50</div>
            <div className="text-xs text-gray-400 mt-2">Per trade average</div>
          </div>
          
          <div className="bg-surface/30 border border-surface rounded-xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <AlertTriangle className="h-16 w-16 text-risk" />
            </div>
            <div className="text-gray-400 text-sm font-medium mb-1">{t('dashboard.kpi3')}</div>
            <div className="text-3xl font-bold text-risk">4.2%</div>
            <div className="text-xs text-gray-400 mt-2">Passes prop firm rules</div>
          </div>
        </div>

        {/* Main Chart */}
        <div className="bg-surface/20 border border-surface rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-white mb-6">{t('dashboard.chartTitle')}</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#39ff14" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#39ff14" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="name" stroke="#666" tick={{fill: '#666'}} />
                <YAxis stroke="#666" tick={{fill: '#666'}} domain={['dataMin - 500', 'dataMax + 500']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#171717', borderColor: '#333', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend />
                <Area type="monotone" dataKey="inSample" name="In-Sample Equity" stroke="#3b82f6" fillOpacity={1} fill="url(#colorIn)" />
                <Area type="monotone" dataKey="outOfSample" name="Out-of-Sample Equity" stroke="#39ff14" fillOpacity={1} fill="url(#colorOut)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Upsell Widget: Strategy Decay Clock */}
        <div className="bg-gradient-to-r from-surface/40 to-surface border border-surface rounded-xl p-6 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="bg-golden/20 p-3 rounded-full mr-4">
              <Clock className="h-8 w-8 text-golden" />
            </div>
            <div>
              <h4 className="text-white font-bold text-lg">{t('dashboard.decayClock')}</h4>
              <p className="text-gray-400 text-sm">Market regime changes detected. Strategy valid for 14 more days.</p>
            </div>
          </div>
          
          <div className="flex-1 max-w-md mx-6 w-full md:w-auto mb-4 md:mb-0">
            <div className="h-2 bg-background rounded-full overflow-hidden">
              <div className="h-full bg-golden w-[60%]"></div>
            </div>
          </div>

          <button className="whitespace-nowrap bg-golden text-black font-bold py-2 px-6 rounded-lg hover:bg-yellow-300 transition-colors">
            {t('dashboard.extend')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
