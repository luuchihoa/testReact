import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "../ui/ToastContext.jsx";
import { supabase } from "../../lib/supabase.js";
import {
  LogIn, LogOut, ChevronDown, Church,
  BookOpen, Sparkles, Flame, Heart, Globe, Users,
  CalendarDays, FileText, Phone, Settings, ShieldCheck,
  ScrollText, User, Home, GraduationCap, Info, Menu, X,
  LayoutDashboard, Bell, Loader2, CheckCheck, Megaphone, BellOff,
} from "lucide-react";

/* ═══ ROUTE MAP ═══════════════════════════════════════════════════ */
const KHOI_ITEMS = [
  { path: "/khối-chiên-con",    label: "Chiên Con",  sub: "Lớp 1 – 2",       icon: Heart,    accent: "#db2777", bg: "bg-pink-50 dark:bg-pink-500/10",     ring: "ring-pink-200 dark:ring-pink-500/30"     },
  { path: "/khối-rước-lễ",      label: "Rước Lễ",    sub: "Lớp 3 – 4",       icon: Sparkles, accent: "#65a30d", bg: "bg-lime-50 dark:bg-lime-500/10",     ring: "ring-lime-200 dark:ring-lime-500/30"     },
  { path: "/khối-thêm-sức",     label: "Thêm Sức",   sub: "Lớp 5 – 6",       icon: Flame,    accent: "#ca8a04", bg: "bg-yellow-50 dark:bg-yellow-500/10", ring: "ring-yellow-200 dark:ring-yellow-500/30" },
  { path: "/khối-phụng-vụ",     label: "Phụng Vụ",   sub: "Lớp 7",           icon: Church, accent: "#ea580c", bg: "bg-orange-50 dark:bg-orange-500/10", ring: "ring-orange-200 dark:ring-orange-500/30" },
  { path: "/khối-kinh-thánh",   label: "Kinh Thánh", sub: "Lớp 8 – 9",       icon: BookOpen, accent: "#dc2626", bg: "bg-red-50 dark:bg-red-500/10",       ring: "ring-red-200 dark:ring-red-500/30"       },
  { path: "/khối-vào-đời",      label: "Vào Đời",    sub: "Lớp 10 – 11",     icon: Globe,    accent: "#7c3a1e", bg: "bg-amber-50 dark:bg-amber-500/10",   ring: "ring-amber-200 dark:ring-amber-500/30"   },
];

const COMMUNITY_ITEMS = [
  { path: "/tuyển-sinh",     label: "Tuyển sinh",     icon: Users,        desc: "Đăng ký học viên mới" },
  { path: "/lịch-học",       label: "Lịch học",       icon: CalendarDays, desc: "Xem lịch giáo lý tuần" },
  { path: "/lịch-sinh-hoạt", label: "Lịch sinh hoạt", icon: CalendarDays, desc: "Theo dõi sự kiện giáo xứ" },
  { path: "/tài-liệu",       label: "Tài liệu",       icon: FileText,     desc: "Tải bài giảng & học liệu" },
  { path: "/liên-hệ",        label: "Liên hệ",        icon: Phone,        desc: "Kết nối & hỗ trợ" },
  { path: "/bài-viết",       label: "Bài viết",       icon: FileText,     desc: "Chia sẻ từ cộng đoàn" },
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
  { type: "dropdown_khoi",    label: "Khối học",     icon: GraduationCap },
  { path: "/lịch-học",        label: "Lịch học",     icon: CalendarDays },
  { path: "/tài-liệu",        label: "Tài liệu",     icon: FileText },
  { type: "menu_more",        label: "Mở rộng",      icon: Menu } 
];

function isItemActive(item, pathname) {
  if (item.type === "dropdown_khoi") return KHOI_ITEMS.some((s) => s.path === pathname);
  if (item.type === "menu_more") {
    const morePaths = ["/giới-thiệu", "/liên-hệ", "/tuyển-sinh", "/cài-đặt", "/bảo-mật", "/quy-định"];
    return morePaths.includes(pathname);
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
          initial={{ opacity: 0, y: -8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.98 }}
          className="absolute left-1/2 -translate-x-[40%] top-full mt-3 w-[720px] rounded-[2rem] border border-amber-900/10 dark:border-amber-100/10 bg-[#FDFBF7] dark:bg-[#1C1917] shadow-xl dark:shadow-black/40 z-50 overflow-hidden"
        >
          <div className="flex">
            {/* Cột Danh sách Khối (2/3 chiều rộng) */}
            <div className="w-2/3 p-5">
              <div className="mb-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-800/80 dark:text-amber-200/80 font-serif">Chương trình giáo lý</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {KHOI_ITEMS.map((khoi) => {
                  const Icon     = khoi.icon;
                  const isActive = currentPath === khoi.path;
                  return (
                    <button key={khoi.path} type="button" onClick={() => { navigate(khoi.path); onClose(); }}
                      className={`flex items-center gap-3 px-4 py-3 text-left rounded-2xl bg-[#FDFBF7] dark:bg-[#1C1917] hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors group ${isActive ? "bg-amber-50 dark:bg-amber-900/20 shadow-sm" : ""}`}
                    >
                      <div className={`flex-shrink-0 w-10 h-10 rounded-[14px] flex items-center justify-center ${khoi.bg} ring-1 ${isActive ? khoi.ring : "ring-transparent"} group-hover:ring-1 group-hover:${khoi.ring} transition-all`}>
                        <Icon className="w-4 h-4" style={{ color: khoi.accent }} />
                      </div>
                      <div className="min-w-0">
                        <p className={`text-[13px] font-bold leading-snug ${isActive ? "text-amber-950 dark:text-amber-50" : "text-stone-700 dark:text-stone-300 group-hover:text-amber-900 dark:group-hover:text-amber-100"}`}>{khoi.label}</p>
                        <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate">{khoi.sub}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            
            {/* Cột Nổi bật (Featured - 1/3 chiều rộng) */}
            <div className="w-1/3 bg-gradient-to-br from-amber-100 to-amber-50/50 dark:from-stone-800 dark:to-stone-900 p-6 flex flex-col justify-between border-l border-amber-900/10 dark:border-amber-100/10">
              <div>
                <div className="w-10 h-10 rounded-full bg-white dark:bg-stone-800 shadow-sm flex items-center justify-center mb-4">
                  <Star className="w-5 h-5 text-amber-500" />
                </div>
                <h4 className="text-sm font-bold text-amber-950 dark:text-amber-50 font-serif leading-snug mb-2">Lời Chúa cho Thiếu Nhi</h4>
                <p className="text-[11px] text-stone-600 dark:text-stone-400 italic">"Hãy để trẻ nhỏ đến cùng Thầy, đừng ngăn cấm chúng, vì Nước Thiên Chúa thuộc về những ai giống như chúng."</p>
                <p className="text-[10px] font-semibold text-amber-700 dark:text-amber-500 mt-2">— Mc 10, 14</p>
              </div>
              <button onClick={() => { navigate("/giới-thiệu"); onClose(); }} className="mt-6 w-full py-2 bg-amber-900 hover:bg-amber-800 dark:bg-amber-100 dark:hover:bg-white text-amber-50 dark:text-amber-950 rounded-xl text-xs font-bold transition-colors">
                Tìm hiểu thêm
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
          initial={{ opacity: 0, y: -6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.97 }}
          className="absolute left-1/2 -translate-x-1/2 top-full mt-3 w-60 rounded-[1.5rem] border border-amber-900/10 dark:border-amber-100/10 bg-[#FDFBF7] dark:bg-[#1C1917] shadow-lg dark:shadow-black/40 z-50 overflow-hidden"
        >
          {COMMUNITY_ITEMS.map((item, i) => {
            const Icon     = item.icon;
            const isActive = currentPath === item.path;
            return (
              <button key={item.path} type="button" onClick={() => { navigate(item.path); onClose(); }}
                className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${i !== COMMUNITY_ITEMS.length - 1 ? "border-b border-amber-900/5 dark:border-amber-100/5" : ""} ${isActive ? "bg-amber-100/50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300" : "text-stone-700 dark:text-stone-300 hover:bg-amber-50 dark:hover:bg-amber-900/20"}`}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-amber-700 dark:text-amber-400" : "text-stone-400 dark:text-stone-500"}`} />
                <div>
                  <p className="text-sm font-semibold">{item.label}</p>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">{item.desc}</p>
                </div>
              </button>
            );
          })}
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
          className="absolute right-0 top-full mt-3 w-[88vw] max-w-sm sm:w-[400px] rounded-[1.5rem] border border-amber-900/10 dark:border-amber-100/10 bg-[#FDFBF7] dark:bg-[#1C1917] shadow-2xl dark:shadow-black/40 z-50 overflow-hidden flex flex-col"
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
            <div className="p-3 border-t border-amber-900/10 dark:border-amber-100/10 bg-[#FDFBF7] dark:bg-[#1C1917] shrink-0 text-center">
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
          className="absolute right-0 top-full mt-3 w-56 rounded-[1.5rem] border border-amber-900/10 dark:border-amber-100/10 bg-[#FDFBF7] dark:bg-[#1C1917] shadow-lg dark:shadow-black/40 z-50 overflow-hidden"
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
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[60] bg-black/40 dark:bg-black/70 backdrop-blur-sm" 
            onClick={onClose} 
          />
          
          <motion.div 
            initial={{ y: "100%" }} 
            animate={{ y: 0 }} 
            exit={{ y: "100%" }} 
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="fixed bottom-0 left-0 right-0 z-[70] bg-[#FDFBF7] dark:bg-[#1C1917] rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] flex flex-col max-h-[85vh]"
            style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
          >
            <div className="flex justify-center pt-3.5 pb-5 touch-none flex-shrink-0">
              <div className="w-10 h-1.5 rounded-full bg-amber-900/20 dark:bg-amber-100/20" />
            </div>

            <div className="overflow-y-auto overscroll-contain flex-1 px-3 pb-8">
              <div className="grid grid-cols-2 gap-3.5">
                {KHOI_ITEMS.map((k) => {
                  const Icon = k.icon;
                  return (
                    <button 
                      key={k.path} 
                      type="button" 
                      onClick={() => { navigate(k.path); onClose(); }} 
                      className="flex items-center gap-3 p-3.5 rounded-[22px] bg-white dark:bg-stone-800/40 border border-amber-900/5 dark:border-amber-100/5 shadow-sm active:bg-amber-50 dark:active:bg-stone-800 active:scale-[0.98] transition-all text-left group"
                    >
                      <div className={`w-11 h-11 rounded-xl ${k.bg} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                        <Icon className="w-[22px] h-[22px]" style={{ color: k.accent }} />
                      </div>
                      
                      <div className="flex-1 min-w-0"> 
                        <p className="text-[15px] font-bold text-stone-900 dark:text-stone-100 leading-tight truncate">
                          {k.label}
                        </p>
                        <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 leading-snug line-clamp-1">
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
            transition={{ duration: 0.2 }}
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
            className="
              fixed z-[51] flex flex-col bg-[#FDFBF7] dark:bg-[#1C1917] shadow-2xl dark:shadow-black/50
              inset-x-0 bottom-0 rounded-t-[2rem] max-h-[85vh]
              sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2
              sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-md
              sm:rounded-3xl sm:max-h-[80vh]
            "
            style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
          >
            <div className="relative flex justify-center pt-3 pb-1 flex-shrink-0 touch-none cursor-grab active:cursor-grabbing sm:hidden">
              <div className="w-10 h-1.5 rounded-full bg-amber-900/20 dark:bg-amber-100/20" />
            </div>
 
            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng"
              className="absolute right-3 top-3 z-10 w-8 h-8 rounded-full bg-amber-900/5 dark:bg-amber-100/10 flex items-center justify-center active:bg-amber-900/10 dark:active:bg-amber-100/20 transition-colors"
            >
              <X className="w-4 h-4 text-amber-900/60 dark:text-amber-100/60" strokeWidth={2.5} />
            </button>
 
            <div className="overflow-y-auto overscroll-contain flex-1">
 
              <button
                type="button"
                onClick={() => { onProfilePress(); onClose(); }}
                className="flex w-full items-center gap-3 px-5 py-4 border-b border-amber-900/10 dark:border-amber-100/10 text-left active:bg-amber-50 dark:active:bg-stone-800/70 transition-colors"
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
                        <p className="text-[15px] font-bold text-stone-900 dark:text-stone-100 truncate">
                          {username || "Thành viên"}
                        </p>
                        <span
                          className="flex-shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                          style={{ color: roleAccent, background: `${roleAccent}18` }}
                        >
                          {roleLabel}
                        </span>
                      </div>
                      <p className="text-[13px] text-stone-500 dark:text-stone-400">Xem hồ sơ & thành tích →</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-amber-900/5 dark:bg-stone-800 flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-amber-900/40 dark:text-stone-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[15px] font-bold text-amber-950 dark:text-stone-100">Bạn chưa đăng nhập</p>
                      <p className="text-[13px] text-stone-500 dark:text-stone-400">Đăng nhập để xem thông tin học tập</p>
                    </div>
                    <span className="flex-shrink-0 flex h-9 items-center gap-1.5 rounded-xl bg-amber-900 px-4 text-[13px] font-bold text-amber-50 shadow-sm">
                      <LogIn className="w-3.5 h-3.5" strokeWidth={2.5} />
                      Đăng nhập
                    </span>
                  </>
                )}
              </button>
 
              {/* Quick links */}
              <div className="grid grid-cols-3 gap-2 p-3 border-b border-amber-900/10 dark:border-amber-100/10 bg-amber-900/5 dark:bg-amber-100/5">
                <QuickLink icon={Info} label="Giới thiệu" onClick={() => goTo("/giới-thiệu")} />
                <QuickLink icon={Phone} label="Liên hệ" onClick={() => goTo("/liên-hệ")} />
                <QuickLink icon={Users} label="Tuyển sinh" onClick={() => goTo("/tuyển-sinh")} accent />
              </div>
 
              {extraItems.length > 0 && (
                <div className="py-1 border-b border-amber-900/10 dark:border-amber-100/10">
                  <p className="px-5 pt-2 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-800/70 dark:text-amber-400/70">
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
                        className="flex w-full items-center gap-3.5 px-5 py-3.5 text-left active:bg-amber-50 dark:active:bg-stone-800/70 transition-colors"
                        style={isActive ? { color: roleAccent, background: `${roleAccent}0f` } : undefined}
                      >
                        <Icon
                          className="w-[18px] h-[18px] flex-shrink-0"
                          style={{ color: isActive ? roleAccent : "#a8a29e" }}
                          strokeWidth={1.75}
                        />
                        <span className="text-[14px] font-medium text-stone-700 dark:text-stone-300" style={isActive ? { color: roleAccent } : undefined}>{item.label}</span>
                      </button>
                    );
                  })}
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
                      className={`flex w-full items-center gap-3.5 px-5 py-3.5 text-left active:bg-amber-50 dark:active:bg-stone-800/70 transition-colors ${
                        isActive ? "text-amber-800 dark:text-amber-400 bg-amber-100/50 dark:bg-amber-900/30" : "text-stone-700 dark:text-stone-300"
                      }`}
                    >
                      <Icon
                        className={`w-[18px] h-[18px] flex-shrink-0 ${
                          isActive ? "text-amber-700 dark:text-amber-400" : "text-stone-400 dark:text-stone-500"
                        }`}
                        strokeWidth={1.75}
                      />
                      <span className="text-[14px] font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </div>
 
              {isLogin && (
                <div className="px-5 pb-4 pt-2 border-t border-amber-900/10 dark:border-amber-100/10">
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
      className="flex flex-col items-center gap-1.5 py-3.5 rounded-[1rem] bg-white dark:bg-stone-900 border border-amber-900/5 dark:border-stone-700/50 shadow-sm dark:shadow-black/20 active:bg-amber-50 dark:active:bg-stone-800 transition-colors"
    >
      <Icon className={`w-[18px] h-[18px] ${accent ? "text-amber-600 dark:text-amber-400" : "text-stone-500 dark:text-stone-400"}`} strokeWidth={1.75} />
      <span className="text-[12px] font-semibold text-stone-700 dark:text-stone-300 leading-none">{label}</span>
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
      
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#FDFBF7]/95 dark:bg-[#1C1917]/95 backdrop-blur-xl border-t border-amber-900/10 dark:border-amber-100/10 shadow-[0_-4px_20px_rgba(146,64,14,0.05)] dark:shadow-black/30"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex h-18 items-stretch justify-around px-2">
          {MOBILE_TAB_ITEMS.map((item) => {
            const active = isItemActive(item, location.pathname);
            
            // Xử lý nút Khối Học
            if (item.type === "dropdown_khoi") {
              const Icon = item.icon;
              return (
                <motion.button whileTap={{ scale: 0.85, y: 2 }} key="khoi-tab" type="button" onClick={() => setKhoiSheetOpen(true)}
                  className={`flex-1 flex flex-col items-center justify-center gap-1 pt-1.5 pb-1 transition-colors ${active ? "text-amber-700 dark:text-amber-400" : "text-stone-400 dark:text-stone-500"}`}
                >
                  <div className={`w-8 h-8 flex items-center justify-center rounded-full transition-all ${active ? "bg-amber-100/80 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 w-12" : ""}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold tracking-tight">{item.label}</span>
                </motion.button>
              );
            }

            // Xử lý nút Mở Rộng (More)
            if (item.type === "menu_more") {
              return (
                <motion.button whileTap={{ scale: 0.85, y: 2 }} key="more-tab" type="button" onClick={() => setMoreSheetOpen(true)}
                  className={`flex-1 flex flex-col items-center justify-center gap-1 pt-1.5 pb-1 transition-colors ${active ? "text-amber-700 dark:text-amber-400" : "text-stone-400 dark:text-stone-500"}`}
                >
                  <div className={`w-8 h-8 flex items-center justify-center rounded-full transition-all ${active ? "bg-amber-100/80 dark:bg-amber-500/20 w-12" : ""}`}>
                    {isLogin ? (
                      <div className="w-6 h-6 rounded-full overflow-hidden border-2" style={{ borderColor: active ? (ROLE_ACCENTS[role] || ROLE_ACCENTS.user) : "#d6d3d1" }}>
                        <img src={avatar || "/images/avatarDefault.avif"} className="w-full h-full object-cover" alt="" />
                      </div>
                    ) : (
                      <Menu className="w-5 h-5" />
                    )}
                  </div>
                  <span className="text-[10px] font-bold tracking-tight">{isLogin ? (username || "Tôi").split(" ").pop() : "Mở rộng"}</span>
                </motion.button>
              );
            }

            // Xử lý các tab đường dẫn trực tiếp (Home, Lịch học, Tài liệu)
            const Icon = item.icon;
            return (
              <motion.button whileTap={{ scale: 0.85, y: 2 }} key={item.path} type="button" onClick={() => navigate(item.path)}
                className={`flex-1 flex flex-col items-center justify-center gap-1 pt-1.5 pb-1 transition-colors ${active ? "text-amber-700 dark:text-amber-400" : "text-stone-400 dark:text-stone-500"}`}
              >
                <div className={`w-8 h-8 flex items-center justify-center rounded-full transition-all ${active ? "bg-amber-100/80 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 w-12" : ""}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold tracking-tight">{item.label}</span>
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
  const navigate  = useNavigate();
  const location  = useLocation();
  const isScrolled = useScrollPosition(); // Sử dụng hook cuộn chuột

  const [openMenu, setOpenMenu] = useState(null);
  const [avatar,   setAvatar]   = useState(() => localStorage.getItem("avatar")   || "");
  const [username, setUsername] = useState(() => localStorage.getItem("username") || "");
  const [role,     setRole]     = useState(() => localStorage.getItem("role")     || "student");

  const khoiRef      = useRef(null);
  const communityRef = useRef(null);
  const accountRef   = useRef(null);
  const notifRef     = useRef(null);

  const [unreadCount,   setUnreadCount]   = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [notifLoading,  setNotifLoading]  = useState(false);
  const [isRinging,     setIsRinging]     = useState(false);

  useEffect(() => {
    const sync = () => {
      setAvatar(localStorage.getItem("avatar")   || "");
      setUsername(localStorage.getItem("username") || "");
      setRole(localStorage.getItem("role")     || "student");
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
    if (!isLogin) { 
      setUnreadCount(0); 
      setNotifications([]); 
      return; 
    }
    
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
        (payload) => {
          // Khi có thông báo mới insert vào db (cho dù của ai)
          // Chúng ta cứ fetch lại count để cho an toàn nếu rls áp dụng
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
    if (n.link) navigate(n.link);
  };

  useEffect(() => { setOpenMenu(null); }, [location.pathname]);

  useEffect(() => {
    const onResize = () => setOpenMenu(null);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

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
    setRole("student");
    handleClose?.();
    showToast("Đã đăng xuất", "success");
  };

  const handleProfilePress = () => {
    if (isLogin) navigate("/tài-khoản/hồ-sơ");
    else toggleModal();
  };

  const isKhoiActive = KHOI_ITEMS.some((k) => k.path === location.pathname);

  return (
    <>
      <header 
        className={`sticky top-0 z-50 w-full antialiased transition-all duration-300 ${
          isScrolled 
            ? "bg-[#FDFBF7]/85 dark:bg-[#1C1917]/85 backdrop-blur-lg border-b border-amber-900/10 dark:border-amber-100/10 shadow-sm" 
            : "bg-transparent border-b border-transparent"
        }`} 
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          
          <button type="button" onClick={() => navigate("/")} className="flex items-center gap-3 select-none rounded-xl p-1.5 -ml-1.5 group transition-colors hover:bg-amber-900/5 dark:hover:bg-amber-100/5">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-amber-200/60 dark:border-amber-800/30 bg-gradient-to-br from-amber-50 to-[#FDFBF7] dark:from-amber-900/20 dark:to-[#1C1917] shadow-sm transition-all group-hover:scale-105">
              <img src="/images/logo_htdc.avif" alt="Logo Ban Giáo Lý" className="h-full w-full object-contain p-1 transition-transform duration-500 group-hover:rotate-6" />
            </div>
            <div className="flex flex-col items-start text-left">
              <span className="text-sm font-extrabold tracking-tight text-amber-950 dark:text-amber-50 group-hover:text-amber-700 dark:group-hover:text-amber-400 md:text-base font-serif transition-colors">BAN GIÁO LÝ</span>
              <span className="mt-0.5 text-[9px] font-bold uppercase tracking-widest text-amber-800/60 dark:text-amber-200/50 md:text-[10px] whitespace-nowrap">HTDC · XỨ ĐOÀN MẸ MÂN CÔI</span>
            </div>
          </button>

          <nav aria-label="Điều hướng chính" className="hidden md:flex items-center gap-0.5">
            {MAIN_ITEMS.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button key={item.path} type="button" onClick={() => navigate(item.path)}
                  className={`px-3.5 py-1.5 text-[13px] font-medium rounded-lg transition-colors ${isActive ? "text-amber-950 dark:text-amber-50 bg-amber-900/5 dark:bg-amber-100/5 font-bold" : "text-stone-600 dark:text-stone-400 hover:text-amber-900 dark:hover:text-amber-100 hover:bg-amber-900/5 dark:hover:bg-amber-100/5"}`}
                >
                  {item.label}
                </button>
              );
            })}
            <div className="w-px h-4 bg-amber-900/10 dark:bg-amber-100/10 mx-1.5" />
            <div ref={khoiRef} className="relative">
              <button type="button" onClick={(e) => toggle("khoi", e)} className={`flex items-center gap-1 px-3.5 py-1.5 text-[13px] font-medium rounded-lg transition-colors ${isKhoiActive || openMenu === "khoi" ? "text-amber-950 dark:text-amber-50 bg-amber-900/5 dark:bg-amber-100/5 font-bold" : "text-stone-600 dark:text-stone-400 hover:text-amber-900 dark:hover:text-amber-100 hover:bg-amber-900/5 dark:hover:bg-amber-100/5"}`}>
                Khối học <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${openMenu === "khoi" ? "rotate-180" : ""}`} />
              </button>
              <KhoiMegaMenu isOpen={openMenu === "khoi"} onClose={() => setOpenMenu(null)} navigate={navigate} currentPath={location.pathname} />
            </div>
            <div ref={communityRef} className="relative">
              <button type="button" onClick={(e) => toggle("community", e)} className={`flex items-center gap-1 px-3.5 py-1.5 text-[13px] font-medium rounded-lg transition-colors ${openMenu === "community" ? "text-amber-950 dark:text-amber-50 bg-amber-900/5 dark:bg-amber-100/5 font-bold" : "text-stone-600 dark:text-stone-400 hover:text-amber-900 dark:hover:text-amber-100 hover:bg-amber-900/5 dark:hover:bg-amber-100/5"}`}>
                Cộng đoàn <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${openMenu === "community" ? "rotate-180" : ""}`} />
              </button>
              <CommunityDropdown isOpen={openMenu === "community"} onClose={() => setOpenMenu(null)} navigate={navigate} currentPath={location.pathname} />
            </div>
          </nav>

          <div className="flex items-center gap-2">
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
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-[#FDFBF7] dark:ring-[#1C1917]" />
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