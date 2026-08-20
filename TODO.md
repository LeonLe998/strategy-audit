# DANH SÁCH NHIỆM VỤ CẦN HOÀN THIỆN (TODO LIST)

Dự án: **Strategy Audit - Thư Viện Chiến Lược VIP**

Dưới đây là các hạng mục công việc tiếp theo để hoàn thiện 100% dự án trước khi Launching (Ra mắt) chính thức. Anh có thể pull file này về laptop để theo dõi nhé:

## 1. Triển khai Backend / Cơ sở dữ liệu (Database)
- [ ] Thiết lập **Google Sheets** làm Database lưu trữ các Bài Phân Tích Chuyên Sâu (Article Content) thay vì lưu tạm trên trình duyệt (LocalStorage).
- [ ] Triển khai mã **Google Apps Script (GAS)** để tạo API đọc/ghi dữ liệu từ Google Sheets xuống Website.
- [ ] Đấu nối (Fetch API) trên `AdminDashboard.tsx` và `VIPLibrary.tsx` để đọc dữ liệu thật từ Server.

## 2. Nâng cấp Hệ thống Passkey (VIP Auth)
- [ ] Thiết lập bảng tính thứ 2 trên Google Sheets để quản lý danh sách Passkey hợp lệ.
- [ ] Viết API kiểm tra tính hợp lệ của Passkey (Check thời hạn, Passkey có bị khóa hay không).
- [ ] Thay thế hàm `handleVerifyPasskey` hiện tại (đang hardcode 'ADMIN' và 'VIP') bằng hàm gọi API xác thực thật.

## 3. Hoàn thiện Nội dung (Content)
- [ ] Viết bài phân tích chuyên sâu cho 15 chiến lược "CHẤT" đầu tiên thông qua Admin Dashboard.
- [ ] Viết bài phân tích chỉ ra các bẫy tâm lý cho các chiến lược "CHÁT" nổi bật.

## 4. Triển khai Lên Mạng (Deployment)
- [ ] Tích hợp Google Analytics hoặc Meta Pixel để theo dõi lượng truy cập và hành vi người dùng.
- [ ] Đẩy (Deploy) toàn bộ code Frontend lên các nền tảng Host như **Vercel** hoặc **Netlify**.
- [ ] Mua và trỏ tên miền chính thức (ví dụ: `strategy-audit.com` hoặc `quant.vn`).

## 5. (Mở rộng Tương lai) Tự động hóa Thanh Toán
- [ ] Tích hợp Cổng thanh toán (VNPAY / Momo / Stripe).
- [ ] Xây dựng luồng: Khách thanh toán -> Tự động sinh ra Passkey VIP -> Gửi Passkey tự động qua Email.
