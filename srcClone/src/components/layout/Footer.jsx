import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../ui/ToastContext.jsx";

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
    <details className="group border-b border-amber-900/10 py-1 md:border-none md:py-0 dark:border-amber-100/10" open>
      <summary
        className="flex cursor-pointer list-none items-center justify-between py-3 text-[11px] font-bold uppercase tracking-wider text-amber-800/70 marker:content-none md:cursor-default md:py-0 md:pb-3.5 dark:text-amber-400/70"
      >
        {title}
        <span className="md:hidden text-amber-900/40 dark:text-amber-100/40">
          <ChevronIcon />
        </span>
      </summary>
      <ul className="space-y-2.5 pb-4 pt-1 md:pb-0 md:pt-0">
        {links.map((link) => (
          <li key={link.path}>
            <button
              type="button"
              onClick={() => onNavigate(link.path)}
              className="text-left text-[13px] font-medium text-stone-600 transition-colors md:hover:text-amber-900 dark:text-stone-400 dark:md:hover:text-amber-100"
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
    <footer className="mt-auto border-t border-amber-900/10 bg-[#FDFBF7]/85 pb-[max(1.5rem,env(safe-area-inset-bottom))] antialiased backdrop-blur-md md:pb-12 md:pt-14 dark:border-amber-100/10 dark:bg-[#1C1917]/85">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Lưới chính */}
        <div className="hidden md:grid grid-cols-1 gap-8 md:grid-cols-4 md:gap-10">
          {/* Cột 1: Thương hiệu */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3 select-none">
              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-amber-200/60 bg-gradient-to-br from-amber-50 to-[#FDFBF7] shadow-sm dark:border-amber-800/30 dark:from-amber-900/20 dark:to-[#1C1917]">
                <img
                  src="/images/logo_htdc.avif"
                  alt="Giáo xứ An Ngãi"
                  className="h-full w-full object-cover p-1"
                />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-[15px] font-extrabold tracking-tight text-amber-950 dark:text-amber-50 font-serif">
                  Ban Giáo Lý
                </span>
                <p className="mt-0.5 text-[9px] font-bold uppercase tracking-widest text-amber-800/60 font-mono whitespace-nowrap dark:text-amber-200/50">
                  HTDC · Xứ đoàn Mẹ Mân Côi
                </p>
              </div>
            </div>

            <p className="max-w-xs text-[13px] font-normal leading-relaxed text-stone-600 dark:text-stone-400">
              Nền tảng học hỏi và kết nối đức tin cho cộng đoàn. Luôn cập nhật và đổi mới vững vàng.
            </p>

            <div className="flex items-center gap-2 pt-1">
              <a
                href="https://www.facebook.com/profile.php?id=61558564791118"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full text-stone-500 transition-colors hover:bg-amber-900/5 active:bg-amber-900/10 dark:text-stone-400 dark:hover:bg-amber-100/10 dark:active:bg-amber-100/20"
                aria-label="Facebook"
              >
                <FacebookIcon />
              </a>
              <button
                type="button"
                onClick={() => showToast("Trang Instagram đang được cập nhật", "info")}
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-stone-500 transition-colors hover:bg-amber-900/5 active:bg-amber-900/10 dark:text-stone-400 dark:hover:bg-amber-100/10 dark:active:bg-amber-100/20"
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
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-amber-800/70 dark:text-amber-400/70">
              Nhận thông tin
            </h4>
            <p className="text-[13px] leading-relaxed text-stone-600 dark:text-stone-400">
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
                className="w-full rounded-xl border border-amber-900/20 bg-white/60 px-3.5 py-2.5 text-[13px] font-medium text-amber-950 placeholder-stone-400 shadow-sm transition-all focus:border-amber-900/50 focus:outline-none focus:ring-1 focus:ring-amber-900/50 disabled:opacity-60 dark:border-amber-100/20 dark:bg-stone-900/40 dark:text-amber-50 dark:placeholder-stone-500 dark:focus:border-amber-100/50 dark:focus:ring-amber-100/50"
              />
              <button
                type="submit"
                disabled={subscribing}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-amber-900 px-3.5 py-2.5 text-[13px] font-bold text-amber-50 shadow-sm transition-colors md:hover:bg-amber-950 active:scale-[0.98] disabled:opacity-60 dark:bg-amber-100 dark:text-amber-950 dark:md:hover:bg-amber-50"
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
        <div className="md:mt-8 mb-16 md:mb-0 flex flex-col items-center justify-center gap-3 border-t border-amber-900/10 md:pt-6 pt-5 text-center md:flex-row md:justify-between md:gap-4 md:text-left dark:border-amber-100/10">
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold tracking-widest uppercase text-amber-800/60 dark:text-amber-400/60">
              HTDC Xứ đoàn Mẹ Mân Côi
            </p>
            <p className="text-[11px] font-medium text-stone-500 dark:text-stone-500">
              © {year} Giáo xứ An Ngãi
            </p>
          </div>

          <div className="hidden md:flex justify-center gap-5 text-[11px] font-semibold text-stone-500 select-none md:justify-end dark:text-stone-500">
            <button type="button" onClick={() => navigate("/quy-định")} className="transition-colors hover:text-amber-900 dark:hover:text-amber-100">
              Quy định
            </button>
            <button type="button" onClick={() => navigate("/bảo-mật")} className="transition-colors hover:text-amber-900 dark:hover:text-amber-100">
              Bảo mật
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}