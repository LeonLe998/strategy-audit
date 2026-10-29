# HANDOFF — sổ bàn giao giữa các agent

Ghi mới lên trên cùng. Mỗi mục: ngày · ai · nhánh · đã làm gì · việc cần bên khác làm.

---

## 28/10/2026 · Claude · nhánh `claude/gd1-journey` · Trang chủ là sảnh bản đồ đảo

Leon chốt: bản đồ không còn là game đi bộ 6 màn, chỉ là cửa vào cho người mới nhìn toàn cảnh rồi dẫn vào các trang.

**Xem thử:** http://localhost:5173/ (xoá `sa_hub_visited_v1` trong localStorage để SA bot hỏi lại từ đầu).

- **Đảo 1 · Bắt đầu ở đây** (`/hanh-trinh`, Leon duyệt 28/10): bỏ trò chơi Màn 1–2, thay bằng trang thu hút `src/pages/StartHerePage.tsx`, 5 màn hình, mỗi màn một hình + một câu: (1) phễu 3 tầng (sửa 29/10 theo ý Leon): viên ý tưởng gốc + viên khung nến rơi vào tầng 1, chập lại ở tầng 2 thành viên tên chiến lược thật lấy từ `thu_vien_index.json`, qua tầng 3 "Đem đi đo" rồi tách sang máng ĐẠT 15 (trái) / KHÔNG ĐẠT 227 (phải) theo verdict thật (nhãn tầng/máng vẽ đè lên trên, không bị viên chữ che); ba ô 300 → 242 → 15 mỗi ô một lưới 300 chấm, chấm rụng dần qua từng ô (−58, −227), số đếm lùi theo, ô cuối còn 15 chấm sáng + vệt lóe; (2) cái cân SVG: nhiều lệnh thắng nhỏ vs vài lệnh thua to; (3) bốn thẻ SMC·ICT 18 / Phá vỡ đầu phiên 7 / RSI 12 / MACD 5 bị đóng dấu KHÔNG QUA (42 chiến lược · 22.938 lệnh · 0 qua, nguồn `1_Chiến lược/BANGIAO_Marketing_Branding.md`); (4) tờ lịch 3D: 2 ngày giao dịch cuối tháng "Mua", ngày giao dịch thứ 3 tháng sau "Bán"; (5) câu chốt + nút Tự kiểm 6 ô / Thư viện 300. Cảnh 3D ở `src/game/world/StartScenes3D.tsx` + `miniScene.ts` (chỉ vẽ khi đang trong khung nhìn). Chữ ở `START_HERE`. Trang này không cộng Điểm Đo nữa; `JourneyPage.tsx` + `JourneyStages.tsx` giữ lại, không còn gắn đường dẫn.

- **SA bot** (Leon đặt tên, chốt 28/10): robot 3D đứng trước cụm đảo, hỏi đúng một câu "Bạn đã từng tham quan Strategy Audit chưa?". *Có rồi* → mở hết, khách tự chọn. *Chưa từng* → đảo "Bắt đầu ở đây" sáng + gắn nhãn "Nên bắt đầu ở đây", rê chuột lên đảo khác hiện ghi chú đảo dùng làm gì (điện thoại: chạm lần 1 hiện ghi chú, chạm lần 2 mới vào). Câu trả lời lưu ở `sa_hub_visited_v1`, lần sau không hỏi lại; có nút "Trả lời lại". Bấm robot hoặc nút "Hỏi SA bot" để mở lại bong bóng. Chữ ở `SA_BOT` và `note` của từng đảo trong `HUB`. GA4 `hub_bot`.
- Vòng giới thiệu **không tự chạy nữa** (thay bằng câu hỏi của SA bot); chạy khi khách mới bấm "Đi một vòng xem trước" hoặc link "Xem lại vòng giới thiệu".
- Đảo 5 đã được bên khác đổi thành "Lộ trình 18 tháng" (trỏ `/vault`); `Vault.tsx` đang sửa dở ở bên đó, Claude không commit file này.

- `src/game/world/IslandHub3D.tsx` (thay `JourneyWorld3D.tsx`): 6 đảo xếp hình rắn, máy ngang 3×2, máy dọc 2×3. Lần đầu: máy quay lướt toàn cảnh rồi dừng ở từng đảo kèm một câu (bỏ qua được, Esc cũng bỏ qua), xong thì dừng ở toàn cảnh. Bấm đảo, bảng tên, nút "Vào trang này" hoặc menu thì máy quay sà xuống đảo rồi chuyển trang.
- Đảo → trang: Bắt đầu ở đây → `/hanh-trinh` (Màn 1–2) · Vì sao cần đo → `/gioi-thieu` · Tự kiểm 6 ô → `/sauo` · Thư viện 300 → `/vip` · Tài liệu → `/vault` · Thành viên → `/membership`. Chữ ở `HUB` trong `src/content/journey.ts`.
- Bỏ: nhân vật đi bộ, W A S D, cầu khoá, bảng nhiệm vụ, thanh "Sắp mở", bản đồ nhỏ. Điểm Đo chỉ hiện khi đã có điểm.
- Trang chủ cuộn cũ chuyển sang `/gioi-thieu` (bản đọc). Máy không chạy được WebGL thì `/` hiện bản đọc.
- Nối các trang về bản đồ: Navbar có mục "Bản đồ", thanh dưới điện thoại đổi "Trang chủ" → "Bản đồ", trang Sáu Ô có link "Bản đồ" ở thanh trên và thanh bên. Bỏ nút "Chơi trên bản đồ đảo 3D" ở trang hành trình và nút Game 3D trên menu.
- GA4 thêm `hub_tour` (done/skip/replay) và `hub_island` (đảo nào, bấm từ đâu).
- Đã thử trên khung điện thoại (vòng giới thiệu, bấm đảo → /vip, về bản đồ) và khung 1280 (chụp mờ, bố cục 3×2 vừa khung). Chưa thử máy thật.
- Ô "Bước tiếp theo" (`src/components/NextStep.tsx`, chữ ở `NEXT_STEP`): cuối mỗi trang trong khung App, chỉ sang đảo kế tiếp theo thứ tự `HUB.islands`, kèm nút "Về bản đồ". Trang Thành viên và các trang ngoài bản đồ gợi ý Tự kiểm 6 ô. Trang Sáu Ô không gắn vì đã có ô liên hệ và link thư viện riêng ở cuối bài. GA4 `next_step` (from, to).
- Liên hệ (`src/components/ContactLinks.tsx`, chữ và link ở `CONTACT`): nút "Liên hệ" trên thanh trên của bản đồ mở bảng Zalo + Telegram; ô cuối mỗi trang có dòng liên hệ; chân trang đổi từ chỉ Telegram sang cả Zalo + Telegram. GA4 `contact_click` (channel, from).
- Chưa làm: làm xong Sáu Ô chưa tự ghi điểm/qua màn.

## 27/10/2026 · Claude · nhánh `claude/gd1-journey` · Bản đồ đảo 3D (đã thay bằng sảnh ở trên)

**Xem thử:** http://localhost:5173/hanh-trinh?3d, hoặc bấm nút "Chơi trên bản đồ đảo 3D" trên trang hành trình, hoặc nút Game 3D trên menu.

**Đã làm**
- `src/game/world/JourneyWorld3D.tsx`: 6 đảo nổi low-poly = 6 màn, nối bằng cầu ván treo. Cầu tới đảo chưa mở thì gãy và không đi qua được. Nhân vật đi bằng chạm/bấm (tự tìm đường qua cầu) hoặc phím W A S D. Góc nhìn chéo kiểu isometric. Đứng trên đảo đang mở thì hiện nút vào màn; màn chơi mở ngay trên bản đồ. Qua màn thì có pháo giấy, cầu kế tiếp sáng lên.
- Giao diện trên bản đồ: điểm, thanh tiến độ, ô nhiệm vụ, bản đồ nhỏ (bấm để đi tới), lời dẫn của Leon, thanh công cụ 4 nhánh phụ (đang khoá "Sắp mở"). Chữ nằm trong `WORLD` ở `src/content/journey.ts`.
- `src/game/JourneyStages.tsx`: nội dung chơi Màn 1–2 tách ra để bản 2D và 3D dùng chung.
- Nút Game 3D trên menu giờ mở bản đồ này, thay cho thế giới quant cũ. `components/Game3D/World3D` cũ vẫn còn ở khung hero trang chủ.
- Dung lượng: bản đồ 14,7 KB gzip + three.js 149 KB gzip, chỉ tải khi bấm mở.
- Nâng hình (27/10, Leon chốt không cần model ngoài): 6 vật mốc dựng lại theo bộ hình LM-01…06 Gemini (bệ đá viền sáng; LM-03 làm đúng 6 ô lục giác + cổng khoá; LM-04 mặt trước là 242 ngăn kéo tô màu CHẤT/TÌNH HUỐNG/CHÁT thật). Thêm bloom, đổ bóng, tone mapping ACES, nền trời quầng xanh, lưới đáy, đảo xa làm phông, vòng phù văn lục giác, đèn đầu cầu. Đo trên khung hẹp ~90 fps.

**Việc cho Leon / Gemini / Antigravity**
- `docs/THANH_PHAN_HINH_ANH.md`: danh sách ảnh và model cần tạo, kèm luật cấm, thông số, prompt. Asset nào xong thì code thay vào theo mã.

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
