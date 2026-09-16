/* eslint-disable react-refresh/only-export-components, react-hooks/preserve-manual-memoization, react-hooks/set-state-in-effect */
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { supabase } from "../../lib/supabase.js";
import { useToast } from "../../components/ui/ToastContext.jsx";
import { fetchTeacherContext, fetchClassStudents, fetchClassSummary, fetchPendingProfileRequests } from "./api.js";

const TeacherContext = createContext(null);

export function useTeacherContext() {
  const ctx = useContext(TeacherContext);
  if (!ctx) throw new Error("useTeacherContext phải được gọi bên trong <TeacherProvider>");
  return ctx;
}

/* ============================================================
   TeacherProvider — tải thông tin lớp chủ nhiệm + danh sách học sinh
   MỘT LẦN ở đây, mọi tab con (Tổng kết / Học sinh / Điểm danh / Nhập điểm)
   đều đọc chung qua useTeacherContext() thay vì mỗi tab tự fetch lại.
   ============================================================ */
export function TeacherProvider({ children }) {
  const { showToast } = useToast();

  const [loadingContext, setLoadingContext] = useState(true);
  const [context,        setContext]        = useState(null); // { teacherUsername, namHoc, lop }

  const [students,        setStudents]        = useState([]);
  const [loadingStudents, setLoadingStudents]  = useState(false);
  const [studentsInitialized, setStudentsInitialized] = useState(false);

  const [initialSummary, setInitialSummary] = useState(null); // { hocKyInt, data }

  // Yêu cầu thay đổi thông tin hồ sơ của học sinh
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingContext(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const authUser = session?.user;
        if (!authUser) throw new Error("Chưa đăng nhập");
        const ctx = await fetchTeacherContext(authUser.id);
        if (!cancelled) setContext(ctx);
      } catch (err) {
        console.error("fetchTeacherContext error:", err);
        if (!cancelled) showToast("Không tải được thông tin lớp phụ trách", "error");
      } finally {
        if (!cancelled) setLoadingContext(false);
      }
    })();
    return () => { cancelled = true; };
  }, [showToast]);

  const changeYear = useCallback(async (newYear) => {
    if (!newYear || newYear === context?.namHoc) return;
    
    setStudentsInitialized(false);
    setInitialSummary(null);
    setStudents([]);
    setPendingRequests([]);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const authUser = session?.user;
      if (!authUser) throw new Error("Chưa đăng nhập");
      
      const ctx = await fetchTeacherContext(authUser.id, newYear);
      setContext(ctx);
    } catch (err) {
      console.error("changeYear error:", err);
      showToast("Không chuyển được năm học", "error");
    }
  }, [context?.namHoc, showToast]);

  const reloadStudents = useCallback(async () => {
    if (!context?.lop) return;
    setLoadingStudents(true);
    try {
      const list = await fetchClassStudents(context.lop, context.namHoc);
      setStudents(list);

      const usernames = list.map((s) => s.username);
      const summaryHK1 = await fetchClassSummary(usernames, context.namHoc, 1);
      setInitialSummary({ hocKyInt: 1, data: summaryHK1 });
    } catch (err) {
      console.error("fetchClassStudents error:", err);
      showToast("Không tải được danh sách học sinh", "error");
    } finally {
      setLoadingStudents(false);
      setStudentsInitialized(true);
    }
  }, [context, showToast]);

  const refreshPendingRequests = useCallback(async () => {
    if (!context?.namHoc) return;
    setLoadingRequests(true);
    try {
      const data = await fetchPendingProfileRequests(context.namHoc);
      setPendingRequests(data);
    } catch (err) {
      console.error("fetchPendingProfileRequests error:", err);
    } finally {
      setLoadingRequests(false);
    }
  }, [context?.namHoc]);

  useEffect(() => { reloadStudents(); }, [reloadStudents]);
  useEffect(() => { refreshPendingRequests(); }, [refreshPendingRequests]);

  // Realtime subscription cho yêu cầu thay đổi hồ sơ
  useEffect(() => {
    const channel = supabase.channel("teacher_pcr_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "profile_change_requests" }, () => {
        refreshPendingRequests();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refreshPendingRequests]);

  const handleStudentSaved = useCallback((updated) => {
    setStudents((prev) => prev.map((s) => (s.username === updated.username ? { ...s, ...updated } : s)));
  }, []);

  const value = {
    loadingContext,
    context,
    students,
    loadingStudents,
    studentsInitialized,
    initialSummary,
    pendingRequests,
    pendingRequestsCount: pendingRequests.length,
    loadingRequests,
    refreshPendingRequests,
    reloadStudents,
    handleStudentSaved,
    changeYear,
  };

  return <TeacherContext.Provider value={value}>{children}</TeacherContext.Provider>;
}