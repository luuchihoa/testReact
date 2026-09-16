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
  GraduationCap,
  RefreshCw,
  ChevronDown,
  CalendarDays,
  Check,
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
            ? "h-8 px-2.5 sm:px-3 text-xs" 
            : "h-8 sm:h-9 px-2.5 sm:px-3.5 text-xs sm:text-[13px]"
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
            <div className="px-3 py-2 border-b border-[#dedfd4]/60 dark:border-[#354237]/60 flex items-center justify-between text-[10.5px] sm:text-[11px] font-bold uppercase tracking-wider text-[#575e55] dark:text-[#b0b9ac]">
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
                    className={`w-full flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-xs sm:text-[13px] font-bold text-left transition-colors cursor-pointer ${
                      active 
                        ? "bg-[#314e3e]/10 dark:bg-[#d4b47d]/20 text-[#314e3e] dark:text-[#d4b47d]" 
                        : "text-[#293d32] dark:text-[#ecece0] hover:bg-[#faf8f3] dark:hover:bg-[#151c18]"
                    }`}
                  >
                    <span className="flex items-center gap-2 font-mono">
                      <span>{nh}</span>
                      {isCurr && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] sm:text-[9.5px] font-extrabold uppercase tracking-wide bg-emerald-600 text-white font-sans">
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

const TeacherHeader = React.memo(
  React.forwardRef(function TeacherHeader(
    { lop, namHoc, availableYears, changeYear, collapsed, pendingRequestsCount },
    ref
  ) {
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
                  className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#314e3e] dark:text-[#d4b47d] overflow-hidden transition-all duration-300 ease-out ${
                    collapsed ? "max-h-0 opacity-0 hidden sm:block" : "max-h-4 opacity-100"
                  }`}
                >
                  Sổ Chủ Nhiệm
                </p>
                <h1
                  className={`font-bold text-[#293d32] dark:text-[#ecece0] font-serif transition-all duration-300 ease-out truncate ${
                    collapsed 
                      ? "text-base sm:text-lg leading-tight" 
                      : "text-lg sm:text-2xl leading-tight"
                  }`}
                >
                  Lớp {lop}
                </h1>
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

          {/* 4 Tabs Điều hướng Nghiệp vụ (Không viền bọc ngoài trên Mobile, icon trên chữ) */}
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
                    `tk-tab relative flex-1 sm:flex-initial inline-flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-2 px-1 sm:px-4 py-1.5 sm:py-2 min-h-[46px] sm:min-h-[40px] rounded-xl text-[11px] sm:text-[13px] font-semibold transition-all duration-200 ${
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
                          <span className="hidden sm:inline ml-1 px-1.5 py-0.2 rounded-full bg-amber-500 text-amber-950 font-black text-[10px] animate-pulse shrink-0">
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
        </div>
      </header>
    );
  })
);

function EmptyClassState({ onGoHome }) {
  return (
    <div className="min-h-[60vh] w-full flex flex-col items-center justify-center gap-3 px-4 text-center">
      <GraduationCap className="w-12 h-12 text-[#dedfd4] dark:text-[#354237]" aria-hidden="true" />
      <p className="text-[#575e55] dark:text-[#b0b9ac] text-sm max-w-xs leading-relaxed">
        Bạn chưa được phân công chủ nhiệm lớp nào trong năm học {getCurrentNamHoc()}.
      </p>
      <button
        type="button"
        onClick={onGoHome}
        className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-[#314e3e] dark:text-[#d6b883] hover:underline"
      >
        <ChevronLeft className="w-4 h-4" aria-hidden="true" /> Về trang chủ
      </button>
    </div>
  );
}

function TeacherLayoutInner() {
  const navigate = useNavigate();
  const { loadingContext, context, students, studentsInitialized, changeYear, pendingRequestsCount } = useTeacherContext();

  const [outletKey, setOutletKey] = useState(0);
  const resetOutlet = useCallback(() => setOutletKey((k) => k + 1), []);

  const handleGoHome = useCallback(() => navigate("/"), [navigate]);

  const headerRef = useRef(null);
  useHeaderHeightVar(headerRef);
  const headerCollapsed = useScrollCollapse(80);

  if (loadingContext) {
    return <AuthGateSkeleton />;
  }

  if (!context?.lop) {
    return <EmptyClassState onGoHome={handleGoHome} />;
  }

  return (
    <div className="min-h-screen bg-[#faf8f3] dark:bg-[#151c18] text-[#293d32] dark:text-[#ecece0] transition-colors duration-300">
      <style>{`
        .tk-tabbar::-webkit-scrollbar { display: none; }
        .tk-tabbar { -ms-overflow-style: none; scrollbar-width: none; }
        :root { --header-h: 48px; }
      `}</style>

      <TeacherHeader
        ref={headerRef}
        lop={context.lop}
        namHoc={context.namHoc}
        availableYears={context.availableYears}
        changeYear={changeYear}
        collapsed={headerCollapsed}
        pendingRequestsCount={pendingRequestsCount}
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 pt-0 pb-6 sm:py-8">
        <RouteErrorBoundary onReset={resetOutlet}>
          <Suspense fallback={<TableSkeleton rows={6} columns={6} />}>
            <Outlet key={`${context.namHoc}-${outletKey}`} />
          </Suspense>
        </RouteErrorBoundary>
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