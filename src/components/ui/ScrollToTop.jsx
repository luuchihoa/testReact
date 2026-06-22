import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useLenis } from "lenis/react"; // Import hook của Lenis

export default function ScrollToTop() {
  const { pathname } = useLocation();
  const lenis = useLenis(); // Lấy thực thể lenis đang chạy toàn cục

  useEffect(() => {
    if (lenis) {
      lenis.scrollTo(0, { immediate: true }); // Cuộn lên đầu trang ngay lập tức khi đổi route
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, lenis]);

  return null;
}