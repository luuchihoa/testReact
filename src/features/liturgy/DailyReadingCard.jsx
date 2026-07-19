import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, X, ArrowRight, Loader2, Copy, Check, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getLiturgyInfo, getLiturgicalYear, getLiturgicalColor } from '../../utils/liturgyCalendar.js';
import { supabase } from '../../lib/supabase.js';

// BẢNG MÀU PHỤNG VỤ ĐỘNG (Đồng điệu với Home.jsx & Mùa Phụng Vụ)
const LITURGICAL_THEMES = {
  amber: {
    btnBg: 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-900/20',
    icon: 'text-amber-600 dark:text-amber-400',
    badgeBg: 'bg-amber-100/90 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700/60 text-amber-900 dark:text-amber-200',
    accentText: 'text-amber-700 dark:text-amber-400',
    headingText: 'text-amber-950 dark:text-amber-100',
    bgGradient: 'from-amber-100/40 via-amber-50/20 to-transparent dark:from-amber-950/30',
    pingBorder: 'border-amber-500',
    iconBg: 'bg-amber-50 dark:bg-amber-900/40',
  },
  emerald: {
    btnBg: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-900/20',
    icon: 'text-emerald-600 dark:text-emerald-400',
    badgeBg: 'bg-emerald-100/90 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700/60 text-emerald-900 dark:text-emerald-200',
    accentText: 'text-emerald-700 dark:text-emerald-400',
    headingText: 'text-emerald-950 dark:text-emerald-100',
    bgGradient: 'from-emerald-100/40 via-emerald-50/20 to-transparent dark:from-emerald-950/30',
    pingBorder: 'border-emerald-500',
    iconBg: 'bg-emerald-50 dark:bg-emerald-900/40',
  },
  purple: {
    btnBg: 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-900/20',
    icon: 'text-purple-600 dark:text-purple-400',
    badgeBg: 'bg-purple-100/90 dark:bg-purple-950/60 border-purple-300 dark:border-purple-700/60 text-purple-900 dark:text-purple-200',
    accentText: 'text-purple-700 dark:text-purple-400',
    headingText: 'text-purple-950 dark:text-purple-100',
    bgGradient: 'from-purple-100/40 via-purple-50/20 to-transparent dark:from-purple-950/30',
    pingBorder: 'border-purple-500',
    iconBg: 'bg-purple-50 dark:bg-purple-900/40',
  },
  rose: {
    btnBg: 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-900/20',
    icon: 'text-rose-600 dark:text-rose-400',
    badgeBg: 'bg-rose-100/90 dark:bg-rose-950/60 border-rose-300 dark:border-rose-700/60 text-rose-900 dark:text-rose-200',
    accentText: 'text-rose-700 dark:text-rose-400',
    headingText: 'text-rose-950 dark:text-rose-100',
    bgGradient: 'from-rose-100/40 via-rose-50/20 to-transparent dark:from-rose-950/30',
    pingBorder: 'border-rose-500',
    iconBg: 'bg-rose-50 dark:bg-rose-900/40',
  }
};

function getLiturgicalCycles(year) {
  const sundayCycle = ["C", "A", "B"][year % 3];
  const weekdayCycle = (year % 2 === 0) ? "II" : "I";
  return { sundayCycle, weekdayCycle };
}

export default function DailyReadingCard() {
  const [isOpen, setIsOpen] = useState(false);
  const [liturgyInfo, setLiturgyInfo] = useState(null);
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Tải dữ liệu ngầm (Prefetching) ngay khi vừa mount component
  useEffect(() => {
    fetchReading();
  }, []);

  const fetchReading = async () => {
    setLoading(true);
    try {
      const today = new Date();
      const info = getLiturgyInfo(today);
      setLiturgyInfo(info);

      const lityear = getLiturgicalYear(today);
      const cycles = getLiturgicalCycles(lityear);
      const isSpecialABCFeast = info.key === 'feast_thanh_tam' || info.key === 'feast_gia_that' || info.key === 'feast_tet_1';
      
      let currentCycle;
      if (info.isSunday || isSpecialABCFeast) {
        currentCycle = cycles.sundayCycle;
      } else if (info.season === 'thuong') {
        currentCycle = cycles.weekdayCycle;
      } else {
        currentCycle = 'all';
      }

      const m = String(today.getMonth() + 1).padStart(2, '0');
      const d = String(today.getDate()).padStart(2, '0');
      const possibleFeastKey = `feast_${m}_${d}`;

      const { data, error } = await supabase
        .from('liturgy_contents')
        .select('*')
        .in('liturgy_key', [info.key, possibleFeastKey])
        .in('cycle', [currentCycle, 'all']);

      if (!error && data && data.length > 0) {
        const getDataForKey = (targetKey) => {
          const specificData = data.find(d => d.cycle === currentCycle && d.liturgy_key === targetKey);
          const allData = data.find(d => d.cycle === 'all' && d.liturgy_key === targetKey);
          
          if (specificData && allData) {
            const merged = { ...specificData };
            for (let k in allData) {
              if (!merged[k] || merged[k].toString().trim() === "") merged[k] = allData[k];
            }
            return merged;
          }
          return specificData || allData;
        };

        const infoData = getDataForKey(info.key);
        const feastData = getDataForKey(possibleFeastKey);
        
        let selectedData = null;
        if ((info.isFeast || info.rank <= 12) && infoData) {
          selectedData = infoData;
        } else if (feastData) {
          selectedData = {
            ...feastData,
            title: feastData.title || info.displayName
          };
          setLiturgyInfo(prev => ({ ...prev, displayName: feastData.title, isFeast: true }));
        } else if (infoData) {
          selectedData = infoData;
        }

        setContent(selectedData);
      } else {
        setContent({
          title: "Lời Chúa Hằng Ngày",
          gospel_quote: "Phúc cho những ai có tâm hồn nghèo khó, vì Nước Trời là của họ.",
          gospel_ref: "Mt 5, 3"
        });
      }
    } catch (err) {
      console.error(err);
      setContent({
        title: "Lời Chúa Hằng Ngày",
        gospel_quote: "Phúc cho những ai có tâm hồn nghèo khó, vì Nước Trời là của họ.",
        gospel_ref: "Mt 5, 3"
      });
    } finally {
      setLoading(false);
    }
  };

  // Làm sạch văn bản trích dẫn: Lấy đúng 1 CÂU và LỌC BỎ các chữ số đầu câu
  const cleanSingleSentenceQuote = (rawQuote) => {
    if (!rawQuote) return '';

    // 1. Loại bỏ thẻ HTML
    let text = rawQuote.replace(/<[^>]+>/g, '').trim();

    // 2. Lọc bỏ chữ số đầu câu (Ví dụ: "11 21b Hồi ấy...", "21b Hồi ấy...", "5 Đức Giê-su...")
    text = text.replace(/^(\d{1,3}\s+\d{1,3}[a-d]{0,4}|\d{1,3}[a-d]{0,4})\s*/u, '');

    // 3. Loại bỏ ký tự ngoặc kép dính ở 2 đầu
    text = text.replace(/^["«'‘\s]+|["»'’\s]+$/g, '').trim();

    // 4. Lấy ĐÚNG 1 CÂU duy nhất (kết thúc bằng dấu . ! hoặc ?)
    const sentenceMatch = text.match(/^[^.!?\n]+[.!?]/u);
    if (sentenceMatch) {
      text = sentenceMatch[0].trim();
    } else {
      const firstLine = text.split('\n')[0].trim();
      text = firstLine.length > 120 ? firstLine.substring(0, 120) + '...' : firstLine;
    }

    return text;
  };

  // Trích xuất trích đoạn Phúc Âm thông minh
  const getFeaturedQuote = () => {
    if (!content) return { quote: "Phúc cho những ai có tâm hồn nghèo khó, vì Nước Trời là của họ.", ref: "Mt 5, 3" };
    
    if (content.gospel_quote && content.gospel_quote.trim()) {
      return { 
        quote: cleanSingleSentenceQuote(content.gospel_quote),
        ref: content.gospel_ref || ''
      };
    }

    if (content.gospel_content && content.gospel_content.trim()) {
      return {
        quote: cleanSingleSentenceQuote(content.gospel_content),
        ref: content.gospel_ref || ''
      };
    }

    if (content.quote) {
      return {
        quote: cleanSingleSentenceQuote(content.quote),
        ref: content.gospel_ref || ''
      };
    }

    return {
      quote: "Phúc cho những ai có tâm hồn nghèo khó, vì Nước Trời là của họ.",
      ref: "Mt 5, 3"
    };
  };

  const colorKey = getLiturgicalColor(liturgyInfo);
  const theme = LITURGICAL_THEMES[colorKey] || LITURGICAL_THEMES.amber;
  const featured = getFeaturedQuote();

  // Tiêu đề lấy từ Database: content.title
  const displayTitle = content?.title || liturgyInfo?.displayName || "Lời Chúa Hằng Ngày";

  const handleCopyQuote = () => {
    const textToCopy = `« ${featured.quote} » (${featured.ref})\n- ${displayTitle}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* Floating Badge (Nút nổi góc dưới trái - Phù hợp với màu sắc Home.jsx & Phụng vụ) */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-20 sm:bottom-6 left-4 sm:left-6 z-40 group flex items-center gap-2.5 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-full shadow-xl shadow-stone-900/10 border border-stone-200/90 dark:border-stone-800/90 transition-all"
          >
            <div className={`relative flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full ${theme.iconBg} ${theme.icon}`}>
              <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              {/* Ping effect màu Phụng vụ */}
              <span className={`absolute inset-0 rounded-full border ${theme.pingBorder} animate-ping opacity-25`}></span>
            </div>
            <div className="flex flex-col items-start text-left">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400 dark:text-stone-500">
                Lời Chúa
              </span>
              <span className={`text-[12px] sm:text-[13px] font-bold ${theme.accentText}`}>
                Hôm Nay
              </span>
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Modal Kính Mờ Sang Trọng */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-stone-950/40 dark:bg-black/70 backdrop-blur-md"
            />

            {/* Khối Nội Dung */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              className="relative w-full max-w-sm bg-white/95 dark:bg-stone-900/95 backdrop-blur-2xl rounded-[32px] shadow-2xl border border-stone-200/80 dark:border-stone-800/80 overflow-hidden"
            >
              {/* Background gradient nhẹ màu Phụng Vụ */}
              <div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} pointer-events-none`} />
              
              <div className="relative p-6 sm:p-8 flex flex-col items-center text-center">
                {/* Header Actions: Copy & Close */}
                <div className="absolute top-4 right-4 flex items-center gap-1.5">
                  <button
                    onClick={handleCopyQuote}
                    className="p-2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors bg-stone-100/80 dark:bg-stone-800/80 rounded-full backdrop-blur-md"
                    title="Sao chép trích dẫn"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors bg-stone-100/80 dark:bg-stone-800/80 rounded-full backdrop-blur-md"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {loading ? (
                  <div className="py-12 flex flex-col items-center justify-center">
                    <Loader2 className={`w-8 h-8 animate-spin ${theme.icon} mb-4`} />
                    <span className="text-[13px] font-medium text-stone-500">Đang tìm trang Kinh Thánh...</span>
                  </div>
                ) : (
                  <>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest border mb-3 flex items-center gap-1.5 ${theme.badgeBg}`}>
                      <Sparkles className="w-3 h-3" /> Lời Chúa Hôm Nay
                    </span>

                    {/* Tiêu đề lấy chính xác từ Database (content.title) */}
                    <h3 className={`text-[15px] sm:text-[16px] font-bold ${theme.headingText} font-sans mb-6 px-3 leading-snug`}>
                      {displayTitle}
                    </h3>

                    {/* Khối Lời Chúa Trích Đoạn: Lấy ĐÚNG 1 CÂU và KHÔNG CÓ chữ số đầu câu */}
                    <div className="mb-6 px-1">
                      <p className="font-serif text-[18px] sm:text-[20px] leading-relaxed text-stone-900 dark:text-stone-100 mb-3 italic">
                        « {featured.quote} »
                      </p>
                      {featured.ref && (
                        <p className={`text-[12px] sm:text-[13px] font-bold font-sans ${theme.accentText}`}>
                          ({featured.ref})
                        </p>
                      )}
                    </div>

                    <Link
                      to="/lời-chúa-hàng-ngày"
                      onClick={() => setIsOpen(false)}
                      className={`group flex items-center justify-center gap-2 w-full ${theme.btnBg} py-3.5 rounded-2xl text-[14px] font-bold shadow-lg transition-all active:scale-[0.98]`}
                    >
                      Đọc Toàn Bộ Bài Đọc
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
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
