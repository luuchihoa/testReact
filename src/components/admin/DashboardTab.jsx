import React, { useMemo } from "react";
import { AlertTriangle, Lock, GraduationCap, Users2, ShieldCheck, School, CheckCircle2 } from "lucide-react";
import { useAdminContext } from "./AdminContext.jsx";
import { SkeletonStyles } from "../ui/Skeleton.jsx";

/* ============================================================
   TAB: TỔNG QUAN (module A)
   Logic giữ nguyên 100% so với OverviewTab cũ trong AdminView.jsx —
   chỉ đổi từ nhận props sang đọc trực tiếp từ AdminContext.
   UI nâng cấp: Apple-style (glass, bo góc lớn, motion mượt) + Dark Mode.
   ============================================================ */

/* ---- Stat card kiểu Apple: nền kính mờ, icon badge, số liệu nổi bật ---- */
function StatTile({ label, value, icon: Icon, tone }) {
  const tones = {
    emerald: {
      badge: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400",
      ring: "group-active:ring-emerald-500/20",
    },
    blue: {
      badge: "bg-blue-500/10 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400",
      ring: "group-active:ring-blue-500/20",
    },
    red: {
      badge: "bg-red-500/10 text-red-600 dark:bg-red-400/10 dark:text-red-400",
      ring: "group-active:ring-red-500/20",
    },
    neutral: {
      badge: "bg-stone-500/10 text-stone-600 dark:bg-white/10 dark:text-stone-300",
      ring: "group-active:ring-stone-500/20",
    },
  }[tone];

  return (
    <div
      className={`group relative overflow-hidden rounded-[22px] border border-black/5 dark:border-white/10
        bg-white/80 dark:bg-white/[0.04] backdrop-blur-xl
        shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.08)]
        dark:shadow-[0_1px_2px_rgba(0,0,0,0.2),0_8px_24px_-12px_rgba(0,0,0,0.4)]
        px-4 py-4 sm:px-5 sm:py-5
        ring-1 ring-transparent transition-all duration-300 ease-out
        active:scale-[0.97] ${tones.ring}`}
    >
      <div className={`inline-flex items-center justify-center w-9 h-9 rounded-full mb-3 ${tones.badge}`}>
        <Icon className="w-[18px] h-[18px]" strokeWidth={2.25} />
      </div>
      <p className="text-[28px] sm:text-[32px] font-semibold tracking-tight text-stone-900 dark:text-white leading-none tabular-nums">
        {value}
      </p>
      <p className="mt-1.5 text-[12.5px] font-medium text-stone-500 dark:text-stone-400">
        {label}
      </p>
    </div>
  );
}

/* ---- Skeleton riêng cho tile mới (đồng bộ style với StatTile) ---- */
function StatTileSkeleton() {
  return (
    <div className="rounded-[22px] border border-black/5 dark:border-white/10 bg-white/80 dark:bg-white/[0.04] backdrop-blur-xl px-4 py-4 sm:px-5 sm:py-5">
      <div className="w-9 h-9 rounded-full skeleton-bone mb-3" />
      <div className="h-7 w-12 rounded-lg skeleton-bone mb-2" />
      <div className="h-3 w-16 rounded-md skeleton-bone" />
    </div>
  );
}

/* ---- Banner thông báo kiểu Apple: icon tròn nổi khối, nền kính mờ ---- */
function InfoBanner({ icon: Icon, tone, children }) {
  const tones = {
    amber: {
      wrap: "bg-amber-500/10 dark:bg-amber-400/10 border-amber-500/15 dark:border-amber-400/15",
      badge: "bg-amber-500 text-white dark:bg-amber-400 dark:text-stone-900",
    },
    emerald: {
      wrap: "bg-emerald-500/10 dark:bg-emerald-400/10 border-emerald-500/15 dark:border-emerald-400/15",
      badge: "bg-emerald-500 text-white dark:bg-emerald-400 dark:text-stone-900",
    },
    neutral: {
      wrap: "bg-stone-500/[0.06] dark:bg-white/[0.05] border-black/5 dark:border-white/10",
      badge: "bg-stone-500 text-white dark:bg-white/15 dark:text-stone-200",
    },
  }[tone];

  return (
    <div
      className={`rounded-[20px] border ${tones.wrap} backdrop-blur-xl px-4 py-3.5 flex items-start gap-3
        transition-all duration-300 ease-out`}
    >
      <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0.5 ${tones.badge}`}>
        <Icon className="w-3.5 h-3.5" strokeWidth={2.5} />
      </span>
      <div className="text-[13px] leading-relaxed text-stone-700 dark:text-stone-300 pt-0.5">
        {children}
      </div>
    </div>
  );
}

export default function DashboardTab() {
  const { users, classes, namHoc, loading } = useAdminContext();

  const counts = useMemo(() => {
    const c = { admin: 0, teacher: 0, student: 0, user: 0 };
    users.forEach((u) => { c[u.role] = (c[u.role] || 0) + 1; });
    return c;
  }, [users]);

  const classesNoTeacher = classes.filter((c) => !c.teacherUsername);
  const lockedClasses = classes.filter((c) => c.locks?.[1] || c.locks?.[2]);

  // Lần tải đầu (chưa có dữ liệu users/classes nào) -> hiện skeleton thay vì
  // đếm số 0 gây hiểu nhầm "chưa có ai" trong lúc thật ra đang tải dữ liệu.
  if (loading && users.length === 0 && classes.length === 0) {
    return (
      <div className="flex flex-col gap-4 sm:gap-5 fade-in-up">
        <SkeletonStyles />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => <StatTileSkeleton key={i} />)}
        </div>
        <div className="rounded-[20px] border border-black/5 dark:border-white/10 bg-white/80 dark:bg-white/[0.04] backdrop-blur-xl px-4 py-3.5 flex items-start gap-3">
          <div className="w-7 h-7 rounded-full skeleton-bone flex-shrink-0 mt-0.5" />
          <div className="h-3 w-[70%] rounded-md skeleton-bone" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 sm:gap-5 fade-in-up">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatTile label="Học sinh"      value={counts.student}    icon={Users2}       tone="emerald" />
        <StatTile label="Giáo viên"     value={counts.teacher}    icon={GraduationCap} tone="blue" />
        <StatTile label="Quản trị viên" value={counts.admin}      icon={ShieldCheck}  tone="red" />
        <StatTile label="Tổng số lớp"   value={classes.length}    icon={School}       tone="neutral" />
      </div>

      {classesNoTeacher.length > 0 && (
        <InfoBanner icon={AlertTriangle} tone="amber">
          <span className="text-amber-800 dark:text-amber-300">
            {classesNoTeacher.length} lớp chưa có giáo viên chủ nhiệm năm học {namHoc}:{" "}
            <span className="font-semibold">{classesNoTeacher.map((c) => c.lop).join(", ")}</span>
          </span>
        </InfoBanner>
      )}

      {classesNoTeacher.length === 0 && classes.length > 0 && (
        <InfoBanner icon={CheckCircle2} tone="emerald">
          <span className="font-medium text-emerald-700 dark:text-emerald-400">
            Tất cả các lớp đều đã có giáo viên chủ nhiệm.
          </span>
        </InfoBanner>
      )}

      {lockedClasses.length > 0 && (
        <InfoBanner icon={Lock} tone="neutral">
          {lockedClasses.length} lớp đã khóa sổ ít nhất 1 học kỳ. Xem chi tiết ở tab{" "}
          <span className="font-semibold text-stone-800 dark:text-stone-200">Lớp học</span>.
        </InfoBanner>
      )}
    </div>
  );
}