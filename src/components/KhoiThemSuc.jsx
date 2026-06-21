import React from "react";
import { motion } from "framer-motion";

// Cập nhật chính xác dữ liệu thực tế: 2 lớp tương ứng với Lớp 5 và Lớp 6
const classes = [
  {
    id: "ts-1",
    title: "Lớp Thêm Sức I",
    subTitle: "Ơn Chúa Biến Đổi",
    age: "Học sinh Lớp 5",
    duration: "9 tháng (Chủ Nhật)",
    status: "Đang chiêu sinh",
    desc: "Tìm hiểu về Chúa Thánh Thần, 7 hồng ân và bước đầu học cách nhận biết, lắng nghe tiếng Ngài trong đời sống nhỏ tuổi hằng ngày.",
    image: "https://lh3.googleusercontent.com/d/1tnxBqhr_su9_FgK6zdSkLa4h-w7CAlKJ"
  },
  {
    id: "ts-2",
    title: "Lớp Thêm Sức II",
    subTitle: "Ngọn Lửa Chứng Nhân",
    age: "Học sinh Lớp 6",
    duration: "9 tháng (Chủ Nhật)",
    status: "Đang diễn ra",
    desc: "Đào sâu ý nghĩa Bí tích Thêm Sức, dọn mình sốt sắng đón nhận Ấn tín đức tin và chuẩn bị hành trang trưởng thành để làm chứng cho Chúa.",
    image: "https://lh3.googleusercontent.com/d/1tnxBqhr_su9_FgK6zdSkLa4h-w7CAlKJ"
  }
];

export default function KhoiThemSuc() {
  const handleClassClick = (id, title) => {
    console.log(`Chuyển hướng đến chi tiết lớp: ${title} (${id})`);
  };

  // Cấu hình chuyển động tinh tế (Framer Motion Tokens)
  const containerVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 28 } }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 md:px-6 py-14 antialiased selection:bg-amber-100">
      
      {/* SHADCN SECTION HEADER */}
      <div className="space-y-2 pb-6 border-b border-stone-200/60 mb-10">
        <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-amber-800">
          Chương trình giáo lý ngành Thiếu Nhi
        </p>
        <h3 className="text-2xl font-bold tracking-tight text-stone-900 md:text-3xl uppercase font-serif">
          Khối Thêm Sức
        </h3>
        <p className="text-sm text-stone-500 max-w-2xl leading-relaxed">
          Đào sâu giáo lý về Chúa Thánh Thần, chuẩn bị tâm hồn đón nhận Ấn tín đức tin để người trẻ trưởng thành, vững vàng làm chứng cho Tin Mừng.
        </p>
      </div>

      {/* SHADCN GRID CONTAINER - Tự động căn chỉnh mượt mà dựa theo số lượng 2 card */}
      <motion.div 
        variants={containerVariants}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
      >
        {classes.map((cls) => (
          <motion.div
            key={cls.id}
            variants={itemVariants}
            // whileHover={{ y: -3 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => handleClassClick(cls.id, cls.title)}
            className="group flex flex-row sm:flex-col items-center sm:items-stretch gap-4 sm:gap-0 p-4 sm:p-0 rounded-2xl bg-white border border-stone-200/80 hover:border-stone-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 cursor-pointer overflow-hidden select-none"
          >
            
            {/* THUMBNAIL CONTAINER */}
            <div className="w-20 h-20 sm:w-full sm:h-auto sm:aspect-video shrink-0 bg-stone-100 overflow-hidden rounded-xl sm:rounded-none relative">
              <img 
                src={cls.image} 
                alt={cls.title} 
                className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
              />
              
              {/* SHADCN BADGE COMPONENT */}
              <div className={`hidden sm:block absolute top-3 right-3 px-2 py-0.5 rounded-md text-[9px] font-bold tracking-wider border uppercase backdrop-blur-md shadow-sm ${
                cls.status === "Đang chiêu sinh" ? "bg-emerald-50/90 text-emerald-700 border-emerald-200/40" :
                "bg-amber-50/90 text-amber-700 border-amber-200/40"
              }`}>
                {cls.status}
              </div>
            </div>

            {/* CARD CONTENT AREA */}
            <div className="flex-1 min-w-0 sm:p-5 pr-5 w-full relative flex flex-col justify-between">
              <div>
                {/* Phân cấp tiêu đề chữ */}
                <div className="space-y-0.5">
                  <h4 className="font-bold text-stone-900 text-base sm:text-lg tracking-tight group-hover:text-amber-800 transition-colors duration-200">
                    {cls.title}
                  </h4>
                  <p className="text-[10px] font-bold text-amber-800/80 tracking-wider uppercase sm:block hidden">
                    {cls.subTitle}
                  </p>
                </div>

                {/* Mô tả tóm tắt lớp học */}
                <p className="text-xs sm:text-[13px] text-stone-500/90 leading-relaxed mt-2 line-clamp-2 sm:line-clamp-3 font-normal">
                  {cls.desc}
                </p>
              </div>

              {/* CARD META INFO (Chỉ hiển thị trên Desktop) */}
              <div className="mt-4 sm:flex flex-col gap-1.5 hidden text-[12px] text-stone-500 border-t border-stone-100/80 pt-3.5">
                <div className="flex items-center gap-2">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-stone-400">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                  </svg>
                  <span className="font-medium">Độ tuổi: <span className="text-stone-800 font-semibold">{cls.age}</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-stone-400">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                  <span className="font-medium">Thời gian: <span className="text-stone-800 font-semibold">{cls.duration}</span></span>
                </div>
              </div>
              
              {/* Icon mũi tên phản hồi hướng */}
              <div className="absolute right-0 sm:right-5 top-1/2 sm:bottom-5 sm:top-auto -translate-y-1/2 sm:translate-y-0 text-stone-300 group-hover:text-amber-700 group-hover:translate-x-0.5 transition-all duration-200 sm:opacity-0 sm:group-hover:opacity-100">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 18 6-6-6-6"></path>
                </svg>
              </div>
            </div>
            
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}