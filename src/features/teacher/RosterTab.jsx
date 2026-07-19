import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ClipboardList, ArrowLeft } from "lucide-react";
import { useTeacherContext } from "./TeacherContext.jsx";
import StudentListPanel from "./roster/StudentListPanel.jsx";
import StudentEditPanel from "./roster/StudentEditPanel.jsx";

const APPLE_EASE = [0.16, 1, 0.3, 1];

export default function RosterTab() {
  const { students, context, loadingStudents, handleStudentSaved } = useTeacherContext();
  const [search, setSearch] = useState("");
  const [selectedUsername, setSelectedUsername] = useState(null);

  const filteredStudents = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return students || [];
    return (students || []).filter((s) =>
      (s.hoTen || "").toLowerCase().includes(q) ||
      (s.username || "").toLowerCase().includes(q)
    );
  }, [students, search]);

  const selectedStudent = (students || []).find((s) => s.username === selectedUsername) || null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[360px_minmax(0,1fr)] gap-6">
      
      <div className={selectedStudent ? "hidden lg:block" : "block"}>
        <StudentListPanel
          students={filteredStudents}
          loading={loadingStudents}
          search={search}
          setSearch={setSearch}
          selectedUsername={selectedUsername}
          onSelect={setSelectedUsername}
        />
      </div>

      <div className={`min-h-[50vh] min-w-0 ${selectedStudent ? "block" : "hidden lg:block"}`}>
        <AnimatePresence mode="wait">
          {selectedStudent ? (
            <motion.div key={selectedStudent.username}
              initial={{ opacity: 0, scale: 0.98 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4, ease: APPLE_EASE }} 
              className="min-w-0">
              <button type="button" onClick={() => setSelectedUsername(null)}
                className="lg:hidden inline-flex items-center gap-2 p-2 rounded-xl text-[14px] font-bold text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 bg-white/50 dark:bg-stone-800/50 backdrop-blur-md border border-amber-900/10 mb-4 transition-all active:scale-[0.98]">
                <ArrowLeft className="w-4 h-4" /> Danh sách học sinh
              </button>
              <StudentEditPanel
                student={selectedStudent}
                namHoc={context.namHoc}
                lop={context.lop}
                onClose={() => setSelectedUsername(null)}
                onSaved={handleStudentSaved}
              />
            </motion.div>
          ) : (
            <motion.div key="empty"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4, ease: APPLE_EASE }}
              className="h-full min-h-[50vh] flex flex-col items-center justify-center gap-4 bg-white/80 dark:bg-[#1C1917]/80 backdrop-blur-xl rounded-[28px] border border-amber-900/10 dark:border-amber-100/10 shadow-sm text-center px-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />
              
              <motion.div 
                animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="w-24 h-24 rounded-full bg-amber-100/50 dark:bg-amber-900/20 flex items-center justify-center mb-2 relative z-10 shadow-inner">
                 <ClipboardList className="w-10 h-10 text-amber-800 dark:text-amber-500" strokeWidth={1.5} />
                 {/* Decorative glowing dot */}
                 <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.8, 0.4] }} transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }} className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 dark:bg-amber-500 rounded-full blur-sm" />
              </motion.div>
              <h3 className="text-[20px] font-extrabold text-amber-950 dark:text-amber-50 font-serif z-10 drop-shadow-sm">Bắt đầu quản lý</h3>
              <p className="text-[14px] font-medium text-stone-500 dark:text-stone-400 max-w-sm z-10">
                Chọn một học sinh từ danh sách bên trái để xem và chỉnh sửa hồ sơ, điểm số cũng như điểm danh.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
