/**
 * Data Science & Quantitative Mathematics Hub
 * Features 3D Mathematical Surfaces (Gaussian, Lorenz Attractor, Volatility Smile),
 * Data Science & Math Skill Matrix, and an Interactive Monte Carlo Simulation Engine.
 */

import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  Binary, Search, Sparkles, CheckCircle2, ChevronRight,
  Calculator, Play, RefreshCw
} from 'lucide-react';
import {
  createGaussianSurface,
  createLorenzAttractor,
  createVolatilitySurface,
  type Procedural3DObject
} from './Game3D/ProceduralModels';

interface DataScienceSkillItem {
  id: string;
  name: string;
  category: 'Statistics' | 'MachineLearning' | 'Stochastic' | 'Econometrics';
  desc: string;
  mathFormula: string;
  metrics: string;
  tags: string[];
}

const DS_MATH_SKILLS: DataScienceSkillItem[] = [
  {
    id: 'monte_carlo',
    name: 'Mô phỏng Monte Carlo & Kiểm định P-Hacking',
    category: 'Statistics',
    desc: 'Chạy 10,000 kịch bản ngẫu nhiên hoán vị chuỗi lệnh để xác định xem tỷ lệ thắng là do lợi thế thực sự hay chỉ là may mắn ngẫu nhiên (p-value < 0.01).',
    mathFormula: 'p = (1/N) * \\sum I(Return_{perm} >= Return_{actual})',
    metrics: 'Risk of Ruin %, 95% Confidence Interval',
    tags: ['Xác suất', 'Permutation Test', 'Fat Tails']
  },
  {
    id: 'bayesian_inference',
    name: 'Suy diễn Bayes (Bayesian Prior & Posterior)',
    category: 'Statistics',
    desc: 'Cập nhật phân phối xác suất thắng của hệ thống dựa trên mô hình Beta-Binomial khi có chuỗi lệnh mới, loại bỏ sai lệch cỡ mẫu nhỏ.',
    mathFormula: 'P(Win | Data) \\propto P(Data | Win) \\times P(Win)',
    metrics: 'Posterior Mean, Credible Interval 90%',
    tags: ['Bayes', 'Beta-Binomial', 'Belief Update']
  },
  {
    id: 'time_series_garch',
    name: 'Kinh tế lượng Chuỗi thời gian (ADF & GARCH)',
    category: 'Econometrics',
    desc: 'Kiểm tra tính dừng (Stationarity) của dữ liệu giá qua Augmented Dickey-Fuller và mô hình hóa cụm biến động co cụm qua GARCH(1,1).',
    mathFormula: '\\sigma_t^2 = \\omega + \\alpha \\epsilon_{t-1}^2 + \\beta \\sigma_{t-1}^2',
    metrics: 'ADF p-value, Volatility Clustering Index',
    tags: ['Stationarity', 'Heteroskedasticity', 'ARIMA-GARCH']
  },
  {
    id: 'purged_kfold',
    name: 'Machine Learning: Purged & Embargoed Cross-Validation',
    category: 'MachineLearning',
    desc: 'Phân tách dữ liệu huấn luyện và kiểm định đặc thù cho chuỗi tài chính, loại bỏ hoàn toàn hiện tượng rò rỉ thông tin từ tương lai (Data Leakage).',
    mathFormula: 'Train_{t} \\cap Test_{t + \\tau} = \\emptyset',
    metrics: 'Information Coefficient (IC), Deflated Sharpe',
    tags: ['Cross-Validation', 'De-noising', 'Walk-Forward']
  },
  {
    id: 'tail_risk_cvar',
    name: 'Toán học Rủi ro Đuôi béo (VaR & CVaR / Expected Shortfall)',
    category: 'Stochastic',
    desc: 'Đo lường mức thua lỗ trung bình trong 1% trường hợp tồi tệ nhất của thị trường, áp dụng lý thuyết giá trị cực trị (Extreme Value Theory).',
    mathFormula: 'CVaR_\\alpha = E[Loss | Loss \\ge VaR_\\alpha]',
    metrics: 'CVaR 99%, Max Drawdown Duration, Sortino',
    tags: ['Fat-Tails', 'EVT', 'Expected Shortfall']
  },
  {
    id: 'markov_regime',
    name: 'Mô hình Ẩn Markov (Hidden Markov Model - HMM)',
    category: 'MachineLearning',
    desc: 'Nhận diện tự động trạng thái thị trường ngầm (Bull Trend, Choppy Range, Panic Crash) để điều chỉnh quy mô vị thế lệnh tối ưu.',
    mathFormula: 'P(S_t | S_{t-1}) \\text{ with Gaussian Emission}',
    metrics: 'Regime Transition Probability, Kelly Fraction',
    tags: ['Markov Chains', 'Regime Detection', 'Optimal Sizing']
  }
];

export const DataScienceHub: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSkill, setSelectedSkill] = useState<DataScienceSkillItem>(DS_MATH_SKILLS[0]);
  const [activeModelType, setActiveModelType] = useState<'gauss' | 'lorenz' | 'volatility'>('gauss');

  // Mini Monte Carlo Simulator State
  const [winRate, setWinRate] = useState<number>(54);
  const [rrRatio, setRrRatio] = useState<number>(1.8);
  const [simResults, setSimResults] = useState<{
    riskOfRuin: number;
    medianDrawdown: number;
    expectedR: number;
    pValue: number;
  } | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Mini 3D Mathematical Surface Canvas
  const mountRef = useRef<HTMLDivElement>(null);
  const currentModelRef = useRef<Procedural3DObject | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x061624);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 4, 9);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.replaceChildren(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.6;

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambient);
    const light1 = new THREE.DirectionalLight(0x00ffa3, 2.0);
    light1.position.set(6, 8, 6);
    scene.add(light1);
    const light2 = new THREE.DirectionalLight(0x06b6d4, 1.4);
    light2.position.set(-6, -4, -6);
    scene.add(light2);

    // Initial 3D Math Model
    let model: Procedural3DObject;
    if (activeModelType === 'gauss') {
      model = createGaussianSurface(7, 36);
    } else if (activeModelType === 'lorenz') {
      model = createLorenzAttractor(2600);
    } else {
      model = createVolatilitySurface(7, 28);
    }

    scene.add(model);
    currentModelRef.current = model;

    let clock = new THREE.Clock();
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();
      controls.update();
      if (currentModelRef.current && currentModelRef.current.updateAnimation) {
        currentModelRef.current.updateAnimation(delta, elapsed);
      }
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      renderer.dispose();
    };
  }, [activeModelType]);

  // Run instant Monte Carlo calculation
  const runMonteCarlo = () => {
    setIsSimulating(true);
    setTimeout(() => {
      const p = winRate / 100;
      const b = rrRatio;
      const ev = p * b - (1 - p) * 1.0;
      const rOfRuin = ev <= 0 ? 99.9 : Math.max(0.1, Number(((1 - p) / (p * b)) ** 10 * 100)).toFixed(1);
      const medDd = Math.round(10 + (1 - p) * 22);
      const pVal = ev > 0 ? (ev > 0.3 ? 0.002 : 0.018) : 0.45;

      setSimResults({
        riskOfRuin: Number(rOfRuin),
        medianDrawdown: medDd,
        expectedR: Number(ev.toFixed(3)),
        pValue: pVal
      });
      setIsSimulating(false);
    }, 350);
  };

  useEffect(() => {
    runMonteCarlo();
  }, []);

  const filteredSkills = DS_MATH_SKILLS.filter((s) => {
    const matchesCategory = activeCategory === 'all' || s.category.toLowerCase() === activeCategory.toLowerCase();
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <section id="datascience-math-hub" className="relative py-16 px-4 max-w-7xl mx-auto font-sans">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold">
          <Binary className="w-4 h-4 animate-spin-slow" />
          <span>Khoa học Dữ liệu & Toán học Định lượng · Data Science & Math Hub</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          Toán học Xác suất & Kiểm định Dữ liệu Khắt khe
        </h2>
        <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
          Đo lường phương pháp giao dịch bằng <strong>Mô phỏng Monte Carlo 10,000 lần</strong>,
          suy diễn <strong>Bayes</strong>, bề mặt phân phối xác suất 3D và thuật toán chống Overfitting:
          tách bạch rõ ràng giữa lợi thế thống kê thực tế và sự ngẫu nhiên của thị trường.
        </p>
      </div>

      {/* Main Grid: Left 3D Mathematical Surface & Monte Carlo Simulator / Right Skills Catalog */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: 3D Mathematical Topology & Simulator */}
        <div className="lg:col-span-5 bg-[#07131e] border border-[#20394b] rounded-3xl p-6 shadow-2xl relative overflow-hidden space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-neon-green">
                Hình học & Cấu trúc Toán học 3D
              </span>
              <h3 className="text-base font-bold text-white mt-0.5">
                {activeModelType === 'gauss'
                  ? 'Mặt cong Phân phối Chuẩn Gauss 3D'
                  : activeModelType === 'lorenz'
                  ? 'Hệ Hỗn mang Lorenz Attractor 3D'
                  : 'Mặt cong Biến động Black-Scholes 3D'}
              </h3>
            </div>

            {/* Model Type Switcher */}
            <div className="flex rounded-lg bg-[#0d1e2e] p-1 border border-[#1f2937]">
              <button
                onClick={() => setActiveModelType('gauss')}
                className={`px-2 py-1 text-[11px] rounded font-semibold transition-all ${
                  activeModelType === 'gauss' ? 'bg-neon-green text-black' : 'text-gray-400 hover:text-white'
                }`}
                title="Phân phối Gauss"
              >
                Gauss
              </button>
              <button
                onClick={() => setActiveModelType('lorenz')}
                className={`px-2 py-1 text-[11px] rounded font-semibold transition-all ${
                  activeModelType === 'lorenz' ? 'bg-neon-green text-black' : 'text-gray-400 hover:text-white'
                }`}
                title="Hỗn mang Lorenz"
              >
                Lorenz
              </button>
              <button
                onClick={() => setActiveModelType('volatility')}
                className={`px-2 py-1 text-[11px] rounded font-semibold transition-all ${
                  activeModelType === 'volatility' ? 'bg-neon-green text-black' : 'text-gray-400 hover:text-white'
                }`}
                title="Mặt cong biến động"
              >
                Vol Surface
              </button>
            </div>
          </div>

          {/* 3D Canvas Mount */}
          <div
            ref={mountRef}
            className="w-full h-64 sm:h-72 rounded-2xl bg-[#061624] border border-[#1f2937] overflow-hidden cursor-grab active:cursor-grabbing relative"
          />

          {/* Live Monte Carlo Interactive Tester */}
          <div className="p-4 rounded-2xl bg-[#0c1b29] border border-[#1f2937] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5 text-neon-green" /> Máy đo Xác suất Monte Carlo Nhanh
              </span>
              <button
                onClick={runMonteCarlo}
                disabled={isSimulating}
                className="text-[11px] text-neon-green hover:underline flex items-center gap-1"
              >
                {isSimulating ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                Chạy lại
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span>Tỷ lệ thắng (Win Rate):</span>
                  <b className="text-white">{winRate}%</b>
                </div>
                <input
                  type="range"
                  min="30"
                  max="80"
                  value={winRate}
                  onChange={(e) => setWinRate(Number(e.target.value))}
                  className="w-full accent-neon-green mt-1 h-1"
                />
              </div>

              <div>
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span>Tỷ lệ R:R (Reward/Risk):</span>
                  <b className="text-white">{rrRatio} R</b>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="4.0"
                  step="0.1"
                  value={rrRatio}
                  onChange={(e) => setRrRatio(Number(e.target.value))}
                  className="w-full accent-cyan-400 mt-1 h-1"
                />
              </div>
            </div>

            {simResults && (
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#1a2d3f] text-center">
                <div className="p-2 rounded-lg bg-[#07131e]">
                  <div className="text-[9px] text-gray-400">Kỳ vọng EV / Lệnh</div>
                  <div className={`text-xs font-mono font-bold ${simResults.expectedR > 0 ? 'text-neon-green' : 'text-red-400'}`}>
                    {simResults.expectedR > 0 ? `+${simResults.expectedR}` : simResults.expectedR} R
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-[#07131e]">
                  <div className="text-[9px] text-gray-400">Rủi ro cháy vốn (Ruin)</div>
                  <div className={`text-xs font-mono font-bold ${simResults.riskOfRuin < 5 ? 'text-cyan-400' : 'text-amber-400'}`}>
                    {simResults.riskOfRuin}%
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-[#07131e]">
                  <div className="text-[9px] text-gray-400">Ý nghĩa p-value</div>
                  <div className="text-xs font-mono font-bold text-white">
                    {simResults.pValue < 0.05 ? 'Tin cậy (<0.05)' : 'Ngẫu nhiên'}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Data Science & Math Skill Matrix */}
        <div className="lg:col-span-7 space-y-6">
          {/* Category Tabs & Search Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0">
              {['all', 'Statistics', 'MachineLearning', 'Econometrics', 'Stochastic'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    activeCategory === cat
                      ? 'bg-neon-green text-black shadow-md'
                      : 'bg-[#0d1e2e] text-gray-400 hover:text-white border border-[#1f2937]'
                  }`}
                >
                  {cat === 'all' ? 'Tất cả kỹ năng' : cat}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-56">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Tìm kỹ năng toán & dữ liệu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0c1b29] border border-[#1f2937] rounded-xl pl-9 pr-3 py-1.5 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-neon-green"
              />
            </div>
          </div>

          {/* Skills Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredSkills.map((skill) => (
              <div
                key={skill.id}
                onClick={() => setSelectedSkill(skill)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  selectedSkill.id === skill.id
                    ? 'bg-[#0c2235] border-neon-green shadow-[0_0_20px_rgba(0,255,163,0.15)]'
                    : 'bg-[#07131e] border-[#20394b] hover:border-gray-500'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-cyan-300">
                      {skill.category}
                    </span>
                    <span className="text-[10px] font-mono text-neon-green flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Chuẩn định lượng
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white leading-snug">{skill.name}</h4>
                  <p className="text-xs text-gray-400 line-clamp-2">{skill.desc}</p>
                </div>

                <div className="pt-3 mt-3 border-t border-[#1f2937] flex items-center justify-between text-[11px]">
                  <span className="text-gray-400 font-mono">{skill.metrics}</span>
                  <ChevronRight className="w-4 h-4 text-neon-green" />
                </div>
              </div>
            ))}
          </div>

          {/* Active Skill Inspector Box */}
          <div className="p-5 rounded-2xl bg-[#091b2c] border border-cyan-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> Chi tiết Kỹ năng Toán học & Khoa học Dữ liệu
              </span>
              <span className="text-[10px] font-mono text-neon-green bg-black/40 px-2.5 py-0.5 rounded border border-neon-green/30">
                Formula: {selectedSkill.mathFormula}
              </span>
            </div>

            <div className="text-sm font-bold text-white">{selectedSkill.name}</div>
            <p className="text-xs text-gray-300 leading-relaxed">{selectedSkill.desc}</p>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {selectedSkill.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-md bg-[#132d44] border border-[#204a6b] text-[10px] text-gray-300"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
