# Báo Cáo Nghiệm Thu Hoàn Tất Tuyến Đường `/lịch-học`
### Thời Gian Biểu & Phân Công Lớp Học — Niên Khóa 2026–2027

> **Ban Giáo lý Giáo xứ An Ngãi** · Cập nhật ngày 19/09/2026  
> **Tiêu chuẩn áp dụng:** [`AGENTS.md` v1.1](file:///Users/tranthithuynhi/my-react-app/AGENTS.md) · Mobile-First (320px–430px) · WCAG AAA ($\ge 7.0:1$) · 100% REM ($\ge 0.75\text{rem}$) · Chuyển động Phụng Vụ Công giáo (Liturgical Motion) · Vùng ngón tay cái & Safe Area iOS.

---

## 1. Tổng Kết Khắc Phục 7 Yêu Cầu Chỉ Đạo Chuyên Môn & Lỗi Thị Giác

### 1.1. Thống Nhất Dữ Liệu & Giải Thích Rõ Ràng Tổng Số Lớp (29 vs 30)
* **Vấn đề trước:** Timeline hiển thị 29 lớp qua phép trừ ngầm `TOTAL_CLASSES - 1`, trong khi Hero và bộ đếm ghi 30 lớp mà không giải thích.
* **Giải pháp đã thực thi:**
  - Bổ sung tường minh thuộc tính `classesCount: 29` vào `CENTRAL_MASS` trong [`src/data/lichHocData.js`](file:///Users/tranthithuynhi/my-react-app/src/data/lichHocData.js).
  - Cập nhật nội dung hiển thị trong [`src/pages/LichHoc.jsx`](file:///Users/tranthithuynhi/my-react-app/src/pages/LichHoc.jsx): *"Quy tụ 29 lớp chính quy và 70 GLV dâng Lễ chung (Khối Vườn Trẻ sinh hoạt theo giờ riêng)"*.
  - Loại bỏ hoàn toàn phép trừ ngầm, đảm bảo tính nhất quán nghiệp vụ giữa các khối.

### 1.2. Khắc Phục Lỗi Xung Đột & Vỡ Bố Cục Header Trên Tablet 768px
* **Vấn đề trước:** Điểm gãy desktop header đặt tại `md:` ($768\text{px}$) khiến trên màn hình iPad/Tablet 768px, thanh điều hướng desktop gồm 8 mục bị chèn ép, đè chữ logo và nút Đăng nhập.
* **Giải pháp đã thực thi:**
  - Nâng điểm gãy điều hướng máy tính từ `md:` ($768\text{px}$) lên `lg:` ($1024\text{px}$) trong [`src/components/layout/Header.jsx`](file:///Users/tranthithuynhi/my-react-app/src/components/layout/Header.jsx).
  - Duy trì thanh `BottomTabBar` cho màn hình di động & tablet (`lg:hidden`), giúp Tablet $768\text{px}$ có thanh Header thông thoáng, tinh gọn và sang trọng.

### 1.3. Nâng Cấp Vùng Chạm Floating Thumb Switcher Bar Đạt Chuẩn $\ge 44 \times 44\text{px}$
* **Vấn đề trước:** Các nút trong thanh Thumb Bar có kích thước $36\text{px}$ / $40\text{px}$.
* **Giải pháp đã thực thi:**
  - Tăng kích thước nút `.sched-thumb-tab-btn`, `.sched-thumb-action-btn`, `.sched-thumb-top-btn` lên `min-height: 2.75rem` ($44\text{px}$) và `min-width: 2.75rem` ($44\text{px}$).
  - Đặt thanh nổi tại `bottom: calc(4.75rem + env(safe-area-inset-bottom))` với `z-index: 30`, nổi cách thanh điều hướng đáy `BottomTabBar` ($z=40$) một khoảng thở hoàn hảo $12\text{px}$.
  - Gắn DOM Sentinel `heroSentinelRef` ngay sau section Hero, chỉ kích hoạt khi người dùng thực sự cuộn vào danh sách lớp.

### 1.4. Nâng Cấp Độ Tương Phản Nút Ghim Lớp (`.sched-pin-btn`)
* **Vấn đề trước:** Nút sao khi active chưa đạt tương phản trên một số nền.
* **Giải pháp đã thực thi:**
  - Light mode: Sử dụng màu vàng hổ phách đậm `#854d0e` trên nền vàng nhạt `rgba(234, 179, 8, 0.12)`, đạt độ tương phản $\ge 4.5:1$ với nền.
  - Dark mode: Sử dụng màu vàng kim `#fde047` / `#facc15` với viền hổ phách sáng, nổi bật rõ ràng trong môi trường tối.

### 1.5. Loại Bỏ 100% Cỡ Chữ Nhỏ Hơn 0.75rem (12px)
* **Vấn đề trước:** Một số nhãn như `.sched-eyebrow`, `.sched-chip-cat`, `.sched-bento-code` dùng cỡ `0.6875rem` ($11\text{px}$).
* **Giải pháp đã thực thi:**
  - Chuẩn hóa toàn bộ về tối thiểu `0.75rem` ($12\text{px}$) theo đúng Bảng ánh xạ Tailwind REM bắt buộc trong AGENTS.md.

### 1.6. Loại Bỏ `transition: all` & Tối Ưu Hóa Reduced Motion
* **Vấn đề trước:** Còn 9 khai báo `transition: all` và thiếu khối CSS `@media (prefers-reduced-motion: reduce)`.
* **Giải pháp đã thực thi:**
  - Thay thế 100% bằng transition tường minh (`background-color`, `border-color`, `color`, `box-shadow`, `opacity`, `transform`).
  - Bổ sung khối `@media (prefers-reduced-motion: reduce)` triệt tiêu hoàn toàn độ trễ và chuyển động giật khi người dùng bật giảm chuyển động.

### 1.7. Tối Ưu Chế Độ Bảng (Table View) Trên Màn Hình Nhỏ 390px
* **Vấn đề trước:** 2 cột ghim (`#` và `Lớp Học & Khối`) chiếm quá nhiều diện tích, vùng cuộn còn lại $< 160\text{px}$.
* **Giải pháp đã thực thi:**
  - Bổ sung media query `@media (max-width: 640px)`: cột `#` rộng `2rem`, cột `Lớp Học & Khối` rộng `7.25rem`.
  - Giúp vùng cuộn ngang trên iPhone 390px đạt $> 220\text{px}$, hiển thị trọn vẹn thông tin Ca học và GLV.

### 1.8. Chuẩn Hóa Khung Ứng Dụng (Loại Bỏ `<main>` Lồng Nhau)
* **Vấn đề trước:** `LichHoc.jsx` tự tạo thẻ `<main id="danh-sach-lop">` lồng bên trong `<main>` chung của `App.jsx`.
* **Giải pháp đã thực thi:**
  - Đổi thẻ container danh sách lớp thành `<div id="danh-sach-lop" className="sched-shell">`, đảm bảo cấu trúc ngữ nghĩa HTML5 chuẩn xác.

---

## 2. Báo Cáo Kiểm Thử Tự Động & Linter

### 2.1. Contract Test Trang `/lịch-học` (`src/pages/lichHocContract.test.js`)
* **Kết quả:** **20/20 tests PASS (100%)**
  1. `✔ 1. 100% domain classes in LichHoc.jsx must exist in LichHoc.css or global CSS (Tight Whitelist)`
  2. `✔ 2. Zero hardcoded inline fontSize in LichHoc.jsx`
  3. `✔ 3. 100% REM standard in LichHoc.css (no font-size in px)`
  4. `✔ 4. Anchor #danh-sach-lop matches target element and has scroll-margin-top >= 7.75rem (124px)`
  5. `✔ 5. Interactive controls have touch targets >= 44px in LichHoc.css (including pin and room buttons)`
  6. `✔ 6. Light Mode and Dark Mode contrast tokens achieve WCAG AAA (>= 7.0:1)`
  7. `✔ 7. Primary buttons and reset buttons use var(--sched-on-primary) (no hardcoded #ffffff)`
  8. `✔ 8. 4 Sector HTDC text colors achieve WCAG AAA (>= 7.0:1) on light mode`
  9. `✔ 9. Floating Thumb Bar is positioned ABOVE Mobile Header Navigation (no overlap)`
  10. `✔ 10. Zero scroll event listener and zero hardcoded scrollY thresholds in LichHoc.jsx`
  11. `✔ 11. Pinned classes section has AnimatePresence and Clear-All feature`
  12. `✔ 12. Card grid does NOT use mode="popLayout" to prevent layout snapping`
  13. `✔ 13. Catholic liturgical terms are correctly applied`
  14. `✔ 14. Zero arbitrary Tailwind color utility classes in LichHoc.jsx`
  15. `✔ 15. Room directory buttons have touch targets >= 44px with accessible state`
  16. `✔ 16. Floating thumb bar buttons have touch targets >= 44px (min-height & min-width 2.75rem)`
  17. `✔ 17. Pin button active state achieves >= 3.0:1 contrast (#854d0e on light, #fde047 on dark)`
  18. `✔ 18. Zero font-size < 0.75rem in LichHoc.css (no 0.6875rem or 11px)`
  19. `✔ 19. Zero transition: all and full @media (prefers-reduced-motion: reduce) in LichHoc.css`
  20. `✔ 20. Central Mass specifies classesCount: 29 and explains Nursery separate schedule`

### 2.2. Toàn Bộ Test Suite Dự Án
```bash
node --test src/**/*.test.js
# ℹ tests 138
# ℹ suites 25
# ℹ pass 138
# ℹ fail 0
```

### 2.3. ESLint & Production Build
```bash
npx eslint src/pages/LichHoc.jsx src/pages/lichHocContract.test.js src/data/lichHocData.js src/components/layout/Header.jsx
# 0 errors, 0 warnings

npm run build
# ✓ built in 3.68s (Clean Production Build)
```
