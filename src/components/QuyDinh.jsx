import React from "react";
import { motion } from "framer-motion";
import { 
  Shield, 
  UserCheck, 
  FileText, 
  Copyright, 
  RefreshCw, 
  Mail, 
  Scale 
} from "lucide-react";

const headerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (d = 0) => ({
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 16, mass: 0.6, delay: d }
  }),
};

const listVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 16, mass: 0.6 },
  },
};

export default function QuyDinh() {
  const sections = [
    { icon: Shield, heading: "1. Mục đích sử dụng", body: "Nền tảng này được Ban Giáo Lý Giáo xứ An Ngãi xây dựng nhằm hỗ trợ việc học hỏi, ôn tập giáo lý cho các em thiếu nhi và huynh trưởng trong xứ đoàn. Nội dung chỉ phục vụ mục đích giáo dục đức tin." },
    { icon: UserCheck, heading: "2. Tài khoản người dùng", body: "Mỗi tài khoản được cấp cho một cá nhân cụ thể. Người dùng có trách nhiệm bảo mật mật khẩu và không chia sẻ tài khoản cho người khác sử dụng." },
    { icon: FileText, heading: "3. Quy tắc làm bài kiểm tra", body: "Các bài trắc nghiệm và tự luận trên hệ thống được tạo ngẫu nhiên. Học viên cam kết tự làm bài, không tra cứu đáp án hay nhờ người khác làm thay trong thời gian tính giờ." },
    { icon: Copyright, heading: "4. Nội dung và bản quyền", body: "Hình ảnh và tài liệu giáo lý thuộc quyền sử dụng của Ban Giáo Lý Gx. An Ngãi. Vui lòng không sao chép, phát tán lại dưới danh nghĩa cá nhân hoặc tổ chức khác." },
    { icon: RefreshCw, heading: "5. Thay đổi quy định", body: "Ban Giáo Lý có thể cập nhật quy định sử dụng theo thời gian để phù hợp với nhu cầu thực tế. Mọi thay đổi quan trọng sẽ được thông báo trên trang chủ." },
    { icon: Mail, heading: "6. Liên hệ", body: "Nếu có thắc mắc về quy định sử dụng, vui lòng liên hệ qua email htdcanngai@gmail.com hoặc trang Liên hệ trên website." },
  ];

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-stone-900 dark:bg-[#09090b] dark:text-stone-50 antialiased overflow-x-hidden selection:bg-lime-500/20 dark:selection:bg-lime-500/30 transition-colors duration-500 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[400px] bg-lime-500/5 dark:bg-lime-500/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none" style={{ maskImage: "linear-gradient(to bottom, black 0%, black 40%, transparent 100%)", WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 40%, transparent 100%)" }}>
        <div className="absolute inset-0 bg-[radial-gradient(#80808045_1px,transparent_1px)] bg-[size:20px_20px] dark:bg-[radial-gradient(#ffffff20_1px,transparent_1px)]" />
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-12 pb-24 relative z-10">
        <header className="mb-10 text-left space-y-3 px-1">
          <motion.div variants={headerVariants} initial="hidden" animate="visible" custom={0}>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-lime-500/10 text-lime-700 dark:bg-lime-500/20 dark:text-lime-400">
              <Scale className="w-3 h-3" /> Pháp lý & Vận hành
            </span>
          </motion.div>
          
          <motion.h1 variants={headerVariants} initial="hidden" animate="visible" custom={0.05} className="text-[32px] sm:text-4xl font-extrabold tracking-tight leading-tight">
            Quy định sử dụng
          </motion.h1>

          <motion.p variants={headerVariants} initial="hidden" animate="visible" custom={0.1} className="text-[13px] font-medium text-stone-500 dark:text-stone-400">
            Cập nhật lần cuối: Tháng 6/2026 • Ban Giáo Lý Gx. An Ngãi
          </motion.p>
        </header>

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
                whileTap={{ scale: 0.98 }}
                className="group bg-white dark:bg-[#121214] rounded-2xl border border-stone-200/60 dark:border-stone-800/80 p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-300 text-left flex gap-3.5 sm:gap-4 items-start cursor-pointer select-none"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-stone-50 dark:bg-stone-800 border border-stone-200/40 dark:border-stone-700/40 flex-shrink-0 text-lime-600 dark:text-lime-400 group-hover:scale-105 transition-transform duration-300">
                  <Icon className="w-4.5 h-4.5" />
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

        <motion.p 
          variants={headerVariants} 
          initial="hidden" 
          animate="visible" 
          custom={0.45} // Nối tiếp mượt mà ngay sau khi section cuối cùng hiện lên
          className="text-center text-[12px] text-stone-400 dark:text-stone-500 mt-12 font-medium px-4"
        >
          Việc tiếp tục sử dụng nền tảng đồng nghĩa với việc bạn đã đọc và đồng ý với các quy định trên.
        </motion.p>
      </div>
    </div>
  );
}