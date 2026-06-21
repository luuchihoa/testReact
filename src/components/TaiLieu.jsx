import { useState, useEffect, useRef, useCallback, useMemo, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ChevronDown, FileText, PenLine } from "lucide-react";

/* ─── Constants ─────────────────────────────────────────────── */
const API_URL = "https://script.google.com/macros/s/AKfycbzum9kVRG0GCqzTUNLls1WVyUt9fzpGRWZ3Rn7gWaueCNOeBOszVckEF_P9-2645gWm/exec";
const DOC_CACHE_TTL = 6 * 60 * 60 * 1000;

const MAP_CATEGORY = {
  "15p_hk1":  "15 Phút",
  "1tiet_hk1":"1 Tiết",
  "hk1":      "Thi HK",
  "15p_hk2":  "15 Phút",
  "1tiet_hk2":"1 Tiết",
  "hk2":      "Thi HK",
};

// Đồng bộ theo bảng màu amber/stone — mỗi loại bộ đề một sắc thái ấm khác nhau
const CAT_CLASS_MAP = {
  "15p_hk1":  "text-emerald-700 bg-emerald-50 border border-emerald-200/60",
  "1tiet_hk1":"text-violet-700 bg-violet-50 border border-violet-200/60",
  "hk1":      "text-rose-700 bg-rose-50 border border-rose-200/60",
  "15p_hk2":  "text-emerald-700 bg-emerald-50 border border-emerald-200/60",
  "1tiet_hk2":"text-violet-700 bg-violet-50 border border-violet-200/60",
  "hk2":      "text-rose-700 bg-rose-50 border border-rose-200/60",
};

/* ─── Cache helpers ─────────────────────────────────────────── */
const cacheKey  = (cat) => `DOCS_${cat || "all"}`;

const getCache = (cat) => {
  try {
    const raw = localStorage.getItem(cacheKey(cat));
    if (!raw) return null;
    const { data, time } = JSON.parse(raw);
    if (Date.now() - time > DOC_CACHE_TTL) { localStorage.removeItem(cacheKey(cat)); return null; }
    return data;
  } catch { return null; }
};

const setCache = (cat, data) => {
  try {
    localStorage.setItem(cacheKey(cat), JSON.stringify({ data, time: Date.now() }));
  } catch {}
};

/* ─── Skeleton ──────────────────────────────────────────────── */
const SkeletonCard = () => (
  <div className="bg-white rounded-2xl border border-stone-200/70 p-4 animate-pulse">
    <div className="flex justify-between gap-3">
      <div className="flex flex-col gap-2 w-full">
        <div className="h-4 w-16 bg-stone-100 rounded-full" />
        <div className="h-5 w-3/4 bg-stone-100 rounded" />
        <div className="h-3 w-1/2 bg-stone-100 rounded" />
      </div>
      <div className="h-5 w-5 bg-stone-100 rounded mt-1 shrink-0" />
    </div>
  </div>
);

export const Loading = () => (
  <div className="space-y-3 px-1">
    {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
  </div>
);

/* ─── MCQ Question (memo) ───────────────────────────────────── */
const McqQuestion = memo(({ q, index }) => (
  <div className="bg-white border border-stone-200/70 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-amber-300/60 transition-all duration-200">
    <p className="text-sm font-semibold text-stone-800 mb-3">
      Câu {index + 1}. {q.question}
    </p>
    <ul className="space-y-2 text-sm">
      {q.options.map((choice, i) => {
        const letter = String.fromCharCode(65 + i);
        const isCorrect = q.answer === letter;
        return (
          <li key={letter} className={`flex items-start gap-3 px-3 py-2 rounded-xl ${
            isCorrect
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-stone-50 text-stone-600"
          }`}>
            <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shrink-0 ${
              isCorrect ? "bg-emerald-600 text-white" : "bg-stone-200 text-stone-700"
            }`}>
              {letter}
            </span>
            <span className="flex-1">{choice}</span>
            {isCorrect && <span className="text-emerald-600 font-bold">✓</span>}
          </li>
        );
      })}
    </ul>
  </div>
));

/* ─── Essay Question (memo) ─────────────────────────────────── */
const EssayQuestion = memo(({ q, index }) => (
  <div className="bg-white border border-stone-200/70 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-amber-300/60 transition-all duration-200">
    <p className="text-sm font-semibold text-stone-800 mb-3">
      Câu {index + 1}. {q.question}
    </p>
    <div className="bg-amber-50/70 border border-amber-200/60 rounded-xl p-3 text-sm text-amber-900 leading-relaxed">
      <span className="block text-xs font-semibold text-amber-700 mb-1">Gợi ý / Đáp án:</span>
      {q.answer
        ? <span className="pl-2 text-justify tracking-wide leading-relaxed whitespace-pre-line">{q.answer}</span>
        : <span className="pl-2 italic text-stone-400">Chưa có đáp án</span>
      }
    </div>
  </div>
));

/* ─── Exam content (memo) ───────────────────────────────────── */
const ExamContent = memo(({ mcq = [], essay = [], typeFilter }) => {
  const showMcq   = typeFilter === "all" || typeFilter === "mcq";
  const showEssay = typeFilter === "all" || typeFilter === "essay";

  if (!mcq.length && !essay.length)
    return <p className="text-sm text-stone-400">Bộ đề chưa có câu hỏi</p>;

  return (
    <>
      {showMcq && mcq.length > 0 && (
        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="flex items-center gap-1.5 text-base font-bold text-amber-800">
              <FileText className="w-4 h-4" /> Trắc nghiệm
            </h4>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold">
              {mcq.length} câu
            </span>
          </div>
          <div className="space-y-3">
            {mcq.map((q, i) => <McqQuestion key={i} q={q} index={i} />)}
          </div>
        </section>
      )}
      {showEssay && essay.length > 0 && (
        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="flex items-center gap-1.5 text-base font-bold text-stone-700">
              <PenLine className="w-4 h-4" /> Tự luận
            </h4>
            <span className="text-xs px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 font-semibold">
              {essay.length} câu
            </span>
          </div>
          <div className="space-y-3">
            {essay.map((q, i) => <EssayQuestion key={i} q={q} index={i} />)}
          </div>
        </section>
      )}
    </>
  );
});

/* ─── Doc Item ──────────────────────────────────────────────── */
const DocItem = memo(({ doc, isOpen, content, loadingDocId, typeFilter, onToggle }) => {
  const catText  = MAP_CATEGORY[doc.cat] ?? doc.cat.toUpperCase();
  const catClass = CAT_CLASS_MAP[doc.cat] || "text-stone-600 bg-stone-100 border border-stone-200/60";
  const isLoadingThis = loadingDocId === doc.id;

  return (
    <div className="bg-white rounded-2xl border border-stone-200/70 overflow-hidden shadow-sm">
      {/* Header */}
      <button
        type="button"
        className="group w-full cursor-pointer flex justify-between gap-3 p-4 text-left focus-visible:outline-none focus-visible:bg-stone-50"
        onClick={() => onToggle(doc.id)}
        aria-expanded={isOpen}
      >
        <div className="flex flex-col gap-1 w-full min-w-0">
          <span className={`self-start text-[11px] font-bold px-2 py-0.5 rounded-full ${catClass}`}>
            {catText}
          </span>
          <span className="text-base font-bold text-stone-900 leading-snug group-hover:text-amber-700 transition-colors truncate">
            {doc.title}
          </span>
          <span className="text-xs text-stone-400 truncate">
            {doc.description} · {doc.updatedAt}
          </span>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-stone-400 transition-transform duration-200 mt-1 flex-shrink-0 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Content */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t border-stone-100 p-4">
              {isLoadingThis && (
                <div className="flex items-center gap-2 text-sm text-stone-400 py-2">
                  <svg className="animate-spin h-4 w-4 text-amber-500" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                  </svg>
                  Đang tải nội dung...
                </div>
              )}
              {!isLoadingThis && content?.error && (
                <p className="text-rose-600 text-sm">{content.error}</p>
              )}
              {!isLoadingThis && content && !content.error && (
                <ExamContent mcq={content.mcq} essay={content.essay} typeFilter={typeFilter} />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

/* ─── Main Component ────────────────────────────────────────── */
const TaiLieu = () => {
  const [isLoading,    setIsLoading]    = useState(false);
  const [items,        setItems]        = useState([]);
  const [contentMap,   setContentMap]   = useState({});
  const [loadingDocId, setLoadingDocId] = useState(null);
  const [openIds,      setOpenIds]      = useState([]);
  const [isEmpty,      setIsEmpty]      = useState(false);
  const [active,       setActive]       = useState("all");
  const [searchQuery,  setSearchQuery]  = useState("");
  const [typeFilter,   setTypeFilter]   = useState("all");

  /* ── Load danh sách tài liệu ── */
  const loadDocuments = useCallback(async (cat) => {
    setIsLoading(true);
    setIsEmpty(false);
    setOpenIds([]);

    const cached = getCache(cat);
    if (cached) {
      setItems(cached);
      setIsLoading(false);
      if (!cached.length) setIsEmpty(true);
      return;
    }

    try {
      const res  = await fetch(`${API_URL}?path=DOCS&cat=${cat}`);
      const data = await res.json();

      if (cat === "all") {
        const grouped = {};
        data.forEach(d => {
          grouped[d.cat] = grouped[d.cat] ? [...grouped[d.cat], d] : [d];
        });
        Object.entries(grouped).forEach(([c, arr]) => setCache(c, arr));
      }

      setCache(cat, data);
      setItems(data);
      if (!data.length) setIsEmpty(true);
    } catch (err) {
      console.error(err);
      setIsEmpty(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadDocuments(active); }, [active, loadDocuments]);

  /* ── Toggle mở/đóng, fetch content lần đầu ── */
  const handleToggle = useCallback(async (docId) => {
    setOpenIds(prev =>
      prev.includes(docId) ? prev.filter(id => id !== docId) : [...prev, docId]
    );

    if (contentMap[docId]) return;

    setLoadingDocId(docId);
    try {
      const res  = await fetch(`${API_URL}?path=DOC_QUESTIONS&docId=${docId}`);
      const json = await res.json();
      setContentMap(prev => ({ ...prev, [docId]: json }));
    } catch {
      setContentMap(prev => ({ ...prev, [docId]: { error: "Lỗi tải nội dung" } }));
    } finally {
      setLoadingDocId(null);
    }
  }, [contentMap]);

  /* ── Search ── */
  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return items;
    return items.filter(doc => {
      if (doc.title?.toLowerCase().includes(q)) return true;
      if (doc.description?.toLowerCase().includes(q)) return true;
      const content = contentMap[doc.id];
      if (content?.mcq?.some(c =>
        c.question?.toLowerCase().includes(q) ||
        c.options?.some(o => o.toLowerCase().includes(q))
      )) return true;
      if (content?.essay?.some(c =>
        c.question?.toLowerCase().includes(q) ||
        c.answer?.toLowerCase().includes(q)
      )) return true;
      return false;
    });
  }, [items, searchQuery, contentMap]);

  /* ── Category buttons ── */
  const handleCategory = useCallback((cat) => {
    setActive(cat);
    setSearchQuery("");
    setTypeFilter("all");
  }, []);

  const CAT_BUTTONS = [
    { cat: "all",     label: "Tất cả" },
    { cat: "15p_hk1", label: "15 Phút" },
    { cat: "hk1",     label: "Học Kỳ 1" },
  ];

  const OTHER_CATS = [
    { cat: "15p_hk1",   label: "15' - HK1" },
    { cat: "1tiet_hk1", label: "1 Tiết - HK1" },
    { cat: "hk1",       label: "Học kỳ I" },
    { cat: "15p_hk2",   label: "15' - HK2" },
    { cat: "1tiet_hk2", label: "1 Tiết - HK2" },
    { cat: "hk2",       label: "Học kỳ II" },
  ];
  const isOtherActive = OTHER_CATS.some(o => o.cat === active) && !CAT_BUTTONS.some(c => c.cat === active);

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <div className="flex flex-col max-w-4xl mx-auto">
        {/* ── Sticky header ── */}
        <div className="sticky top-0 px-5 z-30 backdrop-blur-md pt-6 pb-0 border-b mb-4 bg-[#faf8f5]/90 border-stone-200/60">
          <h1 className="font-serif font-black text-2xl md:text-3xl text-stone-900 mb-4 tracking-tight">
            Tài liệu ôn tập
          </h1>

          {/* Search */}
          <div className="relative mb-3">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm câu hỏi..."
              className="w-full pl-10 pr-9 py-2.5 border rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-amber-400/60 focus:border-amber-300 transition outline-none placeholder-stone-400 bg-white border-stone-200 shadow-sm"
            />
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-700 transition-colors"
                aria-label="Xóa tìm kiếm"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category filter */}
          <div className="flex items-center gap-2 mb-3 overflow-x-auto no-scrollbar">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 shrink-0 mr-1">Bộ đề:</span>
            {CAT_BUTTONS.map(({ cat, label }) => (
              <button
                type="button"
                key={cat}
                onClick={() => handleCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors ${
                  active === cat
                    ? "bg-stone-900 text-white shadow-sm"
                    : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"
                }`}
              >
                {label}
              </button>
            ))}

            <div className="relative ml-auto shrink-0">
              <select
                value={isOtherActive ? active : ""}
                onChange={e => e.target.value && handleCategory(e.target.value)}
                className={`appearance-none pl-3 pr-8 py-1.5 text-sm font-semibold rounded-xl border focus:outline-none focus:ring-2 focus:ring-amber-400/60 transition-colors cursor-pointer ${
                  isOtherActive
                    ? "bg-amber-800 text-white border-amber-800"
                    : "bg-white border-stone-200 text-stone-600 hover:bg-stone-50"
                }`}
              >
                <option value="">Bộ đề khác</option>
                {OTHER_CATS.map(({ cat, label }) => (
                  <option key={cat} value={cat}>{label}</option>
                ))}
              </select>
              <ChevronDown className={`pointer-events-none absolute right-2.5 top-2.5 w-3.5 h-3.5 ${isOtherActive ? "text-white" : "text-stone-400"}`} />
            </div>
          </div>

          {/* Type filter */}
          <div className="flex items-center gap-2 mb-3 overflow-x-auto no-scrollbar pb-3 border-t border-dashed border-stone-200 pt-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 shrink-0 mr-1">Dạng:</span>
            {[
              { type: "all",   label: "Tất cả" },
              { type: "mcq",   label: "Trắc nghiệm" },
              { type: "essay", label: "Tự luận" },
            ].map(({ type, label }) => (
              <button
                type="button"
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`px-3 py-1 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  typeFilter === type
                    ? "bg-amber-100 text-amber-800"
                    : "text-stone-500 hover:bg-stone-100 hover:text-stone-900"
                }`}
              >
                {label}
              </button>
            ))}
            {searchQuery && (
              <span className="ml-auto text-xs text-stone-400 whitespace-nowrap">
                {filteredItems.length} kết quả
              </span>
            )}
          </div>
        </div>

        {/* ── List ── */}
        {isLoading && <div className="px-5"><Loading /></div>}

        {!isLoading && filteredItems.length > 0 && (
          <div className="space-y-3 pb-20 px-5">
            {filteredItems.map(doc => (
              <DocItem
                key={doc.id}
                doc={doc}
                isOpen={openIds.includes(doc.id)}
                content={contentMap[doc.id]}
                loadingDocId={loadingDocId}
                typeFilter={typeFilter}
                onToggle={handleToggle}
              />
            ))}
          </div>
        )}

        {/* ── Empty ── */}
        {!isLoading && (isEmpty || filteredItems.length === 0) && (
          <div className="flex flex-col items-center justify-center py-20 text-center px-5">
            <div className="w-14 h-14 rounded-full mb-4 flex items-center justify-center text-2xl bg-amber-50 border border-amber-100">
              🔍
            </div>
            <p className="text-sm font-semibold text-stone-800">Không tìm thấy kết quả</p>
            <p className="text-xs text-stone-400 mt-1">
              {searchQuery ? `Không có tài liệu nào khớp "${searchQuery}".` : "Thử thay đổi bộ lọc hoặc từ khóa."}
            </p>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="mt-3 text-xs font-semibold text-amber-700 hover:underline"
              >
                Xóa tìm kiếm
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaiLieu;