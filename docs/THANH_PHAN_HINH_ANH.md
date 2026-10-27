# Thành phần hình ảnh cho bản đồ đảo 3D

*Leon · Strategy Audit · 27/10/2026*

> **Cập nhật 27/10:** Leon chốt chưa cần model 3D từ ngoài. Sáu vật mốc đã được dựng bằng code theo bộ hình LM-01…06. File này giữ lại để dùng khi muốn nâng tiếp: Đợt 1 (icon, Leon dẫn đường, nền) vẫn đáng làm.

File này liệt kê mọi hình ảnh và model mà bản đồ đảo cần. Leon đưa từng mục cho Gemini tạo. Khung bản đồ đã chạy được bằng khối dựng sẵn trong code (`src/game/world/JourneyWorld3D.tsx`), nên mỗi asset làm xong thì thay vào từng cái một, không phải chờ đủ bộ.

---

## 1. Luật chung cho mọi asset

**Phong cách:** low-poly isometric, kiểu diorama đảo nổi, cảnh đêm, viền sáng neon, mặt phẳng sạch, bóng mềm.

**Bảng màu** (lấy từ thumbnail kênh):

| Vai trò | Mã màu |
|---|---|
| Nền trời | `#040914` |
| Quầng sáng | `#00486b` |
| Viền sáng | `#3df2ff` |
| Nhấn chuyển sắc | `#FFDD00 → #2BFFEA` |
| Cỏ mặt đảo | xanh ngọc đậm `#1e6f62` |
| Đá đáy đảo | xám xanh `#252b38` |

**Cấm trên mọi asset** (luật kênh):
- nến, biểu đồ giá, đường equity, mũi tên đi lên
- vàng thỏi, núi vàng, đồng xu, ký hiệu $ hay ₫
- toà nhà có bảng giá chứng khoán, màn hình chạy số
- chữ trên vật thể: chữ do code đặt lên để sửa được và đúng tiếng Việt
- logo của bên khác

Bản sheet Gemini vừa tạo vẫn dính nến, toà nhà bảng giá, núi vàng và tên đảo theo kiểu Dữ liệu/Thuật toán/Giao dịch. Bản đó chỉ giữ **phong cách**, còn nội dung đảo phải làm lại theo mục 3.

**Câu nền dán đầu mọi prompt:**
```
Stylized low-poly isometric 3D game asset, night scene, floating island diorama style,
dark navy background #040914, cyan neon rim light #3df2ff, deep teal and slate colors,
soft shadows, clean edges, single object centered, 3/4 isometric view, no text, no logo,
no candlestick, no chart, no coin, no gold, no arrow.
```

**Gemini chỉ ra ảnh, chưa ra model 3D.** Có 2 loại asset:
- **Ảnh 2D** (icon, nhân vật dẫn đường, nền): dùng thẳng ảnh Gemini.
- **Model 3D** (vật mốc trên đảo, nhân vật người chơi, cây, đá): Gemini vẽ ảnh tham chiếu → đưa ảnh vào công cụ chuyển ảnh thành 3D (Meshy, Tripo hoặc Hunyuan3D) → xuất `.glb` → Antigravity nén lại rồi bỏ vào `public/models/`.

---

## 2. Thông số kỹ thuật

| Loại | Định dạng | Kích thước | Dung lượng tối đa |
|---|---|---|---|
| Icon giao diện | SVG, hoặc PNG nền trong suốt | 256×256 | 30 KB |
| Nhân vật dẫn đường | PNG nền trong suốt → WebP | 512×512 | 80 KB / ảnh |
| Nền trời | WebP | 1920×1080 + bản dọc 1080×1920 | 150 KB / ảnh |
| Model vật mốc | GLB (nén Draco hoặc meshopt), texture WebP 1024 | ≤ 5.000 tam giác | 250 KB |
| Model nhỏ (cây, đá, tinh thể) | GLB, texture 512 | ≤ 1.500 tam giác | 80 KB |
| Nhân vật người chơi | GLB, có sẵn động tác đi và đứng | ≤ 3.000 tam giác | 250 KB |

Model 3D phải tuân thủ:
- Trục Y hướng lên, 1 đơn vị = 1 mét, gốc toạ độ đặt ở **giữa đáy** vật.
- Vật mốc nằm gọn trong hộp 3×3×3.
- Nếu làm lại cả hòn đảo: mặt cỏ **phẳng** đường kính 6,4, mặt trên ở độ cao 0,3. Người chơi đi trong bán kính 2,75 tính từ tâm, nên vùng đó không đặt vật cản.
- Cả bộ model chỉ tải khi người chơi bấm mở bản đồ, tổng không quá 2 MB.

---

## 3. Danh sách asset

Thứ tự ưu tiên:
- **Đợt 1:** làm ngay, chỉ cần Gemini.
- **Đợt 2:** sáu vật mốc và nhân vật, cần thêm bước chuyển ảnh thành 3D.
- **Đợt 3:** trang trí.

### Đợt 1 · Ảnh 2D

| Mã | Tên | Dùng ở đâu | Mô tả cho Gemini |
|---|---|---|---|
| UI-01 | Icon Điểm Đo | Góc trên trái, cạnh số điểm | Viên lục giác phát sáng xanh ngọc, giữa có vạch chia như thước đo. **Không phải đồng xu.** |
| UI-02 | Icon Bài học | Thanh công cụ góc dưới phải | Cuốn sách mở, nét neon xanh |
| UI-03 | Icon Thử thách | Thanh công cụ | Ba lá bài xoè, một lá sáng hơn |
| UI-04 | Icon Hồ sơ của tôi | Thanh công cụ | Bìa hồ sơ có nhãn trống, nét neon |
| UI-05 | Icon Thành tích | Thanh công cụ | Huy hiệu lục giác có dải ruy băng, không ngôi sao vàng |
| UI-06 | Icon Nhiệm vụ | Ô nhiệm vụ góc phải | Bảng kẹp giấy có hai ô tick |
| UI-07 | Khung bảng tên đảo | Nhãn "Màn 1 · Khái niệm" | Tấm biển lơ lửng viền neon, ruột trống để code đặt chữ |
| CH-01 | Leon dẫn đường, 3 biểu cảm | Ô lời thoại dưới màn hình | Chân dung chibi từ ảnh thật của Leon, áo tối màu, nền trong suốt. Ba nét mặt: chào, giải thích, chúc mừng. **Leon gửi 1–2 ảnh chân dung cho Gemini làm mẫu.** |
| BG-01 | Nền trời đêm | Phía sau toàn bộ bản đồ | Trời xanh đen `#040914`, lưới mảnh mờ phía dưới, hạt sáng li ti. Không hành tinh, không chữ. |

### Đợt 2 · Sáu vật mốc trên đảo + nhân vật (model 3D)

Mỗi đảo một vật mốc, đặt giữa mặt đảo. Nội dung theo hành trình của mình.

| Mã | Đảo | Vật mốc | Mô tả cho Gemini |
|---|---|---|---|
| LM-01 | Màn 1 · Khái niệm | Trạm khởi hành | Ba bệ nhỏ xếp vòng cung: cuốn sách mở (Học), thước đo có kim (Đo), bàn làm việc nhỏ (Thực hành). Giữa có viên tinh thể câu hỏi phát sáng. |
| LM-02 | Màn 2 · Vì sao kiểm định | Phòng thi | Bục đá có ba lá bài lớn dựng đứng xoè quạt, mặt bài để trống. Cạnh đó là một con dấu lớn kiểu đóng mộc. |
| LM-03 | Màn 3 · Sáu Ô | Tổ ong sáu ô | Sáu khối lục giác xếp hai hàng, mỗi ô một khe sáng, nổi trên bệ thấp. Có thêm **cổng khoá** nhỏ ở mép đảo: khung cổng với ổ khoá lục giác. Đây là cổng để lại Zalo. |
| LM-04 | Màn 4 · Thư viện 300 | Toà lưu trữ | Toà nhà khối vuông thấp, mặt trước là bức tường nhiều ngăn kéo hồ sơ nhỏ, vài ngăn phát sáng xanh ngọc. **Không màn hình, không biểu đồ.** |
| LM-05 | Màn 5 · Kiếm thêm điểm | Trạm nhiệm vụ | Cột tín hiệu thanh mảnh, ba vòng lục giác xoay quanh, chân cột có bảng nhiệm vụ trống. |
| LM-06 | Màn 6 · Thành viên | Cổng cuối | Cổng vòm cao phát sáng mạnh nhất cả bản đồ, mặt cổng là lớp sáng mờ xanh ngọc. |
| CH-02 | Người chơi | Nhân vật đi trên đảo | Nhân vật chibi đeo balo, áo khoác xanh đậm, kính visor xanh ngọc. Cần động tác đứng thở và đi bộ. |
| BR-01 | Cầu đã mở | Nối hai đảo | Cầu ván treo cong nhẹ, dây hai bên phát sáng xanh, dài khoảng 4 mét, rộng 1,2 mét. |
| BR-02 | Cầu đang khoá | Nối tới đảo chưa mở | Cùng cây cầu nhưng gãy giữa, ván rơi rụng, dây tắt, màu xám. |

### Đợt 3 · Trang trí

| Mã | Tên | Mô tả |
|---|---|---|
| PR-01 | Bộ cây low-poly | 3 kiểu cây lá kim xanh ngọc đậm, cao 0,7–1,3 mét |
| PR-02 | Bộ tinh thể | 3 cụm tinh thể phát sáng xanh |
| PR-03 | Đá vụn lơ lửng | 4 tảng đá nhỏ, mặt dưới nhọn |
| PR-04 | Biển chỉ đường | Cột gỗ có 2 tấm biển trống, không chữ |
| PR-05 | Hộp hồ sơ | Hộp nắp lật, bên trong có vài tập hồ sơ phát sáng. Dùng khi mở hồ sơ bằng điểm. |
| PR-06 | Đèn lồng | Đèn đứng nhỏ ánh xanh, đặt dọc đầu cầu |

---

## 4. Cách bàn giao

1. Đặt tên file đúng mã, ví dụ `LM-02_phong-thi.glb`, `UI-01_diem-do.svg`.
2. Ảnh 2D bỏ vào `public/game/ui/`, model bỏ vào `public/models/`.
3. Ghi một dòng vào `HANDOFF.md`: mã nào đã xong, dùng công cụ nào để chuyển ảnh thành 3D.
4. Code sẽ thay khối dựng sẵn bằng model theo mã. Mã nào chưa có thì vẫn dùng khối cũ, bản đồ không bị hỏng.

**Kiểm trước khi bàn giao:**
- Không có thứ nào trong danh sách cấm ở mục 1.
- Đúng dung lượng ở mục 2.
- Model 3D mở được bằng trang xem glTF trên trình duyệt mà không lỗi.
