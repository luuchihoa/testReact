import React from "react";
import { Flame, Wind, Shield, Users, BookOpen, Clock, CalendarDays, Lightbulb, Star } from "lucide-react";
import { motion } from "framer-motion";
import { usePageMotion } from "../hooks/usePageMotion.js";
import HeroSection from "../features/khoi/HeroSection.jsx";
import OverviewCards from "../features/khoi/OverviewCards.jsx";
import HighlightsGrid from "../features/khoi/HighlightsGrid.jsx";
import CtaSection from "../features/khoi/CtaSection.jsx";
import KhoiThemSucGifts from "../features/khoi/KhoiThemSucGifts.jsx";
import KhoiThemSucPillars from "../features/khoi/KhoiThemSucPillars.jsx";

// Hằng số Easing chuyển động chuẩn hệ thống Apple HIG
const APPLE_EASE = [0.16, 1, 0.3, 1];

const OVERVIEW = [
  { icon: Users,        label: "Độ tuổi",    value: "10 – 11 tuổi" },
  { icon: Clock,        label: "Thời lượng", value: "45 phút / buổi" },
  { icon: CalendarDays, label: "Lịch học",   value: "Chúa Nhật" },
  { icon: Star,         label: "Yêu cầu",    value: "Đã Rước Lễ" },
];

const GIFTS = [
  {
    id: "khon-ngoan",
    name: "Khôn Ngoan",
    icon: "🌿",
    color: "bg-white/90 dark:bg-[#1C1917]/90 backdrop-blur-xl border-amber-900/10 dark:border-amber-100/10 md:hover:border-amber-500/40 dark:md:hover:border-amber-500/40 shadow-sm",
    badge: "text-amber-700 bg-amber-100/80 dark:text-amber-400 dark:bg-amber-900/30 border border-amber-200/50 dark:border-amber-800/30",
    desc: "Nhìn thấy mọi sự theo nhãn quan của Thiên Chúa — biết đặt Chúa lên trên hết.",
    example: "Một bạn trẻ từ chối gian lận dù cả lớp làm vậy — vì biết điều gì thực sự có giá trị.",
  },
  {
    id: "hieu-biet",
    name: "Hiểu Biết",
    icon: "📖",
    color: "bg-white/90 dark:bg-[#1C1917]/90 backdrop-blur-xl border-amber-900/10 dark:border-amber-100/10 md:hover:border-orange-500/40 dark:md:hover:border-orange-500/40 shadow-sm",
    badge: "text-orange-700 bg-orange-100/80 dark:text-orange-400 dark:bg-orange-900/30 border border-orange-200/50 dark:border-orange-800/30",
    desc: "Thấu hiểu sâu sắc các chân lý đức tin và ý nghĩa của cuộc sống.",
    example: "Đọc một đoạn Kinh Thánh và tự nhiên nhận ra nó đang nói về chính mình hôm nay.",
  },
  {
    id: "lo-lieu",
    name: "Biết Lo Liệu",
    icon: "🧭",
    color: "bg-white/90 dark:bg-[#1C1917]/90 backdrop-blur-xl border-amber-900/10 dark:border-amber-100/10 md:hover:border-yellow-500/40 dark:md:hover:border-yellow-500/40 shadow-sm",
    badge: "text-yellow-700 bg-yellow-100/80 dark:text-yellow-400 dark:bg-yellow-900/30 border border-yellow-200/50 dark:border-yellow-800/30",
    desc: "Phân định điều tốt và hành động đúng đắn trong mỗi tình huống cụ thể.",
    example: "Biết khi nào nên nói, khi nào nên im lặng; khi nào giúp bạn, khi nào cần để bạn tự lớn.",
  },
  {
    id: "dung-cam",
    name: "Dũng Cảm",
    icon: "🦁",
    color: "bg-white/90 dark:bg-[#1C1917]/90 backdrop-blur-xl border-amber-900/10 dark:border-amber-100/10 md:hover:border-red-500/40 dark:md:hover:border-red-500/40 shadow-sm",
    badge: "text-red-700 bg-red-100/80 dark:text-red-400 dark:bg-red-900/30 border border-red-200/50 dark:border-red-800/30",
    desc: "Can đảm sống và loan báo đức tin dù bị phản đối hay chế nhạo.",
    example: "Dám cầu nguyện trước bữa ăn ở canteen trường, dù bạn bè nhìn.",
  },
  {
    id: "thong-minh",
    name: "Thông Minh",
    icon: "💡",
    color: "bg-white/90 dark:bg-[#1C1917]/90 backdrop-blur-xl border-amber-900/10 dark:border-amber-100/10 md:hover:border-lime-500/40 dark:md:hover:border-lime-500/40 shadow-sm",
    badge: "text-lime-700 bg-lime-100/80 dark:text-lime-400 dark:bg-lime-900/30 border border-lime-200/50 dark:border-lime-800/30",
    desc: "Dùng trí tuệ và tài năng Chúa ban để phục vụ vinh quang Ngài.",
    example: "Học giỏi không phải để hơn người, mà để có thể phục vụ xã hội tốt hơn vì Chúa.",
  },
  {
    id: "dao-duc",
    name: "Đạo Đức",
    icon: "🕊️",
    color: "bg-white/90 dark:bg-[#1C1917]/90 backdrop-blur-xl border-amber-900/10 dark:border-amber-100/10 md:hover:border-emerald-500/40 dark:md:hover:border-emerald-500/40 shadow-sm",
    badge: "text-emerald-700 bg-emerald-100/80 dark:text-emerald-400 dark:bg-emerald-900/30 border border-emerald-200/50 dark:border-emerald-800/30",
    desc: "Kính sợ Chúa và yêu mến điều thiện — tránh xa tội lỗi không phải vì sợ mà vì yêu.",
    example: "Cảm thấy xấu hổ và buồn lòng khi làm điều sai — đó chính là ơn đạo đức đang hoạt động.",
  },
  {
    id: "kinh-so",
    name: "Kính Sợ Chúa",
    icon: "✨",
    color: "bg-white/90 dark:bg-[#1C1917]/90 backdrop-blur-xl border-amber-900/10 dark:border-amber-100/10 md:hover:border-violet-500/40 dark:md:hover:border-violet-500/40 shadow-sm",
    badge: "text-violet-700 bg-violet-100/80 dark:text-violet-400 dark:bg-violet-900/30 border border-violet-200/50 dark:border-violet-800/30",
    desc: "Kinh ngạc trước sự vĩ đại của Thiên Chúa và không muốn làm Ngài buồn lòng.",
    example: "Ngắm hoàng hôn hay bầu trời sao và tự nhiên thốt lên: \"Lạy Chúa, Chúa thật kỳ diệu!\"",
  },
];



const HIGHLIGHTS = [
  { icon: Wind,     title: "Retreat tĩnh tâm",   desc: "Trước ngày lãnh Bí tích, toàn khối tham gia 1 ngày tĩnh tâm để gặp gỡ Chúa Thánh Thần." },
  { icon: Users,    title: "Nhóm đồng hành",     desc: "Mỗi em có 1 người đỡ đầu (Sponsor) đồng hành trong suốt hành trình đức tin." },
  { icon: BookOpen, title: "Nhật ký tâm linh",   desc: "Ghi lại hành trình đức tin qua nhật ký cá nhân — được chia sẻ tự nguyện trong nhóm nhỏ." },
  { icon: Shield,   title: "Dự án phục vụ",      desc: "Mỗi em thực hiện 1 dự án phục vụ cộng đoàn như bằng chứng của đức tin trưởng thành." },
];

const MOBILE_BREAKPOINT = 768;

export default function KhoiThemSuc() {
  const { heroRef, lenis, heroY, fadeUp, heroReveal, vp } = usePageMotion();

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-900 dark:bg-[#1C1917] dark:text-stone-50 antialiased overflow-x-hidden selection:bg-yellow-500/20 dark:selection:bg-yellow-500/30 transition-colors duration-500">

      <HeroSection
        heroRef={heroRef}
        heroY={heroY}
        fadeUp={heroReveal}
        lenis={lenis}
        sectionBgClass="bg-gradient-to-b from-white via-[#FDFBF7] to-[#FDFBF7] dark:from-[#1C1917] dark:via-[#191614] dark:to-[#191614]"
        glowClass="bg-yellow-500/5 dark:bg-yellow-500/10"
        eyebrowIcon={Flame}
        eyebrowLabel="Khối Thêm Sức"
        eyebrowClass="bg-yellow-100/80 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200/50 dark:border-yellow-800/30 shadow-sm"
        titleLine1="Nhận lãnh ngọn lửa"
        titleLine2="Chúa Thánh Thần"
        titleGradientClass="bg-gradient-to-r from-yellow-600 via-amber-600 to-orange-700 dark:from-yellow-400 dark:via-amber-400 dark:to-orange-400"
        description="Bí tích Thêm Sức là dấu ấn trưởng thành trong đức tin — khi Chúa Thánh Thần đổ đầy 7 ơn thiêng liêng để các em trở thành những chứng nhân dũng cảm của Tin Mừng."
        primaryCtaLabel="Xem chương trình học"
        primaryCtaTargetId="bay-on"
        primaryCtaClass="bg-yellow-600 hover:bg-yellow-500 dark:bg-yellow-600 dark:hover:bg-yellow-500 text-amber-950 dark:text-amber-50"
        secondaryCtaLabel="Đăng ký Nhập Học"
        secondaryCtaTo="/tuyển-sinh#dang-ky"
        image={{ src: "/images/khoithemsuc.avif", alt: "Khối Thêm Sức" }}
        imageGlowClass="bg-gradient-to-tr from-yellow-500/5 to-amber-500/5"
        floatBadge={{ label: "Lớp 5 – 6", sub: "Ngọn lửa chứng nhân", dotClass: "bg-yellow-500" }}
      />

      <OverviewCards items={OVERVIEW} accentBgClass="bg-yellow-100/50 dark:bg-yellow-900/20" accentTextClass="text-yellow-900 dark:text-yellow-400" accentBorderClass="border-yellow-900/10 dark:border-yellow-700/30" />

      {/* GIFTS BENTO GRID */}
      <KhoiThemSucGifts items={GIFTS} />

      {/* TRỤ CỘT LỘ TRÌNH */}
      <KhoiThemSucPillars />

      <HighlightsGrid
        items={HIGHLIGHTS}
        eyebrowLabel="Phương pháp giáo lý"
        title="Hơn cả một lớp học thông thường"
        accentTextClass="text-yellow-600 dark:text-yellow-400"
        accentIconClass="bg-yellow-100/80 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200/50 dark:border-yellow-800/30"
        cardClass="bg-white/80 dark:bg-[#1C1917]/80 backdrop-blur-xl border-amber-900/10 dark:border-amber-100/10"
      />

      <CtaSection
        icon={Flame}
        iconClass="text-yellow-500"
        title="Đón Nhận Ngọn Lửa Thiêng"
        description="Kính mời quý Phụ huynh đăng ký để con em được đào tạo, chuẩn bị chu đáo tâm hồn cho Bí tích Thêm Sức — bước tiến thành nhân kiên định trên hành trình sống đạo."
        primaryCtaLabel="Đăng ký trực tuyến"
        primaryCtaTo="/tuyển-sinh#dang-ky"
        primaryCtaClass="bg-yellow-600 text-amber-950 dark:bg-yellow-500 dark:text-amber-950 hover:bg-yellow-500 shadow-sm"
        secondaryCtaLabel="Liên hệ Văn phòng"
        secondaryCtaTo="/liên-hệ"
      />
    </div>
  );
}