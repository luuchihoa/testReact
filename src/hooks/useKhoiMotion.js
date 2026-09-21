/**
 * useKhoiMotion.js
 * Hook chuẩn hóa hiệu ứng chuyển động trang nghiêm, ấm áp cho nhóm trang Khối Giáo lý
 * Tuân thủ nghiêm ngặt AGENTS.md v1.1:
 * - Hỗ trợ hoàn hảo prefers-reduced-motion (initial: false, hidden/visible: opacity 1, y 0, duration 0)
 * - Hero entrance: Fade & y: 14px, 420ms, stagger 60ms
 * - Section reveal: Fade & y: 14px, 360ms, viewport once
 * - Card reveal: stagger 50ms, y: 12px
 */

import { useReducedMotion } from "framer-motion";

export function useKhoiMotion() {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return {
      shouldReduceMotion: true,
      heroContainerVariants: {
        hidden: { opacity: 1, y: 0 },
        visible: { opacity: 1, y: 0, transition: { duration: 0 } },
      },
      heroItemVariants: {
        hidden: { opacity: 1, y: 0 },
        visible: { opacity: 1, y: 0, transition: { duration: 0 } },
      },
      sectionRevealProps: {
        initial: false,
        transition: { duration: 0 },
      },
      gridContainerVariants: {
        hidden: { opacity: 1, y: 0 },
        visible: { opacity: 1, y: 0, transition: { duration: 0 } },
      },
      cardItemVariants: {
        hidden: { opacity: 1, y: 0 },
        visible: { opacity: 1, y: 0, transition: { duration: 0 } },
      },
    };
  }

  return {
    shouldReduceMotion: false,
    heroContainerVariants: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.06,
          delayChildren: 0.04,
        },
      },
    },
    heroItemVariants: {
      hidden: {
        opacity: 0,
        y: 14,
      },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.42,
          ease: [0.16, 1, 0.3, 1],
        },
      },
    },
    sectionRevealProps: {
      initial: { opacity: 0, y: 14 },
      whileInView: { opacity: 1, y: 0 },
      viewport: { once: true, margin: "-8% 0px" },
      transition: {
        duration: 0.36,
        ease: [0.16, 1, 0.3, 1],
      },
    },
    gridContainerVariants: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.05,
        },
      },
    },
    cardItemVariants: {
      hidden: {
        opacity: 0,
        y: 12,
      },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.32,
          ease: [0.16, 1, 0.3, 1],
        },
      },
    },
  };
}