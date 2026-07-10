import React, { Suspense, useEffect, useRef, useState } from "react";
import { Navigate, NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard, UserCog, School, ClipboardCheck, BarChart3, Megaphone, FileCheck,
  ChevronDown, CalendarDays, Check,
} from "lucide-react";
import { supabase } from "../../lib/supabase.js";
import { AuthGateSkeleton, AdminTabSkeleton } from "../ui/Skeleton.jsx";
import { AdminProvider, useAdminContext } from "./AdminContext.jsx";
import { ACCENT, getCurrentNamHoc } from "./constants.js";

// San Francisco / Apple system font stack — falls back gracefully on
// non-Apple platforms to each OS's native system UI face.
const SYSTEM_FONT =
  "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Segoe UI', Roboto, sans-serif";

// ACCENT đến từ constants.js dưới dạng hex tĩnh, gán qua inline style nên
// không thể ăn theo class `dark:` của Tailwind. Class filter dưới đây bù lại
// bằng cách tăng sáng/tương phản nhẹ khi ở dark mode để chấm/nhãn accent vẫn
// nổi rõ trên nền tối, mà không cần đổi giá trị màu gốc.
const ACCENT_DARK_FILTER = "dark:brightness-125 dark:contrast-125";

export function RequireAdminRoute({ children }) {
  const [status, setStatus] = useState("checking"); // checking | ok | denied

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

  if (status === "checking") {
    return <AuthGateSkeleton />;
  }
  if (status === "denied") return <Navigate to="/" replace />;
  return children;
}

/* ============================================================
   TABBAR — mỗi mục là 1 route con thật (NavLink), thay cho useState("tab")
   cũ. Giúp bookmark / back-forward / refresh đều giữ đúng tab đang xem.

   Trang đã có nav riêng của site cố định ở ĐÁY màn hình trên mobile,
   nên KHÔNG đặt thêm thanh tab thứ hai ở đáy (sẽ chồng/che nhau).
   Thay vào đó dùng chung MỘT thanh segmented-pill cuộn ngang, dính
   ngay dưới tiêu đề trang — cho cả desktop lẫn mobile — với vùng
   chạm được nới rộng (44pt) ở màn hình nhỏ.
   ============================================================ */
const TABS = [
  { to: "tổng-quan",  label: "Tổng quan",  icon: LayoutDashboard },
  { to: "thông-báo",  label: "Thông báo",  icon: Megaphone },
  { to: "người-dùng", label: "Người dùng", icon: UserCog },
  { to: "lớp-học",    label: "Lớp học",    icon: School },
  { to: "sổ-điểm",    label: "Điểm & Chuyên cần", icon: ClipboardCheck },
  { to: "báo-cáo",    label: "Báo cáo",    icon: BarChart3 },
  { to: "bài-viết",   label: "Duyệt bài",  icon: FileCheck },
];

/* ------------------------------------------------------------
   YearPicker — dropdown kiểu Apple: nút kính-mờ mở menu nổi tự
   xây dựng (không dùng <select> gốc của trình duyệt), có dấu tick
   cho năm đang chọn và chấm nhỏ đánh dấu năm học hiện tại. Chiều
   cao nút đạt chuẩn 44pt để bấm chính xác trên di động, tự đóng
   khi bấm ra ngoài hoặc nhấn Esc.
------------------------------------------------------------- */
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
        className={`inline-flex items-center gap-2 h-11 sm:h-9 pl-3.5 pr-3 rounded-full border text-[13px] font-semibold transition-all duration-150 active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-neutral-900 ${
          open
            ? "border-transparent bg-stone-900 dark:bg-white text-white dark:text-stone-900 shadow-[0_2px_8px_rgba(0,0,0,0.12)]"
            : "border-stone-200/70 dark:border-white/10 bg-white/80 dark:bg-white/[0.06] text-stone-700 dark:text-neutral-200 shadow-sm dark:shadow-none backdrop-blur-sm md:hover:bg-white dark:md:hover:bg-white/10"
        }`}
        style={{ "--tw-ring-color": `${ACCENT}b3` }}
      >
        <CalendarDays className={`w-3.5 h-3.5 ${open ? "text-white dark:text-stone-900" : "text-stone-400 dark:text-neutral-500"}`} strokeWidth={2.25} />
        <span className="whitespace-nowrap">{namHoc}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? "rotate-180 text-white dark:text-stone-900" : "text-stone-400 dark:text-neutral-500"}`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute right-0 z-50 mt-2 min-w-[180px] rounded-2xl border border-stone-100 dark:border-white/10 bg-white/95 dark:bg-neutral-800/95 backdrop-blur-xl p-1.5 shadow-[0_12px_32px_rgba(0,0,0,0.14)] dark:shadow-[0_12px_32px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in-95 duration-150"
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
                className={`w-full flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-medium text-left transition-colors ${
                  active ? "bg-stone-100 dark:bg-white/10 text-stone-900 dark:text-neutral-50" : "text-stone-600 dark:text-neutral-300 md:hover:bg-stone-50 dark:md:hover:bg-white/[0.06]"
                }`}
              >
                <span className="flex items-center gap-2">
                  {nh}
                  {isCurrent(nh) && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${ACCENT_DARK_FILTER}`}
                      style={{ backgroundColor: ACCENT }}
                      title="Năm học hiện tại"
                    />
                  )}
                </span>
                {active && <Check className="w-3.5 h-3.5 text-stone-500 dark:text-neutral-400 flex-shrink-0" strokeWidth={2.5} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* Segmented pill nav — MỘT thanh duy nhất dùng chung cho mọi kích thước
   màn hình, dính ngay dưới large title (không fixed đáy để không đụng
   nav riêng của site). Trên mobile cuộn ngang, mỗi pill cao đủ 44pt và
   có snap để lướt bằng ngón tay cảm giác chắc tay như segmented control
   của iOS; trên desktop thu gọn lại thành pill nhỏ gọn như cũ. */
function TabNav() {
  return (
    <nav
      className="flex gap-1 bg-stone-100/80 dark:bg-white/[0.06] rounded-2xl p-1 overflow-x-auto snap-x snap-mandatory sm:snap-none w-full sm:w-fit [&::-webkit-scrollbar]:hidden"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      data-lenis-prevent
    >
      {TABS.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `snap-start flex-shrink-0 inline-flex items-center gap-1.5 h-11 sm:h-auto px-4 sm:px-3.5 sm:py-1.5 rounded-xl text-[13px] sm:text-[12.5px] font-semibold whitespace-nowrap transition-all duration-200 motion-reduce:transition-none active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/70 dark:focus-visible:ring-red-400/70 ${
              isActive
                ? "bg-white dark:bg-neutral-800 text-red-600 dark:text-red-400 shadow-[0_1px_3px_rgba(0,0,0,0.08)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.4)]"
                : "text-stone-500 dark:text-neutral-400 md:hover:text-stone-700 dark:md:hover:text-neutral-100"
            }`
          }
        >
          <Icon className="w-4 h-4 sm:w-3.5 sm:h-3.5 flex-shrink-0" strokeWidth={2.1} /> {label}
        </NavLink>
      ))}
    </nav>
  );
}

function AdminHeader() {
  const [scrolled, setScrolled] = useState(false);

  // "Large title" kiểu iOS: to & đậm khi ở đầu trang, tự thu gọn thành 1
  // dòng tiêu đề nhỏ khi cuộn xuống — cùng logic co giãn của UINavigationBar.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className="sticky top-16 z-30 bg-[#faf8f5]/90 dark:bg-neutral-950/90 backdrop-blur-xl border-b border-stone-200/60 dark:border-white/10 transition-colors"
      style={{ fontFamily: SYSTEM_FONT }}
    >
      <div className={`max-w-6xl mx-auto px-4 sm:px-6 transition-all duration-300 motion-reduce:transition-none ${scrolled ? "py-2.5" : "py-4"}`}>
        <div className="flex items-start sm:items-end justify-between gap-3">
          <div className="min-w-0">
            <p
              className={`font-bold uppercase tracking-widest overflow-hidden transition-all duration-300 motion-reduce:transition-none ${ACCENT_DARK_FILTER} ${
                scrolled ? "max-h-0 opacity-0" : "max-h-5 opacity-100 mb-0.5"
              }`}
              style={{ color: ACCENT, fontSize: "11px" }}
            >
              Quản trị hệ thống
            </p>
            <h1
              className={`font-bold text-stone-900 dark:text-neutral-50 tracking-tight truncate transition-all duration-300 motion-reduce:transition-none ${
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
    <div className="min-h-screen bg-[#faf8f5] dark:bg-neutral-950 transition-colors" style={{ fontFamily: SYSTEM_FONT }}>
      <AdminHeader />
      {/* Không còn tab bar riêng ở đáy trên mobile — nav đáy của site đã lo
          phần đó, nên chỉ cần padding thường, không phải chừa chỗ cho tab bar
          thứ hai nữa. */}
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