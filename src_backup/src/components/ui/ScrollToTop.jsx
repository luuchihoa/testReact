import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

// Các container route chỉ chuyển tab con bên trong hệ thống, giữ nguyên vị trí cuộn
const TAB_CONTAINER_PREFIXES = ["/tài-khoản", "/quản-trị"];

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

    // Chuyển tab nội bộ trong cùng một phân vùng -> giữ nguyên vị trí cuộn
    if (isSameTabContainer(prevPathname, pathname)) return;

    // Trì hoãn 50ms để AnimatePresence hoàn tất hiệu ứng và trang mới kịp render xong
    const timer = setTimeout(() => {
      // 1. Reset vị trí cuộn mặc định (Mobile & Fallback)
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "instant",
      });

      // 2. Đồng bộ hóa thực thể cuộn mượt Lenis (Desktop)
      if (window.lenis) {
        window.lenis.scrollTo(0, { immediate: true });
        window.lenis.resize();
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
}