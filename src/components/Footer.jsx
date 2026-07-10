import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "./ui/ToastContext.jsx";

const RESOURCE_LINKS = [
  { label: "Khối Kinh Thánh", path: "/khối-kinh-thánh" },
  { label: "Khối Phụng Vụ", path: "/khối-phụng-vụ" },
  { label: "Khối Thêm Sức", path: "/khối-thêm-sức" },
  { label: "Tài liệu ôn tập", path: "/tài-liệu" },
];

const INFO_LINKS = [
  { label: "Giới thiệu", path: "/giới-thiệu" },
  { label: "Lịch sinh hoạt", path: "/lịch-sinh-hoạt" },
  { label: "Liên hệ", path: "/liên-hệ" },
];

function FacebookIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0 transition-transform duration-300 ease-out group-open:rotate-180"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

/** Cụm liên kết dạng disclosure — thu gọn trên mobile, luôn mở trên desktop (Apple footer pattern). */
function LinkGroup({ title, links, onNavigate }) {
  return (
    <details className="group border-b border-stone-200 py-1 md:border-none md:py-0 dark:border-stone-800" open>
      <summary
        className="flex cursor-pointer list-none items-center justify-between py-3 text-[13px] font-semibold uppercase tracking-wide text-stone-400 marker:content-none md:cursor-default md:py-0 md:pb-3.5 dark:text-stone-500"
      >
        {title}
        <span className="md:hidden">
          <ChevronIcon />
        </span>
      </summary>
      <ul className="space-y-2.5 pb-4 pt-1 md:pb-0 md:pt-0">
        {links.map((link) => (
          <li key={link.path}>
            <button
              type="button"
              onClick={() => onNavigate(link.path)}
              className="text-left text-[13px] font-medium text-stone-500 transition-colors md:hover:text-stone-800 dark:text-stone-400 dark:md:hover:text-stone-100"
            >
              {link.label}
            </button>
          </li>
        ))}
      </ul>
    </details>
  );
}

export default function Footer() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (subscribing) return;

    if (!email.trim()) {
      showToast("Vui lòng nhập email", "warning");
      return;
    }
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailValid) {
      showToast("Email không hợp lệ", "warning");
      return;
    }

    setSubscribing(true);
    await new Promise((resolve) => setTimeout(resolve, 700));
    showToast("Đăng ký nhận tin thành công", "success");
    setEmail("");
    setSubscribing(false);
  };

  const year = useMemo(() => new Date().getFullYear(), []);

  return (
    <footer className="mt-auto border-t border-stone-200/40 bg-white/85 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-8 antialiased backdrop-blur-md md:pb-12 md:pt-14 dark:border-stone-800 dark:bg-stone-950/85">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Lưới chính */}
        <div className="hidden md:grid grid-cols-1 gap-8 md:grid-cols-4 md:gap-10">
          {/* Cột 1: Thương hiệu */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3 select-none">
              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-orange-200/60 bg-gradient-to-br from-orange-50 to-white shadow-sm dark:border-orange-500/30 dark:from-orange-500/10 dark:to-stone-900">
                <img
                  src="/images/logo_htdc.avif"
                  alt="Giáo xứ An Ngãi"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-[15px] font-extrabold tracking-tight text-stone-800 dark:text-stone-100">
                  Ban Giáo Lý
                </span>
                <p className="mt-0.5 text-[9px] font-bold uppercase tracking-widest text-stone-400 font-mono whitespace-nowrap dark:text-stone-500">
                  HTDC · Xứ đoàn Mẹ Mân Côi
                </p>
              </div>
            </div>

            <p className="max-w-xs text-[13px] font-normal leading-relaxed text-stone-500 dark:text-stone-400">
              Nền tảng học hỏi và kết nối đức tin cho cộng đoàn. Luôn cập nhật và đổi mới vững vàng.
            </p>

            <div className="flex items-center gap-2 pt-1">
              <a
                href="https://www.facebook.com/profile.php?id=61558564791118"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full text-stone-500 transition-colors hover:bg-stone-100 active:bg-stone-200 dark:text-stone-400 dark:hover:bg-stone-800 dark:active:bg-stone-700"
                aria-label="Facebook"
              >
                <FacebookIcon />
              </a>
              <button
                type="button"
                onClick={() => showToast("Trang Instagram đang được cập nhật", "info")}
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-stone-500 transition-colors hover:bg-stone-100 active:bg-stone-200 dark:text-stone-400 dark:hover:bg-stone-800 dark:active:bg-stone-700"
                aria-label="Instagram"
              >
                <InstagramIcon />
              </button>
            </div>
          </div>

          {/* Cụm liên kết — thu gọn trên mobile bằng disclosure, hai cột cố định trên desktop */}
          <div className="grid grid-cols-1 md:col-span-2 md:grid-cols-2 md:gap-10">
            <LinkGroup title="Tài nguyên" links={RESOURCE_LINKS} onNavigate={navigate} />
            <LinkGroup
              title="Thông tin"
              links={[...INFO_LINKS, { label: "Góp ý hệ thống", path: "mailto:htdcanngai@gmail.com" }]}
              onNavigate={(path) => (path.startsWith("mailto:") ? (window.location.href = path) : navigate(path))}
            />
          </div>

          {/* Cột 4: Đăng ký nhận tin */}
          <div className="space-y-3 pt-1 md:col-span-1 md:pt-0">
            <h4 className="text-[13px] font-semibold uppercase tracking-wide text-stone-400 dark:text-stone-500">
              Nhận thông tin
            </h4>
            <p className="text-[13px] leading-relaxed text-stone-500 dark:text-stone-400">
              Cập nhật lịch học và tài liệu mới nhất.
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col gap-2.5">
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={subscribing}
                placeholder="Email của bạn"
                className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-[13px] font-medium text-stone-900 placeholder-stone-400 shadow-sm transition-all focus:border-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-400 disabled:opacity-60 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100 dark:placeholder-stone-500 dark:focus:border-stone-600 dark:focus:ring-stone-600"
              />
              <button
                type="submit"
                disabled={subscribing}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-stone-900 px-3.5 py-2.5 text-[13px] font-semibold text-white shadow-sm transition-colors md:hover:bg-stone-800 active:bg-stone-950 active:scale-[0.98] disabled:opacity-60 dark:bg-white dark:text-stone-900 dark:md:hover:bg-stone-100"
              >
                {subscribing && (
                  <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                )}
                {subscribing ? "Đang gửi…" : "Đăng ký"}
              </button>
            </form>
          </div>
        </div>

        {/* Bản quyền dưới cùng */}
        <div className="md:mt-8 mb-16 md:mb-0 flex flex-col items-center justify-center gap-3 md:border-t md:border-stone-200 md:pt-6 text-center md:mt-12 md:flex-row md:justify-between md:gap-4 md:text-left dark:border-stone-800">
          <div className="space-y-1">
            <p className="text-[11px] font-bold tracking-widest uppercase text-stone-400 dark:text-stone-500">
              HTDC Xứ đoàn Mẹ Mân Côi
            </p>
            <p className="text-[11px] font-medium text-stone-400/80 dark:text-stone-500/80">
              © {year} Giáo xứ An Ngãi
            </p>
          </div>

          <div className="hidden md:flex justify-center gap-5 text-[11px] font-semibold text-stone-400 select-none md:justify-end dark:text-stone-500">
            <button type="button" onClick={() => navigate("/quy-định")} className="transition-colors hover:text-stone-700 dark:hover:text-stone-300">
              Quy định
            </button>
            <button type="button" onClick={() => navigate("/bảo-mật")} className="transition-colors hover:text-stone-700 dark:hover:text-stone-300">
              Bảo mật
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}