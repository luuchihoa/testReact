import React from "react";
import { motion } from "framer-motion";

export default function Setting({ fontSize, setFontSize }) {
  // Danh sách cấu hình các mức cỡ chữ
  const sizeOptions = [
    { key: "sm", label: "Nhỏ" },
    { key: "base", label: "Trung bình" },
    { key: "lg", label: "Lớn" },
    { key: "xl", label: "Lớn hơn" }
  ];

  // Khởi tạo Animation mượt chuẩn Apple
  const containerVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { 
      opacity: 1, 
      y: 0, 
      transition: { type: "spring", stiffness: 260, damping: 26 } 
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="mx-auto max-w-5xl px-4 md:px-6 py-12 antialiased"
    >
      {/* Tiêu đề Phân vùng chuẩn Shadcn UI */}
      <div className="space-y-1 pb-6 border-b border-stone-200/60 mb-8">
        <h3 className="text-xl font-bold tracking-tight text-stone-900 md:text-2xl uppercase font-serif flex items-center gap-2">
          Cài đặt hệ thống
        </h3>
        <p className="text-sm text-stone-500">
          Tùy chỉnh cấu hình giao diện hiển thị để có trải nghiệm học hỏi giáo lý tốt nhất.
        </p>
      </div>

      {/* Khu vực tùy chỉnh Cỡ chữ */}
      <div className="space-y-4 max-w-2xl">
        <div className="flex items-center gap-2 text-stone-600">
          {/* SVG Biểu tượng chữ Aa */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-stone-400">
            <path d="M4 7V4h16v3M9 20h6M12 4v16" />
          </svg>
          <span className="text-sm font-semibold tracking-tight text-stone-700">Cỡ chữ hiển thị</span>
        </div>

        {/* Thiết kế Segmented Control phong cách iOS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1 rounded-2xl bg-stone-100/80 border border-stone-200/30 shadow-inner">
          {sizeOptions.map((option) => {
            const isActive = fontSize === option.key;
            return (
              <button
                key={option.key}
                onClick={() => setFontSize(option.key)}
                className={`relative h-10 text-sm font-semibold rounded-xl transition-colors duration-200 select-none ${
                  isActive ? "text-stone-900" : "text-stone-500 hover:text-stone-800"
                }`}
              >
                {/* Thanh chạy nền di chuyển mượt mà (Pill Indicator) khi chọn size */}
                {isActive && (
                  <motion.div
                    layoutId="activeFontSizeIndicator"
                    className="absolute inset-0 bg-white rounded-xl shadow-sm border border-stone-200/40"
                    transition={{ type: "spring", stiffness: 350, damping: 28 }}
                  />
                )}
                <span className="relative z-10">{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}