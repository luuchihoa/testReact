import React from "react";

/**
 * StatCell
 *
 * Tách khỏi ReportsTab và bọc React.memo vì được render lặp lại
 * nhiều lần trong mỗi hàng của bảng (columns.length ô / hàng x số lớp).
 * Chuẩn hóa 100% REM và tabular-nums cho toàn bộ số liệu.
 */
function StatCellImpl({ count, total }) {
  if (total === 0 || count === undefined) {
    return <span className="text-stone-300 dark:text-stone-600 font-sans font-medium">—</span>;
  }

  const percent = ((count / total) * 100).toFixed(1);

  return (
    <div className="flex flex-col items-center gap-0.5">
      <span
        className={`text-xs sm:text-sm font-bold font-sans tabular-nums ${
          count === 0
            ? "text-stone-300 dark:text-stone-600"
            : "text-[#293d32] dark:text-[#ecece0]"
        }`}
      >
        {count}
      </span>
      <span className={`text-xs font-sans tabular-nums ${
        count === 0
          ? "text-stone-300 dark:text-stone-600"
          : "text-[#575e55] dark:text-[#b0b9ac] font-medium"
      }`}>
        {percent}%
      </span>
    </div>
  );
}

export const StatCell = React.memo(StatCellImpl);