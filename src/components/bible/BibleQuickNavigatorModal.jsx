import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Search,
  X,
  ExternalLink,
  ArrowLeft,
  Download,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  BookMarked
} from "lucide-react";
import {
  BIBLE_BASE_URL,
  BIBLE_CATEGORIES,
  BIBLE_CATEGORY_INFO,
  getBibleDeepLink,
  getBibleBookPdfUrl,
  searchBibleBooks,
  findBookById,
  getAdjacentBooks
} from "../../data/bibleBooksData.js";

const APPLE_EASE = [0.16, 1, 0.3, 1];
const MotionDiv = motion.div;

export default function BibleQuickNavigatorModal({
  isOpen,
  onClose,
  initialBookId = null,
  initialTestament = "all"
}) {
  const [selectedBook, setSelectedBook] = useState(() => (initialBookId ? findBookById(initialBookId) : null));
  const [tab, setTab] = useState(() => {
    if (initialBookId) {
      const found = findBookById(initialBookId);
      if (found) return found.category || found.testament;
    }
    return initialTestament;
  });
  const [search, setSearch] = useState("");
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  const [prevInitialBookId, setPrevInitialBookId] = useState(initialBookId);
  const searchInputRef = useRef(null);

  // Đồng bộ state khi mở modal hoặc thay đổi initialBookId (Theo chuẩn React 19 - render-time sync)
  if (isOpen !== prevIsOpen || initialBookId !== prevInitialBookId) {
    setPrevIsOpen(isOpen);
    setPrevInitialBookId(initialBookId);
    if (isOpen) {
      const found = initialBookId ? findBookById(initialBookId) : null;
      setSelectedBook(found);
      setTab(found ? (found.category || found.testament) : initialTestament);
      setSearch("");
    }
  }

  // Khóa cuộn trang và xử lý phím Escape
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      if (window.lenis) window.lenis.stop();

      const handleKeyDown = (e) => {
        if (e.key === "Escape") {
          if (selectedBook) {
            setSelectedBook(null);
          } else {
            onClose();
          }
        }
      };
      window.addEventListener("keydown", handleKeyDown);

      return () => {
        document.body.style.overflow = originalOverflow;
        if (window.lenis) window.lenis.start();
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isOpen, selectedBook, onClose]);

  // Lọc danh sách sách theo từ khóa và phân loại
  const filteredBooks = useMemo(() => {
    return searchBibleBooks(search, tab);
  }, [search, tab]);

  // Sách liền trước và liền sau khi ở màn hình chi tiết
  const adjacent = useMemo(() => {
    if (!selectedBook) return { prev: null, next: null };
    return getAdjacentBooks(selectedBook.id);
  }, [selectedBook]);

  const handleSelectBook = (book) => {
    setSelectedBook(book);
  };

  const handleOpenChapter = (bookId, chapterNum) => {
    const url = getBibleDeepLink(bookId, chapterNum);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleDownloadBookPdf = (book) => {
    if (!book) return;
    const pdfUrl = getBibleBookPdfUrl(book.id);
    if (pdfUrl) {
      const link = document.createElement("a");
      link.href = pdfUrl;
      link.download = `${book.name.replace(/[\\/?%*:|"<>]/g, "_")}.pdf`;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        data-lenis-prevent
        className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-hidden pointer-events-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="bible-modal-title"
        aria-describedby="bible-modal-desc"
      >
        {/* Backdrop che mờ */}
        <MotionDiv
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
          className="fixed inset-0 bg-stone-950/65 dark:bg-black/85 backdrop-blur-md cursor-pointer"
        />

        {/* Khung Modal Chính */}
        <MotionDiv
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ duration: 0.35, ease: APPLE_EASE }}
          className="relative w-full max-w-4xl lg:max-w-5xl max-h-[92vh] sm:max-h-[88vh] bg-[#faf8f5] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#2b3b32] rounded-[24px] sm:rounded-[32px] shadow-2xl flex flex-col overflow-hidden text-[#1e2621] dark:text-[#ecece0] z-10"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Modal */}
          <header className="px-5 sm:px-7 py-4 sm:py-5 border-b border-[#dedfd4] dark:border-[#2b3b32] flex items-center justify-between flex-shrink-0 bg-[#fffefa]/90 dark:bg-[#18221d]/90 backdrop-blur-md">
            <div className="flex items-center gap-3.5 min-w-0">
              {selectedBook ? (
                <button
                  type="button"
                  onClick={() => setSelectedBook(null)}
                  className="h-11 px-3 -ml-2 rounded-xl text-[#575e55] dark:text-[#b0b9ac] hover:text-[#1e2621] dark:hover:text-[#ecece0] hover:bg-[#dedfd4]/40 dark:hover:bg-[#2b3b32]/60 transition-all flex items-center gap-1.5 text-[13px] font-bold"
                  title="Quay lại danh sách 73 sách"
                  aria-label="Quay lại danh sách sách"
                >
                  <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                  <span className="hidden sm:inline">Quay lại</span>
                </button>
              ) : (
                <div className="w-11 h-11 rounded-2xl bg-[#c84b31]/10 dark:bg-[#ef4444]/15 border border-[#c84b31]/25 dark:border-[#ef4444]/30 flex items-center justify-center flex-shrink-0 text-[#c84b31] dark:text-[#ef4444] shadow-sm">
                  <BookOpen className="w-5 h-5" aria-hidden="true" />
                </div>
              )}

              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#314e3e]/10 text-[#314e3e] dark:bg-[#d6b883]/15 dark:text-[#d6b883]">
                    <Sparkles className="w-2.5 h-2.5" aria-hidden="true" />
                    <span>Bản Dịch Phụng Vụ HĐGMVN</span>
                  </span>
                </div>
                <h2
                  id="bible-modal-title"
                  className="text-[17px] sm:text-[20px] font-extrabold font-serif text-[#1e2621] dark:text-[#ecece0] truncate flex items-center gap-2"
                >
                  {selectedBook ? (
                    <span>
                      Sách {selectedBook.name}{" "}
                      <span className="text-[13px] font-mono font-bold text-[#c84b31] dark:text-[#fca5a5]">
                        ({selectedBook.short})
                      </span>
                    </span>
                  ) : (
                    <span>Kinh Thánh Trọn Bộ 73 Quyển</span>
                  )}
                </h2>
                <p
                  id="bible-modal-desc"
                  className="text-[11.5px] sm:text-[12.5px] text-[#575e55] dark:text-[#9eb1a6] font-medium truncate"
                >
                  {selectedBook
                    ? `${selectedBook.testament === "old" ? "Cựu Ước" : "Tân Ước"} • ${selectedBook.category} • ${selectedBook.chapters} chương • Nhóm Các Giờ Kinh Phụng Vụ`
                    : "Nhóm Phiên Dịch Các Giờ Kinh Phụng Vụ (CGKPV) · Liên kết Lời Chúa Mỗi Ngày"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={onClose}
                aria-label="Đóng bảng tra cứu Kinh Thánh"
                className="w-11 h-11 rounded-xl bg-[#faf8f5] dark:bg-[#1c2721] hover:bg-[#ef4444] hover:text-white dark:hover:bg-[#ef4444] dark:hover:text-white border border-[#dedfd4] dark:border-[#2b3b32] text-[#575e55] dark:text-[#9eb1a6] flex items-center justify-center transition-all active:scale-95 shadow-sm"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
          </header>

          {/* Vùng Nội Dung Modal */}
          <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-4">
            {selectedBook ? (
              /* ── MÀN HÌNH CHI TIẾT SÁCH & CHỌN CHƯƠNG ── */
              <div className="space-y-6">
                {/* Banner Thông Tin Sách */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#c84b31]/10 via-[#faf8f5] to-[#314e3e]/5 dark:from-[#ef4444]/15 dark:via-[#18221d] dark:to-[#151c18] border border-[#dedfd4] dark:border-[#2b3b32] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#314e3e]/10 dark:bg-[#d6b883]/15 text-[#314e3e] dark:text-[#d6b883]">
                        {selectedBook.testament === "old" ? "Cựu Ước" : "Tân Ước"}
                      </span>
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#c84b31]/10 dark:bg-[#ef4444]/15 text-[#c84b31] dark:text-[#fca5a5]">
                        {selectedBook.category}
                      </span>
                      <span className="text-[12px] font-semibold text-[#575e55] dark:text-[#9eb1a6]">
                        {selectedBook.chapters} Chương
                      </span>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-extrabold font-serif text-[#1e2621] dark:text-[#ecece0] truncate">
                      Sách {selectedBook.name}
                    </h3>
                    <p className="text-[12.5px] sm:text-[13px] text-[#575e55] dark:text-[#9eb1a6] mt-1 leading-relaxed max-w-2xl">
                      {BIBLE_CATEGORY_INFO[selectedBook.category] ||
                        `Khám phá trọn vẹn bản văn Lời Chúa trong sách ${selectedBook.name} (${selectedBook.chapters} chương) theo bản dịch phụng vụ CGKPV.`}
                    </p>
                  </div>

                  {/* Nút hành động chính */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => handleOpenChapter(selectedBook.id, 1)}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#314e3e] dark:bg-[#d6b883] text-white dark:text-[#19251d] font-bold text-[13px] hover:bg-[#253d30] dark:hover:bg-[#e2c792] shadow-md active:scale-95 transition-all whitespace-nowrap min-h-[44px]"
                    >
                      <span>Đọc từ Chương 1</span>
                      <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDownloadBookPdf(selectedBook)}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#fffefa] dark:bg-[#1c2721] text-[#1e2621] dark:text-[#ecece0] border border-[#dedfd4] dark:border-[#2b3b32] font-bold text-[13px] hover:bg-[#dedfd4]/30 dark:hover:bg-[#2b3b32]/60 shadow-sm active:scale-95 transition-all whitespace-nowrap min-h-[44px]"
                      title={`Tải file PDF sách ${selectedBook.name}`}
                    >
                      <Download className="w-3.5 h-3.5 text-[#c84b31] dark:text-[#fca5a5]" aria-hidden="true" />
                      <span>Tải Trọn Bộ PDF</span>
                    </button>
                  </div>
                </div>

                {/* Thanh điều hướng Sách Trước / Sách Tiếp Theo */}
                <div className="flex items-center justify-between gap-2 px-1 text-[12.5px]">
                  {adjacent.prev ? (
                    <button
                      type="button"
                      onClick={() => handleSelectBook(adjacent.prev)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-[#dedfd4]/40 dark:hover:bg-[#2b3b32]/60 text-[#575e55] dark:text-[#9eb1a6] hover:text-[#1e2621] dark:hover:text-[#ecece0] font-bold transition-all"
                    >
                      <ChevronLeft className="w-4 h-4 text-[#c84b31] dark:text-[#fca5a5]" aria-hidden="true" />
                      <span>Sách trước: <strong>{adjacent.prev.name}</strong></span>
                    </button>
                  ) : (
                    <div />
                  )}

                  {adjacent.next ? (
                    <button
                      type="button"
                      onClick={() => handleSelectBook(adjacent.next)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-[#dedfd4]/40 dark:hover:bg-[#2b3b32]/60 text-[#575e55] dark:text-[#9eb1a6] hover:text-[#1e2621] dark:hover:text-[#ecece0] font-bold transition-all"
                    >
                      <span>Sách kế: <strong>{adjacent.next.name}</strong></span>
                      <ChevronRight className="w-4 h-4 text-[#c84b31] dark:text-[#fca5a5]" aria-hidden="true" />
                    </button>
                  ) : (
                    <div />
                  )}
                </div>

                {/* Ma trận danh sách số chương */}
                <div>
                  <h4 className="text-[12px] font-bold uppercase tracking-wider text-[#575e55] dark:text-[#9eb1a6] mb-3 ml-1 flex items-center justify-between">
                    <span>Chọn Số Chương Để Mở Đọc ({selectedBook.chapters} chương)</span>
                    <span className="text-[11px] font-normal normal-case opacity-80">
                      Bấm vào số chương để mở trực tiếp
                    </span>
                  </h4>
                  <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2 sm:gap-2.5">
                    {Array.from({ length: selectedBook.chapters }, (_, i) => i + 1).map((chap) => (
                      <button
                        key={chap}
                        type="button"
                        onClick={() => handleOpenChapter(selectedBook.id, chap)}
                        className="group relative flex flex-col items-center justify-center h-12 rounded-xl bg-[#fffefa] dark:bg-[#1c2721] border border-[#dedfd4] dark:border-[#2b3b32] hover:border-[#c84b31] dark:hover:border-[#ef4444] hover:bg-[#c84b31]/5 dark:hover:bg-[#ef4444]/15 text-[#1e2621] dark:text-[#ecece0] hover:text-[#c84b31] dark:hover:text-[#fca5a5] transition-all shadow-sm active:scale-95 min-h-[44px]"
                        title={`Mở Sách ${selectedBook.name} Chương ${chap}`}
                        aria-label={`Mở Sách ${selectedBook.name} Chương ${chap}`}
                      >
                        <span className="text-[15px] font-bold font-mono">{chap}</span>
                        <ExternalLink
                          className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 text-[#c84b31] dark:text-[#fca5a5] absolute bottom-1 right-1 transition-opacity"
                          aria-hidden="true"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* ── MÀN HÌNH DANH SÁCH 73 SÁCH KINH THÁNH ── */
              <div className="space-y-4">
                {/* Thanh Tìm Kiếm & Tabs Phân Loại */}
                <div className="space-y-3">
                  {/* Ô tìm kiếm thông minh */}
                  <div className="relative w-full">
                    <Search
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#575e55] dark:text-[#9eb1a6] pointer-events-none"
                      aria-hidden="true"
                    />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Tìm theo tên sách hoặc viết tắt (vd: Sáng Thế, St, Mát-thêu, Mt, Thánh Vịnh, Tv...)"
                      className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-[#dedfd4] dark:border-[#2b3b32] bg-[#fffefa] dark:bg-[#1c2721] text-[13.5px] font-medium text-[#1e2621] dark:text-[#ecece0] placeholder-[#575e55]/60 dark:placeholder-[#9eb1a6]/60 focus:outline-none focus:ring-2 focus:ring-[#314e3e]/30 dark:focus:ring-[#d6b883]/30 shadow-sm transition-all"
                    />
                    {search && (
                      <button
                        type="button"
                        onClick={() => setSearch("")}
                        aria-label="Xóa từ khóa tìm kiếm"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#575e55] hover:text-[#1e2621] dark:text-[#9eb1a6] dark:hover:text-[#ecece0] p-1 rounded-md"
                      >
                        <X className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    )}
                  </div>

                  {/* Thanh Phân Nhóm Thể Loại Cuộn Ngang */}
                  <div
                    className="flex gap-2 border-b border-[#dedfd4] dark:border-[#2b3b32] pb-2 overflow-x-auto scrollbar-none"
                    role="tablist"
                    aria-label="Phân loại sách Kinh Thánh"
                  >
                    {BIBLE_CATEGORIES.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        role="tab"
                        aria-selected={tab === item.id}
                        onClick={() => setTab(item.id)}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] sm:text-[12.5px] font-bold whitespace-nowrap transition-all active:scale-95 ${
                          tab === item.id
                            ? "bg-[#314e3e] text-white dark:bg-[#d6b883] dark:text-[#19251d] shadow-sm"
                            : "bg-[#fffefa] dark:bg-[#1c2721] text-[#575e55] dark:text-[#9eb1a6] hover:bg-[#dedfd4]/30 dark:hover:bg-[#2b3b32]/60 border border-[#dedfd4] dark:border-[#2b3b32]"
                        }`}
                      >
                        <span>{item.label}</span>
                        <span className="text-[10.5px] opacity-75">({item.count})</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Kết quả tìm kiếm và Lưới thẻ sách Bento */}
                {filteredBooks.length > 0 ? (
                  <div>
                    <div className="flex items-center justify-between text-[11.5px] text-[#575e55] dark:text-[#9eb1a6] mb-2.5 px-1">
                      <span>Hiển thị <strong>{filteredBooks.length}</strong> cuốn sách</span>
                      {search && <span>Từ khóa: "{search}"</span>}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                      {filteredBooks.map((book) => (
                        <div
                          key={book.id}
                          className="group flex flex-col justify-between rounded-2xl bg-[#fffefa] dark:bg-[#1c2721] border border-[#dedfd4] dark:border-[#2b3b32] hover:border-[#c84b31]/40 dark:hover:border-[#ef4444]/40 hover:shadow-md transition-all duration-200 overflow-hidden"
                        >
                          {/* Nút bấm chọn xem chương */}
                          <button
                            type="button"
                            onClick={() => handleSelectBook(book)}
                            className="p-3.5 pb-2 text-left w-full focus:outline-none"
                            title={`Xem ${book.chapters} chương sách ${book.name}`}
                          >
                            <div className="flex items-center justify-between gap-1 mb-1.5">
                              <span className="text-[11px] font-mono font-extrabold px-2 py-0.5 rounded-md bg-[#c84b31]/10 text-[#962c16] dark:bg-[#ef4444]/15 dark:text-[#fca5a5]">
                                {book.short}
                              </span>
                              <span className="text-[11px] font-semibold text-[#575e55] dark:text-[#9eb1a6]">
                                {book.chapters} ch.
                              </span>
                            </div>
                            <h4 className="text-[14px] sm:text-[14.5px] font-bold font-serif text-[#1e2621] dark:text-[#ecece0] group-hover:text-[#c84b31] dark:group-hover:text-[#fca5a5] truncate">
                              {book.name}
                            </h4>
                          </button>

                          {/* Thanh footer phân loại & nút tải PDF độc lập */}
                          <div className="px-3.5 pb-3 pt-1 flex items-center justify-between text-[11.5px] text-[#575e55] dark:text-[#9eb1a6] border-t border-[#dedfd4]/60 dark:border-[#2b3b32]/60">
                            <span className="truncate">{book.category}</span>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleDownloadBookPdf(book)}
                                className="w-7 h-7 rounded-md border border-[#dedfd4] dark:border-[#2b3b32] hover:bg-[#c84b31]/10 hover:text-[#c84b31] dark:hover:bg-[#ef4444]/15 dark:hover:text-[#fca5a5] flex items-center justify-center transition-colors"
                                title={`Tải file PDF sách ${book.name}`}
                                aria-label={`Tải file PDF sách ${book.name}`}
                              >
                                <Download className="w-3 h-3" aria-hidden="true" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSelectBook(book)}
                                className="text-[#c84b31] dark:text-[#fca5a5] font-bold text-[11px] opacity-0 group-hover:opacity-100 transition-opacity hidden sm:inline"
                                aria-label={`Mở sách ${book.name}`}
                              >
                                Chọn →
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="py-16 text-center text-[#575e55] dark:text-[#9eb1a6]">
                    <p className="font-medium text-[14px]">
                      Không tìm thấy quyển sách nào khớp với từ khóa "{search}".
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSearch("");
                        setTab("all");
                      }}
                      className="mt-2.5 text-[12.5px] font-bold text-[#c84b31] dark:text-[#fca5a5] underline hover:no-underline"
                    >
                      Xóa bộ lọc để hiển thị trọn bộ 73 sách
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Modal */}
          <footer className="px-5 sm:px-7 py-3.5 border-t border-[#dedfd4] dark:border-[#2b3b32] bg-[#fffefa]/90 dark:bg-[#18221d]/90 flex flex-col sm:flex-row items-center justify-between gap-3 text-[12.5px] flex-shrink-0">
            <div className="flex items-center gap-2 text-[#575e55] dark:text-[#9eb1a6] text-center sm:text-left">
              <BookMarked className="w-4 h-4 text-[#c84b31] dark:text-[#fca5a5] flex-shrink-0" aria-hidden="true" />
              <span>
                Đã lưu trữ trọn bộ <strong>73 file PDF Kinh Thánh</strong> trên máy chủ Giáo xứ An Ngãi
              </span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <a
                href={BIBLE_BASE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#314e3e] dark:bg-[#d6b883] text-white dark:text-[#19251d] font-bold text-[12px] sm:text-[12.5px] hover:bg-[#253d30] dark:hover:bg-[#e2c792] transition-all shadow-sm active:scale-95 whitespace-nowrap min-h-[38px]"
              >
                <span>Mở Cổng Lời Chúa Mỗi Ngày</span>
                <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
              </a>
            </div>
          </footer>
        </MotionDiv>
      </div>
    </AnimatePresence>
  );
}
