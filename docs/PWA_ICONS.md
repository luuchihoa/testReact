# Icon PWA & Nhận diện Đa Kích Thước — Ban Giáo Lý An Ngãi

Bộ v3 ngày 20/09/2026 chuẩn hóa nhận diện thương hiệu số:
- **Nền nhận diện thương hiệu:** Sử dụng nền xanh rêu Công giáo `#314e3e` kết hợp viền vàng kim `#d4b47d` và huy hiệu Mẹ Mân Côi `logo_htdc.png`.
- **Favicon Vector:** Bổ sung `public/favicon.svg` sắc nét 100% trên màn hình Retina / High-DPI và bộ favicon PNG độ tương phản cao.

## Tài nguyên

Tất cả nằm trong `public/images/pwa-v2/` và `public/`:

- `public/favicon.svg`: Favicon vector SVG độ tương phản cao (nền `#314e3e`, viền & biểu tượng vương miện/Thánh giá vàng kim `#d4b47d`).
- `apple-touch-152.png`, `apple-touch-167.png`, `apple-touch-180.png`: iPad/iPhone; nền `#314e3e`, viền vàng kim, ảnh nguồn chiếm 88% cạnh.
- `icon-192.png`, `icon-512.png`: manifest purpose `any`, nền `#314e3e`, viền vàng kim, ảnh nguồn chiếm 88% cạnh.
- `maskable-192.png`, `maskable-512.png`: manifest purpose `maskable`, nền xanh `#314e3e` tràn 100% canvas, huy hiệu tròn nằm trọn trong vùng an toàn bán kính 40% cạnh (78% đường kính).
- `favicon-32.png`, `favicon-48.png`: tab trình duyệt dạng raster độ tương phản cao.
- `master-1024.png`: bản xuất lớn 1024×1024.

## Tích hợp

`index.html` dùng `%BASE_URL%`; manifest dùng URL tương đối với vị trí manifest cho start_url, scope và icons. Modal cài đặt dùng `import.meta.env.BASE_URL`. Tên thư mục v2 tách cache tài nguyên khỏi bộ cũ.

Plugin `built-spa-fallback` trong `vite.config.js` tạo `dist/200.html` từ index đã build, thay bản sao từ public có đường dẫn nguồn cũ. Triển khai output build; không triển khai trực tiếp `public/200.html`.

## Kiểm tra đã thực hiện

- Build mặc định và build với base `/testReact/`: thành công, vẫn có cảnh báo bundle trên 600 kB của ứng dụng.
- ESLint `src/components/ui/PWAInstallModal.jsx`: thành công.
- Kiểm tra cả hai output: kích thước PNG, RGB, đường dẫn manifest/icon, index và fallback giống nhau.
- Kiểm tra pixel có màu rõ của logo maskable không vượt vùng tròn bán kính 40%.
- Xem icon phục vụ từ localhost trong trình duyệt và bản mô phỏng cắt tròn/bo góc `pwa-icons-preview.png`.

Chưa kiểm tra cài đặt trên iPhone/iPad/Android thật, chưa deploy; bản preview là mô phỏng hình dạng, không phải ảnh chụp thiết bị. Không thay đổi service worker/offline hoặc luồng cài đặt trong nhiệm vụ này. Sau khi triển khai, kiểm tra thêm Add to Home Screen trên Safari iOS và cài đặt Chrome Android; shortcut cũ có thể cần thêm lại để nhận icon mới.

## Tài liệu nền tảng

- [Apple: Specifying a Webpage Icon for Web Clip](https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/ConfiguringWebApplications/ConfiguringWebApplications.html)
- [web.dev: Maskable icons và vùng an toàn](https://web.dev/articles/maskable-icon)
- [MDN: Manifest icons và cách phân giải URL](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest/Reference/icons)
