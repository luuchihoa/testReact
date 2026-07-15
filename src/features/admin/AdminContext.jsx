import React, { createContext, useContext, useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useToast } from "../../components/ui/ToastContext.jsx";
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
} from "./dataLayer.js";

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

  /* ==========================================================
     1. TẠO HÀM TOAST ỔN ĐỊNH BẰNG REF (Chống bẫy dependency)
     ========================================================== */
  const toastRef = useRef(showToast);
  useEffect(() => {
    toastRef.current = showToast;
  }, [showToast]);

  const stableShowToast = useCallback((msg, type) => {
    if (toastRef.current) toastRef.current(msg, type);
  }, []);

  const [namHoc, setNamHoc] = useState(() => getCurrentNamHoc());
  const [namHocList, setNamHocList] = useState([]);

  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [pendingDangKy, setPendingDangKy] = useState(0);
  const [roleCounts, setRoleCounts] = useState({ admin: 0, teacher: 0, student: 0, user: 0 });

  const refreshPendingDangKy = useCallback(async () => {
    try { setPendingDangKy(await fetchPendingDangKyCount()); } 
    catch (err) { console.error("load pending dang ky count error:", err); }
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

      setRoleCounts((prev) => 
        JSON.stringify(prev) === JSON.stringify(counts) ? prev : counts
      );

      // 1. Dùng mảng để lưu danh sách teacher_username cho mỗi lớp
      const teachersByLop = {};
      ctRows.forEach((r) => { 
        if (!teachersByLop[r.lop]) {
          teachersByLop[r.lop] = [];
        }
        teachersByLop[r.lop].push(r.teacher_username); 
      });

      const lopSet = new Set([
        ...Object.keys(teachersByLop), 
        ...Object.keys(enrollCounts), 
        ...Object.keys(termLocks)
      ]);

      // Hàm helper ghép "Tên Thánh + Họ Tên"
      const getFullTeacherName = (username) => {
        const user = teacherList.find((u) => u.username === username);
        if (!user) return username; // Fallback
        
        const tenThanh = user.ten_thanh ? `${user.ten_thanh} ` : "";
        const hoVaTen = user.ho_va_ten || username;
        return `${tenThanh}${hoVaTen}`;
      };

      const classList = Array.from(lopSet)
        .sort((a, b) => a.localeCompare(b, "vi"))
        .map((lop) => {
          const usernames = teachersByLop[lop] || [];
          
          // 2. Chuyển mảng username thành mảng Tên đầy đủ, sau đó nối bằng " & "
          const displayTeacherName = usernames.length > 0 
            ? usernames.map(getFullTeacherName).join(" & ") 
            : "— Chưa có —";

          return {
            lop,
            teacherUsernames: usernames, // Giữ lại mảng gốc để dùng cho logic xử lý (nếu cần)
            displayTeacherName,          // Chuỗi hiển thị: "Giuse A & Maria B"
            studentCount: enrollCounts[lop] || 0,
            locks: termLocks[lop] || {},
          };
        });

      setClasses((prev) => 
        JSON.stringify(prev) === JSON.stringify(classList) ? prev : classList
      );

    } catch (err) {
      console.error("load admin data error:", err);
      stableShowToast("Không tải được dữ liệu quản trị", "error");
    } finally {
      setLoading(false);
    }
  }, [namHoc, stableShowToast]);
  useEffect(() => { loadAll(); }, [loadAll]);

  /* ==========================================================
     3. SỬA LỖI CRASH: Thay vì gọi hàm setUsers không tồn tại, 
     ta cập nhật lại tổng số Role khi có quyền bị thay đổi
     ========================================================== */
  const handleRoleChanged = useCallback(() => {
    fetchExactRoleCounts()
      .then(counts => {
        setRoleCounts(prev => JSON.stringify(prev) === JSON.stringify(counts) ? prev : counts);
      })
      .catch(console.error);
  }, []);

  const value = useMemo(() => ({
    namHoc, setNamHoc, namHocList,
    roleCounts,
    classes, setClasses,
    loading, loadAll,
    showToast: stableShowToast, // Truyền xuống hàm đã bọc an toàn
    handleRoleChanged,
    pendingDangKy, refreshPendingDangKy,
    pendingGopY, refreshPendingGopY,
    pendingBaiViet, refreshPendingBaiViet,
  }), [
    namHoc, namHocList, roleCounts, classes, loading, loadAll, 
    stableShowToast, handleRoleChanged, pendingDangKy, 
    refreshPendingDangKy, pendingGopY, refreshPendingGopY, 
    pendingBaiViet, refreshPendingBaiViet
  ]);

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}