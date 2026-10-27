# Strategy Audit — Design brief cho Stitch AI

## Mục tiêu

Thiết kế lại website Strategy Audit để người mới hiểu nhanh: đây là nơi giúp họ **đo và kiểm định phương pháp giao dịch bằng dữ liệu trước khi tiếp tục áp dụng**. Website cần dẫn người xem qua hành trình: xem video/bài viết → hiểu vấn đề → thử Sáu Ô miễn phí → xem ví dụ và thư viện → hiểu giá trị thành viên → nhắn Telegram để đăng ký.

Ưu tiên giao diện dễ hiểu, đáng tin, có minh họa sản phẩm và trải nghiệm tốt trên điện thoại. Không định vị đây là nhóm phát lệnh, không cam kết lợi nhuận, không dùng khan hiếm giả.

## Định vị và người dùng

- Người dùng: người mới tự học hoặc trader đã có phương pháp nhưng chưa biết kiểm tra phương pháp có hiệu quả ổn định hay chỉ gặp may.
- Nỗi băn khoăn: “Tôi biết cách vào lệnh, nhưng không biết phương pháp có thực sự hiệu quả không.”
- Giá trị: thêm bước **ĐO** vào giữa **HỌC → THỰC HÀNH**; biến quy tắc thành thứ có thể kiểm tra, đọc kết quả và hiểu giới hạn.
- Thành viên nhận được: các ca kiểm định thực tế, cộng đồng học cách đo, tự xem lại hệ thống và hỏi đáp.
- Không phải: phòng phát tín hiệu hay khuyến nghị đầu tư cá nhân.
- Giọng điệu: bình tĩnh, thực tế, dễ hiểu, có bằng chứng, không phóng đại.

## Luồng chính

**Nội dung/video → trang chủ → xem cách đo → tự kiểm tra Sáu Ô → nhận bước tiếp theo phù hợp → khám phá thư viện 300 chiến lược/case study → xem quyền lợi và phí thành viên → nhắn Telegram.**

CTA chính: **Bắt đầu với Sáu Ô**. CTA phụ: **Xem cách đo một phương pháp**. Chỉ mời tham gia trả phí sau khi đã giải thích rõ giá trị.

## Trang chủ — thứ tự section

1. **Header:** logo; Cách hoạt động; Sáu Ô; Thư viện 300 chiến lược; Thành viên; CTA “Tự kiểm tra”. Menu mobile dễ thao tác.
2. **Hero:** thông điệp đời thường, ví dụ: “Biết cách giao dịch chưa đủ. Hãy kiểm tra xem phương pháp có đứng vững qua dữ liệu không.” Mô tả một câu, CTA “Bắt đầu với Sáu Ô”.
3. **Minh họa hero:** preview báo cáo kiểm định thật với đường vốn, số giao dịch, drawdown và chú giải; hoặc video 30–60 giây có ảnh poster và phụ đề. Trông như sản phẩm thật, không phải card toàn chữ.
4. **HỌC → ĐO → THỰC HÀNH:** diagram lớn, làm nổi bật bước ĐO và giải thích câu hỏi mỗi bước trả lời.
5. **Cách làm:** chọn phương pháp → xác định quy tắc → kiểm tra qua dữ liệu → đọc kết quả và giới hạn → quyết định bước tiếp theo. Dùng hình/diagram thay cho đoạn văn dài.
6. **Sáu Ô:** preview câu hỏi và kết quả mẫu; nêu rõ ai nên dùng, cần chuẩn bị gì, nhận được gì. CTA sang `/sauo`.
7. **Case study:** câu hỏi → dữ liệu → phát hiện → giới hạn → điều học được. Chỉ dùng dữ liệu thật được xác nhận; dữ liệu mẫu phải ghi rõ “minh họa”.
8. **Thư viện:** phân loại, vài thẻ xem trước, trạng thái xem thử/thành viên và CTA “Khám phá thư viện”. Không đổ toàn bộ danh sách lên trang chủ.
9. **Thành viên:** lợi ích cụ thể, phí **$50 tháng đầu, $100 mỗi tháng từ tháng thứ hai**, quy trình chuyển khoản và xác nhận thủ công qua Telegram.
10. **FAQ, lưu ý và footer:** nêu rõ không có tín hiệu giao dịch; quá khứ không đảm bảo tương lai; nội dung mang tính giáo dục.

## Sáu Ô — `/sauo`

- Một câu hỏi hoặc nhóm nhỏ mỗi màn hình; có tiến độ và nút quay lại.
- Dùng ngôn ngữ đời thường, giải thích thuật ngữ, cho phép trả lời “chưa biết”.
- Trước khi bắt đầu: mục đích, thời gian ước tính, thông tin cần chuẩn bị.
- Kết quả không phán xét hay hứa lợi nhuận. Tóm tắt điều đã rõ, phần còn thiếu và một hành động tiếp theo.
- Đề xuất nội dung phù hợp: hướng dẫn, thư viện hoặc cộng đồng. Chỉ hỏi thông tin liên hệ khi cần và nói rõ mục đích.

## Thư viện 300 chiến lược

- Tìm kiếm và bộ lọc dễ hiểu; nhóm theo danh mục dùng ngôn ngữ phổ thông.
- Thẻ hiển thị tên, ý tưởng chính, bối cảnh/khung thời gian khi có, trạng thái xem thử hoặc thành viên.
- Trang chi tiết phân biệt mô tả phương pháp với kết quả kiểm định; nêu dữ liệu, giả định và giới hạn khi có.
- Không quảng cáo bằng số liệu hiệu suất chưa xác minh.

## Trang thành viên — `/membership`

- Nêu ai phù hợp và ai chưa cần tham gia.
- Cho xem trước một ca phân tích để khách hiểu giá trị.
- Hiển thị quyền lợi và giá minh bạch: **$50 tháng đầu / $100 mỗi tháng từ tháng thứ hai**.
- Giải thích thanh toán: khách chuyển khoản rồi gửi xác nhận qua Telegram; cấp quyền sau khi xác nhận.
- CTA: **Nhắn Strategy Audit trên Telegram**. Không tạo cảm giác khẩn cấp giả hoặc nói có tự động gia hạn.

## Hướng hình ảnh

Tạo cảm giác **phòng nghiên cứu dữ liệu hiện đại, dễ gần và có kỷ luật**, tránh trading cliché và sci-fi quá đà.

- Nền than/xanh đen dịu; xanh ngọc làm điểm nhấn có chừng mực. Tăng/giảm không chỉ phân biệt bằng màu.
- Sans-serif hỗ trợ tiếng Việt tốt; tiêu đề ngắn, thân bài thoáng, cỡ chữ đọc rõ.
- Tăng sức hút bằng preview sản phẩm, biểu đồ có chú giải, sơ đồ quy trình, trích đoạn báo cáo và video có poster. Hạn chế card trống, glow dày và chuyển động gây nhiễu.
- Ghi “minh họa” rõ trên chart dùng dữ liệu giả. Không trình bày chart trang trí như bằng chứng thật.
- Dùng ảnh phân tích/quy trình hoặc cộng đồng thật khi có quyền sử dụng; tránh ảnh stock trader nhìn màn hình chung chung.
- Tạo nhịp bằng section nền sáng/tối xen kẽ, hình lớn, khoảng trắng và CTA rõ.

## UX, responsive và accessibility

- Thiết kế desktop và mobile; CTA dễ bấm, nội dung không quá dài, không tràn ngang.
- Mỗi section có một thông điệp chính. Điều hướng nhất quán giữa trang chủ, Sáu Ô, thư viện và thành viên.
- Tương phản dễ đọc, focus rõ, thao tác bàn phím được, video có phụ đề.
- Tránh pop-up chắn nội dung, đếm ngược giả, claim “90% trader thua lỗ” nếu không có nguồn kiểm chứng và mọi lời hứa lợi nhuận.

## Đầu ra Stitch cần tạo

1. Trang chủ desktop và mobile với đầy đủ thứ tự section.
2. Sáu Ô: màn giới thiệu, trạng thái câu hỏi và kết quả mẫu.
3. Thư viện: danh sách có tìm kiếm/bộ lọc và trang chi tiết chiến lược.
4. Trang thành viên với giá và CTA Telegram.
5. Component thống nhất: header, CTA, card, báo cáo/chart, FAQ, footer và menu mobile.
6. Dùng nội dung tiếng Việt trong brief, tránh thay mọi nội dung bằng placeholder.

Đây là prototype để so sánh ý tưởng. Khi triển khai, không tự ý xóa chức năng hoặc dữ liệu hiện có.

## Bối cảnh dự án

Website hiện dùng React + TypeScript + Vite. Các luồng chính gồm trang chủ, `/sauo`, thư viện 300 chiến lược, thành viên, dịch vụ, bảng giá và form kiểm tra/đăng ký. Dữ liệu thư viện nằm trong `public/data/vip_articles`. Dùng đây làm bối cảnh cho thiết kế.
