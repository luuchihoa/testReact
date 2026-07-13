import React from "react";
import { AlertTriangle, Lock, GraduationCap, Users2, ShieldCheck, School, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAdminContext } from "./AdminContext.jsx";
import { SkeletonStyles } from "../ui/Skeleton.jsx";

// Hằng số Easing chuẩn của Design System
const APPLE_EASE = [0.16, 1, 0.3, 1];

/* ============================================================
   THẺ THỐNG KÊ (GLASSMORPHISM CARD)
   ============================================================ */
function StatTile({ label, value, icon: Icon, tone, index = 0 }) {
  const tones = {
    amber: {
      badge: "bg-amber-100/80 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
      ring: "active:ring-amber-900/20 dark:active:ring-amber-100/20",
    },
    emerald: {
      badge: "bg-emerald-100/80 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
      ring: "active:ring-emerald-900/20 dark:active:ring-emerald-100/20",
    },
    blue: {
      badge: "bg-blue-100/80 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
      ring: "active:ring-blue-900/20 dark:active:ring-blue-100/20",
    },
    red: {
      badge: "bg-red-100/80 text-red-700 dark:bg-red-900/40 dark:text-red-400",
      ring: "active:ring-red-900/20 dark:active:ring-red-100/20",
    },
    neutral: {
      badge: "bg-stone-100/80 text-stone-700 dark:bg-stone-800 dark:text-stone-300",
      ring: "active:ring-stone-900/20 dark:active:ring-stone-100/20",
    },
  }[tone] || tones.neutral;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: APPLE_EASE }}
      className={`group relative overflow-hidden rounded-[28px] border border-amber-900/10 dark:border-amber-100/10
        bg-white/80 dark:bg-[#1C1917]/80 backdrop-blur-xl shadow-sm
        px-5 py-5 sm:px-6 sm:py-6
        transition-all duration-300 ease-out
        md:hover:-translate-y-0.5 active:scale-[0.98] ring-1 ring-transparent ${tones.ring}`}
    >
      <div className={`inline-flex items-center justify-center w-11 h-11 rounded-full mb-4 shadow-sm ${tones.badge}`}>
        <Icon className="w-5 h-5" strokeWidth={2.25} />
      </div>
      <p className="text-[28px] sm:text-[32px] font-extrabold font-serif text-amber-950 dark:text-amber-50 leading-tight tabular-nums">
        {value}
      </p>
      <p className="mt-1 text-[13px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
        {label}
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
function InfoBanner({ icon: Icon, title, tone, children, delay = 0 }) {
  const tones = {
    amber: {
      wrap: "bg-amber-50/80 dark:bg-amber-900/10 border-amber-200/50 dark:border-amber-800/30",
      title: "text-amber-800/70 dark:text-amber-400/70",
      text: "text-amber-950 dark:text-amber-50",
    },
    emerald: {
      wrap: "bg-emerald-50/80 dark:bg-emerald-900/10 border-emerald-200/50 dark:border-emerald-800/30",
      title: "text-emerald-800/70 dark:text-emerald-400/70",
      text: "text-emerald-950 dark:text-emerald-50",
    },
    neutral: {
      wrap: "bg-stone-50/80 dark:bg-stone-900/10 border-stone-200/50 dark:border-stone-800/30",
      title: "text-stone-600/70 dark:text-stone-400/70",
      text: "text-stone-950 dark:text-stone-50",
    },
  }[tone];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: APPLE_EASE }}
      className={`${tones.wrap} border p-4 sm:p-5 rounded-[24px] backdrop-blur-md shadow-sm flex items-start gap-4 transition-all duration-300`}
    >
      <div className={`mt-0.5 w-9 h-9 flex items-center justify-center rounded-full flex-shrink-0 bg-white/50 dark:bg-stone-800/50 shadow-sm border border-black/5 dark:border-white/5`}>
        <Icon className={`w-4.5 h-4.5 ${tones.title}`} strokeWidth={2.5} />
      </div>
      <div className="flex-1 mt-0.5">
        {title && (
          <p className={`text-[11px] font-bold uppercase tracking-widest ${tones.title} mb-1.5`}>
            {title}
          </p>
        )}
        <div className={`text-[14px] font-medium ${tones.text} leading-relaxed`}>
          {children}
        </div>
      </div>
    </motion.div>
  );
}

/* ============================================================
   VIEW CHÍNH: TAB TỔNG QUAN (DASHBOARD)
   ============================================================ */
export default function DashboardTab() {
  const { roleCounts, classes, namHoc, loading } = useAdminContext();

  const classesNoTeacher = classes.filter((c) => !c.teacherUsername);
  const lockedClasses = classes.filter((c) => c.locks?.[1] || c.locks?.[2]);

  const noCountsData = Object.values(roleCounts || {}).every(val => val === 0);
  
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
          <StatTile index={0} label="Học sinh"      value={roleCounts?.student || 0} icon={Users2}       tone="amber" />
          <StatTile index={1} label="Giáo viên"     value={roleCounts?.teacher || 0} icon={GraduationCap} tone="emerald" />
          <StatTile index={2} label="Quản trị viên" value={roleCounts?.admin || 0}   icon={ShieldCheck}  tone="red" />
          <StatTile index={3} label="Tổng số lớp"   value={classes.length}           icon={School}       tone="neutral" />
        </div>

        {/* --- CÁC KHỐI CẢNH BÁO / THÔNG BÁO --- */}
        <div className="flex flex-col gap-4">
          {classesNoTeacher.length > 0 && (
            <InfoBanner delay={0.3} title="Thiếu giáo viên" icon={AlertTriangle} tone="amber">
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
            <InfoBanner delay={0.4} title="Trạng thái sổ điểm" icon={Lock} tone="neutral">
              Có <strong>{lockedClasses.length} lớp</strong> đã khóa sổ ít nhất 1 học kỳ. Xem chi tiết trong mục <strong>Lớp học</strong>.
            </InfoBanner>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}