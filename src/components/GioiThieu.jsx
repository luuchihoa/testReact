import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, Heart, Sparkles, Clock } from "lucide-react";

/* ─── Hook Mobile ─── */
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

/* ─── Variants ─── */
const fadeUp = {
  hidden: (c) => ({ opacity: 0, y: c?.m ? 8 : 32 }),
  visible: (c) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: c?.m ? 0.5 : 0.8,
      ease: [0.16, 1, 0.3, 1],
      delay: c?.m ? (c?.d || 0) * 0.6 : (c?.d || 0),
    },
  }),
};

const stagger = {
  hidden: {},
  visible: (m) => ({
    transition: { staggerChildren: m ? 0.08 : 0.15 },
  }),
};

// Tinh thần màu sắc của Xứ Đoàn — mỗi màu mang một ý nghĩa
const MEANING = [
  {
    color: "#FFFFFF",
    swatch: "bg-white border border-stone-200",
    title: "Trắng",
    desc: "Sự tinh khiết, đầy đức hy sinh của dấng thân phục vụ.",
  },
  {
    color: "#0F766E",
    swatch: "bg-teal-700",
    title: "Xanh",
    desc: "Tâm hồn đầy sức sống, hy vọng cho tương lai.",
  },
  {
    color: "#BE123C",
    swatch: "bg-rose-700",
    title: "Hoa Hồng",
    desc: "Biểu tượng cho tình yêu — tình yêu Mẹ dành cho đoàn con.",
  },
];

const MASS_REGULAR = [
  { label: "Sáng", time: "4h30" },
  { label: "Chiều", time: "17h30" },
];

const MASS_SUNDAY = [
  { label: "Lễ I", note: "Chiều thứ 7", time: "17h30" },
  { label: "Lễ II", note: "Sáng CN", time: "5h00" },
  { label: "Lễ III", note: "Sáng CN · Lễ Thiếu Nhi", time: "8h00" },
  { label: "Lễ IV", note: "Chiều CN", time: "15h00" },
];

function RoseIcon({ className }) {
  // Simple rose glyph built from SVG paths — avoids stock imagery,
  // keeps exact brand colors (teal stem, rose-red bloom).
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none">
      <path d="M24 20C24 20 30 32 24 44" stroke="#0F766E" strokeWidth="2" strokeLinecap="round" />
      <path d="M24 28C24 28 18 30 16 26" stroke="#0F766E" strokeWidth="2" strokeLinecap="round" />
      <path d="M24 34C24 34 30 36 32 32" stroke="#0F766E" strokeWidth="2" strokeLinecap="round" />
      <circle cx="24" cy="14" r="10" fill="#FB7185" opacity="0.25" />
      <circle cx="24" cy="14" r="7.5" fill="#F43F5E" opacity="0.55" />
      <circle cx="24" cy="14" r="5" fill="#BE123C" />
      <circle cx="24" cy="14" r="2" fill="#881337" />
    </svg>
  );
}

export default function GioiThieu() {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fafdfb] via-[#faf8f5] to-[#faf8f5] text-stone-900 antialiased overflow-x-hidden">

      {/* ── HERO ── */}
      <header className="relative max-w-4xl mx-auto px-6 pt-16 pb-14 md:pt-24 md:pb-20 text-center overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[480px] h-[480px] bg-teal-100/40 blur-[110px] rounded-full -z-10" />
        <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-rose-100/40 blur-[100px] rounded-full -z-10" />

        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          custom={isMobile}        // ← truyền isMobile vào stagger
        >
          <motion.div
            variants={fadeUp}
            custom={{ m: isMobile, d: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold bg-teal-50 border border-teal-200/60 text-teal-800 rounded-full mb-6 shadow-sm"
          >
            <RoseIcon className="w-3.5 h-3.5" />
            Giáo xứ An Ngãi · Giáo phận Đà Nẵng
          </motion.div>

          <motion.h1
            variants={fadeUp}
            custom={{ m: isMobile, d: 0.1 }}
            className="font-serif font-black text-3xl md:text-5xl tracking-tight text-stone-900 mb-4 leading-[1.15]"
          >
            Xứ Đoàn{" "}
            <span className="bg-gradient-to-r from-teal-700 to-rose-700 bg-clip-text text-transparent">
              Mẹ Mân Côi
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            custom={{ m: isMobile, d: 0.2 }}
            className="max-w-xl mx-auto text-sm md:text-base text-stone-500 leading-relaxed"
          >
            Đổi mới giảng dạy và loan truyền sứ vụ về ngành công tác Thiếu Nhi Tông Đồ,
            mang Tin Mừng Nước Chúa đến với mọi người.
          </motion.p>
        </motion.div>
      </header>

      <main className="max-w-4xl mx-auto px-6 pb-20 space-y-16">

        {/* ── ĐỨC MẸ MÂN CÔI ── */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: isMobile ? "-40px" : "-80px" }}
          variants={stagger}
          custom={isMobile}
          className="relative"
        >
          <motion.div
            variants={fadeUp}
            custom={{ m: isMobile, d: 0 }}
            className="bg-gradient-to-br from-teal-50/80 to-rose-50/50 rounded-3xl border border-teal-100 p-8 md:p-12"
          >
            {/* ... nội dung giữ nguyên ... */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-full bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                <RoseIcon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-teal-700">Bổn mạng</p>
                <h2 className="font-serif font-bold text-xl md:text-2xl text-stone-900">Đức Mẹ Mân Côi</h2>
              </div>
            </div>

            <div className="space-y-4 text-sm md:text-[15px] text-stone-600 leading-relaxed">
              <p>
                Đức Mẹ Mân Côi — còn được gọi là Đức Mẹ Mai Khôi, Đức Mẹ Môi Côi, Nữ Vương Rất Thánh Mân Côi —
                là một danh hiệu của Đức Trinh Nữ Maria gắn liền với Kinh Mân Côi. Lễ kính được cử hành vào{" "}
                <strong className="text-stone-800">ngày 7 tháng 10</strong> hằng năm, kỷ niệm chiến thắng của
                liên minh Kitô giáo trong trận hải chiến Lepanto năm 1571 — vì vậy ngày lễ này còn được gọi là
                Lễ Đức Mẹ Chiến Thắng. Năm 1960, Giáo hoàng Gioan XXIII đổi tên thành Lễ Đức Mẹ Mân Côi như ngày nay.
              </p>
              <p>
                Hình ảnh Đức Mẹ dang tay là biểu tượng cho vẻ đẹp thuần khiết cả về thể chất lẫn tâm hồn.
                Mỗi khi nhìn vào gương mặt hiền từ, dịu dàng của Mẹ, chúng ta cảm thấy như được soi sáng tâm hồn,
                thuần khiết hơn để tránh xa những cám dỗ của tình yêu lệch lạc, địa vị xã hội và những thú vui khác.
              </p>
              <p>
                Mẹ nhắc nhở chúng ta sống có đức tin, ngay thẳng, lương thiện, ghi nhớ tình yêu thương và những
                bài học quý giá Mẹ đã truyền dạy — tiền đề mang lại hạnh phúc, niềm vui và sự an lành thật sự
                trong cuộc sống.
              </p>
            </div>

            <div className="mt-6 pt-6 border-t border-teal-200/50 flex items-start gap-3">
              <Heart className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" fill="currentColor" />
              <p className="text-sm md:text-[15px] font-medium text-stone-700 italic leading-relaxed">
                "Mẹ luôn che chở cho đàn con, chỉ cần ai cầu nguyện, Mẹ không phân biệt màu da, tôn giáo, chức vụ."
              </p>
            </div>
          </motion.div>
        </motion.section>

        {/* ── GIỜ LỄ ── */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: isMobile ? "-40px" : "-80px" }}
          variants={stagger}
          custom={isMobile}
        >
          <motion.div variants={fadeUp} custom={{ m: isMobile, d: 0 }} className="text-center mb-8">
            <p className="text-[11px] font-bold uppercase tracking-widest text-teal-700 mb-2">Thông báo</p>
            <h2 className="font-serif font-bold text-2xl md:text-3xl text-stone-900 mb-3">Giờ Lễ Giáo Xứ An Ngãi</h2>
            <p className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-500">
              <MapPin className="w-3.5 h-3.5 text-teal-700" />
              An Ngãi Tây 2, Hòa Khánh, Đà Nẵng
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div variants={fadeUp} custom={{ m: isMobile, d: 0.05 }}
              className="bg-white rounded-2xl border border-stone-200/70 shadow-sm overflow-hidden"
            >
              {/* ... Lễ thường giữ nguyên ... */}
              <div className="bg-teal-800 px-5 py-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-200" />
                <h3 className="text-sm font-bold text-white tracking-wide">LỄ THƯỜNG</h3>
              </div>
              <div className="p-5 grid grid-cols-2 gap-4">
                {MASS_REGULAR.map((m) => (
                  <div key={m.label} className="text-center">
                    <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-1.5">{m.label}</p>
                    <p className="text-2xl font-bold text-teal-800">{m.time}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div variants={fadeUp} custom={{ m: isMobile, d: 0.1 }}
              className="bg-white rounded-2xl border border-stone-200/70 shadow-sm overflow-hidden md:row-span-2"
            >
              {/* ... Lễ Chúa Nhật giữ nguyên ... */}
              <div className="bg-rose-800 px-5 py-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-rose-200" />
                <h3 className="text-sm font-bold text-white tracking-wide">LỄ CHÚA NHẬT</h3>
              </div>
              <ul className="divide-y divide-stone-100">
                {MASS_SUNDAY.map((m) => (
                  <li key={m.label} className="flex items-center justify-between px-5 py-3.5">
                    <div>
                      <p className="text-sm font-semibold text-stone-800">{m.label}</p>
                      <p className="text-[11px] text-stone-400">{m.note}</p>
                    </div>
                    <p className="text-lg font-bold text-rose-800">{m.time}</p>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          <motion.p
            variants={fadeUp}
            custom={{ m: isMobile, d: 0.15 }}
            className="text-center text-xs md:text-sm text-stone-400 italic mt-6 max-w-md mx-auto leading-relaxed"
          >
            "Tham dự Thánh Lễ là nguồn mạch nuôi dưỡng đức tin và đời sống Kitô hữu"
          </motion.p>
        </motion.section>

        {/* ── LỜI MỜI GỌI ── */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: isMobile ? "-40px" : "-80px" }}
          variants={fadeUp}
          custom={{ m: isMobile, d: 0 }}
        >
          {/* ... nội dung giữ nguyên ... */}
          <div className="relative bg-gradient-to-r from-teal-800 to-teal-900 rounded-3xl p-8 md:p-10 text-center overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-rose-500/20 blur-3xl rounded-full" />
            <RoseIcon className="w-10 h-10 mx-auto mb-4 brightness-150" />
            <h2 className="font-serif font-bold text-xl md:text-2xl text-white mb-2">
              Cùng đồng hành trong hành trình đức tin
            </h2>
            <p className="text-sm text-teal-100 max-w-md mx-auto leading-relaxed">
              Hùng Tâm Dũng Chí – Xứ Đoàn Mẹ Mân Côi luôn chào đón mọi thiếu nhi, huynh trưởng
              và gia đình cùng nhau học hỏi, cầu nguyện và lan tỏa yêu thương.
            </p>
          </div>
        </motion.section>

      </main>
    </div>
  );
}