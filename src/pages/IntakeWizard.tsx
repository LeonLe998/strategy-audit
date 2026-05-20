import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Settings2, Info, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface IntakeWizardProps {
  selectedPackage?: string | null;
}

// UI Components
const Tooltip = ({ text }: { text: string }) => (
  <div className="group relative inline-block ml-2 cursor-pointer mt-1">
    <Info className="w-4 h-4 text-gray-400 hover:text-[#00FFA3] transition-colors" />
    <div className="opacity-0 w-64 bg-gray-900 text-gray-200 text-xs rounded-md py-2 px-3 absolute z-10 bottom-full left-1/2 -translate-x-1/2 mb-2 pointer-events-none group-hover:opacity-100 transition-opacity shadow-lg border border-gray-700">
      <span className="font-bold text-[#00FFA3] mb-1 block">Tại sao cần hỏi câu này?</span>
      {text}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
    </div>
  </div>
);

const InputField = ({ label, id, type = 'text', tooltip = '', ...props }: any) => (
  <div className="mb-4">
    <label className="text-sm font-medium text-gray-300 mb-1 flex items-start md:items-center">
      <span>{label}</span>
      {tooltip && <Tooltip text={tooltip} />}
    </label>
    <input
      type={type}
      className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-[#00FFA3] focus:border-transparent transition-all"
      {...props}
    />
  </div>
);

const SelectField = ({ label, options, value, onChange, tooltip = '', disabled = false }: any) => (
  <div className="mb-4">
    <label className="text-sm font-medium text-gray-300 mb-1 flex items-start md:items-center">
      <span>{label}</span>
      {tooltip && <Tooltip text={tooltip} />}
    </label>
    <select disabled={disabled} value={value} onChange={onChange} className={`w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-[#00FFA3] appearance-none ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
      {options.map((opt:string) => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);

const IntakeWizard: React.FC<IntakeWizardProps> = ({ selectedPackage }) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    // Step 1
    q1: '', 
    q2: '', 
    q2_2: '', 
    q3: 'Đang/sắp chinh phục prop firm', 
    q4: '', 
    q5: '', 
    // Step 2
    q6: '', 
    q7: '', 
    q7_2: '', // Money Management
    q7_3: '', // Trade Management
    q8: 'XAUUSD', 
    q9: 'H1', 
    q10: '', 
    q11: 'R-multiple', 
    q12: 'Không', 
    q13: '90 ngày', 
    // Step 3
    q14: 'FTMO', 
    q15: '', 
    q16: '', 
    q17: '', 
    q18: '', 
    // Step 4
    q19: selectedPackage || 'Gói Trải Nghiệm', 
    q20: 'Tiếng Việt', 
    q21: 'Không', 
    vip1: 'Không', 
    vip2: 'Không', 
    vip3: 'Không', 
    vip4: 'Không' 
  });

  useEffect(() => {
    if (selectedPackage) {
      setFormData(prev => ({ ...prev, q19: selectedPackage }));
    }
  }, [selectedPackage]);

  const updateForm = (key: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    if (errorMsg) setErrorMsg('');
  };

  const validateStep1 = () => {
    if (!formData.q1.trim()) return "Vui lòng nhập Họ tên.";
    if (!formData.q2.trim()) return "Vui lòng nhập Email.";
    if (!formData.q2_2.trim()) return "Vui lòng nhập Số điện thoại.";
    if (!formData.q4.trim()) return "Vui lòng nhập kích thước tài khoản.";
    if (!formData.q5.trim()) return "Vui lòng nhập mục tiêu kiểm toán.";
    return "";
  };

  const handleNext = () => {
    if (step === 1) {
      const err = validateStep1();
      if (err) {
        setErrorMsg(err);
        return;
      }
    }
    
    if (step === 2 && formData.q3 !== 'Đang/sắp chinh phục prop firm') {
      setStep(4);
    } else {
      setStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    setErrorMsg('');
    if (step === 4 && formData.q3 !== 'Đang/sắp chinh phục prop firm') {
      setStep(2);
    } else {
      setStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulate webhook
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log("Webhook payload:", JSON.stringify(formData, null, 2));
    setIsSubmitting(false);
    setIsSuccess(true);
  };

  const getStepTitle = () => {
    switch (step) {
      case 1: return "Bước 1/4: Thông tin khách hàng";
      case 2: return "Bước 2/4: Hệ thống giao dịch";
      case 3: return "Bước 3/4: Yêu cầu Prop Firm";
      case 4: return "Bước 4/4: Deliverable & Nâng cao";
      default: return "";
    }
  };

  const isVIP = formData.q19 === 'Đặc Quyền' || formData.q19 === 'Gói Chuyên Nghiệp';
  const isSuperVIP = formData.q19 === 'Đặc Quyền';

  if (isSuccess) {
    return (
      <div className="flex-grow flex items-center justify-center p-4 py-20 bg-transparent">
        <div className="max-w-2xl w-full bg-[#131722]/90 border border-[#00FFA3]/50 rounded-2xl shadow-[0_0_30px_rgba(0,255,163,0.2)] p-8 md:p-12 text-center relative overflow-hidden">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex justify-center mb-6">
            <CheckCircle className="w-20 h-20 text-[#00FFA3]" />
          </motion.div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Dữ liệu đã được tiếp nhận!</h2>
          <p className="text-gray-300 md:text-lg">Đội ngũ chuyên gia Quant sẽ phân tích và phản hồi báo cáo sơ bộ cho bạn trong 24-48 giờ tới.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow flex items-center justify-center p-4 py-20 bg-transparent">
      <div className="max-w-2xl w-full bg-[#131722]/95 border border-[#2A2E39] rounded-2xl shadow-2xl p-6 md:p-8 relative overflow-hidden">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 h-1 bg-gray-800 w-full">
          <div className="h-full bg-[#00FFA3] transition-all duration-500 shadow-[0_0_10px_#00FFA3]" style={{ width: `${(step / 4) * 100}%` }}></div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-4 border-b border-gray-800">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white flex items-center">
              <Settings2 className="mr-2 h-6 w-6 text-[#00FFA3]" />
              Form Kiểm Toán Chiến Lược
            </h2>
            <p className="text-gray-400 text-sm mt-1">{getStepTitle()}</p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-[#FF3366]/10 border border-[#FF3366]/50 rounded-lg flex items-center text-[#FF3366] text-sm">
            <AlertCircle className="w-5 h-5 mr-2 shrink-0" />
            {errorMsg}
          </div>
        )}

        <div className="min-h-[300px]">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField label="1. Họ tên / Tên đại diện" value={formData.q1} onChange={(e:any) => updateForm('q1', e.target.value)} placeholder="Tên sẽ hiện trên cover báo cáo" />
                  <InputField label="2. Email" type="email" value={formData.q2} onChange={(e:any) => updateForm('q2', e.target.value)} placeholder="Để gửi báo cáo + nhắc re-audit" />
                </div>
                
                <InputField label="2.2. Số điện thoại" type="tel" value={formData.q2_2} onChange={(e:any) => updateForm('q2_2', e.target.value)} placeholder="Để tiện liên hệ" />
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">3. Anh/chị thuộc nhóm nào?</label>
                  <div className="space-y-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                    {['Retail trader cá nhân', 'Đang/sắp chinh phục prop firm', 'IB / Affiliate broker', 'Người bán signal / khóa học', 'Khác'].map(opt => (
                      <label key={opt} className="flex items-center space-x-3 text-gray-300 cursor-pointer p-2 rounded-lg hover:bg-gray-800 transition-colors">
                        <input type="radio" name="q3" value={opt} checked={formData.q3 === opt} onChange={(e) => updateForm('q3', e.target.value)} className="text-[#00FFA3] focus:ring-[#00FFA3] bg-gray-800 border-gray-600" />
                        <span className="text-sm">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <InputField type="number" label="4. Đang giao dịch tài khoản kích thước nào? (USD)" value={formData.q4} onChange={(e:any) => updateForm('q4', e.target.value)} placeholder="Ví dụ: 100000" />
                <InputField label="5. Mục tiêu cuối cùng của việc audit này là gì?" value={formData.q5} onChange={(e:any) => updateForm('q5', e.target.value)} placeholder="1 câu ngắn gọn" />
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <InputField label="6. Tên hệ thống / chiến lược" value={formData.q6} onChange={(e:any) => updateForm('q6', e.target.value)} placeholder="Tên sẽ hiện trên báo cáo" />
                
                <div className="mb-4">
                  <label className="text-sm font-medium text-gray-300 mb-1 flex items-start md:items-center">
                    <span>7. Mô tả ngắn quy tắc vào lệnh (Entry Rules)</span>
                    <Tooltip text="Ví dụ: Khi giá phá đỉnh pivot trong xu hướng EMA20 tăng, vào BUY stop trên đỉnh pivot." />
                  </label>
                  <textarea 
                    rows={6}
                    value={formData.q7} 
                    onChange={(e) => updateForm('q7', e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-[#00FFA3] focus:border-transparent transition-all"
                    placeholder="Mô tả logic vào lệnh của bạn..."
                  />
                </div>

                <div className="mb-4">
                  <label className="text-sm font-medium text-gray-300 mb-1 flex items-start md:items-center">
                    <span>7.2. Quy tắc quản trị vốn (Money Management)</span>
                    <Tooltip text="Ví dụ: Fixed risk 1% per trade, Martingale x2 khi thua, hoặc Anti-martingale." />
                  </label>
                  <textarea 
                    rows={3}
                    value={formData.q7_2} 
                    onChange={(e) => updateForm('q7_2', e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-[#00FFA3] focus:border-transparent transition-all"
                    placeholder="Mô tả cách bạn đi lệnh, nhồi lệnh hoặc quản lý lot size..."
                  />
                </div>

                <div className="mb-4">
                  <label className="text-sm font-medium text-gray-300 mb-1 flex items-start md:items-center">
                    <span>7.3. Quy tắc quản lý lệnh (Trade Management)</span>
                    <Tooltip text="Ví dụ: Break-even khi đạt 1R, Trailing stop theo đỉnh/đáy gần nhất, hoặc đóng 50% khối lượng." />
                  </label>
                  <textarea 
                    rows={3}
                    value={formData.q7_3} 
                    onChange={(e) => updateForm('q7_3', e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-[#00FFA3] focus:border-transparent transition-all"
                    placeholder="Mô tả cách bạn dời SL, chốt lời từng phần..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SelectField label="8. Symbol giao dịch chính" options={['XAUUSD', 'EURUSD', 'BTCUSD', 'Khác']} value={formData.q8} onChange={(e:any) => updateForm('q8', e.target.value)} />
                  <SelectField label="9. Khung thời gian" options={['M1', 'M5', 'M15', 'H1', 'H4', 'D1']} value={formData.q9} onChange={(e:any) => updateForm('q9', e.target.value)} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField type="number" label="10. Mức rủi ro mỗi lệnh (% tài khoản)" value={formData.q10} onChange={(e:any) => updateForm('q10', e.target.value)} placeholder="Ví dụ: 1" />
                  <SelectField label="11. Stop-loss / Take-profit dùng?" options={['R-multiple', 'Điểm cụ thể', 'Trailing Stop']} value={formData.q11} onChange={(e:any) => updateForm('q11', e.target.value)} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField label="12. Có rule cắt lỗ ngày không?" value={formData.q12} onChange={(e:any) => updateForm('q12', e.target.value)} placeholder="Vd: lỗ 2%/ngày là dừng" />
                  <SelectField label="13. Khoảng dữ liệu muốn audit" options={['90 ngày', '180 ngày', '365 ngày']} value={formData.q13} onChange={(e:any) => updateForm('q13', e.target.value)} />
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <div className="bg-[#F59E0B]/10 border border-[#F59E0B]/30 rounded-lg p-4 mb-4 text-sm text-[#F59E0B]">
                  <strong>Lưu ý Prop Firm:</strong> Hãy cung cấp chính xác các thông số luật quỹ để chúng tôi ép xung WFO phù hợp.
                </div>
                
                <SelectField label="14. Prop firm nào?" options={['Hola Prime', 'FTMO', 'MyForexFunds (MFF)', 'FundedNext', 'Khác']} value={formData.q14} onChange={(e:any) => updateForm('q14', e.target.value)} />
                <InputField type="number" label="15. Kích thước challenge (USD)" value={formData.q15} onChange={(e:any) => updateForm('q15', e.target.value)} placeholder="Ví dụ: 100000" />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField type="number" label="16. Daily DD limit (%)" value={formData.q16} onChange={(e:any) => updateForm('q16', e.target.value)} placeholder="Ví dụ: 5" tooltip="Max Daily Drawdown quỹ cho phép" />
                  <InputField type="number" label="17. Overall DD limit (%)" value={formData.q17} onChange={(e:any) => updateForm('q17', e.target.value)} placeholder="Ví dụ: 10" />
                </div>
                <InputField type="number" label="18. Profit target (%)" value={formData.q18} onChange={(e:any) => updateForm('q18', e.target.value)} placeholder="Ví dụ: 8" />
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                
                {isVIP && (
                  <div className="bg-[#00FFA3]/10 border border-[#00FFA3]/50 rounded-lg p-4 mb-6 animate-pulse">
                    <p className="text-[#00FFA3] font-bold text-sm text-center">
                      🌟 Khách hàng VIP: Chúng tôi sẽ ưu tiên xử lý báo cáo của bạn trong vòng 12h!
                    </p>
                  </div>
                )}

                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-4 flex justify-between items-center">
                  <span className="text-gray-300 font-medium">Gói đã chọn:</span>
                  <span className="bg-[#00FFA3]/20 text-[#00FFA3] px-3 py-1 rounded-full text-sm font-bold border border-[#00FFA3]/30">
                    {formData.q19}
                  </span>
                </div>

                <SelectField 
                  label="19. Đổi gói dịch vụ (Tùy chọn)" 
                  options={['Gói Trải Nghiệm', 'Gói Nâng Cao', 'Gói Chuyên Nghiệp', 'Đặc Quyền']} 
                  value={formData.q19} 
                  onChange={(e:any) => updateForm('q19', e.target.value)} 
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SelectField label="20. Ngôn ngữ báo cáo" options={['Tiếng Việt', 'English', '中文', 'Song ngữ']} value={formData.q20} onChange={(e:any) => updateForm('q20', e.target.value)} />
                  <SelectField label="21. Co-branding (Logo IB/Công ty)?" options={['Không', 'Có']} value={formData.q21} onChange={(e:any) => updateForm('q21', e.target.value)} disabled={!isSuperVIP} tooltip="Chỉ dành cho VIP Đặc Quyền" />
                </div>

                {/* Câu hỏi nâng cao (Chỉ dành cho VIP) */}
                {isSuperVIP && (
                  <div className="mt-8 p-6 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-xl space-y-4">
                    <h3 className="text-[#D4AF37] font-bold mb-4">Câu hỏi nâng cao (Dành riêng cho Đặc Quyền)</h3>
                    <SelectField label="22. Audit nhiều variant cùng lúc? (Vd thay đổi EMA 20->34)" options={['Không', 'Có']} value={formData.vip1} onChange={(e:any) => updateForm('vip1', e.target.value)} />
                    <SelectField label="23. Test trên nhiều symbol cùng cấu hình?" options={['Không', 'Có']} value={formData.vip2} onChange={(e:any) => updateForm('vip2', e.target.value)} />
                    <SelectField label="24. Thêm Monte Carlo regime-split (bull/bear/sideways)?" options={['Không', 'Có']} value={formData.vip3} onChange={(e:any) => updateForm('vip3', e.target.value)} />
                    <SelectField label="25. Nhận file Pine Script / Python skeleton?" options={['Không', 'Có']} value={formData.vip4} onChange={(e:any) => updateForm('vip4', e.target.value)} />
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation Buttons */}
        <div className="mt-8 pt-6 border-t border-gray-800 flex flex-col-reverse md:flex-row justify-between gap-4 md:gap-0">
          {step > 1 ? (
            <button 
              onClick={handlePrev}
              disabled={isSubmitting}
              className="px-6 py-3 rounded-lg font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-colors flex items-center justify-center disabled:opacity-50"
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              Quay lại
            </button>
          ) : <div></div>}

          {step < 4 ? (
            <button 
              onClick={handleNext}
              className="bg-[#00FFA3] text-black px-8 py-3 rounded-lg font-bold hover:bg-green-400 transition-colors flex items-center justify-center w-full md:w-auto shadow-[0_0_15px_rgba(0,255,163,0.3)]"
            >
              Tiếp tục
              <ChevronRight className="w-5 h-5 ml-1" />
            </button>
          ) : (
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting || !formData.q19}
              className="bg-gradient-to-r from-[#00FFA3] to-[#00b377] text-black px-8 py-3 rounded-lg font-bold hover:brightness-110 transition-all flex items-center justify-center w-full md:w-auto shadow-[0_0_20px_rgba(0,255,163,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Đang gửi...
                </span>
              ) : (
                "Gửi yêu cầu Kiểm toán"
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default IntakeWizard;
