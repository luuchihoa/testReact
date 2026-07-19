import React from "react";
import { BookOpen, Scroll, Map, Layers, Flame, Users, Clock, CalendarDays } from "lucide-react";
import { usePageMotion } from "../hooks/usePageMotion.js";
import HeroSection from "../features/khoi/HeroSection.jsx";
import OverviewCards from "../features/khoi/OverviewCards.jsx";
import HighlightsGrid from "../features/khoi/HighlightsGrid.jsx";
import CtaSection from "../features/khoi/CtaSection.jsx";
import KhoiKinhThanhTestament from "../features/khoi/KhoiKinhThanhTestament.jsx";

// Hằng số Easing chuyển động chuẩn hệ thống Apple HIG
const APPLE_EASE = [0.16, 1, 0.3, 1];

const OVERVIEW = [
  { icon: Users,        label: "Độ tuổi",    value: "13 – 14 tuổi" },
  { icon: Clock,        label: "Thời lượng", value: "45 phút / buổi" },
  { icon: CalendarDays, label: "Lịch học",   value: "Chủ Nhật sau Lễ" },
  { icon: BookOpen,     label: "Giáo trình", value: "Kinh Thánh trọn bộ" },
];

const TESTAMENT = [
  {
    id: "cuu-uoc",
    name: "Cựu Ước",
    icon: "📜",
    count: "46 Quyển",
    // Đồng bộ Glassmorphism & Hover states[cite: 16]
    color: "bg-white/90 dark:bg-[#1C1917]/90 backdrop-blur-xl border-amber-900/10 dark:border-amber-100/10 md:hover:border-red-500/40 dark:md:hover:border-red-500/40 shadow-sm",
    badge: "text-red-700 bg-red-100/80 dark:text-red-400 dark:bg-red-900/30 border border-red-200/50 dark:border-red-800/30",
    iconBg: "bg-red-100/80 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200/50 dark:border-red-800/30",
    dot: "bg-red-500 shadow-sm",
    desc: "Hành trình từ tạo dựng đến lời hứa cứu độ — giao ước giữa Thiên Chúa và dân Người qua các thời đại.",
    books: [
      { group: "Ngũ Thư", items: ["Sáng Thế (St)", "Xuất Hành (Xh)", "Lêvi (Lv)", "Dân Số (Ds)", "Đệ Nhị Luật (Đnl)"] },
      { group: "Lịch Sử", items: [
        "Giôsuê (Gs)", "Thủ Lãnh (Tl)", "Rút (R)", "1 Sa-mu-en (1 Sm)",
        "2 Sa-mu-en (2 Sm)", "1 Các Vua (1 V)", "2 Các Vua (2 V)", "1 Sử Biên Niên (1 Sb)",
        "2 Sử Biên Niên (2 Sb)", "Ét-ra (Er)", "Nơ-khe-mi-a (Nkm)", "Tô-bi-a (Tb)",
        "Giu-đi-tha (Gđt)", "Ét-te (Et)", "1 Ma-ca-bê (1 Mcb)", "2 Ma-ca-bê (2 Mcb)"
      ] },
      { group: "Huấn Ca", items: ["Gióp (G)", "Thánh Vịnh (Tv)", "Châm Ngôn (Cn)", "Giảng Viên (Gv)", "Diễm Ca (Dc)", "Khôn Ngoan (Kn)", "Huấn Ca (Hc)"] },
      { group: "Ngôn Sứ", items: [
        "I-sai-a (Is)", "Giê-rê-mi-a (Gr)", "Ai Ca (Ac)", "Ba-rúc (Ba)",
        "Ê-dê-ki-en (Ed)", "Đa-ni-en (Đn)", "Hô-sê (Hs)", "Giô-en (Ge)",
        "A-mốt (Am)", "Ô-va-đi-a (Ôv)", "Giô-na (Gn)", "Mi-kha (Mk)",
        "Na-khum (Na)", "Kha-ba-cúc (Kb)", "Xô-phô-ni-a (Xp)", "Khác-gai (Kg)",
        "Da-ca-ri-a (Dcr)", "Ma-la-khi (Ml)"
      ] },
    ],
  },
  {
    id: "tan-uoc",
    name: "Tân Ước",
    icon: "✝️",
    count: "27 Quyển",
    color: "bg-white/90 dark:bg-[#1C1917]/90 backdrop-blur-xl border-amber-900/10 dark:border-amber-100/10 md:hover:border-rose-500/40 dark:md:hover:border-rose-500/40 shadow-sm",
    badge: "text-rose-700 bg-rose-100/80 dark:text-rose-400 dark:bg-rose-900/30 border border-rose-200/50 dark:border-rose-800/30",
    iconBg: "bg-rose-100/80 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border border-rose-200/50 dark:border-rose-800/30",
    dot: "bg-rose-500 shadow-sm",
    desc: "Tin Mừng Đức Giêsu Kitô — Ngôi Lời nhập thể, chịu chết và phục sinh để cứu chuộc nhân loại.",
    books: [
      { group: "Tin Mừng", items: ["Mát-thêu (Mt)", "Mác-cô (Mc)", "Lu-ca (Lc)", "Gio-an (Ga)"] },
      { group: "Tông Đồ Công Vụ", items: ["Tông Đồ Công Vụ (Cv)"] },
      { group: "Thư Thánh Phao-lô", items: [
        "Rô-ma (Rm)", "1 Cô-rin-tô (1 Cr)", "2 Cô-rin-tô (2 Cr)", "Ga-lát (Gl)",
        "Ê-phê-sô (Ep)", "Phi-líp-phê (Pl)", "Cô-lô-sê (Cl)", "1 Thê-xa-lô-ni-ca (1 Tx)",
        "2 Thê-xa-lô-ni-ca (2 Tx)", "1 Ti-mô-thê (1 Tm)", "2 Ti-mô-thê (2 Tm)", "Ti-tô (Tt)",
        "Phi-lê-môn (Plm)", "Híp-ri (Dt)"
      ] },
      { group: "Thư Chung & Khải Huyền", items: [
        "Gia-cô-bê (Gc)", "1 Phê-rô (1 P)", "2 Phê-rô (2 P)", "1 Gio-an (1 Ga)",
        "2 Gio-an (2 Ga)", "3 Gio-an (3 Ga)", "Giu-đa (Gđ)", "Khải Huyền (Kh)"
      ] },
    ],
  },
];

const METHODS = [
  { icon: Map,      title: "Bản đồ Kinh Thánh",      desc: "Học qua bản đồ địa lý Thánh Kinh — các em nhìn thấy hành trình của dân Chúa bằng mắt." },
  { icon: Scroll,   title: "Kể chuyện sáng tạo",     desc: "Đóng vai, vẽ tranh hoặc viết tiếp câu chuyện từ góc nhìn của một nhân vật." },
  { icon: Layers,   title: "Kinh Thánh & cuộc sống", desc: "Mỗi câu chuyện gắn với 1 tình huống thực tế — giúp áp dụng Lời Chúa vào đời thường." },
  { icon: BookOpen, title: "Ghi nhớ Lời Chúa",       desc: "Học thuộc lòng một câu Kinh Thánh mỗi buổi — tạo kho tàng Lời Chúa trong trí nhớ." },
];

const MOBILE_BREAKPOINT = 768;

export default function KhoiKinhThanh() {
  const { heroRef, lenis, heroY, heroReveal } = usePageMotion();

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-900 dark:bg-[#1C1917] dark:text-stone-50 antialiased overflow-x-hidden selection:bg-red-500/20 dark:selection:bg-red-500/30 transition-colors duration-500">

      <HeroSection
        heroRef={heroRef}
        heroY={heroY}
        fadeUp={heroReveal}
        lenis={lenis}
        sectionBgClass="bg-gradient-to-b from-white via-[#FDFBF7] to-[#FDFBF7] dark:from-[#1C1917] dark:via-[#191614] dark:to-[#191614]"
        glowClass="bg-red-500/5 dark:bg-red-500/10"
        eyebrowIcon={BookOpen}
        eyebrowLabel="Khối Kinh Thánh"
        eyebrowClass="bg-red-100/80 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200/50 dark:border-red-800/30 shadow-sm"
        titleLine1="Lời Chúa —"
        titleLine2="nền tảng đức tin"
        titleGradientClass="bg-gradient-to-r from-red-600 via-rose-600 to-red-800 dark:from-red-400 dark:via-rose-400 dark:to-red-300"
        description="Kinh Thánh không chỉ là một cuốn sách cổ — đó là thư tình Thiên Chúa gửi cho con người qua mọi thời đại. Khối Kinh Thánh dẫn các em vào hành trình khám phá 73 quyển sách thiêng liêng đầy sống động."
        primaryCtaLabel="Xem chương trình học"
        primaryCtaTargetId="noi-dung"
        // Chỉnh màu nút bấm theo Theme Khối
        primaryCtaClass="bg-red-600 md:hover:bg-red-500 dark:bg-red-500 dark:hover:bg-red-400"
        secondaryCtaLabel="Đăng ký Nhập Học"
        secondaryCtaTo="/tuyển-sinh#dang-ky"
        image={{ src: "/images/khoikinhthanh.avif", alt: "Khối Kinh Thánh" }}
        imageGlowClass="bg-gradient-to-tr from-red-500/5 to-rose-500/5"
        floatBadge={{ label: "Lớp 8 – 9", sub: "Thấu hiểu Lời Chúa", dotClass: "bg-red-500" }}
      />

      <OverviewCards items={OVERVIEW} accentBgClass="bg-red-100/50 dark:bg-red-900/20" accentTextClass="text-red-900 dark:text-red-400" accentBorderClass="border-red-900/10 dark:border-red-700/30" />

      {/* TESTAMENT BENTO GRID */}
      <KhoiKinhThanhTestament items={TESTAMENT} />

      <HighlightsGrid
        items={METHODS}
        eyebrowLabel="Phương pháp giáo lý"
        title="Kinh Thánh sống động, không khô khan"
        accentTextClass="text-red-600 dark:text-red-400"
        accentIconClass="bg-red-100/80 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200/50 dark:border-red-800/30"
        cardClass="bg-white/80 dark:bg-[#1C1917]/80 backdrop-blur-xl border-amber-900/10 dark:border-amber-100/10"
      />

      <CtaSection
        icon={BookOpen}
        iconClass="text-red-600 dark:text-red-400"
        title="Mở Trang Kinh Thánh Cùng Con"
        description="Kính mời quý Phụ huynh đăng ký để con em bước vào hành trình khám phá Lời Chúa — nền tảng vững chắc nhất cho một đời sống đức tin trường tồn."
        primaryCtaLabel="Đăng ký trực tuyến"
        primaryCtaTo="/tuyển-sinh#dang-ky"
        primaryCtaClass="bg-red-600 text-white md:hover:bg-red-500 shadow-sm"
        secondaryCtaLabel="Liên hệ Văn phòng"
        secondaryCtaTo="/liên-hệ"
      />
    </div>
  );
}