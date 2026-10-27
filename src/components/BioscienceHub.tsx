/**
 * Bioscience Skills Hub & Computational Biology Center
 * Integrates 38 Bioscience tools, 3D molecular modeling (AlphaFold, DNA),
 * and Quantitative Biotech Clinical Trial Auditing.
 */

import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  Dna, Search, Sparkles, CheckCircle2, ChevronRight
} from 'lucide-react';
import { createDNAHelix, createAlphaFoldProtein, type Procedural3DObject } from './Game3D/ProceduralModels';

interface BioscienceSkillItem {
  id: string;
  name: string;
  category: 'Structural' | 'Chemical' | 'Clinical' | 'Genomic';
  desc: string;
  tool: string;
  metrics: string;
  tags: string[];
}

const BIOSCIENCE_SKILLS: BioscienceSkillItem[] = [
  {
    id: 'alphafold',
    name: 'AlphaFold Protein Structure Prediction',
    category: 'Structural',
    desc: 'Dự đoán cấu trúc 3D của protein, trích xuất chỉ số pLDDT confidence và nhận diện vùng mất trật tự.',
    tool: 'alphafold_database_fetch_and_analyze',
    metrics: 'pLDDT score (0-100), RMSD < 1.5Å',
    tags: ['Protein', 'UniProt', '3D Structure']
  },
  {
    id: 'chembl',
    name: 'ChEMBL Bioactivity & Drug Targets',
    category: 'Chemical',
    desc: 'Tra cứu hợp chất có hoạt tính sinh học, ái lực liên kết thụ thể IC50 / Ki và cơ chế tác động dược lý.',
    tool: 'chembl_database',
    metrics: 'IC50, Ki, pChEMBL value',
    tags: ['Bioassay', 'Small Molecules', 'Target Affinity']
  },
  {
    id: 'clinical_trials',
    name: 'ClinicalTrials.gov Pipeline Intelligence',
    category: 'Clinical',
    desc: 'Đo lường tiến độ thử nghiệm lâm sàng Phase 1/2/3, tỷ lệ đạt tiêu chí chính (Primary Endpoint) của FDA.',
    tool: 'clinical_trials_database',
    metrics: 'NCT ID, Phase 1-3, Endpoint P-value',
    tags: ['FDA', 'Biotech Catalyst', 'Pipeline Risk']
  },
  {
    id: 'pubchem',
    name: 'PubChem Chemical Profiler',
    category: 'Chemical',
    desc: 'Tra cứu cấu trúc phân tử, công thức hóa học SMILES và các chỉ số lý hóa cơ bản của dược chất.',
    tool: 'pubchem_database',
    metrics: 'CID, Molecular Weight, LogP',
    tags: ['PubChem', 'SMILES', 'Cheminformatics']
  },
  {
    id: 'ensembl',
    name: 'Ensembl Genomic Variant & VEP',
    category: 'Genomic',
    desc: 'Dự đoán hệ quả biến thể di truyền, đột biến gen và phân tích cấu trúc exon/intron.',
    tool: 'ensembl_database',
    metrics: 'VEP Consequence, SIFT / PolyPhen',
    tags: ['Genomics', 'Exon', 'Variant Effect']
  },
  {
    id: 'reactome',
    name: 'Reactome Biological Pathways',
    category: 'Structural',
    desc: 'Phân tích con đường tín hiệu sinh học, tương tác tế bào và làm giàu danh sách gen (Gene Enrichment).',
    tool: 'reactome_database',
    metrics: 'Pathway Hierarchy, P-value FDR',
    tags: ['Signaling', 'Metabolism', 'Enrichment']
  }
];

export const BioscienceHub: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSkill, setSelectedSkill] = useState<BioscienceSkillItem>(BIOSCIENCE_SKILLS[0]);
  const [activeModelType, setActiveModelType] = useState<'dna' | 'protein'>('dna');

  // Mini 3D Molecular Canvas
  const mountRef = useRef<HTMLDivElement>(null);
  const currentModelRef = useRef<Procedural3DObject | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x061624);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.5, 7);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.replaceChildren(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 2.0;

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambient);
    const light1 = new THREE.DirectionalLight(0x00ffa3, 2.0);
    light1.position.set(5, 5, 5);
    scene.add(light1);
    const light2 = new THREE.DirectionalLight(0x06b6d4, 1.5);
    light2.position.set(-5, -5, -5);
    scene.add(light2);

    // Initial Model
    const model = activeModelType === 'dna' ? createDNAHelix(10, 1.5, 2.2) : createAlphaFoldProtein();
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

  const filteredSkills = BIOSCIENCE_SKILLS.filter((s) => {
    const matchesCategory = activeCategory === 'all' || s.category.toLowerCase() === activeCategory.toLowerCase();
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <section id="bioscience-hub" className="relative py-16 px-4 max-w-7xl mx-auto font-sans">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold">
          <Dna className="w-4 h-4 animate-spin-slow" />
          <span>Hệ Kỹ năng Khoa học Đời sống · 38 Bioscience Skills</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          Đo lường Định lượng & Cấu trúc Sinh học 3D
        </h2>
        <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
          Tích hợp AlphaFold, ChEMBL, ClinicalTrials.gov và PDB vào quy trình kiểm định phương pháp:
          tách biệt giữa may mắn ngẫu nhiên và động lực dữ liệu y sinh học thực thụ.
        </p>
      </div>

      {/* Main Grid: Left 3D Molecular Simulation / Right Skills Catalog */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: 3D Molecular Lab */}
        <div className="lg:col-span-5 bg-[#07131e] border border-[#20394b] rounded-3xl p-6 shadow-2xl relative overflow-hidden space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-neon-green">
                Mô phỏng Phân tử 3D WebGL
              </span>
              <h3 className="text-base font-bold text-white mt-0.5">
                {activeModelType === 'dna' ? 'Cấu trúc Xoắn kép DNA' : 'Mô hình cuộn gập AlphaFold'}
              </h3>
            </div>

            {/* Toggle Model Type */}
            <div className="flex rounded-lg bg-[#0d1e2e] p-1 border border-[#1f2937]">
              <button
                onClick={() => setActiveModelType('dna')}
                className={`px-2.5 py-1 text-xs rounded-md font-semibold transition-all ${
                  activeModelType === 'dna' ? 'bg-neon-green text-black' : 'text-gray-400 hover:text-white'
                }`}
              >
                DNA
              </button>
              <button
                onClick={() => setActiveModelType('protein')}
                className={`px-2.5 py-1 text-xs rounded-md font-semibold transition-all ${
                  activeModelType === 'protein' ? 'bg-neon-green text-black' : 'text-gray-400 hover:text-white'
                }`}
              >
                Protein
              </button>
            </div>
          </div>

          {/* 3D Canvas Mount */}
          <div
            ref={mountRef}
            className="w-full h-64 sm:h-72 rounded-2xl bg-[#061624] border border-[#1f2937] overflow-hidden cursor-grab active:cursor-grabbing relative"
          />

          {/* Bioscience Telemetry Box */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-[#0c1b29] border border-[#1f2937]">
              <div className="text-[10px] text-gray-400">Độ tin cậy AlphaFold (pLDDT)</div>
              <div className="text-sm font-bold text-cyan-400 mt-0.5">92.4 / 100 (Very High)</div>
            </div>
            <div className="p-3 rounded-xl bg-[#0c1b29] border border-[#1f2937]">
              <div className="text-[10px] text-gray-400">Độ lệch cấu trúc RMSD</div>
              <div className="text-sm font-bold text-neon-green mt-0.5">0.84 Å (Chuẩn hóa)</div>
            </div>
          </div>

          <p className="text-xs text-gray-400 leading-relaxed">
            Dữ liệu cấu trúc 3D này được sử dụng để lọc và lượng hóa xác suất thành công của các ứng viên thuốc trước khi bước vào giai đoạn thử nghiệm lâm sàng FDA.
          </p>
        </div>

        {/* Right: Skills Matrix & Interactive Runner */}
        <div className="lg:col-span-7 space-y-6">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0">
              {['all', 'structural', 'chemical', 'clinical', 'genomic'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-all ${
                    activeCategory === cat
                      ? 'bg-neon-green text-black shadow-md'
                      : 'bg-[#0d1e2e] text-gray-400 hover:text-white border border-[#1f2937]'
                  }`}
                >
                  {cat === 'all' ? 'Tất cả (38)' : cat}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-56">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Tìm kỹ năng y sinh..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0c1b29] border border-[#1f2937] rounded-xl pl-9 pr-3 py-1.5 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-neon-green"
              />
            </div>
          </div>

          {/* Skills Cards Grid */}
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
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-gray-300">
                      {skill.category}
                    </span>
                    <span className="text-[10px] font-mono text-neon-green flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Ready
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
                <Sparkles className="w-4 h-4" /> Chi tiết Kỹ năng Y sinh được chọn
              </span>
              <span className="text-[10px] font-mono text-gray-400 bg-black/40 px-2 py-0.5 rounded">
                Tool: {selectedSkill.tool}
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
