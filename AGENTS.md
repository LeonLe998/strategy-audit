# Luật chung cho mọi agent làm web Strategy Audit

© Leon · Strategy Audit. Đọc hết file này trước khi sửa bất cứ thứ gì.

## 1. Web này để làm gì
Trả lời đúng một câu cho trader Việt: **phương pháp bạn đang dùng CHẤT hay CHÁT?**
Trang chủ là một trò chơi gồm 6 màn: Khái niệm → Vì sao kiểm định → Sáu Ô (cho điểm) → Thư viện 300 (dùng điểm mở hồ sơ) → Kiếm thêm điểm → Chuyển đổi.

**Không thêm:** Lorenz, Black-Scholes, y sinh, dược phẩm, nạp model 3D, "Custom Instructions", nội dung nghề quant không gắn với thư viện.

## 2. Cấm hiển thị (luật kênh, trên mọi trang, mọi hình)
- Giá trị **R**, **profit factor**, **phần trăm lãi lỗ**, EV.
- Đường vốn đi lên, mũi tên xanh chỉ lên, nến, thỏi vàng, ký hiệu `$` `₫` trong hình minh hoạ.
- Hứa lợi nhuận, tín hiệu vào lệnh, tên khoá học/người dạy/kênh khác.

**Được phép:** số lệnh, tỉ lệ thắng, số năm dương, chuỗi thua dài nhất, verdict.

**Giá chỉ được ghi đúng câu:** *"Membership 100 đô một tháng. Tháng đầu 50."* Gói trải nghiệm: *299k / 14 ngày*.

## 3. Số liệu
- Số thư viện lấy từ `public/data/thuvien_data/` do `scripts/build-data.mjs` sinh ra từ `private_data/`. **Không tự gõ số vào component.**
- Kho số đã kiểm: 300 đưa vào · 242 kiểm định đầy đủ · 15 CHẤT · 39 tình huống · 188 CHÁT · 22 năm dữ liệu vàng. Kỳ thi lần 2: 15/15 CHẤT giữ vững.
- Mọi con số mới phải được Leon duyệt.

## 4. Bảo mật
- `private_data/` chứa bài VIP và report đầy đủ. **Không chép ra `public/`, không import vào `src/`.**
- Bài VIP chỉ đi qua `netlify/functions/vip.mjs` (kiểm passkey phía server).
- Repo GitHub phải để **private**.
- Không viết cứng passkey/mật khẩu vào code. Không dùng cờ localStorage để mở khoá nội dung.

## 5. Thiết kế
- Bảng màu: nền `#040914` · quầng `#00486b` · viền sáng `#3df2ff` · nhấn chuyển sắc `#FFDD00 → #2BFFEA`.
- Font: Be Vietnam Pro (chữ) + JetBrains Mono (số).
- Thiết kế mobile 390px trước.
- Ảnh: WebP ≤150 KB; icon/khung dùng SVG.
- Thư viện nặng (three.js, recharts…) chỉ được nạp bằng `lazy()` khi người dùng mở tới.

## 6. Ai sửa thư mục nào
| Thư mục | Chủ |
|---|---|
| `src/game/`, `src/data/`, `scripts/`, `netlify/functions/`, `google-apps-script.js`, `src/lib/analytics.ts` | Claude |
| `src/content/` (chữ + số hiển thị) | Claude soạn, Leon duyệt |
| `src/ui/`, `src/styles/`, `public/assets/` | Stitch → Antigravity |
| `src/pages/`, `src/components/` (ráp trang) | Ráp chung, ghi tên người ráp vào `HANDOFF.md` |

Muốn sửa thư mục của bên kia → ghi yêu cầu vào `HANDOFF.md`, không tự sửa.

## 7. Quy trình
1. Mỗi việc một nhánh: `stitch/...`, `antigravity/...`, `claude/...`.
2. Push → Netlify tạo link xem thử → Leon duyệt trên điện thoại.
3. Trước khi merge: soát luật mục 2–4 và chạy `npm run build` qua.
4. Leon bấm merge → deploy.
