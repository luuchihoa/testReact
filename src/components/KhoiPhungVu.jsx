import React, { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Sparkles, Music, BookOpen, Calendar, Clock, CalendarDays, Users, ArrowRight, ChevronLeft, Sun } from "lucide-react";
import { motion, useScroll, useTransform, AnimatePresence, useMotionValue } from "framer-motion";
import { useLenis } from "lenis/react";
import { useMotionConfig } from "../hooks/useMotionConfig.js";

const ACCENT   = "#ea580c";
const ACCENT_L = "#fff7ed";

const OVERVIEW = [
  { icon: Users,        label: "Độ tuổi",    value: "Lớp 7" },
  { icon: Clock,        label: "Thời lượng", value: "45 phút / buổi" },
  { icon: CalendarDays, label: "Lịch học",   value: "Chúa Nhật" },
  { icon: BookOpen,     label: "Yêu cầu",    value: "Sau Thêm Sức" },
];

const LITURGICAL_YEAR = [
  {
    id: "vong",
    season: "Mùa Vọng",
    color: "bg-violet-100 text-violet-900 border-violet-200",
    symbol: "🕯️",
    desc: "Chờ đợi và chuẩn bị đón Chúa đến.",
    details: {
      meaning: "Thời gian chuẩn bị tâm hồn trong 4 tuần để mừng kính đại lễ Giáng Sinh và hướng lòng mong đợi ngày Chúa lại đến trong vinh quang.",
      highlight: "Thắp sáng vòng hoa Mùa Vọng qua từng tuần: Hy vọng, Hòa bình, Niềm vui, và Tình yêu.",
      emoji: "💜 ✨ ⏳",
      duration: "4 tuần",
      color_meaning: "Tím — ăn năn & chờ đợi",
    },
  },
  {
    id: "giang-sinh",
    season: "Mùa Giáng Sinh",
    color: "bg-white text-stone-800 border-stone-200",
    symbol: "⭐",
    desc: "Cử hành Ngôi Hai Thiên Chúa xuống thế làm người.",
    details: {
      meaning: "Niềm vui Con Thiên Chúa làm người ở cùng chúng ta. Mùa này kéo dài từ đêm Giáng Sinh đến hết lễ Chúa Giêsu Chịu Phép Rửa.",
      highlight: "Hang đá, máng cỏ, ngôi sao Bethlehem và những bài thánh ca hân hoan.",
      emoji: "👶 🎄 🎶",
      duration: "~3 tuần",
      color_meaning: "Trắng/Vàng — vui mừng & vinh quang",
    },
  },
  {
    id: "thuong-nien-1",
    season: "Mùa Thường Niên I",
    color: "bg-green-100 text-green-900 border-green-200",
    symbol: "🌿",
    desc: "Theo dõi cuộc đời và sứ vụ công khai của Chúa Giêsu.",
    details: {
      meaning: "Giai đoạn ngắn giữa mùa Giáng Sinh và mùa Chay. Tập trung vào cuộc đời rao giảng công khai và các phép lạ của Chúa Giêsu.",
      highlight: "Màu xanh lá biểu lực cho sự sống, niềm hy vọng và sự tăng trưởng đức tin mỗi ngày.",
      emoji: "🌱 📖 ⛪",
      duration: "4–9 tuần",
      color_meaning: "Xanh lá — sự sống & tăng trưởng",
    },
  },
  {
    id: "chay",
    season: "Mùa Chay",
    color: "bg-purple-100 text-purple-900 border-purple-200",
    symbol: "✝️",
    desc: "40 ngày sám hối, chay tịnh và cầu nguyện cùng Giáo Hội.",
    details: {
      meaning: "40 ngày thanh luyện noi gương Chúa Giêsu trong hoang địa, chuẩn bị bước vào mầu nhiệm Vượt Qua.",
      highlight: "Ba cột trụ tâm linh: Cầu nguyện sâu lắng, Ăn chay hãm mình, và Làm việc bác ái chia sẻ.",
      emoji: "🛐 🪵 ⚖️",
      duration: "40 ngày",
      color_meaning: "Tím — sám hối & thanh luyện",
    },
  },
  {
    id: "tam-nhat",
    season: "Tam Nhật Vượt Qua",
    color: "bg-red-100 text-red-900 border-red-200",
    symbol: "🔥",
    desc: "Ba ngày thánh thiêng nhất — trái tim của toàn bộ Năm Phụng vụ.",
    details: {
      meaning: "Ba ngày thánh thiêng nhất: Thứ Năm Tuần Thánh (Tiệc Ly/Rửa Chân), Thứ Sáu Tuần Thánh (Chúa Chết), Đêm Canh Thức Phục Sinh.",
      highlight: "Mầu nhiệm Thập giá - đỉnh cao của Tình yêu trao hiến trọn vẹn vì ơn cứu độ nhân loại.",
      emoji: "🍞 🍷 🥖",
      duration: "3 ngày",
      color_meaning: "Đỏ (T6) / Trắng (T5 & CN) — tình yêu trao hiến",
    },
  },
  {
    id: "phuc-sinh",
    season: "Mùa Phục Sinh",
    color: "bg-white text-stone-800 border-stone-200",
    symbol: "🌅",
    desc: "50 ngày vui mừng — Chúa đã Phục Sinh, Alleluia!",
    details: {
      meaning: "Mùa vui mừng kéo dài 50 ngày đến lễ Chúa Thánh Thần Hiện Xuống. Cử hành chiến thắng vinh quang của Chúa trên sự chết.",
      highlight: "Nến Phục Sinh rực sáng, tiếng ca Alleluia vang vọng khắp trần gian.",
      emoji: "🎉 🕊️ 💥",
      duration: "50 ngày",
      color_meaning: "Trắng/Vàng — chiến thắng & vui mừng",
    },
  },
  {
    id: "thuong-nien-2",
    season: "Mùa Thường Niên II",
    color: "bg-green-100 text-green-900 border-green-200",
    symbol: "🌿",
    desc: "Hành trình dài nhất — đào sâu Tin Mừng trong đời thường.",
    details: {
      meaning: "Giai đoạn dài nhất sau lễ Hiện Xuống, đồng hành cùng Giáo Hội dấn thân đem Lời Chúa áp dụng vào cuộc sống đời thường.",
      highlight: "Hành trình kiên trì học hỏi, sinh hoa trái đức tin thông qua bổn phận nhỏ bé mỗi ngày.",
      emoji: "🌳 🤝 👑",
      duration: "~34 tuần",
      color_meaning: "Xanh lá — tăng trưởng & trung thành",
    },
  },
];

const SACRAMENTS = [
  {
    id: "rua-toi",
    name: "Rửa Tội",
    icon: "💧",
    color: "bg-white text-stone-800 border-stone-200",
    short: "Cửa vào đời sống Kitô hữu.",
    details: {
      type: "Bí tích Khai Tâm",
      minister: "Giám mục, Linh mục, Phó tế (hoặc bất kỳ ai khi khẩn cấp)",
      meaning: "Là nền tảng của đời sống Kitô hữu. Qua nước và Thánh Thần, người lãnh nhận được sạch tội nguyên tổ, tái sinh làm con Thiên Chúa và gia nhập Giáo Hội.",
      highlight: "Đổ nước 3 lần với lời truyền pháp nhân danh Cha, Con và Thánh Thần. Đi kèm biểu tượng áo trắng, nến sáng và dầu thánh.",
      emoji: "💧 🕊️ ✨"
    }
  },
  {
    id: "them-suc",
    name: "Thêm Sức",
    icon: "🔥",
    color: "bg-white text-stone-800 border-stone-200",
    short: "Củng cố ân sủng Rửa Tội, lãnh nhận Chúa Thánh Thần.",
    details: {
      type: "Bí tích Khai Tâm",
      minister: "Giám mục (thông thường); Linh mục (khi được ủy quyền)",
      meaning: "Hoàn tất ơn Rửa Tội, đổ đầy Chúa Thánh Thần và 7 ơn của Ngài để giúp người Kitô hữu trưởng thành và can đảm làm chứng cho Đức Kitô.",
      highlight: "Nghi thức xức dầu Thánh (Chrisma) lên trán và đặt tay. Nhắc nhở về 7 ơn Chúa Thánh Thần trong cuộc sống.",
      emoji: "🔥 ✋ 👑"
    }
  },
  {
    id: "thanh-the",
    name: "Thánh Thể",
    icon: "🍞",
    color: "bg-white text-stone-800 border-stone-200",
    short: "Nguồn mạch và tột đỉnh của đời sống Kitô hữu.",
    details: {
      type: "Bí tích Khai Tâm",
      minister: "Chỉ Linh mục (cử hành); Thừa tác viên ngoại thường (trao Mình Thánh)",
      meaning: "Trung tâm và đỉnh cao của Giáo Hội. Trong Thánh Lễ, bánh và rượu thực sự trở thành Mình và Máu Thánh Chúa Giêsu chứ không chỉ là biểu tượng.",
      highlight: "Khoảnh khắc Lời Truyền Phép của Linh mục. Bánh Thánh nuôi dưỡng linh hồn hằng ngày và được tôn thờ nơi Nhà Tạm.",
      emoji: "🍞 🍷 🙏"
    }
  },
  {
    id: "hoa-giai",
    name: "Hoà Giải",
    icon: "🕊️",
    color: "bg-white text-stone-800 border-stone-200",
    short: "Giao hoà với Chúa và Giáo Hội qua bí tích tha tội.",
    details: {
      type: "Bí tích Chữa Lành",
      minister: "Giám mục và Linh mục (được quyền giải tội)",
      meaning: "Ban ơn tha thứ của Thiên Chúa cho các tội lỗi phạm sau khi Rửa Tội, giúp chữa lành vết thương tâm hồn và ban sức mạnh hoán cải.",
      highlight: "Gồm 4 bước: Xét mình, Ăn năn tội, Xưng tội với Linh mục và làm việc Đền tội để giao hòa.",
      emoji: "🕊️ 🤍 🔓"
    }
  },
  {
    id: "xuc-dau",
    name: "Xức Dầu Bệnh Nhân",
    icon: "⚕️",
    color: "bg-white text-stone-800 border-stone-200",
    short: "Chữa lành và an ủi trong bệnh tật, tuổi già hay nguy tử.",
    details: {
      type: "Bí tích Chữa Lành",
      minister: "Giám mục và Linh mục",
      meaning: "Dành cho người đau nặng, người già hoặc sắp phẫu thuật. Ban sự bình an, can đảm hiệp thông với cuộc thương khó của Chúa và chữa lành hồn xác.",
      highlight: "Linh mục đặt tay thinh lặng và xức dầu thánh lên trán, tay bệnh nhân cùng lời nguyện cầu giảm bớt đau đớn.",
      emoji: "⚕️ 🤲 🕯️"
    }
  },
  {
    id: "truyen-chuc",
    name: "Truyền Chức Thánh",
    icon: "✋",
    color: "bg-white text-stone-800 border-stone-200",
    short: "Thánh hiến người phục vụ Dân Chúa qua 3 cấp bậc.",
    details: {
      type: "Bí tích Phục Vụ Cộng Đoàn",
      minister: "Chỉ Giám mục",
      meaning: "Tiếp tục sứ mạng tông đồ trong Giáo Hội qua 3 cấp bậc: Giám mục, Linh mục và Phó tế. Người nhận được ghi ấn tín thiêng liêng vĩnh viễn.",
      highlight: "Nghi thức chính yếu: Giám mục đặt tay lên đầu ứng viên trong thinh lặng và đọc lời nguyện thánh hiến.",
      emoji: "✋ ⛪ 📿"
    }
  },
  {
    id: "hon-phoi",
    name: "Hôn Phối",
    icon: "💍",
    color: "bg-white text-stone-800 border-stone-200",
    short: "Giao ước tình yêu vĩnh cửu phản chiếu tình yêu Thiên Chúa.",
    details: {
      type: "Bí tích Phục Vụ Cộng Đoàn",
      minister: "Chính đôi bạn trao nhau (Linh mục/Phó tế là nhân chứng)",
      meaning: "Giao ước tình yêu thánh thiêng giữa một người nam và một người nữ, mang đặc tính: tự do, trọn vẹn, trung thành suốt đời và đón nhận con cái.",
      highlight: "Chính nam nữ là thừa tác viên trao bí tích cho nhau qua lời thề hứa hôn ước bất khả phân ly trước mặt Chúa.",
      emoji: "💍 💑 🤍"
    }
  }
];

const HIGHLIGHTS = [
  { icon: Music,    title: "Thánh ca Phụng vụ",       desc: "Học hiểu ý nghĩa và lịch sử của các bài Thánh ca thường gặp trong Thánh Lễ." },
  { icon: Calendar, title: "Lịch Phụng vụ sống động", desc: "Theo dõi năm Phụng vụ qua các hoạt động thực tế gắn với các mùa trong năm." },
  { icon: Sun,      title: "Tham dự Thánh Lễ ý thức", desc: "Học để hiểu và tham dự tích cực từng phần của Thánh Lễ thay vì ngồi thụ động." },
  { icon: BookOpen, title: "Kinh nguyện Giờ Kinh",    desc: "Giới thiệu Phụng vụ Giờ Kinh — cách Giáo Hội cầu nguyện liên tục suốt ngày." },
];

export default function KhoiPhungVu() {
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [selectedSacrament, setSelectedSacrament] = useState(null);
  const heroRef = useRef(null);
  const { scrollY } = useScroll();
  const mc = useMotionConfig();
  const heroY = useTransform(scrollY, [0, 500], mc.heroParallax);
  const lenis = useLenis();

  const seasonY = useMotionValue(0);
  const sacramentY = useMotionValue(0);

  const handleSeasonDragEnd = (event, info) => {
    if (info.offset.y > 70 || info.velocity.y > 350) {
      setSelectedSeason(null);
    } else {
      seasonY.set(0); // reset về vị trí gốc nếu không đủ điều kiện đóng
    }
  };

  const handleSacramentDragEnd = (event, info) => {
    if (info.offset.y > 70 || info.velocity.y > 350) {
      setSelectedSacrament(null);
    } else {
      sacramentY.set(0);
    }
  };

  const handleDragEnd = (event, info) => {
    // Đóng nếu vuốt xuống hơn 70px HOẶC vận tốc vuốt xuống đủ nhanh (> 350)
    if (info.offset.y > 70 || info.velocity.y > 350) {
      setSelectedSeason(null);
      setSelectedSacrament(null);
    }
  };

  useEffect(() => {
    if (selectedSeason) seasonY.set(0);
  }, [selectedSeason]);

  useEffect(() => {
    if (selectedSacrament) sacramentY.set(0);
  }, [selectedSacrament]);

  const fadeUp = {
    hidden: { opacity: 0, y: mc.yOffset },
    visible: (d = 0) => ({ opacity: 1, y: 0, transition: { duration: mc.duration(0.8), ease: [0.16, 1, 0.3, 1], delay: mc.delay(d) } }),
  };
  const staggerContainer = { hidden: {}, visible: { transition: { staggerChildren: mc.stagger } } };
  const vp = mc.vp();

  return (
    <div className="min-h-screen bg-[#faf8f5] text-stone-900 antialiased overflow-x-hidden selection:bg-orange-200 selection:text-orange-900">

      <section ref={heroRef} className="relative overflow-hidden pt-16 pb-20 md:pt-28 md:pb-32"
        style={{ background: `linear-gradient(160deg, ${ACCENT_L} 0%, #faf8f5 60%)` }}>
        {!mc.isMobile && (
          <>
            <div className="absolute top-0 left-0 w-[600px] h-[500px] bg-orange-200/20 blur-[120px] rounded-full -z-10 -translate-x-1/4" />
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
                  <Sparkles className="w-3.5 h-3.5" />Khối Phụng Vụ
                </span>
              </motion.div>
              <motion.h1 variants={fadeUp} custom={0.05} className="text-4xl md:text-6xl font-serif font-black tracking-tight text-stone-900 leading-[1.1] mb-5">
                Cử hành đức tin<br />
                <span className="bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(135deg, ${ACCENT}, #7c2d12)` }}>
                  trong Phụng vụ
                </span>
              </motion.h1>
              <motion.p variants={fadeUp} custom={0.1} className="text-base md:text-lg text-stone-500 leading-relaxed max-w-lg mb-8">
                Phụng vụ là "đỉnh cao mà mọi hoạt động Giáo Hội hướng tới, đồng thời là nguồn
                mạch tuôn trào mọi sức mạnh" (SC 10). Khối Phụng Vụ giúp các em hiểu và yêu
                mến các cử hành thánh thiêng của Giáo Hội.
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
                <Link to="/tuyển-sinh#dang-ky"
                  className="inline-flex items-center justify-center h-11 px-5 rounded-xl text-sm font-semibold border border-stone-200 bg-white text-stone-800 hover:bg-stone-50 shadow-sm transition-all duration-300 hover:-translate-y-0.5 active:scale-95">
                  Đăng ký
                </Link>
              </motion.div>
            </div>

            <motion.div variants={fadeUp} custom={0.2} className="flex-shrink-0 w-full md:w-[280px]">
              <div className="relative rounded-3xl overflow-hidden aspect-square w-full max-w-[260px] md:max-w-full mx-auto shadow-xl"
                style={{ background: `linear-gradient(135deg, ${ACCENT_L}, #fed7aa)` }}>
                <img src="/images/khoiphungvu.avif" alt="Khối Phụng Vụ"
                  className="w-full h-full object-contain p-8 mix-blend-multiply"
                  loading={mc.isMobile ? "lazy" : "eager"} />
                <div className="absolute bottom-3 left-3 right-3 bg-white/80 backdrop-blur-sm rounded-2xl px-4 py-2.5 flex items-center gap-2.5 shadow-sm">
                  <Sparkles className="w-4 h-4 flex-shrink-0" style={{ color: ACCENT }} />
                  <div>
                    <p className="text-[11px] font-bold text-stone-900">Lớp 7</p>
                    <p className="text-[10px] text-stone-500">12 tuổi</p>
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
          <h2 className="text-3xl md:text-4xl font-serif font-black text-stone-900">
            Năm Phụng vụ —<br />vòng tròn thiêng liêng
          </h2>
          <p className="mt-3 text-stone-500 max-w-lg text-sm leading-relaxed">
            Giáo Hội sống theo một nhịp thời gian riêng — mỗi mùa phụng vụ mang màu sắc,
            ý nghĩa và lời cầu nguyện đặc trưng.
          </p>
        </motion.div>
      
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {LITURGICAL_YEAR.map((season, i) => (
            <motion.button
              key={season.id}
              type="button"
              onClick={() => setSelectedSeason(season)}
              initial={{ opacity: 0, y: mc.yOffset }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={vp}
              transition={{ duration: mc.duration(0.45), delay: mc.delay(i * 0.07) }}
              whileHover={mc.isMobile ? undefined : { y: -3, transition: { duration: 0.2 } }}
              whileTap={{ scale: 0.98 }}
              className={`group text-left rounded-2xl border p-5 transition-shadow hover:shadow-md active:shadow-sm w-full ${season.color}`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <span className="text-2xl">{season.symbol}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-40 mt-1">
                  Tap để xem
                </span>
              </div>
              <h3 className="text-sm font-bold mb-1">{season.season}</h3>
              <p className="text-xs opacity-65 leading-relaxed">{season.desc}</p>
            </motion.button>
          ))}
        </div>
      
        {/* ── MODAL ── */}
        <AnimatePresence>
          {selectedSeason && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setSelectedSeason(null)}
                className="fixed inset-0 bg-black/40 backdrop-blur-[3px] z-40"
              />

              {/* Wrapper container: Xử lý vị trí responsive */}
              <div className="fixed inset-0 z-50 flex flex-col justify-end md:items-center md:justify-center p-0 md:p-4 pointer-events-none">
                
                {/* Modal / Bottom Sheet Card */}
                <motion.div
                  // Cấu hình kéo thả (Chỉ kích hoạt trên mobile/tablet, tắt trên desktop nếu muốn cố định)
                  drag="y"
                  dragConstraints={{ top: 0, bottom: 0 }}
                  dragElastic={{ top: 0, bottom: 0.5 }}
                  onDragEnd={handleDragEnd}
                  style={{ y: seasonY }}
                  
                  // Animation trạng thái xuất hiện
                  initial={{ 
                    opacity: 0, 
                    y: window.innerWidth < 768 ? '100%' : 16,
                    scale: window.innerWidth < 768 ? 1 : 0.95 
                  }}
                  animate={{ 
                    opacity: 1, 
                    y: 0,
                    scale: 1 
                  }}
                  exit={{ 
                    opacity: 0, 
                    y: window.innerWidth < 768 ? '100%' : 8,
                    scale: window.innerWidth < 768 ? 1 : 0.95 
                  }}
                  transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
                  
                  // CSS Styles: Bo góc đáy trên Mobile, bo tròn toàn bộ trên Desktop
                  className={`relative w-full md:max-w-sm rounded-t-[2rem] md:rounded-3xl border border-black/5 shadow-2xl pointer-events-auto max-h-[85vh] flex flex-col overflow-hidden ${selectedSeason.color}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  
                  {/* 1. Pull Tab (Thanh gạch nhỏ để kéo trên Mobile) */}
                  <div className="flex justify-center pt-3 pb-1 md:hidden touch-none cursor-grab active:cursor-grabbing">
                    <div className="w-12 h-1.5 bg-black/15 rounded-full" />
                  </div>

                  {/* Header: touch-none giúp việc kéo vùng này chính xác hơn, tránh xung đột cuộn */}
                  <div className="flex items-start gap-4 p-6 pb-3 touch-none">
                    <div className="w-12 h-12 rounded-2xl bg-white/60 backdrop-blur-sm flex items-center justify-center shadow-sm flex-shrink-0 text-2xl select-none">
                      {selectedSeason.symbol}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-black font-serif text-lg leading-tight text-black/90">{selectedSeason.season}</h3>
                      <p className="text-xs opacity-65 mt-1 leading-snug">{selectedSeason.desc}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedSeason(null)}
                      className="flex-shrink-0 w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 active:bg-black/15 flex items-center justify-center transition-colors self-start"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M18 6 6 18M6 6l12 12"/>
                      </svg>
                    </button>
                  </div>

                  {/* Tags */}
                  <div className="flex gap-2 px-6 py-2 flex-wrap touch-none">
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-black/5">
                      ⏱ {selectedSeason.details.duration}
                    </span>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-black/5">
                      🎨 {selectedSeason.details.color_meaning}
                    </span>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-black/10 mx-6 flex-shrink-0" />

                  {/* 2. Body: Cho phép cuộn tự do khi nội dung dài, cô lập hoàn toàn với Lenis bên ngoài */}
                  <div className="p-6 pt-4 space-y-5 overflow-y-auto overscroll-contain flex-1 custom-scrollbar">
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1, duration: 0.2 }}
                      className="space-y-4"
                    >
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1.5">
                          Ý nghĩa Phụng vụ
                        </p>
                        <p className="text-sm leading-relaxed font-medium opacity-85">
                          {selectedSeason.details.meaning}
                        </p>
                      </div>
                      
                      <div className="h-px bg-black/8" />
                      
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1.5">
                          Đặc trưng & Hoạt động
                        </p>
                        <p className="text-sm leading-relaxed font-medium opacity-85">
                          {selectedSeason.details.highlight}
                        </p>
                      </div>
                      
                      <div className="text-center text-xl pt-1 tracking-widest select-none opacity-80">
                        {selectedSeason.details.emoji}
                      </div>
                    </motion.div>
                  </div>

                </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>
      </section>
      
      <section className="py-20 md:py-28 bg-stone-50/60">
        <div className="max-w-5xl mx-auto px-5 sm:px-6">
          <motion.div initial={{ opacity: 0, y: mc.yOffset }} whileInView={{ opacity: 1, y: 0 }}
            viewport={vp} transition={{ duration: mc.duration(0.7) }} className="mb-12">
            <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: ACCENT }}>Bí tích học</p>
            <h2 className="text-3xl md:text-4xl font-serif font-black text-stone-900">
              Bảy Bí tích —<br />bảy cánh cửa ân sủng
            </h2>
            <p className="mt-3 text-stone-500 max-w-lg text-sm leading-relaxed">
              Mỗi Bí tích là một cuộc gặp gỡ thực sự với Chúa Kitô — không phải nghi lễ hình thức
              mà là hành động thiêng liêng của chính Thiên Chúa qua dấu chỉ hữu hình.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {SACRAMENTS.map((s, i) => (
              <motion.button
                key={s.id}
                type="button"
                onClick={() => setSelectedSacrament(s)}
                initial={{ opacity: 0, y: mc.yOffset }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={vp}
                transition={{ duration: mc.duration(0.45), delay: mc.delay(i * 0.07) }}
                whileHover={mc.isMobile ? undefined : { y: -3, transition: { duration: 0.2 } }}
                whileTap={{ scale: 0.98 }}
                className={`group text-left rounded-2xl border p-5 transition-shadow hover:shadow-md active:shadow-sm w-full ${s.color}`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <span className="text-2xl">{s.icon}</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-40 mt-1">
                    Tìm hiểu
                  </span>
                </div>
                <h3 className="text-sm font-bold mb-1">{s.name}</h3>
                <p className="text-xs opacity-65 leading-relaxed">{s.short}</p>
                <div className="mt-3 pt-3 border-t border-black/8">
                  <span className="text-[10px] font-bold opacity-40">{s.details.type}</span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* MODAL */}
        <AnimatePresence>
          {selectedSacrament && (
            <>
              {/* Backdrop nền tối phía sau */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setSelectedSacrament(null)}
                className="fixed inset-0 bg-black/40 backdrop-blur-[3px] z-40"
              />

              {/* Định vị responsive: Mobile dính đáy, Desktop ra giữa */}
              <div className="fixed inset-0 z-50 flex flex-col justify-end md:items-center md:justify-center p-0 md:p-4 pointer-events-none">
                
                {/* Thẻ nội dung chính */}
                <motion.div
                  // Kích hoạt tính năng vuốt trượt
                  drag="y"
                  dragConstraints={{ top: 0, bottom: 0 }}
                  dragElastic={{ top: 0, bottom: 0.5 }}
                  onDragEnd={handleDragEnd}
                  style={{ y: sacramentY }}
                  
                  // Thiết lập animation mượt mà dựa trên kích thước màn hình
                  initial={{ 
                    opacity: 0, 
                    y: window.innerWidth < 768 ? '100%' : 16,
                    scale: window.innerWidth < 768 ? 1 : 0.95 
                  }}
                  animate={{ 
                    opacity: 1, 
                    y: 0,
                    scale: 1 
                  }}
                  exit={{ 
                    opacity: 0, 
                    y: window.innerWidth < 768 ? '100%' : 8,
                    scale: window.innerWidth < 768 ? 1 : 0.95 
                  }}
                  transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
                  
                  // Bo góc dưới dạng Bottom Sheet trên Mobile và dạng Hộp thoại trên Desktop
                  className={`relative w-full md:max-w-sm rounded-t-[2rem] md:rounded-3xl border border-black/5 shadow-2xl pointer-events-auto max-h-[85vh] flex flex-col overflow-hidden ${selectedSacrament.color}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  
                  {/* Thanh gạt (Pull Tab) đóng vai trò tay cầm chỉ hiện trên Mobile */}
                  <div className="flex justify-center pt-3 pb-1 md:hidden touch-none cursor-grab active:cursor-grabbing">
                    <div className="w-12 h-1.5 bg-black/15 rounded-full" />
                  </div>

                  {/* Header khu vực chạm không cuộn trang (touch-none) */}
                  <div className="flex items-start gap-4 p-6 pb-3 touch-none">
                    <div className="w-12 h-12 rounded-2xl bg-white/60 backdrop-blur-sm flex items-center justify-center shadow-sm flex-shrink-0 text-2xl select-none">
                      {selectedSacrament.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-black font-serif text-lg leading-tight text-black/90">{selectedSacrament.name}</h3>
                      <p className="text-xs opacity-65 mt-1 leading-snug">{selectedSacrament.short}</p>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setSelectedSacrament(null)}
                      className="flex-shrink-0 w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 active:bg-black/15 flex items-center justify-center transition-colors self-start"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M18 6 6 18M6 6l12 12"/>
                      </svg>
                    </button>
                  </div>

                  {/* Khu vực Badges */}
                  <div className="flex gap-2 px-6 pb-3 flex-wrap touch-none">
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-black/5">
                      🏷 {selectedSacrament.details.type}
                    </span>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-black/5">
                      ✋ {selectedSacrament.details.minister}
                    </span>
                  </div>

                  {/* Đường kẻ phân cách */}
                  <div className="h-px bg-black/10 mx-6 flex-shrink-0" />

                  {/* Body: Cuộn mượt độc lập hoàn toàn bằng overscroll-contain */}
                  <div className="p-6 pt-4 space-y-5 overflow-y-auto overscroll-contain flex-1 touch-none">
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1, duration: 0.2 }}
                      className="space-y-4"
                    >
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1.5">
                          Ý nghĩa thần học
                        </p>
                        <p className="text-sm leading-relaxed font-medium opacity-85">
                          {selectedSacrament.details.meaning}
                        </p>
                      </div>
                      
                      <div className="h-px bg-black/8" />
                      
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1.5">
                          Nghi thức & Đặc trưng
                        </p>
                        <p className="text-sm leading-relaxed font-medium opacity-85">
                          {selectedSacrament.details.highlight}
                        </p>
                      </div>
                      
                      <div className="text-center text-xl pt-1 tracking-widest select-none opacity-80">
                        {selectedSacrament.details.emoji}
                      </div>
                    </motion.div>
                  </div>

                </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>
      </section>

      <section className="py-20 md:py-28 max-w-5xl mx-auto px-5 sm:px-6">
        <motion.div initial={{ opacity: 0, y: mc.yOffset }} whileInView={{ opacity: 1, y: 0 }} viewport={vp}
          transition={{ duration: mc.duration(0.7) }} className="mb-12">
          <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: ACCENT }}>Phương pháp</p>
          <h2 className="text-3xl md:text-4xl font-serif font-black text-stone-900">Từ hiểu đến yêu mến</h2>
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
            <Sparkles className="w-10 h-10 mx-auto mb-4" style={{ color: ACCENT }} />
          </motion.div>
          <h2 className="text-2xl md:text-3xl font-serif font-black text-stone-900 mb-3">Tham gia cử hành cùng Giáo Hội</h2>
          <p className="text-stone-500 text-sm leading-relaxed mb-8 max-w-md mx-auto">Đăng ký để con em hiểu sâu và yêu mến Thánh Lễ, Bí tích và toàn bộ đời sống Phụng vụ của Giáo Hội Công giáo.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/tuyển-sinh#dang-ky"
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