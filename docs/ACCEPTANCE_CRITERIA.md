# QUY CHUẨN NGHIỆM THU ĐẠT CHUẨN
## Acceptance Criteria Framework — Ban Giáo lý An Ngãi

> **Phiên bản:** 1.1  
> **Ban hành:** 19/09/2026  
> **Tài liệu chỉ đạo:** [`AGENTS.md`](../AGENTS.md)  
> **Đối tượng áp dụng:** Ban Điều hành Xứ đoàn, Giáo lý viên, lập trình viên, QA/tester và AI agent.

---

## 1. Mục đích

Tài liệu này chuyển các nguyên tắc trong `AGENTS.md` thành quy trình nghiệm thu có thể kiểm tra, ghi nhận và bàn giao. Mục tiêu là bảo đảm phần được sửa hoặc tạo mới:

1. Trang trọng, ấm áp, rõ ràng và phù hợp môi trường Giáo lý Công giáo.
2. Dễ đọc, dễ thao tác trên điện thoại và khi người dùng tăng cỡ chữ.
3. Có trạng thái tải, lỗi và phản hồi phù hợp với nghiệp vụ thực tế.
4. Không làm lộ dữ liệu riêng tư của thiếu nhi và gia đình.
5. Có bằng chứng đủ để người duyệt phân biệt giữa “mã biên dịch được” và “trải nghiệm đã đạt”.

`AGENTS.md` vẫn là tài liệu chỉ đạo cao nhất. Nếu hai tài liệu khác nhau, áp dụng `AGENTS.md` và ghi nhận điểm cần đồng bộ tài liệu. Yêu cầu cụ thể của chủ dự án trong nhiệm vụ hiện tại được ưu tiên theo quy định của `AGENTS.md`.

---

## 2. Phạm vi và trạng thái đánh giá

### 2.1. Áp dụng theo phạm vi thay đổi

Không bắt buộc mọi thay đổi phải có modal, skeleton, form, RLS hoặc animation. Người thực hiện phải xác định rõ:

- Route, component, CSS, nguồn dữ liệu và layout dùng chung bị ảnh hưởng.
- Người dùng và vai trò được phục vụ.
- Hành động chính của màn hình.
- Tiêu chí nào áp dụng trực tiếp và tiêu chí nào không liên quan.
- Ảnh hưởng hồi quy đến component dùng chung hoặc route khác.

Không dùng quy chuẩn này làm lý do để tự động thiết kế lại toàn hệ thống ngoài phạm vi nhiệm vụ.

### 2.2. Bốn trạng thái nghiệm thu

Mỗi tiêu chí phải nhận một trong bốn trạng thái:

| Trạng thái | Ý nghĩa |
| --- | --- |
| **PASS** | Đã kiểm tra và có bằng chứng đạt yêu cầu. |
| **FAIL** | Đã kiểm tra và phát hiện vấn đề cần khắc phục. |
| **N/A** | Không áp dụng cho phạm vi hiện tại; bắt buộc ghi lý do ngắn gọn. |
| **NOT TESTED** | Chưa kiểm tra hoặc chưa đủ môi trường/bằng chứng; không được coi là PASS. |

Một hạng mục chỉ được kết luận “đạt” khi không còn tiêu chí bắt buộc ở trạng thái `FAIL` hoặc `NOT TESTED`.

### 2.3. Mức độ áp dụng

- **U — Universal:** Áp dụng cho mọi thay đổi giao diện hoặc luồng sử dụng trong phạm vi được sửa.
- **C — Conditional:** Chỉ áp dụng khi màn hình có thành phần hoặc rủi ro tương ứng.
- **B — Business approval:** Cần người phụ trách nghiệp vụ xác nhận khi thay đổi dữ liệu, thuật ngữ hoặc nội dung liên quan.

---

## 3. Sáu trụ cột nghiệm thu

### TRỤ CỘT 1 — Mobile-first, responsive và thao tác cảm ứng

#### 1.1. Ma trận viewport — U

Phần giao diện được sửa phải được kiểm tra theo ma trận tối thiểu:

| Môi trường | Bắt buộc | Mục tiêu |
| --- | :---: | --- |
| Mobile nhỏ — 320px | Có | Phát hiện tràn, ép chữ, vùng chạm quá sát. |
| Mobile phổ biến — 390px | Có | Kiểm tra bố cục và mật độ sử dụng thực tế. |
| Mobile lớn — 430px | Có với thay đổi mobile đáng kể | Không kéo dãn hoặc để khoảng trống bất thường. |
| Tablet — 768px | Có | Kiểm tra breakpoint, header, lưới và modal. |
| Desktop — 1280px | Có | Kiểm tra chiều rộng nội dung, bảng và phân cấp. |
| 375px | Theo rủi ro | Kiểm tra thêm khi thay đổi phụ thuộc breakpoint hoặc thiết bị cũ. |

Ảnh chụp cần ghi đúng viewport CSS, route, theme và trạng thái. Ảnh có `deviceScaleFactor: 2` phải được chú thích theo kích thước CSS, không dùng kích thước pixel của file ảnh làm viewport.

#### 1.2. Không tràn ngang toàn trang — U

- Không xuất hiện cuộn ngang trên `body` hoặc khung ứng dụng.
- Bảng, mã nguồn hoặc nội dung rộng phải cuộn trong vùng riêng có chỉ dẫn phù hợp.
- Không dùng `overflow-x: hidden` ở wrapper ngoài cùng để che lỗi layout chưa xử lý.

#### 1.3. Vùng chạm — U

- Button, tab, switch, icon button và liên kết điều hướng độc lập trên giao diện cảm ứng phải có vùng chạm tối thiểu `44 × 44 CSS px`.
- Có thể mở rộng hit area bằng pseudo-element nếu vùng mở rộng thực sự nhận pointer event và không chồng lên điều khiển lân cận.
- Liên kết nằm trong đoạn văn được miễn kích thước khối 44px, nhưng phải dễ nhận biết và không đặt quá sát một liên kết khác.
- Không được kết luận toàn bộ vùng chạm đạt chỉ vì stylesheet có xuất hiện chuỗi `44px` hoặc `2.75rem`.

#### 1.4. Thumb zone và safe area — C

Áp dụng khi có hành động chính, bottom navigation, sticky CTA hoặc floating action bar:

- Hành động chính trên mobile nên nằm trong vùng dễ với tới bằng một tay.
- Bottom bar phải xử lý `env(safe-area-inset-bottom)`.
- Header hoặc panel sát đỉnh phải xem xét `env(safe-area-inset-top)` khi có liên quan.
- Không tạo thanh cố định thứ hai che bottom navigation. Nếu cần thanh nổi, phải đo khoảng cách, z-index, padding cuối trang và kiểm tra ở trạng thái font lớn.

#### 1.5. Touch-first và hover — U

- Hành động quan trọng không phụ thuộc hover.
- Hover trang trí dùng `@media (hover: hover) and (pointer: fine)` hoặc cơ chế tương đương.
- Trạng thái active, selected, error và success phải nhận biết được trên thiết bị cảm ứng.

---

### TRỤ CỘT 2 — Khả năng tiếp cận và tương phản

#### 2.1. Chuẩn tương phản của dự án — U

Dự án áp dụng chuẩn tương phản tăng cường:

- Chữ thường: tối thiểu `7.0:1` trên nền thực tế.
- Chữ lớn: tối thiểu `4.5:1`.
- Điều khiển, ranh giới input cần thiết và focus indicator: tối thiểu `3.0:1`.
- Kiểm tra cả light mode và dark mode.
- Không truyền đạt trạng thái chỉ bằng màu; dùng thêm chữ, icon hoặc ký hiệu.

Khi báo cáo, ghi rõ cặp màu chữ/nền hoặc viền/nền đã đo. Không dùng tỷ lệ của token nền tảng để suy ra mọi component đều đạt.

#### 2.2. Semantic token — U với giao diện mới; C với giao diện cũ

- Trang/component mới dùng semantic token từ nguồn runtime chung khi token phù hợp đã tồn tại.
- Namespace riêng của page được phép ánh xạ sang semantic token hoặc dùng màu ngành/trạng thái đã được xác minh.
- Không chép màu rải rác trong JSX chỉ để vượt một test chuỗi.
- Giá trị token trong tài liệu phải đồng bộ với `AGENTS.md` và `src/index.css`. Khi có khác biệt, ghi nhận và cập nhật nguồn chỉ đạo trước khi tuyên bố chuẩn hóa toàn hệ thống.

#### 2.3. Bàn phím và focus — U

- Mọi điều khiển dùng được bằng bàn phím.
- `focus-visible` rõ ràng và không bị cắt bởi `overflow`.
- Thứ tự Tab phù hợp thứ tự đọc.
- Sau điều hướng nội trang hoặc thay đổi trạng thái lớn, focus được đặt tại vị trí giúp người dùng tiếp tục thao tác khi cần.
- Nút chỉ có icon có tên truy cập như `aria-label`.

#### 2.4. Cấu trúc và ngữ nghĩa — U

- Mỗi trang có một H1 phù hợp nội dung.
- Không lồng `<main>` vào `<main>` do layout cung cấp.
- Link dùng cho điều hướng; button dùng cho hành động.
- Không dùng `div` hoặc `span` có `onClick` thay cho điều khiển chuẩn.
- Không lồng button/link bên trong link khác.
- Bảng có header và quan hệ cột/dòng rõ ràng.
- Ảnh nội dung có `alt`; ảnh trang trí có `alt=""`; icon trang trí được ẩn khỏi công cụ hỗ trợ.

#### 2.5. Modal, sheet và popover — C

Khi phạm vi có modal, bottom sheet hoặc popover quan trọng:

- Có tên truy cập và vai trò phù hợp.
- Modal giữ focus bên trong, đóng bằng Escape và trả focus về trigger.
- Khóa cuộn nền và cleanup đúng khi đóng/unmount.
- Nội dung dài cuộn bên trong; nút đóng và hành động chính không biến mất trên màn hình thấp.
- Kiểm tra tương tác với Lenis nếu màn hình đang dùng Lenis.

---

### TRỤ CỘT 3 — REM, font scaling và độ bền bố cục

#### 3.1. Cỡ chữ dùng REM — U

- Không dùng `text-[...px]` hoặc `font-size: ...px` cho văn bản trong phần được sửa/tạo mới.
- Ưu tiên thang `text-xs`, `text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl` và các mức REM lớn hơn khi phù hợp.
- Nhãn có ý nghĩa cần đọc không nhỏ hơn `0.75rem`.
- Không thu nhỏ chữ để che lỗi tràn; thay đổi bố cục, padding hoặc cách xuống dòng.

#### 3.2. Chiều cao và co giãn — U

- Không dùng chiều cao cố định cho container chứa văn bản có thể thay đổi hoặc xuống dòng.
- Dùng `min-height`, padding linh hoạt, `min-width: 0`, `flex-wrap`, grid responsive hoặc layout dọc khi cần.
- Chiều cao cố định được phép cho icon-only button, avatar, media có tỷ lệ xác định, checkbox/radio, đường trang trí hoặc skeleton đã được thiết kế để giữ bố cục.

#### 3.3. Kiểm thử font lớn — U

Phải kiểm tra:

- Cỡ chữ “Rất lớn” của ứng dụng, tương đương base khoảng 20px.
- Browser zoom 200%.
- Không cắt chữ, chồng chữ, mất hành động, tạo cuộn ngang toàn trang hoặc giữ nội dung trong container có chiều cao không đủ.

---

### TRỤ CỘT 4 — Chuyển động, trạng thái và mạng yếu

#### 4.1. Chuyển động có chủ đích — C

Áp dụng khi phần được sửa có animation hoặc thay đổi cấu trúc giao diện:

- Chuyển động dùng để dẫn chú ý, giải thích thay đổi hoặc phản hồi thao tác.
- Không bắt buộc mọi section/card phải animate.
- Không dùng shake, bounce, confetti, marquee, glow nhấp nháy hoặc hiệu ứng lặp gây phân tâm.
- Biểu tượng tôn giáo giữ tĩnh hoặc chỉ fade nhẹ cùng nội dung.
- Không xóa animation hữu ích đang có mà không đánh giá trước.

#### 4.2. Reduced motion — C

- Khi `prefers-reduced-motion: reduce`, bỏ chuyển động dịch chuyển, parallax, smooth scroll và animation lặp.
- Nội dung xuất hiện ngay, không kẹt `opacity: 0`.
- Không xóa các transform phục vụ bố cục như căn giữa icon.
- Kiểm tra hành vi thực tế; sự tồn tại của media query hoặc hook không đủ để kết luận PASS.

#### 4.3. Trạng thái dữ liệu — C

Luồng đọc dữ liệu phải phân biệt khi có liên quan:

- Loading.
- Empty.
- Error.
- Success.
- Uncertain hoặc chưa thể xác nhận do mất kết nối.

Không biến lỗi tải thành “Không có dữ liệu”. Loading, lỗi và kết quả nghiệp vụ phải có nhãn chữ, không truyền đạt chỉ bằng màu hoặc chuyển động.

#### 4.4. Skeleton và độ ổn định bố cục — C

- Dùng skeleton khi đang tải cấu trúc nội dung và cần giữ ổn định bố cục.
- Spinner có thể dùng cạnh nhãn cho thao tác ngắn; không để spinner vô định giữa màn hình trống.
- Skeleton nên gần với kích thước nội dung thật và không tạo dịch chuyển bố cục nhìn thấy rõ.
- Nếu báo cáo chỉ số CLS, phải ghi công cụ, route, môi trường và giá trị đo; không dùng cụm “CLS bằng 0” khi chưa đo.

#### 4.5. Tải chunk và thử lại — C

Áp dụng cho route/component lazy loaded:

- Có fallback trong lúc tải.
- Có cách xử lý lỗi chunk hoặc thử lại phù hợp.
- Không để màn hình trắng.
- `lazyWithRetry` là giải pháp hiện có của dự án, không phải cách triển khai duy nhất nếu phương án khác đáp ứng cùng hành vi.

#### 4.6. Phục hồi nội dung biểu mẫu — C

- Form dài nên có cơ chế phục hồi nội dung khi rớt mạng hoặc reload.
- Nếu dùng `localStorage`, không lưu mật khẩu, token hoặc dữ liệu nhạy cảm không cần thiết.
- Cần xác định khóa lưu, thời hạn/xóa nháp, hành vi sau khi gửi thành công và rủi ro trên thiết bị dùng chung.
- Với dữ liệu thiếu nhi, ưu tiên tối thiểu hóa dữ liệu lưu cục bộ.

---

### TRỤ CỘT 5 — Nội dung, thuật ngữ và tính chính xác nghiệp vụ

#### 5.1. Thuật ngữ Công giáo — U với nội dung liên quan; B khi thay đổi thuật ngữ

| Không dùng trong ngữ cảnh Giáo lý | Thuật ngữ chuẩn |
| --- | --- |
| Học sinh, học viên, học sinh giáo lý | Giáo lý sinh / Thiếu nhi |
| Thầy cô, giáo viên, cô giáo | Giáo lý viên / Huynh trưởng |
| Giờ học thêm, giờ học văn hóa | Giờ học Giáo lý |
| Cha xứ, ông linh mục, cha giáo | Cha Xứ / Cha Tuyên úy / Linh mục theo vai trò thực tế |
| Năm học | Niên khóa |
| Đơn vị, phân hiệu | Xứ đoàn / Phân đoàn / Ngành / Chi đoàn |
| Phòng học văn hóa | Phòng Giáo lý / Lớp Giáo lý |

Không thay thuật ngữ bằng máy móc khi từ đó xuất hiện trong nội dung trích dẫn, dữ liệu lịch sử hoặc ngữ cảnh không phải Giáo lý.

#### 5.2. Dữ liệu và nguồn sự thật — U; B khi thay đổi dữ liệu

- Không bịa tên, số lượng, chức vụ, ngày, sự kiện, tình trạng tuyển sinh hoặc thời gian phản hồi.
- Lịch, tuổi, lớp, ca học và niên khóa phải lấy từ nguồn đã xác nhận.
- Không suy diễn trạng thái tuyển sinh từ niên khóa.
- Giá trị nghiệp vụ đặc biệt phải có tên trường rõ nghĩa; tránh phép cộng/trừ ngầm trong JSX.
- Dữ liệu theo ngày của giáo xứ dùng múi giờ `Asia/Ho_Chi_Minh`.
- Báo cáo phải nêu nguồn dữ liệu và người xác nhận khi có thay đổi nghiệp vụ.

#### 5.3. Nội dung và hành động — U

- Một màn hình phải giúp người dùng hiểu đây là gì, dành cho ai và cần làm gì tiếp theo.
- Không có CTA placeholder, link sai hoặc nút không hoạt động.
- Nhãn hành động mô tả rõ kết quả; không dùng “OK” cho thao tác có hậu quả.
- Nội dung giao diện dùng tiếng Việt rõ ràng, tránh thuật ngữ triển khai như schema, RPC hoặc tên bảng dữ liệu.

---

### TRỤ CỘT 6 — Quyền riêng tư, phân quyền và an toàn dữ liệu

#### 6.1. Dữ liệu thiếu nhi trên route công khai — U

Không hiển thị công khai:

- Số điện thoại phụ huynh.
- Địa chỉ nhà.
- Ngày sinh chi tiết.
- Danh sách thiếu nhi theo lớp.
- Điểm số, chuyên cần hoặc ghi chú riêng.
- Định danh hoặc dữ liệu khác có thể truy ngược đến một em cụ thể.

Kiểm tra cả dữ liệu nguồn, query, DOM render, log và screenshot bàn giao. Không chỉ kiểm tra một vài tên field như `phone` hoặc `studentList`.

#### 6.2. Phân quyền backend/RLS — C

Áp dụng khi thay đổi query, mutation, role, trang tài khoản, giáo viên hoặc quản trị:

- Quyền truy cập phải được kiểm soát ở backend/RLS, không chỉ bằng ẩn nút hoặc route phía client.
- Có bằng chứng policy/migration hoặc kiểm thử bằng các vai trò liên quan.
- Kiểm tra cả trường hợp không đăng nhập, đúng vai trò và sai vai trò.
- Thay đổi schema phải có migration tương thích và ghi rõ đã áp dụng hay chưa.

#### 6.3. Secret và dữ liệu nhạy cảm — U

- Không đưa service-role key, mật khẩu, token, dữ liệu cá nhân hoặc nội dung lời nhắn vào client code, log, fixture, screenshot hay tài liệu bàn giao.
- Test dùng dữ liệu giả, không gửi thông báo hoặc tạo liên hệ thử đến người thật.
- Không kết luận “không có secret trong git history” nếu chưa chạy công cụ kiểm tra lịch sử phù hợp.

---

## 4. Quy trình bốn cổng chất lượng

```text
[Phạm vi thay đổi]
        ↓
[GATE 0 — Automated checks]
        ↓
[GATE 1 — Developer sign-off]
        ↓
[GATE 2 — QA/UI review]
        ↓
[GATE 3 — Business approval khi áp dụng]
        ↓
[Release]
```

### CỔNG 0: Kiểm tra tự động (Automated checks)

Chạy các kiểm tra liên quan đến phạm vi:

- `npm run build` phải thoát mã `0`; ghi lại cảnh báo build thay vì gọi là “clean” nếu vẫn có warning.
- `npm test` hoặc lệnh test cụ thể phải pass.
- ESLint đúng các file được sửa phải không có lỗi; ghi chính xác lệnh đã chạy.
- Migration, API contract hoặc utility có thay đổi phải có kiểm thử phù hợp.
- Test contract tĩnh là rào chắn hồi quy, không thay thế kiểm tra trình duyệt, accessibility hoặc RLS.

`src/tests/acceptanceContract.test.js` được xem là **Static Acceptance Guardrails**. Việc file này pass không tự động chứng minh sáu trụ cột đã PASS.

### CỔNG 1: Người thực hiện tự kiểm (Developer sign-off)

Người thực hiện phải:

1. Xác nhận đúng route/component đang chạy và không sửa nhầm bản sao.
2. Kiểm tra Git status, phạm vi diff và ảnh hưởng đến component dùng chung.
3. Kiểm tra mobile 320px và 390px trước desktop.
4. Kiểm tra hành động chính, link, trạng thái và dữ liệu.
5. Ghi PASS/FAIL/N/A/NOT TESTED cho từng tiêu chí áp dụng.
6. Không dùng test pass làm bằng chứng duy nhất cho UI/UX.

### CỔNG 2: QA và người duyệt kỹ thuật (QA/UI review)

QA kiểm tra theo rủi ro và phạm vi:

- Viewport 320, 390, 430, 768 và 1280px.
- Light và dark mode.
- Cỡ chữ “Rất lớn” và zoom 200%.
- Bàn phím và focus.
- Reduced motion khi có chuyển động.
- Loading, empty, error, success và uncertain khi có dữ liệu mạng.
- Trạng thái đăng nhập/chưa đăng nhập và các vai trò liên quan.
- Modal/sheet trên màn hình thấp và nội dung dài khi có.

Ảnh tĩnh chỉ chứng minh bố cục tại một thời điểm. Animation, focus, keyboard, scroll, modal và retry cần video, mô tả thao tác hoặc kiểm thử tương tác phù hợp.

### CỔNG 3: Xác nhận nghiệp vụ (Business approval khi áp dụng)

Gate này áp dụng khi thay đổi:

- Lịch, niên khóa, độ tuổi, lớp, ca học hoặc tuyển sinh.
- Thuật ngữ, nội dung Giáo lý, phụng vụ hoặc màu/cơ cấu ngành.
- Dữ liệu thiếu nhi, phân quyền, thông báo gửi cộng đoàn.
- Hành động có ảnh hưởng dữ liệu thật hoặc quy trình vận hành.

Thay đổi kỹ thuật nhỏ không ảnh hưởng nghiệp vụ có thể ghi `N/A` cho Gate 3 kèm lý do. Việc cần Cha Tuyên úy hoặc Ban Điều hành xác nhận do chủ dự án quyết định theo nội dung thay đổi.

---

## 5. Yêu cầu đối với bằng chứng nghiệm thu

Mỗi bằng chứng cần ghi:

- Route/component.
- Commit, nhánh hoặc trạng thái workspace được kiểm tra.
- Viewport CSS.
- Theme.
- Vai trò đăng nhập.
- Trạng thái dữ liệu.
- Cài đặt reduced motion/font scaling nếu có.
- Kết quả mong đợi và kết quả quan sát.

Không dùng:

- Ảnh cũ trước lần sửa cuối.
- Ảnh có chú thích không khớp nội dung thực tế.
- Kết quả test chuỗi để khẳng định hành vi runtime.
- Số liệu tương phản không chỉ rõ cặp màu và nền thực tế.
- Cụm “100% đạt” khi còn hạng mục `NOT TESTED`.

### Ma trận bằng chứng tối thiểu cho thay đổi UI đáng kể

| Kịch bản | 320 | 390 | 430 | 768 | 1280 |
| --- | :---: | :---: | :---: | :---: | :---: |
| Light mode | Bắt buộc | Bắt buộc | Theo rủi ro | Bắt buộc | Bắt buộc |
| Dark mode | Theo rủi ro | Bắt buộc | — | Theo rủi ro | Bắt buộc |
| Font lớn/zoom | Bắt buộc một mobile | Bắt buộc một mobile | — | Theo rủi ro | Zoom 200% |
| Reduced motion | Bắt buộc khi có motion | Bắt buộc khi có motion | — | Theo rủi ro | Bắt buộc khi có motion |

Không nhất thiết phải chụp ảnh mọi ô. Người duyệt cần đủ bằng chứng để xác nhận các breakpoint và trạng thái có rủi ro.

---

## 6. Biên bản nghiệm thu mẫu

```markdown
# BIÊN BẢN NGHIỆM THU

## Phạm vi
- Route/component:
- Mục tiêu người dùng:
- Hành động chính:
- Commit/nhánh/workspace:
- File chính được sửa:
- Phần ngoài phạm vi đã ghi nhận:

## Môi trường kiểm tra
- Viewport:
- Theme:
- Vai trò:
- Font scaling/zoom:
- Reduced motion:
- Trạng thái dữ liệu:

## Kết quả sáu trụ cột
| Trụ cột | Trạng thái | Bằng chứng | Ghi chú/N/A reason |
| --- | --- | --- | --- |
| 1. Mobile và cảm ứng | PASS/FAIL/N/A/NOT TESTED | | |
| 2. Accessibility và tương phản | PASS/FAIL/N/A/NOT TESTED | | |
| 3. REM và font scaling | PASS/FAIL/N/A/NOT TESTED | | |
| 4. Motion, trạng thái và mạng yếu | PASS/FAIL/N/A/NOT TESTED | | |
| 5. Nội dung và nghiệp vụ | PASS/FAIL/N/A/NOT TESTED | | |
| 6. Quyền riêng tư và phân quyền | PASS/FAIL/N/A/NOT TESTED | | |

## Kiểm tra kỹ thuật
- Build:
- Test liên quan:
- ESLint:
- Migration/RLS:
- Cảnh báo đã biết:
- Hạng mục chưa kiểm tra:

## Người xác nhận
- Người thực hiện:
- Người duyệt kỹ thuật:
- Người xác nhận nghiệp vụ, nếu áp dụng:

## Kết luận
- [ ] Được phép phát hành
- [ ] Được phép phát hành có tồn đọng đã chấp nhận
- [ ] Chưa được phép phát hành
```

---

## 7. Điều kiện kết luận

### Được phép phát hành

- Tất cả tiêu chí bắt buộc trong phạm vi là `PASS`.
- Tiêu chí `N/A` có lý do hợp lệ.
- Không còn `FAIL` hoặc `NOT TESTED` có thể ảnh hưởng hành động chính, dữ liệu, accessibility hoặc quyền riêng tư.
- Cảnh báo build và tồn đọng ngoài phạm vi đã được ghi nhận trung thực.

### Được phép phát hành có tồn đọng

Chỉ dùng khi chủ dự án chấp nhận rõ tồn đọng không chặn hành động chính, không làm sai dữ liệu và không tạo rủi ro accessibility, quyền riêng tư hoặc phân quyền. Phải ghi người chấp nhận và kế hoạch xử lý.

### Chưa được phép phát hành

Áp dụng khi có một trong các tình trạng:

- Hành động chính không dùng được.
- Dữ liệu nghiệp vụ sai hoặc chưa được xác nhận.
- Có nguy cơ lộ dữ liệu hoặc sai phân quyền.
- Giao diện vỡ ở viewport bắt buộc hoặc font lớn.
- Không dùng được bằng bàn phím đối với thao tác cốt lõi.
- Nội dung quan trọng bị ẩn trong reduced motion hoặc lỗi tải.
- Bằng chứng không khớp mã nguồn/trạng thái hiện tại.

---

## 8. Lịch sử phiên bản

| Phiên bản | Ngày | Thay đổi chính |
| --- | --- | --- |
| 1.0 | 19/09/2026 | Khởi tạo sáu trụ cột và bốn quality gate. |
| 1.1 | 19/09/2026 | Thêm phạm vi áp dụng, PASS/FAIL/N/A/NOT TESTED, ma trận bằng chứng, tiêu chí có điều kiện, giới hạn của test tự động và quy trình kết luận phát hành. |
