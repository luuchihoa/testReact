import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy } from "lucide-react";
import { useToast } from "../../../components/ui/ToastContext.jsx";
import { transferDateForView } from "../../../components/ui/StudentShared.jsx";
import ProfileTab from "./ProfileTab.jsx";
import AcademicTab from "./AcademicTab.jsx";

const APPLE_EASE = [0.16, 1, 0.3, 1];
const SLIDE_VARIANTS = {
  initial: (direction) => ({ x: direction > 0 ? 30 : -30, opacity: 0 }),
  animate: { x: 0, opacity: 1 },
  exit: (direction) => ({ x: direction < 0 ? 30 : -30, opacity: 0 }),
};

function StudentEditPanel({ student, namHoc, lop, onClose, onSaved }) {
  const { showToast } = useToast();
  const [tab, setTab] = useState("profile"); // profile | academic
  const [[page, direction], setPage] = useState([0, 0]);

  const [hocKy, setHocKy] = useState("HK1");
  const [[hkPage, hkDirection], setHkPage] = useState([0, 0]);

  const TABS = ["profile", "academic"];
  const handleTabChange = (tId) => {
    if (tId === tab) return;
    const newIdx = TABS.indexOf(tId);
    const oldIdx = TABS.indexOf(tab);
    setTab(tId);
    setPage([newIdx, newIdx > oldIdx ? 1 : -1]);
  };

  const handleHocKyChange = (k) => {
    if (k === hocKy) return;
    const HK_LIST = ["HK1", "HK2"];
    const newIdx = HK_LIST.indexOf(k);
    const oldIdx = HK_LIST.indexOf(hocKy);
    setHocKy(k);
    setHkPage([newIdx, newIdx > oldIdx ? 1 : -1]);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(student.username);
    showToast("Đã sao chép Username/ID", "success");
  };

  return (
    <div className="sm:bg-white/80 sm:dark:bg-[#1C1917]/80 sm:backdrop-blur-xl sm:rounded-[28px] sm:border sm:border-amber-900/10 sm:dark:border-amber-100/10 sm:shadow-sm sm:overflow-hidden w-full min-w-0 flex flex-col">
      <div className="relative overflow-hidden px-4 py-5 sm:px-8 sm:py-10 rounded-[20px] sm:rounded-none border border-amber-900/5 sm:border-b sm:border-amber-900/10 dark:border-amber-100/5 sm:dark:border-amber-100/10 bg-gradient-to-br from-stone-100 to-amber-50 dark:from-stone-800 dark:to-stone-900 shadow-sm sm:shadow-none mb-4 sm:mb-0">
        {/* Nền trang trí */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-600/5 dark:bg-amber-400/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        

        {/* Desktop close button */}
        <button type="button" onClick={onClose} aria-label="Đóng"
          className="hidden sm:flex absolute top-6 right-6 z-20 w-10 h-10 rounded-full bg-white/50 dark:bg-stone-800/50 backdrop-blur border border-amber-900/10 dark:border-amber-100/10 hover:bg-white dark:hover:bg-stone-700 items-center justify-center transition-colors shadow-sm">
          <X className="w-5 h-5 text-stone-500" />
        </button>

        <div className="relative z-10 flex items-center gap-4 sm:gap-6 min-w-0 pr-0 sm:pr-12">
          <div className="relative">
            <motion.div animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0.8, 0.5] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }} className="absolute inset-0 bg-amber-400/30 dark:bg-amber-500/20 rounded-full blur-xl" />
            <motion.div whileHover={{ scale: 1.05 }} className="relative z-10 w-16 h-16 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 sm:border-4 border-white dark:border-stone-800 flex-shrink-0 bg-stone-100 shadow-xl">
              <img src={student.avatar || "/images/avatarDefault.avif"} alt="" className="w-full h-full object-cover" />
            </motion.div>
          </div>
          <div className="min-w-0 flex flex-col justify-center flex-1">
            <p className="text-[20px] sm:text-[32px] font-extrabold text-amber-950 dark:text-amber-50 font-serif leading-tight drop-shadow-sm">
              {student.hoTen || student.username}
            </p>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1 sm:mt-2">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-white/60 dark:bg-stone-800/60 backdrop-blur-sm border border-stone-200/50 dark:border-stone-700/50 text-[11px] sm:text-[12px] font-bold text-stone-600 dark:text-stone-300 whitespace-nowrap shadow-sm">
                Lớp {lop}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/60 dark:bg-stone-800/60 backdrop-blur-sm border border-stone-200/50 dark:border-stone-700/50 text-[11px] sm:text-[12px] font-bold text-stone-600 dark:text-stone-300 whitespace-nowrap shadow-sm">
                ID: {student.username}
                <button type="button" onClick={copyToClipboard} className="p-0.5 hover:bg-stone-200 dark:hover:bg-stone-700 rounded transition-colors" title="Copy ID">
                  <Copy className="w-3 h-3 text-stone-400 dark:text-stone-500" />
                </button>
              </span>
              {student.gioiTinh && (
                <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full bg-white/60 dark:bg-stone-800/60 backdrop-blur-sm border border-stone-200/50 dark:border-stone-700/50 text-[11px] sm:text-[12px] font-bold text-stone-600 dark:text-stone-300 whitespace-nowrap shadow-sm">
                  {student.gioiTinh === "Nam" ? "👨 Nam" : "👩 Nữ"}
                </span>
              )}
              {student.ngaySinh && (
                <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full bg-white/60 dark:bg-stone-800/60 backdrop-blur-sm border border-stone-200/50 dark:border-stone-700/50 text-[11px] sm:text-[12px] font-bold text-stone-600 dark:text-stone-300 whitespace-nowrap shadow-sm">
                  🎂 {transferDateForView(student.ngaySinh)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between sm:px-2 sm:pt-5 mb-4 sm:mb-6 gap-3 sm:gap-4">
        
        {/* Main Tabs (Hồ sơ - Điểm) */}
        <div className="relative flex gap-1 p-1 bg-stone-100 dark:bg-stone-800 rounded-[16px] shadow-inner border border-amber-900/10 dark:border-amber-100/10 w-full sm:w-fit shrink-0">
          {[
            { id: "profile", label: "Hồ sơ cá nhân", icon: "👤" },
            { id: "academic", label: "Điểm & Điểm danh", icon: "📊" }
          ].map((t) => (
            <button key={t.id} type="button" onClick={() => handleTabChange(t.id)}
              className={`relative flex w-1/2 sm:w-auto sm:flex-none items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-6 py-2 sm:py-2.5 rounded-xl text-[12px] sm:text-[14px] font-bold transition-colors duration-300 whitespace-nowrap z-10 ${
                tab === t.id 
                  ? "text-amber-950 dark:text-amber-50" 
                  : "text-stone-500 dark:text-stone-400 hover:text-amber-950 dark:hover:text-amber-50"
              }`}>
              {tab === t.id && (
                <motion.div
                  layoutId="active-main-tab"
                  className="absolute inset-0 bg-white dark:bg-stone-900 rounded-xl shadow-sm border border-amber-900/10 dark:border-amber-100/10"
                  initial={false}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-20 flex items-center gap-1.5"><span>{t.icon}</span> {t.label}</span>
            </button>
          ))}
        </div>

        {/* Semester Tabs (Học kỳ I - Học kỳ II) */}
        <AnimatePresence>
          {tab === "academic" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="relative flex gap-1 p-1 bg-stone-100 dark:bg-stone-800 rounded-[14px] shadow-inner border border-amber-900/10 dark:border-amber-100/10 w-full sm:w-fit shrink-0"
            >
              {["HK1", "HK2", "CN"].map((k) => (
                <button key={k} type="button" onClick={() => handleHocKyChange(k)}
                  className={`relative flex items-center justify-center w-1/3 sm:w-auto sm:flex-none px-2 sm:px-5 py-2 sm:py-2.5 rounded-xl text-[12px] sm:text-[14px] font-bold transition-colors duration-300 z-10 ${
                    hocKy === k 
                      ? "text-amber-950 dark:text-amber-50" 
                      : "text-stone-500 dark:text-stone-400 hover:text-amber-950 dark:hover:text-amber-50"
                  }`}>
                  {hocKy === k && (
                    <motion.div
                      layoutId="active-hk-tab"
                      className="absolute inset-0 bg-white dark:bg-stone-900 rounded-xl shadow-sm border border-amber-900/10 dark:border-amber-100/10"
                      initial={false}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-20">{k === "HK1" ? "Học kỳ I" : k === "HK2" ? "Học kỳ II" : "Cả năm"}</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="px-0 sm:px-2 pb-6">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={tab}
            custom={direction}
            variants={SLIDE_VARIANTS}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.35, ease: APPLE_EASE }}
          >
            {tab === "profile"  && <ProfileTab  student={student} onSaved={onSaved} showToast={showToast} />}
            {tab === "academic" && <AcademicTab student={student} namHoc={namHoc} lop={lop} showToast={showToast} hocKy={hocKy} hkDirection={hkDirection} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default StudentEditPanel;
