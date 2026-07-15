# 🎨 DESIGN SYSTEM: BAN GIÁO LÝ - GX AN NGÃI

Tài liệu này quy định hệ thống thiết kế (Design System) dùng chung cho toàn bộ dự án web Ban Giáo Lý.
Phong cách chủ đạo: **Uy nghi, Truyền thống, Ấm áp & Hiện đại (Apple Glassmorphism)**.

---

## 1. BẢNG MÀU (COLOR PALETTE)

Hệ thống sử dụng các utility class của Tailwind CSS. Tuyệt đối không dùng các màu cơ bản (như `bg-blue-500`, `bg-gray-100`...) cho giao diện chính.

### Nền trang (Background)

* **Light Mode:** Trắng ngà (Off-white) `bg-[#FDFBF7]`
* **Dark Mode:** Nâu xám (Dark Stone) `dark:bg-[#1C1917]`

### Màu nhấn (Accent / Primary)

Dùng cho nút bấm chính, icon quan trọng, tiêu đề nổi bật.

* **Tông chủ đạo:** `amber` (Từ Vàng Gold đến Nâu Hổ phách)
* **Sáng (Light):** `amber-900`, `amber-800`, `amber-600`
* **Tối (Dark):** `amber-400`, `amber-500`, `amber-600`

### Màu phụ & Chữ (Neutral / Text)

Dùng cho văn bản, viền, khối nền phụ.

* **Văn bản chính:** `text-amber-950 dark:text-amber-50` (hoặc `text-stone-900 dark:text-stone-100`)
* **Văn bản phụ (Mô tả):** `text-stone-500 dark:text-stone-400`
* **Viền (Border):** Viền cực mỏng tông nâu `border-amber-900/10 dark:border-amber-100/10`

---

## 2. KIỂU CHỮ (TYPOGRAPHY)

Sự phân cấp font chữ tạo nên nét thiêng liêng và uy nghi.

* **Font Serif (Có chân):** Bắt buộc dùng cho Tiêu đề lớn (H1, H2), Tên hệ thống, Quote Lời Chúa.
* *Class Tailwind:* `font-serif`


* **Font Sans-serif (Không chân):** Dùng cho nội dung đọc, nút bấm, thông báo (tối ưu dễ đọc trên điện thoại).
* *Class Tailwind:* `font-sans` (Mặc định)


* **Nhãn phụ (Label / Badge):** Luôn dùng chữ in hoa, in đậm, khoảng cách chữ rộng.
* *Class Tailwind:* `text-[11px] font-bold uppercase tracking-wider`



---

## 3. HIỆU ỨNG & HÌNH KHỐI (EFFECTS & SHAPES)

* **Bo góc (Border Radius):** * Thẻ (Card) lớn: `rounded-[28px]` hoặc `rounded-3xl`
* Nút bấm, Input: `rounded-xl` hoặc `rounded-2xl`
* Nút CTA chính: `rounded-full`


* **Kính mờ (Glassmorphism):** Thẻ luôn dùng nền bán trong suốt kết hợp làm mờ nền phía sau.
* *Class Tailwind:* `bg-white/80 dark:bg-stone-900/40 backdrop-blur-xl`


* **Tương tác (Hover / Active):** Chuyển động mượt mà, thu nhỏ nhẹ khi bấm.
* *Class Tailwind:* `transition-all duration-300 md:hover:-translate-y-0.5 active:scale-[0.98]`



---

## 4. CODE MẪU (SNIPPETS) - COPY & PASTE

### A. Khung trang chuẩn (Page Wrapper)

Mọi trang đều nên được bọc trong cấu trúc này để tự động đổi màu và có Background Pattern.

```jsx
<div className="min-h-screen bg-[#FDFBF7] text-stone-800 dark:bg-[#1C1917] dark:text-stone-200 antialiased overflow-x-hidden selection:bg-amber-500/30 selection:text-amber-950 transition-colors duration-500 relative">
  {/* Lưới nền (Grid Pattern) */}
  <div className="absolute inset-0 bg-[linear-gradient(to_right,#92400E08_1px,transparent_1px),linear-gradient(to_bottom,#92400E08_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#FDE68A05_1px,transparent_1px),linear-gradient(to_bottom,#FDE68A05_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none z-0" />
  
  {/* Vầng sáng (Ambient Glow) - Tuỳ chọn cho Hero Section */}
  <div className="hidden md:block absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-amber-200/40 dark:bg-amber-900/20 blur-[100px] rounded-full -z-10 pointer-events-none" />

  {/* Nội dung chính luôn nằm trên lưới nền */}
  <div className="relative z-10 max-w-5xl mx-auto px-5 sm:px-6">
    {/* Bỏ nội dung vào đây */}
  </div>
</div>

```

### B. Thẻ Nội Dung (Glassmorphism Card)

Dùng để chứa danh sách, bảng biểu, chi tiết thông tin.

```jsx
<div className="bg-white/80 dark:bg-[#1C1917]/80 backdrop-blur-xl rounded-[28px] border border-amber-900/10 dark:border-amber-100/10 p-6 shadow-sm">
  {/* Nội dung */}
</div>

```

### C. Tiêu đề lớn (Section Title)

```jsx
<div className="mb-8">
  <p className="text-[11px] font-bold uppercase tracking-widest text-amber-800/70 dark:text-amber-400/70 mb-2 ml-1">
    Nhãn Phụ
  </p>
  <h2 className="text-2xl sm:text-3xl font-extrabold text-amber-950 dark:text-amber-50 font-serif leading-tight">
    Tiêu đề chính
  </h2>
  <p className="text-[13px] text-stone-500 dark:text-stone-400 font-medium mt-1">
    Đoạn mô tả ngắn gọn chi tiết ở đây.
  </p>
</div>

```

### D. Nút Bấm Chính (Primary Button)

```jsx
<button 
  type="button"
  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-[14px] font-bold bg-amber-900 text-amber-50 dark:bg-amber-600 dark:text-white shadow-sm transition-all duration-300 active:scale-[0.98] md:hover:opacity-90"
>
  Xác nhận
</button>

```

### E. Nút Bấm Phụ (Secondary / Cancel Button)

```jsx
<button 
  type="button"
  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-[14px] font-bold bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-black/5 dark:border-white/5 transition-all duration-300 active:scale-[0.98] md:hover:bg-stone-200 dark:md:hover:bg-stone-700"
>
  Huỷ bỏ
</button>

```

---

## 5. CHUYỂN ĐỘNG & ANIMATION (FRAMER MOTION)

Toàn bộ animation trên hệ thống sử dụng thư viện `framer-motion`. Quy tắc cốt lõi là **mượt mà, không gắt (Apple-like easing)**, hỗ trợ tối ưu Responsive (giảm biên độ di chuyển trên thiết bị di động).

### A. Easing Tiêu Chuẩn (Cubic Easing)

Luôn luôn sử dụng tham số `ease: [0.16, 1, 0.3, 1]` cho các hiệu ứng chuyển động, cuộn, mở rộng. Khung thời gian (`duration`) thường từ `0.3s` đến `0.8s`.

### B. Hiệu Ứng Xuất Hiện Khi Cuộn (Scroll Reveal / Fade Up)

Sử dụng `whileInView` với thuộc tính `viewport={{ once: true, margin: "..." }}` để đảm bảo mượt mà. Phải điều chỉnh giá trị dịch chuyển (`y`) khác nhau trên Mobile và Desktop thông qua hook `useIsMobile()`.

```jsx
<motion.div
  initial={{ opacity: 0, y: isMobile ? 16 : 32 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: isMobile ? "-40px" : "-80px" }}
  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
>
  Nội dung xuất hiện khi cuộn tới...
</motion.div>

```

### C. Hiệu Ứng Danh Sách Nối Tiếp (Stagger Children / Delay)

Khi map một mảng danh sách, sử dụng `delay` nhân với `index` để tạo hiệu ứng cascade (rơi nối tiếp).

```jsx
{DANH_SACH.map((item, index) => (
  <motion.div 
    key={index}
    initial={{ opacity: 0, y: isMobile ? 16 : 20 }} 
    whileInView={{ opacity: 1, y: 0 }} 
    viewport={{ once: true, margin: isMobile ? "-40px" : "-80px" }}
    transition={{ duration: 0.5, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
  >
    Card hoặc Item danh sách
  </motion.div>
))}

```

### D. Mở Rộng / Thu Gọn (Accordion / Dropdown)

Mọi trạng thái ẩn/hiện element làm thay đổi layout phải dùng `AnimatePresence` kết hợp animate chiều cao `height`. Cần thêm thuộc tính `overflow-hidden`.

```jsx
<AnimatePresence initial={false}>
  {isOpen && (
    <motion.div 
      initial={{ height: 0, opacity: 0 }} 
      animate={{ height: "auto", opacity: 1 }} 
      exit={{ height: 0, opacity: 0 }} 
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }} 
      className="overflow-hidden"
    >
      <div className="pb-4">Nội dung chi tiết bên trong...</div>
    </motion.div>
  )}
</AnimatePresence>

```

### E. Chuyển Đổi Component / Trạng Thái (Scale & Fade)

Dùng khi người dùng thao tác xong và cần tráo đổi UI (ví dụ Form nhập liệu sang Màn hình thành công). Cần có `mode="wait"` trong `AnimatePresence`.

```jsx
<AnimatePresence mode="wait">
  {isSuccess ? (
    <motion.div 
      key="success" 
      initial={{ opacity: 0, scale: 0.95 }} 
      animate={{ opacity: 1, scale: 1 }} 
      exit={{ opacity: 0, scale: 0.95 }} 
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      Hoàn thành!
    </motion.div>
  ) : (
    <motion.form 
      key="form" 
      initial={{ opacity: 0, scale: 0.95 }} 
      animate={{ opacity: 1, scale: 1 }} 
      exit={{ opacity: 0, scale: 0.95 }} 
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      Form nhập liệu...
    </motion.form>
  )}
</AnimatePresence>

```

---

## 6. QUY TẮC BẤT DI BẤT DỊCH

1. **Tuyệt đối không dùng `fixed bottom-0**` cho các menu/nút bấm trên giao diện Mobile (ngoại trừ thanh Navigation chính của App) để tránh đè lên thanh điều hướng.
2. Mọi Box Content có shadow cần thêm `backdrop-blur-sm` hoặc `backdrop-blur-xl` để nếu nằm đè lên pattern nền, nó tạo ra hiệu ứng kính mờ (kỹ thuật của iOS).
3. Khi làm UI có màu đỏ (Cảnh báo/Huỷ), dùng mã màu `red-500` hoặc `red-600` kết hợp text trắng, không dùng các màu neon gắt.
4. **Animation phải có điểm dừng:** Tất cả animation cuộn (`whileInView`) đều phải có `viewport={{ once: true }}` để tránh gây loạn nhịp, mất tập trung cho người xem khi họ cuộn lên xuống nhiều lần.


### 7. Sử dụng CSS Media Queries (Tránh Hover trên thiết bị cảm ứng)

Trên di động, sự kiện `hover` có thể bị kẹt lại. Bạn nên bao bọc các hiệu ứng hover bên trong điều kiện `@media (hover: hover)`. Điều này đảm bảo rằng hiệu ứng chỉ hoạt động trên các thiết bị có chuột hoặc con trỏ, không kích hoạt trên màn hình cảm ứng.

```css
/* Chỉ áp dụng hover nếu thiết bị hỗ trợ hover (máy tính) */
@media (hover: hover) {
  .button:hover {
    background-color: #d97706; /* Màu Amber-700 */
    transform: scale(1.02);
  }
}

/* Ưu tiên Mobile: Thiết lập trạng thái nhấn (active) để thay thế hover */
.button:active {
  transform: scale(0.97);
  background-color: #92400e; /* Màu Amber-900 */
}

```

### 8. Sử dụng Tailwind CSS (Đúng chuẩn Mobile-First)

Trong Tailwind, tư duy thiết kế luôn là Mobile-First. Các class cơ bản luôn áp dụng cho di động, còn các class có tiền tố `md:`, `lg:` sẽ áp dụng cho màn hình lớn hơn.

* **Để xử lý hover:** Sử dụng tiền tố `hover:` đi kèm với `md:` để hiệu ứng chỉ xuất hiện trên thiết bị có con trỏ.


* **Để xử lý active (chạm):** Sử dụng `active:` trực tiếp để phản hồi ngay lập tức trên di động.



```html
<!-- Ví dụ nút bấm tối ưu -->
<button 
  class="w-full sm:w-auto px-6 py-4 rounded-xl 
         bg-amber-900 text-white 
         active:scale-[0.97] transition-transform duration-200 
         md:hover:bg-amber-800" 
>
  Đăng ký ngay
</button>

```

### Các nguyên tắc vàng để tối ưu cho Mobile

:

* **Vùng chạm (Hit Targets):** Đảm bảo nút bấm có kích thước tối thiểu là `44px x 44px` (hoặc `h-12`/`h-14` trong Tailwind) để ngón tay có thể chạm chính xác.


* **Active State:** Sử dụng class `active:scale-95` hoặc `active:opacity-80` để người dùng di động nhận được phản hồi ngay lập tức khi chạm vào màn hình.


* **Tránh Hover cố định:** Đừng bao giờ dựa vào `hover` để hiển thị thông tin quan trọng (như menu con hoặc tooltip) vì người dùng di động sẽ không bao giờ nhìn thấy chúng.


* **Overscroll Contain:** Luôn sử dụng `overscroll-contain` trên các phần tử cuộn (như modal, danh sách) để tránh việc cuộn nhầm toàn bộ trang nền phía sau.