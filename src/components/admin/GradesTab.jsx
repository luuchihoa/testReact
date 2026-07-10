import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  School, Search, ChevronLeft, FileSpreadsheet, Printer, Users, Lock, Eye,
} from "lucide-react";
import { useAdminContext } from "./AdminContext.jsx";
import { ACCENT, AVATAR_FALLBACK, handleAvatarError } from "./constants.js";
import { fetchClassRoster, fetchGradesMap, fetchClassAcademicSummary } from "./dataLayer.js";
import { CardsGridSkeleton, TableSkeleton } from "../ui/Skeleton.jsx";
import { HK_INT_MAP, GRADE_FIELDS, sortStudentsByTen, tbColorClass } from "./gradeUtils.js";

/* ============================================================
   TAB: BẢNG ĐIỂM (module Grades)
   Logic giữ nguyên 100%. UI nâng cấp theo phong cách Apple
   (glass, bo góc lớn, motion mượt) + hỗ trợ Dark Mode đầy đủ.
   ============================================================ */

function ClassPicker({ classes, loading, onPick }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return classes;
    return classes.filter((c) => c.lop.toLowerCase().includes(q));
  }, [classes, search]);

  return (
    <div
      className="rounded-[26px] border border-black/5 dark:border-white/10
        bg-white/80 dark:bg-white/[0.04] backdrop-blur-xl
        shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-16px_rgba(0,0,0,0.10)]
        dark:shadow-[0_1px_2px_rgba(0,0,0,0.3),0_12px_32px_-16px_rgba(0,0,0,0.5)]
        overflow-hidden"
    >
      <div className="px-4 sm:px-5 py-4 border-b border-black/5 dark:border-white/10">
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 dark:text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm lớp…"
            className="w-full rounded-2xl border border-black/5 dark:border-white/10
              bg-stone-100/80 dark:bg-white/[0.06] pl-10 pr-3.5 py-2.5 text-[14px]
              text-stone-800 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500
              focus:outline-none focus:ring-2 focus:ring-red-500/60 focus:bg-white dark:focus:bg-white/[0.08]
              transition-colors duration-200"
          />
        </div>
      </div>

      {loading ? (
        <CardsGridSkeleton count={6} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4 sm:p-5">
          {filtered.map((c) => {
            const anyLocked = c.locks?.[1] || c.locks?.[2];
            return (
              <button key={c.lop} type="button" onClick={() => onPick(c.lop)}
                className="text-left rounded-2xl border border-black/5 dark:border-white/10
                  bg-white dark:bg-white/[0.03]
                  active:scale-[0.97] active:bg-red-50/60 dark:active:bg-red-500/[0.08]
                  transition-all duration-200 ease-out p-4 flex flex-col gap-2
                  shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[14px] font-bold text-stone-800 dark:text-white truncate">{c.lop}</span>
                  {anyLocked && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-white/10 rounded-full px-2 py-0.5 flex-shrink-0">
                      <Lock className="w-2.5 h-2.5" /> Đã khóa
                    </span>
                  )}
                </div>
                <p className="text-[12px] text-stone-400 dark:text-stone-500 truncate">
                  GVCN: {c.teacherName || "— Chưa có —"}
                </p>
                <p className="text-[12px] text-stone-400 dark:text-stone-500 flex items-center gap-1">
                  <Users className="w-3 h-3" /> {c.studentCount} học sinh
                </p>
              </button>
            );
          })}
          {filtered.length === 0 && (
            <p className="col-span-full text-center text-sm text-stone-400 dark:text-stone-500 py-10">Không tìm thấy lớp nào.</p>
          )}
        </div>
      )}
    </div>
  );
}

function ClassGradeBook({ lop, namHoc, classInfo, showToast, onBack }) {
  const [hocKy, setHocKy] = useState("HK1");
  const hocKyInt = HK_INT_MAP[hocKy];

  const [students,  setStudents]  = useState([]);
  const [gradeRows, setGradeRows] = useState({}); // username -> { diem_*, hocLuc, hanhKiem, vangCoPhep, vangKhongPhep }
  const [loading,   setLoading]   = useState(true);

  const rosterStudents = useMemo(() => sortStudentsByTen(students), [students]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const roster = await fetchClassRoster(lop, namHoc);
      setStudents(roster);

      const usernames = roster.map((s) => s.username);
      const [gradesByUser, summaryByUser] = await Promise.all([
        fetchGradesMap(usernames, namHoc, hocKyInt),
        fetchClassAcademicSummary(usernames, namHoc, hocKyInt),
      ]);

      const merged = {};
      roster.forEach((s) => {
        const g = gradesByUser[s.username] ?? {};
        const d = summaryByUser[s.username] ?? {};
        merged[s.username] = {
          diem_mieng:   g.diem_mieng   ?? null,
          diem_vo:      g.diem_vo      ?? null,
          diem_15_phut: g.diem_15_phut ?? null,
          diem_1_tiet:  g.diem_1_tiet  ?? null,
          diem_thi:     g.diem_thi     ?? null,
          diem_tb:      g.diem_tb      ?? null,
          hocLuc:       d.hocLuc       ?? null,
          hanhKiem:     d.hanhKiem     ?? null,
          vangCoPhep:    d.vangCoPhep    || 0,
          vangKhongPhep: d.vangKhongPhep || 0,
        };
      });
      setGradeRows(merged);
    } catch (err) {
      console.error("load admin grade book error:", err);
      showToast("Không tải được bảng điểm", "error");
    } finally {
      setLoading(false);
    }
  }, [lop, namHoc, hocKyInt, showToast]);

  useEffect(() => { load(); }, [load]);

  const isLocked = !!classInfo?.locks?.[hocKyInt];
  const scoreFields = GRADE_FIELDS.filter((f) => f.key !== "diem_tb");

  const rowsWithWarning = useMemo(() => {
    return rosterStudents.map((s) => {
      const g = gradeRows[s.username] || {};
      const tongVang = (g.vangCoPhep || 0) + (g.vangKhongPhep || 0);
      const warning = (g.diem_tb != null && Number(g.diem_tb) < 5) || tongVang > 3;
      return { student: s, ...g, tongVang, warning };
    });
  }, [rosterStudents, gradeRows]);

  const [exporting, setExporting] = useState(false);

  const exportExcel = async () => {
    setExporting(true);
    try {
      const XLSX = await import("xlsx");
      const data = rowsWithWarning.map((r, idx) => ({
        "STT": idx + 1,
        "Họ & Tên": `${r.student.tenThanh ? r.student.tenThanh + " " : ""}${r.student.hoTen || r.student.username}`,
        "Miệng": r.diem_mieng ?? "",
        "Vở": r.diem_vo ?? "",
        "15'": r.diem_15_phut ?? "",
        "1 Tiết": r.diem_1_tiet ?? "",
        "Thi": r.diem_thi ?? "",
        "Điểm TB": r.diem_tb ?? "",
        "Học Lực": r.hocLuc ?? "",
        "Hạnh Kiểm": r.hanhKiem ?? "",
        "Vắng Có Phép": r.vangCoPhep,
        "Vắng Không Phép": r.vangKhongPhep,
        "Trạng Thái": r.warning ? "Cần theo dõi" : "Ổn định",
      }));
      const ws = XLSX.utils.json_to_sheet(data);
      ws["!cols"] = [{ wch: 5 }, { wch: 26 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 13 }, { wch: 15 }, { wch: 14 }];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, hocKy === "HK1" ? "Học kỳ I" : "Học kỳ II");
      XLSX.writeFile(wb, `BangDiem_${lop}_${hocKy}_${namHoc}.xlsx`);
    } catch (err) {
      console.error("export excel error:", err);
      showToast("Xuất Excel thất bại", "error");
    } finally {
      setExporting(false);
    }
  };

  const exportPDF = () => {
    requestAnimationFrame(() => window.print());
  };

  return (
    <div
      className="rounded-[26px] border border-black/5 dark:border-white/10
        bg-white/80 dark:bg-white/[0.04] backdrop-blur-xl
        shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-16px_rgba(0,0,0,0.10)]
        dark:shadow-[0_1px_2px_rgba(0,0,0,0.3),0_12px_32px_-16px_rgba(0,0,0,0.5)]
        overflow-hidden print:overflow-visible print:bg-white print:shadow-none print:border-0 print:rounded-none print:backdrop-blur-none"
    >
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #admin-grades-print, #admin-grades-print * { visibility: visible; }
          #admin-grades-print { position: absolute; left: 0; top: 0; width: 100%; }
          .ag-no-print { display: none !important; }
        }
      `}</style>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 sm:px-5 py-4 border-b border-black/5 dark:border-white/10 ag-no-print">
        <button type="button" onClick={onBack}
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-stone-500 dark:text-stone-400
            hover:text-stone-800 dark:hover:text-white active:scale-95 transition-all duration-200 flex-shrink-0">
          <ChevronLeft className="w-4 h-4" /> Đổi lớp
        </button>
        <div className="hidden sm:block w-px h-5 bg-stone-200 dark:bg-white/10" />
        <h3 className="text-[14px] font-bold text-stone-800 dark:text-white flex-shrink-0">Lớp {lop}</h3>

        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="flex gap-1 bg-stone-100 dark:bg-white/[0.06] rounded-xl p-1">
            {["HK1", "HK2"].map((k) => (
              <button key={k} type="button" onClick={() => setHocKy(k)}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all duration-200 ${
                  hocKy === k
                    ? "bg-white dark:bg-white/95 text-red-600 shadow-sm"
                    : "text-stone-500 dark:text-stone-400"
                }`}>
                {k === "HK1" ? "Học Kỳ I" : "Học Kỳ II"}
              </button>
            ))}
          </div>
          {isLocked && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-white/10 rounded-full px-2.5 py-1">
              <Lock className="w-3 h-3" /> Học kỳ đã khóa sổ
            </span>
          )}
          <span className="text-[11px] text-stone-400 dark:text-stone-500 hidden lg:inline-flex items-center gap-1">
            <Eye className="w-3 h-3" /> Chỉ xem — sửa điểm & khóa sổ ở tab Lớp học
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 w-full sm:flex sm:w-auto flex-shrink-0">
          <button type="button" disabled={exporting || loading} onClick={exportExcel}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl
              bg-emerald-600 dark:bg-emerald-500 text-white text-[12px] font-bold
              active:scale-95 hover:bg-emerald-700 dark:hover:bg-emerald-600
              transition-all duration-200 disabled:opacity-50">
            <FileSpreadsheet className="w-4 h-4" /> Xuất Excel
          </button>
          <button type="button" disabled={exporting || loading} onClick={exportPDF}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl
              bg-stone-900 dark:bg-white text-white dark:text-stone-900 text-[12px] font-bold
              active:scale-95 hover:bg-stone-800 dark:hover:bg-stone-100
              transition-all duration-200 disabled:opacity-50">
            <Printer className="w-4 h-4" /> In / PDF
          </button>
        </div>
      </div>

      {isLocked && (
        <div className="px-4 sm:px-5 py-2.5 border-b border-black/5 dark:border-white/10 bg-stone-100/70 dark:bg-white/[0.05] text-[12px] text-stone-600 dark:text-stone-300 ag-no-print">
          🔒 Học kỳ này đang bị khóa sổ — giáo viên không sửa được điểm/điểm danh cho đến khi được mở khóa lại.
        </div>
      )}

      {loading ? (
        <div className="ag-no-print px-0 sm:px-0 pb-1">
          <TableSkeleton rows={8} columns={6} />
        </div>
      ) : (
        <div id="admin-grades-print">
          <div className="hidden print:block px-5 pt-5">
            <h2 className="text-base font-bold text-stone-900">
              Bảng điểm lớp {lop} — {hocKy === "HK1" ? "Học kỳ I" : "Học kỳ II"} — {namHoc}
            </h2>
          </div>

          {/* MOBILE */}
          <div className="md:hidden print:hidden divide-y divide-stone-100 dark:divide-white/[0.06]" data-lenis-prevent>
            {rowsWithWarning.map((r, idx) => (
              <div key={r.student.username}
                className={`px-4 py-3.5 transition-colors duration-200 ${
                  r.warning ? "bg-red-50/60 dark:bg-red-500/[0.06]" : ""
                }`}>
                <div className="flex items-center gap-2.5 mb-2.5">
                  <span className="text-[11px] font-medium text-stone-400 dark:text-stone-500 w-4 flex-shrink-0 text-center">{idx + 1}</span>
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-stone-200 dark:border-white/10 flex-shrink-0 bg-stone-100 dark:bg-white/10">
                    <img src={r.student.avatar || AVATAR_FALLBACK} alt="" className="w-full h-full object-cover" onError={handleAvatarError} />
                  </div>
                  <span className="text-[13px] font-semibold text-stone-800 dark:text-white truncate min-w-0 flex-1">
                    {r.student.tenThanh ? `${r.student.tenThanh} ` : ""}{r.student.hoTen || r.student.username}
                  </span>
                  {r.warning ? (
                    <span className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-400 text-[10px] font-bold whitespace-nowrap">
                      ⚠️ Theo dõi
                    </span>
                  ) : (
                    <span className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold whitespace-nowrap">
                      ✓ Ổn định
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2 pl-[42px] text-center">
                  {scoreFields.map((f) => (
                    <div key={f.key} className="bg-stone-50 dark:bg-white/[0.05] rounded-lg py-1.5">
                      <p className="text-[9px] text-stone-400 dark:text-stone-500 mb-0.5">{f.label}</p>
                      <p className="text-[13px] font-semibold text-stone-700 dark:text-stone-200">{r[f.key] ?? "—"}</p>
                    </div>
                  ))}
                  <div className="bg-stone-50 dark:bg-white/[0.05] rounded-lg py-1.5">
                    <p className="text-[9px] text-stone-400 dark:text-stone-500 mb-0.5">TB</p>
                    <p className={`text-[13px] font-bold ${tbColorClass(r.diem_tb)}`}>{r.diem_tb ?? "—"}</p>
                  </div>
                  <div className="bg-stone-50 dark:bg-white/[0.05] rounded-lg py-1.5">
                    <p className="text-[9px] text-stone-400 dark:text-stone-500 mb-0.5">Học Lực</p>
                    <p className="text-[12px] font-medium text-stone-600 dark:text-stone-300">{r.hocLuc || "—"}</p>
                  </div>
                  <div className="bg-stone-50 dark:bg-white/[0.05] rounded-lg py-1.5">
                    <p className="text-[9px] text-stone-400 dark:text-stone-500 mb-0.5">Hạnh Kiểm</p>
                    <p className="text-[12px] font-medium text-stone-600 dark:text-stone-300">{r.hanhKiem || "—"}</p>
                  </div>
                  <div className="bg-stone-50 dark:bg-white/[0.05] rounded-lg py-1.5">
                    <p className="text-[9px] text-stone-400 dark:text-stone-500 mb-0.5">Vắng CP</p>
                    <p className="text-[13px] font-medium text-stone-600 dark:text-stone-300">{r.vangCoPhep}</p>
                  </div>
                  <div className="bg-stone-50 dark:bg-white/[0.05] rounded-lg py-1.5">
                    <p className="text-[9px] text-stone-400 dark:text-stone-500 mb-0.5">Vắng KP</p>
                    <p className="text-[13px] font-medium text-stone-600 dark:text-stone-300">{r.vangKhongPhep}</p>
                  </div>
                </div>
              </div>
            ))}
            {rowsWithWarning.length === 0 && (
              <p className="text-center text-sm text-stone-400 dark:text-stone-500 py-10 px-4">Lớp chưa có học sinh nào.</p>
            )}
          </div>

          {/* DESKTOP + IN/PDF */}
          <div className="overflow-auto max-h-[65vh] p-2" data-lenis-prevent>
            <table className="w-full border-separate border-spacing-y-1.5">
              <thead>
                <tr className="text-[11px] uppercase tracking-wider text-stone-400 dark:text-stone-500 font-bold">
                  <th className="px-4 py-3 text-left">STT</th>
                  <th className="px-4 py-3 text-left">Tên Thánh, Họ & Tên</th>
                  {scoreFields.map((f) => <th key={f.key} className="px-2 py-3 text-center">{f.label}</th>)}
                  <th className="px-2 py-3 text-center">TB</th>
                  <th className="px-2 py-3 text-center">Học Lực</th>
                  <th className="px-2 py-3 text-center">Hạnh Kiểm</th>
                  <th className="px-4 py-3 text-center">Vắng</th>
                </tr>
              </thead>
              <tbody className="text-[13px]">
                {rowsWithWarning.map((r, idx) => (
                  <tr key={r.student.username} 
                      className="group bg-white dark:bg-[#1c1c1e] shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] 
                      hover:shadow-[0_8px_16px_-4px_rgba(0,0,0,0.1)] transition-all duration-300 rounded-2xl overflow-hidden">
                    <td className="px-4 py-4 rounded-l-2xl font-medium text-stone-400">{idx + 1}</td>
                    <td className="px-4 py-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-stone-100 dark:bg-white/5 overflow-hidden">
                        <img src={r.student.avatar || AVATAR_FALLBACK} className="w-full h-full object-cover" />
                      </div>
                      <span className="font-semibold text-stone-800 dark:text-stone-200">
                        {r.student.tenThanh} {r.student.hoTen}
                      </span>
                    </td>
                    {scoreFields.map((f) => (
                      <td key={f.key} className="px-2 py-4 text-center text-stone-600 dark:text-stone-400">{r[f.key] ?? "—"}</td>
                    ))}
                    <td className={`px-2 py-4 text-center font-bold ${tbColorClass(r.diem_tb)}`}>{r.diem_tb ?? "—"}</td>
                    <td className="px-2 py-4 text-center text-stone-600 dark:text-stone-400">{r.hocLuc === "Trung Bình" ? "TB" : r.hocLuc || "—"}</td>
                    <td className="px-2 py-4 text-center text-stone-600 dark:text-stone-400">{r.hanhKiem === "Trung Bình" ? "TB" : r.hanhKiem || "—"}</td>
                    <td className="px-4 py-4 rounded-r-2xl text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${r.tongVang > 3 ? "bg-red-50 text-red-600 dark:bg-red-500/10" : "bg-stone-50 text-stone-500 dark:bg-white/5"}`}>
                        {r.tongVang}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <p className="px-4 sm:px-5 py-3 border-t border-black/5 dark:border-white/10 bg-stone-50 dark:bg-white/[0.03] text-[11px] text-stone-400 dark:text-stone-500 ag-no-print">
        Chỉ xem — dòng đỏ: Điểm TB &lt; 5 hoặc vắng &gt; 3 buổi. Muốn sửa điểm, vào tài khoản giáo viên chủ nhiệm lớp này. Khóa/mở sổ học kỳ nằm ở tab "Lớp học".
      </p>
    </div>
  );
}

export default function GradesTab() {
  const { classes, namHoc, loading, showToast } = useAdminContext();
  const [selectedLop, setSelectedLop] = useState(null);

  const selectedClass = useMemo(
    () => classes.find((c) => c.lop === selectedLop) || null,
    [classes, selectedLop]
  );

  useEffect(() => {
    if (selectedLop && !loading && !classes.some((c) => c.lop === selectedLop)) {
      setSelectedLop(null);
    }
  }, [namHoc, classes, loading, selectedLop]);

  if (!selectedLop) {
    return (
      <div className="flex flex-col gap-4 fade-in-up">
        <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400">
          <School className="w-4 h-4 flex-shrink-0" style={{ color: ACCENT }} />
          <p className="text-[13px]">Chọn 1 lớp để xem điểm & chuyên cần, hoặc xuất file — năm học {namHoc}.</p>
        </div>
        <ClassPicker classes={classes} loading={loading} onPick={setSelectedLop} />
      </div>
    );
  }

  return (
    <ClassGradeBook
      lop={selectedLop}
      namHoc={namHoc}
      classInfo={selectedClass}
      showToast={showToast}
      onBack={() => setSelectedLop(null)}
    />
  );
}