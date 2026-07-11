import React, { useId } from "react";

/**
 * Lưới dấu cộng làm nền cho các trang Khối.
 * useId() đảm bảo <pattern> id không đụng nhau nếu nhiều Khoi* được render
 * trong cùng cây DOM (ví dụ preview, storybook, hoặc lồng layout).
 */
export default function PlusGrid({ className = "" }) {
  const uid = useId();
  const patternId = `plus-grid-${uid}`;

  return (
    <div
      className={`absolute inset-0 pointer-events-none z-0 overflow-hidden ${className}`}
      style={{
        // Dùng pixel tuyệt đối thay vì % để dễ kiểm soát fade-in/out trên các trang dài
        maskImage: "linear-gradient(to bottom, transparent 0px, black 200px, black calc(100% - 300px), transparent 100%)",
        WebkitMaskImage: "linear-gradient(to bottom, transparent 0px, black 200px, black calc(100% - 300px), transparent 100%)",
      }}
    >
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id={patternId} width="48" height="48" patternUnits="userSpaceOnUse">
            <path
              d="M24 16V32M16 24H32"
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-stone-300/40 dark:text-stone-700/30"
              fill="none"
              strokeLinecap="round"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>
    </div>
  );
}