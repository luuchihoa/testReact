import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView, animate } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Sprout, Cross, Flame, BookOpen, Church, Compass, Users, 
  Library, ArrowRight, Sunrise, Sunset, Star, Droplets, 
  Heart, Leaf, CheckCircle2, ChevronRight, Play, X
} from "lucide-react";

// ─── Animations ───────────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } }
};

const scaleUp = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
};

// ─── Data ────────────────────────────────────────────────────────────────
const stats = [
  { label: "Thiếu Nhi", value: 500, suffix: "+" },
  { label: "Huynh Trưởng", value: 50, suffix: "+" },
  { label: "Ngành", value: 5, suffix: "" },
  { label: "Khối Lớp", value: 8, suffix: "" }
];

const values = [
  {
    id: "trang",
    title: "Trắng Tinh Tuyền",
    desc: "Sự thanh khiết tuyệt đối và tinh thần hy sinh phục vụ vô điều kiện.",
    icon: Droplets,
    color: "from-stone-100 to-white",
    textColor: "text-stone-700",
    iconBg: "bg-stone-100",
    iconColor: "text-stone-500",
    border: "border-stone-200"
  },
  {
    id: "xanh",
    title: "Xanh Sức Sống",
    desc: "Tâm hồn căng tràn năng lượng, mang niềm hy vọng hướng về tương lai.",
    icon: Leaf,
    color: "from-emerald-500 to-teal-500",
    textColor: "text-white",
    iconBg: "bg-white/20",
    iconColor: "text-emerald-50",
    border: "border-emerald-400"
  },
  {
    id: "hong",
    title: "Sắc Hoa Hồng",
    desc: "Biểu trưng sâu sắc cho tình yêu — sự chở che của Mẹ Maria.",
    icon: Heart,
    color: "from-rose-400 to-pink-500",
    textColor: "text-white",
    iconBg: "bg-white/20",
    iconColor: "text-rose-50",
    border: "border-rose-400"
  }
];

const leadership = [
  {
    role: "Linh mục Quản xứ",
    name: "Cha Đa-minh Trần Công Hạnh",
    quote: "Hãy để các trẻ nhỏ đến cùng Ta, đừng ngăn cấm chúng.",
    avatar: "https://i.pravatar.cc/150?img=11"
  },
  {
    role: "Linh mục Phó xứ",
    name: "Cha Phê-rô Nguyễn Thái",
    quote: "Phục vụ trong niềm vui và tình yêu thương.",
    avatar: "https://i.pravatar.cc/150?img=3"
  },
  {
    role: "Xứ Đoàn Trưởng",
    name: "Anh Giu-se Lê Hữu Phát",
    quote: "Noi gương Mẹ Maria, chúng ta cùng hiệp hành.",
    avatar: "https://i.pravatar.cc/150?img=14"
  }
];

const nganhList = [
  {
    nganh: "Ngành Ấu Nhi",
    accent: "emerald",
    khoi: [
      { ten: "Khối Chiên Con", tuoi: "6 – 7 tuổi", moTa: "Làm quen với Chúa qua lời kinh, bài hát.", icon: Sprout, to: "/khối-chiên-con" },
      { ten: "Khối Rước Lễ", tuoi: "8 – 9 tuổi", moTa: "Chuẩn bị tâm hồn rước Mình Thánh Chúa.", icon: Cross, to: "/khối-rước-lễ" }
    ]
  },
  {
    nganh: "Ngành Thiếu Nhi",
    accent: "blue",
    khoi: [
      { ten: "Khối Thêm Sức", tuoi: "10 – 11 tuổi", moTa: "Đón nhận ơn Chúa Thánh Thần.", icon: Flame, to: "/khối-thêm-sức" }
    ]
  },
  {
    nganh: "Ngành Nghĩa Sĩ",
    accent: "amber",
    khoi: [
      { ten: "Khối Phụng Vụ", tuoi: "12 tuổi", moTa: "Tập sự phục vụ bàn thờ, giúp lễ.", icon: Church, to: "/khối-phụng-vụ" },
      { ten: "Khối Kinh Thánh", tuoi: "13 – 14 tuổi", moTa: "Đào sâu Lịch Sử Cứu Độ.", icon: BookOpen, to: "/khối-kinh-thánh" },
    ]
  },
  {
    nganh: "Ngành Hiệp Sĩ",
    accent: "orange",
    khoi: [
      { ten: "Khối Vào Đời", tuoi: "15 – 16 tuổi", moTa: "Rèn luyện bản lĩnh người tông đồ trẻ.", icon: Compass, to: "/khối-vào-đời" }
    ]
  },
  {
    nganh: "Sinh Hoạt Tông Đồ",
    accent: "rose",
    khoi: [
      { ten: "Giới Trẻ", tuoi: "Sinh viên & Đi làm", moTa: "Tiếp nối sứ vụ trong đời sống trưởng thành.", icon: Users, to: "/giới-trẻ-công-giáo" }
    ]
  }
];

const accentStyles = {
  emerald: { dot: "bg-emerald-500", ring: "ring-emerald-500/20", line: "from-emerald-500/50", text: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10", border: "border-emerald-200 dark:border-emerald-500/20" },
  blue:    { dot: "bg-blue-500",    ring: "ring-blue-500/20",    line: "from-blue-500/50",    text: "text-blue-700 dark:text-blue-400",       bg: "bg-blue-50 dark:bg-blue-500/10",       border: "border-blue-200 dark:border-blue-500/20" },
  amber:   { dot: "bg-amber-500",   ring: "ring-amber-500/20",   line: "from-amber-500/50",   text: "text-amber-700 dark:text-amber-400",     bg: "bg-amber-50 dark:bg-amber-500/10",     border: "border-amber-200 dark:border-amber-500/20" },
  orange:  { dot: "bg-orange-500",  ring: "ring-orange-500/20",  line: "from-orange-500/50",  text: "text-orange-700 dark:text-orange-400",   bg: "bg-orange-50 dark:bg-orange-500/10",   border: "border-orange-200 dark:border-orange-500/20" },
  rose:    { dot: "bg-rose-500",    ring: "ring-rose-500/20",    line: "from-rose-500/50",    text: "text-rose-700 dark:text-rose-400",       bg: "bg-rose-50 dark:bg-rose-500/10",       border: "border-rose-200 dark:border-rose-500/20" }
};

const lichNgayThuong = [
  { icon: Sunrise, gio: "04:30", nhan: "Lễ Sáng" },
  { icon: Sunset, gio: "17:30", nhan: "Lễ Chiều" }
];
 
const lichCuoiTuan = [
  { ten: "Thánh Lễ I",   gio: "17:30", khi: "Chiều Thứ Bảy", ghiChu: "Lễ thay Chủ Nhật",                 icon: Sunset,  noiBat: false },
  { ten: "Thánh Lễ II",  gio: "05:00", khi: "Sáng Chủ Nhật", ghiChu: "Lễ Cộng đoàn",                     icon: Sunrise, noiBat: false },
  { ten: "Thánh Lễ III", gio: "08:00", khi: "Sáng Chủ Nhật", ghiChu: "Dành riêng cho Xứ đoàn Thiếu Nhi", icon: Star,    noiBat: true },
  { ten: "Thánh Lễ IV",  gio: "15:00", khi: "Chiều Chủ Nhật",ghiChu: "Lễ Cộng đoàn",                     icon: Sunset,  noiBat: false }
];

const galleryImages = [
  "https://images.unsplash.com/photo-1548625361-ec85382ff2f6?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1502444330042-d1a1ddf9bb5b?auto=format&fit=crop&q=80&w=800",
];

function CountUp({ to, suffix = "" }) {
  const nodeRef = useRef(null);
  const isInView = useInView(nodeRef, { once: true, margin: "-50px" });

  useEffect(() => {
    if (isInView && nodeRef.current) {
      const controls = animate(0, to, {
        duration: 2,
        ease: "easeOut",
        onUpdate(value) {
          if (nodeRef.current) {
            nodeRef.current.textContent = Math.round(value) + suffix;
          }
        }
      });
      return () => controls.stop();
    }
  }, [isInView, to, suffix]);

  return <span ref={nodeRef}>0{suffix}</span>;
}

// ─── Component ────────────────────────────────────────────────────────────
export default function GioiThieu() {
  const [videoOpen, setVideoOpen] = useState(false);

  const scrollToBlocks = () => {
    const el = document.getElementById("khoi-hoc-section");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="bg-[#FDFBF7] dark:bg-stone-950 text-stone-800 dark:text-stone-200 min-h-screen font-sans overflow-x-hidden selection:bg-amber-500/30 selection:text-amber-950 dark:selection:text-amber-50 transition-colors duration-500">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-amber-400/10 dark:bg-amber-600/10 blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-rose-400/10 dark:bg-rose-900/10 blur-[100px]" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] dark:opacity-[0.02]" />
        </div>

        <div className="max-w-5xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-[1.2fr_1fr] gap-12 lg:gap-8 items-center">
            
            <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="text-center lg:text-left">
              <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100/50 dark:bg-amber-900/30 border border-amber-200/50 dark:border-amber-800/50 text-amber-700 dark:text-amber-400 text-[11px] font-bold tracking-widest uppercase mb-6">
                <Star size={14} /> Giáo Phận Đà Nẵng · Giáo Xứ An Ngãi
              </motion.div>
              
              <motion.h1 variants={fadeUp} className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-stone-900 dark:text-white mb-6 leading-[1.1] tracking-tight font-serif">
                Xứ Đoàn <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-rose-600 dark:from-amber-400 dark:to-rose-400">
                  Mẹ Mân Côi
                </span>
              </motion.h1>
              
              <motion.p variants={fadeUp} className="text-[16px] sm:text-[18px] text-stone-600 dark:text-stone-400 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Đổi mới phương thức giảng dạy, phát huy sứ vụ Thiếu Nhi Tông Đồ, đồng hành kiến tạo và lan tỏa Tin Mừng Nước Chúa.
              </motion.p>
              
              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <button onClick={scrollToBlocks} className="w-full sm:w-auto bg-stone-900 dark:bg-white text-white dark:text-stone-900 px-8 py-4 rounded-[1.25rem] font-bold shadow-xl shadow-stone-900/10 dark:shadow-white/10 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2">
                  Khám phá khối học <ArrowRight size={18} />
                </button>
                <button onClick={() => setVideoOpen(true)} className="w-full sm:w-auto bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 px-8 py-4 rounded-[1.25rem] font-bold hover:bg-stone-50 dark:hover:bg-stone-800 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 group">
                  <span className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
                    <Play size={14} fill="currentColor" />
                  </span>
                  Xem Video
                </button>
              </motion.div>
            </motion.div>

            {/* Quick Stats Grid */}
            <motion.div initial="hidden" animate="visible" variants={scaleUp} className="grid grid-cols-2 gap-4">
              {stats.map((stat, i) => (
                <div key={i} className="bg-white/60 dark:bg-stone-900/40 backdrop-blur-xl border border-white/20 dark:border-stone-800 p-6 rounded-[2rem] shadow-sm flex flex-col items-center justify-center text-center hover:-translate-y-1 transition-transform duration-300">
                  <span className="text-3xl sm:text-4xl font-extrabold text-amber-600 dark:text-amber-500 mb-1 font-serif">
                    <CountUp to={stat.value} suffix={stat.suffix} />
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">{stat.label}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. ĐẤNG BẢO TRỢ & TRIẾT LÝ (3D Cards) */}
      <section className="py-24 px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp} className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-amber-700 dark:text-amber-500 font-bold tracking-widest uppercase text-xs mb-3">Triết lý Giáo dục</h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-stone-900 dark:text-white font-serif mb-6">Đức Mẹ Mân Côi</h3>
            <p className="text-stone-600 dark:text-stone-400 leading-relaxed text-[15px] sm:text-[16px]">
              Đức Mẹ Mân Côi — danh hiệu cao quý của Đức Trinh Nữ Maria. Dưới sự chở che của Mẹ, Xứ đoàn định hình 3 giá trị cốt lõi làm kim chỉ nam cho mọi hoạt động giáo dục và phục vụ.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {values.map((v, i) => {
              const Icon = v.icon;
              return (
                <motion.div 
                  key={v.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className={`group relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br ${v.color} p-8 sm:p-10 shadow-lg md:hover:-translate-y-2 transition-all duration-500`}
                >
                  {/* Decorative blur */}
                  <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                  
                  <div className="relative z-10 flex flex-col h-full">
                    <div className={`w-14 h-14 rounded-2xl ${v.iconBg} backdrop-blur-md flex items-center justify-center mb-8 border border-white/20 shadow-sm`}>
                      <Icon size={28} className={v.iconColor} strokeWidth={2} />
                    </div>
                    <h4 className={`text-2xl font-extrabold ${v.textColor} mb-4 font-serif`}>{v.title}</h4>
                    <p className={`${v.textColor} opacity-90 leading-relaxed text-[15px]`}>
                      {v.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. BAN ĐIỀU HÀNH */}
      <section className="py-24 px-6 bg-stone-100 dark:bg-stone-900/50">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp} className="text-center mb-16">
            <h2 className="text-amber-700 dark:text-amber-500 font-bold tracking-widest uppercase text-xs mb-3">Người Dẫn Dắt</h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-stone-900 dark:text-white font-serif">Ban Điều Hành Xứ Đoàn</h3>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {leadership.map((person, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white dark:bg-stone-800 rounded-[2.5rem] p-8 text-center shadow-sm border border-stone-200/50 dark:border-stone-700/50 group hover:shadow-xl transition-all duration-500"
              >
                <div className="relative w-32 h-32 mx-auto mb-6">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-400 to-rose-400 animate-spin-slow opacity-0 group-hover:opacity-100 transition-opacity blur-md" />
                  <img src={person.avatar} alt={person.name} className="relative w-full h-full object-cover rounded-full border-4 border-white dark:border-stone-800 z-10 grayscale group-hover:grayscale-0 transition-all duration-500" />
                </div>
                <span className="block text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-2">{person.role}</span>
                <h4 className="text-xl font-extrabold text-stone-900 dark:text-white mb-4">{person.name}</h4>
                <p className="text-stone-500 dark:text-stone-400 italic text-[14px]">"{person.quote}"</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. HÀNH TRÌNH ĐỨC TIN (Tối ưu Timeline) */}
      <section id="khoi-hoc-section" className="py-24 px-6 scroll-mt-6">
        <div className="max-w-4xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp} className="text-center mb-16">
            <h2 className="text-amber-700 dark:text-amber-500 font-bold tracking-widest uppercase text-xs mb-3">Hành Trình Đức Tin</h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-stone-900 dark:text-white font-serif mb-4">Các Ngành Đào Tạo</h3>
            <p className="text-stone-600 dark:text-stone-400 max-w-xl mx-auto leading-relaxed">
              Xuyên suốt từ thuở ấu thơ đến tuổi trưởng thành, mỗi ngành đánh dấu một chặng lớn lên trong đức tin.
            </p>
          </motion.div>

          <div className="relative">
            {/* Glowing progress line */}
            <div className="absolute left-[27px] sm:left-[39px] top-4 bottom-4 w-[2px] bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden">
              <motion.div 
                className="w-full bg-gradient-to-b from-amber-400 via-rose-500 to-emerald-500 origin-top"
                initial={{ scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                style={{ height: "100%" }}
              />
            </div>

            <div className="space-y-12">
              {nganhList.map((nhom, i) => {
                const c = accentStyles[nhom.accent];
                return (
                  <motion.div 
                    key={nhom.nganh} 
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="relative pl-16 sm:pl-24"
                  >
                    {/* Timeline Node */}
                    <span className={`absolute left-[16px] sm:left-[28px] top-1 w-6 h-6 rounded-full bg-white dark:bg-stone-900 border-[6px] ${c.border} z-10 shadow-sm`} />

                    <h4 className={`text-sm font-black tracking-widest uppercase mb-6 ${c.text}`}>
                      {nhom.nganh}
                    </h4>

                    <div className="grid sm:grid-cols-2 gap-4">
                      {nhom.khoi.map((k) => {
                        const Icon = k.icon;
                        return (
                          <Link key={k.ten} to={k.to} className={`group block bg-white dark:bg-stone-900/50 rounded-[2rem] p-6 border border-stone-200/60 dark:border-stone-800 hover:border-transparent dark:hover:border-transparent shadow-sm hover:shadow-xl transition-all duration-300`}>
                            <div className="flex items-center justify-between mb-5">
                              <span className={`w-12 h-12 rounded-2xl ${c.bg} flex items-center justify-center ${c.text}`}>
                                <Icon size={24} strokeWidth={2} />
                              </span>
                              <span className="text-[11px] font-bold text-stone-500 bg-stone-100 dark:bg-stone-800 dark:text-stone-400 rounded-full px-3 py-1">
                                {k.tuoi}
                              </span>
                            </div>
                            <h5 className="text-[18px] font-extrabold text-stone-900 dark:text-white mb-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                              {k.ten}
                            </h5>
                            <p className="text-[14px] text-stone-500 dark:text-stone-400 leading-relaxed mb-4">
                              {k.moTa}
                            </p>
                            <span className={`inline-flex items-center gap-1.5 text-[13px] font-bold ${c.text} opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0`}>
                              Tìm hiểu thêm <ArrowRight size={14} />
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
          
          {/* Tài liệu CTA */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-16 text-center">
            <Link to="/tài-liệu" className="inline-flex items-center gap-3 px-8 py-4 bg-stone-900 dark:bg-white text-white dark:text-stone-900 rounded-full font-bold shadow-lg hover:scale-105 transition-transform">
              <Library size={20} />
              Truy cập Tủ sách số
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 5. HÌNH ẢNH HOẠT ĐỘNG (Gallery) */}
      <section className="py-24 px-6 bg-stone-950 text-white overflow-hidden rounded-t-[3rem] sm:rounded-t-[5rem]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
            <div>
              <h2 className="text-amber-500 font-bold tracking-widest uppercase text-xs mb-3">Hình ảnh & Khoảnh khắc</h2>
              <h3 className="text-3xl sm:text-4xl font-extrabold font-serif">Ký Ức Xứ Đoàn</h3>
            </div>
            <button className="text-sm font-bold text-stone-400 hover:text-white transition-colors flex items-center gap-2">
              Xem tất cả <ArrowRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {galleryImages.map((img, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`relative rounded-[2rem] overflow-hidden group ${i === 0 || i === 3 ? "md:col-span-2 aspect-[16/9]" : "aspect-square"}`}
              >
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10" />
                <img src={img} alt="Gallery" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. LỊCH PHỤNG VỤ */}
      <section className="py-24 px-6 bg-[#FDFBF7] dark:bg-stone-950 border-t border-stone-200 dark:border-stone-800">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp} className="text-center mb-16">
            <h2 className="text-amber-700 dark:text-amber-500 font-bold tracking-widest uppercase text-xs mb-3">Nhịp Sống Phụng Vụ</h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-stone-900 dark:text-white font-serif">Thánh Lễ Cộng Đoàn</h3>
          </motion.div>
 
          <div className="grid md:grid-cols-[1fr_1.5fr] gap-8">
            <motion.div variants={fadeUp} className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-[2.5rem] p-8 shadow-sm">
              <h3 className="text-xl font-extrabold text-stone-900 dark:text-white mb-6 flex items-center justify-between">
                Ngày Thường
                <span className="text-[11px] bg-stone-100 dark:bg-stone-800 px-3 py-1 rounded-full text-stone-500 font-bold uppercase tracking-wider">T2 - T7</span>
              </h3>
              <div className="space-y-4">
                {lichNgayThuong.map((l) => (
                  <div key={l.nhan} className="flex items-center justify-between bg-stone-50 dark:bg-stone-800/50 rounded-2xl p-4 border border-stone-100 dark:border-stone-700/50 hover:border-amber-200 dark:hover:border-amber-900/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <l.icon size={20} className="text-amber-600 dark:text-amber-400" />
                      <span className="font-semibold text-stone-700 dark:text-stone-300">{l.nhan}</span>
                    </div>
                    <span className="text-lg font-black text-stone-900 dark:text-white">{l.gio}</span>
                  </div>
                ))}
              </div>
            </motion.div>
 
            <motion.div variants={fadeUp} className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-[2.5rem] p-8 shadow-sm">
              <h3 className="text-xl font-extrabold text-stone-900 dark:text-white mb-6 flex items-center justify-between">
                Cuối Tuần
                <span className="text-[11px] bg-amber-100 dark:bg-amber-900/50 px-3 py-1 rounded-full text-amber-700 dark:text-amber-400 font-bold uppercase tracking-wider">Chúa Nhật</span>
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {lichCuoiTuan.map((l) => (
                  <div key={l.ten} className={`relative p-5 rounded-2xl border-2 transition-all ${l.noiBat ? "border-amber-400 bg-amber-50 dark:bg-amber-900/10 shadow-md" : "border-stone-100 dark:border-stone-800 hover:border-stone-200 dark:hover:border-stone-700"}`}>
                    {l.noiBat && (
                      <span className="absolute -top-3 right-4 bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">
                        Lễ Thiếu Nhi
                      </span>
                    )}
                    <div className="flex items-center gap-2 mb-3">
                      <l.icon size={16} className={l.noiBat ? "text-amber-600 dark:text-amber-400" : "text-stone-400"} />
                      <span className={`text-[12px] font-bold uppercase tracking-wider ${l.noiBat ? "text-amber-700 dark:text-amber-500" : "text-stone-500"}`}>{l.ten}</span>
                    </div>
                    <span className={`block text-3xl font-black mb-1 ${l.noiBat ? "text-amber-950 dark:text-amber-50" : "text-stone-900 dark:text-white"}`}>{l.gio}</span>
                    <span className="text-sm font-medium text-stone-500 dark:text-stone-400">{l.khi}</span>
                    {l.ghiChu && <span className="block mt-2 text-[12px] text-stone-400 dark:text-stone-500 italic">{l.ghiChu}</span>}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Video Modal Placeholder */}
      <AnimatePresence>
        {videoOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-10">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setVideoOpen(false)} className="absolute inset-0 bg-stone-900/90 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10">
              <button onClick={() => setVideoOpen(false)} className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white backdrop-blur-md transition-colors z-10">
                <X size={20} />
              </button>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white/50">
                <Play size={48} className="mb-4 opacity-20" />
                <p>Video giới thiệu đang cập nhật...</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}