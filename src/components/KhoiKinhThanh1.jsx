import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Scroll, Map, Users, Clock, CalendarDays, ArrowRight, ChevronLeft, Layers } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useLenis } from "lenis/react";
import { useMotionConfig } from "../hooks/useMotionConfig.js";

const ACCENT   = "#dc2626";
const ACCENT_L = "#fef2f2";

const OVERVIEW = [
  { icon: Users,        label: "Độ tuổi",    value: "Lớp 8 – 9" },
  { icon: Clock,        label: "Thời lượng", value: "45 phút / buổi" },
  { icon: CalendarDays, label: "Lịch học",   value: "Chủ Nhật sau Thánh Lễ" },
  { icon: BookOpen,     label: "Giáo trình", value: "Kinh Thánh" },
];

const TESTAMENT = [
  {
    name: "Cựu Ước", 
    color: "bg-amber-50 border-amber-200", 
    nameColor: "text-amber-800",
    books: [
      { 
        group: "Ngũ Thư",  
        items: [
          "Sáng Thế (St)", 
          "Xuất Hành (Xh)", 
          "Lêvi (Lv)", 
          "Dân Số (Ds)", 
          "Đệ Nhị Luật (Đnl)"
        ] 
      },
      { 
        group: "Lịch Sử",  
        items: [
          "Giôsuê (Gs)", 
          "Thủ Lãnh (Tl)", 
          "Rút (R)", 
          "1 Sa-mu-en (1 Sm)", 
          "2 Sa-mu-en (2 Sm)", 
          "1 Các Vua (1 V)", 
          "2 Các Vua (2 V)", 
          "1 Sử Biên Niên (1 Sb)", 
          "2 Sử Biên Niên (2 Sb)", 
          "Ét-ra (Er)", 
          "Nơ-khe-mi-a (Nkm)", 
          "Tô-bi-a (Tb)", 
          "Giu-đi-tha (Gđt)", 
          "Ét-te (Et)", 
          "1 Ma-ca-bê (1 Mcb)", 
          "2 Ma-ca-bê (2 Mcb)"
        ] 
      },
      { 
        group: "Huấn Ca",  
        items: [
          "Gióp (G)", 
          "Thánh Vịnh (Tv)", 
          "Châm Ngôn (Cn)", 
          "Giảng Viên (Gv)", 
          "Diễm Ca (Dc)", 
          "Khôn Ngoan (Kn)", 
          "Huấn Ca (Hc)"
        ] 
      },
      { 
        group: "Ngôn Sứ",  
        items: [
          "I-sai-a (Is)", 
          "Giê-rê-mi-a (Gr)", 
          "Ai Ca (Ac)", 
          "Ba-rúc (Ba)", 
          "Ê-dê-ki-en (Ed)", 
          "Đa-ni-en (Đn)", 
          "Hô-sê (Hs)", 
          "Giô-en (Ge)", 
          "A-mốt (Am)", 
          "Ô-va-đi-a (Ôv)", 
          "Giô-na (Gn)", 
          "Mi-kha (Mk)", 
          "Na-khum (Na)", 
          "Kha-ba-cúc (Kb)", 
          "Xô-phô-ni-a (Xp)", 
          "Khác-gai (Kg)", 
          "Da-ca-ri-a (Dcr)", 
          "Ma-la-khi (Ml)"
        ] 
      },
    ],
  },
  {
    name: "Tân Ước", 
    color: "bg-red-50 border-red-200", 
    nameColor: "text-red-800",
    books: [
      { 
        group: "Tin Mừng",            
        items: [
          "Mát-thêu (Mt)", 
          "Mác-cô (Mc)", 
          "Lu-ca (Lc)", 
          "Gio-an (Ga)"
        ] 
      },
      { 
        group: "Tông Đồ Công Vụ",     
        items: [
          "Tông Đồ Công Vụ (Cv)"
        ] 
      },
      { 
        group: "Thư Gửi Tín Hữu Phao-lô",    
        items: [
          "Rô-ma (Rm)", 
          "1 Cô-rin-tô (1 Cr)", 
          "2 Cô-rin-tô (2 Cr)", 
          "Ga-lát (Gl)", 
          "Ê-phê-sô (Ep)", 
          "Phi-líp-phê (Pl)", 
          "Cô-lô-sê (Cl)", 
          "1 Thê-xa-lô-ni-ca (1 Tx)", 
          "2 Thê-xa-lô-ni-ca (2 Tx)", 
          "1 Ti-mô-thê (1 Tm)", 
          "2 Ti-mô-thê (2 Tm)", 
          "Ti-tô (Tt)", 
          "Phi-lê-môn (Plm)", 
          "Híp-ri (Dt)"
        ] 
      },
      { 
        group: "Thư Chung & Khải Huyền",    
        items: [
          "Gia-cô-bê (Gc)", 
          "1 Phê-rô (1 P)", 
          "2 Phê-rô (2 P)", 
          "1 Gio-an (1 Ga)", 
          "2 Gio-an (2 Ga)", 
          "3 Gio-an (3 Ga)", 
          "Giu-đa (Gđ)", 
          "Khải Huyền (Kh)"
        ] 
      },
    ],
  },
];

function TestamentCard({ t, mc, vp, index }) {
  const [expanded, setExpanded] = useState(false);
  const PREVIEW_LINES = 15;

  // Đếm tổng số items để biết có cần xem thêm không
  const totalItems = t.books.reduce((acc, g) => acc + g.items.length, 0);
  const needsExpand = totalItems > PREVIEW_LINES;

  return (
    <motion.div
      initial={{ opacity: 0, y: mc.yOffset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={vp}
      transition={{ duration: mc.duration(0.6), delay: mc.delay(index * 0.1) }}
      className={`rounded-2xl border p-6 ${t.color}`}
    >
      <h3 className={`text-base font-black font-serif mb-5 ${t.nameColor}`}>{t.name}</h3>

      {/* Nội dung — clip khi chưa expand */}
      <div className="relative">
        <motion.div
          animate={{ height: expanded ? "auto" : `${PREVIEW_LINES * 1.6}rem` }}
          transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
          className="overflow-hidden"
        >
          <div className="space-y-4">
            {t.books.map((group, j) => (
              <div key={j}>
                <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-2">
                  {group.group}
                </p>
                <ul className="space-y-1.5">
                  {group.items.map((item, k) => (
                    <li key={k} className="flex items-start gap-2 text-sm text-stone-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-stone-400 flex-shrink-0 mt-2" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Gradient fade khi chưa expand */}
        {needsExpand && !expanded && (
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[inherit] to-transparent pointer-events-none rounded-b-xl" />
        )}
      </div>

      {/* Nút xem thêm / thu gọn */}
      {needsExpand && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-4 flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-stone-800 transition-colors"
        >
          <motion.span
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.25 }}
            className="inline-block"
          >
            ▾
          </motion.span>
          {expanded ? "Thu gọn" : "Xem thêm"}
        </button>
      )}
    </motion.div>
  );
}

const METHODS = [
  { icon: Map,     title: "Bản đồ Kinh Thánh",     desc: "Học qua bản đồ địa lý Thánh Kinh — các em nhìn thấy hành trình của dân Chúa bằng mắt." },
  { icon: Scroll,  title: "Kể chuyện sáng tạo",    desc: "Đóng vai, vẽ tranh hoặc viết tiếp câu chuyện Kinh Thánh từ góc nhìn của một nhân vật." },
  { icon: Layers,  title: "Kinh Thánh & cuộc sống", desc: "Mỗi câu chuyện gắn với 1 tình huống thực tế — giúp các em áp dụng Lời Chúa vào đời thường." },
  { icon: BookOpen, title: "Memorize verse",        desc: "Học thuộc lòng một câu Kinh Thánh mỗi buổi — tạo kho tàng Lời Chúa trong trí nhớ suốt đời." },
];

export default function KhoiKinhThanh() {
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
    <div className="min-h-screen bg-[#faf8f5] text-stone-900 antialiased overflow-x-hidden selection:bg-red-200 selection:text-red-900">

      <section ref={heroRef} className="relative overflow-hidden pt-16 pb-20 md:pt-28 md:pb-32"
        style={{ background: `linear-gradient(160deg, ${ACCENT_L} 0%, #faf8f5 60%)` }}>
        {!mc.isMobile && (
          <>
            <div className="absolute top-0 left-0 w-[600px] h-[500px] bg-red-200/20 blur-[120px] rounded-full -z-10 -translate-x-1/4" />
            <div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-rose-100/20 blur-[100px] rounded-full -z-10" />
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
                  <BookOpen className="w-3.5 h-3.5" />Khối Kinh Thánh
                </span>
              </motion.div>
              <motion.h1 variants={fadeUp} custom={0.05} className="text-4xl md:text-6xl font-serif font-black tracking-tight text-stone-900 leading-[1.1] mb-5">
                Lời Chúa —<br />
                <span className="bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(135deg, ${ACCENT}, #7f1d1d)` }}>
                  nền tảng đức tin
                </span>
              </motion.h1>
              <motion.p variants={fadeUp} custom={0.1} className="text-base md:text-lg text-stone-500 leading-relaxed max-w-lg mb-8">
                Kinh Thánh không chỉ là một cuốn sách cổ — đó là thư tình Thiên Chúa gửi cho
                con người qua mọi thời đại. Khối Kinh Thánh dẫn các em vào hành trình khám phá
                73 quyển sách thiêng liêng đầy sống động.
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
                <Link to="/tuyển-sinh"
                  className="inline-flex items-center justify-center h-11 px-5 rounded-xl text-sm font-semibold border border-stone-200 bg-white text-stone-800 hover:bg-stone-50 shadow-sm transition-all duration-300 hover:-translate-y-0.5 active:scale-95">
                  Đăng ký
                </Link>
              </motion.div>
            </div>

            <motion.div variants={fadeUp} custom={0.2} className="flex-shrink-0 w-full md:w-[280px]">
              <div className="relative rounded-3xl overflow-hidden aspect-square w-full max-w-[260px] md:max-w-full mx-auto shadow-xl"
                style={{ background: `linear-gradient(135deg, ${ACCENT_L}, #fee2e2)` }}>
                <img src="/images/khoikinhthanh.avif" alt="Khối Kinh Thánh"
                  className="w-full h-full object-contain p-8 mix-blend-multiply"
                  loading={mc.isMobile ? "lazy" : "eager"} />
                <div className="absolute bottom-3 left-3 right-3 bg-white/80 backdrop-blur-sm rounded-2xl px-4 py-2.5 flex items-center gap-2.5 shadow-sm">
                  <BookOpen className="w-4 h-4 flex-shrink-0" style={{ color: ACCENT }} />
                  <div>
                    <p className="text-[11px] font-bold text-stone-900">Lớp 8 – Lớp 9</p>
                    <p className="text-[10px] text-stone-500">14 – 15 tuổi</p>
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
          <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: ACCENT }}>Chương trình</p>
          <h2 className="text-3xl md:text-4xl font-serif font-black text-stone-900">Hành trình qua 73 quyển sách</h2>
          <p className="mt-3 text-stone-500 max-w-lg text-sm leading-relaxed">Từ "Khởi đầu Thiên Chúa sáng tạo" đến "Amen" cuối sách Khải Huyền — một hành trình cứu độ trải dài hàng ngàn năm lịch sử.</p>
        </motion.div>
        <div className="grid md:grid-cols-2 gap-6 items-start">
          {TESTAMENT.map((t, i) => (
            <TestamentCard key={i} t={t} mc={mc} vp={vp} index={i} />
          ))}
        </div>
      </section>

      <section className="py-20 md:py-28" style={{ background: `linear-gradient(160deg, ${ACCENT_L} 0%, #faf8f5 100%)` }}>
        <div className="max-w-5xl mx-auto px-5 sm:px-6">
          <motion.div initial={{ opacity: 0, y: mc.yOffset }} whileInView={{ opacity: 1, y: 0 }} viewport={vp}
            transition={{ duration: mc.duration(0.7) }} className="mb-12">
            <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: ACCENT }}>Phương pháp</p>
            <h2 className="text-3xl md:text-4xl font-serif font-black text-stone-900">Kinh Thánh sống động,<br />không phải khô khan</h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-5">
            {METHODS.map((item, i) => { const Icon = item.icon; return (
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
        </div>
      </section>

      <section className="py-20 max-w-2xl mx-auto px-5 sm:px-6 text-center">
        <motion.div initial={{ opacity: 0, y: mc.yOffset }} whileInView={{ opacity: 1, y: 0 }} viewport={vp} transition={{ duration: mc.duration(0.7) }}>
          <motion.div animate={mc.reduced ? {} : { scale: [1, 1.12, 1], transition: { repeat: Infinity, duration: 2.4, ease: "easeInOut" } }}>
            <BookOpen className="w-10 h-10 mx-auto mb-4" style={{ color: ACCENT }} />
          </motion.div>
          <h2 className="text-2xl md:text-3xl font-serif font-black text-stone-900 mb-3">Mở trang Kinh Thánh cùng con</h2>
          <p className="text-stone-500 text-sm leading-relaxed mb-8 max-w-md mx-auto">Đăng ký để con em bước vào hành trình khám phá Lời Chúa — nền tảng vững chắc nhất cho một cuộc đời đức tin.</p>
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