# HANDOFF — sổ bàn giao giữa các agent

Ghi mới lên trên cùng. Mỗi mục: ngày · ai · nhánh · đã làm gì · việc cần bên khác làm.

---

## 27/10/2026 · Claude · Chuẩn bị + GĐ0 (vá rủi ro)

**Đã làm**
- Chuyển 242 bài VIP + 242 report đầy đủ từ `public/data/` sang `private_data/`. Phần công khai do `scripts/build-data.mjs` sinh lại (đã lọc R, PF, EV, by_year, tham số). Script tự chạy trước `npm run dev` và `npm run build`; nó sẽ báo lỗi build nếu thấy R/PF lọt ra ngoài.
- Bài VIP chỉ đi qua `netlify/functions/vip.mjs`: không có passkey thì nhận phần "Tóm tắt 30 giây", có passkey hợp lệ thì nhận bài đầy đủ. Khi chạy `npm run dev`, function cũng chạy luôn nhờ plugin trong `vite.config.ts`.
- Bỏ passkey dự phòng `ADMIN`/`VIP`/`SA_ADMIN_2026` trong code. Bỏ cờ `quant_vip_auth_v2`. Bỏ việc gọi Apps Script 10 giây/lần.
- Apps Script (`google-apps-script.js`): `getArticles` cần passkey admin; `saveArticle` cần passkey admin; thêm `getArticle` chỉ cho server (SERVER_KEY); không tự tạo passkey mặc định nữa.
- Bỏ R/PF/EV ở: trang chủ, thư viện VIP (bảng, thẻ mobile, biểu đồ → ô năm dương/âm), trang Dịch vụ.
- Giá sửa theo câu chuẩn; thêm gói 299k / 14 ngày (trang chủ, Membership, Bảng giá).
- Trang chủ: gỡ khối Data Science, Custom Instructions, 3 câu FAQ lạc đề, chữ "y sinh học" ở footer. Gỡ mục "Data Science & Math" và nút "Chỉ dẫn Custom" khỏi menu (route `/datascience` vẫn còn, chưa xoá).
- Hero mặc định hiện hồ sơ thật. three.js chỉ tải khi bấm 3D. Các trang VIP, Admin, Vault, Wizard, DataScience tải khi mở tới.
- Ảnh 3D cube: PNG 3,8 MB → WebP 235 KB (bản gốc ở `private_data/_goc_anh/`).
- Thay `GEMINI.md` và `.agents/rules/custom_instructions.md` bằng luật mới trỏ về `AGENTS.md` (bản cũ ở `.agents/_luu_tru/`).

**Kết quả đo**
- `npm run build` qua. JS lần đầu ~152 KB gzip + CSS ~28 KB gzip (trước: một khối 1,8 MB). three.js tách riêng ~150 KB gzip, chỉ tải khi cần.
- Gõ thẳng `/data/vip_articles/VIP_BRK001.md` → trả về trang web, không còn bài.

**🔴 Leon cần làm (không làm thì lỗ hổng vẫn còn)**
1. Mở Google Sheet → tab `passkeys` → **xoá hoặc đổi trạng thái `inactive`** dòng `VIP` và dòng `SA_ADMIN_2026`. Ngày 27/10 passkey `VIP` vẫn hợp lệ trên server thật. Tạo passkey admin mới khó đoán.
2. Dán `google-apps-script.js` mới vào Apps Script → Deploy → Manage deployments → Edit → New version (giữ nguyên URL).
3. Apps Script → Project Settings → Script Properties → thêm `SERVER_KEY` = một chuỗi ngẫu nhiên dài.
4. Netlify → Environment variables → thêm `GAS_SERVER_KEY` (trùng chuỗi trên) và `GAS_URL` (URL Web App).
5. Repo GitHub để **private**.

**Còn lại / chưa làm**
- Function `vip.mjs` mới chạy thử qua dev server, **chưa chạy trên Netlify thật**. Cần kiểm trên link deploy preview đầu tiên.
- Nội dung 242 bài VIP vẫn dùng R (vd "-1149R"). Đây là phần trả phí nhưng vẫn trái luật "không R trên mọi kênh". Leon quyết có viết lại không.
- `DataScienceHub` và `CustomInstructionsPanel` vẫn có R:R/EV nhưng không còn đường vào từ menu. Sẽ xoá hoặc làm lại khi có thiết kế 6 màn.
- Font vẫn tải 4 bộ (Be Vietnam Pro, Inter, Space Grotesk, JetBrains Mono). Để Stitch/Antigravity gom lại khi làm theme mới.
- Code cũ không dùng: `Home.tsx`, `SauO.tsx`, `LandingPage.tsx`, `LibraryPage.tsx`, `ClientDashboard.tsx`, `BioscienceHub.tsx`, `Services.tsx`. Chưa xoá.
- Nút liên hệ mua gói vẫn dẫn sang Telegram, chờ Leon chốt Zalo hay Telegram.
