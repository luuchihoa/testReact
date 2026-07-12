import React, { useState, useEffect, useCallback } from "react";
import {
  UserPlus, Phone, MapPin, Calendar, Loader2, Check, X, Inbox,
  Clock, ChevronLeft, GraduationCap, PhoneCall, RotateCcw,
} from "lucide-react";
import { useAdminContext } from "./AdminContext.jsx";
import { DANG_KY_STATUS_TABS, DANG_KY_LABELS_VI, DANG_KY_BADGE } from "./constants.js";
import { fetchDangKyHoc, processDangKyHoc } from "./dataLayer.js";
import { SidebarDetailSkeleton } from "../ui/Skeleton.jsx";

function relativeTime(iso) {
  const d = new Date(iso);
  const diffMs = Date.now() - d.getTime();
  const min = Math.round(diffMs / 60000);
  if (min < 1) return "Vừa xong";
  if (min < 60) return `${min} phút trước`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr} giờ trước`;
  const day = Math.round(hr / 24);
  if (day < 7) return `${day} ngày trước`;
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

// Từ 1 trạng thái, các bước tiếp theo hợp lý để hiển thị làm nút hành động.
// "moi" không hiện lại chính nó; đã xử lý thì luôn cho phép đưa về "moi"
// (RotateCcw) đề phòng admin bấm nhầm.
function nextActions(current) {
  if (current === "moi") return ["da_lien_he", "da_xep_lop", "tu_choi"];
  return ["moi", "da_lien_he", "da_xep_lop", "tu_choi"].filter((s) => s !== current);
}

const ACTION_STYLE = {
  moi:        { icon: RotateCcw,  cls: "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 md:hover:bg-stone-200 dark:md:hover:bg-stone-700" },
  da_lien_he: { icon: PhoneCall,  cls: "bg-blue-500 text-white md:hover:bg-blue-600" },
  da_xep_lop: { icon: Check,      cls: "bg-emerald-500 text-white md:hover:bg-emerald-600" },
  tu_choi:    { icon: X,          cls: "bg-red-500 text-white md:hover:bg-red-600" },
};

export default function DangKyTab() {
  const { showToast, refreshPendingDangKy } = useAdminContext();

  const [statusFilter, setStatusFilter] = useState("moi");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [ghiChuAdmin, setGhiChuAdmin] = useState("");
  const [processing, setProcessing] = useState(null); // trạng thái đích đang gửi lên, để disable đúng nút
  const [mobileView, setMobileView] = useState("list");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchDangKyHoc(statusFilter);
      setRows(data);
      setSelected((prev) => (prev ? data.find((r) => r.id === prev.id) ?? data[0] ?? null : data[0] ?? null));
    } catch (err) {
      console.error("load dang ky error:", err);
      showToast("Không tải được danh sách đăng ký", "error");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, showToast]);

  useEffect(() => { load(); }, [load]);

  const openRow = (r) => {
    setSelected(r);
    setGhiChuAdmin(r.ghi_chu_admin || "");
    setMobileView("detail");
  };

  const handleProcess = async (trangThaiMoi) => {
    if (!selected) return;
    setProcessing(trangThaiMoi);
    try {
      await processDangKyHoc(selected.id, trangThaiMoi, ghiChuAdmin);
      showToast(`Đã chuyển sang "${DANG_KY_LABELS_VI[trangThaiMoi]}"`, "success");
      setMobileView("list");
      await Promise.all([load(), refreshPendingDangKy()]);
    } catch (err) {
      console.error("process dang ky error:", err);
      showToast(err?.message || "Cập nhật thất bại", "error");
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="flex flex-col gap-4 sm:gap-5">
      {/* ---------- Bộ lọc trạng thái ---------- */}
      <div
        className="flex gap-1.5 overflow-x-auto [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        data-lenis-prevent
      >
        {DANG_KY_STATUS_TABS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatusFilter(s)}
            className={`flex-shrink-0 px-3.5 py-2 rounded-full text-[12.5px] font-semibold transition-all active:scale-[0.97] ${
              statusFilter === s
                ? "bg-stone-900 dark:bg-white text-white dark:text-stone-900"
                : "bg-white dark:bg-stone-900 text-stone-500 dark:text-stone-400 border border-stone-200 dark:border-stone-800"
            }`}
          >
            {DANG_KY_LABELS_VI[s]}
          </button>
        ))}
      </div>

      {loading ? (
        <SidebarDetailSkeleton items={4} />
      ) : rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-stone-100 dark:bg-stone-800">
            <Inbox className="h-6 w-6 text-stone-400 dark:text-stone-500" strokeWidth={1.75} />
          </div>
          <div>
            <p className="text-[15px] font-semibold text-stone-700 dark:text-stone-200">
              Không có hồ sơ nào ở trạng thái "{DANG_KY_LABELS_VI[statusFilter]}"
            </p>
            <p className="text-[13px] text-stone-400 dark:text-stone-500 mt-0.5">Danh sách sẽ tự cập nhật khi có đăng ký mới</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
          {/* ------- Danh sách ------- */}
          <div className={`${mobileView === "detail" ? "hidden lg:flex" : "flex"} flex-col gap-1.5`}>
            <div className="flex items-center justify-between px-1 pb-1">
              <h3 className="text-[13px] font-semibold text-stone-400 dark:text-stone-500 tracking-wide">
                {DANG_KY_LABELS_VI[statusFilter].toUpperCase()}
              </h3>
              <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-stone-900 dark:bg-white text-white dark:text-stone-900 text-[11px] font-semibold tabular-nums">
                {rows.length}
              </span>
            </div>

            <div className="flex flex-col gap-1.5 max-h-[70vh] overflow-y-auto" data-lenis-prevent>
              {rows.map((r) => {
                const isActive = selected?.id === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => openRow(r)}
                    className={`group text-left rounded-2xl px-3.5 py-3 transition-all duration-200 ease-out active:scale-[0.985] ${
                      isActive
                        ? "bg-stone-900 dark:bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
                        : "bg-white dark:bg-stone-900 md:hover:bg-stone-50 dark:md:hover:bg-stone-800/70 border border-stone-100 dark:border-stone-800"
                    }`}
                  >
                    <p className={`text-[14px] font-semibold truncate leading-snug ${isActive ? "text-white dark:text-stone-900" : "text-stone-900 dark:text-stone-100"}`}>
                      {r.ho_ten}
                    </p>
                    <p className={`text-[12px] truncate mt-0.5 ${isActive ? "text-stone-300 dark:text-stone-500" : "text-stone-500 dark:text-stone-400"}`}>
                      {r.khoi_dang_ky}
                    </p>
                    <div className={`flex items-center gap-1.5 mt-1 text-[12px] ${isActive ? "text-stone-300 dark:text-stone-500" : "text-stone-400 dark:text-stone-500"}`}>
                      <span className="truncate">{r.sdt}</span>
                      <span className="opacity-50">·</span>
                      <span className="inline-flex items-center gap-1 shrink-0">
                        <Clock className="w-3 h-3" strokeWidth={2} />
                        {relativeTime(r.created_at)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ------- Chi tiết ------- */}
          {selected && (
            <div className={`${mobileView === "list" ? "hidden lg:block" : "block"}`}>
              <div className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-[28px] p-5 sm:p-7 shadow-[0_1px_3px_rgba(0,0,0,0.03)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.3)]">

                <button
                  type="button"
                  onClick={() => setMobileView("list")}
                  className="lg:hidden inline-flex items-center gap-1 text-[13px] font-medium text-stone-500 dark:text-stone-400 mb-4 -ml-1 px-1 py-1 active:opacity-60"
                >
                  <ChevronLeft className="w-4 h-4" strokeWidth={2.25} />
                  Danh sách
                </button>

                <div className="flex items-start justify-between gap-4 mb-1.5">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center flex-shrink-0">
                      <UserPlus className="w-5 h-5 text-stone-400 dark:text-stone-500" strokeWidth={2} />
                    </div>
                    <div>
                      <h2 className="text-[18px] sm:text-[20px] font-bold text-stone-900 dark:text-stone-100 leading-tight tracking-[-0.01em]">
                        {selected.ho_ten}
                      </h2>
                      <p className="text-[12.5px] text-stone-400 dark:text-stone-500">Sinh năm {selected.nam_sinh}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold flex-shrink-0 ${DANG_KY_BADGE[selected.trang_thai]}`}>
                    {DANG_KY_LABELS_VI[selected.trang_thai]}
                  </span>
                </div>

                {/* Thông tin liên hệ */}
                <div className="grid sm:grid-cols-2 gap-3 mt-5">
                  <a
                    href={`tel:${selected.sdt}`}
                    className="flex items-center gap-3 rounded-2xl bg-stone-50/70 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-800 px-4 py-3 md:hover:bg-stone-100 dark:md:hover:bg-stone-800 transition-colors"
                  >
                    <Phone className="w-4 h-4 text-stone-400 dark:text-stone-500 flex-shrink-0" strokeWidth={2} />
                    <div className="min-w-0">
                      <p className="text-[11px] text-stone-400 dark:text-stone-500">SĐT phụ huynh</p>
                      <p className="text-[14px] font-semibold text-stone-800 dark:text-stone-100 truncate">{selected.sdt}</p>
                    </div>
                  </a>
                  <div className="flex items-center gap-3 rounded-2xl bg-stone-50/70 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-800 px-4 py-3">
                    <MapPin className="w-4 h-4 text-stone-400 dark:text-stone-500 flex-shrink-0" strokeWidth={2} />
                    <div className="min-w-0">
                      <p className="text-[11px] text-stone-400 dark:text-stone-500">Giáo xóm</p>
                      <p className="text-[14px] font-semibold text-stone-800 dark:text-stone-100 truncate">{selected.giao_xom}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-2xl bg-stone-50/70 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-800 px-4 py-3">
                    <GraduationCap className="w-4 h-4 text-stone-400 dark:text-stone-500 flex-shrink-0" strokeWidth={2} />
                    <div className="min-w-0">
                      <p className="text-[11px] text-stone-400 dark:text-stone-500">Khối đăng ký</p>
                      <p className="text-[14px] font-semibold text-stone-800 dark:text-stone-100 truncate">{selected.khoi_dang_ky}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-2xl bg-stone-50/70 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-800 px-4 py-3">
                    <Calendar className="w-4 h-4 text-stone-400 dark:text-stone-500 flex-shrink-0" strokeWidth={2} />
                    <div className="min-w-0">
                      <p className="text-[11px] text-stone-400 dark:text-stone-500">Nộp hồ sơ</p>
                      <p className="text-[14px] font-semibold text-stone-800 dark:text-stone-100 truncate">{relativeTime(selected.created_at)}</p>
                    </div>
                  </div>
                </div>

                {selected.ghi_chu && (
                  <div className="mt-4 rounded-2xl bg-amber-50/60 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/15 px-4 py-3.5">
                    <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 mb-1">Ghi chú từ phụ huynh</p>
                    <p className="text-[13.5px] text-stone-700 dark:text-stone-300 leading-relaxed">{selected.ghi_chu}</p>
                  </div>
                )}

                {selected.xu_ly_boi && (
                  <p className="text-[12px] text-stone-400 dark:text-stone-500 mt-3">
                    Xử lý lần cuối bởi <span className="font-semibold text-stone-500 dark:text-stone-400">{selected.xu_ly_boi}</span> · {relativeTime(selected.xu_ly_luc)}
                  </p>
                )}

                {/* Ghi chú nội bộ của admin */}
                <div className="mt-5">
                  <label className="text-[12px] font-semibold text-stone-500 dark:text-stone-400">Ghi chú nội bộ (tuỳ chọn)</label>
                  <textarea
                    value={ghiChuAdmin}
                    onChange={(e) => setGhiChuAdmin(e.target.value)}
                    rows={2}
                    placeholder="VD: Đã gọi 2 lần chưa bắt máy, hẹn gọi lại chiều thứ 7…"
                    className="mt-1.5 w-full rounded-2xl border border-stone-200 dark:border-stone-700 px-3.5 py-3 text-[14px] bg-stone-50/50 dark:bg-stone-800/50 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-stone-900/10 dark:focus:ring-white/10 focus:border-stone-300 dark:focus:border-stone-600 resize-none transition-colors"
                  />
                </div>

                {/* Hành động */}
                <div className="flex flex-col sm:flex-row gap-2.5 mt-5 pb-[env(safe-area-inset-bottom)]">
                  {nextActions(selected.trang_thai).map((s) => {
                    const { icon: Icon, cls } = ACTION_STYLE[s];
                    const busy = processing === s;
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => handleProcess(s)}
                        disabled={!!processing}
                        className={`flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-3 sm:py-2.5 rounded-full text-[14px] font-semibold transition-all duration-150 active:scale-[0.97] disabled:opacity-50 disabled:active:scale-100 shadow-[0_1px_2px_rgba(0,0,0,0.08)] ${cls}`}
                      >
                        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Icon className="w-4 h-4" strokeWidth={2.5} />}
                        {DANG_KY_LABELS_VI[s]}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}