# HANDOFF — sổ bàn giao giữa các agent

Ghi mới lên trên cùng. Mỗi mục: ngày · ai · nhánh · đã làm gì · việc cần bên khác làm.

---

## 27/10/2026 · Claude · nhánh `claude/gd1-journey` · GĐ1 phần logic

**Xem thử:** `npm run dev` → http://localhost:5173/hanh-trinh (trang chủ chưa đổi).

**Đã làm**
- `src/game/journeyConfig.ts`: 6 màn, điểm thưởng (Màn 1 +10, Màn 2 +10, Sáu Ô +30), giá mở hồ sơ 25, tên điểm "Điểm Đo".
- `src/game/journeyStore.ts`: trạng thái lưu localStorage (`sa_journey_v1`): màn đã qua, sổ điểm (mỗi việc chỉ cộng một lần), câu trả lời. Màn sau chỉ mở khi màn trước xong.
- `src/game/useJourney.ts`: hook cho giao diện → `{ points, stages[{id, order, title, reward, status}], current, answers, ledger, completeStage(id), recordAnswer(key, value), award(key, delta, reason), reset() }`.
- `src/game/useLibraryCards.ts`: đọc lá bài và phễu số từ dữ liệu công khai (đã lọc R/PF), không gõ số tay.
- `src/content/journey.ts`: chữ Màn 1–2, **viết cho trader mới** (27/10, theo ý Leon): không tên nhóm, không thuật ngữ chưa giải thích, mỗi ô tối đa một con số tự hiểu được. Màn 1: thẻ "Đo / Kiểm chứng"; câu đố "yếu tố nào quan trọng nhất" không có đáp án sai, ô nào cũng có số (22.938 lệnh không cách nào qua / chốt sớm thắng ~48 trên 100 mà gần tệ nhất / kiểu theo giờ và ngày qua nhiều gấp ~3,5 lần / 188 trên 242 không có lợi thế). Màn 2: ~6 trên 100 qua, kỳ chấm lại 15/15, chú giải CHẤT/CHÁT/TÌNH HUỐNG, tên và luật 3 lá bài viết lại bằng lời thường. **Leon đã duyệt Màn 1–2 (27/10).** Event GA4 `poll_answer` ghi lại người chơi tin vào yếu tố nào.
- `src/lib/analytics.ts`: event GA4 `stage_view`, `stage_done`, `quiz_answer`, `card_guess`, `points_earn`.
- `src/pages/JourneyPage.tsx`: **khung chưa style**, route `/hanh-trinh`. Lá bài Màn 2: IND002 (RSI-14), MTF014 (SMC FVG + CHoCH), SEA003 (Turn-of-month).

**Đã thử trên trình duyệt:** chơi Màn 1 → Màn 2 → 20 điểm → Sáu Ô mở khoá; tải lại trang vẫn giữ tiến độ; đoán bài hiện đúng verdict + số từ dữ liệu.

**Việc cho Stitch → Antigravity**
- Thiết kế lại phần nhìn của `JourneyPage.tsx` (bản đồ 6 màn, thẻ bài, con dấu, ví điểm). **Giữ nguyên** các lời gọi `useJourney`, `useLibraryCards`, `funnel.*` và nội dung lấy từ `src/content/journey.ts`. Có sẵn thuộc tính `data-stage`, `data-status`, `data-card`, `data-flipped`, `data-stamp`, `data-points`… để bám vào khi style.
- Muốn đổi chữ thì ghi yêu cầu ở đây, không sửa thẳng `src/content/`.

**Chưa làm (GĐ2):** Màn 3 cổng Zalo + ví điểm trên server; Màn 4 mở hồ sơ bằng điểm. Trang chủ chưa chuyển sang bản đồ, chờ thiết kế Stitch.

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
