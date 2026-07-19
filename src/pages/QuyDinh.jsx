import React from "react";
import { motion } from "framer-motion";
import { usePageMotion } from "../hooks/usePageMotion.js";
import { 
  Shield, 
  UserCheck, 
  FileText, 
  Copyright, 
  RefreshCw, 
  Mail, 
  Scale 
} from "lucide-react";



export default function QuyDinh() {
  const { heroRef, heroY, heroReveal, vp } = usePageMotion();
  const sections = [
    { icon: Shield, heading: "1. Mục đích sử dụng", body: "Nền tảng này được Ban Giáo Lý Giáo xứ An Ngãi xây dựng nhằm hỗ trợ việc học hỏi, ôn tập giáo lý cho các em thiếu nhi và huynh trưởng trong xứ đoàn. Nội dung chỉ phục vụ mục đích giáo dục đức tin." },
    { icon: UserCheck, heading: "2. Tài khoản người dùng", body: "Mỗi tài khoản được cấp cho một cá nhân cụ thể. Người dùng có trách nhiệm bảo mật mật khẩu và không chia sẻ tài khoản cho người khác sử dụng." },
    { icon: FileText, heading: "3. Quy tắc làm bài kiểm tra", body: "Các bài trắc nghiệm và tự luận trên hệ thống được tạo ngẫu nhiên. Học viên cam kết tự làm bài, không tra cứu đáp án hay nhờ người khác làm thay trong thời gian tính giờ." },
    { icon: Copyright, heading: "4. Nội dung và bản quyền", body: "Hình ảnh và tài liệu giáo lý thuộc quyền sử dụng của Ban Giáo Lý Gx. An Ngãi. Vui lòng không sao chép, phát tán lại dưới danh nghĩa cá nhân hoặc tổ chức khác." },
    { icon: RefreshCw, heading: "5. Thay đổi quy định", body: "Ban Giáo Lý có thể cập nhật quy định sử dụng theo thời gian để phù hợp với nhu cầu thực tế. Mọi thay đổi quan trọng sẽ được thông báo trên trang chủ." },
    { icon: Mail, heading: "6. Liên hệ", body: "Nếu có thắc mắc về quy định sử dụng, vui lòng liên hệ qua email htdcanngai@gmail.com hoặc trang Liên hệ trên website." },
  ];

  return (
    <div ref={heroRef} className="min-h-screen bg-[#FDFBF7] text-stone-800 dark:bg-[#1C1917] dark:text-stone-200 antialiased overflow-x-hidden selection:bg-amber-500/30 selection:text-amber-900 dark:selection:text-amber-100 transition-colors duration-500 relative">
      {/* Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[400px] bg-amber-200/30 dark:bg-amber-900/20 blur-[100px] rounded-full pointer-events-none" />
      
      {/* Background Pattern */}
      <div className="fixed inset-0 w-full h-screen bg-[linear-gradient(to_right,#92400E08_1px,transparent_1px),linear-gradient(to_bottom,#92400E08_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#FDE68A05_1px,transparent_1px),linear-gradient(to_bottom,#FDE68A05_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none z-0" />

      <motion.div style={{ y: heroY }} className="max-w-3xl mx-auto px-4 sm:px-6 pt-12 pb-24 relative z-10">
        <header className="mb-10 text-left space-y-3 px-1">
          <motion.div variants={heroReveal} initial="hidden" animate="visible" custom={0}>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-100/50 text-amber-800 border border-amber-200/50 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50">
              <Scale className="w-3 h-3" /> Điều khoản sử dụng
            </span>
          </motion.div>
          
          <motion.h1 
            variants={heroReveal} 
            initial="hidden" 
            animate="visible" 
            custom={0.06} 
            className="text-[32px] sm:text-4xl font-extrabold tracking-tight leading-tight text-amber-950 dark:text-amber-50 font-serif"
          >
            Quy định sử dụng
          </motion.h1>

          <motion.p variants={heroReveal} initial="hidden" animate="visible" custom={0.12} className="text-[13px] font-medium text-stone-500 dark:text-stone-400">
            Cập nhật lần cuối: Tháng 6/2026 • Ban Giáo Lý Gx. An Ngãi
          </motion.p>
        </header>

        <div className="space-y-3 sm:space-y-4">
          {sections.map((s, idx) => {
            const Icon = s.icon;
            return (
              <motion.section
                key={s.heading}
                variants={heroReveal}
                initial="hidden"
                whileInView="visible"
                viewport={vp}
                custom={idx * 0.05 + 0.15}
                whileTap={{ scale: 0.98 }}
                className="group bg-white/80 dark:bg-stone-800/40 backdrop-blur-sm rounded-2xl border border-amber-900/10 dark:border-amber-100/10 p-4 sm:p-6 shadow-sm hover:shadow-md hover:border-amber-900/20 dark:hover:border-amber-100/20 transition-all duration-300 text-left flex gap-3.5 sm:gap-4 items-start cursor-pointer select-none"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-amber-50 dark:bg-amber-900/20 border border-amber-200/50 dark:border-amber-800/50 flex-shrink-0 text-amber-700 dark:text-amber-400 group-hover:scale-105 transition-transform duration-300">
                  <Icon className="w-4.5 h-4.5" />
                </div>
                
                <div className="space-y-1 sm:space-y-1.5 flex-1 min-w-0 pt-0.5">
                  <h2 className="text-[15px] sm:text-base font-bold text-amber-950 dark:text-amber-50 tracking-tight">
                    {s.heading}
                  </h2>
                  <p className="text-[14px] sm:text-[15px] text-stone-600 dark:text-stone-400 leading-relaxed font-medium">
                    {s.body}
                  </p>
                </div>
              </motion.section>
            );
          })}
        </div>

        <motion.p 
          variants={heroReveal} 
          initial="hidden" 
          animate="visible" 
          custom={0.45}
          className="text-center text-[12px] text-stone-500 dark:text-stone-500 mt-12 font-medium px-4"
        >
          Việc tiếp tục sử dụng nền tảng đồng nghĩa với việc bạn đã đọc và đồng ý với các quy định trên.
        </motion.p>
      </motion.div>
    </div>
  );
}