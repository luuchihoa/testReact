import React from 'react';
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Sprout, Cross, Flame, BookOpen, Church, Compass, Users, Library, ArrowRight, Sunrise, Sunset, Star } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } }
};

const staggerItem = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const nganhList = [
  {
    nganh: "Ngành Ấu Nhi",
    accent: "emerald", // Vẫn giữ chút xanh ngọc mờ để nhớ màu khăn Ấu Nhi
    khoi: [
      { ten: "Khối Chiên Con", tuoi: "6 – 7 tuổi", moTa: "Bước chân đầu đời làm quen với Chúa qua lời kinh, bài hát và những câu chuyện Thánh Kinh giản dị.", icon: Sprout, to: "/khối-chiên-con" },
      { ten: "Khối Rước Lễ", tuoi: "8 – 9 tuổi", moTa: "Chuẩn bị tâm hồn trong sạch để lần đầu đón nhận Mình Thánh Chúa trong Bí tích Thánh Thể.", icon: Cross, to: "/khối-rước-lễ" }
    ]
  },
  {
    nganh: "Ngành Thiếu Nhi",
    accent: "stone", // Đổi xanh dương gắt sang Xám đá thanh lịch
    khoi: [
      { ten: "Khối Thêm Sức", tuoi: "10 – 11 tuổi", moTa: "Đón nhận ơn Chúa Thánh Thần, được củng cố đức tin để trở thành chứng nhân giữa bạn bè.", icon: Flame, to: "/khối-thêm-sức" }
    ]
  },
  {
    nganh: "Ngành Nghĩa Sĩ",
    accent: "amber", // Vàng kim (Nghĩa sĩ)
    khoi: [
      { ten: "Khối Phụng Vụ", tuoi: "12 tuổi", moTa: "Tập sự phục vụ bàn thờ, gắn bó gần hơn với đời sống phụng vụ của giáo xứ.", icon: Church, to: "/khối-phụng-vụ" },
      { ten: "Khối Kinh Thánh", tuoi: "13 – 14 tuổi", moTa: "Đào sâu Lịch Sử Cứu Độ, học cách đọc và sống Lời Chúa mỗi ngày.", icon: BookOpen, to: "/khối-kinh-thánh" },
    ]
  },
  {
    nganh: "Ngành Hiệp Sĩ",
    accent: "orange", // Nâu cam (Hiệp sĩ)
    khoi: [
      { ten: "Khối Vào Đời", tuoi: "15 – 16 tuổi", moTa: "Rèn luyện bản lĩnh người tông đồ trẻ, sẵn sàng dấn thân phục vụ cộng đoàn.", icon: Compass, to: "/khối-vào-đời" }
    ]
  },
  {
    nganh: "Sinh Hoạt Tông Đồ",
    accent: "rose", // Đỏ thẫm (Huynh trưởng/Giới trẻ)
    khoi: [
      { ten: "Giới Trẻ", tuoi: "Sinh viên & Đi làm", moTa: "Cùng đồng hành, hiệp thông và tiếp nối sứ vụ loan báo Tin Mừng trong đời sống trưởng thành.", icon: Users, to: "/giới-trẻ-công-giáo" }
    ]
  }
];

const accentStyles = {
  emerald: { dot: "bg-emerald-500", ring: "ring-emerald-500/20", text: "text-emerald-700 dark:text-emerald-400", border: "md:hover:border-emerald-500/40", glow: "md:hover:shadow-emerald-500/5", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
  stone:   { dot: "bg-stone-500",   ring: "ring-stone-500/20",   text: "text-stone-700 dark:text-stone-400",   border: "md:hover:border-stone-500/40",   glow: "md:hover:shadow-stone-500/5",   bg: "bg-stone-100 dark:bg-stone-500/10" },
  amber:   { dot: "bg-amber-500",   ring: "ring-amber-500/20",   text: "text-amber-700 dark:text-amber-400",   border: "md:hover:border-amber-500/40",   glow: "md:hover:shadow-amber-500/5",   bg: "bg-amber-50 dark:bg-amber-500/10" },
  orange:  { dot: "bg-orange-500",  ring: "ring-orange-500/20",  text: "text-orange-700 dark:text-orange-400", border: "md:hover:border-orange-500/40",  glow: "md:hover:shadow-orange-500/5",  bg: "bg-orange-50 dark:bg-orange-500/10" },
  rose:    { dot: "bg-rose-500",    ring: "ring-rose-500/20",    text: "text-rose-700 dark:text-rose-400",     border: "md:hover:border-rose-500/40",    glow: "md:hover:shadow-rose-500/5",    bg: "bg-rose-50 dark:bg-rose-500/10" }
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

export default function GioiThieu() {
  const scrollToBlocks = () => {
    const el = document.getElementById("khoi-hoc-section");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="bg-[#FDFBF7] dark:bg-[#1C1917] text-stone-800 dark:text-stone-200 min-h-screen font-sans overflow-x-hidden selection:bg-amber-500/30 selection:text-amber-950 dark:selection:text-amber-50 transition-colors duration-500">
      
      {/* 1. Hero Section */}
      <motion.section 
        initial="hidden" animate="visible" variants={staggerContainer}
        className="relative py-24 px-6 text-center max-w-4xl mx-auto z-10"
      >
        <motion.p variants={fadeUp} className="text-amber-700 dark:text-amber-500 text-xs sm:text-sm font-bold tracking-widest uppercase mb-4">
          Giáo Phận Đà Nẵng · Giáo Xứ An Ngãi
        </motion.p>
        <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-amber-950 dark:text-amber-50 mb-6 leading-tight tracking-tight font-serif">
          Xứ Đoàn <span className="text-amber-600 dark:text-amber-400 italic">Mẹ Mân Côi</span>
        </motion.h1>
        <motion.p variants={fadeUp} className="text-[15px] sm:text-lg text-stone-600 dark:text-stone-400 mb-10 max-w-2xl mx-auto leading-relaxed">
          Đổi mới phương thức giảng dạy, phát huy sứ vụ Thiếu Nhi Tông Đồ, đồng hành kiến tạo và lan tỏa Tin Mừng Nước Chúa.
        </motion.p>
        
        <motion.div variants={fadeUp} className="flex flex-col sm:flex-row justify-center gap-3.5 max-w-xs sm:max-w-none mx-auto">
          <button type="button" onClick={scrollToBlocks}
            className="bg-amber-900 hover:bg-amber-950 dark:bg-amber-600 dark:hover:bg-amber-500 text-amber-50 dark:text-stone-950 px-8 py-3.5 rounded-full font-bold shadow-sm active:scale-98 transition-all duration-200"
          >
            Khám phá khối học
          </button>
          <Link to="/liên-hệ"
            className="border border-amber-900/20 text-amber-900 hover:bg-amber-900/5 dark:border-amber-100/20 dark:text-amber-100 dark:hover:bg-amber-100/5 px-8 py-3.5 rounded-full font-bold active:scale-98 transition-all duration-200 flex items-center justify-center"
          >
            Liên hệ Cộng đoàn
          </Link>
        </motion.div>
      </motion.section>

      {/* 2. Đấng Bảo Trợ & Triết lý */}
      <motion.section 
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp}
        className="py-16 px-6 bg-white/60 dark:bg-stone-800/20 border-y border-amber-900/10 dark:border-amber-100/10"
      >
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-start">
          <div>
            <h2 className="text-xs text-amber-700 dark:text-amber-500 font-black tracking-widest uppercase mb-2">Đấng Bảo Trợ Bổn Mạng</h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-amber-950 dark:text-amber-50 mb-6 font-serif">Đức Mẹ Mân Côi</h3>
            <p className="text-stone-600 dark:text-stone-400 mb-4 leading-relaxed text-[14px] sm:text-[15px]">
              Đức Mẹ Mân Côi — danh hiệu cao quý của Đức Trinh Nữ Maria gắn liền với Kinh Mân Côi linh thánh. Đại lễ kính Mẹ được cử hành vào <strong className="text-amber-900 dark:text-amber-200">ngày 07 tháng 10</strong> hằng năm.
            </p>
            <p className="text-stone-600 dark:text-stone-400 leading-relaxed italic border-l-4 border-amber-500/50 pl-4 mt-6 text-[14px]">
              "Mẹ luôn che chở cho đoàn con, chỉ cần tâm thành cầu nguyện, Mẹ không phân biệt màu da, tôn giáo hay chức vụ."
            </p>
          </div>
          
          <div className="bg-white/80 dark:bg-stone-900/40 p-6 sm:p-8 rounded-2xl border border-amber-900/10 dark:border-amber-100/10 shadow-sm backdrop-blur-sm">
            <h3 className="text-lg sm:text-xl font-bold text-amber-950 dark:text-amber-50 mb-6">Triết lý Giáo dục & Giá trị</h3>
            <ul className="space-y-6">
              <li className="group">
                <strong className="text-stone-800 dark:text-stone-200 flex items-center gap-2 text-sm sm:text-base">
                  <span className="w-2.5 h-2.5 rounded-full bg-stone-300 dark:bg-stone-500 block transition-transform group-hover:scale-125"></span> Trắng Tinh Tuyền
                </strong>
                <p className="text-stone-500 dark:text-stone-400 text-[13px] mt-1.5 ml-4.5 leading-relaxed">Sự thanh khiết tuyệt đối và tinh thần hy sinh phục vụ vô điều kiện.</p>
              </li>
              <li className="group">
                <strong className="text-emerald-700 dark:text-emerald-400 flex items-center gap-2 text-sm sm:text-base">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block transition-transform group-hover:scale-125"></span> Xanh Sức Sống
                </strong>
                <p className="text-stone-500 dark:text-stone-400 text-[13px] mt-1.5 ml-4.5 leading-relaxed">Tâm hồn căng tràn năng lượng, mang niềm hy vọng hướng về tương lai.</p>
              </li>
              <li className="group">
                <strong className="text-rose-700 dark:text-rose-400 flex items-center gap-2 text-sm sm:text-base">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400 block transition-transform group-hover:scale-125"></span> Sắc Hoa Hồng
                </strong>
                <p className="text-stone-500 dark:text-stone-400 text-[13px] mt-1.5 ml-4.5 leading-relaxed">Biểu trưng sâu sắc cho tình yêu — sự che chở chở che của Mẹ Maria.</p>
              </li>
            </ul>
          </div>
        </div>

        {/* Hành Trình Đức Tin Theo Ngành */}
        <div id="khoi-hoc-section" className="max-w-5xl mx-auto mt-20 pt-16 border-t border-amber-900/10 dark:border-amber-100/10 scroll-mt-6">
          <div className="text-center sm:text-left mb-12 max-w-2xl">
            <h4 className="text-xs font-black tracking-widest text-amber-700 dark:text-amber-500 uppercase mb-3">Hành Trình Đức Tin</h4>
            <h5 className="text-2xl sm:text-3xl font-extrabold text-amber-950 dark:text-amber-50 mb-4 font-serif">Các Khối Lớp Đào Tạo</h5>
            <p className="text-sm sm:text-base text-stone-600 dark:text-stone-400 leading-relaxed">
              Xuyên suốt từ thuở ấu thơ đến tuổi trưởng thành, mỗi ngành đánh dấu một chặng lớn lên trong đức tin — giúp các em gặp gỡ Chúa Giêsu và dấn thân trở thành chứng nhân.
            </p>
          </div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={staggerContainer} className="relative">
            <div className="absolute left-[15px] sm:left-[19px] top-2 bottom-2 w-px bg-gradient-to-b from-amber-900/20 dark:from-amber-100/10 to-transparent" aria-hidden="true" />

            <div className="space-y-10">
              {nganhList.map((nhom) => {
                const c = accentStyles[nhom.accent];
                return (
                  <motion.div key={nhom.nganh} variants={staggerItem} className="relative pl-10 sm:pl-12">
                    <span className={`absolute left-0 top-1.5 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white dark:bg-stone-900 border border-amber-900/20 dark:border-amber-100/20 flex items-center justify-center ring-4 ${c.ring} shadow-sm`}>
                      <span className={`w-2 h-2 rounded-full ${c.dot}`} />
                    </span>

                    <h6 className={`text-[11px] font-black tracking-widest uppercase mb-3 ${c.text}`}>
                      {nhom.nganh}
                    </h6>

                    <div className={`grid gap-3 ${nhom.khoi.length > 1 ? "sm:grid-cols-2" : "sm:grid-cols-2"}`}>
                      {nhom.khoi.map((k) => {
                        const Icon = k.icon;
                        return (
                          <Link key={k.ten} to={k.to}
                            className={`group relative p-5 rounded-2xl bg-white/80 dark:bg-stone-800/40 border border-amber-900/10 dark:border-amber-100/10 ${c.border} transition-all duration-300 shadow-sm hover:shadow-md ${c.glow} overflow-hidden backdrop-blur-sm`}
                          >
                            <div className="flex items-start justify-between mb-4">
                              <span className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center ${c.text}`}>
                                <Icon size={18} strokeWidth={2.2} />
                              </span>
                              <span className="text-[10px] font-bold text-stone-500 bg-stone-100 dark:bg-stone-800 dark:text-stone-400 rounded-full px-2.5 py-1 whitespace-nowrap">
                                {k.tuoi}
                              </span>
                            </div>
                            <span className={`block text-amber-950 dark:text-amber-50 font-extrabold text-[15px] mb-1.5 transition-colors`}>
                              {k.ten}
                            </span>
                            <p className="text-[12.5px] text-stone-500 dark:text-stone-400 leading-relaxed mb-3">
                              {k.moTa}
                            </p>
                            <span className={`inline-flex items-center gap-1 text-[11px] font-bold ${c.text} opacity-0 group-hover:opacity-100 transition-opacity`}>
                              Tìm hiểu thêm <ArrowRight size={12} />
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          <motion.div variants={staggerItem} className="mt-10">
            <Link to="/tài-liệu"
              className="group flex items-center gap-4 p-5 rounded-2xl bg-amber-50/50 dark:bg-amber-900/10 border border-amber-900/10 dark:border-amber-100/10 transition-all duration-300 shadow-sm"
            >
              <span className="w-10 h-10 rounded-xl bg-white dark:bg-stone-800 flex items-center justify-center text-amber-700 dark:text-amber-400 flex-shrink-0 shadow-sm">
                <Library size={18} strokeWidth={2} />
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-amber-950 dark:text-amber-50 font-extrabold text-[14px]">Tủ Sách Số</span>
                <span className="text-[12px] text-stone-600 dark:text-stone-400">Kinh nguyện & Giáo án điện tử</span>
              </span>
              <ArrowRight size={16} className="text-amber-700 dark:text-amber-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* 3. Lịch trình Phụng vụ */}
      <motion.section 
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer}
        className="py-20 px-6 max-w-5xl mx-auto"
      >
        <motion.div variants={fadeUp} className="text-center mb-14">
          <h4 className="text-xs font-black tracking-widest text-amber-700 dark:text-amber-500 uppercase mb-3">Nhịp Sống Phụng Vụ</h4>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-amber-950 dark:text-amber-50 mb-4 font-serif">Thánh Lễ Cộng Đoàn</h2>
          <p className="text-sm text-stone-600 dark:text-stone-400 max-w-xl mx-auto leading-relaxed">"Thánh Lễ là nguồn mạch tối cao nuôi dưỡng đời sống người Kitô hữu"</p>
        </motion.div>
 
        <div className="grid md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] gap-6">
          <motion.div variants={fadeUp} className="bg-white/80 dark:bg-stone-800/40 border border-amber-900/10 dark:border-amber-100/10 rounded-2xl p-6 sm:p-7 shadow-sm backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-extrabold text-amber-950 dark:text-amber-50">Ngày Thường</h3>
              <span className="text-[10px] font-bold text-stone-600 bg-stone-100 dark:bg-stone-800 dark:text-stone-300 border border-stone-200/50 dark:border-stone-700/50 rounded-full px-2.5 py-1">
                Thứ 2 – Thứ 7
              </span>
            </div>
            <div className="space-y-3">
              {lichNgayThuong.map((l) => {
                const Icon = l.icon;
                return (
                  <div key={l.nhan} className="flex items-center gap-4 bg-stone-50 dark:bg-stone-900/50 border border-stone-100 dark:border-stone-800/50 rounded-xl px-4 py-3.5">
                    <span className="w-9 h-9 rounded-lg bg-white dark:bg-stone-800 border border-stone-200/50 dark:border-stone-700/50 flex items-center justify-center text-stone-500 dark:text-stone-400 flex-shrink-0">
                      <Icon size={16} strokeWidth={2} />
                    </span>
                    <span className="flex-1 text-sm font-semibold text-stone-700 dark:text-stone-300">{l.nhan}</span>
                    <span className="text-amber-900 dark:text-amber-400 font-extrabold text-sm tabular-nums">{l.gio}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
 
          <motion.div variants={fadeUp} className="bg-white/80 dark:bg-stone-800/40 border border-amber-900/10 dark:border-amber-100/10 rounded-2xl p-6 sm:p-7 shadow-sm backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-extrabold text-amber-950 dark:text-amber-50">Cuối Tuần</h3>
              <span className="text-[10px] font-bold text-stone-600 bg-stone-100 dark:bg-stone-800 dark:text-stone-300 border border-stone-200/50 dark:border-stone-700/50 rounded-full px-2.5 py-1">
                Thứ 7 – CN
              </span>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {lichCuoiTuan.map((l) => {
                const Icon = l.icon;
                return (
                  <div key={l.ten} className={`relative rounded-xl px-4 py-4 border transition-colors ${
                      l.noiBat ? "bg-amber-100/50 border-amber-500/30 dark:bg-amber-900/30 dark:border-amber-500/30" : "bg-stone-50 dark:bg-stone-900/50 border-stone-100 dark:border-stone-800/50"
                    }`}
                  >
                    {l.noiBat && (
                      <span className="absolute -top-2.5 right-3 text-[9px] font-black uppercase tracking-wider bg-amber-500 text-white rounded-full px-2 py-0.5 shadow-sm">
                        Xứ Đoàn
                      </span>
                    )}
                    <div className="flex items-center gap-2 mb-2">
                      <Icon size={14} strokeWidth={2.5} className={l.noiBat ? "text-amber-600 dark:text-amber-400" : "text-stone-500"} />
                      <span className={`text-[11px] font-bold uppercase tracking-wide ${l.noiBat ? "text-amber-700 dark:text-amber-400" : "text-stone-500 dark:text-stone-400"}`}>
                        {l.ten}
                      </span>
                    </div>
                    <span className={`block font-extrabold text-xl tabular-nums mb-1 ${l.noiBat ? "text-amber-950 dark:text-amber-50" : "text-stone-800 dark:text-stone-200"}`}>
                      {l.gio}
                    </span>
                    <span className="block text-[12px] text-stone-600 dark:text-stone-400">{l.khi}</span>
                    <span className={`block text-[11px] mt-1 ${l.noiBat ? "text-amber-700 dark:text-amber-300 font-semibold" : "text-stone-500"}`}>
                      {l.ghiChu}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
};