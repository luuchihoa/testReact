/**
 * scrollToSection — wrapper nhất quán cho lenis.scrollTo / native scroll
 *
 * Dùng ở MỌI NƠI cần scroll đến 1 section (ScrollToTop, nút CTA, hero button…)
 * để offset luôn bằng nhau, tránh gap khác nhau giữa các cách navigate.
 *
 * @param {object|null} lenis   — instance từ useLenis()
 * @param {string|Element} target — CSS selector hoặc DOM element
 * @param {object} opts          — ghi đè duration, easing, extraOffset nếu cần
 */
export function scrollToSection(lenis, target, opts = {}) {
  const {
    duration    = 1.2,
    extraOffset = 16,   // breathing room phía trên section (px)
    easing      = (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  } = opts;

  // Đo chiều cao sticky header thực tế — không hardcode
  const header       = document.querySelector("header");
  const headerHeight = header ? header.getBoundingClientRect().height : 64;
  const offset       = -(headerHeight + extraOffset);

  const el = typeof target === "string" ? document.querySelector(target) : target;
  if (!el) return;

  if (lenis) {
    lenis.scrollTo(el, { offset, duration, easing });
  } else {
    // fallback khi Lenis chưa init (SSR, slow mount…)
    const top = el.getBoundingClientRect().top + window.scrollY + offset;
    window.scrollTo({ top, behavior: "smooth" });
  }
}