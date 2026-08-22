# IND033 · Donchian 55 breakout (Turtle dài) — giải phẫu vì sao rớt

> **Dành cho thành viên VIP.** Báo cáo công khai chỉ nói nó CHÁT. Bài này mổ xẻ VÌ SAO — đọc vài phút này có thể là khoản "lãi" lớn nhất bạn nhận được từ chiến lược này: **số tiền bạn không mất.**

## Tóm tắt 30 giây

- Chạy máy móc suốt 22 năm (130 lệnh, đã trừ phí): cộng dồn +21R — hai thập kỷ đánh đổi thời gian, rủi ro và công sức để về gần con số không.
- Tỷ lệ thắng thật: **~30%**; chuỗi thua dài nhất **9 lệnh liên tiếp** (2017).
- Cú sụt vốn sâu nhất: -16R, kéo dài 77 tháng.

## Nó hứa gì — và máy đo được gì

Quy tắc được kiểm: Bản 55 nến cho tín hiệu lớn. Nguồn gốc: Turtle Traders. Cài đặt: `{"n": 55, "sl_atr": 2.0, "tp_r": 3.0}`. Máy chạy đúng quy tắc này trên 22 năm, khớp lệnh bi quan (nến chạm cả hai phía tính là thua), trừ phí từng lệnh — và máy không quên những cú vào xấu:

| Giai đoạn | Số lệnh | Lãi TB/lệnh | Tỷ lệ thắng | Năm lãi |
|---|---|---|---|---|
| Ôn bài 2004–2018 | 86 | +0.023 R | 26.7% | 8/15 |
| **Kỳ thi thật 2019–2023** | 30 | **-0.085 R** | 23.3% | 2/5 |
| **Kỳ thi lần 2 02/2024–07/2026** | 11 | **+1.363 R** | 63.6% | 3/3 |


## Vì sao nó rớt

**Nó không thắng nổi người vào lệnh ngẫu nhiên.** Giai đoạn ôn bài nó đạt +0.023 R/lệnh, còn "người vào đại" trên thị trường trộn ngẫu nhiên đạt +0.054 — phần chênh không đủ gọi là kỹ năng.

**Nó gãy ngay khi gặp kỳ thi thật 2019–2023 — giai đoạn nó chưa từng được 'học'.** Điểm ôn bài +0.023 → điểm kỳ thi thật -0.085 R/lệnh. Học tủ thì điểm cao, gặp đề lạ thì lộ ngay.

**Nó quá ít lệnh để tin cậy** — kết luận nghiêng về "không đủ bằng chứng" hơn là "chắc chắn tệ", nhưng tiền thật không nên đặt lên thứ chưa đủ bằng chứng.

Kiểu chết phổ biến nhất của nhóm indicator: tín hiệu càng nhạy càng nhiều nhiễu, và mỗi cú nhiễu trên khung nhỏ đều bị trừ phí. Cùng một indicator, thư viện này chỉ thấy phiên bản khung H4 + xác nhận nền là còn cửa sống.

## Cái giá của "cứ thử xem sao"

**Chuỗi thua dài nhất: 9 lệnh liên tiếp** (rơi vào năm 2017). Rủi ro 1 triệu mỗi lệnh nghĩa là có giai đoạn mất 9 triệu liền mạch không một lệnh gỡ — hãy tự hỏi thật lòng bạn còn bấm nút nổi ở lệnh thứ 6 không, vì người bỏ cuộc thường bỏ đúng trước khi chuỗi kết thúc.

**Sụt vốn sâu nhất: -16R**, kéo dài 77 tháng (từ 2011-07 tới đáy 2017-12, hồi phục hẳn 2025-03). Ai dùng nó phải biết trước con số này để định cỡ vốn và chuẩn bị tâm lý — không phải để bất ngờ giữa chừng.

Năm tốt nhất: 2025 (+1.65 R/lệnh). Năm tệ nhất: 2023 (-0.45 R/lệnh). Chiến lược nào cũng có mùa — biết trước mùa xấu trông ra sao là một nửa việc sống sót.

Kỳ thi lần 2 (02/2024→07/2026): có lãi +1.363 R/lệnh qua 11 lệnh — nhưng **không đổi kết luận CHÁT**. Vàng 2024–2025 tăng mạnh hiếm thấy, giai đoạn đó gần như nghiêng về phía mua là dễ có lãi; hai năm thuận gió không cứu được năm năm rớt kỳ thi thật.

## Nếu bạn vẫn thích ý tưởng này

Nói công bằng: chúng tôi chấm phiên bản QUY TẮC MÁY MÓC của chiến lược — một trader tuỳ nghi giỏi có thể lọc bằng kinh nghiệm thứ máy không lọc được, và điều đó không ai đo được. Nhưng hãy trung thực với chính mình: nếu cần "kinh nghiệm đặc biệt" để cứu một quy tắc thua, thứ kiếm tiền là kinh nghiệm của bạn — không phải chiến lược. Thư viện này có 15 chiến lược ĐÃ ĐẬU cả hai kỳ thi, tất cả cùng một họ: đi theo quán tính trung hạn khung H4. Tiền của bạn xứng đáng bắt đầu từ danh sách đó.

---

*STRATEGY AUDIT · ZALO: 05.6666.5511 — Báo cáo kiểm định độc lập, không phải lời khuyên đầu tư. Kết quả quá khứ không bảo đảm tương lai. R = số tiền bạn dám thua ở mỗi lệnh.*
