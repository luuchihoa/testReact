

## 🚀 PROMPT TỔNG THỂ: THIẾT KẾ UI/UX DASHBOARD QUẢN LÝ HỌC SINH (ENTERPRISE)

### 1. BỐ CỤC CHUNG (LAYOUT STRUCTURE)

**Layout:** 2 cột (Left Sidebar + Main Content Area).

* **Left Sidebar (Navigation - Fixed):**
* Tông màu: Dark Mode `bg-[#1C1917]`.
* Trên cùng: Logo Ban Giáo Lý (uy nghi), tên hệ thống `font-serif text-amber-50`: "BGL - An Ngãi".
* Menu items: Home, Quản lý Học Sinh (Active), Quản lý Lớp/Dạy (Teacher), Bài Viết, Thông Báo, Cài Đặt.


* **Main Content Area (Fluid):**
* Tông màu: Light Mode `bg-[#FDFBF7]`.
* Header (Kính mờ - Floating): Thanh tìm kiếm toàn cầu, icon thông báo (kèm số count từ `get_unread_notification_count`), Avatar user (bo tròn, click mở dropdown profile).



### 2. PHẦN NỘI DUNG CHÍNH: QUẢN LÝ HỌC SINH (MAIN CONTENT)

#### A. Tiêu đề Section (Header Section)

* Theo Code mẫu C: Nhãn phụ "QUẢN TRỊ HỆ THỐNG", Tiêu đề chính `font-serif`: "Danh sách Học sinh Giáo lý", Mô tả: "Bảng điều khiển tập trung để quản lý thông tin, enrollment và kết quả học tập."
* Right side: Nút "Thêm học sinh mới" (Primary Button - code mẫu D) và nút "Xuất dữ liệu / Báo cáo" (Secondary Button - code mẫu E).

#### B. Thẻ tóm tắt hiệu suất (Summary Cards - Glassmorphism)

* Một hàng gồm 4 thẻ `Glassmorphism Card` (code mẫu B, bo góc `rounded-[28px]`, nền mờ `backdrop-blur-xl`).
* Thẻ 1: Tổng học sinh (Số lớn `font-serif`).
* Thẻ 2: Học sinh mới nhập học (Năm học `current_nam_hoc`).
* Thẻ 3: Biểu đồ tròn nhỏ: Tỷ lệ Học lực (Giỏi/Khá/TB).
* Thẻ 4: Tỷ lệ Chuyên cần trung bình (dựa trên `attendance`).

#### C. Bộ lọc nâng cao (Advanced Filters)

* Nằm trong một `Glassmorphism Card` mỏng.
* Giao diện input: Nền trắng, bo góc `rounded-xl`, viền mỏng.
* Các input filter (dựa trên Schema):
1. Tìm kiếm nhanh (Tên, Username, SĐT).
2. Dropdown Lớp học (map từ `enrollments`).
3. Dropdown Năm học (default: `current_nam_hoc`).
4. Dropdown Trạng thái ('Đang học', 'Nghỉ học', 'Hoàn thành').


* Nút "Áp dụng bộ lọc" (Primary) và "Xóa bộ lọc" (Secondary).

#### D. Bảng dữ liệu học sinh (The "Enterprise" Data Table)

* Đây là trái tim của trang, cần hiệu suất cao, hỗ trợ phân trang (pagination), sắp xếp (sorting).
* Đặt trong một `Glassmorphism Card` lớn.
* **Cấu trúc cột bảng:**
* [Checkbox (Chọn nhiều)]
* Avatar + Họ và tên (Click vào mở Modal chi tiết profile)
* Username
* Lớp (`enrollments.lop`)
* Giới tính
* Giáo xóm
* Điểm TB Học kỳ (`grades.diem_tb`) / Học lực Năm (`year_summary.hoc_luc`)
* Trạng thái (dùng Badge in hoa, bold: Xanh - Đang học, Đỏ - Nghỉ, Vàng - Hoàn thành).
* Thao tác (Icon: Sửa, Xem điểm, Quản lý Enrollment).


* **Hiệu ứng & Tương tác (Transition/Animation):**
* Hover dòng: `md:hover:-translate-y-0.5 md:hover:bg-amber-900/5` (mượt mà).
* Click: `active:scale-[0.98]`.
* Phân trang (Pagination) dưới đáy bảng: Hiển thị "1-50 của 1,644 học sinh".



### 3. TÍNH NĂNG MỞ RỘNG (SCALABLE & ENTERPRISE)

#### A. Bulk Actions Toolbar (Tự động xuất hiện khi chọn nhiều dòng)

* Thanh toolbar kính mờ `bg-amber-900/90 text-amber-50` nổi lên phía trên bảng.
* Các thao tác nhanh cho nhóm học sinh: "Chuyển lớp", "Khóa sổ điểm" (nếu là Admin), "Cập nhật hạnh kiểm Bulk", "Xuất hồ sơ hàng loạt".

#### B. Modal chi tiết học sinh (Hồ sơ 360 độ)

* Click vào tên học sinh mở Modal lớn.
* Layout Modal: 2 cột (Trái: Avatar, Thông tin cá nhân/Gia đình, `users` table; Phải: Tabbed interface).
* **Các Tab inside Modal:**
* Tab 1: **Enrollment & Lớp học:** Quá trình học qua các năm (từ `enrollments`).
* Tab 2: **Kết quả học tập:** Bảng điểm HK1, HK2, TB Năm (từ `grades`, `term_summary`, `year_summary`). Tích hợp biểu đồ đường thể hiện sự tiến bộ.
* Tab 3: **Chuyên cần:** Lịch calendar highlight các ngày nghỉ (từ `attendance`).
* Tab 4: **Lịch sử thay đổi (Audit Log):** Hiển thị lịch sử sửa điểm (từ `grades_audit`), ai sửa, sửa lúc nào.



### 4. GIAO DIỆN MOBILE & RESPONSIVE

* **Navigation:** Sidebar chuyển thành Hamburger menu.
* **Bảng dữ liệu:** Chuyển sang dạng Danh sách thẻ (Card list) mượt mà. Mỗi thẻ đại diện cho một học sinh.
* **Bulk Actions:** Chuyển thành nút Floating Action Button (FAB) ở góc dưới.
* **Vùng chạm (Hit Targets):** Đảm bảo tất cả nút bấm và input tối thiểu `44px` chiều cao.
* **Animation Mobile:** Sử dụng `whileInView` với `margin: "-40px"` và `once: true` để tối ưu hiệu suất cuộn trên thiết bị yếu. Giảm biên độ di chuyển `y` xuống 16px thay vì 32px trên desktop.