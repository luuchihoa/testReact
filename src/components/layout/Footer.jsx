import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useToast } from "../ui/ToastContext.jsx";
import { usePWAInstall } from "../ui/PWAInstallContext.jsx";
import { supabase } from "../../lib/supabase.js";

// Đầy đủ 7 Khối giáo lý & Giới trẻ (không kèm số tuổi theo yêu cầu)
const CATECHISM_BLOCKS = [
  { label: "Khối Chiên Con", path: "/khối-chiên-con" },
  { label: "Khối Rước Lễ", path: "/khối-rước-lễ" },
  { label: "Khối Thêm Sức", path: "/khối-thêm-sức" },
  { label: "Khối Kinh Thánh", path: "/khối-kinh-thánh" },
  { label: "Khối Phụng Vụ", path: "/khối-phụng-vụ" },
  { label: "Khối Vào Đời", path: "/khối-vào-đời" },
  { label: "Giới Trẻ Công Giáo", path: "/giới-trẻ-công-giáo" },
];

const INFO_LINKS = [
  { label: "Giới thiệu", path: "/giới-thiệu" },
  { label: "Lịch sinh hoạt", path: "/lịch-sinh-hoạt" },
  { label: "Lịch học giáo lý", path: "/lịch-học" },
  { label: "Tuyển sinh", path: "/tuyển-sinh" },
  { label: "Thư viện tài liệu", path: "/tài-liệu" },
  { label: "Cài đặt ứng dụng", action: "install" },
  { label: "Liên hệ", path: "/liên-hệ" },
  { label: "Góp ý hệ thống", path: "mailto:htdcanngai@gmail.com", isExternal: true },
];

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function LinkGroup({ title, links, onAction }) {
  return (
    <div className="flex flex-col space-y-4">
      <h3 className="text-[12px] font-bold uppercase tracking-widest text-[#7c5c2d] dark:text-[#d4b47d]">
        {title}
      </h3>
      <ul className="flex flex-col space-y-2.5">
        {links.map((link) => (
          <li key={link.label}>
            {link.action ? (
              <button
                type="button"
                onClick={() => onAction?.(link.action)}
                className="group relative text-left text-[13.5px] font-medium text-[#575e55] transition-colors hover:text-[#293d32] dark:text-[#b0b9ac] dark:hover:text-[#ecece0] cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#314e3e]"
              >
                <span>{link.label}</span>
              </button>
            ) : link.isExternal || link.path.startsWith("mailto:") ? (
              <a
                href={link.path}
                className="group relative text-left text-[13.5px] font-medium text-[#575e55] transition-colors hover:text-[#293d32] dark:text-[#b0b9ac] dark:hover:text-[#ecece0]"
              >
                <span>{link.label}</span>
              </a>
            ) : (
              <Link
                to={link.path}
                className="group relative text-left text-[13.5px] font-medium text-[#575e55] transition-colors hover:text-[#293d32] dark:text-[#b0b9ac] dark:hover:text-[#ecece0]"
              >
                <span>{link.label}</span>
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  const { showToast } = useToast();
  const { install, isInstalled } = usePWAInstall();
  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);

  const infoLinks = useMemo(() => {
    return INFO_LINKS.filter((link) => !(link.action === "install" && isInstalled));
  }, [isInstalled]);

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
    <footer className="mt-auto relative z-10 w-full overflow-hidden border-t border-[#dedfd4] bg-[#faf8f3] pb-[calc(env(safe-area-inset-bottom)+6rem)] antialiased md:pb-12 md:pt-16 dark:border-[#354237] dark:bg-[#151c18]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Lưới chính - Desktop (Ẩn trên Mobile theo yêu cầu) */}
        <div className="hidden md:grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8">
          
          {/* Cột 1: Thương hiệu (Chiếm 4 cột trên lg) */}
          <div className="space-y-6 lg:col-span-4 lg:pr-8">
            <div className="flex items-center gap-3.5 select-none">
              <div className="relative flex h-12 w-12 shrink-0 items-center justify-center">
                <img
                  src="/images/logo_htdc.png"
                  alt="Ban Giáo Lý Giáo xứ An Ngãi"
                  className="h-full w-full object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,0.15)]"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-[18px] font-bold tracking-tight text-[#293d32] dark:text-[#ecece0] font-serif leading-tight">
                  Ban Giáo Lý
                </span>
                <p className="mt-0.5 text-[11px] font-bold uppercase tracking-widest text-[#7c5c2d] font-mono dark:text-[#d4b47d]">
                  HTDC · Xứ đoàn Mẹ Mân Côi
                </p>
              </div>
            </div>

            <p className="text-[13.5px] font-normal leading-relaxed text-[#575e55] dark:text-[#b0b9ac]">
              Nền tảng học hỏi và kết nối đức tin cho cộng đoàn. Đồng hành cùng giáo lý viên, phụ huynh và thiếu nhi giáo xứ.
            </p>

            <div className="flex items-center gap-3">
              <a
                href="https://www.facebook.com/profile.php?id=61558564791118"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#575e55] shadow-sm border border-[#dedfd4] transition-all hover:scale-105 hover:-translate-y-0.5 hover:text-[#1877F2] hover:border-[#1877F2] active:scale-95 dark:bg-[#1e2821] dark:border-[#354237] dark:text-[#b0b9ac] dark:hover:text-[#60a5fa]"
                aria-label="Facebook Giáo xứ An Ngãi"
                title="Facebook Giáo xứ An Ngãi"
              >
                <FacebookIcon />
              </a>
              <a
                href="mailto:htdcanngai@gmail.com"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#575e55] shadow-sm border border-[#dedfd4] transition-all hover:scale-105 hover:-translate-y-0.5 hover:text-[#314e3e] hover:border-[#314e3e] active:scale-95 dark:bg-[#1e2821] dark:border-[#354237] dark:text-[#b0b9ac] dark:hover:text-[#d4b47d]"
                aria-label="Gửi email cho Ban Giáo Lý: htdcanngai@gmail.com"
                title="Email: htdcanngai@gmail.com"
              >
                <MailIcon />
              </a>
            </div>
          </div>

          {/* Cột 2 & 3: Liên kết (Chiếm 4 cột trên lg) */}
          <div className="grid grid-cols-2 gap-8 lg:col-span-4">
            <LinkGroup title="Các Khối Học" links={CATECHISM_BLOCKS} />
            <LinkGroup
              title="Thông tin"
              links={infoLinks}
              onAction={(action) => {
                if (action === "install") install();
              }}
            />
          </div>

          {/* Cột 4: Đăng ký nhận tin (Chiếm 4 cột trên lg) */}
          <div className="space-y-4 lg:col-span-4 lg:pl-4">
            <div className="space-y-1.5">
              <h4 className="text-[12px] font-bold uppercase tracking-widest text-[#7c5c2d] dark:text-[#d4b47d]">
                Nhận tin tức
              </h4>
              <p className="text-[13px] font-normal leading-relaxed text-[#575e55] dark:text-[#b0b9ac]">
                Đăng ký để nhận các thông báo quan trọng và tài liệu mới nhất qua Email.
              </p>
            </div>
            
            <form onSubmit={handleSubscribe} className="relative flex flex-col gap-3">
              <label htmlFor="footer-newsletter-email" className="sr-only">
                Địa chỉ email nhận thông báo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#575e55] dark:text-[#b0b9ac] pointer-events-none">
                  <MailIcon />
                </div>
                <input
                  id="footer-newsletter-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={subscribing}
                  placeholder="Nhập địa chỉ email..."
                  className="w-full rounded-2xl border border-[#dedfd4] bg-white py-3.5 pl-10 pr-4 text-[14px] font-medium text-[#293d32] placeholder-[#6b7280] shadow-sm transition-all focus:border-[#314e3e] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#314e3e]/10 disabled:opacity-60 dark:border-[#354237] dark:bg-[#1e2821] dark:text-[#ecece0] dark:placeholder-[#9ca3af] dark:focus:border-[#d4b47d] dark:focus:bg-[#1e2821]"
                />
              </div>
              <button
                type="submit"
                disabled={subscribing}
                className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-[#314e3e] hover:bg-[#273e32] text-white dark:bg-[#d4b47d] dark:hover:bg-[#dfc394] dark:text-[#151c18] py-3.5 text-[14px] font-bold shadow-sm hover:shadow-md hover:shadow-[#314e3e]/20 dark:hover:shadow-[#d4b47d]/15 hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm motion-reduce:transform-none transition-all duration-200 ease-out disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-sm cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#314e3e] dark:focus-visible:ring-[#d4b47d] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#1e2821]"
              >
                {subscribing ? (
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                ) : (
                  <>
                    <span>Đăng ký ngay</span>
                    <ArrowRight className="h-4 w-4 transition-transform duration-200 ease-out group-hover:translate-x-1 motion-reduce:transform-none" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Bản quyền - Hiển thị cả Mobile & Desktop */}
        <div className="md:mt-16 mb-[env(safe-area-inset-bottom)] md:mb-0 flex flex-col items-center justify-center gap-4 border-t border-[#dedfd4] pt-6 md:pt-8 text-center md:flex-row md:justify-between dark:border-[#354237]">
          
          <div className="flex flex-col items-center gap-1 md:items-start">
            <p className="text-[11px] font-bold tracking-widest uppercase text-[#7c5c2d] dark:text-[#d4b47d]">
              HTDC Xứ đoàn Mẹ Mân Côi
            </p>
            <p className="text-[12.5px] font-medium text-[#575e55] dark:text-[#b0b9ac]">
              © {year} Giáo xứ An Ngãi. All rights reserved.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-[12.5px] font-semibold text-[#575e55] select-none md:justify-end dark:text-[#b0b9ac]">
            <Link to="/quy-định" className="transition-colors hover:text-[#293d32] dark:hover:text-[#ecece0]">
              Quy định sử dụng
            </Link>
            <Link to="/bảo-mật" className="transition-colors hover:text-[#293d32] dark:hover:text-[#ecece0]">
              Chính sách bảo mật
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}