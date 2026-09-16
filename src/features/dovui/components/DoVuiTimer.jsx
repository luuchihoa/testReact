import { useEffect, useRef, useState } from "react";

// Duration changes add only the difference (for example the +10-second help).
export default function DoVuiTimer({ duration, running, onTimeUp, onFinalRush }) {
  const [seconds, setSeconds] = useState(() => Math.ceil(duration / 1000));
  const remainingRef = useRef(duration);
  const durationRef = useRef(duration);
  const completedRef = useRef(false);
  const warnedRef = useRef(null);
  const callbacksRef = useRef({ onTimeUp, onFinalRush });

  useEffect(() => {
    callbacksRef.current = { onTimeUp, onFinalRush };
  }, [onTimeUp, onFinalRush]);

  useEffect(() => {
    remainingRef.current += duration - durationRef.current;
    durationRef.current = duration;
    const started = performance.now();
    const initial = remainingRef.current;
    let frame;
    const tick = (now) => {
      const remaining = Math.max(0, initial - (running ? now - started : 0));
      const value = Math.ceil(remaining / 1000);
      setSeconds(value);
      if (running && value > 0 && value <= 3 && warnedRef.current !== value) {
        warnedRef.current = value;
        callbacksRef.current.onFinalRush?.();
      }
      if (running && remaining === 0 && !completedRef.current) {
        completedRef.current = true;
        callbacksRef.current.onTimeUp?.();
      } else if (running && !completedRef.current) {
        frame = requestAnimationFrame(tick);
      }
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      remainingRef.current = Math.max(0, initial - (running ? performance.now() - started : 0));
    };
  }, [duration, running]);

  return <strong className={`dovui-timer ${seconds <= 5 ? "dovui-timer--urgent" : ""}`} role="timer" aria-label={`Còn ${seconds} giây`}>{seconds}<span> giây</span></strong>;
}
