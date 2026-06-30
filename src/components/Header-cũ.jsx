import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "./ui/ToastContext.jsx";
import {
  LogIn, LogOut, ChevronDown,
  BookOpen, Sparkles, Flame, Heart, Globe, Users,
  CalendarDays, FileText, Phone, Settings, ShieldCheck,
  ScrollText, User, Home, GraduationCap, Info
} from "lucide-react";

/* ═══ ROUTE MAP ═══════════════════════════════════════════════════ */
const KHOI_ITEMS = [
  { path: "/khối-chiên-con",   label: "Chiên Con",  sub: "Mầm non – Lớp 2", icon: Heart,    accent: "#db2777", bg: "bg-pink-50",   ring: "ring-pink-200"   },
  { path: "/khối-rước-lễ",    label: "Rước Lễ",    sub: "Lớp 3 – 4",       icon: Sparkles, accent: "#65a30d", bg: "bg-lime-50",   ring: "ring-lime-200"   },
  { path: "/khối-thêm-sức",   label: "Thêm Sức",   sub: "Lớp 5 – 6",       icon: Flame,    accent: "#ca8a04", bg: "bg-yellow-50", ring: "ring-yellow-200" },
  { path: "/khối-phụng-vụ",   label: "Phụng Vụ",   sub: "Lớp 7",       icon: Sparkles, accent: "#ea580c", bg: "bg-orange-50", ring: "ring-orange-200" },
  { path: "/khối-kinh-thánh", label: "Kinh Thánh", sub: "Lớp 8 – 9",     icon: BookOpen, accent: "#dc2626", bg: "bg-red-50",    ring: "ring-red-200"    },
  { path: "/khối-vào-đời",    label: "Vào Đời",    sub: "Lớp 10 – 11",      icon: Globe,    accent: "#7c3a1e", bg: "bg-amber-50",  ring: "ring-amber-200"  },
];

const COMMUNITY_ITEMS = [
  { path: "/tuyển-sinh",     label: "Tuyển sinh",     icon: Users,        desc: "Đăng ký cho năm học mới" },
  { path: "/lịch-sinh-hoạt", label: "Lịch sinh hoạt", icon: CalendarDays, desc: "Các buổi học & sự kiện"  },
  { path: "/tài-liệu",      label: "Tài liệu",        icon: FileText,     desc: "Bài giảng & học liệu"    },
  { path: "/liên-hệ",       label: "Liên hệ",         icon: Phone,        desc: "Gặp gỡ & hỏi đáp"       },
];

const MAIN_ITEMS = [
  { path: "/",            label: "Trang chủ" },
  { path: "/giới-thiệu", label: "Giới thiệu" },
];

const ACCOUNT_ITEMS = [
  { path: "/cài-đặt",  label: "Cài đặt",  icon: Settings    },
  { path: "/bảo-mật",  label: "Bảo mật",  icon: ShieldCheck },
  { path: "/quy-định", label: "Quy định", icon: ScrollText  },
];

const TAB_ITEMS = [
  { path: "/",               label: "Trang chủ",    icon: Home         },
  { type: "dropdown",        label: "Khối học",     icon: GraduationCap, items: KHOI_ITEMS },
  { path: "/tài-liệu",       label: "Tài liệu",     icon: FileText     },
  { path: "/giới-thiệu",     label: "Giới thiệu",   icon: Info     },
  { path: "/liên-hệ",        label: "Liên hệ",      icon: Phone        },
];

function isItemActive(item, pathname) {
  if (item.type === "dropdown") return item.items.some((s) => s.path === pathname);
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

/* ═══ DESKTOP: Account trigger button ════════════════════════════ */
function AccountTriggerButton({ isLogin, avatar, username, isOpen, onToggle, onLogin }) {
  if (!isLogin) return (
    <button type="button" onClick={onLogin}
      className="inline-flex h-9 items-center gap-1.5 rounded-full bg-stone-900 px-4 text-[12px] font-semibold text-white shadow-sm hover:bg-stone-800 active:bg-stone-950 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400">
      <LogIn className="w-3.5 h-3.5" />Đăng nhập
    </button>
  );
  return (
    <button type="button" onClick={onToggle} aria-expanded={isOpen}
      className={`flex items-center gap-2 rounded-full border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 pl-0.5 pr-3 py-0.5 ${
        isOpen ? "border-stone-300 bg-stone-100 shadow-inner" : "border-stone-200/60 bg-stone-50 hover:bg-stone-100"
      }`}>
      <div className="h-7 w-7 flex-shrink-0 overflow-hidden rounded-full border border-stone-200">
        <img src={avatar || "/images/avatarDefault"} alt="Avatar" className="h-full w-full object-cover" />
      </div>
      <span className="text-xs font-semibold text-stone-700 max-w-[90px] truncate">{username || "Tài khoản"}</span>
      <ChevronDown className={`w-3 h-3 text-stone-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
    </button>
  );
}

/* ═══ MEGA MENU: Khối học ════════════════════════════════════════ */
function KhoiMegaMenu({ isOpen, onClose, navigate, currentPath }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          transition={{ duration: 0.16, ease: [0.32, 0.72, 0, 1] }}
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
                <button key={khoi.path} type="button"
                  onClick={() => { navigate(khoi.path); onClose(); }}
                  className={`flex items-center gap-3 px-4 py-3.5 text-left bg-white hover:bg-stone-50 transition-colors focus-visible:outline-none focus-visible:bg-stone-50 group ${isActive ? "bg-stone-50" : ""}`}
                >
                  <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${khoi.bg} ring-1 ${isActive ? khoi.ring : "ring-transparent"} group-hover:ring-1 group-hover:${khoi.ring} transition-all`}>
                    <Icon className="w-4 h-4" style={{ color: khoi.accent }} />
                  </div>
                  <div className="min-w-0">
                    <p className={`text-sm font-semibold leading-snug ${isActive ? "text-stone-900" : "text-stone-700"}`}>{khoi.label}</p>
                    <p className="text-[11px] text-stone-400 truncate">{khoi.sub}</p>
                  </div>
                  {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: khoi.accent }} />}
                </button>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ═══ DROPDOWN: Cộng đoàn ════════════════════════════════════════ */
function CommunityDropdown({ isOpen, onClose, navigate, currentPath }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -6, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.97 }}
          transition={{ duration: 0.15, ease: [0.32, 0.72, 0, 1] }}
          className="absolute left-1/2 -translate-x-1/2 top-full mt-3 w-60 rounded-2xl border border-stone-200/60 bg-white shadow-lg z-50 overflow-hidden"
        >
          {COMMUNITY_ITEMS.map((item, i) => {
            const Icon     = item.icon;
            const isActive = currentPath === item.path;
            return (
              <button key={item.path} type="button"
                onClick={() => { navigate(item.path); onClose(); }}
                className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors focus-visible:outline-none focus-visible:bg-stone-50 ${i !== COMMUNITY_ITEMS.length - 1 ? "border-b border-stone-100" : ""} ${isActive ? "bg-orange-50/60 text-orange-600" : "text-stone-700 hover:bg-stone-50"}`}
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

/* ═══ DROPDOWN: Account (chỉ render khi đã đăng nhập) ═══════════ */
function AccountDropdown({ isOpen, onClose, navigate, currentPath, avatar, username, onLogout, onOpenModal }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -6, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.97 }}
          transition={{ duration: 0.15, ease: [0.32, 0.72, 0, 1] }}
          className="absolute right-0 top-full mt-3 w-56 rounded-2xl border border-stone-200/60 bg-white shadow-lg z-50 overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-stone-100 bg-stone-50/60">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-stone-200 flex-shrink-0">
                <img src={avatar || "/images/avatarDefault"} alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-stone-900 truncate">{username || "Thành viên"}</p>
                <p className="text-[10px] text-stone-400">Đã đăng nhập</p>
              </div>
            </div>
          </div>

          <button type="button"
            onClick={() => { onOpenModal(); onClose(); }}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm font-medium text-stone-700 hover:bg-stone-50 border-b border-stone-100 transition-colors focus-visible:outline-none">
            <User className="w-4 h-4 flex-shrink-0 text-stone-400" />
            Hồ sơ của tôi
          </button>

          <div className="py-1">
            {ACCOUNT_ITEMS.map((item) => {
              const Icon     = item.icon;
              const isActive = currentPath === item.path;
              return (
                <button key={item.path} type="button"
                  onClick={() => { navigate(item.path); onClose(); }}
                  className={`flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm transition-colors focus-visible:outline-none focus-visible:bg-stone-50 ${isActive ? "text-orange-600 bg-orange-50/60" : "text-stone-700 hover:bg-stone-50"}`}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-orange-500" : "text-stone-400"}`} />
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="border-t border-stone-100">
            <button type="button"
              onClick={() => { onLogout(); onClose(); }}
              className="flex w-full items-center gap-2.5 px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50 transition-colors focus-visible:outline-none">
              <LogOut className="w-4 h-4" />Đăng xuất
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
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-[2px]"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            className="fixed bottom-0 left-0 right-0 z-[70] bg-white rounded-t-3xl overflow-hidden shadow-2xl"
            style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
          >
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full bg-stone-200" />
            </div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-stone-400 mb-2 px-5">Chọn khối học</p>
            <div className="grid grid-cols-2 gap-px bg-stone-100">
              {KHOI_ITEMS.map((k) => {
                const Icon = k.icon;
                return (
                  <button key={k.path} type="button"
                    onClick={() => { navigate(k.path); onClose(); }}
                    className="flex items-center gap-3 px-4 py-4 bg-white hover:bg-stone-50 active:bg-stone-100 transition-colors text-left"
                  >
                    <div className={`w-9 h-9 rounded-xl ${k.bg} flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-4 h-4" style={{ color: k.accent }} />
                    </div>
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

/* ═══ MOBILE: Account bottom sheet ═══════════════════════════════ */
function AccountSheet({ open, onClose, navigate, location, avatar, username, onOpenModal, onLogout }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-[2px]"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            className="fixed bottom-0 left-0 right-0 z-[70] bg-white rounded-t-3xl overflow-hidden shadow-2xl"
            style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-stone-200" />
            </div>

            <div className="flex items-center gap-3 px-5 py-4 border-b border-stone-100">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-orange-200 flex-shrink-0">
                <img src={avatar || "/images/avatarDefault"} className="w-full h-full object-cover" alt="" />
              </div>
              <div className="min-w-0">
                <p className="text-base font-bold text-stone-900 truncate">{username || "Thành viên"}</p>
                <p className="text-xs text-stone-400">Đã đăng nhập</p>
              </div>
            </div>

            <button type="button"
              onClick={() => { onOpenModal(); onClose(); }}
              className="flex w-full items-center gap-3 px-5 py-4 text-left border-b border-stone-100 hover:bg-stone-50 active:bg-stone-100 transition-colors"
            >
              <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-orange-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-stone-800">Hồ sơ của tôi</p>
                <p className="text-xs text-stone-400">Xem và chỉnh sửa thông tin</p>
              </div>
            </button>

            <div className="py-1">
              {ACCOUNT_ITEMS.map((item) => {
                const Icon     = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <button key={item.path} type="button"
                    onClick={() => { navigate(item.path); onClose(); }}
                    className={`flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors active:bg-stone-100 ${isActive ? "text-orange-600" : "text-stone-700 hover:bg-stone-50"}`}
                  >
                    <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-orange-500" : "text-stone-400"}`} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="px-5 pb-2 pt-1 border-t border-stone-100">
              <button type="button"
                onClick={() => { onLogout(); onClose(); }}
                className="flex w-full items-center justify-center gap-2 py-3.5 rounded-2xl bg-red-50 text-red-600 text-sm font-semibold active:bg-red-100 transition-colors"
              >
                <LogOut className="w-4 h-4" />Đăng xuất
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ═══ MOBILE: Bottom tab bar ═════════════════════════════════════ */
function BottomTabBar({ location, navigate, isLogin, onLoginPress, onLogout, avatar, username }) {
  const [khoiSheetOpen,    setKhoiSheetOpen]    = useState(false);
  const [accountSheetOpen, setAccountSheetOpen] = useState(false);

  return (
    <>
      <KhoiSheet open={khoiSheetOpen} onClose={() => setKhoiSheetOpen(false)} navigate={navigate} />
      <AccountSheet
        open={accountSheetOpen}
        onClose={() => setAccountSheetOpen(false)}
        navigate={navigate}
        location={location}
        avatar={avatar}
        username={username}
        onOpenModal={onLoginPress}
        onLogout={onLogout}
      />
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-stone-200/60"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex items-stretch">
          {TAB_ITEMS.map((item) => {
            const Icon   = item.icon;
            const active = isItemActive(item, location.pathname);

            if (item.type === "dropdown") {
              return (
                <button key="khoi-tab" type="button" onClick={() => setKhoiSheetOpen(true)}
                  className={`flex-1 flex flex-col items-center justify-center gap-1 pt-2.5 pb-2 transition-colors ${active ? "text-orange-600" : "text-stone-400"}`}
                >
                  <div className={`w-6 h-6 flex items-center justify-center rounded-lg ${active ? "bg-orange-100" : ""}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-semibold">{item.label}</span>
                </button>
              );
            }

            return (
              <button key={item.path} type="button" onClick={() => navigate(item.path)}
                className={`flex-1 flex flex-col items-center justify-center gap-1 pt-2.5 pb-2 transition-colors ${active ? "text-orange-600" : "text-stone-400"}`}
              >
                <div className={`relative w-6 h-6 flex items-center justify-center rounded-lg ${active ? "bg-orange-100" : ""}`}>
                  {active && (
                    <motion.div
                      layoutId="tab-active-bg"
                      className="absolute inset-0 bg-orange-100 rounded-lg"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <Icon className="w-5 h-5 relative z-10" />
                </div>
                <span className="text-[10px] font-semibold">{item.label}</span>
              </button>
            );
          })}

          {/* User tab */}
          <button type="button"
            onClick={isLogin ? () => setAccountSheetOpen(true) : onLoginPress}
            className="flex-1 flex flex-col items-center justify-center gap-1 pt-2.5 pb-2 text-stone-400 transition-colors"
          >
            <div className="w-6 h-6 flex items-center justify-center">
              {isLogin ? (
                <div className="w-6 h-6 rounded-full overflow-hidden border-2 border-orange-400/60">
                  <img src={avatar || "/images/avatarDefault"} className="w-full h-full object-cover" alt="" />
                </div>
              ) : (
                <LogIn className="w-5 h-5" />
              )}
            </div>
            <span className="text-[10px] font-semibold">
              {isLogin ? (username || "Tôi").split(" ").pop() : "Đăng nhập"}
            </span>
          </button>
        </div>
      </nav>
    </>
  );
}

/* ═══ HEADER (main export) ═══════════════════════════════════════ */
export default function Header({ toggleModal, isLogin, setIsLogin, handleClose }) {
  const { showToast } = useToast();
  const navigate  = useNavigate();
  const location  = useLocation();

  const [openMenu, setOpenMenu] = useState(null);
  const [avatar,   setAvatar]   = useState(() => localStorage.getItem("avatar")   || "");
  const [username, setUsername] = useState(() => localStorage.getItem("username") || "");

  const khoiRef      = useRef(null);
  const communityRef = useRef(null);
  const accountRef   = useRef(null);

  /* Sync avatar/username khi localStorage thay đổi */
  useEffect(() => {
    const sync = () => {
      setAvatar(localStorage.getItem("avatar")   || "");
      setUsername(localStorage.getItem("username") || "");
    };
    window.addEventListener("avatar-updated", sync);
    window.addEventListener("storage",        sync);
    return () => {
      window.removeEventListener("avatar-updated", sync);
      window.removeEventListener("storage",        sync);
    };
  }, []);

  /* Đóng tất cả khi đổi route */
  useEffect(() => { setOpenMenu(null); }, [location.pathname]);

  /* Reset khi resize từ mobile về desktop */
  useEffect(() => {
    const onResize = () => setOpenMenu(null);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  /* Click outside đóng dropdown — stable callbacks */
  const closeKhoi      = useCallback(() => setOpenMenu((prev) => prev === "khoi"      ? null : prev), []);
  const closeCommunity = useCallback(() => setOpenMenu((prev) => prev === "community" ? null : prev), []);
  const closeAccount   = useCallback(() => setOpenMenu((prev) => prev === "account"   ? null : prev), []);

  useOnClickOutside(khoiRef,      closeKhoi);
  useOnClickOutside(communityRef, closeCommunity);
  useOnClickOutside(accountRef,   closeAccount);

  const toggle = (key) => setOpenMenu((prev) => (prev === key ? null : key));

  const handleLogout = () => {
    ["sessionKey", "role", "username", "user", "avatar", "studentData"].forEach((k) => localStorage.removeItem(k));
    setIsLogin(false);
    handleClose?.();
    showToast("Đã đăng xuất", "success");
  };

  const isKhoiActive = KHOI_ITEMS.some((k) => k.path === location.pathname);

  return (
    <>
      {/* ── TOP HEADER ─────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-50 w-full border-b border-stone-200/40 bg-white/85 backdrop-blur-md antialiased"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">

          {/* Logo */}
          <button type="button" onClick={() => navigate("/")}
            className="flex items-center gap-3 select-none rounded-xl p-1.5 -ml-1.5 group transition-colors hover:bg-stone-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
          >
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-orange-200/60 bg-gradient-to-br from-orange-50 to-white shadow-sm transition-all group-hover:scale-105 group-hover:border-orange-300">
              <img src="/images/logo_htdc.avif" alt="Logo Ban Giáo Lý" className="h-full w-full object-contain p-1 transition-transform duration-500 group-hover:rotate-6" />
            </div>
            <div className="flex flex-col items-start text-left">
              <span className="text-sm font-extrabold tracking-tight text-stone-800 transition-colors group-hover:text-orange-600 md:text-base">BAN GIÁO LÝ</span>
              <span className="mt-0.5 text-[9px] font-bold uppercase tracking-widest text-stone-400 font-mono md:text-[10px]">HTDC · XỨ ĐOÀN MẸ MÂN CÔI</span>
            </div>
          </button>

          {/* Desktop Nav */}
          <nav aria-label="Điều hướng chính" className="hidden md:flex items-center gap-0.5">
            {MAIN_ITEMS.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button key={item.path} type="button" onClick={() => navigate(item.path)}
                  aria-current={isActive ? "page" : undefined}
                  className={`px-3.5 py-1.5 text-[13px] font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 ${isActive ? "text-stone-900 bg-stone-100" : "text-stone-500 hover:text-stone-800 hover:bg-stone-50"}`}
                >
                  {item.label}
                </button>
              );
            })}

            <div className="w-px h-4 bg-stone-200 mx-1.5" />

            {/* Khối học */}
            <div ref={khoiRef} className="relative">
              <button type="button" onClick={() => toggle("khoi")} aria-expanded={openMenu === "khoi"}
                className={`flex items-center gap-1 px-3.5 py-1.5 text-[13px] font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 ${isKhoiActive || openMenu === "khoi" ? "text-stone-900 bg-stone-100" : "text-stone-500 hover:text-stone-800 hover:bg-stone-50"}`}
              >
                Khối học
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${openMenu === "khoi" ? "rotate-180" : ""}`} />
              </button>
              <KhoiMegaMenu isOpen={openMenu === "khoi"} onClose={() => setOpenMenu(null)} navigate={navigate} currentPath={location.pathname} />
            </div>

            {/* Cộng đoàn */}
            <div ref={communityRef} className="relative">
              <button type="button" onClick={() => toggle("community")} aria-expanded={openMenu === "community"}
                className={`flex items-center gap-1 px-3.5 py-1.5 text-[13px] font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 ${openMenu === "community" ? "text-stone-900 bg-stone-100" : "text-stone-500 hover:text-stone-800 hover:bg-stone-50"}`}
              >
                Cộng đoàn
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${openMenu === "community" ? "rotate-180" : ""}`} />
              </button>
              <CommunityDropdown isOpen={openMenu === "community"} onClose={() => setOpenMenu(null)} navigate={navigate} currentPath={location.pathname} />
            </div>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <div ref={accountRef} className="relative hidden md:block">
              <AccountTriggerButton
                isLogin={isLogin}
                avatar={avatar}
                username={username}
                isOpen={openMenu === "account"}
                onToggle={() => toggle("account")}
                onLogin={toggleModal}
              />
              {isLogin && (
                <AccountDropdown
                  isOpen={openMenu === "account"}
                  onClose={() => setOpenMenu(null)}
                  navigate={navigate}
                  currentPath={location.pathname}
                  avatar={avatar}
                  username={username}
                  onLogout={handleLogout}
                  onOpenModal={toggleModal}
                />
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── MOBILE BOTTOM TAB BAR ─────────────────────────────── */}
      <BottomTabBar
        location={location}
        navigate={navigate}
        isLogin={isLogin}
        onLoginPress={toggleModal}
        onLogout={handleLogout}
        avatar={avatar}
        username={username}
      />
    </>
  );
}