# VIR035 · Supply & Demand zone fresh — bài phân tích chuyên sâu

> **Dành cho thành viên VIP.** Báo cáo kiểm định công khai cho bạn biết chiến lược này có điểm sáng nhưng KHÔNG tròn trịa. Bài này cho bạn biết thứ quan trọng hơn: sống chung với nó thì như thế nào, và làm sao để không tự tay phá nó. Số liệu đo trên 22 năm dữ liệu vàng (2004–2026), đã trừ phí giao dịch.

## Tóm tắt 30 giây

Chiến lược này KHÔNG đậu trọn vẹn — nó chỉ tốt trong một số điều kiện nhất định. Đọc kỹ mục "Vì sao chỉ là TÌNH HUỐNG" trước khi nghĩ đến chuyện dùng. Ba con số phải thuộc trước khi đọc tiếp:

- Tỷ lệ thắng thật ở kỳ thi: **~28%** — thua là chuyện diễn ra đều đặn, không phải tai nạn.
- Kỷ lục **20 lệnh thua liên tiếp** (năm 2008).
- Cú sụt vốn sâu nhất 22 năm: **-23R**, mất 120 tháng mới thấy đáy.

## Chiến lược này kiếm tiền bằng logic gì?

Vùng cầu 'còn tươi' (chưa test) — đặt limit mua tại mép vùng. Nguồn gốc: Sam Seiden phổ thông hoá. Cài đặt đem kiểm định: `{"confirm": false, "sl_atr": 2.0, "tp_r": 3.0}`.

Hiếm hoi của nhóm viral: bản này sống được vì phần cốt lõi của nó trùng với thứ vàng thật sự trả tiền — đi theo cấu trúc sóng trung hạn, không phải phần trang trí thuật ngữ.

## Nhịp sống — bạn sẽ trải nghiệm gì

- **Khoảng 16 lệnh mỗi năm** trên khung H4; bình thường các lệnh cách nhau ~19 ngày, nhưng có lúc 129 ngày liền không có lệnh nào — tháng im lặng là bình thường, không phải chiến lược hỏng.
- Lệnh thắng điển hình giữ ~7 ngày, lệnh thua bị đá ra sau ~44 giờ. Giữ lệnh qua đêm/cuối tuần là chuyện thường — không hợp với người không ngủ được khi đang ôm lệnh.
- Cách nó ra khỏi lệnh: 72% số lệnh chạm dừng lỗ, 27% chạm chốt lời gấp 3 lần rủi ro. Thua nhiều lệnh là THIẾT KẾ của nó, không phải tai nạn — toán học nằm ở chỗ lệnh thắng ăn gấp 3.

## Cái giá phải trả

**Chuỗi thua dài nhất: 20 lệnh liên tiếp** (rơi vào năm 2008). Rủi ro 1 triệu mỗi lệnh nghĩa là có giai đoạn mất 20 triệu liền mạch không một lệnh gỡ — hãy tự hỏi thật lòng bạn còn bấm nút nổi ở lệnh thứ 17 không, vì người bỏ cuộc thường bỏ đúng trước khi chuỗi kết thúc.

**Sụt vốn sâu nhất: -23R**, kéo dài 120 tháng (từ 2012-09 tới đáy 2022-09, hồi phục hẳn 2025-05). Ai dùng nó phải biết trước con số này để định cỡ vốn và chuẩn bị tâm lý — không phải để bất ngờ giữa chừng.

Năm tốt nhất: 2023 (+1.07 R/lệnh). Năm tệ nhất: 2008 (-0.62 R/lệnh). Chiến lược nào cũng có mùa — biết trước mùa xấu trông ra sao là một nửa việc sống sót.

## Điểm thi chính thức

| Giai đoạn | Số lệnh | Lãi TB/lệnh | Tỷ lệ thắng | Năm lãi |
|---|---|---|---|---|
| Ôn bài 2004–2018 | 246 | +0.031 R | 27.2% | 9/15 |
| **Kỳ thi thật 2019–2023** | 60 | **+0.059 R** | 28.3% | 3/5 |
| **Kỳ thi lần 2 02/2024–07/2026** | 38 | **+0.126 R** | 28.9% | 3/3 |


So với vào lệnh ngẫu nhiên trên 16 thị trường trộn: hơn +0.043 R/lệnh. Kỳ vọng thực tế nên giữ quanh mức điểm kỳ thi thật (+0.06 R/lệnh — rủi ro 1 triệu/lệnh thì trung bình lãi 59 nghìn/lệnh, tính trên hàng chục lệnh chứ không phải từng lệnh).

Kỳ thi lần 2 (02/2024→07/2026, dữ liệu hoàn toàn mới): **vẫn giữ vững** — lãi trung bình +0.126 R/lệnh qua 38 lệnh. Đừng lấy giai đoạn đẹp này làm kỳ vọng dài hạn: con số nên khắc vào đầu vẫn là điểm kỳ thi thật.

## Vì sao chỉ là TÌNH HUỐNG, không phải CHẤT

Nó rớt 2 vòng kiểm tra: không thắng nổi người vào lệnh ngẫu nhiên; đổi tham số một chút là hết lãi — kết quả đẹp chỉ nhờ đúng một con số may mắn.

Nghĩa là: chiến lược này có thể có chỗ đứng trong một bối cảnh cụ thể, nhưng dùng máy móc mọi lúc mọi nơi sẽ trả giá. Nếu bạn không tự tin xác định được đúng bối cảnh đó — hãy bắt đầu từ nhóm CHẤT.

## Hướng dẫn áp dụng — và các bẫy

**Cỡ lệnh trước, mộng mơ sau.** Lấy chuỗi thua kỷ lục (20) nhân đôi cho an toàn (~40R) rồi hỏi: mất bao nhiêu % tài khoản thì vẫn ngủ được? Chia ngược lại ra % rủi ro mỗi lệnh. Đó là toán, không phải ý kiến.

**Bẫy 1 — bỏ cuộc giữa mùa khô.** Giai đoạn xấu nhất trong lịch sử của nó (xem trên) sẽ quay lại dưới hình dạng nào đó; người thua trong chiến lược thắng là người dừng đánh sau chuỗi thua rồi quay lại đúng lúc hết sóng.

**Bẫy 2 — tự "cải tiến" thông số** cho tỷ lệ thắng đẹp hơn. Kết cấu thắng-thua của nó là một khối toán học cân bằng; kéo chốt lời gần lại hay nới dừng lỗ ra là rút đúng viên gạch đang đỡ cả khối.

**Bẫy 3 — quên rằng đây là kết quả máy chạy.** Backtest quy tắc cứng, khớp lệnh bi quan, đã trừ phí — nhưng vẫn là quá khứ. Triển khai thật: bắt đầu cỡ lệnh nhỏ, ghi nhật ký so số thật với số ở bài này, chỉ tăng dần khi hai bên khớp nhau.

---

*STRATEGY AUDIT · ZALO: 05.6666.5511 — Báo cáo kiểm định độc lập, không phải lời khuyên đầu tư. Kết quả quá khứ không bảo đảm tương lai. R = số tiền bạn dám thua ở mỗi lệnh.*
