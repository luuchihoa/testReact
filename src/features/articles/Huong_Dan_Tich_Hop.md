# Hướng dẫn tích hợp tính năng Bài viết

## 1. Cài đặt thư viện render Markdown an toàn

```bash
npm install react-markdown remark-gfm
```

Nếu chưa cài Tailwind Typography (dùng cho class `prose`):

```bash
npm install -D @tailwindcss/typography
```

Thêm vào `tailwind.config.js`:

```js
module.exports = {
  // ...
  plugins: [require("@tailwindcss/typography")],
};
```

## 2. Chạy migration SQL

Chạy `sql/migration_articles.sql` trên Supabase SQL Editor **sau khi** schema gốc đã tồn tại (bảng `users`, `notifications`, hàm `my_username()`/`is_admin()`).

## 3. Copy các file component

Copy toàn bộ thư mục `src/components/articles/` và file `src/components/admin/ArticlesTab.jsx` vào đúng vị trí tương ứng trong project. Copy `src/lib/slugify.js` vào `src/lib/`.

## 4. Cập nhật `App.jsx`

File `src/App.jsx` trong gói này **đã là bản hoàn chỉnh** — thay thế trực tiếp file `App.jsx` hiện tại của bạn bằng file này (đã bao gồm sẵn lazy import + route cho `/bài-viết`, `/bài-viết/:slug`, `/bài-viết-của-tôi`, `/bài-viết-của-tôi/soạn`, `/bài-viết-của-tôi/soạn/:id` và tab `quản-trị/bài-viết`).

Nếu bạn đã tuỳ chỉnh `App.jsx` gốc (thêm route/logic riêng), đừng ghi đè trực tiếp — mở diff và merge tay phần liên quan đến "Bài viết" (được đánh dấu comment `{/* ── Bài viết ── */}`) vào file của bạn.

Component `RequireAuthRoute` mới được định nghĩa ngay trong `App.jsx` (không cần tạo file riêng) — chặn truy cập 3 route `bài-viết-của-tôi*` khi chưa đăng nhập, tự mở modal đăng nhập (`toggleModal()`) và điều hướng về `/`.

## 5. Cập nhật `Header.jsx`

Thêm vào `COMMUNITY_ITEMS`:

```jsx
{ path: "/bài-viết", label: "Bài viết", icon: FileText, desc: "Chia sẻ từ cộng đoàn" },
```

Thêm mục cá nhân cho MỌI vai trò đã đăng nhập — sửa `ROLE_EXTRA_ITEMS` để "Bài viết của tôi" xuất hiện với tất cả role thay vì rỗng ở `student`/`user`:

```js
const ROLE_EXTRA_ITEMS = {
  admin: [
    { path: "/quản-trị", label: "Quản trị hệ thống", icon: LayoutDashboard },
    { path: "/bài-viết-của-tôi", label: "Bài viết của tôi", icon: FileText },
  ],
  teacher: [
    { path: "/quản-lý-học-sinh/", label: "Lớp học của tôi", icon: GraduationCap },
    { path: "/bài-viết-của-tôi", label: "Bài viết của tôi", icon: FileText },
  ],
  student: [{ path: "/bài-viết-của-tôi", label: "Bài viết của tôi", icon: FileText }],
  user:    [{ path: "/bài-viết-của-tôi", label: "Bài viết của tôi", icon: FileText }],
};
```

Thêm icon cho loại thông báo mới vào `NOTIF_TYPE_ICON`:

```js
bai_viet: FileText,
```

## 6. Cập nhật admin dashboard (tuỳ chọn)

Nếu `AdminLayout.jsx` có danh sách tab dạng mảng (tương tự `DashboardTab`, `UsersTab`...), thêm 1 tab "Duyệt bài viết" trỏ tới `ArticlesTab`. Có thể hiển thị số badge bằng RPC `get_pending_articles_count()` đã tạo trong migration.

## 7. Điểm bảo mật đã xử lý — không tự ý bỏ qua

- `content` lưu **markdown thô**, không lưu HTML. `ReactMarkdown` luôn dùng `skipHtml` để chặn HTML/script nhúng trong bài viết — không thay bằng `dangerouslySetInnerHTML`.
- RLS chặn tác giả sửa bài khi đang `pending`/`published` — chỉ sửa được ở `draft`/`rejected`.
- `submit_article()` giới hạn tối đa 3 bài `pending` đồng thời/tác giả để hạn chế spam.
- `review_article()` bắt buộc nhập lý do khi từ chối, chỉ admin gọi được (kiểm tra `is_admin()` trong hàm, không dựa vào RLS phía client).