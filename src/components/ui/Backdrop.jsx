import React from "react";
import { motion } from "framer-motion";

// Hằng số Easing chuẩn của Design System
const APPLE_EASE = [0.16, 1, 0.3, 1];

export default function Backdrop({ handleClose, onClick, children }) {
  // Chấp nhận cả hai tên prop để tương thích ngược trên toàn bộ codebase[cite: 13]
  const close = onClick ?? handleClose; //[cite: 13]

  return (
    <motion.div
      // Tinh chỉnh lớp màu: Kết hợp màu stone tối mờ tinh tế cho Dark mode 
      // để các khối Glassmorphism phía trên nổi bật đúng khối lớp vật lý.
      className="fixed inset-0 z-[999] flex items-center justify-center bg-stone-900/40 dark:bg-black/60 backdrop-blur-sm px-4" //[cite: 13]
      initial={{ opacity: 0 }} //[cite: 13]
      animate={{ opacity: 1 }} //[cite: 13]
      exit={{ opacity: 0 }} //[cite: 13]
      // Tăng nhẹ duration lên 0.3s kết hợp hiệu ứng APPLE_EASE để lớp kính mờ xuất hiện mượt mà, tự nhiên
      transition={{ duration: 0.3, ease: APPLE_EASE }}
      onClick={(e) => {
        // Chỉ kích hoạt khi click trực tiếp vào chính lớp nền, tránh bong bóng sự kiện từ con[cite: 13]
        e.preventDefault(); //[cite: 13]
        close?.(e); //[cite: 13]
      }}
    >
      {children}
    </motion.div>
  );
}