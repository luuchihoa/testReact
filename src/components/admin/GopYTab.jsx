import React, { useState, useEffect, useCallback } from "react";
import { MessageSquare, Phone, Clock, Inbox, ChevronLeft, Check, CheckCircle2, RotateCcw, Info, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAdminContext } from "./AdminContext.jsx";
import { LIEN_HE_STATUS_TABS, LIEN_HE_LABELS_VI, LIEN_HE_BADGE } from "./constants.js";
import { fetchLienHe, updateLienHeStatus } from "./dataLayer.js";
import { SidebarDetailSkeleton } from "../ui/Skeleton.jsx";

// Hằng số Easing chuẩn
const APPLE_EASE = [0.16, 1, 0.3, 1];

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
  moi:      { icon: RotateCcw,    cls: "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-black/5 dark:border-white/5 md:hover:bg-stone-200 dark:md:hover:bg-stone-700" },
  da_doc:   { icon: Check,        cls: "bg-blue-600 text-white md:hover:bg-blue-700 border-transparent" },
  da_xu_ly: { icon: CheckCircle2, cls: "bg-emerald-600 text-white md:hover:bg-emerald-700 border-transparent" },
};

export default function GopYTab() {
  const { showToast, refreshPendingGopY } = useAdminContext();
  const [statusFilter, setStatusFilter] = useState("moi");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [mobileView, setMobileView] = useState("list");
  const [processing, setProcessing] = useState(null);

  const isMobile = window.innerWidth < 1024; // lg breakpoint

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
    if (isMobile) setMobileView("detail"); 
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
    <motion.div 
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: APPLE_EASE }}
      className="flex flex-col gap-5 sm:gap-6"
    >
      
      {/* Banner thông báo tự động xóa */}
      <div className="bg-amber-50/80 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-800/30 p-4 rounded-[24px] backdrop-blur-md shadow-sm flex items-start gap-4 transition-all duration-300">
        <div className="mt-0.5 w-9 h-9 flex items-center justify-center rounded-full flex-shrink-0 bg-white/50 dark:bg-stone-800/50 shadow-sm border border-black/5 dark:border-white/5">
          <Info className="w-4.5 h-4.5 text-amber-800/70 dark:text-amber-400/70" strokeWidth={2.5} />
        </div>
        <div className="flex-1 mt-0.5">
          <p className="text-[11px] font-bold uppercase tracking-widest text-amber-800/70 dark:text-amber-400/70 mb-1.5">
            Dọn dẹp hệ thống định kỳ
          </p>
          <div className="text-[14px] font-medium text-amber-950 dark:text-amber-50 leading-relaxed">
            Hệ thống sẽ <strong className="font-bold text-red-600 dark:text-red-400">tự động xoá</strong> các góp ý / liên hệ ở trạng thái <strong className="font-bold">Đã xử lý</strong> sau 7 ngày.
          </div>
        </div>
      </div>

      {/* ---------- Bộ lọc trạng thái ---------- */}
      <div 
        className="flex gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden" 
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        data-lenis-prevent
      >
        {LIEN_HE_STATUS_TABS.map((s) => (
          <button
            key={s} 
            type="button"
            onClick={() => {
               setStatusFilter(s);
               if (isMobile) setMobileView("list");
            }}
            className={`flex-shrink-0 px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all duration-300 active:scale-[0.97] ${
              statusFilter === s 
                ? "bg-amber-900 dark:bg-amber-600 text-white shadow-sm" 
                : "bg-white/60 dark:bg-stone-900/40 text-stone-500 dark:text-stone-400 border border-amber-900/10 dark:border-amber-100/10 md:hover:bg-white dark:md:hover:bg-stone-800"
            }`}
          >
            {LIEN_HE_LABELS_VI[s]}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
      {loading ? (
        <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <SidebarDetailSkeleton items={4} />
        </motion.div>
      ) : rows.length === 0 ? (
        <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4, ease: APPLE_EASE }}>
          <div className="flex flex-col items-center justify-center gap-4 py-24 text-center bg-white/60 dark:bg-[#1C1917]/80 backdrop-blur-xl rounded-[28px] border border-amber-900/10 dark:border-amber-100/10 shadow-sm">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-stone-100 dark:bg-stone-800 border border-black/5 dark:border-white/5">
              <Inbox className="h-7 w-7 text-stone-400 dark:text-stone-500" strokeWidth={2} />
            </div>
            <div>
              <p className="text-[16px] font-bold text-amber-950 dark:text-amber-50">
                Không có thư nào ở trạng thái "{LIEN_HE_LABELS_VI[statusFilter]}"
              </p>
              <p className="text-[14px] font-medium text-stone-500 dark:text-stone-400 mt-1">Hộp thư hiện đang trống.</p>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, ease: APPLE_EASE }} className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-5 lg:gap-6">
          
          {/* ------- Cột Danh sách (Trái) ------- */}
          <div className={`${mobileView === "detail" ? "hidden lg:flex" : "flex"} flex-col gap-3`}>
            
            {/* Tiêu đề & Count */}
            <div className="flex items-center justify-between px-2 pb-1">
              <h3 className="text-[12px] font-bold text-amber-800/70 dark:text-amber-400/70 tracking-widest uppercase ml-1">
                {LIEN_HE_LABELS_VI[statusFilter]}
              </h3>
              <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-2 rounded-full bg-amber-100/80 dark:bg-amber-900/30 text-amber-900 dark:text-amber-100 text-[12px] font-bold tabular-nums shadow-sm">
                {rows.length}
              </span>
            </div>

            <div className="flex flex-col gap-2.5 max-h-[70vh] overflow-y-auto" data-lenis-prevent>
              {rows.map((r, i) => {
                const isActive = selected?.id === r.id;
                return (
                  <motion.button
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.05, ease: APPLE_EASE }}
                    key={r.id} 
                    type="button"
                    onClick={() => openRow(r)}
                    className={`group relative text-left rounded-[20px] px-5 py-4 transition-all duration-300 ease-out active:scale-[0.98] border ${
                        isActive 
                        ? "bg-amber-50/80 dark:bg-amber-900/20 border-amber-200/60 dark:border-amber-800/40 shadow-sm" 
                        : "bg-white/80 dark:bg-[#1C1917]/80 backdrop-blur-xl border-amber-900/10 dark:border-amber-100/10 md:hover:bg-amber-50/50 dark:md:hover:bg-amber-900/10 shadow-sm"
                    }`}
                  >
                    <p className={`text-[15px] font-bold truncate leading-snug ${isActive ? "text-amber-950 dark:text-amber-50" : "text-stone-800 dark:text-stone-200"}`}>
                        {r.ho_ten}
                    </p>
                    <p className={`text-[13.5px] truncate mt-1.5 ${isActive ? "text-stone-600 dark:text-stone-300" : "text-stone-500 dark:text-stone-400"}`}>
                        {r.noi_dung}
                    </p>
                    <div className={`flex items-center gap-1.5 mt-3 text-[12px] font-medium ${isActive ? "text-amber-700 dark:text-amber-400" : "text-stone-400 dark:text-stone-500"}`}>
                        <span className="inline-flex items-center gap-1 shrink-0">
                          <Clock className="w-3.5 h-3.5" strokeWidth={2} />
                          {relativeTime(r.created_at)}
                        </span>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* ------- Cột Chi tiết (Phải) ------- */}
          {selected && (
            <div className={`${mobileView === "list" ? "hidden lg:block" : "block"} lg:h-fit sticky top-24`}>
              <div className="bg-white/80 dark:bg-[#1C1917]/80 backdrop-blur-xl border border-amber-900/10 dark:border-amber-100/10 rounded-[28px] p-6 sm:p-8 shadow-sm">
                
                {/* Nút Back (Chỉ hiện trên Mobile) */}
                <button 
                  type="button"
                  onClick={() => setMobileView("list")} 
                  className="lg:hidden inline-flex items-center gap-1.5 text-[14px] font-bold text-stone-500 dark:text-stone-400 mb-6 -ml-1 px-3 py-2 active:scale-95 transition-all bg-white dark:bg-stone-800 rounded-xl border border-black/5 dark:border-white/5 shadow-sm"
                >
                  <ChevronLeft className="w-4 h-4" strokeWidth={2.5} /> 
                  Quay lại danh sách
                </button>

                {/* Header Chi tiết */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-amber-100/80 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0 shadow-sm border border-amber-200/50 dark:border-amber-800/30">
                      <MessageSquare className="w-6 h-6 text-amber-700 dark:text-amber-400" />
                    </div>
                    <div>
                      <h2 className="text-[22px] sm:text-[26px] font-extrabold text-amber-950 dark:text-amber-50 font-serif leading-tight">
                        {selected.ho_ten}
                      </h2>
                      <p className="text-[13.5px] text-stone-500 dark:text-stone-400 flex items-center gap-1.5 mt-1.5 font-medium">
                        <Clock className="w-4 h-4" /> {relativeTime(selected.created_at)}
                      </p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-3.5 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider flex-shrink-0 shadow-sm ${LIEN_HE_BADGE[selected.trang_thai]}`}>
                    {LIEN_HE_LABELS_VI[selected.trang_thai]}
                  </span>
                </div>

                {/* Gọi điện thoại liên hệ */}
                <div className="mt-7 mb-7">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-amber-800/70 dark:text-amber-400/70 mb-2.5 ml-1">Số điện thoại</p>
                  <a 
                    href={`tel:${selected.sdt}`} 
                    className="inline-flex items-center gap-3 rounded-2xl bg-amber-50/80 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-800/30 px-5 py-3.5 md:hover:bg-amber-100/50 dark:md:hover:bg-amber-900/20 transition-all active:scale-[0.98] shadow-sm"
                  >
                    <Phone className="w-4.5 h-4.5 text-amber-700 dark:text-amber-400" strokeWidth={2.5} />
                    <span className="text-[15px] font-bold text-amber-950 dark:text-amber-50 tabular-nums tracking-wide">{selected.sdt}</span>
                  </a>
                </div>

                {/* Khung Nội dung thư */}
                <div className="rounded-[24px] bg-white/50 dark:bg-stone-900/40 border border-amber-900/10 dark:border-amber-100/10 px-6 py-6 shadow-sm">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-amber-800/70 dark:text-amber-400/70 mb-3 ml-1">Nội dung tin nhắn</p>
                  <p className="text-[15px] text-stone-800 dark:text-stone-200 leading-relaxed whitespace-pre-wrap font-medium">
                    {selected.noi_dung}
                  </p>
                </div>

                {/* Các nút hành động */}
                <div className="flex flex-col sm:flex-row gap-4 mt-8 border-t border-amber-900/10 dark:border-amber-100/10 pt-8">
                  {nextActions(selected.trang_thai).map((s) => {
                    const { icon: Icon, cls } = ACTION_STYLE[s];
                    const busy = processing === s;
                    return (
                      <button
                        key={s} 
                        type="button"
                        disabled={!!processing}
                        onClick={() => handleProcess(s)}
                        className={`flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-[14px] font-bold transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 shadow-sm ${cls}`}
                      >
                        {busy ? <Loader2 className="w-4.5 h-4.5 animate-spin" /> : <Icon className="w-4.5 h-4.5" strokeWidth={2.5} />}
                        {busy ? "Đang xử lý…" : `Chuyển thành "${LIEN_HE_LABELS_VI[s]}"`}
                      </button>
                    );
                  })}
                </div>

              </div>
            </div>
          )}
        </motion.div>
      )}
      </AnimatePresence>
    </motion.div>
  );
}