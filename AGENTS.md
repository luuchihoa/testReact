# Tiêu chuẩn thiết kế và phát triển — Ban Giáo lý An Ngãi

> Phiên bản 1.1 · Ngày 17/09/2026
> Áp dụng cho agent, lập trình viên và người duyệt thay đổi trong repository này.

## 1. Phạm vi và cách áp dụng

Đọc file này trước khi thiết kế, sửa giao diện hoặc thay đổi luồng sử dụng. Mục tiêu là một website **trang trọng, ấm áp, dễ đọc và dễ thao tác**, phục vụ thiếu nhi, phụ huynh, giáo lý viên và ban quản trị.

- **BẮT BUỘC ƯU TIÊN MOBILE-FIRST:** Mọi thiết kế và sửa đổi giao diện phải đặt trải nghiệm trên màn hình di động (320px – 430px) lên hàng đầu, tối ưu hoàn hảo trên mobile trước khi mở rộng lên Tablet và Desktop.
- **BẮT BUỘC ĐỘ TƯƠNG PHẢN WCAG AAA:** Tương phản văn bản thường phải đạt $\ge 7.0:1$; văn bản lớn $\ge 4.5:1$; viền điều khiển/focus $\ge 3.0:1$ trên cả chế độ Sáng (Light) và Tối (Dark).
- **BẮT BUỘC CHUẨN HÓA 100% REM:** Toàn bộ văn bản phải dùng thang đo `rem` (`text-xs` đến `text-2xl`), KHÔNG dùng `text-[...px]` cố định để tôn trọng cài đặt cỡ chữ trong `/cài-đặt`.
- **BẮT BUỘC CHỐNG VỠ GIAO DIỆN KHI TĂNG CỠ CHỮ (Font Scaling Resilience):** Tuyệt đối KHÔNG dùng chiều cao cố định (`h-10`, `h-12`, `h-[...px]`) cho các thẻ/container chứa chữ; luôn dùng `min-h-[...]`, `py-*` và responsive wrap để giao diện tự co giãn khi người dùng chọn cỡ chữ "Rất lớn" (20px) hoặc zoom 200%.
- **BẮT BUỘC VÙNG NGÓN TAY CÁI & SAFE AREA (Thumb Zone & iOS Insets):** Bố trí các nút thao tác chính (Lưu, Xác nhận, Đóng popup) ở nửa dưới màn hình; xử lý an toàn `safe-area-inset-bottom` trên iOS để không bị che bởi Home indicator.
- **BẮT BUỘC BẢO MẬT THIẾU NHI & CHUẨN THUẬT NGỮ CÔNG GIÁO:** Không để lộ số điện thoại, điểm số, thông tin riêng tư của thiếu nhi ra trang công khai; dùng đúng danh xưng phụng vụ (Giáo lý sinh, Giáo lý viên, Cha Tuyên úy, Niên khóa...).
- **BẮT BUỘC:** tiêu chí phải đạt trong phần được sửa hoặc tạo mới.
- **NÊN:** mặc định áp dụng; nếu có lý do khác, ghi ngắn gọn trong phần bàn giao.
- **KHÔNG:** hành vi cần tránh vì làm sai thông tin, mất khả năng sử dụng hoặc phá vỡ cấu trúc dự án.
- Yêu cầu cụ thể của chủ dự án trong nhiệm vụ hiện tại được ưu tiên hơn quy tắc mặc định trong file này. Giải thích các ngoại lệ có ảnh hưởng đến kết quả.
- Với quyết định thiết kế mới, file này được ưu tiên khi mâu thuẫn với `DESIGN_SYSTEM.md`. Tài liệu cũ là tham khảo cho giao diện amber đang tồn tại, không còn bắt buộc kính mờ, pattern nền hoặc animation trên mọi thành phần.
- Không tự động thiết kế lại toàn bộ website để đạt chuẩn. Áp dụng trong phạm vi nhiệm vụ; ghi nhận vấn đề ngoài phạm vi thay vì sửa lan rộng.
- Các trang tham khảo dưới đây là ví dụ về hướng thiết kế, **không phải bằng chứng rằng mọi chi tiết hiện tại đã đạt chuẩn**.

## 2. Hiện trạng dự án và quyết định thống nhất

| Quan sát từ mã nguồn | Quyết định áp dụng |
| --- | --- |
| React 19, Vite 6, Tailwind CSS 4, React Router 7; có cả JSX và TS | Giữ stack hiện tại. Không thêm framework hoặc chuyển toàn bộ ngôn ngữ để làm một trang. |
| `GioiThieu`, `Contact`, `KhoiChienCon` dùng CSS riêng và nền kem–xanh; nhiều trang cũ dùng amber/kính mờ | Dùng hướng kem–xanh cho trang công khai mới hoặc thiết kế lại. Màn hình nghiệp vụ giữ tương thích với khu vực hiện hữu. |
| `src/index.css` chưa có bộ semantic token chung cho toàn hệ thống | Token trong mục 5 là chuẩn đích; không giả định đã có sẵn trong runtime. |
| `Header`, `Footer`, `<main>` và điều hướng mobile được cung cấp bởi layout | Trang con không tự dựng lại khung ứng dụng. |
| `useMotionConfig` giảm chuyển động nhưng vẫn trả về offset/duration khác 0 | Dùng hook không tự động đồng nghĩa với đã đáp ứng giảm chuyển động. Kiểm tra hành vi thực tế. |
| Số lớp, độ tuổi, lịch học và niên khóa nằm ở nhiều trang | Đối chiếu nguồn trước khi cập nhật; không sao chép các giá trị đang mâu thuẫn. |
| Có trang công khai, tài khoản, giáo viên, quản trị, bài viết và tài liệu | Mỗi nhóm cần mật độ thông tin và cách thao tác riêng; không áp một bố cục quảng bá lên tất cả. |
| Có `srcClone`, file `*-root`, script và tài liệu cũ | Truy vết import từ router trước khi sửa; không coi bản sao là mã đang chạy. |
| Build đang có cảnh báo bundle lớn | Không tuyên bố build không cảnh báo. Xác định tác động của thay đổi, không tăng ngưỡng chỉ để giấu cảnh báo. |

### Nguồn tham khảo trong repository

- Định tuyến và layout: `src/App.jsx`, `src/main.jsx`, `src/components/layout/`.
- Trang công khai: `src/pages/GioiThieu.jsx`, `src/pages/Contact.jsx` và CSS tương ứng.
- Trang khối học: `src/pages/KhoiChienCon.jsx`, `src/features/khoi/`.
- Biểu mẫu liên hệ: `src/features/contact/contactForm.js` và bài test đi kèm.
- Thành phần dùng lại: `src/components/ui/`, `src/components/shared/`, `src/lib/utils.js`.
- Dữ liệu nghiệp vụ: `src/features/admin/dataLayer.js`, `src/features/teacher/api.js`.
- Niên khóa: `src/utils/academicYear.js`; phải xác nhận quy tắc nghiệp vụ trước khi thay đổi.
- Chuyển động: `src/hooks/useMotionConfig.js`, `usePageMotion.js`, `useKhoiMotion.js`.

## 3. Quy trình bắt buộc trước khi sửa

1. Đọc yêu cầu, kiểm tra trạng thái Git và xác định các thay đổi đã có. Không ghi đè công việc của người khác.
2. Tìm route, component, CSS, nguồn dữ liệu và các nơi gọi có liên quan. Ưu tiên `rg` để tìm mã.
3. Xác định người dùng chính, mục tiêu của trang và hành động chính họ cần thực hiện.
4. Xem trang trên trình duyệt khi sửa bố cục/tương tác. Nếu không thể chạy, ghi rõ giới hạn kiểm tra.
5. Kiểm tra thành phần dùng chung trước khi tạo một bản tương tự.
6. Chọn phạm vi nhỏ nhất đủ hoàn thành nhiệm vụ. Không tự ý nâng dependency, đổi schema hoặc tái cấu trúc khu vực không liên quan.

## 4. Bố cục theo loại màn hình

### Trang công khai: giới thiệu, liên hệ, tuyển sinh

- Mỗi trang có một H1 rõ nghĩa, đoạn dẫn ngắn và một hành động chính nổi bật.
- Dùng serif cho H1/H2 mang tính giới thiệu; sans-serif cho nội dung, form và điều khiển.
- Nội dung chính phải giúp trả lời: đây là gì, dành cho ai, cần làm gì tiếp theo.
- Trang liên hệ ưu tiên kênh liên hệ và biểu mẫu, không dùng hero lớn đẩy thao tác xuống sâu.
- Trang giới thiệu có thể ưu tiên ảnh thật và câu chuyện cộng đoàn; ảnh không thay thế thông tin thiết yếu.
- Không bắt buộc mọi phần phải nằm trong card. Dùng khoảng trắng, đường phân cách và phân cấp chữ trước khi thêm hiệu ứng.

### Trang khối học

- Hiển thị rõ khối, đối tượng/độ tuổi, niên khóa, chương trình, lịch và cách đăng ký.
- Cho phép dùng màu ngành làm điểm nhấn trên nền chung. Không tự quy định lại màu ngành hoặc cơ cấu lớp khi chưa xác nhận.
- Danh sách lớp có tiêu đề cột/nhãn đầy đủ; thiếu dữ liệu phải có trạng thái rõ ràng.
- Không tự tính “đang tuyển sinh” chỉ vì niên khóa được cập nhật tự động.

### Màn hình giáo viên, quản trị, tài khoản

- Ưu tiên tìm kiếm, lọc, đọc dữ liệu, thao tác và trạng thái lưu.
- Dùng sans-serif cho tiêu đề bảng/panel; không thêm hero, khẩu hiệu hoặc ảnh trang trí lớn.
- Giữ quy ước màu trạng thái hiện có, nhưng luôn đi kèm nhãn hoặc icon; không truyền đạt kết quả chỉ bằng màu.
- Bảng rộng được cuộn trong vùng riêng, không làm cả trang tràn ngang. Nêu rõ dòng/cột đang được thao tác.
- Hành động sửa/xóa phải mô tả chính xác đối tượng và hậu quả; không dùng nhãn mơ hồ như “OK”.

## 5. Token thị giác chuẩn

Đây là giá trị mặc định cho trang công khai mới. Tái sử dụng qua biến CSS có ý nghĩa; không chép mã màu rải rác trong JSX.

| Token | Sáng | Tối | Vai trò |
| --- | --- | --- | --- |
| `--ui-bg` | `#faf8f3` | `#151c18` | Nền trang |
| `--ui-surface` | `#fffefa` | `#1e2821` | Panel, card, biểu mẫu |
| `--ui-text` | `#293d32` | `#ecece0` | Chữ chính |
| `--ui-muted` | `#575e55` | `#b0b9ac` | Chữ phụ có ý nghĩa |
| `--ui-border` | `#dedfd4` | `#354237` | Phân cách, trang trí |
| `--ui-accent` | `#927140` | `#d4b47d` | Điểm nhấn trang trí |
| `--ui-accent-text` | `#7c5c2d` | `#d4b47d` | Chữ nhấn nhỏ |
| `--ui-primary` | `#314e3e` | `#d6b883` | Nền nút chính |
| `--ui-on-primary` | `#ffffff` | `#19251d` | Chữ/icon nút chính |

- Dùng class `.dark` hiện có để đổi giao diện; không tạo state dark mode riêng cho từng trang.
- Màu lỗi/thành công/cảnh báo và màu ngành được phép ngoài bảng này. Kiểm tra từng cặp chữ–nền thực tế, nhất là khi dùng opacity.
- Nền, viền trang trí không tự bảo đảm độ tương phản cho input hoặc focus. Bổ sung viền/focus đủ nhận biết cho điều khiển.
- NÊN đưa token dùng chung vào một nguồn CSS duy nhất khi nhiệm vụ có phạm vi chuẩn hóa. Không tuyên bố token đã được dùng chung chỉ vì đã viết vào tài liệu này.
- Với các namespace đang có như `--about-*`, `--c-*`, `--cc-*`, có thể ánh xạ sang token chung trong đợt sửa liên quan; tránh thay đồng loạt ngoài phạm vi.

### Kích thước, khoảng cách và chuẩn hóa REM

| Thành phần | Mặc định |
| --- | --- |
| Khung trang công khai | Tối đa 1120–1180px, căn giữa |
| Lề ngang | Mobile 16–20px; desktop tối thiểu 32px |
| Khoảng cách section | Mobile 40–48px; desktop 64–84px |
| Khoảng cách trong nhóm | Theo thang 4, 8, 12, 16, 24, 32px |
| H1 giới thiệu | Mobile khoảng 36–44px; desktop 48–64px, co giãn bằng `clamp()` hoặc `text-2xl`/`text-3xl` |
| H2 | Mobile 28–32px; desktop 32–40px, tương ứng `text-xl`/`text-2xl` |
| Nội dung chính | 1rem (`text-base`); dòng 1.6–1.8; đoạn đọc dài khoảng 60–75 ký tự mỗi dòng |
| Chữ phụ/nhãn cần đọc | Tối thiểu từ 0.75rem (`text-xs`); không dùng chữ rất nhỏ để nhét thông tin |
| Input, select, textarea trên mobile | Tối thiểu 1rem (`text-base`) ở cỡ chữ mặc định |
| Vùng chạm điều khiển | Tối thiểu 44 × 44 CSS px |
| Bo góc trang công khai | Điều khiển 8px; card/panel 12–16px; pill dành cho badge/bộ lọc |

#### Bảng ánh xạ Tailwind REM bắt buộc:

| Class Tailwind | Giá trị REM | Kích thước chuẩn (16px) | Vai trò áp dụng |
| :--- | :--- | :--- | :--- |
| `text-xs` | `0.75rem` | 12px | Nhãn nhỏ, chú thích phụ, badge, metadata |
| `text-sm` | `0.875rem` | 14px | Nhãn form, phụ đề, mô tả ngắn, nội dung phụ |
| `text-base` | `1rem` | 16px | Nội dung chính, đoạn văn đọc, ô nhập liệu |
| `text-lg` | `1.125rem` | 18px | Tiêu đề phụ, điểm nhấn, số liệu quan trọng |
| `text-xl` | `1.25rem` | 20px | Tiêu đề section (H2/H3), thẻ nhóm |
| `text-2xl` | `1.5rem` | 24px | Tiêu đề trang chính (H1) |

- **BẮT BUỘC:** 100% cỡ chữ văn bản dùng class `rem` chuẩn (`text-xs` đến `text-2xl`...) để tôn trọng cài đặt cỡ chữ của ứng dụng (`/cài-đặt`).
- **KHÔNG:** Dùng các class pixel cố định như `text-[11px]`, `text-[12px]`, `text-[13px]`, `text-[14px]`, `text-[15px]` vì làm vô hiệu hóa tính năng cài đặt cỡ chữ.
- **KHÔNG:** Thu nhỏ chữ bằng pixel cứng để giải quyết tràn; **BẮT BUỘC** đổi bố cục (flex-col, grid responsive, co giãn padding, truncate, hoặc cho xuống dòng).
- **BẮT BUỘC CHỐNG VỠ GIAO DIỆN (No Fixed Height on Text Containers):** KHÔNG dùng `h-10`, `h-12`, `h-[...px]`, `max-h-[...px]` cho các container, card, badge hoặc nút chứa văn bản. Luôn dùng `min-h-[44px]`, padding `py-2` đến `py-3`, `px-3` và `flex-wrap` hoặc `flex-col` để khi người dùng chọn cỡ chữ "Rất lớn" (20px base) hoặc zoom 200%, nội dung không bị cắt xén hay đè chữ.
- Hình vòm/bo góc lớn được dùng cho ảnh hero đặc trưng, không áp lên mọi card.
- Shadow nhẹ là tùy chọn. Không bắt buộc blur, kính mờ, gradient, glow, pattern hoặc chữ in hoa cho label biểu mẫu.

## 6. Responsive và khả năng sử dụng

- **BẮT BUỘC ƯU TIÊN MOBILE-FIRST:**
  - Bắt đầu thiết kế, căn chỉnh bố cục và kiểm thử trên các kích thước di động nhỏ trước: **320px (iPhone SE 1), 375px (iPhone SE 2/3), 390px (iPhone 12/13/14), 430px (iPhone Pro Max)** trước khi mở rộng lên Tablet (768px) và Desktop (1280px).
  - Mọi thao tác cốt lõi, bảng điểm, danh sách, bộ lọc, nút bấm phải mượt mà và ngón tay cái chạm dễ dàng trên mobile.
- **BẮT BUỘC VÙNG NGÓN TAY CÁI & SAFE AREA (Thumb Zone & iOS Insets):**
  - Bố trí các nút bấm quan trọng (Lưu, Xác nhận, Tiếp tục, Đóng popup, Điểm danh) ở **nửa dưới màn hình (Thumb zone)** để người dùng dễ thao tác bằng một tay. Tránh đặt nút chính ở góc xa trên cùng bên trái.
  - Xử lý padding an toàn cho đáy màn hình trên iPhone (`pb-[env(safe-area-inset-bottom)]`) và tai thỏ/Dynamic Island (`pt-[env(safe-area-inset-top)]`) để tránh bị che khuất bởi thanh Home bar hoặc camera.
- **BẮT BUỘC TRẢI NGHIỆM MẠNG YẾU & SKELETON LOADING (Low-connectivity UX):**
  - Tuyệt đối KHÔNG dùng spinner xoay tròn vô định giữa màn hình trống; **BẮT BUỘC** dùng khung xương (**Skeleton loading**) mô phỏng đúng kích thước khối nội dung để tránh giật layout (Cumulative Layout Shift - CLS).
  - Các biểu mẫu nhập liệu dài (Đăng ký học giáo lý, góp ý, soạn bài) nên tự động lưu nháp (`localStorage`) để không bị mất nội dung khi rớt mạng 4G/Wifi.
- **BẮT BUỘC ĐỘ TƯƠNG PHẢN WCAG AAA:**
  - Tương phản văn bản thường (dưới 18pt / 24px) tối thiểu **$\ge 7.0:1$** trên nền thực tế (kiểm tra cả Light mode và Dark mode).
  - Tương phản văn bản lớn ($\ge 18\text{pt}$ hoặc bold $\ge 14\text{pt}$) tối thiểu **$\ge 4.5:1$**.
  - Thành phần điều khiển, đường viền ô nhập liệu và chỉ báo focus tối thiểu **$\ge 3.0:1$**.
  - Không truyền đạt trạng thái duy nhất bằng màu; luôn đi kèm icon, ký tự hoặc nhãn chữ.
- Không được có cuộn ngang toàn trang. Không dùng `overflow-x: hidden` để che phần nội dung bị tràn chưa xử lý.
- Nội dung quan trọng và hành động chính phải hiện trên thiết bị cảm ứng; không phụ thuộc hover.
- Hiệu ứng hover trang trí dùng `@media (hover: hover) and (pointer: fine)`. `md:hover` chỉ liên quan độ rộng, không chứng minh thiết bị có chuột.
- Không tạo thanh `fixed bottom-0` thứ hai đè lên điều hướng mobile của ứng dụng. Nếu nhiệm vụ thực sự cần, phối hợp với layout và chừa safe area.
- Neo trong trang phải có offset phù hợp header; chuyển focus đến vùng đích hoặc điều khiển đầu tiên khi cần.
- Link nội bộ dùng React Router; button dùng cho hành động. Không dùng `div` có `onClick` làm nút.
- Không lồng button/link bên trong một link khác.
- Một trang có một H1; không lồng `<main>` vào `<main>` mà layout đã cung cấp.
- Ảnh nội dung có `alt`; ảnh trang trí có `alt=""`; icon trang trí ẩn khỏi công cụ hỗ trợ.
- Nút chỉ có icon phải có tên truy cập (`aria-label`). Mọi điều khiển phải có focus nhìn thấy được.
- Kiểm tra bằng bàn phím và khi phóng to trang 200%; không cắt mất nội dung hoặc hành động.

## 7. Biểu mẫu, trạng thái và phản hồi

### Trước khi gửi

- Mỗi trường có `label` nối với `id`, tên trường ổn định, `autocomplete`/`inputMode` phù hợp.
- Chỉ yêu cầu dữ liệu cần cho nghiệp vụ; phân biệt trường bắt buộc và tùy chọn bằng chữ rõ ràng.
- Giới hạn độ dài hợp lý. Chuẩn hóa dữ liệu trước khi gửi, nhưng không âm thầm thay đổi ý nghĩa nội dung người dùng.
- Validation tách thành hàm thuần để kiểm thử. Với số di động Việt Nam, dùng quy tắc của nghiệp vụ; không tự nhận đây là xác minh số đang hoạt động.
- Kiểm tra phía client hỗ trợ trải nghiệm; kiểm tra phía server mới bảo vệ dữ liệu. Không coi validation client là biện pháp chống lạm dụng API.

### Trong và sau khi gửi

- Ngăn gửi lặp trong lúc request đang xử lý, hiển thị trạng thái “Đang gửi…” phù hợp nghiệp vụ.
- Lỗi từng trường có thông báo cụ thể, `aria-invalid`, `aria-describedby`; focus đến trường lỗi đầu tiên.
- Lỗi mạng/API hiện trong form, giữ nội dung đã nhập, có cách thử lại hoặc liên hệ thay thế.
- Không dùng `alert()` cho lỗi thông thường. Không báo thành công trước khi API xác nhận.
- Nếu kết quả không xác định do mất kết nối, nói “Chưa thể xác nhận”; không khẳng định dữ liệu chưa được lưu.
- Thành công có thông báo dễ nhận biết, quản lý focus và mô tả bước tiếp theo. Chỉ hứa thời gian phản hồi đã được xác nhận.
- Dùng `role="status"`/`role="alert"` hợp lý; tránh đọc lặp thông báo ở mỗi ký tự nhập.
- Luồng đọc dữ liệu có đủ loading, empty, error, success; không biến lỗi tải thành “Không có dữ liệu”.

## 8. Modal, thư viện ảnh, FAQ và chuyển động

- Modal có tên, đóng được bằng Escape, giữ focus trong modal và trả focus về điểm mở khi đóng.
- Khóa cuộn nền; nếu phối hợp với Lenis, chỉ khôi phục trạng thái cuộn mà modal đã thay đổi. Cleanup khi unmount.
- Modal phải dùng được trên màn hình thấp/ngang; nội dung dài được cuộn bên trong, không mất nút đóng.
- Có thể dùng native `<dialog>` hoặc component hiện có đã đáp ứng hành vi trên; không mặc định mọi modal cũ đều đạt.
- Thư viện ảnh có nút trước/sau, bộ đếm, chú thích; phím mũi tên hoạt động trong trình xem ảnh. Đổi bộ lọc không làm sai ảnh đang chọn.
- FAQ dùng button với `aria-expanded`, `aria-controls` hoặc phần tử HTML phù hợp; nội dung đóng không được nhận focus.

### 8.1. Tinh thần chuyển động của website Giáo lý Công giáo

Chuyển động phải giữ cảm giác **trang nghiêm, ấm áp và dễ tập trung**. Animation dùng để dẫn dắt sự chú ý, giải thích thay đổi giao diện hoặc phản hồi thao tác; không dùng chỉ để làm giao diện có vẻ sinh động.

- **BẮT BUỘC:** Trước khi sửa hoặc thiết kế lại một trang đang có animation, kiểm tra chuyển động hiện hữu và quyết định rõ phần nào giữ, sửa hoặc bỏ. Không được xóa toàn bộ animation có ích chỉ vì tái cấu trúc JSX/CSS.
- **BẮT BUỘC:** Nội dung và thao tác phải dùng được ngay cả khi JavaScript animation không chạy hoặc người dùng bật giảm chuyển động.
- **NÊN:** Trang công khai như giới thiệu, tuyển sinh và trang khối học có chuyển động dẫn dắt nhẹ ở hero, section quan trọng và thay đổi trạng thái nếu không làm chậm thao tác.
- **NÊN:** Trang bài học, Kinh Thánh, phụng vụ và nội dung cầu nguyện chỉ dùng fade, crossfade hoặc chuyển trạng thái nhẹ.
- **NÊN:** Màn hình quản trị, giáo viên, tài khoản, bảng và biểu mẫu chỉ dùng chuyển động chức năng cho modal, accordion, loading, lỗi, thành công và thay đổi cấu trúc cần giải thích.
- **KHÔNG:** Bắt buộc mọi section hoặc mọi card phải animate. Nội dung đã rõ ở trạng thái tĩnh có thể giữ tĩnh.
- **KHÔNG:** Dùng bounce, shake, confetti, chữ chạy, glow nhấp nháy, parallax mạnh hoặc animation lặp chỉ để trang trí.
- **KHÔNG:** Làm Thánh giá, Mình Thánh Chúa, ảnh tượng, biểu tượng cầu nguyện hoặc biểu tượng phụng vụ xoay, nảy, pulse hay bay lặp. Ảnh và biểu tượng tôn giáo chỉ nên giữ tĩnh hoặc fade-in nhẹ cùng nội dung.

### 8.2. Mức chuyển động mặc định

| Trường hợp | Chuyển động mặc định |
| --- | --- |
| Hero trang công khai | Fade và dịch dọc 12–20px, 350–500ms; có thể stagger badge, H1, đoạn dẫn và CTA 50–80ms |
| Section reveal | Fade và dịch dọc 12–20px, 300–450ms, chạy một lần khi vào viewport |
| Card reveal | Dịch dọc không quá 16px; stagger 40–60ms/mục và không kéo dài vô hạn |
| Hover có chuột | Đổi nhẹ màu, viền, shadow hoặc dịch lên tối đa 2px trong 150–220ms |
| Accordion, modal, menu | 180–300ms; ưu tiên opacity, height hoặc scale rất nhẹ từ khoảng 0.98 lên 1 |
| Form sang lỗi/thành công | Fade/crossfade 180–300ms; quản lý focus ngay sau khi trạng thái đổi |
| Smooth scroll | Thông thường không quá 600ms; phải có offset cho header và đích focus phù hợp |

- Các giá trị trên là chuẩn mặc định, không phải lý do để thêm animation khi chuyển động không mang lại lợi ích.
- Reveal danh sách dùng `viewport: { once: true }` hoặc cơ chế tương đương. Danh sách dài không stagger từng dòng; giới hạn tổng độ trễ để nội dung cuối không phải chờ.
- Không animate từng input, từng dòng bảng hoặc toàn bộ danh sách nghiệp vụ. Không trì hoãn hiển thị lỗi, nút chính hoặc dữ liệu người dùng cần đọc ngay.
- CSS đủ cho hover và transition đơn giản. Dùng Framer Motion khi cần phối hợp sequence, layout, enter/exit hoặc reduced motion; không thêm thư viện mới chỉ cho một fade đơn giản.
- `AnimatePresence` là tùy chọn cho FAQ đơn giản, nhưng NÊN dùng cho chuyển đổi có thay thế nội dung như form → thành công, lỗi → thử lại hoặc modal enter/exit nếu giúp tránh thay đổi đột ngột.

### 8.3. Reduced motion và tính ổn định

- **BẮT BUỘC:** Khi `prefers-reduced-motion: reduce`, bỏ transform, parallax, animation lặp và smooth scroll; nội dung xuất hiện ngay và không bị giữ ở `opacity: 0`.
- **BẮT BUỘC:** Loading, lỗi, thành công và trạng thái nghiệp vụ luôn có nhãn chữ; không truyền đạt chỉ bằng spinner, màu hoặc chuyển động.
- **BẮT BUỘC:** Chuyển động thay đổi chiều cao không được làm mất focus hoặc khiến người dùng mất vị trí đang đọc.
- Spinner có thể dùng cạnh nhãn trạng thái trong lúc xử lý ngắn, nhưng phải dừng chuyển động ở reduced motion; skeleton dùng khi đang tải cấu trúc nội dung và cần giữ ổn định bố cục.
- Hover trang trí chỉ chạy trong `@media (hover: hover) and (pointer: fine)`. `md:hover` không thay thế kiểm tra khả năng hover.
- Tránh dùng `transition-all` khi chỉ cần chuyển một vài thuộc tính; chỉ định `color`, `background-color`, `border-color`, `opacity`, `box-shadow` hoặc `transform` để giảm chuyển động ngoài ý muốn.

### 8.4. Nghiệm thu chuyển động

Phần giao diện có animation chỉ được coi là đã kiểm tra khi đã xem:

- Lần tải đầu trang và khi cuộn nhanh qua các section.
- Mobile 320px, 390px và desktop 1280px; kiểm tra thêm 768px theo quy định responsive.
- `prefers-reduced-motion: reduce`.
- Điều hướng bằng bàn phím, focus sau smooth scroll, modal và thay đổi trạng thái form.
- Form hoặc dữ liệu ở trạng thái loading, lỗi, chưa xác định và thành công nếu có.
- Nội dung không bị giữ ở `opacity: 0`, không nhảy bố cục quá mức và không có animation lặp gây mất tập trung.
- Thiết bị cảm ứng không phụ thuộc hover để nhìn thấy trạng thái hoặc hành động.

## 9. Nội dung, ảnh và độ tin cậy

- Viết tiếng Việt rõ ràng, gần gũi. Trên giao diện dùng “Gửi lời nhắn”, “Lịch học”, “Liên hệ”; tránh thuật ngữ triển khai như RPC, schema, thiết lập kết nối.
- Không bịa số lượng học sinh, tên người phụ trách, câu trích dẫn, ngày sự kiện, tình trạng tuyển sinh hoặc thời gian phản hồi.
- Lịch, độ tuổi, niên khóa và lớp phải nhất quán giữa các trang. Gặp mâu thuẫn cần xác minh nguồn, không chọn ngẫu nhiên.
- Giờ sinh hoạt không đồng nghĩa với giờ có người trực. Badge “Hôm nay” chỉ mô tả ngày; “Đang mở cửa” cần cả khung giờ và múi giờ phù hợp.
- Thông tin theo ngày của giáo xứ dùng múi giờ `Asia/Ho_Chi_Minh`; nếu trang mở lâu phải có cách cập nhật khi qua ngày.
- Ảnh người dùng cung cấp phải được xem trước khi chọn. Không gán tên, chức vụ hoặc sự kiện chỉ từ khuôn mặt/hình ảnh.
- Dùng bản sao tối ưu cho web, không ghi đè ảnh gốc. Đặt tên có nghĩa, mô tả đúng ảnh.
- Dùng WebP/AVIF khi phù hợp, `srcSet`/`sizes` theo chiều rộng hiển thị thật. Khai báo kích thước hoặc tỷ lệ để hạn chế nhảy bố cục.
- Ảnh hero tải sớm khi cần; ảnh dưới màn hình tải lazy. Không đặt mọi ảnh ở ưu tiên cao.
- Tài nguyên từ `public` phải tương thích `import.meta.env.BASE_URL`; không giả định website luôn triển khai ở `/`.
- Không hiển thị CTA mở nội dung placeholder. Nếu bản đồ/video chưa hoạt động, cung cấp hành động thật thay thế.
- Tiêu đề/mô tả trang phải phản ánh nội dung; dọn metadata khi chuyển route. Metadata client không phải bằng chứng bot chia sẻ mạng xã hội đã đọc được.

### Chuẩn hóa Thuật ngữ Công giáo & Phụng vụ

Tuyệt đối không dùng thuật ngữ thế tục cho các khái niệm Giáo lý / Công giáo:

| Thuật ngữ thế tục (KHÔNG DÙNG) | Thuật ngữ Công giáo chuẩn (BẮT BUỘC DÙNG) |
| :--- | :--- |
| Học sinh, học viên, học sinh giáo lý | **Giáo lý sinh / Thiếu nhi** |
| Thầy cô, giáo viên, cô giáo | **Giáo lý viên / Huynh trưởng** |
| Giờ học thêm, giờ học văn hóa | **Giờ học Giáo lý** |
| Cha xứ, ông linh mục, cha giáo | **Cha Xứ / Cha Tuyên úy / Linh mục** |
| Năm học | **Niên khóa** (ví dụ: *Niên khóa 2026 – 2027*) |
| Đạo đức, hạnh kiểm trường lớp | **Hạnh kiểm / Chuyên cần / Sống đạo** |
| Đơn vị, chi nhánh, phân hiệu | **Xứ đoàn / Phân đoàn / Ngành / Chi đoàn** |
| Phòng học | **Phòng Giáo lý / Lớp Giáo lý** |

### Bảo vệ Quyền riêng tư & Dữ liệu Thiếu nhi

- **BẮT BUỘC BẢO MẬT THÔNG TIN THIẾU NHI:** Tuyệt đối **KHÔNG** hiển thị công khai số điện thoại phụ huynh, địa chỉ nhà, ngày sinh chi tiết hoặc bảng điểm của các em thiếu nhi ra các trang công cộng (public routes).
- Dữ liệu này chỉ được phép truy xuất trong trang cá nhân (`/tài-khoản`) sau khi đã đăng nhập và xác thực đúng vai trò phụ huynh hoặc Giáo lý viên phụ trách lớp.

## 10. Cấu trúc mã, dữ liệu và bảo mật

- `src/pages/`: ghép trang và điều phối luồng. `src/features/<feature>/`: logic, API, dữ liệu đặc thù. `src/components/`: thành phần dùng chung.
- Không gọi Supabase trực tiếp rải rác trong JSX nếu feature đã có lớp API. Giữ contract của API khi chỉ thay giao diện.
- Không tạo một Button/Modal/Toast dùng chung mới trước khi kiểm tra cái đang có. Không bắt đầu trừu tượng hóa lớn chỉ để giảm vài dòng.
- CSS riêng phải có phạm vi theo page/component. Không viết rule toàn cục cho `button`, `h2`, `img` làm đổi các trang khác.
- Viết JSX/CSS dễ đọc, không nén cả component hoặc stylesheet thành một vài dòng. Tách phần có trách nhiệm độc lập khi component khó theo dõi.
- Không sửa hook dùng chung chỉ để giải quyết một trang mà chưa kiểm tra các nơi sử dụng.
- Effect có listener, timer, subscription, khóa cuộn hoặc cập nhật metadata phải cleanup; xem xét hành vi StrictMode.
- Dùng key ổn định từ dữ liệu cho danh sách có thể thay đổi thứ tự; không dùng index cho bản ghi nghiệp vụ.
- Không đưa service-role key, mật khẩu, dữ liệu cá nhân hoặc nội dung lời nhắn vào mã client, log hay screenshot bàn giao.
- Quyền quản trị phải được kiểm soát ở backend/RLS, không chỉ bằng ẩn nút hoặc route phía client.
- Thay đổi schema cần migration tương thích và ghi rõ đã áp dụng hay chưa. Không tự triển khai migration, deploy, xóa hoặc gửi tin ra ngoài nếu nhiệm vụ không cho phép.
- Không tự ý chạy script xử lý audio, scraping, import hoặc cleanup vì chúng có thể tác động dữ liệu thật.
- File SQL phải chạy được trong môi trường mục tiêu; không chứa citation placeholder như `[cite: ...]` trong câu lệnh.
- Trong bài test, dùng dữ liệu giả và môi trường/mock phù hợp. Không tạo liên hệ thử hoặc thông báo thử gửi đến người thật để kiểm tra giao diện.

## 11. Kiểm tra và điều kiện nghiệm thu

Chỉ chạy kiểm tra liên quan đến thay đổi. Sau khi đạt, không lặp lại không có lý do; thay đổi tiếp hoặc phát hiện lỗi mới thì kiểm tra lại phần bị ảnh hưởng.

### Lệnh hiện có trong dự án

```bash
# Build toàn ứng dụng
npm run build

# Ví dụ lint đúng file giao diện/logic vừa thay đổi
npx eslint src/pages/Contact.jsx src/features/contact/contactForm.js

# Test validation và chuẩn hóa biểu mẫu liên hệ
node --test src/features/contact/contactForm.test.js
```

`package.json` hiện chưa có script `npm test` hoặc `npm run lint`; không ghi chúng là lệnh đã chạy. Ví dụ lint trên dùng cấu hình browser hiện tại; test Node cần cấu hình môi trường phù hợp nếu bổ sung vào phạm vi lint.

### Checklist của người thực hiện và người duyệt

- [ ] **Chuyển động có chủ đích:** Đã kiểm tra animation hiện hữu trước khi sửa; giữ hoặc thay thế chuyển động có ích, không xóa toàn bộ không lý do và không thêm hiệu ứng trang trí gây phân tâm.
- [ ] **Reduced motion:** Đã kiểm tra `prefers-reduced-motion`; nội dung xuất hiện ngay, không còn transform/parallax/smooth scroll hoặc animation lặp, và trạng thái vẫn có nhãn chữ.
- [ ] **Ưu tiên Mobile-first:** Đã kiểm tra và tối ưu hoàn hảo trên màn hình nhỏ **320px (iPhone SE 1), 375px (iPhone SE 2/3), 390px** trước khi lên desktop; không phụ thuộc hover.
- [ ] **Chuẩn độ tương phản WCAG AAA:** Chữ thường đạt $\ge 7.0:1$, chữ lớn $\ge 4.5:1$, điều khiển/focus $\ge 3.0:1$ trên cả chế độ Sáng và Tối.
- [ ] **Chuẩn hóa 100% REM & Chống vỡ chữ:** Toàn bộ cỡ chữ dùng class rem chuẩn (`text-xs` đến `text-2xl`); **KHÔNG có `text-[...px]` cứng**; không dùng `h-fixed` trên container chữ; hiển thị hoàn hảo ở cỡ chữ "Rất lớn" và khi zoom 200%.
- [ ] **Vùng chạm điều khiển & Thumb Zone:** Mọi nút bấm, switch, tab đạt tối thiểu **$44 \times 44\text{ CSS px}$**; nút chính nằm ở nửa dưới màn hình; xử lý `safe-area-inset-bottom` trên iOS.
- [ ] **Tải trang mượt mà (Skeleton loading):** Dùng skeleton cho trạng thái tải, tuyệt đối không dùng spinner vô định làm giật layout (CLS).
- [ ] **Thuật ngữ Công giáo chuẩn mực:** Dùng đúng danh xưng phụng vụ (Giáo lý sinh, Giáo lý viên, Cha Tuyên úy, Niên khóa...).
- [ ] **Bảo mật dữ liệu thiếu nhi:** Không để lộ số điện thoại, điểm số, thông tin cá nhân ra ngoài trang công khai.
- [ ] Thay đổi đúng route đang chạy và đúng phạm vi yêu cầu.
- [ ] Hành động chính dễ tìm; không còn nút giả, link sai hoặc placeholder mới.
- [ ] Bố cục đạt các kích thước quy định; không tràn ngang; không đè điều hướng mobile.
- [ ] Kiểm tra cả sáng/tối, tăng cỡ chữ/zoom và bàn phím cho phần đã sửa.
- [ ] Modal, form, bảng, bộ lọc có các trạng thái cần thiết và quản lý focus phù hợp.
- [ ] Nội dung, ảnh, lịch và dữ liệu hiển thị có cơ sở; không suy diễn dữ liệu thiếu.
- [ ] Không có lỗi console mới do thay đổi; ảnh/tài nguyên liên quan tải được.
- [ ] Build và lint phạm vi thay đổi đạt; test logic quan trọng đã chạy nếu có thay đổi logic.
- [ ] Chưa kiểm tra được phần nào thì ghi rõ phần đó và ảnh hưởng; không đánh dấu đạt.
- [ ] Không mất thay đổi có sẵn, không sửa file sinh tự động thủ công, không lộ dữ liệu thật.

Thay đổi tài liệu thuần túy chỉ cần kiểm tra nội dung, đường dẫn và tính nhất quán; không bắt buộc build ứng dụng.

## 12. Bàn giao và ngoại lệ

Bàn giao ngắn gọn theo thứ tự:

1. Đã thay đổi gì và người dùng được lợi gì.
2. File/route chính hoặc bản xem trước để kiểm tra.
3. Kiểm tra thực sự đã chạy và kết quả.
4. Giới hạn còn lại, migration chưa áp dụng, cảnh báo build hoặc ngoại lệ liên quan.

Không gọi “đã kiểm thử end-to-end”, “đã an toàn”, “đạt WCAG” hoặc “đã deploy” khi chưa có bằng chứng tương ứng. Build thành công chỉ xác nhận build, không thay thế kiểm thử tương tác hay backend.

Khi cần ngoại lệ, ghi **quy tắc được thay đổi → lý do → phạm vi → cách kiểm tra thay thế** trong phần bàn giao/PR. Quyết định thường lệ nằm trong yêu cầu đã giao thì chủ động thực hiện; chỉ hỏi thêm khi thiếu dữ liệu thực sự quyết định kết quả hoặc có hành động vượt phạm vi được phép.

## 13. Lộ trình chuẩn hóa tiếp theo (không tự động thuộc mọi nhiệm vụ)

1. Ánh xạ các token trang công khai về một nguồn dùng chung, đối chiếu và cập nhật `DESIGN_SYSTEM.md` theo chuẩn mới.
2. Thống nhất nguồn dữ liệu cơ cấu lớp, niên khóa và lịch để các trang không lệch nhau.
3. Rà soát cỡ chữ cố định, nhãn nhỏ và vùng chạm dưới 44px trên các trang mới lẫn cũ.
4. Hoàn thiện các component dùng chung có nhu cầu thực tế: Field, Button, Dialog, trạng thái loading/error/empty.
5. Bổ sung kiểm thử tương tác và đo hiệu năng cho các luồng quan trọng trước khi tối ưu toàn hệ thống.

Các mục trên là tồn đọng được nhận diện từ dự án, không phải tuyên bố đã triển khai.
