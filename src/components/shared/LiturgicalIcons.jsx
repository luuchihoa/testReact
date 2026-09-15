import React from "react";

// ══════════════════════════════════════════════════════════════════
// 7 VECTOR ICONS CHO NĂM PHỤNG VỤ
// ══════════════════════════════════════════════════════════════════

/** Mùa Vọng: Ngọn Nến Tỉnh Thức & Vòng Hoa */
export function AdventCandleIcon({ className = "w-6 h-6", size = 24, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M12 2c-.6 1.5-2 2.5-2 4 0 1.1.9 2 2 2s2-.9 2-2c0-1.5-1.4-2.5-2-4z" fill="currentColor" fillOpacity="0.2" />
      <rect x="9" y="8" width="6" height="12" rx="1" />
      <line x1="12" y1="8" x2="12" y2="6.5" />
      <path d="M5 21h14" />
      <path d="M4 17c2 1.2 4.5.8 6 .2" />
      <path d="M14 17.2c1.5.6 4 1 6-.2" />
    </svg>
  );
}

/** Mùa Giáng Sinh: Ngôi Sao Bêlem 8 Cánh */
export function BethlehemStarIcon({ className = "w-6 h-6", size = 24, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M12 2l2.2 6.3L21 11l-5.3 4.2L17.5 22 12 18.2 6.5 22l1.8-6.8L3 11l6.8-2.7L12 2z" fill="currentColor" fillOpacity="0.15" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
    </svg>
  );
}

/** Mùa Chay: Thập Tự Giá Khổ Nạn & Canh Tân */
export function LentenCrossIcon({ className = "w-6 h-6", size = 24, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M12 3v18" />
      <path d="M7 8h10" />
      <path d="M9 13l3-3 3 3" opacity="0.6" />
      <path d="M8 21h8" />
    </svg>
  );
}

/** Tam Nhật Vượt Qua: Chén Tiệc Ly & Thập Tự Hiến Tế */
export function TriduumChaliceCrossIcon({ className = "w-6 h-6", size = 24, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M7 6h10v3c0 3-2 5.5-5 5.5S7 12 7 9V6z" fill="currentColor" fillOpacity="0.15" />
      <path d="M12 14.5V20" />
      <path d="M8.5 20h7" />
      <path d="M12 2v4" />
      <path d="M10 3.8h4" />
    </svg>
  );
}

/** Mùa Phục Sinh: Mặt Trời Công Chính & Ánh Sáng Phục Sinh (Lumen Christi) */
export function PaschalSunIcon({ className = "w-6 h-6", size = 24, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="12" r="4.5" fill="currentColor" fillOpacity="0.2" />
      <path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.93 4.93l1.8 1.8M17.27 17.27l1.8 1.8M4.93 19.07l1.8-1.8M17.27 6.73l1.8-1.8" />
      <path d="M12 9.5v5M9.5 12h5" />
    </svg>
  );
}

/** Thường Niên I: Nhành Lúa Lời Chúa */
export function OrdinaryWheatIcon({ className = "w-6 h-6", size = 24, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M2 22s5-3 9-8" />
      <path d="M13 14c-1.5-2.5-1-6 1-8 2.5-2 6-2.5 8-1-1 2-1.5 5.5 1 8 2 2 1.5 5.5-1 8-2.5 1.5-6 1-8-1z" fill="currentColor" fillOpacity="0.15" />
      <path d="M11 15c2-2 5-3 8-2" />
      <path d="M8 18c2-1 4-1 6 0" />
    </svg>
  );
}

/** Thường Niên II: Vương Miện Chúa Kitô Vua Vũ Trụ */
export function ChristKingCrownIcon({ className = "w-6 h-6", size = 24, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M4 8l3 10h10l3-10-4.5 3.5L12 6.5l-3.5 5L4 8z" fill="currentColor" fillOpacity="0.15" />
      <path d="M5 19h14" />
      <path d="M12 2.5v4M10.5 4h3" />
    </svg>
  );
}

// ══════════════════════════════════════════════════════════════════
// 7 VECTOR ICONS CHO BẢY BÍ TÍCH CỨU ĐỘ
// ══════════════════════════════════════════════════════════════════

/** Bí Tích Rửa Tội: Dòng Nước Tái Sinh & Ba Ngôi */
export function BaptismalWaterIcon({ className = "w-6 h-6", size = 24, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" fill="currentColor" fillOpacity="0.15" />
      <path d="M12 8v6M9 11h6" />
    </svg>
  );
}

/** Bí Tích Thêm Sức: Lưỡi Lửa Thần Khí 7 Ơn */
export function HolySpiritFlameIcon({ className = "w-6 h-6", size = 24, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3z" fill="currentColor" fillOpacity="0.2" />
      <path d="M12 18v-4M10 16h4" />
    </svg>
  );
}

/** Bí Tích Thánh Thể: Bánh Thánh (Host) & Chén Thánh (Chalice) */
export function EucharistHostChaliceIcon({ className = "w-6 h-6", size = 24, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="5.5" r="3.5" fill="currentColor" fillOpacity="0.2" />
      <path d="M12 4v3M10.5 5.5h3" />
      <path d="M6 10h12v3c0 3.3-2.7 6-6 6s-6-2.7-6-6v-3z" fill="currentColor" fillOpacity="0.15" />
      <path d="M12 19v3M9 22h6" />
    </svg>
  );
}

/** Bí Tích Hoà Giải: Chùm Chìa Khóa Nước Trời (Mt 16, 19) */
export function KingdomKeysIcon({ className = "w-6 h-6", size = 24, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <circle cx="7.5" cy="15.5" r="4.5" fill="currentColor" fillOpacity="0.15" />
      <circle cx="7.5" cy="15.5" r="1.5" />
      <path d="M10.5 12.5L20 3" />
      <path d="M15 5l2 2" />
      <path d="M18 8l2 2" />
    </svg>
  );
}

/** Bí Tích Xức Dầu Bệnh Nhân: Bình Dầu Thánh OI (Oleum Infirmorum) & Thánh Giá */
export function AnointingOilIcon({ className = "w-6 h-6", size = 24, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <rect x="7" y="9" width="10" height="12" rx="3" fill="currentColor" fillOpacity="0.15" />
      <path d="M10 9V5a2 2 0 0 1 4 0v4" />
      <path d="M12 12v5M10 14.5h4" />
      <circle cx="12" cy="3" r="1" fill="currentColor" />
    </svg>
  );
}

/** Bí Tích Truyền Chức Thánh: Đặt Tay Tông Truyền & Dây Stola */
export function HolyOrdersStoleIcon({ className = "w-6 h-6", size = 24, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M12 2a4 4 0 0 1 4 4c0 3-4 5-4 5s-4-2-4-5a4 4 0 0 1 4-4z" fill="currentColor" fillOpacity="0.15" />
      <path d="M4 14l4 2 4-2 4 2 4-2" />
      <path d="M8 16v5M16 16v5M12 11v10" />
    </svg>
  );
}

/** Bí Tích Hôn Phối: Đôi Nhẫn Cưới Giao Ước Bất Khả Phân Ly */
export function IntertwinedWeddingRingsIcon({ className = "w-6 h-6", size = 24, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <circle cx="9" cy="13" r="5" fill="currentColor" fillOpacity="0.1" />
      <circle cx="15" cy="13" r="5" fill="currentColor" fillOpacity="0.1" />
      <path d="M12 3v4M10 5h4" />
    </svg>
  );
}
