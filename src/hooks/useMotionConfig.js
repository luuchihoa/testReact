import { useState, useEffect, useMemo } from "react";
import { useReducedMotion } from "framer-motion";

export function useIsMobile() {
  // Lazy initializer: chạy đồng bộ ngay lần render đầu, lấy đúng giá trị
  // thật của viewport thay vì mặc định false rồi phải "sửa sai" ở effect
  // sau đó -> loại bỏ hoàn toàn cú re-render gây race với animation.
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false; // SSR-safe fallback
    return window.matchMedia("(max-width: 767px)").matches;
  });

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 767px)");
    const handler = (e) => setIsMobile(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  return isMobile;
}

export function useMotionConfig() {
  const isMobile = useIsMobile();
  const prefersReducedMotion = useReducedMotion();
  const reduced = prefersReducedMotion || isMobile;

  // Memo hóa toàn bộ object trả về: chỉ tạo lại khi isMobile/reduced thực
  // sự đổi (ví dụ người dùng xoay màn hình / resize qua breakpoint), không
  // tạo mới mỗi lần component cha re-render vì lý do khác.
  return useMemo(() => ({
    isMobile,
    reduced,
    yOffset: reduced ? 8 : 28,
    duration: (base = 0.7) => (reduced ? base * 0.6 : base),
    stagger: reduced ? 0.06 : 0.12,
    delay: (base = 0) => (reduced ? base * 0.5 : base),
    heroParallax: isMobile ? [0, 0] : [0, -80],
    vp: (margin = "-60px 0px") => ({
      once: true,
      margin: isMobile ? "0px" : margin,
    }),
  }), [isMobile, reduced]);
}