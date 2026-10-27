/**
 * Chữ và số của Màn 1–2. BẢN NHÁP — chờ Leon duyệt.
 *
 * Số cố định ở đây lấy từ kho số đã kiểm (skill strategy-audit-content):
 *   thí nghiệm thoát lệnh · 4 trường phái nóng · kỳ thi lần 2.
 * Số của từng chiến lược trên lá bài KHÔNG gõ ở đây — đọc từ public/data/thuvien_data lúc chạy.
 * Không R, không profit factor, không % lãi lỗ.
 */

export type Verdict = 'CHẤT' | 'CHÁT' | 'TÌNH HUỐNG';

// ───────────────────────── Màn 1 · Khái niệm ─────────────────────────

export const STAGE1 = {
  kicker: 'Màn 1 · Khái niệm',
  title: 'Biết cách đánh chưa có nghĩa là biết nó có ăn không',
  steps: [
    {
      key: 'hoc',
      title: 'Học',
      body: 'Các bạn học một phương pháp từ sách, từ khoá học hay từ TikTok. Lúc đó mình mới biết cách vào lệnh, chứ chưa biết nó có lợi thế thật hay không.',
    },
    {
      key: 'do',
      title: 'Đo',
      body: 'Đo là đem đúng luật đó chạy qua thật nhiều lệnh trên dữ liệu thật, đã trừ phí, rồi xem nó có hơn vào lệnh ngẫu nhiên không.',
    },
    {
      key: 'thuc-hanh',
      title: 'Thực hành',
      body: 'Có số rồi mới quyết dùng hay bỏ. Vì mình trade một chuỗi 500 đến 1000 lệnh, chứ không phải một lệnh.',
    },
  ],
  quiz: {
    key: 'khai-niem:quiz',
    question: 'Cùng một luật vào lệnh, mình thử bốn cách thoát. Theo bạn, cách nào cho tỉ lệ thắng cao nhất?',
    options: [
      { id: 'A', label: 'Giữ cách thoát mặc định', trades: 5593, winRate: '39,42%' },
      { id: 'B', label: 'Chốt lời sớm', trades: 6921, winRate: '48,22%' },
      { id: 'C', label: 'Để lệnh chạy thật xa', trades: 3336, winRate: '25,45%' },
      { id: 'D', label: 'Cắt lỗ thật sát', trades: 8539, winRate: '38,03%' },
    ],
    correct: 'B',
    reveal:
      'Chốt sớm thắng nhiều nhất, 48,22%. Nhưng xét cả bốn cách thì nó lại gần tệ nhất. Tỉ lệ thắng cao chưa nói lên phương pháp tốt, nên mới phải đo đủ mặt.',
  },
  cta: 'Qua màn 2',
};

// ───────────────────── Màn 2 · Vì sao kiểm định ─────────────────────

export const STAGE2 = {
  kicker: 'Màn 2 · Vì sao kiểm định',
  title: 'Chiến lược thì không thiếu. Cái thiếu là bộ lọc.',
  intro:
    'Thời AI, ai cũng tạo được một chiến lược trong năm phút. Chiến lược càng nhiều thì càng cần một chỗ đo cho thẳng, nên mình làm thư viện này.',
  /** Phễu thư viện — đọc tong/da_chay/verdict_da_chay từ index lúc chạy, đây chỉ là nhãn */
  funnelLabels: { tong: 'đưa vào thư viện', daChay: 'kiểm định đầy đủ', chat: 'đậu chuẩn' },
  facts: [
    {
      key: 'truong-phai-nong',
      title: 'Bốn trường phái được nói nhiều nhất',
      body: 'SMC/ICT, ORB, RSI, MACD: 42 chiến lược, 22.938 lệnh, đậu 0.',
    },
    {
      key: 'ky-thi-2',
      title: 'Kỳ thi lần 2',
      body: 'Đem 15 chiến lược CHẤT chấm lại trên dữ liệu mới từ 02/2024 đến 07/2026: cả 15 vẫn giữ vững.',
    },
  ],
  gameIntro: 'Giờ tới lượt bạn. Đọc luật, đoán CHẤT hay CHÁT, rồi lật xem thư viện nói gì.',
  cards: [
    { id: 'IND002', hint: 'Chỉ báo gần như ai cũng học đầu tiên.' },
    { id: 'MTF014', hint: 'Cách vào lệnh SMC đang được chia sẻ rất nhiều.' },
    { id: 'SEA003', hint: 'Không chỉ báo, chỉ dựa vào ngày trong tháng.' },
  ],
  verdictChoices: ['CHẤT', 'CHÁT', 'TÌNH HUỐNG'] as Verdict[],
  wrapUp:
    'Cả ba lá đều thua nhiều lệnh hơn thắng, vậy mà một lá vẫn đậu. Vì đậu hay rớt không nằm ở tỉ lệ thắng, mà ở chỗ có hơn vào lệnh ngẫu nhiên và có qua được kỳ thi trên dữ liệu chưa từng thấy hay không. Lá đậu thuộc nhóm Giờ giấc & mùa vụ, nhóm đậu cao nhất thư viện: 4 trên 22.',
  cta: 'Qua màn 3 · Sáu Ô',
};
