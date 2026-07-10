import React from "react";

/* ============================================================
   SKELETON — APPLE-STYLE, MOBILE-FIRST, DARK MODE
   ------------------------------------------------------------
   Nguyên tắc thiết kế (theo Apple HIG):
   - Bề mặt phân lớp: base -> elevated -> further elevated
     Light: #F2F2F7 -> #FFFFFF -> #F9F9FB
     Dark:  #000000 -> #1C1C1E -> #2C2C2E
   - Bo góc lớn, nhất quán (14 / 18 / 22px ~ rounded-2xl/3xl)
   - Viền cực mảnh dựa trên độ mờ (black/5 ở light, white/10 ở dark)
     thay vì màu cố định, để tự thích ứng theo nền.
   - Chuyển động tinh tế, tôn trọng prefers-reduced-motion.
   - Toàn bộ theo chiến lược dark mode bằng class `.dark` trên
     phần tử cha (tương thích Tailwind darkMode: 'class').
   ============================================================ */

const SHIMMER_CSS = `
  :root {
    --skel-bone: #E9E6E1;
    --skel-shimmer: rgba(255, 255, 255, 0.65);
  }
  .dark {
    --skel-bone: #2C2C2E;
    --skel-shimmer: rgba(255, 255, 255, 0.06);
  }

  @keyframes skel-shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  .skel {
    position: relative;
    overflow: hidden;
    background-color: var(--skel-bone);
  }
  .skel::after {
    position: absolute;
    top: 0; right: 0; bottom: 0; left: 0;
    transform: translateX(-100%);
    background-image: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0) 0%,
      var(--skel-shimmer) 50%,
      rgba(255, 255, 255, 0) 100%
    );
    animation: skel-shimmer 1.6s infinite ease-in-out;
    content: "";
  }
  @media (prefers-reduced-motion: reduce) {
    .skel::after { animation: none; }
  }
  @keyframes fade-in-up {
    from { opacity: 0; transform: translateY(6px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .fade-in-up { animation: fade-in-up 0.35s ease-out both; }
  @media (prefers-reduced-motion: reduce) {
    .fade-in-up { animation: none; }
  }
`;

export function SkeletonStyles() {
  return <style>{SHIMMER_CSS}</style>;
}

// Viên gạch cơ bản — bo góc mềm mại kiểu Apple
export function Bone({ className = "" }) {
  return <div className={`skel rounded-xl ${className}`} />;
}

/* ------------------------------------------------------------
   Header + Tabbar Skeleton
   ------------------------------------------------------------ */
export function HeaderTabbarSkeleton({ tabCount = 4 }) {
  return (
    <div
      className="sticky top-0 z-30 bg-[#F2F2F7]/85 dark:bg-black/70 backdrop-blur-xl
                 border-b border-black/5 dark:border-white/10
                 px-4 sm:px-6 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 sm:py-4 fade-in-up"
    >
      <SkeletonStyles />
      <div className="max-w-6xl mx-auto flex flex-col gap-3.5">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex flex-col gap-2">
            <Bone className="h-3 w-28 sm:w-32 rounded-full opacity-70" />
            <Bone className="h-6 w-44 sm:w-64" />
          </div>
          <Bone className="h-6 w-6 sm:h-5 sm:w-20 rounded-full flex-shrink-0" />
        </div>
        {/* Mobile: tab bar cuộn ngang, không vỡ layout trên màn nhỏ */}
        <div className="flex gap-1 bg-black/[0.04] dark:bg-white/[0.06] rounded-2xl p-1 w-full overflow-x-auto no-scrollbar">
          {Array.from({ length: tabCount }).map((_, i) => (
            <Bone key={i} className="h-8 w-[22%] min-w-[5.5rem] sm:w-28 rounded-xl flex-shrink-0" />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------
   Danh sách có avatar (StudentListPanel)
   ------------------------------------------------------------ */
export function ListRowsSkeleton({ rows = 6 }) {
  return (
    <div className="fade-in-up bg-white dark:bg-[#1C1C1E] rounded-2xl border border-black/5 dark:border-white/10 overflow-hidden">
      <SkeletonStyles />
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3.5 sm:gap-4 px-4 py-3.5 border-b border-black/5 dark:border-white/10 last:border-0"
        >
          <Bone className="w-10 h-10 rounded-full flex-shrink-0" />
          <div className="min-w-0 flex-1 flex flex-col gap-2">
            <Bone className="h-3.5 w-[60%] sm:w-[30%]" />
            <Bone className="h-2.5 w-[35%] sm:w-[15%] opacity-60" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------
   Bảng dữ liệu chuẩn chỉnh (Mô phỏng chính xác border & layout thật)
   ------------------------------------------------------------ */
export function TableSkeleton({ rows = 6, columns = 6 }) {
  return (
    <div className="fade-in-up bg-white dark:bg-[#1C1C1E] rounded-2xl border border-black/5 dark:border-white/10 shadow-sm dark:shadow-none overflow-hidden">
      <SkeletonStyles />

      {/* MOBILE: Layout dạng Card rút gọn — ưu tiên chạm dễ, thoáng dòng */}
      <div className="md:hidden flex flex-col divide-y divide-black/5 dark:divide-white/10">
        {Array.from({ length: Math.min(rows, 5) }).map((_, i) => (
          <div key={i} className="p-4 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <Bone className="w-9 h-9 rounded-full flex-shrink-0" />
              <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                <Bone className="h-3.5 w-[60%]" />
                <Bone className="h-2.5 w-[30%] opacity-60" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-1">
              <Bone className="h-7 rounded-xl" />
              <Bone className="h-7 rounded-xl" />
              <Bone className="h-7 rounded-xl" />
            </div>
          </div>
        ))}
      </div>

      {/* DESKTOP: Bảng chia cột tỷ lệ thực tế */}
      <div className="hidden md:block">
        <div className="bg-black/[0.02] dark:bg-white/[0.03] border-b border-black/5 dark:border-white/10 flex gap-4 px-6 py-3.5">
          <Bone className="h-3.5 w-8" />
          <Bone className="h-3.5 w-44" />
          {Array.from({ length: columns }).map((_, i) => (
            <Bone key={i} className="h-3.5 flex-1" />
          ))}
        </div>

        <div className="divide-y divide-black/5 dark:divide-white/10">
          {Array.from({ length: rows }).map((_, r) => (
            <div key={r} className="flex items-center gap-4 px-6 py-4">
              <Bone className="h-3.5 w-8" />
              <div className="flex items-center gap-3 w-44">
                <Bone className="w-7 h-7 rounded-full flex-shrink-0" />
                <Bone className="h-3.5 flex-1" />
              </div>
              {Array.from({ length: columns }).map((_, c) => (
                <Bone key={c} className="h-3.5 flex-1" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------
   Khối biểu mẫu nhập liệu (FormBlockSkeleton)
   ------------------------------------------------------------ */
export function FormBlockSkeleton() {
  return (
    <div className="flex flex-col gap-5 sm:gap-6 fade-in-up">
      <SkeletonStyles />
      <Bone className="h-8 w-44 rounded-xl" />

      {/* Khối Điểm số */}
      <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl border border-black/5 dark:border-white/10 shadow-sm dark:shadow-none p-4 sm:p-5 flex flex-col gap-3">
        <Bone className="h-4 w-28 mb-1" />
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 sm:gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Bone key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      </div>

      {/* Khối Điểm danh nhanh */}
      <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl border border-black/5 dark:border-white/10 shadow-sm dark:shadow-none p-4 sm:p-5 flex flex-col gap-4">
        <Bone className="h-4 w-36 mb-1" />
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2 flex-shrink-0 w-14">
              <Bone className="w-9 h-9 rounded-full" />
              <Bone className="h-2.5 w-8 rounded-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Khối tổng kết bổ sung */}
      <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl border border-black/5 dark:border-white/10 shadow-sm dark:shadow-none p-4 sm:p-5 flex flex-col gap-3">
        <Bone className="h-4 w-40 mb-1" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
          <Bone className="h-11 rounded-xl" />
          <Bone className="h-11 rounded-xl" />
          <Bone className="h-11 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------
   Nội dung tab Admin (AdminTabSkeleton)
   ------------------------------------------------------------ */
export function AdminTabSkeleton() {
  return (
    <div className="flex flex-col gap-4 sm:gap-5 fade-in-up">
      <SkeletonStyles />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-3.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-[#1C1C1E] rounded-2xl border border-black/5 dark:border-white/10 shadow-sm dark:shadow-none p-4 flex flex-col gap-2"
          >
            <Bone className="h-2.5 w-16 rounded-full opacity-70" />
            <Bone className="h-6 w-20" />
          </div>
        ))}
      </div>
      <TableSkeleton rows={6} columns={4} />
    </div>
  );
}

/* ------------------------------------------------------------
   Trang tổng quát (PageContentSkeleton)
   ------------------------------------------------------------ */
export function PageContentSkeleton() {
  return (
    <div className="min-h-[60vh] w-full bg-[#F2F2F7] dark:bg-black px-4 sm:px-6 py-10 sm:py-14 fade-in-up">
      <SkeletonStyles />
      <div className="max-w-5xl mx-auto flex flex-col gap-8 sm:gap-10">
        <div className="flex flex-col items-center text-center gap-3.5">
          <Bone className="h-3 w-36 rounded-full opacity-80" />
          <Bone className="h-8 sm:h-10 w-[85%] max-w-md" />
          <Bone className="h-3.5 w-[90%] max-w-lg opacity-75" />
          <Bone className="h-3.5 w-[60%] max-w-sm opacity-60" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-[#1C1C1E] p-4 sm:p-5 shadow-sm dark:shadow-none flex flex-col gap-3.5"
            >
              <Bone className="h-32 w-full rounded-xl" />
              <Bone className="h-4 w-[65%]" />
              <Bone className="h-3 w-[90%] opacity-75" />
              <Bone className="h-3 w-[45%] opacity-60" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------
   Hàng thẻ thống kê (StatCardsSkeleton) — DashboardTab
   ------------------------------------------------------------ */
export function StatCardsSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 fade-in-up">
      <SkeletonStyles />
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-[#1C1C1E] rounded-2xl border border-black/5 dark:border-white/10 shadow-sm dark:shadow-none p-4 flex flex-col gap-2.5"
        >
          <Bone className="h-2.5 w-16 rounded-full opacity-70" />
          <Bone className="h-7 w-12" />
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------
   Lưới thẻ chọn (CardsGridSkeleton) — vd. ClassPicker trong GradesTab
   ------------------------------------------------------------ */
export function CardsGridSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4 sm:p-5 fade-in-up">
      <SkeletonStyles />
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-[#1C1C1E] p-4 flex flex-col gap-2.5"
        >
          <div className="flex items-center justify-between gap-2">
            <Bone className="h-3.5 w-20" />
            <Bone className="h-4 w-14 rounded-full opacity-70" />
          </div>
          <Bone className="h-2.5 w-28 opacity-70" />
          <Bone className="h-2.5 w-16 opacity-60" />
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------
   Danh sách 2 cột song song (SplitListSkeleton)
   vd. ClassRosterPanel: "Đã xếp lớp" | "Thêm học sinh"
   Mobile: xếp dọc thành 2 khối, không chia cột chật.
   ------------------------------------------------------------ */
export function SplitListSkeleton({ rows = 6 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-0 md:divide-x divide-black/5 dark:divide-white/10 fade-in-up">
      <SkeletonStyles />
      {Array.from({ length: 2 }).map((_, col) => (
        <div key={col} className="bg-white dark:bg-[#1C1C1E] md:bg-transparent rounded-2xl md:rounded-none border border-black/5 dark:border-white/10 md:border-0 p-4 sm:p-5 flex flex-col gap-1.5">
          <Bone className="h-3 w-28 mb-1.5 opacity-70" />
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-black/[0.03] dark:bg-white/[0.05]">
              <Bone className="w-7 h-7 rounded-full flex-shrink-0" />
              <Bone className="h-3 flex-1" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------
   Bố cục Sidebar + Chi tiết (SidebarDetailSkeleton)
   vd. ArticlesTab: danh sách bài chờ duyệt + nội dung bài đang chọn
   Mobile: sidebar trở thành dải cuộn ngang phía trên chi tiết.
   ------------------------------------------------------------ */
export function SidebarDetailSkeleton({ items = 4 }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4 lg:gap-5 fade-in-up">
      <SkeletonStyles />
      <div className="flex lg:flex-col gap-2 overflow-x-auto no-scrollbar">
        {Array.from({ length: items }).map((_, i) => (
          <div
            key={i}
            className="flex-shrink-0 lg:flex-shrink w-64 lg:w-full rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-[#1C1C1E] px-3.5 py-3 flex flex-col gap-2"
          >
            <Bone className="h-3.5 w-[80%]" />
            <Bone className="h-2.5 w-[45%] opacity-60" />
          </div>
        ))}
      </div>
      <div className="bg-white dark:bg-[#1C1C1E] border border-black/5 dark:border-white/10 rounded-2xl p-4 sm:p-6 flex flex-col gap-3">
        <Bone className="h-5 w-[65%]" />
        <Bone className="h-2.5 w-[35%] opacity-60 mb-2" />
        <Bone className="h-40 sm:h-48 w-full rounded-xl mb-1" />
        <Bone className="h-3 w-full opacity-75" />
        <Bone className="h-3 w-[92%] opacity-75" />
        <Bone className="h-3 w-[80%] opacity-75" />
        <Bone className="h-3 w-[88%] opacity-60" />
        <div className="flex gap-3 mt-3">
          <Bone className="h-11 flex-1 rounded-full" />
          <Bone className="h-11 flex-1 rounded-full" />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------
   Tab "Thành tích" của học sinh (AchievementSkeleton)
   ------------------------------------------------------------ */
export function AchievementSkeleton() {
  return (
    <div className="flex flex-col gap-4 sm:gap-5 fade-in-up">
      <SkeletonStyles />

      {/* Thẻ tổng hợp — Điểm TB / Học lực / Hạnh kiểm / Vị thứ */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-[#1C1C1E] rounded-2xl border border-black/5 dark:border-white/10 shadow-sm dark:shadow-none p-4 flex flex-col gap-2"
          >
            <Bone className="h-2.5 w-16 rounded-full opacity-70" />
            <Bone className="h-5 w-10" />
          </div>
        ))}
      </div>

      {/* Banner trạng thái */}
      <Bone className="h-11 w-full rounded-2xl opacity-80" />

      {/* Điểm danh */}
      <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl border border-black/5 dark:border-white/10 shadow-sm dark:shadow-none p-4">
        <Bone className="h-4 w-28 mb-3" />
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 mb-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Bone key={i} className="h-2.5 w-20 rounded-full opacity-60" />
          ))}
        </div>
        <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5 flex-shrink-0 w-12">
              <Bone className="w-8 h-8 rounded-full" />
              <Bone className="h-2 w-6 rounded-full opacity-60" />
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-black/5 dark:border-white/10 flex flex-wrap gap-x-6 gap-y-1.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <Bone key={i} className="h-3 w-24 opacity-70" />
          ))}
        </div>
      </div>

      {/* Bảng điểm chi tiết */}
      <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl border border-black/5 dark:border-white/10 shadow-sm dark:shadow-none p-4">
        <div className="flex items-center justify-between mb-3">
          <Bone className="h-4 w-32" />
          <Bone className="h-5 w-16 rounded-full opacity-70" />
        </div>
        <Bone className="h-3 w-24 mb-3 opacity-70" />
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="bg-[#F9F9FB] dark:bg-[#2C2C2E] rounded-xl px-3 py-2.5 flex-1 min-w-[64px] flex flex-col items-center gap-1.5"
            >
              <Bone className="h-2 w-8 rounded-full opacity-60" />
              <Bone className="h-4 w-6" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------
   Màn hình xác thực quyền (AuthGateSkeleton)
   ------------------------------------------------------------ */
export function AuthGateSkeleton() {
  return (
    <div className="min-h-screen bg-[#F2F2F7] dark:bg-black">
      <HeaderTabbarSkeleton tabCount={4} />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-6">
        <TableSkeleton rows={6} columns={5} />
      </div>
    </div>
  );
}