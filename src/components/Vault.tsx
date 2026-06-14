/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lock, 
  Download, 
  User, 
  Phone, 
  Mail, 
  Loader2, 
  FileText, 
  ChevronRight, 
  Printer, 
  X,
  AlertCircle
} from 'lucide-react';

interface VaultProps {
  setActiveTab: (tab: string) => void;
}

// Lead Thư viện POST về CÙNG Apps Script với form Intake, kèm source:'library_vault'.
// doPost nhận diện source này -> ghi sang tab riêng "Leads_ThuVien" rồi thoát sớm (không sinh YAML quant).
const VAULT_LEADS_WEBHOOK = 'https://script.google.com/macros/s/AKfycbxmgHECJwBIDzREA03oUMrabWIWhmNVhJ5-YVoXhT3ofaeGcVpjk6twZNiR3q5qJ4eAYA/exec';

export default function Vault({}: VaultProps) {
  // Lock system states
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // PDF Viewer states
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const [, setIsPrinting] = useState<boolean>(false);

  const vaultDocs = [
    {
      id: 'risk-of-ruin',
      title: 'Sự Thật Về Risk Of Ruin (Xác Suất Cháy Quỹ)',
      desc: 'Công thức chứng minh tại sao 90% trader chết vì quản lý vốn sai lầm, và Winrate cao là một ảo tưởng.',
      category: 'Quản trị rủi ro',
      pages: 3,
      content: {
        intro: 'Nhiều trader nghĩ rằng nếu họ có tỷ lệ thắng (Win Rate) cao thì tài khoản của họ an toàn. Đây là một sai lầm chết người trong giao dịch tài chính.',
        body1: 'Xác suất cháy quỹ (Risk of Ruin - RoR) là một hàm toán học phức tạp được cấu thành từ 3 biến số độc lập bắt buộc phải chạy cùng nhau: \n1. Tỷ lệ thắng thực tế của hệ thống.\n2. Tỷ lệ Thưởng/Rủi ro (Risk:Reward trung bình thực tế, không phải kỳ vọng).\n3. Phần trăm rủi ro trên mỗi lệnh so với tổng số vốn.',
        body2: 'Hệ quả logic: RoR là một hàm số mũ, nó không giảm dần đều mà đi theo dạng "Cliff effect" (Hiệu ứng bờ vực). Nghĩa là ở một mức rủi ro nhất định (ví dụ 1%), RoR của bạn có thể bằng 0%. Nhưng chỉ cần bạn tăng rủi ro lên 3% hoặc 5%, RoR không tăng lên 3% hay 5%, mà nó bùng nổ thẳng lên 100% (cháy tài khoản chắc chắn xảy ra trong dài hạn).',
        body3: 'Mọi người thường tập trung vào việc nâng Win Rate lên 70% - 80% và tin rằng mình không thể cháy tài khoản. Thực tế, ngay cả với một chiến lược có Win Rate 60%, về mặt xác suất, trong một mẫu gồm 1.000 lệnh, việc xuất hiện một chuỗi thua liên tiếp 10 đến 12 lệnh là hoàn toàn bình thường và CHẮC CHẮN sẽ xảy ra.\n▪ Nếu bạn rủi ro 1%/lệnh: Chuỗi thua 10 lệnh khiến bạn sụt giảm 10% tài khoản. Bạn hoàn toàn sống sót để tiếp tục.\n▪ Nếu bạn rủi ro 5%/lệnh: Chuỗi thua 10 lệnh sẽ thổi bay 50% tài khoản. Để quay lại bờ, bạn cần một mức tăng trưởng 100% trên số vốn còn lại. Lúc này, tâm lý giao dịch hoàn toàn bị bẻ gẫy.',
        truth: 'Đối với quỹ cấp vốn (Prop Firm - như FTMO, Funding Pips,...), định nghĩa về "Ruin" khắt khe hơn rất nhiều: Nếu bạn cầm quỹ 100.000$ với Max Drawdown 10%, bản chất số vốn thực bạn được quyền kiểm soát chỉ là $10,000. Nếu bạn rủi ro 1% trên tổng quy mô quỹ ($1,000), thì thực chất bạn đang rủi ro tới 10% trên số vốn sống sót của mình. Đó là lý do tại sao tỷ lệ tạch challenge quỹ luôn lớn hơn 95%.'
      }
    },
    {
      id: 'alpha-vs-beta',
      title: 'Alpha vs Beta trong Giao Dịch Định Lượng',
      desc: 'Phân tích bản chất: Bạn đang kiếm tiền nhờ kỹ năng thực sự (Alpha) hay chỉ đang ăn may theo sóng thị trường (Beta)?',
      category: 'Mô hình hóa',
      pages: 2,
      content: {
        intro: 'Trong giới tài chính định lượng, lợi nhuận của bạn luôn được bóc tách làm 2 phần: Beta (Sóng thị trường) và Alpha (Kỹ năng cốt lõi tạo lợi thế tuyệt đối).',
        body1: 'Beta đại diện cho lợi nhuận kiếm được nhờ chuyển động chung của thị trường. Ví dụ: Bạn mua Bitcoin vào năm 2021 và nhân 3 tài khoản. Đây hoàn toàn không phải do tài năng của bạn, thị trường đi lên mãnh liệt, ai mua cũng thắng. Đây gọi là lợi nhuận Beta.',
        body2: 'Alpha đại diện cho lợi thế vượt trội thực tế của hệ thống. Nó tạo ra lợi nhuận độc lập, bất kể thị trường đang sập mạnh (giai đoạn Downtrend) hay đi ngang mỏi mệt hay biến động giật cục.',
        body3: 'Tại sao một chiến lược bạn backtest 2 năm qua có lợi thế cực tốt, nhưng cứ lắp vào chạy Real là lỗ nặng? Vì 2 năm qua là một chu kỳ cụ thể (Market Regime). Chiến lược của bạn đã bị ép vừa vặn để khớp với Beta của 2 năm đó. Khi thị trường đổi pha, Beta biến mất, và vì chiến lược của bạn thực tế không hề sở hữu Alpha thực thụ, hệ thống sụp đổ ngay lập tức.',
        truth: 'Làm sao để đo lường Alpha thực sự?\n- Hệ thống phải tự chứng minh sống sót qua nhiều pha biến động khác nhau.\n- Chỉ số Sharpe Ratio (Đo lường lợi nhuận trên rủi ro biến động) lớn hơn 1.0 thực tế.\n- Hệ số Walk-Forward Efficiency (WFE) phải lớn hơn hoặc bằng 0.5 để chứng thực lợi nhuận thu về không đến từ sự khớp số ngẫu nhiên.'
      }
    },
    {
      id: 'curve-fitting',
      title: 'Hiểu Đúng Về Bẫy Khớp Đường Cong (Curve-fitting)',
      desc: 'Tại sao Backtest x10 tài khoản nhưng trade real thì cháy? Bóc trần sự thật về Overfitting.',
      category: 'Tối ưu hóa',
      pages: 2,
      content: {
        intro: 'Hãy tưởng tượng bạn bắn một mũi tên vào tường, sau đó bạn đi đến và vẽ một vòng tròn hồng tâm bao quanh mũi tên đó. Trông bạn sẽ y như một xạ thủ thiên tài. Đó chính xác là những gì 95% trader đang làm khi Backtest.',
        body1: 'Curve-fitting (Khớp đường cong hay Overfitting) là hành động bạn liên tục thay đổi thông số của chỉ báo (đổi RSI từ 14 sang 9, đổi MA từ 50 sang 37, dời điểm chốt lời...) cho đến khi đường cong lợi nhuận trong quá khứ trông thật lung linh.',
        body2: 'Hậu quả tàn khốc: Thị trường không bao giờ lặp lại quá khứ y hệt 100%. Khi bạn ép hệ thống của mình phải vừa khít với dữ liệu trong quá khứ, bạn đã tước đi hoàn toàn khả năng tự thích nghi linh hoạt của nó trước dữ liệu tương lai (Out-of-sample). Do đó, khi đưa vào chạy Live, bạn sẽ chịu thua lỗ ngay lập tức.',
        body3: 'Liều thuốc duy nhất kiểm chứng bẫy này là Walk-Forward Optimization (WFO). Thay vì tối ưu toàn bộ quá khứ cùng lúc, WFO chia nhỏ dữ liệu thành nhiều cửa sổ: Tối ưu trên Cửa sổ 1 (In-sample), sau đó đem thông số đó chạy test mù trên Cửa sổ 2 (Out-of-sample) chưa từng tiếp xúc. Quy trình trượt này lặp lại hàng chục lần đảm bảo tính toán ổn định tối hậu.',
        truth: 'Một chiến lược chỉ thực sự sẵn sàng nếu đồ thị lợi nhuận Out-of-sample tiếp nối trơn tru với In-sample, chứng tỏ hệ thống có khả năng thích nghi tốt.'
      }
    }
  ];

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (name.trim().length < 2) {
      setErrorMessage('Vui lòng nhập họ tên hợp lệ (ít nhất 2 ký tự).');
      return;
    }
    const phoneRegex = /^[+]?[0-9\s-]{8,15}$/;
    if (!phoneRegex.test(phone.trim())) {
      setErrorMessage('Số điện thoại không hợp lệ (từ 8-15 số, cho phép dấu +).');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage('Email không đúng định dạng (vd: name@domain.com).');
      return;
    }

    setIsLoading(true);

    // Gửi lead về Google Sheet (fire-and-forget: lỗi mạng không chặn mở khóa)
    if (VAULT_LEADS_WEBHOOK && !VAULT_LEADS_WEBHOOK.startsWith('__')) {
      try {
        await fetch(VAULT_LEADS_WEBHOOK, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            source: 'library_vault',
            name: name.trim(),
            phone: phone.trim(),
            email: email.trim(),
            submitted_at: new Date().toISOString(),
          }),
        });
      } catch (err) {
        console.error('Vault lead webhook error:', err);
      }
    }

    setIsLoading(false);
    setIsUnlocked(true);
  };

  const openDocument = (id: string) => {
    if (!isUnlocked) return;
    setActiveDocId(id);
  };

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 500);
  };

  const selectedDoc = vaultDocs.find(d => d.id === activeDocId);

  return (
    <div id="vault-view" className="space-y-16 pb-20 pt-6">
      
      {/* 1. Vault Header */}
      <section className="text-center max-w-4xl mx-auto px-4">
        <span className="text-xs uppercase tracking-widest font-mono text-[#00FFA3] font-bold bg-[#00FFA3]/10 px-3 py-1 rounded">The Vault</span>
        <h1 className="text-3xl md:text-5xl font-display font-bold mt-4 text-white">Tài Liệu Cốt Lõi (Internal Library)</h1>
        <p className="text-gray-400 text-sm mt-3.5 leading-relaxed max-w-2xl mx-auto">
          Những tài liệu nghiên cứu chuyên sâu về rủi ro và tối ưu Walk-Forward định lượng. Bản lưu hành nội bộ, đính kèm dấu xác nhận cá nhân khi mở khóa.
        </p>
      </section>

      {/* 2. Lock Overlay / Document list Grid */}
      <section className="max-w-7xl mx-auto px-4 relative">
        {!isUnlocked ? (
          /* Locked State Layout */
          <div className="max-w-4xl mx-auto space-y-12">
            {/* Locked Visual Previews */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-40 select-none pointer-events-none">
              {vaultDocs.map((doc) => (
                <div key={doc.id} className="bg-[#131722] border border-[#1F2937] rounded-2xl p-6 h-60 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-neon-green font-mono uppercase">{doc.category}</span>
                    <h3 className="text-base font-bold text-white mt-1.5 line-clamp-2">{doc.title}</h3>
                    <p className="text-gray-400 text-xs mt-2 line-clamp-3 leading-relaxed">{doc.desc}</p>
                  </div>
                  <div className="flex items-center space-x-1.5 text-[10px] text-gray-500 font-mono font-bold uppercase">
                    <FileText className="w-3.5 h-3.5" />
                    <span>PDF • {doc.pages} Pages</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Unlock Request Form */}
            <div className="bg-[#131722]/90 border border-[#1F2937] rounded-3xl p-6 md:p-10 max-w-lg mx-auto relative z-20 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
              <div className="text-center space-y-2 mb-8">
                <div className="w-12 h-12 bg-neon-green/10 border border-[#00FFA3]/30 rounded-xl flex items-center justify-center mx-auto text-neon-green mb-3">
                  <Lock className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-display font-medium text-white uppercase">Truy cập mã khóa đặc quyền</h2>
                <p className="text-gray-400 text-xs px-4">
                  Cung cấp thông tin của bạn để đóng dấu bản quyền kỹ thuật số và tải trực tiếp tài liệu nghiên cứu.
                </p>
              </div>

              <form onSubmit={handleUnlock} className="space-y-4">
                {errorMessage && (
                  <div className="flex items-start space-x-2 p-3 bg-coral-red/10 border border-coral-red/20 rounded-xl text-xs text-coral-red">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Name */}
                <div className="space-y-1">
                  <label className="text-xs text-gray-400 font-medium flex items-center">
                    <User className="w-3.5 h-3.5 mr-1.5 text-neon-green" />
                    Họ và Tên
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nhập họ tên của bạn (Tên ghi nhận bản quyền)"
                    className="w-full bg-[#0B0E14] border border-[#1F2937] focus:border-neon-green/60 rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition duration-200"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <label className="text-xs text-gray-400 font-medium flex items-center">
                    <Phone className="w-3.5 h-3.5 mr-1.5 text-neon-green" />
                    Số Điện Thoại
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Nhập số điện thoại của bạn"
                    className="w-full bg-[#0B0E14] border border-[#1F2937] focus:border-neon-green/60 rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition duration-200"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="text-xs text-gray-400 font-medium flex items-center">
                    <Mail className="w-3.5 h-3.5 mr-1.5 text-neon-green" />
                    Địa Chỉ Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Nhập địa chỉ email của bạn"
                    className="w-full bg-[#0B0E14] border border-[#1F2937] focus:border-neon-green/60 rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition duration-200"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 rounded-xl bg-[#00FFA3] text-black font-semibold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(0,255,163,0.2)] hover:scale-[1.01] active:scale-[0.99] transition duration-200 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-black" />
                      <span>Đang mã hóa tài liệu...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 text-black" />
                      <span>Tạo File Cá Nhân & Mở Khóa Ngay</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* Unlocked State List showing Docs to inspect and generate PDF */
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="bg-neon-green/5 border border-neon-green/20 p-4 rounded-2xl flex items-center justify-between text-xs text-neon-green max-w-xl mx-auto">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-neon-green" />
                <span>Bản quyền kỹ thuật số cấp cho: <strong>{name}</strong> ({email})</span>
              </div>
              <span className="text-[10px] uppercase bg-neon-green/10 border border-[#00FFA3]/30 px-2.5 py-0.5 rounded font-mono font-bold">Verified</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {vaultDocs.map((doc) => (
                <div 
                  key={doc.id} 
                  id={`doc-card-${doc.id}`}
                  onClick={() => openDocument(doc.id)}
                  className="bg-[#131722] border border-[#1F2937] hover:border-[#00FFA3]/50 transition-all duration-300 rounded-2xl p-6 flex flex-col justify-between cursor-pointer group"
                >
                  <div>
                    <span className="text-[10px] text-neon-green font-mono uppercase tracking-wider">{doc.category}</span>
                    <h3 className="text-base font-bold text-white mt-1.5 group-hover:text-neon-green transition-colors duration-200">{doc.title}</h3>
                    <p className="text-gray-400 text-xs mt-3 leading-relaxed font-sans">{doc.desc}</p>
                  </div>
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#1F2937]/50">
                    <span className="text-[9px] text-gray-500 font-mono font-bold uppercase">PDF • {doc.pages} Pages</span>
                    <div className="flex items-center text-xs text-neon-green font-semibold">
                      <span>Mở khóa xem</span>
                      <ChevronRight className="w-4 h-4 ml-0.5 group-hover:translate-x-1 transition duration-200" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* 3. Interactive Report PDF Viewer Modal */}
      <AnimatePresence>
        {activeDocId && selectedDoc && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            id="pdf-viewer-overlay"
            className="fixed inset-0 z-50 bg-[#0B0E14]/95 flex items-center justify-center p-4 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-[#131722] border border-[#1F2937] rounded-3xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden relative shadow-[0_0_50px_rgba(0,0,0,0.8)]"
            >
              {/* Modal controls header */}
              <div className="px-6 py-4 border-b border-[#1F2937] flex items-center justify-between shrink-0">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 bg-neon-green rounded-full"></div>
                  <span className="font-mono text-xs uppercase tracking-wider text-gray-400">PDF Reader • Bản Lưu Hành Nội Bộ</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={handlePrint}
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-[#0B0E14] border border-[#1F2937] hover:border-white transition-all text-gray-300 text-xs font-mono"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>PRINT/PDF</span>
                  </button>
                  <button 
                    onClick={() => setActiveDocId(null)}
                    className="p-1.5 rounded-lg bg-[#0B0E14] border border-[#1F2937] hover:bg-white/5 text-gray-400 hover:text-white transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Printable Document Body Container */}
              <div 
                id="printable-pdf-content" 
                className="flex-1 overflow-y-auto p-6 md:p-12 space-y-10 selection:bg-neon-green selection:text-black font-sans bg-white text-[#111827] print:p-12 print:bg-white"
              >
                {/* PDF Header cover stamp details */}
                <div className="border-b border-gray-200 pb-8 flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                  <div>
                    <h1 className="font-display font-black text-2xl md:text-3xl text-[#111827] tracking-tight uppercase leading-none">STRATEGY AUDIT</h1>
                    <p className="font-mono text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Research & Quantitative Whitepaper</p>
                  </div>
                  
                  {/* Digital Stamp Sign-off info */}
                  <div className="border border-red-500/30 bg-red-50/50 p-3 rounded-lg flex items-center space-x-2.5 text-left md:max-w-xs font-mono">
                    <div className="shrink-0 w-8 h-8 rounded-full border border-red-500/30 flex items-center justify-center text-red-500 text-[10px] font-black">
                      SEC
                    </div>
                    <div className="text-[9px] text-gray-600 space-y-0.5">
                      <p className="font-bold text-red-600 uppercase tracking-widest">BẢN LƯU HÀNH NỘI BỘ</p>
                      <p>Độc quyền cấp cho: <strong className="text-black">{name || 'Khách Hàng'}</strong></p>
                      <p>SĐT: {phone} | Email: {email}</p>
                    </div>
                  </div>
                </div>

                {/* Major Report Body */}
                <div className="space-y-6">
                  <h2 className="font-display font-extrabold text-xl text-black pb-2 border-b border-gray-100">{selectedDoc.title}</h2>
                  <p className="text-sm font-semibold text-gray-800 leading-relaxed italic border-l-4 border-[#00FFA3] pl-4">
                    {selectedDoc.content.intro}
                  </p>
                  
                  <div className="text-sm text-gray-700 leading-relaxed space-y-4 font-light">
                    {selectedDoc.content.body1.split('\n').map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-xs text-gray-800 space-y-2 leading-relaxed">
                    <p className="font-bold uppercase text-black flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1 text-[#FF3366]" />
                      Phân tích cốt lõi
                    </p>
                    {selectedDoc.content.body2.split('\n').map((para, i) => (
                      <p key={i} className="font-light">{para}</p>
                    ))}
                  </div>

                  <div className="text-sm text-gray-700 leading-relaxed space-y-4 font-light">
                    {selectedDoc.content.body3.split('\n').map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </div>

                  <div className="bg-[#111827] text-white p-6 rounded-2xl border border-gray-800 mt-8">
                    <h4 className="font-mono text-xs uppercase tracking-widest text-[#00FFA3] font-bold mb-2">QUYẾT NGHỊ QUẢN TRỊ RỦI RO ĐỊNH LƯỢNG</h4>
                    {selectedDoc.content.truth.split('\n').map((line, i) => (
                      <p key={i} className="text-xs text-gray-300 leading-relaxed mt-1">{line}</p>
                    ))}
                  </div>
                </div>

                {/* Footer sign-off and watermark */}
                <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center text-[10px] text-gray-400 font-mono">
                  <span>Strategy Audit © {new Date().getFullYear()} • Intellectual Property</span>
                  <span>Direct Advisor: Lê Vĩnh Phú (Leon) - Zalo: 05.6666.5511</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
