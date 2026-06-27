import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Type, Moon, Sun, Bell, CalendarDays, Trophy,
  ShieldCheck, FileText, Info, ChevronRight,
} from "lucide-react";

const FONT_OPTIONS = [
  { key: "sm",   label: "Nhỏ",        px: "14px" },
  { key: "base", label: "Trung bình", px: "16px" },
  { key: "lg",   label: "Lớn",        px: "18px" },
  { key: "xl",   label: "Lớn hơn",   px: "20px" },
];

function SectionLabel({ children }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-400 dark:text-stone-500 px-1 mb-2 mt-6 first:mt-0">
      {children}
    </p>
  );
}

function SettingCard({ children }) {
  return (
    <div className="rounded-2xl overflow-hidden border border-stone-200/60 dark:border-stone-700/60 bg-white dark:bg-stone-800 divide-y divide-stone-100 dark:divide-stone-700">
      {children}
    </div>
  );
}

function Row({ icon, iconBg, iconBgDark, iconColor, label, sub, right, onClick }) {
  return (
    <motion.div
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
      className={`flex items-center gap-3.5 px-4 py-3.5 ${onClick ? "cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-700/50 active:bg-stone-100 dark:active:bg-stone-700" : ""}`}
    >
      <div
        className="w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0 transition-colors"
        style={{ background: iconBg }}
      >
        {React.cloneElement(icon, { size: 18, strokeWidth: 1.75, color: iconColor })}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[15px] text-stone-800 dark:text-stone-100 font-medium leading-tight">{label}</p>
        {sub && <p className="text-[12px] text-stone-400 dark:text-stone-500 mt-0.5 leading-tight">{sub}</p>}
      </div>
      <div className="flex-shrink-0 flex items-center gap-2">{right}</div>
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
      className={`relative w-[44px] h-[26px] rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 ${
        checked ? "bg-[#34C759]" : "bg-stone-200 dark:bg-stone-600"
      }`}
    >
      <span
        className={`absolute top-[3px] left-[3px] w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
          checked ? "translate-x-[18px]" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function FontPills({ fontSize, setFontSize }) {
  return (
    <div className="flex gap-1.5">
      {FONT_OPTIONS.map((opt) => {
        const active = fontSize === opt.key;
        return (
          <button
            key={opt.key}
            type="button"
            onClick={() => setFontSize(opt.key)}
            className={`w-9 h-9 rounded-xl flex items-center justify-center font-semibold transition-all duration-150 ${
              active
                ? "bg-[#FF6B35] text-white shadow-sm"
                : "bg-stone-100 dark:bg-stone-700 text-stone-500 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-600"
            }`}
            style={{ fontSize: opt.px }}
            aria-label={opt.label}
            title={opt.label}
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
    const isDark = saved === "dark" ||
      (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setDarkMode(isDark);
    setNotifSystem(localStorage.getItem("notif") !== "false");
    setNotifSchedule(localStorage.getItem("notifSchedule") !== "false");
    setNotifScore(localStorage.getItem("notifScore") === "true");
  }, []);

  const handleDarkMode = (val) => {
    setDarkMode(val);
    localStorage.setItem("theme", val ? "dark" : "light");
    document.documentElement.classList.toggle("dark", val);
  };

  const handleNotifSystem = (val) => { setNotifSystem(val); localStorage.setItem("notif", val); };
  const handleNotifSchedule = (val) => { setNotifSchedule(val); localStorage.setItem("notifSchedule", val); };
  const handleNotifScore = (val) => { setNotifScore(val); localStorage.setItem("notifScore", val); };

  const currentLabel = FONT_OPTIONS.find((o) => o.key === fontSize)?.label ?? "Trung bình";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 26 }}
      className="mx-auto max-w-xl px-4 py-10 antialiased"
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-50 uppercase font-serif">
          Cài đặt
        </h1>
        <p className="text-sm text-stone-400 dark:text-stone-500 mt-1">
          Tùy chỉnh giao diện và thông báo theo ý bạn.
        </p>
      </div>

      {/* Giao diện */}
      <SectionLabel>Giao diện</SectionLabel>
      <SettingCard>
        <Row
          icon={<Type />}
          iconBg="#FFF0E8"
          iconColor="#FF6B35"
          label="Cỡ chữ"
          sub={currentLabel}
          right={<FontPills fontSize={fontSize} setFontSize={setFontSize} />}
        />
        <Row
          icon={darkMode ? <Moon /> : <Sun />}
          iconBg={darkMode ? "#2c2c2e" : "#FFF8E1"}
          iconColor={darkMode ? "#FF9500" : "#FF9500"}
          label="Chế độ tối"
          sub={darkMode ? "Đang bật" : "Đang tắt"}
          right={<Toggle checked={darkMode} onChange={handleDarkMode} />}
        />
      </SettingCard>

      {/* Thông báo */}
      <SectionLabel>Thông báo</SectionLabel>
      <SettingCard>
        <Row
          icon={<Bell />}
          iconBg="#E8F5E9"
          iconColor="#34C759"
          label="Thông báo hệ thống"
          sub="Lịch học, kết quả, tin tức mới"
          right={<Toggle checked={notifSystem} onChange={handleNotifSystem} />}
        />
        <div className={`transition-opacity duration-200 ${notifSystem ? "opacity-100" : "opacity-40 pointer-events-none"}`}>
          <Row
            icon={<CalendarDays />}
            iconBg="#E3F2FD"
            iconColor="#007AFF"
            label="Nhắc lịch sinh hoạt"
            sub="Trước buổi học 1 giờ"
            right={<Toggle checked={notifSchedule} onChange={handleNotifSchedule} />}
          />
          <Row
            icon={<Trophy />}
            iconBg="#FFF8E1"
            iconColor="#FF9500"
            label="Thông báo kết quả học"
            sub="Khi có điểm hoặc xếp hạng mới"
            right={<Toggle checked={notifScore} onChange={handleNotifScore} />}
          />
        </div>
      </SettingCard>

      {/* Ứng dụng */}
      <SectionLabel>Ứng dụng</SectionLabel>
      <SettingCard>
        <Row
          icon={<Info />}
          iconBg="#F3E5F5"
          iconColor="#AF52DE"
          label="Phiên bản"
          right={
            <span className="text-[12px] font-semibold px-2.5 py-1 rounded-full bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400">
              1.0.0
            </span>
          }
        />
        <Row
          icon={<ShieldCheck />}
          iconBg="#E8F5E9"
          iconColor="#34C759"
          label="Bảo mật & quyền riêng tư"
          onClick={() => navigate("/bảo-mật")}
          right={<ChevronRight size={16} strokeWidth={2} className="text-stone-300 dark:text-stone-600" />}
        />
        <Row
          icon={<FileText />}
          iconBg="#E3F2FD"
          iconColor="#007AFF"
          label="Quy định sử dụng"
          onClick={() => navigate("/quy-định")}
          right={<ChevronRight size={16} strokeWidth={2} className="text-stone-300 dark:text-stone-600" />}
        />
      </SettingCard>

      <p className="text-center text-[11px] text-stone-300 dark:text-stone-600 mt-10">
        Ban Giáo Lý · HTDC Xứ Đoàn Mẹ Mân Côi
      </p>
    </motion.div>
  );
}