import React from "react";
import { motion } from "framer-motion";
import { usePageMotion } from "../hooks/usePageMotion.js";
import { 
  Database, 
  Eye, 
  Lock, 
  Camera, 
  UserCog, 
  Mail, 
  ShieldCheck 
} from "lucide-react";



export default function BaoMat() {
  const { heroRef, heroY, heroReveal, vp } = usePageMotion();
  const sections = [
    { icon: Database, heading: "1. Thông tin chúng tôi thu thập", body: "Hệ thống thu thập các thông tin cơ bản khi đăng ký tài khoản: họ tên, tên Thánh, ngày sinh, thông tin liên hệ và kết quả học tập phục vụ cho việc theo dõi quá trình học giáo lý." },
    { icon: Eye, heading: "2. Mục đích sử dụng thông tin", body: "Thông tin được sử dụng để quản lý hồ sơ học viên, hiển thị kết quả học tập, và liên hệ khi cần thiết. Chúng tôi không chia sẻ thông tin cá nhân cho bên thứ ba ngoài mục đích nội bộ." },
    { icon: Lock, heading: "3. Lưu trữ và bảo vệ dữ liệu", body: "Dữ liệu được lưu trữ trên hệ thống của Google (Google Sheets, Apps Script) với quyền truy cập giới hạn. Mật khẩu tài khoản được xử lý theo cơ chế bảo mật, không hiển thị công khai." },
    { icon: Camera, heading: "4. Ảnh đại diện và hình ảnh", body: "Ảnh đại diện do người dùng tự tải lên chỉ hiển thị trong phạm vi tài khoản cá nhân và không được sử dụng cho mục đích khác ngoài nhận diện trong hệ thống." },
    { icon: UserCog, heading: "5. Quyền của người dùng", body: "Người dùng có quyền yêu cầu chỉnh sửa, cập nhật hoặc xóa thông tin cá nhân của mình bằng cách liên hệ trực tiếp với Ban Giáo Lý qua email hoặc trang Liên hệ." },
    { icon: Mail, heading: "6. Liên hệ", body: "Mọi câu hỏi liên quan đến chính sách bảo mật, vui lòng liên hệ qua email htdcanngai@gmail.com." },
  ];

  return (
    <div ref={heroRef} className="min-h-screen bg-[#FDFBF7] text-stone-800 dark:bg-[#1C1917] dark:text-stone-200 antialiased overflow-x-hidden selection:bg-amber-500/30 selection:text-amber-900 dark:selection:text-amber-100 transition-colors duration-500 relative">
      {/* Background Pattern */}
      <div className="fixed inset-0 w-full h-screen bg-[linear-gradient(to_right,#92400E08_1px,transparent_1px),linear-gradient(to_bottom,#92400E08_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#FDE68A05_1px,transparent_1px),linear-gradient(to_bottom,#FDE68A05_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none z-0" />

      {/* Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[400px] bg-amber-200/30 dark:bg-amber-900/20 blur-[100px] rounded-full pointer-events-none" />
      
      <motion.div style={{ y: heroY }} className="max-w-3xl mx-auto px-4 sm:px-6 pt-12 pb-24 relative z-10">
        {/* Khối Header */}
        <header className="mb-10 text-left space-y-3 px-1">
          <motion.div variants={heroReveal} initial="hidden" animate="visible" custom={0}>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-100/50 text-amber-800 border border-amber-200/50 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50">
              <ShieldCheck className="w-3 h-3" /> Bảo mật & Dữ liệu
            </span>
          </motion.div>
          
          <motion.h1 
            variants={heroReveal} 
            initial="hidden" 
            animate="visible" 
            custom={0.06} 
            className="text-[32px] sm:text-4xl font-extrabold tracking-tight leading-tight text-amber-950 dark:text-amber-50 font-serif"
          >
            Chính sách bảo mật
          </motion.h1>

          <motion.p variants={heroReveal} initial="hidden" animate="visible" custom={0.12} className="text-[13px] font-medium text-stone-500 dark:text-stone-400">
            Cập nhật lần cuối: Tháng 6/2026 • Ban Giáo Lý Gx. An Ngãi
          </motion.p>
        </header>

        {/* Khối List Sections */}
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
                  <Icon className="w-[18px] h-[18px]" />
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
      </motion.div>
    </div>
  );
}