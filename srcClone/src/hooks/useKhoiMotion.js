import { useRef } from "react";
import { useScroll, useTransform } from "framer-motion";
import { useLenis } from "lenis/react";

import { useMotionConfig } from "./useMotionConfig.js";

// Fallback chuẩn Apple Motion Curves — dùng khi useMotionConfig() chưa sẵn sàng
// (giữ nguyên giá trị đã dùng rải rác trong các file Khoi*.jsx trước refactor)
const DEFAULT_MC = {
  yOffset: 30,
  duration: (d) => d || 0.6,
  delay: (d) => d || 0,
  stagger: 0.08,
  isMobile: false,
  reduced: false,
  vp: () => ({ once: true, margin: "-12% 0px" }),
  heroParallax: [0, -60],
};

/**
 * Gộp toàn bộ boilerplate motion (hero parallax, fadeUp variants, viewport config)
 * từng bị lặp lại giữa KhoiChienCon.jsx, KhoiRuocLe.jsx, ... về một chỗ.
 *
 * Dùng: const { heroRef, lenis, mc, heroY, fadeUp, vp } = useKhoiMotion();
 */
export function useKhoiMotion() {
  const heroRef = useRef(null);
  const { scrollY } = useScroll();
  const lenis = useLenis();

  const systemConfig = useMotionConfig();
  const mc = systemConfig || DEFAULT_MC;

  const heroY = useTransform(scrollY, [0, 600], mc.heroParallax || [0, -60]);

  const fadeUp = {
    hidden: { opacity: 0, y: mc.yOffset },
    visible: (d = 0) => ({
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 90, damping: 15, mass: 0.8, delay: mc.delay(d) },
    }),
  };

  const vp = mc.vp();

  return { heroRef, lenis, mc, heroY, fadeUp, vp };
}