import { useEffect, useRef, useCallback } from "react";

/**
 * useSound — dùng chung cho QuizContent.jsx VÀ DoVui.jsx
 * API không đổi so với bản cũ: vẫn `const { play } = useSound()`.
 * Thêm: unlock() (mở khóa audio trên iOS/Safari sau gesture đầu tiên)
 *       stopAll() (tắt hết audio đang phát, dùng khi thoát quiz)
 */
const SOUND_SOURCES = {
  select: { src: "https://luuchihoa.github.io/sound/click.mp3", volume: 0.4 },
  win: { src: "https://luuchihoa.github.io/sound/win.mp3", volume: 0.35 },
  hover: { src: "https://luuchihoa.github.io/sound/hover.mp3", volume: 1 },
  wrong: { src: "https://luuchihoa.github.io/sound/buzzer.mp3", volume: 0.4 },
  correct: { src: "https://luuchihoa.github.io/sound/ding.mp3", volume: 1 },
  // Hai âm tick dùng riêng cho countdown "final rush" của DoVui
  tick1: { src: "https://luuchihoa.github.io/sound/tick.wav", volume: 0.7 },
  tick2: { src: "https://luuchihoa.github.io/sound/tick.wav", volume: 0.7 },
};

export default function useSound() {
  const sounds = useRef({});

  useEffect(() => {
    const map = {};
    Object.entries(SOUND_SOURCES).forEach(([key, { src, volume }]) => {
      const audio = new Audio(src);
      audio.volume = volume;
      map[key] = audio;
    });
    sounds.current = map;

    return () => {
      Object.values(sounds.current).forEach((audio) => {
        audio.pause();
        audio.src = "";
      });
      sounds.current = {};
    };
  }, []);

  const play = useCallback((name, rate = 1) => {
    const audio = sounds.current[name];
    if (!audio) return;
    // clone để có thể phát chồng nhiều lần liên tiếp (giữ nguyên hành vi cũ)
    const clone = audio.cloneNode();
    clone.volume = audio.volume;
    clone.playbackRate = rate;
    clone.play().catch(() => {});
  }, []);

  // Gọi 1 lần trong cùng 1 user-gesture đầu tiên (vd nút "Bắt đầu")
  // để vượt qua chính sách autoplay của iOS/Safari.
  const unlock = useCallback(() => {
    Object.values(sounds.current).forEach((audio) => {
      const clone = audio.cloneNode();
      clone.volume = 0;
      clone.play().then(() => clone.pause()).catch(() => {});
    });
  }, []);

  const stopAll = useCallback(() => {
    Object.values(sounds.current).forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
    });
  }, []);

  return { play, unlock, stopAll };
}