import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

// Những "container" route mà việc đổi path con bên trong chỉ là đổi TAB
// (không phải chuyển trang thật, VD /tài-khoản/hồ-sơ ↔ /tài-khoản/thành-tích)
// — không nên cuộn lên đầu khi đổi. Thêm prefix mới vào đây nếu sau này có
// thêm trang dạng tab tương tự.
const TAB_CONTAINER_PREFIXES = ["/tài-khoản"];

function isSameTabContainer(prevPath, nextPath) {
  return TAB_CONTAINER_PREFIXES.some(
    (prefix) => prevPath.startsWith(prefix) && nextPath.startsWith(prefix)
  );
}

export default function ScrollToTop() {
  const { pathname } = useLocation();
  const prevPathnameRef = useRef(pathname);

  useEffect(() => {
    const prevPathname = prevPathnameRef.current;
    prevPathnameRef.current = pathname;

    // Chuyển tab trong cùng 1 container (VD /tài-khoản/hồ-sơ → /tài-khoản/thành-tích)
    // thì giữ nguyên vị trí cuộn — chỉ cuộn lên đầu khi thực sự sang trang khác.
    if (isSameTabContainer(prevPathname, pathname)) return;

    // Sử dụng setTimeout (0ms hoặc 10ms) để đẩy lệnh cuộn vào cuối hàng đợi (Macro-task).
    // Điều này ép trình duyệt phải chạy hiệu ứng AnimatePresence xong,
    // vẽ xong giao diện trang mới rồi mới chính thức cuộn lên đầu.
    const timer = setTimeout(() => {
      // 1. Reset cuộn mặc định của trình duyệt (Dành cho Mobile)
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "instant", // Ép lên đầu ngay lập tức không chạy mượt giật cục
      });

      // 2. Reset cuộn của Lenis (Dành cho Desktop nếu có)
      // Tìm thực thể lenis từ các thư viện lazy hoặc window toàn cục
      if (window.lenis) {
        window.lenis.scrollTo(0, { immediate: true });
        window.lenis.resize();
      }
    }, 0); // Trì hoãn 50ms là khoảng thời gian hoàn hảo để trang mới kịp Render

    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
}