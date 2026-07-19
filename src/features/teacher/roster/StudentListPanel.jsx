import React from "react";
import { Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Spinner } from "../../../components/ui/Skeleton.jsx";

function StudentListPanel({ students, loading, search, setSearch, selectedUsername, onSelect }) {
  return (
    <div className="bg-white/80 dark:bg-[#1C1917]/80 backdrop-blur-xl rounded-[28px] border border-amber-900/10 dark:border-amber-100/10 shadow-sm overflow-hidden flex flex-col max-h-[75vh] lg:max-h-[calc(100vh-180px)] min-h-0">
      <div className="p-5 border-b border-amber-900/10 dark:border-amber-100/10">
        <div className="mb-4">
          <h2 className="text-xl font-extrabold text-amber-950 dark:text-amber-50 font-serif">Danh sách lớp</h2>
          <p className="text-[13px] text-stone-500 dark:text-stone-400 font-medium mt-0.5">{students?.length || 0} học sinh</p>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 dark:text-stone-500 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm tên hoặc username…"
            className="w-full rounded-2xl border border-amber-900/10 dark:border-amber-100/10 bg-stone-50/50 dark:bg-stone-900/50 pl-11 pr-4 py-2.5 text-[14px] font-medium text-stone-800 dark:text-stone-200 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-600/30 dark:focus:ring-amber-500/30 transition-shadow shadow-inner"
          />
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto relative" data-lenis-prevent>
        {loading && (
          <div className="flex items-center justify-center gap-3 py-16 text-amber-800 dark:text-amber-500 text-[14px] font-medium">
            <Spinner className="h-5 w-5" /> Đang tải danh sách…
          </div>
        )}

        {!loading && students.length === 0 && (
          <p className="text-center text-[14px] text-stone-500 dark:text-stone-400 py-16 px-4">Không tìm thấy học sinh nào.</p>
        )}

        <div className="p-2 space-y-1">
          {!loading && students?.map((s, idx) => {
            const active = s.username === selectedUsername;
            return (
              <motion.button 
                key={s.username} 
                type="button" 
                onClick={() => onSelect(s.username)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.03, ease: [0.16, 1, 0.3, 1] }}
                className={`relative flex w-full items-center gap-3.5 px-3 py-3 rounded-2xl text-left transition-all duration-300 group overflow-hidden ${
                  active ? "bg-amber-100/50 dark:bg-amber-900/30 shadow-sm" : "hover:bg-stone-50 dark:hover:bg-stone-800/50"
                }`}
              >
                {/* Active Indicator */}
                <AnimatePresence>
                  {active && (
                    <motion.div 
                      layoutId="active-student-indicator"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-amber-500 dark:bg-amber-400 rounded-r-full shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    />
                  )}
                </AnimatePresence>

                <div className={`w-11 h-11 rounded-full overflow-hidden flex-shrink-0 transition-transform duration-300 ${active ? "ring-2 ring-amber-500/50 dark:ring-amber-400/50 ring-offset-2 ring-offset-stone-50 dark:ring-offset-[#1C1917] shadow-md scale-105" : "border border-stone-200 dark:border-stone-700 bg-stone-100 group-hover:scale-105"}`}>
                  <img src={s.avatar || "/images/avatarDefault.avif"} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-[14px] font-bold truncate transition-colors ${active ? "text-amber-950 dark:text-amber-400" : "text-stone-800 dark:text-stone-200"}`}>
                    {s.tenThanh ? <span className="font-medium text-stone-500 mr-1">{s.tenThanh}</span> : ""}{s.hoTen || s.username}
                  </p>
                  <p className={`text-[12px] truncate mt-0.5 font-medium ${active ? "text-amber-700 dark:text-amber-500/80" : "text-stone-400 dark:text-stone-500"}`}>{s.username}</p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default StudentListPanel;
