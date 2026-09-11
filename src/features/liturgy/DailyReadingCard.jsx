import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, X, ArrowRight, Loader2, Copy, Check, Minimize2, Maximize2 } from 'lucide-react';
import { getLiturgyInfo } from '../../utils/liturgyCalendar.js';
import { resolveLiturgyContentForDate } from '../../utils/liturgyContentResolver.js';
import { liturgySupabase } from '../../lib/liturgySupabase.js';

export default function DailyReadingCard() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [liturgyInfo, setLiturgyInfo] = useState(null);
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Tải dữ liệu ngầm khi vừa mount component
  useEffect(() => {
    fetchReading();
  }, []);

  const fetchReading = async () => {
    setLoading(true);
    try {
      const today = new Date();
      const info = getLiturgyInfo(today);
      setLiturgyInfo(info);

      // Kiểm tra cache trong ngày
      const dayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      const cacheKey = `liturgy_daily_card_${dayKey}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed && (parsed.quote || parsed.gospel_content || parsed.r1_content)) {
            setContent(parsed);
            setLoading(false);
            return;
          }
        } catch (e) {}
      }

      const dayStr = String(today.getDate()).padStart(2, '0');
      const monthStr = String(today.getMonth() + 1).padStart(2, '0');
      const mNum = String(today.getMonth() + 1);
      const dNum = String(today.getDate());

      const is30TetDate = (
        info.key === 'feast_tat_nien' ||
        info.key === 'feast_giao_thua' ||
        (info.displayName && (info.displayName.includes('Tất Niên') || info.displayName.includes('Giao Thừa')))
      );

      // Chuẩn bị danh sách key chuẩn xác từ loi-chua-hang-ngay
      const keysToFetch = Array.from(new Set([
        info.key,
        is30TetDate ? 'feast_tat_nien' : null,
        is30TetDate ? 'feast_giao_thua' : null,
        `feast_${monthStr}_${dayStr}`,
        `feast_${mNum}_${dNum}`,
        `fixed_${monthStr}_${dayStr}`,
        `fixed_${mNum}_${dNum}`,
        info.seasonKey
      ].filter(Boolean)));

      // Chỉ fetch đúng các trường hiển thị cần thiết, không dư thừa
      const { data, error } = await liturgySupabase
        .from('liturgy_contents')
        .select('liturgy_key, cycle, title, mass_title, quote, gospel_ref, gospel_content, r1_ref, r1_quote, r1_content, reflection')
        .in('liturgy_key', keysToFetch);

      if (!error && data && data.length > 0) {
        // Áp dụng logic giải quyết nội dung chuẩn từ loi-chua-hang-ngay
        const { content: resolved } = resolveLiturgyContentForDate(today, data);
        if (resolved) {
          setContent(resolved);
          localStorage.setItem(cacheKey, JSON.stringify(resolved));
        }
      }
    } catch (err) {
      console.error('[DailyReadingCard] Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Làm sạch và cắt ngắn văn bản
  const cleanAndTruncateMainContent = (rawText, maxLength = 160) => {
    if (!rawText) return '';
    let text = rawText.replace(/<[^>]+>/g, '').trim();
    text = text.replace(/(\b\d{1,3}[a-d]?\b|\b\d{1,3}\s+\d{1,3}[a-d]?\b)/g, ' ');
    text = text.replace(/\s+/g, ' ').trim();
    text = text.replace(/^["«'‘\s]+|["»'’\s]+$/g, '').trim();
    if (text.length > maxLength) {
      const truncated = text.substring(0, maxLength);
      const lastSpaceIndex = truncated.lastIndexOf(' ');
      text = (lastSpaceIndex > 40 ? truncated.substring(0, lastSpaceIndex).trim() : truncated.trim()) + '...';
    }
    return text;
  };

  // Trích xuất câu nổi bật và tham chiếu
  const getFeaturedQuote = () => {
    if (!content) {
      return {
        quote: "Phúc cho những ai có tâm hồn nghèo khó, vì Nước Trời là của họ.",
        ref: "Mt 5, 3"
      };
    }

    const mainRef = content.gospel_ref || content.r1_ref || '';

    // Ưu tiên câu trích dẫn quote có sẵn trong database
    if (content.quote && content.quote.trim()) {
      return {
        quote: cleanAndTruncateMainContent(content.quote, 180),
        ref: mainRef
      };
    }

    // Nếu không có quote, trích 1 đoạn từ Tin Mừng hoặc Bài đọc 1
    const mainText = content.gospel_content || content.r1_content || content.gospel_quote || content.r1_quote;
    if (mainText && mainText.trim()) {
      return {
        quote: cleanAndTruncateMainContent(mainText, 160),
        ref: mainRef
      };
    }

    return {
      quote: "Phúc cho những ai có tâm hồn nghèo khó, vì Nước Trời là của họ.",
      ref: "Mt 5, 3"
    };
  };

  const featured = getFeaturedQuote();
  const displayTitle = content?.title || liturgyInfo?.displayName || "Lời Chúa Hằng Ngày";

  const handleCopyQuote = () => {
    const textToCopy = `« ${featured.quote} » (${featured.ref})\n- ${displayTitle}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* Floating Badge (Góc dưới trái - Tối ưu di động) */}
      <AnimatePresence>
        {!isOpen && (
          isMinimized ? (
            <motion.div
              key="minimized-badge"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="fixed bottom-20 sm:bottom-6 left-3 sm:left-6 z-40 group flex items-center touch-manipulation"
            >
              <button
                onClick={() => setIsOpen(true)}
                title="Lời Chúa Hôm Nay (Nhấn để mở đọc)"
                className="relative flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/95 dark:bg-stone-900/95 backdrop-blur-md shadow-lg shadow-amber-900/15 border border-amber-900/15 dark:border-amber-100/15 text-amber-600 dark:text-amber-400 active:scale-95 sm:hover:scale-110 transition-all"
              >
                <BookOpen className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
                <span className="absolute inset-0 rounded-full border border-amber-500 animate-ping opacity-25 pointer-events-none"></span>
              </button>
              {/* Nút nhỏ để mở rộng lại badge */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMinimized(false);
                }}
                title="Mở rộng đầy đủ"
                className="absolute -top-1 -right-1 w-5.5 h-5.5 sm:w-5 sm:h-5 rounded-full bg-amber-700 text-white flex items-center justify-center shadow-md opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity active:scale-90"
              >
                <Maximize2 className="w-3 h-3" />
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="expanded-badge"
              initial={{ opacity: 0, y: 50, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="fixed bottom-20 sm:bottom-6 left-3 sm:left-6 z-40 group flex items-center gap-1.5 sm:gap-2 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md pl-3.5 sm:pl-4 pr-1.5 sm:pr-2 py-2.5 sm:py-3 rounded-full shadow-lg shadow-amber-900/15 border border-amber-900/15 dark:border-amber-100/15 transition-all touch-manipulation active:scale-[0.98]"
            >
              <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2.5 sm:gap-3 text-left"
              >
                <div className="relative flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                  <BookOpen className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
                  <span className="absolute inset-0 rounded-full border border-amber-500 animate-ping opacity-25"></span>
                </div>
                <span className="text-[14px] sm:text-[15px] font-bold text-amber-950 dark:text-amber-50 pr-0.5 sm:pr-1">
                  Lời Chúa Hôm Nay
                </span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMinimized(true);
                }}
                className="p-1.5 sm:p-1.5 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-amber-100/70 dark:hover:bg-amber-900/50 transition-colors ml-0.5 active:bg-amber-200/60"
                title="Thu nhỏ thành biểu tượng"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            </motion.div>
          )
        )}
      </AnimatePresence>

      {/* Modal Kính Mờ Amber Hổ Phách - Tối ưu Mobile */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-stone-900/40 dark:bg-black/70 backdrop-blur-sm"
            />

            {/* Khối Nội Dung Modal */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              className="relative w-full max-w-sm max-h-[88vh] bg-white/90 dark:bg-stone-900/90 backdrop-blur-2xl rounded-[28px] sm:rounded-[32px] shadow-2xl border border-white/50 dark:border-white/10 overflow-y-auto"
            >
              {/* Background gradient Amber */}
              <div className="absolute inset-0 bg-gradient-to-br from-amber-100/40 to-transparent dark:from-amber-900/20 pointer-events-none" />
              
              <div className="relative p-5 sm:p-8 flex flex-col items-center text-center">
                {/* Header Actions: Copy & Close */}
                <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center gap-1">
                  <button
                    onClick={handleCopyQuote}
                    className="p-2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors bg-white/60 dark:bg-stone-800/60 rounded-full backdrop-blur-md active:scale-95"
                    title="Sao chép trích dẫn"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors bg-white/60 dark:bg-stone-800/60 rounded-full backdrop-blur-md active:scale-95"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {loading ? (
                  <div className="py-10 sm:py-12 flex flex-col items-center justify-center">
                    <Loader2 className="w-7 h-7 sm:w-8 sm:h-8 animate-spin text-amber-600 mb-3" />
                    <span className="text-[12px] sm:text-[13px] font-medium text-stone-500">Đang tìm trang Kinh Thánh...</span>
                  </div>
                ) : (
                  <>
                    <p className="text-[11px] sm:text-[13px] font-extrabold uppercase tracking-[0.16em] text-amber-900/80 dark:text-amber-400 mb-1.5 sm:mb-2 mt-1">
                      Lời Chúa Hôm Nay
                    </p>

                    {/* Tiêu đề từ Database */}
                    <h3 className="text-[15px] sm:text-[16px] font-bold text-amber-950 dark:text-amber-50 font-sans mb-5 sm:mb-7 px-1 leading-snug">
                      {displayTitle}
                    </h3>

                    {/* Khối Lời Chúa: Đoạn trích nội dung chính */}
                    <div className="mb-6 sm:mb-8 w-full">
                      <p className="font-serif text-[14px] sm:text-[16px] leading-relaxed text-amber-950 dark:text-amber-100 mb-2.5 sm:mb-3 italic px-1">
                        « {featured.quote} »
                      </p>
                      {featured.ref && (
                        <p className="text-[12px] sm:text-[13px] font-medium text-stone-500 dark:text-stone-400">
                          ({featured.ref})
                        </p>
                      )}
                    </div>

                    {/* Nút Đọc tiếp: Chuyển hướng sang loichuamoingay.org */}
                    <a
                      href="https://loichuamoingay.org"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setIsOpen(false)}
                      className="group flex items-center justify-center gap-2 w-full bg-gradient-to-r from-amber-700 to-amber-900 hover:from-amber-800 hover:to-amber-950 text-white py-3 sm:py-3.5 rounded-2xl text-[13px] sm:text-[14px] font-bold shadow-lg shadow-amber-900/20 transition-all active:scale-[0.97]"
                    >
                      Đọc tiếp
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </a>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
