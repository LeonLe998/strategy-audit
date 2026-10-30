# HANDOFF — sổ bàn giao giữa các agent

Ghi mới lên trên cùng. Mỗi mục: ngày · ai · nhánh · đã làm gì · việc cần bên khác làm.

---

## 30/10/2026 · Antigravity · Đổi "Lộ trình 18 tháng" thành "Hồ sơ nghiên cứu" (`/vault`)

- **Theo chỉ đạo của Leon (30/10):** Đổi tên "Lộ trình 18 tháng" trên đảo số 5 (`HUB.islands`), menu bản đồ (`HUB.menu` trong `src/content/journey.ts`), thanh điều hướng (`src/components/Navbar.tsx`) và trang `/vault` (`src/components/Vault.tsx`) thành **Hồ sơ nghiên cứu** — phụ đề: *"Kho tài liệu & báo cáo chuyên đề"*.
- **Cấu trúc lại `src/components/Vault.tsx`:** Chuyển sang định dạng **Kho Tài Liệu & Báo Cáo Chuyên Đề** dùng bộ kính `GlassCard` / `.sa-glass`; bỏ khung thời gian 18 tháng & cầu thang thời gian; đưa **3 Báo Cáo Chuyên Đề Cốt Lõi** (`BC-01..03`) lên đầu cùng **8 Hồ Sơ Phương Pháp Đo Lường** (`HS-01..08`); gỡ Black-Scholes, nghề quant/phỏng vấn, Custom Instructions, R/PF/EV/% lãi lỗ đúng luật `AGENTS.md`.

---

## 28/10/2026 · Claude · nhánh `claude/gd1-journey` · Trang chủ là sảnh bản đồ đảo

Leon chốt: bản đồ không còn là game đi bộ 6 màn, chỉ là cửa vào cho người mới nhìn toàn cảnh rồi dẫn vào các trang.

**Xem thử:** http://localhost:5173/ (xoá `sa_hub_visited_v1` trong localStorage để SA bot hỏi lại từ đầu).

- **Đảo 1 · Bắt đầu ở đây** (`/hanh-trinh`, Leon duyệt 28/10): bỏ trò chơi Màn 1–2, thay bằng trang thu hút `src/pages/StartHerePage.tsx`, 5 màn hình, mỗi màn một hình + một câu: (1) phễu 3 tầng (sửa 29/10 theo ý Leon): viên ý tưởng gốc + viên khung nến rơi vào tầng 1, chập lại ở tầng 2 thành viên tên chiến lược thật lấy từ `thu_vien_index.json`, qua tầng 3 "Đem đi đo" rồi tách sang máng ĐẠT 15 (trái) / KHÔNG ĐẠT 227 (phải) theo verdict thật (nhãn tầng/máng vẽ đè lên trên, không bị viên chữ che); ba ô 300 → 242 → 15 mỗi ô một lưới 300 chấm, chấm rụng dần qua từng ô (−58, −227), số đếm lùi theo, ô cuối còn 15 chấm sáng + vệt lóe; (2) cái cân SVG: nhiều lệnh thắng nhỏ vs vài lệnh thua to; (3) bốn thẻ SMC·ICT 18 / Phá vỡ đầu phiên 7 / RSI 12 / MACD 5 bị đóng dấu KHÔNG QUA (42 chiến lược · 22.938 lệnh · 0 qua, nguồn `1_Chiến lược/BANGIAO_Marketing_Branding.md`); (4) tờ lịch 3D: 2 ngày giao dịch cuối tháng "Mua", ngày giao dịch thứ 3 tháng sau "Bán"; (5) câu chốt + nút Tự kiểm 6 ô / Thư viện 300. Hiệu ứng bằng GSAP (29/10), chạy một lần khi cuộn tới: tiêu đề hiện từng chữ; ba ô lọc 300 → 242 → 15; cái cân khối rơi vào rồi nghiêng; con dấu đóng từng thẻ, thẻ rung + viền đỏ. Đã thử Lenis (cuộn mượt) + ghim phễu + hiệu ứng bám vị trí cuộn: Leon thấy giật hơn bản cũ nên bỏ; cũng bỏ bộ lọc mờ SVG/CSS trên thứ đang chuyển động. Leon muốn hướng tiếp theo là thiết kế lại các khối cho sống động, đẹp hơn, không phải hiệu ứng cuộn. Lưu ý thử nghiệm: khung trình duyệt chạy ngầm thì requestAnimationFrame ngừng, phải chụp màn hình xen kẽ. Hướng thiết kế A "phòng thí nghiệm kính" (Leon chọn 29/10, mới làm mẫu màn đầu): phễu kính cong (MeshPhysical trong + viền sáng fresnel tự viết, phòng sáng studioEnv để có phản chiếu, hạt sáng trôi trong lòng phễu), mỗi chiến lược đo xong rơi thành viên bi vào bình kính Đạt (bi xanh phát sáng) / Không đạt (bi xám), bình Không đạt đầy 110 viên thì đổ đi đếm lại; ba ô số thành GlassCard (kính mờ, nghiêng theo chuột, đốm sáng theo con trỏ). Không dùng RoomEnvironment của three/examples: Vite đóng gói tách riêng gây lỗi 504. Leon duyệt 29/10, đã áp cho cả trang: cái cân 3D (ScaleScene: cột kính, đòn kim loại, đĩa kính treo; 9 khối thắng nhỏ sáng rơi vào trái, 3 khối thua to sẫm rơi vào phải, đòn chạy lò xo nghiêng 9° về phía thua); bốn thẻ thành GlassCard lật vào (GSAP), con dấu dập xuống có vệt mực loang (SVG), thẻ rung, viền đỏ; lịch để bàn kính (CalendarScene: giá chữ A kính, gáy kim loại, tờ Tháng này lật qua gáy ra sau để lộ Tháng sau, vòng 9s). Cảnh 3D chỉ bắt đầu chuỗi khi đã cuộn tới (mountScene + IntersectionObserver). Mở rộng ra toàn web (Leon duyệt 29/10, đợt 1+2): bộ kính chung `src/components/Glass.tsx` (GlassCard) + lớp .sa-glass / .sa-glass-cyan / .sa-glass-btn / .sa-glass-ghost / .sa-glow-line trong index.css (có bản chế độ sáng); áp cho thanh menu, menu điện thoại, ô Bước tiếp theo, nút Zalo/Telegram, chân trang, trang Thành viên (viết lại giao diện, giữ nguyên chữ/giá/form), trang Vì sao cần đo (bỏ khối World3D cũ + nút chuyển, thay bằng GlassOrbScene: quả cầu kính với 242 bi bay quanh, 15 bi xanh theo verdict thật; các thẻ của trang thành kính qua HomeStitch.css). Đợt 3 (29/10): Sáu Ô (SauOStitch.css thêm khối kính cuối file; lưới 6 ô kính SixTiles sáng theo câu đã mô tả rõ, câu hỏi trượt vào khi chuyển câu nhờ key=step, thanh tiến độ ống kính có dòng sáng chảy, lựa chọn/nút/ô nhập kính); Thư viện 300 (LibraryStats: 5 ô kính + ống tỉ lệ Đạt/Tình huống/Chưa đạt; thanh lọc, thẻ điện thoại, bảng, phân trang, hộp hồ sơ dùng .sa-glass; hàng Đạt có vạch xanh trái; bỏ ảnh khối lập phương ở đầu trang). Lưu ý: CSS trong index.css nằm ngoài layer nên .sa-glass thắng các lớp bg-* của Tailwind và đặt position: relative. Đợt 4 (30/10): bản đồ đảo — vật liệu kính gom vào `src/game/world/glassKit.ts` (rimMaterial, glassMaterial, glassLathe, studioEnv, glow) dùng chung cho StartScenes3D và IslandHub3D; mặt đảo phiến kính xanh trầm + lõi sáng, thân pha lê tối có viền fresnel + đường nối sáng, cây thành mảnh pha lê, đảo xa và đá vụn thành pha lê, cầu ván kính có đốm sáng chạy dọc tay vịn (buildBridge trả Spin), SA bot vỏ ngọc trai + mặt kính tối + quầng sáng; scene.environment = studioEnv với environmentIntensity 0.55. Nhãn, bong bóng, lời dẫn, menu dùng .sa-glass-dark (không backdrop-filter vì cảnh 3D chạy liên tục bên dưới). .sa-glass không còn đặt position (từng đè absolute/sticky của Tailwind); GlassCard tự thêm relative. Chưa đo được thời gian dựng bản đồ trên máy thật. Chỉnh theo góp ý Leon 30/10 ("chưa đẹp, trống nhiều"): mỗi đảo một màu nhấn (ACCENTS: Bắt đầu xanh ngọc, Vì sao xanh dương, Sáu ô tím, Thư viện vàng, Lộ trình bạc hà, Thành viên hồng) cho lõi, viền, quầng, mảnh pha lê; mặt kính trầm hơn, bloom 0.5; makeLayout nhận tỉ lệ khung, màn rất ngang giãn cột (12 → 13.5 → 15.5); phông nền 16 đảo pha lê nhỏ + 6 cột pha lê rải theo trục ngang màn hình phía sau cụm đảo, nền trời có tinh vân màu. Vật mốc trên đảo làm lại 30/10 (Leon thấy bản cũ ghép khối đá xấu): mỗi đảo một khối kính lớn nhuộm màu nhấn, phóng 1,3 lần, bệ kính tối — Bắt đầu = phễu kính có bi xoáy rơi, Vì sao = quả cầu kính + vòng bi (vài viên sáng), Sáu ô = 6 khối kính 3×2 lần lượt sáng và nhấc lên, Thư viện = tủ kính chứa tường ô màu kết quả thật (paintLibrary giữ nguyên), Lộ trình = cột kính bậc thang xoắn có đốm sáng leo, Thành viên = cổng vòm kính màn sáng hồng. Bỏ hàm stone/frame cũ. Còn lại sau đợt 4: (bản đồ đảo), Lộ trình 18 tháng chờ bên kia sửa xong Vault.tsx. Chế độ sáng (soát lại 30/10 bằng nút đổi giao diện thật): nền sáng đúng, báo lỗi nền tối trước đó là do thử bằng cách gắn lớp CSS tay. Đã sửa logo (chữ Strategy trắng) bằng viên nền tối ở chế độ sáng. Trang Vì sao cần đo (HomeStitch.css) chưa có bản sáng, vẫn nền tối. Lộ trình 18 tháng / Hồ sơ nghiên cứu (Vault.tsx, 30/10): bên kia đã viết lại trang (GlassCard, 3 báo cáo + 8 hồ sơ, hộp nhận PDF) và Leon báo đã xong; mình làm nốt phần còn kiểu cũ sang kính (4 ô danh mục, nút lọc, nút mở/đóng, khung công thức, khung nội dung, khung liên hệ Strategy Audit màu bạc hà, hộp hồ sơ chi tiết và hộp nhận PDF dùng sa-glass-solid, ô nhập kính). Commit này gồm cả phần bên kia sửa trong Vault.tsx. Soát UX/UI 30/10, sửa nhóm 1+2: bỏ thanh CHƯƠNG trong ScrollAnimationEngine (đồ cũ của trang chủ trước); Navbar bỏ biểu tượng dưới xl và nút gọi tắt "6 ô" để không tràn ở 1024–1279px, thêm nút Menu (dưới lg) mở đủ 7 trang theo HUB.islands; NextStep nằm trong Suspense nên chờ trang tải xong mới hiện; tên thống nhất "Tự kiểm tra 6 ô" (gọn: "6 ô") và "Thư viện 300"; menu bản đồ theo thứ tự 6 đảo, có Bắt đầu ở đây, bỏ chữ "Bản đọc", hiện ngang từ lg; đảo Hồ sơ nghiên cứu có vật mốc mới (chồng tấm hồ sơ kính, tấm trên lật chậm, kính lúp); phễu đảo Bắt đầu bớt chói; Sáu Ô bỏ tô sáng sai mục "Về bản đồ". Commit gồm luôn thay đổi nhỏ của bên kia trong Navbar.tsx (mục Hồ sơ nghiên cứu) và journey.ts (đổi tên đảo 5). Câu chữ nhóm 3 (Leon duyệt 30/10): Thư viện có dòng giải thích hai kỳ chấm (kỳ 1 2019–2023, kỳ 2 2024–2026), cột "Chấm kỳ 2 / Số năm có lời (kỳ 1) / Số lệnh đã đo", trạng thái hiện qua KY2_LABEL (lãi lại → có lời lại, vẫn rớt → vẫn không đạt; dữ liệu giữ giá trị gốc), "Bản đánh chiều ngược lại" thay "Biến thể đối ứng"; Vì sao cần đo bỏ "ngoài mẫu/năm dương/anh"; bỏ chữ trade; giữ nguyên "Membership 100 đô một tháng. Tháng đầu 50." (câu chuẩn của Leon); Hồ sơ nghiên cứu đổi 3 tiêu đề báo cáo + dòng "Nói đơn giản" (bảng PLAIN theo id) ở thẻ và hộp chi tiết; trang 404 (components/NotFound.tsx, tab notfound trong parseCurrentRoute). Commit này gồm cả các sửa công thức chưa commit của bên kia trong Vault.tsx. Chế độ sáng (góp ý Leon 30/10): bản đồ luôn tối (IslandHub3D tạm bỏ lớp light trên <html> khi mở, trả lại khi rời); index.css đổi chữ xanh ngọc/bạc hà/vàng nhạt sang tông đậm ở chế độ sáng; Sáu Ô và Vì sao cần đo có bộ màu sáng riêng (html.light .sa-six-app / .sa-home); đã đo độ tương phản chữ–nền bằng script trên các trang, các chỗ dưới 3:1 đã sửa (nút xanh, số 39/188, số 40 thư viện, dòng tiến độ Sáu Ô). Lưu ý thử: khung trình duyệt chạy ngầm làm hiệu ứng chuyển màu đứng giữa chừng. Cảnh 3D ở `src/game/world/StartScenes3D.tsx` + `miniScene.ts` (chỉ vẽ khi đang trong khung nhìn). Chữ ở `START_HERE`. Trang này không cộng Điểm Đo nữa; `JourneyPage.tsx` + `JourneyStages.tsx` giữ lại, không còn gắn đường dẫn.

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
