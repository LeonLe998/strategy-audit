import { useEffect, useState } from 'react';
import {
  ArrowRight, ArrowUpRight, BookOpen, Check, ChevronDown,
  ClipboardCheck, Database, FileSearch, ShieldCheck, Users, X,
} from 'lucide-react';
import { motion } from 'motion/react';
import NumberTicker from './NumberTicker';
import TracingBeam from './TracingBeam';
import './HomeStitch.css';

interface HomeProps { setActiveTab: (tab: string) => void; }
interface LibrarySummary {
  cap_nhat?: string;
  tong?: number;
  da_chay?: number;
  verdict_da_chay?: Record<string, number>;
  danh_sach?: Array<{
    id: string;
    ten: string;
    verdict?: string;
    tf?: string;
    trang_thai?: string;
    oos_n?: number;
    oos_ev?: number;
    oos_years?: string;
  }>;
}

const steps = [
  { n: '01', title: 'Chọn phương pháp', copy: 'Chọn cách giao dịch bạn đang dùng hoặc muốn tìm hiểu.', icon: FileSearch },
  { n: '02', title: 'Viết thành quy tắc', copy: 'Làm rõ điều kiện vào lệnh, thoát lệnh và giới hạn rủi ro.', icon: ClipboardCheck },
  { n: '03', title: 'Chọn dữ liệu kiểm tra', copy: 'Ghi rõ thị trường, khung thời gian và giai đoạn dùng để kiểm tra.', icon: Database },
  { n: '04', title: 'Đọc kết quả và giới hạn', copy: 'Xem cỡ mẫu, giai đoạn ngoài mẫu và những điều phép thử chưa trả lời.', icon: ShieldCheck },
  { n: '05', title: 'Quyết định bước tiếp', copy: 'Biết phần nào cần kiểm tra thêm trước khi đem phương pháp ra thực hành.', icon: ArrowUpRight },
];

const questions = [
  ['01', 'Lối đánh', 'Bạn thường giao dịch trong tình huống nào?'],
  ['02', 'Chỗ vào', 'Điều gì khiến bạn quyết định vào lệnh?'],
  ['03', 'Chỗ thoát', 'Bạn đóng lệnh khi nào — lúc lỗ và lúc lời?'],
  ['04', 'Nhịp lệnh', 'Một lệnh thường mở trong bao lâu?'],
  ['05', 'Thời điểm', 'Bạn thường vào lệnh lúc nào?'],
  ['06', 'Số lệnh', 'Một tuần bạn vào khoảng bao nhiêu lệnh?'],
];

const faqs = [
  ['Vì sao trader cần đo và kiểm định phương pháp?', 'Nhiều trader giao dịch 5–10 năm nhưng vẫn chủ yếu cố gắng làm đúng những khái niệm đã học. Câu hỏi quan trọng là: khái niệm đó có hiệu quả trong những điều kiện nào? Đo và kiểm định giúp bạn có dữ liệu để đánh giá phương pháp trước khi tiếp tục sử dụng. Kết quả phản ánh phạm vi đã kiểm tra, không bảo đảm tương lai.'],
  ['Đo và kiểm định giúp trader điều gì?', 'Số liệu là cơ sở quan trọng để trader ra quyết định. Nếu không biết phương pháp từng có chuỗi thua dài nhất bao nhiêu lệnh, bạn khó xây dựng mức rủi ro và kế hoạch quản lý vốn phù hợp. Kiểm định giúp bạn hiểu những tình huống đã xuất hiện trong dữ liệu để chuẩn bị tốt hơn; nó không loại bỏ rủi ro hay dự đoán chắc chắn chuỗi lệnh tiếp theo.'],
  ['Kiểm định có cho biết phương pháp chắc chắn sẽ sinh lời không?', 'Không. Kết quả quá khứ không dự đoán chắc chắn tương lai. Kiểm định giúp đánh giá phương pháp trong phạm vi dữ liệu và giả định đã chọn; thị trường, chi phí giao dịch và cách thực hiện thực tế đều có thể làm kết quả khác đi.'],
  ['Strategy Audit có phát tín hiệu giao dịch không?', 'Không. Strategy Audit không phát lệnh hay khuyến nghị mua bán cá nhân. Trọng tâm là giúp bạn mô tả, đo và hiểu giới hạn của phương pháp trước khi tự quyết định bước tiếp theo.'],
  ['Tôi chưa biết thuật ngữ có làm được Sáu Ô không?', 'Được. Sáu Ô dùng câu hỏi đời thường, cho phép bạn trả lời “chưa có” và không chấm hiệu quả giao dịch. Bạn có thể bắt đầu từ cách mình đang giao dịch rồi bổ sung dần những điều còn thiếu.'],
];

export default function HomeStitch({ setActiveTab }: HomeProps) {
  const [summary, setSummary] = useState<LibrarySummary | null>(null);

  useEffect(() => {
    let active = true;
    fetch('/data/thuvien_data/thu_vien_index.json')
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((data: LibrarySummary) => { if (active) setSummary(data); })
      .catch(() => undefined);
    return () => { active = false; };
  }, []);

  const startSix = () => window.location.assign('/sauo?trang-chu');
  const tested = summary?.da_chay ?? 242;
  const total = summary?.tong ?? 300;
  const updateDate = summary?.cap_nhat ?? '2026-08-16';
  const dateLabel = updateDate.split('-').reverse().join('/');
  const example = summary?.danh_sach?.find((strategy) => strategy.id === 'BRK001')
    ?? summary?.danh_sach?.find((strategy) => strategy.trang_thai === 'da_kiem_dinh');

  return (
    <div className="sa-home" id="home-view">
      <section className="sa-hero">
        <motion.div 
          className="sa-hero-copy"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
        >
          <span className="sa-eyebrow"><span className="sa-eyebrow-dot" />Strategy Audit <span>·</span> Đo trước khi thực hành</span>
          <h1>Biết cách giao dịch chưa đủ.<br /><em>Hãy kiểm tra phương pháp có đứng vững qua dữ liệu không.</em></h1>
          <p className="sa-lead">Strategy Audit giúp bạn làm rõ quy tắc, đo phương pháp trên dữ liệu và hiểu kết quả trước khi quyết định bước tiếp theo.</p>
          <div className="sa-hero-actions">
            <button className="sa-button sa-button-primary" onClick={startSix}>Bắt đầu với Sáu Ô <ArrowRight size={17} /></button>
            <button className="sa-button sa-button-secondary" onClick={() => document.getElementById('sa-case-study')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}>Xem cách đọc một hồ sơ <ArrowUpRight size={17} /></button>
          </div>
          <div className="sa-reassurance"><span><Check size={15} /> Không cần gửi bí mật chiến lược</span><span><Check size={15} /> Có thể trả lời “chưa biết”</span></div>
        </motion.div>

        <motion.aside
          className="sa-process-card"
          aria-label="So sánh quy trình giao dịch"
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
        >
          <div className="sa-process-card-heading">
            <span className="sa-kicker">HAI CÁCH ĐI TỪ HỌC ĐẾN THỰC HÀNH</span>
            <h2>Thêm bước đo để biết mình đang làm gì</h2>
          </div>
          <div className="sa-path sa-path-old">
            <div className="sa-path-label"><X size={15} /><span>QUY TRÌNH THIẾU BƯỚC KIỂM CHỨNG</span></div>
            <div className="sa-path-steps sa-path-steps-old"><span>Học khái niệm</span><ArrowRight size={15} /><span>Thực hành</span><ArrowRight size={15} /><span>Rút kinh nghiệm</span></div>
            <div className="sa-path-slash" aria-hidden="true" />
          </div>
          <div className="sa-path sa-path-good">
            <div className="sa-path-label"><Check size={15} /><span>QUY TRÌNH CÓ BƯỚC ĐO</span></div>
            <div className="sa-path-steps"><span>Học khái niệm</span><ArrowRight size={15} /><span>Đo / kiểm định ý tưởng</span><ArrowRight size={15} /><span>Thực hành</span><ArrowRight size={15} /><span>Tối ưu</span></div>
            <p>Đo trước khi thực hành — hiểu dữ liệu rồi mới quyết định bước tiếp theo.</p>
          </div>
        </motion.aside>
      </section>

      <section className="sa-section sa-method">
        <motion.div 
          className="sa-section-heading"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5 }}
        >
          <span className="sa-kicker">KHOẢNG TRỐNG SAU KHI HỌC</span>
          <h2>Thêm một bước trước khi đem phương pháp ra thực hành</h2>
          <p>Học cách làm chưa cho biết phương pháp hoạt động ra sao. Hãy mô tả quy tắc và kiểm tra chúng trước.</p>
        </motion.div>
        
        <div className="sa-method-flow">
          <motion.div 
            initial={{ opacity: 0, y: 25 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true, margin: '-40px' }} 
            transition={{ duration: 0.45 }}
          >
            <span className="sa-step-number">01</span><BookOpen size={20} /><h3>HỌC</h3><p>Hiểu một phương pháp hoặc cách vào lệnh.</p>
          </motion.div>
          <div className="sa-flow-connector" aria-hidden="true"><ArrowRight size={18} /></div>
          <motion.div 
            className="sa-method-highlight" 
            initial={{ opacity: 0, y: 25 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true, margin: '-40px' }} 
            transition={{ duration: 0.45, delay: 0.15 }}
          >
            <span className="sa-step-number">02</span><Database size={20} /><h3>ĐO</h3><p>Kiểm tra quy tắc bằng dữ liệu và hiểu giới hạn.</p><span className="sa-highlight-label">BƯỚC STRATEGY AUDIT GIÚP BẠN LÀM RÕ</span>
          </motion.div>
          <div className="sa-flow-connector" aria-hidden="true"><ArrowRight size={18} /></div>
          <motion.div 
            initial={{ opacity: 0, y: 25 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true, margin: '-40px' }} 
            transition={{ duration: 0.45, delay: 0.3 }}
          >
            <span className="sa-step-number">03</span><ArrowUpRight size={20} /><h3>THỰC HÀNH</h3><p>Quyết định cách áp dụng dựa trên điều đã biết.</p>
          </motion.div>
        </div>
      </section>

      <section className="sa-section sa-process">
        <motion.div 
          className="sa-section-heading sa-heading-row"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5 }}
        >
          <div><span className="sa-kicker">MỘT QUY TRÌNH DỄ THEO DÕI</span><h2>Từ câu hỏi đến quyết định có căn cứ</h2></div>
          <p>Không cần bắt đầu bằng thuật ngữ. Bắt đầu từ quy tắc bạn đang dùng.</p>
        </motion.div>
        
        <TracingBeam>
          <div className="sa-step-grid">
            {steps.map(({ n, title, copy, icon: Icon }, idx) => (
              <motion.article 
                className="sa-step-card" 
                key={n}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
              >
                <span className="sa-step-number">{n}</span>
                <Icon size={21} />
                <h3>{title}</h3>
                <p>{copy}</p>
              </motion.article>
            ))}
          </div>
        </TracingBeam>
      </section>

      <section className="sa-section sa-six-preview" id="sauo-preview">
        <motion.div 
          className="sa-six-copy"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5 }}
        >
          <span className="sa-kicker">BẮT ĐẦU MIỄN PHÍ</span>
          <h2>Sáu câu hỏi giúp bạn nhìn rõ cách mình đang giao dịch</h2>
          <p>Không chấm phương pháp tốt hay xấu. Sáu Ô giúp bạn mô tả quy tắc nhất quán hơn và phát hiện chỗ nào còn cần làm rõ.</p>
          <div className="sa-small-facts"><span><ClipboardCheck size={16} /> 6 câu hỏi</span><span><Users size={16} /> Không cần thuật ngữ</span></div>
          <button className="sa-button sa-button-primary" onClick={startSix}>Thử Sáu Ô ngay <ArrowRight size={17} /></button>
        </motion.div>

        <div className="sa-question-preview">
          {questions.map(([n, title, prompt], idx) => (
            <motion.div 
              className="sa-question-row" 
              key={n}
              initial={{ opacity: 0, x: 18 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.35, delay: idx * 0.07 }}
            >
              <span>{n}</span>
              <div><b>{title}</b><p>{prompt}</p></div>
              <Check size={16} />
            </motion.div>
          ))}
        </div>
      </section>

      <section className="sa-section sa-library-proof">
        <motion.div 
          className="sa-section-heading"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5 }}
        >
          <span className="sa-kicker">THƯ VIỆN PHƯƠNG PHÁP</span>
          <h2>Không chỉ xem kết quả — hãy xem cả giới hạn</h2>
          <p>Các con số dưới đây lấy từ danh mục kiểm định hiện có của Strategy Audit. Mỗi hồ sơ có bối cảnh và kết quả riêng.</p>
        </motion.div>

        <div className="sa-stats-grid">
          <motion.article 
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true, margin: '-40px' }} 
            transition={{ duration: 0.4 }}
          >
            <span>Tổng chiến lược trong danh mục</span>
            <b><NumberTicker value={total} decimalPlaces={0} /></b>
            <small>Trong thư viện hiện tại</small>
          </motion.article>

          <motion.article 
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true, margin: '-40px' }} 
            transition={{ duration: 0.4, delay: 0.08 }}
          >
            <span>Đã có kết quả kiểm định</span>
            <b><NumberTicker value={tested} decimalPlaces={0} /></b>
            <small>Các hồ sơ có trạng thái kết quả</small>
          </motion.article>

          <motion.article 
            className="sa-stat-pass" 
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true, margin: '-40px' }} 
            transition={{ duration: 0.4, delay: 0.16 }}
          >
            <span>Đạt tiêu chí nội bộ</span>
            <b><NumberTicker value={summary?.verdict_da_chay?.['CHẤT'] ?? 15} decimalPlaces={0} /></b>
            <small>Theo tiêu chí ghi trong từng hồ sơ</small>
          </motion.article>

          <motion.article 
            className="sa-stat-context" 
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true, margin: '-40px' }} 
            transition={{ duration: 0.4, delay: 0.24 }}
          >
            <span>Phụ thuộc tình huống</span>
            <b><NumberTicker value={summary?.verdict_da_chay?.['TÌNH HUỐNG'] ?? 39} decimalPlaces={0} /></b>
            <small>Cần hiểu đúng điều kiện áp dụng</small>
          </motion.article>

          <motion.article 
            className="sa-stat-fail" 
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true, margin: '-40px' }} 
            transition={{ duration: 0.4, delay: 0.32 }}
          >
            <span>Chưa đạt tiêu chí</span>
            <b><NumberTicker value={summary?.verdict_da_chay?.['CHÁT'] ?? 188} decimalPlaces={0} /></b>
            <small>Kết quả trên phạm vi đã kiểm tra</small>
          </motion.article>
        </div>

        <div className="sa-data-note">
          <ShieldCheck size={17} />
          <span>Nguồn: danh mục dữ liệu nội bộ, cập nhật {dateLabel}. Đây không phải dự báo; kết quả lịch sử không đảm bảo kết quả tương lai.</span>
        </div>
        <button className="sa-button sa-button-secondary" onClick={() => setActiveTab('viplibrary')}>Khám phá thư viện <ArrowRight size={17} /></button>
      </section>

      {example && (
        <section className="sa-section sa-case-study" id="sa-case-study">
          <motion.div 
            className="sa-case-copy"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5 }}
          >
            <span className="sa-kicker">BÀI HỌC TỪ MỘT HỒ SƠ</span>
            <h2>Đo cũng có nghĩa là biết dừng lại</h2>
            <p>Kết quả không đạt tiêu chí vẫn là thông tin có ích: nó giúp mình tránh nhầm một ý tưởng hấp dẫn với một phương pháp đã được xác nhận.</p>
            <button className="sa-button sa-button-secondary" onClick={() => window.location.assign(`/vip/${encodeURIComponent(example.id)}`)}>Xem cách kiểm định <ArrowRight size={16} /></button>
          </motion.div>

          <motion.article 
            className="sa-case-card"
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <div className="sa-case-title"><div><span className="sa-kicker">ĐỌC HỒ SƠ · {example.id}</span><h3>Trước khi tin vào một kết quả, hãy hỏi:</h3></div></div>
            <div className="sa-case-metrics"><div><span>Quy tắc</span><b>Đã mô tả rõ chưa?</b></div><div><span>Dữ liệu</span><b>Đã tách ngoài mẫu chưa?</b></div><div><span>Giới hạn</span><b>Áp dụng đến đâu?</b></div></div>
            <p>Ví dụ trong thư viện: {example.ten}. Xem đầy đủ dữ liệu, điều kiện và giới hạn trong hồ sơ.</p>
            <button className="sa-button sa-button-secondary" onClick={() => window.location.assign(`/vip/${encodeURIComponent(example.id)}`)}>Mở hồ sơ kiểm định <ArrowRight size={16} /></button>
          </motion.article>
        </section>
      )}

      <section className="sa-section sa-membership">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5 }}
        >
          <span className="sa-kicker">KHI ANH MUỐN ĐI SÂU HƠN</span>
          <h2>Học cách đọc kết quả cùng cộng đồng</h2>
          <p>Thành viên cùng xem các ca kiểm định, trao đổi về dữ liệu và cách mô tả quy tắc. Đây không phải phòng phát lệnh.</p>
          <div className="sa-member-benefits"><span><Check size={16} /> Ca kiểm định và cách đọc kết quả</span><span><Check size={16} /> Cộng đồng học cách đo phương pháp</span><span><Check size={16} /> Hỏi đáp về quy trình</span></div>
        </motion.div>

        <motion.aside 
          className="sa-price-card"
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <span className="sa-kicker">THÀNH VIÊN STRATEGY AUDIT</span>
          <div className="sa-price-line"><b>$50</b><span>tháng đầu</span></div>
          <div className="sa-price-line sa-price-next"><b>$100</b><span>mỗi tháng từ tháng thứ hai</span></div>
          <p>Chuyển khoản và xác nhận thủ công qua Telegram.</p>
          <button className="sa-button sa-button-primary" onClick={() => setActiveTab('membership')}>Xem quyền lợi & cách tham gia <ArrowRight size={16} /></button>
        </motion.aside>
      </section>

      <section className="sa-section sa-faq">
        <div className="sa-section-heading">
          <span className="sa-kicker">CÂU HỎI THƯỜNG GẶP</span>
          <h2>Đo phương pháp để biết điều gì?</h2>
        </div>
        {faqs.map(([question, answer]) => (
          <details key={question}>
            <summary>{question}<ChevronDown size={18} /></summary>
            <p>{answer}</p>
          </details>
        ))}
      </section>
    </div>
  );
}
