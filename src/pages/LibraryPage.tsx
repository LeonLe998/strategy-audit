import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, CheckCircle2, XCircle, FileText, Lock, Unlock, ArrowRight, X, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import html2pdf from 'html2pdf.js';
import PDFTemplate from '../components/PDFTemplate';

const SectionWrapper: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => {
  return (
    <motion.section 
      className={className}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      viewport={{ once: true, margin: "-100px" }}
    >
      {children}
    </motion.section>
  );
};

const LibraryPage: React.FC = () => {
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const [isUnlocked, setIsUnlocked] = useState<{ [key: string]: boolean }>({});
  const [formData, setFormData] = useState({ name: '', phone: '', email: '' });
  const [error, setError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownloadClick = (docTitle: string) => {
    if (isUnlocked[docTitle]) {
      // Trigger download if already unlocked
      generatePDF(docTitle);
    } else {
      setSelectedDoc(docTitle);
      setError('');
    }
  };

  const generatePDF = (docTitle: string) => {
    setIsGenerating(true);
    const element = document.getElementById('pdf-template-container');
    
    // Setup html2pdf options
    const opt = {
      margin:       0,
      filename:     `Strategy_Audit_${docTitle.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' },
      pagebreak:    { mode: ['css', 'legacy'] }
    };

    // Temporarily make it visible for rendering if it was display:none, but we use fixed off-screen so it's fine.
    try {
      html2pdf().from(element).set(opt).save().then(() => {
        setIsGenerating(false);
        setSelectedDoc(null); // Close modal on successful download
      }).catch((err: any) => {
        console.error("PDF Generation Error:", err);
        setIsGenerating(false);
        alert("Lỗi tạo PDF: " + (err.message || err.toString()));
      });
    } catch (err: any) {
      console.error("html2pdf initialization error:", err);
      setIsGenerating(false);
      alert("Lỗi khởi tạo PDF: " + (err.message || err.toString()));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.email) {
      setError('Vui lòng điền đầy đủ thông tin để nhận tài liệu.');
      return;
    }
    if (!formData.email.includes('@')) {
      setError('Email không hợp lệ.');
      return;
    }
    
    // Success - Unlock the current document
    if (selectedDoc) {
      setIsUnlocked(prev => ({ ...prev, [selectedDoc]: true }));
      // Automatically trigger download
      generatePDF(selectedDoc);
    }
  };

  const documents = [
    { title: 'Sự Thật Về Risk Of Ruin (Xác Suất Cháy Quỹ)', desc: 'Công thức chứng minh tại sao 90% trader chết vì quản lý vốn sai lầm, và Winrate cao là một ảo tưởng.' },
    { title: 'Alpha vs Beta trong Giao Dịch Định Lượng', desc: 'Phân tích bản chất: Bạn đang kiếm tiền nhờ kỹ năng thực sự (Alpha) hay chỉ đang ăn may theo sóng thị trường (Beta)?' },
    { title: 'Hiểu Đúng Về Bẫy Khớp Đường Cong (Curve-fitting)', desc: 'Tại sao Backtest x10 tài khoản nhưng trade real thì cháy? Bóc trần sự thật về Overfitting.' }
  ];

  return (
    <div 
      className="flex flex-col min-h-screen relative bg-fixed bg-cover bg-center pt-16"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1639322537228-f710d846310a?q=80&w=2000&auto=format&fit=crop')" }}
    >
      {/* Hidden PDF Container for html2pdf */}
      <div className="absolute top-0 left-0 w-[800px] opacity-0 pointer-events-none z-[-50] overflow-hidden h-[1px]">
        <div id="pdf-template-container">
          {selectedDoc && (
            <PDFTemplate 
              documentType={selectedDoc} 
              customerName={formData.name || 'Khách Hàng'} 
              customerEmail={formData.email || 'Email'} 
            />
          )}
        </div>
      </div>

      <div className="absolute inset-0 bg-[#0B0E14]/90 z-0 pointer-events-none"></div>

      {/* Tier 1: The Bouncer */}
      <SectionWrapper className="relative z-10 max-w-5xl mx-auto px-4 py-16 md:py-24 w-full">
        <div className="bg-[#131722]/80 backdrop-blur-xl border-l-4 border-l-[#FF3366] border-y border-r border-[#FF3366]/20 rounded-r-xl p-8 md:p-12 shadow-[0_0_40px_rgba(255,51,102,0.1)]">
          <div className="flex items-center space-x-4 mb-6">
            <ShieldAlert className="w-10 h-10 text-[#FF3366]" />
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-wide uppercase">Trước Khi Bạn Bắt Đầu...</h1>
          </div>
          <p className="text-gray-300 text-lg leading-relaxed mb-6">
            Đây không phải là thư viện dành cho đám đông thích "làm giàu nhanh". Chúng tôi áp dụng chuẩn mực của các Quỹ Định Lượng (Quant Funds) chuyên nghiệp. Vì vậy, hãy làm rõ những sự thật tàn nhẫn sau:
          </p>
          <ul className="space-y-4 text-gray-400">
            <li className="flex items-start">
              <XCircle className="w-6 h-6 text-[#FF3366] mr-3 shrink-0" />
              <span>Chúng tôi <strong>KHÔNG</strong> bán Chén Thánh (Holy Grail) hay những hệ thống cam kết lợi nhuận 50%/tháng. Mọi cam kết lợi nhuận cố định đều là lừa đảo.</span>
            </li>
            <li className="flex items-start">
              <XCircle className="w-6 h-6 text-[#FF3366] mr-3 shrink-0" />
              <span>Chúng tôi <strong>KHÔNG</strong> giao dịch bằng linh cảm. Nếu bạn tin rằng "cảm giác nến" tốt hơn xác suất toán học, xin mời đóng trang web này lại.</span>
            </li>
            <li className="flex items-start">
              <XCircle className="w-6 h-6 text-[#FF3366] mr-3 shrink-0" />
              <span>Chúng tôi <strong>KHÔNG</strong> xây dựng bot để gồng lỗ (Martingale/Grid). Một hệ thống không có điểm cắt lỗ rõ ràng là một quả bom nổ chậm.</span>
            </li>
          </ul>
        </div>
      </SectionWrapper>

      {/* Tier 2: Reality Check */}
      <SectionWrapper className="relative z-10 w-full py-16 bg-gradient-to-b from-transparent to-[#131722]/50 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-[#00FFA3] text-sm uppercase tracking-widest font-bold mb-2">Thức Tỉnh (Reality Check)</h3>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Tư Duy Cảm Tính vs Tư Duy Định Lượng</h2>
            <p className="text-gray-400 text-sm mt-2 max-w-3xl mx-auto">
              Chiến lược không cần "đẹp" trên biểu đồ quá khứ, nó cần kiếm được tiền ở tương lai. Việc bạn ngồi chỉnh sửa thông số Bot liên tục cho khớp với lịch sử chỉ là tự lừa dối bản thân.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Strategy A */}
            <div className="bg-[#0B0E14]/80 backdrop-blur-md border border-[#FF3366]/30 rounded-2xl p-8 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-[#FF3366]"></div>
              <h3 className="text-2xl font-bold text-[#FF3366] mb-2">Chiến Lược A: "Trực Giác"</h3>
              <p className="text-gray-400 text-sm mb-8 h-10">Chỉ dùng hình thái nến và RSI đơn thuần, tối ưu thông số liên tục để chart quá khứ đẹp nhất.</p>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <span className="text-gray-400">Độ ổn định khi Live</span>
                  <span className="text-white font-bold text-[#FF3366]">Rất Thấp (Dễ cháy)</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <span className="text-gray-400">Kỳ vọng lợi nhuận</span>
                  <span className="text-white font-bold text-[#FF3366]">Âm</span>
                </div>
                <div className="flex justify-between items-center pb-3">
                  <span className="text-gray-400">Mức sụt giảm vốn</span>
                  <span className="text-white font-bold text-[#FF3366]">45%</span>
                </div>
              </div>
              <div className="mt-8 bg-[#FF3366]/10 p-4 rounded-lg border border-[#FF3366]/20 text-[#FF3366] text-sm">
                <strong>Kết quả:</strong> Sụp đổ hoàn toàn khi áp dụng vào thực tế.
              </div>
            </div>

            {/* Strategy B */}
            <div className="bg-[#0B0E14]/80 backdrop-blur-md border border-[#00FFA3]/30 rounded-2xl p-8 relative overflow-hidden shadow-[0_0_30px_rgba(0,255,163,0.1)]">
              <div className="absolute top-0 left-0 w-full h-1 bg-[#00FFA3]"></div>
              <h3 className="text-2xl font-bold text-[#00FFA3] mb-2">Chiến Lược B: "Định Lượng"</h3>
              <p className="text-gray-400 text-sm mb-6">
                Chiến lược có quy tắc rõ ràng, quản trị rủi ro chặt chẽ 1%/lệnh. Chấp nhận biểu đồ quá khứ không hoàn hảo miễn là an toàn.
              </p>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                  <span className="text-gray-400">Độ Ổn Định (Khi chạy Live)</span>
                  <span className="text-white font-bold">Rất Cao (Bền vững)</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                  <span className="text-gray-400">Trung bình mỗi lệnh</span>
                  <span className="text-white font-bold">Lãi tiền đều đặn</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                  <span className="text-gray-400">Nguy cơ sụt giảm vốn</span>
                  <span className="text-white font-bold">Kiểm soát dưới 10%</span>
                </div>
              </div>
              <div className="mt-8 p-4 bg-[#00FFA3]/10 border border-[#00FFA3]/30 rounded-lg">
                <p className="text-sm text-[#00FFA3]">
                  <strong className="text-[#00FFA3]">Thực tế:</strong> Sống sót dài hạn và thi đậu các Quỹ lớn dễ dàng nhờ quản lý vốn cực tốt.
                </p>
              </div>
            </div>
          </div>
        </div>
      </SectionWrapper>

      {/* Tier 3: The Vault */}
      <SectionWrapper className="relative z-10 max-w-7xl mx-auto px-4 py-16 md:py-24 w-full">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Tài Liệu Cốt Lõi (The Vault)</h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Những tài liệu nghiên cứu chuyên sâu giúp bạn xây dựng tư duy giao dịch của một Quant Trader thực thụ.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {documents.map((doc, idx) => (
            <div key={idx} className="bg-[#131722]/80 backdrop-blur-md border border-white/10 hover:border-[#00FFA3]/50 rounded-xl p-6 flex flex-col transition-all group">
              <div className="bg-white/5 w-12 h-12 rounded-lg flex items-center justify-center mb-6 group-hover:bg-[#00FFA3]/20 transition-colors">
                <FileText className="w-6 h-6 text-gray-400 group-hover:text-[#00FFA3]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{doc.title}</h3>
              <p className="text-gray-400 text-sm flex-grow mb-6">{doc.desc}</p>
              <button 
                onClick={() => handleDownloadClick(doc.title)}
                disabled={isGenerating && selectedDoc === doc.title}
                className={`w-full py-3 rounded-lg font-bold flex items-center justify-center transition-all ${
                  isUnlocked[doc.title] 
                    ? "bg-[#00FFA3]/10 text-[#00FFA3] border border-[#00FFA3]/30 hover:bg-[#00FFA3]/20" 
                    : "bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10"
                }`}
              >
                {isGenerating && selectedDoc === doc.title ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Đang tạo PDF...</>
                ) : isUnlocked[doc.title] ? (
                  <><Unlock className="w-4 h-4 mr-2" /> Tải Lại Lần Nữa</>
                ) : (
                  <><Lock className="w-4 h-4 mr-2" /> Mở Khóa Tài Liệu</>
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Call to Action - End of Vault */}
        <div className="mt-16 max-w-4xl mx-auto bg-gradient-to-r from-[#131722] to-[#00FFA3]/10 border border-[#00FFA3]/30 rounded-2xl p-8 md:p-12 text-center shadow-[0_0_30px_rgba(0,255,163,0.1)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-[#00FFA3]"></div>
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-8">Chiến lược của bạn đã đủ định lượng chưa?</h3>
          <Link to="/intake" className="inline-block bg-[#00FFA3] text-black font-bold text-lg py-4 px-10 rounded-lg hover:bg-green-400 shadow-[0_0_20px_rgba(0,255,163,0.3)] transition-all transform hover:scale-105">
            Hãy để Strategy Audit kiểm chứng ngay tại đây
          </Link>
        </div>
      </SectionWrapper>

      {/* Lead Capture Popup Modal */}
      <AnimatePresence>
        {selectedDoc && !isUnlocked[selectedDoc] && !isGenerating && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-[#131722] border border-white/10 rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl relative"
            >
              <button 
                onClick={() => setSelectedDoc(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#00FFA3]/10 mb-6 mx-auto">
                <Lock className="w-8 h-8 text-[#00FFA3]" />
              </div>
              
              <h3 className="text-2xl font-bold text-white text-center mb-2">Truy Cập Đặc Quyền</h3>
              <p className="text-gray-400 text-center text-sm mb-6">
                Vui lòng để lại thông tin để tải xuống tài liệu: <br/><strong className="text-white mt-1 block">{selectedDoc}</strong>
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Họ và Tên</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-[#0B0E14] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#00FFA3] transition-colors"
                    placeholder="Nhập họ tên của bạn"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Số Điện Thoại</label>
                  <input 
                    type="tel" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full bg-[#0B0E14] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#00FFA3] transition-colors"
                    placeholder="Nhập số điện thoại"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Email</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-[#0B0E14] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#00FFA3] transition-colors"
                    placeholder="name@example.com"
                  />
                </div>
                
                {error && <p className="text-[#FF3366] text-sm text-center">{error}</p>}
                
                <button 
                  type="submit"
                  className="w-full bg-[#00FFA3] text-black font-bold py-4 rounded-lg mt-4 flex items-center justify-center hover:bg-green-400 transition-colors shadow-[0_0_20px_rgba(0,255,163,0.3)]"
                >
                  Tạo File Cá Nhân & Tải Ngay <ArrowRight className="w-5 h-5 ml-2" />
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default LibraryPage;
