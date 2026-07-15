import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Navigate, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, UserCog, School, ClipboardCheck, BarChart3, Megaphone, FileCheck,
  ChevronDown, CalendarDays, Check, UserPlus, MessageSquare, MoreHorizontal,
  Search, Bell, AlertTriangle,
} from "lucide-react";
import { supabase } from "../../lib/supabase.js";
import { AuthGateSkeleton, AdminTabSkeleton } from "../ui/Skeleton.jsx";
import { AdminProvider, useAdminContext } from "./AdminContext.jsx";
import { getCurrentNamHoc } from "./constants.js";

const SYSTEM_FONT =
  "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Segoe UI', Roboto, sans-serif";

// Layout này được mount bên dưới một header ứng dụng cố định cao 64px (h-16).
// Đưa ra một hằng số ở đây để nếu header ngoài đổi chiều cao, chỉ cần sửa một chỗ
// thay vì lục lại class "top-16" rải rác trong JSX.
const HEADER_OFFSET = "4rem";

// ---------------------------------------------------------------------------
// Cấu hình tập trung: gom các "magic number/string" rải rác trước đây (ngưỡng
// scroll, key localStorage, TTL cache quyền admin...) về một chỗ duy nhất.
// Enterprise: khi cần đổi hành vi (VD: rút ngắn TTL cache quyền vì lý do bảo
// mật) thì chỉ sửa ở đây, không phải "grep" toàn bộ file để tìm số literal.
// ---------------------------------------------------------------------------
const CONFIG = {
  ROLE_CACHE_KEY: "role",
  ROLE_CACHE_TS_KEY: "role_cached_at",
  // Cache quyền admin chỉ có giá trị "gợi ý hiển thị lạc quan" (tránh nháy
  // skeleton mỗi lần chuyển trang), KHÔNG BAO GIỜ là nguồn xác thực cuối
  // cùng — mọi lượt tải trang vẫn luôn xác minh lại với Supabase. Sau
  // khoảng thời gian này cache bị coi là hết hạn để tránh giữ quyền quá lâu
  // nếu quyền đã bị thu hồi ở phía server.
  ROLE_CACHE_TTL_MS: 5 * 60 * 1000,
  SCROLL_COLLAPSE_THRESHOLD_PX: 16,
  MAX_VISIBLE_DESKTOP_TABS: 6,
};

// ---------------------------------------------------------------------------
// Hook dùng chung: đóng dropdown khi click ra ngoài hoặc nhấn Escape.
// YearPicker, menu "Thêm", chuông thông báo và CommandPalette đều cần hành vi này,
// trước đây mỗi nơi tự viết lại — giờ gom về một chỗ để tránh lệch logic.
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Error boundary cho vùng nội dung tab. Nếu một tab lỗi khi render, chỉ vùng
// đó hiển thị thông báo — phần header/điều hướng vẫn dùng được bình thường.
// resetKey đổi theo route để tự phục hồi khi người dùng chuyển sang tab khác.
// ---------------------------------------------------------------------------
class AdminErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorId: null };
  }

  static getDerivedStateFromError() {
    // errorId ngắn, không cần crypto — chỉ để người dùng đọc cho bộ phận hỗ
    // trợ khi báo lỗi, giúp tra log phía server nhanh hơn là "nó bị lỗi gì đó".
    return { hasError: true, errorId: Math.random().toString(36).slice(2, 8).toUpperCase() };
  }

  componentDidCatch(error, info) {
    console.error("AdminLayout: lỗi khi render nội dung tab:", error, info);
    // Điểm cắm quan sát lỗi: nếu ứng dụng có tích hợp Sentry/LogRocket/…, gán
    // window.__reportError = (error, info) => Sentry.captureException(...)
    // ở bootstrap để boundary này tự động gửi lỗi đi mà không cần sửa lại.
    if (typeof window !== "undefined" && typeof window.__reportError === "function") {
      try {
        window.__reportError(error, info);
      } catch {
        // Không để lỗi trong chính hàm báo lỗi làm sập boundary.
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
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-amber-900/10 dark:border-amber-100/10 bg-white/60 dark:bg-stone-800/40 px-6 py-14 text-center">
          <AlertTriangle className="w-8 h-8 text-amber-600 dark:text-amber-400" strokeWidth={1.75} />
          <p className="font-bold text-stone-700 dark:text-stone-300">Mục này gặp sự cố khi hiển thị</p>
          <p className="text-[13px] text-stone-500 dark:text-stone-400 max-w-sm">
            Thử tải lại trang. Các mục khác trong trang quản trị vẫn hoạt động bình thường.
          </p>
          {this.state.errorId && (
            <p className="text-[11px] text-stone-400 dark:text-stone-500 font-mono">
              Mã lỗi: {this.state.errorId}
            </p>
          )}
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-amber-900 dark:bg-amber-100 text-amber-50 dark:text-amber-950 text-[13px] font-bold px-4 py-2 active:scale-[0.97] transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50"
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
  // Cache chỉ dùng để QUYẾT ĐỊNH TRẠNG THÁI HIỂN THỊ BAN ĐẦU (tránh nháy
  // skeleton khi chuyển trang trong lúc vẫn còn phiên hợp lệ), không bao giờ
  // dùng để tự cấp quyền — nhánh xác minh với Supabase bên dưới luôn chạy.
  //
  // Trước đây: nếu cache nói "không phải admin", code từ chối ngay lập tức mà
  // KHÔNG xác minh lại với server. Hệ quả: một tài khoản vừa được cấp quyền
  // admin (hoặc cache bị lỗi/cũ) sẽ bị chặn oan cho tới khi cache tự bị xoá ở
  // một chỗ khác trong app — một lỗi khó phát hiện vì trông giống "hoạt động
  // đúng" trong đa số trường hợp. Sửa: luôn xác minh với server; cache chỉ
  // ảnh hưởng tới việc có hiển thị skeleton "checking" hay không.
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
          // Xoá cache cũ để lần truy cập sau kiểm tra lại từ đầu, tránh trường hợp
          // quyền admin đã bị thu hồi nhưng localStorage vẫn còn giữ giá trị cũ.
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

    // Phiên quản trị có thể mở rất lâu trên một tab nền (VD: để trong giờ
    // làm việc). Xác minh lại khi tab quay lại foreground sau khi cache đã
    // hết hạn, để quyền bị thu hồi ở nơi khác có tác dụng kịp thời thay vì
    // phải đợi người dùng tải lại trang thủ công.
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
  { to: "tổng-quan",  label: "Tổng quan",  icon: LayoutDashboard },
  { to: "đăng-ký",    label: "Đăng ký",    icon: UserPlus,        pendingKey: "pendingDangKy" },
  { to: "góp-ý",      label: "Góp ý",      icon: MessageSquare,   pendingKey: "pendingGopY" },
  { to: "thông-báo",  label: "Thông báo",  icon: Megaphone },
  { to: "người-dùng", label: "Người dùng", icon: UserCog },
  { to: "lớp-học",    label: "Lớp học",    icon: School },
  { to: "sổ-điểm",    label: "Bảng điểm",  icon: ClipboardCheck },
  { to: "báo-cáo",    label: "Báo cáo",    icon: BarChart3 },
  { to: "bài-viết",   label: "Duyệt bài",  icon: FileCheck,       pendingKey: "pendingBaiViet" },
];

function YearPicker() {
  const { namHoc, setNamHoc, namHocList } = useAdminContext();
  const [open, setOpen] = useState(false);
  const wrapRef = useDismissableDropdown(open, () => setOpen(false));

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

// ---------------------------------------------------------------------------
// Ô tìm kiếm nhanh (Ctrl/Cmd+K) để nhảy thẳng tới một mục quản trị mà không
// cần cuộn qua thanh tab — hữu ích khi danh sách TABS mở rộng theo thời gian.
// ---------------------------------------------------------------------------
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

  // Nếu bộ lọc thay đổi khiến chỉ số đang chọn vượt quá danh sách mới, kéo về
  // trong phạm vi hợp lệ thay vì để trỏ vào một mục không còn hiển thị.
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
    <div className="fixed inset-0 z-[60] flex items-start justify-center pt-24 px-4 bg-stone-950/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Tìm kiếm nhanh"
        className="w-full max-w-md rounded-2xl border border-amber-900/10 dark:border-amber-100/10 bg-[#FDFBF7] dark:bg-[#1C1917] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
      >
        <div className="flex items-center gap-2.5 px-4 py-3 border-b border-amber-900/10 dark:border-amber-100/10">
          <Search className="w-4 h-4 text-stone-400 flex-shrink-0" strokeWidth={2.25} />
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
            className="flex-1 bg-transparent text-[14px] font-semibold text-stone-800 dark:text-stone-100 placeholder:text-stone-400 placeholder:font-medium focus:outline-none"
          />
          <kbd className="hidden sm:inline-block text-[10px] font-bold text-stone-400 border border-stone-300 dark:border-stone-600 rounded px-1.5 py-0.5">Esc</kbd>
        </div>
        <div
          id="admin-command-palette-list"
          role="listbox"
          className="max-h-72 overflow-y-auto overscroll-contain p-1.5"
          data-lenis-prevent
        >
          {filtered.length === 0 ? (
            <p className="px-3 py-6 text-center text-[13px] text-stone-400">Không tìm thấy mục phù hợp</p>
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
                className={`w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13.5px] font-bold text-left transition-colors ${
                  index === activeIndex
                    ? "bg-amber-100/50 dark:bg-amber-500/20 text-amber-950 dark:text-amber-50"
                    : "text-stone-600 dark:text-stone-400 hover:bg-amber-50 dark:hover:bg-amber-900/10"
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0 text-amber-700 dark:text-amber-400" strokeWidth={2.1} />
                {label}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// Chuông thông báo: bấm để xem chi tiết từng mục đang chờ xử lý và nhảy
// thẳng tới tab tương ứng. Dùng lại dữ liệu đã có sẵn trong AdminContext —
// không cần thêm nguồn dữ liệu mới.
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
        className={`relative inline-flex items-center justify-center w-9 h-9 rounded-full border transition-all duration-150 active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-amber-500/50 dark:focus-visible:ring-offset-[#1C1917] ${
          open
            ? "border-transparent bg-amber-900 dark:bg-amber-100 text-amber-50 dark:text-amber-950"
            : "border-amber-900/10 dark:border-amber-100/10 bg-white/80 dark:bg-stone-800/40 text-stone-500 dark:text-stone-400 hover:bg-amber-50 dark:hover:bg-stone-800/80"
        }`}
      >
        <Bell className="w-4 h-4" strokeWidth={2.1} />
        {total > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[16px] h-[16px] px-1 rounded-full bg-red-500 text-white text-[9.5px] font-bold tabular-nums">
            {total > 99 ? "99+" : total}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 min-w-[220px] rounded-2xl border border-amber-900/10 dark:border-amber-100/10 bg-[#FDFBF7]/95 dark:bg-[#1C1917]/95 backdrop-blur-xl p-1.5 shadow-xl animate-in fade-in zoom-in-95 duration-150"
        >
          {items.length === 0 ? (
            <p className="px-3 py-4 text-center text-[13px] text-stone-400">Không có mục chờ xử lý</p>
          ) : (
            items.map((it) => (
              <NavLink
                key={it.to}
                to={it.to}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-bold text-stone-600 dark:text-stone-400 hover:bg-amber-50 dark:hover:bg-amber-900/10 transition-colors"
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

// Số tab hiển thị thẳng trên thanh (desktop) trước khi gom phần còn lại vào
// nút "Thêm". Khi danh sách TABS mở rộng thêm trong tương lai, tab mới chỉ
// đơn giản rơi vào menu "Thêm" — không cần sửa gì ở đây.
// (Được hoist ra ngoài component vì TABS không đổi khi chạy — tính một lần
// duy nhất ở module-scope thay vì tính lại ở mỗi lần TabNav render.)
const VISIBLE_DESKTOP_TABS = TABS.slice(0, CONFIG.MAX_VISIBLE_DESKTOP_TABS);
const OVERFLOW_TABS = TABS.slice(CONFIG.MAX_VISIBLE_DESKTOP_TABS);

// Generic theo `pendingKey` khai báo ngay trên từng phần tử TABS — thêm một
// tab có badge trong tương lai không cần sửa hàm này, chỉ cần thêm pendingKey
// vào TABS ở trên.
function tabPendingCount(tab, pending) {
  return tab.pendingKey ? pending[tab.pendingKey] ?? 0 : 0;
}

const TabBadge = React.memo(function TabBadge({ count }) {
  if (!count) return null;
  return (
    <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold tabular-nums">
      {count}
    </span>
  );
});

const tabItemClass = ({ isActive, compact }) =>
  `snap-start flex-shrink-0 ${compact ? "sm:flex-1 sm:flex-shrink sm:justify-center" : ""} inline-flex items-center gap-1.5 h-11 sm:h-auto px-4 sm:px-2.5 sm:py-2 rounded-xl text-[13px] ${compact ? "sm:text-[12.5px]" : ""} font-bold whitespace-nowrap transition-all duration-200 motion-reduce:transition-none active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 ${
    isActive
      ? "bg-white dark:bg-stone-800 text-amber-700 dark:text-amber-400 shadow-sm"
      : "text-stone-500 dark:text-stone-400 hover:text-amber-800 dark:hover:text-amber-300"
  }`;

// Rút gọn phần render icon + nhãn + badge dùng chung giữa danh sách mobile
// và desktop, tránh JSX bị lặp lại y hệt ở hai nơi. React.memo vì TabNav
// re-render mỗi khi số lượng "chờ xử lý" trong context đổi — memo giúp các
// tab không liên quan (badgeCount không đổi) bỏ qua việc render lại.
const TabLink = React.memo(function TabLink({ to, label, icon: Icon, compact, badgeCount }) {
  return (
    <NavLink to={to} className={({ isActive }) => tabItemClass({ isActive, compact })}>
      <Icon className={`${compact ? "w-3.5 h-3.5" : "w-4 h-4"} flex-shrink-0`} strokeWidth={2.1} />
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

  // Slug hiện tại (đoạn cuối URL) để biết tab nào trong menu "Thêm" đang active,
  // vì NavLink tự lo việc này cho các tab hiển thị trực tiếp, còn nút "Thêm"
  // (không phải NavLink) thì phải tự so sánh route.
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

  return (
    <nav
      className="relative flex items-center gap-1 bg-amber-900/5 dark:bg-amber-100/5 rounded-2xl p-1 max-w-full w-full"
      data-lenis-prevent
    >
      {/* Mobile: tất cả các tab, cuộn ngang — không gian rộng theo chiều dọc
          nên gom vào "Thêm" không cần thiết, cuộn ngón tay vẫn thoải mái hơn.
          Dùng mask-image để fade mép thay vì overlay màu cứng, nên luôn khớp
          với nền thật của thanh nav bất kể theme sáng/tối. */}
      <div
        className="flex-1 lg:hidden min-w-0 flex gap-1.5 overflow-x-auto snap-x snap-mandatory touch-pan-x [&::-webkit-scrollbar]:hidden"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          WebkitMaskImage: "linear-gradient(to right, transparent, black 16px, black calc(100% - 16px), transparent)",
          maskImage: "linear-gradient(to right, transparent, black 16px, black calc(100% - 16px), transparent)",
        }}
      >
        {TABS.map((tab) => (
          <TabLink key={tab.to} to={tab.to} label={tab.label} icon={tab.icon} badgeCount={tabPendingCount(tab, pending)} />
        ))}
      </div>

      {/* Desktop: chỉ hiện tối đa CONFIG.MAX_VISIBLE_DESKTOP_TABS tab, phần còn lại
          gom vào menu thả xuống "Thêm". Mỗi mục chia đều chiều rộng còn lại
          (segmented control) thay vì dồn về bên trái, dùng hết bề ngang thanh
          điều hướng cho gọn mắt trên màn hình lớn. */}
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
                <activeOverflowTab.icon className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={2.1} />
              ) : (
                <MoreHorizontal className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={2.1} />
              )}
              {activeOverflowTab ? activeOverflowTab.label : "Thêm"}
              <TabBadge count={activeOverflowTab ? tabPendingCount(activeOverflowTab, pending) : overflowBadgeTotal} />
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
                {OVERFLOW_TABS.map((tab) => {
                  const active = tab.to === currentSlug;
                  return (
                    <NavLink
                      key={tab.to}
                      to={tab.to}
                      onClick={() => setMoreOpen(false)}
                      className={`flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-bold transition-colors ${
                        active
                          ? "bg-amber-100/50 dark:bg-amber-500/20 text-amber-950 dark:text-amber-50"
                          : "text-stone-600 dark:text-stone-400 hover:bg-amber-50 dark:hover:bg-amber-900/10"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <tab.icon className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={2.1} /> {tab.label}
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

// Khối eyebrow + tiêu đề, dùng chung cho bố cục mobile và desktop vì hai bên
// đặt nó ở vị trí khác nhau trong hàng (mobile: chung hàng với năm học;
// desktop: đứng riêng, các nút hành động dồn sang phải).
function HeaderTitleBlock({ scrolled, pageTitle, className = "" }) {
  return (
    <div className={`min-w-0 ${className}`}>
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
        {pageTitle}
      </h1>
    </div>
  );
}

function AdminHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Ctrl/Cmd+K mở ô tìm kiếm nhanh từ bất kỳ đâu trong trang quản trị.
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
  const pageTitle = currentTab ? currentTab.label : "Bảng điều khiển";

  return (
    <div
      className={`sticky z-30 bg-[#FDFBF7]/90 dark:bg-[#1C1917]/90 backdrop-blur-xl border-b border-amber-900/10 dark:border-amber-100/10 transition-[padding,box-shadow] duration-300 motion-reduce:transition-none ${
        scrolled ? "shadow-[0_4px_20px_-8px_rgba(120,53,15,0.15)]" : ""
      }`}
      style={{ top: HEADER_OFFSET }}
    >
      <div className={`max-w-6xl mx-auto px-4 sm:px-6 transition-all duration-300 motion-reduce:transition-none ${scrolled ? "py-2.5" : "py-4"}`}>
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-end sm:justify-between sm:gap-3">
          {/* Mobile: tiêu đề và năm học chung một hàng — năm học là một chip nhỏ
              gọn nên không tranh hết chỗ, tiêu đề vẫn có đủ không gian để đọc. */}
          <div className="flex sm:hidden items-center justify-between gap-3 min-w-0">
            <HeaderTitleBlock scrolled={scrolled} pageTitle={pageTitle} className="flex-1" />
            <div className="flex-shrink-0">
              <YearPicker />
            </div>
          </div>

          {/* Desktop: tiêu đề đứng riêng, mọi hành động dồn sang phải trên cùng hàng. */}
          <HeaderTitleBlock scrolled={scrolled} pageTitle={pageTitle} className="hidden sm:block" />

          {/* Mobile: ô tìm kiếm chiếm hết phần chiều rộng còn dư, chuông giữ kích
              thước cố định cạnh bên — giống thanh tìm kiếm quen thuộc trên các app. */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              title="Tìm kiếm nhanh"
              className="flex-1 min-w-0 inline-flex items-center gap-2 h-9 px-3 rounded-full border border-amber-900/10 dark:border-amber-100/10 bg-white/80 dark:bg-stone-800/40 text-stone-400 dark:text-stone-500 text-[13px] font-semibold text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50"
            >
              <Search className="w-4 h-4 flex-shrink-0" strokeWidth={2.25} />
              <span className="truncate">Tìm kiếm...</span>
            </button>
            <NotificationSummary />
          </div>

          {/* Desktop: đủ chỗ để giữ mọi thứ trên một hàng ngang hàng với tiêu đề. */}
          <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              title="Tìm kiếm nhanh (Ctrl+K)"
              className="inline-flex items-center gap-2 h-9 pl-3 pr-2.5 rounded-full border border-amber-900/10 dark:border-amber-100/10 bg-white/80 dark:bg-stone-800/40 text-stone-400 dark:text-stone-500 text-[12.5px] font-semibold hover:bg-amber-50 dark:hover:bg-stone-800/80 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50"
            >
              <Search className="w-3.5 h-3.5" strokeWidth={2.25} />
              Tìm kiếm
              <kbd className="ml-1 text-[10px] font-bold border border-stone-300 dark:border-stone-600 rounded px-1 py-px">⌘K</kbd>
            </button>
            <NotificationSummary />
            <YearPicker />
          </div>
        </div>

        <div className={`transition-all duration-300 motion-reduce:transition-none ${scrolled ? "mt-2" : "mt-3.5"}`}>
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
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#1C1917] transition-colors" style={{ fontFamily: SYSTEM_FONT }}>
      <a
        href="#admin-main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-full focus:bg-amber-900 focus:text-amber-50 dark:focus:bg-amber-100 dark:focus:text-amber-950 focus:px-4 focus:py-2 focus:text-[13px] focus:font-bold"
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