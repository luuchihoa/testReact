import { useState, useEffect } from "react";
import { useReducedMotion } from "framer-motion";

// export function useIsMobile() {
//   const [isMobile, setIsMobile] = useState(false);
//   useEffect(() => {
//     const mql = window.matchMedia("(max-width: 767px)");
//     setIsMobile(mql.matches);
//     const handler = (e) => setIsMobile(e.matches);
//     mql.addEventListener("change", handler);
//     return () => mql.removeEventListener("change", handler);
//   }, []);
//   return isMobile;
// }
export function useIsMobile(breakpoint = 768) {
  const query = `(max-width: ${breakpoint - 1}px)`;
 
  const getMatch = () =>
    typeof window !== "undefined" && "matchMedia" in window
      ? window.matchMedia(query).matches
      : false;
 
  const [isMobile, setIsMobile] = useState(getMatch);
 
  useEffect(() => {
    if (typeof window === "undefined" || !("matchMedia" in window)) return;
    const mql = window.matchMedia(query);
    const onChange = (e) => setIsMobile(e.matches);
 
    setIsMobile(mql.matches);
    // addEventListener is preferred; addListener is the Safari <14 fallback.
    if (mql.addEventListener) mql.addEventListener("change", onChange);
    else mql.addListener(onChange);
 
    return () => {
      if (mql.removeEventListener) mql.removeEventListener("change", onChange);
      else mql.removeListener(onChange);
    };
  }, [query]);
 
  return isMobile;
}

export function useMotionConfig() {
  const isMobile = useIsMobile();
  const prefersReducedMotion = useReducedMotion();
  const reduced = prefersReducedMotion || isMobile;

  return {
    isMobile,
    reduced,
    yOffset: reduced ? 12 : 40,
    duration: (base = 0.7) => (reduced ? base * 0.6 : base),
    stagger: reduced ? 0.06 : 0.12,
    delay: (base = 0) => (reduced ? base * 0.5 : base),
    heroParallax: isMobile ? [0, 0] : [0, -80],
    vp: (margin = "-100px 0px") => ({
      once: true,
      margin: isMobile ? "-20px 0px" : margin,
    }),
  };
}