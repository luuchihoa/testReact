import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Navigate, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, UserCog, School, ClipboardCheck, BarChart3, Megaphone, FileCheck,
  ChevronDown, CalendarDays, Check, UserPlus, MessageSquare, MoreHorizontal,
  Search, Bell, AlertTriangle, ChevronLeft, Plus
} from "lucide-react";
import { supabase } from "../../lib/supabase.js";
import { AuthGateSkeleton, AdminTabSkeleton } from "../../components/ui/Skeleton.jsx";
import { AdminProvider, useAdminContext } from "./AdminContext.jsx";
import { getCurrentNamHoc } from "./constants.js";

const SYSTEM_FONT =
  "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Segoe UI', Roboto, sans-serif";

const CONFIG = {
  ROLE_CACHE_KEY: "role",
  ROLE_CACHE_TS_KEY: "role_cached_at",
  ROLE_CACHE_TTL_MS: 5 * 60 * 1000,
  SCROLL_COLLAPSE_THRESHOLD_PX: 16,
  MAX_VISIBLE_DESKTOP_TABS: 6,
};

function useDismissableDropdown(isOpen, onClose) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const onClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) onClose();
    };
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("touchstart", onClickOutside, { passive: true });
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("touchstart", onClickOutside);
      document.removeEventListener("keydown", onKey);
    };
  }, [isOpen, onClose]);

  return containerRef;
}

class AdminErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorId: null };
  }

  static getDerivedStateFromError() {
    return { hasError: true, errorId: Math.random().toString(36).slice(2, 8).toUpperCase() };
  }

  componentDidCatch(error, info) {
    console.error("AdminLayout: lỗi khi render nội dung tab:", error, info);
    if (typeof window !== "undefined" && typeof window.__reportError === "function") {
      try {
        window.__reportError(error, info);
      } catch {
        // Safe catch
      }
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false, errorId: null });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-[#dedfd4] dark:border-[#354237] bg-[#fffefa] dark:bg-[#1e2821] px-6 py-14 text-center shadow-sm">
          <AlertTriangle className="w-8 h-8 text-[#927140] dark:text-[#d4b47d]" strokeWidth={1.75} />
          <p className="font-bold text-base text-[#293d32] dark:text-[#ecece0]">Mục này gặp sự cố khi hiển thị</p>
          <p className="text-sm text-[#575e55] dark:text-[#b0b9ac] max-w-sm">
            Thử tải lại trang. Các mục khác trong trang quản trị vẫn hoạt động bình thường.
          </p>
          {this.state.errorId && (
            <p className="text-xs text-[#575e55] dark:text-[#b0b9ac] font-mono">
              Mã lỗi: {this.state.errorId}
            </p>
          )}
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-[#314e3e] dark:bg-[#d6b883] text-white dark:text-[#19251d] text-sm font-bold min-h-[44px] px-5 py-2.5 active:scale-[0.97] transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-[#314e3e]/50"
          >
            Tải lại trang
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export function RequireAdminRoute({ children }) {
  const isCacheFresh = () => {
    const cachedAt = Number(localStorage.getItem(CONFIG.ROLE_CACHE_TS_KEY) || 0);
    return cachedAt > 0 && Date.now() - cachedAt < CONFIG.ROLE_CACHE_TTL_MS;
  };
  const cachedRole = localStorage.getItem(CONFIG.ROLE_CACHE_KEY);
  const hasFreshAdminCache = cachedRole === "admin" && isCacheFresh();

  const [status, setStatus] = useState(hasFreshAdminCache ? "ok" : "checking");

  useEffect(() => {
    let cancelled = false;

    const verify = async () => {
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
          localStorage.removeItem(CONFIG.ROLE_CACHE_KEY);
          localStorage.removeItem(CONFIG.ROLE_CACHE_TS_KEY);
          setStatus("denied");
        } else {
          localStorage.setItem(CONFIG.ROLE_CACHE_KEY, "admin");
          localStorage.setItem(CONFIG.ROLE_CACHE_TS_KEY, String(Date.now()));
          setStatus("ok");
        }
      } catch (err) {
        console.error("RequireAdminRoute check error:", err);
        if (!cancelled) {
          localStorage.removeItem(CONFIG.ROLE_CACHE_KEY);
          localStorage.removeItem(CONFIG.ROLE_CACHE_TS_KEY);
          setStatus("denied");
        }
      }
    };

    verify();

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible" && !isCacheFresh()) {
        verify();
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  if (status === "checking") return <AuthGateSkeleton />;
  if (status === "denied") return <Navigate to="/" replace />;
  return children;
}

const TABS = [
  { to: "tổng-quan",  label: "Tổng quan",      icon: LayoutDashboard },
  { to: "lớp-học",    label: "Lớp học",        icon: School },
  { to: "sổ-điểm",    label: "Sổ điểm",        icon: ClipboardCheck },
  { to: "người-dùng", label: "Người dùng",     icon: UserCog },
  { to: "đăng-ký",    label: "Đăng ký",        icon: UserPlus,        pendingKey: "pendingDangKy" },
  { to: "bài-viết",   label: "Duyệt bài",      icon: FileCheck,       pendingKey: "pendingBaiViet" },
  { to: "thông-báo",  label: "Thông báo",      icon: Megaphone },
  { to: "báo-cáo",    label: "Báo cáo",        icon: BarChart3 },
  { to: "góp-ý",      label: "Góp ý",          icon: MessageSquare,   pendingKey: "pendingGopY" },
];

function YearPicker() {
  const { namHoc, setNamHoc, namHocList, setNamHocList } = useAdminContext();
  const [open, setOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [customYear, setCustomYear] = useState("");
  const wrapRef = useDismissableDropdown(open, () => {
    setOpen(false);
    setIsAdding(false);
    setCustomYear("");
  });

  const isCurrent = (nh) => nh === getCurrentNamHoc();

  const handleAddYear = (e) => {
    e.preventDefault();
    const val = customYear.trim();
    const regex = /^\d{4}-\d{4}$/;
    if (!regex.test(val)) {
      alert("Định dạng niên khóa phải là YYYY-YYYY (ví dụ: 2027-2028)");
      return;
    }
    const [y1, y2] = val.split("-").map(Number);
    if (y2 !== y1 + 1) {
      alert("Năm kết thúc phải lớn hơn năm bắt đầu đúng 1 năm (ví dụ: 2027-2028)");
      return;
    }
    if (setNamHocList && !namHocList.includes(val)) {
      setNamHocList((prev) => Array.from(new Set([...prev, val])).sort((a, b) => b.localeCompare(a)));
    }
    setNamHoc(val);
    setIsAdding(false);
    setCustomYear("");
    setOpen(false);
  };

  return (
    <div className="relative flex-shrink-0" ref={wrapRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        title="Chọn niên khóa — mặc định là niên khóa hiện tại"
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`inline-flex items-center gap-2 min-h-[44px] sm:min-h-[38px] px-3.5 py-2 rounded-full border text-sm font-bold transition-all duration-150 active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#314e3e]/50 dark:focus-visible:ring-offset-[#151c18] ${
          open
            ? "border-transparent bg-[#314e3e] dark:bg-[#d6b883] text-white dark:text-[#19251d] shadow-sm"
            : "border-[#dedfd4] dark:border-[#354237] bg-[#fffefa]/90 dark:bg-[#1e2821]/90 text-[#293d32] dark:text-[#ecece0] shadow-sm hover:bg-[#faf8f3] dark:hover:bg-[#1e2821]"
        }`}
      >
        <CalendarDays className={`w-4 h-4 ${open ? "text-white dark:text-[#19251d]" : "text-[#575e55] dark:text-[#b0b9ac]"}`} strokeWidth={2.25} />
        <span className="whitespace-nowrap">{namHoc}</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${open ? "rotate-180 text-white dark:text-[#19251d]" : "text-[#575e55] dark:text-[#b0b9ac]"}`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute right-0 z-50 mt-2 min-w-[210px] rounded-2xl border border-[#dedfd4] dark:border-[#354237] bg-[#fffefa]/95 dark:bg-[#1e2821]/95 backdrop-blur-xl p-1.5 shadow-xl animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="max-h-[220px] overflow-y-auto overscroll-contain" data-lenis-prevent>
            {namHocList.map((nh) => {
              const active = nh === namHoc;
              return (
                <button
                  key={nh}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => { setNamHoc(nh); setOpen(false); }}
                  className={`w-full flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-left transition-colors min-h-[40px] ${
                    active ? "bg-[#314e3e]/10 dark:bg-[#d6b883]/20 text-[#314e3e] dark:text-[#d6b883]" : "text-[#575e55] dark:text-[#b0b9ac] hover:bg-[#faf8f3] dark:hover:bg-[#151c18]"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {nh}
                    {isCurrent(nh) && (
                      <span
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-[#314e3e] dark:bg-[#d6b883]"
                        title="Niên khóa hiện tại"
                      />
                    )}
                  </span>
                  {active && <Check className="w-4 h-4 text-[#314e3e] dark:text-[#d6b883] flex-shrink-0" strokeWidth={2.5} />}
                </button>
              );
            })}
          </div>

          <div className="pt-1.5 mt-1 border-t border-[#dedfd4] dark:border-[#354237]">
            {!isAdding ? (
              <button
                type="button"
                onClick={() => setIsAdding(true)}
                className="w-full flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold text-[#927140] dark:text-[#d4b47d] hover:bg-[#927140]/10 transition-colors min-h-[40px]"
              >
                <Plus className="w-3.5 h-3.5" /> Thêm niên khóa khác
              </button>
            ) : (
              <form onSubmit={handleAddYear} className="p-1 flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    autoFocus
                    value={customYear}
                    onChange={(e) => setCustomYear(e.target.value)}
                    placeholder="vd: 2027-2028"
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[#dedfd4] dark:border-[#354237] bg-[#fffefa] dark:bg-[#151c18] text-[#293d32] dark:text-[#ecece0] focus:outline-none focus:ring-1 focus:ring-[#314e3e] font-medium min-h-[36px]"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-lg bg-[#314e3e] hover:bg-[#253d30] text-white text-xs font-bold shadow-sm transition-colors flex-shrink-0 min-h-[36px]"
                  >
                    Chọn
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function CommandPalette({ open, onClose }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);
  const containerRef = useDismissableDropdown(open, onClose);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
      inputRef.current?.focus();
    }
  }, [open]);

  const filtered = useMemo(
    () => TABS.filter((t) => t.label.toLowerCase().includes(query.trim().toLowerCase())),
    [query]
  );

  useEffect(() => {
    setActiveIndex((i) => Math.min(i, Math.max(filtered.length - 1, 0)));
  }, [filtered.length]);

  const goTo = useCallback(
    (to) => {
      navigate(to);
      onClose();
    },
    [navigate, onClose]
  );

  const handleKeyDown = (e) => {
    if (filtered.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % filtered.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + filtered.length) % filtered.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const target = filtered[activeIndex];
      if (target) goTo(target.to);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center pt-24 px-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Tìm kiếm nhanh"
        className="w-full max-w-md rounded-2xl border border-[#dedfd4] dark:border-[#354237] bg-[#fffefa] dark:bg-[#1e2821] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
      >
        <div className="flex items-center gap-2.5 px-4 py-3 border-b border-[#dedfd4] dark:border-[#354237]">
          <Search className="w-4 h-4 text-[#575e55] dark:text-[#b0b9ac] flex-shrink-0" strokeWidth={2.25} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tìm mục quản trị..."
            role="combobox"
            aria-expanded="true"
            aria-controls="admin-command-palette-list"
            aria-activedescendant={filtered[activeIndex] ? `admin-cmd-${filtered[activeIndex].to}` : undefined}
            className="flex-1 bg-transparent text-sm font-semibold text-[#293d32] dark:text-[#ecece0] placeholder-[#575e55]/60 placeholder:font-medium focus:outline-none min-h-[38px]"
          />
          <kbd className="hidden sm:inline-block text-xs font-bold text-[#575e55] dark:text-[#b0b9ac] border border-[#dedfd4] dark:border-[#354237] rounded px-1.5 py-0.5">Esc</kbd>
        </div>
        <div
          id="admin-command-palette-list"
          role="listbox"
          className="max-h-72 overflow-y-auto overscroll-contain p-1.5"
          data-lenis-prevent
        >
          {filtered.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-[#575e55] dark:text-[#b0b9ac]">Không tìm thấy mục phù hợp</p>
          ) : (
            filtered.map(({ to, label, icon: Icon }, index) => (
              <button
                key={to}
                id={`admin-cmd-${to}`}
                type="button"
                role="option"
                aria-selected={index === activeIndex}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => goTo(to)}
                className={`w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-bold text-left transition-colors min-h-[44px] ${
                  index === activeIndex
                    ? "bg-[#314e3e]/10 dark:bg-[#d6b883]/20 text-[#314e3e] dark:text-[#d6b883]"
                    : "text-[#575e55] dark:text-[#b0b9ac] hover:bg-[#faf8f3] dark:hover:bg-[#151c18]"
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0 text-[#314e3e] dark:text-[#d6b883]" strokeWidth={2.1} />
                {label}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function NotificationSummary() {
  const pending = useAdminContext();

  const items = useMemo(
    () =>
      TABS.filter((t) => t.pendingKey)
        .map((t) => ({ to: t.to, label: t.label, count: pending[t.pendingKey] ?? 0 }))
        .filter((it) => it.count > 0),
    [pending]
  );
  const total = items.reduce((sum, it) => sum + it.count, 0);
  const [open, setOpen] = useState(false);
  const containerRef = useDismissableDropdown(open, () => setOpen(false));

  return (
    <div className="relative flex-shrink-0" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        title={total > 0 ? `${total} mục đang chờ xử lý` : "Không có mục chờ xử lý"}
        aria-haspopup="menu"
        aria-expanded={open}
        className={`relative inline-flex items-center justify-center min-w-[44px] min-h-[44px] sm:min-w-[38px] sm:min-h-[38px] rounded-full border transition-all duration-150 active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#314e3e]/50 dark:focus-visible:ring-offset-[#151c18] ${
          open
            ? "border-transparent bg-[#314e3e] dark:bg-[#d6b883] text-white dark:text-[#19251d]"
            : "border-[#dedfd4] dark:border-[#354237] bg-[#fffefa]/90 dark:bg-[#1e2821]/90 text-[#575e55] dark:text-[#b0b9ac] hover:bg-[#faf8f3] dark:hover:bg-[#151c18]"
        }`}
      >
        <Bell className="w-4 h-4" strokeWidth={2.1} />
        {total > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold tabular-nums">
            {total > 99 ? "99+" : total}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 min-w-[220px] rounded-2xl border border-[#dedfd4] dark:border-[#354237] bg-[#fffefa]/95 dark:bg-[#1e2821]/95 backdrop-blur-xl p-1.5 shadow-xl animate-in fade-in zoom-in-95 duration-150"
        >
          {items.length === 0 ? (
            <p className="px-3 py-4 text-center text-sm text-[#575e55] dark:text-[#b0b9ac]">Không có mục chờ xử lý</p>
          ) : (
            items.map((it) => (
              <NavLink
                key={it.to}
                to={it.to}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-[#575e55] dark:text-[#b0b9ac] hover:bg-[#faf8f3] dark:hover:bg-[#151c18] transition-colors min-h-[44px]"
              >
                {it.label}
                <TabBadge count={it.count} />
              </NavLink>
            ))
          )}
        </div>
      )}
    </div>
  );
}

const VISIBLE_DESKTOP_TABS = TABS.slice(0, CONFIG.MAX_VISIBLE_DESKTOP_TABS);
const OVERFLOW_TABS = TABS.slice(CONFIG.MAX_VISIBLE_DESKTOP_TABS);

function tabPendingCount(tab, pending) {
  return tab.pendingKey ? pending[tab.pendingKey] ?? 0 : 0;
}

const TabBadge = React.memo(function TabBadge({ count }) {
  if (!count) return null;
  return (
    <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold tabular-nums ml-1.5">
      {count}
    </span>
  );
});

const tabItemClass = ({ isActive, compact }) =>
  `snap-start flex-shrink-0 ${compact ? "sm:flex-1 sm:flex-shrink sm:justify-center" : ""} inline-flex items-center gap-1.5 sm:gap-2 min-h-[38px] sm:min-h-[44px] px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 motion-reduce:transition-none active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#314e3e]/50 ${
    isActive
      ? "bg-[#fffefa] dark:bg-[#1e2821] text-[#314e3e] dark:text-[#d6b883] shadow-sm"
      : "text-[#575e55] dark:text-[#b0b9ac] hover:text-[#293d32] dark:hover:text-[#ecece0] hover:bg-black/5 dark:hover:bg-white/5"
  }`;

const TabLink = React.memo(function TabLink({ to, label, icon: Icon, compact, badgeCount }) {
  return (
    <NavLink to={to} className={({ isActive }) => tabItemClass({ isActive, compact })}>
      <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={2.1} />
      {label}
      <TabBadge count={badgeCount} />
    </NavLink>
  );
});

function TabNav() {
  const pending = useAdminContext();
  const location = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useDismissableDropdown(moreOpen, () => setMoreOpen(false));
  const mobileScrollRef = useRef(null);

  const currentSlug = useMemo(
    () => decodeURIComponent(location.pathname.split("/").filter(Boolean).pop() || ""),
    [location.pathname]
  );
  const activeOverflowTab = useMemo(
    () => OVERFLOW_TABS.find((t) => t.to === currentSlug),
    [currentSlug]
  );
  const overflowBadgeTotal = useMemo(
    () => OVERFLOW_TABS.reduce((sum, t) => sum + tabPendingCount(t, pending), 0),
    [pending]
  );

  // Tự động cuộn êm đưa tab đang active vào vị trí trung tâm viewport mobile
  useEffect(() => {
    if (!mobileScrollRef.current) return;
    const activeEl = mobileScrollRef.current.querySelector("a.active, a[aria-current='page']");
    if (activeEl) {
      activeEl.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [currentSlug]);

  return (
    <nav
      className="relative flex items-center gap-1 bg-[#dedfd4]/40 dark:bg-[#354237]/40 rounded-2xl p-1 max-w-full w-full"
      data-lenis-prevent
    >
      {/* Mobile: tất cả các tab, cuộn ngang mượt mà có tự động cuộn đến tab active */}
      <div
        ref={mobileScrollRef}
        className="flex-1 lg:hidden min-w-0 flex gap-1.5 overflow-x-auto snap-x snap-mandatory touch-pan-x [&::-webkit-scrollbar]:hidden py-0.5 px-1 scroll-smooth"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          WebkitMaskImage: "linear-gradient(to right, transparent, black 12px, black calc(100% - 12px), transparent)",
          maskImage: "linear-gradient(to right, transparent, black 12px, black calc(100% - 12px), transparent)",
        }}
      >
        {TABS.map((tab) => (
          <TabLink key={tab.to} to={tab.to} label={tab.label} icon={tab.icon} badgeCount={tabPendingCount(tab, pending)} />
        ))}
      </div>

      {/* Desktop */}
      <div className="hidden lg:flex items-center gap-1 w-full">
        {VISIBLE_DESKTOP_TABS.map((tab) => (
          <TabLink key={tab.to} to={tab.to} label={tab.label} icon={tab.icon} compact badgeCount={tabPendingCount(tab, pending)} />
        ))}

        {OVERFLOW_TABS.length > 0 && (
          <div className="relative flex-shrink-0 sm:flex-1" ref={moreRef}>
            <button
              type="button"
              onClick={() => setMoreOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={moreOpen}
              className={`w-full ${tabItemClass({ isActive: moreOpen || !!activeOverflowTab, compact: true })}`}
            >
              {activeOverflowTab ? (
                <activeOverflowTab.icon className="w-4 h-4 flex-shrink-0" strokeWidth={2.1} />
              ) : (
                <MoreHorizontal className="w-4 h-4 flex-shrink-0" strokeWidth={2.1} />
              )}
              {activeOverflowTab ? activeOverflowTab.label : "Thêm"}
              <TabBadge count={activeOverflowTab ? tabPendingCount(activeOverflowTab, pending) : overflowBadgeTotal} />
              <ChevronDown
                className={`w-3.5 h-3.5 flex-shrink-0 transition-transform duration-200 ${moreOpen ? "rotate-180" : ""} ${
                  moreOpen || activeOverflowTab ? "" : "opacity-60"
                }`}
                strokeWidth={2.5}
              />
            </button>

            {moreOpen && (
              <div
                role="menu"
                className="absolute right-0 z-50 mt-2 min-w-[200px] rounded-2xl border border-[#dedfd4] dark:border-[#354237] bg-[#fffefa]/95 dark:bg-[#1e2821]/95 backdrop-blur-xl p-1.5 shadow-xl animate-in fade-in zoom-in-95 duration-150"
              >
                {OVERFLOW_TABS.map((tab) => {
                  const active = tab.to === currentSlug;
                  return (
                    <NavLink
                      key={tab.to}
                      to={tab.to}
                      onClick={() => setMoreOpen(false)}
                      className={`flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-colors min-h-[44px] ${
                        active
                          ? "bg-[#314e3e]/10 dark:bg-[#d6b883]/20 text-[#314e3e] dark:text-[#d6b883]"
                          : "text-[#575e55] dark:text-[#b0b9ac] hover:bg-[#faf8f3] dark:hover:bg-[#151c18]"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <tab.icon className="w-4 h-4 flex-shrink-0" strokeWidth={2.1} /> {tab.label}
                      </span>
                      <TabBadge count={tabPendingCount(tab, pending)} />
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

function HeaderTitleBlock({ scrolled, pageTitle, className = "" }) {
  return (
    <div className={`flex items-center gap-2 sm:gap-3 min-w-0 ${className}`}>
      <NavLink
        to="/"
        className="p-2 -ml-2 rounded-full flex-shrink-0 text-[#575e55] dark:text-[#b0b9ac] hover:bg-black/5 dark:hover:bg-white/5 hover:text-[#293d32] dark:hover:text-[#ecece0] transition-colors focus:outline-none focus:ring-2 focus:ring-[#314e3e]/50 min-h-[44px] min-w-[44px] flex items-center justify-center"
        aria-label="Về trang chủ"
      >
        <ChevronLeft className="w-5 h-5" />
      </NavLink>
      <div className="min-w-0">
        <p
          className={`font-bold uppercase tracking-widest overflow-hidden transition-all duration-300 motion-reduce:transition-none text-[#927140] dark:text-[#d4b47d] text-xs ${
            scrolled ? "max-h-0 opacity-0" : "max-h-5 opacity-100 mb-0.5"
          }`}
        >
          Quản trị hệ thống
        </p>
        <h1
          className={`font-bold text-[#293d32] dark:text-[#ecece0] tracking-tight truncate transition-all duration-300 font-serif ${
            scrolled ? "text-lg" : "text-xl sm:text-2xl"
          }`}
        >
          {pageTitle}
        </h1>
      </div>
    </div>
  );
}

function AdminHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const location = useLocation();

  const headerRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      document.documentElement.style.setProperty("--admin-header-h", `${el.offsetHeight}px`);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const currentSlug = decodeURIComponent(location.pathname.split("/").filter(Boolean).pop() || "");
  const currentTab = TABS.find((t) => t.to === currentSlug);
  const pageTitle = currentTab ? currentTab.label : "Tổng quan";

  return (
    <div
      ref={headerRef}
      className={`sticky top-0 z-40 bg-[#faf8f3]/95 dark:bg-[#151c18]/95 backdrop-blur-xl border-b border-[#dedfd4] dark:border-[#354237] transition-[padding,box-shadow] duration-300 motion-reduce:transition-none ${
        scrolled ? "shadow-md" : ""
      }`}
    >
      <div className={`max-w-6xl mx-auto px-3.5 sm:px-6 transition-all duration-300 motion-reduce:transition-none ${scrolled ? "py-1.5 sm:py-2.5" : "py-2 sm:py-3.5"}`}>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-3">
          {/* Mobile Top Bar: Gom toàn bộ vào 1 hàng 44px duy nhất */}
          <div className="flex sm:hidden items-center justify-between gap-2 min-w-0">
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <NavLink
                to="/"
                className="p-1.5 -ml-1 rounded-full flex-shrink-0 text-[#575e55] dark:text-[#b0b9ac] hover:bg-black/5 dark:hover:bg-white/5 hover:text-[#293d32] dark:hover:text-[#ecece0] transition-colors focus:outline-none min-h-[40px] min-w-[40px] flex items-center justify-center"
                aria-label="Về trang chủ"
              >
                <ChevronLeft className="w-5 h-5" />
              </NavLink>
              <div className="min-w-0 flex items-center gap-2">
                <h1 className="font-bold text-[#293d32] dark:text-[#ecece0] tracking-tight truncate text-base font-serif">
                  {pageTitle}
                </h1>
                <div className="flex-shrink-0">
                  <YearPicker />
                </div>
              </div>
            </div>

            {/* Mobile Actions: Icon Tìm kiếm & Chuông Thông báo */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                type="button"
                onClick={() => setPaletteOpen(true)}
                title="Tìm kiếm nhanh (Ctrl+K)"
                aria-label="Tìm kiếm nhanh"
                className="inline-flex items-center justify-center min-w-[38px] min-h-[38px] rounded-full border border-[#dedfd4] dark:border-[#354237] bg-[#fffefa]/90 dark:bg-[#1e2821]/90 text-[#575e55] dark:text-[#b0b9ac] hover:bg-[#faf8f3] dark:hover:bg-[#151c18] transition-colors active:scale-95 shadow-xs"
              >
                <Search className="w-4 h-4" strokeWidth={2.25} />
              </button>
              <NotificationSummary />
            </div>
          </div>

          {/* Desktop Top Bar */}
          <HeaderTitleBlock scrolled={scrolled} pageTitle={pageTitle} className="hidden sm:flex" />

          {/* Desktop controls */}
          <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              title="Tìm kiếm nhanh (Ctrl+K)"
              className="inline-flex items-center gap-2 min-h-[38px] pl-3.5 pr-3 rounded-full border border-[#dedfd4] dark:border-[#354237] bg-[#fffefa]/90 dark:bg-[#1e2821]/90 text-[#575e55] dark:text-[#b0b9ac] text-sm font-semibold hover:bg-[#faf8f3] dark:hover:bg-[#151c18] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#314e3e]/50"
            >
              <Search className="w-4 h-4" strokeWidth={2.25} />
              Tìm kiếm
              <kbd className="ml-1 text-xs font-bold border border-[#dedfd4] dark:border-[#354237] rounded px-1.5 py-0.5">⌘K</kbd>
            </button>
            <NotificationSummary />
            <YearPicker />
          </div>
        </div>

        <div className={`transition-all duration-300 motion-reduce:transition-none ${scrolled ? "mt-1 sm:mt-2" : "mt-1.5 sm:mt-3"}`}>
          <TabNav />
        </div>
      </div>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  );
}

function AdminLayoutInner() {
  const { loading } = useAdminContext();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#faf8f3] dark:bg-[#151c18] text-[#293d32] dark:text-[#ecece0] transition-colors" style={{ fontFamily: SYSTEM_FONT }}>
      <a
        href="#admin-main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-full focus:bg-[#314e3e] focus:text-white dark:focus:bg-[#d6b883] dark:focus:text-[#19251d] focus:px-4 focus:py-2 focus:text-sm focus:font-bold shadow-lg"
      >
        Bỏ qua tới nội dung chính
      </a>

      <AdminHeader />

      <div id="admin-main-content" tabIndex={-1} className="max-w-6xl mx-auto px-4 sm:px-6 py-6 focus:outline-none">
        {loading ? (
          <AdminTabSkeleton />
        ) : (
          <AdminErrorBoundary resetKey={location.pathname}>
            <Suspense fallback={<AdminTabSkeleton />}>
              <Outlet />
            </Suspense>
          </AdminErrorBoundary>
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