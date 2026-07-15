import React, { useEffect, useState, useRef } from "react";

export function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

/**
 * QuizTimer — Đếm ngược dạng chữ
 */
export function QuizTimer({
  duration,
  onTimeUp,
  running = true,
  // Đổi sang font-serif và màu amber/red chuẩn hệ thống
  className = "text-[22px] sm:text-[24px] font-extrabold font-serif text-amber-700 dark:text-amber-500 tracking-wider tabular-nums",
}) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const timerRef = useRef(null);

  const onTimeUpRef = useRef(onTimeUp);
  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);

  useEffect(() => {
    if (!running) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          onTimeUpRef.current?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [running]);

  return <span className={className}>{formatTime(timeLeft)}</span>;
}

/**
 * QuizTimerBar — Thanh tiến trình đếm ngược
 */
export function QuizTimerBar({
  duration = 30_000,
  running = false,
  resetKey,
  onTimeUp,
  onFinalRush,
  warnAtMs = 3000,
}) {
  const rafRef = useRef(null);
  const barRef = useRef(null);
  const startRef = useRef(null);
  const remainingRef = useRef(duration);
  const warnedRef = useRef(false);
  const lastSecRef = useRef(null);

  const stop = () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  useEffect(() => {
    stop();
    remainingRef.current = duration;
    warnedRef.current = false;
    lastSecRef.current = null;
    if (barRef.current) {
      barRef.current.style.width = "0%";
      // Đồng bộ màu thanh an toàn
      barRef.current.className = "h-full rounded-full bg-emerald-500 transition-none";
    }
  }, [resetKey]);

  useEffect(() => {
    if (!running) {
      stop();
      return;
    }

    startRef.current = performance.now();
    const totalRemaining = remainingRef.current;

    function tick(now) {
      const elapsed = now - startRef.current;
      const remaining = Math.max(totalRemaining - elapsed, 0);
      const progress = 1 - remaining / duration;

      if (barRef.current) {
        barRef.current.style.width = `${progress * 100}%`;
        if (remaining <= warnAtMs && !warnedRef.current) {
          warnedRef.current = true;
          // Đồng bộ màu thanh cảnh báo
          barRef.current.className = "h-full rounded-full bg-red-500 animate-pulse transition-none";
        }
      }

      if (remaining <= warnAtMs) {
        const sec = Math.ceil(remaining / 1000);
        if (sec !== lastSecRef.current && sec > 0) {
          lastSecRef.current = sec;
          onFinalRush?.();
        }
      }

      if (remaining > 0) {
        remainingRef.current = remaining;
        rafRef.current = requestAnimationFrame(tick);
      } else {
        remainingRef.current = 0;
        rafRef.current = null;
        onTimeUp?.();
      }
    }

    rafRef.current = requestAnimationFrame(tick);
    return stop;
  }, [running]);

  return (
    <div className="w-full h-2 my-3 rounded-full bg-stone-200 dark:bg-stone-800 overflow-hidden shadow-inner">
      <div
        ref={barRef}
        className="h-full rounded-full bg-emerald-500 transition-none"
        style={{ width: "0%" }}
      />
    </div>
  );
}

/**
 * QuizTimerRing — Đồng hồ đếm ngược dạng vòng tròn
 */
export function QuizTimerRing({
  duration = 30_000,
  running = false,
  resetKey,
  onTimeUp,
  onFinalRush,
  warnAtMs = 10_000,
  dangerAtMs = 5_000,
  rushAtMs = 3_000,
  size = 52,
  strokeWidth = 4.5,
}) {
  const rafRef = useRef(null);
  const circleRef = useRef(null);
  const startRef = useRef(null);
  const remainingRef = useRef(duration);
  const lastLabelSecRef = useRef(null);
  const lastRushSecRef = useRef(null);
  const [label, setLabel] = useState(Math.ceil(duration / 1000));
  const [stage, setStage] = useState("safe"); // safe | warn | danger

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const stop = () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  useEffect(() => {
    stop();
    remainingRef.current = duration;
    lastLabelSecRef.current = null;
    lastRushSecRef.current = null;
    setLabel(Math.ceil(duration / 1000));
    setStage("safe");
    if (circleRef.current) circleRef.current.style.strokeDashoffset = "0";
  }, [resetKey]);

  useEffect(() => {
    if (!running) {
      stop();
      return;
    }
    startRef.current = performance.now();
    const totalRemaining = remainingRef.current;

    function tick(now) {
      const elapsed = now - startRef.current;
      const remaining = Math.max(totalRemaining - elapsed, 0);
      const progress = 1 - remaining / duration;

      if (circleRef.current) {
        circleRef.current.style.strokeDashoffset = String(circumference * progress);
      }

      const sec = Math.ceil(remaining / 1000);
      if (sec !== lastLabelSecRef.current) {
        lastLabelSecRef.current = sec;
        setLabel(sec);
      }

      setStage((prev) => {
        const next = remaining <= dangerAtMs ? "danger" : remaining <= warnAtMs ? "warn" : "safe";
        return next === prev ? prev : next;
      });

      if (remaining <= rushAtMs && sec !== lastRushSecRef.current && sec > 0) {
        lastRushSecRef.current = sec;
        onFinalRush?.();
      }

      if (remaining > 0) {
        remainingRef.current = remaining;
        rafRef.current = requestAnimationFrame(tick);
      } else {
        remainingRef.current = 0;
        rafRef.current = null;
        onTimeUp?.();
      }
    }

    rafRef.current = requestAnimationFrame(tick);
    return stop;
  }, [running]);

  // Sử dụng class Tailwind để tận dụng Dark Mode thay vì mã HEX cứng
  const stageClass = { 
    safe: "text-emerald-500", 
    warn: "text-amber-500", 
    danger: "text-red-500" 
  }[stage];

  return (
    <div
      className="relative flex-shrink-0"
      style={{ width: size, height: size }}
      role="timer"
      aria-label={`Còn ${label} giây`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle 
          cx={size / 2} cy={size / 2} r={radius} 
          fill="none" 
          className="stroke-stone-200 dark:stroke-stone-800" 
          strokeWidth={strokeWidth} 
        />
        <circle
          ref={circleRef}
          cx={size / 2} cy={size / 2} r={radius} 
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={0}
          className={`${stageClass}`}
          style={{ transition: "stroke-dashoffset 0.1s linear, color 0.3s ease" }}
        />
      </svg>
      <div
        className={`absolute inset-0 flex items-center justify-center text-[14px] font-bold tabular-nums font-serif transition-colors ${
          stage === "danger" ? "text-red-500 animate-pulse" : "text-amber-950 dark:text-amber-50"
        }`}
      >
        {label}
      </div>
    </div>
  );
}

export default QuizTimer;