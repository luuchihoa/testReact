import { Globe, Compass, Users, MessageSquare, Lightbulb, Heart, Clock, CalendarDays, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { useKhoiMotion } from "../hooks/useKhoiMotion.js";
import HeroSection from "./khoi/HeroSection.jsx";
import OverviewCards from "./khoi/OverviewCards.jsx";
import HighlightsGrid from "./khoi/HighlightsGrid.jsx";
import CtaSection from "./khoi/CtaSection.jsx";
import QuoteSlider from "./khoi/QuoteSlider.jsx";

const OVERVIEW = [
  { icon: Users,        label: "Độ tuổi",    value: "Từ 16 tuổi trở lên" },
  { icon: Clock,        label: "Thời lượng", value: "45 phút / buổi" },
  { icon: CalendarDays, label: "Lịch học",   value: "Chúa Nhật sau Thánh lễ" },
  { icon: ShieldCheck,  label: "Yêu cầu",    value: "Đã lãnh Bí tích Khai tâm" },
];

// Pillar cards — đặc thù khối này (3 trụ cột với danh sách chủ đề riêng), giữ nguyên inline
// vì phức tạp hơn list thường, tương tự JOURNEY của KhoiRuocLe.
const PILLARS = [
  {
    icon: Globe,
    title: "Đức tin & Văn hoá",
    color: "bg-white dark:bg-stone-900 border-stone-200/60 dark:border-stone-800/80 hover:border-blue-500/50 dark:hover:border-blue-500/50",
    iconBg: "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400",
    dot: "bg-blue-500",
    topics: ["Giáo Hội trong thế giới hiện đại (Gaudium et Spes)", "Đức tin trước thách đố khoa học & công nghệ", "Giá trị Kitô giáo trong môi trường đại học & công sở", "Phân định ơn gọi — gia đình và tu trì"],
  },
  {
    icon: Heart,
    title: "Xã hội & Công bằng",
    color: "bg-white dark:bg-stone-900 border-stone-200/60 dark:border-stone-800/80 hover:border-rose-500/50 dark:hover:border-rose-500/50",
    iconBg: "bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400",
    dot: "bg-rose-500",
    topics: ["Học thuyết xã hội Công giáo — nền tảng và ứng dụng", "Phẩm giá con người & nhân quyền", "Bảo vệ môi trường — tiếng gọi từ Laudato Si'", "Tình liên đới và phục vụ người nghèo"],
  },
  {
    icon: Compass,
    title: "Sứ mạng & Chứng nhân",
    color: "bg-white dark:bg-stone-900 border-stone-200/60 dark:border-stone-800/80 hover:border-emerald-500/50 dark:hover:border-emerald-500/50",
    iconBg: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400",
    dot: "bg-emerald-500",
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
  { text: "Các con là 'hiện tại' của Thiên Chúa, chứ không phải chỉ là một tương lai xa vời.", src: "Tông huấn Christus Vivit" },
  { text: "Ai trung tín trong việc rất nhỏ, thì cũng trung tín trong việc lớn.", src: "Lc 16,10" },
  { text: "Đừng để cho sự ác thắng được mình, nhưng hãy lấy thiện mà thắng ác.", src: "Rm 12,21" },
  { text: "Người trẻ ơi, Ta nói với anh: hãy trỗi dậy!", src: "Lc 7,14" },
];

export default function KhoiVaoDoi() {
  const { heroRef, lenis, mc, heroY, fadeUp, vp } = useKhoiMotion();

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-stone-900 dark:bg-[#09090b] dark:text-stone-50 antialiased overflow-x-hidden selection:bg-blue-500/20 dark:selection:bg-blue-500/30 transition-colors duration-500">

      <HeroSection
        heroRef={heroRef}
        heroY={heroY}
        fadeUp={fadeUp}
        lenis={lenis}
        sectionBgClass="bg-gradient-to-b from-white via-[#f5f5f7] to-transparent dark:from-stone-900 dark:via-[#09090b]"
        glowClass="bg-blue-500/5 dark:bg-blue-500/10"
        eyebrowIcon={Globe}
        eyebrowLabel="Khối Vào Đời"
        eyebrowClass="bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 border border-blue-500/20 dark:border-blue-500/30 shadow-sm"
        titleLine1="Sống đức tin"
        titleLine2="giữa lòng đời"
        titleGradientClass="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400"
        description="Đồng hành cùng các bạn trẻ bước vào đại học, công sở và xã hội — trang bị hành trang đức tin để trở thành những chứng nhân Tin Mừng trong thế giới hiện đại."
        primaryCtaLabel="Xem chương trình học"
        primaryCtaTargetId="noi-dung"
        secondaryCtaLabel="Tham gia Giới Trẻ"
        secondaryCtaTo="/giới-trẻ-công-giáo"
        image={{ src: "/images/khoivaodoi.avif", alt: "Khối Vào Đời" }}
        imageGlowClass="bg-gradient-to-tr from-blue-500/5 to-purple-500/5"
        floatBadge={{ label: "Lớp 10 – 11", sub: "Hành trang dấn thân", dotClass: "bg-blue-500" }}
      />

      <OverviewCards items={OVERVIEW} />

      {/* PILLARS SECTION — đặc thù khối này, giữ nguyên vì phức tạp hơn list thường */}
      <section id="noi-dung" className="py-24 max-w-6xl mx-auto px-6 scroll-mt-12 relative z-20">
        <div className="max-w-2xl text-left space-y-3 mb-16">
          <p className="text-[11px] font-bold tracking-widest uppercase text-blue-600 dark:text-blue-400">Trọng tâm đào tạo</p>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight inline-block px-1 -mx-1">Ba trụ cột của người Kitô hữu trưởng thành</h2>
          <p className="text-stone-500 dark:text-stone-400 text-sm leading-relaxed inline-block px-1 -mx-1">
            Mỗi học kỳ đi sâu vào một trụ cột, xoay vòng qua các năm để đảm bảo sự toàn diện trong hành trình đức tin trưởng thành.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {PILLARS.map((pillar, i) => { const Icon = pillar.icon; return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: mc.yOffset }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={vp}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className={`rounded-[1.75rem] border p-6 flex flex-col transition-all duration-300 ${pillar.color}`}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${pillar.iconBg}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-extrabold text-stone-900 dark:text-stone-100">{pillar.title}</h3>
              </div>

              <ul className="space-y-4 flex-1">
                {pillar.topics.map((topic, j) => (
                  <li key={j} className="flex items-start gap-3 text-sm text-stone-600 dark:text-stone-300 font-medium leading-relaxed">
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-2 ${pillar.dot}`} />
                    {topic}
                  </li>
                ))}
              </ul>
            </motion.div>
          ); })}
        </div>
      </section>

      {/* QUOTES WIDGET SECTION — đặc thù khối này */}
      <section className="py-20 relative bg-stone-200/50 dark:bg-stone-900/40 overflow-hidden flex items-center justify-center z-10">
        <div className="absolute inset-0 -z-10" />
        <QuoteSlider quotes={QUOTES} />
      </section>

      <HighlightsGrid
        items={HIGHLIGHTS}
        eyebrowLabel="Phương pháp tiếp cận"
        title="Học để sống, không chỉ để biết"
        accentTextClass="text-blue-600 dark:text-blue-400"
        accentIconClass="bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"
        cardClass="bg-white dark:bg-stone-900"
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
        primaryCtaClass="bg-blue-600 hover:bg-blue-500"
        secondaryCtaLabel="Liên hệ Văn phòng Giáo xứ"
        secondaryCtaTo="/liên-hệ"
        mc={mc}
        vp={vp}
        sectionClassName="py-28 max-w-3xl mx-auto px-6 text-center relative z-10 border-t border-stone-200/50 dark:border-stone-800/50"
      />
    </div>
  );
}