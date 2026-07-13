import React, { Suspense, useEffect, useRef, useState } from "react";
import { Navigate, NavLink, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard, UserCog, School, ClipboardCheck, BarChart3, Megaphone, FileCheck,
  ChevronDown, CalendarDays, Check, UserPlus, MessageSquare, MoreHorizontal,
} from "lucide-react";
import { supabase } from "../../lib/supabase.js";
import { AuthGateSkeleton, AdminTabSkeleton } from "../ui/Skeleton.jsx";
import { AdminProvider, useAdminContext } from "./AdminContext.jsx";
import { getCurrentNamHoc } from "./constants.js";

const SYSTEM_FONT =
  "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Segoe UI', Roboto, sans-serif";

export function RequireAdminRoute({ children }) {
  const [status, setStatus] = useState("checking"); 

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const cachedRole = localStorage.getItem("role");
      if (cachedRole && cachedRole !== "admin") {
        if (!cancelled) setStatus("denied");
        return;
      }

      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) { if (!cancelled) setStatus("denied"); return; }

        const { data, error } = await supabase
          .from("users")
          .select("role")
          .eq("auth_id", authUser.id)
          .maybeSingle();

        if (cancelled) return;

        if (error || !data || data.role !== "admin") {
          setStatus("denied");
        } else {
          localStorage.setItem("role", "admin");
          setStatus("ok");
        }
      } catch (err) {
        console.error("RequireAdminRoute check error:", err);
        if (!cancelled) setStatus("denied");
      }
    })();

    return () => { cancelled = true; };
  }, []);

  if (status === "checking") return <AuthGateSkeleton />;
  if (status === "denied") return <Navigate to="/" replace />;
  return children;
}

const TABS = [
  { to: "tổng-quan",  label: "Tổng quan",  icon: LayoutDashboard },
  { to: "đăng-ký",    label: "Đăng ký",    icon: UserPlus },
  { to: "góp-ý",      label: "Góp ý",      icon: MessageSquare },
  { to: "thông-báo",  label: "Thông báo",  icon: Megaphone },
  { to: "người-dùng", label: "Người dùng", icon: UserCog },
  { to: "lớp-học",    label: "Lớp học",    icon: School },
  { to: "sổ-điểm",    label: "Điểm & Chuyên cần", icon: ClipboardCheck },
  { to: "báo-cáo",    label: "Báo cáo",    icon: BarChart3 },
  { to: "bài-viết",   label: "Duyệt bài",  icon: FileCheck },
];

function YearPicker() {
  const { namHoc, setNamHoc, namHocList } = useAdminContext();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const isCurrent = (nh) => nh === getCurrentNamHoc();

  return (
    <div className="relative flex-shrink-0" ref={wrapRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        title="Chọn năm học — mặc định là năm học hiện tại"
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`inline-flex items-center gap-2 h-11 sm:h-9 pl-3.5 pr-3 rounded-full border text-[13px] font-bold transition-all duration-150 active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-amber-500/50 dark:focus-visible:ring-offset-[#1C1917] ${
          open
            ? "border-transparent bg-amber-900 dark:bg-amber-100 text-amber-50 dark:text-amber-950 shadow-[0_2px_8px_rgba(146,64,14,0.2)]"
            : "border-amber-900/10 dark:border-amber-100/10 bg-white/80 dark:bg-stone-800/40 text-stone-700 dark:text-stone-300 shadow-sm backdrop-blur-sm hover:bg-amber-50 dark:hover:bg-stone-800/80"
        }`}
      >
        <CalendarDays className={`w-3.5 h-3.5 ${open ? "text-amber-50 dark:text-amber-950" : "text-stone-400 dark:text-stone-500"}`} strokeWidth={2.25} />
        <span className="whitespace-nowrap">{namHoc}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? "rotate-180 text-amber-50 dark:text-amber-950" : "text-stone-400 dark:text-stone-500"}`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute right-0 z-50 mt-2 min-w-[180px] rounded-2xl border border-amber-900/10 dark:border-amber-100/10 bg-[#FDFBF7]/95 dark:bg-[#1C1917]/95 backdrop-blur-xl p-1.5 shadow-xl animate-in fade-in zoom-in-95 duration-150"
        >
          {namHocList.map((nh) => {
            const active = nh === namHoc;
            return (
              <button
                key={nh}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => { setNamHoc(nh); setOpen(false); }}
                className={`w-full flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-bold text-left transition-colors ${
                  active ? "bg-amber-100/50 dark:bg-amber-500/20 text-amber-950 dark:text-amber-50" : "text-stone-600 dark:text-stone-400 hover:bg-amber-50 dark:hover:bg-amber-900/10"
                }`}
              >
                <span className="flex items-center gap-2">
                  {nh}
                  {isCurrent(nh) && (
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-amber-600 dark:bg-amber-400"
                      title="Năm học hiện tại"
                    />
                  )}
                </span>
                {active && <Check className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0" strokeWidth={2.5} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Số tab hiển thị thẳng trên thanh (desktop) trước khi gom phần còn lại vào
// nút "Thêm". Khi danh sách TABS mở rộng thêm trong tương lai, tab mới chỉ
// đơn giản rơi vào menu "Thêm" — không cần sửa gì ở đây.
const MAX_VISIBLE_DESKTOP_TABS = 6;

function tabPendingCount(to, { pendingDangKy, pendingGopY, pendingBaiViet }) {
  if (to === "đăng-ký") return pendingDangKy;
  if (to === "góp-ý") return pendingGopY;
  if (to === "bài-viết") return pendingBaiViet;
  return 0;
}

function TabBadge({ count }) {
  if (!count) return null;
  return (
    <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold tabular-nums">
      {count}
    </span>
  );
}

const tabItemClass = ({ isActive, compact }) =>
  `snap-start flex-shrink-0 inline-flex items-center gap-1.5 h-11 sm:h-auto px-4 sm:px-3.5 sm:py-1.5 rounded-xl text-[13px] ${compact ? "sm:text-[12.5px]" : ""} font-bold whitespace-nowrap transition-all duration-200 motion-reduce:transition-none active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 ${
    isActive
      ? "bg-white dark:bg-stone-800 text-amber-700 dark:text-amber-400 shadow-sm"
      : "text-stone-500 dark:text-stone-400 hover:text-amber-800 dark:hover:text-amber-300"
  }`;

function TabNav() {
  const pending = useAdminContext();
  const location = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef(null);

  useEffect(() => {
    if (!moreOpen) return;
    const onClickOutside = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target)) setMoreOpen(false);
    };
    const onKey = (e) => { if (e.key === "Escape") setMoreOpen(false); };
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKey);
    };
  }, [moreOpen]);

  const visibleTabs = TABS.slice(0, MAX_VISIBLE_DESKTOP_TABS);
  const overflowTabs = TABS.slice(MAX_VISIBLE_DESKTOP_TABS);

  // Slug hiện tại (đoạn cuối URL) để biết tab nào trong menu "Thêm" đang active,
  // vì NavLink tự lo việc này cho các tab hiển thị trực tiếp, còn nút "Thêm"
  // (không phải NavLink) thì phải tự so sánh route.
  const currentSlug = decodeURIComponent(location.pathname.split("/").filter(Boolean).pop() || "");
  const activeOverflowTab = overflowTabs.find((t) => t.to === currentSlug);
  const overflowBadgeTotal = overflowTabs.reduce((sum, t) => sum + tabPendingCount(t.to, pending), 0);

  return (
    <nav
      className="flex items-center gap-1 bg-amber-900/5 dark:bg-amber-100/5 rounded-2xl p-1 overflow-x-auto sm:overflow-visible max-w-full snap-x snap-mandatory sm:snap-none w-full sm:w-fit [&::-webkit-scrollbar]:hidden touch-pan-x"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      data-lenis-prevent
    >
      {/* Mobile: tất cả các tab, cuộn ngang — không gian rộng theo chiều dọc
          nên gom vào "Thêm" không cần thiết, cuộn ngón tay vẫn thoải mái hơn. */}
      <div className="flex sm:hidden gap-1">
        {TABS.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={({ isActive }) => tabItemClass({ isActive })}>
            <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={2.1} /> {label}
            <TabBadge count={tabPendingCount(to, pending)} />
          </NavLink>
        ))}
      </div>

      {/* Desktop: chỉ hiện tối đa MAX_VISIBLE_DESKTOP_TABS tab, phần còn lại
          gom vào menu thả xuống "Thêm" — tránh thanh tab bị bể hàng hoặc quá
          chật khi có nhiều mục, và vẫn ổn định khi thêm tab mới sau này. */}
      <div className="hidden sm:flex items-center gap-1">
        {visibleTabs.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={({ isActive }) => tabItemClass({ isActive, compact: true })}>
            <Icon className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={2.1} /> {label}
            <TabBadge count={tabPendingCount(to, pending)} />
          </NavLink>
        ))}

        {overflowTabs.length > 0 && (
          <div className="relative flex-shrink-0" ref={moreRef}>
            <button
              type="button"
              onClick={() => setMoreOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={moreOpen}
              className={tabItemClass({ isActive: moreOpen || !!activeOverflowTab, compact: true })}
            >
              {activeOverflowTab ? (
                <activeOverflowTab.icon className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={2.1} />
              ) : (
                <MoreHorizontal className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={2.1} />
              )}
              {activeOverflowTab ? activeOverflowTab.label : "Thêm"}
              {activeOverflowTab?.label === "Duyệt bài" && <TabBadge count={overflowBadgeTotal} />}
              <ChevronDown
                className={`w-3 h-3 flex-shrink-0 transition-transform duration-200 ${moreOpen ? "rotate-180" : ""} ${
                  moreOpen || activeOverflowTab ? "" : "opacity-60"
                }`}
                strokeWidth={2.5}
              />
            </button>

            {moreOpen && (
              <div
                role="menu"
                className="absolute right-0 z-50 mt-2 min-w-[200px] rounded-2xl border border-amber-900/10 dark:border-amber-100/10 bg-[#FDFBF7]/95 dark:bg-[#1C1917]/95 backdrop-blur-xl p-1.5 shadow-xl animate-in fade-in zoom-in-95 duration-150"
              >
                {overflowTabs.map(({ to, label, icon: Icon }) => {
                  const active = to === currentSlug;
                  return (
                    <NavLink
                      key={to}
                      to={to}
                      onClick={() => setMoreOpen(false)}
                      className={`flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-bold transition-colors ${
                        active
                          ? "bg-amber-100/50 dark:bg-amber-500/20 text-amber-950 dark:text-amber-50"
                          : "text-stone-600 dark:text-stone-400 hover:bg-amber-50 dark:hover:bg-amber-900/10"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Icon className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={2.1} /> {label}
                      </span>
                      <TabBadge count={tabPendingCount(to, pending)} />
                    </NavLink>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

function AdminHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className="sticky top-16 z-30 bg-[#FDFBF7]/90 dark:bg-[#1C1917]/90 backdrop-blur-xl border-b border-amber-900/10 dark:border-amber-100/10 transition-colors"
      style={{ fontFamily: SYSTEM_FONT }}
    >
      <div className={`max-w-6xl mx-auto px-4 sm:px-6 transition-all duration-300 motion-reduce:transition-none ${scrolled ? "py-2.5" : "py-4"}`}>
        <div className="flex items-start sm:items-end justify-between gap-3">
          <div className="min-w-0">
            <p
              className={`font-bold uppercase tracking-widest overflow-hidden transition-all duration-300 motion-reduce:transition-none text-amber-800/70 dark:text-amber-400/70 text-[11px] ${
                scrolled ? "max-h-0 opacity-0" : "max-h-5 opacity-100 mb-0.5"
              }`}
            >
              Quản trị hệ thống
            </p>
            <h1
              className={`font-bold text-amber-950 dark:text-amber-50 tracking-tight truncate transition-all duration-300 font-serif ${
                scrolled ? "text-lg" : "text-2xl sm:text-[28px]"
              }`}
            >
              Bảng điều khiển
            </h1>
          </div>

          <div className="flex items-center gap-2.5 flex-shrink-0 pt-0.5 sm:pt-0">
            <YearPicker />
          </div>
        </div>

        <div className={`transition-all duration-300 motion-reduce:transition-none ${scrolled ? "mt-2" : "mt-3.5"}`}>
          <TabNav />
        </div>
      </div>
    </div>
  );
}

function AdminLayoutInner() {
  const { loading } = useAdminContext();
  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#1C1917] transition-colors" style={{ fontFamily: SYSTEM_FONT }}>
      <AdminHeader />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {loading ? (
          <AdminTabSkeleton />
        ) : (
          <Suspense fallback={<AdminTabSkeleton />}>
            <Outlet />
          </Suspense>
        )}
      </div>
    </div>
  );
}

export default function AdminLayout() {
  return (
    <AdminProvider>
      <AdminLayoutInner />
    </AdminProvider>
  );
}