# Báo Cáo Nghiệm Thu Hoàn Thành Chuẩn Hóa 6 Trang Khối Giáo Lý (Giai Đoạn 5A – 5G.4)

> **Ban Giáo lý An Ngãi** · Cập nhật ngày 19/09/2026  
> **Tiêu chuẩn áp dụng:** `AGENTS.md` Phiên bản 1.1 · Mobile-First · WCAG AAA · 100% REM · Catholic Domain Integrity

---

## 1. Tổng Quan Kết Quả Thực Hiện

Giai đoạn 5 đã hoàn thành toàn diện các phân kỳ từ 5A đến 5G.4, đồng bộ hóa và khôi phục cấu trúc phân tầng chuẩn mực cho toàn bộ **6 trang khối Giáo lý** trong hệ thống website Ban Giáo lý Xứ đoàn An Ngãi:
1. [KhoiChienCon.jsx](file:///Users/tranthithuynhi/my-react-app/src/pages/KhoiChienCon.jsx) (`/khối-chiên-con` · Ngành Chiên Con · Mầm non – Lớp 2 · 5–7 tuổi)
2. [KhoiRuocLe.jsx](file:///Users/tranthithuynhi/my-react-app/src/pages/KhoiRuocLe.jsx) (`/khối-rước-lễ` · Ngành Ấu Nhi · RLLĐ 1 & 2 · 8–9 tuổi)
3. [KhoiThemSuc.jsx](file:///Users/tranthithuynhi/my-react-app/src/pages/KhoiThemSuc.jsx) (`/khối-thêm-sức` · Ngành Thiếu Nhi · Thêm Sức 1 & 2 · 10–11 tuổi)
4. [KhoiPhungVu.jsx](file:///Users/tranthithuynhi/my-react-app/src/pages/KhoiPhungVu.jsx) (`/khối-phụng-vụ` · Ngành Nhiệt Quang · Phụng Vụ / Lớp 7 · 12 tuổi)
5. [KhoiKinhThanh.jsx](file:///Users/tranthithuynhi/my-react-app/src/pages/KhoiKinhThanh.jsx) (`/khối-kinh-thánh` · Ngành Nhiệt Quang · Kinh Thánh 1 & 2 / Lớp 8–9 · 13–14 tuổi)
6. [KhoiVaoDoi.jsx](file:///Users/tranthithuynhi/my-react-app/src/pages/KhoiVaoDoi.jsx) (`/khối-vào-đời` · Ngành Chinh Chiến · Vào Đời 1 & 2 / Lớp 10–11 · 15–16 tuổi)

---

## 2. Chi Tiết Các Hạng Mục Chuẩn Hóa Theo Tiêu Chuẩn AGENTS.md v1.1

### 2.1. Khôi Phục Cấu Trúc Phân Tầng Cấp Lớp Chuẩn Mực (Giai Đoạn 5G.1 – 5G.4)
- **Mẫu tham chiếu chuẩn mực:** Kế thừa trọn vẹn từ [`KhoiRuocLe.jsx`](file:///Users/tranthithuynhi/my-react-app/src/pages/KhoiRuocLe.jsx) và [`KhoiThemSuc.jsx`](file:///Users/tranthithuynhi/my-react-app/src/pages/KhoiThemSuc.jsx).
- **Cấu trúc phân tầng đồng bộ:**
  - `<div className="khoi-group-block">`: Bao bọc từng cấp lớp riêng biệt.
  - `<div className="khoi-stage-header">`: Khung tiêu đề chặng cấp lớp gồm:
    - `<span className="khoi-stage-num">`: Huy hiệu STT chặng (`01`, `02`) — là phần tử trang trí tự co giãn theo cỡ chữ (`min-w-[2rem] min-h-[2rem]`).
    - `<h3 className="khoi-stage-title">`: Tên cấp lớp chuẩn xác.
    - `<p className="khoi-stage-subtitle">`: Phụ đề mô tả chương trình huấn giáo ngắn gọn, không lặp lại tên lớp.
    - `<div className="khoi-stage-pills">`: Dải **4 pills metadata** gọn gàng, dùng chữ thường tự nhiên:
      - `Lớp · độ tuổi` (ví dụ: `Lớp 7 · 12 tuổi`, `Lớp 10 · 15 tuổi`)
      - `Sinh năm {năm_sinh}` (ví dụ: `Sinh năm 2014`, `Sinh năm 2011`)
      - `{số_lớp} lớp` (động từ mảng `classes`, không hardcode danh sách phòng)
      - `Ca 1 · 07:00–07:45`
  - Tách biệt grid từng cấp, tuyệt đối không dùng mảng phẳng `filteredClasses.map()`.

### 2.2. Xử Lý Chi Tiết Theo Từng Khối Lớp
1. **Khối Phụng Vụ ([`KhoiPhungVu.jsx`](file:///Users/tranthithuynhi/my-react-app/src/pages/KhoiPhungVu.jsx)):**
   - Loại bỏ state `selectedGroup`, filter bar 4 nút và live region filter không cần thiết.
   - Render 1 `khoi-group-block` duy nhất với stage header `01` và 4 pills: `Lớp 7 · 12 tuổi`, `Sinh năm 2014`, `3 lớp`, `Ca 1 · 07:00–07:45`.
   - Phụ đề chương trình: `Sống đời phụng vụ, Bí tích và tinh thần phụng sự`.
   - Giữ nguyên mô tả tự nhiên: *"Cơ cấu 3 lớp học với đội ngũ 8 Giáo lý viên tâm huyết đồng hành cùng các em trong giờ học giáo lý và phụng sự bàn thờ."* (tương ứng 8 GLV: C.Hoà, C.Trang, A.Liêu, C.Thảo, A.Vũ, A.Vương, C.Thạnh, A.Thiện hiển thị qua `{totalTeachers}`).
2. **Khối Kinh Thánh ([`KhoiKinhThanh.jsx`](file:///Users/tranthithuynhi/my-react-app/src/pages/KhoiKinhThanh.jsx)):**
   - Bộ lọc 3 nút với `role="group" aria-label="Lọc lớp Khối Kinh Thánh"`.
   - Tách 2 `khoi-group-block` độc lập:
     - **Kinh Thánh 1 (Lớp 8 · 13 tuổi · 3 lớp):** STT `01`, phụ đề `Cựu Ước, lịch sử cứu độ và các sách khôn ngoan`.
     - **Kinh Thánh 2 (Lớp 9 · 14 tuổi · 3 lớp):** STT `02` (bảo toàn STT khi chọn filter `kt2`), phụ đề `Tân Ước, Tin Mừng và cầu nguyện với Lời Chúa`.
3. **Khối Vào Đời ([`KhoiVaoDoi.jsx`](file:///Users/tranthithuynhi/my-react-app/src/pages/KhoiVaoDoi.jsx)):**
   - Thứ tự render sư phạm: **Vào Đời 1 (15 tuổi)** trước (STT `01`), **Vào Đời 2 (16 tuổi)** sau (STT `02`), khắc phục thứ tự raw trong database.
   - Bộ lọc 3 nút với `role="group" aria-label="Lọc lớp Khối Vào Đời"`.
   - Phụ đề chương trình:
     - **Vào Đời 1:** `Youcat, căn tính người trẻ và đời sống đức tin`
     - **Vào Đời 2:** `Docat, ơn gọi và định hướng tương lai`
   - Bổ sung modifier `.khoi-class-grid--two` tinh gọn cho Vào Đời 2 (2 lớp) tại [`khoiBase.css`](file:///Users/tranthithuynhi/my-react-app/src/features/khoi/khoiBase.css):
     ```css
     .khoi-class-grid--two {
       width: 100%;
     }
     @media (min-width: 640px) {
       .khoi-class-grid--two {
         grid-template-columns: repeat(2, minmax(0, 1fr));
         max-width: 52rem;
         margin-inline: auto;
       }
     }
     ```

### 2.3. Chống Tràn Wrap Card Trên Mobile & Kiểm Tra Hồi Quy Toàn Bộ 6 Trang ([`khoiBase.css`](file:///Users/tranthithuynhi/my-react-app/src/features/khoi/khoiBase.css))
- **Vấn đề tiềm ẩn:** Các phòng học có tên dài như `Nhà Họp Xứ · Khu Mục Vụ` (Vào Đời 2/1) và `Nhà Hầm · Khu Thánh Đường` (Phụng Vụ 1/3) có nguy cơ chật dòng tại màn hình 320px hoặc khi người dùng chọn cỡ chữ "Rất lớn" (20px).
- **Giải pháp xử lý:**
  - Áp dụng `flex-wrap: wrap;` cho cả `.khoi-card-head` và `.khoi-card-foot`.
  - Thiết lập `min-width: 0; max-width: 100%;` cho `.khoi-room-badge` và `.khoi-card-time`.
  - Đảm bảo khi không gian hẹp, tên phòng tự động xuống dòng an toàn, không bị cắt xén, không đè chữ và không dùng `overflow-x: hidden`.
- **Kiểm tra hồi quy 6 trang:**
  > Đã kiểm tra hồi quy card lớp của sáu trang tại 390px và 1280px; việc bổ sung `flex-wrap` không làm thay đổi bố cục không mong muốn trên ba trang Chiên Con, Rước Lễ và Thêm Sức.

---

## 3. Bằng Chứng Nghiệm Thu Trực Quan (Visual Evidence Screenshots)

Các ảnh chụp màn hình trực tiếp từ DOM render bằng Puppeteer theo ma trận kiểm thử:

### 3.1. Mobile Viewport (390px — iPhone 12/13/14)
- **Khối Phụng Vụ (390px):** `docs/screenshots/phung-vu-390px.png`  
  *1 block phân tầng duy nhất, 4 pills tự co giãn dòng mượt mà.*
- **Khối Kinh Thánh (390px):** `docs/screenshots/kinh-thanh-390px.png`  
  *Bộ lọc `role="group"` với touch target $\ge 44\text{px}$, 2 block Kinh Thánh 1 và Kinh Thánh 2 phân tầng rõ nét.*
- **Khối Vào Đời (390px):** `docs/screenshots/vao-doi-390px.png`  
  *Trình tự sư phạm Vào Đời 1 (STT `01`) xếp trước Vào Đời 2 (STT `02`).*

### 3.2. Tablet Viewport (768px — iPad Mini / Tablet)
- **Khối Vào Đời 2 (768px):** `docs/screenshots/vao-doi-768px.png`  
  *Lưới 2 cột căn giữa cân đối (`.khoi-class-grid--two` với `max-width: 52rem; margin-inline: auto`).*

### 3.3. Narrow Mobile (320px — iPhone SE 1 / Long Room Wrap Resilience)
- **Phụng Vụ 1/3 (320px):** `docs/screenshots/phung-vu-320px-room-wrap.png`  
  *Tên phòng dài `Nhà Hầm · Khu Thánh Đường` tự động xuống dòng an toàn, không tràn lề.*
- **Vào Đời 2/1 (320px):** `docs/screenshots/vao-doi-320px-room-wrap.png`  
  *Tên phòng dài `Nhà Họp Xứ · Khu Mục Vụ` tự động xuống dòng an toàn, không cắt chữ.*

### 3.4. Desktop Viewport (1280px)
- **Khối Phụng Vụ (1280px):** `docs/screenshots/phung-vu-1280px.png`  
  *Lưới 3 cột chuẩn bento, stage header rộng thoáng.*
- **Khối Kinh Thánh (1280px):** `docs/screenshots/kinh-thanh-1280px.png`  
  *2 nhóm Kinh Thánh 1 và 2 hiển thị song song 2 lưới 3 cột độc lập.*
- **Khối Vào Đời (1280px):** `docs/screenshots/vao-doi-1280px.png`  
  *Vào Đời 1 (3 cột) và Vào Đời 2 (2 cột căn giữa cân xứng).*

---

## 4. Bảng Ma Trận Dữ Liệu & Niên Khóa 6 Khối Giáo Lý (Cố Định 2026–2027)

| Khối | Ngành HTDC | Độ tuổi khuyến nghị | Niên khóa | Số lớp chuẩn | Ca học | Giờ học tập trung | Đăng ký trực tuyến |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Chiên Con** | Chiên Con (Hồng) | 5 – 7 tuổi (2019–2021) | 2026–2027 | 5 lớp | **Ca 2** | Thánh Lễ 08:00 · Giáo lý 09:15–10:00 | Có (`#dang-ky`) |
| **Rước Lễ** | Ấu Nhi (Xanh dương) | 8 – 9 tuổi (2017–2018) | 2026–2027 | 5 lớp | **Ca 2** | Thánh Lễ 08:00 · Giáo lý 09:15–10:00 | Có (`#dang-ky`) |
| **Thêm Sức** | Thiếu Nhi (Xanh lá) | 10 – 11 tuổi (2015–2016) | 2026–2027 | 6 lớp | **Ca 2** | Thánh Lễ 08:00 · Giáo lý 09:15–10:00 | Có (`#dang-ky`) |
| **Phụng Vụ** | Nhiệt Quang (Cam) | 12 tuổi (2014) | 2026–2027 | 3 lớp | **Ca 1** | Giáo lý 07:00–07:45 · Thánh Lễ 08:00 | Có (`#dang-ky`) |
| **Kinh Thánh**| Nhiệt Quang (Cam) | 13 – 14 tuổi (2012–2013) | 2026–2027 | 6 lớp | **Ca 1** | Giáo lý 07:00–07:45 · Thánh Lễ 08:00 | Không (`/tuyển-sinh`) |
| **Vào Đời** | Chinh Chiến (Đỏ) | 15 – 16 tuổi (2010–2011) | 2026–2027 | 5 lớp | **Ca 1** | Giáo lý 07:00–07:45 · Thánh Lễ 08:00 | Không (`/tuyển-sinh`) |

---

## 5. Bằng Chứng Xác Minh Chất Lượng (Verification Evidence)

### 5.1. Unit Tests & Scoped CSS Contract Suite
- **Lệnh chạy:** `node --test src/**/*.test.js`
- **Kết quả:** **118/118 tests ĐẠT** trên **24 test suites** (100% pass, 0 fail, 0 skip).
- **Phạm vi kiểm thử:**
  - `khoiClassContract.test.js` (9 tests): Kiểm tra 100% CSS contract trên 6 entry point, kiểm tra sự hiện diện của các class phân tầng (`khoi-group-block`, `khoi-stage-header`, `khoi-stage-num`, `khoi-stage-title`, `khoi-stage-subtitle`, `khoi-stage-pills`, `khoi-stage-pill`, `khoi-class-grid--two`), và loại trừ class legacy.
  - `enrollmentConfig.test.js` (8 tests): Ma trận tuyển sinh & CTA.
  - `khoiUtils.test.js` (12 tests): Bất biến dataset, niên khóa 2026–2027, tuổi sinh hoạt, timeline Ca 1 & Ca 2, cấu hình ngành.
  - `articleUtils.test.js`, `contactForm.test.js`, `excelAttendanceHelper.test.js`, `excelGradesHelper.test.js`, `gradeAuditUtils.test.js`.

### 5.2. ESLint
- **Lệnh chạy:** `npx eslint src/pages/Khoi*.jsx src/features/khoi/`
- **Kết quả:** **0 errors, 0 warnings**.

### 5.3. Production Build
- **Lệnh chạy:** `npm run build` (Vite 6.4.3 / React 19 / Tailwind CSS 4)
- **Kết quả:** **Thành công 100%** trong `3.97s`.

---

## 6. Kết Luận & Bàn Giao

Giai đoạn 5G.1 – 5G.4 đã hoàn tất toàn diện với đầy đủ bằng chứng kiểm thử tự động, kiểm tra hồi quy 6 trang và bằng chứng ảnh chụp trực quan đa kích thước màn hình. Hệ thống đáp ứng hoàn hảo tiêu chuẩn `AGENTS.md` v1.1.
