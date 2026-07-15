import React from "react";

/**
 * StatCell
 *
 * Tách khỏi ReportsTab và bọc React.memo vì được render lặp lại
 * nhiều lần trong mỗi hàng của bảng (columns.length ô / hàng x số lớp).
 * Với memo, khi 1 hàng re-render (ví dụ do hover state của hàng khác),
 * các cell không đổi props sẽ không phải tính toán lại percent.
 */
function StatCellImpl({ count, total }) {
  if (total === 0) {
    return <span className="text-stone-300 dark:text-stone-600">—</span>;
  }

  const percent = ((count / total) * 100).toFixed(1);

  return (
    <div className="flex flex-col items-center gap-0.5">
      <span
        className={`text-[13.5px] font-bold ${
          count === 0
            ? "text-stone-300 dark:text-stone-600"
            : "text-amber-950 dark:text-amber-50"
        }`}
      >
        {count}
      </span>
      <span className="text-[10px] text-stone-500 dark:text-stone-400 font-medium tracking-wide">
        {percent}%
      </span>
    </div>
  );
}

export const StatCell = React.memo(StatCellImpl);