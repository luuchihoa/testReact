import React from "react";
import { Sparkles, Music, BookOpen, Calendar, Clock, CalendarDays, Users, ArrowRight, Flame, Sun } from "lucide-react";
import { usePageMotion } from "../hooks/usePageMotion.js";
import HeroSection from "../features/khoi/HeroSection.jsx";
import OverviewCards from "../features/khoi/OverviewCards.jsx";
import HighlightsGrid from "../features/khoi/HighlightsGrid.jsx";
import CtaSection from "../features/khoi/CtaSection.jsx";
import KhoiPhungVuLiturgical from "../features/khoi/KhoiPhungVuLiturgical.jsx";
import KhoiPhungVuSacraments from "../features/khoi/KhoiPhungVuSacraments.jsx";

// Hằng số Easing chuẩn hệ thống
const APPLE_EASE = [0.16, 1, 0.3, 1];
const MOBILE_BREAKPOINT = 768;

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
    color: "bg-white/90 dark:bg-[#1C1917]/90 backdrop-blur-xl border-amber-900/10 dark:border-amber-100/10 hover:border-violet-500/40 shadow-sm",
    badge: "text-violet-700 bg-violet-100/80 dark:text-violet-400 dark:bg-violet-900/30 border border-violet-200/50 dark:border-violet-800/30",
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
    color: "bg-white/90 dark:bg-[#1C1917]/90 backdrop-blur-xl border-amber-900/10 dark:border-amber-100/10 hover:border-amber-500/40 shadow-sm",
    badge: "text-amber-700 bg-amber-100/80 dark:text-amber-400 dark:bg-amber-900/30 border border-amber-200/50 dark:border-amber-800/30",
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
    color: "bg-white/90 dark:bg-[#1C1917]/90 backdrop-blur-xl border-amber-900/10 dark:border-amber-100/10 hover:border-emerald-500/40 shadow-sm",
    badge: "text-emerald-700 bg-emerald-100/80 dark:text-emerald-400 dark:bg-emerald-900/30 border border-emerald-200/50 dark:border-emerald-800/30",
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
    color: "bg-white/90 dark:bg-[#1C1917]/90 backdrop-blur-xl border-amber-900/10 dark:border-amber-100/10 hover:border-fuchsia-500/40 shadow-sm",
    badge: "text-fuchsia-700 bg-fuchsia-100/80 dark:text-fuchsia-400 dark:bg-fuchsia-900/30 border border-fuchsia-200/50 dark:border-fuchsia-800/30",
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
    color: "bg-white/90 dark:bg-[#1C1917]/90 backdrop-blur-xl border-amber-900/10 dark:border-amber-100/10 hover:border-rose-500/40 shadow-sm",
    badge: "text-rose-700 bg-rose-100/80 dark:text-rose-400 dark:bg-rose-900/30 border border-rose-200/50 dark:border-rose-800/30",
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
    color: "bg-white/90 dark:bg-[#1C1917]/90 backdrop-blur-xl border-amber-900/10 dark:border-amber-100/10 hover:border-orange-500/40 shadow-sm",
    badge: "text-orange-700 bg-orange-100/80 dark:text-orange-400 dark:bg-orange-900/30 border border-orange-200/50 dark:border-orange-800/30",
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
    color: "bg-white/90 dark:bg-[#1C1917]/90 backdrop-blur-xl border-amber-900/10 dark:border-amber-100/10 hover:border-lime-500/40 shadow-sm",
    badge: "text-lime-700 bg-lime-100/80 dark:text-lime-400 dark:bg-lime-900/30 border border-lime-200/50 dark:border-lime-800/30",
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
    color: "bg-white/90 dark:bg-[#1C1917]/90 backdrop-blur-xl border-amber-900/10 dark:border-amber-100/10 hover:border-orange-500/40 shadow-sm",
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
    color: "bg-white/90 dark:bg-[#1C1917]/90 backdrop-blur-xl border-amber-900/10 dark:border-amber-100/10 hover:border-orange-500/40 shadow-sm",
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
    color: "bg-white/90 dark:bg-[#1C1917]/90 backdrop-blur-xl border-amber-900/10 dark:border-amber-100/10 hover:border-orange-500/40 shadow-sm",
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
    color: "bg-white/90 dark:bg-[#1C1917]/90 backdrop-blur-xl border-amber-900/10 dark:border-amber-100/10 hover:border-orange-500/40 shadow-sm",
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
    color: "bg-white/90 dark:bg-[#1C1917]/90 backdrop-blur-xl border-amber-900/10 dark:border-amber-100/10 hover:border-orange-500/40 shadow-sm",
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
    color: "bg-white/90 dark:bg-[#1C1917]/90 backdrop-blur-xl border-amber-900/10 dark:border-amber-100/10 hover:border-orange-500/40 shadow-sm",
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
    color: "bg-white/90 dark:bg-[#1C1917]/90 backdrop-blur-xl border-amber-900/10 dark:border-amber-100/10 hover:border-orange-500/40 shadow-sm",
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
  const { heroRef, lenis, heroY, heroReveal } = usePageMotion();

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-900 dark:bg-[#1C1917] dark:text-stone-50 antialiased overflow-x-hidden selection:bg-orange-500/20 dark:selection:bg-orange-500/30 transition-colors duration-500">
      
      <HeroSection
        heroRef={heroRef}
        heroY={heroY}
        fadeUp={heroReveal}
        lenis={lenis}
        sectionBgClass="bg-gradient-to-b from-white via-orange-50/30 to-[#FDFBF7] dark:from-[#1C1917] dark:via-orange-950/10 dark:to-[#191614]"
        glowClass="bg-orange-500/5 dark:bg-orange-500/10"
        eyebrowIcon={Sparkles}
        eyebrowLabel="Khối Phụng Vụ"
        eyebrowClass="bg-orange-100/80 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border border-orange-200/50 dark:border-orange-800/30 shadow-sm"
        titleLine1="Cử hành đức tin"
        titleLine2="trong Phụng vụ"
        titleGradientClass="bg-gradient-to-r from-orange-600 via-amber-600 to-red-600 dark:from-orange-400 dark:via-amber-400 dark:to-red-400"
        description="Phụng vụ là đỉnh cao mà mọi hoạt động Giáo Hội hướng tới, đồng thời là nguồn mạch tuôn trào mọi sức mạnh (SC 10) — Khối Phụng Vụ giúp các em hiểu và yêu mến các cử hành thánh thiêng của Giáo Hội."
        primaryCtaLabel="Xem nội dung"
        primaryCtaTargetId="noi-dung"
        primaryCtaClass="bg-orange-600 hover:bg-orange-500 dark:bg-orange-600 dark:hover:bg-orange-500 text-white"
        secondaryCtaLabel="Đăng ký Nhập Học"
        secondaryCtaTo="/tuyển-sinh#dang-ky"
        image={{ src: "/images/khoiphungvu.avif", alt: "Khối Phụng Vụ" }}
        imageGlowClass="bg-gradient-to-tr from-orange-500/5 to-amber-500/5"
        floatBadge={{ label: "Lớp 7", sub: "Sống đời thờ phượng", dotClass: "bg-orange-500" }}
      />

      <OverviewCards items={OVERVIEW} accentBgClass="bg-orange-100/50 dark:bg-orange-900/20" accentTextClass="text-orange-900 dark:text-orange-400" accentBorderClass="border-orange-900/10 dark:border-orange-700/30" />

      {/* LITURGICAL YEAR — BENTO GRID */}
      <KhoiPhungVuLiturgical items={LITURGICAL_YEAR} />

      {/* SACRAMENTS — PILLAR CARDS */}
      <KhoiPhungVuSacraments items={SACRAMENTS} />

      <HighlightsGrid
        items={HIGHLIGHTS}
        eyebrowLabel="Phương pháp giáo lý"
        title="Từ hiểu đến yêu mến"
        accentTextClass="text-orange-600 dark:text-orange-400"
        accentIconClass="bg-orange-100/80 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border border-orange-200/50 dark:border-orange-800/30 shadow-sm"
        cardClass="bg-white/80 dark:bg-[#1C1917]/80 backdrop-blur-xl border-amber-900/10 dark:border-amber-100/10"
      />

      <CtaSection
        icon={Sparkles}
        iconClass="text-orange-500"
        title="Tham Gia Cử Hành Cùng Giáo Hội"
        description="Kính mời quý Phụ huynh đăng ký để con em hiểu sâu và yêu mến Thánh Lễ, Bí tích và toàn bộ đời sống Phụng vụ của Giáo Hội Công giáo."
        primaryCtaLabel="Đăng ký trực tuyến"
        primaryCtaTo="/tuyển-sinh#dang-ky"
        primaryCtaClass="bg-orange-600 text-white hover:bg-orange-500 shadow-sm shadow-orange-600/10"
        secondaryCtaLabel="Liên hệ Hỏi thông tin"
        secondaryCtaTo="/liên-hệ"
      />
    </div>
  );
}