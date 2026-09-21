import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { usePageMotion } from "../hooks/usePageMotion.js";
import { usePWAInstall } from "../components/ui/PWAInstallContext.jsx";
import { supabase } from "../lib/supabase.js";
import { useToast } from "../components/ui/ToastContext.jsx";
import {
  Settings, Type, Moon, Sun, Bell, CalendarDays, Trophy,
  Smartphone, Download, RotateCcw, Info,
  ShieldCheck, FileText, ChevronRight, Quote, Check
} from "lucide-react";

const FONT_OPTIONS = [
  { key: "sm",   label: "Nhỏ",     desc: "14px" },
  { key: "base", label: "Chuẩn",   desc: "16px" },
  { key: "lg",   label: "Lớn",     desc: "18px" },
  { key: "xl",   label: "Rất lớn", desc: "20px" },
];

function SectionLabel({ children }) {
  return (
    <p className="text-xs font-bold uppercase tracking-wider text-[#7c5c2d] dark:text-[#d4b47d] px-1 mb-2 mt-6 first:mt-0 select-none">
      {children}
    </p>
  );
}

function SettingCard({ children }) {
  return (
    <div className="rounded-2xl border border-[#dedfd4] dark:border-[#354237] bg-[#fffefa] dark:bg-[#1e2821] divide-y divide-[#dedfd4]/60 dark:divide-[#354237]/60 shadow-xs overflow-hidden">
      {children}
    </div>
  );
}

function Toggle({ checked, onChange, label, disabled = false }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex items-center justify-center min-w-[48px] min-h-[44px] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#314e3e] dark:focus-visible:ring-[#d4b47d] rounded-full transition-opacity ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <span
        className={`w-[48px] h-[28px] rounded-full transition-colors duration-200 ease-in-out border border-[#dedfd4] dark:border-[#354237] ${
          checked 
            ? "bg-[#314e3e] dark:bg-[#d6b883]" 
            : "bg-[#e5e7eb] dark:bg-[#2a372e]"
        }`}
      >
        <span
          className={`block w-[22px] h-[22px] rounded-full bg-white dark:bg-[#151c18] shadow-xs transition-transform duration-200 ease-in-out mt-[2px] ml-[2px] ${
            checked ? "translate-x-[20px]" : "translate-x-0"
          }`}
        />
      </span>
    </button>
  );
}

function FontSegmented({ fontSize, setFontSize }) {
  return (
    <div 
      role="radiogroup" 
      aria-label="Chọn cỡ chữ hiển thị" 
      className="grid grid-cols-4 gap-1 p-1 bg-[#faf8f3] dark:bg-[#151c18] rounded-xl border border-[#dedfd4] dark:border-[#354237] w-full"
    >
      {FONT_OPTIONS.map((opt) => {
        const active = fontSize === opt.key;
        return (
          <button
            key={opt.key}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setFontSize(opt.key)}
            className={`min-h-[44px] px-2 py-1.5 rounded-lg flex flex-col items-center justify-center transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#314e3e] dark:focus-visible:ring-[#d4b47d] ${
              active
                ? "bg-[#314e3e] text-white dark:bg-[#d6b883] dark:text-[#19251d] shadow-xs"
                : "text-[#575e55] dark:text-[#b0b9ac] hover:text-[#293d32] dark:hover:text-[#ecece0] hover:bg-stone-500/5 dark:hover:bg-stone-400/5"
            }`}
          >
            <span className="text-xs sm:text-sm font-bold leading-tight">{opt.label}</span>
            <span className={`text-[0.7rem] sm:text-xs font-medium leading-none mt-0.5 ${active ? "text-white/80 dark:text-[#19251d]/80" : "text-[#575e55]/80 dark:text-[#b0b9ac]/80"}`}>
              {opt.desc}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function FontLivePreview({ fontSize }) {
  const currentOption = FONT_OPTIONS.find((o) => o.key === fontSize) || FONT_OPTIONS[1];
  return (
    <div className="p-3.5 bg-[#faf8f3] dark:bg-[#151c18] rounded-xl border border-[#dedfd4] dark:border-[#354237] space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-[#7c5c2d] dark:text-[#d4b47d] flex items-center gap-1.5">
          <Quote className="w-3 h-3 shrink-0" />
          Xem trước văn bản
        </span>
        <span className="text-xs font-bold text-[#575e55] dark:text-[#b0b9ac]">
          {currentOption.label} ({currentOption.desc})
        </span>
      </div>
      <p className="text-sm sm:text-base text-[#293d32] dark:text-[#ecece0] font-medium leading-relaxed italic transition-all duration-200">
        “Lời Chúa là ngọn đèn soi cho con bước, là ánh sáng chỉ đường con đi.”
      </p>
      <p className="text-xs text-[#575e55] dark:text-[#b0b9ac] font-medium text-right">
        — Thánh Vịnh 119:105
      </p>
    </div>
  );
}

function SettingItem({ icon, label, sub, right, children }) {
  return (
    <div className="p-3.5 sm:p-4 transition-colors">
      <div className="flex items-center justify-between gap-3 min-h-[36px]">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {icon && (
            <div className="w-8 h-8 rounded-lg bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237] flex items-center justify-center text-[#314e3e] dark:text-[#d4b47d] shrink-0 shadow-2xs">
              {icon}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm sm:text-base font-bold text-[#293d32] dark:text-[#ecece0] leading-snug">
              {label}
            </p>
            {sub && (
              <p className="text-xs sm:text-sm font-medium text-[#575e55] dark:text-[#b0b9ac] mt-0.5 leading-snug">
                {sub}
              </p>
            )}
          </div>
        </div>
        {right && (
          <div className="shrink-0 flex items-center gap-2">
            {right}
          </div>
        )}
      </div>
      {children && (
        <div className="mt-3">
          {children}
        </div>
      )}
    </div>
  );
}

function SettingLinkItem({ icon, label, sub, to }) {
  return (
    <Link
      to={to}
      className="flex items-center justify-between gap-3 p-3.5 sm:p-4 min-h-[48px] hover:bg-stone-500/5 dark:hover:bg-stone-400/5 active:bg-stone-500/10 dark:active:bg-stone-400/10 transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#314e3e] dark:focus-visible:ring-[#d4b47d]"
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {icon && (
          <div className="w-8 h-8 rounded-lg bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237] flex items-center justify-center text-[#314e3e] dark:text-[#d4b47d] shrink-0 shadow-2xs group-hover:border-[#314e3e]/40 dark:group-hover:border-[#d4b47d]/40 transition-colors">
            {icon}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm sm:text-base font-bold text-[#293d32] dark:text-[#ecece0] leading-snug group-hover:text-[#314e3e] dark:group-hover:text-[#d4b47d] transition-colors">
            {label}
          </p>
          {sub && (
            <p className="text-xs sm:text-sm font-medium text-[#575e55] dark:text-[#b0b9ac] mt-0.5 leading-snug">
              {sub}
            </p>
          )}
        </div>
      </div>
      <div className="shrink-0 flex items-center text-[#575e55] dark:text-[#b0b9ac] group-hover:text-[#314e3e] dark:group-hover:text-[#d4b47d] transition-colors pr-1">
        <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
      </div>
    </Link>
  );
}

export default function Setting({ fontSize, setFontSize }) {
  const { heroReveal } = usePageMotion();
  const { showToast } = useToast();
  const { install, isInstalled } = usePWAInstall();
  
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === "undefined") return false;
    const saved = localStorage.getItem("theme");
    return saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches);
  });
  const [notifSystem, setNotifSystem] = useState(true);
  const [notifSchedule, setNotifSchedule] = useState(true);
  const [notifScore, setNotifScore] = useState(true);
  const [username, setUsername] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const isDark = saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", isDark);

    const loadPreferences = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        const { data: userRow } = await supabase.from("users").select("username, notif_system, notif_schedule, notif_score").eq("auth_id", session.user.id).single();
        if (userRow) {
          setUsername(userRow.username);
          setNotifSystem(userRow.notif_system ?? true);
          setNotifSchedule(userRow.notif_schedule ?? true);
          setNotifScore(userRow.notif_score ?? true);
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadPreferences();
  }, []);

  const handleDarkMode = (val) => { 
    setDarkMode(val); 
    localStorage.setItem("theme", val ? "dark" : "light"); 
    document.documentElement.classList.toggle("dark", val); 
  };

  const updatePreference = async (field, val, setter) => {
    setter(val);
    if (!username) {
      showToast("Vui lòng đăng nhập để lưu cài đặt này vào tài khoản", "info");
      return;
    }
    try {
      const { error } = await supabase.from("users").update({ [field]: val }).eq("username", username);
      if (error) throw error;
      showToast("Đã lưu cài đặt thông báo", "success");
    } catch (err) {
      console.error(err);
      showToast("Lỗi khi lưu cài đặt", "error");
    }
  };

  const handleNotifSystem = (val) => updatePreference("notif_system", val, setNotifSystem);
  const handleNotifSchedule = (val) => updatePreference("notif_schedule", val, setNotifSchedule);
  const handleNotifScore = (val) => updatePreference("notif_score", val, setNotifScore);

  const handleClearCache = () => {
    try {
      const preserveKeys = new Set(["theme", "fontSize", "sb-access-token", "sb-refresh-token"]);
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && !preserveKeys.has(k) && !k.startsWith("sb-")) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
      showToast("Đã làm mới bộ nhớ đệm thành công", "success");
    } catch {
      showToast("Không thể làm mới bộ nhớ", "error");
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8f3] dark:bg-[#151c18] text-[#293d32] dark:text-[#ecece0] antialiased transition-colors duration-300">
      <Motion.div 
        variants={heroReveal} 
        initial="hidden" 
        animate="visible" 
        custom={0} 
        className="mx-auto max-w-xl px-4 pt-6 pb-20 sm:pt-8 sm:pb-24"
      >
        {/* Header */}
        <div className="mb-6 px-1 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#314e3e]/10 dark:bg-[#d4b47d]/15 text-[#314e3e] dark:text-[#d4b47d] border border-[#dedfd4] dark:border-[#354237] flex items-center justify-center shrink-0 shadow-2xs">
            <Settings className="w-5 h-5" strokeWidth={2.2} />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight text-[#293d32] dark:text-[#ecece0] font-serif leading-tight">
              Cài đặt
            </h1>
            <p className="text-xs sm:text-sm text-[#575e55] dark:text-[#b0b9ac] font-medium leading-tight mt-0.5">
              Thiết lập hệ thống & giao diện học tập
            </p>
          </div>
        </div>

        {/* Nhóm Giao diện */}
        <SectionLabel>Giao diện & Trải nghiệm</SectionLabel>
        <SettingCard>
          <SettingItem
            icon={<Type className="w-4 h-4" />}
            label="Cỡ chữ hiển thị"
            sub="Điều chỉnh cỡ chữ phù hợp với mắt đọc"
          >
            <div className="space-y-2.5">
              <FontSegmented fontSize={fontSize} setFontSize={setFontSize} />
              <FontLivePreview fontSize={fontSize} />
            </div>
          </SettingItem>

          <SettingItem
            icon={darkMode ? <Moon className="w-4 h-4 text-indigo-500 dark:text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
            label="Giao diện tối (Dark mode)"
            sub={darkMode ? "Đang bật chế độ tối bảo vệ mắt" : "Đang dùng chế độ sáng"}
            right={<Toggle checked={darkMode} onChange={handleDarkMode} label="Bật hoặc tắt chế độ tối" />}
          />
        </SettingCard>

        {/* Nhóm Thông báo */}
        <SectionLabel>Thông báo & Nhắc nhở</SectionLabel>
        <SettingCard>
          <SettingItem
            icon={<Bell className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />}
            label="Thông báo hệ thống"
            sub="Lịch học, thông báo chung từ ban giáo lý"
            right={<Toggle checked={notifSystem} onChange={handleNotifSystem} label="Bật hoặc tắt thông báo hệ thống" />}
          />
          <AnimatePresence initial={false}>
            {notifSystem && (
              <Motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: "auto" }} 
                exit={{ opacity: 0, height: 0 }} 
                transition={{ duration: 0.2, ease: "easeInOut" }} 
                className="overflow-hidden divide-y divide-[#dedfd4]/60 dark:divide-[#354237]/60"
              >
                <SettingItem
                  icon={<CalendarDays className="w-4 h-4 text-blue-700 dark:text-blue-400" />}
                  label="Nhắc lịch sinh hoạt"
                  sub="Thông báo trước giờ tập trung Chúa Nhật"
                  right={<Toggle checked={notifSchedule} onChange={handleNotifSchedule} label="Bật hoặc tắt nhắc lịch sinh hoạt" />}
                />
                <SettingItem
                  icon={<Trophy className="w-4 h-4 text-amber-700 dark:text-amber-400" />}
                  label="Thông báo học tập"
                  sub="Cập nhật khi có kết quả bài kiểm tra hoặc điểm mới"
                  right={<Toggle checked={notifScore} onChange={handleNotifScore} label="Bật hoặc tắt thông báo kết quả học tập" />}
                />
              </Motion.div>
            )}
          </AnimatePresence>
        </SettingCard>

        {/* Nhóm Ứng dụng & Dữ liệu */}
        <SectionLabel>Ứng dụng & Bộ nhớ</SectionLabel>
        <SettingCard>
          <SettingItem
            icon={<Smartphone className="w-4 h-4 text-[#314e3e] dark:text-[#d4b47d]" />}
            label="Ứng dụng PWA"
            sub={isInstalled ? "Đã cài đặt trên màn hình chính của thiết bị" : "Cài đặt ứng dụng để mở nhanh và dùng ngoại tuyến"}
            right={
              isInstalled ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-[#064e3b] dark:text-[#6ee7b7] bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-600/30 px-2.5 py-1 rounded-full">
                  <Check className="w-3 h-3" />
                  Đã cài đặt
                </span>
              ) : (
                <button
                  type="button"
                  onClick={install}
                  className="min-h-[44px] px-3.5 py-1.5 inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-white dark:text-[#19251d] bg-[#314e3e] dark:bg-[#d6b883] hover:opacity-90 active:scale-95 rounded-xl shadow-xs transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#314e3e] dark:focus-visible:ring-[#d4b47d]"
                >
                  <Download className="w-3.5 h-3.5" strokeWidth={2.5} />
                  <span>Cài đặt PWA</span>
                </button>
              )
            }
          />

          <SettingItem
            icon={<RotateCcw className="w-4 h-4 text-[#575e55] dark:text-[#b0b9ac]" />}
            label="Làm mới bộ nhớ đệm"
            sub="Xóa dữ liệu tạm giúp tải trang mới nhất"
            right={
              <button
                type="button"
                onClick={handleClearCache}
                className="min-h-[44px] px-3 py-1.5 inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-[#293d32] dark:text-[#ecece0] bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237] hover:bg-stone-500/5 dark:hover:bg-stone-400/5 active:scale-95 rounded-xl transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#314e3e] dark:focus-visible:ring-[#d4b47d]"
              >
                <span>Xóa cache</span>
              </button>
            }
          />
        </SettingCard>

        {/* Nhóm Thông tin & Điều khoản */}
        <SectionLabel>Thông tin & Pháp lý</SectionLabel>
        <SettingCard>
          <SettingItem
            icon={<Info className="w-4 h-4 text-[#575e55] dark:text-[#b0b9ac]" />}
            label="Phiên bản phần mềm"
            sub="Ban Giáo lý Giáo xứ An Ngãi"
            right={
              <span className="text-xs font-bold text-[#575e55] dark:text-[#b0b9ac] bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237] px-2.5 py-1 rounded-lg">
                1.0.0 (Build 2026)
              </span>
            }
          />
          <SettingLinkItem
            icon={<ShieldCheck className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />}
            label="Bảo mật & Quyền riêng tư"
            sub="Chính sách bảo vệ thông tin thiếu nhi & phụ huynh"
            to="/bảo-mật"
          />
          <SettingLinkItem
            icon={<FileText className="w-4 h-4 text-blue-700 dark:text-blue-400" />}
            label="Quy định sử dụng"
            sub="Nội quy & hướng dẫn sử dụng cổng thông tin"
            to="/quy-định"
          />
        </SettingCard>
      </Motion.div>
    </div>
  );
}