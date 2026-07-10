import React, { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Star, BookOpen, MessageSquare, ShieldCheck, Clock, CalendarDays, Users, ArrowRight, ChevronLeft, Sparkles } from "lucide-react";
import { motion, useScroll, useTransform, AnimatePresence, useMotionValue } from "framer-motion";
import { useLenis } from "lenis/react";
import { useMotionConfig } from "../hooks/useMotionConfig.js";

const OVERVIEW = [
  { icon: Users,        label: "Độ tuổi",    value: "Lớp 3 – Lớp 4" },
  { icon: Clock,        label: "Thời lượng", value: "45 phút / buổi" },
  { icon: CalendarDays, label: "Lịch học",   value: "Chúa Nhật" },
  { icon: Star,         label: "Yêu cầu",    value: "Đã Rửa Tội" },
];

const JOURNEY = [
  {
    step: "01",
    title: "Tôi là ai?",
    desc: "Khám phá bản thân là con cái Thiên Chúa, hiểu về ân sủng Bí tích Rửa Tội đã lãnh nhận.",
    color: "bg-white dark:bg-stone-900 border-stone-200/60 dark:border-stone-800/80 hover:border-lime-500/50 dark:hover:border-lime-500/50",
    badge: "text-lime-600 bg-lime-50 dark:text-lime-400 dark:bg-lime-950/30",
    details: {
      subtitle: "Hồng ân làm con Thiên Chúa",
      meaning: "Giúp các em nhận biết căn tính Kitô hữu của mình. Qua Bí tích Rửa Tội, các em không còn là những cá nhân cô độc, mà đã được tháp nhập vào Thân Thể Chúa Kitô, trở thành những người con yêu dấu được Thiên Chúa chở che.",
      highlight: "Học về các biểu tượng thiêng liêng: Nước sự sống, Áo trắng tinh tuyền và Ngọn nến Phục Sinh thắp sáng đức tin.",
      emoji: "💧 🛡️ 🤍",
      duration: "Tuần 1 - 4",
    }
  },
  {
    step: "02",
    title: "Chúa Giêsu là ai?",
    desc: "Đi sâu vào cuộc đời Chúa Giêsu qua Tin Mừng — Ngài là ai, Ngài dạy gì và tại sao Ngài yêu tôi.",
    color: "bg-white dark:bg-stone-900 border-stone-200/60 dark:border-stone-800/80 hover:border-green-500/50 dark:hover:border-green-500/50",
    badge: "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950/30",
    details: {
      subtitle: "Gặp gỡ Người Bạn Lớn",
      meaning: "Hành trình đưa các em đến gần hơn với con người lịch sử và thần tính của Chúa Giêsu thông qua các câu chuyện Tin Mừng sống động. Chúa Giêsu không xa xôi, Ngài là Người Bạn chân thành nhất của tuổi thơ.",
      highlight: "Suy ngẫm về dụ ngôn Con Chiên Lạc và hình ảnh Người Mục Tử Nhân Lành luôn tìm kiếm, yêu thương từng đứa trẻ.",
      emoji: "🐑 📖 🤝",
      duration: "Tuần 5 - 10",
    }
  },
  {
    step: "03",
    title: "Bí tích Hoà Giải",
    desc: "Hiểu ý nghĩa xưng tội: tha thứ, chữa lành và bắt đầu lại. Chuẩn bị tâm hồn xưng tội lần đầu.",
    color: "bg-white dark:bg-stone-900 border-stone-200/60 dark:border-stone-800/80 hover:border-emerald-500/50 dark:hover:border-emerald-500/50",
    badge: "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/30",
    details: {
      subtitle: "Trở về trong vòng tay Cha",
      meaning: "Học cách nhận biết lỗi lầm (xét mình) không phải để sợ hãi, mà để cảm nhận lòng thương xót vô biên của Chúa. Bí tích Hòa Giải chữa lành những rạn nứt trong tâm hồn và ban sức mạnh để các em làm lại từ đầu.",
      highlight: "Tập dượt các bước xưng tội thực tế: Xét mình, Ăn năn tội, Quyết tâm chừa, Xưng tội và Đền tội trong bình an.",
      emoji: "🛐 🕊️ 🔓",
      duration: "Tuần 11 - 16",
    }
  },
  {
    step: "04",
    title: "Thánh Thể — Chúa đến",
    desc: "Tìm hiểu Bí tích Thánh Thể: Chúa Giêsu thực sự hiện diện trong Bánh và Rượu như thế nào.",
    color: "bg-white dark:bg-stone-900 border-stone-200/60 dark:border-stone-800/80 hover:border-teal-500/50 dark:hover:border-teal-500/50",
    badge: "text-teal-600 bg-teal-50 dark:text-teal-400 dark:bg-teal-950/30",
    details: {
      subtitle: "Mầu nhiệm Bánh Hằng Sống",
      meaning: "Khám phá trung tâm của Phụng vụ. Các em hiểu được rằng Bánh Thánh không chỉ là biểu tượng, mà chính là Mình và Máu Thánh Chúa Giêsu hiến tế vì yêu thương, trở thành lương thực nuôi dưỡng linh hồn nhỏ bé.",
      highlight: "Tìm hiểu về Bữa Tiệc Ly cuối cùng, ý nghĩa của Phép lạ hóa bánh ra nhiều và cách tôn kính Chúa nơi Nhà Tạm.",
      emoji: "🍞 🍷 🙏",
      duration: "Tuần 17 - 22",
    }
  },
  {
    step: "05",
    title: "Ngày trọng đại",
    desc: "Chuẩn bị tâm hồn và nghi lễ cho Ngày Rước Lễ Lần Đầu — kỷ niệm thiêng liêng nhất tuổi thơ.",
    color: "bg-white dark:bg-stone-900 border-stone-200/60 dark:border-stone-800/80 hover:border-amber-500/50 dark:hover:border-amber-500/50",
    badge: "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/30",
    details: {
      subtitle: "Đón rước Vua Thiên Đàng",
      meaning: "Giai đoạn chuẩn bị trực tiếp về cả tâm hồn lẫn tác phong bên ngoài. Các em được hướng dẫn cách giữ tâm hồn trong sạch, cách tiến lên rước Chúa với lòng tôn kính, trang nghiêm và tràn đầy niềm hân hoan.",
      highlight: "Các buổi tĩnh tâm chuyên sâu, tập dượt nghi thức rước lễ trên lễ đài và chuẩn bị trang phục trắng tinh tuyền.",
      emoji: "👑 🕊️ ✨",
      duration: "Tuần 23 - 24",
    }
  },
  {
    step: "06",
    title: "Sống Thánh Thể",
    desc: "Sau ngày đặc biệt đó, tiếp tục sống tình yêu Thánh Thể trong gia đình, trường học và xã hội.",
    color: "bg-white dark:bg-stone-900 border-stone-200/60 dark:border-stone-800/80 hover:border-sky-500/50 dark:hover:border-sky-500/50",
    badge: "text-sky-600 bg-sky-50 dark:text-sky-400 dark:bg-sky-950/30",
    details: {
      subtitle: "Trở nên máng cỏ cho đời",
      meaning: "Rước Lễ Lần Đầu không phải là điểm kết thúc, mà là điểm khởi đầu của một lối sống mới. Sau khi đón nhận Chúa vào lòng, các em được mời gọi đem tình yêu, sự tử tế và niềm vui của Chúa chia sẻ cho mọi người xung quanh.",
      highlight: "Thực hành việc đạo đức nhỏ mỗi ngày: Ngoan ngoãn vâng lời cha mẹ, giúp đỡ bạn bè và duy trì thói quen cầu nguyện.",
      emoji: "🏡 🤝 🌟",
      duration: "Hành trình suốt đời",
    }
  },
];

const HIGHLIGHTS = [
  { icon: BookOpen,       title: "Dẫn vào Kinh Thánh",  desc: "Mỗi bài học gắn với đoạn Tin Mừng ngắn, giúp các em làm quen linh động." },
  { icon: MessageSquare,  title: "Chia sẻ nhóm nhỏ",    desc: "Các em được khích lệ bày tỏ suy nghĩ trong môi trường cởi mở, yêu thương." },
  { icon: ShieldCheck,    title: "Đồng hành phụ huynh", desc: "Tài liệu tương tác gửi về nhà để bố mẹ dễ dàng đồng hành và cầu nguyện cùng con." },
  { icon: Star,           title: "Nghi thức trang nghiêm", desc: "Các buổi tập dượt thực tế bài bản giúp con tự tin bước vào thánh lễ đại triều." },
];

export default function KhoiRuocLe() {
  const [selectedStep, setSelectedStep] = useState(null);
  const heroRef = useRef(null);
  const { scrollY } = useScroll();
  const lenis = useLenis();
  const stepSheetY = useMotionValue(0);

  // Fallback Motion Config chuẩn Apple Motion Curves
  const systemConfig = useMotionConfig();
  const mc = systemConfig || {
    yOffset: 30,
    duration: (d) => d || 0.6,
    delay: (d) => d || 0,
    stagger: 0.08,
    isMobile: false,
    reduced: false,
    vp: () => ({ once: true, margin: "-12% 0px" }),
    heroParallax: [0, -60]
  };

  const heroY = useTransform(scrollY, [0, 600], mc.heroParallax || [0, -60]);

  const handleStepDragEnd = (event, info) => {
    if (info.offset.y > 100 || info.velocity.y > 500) {
      setSelectedStep(null);
    } else {
      stepSheetY.set(0);
    }
  };

  useEffect(() => {
    if (selectedStep) {
      stepSheetY.set(0);
      if (window.innerWidth < 768) document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [selectedStep, stepSheetY]);

  const fadeUp = {
    hidden: { opacity: 0, y: mc.yOffset },
    visible: (d = 0) => ({
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 90, damping: 15, mass: 0.8, delay: mc.delay(d) }
    }),
  };

  const vp = mc.vp();

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-stone-900 dark:bg-[#09090b] dark:text-stone-50 antialiased overflow-x-hidden selection:bg-lime-500/20 dark:selection:bg-lime-500/30 transition-colors duration-500">
      
      {/* HERO SECTION */}
      <section ref={heroRef} className="relative overflow-hidden pt-12 pb-20 md:pt-32 md:pb-32 bg-gradient-to-b from-white via-[#f5f5f7] to-transparent dark:from-stone-900 dark:via-[#09090b]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

        <motion.div style={{ y: heroY }} className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid md:grid-cols-12 gap-12 lg:gap-16 items-center">
            <div className="md:col-span-7 space-y-6 text-left">
              <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-lime-500/10 text-lime-700 dark:bg-lime-500/20 dark:text-lime-300">
                  <Star className="w-3 h-3 fill-current" /> Giáo Lý Hồng Ân
                </span>
              </motion.div>
              
              <motion.h1 variants={fadeUp} initial="hidden" animate="visible" custom={0.06} className="text-4xl sm:text-5xl lg:text-6xl font-sans font-extrabold tracking-tight leading-[1.08]">
                Bí tích Thánh Thể<br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-lime-600 via-emerald-600 to-teal-600 dark:from-lime-400 dark:via-emerald-400 dark:to-teal-400">
                  Dấu ấn đầu đời
                </span>
              </motion.h1>

              <motion.p variants={fadeUp} initial="hidden" animate="visible" custom={0.12} className="text-base sm:text-lg text-stone-500 dark:text-stone-400 leading-relaxed max-w-xl font-normal">
                Đồng hành cùng các em thiếu nhi chuẩn bị một tâm hồn trong sạch, thánh thiện để rước Chúa Giêsu Thánh Thể lần đầu tiên trong đời — bước ngoặt thiêng liêng gìn giữ đức tin mãi mãi.
              </motion.p>

              <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0.18} className="flex flex-wrap gap-4 pt-4">
                <button
                  onClick={() => {
                    const target = document.getElementById("hanh-trinh");
                    if (!target) return;
                    lenis ? lenis.scrollTo(target, { duration: 1 }) : target.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-full text-xs font-bold text-white shadow-lg bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-950 dark:hover:bg-white active:scale-[0.98] transition-all duration-200"
                >
                  Khám phá chương trình <ArrowRight className="w-4 h-4" />
                </button>
                <Link to="/tuyển-sinh#dang-ky"
                  className="inline-flex items-center justify-center h-12 px-6 rounded-full text-xs font-bold border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800/60 shadow-sm active:scale-[0.98] transition-all duration-200">
                  Đăng ký Nhập Học
                </Link>
              </motion.div>
            </div>

            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0.24} className="md:col-span-5 flex justify-center">
              <div className="relative w-full max-w-[340px] aspect-square rounded-[2.5rem] bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 p-8 shadow-xl dark:shadow-black/40 flex items-center justify-center group">
                <div className="absolute inset-0 bg-gradient-to-tr from-lime-500/5 to-emerald-500/5 rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                <img src="/images/khoiruoclelandau.avif" alt="Rước Lễ Lần Đầu" className="w-full h-full object-contain transform group-hover:scale-[1.02] transition-transform duration-500" loading="eager" />
                
                <div className="absolute -bottom-4 right-6 bg-white/90 dark:bg-stone-800/90 backdrop-blur-md rounded-2xl px-4 py-3 flex items-center gap-3 border border-stone-200/80 dark:border-stone-700/80 shadow-md">
                  <div className="w-2 h-2 rounded-full bg-lime-500 animate-pulse" />
                  <div>
                    <p className="text-xs font-bold tracking-tight">Lớp 3 – 4</p>
                    <p className="text-[10px] text-stone-500 dark:text-stone-400 font-medium">Bí tích Tình Yêu</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* OVERVIEW CARDS (Apple-Style Mobile Horizontal Scroll/Desktop Grid) */}
      <section className="py-8 bg-white/60 dark:bg-stone-900/40 backdrop-blur-md border-y border-stone-200/50 dark:border-stone-800/50 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex overflow-x-auto md:grid md:grid-cols-4 gap-6 scrollbar-none snap-x snap-mandatory -mx-6 px-6 md:mx-0 md:px-0">
            {OVERVIEW.map((item, i) => { const Icon = item.icon; return (
              <div key={i} className="flex-shrink-0 w-[240px] md:w-auto snap-center bg-stone-50 dark:bg-stone-900/60 md:bg-transparent md:dark:bg-transparent p-4 md:p-0 rounded-2xl border border-stone-200/40 dark:border-stone-800/40 md:border-none flex items-center gap-4 transition-all">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-white dark:bg-stone-800 shadow-sm border border-stone-200/40 dark:border-stone-700/40 flex-shrink-0">
                  <Icon className="w-4 h-4 text-stone-700 dark:text-stone-300" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500">{item.label}</p>
                  <p className="text-sm font-bold text-stone-800 dark:text-stone-200 mt-0.5 truncate">{item.value}</p>
                </div>
              </div>
            ); })}
          </div>
        </div>
      </section>

      {/* JOURNEY BENTO GRID */}
      <section id="hanh-trinh" className="py-24 max-w-6xl mx-auto px-6 scroll-mt-12">
        <div className="max-w-2xl text-left space-y-3 mb-16">
          <p className="text-[11px] font-bold tracking-widest uppercase text-lime-600 dark:text-lime-400">Lộ trình Đào Tạo</p>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Hành trình Khám phá & Gặp gỡ</h2>
          <p className="text-stone-500 dark:text-stone-400 text-sm leading-relaxed">
            Chương trình học gồm 6 chặng cốt lõi, chuyển hóa từ kiến thức căn bản đến thực hành nội tâm và sống chứng tá đời thường.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {JOURNEY.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: mc.yOffset }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={vp}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              onClick={() => setSelectedStep(item)}
              className={`group text-left rounded-[1.75rem] border p-6 bg-white dark:bg-stone-900 hover:shadow-xl hover:shadow-stone-200/30 dark:hover:shadow-none transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[190px] border-stone-200/60 dark:border-stone-800/80`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl font-black font-mono tracking-tight text-stone-200 dark:text-stone-800 group-hover:text-lime-500/30 dark:group-hover:text-lime-400/20 transition-colors">{item.step}</span>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${item.badge}`}>
                    Chi tiết
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-stone-900 dark:text-stone-100 group-hover:text-lime-600 dark:group-hover:text-lime-400 transition-colors mb-2">{item.title}</h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed line-clamp-3">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* NATIVE IOS-STYLE BOTTOM SHEET MODAL */}
        <AnimatePresence>
          {selectedStep && (
            <>
              {/* Backdrop Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedStep(null)}
                className="fixed inset-0 bg-black/40 dark:bg-black/70 backdrop-blur-sm z-50 pointer-events-auto"
              />

              {/* Sheet Container */}
              <div className="fixed inset-0 z-[60] flex flex-col justify-end md:items-center md:justify-center p-0 md:p-4 pointer-events-none">
                <motion.div
                  drag={window.innerWidth < 768 ? "y" : false}
                  dragConstraints={{ top: 0, bottom: 0 }}
                  dragElastic={{ top: 0.1, bottom: 0.6 }}
                  onDragEnd={handleStepDragEnd}
                  style={{ y: stepSheetY }}
                  
                  initial={{ opacity: 0, y: window.innerWidth < 768 ? "100%" : 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: window.innerWidth < 768 ? "100%" : 20 }}
                  transition={{ type: "spring", stiffness: 320, damping: 30, mass: 0.9 }}
                  
                  className="relative w-full md:max-w-xl rounded-t-[2.5rem] md:rounded-[2rem] border border-stone-200/80 dark:border-stone-800/80 shadow-2xl pointer-events-auto max-h-[88vh] md:max-h-[80vh] flex flex-col overflow-hidden bg-white/95 dark:bg-stone-900/95 backdrop-blur-xl text-stone-900 dark:text-stone-50"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Pull bar indicator for iOS Swipe */}
                  <div className="flex justify-center pt-3 pb-2 md:hidden touch-none">
                    <div className="w-12 h-1.5 bg-stone-300 dark:bg-stone-700 rounded-full" />
                  </div>

                  {/* Header */}
                  <div className="flex items-start gap-4 p-6 pb-4 touch-none">
                    <div className="w-12 h-12 rounded-2xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center shadow-inner flex-shrink-0 text-xl font-bold font-mono text-stone-400 dark:text-stone-500 select-none">
                      {selectedStep.step}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-extrabold text-xl tracking-tight text-stone-900 dark:text-white leading-tight">{selectedStep.title}</h3>
                      <p className="text-xs text-lime-600 dark:text-lime-400 font-bold mt-1 tracking-wide">{selectedStep.details.subtitle}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedStep(null)}
                      className="flex-shrink-0 w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center transition-colors hover:bg-stone-200 dark:hover:bg-stone-700 active:scale-90"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                        <path d="M18 6 6 18M6 6l12 12"/>
                      </svg>
                    </button>
                  </div>

                  {/* Meta Tags */}
                  <div className="flex gap-2 px-6 pb-4 flex-wrap touch-none">
                    <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                      ⏱ Thời lượng: {selectedStep.details.duration}
                    </span>
                  </div>

                  <div className="h-px bg-stone-200/60 dark:bg-stone-800/60 mx-6 flex-shrink-0" />

                  {/* Content (Scrollable Area) */}
                  <div className="p-6 pt-4 space-y-5 overflow-y-auto overscroll-contain flex-1 text-left">
                    <div className="space-y-5">
                      <div>
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500 mb-2.5">
                          Ý nghĩa mục tiêu
                        </h4>
                        <p className="text-sm leading-relaxed text-stone-600 dark:text-stone-300 font-medium">
                          {selectedStep.details.meaning}
                        </p>
                      </div>
                      
                      <div className="h-px bg-stone-100 dark:bg-stone-800/50" />
                      
                      <div>
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500 mb-2.5">
                          Bài học & Thực hành cốt lõi
                        </h4>
                        <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-950/40 border border-stone-200/50 dark:border-stone-800/40">
                          <p className="text-sm leading-relaxed text-stone-700 dark:text-stone-300 font-medium">
                            {selectedStep.details.highlight}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-center text-xl pt-4 tracking-[0.75em] select-none opacity-90">
                        {selectedStep.details.emoji}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>
      </section>

      {/* HIGHLIGHTS/METHODOLOGY SECTION (Apple Bento Style) */}
      <section className="py-24 bg-white dark:bg-stone-900/30 border-y border-stone-200/50 dark:border-stone-800/50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-2xl text-left space-y-2 mb-16">
            <p className="text-[11px] font-bold tracking-widest uppercase text-lime-600 dark:text-lime-400">Phương pháp đào tạo</p>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Toàn diện tâm hồn và kỹ năng phụng vụ</h2>
          </div>
          
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            {HIGHLIGHTS.map((item, i) => { const Icon = item.icon; return (
              <motion.div key={i} initial={{ opacity: 0, y: mc.yOffset }} whileInView={{ opacity: 1, y: 0 }}
                viewport={vp} transition={{ duration: 0.5, delay: i * 0.08 }}
                className="bg-stone-50 dark:bg-stone-900 rounded-3xl border border-stone-200/60 dark:border-stone-800/80 p-6 shadow-sm hover:shadow-md transition-all text-left">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-6 bg-lime-500/10 text-lime-600 dark:bg-lime-500/20 dark:text-lime-400">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 mb-2">{item.title}</h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed font-medium">{item.desc}</p>
              </motion.div>
            ); })}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-28 max-w-3xl mx-auto px-6 text-center">
        <motion.div initial={{ opacity: 0, y: mc.yOffset }} whileInView={{ opacity: 1, y: 0 }} viewport={vp} transition={{ duration: 0.6 }}>
          <div className="inline-flex w-12 h-12 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-md items-center justify-center mb-8">
            <Sparkles className="w-5 h-5 text-lime-500 fill-current" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">Chuẩn bị cho Ngày Hồng Ân</h2>
          <p className="text-stone-500 dark:text-stone-400 text-sm sm:text-base leading-relaxed mb-10 max-w-xl mx-auto font-medium">
            Kính mời quý Phụ huynh đăng ký nhập học khóa mới cho các em. Hãy để hành trình đức tin đầu đời của con được nuôi dưỡng trọn vẹn nhất trong vòng tay Giáo hội.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/tuyển-sinh#dang-ky"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-12 px-8 rounded-full text-xs font-bold text-white shadow-lg shadow-lime-600/10 bg-lime-600 hover:bg-lime-500 active:scale-[0.98] transition-all duration-200"
            >
              Đăng ký trực tuyến <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/liên-hệ"
              className="w-full sm:w-auto inline-flex items-center justify-center h-12 px-6 rounded-full text-xs font-bold border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800 shadow-sm active:scale-[0.98] transition-all duration-200">
              Liên hệ Văn phòng Giáo xứ
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}