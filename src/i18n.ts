import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// the translations
const resources = {
  vi: {
    translation: {
      "nav": {
        "start": "Bắt Đầu Tối Ưu"
      },
      "hero": {
        "title": "90% TRADER CÓ KIẾN THỨC VẪN THUA LỖ. TỐI ƯU HỆ THỐNG CHÍNH LÀ VŨ KHÍ BẬC NHẤT.",
        "subtitle": "Chúng tôi kiểm toán, ép xung và tối ưu hóa Walk-Forward chiến lược của bạn. Ngừng đánh bạc, bắt đầu định lượng."
      },
      "sop": {
        "step1": "1. Nhập liệu điều kiện vào lệnh",
        "step2": "2.Chạy WFO Kiểm Định Hệ Thống",
        "step3": "3. Trả Báo Cáo PDF"
      },
      "pricing": {
        "tier1": "Gói Trải Nghiệm",
        "tier2": "Gói Nâng Cao",
        "tier3": "Gói Chuyên Nghiệp",
        "tier4": "Đặc Quyền"
      },
      "cta": {
        "headline": "Đừng để tài khoản quỹ bốc hơi vì cảm tính thêm một ngày nào nữa.",
        "button": "KIỂM TOÁN CHIẾN LƯỢC CỦA BẠN NGAY",
        "bottomButton": "Đưa Chiến Lược Của Tôi Lên Hệ Thống Định Lượng Ngay"
      },
      "footer": {
        "telegram": "Cộng đồng Telegram/Discord",
        "support": "Liên hệ hỗ trợ",
        "disclaimer": "Giao dịch tài chính có rủi ro. Kết quả Walk-Forward Optimization trong quá khứ không đảm bảo lợi nhuận tương lai. Chúng tôi cung cấp giải pháp kiểm toán toán học, không kêu gọi đầu tư."
      },
      "wizard": {
        "step1": "Môi trường (Cặp tiền, Timeframe)",
        "step2": "Logic vào lệnh (Indicators, Price Action)",
        "step3": "Quản trị rủi ro & Luật Quỹ (Risk %, Max Drawdown)",
        "next": "Tiếp tục",
        "prev": "Quay lại",
        "submit": "Phân Tích & Ép Xung",
        "pair": "Cặp Giao Dịch",
        "tf": "Khung Thời Gian",
        "indicators": "Chỉ Báo (Ví dụ: EMA 34)",
        "risk": "Rủi Ro Mỗi Lệnh (%)",
        "drawdown": "Max Drawdown (%)"
      },
      "dashboard": {
        "kpi1": "Hiệu suất WFE (>0.5)",
        "kpi2": "Kỳ vọng Toán học (EV)",
        "kpi3": "Max Floating Drawdown",
        "decayClock": "Strategy Decay Clock",
        "extend": "Gia hạn Gói",
        "chartTitle": "In-Sample vs Out-of-Sample Equity Curves"
      }
    }
  },
  en: {
    translation: {
      "nav": {
        "start": "Start Optimizing"
      },
      "hero": {
        "title": "90% OF EDUCATED TRADERS STILL LOSE. SYSTEM OPTIMIZATION IS THE ULTIMATE WEAPON.",
        "subtitle": "We audit, overclock, and Walk-Forward optimize your strategy. Stop gambling, start quantifying."
      },
      "sop": {
        "step1": "Mathematical Declaration",
        "step2": "Run WFO on Quantitative System",
        "step3": "Deliver Quantitative PDF Report"
      },
      "pricing": {
        "tier1": "Experience (1,500,000 VND/mo)",
        "tier2": "Advanced ($150/mo)",
        "tier3": "Custom (500k/run)",
        "tier4": "Masterclass ($1500)"
      },
      "cta": {
        "headline": "Don't let your prop firm account evaporate due to emotion for another day.",
        "button": "AUDIT YOUR STRATEGY NOW",
        "bottomButton": "Bring My Strategy to Quantitative System Now"
      },
      "footer": {
        "telegram": "Telegram/Discord Community",
        "support": "Contact Support",
        "disclaimer": "Financial trading carries risk. Past Walk-Forward Optimization results do not guarantee future profits. We provide mathematical auditing solutions, not investment solicitations."
      },
      "wizard": {
        "step1": "Environment (Pair, Timeframe)",
        "step2": "Entry Logic (Indicators, Price Action)",
        "step3": "Risk Mgmt & Prop Rules (Risk %, Max DD)",
        "next": "Next",
        "prev": "Back",
        "submit": "Analyze & Overclock",
        "pair": "Trading Pair",
        "tf": "Timeframe",
        "indicators": "Indicators (e.g., EMA 34)",
        "risk": "Risk Per Trade (%)",
        "drawdown": "Max Drawdown (%)"
      },
      "dashboard": {
        "kpi1": "WFE Performance (>0.5)",
        "kpi2": "Mathematical Expectancy (EV)",
        "kpi3": "Max Floating Drawdown",
        "decayClock": "Strategy Decay Clock",
        "extend": "Extend Package",
        "chartTitle": "In-Sample vs Out-of-Sample Equity Curves"
      }
    }
  },
  zh: {
    translation: {
      "nav": {
        "start": "开始优化"
      },
      "hero": {
        "title": "90%的受教育交易员仍在亏损。系统优化是终极武器。",
        "subtitle": "我们对您的策略进行审计、超频和步进式优化。停止赌博，开始量化。"
      },
      "sop": {
        "step1": "数学声明",
        "step2": "在量化系统上运行WFO",
        "step3": "交付量化PDF报告"
      },
      "pricing": {
        "tier1": "体验 (1,500,000 越南盾/月)",
        "tier2": "高级 ($150/月)",
        "tier3": "定制 (500k/次)",
        "tier4": "大师班 ($1500)"
      },
      "cta": {
        "headline": "不要让你的自营交易账户因为情绪而再次蒸发。",
        "button": "立即审计您的策略",
        "bottomButton": "立即将我的策略带到量化系统"
      },
      "footer": {
        "telegram": "Telegram/Discord 社区",
        "support": "联系支持",
        "disclaimer": "金融交易有风险。过去的步进式优化结果不能保证未来的利润。我们提供数学审计解决方案，不招揽投资。"
      },
      "wizard": {
        "step1": "环境 (交易对，时间框架)",
        "step2": "入场逻辑 (指标，价格行为)",
        "step3": "风险管理和规则 (风险 %, 最大回撤)",
        "next": "下一步",
        "prev": "上一步",
        "submit": "分析与超频",
        "pair": "交易对",
        "tf": "时间框架",
        "indicators": "指标 (例如: EMA 34)",
        "risk": "每笔交易风险 (%)",
        "drawdown": "最大回撤 (%)"
      },
      "dashboard": {
        "kpi1": "WFE表现 (>0.5)",
        "kpi2": "数学期望 (EV)",
        "kpi3": "最大浮动回撤",
        "decayClock": "策略衰退时钟",
        "extend": "延长套餐",
        "chartTitle": "样本内与样本外权益曲线"
      }
    }
  }
};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: "vi", // default language is Vietnamese
    fallbackLng: "en",
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

export default i18n;
