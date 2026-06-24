import React, { useRef } from "react";
import { Link } from "react-router-dom";
import {
  Star, BookOpen, MessageSquare, ShieldCheck,
  Clock, CalendarDays, Users, ArrowRight, ChevronLeft, Sparkles,
} from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useLenis } from "lenis/react";

/* ── Design tokens ── */
const ACCENT   = "#c8961e";   // vàng thánh — phù hợp với chủ đề Thánh Thể
const ACCENT_L = "#fdf8ec";

/* ── Framer Motion ── */
const fadeUp = {
  hidden:  { opacity: 0, y: 28 },
  visible: (d = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: d },
  }),
};
const stagger = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.12 } },
};

/* ── Dữ liệu ── */
const OVERVIEW = [
  { icon: Users,        label: "Độ tuổi",    value: "Lớp 3 – 4 (8–10 tuổi)" },
  { icon: Clock,        label: "Thời lượng", value: "75 phút / buổi" },
  { icon: CalendarDays, label: "Lịch học",   value: "Chủ Nhật sau Thánh Lễ" },
  { icon: ShieldCheck,  label: "Yêu cầu",    value: "Đã lãnh Bí tích Rửa Tội" },
];

const JOURNEY = [
  {
    step: "01",
    title: "Tôi là ai?",
    desc: "Khám phá bản thân là con cái Thiên Chúa, hiểu về ân sủng Bí tích Rửa Tội đã lãnh nhận.",
    color: "border-l-amber-300",
  },
  {
    step: "02",
    title: "Chúa Giêsu là ai?",
    desc: "Đi sâu vào cuộc đời Chúa Giêsu qua Tin Mừng — Ngài là ai, Ngài dạy gì và tại sao Ngài yêu tôi.",
    color: "border-l-yellow-400",
  },
  {
    step: "03",
    title: "Bí tích Hoà Giải",
    desc: "Hiểu ý nghĩa xưng tội: tha thứ, chữa lành và bắt đầu lại. Chuẩn bị xưng tội lần đầu.",
    color: "border-l-green-300",
  },
  {
    step: "04",
    title: "Thánh Thể — Chúa đến với tôi",
    desc: "Tìm hiểu Bí tích Thánh Thể: Chúa Giêsu thực sự hiện diện trong Bánh và Rượu như thế nào.",
    color: "border-l-amber-400",
  },
  {
    step: "05",
    title: "Ngày trọng đại",
    desc: "Chuẩn bị tâm hồn và nghi lễ cho Ngày Rước Lễ Lần Đầu — kỷ niệm thiêng liêng nhất tuổi thơ.",
    color: "border-l-rose-300",
  },
  {
    step: "06",
    title: "Sống Thánh Thể mỗi ngày",
    desc: "Sau ngày đặc biệt đó, tiếp tục sống tình yêu Thánh Thể trong gia đình, trường học và xã hội.",
    color: "border-l-sky-300",
  },
];

const HIGHLIGHTS = [
  {
    icon: BookOpen,
    title: "Dẫn vào Kinh Thánh",
    desc: "Mỗi bài học gắn với đoạn Tin Mừng ngắn, giúp các em quen với Lời Chúa từ sớm.",
  },
  {
    icon: MessageSquare,
    title: "Chia sẻ nhóm nhỏ",
    desc: "Các em được khuyến khích chia sẻ cảm nhận trong không khí tin tưởng, cởi mở.",
  },
  {
    icon: ShieldCheck,
    title: "Đồng hành phụ huynh",
    desc: "Tài liệu gửi về nhà sau mỗi buổi học để ba mẹ cùng ôn lại và cầu nguyện với con.",
  },
  {
    icon: Star,
    title: "Buổi tập dượt",
    desc: "Được tập dượt nghi lễ trước ngày Rước Lễ Lần Đầu để các em tự tin và trang nghiêm.",
  },
];

/* ═══════════════════════════════════════════ */
export default function KhoiRuocLe() {
  const heroRef = useRef(null);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, -80]);
  const lenis = useLenis();

  return (
    <div className="min-h-screen bg-[#faf8f5] text-stone-900 antialiased overflow-x-hidden selection:bg-amber-200 selection:text-amber-900">

      {/* ══ HERO ══ */}
      <section
        ref={heroRef}
        className="relative overflow-hidden pt-16 pb-20 md:pt-28 md:pb-32"
        style={{ background: `linear-gradient(160deg, ${ACCENT_L} 0%, #faf8f5 60%)` }}
      >
        <div className="absolute top-0 left-0 w-[600px] h-[500px] bg-amber-200/25 blur-[120px] rounded-full -z-10 -translate-x-1/4" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-yellow-100/30 blur-[100px] rounded-full -z-10" />

        <motion.div style={{ y: heroY }} className="max-w-5xl mx-auto px-5 sm:px-6">
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-800 mb-8 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Trang chủ
            </Link>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="flex flex-col md:flex-row md:items-end gap-8 md:gap-16"
          >
            {/* Left — text */}
            <div className="flex-1">
              <motion.div variants={fadeUp} custom={0}>
                <span
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-5"
                  style={{ background: `${ACCENT}18`, color: ACCENT }}
                >
                  <Star className="w-3.5 h-3.5" />
                  Rước Lễ Lần Đầu
                </span>
              </motion.div>

              <motion.h1
                variants={fadeUp}
                custom={0.05}
                className="text-4xl md:text-6xl font-serif font-black tracking-tight text-stone-900 leading-[1.1] mb-5"
              >
                Ngày thiêng liêng
                <br />
                <span
                  className="bg-clip-text text-transparent"
                  style={{ backgroundImage: `linear-gradient(135deg, ${ACCENT}, #a07010)` }}
                >
                  trọng nhất
                </span>{" "}
                đời thơ ấu
              </motion.h1>

              <motion.p
                variants={fadeUp}
                custom={0.1}
                className="text-base md:text-lg text-stone-500 leading-relaxed max-w-lg mb-8"
              >
                Khối Rước Lễ Lần Đầu đồng hành cùng các em trong hành trình chuẩn bị tâm
                hồn đón nhận Chúa Giêsu qua Bí tích Thánh Thể — một khoảnh khắc không bao
                giờ quên trong cuộc đời đức tin.
              </motion.p>

              <motion.div
                variants={fadeUp}
                custom={0.15}
                className="flex flex-col sm:flex-row gap-3"
              >
                <button
                  onClick={() => lenis?.scrollTo("#hanh-trinh", { duration: 1.2 })}
                  className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-xl text-sm font-bold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5"
                  style={{ background: ACCENT, boxShadow: `0 4px 16px ${ACCENT}40` }}
                >
                  Xem hành trình
                  <ArrowRight className="w-4 h-4" />
                </button>
                <Link
                  to="/tuyển-sinh"
                  className="inline-flex items-center justify-center h-11 px-5 rounded-xl text-sm font-semibold border border-stone-200 bg-white text-stone-800 hover:bg-stone-50 shadow-sm transition-all duration-300 hover:-translate-y-0.5"
                >
                  Đăng ký
                </Link>
              </motion.div>
            </div>

            {/* Right — image */}
            <motion.div variants={fadeUp} custom={0.2} className="flex-shrink-0 w-full md:w-[280px]">
              <div
                className="relative rounded-3xl overflow-hidden aspect-square w-full max-w-[260px] md:max-w-full mx-auto shadow-xl"
                style={{ background: `linear-gradient(135deg, ${ACCENT_L}, #fdeac0)` }}
              >
                <img
                  src="https://lh3.googleusercontent.com/d/1sVKWUGTiMvhwoml1qsdmahfLYFML-NGV"
                  alt="Rước Lễ Lần Đầu"
                  className="w-full h-full object-contain p-8 mix-blend-multiply"
                />
                <div className="absolute bottom-3 left-3 right-3 bg-white/80 backdrop-blur-sm rounded-2xl px-4 py-2.5 flex items-center gap-2.5 shadow-sm">
                  <Sparkles className="w-4 h-4 flex-shrink-0" style={{ color: ACCENT }} />
                  <div>
                    <p className="text-[11px] font-bold text-stone-900">Lớp 3 – Lớp 4</p>
                    <p className="text-[10px] text-stone-500">8 – 10 tuổi</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* ══ TỔNG QUAN ══ */}
      <section className="py-14 border-y border-stone-100 bg-white/60">
        <div className="max-w-5xl mx-auto px-5 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {OVERVIEW.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="flex flex-col gap-2"
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${ACCENT}18` }}>
                  <Icon className="w-4 h-4" style={{ color: ACCENT }} />
                </div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400">{item.label}</p>
                <p className="text-sm font-semibold text-stone-800 leading-snug">{item.value}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ══ HÀNH TRÌNH 6 BƯỚC ══ */}
      <section id="hanh-trinh" className="py-20 md:py-28 max-w-5xl mx-auto px-5 sm:px-6 scroll-mt-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-12"
        >
          <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: ACCENT }}>
            Chương trình
          </p>
          <h2 className="text-3xl md:text-4xl font-serif font-black text-stone-900 leading-tight">
            Hành trình 6 bước<br />đến với Chúa Giêsu
          </h2>
          <p className="mt-3 text-stone-500 max-w-lg text-sm leading-relaxed">
            Mỗi bước được thiết kế kỹ lưỡng để các em hiểu sâu, cảm nhận thật và chuẩn bị
            tâm hồn trước ngày trọng đại.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
          {JOURNEY.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className={`bg-white rounded-2xl border border-stone-100 border-l-4 ${step.color} p-5 shadow-sm hover:shadow-md transition-shadow`}
            >
              <p className="text-3xl font-serif font-black text-stone-100 mb-3 leading-none">{step.step}</p>
              <h3 className="text-[15px] font-bold text-stone-900 mb-1.5">{step.title}</h3>
              <p className="text-xs text-stone-500 leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══ ĐIỂM NỔI BẬT ══ */}
      <section
        className="py-20 md:py-28"
        style={{ background: `linear-gradient(160deg, ${ACCENT_L} 0%, #faf8f5 100%)` }}
      >
        <div className="max-w-5xl mx-auto px-5 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="mb-12"
          >
            <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: ACCENT }}>
              Đặc điểm
            </p>
            <h2 className="text-3xl md:text-4xl font-serif font-black text-stone-900">
              Chuẩn bị toàn diện —<br />tâm hồn lẫn nghi lễ
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-5">
            {HIGHLIGHTS.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="bg-white rounded-2xl border border-stone-100 p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: `${ACCENT}15` }}>
                    <Icon className="w-5 h-5" style={{ color: ACCENT }} />
                  </div>
                  <h3 className="text-sm font-bold text-stone-900 mb-1.5">{item.title}</h3>
                  <p className="text-xs text-stone-500 leading-relaxed">{item.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══ CTA ══ */}
      <section className="py-20 max-w-2xl mx-auto px-5 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <Star className="w-10 h-10 mx-auto mb-4" style={{ color: ACCENT }} />
          <h2 className="text-2xl md:text-3xl font-serif font-black text-stone-900 mb-3">
            Chuẩn bị cho ngày đặc biệt
          </h2>
          <p className="text-stone-500 text-sm leading-relaxed mb-8 max-w-md mx-auto">
            Đăng ký để con em được tham gia hành trình thiêng liêng cùng cộng đoàn —
            kỷ niệm sẽ in đậm trong tâm hồn suốt cuộc đời.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/tuyển-sinh"
              className="inline-flex items-center justify-center gap-2 h-11 px-8 rounded-xl text-sm font-bold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5"
              style={{ background: ACCENT, boxShadow: `0 4px 16px ${ACCENT}40` }}
            >
              Đăng ký ngay
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/liên-hệ"
              className="inline-flex items-center justify-center h-11 px-6 rounded-xl text-sm font-semibold border border-stone-200 bg-white text-stone-800 hover:bg-stone-50 shadow-sm transition-all duration-300 hover:-translate-y-0.5"
            >
              Liên hệ hỏi thêm
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}