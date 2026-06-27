import { useState, useEffect } from "react";
import { useReducedMotion } from "framer-motion";

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia("(max-width: 767px)");
    setIsMobile(mql.matches);
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

  return {
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
  };
}