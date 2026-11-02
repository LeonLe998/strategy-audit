import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldAlert, Settings, Edit2, X, Save,
  ArrowLeft, Loader2, Database, Search, FileText,
  Check, CircleCheck, CircleX, Sparkles
} from 'lucide-react';
import { getGasApiUrl, setGasApiUrl } from '../config';

interface AdminDashboardProps {
  setActiveTab: (tab: string) => void;
}

interface PasskeyRow {
  passkey: string;
  role: 'vip' | 'admin' | string;
  status: 'active' | 'inactive' | string;
  expiry: string;
  expiresAt?: string | null;
  expired?: boolean;
  description: string;
  updatedAt?: string;
}

const EXPIRY_PRESETS = [
  { value: 'lifetime', label: 'lifetime — Vĩnh viễn' },
  { value: '14 ngày', label: '14 ngày — Gói trải nghiệm' },
  { value: '30 ngày', label: '30 ngày — Gói 1 tháng' },
  { value: '90 ngày', label: '90 ngày — Gói 3 tháng' },
  { value: '365 ngày', label: '365 ngày — Gói 1 năm' },
];

function generateRandomKey(prefix = 'SA-VIP') {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let part = '';
  for (let i = 0; i < 6; i++) {
    part += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}-${part}`;
}

export default function AdminDashboard({ setActiveTab }: AdminDashboardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminKey, setAdminKey] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [activePanel, setActivePanel] = useState<'passkeys' | 'articles'>('passkeys');
  const [gasUrl, setGasUrl] = useState(getGasApiUrl());
  const [strategies, setStrategies] = useState<any[]>([]);
  const [adminData, setAdminData] = useState<Record<string, any>>({});
  const [passkeys, setPasskeys] = useState<PasskeyRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPasskeyBusy, setIsPasskeyBusy] = useState(false);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  // Form tạo Passkey mới
  const [newKey, setNewKey] = useState(() => generateRandomKey('SA-VIP'));
  const [newRole, setNewRole] = useState<'vip' | 'admin'>('vip');
  const [newStatus, setNewStatus] = useState<'active' | 'inactive'>('active');
  const [newExpiryMode, setNewExpiryMode] = useState<string>('30 ngày');
  const [newCustomDate, setNewCustomDate] = useState<string>('');
  const [newDesc, setNewDesc] = useState<string>('');

  // Cấu hình & kiểm tra thông báo Telegram
  const [tgConfigured, setTgConfigured] = useState<boolean | null>(null);
  const [tgBotToken, setTgBotToken] = useState<string>('');
  const [tgChatId, setTgChatId] = useState<string>('');
  const [tgOpen, setTgOpen] = useState<boolean>(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStrategy, setEditingStrategy] = useState<any | null>(null);
  const [articleContent, setArticleContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const showNotice = (msg: string) => {
    setStatusNotice(msg);
    window.setTimeout(() => {
      setStatusNotice((prev) => (prev === msg ? null : prev));
    }, 4500);
  };

  const loadPasskeys = useCallback(async (keyToUse = adminKey) => {
    const currentGasUrl = getGasApiUrl();
    if (!currentGasUrl || !keyToUse) return;
    try {
      const res = await fetch(`${currentGasUrl}?action=getPasskeys&passkey=${encodeURIComponent(keyToUse)}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.passkeys)) {
        setPasskeys(data.passkeys);
      }
      if (data.telegram) {
        setTgConfigured(Boolean(data.telegram.configured));
        if (data.telegram.chatId && !tgChatId) {
          setTgChatId(data.telegram.chatId);
        }
      }
    } catch (err) {
      console.error('Lỗi tải danh sách passkeys:', err);
    }
  }, [adminKey]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const currentGasUrl = getGasApiUrl();
        if (currentGasUrl) {
          await Promise.all([
            loadPasskeys(adminKey),
            fetch(`${currentGasUrl}?action=getArticles&passkey=${encodeURIComponent(adminKey)}`)
              .then((r) => r.json())
              .then((dataGas) => {
                if (dataGas.success && dataGas.data) {
                  setAdminData(dataGas.data);
                }
              })
              .catch((gasErr) => console.error('Lỗi khi tải dữ liệu từ Google Sheets:', gasErr)),
          ]);
        }

        const res = await fetch('/data/thuvien_data/thu_vien_index.json');
        const data = await res.json();
        if (data && data.danh_sach) {
          setStrategies(data.danh_sach);
        }
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu:', err);
      }
      setIsLoading(false);
    };

    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated, adminKey, loadPasskeys]);

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
        console.error('Lỗi xác thực qua Google Sheet:', err);
        setErrorMsg('Lỗi kết nối Server Sheet. Thử lại sau.');
      }
    } else {
      setErrorMsg('Chưa cấu hình URL Google Apps Script.');
    }
    setIsVerifying(false);
  };

  // Lưu thay đổi Passkey (tạo mới hoặc đổi trực tiếp ở Dropdown trên bảng)
  const savePasskeyItem = async (item: {
    passkey: string;
    oldPasskey?: string;
    role: string;
    status: string;
    expiry: string;
    description: string;
  }) => {
    const currentGasUrl = getGasApiUrl();
    if (!currentGasUrl) return;
    setIsPasskeyBusy(true);
    try {
      const res = await fetch(currentGasUrl, {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'savePasskey',
          passkey: adminKey,
          item,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showNotice(`Đã đồng bộ Passkey "${item.passkey}" (${item.status} · ${item.expiry}) lên Google Sheet!`);
        await loadPasskeys(adminKey);
      } else {
        alert(data.message || 'Không thể lưu Passkey. Hãy chắc chắn đã cập nhật code google-apps-script.js mới nhất.');
      }
    } catch (err) {
      console.error('Lỗi lưu passkey:', err);
      alert('Lỗi kết nối Google Apps Script.');
    }
    setIsPasskeyBusy(false);
  };

  const handleCreatePasskey = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanKey = newKey.trim();
    if (!cleanKey) return;
    const finalExpiry = newExpiryMode === 'custom' ? (newCustomDate || 'lifetime') : newExpiryMode;
    await savePasskeyItem({
      passkey: cleanKey,
      role: newRole,
      status: newStatus,
      expiry: finalExpiry,
      description: newDesc.trim() || (newRole === 'admin' ? 'Quản trị viên' : `Thành viên (${finalExpiry})`),
    });
    setNewKey(generateRandomKey(newRole === 'admin' ? 'LEON-ADM' : 'SA-VIP'));
    setNewDesc('');
  };

  const handleDeletePasskey = async (targetPasskey: string) => {
    const currentGasUrl = getGasApiUrl();
    if (!currentGasUrl) return;
    setIsPasskeyBusy(true);
    try {
      const res = await fetch(currentGasUrl, {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'deletePasskey',
          passkey: adminKey,
          targetPasskey,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showNotice(`Đã xóa mã "${targetPasskey}" khỏi Google Sheet.`);
        await loadPasskeys(adminKey);
      } else {
        alert(data.message || 'Không thể xóa Passkey.');
      }
    } catch (err) {
      console.error('Lỗi xóa passkey:', err);
    }
    setIsPasskeyBusy(false);
  };

  const handleSetupSheetDropdowns = async () => {
    const currentGasUrl = getGasApiUrl();
    if (!currentGasUrl) return;
    setIsPasskeyBusy(true);
    try {
      const res = await fetch(currentGasUrl, {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'setupPasskeySheet',
          passkey: adminKey,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showNotice(data.message || 'Đã cài đặt Dropdown trên Google Sheet và khóa mã mặc định cũ!');
        await loadPasskeys(adminKey);
      } else {
        alert(data.message || 'Hãy cập nhật file google-apps-script.js mới lên Apps Script trước.');
      }
    } catch (err) {
      console.error('Lỗi cài đặt sheet:', err);
    }
    setIsPasskeyBusy(false);
  };

  const handleTestTelegram = async () => {
    const currentGasUrl = getGasApiUrl();
    if (!currentGasUrl) return;
    setIsPasskeyBusy(true);
    try {
      const res = await fetch(currentGasUrl, {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'testTelegram',
          passkey: adminKey,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showNotice(data.message || 'Đã gửi tin nhắn thử về Telegram!');
      } else {
        setTgOpen(true);
        alert(data.message || 'Chưa gửi được Telegram. Anh kiểm tra lại TELEGRAM_BOT_TOKEN và TELEGRAM_CHAT_ID bên dưới nhé.');
      }
    } catch (err) {
      console.error('Lỗi test Telegram:', err);
    }
    setIsPasskeyBusy(false);
  };

  const handleSaveTelegramConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentGasUrl = getGasApiUrl();
    if (!currentGasUrl) return;
    setIsPasskeyBusy(true);
    try {
      const res = await fetch(currentGasUrl, {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'saveTelegramConfig',
          passkey: adminKey,
          botToken: tgBotToken.trim(),
          chatId: tgChatId.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTgConfigured(true);
        setTgOpen(false);
        showNotice(data.message || 'Đã lưu cấu hình Telegram & gửi tin nhắn thử thành công!');
      } else {
        alert(data.message || 'Không gửi được tin nhắn Telegram. Hãy kiểm tra lại Bot Token và Chat ID.');
      }
    } catch (err) {
      console.error('Lỗi lưu cấu hình Telegram:', err);
    }
    setIsPasskeyBusy(false);
  };

  const openEditModal = (strategy: any) => {
    setEditingStrategy(strategy);
    setArticleContent(adminData[strategy.id]?.articleContent || '');
    setIsModalOpen(true);
  };

  const restoreOriginal = async () => {
    if (!editingStrategy) return;
    try {
      const res = await fetch(`/.netlify/functions/vip?action=article&original=1&id=${encodeURIComponent(editingStrategy.id)}`, {
        headers: { 'x-passkey': adminKey },
      });
      const data = await res.json();
      if (res.ok && data.full && data.content) {
        setArticleContent(data.content);
      } else {
        alert('Không tìm thấy file bài viết gốc!');
      }
    } catch (err) {
      console.error(err);
      alert('Lỗi khi tải bài viết gốc.');
    }
  };

  const handleSave = async () => {
    if (!editingStrategy) return;
    setIsSaving(true);

    const updatedAdminData = {
      ...adminData,
      [editingStrategy.id]: {
        ...adminData[editingStrategy.id],
        articleContent: articleContent,
      },
    };

    const currentGasUrl = getGasApiUrl();
    let savedOnGAS = false;

    if (currentGasUrl) {
      try {
        const res = await fetch(currentGasUrl, {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8',
          },
          body: JSON.stringify({
            action: 'saveArticle',
            passkey: adminKey,
            id: editingStrategy.id,
            articleContent: articleContent,
          }),
        });
        const data = await res.json();
        if (data.success) {
          savedOnGAS = true;
        } else {
          console.error('Lưu trên Google Sheets thất bại:', data.message);
        }
      } catch (err) {
        console.error('Lỗi khi kết nối GAS:', err);
      }
    }

    setAdminData(updatedAdminData);

    setIsSaving(false);
    setIsModalOpen(false);
    setEditingStrategy(null);

    if (currentGasUrl && !savedOnGAS) {
      alert('Đã lưu bài viết vào bộ nhớ tạm của trình duyệt, nhưng gặp lỗi khi đồng bộ lên Google Sheets.');
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
          <p className="text-gray-400 text-sm mb-6">Khu vực dành riêng cho Admin. Nhập Master Key để quản lý Passkey & Bài viết.</p>
          <form onSubmit={handleVerify} className="space-y-4">
            <input
              type="password"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
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
                  onChange={(e) => {
                    setGasUrl(e.target.value);
                    setGasApiUrl(e.target.value);
                  }}
                  placeholder="Nhập URL Google Apps Script Web App..."
                  className="w-full bg-[#0B0E14] border border-[#1F2937] text-gray-300 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-coral-red font-mono leading-relaxed"
                />
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
    filteredStrategies = strategies.filter((s) => s.ten.toLowerCase().includes(q) || s.id.toLowerCase().includes(q));
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center space-x-4">
          <button onClick={() => setActiveTab('viplibrary')} className="p-2 bg-[#131722] border border-[#1F2937] rounded-lg text-gray-400 hover:text-white hover:border-gray-500 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-white flex items-center space-x-3">
              <Settings className="w-7 h-7 text-coral-red" />
              <span>Quản Trị Hệ Thống (Passkey & CMS)</span>
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Đồng bộ 2 chiều với Google Sheets: chọn Dropdown trên Sheet hoặc trên Web đều tự động kích hoạt ngay.
            </p>
          </div>
        </div>

        {/* Bộ chuyển Tab: Quản lý Passkey vs Quản lý Bài viết */}
        <div className="flex items-center gap-2 bg-[#0B0E14] p-1.5 rounded-xl border border-[#1F2937]">
          <button
            type="button"
            onClick={() => setActivePanel('passkeys')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activePanel === 'passkeys'
                ? 'bg-neon-green text-black shadow-lg'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            🔑 Quản lý Passkey ({passkeys.length})
          </button>
          <button
            type="button"
            onClick={() => setActivePanel('articles')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activePanel === 'articles'
                ? 'bg-neon-green text-black shadow-lg'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            📝 Bài viết 300 Chiến lược
          </button>
        </div>
      </div>

      {statusNotice && (
        <div className="mb-6 flex items-center justify-between rounded-xl border border-neon-green/40 bg-neon-green/10 px-4 py-3 text-sm text-neon-green">
          <span className="flex items-center gap-2 font-medium">
            <CircleCheck className="w-4 h-4 shrink-0" />
            {statusNotice}
          </span>
          <button type="button" onClick={() => setStatusNotice(null)} className="text-xs underline">
            Đóng
          </button>
        </div>
      )}

      {activePanel === 'passkeys' ? (
        <div className="space-y-6">
          {/* Thanh công cụ đồng bộ Dropdown Google Sheet & Khóa mã mặc định cũ */}
          <div className="bg-[#131722] border border-[#1F2937] p-5 rounded-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-xl">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-neon-green" />
                <span>Đồng bộ Dropdown Thời hạn (`expiry` / `lifetime`) với Google Sheet</span>
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Khi anh chọn thời hạn ở Dropdown bên dưới (hoặc chọn trực tiếp ở cột <strong>expiry</strong> trong tab <code>passkeys</code> trên Google Sheet: <code>lifetime</code>, <code>14 ngày</code>, <code>30 ngày</code>, <code>90 ngày</code>, <code>365 ngày</code>), Web sẽ tự động kích hoạt và đếm thời hạn ngay lập tức.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                disabled={isPasskeyBusy}
                onClick={handleSetupSheetDropdowns}
                className="px-4 py-2.5 rounded-xl bg-coral-red/15 border border-coral-red/40 text-coral-red hover:bg-coral-red hover:text-white transition-colors text-xs font-bold disabled:opacity-50"
              >
                🔒 Khóa mã cũ (VIP / SA_ADMIN_2026) & Kẻ Dropdown trên Sheet
              </button>
              <button
                type="button"
                disabled={isPasskeyBusy}
                onClick={handleTestTelegram}
                className="px-4 py-2.5 rounded-xl bg-cyan-500/15 border border-cyan-400/40 text-cyan-300 hover:bg-cyan-400 hover:text-black transition-colors text-xs font-bold disabled:opacity-50"
              >
                🔔 Gửi thử tin nhắn Telegram
              </button>
              <button
                type="button"
                onClick={() => setTgOpen((v) => !v)}
                className="px-3.5 py-2.5 rounded-xl bg-[#1F2937] text-gray-200 hover:bg-gray-700 transition-colors text-xs font-bold"
              >
                ⚙️ Cấu hình Telegram {tgConfigured === false ? '(Chưa có Token)' : ''}
              </button>
              <button
                type="button"
                disabled={isPasskeyBusy}
                onClick={() => loadPasskeys(adminKey)}
                className="px-4 py-2.5 rounded-xl bg-[#1F2937] text-gray-200 hover:bg-gray-700 transition-colors text-xs font-bold"
              >
                🔄 Làm mới từ Sheet
              </button>
            </div>
          </div>

          {tgOpen && (
            <form onSubmit={handleSaveTelegramConfig} className="bg-[#131722] border border-cyan-400/30 p-5 rounded-2xl shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-cyan-300 font-mono uppercase">
                  🔔 Cấu hình Bot Telegram nhận thông báo khách nhập liệu (Sáu Ô · Thành Viên · Hồ Sơ Nghiên Cứu)
                </h4>
                <button type="button" onClick={() => setTgOpen(false)} className="text-xs text-gray-400 hover:text-white">
                  Đóng
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-gray-400 mb-1">TELEGRAM_BOT_TOKEN (từ @BotFather)</label>
                  <input
                    type="text"
                    value={tgBotToken}
                    onChange={(e) => setTgBotToken(e.target.value)}
                    placeholder="VD: 123456789:AAH..."
                    className="w-full bg-[#0B0E14] border border-[#1F2937] text-white rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-gray-400 mb-1">TELEGRAM_CHAT_ID (ID cá nhân hoặc nhóm)</label>
                  <input
                    type="text"
                    value={tgChatId}
                    onChange={(e) => setTgChatId(e.target.value)}
                    placeholder="VD: 987654321 hoặc -100..."
                    className="w-full bg-[#0B0E14] border border-[#1F2937] text-white rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={isPasskeyBusy}
                    className="w-full py-2 px-4 rounded-xl bg-cyan-400 text-black font-bold text-xs hover:bg-cyan-300 transition-colors disabled:opacity-50"
                  >
                    Lưu & Gửi tin nhắn Test về Telegram
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Form Tạo Passkey Mới với Dropdown Quyền, Trạng thái, Thời hạn */}
          <form onSubmit={handleCreatePasskey} className="bg-[#131722] border border-[#1F2937] p-5 rounded-2xl shadow-xl space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              + Tạo hoặc Cập nhật Passkey mới
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <div>
                <label className="block text-[11px] font-mono text-gray-400 mb-1">Mã Passkey</label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={newKey}
                    onChange={(e) => setNewKey(e.target.value)}
                    placeholder="VD: SA-VIP-8899"
                    className="w-full bg-[#0B0E14] border border-[#1F2937] text-white rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-neon-green"
                  />
                  <button
                    type="button"
                    onClick={() => setNewKey(generateRandomKey(newRole === 'admin' ? 'LEON-ADM' : 'SA-VIP'))}
                    title="Tạo mã ngẫu nhiên"
                    className="px-2.5 py-2 bg-[#1F2937] hover:bg-gray-700 text-xs rounded-xl text-gray-200 shrink-0"
                  >
                    🎲
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-gray-400 mb-1">Quyền (Role Dropdown)</label>
                <select
                  value={newRole}
                  onChange={(e) => {
                    const r = e.target.value as 'vip' | 'admin';
                    setNewRole(r);
                    if (newKey.startsWith('SA-VIP-') && r === 'admin') setNewKey(generateRandomKey('LEON-ADM'));
                  }}
                  className="w-full bg-[#0B0E14] border border-[#1F2937] text-white rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-neon-green"
                >
                  <option value="vip">vip — Thành viên VIP</option>
                  <option value="admin">admin — Quản trị viên</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-gray-400 mb-1">Trạng thái (Status Dropdown)</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as 'active' | 'inactive')}
                  className="w-full bg-[#0B0E14] border border-[#1F2937] text-white rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-neon-green"
                >
                  <option value="active">active — Kích hoạt ngay</option>
                  <option value="inactive">inactive — Tạm khóa</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-gray-400 mb-1">Thời hạn (Expiry Dropdown)</label>
                <select
                  value={newExpiryMode}
                  onChange={(e) => setNewExpiryMode(e.target.value)}
                  className="w-full bg-[#0B0E14] border border-[#1F2937] text-white rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-neon-green"
                >
                  {EXPIRY_PRESETS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                  <option value="custom">📅 Chọn ngày hết hạn cụ thể...</option>
                </select>
                {newExpiryMode === 'custom' && (
                  <input
                    type="date"
                    value={newCustomDate}
                    onChange={(e) => setNewCustomDate(e.target.value)}
                    className="mt-2 w-full bg-[#0B0E14] border border-[#1F2937] text-white rounded-xl px-3 py-1.5 text-xs font-mono"
                  />
                )}
              </div>

              <div>
                <label className="block text-[11px] font-mono text-gray-400 mb-1">Ghi chú (Học viên / Gói)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="VD: Anh Minh - Gói 1 tháng"
                    className="w-full bg-[#0B0E14] border border-[#1F2937] text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-neon-green"
                  />
                  <button
                    type="submit"
                    disabled={isPasskeyBusy}
                    className="px-4 py-2 rounded-xl bg-neon-green text-black font-bold text-xs hover:bg-[#00E593] transition-colors shrink-0 disabled:opacity-50"
                  >
                    Lưu
                  </button>
                </div>
              </div>
            </div>
          </form>

          {/* Bảng danh sách Passkey với Dropdown chỉnh trực tiếp */}
          <div className="bg-[#131722] border border-[#1F2937] rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#0B0E14] border-b border-[#1F2937]">
                  <tr className="text-gray-400 text-[11px] uppercase font-mono tracking-wider">
                    <th className="py-3.5 px-5">Mã Passkey</th>
                    <th className="py-3.5 px-4">Quyền (Dropdown)</th>
                    <th className="py-3.5 px-4">Trạng thái (Dropdown)</th>
                    <th className="py-3.5 px-4">Thời hạn / Expiry (Dropdown)</th>
                    <th className="py-3.5 px-4">Hiệu lực trên Web</th>
                    <th className="py-3.5 px-4">Ghi chú</th>
                    <th className="py-3.5 px-5 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1F2937] text-sm">
                  {passkeys.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-gray-400 text-xs">
                        Chưa tải được danh sách Passkey. Anh hãy dán file <code>google-apps-script.js</code> mới vào Apps Script → Deploy → New version rồi bấm <strong>Làm mới từ Sheet</strong> nhé!
                      </td>
                    </tr>
                  ) : (
                    passkeys.map((row) => {
                      const isLegacyInsecure = row.passkey === 'VIP' || row.passkey === 'SA_ADMIN_2026';
                      const isActiveAndValid = row.status === 'active' && !row.expired;
                      const presetValues = EXPIRY_PRESETS.map((p) => p.value);
                      const hasPreset = presetValues.includes(row.expiry);
                      return (
                        <tr key={row.passkey} className="hover:bg-[#1F2937]/25 transition-colors">
                          <td className="py-3.5 px-5 font-mono font-bold text-white">
                            <div className="flex items-center gap-2">
                              <span>{row.passkey}</span>
                              {isLegacyInsecure && row.status === 'active' && (
                                <span className="px-2 py-0.5 text-[10px] rounded bg-coral-red/20 text-coral-red border border-coral-red/40">
                                  Cần khóa
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Dropdown Quyền (Role) */}
                          <td className="py-3.5 px-4">
                            <select
                              value={row.role}
                              disabled={isPasskeyBusy}
                              onChange={(e) =>
                                savePasskeyItem({
                                  ...row,
                                  role: e.target.value,
                                })
                              }
                              className="bg-[#0B0E14] border border-[#1F2937] text-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-mono focus:border-neon-green focus:outline-none"
                            >
                              <option value="vip">vip</option>
                              <option value="admin">admin</option>
                            </select>
                          </td>

                          {/* Dropdown Trạng thái (Status) */}
                          <td className="py-3.5 px-4">
                            <select
                              value={row.status}
                              disabled={isPasskeyBusy}
                              onChange={(e) =>
                                savePasskeyItem({
                                  ...row,
                                  status: e.target.value,
                                })
                              }
                              className={`bg-[#0B0E14] border rounded-lg px-2.5 py-1.5 text-xs font-mono focus:outline-none ${
                                row.status === 'active'
                                  ? 'border-neon-green/40 text-neon-green'
                                  : 'border-gray-700 text-gray-400'
                              }`}
                            >
                              <option value="active">active (Mở)</option>
                              <option value="inactive">inactive (Khóa)</option>
                            </select>
                          </td>

                          {/* Dropdown Thời hạn (Expiry: lifetime / 14 ngày / 30 ngày / 90 ngày / 365 ngày) */}
                          <td className="py-3.5 px-4">
                            <select
                              value={row.expiry}
                              disabled={isPasskeyBusy}
                              onChange={(e) =>
                                savePasskeyItem({
                                  ...row,
                                  expiry: e.target.value,
                                })
                              }
                              className="bg-[#0B0E14] border border-[#1F2937] text-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-mono focus:border-neon-green focus:outline-none"
                            >
                              {!hasPreset && (
                                <option value={row.expiry}>{row.expiry}</option>
                              )}
                              {EXPIRY_PRESETS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </td>

                          {/* Trạng thái hiệu lực thực tế trên Web */}
                          <td className="py-3.5 px-4 text-xs">
                            {isActiveAndValid ? (
                              <span className="inline-flex items-center gap-1 text-neon-green font-mono">
                                <Check className="w-3.5 h-3.5" />
                                {row.expiresAt ? `Còn hạn đến ${row.expiresAt}` : 'Vĩnh viễn (lifetime)'}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-coral-red font-mono">
                                <CircleX className="w-3.5 h-3.5" />
                                {row.expired ? `Hết hạn (${row.expiresAt})` : 'Đã khóa (inactive)'}
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-xs text-gray-300">{row.description || '—'}</td>

                          <td className="py-3.5 px-5 text-right">
                            <button
                              type="button"
                              disabled={isPasskeyBusy}
                              onClick={() => handleDeletePasskey(row.passkey)}
                              className="px-2.5 py-1 rounded-lg bg-coral-red/10 text-coral-red hover:bg-coral-red hover:text-white text-xs font-mono transition-colors"
                            >
                              Xóa
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <>
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
                onChange={(e) => {
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
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
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
                      <th className="py-3 px-6 font-medium">Trạng Thái Bài Viết</th>
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
        </>
      )}

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
                      onChange={(e) => setArticleContent(e.target.value)}
                      placeholder="Dùng Markdown: **in đậm**, ## Tiêu đề lớn, > trích dẫn..."
                      className="w-full bg-[#0B0E14] border border-[#1F2937] text-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-neon-green focus:ring-1 focus:ring-neon-green transition-all font-mono text-sm leading-relaxed"
                    ></textarea>
                    <p className="text-xs text-gray-500 mt-2 italic">Lưu ý: Mọi con số định lượng (Số lệnh, Tỉ lệ thắng, Số năm dương...) được tải tự động từ dữ liệu kiểm định.</p>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-[#1F2937] bg-[#0B0E14] rounded-b-2xl flex justify-between items-center shrink-0">
                <button type="button" onClick={restoreOriginal} className="px-4 py-2.5 rounded-xl border border-coral-red text-coral-red hover:bg-coral-red/10 transition-colors font-bold text-xs">
                  Khôi phục bài gốc
                </button>
                <div className="space-x-3 flex items-center">
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
