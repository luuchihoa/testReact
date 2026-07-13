import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from "react";
import { useToast } from "../ui/ToastContext.jsx";
import { getCurrentNamHoc } from "./constants.js";
import {
  fetchAllTeachers,
  fetchAvailableNamHocList,
  fetchClassTeacherRows,
  fetchEnrollmentCounts,
  fetchTermLocks,
  fetchPendingDangKyCount,
  fetchPendingLienHeCount,
  fetchPendingArticlesCount,
  fetchExactRoleCounts,
} from "./dataLayer.js"

const AdminContext = createContext(null);

export function useAdminContext() {
  const ctx = useContext(AdminContext);
  if (!ctx) {
    throw new Error("useAdminContext() phải được gọi bên trong <AdminProvider> (tức trong /quan-tri)");
  }
  return ctx;
}

export function AdminProvider({ children }) {
  const { showToast } = useToast();

  const [namHoc, setNamHoc] = useState(() => getCurrentNamHoc());
  const [namHocList, setNamHocList] = useState([]);

  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [pendingDangKy, setPendingDangKy] = useState(0);
  const [roleCounts, setRoleCounts] = useState({ admin: 0, teacher: 0, student: 0, user: 0 });

  const refreshPendingDangKy = useCallback(async () => {
    try {
      setPendingDangKy(await fetchPendingDangKyCount());
    } catch (err) {
      console.error("load pending dang ky count error:", err);
    }
  }, []);

  const [pendingGopY, setPendingGopY] = useState(0);

  const refreshPendingGopY = useCallback(async () => {
    try { setPendingGopY(await fetchPendingLienHeCount()); } 
    catch (err) { console.error("load pending gop y count error:", err); }
  }, []);

  const [pendingBaiViet, setPendingBaiViet] = useState(0);

  const refreshPendingBaiViet = useCallback(async () => {
    try { setPendingBaiViet(await fetchPendingArticlesCount()); }
    catch (err) { console.error("load pending bai viet count error:", err); }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const list = await fetchAvailableNamHocList();
        setNamHocList(list);
      } catch (err) {
        console.error("load nam hoc list error:", err);
      }
    })();
    refreshPendingDangKy();
    refreshPendingGopY();
    refreshPendingBaiViet();
  }, [refreshPendingDangKy, refreshPendingGopY, refreshPendingBaiViet]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [teacherList, ctRows, enrollCounts, termLocks, counts] = await Promise.all([
        fetchAllTeachers(),
        fetchClassTeacherRows(namHoc),
        fetchEnrollmentCounts(namHoc),
        fetchTermLocks(namHoc),
        fetchExactRoleCounts(),
      ]);

      setRoleCounts(counts);

      const teacherByLop = {};
      ctRows.forEach((r) => { teacherByLop[r.lop] = r.teacher_username; });

      const lopSet = new Set([...Object.keys(teacherByLop), ...Object.keys(enrollCounts), ...Object.keys(termLocks)]);
      const teacherName = (username) => teacherList.find((u) => u.username === username)?.hoTen || username;
      const teacherTenThanh = (username) => teacherList.find((u) => u.username === username)?.tenThanh || "";

      const classList = Array.from(lopSet)
        .sort((a, b) => a.localeCompare(b, "vi"))
        .map((lop) => ({
          lop,
          teacherUsername: teacherByLop[lop] || null,
          teacherName:     teacherByLop[lop] ? teacherName(teacherByLop[lop]) : null,
          teacherTenThanh: teacherByLop[lop] ? teacherTenThanh(teacherByLop[lop]) : null,
          studentCount:    enrollCounts[lop] || 0,
          locks:           termLocks[lop] || {},
        }));
      setClasses(classList);
    } catch (err) {
      console.error("load admin data error:", err);
      showToast("Không tải được dữ liệu quản trị", "error");
    } finally {
      setLoading(false);
    }
  }, [namHoc, showToast]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const handleRoleChanged = useCallback((username, role) => {
    setUsers((prev) => prev.map((u) => (u.username === username ? { ...u, role } : u)));
  }, []);

  const value = useMemo(() => ({
    namHoc, setNamHoc, namHocList,
    roleCounts,
    classes, setClasses,
    loading, loadAll,
    showToast,
    handleRoleChanged,
    pendingDangKy, refreshPendingDangKy,
    pendingGopY, refreshPendingGopY,
    pendingBaiViet, refreshPendingBaiViet,
  }), [namHoc, namHocList, roleCounts, classes, loading, loadAll, showToast, handleRoleChanged, pendingDangKy, refreshPendingDangKy, pendingGopY, refreshPendingGopY, pendingBaiViet, refreshPendingBaiViet]);

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}