import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../ui/ToastContext.jsx";
import { supabase } from "../../lib/supabase.js";
import { motion } from "framer-motion";

const RESOURCE_LINKS = [
  { label: "Khối Kinh Thánh", path: "/khối-kinh-thánh" },
  { label: "Khối Phụng Vụ", path: "/khối-phụng-vụ" },
  { label: "Khối Thêm Sức", path: "/khối-thêm-sức" },
  { label: "Thư viện tài liệu", path: "/tài-liệu" },
];

const INFO_LINKS = [
  { label: "Giới thiệu", path: "/giới-thiệu" },
  { label: "Lịch sinh hoạt", path: "/lịch-sinh-hoạt" },
  { label: "Liên hệ", path: "/liên-hệ" },
];

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50">
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function LinkGroup({ title, links, onNavigate }) {
  return (
    <div className="flex flex-col space-y-4">
      <h3 className="text-[12px] font-bold uppercase tracking-widest text-amber-900/80 dark:text-amber-400/80">
        {title}
      </h3>
      <ul className="flex flex-col space-y-3">
        {links.map((link) => (
          <li key={link.path}>
            <button
              type="button"
              onClick={() => onNavigate(link.path)}
              className="group relative text-left text-[14px] font-medium text-stone-600 transition-all hover:text-amber-900 dark:text-stone-400 dark:hover:text-amber-200"
            >
              <span className="relative z-10">{link.label}</span>
              <span className="absolute -bottom-0.5 left-0 h-[2px] w-0 bg-amber-600/30 transition-all duration-300 ease-out group-hover:w-full dark:bg-amber-400/30" />
            </button>
          </li>
        ))}
      </ul>
    </div>
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
    try {
      const { error } = await supabase.from('subscribers').insert({ email: email.trim() });
      if (error) {
        if (error.code === '23505') {
          showToast("Email này đã được đăng ký", "warning");
        } else {
          throw error;
        }
      } else {
        showToast("Đăng ký nhận tin thành công!", "success");
        setEmail("");
      }
    } catch (err) {
      console.error("Lỗi đăng ký email:", err);
      showToast("Có lỗi xảy ra, vui lòng thử lại sau", "error");
    } finally {
      setSubscribing(false);
    }
  };

  const year = useMemo(() => new Date().getFullYear(), []);

  return (
    <footer className="mt-auto relative z-10 w-full overflow-hidden border-t border-amber-900/10 bg-[#FDFBF7]/80 pb-[calc(env(safe-area-inset-bottom)+6rem)] antialiased backdrop-blur-xl md:pb-12 md:pt-16 dark:border-amber-100/10 dark:bg-[#1C1917]/80">
      {/* Decorative gradient blur background */}
      <div className="absolute inset-x-0 -top-24 -z-10 flex justify-center opacity-40 dark:opacity-20 pointer-events-none">
        <div className="h-[200px] w-[800px] bg-gradient-to-r from-amber-100 via-amber-200/50 to-amber-100 blur-[80px] dark:from-amber-900/40 dark:via-amber-800/20 dark:to-amber-900/40" />
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Lưới chính - Desktop (Đã ẩn trên Mobile theo yêu cầu) */}
        <div className="hidden md:grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8">
          
          {/* Cột 1: Thương hiệu (Chiếm 4 cột trên lg) */}
          <div className="space-y-6 lg:col-span-4 lg:pr-8">
            <div className="flex items-center gap-4 select-none">
              <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-amber-200/60 bg-white shadow-sm dark:border-amber-800/30 dark:bg-stone-900">
                <img
                  src="/images/logo_htdc.avif"
                  alt="Giáo xứ An Ngãi"
                  className="h-full w-full object-cover p-1.5"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-[18px] font-extrabold tracking-tight text-amber-950 dark:text-amber-50 font-serif leading-tight">
                  Ban Giáo Lý
                </span>
                <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-amber-800/60 font-mono dark:text-amber-400/60">
                  HTDC · Xứ đoàn Mẹ Mân Côi
                </p>
              </div>
            </div>

            <p className="text-[14px] font-medium leading-relaxed text-stone-600/90 dark:text-stone-400/90">
              Nền tảng học hỏi và kết nối đức tin cho cộng đoàn. Đồng hành cùng giáo lý viên và phụ huynh.
            </p>

            <div className="flex items-center gap-3">
              <motion.a
                whileHover={{ scale: 1.05, translateY: -2 }}
                whileTap={{ scale: 0.95 }}
                href="https://www.facebook.com/profile.php?id=61558564791118"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-stone-600 shadow-sm border border-stone-200/60 transition-colors hover:text-[#1877F2] dark:bg-stone-800 dark:border-stone-700/60 dark:text-stone-400"
                aria-label="Facebook"
              >
                <FacebookIcon />
              </motion.a>
              <motion.button
                whileHover={{ scale: 1.05, translateY: -2 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => showToast("Trang Instagram đang được cập nhật", "info")}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-stone-600 shadow-sm border border-stone-200/60 transition-colors hover:text-[#E4405F] dark:bg-stone-800 dark:border-stone-700/60 dark:text-stone-400"
                aria-label="Instagram"
              >
                <InstagramIcon />
              </motion.button>
            </div>
          </div>

          {/* Cột 2 & 3: Liên kết (Chiếm 4 cột trên lg) */}
          <div className="grid grid-cols-2 gap-8 lg:col-span-4">
            <LinkGroup title="Tài nguyên" links={RESOURCE_LINKS} onNavigate={navigate} />
            <LinkGroup
              title="Thông tin"
              links={[...INFO_LINKS, { label: "Góp ý hệ thống", path: "mailto:htdcanngai@gmail.com" }]}
              onNavigate={(path) => (path.startsWith("mailto:") ? (window.location.href = path) : navigate(path))}
            />
          </div>

          {/* Cột 4: Đăng ký nhận tin (Chiếm 4 cột trên lg) */}
          <div className="space-y-4 lg:col-span-4 lg:pl-4">
            <div className="space-y-1.5">
              <h4 className="text-[12px] font-bold uppercase tracking-widest text-amber-900/80 dark:text-amber-400/80">
                Nhận tin tức
              </h4>
              <p className="text-[13px] font-medium leading-relaxed text-stone-600 dark:text-stone-400">
                Đăng ký để nhận các thông báo quan trọng và tài liệu mới nhất qua Email.
              </p>
            </div>
            
            <form onSubmit={handleSubscribe} className="relative flex flex-col gap-3">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-stone-400">
                  <MailIcon />
                </div>
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={subscribing}
                  placeholder="Nhập địa chỉ email..."
                  className="w-full rounded-2xl border border-stone-300/60 bg-white/80 py-3.5 pl-10 pr-4 text-[14px] font-medium text-amber-950 placeholder-stone-400 shadow-sm transition-all focus:border-amber-600/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-amber-600/10 disabled:opacity-60 dark:border-stone-700/60 dark:bg-stone-900/50 dark:text-amber-50 dark:focus:border-amber-400/50 dark:focus:bg-stone-900"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={subscribing}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-700 to-amber-900 py-3.5 text-[14px] font-bold text-white shadow-md shadow-amber-900/20 transition-all hover:shadow-lg hover:shadow-amber-900/30 disabled:opacity-70 dark:from-amber-600 dark:to-amber-800"
              >
                {subscribing ? (
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                ) : (
                  "Đăng ký ngay"
                )}
              </motion.button>
            </form>
          </div>
        </div>

        {/* Bản quyền - Tối ưu cho Mobile & Desktop */}
        <div className="md:mt-16 mb-[env(safe-area-inset-bottom)] md:mb-0 flex flex-col items-center justify-center gap-4 border-t border-amber-900/10 pt-6 md:pt-8 text-center md:flex-row md:justify-between dark:border-amber-100/10">
          
          <div className="flex flex-col items-center gap-1 md:items-start">
            <p className="text-[11px] font-bold tracking-widest uppercase text-amber-900/60 dark:text-amber-400/60">
              HTDC Xứ đoàn Mẹ Mân Côi
            </p>
            <p className="text-[12px] font-medium text-stone-500/80 dark:text-stone-500">
              © {year} Giáo xứ An Ngãi. All rights reserved.
            </p>
          </div>

          <div className="flex justify-center gap-6 text-[12px] font-semibold text-stone-500 select-none md:justify-end dark:text-stone-400">
            <button type="button" onClick={() => navigate("/quy-định")} className="transition-colors hover:text-amber-900 dark:hover:text-amber-200">
              Quy định sử dụng
            </button>
            <button type="button" onClick={() => navigate("/bảo-mật")} className="transition-colors hover:text-amber-900 dark:hover:text-amber-200">
              Chính sách bảo mật
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}