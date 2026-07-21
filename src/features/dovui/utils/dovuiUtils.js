export const SKIP_GUIDE_KEY = "skipGuideDoVui";
export const DEFAULT_QUESTION_DURATION_MS = 30_000;

// Hằng số Easing chuẩn hệ thống (Apple HIG)
export const APPLE_EASE = [0.16, 1, 0.3, 1];

// Thuật toán tráo bài Fisher-Yates chuẩn
export function shuffleArray(arr) {
  if (!Array.isArray(arr)) return [];
  const res = [...arr];
  for (let i = res.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [res[i], res[j]] = [res[j], res[i]];
  }
  return res;
}

// Pháo hoa Confetti chúc mừng
export function burstConfetti(x, y) {
  if (typeof window === "undefined") return;
  const colors = ["#d97706", "#b45309", "#f59e0b", "#fcd34d", "#10b981", "#3b82f6", "#ec4899"];
  const count = 20;
  const els = [];
  const targetX = x ?? window.innerWidth / 2;
  const targetY = y ?? window.innerHeight / 3;

  for (let i = 0; i < count; i++) {
    const el = document.createElement("span");
    const angle = (Math.PI * 2 * i) / count;
    const velocity = 70 + Math.random() * 60;
    el.style.cssText = `
      position: fixed; left: ${targetX}px; top: ${targetY}px;
      width: ${6 + Math.random() * 6}px; height: ${6 + Math.random() * 6}px;
      border-radius: ${Math.random() > 0.5 ? "50%" : "2px"};
      background: ${colors[i % colors.length]};
      pointer-events: none; z-index: 9999;
    `;
    document.body.appendChild(el);
    els.push(el);

    el.animate(
      [
        { transform: "translate(-50%, -50%) scale(1)", opacity: 1 },
        {
          transform: `translate(calc(-50% + ${Math.cos(angle) * velocity}px), calc(-50% + ${
            Math.sin(angle) * velocity + 40
          }px)) rotate(${Math.random() * 360}deg) scale(0.2)`,
          opacity: 0,
        },
      ],
      { duration: 750, easing: "cubic-bezier(0.16, 1, 0.3, 1)", fill: "forwards" }
    );
  }

  setTimeout(() => els.forEach((el) => el.remove()), 800);
}
