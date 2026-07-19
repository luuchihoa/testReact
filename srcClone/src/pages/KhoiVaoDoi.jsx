import React from "react";
import { Globe, Compass, Users, MessageSquare, Lightbulb, Heart, Clock, CalendarDays, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { useKhoiMotion } from "../hooks/useKhoiMotion.js";
import HeroSection from "../features/khoi/HeroSection.jsx";
import OverviewCards from "../features/khoi/OverviewCards.jsx";
import HighlightsGrid from "../features/khoi/HighlightsGrid.jsx";
import CtaSection from "../features/khoi/CtaSection.jsx";
import QuoteSlider from "../features/khoi/QuoteSlider.jsx";

// Hằng số Easing chuyển động chuẩn hệ thống Apple HIG
const APPLE_EASE = [0.16, 1, 0.3, 1];

const OVERVIEW = [
  { icon: Users,        label: "Độ tuổi",    value: "15 – 16 tuổi" },
  { icon: Clock,        label: "Thời lượng", value: "45 phút / buổi" },
  { icon: CalendarDays, label: "Lịch học",   value: "Chúa Nhật sau Lễ" },
  { icon: ShieldCheck,  label: "Yêu cầu",    value: "Đã Khai tâm" },
];

const PILLARS = [
  {
    icon: Globe,
    title: "Đức tin & Văn hoá",
    color: "bg-white/90 dark:bg-[#1C1917]/90 backdrop-blur-xl border-amber-900/10 dark:border-amber-100/10 md:hover:border-blue-500/40 dark:md:hover:border-blue-500/40 shadow-sm",
    iconBg: "bg-blue-100/80 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800/30 shadow-sm",
    dot: "bg-blue-500 shadow-sm",
    topics: ["Giáo Hội trong thế giới hiện đại (Gaudium et Spes)", "Đức tin trước thách đố khoa học & công nghệ", "Giá trị Kitô giáo trong môi trường đại học & công sở", "Phân định ơn gọi — gia đình và tu trì"],
  },
  {
    icon: Heart,
    title: "Xã hội & Công bằng",
    color: "bg-white/90 dark:bg-[#1C1917]/90 backdrop-blur-xl border-amber-900/10 dark:border-amber-100/10 md:hover:border-rose-500/40 dark:md:hover:border-rose-500/40 shadow-sm",
    iconBg: "bg-rose-100/80 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border border-rose-200/50 dark:border-rose-800/30 shadow-sm",
    dot: "bg-rose-500 shadow-sm",
    topics: ["Học thuyết xã hội Công giáo — nền tảng và ứng dụng", "Phẩm giá con người & nhân quyền", "Bảo vệ môi trường — tiếng gọi từ Laudato Si'", "Tình liên đới và phục vụ người nghèo"],
  },
  {
    icon: Compass,
    title: "Sứ mạng & Chứng nhân",
    color: "bg-white/90 dark:bg-[#1C1917]/90 backdrop-blur-xl border-amber-900/10 dark:border-amber-100/10 md:hover:border-emerald-500/40 dark:md:hover:border-emerald-500/40 shadow-sm",
    iconBg: "bg-emerald-100/80 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/30 shadow-sm",
    dot: "bg-emerald-500 shadow-sm",
    topics: ["Loan báo Tin Mừng trong bối cảnh Việt Nam", "Mạng xã hội — không gian truyền giáo mới", "Xây dựng cộng đoàn tươi trẻ và sống động", "Gương sáng — các Thánh tử đạo Việt Nam"],
  },
];

const HIGHLIGHTS = [
  { icon: MessageSquare, title: "Thảo luận mở",        desc: "Không có câu trả lời sẵn — cùng nhau đặt câu hỏi, tìm kiếm và đối thoại trong tinh thần đức tin." },
  { icon: Lightbulb,     title: "Diễn giả khách mời",  desc: "Gặp gỡ chuyên gia, linh mục, tu sĩ hoặc giáo dân gương mẫu chia sẻ hành trình sống đạo." },
  { icon: Heart,         title: "Phục vụ thực tế",     desc: "Tham gia các hoạt động bác ái, tình nguyện xã hội như một phần bắt buộc của chương trình." },
  { icon: Globe,         title: "Tài liệu chuyên sâu", desc: "Tiếp cận các văn kiện Giáo Hội, tác phẩm thần học và tài liệu giáo lý hiện đại." },
];

const QUOTES = [
  { text: "Bất cứ làm việc gì, hãy làm tận tâm như làm cho Chúa, chứ không phải cho người phàm.", src: "Cl 3,23" },
  { text: "Người trẻ thân mến, đừng nhìn cuộc sống từ trên ban công. Hãy dấn thân vào nơi mà các thách đố đang gọi mời.", src: "ĐTC Phanxicô" },
  { text: "Anh em phải khôn ngoan như rắn và đơn sơ như bồ câu.", src: "Mt 10,16" },
  { text: "Các con là 'hiện tại' của Thiên Chúa, chứ không phải chỉ là một tương lai xa vời.", src: "Christus Vivit" },
  { text: "Ai trung tín trong việc rất nhỏ, thì cũng trung tín trong việc lớn.", src: "Lc 16,10" },
  { text: "Đừng để cho sự ác thắng được mình, nhưng hãy lấy thiện mà thắng ác.", src: "Rm 12,21" },
  { text: "Người trẻ ơi, Ta nói với anh: hãy trỗi dậy!", src: "Lc 7,14" },
];

export default function KhoiVaoDoi() {
  const { heroRef, lenis, mc, heroY, fadeUp, vp } = useKhoiMotion();

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-900 dark:bg-[#1C1917] dark:text-stone-50 antialiased overflow-x-hidden selection:bg-blue-500/20 dark:selection:bg-blue-500/30 transition-colors duration-500">

      <HeroSection
        heroRef={heroRef}
        heroY={heroY}
        fadeUp={fadeUp}
        lenis={lenis}
        sectionBgClass="bg-gradient-to-b from-white via-[#FDFBF7] to-[#FDFBF7] dark:from-[#1C1917] dark:via-[#191614] dark:to-[#191614]"
        glowClass="bg-blue-500/5 dark:bg-blue-500/10"
        eyebrowIcon={Globe}
        eyebrowLabel="Khối Vào Đời"
        eyebrowClass="bg-blue-100/80 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800/30 shadow-sm"
        titleLine1="Sống đức tin"
        titleLine2="giữa lòng đời"
        titleGradientClass="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400"
        description="Đồng hành cùng các bạn trẻ bước vào đại học, công sở và xã hội — trang bị hành trang đức tin để trở thành những chứng nhân Tin Mừng trong thế giới hiện đại."
        primaryCtaLabel="Xem chương trình học"
        primaryCtaTargetId="noi-dung"
        primaryCtaClass="bg-blue-600 text-white hover:bg-blue-500 dark:bg-blue-600 dark:hover:bg-blue-500 shadow-sm"
        secondaryCtaLabel="Tham gia Giới Trẻ"
        secondaryCtaTo="/giới-trẻ-công-giáo"
        image={{ src: "/images/khoivaodoi.avif", alt: "Khối Vào Đời" }}
        imageGlowClass="bg-gradient-to-tr from-blue-500/5 to-purple-500/5"
        floatBadge={{ label: "Lớp 10 – 11", sub: "Hành trang dấn thân", dotClass: "bg-blue-500" }}
      />

      <OverviewCards items={OVERVIEW} />

      {/* PILLARS SECTION */}
      <section id="noi-dung" className="py-20 sm:py-24 max-w-6xl mx-auto px-4 sm:px-6 scroll-mt-12 relative z-20">
        <div className="max-w-2xl text-left space-y-3 mb-12 sm:mb-16">
          <p className="text-[11px] font-bold tracking-widest uppercase text-blue-600 dark:text-blue-400 ml-1">Trọng tâm đào tạo</p>
          <h2 className="text-[28px] sm:text-[36px] md:text-[40px] font-extrabold font-serif tracking-tight text-amber-950 dark:text-amber-50 leading-tight">Ba trụ cột của người Kitô hữu trưởng thành</h2>
          <p className="text-[14px] sm:text-[15.5px] font-medium text-stone-500 dark:text-stone-400 leading-relaxed max-w-xl">
            Mỗi học kỳ đi sâu vào một trụ cột, xoay vòng qua các năm để đảm bảo sự toàn diện trong hành trình đức tin trưởng thành.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
          {PILLARS.map((pillar, i) => { 
            const Icon = pillar.icon; 
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: mc.yOffset }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={vp}
                transition={{ duration: 0.5, delay: i * 0.1, ease: APPLE_EASE }}
                className={`rounded-[24px] sm:rounded-[32px] border p-6 sm:p-8 flex flex-col transition-all duration-300 md:hover:shadow-lg ${pillar.color}`}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${pillar.iconBg}`}>
                    <Icon className="w-6 h-6" strokeWidth={2.5} />
                  </div>
                  <h3 className="text-[20px] sm:text-[22px] font-extrabold font-serif text-amber-950 dark:text-amber-50 leading-snug">
                    {pillar.title}
                  </h3>
                </div>

                <ul className="space-y-4 flex-1">
                  {pillar.topics.map((topic, j) => (
                    <li key={j} className="flex items-start gap-3.5 text-[14.5px] text-stone-600 dark:text-stone-300 font-medium leading-relaxed">
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-2 ${pillar.dot} shadow-sm`} />
                      <span>{topic}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ); 
          })}
        </div>
      </section>

      {/* QUOTES WIDGET SECTION */}
      <section className="py-20 relative overflow-hidden flex items-center justify-center z-10 border-y border-amber-900/5 dark:border-amber-100/5 bg-stone-50/50 dark:bg-[#1C1917]/50">
        <QuoteSlider quotes={QUOTES} />
      </section>

      <HighlightsGrid
        items={HIGHLIGHTS}
        eyebrowLabel="Phương pháp tiếp cận"
        title="Học để sống, không chỉ để biết"
        accentTextClass="text-blue-600 dark:text-blue-400"
        accentIconClass="bg-blue-100/80 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800/30 shadow-sm"
        cardClass="bg-white/80 dark:bg-[#1C1917]/80 backdrop-blur-xl border-amber-900/10 dark:border-amber-100/10"
        sectionClassName="py-20 relative z-10"
        mc={mc}
        vp={vp}
      />

      <CtaSection
        icon={Globe}
        iconClass="text-blue-500"
        title="Sẵn sàng bước ra?"
        description="Gia nhập cộng đoàn thanh niên đức tin — nơi bạn không bước vào đời một mình, mà có Chúa và cả một cộng đoàn cùng đồng hành."
        primaryCtaLabel="Tham gia ngay"
        primaryCtaTo="/giới-trẻ-công-giáo"
        primaryCtaClass="bg-blue-600 hover:bg-blue-500 text-white shadow-sm"
        secondaryCtaLabel="Liên hệ Văn phòng"
        secondaryCtaTo="/liên-hệ"
        mc={mc}
        vp={vp}
        sectionClassName="pt-20 pb-32 max-w-3xl mx-auto px-4 sm:px-6 text-center border-t border-amber-900/5 dark:border-amber-100/5 relative z-10"
      />
    </div>
  );
}