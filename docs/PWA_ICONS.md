# Icon PWA — Ban Giáo Lý An Ngãi

Bộ v2 ngày 15/09/2026 dùng ảnh gốc `logo-ban-giao-ly.jpg` người dùng cung cấp. Chỉ thu nhỏ và thêm khoảng đệm trắng; không vẽ lại chữ, khuôn mặt hay huy hiệu. Bản thử AI không được dùng trong ứng dụng. Ảnh gốc và bộ icon cũ được giữ nguyên.

## Tài nguyên

Tất cả nằm trong `public/images/pwa-v2/`, PNG RGB đục, hình vuông, không bo góc sẵn:

- `apple-touch-152.png`, `apple-touch-167.png`, `apple-touch-180.png`: iPad/iPhone; ảnh nguồn chiếm 92% cạnh.
- `icon-192.png`, `icon-512.png`: manifest purpose `any`, ảnh nguồn chiếm 92% cạnh.
- `maskable-192.png`, `maskable-512.png`: manifest purpose `maskable`, ảnh nguồn chiếm 78% cạnh. Huy hiệu tròn nằm trong vùng an toàn bán kính 40% cạnh.
- `favicon-32.png`, `favicon-48.png`: tab trình duyệt.
- `master-1024.png`: bản xuất lớn để bàn giao, không phải nguồn để xuất lại các cỡ nhỏ.

Không kết hợp `any maskable` trên cùng icon: hai mục đích có khoảng đệm khác nhau. Logo có chữ rất nhỏ nên không thể kỳ vọng đọc hết khi hiển thị 48–60px. Hình Đức Mẹ và huy hiệu là dấu hiệu nhận diện chính ở kích thước này.

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
