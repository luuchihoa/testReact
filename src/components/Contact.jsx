import React from "react";
import { motion } from "framer-motion";

export default function Contact() {
  // Cấu hình Chuyển động đồng nhất, nhẹ nhàng
  const containerVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: { staggerChildren: 0.06, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    initial: { opacity: 0, y: 15 },
    animate: { 
      opacity: 1, 
      y: 0, 
      transition: { type: "spring", stiffness: 260, damping: 24 } 
    }
  };

  return (
    // Đưa motion.div lên bọc ngoài cùng để tiêu đề cũng được hưởng hiệu ứng trượt tuần tự
    <motion.div 
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="mx-auto max-w-4xl px-4 md:px-6 py-12 antialiased"
    >
      {/* Biến phần tiêu đề thành motion.div với itemVariants */}
      <motion.div variants={itemVariants} className="space-y-1 pb-6 border-b border-stone-200/60 mb-8">
        <h3 className="text-xl font-bold tracking-tight text-stone-900 md:text-2xl uppercase font-serif">
          Thông tin liên hệ
        </h3>
        <p className="text-sm text-stone-500">
          Mọi thắc mắc hoặc đóng góp ý kiến, xin vui lòng liên hệ với Ban Giáo Lý qua các kênh dưới đây.
        </p>
      </motion.div>

      {/* Danh sách thẻ liên hệ */}
      <div className="grid grid-cols-1 gap-4">
        {/* 1. Mạng xã hội Facebook */}
        <motion.a 
          href="https://www.facebook.com/profile.php?id=61558564791118" 
          target="_blank" 
          rel="noreferrer"
          variants={itemVariants}
          whileHover={{ y: -3 }}
          className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-stone-200/60 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)] hover:border-amber-500/50 transition-all duration-300 ease-out group cursor-pointer select-none"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-800 border border-amber-100/70 group-hover:bg-amber-800 group-hover:text-white transition-colors duration-300">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-stone-900 tracking-tight">Fanpage Facebook</p>
            <span className="block text-xs md:text-sm text-stone-500 group-hover:text-amber-800 font-medium transition-colors mt-0.5 truncate">
              <span className="hidden md:inline">HTDC Xứ đoàn Mẹ Mân Côi – Giáo xứ An Ngãi</span>
              <span className="md:hidden">HTDC Xứ đoàn Mẹ Mân Côi</span>
            </span>
          </div>
        </motion.a>

        {/* 2. Thư điện tử Email */}
        <motion.a 
          href="mailto:htdcanngai@gmail.com"
          variants={itemVariants}
          whileHover={{ y: -3 }}
          className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-stone-200/60 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)] hover:border-amber-500/50 transition-all duration-300 ease-out group cursor-pointer select-none"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-800 border border-amber-100/70 group-hover:bg-amber-800 group-hover:text-white transition-colors duration-300">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-stone-900 tracking-tight">Email liên hệ</p>
            <span className="block text-xs md:text-sm text-stone-500 group-hover:text-amber-800 font-medium transition-colors mt-0.5 truncate">
              htdcanngai@gmail.com
            </span>
          </div>
        </motion.a>

        {/* 3. Số điện thoại */}
        <motion.a 
          href="tel:0905143643"
          variants={itemVariants}
          whileHover={{ y: -3 }}
          className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-stone-200/60 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)] hover:border-amber-500/50 transition-all duration-300 ease-out group cursor-pointer select-none"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-800 border border-amber-100/70 group-hover:bg-amber-800 group-hover:text-white transition-colors duration-300">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-stone-900 tracking-tight">Điện thoại</p>
            <span className="block text-xs md:text-sm text-stone-500 group-hover:text-amber-800 font-medium transition-colors mt-0.5">
              0905 143 643 <span className="text-xs text-stone-400 font-normal ml-1 group-hover:text-stone-400/80 transition-colors">(Trưởng Trang)</span>
            </span>
          </div>
        </motion.a>
      </div>
    </motion.div>
  );
}