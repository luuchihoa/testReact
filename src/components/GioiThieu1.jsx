import React, { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from 'framer-motion';
import { ReactLenis } from "lenis/react";

// Component đếm số tự động thay thế cho ScrollTrigger Counter của GSAP
const Counter = ({ target }) => {
  const [count, setCount] = useState(0);

  return (
    <motion.span
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      onViewportEnter={() => {
        let start = 0;
        const end = parseInt(target, 10);
        if (start === end) return;

        const totalDuration = 2000; // 2 giây giống GSAP
        const incrementTime = Math.max(Math.floor(totalDuration / end), 10);
        
        const timer = setInterval(() => {
          start += 1;
          setCount(start);
          if (start >= end) clearInterval(timer);
        }, incrementTime);
      }}
    >
      {count}
    </motion.span>
  );
};

export default function GioiThieu() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Cấu hình animation xuất hiện tuần tự cho các thẻ (Stagger effect)
  const containerVariants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.2 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  return (
    <ReactLenis root options={{ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) }}>
      <div className="bg-[#F8FAFC] text-slate-800 antialiased overflow-x-hidden selection:bg-[#D4AF37] selection:text-white font-sans">
        
        {/* Noise Texture Overlay */}
        <div 
          className="fixed top-0 left-0 w-full h-full pointer-events-none z-[9999] opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
          }}
        />

        {/* Header */}
        <header className="fixed top-0 w-full z-50 transition-all duration-300">
          <div className={`absolute inset-0 transition-all duration-300 border-b ${
            isScrolled ? 'bg-white/80 backdrop-blur-md border-slate-100 shadow-sm' : 'bg-white/0 backdrop-blur-[0px] border-transparent'
          }`} />
          <div className="max-w-7xl mx-auto px-6 relative">
            <div className="flex justify-between items-center h-20">
              <a href="#" className="flex items-center gap-3 group">
                <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform duration-300">
                  <Icon icon="solar:church-bold-duotone" width="24" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-[#D4AF37] tracking-widest uppercase">Giáo Xứ</span>
                  <span className="text-base font-serif font-bold text-slate-900 leading-none">[Tên Giáo Xứ]</span>
                </div>
              </a>

              <nav className="hidden md:flex gap-1 bg-white/50 p-1.5 rounded-full border border-slate-200/60 backdrop-blur-md shadow-sm">
                <a href="#intro" className="px-5 py-2 text-sm font-medium text-slate-600 rounded-full hover:bg-white hover:shadow-sm hover:text-slate-900 transition-all duration-300">Giới thiệu</a>
                <a href="#program" className="px-5 py-2 text-sm font-medium text-slate-600 rounded-full hover:bg-white hover:shadow-sm hover:text-slate-900 transition-all duration-300">Chương trình</a>
                <a href="#teachers" className="px-5 py-2 text-sm font-medium text-slate-600 rounded-full hover:bg-white hover:shadow-sm hover:text-slate-900 transition-all duration-300">Đội ngũ</a>
              </nav>

              <div className="flex items-center gap-4">
                <a href="#register" className="hidden sm:inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-slate-900 rounded-full hover:bg-slate-800 transition-all hover:shadow-[0_4px_14px_0_rgba(15,23,42,0.39)] transform hover:-translate-y-0.5">
                  Đăng ký ngay
                </a>
                <button className="md:hidden p-2 text-slate-900" onClick={() => setIsMobileMenuOpen(true)}>
                  <Icon icon="solar:hamburger-menu-linear" width="28" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Menu */}
        <div className={`fixed inset-0 z-40 bg-white transform transition-transform duration-500 flex flex-col items-center justify-center space-y-8 md:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <a href="#intro" className="text-2xl font-serif text-slate-900" onClick={() => setIsMobileMenuOpen(false)}>Giới thiệu</a>
          <a href="#program" className="text-2xl font-serif text-slate-900" onClick={() => setIsMobileMenuOpen(false)}>Chương trình</a>
          <a href="#teachers" className="text-2xl font-serif text-slate-900" onClick={() => setIsMobileMenuOpen(false)}>Giáo lý viên</a>
          <button className="absolute top-6 right-6 p-2 bg-slate-100 rounded-full" onClick={() => setIsMobileMenuOpen(false)}>
            <Icon icon="solar:close-circle-linear" width="32" />
          </button>
        </div>

        {/* Main Content */}
        <main>
          {/* Hero Section */}
          <section className="relative pt-32 pb-32 lg:pt-48 lg:pb-40 overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-tr from-amber-100/40 via-blue-50/40 to-transparent rounded-[100%] blur-[100px] -z-10 animate-pulse" style={{ animationDuration: '8s' }}></div>
            
            <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
              {/* Định nghĩa chuyển động bằng các thẻ motion */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.1 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm mb-8 hover:border-[#D4AF37]/50 transition-colors cursor-default"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-semibold text-slate-600 tracking-wide uppercase">Tuyển sinh niên khóa 2024 - 2025</span>
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="text-5xl sm:text-7xl lg:text-8xl font-serif font-medium text-slate-900 tracking-tight mb-8 leading-[1.1]"
              >
                Hành trình <br/>
                <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900">Đức Tin</span> & Tình Yêu
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.3 }}
                className="text-lg sm:text-xl text-slate-500 mb-12 max-w-2xl mx-auto leading-relaxed font-light"
              >
                Nơi ươm mầm những tâm hồn trẻ thơ trong ánh sáng Tin Mừng, giúp các em trưởng thành về nhân bản và vững mạnh trong đời sống tâm linh.
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.4 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4"
              >
                <a href="#register" className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 text-sm font-bold text-white bg-slate-900 rounded-full overflow-hidden transition-all hover:scale-105">
                  <span>Đăng ký học ngay</span>
                  <Icon icon="solar:arrow-right-linear" width="20" className="group-hover:translate-x-1 transition-transform" />
                </a>
                <button className="group px-8 py-4 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-full hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center gap-2">
                  <Icon icon="solar:play-circle-linear" width="24" className="text-slate-400 group-hover:text-[#D4AF37] transition-colors" />
                  Xem video giới thiệu
                </button>
              </motion.div>
            </div>
          </section>

          {/* Stats Section với bộ đếm Counter tự động */}
          <section className="py-10 border-y border-slate-100 bg-white/50 backdrop-blur-sm">
            <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <p className="text-4xl font-serif font-bold text-slate-900 mb-1">
                  <Counter target="500" />
                </p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Học viên</p>
              </div>
              <div>
                <p className="text-4xl font-serif font-bold text-slate-900 mb-1">
                  <Counter target="45" />
                </p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Giáo lý viên</p>
              </div>
              <div>
                <p className="text-4xl font-serif font-bold text-slate-900 mb-1">
                  <Counter target="12" />
                </p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Lớp học</p>
              </div>
              <div>
                <p className="text-4xl font-serif font-bold text-slate-900 mb-1">
                  <Counter target="100" />%
                </p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Yêu thương</p>
              </div>
            </div>
          </section>

          {/* Program Section */}
          <section id="program" className="py-32 bg-slate-50/50">
            <div className="max-w-7xl mx-auto px-6">
              <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-6">
                <div className="max-w-xl">
                  <h2 className="text-sm font-bold text-[#D4AF37] tracking-widest uppercase mb-3">Chương trình đào tạo</h2>
                  <h3 className="text-4xl md:text-5xl font-serif text-slate-900 leading-tight">Nuôi dưỡng đức tin <br/>từ những bước đầu</h3>
                </div>
                <p className="text-slate-500 max-w-sm text-sm leading-relaxed">
                  Giáo trình được biên soạn chuẩn mực theo chỉ nam của Hội Đồng Giám Mục, kết hợp phương pháp sư phạm hiện đại.
                </p>
              </div>

              {/* Grid Cards với hiệu ứng whenInView (cuộn đến đâu xuất hiện đến đó) */}
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
              >
                {/* Card 1 */}
                <motion.div variants={cardVariants} className="group p-8 rounded-3xl bg-white border border-slate-100 shadow-[0_2px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-2 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-[100px] -z-0 transition-transform duration-500 group-hover:scale-150 group-hover:bg-blue-100"></div>
                  <div className="relative z-10">
                    <div className="w-14 h-14 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-center text-blue-600 mb-8 group-hover:scale-110 transition-transform">
                      <Icon icon="solar:book-bookmark-bold-duotone" width="32" />
                    </div>
                    <h4 className="text-xl font-bold text-slate-900 mb-3 font-serif">Khai Tâm & Rước Lễ</h4>
                    <p className="text-slate-500 text-sm leading-relaxed mb-6">Giai đoạn quan trọng giúp trẻ làm quen với Chúa Giêsu Thánh Thể và nền tảng giáo lý.</p>
                    <a href="#" className="inline-flex items-center text-sm font-semibold text-slate-900 hover:text-blue-600 transition-colors">
                      Chi tiết <Icon icon="solar:arrow-right-linear" className="ml-1" />
                    </a>
                  </div>
                </motion.div>

                {/* Card 2 */}
                <motion.div variants={cardVariants} className="group p-8 rounded-3xl bg-slate-900 text-white shadow-xl transition-all duration-500 hover:-translate-y-2 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-950"></div>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-[100px] -z-0 transition-transform duration-500 group-hover:scale-150"></div>
                  <div className="relative z-10">
                    <div className="w-14 h-14 bg-white/10 rounded-2xl border border-white/10 flex items-center justify-center text-amber-400 mb-8 group-hover:scale-110 transition-transform">
                      <Icon icon="solar:star-bold-duotone" width="32" />
                    </div>
                    <h4 className="text-xl font-bold text-white mb-3 font-serif">Thêm Sức & Bao Đồng</h4>
                    <p className="text-slate-400 text-sm leading-relaxed mb-6">Trưởng thành trong đức tin, lãnh nhận Chúa Thánh Thần và dấn thân làm chứng tá.</p>
                    <a href="#" className="inline-flex items-center text-sm font-semibold text-white hover:text-amber-400 transition-colors">
                      Chi tiết <Icon icon="solar:arrow-right-linear" className="ml-1" />
                    </a>
                  </div>
                </motion.div>

                {/* Card 3 */}
                <motion.div variants={cardVariants} className="group p-8 rounded-3xl bg-white border border-slate-100 shadow-[0_2px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-2 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-bl-[100px] -z-0 transition-transform duration-500 group-hover:scale-150 group-hover:bg-rose-100"></div>
                  <div className="relative z-10">
                    <div className="w-14 h-14 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-center text-rose-600 mb-8 group-hover:scale-110 transition-transform">
                      <Icon icon="solar:users-group-two-rounded-bold-duotone" width="32" />
                    </div>
                    <h4 className="text-xl font-bold text-slate-900 mb-3 font-serif">Dự Tòng & Hôn Nhân</h4>
                    <p className="text-slate-500 text-sm leading-relaxed mb-6">Lớp giáo lý đặc biệt dành cho người lớn muốn tìm hiểu đạo và các cặp đôi chuẩn bị kết hôn.</p>
                    <a href="#" className="inline-flex items-center text-sm font-semibold text-slate-900 hover:text-rose-600 transition-colors">
                      Chi tiết <Icon icon="solar:arrow-right-linear" className="ml-1" />
                    </a>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </section>

          {/* FAQ Section sử dụng thuộc tính `layout` của Motion để tạo hiệu ứng giãn dòng siêu mượt */}
          <section className="py-32 max-w-3xl mx-auto px-6">
            <h2 className="text-3xl font-serif text-center mb-16">Thắc mắc thường gặp</h2>
            <div className="space-y-4">
              {[
                {
                  id: 0,
                  q: "Con tôi chưa biết đọc có học được không?",
                  a: "Với các bé độ tuổi mầm non hoặc lớp 1 chưa thạo chữ, chúng tôi có lớp 'Chiên Con' sử dụng phương pháp trực quan sinh động bằng hình ảnh, bài hát và kể chuyện, không yêu cầu bé phải biết đọc viết thành thạo."
                },
                {
                  id: 1,
                  q: "Lịch học có trùng với giờ lễ không?",
                  a: "Nhà xứ sắp xếp giờ học Giáo Lý (08:00 - 09:30) ngay sau Thánh Lễ Thiếu Nhi (07:00 - 08:00) để thuận tiện cho phụ huynh đưa đón và các em tham dự trọn vẹn."
                }
              ].map((faq) => (
                <motion.div 
                  layout
                  key={faq.id}
                  className="bg-white border border-slate-200 rounded-2xl overflow-hidden cursor-pointer hover:border-slate-300 transition-colors"
                >
                  <motion.div layout className="p-6 flex justify-between items-center" onClick={() => setActiveAccordion(activeAccordion === faq.id ? null : faq.id)}>
                    <h3 className="font-semibold text-slate-900">{faq.q}</h3>
                    <Icon 
                      icon="solar:alt-arrow-down-linear" 
                      width="20" 
                      className={`text-slate-400 transition-transform duration-300 ${activeAccordion === faq.id ? 'rotate-180' : ''}`} 
                    />
                  </motion.div>
                  <AnimatePresence>
                    {activeAccordion === faq.id && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <p className="px-6 pb-6 text-slate-500 text-sm leading-relaxed">
                          {faq.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Register Section */}
          <section id="register" className="py-32 bg-slate-900 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
            <div className="max-w-xl mx-auto px-6 relative z-10">
              <div className="text-center mb-12">
                <Icon icon="solar:pen-new-square-linear" className="text-[#D4AF37] mb-4 mx-auto" width="40" />
                <h2 className="text-4xl font-serif text-white mb-4">Đăng ký trực tuyến</h2>
                <p className="text-slate-400 font-light">Hãy để lại thông tin, chúng tôi sẽ liên hệ xếp lớp phù hợp nhất cho bé.</p>
              </div>

              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="group">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tên Thánh & Tên Gọi</label>
                    <input type="text" className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all" placeholder="Maria Nguyễn Thị A" />
                  </div>
                  <div className="group">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Năm sinh</label>
                    <input type="text" className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all" placeholder="2015" />
                  </div>
                </div>
                <div className="group">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Số điện thoại phụ huynh</label>
                  <input type="tel" className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all" placeholder="090..." />
                </div>
                <button type="submit" className="w-full bg-[#D4AF37] text-slate-900 font-bold text-sm uppercase tracking-wide py-4 rounded-xl hover:bg-yellow-500 transition-colors shadow-lg shadow-amber-900/20 mt-6">
                  Gửi hồ sơ đăng ký
                </button>
              </form>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-white py-12 border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <p className="text-slate-400 text-sm font-medium">© 2024 Giáo Xứ [Tên]. Phụng sự Chúa trong hân hoan.</p>
          </div>
        </footer>

      </div>
    </ReactLenis>
  );
}