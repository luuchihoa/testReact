import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "./ui/ToastContext.jsx";
import {
  LogIn, LogOut, Menu, X, ChevronRight, ChevronDown,
  BookOpen, Sparkles, Flame, Heart, Globe, Users,
  CalendarDays, FileText, Phone, Settings, ShieldCheck,
  ScrollText, User,
} from "lucide-react";

/* ── Page map ── */const KHOI_ITEMS = [
  { path: "/khối-chiên-con",  label: "Chiên Con",  sub: "Mầm non – Lớp 2", icon: Heart,    accent: "#db2777", bg: "bg-pink-50",   ring: "ring-pink-200"   },
  { path: "/khối-rước-lễ",   label: "Rước Lễ",    sub: "Lớp 3 – 4",       icon: Sparkles, accent: "#65a30d", bg: "bg-lime-50",   ring: "ring-lime-200"   },
  { path: "/khối-thêm-sức",  label: "Thêm Sức",   sub: "Lớp 5 – 6",       icon: Flame,    accent: "#ca8a04", bg: "bg-yellow-50", ring: "ring-yellow-200" },
  { path: "/khối-phụng-vụ",  label: "Phụng Vụ",   sub: "Lớp 7 – 9",       icon: Sparkles, accent: "#ea580c", bg: "bg-orange-50", ring: "ring-orange-200" },
  { path: "/khối-kinh-thánh",label: "Kinh Thánh", sub: "Lớp 10 – 12",     icon: BookOpen, accent: "#dc2626", bg: "bg-red-50",    ring: "ring-red-200"    },
  { path: "/khối-vào-đời",   label: "Vào Đời",    sub: "Từ 18 tuổi",      icon: Globe,    accent: "#7c3a1e", bg: "bg-amber-50",  ring: "ring-amber-200"  },
];

const COMMUNITY_ITEMS = [
  { path: "/tuyển-sinh",    label: "Tuyển sinh",     icon: Users,        desc: "Đăng ký cho năm học mới" },
  { path: "/lịch-sinh-hoạt",label: "Lịch sinh hoạt", icon: CalendarDays, desc: "Các buổi học & sự kiện"  },
  { path: "/tài-liệu",     label: "Tài liệu",        icon: FileText,     desc: "Bài giảng & học liệu"   },
  { path: "/liên-hệ",      label: "Liên hệ",         icon: Phone,        desc: "Gặp gỡ & hỏi đáp"      },
];

const MAIN_ITEMS = [
  { path: "/",           label: "Trang chủ" },
  { path: "/giới-thiệu", label: "Giới thiệu" },
];

const ACCOUNT_ITEMS = [
  { path: "/cài-đặt",  label: "Cài đặt",   icon: Settings    },
  { path: "/bảo-mật",  label: "Bảo mật",   icon: ShieldCheck },
  { path: "/quy-định", label: "Quy định",  icon: ScrollText  },
];

/* ── Mobile full item list ── */
const MOBILE_ITEMS = [
  { path: "/",            label: "Trang chủ" },
  { path: "/giới-thiệu", label: "Giới thiệu" },
  { type: "divider", label: "Khối học" },
  ...KHOI_ITEMS.map((k) => ({ ...k, indent: true })),
  { type: "divider", label: "Cộng đoàn" },
  ...COMMUNITY_ITEMS.map((c) => ({ ...c, indent: true })),
  { type: "divider", label: "Tài khoản" },
  ...ACCOUNT_ITEMS.map((a) => ({ ...a, indent: true })),
];

/* ── Helpers ── */
function useIsMobile() {
  const [v, set] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia("(max-width: 767px)");
    set(mql.matches);
    const h = (e) => set(e.matches);
    mql.addEventListener("change", h);
    return () => mql.removeEventListener("change", h);
  }, []);
  return v;
}

function useOnClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (e) => {
      if (!ref.current || ref.current.contains(e.target)) return;
      handler();
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}

/* ── Mega Menu: Khối học ── */
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
          {/* Header */}
          <div className="px-5 py-3 border-b border-stone-100 bg-stone-50/60">
            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Chương trình giáo lý</p>
          </div>
          {/* Grid 2×3 */}
          <div className="grid grid-cols-2 gap-px bg-stone-100 p-px">
            {KHOI_ITEMS.map((khoi) => {
              const Icon = khoi.icon;
              const isActive = currentPath === khoi.path;
              return (
                <button
                  key={khoi.path}
                  type="button"
                  onClick={() => { navigate(khoi.path); onClose(); }}
                  className={`flex items-center gap-3 px-4 py-3.5 text-left transition-colors group bg-white hover:bg-stone-50 focus-visible:outline-none focus-visible:bg-stone-50 ${isActive ? "bg-stone-50" : ""}`}
                >
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${khoi.bg} ring-1 ${isActive ? khoi.ring : "ring-transparent"} transition-all group-hover:ring-1 group-hover:${khoi.ring}`}
                  >
                    <Icon className="w-4 h-4" style={{ color: khoi.accent }} />
                  </div>
                  <div className="min-w-0">
                    <p className={`text-sm font-semibold leading-snug ${isActive ? "text-stone-900" : "text-stone-700"}`}>
                      {khoi.label}
                    </p>
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

/* ── Dropdown: Cộng đoàn ── */
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
            const Icon = item.icon;
            const isActive = currentPath === item.path;
            return (
              <button
                key={item.path}
                type="button"
                onClick={() => { navigate(item.path); onClose(); }}
                className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors focus-visible:outline-none focus-visible:bg-stone-50
                  ${i !== COMMUNITY_ITEMS.length - 1 ? "border-b border-stone-100" : ""}
                  ${isActive ? "bg-orange-50/60 text-orange-600" : "text-stone-700 hover:bg-stone-50"}`}
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

/* ── Account Dropdown ── */
function AccountDropdown({ isOpen, onClose, navigate, currentPath, avatar, username, isLogin, onLogout, onLoginClick }) {
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
          {/* User info or guest */}
          <div className="px-4 py-3 border-b border-stone-100 bg-stone-50/60">
            {isLogin ? (
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full overflow-hidden border border-stone-200 flex-shrink-0">
                  <img src={avatar || "/images/avatarDefault"} alt="Avatar" className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-stone-900 truncate">{username || "Thành viên"}</p>
                  <p className="text-[10px] text-stone-400">Đã đăng nhập</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-stone-400" />
                <p className="text-xs text-stone-500">Chưa đăng nhập</p>
              </div>
            )}
          </div>

          {isLogin && (
            <>
              {/* ← THÊM NÚT NÀY */}
              <button
                type="button"
                onClick={() => { onLoginClick(); onClose(); }}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm font-medium text-stone-700 hover:bg-stone-50 border-b border-stone-100 transition-colors focus-visible:outline-none"
              >
                <User className="w-4 h-4 flex-shrink-0 text-stone-400" />
                Hồ sơ của tôi
              </button>

              {ACCOUNT_ITEMS.map((item, i) => {
                // ... giữ nguyên
              })}
            </>
          )}

          {/* Account pages — chỉ hiện khi đã đăng nhập */}
          {isLogin && (
            <>
              {ACCOUNT_ITEMS.map((item, i) => {
                const Icon = item.icon;
                const isActive = currentPath === item.path;
                return (
                  <button
                    key={item.path}
                    type="button"
                    onClick={() => { navigate(item.path); onClose(); }}
                    className={`flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm transition-colors focus-visible:outline-none focus-visible:bg-stone-50
                      ${i !== ACCOUNT_ITEMS.length - 1 ? "border-b border-stone-100" : ""}
                      ${isActive ? "text-orange-600 bg-orange-50/60" : "text-stone-700 hover:bg-stone-50"}`}
                  >
                    <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-orange-500" : "text-stone-400"}`} />
                    {item.label}
                  </button>
                );
              })}
              <div className="border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => { onLogout(); onClose(); }}
                  className="flex w-full items-center gap-2.5 px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50 transition-colors focus-visible:outline-none"
                >
                  <LogOut className="w-4 h-4" />
                  Đăng xuất
                </button>
              </div>
            </>
          )}

          {!isLogin && (
            <button
              type="button"
              onClick={() => { onLoginClick(); onClose(); }}
              className="flex w-full items-center gap-2.5 px-4 py-3 text-left text-sm font-semibold text-stone-900 hover:bg-stone-50 transition-colors focus-visible:outline-none"
            >
              <LogIn className="w-4 h-4 text-stone-500" />
              Đăng nhập
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ═══ HEADER ═══ */
export default function Header({ toggleModal, isLogin, setIsLogin, handleClose }) {
  const { showToast } = useToast();
  const handleLogout = () => {
    localStorage.removeItem("sessionKey");  // ← thêm
    localStorage.removeItem("role");        // ← thêm
    localStorage.removeItem("username");
    localStorage.removeItem("user");
    localStorage.removeItem("avatar");
    localStorage.removeItem("studentData"); // ← thêm luôn cho sạch
    setIsLogin(false);
    handleClose();                          // ← đóng modal
    showToast("Đã đăng xuất", "success");
  };

  const navigate  = useNavigate();
  const location  = useLocation();
  const isMobile  = useIsMobile();

  const [mobileOpen, setMobileOpen]           = useState(false);
  const [mobileKhoiOpen, setMobileKhoiOpen]   = useState(false);
  const [openMenu, setOpenMenu]               = useState(null); // "khoi" | "community" | "account" | null
  const [avatar, setAvatar]                   = useState(() => localStorage.getItem("avatar") || "");
  const [username, setUsername]               = useState(() => localStorage.getItem("username") || "");

  const khoiRef      = useRef(null);
  const communityRef = useRef(null);
  const accountRef   = useRef(null);

  /* Sync avatar/username từ localStorage */
  useEffect(() => {
    const sync = () => {
      setAvatar(localStorage.getItem("avatar") || "");
      setUsername(localStorage.getItem("username") || "");
    };
    window.addEventListener("avatar-updated", sync);
    window.addEventListener("storage", sync);
    return () => { window.removeEventListener("avatar-updated", sync); window.removeEventListener("storage", sync); };
  }, []);

  /* Đóng tất cả khi đổi route */
  useEffect(() => {
    setMobileOpen(false);
    setMobileKhoiOpen(false);
    setOpenMenu(null);
  }, [location.pathname]);

  /* Khoá scroll khi mobile menu mở */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  /* Click outside để đóng dropdown */
  useOnClickOutside(khoiRef,      () => openMenu === "khoi"      && setOpenMenu(null));
  useOnClickOutside(communityRef, () => openMenu === "community" && setOpenMenu(null));
  useOnClickOutside(accountRef,   () => openMenu === "account"   && setOpenMenu(null));

  const toggle = (key) => setOpenMenu((prev) => (prev === key ? null : key));
  const goTo   = (path) => { navigate(path); setMobileOpen(false); };

  const isKhoiActive      = KHOI_ITEMS.some((k) => k.path === location.pathname);
  const isCommunityActive = COMMUNITY_ITEMS.some((c) => c.path === location.pathname);

  return (
    <header
      className="sticky top-0 z-50 w-full border-b border-stone-200/40 bg-white/85 backdrop-blur-md antialiased"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">

        {/* ── Logo ── */}
        <button
          type="button"
          onClick={() => navigate("/")}
          className="flex items-center gap-3 select-none rounded-xl p-1.5 -ml-1.5 group transition-colors hover:bg-stone-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
        >
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-orange-200/60 bg-gradient-to-br from-orange-50 to-white shadow-sm transition-all group-hover:scale-105 group-hover:border-orange-300 group-hover:shadow-md">
            <img
              src="/images/logo_htdc.avif"
              alt="Logo Ban Giáo Lý"
              className="h-full w-full object-contain p-1 transition-transform duration-500 group-hover:rotate-6"
            />
          </div>
          <div className="flex flex-col items-start text-left">
            <span className="text-sm font-extrabold tracking-tight text-stone-800 transition-colors group-hover:text-orange-600 md:text-base">
              BAN GIÁO LÝ
            </span>
            <span className="mt-0.5 text-[9px] font-bold uppercase tracking-widest text-stone-400 font-mono md:text-[10px]">
              HTDC · XỨ ĐOÀN MẸ MÂN CÔI
            </span>
          </div>
        </button>

        {/* ── Desktop Nav ── */}
        <nav
          aria-label="Điều hướng chính"
          className="hidden md:flex items-center gap-0.5"
        >
          {/* Trang chủ & Giới thiệu */}
          {MAIN_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                type="button"
                onClick={() => navigate(item.path)}
                aria-current={isActive ? "page" : undefined}
                className={`relative px-3.5 py-1.5 text-[13px] font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400
                  ${isActive ? "text-stone-900 bg-stone-100" : "text-stone-500 hover:text-stone-800 hover:bg-stone-50"}`}
              >
                {item.label}
              </button>
            );
          })}

          {/* Separator */}
          <div className="w-px h-4 bg-stone-200 mx-1.5" />

          {/* Khối học — mega menu */}
          <div ref={khoiRef} className="relative">
            <button
              type="button"
              onClick={() => toggle("khoi")}
              aria-expanded={openMenu === "khoi"}
              className={`flex items-center gap-1 px-3.5 py-1.5 text-[13px] font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400
                ${isKhoiActive || openMenu === "khoi" ? "text-stone-900 bg-stone-100" : "text-stone-500 hover:text-stone-800 hover:bg-stone-50"}`}
            >
              Khối học
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${openMenu === "khoi" ? "rotate-180" : ""}`} />
            </button>
            <KhoiMegaMenu
              isOpen={openMenu === "khoi"}
              onClose={() => setOpenMenu(null)}
              navigate={navigate}
              currentPath={location.pathname}
            />
          </div>

          {/* Cộng đoàn — dropdown */}
          <div ref={communityRef} className="relative">
            <button
              type="button"
              onClick={() => toggle("community")}
              aria-expanded={openMenu === "community"}
              className={`flex items-center gap-1 px-3.5 py-1.5 text-[13px] font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400
                ${isCommunityActive || openMenu === "community" ? "text-stone-900 bg-stone-100" : "text-stone-500 hover:text-stone-800 hover:bg-stone-50"}`}
            >
              Cộng đoàn
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${openMenu === "community" ? "rotate-180" : ""}`} />
            </button>
            <CommunityDropdown
              isOpen={openMenu === "community"}
              onClose={() => setOpenMenu(null)}
              navigate={navigate}
              currentPath={location.pathname}
            />
          </div>
        </nav>

        {/* ── Right: Account + Hamburger ── */}
        <div className="flex items-center gap-2">

          {/* Account dropdown (desktop) */}
          <div ref={accountRef} className="relative hidden md:block">
            <button
              type="button"
              onClick={() => toggle("account")}
              aria-expanded={openMenu === "account"}
              className={`flex items-center gap-2 rounded-full border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400
                ${openMenu === "account"
                  ? "border-stone-300 bg-stone-100 shadow-inner"
                  : "border-stone-200/60 bg-stone-50 hover:bg-stone-100"
                }
                ${isLogin ? "pl-0.5 pr-3 py-0.5" : "px-3 py-1.5"}`}
            >
              {isLogin ? (
                <>
                  <div className="h-7 w-7 flex-shrink-0 overflow-hidden rounded-full border border-stone-200">
                    <img src={avatar || "/images/avatarDefault"} alt="Avatar" className="h-full w-full object-cover" />
                  </div>
                  <span className="text-xs font-semibold text-stone-700 max-w-[90px] truncate">{username || "Tài khoản"}</span>
                  <ChevronDown className={`w-3 h-3 text-stone-400 transition-transform ${openMenu === "account" ? "rotate-180" : ""}`} />
                </>
              ) : (
                <span className="flex items-center gap-1.5 text-[13px] font-medium text-stone-700">
                  <LogIn className="w-3.5 h-3.5" />
                  Đăng nhập
                </span>
              )}
            </button>

            <AccountDropdown
              isOpen={openMenu === "account"}
              onClose={() => setOpenMenu(null)}
              navigate={navigate}
              currentPath={location.pathname}
              avatar={avatar}
              username={username}
              isLogin={isLogin}
              onLogout={handleLogout}
              onLoginClick={toggleModal}
            />
          </div>

          {/* Login button (mobile, when not logged in) */}
          {!isLogin && (
            <button
              type="button"
              onClick={toggleModal}
              className="md:hidden inline-flex h-9 items-center gap-1.5 rounded-full bg-stone-900 px-4 text-xs font-semibold text-white hover:bg-stone-800 active:bg-stone-950 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
            >
              <LogIn className="h-3.5 w-3.5" />
              Đăng nhập
            </button>
          )}

          {/* Avatar (mobile, logged in) */}
          {isLogin && (
            <button
              type="button"
              onClick={toggleModal}
              className="md:hidden flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
            >
              <img src={avatar || "/images/avatarDefault"} alt="Avatar" className="h-full w-full object-cover" />
            </button>
          )}

          {/* Hamburger */}
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Đóng menu" : "Mở menu"}
            aria-expanded={mobileOpen}
            className="md:hidden flex h-9 w-9 items-center justify-center rounded-full border border-stone-200/60 bg-stone-50 text-stone-700 hover:bg-stone-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
          >
            <AnimatePresence mode="wait" initial={false}>
              {mobileOpen ? (
                <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }} className="flex">
                  <X className="h-4 w-4 stroke-[2.5]" />
                </motion.span>
              ) : (
                <motion.span key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }} className="flex">
                  <Menu className="h-4 w-4 stroke-[2.5]" />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* ══ MOBILE PANEL ══ */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileOpen(false)}
              className="md:hidden fixed inset-0 top-16 bg-black/20 backdrop-blur-[1px] z-40"
            />
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
              className="md:hidden absolute left-0 right-0 top-full z-50 px-4 pb-4 max-h-[calc(100vh-5rem)] overflow-y-auto"
            >
              <nav className="overflow-hidden rounded-2xl border border-stone-200/60 bg-white shadow-lg divide-y divide-stone-100">

                {/* Main pages */}
                {MAIN_ITEMS.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <button key={item.path} type="button" onClick={() => goTo(item.path)}
                      className={`flex w-full items-center justify-between px-4 py-3.5 text-sm font-medium transition-colors
                        ${isActive ? "text-orange-600 bg-orange-50/60" : "text-stone-700 hover:bg-stone-50"}`}
                    >
                      {item.label}
                      <ChevronRight className={`w-4 h-4 ${isActive ? "text-orange-400" : "text-stone-300"}`} />
                    </button>
                  );
                })}

                {/* Khối học accordion */}
                <div>
                  <button
                    type="button"
                    onClick={() => setMobileKhoiOpen((v) => !v)}
                    className={`flex w-full items-center justify-between px-4 py-3.5 text-sm font-medium transition-colors
                      ${isKhoiActive ? "text-orange-600 bg-orange-50/60" : "text-stone-700 hover:bg-stone-50"}`}
                  >
                    <span>Khối học</span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${mobileKhoiOpen ? "rotate-180" : ""} ${isKhoiActive ? "text-orange-400" : "text-stone-300"}`} />
                  </button>
                  <AnimatePresence>
                    {mobileKhoiOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
                        className="overflow-hidden bg-stone-50/50"
                      >
                        {KHOI_ITEMS.map((khoi) => {
                          const Icon = khoi.icon;
                          const isActive = location.pathname === khoi.path;
                          return (
                            <button key={khoi.path} type="button" onClick={() => goTo(khoi.path)}
                              className={`flex w-full items-center gap-3 pl-8 pr-4 py-3 text-sm font-medium transition-colors border-t border-stone-100
                                ${isActive ? "text-orange-600" : "text-stone-600 hover:bg-stone-100"}`}
                            >
                              <div className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 ${khoi.bg}`}>
                                <Icon className="w-3.5 h-3.5" style={{ color: khoi.accent }} />
                              </div>
                              <div className="text-left">
                                <p className="leading-snug">{khoi.label}</p>
                                <p className="text-[10px] text-stone-400 font-normal">{khoi.sub}</p>
                              </div>
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Community pages */}
                {COMMUNITY_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <button key={item.path} type="button" onClick={() => goTo(item.path)}
                      className={`flex w-full items-center justify-between px-4 py-3.5 text-sm font-medium transition-colors
                        ${isActive ? "text-orange-600 bg-orange-50/60" : "text-stone-700 hover:bg-stone-50"}`}
                    >
                      <span className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? "text-orange-500" : "text-stone-400"}`} />
                        {item.label}
                      </span>
                      <ChevronRight className={`w-4 h-4 ${isActive ? "text-orange-400" : "text-stone-300"}`} />
                    </button>
                  );
                })}

                {/* Account pages + logout */}
                {isLogin && (
                  <>
                    {ACCOUNT_ITEMS.map((item) => {
                      const Icon = item.icon;
                      const isActive = location.pathname === item.path;
                      return (
                        <button key={item.path} type="button" onClick={() => goTo(item.path)}
                          className={`flex w-full items-center justify-between px-4 py-3.5 text-sm font-medium transition-colors
                            ${isActive ? "text-orange-600 bg-orange-50/60" : "text-stone-700 hover:bg-stone-50"}`}
                        >
                          <span className="flex items-center gap-2.5">
                            <Icon className={`w-4 h-4 ${isActive ? "text-orange-500" : "text-stone-400"}`} />
                            {item.label}
                          </span>
                          <ChevronRight className={`w-4 h-4 ${isActive ? "text-orange-400" : "text-stone-300"}`} />
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() => { handleLogout(); setMobileOpen(false); }}
                      className="flex w-full items-center gap-2.5 px-4 py-3.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Đăng xuất
                    </button>
                  </>
                )}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}