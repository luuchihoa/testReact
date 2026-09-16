import React, { useState, useEffect, useMemo, useRef } from "react";
import { Search, Download, UserCheck, Clock, ArrowUpDown, ChevronDown, AlertCircle, X, Check, Lock, Unlock, ChevronRight, CalendarDays, Users } from "lucide-react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { Spinner } from "../../../components/ui/Skeleton.jsx";
import { useToast } from "../../../components/ui/ToastContext.jsx";
import { ConfirmDialog } from "../../../components/ui/StudentShared.jsx";
import { exportClassRosterExcel, preloadXLSX } from "../../admin/utils/excelRosterHelper.js";
import { toggleBatchProfileLock } from "../api.js";
import { useTeacherContext } from "../TeacherContext.jsx";
import ProfileRequestsModal from "./ProfileRequestsModal.jsx";

const SORT_OPTIONS = [
  { id: "ten_asc", label: "Tên (A → Z)" },
  { id: "username_asc", label: "Mã học sinh" },
  { id: "diem_desc", label: "Điểm TB giảm dần" },
];

function StudentListPanel({
  students,
  allStudents,
  lop,
  namHoc,
  loading,
  search,
  setSearch,
  selectedUsername,
  onSelect,
}) {
  const { showToast } = useToast();
  const { pendingRequests, pendingRequestsCount, refreshPendingRequests, reloadStudents, initialSummary, teacherUsername } = useTeacherContext();
  const [exporting, setExporting] = useState(false);
  const [openRequestsModal, setOpenRequestsModal] = useState(false);
  const [filterType, setFilterType] = useState("all"); // all | pending | locked | attention | nam | nu
  const [sortBy, setSortBy] = useState("ten_asc");
  const [openSortMenu, setOpenSortMenu] = useState(false);
  const [showBatchLockConfirm, setShowBatchLockConfirm] = useState(false);
  const [batchLocking, setBatchLocking] = useState(false);
  const sortMenuRef = useRef(null);

  useEffect(() => {
    preloadXLSX();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sortMenuRef.current && !sortMenuRef.current.contains(e.target)) {
        setOpenSortMenu(false);
      }
    };
    if (openSortMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [openSortMenu]);

  const pendingUsernameSet = useMemo(
    () => new Set((pendingRequests || []).map((r) => r.username)),
    [pendingRequests]
  );

  const summaryData = useMemo(() => initialSummary?.data || {}, [initialSummary?.data]);

  const lockedCount = useMemo(
    () => (students || []).filter((s) => s.isProfileLocked).length,
    [students]
  );

  // Lọc và sắp xếp danh sách học sinh
  const processedStudents = useMemo(() => {
    const rawList = search?.trim() ? students : (allStudents || students || []);
    let filtered = [...rawList];

    // Lọc theo filterType
    if (filterType === "pending") {
      filtered = filtered.filter((s) => pendingUsernameSet.has(s.username));
    } else if (filterType === "locked") {
      filtered = filtered.filter((s) => s.isProfileLocked);
    } else if (filterType === "attention") {
      filtered = filtered.filter((s) => {
        const sum = summaryData[s.username];
        if (!sum) return false;
        const totalVang = (sum.vangCoPhep || 0) + (sum.vangKhongPhep || 0);
        const lowScore = sum.diemTB !== null && sum.diemTB < 5.0;
        return totalVang >= 3 || lowScore;
      });
    } else if (filterType === "nam") {
      filtered = filtered.filter((s) => s.gioiTinh === "Nam");
    } else if (filterType === "nu") {
      filtered = filtered.filter((s) => s.gioiTinh === "Nữ");
    }

    // Sắp xếp
    if (sortBy === "ten_asc") {
      // Đã được sắp xếp theo tên ở API
    } else if (sortBy === "username_asc") {
      filtered.sort((a, b) => (a.username || "").localeCompare(b.username || ""));
    } else if (sortBy === "diem_desc") {
      filtered.sort((a, b) => {
        const scoreA = summaryData[a.username]?.diemTB ?? -1;
        const scoreB = summaryData[b.username]?.diemTB ?? -1;
        return scoreB - scoreA;
      });
    }

    return filtered;
  }, [students, allStudents, search, filterType, sortBy, pendingUsernameSet, summaryData]);

  const allLocked = processedStudents.length > 0 && processedStudents.every((s) => s.isProfileLocked);

  const handleBatchLockToggle = async () => {
    if (processedStudents.length === 0) return;
    setBatchLocking(true);
    const targetLockState = !allLocked;
    const usernames = processedStudents.map((s) => s.username);
    try {
      await toggleBatchProfileLock(usernames, targetLockState, teacherUsername);
      await reloadStudents();
      showToast(
        targetLockState
          ? `Đã khóa chỉnh sửa hồ sơ cho ${usernames.length} học sinh!`
          : `Đã mở khóa chỉnh sửa hồ sơ cho ${usernames.length} học sinh!`,
        "success"
      );
      setShowBatchLockConfirm(false);
    } catch (err) {
      console.error("Batch lock error:", err);
      showToast("Lỗi khi thay đổi trạng thái khóa: " + (err.message || ""), "error");
    } finally {
      setBatchLocking(false);
    }
  };

  const handleExport = async () => {
    if (processedStudents.length === 0) {
      showToast("Không có học sinh trong danh sách để tải", "warning");
      return;
    }
    setExporting(true);
    try {
      const res = await exportClassRosterExcel(lop || "Lop", namHoc || "", processedStudents);
      if (res?.cancelled) {
        showToast("Đã huỷ lưu file", "info");
      } else if (res?.method === "picker") {
        showToast("Đã lưu file Excel thành công", "success");
      } else {
        showToast("Đang tải file về máy...", "info");
      }
    } catch (err) {
      console.error("Export class roster error:", err);
      showToast("Xuất file thất bại", "error");
    } finally {
      setExporting(false);
    }
  };

  const resetFilters = () => {
    setSearch("");
    setFilterType("all");
    setSortBy("ten_asc");
  };

  const FILTER_TABS = [
    { id: "all", label: "Tất cả", count: (allStudents || students || []).length },
    { id: "pending", label: "Chờ duyệt", count: pendingRequestsCount },
    { id: "locked", label: "Đã khóa", count: lockedCount },
    { id: "attention", label: "Cần lưu ý" },
    { id: "nam", label: "Nam" },
    { id: "nu", label: "Nữ" },
  ];

  const currentSort = useMemo(
    () => SORT_OPTIONS.find((opt) => opt.id === sortBy) || SORT_OPTIONS[0],
    [sortBy]
  );

  return (
    <div className="-mx-4 sm:mx-0 rounded-none sm:rounded-2xl border-x-0 border-t-0 sm:border-t border-b sm:border border-[#dedfd4] dark:border-[#354237] bg-[#fffefa] dark:bg-[#1e2821] shadow-none sm:shadow-xs overflow-hidden flex flex-col max-h-[85vh] lg:max-h-[calc(100vh-180px)] min-h-0">
      
      {/* Header Container: 3 Tầng chuẩn mực & công thái học */}
      <div className="p-3.5 sm:p-5 border-b border-[#dedfd4] dark:border-[#354237] bg-[#faf8f3]/50 dark:bg-[#151c18]/50 space-y-2.5 sm:space-y-3">
        
        {/* TẦNG 1: Tiêu đề + Thông số Niên khóa & Sĩ số + Cụm nút Thao tác (Duyệt, Tải Excel, Khóa) */}
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="text-base sm:text-lg lg:text-xl font-bold text-[#293d32] dark:text-[#ecece0] tracking-tight truncate">
              Danh sách {lop}
            </h1>
            
            {/* Meta row: Niên khóa + Sĩ số (Siêu gọn 1 hàng, không rớt dòng) */}
            <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 text-[11px] sm:text-xs text-[#575e55] dark:text-[#b0b9ac] font-medium whitespace-nowrap">
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="w-3.5 h-3.5 text-[#927140] dark:text-[#d4b47d] shrink-0" aria-hidden="true" />
                <strong className="text-[#293d32] dark:text-[#ecece0] font-mono font-bold">{namHoc}</strong>
              </span>
              <span className="opacity-40">•</span>
              <span className="inline-flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-[#314e3e] dark:text-[#d6b883] shrink-0" aria-hidden="true" />
                <span>Sĩ số:</span>
                <strong className="text-[#293d32] dark:text-[#ecece0] font-mono font-bold">{(allStudents || students || []).length}</strong>
                <span>HS</span>
              </span>
            </div>
          </div>
          
          {/* Cụm nút Thao tác hồ sơ & tiện ích (Duyệt • Tải Excel • Khóa) */}
          <div className="flex items-center gap-1.5 shrink-0">
            {pendingRequestsCount > 0 && (
              <div className="relative group">
                <button
                  type="button"
                  onClick={() => setOpenRequestsModal(true)}
                  className="inline-flex items-center gap-1.5 px-2.5 h-[38px] min-h-[38px] rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-900 dark:text-amber-200 border border-amber-500/30 text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
                  aria-label="Xem danh sách yêu cầu thay đổi hồ sơ chờ duyệt"
                >
                  <UserCheck className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                  <span>Duyệt</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-600 text-white text-[10px] font-black">
                    {pendingRequestsCount}
                  </span>
                </button>
                {/* Instant CSS Tooltip (Nổi xuống dưới để không bị overflow-hidden che) */}
                <div className="pointer-events-none absolute top-full left-1/2 -translate-x-1/2 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap rounded-lg bg-[#1e2821] dark:bg-[#fffefa] text-white dark:text-[#19251d] px-2.5 py-1 text-[11px] font-semibold shadow-lg z-50">
                  {pendingRequestsCount} yêu cầu chờ duyệt
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-[#1e2821] dark:border-b-[#fffefa]" />
                </div>
              </div>
            )}

            {/* Nút Tải Excel (Có chữ rõ ràng + Instant Tooltip) */}
            <div className="relative group">
              <button
                type="button"
                onClick={handleExport}
                disabled={exporting || processedStudents.length === 0}
                className="inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3 h-[38px] min-h-[38px] rounded-xl bg-[#fffefa] dark:bg-[#1e2821] hover:bg-[#faf8f3] dark:hover:bg-[#151c18] text-[#293d32] dark:text-[#ecece0] border border-[#dedfd4] dark:border-[#354237] text-xs font-bold shadow-xs active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                aria-label="Xuất file Excel danh sách học sinh"
              >
                {exporting ? <Spinner className="w-4 h-4" /> : <Download className="w-4 h-4 text-[#314e3e] dark:text-[#d6b883]" />}
                <span>Excel</span>
              </button>
              {/* Instant CSS Tooltip (Nổi xuống dưới) */}
              <div className="pointer-events-none absolute top-full left-1/2 -translate-x-1/2 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap rounded-lg bg-[#1e2821] dark:bg-[#fffefa] text-white dark:text-[#19251d] px-2.5 py-1 text-[11px] font-semibold shadow-lg z-50">
                Xuất file Excel (.xlsx)
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-[#1e2821] dark:border-b-[#fffefa]" />
              </div>
            </div>

            {/* Nút Khóa / Mở khóa toàn bộ học sinh (Instant Tooltip) */}
            <div className="relative group">
              <button
                type="button"
                onClick={() => setShowBatchLockConfirm(true)}
                disabled={batchLocking || processedStudents.length === 0}
                className={`inline-flex items-center justify-center w-[38px] h-[38px] min-h-[38px] rounded-xl border text-xs font-semibold shadow-xs active:scale-95 transition-all cursor-pointer disabled:opacity-40 ${
                  allLocked
                    ? "bg-[#927140]/15 hover:bg-[#927140]/25 text-[#7c5c2d] dark:text-[#d4b47d] border-[#927140]/30 dark:border-[#d4b47d]/30"
                    : "bg-[#fffefa] dark:bg-[#1e2821] hover:bg-[#faf8f3] dark:hover:bg-[#151c18] text-[#293d32] dark:text-[#ecece0] border-[#dedfd4] dark:border-[#354237]"
                }`}
                aria-label={allLocked ? "Mở khóa hồ sơ toàn bộ học sinh" : "Khóa hồ sơ toàn bộ học sinh"}
              >
                {batchLocking ? (
                  <Spinner className="w-4 h-4" />
                ) : allLocked ? (
                  <Lock className="w-4 h-4 text-[#927140] dark:text-[#d4b47d]" />
                ) : (
                  <Unlock className="w-4 h-4 text-[#314e3e] dark:text-[#d6b883]" />
                )}
              </button>
              {/* Instant CSS Tooltip (Nổi xuống dưới) */}
              <div className="pointer-events-none absolute top-full right-0 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap rounded-lg bg-[#1e2821] dark:bg-[#fffefa] text-white dark:text-[#19251d] px-2.5 py-1 text-[11px] font-semibold shadow-lg z-50">
                {allLocked ? "Mở khóa tất cả hồ sơ" : "Khóa tất cả hồ sơ"}
                <div className="absolute bottom-full right-3 border-4 border-transparent border-b-[#1e2821] dark:border-b-[#fffefa]" />
              </div>
            </div>
          </div>
        </div>

        {/* TẦNG 2: Thanh Tìm kiếm & Sắp xếp (Hợp nhất) */}
        <div className="flex items-center gap-2">
          {/* Ô tìm kiếm */}
          <div className="relative flex-1 min-w-0">
            <Search className="w-4 h-4 text-[#454f46] dark:text-[#b8c2b4] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm tên hoặc mã học sinh…"
              className="w-full rounded-xl border border-[#dedfd4] dark:border-[#354237] bg-[#fffefa] dark:bg-[#1e2821] pl-9 pr-8 py-2 min-h-[38px] text-xs font-medium text-[#293d32] dark:text-[#ecece0] placeholder:text-[#454f46]/50 dark:placeholder:text-[#b8c2b4]/50 focus:outline-none focus:ring-2 focus:ring-[#314e3e]/30 dark:focus:ring-[#d6b883]/30 transition-shadow"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#454f46] hover:text-[#293d32] dark:text-[#b8c2b4] dark:hover:text-[#ecece0] p-1 cursor-pointer"
                title="Xóa tìm kiếm"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Nút Sắp xếp đặt cạnh ô tìm kiếm */}
          <div className="relative shrink-0" ref={sortMenuRef}>
            <button
              type="button"
              onClick={() => setOpenSortMenu(!openSortMenu)}
              className="inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-2 min-h-[38px] rounded-xl bg-[#fffefa] dark:bg-[#1e2821] hover:bg-[#faf8f3] dark:hover:bg-[#151c18] text-[#293d32] dark:text-[#ecece0] border border-[#dedfd4] dark:border-[#354237] text-xs font-semibold shadow-xs active:scale-95 transition-all cursor-pointer"
              title="Sắp xếp danh sách"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-[#314e3e] dark:text-[#d6b883] shrink-0" />
              <span className="hidden sm:inline text-xs font-medium">{currentSort.label}</span>
              <ChevronDown className="w-3 h-3 opacity-50 hidden sm:inline shrink-0" />
            </button>

            <AnimatePresence>
              {openSortMenu && (
                <Motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-1.5 w-48 rounded-xl bg-[#fffefa] dark:bg-[#1e2821] border border-[#dedfd4] dark:border-[#354237] shadow-lg p-1.5 z-30"
                >
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#454f46] dark:text-[#b8c2b4] px-2 py-1">
                    Sắp xếp theo
                  </p>
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setSortBy(opt.id);
                        setOpenSortMenu(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-left transition-colors cursor-pointer ${
                        sortBy === opt.id
                          ? "bg-[#314e3e]/10 dark:bg-[#d6b883]/15 text-[#314e3e] dark:text-[#d6b883] font-bold"
                          : "text-[#293d32] dark:text-[#ecece0] hover:bg-stone-500/10"
                      }`}
                    >
                      <span>{opt.label}</span>
                      {sortBy === opt.id && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </Motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* TẦNG 3: Dải thẻ Bộ lọc (Filter Pills) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-hide">
          {FILTER_TABS.map((tab) => {
            const isActive = filterType === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterType(tab.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[32px] rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#314e3e] dark:bg-[#d6b883] text-white dark:text-[#19251d] shadow-2xs"
                    : "bg-[#fffefa] dark:bg-[#1e2821] text-[#454f46] dark:text-[#b8c2b4] border border-[#dedfd4] dark:border-[#354237] hover:bg-stone-500/5 hover:text-[#293d32] dark:hover:text-[#ecece0]"
                }`}
              >
                <span>{tab.label}</span>
                {typeof tab.count === "number" && tab.count > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black font-mono transition-colors ${
                    isActive
                      ? "bg-white text-[#314e3e] dark:bg-[#19251d] dark:text-[#d6b883]"
                      : "bg-[#314e3e]/10 dark:bg-[#d6b883]/15 text-[#314e3e] dark:text-[#d6b883]"
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* List Container: Khung nền thanh lịch, thống nhất chiều cao trên Desktop & Mobile */}
      <div className="flex-1 min-h-0 overflow-y-auto relative p-2 sm:p-2.5 space-y-1.5 bg-[#faf8f3]/40 dark:bg-[#151c18]/40" data-lenis-prevent>
        {loading && (
          <div className="flex items-center justify-center gap-2.5 py-16 text-[#314e3e] dark:text-[#d6b883] text-xs font-medium">
            <Spinner className="h-4 w-4" /> Đang tải danh sách…
          </div>
        )}

        {!loading && processedStudents.length === 0 && (
          <div className="text-center py-14 px-4 space-y-3 bg-[#fffefa] dark:bg-[#1e2821] rounded-2xl border border-[#dedfd4] dark:border-[#354237] p-6 shadow-2xs">
            <div className="w-10 h-10 rounded-2xl bg-stone-500/10 flex items-center justify-center text-[#454f46] dark:text-[#b8c2b4] mx-auto">
              <AlertCircle className="w-5 h-5" />
            </div>
            <p className="text-xs text-[#454f46] dark:text-[#b8c2b4] max-w-xs mx-auto">
              Không tìm thấy học sinh nào phù hợp với bộ lọc hiện tại.
            </p>
            {(search || filterType !== "all" || sortBy !== "ten_asc") && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#314e3e]/10 dark:bg-[#d6b883]/15 text-[#314e3e] dark:text-[#d6b883] text-xs font-bold hover:bg-[#314e3e]/20 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" /> Xóa bộ lọc
              </button>
            )}
          </div>
        )}

        {!loading && processedStudents.map((s, idx) => {
          const active = s.username === selectedUsername;
          const userSummary = summaryData[s.username];
          const hasPending = pendingUsernameSet.has(s.username);
          const totalVang = userSummary ? (userSummary.vangCoPhep || 0) + (userSummary.vangKhongPhep || 0) : 0;
          const diemTB = userSummary?.diemTB;
          const isWarning = totalVang >= 3 || (diemTB !== null && diemTB !== undefined && diemTB < 5.0);

          return (
            <Motion.button 
              key={s.username} 
              type="button" 
              onClick={() => onSelect(s.username)}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15, delay: Math.min(idx * 0.012, 0.2) }}
              className={`relative flex w-full items-center gap-3 p-2.5 sm:p-3 rounded-xl text-left transition-all group cursor-pointer border select-none ${
                active 
                  ? "bg-[#314e3e]/[0.09] dark:bg-[#d6b883]/15 border-[#314e3e] dark:border-[#d6b883] ring-1 ring-[#314e3e]/20 dark:ring-[#d6b883]/20 shadow-xs" 
                  : "bg-[#fffefa] dark:bg-[#1e2821] border-[#dedfd4]/80 dark:border-[#354237]/80 hover:border-[#314e3e]/40 dark:hover:border-[#d6b883]/40 hover:bg-[#faf8f3] dark:hover:bg-[#151c18] shadow-2xs hover:shadow-xs"
              }`}
            >
              {/* Active Indicator Bar */}
              {active && (
                <div className="absolute left-0 top-2 bottom-2 w-1 bg-[#314e3e] dark:bg-[#d6b883] rounded-r-full" />
              )}

              {/* Avatar kèm Số Thứ Tự (STT) */}
              <div className="relative shrink-0">
                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border transition-transform ${
                  active 
                    ? "border-[#314e3e] dark:border-[#d6b883] ring-2 ring-[#314e3e]/20 dark:ring-[#d6b883]/20" 
                    : isWarning
                    ? "border-red-500/40 bg-stone-100 dark:bg-stone-800"
                    : "border-[#dedfd4] dark:border-[#354237] bg-stone-100 dark:bg-stone-800"
                }`}>
                  <img src={s.avatar || "/images/avatarDefault.avif"} alt="" className="w-full h-full object-cover" />
                </div>
                <span className="absolute -bottom-1 -right-1 min-w-[16px] h-[16px] px-0.5 rounded-full bg-[#293d32] dark:bg-[#ecece0] text-white dark:text-[#19251d] text-[9px] font-bold font-mono flex items-center justify-center shadow-xs border border-white dark:border-[#1e2821]">
                  {idx + 1}
                </span>
              </div>

              {/* Thông tin học sinh: Hàng 1 dành trọn bề ngang cho Tên Thánh & Họ Tên không bị cắt */}
              <div className="min-w-0 flex-1">
                {/* Hàng 1: Tên Thánh + Họ Tên (Không có badge chèn ép, tự do xuống dòng nếu quá dài) */}
                <div 
                  className="min-w-0 leading-snug"
                  title={`${s.tenThanh ? s.tenThanh + " " : ""}${s.hoTen || s.username}`}
                >
                  {s.tenThanh && (
                    <span className="font-semibold text-[#927140] dark:text-[#d4b47d] font-serif text-xs mr-1 inline">
                      {s.tenThanh}
                    </span>
                  )}
                  <span className={`text-xs sm:text-[13.5px] font-bold break-words leading-snug ${
                    active ? "text-[#314e3e] dark:text-[#d6b883]" : "text-[#293d32] dark:text-[#ecece0]"
                  }`}>
                    {s.hoTen || s.username}
                  </span>
                </div>

                {/* Hàng 2: Mã HS • Giới tính • Vắng | Cụm ĐTB • Khóa • Chờ duyệt */}
                <div className="flex items-center justify-between gap-1.5 text-[11px] text-[#575e55] dark:text-[#b0b9ac] mt-1">
                  <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                    <span className="font-mono text-[11px] text-[#575e55] dark:text-[#b0b9ac]">
                      {s.username}
                    </span>
                    {s.gioiTinh && (
                      <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-medium bg-stone-500/10 dark:bg-stone-400/10 text-[#575e55] dark:text-[#b0b9ac] shrink-0">
                        {s.gioiTinh}
                      </span>
                    )}
                    {totalVang > 0 && (
                      <span className={`text-[10px] shrink-0 font-medium ${
                        totalVang >= 3 
                          ? "text-red-700 dark:text-red-400 font-bold bg-red-500/10 px-1.5 py-0.2 rounded border border-red-500/20" 
                          : "text-[#575e55] dark:text-[#b0b9ac]"
                      }`}>
                        Vắng {totalVang}b
                      </span>
                    )}
                  </div>

                  {/* Cụm ĐTB & Badges bên phải của Hàng 2 */}
                  <div className="flex items-center gap-1 shrink-0">
                    {s.isProfileLocked && (
                      <span 
                        className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-[#927140]/15 dark:bg-[#d4b47d]/20 text-[#7c5c2d] dark:text-[#d4b47d] text-[10px] font-bold border border-[#927140]/30 dark:border-[#d4b47d]/30"
                        title={`Hồ sơ đã khóa${s.profileLockedBy ? ` bởi ${s.profileLockedBy}` : ""}`}
                      >
                        <Lock className="w-2.5 h-2.5" />
                      </span>
                    )}

                    {hasPending && (
                      <span 
                        className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-900 dark:text-amber-200 text-[10px] font-bold border border-amber-500/30 animate-pulse"
                        title="Có yêu cầu sửa hồ sơ đang chờ duyệt"
                      >
                        <Clock className="w-2.5 h-2.5" />
                      </span>
                    )}

                    {diemTB !== null && diemTB !== undefined && (
                      <span className={`px-1.5 py-0.2 rounded text-[10.5px] font-mono font-bold border ${
                        diemTB >= 8.0 
                          ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-800 dark:text-emerald-300"
                          : diemTB >= 6.5
                          ? "bg-blue-500/15 border-blue-500/30 text-blue-800 dark:text-blue-300"
                          : diemTB >= 5.0
                          ? "bg-amber-500/15 border-amber-500/30 text-amber-800 dark:text-amber-300"
                          : "bg-red-500/15 border-red-500/30 text-red-800 dark:text-red-300"
                      }`}>
                        {Number(diemTB).toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Chevron chuyển trang: Độc lập ở mép phải ngoài cùng, căn giữa theo chiều dọc toàn thẻ (Chuẩn Mobile HIG) */}
              <ChevronRight className="w-4 h-4 text-[#575e55]/40 dark:text-[#b0b9ac]/40 lg:hidden shrink-0 self-center" />
            </Motion.button>
          );
        })}
      </div>

      {/* MODAL DUYỆT HỒ SƠ */}
      <ProfileRequestsModal
        open={openRequestsModal}
        onClose={() => setOpenRequestsModal(false)}
        requests={pendingRequests}
        onSuccess={() => {
          refreshPendingRequests();
          reloadStudents();
        }}
      />

      {/* MODAL XÁC NHẬN KHÓA / MỞ KHÓA HÀNG LOẠT */}
      <ConfirmDialog
        open={showBatchLockConfirm}
        onCancel={() => setShowBatchLockConfirm(false)}
        onConfirm={handleBatchLockToggle}
        busy={batchLocking}
        title={allLocked ? "Mở khóa hồ sơ toàn bộ học sinh?" : "Khóa hồ sơ toàn bộ học sinh?"}
        message={
          allLocked
            ? `Bạn có chắc chắn muốn mở khóa chỉnh sửa hồ sơ cho ${processedStudents.length} học sinh trong danh sách?`
            : `Bạn có chắc chắn muốn khóa chỉnh sửa hồ sơ cho ${processedStudents.length} học sinh trong danh sách? Sau khi khóa, thông tin hộ tịch và bí tích của các em sẽ được bảo vệ và không thể tự ý sửa đổi.`
        }
        confirmLabel={allLocked ? "Mở khóa toàn bộ" : "Khóa toàn bộ"}
        icon={allLocked ? Unlock : Lock}
        iconBg={allLocked ? "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300" : "bg-amber-500/15 text-amber-800 dark:text-amber-300"}
      />
    </div>
  );
}

export default StudentListPanel;

