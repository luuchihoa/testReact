import React from "react";
import { motion } from "framer-motion";
import { 
  Database, 
  Eye, 
  Lock, 
  Camera, 
  UserCog, 
  Mail, 
  ShieldCheck 
} from "lucide-react";

// Định nghĩa variants tĩnh bên ngoài để tối ưu bộ nhớ
const headerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (d = 0) => ({
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 120, damping: 18, mass: 0.5, delay: d },
  }),
};

const listVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.15, // Chạy nối đuôi ngay khi header đang trượt lên được một nửa
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 120, damping: 18, mass: 0.5 },
  },
};

export default function BaoMat() {
  const sections = [
    { icon: Database, heading: "1. Thông tin chúng tôi thu thập", body: "Hệ thống thu thập các thông tin cơ bản khi đăng ký tài khoản: họ tên, tên Thánh, ngày sinh, thông tin liên hệ và kết quả học tập phục vụ cho việc theo dõi quá trình học giáo lý." },
    { icon: Eye, heading: "2. Mục đích sử dụng thông tin", body: "Thông tin được sử dụng để quản lý hồ sơ học viên, hiển thị kết quả học tập, và liên hệ khi cần thiết. Chúng tôi không chia sẻ thông tin cá nhân cho bên thứ ba ngoài mục đích nội bộ." },
    { icon: Lock, heading: "3. Lưu trữ và bảo vệ dữ liệu", body: "Dữ liệu được lưu trữ trên hệ thống của Google (Google Sheets, Apps Script) với quyền truy cập giới hạn. Mật khẩu tài khoản được xử lý theo cơ chế bảo mật, không hiển thị công khai." },
    { icon: Camera, heading: "4. Ảnh đại diện và hình ảnh", body: "Ảnh đại diện do người dùng tự tải lên chỉ hiển thị trong phạm vi tài khoản cá nhân và không được sử dụng cho mục đích khác ngoài nhận diện trong hệ thống." },
    { icon: UserCog, heading: "5. Quyền của người dùng", body: "Người dùng có quyền yêu cầu chỉnh sửa, cập nhật hoặc xóa thông tin cá nhân của mình bằng cách liên hệ trực tiếp với Ban Giáo Lý qua email hoặc trang Liên hệ." },
    { icon: Mail, heading: "6. Liên hệ", body: "Mọi câu hỏi liên quan đến chính sách bảo mật, vui lòng liên hệ qua email htdcanngai@gmail.com." },
  ];

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-stone-900 dark:bg-[#09090b] dark:text-stone-50 antialiased overflow-x-hidden selection:bg-blue-500/20 dark:selection:bg-blue-500/30 transition-colors duration-500 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[400px] bg-blue-500/10 dark:bg-blue-500/15 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="absolute inset-0 pointer-events-none" style={{ maskImage: "linear-gradient(to bottom, black 0%, black 40%, transparent 100%)", WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 40%, transparent 100%)" }}>
        <div className="absolute inset-0 bg-[radial-gradient(#80808045_1px,transparent_1px)] bg-[size:20px_20px] dark:bg-[radial-gradient(#ffffff20_1px,transparent_1px)]" />
      </div>
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-12 pb-24 relative z-10">
        {/* Khối Header độc lập */}
        <header className="mb-10 text-left space-y-3 px-1">
          <motion.div variants={headerVariants} initial="hidden" animate="visible" custom={0}>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">
              <ShieldCheck className="w-3 h-3" /> Bảo mật & Dữ liệu
            </span>
          </motion.div>
          
          <motion.h1 variants={headerVariants} initial="hidden" animate="visible" custom={0.05} className="text-[32px] sm:text-4xl font-extrabold tracking-tight leading-tight">
            Chính sách bảo mật
          </motion.h1>

          <motion.p variants={headerVariants} initial="hidden" animate="visible" custom={0.1} className="text-[13px] font-medium text-stone-500 dark:text-stone-400">
            Cập nhật lần cuối: Tháng 6/2026 • Ban Giáo Lý Gx. An Ngãi
          </motion.p>
        </header>

        {/* Khối List Sections dùng motion riêng biệt, loại bỏ hoàn toàn bẫy CSS transition */}
        <motion.div 
          className="space-y-3 sm:space-y-4"
          variants={listVariants}
          initial="hidden"
          animate="visible"
        >
          {sections.map((s) => {
            const Icon = s.icon;
            return (
              <motion.section
                key={s.heading}
                variants={itemVariants}
                whileTap={{ scale: 0.98 }} // Xử lý nhấn mượt bằng JS thay cho Tailwind active:scale
                className="group bg-white dark:bg-[#121214] rounded-2xl border border-stone-200/60 dark:border-stone-800/80 p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-300 text-left flex gap-3.5 sm:gap-4 items-start cursor-pointer select-none"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-stone-50 dark:bg-stone-800 border border-stone-200/40 dark:border-stone-700/40 flex-shrink-0 text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform duration-300">
                  <Icon className="w-[18px] h-[18px]" />
                </div>
                
                <div className="space-y-1 sm:space-y-1.5 flex-1 min-w-0 pt-0.5">
                  <h2 className="text-[15px] sm:text-base font-bold text-stone-900 dark:text-stone-100 tracking-tight">
                    {s.heading}
                  </h2>
                  <p className="text-[14px] sm:text-[15px] text-stone-500 dark:text-stone-400 leading-relaxed font-medium">
                    {s.body}
                  </p>
                </div>
              </motion.section>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}