# IND059 · Elder Impulse đổi màu — giải phẫu vì sao rớt

> **Dành cho thành viên VIP.** Báo cáo công khai chỉ nói nó CHÁT. Bài này mổ xẻ VÌ SAO — đọc vài phút này có thể là khoản "lãi" lớn nhất bạn nhận được từ chiến lược này: **số tiền bạn không mất.**

## Tóm tắt 30 giây

- Chạy máy móc suốt 22 năm (988 lệnh, đã trừ phí): **cộng dồn -19R**. Rủi ro 1 triệu mỗi lệnh thì kết quả của hơn hai thập kỷ kiên trì là mất ~19 triệu.
- Tỷ lệ thắng thật: **~26%**; chuỗi thua dài nhất **19 lệnh liên tiếp** (2011).
- Đường vốn tạo đỉnh từ 2018-06 và **tới nay chưa quay lại** — ai theo nó từ đó vẫn đang chờ hòa vốn.

## Nó hứa gì — và máy đo được gì

Quy tắc được kiểm: EMA13 + MACD-H cùng chiều = màu mới, vào theo. Nguồn gốc: Alexander Elder. Cài đặt: `{"dummy": 1, "sl_atr": 2.0, "tp_r": 3.0}`. Máy chạy đúng quy tắc này trên 22 năm, khớp lệnh bi quan (nến chạm cả hai phía tính là thua), trừ phí từng lệnh — và máy không quên những cú vào xấu:

| Giai đoạn | Số lệnh | Lãi TB/lệnh | Tỷ lệ thắng | Năm lãi |
|---|---|---|---|---|
| Ôn bài 2004–2018 | 656 | +0.050 R | 27.4% | 7/15 |
| **Kỳ thi thật 2019–2023** | 212 | **-0.185 R** | 21.2% | 1/5 |
| **Kỳ thi lần 2 02/2024–07/2026** | 115 | **-0.046 R** | 25.2% | 1/3 |


## Vì sao nó rớt

**Nó không thắng nổi người vào lệnh ngẫu nhiên.** Giai đoạn ôn bài nó đạt +0.050 R/lệnh, còn "người vào đại" trên thị trường trộn ngẫu nhiên đạt -0.058 — phần chênh không đủ gọi là kỹ năng.

**Nó gãy ngay khi gặp kỳ thi thật 2019–2023 — giai đoạn nó chưa từng được 'học'.** Điểm ôn bài +0.050 → điểm kỳ thi thật -0.185 R/lệnh. Học tủ thì điểm cao, gặp đề lạ thì lộ ngay.

Kiểu chết phổ biến nhất của nhóm indicator: tín hiệu càng nhạy càng nhiều nhiễu, và mỗi cú nhiễu trên khung nhỏ đều bị trừ phí. Cùng một indicator, thư viện này chỉ thấy phiên bản khung H4 + xác nhận nền là còn cửa sống.

## Cái giá của "cứ thử xem sao"

**Chuỗi thua dài nhất: 19 lệnh liên tiếp** (rơi vào năm 2011). Rủi ro 1 triệu mỗi lệnh nghĩa là có giai đoạn mất 19 triệu liền mạch không một lệnh gỡ — hãy tự hỏi thật lòng bạn còn bấm nút nổi ở lệnh thứ 16 không, vì người bỏ cuộc thường bỏ đúng trước khi chuỗi kết thúc.

**Sụt vốn sâu nhất: -65R**, bắt đầu từ 2018-06 và **tới nay vẫn chưa quay lại đỉnh cũ**.

Năm tốt nhất: 2015 (+0.85 R/lệnh). Năm tệ nhất: 2024 (-0.39 R/lệnh). Chiến lược nào cũng có mùa — biết trước mùa xấu trông ra sao là một nửa việc sống sót.

Kỳ thi lần 2 (02/2024→07/2026): tiếp tục lỗ -0.046 R/lệnh qua 115 lệnh — đúng như kết luận CHÁT.

## Nếu bạn vẫn thích ý tưởng này

Nói công bằng: chúng tôi chấm phiên bản QUY TẮC MÁY MÓC của chiến lược — một trader tuỳ nghi giỏi có thể lọc bằng kinh nghiệm thứ máy không lọc được, và điều đó không ai đo được. Nhưng hãy trung thực với chính mình: nếu cần "kinh nghiệm đặc biệt" để cứu một quy tắc thua, thứ kiếm tiền là kinh nghiệm của bạn — không phải chiến lược. Thư viện này có 15 chiến lược ĐÃ ĐẬU cả hai kỳ thi, tất cả cùng một họ: đi theo quán tính trung hạn khung H4. Tiền của bạn xứng đáng bắt đầu từ danh sách đó.

---

*STRATEGY AUDIT · ZALO: 05.6666.5511 — Báo cáo kiểm định độc lập, không phải lời khuyên đầu tư. Kết quả quá khứ không bảo đảm tương lai. R = số tiền bạn dám thua ở mỗi lệnh.*
