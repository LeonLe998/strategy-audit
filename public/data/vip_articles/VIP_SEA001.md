# SEA001 · Mua đầu tuần (Monday effect) — giải phẫu vì sao rớt

> **Dành cho thành viên VIP.** Báo cáo công khai chỉ nói nó CHÁT. Bài này mổ xẻ VÌ SAO — đọc vài phút này có thể là khoản "lãi" lớn nhất bạn nhận được từ chiến lược này: **số tiền bạn không mất.**

## Tóm tắt 30 giây

- Chạy máy móc suốt 22 năm (1042 lệnh, đã trừ phí): cộng dồn +20R — hai thập kỷ đánh đổi thời gian, rủi ro và công sức để về gần con số không.
- Tỷ lệ thắng thật: **~28%**; chuỗi thua dài nhất **19 lệnh liên tiếp** (2012).
- Cú sụt vốn sâu nhất: -72R, kéo dài 196 tháng.

## Nó hứa gì — và máy đo được gì

Quy tắc được kiểm: Mở lệnh mua đầu phiên Á thứ Hai, đóng cuối ngày. Nguồn gốc: Seasonality FX. Cài đặt: `{"dow": 0, "hour": 7, "dir": 1, "sl_atr": 2.0, "tp_r": 3.0}`. Máy chạy đúng quy tắc này trên 22 năm, khớp lệnh bi quan (nến chạm cả hai phía tính là thua), trừ phí từng lệnh — và máy không quên những cú vào xấu:

| Giai đoạn | Số lệnh | Lãi TB/lệnh | Tỷ lệ thắng | Năm lãi |
|---|---|---|---|---|
| Ôn bài 2004–2018 | 672 | -0.063 R | 25.7% | 9/15 |
| **Kỳ thi thật 2019–2023** | 239 | **-0.024 R** | 26.8% | 2/5 |
| **Kỳ thi lần 2 02/2024–07/2026** | 121 | **+0.531 R** | 39.7% | 2/3 |


## Vì sao nó rớt

**Nó không thắng nổi người vào lệnh ngẫu nhiên.** Giai đoạn ôn bài nó đạt -0.063 R/lệnh, còn "người vào đại" trên thị trường trộn ngẫu nhiên đạt -0.001 — phần chênh không đủ gọi là kỹ năng.

**Kết quả không bền khi đổi tham số một chút (±30%)** — dấu hiệu điển hình của việc con số đẹp chỉ nhờ chọn trúng cài đặt may mắn, không phải nhờ bản chất thị trường.

**Nó chưa từng thật sự chạy — kể cả ở sân nhà.** Ngay giai đoạn ôn bài 2004–2018, nơi mọi chiến lược được phép "học tủ", nó chỉ đạt -0.063 R/lệnh; sang kỳ thi thật còn -0.024. Không phải "thị trường thay đổi nên nó hết chạy" — nó chưa từng chạy.

Giờ giấc và mùa vụ trên vàng có thật một phần — nhưng phần thật đó quá mỏng: sau khi trừ phí giao dịch, cái 'lịch' còn lại không đủ nuôi một chiến lược đứng một mình.

## Cái giá của "cứ thử xem sao"

**Chuỗi thua dài nhất: 19 lệnh liên tiếp** (rơi vào năm 2012). Rủi ro 1 triệu mỗi lệnh nghĩa là có giai đoạn mất 19 triệu liền mạch không một lệnh gỡ — hãy tự hỏi thật lòng bạn còn bấm nút nổi ở lệnh thứ 16 không, vì người bỏ cuộc thường bỏ đúng trước khi chuỗi kết thúc.

**Sụt vốn sâu nhất: -72R**, kéo dài 196 tháng (từ 2007-04 tới đáy 2023-08, hồi phục hẳn 2025-09). Ai dùng nó phải biết trước con số này để định cỡ vốn và chuẩn bị tâm lý — không phải để bất ngờ giữa chừng.

Năm tốt nhất: 2025 (+0.95 R/lệnh). Năm tệ nhất: 2012 (-0.39 R/lệnh). Chiến lược nào cũng có mùa — biết trước mùa xấu trông ra sao là một nửa việc sống sót.

Kỳ thi lần 2 (02/2024→07/2026): có lãi +0.531 R/lệnh qua 121 lệnh — nhưng **không đổi kết luận CHÁT**. Vàng 2024–2025 tăng mạnh hiếm thấy, giai đoạn đó gần như nghiêng về phía mua là dễ có lãi; hai năm thuận gió không cứu được năm năm rớt kỳ thi thật.

## Nếu bạn vẫn thích ý tưởng này

Nói công bằng: chúng tôi chấm phiên bản QUY TẮC MÁY MÓC của chiến lược — một trader tuỳ nghi giỏi có thể lọc bằng kinh nghiệm thứ máy không lọc được, và điều đó không ai đo được. Nhưng hãy trung thực với chính mình: nếu cần "kinh nghiệm đặc biệt" để cứu một quy tắc thua, thứ kiếm tiền là kinh nghiệm của bạn — không phải chiến lược. Thư viện này có 15 chiến lược ĐÃ ĐẬU cả hai kỳ thi, tất cả cùng một họ: đi theo quán tính trung hạn khung H4. Tiền của bạn xứng đáng bắt đầu từ danh sách đó.

---

*STRATEGY AUDIT · ZALO: 05.6666.5511 — Báo cáo kiểm định độc lập, không phải lời khuyên đầu tư. Kết quả quá khứ không bảo đảm tương lai. R = số tiền bạn dám thua ở mỗi lệnh.*
