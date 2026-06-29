import React, { useRef, useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Globe, Compass, Users, MessageSquare, Lightbulb, Heart, Clock, CalendarDays, ArrowRight, ChevronLeft, ShieldCheck } from "lucide-react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useLenis } from "lenis/react";
import { useMotionConfig } from "../hooks/useMotionConfig.js";

const ACCENT   = "#7c3a1e";
const ACCENT_L = "#fdf6ee";

const OVERVIEW = [
  { icon: Users,        label: "Độ tuổi",    value: "Từ 16 tuổi trở lên" },
  { icon: Clock,        label: "Thời lượng", value: "45 phút / buổi" },
  { icon: CalendarDays, label: "Lịch học",   value: "Chúa Nhật sau Thánh lễ" },
  { icon: ShieldCheck,  label: "Yêu cầu",    value: "Đã lãnh các Bí tích khai tâm" },
];

const PILLARS = [
  {
    icon: Globe, title: "Đức tin & Văn hoá",
    color: "bg-amber-50 border-amber-100", iconBg: "bg-amber-100", iconColor: "text-amber-700",
    topics: ["Giáo Hội trong thế giới hiện đại (Gaudium et Spes)", "Đức tin trước thách đố khoa học & công nghệ", "Giá trị Kitô giáo trong môi trường đại học & công sở", "Phân định ơn gọi — đời sống gia đình và tu trì"],
  },
  {
    icon: Heart, title: "Xã hội & Công bằng",
    color: "bg-rose-50 border-rose-100", iconBg: "bg-rose-100", iconColor: "text-rose-600",
    topics: ["Học thuyết xã hội Công giáo — nền tảng và ứng dụng", "Phẩm giá con người & nhân quyền", "Bảo vệ môi trường — tiếng gọi từ Laudato Si'", "Tình liên đới và phục vụ người nghèo"],
  },
  {
    icon: Compass, title: "Sứ mạng & Chứng nhân",
    color: "bg-stone-50 border-stone-200", iconBg: "bg-stone-100", iconColor: "text-stone-600",
    topics: ["Loan báo Tin Mừng trong bối cảnh Việt Nam", "Mạng xã hội — không gian truyền giáo mới", "Xây dựng cộng đoàn tươi trẻ và sống động", "Gương sáng — các Thánh tử đạo Việt Nam"],
  },
];

const HIGHLIGHTS = [
  { icon: MessageSquare, title: "Thảo luận mở",       desc: "Không có câu trả lời sẵn — các bạn trẻ cùng nhau đặt câu hỏi, tìm kiếm và đối thoại trong tinh thần đức tin." },
  { icon: Lightbulb,     title: "Diễn giả khách mời", desc: "Mỗi học kỳ có 2–3 buổi mời chuyên gia, linh mục, tu sĩ hoặc giáo dân gương mẫu chia sẻ hành trình sống đức tin." },
  { icon: Heart,         title: "Phục vụ thực tế",    desc: "Tham gia các hoạt động bác ái, tình nguyện xã hội như một phần bắt buộc của chương trình — học đi đôi với hành." },
  { icon: Globe,         title: "Tài liệu chuyên sâu", desc: "Học từ các văn kiện Giáo Hội, các tác phẩm thần học và tài liệu giáo lý hiện đại được chọn lọc và Việt hoá." },
];

const QUOTES = [
  { text: "Anh em hãy ra đi và làm cho muôn dân trở thành môn đệ.", src: "Mt 28,19" },
  { text: "Anh em là muối cho đời, là ánh sáng cho trần gian.", src: "Mt 5,13-14" },
  { text: "Đừng để ai coi thường anh vì anh còn trẻ.", src: "1 Tm 4,12" },
  { text: "Hãy tìm kiếm Nước Thiên Chúa trước, còn tất cả các thứ khác sẽ được thêm vào.", src: "Mt 6,33" },
  { text: "Người trẻ ơi, Ta nói với anh: hãy trỗi dậy!", src: "Lc 7,14" },
  { text: "Đức tin không có việc làm là đức tin chết.", src: "Gc 2,17" },
  { text: "Hãy canh tân tâm trí anh em để nhận ra đâu là ý Thiên Chúa.", src: "Rm 12,2" },
  
  // --- CÁC CÂU BỔ SUNG MỚI CHUYÊN CHO KHỐI VÀO ĐỜI ---
  
  // Về học tập, công việc và sự khôn ngoan giữa đời
  { text: "Bất cứ làm việc gì, hãy làm tận tâm như làm cho Chúa, chứ không phải cho người phàm.", src: "Cl 3,23" },
  { text: "Anh em phải khôn ngoan như rắn và đơn sơ như bồ câu.", src: "Mt 10,16" },
  { text: "Ai trung tín trong việc rất nhỏ, thì cũng trung tín trong việc lớn.", src: "Lc 16,10" },
  { text: "Hãy ký thác đường đời cho Chúa, tin tưởng vào Người, Người sẽ ra tay.", src: "Tv 37,5" },

  // // Về sức mạnh tinh thần và sự can đảm của người trẻ
  { text: "Hãy can đảm và mạnh mẽ! Đừng sợ hãi, vì Đức Chúa, Thiên Chúa của bạn, ở với bạn bất cứ nơi nào bạn đi.", src: "Gsh 1,9" },
  { text: "Tôi có thể làm được mọi sự nhờ Đấng ban sức mạnh cho tôi.", src: "Pl 4,13" },
  { text: "Ơn của Thầy đã đủ cho con, vì sức mạnh của Thầy được biểu lộ trọn vẹn trong sự yếu đuối.", src: "2 Co 12,9" },

  // Về tình yêu, lối sống và chứng nhân Tin Mừng
  { text: "Đừng để cho sự ác thắng được mình, nhưng hãy lấy thiện mà thắng ác.", src: "Rm 12,21" },
  { text: "Người ta cứ dấu này mà nhận biết các con là môn đệ Thầy: là các con có lòng yêu thương nhau.", src: "Ga 13,35" },
  { text: "Chính Thầy là con đường, là sự thật và là sự sống.", src: "Ga 14,6" },

  // Trích dẫn truyền cảm hứng từ Đức Thánh Cha dành cho người trẻ (Christus Vivit)
  { text: "Người trẻ thân mến, đừng nhìn cuộc sống từ trên ban công. Hãy dấn thân vào nơi mà các thách đố đang gọi mời.", src: "ĐTC Phanxicô" },
  { text: "Các con là 'hiện tại' của Thiên Chúa, chứ không phải chỉ là một tương lai xa vời.", src: "Tông huấn Christus Vivit" },
  { text: "Đừng sống mòn, hãy sống hết mình! Hãy mở cửa lòng ra với Chúa và với tha nhân.", src: "ĐTC Phanxicô" }
];

function QuoteSlider({ quotes }) {
  const [cur, setCur] = useState(0);
  const [dir, setDir] = useState(1);
  const timerRef = useRef(null);

  const resetTimer = useCallback(() => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setDir(1);
      setCur((p) => (p + 1) % quotes.length);
    }, 5000);
  }, [quotes.length]);

  useEffect(() => {
    resetTimer();
    return () => clearInterval(timerRef.current);
  }, [resetTimer]);

  const variants = {
    enter: (d) => ({ x: d > 0 ? "50%" : "-50%", opacity: 0 }),
    center: { x: "0%", opacity: 1 },
    exit: (d) => ({ x: d > 0 ? "-50%" : "50%", opacity: 0 }),
  };

  if (!quotes || quotes.length === 0) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 relative">
      <div className="invisible pointer-events-none select-none aria-hidden relative w-full" style={{ visibility: 'hidden' }}>
        <div className="p-5 flex flex-col border border-transparent">
          <p className="text-sm font-medium leading-relaxed italic">"{quotes[0].text}"</p>
          <p className="text-[11px] font-bold pt-2 mt-2">({quotes[0].src})</p>
        </div>
        {quotes.slice(1).map((q, idx) => (
          <div key={idx} className="absolute inset-0 p-5 flex flex-col border border-transparent">
            <p className="text-sm font-medium leading-relaxed italic">"{q.text}"</p>
            <p className="text-[11px] font-bold pt-2 mt-2">({q.src})</p>
          </div>
        ))}
      </div>
      <div className="absolute inset-0 overflow-hidden px-4 sm:px-6">
        <AnimatePresence initial={false} custom={dir} mode="wait">
          <motion.div
            key={cur}
            custom={dir}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 32 },
              opacity: { duration: 0.2 },
            }}
            className="w-full h-full bg-white/10 backdrop-blur-sm rounded-2xl border border-white/15 p-5 flex flex-col justify-center touch-pan-y"
          >
            <p className="text-white/90 text-sm font-medium leading-relaxed italic select-none">
              "{quotes[cur].text}"
            </p>
            <p className="text-right text-white/45 text-[11px] font-bold tracking-wide mt-2 select-none">
              ({quotes[cur].src})
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function KhoiVaoDoi() {
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
    <div className="min-h-screen bg-[#faf8f5] text-stone-900 antialiased overflow-x-hidden selection:bg-amber-200 selection:text-amber-900">

      <section ref={heroRef} className="relative overflow-hidden pt-16 pb-20 md:pt-28 md:pb-32"
        style={{ background: `linear-gradient(160deg, ${ACCENT_L} 0%, #faf8f5 60%)` }}>
        {!mc.isMobile && (
          <>
            <div className="absolute top-0 left-0 w-[600px] h-[500px] bg-amber-200/15 blur-[120px] rounded-full -z-10 -translate-x-1/4" />
            <div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-orange-100/15 blur-[100px] rounded-full -z-10" />
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
                  <Globe className="w-3.5 h-3.5" />Khối Vào Đời
                </span>
              </motion.div>
              <motion.h1 variants={fadeUp} custom={0.05} className="text-4xl md:text-6xl font-serif font-black tracking-tight text-stone-900 leading-[1.1] mb-5">
                Sống đức tin<br />
                <span className="bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(135deg, ${ACCENT}, #3c1810)` }}>
                  giữa lòng đời
                </span>
              </motion.h1>
              <motion.p variants={fadeUp} custom={0.1} className="text-base md:text-lg text-stone-500 leading-relaxed max-w-lg mb-8">
                Khối Vào Đời đồng hành cùng các bạn trẻ trưởng thành bước vào đại học, công
                sở và xã hội — trang bị hành trang đức tin để trở thành những chứng nhân
                Tin Mừng trong thế giới hiện đại.
              </motion.p>
              <motion.div variants={fadeUp} custom={0.15} className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    const t = document.getElementById("noi-dung");
                    if (!t) return;
                    lenis ? lenis.scrollTo(t, { duration: mc.isMobile ? 0.8 : 1.2 }) : t.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-xl text-sm font-bold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
                  style={{ background: ACCENT, boxShadow: `0 4px 16px ${ACCENT}40` }}>
                  Xem nội dung<ArrowRight className="w-4 h-4" />
                </button>
                <Link to="/nhóm-trẻ-công-giáo"
                  className="inline-flex items-center justify-center h-11 px-5 rounded-xl text-sm font-semibold border border-stone-200 bg-white text-stone-800 hover:bg-stone-50 shadow-sm transition-all duration-300 hover:-translate-y-0.5 active:scale-95">
                  Tham gia nhóm
                </Link>
              </motion.div>
            </div>

            <motion.div variants={fadeUp} custom={0.2} className="flex-shrink-0 w-full md:w-[280px]">
              <div className="relative rounded-3xl overflow-hidden aspect-square w-full max-w-[260px] md:max-w-full mx-auto shadow-xl"
                style={{ background: `linear-gradient(135deg, ${ACCENT_L}, #fde8d0)` }}>
                <img src="/images/khoivaodoi.avif" alt="Khối Vào Đời"
                  className="w-full h-full object-contain p-8 mix-blend-multiply"
                  loading={mc.isMobile ? "lazy" : "eager"} />
                <div className="absolute bottom-3 left-3 right-3 bg-white/80 backdrop-blur-sm rounded-2xl px-4 py-2.5 flex items-center gap-2.5 shadow-sm">
                  <Compass className="w-4 h-4 flex-shrink-0" style={{ color: ACCENT }} />
                  <div>
                    <p className="text-[11px] font-bold text-stone-900">Từ 16 tuổi</p>
                    <p className="text-[10px] text-stone-500">Thanh niên trưởng thành</p>
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

      <section id="noi-dung" className="py-20 md:py-28 max-w-5xl mx-auto px-5 sm:px-6 scroll-mt-16">
        <motion.div initial={{ opacity: 0, y: mc.yOffset }} whileInView={{ opacity: 1, y: 0 }} viewport={vp}
          transition={{ duration: mc.duration(0.7) }} className="mb-12">
          <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: ACCENT }}>Nội dung</p>
          <h2 className="text-3xl md:text-4xl font-serif font-black text-stone-900 leading-tight">Ba trụ cột của người<br />Kitô hữu trưởng thành</h2>
          <p className="mt-3 text-stone-500 max-w-lg text-sm leading-relaxed">Mỗi học kỳ đi sâu vào một trụ cột, xoay vòng qua các năm để đảm bảo sự toàn diện trong hành trình đức tin trưởng thành.</p>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-6">
          {PILLARS.map((pillar, i) => { const Icon = pillar.icon; return (
            <motion.div key={i} initial={{ opacity: 0, y: mc.yOffset }} whileInView={{ opacity: 1, y: 0 }}
              viewport={vp} transition={{ duration: mc.duration(0.6), delay: mc.delay(i * 0.1) }}
              whileHover={mc.isMobile ? undefined : { y: -4, transition: { duration: 0.2 } }}
              className={`rounded-2xl border p-6 ${pillar.color}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${pillar.iconBg}`}>
                <Icon className={`w-5 h-5 ${pillar.iconColor}`} />
              </div>
              <h3 className="text-base font-bold text-stone-900 mb-4">{pillar.title}</h3>
              <ul className="space-y-2.5">
                {pillar.topics.map((topic, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm text-stone-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-stone-400 flex-shrink-0 mt-2" />{topic}
                  </li>
                ))}
              </ul>
            </motion.div>
          ); })}
        </div>
      </section>

      {/* QUOTE BANNER — auto slide */}
      <section className="py-14" style={{ background: `linear-gradient(135deg, #1c0a05 0%, ${ACCENT} 100%)` }}>
        <QuoteSlider quotes={QUOTES} mc={mc} />
      </section>

      <section className="py-20 md:py-28 max-w-5xl mx-auto px-5 sm:px-6">
        <motion.div initial={{ opacity: 0, y: mc.yOffset }} whileInView={{ opacity: 1, y: 0 }} viewport={vp}
          transition={{ duration: mc.duration(0.7) }} className="mb-12">
          <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: ACCENT }}>Phương pháp</p>
          <h2 className="text-3xl md:text-4xl font-serif font-black text-stone-900">Học để sống,<br />không chỉ để biết</h2>
        </motion.div>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-5">
          {HIGHLIGHTS.map((item, i) => { const Icon = item.icon; return (
            <motion.div key={i} initial={{ opacity: 0, y: mc.yOffset }} whileInView={{ opacity: 1, y: 0 }}
              viewport={vp} transition={{ duration: mc.duration(0.5), delay: mc.delay(i * 0.1) }}
              whileHover={mc.isMobile ? undefined : { y: -4, transition: { duration: 0.2 } }}
              className="bg-white rounded-2xl border border-stone-100 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: `${ACCENT}12` }}>
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
            <Globe className="w-10 h-10 mx-auto mb-4" style={{ color: ACCENT }} />
          </motion.div>
          <h2 className="text-2xl md:text-3xl font-serif font-black text-stone-900 mb-3">Sẵn sàng bước ra?</h2>
          <p className="text-stone-500 text-sm leading-relaxed mb-8 max-w-md mx-auto">Gia nhập cộng đoàn thanh niên đức tin — nơi bạn không bước vào đời một mình, mà có Chúa và cả một cộng đoàn đồng hành.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/nhóm-trẻ-công-giáo"
              className="inline-flex items-center justify-center gap-2 h-11 px-8 rounded-xl text-sm font-bold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
              style={{ background: ACCENT, boxShadow: `0 4px 16px ${ACCENT}40` }}>
              Tham gia ngay<ArrowRight className="w-4 h-4" />
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