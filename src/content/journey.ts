/**
 * Chữ và số của Màn 1–2, viết cho trader mới: không tên nhóm, không thuật ngữ chưa giải thích.
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
  funnelLabels: { tong: 'chiến lược đưa vào thư viện', daChay: 'đã đo đầy đủ', chat: 'qua bài kiểm tra' },
  /** Viết cho người mới như Màn 1: không tên nhóm, không thuật ngữ. Số 22.938 lệnh đã dùng ở Màn 1 nên không lặp lại. */
  facts: [
    {
      key: 'ti-le-qua',
      title: 'Cứ 100 chiến lược, chỉ khoảng 6 cái qua',
      body: 'Trong 242 chiến lược đã đo đầy đủ, 15 cái qua bài kiểm tra, 39 cái chỉ ăn trong một số điều kiện, còn 188 cái không có lợi thế.',
    },
    {
      key: 'ky-thi-2',
      title: 'Qua rồi có giữ được không?',
      body: 'Mình đem 15 chiến lược đã qua chấm lại trên giá vàng mới, từ 02/2024 đến 07/2026, phần giá chưa hề có lúc làm bài kiểm tra đầu. Cả 15 vẫn qua.',
    },
  ],
  gameIntro: 'Giờ tới lượt bạn. Đọc luật của từng lá, đoán nó thuộc loại nào, rồi lật xem kết quả đo.',
  /** Giải nghĩa ba con dấu, hiện ngay trên chỗ chọn */
  verdictLegend: [
    { verdict: 'CHẤT' as Verdict, meaning: 'qua bài kiểm tra, có lợi thế thật' },
    { verdict: 'CHÁT' as Verdict, meaning: 'không có lợi thế, không hơn vào lệnh bừa' },
    { verdict: 'TÌNH HUỐNG' as Verdict, meaning: 'chỉ ăn trong một số điều kiện' },
  ],
  /** Tên và luật viết lại bằng lời thường. Kết quả của từng lá vẫn đọc từ dữ liệu. */
  cards: [
    {
      id: 'IND002',
      name: 'RSI quá mua, quá bán',
      rule: 'Đường RSI xuống dưới 30 thì mua, lên trên 70 thì bán. Xem trên nến 4 giờ.',
      hint: 'Chỉ báo gần như ai cũng học đầu tiên.',
    },
    {
      id: 'MTF014',
      name: 'SMC: vùng trống giá + đổi hướng',
      rule: 'Chờ giá quay về một vùng giá chạy quá nhanh trên khung 4 giờ, rồi xuống khung 5 phút chờ giá đổi hướng mới vào lệnh.',
      hint: 'Cách vào lệnh đang được chia sẻ rất nhiều trên mạng.',
    },
    {
      id: 'SEA003',
      name: 'Mua cuối tháng',
      rule: 'Mua ở 2 ngày giao dịch cuối tháng, bán ra ở ngày giao dịch thứ 3 của tháng mới.',
      hint: 'Không chỉ báo nào, chỉ nhìn lịch.',
    },
  ],
  verdictChoices: ['CHẤT', 'CHÁT', 'TÌNH HUỐNG'] as Verdict[],
  reveal: {
    thi1: 'Bài thi trên giá vàng 2019–2023, phần giá không dùng lúc chỉnh luật',
    thi2: 'Chấm lại trên giá 02/2024–07/2026',
  },
  wrapUp:
    'Cả ba lá đều thua nhiều lệnh hơn thắng, vậy mà một lá vẫn qua. Vì qua hay rớt không nằm ở tỉ lệ thắng, mà ở chỗ cộng cả chuỗi lệnh lại có hơn vào lệnh bừa hay không, và còn đúng trên phần giá chưa dùng lúc chỉnh luật hay không. Lá qua lại là lá đơn giản nhất: chỉ nhìn lịch để mua, không cần chỉ báo nào.',
  cta: 'Qua màn 3 · Sáu Ô',
};

// ───────────────────── Sảnh bản đồ đảo · trang chủ ─────────────────────

/**
 * Trang chủ là bản đồ đảo: máy quay lướt qua từng đảo kèm một câu, rồi dừng ở toàn cảnh.
 * Mỗi đảo là cửa vào một trang thật (tab trong App). `landmark` chọn vật mốc dựng sẵn.
 * Số trong câu lấy từ kho số đã kiểm: 300 đưa vào · 242 đo đầy đủ · 15 qua.
 */
export const HUB = {
  intro: 'Thư viện kiểm định chiến lược giao dịch vàng. Đi một vòng xem ở đây có gì.',
  islands: [
    {
      key: 'bat-dau',
      landmark: 'khai-niem',
      tab: 'journey',
      title: 'Bắt đầu ở đây',
      sub: 'Lướt 1 phút cho người mới',
      /** Ghi chú hiện khi khách mới rê chuột (hoặc chạm lần 1) lên đảo */
      note: 'Năm hình ngắn: vì sao thắng nhiều chưa chắc đã ăn, và vì sao cách đánh nào cũng cần bằng chứng. Người mới nên bắt đầu ở đây.',
      caption: 'Bạn không thiếu cách đánh. Bạn thiếu bằng chứng. Lướt một phút để thấy vì sao.',
    },
    {
      key: 'vi-sao',
      landmark: 'vi-sao-kiem-dinh',
      tab: 'about',
      title: 'Vì sao cần đo',
      sub: 'Bản đọc đầy đủ',
      note: 'Bản đọc đầy đủ: vì sao một chiến lược phải đem đi đo trước khi tin.',
      caption: 'Thời AI, ai cũng tạo được một chiến lược trong năm phút. Chiến lược thì không thiếu, cái thiếu là bộ lọc.',
    },
    {
      key: 'sau-o',
      landmark: 'sau-o',
      tab: 'sauo',
      title: 'Tự kiểm tra 6 ô',
      sub: 'Miễn phí',
      note: 'Sáu câu hỏi về cách bạn đang trade, để thấy quy tắc nào đã rõ và quy tắc nào còn thiếu. Miễn phí.',
      caption: 'Trả lời sáu câu về cách bạn đang trade, để thấy quy tắc nào đã rõ và quy tắc nào còn thiếu.',
    },
    {
      key: 'thu-vien',
      landmark: 'thu-vien',
      tab: 'viplibrary',
      title: 'Thư viện 300',
      sub: '15 chiến lược qua bài kiểm tra',
      note: 'Tra cứu kết quả đo của từng chiến lược: 300 đưa vào, 242 đã đo đầy đủ, 15 qua bài kiểm tra.',
      caption: '300 chiến lược đưa vào thư viện, 242 cái đã đo đầy đủ. Chỉ 15 cái qua bài kiểm tra. Mỗi ô sáng trên tường là một chiến lược.',
    },
    {
      key: 'tai-lieu',
      landmark: 'kiem-diem',
      tab: 'vault',
      title: 'Hồ sơ nghiên cứu',
      sub: 'Kho tài liệu & báo cáo chuyên đề',
      note: 'Kho tài liệu nền tảng và các báo cáo chuyên đề rút ra từ quá trình kiểm định 242 chiến lược trên 22 năm dữ liệu vàng.',
      caption: 'Kho tài liệu và báo cáo chuyên đề rút ra từ quá trình kiểm định 242 chiến lược trên 22 năm dữ liệu vàng.',
    },
    {
      key: 'thanh-vien',
      landmark: 'chuyen-doi',
      tab: 'membership',
      title: 'Thành viên',
      sub: 'Mở toàn bộ thư viện',
      note: 'Mở toàn bộ hồ sơ thư viện. Membership 100 đô một tháng. Tháng đầu 50.',
      caption: 'Mở toàn bộ hồ sơ thư viện. Membership 100 đô một tháng. Tháng đầu 50.',
    },
  ] as const,
  outro: 'Chạm vào một hòn đảo để vào trang đó.',
  /** Menu cố định trên bản đồ: tab trong App + nhãn */
  // Menu trên bản đồ: đúng thứ tự 6 đảo, cùng tên với nhãn đảo
  menu: [
    { tab: 'journey', label: 'Bắt đầu ở đây' },
    { tab: 'about', label: 'Vì sao cần đo' },
    { tab: 'sauo', label: 'Tự kiểm tra 6 ô' },
    { tab: 'viplibrary', label: 'Thư viện 300' },
    { tab: 'vault', label: 'Hồ sơ nghiên cứu' },
    { tab: 'membership', label: 'Thành viên' },
  ],
  skip: 'Bỏ qua',
  replay: 'Xem lại vòng giới thiệu',
};

/**
 * SA bot (Strategy Audit bot): robot đứng trước cụm đảo, hỏi đúng một câu.
 * Có rồi → mở hết, khách tự chọn. Chưa từng → sáng đảo "Bắt đầu ở đây" + ghi chú khi rê/chạm lên đảo.
 * Vòng giới thiệu không tự chạy nữa, khách mới bấm "Đi một vòng xem trước" thì mới chạy.
 */
export const SA_BOT = {
  name: 'SA bot',
  ask: 'Chào bạn! Mình là SA bot. Bạn đã từng tham quan Strategy Audit chưa?',
  yes: 'Có rồi',
  no: 'Chưa từng',
  yesReply: 'Chào mừng bạn quay lại! Toàn bộ đảo đã mở, bạn chọn đảo muốn vào nhé.',
  noReply: (touch: boolean) =>
    touch
      ? 'Vậy mình bắt đầu từ đảo đang sáng nhé. Chạm một lần lên đảo khác để xem đảo đó dùng làm gì, chạm lần nữa để vào.'
      : 'Vậy mình bắt đầu từ đảo đang sáng nhé. Rê chuột lên các đảo khác để xem đảo đó dùng làm gì.',
  enterFirst: 'Vào Bắt đầu ở đây',
  tour: 'Đi một vòng xem trước',
  reask: 'Trả lời lại',
  startHere: 'Nên bắt đầu ở đây',
  chip: 'Hỏi SA bot',
};

/** Ô cuối mỗi trang: dẫn sang đảo kế tiếp theo thứ tự HUB.islands */
export const NEXT_STEP = {
  kicker: 'Bước tiếp theo',
  /** Ở trang cuối (Thành viên) thì gợi ý quay lại bài miễn phí */
  lastKicker: 'Chưa sẵn sàng đăng ký?',
  /** Trang không nằm trên bản đồ, hoặc trang cuối, thì gợi ý trang này */
  fallback: 'sauo',
  go: 'Đi tiếp',
  backToMap: 'Về bản đồ',
};

/** Kênh liên hệ dùng chung: bản đồ, cuối mỗi trang, chân trang */
export const CONTACT = {
  title: 'Liên hệ',
  ask: 'Có câu hỏi về thư viện hay gói thành viên? Nhắn trực tiếp cho Strategy Audit.',
  channels: [
    { id: 'zalo', label: 'Nhắn Zalo', href: 'https://zalo.me/0566665511' },
    { id: 'telegram', label: 'Nhắn Telegram', href: 'https://t.me/strategyaudit' },
  ] as const,
};

// ───────────────────── Đảo 1 · Bắt đầu ở đây (trang thu hút) ─────────────────────

/**
 * Trang /hanh-trinh, thay trò chơi Màn 1–2. Mỗi màn hình một hình lớn + một câu.
 * Số lấy từ kho số đã kiểm: 300 đưa vào · 242 đo đầy đủ · 15 qua; 4 trường phái nóng
 * 42 chiến lược · 22.938 lệnh · 0 qua; chốt lời sớm thắng ~48/100 lệnh nhưng gần như tệ nhất;
 * mua cuối tháng (SEA003) qua cả hai kỳ thi. Không R, không % lãi lỗ, không biểu đồ giá.
 */
export const START_HERE = {
  hero: {
    kicker: 'Bắt đầu ở đây',
    title: 'Bạn không thiếu cách đánh. Bạn thiếu bằng chứng.',
    body: '300 chiến lược đã đưa vào thư viện. Đo xong 242 cái, chỉ 15 cái qua.',
    stats: [
      { n: 300, label: 'đưa vào' },
      { n: 242, label: 'đã đo đầy đủ' },
      { n: 15, label: 'qua bài kiểm tra' },
    ],
    scroll: 'Cuộn xuống',
  },
  winRate: {
    title: 'Thắng nhiều chưa chắc đã ăn.',
    body: 'Cùng một cách vào lệnh, chốt lời sớm thì cứ 100 lệnh thắng khoảng 48, nhiều hơn mọi cách chốt khác. Nhưng thắng thì lời ít, thua thì lỗ đủ. Cộng cả chuỗi lại, nó gần như tệ nhất.',
    wins: 'Nhiều lệnh thắng nhỏ',
    losses: 'Vài lệnh thua to',
  },
  popular: {
    title: 'Những cách được dạy nhiều nhất cũng không qua.',
    body: 'Bốn trường phái nóng nhất mạng xã hội: 42 chiến lược, máy làm đúng luật qua 22.938 lệnh. Không cái nào qua bài kiểm tra.',
    stamp: 'KHÔNG QUA',
    cards: [
      { name: 'SMC · ICT', count: 18 },
      { name: 'Phá vỡ đầu phiên', count: 7 },
      { name: 'RSI', count: 12 },
      { name: 'MACD', count: 5 },
    ],
    unit: 'chiến lược · 0 qua',
  },
  calendar: {
    title: 'Còn cách qua được lại là cách đơn giản nhất.',
    body: 'Mua ở 2 ngày giao dịch cuối tháng, bán ra ở ngày giao dịch thứ 3 của tháng mới. Không chỉ báo nào, chỉ nhìn lịch. Qua bài kiểm tra, và chấm lại trên giá vàng mới vẫn qua.',
    buy: 'Mua',
    sell: 'Bán',
  },
  cta: {
    title: 'Cách bạn đang đánh nằm ở nhóm nào?',
    body: 'Đem nó đi đo trước khi tin.',
    primary: { tab: 'sauo', label: 'Tự kiểm tra 6 ô · miễn phí' },
    secondary: { tab: 'viplibrary', label: 'Xem thư viện 300' },
  },
};

