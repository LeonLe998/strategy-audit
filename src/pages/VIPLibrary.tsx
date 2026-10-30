import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Star,
  X, BookOpen, Search, AlertTriangle, CheckCircle, XCircle, Info, Key
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const VIP_API = '/.netlify/functions/vip';
const PASSKEY_STORAGE = 'quant_vip_passkey';

interface VIPLibraryProps {
  setActiveTab: (tab: string) => void;
  initialStrategyId?: string | null;
  onStrategyChange?: (id: string | null) => void;
}

const VERDICT_COLORS: Record<string, string> = {
  'CHẤT': '#1D9E75',
  'TÌNH HUỐNG': '#BA7517',
  'CHÁT': '#E24B4A',
  'CHƯA KIỂM ĐỊNH': '#6B7280'
};
const VERDICT_LABELS: Record<string, string> = {
  'CHẤT': 'Đạt tiêu chí',
  'TÌNH HUỐNG': 'Phụ thuộc tình huống',
  'CHÁT': 'Chưa đạt',
  'CHƯA KIỂM ĐỊNH': 'Chưa kiểm định'
};

/** Năm ô kính đếm theo kết luận + một ống kính chia tỉ lệ Đạt / Tình huống / Chưa đạt trên số đã kiểm định */
function LibraryStats({ data }: { data: any }) {
  const v = data.verdict_da_chay;
  const measured = v['CHẤT'] + v['TÌNH HUỐNG'] + v['CHÁT'];
  const tiles = [
    { n: v['CHẤT'], label: 'Đạt tiêu chí', color: VERDICT_COLORS['CHẤT'], lit: true },
    { n: v['TÌNH HUỐNG'], label: 'Phụ thuộc tình huống', color: VERDICT_COLORS['TÌNH HUỐNG'] },
    { n: v['CHÁT'], label: 'Chưa đạt', color: VERDICT_COLORS['CHÁT'] },
    { n: data.gop, label: 'Bản đánh chiều ngược lại', color: '#7d8ea3' },
    { n: data.chua, label: 'Chưa kiểm định', color: '#6b7280' },
  ];
  return (
    <div className="hidden space-y-3 sm:block">
      <div className="grid grid-cols-5 gap-3">
        {tiles.map((t, i) => (
          <motion.div
            key={t.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.07, duration: 0.5 }}
            className={`sa-glass rounded-2xl px-3 py-4 text-center ${t.lit ? 'sa-glass-cyan' : ''}`}
          >
            <p className="font-display text-3xl font-bold" style={{ color: t.color, textShadow: `0 0 18px ${t.color}66` }}>{t.n}</p>
            <p className="mt-1 text-[11px] font-bold uppercase text-gray-400">{t.label}</p>
          </motion.div>
        ))}
      </div>
      <div className="sa-glass rounded-full p-1">
        <div className="flex h-2.5 overflow-hidden rounded-full bg-white/5">
          {['CHẤT', 'TÌNH HUỐNG', 'CHÁT'].map((k, i) => (
            <motion.span
              key={k}
              initial={{ width: 0 }}
              animate={{ width: `${(v[k] / measured) * 100}%` }}
              transition={{ delay: 0.5 + i * 0.25, duration: 0.9, ease: 'easeOut' }}
              className="h-full"
              style={{ background: VERDICT_COLORS[k], boxShadow: `0 0 12px ${VERDICT_COLORS[k]}` }}
            />
          ))}
        </div>
      </div>
      <p className="text-[11px] text-gray-500">Chia theo kết luận trên {measured} chiến lược đã kiểm định</p>
    </div>
  );
}

/** Chữ hiện ra cho trạng thái chấm kỳ 2, viết cho người mới (dữ liệu vẫn giữ giá trị gốc) */
const KY2_LABEL: Record<string, string> = { 'giữ vững': 'giữ vững', 'suy yếu': 'suy yếu', 'lãi lại': 'có lời lại', 'vẫn rớt': 'vẫn không đạt' };

// Mỗi năm một ô: dương / âm. Không hiện con số R (luật kênh).
const YearChips = ({ title, years }: { title: string; years?: Record<string, boolean> }) => (
  <div className="bg-[#0B0E14] border border-[#1F2937] p-6 rounded-2xl">
    <h3 className="font-bold text-white mb-4 text-sm">{title}</h3>
    <div className="flex flex-wrap gap-2">
      {Object.entries(years || {}).map(([year, positive]) => (
        <span
          key={year}
          className={`rounded-lg border px-3 py-2 font-mono text-xs font-bold ${positive ? 'text-[#1D9E75] border-[#1D9E75]/40 bg-[#1D9E75]/10' : 'text-[#E24B4A] border-[#E24B4A]/40 bg-[#E24B4A]/10'}`}
        >
          {year} · {positive ? 'dương' : 'âm'}
        </span>
      ))}
    </div>
  </div>
);

const VERDICT_ORDER: Record<string, number> = {
  'CHẤT': 1,
  'TÌNH HUỐNG': 2,
  'CHÁT': 3,
  'CHƯA KIỂM ĐỊNH': 4
};

export default function VIPLibrary({ initialStrategyId, onStrategyChange }: VIPLibraryProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passkey, setPasskey] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const [indexData, setIndexData] = useState<any | null>(null);
  const [articleContent, setArticleContent] = useState<string>('');
  const [articleFull, setArticleFull] = useState<boolean>(false);
  
  const [filterHo, setFilterHo] = useState<string>('All');
  const [filterVerdict, setFilterVerdict] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  const [selectedStrategyIndex, setSelectedStrategyIndex] = useState<any | null>(null);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);

  const storedPasskey = () => {
    try {
      return localStorage.getItem(PASSKEY_STORAGE) || '';
    } catch {
      return '';
    }
  };

  // Bài phân tích luôn đi qua function: có passkey hợp lệ mới nhận bản đầy đủ
  const fetchArticle = async (id: string, key: string = storedPasskey()) => {
    try {
      const res = await fetch(`${VIP_API}?action=article&id=${encodeURIComponent(id)}`, {
        headers: key ? { 'x-passkey': key } : {}
      });
      const data = await res.json();
      if (res.status === 401) {
        // Passkey đã bị thu hồi hoặc hết hạn
        localStorage.removeItem(PASSKEY_STORAGE);
        setIsAuthenticated(false);
        return fetchArticle(id, '');
      }
      setArticleContent(data.content || '');
      setArticleFull(Boolean(data.full));
    } catch (err) {
      console.error(err);
      setArticleContent('');
      setArticleFull(false);
    }
  };

  useEffect(() => {
    // Dọn cờ cũ: trạng thái VIP không còn lưu bằng true/false trên máy
    localStorage.removeItem('quant_vip_auth_v2');
    localStorage.removeItem('quant_admin_strategies');
    if (storedPasskey()) setIsAuthenticated(true);

    fetch('/data/thuvien_data/thu_vien_index.json')
      .then(res => res.json())
      .then(data => setIndexData(data))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterHo, filterVerdict, searchQuery]);

  const handleVerifyPasskey = async (e: React.FormEvent) => {
    e.preventDefault();
    const key = passkey.trim();
    if (key === '') return;
    setIsVerifying(true);
    setErrorMsg('');

    try {
      const res = await fetch(`${VIP_API}?action=verify`, { headers: { 'x-passkey': key } });
      const data = await res.json();
      if (data.valid) {
        localStorage.setItem(PASSKEY_STORAGE, key);
        setIsAuthenticated(true);
        if (selectedReport) fetchArticle(selectedReport.spec.id, key);
      } else {
        setErrorMsg(data.message || 'Passkey không hợp lệ hoặc đã bị thu hồi.');
      }
    } catch (err) {
      console.error("Lỗi kết nối API xác thực:", err);
      setErrorMsg('Lỗi kết nối máy chủ xác thực. Vui lòng thử lại sau.');
    }
    setIsVerifying(false);
  };

  const openReport = (strategy: any, updateUrl: boolean = true) => {
    if (strategy.trang_thai === 'chua_kiem_dinh') return;
    setSelectedStrategyIndex(strategy);
    const targetId = strategy.trang_thai === 'gop' ? strategy.goc : strategy.id;
    
    if (updateUrl) {
      if (onStrategyChange) {
        onStrategyChange(strategy.id);
      } else {
        window.history.pushState(null, '', `/vip/${strategy.id}`);
      }
    }

    fetch(`/data/thuvien_data/reports_json/${targetId}.json`)
      .then(res => res.json())
      .then(data => {
        setSelectedReport(data);
      })
      .catch(err => {
        console.error(err);
      });

    setArticleContent('');
    setArticleFull(false);
    fetchArticle(targetId);
  };

  const closeReport = () => {
    setSelectedReport(null);
    setSelectedStrategyIndex(null);
    if (onStrategyChange) {
      onStrategyChange(null);
    } else {
      window.history.pushState(null, '', '/vip');
    }
  };

  // Tự động mở modal khi có initialStrategyId từ URL hoặc Deep Link
  useEffect(() => {
    if (!initialStrategyId) {
      setSelectedReport(null);
      setSelectedStrategyIndex(null);
      return;
    }

    if (selectedStrategyIndex && selectedStrategyIndex.id.toLowerCase() === initialStrategyId.toLowerCase()) {
      return;
    }

    if (indexData?.danh_sach) {
      const match = indexData.danh_sach.find(
        (s: any) => s.id.toLowerCase() === initialStrategyId.toLowerCase()
      );
      if (match) {
        openReport(match, false);
        return;
      }
    }

    // Nếu indexData chưa xong hoặc ID không có trong index, vẫn fetch trực tiếp
    const upperId = initialStrategyId.toUpperCase();
    const directStrat = {
      id: upperId,
      ten: `Chiến lược ${upperId}`,
      ho: 'Chiến lược VIP',
      tf: 'H4',
      verdict: 'CHẤT',
      trang_thai: 'da_kiem_dinh'
    };
    openReport(directStrat, false);
  }, [initialStrategyId, indexData]);

  const getArticleDisplayContent = () => (selectedReport ? articleContent : '');

  let filteredList = indexData?.danh_sach || [];
  if (filterHo !== 'All') filteredList = filteredList.filter((s: any) => s.ho === filterHo);
  if (filterVerdict !== 'All') filteredList = filteredList.filter((s: any) => s.verdict === filterVerdict);
  if (searchQuery) {
    const lowerQ = searchQuery.toLowerCase();
    filteredList = filteredList.filter((s: any) => s.ten.toLowerCase().includes(lowerQ) || s.id.toLowerCase().includes(lowerQ));
  }
  
  filteredList.sort((a: any, b: any) => {
    const orderA = VERDICT_ORDER[a.verdict] || 99;
    const orderB = VERDICT_ORDER[b.verdict] || 99;
    if (orderA !== orderB) return orderA - orderB;
    return (a.xep_hang || 999) - (b.xep_hang || 999);
  });

  const hoOptions = Array.from(new Set((indexData?.danh_sach || []).map((s: any) => s.ho)));
  const totalPages = Math.max(1, Math.ceil(filteredList.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const pageItems = filteredList.slice((safePage - 1) * pageSize, safePage * pageSize);
  const firstItem = filteredList.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const lastItem = Math.min(safePage * pageSize, filteredList.length);

  return (
    <div className="pb-24 pt-6 max-w-7xl mx-auto px-4 space-y-12 relative z-10">
      
      {/* Header */}
      <section className="text-center max-w-4xl mx-auto space-y-6 relative">
        <div aria-hidden className="pointer-events-none absolute -right-20 -top-24 -z-10 h-72 w-72 rounded-full bg-[#2BFFEA]/15 blur-[90px]" />
        <div aria-hidden className="pointer-events-none absolute -left-24 top-10 -z-10 h-64 w-64 rounded-full bg-[#FFD700]/10 blur-[90px]" />
        <div className="inline-flex items-center space-x-2 bg-[linear-gradient(160deg,rgba(255,215,0,0.16),rgba(255,215,0,0.04))] border border-[#FFD700]/40 shadow-[0_0_20px_rgba(255,215,0,0.15),inset_0_1px_0_rgba(255,255,255,0.25)] backdrop-blur px-4 py-2 rounded-full text-[#FFD700] text-xs font-bold font-mono tracking-widest uppercase mb-2">
          <Star className="w-4 h-4 fill-current" />
          <span>Danh mục 300 chiến lược</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-display font-bold text-white leading-tight">
          Tra cứu thư viện <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-green to-[#FFD700]">300 chiến lược</span>
        </h1>
        <p className="mx-auto max-w-3xl text-gray-300 text-sm md:text-base leading-relaxed">
          Tìm theo tên hoặc nhóm, rồi xem kết quả và giới hạn của từng mục. Thư viện ghi rõ mục đã kiểm định, bản đối xứng và mục chưa đủ dữ liệu.
        </p>

        {indexData && <LibraryStats data={indexData} />}

        <p className="hidden sm:block mx-auto max-w-3xl text-xs leading-5 text-gray-500">
          Đây là nhãn kết luận trong bộ dữ liệu, không phải dự báo tương lai. Bấm vào một chiến lược để xem cách tính và giới hạn.
        </p>

        {indexData && <p className="sm:hidden text-xs text-gray-400">{indexData.da_chay} hồ sơ có kết quả kiểm định · bấm vào từng mục để xem cách đo và giới hạn.</p>}

        <div className="hidden sm:block sa-glass p-5 rounded-xl text-left border-l-4 border-l-coral-red">
          <p className="text-sm text-gray-300 leading-relaxed italic">
            "15 trong 242 chiến lược đã kiểm định được xếp loại Đạt tiêu chí trong bộ dữ liệu hiện tại. Mở từng mục để xem kết quả cụ thể, cách đo và giới hạn."
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="space-y-6">
          <div className="sa-glass flex flex-col md:flex-row justify-between items-center gap-4 p-4 rounded-2xl">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              aria-label="Tìm chiến lược theo tên hoặc mã"
              placeholder="Tìm theo tên hoặc mã chiến lược..." 
              className="w-full bg-white/[0.04] border border-white/15 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[#2BFFEA]/70 focus:shadow-[0_0_0_3px_rgba(43,255,234,0.15)] transition-[border-color,box-shadow]"
            />
          </div>
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <select aria-label="Lọc theo nhóm chiến lược" value={filterHo} onChange={e => setFilterHo(e.target.value)} className="bg-[#0d2130] border border-white/15 text-gray-300 text-sm rounded-lg px-3 py-2 outline-none focus:border-[#2BFFEA]/70">
              <option value="All">Tất cả nhóm</option>
              {hoOptions.map((ho: any) => <option key={ho} value={ho}>{ho}</option>)}
            </select>
            <select aria-label="Lọc theo kết luận" value={filterVerdict} onChange={e => setFilterVerdict(e.target.value)} className="bg-[#0d2130] border border-white/15 text-gray-300 text-sm rounded-lg px-3 py-2 outline-none focus:border-[#2BFFEA]/70">
              <option value="All">Tất cả kết quả</option>
              <option value="CHẤT">Đạt tiêu chí</option>
              <option value="TÌNH HUỐNG">Phụ thuộc tình huống</option>
              <option value="CHÁT">Chưa đạt</option>
              <option value="CHƯA KIỂM ĐỊNH">Chưa kiểm định</option>
            </select>
          </div>
        </div>

        <p className="sa-glass rounded-xl px-4 py-3 text-xs leading-5 text-gray-300 sm:text-sm">
          Mỗi chiến lược được chấm trên hai đoạn dữ liệu mà lúc đặt quy tắc chưa từng nhìn thấy: <b className="text-white">kỳ 1 (2019–2023)</b> và <b className="text-white">kỳ 2 (2024–2026)</b>.
        </p>
        <div className="mb-3 flex flex-col gap-2 px-1 text-sm text-gray-400 sm:flex-row sm:items-center sm:justify-between">
          <span>Hiển thị {firstItem}–{lastItem} trong {filteredList.length} kết quả</span>
          <span className="text-xs">Chọn một mục để xem dữ liệu, điều kiện và giới hạn</span>
        </div>
        <div className="md:hidden space-y-3">
          {pageItems.map((strat: any) => (
            <button key={strat.id} type="button" disabled={strat.trang_thai === 'chua_kiem_dinh'} onClick={() => openReport(strat)} className={`sa-glass w-full rounded-2xl p-4 text-left transition-[border-color,box-shadow] hover:border-[#9ff6ff]/50 disabled:opacity-60 ${strat.verdict === 'CHẤT' ? 'sa-glass-cyan' : ''}`}>
              <span className="flex items-start justify-between gap-3">
                <span><span className="block font-semibold text-white">{strat.ten}</span><span className="mt-1 block font-mono text-xs text-gray-500">{strat.id} · {strat.ho} · {strat.tf}</span></span>
                    <span className="shrink-0 rounded-full border px-2 py-1 text-[10px] font-bold" style={{ color: VERDICT_COLORS[strat.verdict], borderColor: `${VERDICT_COLORS[strat.verdict]}55`, backgroundColor: `${VERDICT_COLORS[strat.verdict]}15` }}>{VERDICT_LABELS[strat.verdict] || strat.verdict}</span>
              </span>
              <span className="mt-4 grid grid-cols-3 gap-2 border-t border-white/5 pt-3 text-xs">
                <span className="text-gray-500">Chấm kỳ 2 <b className={`mt-1 block text-sm ${strat.oos2_status === 'giữ vững' ? 'text-[#1D9E75]' : strat.oos2_status === 'lãi lại' ? 'text-gray-300' : 'text-[#E24B4A]'}`}>{KY2_LABEL[strat.oos2_status] ?? strat.oos2_status ?? '—'}</b></span>
                <span className="text-gray-500">Số năm có lời (kỳ 1) <b className="mt-1 block text-sm text-gray-200">{strat.oos_years || '—'}</b></span>
                <span className="text-gray-500">Số lệnh đã đo <b className="mt-1 block text-sm text-gray-200">{strat.oos_n || '—'}</b></span>
              </span>
              {strat.trang_thai !== 'chua_kiem_dinh' && <span className="mt-3 block text-xs font-semibold text-neon-green">Xem dữ liệu và giới hạn →</span>}
            </button>
          ))}
          {filteredList.length === 0 && <p className="sa-glass rounded-xl p-8 text-center text-sm text-gray-400">Không tìm thấy chiến lược phù hợp. Thử bỏ bớt bộ lọc.</p>}
        </div>
        <div className="hidden md:block sa-glass rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.04] text-gray-300 text-xs font-bold uppercase font-mono tracking-wider border-b border-white/10">
                  <th className="py-4 px-6 font-medium">Chiến Lược</th>
                  <th className="py-4 px-6 font-medium">Nhóm / TF</th>
                  <th className="py-4 px-6 font-medium">Kết luận</th>
                  <th className="py-4 px-6 font-medium">Chấm kỳ 2 (2024–26)</th>
                  <th className="py-4 px-6 font-medium">Số năm có lời (kỳ 1)</th>
                  <th className="py-4 px-6 font-medium">Số lệnh đã đo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {pageItems.map((strat: any) => {
                  return (
                  <tr 
                    key={strat.id} 
                    className={`transition-[background-color,box-shadow] ${strat.trang_thai === 'chua_kiem_dinh' ? 'opacity-60' : 'hover:bg-[linear-gradient(90deg,rgba(43,255,234,0.10),rgba(255,255,255,0.02))] hover:shadow-[inset_3px_0_0_#2BFFEA] cursor-pointer group'} ${strat.verdict === 'CHẤT' ? 'bg-[#1D9E75]/[0.07] shadow-[inset_3px_0_0_#1D9E75]' : ''}`}
                    onClick={() => openReport(strat)}
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-gray-200 group-hover:text-white transition-colors">{strat.ten}</span>
                        {strat.tin_cay === 'thấp (n mỏng)' && <span title="Ít lệnh, kết quả chưa chắc"><AlertTriangle className="w-4 h-4 text-coral-red flex-shrink-0" /></span>}
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-gray-400 font-mono bg-white/[0.04] px-1.5 py-0.5 rounded border border-white/10">{strat.id}</span>
                        {strat.trang_thai === 'gop' && (
                          <span className="text-xs text-gray-400 italic">Bản đánh chiều ngược lại của {strat.goc}</span>
                        )}
                        {strat.trang_thai === 'chua_kiem_dinh' && (
                          <span className="text-xs text-coral-red">{strat.ly_do}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-xs text-gray-300">{strat.ho}</p>
                      <p className="text-xs text-gray-400 font-mono mt-0.5">{strat.tf}</p>
                    </td>
                    <td className="py-4 px-6">
                      <span 
                        className="text-xs font-bold px-2 py-1 rounded border uppercase tracking-wider"
                        style={{ 
                          color: VERDICT_COLORS[strat.verdict], 
                          backgroundColor: `${VERDICT_COLORS[strat.verdict]}15`,
                          borderColor: `${VERDICT_COLORS[strat.verdict]}40`
                        }}
                      >
                        {VERDICT_LABELS[strat.verdict] || strat.verdict}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm">
                      {strat.trang_thai === 'gop' || strat.trang_thai === 'chua_kiem_dinh' || !strat.oos2_status ? (
                        <span className="text-gray-500">—</span>
                      ) : strat.oos2_status === 'không lệnh' ? (
                        <span className="text-gray-500">0 lệnh</span>
                      ) : (
                        <span 
                          title={
                            strat.oos2_status === 'giữ vững' ? 'vẫn giữ vững trên dữ liệu mới 2024–2026' : 
                            strat.oos2_status === 'suy yếu' ? 'đã suy yếu trên dữ liệu mới — kết luận gốc giữ nguyên, cần theo dõi' : 
                            strat.oos2_status === 'lãi lại' ? 'Chưa đạt nhưng có lời 2024–2026: vàng tăng mạnh hiếm thấy giai đoạn này — kết luận giữ nguyên' : 
                            'vẫn không đạt trên dữ liệu mới'
                          } 
                          className={`font-bold flex items-center space-x-1 ${strat.oos2_status === 'giữ vững' ? 'text-[#1D9E75]' : strat.oos2_status === 'lãi lại' ? 'text-[#888780]' : 'text-[#E24B4A]'}`}
                        >
                          <span>{KY2_LABEL[strat.oos2_status] ?? strat.oos2_status}</span>
                          {strat.oos2_status === 'giữ vững' && <CheckCircle className="w-3 h-3 ml-1" />}
                          {strat.oos2_status === 'suy yếu' && <AlertTriangle className="w-3 h-3 ml-1" />}
                          {strat.oos2_status === 'lãi lại' && <Info className="w-3 h-3 ml-1" />}
                          {strat.oos2_status === 'vẫn rớt' && <XCircle className="w-3 h-3 ml-1" />}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 font-mono text-gray-300">{strat.oos_years || '-'}</td>
                    <td className="py-4 px-6 font-mono text-gray-300">{strat.oos_n || '-'}</td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        </div>
        <div className="sa-glass mt-4 flex items-center justify-between rounded-2xl px-4 py-3">
          <button type="button" disabled={safePage <= 1} onClick={() => setCurrentPage(safePage - 1)} className="sa-glass-ghost rounded-lg px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-40">← Trước</button>
          <span className="text-sm text-gray-400">Trang {safePage} / {totalPages}</span>
          <button type="button" disabled={safePage >= totalPages} onClick={() => setCurrentPage(safePage + 1)} className="sa-glass-ghost rounded-lg px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-40">Tiếp →</button>
        </div>
      </section>

      {/* MODAL CHI TIẾT */}
      <AnimatePresence>
        {selectedReport && selectedStrategyIndex && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={closeReport}
            ></motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.95 }} 
              animate={{ opacity: 1, y: 0, scale: 1 }} 
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="sa-glass sa-glass-solid rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-y-auto relative z-10"
            >
              <div className="sticky top-0 bg-[#131722]/95 backdrop-blur-md border-b border-[#1F2937] p-6 flex justify-between items-start z-20">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-mono bg-[#0B0E14] px-2 py-1 rounded border border-gray-800 text-gray-400">{selectedReport.spec.id}</span>
                    <span 
                      className="text-xs font-bold px-2 py-1 rounded border uppercase tracking-wider"
                      style={{ color: VERDICT_COLORS[selectedReport.verdict], borderColor: VERDICT_COLORS[selectedReport.verdict], backgroundColor: `${VERDICT_COLORS[selectedReport.verdict]}10` }}
                    >
                      {VERDICT_LABELS[selectedReport.verdict] || selectedReport.verdict}
                    </span>
                    {selectedReport.OOS2 && selectedReport.OOS2.status && selectedReport.OOS2.status !== 'không lệnh' && (
                       <span 
                       className={`text-xs font-bold px-2 py-1 rounded border tracking-wider ${
                         selectedReport.OOS2.status === 'giữ vững' ? 'text-[#1D9E75] border-[#1D9E75] bg-[#1D9E75]/10' : 
                         selectedReport.OOS2.status === 'lãi lại' ? 'text-[#888780] border-[#888780] bg-[#888780]/10' : 
                         'text-[#E24B4A] border-[#E24B4A] bg-[#E24B4A]/10'
                       }`}
                     >
                       {selectedReport.OOS2.status === 'giữ vững' ? '✓ Giữ vững ở kỳ 2' : 
                        selectedReport.OOS2.status === 'suy yếu' ? '⚠ Suy yếu ở kỳ 2' : 
                        selectedReport.OOS2.status === 'lãi lại' ? 'ⓘ Có lời lại ở kỳ 2, kết luận giữ nguyên' : 
                        '✗ Vẫn không đạt ở kỳ 2'}
                     </span>
                    )}
                  </div>
                  <h2 className="text-2xl font-display font-bold text-white leading-snug">{selectedReport.spec.ten}</h2>
                  <p className="text-sm text-gray-400 mt-1">{selectedReport.spec.mo_ta}</p>
                </div>
                <button 
                  onClick={closeReport}
                  className="p-2 bg-[#1F2937] rounded-full text-gray-400 hover:text-white hover:bg-gray-700 transition-colors shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 md:p-8 space-y-8">
                
                {/* Tiêu chí 5 vòng */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  {[
                    { key: 'edge_vs_null', label: '① Hơn vào lệnh ngẫu nhiên?' },
                    { key: 'ben_tham_so', label: '② Đổi tham số ±30% còn lãi?' },
                    { key: 'song_sot_oos', label: '③ Qua kỳ chấm 1 (2019–2023)?' },
                    { key: 'chiu_phi', label: '④ Đã trừ phí?' },
                    { key: 'kha_thi', label: '⑤ Đủ ≥100 lệnh?' }
                  ].map(tc => {
                    const pass = selectedReport.tieu_chi[tc.key];
                    return (
                      <div key={tc.key} className={`flex items-center p-3 rounded-lg border ${pass ? 'bg-[#1D9E75]/10 border-[#1D9E75]/30' : 'bg-[#E24B4A]/10 border-[#E24B4A]/30'}`}>
                        {pass ? <CheckCircle className="w-4 h-4 text-[#1D9E75] mr-2 shrink-0" /> : <XCircle className="w-4 h-4 text-[#E24B4A] mr-2 shrink-0" />}
                        <span className={`text-xs font-bold ${pass ? 'text-[#1D9E75]' : 'text-[#E24B4A]'}`}>{tc.label}</span>
                      </div>
                    )
                  })}
                </div>

                {/* Bảng so sánh 2 giai đoạn */}
                <div className="bg-[#0B0E14] border border-[#1F2937] rounded-xl overflow-x-auto">
                  <table className="w-full min-w-[640px] text-left text-sm">
                    <thead>
                      <tr className="bg-[#131722] text-gray-400 font-mono text-xs uppercase border-b border-[#1F2937]">
                        <th className="py-3 px-4">Giai đoạn</th>
                        <th className="py-3 px-4">Số lệnh</th>
                        <th className="py-3 px-4">Tỷ lệ thắng</th>
                        <th className="py-3 px-4">Số năm dương</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1F2937]">
                      <tr>
                        <td className="py-3 px-4 font-bold text-white">Giai đoạn ôn bài (2004–2018)</td>
                        <td className="py-3 px-4 font-mono">{selectedReport.IS.n}</td>
                        <td className="py-3 px-4 font-mono">{selectedReport.IS.wr}%</td>
                        <td className="py-3 px-4 font-mono">{selectedReport.IS.years_pos}</td>
                      </tr>
                      <tr className="bg-[#1F2937]/20">
                        <td className="py-3 px-4 font-bold text-[#FFD700]">Kỳ 1 (2019–2023)</td>
                        <td className="py-3 px-4 font-mono">{selectedReport.OOS.n}</td>
                        <td className="py-3 px-4 font-mono">{selectedReport.OOS.wr}%</td>
                        <td className="py-3 px-4 font-mono">{selectedReport.OOS.years_pos}</td>
                      </tr>
                      {selectedReport.OOS2 && (
                        <tr className="bg-[#1F2937]/40 border-t border-[#1F2937]">
                          <td className="py-3 px-4 font-bold text-white">Kỳ 2 (2024–2026)</td>
                          <td className="py-3 px-4 font-mono">{selectedReport.OOS2.n}</td>
                          <td className="py-3 px-4 font-mono">{selectedReport.OOS2.wr}%</td>
                          <td className="py-3 px-4 font-mono">{selectedReport.OOS2.years_pos}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Năm dương / âm theo từng kỳ thi — không hiện con số R */}
                <div className={`grid grid-cols-1 ${selectedReport.OOS2 ? 'md:grid-cols-2' : ''} gap-6`}>
                  <YearChips title="Kỳ 1 (2019–2023): năm có lời / năm lỗ" years={selectedReport.OOS?.nam_duong} />
                  {selectedReport.OOS2 && (
                    <YearChips title="Kỳ 2 (2024–2026): năm có lời / năm lỗ" years={selectedReport.OOS2.nam_duong} />
                  )}
                </div>

                {/* Article Content / Detailed Report from Admin */}
                <div className="bg-[#0B0E14] border border-[#1F2937] p-6 md:p-8 rounded-2xl mt-6">
                  <div className="flex items-center space-x-2 mb-6 border-b border-[#1F2937] pb-4">
                    <BookOpen className="w-5 h-5 text-[#FFD700]" />
                    <h3 className="font-bold text-xl text-white font-display">Báo Cáo Phân Tích Chuyên Sâu</h3>
                  </div>
                  {selectedStrategyIndex?.trang_thai === 'gop' && (
                    <div className="bg-neon-green/5 border border-neon-green/30 px-4 py-2.5 rounded-lg text-xs text-neon-green mb-4 italic">
                      Đây là bản đối xứng của chiến lược gốc {selectedStrategyIndex.goc} — Đang tải bài viết phân tích của {selectedStrategyIndex.goc}.
                    </div>
                  )}

                  {articleFull ? (
                    getArticleDisplayContent() ? (
                      <div className="prose prose-invert prose-neon max-w-none prose-h2:text-white prose-h2:border-b prose-h2:border-[#1F2937] prose-h2:pb-2 prose-h3:text-[#FFD700] prose-a:text-[#1D9E75] hover:prose-a:text-[#FFD700] prose-blockquote:border-l-[#1D9E75] prose-blockquote:bg-[#131722] prose-blockquote:px-4 prose-blockquote:py-1 prose-blockquote:rounded-r-lg prose-blockquote:font-mono prose-blockquote:text-sm prose-blockquote:text-gray-300">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {getArticleDisplayContent()}
                        </ReactMarkdown>
                        
                        {/* Footer disclaimer inside article */}
                        <div className="mt-8 pt-6 border-t border-[#1F2937]/30 text-xs text-gray-500 font-sans leading-relaxed">
                          Báo cáo kiểm định độc lập — không phải lời khuyên đầu tư. Kết quả quá khứ không bảo đảm tương lai.
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-400 font-mono text-sm bg-[#131722] rounded-xl border border-[#1F2937]">
                        <BookOpen className="w-8 h-8 text-gray-600 mx-auto mb-3" />
                        <p>Đội ngũ chuyên gia Quant đang soạn thảo báo cáo phân tích cho chiến lược này.</p>
                        <p>Vui lòng quay lại sau nhé!</p>
                      </div>
                    )
                  ) : (
                    <div className="space-y-6">
                      {getArticleDisplayContent() ? (
                        <div className="relative">
                          {/* Truncated content */}
                          <div className="prose prose-invert prose-neon max-w-none prose-h2:text-white prose-h2:border-b prose-h2:border-[#1F2937] prose-h2:pb-2 prose-h3:text-[#FFD700] prose-a:text-[#1D9E75] hover:prose-a:text-[#FFD700] prose-blockquote:border-l-[#1D9E75] prose-blockquote:bg-[#131722] prose-blockquote:px-4 prose-blockquote:py-1 prose-blockquote:rounded-r-lg prose-blockquote:font-mono prose-blockquote:text-sm prose-blockquote:text-gray-300 opacity-60 pointer-events-none select-none">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {getArticleDisplayContent()}
                            </ReactMarkdown>
                          </div>
                          
                          {/* Blurred gradient overlay */}
                          <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#0B0E14] via-[#0B0E14]/80 to-transparent pointer-events-none"></div>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400 italic text-center py-4">Đội ngũ chuyên gia Quant đang soạn thảo báo cáo phân tích cho chiến lược này.</p>
                      )}

                      {/* Upgrade Form Area */}
                      <div className="relative text-center py-8 px-4 rounded-xl border border-dashed border-[#1F2937] bg-[#131722]/30 max-w-xl mx-auto">
                        <div className="relative z-20 max-w-md mx-auto">
                          <div className="w-12 h-12 bg-neon-green/10 rounded-full flex items-center justify-center mx-auto mb-3 shadow-[0_0_15px_rgba(0,255,163,0.15)]">
                            <Key className="w-6 h-6 text-neon-green" />
                          </div>
                          <h4 className="text-lg font-bold text-white mb-1">Nội Dung Độc Quyền (VIP)</h4>
                          <p className="text-gray-400 text-xs mb-4 leading-relaxed">
                            {isAuthenticated
                              ? 'Đang tải bản đầy đủ cho thành viên…'
                              : 'Phần phân tích nâng cao: chuỗi thua kỷ lục, bẫy rủi ro và lý do rớt đang bị khóa. Nhập Passkey thành viên để mở.'}
                          </p>
                          <form onSubmit={handleVerifyPasskey} className="space-y-3 text-left">
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Key className="w-3.5 h-3.5 text-gray-500" />
                              </div>
                              <input 
                                type="password" 
                                value={passkey} 
                                onChange={e => setPasskey(e.target.value)} 
                                placeholder="Nhập Passkey..." 
                                className="w-full bg-[#0B0E14] border border-[#1F2937] text-white rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-neon-green transition-colors text-center tracking-widest font-mono text-xs" 
                              />
                            </div>
                            {errorMsg && (
                              <p className="text-coral-red text-xxs font-mono text-center flex justify-center items-center space-x-1">
                                <X className="w-3 h-3" />
                                <span>{errorMsg}</span>
                              </p>
                            )}
                            <button 
                              type="submit" 
                              disabled={isVerifying} 
                              className="w-full bg-neon-green hover:bg-[#00E593] text-black font-bold rounded-xl py-2.5 transition-all uppercase tracking-wider text-xs flex items-center justify-center space-x-2 disabled:opacity-70"
                            >
                              {isVerifying ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div> : <span>Mở Khóa Báo Cáo</span>}
                            </button>
                          </form>

                          <div className="mt-4 pt-3 border-t border-[#1F2937]/50 text-center">
                            <p className="text-xxs text-gray-400">
                              Bạn chưa có Passkey?{' '}
                              <a 
                                href="https://zalo.me/0566665511" 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-neon-green hover:text-[#00E593] transition-colors font-bold underline decoration-dotted"
                              >
                                Liên hệ Zalo Admin (05.6666.5511)
                              </a>{' '}
                              để nhận mã kích hoạt.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
              </div>
              
              <div className="bg-[#0B0E14] p-4 text-center border-t border-[#1F2937]">
                <p className="text-xs text-gray-400 font-mono">
                  Báo cáo kiểm định độc lập — không phải lời khuyên đầu tư. Kết quả quá khứ không bảo đảm tương lai.<br/>
                  * 1R = số tiền dám thua ở mỗi lệnh (Ví dụ: rủi ro 1 triệu → lãi TB 100 nghìn).
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
