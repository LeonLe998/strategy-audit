# REV022 · Z-score giá 20 nến — giải phẫu vì sao rớt

> **Dành cho thành viên VIP.** Báo cáo công khai chỉ nói nó CHÁT. Bài này mổ xẻ VÌ SAO — đọc vài phút này có thể là khoản "lãi" lớn nhất bạn nhận được từ chiến lược này: **số tiền bạn không mất.**

## Tóm tắt 30 giây

- Chạy máy móc suốt 22 năm (786 lệnh, đã trừ phí): cộng dồn -1R — hai thập kỷ đánh đổi thời gian, rủi ro và công sức để về gần con số không.
- Tỷ lệ thắng thật: **~26%**; chuỗi thua dài nhất **26 lệnh liên tiếp** (2008).
- Cú sụt vốn sâu nhất: -41R, kéo dài 46 tháng.

## Nó hứa gì — và máy đo được gì

Quy tắc được kiểm: Z-score close so 20 nến ≥2 — vào ngược về trung bình. Nguồn gốc: Thống kê. Cài đặt: `{"n": 20, "k": 2.0, "sl_atr": 2.0, "tp_r": 3.0}`. Máy chạy đúng quy tắc này trên 22 năm, khớp lệnh bi quan (nến chạm cả hai phía tính là thua), trừ phí từng lệnh — và máy không quên những cú vào xấu:

| Giai đoạn | Số lệnh | Lãi TB/lệnh | Tỷ lệ thắng | Năm lãi |
|---|---|---|---|---|
| Ôn bài 2004–2018 | 522 | +0.053 R | 27.6% | 8/15 |
| **Kỳ thi thật 2019–2023** | 175 | **-0.124 R** | 23.4% | 2/5 |
| **Kỳ thi lần 2 02/2024–07/2026** | 87 | **-0.065 R** | 25.3% | 1/3 |


## Vì sao nó rớt

**Nó không thắng nổi người vào lệnh ngẫu nhiên.** Giai đoạn ôn bài nó đạt +0.053 R/lệnh, còn "người vào đại" trên thị trường trộn ngẫu nhiên đạt +0.005 — phần chênh không đủ gọi là kỹ năng.

**Kết quả không bền khi đổi tham số một chút (±30%)** — dấu hiệu điển hình của việc con số đẹp chỉ nhờ chọn trúng cài đặt may mắn, không phải nhờ bản chất thị trường.

**Nó gãy ngay khi gặp kỳ thi thật 2019–2023 — giai đoạn nó chưa từng được 'học'.** Điểm ôn bài +0.053 → điểm kỳ thi thật -0.124 R/lệnh. Học tủ thì điểm cao, gặp đề lạ thì lộ ngay.

Đây là kiểu chết kinh điển nhất trên vàng: bắt đỉnh bắt đáy là đánh ngược quán tính, mà 22 năm dữ liệu cho thấy vàng là thị trường trừng phạt người chống sóng nặng nhất. 'Quá mua' trên vàng có thể quá mua thêm nhiều tuần nữa.

## Cái giá của "cứ thử xem sao"

**Chuỗi thua dài nhất: 26 lệnh liên tiếp** (rơi vào năm 2008). Rủi ro 1 triệu mỗi lệnh nghĩa là có giai đoạn mất 26 triệu liền mạch không một lệnh gỡ — hãy tự hỏi thật lòng bạn còn bấm nút nổi ở lệnh thứ 23 không, vì người bỏ cuộc thường bỏ đúng trước khi chuỗi kết thúc.

**Sụt vốn sâu nhất: -41R**, kéo dài 46 tháng (từ 2005-08 tới đáy 2009-06, hồi phục hẳn 2018-02). Ai dùng nó phải biết trước con số này để định cỡ vốn và chuẩn bị tâm lý — không phải để bất ngờ giữa chừng.

Năm tốt nhất: 2018 (+0.52 R/lệnh). Năm tệ nhất: 2007 (-0.58 R/lệnh). Chiến lược nào cũng có mùa — biết trước mùa xấu trông ra sao là một nửa việc sống sót.

Kỳ thi lần 2 (02/2024→07/2026): tiếp tục lỗ -0.065 R/lệnh qua 87 lệnh — đúng như kết luận CHÁT.

## Nếu bạn vẫn thích ý tưởng này

Nói công bằng: chúng tôi chấm phiên bản QUY TẮC MÁY MÓC của chiến lược — một trader tuỳ nghi giỏi có thể lọc bằng kinh nghiệm thứ máy không lọc được, và điều đó không ai đo được. Nhưng hãy trung thực với chính mình: nếu cần "kinh nghiệm đặc biệt" để cứu một quy tắc thua, thứ kiếm tiền là kinh nghiệm của bạn — không phải chiến lược. Thư viện này có 15 chiến lược ĐÃ ĐẬU cả hai kỳ thi, tất cả cùng một họ: đi theo quán tính trung hạn khung H4. Tiền của bạn xứng đáng bắt đầu từ danh sách đó.

---

*STRATEGY AUDIT · ZALO: 05.6666.5511 — Báo cáo kiểm định độc lập, không phải lời khuyên đầu tư. Kết quả quá khứ không bảo đảm tương lai. R = số tiền bạn dám thua ở mỗi lệnh.*
