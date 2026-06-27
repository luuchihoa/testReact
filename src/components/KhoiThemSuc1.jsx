import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { Flame, Wind, Shield, Users, BookOpen, Clock, CalendarDays, ArrowRight, ChevronLeft, Zap } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useLenis } from "lenis/react";
import { useMotionConfig } from "../hooks/useMotionConfig.js";

const ACCENT   = "#ca8a04";
const ACCENT_L = "#fefce8";

const OVERVIEW = [
  { icon: Users,        label: "Độ tuổi",    value: "Lớp 8 – 10 (13–16 tuổi)" },
  { icon: Clock,        label: "Thời lượng", value: "90 phút / buổi" },
  { icon: CalendarDays, label: "Lịch học",   value: "Chủ Nhật sau Thánh Lễ" },
  { icon: Shield,       label: "Yêu cầu",    value: "Đã Rước Lễ Lần Đầu" },
];

const GIFTS = [
  { name: "Khôn ngoan",             desc: "Nhìn thấy mọi sự theo nhãn quan của Thiên Chúa.", color: "bg-amber-50 border-amber-200" },
  { name: "Hiểu biết",              desc: "Thấu hiểu sâu sắc các chân lý đức tin.",           color: "bg-yellow-50 border-yellow-200" },
  { name: "Biết lo liệu",           desc: "Phân định điều tốt và hành động đúng đắn.",        color: "bg-orange-50 border-orange-200" },
  { name: "Dũng cảm",               desc: "Can đảm sống và loan báo đức tin.",                color: "bg-amber-50 border-amber-300" },
  { name: "Hiểu biết khoa học",     desc: "Dùng trí tuệ phục vụ vinh quang Chúa.",           color: "bg-yellow-50 border-yellow-300" },
  { name: "Đạo đức",                desc: "Kính sợ Chúa, tránh xa tội lỗi.",                 color: "bg-lime-50 border-lime-200" },
  { name: "Kính sợ Thiên Chúa",     desc: "Yêu mến Chúa trên hết mọi sự.",                  color: "bg-green-50 border-green-200" },
];

const MODULES = [
  {
    phase: "Học Kỳ 1 — Ai là tôi trong Chúa Thánh Thần?",
    color: "bg-amber-50 border-amber-100", dot: "bg-amber-400",
    topics: ["Chúa Thánh Thần — Ngôi Ba Thiên Chúa", "7 ơn Chúa Thánh Thần và ý nghĩa trong cuộc sống", "Ôn lại hành trình đức tin từ Rửa Tội đến hôm nay", "Bí tích Hoà Giải — chuẩn bị tâm hồn"],
  },
  {
    phase: "Học Kỳ 2 — Tôi được sai đi",
    color: "bg-yellow-50 border-yellow-100", dot: "bg-yellow-500",
    topics: ["Sứ mạng ngôn sứ — làm chứng cho Chúa", "Sứ mạng tư tế — cầu nguyện và phụng thờ", "Sứ mạng vương đế — phục vụ và lãnh đạo", "Nghi thức Bí tích Thêm Sức & buổi tập dượt"],
  },
];

const HIGHLIGHTS = [
  { icon: Wind,     title: "Retreat tĩnh tâm",   desc: "Trước ngày lãnh Bí tích, toàn khối tham gia 1 ngày tĩnh tâm để gặp gỡ Chúa Thánh Thần trong thinh lặng." },
  { icon: Users,    title: "Nhóm đồng hành",     desc: "Mỗi em có 1 người đỡ đầu (Sponsor) đồng hành trong suốt năm học và trong hành trình đức tin sau đó." },
  { icon: BookOpen, title: "Nhật ký tâm linh",   desc: "Ghi lại hành trình đức tin qua nhật ký cá nhân — được chia sẻ tự nguyện trong nhóm nhỏ." },
  { icon: Shield,   title: "Dự án phục vụ",      desc: "Mỗi em thực hiện 1 dự án phục vụ cộng đoàn như một bằng chứng sống của đức tin trưởng thành." },
];

export default function KhoiThemSuc() {
  const heroRef = useRef(null);
  const { scrollY } = useScroll();
  const mc = useMotionConfig();
  const heroY = useTransform(scrollY, [0, 500], mc.heroParallax);
  const lenis = useLenis();

  const fadeUp = {
    hidden: { opacity: 0, y: mc.yOffset },
    visible: (d = 0) => ({ opacity: 1, y: 0, transition: { duration: mc.duration(0.8), ease: [0.16, 1, 0.3, 1], delay: mc.delay(d) } }),
  };
  const staggerContainer = { hidden: {}, visible: { transition: { staggerChildren: mc.stagger } } };
  const vp = mc.vp();

  return (
    <div className="min-h-screen bg-[#faf8f5] text-stone-900 antialiased overflow-x-hidden selection:bg-yellow-200 selection:text-yellow-900">

      <section ref={heroRef} className="relative overflow-hidden pt-16 pb-20 md:pt-28 md:pb-32"
        style={{ background: `linear-gradient(160deg, ${ACCENT_L} 0%, #faf8f5 60%)` }}>
        {!mc.isMobile && (
          <>
            <div className="absolute top-0 left-0 w-[600px] h-[500px] bg-yellow-200/20 blur-[120px] rounded-full -z-10 -translate-x-1/4" />
            <div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-amber-100/20 blur-[100px] rounded-full -z-10" />
          </>
        )}

        <motion.div style={{ y: heroY }} className="max-w-5xl mx-auto px-5 sm:px-6">
          <motion.div initial={{ opacity: 0, x: mc.isMobile ? -8 : -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: mc.duration(0.5) }}>
            <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-800 mb-8 transition-colors">
              <ChevronLeft className="w-4 h-4" />Trang chủ
            </Link>
          </motion.div>

          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="flex flex-col md:flex-row md:items-end gap-8 md:gap-16">
            <div className="flex-1">
              <motion.div variants={fadeUp} custom={0}>
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-5"
                  style={{ background: `${ACCENT}18`, color: ACCENT }}>
                  <Flame className="w-3.5 h-3.5" />Khối Thêm Sức
                </span>
              </motion.div>
              <motion.h1 variants={fadeUp} custom={0.05} className="text-4xl md:text-6xl font-serif font-black tracking-tight text-stone-900 leading-[1.1] mb-5">
                Nhận lãnh<br />
                <span className="bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(135deg, ${ACCENT}, #78350f)` }}>
                  ngọn lửa Thánh Thần
                </span>
              </motion.h1>
              <motion.p variants={fadeUp} custom={0.1} className="text-base md:text-lg text-stone-500 leading-relaxed max-w-lg mb-8">
                Bí tích Thêm Sức là dấu ấn trưởng thành trong đức tin — khi Chúa Thánh Thần
                đổ đầy 7 ơn thiêng liêng để các em trở thành những chứng nhân dũng cảm
                của Tin Mừng trong thế giới hôm nay.
              </motion.p>
              <motion.div variants={fadeUp} custom={0.15} className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    const t = document.getElementById("bay-on");
                    if (!t) return;
                    lenis ? lenis.scrollTo(t, { duration: mc.isMobile ? 0.8 : 1.2 }) : t.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-xl text-sm font-bold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
                  style={{ background: ACCENT, boxShadow: `0 4px 16px ${ACCENT}40` }}>
                  Xem chương trình<ArrowRight className="w-4 h-4" />
                </button>
                <Link to="/tuyển-sinh"
                  className="inline-flex items-center justify-center h-11 px-5 rounded-xl text-sm font-semibold border border-stone-200 bg-white text-stone-800 hover:bg-stone-50 shadow-sm transition-all duration-300 hover:-translate-y-0.5 active:scale-95">
                  Đăng ký
                </Link>
              </motion.div>
            </div>

            <motion.div variants={fadeUp} custom={0.2} className="flex-shrink-0 w-full md:w-[280px]">
              <div className="relative rounded-3xl overflow-hidden aspect-square w-full max-w-[260px] md:max-w-full mx-auto shadow-xl"
                style={{ background: `linear-gradient(135deg, ${ACCENT_L}, #fde68a)` }}>
                <img src="https://lh3.googleusercontent.com/d/1tnxBqhr_su9_FgK6zdSkLa4h-w7CAlKJ" alt="Khối Thêm Sức"
                  className="w-full h-full object-contain p-8 mix-blend-multiply"
                  loading={mc.isMobile ? "lazy" : "eager"} />
                <div className="absolute bottom-3 left-3 right-3 bg-white/80 backdrop-blur-sm rounded-2xl px-4 py-2.5 flex items-center gap-2.5 shadow-sm">
                  <Zap className="w-4 h-4 flex-shrink-0" style={{ color: ACCENT }} />
                  <div>
                    <p className="text-[11px] font-bold text-stone-900">Lớp 8 – Lớp 10</p>
                    <p className="text-[10px] text-stone-500">13 – 16 tuổi</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      <section className="py-14 border-y border-stone-100 bg-white/60">
        <div className="max-w-5xl mx-auto px-5 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {OVERVIEW.map((item, i) => { const Icon = item.icon; return (
            <motion.div key={i} initial={{ opacity: 0, y: mc.yOffset }} whileInView={{ opacity: 1, y: 0 }}
              viewport={vp} transition={{ duration: mc.duration(0.5), delay: mc.delay(i * 0.08) }} className="flex flex-col gap-2">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${ACCENT}18` }}>
                <Icon className="w-4 h-4" style={{ color: ACCENT }} />
              </div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400">{item.label}</p>
              <p className="text-sm font-semibold text-stone-800 leading-snug">{item.value}</p>
            </motion.div>
          ); })}
        </div>
      </section>

      {/* 7 ƠN */}
      <section id="bay-on" className="py-20 md:py-28 max-w-5xl mx-auto px-5 sm:px-6 scroll-mt-16">
        <motion.div initial={{ opacity: 0, y: mc.yOffset }} whileInView={{ opacity: 1, y: 0 }} viewport={vp}
          transition={{ duration: mc.duration(0.7) }} className="mb-12">
          <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: ACCENT }}>Trọng tâm</p>
          <h2 className="text-3xl md:text-4xl font-serif font-black text-stone-900 leading-tight">Bảy ơn Chúa Thánh Thần</h2>
          <p className="mt-3 text-stone-500 max-w-lg text-sm leading-relaxed">Mỗi ơn được học qua Kinh Thánh, ví dụ thực tế và hoạt động nhóm giúp các em hiểu và sống 7 ơn này trong đời thường.</p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {GIFTS.map((gift, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: mc.yOffset }} whileInView={{ opacity: 1, y: 0 }}
              viewport={vp} transition={{ duration: mc.duration(0.5), delay: mc.delay(i * 0.07) }}
              className={`rounded-2xl border p-4 ${gift.color}`}>
              <div className="flex items-center gap-2 mb-2">
                <Flame className="w-3.5 h-3.5 flex-shrink-0" style={{ color: ACCENT }} />
                <h3 className="text-sm font-bold text-stone-900">{gift.name}</h3>
              </div>
              <p className="text-xs text-stone-500 leading-relaxed">{gift.desc}</p>
            </motion.div>
          ))}
          <motion.div initial={{ opacity: 0, y: mc.yOffset }} whileInView={{ opacity: 1, y: 0 }}
            viewport={vp} transition={{ duration: mc.duration(0.5), delay: mc.delay(0.56) }}
            className="rounded-2xl border p-4 bg-stone-900 border-stone-800 flex flex-col justify-between">
            <p className="text-xs text-stone-300 leading-relaxed italic">"Tất cả được tràn đầy Thánh Thần."</p>
            <p className="text-[10px] text-stone-500 font-bold mt-3">— Cv 2,4</p>
          </motion.div>
        </div>
      </section>

      {/* CHƯƠNG TRÌNH */}
      <section className="py-20 md:py-28 bg-stone-50/60">
        <div className="max-w-5xl mx-auto px-5 sm:px-6">
          <motion.div initial={{ opacity: 0, y: mc.yOffset }} whileInView={{ opacity: 1, y: 0 }} viewport={vp}
            transition={{ duration: mc.duration(0.7) }} className="mb-12">
            <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: ACCENT }}>Chương trình</p>
            <h2 className="text-3xl md:text-4xl font-serif font-black text-stone-900">Một năm chuẩn bị</h2>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-6">
            {MODULES.map((mod, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: mc.yOffset }} whileInView={{ opacity: 1, y: 0 }}
                viewport={vp} transition={{ duration: mc.duration(0.6), delay: mc.delay(i * 0.1) }}
                className={`rounded-2xl border p-6 ${mod.color}`}>
                <div className="flex items-center gap-2 mb-5">
                  <div className={`w-2 h-2 rounded-full ${mod.dot}`} />
                  <h3 className="text-sm font-bold text-stone-700">{mod.phase}</h3>
                </div>
                <ul className="space-y-3">
                  {mod.topics.map((topic, j) => (
                    <li key={j} className="flex items-start gap-2.5 text-sm text-stone-700">
                      <span className="w-5 h-5 rounded-full bg-white border border-stone-200 flex items-center justify-center text-[10px] font-bold text-stone-500 flex-shrink-0 mt-0.5">{j + 1}</span>
                      {topic}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* HIGHLIGHTS */}
      <section className="py-20 md:py-28 max-w-5xl mx-auto px-5 sm:px-6">
        <motion.div initial={{ opacity: 0, y: mc.yOffset }} whileInView={{ opacity: 1, y: 0 }} viewport={vp}
          transition={{ duration: mc.duration(0.7) }} className="mb-12">
          <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: ACCENT }}>Đặc điểm</p>
          <h2 className="text-3xl md:text-4xl font-serif font-black text-stone-900">Hơn cả một lớp học</h2>
        </motion.div>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-5">
          {HIGHLIGHTS.map((item, i) => { const Icon = item.icon; return (
            <motion.div key={i} initial={{ opacity: 0, y: mc.yOffset }} whileInView={{ opacity: 1, y: 0 }}
              viewport={vp} transition={{ duration: mc.duration(0.5), delay: mc.delay(i * 0.1) }}
              whileHover={mc.isMobile ? undefined : { y: -4, transition: { duration: 0.2 } }}
              className="bg-white rounded-2xl border border-stone-100 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: `${ACCENT}15` }}>
                <Icon className="w-5 h-5" style={{ color: ACCENT }} />
              </div>
              <h3 className="text-sm font-bold text-stone-900 mb-1.5">{item.title}</h3>
              <p className="text-xs text-stone-500 leading-relaxed">{item.desc}</p>
            </motion.div>
          ); })}
        </div>
      </section>

      <section className="py-20 max-w-2xl mx-auto px-5 sm:px-6 text-center">
        <motion.div initial={{ opacity: 0, y: mc.yOffset }} whileInView={{ opacity: 1, y: 0 }} viewport={vp} transition={{ duration: mc.duration(0.7) }}>
          <motion.div animate={mc.reduced ? {} : { scale: [1, 1.12, 1], transition: { repeat: Infinity, duration: 2.4, ease: "easeInOut" } }}>
            <Flame className="w-10 h-10 mx-auto mb-4" style={{ color: ACCENT }} />
          </motion.div>
          <h2 className="text-2xl md:text-3xl font-serif font-black text-stone-900 mb-3">Đón nhận ngọn lửa thiêng</h2>
          <p className="text-stone-500 text-sm leading-relaxed mb-8 max-w-md mx-auto">Đăng ký để con em được chuẩn bị trọn vẹn cho Bí tích Thêm Sức — bước ngoặt quan trọng nhất trong hành trình đức tin.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/tuyển-sinh"
              className="inline-flex items-center justify-center gap-2 h-11 px-8 rounded-xl text-sm font-bold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
              style={{ background: ACCENT, boxShadow: `0 4px 16px ${ACCENT}40` }}>
              Đăng ký ngay<ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/liên-hệ"
              className="inline-flex items-center justify-center h-11 px-6 rounded-xl text-sm font-semibold border border-stone-200 bg-white text-stone-800 hover:bg-stone-50 shadow-sm transition-all duration-300 hover:-translate-y-0.5 active:scale-95">
              Liên hệ hỏi thêm
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}