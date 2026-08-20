import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, Settings, Edit2, X, Save, 
  ArrowLeft, Loader2, Database, Search, FileText
} from 'lucide-react';
import { getGasApiUrl, setGasApiUrl } from '../config';

interface AdminDashboardProps {
  setActiveTab: (tab: string) => void;
}

export default function AdminDashboard({ setActiveTab }: AdminDashboardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminKey, setAdminKey] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [gasUrl, setGasUrl] = useState(getGasApiUrl());
  const [strategies, setStrategies] = useState<any[]>([]);
  const [adminData, setAdminData] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStrategy, setEditingStrategy] = useState<any | null>(null);
  const [articleContent, setArticleContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const currentGasUrl = getGasApiUrl();
        if (currentGasUrl) {
          try {
            const resGas = await fetch(`${currentGasUrl}?action=getArticles`);
            const dataGas = await resGas.json();
            if (dataGas.success && dataGas.data) {
              setAdminData(dataGas.data);
              localStorage.setItem('quant_admin_strategies', JSON.stringify(dataGas.data));
            } else {
              throw new Error(dataGas.message || "Không thể tải dữ liệu bài viết");
            }
          } catch (gasErr) {
            console.error("Lỗi khi tải dữ liệu từ Google Sheets, sử dụng Cache:", gasErr);
            const localData = localStorage.getItem('quant_admin_strategies');
            if (localData) {
              setAdminData(JSON.parse(localData));
            }
          }
        } else {
          // Load admin overrides from localStorage
          const localData = localStorage.getItem('quant_admin_strategies');
          if (localData) {
            setAdminData(JSON.parse(localData));
          }
        }

        // Fetch real strategies data
        const res = await fetch('/data/thuvien_data/thu_vien_index.json');
        const data = await res.json();
        if (data && data.danh_sach) {
          setStrategies(data.danh_sach);
        }
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu:", err);
      }
      setIsLoading(false);
    };
    
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setErrorMsg('');
    
    const currentGasUrl = getGasApiUrl();
    if (currentGasUrl) {
      try {
        const res = await fetch(`${currentGasUrl}?action=verifyPasskey&passkey=${encodeURIComponent(adminKey)}`);
        const data = await res.json();
        if (data.success && data.valid && data.role === 'admin') {
          setIsAuthenticated(true);
        } else {
          setErrorMsg(data.message || 'Mã xác thực không có quyền Admin hoặc không hợp lệ.');
        }
      } catch (err) {
        console.error("Lỗi xác thực qua Google Sheet:", err);
        // Fallback sang local admin key đề phòng lỗi kết nối nhưng URL vẫn cấu hình đúng
        if (adminKey === 'SA_ADMIN_2026') {
          setIsAuthenticated(true);
        } else {
          setErrorMsg('Lỗi kết nối Server Sheet. Hoặc sai mật khẩu Master Key.');
        }
      }
    } else {
      // Fallback nếu chưa cấu hình GAS
      if (adminKey === 'SA_ADMIN_2026') {
        setIsAuthenticated(true);
      } else {
        setErrorMsg('Sai mật khẩu Master Key.');
      }
    }
    setIsVerifying(false);
  };

  const openEditModal = (strategy: any) => {
    setEditingStrategy(strategy);
    setArticleContent(adminData[strategy.id]?.articleContent || '');
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!editingStrategy) return;
    setIsSaving(true);
    
    const updatedAdminData = {
      ...adminData,
      [editingStrategy.id]: {
        ...adminData[editingStrategy.id],
        articleContent: articleContent
      }
    };
    
    const currentGasUrl = getGasApiUrl();
    let savedOnGAS = false;
    
    if (currentGasUrl) {
      try {
        const res = await fetch(currentGasUrl, {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8'
          },
          body: JSON.stringify({
            action: 'saveArticle',
            id: editingStrategy.id,
            articleContent: articleContent
          })
        });
        const data = await res.json();
        if (data.success) {
          savedOnGAS = true;
        } else {
          console.error("Lưu trên Google Sheets thất bại:", data.message);
        }
      } catch (err) {
        console.error("Lỗi khi kết nối GAS:", err);
      }
    }
    
    setAdminData(updatedAdminData);
    localStorage.setItem('quant_admin_strategies', JSON.stringify(updatedAdminData));
    
    setIsSaving(false);
    setIsModalOpen(false);
    setEditingStrategy(null);
    
    if (currentGasUrl && !savedOnGAS) {
      alert("Đã lưu bài viết vào Local Cache (Trình duyệt) của bạn thành công, nhưng gặp lỗi khi đồng bộ lên Google Sheets. Vui lòng kiểm tra lại kết nối mạng hoặc URL script.");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#131722] border border-coral-red/30 p-8 rounded-3xl max-w-md w-full shadow-2xl relative overflow-hidden text-center">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-coral-red to-orange-500"></div>
          <div className="w-16 h-16 bg-coral-red/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="w-8 h-8 text-coral-red" />
          </div>
          <h2 className="text-2xl font-display font-bold text-white mb-2">Trung Tâm Quản Trị</h2>
          <p className="text-gray-400 text-sm mb-6">Khu vực dành riêng cho Admin. Nhập Master Key để truy cập.</p>
          <form onSubmit={handleVerify} className="space-y-4">
            <input 
              type="password" value={adminKey} onChange={e => setAdminKey(e.target.value)} 
              placeholder="Nhập Master Key..." 
              className="w-full bg-[#0B0E14] border border-[#1F2937] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-coral-red transition-colors text-center font-mono" 
            />
            {errorMsg && <p className="text-coral-red text-sm font-mono">{errorMsg}</p>}
            <button type="submit" disabled={isVerifying} className="w-full bg-coral-red hover:bg-red-600 text-white font-bold rounded-xl py-3 transition-colors uppercase tracking-wider text-sm flex items-center justify-center space-x-2 disabled:opacity-70">
              {isVerifying ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Đăng nhập hệ thống</span>}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[#1F2937]/50 text-left">
            <details className="group">
              <summary className="text-xs text-gray-400 font-bold font-mono cursor-pointer list-none flex items-center justify-between select-none">
                <span>⚙️ CẤU HÌNH GOOGLE SHEETS API</span>
                <span className="transition-transform group-open:rotate-180 text-[10px]">▼</span>
              </summary>
              <div className="mt-3 space-y-2">
                <input 
                  type="text" 
                  value={gasUrl} 
                  onChange={e => {
                    setGasUrl(e.target.value);
                    setGasApiUrl(e.target.value);
                  }} 
                  placeholder="Nhập URL Google Apps Script Web App..." 
                  className="w-full bg-[#0B0E14] border border-[#1F2937] text-gray-300 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-coral-red font-mono leading-relaxed" 
                />
                <p className="text-[10px] text-gray-500 leading-normal">
                  Nếu để trống, hệ thống sẽ mặc định lưu trữ tạm thời tại <strong>LocalStorage</strong> của trình duyệt. Cung cấp URL Web App để đồng bộ dữ liệu với Google Sheets.
                </p>
              </div>
            </details>
          </div>
        </motion.div>
      </div>
    );
  }

  let filteredStrategies = strategies;
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filteredStrategies = strategies.filter(s => s.ten.toLowerCase().includes(q) || s.id.toLowerCase().includes(q));
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <button onClick={() => setActiveTab('viplibrary')} className="p-2 bg-[#131722] border border-[#1F2937] rounded-lg text-gray-400 hover:text-white hover:border-gray-500 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-display font-bold text-white flex items-center space-x-3">
              <Settings className="w-8 h-8 text-coral-red" />
              <span>Quản Trị Hệ Thống (CMS)</span>
            </h1>
            <p className="text-gray-400 text-sm mt-1">Quản lý Bài Viết Phân Tích (ArticleContent) cho 300 chiến lược.</p>
          </div>
        </div>
        <div className="bg-[#131722] border border-[#1F2937] px-4 py-2 rounded-lg flex items-center space-x-3">
          <Database className="w-5 h-5 text-neon-green" />
          <div className="text-right">
            <p className="text-[10px] text-gray-500 uppercase font-mono tracking-wider">Tổng số chiến lược</p>
            <p className="font-bold text-white leading-none">{strategies.length}</p>
          </div>
        </div>
      </div>

      {/* Google Sheets API Config Card */}
      <div className="bg-[#131722] border border-[#1F2937] p-5 rounded-2xl mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center space-x-3 shrink-0">
          <div className={`p-2 rounded-xl ${gasUrl ? 'bg-neon-green/10 text-neon-green' : 'bg-coral-red/10 text-coral-red'}`}>
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Kết Nối Google Sheet Database</h4>
            <p className="text-xs text-gray-400 mt-0.5">
              Trạng thái: {gasUrl ? <span className="text-neon-green font-bold font-mono">Hoạt động (Google Sheets)</span> : <span className="text-amber-500 font-bold font-mono">Chưa cấu hình (LocalStorage)</span>}
            </p>
          </div>
        </div>
        <div className="w-full md:flex-1 max-w-2xl">
          <input 
            type="text" 
            value={gasUrl} 
            onChange={e => {
              setGasUrl(e.target.value);
              setGasApiUrl(e.target.value);
            }} 
            placeholder="Dán URL Google Apps Script Web App tại đây để chuyển sang Database thực..." 
            className="w-full bg-[#0B0E14] border border-[#1F2937] text-gray-300 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-neon-green font-mono" 
          />
        </div>
      </div>

      <div className="bg-[#131722] border border-[#1F2937] rounded-2xl overflow-hidden shadow-xl flex flex-col h-[70vh]">
        <div className="p-4 border-b border-[#1F2937] flex items-center justify-between bg-[#0B0E14]">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm ID hoặc tên chiến lược..." 
              className="w-full bg-[#131722] border border-[#1F2937] text-white rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-neon-green transition-colors" 
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-neon-green" />
              <p>Đang tải dữ liệu...</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#131722] sticky top-0 z-10 shadow-sm">
                <tr className="text-gray-500 text-[10px] uppercase font-mono tracking-wider border-b border-[#1F2937]">
                  <th className="py-3 px-6 font-medium w-24">ID</th>
                  <th className="py-3 px-6 font-medium">Tên Chiến Lược</th>
                  <th className="py-3 px-6 font-medium">Nhóm</th>
                  <th className="py-3 px-6 font-medium">Trạng Thế Bài Viết</th>
                  <th className="py-3 px-6 font-medium text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F2937]">
                {filteredStrategies.map((strat) => {
                  const hasArticle = adminData[strat.id]?.articleContent && adminData[strat.id].articleContent.trim() !== '';
                  return (
                    <tr key={strat.id} className="hover:bg-[#1F2937]/30 transition-colors">
                      <td className="py-4 px-6 font-mono text-xs text-gray-400">{strat.id}</td>
                      <td className="py-4 px-6">
                        <p className="font-bold text-gray-200">{strat.ten}</p>
                        <p className="text-xs text-gray-500 mt-1">Verdict: {strat.verdict}</p>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-400">{strat.ho}</td>
                      <td className="py-4 px-6">
                        {hasArticle ? (
                          <span className="inline-flex items-center space-x-1 text-neon-green text-xs font-bold px-2 py-1 bg-neon-green/10 rounded-md border border-neon-green/20">
                            <FileText className="w-3 h-3" />
                            <span>Đã viết bài</span>
                          </span>
                        ) : (
                          <span className="text-gray-600 text-xs italic">Chưa có bài</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button 
                          onClick={() => openEditModal(strat)}
                          className="p-2 bg-[#1F2937] rounded-lg text-gray-300 hover:text-white hover:bg-neon-green hover:text-black transition-colors"
                          title="Chỉnh sửa Bài Viết"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal Chỉnh Sửa Bài Viết */}
      <AnimatePresence>
        {isModalOpen && editingStrategy && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[#131722] border border-[#1F2937] rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col relative z-10 shadow-2xl">
              <div className="flex items-center justify-between p-6 border-b border-[#1F2937] shrink-0">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-neon-green" />
                    <span>Viết Bài Phân Tích: {editingStrategy.ten}</span>
                  </h3>
                  <p className="text-xs text-gray-500 font-mono mt-1">ID: {editingStrategy.id} | Dữ liệu định lượng là Read-Only.</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white p-2 bg-[#1F2937] rounded-full transition-colors"><X className="w-5 h-5" /></button>
              </div>

              <div className="p-6 overflow-y-auto flex-1">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono text-gray-400 uppercase mb-2">Nội dung bài viết (Hỗ trợ Markdown)</label>
                    <textarea 
                      rows={16} 
                      value={articleContent} 
                      onChange={e => setArticleContent(e.target.value)} 
                      placeholder="Dùng Markdown: **in đậm**, ## Tiêu đề lớn, > trích dẫn..."
                      className="w-full bg-[#0B0E14] border border-[#1F2937] text-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-neon-green focus:ring-1 focus:ring-neon-green transition-all font-mono text-sm leading-relaxed"
                    ></textarea>
                    <p className="text-xs text-gray-500 mt-2 italic">Lưu ý: Mọi con số định lượng (Winrate, EV...) sẽ được tải tự động từ Data thật. Anh chỉ cần viết bình luận/cảnh báo ở đây.</p>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-[#1F2937] bg-[#0B0E14] rounded-b-2xl flex justify-end shrink-0">
                <div className="space-x-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-xl text-gray-400 hover:text-white transition-colors font-bold text-sm">Hủy</button>
                  <button type="button" onClick={handleSave} disabled={isSaving} className="px-6 py-2.5 rounded-xl bg-neon-green text-black hover:bg-[#00E593] transition-colors font-bold text-sm flex items-center space-x-2 disabled:opacity-70">
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>Lưu Bài Viết</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
