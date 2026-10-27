# VIR038 · Fib extension 1.272 chốt — vào 0.786 — giải phẫu vì sao rớt

> **Dành cho thành viên VIP.** Báo cáo công khai chỉ nói nó CHÁT. Bài này mổ xẻ VÌ SAO — đọc vài phút này có thể là khoản "lãi" lớn nhất bạn nhận được từ chiến lược này: **số tiền bạn không mất.**

## Tóm tắt 30 giây

- Chạy máy móc suốt 22 năm (2118 lệnh, đã trừ phí): **cộng dồn -112R**. Rủi ro 1 triệu mỗi lệnh thì kết quả của hơn hai thập kỷ kiên trì là mất ~112 triệu.
- Tỷ lệ thắng thật: **~26%**; chuỗi thua dài nhất **22 lệnh liên tiếp** (2014).
- Đường vốn tạo đỉnh từ 2008-04 và **tới nay chưa quay lại** — ai theo nó từ đó vẫn đang chờ hòa vốn.

## Nó hứa gì — và máy đo được gì

Quy tắc được kiểm: Hồi sâu 0.786 vào ngược sóng hồi. Nguồn gốc: Fib sâu. Cài đặt: `{"dummy": 1, "sl_atr": 2.0, "tp_r": 3.0}`. Máy chạy đúng quy tắc này trên 22 năm, khớp lệnh bi quan (nến chạm cả hai phía tính là thua), trừ phí từng lệnh — và máy không quên những cú vào xấu:

| Giai đoạn | Số lệnh | Lãi TB/lệnh | Tỷ lệ thắng | Năm lãi |
|---|---|---|---|---|
| Ôn bài 2004–2018 | 1377 | -0.035 R | 26.4% | 6/15 |
| **Kỳ thi thật 2019–2023** | 480 | **-0.063 R** | 26.0% | 2/5 |
| **Kỳ thi lần 2 02/2024–07/2026** | 239 | **-0.081 R** | 25.5% | 0/3 |


## Vì sao nó rớt

**Nó không thắng nổi người vào lệnh ngẫu nhiên.** Giai đoạn ôn bài nó đạt -0.035 R/lệnh, còn "người vào đại" trên thị trường trộn ngẫu nhiên đạt -0.067 — phần chênh không đủ gọi là kỹ năng.

**Kết quả không bền khi đổi tham số một chút (±30%)** — dấu hiệu điển hình của việc con số đẹp chỉ nhờ chọn trúng cài đặt may mắn, không phải nhờ bản chất thị trường.

**Nó chưa từng thật sự chạy — kể cả ở sân nhà.** Ngay giai đoạn ôn bài 2004–2018, nơi mọi chiến lược được phép "học tủ", nó chỉ đạt -0.035 R/lệnh; sang kỳ thi thật còn -0.063. Không phải "thị trường thay đổi nên nó hết chạy" — nó chưa từng chạy.

Đây là kiểu chết chung của cả 13 chiến lược Smart Money/ICT trong thư viện: các khái niệm nghe rất tinh vi (quét thanh khoản, order block, FVG) là câu chuyện kể SAU khi giá chạy — dịch thành quy tắc máy móc chạy TRƯỚC khi giá chạy thì không cái nào đậu.

## Cái giá của "cứ thử xem sao"

**Chuỗi thua dài nhất: 22 lệnh liên tiếp** (rơi vào năm 2014). Rủi ro 1 triệu mỗi lệnh nghĩa là có giai đoạn mất 22 triệu liền mạch không một lệnh gỡ — hãy tự hỏi thật lòng bạn còn bấm nút nổi ở lệnh thứ 19 không, vì người bỏ cuộc thường bỏ đúng trước khi chuỗi kết thúc.

**Sụt vốn sâu nhất: -132R**, bắt đầu từ 2008-04 và **tới nay vẫn chưa quay lại đỉnh cũ**.

Năm tốt nhất: 2015 (+0.34 R/lệnh). Năm tệ nhất: 2004 (-0.32 R/lệnh). Chiến lược nào cũng có mùa — biết trước mùa xấu trông ra sao là một nửa việc sống sót.

Kỳ thi lần 2 (02/2024→07/2026): tiếp tục lỗ -0.081 R/lệnh qua 239 lệnh — đúng như kết luận CHÁT.

## Nếu bạn vẫn thích ý tưởng này

Nói công bằng: chúng tôi chấm phiên bản QUY TẮC MÁY MÓC của chiến lược — một trader tuỳ nghi giỏi có thể lọc bằng kinh nghiệm thứ máy không lọc được, và điều đó không ai đo được. Nhưng hãy trung thực với chính mình: nếu cần "kinh nghiệm đặc biệt" để cứu một quy tắc thua, thứ kiếm tiền là kinh nghiệm của bạn — không phải chiến lược. Thư viện này có 15 chiến lược ĐÃ ĐẬU cả hai kỳ thi, tất cả cùng một họ: đi theo quán tính trung hạn khung H4. Tiền của bạn xứng đáng bắt đầu từ danh sách đó.

---

*STRATEGY AUDIT · ZALO: 05.6666.5511 — Báo cáo kiểm định độc lập, không phải lời khuyên đầu tư. Kết quả quá khứ không bảo đảm tương lai. R = số tiền bạn dám thua ở mỗi lệnh.*
