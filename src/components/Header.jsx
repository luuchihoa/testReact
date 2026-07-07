import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "./ui/ToastContext.jsx";
import { supabase } from "../lib/supabase.js";
import {
  LogIn, LogOut, ChevronDown,
  BookOpen, Sparkles, Flame, Heart, Globe, Users,
  CalendarDays, FileText, Phone, Settings, ShieldCheck,
  ScrollText, User, Home, GraduationCap, Info, Menu, X,
  LayoutDashboard
} from "lucide-react";

/* ═══ ROUTE MAP ═══════════════════════════════════════════════════ */
const KHOI_ITEMS = [
  { path: "/khối-chiên-con",    label: "Chiên Con",  sub: "Mầm non – Lớp 2", icon: Heart,    accent: "#db2777", bg: "bg-pink-50",   ring: "ring-pink-200"   },
  { path: "/khối-rước-lễ",      label: "Rước Lễ",    sub: "Lớp 3 – 4",       icon: Sparkles, accent: "#65a30d", bg: "bg-lime-50",   ring: "ring-lime-200"   },
  { path: "/khối-thêm-sức",     label: "Thêm Sức",   sub: "Lớp 5 – 6",       icon: Flame,    accent: "#ca8a04", bg: "bg-yellow-50", ring: "ring-yellow-200" },
  { path: "/khối-phụng-vụ",     label: "Phụng Vụ",   sub: "Lớp 7",           icon: Sparkles, accent: "#ea580c", bg: "bg-orange-50", ring: "ring-orange-200" },
  { path: "/khối-kinh-thánh",   label: "Kinh Thánh", sub: "Lớp 8 – 9",       icon: BookOpen, accent: "#dc2626", bg: "bg-red-50",    ring: "ring-red-200"    },
  { path: "/khối-vào-đời",      label: "Vào Đời",    sub: "Lớp 10 – 11",     icon: Globe,    accent: "#7c3a1e", bg: "bg-amber-50",  ring: "ring-amber-200"  },
  { path: "/giới-trẻ-công-giáo", label: "Giới Trẻ", sub: "Giới trẻ Xứ Đoàn", icon: Users,    accent: "#2563eb", bg: "bg-blue-50",   ring: "ring-blue-200"   }
];

const COMMUNITY_ITEMS = [
  { path: "/tuyển-sinh",     label: "Tuyển sinh",     icon: Users,        desc: "Đăng ký học viên mới" },
  { path: "/lịch-học",       label: "Lịch học",       icon: CalendarDays, desc: "Xem lịch giáo lý tuần" },
  { path: "/lịch-sinh-hoạt", label: "Lịch sinh hoạt", icon: CalendarDays, desc: "Theo dõi sự kiện giáo xứ" },
  { path: "/tài-liệu",       label: "Tài liệu",        icon: FileText,     desc: "Tải bài giảng & học liệu" },
  { path: "/liên-hệ",        label: "Liên hệ",         icon: Phone,        desc: "Kết nối & hỗ trợ" },
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

// Nhãn hiển thị + màu nhận diện theo từng vai trò (role đọc từ bảng `users`)
const ROLE_LABELS = {
  admin:   "Quản trị viên",
  teacher: "Giáo viên",
  student: "Học sinh",
  user:    "Thành viên",
};

const ROLE_ACCENTS = {
  admin:   "#dc2626", // đỏ — quyền cao nhất
  teacher: "#2563eb", // xanh dương — giáo lý viên
  student: "#16a34a", // xanh lá — học sinh
  user:    "#78716c", // xám — mặc định/chưa phân loại
};

// Mục menu riêng theo vai trò — hiển thị thêm vào Account Dropdown (desktop)
// và More Menu Sheet (mobile), phía trên các mục chung (ACCOUNT_ITEMS)
const ROLE_EXTRA_ITEMS = {
  admin: [
    { path: "/quan-tri", label: "Quản trị hệ thống", icon: LayoutDashboard },
  ],
  teacher: [
    { path: "/giáo-viên/lớp-học", label: "Lớp học của tôi", icon: GraduationCap },
  ],
  student: [],
  user: [],
};

function getRoleExtraItems(role) {
  return ROLE_EXTRA_ITEMS[role] ?? [];
}

// Cấu trúc chuẩn 5 nút trên Mobile Bottom Bar theo Apple/Google UX
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

/* ═══ DESKTOP COMPONENTS (Giữ nguyên) ════════════════════════════ */
function AccountTriggerButton({ isLogin, avatar, username, role, isOpen, onToggle, onLogin }) {
  if (!isLogin) return (
    <button type="button" onClick={onLogin}
      className="inline-flex h-9 items-center gap-1.5 rounded-full bg-stone-900 px-4 text-[12px] font-semibold text-white shadow-sm hover:bg-stone-800 transition-colors">
      <LogIn className="w-3.5 h-3.5" />Đăng nhập
    </button>
  );
  const roleAccent = ROLE_ACCENTS[role] || ROLE_ACCENTS.user;
  return (
    <button type="button" onClick={onToggle} aria-expanded={isOpen}
      className={`flex items-center gap-2 rounded-full border transition-all pl-0.5 pr-3 py-0.5 ${
        isOpen ? "border-stone-300 bg-stone-100 shadow-inner" : "border-stone-200/60 bg-stone-50 hover:bg-stone-100"
      }`}>
      <div className="h-7 w-7 flex-shrink-0 overflow-hidden rounded-full border-2" style={{ borderColor: roleAccent }}>
        <img src={avatar || "/images/avatarDefault.avif"} alt="Avatar" className="h-full w-full object-cover" />
      </div>
      <span className="text-xs font-semibold text-stone-700 max-w-[90px] truncate">{username || "Tài khoản"}</span>
      <ChevronDown className={`w-3 h-3 text-stone-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
    </button>
  );
}

function KhoiMegaMenu({ isOpen, onClose, navigate, currentPath }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.98 }}
          className="absolute left-1/2 -translate-x-1/2 top-full mt-3 w-[520px] rounded-2xl border border-stone-200/60 bg-white shadow-xl z-50 overflow-hidden"
        >
          <div className="px-5 py-3 border-b border-stone-100 bg-stone-50/60">
            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Chương trình giáo lý</p>
          </div>
          <div className="grid grid-cols-2 gap-px bg-stone-100 p-px">
            {KHOI_ITEMS.map((khoi) => {
              const Icon     = khoi.icon;
              const isActive = currentPath === khoi.path;
              return (
                <button key={khoi.path} type="button" onClick={() => { navigate(khoi.path); onClose(); }}
                  className={`flex items-center gap-3 px-4 py-3.5 text-left bg-white hover:bg-stone-50 transition-colors group ${isActive ? "bg-stone-50" : ""}`}
                >
                  <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${khoi.bg} ring-1 ${isActive ? khoi.ring : "ring-transparent"} group-hover:ring-1 group-hover:${khoi.ring} transition-all`}>
                    <Icon className="w-4 h-4" style={{ color: khoi.accent }} />
                  </div>
                  <div className="min-w-0">
                    <p className={`text-sm font-semibold leading-snug ${isActive ? "text-stone-900" : "text-stone-700"}`}>{khoi.label}</p>
                    <p className="text-[11px] text-stone-400 truncate">{khoi.sub}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function CommunityDropdown({ isOpen, onClose, navigate, currentPath }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.97 }}
          className="absolute left-1/2 -translate-x-1/2 top-full mt-3 w-60 rounded-2xl border border-stone-200/60 bg-white shadow-lg z-50 overflow-hidden"
        >
          {COMMUNITY_ITEMS.map((item, i) => {
            const Icon     = item.icon;
            const isActive = currentPath === item.path;
            return (
              <button key={item.path} type="button" onClick={() => { navigate(item.path); onClose(); }}
                className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${i !== COMMUNITY_ITEMS.length - 1 ? "border-b border-stone-100" : ""} ${isActive ? "bg-orange-50/60 text-orange-600" : "text-stone-700 hover:bg-stone-50"}`}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-orange-500" : "text-stone-400"}`} />
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-[11px] text-stone-400">{item.desc}</p>
                </div>
              </button>
            );
          })}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function AccountDropdown({ isOpen, onClose, navigate, currentPath, avatar, username, role, onLogout, onOpenModal }) {
  const roleAccent = ROLE_ACCENTS[role] || ROLE_ACCENTS.user;
  const roleLabel  = ROLE_LABELS[role]  || ROLE_LABELS.user;
  const extraItems = getRoleExtraItems(role);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.97 }}
          className="absolute right-0 top-full mt-3 w-56 rounded-2xl border border-stone-200/60 bg-white shadow-lg z-50 overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-stone-100 bg-stone-50/60">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full overflow-hidden border-2 flex-shrink-0" style={{ borderColor: roleAccent }}>
                <img src={avatar || "/images/avatarDefault.avif"} alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-stone-900 truncate">{username || "Thành viên"}</p>
                <p className="text-[10px] font-semibold" style={{ color: roleAccent }}>{roleLabel}</p>
              </div>
            </div>
          </div>
          <button type="button" onClick={() => { onOpenModal(); onClose(); }}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm font-medium text-stone-700 hover:bg-stone-50 border-b border-stone-100">
            <User className="w-4 h-4 text-stone-400" /> Hồ sơ của tôi
          </button>

          {extraItems.length > 0 && (
            <div className="py-1 border-b border-stone-100">
              <p className="px-4 pt-1 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                Công cụ {roleLabel.toLowerCase()}
              </p>
              {extraItems.map((item) => {
                const Icon     = item.icon;
                const isActive = currentPath === item.path;
                return (
                  <button key={item.path} type="button" onClick={() => { navigate(item.path); onClose(); }}
                    className={`flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm transition-colors ${isActive ? "font-semibold" : "text-stone-700 hover:bg-stone-50"}`}
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
                  className={`flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm transition-colors ${isActive ? "text-orange-600 bg-orange-50/60" : "text-stone-700 hover:bg-stone-50"}`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-orange-500" : "text-stone-400"}`} />
                  {item.label}
                </button>
              );
            })}
          </div>
          <div className="border-t border-stone-100">
            <button type="button" onClick={() => { onLogout(); onClose(); }}
              className="flex w-full items-center gap-2.5 px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50">
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-[2px]" onClick={onClose} />
          <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            className="fixed bottom-0 left-0 right-0 z-[70] bg-white rounded-t-3xl overflow-hidden shadow-2xl max-h-[80vh] overflow-y-auto"
            style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
          >
            <div className="flex justify-center pt-3 pb-2"><div className="w-10 h-1 rounded-full bg-stone-200" /></div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-stone-400 mb-2 px-5">Chọn chương trình học</p>
            <div className="grid grid-cols-2 gap-px bg-stone-100">
              {KHOI_ITEMS.map((k) => {
                const Icon = k.icon;
                return (
                  <button key={k.path} type="button" onClick={() => { navigate(k.path); onClose(); }} className="flex items-center gap-3 px-4 py-4 bg-white active:bg-stone-50 text-left">
                    <div className={`w-9 h-9 rounded-xl ${k.bg} flex items-center justify-center flex-shrink-0`}><Icon className="w-4 h-4" style={{ color: k.accent }} /></div>
                    <div>
                      <p className="text-[14px] font-semibold text-stone-800 leading-snug">{k.label}</p>
                      <p className="text-[11px] text-stone-400">{k.sub}</p>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="h-4" />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function MoreMenuSheet({
  open, onClose, navigate, location,
  isLogin, onLoginPress, onLogout, avatar, username, role,
  ACCOUNT_ITEMS = [],
}) {
  const goTo = (path) => { navigate(path); onClose(); };
  const roleAccent = ROLE_ACCENTS[role] || ROLE_ACCENTS.user;
  const roleLabel  = ROLE_LABELS[role]  || ROLE_LABELS.user;
  const extraItems = getRoleExtraItems(role);
 
  // Drag-to-dismiss: đóng khi kéo xuống quá 70px hoặc vuốt nhanh
  const handleDragEnd = (_, info) => {
    if (info.offset.y > 70 || info.velocity.y > 350) {
      onClose();
    }
  };
 
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[2px]"
            onClick={onClose}
          />
 
          {/* Desktop: modal căn giữa | Mobile: bottom sheet trượt lên */}
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
              fixed z-[51] flex flex-col bg-white shadow-2xl
              inset-x-0 bottom-0 rounded-t-3xl max-h-[85vh]
              sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2
              sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-md
              sm:rounded-3xl sm:max-h-[80vh]
            "
            style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
          >
            {/* Pull tab — tay cầm kéo, chặn cuộn ngoài bằng touch-none */}
            <div className="relative flex justify-center pt-3 pb-1 flex-shrink-0 touch-none cursor-grab active:cursor-grabbing sm:hidden">
              <div className="w-10 h-1 rounded-full bg-stone-200" />
            </div>
 
            {/* Nút đóng — luôn hiện, kể cả desktop */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng"
              className="absolute right-3 top-3 z-10 w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center active:bg-stone-200 hover:bg-stone-200 transition-colors"
            >
              <X className="w-4 h-4 text-stone-500" strokeWidth={2.5} />
            </button>
 
            {/* Nội dung cuộn riêng, không dính Lenis ngoài trang */}
            <div className="overflow-y-auto overscroll-contain flex-1">
 
              {/* Profile header */}
              <button
                type="button"
                onClick={() => { onLoginPress(); onClose(); }}
                className="flex w-full items-center gap-3 px-5 py-4 border-b border-stone-100 text-left active:bg-stone-50 hover:bg-stone-50 transition-colors"
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
                        <p className="text-[15px] font-bold text-stone-900 truncate">
                          {username || "Thành viên"}
                        </p>
                        <span
                          className="flex-shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                          style={{ color: roleAccent, background: `${roleAccent}18` }}
                        >
                          {roleLabel}
                        </span>
                      </div>
                      <p className="text-[13px] text-stone-400">Xem hồ sơ & thành tích →</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-stone-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[15px] font-bold text-stone-800">Bạn chưa đăng nhập</p>
                      <p className="text-[13px] text-stone-400">Đăng nhập để xem thông tin học tập</p>
                    </div>
                    <span className="flex-shrink-0 flex h-9 items-center gap-1.5 rounded-xl bg-orange-600 px-4 text-[13px] font-bold text-white">
                      <LogIn className="w-3.5 h-3.5" strokeWidth={2.5} />
                      Đăng nhập
                    </span>
                  </>
                )}
              </button>
 
              {/* Quick links */}
              <div className="grid grid-cols-3 gap-2 p-3 border-b border-stone-100 bg-stone-50/50">
                <QuickLink icon={Info} label="Giới thiệu" onClick={() => goTo("/giới-thiệu")} />
                <QuickLink icon={Phone} label="Liên hệ" onClick={() => goTo("/liên-hệ")} />
                <QuickLink icon={Users} label="Tuyển sinh" onClick={() => goTo("/tuyển-sinh")} accent />
              </div>
 
              {/* Menu riêng theo vai trò (giáo viên/admin) */}
              {extraItems.length > 0 && (
                <div className="py-1 border-b border-stone-100">
                  <p className="px-5 pt-2 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-stone-400">
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
                        className="flex w-full items-center gap-3.5 px-5 py-3.5 text-left active:bg-stone-50 hover:bg-stone-50 transition-colors"
                        style={isActive ? { color: roleAccent, background: `${roleAccent}0f` } : undefined}
                      >
                        <Icon
                          className="w-[18px] h-[18px] flex-shrink-0"
                          style={{ color: isActive ? roleAccent : "#a8a29e" }}
                          strokeWidth={1.75}
                        />
                        <span className="text-[14px] font-medium">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Menu hệ thống */}
              <div className="py-1">
                {ACCOUNT_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <button
                      key={item.path}
                      type="button"
                      onClick={() => goTo(item.path)}
                      className={`flex w-full items-center gap-3.5 px-5 py-3.5 text-left active:bg-stone-50 hover:bg-stone-50 transition-colors ${
                        isActive ? "text-orange-600 bg-orange-50/40" : "text-stone-700"
                      }`}
                    >
                      <Icon
                        className={`w-[18px] h-[18px] flex-shrink-0 ${
                          isActive ? "text-orange-500" : "text-stone-400"
                        }`}
                        strokeWidth={1.75}
                      />
                      <span className="text-[14px] font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </div>
 
              {/* Đăng xuất */}
              {isLogin && (
                <div className="px-5 pb-4 pt-2 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => { onLogout(); onClose(); }}
                    className="flex w-full items-center justify-center gap-2 py-3.5 rounded-2xl bg-red-50 text-red-600 text-[14px] font-bold active:bg-red-100 hover:bg-red-100 transition-colors"
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
      className="flex flex-col items-center gap-1.5 py-3.5 rounded-xl bg-white border border-stone-200/50 shadow-sm active:bg-stone-50 transition-colors"
    >
      <Icon className={`w-[18px] h-[18px] ${accent ? "text-orange-500" : "text-stone-500"}`} strokeWidth={1.75} />
      <span className="text-[12px] font-semibold text-stone-700 leading-none">{label}</span>
    </button>
  );
}

/* ═══ MOBILE: Bottom tab bar ═════════════════════════════════════ */
function BottomTabBar({ location, navigate, isLogin, onLoginPress, onLogout, avatar, username, role }) {
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
        onLoginPress={onLoginPress}
        onLogout={onLogout}
        avatar={avatar}
        username={username}
        role={role}
        ACCOUNT_ITEMS={ACCOUNT_ITEMS}
      />
      
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/94 backdrop-blur-xl border-t border-stone-200/60 shadow-lg"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex h-12 items-stretch justify-around">
          {MOBILE_TAB_ITEMS.map((item) => {
            const active = isItemActive(item, location.pathname);
            
            // Xử lý nút Khối Học
            if (item.type === "dropdown_khoi") {
              const Icon = item.icon;
              return (
                <button key="khoi-tab" type="button" onClick={() => setKhoiSheetOpen(true)}
                  className={`flex-1 flex flex-col items-center justify-center gap-0.5 pt-1.5 pb-1 transition-colors ${active ? "text-orange-600" : "text-stone-400"}`}
                >
                  <div className={`w-8 h-5 flex items-center justify-center rounded-full transition-all ${active ? "bg-orange-100/80 text-orange-600 w-12" : ""}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold tracking-tight">{item.label}</span>
                </button>
              );
            }

            // Xử lý nút Mở Rộng (More)
            if (item.type === "menu_more") {
              return (
                <button key="more-tab" type="button" onClick={() => setMoreSheetOpen(true)}
                  className={`flex-1 flex flex-col items-center justify-center gap-0.5 pt-1.5 pb-1 transition-colors ${active ? "text-orange-600" : "text-stone-400"}`}
                >
                  <div className={`w-8 h-5 flex items-center justify-center rounded-full transition-all ${active ? "bg-orange-100/80 w-12" : ""}`}>
                    {isLogin ? (
                      <div className="w-4 h-4 rounded-full overflow-hidden border" style={{ borderColor: active ? (ROLE_ACCENTS[role] || ROLE_ACCENTS.user) : "#d6d3d1" }}>
                        <img src={avatar || "/images/avatarDefault.avif"} className="w-full h-full object-cover" alt="" />
                      </div>
                    ) : (
                      <Menu className="w-4 h-4" />
                    )}
                  </div>
                  <span className="text-[10px] font-bold tracking-tight">{isLogin ? (username || "Tôi").split(" ").pop() : "Mở rộng"}</span>
                </button>
              );
            }

            // Xử lý các tab đường dẫn trực tiếp (Home, Lịch học, Tài liệu)
            const Icon = item.icon;
            return (
              <button key={item.path} type="button" onClick={() => navigate(item.path)}
                className={`flex-1 flex flex-col items-center justify-center gap-0.5 pt-1.5 pb-1 transition-colors ${active ? "text-orange-600" : "text-stone-400"}`}
              >
                <div className={`w-8 h-5 flex items-center justify-center rounded-full transition-all ${active ? "bg-orange-100/80 text-orange-600 w-12" : ""}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold tracking-tight">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}

/* ═══ HEADER (MAIN EXPORT - Giữ nguyên logic Desktop) ═══════════ */
export default function Header({ toggleModal, isLogin, setIsLogin, handleClose }) {
  const { showToast } = useToast();
  const navigate  = useNavigate();
  const location  = useLocation();

  const [openMenu, setOpenMenu] = useState(null);
  const [avatar,   setAvatar]   = useState(() => localStorage.getItem("avatar")   || "");
  const [username, setUsername] = useState(() => localStorage.getItem("username") || "");
  const [role,     setRole]     = useState(() => localStorage.getItem("role")     || "student");

  const khoiRef      = useRef(null);
  const communityRef = useRef(null);
  const accountRef   = useRef(null);

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

  // Không có màn hình đăng nhập nào hiện đang ghi "role" vào localStorage,
  // nên tự lấy role thật từ Supabase mỗi khi vừa đăng nhập — vừa chính xác,
  // vừa tự khắc phục nếu localStorage bị thiếu/cũ.
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

  useEffect(() => { setOpenMenu(null); }, [location.pathname]);

  useEffect(() => {
    const onResize = () => setOpenMenu(null);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const closeKhoi      = useCallback(() => setOpenMenu((prev) => prev === "khoi" ? null : prev), []);
  const closeCommunity = useCallback(() => setOpenMenu((prev) => prev === "community" ? null : prev), []);
  const closeAccount   = useCallback(() => setOpenMenu((prev) => prev === "account" ? null : prev), []);

  useOnClickOutside(khoiRef,      closeKhoi);
  useOnClickOutside(communityRef, closeCommunity);
  useOnClickOutside(accountRef,   closeAccount);

  const toggle = (key, event) => {
    event.stopPropagation(); 
    setOpenMenu((prev) => (prev === key ? null : key));
  };

  const handleLogout = () => {
    ["sessionKey", "role", "username", "user", "avatar", "studentData"].forEach((k) => localStorage.removeItem(k));
    setIsLogin(false);
    setRole("student");
    handleClose?.();
    showToast("Đã đăng xuất", "success");
  };

  const isKhoiActive = KHOI_ITEMS.some((k) => k.path === location.pathname);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-stone-200/40 bg-white/85 backdrop-blur-md antialiased" style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <button type="button" onClick={() => navigate("/")} className="flex items-center gap-3 select-none rounded-xl p-1.5 -ml-1.5 group transition-colors hover:bg-stone-50">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-orange-200/60 bg-gradient-to-br from-orange-50 to-white shadow-sm transition-all group-hover:scale-105">
              <img src="/images/logo_htdc.avif" alt="Logo Ban Giáo Lý" className="h-full w-full object-contain p-1 transition-transform duration-500 group-hover:rotate-6" />
            </div>
            <div className="flex flex-col items-start text-left">
              <span className="text-sm font-extrabold tracking-tight text-stone-800 group-hover:text-orange-600 md:text-base">BAN GIÁO LÝ</span>
              <span className="mt-0.5 text-[9px] font-bold uppercase tracking-widest text-stone-400 font-mono md:text-[10px]">HTDC · XỨ ĐOÀN MẸ MÂN CÔI</span>
            </div>
          </button>

          <nav aria-label="Điều hướng chính" className="hidden md:flex items-center gap-0.5">
            {MAIN_ITEMS.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button key={item.path} type="button" onClick={() => navigate(item.path)}
                  className={`px-3.5 py-1.5 text-[13px] font-medium rounded-lg transition-colors ${isActive ? "text-stone-900 bg-stone-100" : "text-stone-500 hover:text-stone-800 hover:bg-stone-50"}`}
                >
                  {item.label}
                </button>
              );
            })}
            <div className="w-px h-4 bg-stone-200 mx-1.5" />
            <div ref={khoiRef} className="relative">
              <button type="button" onClick={(e) => toggle("khoi", e)} className={`flex items-center gap-1 px-3.5 py-1.5 text-[13px] font-medium rounded-lg transition-colors ${isKhoiActive || openMenu === "khoi" ? "text-stone-900 bg-stone-100" : "text-stone-500 hover:text-stone-800 hover:bg-stone-50"}`}>
                Khối học <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${openMenu === "khoi" ? "rotate-180" : ""}`} />
              </button>
              <KhoiMegaMenu isOpen={openMenu === "khoi"} onClose={() => setOpenMenu(null)} navigate={navigate} currentPath={location.pathname} />
            </div>
            <div ref={communityRef} className="relative">
              <button type="button" onClick={(e) => toggle("community", e)} className={`flex items-center gap-1 px-3.5 py-1.5 text-[13px] font-medium rounded-lg transition-colors ${openMenu === "community" ? "text-stone-900 bg-stone-100" : "text-stone-500 hover:text-stone-800 hover:bg-stone-50"}`}>
                Cộng đoàn <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${openMenu === "community" ? "rotate-180" : ""}`} />
              </button>
              <CommunityDropdown isOpen={openMenu === "community"} onClose={() => setOpenMenu(null)} navigate={navigate} currentPath={location.pathname} />
            </div>
          </nav>

          <div className="flex items-center gap-2">
            <div ref={accountRef} className="relative hidden md:block">
              <AccountTriggerButton isLogin={isLogin} avatar={avatar} username={username} role={role} isOpen={openMenu === "account"} onToggle={(e) => toggle("account", e)} onLogin={toggleModal} />
              {isLogin && <AccountDropdown isOpen={openMenu === "account"} onClose={() => setOpenMenu(null)} navigate={navigate} currentPath={location.pathname} avatar={avatar} username={username} role={role} onLogout={handleLogout} onOpenModal={toggleModal} />}
            </div>
          </div>
        </div>
      </header>

      <BottomTabBar location={location} navigate={navigate} isLogin={isLogin} onLoginPress={toggleModal} onLogout={handleLogout} avatar={avatar} username={username} role={role} />
    </>
  );
}