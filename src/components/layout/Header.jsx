/* eslint-disable no-unused-vars, react-hooks/refs, react-hooks/set-state-in-effect */
import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "../ui/ToastContext.jsx";
import { usePWAInstall } from "../ui/PWAInstallContext.jsx";
import { supabase } from "../../lib/supabase.js";
import {
  LogIn, LogOut, ChevronDown, Church,
  BookOpen, Sparkles, Flame, Heart, Globe, Users,
  CalendarDays, FileText, Phone, Settings, ShieldCheck,
  ScrollText, User, Home, GraduationCap, Info, Menu, X,
  LayoutDashboard, Bell, Loader2, CheckCheck, Megaphone, BellOff,
  ArrowRight, Smartphone, Download,
} from "lucide-react";
import { normalizeNotificationLink } from "../../features/account/utils.js";

/* ═══ ROUTE MAP ═══════════════════════════════════════════════════ */
const KHOI_ITEMS = [
  { path: "/khối-chiên-con",    label: "Chiên Con",  sub: "Lớp 1 – 2",       icon: Heart,    accent: "#be185d", bg: "bg-pink-100/80 dark:bg-pink-500/20",     ring: "ring-pink-300 dark:ring-pink-500/40"     },
  { path: "/khối-rước-lễ",      label: "Rước Lễ",    sub: "Lớp 3 – 4",       icon: Sparkles, accent: "#4d7c0f", bg: "bg-lime-100/80 dark:bg-lime-500/20",     ring: "ring-lime-300 dark:ring-lime-500/40"     },
  { path: "/khối-thêm-sức",     label: "Thêm Sức",   sub: "Lớp 5 – 6",       icon: Flame,    accent: "#a16207", bg: "bg-amber-100/80 dark:bg-amber-500/20",   ring: "ring-amber-300 dark:ring-amber-500/40"   },
  { path: "/khối-phụng-vụ",     label: "Phụng Vụ",   sub: "Lớp 7",           icon: Church,   accent: "#c2410c", bg: "bg-orange-100/80 dark:bg-orange-500/20", ring: "ring-orange-300 dark:ring-orange-500/40" },
  { path: "/khối-kinh-thánh",   label: "Kinh Thánh", sub: "Lớp 8 – 9",       icon: BookOpen, accent: "#b91c1c", bg: "bg-red-100/80 dark:bg-red-500/20",       ring: "ring-red-300 dark:ring-red-500/40"       },
  { path: "/khối-vào-đời",      label: "Vào Đời",    sub: "Lớp 10 – 11",     icon: Globe,    accent: "#78350f", bg: "bg-amber-100/80 dark:bg-amber-500/20",   ring: "ring-amber-300 dark:ring-amber-500/40"   },
];

const COMMUNITY_ITEMS = [
  { path: "/tuyển-sinh",     label: "Tuyển sinh",     icon: Users,        desc: "Đăng ký học viên mới",     accent: "#15803d", bg: "bg-emerald-100/80 dark:bg-emerald-500/20", ring: "ring-emerald-300 dark:ring-emerald-500/40" },
  { path: "/lịch-học",       label: "Lịch học",       icon: CalendarDays, desc: "Xem lịch giáo lý tuần",    accent: "#0369a1", bg: "bg-sky-100/80 dark:bg-sky-500/20",         ring: "ring-sky-300 dark:ring-sky-500/40" },
  { path: "/lịch-sinh-hoạt", label: "Lịch sinh hoạt", icon: Sparkles,     desc: "Theo dõi sự kiện giáo xứ", accent: "#7e22ce", bg: "bg-purple-100/80 dark:bg-purple-500/20",   ring: "ring-purple-300 dark:ring-purple-500/40" },
  { path: "/tài-liệu",       label: "Tài liệu",       icon: FileText,     desc: "Tải bài giảng & học liệu", accent: "#0f766e", bg: "bg-teal-100/80 dark:bg-teal-500/20",       ring: "ring-teal-300 dark:ring-teal-500/40" },
  { path: "/liên-hệ",        label: "Liên hệ",        icon: Phone,        desc: "Kênh kết nối & hỗ trợ",    accent: "#b45309", bg: "bg-amber-100/80 dark:bg-amber-500/20",     ring: "ring-amber-300 dark:ring-amber-500/40" },
  { path: "/bài-viết",       label: "Bài viết",       icon: BookOpen,     desc: "Chia sẻ từ cộng đoàn",     accent: "#4338ca", bg: "bg-indigo-100/80 dark:bg-indigo-500/20",   ring: "ring-indigo-300 dark:ring-indigo-500/40" },
];

const MAIN_ITEMS = [
  { path: "/",            label: "Trang chủ" },
  { path: "/giới-thiệu",  label: "Giới thiệu" },
];

const ACCOUNT_ITEMS = [
  { path: "/cài-đặt",  label: "Cài đặt",  icon: Settings    },
  { path: "/bảo-mật",  label: "Bảo mật",  icon: ShieldCheck },
  { path: "/quy-định", label: "Quy định", icon: ScrollText  },
];

// Nhãn hiển thị + màu nhận diện
const ROLE_LABELS = {
  admin:   "Quản trị viên",
  teacher: "Giáo viên",
  student: "Học sinh",
  user:    "Thành viên",
};

const ROLE_ACCENTS = {
  admin:   "#dc2626", 
  teacher: "#2563eb", 
  student: "#16a34a", 
  user:    "#78716c", 
};

const ROLE_EXTRA_ITEMS = {
  admin: [
    { path: "/quản-trị", label: "Quản trị hệ thống", icon: LayoutDashboard },
    { path: "/bài-viết-của-tôi", label: "Bài viết của tôi", icon: FileText },
  ],
  teacher: [
    { path: "/quản-lý-học-sinh/", label: "Lớp học của tôi", icon: GraduationCap },
    { path: "/bài-viết-của-tôi", label: "Bài viết của tôi", icon: FileText },
  ],
  student: [
    { path: "/tài-khoản/thành-tích", label: "Thành tích học tập", icon: GraduationCap },
    { path: "/bài-viết-của-tôi", label: "Bài viết của tôi", icon: FileText }
  ],
  user:    [{ path: "/bài-viết-của-tôi", label: "Bài viết của tôi", icon: FileText }],
};

function getRoleExtraItems(role) {
  return ROLE_EXTRA_ITEMS[role] ?? [];
}

const NOTIF_TYPE_ICON = {
  diem:         FileText,
  hanh_kiem:    ShieldCheck,
  hoc_luc:      GraduationCap,
  tong_ket_ky:  ScrollText,
  tong_ket_nam: ScrollText,
  broadcast:    Megaphone,
  system:       Info,
  bai_viet:     FileText,
};

function timeAgoVi(dateStr) {
  if (!dateStr) return "";
  const diffSec = Math.max(0, (Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diffSec < 60) return "Vừa xong";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} phút trước`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} giờ trước`;
  if (diffSec < 2592000) return `${Math.floor(diffSec / 86400)} ngày trước`;
  return new Date(dateStr).toLocaleDateString("vi-VN");
}

const MOBILE_TAB_ITEMS = [
  { path: "/",                label: "Trang chủ",    icon: Home },
  { path: "/lịch-học",        label: "Lịch học",     icon: CalendarDays },
  { type: "dropdown_khoi",    label: "Khối học",     icon: GraduationCap },
  { path: "/tài-liệu",        label: "Tài liệu",     icon: FileText },
  { type: "menu_more",        label: "Tiện ích",     icon: Menu } 
];

function isItemActive(item, pathname) {
  if (item.type === "dropdown_khoi") return KHOI_ITEMS.some((s) => s.path === pathname);
  if (item.type === "menu_more") {
    const morePaths = [
      "/giới-thiệu", "/liên-hệ", "/tuyển-sinh", "/cài-đặt", "/bảo-mật", "/quy-định",
      "/lịch-sinh-hoạt", "/bài-viết", "/tài-khoản", "/quản-trị", "/quản-lý-học-sinh",
    ];
    return morePaths.some((p) => pathname.startsWith(p));
  }
  return item.path === pathname;
}

/* ═══ HOOKS ═══════════════════════════════════════════════════════ */
function useOnClickOutside(ref, handler) {
  useEffect(() => {
    const fn = (e) => {
      if (!ref.current || ref.current.contains(e.target)) return;
      handler();
    };
    document.addEventListener("mousedown", fn);
    document.addEventListener("touchstart", fn);
    return () => {
      document.removeEventListener("mousedown", fn);
      document.removeEventListener("touchstart", fn);
    };
  }, [ref, handler]);
}

// Hook theo dõi vị trí cuộn chuột
function useScrollPosition() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return isScrolled;
}

/* ═══ DESKTOP COMPONENTS ══════════════════════════════════════════ */
function AccountTriggerButton({ isLogin, avatar, username, role, isOpen, onToggle, onLogin }) {
  if (!isLogin) return (
    <button type="button" onClick={onLogin}
      className="inline-flex h-9 items-center gap-1.5 rounded-full bg-amber-900 dark:bg-amber-100 px-5 text-[13px] font-bold text-amber-50 dark:text-amber-950 shadow-sm hover:bg-amber-950 dark:hover:bg-amber-50 transition-colors">
      <LogIn className="w-3.5 h-3.5" />Đăng nhập
    </button>
  );
  const roleAccent = ROLE_ACCENTS[role] || ROLE_ACCENTS.user;
  return (
    <button type="button" onClick={onToggle} aria-expanded={isOpen}
      className={`flex items-center gap-2 rounded-full border transition-all pl-0.5 pr-3 py-0.5 ${
        isOpen ? "border-amber-900/30 dark:border-amber-100/30 bg-amber-900/5 dark:bg-amber-100/10 shadow-inner" : "border-amber-900/15 dark:border-amber-100/15 bg-white/50 dark:bg-stone-800/60 hover:bg-amber-900/5 dark:hover:bg-amber-100/10"
      }`}>
      <div className="h-7 w-7 flex-shrink-0 overflow-hidden rounded-full border-2" style={{ borderColor: roleAccent }}>
        <img src={avatar || "/images/avatarDefault.avif"} alt="Avatar" className="h-full w-full object-cover" />
      </div>
      <span className="text-xs font-bold text-stone-800 dark:text-stone-200 max-w-[90px] truncate">{username || "Tài khoản"}</span>
      <ChevronDown className={`w-3 h-3 text-stone-500 dark:text-stone-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
    </button>
  );
}

function KhoiMegaMenu({ isOpen, onClose, navigate, currentPath }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          id="khoi-megamenu-panel"
          role="region"
          aria-label="Chương trình giáo lý các khối"
          className="absolute left-1/2 -translate-x-[42%] top-full mt-3 w-[720px] max-w-[calc(100vw-32px)] rounded-[2rem] border border-[#dedfd4] dark:border-[#354237] bg-[#fffefa] dark:bg-[#1e2821] shadow-xl dark:shadow-black/40 z-50 overflow-hidden"
        >
          <div className="flex">
            {/* Cột Danh sách Khối (2/3 chiều rộng) */}
            <div className="w-2/3 p-5">
              <div className="mb-4">
                <p className="text-[12px] font-bold uppercase tracking-wider text-[#7c5c2d] dark:text-[#d4b47d] font-serif">Chương trình giáo lý</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {KHOI_ITEMS.map((khoi) => {
                  const Icon     = khoi.icon;
                  const isActive = currentPath === khoi.path;
                  return (
                    <button key={khoi.path} type="button" onClick={() => { navigate(khoi.path); onClose(); }}
                      className={`flex items-center gap-3 px-4 py-3 text-left rounded-2xl bg-[#fffefa] dark:bg-[#1e2821] hover:bg-[#faf8f3] dark:hover:bg-[#151c18] transition-all group ${isActive ? "bg-[#faf8f3] dark:bg-[#151c18] shadow-sm ring-1 ring-[#dedfd4] dark:ring-[#354237]" : ""}`}
                    >
                      <div className={`flex-shrink-0 w-10 h-10 rounded-[14px] flex items-center justify-center ${khoi.bg} ring-1 ${isActive ? khoi.ring : "ring-transparent"} group-hover:ring-1 group-hover:${khoi.ring} transition-all`}>
                        <Icon className="w-4 h-4" style={{ color: khoi.accent }} />
                      </div>
                      <div className="min-w-0">
                        <p className={`text-[14px] font-bold leading-snug ${isActive ? "text-[#293d32] dark:text-[#f2f2e8]" : "text-[#293d32] dark:text-[#ecece0] group-hover:text-[#314e3e] dark:group-hover:text-[#d4b47d]"}`}>{khoi.label}</p>
                        <p className="text-[12px] font-medium text-[#3d4a41] dark:text-[#cdd4c8] truncate mt-0.5">{khoi.sub}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            
            {/* Cột Nổi bật (Featured - 1/3 chiều rộng) */}
            <div className="w-1/3 bg-[#f4efe4] dark:bg-[#161c18] p-6 flex flex-col justify-between border-l border-[#dedfd4] dark:border-[#354237]">
              <div>
                <div className="w-10 h-10 rounded-full bg-white dark:bg-[#1e2821] shadow-sm flex items-center justify-center mb-4 text-[#7c5c2d] dark:text-[#d4b47d]">
                  <Star className="w-5 h-5 text-[#927140] dark:text-[#d4b47d]" />
                </div>
                <h4 className="text-[14px] font-bold text-[#293d32] dark:text-[#f2f2e8] font-serif leading-snug mb-2">Lời Chúa cho Thiếu Nhi</h4>
                <p className="text-[12.5px] font-medium text-[#26362d] dark:text-[#e8ede6] italic leading-relaxed">"Hãy để trẻ nhỏ đến cùng Thầy, đừng ngăn cấm chúng, vì Nước Thiên Chúa thuộc về những ai giống như chúng."</p>
                <p className="text-[12px] font-bold text-[#6b4d21] dark:text-[#d4b47d] mt-2.5">— Mc 10, 14</p>
              </div>
              <button
                onClick={() => { navigate("/giới-thiệu"); onClose(); }}
                className="group flex items-center justify-center gap-1.5 mt-6 w-full py-2.5 bg-[#314e3e] hover:bg-[#273e32] text-white dark:bg-[#d4b47d] dark:hover:bg-[#dfc394] dark:text-[#151c18] rounded-xl text-[12.5px] font-bold shadow-sm hover:shadow-md hover:shadow-[#314e3e]/20 dark:hover:shadow-[#d4b47d]/15 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#314e3e] dark:focus-visible:ring-[#d4b47d]"
              >
                <span>Tìm hiểu thêm</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Star(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
    </svg>
  );
}

function CommunityDropdown({ isOpen, onClose, navigate, currentPath }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          id="community-dropdown-panel"
          role="region"
          aria-label="Kênh thông tin và sinh hoạt giáo xứ"
          className="absolute left-1/2 -translate-x-1/2 top-full mt-3 w-[500px] max-w-[calc(100vw-32px)] rounded-[2rem] border border-[#dedfd4] dark:border-[#354237] bg-[#fffefa] dark:bg-[#1e2821] shadow-xl dark:shadow-black/40 z-50 overflow-hidden"
        >
          <div className="p-5 pb-3">
            <p className="text-[12px] font-bold uppercase tracking-wider text-[#7c5c2d] dark:text-[#d4b47d] font-serif">
              Kênh thông tin & Sinh hoạt
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 px-5 pb-4">
            {COMMUNITY_ITEMS.map((item) => {
              const Icon     = item.icon;
              const isActive = currentPath === item.path;
              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => { navigate(item.path); onClose(); }}
                  className={`flex items-start gap-3 p-3 text-left rounded-2xl bg-[#fffefa] dark:bg-[#1e2821] hover:bg-[#faf8f3] dark:hover:bg-[#151c18] transition-all group ${
                    isActive ? "bg-[#faf8f3] dark:bg-[#151c18] shadow-sm ring-1 ring-[#dedfd4] dark:ring-[#354237]" : ""
                  }`}
                >
                  <div className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ${item.bg} ring-1 ${isActive ? item.ring : "ring-transparent"} group-hover:ring-1 group-hover:${item.ring} transition-all mt-0.5`}>
                    <Icon className="w-4 h-4" style={{ color: item.accent }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-[13.5px] font-bold leading-snug ${isActive ? "text-[#293d32] dark:text-[#f2f2e8]" : "text-[#293d32] dark:text-[#ecece0] group-hover:text-[#314e3e] dark:group-hover:text-[#d4b47d]"}`}>
                      {item.label}
                    </p>
                    <p className="text-[12px] font-medium text-[#3d4a41] dark:text-[#cdd4c8] leading-tight mt-0.5 line-clamp-1">
                      {item.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="px-5 py-3 bg-[#faf8f3] dark:bg-[#151c18] border-t border-[#dedfd4] dark:border-[#354237] flex items-center justify-between">
            <span className="text-[12px] font-medium text-[#3d4a41] dark:text-[#cdd4c8]">
              Sinh hoạt: <strong className="text-[#293d32] dark:text-[#f2f2e8]">Chúa Nhật 07:30 – 10:30</strong>
            </span>
            <button
              type="button"
              onClick={() => { navigate("/liên-hệ"); onClose(); }}
              className="text-[12px] font-bold text-[#7c5c2d] dark:text-[#d4b47d] hover:text-[#314e3e] dark:hover:text-white transition-colors"
            >
              Hỗ trợ trực tiếp →
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function NotificationDropdown({ isOpen, onClose, notifications, loading, onItemClick, onMarkAllRead, hasUnread, navigate }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.97 }}
          className="absolute right-0 top-full mt-3 w-[88vw] max-w-sm sm:w-[400px] rounded-[1.5rem] border border-amber-900/10 dark:border-amber-100/10 bg-[#FDFBF7] dark:bg-[#161c18] shadow-2xl dark:shadow-black/40 z-50 overflow-hidden flex flex-col"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-amber-900/10 dark:border-amber-100/10 bg-amber-900/5 dark:bg-amber-100/5 shrink-0">
            <p className="text-[14px] font-bold text-amber-950 dark:text-amber-50 font-serif">Thông báo</p>
            {hasUnread && (
              <button type="button" onClick={onMarkAllRead}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-[11px] font-bold text-amber-800 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-800/50 transition-colors">
                <CheckCheck className="w-3.5 h-3.5" /> Đánh dấu đã đọc
              </button>
            )}
          </div>

          <div className="max-h-[50vh] overflow-y-auto" data-lenis-prevent>
            {loading && (
              <div className="flex items-center justify-center gap-2 py-12 text-stone-400 dark:text-stone-500">
                <Loader2 className="w-5 h-5 animate-spin" /> <span className="text-[13px] font-medium">Đang tải…</span>
              </div>
            )}

            {!loading && notifications.length === 0 && (
              <div className="flex flex-col items-center gap-3 py-12 text-stone-400 dark:text-stone-600">
                <div className="w-12 h-12 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center">
                  <BellOff className="w-6 h-6" />
                </div>
                <p className="text-[13px] font-medium text-stone-500 dark:text-stone-400">Bạn chưa có thông báo nào</p>
              </div>
            )}

            {!loading && notifications.map((n) => {
              const Icon = NOTIF_TYPE_ICON[n.type] || Info;
              return (
                <button
                  key={n.id} type="button" onClick={() => onItemClick(n)}
                  className={`flex w-full items-start gap-4 px-5 py-4 text-left border-b border-amber-900/5 dark:border-amber-100/5 transition-colors hover:bg-amber-50 dark:hover:bg-amber-900/20 ${!n.read ? "bg-amber-100/20 dark:bg-amber-900/10" : ""}`}
                >
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${!n.read ? "bg-amber-200 dark:bg-amber-600 text-amber-900 dark:text-amber-50" : "bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-500"}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-[14px] leading-snug ${!n.read ? "font-bold text-amber-950 dark:text-amber-50" : "font-semibold text-stone-700 dark:text-stone-300"}`}>{n.title}</p>
                      {!n.read && <span className="mt-1.5 w-2 h-2 rounded-full bg-red-500 flex-shrink-0 shadow-[0_0_8px_rgba(239,68,68,0.6)]" />}
                    </div>
                    <p className="text-[13px] text-stone-500 dark:text-stone-400 mt-1 line-clamp-2 leading-relaxed">{n.message}</p>
                    <p className="text-[11px] font-medium text-stone-400 dark:text-stone-500 mt-2">{timeAgoVi(n.created_at)}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {!loading && notifications.length > 0 && (
            <div className="p-3 border-t border-amber-900/10 dark:border-amber-100/10 bg-[#FDFBF7] dark:bg-[#161c18] shrink-0 text-center">
              <button 
                onClick={() => { navigate("/tài-khoản/thông-báo"); onClose(); }} 
                className="text-[12px] font-bold text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-300 transition-colors"
              >
                Xem tất cả thông báo
              </button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function AccountDropdown({ isOpen, onClose, navigate, currentPath, avatar, username, role, onLogout, onOpenProfile }) {
  const roleAccent = ROLE_ACCENTS[role] || ROLE_ACCENTS.user;
  const roleLabel  = ROLE_LABELS[role]  || ROLE_LABELS.user;
  const extraItems = getRoleExtraItems(role);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.97 }}
          className="absolute right-0 top-full mt-3 w-56 rounded-[1.5rem] border border-amber-900/10 dark:border-amber-100/10 bg-[#FDFBF7] dark:bg-[#161c18] shadow-lg dark:shadow-black/40 z-50 overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-amber-900/10 dark:border-amber-100/10 bg-amber-900/5 dark:bg-amber-100/5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full overflow-hidden border-2 flex-shrink-0" style={{ borderColor: roleAccent }}>
                <img src={avatar || "/images/avatarDefault.avif"} alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate">{username || "Thành viên"}</p>
                <p className="text-[10px] font-semibold" style={{ color: roleAccent }}>{roleLabel}</p>
              </div>
            </div>
          </div>
          <button type="button" onClick={() => { onOpenProfile(); onClose(); }}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm font-medium text-stone-700 dark:text-stone-300 hover:bg-amber-50 dark:hover:bg-amber-900/20 border-b border-amber-900/10 dark:border-amber-100/10 transition-colors">
            <User className="w-4 h-4 text-stone-400 dark:text-stone-500" /> Hồ sơ của tôi
          </button>

          {extraItems.length > 0 && (
            <div className="py-1 border-b border-amber-900/10 dark:border-amber-100/10">
              <p className="px-4 pt-1 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-800/70 dark:text-amber-400/70">
                Công cụ {roleLabel.toLowerCase()}
              </p>
              {extraItems.map((item) => {
                const Icon     = item.icon;
                const isActive = currentPath === item.path;
                return (
                  <button key={item.path} type="button" onClick={() => { navigate(item.path); onClose(); }}
                    className={`flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm transition-colors ${isActive ? "font-semibold" : "text-stone-700 dark:text-stone-300 hover:bg-amber-50 dark:hover:bg-amber-900/20"}`}
                    style={isActive ? { color: roleAccent, background: `${roleAccent}0f` } : undefined}
                  >
                    <Icon className="w-4 h-4" style={{ color: isActive ? roleAccent : "#a8a29e" }} />
                    {item.label}
                  </button>
                );
              })}
            </div>
          )}

          <div className="py-1">
            {ACCOUNT_ITEMS.map((item) => {
              const Icon     = item.icon;
              const isActive = currentPath === item.path;
              return (
                <button key={item.path} type="button" onClick={() => { navigate(item.path); onClose(); }}
                  className={`flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm transition-colors ${isActive ? "text-amber-800 dark:text-amber-400 bg-amber-100/50 dark:bg-amber-900/30" : "text-stone-700 dark:text-stone-300 hover:bg-amber-50 dark:hover:bg-amber-900/20"}`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-amber-700 dark:text-amber-400" : "text-stone-400 dark:text-stone-500"}`} />
                  {item.label}
                </button>
              );
            })}
          </div>
          <div className="border-t border-amber-900/10 dark:border-amber-100/10">
            <button type="button" onClick={() => { onLogout(); onClose(); }}
              className="flex w-full items-center gap-2.5 px-4 py-3 text-left text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
              <LogOut className="w-4 h-4" /> Đăng xuất
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ═══ MOBILE: Khối học bottom sheet ══════════════════════════════ */
function KhoiSheet({ open, onClose, navigate }) {
  const handleDragEnd = (_, info) => {
    if (info.offset.y > 70 || info.velocity.y > 350) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 bg-black/40 dark:bg-black/70 backdrop-blur-[2px]" 
            onClick={onClose} 
          />
          
          <motion.div 
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={handleDragEnd}
            initial={{ y: "100%", opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            exit={{ y: "100%", opacity: 0 }} 
            transition={{ type: "spring", stiffness: 380, damping: 38 }}
            role="dialog"
            aria-modal="true"
            aria-label="Danh sách Khối giáo lý"
            className="
              fixed z-[51] flex flex-col bg-[#faf8f3] dark:bg-[#151c18] shadow-2xl dark:shadow-black/50
              inset-x-0 bottom-0 rounded-t-[2rem] max-h-[85vh]
              sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2
              sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-md
              sm:rounded-3xl sm:max-h-[80vh]
            "
            style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
          >
            <div className="relative flex justify-center pt-3 pb-1 flex-shrink-0 touch-none cursor-grab active:cursor-grabbing sm:hidden">
              <div className="w-10 h-1.5 rounded-full bg-[#dedfd4] dark:bg-[#354237]" />
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng bảng khối học"
              className="absolute right-3 top-3 z-10 w-8 h-8 rounded-full bg-stone-500/10 dark:bg-stone-400/10 flex items-center justify-center hover:bg-stone-500/15 dark:hover:bg-stone-400/20 active:scale-95 transition-all text-[#293d32] dark:text-[#ecece0]"
            >
              <X className="w-4 h-4" strokeWidth={2.5} />
            </button>

            <div className="px-5 pt-2 pb-2 border-b border-[#dedfd4] dark:border-[#354237]">
              <h2 className="text-[16px] font-bold text-[#293d32] dark:text-[#ecece0]">Khối giáo lý</h2>
              <p className="text-[12px] text-[#575e55] dark:text-[#b0b9ac] mt-0.5">Chọn khối để xem chương trình và lịch học</p>
            </div>

            <div className="overflow-y-auto overscroll-contain flex-1 p-3.5 pb-6">
              <div className="grid grid-cols-2 gap-2.5">
                {KHOI_ITEMS.map((k) => {
                  const Icon = k.icon;
                  return (
                    <button 
                      key={k.path} 
                      type="button" 
                      onClick={() => { navigate(k.path); onClose(); }} 
                      className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-[#1e2821] border border-[#dedfd4] dark:border-[#354237] shadow-xs active:bg-[#faf8f3] dark:active:bg-[#253229] active:scale-[0.98] transition-all text-left group"
                    >
                      <div className={`w-10 h-10 rounded-xl ${k.bg} flex items-center justify-center flex-shrink-0 shadow-xs`}>
                        <Icon className="w-5 h-5" style={{ color: k.accent }} />
                      </div>
                      
                      <div className="flex-1 min-w-0"> 
                        <p className="text-[14px] font-bold text-[#293d32] dark:text-[#ecece0] leading-tight truncate">
                          {k.label}
                        </p>
                        <p className="text-[11px] text-[#575e55] dark:text-[#b0b9ac] mt-0.5 leading-snug line-clamp-1">
                          {k.sub}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function MoreMenuSheet({
  open, onClose, navigate, location,
  isLogin, onProfilePress, onLogout, avatar, username, role,
  ACCOUNT_ITEMS = [],
}) {
  const { install, isInstalled } = usePWAInstall();
  const goTo = (path) => { navigate(path); onClose(); };
  const roleAccent = ROLE_ACCENTS[role] || ROLE_ACCENTS.user;
  const roleLabel  = ROLE_LABELS[role]  || ROLE_LABELS.user;
  const extraItems = getRoleExtraItems(role);
 
  const handleDragEnd = (_, info) => {
    if (info.offset.y > 70 || info.velocity.y > 350) {
      onClose();
    }
  };
 
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 bg-black/40 dark:bg-black/70 backdrop-blur-[2px]"
            onClick={onClose}
          />
 
          <motion.div
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={handleDragEnd}
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 38 }}
            role="dialog"
            aria-modal="true"
            aria-label="Tiện ích và tài khoản"
            className="
              fixed z-[51] flex flex-col bg-[#faf8f3] dark:bg-[#151c18] shadow-2xl dark:shadow-black/50
              inset-x-0 bottom-0 rounded-t-[2rem] max-h-[85vh]
              sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2
              sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-md
              sm:rounded-3xl sm:max-h-[80vh]
            "
            style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
          >
            <div className="relative flex justify-center pt-3 pb-1 flex-shrink-0 touch-none cursor-grab active:cursor-grabbing sm:hidden">
              <div className="w-10 h-1.5 rounded-full bg-[#dedfd4] dark:bg-[#354237]" />
            </div>
 
            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng bảng tiện ích"
              className="absolute right-3 top-3 z-10 w-8 h-8 rounded-full bg-stone-500/10 dark:bg-stone-400/10 flex items-center justify-center hover:bg-stone-500/15 dark:hover:bg-stone-400/20 active:scale-95 transition-all text-[#293d32] dark:text-[#ecece0]"
            >
              <X className="w-4 h-4" strokeWidth={2.5} />
            </button>
 
            <div className="overflow-y-auto overscroll-contain flex-1">
 
              <button
                type="button"
                onClick={() => { onProfilePress(); onClose(); }}
                className="flex w-full items-center gap-3 px-5 py-4 border-b border-[#dedfd4] dark:border-[#354237] text-left active:bg-white dark:active:bg-[#1e2821] transition-colors"
              >
                {isLogin ? (
                  <>
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 flex-shrink-0" style={{ borderColor: roleAccent }}>
                      <img
                        src={avatar || "/images/avatarDefault.avif"}
                        className="w-full h-full object-cover"
                        alt=""
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="text-[15px] font-bold text-[#293d32] dark:text-[#ecece0] truncate">
                          {username || "Thành viên"}
                        </p>
                        <span
                          className="flex-shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                          style={{ color: roleAccent, background: `${roleAccent}18` }}
                        >
                          {roleLabel}
                        </span>
                      </div>
                      <p className="text-[13px] text-[#575e55] dark:text-[#b0b9ac]">
                        {role === "student" ? "Xem hồ sơ & thành tích →" : "Xem thông tin hồ sơ →"}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-[#dedfd4]/40 dark:bg-[#354237]/50 flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-[#575e55] dark:text-[#b0b9ac]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[15px] font-bold text-[#293d32] dark:text-[#ecece0]">Bạn chưa đăng nhập</p>
                      <p className="text-[13px] text-[#575e55] dark:text-[#b0b9ac]">Đăng nhập để truy cập tài khoản</p>
                    </div>
                    <span className="flex-shrink-0 flex h-9 items-center gap-1.5 rounded-xl bg-[#314e3e] dark:bg-[#d6b883] px-4 text-[13px] font-bold text-[#ffffff] dark:text-[#19251d] shadow-xs active:scale-95 transition-transform">
                      <LogIn className="w-3.5 h-3.5" strokeWidth={2.5} />
                      Đăng nhập
                    </span>
                  </>
                )}
              </button>
 
              {/* Quick links */}
              <div className="grid grid-cols-3 gap-2 p-3 border-b border-[#dedfd4] dark:border-[#354237] bg-stone-500/5 dark:bg-stone-400/5">
                <QuickLink icon={Info} label="Giới thiệu" onClick={() => goTo("/giới-thiệu")} />
                <QuickLink icon={Phone} label="Liên hệ" onClick={() => goTo("/liên-hệ")} />
                <QuickLink icon={Users} label="Tuyển sinh" onClick={() => goTo("/tuyển-sinh")} accent />
              </div>
 
              {isLogin && extraItems.length > 0 && (
                <div className="py-1 border-b border-[#dedfd4] dark:border-[#354237]">
                  <p className="px-5 pt-2.5 pb-1 text-[11px] font-bold uppercase tracking-wider text-[#575e55] dark:text-[#b0b9ac]">
                    Công cụ {roleLabel.toLowerCase()}
                  </p>
                  {extraItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                      <button
                        key={item.path}
                        type="button"
                        onClick={() => goTo(item.path)}
                        className="flex w-full items-center gap-3.5 px-5 py-3.5 text-left active:bg-white dark:active:bg-[#1e2821] transition-colors"
                        style={isActive ? { color: roleAccent, background: `${roleAccent}0f` } : undefined}
                      >
                        <Icon
                          className="w-[18px] h-[18px] flex-shrink-0"
                          style={{ color: isActive ? roleAccent : "#8c9489" }}
                          strokeWidth={1.75}
                        />
                        <span className="text-[14px] font-medium text-[#293d32] dark:text-[#ecece0]" style={isActive ? { color: roleAccent } : undefined}>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* PWA Install Action Row (Chỉ hiển thị khi chưa cài đặt) */}
              {!isInstalled && (
                <div className="py-1 border-b border-[#dedfd4] dark:border-[#354237]">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      install();
                    }}
                    className="flex w-full items-center gap-3.5 px-5 py-3.5 text-left active:bg-white dark:active:bg-[#1e2821] transition-colors"
                  >
                    <div className="w-[30px] h-[30px] rounded-[7px] bg-emerald-100/80 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center flex-shrink-0 shadow-xs">
                      <Smartphone className="w-[17px] h-[17px]" strokeWidth={2.2} />
                    </div>
                    <div className="flex-1 min-w-0 pr-1">
                      <p className="text-[14px] text-[#293d32] dark:text-[#ecece0] font-semibold tracking-tight leading-tight">
                        Cài đặt ứng dụng
                      </p>
                      <p className="text-[12px] text-[#575e55] dark:text-[#b0b9ac] mt-0.5 leading-tight truncate font-medium">
                        Thêm vào màn hình chính để mở nhanh
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-white bg-emerald-700 hover:bg-emerald-800 px-2.5 py-1 rounded-full shadow-xs">
                        <Download className="w-3 h-3" strokeWidth={2.5} /> Cài đặt
                      </span>
                    </div>
                  </button>
                </div>
              )}

              <div className="py-1">
                {ACCOUNT_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <button
                      key={item.path}
                      type="button"
                      onClick={() => goTo(item.path)}
                      className={`flex w-full items-center gap-3.5 px-5 py-3.5 text-left active:bg-white dark:active:bg-[#1e2821] transition-colors ${
                        isActive ? "text-[#314e3e] dark:text-[#d4b47d] bg-[#314e3e]/10 dark:bg-[#d4b47d]/20 font-semibold" : "text-[#293d32] dark:text-[#ecece0]"
                      }`}
                    >
                      <Icon
                        className={`w-[18px] h-[18px] flex-shrink-0 ${
                          isActive ? "text-[#314e3e] dark:text-[#d4b47d]" : "text-[#575e55] dark:text-[#b0b9ac]"
                        }`}
                        strokeWidth={1.75}
                      />
                      <span className="text-[14px] font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </div>
 
              {isLogin && (
                <div className="px-5 pb-4 pt-2 border-t border-[#dedfd4] dark:border-[#354237]">
                  <button
                    type="button"
                    onClick={() => { onLogout(); onClose(); }}
                    className="flex w-full items-center justify-center gap-2 py-3.5 rounded-[1rem] bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-[14px] font-bold active:bg-red-100 dark:active:bg-red-500/20 transition-colors"
                  >
                    <LogOut className="w-4 h-4" strokeWidth={2} />
                    Đăng xuất tài khoản
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
 
// ── Quick link button (3-ô grid) ─────────────────────────────────
function QuickLink({ icon: Icon, label, onClick, accent = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 py-3.5 rounded-[1rem] bg-white dark:bg-[#1e2821] border border-[#dedfd4] dark:border-[#354237] shadow-xs active:bg-[#faf8f3] dark:active:bg-[#253229] transition-colors"
    >
      <Icon className={`w-[18px] h-[18px] ${accent ? "text-[#927140] dark:text-[#d4b47d]" : "text-[#575e55] dark:text-[#b0b9ac]"}`} strokeWidth={1.75} />
      <span className="text-[12px] font-semibold text-[#293d32] dark:text-[#ecece0] leading-none">{label}</span>
    </button>
  );
}

/* ═══ MOBILE: Bottom tab bar ═════════════════════════════════════ */
function BottomTabBar({ location, navigate, isLogin, onProfilePress, onLogout, avatar, username, role }) {
  const [khoiSheetOpen, setKhoiSheetOpen] = useState(false);
  const [moreSheetOpen, setMoreSheetOpen] = useState(false);

  return (
    <>
      <KhoiSheet open={khoiSheetOpen} onClose={() => setKhoiSheetOpen(false)} navigate={navigate} />
      <MoreMenuSheet
        open={moreSheetOpen}
        onClose={() => setMoreSheetOpen(false)}
        navigate={navigate}
        location={location}
        isLogin={isLogin}
        onProfilePress={onProfilePress}
        onLogout={onLogout}
        avatar={avatar}
        username={username}
        role={role}
        ACCOUNT_ITEMS={ACCOUNT_ITEMS}
      />
      
      <nav 
        role="navigation"
        aria-label="Điều hướng di động"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#faf8f3]/95 dark:bg-[#151c18]/95 backdrop-blur-xl border-t border-[#dedfd4] dark:border-[#354237] shadow-[0_-4px_20px_rgba(0,0,0,0.05)] dark:shadow-black/30"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex h-16 items-stretch justify-around px-1.5">
          {MOBILE_TAB_ITEMS.map((item) => {
            const active = isItemActive(item, location.pathname);
            
            // Xử lý nút Khối Học (Mở KhoiSheet)
            if (item.type === "dropdown_khoi") {
              const Icon = item.icon;
              return (
                <motion.button 
                  whileTap={{ scale: 0.92 }} 
                  key="khoi-tab" 
                  type="button" 
                  onClick={() => setKhoiSheetOpen(true)}
                  aria-haspopup="dialog"
                  aria-expanded={khoiSheetOpen}
                  aria-label="Mở danh sách Khối học"
                  className={`flex-1 flex flex-col items-center justify-center pt-1 pb-1 transition-colors select-none ${
                    active ? "text-[#314e3e] dark:text-[#d4b47d]" : "text-[#575e55] dark:text-[#b0b9ac]"
                  }`}
                >
                  <div className="relative w-12 h-7 flex items-center justify-center">
                    {active && (
                      <motion.div
                        layoutId="mobileActiveTabIndicator"
                        transition={{ type: "spring", stiffness: 400, damping: 35 }}
                        className="absolute inset-0 rounded-full bg-[#314e3e]/10 dark:bg-[#d4b47d]/20"
                      />
                    )}
                    <Icon className="relative z-10 w-5 h-5" strokeWidth={active ? 2.2 : 1.8} />
                  </div>
                  <span className="text-[0.6875rem] font-bold tracking-tight mt-0.5">{item.label}</span>
                </motion.button>
              );
            }

            // Xử lý nút Tiện ích / Cá nhân (Mở MoreMenuSheet)
            if (item.type === "menu_more") {
              return (
                <motion.button 
                  whileTap={{ scale: 0.92 }} 
                  key="more-tab" 
                  type="button" 
                  onClick={() => setMoreSheetOpen(true)}
                  aria-haspopup="dialog"
                  aria-expanded={moreSheetOpen}
                  aria-label={isLogin ? `Tài khoản cá nhân, ${username || "Thành viên"}` : "Mở bảng Tiện ích"}
                  className={`flex-1 flex flex-col items-center justify-center pt-1 pb-1 transition-colors select-none ${
                    active ? "text-[#314e3e] dark:text-[#d4b47d]" : "text-[#575e55] dark:text-[#b0b9ac]"
                  }`}
                >
                  <div className="relative w-12 h-7 flex items-center justify-center">
                    {active && (
                      <motion.div
                        layoutId="mobileActiveTabIndicator"
                        transition={{ type: "spring", stiffness: 400, damping: 35 }}
                        className="absolute inset-0 rounded-full bg-[#314e3e]/10 dark:bg-[#d4b47d]/20"
                      />
                    )}
                    {isLogin ? (
                      <div 
                        className="relative z-10 w-5.5 h-5.5 rounded-full overflow-hidden border-2" 
                        style={{ borderColor: active ? (ROLE_ACCENTS[role] || ROLE_ACCENTS.user) : "#dedfd4" }}
                      >
                        <img src={avatar || "/images/avatarDefault.avif"} className="w-full h-full object-cover" alt="" />
                      </div>
                    ) : (
                      <Menu className="relative z-10 w-5 h-5" strokeWidth={active ? 2.2 : 1.8} />
                    )}
                  </div>
                  <span className="text-[0.6875rem] font-bold tracking-tight mt-0.5">{isLogin ? "Cá nhân" : "Tiện ích"}</span>
                </motion.button>
              );
            }

            // Xử lý các tab đường dẫn trực tiếp (Trang chủ, Lịch học, Tài liệu)
            const Icon = item.icon;
            return (
              <motion.button 
                whileTap={{ scale: 0.92 }} 
                key={item.path} 
                type="button" 
                onClick={() => navigate(item.path)}
                aria-current={active ? "page" : undefined}
                aria-label={item.label}
                className={`flex-1 flex flex-col items-center justify-center pt-1 pb-1 transition-colors select-none ${
                  active ? "text-[#314e3e] dark:text-[#d4b47d]" : "text-[#575e55] dark:text-[#b0b9ac]"
                }`}
              >
                <div className="relative w-12 h-7 flex items-center justify-center">
                  {active && (
                    <motion.div
                      layoutId="mobileActiveTabIndicator"
                      transition={{ type: "spring", stiffness: 400, damping: 35 }}
                      className="absolute inset-0 rounded-full bg-[#314e3e]/10 dark:bg-[#d4b47d]/20"
                    />
                  )}
                  <Icon className="relative z-10 w-5 h-5" strokeWidth={active ? 2.2 : 1.8} />
                </div>
                <span className="text-[0.6875rem] font-bold tracking-tight mt-0.5">{item.label}</span>
              </motion.button>
            );
          })}
        </div>
      </nav>
    </>
  );
}

/* ═══ HEADER (MAIN EXPORT) ════════════════════════════════════════ */
export default function Header({ toggleModal, isLogin, setIsLogin, handleClose }) {
  const { showToast } = useToast();
  const { install, isInstalled, hasNativePrompt } = usePWAInstall();
  const navigate  = useNavigate();
  const location  = useLocation();
  const isScrolled = useScrollPosition(); // Sử dụng hook cuộn chuột

  const [openMenu, setOpenMenu] = useState(null);
  const [avatar,   setAvatar]   = useState(() => localStorage.getItem("avatar")   || "");
  const [username, setUsername] = useState(() => localStorage.getItem("username") || "");
  const [role,     setRole]     = useState(() => localStorage.getItem("role")     || "user");

  const khoiRef      = useRef(null);
  const communityRef = useRef(null);
  const accountRef   = useRef(null);
  const notifRef     = useRef(null);

  const [unreadCount,   setUnreadCount]   = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [notifLoading,  setNotifLoading]  = useState(false);
  const [isRinging,     setIsRinging]     = useState(false);

  // Synchronize route change to close any open menu
  const prevPathRef = useRef(location.pathname);
  if (prevPathRef.current !== location.pathname) {
    prevPathRef.current = location.pathname;
    if (openMenu) setOpenMenu(null);
  }

  // Synchronize logout to reset notification counts
  const prevIsLoginRef = useRef(isLogin);
  if (!isLogin && prevIsLoginRef.current) {
    prevIsLoginRef.current = false;
    if (unreadCount !== 0) setUnreadCount(0);
    if (notifications.length > 0) setNotifications([]);
  } else if (isLogin && !prevIsLoginRef.current) {
    prevIsLoginRef.current = true;
  }

  useEffect(() => {
    const sync = () => {
      setAvatar(localStorage.getItem("avatar")   || "");
      setUsername(localStorage.getItem("username") || "");
      setRole(localStorage.getItem("role")     || "user");
    };
    window.addEventListener("avatar-updated", sync);
    window.addEventListener("storage",        sync);
    return () => {
      window.removeEventListener("avatar-updated", sync);
      window.removeEventListener("storage",        sync);
    };
  }, []);

  useEffect(() => {
    if (!isLogin) return;
    let cancelled = false;

    (async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser || cancelled) return;

        const { data, error } = await supabase
          .from("users")
          .select("role")
          .eq("auth_id", authUser.id)
          .maybeSingle();

        if (cancelled) return;
        if (error) { console.error("Header: fetch role error:", error); return; }

        if (data?.role) {
          setRole(data.role);
          localStorage.setItem("role", data.role);
        }
      } catch (err) {
        console.error("Header: fetch role exception:", err);
      }
    })();

    return () => { cancelled = true; };
  }, [isLogin]);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc("get_unread_notification_count");
      if (error) { console.error("Header: fetch unread count error:", error); return; }
      setUnreadCount(data ?? 0);
    } catch (err) {
      console.error("Header: fetch unread count exception:", err);
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    setNotifLoading(true);
    try {
      const { data, error } = await supabase.rpc("get_my_notifications", { p_limit: 30 });
      if (error) { console.error("Header: fetch notifications error:", error); return; }
      setNotifications(data ?? []);
    } catch (err) {
      console.error("Header: fetch notifications exception:", err);
    } finally {
      setNotifLoading(false);
    }
  }, []);

  const handleMarkAllRead = useCallback(async () => {
    try {
      const { error } = await supabase.rpc("mark_all_notifications_read");
      if (error) { console.error("Header: mark all read error:", error); return; }
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error("Header: mark all read exception:", err);
    }
  }, []);

  const handleMarkOneRead = useCallback(async (notificationId) => {
    try {
      const { error } = await supabase.rpc("mark_notification_read", { p_notification_id: notificationId });
      if (error) { console.error("Header: mark one read error:", error); return; }
      setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Header: mark one read exception:", err);
    }
  }, []);

  // Supabase Realtime Subscription thay cho setInterval
  useEffect(() => {
    if (!isLogin) return;
    
    // Fetch initial count
    fetchUnreadCount();

    // Subscribe to new notifications
    const channel = supabase.channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
        },
        () => {
          fetchUnreadCount();
          // Kích hoạt hiệu ứng lắc chuông
          setIsRinging(true);
          setTimeout(() => setIsRinging(false), 2000); // Tắt hiệu ứng sau 2s
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isLogin, fetchUnreadCount]);

  const handleBellClick = (e) => {
    e.stopPropagation();
    if (!isLogin) { showToast("Vui lòng đăng nhập để xem thông báo", "info"); return; }
    const opening = openMenu !== "notif";
    setOpenMenu(opening ? "notif" : null);
    if (opening) fetchNotifications();
  };

  const handleNotifItemClick = (n) => {
    setOpenMenu(null);
    if (!n.read) handleMarkOneRead(n.id);
    const targetLink = normalizeNotificationLink(n.link, n);
    if (targetLink) navigate(targetLink);
  };

  useEffect(() => {
    const onResize = () => setOpenMenu(null);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && openMenu) {
        const current = openMenu;
        setOpenMenu(null);
        if (current === "khoi") khoiRef.current?.querySelector("button")?.focus();
        else if (current === "community") communityRef.current?.querySelector("button")?.focus();
        else if (current === "account") accountRef.current?.querySelector("button")?.focus();
        else if (current === "notif") notifRef.current?.querySelector("button")?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [openMenu]);

  const closeKhoi      = useCallback(() => setOpenMenu((prev) => prev === "khoi" ? null : prev), []);
  const closeCommunity = useCallback(() => setOpenMenu((prev) => prev === "community" ? null : prev), []);
  const closeAccount   = useCallback(() => setOpenMenu((prev) => prev === "account" ? null : prev), []);
  const closeNotif     = useCallback(() => setOpenMenu((prev) => prev === "notif" ? null : prev), []);

  useOnClickOutside(khoiRef,      closeKhoi);
  useOnClickOutside(communityRef, closeCommunity);
  useOnClickOutside(accountRef,   closeAccount);
  useOnClickOutside(notifRef,     closeNotif);

  const toggle = (key, event) => {
    event.stopPropagation(); 
    setOpenMenu((prev) => (prev === key ? null : key));
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Header: logout error", err);
    }
    ["sessionKey", "role", "username", "user", "avatar", "studentData"].forEach((k) => localStorage.removeItem(k));
    setIsLogin(false);
    setRole("user");
    handleClose?.();
    showToast("Đã đăng xuất", "success");
  };

  const handleProfilePress = () => {
    if (isLogin) navigate("/tài-khoản/hồ-sơ");
    else toggleModal();
  };

  const isKhoiActive = KHOI_ITEMS.some((k) => k.path === location.pathname);
  const isCommunityActive = COMMUNITY_ITEMS.some((c) => c.path === location.pathname);

  return (
    <>
      <header 
        className={`sticky top-0 z-50 w-full antialiased transition-all duration-300 ${
          isScrolled 
            ? "bg-[#faf8f3]/90 dark:bg-[#151c18]/90 backdrop-blur-lg border-b border-[#dedfd4] dark:border-[#354237] shadow-sm" 
            : "bg-transparent border-b border-transparent"
        }`} 
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          
          <button 
            type="button" 
            onClick={() => navigate("/")} 
            className="flex items-center gap-2.5 sm:gap-3 select-none rounded-xl p-1 -ml-1 sm:p-1.5 sm:-ml-1.5 group transition-colors hover:bg-[#314e3e]/5 dark:hover:bg-[#d4b47d]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#314e3e] dark:focus-visible:ring-[#d4b47d] min-w-0 max-w-[calc(100%-48px)] sm:max-w-none"
          >
            <div className="relative flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center transition-transform duration-300 group-hover:scale-105">
              <img src="/images/logo_htdc.png" alt="Logo Ban Giáo Lý" className="h-full w-full object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.12)] transition-transform duration-500 group-hover:rotate-6" />
            </div>
            <div className="flex flex-col items-start text-left min-w-0">
              <span className="text-sm font-extrabold tracking-tight text-[#293d32] dark:text-[#ecece0] group-hover:text-[#314e3e] dark:group-hover:text-[#d4b47d] md:text-base font-serif transition-colors truncate w-full">BAN GIÁO LÝ</span>
              <span className="mt-0.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider sm:tracking-widest text-[#7c5c2d] dark:text-[#d4b47d] font-mono truncate max-w-[175px] xs:max-w-none">HTDC · XỨ ĐOÀN MẸ MÂN CÔI</span>
            </div>
          </button>

          <nav aria-label="Điều hướng chính" className="hidden md:flex items-center gap-0.5">
            {MAIN_ITEMS.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button key={item.path} type="button" onClick={() => navigate(item.path)}
                  className={`px-3.5 py-1.5 text-[13.5px] rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#314e3e] dark:focus-visible:ring-[#d4b47d] ${isActive ? "text-[#293d32] dark:text-[#ffffff] bg-[#314e3e]/10 dark:bg-[#d4b47d]/15 font-bold" : "font-medium text-[#38453d] dark:text-[#f0f2eb] hover:text-[#293d32] dark:hover:text-[#ffffff] hover:bg-[#314e3e]/5 dark:hover:bg-[#d4b47d]/10"}`}
                >
                  {item.label}
                </button>
              );
            })}
            <div className="w-px h-4 bg-[#dedfd4] dark:bg-[#354237] mx-1.5" />
            <div ref={khoiRef} className="relative">
              <button
                type="button"
                aria-haspopup="true"
                aria-expanded={openMenu === "khoi"}
                aria-controls="khoi-megamenu-panel"
                onClick={(e) => toggle("khoi", e)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 text-[13.5px] rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#314e3e] dark:focus-visible:ring-[#d4b47d] ${isKhoiActive || openMenu === "khoi" ? "text-[#293d32] dark:text-[#ffffff] bg-[#314e3e]/10 dark:bg-[#d4b47d]/15 font-bold" : "font-medium text-[#38453d] dark:text-[#f0f2eb] hover:text-[#293d32] dark:hover:text-[#ffffff] hover:bg-[#314e3e]/5 dark:hover:bg-[#d4b47d]/10"}`}
              >
                <span>Khối học</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${openMenu === "khoi" ? "rotate-180" : ""}`} />
              </button>
              <KhoiMegaMenu isOpen={openMenu === "khoi"} onClose={() => setOpenMenu(null)} navigate={navigate} currentPath={location.pathname} />
            </div>
            <div ref={communityRef} className="relative">
              <button
                type="button"
                aria-haspopup="true"
                aria-expanded={openMenu === "community"}
                aria-controls="community-dropdown-panel"
                onClick={(e) => toggle("community", e)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 text-[13.5px] rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#314e3e] dark:focus-visible:ring-[#d4b47d] ${isCommunityActive || openMenu === "community" ? "text-[#293d32] dark:text-[#ffffff] bg-[#314e3e]/10 dark:bg-[#d4b47d]/15 font-bold" : "font-medium text-[#38453d] dark:text-[#f0f2eb] hover:text-[#293d32] dark:hover:text-[#ffffff] hover:bg-[#314e3e]/5 dark:hover:bg-[#d4b47d]/10"}`}
              >
                <span>Sinh hoạt</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${openMenu === "community" ? "rotate-180" : ""}`} />
              </button>
              <CommunityDropdown isOpen={openMenu === "community"} onClose={() => setOpenMenu(null)} navigate={navigate} currentPath={location.pathname} />
            </div>
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {!isInstalled && hasNativePrompt && (
              <button
                type="button"
                onClick={install}
                className="hidden md:inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200/80 dark:border-emerald-800/50 transition-colors shadow-xs"
                title="Cài đặt ứng dụng lên máy tính"
              >
                <Download className="w-3.5 h-3.5" strokeWidth={2.2} />
                <span>Cài ứng dụng</span>
              </button>
            )}
            {isLogin ? (
              <div ref={notifRef} className="relative">
                <button
                  type="button"
                  onClick={handleBellClick}
                  className={`relative w-9 h-9 flex items-center justify-center rounded-full transition-colors ${
                    isScrolled ? "text-stone-500 dark:text-stone-400 hover:bg-amber-900/5 dark:hover:bg-amber-100/10" : "text-stone-700 dark:text-stone-300 hover:bg-amber-900/10 dark:hover:bg-amber-100/10"
                  } ${isRinging ? "animate-[wiggle_1s_ease-in-out_infinite]" : ""}`}
                  aria-label="Thông báo"
                  aria-expanded={openMenu === "notif"}
                >
                  <Bell className="w-[18px] h-[18px]" strokeWidth={1.8} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-[#FDFBF7] dark:ring-[#161c18]" />
                  )}
                </button>
                <NotificationDropdown
                  isOpen={openMenu === "notif"}
                  onClose={() => setOpenMenu(null)}
                  notifications={notifications}
                  loading={notifLoading}
                  onItemClick={handleNotifItemClick}
                  onMarkAllRead={handleMarkAllRead}
                  hasUnread={notifications.some((n) => !n.read)}
                  navigate={navigate}
                />
              </div>
            ) : (
              <button
                type="button"
                onClick={() => navigate("/cài-đặt")}
                className={`hidden md:flex relative w-9 h-9 items-center justify-center rounded-full transition-colors ${
                  location.pathname === "/cài-đặt"
                    ? "text-amber-800 dark:text-amber-300 bg-amber-900/10 dark:bg-amber-100/10"
                    : isScrolled
                    ? "text-stone-500 dark:text-stone-400 hover:bg-amber-900/5 dark:hover:bg-amber-100/10"
                    : "text-stone-700 dark:text-stone-300 hover:bg-amber-900/10 dark:hover:bg-amber-100/10"
                }`}
                title="Cài đặt & Tùy chỉnh"
                aria-label="Cài đặt"
              >
                <Settings className="w-[18px] h-[18px]" strokeWidth={1.8} />
              </button>
            )}
            <div ref={accountRef} className="relative hidden md:block">
              <AccountTriggerButton isLogin={isLogin} avatar={avatar} username={username} role={role} isOpen={openMenu === "account"} onToggle={(e) => toggle("account", e)} onLogin={toggleModal} />
              {isLogin && <AccountDropdown isOpen={openMenu === "account"} onClose={() => setOpenMenu(null)} navigate={navigate} currentPath={location.pathname} avatar={avatar} username={username} role={role} onLogout={handleLogout} onOpenProfile={handleProfilePress} />}
            </div>
          </div>
        </div>
      </header>

      <BottomTabBar location={location} navigate={navigate} isLogin={isLogin} onProfilePress={handleProfilePress} onLogout={handleLogout} avatar={avatar} username={username} role={role} />
    </>
  );
}