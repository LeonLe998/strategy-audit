import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Settings2, Info, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface IntakeWizardProps {
  selectedPackage?: string | null;
}

const IntakeWizard: React.FC<IntakeWizardProps> = ({ selectedPackage }) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [formData, setFormData] = useState({
    q1: '', // Họ và tên
    q2: '', // Email / Telegram
    q3: 'Đang/sắp chinh phục prop firm', // Nhóm khách hàng
    q4: '', // Số vốn
    q5: '', // Mục tiêu lợi nhuận
    q6: '', // Cặp tiền
    q7: '', // Logic vào lệnh (textarea)
    q8: '', // Timeframe
    q9: '', // RR
    q10: '', // Drawdown tối đa (%)
    q11: 'Manual', // Loại hệ thống
    q12: 'Không', // Martingale/Grid
    q13: 'Có', // News Trading
    q14: '', // Tên quỹ Prop Firm
    q15: '', // Target Profit (%)
    q16: '', // Max Daily Drawdown (%)
    q17: '', // Max Overall Drawdown (%)
    q18: '', // Minimum Trading Days
    q19: '', // Gói kiểm toán
    q20: '' // Lịch tư vấn
  });

  useEffect(() => {
    if (selectedPackage) {
      setFormData(prev => ({ ...prev, q19: selectedPackage }));
    }
  }, [selectedPackage]);

  const updateForm = (key: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    if (step === 2 && formData.q3 !== 'Đang/sắp chinh phục prop firm') {
      setStep(4);
    } else {
      setStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
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
      case 4: return "Bước 4/4: Xác nhận Bàn giao";
      default: return "";
    }
  };

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

        <div className="min-h-[300px]">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <InputField label="Q1. Họ và tên" value={formData.q1} onChange={(e:any) => updateForm('q1', e.target.value)} placeholder="Nguyễn Văn A" />
                <InputField label="Q2. Email / Telegram liên hệ" value={formData.q2} onChange={(e:any) => updateForm('q2', e.target.value)} placeholder="Email hoặc @username" />
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Q3. Nhóm khách hàng của bạn là gì?</label>
                  <div className="space-y-2">
                    {['Cá nhân trade quỹ tự có', 'Quỹ đầu tư / Tổ chức', 'Đang/sắp chinh phục prop firm'].map(opt => (
                      <label key={opt} className="flex items-center space-x-3 text-gray-300 cursor-pointer p-2 rounded-lg hover:bg-gray-800 transition-colors">
                        <input type="radio" name="q3" value={opt} checked={formData.q3 === opt} onChange={(e) => updateForm('q3', e.target.value)} className="text-[#00FFA3] focus:ring-[#00FFA3] bg-gray-800 border-gray-600" />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <InputField type="number" label="Q4. Số vốn dự kiến trade (USD)" value={formData.q4} onChange={(e:any) => updateForm('q4', e.target.value)} placeholder="Ví dụ: 10000" />
                <InputField type="number" label="Q5. Mục tiêu lợi nhuận hàng tháng (%)" value={formData.q5} onChange={(e:any) => updateForm('q5', e.target.value)} placeholder="Ví dụ: 5" />
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <InputField label="Q6. Cặp tiền / Sản phẩm giao dịch chính" value={formData.q6} onChange={(e:any) => updateForm('q6', e.target.value)} placeholder="Ví dụ: XAUUSD, EURUSD" />
                
                <div className="mb-4">
                  <label className="text-sm font-medium text-gray-300 mb-1 flex items-start md:items-center">
                    <span>Q7. Mô tả logic vào lệnh / thoát lệnh cơ bản</span>
                    <Tooltip text="Để kiểm toán WFO, chúng tôi cần biết chính xác hệ thống của bạn dựa trên quy tắc nào (chỉ báo, price action, v.v) để lượng hóa nó thành mã code." />
                  </label>
                  <textarea 
                    rows={4}
                    value={formData.q7} 
                    onChange={(e) => updateForm('q7', e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-[#00FFA3] focus:border-transparent transition-all"
                    placeholder="Khi RSI vượt 70 thì Bán..."
                  />
                </div>

                <InputField label="Q8. Khung thời gian (Timeframe) sử dụng chính" value={formData.q8} onChange={(e:any) => updateForm('q8', e.target.value)} placeholder="H1, M15..." />
                <InputField label="Q9. Tỷ lệ Risk:Reward (RR) trung bình" value={formData.q9} onChange={(e:any) => updateForm('q9', e.target.value)} placeholder="1:2" />
                
                <InputField 
                  type="number" 
                  label="Q10. Drawdown tối đa cho phép (%)" 
                  value={formData.q10} 
                  onChange={(e:any) => updateForm('q10', e.target.value)} 
                  tooltip="Max Drawdown là ngưỡng rủi ro tuyệt đối. Nếu vượt ngưỡng này, hệ thống sẽ bị coi là 'vỡ trận' (Risk of Ruin)."
                  placeholder="Ví dụ: 10" 
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Q11. Loại hệ thống</label>
                    <select value={formData.q11} onChange={(e) => updateForm('q11', e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-[#00FFA3]">
                      <option>Manual</option><option>Semi-Auto</option><option>100% EA</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Q12. Martingale/Grid?</label>
                    <select value={formData.q12} onChange={(e) => updateForm('q12', e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-[#00FFA3]">
                      <option>Không</option><option>Có</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Q13. Trade News?</label>
                    <select value={formData.q13} onChange={(e) => updateForm('q13', e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-[#00FFA3]">
                      <option>Không</option><option>Có</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <div className="bg-[#F59E0B]/10 border border-[#F59E0B]/30 rounded-lg p-4 mb-4 text-sm text-[#F59E0B]">
                  <strong>Lưu ý:</strong> Bạn đang chọn tối ưu hệ thống để thi quỹ (Prop Firm). Vui lòng cung cấp chính xác các thông số luật quỹ để chúng tôi ép xung WFO phù hợp.
                </div>
                <InputField label="Q14. Tên quỹ Prop Firm bạn đang nhắm tới" value={formData.q14} onChange={(e:any) => updateForm('q14', e.target.value)} placeholder="FTMO, MFF, The Funded Trader..." />
                <InputField type="number" label="Q15. Target Profit Phase 1 (%)" value={formData.q15} onChange={(e:any) => updateForm('q15', e.target.value)} placeholder="8" />
                <InputField 
                  type="number" 
                  label="Q16. Max Daily Drawdown (%)" 
                  value={formData.q16} 
                  onChange={(e:any) => updateForm('q16', e.target.value)} 
                  tooltip="Đa số quỹ sẽ loại tài khoản nếu Equity (bao gồm cả lệnh đang chạy) âm quá ngưỡng này trong 1 ngày."
                  placeholder="5" 
                />
                <InputField type="number" label="Q17. Max Overall Drawdown (%)" value={formData.q17} onChange={(e:any) => updateForm('q17', e.target.value)} placeholder="10" />
                <InputField type="number" label="Q18. Số ngày giao dịch tối thiểu (Minimum Trading Days)" value={formData.q18} onChange={(e:any) => updateForm('q18', e.target.value)} placeholder="0" />
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                
                {(formData.q19 === 'Gói Chuyên Nghiệp' || formData.q19 === 'Đặc Quyền') && (
                  <div className="bg-[#00FFA3]/10 border border-[#00FFA3]/50 rounded-lg p-4 mb-6 animate-pulse">
                    <p className="text-[#00FFA3] font-bold text-sm text-center">
                      🌟 Khách hàng VIP: Chúng tôi sẽ ưu tiên xử lý báo cáo của bạn trong vòng 12h!
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Q19. Gói kiểm toán bạn đăng ký</label>
                  <select 
                    value={formData.q19} 
                    onChange={(e) => updateForm('q19', e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-[#00FFA3] appearance-none"
                  >
                    <option value="">-- Chọn gói dịch vụ --</option>
                    <option value="Gói Trải Nghiệm">Gói Trải Nghiệm</option>
                    <option value="Gói Nâng Cao">Gói Nâng Cao</option>
                    <option value="Gói Chuyên Nghiệp">Gói Chuyên Nghiệp</option>
                    <option value="Đặc Quyền">Đặc Quyền (VIP)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Q20. Đặt lịch tư vấn chiến lược 1-1 (Chỉ dành cho gói Đặc Quyền)
                  </label>
                  <input
                    type="datetime-local"
                    disabled={formData.q19 !== 'Đặc Quyền'}
                    value={formData.q20}
                    onChange={(e) => updateForm('q20', e.target.value)}
                    className={`w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-[#00FFA3] ${formData.q19 !== 'Đặc Quyền' ? 'opacity-50 cursor-not-allowed' : ''}`}
                  />
                  {formData.q19 !== 'Đặc Quyền' && (
                    <p className="text-xs text-gray-500 mt-1">Tính năng này đã bị khóa vì gói bạn chọn không phải là Đặc Quyền.</p>
                  )}
                </div>

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
