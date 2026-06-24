import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

// Phát hiện thiết bị di động để cấu hình động quỹ đạo hoạt họa
const isMobileDevice = typeof window !== "undefined" && /Mobi|Android|iPhone/i.test(navigator.userAgent);

const fadeInUp = {
  hidden: { 
    opacity: 0, 
    y: isMobileDevice ? 8 : 24 // Giảm biên độ di chuyển từ 30 xuống 8px trên mobile để giảm tải tính toán pixel
  },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: isMobileDevice ? 0.35 : 0.5, // Giảm thời gian để UI phản hồi giòn giã hơn trên điện thoại
      ease: "easeOut" 
    } 
  },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: isMobileDevice ? 0.06 : 0.12 } }, // Thắt ngắn so le trên di động
};

export default function HomeAnimated({ Sections }) {
  return (
    <>
      {/* ================= HERO (ANIMATED) ================= */}
      <motion.header
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: isMobileDevice ? 0.05 : 0.08 } } }}
        className="max-w-5xl mx-auto px-6 pt-16 pb-12 md:pt-28 md:pb-20 text-center relative overflow-hidden"
      >
        {/* Tối ưu hóa Overdraw của GPU bằng cách giảm sắc độ mờ mờ hậu cảnh */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-amber-200/15 blur-[120px] rounded-full -z-10 pointer-events-none" />
        
        {/* SVG background giữ nguyên vì dung lượng rất nhẹ */}
        <div
          className="absolute inset-0 -z-10 opacity-[0.025] pointer-events-none"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />

        <motion.div
          variants={fadeInUp}
          className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold bg-amber-50 border border-amber-200/60 text-amber-800 rounded-full mb-6 shadow-sm transform-gpu"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          Ban Giáo Lý An Ngãi
        </motion.div>

        <motion.h1
          variants={fadeInUp}
          className="text-3xl md:text-6xl font-serif font-black tracking-tight text-stone-900 mb-6 max-w-3xl mx-auto leading-[1.15] transform-gpu"
        >
          Nuôi dưỡng đức tin
          <br />
          <span className="bg-gradient-to-r from-amber-700 to-amber-900 bg-clip-text text-transparent">
            Khơi nguồn tri thức vững vàng
          </span>
        </motion.h1>

        <motion.p
          variants={fadeInUp}
          className="max-w-xl mx-auto text-sm md:text-base text-stone-500 italic font-medium leading-relaxed mb-8 border-l-2 border-amber-400/40 px-4 transform-gpu"
        >
          "Lời Chúa là ngọn đèn soi cho con bước, là ánh sáng chỉ đường cho con đi."
        </motion.p>

        <motion.div variants={fadeInUp} className="flex items-center justify-center gap-4 transform-gpu">
          <button
            onClick={() => {
              document.getElementById("main-content")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="inline-flex items-center justify-center rounded-xl text-sm font-semibold bg-amber-800 text-white hover:bg-amber-900 h-11 px-6 shadow-md shadow-amber-900/10 transition-all duration-300 hover:-translate-y-0.5 ease-out"
          >
            Bắt đầu học hỏi
          </button>
          <Link
            to="/giới-thiệu"
            className="inline-flex items-center justify-center rounded-xl text-sm font-semibold border border-stone-200 bg-white text-stone-800 hover:bg-stone-50 h-11 px-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 ease-out"
          >
            Tìm hiểu thêm
          </Link>
        </motion.div>
      </motion.header>

      {/* ================= BENTO GRID (ANIMATED) ================= */}
      <main id="main-content" className="max-w-5xl mx-auto px-6 scroll-mt-12 pb-16">
        <motion.div
          initial="hidden"
          whileInView="visible"
          // Nới lỏng margin và hạ amount xuống 0.1 để kích hoạt mượt mà khi cuộn chạm nhẹ
          viewport={{ once: true, margin: "-40px", amount: 0.1 }}
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {Sections.map((section) => {
            const IconComponent = section.icon;
            return (
              <motion.div
                key={section.path}
                variants={fadeInUp}
                // ⚡ KHÓA HOVER TRÊN MOBILE: Chỉ cho phép chạy hiệu ứng nhấc thẻ lò xo khi ở trên Desktop
                whileHover={isMobileDevice ? {} : { y: -6, scale: 1.01 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={`${section.gridClass} transform-gpu will-change-transform`}
              >
                <Link to={section.path} className="group block h-full">
                  <div className="relative h-full bg-white border border-stone-200/80 rounded-2xl transition-all duration-300 ease-out hover:shadow-xl hover:shadow-amber-900/[0.04] hover:border-amber-400 overflow-hidden flex flex-col sm:flex-row">
                    <span
                      aria-hidden="true"
                      className="absolute -right-2 -bottom-6 font-serif font-black text-[120px] leading-none text-amber-900/[0.04] select-none pointer-events-none"
                    >
                      {section.numeral}
                    </span>

                    <div className="relative w-full sm:w-[65%] flex flex-col justify-between z-10">
                      <div className="p-6 md:p-8 pb-3 flex-1">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-amber-50 text-amber-700 group-hover:bg-amber-800 group-hover:text-white transition-colors duration-300 ease-out flex-shrink-0">
                            <IconComponent className="w-4 h-4 stroke-[2]" />
                          </div>
                          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-stone-100 text-stone-600 border border-stone-200/50">
                            {section.badge}
                          </span>
                        </div>

                        <h3 className="text-xl font-bold text-stone-900 tracking-tight mb-2">
                          {section.title}
                        </h3>
                        <p className="text-sm text-stone-500 leading-relaxed font-normal break-words">
                          {section.desc}
                        </p>
                      </div>

                      <div className="p-6 md:p-8 pt-0 flex items-center gap-1 text-xs font-bold text-amber-800 opacity-80 group-hover:opacity-100 transition-all duration-300 ease-out">
                        Xem chi tiết
                        <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 ease-out group-hover:translate-x-1" />
                      </div>
                    </div>

                    <div className="relative w-full sm:w-[35%] p-6 pt-0 sm:pt-6 sm:pl-0 flex items-center justify-center flex-shrink-0 z-10">
                      {/* Thao tác đổ bóng mượt shadow-inner giữ nguyên, không sử dụng backdrop-blur nên an toàn cho iOS */}
                      <div className="relative flex items-center justify-center aspect-square w-full max-w-[140px] sm:max-w-full rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50/50 border border-amber-100/50 p-3 overflow-hidden shadow-inner">
                        <img
                          src={section.img}
                          alt={section.title}
                          width="320"
                          height="320"
                          loading="lazy"
                          className="max-h-full max-w-full object-contain filter mix-blend-multiply drop-shadow-[0_4px_12px_rgba(0,0,0,0.06)] group-hover:scale-105 transition-transform duration-500 ease-out"
                        />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </main>
    </>
  );
}