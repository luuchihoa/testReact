import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
  AlertTriangle, 
  Lock, 
  GraduationCap, 
  Users2, 
  ShieldCheck, 
  School, 
  CheckCircle2, 
  ArrowRight 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAdminContext } from "./AdminContext.jsx";
import { SkeletonStyles } from "../ui/Skeleton.jsx";

// Hằng số Easing chuẩn
const APPLE_EASE = [0.16, 1, 0.3, 1];

/* ============================================================
   CẤU HÌNH GIAO DIỆN TĨNH (Đưa ra ngoài để tối ưu bộ nhớ)
   ============================================================ */
const STAT_TONES = {
  amber: {
    badge: "bg-amber-100/80 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
    ring: "hover:ring-amber-900/20 dark:hover:ring-amber-100/20 active:ring-amber-900/30",
  },
  emerald: {
    badge: "bg-emerald-100/80 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
    ring: "hover:ring-emerald-900/20 dark:hover:ring-emerald-100/20 active:ring-emerald-900/30",
  },
  blue: {
    badge: "bg-blue-100/80 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
    ring: "hover:ring-blue-900/20 dark:hover:ring-blue-100/20 active:ring-blue-900/30",
  },
  red: {
    badge: "bg-red-100/80 text-red-700 dark:bg-red-900/40 dark:text-red-400",
    ring: "hover:ring-red-900/20 dark:hover:ring-red-100/20 active:ring-red-900/30",
  },
  neutral: {
    badge: "bg-stone-100/80 text-stone-700 dark:bg-stone-800 dark:text-stone-300",
    ring: "hover:ring-stone-900/20 dark:hover:ring-stone-100/20 active:ring-stone-900/30",
  },
};

const BANNER_TONES = {
  amber: {
    wrap: "bg-amber-50/80 dark:bg-amber-900/10 border-amber-200/50 dark:border-amber-800/30",
    title: "text-amber-800/70 dark:text-amber-400/70",
    text: "text-amber-950 dark:text-amber-50",
    btn: "bg-amber-200/50 hover:bg-amber-200 dark:bg-amber-900/40 dark:hover:bg-amber-900/60 text-amber-900 dark:text-amber-100",
  },
  emerald: {
    wrap: "bg-emerald-50/80 dark:bg-emerald-900/10 border-emerald-200/50 dark:border-emerald-800/30",
    title: "text-emerald-800/70 dark:text-emerald-400/70",
    text: "text-emerald-950 dark:text-emerald-50",
    btn: "bg-emerald-200/50 hover:bg-emerald-200 dark:bg-emerald-900/40 dark:hover:bg-emerald-900/60 text-emerald-900 dark:text-emerald-100",
  },
  neutral: {
    wrap: "bg-stone-50/80 dark:bg-stone-900/10 border-stone-200/50 dark:border-stone-800/30",
    title: "text-stone-600/70 dark:text-stone-400/70",
    text: "text-stone-950 dark:text-stone-50",
    btn: "bg-stone-200/50 hover:bg-stone-200 dark:bg-stone-800/50 dark:hover:bg-stone-700/50 text-stone-900 dark:text-stone-100",
  },
};

/* ============================================================
   THẺ THỐNG KÊ (GLASSMORPHISM CARD)
   ============================================================ */
function StatTile({ label, value, icon: Icon, tone = "neutral", index = 0, onClick }) {
  const currentTone = STAT_TONES[tone];
  const isInteractive = Boolean(onClick);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: APPLE_EASE }}
      onClick={onClick}
      role={isInteractive ? "button" : "region"}
      tabIndex={isInteractive ? 0 : undefined}
      className={`group relative overflow-hidden rounded-[28px] border border-amber-900/10 dark:border-amber-100/10
        bg-white/80 dark:bg-[#1C1917]/80 backdrop-blur-xl shadow-sm
        px-5 py-5 sm:px-6 sm:py-6 transition-all duration-300 ease-out ring-1 ring-transparent
        ${isInteractive ? `cursor-pointer md:hover:-translate-y-0.5 active:scale-[0.98] ${currentTone.ring}` : ""}
      `}
    >
      <div className={`inline-flex items-center justify-center w-11 h-11 rounded-full mb-4 shadow-sm ${currentTone.badge}`}>
        <Icon className="w-5 h-5" strokeWidth={2.25} />
      </div>
      
      {/* Hiển thị dấu gạch ngang nếu chưa có dữ liệu thay vì số 0 cứng nhắc */}
      <p className="text-[28px] sm:text-[32px] font-extrabold font-serif text-amber-950 dark:text-amber-50 leading-tight tabular-nums">
        {value || value === 0 ? value : "-"}
      </p>
      
      <p className="mt-1 text-[13px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 flex items-center justify-between">
        {label}
        {isInteractive && (
          <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
        )}
      </p>
    </motion.div>
  );
}

/* ---- Skeleton đồng bộ style với Thẻ Thống Kê ---- */
function StatTileSkeleton() {
  return (
    <div className="rounded-[28px] border border-amber-900/10 dark:border-amber-100/10 bg-white/80 dark:bg-[#1C1917]/80 backdrop-blur-xl px-5 py-5 sm:px-6 sm:py-6 shadow-sm">
      <div className="w-11 h-11 rounded-full skeleton-bone mb-4" />
      <div className="h-8 w-16 rounded-lg skeleton-bone mb-3" />
      <div className="h-3.5 w-24 rounded-md skeleton-bone" />
    </div>
  );
}

/* ============================================================
   KHỐI CẢNH BÁO / LƯU Ý (INFO ALERT BOX)
   ============================================================ */
function InfoBanner({ icon: Icon, title, tone = "neutral", children, delay = 0, actionLabel, onAction }) {
  const currentTone = BANNER_TONES[tone];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: APPLE_EASE }}
      className={`${currentTone.wrap} border p-4 sm:p-5 rounded-[24px] backdrop-blur-md shadow-sm flex flex-col sm:flex-row items-start gap-4 transition-all duration-300`}
    >
      <div className="flex gap-4 flex-1">
        <div className={`mt-0.5 w-9 h-9 flex items-center justify-center rounded-full flex-shrink-0 bg-white/50 dark:bg-stone-800/50 shadow-sm border border-black/5 dark:border-white/5`}>
          <Icon className={`w-4.5 h-4.5 ${currentTone.title}`} strokeWidth={2.5} />
        </div>
        <div className="flex-1 mt-0.5">
          {title && (
            <p className={`text-[11px] font-bold uppercase tracking-widest ${currentTone.title} mb-1.5`}>
              {title}
            </p>
          )}
          <div className={`text-[14px] font-medium ${currentTone.text} leading-relaxed`}>
            {children}
          </div>
        </div>
      </div>
      
      {/* Nút Call-to-Action (nếu có) */}
      {actionLabel && (
        <button 
          onClick={onAction}
          className={`mt-3 sm:mt-0 px-4 py-2 text-sm font-semibold rounded-xl transition-colors whitespace-nowrap active:scale-95 ${currentTone.btn}`}
        >
          {actionLabel}
        </button>
      )}
    </motion.div>
  );
}

/* ============================================================
   VIEW CHÍNH: TAB TỔNG QUAN (DASHBOARD)
   ============================================================ */
export default function DashboardTab() {
  const { roleCounts, classes, namHoc, loading } = useAdminContext();
  const navigate = useNavigate(); // Khởi tạo điều hướng

  const classesNoTeacher = useMemo(() => 
    classes.filter((c) => !c.teacherUsername), 
  [classes]);

  const lockedClasses = useMemo(() => 
    classes.filter((c) => c.locks?.[1] || c.locks?.[2]), 
  [classes]);

  const noCountsData = useMemo(() => 
    Object.values(roleCounts || {}).every(val => val === 0), 
  [roleCounts]);
  
  if (loading && noCountsData && classes.length === 0) {
    return (
      <motion.div 
        key="loading" 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        className="flex flex-col gap-4 sm:gap-6"
      >
        <SkeletonStyles />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <StatTileSkeleton key={i} />)}
        </div>
        <div className="bg-white/60 dark:bg-[#1C1917]/60 border border-amber-900/10 dark:border-amber-100/10 p-5 rounded-[24px] backdrop-blur-sm flex items-start gap-4 shadow-sm">
          <div className="w-10 h-10 rounded-full skeleton-bone flex-shrink-0" />
          <div className="w-full mt-1.5">
            <div className="h-3 w-[20%] rounded-md skeleton-bone mb-3" />
            <div className="h-3.5 w-[70%] rounded-md skeleton-bone" />
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div 
        key="content"
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ duration: 0.4, ease: APPLE_EASE }}
        className="flex flex-col gap-5 sm:gap-6"
      >
        {/* --- CÁC THẺ THỐNG KÊ --- */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatTile index={0} label="Học sinh" value={roleCounts?.student} icon={Users2} tone="amber" />
          <StatTile index={1} label="Giáo viên" value={roleCounts?.teacher} icon={GraduationCap} tone="emerald" />
          <StatTile index={2} label="Quản trị viên" value={roleCounts?.admin} icon={ShieldCheck} tone="red" />
          <StatTile 
            index={3} 
            label="Tổng số lớp" 
            value={classes.length} 
            icon={School} 
            tone="neutral" 
            onClick={() => navigate("lớp-học")} // Điều hướng sang tab Lớp học
          />
        </div>

        {/* --- CÁC KHỐI CẢNH BÁO / THÔNG BÁO --- */}
        <div className="flex flex-col gap-4">
          {classesNoTeacher.length > 0 && (
            <InfoBanner 
              delay={0.3} 
              title="Thiếu giáo viên" 
              icon={AlertTriangle} 
              tone="amber"
              actionLabel="Phân công ngay"
              onAction={() => navigate("/quản-trị/lớp-học")} // Điều hướng sang tab Lớp học để phân công
            >
              Có <strong>{classesNoTeacher.length} lớp</strong> chưa có giáo viên chủ nhiệm năm học {namHoc}:{" "}
              {classesNoTeacher.map((c) => c.lop).join(", ")}.
            </InfoBanner>
          )}

          {classesNoTeacher.length === 0 && classes.length > 0 && (
            <InfoBanner delay={0.3} title="Trạng thái phân công" icon={CheckCircle2} tone="emerald">
              Tất cả các lớp đều đã được phân công giáo viên chủ nhiệm.
            </InfoBanner>
          )}

          {lockedClasses.length > 0 && (
            <InfoBanner 
              delay={0.4} 
              title="Trạng thái sổ điểm" 
              icon={Lock} 
              tone="neutral"
              actionLabel="Đến Bảng điểm"
              onAction={() => navigate("/quản-trị/sổ-điểm")} // Điều hướng sang tab Bảng điểm dựa theo cấu hình TABS
            >
              Có <strong>{lockedClasses.length} lớp</strong> đã khóa sổ ít nhất 1 học kỳ. Xem chi tiết trong mục <strong>Bảng điểm</strong>.
            </InfoBanner>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}