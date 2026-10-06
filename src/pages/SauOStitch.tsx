import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Check, CheckCircle2, Circle, ClipboardCheck, Clock3, RotateCcw, ShieldCheck } from 'lucide-react';
import { SAUO_GAS_ENDPOINT } from '../config';
import BottomNavigation from '../components/BottomNavigation';
import './SauOStitch.css';

type Question = { title: string; prompt: string; help: string; example?: string; options?: string[] };
const questions: Question[] = [
  { title: 'Lối đánh', prompt: 'Bạn thường vào lệnh trong tình huống nào?', help: 'Chọn điều gần nhất với cách bạn thường làm. Không có đáp án đúng sai.', options: ['Giá chạy quá đà rồi có dấu hiệu quay lại', 'Giá phá qua một mức quan trọng', 'Giá đang chạy một chiều rõ ràng, tôi đi theo', 'Xuất hiện một mẫu nến tôi nhận ra', 'Giá chạm một vùng tôi đã đánh dấu sẵn', 'Tôi cũng chưa rõ — tùy lúc'] },
  { title: 'Chỗ vào', prompt: 'Bạn nhìn thấy gì thì bấm vào lệnh?', help: 'Tả lại điều bạn nhìn thấy ngay trước khi bấm. Nếu người khác đọc xong vẫn không biết lúc nào vào thì quy tắc cần cụ thể hơn.', example: 'Khi giá vượt lên khỏi mức cao nhất của bốn tiếng đầu tuần.' },
  { title: 'Chỗ thoát', prompt: 'Bạn đóng lệnh khi nào — lúc lỗ và lúc lời?', help: 'Nếu bạn quyết định khi đang giữ lệnh thay vì quyết trước, cứ ghi đúng như vậy.', example: 'Lỗ thì cắt khi âm 20 giá. Lời thì chốt khi được 60 giá.' },
  { title: 'Nhịp lệnh', prompt: 'Một lệnh của bạn thường mở bao lâu rồi đóng?', help: 'Ước lượng từ vài lệnh gần nhất: vài phút, vài tiếng, qua đêm hay cả tuần?', example: 'Thường vài tiếng, hết ngày là tôi đóng.' },
  { title: 'Thời điểm', prompt: 'Bạn hay vào lệnh lúc nào? Có lúc nào bạn tự cấm mình vào không?', help: 'Ghi thời điểm thường giao dịch và những lúc bạn chọn đứng ngoài.', example: 'Hay vào buổi tối lúc thị trường Mỹ mở. Chưa có lúc nào tự cấm.' },
  { title: 'Số lệnh', prompt: 'Một tuần bạn vào khoảng bao nhiêu lệnh?', help: 'Ước chừng thôi. Con số này giúp bạn xem nhịp giao dịch có khớp với quy tắc của mình không.', example: 'Khoảng năm đến bảy lệnh, hôm nào sốt ruột thì hơn.' },
];

const links = [
  { href: '/', label: 'Vì sao cần đo?', icon: ShieldCheck },
  { href: '/vip', label: 'Thư viện 300', icon: BookOpen },
  { href: '/membership', label: 'Thành viên', icon: CheckCircle2 },
];

const isAnswerComplete = (index: number, value: string) => {
  const clean = value.trim().toLowerCase();
  if (index === 0) return clean.length > 0 && !clean.includes('chưa rõ');
  return clean.length >= 8 && !['chưa có', 'không', 'chưa'].includes(clean);
};

export default function SauOStitch() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>(Array(6).fill(''));
  const [draft, setDraft] = useState('');
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [consent, setConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [sendError, setSendError] = useState('');
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const contactRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const originalTitle = document.title;
    document.title = 'Sáu Ô — làm rõ cách bạn giao dịch';
    return () => { document.title = originalTitle; };
  }, []);

  const answered = useMemo(() => answers.reduce((count, value, index) => count + (isAnswerComplete(index, value) ? 1 : 0), 0), [answers]);

  const changeStep = (next: number) => {
    if (next >= 2 && next <= 6) {
      const savedAnswer = answers[next - 1];
      setDraft(savedAnswer === 'chưa có' ? '' : savedAnswer);
    }
    setStep(next);
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const updateAnswer = (index: number, value: string) => setAnswers((old) => old.map((item, i) => i === index ? value : item));
  const selectOption = (value: string) => {
    updateAnswer(0, value);
    window.setTimeout(() => changeStep(2), 180);
  };
  const saveDraft = () => updateAnswer(step - 1, draft.trim());
  const source = new URLSearchParams(window.location.search).get('nguon') || 'truc-tiep';

  const submit = async () => {
    if (name.trim().length < 2) { setError('ten'); nameRef.current?.focus(); return; }
    if (contact.trim().length < 8) { setError('contact'); contactRef.current?.focus(); return; }
    if (!consent) { setError('consent'); return; }
    setError('');
    setSendError('');
    setIsSubmitting(true);
    const payload = {
      source: 'sauo', thoi_gian: new Date().toISOString(), ten: name.trim(), zalo: contact.trim(),
      so_o_dien: answered, o1_loi_danh: answers[0], o2_cho_vao: answers[1], o3_cho_thoat: answers[2],
      o4_nhip: answers[3], o5_gio: answers[4], o6_so_lenh: answers[5], nguon: source,
    };
    try {
      const res = await fetch(SAUO_GAS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error(`Máy chủ trả về mã lỗi ${res.status}`);
      }
      const data = await res.json().catch(() => null);
      if (data && (data.ok || data.status === 'ok' || data.success)) {
        changeStep(8);
      } else {
        throw new Error((data && data.message) || 'Máy chủ không ghi nhận được yêu cầu.');
      }
    } catch (err) {
      console.error('Lỗi gửi Sáu Ô:', err);
      setSendError('Không thể gửi thông tin về máy chủ. Bạn có thể bấm "Thử lại ngay" hoặc gửi trực tiếp qua Telegram.');
    } finally { setIsSubmitting(false); }
  };

  const progress = step === 0 ? 0 : step <= 6 ? ((step - 1) / 6) * 100 : 100;
  const current = step >= 1 && step <= 6 ? questions[step - 1] : null;
  const topicList = questions.map((question, index) => ({ question, index, done: isAnswerComplete(index, answers[index]) }));

  return (
    <main className="sa-six-app">
      <aside className="sa-six-rail">
        <a className="sa-six-brand" href="/" aria-label="Strategy Audit — về trang chủ"><img src="/assets/strategy-audit-logo.png" alt="Strategy Audit" /></a>
        <div className="sa-rail-label">KHÁM PHÁ</div>
        <nav>{links.map(({ href, label, icon: Icon }) => <a href={href} key={href}><Icon size={17} />{label}</a>)}</nav>
        <div className="sa-rail-note"><ShieldCheck size={17} /><p>Không phát tín hiệu giao dịch.<br />Chỉ giúp bạn làm rõ và kiểm tra phương pháp.</p></div>
      </aside>

      <div className="sa-six-main">
        <header className="sa-six-topbar"><span><span className="sa-live-dot" /> BÀI TỰ RÀ SOÁT QUY TẮC</span><nav className="sa-six-mobile-nav"><a href="/">Trang chủ</a><a href="/vip">Thư viện</a><a href="/membership">Thành viên</a></nav><a href="https://t.me/strategyaudit" target="_blank" rel="noreferrer">Cần trợ giúp? Nhắn Telegram <ArrowRight size={14} /></a></header>
        <div className="sa-six-content">
          <div className="sa-six-progress-head"><div><span className="sa-six-kicker">SÁU Ô · TỰ ĐÁNH GIÁ</span><h1>{step === 0 ? 'Bắt đầu từ cách bạn đang giao dịch.' : step <= 6 ? 'Làm rõ từng phần trong phương pháp.' : step === 7 ? 'Đây là mức độ rõ của các quy tắc bạn mô tả.' : 'Đã nhận được yêu cầu của bạn.'}</h1></div><div className="sa-duration"><Clock3 size={15} /><span>Khoảng 3 phút</span></div></div>
          <div className="sa-progress-meta"><span>{step > 0 && step < 7 ? `CÂU ${String(step).padStart(2, '0')} / 06` : step === 7 ? 'HOÀN TẤT' : 'CÁC BƯỚC'}</span><span>{step > 0 && step < 7 ? `${Math.round(progress)}%` : step === 7 || step === 8 ? '100%' : '6 câu hỏi'}</span></div>
          <div className="sa-progress-track" role="progressbar" aria-label="Tiến độ Sáu Ô" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)}><span style={{ width: `${progress}%` }} /></div>

          {step === 0 && <div className="sa-six-grid sa-start-grid">
            <section className="sa-six-card sa-start-card"><span className="sa-six-kicker">KHÔNG CÓ ĐÚNG HAY SAI</span><h2>Sáu câu hỏi để xem quy tắc nào đã rõ, quy tắc nào còn cần làm rõ.</h2><p>Bài tự rà soát này không chấm phương pháp tốt hay xấu và không dự đoán kết quả giao dịch. Bạn có thể trả lời “chưa có” ở bất kỳ câu nào.</p><div className="sa-start-points"><span><Check size={16} /> Không cần biết thuật ngữ</span><span><Check size={16} /> Không cần gửi bí mật chiến lược</span><span><Check size={16} /> Kết quả hiện ngay trên màn hình</span></div><button className="sa-action sa-action-primary" onClick={() => changeStep(1)}>Bắt đầu <ArrowRight size={17} /></button></section>
            <aside className="sa-six-card sa-what-list"><div className="sa-list-title"><span className="sa-six-kicker">BẠN SẼ NHÌN LẠI</span><span>06 PHẦN</span></div>{questions.map((item, index) => <div className="sa-what-row" key={item.title}><span>{String(index + 1).padStart(2, '0')}</span><div><b>{item.title}</b><small>{item.prompt}</small></div><Circle size={15} /></div>)}</aside>
          </div>}

          {current && <div className="sa-six-grid sa-question-grid">
            <section className="sa-six-card sa-question-card">
              <div className="sa-question-number">Ô {String(step).padStart(2, '0')} <span>/ 06</span></div><span className="sa-six-kicker">{current.title.toUpperCase()}</span><h2>{current.prompt}</h2><p className="sa-question-help" id="question-help">{current.help}</p>
              {current.options ? <div className="sa-options" role="group" aria-label={current.prompt}>{current.options.map((option) => <button key={option} className={`sa-option${answers[0] === option ? ' selected' : ''}`} aria-pressed={answers[0] === option} onClick={() => selectOption(option)}><span className="sa-option-radio">{answers[0] === option && <i />}</span>{option}<ArrowRight size={14} /></button>)}</div> : <><div className="sa-example"><span>VÍ DỤ CÂU TRẢ LỜI</span><p>“{current.example}”</p></div><label className="sa-visually-hidden" htmlFor="sa-answer">Câu trả lời cho: {current.prompt}</label><textarea id="sa-answer" value={draft} onChange={(event) => setDraft(event.target.value)} aria-describedby="question-help" placeholder="Viết bằng lời của bạn, một câu là đủ…" rows={4} /></>}
              {!current.options && <div className="sa-question-actions">{step > 1 && <button className="sa-action sa-action-quiet" onClick={() => { saveDraft(); changeStep(step - 1); }}><ArrowLeft size={16} /> Quay lại</button>}<button className="sa-action sa-action-skip" onClick={() => { updateAnswer(step - 1, 'chưa có'); setDraft(''); changeStep(step === 6 ? 7 : step + 1); }}>Chưa có</button><button className="sa-action sa-action-primary" onClick={() => { saveDraft(); changeStep(step === 6 ? 7 : step + 1); }}>{step === 6 ? 'Xem kết quả' : 'Tiếp tục'} <ArrowRight size={16} /></button></div>}
            </section>
            <aside className="sa-six-card sa-checklist-card"><div className="sa-list-title"><div><span className="sa-six-kicker">TIẾN ĐỘ CỦA BẠN</span><h3>{answered} / 6 quy tắc đã mô tả rõ</h3></div><ClipboardCheck size={19} /></div><div className="sa-checklist">{topicList.map(({ question, index, done }) => <div className={`sa-check-row${index + 1 === step ? ' current' : ''}`} key={question.title}><span className="sa-check-icon">{done ? <Check size={13} /> : <span>{String(index + 1).padStart(2, '0')}</span>}</span><div><b>{question.title}</b><small>{done ? 'Đã mô tả' : index + 1 === step ? 'Đang xem' : 'Còn trống'}</small></div></div>)}</div><div className="sa-check-note"><ShieldCheck size={16} /><span>Đếm độ rõ của mô tả, không đo hiệu quả hay xác suất lời/lỗ.</span></div></aside>
          </div>}

          {step === 7 && <div className="sa-six-grid sa-result-grid">
            <section className="sa-six-card sa-result-card"><span className="sa-six-kicker">TÓM TẮT CÂU TRẢ LỜI</span><div className="sa-result-score"><b>{answered}</b><span>/ 6 ô mô tả đủ rõ</span></div><h2>{answered <= 2 ? 'Bạn mới mô tả được một phần cách giao dịch.' : answered <= 4 ? 'Bạn đã làm rõ một số quy tắc.' : 'Bạn đã mô tả phần lớn quy tắc.'}</h2><p>Đây chỉ là mức độ rõ của câu trả lời, không phải điểm chất lượng hay kết quả kiểm định phương pháp.</p><div className="sa-checklist sa-result-list">{topicList.map(({ question, done }) => <div className="sa-check-row" key={question.title}><span className={`sa-check-icon${done ? ' is-done' : ''}`}>{done ? <Check size={13} /> : <span>—</span>}</span><div><b>{question.title}</b><small>{done ? 'Đã mô tả' : 'Có thể làm rõ thêm'}</small></div></div>)}</div><div className="sa-check-note"><ShieldCheck size={16} /><span>Bài tự rà soát chưa xác nhận lợi thế hoặc kết quả giao dịch trong tương lai.</span></div></section>
            <section className="sa-six-card sa-contact-card">
              <span className="sa-six-kicker">BƯỚC TIẾP THEO · TÙY CHỌN</span>
              <h2>Muốn được trao đổi về câu trả lời?</h2>
              <p>Kết quả đã hiện ở bên cạnh. Nếu muốn Strategy Audit liên hệ để trao đổi thêm, để lại thông tin dưới đây.</p>
              
              <label htmlFor="sa-name">Tên của bạn</label>
              <input id="sa-name" ref={nameRef} autoComplete="name" value={name} onChange={(event) => { setName(event.target.value); if (error === 'ten') setError(''); }} placeholder="Ví dụ: Minh" />
              {error === 'ten' && <small className="sa-error">Nhập tên để tiếp tục.</small>}
              
              <label htmlFor="sa-contact">Số điện thoại / Zalo</label>
              <input id="sa-contact" ref={contactRef} inputMode="tel" autoComplete="tel" value={contact} onChange={(event) => { setContact(event.target.value); if (error === 'contact') setError(''); }} placeholder="Số bạn muốn được liên hệ" />
              {error === 'contact' && <small className="sa-error">Nhập số điện thoại hợp lệ để tiếp tục.</small>}
              
              <label className={`sa-consent${error === 'consent' ? ' consent-error' : ''}`}>
                <input type="checkbox" checked={consent} onChange={(event) => { setConsent(event.target.checked); if (error === 'consent') setError(''); }} />
                <span>Đồng ý để Strategy Audit dùng thông tin này liên hệ về yêu cầu của tôi.</span>
              </label>
              {error === 'consent' && <small className="sa-error">Vui lòng xác nhận đồng ý trước khi gửi.</small>}
              
              {sendError && (
                <div style={{ background: 'rgba(226, 75, 74, 0.1)', border: '1px solid rgba(226, 75, 74, 0.3)', borderRadius: '12px', padding: '12px 14px', marginTop: '12px', textAlign: 'left' }}>
                  <p style={{ color: '#E24B4A', fontSize: '13px', margin: 0, fontWeight: 500, lineHeight: 1.4 }}>{sendError}</p>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                    <button type="button" className="sa-action sa-action-primary" style={{ padding: '6px 14px', fontSize: '12px' }} onClick={submit} disabled={isSubmitting}>
                      Thử lại ngay
                    </button>
                    <a 
                      className="sa-action sa-action-quiet" 
                      style={{ padding: '6px 14px', fontSize: '12px' }} 
                      href={`https://t.me/strategyaudit?text=${encodeURIComponent(`Chào Strategy Audit, tôi gửi câu trả lời Sáu Ô:\nTên: ${name}\nLiên hệ: ${contact}\nĐã điền: ${answered}/6 ô`)}`} 
                      target="_blank" 
                      rel="noreferrer"
                    >
                      Nhắn Telegram
                    </a>
                  </div>
                </div>
              )}
              
              <div className="sa-contact-actions">
                <button className="sa-action sa-action-quiet" onClick={() => changeStep(6)}><ArrowLeft size={16} /> Quay lại</button>
                <button className="sa-action sa-action-primary" disabled={isSubmitting} onClick={submit}>{isSubmitting ? 'Đang gửi…' : 'Gửi yêu cầu'} <ArrowRight size={16} /></button>
              </div>

              <div style={{ marginTop: '14px', fontSize: '12px', color: '#9CA3AF', lineHeight: '1.5' }}>
                <p style={{ margin: 0 }}>Thông tin chỉ dùng để phản hồi yêu cầu này. Bạn cũng có thể nhắn trực tiếp trên <a href="https://t.me/strategyaudit" target="_blank" rel="noreferrer" style={{ color: '#00FFA3', textDecoration: 'underline' }}>Telegram</a>.</p>
                <button type="button" onClick={() => setShowPrivacyModal(true)} style={{ background: 'none', border: 'none', padding: '4px 0 0', color: '#6B7280', textDecoration: 'underline', cursor: 'pointer', fontSize: '11px', display: 'inline-block' }}>
                  Chính sách quyền riêng tư & cách xóa dữ liệu
                </button>
              </div>
            </section>
          </div>}

          {showPrivacyModal && (
            <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)', padding: '20px', backdropFilter: 'blur(4px)' }}>
              <div style={{ background: '#131722', border: '1px solid #1F2937', borderRadius: '20px', maxWidth: '520px', width: '100%', padding: '24px', position: 'relative', color: '#E5E7EB' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #1F2937', paddingBottom: '12px' }}>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#FFFFFF' }}>Chính sách Quyền riêng tư & Dữ liệu</h3>
                  <button type="button" onClick={() => setShowPrivacyModal(false)} style={{ background: '#1F2937', border: 'none', borderRadius: '50%', width: '32px', height: '32px', color: '#9CA3AF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                </div>
                <div style={{ fontSize: '13px', lineHeight: '1.6', color: '#D1D5DB' }}>
                  <p style={{ marginBottom: '10px' }}><strong>1. Dữ liệu thu thập:</strong> Họ tên, Số điện thoại/Zalo và nội dung các câu trả lời trong bài tự rà soát Sáu Ô.</p>
                  <p style={{ marginBottom: '10px' }}><strong>2. Mục đích sử dụng:</strong> Phục vụ duy nhất việc đội ngũ Strategy Audit liên hệ trực tiếp để trao đổi, làm rõ phương pháp giao dịch theo đúng mong muốn của bạn.</p>
                  <p style={{ marginBottom: '10px' }}><strong>3. Bảo mật & Cam kết:</strong> Dữ liệu không bao giờ được chia sẻ với bên thứ ba, không bán dữ liệu và không spam quảng cáo.</p>
                  <p style={{ marginBottom: '10px' }}><strong>4. Quyền yêu cầu xóa bỏ:</strong> Bạn có quyền yêu cầu xóa bỏ vĩnh viễn hoặc trích xuất toàn bộ thông tin của mình bất cứ lúc nào bằng cách nhắn tin đến Telegram <a href="https://t.me/strategyaudit" target="_blank" rel="noreferrer" style={{ color: '#00FFA3' }}>@strategyaudit</a>. Dữ liệu sẽ được xóa trong vòng 24 giờ.</p>
                </div>
                <button type="button" onClick={() => setShowPrivacyModal(false)} className="sa-action sa-action-primary" style={{ width: '100%', marginTop: '16px', justifyContent: 'center' }}>
                  Đã hiểu
                </button>
              </div>
            </div>
          )}

          {step === 8 && <section className="sa-six-card sa-success-card"><CheckCircle2 size={42} /><span className="sa-six-kicker">ĐÃ GỬI YÊU CẦU</span><h2>Cảm ơn bạn đã chia sẻ.</h2><p>Trong lúc chờ trao đổi, bạn có thể xem thư viện và tìm hiểu cách các phương pháp được kiểm tra.</p><div className="sa-success-actions"><a className="sa-action sa-action-primary" href="/vip">Xem thư viện 300 <ArrowRight size={16} /></a><a className="sa-action sa-action-quiet" href="https://t.me/strategyaudit" target="_blank" rel="noreferrer">Mở Telegram <ArrowRight size={16} /></a><button className="sa-action sa-action-quiet" onClick={() => { setAnswers(Array(6).fill('')); setDraft(''); setName(''); setContact(''); setConsent(false); changeStep(0); }}><RotateCcw size={15} /> Làm lại</button></div></section>}

          <footer className="sa-six-footer"><span>Strategy Audit · Tự rà soát quy tắc giao dịch</span><span>Nội dung giáo dục, không phải tín hiệu hay khuyến nghị đầu tư cá nhân.</span></footer>
        </div>
      </div>
      <BottomNavigation activeTab="sauo" />
    </main>
  );
}
