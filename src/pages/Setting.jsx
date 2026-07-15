import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Type, Moon, Sun, Bell, CalendarDays, Trophy,
  ShieldCheck, FileText, Info, ChevronRight, Settings as SettingsIcon
} from "lucide-react";

const FONT_OPTIONS = [
  { key: "sm",   label: "Nhỏ",        px: "13px" },
  { key: "base", label: "Trung bình", px: "15px" },
  { key: "lg",   label: "Lớn",        px: "17px" },
  { key: "xl",   label: "Lớn hơn",   px: "19px" },
];

function SectionLabel({ children }) {
  return (
    <p className="text-[12px] font-bold uppercase tracking-wider text-amber-800/70 dark:text-amber-400/70 px-4 mb-2 mt-7 first:mt-0 select-none">
      {children}
    </p>
  );
}

function SettingCard({ children }) {
  return (
    <div className="rounded-2xl overflow-hidden border border-amber-900/10 dark:border-amber-100/10 bg-white/60 dark:bg-stone-900/40 backdrop-blur-sm divide-y divide-amber-900/5 dark:divide-amber-100/5 shadow-sm">
      {children}
    </div>
  );
}

function Row({ icon, iconBg, iconColor, label, sub, right, onClick }) {
  return (
    <motion.div
      whileTap={onClick ? { backgroundColor: "var(--row-active)" } : undefined}
      onClick={onClick}
      className={`flex items-center gap-3.5 px-4 py-3.5 transition-colors duration-150 select-none relative
        [--row-active:rgba(146,64,14,0.05)] dark:[--row-active:rgba(253,230,138,0.05)]
        ${onClick ? "cursor-pointer active:bg-[on-state]" : ""}`}
    >
      <div
        className="w-[30px] h-[30px] rounded-[7px] flex items-center justify-center flex-shrink-0 transition-colors shadow-sm"
        style={{ backgroundColor: iconBg }}
      >
        {React.cloneElement(icon, { size: 17, strokeWidth: 2.2, color: iconColor })}
      </div>
      
      <div className="flex-1 min-w-0 pr-1">
        <p className="text-[15px] text-amber-950 dark:text-amber-50 font-semibold tracking-tight leading-tight">
          {label}
        </p>
        {sub && (
          <p className="text-[12px] text-stone-500 dark:text-stone-400 mt-0.5 leading-tight font-medium truncate">
            {sub}
          </p>
        )}
      </div>
      
      <div className="flex-shrink-0 flex items-center gap-2">
        {right}
      </div>
    </motion.div>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative w-[51px] h-[31px] rounded-full transition-colors duration-200 ease-in-out focus:outline-none border border-black/5 dark:border-white/5 ${
        checked ? "bg-amber-600 dark:bg-amber-500" : "bg-stone-200 dark:bg-stone-700"
      }`}
    >
      <span
        className={`absolute top-[1.5px] left-[2px] w-[26px] h-[26px] rounded-full bg-white shadow-md transition-transform duration-200 ease-in-out ${
          checked ? "translate-x-[20px]" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function FontPills({ fontSize, setFontSize }) {
  return (
    <div className="flex bg-stone-100/80 dark:bg-stone-800 p-0.5 rounded-lg select-none border border-black/5 dark:border-white/5">
      {FONT_OPTIONS.map((opt) => {
        const active = fontSize === opt.key;
        return (
          <button
            key={opt.key}
            type="button"
            onClick={() => setFontSize(opt.key)}
            className={`px-2.5 py-1.5 rounded-md text-[13px] font-bold transition-all ${
              active
                ? "bg-white dark:bg-stone-600 text-amber-900 dark:text-white shadow-sm"
                : "text-stone-500 dark:text-stone-400 hover:text-amber-700 dark:hover:text-amber-300"
            }`}
            aria-label={opt.label}
          >
            A
          </button>
        );
      })}
    </div>
  );
}

export default function Setting({ fontSize, setFontSize }) {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [notifSystem, setNotifSystem] = useState(true);
  const [notifSchedule, setNotifSchedule] = useState(true);
  const [notifScore, setNotifScore] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const isDark = saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setDarkMode(isDark);
    document.documentElement.classList.toggle("dark", isDark);

    setNotifSystem(localStorage.getItem("notif") !== "false");
    setNotifSchedule(localStorage.getItem("notifSchedule") !== "false");
    setNotifScore(localStorage.getItem("notifScore") === "true");
  }, []);

  const handleDarkMode = (val) => { setDarkMode(val); localStorage.setItem("theme", val ? "dark" : "light"); document.documentElement.classList.toggle("dark", val); };
  const handleNotifSystem = (val) => { setNotifSystem(val); localStorage.setItem("notif", val); };
  const handleNotifSchedule = (val) => { setNotifSchedule(val); localStorage.setItem("notifSchedule", val); };
  const handleNotifScore = (val) => { setNotifScore(val); localStorage.setItem("notifScore", val); };

  const currentLabel = FONT_OPTIONS.find((o) => o.key === fontSize)?.label ?? "Trung bình";

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#1C1917] text-stone-800 dark:text-stone-200 antialiased transition-colors duration-300">
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 300, damping: 28 }} className="mx-auto max-w-md px-4 pt-8 pb-16 relative z-10">
        
        <div className="mb-6 px-1 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-900 dark:bg-amber-100 text-amber-50 dark:text-amber-950 flex items-center justify-center shadow-sm">
            <SettingsIcon size={20} strokeWidth={2.2} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-amber-950 dark:text-amber-50 font-serif">
              Cài đặt
            </h1>
            <p className="text-[13px] text-stone-500 dark:text-stone-400 font-medium">
              Thiết lập hệ thống & giao diện học tập
            </p>
          </div>
        </div>

        <SectionLabel>Giao diện</SectionLabel>
        <SettingCard>
          <Row icon={<Type />} iconBg="#B45309" iconColor="#FFFFFF" label="Cỡ chữ" sub={`Đang chọn: ${currentLabel}`} right={<FontPills fontSize={fontSize} setFontSize={setFontSize} />} />
          <Row icon={darkMode ? <Moon /> : <Sun />} iconBg={darkMode ? "#4F46E5" : "#D97706"} iconColor="#FFFFFF" label="Chế độ tối" sub={darkMode ? "Đang bật" : "Đang tắt"} right={<Toggle checked={darkMode} onChange={handleDarkMode} />} />
        </SettingCard>

        <SectionLabel>Thông báo</SectionLabel>
        <SettingCard>
          <Row icon={<Bell />} iconBg="#059669" iconColor="#FFFFFF" label="Thông báo hệ thống" sub="Lịch học, thông báo chung, tin tức" right={<Toggle checked={notifSystem} onChange={handleNotifSystem} />} />
          <AnimatePresence initial={false}>
            {notifSystem && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2, ease: "easeInOut" }} className="overflow-hidden divide-y divide-amber-900/5 dark:divide-amber-100/5">
                <Row icon={<CalendarDays />} iconBg="#2563EB" iconColor="#FFFFFF" label="Nhắc lịch sinh hoạt" sub="Thông báo trước giờ tập trung 1 tiếng" right={<Toggle checked={notifSchedule} onChange={handleNotifSchedule} />} />
                <Row icon={<Trophy />} iconBg="#DC2626" iconColor="#FFFFFF" label="Thông báo học tập" sub="Cập nhật khi có kết quả làm bài mới" right={<Toggle checked={notifScore} onChange={handleNotifScore} />} />
              </motion.div>
            )}
          </AnimatePresence>
        </SettingCard>

        <SectionLabel>Ứng dụng</SectionLabel>
        <SettingCard>
          <Row icon={<Info />} iconBg="#78716C" iconColor="#FFFFFF" label="Phiên bản phần mềm" right={<span className="text-[13px] font-medium text-stone-400 dark:text-stone-500 pr-2">1.0.0 (Build 2026)</span>} />
          <Row icon={<ShieldCheck />} iconBg="#10B981" iconColor="#FFFFFF" label="Bảo mật & quyền riêng tư" onClick={() => navigate("/bảo-mật")} right={<ChevronRight size={16} strokeWidth={2.5} className="text-stone-400 dark:text-stone-500" />} />
          <Row icon={<FileText />} iconBg="#3B82F6" iconColor="#FFFFFF" label="Quy định sử dụng" onClick={() => navigate("/quy-định")} right={<ChevronRight size={16} strokeWidth={2.5} className="text-stone-400 dark:text-stone-500" />} />
        </SettingCard>

        <p className="text-center text-[11px] font-bold text-amber-900/40 dark:text-amber-100/40 mt-12 tracking-widest uppercase">
          BAN GIÁO LÝ · HTDC XỨ ĐOÀN MẸ MÂN CÔI
        </p>
      </motion.div>
    </div>
  );
}