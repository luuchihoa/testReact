import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  MessageSquare, Phone, Clock, Inbox, ChevronLeft, Check, CheckCircle2,
  RotateCcw, Info, Search, X, FileSpreadsheet, Copy, CheckCheck,
  GraduationCap, Calendar, Users, Tag, Mail, ExternalLink,
  AlertTriangle, ChevronDown, ChevronUp, ArrowUpDown, Filter, PhoneCall
} from "lucide-react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { motion as Motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useAdminContext } from "./AdminContext.jsx";
import { LIEN_HE_STATUS_TABS, LIEN_HE_LABELS_VI, LIEN_HE_BADGE } from "./constants.js";
import { fetchLienHe, updateLienHeStatus } from "./dataLayer.js";
import { SidebarDetailSkeleton, Spinner } from "../../components/ui/Skeleton.jsx";
import { exportLienHeExcel } from "./utils/excelRosterHelper.js";

const APPLE_EASE = [0.16, 1, 0.3, 1];

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
  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function formatFullTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

// Bóc tách chủ đề từ chuỗi "[Chủ đề: ...]\nNội dung"
function parseContactMessage(raw) {
  if (!raw) return { topic: "Khác", content: "" };
  const match = raw.match(/^\[Chủ đề:\s*([^\]]+)\]\s*\n?([\s\S]*)$/i);
  if (match) {
    return {
      topic: match[1].trim(),
      content: match[2].trim(),
    };
  }
  return { topic: "Khác", content: raw.trim() };
}

const TOPIC_CONFIG = {
  "Tuyển sinh": {
    label: "Tuyển sinh",
    icon: GraduationCap,
    badge: "bg-emerald-50 text-emerald-900 border border-emerald-300/50 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40",
  },
  "Lịch học": {
    label: "Lịch học",
    icon: Calendar,
    badge: "bg-sky-50 text-sky-900 border border-sky-300/50 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800/40",
  },
  "Tham gia giáo lý viên": {
    label: "Tham gia GLV",
    icon: Users,
    badge: "bg-purple-50 text-purple-900 border border-purple-300/50 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/40",
  },
  "Góp ý": {
    label: "Góp ý",
    icon: MessageSquare,
    badge: "bg-amber-50 text-amber-900 border border-amber-300/50 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/40",
  },
  "Khác": {
    label: "Khác",
    icon: Tag,
    badge: "bg-stone-100 text-stone-800 border border-stone-300/50 dark:bg-stone-800 dark:text-stone-300 dark:border-stone-700/40",
  },
};

const TOPIC_LIST = ["Tuyển sinh", "Lịch học", "Tham gia giáo lý viên", "Góp ý", "Khác"];

function getTopicConfig(topicName) {
  return TOPIC_CONFIG[topicName] || TOPIC_CONFIG["Khác"];
}

export default function GopYTab() {
  const { showToast, refreshPendingGopY } = useAdminContext();

  const [statusFilter, setStatusFilter] = useState("moi");
  const [topicFilter, setTopicFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest"); // "newest" | "oldest"
  const [showInfoBanner, setShowInfoBanner] = useState(false);

  const [allRecords, setAllRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [exporting, setExporting] = useState(false);

  const [selectedId, setSelectedId] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const detailId = searchParams.get("thu");
  const mobileView = detailId ? "detail" : "list";
  const reduceMotion = useReducedMotion();
  const listRef = useRef(null);
  const detailRef = useRef(null);
  const returnPosition = useRef({ id: null, scroll: 0 });
  const previousDetail = useRef(null);
  const copyTimer = useRef(null);
  const processingRef = useRef(false);
  const [processing, setProcessing] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [copiedPhone, setCopiedPhone] = useState(false);

  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" ? window.innerWidth < 1024 : false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Tải danh sách thư góp ý
  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await fetchLienHe("all");
      setAllRecords(data || []);
    } catch (err) {
      console.error("load lien he error:", err);
      setLoadError("Không thể tải danh sách góp ý. Vui lòng thử lại.");
      showToast("Không tải được danh sách góp ý", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    let cancelled = false;
    fetchLienHe("all").then((data) => {
      if (!cancelled) { setAllRecords(data || []); setLoading(false); }
    }).catch(() => {
      if (!cancelled) { setLoadError("Không thể tải danh sách góp ý. Vui lòng thử lại."); setLoading(false); }
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => () => clearTimeout(copyTimer.current), []);

  // Thống kê số lượng thư theo trạng thái
  const statusCounts = useMemo(() => {
    const counts = { all: allRecords.length, moi: 0, da_doc: 0, da_xu_ly: 0 };
    allRecords.forEach((r) => {
      if (counts[r.trang_thai] !== undefined) {
        counts[r.trang_thai] += 1;
      }
    });
    return counts;
  }, [allRecords]);

  // Lọc dữ liệu theo statusFilter, topicFilter, searchTerm
  const filteredRows = useMemo(() => {
    return allRecords.filter((r) => {
      // 1. Lọc trạng thái
      if (statusFilter !== "all" && r.trang_thai !== statusFilter) {
        return false;
      }

      const parsed = parseContactMessage(r.noi_dung);

      // 2. Lọc chủ đề
      if (topicFilter !== "all") {
        if (parsed.topic !== topicFilter) return false;
      }

      // 3. Lọc từ khóa tìm kiếm
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const matchName = r.ho_ten?.toLowerCase().includes(q);
        const matchPhone = r.sdt?.toLowerCase().includes(q);
        const matchTopic = parsed.topic.toLowerCase().includes(q);
        const matchContent = parsed.content.toLowerCase().includes(q);
        if (!matchName && !matchPhone && !matchTopic && !matchContent) {
          return false;
        }
      }

      return true;
    });
  }, [allRecords, statusFilter, topicFilter, searchTerm]);

  // Sắp xếp dữ liệu (Mới nhất trước hoặc Cũ nhất trước - FIFO)
  const sortedRows = useMemo(() => {
    return [...filteredRows].sort((a, b) => {
      const tA = new Date(a.created_at || 0).getTime();
      const tB = new Date(b.created_at || 0).getTime();
      return sortBy === "oldest" ? tA - tB : tB - tA;
    });
  }, [filteredRows, sortBy]);

  // URL owns the mobile detail; desktop selection follows the current results.
  const selected = detailId
    ? allRecords.find((record) => String(record.id) === detailId) || null
    : sortedRows.find((record) => record.id === selectedId) || sortedRows[0] || null;

  const openRow = useCallback((record) => {
    setSelectedId(record.id);
    setActionError(null);
    setCopiedPhone(false);
    if (isMobile) {
      returnPosition.current = { id: String(record.id), scroll: window.scrollY };
      const next = new URLSearchParams(searchParams);
      next.set("thu", String(record.id));
      setSearchParams(next, { state: { ...location.state, gopyFromList: true }, preventScrollReset: true });
    }
  }, [isMobile, searchParams, setSearchParams, location.state]);

  const handleBackToList = useCallback(() => {
    if (location.state?.gopyFromList) navigate(-1);
    else {
      const next = new URLSearchParams(searchParams);
      next.delete("thu");
      setSearchParams(next, { replace: true, preventScrollReset: true });
    }
  }, [location.state, navigate, searchParams, setSearchParams]);

  useEffect(() => {
    if (loading || !isMobile) return;
    const oldDetail = previousDetail.current;
    previousDetail.current = detailId;
    const frame = requestAnimationFrame(() => {
      if (detailId) {
        detailRef.current?.focus({ preventScroll: true });
        detailRef.current?.scrollIntoView({ block: "start", behavior: "instant" });
      } else if (oldDetail) {
        const button = Array.from(listRef.current?.querySelectorAll("[data-message-id]") || [])
          .find((node) => node.dataset.messageId === returnPosition.current.id);
        (button || listRef.current || document.getElementById("gopy-search"))?.focus({ preventScroll: true });
        window.scrollTo({ top: returnPosition.current.scroll, behavior: "instant" });
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [detailId, loading, isMobile]);

  const handleProcess = useCallback(async (nextStatus) => {
    if (!selected || processingRef.current) return;
    const target = selected;
    processingRef.current = true;
    setProcessing(nextStatus);
    setActionError(null);
    try {
      await updateLienHeStatus(target.id, nextStatus);
      setAllRecords((records) => records.map((record) => record.id === target.id ? { ...record, trang_thai: nextStatus } : record));
      const index = sortedRows.findIndex((record) => record.id === target.id);
      if (statusFilter !== "all" && statusFilter !== nextStatus) {
        setSelectedId((sortedRows[index + 1] || sortedRows[index - 1])?.id ?? null);
      }
      showToast(`Đã cập nhật thư của ${target.ho_ten} thành "${LIEN_HE_LABELS_VI[nextStatus]}"`, "success");
      if (isMobile) handleBackToList();
      // A badge refresh failure must not turn a successful write into an error.
      Promise.resolve().then(refreshPendingGopY).catch(() => {
        showToast("Đã lưu trạng thái; chưa làm mới được số thư trên thanh điều hướng.", "warning");
      });
    } catch {
      setActionError("Chưa thể xác nhận cập nhật trạng thái. Vui lòng kiểm tra lại trước khi thử lại.");
    } finally {
      processingRef.current = false;
      setProcessing(null);
    }
  }, [selected, sortedRows, statusFilter, isMobile, handleBackToList, refreshPendingGopY, showToast]);

  // Sao chép số điện thoại với Clipboard API chuẩn hóa
  const handleCopyPhone = useCallback(async (phone) => {
    if (!phone) return;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(phone);
      } else {
        const input = document.createElement("input");
        input.value = phone;
        document.body.appendChild(input);
        input.select();
        try {
          if (!document.execCommand("copy")) throw new Error("Copy failed");
        } finally { input.remove(); }
      }
      setCopiedPhone(true);
      showToast(`Đã sao chép SĐT: ${phone}`, "success", 2000);
      clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopiedPhone(false), 2000);
    } catch (err) {
      console.error("Copy phone error:", err);
      showToast("Không thể sao chép SĐT", "error");
    }
  }, [showToast]);

  // Xóa toàn bộ bộ lọc về mặc định
  const handleResetFilters = useCallback(() => {
    setStatusFilter("all");
    setTopicFilter("all");
    setSearchTerm("");
    setSortBy("newest");
  }, []);

  // Xuất file Excel danh sách góp ý
  const handleExportExcel = async () => {
    if (sortedRows.length === 0) {
      showToast("Không có thư nào để xuất Excel", "info");
      return;
    }
    setExporting(true);
    try {
      const filterLabel = LIEN_HE_LABELS_VI[statusFilter] || "TatCa";
      await exportLienHeExcel(sortedRows, filterLabel);
      showToast("Đã xuất danh sách hòm thư ra file Excel thành công", "success");
    } catch (err) {
      console.error("Export Excel error:", err);
      showToast("Không thể xuất file Excel", "error");
    } finally {
      setExporting(false);
    }
  };

  const parsedSelected = useMemo(() => {
    return selected ? parseContactMessage(selected.noi_dung) : null;
  }, [selected]);

  const selectedTopicConfig = useMemo(() => {
    return parsedSelected ? getTopicConfig(parsedSelected.topic) : null;
  }, [parsedSelected]);

  const cleanPhone = useMemo(() => {
    return selected?.sdt ? selected.sdt.replace(/\D/g, "") : "";
  }, [selected]);

  // Kiểm tra có đang áp dụng bộ lọc hay không
  const isFiltering = statusFilter !== "all" || topicFilter !== "all" || searchTerm.trim() !== "";

  return (
    <Motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.4, ease: APPLE_EASE }}
      className="gopy-page flex flex-col gap-4 sm:gap-5"
    >
      {/* ════════════════════════════════════════════════════════════
          KHỐI 1: HEADER & BANNER THÔNG TIN HÒM THƯ (Ẩn trên Mobile khi xem Detail)
         ════════════════════════════════════════════════════════════ */}
      <div className={`${mobileView === "detail" ? "hidden lg:flex" : "flex"} flex-col gap-3 sm:gap-4`}>

        {/* Header Title & Top Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#fffefa] dark:bg-[#1e2821] p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-[#dedfd4] dark:border-[#354237] shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-[#314e3e]/10 dark:bg-[#d6b883]/20 border border-[#314e3e]/20 dark:border-[#d6b883]/30 flex-shrink-0">
              <Mail className="w-5 h-5 text-[#314e3e] dark:text-[#d6b883]" strokeWidth={2.25} />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-extrabold text-[#293d32] dark:text-[#ecece0] font-serif leading-tight">
                Hòm Thư Góp Ý & Phản Hồi
              </h1>
              <p className="text-xs text-[#575e55] dark:text-[#b0b9ac] font-medium mt-0.5">
                Tiếp nhận và hồi đáp ý kiến mục vụ từ phụ huynh và giáo dân
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Nút bật tắt thông tin quy chế */}
            <button
              type="button"
              onClick={() => setShowInfoBanner((prev) => !prev)}
              className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[44px] rounded-xl text-xs font-bold bg-[#faf8f3] dark:bg-[#151c18] text-[#575e55] dark:text-[#b0b9ac] border border-[#dedfd4] dark:border-[#354237] hover:bg-black/5 dark:hover:bg-white/5 active:scale-[0.97] transition-all"
              aria-expanded={showInfoBanner}
              aria-label="Thông tin hòm thư và quy chế vận hành"
            >
              <Info className="w-4 h-4 text-[#314e3e] dark:text-[#d6b883]" strokeWidth={2.25} />
              <span>Quy chế</span>
              {showInfoBanner ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {/* Nút Xuất Excel */}
            <button
              type="button"
              onClick={handleExportExcel}
              disabled={exporting || sortedRows.length === 0}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[44px] rounded-xl text-base font-bold bg-[#faf8f3] dark:bg-[#151c18] text-[#293d32] dark:text-[#ecece0] border border-[#dedfd4] dark:border-[#354237] hover:bg-black/5 dark:hover:bg-white/5 active:scale-[0.97] transition-all shadow-xs disabled:opacity-50"
            >
              {exporting ? <Spinner className="w-4 h-4" /> : <FileSpreadsheet className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />}
              <span>Xuất Excel ({sortedRows.length})</span>
            </button>
          </div>
        </div>

        {/* Collapsible Info Banner */}
        <AnimatePresence>
          {showInfoBanner && (
            <Motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.25, ease: APPLE_EASE }}
              className="overflow-hidden"
            >
              <div className="bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237] p-4 rounded-2xl flex items-start gap-3 text-xs leading-relaxed text-[#293d32] dark:text-[#ecece0]">
                <Info className="w-4 h-4 text-[#927140] dark:text-[#d4b47d] shrink-0 mt-0.5" strokeWidth={2.25} />
                <div className="flex-1 space-y-1">
                  <p className="font-bold text-[#927140] dark:text-[#d4b47d] uppercase tracking-wider">
                    Lưu ý vận hành hòm thư
                  </p>
                  <p className="font-medium text-[#575e55] dark:text-[#b0b9ac]">
                    Trạng thái thư giúp theo dõi công việc nội bộ. Hãy liên hệ trực tiếp qua số điện thoại hoặc Zalo khi cần phản hồi người gửi.
                  </p>
                </div>
              </div>
            </Motion.div>
          )}
        </AnimatePresence>

        {/* ════════════════════════════════════════════════════════════
            KHỐI 2: TÍCH HỢP BỘ LỌC TRẠNG THÁI & TOOLBAR ĐIỀU KHIỂN
           ════════════════════════════════════════════════════════════ */}
        <div className="bg-[#fffefa] dark:bg-[#1e2821] p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl border border-[#dedfd4] dark:border-[#354237] shadow-xs flex flex-col gap-3">

          {/* Hàng 1: Filter Pills Trạng Thái Tích Hợp Số Lượng */}
          <div
            className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 sm:pb-0 [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {LIEN_HE_STATUS_TABS.map((s) => {
              const active = statusFilter === s;
              const count = statusCounts[s] ?? 0;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setStatusFilter(s);
                    if (isMobile && detailId) handleBackToList();
                  }}
                  className={`flex-shrink-0 px-3.5 py-2 min-h-[44px] rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 active:scale-[0.97] flex items-center gap-2 ${
                    active
                      ? "bg-[#314e3e] dark:bg-[#d6b883] text-white dark:text-[#19251d] shadow-xs"
                      : "bg-[#faf8f3] dark:bg-[#151c18] text-[#575e55] dark:text-[#b0b9ac] border border-[#dedfd4] dark:border-[#354237] hover:bg-black/5 dark:hover:bg-white/5"
                  }`}
                >
                  {s === "moi" && count > 0 && (
                    <span className="w-2 h-2 rounded-full bg-amber-400 motion-safe:animate-pulse shrink-0" />
                  )}
                  <span>{LIEN_HE_LABELS_VI[s]}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-xs font-extrabold tabular-nums ${
                      active
                        ? "bg-white/20 text-white dark:bg-black/20 dark:text-[#19251d]"
                        : "bg-[#dedfd4]/60 dark:bg-[#354237]/60 text-[#293d32] dark:text-[#ecece0]"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Hàng 2: Ô tìm kiếm, Chọn chủ đề, và Sắp xếp */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-2 border-t border-[#dedfd4] dark:border-[#354237]">

            {/* Ô Tìm kiếm với cỡ chữ chuẩn 1rem chống phóng to trên mobile */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#575e55] dark:text-[#b0b9ac] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                id="gopy-search"
                aria-label="Tìm người gửi hoặc nội dung thư"
                placeholder="Tìm người gửi hoặc nội dung..."
                className="w-full pl-10 pr-10 py-2.5 min-h-[44px] text-base font-medium rounded-xl border border-[#dedfd4] dark:border-[#354237] bg-[#faf8f3] dark:bg-[#151c18] text-[#293d32] dark:text-[#ecece0] placeholder-[#575e55]/60 focus:outline-none focus:ring-2 focus:ring-[#314e3e]/30 dark:focus:ring-[#d6b883]/30 transition-all"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  aria-label="Xóa từ khóa tìm kiếm"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-lg text-[#575e55] dark:text-[#b0b9ac] hover:bg-black/10 dark:hover:bg-white/10 active:scale-95 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Dropdown / Select Chủ đề */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-44">
                <select
                  value={topicFilter}
                  onChange={(e) => setTopicFilter(e.target.value)}
                  aria-label="Lọc theo chủ đề"
                  className="w-full appearance-none pl-3.5 pr-8 py-2.5 min-h-[44px] rounded-xl text-base font-bold bg-[#faf8f3] dark:bg-[#151c18] text-[#293d32] dark:text-[#ecece0] border border-[#dedfd4] dark:border-[#354237] focus:outline-none focus:ring-2 focus:ring-[#314e3e]/30 dark:focus:ring-[#d6b883]/30 transition-all"
                >
                  <option value="all">Tất cả chủ đề</option>
                  {TOPIC_LIST.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-[#575e55] dark:text-[#b0b9ac] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Sắp xếp: Mới nhất / Cũ nhất trước */}
              <div className="relative flex-1 sm:w-44">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  aria-label="Thứ tự sắp xếp"
                  className="w-full appearance-none pl-3.5 pr-8 py-2.5 min-h-[44px] rounded-xl text-base font-bold bg-[#faf8f3] dark:bg-[#151c18] text-[#293d32] dark:text-[#ecece0] border border-[#dedfd4] dark:border-[#354237] focus:outline-none focus:ring-2 focus:ring-[#314e3e]/30 dark:focus:ring-[#d6b883]/30 transition-all"
                >
                  <option value="newest">Mới nhất trước</option>
                  <option value="oldest">Cũ nhất trước</option>
                </select>
                <ArrowUpDown className="w-3.5 h-3.5 text-[#575e55] dark:text-[#b0b9ac] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════
          KHỐI 3: NỘI DUNG CHÍNH (MASTER - DETAIL & MOBILE DEDICATED)
         ════════════════════════════════════════════════════════════ */}
      {detailId && (!selected || loadError) && !loading && <div ref={detailRef} tabIndex={-1} role="status" className="p-4 rounded-xl border border-stone-400">
        <p>Chưa thể hiển thị thư này. Thư có thể không còn trong danh sách.</p>
        <button type="button" onClick={handleBackToList} className="min-h-[44px] px-3 py-2 underline">Quay lại danh sách</button>
      </div>}
      <AnimatePresence mode="wait">
        {loading ? (
          <Motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="lg:hidden space-y-3" role="status" aria-label="Đang tải danh sách thư">
              {[1, 2, 3, 4].map((key) => <div key={key} aria-hidden="true" className="rounded-2xl border border-stone-300 dark:border-stone-700 p-4 space-y-3 motion-safe:animate-pulse"><div className="h-4 w-2/3 bg-stone-200 dark:bg-stone-700 rounded" /><div className="h-3 w-1/2 bg-stone-200 dark:bg-stone-700 rounded" /><div className="h-10 bg-stone-200 dark:bg-stone-700 rounded" /></div>)}
            </div>
            <div className="hidden lg:block"><SidebarDetailSkeleton items={5} /></div>
          </Motion.div>
        ) : loadError ? (
          /* TRẠNG THÁI LỖI TẢI */
          <Motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center gap-3 p-8 bg-[#fffefa] dark:bg-[#1e2821] border border-red-200 dark:border-red-800/40 rounded-3xl text-center shadow-xs"
          >
            <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/50 flex items-center justify-center text-red-600 dark:text-red-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <p className="text-base font-bold text-[#293d32] dark:text-[#ecece0]">
              {loadError}
            </p>
            <p className="text-xs text-[#575e55] dark:text-[#b0b9ac] max-w-sm">
              Không thể tải dữ liệu từ máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.
            </p>
            <button
              type="button"
              onClick={load}
              className="mt-2 inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl text-xs font-bold bg-[#314e3e] dark:bg-[#d6b883] text-white dark:text-[#19251d] shadow-sm active:scale-95 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Thử lại</span>
            </button>
          </Motion.div>
        ) : sortedRows.length === 0 && !detailId ? (
          /* TRẠNG THÁI RỖNG (EMPTY STATE) */
          <Motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.35, ease: APPLE_EASE }}
            className="flex flex-col items-center justify-center gap-4 py-16 text-center bg-[#fffefa] dark:bg-[#1e2821] rounded-3xl border border-[#dedfd4] dark:border-[#354237] shadow-xs p-6"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237]">
              <Inbox className="h-6 w-6 text-[#575e55] dark:text-[#b0b9ac]" strokeWidth={2} />
            </div>
            <div>
              <p className="text-base font-bold text-[#293d32] dark:text-[#ecece0] font-serif">
                {isFiltering ? "Không tìm thấy thư phù hợp" : "Hòm thư hiện chưa có thư nào"}
              </p>
              <p className="text-xs sm:text-sm font-medium text-[#575e55] dark:text-[#b0b9ac] mt-1 max-w-sm mx-auto leading-relaxed">
                {isFiltering
                  ? "Thử xóa từ khóa tìm kiếm hoặc đổi sang chủ đề / trạng thái khác."
                  : "Mọi thư góp ý và liên hệ mới từ giáo dân sẽ xuất hiện tại đây."}
              </p>
            </div>
            {isFiltering && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-2 px-4 py-2 min-h-[44px] rounded-xl text-xs font-bold bg-[#faf8f3] dark:bg-[#151c18] text-[#293d32] dark:text-[#ecece0] border border-[#dedfd4] dark:border-[#354237] hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#314e3e] dark:text-[#d6b883]" />
                <span>Xóa bộ lọc</span>
              </button>
            )}
          </Motion.div>
        ) : (
          /* BỐ CỤC MASTER-DETAIL (DESKTOP) & MÀN HÌNH ĐỌC RIÊNG (MOBILE) */
          <Motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: reduceMotion ? 0 : 0.35, ease: APPLE_EASE }}
            className="grid grid-cols-1 lg:grid-cols-[320px_1fr] xl:grid-cols-[340px_1fr] gap-4 sm:gap-5 items-start"
          >
            {/* ════════ CỘT TRÁI: DANH SÁCH THƯ (MASTER LIST) ════════ */}
            <div ref={listRef} tabIndex={-1} aria-label="Danh sách thư góp ý" className={`${mobileView === "detail" ? "hidden lg:flex" : "flex"} flex-col gap-2.5`}>
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-[#927140] dark:text-[#d4b47d] tracking-wider uppercase flex items-center gap-1.5">
                  <span>{LIEN_HE_LABELS_VI[statusFilter]}</span>
                  {topicFilter !== "all" && (
                    <span className="text-[#575e55] dark:text-[#b0b9ac]">· {topicFilter}</span>
                  )}
                </span>
                <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-2.5 rounded-full bg-[#314e3e]/10 dark:bg-[#d6b883]/20 text-[#314e3e] dark:text-[#d6b883] text-xs font-bold tabular-nums">
                  {sortedRows.length} thư
                </span>
              </div>

              {/* Danh sách cuộn độc lập trên Desktop / cuộn tự nhiên trên Mobile */}
              <div
                className="flex flex-col gap-2.5 lg:max-h-[calc(100vh-210px)] lg:overflow-y-auto lg:pr-1"
                data-lenis-prevent
              >
                {sortedRows.map((r) => {
                  const isActive = selected?.id === r.id;
                  const parsed = parseContactMessage(r.noi_dung);
                  const topicConf = getTopicConfig(parsed.topic);
                  const isNew = r.trang_thai === "moi";

                  return (
                    <button
                      key={r.id}
                      data-message-id={String(r.id)}
                      aria-current={isActive ? "true" : undefined}
                      type="button"
                      onClick={() => openRow(r)}
                      className={`text-left rounded-2xl p-3.5 sm:p-4 border-l-[4px] transition-all duration-200 ease-out active:scale-[0.98] border min-h-[44px] flex flex-col gap-2 shadow-xs ${
                        isActive
                          ? "bg-[#314e3e]/10 dark:bg-[#d6b883]/20 border-l-[#314e3e] dark:border-l-[#d6b883] border-y-[#dedfd4] border-r-[#dedfd4] dark:border-y-[#354237] dark:border-r-[#354237]"
                          : "bg-[#fffefa] dark:bg-[#1e2821] border-l-transparent border-[#dedfd4] dark:border-[#354237] hover:border-l-[#314e3e]/50 dark:hover:border-l-[#d6b883]/50"
                      }`}
                    >
                      {/* Dòng 1: Tên người gửi & Trạng thái thư */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          {isNew && (
                            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 motion-safe:animate-pulse" title="Thư mới" />
                          )}
                          <p className={`text-sm font-bold break-words leading-tight ${isActive ? "text-[#314e3e] dark:text-[#d6b883]" : "text-[#293d32] dark:text-[#ecece0]"}`}>
                            {r.ho_ten}
                          </p>
                        </div>
                        {statusFilter === "all" && (
                          <span className={`px-2 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider shrink-0 ${LIEN_HE_BADGE[r.trang_thai]}`}>
                            {LIEN_HE_LABELS_VI[r.trang_thai]}
                          </span>
                        )}
                      </div>

                      {/* Dòng 2: Chủ đề & Thời gian */}
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className={`px-2 py-0.5 rounded-md font-bold shrink-0 ${topicConf.badge}`}>
                          {topicConf.label}
                        </span>
                        <span className="text-[#575e55] dark:text-[#b0b9ac] flex items-center gap-1 shrink-0 font-medium">
                          <Clock className="w-3 h-3" />
                          {relativeTime(r.created_at)}
                        </span>
                      </div>

                      {/* Dòng 3: Đoạn trích nội dung */}
                      <p className="text-xs text-[#575e55] dark:text-[#b0b9ac] line-clamp-2 leading-relaxed font-normal">
                        {parsed.content || "(Không có nội dung)"}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ════════ CỘT PHẢI: CHI TIẾT THƯ & HÀNH ĐỘNG (DETAIL VIEW) ════════ */}
            {selected && (
              <div ref={detailRef} tabIndex={-1} aria-label="Chi tiết thư" className={`${mobileView === "list" ? "hidden lg:block" : "block"} flex-1 min-w-0 scroll-mt-36`}>
                <div className="bg-[#fffefa] dark:bg-[#1e2821] border border-[#dedfd4] dark:border-[#354237] rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs flex flex-col gap-5">

                  {/* Top Bar trên Mobile: Nút Quay lại & Badge trạng thái */}
                  <div className="lg:hidden flex flex-wrap gap-2 items-center justify-between pb-3 border-b border-[#dedfd4] dark:border-[#354237]">
                    <button
                      type="button"
                      onClick={handleBackToList}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#293d32] dark:text-[#ecece0] px-3.5 py-2.5 min-h-[44px] active:scale-95 transition-all bg-[#faf8f3] dark:bg-[#151c18] rounded-xl border border-[#dedfd4] dark:border-[#354237] shadow-xs"
                    >
                      <ChevronLeft className="w-4 h-4 text-[#314e3e] dark:text-[#d6b883]" strokeWidth={2.5} />
                      <span>Quay lại danh sách</span>
                    </button>
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider ${LIEN_HE_BADGE[selected.trang_thai]}`}>
                      {LIEN_HE_LABELS_VI[selected.trang_thai]}
                    </span>
                  </div>

                  {/* 1. Header Thư: Tên người gửi, Chủ đề, Thời gian */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="text-xl sm:text-2xl font-extrabold text-[#293d32] dark:text-[#ecece0] font-serif leading-tight break-words">
                        {selected.ho_ten}
                      </h2>
                      <div className="flex flex-wrap items-center gap-2 mt-2 text-xs font-medium text-[#575e55] dark:text-[#b0b9ac]">
                        <span className={`px-2.5 py-1 rounded-lg font-bold ${selectedTopicConfig?.badge || "bg-stone-100 text-stone-800"}`}>
                          {selectedTopicConfig?.label || parsedSelected?.topic || "Khác"}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#314e3e] dark:text-[#d6b883]" />
                          <span>{formatFullTime(selected.created_at)}</span>
                        </span>
                      </div>
                    </div>

                    <span className={`hidden lg:inline-flex items-center px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider flex-shrink-0 shadow-xs ${LIEN_HE_BADGE[selected.trang_thai]}`}>
                      {LIEN_HE_LABELS_VI[selected.trang_thai]}
                    </span>
                  </div>

                  {/* 2. NỘI DUNG LỜI NHẮN (Ưu tiên hàng đầu, chữ rõ ràng 1rem, ngắt dòng chuẩn) */}
                  <div className="rounded-2xl bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237] p-4 sm:p-5 shadow-xs">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#927140] dark:text-[#d4b47d] mb-2.5 flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4" />
                      Nội dung Lời nhắn / Góp ý
                    </p>
                    <p className="text-base text-[#293d32] dark:text-[#ecece0] leading-[1.7] whitespace-pre-wrap break-words font-medium">
                      {parsedSelected?.content || selected.noi_dung}
                    </p>
                  </div>

                  {/* 3. KHỐI LIÊN HỆ NHANH 1-CHẠM (SĐT, Gọi, Chép SĐT, Zalo) */}
                  <div className="rounded-2xl bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237] p-4 flex flex-col gap-3 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-[#314e3e]/10 dark:bg-[#d6b883]/20 flex items-center justify-center text-[#314e3e] dark:text-[#d6b883]">
                          <Phone className="w-4 h-4" strokeWidth={2.5} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#575e55] dark:text-[#b0b9ac] uppercase tracking-wider">Số điện thoại liên hệ</p>
                          <p className="text-base sm:text-lg font-bold text-[#293d32] dark:text-[#ecece0] tabular-nums">{selected.sdt || "(Không có SĐT)"}</p>
                        </div>
                      </div>

                      {/* Nút hành động liên hệ */}
                      {selected.sdt && (
                        <div className="flex flex-wrap items-center gap-2 mt-1 sm:mt-0">
                          {/* Gọi ngay */}
                          <a
                            href={`tel:${selected.sdt}`}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[44px] rounded-xl bg-[#314e3e] dark:bg-[#d6b883] text-white dark:text-[#19251d] text-xs font-bold hover:bg-[#253d30] dark:hover:bg-[#c4a670] transition-all shadow-xs active:scale-[0.97]"
                          >
                            <PhoneCall className="w-4 h-4" strokeWidth={2.5} />
                            <span>Gọi ngay</span>
                          </a>

                          {/* Sao chép SĐT */}
                          <button
                            type="button"
                            onClick={() => handleCopyPhone(selected.sdt)}
                            className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[44px] rounded-xl bg-[#fffefa] dark:bg-[#1e2821] text-[#293d32] dark:text-[#ecece0] border border-[#dedfd4] dark:border-[#354237] text-xs font-bold hover:bg-black/5 dark:hover:bg-white/5 transition-all shadow-xs active:scale-[0.97]"
                          >
                            {copiedPhone ? <CheckCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-4 h-4 text-[#575e55] dark:text-[#b0b9ac]" />}
                            <span>{copiedPhone ? "Đã chép" : "Chép SĐT"}</span>
                          </button>

                          {/* Zalo */}
                          {cleanPhone && (
                            <a
                              href={`https://zalo.me/${cleanPhone}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[44px] rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40 text-xs font-bold hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all shadow-xs active:scale-[0.97]"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>Zalo</span>
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 4. KHỐI CẬP NHẬT TRẠNG THÁI (Ưu tiên nút Đã xử lý) */}
                  <div className="flex flex-col gap-2.5 pt-3 border-t border-[#dedfd4] dark:border-[#354237]">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#927140] dark:text-[#d4b47d]">
                      Cập nhật trạng thái xử lý
                    </p>

                    {actionError && (
                      <div role="alert" className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/40 text-xs font-medium text-red-700 dark:text-red-300">
                        {actionError}
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-2.5">
                      {/* Nút Ưu Tiên: Đánh dấu Đã xử lý */}
                      {selected.trang_thai !== "da_xu_ly" ? (
                        <button
                          type="button"
                          disabled={!!processing}
                          onClick={() => handleProcess("da_xu_ly")}
                          className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 min-h-[44px] rounded-xl text-xs sm:text-sm font-bold bg-[#314e3e] dark:bg-[#d6b883] text-white dark:text-[#19251d] hover:bg-[#253d30] dark:hover:bg-[#c4a670] transition-all shadow-xs active:scale-[0.98] disabled:opacity-50"
                        >
                          {processing === "da_xu_ly" ? <Spinner className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" strokeWidth={2.5} />}
                          <span>{processing === "da_xu_ly" ? "Đang cập nhật…" : "Đánh dấu đã xử lý"}</span>
                        </button>
                      ) : (
                        <div className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 min-h-[44px] rounded-xl text-xs sm:text-sm font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Thư này đã được xử lý hoàn tất</span>
                        </div>
                      )}

                      {/* Hành động phụ 1: Đánh dấu Đã đọc */}
                      {selected.trang_thai !== "da_doc" && (
                        <button
                          type="button"
                          disabled={!!processing}
                          onClick={() => handleProcess("da_doc")}
                          className="inline-flex items-center justify-center gap-1.5 px-4 py-3 min-h-[44px] rounded-xl text-xs sm:text-sm font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all shadow-xs active:scale-[0.98] disabled:opacity-50"
                        >
                          {processing === "da_doc" ? <Spinner className="w-4 h-4" /> : <Check className="w-4 h-4" strokeWidth={2.5} />}
                          <span>{processing === "da_doc" ? "…" : "Đánh dấu đã đọc"}</span>
                        </button>
                      )}

                      {/* Hành động phụ 2: Chuyển về Mới / Chờ phản hồi */}
                      {selected.trang_thai !== "moi" && (
                        <button
                          type="button"
                          disabled={!!processing}
                          onClick={() => handleProcess("moi")}
                          className="inline-flex items-center justify-center gap-1.5 px-4 py-3 min-h-[44px] rounded-xl text-base font-bold bg-[#faf8f3] dark:bg-[#151c18] text-[#293d32] dark:text-[#ecece0] border border-[#dedfd4] dark:border-[#354237] hover:bg-black/5 dark:hover:bg-white/5 transition-all shadow-xs active:scale-[0.98] disabled:opacity-50"
                        >
                          {processing === "moi" ? <Spinner className="w-4 h-4" /> : <RotateCcw className="w-4 h-4" strokeWidth={2.5} />}
                          <span>{processing === "moi" ? "…" : "Chuyển về thư mới"}</span>
                        </button>
                      )}
                    </div>

                    {/* Dòng chú thích minh bạch */}
                    <p className="text-xs text-[#575e55] dark:text-[#b0b9ac] font-medium mt-1 leading-relaxed">
                      * Cập nhật trạng thái chỉ dùng cho quản trị nội bộ, không tự động gửi tin nhắn hay email đến người gửi.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </Motion.div>
        )}
      </AnimatePresence>
    </Motion.div>
  );
}
