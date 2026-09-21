import { useState, useEffect, useMemo } from 'react';
import { getLiturgyInfo } from '../../utils/liturgyCalendar.js';
import { resolveLiturgyContentForDate } from '../../utils/liturgyContentResolver.js';
import { liturgySupabase } from '../../lib/liturgySupabase.js';

export function cleanAndTruncateMainContent(rawText, maxLength = 180) {
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
}

function getCachedLiturgyContent(today) {
  if (typeof window === "undefined") return null;
  const dayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const cacheKey = `liturgy_daily_card_${dayKey}`;
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && (parsed.quote || parsed.gospel_content || parsed.r1_content)) {
        return parsed;
      }
    }
  } catch (_err) {
    void _err;
  }
  return null;
}

export function useDailyLiturgy(inputDate = null) {
  const liturgyInfo = useMemo(() => getLiturgyInfo(inputDate || new Date()), [inputDate]);
  const [content, setContent] = useState(() => getCachedLiturgyContent(inputDate || new Date()));
  const [loading, setLoading] = useState(() => !getCachedLiturgyContent(inputDate || new Date()));
  const [error, setError] = useState(null);
  const [refreshIndex, setRefreshIndex] = useState(0);

  const refetch = () => {
    const today = inputDate || new Date();
    const dayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const cacheKey = `liturgy_daily_card_${dayKey}`;
    try {
      localStorage.removeItem(cacheKey);
    } catch (_err) {
      void _err;
    }
    setRefreshIndex((prev) => prev + 1);
  };

  useEffect(() => {
    let isMounted = true;
    const today = inputDate || new Date();
    const info = getLiturgyInfo(today);
    const dayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const cacheKey = `liturgy_daily_card_${dayKey}`;

    // Nếu đã có cache và không phải refetch thủ công thì không cần request mạng
    if (refreshIndex === 0) {
      const cachedData = getCachedLiturgyContent(today);
      if (cachedData) {
        return;
      }
    }

    async function fetchReading() {
      setLoading(true);
      setError(null);
      try {
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

        const { data, error: sbError } = await liturgySupabase
          .from('liturgy_contents')
          .select('liturgy_key, cycle, title, mass_title, quote, gospel_ref, gospel_content, r1_ref, r1_quote, r1_content, reflection')
          .in('liturgy_key', keysToFetch);

        if (sbError) {
          throw sbError;
        }

        if (data && data.length > 0 && isMounted) {
          const { content: resolved } = resolveLiturgyContentForDate(today, data);
          if (resolved) {
            setContent(resolved);
            try {
              localStorage.setItem(cacheKey, JSON.stringify(resolved));
            } catch (_err) {
              void _err;
            }
          }
        }
      } catch (err) {
        console.error('[useDailyLiturgy] Fetch error:', err);
        if (isMounted) setError(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchReading();

    return () => {
      isMounted = false;
    };
  }, [inputDate, refreshIndex]);

  // Trích xuất câu nổi bật và tham chiếu theo thời gian thực
  const getFeaturedQuote = () => {
    if (!content) {
      return {
        quote: "Chúa là mục tử chăn dắt tôi, tôi chẳng thiếu thốn gì. Trong đồng cỏ xanh tươi, Người cho tôi nằm nghỉ.",
        ref: "Tv 23, 1-2"
      };
    }

    const mainRef = content.gospel_ref || content.r1_ref || '';

    // 1. Ưu tiên câu trích dẫn quote có sẵn trong database
    if (content.quote && content.quote.trim()) {
      return {
        quote: cleanAndTruncateMainContent(content.quote, 200),
        ref: mainRef
      };
    }

    // 2. Nếu không có quote, trích 1 đoạn từ Tin Mừng hoặc Bài đọc 1
    const mainText = content.gospel_content || content.r1_content || content.gospel_quote || content.r1_quote;
    if (mainText && mainText.trim()) {
      return {
        quote: cleanAndTruncateMainContent(mainText, 180),
        ref: mainRef
      };
    }

    return {
      quote: "Chúa là nguồn ánh sáng và ơn cứu độ của tôi, tôi còn sợ nỗi gì?",
      ref: "Tv 27, 1"
    };
  };

  const featured = getFeaturedQuote();
  const isFallback = !content;
  const displayTitle = content?.title || (isFallback ? "Lời Chúa Suy Niệm" : (liturgyInfo?.displayName || "Lời Chúa Hằng Ngày"));

  return {
    loading,
    liturgyInfo,
    content,
    featured,
    displayTitle,
    isFallback,
    error,
    refetch
  };
}
