import React, { useState, useEffect, useCallback } from "react";
import {
  UserPlus, Phone, MapPin, Calendar, Check, X, Inbox, Info,
  Clock, ChevronLeft, GraduationCap, PhoneCall, RotateCcw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAdminContext } from "./AdminContext.jsx";
import { DANG_KY_STATUS_TABS, DANG_KY_LABELS_VI, DANG_KY_BADGE } from "./constants.js";
import { fetchDangKyHoc, processDangKyHoc } from "./dataLayer.js";
import { SidebarDetailSkeleton, Spinner } from "../../components/ui/Skeleton.jsx";

// Hằng số Easing chuẩn
const APPLE_EASE = [0.16, 1, 0.3, 1];

// Helper Functions (Giữ nguyên)
function relativeTime(iso) {
  if (!iso) return "Không xác định";
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

function nextActions(current) {
  if (current === "moi") return ["da_lien_he", "da_xep_lop", "tu_choi"];
  return ["moi", "da_lien_he", "da_xep_lop", "tu_choi"].filter((s) => s !== current);
}

const ACTION_STYLE = {
  moi:        { icon: RotateCcw,  cls: "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-black/5 dark:border-white/5 md:hover:bg-stone-200 dark:hover:bg-stone-700" },
  da_lien_he: { icon: PhoneCall,  cls: "bg-blue-600 text-white md:hover:bg-blue-700 border-transparent" },
  da_xep_lop: { icon: Check,      cls: "bg-emerald-600 text-white md:hover:bg-emerald-700 border-transparent" },
  tu_choi:    { icon: X,          cls: "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 md:hover:bg-red-100 dark:hover:bg-red-500/20 border-transparent" },
};

/* ============================================================
   VIEW CHÍNH: QUẢN LÝ ĐĂNG KÝ HỌC
   ============================================================ */
export default function DangKyTab() {
  const { showToast, refreshPendingDangKy } = useAdminContext();

  // State quản lý dữ liệu
  const [statusFilter, setStatusFilter] = useState("moi");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State quản lý tương tác UI
  const [selected, setSelected] = useState(null);
  const [ghiChuAdmin, setGhiChuAdmin] = useState("");
  const [processing, setProcessing] = useState(null); 
  const [mobileView, setMobileView] = useState("list");

  // Xử lý Responsive động (Enterprise Standard)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Tải dữ liệu và đồng bộ state an toàn
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchDangKyHoc(statusFilter);
      setRows(data);
      
      // Đồng bộ phần tử được chọn và ghi chú
      const newlySelected = data.find((r) => selected && r.id === selected.id) ?? data[0] ?? null;
      setSelected(newlySelected);
      setGhiChuAdmin(newlySelected?.ghi_chu_admin || "");

    } catch (err) {
      console.error("load dang ky error:", err);
      showToast("Không tải được danh sách đăng ký", "error");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, selected?.id, showToast]); // Cần track id để tự cập nhật item đang chọn

  useEffect(() => { 
    load(); 
  }, [load]);

  // Bọc hàm tương tác bằng useCallback để tối ưu bộ nhớ khi nhập liệu Textarea
  const openRow = useCallback((r) => {
    setSelected(r);
    setGhiChuAdmin(r.ghi_chu_admin || "");
    if (isMobile) setMobileView("detail");
  }, [isMobile]);

  const handleProcess = useCallback(async (trangThaiMoi) => {
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
  }, [selected, ghiChuAdmin, load, refreshPendingDangKy, showToast]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: APPLE_EASE }}
      className="flex flex-col gap-5 sm:gap-6 relative"
    >
      {/* Banner thông báo */}
      <div className="bg-amber-50/80 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-800/30 p-4 rounded-[24px] backdrop-blur-md shadow-sm flex items-start gap-4 transition-all duration-300">
        <div className="mt-0.5 w-9 h-9 flex items-center justify-center rounded-full flex-shrink-0 bg-white/50 dark:bg-stone-800/50 shadow-sm border border-black/5 dark:border-white/5">
          <Info className="w-4.5 h-4.5 text-amber-800/70 dark:text-amber-400/70" strokeWidth={2.5} />
        </div>
        <div className="flex-1 mt-0.5">
          <p className="text-[11px] font-bold uppercase tracking-widest text-amber-800/70 dark:text-amber-400/70 mb-1.5">
            Dọn dẹp hồ sơ định kỳ
          </p>
          <div className="text-[14px] font-medium text-amber-950 dark:text-amber-50 leading-relaxed">
            Hệ thống sẽ <strong className="font-bold text-red-600 dark:text-red-400">tự động xóa</strong> các hồ sơ ở trạng thái <strong className="font-bold">Đã xếp lớp</strong> hoặc <strong className="font-bold">Từ chối</strong> sau 7 ngày.
          </div>
        </div>
      </div>

      {/* ---------- Bộ lọc trạng thái ---------- */}
      <div
        className="flex gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {DANG_KY_STATUS_TABS.map((s) => (
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
                : "bg-white/60 dark:bg-stone-900/40 text-stone-500 dark:text-stone-400 border border-amber-900/10 dark:border-amber-100/10 md:hover:bg-white dark:hover:bg-stone-800"
            }`}
          >
            {DANG_KY_LABELS_VI[s]}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
      {loading ? (
        <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <SidebarDetailSkeleton items={4} />
        </motion.div>
      ) : rows.length === 0 ? (
        <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center gap-4 py-24 text-center bg-white/60 dark:bg-[#1C1917]/80 backdrop-blur-xl rounded-[28px] border border-amber-900/10 dark:border-amber-100/10 shadow-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-stone-100 dark:bg-stone-800 border border-black/5 dark:border-white/5">
            <Inbox className="h-7 w-7 text-stone-400 dark:text-stone-500" strokeWidth={2} />
          </div>
          <div>
            <p className="text-[16px] font-bold text-amber-950 dark:text-amber-50 font-serif">
              Không có hồ sơ nào ở trạng thái "{DANG_KY_LABELS_VI[statusFilter]}"
            </p>
            <p className="text-[14px] font-medium text-stone-500 dark:text-stone-400 mt-1">Danh sách sẽ tự cập nhật khi có đăng ký mới.</p>
          </div>
        </motion.div>
      ) : (
        <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, ease: APPLE_EASE }} className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-5 lg:gap-6 items-start">
          
          {/* ------- Danh sách (Trái) ------- */}
          <div className={`${mobileView === "detail" ? "hidden lg:flex" : "flex"} flex-col gap-3 sticky top-0`}>
            <div className="flex items-center justify-between px-2 pb-1">
              <h3 className="text-[12px] font-bold text-amber-800/70 dark:text-amber-400/70 tracking-widest uppercase ml-1">
                {DANG_KY_LABELS_VI[statusFilter]}
              </h3>
              <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-2 rounded-full bg-amber-100/80 dark:bg-amber-900/30 text-amber-900 dark:text-amber-100 text-[12px] font-bold tabular-nums shadow-sm">
                {rows.length}
              </span>
            </div>

            <div className="flex flex-col gap-2.5 max-h-[calc(100vh-250px)] overflow-y-auto pr-1 pb-4">
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
                    className={`text-left rounded-[20px] px-5 py-4 border-l-[4px] transition-all duration-300 ease-out active:scale-[0.98] border ${
                      isActive
                        ? "bg-amber-50/80 dark:bg-amber-900/20 border-l-amber-700 dark:border-l-amber-400 border-y-amber-900/10 border-r-amber-900/10 dark:border-y-amber-100/10 dark:border-r-amber-100/10 shadow-sm"
                        : "bg-white/80 dark:bg-[#1C1917]/80 backdrop-blur-xl border-l-transparent border-amber-900/10 dark:border-amber-100/10 shadow-sm md:hover:border-l-amber-300 dark:hover:border-l-amber-700/50"
                    }`}
                  >
                    <p className={`text-[15px] font-bold truncate leading-snug ${isActive ? "text-amber-950 dark:text-amber-50" : "text-stone-800 dark:text-stone-200"}`}>
                      {r.ho_ten}
                    </p>
                    <p className={`text-[13.5px] truncate mt-1.5 ${isActive ? "text-stone-600 dark:text-stone-300" : "text-stone-500 dark:text-stone-400"}`}>
                      {r.khoi_dang_ky}
                    </p>
                    <div className={`flex items-center gap-1.5 mt-2.5 text-[12px] font-medium ${isActive ? "text-amber-700 dark:text-amber-400" : "text-stone-400 dark:text-stone-500"}`}>
                      <span className="truncate tabular-nums">{r.sdt}</span>
                      <span className="opacity-40">•</span>
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

          {/* ------- Chi tiết (Phải) ------- */}
          {selected && (
            <div className={`${mobileView === "list" ? "hidden lg:block" : "block"} lg:sticky top-0`}>
              <div className="bg-white/80 dark:bg-[#1C1917]/80 backdrop-blur-xl border border-amber-900/10 dark:border-amber-100/10 rounded-[28px] p-6 sm:p-8 shadow-sm">
                
                <button
                  type="button"
                  onClick={() => setMobileView("list")}
                  className="lg:hidden inline-flex items-center gap-1.5 text-[14px] font-bold text-stone-500 dark:text-stone-400 mb-6 -ml-1 px-3 py-2 active:scale-95 transition-all bg-white dark:bg-stone-800 rounded-xl border border-black/5 dark:border-white/5 shadow-sm"
                >
                  <ChevronLeft className="w-4 h-4" strokeWidth={2.5} />
                  Quay lại danh sách
                </button>

                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-amber-100/80 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0 shadow-sm border border-amber-200/50 dark:border-amber-800/30">
                      <UserPlus className="w-6 h-6 text-amber-700 dark:text-amber-400" strokeWidth={2} />
                    </div>
                    <div>
                      <h2 className="text-[22px] sm:text-[26px] font-extrabold text-amber-950 dark:text-amber-50 font-serif leading-tight">
                        {selected.ho_ten}
                      </h2>
                      <p className="text-[13.5px] font-semibold text-stone-500 dark:text-stone-400 mt-1">Sinh năm {selected.nam_sinh}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-3.5 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider flex-shrink-0 shadow-sm ${DANG_KY_BADGE[selected.trang_thai] || ""}`}>
                    {DANG_KY_LABELS_VI[selected.trang_thai]}
                  </span>
                </div>

                {/* Thông tin liên hệ dạng lưới Card */}
                <div className="grid sm:grid-cols-2 gap-3 mt-6">
                  <a
                    href={`tel:${selected.sdt}`}
                    className="flex items-center gap-3.5 rounded-2xl bg-white/50 dark:bg-stone-900/40 border border-amber-900/10 dark:border-amber-100/10 px-4 py-3.5 md:hover:bg-amber-50/50 dark:hover:bg-amber-900/10 transition-all duration-300 shadow-sm active:scale-[0.98]"
                  >
                    <Phone className="w-4.5 h-4.5 text-amber-700 dark:text-amber-400 flex-shrink-0" strokeWidth={2.5} />
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-0.5">SĐT phụ huynh</p>
                      <p className="text-[14px] font-bold text-stone-800 dark:text-stone-200 truncate tabular-nums tracking-wide">{selected.sdt}</p>
                    </div>
                  </a>
                  <div className="flex items-center gap-3.5 rounded-2xl bg-white/50 dark:bg-stone-900/40 border border-amber-900/10 dark:border-amber-100/10 px-4 py-3.5 shadow-sm">
                    <MapPin className="w-4.5 h-4.5 text-amber-700 dark:text-amber-400 flex-shrink-0" strokeWidth={2.5} />
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-0.5">Giáo xóm</p>
                      <p className="text-[14px] font-bold text-stone-800 dark:text-stone-200 truncate">{selected.giao_xom}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3.5 rounded-2xl bg-white/50 dark:bg-stone-900/40 border border-amber-900/10 dark:border-amber-100/10 px-4 py-3.5 shadow-sm">
                    <GraduationCap className="w-4.5 h-4.5 text-amber-700 dark:text-amber-400 flex-shrink-0" strokeWidth={2.5} />
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-0.5">Khối đăng ký</p>
                      <p className="text-[14px] font-bold text-stone-800 dark:text-stone-200 truncate">{selected.khoi_dang_ky}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3.5 rounded-2xl bg-white/50 dark:bg-stone-900/40 border border-amber-900/10 dark:border-amber-100/10 px-4 py-3.5 shadow-sm">
                    <Calendar className="w-4.5 h-4.5 text-amber-700 dark:text-amber-400 flex-shrink-0" strokeWidth={2.5} />
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-0.5">Nộp hồ sơ</p>
                      <p className="text-[14px] font-bold text-stone-800 dark:text-stone-200 truncate">{relativeTime(selected.created_at)}</p>
                    </div>
                  </div>
                </div>

                {selected.ghi_chu && (
                  <div className="mt-5 rounded-[20px] bg-white/50 dark:bg-stone-900/40 border border-amber-900/10 dark:border-amber-100/10 px-5 py-4 shadow-sm">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-amber-800/70 dark:text-amber-400/70 mb-1.5 ml-1">Ghi chú từ phụ huynh</p>
                    <p className="text-[14px] font-medium text-amber-950 dark:text-amber-50 leading-relaxed">{selected.ghi_chu}</p>
                  </div>
                )}

                {/* Ghi chú nội bộ của admin */}
                <div className="mt-6">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-amber-800/70 dark:text-amber-400/70 ml-1">Ghi chú nội bộ (Tùy chọn)</label>
                  <textarea
                    value={ghiChuAdmin}
                    onChange={(e) => setGhiChuAdmin(e.target.value)}
                    rows={2}
                    placeholder="VD: Đã gọi trao đổi với phụ huynh..."
                    className="mt-2.5 w-full rounded-xl border border-amber-900/10 dark:border-amber-100/10 bg-white/50 dark:bg-stone-900/50 px-4 py-3.5 text-[14px] font-medium text-stone-800 dark:text-stone-200 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-600/50 transition-shadow resize-none shadow-inner"
                  />
                </div>

                {selected.xu_ly_boi && (
                  <p className="text-[12px] text-stone-500 dark:text-stone-400 font-medium mt-4 pt-4 ml-1">
                    Xử lý lần cuối bởi <span className="font-bold text-stone-700 dark:text-stone-300">{selected.xu_ly_boi}</span> · {relativeTime(selected.xu_ly_luc)}
                  </p>
                )}

                {/* Hành động */}
                <div className="flex flex-col sm:flex-row gap-3 mt-6 border-t border-amber-900/10 dark:border-amber-100/10 pt-6">
                  {nextActions(selected.trang_thai).map((s) => {
                    const { icon: Icon, cls } = ACTION_STYLE[s];
                    const busy = processing === s;
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => handleProcess(s)}
                        disabled={!!processing}
                        className={`flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-[14px] font-bold transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 shadow-sm ${cls}`}
                      >
                        {busy ? <Spinner className="w-4.5 h-4.5" /> : <Icon className="w-4.5 h-4.5" strokeWidth={2.5} />}
                        {busy ? "Đang xử lý…" : DANG_KY_LABELS_VI[s]}
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