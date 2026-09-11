import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Search,
  X,
  ExternalLink,
  ArrowLeft,
  Download,
  Compass
} from "lucide-react";
import {
  ALL_BIBLE_BOOKS,
  OLD_TESTAMENT_BOOKS,
  NEW_TESTAMENT_BOOKS,
  BIBLE_BASE_URL,
  getBibleDeepLink,
  getBibleBookPdfUrl,
  searchBibleBooks,
  findBookById
} from "../../data/bibleBooksData.js";

const APPLE_EASE = [0.16, 1, 0.3, 1];

export default function BibleQuickNavigatorModal({
  isOpen,
  onClose,
  initialBookId = null,
  initialTestament = "all"
}) {
  const [tab, setTab] = useState(initialTestament);
  const [search, setSearch] = useState("");
  const [selectedBook, setSelectedBook] = useState(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      if (initialBookId) {
        const found = findBookById(initialBookId);
        if (found) {
          setSelectedBook(found);
          setTab(found.testament);
        }
      } else {
        setSelectedBook(null);
        setTab(initialTestament);
      }
      setSearch("");
    }
  }, [isOpen, initialBookId, initialTestament]);

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

  const filteredBooks = useMemo(() => {
    return searchBibleBooks(search, tab);
  }, [search, tab]);

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
      link.download = `${book.name.replace(/[\/\\?%*:|"<>]/g, "_")}.pdf`;
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
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
          className="fixed inset-0 bg-stone-900/60 dark:bg-black/80 backdrop-blur-md cursor-pointer"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ duration: 0.35, ease: APPLE_EASE }}
          className="relative w-full max-w-3xl lg:max-w-4xl max-h-[92vh] sm:max-h-[88vh] bg-[#faf8f5] dark:bg-[#1C1917] border border-amber-900/15 dark:border-amber-100/10 rounded-[24px] sm:rounded-[32px] shadow-2xl flex flex-col overflow-hidden text-stone-900 dark:text-stone-100 z-10"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-5 sm:px-7 py-4 sm:py-5 border-b border-amber-900/10 dark:border-amber-100/10 flex items-center justify-between flex-shrink-0 bg-white/70 dark:bg-stone-900/60 backdrop-blur-md">
            <div className="flex items-center gap-3 min-w-0">
              {selectedBook ? (
                <button
                  onClick={() => setSelectedBook(null)}
                  className="p-2 -ml-2 rounded-xl text-stone-500 hover:text-amber-900 dark:hover:text-amber-100 hover:bg-amber-100/50 dark:hover:bg-stone-800 transition-all flex items-center gap-1 text-[13px] font-bold"
                  title="Quay lại danh sách sách"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Quay lại</span>
                </button>
              ) : (
                <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/60 border border-amber-300/40 dark:border-amber-700/40 flex items-center justify-center flex-shrink-0 text-amber-800 dark:text-amber-400 shadow-sm">
                  <BookOpen className="w-5 h-5" />
                </div>
              )}

              <div className="min-w-0">
                <h2 className="text-[17px] sm:text-[19px] font-extrabold font-serif text-amber-950 dark:text-amber-50 truncate flex items-center gap-2">
                  {selectedBook ? (
                    <span>{selectedBook.name} <span className="text-[13px] font-sans font-bold text-amber-700 dark:text-amber-400">({selectedBook.short})</span></span>
                  ) : (
                    <span>Kinh Thánh Trọn Bộ 73 Quyển</span>
                  )}
                </h2>
                <p className="text-[12px] text-stone-500 dark:text-stone-400 font-medium truncate">
                  {selectedBook 
                    ? `${selectedBook.testament === "old" ? "Cựu Ước" : "Tân Ước"} • ${selectedBook.category} • ${selectedBook.chapters} chương` 
                    : "Bản dịch CGKPV • Liên kết Lời Chúa Mỗi Ngày"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={onClose}
                aria-label="Đóng tra cứu"
                className="w-9 h-9 rounded-full bg-stone-200/60 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 flex items-center justify-center transition-all active:scale-95"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-4">
            {selectedBook ? (
              <div className="space-y-6">
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/5 dark:from-amber-900/20 dark:to-stone-900 border border-amber-900/10 dark:border-amber-100/10 flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10.5px] font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 mb-1.5">
                      {selectedBook.testament === "old" ? "Cựu Ước" : "Tân Ước"} • {selectedBook.category}
                    </span>
                    <h3 className="text-lg sm:text-xl font-extrabold font-serif text-amber-950 dark:text-amber-50 truncate">
                      Sách {selectedBook.name}
                    </h3>
                    <p className="text-[12.5px] sm:text-[13px] text-stone-500 dark:text-stone-400 mt-0.5 leading-relaxed">
                      Tổng cộng {selectedBook.chapters} chương. Chọn số chương bên dưới để đọc hoặc tải về:
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => handleOpenChapter(selectedBook.id, 1)}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-900 dark:bg-amber-100 text-amber-50 dark:text-amber-950 font-bold text-[12.5px] hover:bg-amber-800 dark:hover:bg-white shadow-md active:scale-95 transition-all whitespace-nowrap"
                    >
                      <span>Đọc từ Chương 1</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDownloadBookPdf(selectedBook)}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700 font-bold text-[12.5px] hover:bg-stone-100 dark:hover:bg-stone-700/60 shadow-sm active:scale-95 transition-all whitespace-nowrap"
                      title={`Tải file PDF sách ${selectedBook.name}`}
                    >
                      <Download className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                      <span>Tải PDF Sách Này</span>
                    </button>
                  </div>
                </div>

                <div>
                  <h4 className="text-[12px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-3 ml-1">
                    Danh Sách Chương ({selectedBook.chapters})
                  </h4>
                  <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2 sm:gap-2.5">
                    {Array.from({ length: selectedBook.chapters }, (_, i) => i + 1).map((chap) => (
                      <button
                        key={chap}
                        onClick={() => handleOpenChapter(selectedBook.id, chap)}
                        className="group relative flex flex-col items-center justify-center h-12 rounded-xl bg-white dark:bg-stone-800/80 border border-stone-200/80 dark:border-stone-700/80 hover:border-amber-600 dark:hover:border-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-stone-800 dark:text-stone-200 hover:text-amber-900 dark:hover:text-amber-200 transition-all shadow-sm active:scale-95"
                        title={`Mở Sách ${selectedBook.name} Chương ${chap}`}
                      >
                        <span className="text-[15px] font-bold font-serif">{chap}</span>
                        <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 text-amber-600 dark:text-amber-400 absolute bottom-1 right-1 transition-opacity" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="relative w-full">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Tìm sách (vd: Sáng Thế, St, Mát-thêu, Mt, Thánh Vịnh...)"
                      className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-amber-900/15 dark:border-amber-100/10 bg-white dark:bg-stone-800/80 text-[13.5px] font-medium text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-800/30 dark:focus:ring-amber-400/30 shadow-sm transition-all"
                    />
                    {search && (
                      <button
                        onClick={() => setSearch("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 p-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="flex gap-2 border-b border-amber-900/10 dark:border-amber-100/10 pb-2 overflow-x-auto scrollbar-none">
                    {[
                      { id: "all", label: "Tất cả 73 Sách", count: ALL_BIBLE_BOOKS.length },
                      { id: "old", label: "Cựu Ước", count: OLD_TESTAMENT_BOOKS.length },
                      { id: "new", label: "Tân Ước", count: NEW_TESTAMENT_BOOKS.length },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setTab(item.id)}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12.5px] font-bold whitespace-nowrap transition-all active:scale-95 ${
                          tab === item.id
                            ? "bg-amber-900 text-amber-50 dark:bg-amber-100 dark:text-amber-950 shadow-sm"
                            : "bg-white/80 dark:bg-stone-800/60 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700/60 border border-stone-200/60 dark:border-stone-700/60"
                        }`}
                      >
                        <span>{item.label}</span>
                        <span className="text-[10px] opacity-80">({item.count})</span>
                      </button>
                    ))}
                  </div>
                </div>

                {filteredBooks.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                    {filteredBooks.map((book) => (
                      <button
                        key={book.id}
                        onClick={() => handleSelectBook(book)}
                        className="group flex flex-col justify-between p-3 rounded-2xl bg-white dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700/60 hover:border-amber-700/40 dark:hover:border-amber-400/40 hover:bg-amber-50/50 dark:hover:bg-stone-800 text-left transition-all duration-200 shadow-sm hover:shadow active:scale-[0.98]"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="text-[10.5px] font-extrabold px-1.5 py-0.5 rounded bg-amber-100/70 dark:bg-stone-700 text-amber-900 dark:text-amber-300">
                              {book.short}
                            </span>
                            <span className="text-[10.5px] font-semibold text-stone-400 dark:text-stone-500">
                              {book.chapters} ch.
                            </span>
                          </div>
                          <h4 className="text-[13.5px] font-bold font-serif text-amber-950 dark:text-amber-50 group-hover:text-amber-700 dark:group-hover:text-amber-300 truncate">
                            {book.name}
                          </h4>
                        </div>
                        <div className="mt-2 flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400">
                          <span className="truncate">{book.category}</span>
                          <div className="flex items-center gap-1.5">
                            <span
                              role="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownloadBookPdf(book);
                              }}
                              className="p-1 rounded-md hover:bg-amber-200/60 dark:hover:bg-stone-700 text-stone-400 hover:text-amber-800 dark:hover:text-amber-300 transition-colors"
                              title={`Tải file PDF sách ${book.name}`}
                            >
                              <Download className="w-3 h-3" />
                            </span>
                            <span className="text-amber-700 dark:text-amber-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                              Chọn →
                            </span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center text-stone-500 dark:text-stone-400">
                    <p className="font-medium">Không tìm thấy quyển sách nào khớp với từ khóa "{search}".</p>
                    <button
                      onClick={() => setSearch("")}
                      className="mt-2 text-xs font-bold text-amber-700 dark:text-amber-400 underline"
                    >
                      Xóa bộ lọc tìm kiếm
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="px-5 sm:px-7 py-3.5 border-t border-amber-900/10 dark:border-amber-100/10 bg-stone-100/70 dark:bg-stone-900/90 flex flex-col sm:flex-row items-center justify-between gap-3 text-[12.5px] flex-shrink-0">
            <div className="flex items-center gap-2 text-stone-600 dark:text-stone-300 text-center sm:text-left">
              <Download className="w-4 h-4 text-amber-700 dark:text-amber-400 flex-shrink-0" />
              <span>Đã lưu trữ trọn bộ <strong>73 file PDF Kinh Thánh</strong> trên máy chủ Giáo xứ</span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <a
                href={BIBLE_BASE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-amber-900 dark:bg-amber-100 text-amber-50 dark:text-amber-950 font-bold text-[12px] sm:text-[12.5px] hover:bg-amber-800 dark:hover:bg-white transition-all shadow-sm active:scale-95 whitespace-nowrap"
              >
                <span>Mở Lời Chúa Mỗi Ngày</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
