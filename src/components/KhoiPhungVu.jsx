import React, { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Sparkles, Music, BookOpen, Calendar, Clock, CalendarDays, Users, ArrowRight, ChevronLeft, Sun } from "lucide-react";
import { motion, useScroll, useTransform, AnimatePresence, useMotionValue } from "framer-motion";
import { useLenis } from "lenis/react";
import { useMotionConfig } from "../hooks/useMotionConfig.js";

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
    color: "bg-white dark:bg-stone-900 border-stone-200/60 dark:border-stone-800/80 hover:border-violet-500/50 dark:hover:border-violet-500/50",
    badge: "text-violet-600 bg-violet-50 dark:text-violet-400 dark:bg-violet-950/30",
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
    color: "bg-white dark:bg-stone-900 border-stone-200/60 dark:border-stone-800/80 hover:border-amber-500/50 dark:hover:border-amber-500/50",
    badge: "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/30",
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
    color: "bg-white dark:bg-stone-900 border-stone-200/60 dark:border-stone-800/80 hover:border-emerald-500/50 dark:hover:border-emerald-500/50",
    badge: "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/30",
    symbol: "🌿",
    desc: "Theo dõi cuộc đời và sứ vụ công khai của Chúa Giêsu.",
    details: {
      meaning: "Giai đoạn ngắn giữa mùa Giáng Sinh và mùa Chay. Tập trung vào cuộc đời rao giảng công khai và các phép lạ của Chúa Giêsu.",
      highlight: "Màu xanh lá biểu lộ cho sự sống, niềm hy vọng và sự tăng trưởng đức tin mỗi ngày.",
      emoji: "🌱 📖 ⛪",
      duration: "4–9 tuần",
      color_meaning: "Xanh lá — sự sống & tăng trưởng",
    },
  },
  {
    id: "chay",
    season: "Mùa Chay",
    color: "bg-white dark:bg-stone-900 border-stone-200/60 dark:border-stone-800/80 hover:border-fuchsia-500/50 dark:hover:border-fuchsia-500/50",
    badge: "text-fuchsia-600 bg-fuchsia-50 dark:text-fuchsia-400 dark:bg-fuchsia-950/30",
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
    color: "bg-white dark:bg-stone-900 border-stone-200/60 dark:border-stone-800/80 hover:border-rose-500/50 dark:hover:border-rose-500/50",
    badge: "text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-950/30",
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
    color: "bg-white dark:bg-stone-900 border-stone-200/60 dark:border-stone-800/80 hover:border-orange-500/50 dark:hover:border-orange-500/50",
    badge: "text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-950/30",
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
    color: "bg-white dark:bg-stone-900 border-stone-200/60 dark:border-stone-800/80 hover:border-lime-500/50 dark:hover:border-lime-500/50",
    badge: "text-lime-600 bg-lime-50 dark:text-lime-400 dark:bg-lime-950/30",
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
    color: "bg-white dark:bg-stone-900 border-stone-200/60 dark:border-stone-800/80 hover:border-orange-500/50 dark:hover:border-orange-500/50",
    short: "Cửa vào đời sống Kitô hữu.",
    details: {
      type: "Bí tích Khai Tâm",
      minister: "Giám mục, Linh mục, Phó tế (hoặc bất kỳ ai khi khẩn cấp)",
      meaning: "Là nền tảng của đời sống Kitô hữu. Qua nước và Thánh Thần, người lãnh nhận được sạch tội nguyên tổ, tái sinh làm con Thiên Chúa và gia nhập Giáo Hội.",
      highlight: "Đổ nước 3 lần với lời truyền pháp nhân danh Cha, Con và Thánh Thần. Đi kèm biểu tượng áo trắng, nến sáng và dầu thánh.",
      emoji: "💧 🕊️ ✨",
    },
  },
  {
    id: "them-suc",
    name: "Thêm Sức",
    icon: "🔥",
    color: "bg-white dark:bg-stone-900 border-stone-200/60 dark:border-stone-800/80 hover:border-orange-500/50 dark:hover:border-orange-500/50",
    short: "Củng cố ân sủng Rửa Tội, lãnh nhận Chúa Thánh Thần.",
    details: {
      type: "Bí tích Khai Tâm",
      minister: "Giám mục (thông thường); Linh mục (khi được ủy quyền)",
      meaning: "Hoàn tất ơn Rửa Tội, đổ đầy Chúa Thánh Thần và 7 ơn của Ngài để giúp người Kitô hữu trưởng thành và can đảm làm chứng cho Đức Kitô.",
      highlight: "Nghi thức xức dầu Thánh (Chrisma) lên trán và đặt tay. Nhắc nhở về 7 ơn Chúa Thánh Thần trong cuộc sống.",
      emoji: "🔥 ✋ 👑",
    },
  },
  {
    id: "thanh-the",
    name: "Thánh Thể",
    icon: "🍞",
    color: "bg-white dark:bg-stone-900 border-stone-200/60 dark:border-stone-800/80 hover:border-orange-500/50 dark:hover:border-orange-500/50",
    short: "Nguồn mạch và tột đỉnh của đời sống Kitô hữu.",
    details: {
      type: "Bí tích Khai Tâm",
      minister: "Chỉ Linh mục (cử hành); Thừa tác viên ngoại thường (trao Mình Thánh)",
      meaning: "Trung tâm và đỉnh cao của Giáo Hội. Trong Thánh Lễ, bánh và rượu thực sự trở thành Mình và Máu Thánh Chúa Giêsu chứ không chỉ là biểu tượng.",
      highlight: "Khoảnh khắc Lời Truyền Phép của Linh mục. Bánh Thánh nuôi dưỡng linh hồn hằng ngày và được tôn thờ nơi Nhà Tạm.",
      emoji: "🍞 🍷 🙏",
    },
  },
  {
    id: "hoa-giai",
    name: "Hoà Giải",
    icon: "🕊️",
    color: "bg-white dark:bg-stone-900 border-stone-200/60 dark:border-stone-800/80 hover:border-orange-500/50 dark:hover:border-orange-500/50",
    short: "Giao hoà với Chúa và Giáo Hội qua bí tích tha tội.",
    details: {
      type: "Bí tích Chữa Lành",
      minister: "Giám mục và Linh mục (được quyền giải tội)",
      meaning: "Ban ơn tha thứ của Thiên Chúa cho các tội lỗi phạm sau khi Rửa Tội, giúp chữa lành vết thương tâm hồn và ban sức mạnh hoán cải.",
      highlight: "Gồm 4 bước: Xét mình, Ăn năn tội, Xưng tội với Linh mục và làm việc Đền tội để giao hòa.",
      emoji: "🕊️ 🤍 🔓",
    },
  },
  {
    id: "xuc-dau",
    name: "Xức Dầu Bệnh Nhân",
    icon: "⚕️",
    color: "bg-white dark:bg-stone-900 border-stone-200/60 dark:border-stone-800/80 hover:border-orange-500/50 dark:hover:border-orange-500/50",
    short: "Chữa lành và an ủi trong bệnh tật, tuổi già hay nguy tử.",
    details: {
      type: "Bí tích Chữa Lành",
      minister: "Giám mục và Linh mục",
      meaning: "Dành cho người đau nặng, người già hoặc sắp phẫu thuật. Ban sự bình an, can đảm hiệp thông với cuộc thương khó của Chúa và chữa lành hồn xác.",
      highlight: "Linh mục đặt tay thinh lặng và xức dầu thánh lên trán, tay bệnh nhân cùng lời nguyện cầu giảm bớt đau đớn.",
      emoji: "⚕️ 🤲 🕯️",
    },
  },
  {
    id: "truyen-chuc",
    name: "Truyền Chức Thánh",
    icon: "✋",
    color: "bg-white dark:bg-stone-900 border-stone-200/60 dark:border-stone-800/80 hover:border-orange-500/50 dark:hover:border-orange-500/50",
    short: "Thánh hiến người phục vụ Dân Chúa qua 3 cấp bậc.",
    details: {
      type: "Bí tích Phục Vụ Cộng Đoàn",
      minister: "Chỉ Giám mục",
      meaning: "Tiếp tục sứ mạng tông đồ trong Giáo Hội qua 3 cấp bậc: Giám mục, Linh mục và Phó tế. Người nhận được ghi ấn tín thiêng liêng vĩnh viễn.",
      highlight: "Nghi thức chính yếu: Giám mục đặt tay lên đầu ứng viên trong thinh lặng và đọc lời nguyện thánh hiến.",
      emoji: "✋ ⛪ 📿",
    },
  },
  {
    id: "hon-phoi",
    name: "Hôn Phối",
    icon: "💍",
    color: "bg-white dark:bg-stone-900 border-stone-200/60 dark:border-stone-800/80 hover:border-orange-500/50 dark:hover:border-orange-500/50",
    short: "Giao ước tình yêu vĩnh cửu phản chiếu tình yêu Thiên Chúa.",
    details: {
      type: "Bí tích Phục Vụ Cộng Đoàn",
      minister: "Chính đôi bạn trao nhau (Linh mục/Phó tế là nhân chứng)",
      meaning: "Giao ước tình yêu thánh thiêng giữa một người nam và một người nữ, mang đặc tính: tự do, trọn vẹn, trung thành suốt đời và đón nhận con cái.",
      highlight: "Chính nam nữ là thừa tác viên trao bí tích cho nhau qua lời thề hứa hôn ước bất khả phân ly trước mặt Chúa.",
      emoji: "💍 💑 🤍",
    },
  },
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
  const lenis = useLenis();
  const seasonSheetY = useMotionValue(0);
  const sacramentSheetY = useMotionValue(0);

  const systemConfig = useMotionConfig();
  const mc = systemConfig || {
    yOffset: 30,
    duration: (d) => d || 0.6,
    delay: (d) => d || 0,
    stagger: 0.08,
    isMobile: false,
    reduced: false,
    vp: () => ({ once: true, margin: "-12% 0px" }),
    heroParallax: [0, -60],
  };

  const heroY = useTransform(scrollY, [0, 600], mc.heroParallax || [0, -60]);

  const handleSeasonDragEnd = (event, info) => {
    if (info.offset.y > 100 || info.velocity.y > 500) setSelectedSeason(null);
    else seasonSheetY.set(0);
  };
  const handleSacramentDragEnd = (event, info) => {
    if (info.offset.y > 100 || info.velocity.y > 500) setSelectedSacrament(null);
    else sacramentSheetY.set(0);
  };

  useEffect(() => {
    if (selectedSeason) {
      seasonSheetY.set(0);
      if (window.innerWidth < 768) document.body.style.overflow = "hidden";
    } else if (!selectedSacrament) {
      document.body.style.overflow = "";
    }
    return () => { if (!selectedSacrament) document.body.style.overflow = ""; };
  }, [selectedSeason, seasonSheetY, selectedSacrament]);

  useEffect(() => {
    if (selectedSacrament) {
      sacramentSheetY.set(0);
      if (window.innerWidth < 768) document.body.style.overflow = "hidden";
    } else if (!selectedSeason) {
      document.body.style.overflow = "";
    }
    return () => { if (!selectedSeason) document.body.style.overflow = ""; };
  }, [selectedSacrament, sacramentSheetY, selectedSeason]);

  const fadeUp = {
    hidden: { opacity: 0, y: mc.yOffset },
    visible: (d = 0) => ({
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 90, damping: 15, mass: 0.8, delay: mc.delay(d) },
    }),
  };

  const vp = mc.vp();

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-stone-900 dark:bg-[#09090b] dark:text-stone-50 antialiased overflow-x-hidden selection:bg-orange-500/20 dark:selection:bg-orange-500/30 transition-colors duration-500">

      {/* HERO SECTION */}
      <section ref={heroRef} className="relative overflow-hidden pt-12 pb-20 md:pt-32 md:pb-32 bg-gradient-to-b from-white via-[#f5f5f7] to-transparent dark:from-stone-900 dark:via-[#09090b]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

        <motion.div style={{ y: heroY }} className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid md:grid-cols-12 gap-12 lg:gap-16 items-center">
            <div className="md:col-span-7 space-y-6 text-left">
              <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-orange-500/10 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300">
                  <Sparkles className="w-3 h-3" /> Khối Phụng Vụ
                </span>
              </motion.div>

              <motion.h1 variants={fadeUp} initial="hidden" animate="visible" custom={0.06} className="text-4xl sm:text-5xl lg:text-6xl font-sans font-extrabold tracking-tight leading-[1.08]">
                Cử hành đức tin<br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-600 via-amber-600 to-red-600 dark:from-orange-400 dark:via-amber-400 dark:to-red-400">
                  trong Phụng vụ
                </span>
              </motion.h1>

              <motion.p variants={fadeUp} initial="hidden" animate="visible" custom={0.12} className="text-base sm:text-lg text-stone-500 dark:text-stone-400 leading-relaxed max-w-xl font-normal">
                Phụng vụ là đỉnh cao mà mọi hoạt động Giáo Hội hướng tới, đồng thời là nguồn mạch tuôn trào mọi sức mạnh (SC 10) — Khối Phụng Vụ giúp các em hiểu và yêu mến các cử hành thánh thiêng của Giáo Hội.
              </motion.p>

              <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0.18} className="flex flex-wrap gap-4 pt-4">
                <button
                  onClick={() => {
                    const target = document.getElementById("noi-dung");
                    if (!target) return;
                    lenis ? lenis.scrollTo(target, { duration: 1 }) : target.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-full text-xs font-bold text-white shadow-lg bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-950 dark:hover:bg-white active:scale-[0.98] transition-all duration-200"
                >
                  Xem nội dung <ArrowRight className="w-4 h-4" />
                </button>
                <Link to="/tuyển-sinh#dang-ky"
                  className="inline-flex items-center justify-center h-12 px-6 rounded-full text-xs font-bold border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800/60 shadow-sm active:scale-[0.98] transition-all duration-200">
                  Đăng ký Nhập Học
                </Link>
              </motion.div>
            </div>

            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0.24} className="md:col-span-5 flex justify-center">
              <div className="relative w-full max-w-[340px] aspect-square rounded-[2.5rem] bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 p-8 shadow-xl dark:shadow-black/40 flex items-center justify-center group">
                <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/5 to-amber-500/5 rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                <img src="/images/khoiphungvu.avif" alt="Khối Phụng Vụ" className="w-full h-full object-contain transform group-hover:scale-[1.02] transition-transform duration-500" loading="eager" />

                <div className="absolute -bottom-4 right-6 bg-white/90 dark:bg-stone-800/90 backdrop-blur-md rounded-2xl px-4 py-3 flex items-center gap-3 border border-stone-200/80 dark:border-stone-700/80 shadow-md">
                  <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                  <div>
                    <p className="text-xs font-bold tracking-tight">Lớp 7</p>
                    <p className="text-[10px] text-stone-500 dark:text-stone-400 font-medium">12 tuổi</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* OVERVIEW CARDS */}
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

      {/* LITURGICAL YEAR — BENTO GRID */}
      <section id="noi-dung" className="py-24 max-w-6xl mx-auto px-6 scroll-mt-12">
        <div className="max-w-2xl text-left space-y-3 mb-16">
          <p className="text-[11px] font-bold tracking-widest uppercase text-orange-600 dark:text-orange-400">Nội dung</p>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Năm Phụng Vụ — Vòng Tròn Thiêng Liêng</h2>
          <p className="text-stone-500 dark:text-stone-400 text-sm leading-relaxed">
            Giáo Hội sống theo một nhịp thời gian riêng — mỗi mùa phụng vụ mang màu sắc, ý nghĩa và lời cầu nguyện đặc trưng.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {LITURGICAL_YEAR.map((season, i) => (
            <motion.div
              key={season.id}
              initial={{ opacity: 0, y: mc.yOffset }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={vp}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              onClick={() => setSelectedSeason(season)}
              className={`group text-left rounded-[1.75rem] border p-6 flex flex-col justify-between min-h-[190px] cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-stone-200/30 dark:hover:shadow-none ${season.color}`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl select-none">{season.symbol}</span>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${season.badge}`}>
                    Chi tiết
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-stone-900 dark:text-stone-100 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors mb-2">{season.season}</h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed line-clamp-3">{season.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* SEASON DETAIL SHEET */}
        <AnimatePresence>
          {selectedSeason && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedSeason(null)}
                className="fixed inset-0 bg-black/40 dark:bg-black/70 backdrop-blur-sm z-50 pointer-events-auto"
              />
              <div className="fixed inset-0 z-[60] flex flex-col justify-end md:items-center md:justify-center p-0 md:p-4 pointer-events-none">
                <motion.div
                  drag={window.innerWidth < 768 ? "y" : false}
                  dragConstraints={{ top: 0, bottom: 0 }}
                  dragElastic={{ top: 0.1, bottom: 0.6 }}
                  onDragEnd={handleSeasonDragEnd}
                  style={{ y: seasonSheetY }}
                  initial={{ opacity: 0, y: window.innerWidth < 768 ? "100%" : 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: window.innerWidth < 768 ? "100%" : 20 }}
                  transition={{ type: "spring", stiffness: 320, damping: 30, mass: 0.9 }}
                  className="relative w-full md:max-w-xl rounded-t-[2.5rem] md:rounded-[2rem] border border-stone-200/80 dark:border-stone-800/80 shadow-2xl pointer-events-auto max-h-[88vh] md:max-h-[80vh] flex flex-col overflow-hidden bg-white/95 dark:bg-stone-900/95 backdrop-blur-xl text-stone-900 dark:text-stone-50"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex justify-center pt-3 pb-2 md:hidden touch-none">
                    <div className="w-12 h-1.5 bg-stone-300 dark:bg-stone-700 rounded-full" />
                  </div>

                  <div className="flex items-start gap-4 p-6 pb-4 touch-none">
                    <div className="w-12 h-12 rounded-2xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center shadow-inner flex-shrink-0 text-xl select-none">
                      {selectedSeason.symbol}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-extrabold text-xl tracking-tight text-stone-900 dark:text-white leading-tight">{selectedSeason.season}</h3>
                      <p className="text-xs text-orange-600 dark:text-orange-400 font-bold mt-1 tracking-wide">{selectedSeason.desc}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedSeason(null)}
                      className="flex-shrink-0 w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center transition-colors hover:bg-stone-200 dark:hover:bg-stone-700 active:scale-90"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                        <path d="M18 6 6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="flex gap-2 px-6 pb-4 flex-wrap touch-none">
                    <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                      ⏱ {selectedSeason.details.duration}
                    </span>
                    <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                      🎨 {selectedSeason.details.color_meaning}
                    </span>
                  </div>

                  <div className="h-px bg-stone-200/60 dark:bg-stone-800/60 mx-6 flex-shrink-0" />

                  <div className="p-6 pt-4 space-y-5 overflow-y-auto overscroll-contain flex-1 text-left">
                    <div className="space-y-5">
                      <div>
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500 mb-2.5">Ý nghĩa Phụng vụ</h4>
                        <p className="text-sm leading-relaxed text-stone-600 dark:text-stone-300 font-medium">{selectedSeason.details.meaning}</p>
                      </div>

                      <div className="h-px bg-stone-100 dark:bg-stone-800/50" />

                      <div>
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500 mb-2.5">Đặc trưng & Hoạt động</h4>
                        <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-950/40 border border-stone-200/50 dark:border-stone-800/40">
                          <p className="text-sm leading-relaxed text-stone-700 dark:text-stone-300 font-medium">{selectedSeason.details.highlight}</p>
                        </div>
                      </div>

                      <div className="text-center text-lg pt-2 tracking-widest select-none opacity-80">
                        {selectedSeason.details.emoji}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>
      </section>

      {/* SACRAMENTS — PILLAR CARDS */}
      <section className="py-24 bg-white/40 dark:bg-stone-900/20 border-y border-stone-200/50 dark:border-stone-800/50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-2xl text-left space-y-2 mb-16">
            <p className="text-[11px] font-bold tracking-widest uppercase text-orange-600 dark:text-orange-400">Bí tích học</p>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Bảy Bí Tích — Bảy Cánh Cửa Ân Sủng</h2>
            <p className="text-stone-500 dark:text-stone-400 text-sm leading-relaxed">
              Mỗi Bí tích là một cuộc gặp gỡ thực sự với Chúa Kitô — không phải nghi lễ hình thức mà là hành động thiêng liêng của chính Thiên Chúa qua dấu chỉ hữu hình.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SACRAMENTS.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: mc.yOffset }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={vp}
                transition={{ duration: 0.6, delay: i * 0.08 }}
                onClick={() => setSelectedSacrament(s)}
                className={`group cursor-pointer rounded-[1.75rem] border p-6 flex flex-col transition-all duration-300 hover:shadow-lg ${s.color}`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-950/30 flex items-center justify-center flex-shrink-0 text-xl select-none">
                    {s.icon}
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-950/30">
                    Tìm hiểu
                  </span>
                </div>
                <h3 className="text-lg font-extrabold text-stone-900 dark:text-stone-100 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors mb-2">{s.name}</h3>
                <p className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed flex-1">{s.short}</p>
                <span className="mt-4 inline-flex w-fit text-[10px] font-bold px-2.5 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400">
                  {s.details.type}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* SACRAMENT DETAIL SHEET */}
        <AnimatePresence>
          {selectedSacrament && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedSacrament(null)}
                className="fixed inset-0 bg-black/40 dark:bg-black/70 backdrop-blur-sm z-50 pointer-events-auto"
              />
              <div className="fixed inset-0 z-[60] flex flex-col justify-end md:items-center md:justify-center p-0 md:p-4 pointer-events-none">
                <motion.div
                  drag={window.innerWidth < 768 ? "y" : false}
                  dragConstraints={{ top: 0, bottom: 0 }}
                  dragElastic={{ top: 0.1, bottom: 0.6 }}
                  onDragEnd={handleSacramentDragEnd}
                  style={{ y: sacramentSheetY }}
                  initial={{ opacity: 0, y: window.innerWidth < 768 ? "100%" : 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: window.innerWidth < 768 ? "100%" : 20 }}
                  transition={{ type: "spring", stiffness: 320, damping: 30, mass: 0.9 }}
                  className="relative w-full md:max-w-xl rounded-t-[2.5rem] md:rounded-[2rem] border border-stone-200/80 dark:border-stone-800/80 shadow-2xl pointer-events-auto max-h-[88vh] md:max-h-[80vh] flex flex-col overflow-hidden bg-white/95 dark:bg-stone-900/95 backdrop-blur-xl text-stone-900 dark:text-stone-50"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex justify-center pt-3 pb-2 md:hidden touch-none">
                    <div className="w-12 h-1.5 bg-stone-300 dark:bg-stone-700 rounded-full" />
                  </div>

                  <div className="flex items-start gap-4 p-6 pb-4 touch-none">
                    <div className="w-12 h-12 rounded-2xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center shadow-inner flex-shrink-0 text-xl select-none">
                      {selectedSacrament.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-extrabold text-xl tracking-tight text-stone-900 dark:text-white leading-tight">{selectedSacrament.name}</h3>
                      <p className="text-xs text-orange-600 dark:text-orange-400 font-bold mt-1 tracking-wide">{selectedSacrament.short}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedSacrament(null)}
                      className="flex-shrink-0 w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center transition-colors hover:bg-stone-200 dark:hover:bg-stone-700 active:scale-90"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                        <path d="M18 6 6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="flex gap-2 px-6 pb-4 flex-wrap touch-none">
                    <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                      🏷 {selectedSacrament.details.type}
                    </span>
                    <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                      ✋ {selectedSacrament.details.minister}
                    </span>
                  </div>

                  <div className="h-px bg-stone-200/60 dark:bg-stone-800/60 mx-6 flex-shrink-0" />

                  <div className="p-6 pt-4 space-y-5 overflow-y-auto overscroll-contain flex-1 text-left">
                    <div className="space-y-5">
                      <div>
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500 mb-2.5">Ý nghĩa thần học</h4>
                        <p className="text-sm leading-relaxed text-stone-600 dark:text-stone-300 font-medium">{selectedSacrament.details.meaning}</p>
                      </div>

                      <div className="h-px bg-stone-100 dark:bg-stone-800/50" />

                      <div>
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500 mb-2.5">Nghi thức & Đặc trưng</h4>
                        <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-950/40 border border-stone-200/50 dark:border-stone-800/40">
                          <p className="text-sm leading-relaxed text-stone-700 dark:text-stone-300 font-medium">{selectedSacrament.details.highlight}</p>
                        </div>
                      </div>

                      <div className="text-center text-lg pt-2 tracking-widest select-none opacity-80">
                        {selectedSacrament.details.emoji}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>
      </section>

      {/* HIGHLIGHTS / METHODOLOGY */}
      <section className="py-24 max-w-6xl mx-auto px-6">
        <div className="max-w-2xl text-left space-y-2 mb-16">
          <p className="text-[11px] font-bold tracking-widest uppercase text-orange-600 dark:text-orange-400">Phương pháp giáo lý</p>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Từ hiểu đến yêu mến</h2>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
          {HIGHLIGHTS.map((item, i) => { const Icon = item.icon; return (
            <motion.div key={i} initial={{ opacity: 0, y: mc.yOffset }} whileInView={{ opacity: 1, y: 0 }}
              viewport={vp} transition={{ duration: 0.5, delay: i * 0.08 }}
              className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/60 dark:border-stone-800/80 p-6 shadow-sm hover:shadow-md transition-all text-left">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-6 bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 mb-2">{item.title}</h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed font-medium">{item.desc}</p>
            </motion.div>
          ); })}
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-28 max-w-3xl mx-auto px-6 text-center">
        <motion.div initial={{ opacity: 0, y: mc.yOffset }} whileInView={{ opacity: 1, y: 0 }} viewport={vp} transition={{ duration: 0.6 }}>
          <div className="inline-flex w-12 h-12 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-md items-center justify-center mb-8">
            <Sparkles className="w-5 h-5 text-orange-500" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">Tham Gia Cử Hành Cùng Giáo Hội</h2>
          <p className="text-stone-500 dark:text-stone-400 text-sm sm:text-base leading-relaxed mb-10 max-w-xl mx-auto font-medium">
            Kính mời quý Phụ huynh đăng ký để con em hiểu sâu và yêu mến Thánh Lễ, Bí tích và toàn bộ đời sống Phụng vụ của Giáo Hội Công giáo.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/tuyển-sinh#dang-ky"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-12 px-8 rounded-full text-xs font-bold text-white shadow-lg shadow-orange-600/10 bg-orange-600 hover:bg-orange-500 active:scale-[0.98] transition-all duration-200"
            >
              Đăng ký trực tuyến <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/liên-hệ"
              className="w-full sm:w-auto inline-flex items-center justify-center h-12 px-6 rounded-full text-xs font-bold border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800 shadow-sm active:scale-[0.98] transition-all duration-200">
              Liên hệ Hỏi thông tin
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}