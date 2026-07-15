import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { School, Search, ChevronLeft, FileSpreadsheet, Printer, Users, Lock, AlertCircle, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAdminContext } from "./AdminContext.jsx";
import { AVATAR_FALLBACK, handleAvatarError } from "./constants.js";
import { fetchClassRoster, fetchGradesMap, fetchClassAcademicSummary } from "./dataLayer.js";
import { CardsGridSkeleton, TableSkeleton } from "../ui/Skeleton.jsx";
import { HK_INT_MAP, GRADE_FIELDS, sortStudentsByTen, tbColorClass } from "./gradeUtils.js";

// Hằng số Easing chuẩn
const APPLE_EASE = [0.16, 1, 0.3, 1];

// Nhãn học kỳ dùng chung cho tab chuyển đổi, tiêu đề bản in và tên sheet Excel.
// Trước đây mỗi nơi tự viết chuỗi riêng và bị lệch chữ hoa/thường ("Học Kỳ I"
// ở tab nhưng "Học kỳ I" ở bản in) — gom về một chỗ để luôn nhất quán và chỉ
// cần sửa một nơi nếu sau này đổi cách gọi tên học kỳ.
const HOC_KY_LABELS = { HK1: "Học Kỳ I", HK2: "Học Kỳ II" };

// Trước đây từng dòng học sinh dùng `whileInView` + `viewport once` riêng để
// tạo hiệu ứng xuất hiện — nghĩa là với một lớp 40-50 học sinh, trình duyệt
// phải tạo 40-50 IntersectionObserver cùng lúc, tốn bộ nhớ/CPU không cần
// thiết vì cả bảng đã nằm trong viewport ngay khi tab được mở. Thay bằng
// animation "stagger" điều khiển từ component cha: chỉ một lịch chạy duy
// nhất, không observer nào được tạo, hiệu ứng thị giác gần như giữ nguyên.
const listStaggerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.02 } },
};
const rowRevealVariants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: APPLE_EASE } },
};

/* ============================================================
   TAB: BẢNG ĐIỂM (module Grades)
   ============================================================ */

function ClassPicker({ classes, loading, onPick }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return classes;
    return classes.filter((c) => c.lop.toLowerCase().includes(q));
  }, [classes, search]);

  // Phân biệt "chưa có lớp nào" với "tìm không ra" — trước đây dùng chung một
  // thông báo khiến người dùng tưởng nhầm là lỗi tìm kiếm dù thực ra năm học
  // đó chưa có lớp nào được tạo.
  const emptyMessage =
    classes.length === 0 ? "Chưa có lớp học nào trong năm học này." : "Không tìm thấy lớp nào phù hợp.";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: APPLE_EASE }}
      className="bg-white/80 dark:bg-[#1C1917]/80 backdrop-blur-xl rounded-[28px] border border-amber-900/10 dark:border-amber-100/10 shadow-sm overflow-hidden"
    >
      <div className="px-5 py-5 border-b border-amber-900/10 dark:border-amber-100/10">
        <div className="relative">
          <Search className="w-5 h-5 text-amber-900/50 dark:text-amber-100/50 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm lớp..."
            aria-label="Tìm lớp"
            className="w-full rounded-xl border border-amber-900/10 dark:border-amber-100/10 bg-white/50 dark:bg-stone-900/50 pl-11 pr-4 py-3.5 text-[14px] font-medium text-amber-950 dark:text-amber-50 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-900/30 dark:focus:ring-amber-500/30 transition-shadow shadow-sm"
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-5">
            <CardsGridSkeleton count={6} />
          </motion.div>
        ) : (
          <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, ease: APPLE_EASE }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-5">
            {filtered.map((c, i) => {
              const anyLocked = c.locks?.[1] || c.locks?.[2];
              return (
                <motion.button
                  key={c.lop}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  // Giới hạn delay ở tối đa 12 phần tử — với danh sách lớp dài (vài chục
                  // lớp), người dùng không phải chờ card cuối cùng "trồi" lên sau cả giây.
                  transition={{ duration: 0.4, delay: Math.min(i, 12) * 0.05, ease: APPLE_EASE }}
                  type="button"
                  onClick={() => onPick(c.lop)}
                  className="group w-full flex flex-col text-left px-5 py-4.5 rounded-2xl transition-all duration-300 ease-out active:scale-[0.98] md:hover:-translate-y-0.5 border bg-white/60 dark:bg-stone-900/40 border-amber-900/10 dark:border-amber-100/10 md:hover:bg-amber-50/50 dark:md:hover:bg-amber-900/10 shadow-sm backdrop-blur-sm"
                >
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span className="text-[17px] font-bold text-amber-950 dark:text-amber-50 truncate font-serif">
                      {c.lop}
                    </span>
                    {anyLocked && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-800/80 dark:text-amber-400/80 bg-amber-100/50 dark:bg-amber-900/30 rounded-full px-2.5 py-1 flex-shrink-0 shadow-sm">
                        <Lock className="w-3 h-3" /> Đã khóa
                      </span>
                    )}
                  </div>
                  <p className="text-[13px] font-medium text-stone-500 dark:text-stone-400 line-clamp-2 md:truncate mb-1.5">
                    GVCN:{" "}
                    <span className="text-stone-700 dark:text-stone-300 font-bold" title={c.displayTeacherName}>
                      {c.displayTeacherName}
                    </span>
                  </p>
                  <p className="text-[13px] font-medium text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
                    <Users className="w-4 h-4" /> Sĩ số: <span className="font-bold text-stone-700 dark:text-stone-300">{c.studentCount}</span>
                  </p>
                </motion.button>
              );
            })}
            {filtered.length === 0 && (
              <p className="col-span-full text-center text-[14px] font-medium text-stone-500 dark:text-stone-400 py-12">
                {emptyMessage}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Thanh hành động phía trên bảng điểm (nút quay lại, tiêu đề lớp, chuyển học
// kỳ, xuất Excel/PDF). Tách riêng khỏi ClassGradeBook để dễ đọc, dễ test độc
// lập, và để việc thêm hành động mới (vd. gửi email báo cáo) không phải sửa
// vào giữa một component quá lớn.
function GradeBookToolbar({ lop, isLocked, hocKy, onChangeHocKy, exporting, loading, onExportExcel, onExportPdf, onBack }) {
  return (
    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 px-3 py-4 md:px-5 md:py-5 border-b border-amber-900/10 dark:border-amber-100/10 ag-no-print">
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={onBack}
          title="Quay lại danh sách lớp"
          aria-label="Quay lại danh sách lớp"
          className="inline-flex items-center justify-center gap-2 p-2 rounded-xl text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 border border-black/5 dark:border-white/5 transition-all duration-300 active:scale-[0.98] md:hover:bg-stone-200 dark:md:hover:bg-stone-700 flex-shrink-0"
        >
          <ChevronLeft className="w-5 h-5" strokeWidth={2.5} />
        </button>

        <h2 className="text-xl sm:text-2xl font-extrabold text-amber-950 dark:text-amber-50 font-serif leading-none tracking-tight">
          Lớp {lop}
        </h2>

        <div className="hidden sm:block w-px h-6 bg-amber-900/10 dark:bg-amber-100/10" />

        {isLocked && (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-amber-800/80 dark:text-amber-400/80 bg-amber-100/50 dark:bg-amber-900/30 rounded-full px-3 py-1 flex-shrink-0 ml-2 shadow-sm">
            <Lock className="w-3.5 h-3.5" strokeWidth={2.5} /> Đã khóa sổ
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
        {/* Tabs Học kỳ */}
        <div className="flex gap-1 bg-stone-100/80 dark:bg-stone-800/80 p-1 rounded-xl backdrop-blur-sm" role="tablist" aria-label="Chọn học kỳ">
          {Object.entries(HOC_KY_LABELS).map(([k, label]) => (
            <button
              key={k}
              type="button"
              role="tab"
              aria-selected={hocKy === k}
              onClick={() => onChangeHocKy(k)}
              className={`px-4 py-2 rounded-lg text-[13px] font-bold transition-all duration-300 ease-out active:scale-[0.97] ${
                hocKy === k
                  ? "bg-white text-amber-900 dark:bg-stone-700 dark:text-amber-400 shadow-sm"
                  : "text-stone-500 dark:text-stone-400 md:hover:text-stone-800 dark:md:hover:text-stone-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 ml-auto xl:ml-0">
          <button
            type="button"
            disabled={exporting || loading}
            onClick={onExportExcel}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold bg-emerald-600 text-white shadow-sm transition-all duration-300 active:scale-[0.98] md:hover:bg-emerald-700 disabled:opacity-50"
          >
            <FileSpreadsheet className="w-4 h-4" /> <span className="hidden sm:inline">{exporting ? "Đang xuất..." : "Xuất Excel"}</span>
          </button>
          <button
            type="button"
            disabled={exporting || loading}
            onClick={onExportPdf}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-black/5 dark:border-white/5 transition-all duration-300 active:scale-[0.98] md:hover:bg-stone-200 dark:md:hover:bg-stone-700 disabled:opacity-50"
          >
            <Printer className="w-4 h-4" /> <span className="hidden sm:inline">In / PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// Trạng thái lỗi có nút thử lại — trước đây khi tải thất bại, chỉ có toast
// thoáng qua rồi biến mất, bảng bên dưới hiện trống trơn không giải thích gì,
// người dùng dễ tưởng nhầm lớp không có học sinh.
function GradeBookErrorState({ onRetry }) {
  return (
    <div className="ag-no-print flex flex-col items-center gap-3 px-6 py-16 text-center">
      <AlertCircle className="w-8 h-8 text-red-500" strokeWidth={1.75} />
      <p className="font-bold text-stone-700 dark:text-stone-300">Không tải được bảng điểm</p>
      <p className="text-[13px] text-stone-500 dark:text-stone-400 max-w-sm">
        Đã có lỗi xảy ra khi tải dữ liệu. Vui lòng kiểm tra kết nối mạng và thử lại.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-amber-900 dark:bg-amber-100 text-amber-50 dark:text-amber-950 text-[13px] font-bold px-4 py-2 active:scale-[0.97] transition-transform"
      >
        <RefreshCw className="w-3.5 h-3.5" /> Thử lại
      </button>
    </div>
  );
}

// React.memo: khi ClassGradeBook re-render vì lý do không liên quan tới dữ
// liệu dòng (vd. bật cờ `exporting` lúc bấm Xuất Excel), rowsWithWarning vẫn
// giữ nguyên tham chiếu (useMemo không chạy lại) nên các dòng dưới đây được
// bỏ qua re-render hoàn toàn thay vì tính lại toàn bộ JSX mỗi lần.
const StudentMobileCard = React.memo(function StudentMobileCard({ row: r, index, scoreFields }) {
  return (
    <motion.div
      variants={rowRevealVariants}
      className={`px-3 py-4 md:px-5 md:py-5 transition-colors duration-500 ${r.warning ? "bg-red-50/60 dark:bg-red-950/20" : ""}`}
    >
      <div className="flex items-center gap-3 mb-4">
        <span className="text-[12px] font-bold text-stone-400 w-5 text-center flex-shrink-0">{index + 1}</span>
        <div className={`w-10 h-10 rounded-full overflow-hidden border-2 flex-shrink-0 shadow-sm ${r.warning ? "border-red-200 dark:border-red-900" : "border-white dark:border-stone-800 bg-stone-100"}`}>
          <img src={r.student.avatar || AVATAR_FALLBACK} alt="" loading="lazy" className="w-full h-full object-cover" onError={handleAvatarError} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-bold text-amber-950 dark:text-amber-50 leading-snug break-words">
            {r.student.tenThanh ? <span className="font-medium text-stone-500 mr-1">{r.student.tenThanh}</span> : ""}{r.student.hoTen || r.student.username}
          </p>
        </div>
        {r.warning ? (
          <span className="flex-shrink-0 inline-flex items-center px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 text-[10px] font-bold tracking-wider uppercase">
            ⚠️ Cảnh báo
          </span>
        ) : (
          <span className="flex-shrink-0 inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold tracking-wider uppercase">
            ✓ Ổn định
          </span>
        )}
      </div>

      {/* Lưới điểm mobile */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 pl-[52px]">
        {scoreFields.map((f) => (
          <div key={f.key} className="bg-white/50 dark:bg-stone-900/50 border border-amber-900/10 dark:border-amber-100/10 rounded-xl py-2.5 text-center shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-amber-800/70 dark:text-amber-400/70 mb-1">{f.label}</p>
            <p className="text-[14px] font-bold text-amber-950 dark:text-amber-50">{r[f.key] ?? "—"}</p>
          </div>
        ))}
        <div className="bg-amber-100/50 dark:bg-amber-900/30 border border-amber-200/50 dark:border-amber-800/50 rounded-xl py-2.5 text-center shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400 mb-1">Điểm TB</p>
          <p className={`text-[15px] font-extrabold ${tbColorClass(r.diem_tb)}`}>{r.diem_tb ?? "—"}</p>
        </div>
        <div className="bg-white/50 dark:bg-stone-900/50 border border-amber-900/10 dark:border-amber-100/10 rounded-xl py-2.5 text-center shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-800/70 dark:text-amber-400/70 mb-1">Học Lực</p>
          <p className="text-[13px] font-semibold text-stone-700 dark:text-stone-300">{r.hocLuc || "—"}</p>
        </div>
        <div className="bg-white/50 dark:bg-stone-900/50 border border-amber-900/10 dark:border-amber-100/10 rounded-xl py-2.5 text-center shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-800/70 dark:text-amber-400/70 mb-1">Hạnh Kiểm</p>
          <p className="text-[13px] font-semibold text-stone-700 dark:text-stone-300">{r.hanhKiem || "—"}</p>
        </div>
        <div className="col-span-3 sm:col-span-4 grid grid-cols-2 gap-3 mt-1">
          <div className="bg-white/50 dark:bg-stone-900/50 border border-amber-900/10 dark:border-amber-100/10 rounded-xl py-2.5 text-center shadow-sm flex items-center justify-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Vắng CP:</span>
            <span className="text-[14px] font-bold text-stone-700 dark:text-stone-200">{r.vangCoPhep}</span>
          </div>
          <div className="bg-white/50 dark:bg-stone-900/50 border border-amber-900/10 dark:border-amber-100/10 rounded-xl py-2.5 text-center shadow-sm flex items-center justify-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Vắng KP:</span>
            <span className={`text-[14px] font-bold ${r.vangKhongPhep > 0 ? "text-amber-600 dark:text-amber-500" : "text-stone-700 dark:text-stone-200"}`}>{r.vangKhongPhep}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

const StudentDesktopRow = React.memo(function StudentDesktopRow({ row: r, index, scoreFields }) {
  return (
    <motion.tr
      variants={rowRevealVariants}
      className={`group transition-all duration-300 md:hover:-translate-y-0.5 shadow-sm md:hover:shadow-md rounded-2xl overflow-hidden ${
        r.warning
          ? "bg-red-50/60 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50"
          : "bg-white/60 dark:bg-stone-900/40 md:hover:bg-amber-50/50 dark:md:hover:bg-amber-900/20 border border-amber-900/5 dark:border-amber-100/5"
      }`}
    >
      <td className="px-4 py-4 rounded-l-2xl text-stone-400 font-bold">{index + 1}</td>
      <td className="px-4 py-3.5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden border-2 border-white dark:border-stone-700 flex-shrink-0 shadow-sm">
          <img src={r.student.avatar || AVATAR_FALLBACK} alt="" loading="lazy" className="w-full h-full object-cover" onError={handleAvatarError} />
        </div>
        <span className="font-bold text-amber-950 dark:text-amber-50">
          {r.student.tenThanh ? <span className="font-medium text-stone-500 mr-1">{r.student.tenThanh}</span> : ""}{r.student.hoTen}
        </span>
      </td>
      {scoreFields.map((f) => (
        <td key={f.key} className="px-2 py-4 text-center font-bold text-stone-700 dark:text-stone-300">
          {r[f.key] ?? "—"}
        </td>
      ))}
      <td className={`px-3 py-4 text-center font-extrabold text-[15px] ${tbColorClass(r.diem_tb)}`}>
        {r.diem_tb ?? "—"}
      </td>
      <td className="px-2 py-4 text-center font-semibold text-stone-600 dark:text-stone-400">
        {r.hocLuc === "Trung Bình" ? "TB" : r.hocLuc || "—"}
      </td>
      <td className="px-2 py-4 text-center font-semibold text-stone-600 dark:text-stone-400">
        {r.hanhKiem === "Trung Bình" ? "TB" : r.hanhKiem || "—"}
      </td>
      <td className="px-4 py-4 text-center">
        <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-2 rounded-full text-[12px] font-bold bg-stone-200/50 dark:bg-stone-800 text-stone-600 dark:text-stone-400">
          {r.vangCoPhep}
        </span>
      </td>
      <td className="px-4 py-4 rounded-r-2xl text-center">
        <span className={`inline-flex items-center justify-center min-w-[24px] h-6 px-2 rounded-full text-[12px] font-bold shadow-sm ${r.vangKhongPhep > 0 ? "bg-amber-100/50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400" : "bg-stone-200/50 dark:bg-stone-800 text-stone-600 dark:text-stone-400"}`}>
          {r.vangKhongPhep}
        </span>
      </td>
    </motion.tr>
  );
});

function ClassGradeBook({ lop, namHoc, classInfo, showToast, onBack }) {
  const [hocKy, setHocKy] = useState("HK1");
  const hocKyInt = HK_INT_MAP[hocKy];

  const [students, setStudents] = useState([]);
  const [gradeRows, setGradeRows] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  // Bảo vệ chống race condition: nếu người dùng đổi lớp hoặc học kỳ trong lúc
  // request cũ còn đang bay, kết quả trả về chậm hơn có thể ghi đè dữ liệu mới
  // hơn đã hiển thị. requestIdRef đánh dấu "phiên" tải mới nhất; bất kỳ kết quả
  // nào không khớp requestId hiện tại đều bị bỏ qua thay vì set vào state.
  const requestIdRef = useRef(0);

  const rosterStudents = useMemo(() => sortStudentsByTen(students), [students]);

  const load = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setLoadError(null);
    try {
      const roster = await fetchClassRoster(lop, namHoc);
      const usernames = roster.map((s) => s.username);
      const [gradesByUser, summaryByUser] = await Promise.all([
        fetchGradesMap(usernames, namHoc, hocKyInt),
        fetchClassAcademicSummary(usernames, namHoc, hocKyInt),
      ]);

      if (requestId !== requestIdRef.current) return; // đã có request mới hơn, bỏ kết quả này

      const merged = {};
      roster.forEach((s) => {
        const g = gradesByUser[s.username] ?? {};
        const d = summaryByUser[s.username] ?? {};
        merged[s.username] = {
          diem_mieng: g.diem_mieng ?? null,
          diem_vo: g.diem_vo ?? null,
          diem_15_phut: g.diem_15_phut ?? null,
          diem_1_tiet: g.diem_1_tiet ?? null,
          diem_thi: g.diem_thi ?? null,
          diem_tb: g.diem_tb ?? null,
          hocLuc: d.hocLuc ?? null,
          hanhKiem: d.hanhKiem ?? null,
          vangCoPhep: d.vangCoPhep || 0,
          vangKhongPhep: d.vangKhongPhep || 0,
        };
      });

      // Cập nhật roster và điểm cùng lúc thay vì set roster ngay khi vừa fetch
      // xong (như bản cũ) — tránh trường hợp bước fetch điểm/tổng kết bị lỗi
      // giữa chừng khiến `students` đã đổi sang lớp mới nhưng `gradeRows` vẫn
      // là dữ liệu của lớp cũ, gây lệch dữ liệu hiển thị.
      setStudents(roster);
      setGradeRows(merged);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      console.error("load admin grade book error:", err);
      setLoadError(err);
      showToast("Không tải được bảng điểm", "error");
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }, [lop, namHoc, hocKyInt, showToast]);

  useEffect(() => { load(); }, [load]);

  const isLocked = !!classInfo?.locks?.[hocKyInt];
  // GRADE_FIELDS là import cấp module (tham chiếu ổn định), memo hoá để không
  // tạo mảng mới mỗi lần ClassGradeBook render.
  const scoreFields = useMemo(() => GRADE_FIELDS.filter((f) => f.key !== "diem_tb"), []);

  const rowsWithWarning = useMemo(() => {
    return rosterStudents.map((s) => {
      const g = gradeRows[s.username] || {};
      const tongVang = (g.vangCoPhep || 0) + (g.vangKhongPhep || 0);
      const warning = (g.diem_tb != null && Number(g.diem_tb) < 5) || tongVang > 3;
      return { student: s, ...g, tongVang, warning };
    });
  }, [rosterStudents, gradeRows]);

  const [exporting, setExporting] = useState(false);

  const exportExcel = useCallback(async () => {
    setExporting(true);
    try {
      const XLSX = await import("xlsx");
      const data = rowsWithWarning.map((r, idx) => ({
        "STT": idx + 1,
        "Họ & Tên": `${r.student.tenThanh ? r.student.tenThanh + " " : ""}${r.student.hoTen || r.student.username}`,
        "Miệng": r.diem_mieng ?? "",
        "Vở": r.diem_vo ?? "",
        "15'": r.diem_15_phut ?? "",
        "1 Tiết": r.diem_1_tiet ?? "",
        "Thi": r.diem_thi ?? "",
        "Điểm TB": r.diem_tb ?? "",
        "Học Lực": r.hocLuc ?? "",
        "Hạnh Kiểm": r.hanhKiem ?? "",
        "Vắng Có Phép": r.vangCoPhep,
        "Vắng Không Phép": r.vangKhongPhep,
        "Trạng Thái": r.warning ? "Cần theo dõi" : "Ổn định",
      }));
      const ws = XLSX.utils.json_to_sheet(data);
      ws["!cols"] = [{ wch: 5 }, { wch: 26 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 13 }, { wch: 15 }, { wch: 14 }];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, HOC_KY_LABELS[hocKy]);
      XLSX.writeFile(wb, `BangDiem_${lop}_${hocKy}_${namHoc}.xlsx`);
      showToast("Đã xuất file Excel thành công", "success");
    } catch (err) {
      console.error("export excel error:", err);
      showToast("Xuất Excel thất bại", "error");
    } finally {
      setExporting(false);
    }
  }, [rowsWithWarning, hocKy, lop, namHoc, showToast]);

  const exportPDF = useCallback(() => {
    requestAnimationFrame(() => window.print());
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.4, ease: APPLE_EASE }}
      className="md:bg-white/80 dark:md:bg-[#1C1917]/80 md:backdrop-blur-xl md:rounded-[28px] md:border md:border-amber-900/10 dark:md:border-amber-100/10 md:shadow-sm overflow-hidden print:overflow-visible print:bg-white print:shadow-none print:border-0 print:rounded-none print:backdrop-blur-none flex flex-col"
      // className="bg-white/80 dark:bg-[#1C1917]/80 backdrop-blur-xl rounded-[28px] border border-amber-900/10 dark:border-amber-100/10 shadow-sm overflow-hidden print:overflow-visible print:bg-white print:shadow-none print:border-0 print:rounded-none print:backdrop-blur-none flex flex-col"
    >
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #admin-grades-print, #admin-grades-print * { visibility: visible; }
          #admin-grades-print { position: absolute; left: 0; top: 0; width: 100%; }
          .ag-no-print { display: none !important; }
        }
      `}</style>

      <GradeBookToolbar
        lop={lop}
        isLocked={isLocked}
        hocKy={hocKy}
        onChangeHocKy={setHocKy}
        exporting={exporting}
        loading={loading}
        onExportExcel={exportExcel}
        onExportPdf={exportPDF}
        onBack={onBack}
      />

      <AnimatePresence mode="wait">
        {loadError ? (
          <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <GradeBookErrorState onRetry={load} />
          </motion.div>
        ) : loading ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="ag-no-print p-5">
            <TableSkeleton rows={8} columns={6} />
          </motion.div>
        ) : (
          <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, ease: APPLE_EASE }} id="admin-grades-print">
            <div className="hidden print:block px-5 pt-5 pb-3">
              <h2 className="text-xl font-bold text-stone-900 font-serif">
                Bảng điểm lớp {lop} — {HOC_KY_LABELS[hocKy]} — {namHoc}
              </h2>
            </div>

            {rowsWithWarning.length === 0 ? (
              <p className="text-center text-[14px] font-medium text-stone-500 dark:text-stone-400 py-12">
                Lớp chưa có học sinh nào.
              </p>
            ) : (
              <>
                {/* ----- GIAO DIỆN MOBILE ----- */}
                <motion.div
                  initial="hidden"
                  animate="show"
                  variants={listStaggerVariants}
                  className="md:hidden print:hidden divide-y divide-amber-900/5 dark:divide-amber-100/5"
                  data-lenis-prevent
                >
                  {rowsWithWarning.map((r, idx) => (
                    <StudentMobileCard key={r.student.username} row={r} index={idx} scoreFields={scoreFields} />
                  ))}
                </motion.div>

                {/* ----- GIAO DIỆN DESKTOP + IN ----- */}
                <div className="hidden md:block overflow-auto max-h-[65vh] p-4" data-lenis-prevent>
                  <table className="w-full border-separate border-spacing-y-2">
                    <thead>
                      <tr className="text-[11px] font-bold uppercase tracking-wider text-amber-800/70 dark:text-amber-400/70">
                        <th className="px-4 py-3 text-left w-14">STT</th>
                        <th className="px-4 py-3 text-left">Học sinh</th>
                        {scoreFields.map((f) => <th key={f.key} className="px-2 py-3 text-center">{f.label}</th>)}
                        <th className="px-3 py-3 text-center text-amber-900 dark:text-amber-400">TB</th>
                        <th className="px-2 py-3 text-center">Học Lực</th>
                        <th className="px-2 py-3 text-center">Hạnh Kiểm</th>
                        <th className="px-4 py-3 text-center">Vắng CP</th>
                        <th className="px-4 py-3 text-center">Vắng KP</th>
                      </tr>
                    </thead>
                    <motion.tbody
                      initial="hidden"
                      animate="show"
                      variants={listStaggerVariants}
                      className="text-[13.5px] font-medium"
                    >
                      {rowsWithWarning.map((r, idx) => (
                        <StudentDesktopRow key={r.student.username} row={r} index={idx} scoreFields={scoreFields} />
                      ))}
                    </motion.tbody>
                  </table>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cảnh báo / Ghi chú Footer */}
      <div className="mt-auto px-3 py-4 md:p-5 ag-no-print border-t border-amber-900/10 dark:border-amber-100/10">
        <div className="bg-amber-50/80 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-800/30 p-3 md:p-4 rounded-xl md:rounded-2xl backdrop-blur-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-800/70 dark:text-amber-400/70 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-[12px] font-bold uppercase tracking-wider text-amber-800/70 dark:text-amber-400/70 mb-1">
              Chế độ chỉ xem
            </p>
            <p className="text-[13.5px] font-medium text-amber-950 dark:text-amber-50 leading-relaxed">
              Dòng cảnh báo biểu thị học sinh có Điểm TB &lt; 5 hoặc vắng &gt; 3 buổi. Để chỉnh sửa điểm hoặc mở/khóa sổ học kỳ, vui lòng truy cập qua tài khoản Giáo viên chủ nhiệm hoặc cấu hình tại tab <strong>Lớp học</strong>.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function GradesTab() {
  const { classes, namHoc, loading, showToast } = useAdminContext();
  const [selectedLop, setSelectedLop] = useState(null);

  const selectedClass = useMemo(
    () => classes.find((c) => c.lop === selectedLop) || null,
    [classes, selectedLop]
  );

  useEffect(() => {
    if (selectedLop && !loading && !classes.some((c) => c.lop === selectedLop)) {
      setSelectedLop(null);
    }
  }, [namHoc, classes, loading, selectedLop]);

  if (!selectedLop) {
    return (
      <div className="flex flex-col gap-6 fade-in-up">
        <div className="bg-amber-50/80 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-800/30 p-5 rounded-2xl backdrop-blur-sm flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-amber-100/50 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0 border border-amber-200/50 dark:border-amber-800/50">
            <School className="w-5 h-5 text-amber-800 dark:text-amber-400" />
          </div>
          <div className="mt-0.5">
            <p className="text-[13px] font-bold uppercase tracking-wider text-amber-800/70 dark:text-amber-400/70 mb-1">
              Tra cứu bảng điểm
            </p>
            <p className="text-[14px] font-medium text-amber-950 dark:text-amber-50 leading-relaxed">
              Chọn một lớp bên dưới để theo dõi chi tiết điểm số, chuyên cần và học lực của học sinh trong năm học {namHoc}.
            </p>
          </div>
        </div>
        <ClassPicker classes={classes} loading={loading} onPick={setSelectedLop} />
      </div>
    );
  }

  return (
    <ClassGradeBook
      lop={selectedLop}
      namHoc={namHoc}
      classInfo={selectedClass}
      showToast={showToast}
      onBack={() => setSelectedLop(null)}
    />
  );
}