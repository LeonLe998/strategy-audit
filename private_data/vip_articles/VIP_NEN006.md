# NEN006 · Inside bar thuận trend D1 — bài phân tích chuyên sâu

> **Dành cho thành viên VIP.** Báo cáo kiểm định công khai cho bạn biết chiến lược này ĐẬU. Bài này cho bạn biết thứ quan trọng hơn: sống chung với nó thì như thế nào, và làm sao để không tự tay phá nó. Số liệu đo trên 22 năm dữ liệu vàng (2004–2026), đã trừ phí giao dịch.

## Tóm tắt 30 giây

Chiến lược này vượt cả hai kỳ thi — nhưng như mọi chiến lược thật, nó thắng theo cách khó chịu hơn nhiều so với tưởng tượng. Ba con số phải thuộc trước khi đọc tiếp:

- Tỷ lệ thắng thật ở kỳ thi: **~33%** — thua là chuyện diễn ra đều đặn, không phải tai nạn.
- Kỷ lục **10 lệnh thua liên tiếp** (năm 2021).
- Cú sụt vốn sâu nhất 22 năm: **-12R**, mất 124 tháng mới thấy đáy.

⚠ **Cảnh báo đủ mẫu:** kỳ thi thật chỉ có 30 lệnh — dưới ngưỡng 100 lệnh chúng tôi coi là đủ tin. Điểm cao trên ít lệnh vẫn có thể là may mắn; hãy xem chiến lược này là 'đáng theo dõi' hơn là 'đã chứng minh'.

## Chiến lược này kiếm tiền bằng logic gì?

Chỉ trade inside bar khi D1 đang trend (giá trên/dưới EMA200). Nguồn gốc: Biến thể lọc trend. Cài đặt đem kiểm định: `{"trend_ema": 200, "dummy": 1, "sl_atr": 2.0, "tp_r": 3.0}`.

Mẫu nến chỉ có giá trị khi nó nằm đúng chỗ trong cấu trúc lớn. Bản này đậu vì cây nến ở đây chỉ là cái cò súng — còn khẩu súng là con sóng trung hạn H4 phía sau.

## Nhịp sống — bạn sẽ trải nghiệm gì

- **Khoảng 7 lệnh mỗi năm** trên khung D1; bình thường các lệnh cách nhau ~44 ngày, nhưng có lúc 296 ngày liền không có lệnh nào — tháng im lặng là bình thường, không phải chiến lược hỏng.
- Lệnh thắng điển hình giữ ~26 ngày, lệnh thua bị đá ra sau ~9 ngày. Giữ lệnh qua đêm/cuối tuần là chuyện thường — không hợp với người không ngủ được khi đang ôm lệnh.
- Cách nó ra khỏi lệnh: 67% số lệnh chạm dừng lỗ, 31% chạm chốt lời gấp 3 lần rủi ro. Thua nhiều lệnh là THIẾT KẾ của nó, không phải tai nạn — toán học nằm ở chỗ lệnh thắng ăn gấp 3.

## Cái giá phải trả

**Chuỗi thua dài nhất: 10 lệnh liên tiếp** (rơi vào năm 2021). Rủi ro 1 triệu mỗi lệnh nghĩa là có giai đoạn mất 10 triệu liền mạch không một lệnh gỡ — hãy tự hỏi thật lòng bạn còn bấm nút nổi ở lệnh thứ 7 không, vì người bỏ cuộc thường bỏ đúng trước khi chuỗi kết thúc.

**Sụt vốn sâu nhất: -12R**, kéo dài 124 tháng (từ 2011-08 tới đáy 2021-12, hồi phục hẳn 2025-03). Ai dùng nó phải biết trước con số này để định cỡ vốn và chuẩn bị tâm lý — không phải để bất ngờ giữa chừng.

Năm tốt nhất: 2025 (+1.21 R/lệnh). Năm tệ nhất: 2021 (-1.02 R/lệnh). Chiến lược nào cũng có mùa — biết trước mùa xấu trông ra sao là một nửa việc sống sót.

## Điểm thi chính thức

| Giai đoạn | Số lệnh | Lãi TB/lệnh | Tỷ lệ thắng | Năm lãi |
|---|---|---|---|---|
| Ôn bài 2004–2018 | 102 | +0.166 R | 30.4% | 9/15 |
| **Kỳ thi thật 2019–2023** | 30 | **+0.228 R** | 33.3% | 3/5 |
| **Kỳ thi lần 2 02/2024–07/2026** | 15 | **+1.232 R** | 60.0% | 3/3 |


So với vào lệnh ngẫu nhiên trên 16 thị trường trộn: hơn +0.127 R/lệnh. Kỳ vọng thực tế nên giữ quanh mức điểm kỳ thi thật (+0.23 R/lệnh — rủi ro 1 triệu/lệnh thì trung bình lãi 228 nghìn/lệnh, tính trên hàng chục lệnh chứ không phải từng lệnh).

Kỳ thi lần 2 (02/2024→07/2026, dữ liệu hoàn toàn mới): **vẫn giữ vững** — lãi trung bình +1.232 R/lệnh qua 15 lệnh. Đừng lấy giai đoạn đẹp này làm kỳ vọng dài hạn: con số nên khắc vào đầu vẫn là điểm kỳ thi thật.

## Hướng dẫn áp dụng — và các bẫy

**Cỡ lệnh trước, mộng mơ sau.** Lấy chuỗi thua kỷ lục (10) nhân đôi cho an toàn (~20R) rồi hỏi: mất bao nhiêu % tài khoản thì vẫn ngủ được? Chia ngược lại ra % rủi ro mỗi lệnh. Đó là toán, không phải ý kiến.

**Bẫy 1 — bỏ cuộc giữa mùa khô.** Giai đoạn xấu nhất trong lịch sử của nó (xem trên) sẽ quay lại dưới hình dạng nào đó; người thua trong chiến lược thắng là người dừng đánh sau chuỗi thua rồi quay lại đúng lúc hết sóng.

**Bẫy 2 — tự "cải tiến" thông số** cho tỷ lệ thắng đẹp hơn. Kết cấu thắng-thua của nó là một khối toán học cân bằng; kéo chốt lời gần lại hay nới dừng lỗ ra là rút đúng viên gạch đang đỡ cả khối.

**Bẫy 3 — quên rằng đây là kết quả máy chạy.** Backtest quy tắc cứng, khớp lệnh bi quan, đã trừ phí — nhưng vẫn là quá khứ. Triển khai thật: bắt đầu cỡ lệnh nhỏ, ghi nhật ký so số thật với số ở bài này, chỉ tăng dần khi hai bên khớp nhau.

---

*STRATEGY AUDIT · ZALO: 05.6666.5511 — Báo cáo kiểm định độc lập, không phải lời khuyên đầu tư. Kết quả quá khứ không bảo đảm tương lai. R = số tiền bạn dám thua ở mỗi lệnh.*
