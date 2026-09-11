import { useState, useEffect, useRef, useCallback } from 'react';
import { findAudioUrl } from '../utils/audioLookup.js';

/**
 * Custom Hook quản lý phát âm thanh MP3 cho Bài Đọc Phụng Vụ
 * Chỉ phát các file âm thanh MP3 thực tế (không dùng giọng đọc máy tự động)
 */
export function useLiturgyTTS() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentSection, setCurrentSection] = useState(null);
  const [rate, setRateState] = useState(1); // Tốc độ đọc (0.8x, 1x, 1.2x)
  
  const audioObjRef = useRef(null);
  const playTokenRef = useRef(0);
  const playlistItemsRef = useRef([]);
  const playlistIndexRef = useRef(0);

  // Dừng tất cả âm thanh đang phát
  const stop = useCallback(() => {
    playTokenRef.current += 1;
    playlistItemsRef.current = [];
    playlistIndexRef.current = 0;

    if (audioObjRef.current) {
      try {
        audioObjRef.current.onplay = null;
        audioObjRef.current.onended = null;
        audioObjRef.current.onerror = null;
        audioObjRef.current.pause();
        audioObjRef.current.removeAttribute('src');
        audioObjRef.current.load();
      } catch (e) {
        // ignore
      }
      audioObjRef.current = null;
    }

    setIsPlaying(false);
    setIsPaused(false);
    setCurrentSection(null);
  }, []);

  // Tạm dừng phát
  const pause = useCallback(() => {
    if (audioObjRef.current && isPlaying && !isPaused) {
      audioObjRef.current.pause();
      setIsPaused(true);
    }
  }, [isPlaying, isPaused]);

  // Tiếp tục phát
  const resume = useCallback(() => {
    if (audioObjRef.current && isPaused) {
      audioObjRef.current.play().catch(() => {});
      setIsPaused(false);
    }
  }, [isPaused]);

  // Phát file MP3 của một trích đoạn
  const playAudioOrMp3 = useCallback((text, sectionTitle = 'Bài Đọc', refString = null, prefix = 'gospel') => {
    stop();
    const currentToken = playTokenRef.current;

    const matchedAudioUrl = findAudioUrl(refString, prefix);

    // Nếu không có file MP3 -> Không phát âm thanh máy (ngắt sạch)
    if (!matchedAudioUrl) {
      return;
    }

    const audio = new Audio(matchedAudioUrl);
    audio.playbackRate = rate;
    audioObjRef.current = audio;

    audio.onplay = () => {
      if (currentToken !== playTokenRef.current) {
        audio.pause();
        return;
      }
      setIsPlaying(true);
      setIsPaused(false);
      setCurrentSection(`${sectionTitle} (Audio MP3)`);
    };

    audio.onended = () => {
      if (currentToken === playTokenRef.current) {
        audioObjRef.current = null;
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentSection(null);
      }
    };

    audio.onerror = () => {
      if (currentToken === playTokenRef.current) {
        stop();
      }
    };

    audio.play().catch(() => {
      if (currentToken === playTokenRef.current) {
        stop();
      }
    });
  }, [rate, stop]);

  // Phát danh sách bài đọc MP3 liên tục theo thứ tự (BĐ1 -> BĐ2 -> Tin Mừng)
  const playPlaylist = useCallback((items) => {
    stop();
    if (!items || items.length === 0) return;

    const currentToken = playTokenRef.current;
    playlistItemsRef.current = items;
    playlistIndexRef.current = 0;

    const playNext = (index) => {
      if (currentToken !== playTokenRef.current) return;

      // Tìm bài đọc tiếp theo có file MP3 hợp lệ
      let foundIndex = -1;
      let matchedAudioUrl = null;

      for (let i = index; i < playlistItemsRef.current.length; i++) {
        const item = playlistItemsRef.current[i];
        const url = findAudioUrl(item.ref, item.prefix);
        if (url) {
          foundIndex = i;
          matchedAudioUrl = url;
          break;
        }
      }

      // Nếu không còn bài nào có MP3
      if (foundIndex === -1 || !matchedAudioUrl) {
        playlistItemsRef.current = [];
        playlistIndexRef.current = 0;
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentSection(null);
        return;
      }

      playlistIndexRef.current = foundIndex;
      const currentItem = playlistItemsRef.current[foundIndex];

      const audio = new Audio(matchedAudioUrl);
      audio.playbackRate = rate;
      audioObjRef.current = audio;

      audio.onplay = () => {
        if (currentToken !== playTokenRef.current) {
          audio.pause();
          return;
        }
        setIsPlaying(true);
        setIsPaused(false);
        setCurrentSection(`${currentItem.title} (Audio MP3)`);
      };

      audio.onended = () => {
        if (currentToken === playTokenRef.current) {
          audioObjRef.current = null;
          // Tự động chuyển sang bài đọc tiếp theo trong danh sách
          playNext(foundIndex + 1);
        }
      };

      audio.onerror = () => {
        if (currentToken === playTokenRef.current) {
          playNext(foundIndex + 1);
        }
      };

      audio.play().catch(() => {
        if (currentToken === playTokenRef.current) {
          playNext(foundIndex + 1);
        }
      });
    };

    playNext(0);
  }, [rate, stop]);

  // Đổi tốc độ đọc
  const changeRate = (newRate) => {
    setRateState(newRate);
    if (audioObjRef.current) {
      audioObjRef.current.playbackRate = newRate;
    }
  };

  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return {
    isPlaying,
    isPaused,
    currentSection,
    rate,
    playAudioOrMp3,
    playPlaylist,
    pause,
    resume,
    stop,
    changeRate,
  };
}
