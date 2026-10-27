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
      title: 'Đo / Kiểm chứng',
      body: 'Đo, hay kiểm chứng, là đem đúng luật đó chạy qua thật nhiều lệnh trên dữ liệu thật, đã trừ phí, rồi xem nó có hơn vào lệnh ngẫu nhiên không.',
    },
    {
      key: 'thuc-hanh',
      title: 'Thực hành',
      body: 'Có số rồi mới quyết dùng hay bỏ. Vì mình trade một chuỗi 500 đến 1000 lệnh, chứ không phải một lệnh.',
    },
  ],
  /** Câu hỏi không có đáp án sai: chọn ô nào cũng nhận một sự thật bằng số, rồi lật cả bốn ô */
  poll: {
    key: 'khai-niem:yeu-to',
    question: 'Theo bạn, yếu tố nào quan trọng nhất khi xây một hệ thống giao dịch?',
    options: [
      {
        id: 'vao-lenh',
        label: 'Điểm vào lệnh đẹp',
        fact: 'Bốn trường phái được nói nhiều nhất là SMC/ICT, ORB, RSI, MACD: 42 chiến lược, 22.938 lệnh, đậu 0. Vào lệnh đẹp chưa đủ.',
      },
      {
        id: 'ti-le-thang',
        label: 'Tỉ lệ thắng cao',
        fact: 'Cùng một luật vào, mình thử bốn cách thoát. Chốt lời sớm thắng 48,22%, cao nhất trong bốn cách, mà lại gần tệ nhất.',
      },
      {
        id: 'thoi-diem',
        label: 'Thời điểm vào lệnh',
        fact: 'Nhóm Giờ giấc & mùa vụ đậu 4 trên 22, tức 18,2%. Gấp 3,5 lần sáu nhóm còn lại gộp lại.',
      },
      {
        id: 'ky-luat',
        label: 'Kỷ luật',
        fact: 'Kỷ luật là lặp lại hành vi đúng đủ nhiều lần. Nhưng 62 chiến lược chạy từ 597 lệnh trở lên thì không cái nào đậu. Lặp lại một luật không có lợi thế thì càng kỷ luật càng thua đều.',
      },
    ],
    closing:
      'Không yếu tố nào tự đứng một mình được. Muốn biết hệ thống của bạn đứng ở đâu thì phải đo nó.',
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
