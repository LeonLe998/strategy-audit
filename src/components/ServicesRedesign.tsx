import { useEffect, useState } from 'react';
import { ArrowRight, BarChart3, Database, Search, ShieldCheck } from 'lucide-react';

interface ServicesProps { setActiveTab: (tab: string) => void }
interface ExampleReport {
  spec: { id: string; ten: string };
  OOS: { n: number; ev: number; wr: number; pf: number; years_pos: string; by_year: Record<string, number> };
}

const steps = [
  { icon: Search, title: '1. Viết quy tắc cho rõ', text: 'Mô tả điều kiện vào lệnh, thoát lệnh, khung thời gian và lúc đứng ngoài. Nếu hai người đọc mà hiểu khác nhau, cần làm rõ trước khi đo.' },
  { icon: Database, title: '2. Tách phần học và phần kiểm tra', text: 'Dùng một giai đoạn dữ liệu để xây dựng cách kiểm tra, rồi xem riêng giai đoạn sau mà phương pháp chưa dùng để điều chỉnh.' },
  { icon: BarChart3, title: '3. Xem nhiều mặt của kết quả', text: 'Đọc số lệnh, lãi/lỗ trung bình theo mức rủi ro, năm lời/lỗ và những điều kiện khiến kết quả thay đổi.' },
  { icon: ShieldCheck, title: '4. Hiểu điều dữ liệu chưa nói', text: 'Một kết quả lịch sử không dự báo chắc chắn tương lai. Cỡ mẫu nhỏ, phí, cách khớp lệnh và thay đổi thị trường đều tạo giới hạn.' },
];

export default function ServicesRedesign({ setActiveTab }: ServicesProps) {
  const [report, setReport] = useState<ExampleReport | null>(null);
  useEffect(() => {
    fetch('/data/thuvien_data/reports_json/SEA004.json').then((response) => {
      if (!response.ok) throw new Error('report unavailable');
      return response.json();
    }).then(setReport).catch(() => setReport(null));
  }, []);
  const years = report ? Object.entries(report.OOS.by_year) : [];
  const maxAbs = Math.max(1, ...years.map(([, value]) => Math.abs(value)));

  return <div id="services-view" className="pb-20">
    <section className="px-5 pb-14 pt-12 md:pb-16 md:pt-20"><div className="mx-auto max-w-6xl">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-neon-green">Cách Strategy Audit làm việc</p>
      <h1 className="mt-5 max-w-4xl font-display text-4xl font-bold leading-tight text-white md:text-6xl">Từ một ý tưởng đến một kết quả có thể đọc được</h1>
      <p className="mt-6 max-w-3xl text-base leading-7 text-gray-300 md:text-lg">Trước khi tin một phương pháp, cần mô tả nó đủ rõ để kiểm tra theo cùng một cách nhiều lần. Sau đó mới xem dữ liệu nói lên điều gì — và điều gì vẫn chưa biết.</p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button onClick={() => setActiveTab('sauo')} className="inline-flex items-center justify-center gap-2 rounded-xl bg-neon-green px-6 py-4 font-semibold text-black">Tự rà soát 6 ô <ArrowRight className="h-4 w-4" /></button>
        <button onClick={() => setActiveTab('viplibrary')} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 px-6 py-4 font-semibold text-white hover:border-neon-green/60">Xem 300 chiến lược <ArrowRight className="h-4 w-4" /></button>
      </div>
    </div></section>
    <section className="border-y border-white/10 bg-[#10141d]/70 px-5 py-14"><div className="mx-auto grid max-w-6xl gap-4 sm:grid-cols-2">
      {steps.map(({ icon: Icon, title, text }) => <article key={title} className="rounded-2xl border border-white/10 bg-[#131722]/80 p-6 md:p-7"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-neon-green/10 text-neon-green"><Icon className="h-5 w-5" /></div><h2 className="mt-5 text-lg font-semibold text-white">{title}</h2><p className="mt-3 text-sm leading-6 text-gray-400">{text}</p></article>)}
    </div></section>
    {report && <section className="px-5 py-14 md:py-20"><div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.8fr_1.2fr]">
      <div><p className="text-sm font-semibold uppercase tracking-[0.14em] text-neon-green">Ví dụ từ thư viện · {report.spec.id}</p><h2 className="mt-3 font-display text-3xl font-bold text-white md:text-4xl">Một báo cáo gồm những gì?</h2><p className="mt-4 text-sm leading-7 text-gray-400">{report.spec.ten}. Đây là kết quả lịch sử của mẫu cụ thể này, không phải tín hiệu mua/bán. Giai đoạn kiểm tra gồm {report.OOS.n} lệnh; số lệnh ít nên cần đọc cùng các giới hạn trong báo cáo.</p><a href={`/vip/${report.spec.id}`} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-neon-green hover:text-white">Mở báo cáo đầy đủ <ArrowRight className="h-4 w-4" /></a></div>
      <div className="rounded-3xl border border-white/10 bg-[#131722] p-5 md:p-7"><div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{[['Lệnh', report.OOS.n], ['Lãi/lỗ TB', `${report.OOS.ev > 0 ? '+' : ''}${report.OOS.ev} R`], ['Tỷ lệ thắng', `${report.OOS.wr}%`], ['Năm có lãi', report.OOS.years_pos]].map(([label, value]) => <div key={label} className="rounded-xl bg-[#0B0E14] p-4"><p className="text-xs text-gray-500">{label}</p><p className="mt-2 text-lg font-bold text-white">{value}</p></div>)}</div>
        <div className="mt-6"><p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Kết quả theo từng năm trong giai đoạn kiểm tra</p><div className="flex h-28 items-end gap-2 border-b border-white/10 pb-2">{years.map(([year, value]) => <div key={year} className="flex h-full flex-1 flex-col items-center justify-end gap-2"><div title={`${year}: ${value} R`} className={`w-full max-w-12 rounded-t-md ${value >= 0 ? 'bg-neon-green/80' : 'bg-rose-400/80'}`} style={{ height: `${Math.max(8, Math.abs(value) / maxAbs * 76)}%` }} /><span className="text-[10px] text-gray-500">{year}</span></div>)}</div><p className="mt-3 text-xs leading-5 text-gray-500">Cột xanh: kết quả dương · cột đỏ: kết quả âm. Dữ liệu lịch sử không bảo đảm kết quả tương lai.</p></div>
      </div>
    </div></section>}
    <section className="px-5 pb-16"><div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-5 rounded-3xl border border-neon-green/20 bg-gradient-to-br from-neon-green/10 to-[#131722] p-7 md:flex-row md:items-center md:p-10"><div><h2 className="text-2xl font-bold text-white">Muốn tự nhìn lại phương pháp của mình?</h2><p className="mt-2 text-sm leading-6 text-gray-300">Sáu câu hỏi miễn phí giúp bạn xác định quy tắc nào đã rõ và chỗ nào còn cần làm cụ thể hơn.</p></div><button onClick={() => setActiveTab('sauo')} className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-neon-green px-5 py-3.5 font-semibold text-black">Bắt đầu miễn phí <ArrowRight className="h-4 w-4" /></button></div></section>
  </div>;
}
