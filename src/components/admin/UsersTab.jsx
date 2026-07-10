import React, { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ChevronDown, Users as UsersIcon } from "lucide-react";
import { Spinner } from "../ui/StudentShared.jsx";
import { useAdminContext } from "./AdminContext.jsx";
import { TableSkeleton } from "../ui/Skeleton.jsx";
import {
  ROLE_OPTIONS, ROLE_LABELS_VI, ROLE_BADGE, AVATAR_FALLBACK,
  DOWNGRADE_ROLES, handleAvatarError,
} from "./constants.js";
import { updateUserRole } from "./dataLayer.js";

/* ============================================================
   TAB: NGƯỜI DÙNG (module B)
   Logic giữ nguyên 100% so với UsersTab cũ trong AdminView.jsx —
   chỉ đổi từ nhận props sang đọc/ghi qua AdminContext. Phần tự bảo vệ khi
   admin tự hạ quyền của chính mình (handleSelfDemoted) trước đây nằm ở
   component gốc AdminView, nay chuyển hẳn vào đây vì chỉ tab này cần.

   UI note: giao diện được làm lại theo tinh thần Apple HIG — bo góc lớn,
   viền mảnh, blur nền, chuyển động nhẹ, và hỗ trợ Dark Mode qua class
   `dark:` của Tailwind (kích hoạt khi phần tử cha có class `dark`, ví dụ
   <html class="dark">). Trên mobile (< sm), bảng được thay bằng danh sách
   thẻ (card list) để dễ chạm và không cần cuộn ngang.
   ============================================================ */
export default function UsersTab() {
  const { users, classes, loading, showToast, handleRoleChanged } = useAdminContext();
  const navigate = useNavigate();
  const currentUsername = useMemo(() => localStorage.getItem("username") || "", []);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [savingUser, setSavingUser] = useState(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      if (roleFilter !== "all" && u.role !== roleFilter) return false;
      if (!q) return true;
      return (u.hoTen || "").toLowerCase().includes(q) || (u.username || "").toLowerCase().includes(q);
    });
  }, [users, search, roleFilter]);

  // Lớp mà 1 giáo lý viên đang phụ trách — dùng để chặn đổi role gây "mồ côi"
  // dữ liệu trong class_teachers (lớp vẫn hiển thị GLV cũ dù người đó
  // không còn role teacher). 1 lớp có thể có nhiều GLV nên phải tìm trong
  // mảng c.teachers, không so sánh trực tiếp 1 username như trước.
  const homeroomLopOf = useCallback(
    (username) => classes.find((c) => c.teachers.some((t) => t.username === username))?.lop || null,
    [classes]
  );

  // Gọi ngay sau khi admin tự hạ quyền của chính mình: xóa cache role để
  // RequireAdminRoute không còn coi session này là admin, rồi điều hướng
  // ra khỏi trang ngay lập tức — tránh admin thao tác tiếp trên quyền đã mất
  // hiệu lực trong DB nhưng chưa được UI phản ánh.
  const handleSelfDemoted = useCallback(() => {
    localStorage.removeItem("role");
    navigate("/", { replace: true });
  }, [navigate]);

  const handleRoleChange = async (username, newRole, currentRole) => {
    // Giáo lý viên đang phụ trách 1 lớp -> phải gỡ ở tab Lớp học trước,
    // tránh để lại bản ghi class_teachers trỏ đến 1 tài khoản không còn là teacher.
    if (currentRole === "teacher" && newRole !== "teacher") {
      const lop = homeroomLopOf(username);
      if (lop) {
        showToast(`Không thể đổi vai trò: đang phụ trách lớp "${lop}". Hãy gỡ khỏi lớp ở tab Lớp học trước.`, "error");
        return;
      }
    }

    // Đổi role từ admin/teacher xuống thấp hơn ảnh hưởng trực tiếp đến
    // quyền truy cập của người khác -> xác nhận thêm 1 bước, tránh bấm
    // nhầm trên <select> khi đang lướt danh sách dài.
    const isDowngrade = DOWNGRADE_ROLES.has(currentRole) && !DOWNGRADE_ROLES.has(newRole);
    if (isDowngrade && username !== currentUsername) {
      const confirmed = window.confirm(
        `Đổi vai trò của "${username}" từ ${ROLE_LABELS_VI[currentRole]} xuống ${ROLE_LABELS_VI[newRole]}?`
      );
      if (!confirmed) return;
    }

    // Tự bảo vệ: admin đổi role của chính mình sang role khác sẽ mất quyền
    // truy cập trang này ngay lập tức -> xác nhận lại trước khi thực hiện.
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
      handleRoleChanged(username, newRole);
      showToast("Đã cập nhật vai trò", "success");

      // Thu hồi quyền ngay lập tức thay vì chờ reload/điều hướng lần sau mới
      // bị RequireAdminRoute chặn — tránh admin thao tác tiếp trên session
      // đã hết quyền thực tế trong DB.
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
  };

  // Badge vai trò dùng chung cho cả 2 layout (card mobile + table desktop).
  // ROLE_BADGE đến từ constants.js nên không tự có biến thể dark; thêm
  // filter sáng/tương phản nhẹ để badge vẫn đọc được trên nền tối.
  const RoleSelect = ({ u, compact }) => (
    <div className="relative inline-block">
      <select
        value={u.role}
        disabled={savingUser === u.username}
        onChange={(e) => handleRoleChange(u.username, e.target.value, u.role)}
        className={`appearance-none rounded-full border-none pl-3 pr-7 py-1.5 text-[12px] font-semibold tracking-tight
          focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400
          disabled:opacity-50 transition-shadow
          dark:brightness-[1.35] dark:contrast-125 dark:saturate-150
          ${ROLE_BADGE[u.role] || ROLE_BADGE.user} ${compact ? "w-full" : ""}`}
      >
        {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{ROLE_LABELS_VI[r]}</option>)}
      </select>
      <ChevronDown className="w-3 h-3 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
      {savingUser === u.username && (
        <Spinner className="w-3.5 h-3.5 absolute -right-5 top-1/2 -translate-y-1/2" />
      )}
    </div>
  );

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-stone-100 dark:border-white/10 shadow-sm dark:shadow-none overflow-hidden transition-colors">
      {/* Thanh tìm kiếm + lọc — sticky, nền mờ kiểu Apple */}
      <div className="sticky top-0 z-20 flex flex-col sm:flex-row gap-2.5 px-4 sm:px-5 py-3.5 border-b border-stone-100 dark:border-white/10 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 dark:text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên hoặc username…"
            className="w-full rounded-full border-none bg-stone-100/80 dark:bg-white/[0.06] pl-9 pr-3.5 py-2.5 text-[15px] text-stone-800 dark:text-neutral-100 placeholder-stone-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 transition-shadow"
          />
        </div>
        <div className="relative sm:w-48">
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
            className="appearance-none w-full rounded-full border-none bg-stone-100/80 dark:bg-white/[0.06] px-3.5 py-2.5 pr-8 text-[13px] font-semibold text-stone-700 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 transition-shadow">
            <option value="all">Tất cả vai trò</option>
            {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{ROLE_LABELS_VI[r]}</option>)}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-stone-400 dark:text-neutral-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {loading ? (
        <TableSkeleton rows={7} columns={1} />
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-16 px-6 text-center">
          <div className="w-11 h-11 rounded-full bg-stone-100 dark:bg-white/[0.06] flex items-center justify-center">
            <UsersIcon className="w-5 h-5 text-stone-400 dark:text-neutral-500" />
          </div>
          <p className="text-[13px] font-medium text-stone-400 dark:text-neutral-500">Không tìm thấy người dùng nào.</p>
        </div>
      ) : (
        <>
          {/* ---- Mobile: danh sách thẻ, tối ưu để chạm, không cuộn ngang ---- */}
          <div className="sm:hidden divide-y divide-stone-100 dark:divide-white/[0.06] max-h-[70vh] overflow-auto" data-lenis-prevent>
            {filtered.map((u) => (
              <div key={u.username} className="flex items-center gap-3 px-4 py-3 active:bg-stone-50 dark:active:bg-white/[0.04] transition-colors">
                <div className="w-10 h-10 rounded-full overflow-hidden border border-stone-200 dark:border-white/10 flex-shrink-0 bg-stone-100 dark:bg-white/[0.06]">
                  <img src={u.avatar || AVATAR_FALLBACK} alt="" className="w-full h-full object-cover" onError={handleAvatarError} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-semibold text-stone-800 dark:text-neutral-100 truncate tracking-tight">
                    {u.tenThanh ? `${u.tenThanh} ` : ""}{u.hoTen || u.username}
                    {u.username === currentUsername && (
                      <span className="ml-1.5 text-[10px] font-bold text-red-500 dark:text-red-400 align-middle">(Bạn)</span>
                    )}
                  </p>
                  <p className="text-[12px] text-stone-400 dark:text-neutral-500 truncate">{u.username} · {u.trangThai}</p>
                </div>
                <RoleSelect u={u} />
              </div>
            ))}
          </div>

          {/* ---- Desktop / tablet: bảng ---- */}
          <div className="hidden sm:block overflow-auto max-h-[65vh]" data-lenis-prevent>
            <table className="w-full text-sm border-collapse min-w-[520px]">
              <thead>
                <tr className="text-[11px] text-stone-400 dark:text-neutral-500 uppercase tracking-wide">
                  <th className="text-left font-semibold px-5 py-3 sticky top-0 bg-[#F9F9F9] dark:bg-neutral-900 z-10 border-b border-stone-100 dark:border-white/10">Người dùng</th>
                  <th className="text-center font-semibold px-3 py-3 sticky top-0 bg-[#F9F9F9] dark:bg-neutral-900 z-10 border-b border-stone-100 dark:border-white/10">Vai trò</th>
                  <th className="text-center font-semibold px-3 py-3 sticky top-0 bg-[#F9F9F9] dark:bg-neutral-900 z-10 border-b border-stone-100 dark:border-white/10">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.username} className="border-b border-stone-50 dark:border-white/[0.06] hover:bg-stone-50/70 dark:hover:bg-white/[0.03] transition-colors">
                    <td className="px-5 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-stone-200 dark:border-white/10 flex-shrink-0 bg-stone-100 dark:bg-white/[0.06]">
                          <img src={u.avatar || AVATAR_FALLBACK} alt="" className="w-full h-full object-cover" onError={handleAvatarError} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[13px] font-semibold text-stone-800 dark:text-neutral-100 truncate tracking-tight">
                            {u.tenThanh ? `${u.tenThanh} ` : ""}{u.hoTen || u.username}
                            {u.username === currentUsername && (
                              <span className="ml-1.5 text-[10px] font-bold text-red-500 dark:text-red-400 align-middle">(Bạn)</span>
                            )}
                          </p>
                          <p className="text-[11px] text-stone-400 dark:text-neutral-500 truncate">{u.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <RoleSelect u={u} />
                    </td>
                    <td className="px-3 py-2.5 text-center text-[12px] text-stone-500 dark:text-neutral-400">{u.trangThai}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}