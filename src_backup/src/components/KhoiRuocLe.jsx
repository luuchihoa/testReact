import React, { useState, useEffect } from "react";
import { Star, BookOpen, MessageSquare, ShieldCheck, Clock, CalendarDays, Users, Sparkles } from "lucide-react";
import { motion, AnimatePresence, useMotionValue } from "framer-motion";
import { useKhoiMotion } from "../hooks/useKhoiMotion.js";
import HeroSection from "./khoi/HeroSection.jsx";
import OverviewCards from "./khoi/OverviewCards.jsx";
import HighlightsGrid from "./khoi/HighlightsGrid.jsx";
import CtaSection from "./khoi/CtaSection.jsx";

// Hằng số Easing chuyển động chuẩn hệ thống Apple HIG
const APPLE_EASE = [0.16, 1, 0.3, 1];

const OVERVIEW = [
  { icon: Users,        label: "Độ tuổi",    value: "8 – 9 tuổi" },
  { icon: Clock,        label: "Thời lượng", value: "45 phút / buổi" },
  { icon: CalendarDays, label: "Lịch học",   value: "Chúa Nhật" },
  { icon: Star,         label: "Yêu cầu",    value: "Đã Rửa Tội" },
];

const JOURNEY = [
  {
    step: "01",
    title: "Tôi là ai?",
    desc: "Khám phá bản thân là con cái Thiên Chúa, hiểu về ân sủng Bí tích Rửa Tội đã lãnh nhận.",
    badge: "text-lime-700 bg-lime-100/80 dark:text-lime-400 dark:bg-lime-900/30 border border-lime-200/50 dark:border-lime-800/30",
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
    badge: "text-green-700 bg-green-100/80 dark:text-green-400 dark:bg-green-900/30 border border-green-200/50 dark:border-green-800/30",
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
    badge: "text-emerald-700 bg-emerald-100/80 dark:text-emerald-400 dark:bg-emerald-900/30 border border-emerald-200/50 dark:border-emerald-800/30",
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
    badge: "text-teal-700 bg-teal-100/80 dark:text-teal-400 dark:bg-teal-900/30 border border-teal-200/50 dark:border-teal-800/30",
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
    badge: "text-amber-700 bg-amber-100/80 dark:text-amber-400 dark:bg-amber-900/30 border border-amber-200/50 dark:border-amber-800/30",
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
    badge: "text-sky-700 bg-sky-100/80 dark:text-sky-400 dark:bg-sky-900/30 border border-sky-200/50 dark:border-sky-800/30",
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

const MOBILE_BREAKPOINT = 768;

export default function KhoiRuocLe() {
  const [selectedStep, setSelectedStep] = useState(null);
  const { heroRef, lenis, mc, heroY, fadeUp, vp } = useKhoiMotion();
  const stepSheetY = useMotionValue(0);

  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth < MOBILE_BREAKPOINT
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
      document.body.style.overflow = "hidden";
      lenis?.stop();
    } else {
      document.body.style.overflow = "";
      lenis?.start();
    }
    return () => { 
      document.body.style.overflow = "";
      lenis?.start();
    };
  }, [selectedStep, stepSheetY, lenis]);

  useEffect(() => {
    if (!selectedStep) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setSelectedStep(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedStep]);

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-900 dark:bg-[#1C1917] dark:text-stone-50 antialiased overflow-x-hidden selection:bg-lime-500/20 dark:selection:bg-lime-500/30 transition-colors duration-500">

      <HeroSection
        heroRef={heroRef}
        heroY={heroY}
        fadeUp={fadeUp}
        lenis={lenis}
        sectionBgClass="bg-gradient-to-b from-white via-[#FDFBF7] to-[#FDFBF7] dark:from-[#1C1917] dark:via-[#191614] dark:to-[#191614]"
        glowClass="bg-lime-500/5 dark:bg-lime-500/10"
        eyebrowIcon={Star}
        eyebrowLabel="Giáo Lý Hồng Ân"
        eyebrowClass="bg-lime-100/80 text-lime-700 dark:bg-lime-900/30 dark:text-lime-400 border border-lime-200/50 dark:border-lime-800/30 shadow-sm"
        titleLine1="Bí tích Thánh Thể"
        titleLine2="Dấu ấn đầu đời"
        titleGradientClass="bg-gradient-to-r from-lime-600 via-emerald-600 to-teal-600 dark:from-lime-400 dark:via-emerald-400 dark:to-teal-400"
        description="Đồng hành cùng các em thiếu nhi chuẩn bị một tâm hồn trong sạch, thánh thiện để rước Chúa Giêsu Thánh Thể lần đầu tiên trong đời — bước ngoặt thiêng liêng gìn giữ đức tin mãi mãi."
        primaryCtaLabel="Khám phá chương trình"
        primaryCtaTargetId="hanh-trinh"
        primaryCtaClass="bg-lime-600 md:hover:bg-lime-500 dark:bg-lime-500 dark:hover:bg-lime-400 text-white"
        secondaryCtaLabel="Đăng ký Nhập Học"
        secondaryCtaTo="/tuyển-sinh#dang-ky"
        image={{ src: "/images/khoiruoclelandau.avif", alt: "Rước Lễ Lần Đầu" }}
        imageGlowClass="bg-gradient-to-tr from-lime-500/5 to-emerald-500/5"
        floatBadge={{ label: "Lớp 3 – 4", sub: "Bí tích Tình Yêu", dotClass: "bg-lime-500" }}
      />

      <OverviewCards items={OVERVIEW} />

      {/* JOURNEY BENTO GRID */}
      <section id="hanh-trinh" className="py-20 sm:py-24 max-w-6xl mx-auto px-4 sm:px-6 scroll-mt-12 relative z-20">
        <div className="max-w-2xl text-left space-y-3 mb-12 sm:mb-16">
          <p className="text-[11px] font-bold tracking-widest uppercase text-lime-600 dark:text-lime-400 ml-1">Lộ trình Đào Tạo</p>
          <h2 className="text-[28px] sm:text-[36px] md:text-[40px] font-extrabold font-serif tracking-tight text-amber-950 dark:text-amber-50 leading-tight">Hành trình Khám phá &amp; Gặp gỡ</h2>
          <p className="text-[14px] sm:text-[15.5px] font-medium text-stone-500 dark:text-stone-400 leading-relaxed max-w-xl">
            Chương trình học gồm 6 chặng cốt lõi, chuyển hóa từ kiến thức căn bản đến thực hành nội tâm và sống chứng tá đời thường.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {JOURNEY.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: mc.yOffset }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={vp}
              transition={{ duration: 0.5, delay: i * 0.05, ease: APPLE_EASE }}
              onClick={() => setSelectedStep(item)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setSelectedStep(item); }}
              className="group text-left rounded-[24px] sm:rounded-[32px] border p-6 sm:p-8 bg-white/90 dark:bg-[#1C1917]/90 backdrop-blur-xl md:hover:shadow-lg active:scale-[0.98] transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[220px] border-amber-900/10 dark:border-amber-100/10"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <span className="text-[32px] font-black font-mono tracking-tight text-amber-900/10 dark:text-amber-100/10 md:group-hover:text-lime-500/30 dark:group-hover:text-lime-400/20 transition-colors">{item.step}</span>
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-sm ${item.badge}`}>
                    Chi tiết
                  </span>
                </div>
                <h3 className="text-[20px] sm:text-[22px] font-extrabold font-serif text-amber-950 dark:text-amber-50 md:group-hover:text-lime-600 dark:group-hover:text-lime-400 transition-colors mb-2.5">{item.title}</h3>
                <p className="text-[14px] text-stone-500 dark:text-stone-400 leading-relaxed font-medium line-clamp-3">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* NATIVE IOS-STYLE BOTTOM SHEET MODAL */}
        <AnimatePresence>
          {selectedStep && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: APPLE_EASE }}
                onClick={() => setSelectedStep(null)}
                className="fixed inset-0 bg-stone-900/40 dark:bg-black/60 backdrop-blur-sm z-50 pointer-events-auto"
              />

              <div data-lenis-prevent className="fixed inset-0 z-[60] flex flex-col justify-end md:items-center md:justify-center p-0 md:p-4 pointer-events-none">
                <motion.div
                  role="dialog"
                  aria-modal="true"
                  drag={isMobile ? "y" : false}
                  dragConstraints={{ top: 0, bottom: 0 }}
                  dragElastic={{ top: 0.1, bottom: 0.6 }}
                  onDragEnd={handleStepDragEnd}
                  style={{ y: stepSheetY }}
                  initial={{ opacity: 0, y: isMobile ? "100%" : 30, scale: isMobile ? 1 : 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: isMobile ? "100%" : 20, scale: isMobile ? 1 : 0.95 }}
                  transition={{ duration: 0.4, ease: APPLE_EASE }}
                  className="relative w-full md:max-w-xl pb-[env(safe-area-inset-bottom)] md:pb-0 rounded-t-[32px] md:rounded-[32px] border border-amber-900/10 dark:border-amber-100/10 shadow-2xl pointer-events-auto max-h-[90vh] md:max-h-[85vh] flex flex-col overflow-hidden bg-white/95 dark:bg-[#1C1917]/95 backdrop-blur-xl text-amber-950 dark:text-amber-50"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex justify-center pt-4 pb-2 md:hidden touch-none active:cursor-grabbing">
                    <div className="w-12 h-1.5 bg-stone-300 dark:bg-stone-700 rounded-full" />
                  </div>

                  <div className="flex items-center gap-4 p-6 sm:p-8 pb-4 touch-none border-b border-amber-900/5 dark:border-amber-100/5">
                    <div className="w-14 h-14 rounded-2xl bg-amber-100/50 dark:bg-stone-800 flex items-center justify-center flex-shrink-0 text-xl font-bold font-mono text-amber-800 dark:text-amber-500 border border-amber-900/5 dark:border-amber-700/30 select-none">
                      {selectedStep.step}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-extrabold font-serif text-[22px] tracking-tight leading-tight truncate">{selectedStep.title}</h3>
                      <p className="text-[12px] text-lime-600 dark:text-lime-400 font-bold uppercase tracking-widest mt-1.5 truncate">{selectedStep.details.subtitle}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedStep(null)}
                      className="flex-shrink-0 w-9 h-9 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center transition-colors md:hover:bg-stone-200 dark:hover:bg-stone-700 active:scale-90 text-stone-500"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                        <path d="M18 6 6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="flex gap-2 px-6 sm:px-8 py-3 bg-stone-50/50 dark:bg-stone-900/30 flex-wrap touch-none">
                    <span className="text-[10px] font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-full bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-amber-900/5 dark:border-amber-100/5 shadow-sm">
                      ⏱ Thời lượng: {selectedStep.details.duration}
                    </span>
                  </div>

                  <div className="h-px bg-amber-900/5 dark:bg-amber-100/5 mx-6 flex-shrink-0" />

                  <div className="p-6 sm:p-8 pt-5 space-y-6 overflow-y-auto overscroll-contain flex-1 text-left">
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-[11px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500 mb-2.5">
                          Ý nghĩa mục tiêu
                        </h4>
                        <p className="text-[14.5px] leading-relaxed text-stone-600 dark:text-stone-300 font-medium">
                          {selectedStep.details.meaning}
                        </p>
                      </div>

                      <div className="bg-stone-50/50 dark:bg-stone-900/30 p-4 sm:p-5 rounded-2xl border border-amber-900/5 dark:border-amber-100/5">
                        <h4 className="text-[11px] font-bold uppercase tracking-widest text-lime-700 dark:text-lime-500 mb-2.5">
                          Bài học &amp; Thực hành cốt lõi
                        </h4>
                        <p className="text-[14px] leading-relaxed text-stone-700 dark:text-stone-300 font-medium">
                          {selectedStep.details.highlight}
                        </p>
                      </div>

                      <div className="text-center text-2xl pt-2 tracking-[0.5em] select-none opacity-90 drop-shadow-sm">
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

      <HighlightsGrid
        items={HIGHLIGHTS}
        eyebrowLabel="Phương pháp đào tạo"
        title="Toàn diện tâm hồn và kỹ năng"
        accentTextClass="text-lime-600 dark:text-lime-400"
        accentIconClass="bg-lime-100/80 text-lime-700 dark:bg-lime-900/30 dark:text-lime-400 border border-lime-200/50 dark:border-lime-800/30 shadow-sm"
        cardClass="bg-white/80 dark:bg-[#1C1917]/80 backdrop-blur-xl border-amber-900/10 dark:border-amber-100/10"
        sectionClassName="py-20 relative z-10"
        mc={mc}
        vp={vp}
      />

      <CtaSection
        icon={Sparkles}
        iconClass="text-lime-500"
        title="Chuẩn bị cho Ngày Hồng Ân"
        description="Kính mời quý Phụ huynh đăng ký nhập học khóa mới cho các em. Hãy để hành trình đức tin đầu đời của con được nuôi dưỡng trọn vẹn nhất trong vòng tay Giáo hội."
        primaryCtaLabel="Đăng ký trực tuyến"
        primaryCtaTo="/tuyển-sinh#dang-ky"
        primaryCtaClass="bg-lime-600 text-white md:hover:bg-lime-500 shadow-sm"
        secondaryCtaLabel="Liên hệ Văn phòng"
        secondaryCtaTo="/liên-hệ"
        mc={mc}
        vp={vp}
        sectionClassName="pt-20 pb-32 max-w-3xl mx-auto px-4 sm:px-6 text-center border-t border-amber-900/5 dark:border-amber-100/5 relative z-10"
      />
    </div>
  );
}