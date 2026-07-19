import {
  Heart, Music, Palette, Users, BookOpen, Clock,
  CalendarDays, Star, GraduationCap
} from "lucide-react";
import { usePageMotion } from "../hooks/usePageMotion.js";
import HeroSection from "../features/khoi/HeroSection.jsx";
import OverviewCards from "../features/khoi/OverviewCards.jsx";
import HighlightsGrid from "../features/khoi/HighlightsGrid.jsx";
import CtaSection from "../features/khoi/CtaSection.jsx";
import QuoteSlider from "../features/khoi/QuoteSlider.jsx";
import KhoiChienConJourney from "../features/khoi/KhoiChienConJourney.jsx";
import KhoiChienConTimeline from "../features/khoi/KhoiChienConTimeline.jsx";
import FloatingParticles from "../features/khoi/FloatingParticles.jsx";


const OVERVIEW = [
  { icon: Users,         label: "Độ tuổi",    value: "6 - 7 tuổi" },
  { icon: Clock,         label: "Thời lượng", value: "45 phút / buổi" },
  { icon: CalendarDays,  label: "Lịch học",   value: "Chúa Nhật" },
  { icon: GraduationCap, label: "Sĩ số",      value: "20 em / lớp" },
];

// BENTO GRID (Flip Cards) thay cho Syllabus khô khan
const CHUONG_TRINH = [
  {
    icon: Heart,
    title: "Học Kỳ 1",
    subtitle: "Thiên Chúa yêu con",
    color: "bg-pink-50/80 dark:bg-[#1C1917]/90 backdrop-blur-xl border-pink-200/60 dark:border-pink-900/30",
    iconBg: "bg-pink-100 text-pink-500 border border-pink-200/50",
    dot: "bg-pink-500 shadow-sm",
    topics: [
      "Thiên Chúa yêu thương tôi",
      "Chúa Giêsu — người bạn tốt nhất",
      "Gia đình là quà tặng của Chúa",
      "Cầu nguyện cùng Chúa mỗi ngày",
      "Bài hát Kinh Lạy Cha & Kinh Kính Mừng",
    ],
  },
  {
    icon: Star,
    title: "Học Kỳ 2",
    subtitle: "Khám phá Lời Chúa",
    color: "bg-amber-50/80 dark:bg-[#1C1917]/90 backdrop-blur-xl border-amber-200/60 dark:border-amber-900/30",
    iconBg: "bg-amber-100 text-amber-500 border border-amber-200/50",
    dot: "bg-amber-500 shadow-sm",
    topics: [
      "Thánh Kinh kể chuyện — Ông Nô-ê",
      "Thánh Kinh kể chuyện — Chúa Giêsu Giáng Sinh",
      "Chủ Nhật — Ngày của Chúa",
      "Yêu thương và chia sẻ",
      "Nghi thức Bí tích Rửa Tội (cơ bản)",
    ],
  },
];

const HIGHLIGHTS = [
  {
    icon: Music,
    title: "Học qua bài hát",
    desc: "Mỗi chủ đề gắn với 1–2 bài hát đơn giản, giúp các em nhớ lâu và cảm nhận đức tin qua giai điệu.",
  },
  {
    icon: Palette,
    title: "Hoạt động thủ công",
    desc: "Tô màu tranh Kinh Thánh, xếp giấy, làm thiệp — học qua đôi tay và trí tưởng tượng.",
  },
  {
    icon: BookOpen,
    title: "Kể chuyện Kinh Thánh",
    desc: "Các câu chuyện được kể bằng hình ảnh trực quan, búp bê và tranh minh họa sống động.",
  },
  {
    icon: Heart,
    title: "Môi trường yêu thương",
    desc: "Lớp học nhỏ (≤20 em), giáo lý viên được đào tạo chuyên biệt về tâm lý trẻ mầm non.",
  },
];

const QUOTES = [
  { text: "Cứ để trẻ nhỏ đến với Thầy, đừng ngăn cấm chúng, vì Nước Trời là của những ai giống như chúng.", src: "Mt 19,14" },
  { text: "Tôi là Mục Tử nhân lành, Tôi biết chiên của Tôi và chiên của Tôi biết Tôi.", src: "Ga 10,14" },
  { text: "Hãy để ánh sáng nhỏ của con chiếu soi trước mặt mọi người.", src: "Mt 5,16" },
  { text: "Ai tiếp đón một em nhỏ như em này vì danh Thầy, là tiếp đón chính Thầy.", src: "Mt 18,5" },
  { text: "Chúa chăn dắt tôi, tôi chẳng thiếu thốn gì.", src: "Tv 23,1" },
];

export default function KhoiChienCon() {
  const { heroRef, lenis, heroY, heroReveal } = usePageMotion();

  return (
    // Đồng bộ mã màu nền tổng thể giống hệ thống quản trị
    <div className="min-h-screen bg-[#FDFBF7] text-stone-900 dark:bg-[#1C1917] dark:text-stone-50 antialiased overflow-x-hidden selection:bg-pink-500/20 dark:selection:bg-pink-500/30 transition-colors duration-500">

      <HeroSection
        heroRef={heroRef}
        heroY={heroY}
        fadeUp={heroReveal}
        lenis={lenis}
        glowClass="bg-pink-500/5 dark:bg-pink-500/10"
        eyebrowIcon={Heart}
        eyebrowLabel="Khối Chiên Con"
        // Đồng bộ Pill Badge
        eyebrowClass="bg-pink-100/80 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400 border border-pink-200/50 dark:border-pink-800/30 shadow-sm"
        titleLine1="Hạt giống"
        titleLine2="đức tin đầu đời"
        titleGradientClass="bg-gradient-to-r from-pink-600 via-rose-600 to-red-600 dark:from-pink-400 dark:via-rose-400 dark:to-red-400"
        description="Giai đoạn mầm non đến lớp 2 là thời điểm vàng để gieo vào tâm hồn trẻ thơ tình yêu với Thiên Chúa — qua những câu chuyện, bài hát và hoạt động sáng tạo phù hợp lứa tuổi."
        primaryCtaLabel="Xem chương trình học"
        primaryCtaTargetId="chuong-trinh"
        primaryCtaClass="bg-pink-600 md:hover:bg-pink-500 dark:bg-pink-500 dark:hover:bg-pink-400"
        secondaryCtaLabel="Đăng ký cho bé"
        secondaryCtaTo="/tuyển-sinh#dang-ky"
        image={{ src: "/images/khoichiencon.avif", alt: "Khối Chiên Con" }}
        imageGlowClass="bg-gradient-to-tr from-pink-500/5 to-rose-500/5"
        floatBadge={{ label: "Mầm non – Lớp 2", sub: "Ươm mầm đức tin", dotClass: "bg-pink-500" }}
      >
        <FloatingParticles />
      </HeroSection>

      <OverviewCards items={OVERVIEW} accentBgClass="bg-pink-100/50 dark:bg-pink-900/20" accentTextClass="text-pink-900 dark:text-pink-400" accentBorderClass="border-pink-900/10 dark:border-pink-700/30" />

      <KhoiChienConJourney items={CHUONG_TRINH} />
      
      <KhoiChienConTimeline />

      <HighlightsGrid
        items={HIGHLIGHTS}
        title="Học mà chơi, chơi mà học"
        accentTextClass="text-pink-600 dark:text-pink-400"
        accentIconClass="bg-pink-100/80 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400 border-pink-200/50 dark:border-pink-800/30"
      />

      <section className="py-20 relative overflow-hidden flex items-center justify-center z-10">
        <div className="absolute inset-0 bg-stone-100 dark:bg-stone-900/30 -z-10" />
        <QuoteSlider quotes={QUOTES} accentTextClass="text-pink-800/60 dark:text-pink-400/60" />
      </section>

      <CtaSection
        icon={Heart}
        iconClass="text-pink-500"
        title="Sẵn sàng gửi bé yêu?"
        description="Hãy đăng ký ngay để bé được tham gia môi trường đức tin yêu thương — nơi mỗi Chủ Nhật trở thành một cuộc phiêu lưu lý thú cùng Chúa Giêsu."
        primaryCtaLabel="Đăng ký trực tuyến"
        primaryCtaTo="/tuyển-sinh#dang-ky"
        primaryCtaClass="bg-pink-600 text-white md:hover:bg-pink-500 shadow-sm"
        secondaryCtaLabel="Liên hệ Văn phòng"
        secondaryCtaTo="/liên-hệ"
      />
    </div>
  );
}