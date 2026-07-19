import React from "react";
import { Star, BookOpen, MessageSquare, ShieldCheck, Clock, CalendarDays, Users, Sparkles } from "lucide-react";
import { usePageMotion } from "../hooks/usePageMotion.js";
import HeroSection from "../features/khoi/HeroSection.jsx";
import OverviewCards from "../features/khoi/OverviewCards.jsx";
import HighlightsGrid from "../features/khoi/HighlightsGrid.jsx";
import CtaSection from "../features/khoi/CtaSection.jsx";
import KhoiRuocLeJourney from "../features/khoi/KhoiRuocLeJourney.jsx";
import KhoiRuocLeParents from "../features/khoi/KhoiRuocLeParents.jsx";

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



const MOBILE_BREAKPOINT = 768;

export default function KhoiRuocLe() {
  const { heroRef, lenis, heroY, heroReveal } = usePageMotion();

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-900 dark:bg-[#1C1917] dark:text-stone-50 antialiased overflow-x-hidden selection:bg-lime-500/20 dark:selection:bg-lime-500/30 transition-colors duration-500">

      <HeroSection
        heroRef={heroRef}
        heroY={heroY}
        fadeUp={heroReveal}
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

      <OverviewCards items={OVERVIEW} accentBgClass="bg-lime-100/50 dark:bg-lime-900/20" accentTextClass="text-lime-900 dark:text-lime-400" accentBorderClass="border-lime-900/10 dark:border-lime-700/30" />

      {/* JOURNEY BENTO GRID */}
      <KhoiRuocLeJourney items={JOURNEY} />

      <KhoiRuocLeParents />

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
      />
    </div>
  );
}