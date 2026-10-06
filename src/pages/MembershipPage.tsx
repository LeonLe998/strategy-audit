import { useState, type FormEvent } from 'react';
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
      const res = await fetch(getGasApiUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          source: 'member_interest',
          name: name.trim(),
          contact: contact.trim(),
          consent: true,
        }),
      });
      if (!res.ok) {
        throw new Error(`Máy chủ trả về mã ${res.status}`);
      }
      const data = await res.json().catch(() => null);
      if (data && (data.ok || data.status === 'ok' || data.success)) {
        setSent(true);
        track('membership_interest_submit');
      } else {
        throw new Error((data && data.message) || 'Máy chủ không ghi nhận được yêu cầu.');
      }
    } catch (err) {
      console.error('Lỗi gửi đăng ký thành viên:', err);
      setError('Chưa thể gửi yêu cầu đến máy chủ. Anh/chị có thể thử lại hoặc nhắn tin trực tiếp qua Telegram bên dưới.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div id="membership-view" className="pb-20">
      <section className="px-5 pb-10 pt-7 md:pb-20 md:pt-20">
        <div className="mx-auto grid max-w-6xl items-start gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="order-1 lg:col-start-1 lg:row-start-1">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-neon-green">Thành viên Strategy Audit</p>
          <h1 className="mt-3 max-w-4xl font-display text-3xl font-bold leading-tight text-white md:mt-5 md:text-6xl">
            Học cùng nhau.
            <span className="mt-2 block text-neon-green">Đo phương pháp bằng bằng chứng.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-gray-300 md:mt-6 md:text-lg md:leading-7">
            Không phải phòng phát lệnh. Đây là nơi bạn thấy các phương pháp được kiểm tra ra sao, tự nhìn lại hệ thống của mình và tiếp tục học từ kết quả thật.
          </p>
          </div>

          <div className="order-3 grid gap-4 sm:grid-cols-2 lg:col-span-2 lg:row-start-2">
            {memberBenefits.map(({ title, body, icon: Icon }) => (
              <div key={title} className="flex gap-4 border-t border-white/10 py-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neon-green/10 text-neon-green"><Icon className="h-5 w-5" /></div>
                <div><h2 className="font-semibold text-white">{title}</h2><p className="mt-1 text-sm leading-6 text-gray-400">{body}</p></div>
              </div>
            ))}
          </div>

          <aside className="order-2 rounded-2xl border border-neon-green/25 bg-[#131722] p-5 shadow-xl md:p-8 lg:sticky lg:top-24 lg:col-start-2 lg:row-start-1">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">Phí thành viên</p>
            <div className="mt-3 flex items-end gap-2 md:mt-4"><span className="font-display text-4xl font-bold text-white md:text-5xl">$50</span><span className="pb-1 text-sm text-gray-400">tháng đầu</span></div>
            <div className="mt-2 flex items-end gap-2 border-b border-white/10 pb-4 md:mt-3 md:pb-5"><span className="font-display text-3xl font-semibold text-white">$100</span><span className="pb-1 text-sm text-gray-400">mỗi tháng từ tháng thứ hai</span></div>
            <p className="mt-3 text-sm leading-6 text-gray-300 md:mt-5">Bạn tự chuyển khoản và gửi xác nhận cho Strategy Audit trên Telegram. Thành viên được cấp quyền sau khi giao dịch được xác nhận.</p>
            <a href="https://t.me/strategyaudit" target="_blank" rel="noreferrer" className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-neon-green px-5 py-3 text-sm font-bold text-black hover:brightness-110 md:mt-5 md:py-4">Nhắn trên Telegram để bắt đầu <ArrowRight className="h-4 w-4" /></a>
            <p className="mt-3 text-center text-xs text-gray-500">Không tự động trừ tiền · thanh toán bằng chuyển khoản</p>
          </aside>
        </div>
      </section>

      <section aria-labelledby="membership-fit-title" className="px-5 pb-14 md:pb-18">
        <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-2">
          <article className="rounded-xl border border-[#1F4739] bg-[#0C211D] p-5 md:p-6">
            <h2 id="membership-fit-title" className="flex items-center gap-2 text-lg font-semibold text-white"><CircleCheck className="h-5 w-5 text-neon-green" /> Phù hợp nếu bạn muốn</h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-gray-300">
              <li>Hiểu một phương pháp đã được kiểm tra như thế nào.</li>
              <li>Thảo luận quy tắc, dữ liệu, rủi ro và giới hạn cùng cộng đồng.</li>
              <li>Tự đánh giá phương pháp của mình thay vì chỉ nhận sẵn kết luận.</li>
            </ul>
          </article>
          <article className="rounded-xl border border-[#49313A] bg-[#21171E] p-5 md:p-6">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-white"><CircleX className="h-5 w-5 text-[#ff8c9c]" /> Chưa phù hợp nếu bạn đang tìm</h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-gray-300">
              <li>Tín hiệu vào lệnh hoặc kế hoạch giao dịch để sao chép.</li>
              <li>Lời hứa lợi nhuận hay cách giao dịch không có rủi ro.</li>
              <li>Một kết luận thay cho việc tự xem dữ liệu và giới hạn.</li>
            </ul>
          </article>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#10141d]/70 px-5 py-14 md:py-20">
        <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[1fr_0.85fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-neon-green">Lộ trình thành viên</p>
            <h2 className="mt-3 font-display text-3xl font-bold text-white">Giá trị nằm ở những gì bạn làm được mỗi tháng</h2>
            <div className="mt-7 space-y-5">
              {[
                ['Vào cộng đồng', 'Bắt đầu ở mục dành cho người mới, hiểu cách nhóm hoạt động và chọn một việc để làm đầu tiên.'],
                ['Mô tả phương pháp', 'Dùng Sáu ô để làm rõ lối vào, cách thoát, nhịp giao dịch và các quy tắc còn thiếu.'],
                ['Theo dõi ca đo', 'Xem cách một phương pháp được kiểm tra, đọc kết quả và trao đổi điều nên tìm hiểu tiếp.'],
                ['Tiếp tục thực hành', 'Quay lại với dữ liệu của mình, đặt câu hỏi và điều chỉnh quy trình theo bằng chứng.'],
              ].map(([title, body], index) => (
                <div key={title} className="flex gap-4">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-neon-green/40 text-xs font-semibold text-neon-green">{index + 1}</span>
                  <div><h3 className="font-semibold text-white">{title}</h3><p className="mt-1 text-sm leading-6 text-gray-400">{body}</p></div>
                </div>
              ))}
            </div>
          </div>

          <aside className="h-fit rounded-2xl border border-neon-green/25 bg-[#131722] p-6 md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">Cách tham gia</p>
            <p className="mt-3 text-sm leading-6 text-gray-300">Thanh toán và cấp quyền được xác nhận thủ công qua Telegram:</p>
            <ol className="mt-5 space-y-4 text-sm text-gray-300">
              <li className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-neon-green/40 text-xs text-neon-green">1</span><span>Nhắn @strategyaudit và cho biết bạn muốn tham gia thành viên.</span></li>
              <li className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-neon-green/40 text-xs text-neon-green">2</span><span>Nhận thông tin chuyển khoản: US$50 tháng đầu, US$100 mỗi tháng từ tháng thứ hai.</span></li>
              <li className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-neon-green/40 text-xs text-neon-green">3</span><span>Chuyển khoản rồi gửi xác nhận giao dịch và username Telegram của bạn.</span></li>
              <li className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-neon-green/40 text-xs text-neon-green">4</span><span>Sau khi xác nhận, Leon cấp quyền truy cập cộng đồng thành viên.</span></li>
            </ol>

            <a href="https://t.me/strategyaudit" target="_blank" rel="noreferrer" className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 px-5 py-3 text-sm font-semibold text-white hover:border-neon-green/50">
              Mở Telegram để đăng ký <ArrowRight className="h-4 w-4" />
            </a>

            {!sent ? (
              <form onSubmit={submitInterest} className="mt-6 border-t border-white/10 pt-5">
                <h3 className="font-semibold text-white">Muốn được liên hệ qua email hoặc Telegram?</h3>
                <p className="mt-1 text-xs leading-5 text-gray-400">Biểu mẫu này là lựa chọn phụ. Bạn cũng có thể nhắn thẳng qua Telegram để hỏi cách tham gia và nhận thông tin chuyển khoản.</p>
                <label className="mt-4 block text-sm text-gray-300">Tên
                  <input required value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" className="mt-1 w-full rounded-lg border border-white/15 bg-[#0B0E14] px-3 py-3 text-white placeholder:text-gray-500 focus:border-neon-green focus:outline-none" placeholder="Tên bạn muốn được gọi" />
                </label>
                <label className="mt-3 block text-sm text-gray-300">Email hoặc username Telegram
                  <input required value={contact} onChange={(event) => setContact(event.target.value)} autoComplete="off" className="mt-1 w-full rounded-lg border border-white/15 bg-[#0B0E14] px-3 py-3 text-white placeholder:text-gray-500 focus:border-neon-green focus:outline-none" placeholder="ban@email.com hoặc @tenban" />
                </label>
                <label className="mt-4 flex items-start gap-2 text-xs leading-5 text-gray-400">
                  <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} className="mt-1 accent-[#00FFA3]" />
                  <span>Tôi đồng ý để Strategy Audit lưu thông tin liên hệ này nhằm trả lời yêu cầu đăng ký thành viên.</span>
                </label>
                {error && (
                  <div className="mt-3 rounded-xl border border-[#E24B4A]/30 bg-[#E24B4A]/10 p-3 text-xs text-[#E24B4A]">
                    <p className="font-semibold">{error}</p>
                    <a 
                      href={`https://t.me/strategyaudit?text=${encodeURIComponent(`Chào Strategy Audit, tôi đăng ký thành viên Strategy Audit:\nTên: ${name}\nLiên hệ: ${contact}`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex items-center gap-1.5 font-bold text-white hover:text-neon-green underline"
                    >
                      Nhắn Telegram trực tiếp <ArrowRight className="h-3 w-3" />
                    </a>
                  </div>
                )}
                <button disabled={sending} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-neon-green px-5 py-3.5 font-semibold text-black disabled:opacity-60">
                  {sending ? 'Đang gửi…' : 'Gửi yêu cầu tham gia'} <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            ) : (
              <div role="status" className="mt-6 rounded-xl border border-neon-green/30 bg-neon-green/5 p-4">
                <p className="font-semibold text-white">Biểu mẫu đã được gửi từ trình duyệt.</p>
                <p className="mt-1 text-sm leading-6 text-gray-300">Bước tiếp theo: nhắn @strategyaudit trên Telegram để xác nhận yêu cầu và nhận thông tin chuyển khoản. Quyền thành viên được cấp sau khi giao dịch được xác nhận thủ công.</p>
              </div>
            )}
            <p className="mt-4 text-xs leading-5 text-gray-500">Thành viên không nhận tín hiệu giao dịch, lời hứa lợi nhuận hay khuyến nghị đầu tư cá nhân.</p>
          </aside>
        </div>
      </section>

      <section className="px-5 py-14">
        <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-5 rounded-2xl border border-white/10 p-6 md:flex-row md:items-center md:p-8">
          <div><h2 className="text-xl font-semibold text-white">Muốn bắt đầu bằng việc nhìn lại phương pháp của mình?</h2><p className="mt-2 text-sm leading-6 text-gray-400">Hoàn thành Sáu ô miễn phí trước khi quyết định tham gia.</p></div>
          <button onClick={() => setActiveTab('sauo')} className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-neon-green/40 px-5 py-3 text-sm font-semibold text-neon-green hover:bg-neon-green/10">Làm Sáu ô <ArrowRight className="h-4 w-4" /></button>
        </div>
      </section>
    </div>
  );
}
