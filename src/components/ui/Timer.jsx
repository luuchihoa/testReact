import { useEffect, useState, useRef } from "react";

export function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

/**
 * QuizTimer — đếm ngược dạng chữ (mm:ss), dùng cho QuizContent.jsx
 * (đếm ngược tổng thời gian làm bài). API giữ NGUYÊN như cũ:
 *   <QuizTimer duration={config.time} onTimeUp={autoSubmit} />
 * `running` là tùy chọn mới, mặc định true => hành vi y hệt bản cũ
 * (chạy liên tục từ lúc mount tới khi hết giờ).
 */
export function QuizTimer({
  duration,
  onTimeUp,
  running = true,
  className = "text-2xl font-extrabold text-red-600 tracking-wider",
}) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const timerRef = useRef(null);

  // Luôn giữ bản mới nhất của onTimeUp trong ref, KHÔNG đưa onTimeUp vào
  // dependency của effect chạy interval bên dưới. Nếu không, mỗi lần
  // component cha re-render (vd: khi chọn đáp án) tạo ra 1 hàm onTimeUp
  // mới => effect bị huỷ + setInterval mới được tạo lại từ đầu chu kỳ
  // 1 giây => đồng hồ bị khựng đúng lúc người dùng thao tác.
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
    // chỉ phụ thuộc `running` — interval chạy liên tục xuyên suốt,
    // không bị ảnh hưởng bởi việc component cha re-render
  }, [running]);

  return <span className={className}>{formatTime(timeLeft)}</span>;
}

/**
 * QuizTimerBar — thanh tiến trình đếm ngược theo TỪNG CÂU HỎI, dùng cho DoVui.jsx.
 * Dùng requestAnimationFrame để mượt, hỗ trợ pause/resume (vd khi guide-modal mở).
 *
 * Props:
 *  - duration: tổng thời gian 1 câu (ms), mặc định 30000
 *  - running: đang chạy hay tạm dừng
 *  - resetKey: đổi giá trị (vd index câu hỏi hiện tại) để timer reset về đầu
 *  - onTimeUp: hết giờ
 *  - onFinalRush: gọi mỗi giây trong `warnAtMs` cuối (để phát tick)
 *  - warnAtMs: ngưỡng tính là "sắp hết giờ", mặc định 3000ms
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

  // Reset mỗi khi resetKey đổi (sang câu hỏi mới)
  useEffect(() => {
    stop();
    remainingRef.current = duration;
    warnedRef.current = false;
    lastSecRef.current = null;
    if (barRef.current) {
      barRef.current.style.width = "0%";
      barRef.current.className = "h-full rounded-full bg-green-400 transition-none";
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  // Chạy / tạm dừng theo `running`, tiếp tục từ điểm dừng (không reset)
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
          barRef.current.className =
            "h-full rounded-full bg-red-500 animate-pulse transition-none";
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  return (
    <div className="w-full h-2 my-3 rounded-full bg-black/20 overflow-hidden">
      <div
        ref={barRef}
        className="h-full rounded-full bg-green-400 transition-none"
        style={{ width: "0%" }}
      />
    </div>
  );
}

/**
 * QuizTimerRing — đồng hồ đếm ngược dạng VÒNG TRÒN (kiểu Apple Watch ring /
 * iOS Clock), dùng cho DoVui bản UI mới. Đổi màu theo mức độ khẩn cấp:
 * xanh lá (an toàn) → cam (sắp hết) → đỏ + nhấp nháy (nguy cấp).
 *
 * Props giống QuizTimerBar (duration, running, resetKey, onTimeUp, onFinalRush)
 * + warnAtMs/dangerAtMs để chỉnh ngưỡng đổi màu, size/strokeWidth để chỉnh kích thước.
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
  strokeWidth = 4,
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

  // Reset khi sang câu mới (resetKey đổi)
  useEffect(() => {
    stop();
    remainingRef.current = duration;
    lastLabelSecRef.current = null;
    lastRushSecRef.current = null;
    setLabel(Math.ceil(duration / 1000));
    setStage("safe");
    if (circleRef.current) circleRef.current.style.strokeDashoffset = "0";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  // Chạy / tạm dừng, tiếp tục từ điểm dừng
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  const stageColor = { safe: "#34C759", warn: "#FF9500", danger: "#FF375F" }[stage];

  return (
    <div
      className="relative flex-shrink-0"
      style={{ width: size, height: size }}
      role="timer"
      aria-label={`Còn ${label} giây`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#F2F2F7" strokeWidth={strokeWidth} />
        <circle
          ref={circleRef}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={stageColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={0}
          style={{ transition: "stroke 0.25s ease" }}
        />
      </svg>
      <div
        className={`absolute inset-0 flex items-center justify-center text-[13px] font-bold tabular-nums ${
          stage === "danger" ? "text-[#FF375F] animate-pulse" : "text-gray-700"
        }`}
      >
        {label}
      </div>
    </div>
  );
}

// Giữ nguyên cách import cũ: `import QuizTimer from "./ui/Timer.jsx"`
export default QuizTimer;