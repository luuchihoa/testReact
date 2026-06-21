import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

// Dữ liệu Phụng Vụ được chuẩn hóa cấu trúc hoàn toàn theo Khối Thêm Sức
const quizPhungVuList = [
  {
    slug: "ôn-tập-15-phút-học-kỳ-1",
    title: "Ôn Tập 15' - HK1",
    subTitle: "Khởi động mùa Phụng vụ",
    scope: "Từ bài 1 đến bài 6",
    duration: "15 phút (Trắc nghiệm)",
    status: "Đang mở",
    desc: "Củng cố nhanh các kiến thức nền tảng về Năm Phụng Vụ và các sắc màu phụng vụ cơ bản. Giúp các em chuẩn bị tốt cho bài kiểm tra ngắn trên lớp.",
    img: "https://lh3.googleusercontent.com/d/1PkARU0YQtJrXhd5yYt9te5QjSC8BAQ8W",
  },
  {
    slug: "ôn-tập-1-tiết-học-kỳ-1",
    title: "Ôn Tập 1 Tiết - HK1",
    subTitle: "Đào sâu ý nghĩa Bí tích",
    scope: "Từ bài 1 đến bài 10",
    duration: "45 phút (Tổng hợp)",
    status: "Đang mở",
    desc: "Hệ thống hóa kiến thức trọng tâm về Thánh lễ và các biểu tượng Phụng vụ giáo hội. Đề thi tích hợp bộ câu hỏi tình huống thực tế trực quan.",
    img: "https://lh3.googleusercontent.com/d/1LthPX942d4dtm7iuhi4PrmP92Q7qlkkn",
  },
  {
    slug: "ôn-tập-cuối-học-kỳ-1",
    title: "Ôn Tập Học Kỳ I",
    subTitle: "Vững vàng tri thức",
    scope: "Từ bài 1 đến bài 13",
    duration: "60 phút (Đề tổng kết)",
    status: "Đang mở",
    desc: "Tổng kết toàn bộ hành trình học hỏi Phụng vụ nửa đầu năm học. Kho dữ liệu câu hỏi phong phú giúp các em tự tin đạt kết quả cao trong kỳ thi chính thức.",
    img: "https://lh3.googleusercontent.com/d/1v5bau8oqor2sNxq56ysdy0ZNjN1AzPUa",
  },
  {
    slug: "ôn-tập-15-phút-học-kỳ-2",
    title: "Ôn Tập 15' - HK2",
    subTitle: "Bứt phá chặng sau",
    scope: "Từ bài 1 đến bài 6 (HK2)",
    duration: "15 phút (Trắc nghiệm)",
    status: "Sắp mở",
    desc: "Ôn tập nhanh các bài học đầu học kỳ II, tập trung vào các nghi thức trong Tuần Thánh và Tam Nhật Vượt Qua đầy linh thiêng.",
    img: "https://lh3.googleusercontent.com/d/1PkARU0YQtJrXhd5yYt9te5QjSC8BAQ8W",
  },
  {
    slug: "ôn-tập-1-tiết-học-kỳ-2",
    title: "Ôn Tập 1 Tiết - HK2",
    subTitle: "Hiệp thông và Sứ vụ",
    scope: "Từ bài 1 đến bài 10 (HK2)",
    duration: "45 phút (Tổng hợp)",
    status: "Sắp mở",
    desc: "Trắc nghiệm chuyên sâu về đời sống cầu nguyện và các Bí tích Tháp nhập. Giúp học sinh nắm vững lý thuyết và áp dụng vào đời sống sống đạo.",
    img: "https://lh3.googleusercontent.com/d/1LthPX942d4dtm7iuhi4PrmP92Q7qlkkn",
  },
  {
    slug: "ôn-tập-cuối-học-kỳ-2",
    title: "Ôn Tập Cuối Kỳ II",
    subTitle: "Hoàn thành chặng đường",
    scope: "Từ bài 1 đến bài 14 (HK2)",
    duration: "60 phút (Đề tổng kết)",
    status: "Sắp mở",
    desc: "Bài lượng giá cuối cùng khép lại năm học Phụng vụ. Đánh giá toàn diện năng lực hiểu biết tôn giáo để sẵn sàng bước sang các khối học cao hơn.",
    img: "https://lh3.googleusercontent.com/d/1v5bau8oqor2sNxq56ysdy0ZNjN1AzPUa",
  },
  {
    slug: "đố-vui-giáo-lý",
    title: "Đố Vui Giáo Lý",
    subTitle: "Học mà chơi - Chơi mà học",
    scope: "Kiến thức Phụng vụ tổng hợp",
    duration: "Không giới hạn thời gian",
    status: "Hot",
    desc: "Vượt qua các thử thách đố vui cân não từ dễ đến khó để nhận điểm thưởng thi đua, vừa giải trí vừa tích lũy thêm nhiều câu chuyện Phụng vụ lý thú.",
    img: "https://lh3.googleusercontent.com/d/150c62w3okLZfosR8Uf01YeX4QT8GPgpG",
  },
];

export default function KhoiPhungVu() {
  // Bộ token chuyển động mượt mà theo từng hàng đồng loạt
  const containerVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };

  const rowVariants = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }
  };

  // Chia mảng thành các hàng (Mỗi hàng 3 cột trên Desktop)
  const chunkArray = (arr, size) => {
    return arr.reduce((acc, _, i) => (i % size === 0 ? [...acc, arr.slice(i, i + size)] : acc), []);
  };

  const rows = chunkArray(quizPhungVuList, 3);

  return (
    <div className="mx-auto max-w-5xl px-4 md:px-6 py-14 antialiased selection:bg-amber-100">
      
      {/* SHADCN SECTION HEADER */}
      <div className="space-y-2 pb-6 border-b border-stone-200/60 mb-10">
        <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-amber-800">
          Chương trình lượng giá học tập
        </p>
        <h3 className="text-2xl font-bold tracking-tight text-stone-900 md:text-3xl uppercase font-serif">
          Khối Phụng Vụ
        </h3>
        <p className="text-sm text-stone-500 max-w-2xl leading-relaxed">
          Tổng hợp các nội dung ôn tập học kỳ và ngân hàng câu hỏi đố vui giáo lý giúp các em củng cố kiến thức Phụng vụ một cách trực quan.
        </p>
      </div>

      {/* GRID CONTAINER THEO HÀNG ĐỒNG LOẠT */}
      <motion.div 
        variants={containerVariants}
        initial="initial"
        animate="animate"
        className="flex flex-col gap-6"
      >
        {rows.map((row, rowIndex) => (
          <motion.div
            key={rowIndex}
            variants={rowVariants}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
          >
            {row.map((item, index) => (
              <Link
                key={index}
                to={`/khối-phụng-vụ/${item.slug}`}
                className="group flex flex-row sm:flex-col items-center sm:items-stretch gap-4 sm:gap-0 p-4 sm:p-0 rounded-2xl bg-white border border-stone-200/80 hover:border-stone-300 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(0,0,0,0.04)] transition-all duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform cursor-pointer overflow-hidden select-none"
              >
                
                {/* THUMBNAIL CONTAINER */}
                <div className="w-20 h-20 sm:w-full sm:h-auto sm:aspect-video shrink-0 bg-stone-100 overflow-hidden rounded-xl sm:rounded-none relative">
                  <img 
                    src={item.img} 
                    alt={item.title} 
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
                  />
                  
                  {/* SHADCN BADGE COMPONENT TRẠNG THÁI */}
                  <div className={`hidden sm:block absolute top-3 right-3 px-2 py-0.5 rounded-md text-[9px] font-bold tracking-wider border uppercase backdrop-blur-md shadow-sm ${
                    item.status === "Đang mở" ? "bg-emerald-50/90 text-emerald-700 border-emerald-200/40" :
                    item.status === "Hot" ? "bg-rose-50/90 text-rose-700 border-rose-200/40" :
                    "bg-stone-50/90 text-stone-600 border-stone-200/40"
                  }`}>
                    {item.status}
                  </div>
                </div>

                {/* CARD CONTENT AREA */}
                <div className="flex-1 min-w-0 sm:p-5 pr-5 w-full relative flex flex-col justify-between">
                  <div>
                    {/* Phân cấp tiêu đề chữ */}
                    <div className="space-y-0.5">
                      <h4 className="font-bold text-stone-900 text-base sm:text-lg tracking-tight group-hover:text-amber-800 transition-colors duration-200">
                        {item.title}
                      </h4>
                      <p className="text-[10px] font-bold text-amber-800/80 tracking-wider uppercase sm:block hidden">
                        {item.subTitle}
                      </p>
                    </div>

                    {/* Mô tả tóm tắt bài kiểm tra */}
                    <p className="text-xs sm:text-[13px] text-stone-500/90 leading-relaxed mt-2 line-clamp-2 sm:line-clamp-3 font-normal">
                      {item.desc}
                    </p>
                  </div>

                  {/* CARD META INFO (Chỉ hiển thị trên Desktop) */}
                  <div className="mt-4 sm:flex flex-col gap-1.5 hidden text-[12px] text-stone-500 border-t border-stone-100/80 pt-3.5">
                    <div className="flex items-center gap-2">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-stone-400">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                      </svg>
                      <span className="font-medium">Phạm vi: <span className="text-stone-800 font-semibold">{item.scope}</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-stone-400">
                        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                      </svg>
                      <span className="font-medium">Thời gian: <span className="text-stone-800 font-semibold">{item.duration}</span></span>
                    </div>
                  </div>
                  
                  {/* Icon mũi tên phản hồi hướng */}
                  <div className="absolute right-0 sm:right-5 top-1/2 sm:bottom-5 sm:top-auto -translate-y-1/2 sm:translate-y-0 text-stone-300 group-hover:text-amber-700 group-hover:translate-x-0.5 transition-all duration-200 sm:opacity-0 sm:group-hover:opacity-100">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m9 18 6-6-6-6"></path>
                    </svg>
                  </div>
                </div>
                
              </Link>
            ))}
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}