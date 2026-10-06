import React, { useState, useEffect, useRef } from 'react';
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
  const [isLoadingArticle, setIsLoadingArticle] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isImportingArticles, setIsImportingArticles] = useState(false);
  const [importStatus, setImportStatus] = useState('');
  const [isImportConfirmOpen, setIsImportConfirmOpen] = useState(false);
  const importLockRef = useRef(false);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setAdminData({});
      try {
        const currentGasUrl = getGasApiUrl();
        if (currentGasUrl) {
          try {
            const response = await fetch(`${currentGasUrl}?action=getArticleIndex&passkey=${encodeURIComponent(adminKey)}`, { cache: 'no-store' });
            const data = await response.json();
            if (data.success && data.authenticated && data.data) setAdminData(data.data);
            else throw new Error(data.message || 'Không thể tải danh sách bài từ Google Sheets.');
            setImportStatus('');
          } catch (gasError) {
            console.error('Không tải được danh sách bài từ Google Sheets:', gasError);
            setAdminData({});
            const message = gasError instanceof Error ? gasError.message : 'Lỗi kết nối không xác định.';
            setImportStatus(`Chưa tải được trạng thái bài từ Google Sheets: ${message}`);
          }
        }
        const response = await fetch('/data/thuvien_data/thu_vien_index.json');
        if (!response.ok) throw new Error('Không tải được danh mục chiến lược trên máy.');
        const data = await response.json();
        if (data?.danh_sach) setStrategies(data.danh_sach);
      } catch (err) {
        console.error('Lỗi tải dữ liệu quản trị:', err);
        setAdminData({});
      } finally {
        setIsLoading(false);
      }
    };
    if (isAuthenticated) loadData();
  }, [isAuthenticated, adminKey]);
  const handleImportPublicArticles = () => {
    if (!gasUrl || !adminKey || strategies.length === 0 || isImportingArticles) return;
    setIsImportConfirmOpen(true);
  };
  const startImportPublicArticles = async () => {
    if (!gasUrl || !adminKey || strategies.length === 0 || importLockRef.current) return;
    importLockRef.current = true;
    setIsImportConfirmOpen(false);
    setIsImportingArticles(true);
    setImportStatus('Đang đọc các bài viết hiện có...');
    try {
      const sourceArticles: Array<{ id: string; articleContent: string }> = [];
      const missingIds: string[] = [];
      for (let start = 0; start < strategies.length; start += 8) {
        const group = strategies.slice(start, start + 8);
        const results = await Promise.all(group.map(async (strategy) => {
          const id = String(strategy.id || '').trim();
          if (!/^[A-Za-z0-9_-]{1,80}$/.test(id)) return { id, content: null };
          try {
            const response = await fetch(`/data/vip_articles/VIP_${encodeURIComponent(id)}.md`, { cache: 'no-store' });
            if (!response.ok) return { id, content: null };
            const contentType = (response.headers.get('content-type') || '').toLowerCase();
            const content = await response.text();
            if (contentType.includes('text/html') || /^\s*(?:<!doctype\s+html|<html[\s>])/i.test(content)) return { id, content: null };
            return { id, content };
          } catch {
            return { id, content: null };
          }
        }));
        for (const result of results) {
          if (result.content === null) missingIds.push(result.id);
          else sourceArticles.push({ id: result.id, articleContent: result.content });
        }
        setImportStatus(`Đã tìm thấy ${sourceArticles.length} bài; đang quét ${Math.min(start + group.length, strategies.length)}/${strategies.length} chiến lược...`);
      }
      if (sourceArticles.length === 0) throw new Error('Không tìm thấy tệp bài viết public để nhập.');

      let imported = 0;
      let skipped = 0;
      let removedInvalid = 0;
      for (let start = 0; start < sourceArticles.length; start += 10) {
        const batch = sourceArticles.slice(start, start + 10);
        const response = await fetch(gasUrl, {
          method: 'POST',
          mode: 'cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action: 'importArticles', passkey: adminKey, articles: batch }),
        });
        const data = await response.json();
        if (!response.ok || !data.success) throw new Error(data.message || `Máy chủ từ chối lô bắt đầu tại ${start + 1}.`);
        imported += Number(data.imported || 0);
        skipped += Number(data.skipped || 0);
        removedInvalid += Number(data.removedInvalid || 0);
        setImportStatus(`Đã xử lý ${Math.min(start + batch.length, sourceArticles.length)}/${sourceArticles.length} bài...`);
      }
      setImportStatus('Hoàn tất: thêm ' + imported + ', giữ nguyên ' + skipped + ' bài hợp lệ; đã dọn ' + removedInvalid + ' hàng HTML lỗi; thiếu tệp Markdown: ' + missingIds.length + '.');
      setAdminData((current) => {
        const next = { ...current };
        for (const article of sourceArticles) {
          if (!next[article.id]) next[article.id] = { articleContent: article.articleContent };
        }
        return next;
      });
    } catch (err) {
      console.error('Lỗi nhập thư viện VIP:', err);
      setImportStatus(err instanceof Error ? `Chưa hoàn tất: ${err.message}` : 'Chưa hoàn tất do lỗi kết nối.');
    } finally {
      setIsImportingArticles(false);
      importLockRef.current = false;
    }
  };
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
        setErrorMsg('Không thể kết nối đến máy chủ xác thực. Vui lòng kiểm tra đường truyền và thử lại.');
      }
    } else {
      setErrorMsg('Hệ thống chưa được cấu hình địa chỉ máy chủ xác thực API.');
    }
    setIsVerifying(false);
  };

  const openEditModal = async (strategy: any) => {
    setEditingStrategy(strategy);
    setArticleContent('');
    setIsModalOpen(true);
    setIsLoadingArticle(true);
    try {
      const currentGasUrl = getGasApiUrl();
      const response = await fetch(`${currentGasUrl}?action=getArticle&id=${encodeURIComponent(strategy.id)}&passkey=${encodeURIComponent(adminKey)}`, { cache: 'no-store' });
      const data = await response.json();
      if (data.success && data.authenticated) {
        const content = data.articleContent || '';
        setArticleContent(content);
        setAdminData((current) => ({ ...current, [strategy.id]: { ...current[strategy.id], hasArticle: Boolean(content.trim()), articleContent: content } }));
      } else if (data.notFound) {
        setArticleContent('');
      } else {
        throw new Error(data.message || 'Không tải được nội dung bài viết.');
      }
    } catch (err) {
      console.error('Không tải được nội dung bài viết:', err);
      setImportStatus(err instanceof Error ? `Không tải được bài ${strategy.id}: ${err.message}` : `Không tải được bài ${strategy.id}.`);
    } finally {
      setIsLoadingArticle(false);
    }
  };

  const restoreSavedArticle = () => {
    if (!editingStrategy) return;
    setArticleContent(adminData[editingStrategy.id]?.articleContent || '');
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
            passkey: adminKey,
            id: editingStrategy.id,
            articleContent: articleContent
          })
        });
        const data = await res.json();
        if (data.success) {
          savedOnGAS = true;
        } else {
          console.error("Lưu trên Google Sheets thất bại:", data.message);
          alert("Lỗi lưu trên máy chủ: " + (data.message || 'Không có quyền truy cập'));
          setIsSaving(false);
          return;
        }
      } catch (err) {
        console.error("Lỗi khi kết nối GAS:", err);
        alert("Lỗi kết nối máy chủ. Bài viết chưa được lưu lên Google Sheets.");
        setIsSaving(false);
        return;
      }
    }
    
    setAdminData(updatedAdminData);
    
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

      <div className="bg-[#131722] border border-[#1F2937] p-5 rounded-2xl mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-white">Chuyển bài VIP vào Google Sheets</h4>
          <p className="text-xs text-gray-400 mt-1">Nhập bài Markdown thật; giữ bài hợp lệ đã có và báo riêng ID không có tệp.</p>
          {importStatus && <p className="text-xs text-neon-green mt-2" role="status">{importStatus}</p>}
        </div>
        <button type="button" onClick={handleImportPublicArticles} disabled={!gasUrl || !adminKey || isLoading || isImportingArticles || strategies.length === 0} className="shrink-0 px-5 py-3 rounded-xl bg-neon-green text-black font-bold text-xs disabled:opacity-50">
          {isImportingArticles ? 'Đang chuyển...' : 'Nhập thư viện bài VIP'}
        </button>
      </div>
      {isImportConfirmOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
          <div role="dialog" aria-modal="true" aria-labelledby="import-confirm-title" className="w-full max-w-lg rounded-2xl border border-[#1F2937] bg-[#131722] p-6 shadow-2xl">
            <h3 id="import-confirm-title" className="text-xl font-bold text-white">Xác nhận nhập thư viện VIP</h3>
            <p className="mt-3 text-sm leading-6 text-gray-300">Hệ thống sẽ đọc các tệp Markdown, giữ nguyên bài hợp lệ đã có, dọn hàng HTML lỗi và chỉ thêm bài chưa có. Anh muốn tiếp tục chứ?</p>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setIsImportConfirmOpen(false)} className="rounded-xl border border-[#334155] px-4 py-2.5 text-sm font-bold text-gray-200 hover:bg-[#1f2937]">Hủy</button>
              <button type="button" onClick={startImportPublicArticles} className="rounded-xl bg-neon-green px-4 py-2.5 text-sm font-bold text-black hover:brightness-110">Bắt đầu nhập</button>
            </div>
          </div>
        </div>
      )}
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
                  const hasArticle = Boolean(adminData[strat.id]?.hasArticle || (adminData[strat.id]?.articleContent && adminData[strat.id].articleContent.trim() !== ''));
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
                      disabled={isLoadingArticle}
                      onChange={e => setArticleContent(e.target.value)} 
                      placeholder={isLoadingArticle ? 'Đang tải nội dung từ Google Sheets...' : 'Dùng Markdown: **in đậm**, ## Tiêu đề lớn, > trích dẫn...'}
                      className="w-full bg-[#0B0E14] border border-[#1F2937] text-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-neon-green focus:ring-1 focus:ring-neon-green transition-all font-mono text-sm leading-relaxed"
                    ></textarea>
                    <p className="text-xs text-gray-500 mt-2 italic">Lưu ý: Mọi con số định lượng (Winrate, EV...) sẽ được tải tự động từ Data thật. Anh chỉ cần viết bình luận/cảnh báo ở đây.</p>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-[#1F2937] bg-[#0B0E14] rounded-b-2xl flex justify-between items-center shrink-0">
                <button type="button" onClick={restoreSavedArticle} className="px-4 py-2.5 rounded-xl border border-coral-red text-coral-red hover:bg-coral-red/10 transition-colors font-bold text-xs">
                  Khôi phục nội dung đã lưu
                </button>
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
