import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Cuộn thẳng lên đầu trang ngay lập tức khi pathname thay đổi
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}