import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Key, Star,
  X, BookOpen, Search, AlertTriangle, CheckCircle, XCircle, Info
} from 'lucide-react';
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import ReactMarkdown from 'react-markdown';
import { getGasApiUrl } from '../config';

interface VIPLibraryProps {
  setActiveTab: (tab: string) => void;
}

const VERDICT_COLORS: Record<string, string> = {
  'CHẤT': '#1D9E75',
  'TÌNH HUỐNG': '#BA7517',
  'CHÁT': '#E24B4A',
  'CHƯA KIỂM ĐỊNH': '#6B7280'
};

const IsometricBar = (props: any) => {
  const { fill, x, y, width, height, payload } = props;
  if (height === 0 || isNaN(height)) return null;
  const depth = width * 0.4;
  const isPositive = payload.ev >= 0;
  
  const frontTopLeft = { x, y };
  const frontTopRight = { x: x + width, y };
  const frontBottomRight = { x: x + width, y: y + height };
  const frontBottomLeft = { x, y: y + height };
  
  const backTopLeft = { x: x + depth, y: y - depth };
  const backTopRight = { x: x + width + depth, y: y - depth };
  const backBottomRight = { x: x + width + depth, y: y + height - depth };
  
  const lightFill = fill === '#1D9E75' ? '#22C55E' : '#EF4444';
  const darkFill = fill === '#1D9E75' ? '#166534' : '#991B1B';
  
  return (
    <g>
      <path d={`M${frontTopLeft.x},${frontTopLeft.y} L${frontTopRight.x},${frontTopRight.y} L${frontBottomRight.x},${frontBottomRight.y} L${frontBottomLeft.x},${frontBottomLeft.y} Z`} fill={fill} stroke={fill} strokeWidth={0.5} />
      {isPositive && <path d={`M${frontTopLeft.x},${frontTopLeft.y} L${backTopLeft.x},${backTopLeft.y} L${backTopRight.x},${backTopRight.y} L${frontTopRight.x},${frontTopRight.y} Z`} fill={lightFill} stroke={lightFill} strokeWidth={0.5} />}
      {!isPositive && <path d={`M${frontBottomLeft.x},${frontBottomLeft.y} L${x + depth},${y + height - depth} L${backBottomRight.x},${backBottomRight.y} L${frontBottomRight.x},${frontBottomRight.y} Z`} fill={lightFill} stroke={lightFill} strokeWidth={0.5} />}
      <path d={`M${frontTopRight.x},${frontTopRight.y} L${backTopRight.x},${backTopRight.y} L${backBottomRight.x},${backBottomRight.y} L${frontBottomRight.x},${frontBottomRight.y} Z`} fill={darkFill} stroke={darkFill} strokeWidth={0.5} />
    </g>
  );
};

const VERDICT_ORDER: Record<string, number> = {
  'CHẤT': 1,
  'TÌNH HUỐNG': 2,
  'CHÁT': 3,
  'CHƯA KIỂM ĐỊNH': 4
};

export default function VIPLibrary({}: VIPLibraryProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passkey, setPasskey] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const [indexData, setIndexData] = useState<any | null>(null);
  const [adminArticles, setAdminArticles] = useState<Record<string, any>>({});
  
  const [filterHo, setFilterHo] = useState<string>('All');
  const [filterVerdict, setFilterVerdict] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [selectedStrategyIndex, setSelectedStrategyIndex] = useState<any | null>(null);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);

  const fetchArticles = async () => {
    const currentGasUrl = getGasApiUrl();
    if (currentGasUrl) {
      try {
        const res = await fetch(`${currentGasUrl}?action=getArticles`);
        const data = await res.json();
        if (data.success && data.data) {
          setAdminArticles(data.data);
          localStorage.setItem('quant_admin_strategies', JSON.stringify(data.data));
          return;
        }
      } catch (err) {
        console.error("Lỗi khi tải bài viết từ Google Sheets:", err);
      }
    }
    
    // Fallback load local
    const localData = localStorage.getItem('quant_admin_strategies');
    if (localData) {
      setAdminArticles(JSON.parse(localData));
    }
  };

  useEffect(() => {
    let deviceId = localStorage.getItem('quant_device_id');
    if (!deviceId) {
      deviceId = 'DEV-' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('quant_device_id', deviceId);
    }
    
    if (localStorage.getItem('quant_vip_auth_v2') === 'true') {
      setIsAuthenticated(true);
    }

    fetchArticles();
    // Đồng bộ lại mỗi 10 giây nếu cấu hình Google Sheets
    const interval = setInterval(fetchArticles, 10000);

    fetch('/data/thuvien_data/thu_vien_index.json')
      .then(res => res.json())
      .then(data => setIndexData(data))
      .catch(err => console.error(err));

    return () => clearInterval(interval);
  }, []);

  const handleVerifyPasskey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passkey.trim() === '') return;
    setIsVerifying(true);
    setErrorMsg('');

    const currentGasUrl = getGasApiUrl();
    if (currentGasUrl) {
      try {
        const res = await fetch(`${currentGasUrl}?action=verifyPasskey&passkey=${encodeURIComponent(passkey)}`);
        const data = await res.json();
        if (data.success && data.valid) {
          setIsAuthenticated(true);
          localStorage.setItem('quant_vip_auth_v2', 'true');
          localStorage.setItem('quant_vip_role', data.role || 'vip');
        } else {
          setErrorMsg(data.message || 'Passkey không hợp lệ hoặc đã bị thu hồi.');
        }
      } catch (err) {
        console.error("Lỗi kết nối API xác thực:", err);
        // Fallback sang local key đề phòng mất kết nối nhưng đã cấu hình
        if (passkey === 'ADMIN' || passkey === 'VIP') {
          setIsAuthenticated(true);
          localStorage.setItem('quant_vip_auth_v2', 'true');
        } else {
          setErrorMsg('Lỗi kết nối API xác thực. Vui lòng thử lại sau.');
        }
      }
    } else {
      // Fallback khi chưa cấu hình GAS
      if (passkey === 'ADMIN' || passkey === 'VIP') {
        setIsAuthenticated(true);
        localStorage.setItem('quant_vip_auth_v2', 'true');
      } else {
        setErrorMsg('Passkey không hợp lệ hoặc đã bị thu hồi.');
      }
    }
    setIsVerifying(false);
  };

  const openReport = (strategy: any) => {
    if (strategy.trang_thai === 'chua_kiem_dinh') return;
    setSelectedStrategyIndex(strategy);
    const targetId = strategy.trang_thai === 'gop' ? strategy.goc : strategy.id;
    
    fetch(`/data/thuvien_data/reports_json/${targetId}.json`)
      .then(res => res.json())
      .then(data => {
        setSelectedReport(data);
      })
      .catch(err => {
        console.error(err);
      });
  };

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
    return (b.oos_ev || -999) - (a.oos_ev || -999);
  });

  const hoOptions = Array.from(new Set((indexData?.danh_sach || []).map((s: any) => s.ho)));

  return (
    <div className="pb-24 pt-6 max-w-7xl mx-auto px-4 space-y-12 relative z-10">
      
      {/* Header */}
      <section className="text-center max-w-4xl mx-auto space-y-6 relative">
        <div className="absolute top-0 right-0 -z-10 opacity-30 transform translate-x-1/4 -translate-y-1/4 pointer-events-none">
          <img src="/assets/quant_3d_cube.png" alt="3D Quant Cube" className="w-64 h-64 object-contain blur-[1px]" />
        </div>
        <div className="inline-flex items-center space-x-2 bg-[#FFD700]/10 border border-[#FFD700]/30 px-4 py-2 rounded-full text-[#FFD700] text-xs font-bold font-mono tracking-widest uppercase mb-2">
          <Star className="w-4 h-4 fill-current" />
          <span>VIP Exclusive Access</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-display font-bold text-white leading-tight">
          Thư Viện <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-green to-[#FFD700]">300 Chiến Lược</span> Giao Dịch
        </h1>
        <p className="text-gray-400 text-sm md:text-base leading-relaxed">
          Kiểm định trên 22 năm dữ liệu: xây trên 2004–2018, so với vào lệnh ngẫu nhiên, đổi tham số ±30%, rồi chấm điểm trên kỳ thi thật 2019–2023 — dữ liệu chiến lược chưa từng thấy, chỉ chạm một lần, đã trừ phí giao dịch.
          <br /><span className="text-[#1D9E75] font-bold">Cập nhật 08/2026 — kỳ thi lần 2 trên 02/2024→07/2026: 15/15 chiến lược CHẤT vẫn giữ vững, 29/38 TÌNH HUỐNG giữ vững. Verdict gốc không đổi.</span>
        </p>

        {indexData && (
          <div className="bg-[#131722] border border-[#1F2937] p-6 rounded-2xl flex flex-wrap justify-center gap-6 shadow-xl">
            <div className="text-center">
              <p className="text-3xl font-display font-bold" style={{ color: VERDICT_COLORS['CHẤT'] }}>{indexData.verdict_da_chay['CHẤT']}</p>
              <p className="text-xs text-gray-400 font-bold font-mono uppercase mt-1">CHẤT</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-display font-bold" style={{ color: VERDICT_COLORS['TÌNH HUỐNG'] }}>{indexData.verdict_da_chay['TÌNH HUỐNG']}</p>
              <p className="text-xs text-gray-400 font-bold font-mono uppercase mt-1">TÌNH HUỐNG</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-display font-bold" style={{ color: VERDICT_COLORS['CHÁT'] }}>{indexData.verdict_da_chay['CHÁT']}</p>
              <p className="text-xs text-gray-400 font-bold font-mono uppercase mt-1">CHÁT</p>
            </div>
            <div className="text-center border-l border-[#1F2937] pl-6">
              <p className="text-3xl font-display font-bold text-gray-300">{indexData.gop}</p>
              <p className="text-xs text-gray-400 font-bold font-mono uppercase mt-1">Bản đối xứng</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-display font-bold text-gray-500">{indexData.chua}</p>
              <p className="text-xs text-gray-400 font-bold font-mono uppercase mt-1">Chưa kiểm định</p>
            </div>
          </div>
        )}

        <div className="bg-[#0B0E14] border border-coral-red/30 p-5 rounded-xl text-left border-l-4 border-l-coral-red">
          <p className="text-sm text-gray-300 leading-relaxed italic">
            "Chỉ 6% chiến lược sống sót kỳ thi thật — và tất cả đều thuộc nhóm đi theo quán tính trung hạn khung H4. Toàn bộ chiến lược Smart Money/ICT viral, scalping khung nhỏ, bắt đỉnh đáy: không cái nào đậu ở dạng quy tắc máy móc."
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-[#131722] p-4 rounded-xl border border-[#1F2937]">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Tìm tên hoặc ID chiến lược..." 
              className="w-full bg-[#0B0E14] border border-[#1F2937] rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-neon-green transition-colors"
            />
          </div>
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <select value={filterHo} onChange={e => setFilterHo(e.target.value)} className="bg-[#0B0E14] border border-[#1F2937] text-gray-300 text-sm rounded-lg px-3 py-2 outline-none">
              <option value="All">Tất cả Nhóm (Họ)</option>
              {hoOptions.map((ho: any) => <option key={ho} value={ho}>{ho}</option>)}
            </select>
            <select value={filterVerdict} onChange={e => setFilterVerdict(e.target.value)} className="bg-[#0B0E14] border border-[#1F2937] text-gray-300 text-sm rounded-lg px-3 py-2 outline-none">
              <option value="All">Tất cả Verdict</option>
              <option value="CHẤT">CHẤT</option>
              <option value="TÌNH HUỐNG">TÌNH HUỐNG</option>
              <option value="CHÁT">CHÁT</option>
              <option value="CHƯA KIỂM ĐỊNH">CHƯA KIỂM ĐỊNH</option>
            </select>
          </div>
        </div>

        <div className="bg-[#131722] border border-[#1F2937] rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#0B0E14] text-gray-300 text-xs font-bold uppercase font-mono tracking-wider border-b border-[#1F2937]">
                  <th className="py-4 px-6 font-medium">Chiến Lược</th>
                  <th className="py-4 px-6 font-medium">Nhóm / TF</th>
                  <th className="py-4 px-6 font-medium">Verdict</th>
                  <th className="py-4 px-6 font-medium">Kỳ thi thật (R)</th>
                  <th className="py-4 px-6 font-medium">Thi lần 2 (24-26)</th>
                  <th className="py-4 px-6 font-medium">Năm lãi</th>
                  <th className="py-4 px-6 font-medium">Số lệnh</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F2937]">
                {filteredList.map((strat: any) => {
                  const hasArticle = adminArticles[strat.id]?.articleContent;
                  return (
                  <tr 
                    key={strat.id} 
                    className={`transition-colors ${strat.trang_thai === 'chua_kiem_dinh' ? 'opacity-60 bg-[#0B0E14]' : 'hover:bg-[#1F2937]/50 cursor-pointer group'}`}
                    onClick={() => openReport(strat)}
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-gray-200 group-hover:text-white transition-colors">{strat.ten}</span>
                        {strat.tin_cay === 'thấp (n mỏng)' && <span title="Cảnh báo n mỏng"><AlertTriangle className="w-4 h-4 text-coral-red flex-shrink-0" /></span>}
                        {hasArticle && <span title="Có bài phân tích"><BookOpen className="w-3 h-3 text-[#FFD700] ml-1 flex-shrink-0" /></span>}
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-gray-400 font-mono bg-[#0B0E14] px-1.5 py-0.5 rounded border border-gray-800">{strat.id}</span>
                        {strat.trang_thai === 'gop' && (
                          <span className="text-xs text-gray-400 italic">Bản đối xứng của {strat.goc}</span>
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
                        {strat.verdict}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`font-bold ${strat.oos_ev > 0 ? 'text-[#1D9E75]' : 'text-[#E24B4A]'}`}>
                        {strat.oos_ev !== undefined ? (strat.oos_ev > 0 ? `+${strat.oos_ev}` : strat.oos_ev) : '-'}
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
                            strat.oos2_status === 'suy yếu' ? 'đã suy yếu trên dữ liệu mới — verdict gốc giữ nguyên, cần theo dõi' : 
                            strat.oos2_status === 'lãi lại' ? 'CHÁT nhưng có lãi 2024–2026: vàng tăng mạnh hiếm thấy giai đoạn này — không đổi kết luận' : 
                            'vẫn rớt'
                          } 
                          className={`font-bold flex items-center space-x-1 ${strat.oos2_status === 'giữ vững' ? 'text-[#1D9E75]' : strat.oos2_status === 'lãi lại' ? 'text-[#888780]' : 'text-[#E24B4A]'}`}
                        >
                          <span>{strat.oos2_ev > 0 ? `+${strat.oos2_ev}` : strat.oos2_ev}</span>
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
      </section>

      {/* MODAL CHI TIẾT */}
      <AnimatePresence>
        {selectedReport && selectedStrategyIndex && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => { setSelectedReport(null); setSelectedStrategyIndex(null); }}
            ></motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.95 }} 
              animate={{ opacity: 1, y: 0, scale: 1 }} 
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="bg-[#131722] border border-[#1F2937] rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-y-auto relative z-10 shadow-2xl"
            >
              <div className="sticky top-0 bg-[#131722]/95 backdrop-blur-md border-b border-[#1F2937] p-6 flex justify-between items-start z-20">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-mono bg-[#0B0E14] px-2 py-1 rounded border border-gray-800 text-gray-400">{selectedReport.spec.id}</span>
                    <span 
                      className="text-xs font-bold px-2 py-1 rounded border uppercase tracking-wider"
                      style={{ color: VERDICT_COLORS[selectedReport.verdict], borderColor: VERDICT_COLORS[selectedReport.verdict], backgroundColor: `${VERDICT_COLORS[selectedReport.verdict]}10` }}
                    >
                      {selectedReport.verdict}
                    </span>
                    {selectedReport.OOS2 && selectedReport.OOS2.status && selectedReport.OOS2.status !== 'không lệnh' && (
                       <span 
                       className={`text-xs font-bold px-2 py-1 rounded border tracking-wider ${
                         selectedReport.OOS2.status === 'giữ vững' ? 'text-[#1D9E75] border-[#1D9E75] bg-[#1D9E75]/10' : 
                         selectedReport.OOS2.status === 'lãi lại' ? 'text-[#888780] border-[#888780] bg-[#888780]/10' : 
                         'text-[#E24B4A] border-[#E24B4A] bg-[#E24B4A]/10'
                       }`}
                     >
                       {selectedReport.OOS2.status === 'giữ vững' ? '✓ Giữ vững (Thi lần 2)' : 
                        selectedReport.OOS2.status === 'suy yếu' ? '⚠ Suy yếu (Thi lần 2)' : 
                        selectedReport.OOS2.status === 'lãi lại' ? 'ⓘ Lãi lại (Thi lần 2)' : 
                        '✗ Vẫn rớt (Thi lần 2)'}
                     </span>
                    )}
                  </div>
                  <h2 className="text-2xl font-display font-bold text-white leading-snug">{selectedReport.spec.ten}</h2>
                  <p className="text-sm text-gray-400 mt-1">{selectedReport.spec.mo_ta}</p>
                </div>
                <button 
                  onClick={() => { setSelectedReport(null); setSelectedStrategyIndex(null); }}
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
                    { key: 'song_sot_oos', label: '③ Qua kỳ thi thật 2019-2023?' },
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
                <div className="bg-[#0B0E14] border border-[#1F2937] rounded-xl overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-[#131722] text-gray-400 font-mono text-xs uppercase border-b border-[#1F2937]">
                        <th className="py-3 px-4">Giai đoạn</th>
                        <th className="py-3 px-4">Số lệnh</th>
                        <th className="py-3 px-4">Lãi/Lỗ TB (R)</th>
                        <th className="py-3 px-4">Tỷ lệ thắng</th>
                        <th className="py-3 px-4">Profit Factor</th>
                        <th className="py-3 px-4">Số năm lãi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1F2937]">
                      <tr>
                        <td className="py-3 px-4 font-bold text-white">Giai đoạn ôn bài (2004–2018)</td>
                        <td className="py-3 px-4 font-mono">{selectedReport.IS.n}</td>
                        <td className={`py-3 px-4 font-mono font-bold ${selectedReport.IS.ev > 0 ? 'text-[#1D9E75]' : 'text-[#E24B4A]'}`}>{selectedReport.IS.ev > 0 ? `+${selectedReport.IS.ev}` : selectedReport.IS.ev}</td>
                        <td className="py-3 px-4 font-mono">{selectedReport.IS.wr}%</td>
                        <td className="py-3 px-4 font-mono">{selectedReport.IS.pf}</td>
                        <td className="py-3 px-4 font-mono">{selectedReport.IS.years_pos}</td>
                      </tr>
                      <tr className="bg-[#1F2937]/20">
                        <td className="py-3 px-4 font-bold text-[#FFD700]">Kỳ thi thật (2019–2023)</td>
                        <td className="py-3 px-4 font-mono">{selectedReport.OOS.n}</td>
                        <td className={`py-3 px-4 font-mono font-bold ${selectedReport.OOS.ev > 0 ? 'text-[#1D9E75]' : 'text-[#E24B4A]'}`}>{selectedReport.OOS.ev > 0 ? `+${selectedReport.OOS.ev}` : selectedReport.OOS.ev}</td>
                        <td className="py-3 px-4 font-mono">{selectedReport.OOS.wr}%</td>
                        <td className="py-3 px-4 font-mono">{selectedReport.OOS.pf}</td>
                        <td className="py-3 px-4 font-mono">{selectedReport.OOS.years_pos}</td>
                      </tr>
                      {selectedReport.OOS2 && (
                        <tr className="bg-[#1F2937]/40 border-t border-[#1F2937]">
                          <td className="py-3 px-4 font-bold text-white">Kỳ thi lần 2 (2024–2026)</td>
                          <td className="py-3 px-4 font-mono">{selectedReport.OOS2.n}</td>
                          <td className={`py-3 px-4 font-mono font-bold ${selectedReport.OOS2.ev > 0 ? 'text-[#1D9E75]' : selectedReport.OOS2.ev < 0 ? 'text-[#E24B4A]' : 'text-gray-500'}`}>{selectedReport.OOS2.ev > 0 ? `+${selectedReport.OOS2.ev}` : selectedReport.OOS2.ev}</td>
                          <td className="py-3 px-4 font-mono">{selectedReport.OOS2.wr}%</td>
                          <td className="py-3 px-4 font-mono">{selectedReport.OOS2.pf}</td>
                          <td className="py-3 px-4 font-mono">{selectedReport.OOS2.years_pos}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="bg-[#131722] border border-[#1F2937] p-4 rounded-xl flex items-center justify-between">
                  <div className="text-sm">
                    <span className="text-gray-400">So với vào lệnh ngẫu nhiên: Chiến lược </span>
                    <span className="text-white font-mono font-bold">{selectedReport.IS.ev}</span>
                    <span className="text-gray-500 mx-2">vs</span>
                    <span className="text-gray-400">ngẫu nhiên </span>
                    <span className="text-white font-mono font-bold">{selectedReport.null.median}</span>
                  </div>
                  <div className="text-sm font-bold border border-[#1F2937] px-3 py-1.5 rounded-lg bg-[#0B0E14]">
                    <span className="text-gray-400">→ hơn </span>
                    <span className={selectedReport.surplus > 0 ? 'text-[#1D9E75]' : 'text-[#E24B4A]'}>
                      {selectedReport.surplus > 0 ? `+${selectedReport.surplus}` : selectedReport.surplus}
                    </span>
                    <span className="text-gray-400"> R/lệnh</span>
                  </div>
                </div>

                {/* Biểu đồ Kỳ thi thật */}
                <div className={`grid grid-cols-1 ${selectedReport.OOS2 ? 'md:grid-cols-2' : ''} gap-6`}>
                  <div className="bg-[#0B0E14] border border-[#1F2937] p-6 rounded-2xl">
                    <h3 className="font-bold text-white mb-4 text-sm">Kỳ thi thật (2019-2023): Lợi nhuận R/lệnh theo năm</h3>
                    <div className="w-full h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={Object.entries(selectedReport.OOS.by_year).map(([year, ev]) => ({ year, ev }))} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                          <ReferenceLine y={0} stroke="#374151" />
                          <XAxis dataKey="year" stroke="#6B7280" fontSize={10} fontStyle="JetBrains Mono" tickLine={false} axisLine={false} />
                          <YAxis stroke="#6B7280" fontSize={10} fontStyle="JetBrains Mono" tickLine={false} axisLine={false} />
                          <Tooltip 
                            cursor={{fill: '#1F2937', opacity: 0.4}}
                            contentStyle={{ backgroundColor: '#131722', border: '1px solid #1F2937', borderRadius: '8px' }}
                            itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold', fontFamily: 'JetBrains Mono' }}
                            labelStyle={{ color: '#9CA3AF', fontSize: '10px' }}
                            formatter={(value) => [`${Number(value) > 0 ? '+' : ''}${value} R`, 'EV']}
                          />
                          <Bar dataKey="ev" shape={<IsometricBar />}>
                            {Object.entries(selectedReport.OOS.by_year).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={(entry[1] as number) > 0 ? '#1D9E75' : '#E24B4A'} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {selectedReport.OOS2 && (
                    <div className="bg-[#0B0E14] border border-[#1F2937] p-6 rounded-2xl">
                      <h3 className="font-bold text-white mb-4 text-sm">Kỳ thi lần 2 (2024-2026): Lợi nhuận R/lệnh theo năm</h3>
                      <div className="w-full h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={Object.entries(selectedReport.OOS2.by_year).map(([year, ev]) => ({ year, ev }))} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                            <ReferenceLine y={0} stroke="#374151" />
                            <XAxis dataKey="year" stroke="#6B7280" fontSize={10} fontStyle="JetBrains Mono" tickLine={false} axisLine={false} />
                            <YAxis stroke="#6B7280" fontSize={10} fontStyle="JetBrains Mono" tickLine={false} axisLine={false} />
                            <Tooltip 
                              cursor={{fill: '#1F2937', opacity: 0.4}}
                              contentStyle={{ backgroundColor: '#131722', border: '1px solid #1F2937', borderRadius: '8px' }}
                              itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold', fontFamily: 'JetBrains Mono' }}
                              labelStyle={{ color: '#9CA3AF', fontSize: '10px' }}
                              formatter={(value) => [`${Number(value) > 0 ? '+' : ''}${value} R`, 'EV']}
                            />
                            <Bar dataKey="ev" shape={<IsometricBar />}>
                              {Object.entries(selectedReport.OOS2.by_year).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={(entry[1] as number) > 0 ? '#1D9E75' : '#E24B4A'} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                </div>

                {/* Article Content / Detailed Report from Admin */}
                <div className="bg-[#0B0E14] border border-[#1F2937] p-6 md:p-8 rounded-2xl mt-6">
                  <div className="flex items-center space-x-2 mb-6 border-b border-[#1F2937] pb-4">
                    <BookOpen className="w-5 h-5 text-[#FFD700]" />
                    <h3 className="font-bold text-xl text-white font-display">Báo Cáo Phân Tích Chuyên Sâu</h3>
                  </div>
                  {isAuthenticated ? (
                    adminArticles[selectedReport.spec.id]?.articleContent ? (
                      <div className="prose prose-invert prose-neon max-w-none prose-h2:text-white prose-h2:border-b prose-h2:border-[#1F2937] prose-h2:pb-2 prose-h3:text-[#FFD700] prose-a:text-[#1D9E75] hover:prose-a:text-[#FFD700] prose-blockquote:border-l-[#1D9E75] prose-blockquote:bg-[#131722] prose-blockquote:px-4 prose-blockquote:py-1 prose-blockquote:rounded-r-lg prose-blockquote:font-mono prose-blockquote:text-sm prose-blockquote:text-gray-300">
                        <ReactMarkdown>
                          {adminArticles[selectedReport.spec.id].articleContent}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-400 font-mono text-sm bg-[#131722] rounded-xl border border-[#1F2937]">
                        <BookOpen className="w-8 h-8 text-gray-600 mx-auto mb-3" />
                        <p>Đội ngũ chuyên gia Quant đang soạn thảo báo cáo phân tích cho chiến lược này.</p>
                        <p>Vui lòng quay lại sau nhé!</p>
                      </div>
                    )
                  ) : (
                    <div className="relative text-center py-12 px-4 rounded-xl border border-dashed border-[#1F2937] bg-[#131722]/50">
                      <div className="absolute inset-0 overflow-hidden rounded-xl">
                        <div className="w-full h-full bg-[linear-gradient(rgba(19,23,34,0)_0%,rgba(19,23,34,0.9)_50%,rgba(19,23,34,1)_100%)] absolute z-10 pointer-events-none"></div>
                        <div className="prose prose-invert max-w-none opacity-30 blur-sm pointer-events-none text-left p-8">
                          <h2 className="text-white text-2xl font-bold mb-4">Điểm yếu chết người của chiến lược này</h2>
                          <p className="mb-4">Đây là phần phân tích chuyên sâu giải thích vì sao chiến lược này thất bại trong thực tế dù backtest có vẻ rất tốt. Lỗi thường gặp nhất là overfitting...</p>
                          <p className="mb-4">Các bẫy tâm lý thường gặp và cách các quỹ lớn lợi dụng liquidity ở các vùng cản quan trọng này:</p>
                          <ul>
                            <li className="mb-2">Dấu hiệu nhận biết fakeout</li>
                            <li className="mb-2">Điểm mù của indicator ở khung H4</li>
                            <li>Cách thiết lập trailing stop an toàn</li>
                          </ul>
                        </div>
                      </div>
                      <div className="relative z-20 max-w-md mx-auto">
                        <div className="w-16 h-16 bg-neon-green/10 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(0,255,163,0.2)]">
                          <Key className="w-8 h-8 text-neon-green" />
                        </div>
                        <h4 className="text-xl font-bold text-white mb-2">Nội Dung Độc Quyền (VIP)</h4>
                        <p className="text-gray-400 text-sm mb-6 leading-relaxed">Bạn cần nhập Passkey để mở khóa các bài phân tích chuyên sâu từ đội ngũ Admin.</p>
                        <form onSubmit={handleVerifyPasskey} className="space-y-4 text-left">
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                              <Key className="w-4 h-4 text-gray-500" />
                            </div>
                            <input type="password" value={passkey} onChange={e => setPasskey(e.target.value)} placeholder="Nhập Passkey..." className="w-full bg-[#0B0E14] border border-[#1F2937] text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-neon-green transition-colors text-center tracking-widest font-mono text-sm" />
                          </div>
                          {errorMsg && <p className="text-coral-red text-xs font-mono text-center flex justify-center items-center space-x-1"><X className="w-3 h-3" /><span>{errorMsg}</span></p>}
                          <button type="submit" disabled={isVerifying} className="w-full bg-neon-green hover:bg-[#00E593] text-black font-bold rounded-xl py-3 transition-all uppercase tracking-wider text-sm flex items-center justify-center space-x-2 disabled:opacity-70">
                            {isVerifying ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div> : <span>Mở Khóa Báo Cáo</span>}
                          </button>
                        </form>

                        <div className="mt-6 pt-4 border-t border-[#1F2937]/50 text-center">
                          <p className="text-xs text-gray-400">
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
