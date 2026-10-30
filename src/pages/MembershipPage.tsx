import { useState, type FormEvent, type ReactNode } from 'react';
import { motion } from 'motion/react';
import { GlassCard } from '../components/Glass';
import ContactLinks from '../components/ContactLinks';
import { ArrowRight, Users, BookOpenCheck, MessageCircle, ClipboardCheck, CircleCheck, CircleX } from 'lucide-react';
import { getGasApiUrl } from '../config';
import { track } from '../analytics';

interface MembershipPageProps {
  setActiveTab: (tab: string) => void;
}

const memberBenefits = [
  {
    title: 'Ca kiểm định thực tế',
    body: 'Theo dõi cách một phương pháp được đem đi đo, điều gì đạt, điều gì chưa đạt và vì sao.',
    icon: BookOpenCheck,
  },
  {
    title: 'Cộng đồng cùng học cách đo',
    body: 'Thảo luận phương pháp và quy tắc; tập trung vào bằng chứng, không chia sẻ tín hiệu.',
    icon: Users,
  },
  {
    title: 'Nhìn lại hệ thống của bạn',
    body: 'Dùng Sáu ô để mô tả phương pháp, nhận hướng dẫn về phần cần làm rõ hoặc kiểm tra tiếp.',
    icon: ClipboardCheck,
  },
  {
    title: 'Hỏi và trao đổi trực tiếp',
    body: 'Đặt câu hỏi về cách hiểu dữ liệu và quy trình thực hành trong cộng đồng.',
    icon: MessageCircle,
  },
];

/** Hiện dần từ dưới lên khi cuộn tới, mỗi phần tử trễ một nhịp theo `i` */
function Rise({ children, i = 0, className = '' }: { children: ReactNode; i?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -15% 0px' }}
      transition={{ duration: 0.55, delay: i * 0.08, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Ô kính nhỏ phát sáng chứa biểu tượng hoặc số thứ tự */
const ORB = 'relative flex shrink-0 items-center justify-center rounded-xl border border-[#9ff6ff]/30 bg-[linear-gradient(160deg,rgba(43,255,234,0.22),rgba(43,255,234,0.04))] text-neon-green shadow-[0_0_18px_rgba(43,255,234,0.22),inset_0_1px_0_rgba(255,255,255,0.3)]';
const INPUT = 'mt-1 w-full rounded-lg border border-white/15 bg-white/[0.04] px-3 py-3 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] placeholder:text-gray-500 transition-[border-color,box-shadow] focus:border-[#2BFFEA]/70 focus:shadow-[0_0_0_3px_rgba(43,255,234,0.15)] focus:outline-none';

export default function MembershipPage({ setActiveTab }: MembershipPageProps) {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [consent, setConsent] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const submitInterest = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    if (!consent) {
      setError('Vui lòng đồng ý để Strategy Audit dùng thông tin này trả lời yêu cầu đăng ký.');
      return;
    }

    setSending(true);
    try {
      await fetch(getGasApiUrl(), {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          source: 'member_interest',
          name: name.trim(),
          contact: contact.trim(),
          consent: true,
        }),
      });
      setSent(true);
      track('membership_interest_submit');
    } catch {
      setError('Chưa gửi được yêu cầu. Anh/chị có thể thử lại sau.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div id="membership-view" className="relative overflow-x-clip pb-20">
      {/* Quầng sáng nền cho các tấm kính có chiều sâu */}
      <div aria-hidden className="pointer-events-none absolute -right-40 top-10 h-[520px] w-[520px] rounded-full bg-[#2BFFEA]/10 blur-[120px]" />
      <div aria-hidden className="pointer-events-none absolute -left-40 top-[900px] h-[420px] w-[420px] rounded-full bg-[#3d7bff]/10 blur-[120px]" />

      <section className="relative px-5 pb-10 pt-7 md:pb-20 md:pt-20">
        <div className="mx-auto grid max-w-6xl items-start gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="order-1 lg:col-start-1 lg:row-start-1">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-neon-green">Thành viên Strategy Audit</p>
            <h1 className="mt-3 max-w-4xl font-display text-3xl font-bold leading-tight text-white md:mt-5 md:text-6xl">
              Học cùng nhau.
              <span className="mt-2 block bg-gradient-to-r from-[#7dfff3] via-[#2BFFEA] to-[#4edea3] bg-clip-text text-transparent drop-shadow-[0_0_24px_rgba(43,255,234,0.35)]">Đo phương pháp bằng bằng chứng.</span>
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-gray-300 md:mt-6 md:text-lg md:leading-7">
              Không phải phòng phát lệnh. Đây là nơi bạn thấy các phương pháp được kiểm tra ra sao, tự nhìn lại hệ thống của mình và tiếp tục học từ kết quả thật.
            </p>
          </motion.div>

          <div className="order-3 grid gap-4 sm:grid-cols-2 lg:col-span-2 lg:row-start-2">
            {memberBenefits.map(({ title, body, icon: Icon }, i) => (
              <Rise key={title} i={i}>
                <GlassCard className="flex h-full gap-4 p-5">
                  <div className={`${ORB} h-11 w-11`}><Icon className="h-5 w-5" /></div>
                  <div><h2 className="font-semibold text-white">{title}</h2><p className="mt-1 text-sm leading-6 text-gray-400">{body}</p></div>
                </GlassCard>
              </Rise>
            ))}
          </div>

          <motion.aside initial={{ opacity: 0, y: 24, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.7, delay: 0.15 }} className="order-2 lg:sticky lg:top-24 lg:col-start-2 lg:row-start-1">
            <GlassCard tint="cyan" className="p-5 md:p-8">
              <div aria-hidden className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full bg-[#2BFFEA]/25 blur-3xl" />
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-300">Đăng ký thành viên</p>
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight text-white md:text-4xl">Nhắn cho Strategy Audit để đăng ký</h2>
              <p className="mt-3 text-sm leading-6 text-gray-300 md:text-base md:leading-7">
                Gói tham gia được trao đổi trực tiếp, tuỳ bạn muốn học cùng cộng đồng hay muốn chính hệ thống của mình được đem đi đo.
              </p>
              <ul className="mt-4 space-y-2 border-b border-white/15 pb-5 text-sm text-gray-200">
                <li className="flex items-center gap-2"><CircleCheck className="h-4 w-4 shrink-0 text-neon-green" /> Tư vấn gói phù hợp với cách bạn đang giao dịch</li>
                <li className="flex items-center gap-2"><CircleCheck className="h-4 w-4 shrink-0 text-neon-green" /> Hỏi rõ quyền lợi trước khi quyết định</li>
              </ul>
              <ContactLinks from="membership" block className="mt-5 flex-nowrap" />
              <a href="#dang-ky" className="mt-3 block text-center text-sm font-semibold text-neon-green underline-offset-4 hover:underline">Hoặc để lại thông tin, Strategy Audit sẽ liên hệ bạn</a>
              <p className="mt-3 text-center text-xs text-gray-400">Không tự động trừ tiền · xác nhận thủ công</p>
            </GlassCard>
          </motion.aside>
        </div>
      </section>

      <section aria-labelledby="membership-fit-title" className="relative px-5 pb-14 md:pb-18">
        <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-2">
          <Rise>
            <GlassCard className="h-full p-5 md:p-6">
              <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#4edea3] to-transparent" />
              <div aria-hidden className="pointer-events-none absolute -left-10 -top-14 h-40 w-40 rounded-full bg-[#4edea3]/15 blur-3xl" />
              <h2 id="membership-fit-title" className="flex items-center gap-2 text-lg font-semibold text-white"><CircleCheck className="h-5 w-5 text-neon-green" /> Phù hợp nếu bạn muốn</h2>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-gray-300">
                <li>Hiểu một phương pháp đã được kiểm tra như thế nào.</li>
                <li>Thảo luận quy tắc, dữ liệu, rủi ro và giới hạn cùng cộng đồng.</li>
                <li>Tự đánh giá phương pháp của mình thay vì chỉ nhận sẵn kết luận.</li>
              </ul>
            </GlassCard>
          </Rise>
          <Rise i={1}>
            <GlassCard className="h-full p-5 md:p-6">
              <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#ff8c9c] to-transparent" />
              <div aria-hidden className="pointer-events-none absolute -left-10 -top-14 h-40 w-40 rounded-full bg-[#ff5a6a]/12 blur-3xl" />
              <h2 className="flex items-center gap-2 text-lg font-semibold text-white"><CircleX className="h-5 w-5 text-[#ff8c9c]" /> Chưa phù hợp nếu bạn đang tìm</h2>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-gray-300">
                <li>Tín hiệu vào lệnh hoặc kế hoạch giao dịch để sao chép.</li>
                <li>Lời hứa lợi nhuận hay cách giao dịch không có rủi ro.</li>
                <li>Một kết luận thay cho việc tự xem dữ liệu và giới hạn.</li>
              </ul>
            </GlassCard>
          </Rise>
        </div>
      </section>

      <section className="relative px-5 py-14 md:py-20">
        <div aria-hidden className="sa-glow-line absolute inset-x-0 top-0 h-px opacity-40" />
        <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[1fr_0.85fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-neon-green">Lộ trình thành viên</p>
            <h2 className="mt-3 font-display text-3xl font-bold text-white">Giá trị nằm ở những gì bạn làm được mỗi tháng</h2>
            <div className="relative mt-7 space-y-5">
              {/* Sợi sáng nối các bước */}
              <div aria-hidden className="absolute bottom-4 left-[17px] top-4 w-px bg-gradient-to-b from-[#2BFFEA]/60 via-[#2BFFEA]/25 to-transparent" />
              {[
                ['Vào cộng đồng', 'Bắt đầu ở mục dành cho người mới, hiểu cách nhóm hoạt động và chọn một việc để làm đầu tiên.'],
                ['Mô tả phương pháp', 'Dùng Sáu ô để làm rõ lối vào, cách thoát, nhịp giao dịch và các quy tắc còn thiếu.'],
                ['Theo dõi ca đo', 'Xem cách một phương pháp được kiểm tra, đọc kết quả và trao đổi điều nên tìm hiểu tiếp.'],
                ['Tiếp tục thực hành', 'Quay lại với dữ liệu của mình, đặt câu hỏi và điều chỉnh quy trình theo bằng chứng.'],
              ].map(([title, body], index) => (
                <Rise key={title} i={index} className="relative flex gap-4">
                  <span className={`${ORB} h-9 w-9 rounded-full text-xs font-semibold`}>{index + 1}</span>
                  <div><h3 className="font-semibold text-white">{title}</h3><p className="mt-1 text-sm leading-6 text-gray-400">{body}</p></div>
                </Rise>
              ))}
            </div>
          </div>

          <Rise className="h-fit">
            <GlassCard tilt={false} className="p-6 md:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">Cách tham gia</p>
              <p className="mt-3 text-sm leading-6 text-gray-300">Đăng ký và cấp quyền được xác nhận thủ công:</p>
              <ol className="mt-5 space-y-4 text-sm text-gray-300">
                {[
                  'Nhắn Strategy Audit qua Zalo, cho biết bạn muốn tham gia thành viên.',
                  'Trao đổi để chọn gói phù hợp và nhận hướng dẫn đăng ký.',
                  'Hoàn tất đăng ký theo hướng dẫn và gửi xác nhận.',
                  'Sau khi xác nhận, Leon cấp quyền truy cập cộng đồng thành viên.',
                ].map((t, k) => (
                  <li key={k} className="flex gap-3"><span className={`${ORB} h-6 w-6 rounded-full text-xs`}>{k + 1}</span><span>{t}</span></li>
                ))}
              </ol>

              <ContactLinks from="membership_steps" block className="mt-5 flex-nowrap" />

              {!sent ? (
                <form id="dang-ky" onSubmit={submitInterest} className="mt-6 scroll-mt-28 border-t border-white/10 pt-5">
                  <h3 className="font-semibold text-white">Muốn Strategy Audit chủ động liên hệ?</h3>
                  <p className="mt-1 text-xs leading-5 text-gray-400">Để lại tên và cách liên hệ, Strategy Audit sẽ nhắn lại để tư vấn gói phù hợp. Muốn nhanh hơn thì nhắn thẳng qua Zalo.</p>
                  <label className="mt-4 block text-sm text-gray-300">Tên
                    <input required value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" className={INPUT} placeholder="Tên bạn muốn được gọi" />
                  </label>
                  <label className="mt-3 block text-sm text-gray-300">Số Zalo hoặc email
                    <input required value={contact} onChange={(event) => setContact(event.target.value)} autoComplete="off" className={INPUT} placeholder="0912 345 678 hoặc ban@email.com" />
                  </label>
                  <label className="mt-4 flex items-start gap-2 text-xs leading-5 text-gray-400">
                    <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} className="mt-1 accent-[#2BFFEA]" />
                    <span>Tôi đồng ý để Strategy Audit lưu thông tin liên hệ này nhằm trả lời yêu cầu đăng ký thành viên.</span>
                  </label>
                  {error && <p role="alert" className="mt-3 text-sm text-coral-red">{error}</p>}
                  <button disabled={sending} className="sa-glass-btn mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 font-semibold disabled:opacity-60">
                    {sending ? 'Đang gửi…' : 'Gửi yêu cầu tham gia'} <ArrowRight className="h-4 w-4" />
                  </button>
                </form>
              ) : (
                <div role="status" className="sa-glass sa-glass-cyan mt-6 rounded-xl p-4">
                  <p className="font-semibold text-white">Biểu mẫu đã được gửi từ trình duyệt.</p>
                  <p className="mt-1 text-sm leading-6 text-gray-300">Strategy Audit sẽ liên hệ lại qua thông tin bạn để lại. Muốn nhanh hơn, bạn có thể nhắn thẳng qua Zalo.</p>
                </div>
              )}
              <p className="mt-4 text-xs leading-5 text-gray-500">Thành viên không nhận tín hiệu giao dịch, lời hứa lợi nhuận hay khuyến nghị đầu tư cá nhân.</p>
            </GlassCard>
          </Rise>
        </div>
      </section>

      <section className="relative px-5 py-14">
        <Rise className="mx-auto max-w-5xl">
          <GlassCard className="flex flex-col items-start justify-between gap-5 p-6 md:flex-row md:items-center md:p-8">
            <div><h2 className="text-xl font-semibold text-white">Muốn bắt đầu bằng việc nhìn lại phương pháp của mình?</h2><p className="mt-2 text-sm leading-6 text-gray-400">Hoàn thành Sáu ô miễn phí trước khi quyết định tham gia.</p></div>
            <button onClick={() => setActiveTab('sauo')} className="sa-glass-ghost inline-flex shrink-0 items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-neon-green">Làm Sáu ô <ArrowRight className="h-4 w-4" /></button>
          </GlassCard>
        </Rise>
      </section>
    </div>
  );
}
