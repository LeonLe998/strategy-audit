import { useEffect, useState } from 'react';
import { 
  ArrowRight, 
  Check, 
  BookOpen, 
  ShieldCheck, 
  Sparkles, 
  TrendingDown, 
  Clock,
  ArrowUpRight,
  Target
} from 'lucide-react';

interface HomeProps {
  setActiveTab: (tab: string) => void;
}

export default function Home({ setActiveTab }: HomeProps) {
  const [libraryStats, setLibraryStats] = useState<{ tong: number; da_chay: number; gop: number; chua: number } | null>(null);
  const [activeCompareTab, setActiveCompareTab] = useState<'before' | 'after'>('after');

  useEffect(() => {
    let isCurrent = true;
    fetch('/data/thuvien_data/thu_vien_index.json')
      .then((response) => {
        if (!response.ok) throw new Error('Không tải được danh mục chiến lược');
        return response.json();
      })
      .then((data) => {
        if (isCurrent) {
          setLibraryStats({ tong: data.tong, da_chay: data.da_chay, gop: data.gop, chua: data.chua });
        }
      })
      .catch(() => undefined);

    return () => { isCurrent = false; };
  }, []);

  const goToSixBoxes = () => {
    window.location.assign('/sauo?trang-chu');
  };

  return (
    <div id="home-view" className="pb-24">
      {/* ═════════════════ HERO SECTION ═════════════════ */}
      <section className="px-5 pb-16 pt-8 md:pb-24 md:pt-16">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-neon-green/30 bg-neon-green/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-neon-green backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-neon-green opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-neon-green"></span>
              </span>
              Phòng Kiểm Định Chiến Lược · Đo Trước Khi Tin
            </div>

            <h1 className="mt-5 max-w-3xl font-display text-4xl font-extrabold leading-[1.15] text-white md:text-5xl lg:text-6xl">
              Học xong một phương pháp,
              <span className="mt-2 block text-transparent bg-clip-text bg-gradient-to-r from-neon-green via-emerald-400 to-teal-300">
                làm sao biết nó có kỳ vọng dương?
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-relaxed text-gray-300 md:text-lg">
              Đa số trader đốt tiền thật vì tin vào vài lệnh thắng quá khứ hoặc lý thuyết suông. 
              <strong className="text-white font-semibold"> Strategy Audit </strong> giúp bạn chạy mô phỏng hàng ngàn lệnh trên dữ liệu lịch sử để biết xác suất thắng, mức sụt giảm (Drawdown) và kỳ vọng thực tế trước khi mạo hiểm một đồng vốn.
            </p>

            <div className="mt-8 flex flex-col gap-3.5 sm:flex-row">
              <button 
                id="hero-btn-sauo"
                onClick={goToSixBoxes} 
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-neon-green px-6 py-4 font-bold text-black shadow-[0_0_25px_rgba(0,255,163,0.35)] transition-all duration-200 hover:brightness-110 hover:shadow-[0_0_35px_rgba(0,255,163,0.5)] active:scale-[0.98]"
              >
                <span>Bắt đầu tự rà soát 6 ô</span>
                <span className="text-xs bg-black/20 px-2 py-0.5 rounded font-mono">3 phút · Free</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <button 
                id="hero-btn-library"
                onClick={() => setActiveTab('viplibrary')} 
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-4 font-semibold text-white backdrop-blur-sm transition-all duration-200 hover:border-neon-green/60 hover:bg-white/10 active:scale-[0.98]"
              >
                <span>Xem 300 ca đo thực tế</span>
                <ArrowUpRight className="h-4 w-4 text-neon-green" />
              </button>
            </div>

            {/* Quick trust metrics */}
            <div className="mt-6 flex flex-wrap items-center gap-y-2 gap-x-5 text-xs text-gray-400">
              <span className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-neon-green" /> Không cần tải phần mềm
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-neon-green" /> Không cần chia sẻ bí kíp
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-neon-green" /> 100% dựa trên bằng chứng dữ liệu
              </span>
            </div>
          </div>

          {/* Interactive Contrast Card: Cảm tính vs Đo kiểm */}
          <div className="relative rounded-3xl border border-white/15 bg-gradient-to-b from-[#131722] to-[#0d1017] p-6 shadow-2xl md:p-7">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-neon-green" />
                <span className="text-xs font-bold uppercase tracking-wider text-gray-200">Sự thật phũ phàng</span>
              </div>
              <div className="flex rounded-lg bg-black/50 p-1 border border-white/10 text-xs">
                <button
                  onClick={() => setActiveCompareTab('before')}
                  className={`rounded-md px-3 py-1 font-medium transition ${
                    activeCompareTab === 'before'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Cảm tính
                </button>
                <button
                  onClick={() => setActiveCompareTab('after')}
                  className={`rounded-md px-3 py-1 font-medium transition ${
                    activeCompareTab === 'after'
                      ? 'bg-neon-green/20 text-neon-green border border-neon-green/40 font-bold'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Sau khi đo kiểm
                </button>
              </div>
            </div>

            {activeCompareTab === 'before' ? (
              <div className="mt-5 space-y-4 animate-fadeIn">
                <div className="rounded-xl border border-rose-500/20 bg-rose-950/20 p-4">
                  <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                    <TrendingDown className="h-4 w-4" />
                    <span>Ảo tưởng khi mới học phương pháp</span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-gray-300">
                    "Thấy video Youtube vào lệnh đẹp, thắng liên tiếp 3 lệnh. Nghĩ đây là chén thánh, vội nạp tiền thật và tăng volume."
                  </p>
                </div>

                <div className="space-y-2.5 text-xs text-gray-300">
                  <div className="flex items-start gap-2.5">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-500/20 text-rose-400 text-[10px] font-bold">✕</span>
                    <p>Không biết tỷ lệ thắng thật qua 1.000 lệnh chỉ có 34%.</p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-500/20 text-rose-400 text-[10px] font-bold">✕</span>
                    <p>Bất ngờ dính chuỗi 6 lệnh thua liên tiếp → hoảng loạn dời Stop Loss, gồng lỗ.</p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-500/20 text-rose-400 text-[10px] font-bold">✕</span>
                    <p>Cháy tài khoản sau 3 tháng mà không biết do phương pháp sai hay do mình thiếu may mắn.</p>
                  </div>
                </div>

                <div className="rounded-lg bg-rose-950/40 border border-rose-500/30 p-3 text-center">
                  <span className="text-xs font-semibold text-rose-300">Hậu quả: Mất tiền thật, mất thời gian, rơi vào vòng lặp đổi phương pháp liên tục.</span>
                </div>
              </div>
            ) : (
              <div className="mt-5 space-y-4 animate-fadeIn">
                <div className="rounded-xl border border-neon-green/30 bg-neon-green/10 p-4">
                  <div className="flex items-center gap-2 text-neon-green font-bold text-sm">
                    <ShieldCheck className="h-4 w-4" />
                    <span>Thấu hiểu bằng dữ liệu định lượng (Audit)</span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-gray-300">
                    "Chạy 1.500 lệnh qua 5 năm lịch sử (bao gồm cả Out-of-Sample). Nhìn rõ các năm lời/lỗ và rủi ro sụt giảm tối đa."
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg bg-[#0B0E14] p-2.5 border border-white/5">
                    <p className="text-[10px] text-gray-400">Win Rate</p>
                    <p className="text-sm font-bold text-white mt-0.5">38.2%</p>
                  </div>
                  <div className="rounded-lg bg-[#0B0E14] p-2.5 border border-white/5">
                    <p className="text-[10px] text-gray-400">Kỳ vọng (EV)</p>
                    <p className="text-sm font-bold text-neon-green mt-0.5">+0.32 R</p>
                  </div>
                  <div className="rounded-lg bg-[#0B0E14] p-2.5 border border-white/5">
                    <p className="text-[10px] text-gray-400">Max DD</p>
                    <p className="text-sm font-bold text-amber-400 mt-0.5">-14.5%</p>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs text-gray-300">
                  <div className="flex items-start gap-2.5">
                    <Check className="h-4 w-4 shrink-0 text-neon-green mt-0.5" />
                    <p>Gặp chuỗi 5 lệnh thua vẫn bình thản vì biết trong 5 năm từng có chuỗi thua 7 lệnh bình thường.</p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="h-4 w-4 shrink-0 text-neon-green mt-0.5" />
                    <p>Biết rõ khung giờ nào hệ thống chạy tốt, lúc nào nên tắt máy đứng ngoài bảo toàn vốn.</p>
                  </div>
                </div>

                <div className="rounded-lg bg-neon-green/10 border border-neon-green/30 p-3 text-center">
                  <span className="text-xs font-semibold text-neon-green">Lợi thế: Tự tin giao dịch có kỷ luật vì đã thấy bức tranh toàn cảnh bằng số liệu.</span>
                </div>
              </div>
            )}

            <div className="mt-5 border-t border-white/10 pt-4 flex items-center justify-between text-xs text-gray-400">
              <span>Khoảng trống quan trọng nhất:</span>
              <span className="font-semibold text-white">HỌC → <span className="text-neon-green font-bold">ĐO</span> → THỰC HÀNH</span>
            </div>
          </div>
        </div>
      </section>

      {/* ═════════════════ SHOCKING STATS SECTION ═════════════════ */}
      <section className="border-y border-white/10 bg-[#10141d]/80 px-5 py-14 md:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center max-w-3xl mx-auto">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-neon-green">
              Bằng chứng từ phòng kiểm định
            </p>
            <h2 className="mt-3 font-display text-3xl font-extrabold text-white md:text-4xl">
              Sự thật về 242 phương pháp đã được đo
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-gray-300 md:text-base">
              Chúng tôi đưa 242 chiến lược phổ biến trên thị trường (Breakout, SMC, FVG, RSI Divergence, EMA Cross...) vào kiểm định định lượng qua nhiều năm dữ liệu lịch sử. Kết quả làm nhiều người giật mình:
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {/* Box 1: 78% CHÁT */}
            <div className="relative rounded-2xl border border-rose-500/30 bg-gradient-to-b from-rose-950/20 to-[#131722] p-6 text-left">
              <div className="flex items-center justify-between">
                <span className="rounded-md bg-rose-500/20 px-2.5 py-1 text-xs font-bold text-rose-400">
                  CHÁT · 188 / 242
                </span>
                <span className="text-3xl font-display font-black text-rose-400">78%</span>
              </div>
              <h3 className="mt-4 text-lg font-bold text-white">Thua lỗ hoặc âm kỳ vọng</h3>
              <p className="mt-2 text-xs leading-relaxed text-gray-400">
                Khi tính đúng phí giao dịch, trượt giá và chạy qua các năm biến động, 78% phương pháp nổi tiếng trên mạng đều đốt cụt vốn về dài hạn.
              </p>
              <div className="mt-4 pt-4 border-t border-rose-500/20 text-[11px] font-medium text-rose-300/80">
                ⚠️ Nếu chưa đo, bạn rất có thể đang dùng tiền thật cho một phương pháp nằm trong 78% này.
              </div>
            </div>

            {/* Box 2: 16% TÌNH HUỐNG */}
            <div className="relative rounded-2xl border border-amber-500/30 bg-gradient-to-b from-amber-950/20 to-[#131722] p-6 text-left">
              <div className="flex items-center justify-between">
                <span className="rounded-md bg-amber-500/20 px-2.5 py-1 text-xs font-bold text-amber-400">
                  TÌNH HUỐNG · 39 / 242
                </span>
                <span className="text-3xl font-display font-black text-amber-400">16%</span>
              </div>
              <h3 className="mt-4 text-lg font-bold text-white">Chỉ chạy được ở pha hẹp</h3>
              <p className="mt-2 text-xs leading-relaxed text-gray-400">
                Phương pháp chỉ có lãi trong một chu kỳ thuận lợi (chỉ trend mạnh hoặc chỉ sideway). Khi thị trường đổi pha, tài khoản bị sụt giảm nghiêm trọng.
              </p>
              <div className="mt-4 pt-4 border-t border-amber-500/20 text-[11px] font-medium text-amber-300/80">
                💡 Cần quy tắc bộ lọc điều kiện thị trường rõ ràng trước khi bấm lệnh.
              </div>
            </div>

            {/* Box 3: 6% CHẤT */}
            <div className="relative rounded-2xl border border-neon-green/40 bg-gradient-to-b from-neon-green/10 to-[#131722] p-6 text-left shadow-[0_0_30px_rgba(0,255,163,0.1)]">
              <div className="flex items-center justify-between">
                <span className="rounded-md bg-neon-green/20 px-2.5 py-1 text-xs font-bold text-neon-green">
                  CHẤT · 15 / 242
                </span>
                <span className="text-3xl font-display font-black text-neon-green">6%</span>
              </div>
              <h3 className="mt-4 text-lg font-bold text-white">Có lợi thế thống kê thật</h3>
              <p className="mt-2 text-xs leading-relaxed text-gray-300">
                Đạt tiêu chuẩn khắt khe: sống sót qua giai đoạn Out-of-Sample, kỳ vọng dương ổn định qua nhiều năm, mức sụt giảm trong tầm kiểm soát.
              </p>
              <div className="mt-4 pt-4 border-t border-neon-green/20 text-[11px] font-medium text-neon-green">
                ✨ Số ít chiến lược xứng đáng để bạn dành vốn và kỷ luật theo đuổi.
              </div>
            </div>
          </div>

          <div className="mt-10 text-center">
            <button
              onClick={() => setActiveTab('viplibrary')}
              className="inline-flex items-center gap-2 rounded-xl bg-neon-green/15 border border-neon-green/40 px-6 py-3.5 text-sm font-bold text-neon-green hover:bg-neon-green hover:text-black transition"
            >
              <span>Xem danh sách {libraryStats ? `${libraryStats.tong} chiến lược (${libraryStats.da_chay} đã kiểm định)` : '300 chiến lược'} trong thư viện</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ═════════════════ 3 CRITICAL QUESTIONS (SELF-TEST) ═════════════════ */}
      <section className="px-5 py-16 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-[1fr_1fr] items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neon-green">Tự kiểm tra nhanh</p>
              <h2 className="mt-3 font-display text-3xl font-extrabold text-white md:text-4xl">
                Phương pháp của bạn có trả lời được 3 câu hỏi này?
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-gray-300 md:text-base">
                Nếu bạn đang giao dịch tiền thật nhưng chưa thể trả lời chính xác 3 câu hỏi sau bằng số liệu, bạn đang đánh cược với xác suất chống lại mình:
              </p>

              <div className="mt-8 space-y-4">
                <div className="rounded-xl border border-white/10 bg-[#131722]/80 p-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/10 text-xs font-bold text-neon-green font-mono">01</span>
                    <h3 className="text-sm font-semibold text-white">Quy tắc có đủ rõ để người lạ bấm y hệt bạn?</h3>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-gray-400 pl-10">
                    Nếu câu trả lời là "tùy cảm nhận thị trường" hay "thấy nến đẹp thì vào", bạn chưa có một hệ thống, bạn chỉ có linh cảm ngẫu hứng.
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-[#131722]/80 p-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/10 text-xs font-bold text-neon-green font-mono">02</span>
                    <h3 className="text-sm font-semibold text-white">Chuỗi thua dài nhất (Max Consec Losses) là bao nhiêu lệnh?</h3>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-gray-400 pl-10">
                    Nếu chưa đo, khi gặp chuỗi 6 lệnh thua bạn sẽ nghi ngờ bản thân, hủy kỷ luật và gồng lỗ. Người có số liệu sẽ biết chuỗi đó hoàn toàn bình thường.
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-[#131722]/80 p-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/10 text-xs font-bold text-neon-green font-mono">03</span>
                    <h3 className="text-sm font-semibold text-white">Mức sụt giảm tài khoản lớn nhất (Max Drawdown) là bao nhiêu %?</h3>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-gray-400 pl-10">
                    Tài khoản của bạn có chịu nổi một đợt rút vốn 25% trong 3 tháng không? Nếu không biết trước con số này, tâm lý bạn sẽ gãy trước khi hệ thống kịp phục hồi.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Box right side */}
            <div className="rounded-3xl border border-neon-green/30 bg-gradient-to-br from-[#131722] via-[#0d1017] to-[#10141d] p-7 md:p-9 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neon-green/20 text-neon-green">
                  <Target className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-white">Bắt đầu bằng bước nhỏ nhất</h3>
                  <p className="text-xs text-gray-400">Không cần toán cao cấp · 3 phút hoàn thành</p>
                </div>
              </div>

              <p className="mt-6 text-sm leading-relaxed text-gray-300">
                Bài kiểm tra <strong className="text-white">"Sáu Ô"</strong> được thiết kế để bạn tự rà soát phương pháp của mình:
              </p>

              <div className="mt-4 space-y-2.5 text-xs text-gray-300">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-neon-green"></span>
                  <span>Ô 1: Lối đánh (Phá vỡ, Hồi quy hay Theo xu hướng?)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-neon-green"></span>
                  <span>Ô 2: Chỗ vào (Tín hiệu kích hoạt lệnh cụ thể là gì?)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-neon-green"></span>
                  <span>Ô 3: Chỗ thoát (Cắt lỗ ở đâu, chốt lời ra sao?)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-neon-green"></span>
                  <span>Ô 4-6: Nhịp lệnh, khung giờ và tần suất giao dịch</span>
                </div>
              </div>

              <div className="mt-8 border-t border-white/10 pt-6">
                <button
                  onClick={goToSixBoxes}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-neon-green py-4 px-6 font-bold text-black hover:brightness-110 transition shadow-[0_0_20px_rgba(0,255,163,0.3)]"
                >
                  <span>Tự làm bài kiểm tra 6 ô ngay</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
                <p className="mt-3 text-center text-xs text-gray-400">
                  Trả lời xong bạn sẽ nhận được điểm rà soát và biết ô nào đang bị bỏ trống.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═════════════════ 3-STEP ROADMAP SECTION ═════════════════ */}
      <section className="border-t border-white/10 bg-[#10141d]/70 px-5 py-16 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-neon-green">Lộ trình thực tế</p>
            <h2 className="mt-3 font-display text-3xl font-extrabold text-white md:text-4xl">
              Từ người mới đến trader dựa trên dữ liệu
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-gray-400">
              Không cần học toán phức tạp. Bạn đi từng bước có hướng dẫn rõ ràng:
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {/* Step 1 */}
            <div className="relative rounded-2xl border border-white/10 bg-[#131722]/90 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-mono text-neon-green px-2 py-1 rounded bg-neon-green/10 border border-neon-green/30">
                    BƯỚC 01
                  </span>
                  <Clock className="h-4 w-4 text-gray-500" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-white">Tự rà soát 6 ô</h3>
                <p className="mt-2 text-xs leading-relaxed text-gray-400">
                  Trả lời sáu câu hỏi bằng ngôn ngữ tự nhiên. Bạn sẽ thấy ngay quy tắc nào đã rõ ràng, và ô nào bạn đang đánh bừa theo cảm xúc.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs text-neon-green font-medium">Miễn phí · ~3 phút</span>
                <button onClick={goToSixBoxes} className="text-xs font-bold text-white hover:text-neon-green inline-flex items-center gap-1">
                  Làm ngay <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative rounded-2xl border border-white/10 bg-[#131722]/90 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-mono text-neon-green px-2 py-1 rounded bg-neon-green/10 border border-neon-green/30">
                    BƯỚC 02
                  </span>
                  <BookOpen className="h-4 w-4 text-gray-500" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-white">Đối chiếu Thư viện 300 ca đo</h3>
                <p className="mt-2 text-xs leading-relaxed text-gray-400">
                  Tra cứu phương pháp bạn đang quan tâm (hoặc dạng tương tự). Xem số liệu kiểm định thực tế qua 5 năm: Winrate, EV, số lệnh và các năm thua lỗ.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs text-gray-300 font-medium">300 chiến lược có sẵn</span>
                <button onClick={() => setActiveTab('viplibrary')} className="text-xs font-bold text-white hover:text-neon-green inline-flex items-center gap-1">
                  Mở thư viện <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative rounded-2xl border border-white/10 bg-[#131722]/90 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-mono text-neon-green px-2 py-1 rounded bg-neon-green/10 border border-neon-green/30">
                    BƯỚC 03
                  </span>
                  <ShieldCheck className="h-4 w-4 text-gray-500" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-white">Đồng hành & Đo kiểm chuyên sâu</h3>
                <p className="mt-2 text-xs leading-relaxed text-gray-400">
                  Đưa phương pháp riêng của bạn vào quy trình kiểm định In-Sample và Out-of-Sample. Nhận báo cáo định lượng để tự tin giao dịch hoặc dừng lại kịp lúc.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs text-gray-300 font-medium">Chương trình thành viên</span>
                <button onClick={() => setActiveTab('membership')} className="text-xs font-bold text-white hover:text-neon-green inline-flex items-center gap-1">
                  Xem chi tiết <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═════════════════ METHODOLOGY PREVIEW (SERVICES TEASER) ═════════════════ */}
      <section className="px-5 py-16 md:py-20">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.1fr_0.9fr] items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-neon-green">Quy chuẩn định lượng</p>
            <h2 className="mt-3 font-display text-3xl font-extrabold text-white md:text-4xl">
              Vì sao backtest thông thường hay bị lừa?
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-gray-300">
              Nhiều người thử vài tham số trên biểu đồ thấy lãi đậm, nhưng đem đánh tiền thật thì cháy. Đó là cái bẫy <strong className="text-white">"Khớp quá mức" (Overfitting)</strong>.
            </p>

            <div className="mt-6 space-y-3.5 text-xs text-gray-300">
              <div className="flex gap-3">
                <Check className="h-4 w-4 shrink-0 text-neon-green mt-0.5" />
                <div>
                  <strong className="text-white">Tách dữ liệu In-Sample & Out-of-Sample:</strong> Dùng một giai đoạn để xây dựng quy tắc, và một giai đoạn độc lập mà phương pháp chưa từng nhìn thấy để kiểm chứng.
                </div>
              </div>
              <div className="flex gap-3">
                <Check className="h-4 w-4 shrink-0 text-neon-green mt-0.5" />
                <div>
                  <strong className="text-white">Đo lường Kỳ vọng toán học (EV):</strong> Không chỉ nhìn Winrate. Một phương pháp thắng 70% nhưng mỗi lần thua mất 3 lần thắng vẫn là phương pháp âm kỳ vọng.
                </div>
              </div>
              <div className="flex gap-3">
                <Check className="h-4 w-4 shrink-0 text-neon-green mt-0.5" />
                <div>
                  <strong className="text-white">Kiểm tra trượt giá và chi phí sàn:</strong> Mô phỏng sát điều kiện giao dịch thực tế nhất, tránh ảo tưởng trên giấy.
                </div>
              </div>
            </div>

            <div className="mt-8">
              <button 
                onClick={() => setActiveTab('services')} 
                className="inline-flex items-center gap-2 text-sm font-bold text-neon-green hover:underline"
              >
                Xem chi tiết cách một báo cáo kiểm định được thực hiện <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-white/15 bg-[#131722] p-6 text-xs text-gray-300 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="font-bold text-white text-sm">Báo cáo mẫu · SEA004</span>
              <span className="rounded bg-neon-green/20 text-neon-green px-2 py-0.5 text-[10px] font-mono">ĐẠT CHUẨN</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-[#0B0E14] p-3">
                <p className="text-gray-500 text-[10px]">Cỡ mẫu kiểm định (OOS)</p>
                <p className="text-base font-bold text-white mt-1">1.520 lệnh</p>
              </div>
              <div className="rounded-lg bg-[#0B0E14] p-3">
                <p className="text-gray-500 text-[10px]">Lãi TB mỗi lệnh (EV)</p>
                <p className="text-base font-bold text-neon-green mt-1">+0.38 R</p>
              </div>
              <div className="rounded-lg bg-[#0B0E14] p-3">
                <p className="text-gray-500 text-[10px]">Tỷ lệ năm dương</p>
                <p className="text-base font-bold text-white mt-1">4 / 5 năm</p>
              </div>
              <div className="rounded-lg bg-[#0B0E14] p-3">
                <p className="text-gray-500 text-[10px]">Độ tin cậy mẫu</p>
                <p className="text-base font-bold text-teal-300 mt-1">Đủ mẫu 95%</p>
              </div>
            </div>
            <p className="text-[11px] text-gray-400 italic">
              *Mỗi báo cáo trong Strategy Audit đều chỉ rõ ưu điểm, nhược điểm và giới hạn mà dữ liệu lịch sử chưa phản ánh.
            </p>
          </div>
        </div>
      </section>

      {/* ═════════════════ FINAL CALL TO ACTION ═════════════════ */}
      <section className="px-5 pb-16 pt-6 md:pb-24">
        <div className="mx-auto max-w-6xl rounded-3xl border border-neon-green/30 bg-gradient-to-br from-neon-green/15 via-[#131722] to-[#0B0E14] p-8 md:p-14 shadow-2xl">
          <div className="max-w-3xl">
            <span className="inline-block rounded-full bg-neon-green/20 border border-neon-green/40 px-3 py-1 text-xs font-bold uppercase tracking-wider text-neon-green">
              Bắt đầu ngay hôm nay
            </span>
            <h2 className="mt-4 font-display text-3xl font-extrabold text-white md:text-5xl leading-tight">
              Đừng để tiền thật làm vật thí nghiệm cho phương pháp chưa đo.
            </h2>
            <p className="mt-5 max-w-2xl text-sm leading-relaxed text-gray-300 md:text-base">
              Chỉ mất 3 phút với 6 câu hỏi đơn giản để bạn biết phương pháp của mình đang thiếu quy tắc nào. Hoặc xem ngay 300 ca đo để học cách người khác kiểm định.
            </p>

            <div className="mt-8 flex flex-col gap-3.5 sm:flex-row">
              <button 
                onClick={goToSixBoxes} 
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-neon-green px-7 py-4 font-bold text-black shadow-[0_0_25px_rgba(0,255,163,0.35)] transition hover:brightness-110 active:scale-[0.98]"
              >
                <span>Tự rà soát 6 ô miễn phí</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <button 
                onClick={() => setActiveTab('viplibrary')} 
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-4 font-semibold text-white hover:border-neon-green/50 hover:bg-white/10 transition active:scale-[0.98]"
              >
                <span>Mở thư viện 300 chiến lược</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <a 
                href="https://t.me/strategyaudit" 
                target="_blank" 
                rel="noreferrer" 
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-neon-green/30 px-5 py-4 text-sm font-semibold text-neon-green hover:bg-neon-green/10 transition"
              >
                Vào Telegram hỏi đáp <ArrowRight className="h-4 w-4" />
              </a>
            </div>

            <p className="mt-6 text-xs text-gray-400">
              Strategy Audit cung cấp phân tích định lượng và giáo dục dựa trên dữ liệu lịch sử; không phải tín hiệu đầu tư hay cam kết lợi nhuận.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
