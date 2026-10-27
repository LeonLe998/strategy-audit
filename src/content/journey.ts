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
      body: 'Đo, hay kiểm chứng, là cho máy làm đúng luật đó qua hàng nghìn lệnh trên giá vàng thật của nhiều năm, có tính cả phí, rồi xem kết quả có hơn việc vào lệnh bừa hay không.',
    },
    {
      key: 'thuc-hanh',
      title: 'Thực hành',
      body: 'Có số rồi mới quyết dùng hay bỏ. Vì mình trade một chuỗi 500 đến 1000 lệnh, chứ không phải một lệnh.',
    },
  ],
  /**
   * Câu hỏi không có đáp án sai: chọn ô nào cũng nhận một sự thật bằng số, rồi lật cả bốn ô.
   * Viết cho người mới: không tên nhóm, không thuật ngữ, mỗi ô tối đa một con số và số đó tự hiểu được.
   */
  poll: {
    key: 'khai-niem:yeu-to',
    question: 'Theo bạn, yếu tố nào quan trọng nhất khi xây một hệ thống giao dịch?',
    options: [
      {
        id: 'vao-lenh',
        label: 'Điểm vào lệnh đẹp',
        fact: 'Mình lấy những cách vào lệnh được dạy nhiều nhất trên mạng, như SMC hay RSI, rồi cho máy làm đúng luật qua 22.938 lệnh. Không cách nào qua được bài kiểm tra. Vào lệnh đẹp thôi thì chưa đủ.',
      },
      {
        id: 'ti-le-thang',
        label: 'Tỉ lệ thắng cao',
        fact: 'Cùng một cách vào lệnh, mình chỉ đổi cách chốt. Chốt lời sớm thì cứ 100 lệnh thắng khoảng 48, nhiều hơn mọi cách khác. Nhưng lệnh thắng thì lời ít, lệnh thua vẫn lỗ đủ, nên cộng cả chuỗi lại nó gần như tệ nhất.',
      },
      {
        id: 'thoi-diem',
        label: 'Thời điểm vào lệnh',
        fact: 'Có những cách đánh chỉ dựa vào giờ và ngày, ví dụ vào lệnh ở một khung giờ cố định, hay vài ngày cuối tháng. Nghe rất đơn giản, vậy mà đây lại là kiểu qua bài kiểm tra nhiều nhất thư viện, gấp khoảng 3,5 lần các kiểu còn lại.',
      },
      {
        id: 'ky-luat',
        label: 'Kỷ luật',
        fact: 'Máy là thứ kỷ luật nhất: không cảm xúc, không phá luật lệnh nào. Mình cho máy làm đúng luật của 242 chiến lược, vậy mà 188 cái vẫn không có lợi thế. Kỷ luật chỉ giúp khi luật của bạn đúng từ đầu.',
      },
    ],
    closing:
      'Không yếu tố nào tự đứng một mình được. Muốn biết cách đánh của bạn có lợi thế thật hay không, chỉ có một cách là đem nó đi đo.',
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
