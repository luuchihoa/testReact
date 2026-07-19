import React, {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Navigate, NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  ClipboardList,
  CalendarCheck,
  Table,
  ChevronLeft,
  GraduationCap,
  Users,
  RefreshCw,
} from "lucide-react";
import { supabase } from "../../lib/supabase.js";
import { AuthGateSkeleton, TableSkeleton, Bone } from "../../components/ui/Skeleton.jsx";
import { TeacherProvider, useTeacherContext } from "./TeacherContext.jsx";
import { getCurrentNamHoc } from "./utils.js";

// ---------------------------------------------------------------------------
// Design tokens — "Sổ chủ nhiệm" identity
// ---------------------------------------------------------------------------
// Hardcoded as Tailwind arbitrary values for now so this file is a drop-in
// replacement with no build config changes. Once approved, promote these
// into tailwind.config.js under `theme.extend.colors.tk` (e.g. `tk-paper`,
// `tk-ink`, `tk-accent`, `tk-flag`, `tk-hair`) so every screen in the app
// can reference the same palette instead of copy-pasting hex values.
//
//   paper (nền)        #F5F4F0  / dark #1B2130
//   card/surface        #FFFFFF  / dark #232A3B
//   ink (chữ chính)      #1E2A44  / dark #E8E9EE
//   accent (chalkboard)  #2F6F5E  / dark #5FAE94
//   flag (cảnh báo/mực đỏ) #B3432F / dark #E2795F
//   hairline (viền)      #E4E1D9  / dark #333B4E
//   sub (chữ phụ)        #6B6A63  / dark #9AA0B4
//
// Typography: display = Fraunces (tiêu đề), body = Inter, số liệu = IBM
// Plex Mono. The @import below is a convenience for previewing this file
// in isolation — in production, load these once in the app's root
// stylesheet/index.html instead of per-component.

const TK_FONT_IMPORT =
  "@import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@500;600&family=Inter:wght@400;500&family=IBM+Plex+Mono:wght@500&display=swap');";

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
  { to: "tổng-quan", label: "Tổng kết lớp", icon: LayoutDashboard },
  { to: "học-sinh", label: "Học sinh", icon: ClipboardList },
  { to: "điểm-danh", label: "Điểm danh nhanh", icon: CalendarCheck },
  { to: "nhập-điểm", label: "Nhập điểm nhanh", icon: Table },
];

// ---------------------------------------------------------------------------
// useScrollCollapse — threshold-based collapse (mobile only)
// ---------------------------------------------------------------------------
// Deliberately NOT direction-aware (no "hide on scroll-down, show on
// scroll-up" logic). That pattern (Gmail/Notion/X) needs debounce + a
// direction threshold to avoid jitter, which is more moving parts than this
// screen currently needs. Instead: past `threshold` px of scroll, collapse;
// below it, expand. Simple, cheap, no direction bugs. The actual collapsing
// is done with CSS transform/opacity transitions (scoped to mobile via
// base-vs-`sm:` utility pairs in TeacherHeader) — this hook only flips a
// boolean, it doesn't touch layout directly.
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

// ---------------------------------------------------------------------------
// useHeaderHeightVar — publishes the sticky header's rendered height as a
// CSS custom property (`--header-h`) on the document root.
// ---------------------------------------------------------------------------
// Why a CSS var on :root instead of React context: every scrollable child
// (SummaryTab's table today, other tabs' tables later) needs the exact same
// number to position its own `sticky` thead just below the header, and a
// CSS var is the simplest thing that's globally readable without plumbing
// a value through TeacherContext or prop-drilling into every future tab.
// TeacherHeader itself sits at `top-16` (see className below) — i.e. it is
// offset 64px from the viewport top by the app's outer nav — so the point
// where a table's thead should start being sticky is 64px + this element's
// own rendered height, not just its own height.
const HEADER_STICKY_OFFSET_PX = 0; // previously 64, changed because global header is hidden

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

// ---------------------------------------------------------------------------
// useRequireRole — reusable auth-gate hook
// ---------------------------------------------------------------------------

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requiredRole, retryToken]);

  return { status, retry };
}

function AuthCheckError({ onRetry }) {
  return (
    <div className="min-h-[60vh] w-full flex flex-col items-center justify-center gap-3 px-4 text-center">
      <p className="text-[#6B6A63] dark:text-[#9AA0B4] text-sm max-w-xs">
        Không thể xác thực quyền truy cập. Vui lòng kiểm tra kết nối mạng và thử lại.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#2F6F5E] dark:text-[#5FAE94] hover:underline"
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

// ---------------------------------------------------------------------------
// Error boundary
// ---------------------------------------------------------------------------

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
          <p className="text-[#6B6A63] dark:text-[#9AA0B4] text-sm max-w-xs">
            Đã có lỗi xảy ra khi tải nội dung này.
          </p>
          <button
            type="button"
            onClick={this.handleReset}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#2F6F5E] dark:text-[#5FAE94] hover:underline"
          >
            <RefreshCw className="w-4 h-4" /> Thử lại
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ---------------------------------------------------------------------------
// Header — "hồ sơ lớp" layout with indexed underline tabs
// ---------------------------------------------------------------------------

const TeacherHeader = React.memo(
  React.forwardRef(function TeacherHeader(
    { lop, namHoc, studentCount, studentsInitialized, collapsed },
    ref
  ) {
  return (
    <div
      ref={ref}
      className={`sticky top-0 z-[60] border-b transition-all duration-300 ease-out px-4 sm:px-6 ${
        collapsed 
          ? "py-2 bg-white/95 dark:bg-[#1C1917]/95 backdrop-blur-2xl shadow-sm border-amber-900/10 dark:border-amber-100/10" 
          : "py-3 sm:py-4 bg-white/70 dark:bg-[#1C1917]/70 backdrop-blur-xl border-transparent"
      }`}
    >
      <div
        className={`max-w-6xl mx-auto flex flex-col transition-[gap] duration-300 ease-out ${
          collapsed ? "gap-1" : "gap-3"
        } sm:gap-3`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <NavLink
              to="/"
              className="p-1.5 sm:p-2 -ml-1.5 sm:-ml-2 rounded-full flex-shrink-0 text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-amber-950 dark:hover:text-amber-50 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-800/50"
              aria-label="Về trang chủ"
            >
              <ChevronLeft className="w-5 h-5" />
            </NavLink>
            <div className="min-w-0">
              <p
                className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-amber-800/80 dark:text-amber-500/80 overflow-hidden transition-all duration-300 ease-out ${
                  collapsed ? "max-h-0 opacity-0" : "max-h-4 opacity-100"
                }`}
              >
                Sổ chủ nhiệm
              </p>
              <h1
                className={`font-semibold text-amber-950 dark:text-amber-50 truncate transition-all duration-300 ease-out ${
                  collapsed ? "text-sm sm:text-lg" : "text-lg sm:text-2xl"
                }`}
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                Lớp {lop} · {namHoc}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <span
              className="inline-flex items-center gap-2 pr-4 pl-1.5 py-1.5 rounded-full bg-gradient-to-b from-stone-50 to-white dark:from-stone-800 dark:to-stone-900 border border-stone-200/80 dark:border-stone-700/80 shadow-sm text-xs font-bold text-amber-950 dark:text-amber-50 transition-all hover:shadow-md"
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              aria-live="polite"
            >
              <div className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center shrink-0">
                <Users className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" aria-hidden="true" />
              </div>
              {studentsInitialized ? (
                <span className="text-[13px] leading-none">{studentCount}</span>
              ) : (
                <Bone className="h-3 w-5 rounded-md" aria-hidden="true" />
              )}
              <span className="hidden sm:inline font-sans font-medium text-[12px] text-stone-500 dark:text-stone-400 leading-none">
                học sinh
              </span>
            </span>
          </div>
        </div>

        <div className="p-1 sm:p-1.5 bg-stone-100/80 dark:bg-stone-800/80 backdrop-blur-sm rounded-2xl border border-stone-200/50 dark:border-stone-700/50 w-full overflow-hidden">
          <nav
            className="tk-tabbar relative flex gap-1 sm:gap-1.5 overflow-x-auto w-full no-scrollbar"
            data-lenis-prevent
            aria-label="Điều hướng lớp học"
          >
            {TABS.map(({ to, label, icon: Icon }, i) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `tk-tab relative flex-shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold whitespace-nowrap transition-colors duration-300 ${
                    isActive
                      ? "text-amber-950 dark:text-amber-50"
                      : "text-stone-500 dark:text-stone-400 hover:text-amber-950 dark:hover:text-amber-50 hover:bg-white/50 dark:hover:bg-stone-700/50"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.div
                        layoutId="teacher-active-tab"
                        className="absolute inset-0 bg-white dark:bg-stone-900 rounded-xl shadow-sm border border-amber-900/10 dark:border-amber-100/10"
                        initial={false}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10 inline-flex items-center gap-1.5">
                      <Icon className="w-4 h-4" aria-hidden="true" /> {label}
                    </span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
  })
);

// ---------------------------------------------------------------------------
// Layout body
// ---------------------------------------------------------------------------

function EmptyClassState({ onGoHome }) {
  return (
    <div className="min-h-[60vh] w-full flex flex-col items-center justify-center gap-3 px-4 text-center">
      <GraduationCap className="w-10 h-10 text-[#E4E1D9] dark:text-[#333B4E]" aria-hidden="true" />
      <p className="text-[#6B6A63] dark:text-[#9AA0B4] text-sm max-w-xs">
        Bạn chưa được phân công chủ nhiệm lớp nào trong năm học {getCurrentNamHoc()}.
      </p>
      <button
        type="button"
        onClick={onGoHome}
        className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-[#2F6F5E] dark:text-[#5FAE94] hover:underline"
      >
        <ChevronLeft className="w-4 h-4" aria-hidden="true" /> Về trang chủ
      </button>
    </div>
  );
}

function TeacherLayoutInner() {
  const navigate = useNavigate();
  const { loadingContext, context, students, studentsInitialized } = useTeacherContext();

  const [outletKey, setOutletKey] = useState(0);
  const resetOutlet = useCallback(() => setOutletKey((k) => k + 1), []);

  const handleGoHome = useCallback(() => navigate("/"), [navigate]);

  const studentCount = useMemo(() => students?.length ?? 0, [students]);

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
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#1C1917]">
      <style>{`
        ${TK_FONT_IMPORT}
        .tk-tabbar::-webkit-scrollbar { display: none; }
        .tk-tabbar { -ms-overflow-style: none; scrollbar-width: none; }
        /* Fallback before ResizeObserver's first measurement runs (and for
           any environment without ResizeObserver support). Child tables
           (SummaryTab, and any future tab) read this same variable to
           position their sticky <thead> just below the header — see
           useHeaderHeightVar above for how it's kept accurate. */
        :root { --header-h: 48px; }
      `}</style>

      <TeacherHeader
        ref={headerRef}
        lop={context.lop}
        namHoc={context.namHoc}
        studentCount={studentCount}
        studentsInitialized={studentsInitialized}
        collapsed={headerCollapsed}
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <RouteErrorBoundary onReset={resetOutlet}>
          <Suspense fallback={<TableSkeleton rows={6} columns={6} />}>
            <Outlet key={outletKey} />
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