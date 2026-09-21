import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  AlertTriangle, 
  Lock, 
  GraduationCap, 
  Users2, 
  ShieldCheck, 
  School, 
  CheckCircle2, 
  ArrowRight,
  UserPlus,
  MessageSquare,
  FileCheck,
  Calendar,
  Megaphone,
  BarChart3,
  Sparkles,
  ChevronRight,
  RotateCcw,
  Clock,
  RefreshCw
} from "lucide-react";
import { motion } from "framer-motion";
import { useAdminContext } from "./AdminContext.jsx";
import { SkeletonStyles } from "../../components/ui/Skeleton.jsx";
import AcademicCalendarModal from "./components/AcademicCalendarModal.jsx";
import { SECTORS_DATA, detectSectorId } from "../../data/sectorsData.js";
import { useMotionConfig } from "../../hooks/useMotionConfig.js";

const APPLE_EASE = [0.16, 1, 0.3, 1];

const STAT_TONES = {
  primary: {
    badge: "bg-[#314e3e]/10 text-[#314e3e] dark:bg-[#d6b883]/20 dark:text-[#d6b883]",
    ring: "hover:ring-[#314e3e]/30 dark:hover:ring-[#d6b883]/30 active:ring-[#314e3e]/40",
  },
  accent: {
    badge: "bg-[#927140]/10 text-[#927140] dark:bg-[#d4b47d]/20 dark:text-[#d4b47d]",
    ring: "hover:ring-[#927140]/30 dark:hover:ring-[#d4b47d]/30 active:ring-[#927140]/40",
  },
  emerald: {
    badge: "bg-emerald-100/80 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300",
    ring: "hover:ring-emerald-700/20 dark:hover:ring-emerald-400/20 active:ring-emerald-700/30",
  },
  neutral: {
    badge: "bg-stone-100/90 text-stone-700 dark:bg-stone-800 dark:text-stone-300",
    ring: "hover:ring-stone-400/30 active:ring-stone-400/40",
  },
};

function getVietnamDateInfo() {
  const now = new Date();
  let formatted = "Hôm nay";
  let dateKey = "";
  try {
    const dateStr = new Intl.DateTimeFormat("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    }).format(now);
    formatted = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);

    dateKey = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Ho_Chi_Minh",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).format(now);
  } catch {
    dateKey = now.toISOString().slice(0, 10);
  }
  return { dateKey, formattedToday: formatted };
}

function StatTile({ label, subLabel, value, icon: Icon, tone = "neutral", index = 0, to }) {
  const currentTone = STAT_TONES[tone] || STAT_TONES.neutral;
  const { reduced } = useMotionConfig();

  const content = (
    <div className={`group relative overflow-hidden rounded-3xl border border-[#dedfd4] dark:border-[#354237]
      bg-[#fffefa] dark:bg-[#1e2821] shadow-xs
      p-4 sm:p-5 transition-all duration-200 ease-out ring-1 ring-transparent min-h-[120px] flex flex-col justify-between
      ${to ? `cursor-pointer motion-safe:md:hover:-translate-y-0.5 motion-safe:active:scale-[0.98] ${currentTone.ring}` : ""}
    `}>
      <div className="flex items-start justify-between gap-2">
        <div className={`inline-flex items-center justify-center w-10 h-10 rounded-2xl shadow-xs flex-shrink-0 ${currentTone.badge}`}>
          <Icon className="w-5 h-5" strokeWidth={2.25} aria-hidden="true" />
        </div>
        {to && (
          <span className="p-1 text-[#575e55] dark:text-[#b0b9ac] group-hover:text-[#314e3e] dark:group-hover:text-[#d6b883] motion-safe:group-hover:translate-x-0.5 transition-all">
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </span>
        )}
      </div>

      <div className="mt-3">
        <p className="text-2xl sm:text-3xl font-extrabold font-sans text-[#293d32] dark:text-[#ecece0] leading-tight tabular-nums">
          {value !== undefined && value !== null ? value : "-"}
        </p>
        
        <p className="mt-1 text-xs font-bold uppercase tracking-wider text-[#575e55] dark:text-[#b0b9ac] break-words">
          {label}
        </p>

        {subLabel && (
          <p className="text-xs text-[#575e55]/80 dark:text-[#b0b9ac]/80 font-medium break-words mt-0.5 leading-snug">
            {subLabel}
          </p>
        )}
      </div>
    </div>
  );

  if (reduced) {
    return to ? (
      <Link 
        to={to} 
        className="block rounded-3xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#314e3e] dark:focus-visible:ring-[#d6b883] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#151c18]"
        aria-label={`${label}: ${value} (${subLabel || ""})`}
      >
        {content}
      </Link>
    ) : (
      <div>{content}</div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04, ease: APPLE_EASE }}
    >
      {to ? (
        <Link 
          to={to} 
          className="block rounded-3xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#314e3e] dark:focus-visible:ring-[#d6b883] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#151c18]"
          aria-label={`${label}: ${value} (${subLabel || ""})`}
        >
          {content}
        </Link>
      ) : (
        content
      )}
    </motion.div>
  );
}

function StatTileSkeleton() {
  return (
    <div className="rounded-3xl border border-[#dedfd4] dark:border-[#354237] bg-[#fffefa] dark:bg-[#1e2821] p-5 shadow-xs min-h-[120px]">
      <div className="w-10 h-10 rounded-2xl skeleton-bone mb-3" />
      <div className="h-7 w-16 rounded-lg skeleton-bone mb-2" />
      <div className="h-3.5 w-24 rounded-md skeleton-bone" />
    </div>
  );
}

/* ============================================================
   HỘP MỤC MỚI CẦN XEM (ACTIONABLE PENDING QUEUE)
   ============================================================ */
function ActionablePendingQueue({ 
  pendingDangKy, 
  pendingGopY, 
  pendingBaiViet, 
  totalPending,
  pendingStatus,
  onRetryDangKy,
  onRetryGopY,
  onRetryBaiViet
}) {
  const hasErrors = Boolean(
    pendingStatus?.dangKy?.error || 
    pendingStatus?.gopY?.error || 
    pendingStatus?.baiViet?.error
  );

  const isAnyLoading = Boolean(
    pendingStatus?.dangKy?.loading && 
    pendingStatus?.gopY?.loading && 
    pendingStatus?.baiViet?.loading
  );

  return (
    <div className="bg-[#fffefa] dark:bg-[#1e2821] rounded-3xl border border-[#dedfd4] dark:border-[#354237] p-4 sm:p-5 shadow-xs flex flex-col gap-3.5">
      <div className="flex items-center justify-between border-b border-[#dedfd4] dark:border-[#354237] pb-3">
        <h3 className="text-sm sm:text-base font-bold font-sans text-[#293d32] dark:text-[#ecece0] flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#927140] dark:text-[#d4b47d]" aria-hidden="true" />
          <span>Mục Mới Cần Xem</span>
        </h3>
        {totalPending > 0 ? (
          <span className="inline-flex items-center justify-center min-w-[24px] min-h-[22px] px-2 rounded-full bg-red-500 text-white text-xs font-bold tabular-nums">
            {totalPending} việc
          </span>
        ) : !hasErrors ? (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" /> Cập nhật
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 dark:text-amber-400">
            <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" /> Chưa đồng bộ
          </span>
        )}
      </div>

      {isAnyLoading ? (
        <div className="flex flex-col gap-2.5 py-2">
          <div className="h-12 rounded-2xl skeleton-bone" />
          <div className="h-12 rounded-2xl skeleton-bone" />
        </div>
      ) : (totalPending > 0 || hasErrors) ? (
        <div className="flex flex-col gap-2.5">
          {/* 1. Đăng ký học mới */}
          {pendingStatus?.dangKy?.error ? (
            <div className="p-3 sm:p-3.5 min-h-[48px] rounded-2xl bg-red-50/70 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <AlertTriangle className="w-4.5 h-4.5 text-red-600 dark:text-red-400 flex-shrink-0" />
                <p className="text-xs text-red-800 dark:text-red-300 font-medium">
                  Chưa thể tải số lượng đăng ký học mới
                </p>
              </div>
              <button
                type="button"
                onClick={onRetryDangKy}
                className="px-2.5 py-1 min-h-[36px] rounded-lg text-xs font-bold bg-white dark:bg-stone-800 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700 hover:bg-red-50 flex items-center gap-1 flex-shrink-0 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" /> Thử lại
              </button>
            </div>
          ) : pendingDangKy > 0 && (
            <Link
              to="/quản-trị/đăng-ký"
              className="p-3 sm:p-3.5 min-h-[48px] rounded-2xl bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237] hover:border-[#314e3e]/40 dark:hover:border-[#d6b883]/40 transition-all motion-safe:active:scale-[0.99] flex items-center justify-between gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#314e3e]"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 flex items-center justify-center flex-shrink-0">
                  <UserPlus className="w-4.5 h-4.5" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-bold text-[#293d32] dark:text-[#ecece0] group-hover:text-[#314e3e] dark:group-hover:text-[#d6b883] transition-colors break-words">
                    Đăng ký học Giáo lý mới
                  </p>
                  <p className="text-xs text-[#575e55] dark:text-[#b0b9ac] leading-snug">
                    {pendingDangKy} hồ sơ đang chờ xét duyệt
                  </p>
                </div>
              </div>
              <span className="px-3 py-1.5 min-h-[36px] rounded-xl text-xs font-bold bg-[#314e3e] text-white group-hover:bg-[#253d30] dark:bg-[#d6b883] dark:text-[#19251d] transition-all flex items-center gap-1 flex-shrink-0">
                Duyệt <ChevronRight className="w-3.5 h-3.5 motion-safe:group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
              </span>
            </Link>
          )}

          {/* 2. Góp ý / Liên hệ */}
          {pendingStatus?.gopY?.error ? (
            <div className="p-3 sm:p-3.5 min-h-[48px] rounded-2xl bg-red-50/70 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <AlertTriangle className="w-4.5 h-4.5 text-red-600 dark:text-red-400 flex-shrink-0" />
                <p className="text-xs text-red-800 dark:text-red-300 font-medium">
                  Chưa thể tải hòm thư góp ý mới
                </p>
              </div>
              <button
                type="button"
                onClick={onRetryGopY}
                className="px-2.5 py-1 min-h-[36px] rounded-lg text-xs font-bold bg-white dark:bg-stone-800 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700 hover:bg-red-50 flex items-center gap-1 flex-shrink-0 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" /> Thử lại
              </button>
            </div>
          ) : pendingGopY > 0 && (
            <Link
              to="/quản-trị/góp-ý"
              className="p-3 sm:p-3.5 min-h-[48px] rounded-2xl bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237] hover:border-[#314e3e]/40 dark:hover:border-[#d6b883]/40 transition-all motion-safe:active:scale-[0.99] flex items-center justify-between gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#314e3e]"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300 flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-4.5 h-4.5" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-bold text-[#293d32] dark:text-[#ecece0] group-hover:text-[#314e3e] dark:group-hover:text-[#d6b883] transition-colors break-words">
                    Hòm thư Góp ý / Liên hệ
                  </p>
                  <p className="text-xs text-[#575e55] dark:text-[#b0b9ac] leading-snug">
                    {pendingGopY} thư mới từ phụ huynh
                  </p>
                </div>
              </div>
              <span className="px-3 py-1.5 min-h-[36px] rounded-xl text-xs font-bold bg-[#314e3e] text-white group-hover:bg-[#253d30] dark:bg-[#d6b883] dark:text-[#19251d] transition-all flex items-center gap-1 flex-shrink-0">
                Xem thư <ChevronRight className="w-3.5 h-3.5 motion-safe:group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
              </span>
            </Link>
          )}

          {/* 3. Bài viết cộng đoàn */}
          {pendingStatus?.baiViet?.error ? (
            <div className="p-3 sm:p-3.5 min-h-[48px] rounded-2xl bg-red-50/70 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <AlertTriangle className="w-4.5 h-4.5 text-red-600 dark:text-red-400 flex-shrink-0" />
                <p className="text-xs text-red-800 dark:text-red-300 font-medium">
                  Chưa thể tải bài viết chờ duyệt
                </p>
              </div>
              <button
                type="button"
                onClick={onRetryBaiViet}
                className="px-2.5 py-1 min-h-[36px] rounded-lg text-xs font-bold bg-white dark:bg-stone-800 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700 hover:bg-red-50 flex items-center gap-1 flex-shrink-0 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" /> Thử lại
              </button>
            </div>
          ) : pendingBaiViet > 0 && (
            <Link
              to="/quản-trị/bài-viết"
              className="p-3 sm:p-3.5 min-h-[48px] rounded-2xl bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237] hover:border-[#314e3e]/40 dark:hover:border-[#d6b883]/40 transition-all motion-safe:active:scale-[0.99] flex items-center justify-between gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#314e3e]"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950/50 text-purple-800 dark:text-purple-300 flex items-center justify-center flex-shrink-0">
                  <FileCheck className="w-4.5 h-4.5" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-bold text-[#293d32] dark:text-[#ecece0] group-hover:text-[#314e3e] dark:group-hover:text-[#d6b883] transition-colors break-words">
                    Bài viết cộng đoàn
                  </p>
                  <p className="text-xs text-[#575e55] dark:text-[#b0b9ac] leading-snug">
                    {pendingBaiViet} bài chờ duyệt & đăng
                  </p>
                </div>
              </div>
              <span className="px-3 py-1.5 min-h-[36px] rounded-xl text-xs font-bold bg-[#314e3e] text-white group-hover:bg-[#253d30] dark:bg-[#d6b883] dark:text-[#19251d] transition-all flex items-center gap-1 flex-shrink-0">
                Duyệt <ChevronRight className="w-3.5 h-3.5 motion-safe:group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
              </span>
            </Link>
          )}
        </div>
      ) : (
        <div className="py-4 text-center">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100/80 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 mx-auto flex items-center justify-center mb-2">
            <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
          </div>
          <p className="text-xs sm:text-sm font-bold text-[#293d32] dark:text-[#ecece0]">
            Không có mục mới trong các nhóm đang theo dõi
          </p>
          <p className="text-xs text-[#575e55] dark:text-[#b0b9ac] mt-1 max-w-xs mx-auto leading-relaxed">
            Hồ sơ tuyển sinh, hòm thư góp ý và bài viết cộng đoàn hiện không có mục mới cần xét duyệt.
          </p>
        </div>
      )}
    </div>
  );
}

export default function DashboardTab() {
  const { 
    roleCounts, 
    classes, 
    namHoc, 
    loading, 
    pendingDangKy = 0, 
    pendingGopY = 0, 
    pendingBaiViet = 0,
    pendingStatus,
    refreshPendingDangKy,
    refreshPendingGopY,
    refreshPendingBaiViet,
    showToast,
    refreshAll,
    loadAll
  } = useAdminContext();
  
  const [calendarModalOpen, setCalendarModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Tổng số lượng việc mới cần xem
  const totalPending = (pendingDangKy || 0) + (pendingGopY || 0) + (pendingBaiViet || 0);

  // Lọc các lớp chưa có GLV phụ trách
  const classesNoTeacher = useMemo(() => 
    classes.filter((c) => {
      const teachers = c.teacherUsernames || (c.teacherUsername ? [c.teacherUsername] : []);
      return teachers.length === 0;
    }), 
  [classes]);

  // Lọc các lớp đã khóa sổ điểm ít nhất 1 học kỳ
  const lockedClasses = useMemo(() => 
    classes.filter((c) => c.locks?.[1] || c.locks?.[2]), 
  [classes]);

  // Tổng sĩ số Giáo lý sinh trong niên khóa đang xem
  const totalStudentsEnrolled = useMemo(() => 
    classes.reduce((sum, c) => sum + (Number(c.studentCount) || 0), 0),
  [classes]);

  // Thống kê phân bổ theo Khối Giáo lý
  const sectorStats = useMemo(() => {
    const map = {};
    SECTORS_DATA.forEach(s => {
      map[s.id] = { ...s, classCount: 0, studentCount: 0, classNames: [] };
    });

    let otherClasses = { id: "other", label: "Chưa xác định khối", classCount: 0, studentCount: 0, classNames: [], isOther: true };

    classes.forEach(c => {
      const sectorId = detectSectorId(c.lop);
      if (map[sectorId]) {
        map[sectorId].classCount += 1;
        map[sectorId].studentCount += (Number(c.studentCount) || 0);
        map[sectorId].classNames.push(c.lop);
      } else {
        otherClasses.classCount += 1;
        otherClasses.studentCount += (Number(c.studentCount) || 0);
        otherClasses.classNames.push(c.lop);
      }
    });

    const result = SECTORS_DATA.map(s => {
      const data = map[s.id];
      const percentage = totalStudentsEnrolled > 0 ? Math.round((data.studentCount / totalStudentsEnrolled) * 100) : 0;
      return { ...data, percentage };
    });

    if (otherClasses.classCount > 0) {
      const percentage = totalStudentsEnrolled > 0 ? Math.round((otherClasses.studentCount / totalStudentsEnrolled) * 100) : 0;
      result.push({ ...otherClasses, percentage });
    }

    return result;
  }, [classes, totalStudentsEnrolled]);

  // Định dạng ngày hôm nay theo múi giờ Việt Nam và cập nhật chính xác qua đêm
  const [dateInfo, setDateInfo] = useState(() => getVietnamDateInfo());

  useEffect(() => {
    const checkAndUpdateDate = () => {
      const next = getVietnamDateInfo();
      setDateInfo((prev) => (prev.dateKey !== next.dateKey ? next : prev));
    };

    // 1. Cập nhật khi tab trở lại trạng thái hiển thị
    const onVisibility = () => {
      if (document.visibilityState === "visible") checkAndUpdateDate();
    };
    document.addEventListener("visibilitychange", onVisibility);

    // 2. Timer chu kỳ 60s để tự động chuyển ngày qua nửa đêm
    const timer = setInterval(checkAndUpdateDate, 60 * 1000);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      clearInterval(timer);
    };
  }, []);

  // Làm mới toàn diện tất cả các nguồn dữ liệu với phản hồi chính xác
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await refreshAll({ showLoading: false });
      if (res?.ok) {
        if (showToast) showToast("Đã cập nhật dữ liệu mới nhất", "success");
      } else if (res?.partial) {
        if (showToast) showToast("Chỉ làm mới được một phần dữ liệu, vui lòng thử lại", "warning");
      } else {
        if (showToast) showToast("Không thể làm mới dữ liệu", "error");
      }
    } catch {
      if (showToast) showToast("Không thể làm mới dữ liệu", "error");
    } finally {
      setIsRefreshing(false);
    }
  };

  const noCountsData = useMemo(() => 
    Object.values(roleCounts || {}).every(val => val === 0), 
  [roleCounts]);
  
  if (loading && noCountsData && classes.length === 0) {
    return (
      <div className="flex flex-col gap-5 sm:gap-6">
        <SkeletonStyles />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5 sm:gap-4">
          {Array.from({ length: 4 }).map((_, i) => <StatTileSkeleton key={i} />)}
        </div>
        <div className="bg-[#fffefa] dark:bg-[#1e2821] border border-[#dedfd4] dark:border-[#354237] p-6 rounded-3xl shadow-xs">
          <div className="h-4 w-1/3 rounded-md skeleton-bone mb-4" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 rounded-2xl skeleton-bone" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      {/* ============================================================
          1. HEADER TỔNG QUAN TINH GỌN & TRẠNG THÁI NIÊN KHÓA
          ============================================================ */}
      <div className="bg-[#fffefa] dark:bg-[#1e2821] border border-[#dedfd4] dark:border-[#354237] rounded-3xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#314e3e]/10 text-[#314e3e] dark:bg-[#d6b883]/20 dark:text-[#d6b883]">
              <span className="w-2 h-2 rounded-full bg-emerald-500" aria-hidden="true" />
              Niên khóa {namHoc}
            </span>
            <span className="text-xs font-medium text-[#575e55] dark:text-[#b0b9ac]">
              · {dateInfo.formattedToday}
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold font-sans text-[#293d32] dark:text-[#ecece0] tracking-tight">
            Ban Giáo lý Giáo xứ An Ngãi
          </h2>
          <p className="text-xs sm:text-sm text-[#575e55] dark:text-[#b0b9ac] mt-0.5 leading-snug">
            Theo dõi tình hình học tập, phân công Giáo lý viên và quản lý sinh hoạt Xứ đoàn.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
          {classes.length === 0 ? (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[44px] rounded-2xl text-xs font-bold bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300 border border-[#dedfd4] dark:border-[#354237]">
              Chưa có lớp học
            </span>
          ) : classesNoTeacher.length === 0 ? (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[44px] rounded-2xl text-xs font-bold bg-emerald-100/80 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-300/40">
              <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" /> Đủ GLV phụ trách
            </span>
          ) : (
            <Link
              to="/quản-trị/lớp-học?status=unassigned"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[44px] rounded-2xl text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-300/40 hover:bg-amber-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            >
              <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" /> {classesNoTeacher.length} lớp cần phân công
            </Link>
          )}

          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            title="Làm mới toàn bộ dữ liệu quản trị"
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 min-h-[44px] rounded-2xl text-xs font-bold bg-[#faf8f3] dark:bg-[#151c18] text-[#575e55] dark:text-[#b0b9ac] border border-[#dedfd4] dark:border-[#354237] hover:text-[#293d32] dark:hover:text-[#ecece0] motion-safe:active:scale-95 transition-all disabled:opacity-50 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#314e3e]"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isRefreshing ? "motion-safe:animate-spin text-[#314e3e] dark:text-[#d6b883]" : ""}`} aria-hidden="true" />
            <span className="hidden sm:inline">Làm mới</span>
          </button>
        </div>
      </div>

      {/* ============================================================
          2. MOBILE-FIRST: HỘP VIỆC CẦN XỬ LÝ ĐẶT LÊN ĐẦU TRÊN MOBILE
          ============================================================ */}
      <div className="block lg:hidden">
        <ActionablePendingQueue 
          pendingDangKy={pendingDangKy}
          pendingGopY={pendingGopY}
          pendingBaiViet={pendingBaiViet}
          totalPending={totalPending}
          pendingStatus={pendingStatus}
          onRetryDangKy={refreshPendingDangKy}
          onRetryGopY={refreshPendingGopY}
          onRetryBaiViet={refreshPendingBaiViet}
        />
      </div>

      {/* ============================================================
          3. CẢNH BÁO NGHIỆP VỤ (THIẾU GLV / KHÓA SỔ ĐIỂM)
          ============================================================ */}
      {(classesNoTeacher.length > 0 || lockedClasses.length > 0) && (
        <div className="flex flex-col gap-3.5">
          {classesNoTeacher.length > 0 && (
            <div className="bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 dark:border-amber-400/30 p-4 sm:p-5 rounded-3xl shadow-xs flex flex-col sm:flex-row items-start justify-between gap-4 transition-all">
              <div className="flex gap-3.5 flex-1">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 bg-white/80 dark:bg-stone-800/80 border border-amber-300 dark:border-amber-700">
                  <AlertTriangle className="w-5 h-5 text-amber-800 dark:text-amber-300" strokeWidth={2.25} aria-hidden="true" />
                </div>
                <div className="flex-1 mt-0.5">
                  <p className="text-xs font-bold uppercase tracking-widest text-amber-900 dark:text-amber-300 mb-1">
                    Thiếu Giáo lý viên phụ trách
                  </p>
                  <p className="text-xs sm:text-sm font-medium text-[#293d32] dark:text-[#ecece0] leading-relaxed break-words">
                    Có <strong>{classesNoTeacher.length} lớp</strong> chưa có Giáo lý viên phụ trách trong niên khóa {namHoc}:{" "}
                    <span className="font-semibold">
                      {classesNoTeacher.slice(0, 4).map((c) => c.lop).join(", ")}
                      {classesNoTeacher.length > 4 ? ` … và ${classesNoTeacher.length - 4} lớp khác` : ""}
                    </span>.
                  </p>
                </div>
              </div>
              <Link 
                to="/quản-trị/lớp-học?status=unassigned"
                className="px-4 py-2.5 min-h-[44px] text-xs sm:text-sm font-bold rounded-xl transition-all shadow-xs bg-[#314e3e] hover:bg-[#253d30] text-white flex-shrink-0 self-stretch sm:self-center flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#314e3e]"
              >
                Phân công ngay
              </Link>
            </div>
          )}

          {lockedClasses.length > 0 && (
            <div className="bg-[#fffefa] dark:bg-[#1e2821] border border-[#dedfd4] dark:border-[#354237] p-4 sm:p-5 rounded-3xl shadow-xs flex flex-col sm:flex-row items-start justify-between gap-4">
              <div className="flex gap-3.5 flex-1">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237]">
                  <Lock className="w-5 h-5 text-[#927140] dark:text-[#d4b47d]" strokeWidth={2.25} aria-hidden="true" />
                </div>
                <div className="flex-1 mt-0.5">
                  <p className="text-xs font-bold uppercase tracking-widest text-[#927140] dark:text-[#d4b47d] mb-1">
                    Khóa sổ điểm Giáo lý
                  </p>
                  <p className="text-xs sm:text-sm font-medium text-[#293d32] dark:text-[#ecece0] leading-relaxed break-words">
                    Đang có <strong>{lockedClasses.length}/{classes.length} lớp</strong> đã khóa ít nhất một học kỳ trong niên khóa {namHoc}.
                  </p>
                </div>
              </div>
              <Link 
                to="/quản-trị/lớp-học?status=locked"
                className="px-4 py-2.5 min-h-[44px] text-xs sm:text-sm font-bold rounded-xl transition-all shadow-xs bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237] text-[#293d32] dark:text-[#ecece0] hover:bg-black/5 dark:hover:bg-white/5 flex-shrink-0 self-stretch sm:self-center flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#314e3e]"
              >
                Xem sổ điểm
              </Link>
            </div>
          )}
        </div>
      )}

      {/* ============================================================
          4. KHU VỰC CHÍNH: 2 CỘT (DESKTOP) / 1 CỘT (MOBILE)
          ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
        
        {/* ── CỘT TRÁI (60-65%): KPI QUY MÔ & BẢNG PHÂN BỔ KHỐI ── */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-5 sm:gap-6">
          
          {/* 4 THẺ KPI QUY MÔ CỐT LÕI (2 Cột trên Mobile/LG, 4 Cột trên XL) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-3.5 sm:gap-4">
            <StatTile 
              index={0} 
              label="Giáo lý sinh" 
              subLabel={`Niên khóa ${namHoc}`}
              value={totalStudentsEnrolled} 
              icon={Users2} 
              tone="primary" 
              to="/quản-trị/lớp-học"
            />
            <StatTile 
              index={1} 
              label="Giáo lý viên" 
              subLabel="Tài khoản hệ thống"
              value={roleCounts?.teacher ?? 0} 
              icon={GraduationCap} 
              tone="emerald" 
              to="/quản-trị/người-dùng?role=teacher"
            />
            <StatTile 
              index={2} 
              label="Tổng Lớp học" 
              subLabel={`Niên khóa ${namHoc}`}
              value={classes.length} 
              icon={School} 
              tone="accent" 
              to="/quản-trị/lớp-học"
            />
            <StatTile 
              index={3} 
              label="Quản trị viên" 
              subLabel="Ban Quản trị"
              value={roleCounts?.admin ?? 0} 
              icon={ShieldCheck} 
              tone="neutral" 
              to="/quản-trị/người-dùng?role=admin"
            />
          </div>

          {/* BẢNG PHÂN BỔ THEO KHỐI GIÁO LÝ */}
          <div className="bg-[#fffefa] dark:bg-[#1e2821] rounded-3xl border border-[#dedfd4] dark:border-[#354237] p-4 sm:p-5 shadow-xs flex flex-col gap-3.5">
            <div className="flex items-center justify-between gap-2 border-b border-[#dedfd4] dark:border-[#354237] pb-3">
              <div>
                <h3 className="text-sm sm:text-base font-bold font-sans text-[#293d32] dark:text-[#ecece0] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#927140] dark:text-[#d4b47d]" aria-hidden="true" />
                  Phân Bổ Theo Khối Giáo Lý
                </h3>
                <p className="text-xs text-[#575e55] dark:text-[#b0b9ac] mt-0.5 leading-snug">
                  Tỷ trọng số lớp và sĩ số Giáo lý sinh trong niên khóa {namHoc}
                </p>
              </div>
              <Link
                to="/quản-trị/lớp-học"
                className="inline-flex items-center gap-1 text-xs font-bold text-[#314e3e] dark:text-[#d6b883] hover:underline flex-shrink-0"
              >
                Xem tất cả lớp <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            </div>

            {/* Danh sách Khối dạng hàng ngang / bảng thu gọn */}
            <div className="flex flex-col divide-y divide-[#dedfd4]/60 dark:divide-[#354237]/60">
              {sectorStats.map((sector) => {
                const IconComp = sector.Icon || sector.icon;
                const linkTarget = sector.isOther 
                  ? "/quản-trị/lớp-học" 
                  : `/quản-trị/lớp-học?khoi=${sector.id}`;

                return (
                  <div
                    key={sector.id}
                    className="py-3 first:pt-1 last:pb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 group"
                  >
                    {/* Cột 1: Icon + Tên khối + Số lớp */}
                    <div className="flex items-center gap-3 min-w-0 sm:w-1/3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${sector.badge || "bg-[#314e3e]/10 text-[#314e3e]"}`}>
                        {IconComp ? <IconComp className="w-4 h-4" strokeWidth={2.25} aria-hidden="true" /> : <School className="w-4 h-4" />}
                      </div>
                      <div className="min-w-0">
                        <Link 
                          to={linkTarget}
                          className="text-xs sm:text-sm font-bold text-[#293d32] dark:text-[#ecece0] group-hover:text-[#314e3e] dark:group-hover:text-[#d6b883] transition-colors break-words block focus:outline-none focus:underline"
                        >
                          {sector.label}
                        </Link>
                        <p className="text-xs text-[#575e55] dark:text-[#b0b9ac] font-medium leading-snug">
                          {sector.classCount} lớp ({sector.classNames.slice(0, 2).join(", ")}{sector.classNames.length > 2 ? "…" : ""})
                        </p>
                      </div>
                    </div>

                    {/* Cột 2: Sĩ số + Thanh tỷ trọng */}
                    <div className="flex items-center gap-3 flex-1 sm:max-w-xs">
                      <div className="flex-1">
                        <div className="flex items-center justify-between text-xs text-[#575e55] dark:text-[#b0b9ac] mb-1">
                          <span className="font-bold text-[#293d32] dark:text-[#ecece0] tabular-nums">{sector.studentCount} em</span>
                          <span className="font-semibold tabular-nums">{sector.percentage}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-[#dedfd4]/60 dark:bg-[#354237]/60 overflow-hidden">
                          <div 
                            className="h-full rounded-full bg-[#314e3e] dark:bg-[#d6b883] motion-safe:transition-all motion-safe:duration-300 motion-reduce:transition-none"
                            style={{ width: `${sector.percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Cột 3: Nút Xem lớp (Vùng chạm >= 44px) */}
                    <div className="flex items-center justify-end flex-shrink-0">
                      <Link
                        to={linkTarget}
                        className="px-3 py-2 min-h-[44px] min-w-[44px] rounded-lg text-xs font-bold text-[#314e3e] dark:text-[#d6b883] hover:bg-[#314e3e]/10 dark:hover:bg-[#d6b883]/10 transition-colors inline-flex items-center justify-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#314e3e]"
                        aria-label={`Xem danh sách lớp thuộc ${sector.label}`}
                      >
                        Xem lớp <ChevronRight className="w-3.5 h-3.5 motion-safe:group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── CỘT PHẢI (35-40%): VIỆC CẦN XỬ LÝ (DESKTOP) & LỐI TẮT NHANH ── */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-5 sm:gap-6">
          
          {/* DESKTOP-ONLY: HỘP VIỆC CẦN XỬ LÝ */}
          <div className="hidden lg:block">
            <ActionablePendingQueue 
              pendingDangKy={pendingDangKy}
              pendingGopY={pendingGopY}
              pendingBaiViet={pendingBaiViet}
              totalPending={totalPending}
              pendingStatus={pendingStatus}
              onRetryDangKy={refreshPendingDangKy}
              onRetryGopY={refreshPendingGopY}
              onRetryBaiViet={refreshPendingBaiViet}
            />
          </div>

          {/* TRUNG TÂM LỐI TẮT THAO TÁC NHANH (QUICK ACTIONS HUB) */}
          <div className="bg-[#fffefa] dark:bg-[#1e2821] rounded-3xl border border-[#dedfd4] dark:border-[#354237] p-4 sm:p-5 shadow-xs flex flex-col gap-3.5">
            <h3 className="text-sm sm:text-base font-bold font-sans text-[#293d32] dark:text-[#ecece0] border-b border-[#dedfd4] dark:border-[#354237] pb-3">
              Lối Tắt Thao Tác Nhanh
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5">
              {/* Phân công GLV */}
              <Link
                to="/quản-trị/lớp-học?status=unassigned"
                className="w-full text-left p-3 min-h-[48px] rounded-2xl bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237] hover:border-[#314e3e]/40 dark:hover:border-[#d6b883]/40 transition-all motion-safe:active:scale-[0.98] flex items-center justify-between gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#314e3e]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#314e3e]/10 dark:bg-[#d6b883]/20 text-[#314e3e] dark:text-[#d6b883] flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-[#293d32] dark:text-[#ecece0] group-hover:text-[#314e3e] dark:group-hover:text-[#d6b883] transition-colors">
                      Phân công Giáo lý viên
                    </p>
                    <p className="text-xs text-[#575e55] dark:text-[#b0b9ac]">
                      Xếp GLV phụ trách các lớp
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#575e55] dark:text-[#b0b9ac] motion-safe:group-hover:translate-x-0.5 transition-transform flex-shrink-0" aria-hidden="true" />
              </Link>

              {/* Cài đặt Lịch Niên khóa & Nghỉ lễ */}
              <button
                type="button"
                onClick={() => setCalendarModalOpen(true)}
                className="w-full text-left p-3 min-h-[48px] rounded-2xl bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237] hover:border-[#314e3e]/40 dark:hover:border-[#d6b883]/40 transition-all motion-safe:active:scale-[0.98] flex items-center justify-between gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#314e3e] cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#927140]/10 dark:bg-[#d4b47d]/20 text-[#927140] dark:text-[#d4b47d] flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-[#293d32] dark:text-[#ecece0] group-hover:text-[#314e3e] dark:group-hover:text-[#d6b883] transition-colors">
                      Lịch Niên Khóa & Nghỉ Lễ
                    </p>
                    <p className="text-xs text-[#575e55] dark:text-[#b0b9ac]">
                      Cài đặt CN & Ngày lễ Phụng vụ
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#575e55] dark:text-[#b0b9ac] motion-safe:group-hover:translate-x-0.5 transition-transform flex-shrink-0" aria-hidden="true" />
              </button>

              {/* Soạn thông báo Xứ đoàn */}
              <Link
                to="/quản-trị/thông-báo"
                className="w-full text-left p-3 min-h-[48px] rounded-2xl bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237] hover:border-[#314e3e]/40 dark:hover:border-[#d6b883]/40 transition-all motion-safe:active:scale-[0.98] flex items-center justify-between gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#314e3e]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 flex items-center justify-center flex-shrink-0">
                    <Megaphone className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-[#293d32] dark:text-[#ecece0] group-hover:text-[#314e3e] dark:group-hover:text-[#d6b883] transition-colors">
                      Soạn Thông báo Xứ đoàn
                    </p>
                    <p className="text-xs text-[#575e55] dark:text-[#b0b9ac]">
                      Gửi Email & Thông báo Web
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#575e55] dark:text-[#b0b9ac] motion-safe:group-hover:translate-x-0.5 transition-transform flex-shrink-0" aria-hidden="true" />
              </Link>

              {/* Xuất báo cáo niên khóa */}
              <Link
                to="/quản-trị/báo-cáo"
                className="w-full text-left p-3 min-h-[48px] rounded-2xl bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237] hover:border-[#314e3e]/40 dark:hover:border-[#d6b883]/40 transition-all motion-safe:active:scale-[0.98] flex items-center justify-between gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#314e3e]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 flex items-center justify-center flex-shrink-0">
                    <BarChart3 className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-[#293d32] dark:text-[#ecece0] group-hover:text-[#314e3e] dark:group-hover:text-[#d6b883] transition-colors">
                      Báo cáo & Thống kê
                    </p>
                    <p className="text-xs text-[#575e55] dark:text-[#b0b9ac]">
                      Xuất file Excel & PDF
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#575e55] dark:text-[#b0b9ac] motion-safe:group-hover:translate-x-0.5 transition-transform flex-shrink-0" aria-hidden="true" />
              </Link>
            </div>
          </div>

        </div>

      </div>

      {/* Modal Lịch Niên Khóa & Ngày Nghỉ Lễ */}
      {calendarModalOpen && (
        <AcademicCalendarModal
          open={calendarModalOpen}
          onClose={() => setCalendarModalOpen(false)}
          namHoc={namHoc}
          availableClasses={classes}
          showToast={showToast}
          onSynced={loadAll}
        />
      )}
    </div>
  );
}