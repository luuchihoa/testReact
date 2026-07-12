import React, { useState, useEffect, useCallback } from "react";
import { MessageSquare, Phone, Clock, Inbox, ChevronLeft, Check, CheckCircle2, RotateCcw, Loader2 } from "lucide-react";
import { useAdminContext } from "./AdminContext.jsx";
import { LIEN_HE_STATUS_TABS, LIEN_HE_LABELS_VI, LIEN_HE_BADGE } from "./constants.js";
import { fetchLienHe, updateLienHeStatus } from "./dataLayer.js";
import { SidebarDetailSkeleton } from "../ui/Skeleton.jsx";

// Hàm format thời gian rút gọn, thân thiện
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
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

// Logic luân chuyển trạng thái
function nextActions(current) {
  if (current === "moi") return ["da_doc", "da_xu_ly"];
  if (current === "da_doc") return ["da_xu_ly", "moi"];
  return ["moi", "da_doc"];
}

const ACTION_STYLE = {
  moi:      { icon: RotateCcw,    cls: "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 md:hover:bg-stone-200 dark:md:hover:bg-stone-700" },
  da_doc:   { icon: Check,        cls: "bg-blue-500 text-white md:hover:bg-blue-600" },
  da_xu_ly: { icon: CheckCircle2, cls: "bg-emerald-500 text-white md:hover:bg-emerald-600" },
};

export default function GopYTab() {
  const { showToast, refreshPendingGopY } = useAdminContext();
  const [statusFilter, setStatusFilter] = useState("moi");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [mobileView, setMobileView] = useState("list");
  const [processing, setProcessing] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchLienHe(statusFilter);
      setRows(data);
      setSelected((prev) => (prev ? data.find((r) => r.id === prev.id) ?? data[0] ?? null : data[0] ?? null));
    } catch (err) {
      console.error("load lien he error:", err);
      showToast("Không tải được danh sách góp ý", "error");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, showToast]);

  useEffect(() => { load(); }, [load]);

  const openRow = (r) => { 
    setSelected(r); 
    setMobileView("detail"); 
  };

  const handleProcess = async (trangThaiMoi) => {
    if (!selected) return;
    setProcessing(trangThaiMoi);
    try {
      await updateLienHeStatus(selected.id, trangThaiMoi);
      showToast(`Đã chuyển thư sang "${LIEN_HE_LABELS_VI[trangThaiMoi]}"`, "success");
      setMobileView("list");
      await Promise.all([load(), refreshPendingGopY()]);
    } catch (err) {
      console.error("process lien he error:", err);
      showToast("Cập nhật thất bại", "error");
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="flex flex-col gap-4 sm:gap-5">
      {/* ---------- Bộ lọc trạng thái (Segmented Tabs) ---------- */}
      <div 
        className="flex gap-1.5 overflow-x-auto [&::-webkit-scrollbar]:hidden" 
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        data-lenis-prevent
      >
        {LIEN_HE_STATUS_TABS.map((s) => (
          <button
            key={s} 
            type="button"
            onClick={() => setStatusFilter(s)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-[12.5px] font-semibold transition-all active:scale-[0.97] ${
              statusFilter === s 
                ? "bg-stone-900 dark:bg-white text-white dark:text-stone-900 shadow-md" 
                : "bg-white dark:bg-stone-900 text-stone-500 dark:text-stone-400 border border-stone-200 dark:border-stone-800"
            }`}
          >
            {LIEN_HE_LABELS_VI[s]}
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
              Không có thư nào ở trạng thái "{LIEN_HE_LABELS_VI[statusFilter]}"
            </p>
            <p className="text-[13px] text-stone-400 dark:text-stone-500 mt-0.5">Hộp thư hiện đang trống.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
          
          {/* ------- Cột Danh sách (Trái) ------- */}
          <div className={`${mobileView === "detail" ? "hidden lg:flex" : "flex"} flex-col gap-1.5`}>
            
            {/* Tiêu đề & Count */}
            <div className="flex items-center justify-between px-1 pb-1">
              <h3 className="text-[13px] font-semibold text-stone-400 dark:text-stone-500 tracking-wide uppercase">
                {LIEN_HE_LABELS_VI[statusFilter]}
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
                    className={`group relative text-left rounded-2xl px-4 py-3.5 transition-all duration-200 ease-out active:scale-[0.985] border overflow-hidden ${
                        isActive 
                        ? "bg-stone-100 dark:bg-stone-800/60 border-stone-200/70 dark:border-stone-700 shadow-sm" 
                        : "bg-white dark:bg-stone-900 border-stone-100 dark:border-stone-800 md:hover:bg-stone-50 dark:md:hover:bg-stone-800/70"
                    }`}
                    >
                    {/* Vạch báo trạng thái bên trái cho thư đang chọn */}
                    {isActive && (
                      <div className="absolute left-0 top-3 bottom-3 w-[3px] bg-red-500 dark:bg-red-400 rounded-r-full" />
                    )}
                    <p className={`text-[14px] font-bold truncate leading-snug ${isActive ? "text-stone-900 dark:text-white" : "text-stone-800 dark:text-stone-200"}`}>
                        {r.ho_ten}
                    </p>
                    <p className={`text-[12.5px] truncate mt-1 ${isActive ? "text-stone-600 dark:text-stone-300" : "text-stone-500 dark:text-stone-400"}`}>
                        {r.noi_dung}
                    </p>
                    <div className={`flex items-center gap-1.5 mt-1.5 text-[11.5px] font-medium ${isActive ? "text-stone-500 dark:text-stone-400" : "text-stone-400 dark:text-stone-500"}`}>
                        <span className="inline-flex items-center gap-1 shrink-0">
                        <Clock className="w-3.5 h-3.5" strokeWidth={2} />
                        {relativeTime(r.created_at)}
                        </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ------- Cột Chi tiết (Phải) ------- */}
          {selected && (
            <div className={`${mobileView === "list" ? "hidden lg:block" : "block"}`}>
              <div className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-[28px] p-5 sm:p-7 shadow-[0_1px_3px_rgba(0,0,0,0.03)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.3)]">
                
                {/* Nút Back (Chỉ hiện trên Mobile) */}
                <button 
                  type="button"
                  onClick={() => setMobileView("list")} 
                  className="lg:hidden inline-flex items-center gap-1 text-[13px] font-medium text-stone-500 dark:text-stone-400 mb-4 -ml-1 px-1 py-1 active:opacity-60"
                >
                  <ChevronLeft className="w-4 h-4" strokeWidth={2.25} /> 
                  Danh sách
                </button>

                {/* Header Chi tiết */}
                <div className="flex items-start justify-between gap-4 mb-1.5">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-5 h-5 text-stone-600 dark:text-stone-300" />
                    </div>
                    <div>
                      <h2 className="text-[18px] sm:text-[20px] font-bold text-stone-900 dark:text-stone-100 leading-tight tracking-[-0.01em]">
                        {selected.ho_ten}
                      </h2>
                      <p className="text-[12.5px] text-stone-400 dark:text-stone-500 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3.5 h-3.5" /> {relativeTime(selected.created_at)}
                      </p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold flex-shrink-0 ${LIEN_HE_BADGE[selected.trang_thai]}`}>
                    {LIEN_HE_LABELS_VI[selected.trang_thai]}
                  </span>
                </div>

                {/* Gọi điện thoại liên hệ */}
                <div className="mt-5 mb-5">
                  <a 
                    href={`tel:${selected.sdt}`} 
                    className="inline-flex items-center gap-2.5 rounded-2xl bg-stone-50/70 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-800 px-4 py-2.5 md:hover:bg-stone-100 dark:md:hover:bg-stone-800 transition-colors active:scale-[0.98]"
                  >
                    <Phone className="w-4 h-4 text-stone-500 dark:text-stone-400" />
                    <span className="text-[14px] font-bold text-stone-800 dark:text-stone-200 tabular-nums tracking-wide">{selected.sdt}</span>
                  </a>
                </div>

                {/* Khung Nội dung thư */}
                <div className="rounded-2xl bg-stone-50/70 dark:bg-stone-950/40 border border-stone-100 dark:border-stone-800/80 px-4 sm:px-5 py-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-2">Nội dung tin nhắn</p>
                  <p className="text-[14px] sm:text-[14.5px] text-stone-800 dark:text-stone-200 leading-relaxed whitespace-pre-wrap">
                    {selected.noi_dung}
                  </p>
                </div>

                {/* Các nút hành động */}
                <div className="flex flex-col sm:flex-row gap-2.5 mt-6 border-t border-stone-100 dark:border-stone-800 pt-5">
                  {nextActions(selected.trang_thai).map((s) => {
                    const { icon: Icon, cls } = ACTION_STYLE[s];
                    const busy = processing === s;
                    return (
                      <button
                        key={s} 
                        type="button"
                        disabled={!!processing}
                        onClick={() => handleProcess(s)}
                        className={`flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-3 sm:py-2.5 rounded-full text-[13.5px] font-bold transition-all duration-150 active:scale-[0.97] disabled:opacity-50 disabled:active:scale-100 shadow-[0_1px_2px_rgba(0,0,0,0.08)] ${cls}`}
                      >
                        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Icon className="w-4 h-4" strokeWidth={2.5} />}
                        Chuyển thành "{LIEN_HE_LABELS_VI[s]}"
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