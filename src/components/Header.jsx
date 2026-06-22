import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { LogIn, Menu, X, ChevronRight, ChevronDown, BookOpen, Sparkles, Flame } from "lucide-react";

const KHOI_ITEMS = [
  { path: "/khối-kinh-thánh", label: "Khối Kinh Thánh", icon: BookOpen },
  { path: "/khối-phụng-vụ", label: "Khối Phụng Vụ", icon: Sparkles },
  { path: "/khối-thêm-sức", label: "Khối Thêm Sức", icon: Flame },
];

const NAV_ITEMS = [
  { path: "/", label: "Trang chủ" },
  { path: "/tuyển-sinh", label: "Tuyển sinh" },
  { path: "/giới-thiệu", label: "Giới thiệu" },
];

const NAV__MOBILE_ITEMS = [
  { path: "/", label: "Trang chủ" },
  { type: "dropdown", label: "Khối học", items: KHOI_ITEMS },
  { path: "/tuyển-sinh", label: "Tuyển sinh" },
  { path: "/tài-liệu", label: "Tài liệu" },
  { path: "/lịch-sinh-hoạt", label: "Lịch sinh hoạt" },
  { path: "/giới-thiệu", label: "Giới thiệu" },
  { path: "/liên-hệ", label: "Liên hệ" },
];

function isItemActive(item, pathname) {
  if (item.type === "dropdown") {
    return item.items.some((sub) => sub.path === pathname);
  }
  return item.path === pathname;
}

// 1. Nhận thêm prop currentPath từ cha truyền xuống
function DesktopDropdown({ item, isActive, openKey, setOpenKey, navigate, currentPath }) {
  const isOpen = openKey === item.label;
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpenKey(null);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen, setOpenKey]);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpenKey(isOpen ? null : item.label)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className={`relative flex items-center gap-1 px-4 py-1 text-xs font-semibold rounded-full transition-colors duration-200 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 ${
          isActive ? "text-stone-900" : "text-stone-500 hover:text-stone-800"
        }`}
      >
        {isActive && (
          <motion.div
            layoutId="activeTabIndicator"
            className="absolute inset-0 bg-white rounded-full shadow-sm border border-stone-200/30 -z-10"
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
          />
        )}
        {item.label}
        <ChevronDown className={`h-3 w-3 stroke-[2.5] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15, ease: [0.32, 0.72, 0, 1] }}
            role="menu"
            className="absolute left-1/2 -translate-x-1/2 top-full mt-2.5 w-56 overflow-hidden rounded-2xl border border-stone-200/60 bg-white shadow-lg z-50"
          >
            {item.items.map((sub, i) => {
              const SubIcon = sub.icon;
              // 2. Sửa lỗi logic: Dùng currentPath lấy từ hook đồng bộ thay vì window.location.pathname
              const subActive = sub.path === currentPath;
              return (
                <button
                  key={sub.path}
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    navigate(sub.path);
                    setOpenKey(null);
                  }}
                  className={`flex w-full items-center gap-2.5 px-4 py-3 text-left text-sm font-medium transition-colors focus-visible:outline-none focus-visible:bg-stone-50 ${
                    i !== item.items.length - 1 ? "border-b border-stone-100" : ""
                  } ${subActive ? "text-orange-600 bg-orange-50/60" : "text-stone-700 hover:bg-stone-50"}`}
                >
                  <SubIcon className={`h-4 w-4 flex-shrink-0 ${subActive ? "text-orange-500" : "text-stone-400"}`} />
                  {sub.label}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Header({ toggleModal, isLogin }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileKhoiOpen, setMobileKhoiOpen] = useState(false);
  const [openDesktopDropdown, setOpenDesktopDropdown] = useState(null);

  useEffect(() => {
    setMobileOpen(false);
    setMobileKhoiOpen(false);
    setOpenDesktopDropdown(null);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const goTo = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  return (
    <header
      className="sticky top-0 z-50 w-full border-b border-stone-200/40 bg-white/80 backdrop-blur-md antialiased transition-all duration-300"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        {/* Logo Area */}
        <button
          type="button"
          onClick={() => navigate("/")}
          className="flex items-center gap-3 select-none rounded-xl p-1.5 -ml-1.5 group transition-colors duration-200 hover:bg-stone-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
        >
          {/* Avatar / Image Container */}
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-orange-200/60 bg-gradient-to-br from-orange-50 to-white shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:border-orange-300 group-hover:shadow-md">
            <img
              src="/images/logo_htdc.avif"
              alt="Logo Ban Giáo Lý Giáo xứ An Ngãi"
              className="h-full w-full object-contain p-1 transition-transform duration-500 group-hover:rotate-6"
            />
          </div>

          {/* Text Area */}
          <div className="flex flex-col items-start text-left">
            <span className="text-sm font-extrabold tracking-tight text-stone-800 transition-colors duration-200 group-hover:text-orange-600 md:text-base">
              BAN GIÁO LÝ
            </span>
            <span className="mt-0.5 text-[9px] font-bold uppercase tracking-widest text-stone-400 font-mono subpixel-antialiased md:text-[10px]">
              HTDC • XỨ ĐOÀN MẸ MÂN CÔI
            </span>
          </div>
        </button>

        {/* Navigation Control — Desktop */}
        <nav
          aria-label="Điều hướng chính"
          className="hidden md:flex items-center relative rounded-full bg-stone-100/80 p-0.5 border border-stone-200/20 shadow-inner"
        >
          {NAV_ITEMS.map((item) => {
            if (item.type === "dropdown") {
              return (
                <DesktopDropdown
                  key={item.label}
                  item={item}
                  isActive={isItemActive(item, location.pathname)}
                  openKey={openDesktopDropdown}
                  setOpenKey={setOpenDesktopDropdown}
                  navigate={navigate}
                  currentPath={location.pathname} // 3. Truyền thêm path hiện tại xuống component con
                />
              );
            }
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                type="button"
                onClick={() => navigate(item.path)}
                aria-current={isActive ? "page" : undefined}
                className={`relative px-4 py-1 text-xs font-semibold rounded-full transition-colors duration-200 select-none whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 ${
                  isActive ? "text-stone-900" : "text-stone-500 hover:text-stone-800"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute inset-0 bg-white rounded-full shadow-sm border border-stone-200/30 -z-10"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <AnimatePresence mode="wait">
            {!isLogin ? (
              <motion.button
                key="login-btn"
                type="button"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                whileTap={{ scale: 0.96 }}
                onClick={toggleModal}
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full bg-stone-900 px-4 text-xs font-semibold text-white shadow-sm hover:bg-stone-800 active:bg-stone-950 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2"
              >
                <span>Đăng nhập</span>
                <LogIn className="h-3.5 w-3.5 stroke-[2.5]" />
              </motion.button>
            ) : (
              <motion.button
                key="profile-btn"
                type="button"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleModal}
                className="flex items-center gap-2 rounded-full border border-stone-200/60 p-0.5 pr-3 bg-stone-50 hover:bg-stone-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
              >
                <div className="h-7 w-7 flex-shrink-0 overflow-hidden rounded-full bg-stone-100 border border-stone-200 shadow-sm">
                  <img
                    src={localStorage.avatar || "https://images.weserv.nl/?url=https://lh3.googleusercontent.com/d/1oiEnPzSGOiliggoiteJR4N2lfjdw4lLE&output=avif"}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                </div>
                <span className="hidden sm:inline text-xs font-semibold text-stone-700 max-w-[100px] truncate">
                  {localStorage.username}
                </span>
              </motion.button>
            )}
          </AnimatePresence>

          {/* Hamburger Menu Mobile Toggle */}
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Đóng menu" : "Mở menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav-panel"
            className="md:hidden flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-stone-200/60 bg-stone-50 text-stone-700 hover:bg-stone-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
          >
            <AnimatePresence mode="wait" initial={false}>
              {mobileOpen ? (
                <motion.span
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex"
                >
                  <X className="h-4 w-4 stroke-[2.5]" />
                </motion.span>
              ) : (
                <motion.span
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex"
                >
                  <Menu className="h-4 w-4 stroke-[2.5]" />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* MOBILE NAV PANEL */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileOpen(false)}
              className="md:hidden fixed inset-0 top-16 bg-black/20 backdrop-blur-[1px] z-40"
            />
            {/* Panel */}
            <motion.div
              id="mobile-nav-panel"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
              className="md:hidden absolute left-0 right-0 top-full z-50 px-4 pb-4 max-h-[calc(100vh-5rem)] overflow-y-auto"
            >
              <nav
                aria-label="Điều hướng (mobile)"
                className="overflow-hidden rounded-2xl border border-stone-200/60 bg-white shadow-lg"
              >
                {NAV__MOBILE_ITEMS.map((item, i) => {
                  const isLast = i === NAV__MOBILE_ITEMS.length - 1;

                  if (item.type === "dropdown") {
                    const isActive = isItemActive(item, location.pathname);
                    return (
                      <div key={item.label} className={!isLast ? "border-b border-stone-100" : ""}>
                        <button
                          type="button"
                          onClick={() => setMobileKhoiOpen((v) => !v)}
                          aria-expanded={mobileKhoiOpen}
                          className={`flex w-full items-center justify-between px-4 py-3.5 text-left text-sm font-medium transition-colors focus-visible:outline-none focus-visible:bg-stone-50 ${
                            isActive ? "text-orange-600 bg-orange-50/60" : "text-stone-700 hover:bg-stone-50"
                          }`}
                        >
                          <span>{item.label}</span>
                          <ChevronDown
                            className={`h-4 w-4 transition-transform duration-200 ${
                              isActive ? "text-orange-400" : "text-stone-300"
                            } ${mobileKhoiOpen ? "rotate-180" : ""}`}
                          />
                        </button>
                        <AnimatePresence>
                          {mobileKhoiOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
                              className="overflow-hidden bg-stone-50/60"
                            >
                              {item.items.map((sub) => {
                                const SubIcon = sub.icon;
                                const subActive = sub.path === location.pathname;
                                return (
                                  <button
                                    key={sub.path}
                                    type="button"
                                    onClick={() => goTo(sub.path)}
                                    className={`flex w-full items-center gap-2.5 pl-8 pr-4 py-3 text-left text-sm font-medium transition-colors focus-visible:outline-none focus-visible:bg-stone-100 ${
                                      subActive ? "text-orange-600" : "text-stone-600 hover:bg-stone-100"
                                    }`}
                                  >
                                    <SubIcon className={`h-3.5 w-3.5 flex-shrink-0 ${subActive ? "text-orange-500" : "text-stone-400"}`} />
                                    {sub.label}
                                  </button>
                                );
                              })}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  }

                  const isActive = location.pathname === item.path;
                  return (
                    <button
                      key={item.path}
                      type="button"
                      onClick={() => goTo(item.path)}
                      aria-current={isActive ? "page" : undefined}
                      className={`flex w-full items-center justify-between px-4 py-3.5 text-left text-sm font-medium transition-colors focus-visible:outline-none focus-visible:bg-stone-50 ${
                        !isLast ? "border-b border-stone-100" : ""
                      } ${isActive ? "text-orange-600 bg-orange-50/60" : "text-stone-700 hover:bg-stone-50"}`}
                    >
                      <span>{item.label}</span>
                      <ChevronRight className={`h-4 w-4 ${isActive ? "text-orange-400" : "text-stone-300"}`} />
                    </button>
                  );
                })}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}