import React, { useState, useEffect, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { useLenis } from "lenis/react";
import { 
  Calendar, Clock, Plus, Trash2, X, AlertTriangle, 
  Sparkles, RefreshCw, CalendarDays, BookmarkCheck,
  ChevronDown, ChevronUp, Check, Info, ArrowRight, ShieldAlert, Church
} from "lucide-react";
import { 
  fetchAcademicCalendar, 
  fetchAcademicHolidays, 
  addAcademicHoliday, 
  deleteAcademicHoliday, 
  syncCalendarToAllClasses 
} from "../dataLayer.js";
import { getDefaultTermRanges, formatVNDate } from "../../teacher/utils.js";
import { Spinner } from "../../../components/ui/Skeleton.jsx";

const HOLIDAY_TYPES = [
  { value: "nghi_le", label: "Lễ Phụng Vụ", color: "bg-sky-100 text-sky-900 border-sky-300 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800/60" },
  { value: "nghi_tet", label: "Nghỉ Tết", color: "bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/60" },
  { value: "su_kien", label: "Sự Kiện / Trại", color: "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60" },
  { value: "hoc_bu", label: "Học Bù", color: "bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60" },
];

const HOLIDAY_FILTER_OPTIONS = [
  { id: "all", label: "Tất cả" },
  { id: "nghi_le", label: "Lễ Phụng Vụ" },
  { id: "nghi_tet", label: "Nghỉ Tết" },
  { id: "su_kien", label: "Sự Kiện" },
  { id: "hoc_bu", label: "Học Bù" },
];

// Hàm tính toán ngày kết thúc dự kiến dựa vào ngày bắt đầu và tổng số tuần học
function calculateEndDate(startDateStr, totalWeeks) {
  if (!startDateStr || !totalWeeks) return "";
  const start = new Date(startDateStr);
  if (isNaN(start.getTime())) return "";
  const end = new Date(start);
  end.setDate(end.getDate() + (Math.max(1, Number(totalWeeks)) - 1) * 7);
  return end.toISOString().split("T")[0];
}

export default function AcademicCalendarModal({ open, onClose, namHoc, availableClasses = [], showToast, onSynced }) {
  const lenis = useLenis();
  const [activeTab, setActiveTab] = useState("calendar"); // 'calendar' | 'holidays'
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State Lịch Niên Khóa
  const [hk1Start, setHk1Start] = useState("");
  const [hk1Weeks, setHk1Weeks] = useState(16);
  const [hk2Start, setHk2Start] = useState("");
  const [hk2Weeks, setHk2Weeks] = useState(16);

  // Danh sách ngày nghỉ & Bộ lọc
  const [holidays, setHolidays] = useState([]);
  const [holidayFilter, setHolidayFilter] = useState("all");
  const [isFormOpenMobile, setIsFormOpenMobile] = useState(false);

  // Form thêm ngày nghỉ mới
  const [newHolidayDate, setNewHolidayDate] = useState("");
  const [newHolidayName, setNewHolidayName] = useState("");
  const [newHolidayType, setNewHolidayType] = useState("nghi_le");
  const [newHolidayHocKy, setNewHolidayHocKy] = useState(1);
  const [addingHoliday, setAddingHoliday] = useState(false);
  const [busyHolidayId, setBusyHolidayId] = useState(null);

  // Khóa cuộn nền khi modal mở
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      lenis?.stop();
    } else {
      document.body.style.overflow = "";
      lenis?.start();
    }
    return () => {
      document.body.style.overflow = "";
      lenis?.start();
    };
  }, [open, lenis]);

  // Đóng modal bằng phím Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && open && !saving) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, saving, onClose]);

  // Nạp dữ liệu lịch và ngày nghỉ
  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const defaults = getDefaultTermRanges(namHoc);
        const [calData, holiData] = await Promise.all([
          fetchAcademicCalendar(namHoc),
          fetchAcademicHolidays(namHoc),
        ]);

        if (cancelled) return;

        if (calData) {
          setHk1Start(calData.hk1_start_date || defaults.HK1.start);
          setHk1Weeks(calData.hk1_total_weeks || 16);
          setHk2Start(calData.hk2_start_date || defaults.HK2.start);
          setHk2Weeks(calData.hk2_total_weeks || 16);
        } else {
          setHk1Start(defaults.HK1.start);
          setHk1Weeks(16);
          setHk2Start(defaults.HK2.start);
          setHk2Weeks(16);
        }

        setHolidays(holiData || []);
      } catch (err) {
        console.error("load academic calendar error:", err);
        if (!cancelled) showToast?.("Không thể tải cấu hình lịch niên khóa", "error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [open, namHoc, showToast]);

  // Tính toán ngày kết thúc dự kiến của HK1 và HK2
  const hk1End = useMemo(() => calculateEndDate(hk1Start, hk1Weeks), [hk1Start, hk1Weeks]);
  const hk2End = useMemo(() => calculateEndDate(hk2Start, hk2Weeks), [hk2Start, hk2Weeks]);

  // Kiểm tra xung đột mốc thời gian giữa 2 học kỳ
  const hasDateConflict = useMemo(() => {
    if (!hk1End || !hk2Start) return false;
    return new Date(hk2Start) <= new Date(hk1End);
  }, [hk1End, hk2Start]);

  // Xử lý Đồng bộ lịch niên khóa sang toàn bộ các lớp
  const handleSyncToClasses = async () => {
    if (!hk1Start || !hk2Start) {
      showToast?.("Vui lòng chọn ngày bắt đầu cho cả 2 học kỳ", "warning");
      return;
    }
    setSaving(true);
    try {
      await syncCalendarToAllClasses(namHoc, hk1Start, hk1Weeks, hk2Start, hk2Weeks);
      showToast?.(`Đã đồng bộ lịch niên khóa ${namHoc} cho toàn bộ các lớp!`, "success");
      onSynced?.();
    } catch (err) {
      console.error("Sync calendar error:", err);
      showToast?.("Đồng bộ lịch thất bại", "error");
    } finally {
      setSaving(false);
    }
  };

  // Thêm ngày nghỉ lễ mới
  const handleAddHoliday = async (e) => {
    e.preventDefault();
    if (!newHolidayDate || !newHolidayName.trim()) {
      showToast?.("Vui lòng nhập ngày và tên ngày nghỉ", "warning");
      return;
    }

    setAddingHoliday(true);
    try {
      const added = await addAcademicHoliday({
        nam_hoc: namHoc,
        hoc_ky: Number(newHolidayHocKy) || 1,
        ngay: newHolidayDate,
        ten_ngay_le: newHolidayName.trim(),
        loai_nghi: newHolidayType,
      });

      setHolidays(prev => [...prev.filter(h => h.ngay !== newHolidayDate), added].sort((a, b) => a.ngay.localeCompare(b.ngay)));
      setNewHolidayDate("");
      setNewHolidayName("");
      setIsFormOpenMobile(false);
      showToast?.("Đã thêm ngày nghỉ lễ thành công", "success");
    } catch (err) {
      console.error("Add holiday error:", err);
      showToast?.("Không thể thêm ngày nghỉ lễ", "error");
    } finally {
      setAddingHoliday(false);
    }
  };

  // Xóa ngày nghỉ lễ
  const handleDeleteHoliday = async (id, name) => {
    setBusyHolidayId(id);
    try {
      await deleteAcademicHoliday(id, namHoc);
      setHolidays(prev => prev.filter(h => h.id !== id));
      showToast?.(`Đã xóa ngày nghỉ "${name}"`, "info");
    } catch (err) {
      console.error("Delete holiday error:", err);
      showToast?.("Không thể xóa ngày nghỉ", "error");
    } finally {
      setBusyHolidayId(null);
    }
  };

  // Tự động tạo mẫu ngày lễ Công giáo & Tết chuẩn
  const handleGenerateTemplateHolidays = async () => {
    let startYear = new Date().getFullYear();
    if (namHoc && namHoc.includes("-")) {
      const parsed = parseInt(namHoc.split("-")[0], 10);
      if (!isNaN(parsed)) startYear = parsed;
    }

    const templateList = [
      {
        nam_hoc: namHoc,
        hoc_ky: 1,
        ngay: `${startYear}-11-01`,
        ten_ngay_le: "Đại Lễ Các Thánh (01/11)",
        loai_nghi: "nghi_le"
      },
      {
        nam_hoc: namHoc,
        hoc_ky: 1,
        ngay: `${startYear}-12-25`,
        ten_ngay_le: "Đại Lễ Chúa Giáng Sinh (25/12)",
        loai_nghi: "nghi_le"
      },
      {
        nam_hoc: namHoc,
        hoc_ky: 2,
        ngay: `${startYear + 1}-02-14`,
        ten_ngay_le: "Nghỉ Tết Nguyên Đán (Mùng 1 - Mùng 3 Tết)",
        loai_nghi: "nghi_tet"
      },
      {
        nam_hoc: namHoc,
        hoc_ky: 2,
        ngay: `${startYear + 1}-02-21`,
        ten_ngay_le: "Nghỉ Tết Nguyên Đán (Tuần 2)",
        loai_nghi: "nghi_tet"
      },
      {
        nam_hoc: namHoc,
        hoc_ky: 2,
        ngay: `${startYear + 1}-03-28`,
        ten_ngay_le: "Đại Lễ Phục Sinh (Tuần Thánh)",
        loai_nghi: "nghi_le"
      }
    ];

    setSaving(true);
    try {
      const addedList = [];
      for (const item of templateList) {
        const added = await addAcademicHoliday(item);
        if (added) addedList.push(added);
      }
      setHolidays(prev => {
        const merged = [...prev];
        addedList.forEach(item => {
          const idx = merged.findIndex(m => m.ngay === item.ngay);
          if (idx >= 0) merged[idx] = item;
          else merged.push(item);
        });
        return merged.sort((a, b) => a.ngay.localeCompare(b.ngay));
      });
      showToast?.("Đã tạo mẫu các ngày lễ Phụng vụ & Tết thành công", "success");
    } catch (err) {
      console.error("Generate template error:", err);
      showToast?.("Tạo mẫu ngày lễ thất bại", "error");
    } finally {
      setSaving(false);
    }
  };

  const totalClassesCount = availableClasses.length;

  const holidayTypeMap = useMemo(() => {
    const map = {};
    HOLIDAY_TYPES.forEach(t => { map[t.value] = t; });
    return map;
  }, []);

  // Lọc danh sách ngày nghỉ theo loại
  const filteredHolidays = useMemo(() => {
    if (holidayFilter === "all") return holidays;
    return holidays.filter(h => h.loai_nghi === holidayFilter);
  }, [holidays, holidayFilter]);

  // Gom nhóm ngày nghỉ theo từng Học kỳ
  const hk1Holidays = useMemo(() => filteredHolidays.filter(h => Number(h.hoc_ky) === 1), [filteredHolidays]);
  const hk2Holidays = useMemo(() => filteredHolidays.filter(h => Number(h.hoc_ky) === 2), [filteredHolidays]);

  if (!open) return null;

  return createPortal(
    <div
      data-lenis-prevent
      onClick={!saving ? onClose : undefined}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-stone-900/60 dark:bg-black/75 backdrop-blur-xs overscroll-contain"
      role="dialog"
      aria-modal="true"
      aria-labelledby="calendar-modal-title"
    >
      <div 
        data-lenis-prevent
        onClick={(e) => e.stopPropagation()} 
        className="w-full max-w-4xl max-h-[90vh] flex flex-col bg-[#fffefa] dark:bg-[#1e2821] rounded-2xl sm:rounded-3xl border border-[#dedfd4] dark:border-[#354237] shadow-2xl overflow-hidden overscroll-contain"
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-[#dedfd4] dark:border-[#354237] bg-[#faf8f3] dark:bg-[#151c18] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#314e3e]/10 dark:bg-[#d6b883]/20 flex items-center justify-center text-[#314e3e] dark:text-[#d6b883] shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 id="calendar-modal-title" className="text-base sm:text-lg font-bold font-serif text-[#293d32] dark:text-[#ecece0] leading-tight">
                Lịch Niên Khóa & Ngày Nghỉ Lễ
              </h2>
              <p className="text-xs text-[#575e55] dark:text-[#b0b9ac] font-semibold mt-0.5">
                Niên khóa: <span className="font-bold text-[#7c5c2d] dark:text-[#d4b47d]">{namHoc}</span>
                <span className="hidden sm:inline text-[#575e55] dark:text-[#b0b9ac] ml-2">
                  • Tổng {totalClassesCount} lớp học
                </span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            aria-label="Đóng cửa sổ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation Segmented */}
        <div className="flex items-center gap-2 px-4 sm:px-6 pt-2.5 pb-2 border-b border-[#dedfd4] dark:border-[#354237] bg-[#fffefa] dark:bg-[#1e2821] shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("calendar")}
            className={`min-h-[44px] flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === "calendar"
                ? "bg-[#314e3e] dark:bg-[#d6b883] text-white dark:text-[#19251d] shadow-sm"
                : "bg-[#faf8f3] dark:bg-[#151c18] text-[#293d32] dark:text-[#ecece0] border border-[#dedfd4] dark:border-[#354237] hover:bg-[#dedfd4]/30"
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            <span className="hidden sm:inline">Khung Niên Khóa (HK1 & HK2)</span>
            <span className="sm:hidden">Niên khóa</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("holidays")}
            className={`min-h-[44px] flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === "holidays"
                ? "bg-[#314e3e] dark:bg-[#d6b883] text-white dark:text-[#19251d] shadow-sm"
                : "bg-[#faf8f3] dark:bg-[#151c18] text-[#293d32] dark:text-[#ecece0] border border-[#dedfd4] dark:border-[#354237] hover:bg-[#dedfd4]/30"
            }`}
          >
            <Clock className="w-4 h-4" />
            <span className="hidden sm:inline">Nghỉ Lễ & Nghỉ Tết ({holidays.length})</span>
            <span className="sm:hidden">Nghỉ lễ ({holidays.length})</span>
          </button>
        </div>

        {/* Body Content with Independent Scroll */}
        <div 
          data-lenis-prevent 
          className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-6 min-h-0"
        >
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3 text-center">
              <Spinner className="w-8 h-8 text-[#314e3e] dark:text-[#d6b883]" />
              <p className="text-sm font-bold text-[#575e55] dark:text-[#b0b9ac]">Đang tải cấu hình niên khóa…</p>
            </div>
          ) : activeTab === "calendar" ? (
            /* ============================================================
               TAB 1: KHUNG NIÊN KHÓA (HK1 & HK2)
               ============================================================ */
            <div className="space-y-5">
              {/* Banner Hướng Dẫn */}
              <div className="p-4 rounded-2xl bg-[#314e3e]/5 dark:bg-[#d6b883]/10 border border-[#314e3e]/15 dark:border-[#d6b883]/20 flex items-start gap-3">
                <BookmarkCheck className="w-5 h-5 text-[#314e3e] dark:text-[#d6b883] shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm text-[#293d32] dark:text-[#ecece0] leading-relaxed">
                  Thiết lập ngày khai giảng và số buổi Chúa Nhật cho toàn bộ Xứ đoàn. Khi bấm <strong>"Đồng bộ cho tất cả các lớp"</strong>, toàn bộ {totalClassesCount} lớp trong niên khóa sẽ tự động cập nhật lịch học này.
                </div>
              </div>

              {/* Cảnh báo xung đột thời gian (nếu có) */}
              {hasDateConflict && (
                <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/60 flex items-center gap-3 text-amber-900 dark:text-amber-200">
                  <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
                  <span className="text-xs sm:text-sm font-semibold">
                    Chú ý: Ngày bắt đầu Học kỳ II ({formatVNDate(new Date(hk2Start))}) đang trùng hoặc sớm hơn ngày kết thúc Học kỳ I ({formatVNDate(new Date(hk1End))}). Vui lòng kiểm tra lại.
                  </span>
                </div>
              )}

              {/* Grid 2 Học kỳ */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* THẺ HỌC KỲ I */}
                <div className="p-4 sm:p-5 rounded-2xl bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237] space-y-4 shadow-xs">
                  <div className="flex items-center justify-between border-b border-[#dedfd4] dark:border-[#354237] pb-2.5">
                    <span className="text-sm font-bold uppercase tracking-wider text-[#314e3e] dark:text-[#d6b883] flex items-center gap-1.5">
                      <CalendarDays className="w-4 h-4" /> Học Kỳ I
                    </span>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#314e3e]/10 dark:bg-[#d6b883]/20 text-[#314e3e] dark:text-[#d6b883]">
                      {hk1Weeks} buổi học
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#293d32] dark:text-[#ecece0] mb-1.5">
                      Ngày khai giảng / Bắt đầu HK1:
                    </label>
                    <input
                      type="date"
                      value={hk1Start}
                      onChange={(e) => setHk1Start(e.target.value)}
                      className="w-full min-h-[44px] rounded-xl border border-[#dedfd4] dark:border-[#354237] bg-[#fffefa] dark:bg-[#1e2821] px-3.5 py-2 text-xs sm:text-sm font-semibold text-[#293d32] dark:text-[#ecece0] focus:ring-2 focus:ring-[#314e3e]/30 outline-none shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#293d32] dark:text-[#ecece0] mb-1.5">
                      Tổng số tuần / buổi học HK1:
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={hk1Weeks}
                      onChange={(e) => setHk1Weeks(Math.max(1, parseInt(e.target.value) || 16))}
                      className="w-full min-h-[44px] rounded-xl border border-[#dedfd4] dark:border-[#354237] bg-[#fffefa] dark:bg-[#1e2821] px-3.5 py-2 text-xs sm:text-sm font-semibold text-[#293d32] dark:text-[#ecece0] focus:ring-2 focus:ring-[#314e3e]/30 outline-none shadow-xs"
                    />
                  </div>

                  {/* Tính toán hiển thị trực tiếp mốc thời gian HK1 */}
                  {hk1Start && hk1End && (
                    <div className="p-3 rounded-xl bg-[#fffefa] dark:bg-[#1e2821] border border-[#dedfd4] dark:border-[#354237] text-xs space-y-1">
                      <div className="flex items-center justify-between text-[#575e55] dark:text-[#b0b9ac]">
                        <span>Dự kiến bế giảng HK1:</span>
                        <strong className="text-[#293d32] dark:text-[#ecece0]">{formatVNDate(new Date(hk1End))}</strong>
                      </div>
                      <div className="text-[11px] text-[#7c5c2d] dark:text-[#d4b47d] font-medium pt-1 border-t border-[#dedfd4]/60 dark:border-[#354237]/60 flex items-center">
                        <span>{formatVNDate(new Date(hk1Start))}</span>
                        <ArrowRight className="w-3 h-3 mx-1 inline" />
                        <span>{formatVNDate(new Date(hk1End))}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* THẺ HỌC KỲ II */}
                <div className="p-4 sm:p-5 rounded-2xl bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237] space-y-4 shadow-xs">
                  <div className="flex items-center justify-between border-b border-[#dedfd4] dark:border-[#354237] pb-2.5">
                    <span className="text-sm font-bold uppercase tracking-wider text-[#314e3e] dark:text-[#d6b883] flex items-center gap-1.5">
                      <CalendarDays className="w-4 h-4" /> Học Kỳ II
                    </span>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#314e3e]/10 dark:bg-[#d6b883]/20 text-[#314e3e] dark:text-[#d6b883]">
                      {hk2Weeks} buổi học
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#293d32] dark:text-[#ecece0] mb-1.5">
                      Ngày bắt đầu HK2:
                    </label>
                    <input
                      type="date"
                      value={hk2Start}
                      onChange={(e) => setHk2Start(e.target.value)}
                      className="w-full min-h-[44px] rounded-xl border border-[#dedfd4] dark:border-[#354237] bg-[#fffefa] dark:bg-[#1e2821] px-3.5 py-2 text-xs sm:text-sm font-semibold text-[#293d32] dark:text-[#ecece0] focus:ring-2 focus:ring-[#314e3e]/30 outline-none shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#293d32] dark:text-[#ecece0] mb-1.5">
                      Tổng số tuần / buổi học HK2:
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={hk2Weeks}
                      onChange={(e) => setHk2Weeks(Math.max(1, parseInt(e.target.value) || 16))}
                      className="w-full min-h-[44px] rounded-xl border border-[#dedfd4] dark:border-[#354237] bg-[#fffefa] dark:bg-[#1e2821] px-3.5 py-2 text-xs sm:text-sm font-semibold text-[#293d32] dark:text-[#ecece0] focus:ring-2 focus:ring-[#314e3e]/30 outline-none shadow-xs"
                    />
                  </div>

                  {/* Tính toán hiển thị trực tiếp mốc thời gian HK2 */}
                  {hk2Start && hk2End && (
                    <div className="p-3 rounded-xl bg-[#fffefa] dark:bg-[#1e2821] border border-[#dedfd4] dark:border-[#354237] text-xs space-y-1">
                      <div className="flex items-center justify-between text-[#575e55] dark:text-[#b0b9ac]">
                        <span>Dự kiến bế giảng HK2:</span>
                        <strong className="text-[#293d32] dark:text-[#ecece0]">{formatVNDate(new Date(hk2End))}</strong>
                      </div>
                      <div className="text-[11px] text-[#7c5c2d] dark:text-[#d4b47d] font-medium pt-1 border-t border-[#dedfd4]/60 dark:border-[#354237]/60 flex items-center">
                        <span>{formatVNDate(new Date(hk2Start))}</span>
                        <ArrowRight className="w-3 h-3 mx-1 inline" />
                        <span>{formatVNDate(new Date(hk2End))}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Banner Đồng bộ toàn bộ lớp */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-[#293d32] dark:text-[#ecece0]">
                      Đồng bộ hàng loạt cho {totalClassesCount} lớp học
                    </p>
                    <p className="text-xs text-[#575e55] dark:text-[#b0b9ac] mt-0.5 leading-relaxed">
                      Cập nhật ngày bắt đầu và tổng số buổi cho toàn bộ Giáo lý sinh trong Niên khóa {namHoc}.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={saving}
                  onClick={handleSyncToClasses}
                  className="min-h-[44px] w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#314e3e] hover:bg-[#263e32] text-white dark:bg-[#d6b883] dark:hover:bg-[#c9a76d] dark:text-[#19251d] shadow-sm active:scale-[0.98] transition-all disabled:opacity-50 shrink-0 cursor-pointer"
                >
                  {saving ? <Spinner className="w-4 h-4" /> : <RefreshCw className="w-4 h-4" />}
                  <span>{saving ? "Đang đồng bộ…" : "Đồng bộ cho tất cả các lớp"}</span>
                </button>
              </div>
            </div>
          ) : (
            /* ============================================================
               TAB 2: QUẢN LÝ NGÀY NGHỈ LỄ PHỤNG VỤ & NGHỈ TẾT
               ============================================================ */
            <div className="space-y-5">
              {/* Toolbar tạo mẫu tự động & Toggle Form trên Mobile */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237]">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-[#293d32] dark:text-[#ecece0]">
                    Danh sách Ngày Nghỉ Lễ & Nghỉ Tết ({holidays.length} ngày)
                  </h4>
                  <p className="text-xs text-[#575e55] dark:text-[#b0b9ac] mt-0.5">
                    Tự động hiển thị huy hiệu trên trang Điểm danh và không trừ điểm chuyên cần.
                  </p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setIsFormOpenMobile(prev => !prev)}
                    className="md:hidden min-h-[44px] flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-[#314e3e] text-white dark:bg-[#d6b883] dark:text-[#19251d]"
                  >
                    {isFormOpenMobile ? <ChevronUp className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    <span>{isFormOpenMobile ? "Đóng form" : "Thêm ngày nghỉ"}</span>
                  </button>

                  <button
                    type="button"
                    disabled={saving}
                    onClick={handleGenerateTemplateHolidays}
                    className="min-h-[44px] flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-700/10 hover:bg-amber-700/20 text-[#7c5c2d] dark:text-[#d4b47d] border border-amber-600/30 transition-all active:scale-95 cursor-pointer whitespace-nowrap"
                    title="Tạo sẵn mẫu ngày nghỉ Giáng Sinh, Tết Nguyên Đán, Phục Sinh"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Tạo mẫu Ngày lễ & Tết</span>
                  </button>
                </div>
              </div>

              {/* Bố cục 2 Cột trên Desktop (md:grid-cols-12) */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                {/* CỘT TRÁI: FORM THÊM MỚI (Hiện trên Desktop, Thu gọn trên Mobile) */}
                <div className={`md:col-span-5 ${isFormOpenMobile ? "block" : "hidden md:block"}`}>
                  <form onSubmit={handleAddHoliday} className="p-4 sm:p-5 rounded-2xl bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237] space-y-3.5 shadow-xs sticky top-0">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#314e3e] dark:text-[#d6b883] flex items-center gap-1.5">
                      <Plus className="w-4 h-4 stroke-[2.5]" /> Thêm ngày nghỉ lễ mới
                    </span>

                    <div>
                      <label className="block text-xs font-bold text-[#293d32] dark:text-[#ecece0] mb-1">
                        Ngày nghỉ (Chúa Nhật):
                      </label>
                      <input
                        type="date"
                        required
                        value={newHolidayDate}
                        onChange={(e) => setNewHolidayDate(e.target.value)}
                        className="w-full min-h-[44px] rounded-xl border border-[#dedfd4] dark:border-[#354237] bg-[#fffefa] dark:bg-[#1e2821] px-3.5 py-2 text-xs sm:text-sm font-semibold text-[#293d32] dark:text-[#ecece0] outline-none shadow-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#293d32] dark:text-[#ecece0] mb-1">
                        Tên ngày lễ / Dịp nghỉ:
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="vd: Nghỉ Tết Nguyên Đán..."
                        value={newHolidayName}
                        onChange={(e) => setNewHolidayName(e.target.value)}
                        className="w-full min-h-[44px] rounded-xl border border-[#dedfd4] dark:border-[#354237] bg-[#fffefa] dark:bg-[#1e2821] px-3.5 py-2 text-xs sm:text-sm font-semibold text-[#293d32] dark:text-[#ecece0] outline-none shadow-xs"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-xs font-bold text-[#293d32] dark:text-[#ecece0] mb-1">
                          Học kỳ:
                        </label>
                        <select
                          value={newHolidayHocKy}
                          onChange={(e) => setNewHolidayHocKy(Number(e.target.value))}
                          className="w-full min-h-[44px] rounded-xl border border-[#dedfd4] dark:border-[#354237] bg-[#fffefa] dark:bg-[#1e2821] px-2.5 py-2 text-xs font-bold text-[#293d32] dark:text-[#ecece0] outline-none shadow-xs"
                        >
                          <option value={1}>Học kỳ I</option>
                          <option value={2}>Học kỳ II</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#293d32] dark:text-[#ecece0] mb-1">
                          Loại ngày nghỉ:
                        </label>
                        <select
                          value={newHolidayType}
                          onChange={(e) => setNewHolidayType(e.target.value)}
                          className="w-full min-h-[44px] rounded-xl border border-[#dedfd4] dark:border-[#354237] bg-[#fffefa] dark:bg-[#1e2821] px-2.5 py-2 text-xs font-bold text-[#293d32] dark:text-[#ecece0] outline-none shadow-xs"
                        >
                          {HOLIDAY_TYPES.map(t => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={addingHoliday}
                      className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#314e3e] hover:bg-[#263e32] text-white dark:bg-[#d6b883] dark:hover:bg-[#c9a76d] dark:text-[#19251d] shadow-sm active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {addingHoliday ? <Spinner className="w-4 h-4" /> : <Plus className="w-4 h-4 stroke-[2.5]" />}
                      <span>{addingHoliday ? "Đang lưu…" : "Thêm vào danh sách"}</span>
                    </button>
                  </form>
                </div>

                {/* CỘT PHẢI: DANH SÁCH NGÀY NGHỈ ĐƯỢC PHÂN NHÓM THEO HỌC KỲ */}
                <div className="md:col-span-7 space-y-4">
                  {/* Pills Lọc Loại Ngày Nghỉ */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none" data-lenis-prevent>
                    {HOLIDAY_FILTER_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setHolidayFilter(opt.id)}
                        className={`min-h-[36px] px-3 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                          holidayFilter === opt.id
                            ? "bg-[#314e3e] text-white dark:bg-[#d6b883] dark:text-[#19251d] shadow-xs"
                            : "bg-[#faf8f3] dark:bg-[#151c18] text-[#575e55] dark:text-[#b0b9ac] border border-[#dedfd4] dark:border-[#354237]"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  {/* NHÓM HỌC KỲ I */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#314e3e] dark:text-[#d6b883] flex items-center gap-1.5">
                        <Church className="w-3.5 h-3.5 text-[#314e3e] dark:text-[#d6b883]" />
                        <span>Học Kỳ I ({hk1Holidays.length} ngày nghỉ)</span>
                      </span>
                    </div>

                    {hk1Holidays.length === 0 ? (
                      <div className="py-5 text-center text-xs text-[#575e55] dark:text-[#b0b9ac] border border-dashed border-[#dedfd4] dark:border-[#354237] rounded-xl bg-[#faf8f3]/40 dark:bg-[#151c18]/40">
                        Chưa có ngày nghỉ nào trong Học kỳ I.
                      </div>
                    ) : (
                      hk1Holidays.map((h) => {
                        const typeConfig = holidayTypeMap[h.loai_nghi] || holidayTypeMap.nghi_le;
                        const isBusy = busyHolidayId === h.id;
                        return (
                          <div
                            key={h.id || h.ngay}
                            className="p-3 rounded-xl bg-[#fffefa] dark:bg-[#1e2821] border border-[#dedfd4] dark:border-[#354237] flex items-center justify-between gap-3 transition-all hover:border-[#314e3e]/40 shadow-xs"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className={`px-2 py-0.5 rounded-lg text-xs font-bold border shrink-0 ${typeConfig.color}`}>
                                {typeConfig.label}
                              </span>
                              <div className="min-w-0">
                                <p className="text-xs sm:text-sm font-bold text-[#293d32] dark:text-[#ecece0] truncate">
                                  {h.ten_ngay_le}
                                </p>
                                <p className="text-xs font-semibold text-[#575e55] dark:text-[#b0b9ac]">
                                  {formatVNDate(new Date(h.ngay))}
                                </p>
                              </div>
                            </div>

                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => handleDeleteHoliday(h.id, h.ten_ngay_le)}
                              className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 dark:hover:text-red-400 rounded-xl active:scale-95 transition-all cursor-pointer shrink-0"
                              aria-label={`Xóa ngày nghỉ ${h.ten_ngay_le}`}
                              title="Xóa ngày nghỉ"
                            >
                              {isBusy ? <Spinner className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* NHÓM HỌC KỲ II */}
                  <div className="space-y-2 pt-2 border-t border-[#dedfd4]/60 dark:border-[#354237]/60">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#314e3e] dark:text-[#d6b883] flex items-center gap-1.5">
                        <Church className="w-3.5 h-3.5 text-[#314e3e] dark:text-[#d6b883]" />
                        <span>Học Kỳ II ({hk2Holidays.length} ngày nghỉ)</span>
                      </span>
                    </div>

                    {hk2Holidays.length === 0 ? (
                      <div className="py-5 text-center text-xs text-[#575e55] dark:text-[#b0b9ac] border border-dashed border-[#dedfd4] dark:border-[#354237] rounded-xl bg-[#faf8f3]/40 dark:bg-[#151c18]/40">
                        Chưa có ngày nghỉ nào trong Học kỳ II.
                      </div>
                    ) : (
                      hk2Holidays.map((h) => {
                        const typeConfig = holidayTypeMap[h.loai_nghi] || holidayTypeMap.nghi_le;
                        const isBusy = busyHolidayId === h.id;
                        return (
                          <div
                            key={h.id || h.ngay}
                            className="p-3 rounded-xl bg-[#fffefa] dark:bg-[#1e2821] border border-[#dedfd4] dark:border-[#354237] flex items-center justify-between gap-3 transition-all hover:border-[#314e3e]/40 shadow-xs"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className={`px-2 py-0.5 rounded-lg text-xs font-bold border shrink-0 ${typeConfig.color}`}>
                                {typeConfig.label}
                              </span>
                              <div className="min-w-0">
                                <p className="text-xs sm:text-sm font-bold text-[#293d32] dark:text-[#ecece0] truncate">
                                  {h.ten_ngay_le}
                                </p>
                                <p className="text-xs font-semibold text-[#575e55] dark:text-[#b0b9ac]">
                                  {formatVNDate(new Date(h.ngay))}
                                </p>
                              </div>
                            </div>

                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => handleDeleteHoliday(h.id, h.ten_ngay_le)}
                              className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 dark:hover:text-red-400 rounded-xl active:scale-95 transition-all cursor-pointer shrink-0"
                              aria-label={`Xóa ngày nghỉ ${h.ten_ngay_le}`}
                              title="Xóa ngày nghỉ"
                            >
                              {isBusy ? <Spinner className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sticky Footer Bar with iOS Safe Area */}
        <div className="px-4 sm:px-6 py-3 border-t border-[#dedfd4] dark:border-[#354237] bg-[#faf8f3] dark:bg-[#151c18] flex items-center justify-end gap-3 shrink-0 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#fffefa] dark:bg-[#1e2821] text-[#293d32] dark:text-[#ecece0] border border-[#dedfd4] dark:border-[#354237] hover:bg-[#dedfd4]/30 active:scale-98 transition-all cursor-pointer"
          >
            Đóng cửa sổ
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
