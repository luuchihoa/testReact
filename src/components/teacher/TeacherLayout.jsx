import React, { Suspense, useEffect, useState } from "react";
import { Navigate, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, ClipboardList, CalendarCheck, Table, ChevronLeft, GraduationCap, Users,
} from "lucide-react";
import { supabase } from "../../lib/supabase.js";
// Thay đổi import: lấy thêm Bone và TableSkeleton
import { AuthGateSkeleton, TableSkeleton, Bone } from "../ui/Skeleton.jsx";
import { TeacherProvider, useTeacherContext } from "./TeacherContext.jsx";
import { ACCENT } from "./constants.js";
import { getCurrentNamHoc } from "./utils.js";

export function RequireTeacherRoute({ children }) {
  const cachedRole = typeof window !== "undefined" ? localStorage.getItem("role") : null;
  const [status, setStatus] = useState(cachedRole === "teacher" ? "ok" : "checking");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const authUser = session?.user;
        if (!authUser) { if (!cancelled) setStatus("denied"); return; }

        const { data, error } = await supabase
          .from("users")
          .select("role")
          .eq("auth_id", authUser.id)
          .maybeSingle();

        if (cancelled) return;

        if (error || !data || data.role !== "teacher") {
          localStorage.removeItem("role");
          setStatus("denied");
        } else {
          localStorage.setItem("role", "teacher");
          setStatus("ok");
        }
      } catch (err) {
        console.error("RequireTeacherRoute check error:", err);
        if (!cancelled && cachedRole !== "teacher") setStatus("denied");
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

const TABS = [
  { to: "tổng-quan", label: "Tổng kết lớp",   icon: LayoutDashboard },
  { to: "học-sinh",  label: "Học sinh",       icon: ClipboardList },
  { to: "điểm-danh", label: "Điểm danh nhanh",icon: CalendarCheck },
  { to: "nhập-điểm", label: "Nhập điểm nhanh",icon: Table },
];

function TeacherHeader({ lop, namHoc, studentCount, studentsInitialized }) {
  return (
    <div className="sticky top-16 z-30 bg-[#faf8f5]/95 backdrop-blur-sm border-b border-stone-200/60 px-4 sm:px-6 py-3 sm:py-4">
      <div className="max-w-6xl mx-auto flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest" style={{ color: ACCENT }}>Giáo viên chủ nhiệm</p>
            <h1 className="text-base sm:text-xl font-bold text-stone-900 truncate">Lớp {lop} · {namHoc}</h1>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-400 flex-shrink-0">
            <Users className="w-3.5 h-3.5" />
            {/* NÂNG CẤP: Dùng Bone mini thay cho Spinner để đồng bộ với thanh xương */}
            {studentsInitialized ? (
              <span>{studentCount}</span>
            ) : (
              <Bone className="h-3 w-5 rounded-md" />
            )}
            <span className="hidden sm:inline">học sinh</span>
          </span>
        </div>

        <nav className="tk-tabbar flex gap-1.5 bg-stone-100 rounded-xl p-1 overflow-x-auto w-full sm:w-fit" data-lenis-prevent>
          {TABS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex-shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 sm:py-1.5 rounded-lg text-[12px] font-semibold transition-colors whitespace-nowrap ${
                  isActive ? "bg-white text-[#FF6B35] shadow-sm" : "text-stone-500"
                }`
              }
            >
              <Icon className="w-3.5 h-3.5" /> {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}

function TeacherLayoutInner() {
  const navigate = useNavigate();
  const { loadingContext, context, students, studentsInitialized } = useTeacherContext();

  // Nếu thông tin lớp học tổng quát chưa về, hiển thị AuthGateSkeleton một lần duy nhất 
  if (loadingContext) {
    return <AuthGateSkeleton />;
  }

  if (!context?.lop) {
    return (
      <div className="min-h-[60vh] w-full flex flex-col items-center justify-center gap-3 px-4 text-center">
        <GraduationCap className="w-10 h-10 text-stone-300" />
        <p className="text-stone-500 text-sm max-w-xs">
          Bạn chưa được phân công chủ nhiệm lớp nào trong năm học {getCurrentNamHoc()}.
        </p>
        <button type="button" onClick={() => navigate("/")}
          className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold hover:underline" style={{ color: ACCENT }}>
          <ChevronLeft className="w-4 h-4" /> Về trang chủ
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <style>{`
        .tk-tabbar::-webkit-scrollbar { display: none; }
        .tk-tabbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      
      {/* Header thật cố định hoàn toàn */}
      <TeacherHeader
        lop={context.lop}
        namHoc={context.namHoc}
        studentCount={students.length}
        studentsInitialized={studentsInitialized}
      />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <Suspense fallback={<TableSkeleton rows={6} columns={6} />}>
          <Outlet />
        </Suspense>
      </div>
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