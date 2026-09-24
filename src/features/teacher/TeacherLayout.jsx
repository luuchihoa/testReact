/* eslint-disable no-unused-vars */
import React, {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Navigate, NavLink, Outlet, useNavigate } from "react-router-dom";
import { motion as Motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  ClipboardList,
  CalendarCheck,
  Table,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  RefreshCw,
  ChevronDown,
  CalendarDays,
  Check,
  X,
} from "lucide-react";
import { supabase } from "../../lib/supabase.js";
import { AuthGateSkeleton, TableSkeleton } from "../../components/ui/Skeleton.jsx";
import { TeacherProvider, useTeacherContext } from "./TeacherContext.jsx";
import { getCurrentNamHoc } from "./utils.js";

const STORAGE_KEY_ROLE = "role";
const ROLE_TEACHER = "teacher";

/** Auth check lifecycle states for RequireTeacherRoute. */
const AUTH_STATUS = {
  CHECKING: "checking",
  OK: "ok",
  DENIED: "denied",
  ERROR: "error",
};

const TABS = [
  { to: "tổng-quan", label: "Tổng quan", shortLabel: "Tổng quan", icon: LayoutDashboard },
  { to: "học-sinh", label: "Danh sách", shortLabel: "Danh sách", icon: ClipboardList },
  { to: "điểm-danh", label: "Điểm danh", shortLabel: "Điểm danh", icon: CalendarCheck },
  { to: "nhập-điểm", label: "Nhập điểm", shortLabel: "Nhập điểm", icon: Table },
];

function useScrollCollapse(threshold = 80) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        setCollapsed(window.scrollY > threshold);
        ticking = false;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [threshold]);

  return collapsed;
}

const HEADER_STICKY_OFFSET_PX = 0;

function useHeaderHeightVar(ref) {
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;

    const publish = () => {
      const total = HEADER_STICKY_OFFSET_PX + el.offsetHeight;
      document.documentElement.style.setProperty("--header-h", `${total}px`);
    };

    publish();
    const observer = new ResizeObserver(publish);
    observer.observe(el);
    window.addEventListener("resize", publish);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", publish);
    };
  }, [ref]);
}

function useRequireRole(requiredRole) {
  const cachedRole =
    typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY_ROLE) : null;

  const [status, setStatus] = useState(
    cachedRole === requiredRole ? AUTH_STATUS.OK : AUTH_STATUS.CHECKING
  );
  const [retryToken, setRetryToken] = useState(0);
  const retry = useCallback(() => {
    setStatus(AUTH_STATUS.CHECKING);
    setRetryToken((n) => n + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const authUser = session?.user;

        if (!authUser) {
          if (!cancelled) setStatus(AUTH_STATUS.DENIED);
          return;
        }

        const { data, error } = await supabase
          .from("users")
          .select("role")
          .eq("auth_id", authUser.id)
          .maybeSingle();

        if (cancelled) return;

        if (error || !data || data.role !== requiredRole) {
          localStorage.removeItem(STORAGE_KEY_ROLE);
          setStatus(AUTH_STATUS.DENIED);
        } else {
          localStorage.setItem(STORAGE_KEY_ROLE, requiredRole);
          setStatus(AUTH_STATUS.OK);
        }
      } catch (err) {
        console.error("useRequireRole check failed:", err);
        if (cancelled) return;
        setStatus(cachedRole === requiredRole ? AUTH_STATUS.OK : AUTH_STATUS.ERROR);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [requiredRole, retryToken, cachedRole]);

  return { status, retry };
}

function AuthCheckError({ onRetry }) {
  return (
    <div className="min-h-[60vh] w-full flex flex-col items-center justify-center gap-3 px-4 text-center">
      <p className="text-[#575e55] dark:text-[#b0b9ac] text-sm max-w-xs">
        Không thể xác thực quyền truy cập. Vui lòng kiểm tra kết nối mạng và thử lại.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#314e3e] dark:text-[#d6b883] hover:underline"
      >
        <RefreshCw className="w-4 h-4" /> Thử lại
      </button>
    </div>
  );
}

export function RequireTeacherRoute({ children }) {
  const { status, retry } = useRequireRole(ROLE_TEACHER);

  if (status === AUTH_STATUS.CHECKING) return <AuthGateSkeleton />;
  if (status === AUTH_STATUS.ERROR) return <AuthCheckError onRetry={retry} />;
  if (status === AUTH_STATUS.DENIED) return <Navigate to="/" replace />;
  return children;
}

class RouteErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("TeacherLayout route error:", error, info);
  }

  handleReset = () => {
    this.setState({ error: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-[40vh] w-full flex flex-col items-center justify-center gap-3 px-4 text-center">
          <p className="text-[#575e55] dark:text-[#b0b9ac] text-sm max-w-xs">
            Đã có lỗi xảy ra khi tải nội dung này.
          </p>
          <button
            type="button"
            onClick={this.handleReset}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#314e3e] dark:text-[#d6b883] hover:underline"
          >
            <RefreshCw className="w-4 h-4" /> Thử lại
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function useDismissableDropdown(isOpen, onClose) {
  const ref = useRef(null);
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        onClose();
      }
    };
    const keyHandler = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    document.addEventListener("keydown", keyHandler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
      document.removeEventListener("keydown", keyHandler);
    };
  }, [isOpen, onClose]);
  return ref;
}

function YearSelector({ namHoc, availableYears, changeYear, collapsed }) {
  const [openYear, setOpenYear] = useState(false);
  const wrapRef = useDismissableDropdown(openYear, () => setOpenYear(false));
  const isCurrent = (nh) => nh === getCurrentNamHoc();

  return (
    <div className="relative flex-shrink-0" ref={wrapRef}>
      <button
        type="button"
        onClick={() => setOpenYear((v) => !v)}
        title="Chọn niên khóa làm việc"
        aria-haspopup="listbox"
        aria-expanded={openYear}
        className={`inline-flex items-center gap-1.5 sm:gap-2 rounded-xl border font-bold transition-all duration-150 active:scale-[0.97] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#314e3e]/40 ${
          collapsed 
            ? "min-h-[32px] px-2.5 sm:px-3 text-xs" 
            : "min-h-[32px] sm:min-h-[36px] px-2.5 sm:px-3.5 text-xs sm:text-sm"
        } ${
          openYear
            ? "border-transparent bg-[#314e3e] dark:bg-[#d6b883] text-white dark:text-[#19251d] shadow-sm"
            : "border-[#dedfd4] dark:border-[#354237] bg-[#fffefa] dark:bg-[#1e2821] text-[#293d32] dark:text-[#ecece0] shadow-2xs hover:bg-[#faf8f3] dark:hover:bg-[#151c18]"
        }`}
      >
        <CalendarDays className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${openYear ? "text-white dark:text-[#19251d]" : "text-[#927140] dark:text-[#d4b47d]"}`} strokeWidth={2} />
        <span className="font-mono whitespace-nowrap leading-none">{namHoc}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${openYear ? "rotate-180 text-white dark:text-[#19251d]" : "text-[#575e55] dark:text-[#b0b9ac]"}`}
        />
      </button>

      <AnimatePresence>
        {openYear && (
          <Motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.16 }}
            role="listbox"
            className="absolute right-0 z-[100] mt-1.5 min-w-[200px] sm:min-w-[220px] rounded-2xl border border-[#dedfd4] dark:border-[#354237] bg-[#fffefa] dark:bg-[#1e2821] backdrop-blur-xl p-1.5 shadow-xl overflow-hidden flex flex-col"
          >
            <div className="px-3 py-2 border-b border-[#dedfd4]/60 dark:border-[#354237]/60 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#575e55] dark:text-[#b0b9ac]">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5 text-[#927140] dark:text-[#d4b47d]" />
                <span>Chọn Niên Khóa</span>
              </span>
            </div>

            <div className="pt-1 space-y-0.5 max-h-[240px] overflow-y-auto">
              {availableYears?.map((nh) => {
                const active = nh === namHoc;
                const isCurr = isCurrent(nh);
                return (
                  <button
                    key={nh}
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => { changeYear(nh); setOpenYear(false); }}
                    className={`w-full flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-xs sm:text-sm font-bold text-left transition-colors cursor-pointer ${
                      active 
                        ? "bg-[#314e3e]/10 dark:bg-[#d4b47d]/20 text-[#314e3e] dark:text-[#d4b47d]" 
                        : "text-[#293d32] dark:text-[#ecece0] hover:bg-[#faf8f3] dark:hover:bg-[#151c18]"
                    }`}
                  >
                    <span className="flex items-center gap-2 font-mono">
                      <span>{nh}</span>
                      {isCurr && (
                        <span className="px-1.5 py-0.2 rounded text-xs font-extrabold uppercase tracking-wide bg-emerald-600 text-white font-sans">
                          Hiện tại
                        </span>
                      )}
                    </span>
                    {active && <Check className="w-4 h-4 text-[#314e3e] dark:text-[#d4b47d] flex-shrink-0" strokeWidth={2.5} />}
                  </button>
                );
              })}
            </div>
          </Motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ClassSelector({ lop, classesInYear, changeClass, collapsed }) {
  const [openClass, setOpenClass] = useState(false);
  const wrapRef = useDismissableDropdown(openClass, () => setOpenClass(false));

  if (!classesInYear || classesInYear.length <= 1) {
    return (
      <h1
        className={`font-bold text-[#293d32] dark:text-[#ecece0] font-serif transition-all duration-300 ease-out truncate ${
          collapsed ? "text-base sm:text-lg leading-tight" : "text-lg sm:text-2xl leading-tight"
        }`}
      >
        Lớp {lop}
      </h1>
    );
  }

  return (
    <div className="relative inline-block" ref={wrapRef}>
      <button
        type="button"
        onClick={() => setOpenClass((v) => !v)}
        className="inline-flex items-center gap-1.5 font-bold text-[#293d32] dark:text-[#ecece0] font-serif hover:text-[#314e3e] dark:hover:text-[#d6b883] transition-colors cursor-pointer group"
        aria-haspopup="listbox"
        aria-expanded={openClass}
        title="Đổi lớp chủ nhiệm"
      >
        <span className={collapsed ? "text-base sm:text-lg leading-tight" : "text-lg sm:text-2xl leading-tight"}>
          Lớp {lop}
        </span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-[#314e3e]/10 dark:bg-[#d4b47d]/20 text-[#314e3e] dark:text-[#d4b47d] font-sans font-bold flex items-center gap-1">
          <span>Đổi lớp</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${openClass ? "rotate-180" : ""}`} />
        </span>
      </button>

      <AnimatePresence>
        {openClass && (
          <Motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.16 }}
            role="listbox"
            className="absolute left-0 z-[100] mt-1.5 min-w-[180px] rounded-2xl border border-[#dedfd4] dark:border-[#354237] bg-[#fffefa] dark:bg-[#1e2821] backdrop-blur-xl p-1.5 shadow-xl flex flex-col"
          >
            <div className="px-3 py-1.5 border-b border-[#dedfd4]/60 dark:border-[#354237]/60 text-xs font-bold uppercase tracking-wider text-[#575e55] dark:text-[#b0b9ac]">
              Lớp bạn phụ trách
            </div>
            <div className="pt-1 space-y-0.5">
              {classesInYear.map((cName) => {
                const active = cName === lop;
                return (
                  <button
                    key={cName}
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => { changeClass(cName); setOpenClass(false); }}
                    className={`w-full flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-xs sm:text-sm font-bold text-left transition-colors cursor-pointer ${
                      active
                        ? "bg-[#314e3e]/10 dark:bg-[#d4b47d]/20 text-[#314e3e] dark:text-[#d4b47d]"
                        : "text-[#293d32] dark:text-[#ecece0] hover:bg-[#faf8f3] dark:hover:bg-[#151c18]"
                    }`}
                  >
                    <span>Lớp {cName}</span>
                    {active && <Check className="w-4 h-4 text-[#314e3e] dark:text-[#d4b47d]" strokeWidth={2.5} />}
                  </button>
                );
              })}
            </div>
          </Motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FallbackNoticeBanner({ currentNamHoc, activeNamHoc, onDismiss, onSwitchToCurrent }) {
  return (
    <div className="bg-amber-50/90 dark:bg-amber-950/40 border-b border-amber-200/80 dark:border-amber-900/40 px-4 py-2.5 sm:px-6 transition-colors">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-amber-900 dark:text-amber-200 font-medium">
          <span className="p-1 rounded-lg bg-amber-200/70 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 shrink-0">
            <CalendarDays className="w-4 h-4" />
          </span>
          <span>
            Niên khóa hiện tại (<strong>{currentNamHoc}</strong>) bạn chưa được xếp lớp. Đang hiển thị dữ liệu năm gần nhất (<strong>{activeNamHoc}</strong>).
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-auto">
          <button
            type="button"
            onClick={onSwitchToCurrent}
            className="min-h-[36px] px-3 py-1 rounded-xl text-xs font-bold text-amber-900 dark:text-amber-100 bg-amber-200/60 dark:bg-amber-900/50 hover:bg-amber-200 dark:hover:bg-amber-900 transition-colors cursor-pointer"
          >
            Xem năm {currentNamHoc}
          </button>
          <button
            type="button"
            onClick={onDismiss}
            className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-xl text-amber-700 dark:text-amber-300 hover:bg-amber-200/50 dark:hover:bg-amber-900/50 transition-colors cursor-pointer"
            aria-label="Đóng thông báo"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

const TeacherHeader = React.memo(
  React.forwardRef(function TeacherHeader(
    { lop, classesInYear, changeClass, namHoc, availableYears, changeYear, collapsed, pendingRequestsCount },
    ref
  ) {
    const hasClass = Boolean(lop);

    return (
      <header
        ref={ref}
        className={`sticky top-0 z-[60] border-b transition-all duration-300 ease-out px-4 sm:px-6 md:px-8 ${
          collapsed 
            ? "py-2 sm:py-2.5 bg-[#fffefa]/95 dark:bg-[#1e2821]/95 backdrop-blur-2xl shadow-xs border-[#dedfd4] dark:border-[#354237]" 
            : "py-2.5 sm:py-4 bg-[#faf8f3]/90 dark:bg-[#151c18]/90 backdrop-blur-xl border-[#dedfd4]/60 dark:border-[#354237]/60"
        }`}
      >
        <div
          className={`max-w-6xl mx-auto flex flex-col transition-[gap] duration-300 ease-out ${
            collapsed ? "gap-1.5" : "gap-2 sm:gap-3.5"
          }`}
        >
          {/* Main Top Bar (1 Hàng thống nhất trên cả Mobile và Desktop) */}
          <div className="flex items-center justify-between gap-2 sm:gap-3">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <NavLink
                to="/"
                className="p-1.5 sm:p-2 -ml-1.5 sm:-ml-2 rounded-xl flex-shrink-0 text-[#575e55] dark:text-[#b0b9ac] hover:bg-stone-500/10 hover:text-[#293d32] dark:hover:text-[#ecece0] transition-colors focus:outline-none focus:ring-2 focus:ring-[#314e3e]/30"
                aria-label="Về trang chủ"
              >
                <ChevronLeft className="w-5 h-5" />
              </NavLink>
              
              <div className="min-w-0">
                <p
                  className={`text-xs font-bold uppercase tracking-wider text-[#314e3e] dark:text-[#d4b47d] overflow-hidden transition-all duration-300 ease-out ${
                    collapsed ? "max-h-0 opacity-0 hidden sm:block" : "max-h-4 opacity-100"
                  }`}
                >
                  Sổ Chủ Nhiệm
                </p>
                {hasClass ? (
                  <ClassSelector
                    lop={lop}
                    classesInYear={classesInYear}
                    changeClass={changeClass}
                    collapsed={collapsed}
                  />
                ) : (
                  <h1
                    className={`font-bold text-[#575e55] dark:text-[#b0b9ac] font-serif transition-all duration-300 ease-out truncate ${
                      collapsed 
                        ? "text-base sm:text-lg leading-tight" 
                        : "text-lg sm:text-2xl leading-tight"
                    }`}
                  >
                    Chưa có lớp phụ trách
                  </h1>
                )}
              </div>
            </div>

            {/* Top Right: Bộ chọn Niên Khóa */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <YearSelector
                namHoc={namHoc}
                availableYears={availableYears}
                changeYear={changeYear}
                collapsed={collapsed}
              />
            </div>
          </div>

          {/* 4 Tabs Điều hướng Nghiệp vụ (Chỉ hiển thị khi có lớp) */}
          {hasClass && (
            <div className="w-full sm:w-fit p-0 sm:p-1 bg-transparent sm:bg-[#faf8f3] dark:sm:bg-[#151c18] rounded-none sm:rounded-2xl border-0 sm:border border-[#dedfd4] dark:border-[#354237] overflow-hidden">
              <nav
                className="tk-tabbar relative grid grid-cols-4 sm:flex gap-1.5 sm:gap-1 w-full sm:w-auto"
                data-lenis-prevent
                aria-label="Điều hướng nghiệp vụ lớp"
              >
                {TABS.map(({ to, label, shortLabel, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    className={({ isActive }) =>
                      `tk-tab relative flex-1 sm:flex-initial inline-flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-2 px-1 sm:px-4 py-1.5 sm:py-2 min-h-[46px] sm:min-h-[40px] rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                        isActive
                          ? "text-[#314e3e] dark:text-[#d6b883] font-bold bg-[#fffefa] dark:bg-[#1e2821] shadow-xs border border-[#dedfd4] dark:border-[#354237] sm:border-transparent sm:bg-transparent sm:shadow-none"
                          : "text-[#575e55] dark:text-[#b0b9ac] hover:text-[#293d32] dark:hover:text-[#ecece0] bg-[#faf8f3]/60 dark:bg-[#151c18]/60 border border-[#dedfd4]/40 dark:border-[#354237]/40 sm:border-transparent sm:bg-transparent hover:bg-stone-500/5"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <Motion.div
                            layoutId="teacher-active-tab-desktop"
                            className="hidden sm:block absolute inset-0 bg-[#fffefa] dark:bg-[#1e2821] rounded-xl shadow-xs border border-[#dedfd4] dark:border-[#354237]"
                            initial={false}
                            transition={{ type: "spring", stiffness: 450, damping: 32 }}
                          />
                        )}
                        <span className="relative z-10 inline-flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 text-center">
                          <div className="relative flex items-center justify-center">
                            <Icon className="w-4 h-4 sm:w-4 sm:h-4 shrink-0" aria-hidden="true" />
                            {to === "học-sinh" && pendingRequestsCount > 0 && (
                              <span className="sm:hidden absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                            )}
                          </div>
                          <span className="sm:hidden leading-tight whitespace-nowrap font-bold">{shortLabel}</span>
                          <span className="hidden sm:inline whitespace-nowrap">{label}</span>
                          {to === "học-sinh" && pendingRequestsCount > 0 && (
                            <span className="hidden sm:inline ml-1 px-1.5 py-0.2 rounded-full bg-amber-500 text-amber-950 font-black text-xs animate-pulse shrink-0">
                              {pendingRequestsCount}
                            </span>
                          )}
                        </span>
                      </>
                    )}
                  </NavLink>
                ))}
              </nav>
            </div>
          )}
        </div>
      </header>
    );
  })
);

function EmptyClassState({ namHoc, availableYears, teachingHistory, changeYear, onGoHome }) {
  return (
    <div className="min-h-[50vh] w-full flex flex-col items-center justify-center py-6 sm:py-10 px-4 text-center">
      <div className="w-full max-w-xl mx-auto bg-[#fffefa] dark:bg-[#1e2821] rounded-3xl border border-[#dedfd4] dark:border-[#354237] p-5 sm:p-8 shadow-2xs flex flex-col items-center gap-5 transition-colors">
        {/* Icon & Title */}
        <div className="w-14 h-14 rounded-2xl bg-[#927140]/10 dark:bg-[#d4b47d]/15 text-[#927140] dark:text-[#d4b47d] flex items-center justify-center shrink-0">
          <GraduationCap className="w-7 h-7" aria-hidden="true" />
        </div>

        <div className="flex flex-col gap-1.5 max-w-md">
          <h2 className="text-lg sm:text-xl font-bold font-serif text-[#293d32] dark:text-[#ecece0] leading-tight">
            Chưa có lớp chủ nhiệm trong niên khóa {namHoc}
          </h2>
          <p className="text-xs sm:text-sm text-[#575e55] dark:text-[#b0b9ac] leading-relaxed">
            {teachingHistory && teachingHistory.length > 0 ? (
              <>
                Bạn chưa được phân bổ lớp trong niên khóa {namHoc}. Bạn có thể chọn niên khóa khác hoặc nhấp chuyển nhanh đến các niên khóa bạn đã từng phụ trách bên dưới:
              </>
            ) : (
              <>
                Tài khoản của bạn đã được cấp quyền Giáo lý viên nhưng hiện tại chưa được Ban Quản Trị xếp vào lớp chủ nhiệm nào trong niên khóa {namHoc}.
              </>
            )}
          </p>
        </div>

        {/* Danh sách các niên khóa đã từng dạy (Quick-Switch Cards) */}
        {teachingHistory && teachingHistory.length > 0 && (
          <div className="w-full flex flex-col gap-2 pt-2 border-t border-[#dedfd4]/60 dark:border-[#354237]/60">
            <span className="text-xs font-bold uppercase tracking-wider text-[#575e55] dark:text-[#b0b9ac] text-left">
              Niên khóa bạn đã từng phụ trách:
            </span>
            <div className="flex flex-col gap-2">
              {teachingHistory.map((item) => {
                const isViewing = item.namHoc === namHoc;
                return (
                  <button
                    key={item.namHoc}
                    type="button"
                    onClick={() => changeYear(item.namHoc, item.classes[0])}
                    className={`w-full min-h-[52px] text-left p-3 sm:p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 group active:scale-[0.99] ${
                      isViewing
                        ? "bg-[#314e3e]/10 dark:bg-[#d4b47d]/20 border-[#314e3e]/40 dark:border-[#d4b47d]/40"
                        : "bg-[#faf8f3] dark:bg-[#151c18] border-[#dedfd4] dark:border-[#354237] hover:border-[#314e3e]/40 dark:hover:border-[#d4b47d]/40"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-[#314e3e]/10 dark:bg-[#d4b47d]/15 text-[#314e3e] dark:text-[#d4b47d] flex items-center justify-center shrink-0">
                        <CalendarDays className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-bold text-[#293d32] dark:text-[#ecece0] font-sans truncate">
                          Niên khóa {item.namHoc}
                        </p>
                        <p className="text-xs text-[#575e55] dark:text-[#b0b9ac] truncate">
                          {item.classes.length > 0 ? `Lớp: ${item.classes.join(" · ")}` : "Chưa có lớp"}
                        </p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-[#314e3e] dark:text-[#d6b883] shrink-0 group-hover:translate-x-1 transition-transform">
                      <span>Mở sổ</span>
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Trợ giúp & Hướng dẫn */}
        <div className="w-full text-xs text-[#575e55] dark:text-[#b0b9ac] bg-[#faf8f3] dark:bg-[#151c18] p-3 rounded-xl border border-[#dedfd4]/60 dark:border-[#354237]/60 leading-relaxed text-left">
          💡 Nếu thông tin phân công lớp cho năm học mới chưa chính xác, xin vui lòng liên hệ Ban Quản Trị hoặc Cha Tuyên úy để được cập nhật lại danh sách.
        </div>

        {/* Nút hành động chính (Thumb Zone) */}
        <div className="flex items-center justify-center gap-2.5 flex-wrap w-full pt-1">
          <button
            type="button"
            onClick={onGoHome}
            className="min-h-[44px] px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-[#293d32] dark:text-[#ecece0] bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237] hover:bg-stone-200/50 dark:hover:bg-stone-800 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" aria-hidden="true" /> Về trang chủ
          </button>
          <NavLink
            to="/liên-hệ"
            className="min-h-[44px] px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#314e3e] dark:bg-[#d6b883] dark:text-[#19251d] hover:opacity-95 transition-opacity inline-flex items-center gap-1.5 shadow-2xs"
          >
            Liên hệ Ban Quản Trị
          </NavLink>
        </div>
      </div>
    </div>
  );
}

function TeacherLayoutInner() {
  const navigate = useNavigate();
  const {
    loadingContext,
    context,
    changeYear,
    changeClass,
    pendingRequestsCount,
    showFallbackBanner,
    dismissFallbackBanner,
  } = useTeacherContext();

  const [outletKey, setOutletKey] = useState(0);
  const resetOutlet = useCallback(() => setOutletKey((k) => k + 1), []);

  const handleGoHome = useCallback(() => navigate("/"), [navigate]);

  const headerRef = useRef(null);
  useHeaderHeightVar(headerRef);
  const headerCollapsed = useScrollCollapse(80);

  if (loadingContext) {
    return <AuthGateSkeleton />;
  }

  const hasClass = Boolean(context?.lop);

  return (
    <div className="min-h-screen bg-[#faf8f3] dark:bg-[#151c18] text-[#293d32] dark:text-[#ecece0] transition-colors duration-300">
      <style>{`
        .tk-tabbar::-webkit-scrollbar { display: none; }
        .tk-tabbar { -ms-overflow-style: none; scrollbar-width: none; }
        :root { --header-h: 48px; }
      `}</style>

      {/* Fallback Banner nếu tự động mở năm học cũ do năm hiện tại chưa có lớp */}
      {showFallbackBanner && context?.namHoc && (
        <FallbackNoticeBanner
          currentNamHoc={getCurrentNamHoc()}
          activeNamHoc={context.namHoc}
          onDismiss={dismissFallbackBanner}
          onSwitchToCurrent={() => changeYear(getCurrentNamHoc())}
        />
      )}

      <TeacherHeader
        ref={headerRef}
        lop={context?.lop}
        classesInYear={context?.classesInYear}
        changeClass={changeClass}
        namHoc={context?.namHoc}
        availableYears={context?.availableYears}
        changeYear={changeYear}
        collapsed={headerCollapsed}
        pendingRequestsCount={pendingRequestsCount}
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 pt-2 pb-12 sm:py-8">
        {hasClass ? (
          <RouteErrorBoundary onReset={resetOutlet}>
            <Suspense fallback={<TableSkeleton rows={6} columns={6} />}>
              <Outlet key={`${context.namHoc}-${context.lop}-${outletKey}`} />
            </Suspense>
          </RouteErrorBoundary>
        ) : (
          <EmptyClassState
            namHoc={context?.namHoc || getCurrentNamHoc()}
            availableYears={context?.availableYears}
            teachingHistory={context?.teachingHistory}
            changeYear={changeYear}
            onGoHome={handleGoHome}
          />
        )}
      </main>
    </div>
  );
}

export default function TeacherLayout() {
  return (
    <TeacherProvider>
      <TeacherLayoutInner />
    </TeacherProvider>
  );
}