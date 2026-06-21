import React from "react";
import { motion } from "framer-motion";

const classes = [
  {
    id: "kt-1",
    title: "Lớp Kinh Thánh I",
    subTitle: "Nền Tảng Đón Nhận",
    age: "12 - 13 tuổi",
    duration: "9 tháng (Chủ Nhật)",
    status: "Đang chiêu sinh",
    desc: "Học hỏi về Lịch sử Cứu Độ, các Tổ phụ và bước đầu làm quen với phương pháp suy niệm Lời Chúa (Lectio Divina).",
    image: "https://lh3.googleusercontent.com/d/1uA0OxFQ-wIbl39uEIn6wAybWCqpNqutc"
  },
  {
    id: "kt-2",
    title: "Lớp Kinh Thánh II",
    subTitle: "Sống Đời Chứng Nhân",
    age: "13 - 14 tuổi",
    duration: "9 tháng (Chủ Nhật)",
    status: "Đang diễn ra",
    desc: "Đi sâu vào cuộc đời Đức Kitô qua Tin Mừng Nhất Lãm, hiểu rõ các dụ ngôn và học cách áp dụng Tin Mừng vào môi trường học đường.",
    image: "https://lh3.googleusercontent.com/d/1uA0OxFQ-wIbl39uEIn6wAybWCqpNqutc"
  },
  {
    id: "kt-3",
    title: "Lớp Kinh Thánh III",
    subTitle: "Vững Bước Sứ Vụ",
    age: "14 - 15 tuổi",
    duration: "9 tháng (Chủ Nhật)",
    status: "Sắp khai giảng",
    desc: "Khám phá sách Công vụ Tông đồ, các Thư của Thánh Phaolô và chuẩn bị hành trang bước vào đời sống Kitô hữu trưởng thành.",
    image: "https://lh3.googleusercontent.com/d/1uA0OxFQ-wIbl39uEIn6wAybWCqpNqutc"
  }
];

export default function KhoiKinhThanh() {
  const handleClassClick = (id, title) => {
    console.log(`Chuyển hướng đến lớp: ${title} (${id})`);
  };

  const containerVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { staggerChildren: 0.04 } }
  };

  const itemVariants = {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 28 } }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 md:px-6 py-14 antialiased selection:bg-amber-100">
      
      {/* SHADCN HEADER */}
      <div className="space-y-2 pb-6 border-b border-stone-200/60 mb-10">
        <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-amber-800">
          Chương trình giáo lý ngành Nghĩa Sĩ
        </p>
        <h3 className="text-2xl font-bold tracking-tight text-stone-900 md:text-3xl uppercase font-serif">
          Khối Kinh Thánh
        </h3>
        <p className="text-sm text-stone-500 max-w-2xl leading-relaxed">
          Học hỏi, đào sâu Thần học và suy niệm Lời Chúa dành cho các em học sinh, giúp xây dựng nền tảng đức tin vững vàng và sống chứng nhân giữa đời.
        </p>
      </div>

      {/* SHADCN GRID */}
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
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => handleClassClick(cls.id, cls.title)}
            // Tinh chỉnh khung viền bo cong chuẩn thanh lịch, đổ bóng nhạt tinh tế hơn
            className="group flex flex-row sm:flex-col items-center sm:items-stretch gap-4 sm:gap-0 p-4 sm:p-0 rounded-2xl bg-white border border-stone-200/80 hover:border-stone-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 cursor-pointer overflow-hidden select-none"
          >
            
            {/* THUMBNAIL: Đổi sang tỉ lệ aspect-video (16:9) chuẩn Apple, giảm độ cao ảnh trên desktop */}
            <div className="w-20 h-20 sm:w-full sm:h-auto sm:aspect-video shrink-0 bg-stone-100 overflow-hidden rounded-xl sm:rounded-none relative">
              <img 
                src={cls.image} 
                alt={cls.title} 
                className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
              />
              
              {/* SHADCN BADGE: Đưa chữ nhỏ lại, tăng khoảng đệm (padding) nhìn cao cấp hơn */}
              <div className={`hidden sm:block absolute top-3 right-3 px-2 py-0.5 rounded-md text-[9px] font-bold tracking-wider border uppercase backdrop-blur-md shadow-sm ${
                cls.status === "Đang chiêu sinh" ? "bg-emerald-50/90 text-emerald-700 border-emerald-200/40" :
                cls.status === "Đang diễn ra" ? "bg-amber-50/90 text-amber-700 border-amber-200/40" :
                "bg-stone-50/90 text-stone-600 border-stone-200"
              }`}>
                {cls.status}
              </div>
            </div>

            {/* CARD CONTENT AREA */}
            <div className="flex-1 min-w-0 sm:p-5 pr-5 w-full relative flex flex-col justify-between">
              <div>
                {/* Tiêu đề & Tiêu đề phụ phân cấp rõ rệt */}
                <div className="space-y-0.5">
                  <h4 className="font-bold text-stone-900 text-base sm:text-lg tracking-tight group-hover:text-amber-800 transition-colors duration-200">
                    {cls.title}
                  </h4>
                  <p className="text-[10px] font-bold text-amber-800/80 tracking-wider uppercase sm:block hidden">
                    {cls.subTitle}
                  </p>
                </div>

                {/* Mô tả tóm tắt: Thay đổi font-size nhẹ nhàng và giãn dòng thoáng đạt */}
                <p className="text-xs sm:text-[13px] text-stone-500/90 leading-relaxed mt-2 line-clamp-2 sm:line-clamp-3 font-normal">
                  {cls.desc}
                </p>
              </div>

              {/* CARD META INFO: Làm thanh mảnh icon, hạ tone màu text phụ xuống để nổi bật nội dung chính */}
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
              
              {/* Icon mũi tên phản hồi động */}
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