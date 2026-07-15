import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { supabase } from "../../lib/supabase.js";
import { useToast } from "../ui/ToastContext.jsx";
import { fetchTeacherContext, fetchClassStudents, fetchClassSummary } from "./api.js";

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
  // Đánh dấu đã tải xong roster LẦN ĐẦU (kể cả khi lớp rỗng) — dùng để chặn
  // không cho các tab con render với students=[] rồi phải tự fetch lại lần
  // 2 khi roster thật về, gây nháy loading 2 lần.
  const [studentsInitialized, setStudentsInitialized] = useState(false);

  // Tổng kết Học Kỳ I (tab mặc định) tải SẴN cùng lúc với roster, đưa xuống
  // cho SummaryTab dùng ngay khi mount lần đầu — để nó không phải tự fetch
  // + tự hiện thêm 1 spinner riêng ngay sau khi roster vừa xong.
  const [initialSummary, setInitialSummary] = useState(null); // { hocKyInt, data }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingContext(true);
      try {
        // getSession() đọc phiên đã lưu cục bộ (không gọi mạng) — nhanh hơn
        // getUser(), và ở đây chỉ cần user id để tra cứu, không cần làm mới
        // token.
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

  useEffect(() => { reloadStudents(); }, [reloadStudents]);

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
    reloadStudents,
    handleStudentSaved,
  };

  return <TeacherContext.Provider value={value}>{children}</TeacherContext.Provider>;
}