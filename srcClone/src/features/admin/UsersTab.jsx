import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ChevronDown, Users as UsersIcon, ArrowLeft, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useAdminContext } from "./AdminContext.jsx";
import { TableSkeleton, Spinner } from "../../components/ui/Skeleton.jsx";
import {
  ROLE_OPTIONS, ROLE_LABELS_VI, ROLE_BADGE, AVATAR_FALLBACK,
  DOWNGRADE_ROLES, handleAvatarError,
} from "./constants.js";
import { updateUserRole, fetchUsersPaginated } from "./dataLayer.js";

// Hằng số Easing chuẩn
const APPLE_EASE = [0.16, 1, 0.3, 1];

/* ============================================================
   COMPONENT TÁCH RỜI (Tránh Anti-pattern Unmount/Remount)
   ============================================================ */
const RoleSelect = React.memo(({ userRole, username, isSaving, compact, onChange }) => (
  <div className="relative inline-block">
    <select
      value={userRole}
      disabled={isSaving}
      onChange={(e) => onChange(username, e.target.value, userRole)}
      className={`appearance-none rounded-full border border-black/5 dark:border-white/5 px-2 md:px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-center [text-align-last:center]
        focus:outline-none focus:ring-2 focus:ring-amber-900/30 dark:focus:ring-amber-500/30
        disabled:opacity-50 transition-shadow
        dark:brightness-[1.1] dark:contrast-125
        ${ROLE_BADGE[userRole] || ROLE_BADGE.user} ${compact ? "w-full" : ""}`}
    >
      {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{ROLE_LABELS_VI[r]}</option>)}
    </select>
    <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
    {isSaving && (
      <Spinner className="w-3.5 h-3.5 absolute -right-6 top-1/2 -translate-y-1/2" />
    )}
  </div>
));

export default function UsersTab() {
  const { classes, showToast, handleRoleChanged } = useAdminContext();
  const navigate = useNavigate();
  const currentUsername = useMemo(() => localStorage.getItem("username") || "", []);

  // Các state quản lý phân trang và dữ liệu
  const [localUsers, setLocalUsers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 50;
  const [isFetching, setIsFetching] = useState(true);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [savingUser, setSavingUser] = useState(null);

  // Debounce search: Chờ 500ms sau khi ngừng gõ mới cập nhật từ khóa để gọi API
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Quay về trang 1 khi tìm kiếm mới
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset trang về 1 khi đổi bộ lọc Vai trò
  useEffect(() => {
    setPage(1);
  }, [roleFilter]);

  // Fetch dữ liệu mỗi khi đổi trang, đổi bộ lọc, hoặc từ khóa debounce thay đổi
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsFetching(true);
      try {
        const { users: fetchedUsers, totalCount: count } = await fetchUsersPaginated(
          page, pageSize, debouncedSearch, roleFilter
        );
        if (!cancelled) {
          setLocalUsers(fetchedUsers);
          setTotalCount(count);
        }
      } catch (err) {
        console.error("fetch users error:", err);
        if (!cancelled) showToast("Lỗi khi tải danh sách người dùng", "error");
      } finally {
        if (!cancelled) setIsFetching(false);
      }
    })();
    return () => { cancelled = true; };
  }, [page, pageSize, debouncedSearch, roleFilter, showToast]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const homeroomLopOf = useCallback(
    (username) => classes.find((c) => c.teacherUsername === username)?.lop || null,
    [classes]
  );

  const handleSelfDemoted = useCallback(() => {
    localStorage.removeItem("role");
    navigate("/", { replace: true });
  }, [navigate]);

  // Tối ưu hoá bộ nhớ: Bọc logic đổi quyền bằng useCallback
  const handleRoleChange = useCallback(async (username, newRole, currentRole) => {
    if (currentRole === "teacher" && newRole !== "teacher") {
      const lop = homeroomLopOf(username);
      if (lop) {
        showToast(`Không thể đổi vai trò: đang phụ trách lớp "${lop}". Hãy gỡ khỏi lớp ở tab Lớp học trước.`, "error");
        return;
      }
    }

    const isDowngrade = DOWNGRADE_ROLES.has(currentRole) && !DOWNGRADE_ROLES.has(newRole);
    if (isDowngrade && username !== currentUsername) {
      const confirmed = window.confirm(
        `Đổi vai trò của "${username}" từ ${ROLE_LABELS_VI[currentRole]} xuống ${ROLE_LABELS_VI[newRole]}?`
      );
      if (!confirmed) return;
    }

    const isSelfDemote = username === currentUsername && newRole !== "admin";
    if (isSelfDemote) {
      const confirmed = window.confirm(
        "Bạn sắp bỏ quyền quản trị của chính mình. Sau khi lưu, bạn sẽ bị đưa ra khỏi trang này ngay lập tức. Vẫn tiếp tục?"
      );
      if (!confirmed) return;
    }

    setSavingUser(username);
    try {
      await updateUserRole(username, newRole);
      
      // Cập nhật local state ngay lập tức để giao diện phản hồi
      setLocalUsers((prev) => prev.map(u => u.username === username ? { ...u, role: newRole } : u));
      
      if (handleRoleChanged) handleRoleChanged(username, newRole);
      showToast("Đã cập nhật vai trò", "success");

      if (isSelfDemote) {
        handleSelfDemoted();
        return;
      }
    } catch (err) {
      console.error("update role error:", err);
      showToast(err?.message || "Cập nhật vai trò thất bại", "error");
    } finally {
      setSavingUser(null);
    }
  }, [homeroomLopOf, currentUsername, handleRoleChanged, handleSelfDemoted, showToast]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: APPLE_EASE }}
      className="bg-white/80 dark:bg-[#1C1917]/80 backdrop-blur-xl rounded-[28px] border border-amber-900/10 dark:border-amber-100/10 shadow-sm overflow-hidden flex flex-col"
    >
      {/* Thanh tìm kiếm + lọc */}
      <div className="flex flex-col sm:flex-row gap-4 px-5 py-5 border-b border-amber-900/10 dark:border-amber-100/10">
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-amber-900/50 dark:text-amber-100/50 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên hoặc username…"
            className="w-full rounded-xl border border-amber-900/10 dark:border-amber-100/10 bg-white/50 dark:bg-stone-900/50 pl-11 pr-4 py-3 text-[14px] font-medium text-amber-950 dark:text-amber-50 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-900/30 dark:focus:ring-amber-500/30 transition-shadow"
          />
        </div>
        <div className="relative sm:w-56">
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
            className="appearance-none w-full rounded-xl border border-amber-900/10 dark:border-amber-100/10 bg-white/50 dark:bg-stone-900/50 px-4 py-3 pr-10 text-[14px] font-bold text-amber-950 dark:text-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-900/30 dark:focus:ring-amber-500/30 transition-shadow">
            <option value="all">Tất cả vai trò</option>
            {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{ROLE_LABELS_VI[r]}</option>)}
          </select>
          <ChevronDown className="w-5 h-5 text-amber-900/50 dark:text-amber-100/50 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {isFetching ? (
        <div className="p-5">
          <TableSkeleton rows={7} columns={1} />
        </div>
      ) : localUsers.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-20 px-6 text-center">
          <div className="w-14 h-14 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center mb-1">
            <UsersIcon className="w-6 h-6 text-amber-700 dark:text-amber-400" strokeWidth={2} />
          </div>
          <p className="text-[15px] font-bold text-amber-950 dark:text-amber-50">Không tìm thấy người dùng nào</p>
          <p className="text-[13.5px] font-medium text-stone-500 dark:text-stone-400">Vui lòng thử lại với bộ lọc khác.</p>
        </div>
      ) : (
        <>
          {/* ---- Mobile: danh sách thẻ ---- */}
          <div className="sm:hidden divide-y divide-amber-900/5 dark:divide-amber-100/5 max-h-[65vh] overflow-auto" data-lenis-prevent>
            {localUsers.map((u) => (
              <div key={u.username} className="flex items-start gap-3.5 px-5 py-4 transition-colors duration-300 active:bg-amber-50/50 dark:active:bg-amber-900/10">
                
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white dark:border-stone-800 flex-shrink-0 bg-stone-100 shadow-sm mt-0.5">
                  <img src={u.avatar || AVATAR_FALLBACK} alt="" className="w-full h-full object-cover" onError={handleAvatarError} />
                </div>
                
                <div className="min-w-0 flex-1">
                  <p className="text-[14.5px] font-bold text-amber-950 dark:text-amber-50 tracking-tight leading-snug break-words">
                    {u.tenThanh ? <span className="text-stone-500 font-medium mr-1">{u.tenThanh}</span> : ""}{u.hoTen || u.username}
                    {u.username === currentUsername && (
                      <span className="ml-1.5 inline-block text-[10px] font-bold uppercase tracking-wider text-red-500 dark:text-red-400 align-middle">(Bạn)</span>
                    )}
                  </p>
                  <p className="text-[12.5px] font-medium text-stone-500 dark:text-stone-400 mt-1">
                    {u.trangThai}
                  </p>
                </div>
                
                <div className="flex-shrink-0 ml-2">
                  <RoleSelect 
                    userRole={u.role} 
                    username={u.username} 
                    isSaving={savingUser === u.username} 
                    compact={true} 
                    onChange={handleRoleChange} 
                  />
                </div>
              </div>
            ))}
          </div>

          {/* ---- Desktop / tablet: bảng ---- */}
          <div className="hidden sm:block overflow-auto max-h-[65vh] px-0" data-lenis-prevent>
            <table className="w-full text-sm border-collapse min-w-[600px]">
              <thead>
                <tr className="text-[11px] font-bold uppercase tracking-wider text-amber-800/70 dark:text-amber-400/70">
                  <th className="text-left px-5 py-4 sticky top-0 bg-white/90 dark:bg-[#1C1917]/90 backdrop-blur-xl z-10 border-b border-amber-900/10 dark:border-amber-100/10">Người dùng</th>
                  <th className="text-center px-4 py-4 sticky top-0 bg-white/90 dark:bg-[#1C1917]/90 backdrop-blur-xl z-10 border-b border-amber-900/10 dark:border-amber-100/10">Vai trò</th>
                  <th className="text-center px-4 py-4 sticky top-0 bg-white/90 dark:bg-[#1C1917]/90 backdrop-blur-xl z-10 border-b border-amber-900/10 dark:border-amber-100/10">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-900/5 dark:divide-amber-100/5">
                {localUsers.map((u) => (
                  <tr key={u.username} className="transition-colors duration-300 md:hover:bg-amber-50/40 dark:md:hover:bg-amber-900/10">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-4">
                        <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-white dark:border-stone-800 flex-shrink-0 bg-stone-100 shadow-sm">
                          <img src={u.avatar || AVATAR_FALLBACK} alt="" className="w-full h-full object-cover" onError={handleAvatarError} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[14px] font-bold text-amber-950 dark:text-amber-50 tracking-tight leading-snug">
                            {u.tenThanh ? <span className="text-stone-500 font-medium mr-1">{u.tenThanh}</span> : ""}{u.hoTen || u.username}
                            {u.username === currentUsername && (
                              <span className="ml-1.5 inline-block text-[10px] font-bold uppercase tracking-wider text-red-500 dark:text-red-400 align-middle">(Bạn)</span>
                            )}
                          </p>
                          <p className="text-[12.5px] font-medium text-stone-500 dark:text-stone-400 mt-0.5">{u.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <RoleSelect 
                        userRole={u.role} 
                        username={u.username} 
                        isSaving={savingUser === u.username} 
                        onChange={handleRoleChange} 
                      />
                    </td>
                    <td className="px-4 py-3.5 text-center text-[13px] font-medium text-stone-500 dark:text-stone-400">{u.trangThai}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ---- Thanh Phân Trang (Pagination) ---- */}
          <div className="flex items-center justify-between px-5 py-4 border-t border-amber-900/10 dark:border-amber-100/10 bg-[#FDFBF7]/50 dark:bg-stone-900/50">
            {/* Ẩn dòng tổng số trên mobile, chỉ hiện từ màn hình sm trở lên */}
            <span className="hidden sm:block text-[13px] font-medium text-stone-500 dark:text-stone-400">
              Tổng <strong className="text-amber-950 dark:text-amber-50 font-bold">{totalCount}</strong> người dùng
            </span>
            
            {/* Chuyển thành w-full trên mobile để cụm phân trang chiếm hết chiều ngang */}
            <div className="flex items-center w-full sm:w-auto gap-2 sm:gap-3">
              <button
                type="button"
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                // Thêm flex-1 để tự động giãn đều 1/3 trên mobile
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-[13px] font-bold bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-black/5 dark:border-white/5 transition-all duration-300 active:scale-[0.95] md:hover:bg-stone-200 dark:md:hover:bg-stone-700 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="w-4 h-4" /> Trước
              </button>
              
              {/* Thêm flex-1 để chiếm 1/3 ở giữa */}
              <span className="flex-1 sm:flex-none text-[12px] font-bold uppercase tracking-wider text-amber-800/70 dark:text-amber-400/70 min-w-[70px] text-center">
                Trang {page} / {totalPages}
              </span>
              
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
                // Thêm flex-1 để giãn đều 1/3 phần bên phải
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-[13px] font-bold bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-black/5 dark:border-white/5 transition-all duration-300 active:scale-[0.95] md:hover:bg-stone-200 dark:md:hover:bg-stone-700 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Sau <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}