import React, { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { MapPin, Heart, Sparkles, Clock } from "lucide-react";

/* ─── Hook Mobile ─────────────────────────────────────────────── */
function useIsMobile() {
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

/* ─── Hook Motion Config (nhất quán với toàn dự án) ──────────── */
function useMotionConfig() {
  const isMobile = useIsMobile();
  const prefersReducedMotion = useReducedMotion();
  const reduced = prefersReducedMotion || isMobile;

  return {
    isMobile,
    reduced,
    yOffset:  reduced ? 8 : 28,
    duration: (base = 0.7) => reduced ? base * 0.6 : base,
    stagger:  reduced ? 0.06 : 0.12,
    delay:    (base = 0) => reduced ? base * 0.5 : base,
  };
}

/* ── Data ── */
const MEANING = [
  {
    swatch: "bg-white border border-stone-200 dark:border-stone-800 shadow-sm",
    title: "Trắng tinh tuyền",
    desc: "Sự thanh khiết tuyệt đối và tinh thần hy sinh phục vụ vô điều kiện.",
  },
  {
    swatch: "bg-teal-600 dark:bg-teal-500 shadow-inner",
    title: "Xanh sức sống",
    desc: "Tâm hồn căng tràn năng lượng, mang niềm hy vọng hướng về tương lai.",
  },
  {
    swatch: "bg-rose-600 dark:bg-rose-500 shadow-inner",
    title: "Sắc Hoa Hồng",
    desc: "Biểu trưng sâu sắc cho tình yêu — sự che chở chở che của Mẹ Maria.",
  },
];

const MASS_REGULAR = [
  { label: "Thánh Lễ Sáng", time: "04:30" },
  { label: "Thánh Lễ Chiều", time: "17:30" },
];

const MASS_SUNDAY = [
  { label: "Thánh Lễ I",   note: "Chiều Thứ Bảy (Lễ Thay Chủ Nhật)", time: "17:30" },
  { label: "Thánh Lễ II",  note: "Sáng Chủ Nhật (Lễ Cộng Đoàn)",     time: "05:00" },
  { label: "Thánh Lễ III", note: "Sáng Chủ Nhật (Thánh Lễ Thiếu Nhi)", time: "08:00" },
  { label: "Thánh Lễ IV",  note: "Chiều Chủ Nhật (Lễ Cộng Đoàn)",    time: "15:00" },
];

/* ── SVG Rose Icon ── */
function RoseIcon({ className }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none">
      <path d="M24 20C24 20 30 32 24 44" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-teal-700 dark:text-teal-400" />
      <path d="M24 28C24 28 18 30 16 26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-teal-700 dark:text-teal-400" />
      <path d="M24 34C24 34 30 36 32 32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-teal-700 dark:text-teal-400" />
      <circle cx="24" cy="14" r="10" fill="#FB7185" opacity="0.2" />
      <circle cx="24" cy="14" r="7.5" fill="#F43F5E" opacity="0.5" />
      <circle cx="24" cy="14" r="5" fill="#BE123C" />
      <circle cx="24" cy="14" r="2" fill="#881337" />
    </svg>
  );
}

/* ═══════════════════════════════════════════ */
export default function GioiThieu() {
  const mc = useMotionConfig();

  const fadeUp = {
    hidden:  { opacity: 0, y: mc.yOffset },
    visible: (delay = 0) => ({
      opacity: 1, y: 0,
      transition: {
        duration: mc.duration(0.6),
        ease: [0.16, 1, 0.3, 1],
        delay: mc.delay(delay),
      },
    }),
  };

  const staggerContainer = {
    hidden:  {},
    visible: { transition: { staggerChildren: mc.stagger } },
  };

  const vp = { once: true, margin: mc.isMobile ? "-5% 0px" : "-10% 0px" };

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-stone-900 dark:bg-[#000000] dark:text-stone-50 antialiased overflow-x-hidden transition-colors duration-500 relative">
      
      {/* Premium Apple Background Blur Grids */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* ══ HERO SECTION ══ */}
      <header className="relative max-w-4xl mx-auto px-5 pt-12 pb-10 md:pt-24 md:pb-16 text-center overflow-hidden">
        {!mc.isMobile && (
          <>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-teal-500/5 dark:bg-teal-500/10 blur-[120px] rounded-full -z-10 pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-[400px] h-[250px] bg-rose-500/5 dark:bg-rose-500/10 blur-[100px] rounded-full -z-10 pointer-events-none" />
          </>
        )}

        <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-4">
          <motion.div variants={fadeUp} custom={0}>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold uppercase tracking-wider bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 text-stone-600 dark:text-stone-400 rounded-full shadow-sm select-none">
              <RoseIcon className="w-3.5 h-3.5" />
              Giáo phận Đà Nẵng · An Ngãi
            </span>
          </motion.div>

          <motion.h1 variants={fadeUp} custom={0.05}
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-stone-900 dark:text-white leading-[1.15]"
          >
            Xứ Đoàn<br />
            <span className="bg-gradient-to-r from-teal-600 via-stone-800 to-rose-600 bg-clip-text text-transparent dark:from-teal-400 dark:via-stone-200 dark:to-rose-400">
              Mẹ Mân Côi
            </span>
          </motion.h1>

          <motion.p variants={fadeUp} custom={0.1}
            className="max-w-md mx-auto text-xs sm:text-sm text-stone-500 dark:text-stone-400 leading-relaxed font-medium"
          >
            Đổi mới phương thức giảng dạy, phát huy sứ vụ Thiếu Nhi Tông Đồ, đồng hành kiến tạo và lan tỏa Tin Mừng Nước Chúa.
          </motion.p>
        </motion.div>
      </header>

      <main className="max-w-4xl mx-auto px-5 pb-20 space-y-12 relative z-10">

        {/* ══ ĐỨC MẸ MÂN CÔI (Bento Card Style) ══ */}
        <motion.section initial="hidden" whileInView="visible" viewport={vp} variants={staggerContainer}>
          <motion.div variants={fadeUp} custom={0}
            className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/60 dark:border-stone-800/80 p-6 sm:p-10 shadow-sm dark:shadow-none text-left"
          >
            <div className="flex items-center gap-3 mb-6 border-b border-stone-100 dark:border-stone-800/60 pb-5">
              <div className="w-10 h-10 rounded-xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200/40 dark:border-stone-700/50 flex items-center justify-center flex-shrink-0">
                <RoseIcon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">Đấng Bảo Trợ Bổn Mạng</p>
                <h2 className="text-base sm:text-lg font-extrabold text-stone-900 dark:text-white tracking-tight">Đức Mẹ Mân Côi</h2>
              </div>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed font-medium">
              <p>
                Đức Mẹ Mân Côi — danh hiệu cao quý của Đức Trinh Nữ Maria gắn liền với Kinh Mân Côi linh thánh. Đại lễ kính Mẹ được cử hành phụng vụ vào <strong className="text-stone-900 dark:text-stone-100 font-bold">ngày 07 tháng 10</strong> hằng năm, ghi dấu bước ngoặt lịch sử trận hải chiến Lepanto năm 1571.
              </p>
              <p>
                Hình tượng Đức Mẹ ban ơn biểu trưng cho vẻ đẹp tinh khiết vẹn toàn. Chiêm ngắm nhan thánh hiền từ của Mẹ giúp mỗi đoàn sinh thức tỉnh tâm hồn, vững vàng vượt qua những áp lực thế tục, danh vọng lệch lạc và cám dỗ đời thường.
              </p>
              <p>
                Mẹ mời gọi chúng ta sống đời nhân đức, ngay thẳng và lương thiện; khắc cốt ghi tâm những mầu nhiệm Tin Mừng làm nền tảng vững chắc đem lại sự an lành và hạnh phúc đích thực.
              </p>
            </div>

            <div className="mt-6 pt-5 border-t border-stone-100 dark:border-stone-800/60 flex items-start gap-3">
              <Heart className="w-4 h-4 text-rose-500 dark:text-rose-400 flex-shrink-0 mt-0.5" fill="currentColor" />
              <p className="text-xs sm:text-sm font-semibold text-stone-500 dark:text-stone-400 italic leading-relaxed">
                "Mẹ luôn che chở cho đoàn con, chỉ cần tâm thành cầu nguyện, Mẹ không phân biệt màu da, tôn giáo hay chức vụ."
              </p>
            </div>
          </motion.div>
        </motion.section>

        {/* ══ Ý NGHĨA MÀU SẮC ══ */}
        <motion.section initial="hidden" whileInView="visible" viewport={vp} variants={staggerContainer}>
          <motion.div variants={fadeUp} custom={0} className="text-left mb-4 select-none">
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500">
              Hệ thống ký hiệu và sắc màu
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {MEANING.map((item, i) => (
              <motion.div
                key={item.title}
                variants={fadeUp}
                custom={i * 0.04}
                className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/60 dark:border-stone-800/80 p-4.5 shadow-sm dark:shadow-none flex items-start gap-3.5 text-left"
              >
                <div className={`flex-shrink-0 w-6 h-6 rounded-full mt-0.5 ${item.swatch}`} />
                <div className="min-w-0">
                  <h3 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-white truncate">{item.title}</h3>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 font-medium leading-relaxed mt-1">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ══ GIỜ LỄ PHỤNG VỤ ══ */}
        <motion.section initial="hidden" whileInView="visible" viewport={vp} variants={staggerContainer}>
          <motion.div variants={fadeUp} custom={0} className="text-left mb-4 select-none">
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500">
              Lịch trình Phụng vụ Cộng đoàn
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            
            {/* Lễ ngày thường */}
            <motion.div
              variants={fadeUp} custom={0.05}
              className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/60 dark:border-stone-800/80 shadow-sm dark:shadow-none overflow-hidden text-left"
            >
              <div className="bg-stone-50 dark:bg-stone-950/50 px-4.5 py-3 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-stone-700 dark:text-stone-300">
                  <Clock className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <h3 className="text-xs font-bold tracking-tight">THÁNH LỄ NGÀY THƯỜNG</h3>
                </div>
                <span className="text-[10px] text-stone-400 dark:text-stone-500 font-bold uppercase">Thứ 2 – Thứ 7</span>
              </div>
              <div className="p-4.5 grid grid-cols-2 gap-4">
                {MASS_REGULAR.map((m) => (
                  <div key={m.label} className="bg-stone-50/50 dark:bg-stone-950/20 p-3 rounded-xl border border-stone-100 dark:border-stone-800/40 text-center">
                    <p className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wide mb-1">{m.label}</p>
                    <p className="text-xl font-bold text-stone-900 dark:text-teal-400 tabular-nums">{m.time}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Lễ Chúa Nhật */}
            <motion.div
              variants={fadeUp} custom={0.1}
              className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/60 dark:border-stone-800/80 shadow-sm dark:shadow-none overflow-hidden text-left"
            >
              <div className="bg-stone-50 dark:bg-stone-950/50 px-4.5 py-3 border-b border-stone-100 dark:border-stone-800 flex items-center gap-2 text-stone-700 dark:text-stone-300">
                <Sparkles className="w-4 h-4 text-rose-500 dark:text-rose-400" />
                <h3 className="text-xs font-bold tracking-tight">PHỤNG VỤ CHÚA NHẬT</h3>
              </div>
              <ul className="divide-y divide-stone-100 dark:divide-stone-800/60 font-medium">
                {MASS_SUNDAY.map((m) => (
                  <li key={m.label} className="flex items-center justify-between px-4.5 py-3 text-xs sm:text-sm">
                    <div className="min-w-0">
                      <p className="font-bold text-stone-900 dark:text-stone-200">{m.label}</p>
                      <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-0.5 truncate">{m.note}</p>
                    </div>
                    <p className="text-base font-bold text-stone-900 dark:text-rose-400 tabular-nums ml-3 flex-shrink-0">{m.time}</p>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Định vị & Ghi chú */}
          <motion.div variants={fadeUp} custom={0.15} className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 w-full md:col-span-2">
            <div className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-stone-900 rounded-xl border border-stone-200/60 dark:border-stone-800/80 text-left">
              <MapPin className="w-4 h-4 text-stone-400 dark:text-stone-600 flex-shrink-0" />
              <p className="text-[11px] sm:text-xs text-stone-500 dark:text-stone-400 font-medium truncate">
                Địa chỉ: An Ngãi Tây 2, Hòa Khánh Nam, Liên Chiểu, Đà Nẵng
              </p>
            </div>
            <div className="flex items-center gap-2 px-4 py-3 bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-950 rounded-xl text-left">
              <Heart className="w-4 h-4 text-rose-400 dark:text-rose-600 flex-shrink-0" fill="currentColor" />
              <p className="text-[11px] sm:text-xs font-bold tracking-tight italic truncate">
                "Thánh Lễ là nguồn mạch tối cao nuôi dưỡng đời sống người Kitô hữu"
              </p>
            </div>
          </motion.div>
        </motion.section>

        {/* ══ LỜI MỜI GỌI (Banner Capsule Style) ══ */}
        <motion.section initial="hidden" whileInView="visible" viewport={vp} variants={fadeUp} custom={0}>
          <div className="relative bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/60 dark:border-stone-800/80 p-6 sm:p-8 text-center overflow-hidden">
            {!mc.isMobile && (
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-teal-500/10 blur-2xl rounded-full pointer-events-none" />
            )}
            <div className="max-w-md mx-auto space-y-3">
              <RoseIcon className="w-8 h-8 mx-auto" />
              <h2 className="text-base sm:text-lg font-extrabold text-stone-900 dark:text-white tracking-tight">
                Hành trình hiệp hành Đức Tin
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed font-medium">
                Xứ Đoàn Mẹ Mân Côi luôn rộng mở chào đón các thế hệ thiếu nhi, huynh trưởng và mọi gia đình cùng nhau học hỏi Lời Chúa, hiệp thông cầu nguyện và lan tỏa tình yêu thương cộng đoàn.
              </p>
            </div>
          </div>
        </motion.section>

      </main>
    </div>
  );
}