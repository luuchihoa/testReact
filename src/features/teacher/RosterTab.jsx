import React, { useMemo, useState } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { Users } from "lucide-react";
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
    <div className="grid grid-cols-1 lg:grid-cols-[390px_minmax(0,1fr)] xl:grid-cols-[410px_minmax(0,1fr)] gap-6 items-start">
      
      <div className={selectedStudent ? "hidden lg:block" : "block"}>
        <StudentListPanel
          students={filteredStudents}
          allStudents={students}
          lop={context?.lop}
          namHoc={context?.namHoc}
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
            <Motion.div 
              key={selectedStudent.username}
              initial={{ opacity: 0, scale: 0.98 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3, ease: APPLE_EASE }} 
              className="min-w-0"
            >
              <StudentEditPanel
                student={selectedStudent}
                namHoc={context.namHoc}
                lop={context.lop}
                onClose={() => setSelectedUsername(null)}
                onSaved={handleStudentSaved}
              />
            </Motion.div>
          ) : (
            <Motion.div 
              key="empty"
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              transition={{ duration: 0.3, ease: APPLE_EASE }}
              className="h-full min-h-[50vh] flex flex-col items-center justify-center gap-3 bg-[#fffefa] dark:bg-[#1e2821] rounded-2xl border border-[#dedfd4] dark:border-[#354237] shadow-xs text-center p-8 relative"
            >
              <div className="w-16 h-16 rounded-2xl bg-[#314e3e]/10 dark:bg-[#d6b883]/15 text-[#314e3e] dark:text-[#d6b883] flex items-center justify-center mb-1">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-[#293d32] dark:text-[#ecece0]">
                Chọn học sinh để xem hồ sơ
              </h3>
              <p className="text-xs text-[#575e55] dark:text-[#b0b9ac] max-w-sm leading-relaxed">
                Chọn một học sinh từ danh sách bên trái để xem và chỉnh sửa thông tin cá nhân, bảng điểm từng học kỳ và lịch sử điểm danh.
              </p>
            </Motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
