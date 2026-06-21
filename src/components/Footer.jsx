import React, { useState } from "react";
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
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
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
    // UI-only for now — no backend wired up yet.
    await new Promise((resolve) => setTimeout(resolve, 700));
    showToast("Đăng ký nhận tin thành công", "success");
    setEmail("");
    setSubscribing(false);
  };

  return (
    <footer className="mt-auto border-t border-stone-200/50 bg-stone-50/50 pt-12 pb-24 md:pb-12 antialiased">
      <div className="mx-auto max-w-5xl px-6">
        {/* Lưới chính */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 md:gap-8">
          {/* Cột 1: Thương hiệu */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 select-none">
              <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-orange-200/50 bg-orange-50 shadow-sm">
                <img
                  src="https://lh3.googleusercontent.com/d/14MSGiNkSjngdtQ2LNXpeYZ9rbGciOgBG"
                  alt="Giáo xứ An Ngãi"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-bold tracking-tight text-stone-900">
                  Ban Giáo Lý <span className="font-semibold text-stone-500 md:hidden">| Gx. An Ngãi</span>
                </span>
                <p className="hidden md:block text-xs font-semibold text-stone-400">Gx. An Ngãi</p>
                <p className="block text-[10px] font-medium tracking-wide uppercase text-stone-400 md:hidden mt-0.5">
                  HTDC - Xứ Đoàn Mẹ Mân Côi
                </p>
              </div>
            </div>

            <p className="text-xs text-stone-500 leading-relaxed max-w-xs font-normal">
              Nền tảng học hỏi và kết nối đức tin cho cộng đoàn. Luôn cập nhật và đổi mới vững vàng.
            </p>

            <div className="flex items-center gap-3.5 pt-1">
              <a
                href="https://www.facebook.com/profile.php?id=61558564791118"
                target="_blank"
                rel="noopener noreferrer"
                className="text-stone-400 hover:text-stone-800 transition-colors"
                aria-label="Facebook"
              >
                <FacebookIcon />
              </a>
              {/* Instagram chưa có link thật — ẩn cho tới khi có, tránh trỏ nhầm về trang chủ */}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  showToast("Trang Instagram đang được cập nhật", "info");
                }}
                className="text-stone-400 hover:text-stone-800 transition-colors"
                aria-label="Instagram"
              >
                <InstagramIcon />
              </a>
            </div>
          </div>

          {/* Cụm Cột 2 & 3 */}
          <div className="grid grid-cols-2 md:col-span-2 gap-10">
            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-3.5">Tài nguyên</h4>
              <ul className="space-y-2.5">
                {RESOURCE_LINKS.map((link) => (
                  <li key={link.path}>
                    <button
                      type="button"
                      onClick={() => navigate(link.path)}
                      className="text-xs font-medium text-stone-500 hover:text-stone-900 transition-colors text-left"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-3.5">Thông tin</h4>
              <ul className="space-y-2.5">
                {INFO_LINKS.map((link) => (
                  <li key={link.path}>
                    <button
                      type="button"
                      onClick={() => navigate(link.path)}
                      className="text-xs font-medium text-stone-500 hover:text-stone-900 transition-colors text-left"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
                <li>
                  <a
                    href="mailto:htdcanngai@gmail.com"
                    className="block text-xs font-medium text-stone-500 hover:text-stone-900 transition-colors"
                  >
                    Góp ý hệ thống
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Cột 4: Đăng ký nhận tin */}
          <div className="space-y-3.5 sm:col-span-2 md:col-span-1">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Nhận thông tin</h4>
            <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={subscribing}
                placeholder="Email của bạn"
                className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-xs font-medium placeholder-stone-400 shadow-sm transition-all focus:border-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-400 disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={subscribing}
                className="w-full rounded-xl bg-stone-900 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-stone-800 active:bg-stone-950 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
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
        <div className="mt-12 border-t border-stone-200/60 pt-6 grid grid-cols-1 md:grid-cols-4 items-center gap-4">
          <div className="hidden md:block"></div>

          <div className="md:col-span-2 text-center space-y-1">
            <p className="text-stone-400 text-[10px] font-bold tracking-widest uppercase">
              HTDC Xứ đoàn Mẹ Mân Côi - Giáo Xứ An Ngãi
            </p>
            <p className="text-[10px] text-stone-400/80 font-medium">
              © 2026 Giáo xứ An Ngãi. Design by HTDC Xứ đoàn Mẹ Mân Côi.
            </p>
          </div>

          <div className="flex justify-center md:justify-end gap-5 text-[10px] text-stone-400 font-semibold select-none">
            <button type="button" onClick={() => navigate("/quy-định")} className="hover:text-stone-700 transition-colors">
              Quy định
            </button>
            <button type="button" onClick={() => navigate("/bảo-mật")} className="hover:text-stone-700 transition-colors">
              Bảo mật
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}