import { useState, useEffect, useRef, useCallback, useMemo, memo } from "react";

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

const CAT_CLASS_MAP = {
  "15p_hk1":  "text-emerald-600 bg-emerald-50",
  "1tiet_hk1":"text-purple-600 bg-purple-50",
  "hk1":      "text-red-600 bg-red-50",
  "15p_hk2":  "text-emerald-600 bg-emerald-50",
  "1tiet_hk2":"text-purple-600 bg-purple-50",
  "hk2":      "text-red-600 bg-red-50",
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
  <div className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse">
    <div className="flex justify-between gap-3">
      <div className="flex flex-col gap-2 w-full">
        <div className="h-4 w-16 bg-gray-100 rounded" />
        <div className="h-5 w-3/4 bg-gray-100 rounded" />
        <div className="h-3 w-1/2 bg-gray-100 rounded" />
      </div>
      <div className="h-5 w-5 bg-gray-100 rounded mt-1 shrink-0" />
    </div>
  </div>
);

export const Loading = () => (
  <div className="space-y-4 px-1">
    {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
  </div>
);

/* ─── MCQ Question (memo — chỉ re-render khi câu hỏi đổi) ─── */
const McqQuestion = memo(({ q, index }) => (
  <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm hover:shadow transition">
    <p className="text-sm font-semibold text-neutral-800 mb-3">
      Câu {index + 1}. {q.question}
    </p>
    <ul className="space-y-2 text-sm">
      {q.options.map((choice, i) => {
        const letter = String.fromCharCode(65 + i);
        const isCorrect = q.answer === letter;
        return (
          <li key={letter} className={`flex items-start gap-3 px-3 py-2 rounded-lg ${
            isCorrect
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-neutral-50 text-neutral-600"
          }`}>
            <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shrink-0 ${
              isCorrect ? "bg-emerald-600 text-white" : "bg-neutral-200 text-neutral-700"
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
  <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm hover:shadow transition">
    <p className="text-sm font-semibold text-neutral-800 mb-3">
      Câu {index + 1}. {q.question}
    </p>
    <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm text-blue-800 leading-relaxed">
      <span className="block text-xs font-semibold text-blue-600 mb-1">Gợi ý / Đáp án:</span>
      {q.answer
        ? <span className="pl-2 text-justify tracking-wide leading-relaxed whitespace-pre-line">{q.answer}</span>
        : <span className="pl-2 italic text-neutral-400">Chưa có đáp án</span>
      }
    </div>
  </div>
));

/* ─── Exam content (memo) ───────────────────────────────────── */
const ExamContent = memo(({ mcq = [], essay = [], typeFilter }) => {
  const showMcq   = typeFilter === "all" || typeFilter === "mcq";
  const showEssay = typeFilter === "all" || typeFilter === "essay";

  if (!mcq.length && !essay.length)
    return <p className="text-sm text-gray-400">Bộ đề chưa có câu hỏi</p>;

  return (
    <>
      {showMcq && mcq.length > 0 && (
        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-base font-bold text-orange-700">📝 Trắc nghiệm</h4>
            <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 font-semibold">
              {mcq.length} câu
            </span>
          </div>
          <div className="space-y-4">
            {mcq.map((q, i) => <McqQuestion key={i} q={q} index={i} />)}
          </div>
        </section>
      )}
      {showEssay && essay.length > 0 && (
        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-base font-bold text-blue-700">✍️ Tự luận</h4>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold">
              {essay.length} câu
            </span>
          </div>
          <div className="space-y-4">
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
  const catClass = CAT_CLASS_MAP[doc.cat] || "text-neutral-600 bg-neutral-100";
  const isLoadingThis = loadingDocId === doc.id;

  return (
    <div className="doc-item bg-white rounded-xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div
        className="doc-header group cursor-pointer flex justify-between gap-3 p-4"
        onClick={() => onToggle(doc.id)}
      >
        <div className="flex flex-col gap-1 w-full">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[12px] font-bold px-1.5 py-0.5 rounded ${catClass}`}>
              {catText}
            </span>
          </div>
          <span className="text-lg font-medium text-gray-900 leading-snug group-hover:text-indigo-600 transition-colors">
            {doc.title}
          </span>
          <span className="text-sm text-gray-400">
            {doc.description} · {doc.updatedAt}
          </span>
        </div>
        <svg
          className={`${isOpen ? "rotate-180" : ""} w-5 h-5 text-gray-400 transition-transform duration-200 mt-1 flex-shrink-0`}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      {/* Content */}
      {isOpen && (
        <div className="doc-content border-t border-gray-50 p-4">
          {isLoadingThis && (
            <div className="flex items-center gap-2 text-sm text-gray-400 py-2">
              <svg className="animate-spin h-4 w-4 text-orange-400" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
              </svg>
              Đang tải nội dung...
            </div>
          )}
          {!isLoadingThis && content?.error && (
            <p className="text-red-500 text-sm">{content.error}</p>
          )}
          {!isLoadingThis && content && !content.error && (
            <ExamContent mcq={content.mcq} essay={content.essay} typeFilter={typeFilter} />
          )}
        </div>
      )}
    </div>
  );
});

/* ─── Main Component ────────────────────────────────────────── */
const TaiLieu = () => {
  const [isLoading,    setIsLoading]    = useState(false);
  const [items,        setItems]        = useState([]);
  const [contentMap,   setContentMap]   = useState({}); // { [docId]: { mcq, essay } | { error } }
  const [loadingDocId, setLoadingDocId] = useState(null); // ID đang fetch content
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

      // FIX: khi cat==="all", cache từng nhóm riêng để dùng sau
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
    // Đóng nếu đang mở
    setOpenIds(prev =>
      prev.includes(docId) ? prev.filter(id => id !== docId) : [...prev, docId]
    );

    // FIX: chỉ fetch khi chưa có trong contentMap
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

  /* ── Search: lọc theo title + description + nội dung câu hỏi ── */
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

  return (
    <div className="flex flex-col h-full">
      {/* ── Sticky header ── */}
      <div className="sticky top-0 px-5 z-30 backdrop-blur pt-2 pb-0 border-b mb-4 bg-white/95 border-neutral-100">
        <h1 className="text-2xl font-bold text-neutral-800 mb-3">📚 Tài liệu ôn tập</h1>

        {/* Search — FIX: onChange thật sự cập nhật state */}
        <div className="relative mb-3">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm câu hỏi..."
            className="w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition outline-none placeholder-neutral-400 bg-neutral-50 border-neutral-200"
          />
          <div className="absolute left-3 top-3 text-neutral-400">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
            </svg>
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-2.5 text-neutral-400 hover:text-neutral-700 transition-colors"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category filter */}
        <div className="flex items-center gap-2 mb-3 overflow-x-auto no-scrollbar">
          <span className="text-[12px] font-bold uppercase tracking-wider text-neutral-400 shrink-0 mr-1">Bộ đề:</span>
          {CAT_BUTTONS.map(({ cat, label }) => (
            <button
              key={cat}
              onClick={() => handleCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${
                active === cat
                  ? "bg-neutral-900 text-white shadow-sm"
                  : "bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
              }`}
            >
              {label}
            </button>
          ))}
          <select
            value={active}
            onChange={e => e.target.value && handleCategory(e.target.value)}
            className="ml-auto px-3 py-1.5 text-sm rounded-lg border border-neutral-200 bg-white text-neutral-700 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Bộ đề khác</option>
            <option value="15p_hk1">15&apos; - HK1</option>
            <option value="1tiet_hk1">1Tiết - HK1</option>
            <option value="hk1">Học kỳ I</option>
            <option value="15p_hk2">15&apos; - HK2</option>
            <option value="1tiet_hk2">1Tiết - HK2</option>
            <option value="hk2">Học kỳ II</option>
          </select>
        </div>

        {/* Type filter — FIX: state thật, không chỉ là class CSS */}
        <div className="flex items-center gap-2 mb-3 overflow-x-auto no-scrollbar pb-1 border-t border-dashed border-neutral-100 pt-2">
          <span className="text-[12px] font-bold uppercase tracking-wider text-neutral-400 shrink-0 mr-1">Dạng:</span>
          {[
            { type: "all",   label: "Tất cả" },
            { type: "mcq",   label: "Trắc nghiệm" },
            { type: "essay", label: "Tự luận" },
          ].map(({ type, label }) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-3 py-1 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                typeFilter === type
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900"
              }`}
            >
              {label}
            </button>
          ))}
          {searchQuery && (
            <span className="ml-auto text-xs text-neutral-400">
              {filteredItems.length} kết quả
            </span>
          )}
        </div>
      </div>

      {/* ── List ── */}
      {isLoading && <div className="px-5"><Loading /></div>}

      {!isLoading && filteredItems.length > 0 && (
        <div className="space-y-4 pb-20 px-5">
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
      {!isLoading && (isEmpty || (!isLoading && filteredItems.length === 0)) && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="p-4 rounded-full mb-3 text-2xl bg-neutral-50">🔍</div>
          <p className="text-sm font-medium text-neutral-900">Không tìm thấy kết quả</p>
          <p className="text-xs text-neutral-500">
            {searchQuery ? `Không có tài liệu nào khớp "${searchQuery}".` : "Thử thay đổi bộ lọc hoặc từ khóa."}
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="mt-3 text-xs text-indigo-600 hover:underline"
            >
              Xóa tìm kiếm
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default TaiLieu;