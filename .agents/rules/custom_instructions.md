# Luật workspace — Strategy Audit

Luật đầy đủ nằm ở `AGENTS.md` (thư mục gốc). Mọi agent đọc file đó trước khi làm việc.

Ngắn gọn:
- Web trả lời một câu: phương pháp bạn đang dùng CHẤT hay CHÁT? Trang chủ là trò chơi 6 màn.
- Không hiển thị R, profit factor, % lãi lỗ, EV. Không đường giá đi lên, nến, thỏi vàng, `$` `₫` trong hình.
- Không thêm Lorenz, Black-Scholes, y sinh, Custom Instructions, nạp model 3D.
- Không đụng `private_data/`, `netlify/functions/`, `scripts/` nếu không được giao.
- Số liệu chỉ lấy từ dữ liệu do `scripts/build-data.mjs` sinh ra.

Bản luật cũ (Data Science & 3D Platform) lưu ở `.agents/_luu_tru/` để tham khảo, không áp dụng nữa.
