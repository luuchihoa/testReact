import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from "react";
import { useToast } from "../ui/ToastContext.jsx";
import { getCurrentNamHoc } from "./constants.js";
import {
  fetchAllUsers,
  fetchAvailableNamHocList,
  fetchClassTeacherRows,
  fetchEnrollmentCounts,
  fetchTermLocks,
  fetchPendingDangKyCount,
  fetchPendingLienHeCount,
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

  // Mặc định luôn ưu tiên năm học hiện tại (getCurrentNamHoc), nhưng admin có
  // thể chuyển sang năm khác nếu DB có nhiều năm học.
  const [namHoc, setNamHoc] = useState(() => getCurrentNamHoc());
  const [namHocList, setNamHocList] = useState([]);

  const [users, setUsers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [pendingDangKy, setPendingDangKy] = useState(0);

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

  // Tải danh sách năm học 1 lần khi vào trang — không phụ thuộc namHoc đang
  // chọn, vì cần biết TẤT CẢ năm học sẵn có để hiển thị đủ trong <select>.
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
  }, [refreshPendingDangKy, refreshPendingGopY]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [userList, ctRows, enrollCounts, termLocks] = await Promise.all([
        fetchAllUsers(),
        fetchClassTeacherRows(namHoc),
        fetchEnrollmentCounts(namHoc),
        fetchTermLocks(namHoc),
      ]);
      setUsers(userList);

      const teacherByLop = {};
      ctRows.forEach((r) => { teacherByLop[r.lop] = r.teacher_username; });

      const lopSet = new Set([...Object.keys(teacherByLop), ...Object.keys(enrollCounts), ...Object.keys(termLocks)]);
      const teacherName = (username) => userList.find((u) => u.username === username)?.hoTen || username;

      const classList = Array.from(lopSet)
        .sort((a, b) => a.localeCompare(b, "vi"))
        .map((lop) => ({
          lop,
          teacherUsername: teacherByLop[lop] || null,
          teacherName:     teacherByLop[lop] ? teacherName(teacherByLop[lop]) : null,
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

  // Cập nhật lạc quan sau khi đổi role 1 user tại UsersTab — tránh phải
  // loadAll() lại toàn bộ chỉ vì đổi 1 dòng.
  const handleRoleChanged = useCallback((username, role) => {
    setUsers((prev) => prev.map((u) => (u.username === username ? { ...u, role } : u)));
  }, []);

  const value = useMemo(() => ({
    namHoc, setNamHoc, namHocList,
    users, setUsers,
    classes, setClasses,
    loading, loadAll,
    showToast,
    handleRoleChanged,
    pendingDangKy, refreshPendingDangKy,
    pendingGopY, refreshPendingGopY,
  }), [namHoc, namHocList, users, classes, loading, loadAll, showToast, handleRoleChanged, pendingDangKy, refreshPendingDangKy, pendingGopY, refreshPendingGopY]);

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}