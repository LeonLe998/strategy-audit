/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { SAUO_GAS_ENDPOINT } from '../config';
import './SauO.css';

interface QuestionDef {
  n: number;
  ten: string;
  mau: 'violet' | 'mint';
  loai?: 'chon';
  hoi: string;
  goi: string;
  chon?: string[];
  mo?: number;
  vd?: string;
}

const O: QuestionDef[] = [
  {
    n: 1,
    ten: "LỐI ĐÁNH",
    mau: "violet",
    loai: "chon",
    hoi: "Bạn thường vào lệnh trong tình huống nào?",
    goi: "Chọn cái gần nhất với những gì bạn hay làm. Không có đáp án đúng — mỗi lối đánh cần một cách vào và cách thoát khác nhau, nên biết mình thuộc lối nào là bước đầu tiên.",
    chon: [
      "Giá chạy quá đà rồi có dấu hiệu quay lại",
      "Giá phá qua một mức quan trọng",
      "Giá đang chạy một chiều rõ ràng, tôi đi theo",
      "Xuất hiện một mẫu nến tôi nhận ra",
      "Giá chạm một vùng tôi đã đánh dấu sẵn",
      "Tôi cũng chưa rõ — tuỳ lúc"
    ],
    mo: 5
  },
  {
    n: 2,
    ten: "CHỖ VÀO",
    mau: "violet",
    hoi: "Bạn nhìn thấy gì thì bấm vào lệnh?",
    goi: "Tả lại đúng thứ bạn nhìn trên màn hình trước khi bấm. Nếu người lạ đọc xong bấm được y hệt bạn thì ô này đủ. “Thấy đẹp thì vào” chưa đủ.",
    vd: "Khi giá vượt lên khỏi mức cao nhất của bốn tiếng đầu tuần."
  },
  {
    n: 3,
    ten: "CHỖ THOÁT",
    mau: "violet",
    hoi: "Bạn đóng lệnh khi nào — lúc lỗ, và lúc lời?",
    goi: "Hai vế. Nếu bạn quyết định lúc đang trong lệnh chứ không quyết trước, cứ ghi thẳng như vậy — đó cũng là một câu trả lời thật.",
    vd: "Lỗ thì cắt khi âm 20 giá. Lời thì chốt khi được 60 giá."
  },
  {
    n: 4,
    ten: "NHỊP",
    mau: "mint",
    hoi: "Một lệnh của bạn thường mở bao lâu rồi đóng?",
    goi: "Cứ nhớ lại vài lệnh gần nhất là ra. Vài phút? Vài tiếng? Qua đêm? Cả tuần? Con số này quyết định bạn nên nhìn biểu đồ khung nào.",
    vd: "Thường vài tiếng, hết ngày là tôi đóng."
  },
  {
    n: 5,
    ten: "GIỜ",
    mau: "mint",
    hoi: "Bạn hay vào lệnh lúc nào trong ngày? Có lúc nào bạn tự cấm mình vào không?",
    goi: "Vế đầu ai cũng trả lời được. Vế sau mới là vế hiếm — và nó là thứ ngăn bạn vào lệnh chỉ vì đang buồn tay.",
    vd: "Hay vào buổi tối lúc thị trường Mỹ mở. Chưa có lúc nào tự cấm."
  },
  {
    n: 6,
    ten: "SỐ LỆNH",
    mau: "mint",
    hoi: "Một tuần bạn vào khoảng bao nhiêu lệnh?",
    goi: "Ước chừng thôi, không cần chính xác. Nếu con số này lớn hơn nhiều so với nhịp bạn ghi ở ô 4, có chỗ đang mâu thuẫn.",
    vd: "Khoảng năm bảy lệnh, hôm nào sốt ruột thì hơn."
  }
];

export default function SauO() {
  // man: 0 = Mở đầu, 1..6 = Câu 1..6, 7 = Kết quả & Form liên hệ, 8 = Xong
  const [man, setMan] = useState<number>(0);
  const [dap, setDap] = useState<string[]>(["", "", "", "", "", ""]);
  const [currentText, setCurrentText] = useState<string>("");

  // Form liên hệ
  const [ten, setTen] = useState<string>("");
  const [zalo, setZalo] = useState<string>("");
  const [quymo, setQuymo] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorField, setErrorField] = useState<'ten' | 'zalo' | null>(null);

  const tenInputRef = useRef<HTMLInputElement>(null);
  const zaloInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Cập nhật title và meta tags khi trang mount
  useEffect(() => {
    const originalTitle = document.title;
    document.title = "Sáu ô — hệ thống giao dịch của bạn đang trống chỗ nào?";

    const updateMeta = (nameOrProperty: string, isProp: boolean, content: string) => {
      const selector = isProp ? `meta[property="${nameOrProperty}"]` : `meta[name="${nameOrProperty}"]`;
      let meta = document.querySelector(selector) as HTMLMetaElement | null;
      if (!meta) {
        meta = document.createElement('meta');
        if (isProp) meta.setAttribute('property', nameOrProperty);
        else meta.setAttribute('name', nameOrProperty);
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    updateMeta("description", false, "Sáu câu hỏi, ba phút, không cần biết thuật ngữ nào. Xem hệ thống giao dịch của bạn đang trống ô nào — dựa trên 242 chiến lược đã kiểm định trên 22 năm dữ liệu vàng.");
    updateMeta("og:title", true, "Bạn điền được mấy trên sáu ô?");
    updateMeta("og:description", true, "Sáu câu hỏi để biết bạn đang có một phương pháp — hay đã có một hệ thống.");
    updateMeta("og:type", true, "website");

    return () => {
      document.title = originalTitle;
    };
  }, []);

  // Cuộn lên đầu trang khi chuyển màn hình
  const chuyenMan = (b: number) => {
    setMan(b);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  // Đồng bộ textarea khi chuyển sang câu hỏi 2..6
  useEffect(() => {
    if (man >= 2 && man <= 6) {
      const existing = dap[man - 1];
      setCurrentText(existing === "chưa có" ? "" : existing);
    }
  }, [man, dap]);

  // Kiểm tra điều kiện một ô tính là đã điền
  const daDien = (i: number, arr: string[] = dap): boolean => {
    const s = (arr[i] || "").trim();
    const t = s.toLowerCase();
    if (i === 0) {
      const moVal = O[0].chon && O[0].mo !== undefined ? O[0].chon[O[0].mo] : "";
      return s !== "" && s !== moVal;
    }
    return s.length >= 8 && !["chưa có", "chua co", "không", "khong", "chưa", "chua"].includes(t);
  };

  // Xử lý khi chọn ở Ô 1
  const chonO1 = (val: string) => {
    const nextDap = [...dap];
    nextDap[0] = val;
    setDap(nextDap);
    setTimeout(() => {
      chuyenMan(2);
    }, 220);
  };

  // Lưu nội dung từ textarea vào dap
  const luuText = (targetMan: number, textVal: string) => {
    const nextDap = [...dap];
    nextDap[targetMan - 1] = textVal.trim();
    setDap(nextDap);
    return nextDap;
  };

  // Bấm nút "Chưa có" ở các ô 2..6
  const handleChuaCo = () => {
    const nextDap = [...dap];
    nextDap[man - 1] = "chưa có";
    setDap(nextDap);
    chuyenMan(man + 1);
  };

  // Bấm nút "Tiếp" / "Xem kết quả"
  const handleTiep = () => {
    luuText(man, currentText);
    chuyenMan(man + 1);
  };

  // Bấm nút quay lại ‹
  const handleQuayLai = () => {
    luuText(man, currentText);
    chuyenMan(man - 1);
  };

  // Lấy nguồn từ query string (vd: /sauo?bio -> "bio", mặc định: "truc-tiep")
  const layNguon = (): string => {
    const search = window.location.search;
    if (!search || search === "?") return "truc-tiep";
    return search.replace(/^\?/, "") || "truc-tiep";
  };

  // Tính điểm tổng kết
  const diem = O.map((_, i) => daDien(i)).filter(Boolean).length;

  const dai = diem <= 2
    ? {
        c: "red",
        t: "Bạn đang giao dịch bằng cảm giác.",
        s: "Không phải lời chê — gần như ai cũng bắt đầu ở đây. Nhưng khi thua, bạn sẽ không biết mình sai ở đâu, nên lần sau vẫn sai y hệt."
      }
    : diem <= 4
    ? {
        c: "amber",
        t: "Bạn có một phương pháp, chưa có một hệ thống.",
        s: "Thường là đủ ba ô về giá, trống ba ô về thời gian. Đây là chỗ đông người nhất — và cũng là chỗ dễ sửa nhất."
      }
    : {
        c: "mint",
        t: "Bạn có một hệ thống. Và nó đo được.",
        s: "Viết ra được nghĩa là đem đi kiểm chứng được — trên dữ liệu thật, nhiều năm, để biết nó từng ăn hay chưa."
      };

  const trongTG = [3, 4, 5].filter(i => !daDien(i)).length;

  // Xử lý gửi form liên hệ
  const handleGui = () => {
    const tenTrim = ten.trim();
    const zaloTrim = zalo.trim();

    if (tenTrim.length < 2) {
      setErrorField('ten');
      if (tenInputRef.current) tenInputRef.current.focus();
      return;
    }

    if (zaloTrim.length < 8) {
      setErrorField('zalo');
      if (zaloInputRef.current) zaloInputRef.current.focus();
      return;
    }

    setErrorField(null);
    setIsSubmitting(true);

    const payload = {
      source: 'sauo',
      thoi_gian: new Date().toISOString(),
      ten: tenTrim,
      zalo: zaloTrim,
      quy_mo: quymo,
      so_o_dien: diem,
      o1_loi_danh: dap[0],
      o2_cho_vao: dap[1],
      o3_cho_thoat: dap[2],
      o4_nhip: dap[3],
      o5_gio: dap[4],
      o6_so_lenh: dap[5],
      nguon: layNguon()
    };

    fetch(SAUO_GAS_ENDPOINT, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    }).finally(() => {
      chuyenMan(8);
    });
  };

  const currentQ = (man >= 1 && man <= 6) ? O[man - 1] : null;

  return (
    <div id="sauo-root">
      <div className="sauo-wrap">
        {/* Brand header */}
        <div className="sauo-brand">
          <div className="sauo-seal">SA</div>
          <b>STRATEGY AUDIT</b>
        </div>

        {/* Thanh tiến độ */}
        <div className="sauo-bar">
          <i
            className="sauo-bar-fill"
            style={{ width: `${Math.min((man / 7) * 100, 100)}%` }}
          />
        </div>

        {/* ═════════ MÀN MỞ (0) ═════════ */}
        {man === 0 && (
          <section className="sauo-screen on" id="s0">
            <h1>Sáu ô — <em>bạn điền được mấy ô?</em></h1>
            <p>
              Không phải bài kiểm tra, và không có câu nào đúng sai. Sáu câu hỏi về{" "}
              <b>những gì bạn vẫn đang làm</b> — để nhìn ra hệ thống của bạn đang trống chỗ nào.
            </p>
            <p>Khoảng 3 phút. <b>Không cần biết một thuật ngữ nào.</b></p>
            <p className="small">
              Chưa có câu trả lời cho ô nào thì bấm “chưa có”. Ô trống cũng là một{" "}
              câu trả lời — và thường là câu quan trọng nhất.
            </p>
            <div className="row">
              <button className="go" onClick={() => chuyenMan(1)}>
                Bắt đầu
              </button>
            </div>
          </section>
        )}

        {/* ═════════ CÂU HỎI 1..6 ═════════ */}
        {man >= 1 && man <= 6 && currentQ && (
          <section className="sauo-screen on" id="sq">
            <div className="qnum" style={{ color: `var(--${currentQ.mau})` }}>
              Ô {currentQ.n} / 6 <span className="qten">{currentQ.ten}</span>
            </div>
            <div className="qhoi" style={{ color: `var(--${currentQ.mau})` }}>
              {currentQ.hoi}
            </div>
            <div className="qgoi">{currentQ.goi}</div>

            {currentQ.loai === "chon" ? (
              <div>
                {currentQ.chon?.map((t, i) => {
                  const isSel = dap[man - 1] === t;
                  const isMo = i === currentQ.mo;
                  return (
                    <button
                      key={i}
                      className={`opt${isSel ? ' sel' : ''}${isMo ? ' mo' : ''}`}
                      onClick={() => chonO1(t)}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div>
                <div className="vd">
                  <span>VÍ DỤ MỘT CÂU TRẢ LỜI ĐẠT</span>
                  <i>“{currentQ.vd}”</i>
                </div>
                <textarea
                  id="ta"
                  ref={textareaRef}
                  value={currentText}
                  onChange={(e) => setCurrentText(e.target.value)}
                  placeholder="Viết bằng lời của bạn, một câu là đủ…"
                />
              </div>
            )}

            <div className="row">
              {man > 1 && (
                <button className="ghost" onClick={handleQuayLai}>
                  ‹
                </button>
              )}
              {currentQ.loai !== "chon" && (
                <button className="skip" onClick={handleChuaCo}>
                  Chưa có
                </button>
              )}
              {currentQ.loai !== "chon" && (
                <button className="go" onClick={handleTiep}>
                  {man === 6 ? "Xem kết quả" : "Tiếp"}
                </button>
              )}
            </div>
          </section>
        )}

        {/* ═════════ KẾT QUẢ & FORM LIÊN HỆ (7) ═════════ */}
        {man === 7 && (
          <section className="sauo-screen on" id="sr">
            <div
              className="score"
              id="scoreBox"
              style={{
                background: `var(--${dai.c}Dim)`,
                border: `1.5px solid var(--${dai.c}Line)`
              }}
            >
              <div className="n" id="scoreN" style={{ color: `var(--${dai.c})` }}>
                {diem}
              </div>
              <div className="t">trên sáu ô</div>
            </div>

            <div className="verdict" id="verdict" style={{ color: `var(--${dai.c})` }}>
              {dai.t}
            </div>
            <p id="verdictSub">{dai.s}</p>

            <div className="oList" id="oList">
              {O.map((d, i) => {
                const ok = daDien(i);
                return (
                  <div key={d.n} className="oRow">
                    <b>{d.n}</b>
                    <span className={`tick ${ok ? 'ok' : 'no'}`}>
                      {ok ? '✓' : '—'}
                    </span>
                    <span style={ok ? {} : { color: 'var(--dim)' }}>
                      {d.ten}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="note" id="noteBox">
              {trongTG >= 2 ? (
                <>
                  <b>Bạn trống {trongTG} trên 3 ô về thời gian.</b> Chuyện này lặp lại ở gần như tất cả
                  mọi người — vì đó là phần không khoá học nào dạy. Trong 242 chiến lược tụi mình đã đo,
                  nhóm có yếu tố thời gian cho tỷ lệ đậu <b>gấp bốn lần</b> nhóm chỉ có yếu tố giá.
                </>
              ) : (
                <>
                  <b>Bạn viết được cả phần thời gian.</b> Hiếm — phần lớn người làm bài này trống cả ba ô đó.
                  Hệ thống của bạn đủ rõ để đem đi kiểm chứng trên dữ liệu thật.
                </>
              )}
            </div>

            <h2 style={{ font: '800 20px/1.3 sans-serif', margin: '18px 0 6px' }}>
              Gửi cho mình — mình đo giúp bạn
            </h2>
            <p className="small">
              Mình có sẵn kết quả kiểm định của <b>242 chiến lược</b> trên <b>22 năm</b>{" "}
              dữ liệu vàng. Rất nhiều khả năng thứ bạn đang dùng đã nằm sẵn trong đó, và mình nói cho
              bạn biết nó từng ăn hay chưa — kèm chỗ hệ thống của bạn đang trống.
              Miễn phí, không kèm điều kiện.
            </p>

            <label htmlFor="ten">Tên của bạn</label>
            <input
              id="ten"
              ref={tenInputRef}
              autoComplete="name"
              value={ten}
              onChange={(e) => {
                setTen(e.target.value);
                if (errorField === 'ten') setErrorField(null);
              }}
              style={errorField === 'ten' ? { borderColor: 'var(--red)' } : {}}
              placeholder="Ví dụ: Minh Quang"
            />

            <label htmlFor="zalo">Số Zalo để mình gửi kết quả về</label>
            <input
              id="zalo"
              ref={zaloInputRef}
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              value={zalo}
              onChange={(e) => {
                setZalo(e.target.value);
                if (errorField === 'zalo') setErrorField(null);
              }}
              style={errorField === 'zalo' ? { borderColor: 'var(--red)' } : {}}
              placeholder="09xxxxxxxx"
            />

            <label htmlFor="quymo">Quy mô tài khoản đang giao dịch</label>
            <select
              id="quymo"
              value={quymo}
              onChange={(e) => setQuymo(e.target.value)}
            >
              <option value="">— chọn một —</option>
              <option>Chưa giao dịch tiền thật</option>
              <option>Dưới 500 USD</option>
              <option>500 – 2.000 USD</option>
              <option>2.000 – 10.000 USD</option>
              <option>Trên 10.000 USD</option>
              <option>Không muốn nói</option>
            </select>

            <div className="row">
              <button className="ghost" onClick={() => chuyenMan(6)}>
                ‹
              </button>
              <button
                className="go"
                id="btnGui"
                disabled={isSubmitting}
                onClick={handleGui}
              >
                {isSubmitting ? "Đang gửi…" : "Gửi để nhận kiểm định"}
              </button>
            </div>
            <p className="small" style={{ marginTop: '12px' }}>
              Mình chỉ dùng số này để gửi kết quả cho bạn.
            </p>
          </section>
        )}

        {/* ═════════ MÀN XONG (8) ═════════ */}
        {man === 8 && (
          <section className="sauo-screen on" id="sd">
            <div className="done">
              <div style={{ font: '800 46px/1 sans-serif', color: 'var(--mint)' }}>
                ✓
              </div>
              <div className="big">Nhận được rồi</div>
              <p>Mình sẽ đọc và nhắn lại cho bạn qua Zalo. Thường trong vòng 48 tiếng.</p>
              <div className="note" style={{ textAlign: 'left' }}>
                <b>Trong lúc chờ:</b> chụp lại màn hình kết quả của bạn. Ô nào để trống chính là
                việc cần làm tiếp theo — và nó thường là ba ô về thời gian.
              </div>
              <p className="small">
                Chưa thấy mình nhắn lại? Nhắn thẳng Zalo <b>05.6666.5511</b> — Lê Vĩnh Phú.
              </p>
            </div>
          </section>
        )}
      </div>

      <footer className="sauo-footer">
        STRATEGY AUDIT · kiểm định chiến lược bằng dữ liệu, không bằng niềm tin<br />
        Zalo 05.6666.5511 · Chăm sóc 090.3188.663
      </footer>
    </div>
  );
}
