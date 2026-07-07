import React, { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Flame, Wind, Shield, Users, BookOpen, Clock, CalendarDays, ArrowRight, ChevronLeft, Zap, Star } from "lucide-react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useLenis } from "lenis/react";
import { useMotionConfig } from "../hooks/useMotionConfig.js";

const ACCENT   = "#ca8a04";
const ACCENT_L = "#fefce8";

const OVERVIEW = [
  { icon: Users,        label: "Độ tuổi",    value: "Lớp 5 – 6" },
  { icon: Clock,        label: "Thời lượng", value: "45 phút / buổi" },
  { icon: CalendarDays, label: "Lịch học",   value: "Chúa Nhật" },
  { icon: Star,       label: "Yêu cầu",    value: "Đã Rước Lễ Lần Đầu" },
];

const GIFTS = [
  {
    id: "khon-ngoan",
    name: "Khôn Ngoan",
    icon: "🌿",
    color: "bg-amber-50 border-amber-200",
    desc: "Nhìn thấy mọi sự theo nhãn quan của Thiên Chúa — biết đặt Chúa lên trên hết.",
    example: "Một bạn trẻ từ chối gian lận dù cả lớp làm vậy — vì biết điều gì thực sự có giá trị.",
  },
  {
    id: "hieu-biet",
    name: "Hiểu Biết",
    icon: "📖",
    color: "bg-blue-50 border-blue-200",
    desc: "Thấu hiểu sâu sắc các chân lý đức tin và ý nghĩa của cuộc sống.",
    example: "Đọc một đoạn Kinh Thánh và tự nhiên nhận ra nó đang nói về chính mình hôm nay.",
  },
  {
    id: "lo-lieu",
    name: "Biết Lo Liệu",
    icon: "🧭",
    color: "bg-teal-50 border-teal-200",
    desc: "Phân định điều tốt và hành động đúng đắn trong mỗi tình huống cụ thể.",
    example: "Biết khi nào nên nói, khi nào nên im lặng; khi nào giúp bạn, khi nào cần để bạn tự lớn.",
  },
  {
    id: "dung-cam",
    name: "Dũng Cảm",
    icon: "🦁",
    color: "bg-orange-50 border-orange-200",
    desc: "Can đảm sống và loan báo đức tin dù bị phản đối hay chế nhạo.",
    example: "Dám cầu nguyện trước bữa ăn ở canteen trường, dù bạn bè nhìn.",
  },
  {
    id: "thong-minh",
    name: "Thông Minh",
    icon: "💡",
    color: "bg-yellow-50 border-yellow-200",
    desc: "Dùng trí tuệ và tài năng Chúa ban để phục vụ vinh quang Ngài.",
    example: "Học giỏi không phải để hơn người, mà để có thể phục vụ xã hội tốt hơn vì Chúa.",
  },
  {
    id: "dao-duc",
    name: "Đạo Đức",
    icon: "🕊️",
    color: "bg-green-50 border-green-200",
    desc: "Kính sợ Chúa và yêu mến điều thiện — tránh xa tội lỗi không phải vì sợ mà vì yêu.",
    example: "Cảm thấy xấu hổ và buồn lòng khi làm điều sai — đó chính là ơn đạo đức đang hoạt động.",
  },
  {
    id: "kinh-so",
    name: "Kính Sợ Chúa",
    icon: "✨",
    color: "bg-violet-50 border-violet-200",
    desc: "Kinh ngạc trước sự vĩ đại của Thiên Chúa và không muốn làm Ngài buồn lòng.",
    example: "Ngắm hoàng hôn hay bầu trời sao và tự nhiên thốt lên: \"Lạy Chúa, Chúa thật kỳ diệu!\"",
  },
];

function GiftCard({ gift, accent, mc, vp, index, onSelect }) {
  return (
    <motion.button
      type="button"
      onClick={() => onSelect(gift)}
      initial={{ opacity: 0, y: mc.yOffset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={vp}
      transition={{ duration: mc.duration(0.45), delay: mc.delay(index * 0.07) }}
      whileHover={mc.isMobile ? undefined : { y: -3, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.97 }}
      className={`group text-left rounded-2xl border p-4 transition-shadow md:hover:shadow-md active:shadow-sm w-full ${gift.color}`}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-xl">{gift.icon}</span>
        <span className="text-[10px] font-bold uppercase tracking-widest opacity-35 mt-0.5">
          Ơn {index + 1}
        </span>
      </div>
      <h3 className="text-sm font-bold text-stone-900 mb-1.5">{gift.name}</h3>
      <p className="text-xs text-stone-500 leading-relaxed">{gift.desc}</p>
      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-black/8">
        <span className="text-[10px] font-semibold opacity-30">Nhấn để xem</span>
        <div className="w-5 h-5 rounded-full bg-black/8 flex items-center justify-center group-hover:bg-black/15 transition-colors">
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
            <path d="M1.5 4h5M4 1.5l2.5 2.5L4 6.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="opacity-40"/>
          </svg>
        </div>
      </div>
    </motion.button>
  );
}

const MODULES = [
  {
    phase: "Học Kỳ 1: Ai là tôi trong Chúa Thánh Thần?",
    weeks: "16 buổi",
    color: "bg-amber-50 border-amber-100", dot: "bg-amber-400",
    topics: ["Chúa Thánh Thần — Ngôi Ba Thiên Chúa", "7 ơn Chúa Thánh Thần và ý nghĩa trong cuộc sống", "Ôn lại hành trình đức tin từ Rửa Tội đến hôm nay", "Bí tích Hoà Giải — chuẩn bị tâm hồn"],
    borderAccent: "border-l-amber-400"
  },
  {
    phase: "Học Kỳ 2: Tôi được sai đi",
    weeks: "18 buổi",
    color: "bg-yellow-50 border-yellow-100", dot: "bg-yellow-500",
    topics: ["Sứ mạng ngôn sứ — làm chứng cho Chúa", "Sứ mạng tư tế — cầu nguyện và phụng thờ", "Sứ mạng vương đế — phục vụ và lãnh đạo", "Nghi thức Bí tích Thêm Sức & buổi tập dượt"],
    borderAccent: "border-l-yellow-500"
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
  const [selectedGift, setSelectedGift] = useState(null);

  useEffect(() => {
    document.body.style.overflow =
      (selectedGift) ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [ selectedGift]);

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
            <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-stone-500 md:hover:text-stone-800 mb-8 transition-colors">
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
              <motion.h1 variants={fadeUp} custom={0.05} className="text-3xl sm:text-4xl md:text-6xl font-serif font-black tracking-tight text-stone-900 leading-[1.1] mb-5">
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
                  className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-xl text-sm font-bold text-white shadow-md transition-all duration-300 md:hover:-translate-y-0.5 active:scale-95"
                  style={{ background: ACCENT, boxShadow: `0 4px 16px ${ACCENT}40` }}>
                  Xem chương trình<ArrowRight className="w-4 h-4" />
                </button>
                <Link to="/tuyển-sinh#dang-ky"
                  className="inline-flex items-center justify-center h-11 px-5 rounded-xl text-sm font-semibold border border-stone-200 bg-white text-stone-800 md:hover:bg-stone-50 shadow-sm transition-all duration-300 md:hover:-translate-y-0.5 active:scale-95">
                  Đăng ký
                </Link>
              </motion.div>
            </div>

            <motion.div variants={fadeUp} custom={0.2} className="flex-shrink-0 w-full md:w-[280px]">
              <div className="relative rounded-3xl overflow-hidden aspect-square w-full max-w-[260px] md:max-w-full mx-auto shadow-xl"
                style={{ background: `linear-gradient(135deg, ${ACCENT_L}, #fde68a)` }}>
                <img src="/images/khoithemsuc.avif" alt="Khối Thêm Sức"
                  className="w-full h-full object-contain p-8 mix-blend-multiply"
                  loading={mc.isMobile ? "lazy" : "eager"} />
                <div className="absolute bottom-3 left-3 right-3 bg-white/80 backdrop-blur-sm rounded-2xl px-4 py-2.5 flex items-center gap-2.5 shadow-sm">
                  <Zap className="w-4 h-4 flex-shrink-0" style={{ color: ACCENT }} />
                  <div>
                    <p className="text-[11px] font-bold text-stone-900">Lớp 5 – Lớp 6</p>
                    <p className="text-[10px] text-stone-500">10 – 11 tuổi</p>
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
        <motion.div initial={{ opacity: 0, y: mc.yOffset }} whileInView={{ opacity: 1, y: 0 }}
          viewport={vp} transition={{ duration: mc.duration(0.7) }} className="mb-12">
          <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: ACCENT }}>Trọng tâm</p>
          <h2 className="text-3xl md:text-4xl font-serif font-black text-stone-900 leading-tight">
            Bảy ơn Chúa Thánh Thần
          </h2>
          <p className="mt-3 text-stone-500 max-w-lg text-sm leading-relaxed">
            Mỗi ơn được học qua Kinh Thánh, ví dụ thực tế và hoạt động nhóm —
            giúp các em hiểu và sống 7 ơn này trong đời thường.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {GIFTS.map((gift, i) => (
            <GiftCard
              key={gift.id}
              gift={gift}
              accent={ACCENT}
              mc={mc}
              vp={vp}
              index={i}
              onSelect={setSelectedGift}
            />
          ))}

          {/* Quote card — Câu Lời Chúa và tên sách bám sát nhau */}
          <motion.div
            initial={{ opacity: 0, y: mc.yOffset }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={vp}
            transition={{ duration: mc.duration(0.45), delay: mc.delay(0.56) }}
            className="rounded-2xl border p-5 flex flex-col justify-between backdrop-blur-sm shadow-sm"
            style={{ background: `${ACCENT}08`, borderColor: `${ACCENT}25` }}
          >
            <div>
              {/* Icon hàng đầu */}
              <Flame className="w-5 h-5 mb-3" style={{ color: ACCENT }} />
              
              {/* Câu Quote: Bỏ flex-1 để nội dung co cụm tự nhiên */}
              <p className="text-xs font-medium leading-relaxed italic text-stone-800">
                "Tất cả được tràn đầy Thánh Thần."
              </p>
              
              {/* Tên sách: Giảm mt xuống còn mt-1.5 để bám sát ngay dưới câu quote */}
              <p className="text-[10px] text-right font-bold mt-1.5 tracking-wider text-stone-400">
                (Cv 2,4)
              </p>
            </div>
          </motion.div>
        </div>

        {/* MODAL */}
        <AnimatePresence>
          {selectedGift && (
            <>
              {/* 1. Backdrop (Nền tối + mờ nhẹ) */}
              <motion.div
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setSelectedGift(null)}
                className="fixed inset-0 bg-black/40 backdrop-blur-[3px] z-40"
              />

              {/* 2. Wrapper định vị (Đẩy hẳn xuống đáy màn hình trên Mobile, căn giữa trên Desktop) */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: "100%" }} // Mobile: Trồi từ đáy lên mượt hơn scale
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: "100%" }}
                transition={{ duration: 0.3, ease: [0.32, 0.94, 0.6, 1] }} // Sử dụng curve mượt của Apple iOS
                className="fixed inset-0 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 pointer-events-none"
              >
                {/* 3. Thẻ nội dung thực tế (Kéo vuốt mượt mà ở đây) */}
                <motion.div
                  drag="y"
                  // Khóa chặt top & bottom về 0 để tạo lực lò xo đàn hồi (Elastic) khi kéo
                  dragConstraints={{ top: 0, bottom: 0 }}
                  // Kéo lên cứng đờ (0), kéo xuống cho giãn (0.55) cực nịnh mắt trên mobile
                  dragElastic={{ top: 0, bottom: 0.55 }}
                  onDragEnd={(_, info) => { 
                    // TỐI ƯU MOBILE: Đóng nếu kéo xuống > 70px HOẶC người dùng vuốt nhanh (vận tốc trục Y > 350)
                    if (info.offset.y > 70 || info.velocity.y > 350) { 
                      setSelectedGift(null); 
                    } 
                  }}
                  // touch-none: ÉP trình duyệt nhường quyền điều khiển touch cho Framer Motion (Chống giật lag)
                  className={`relative w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl border shadow-2xl pointer-events-auto overflow-hidden max-h-[85vh] touch-none ${selectedGift.color}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Pull Tab - Thanh gạch chỉ dẫn vuốt trên Mobile */}
                  <div className="flex justify-center pt-3 pb-1 sm:hidden">
                    <div className="w-10 h-1 rounded-full bg-black/15" />
                  </div>

                  {/* Header */}
                  <div className="flex items-center gap-4 p-6 pb-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/60 flex items-center justify-center shadow-sm flex-shrink-0 text-2xl select-none">
                      {selectedGift.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-0.5">
                        Ơn Chúa Thánh Thần
                      </p>
                      <h3 className="font-black font-serif text-base leading-tight">
                        {selectedGift.name}
                      </h3>
                    </div>
                    <button type="button" onClick={() => setSelectedGift(null)}
                      className="flex-shrink-0 w-8 h-8 rounded-full bg-black/8 active:bg-black/20 flex items-center justify-center transition-colors">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M18 6 6 18M6 6l12 12"/>
                      </svg>
                    </button>
                  </div>

                  <div className="h-px bg-black/8 mx-6" />

                  {/* Body Content - Tận dụng bộ tăng tốc phần cứng (Hardware Acceleration) */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.2 }}
                    className="p-6 pt-4 space-y-4 overflow-y-auto max-h-[calc(85vh-90px)]"
                  >
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1.5">
                        Ý nghĩa
                      </p>
                      <p className="text-sm leading-relaxed font-medium opacity-85">
                        {selectedGift.desc}
                      </p>
                    </div>
                    <div className="h-px bg-black/8" />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1.5">
                        Ví dụ trong cuộc sống
                      </p>
                      <p className="text-sm leading-relaxed font-medium opacity-85 italic">
                        "{selectedGift.example}"
                      </p>
                    </div>
                  </motion.div>
                </motion.div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
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
                className={`rounded-2xl border p-4 md:p-6 border-l-4 ${mod.color} ${mod.borderAccent}`}>
                <div className="flex items-start gap-2 mb-5">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${mod.dot}`} />
                  <h3 className="text-sm font-bold text-stone-700">{mod.phase}</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/5 whitespace-nowrap flex-shrink-0 ml-auto">
                    {mod.weeks}
                  </span>
                </div>
                <ul className="space-y-3">
                  {mod.topics.map((topic, j) => (
                    <li key={j} className="flex items-start gap-2.5 text-sm text-stone-600">
                      <span className="text-[10px] font-bold text-stone-400 flex-shrink-0 mt-0.5 w-4 text-right">
                        {j + 1}.
                      </span>
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
              className="bg-white rounded-2xl border border-stone-100 p-5 shadow-sm md:hover:shadow-md transition-shadow">
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
            <Link to="/tuyển-sinh#dang-ky"
              className="inline-flex items-center justify-center gap-2 h-11 px-8 rounded-xl text-sm font-bold text-white shadow-md transition-all duration-300 md:hover:-translate-y-0.5 active:scale-95"
              style={{ background: ACCENT, boxShadow: `0 4px 16px ${ACCENT}40` }}>
              Đăng ký ngay<ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/liên-hệ"
              className="inline-flex items-center justify-center h-11 px-6 rounded-xl text-sm font-semibold border border-stone-200 bg-white text-stone-800 md:hover:bg-stone-50 shadow-sm transition-all duration-300 md:hover:-translate-y-0.5 active:scale-95">
              Liên hệ hỏi thêm
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}