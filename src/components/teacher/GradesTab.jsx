import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Table, ArrowLeft, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../lib/supabase.js";
import { useToast } from "../ui/ToastContext.jsx";
import { Spinner } from "../ui/StudentShared.jsx";
import { useTeacherContext } from "./TeacherContext.jsx";
import { fetchClassTermRanges, fetchTermLocks } from "./api.js";
import { sortStudentsByTen, mostRecentSunday, resolveActiveHocKy, computeDiemTB, tbColorClass } from "./utils.js";
import { HK_INT_MAP, GRADE_FIELDS } from "./constants.js";

// Hằng số Easing chuẩn của Design System
const APPLE_EASE = [0.16, 1, 0.3, 1];

export default function GradesTab() {
  const { students, context } = useTeacherContext();
  const namHoc = context.namHoc;
  const lop    = context.lop;
  const { showToast } = useToast();
  const navigate = useNavigate();
  const onBack = () => navigate("../tổng-quan");

  const [hocKy, setHocKy] = useState("HK1");
  const hocKyInt           = HK_INT_MAP[hocKy];
  const [rows,    setRows]    = useState({}); 
  const [initial, setInitial] = useState({});
  const [manualTB, setManualTB] = useState({}); 
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  
  const [termLocks, setTermLocks] = useState({});
  const isLocked = !!termLocks[hocKyInt];
  const cellRefs = useRef({});
  const didAutoSelectHocKy = useRef(false);

  // Hook giả lập kiểm tra Mobile 
  const isMobile = window.innerWidth < 768;

  const rosterStudents = useMemo(() => sortStudentsByTen(students), [students]);

  useEffect(() => {
    if (didAutoSelectHocKy.current) return;
    let cancelled = false;
    (async () => {
      try {
        const ranges = await fetchClassTermRanges(lop, namHoc);
        if (cancelled || didAutoSelectHocKy.current) return;
        didAutoSelectHocKy.current = true;
        setHocKy(resolveActiveHocKy(ranges, mostRecentSunday()));
      } catch (err) {
        console.error("load class term ranges error:", err);
      }
    })();
    return () => { cancelled = true; };
  }, [lop, namHoc]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const locks = await fetchTermLocks(lop, namHoc);
      if (!cancelled) setTermLocks(locks);
    })();
    return () => { cancelled = true; };
  }, [lop, namHoc]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const usernames = rosterStudents.map((s) => s.username);
        const { data, error } = await supabase.from("grades").select("*")
          .eq("nam_hoc", namHoc).eq("hoc_ky", hocKyInt).in("username", usernames);
        if (error) throw error;

        const byUser = {};
        (data ?? []).forEach((r) => { byUser[r.username] = r; });

        const full = {};
        const manual = {};
        rosterStudents.forEach((s) => {
          const g = byUser[s.username] ?? {};
          full[s.username] = {
            diem_mieng:   g.diem_mieng   ?? null,
            diem_vo:      g.diem_vo      ?? null,
            diem_15_phut: g.diem_15_phut ?? null,
            diem_1_tiet:  g.diem_1_tiet  ?? null,
            diem_thi:     g.diem_thi     ?? null,
            diem_tb:      g.diem_tb      ?? null,
          };
          const auto = computeDiemTB(full[s.username]);
          if (g.diem_tb != null && auto != null && Number(g.diem_tb) !== auto) manual[s.username] = true;
        });

        if (!cancelled) { setRows(full); setInitial(full); setManualTB(manual); }
      } catch (err) {
        console.error("load bulk grades error:", err);
        if (!cancelled) showToast("Không tải được bảng điểm", "error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [rosterStudents, namHoc, hocKyInt, showToast]);

  const updateCell = (username, field, raw) => {
    if (isLocked) return;
    const value = raw === "" ? null : Number(raw);
    setRows((prev) => {
      const g = { ...prev[username], [field]: value };
      if (!manualTB[username]) g.diem_tb = computeDiemTB(g);
      return { ...prev, [username]: g };
    });
  };

  const updateTBManual = (username, raw) => {
    if (isLocked) return;
    setManualTB((prev) => ({ ...prev, [username]: true }));
    setRows((prev) => ({ ...prev, [username]: { ...prev[username], diem_tb: raw === "" ? null : Number(raw) } }));
  };

  const resetTBAuto = (username) => {
    if (isLocked) return;
    setManualTB((prev) => ({ ...prev, [username]: false }));
    setRows((prev) => ({ ...prev, [username]: { ...prev[username], diem_tb: computeDiemTB(prev[username]) } }));
  };

  const changedCount = useMemo(
    () => rosterStudents.filter((s) => JSON.stringify(rows[s.username]) !== JSON.stringify(initial[s.username])).length,
    [rosterStudents, rows, initial]
  );

  const focusCell = (rowIdx, field) => {
    const target = rosterStudents[rowIdx];
    if (!target) return;
    const el = cellRefs.current[`${target.username}-${field}`];
    if (el) { el.focus(); el.select?.(); }
  };

  const handleKeyDown = (e, rowIdx, field) => {
    if (e.key === "Enter" || e.key === "ArrowDown") { e.preventDefault(); focusCell(rowIdx + 1, field); }
    else if (e.key === "ArrowUp")                    { e.preventDefault(); focusCell(rowIdx - 1, field); }
  };

  const save = async () => {
    if (isLocked) return;
    setSaving(true);
    try {
      const payload = rosterStudents.map((s) => {
        const g = rows[s.username] ?? {};
        return {
          username: s.username, nam_hoc: namHoc, hoc_ky: hocKyInt, lop: lop, 
          diem_mieng: g.diem_mieng ?? null, diem_vo: g.diem_vo ?? null,
          diem_15_phut: g.diem_15_phut ?? null, diem_1_tiet: g.diem_1_tiet ?? null,
          diem_thi: g.diem_thi ?? null, diem_tb: g.diem_tb ?? null,
          updated_at: new Date().toISOString(),
        };
      });
      const { error } = await supabase.from("grades")
        .upsert(payload, { onConflict: "username,nam_hoc,hoc_ky" });
      if (error) throw error;

      setInitial(rows);
      showToast(`Đã lưu điểm cho ${payload.length} học sinh`, "success");
    } catch (err) {
      console.error("save bulk grades error:", err);
      showToast("Lưu điểm thất bại", "error");
    } finally {
      setSaving(false);
    }
  };

  const scoreFields = GRADE_FIELDS.filter((f) => f.key !== "diem_tb");

  return (
    <motion.div 
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: APPLE_EASE }}
      className="bg-white/80 dark:bg-[#1C1917]/80 backdrop-blur-xl rounded-[28px] border border-amber-900/10 dark:border-amber-100/10 shadow-sm overflow-hidden"
    >
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 px-5 py-5 border-b border-amber-900/10 dark:border-amber-100/10">
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
            <button type="button" onClick={onBack}
            className="inline-flex items-center justify-center gap-2 p-2 rounded-xl text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 border border-black/5 dark:border-white/5 transition-all duration-300 active:scale-[0.98] md:hover:bg-stone-200 dark:md:hover:bg-stone-700 flex-shrink-0">
            <ArrowLeft className="w-4 h-4" />
            </button>
            <h2 className="text-xl sm:text-2xl font-extrabold text-amber-950 dark:text-amber-50 font-serif leading-tight">
                Bảng điểm
            </h2>
        </div>

        <div className="hidden sm:block w-px h-6 bg-stone-200 dark:bg-stone-800 mx-2" />
        
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <Table className="w-5 h-5 flex-shrink-0 text-amber-800 dark:text-amber-400" />
          <div className="flex gap-1 bg-stone-100/80 dark:bg-stone-800/80 rounded-xl p-1 backdrop-blur-sm">
            {["HK1", "HK2"].map((k) => (
              <button key={k} type="button" onClick={() => setHocKy(k)}
                className={`px-4 py-2 rounded-lg text-[13px] font-bold transition-all duration-300 ${
                  hocKy === k 
                    ? "bg-white dark:bg-stone-700 text-amber-900 dark:text-amber-400 shadow-sm" 
                    : "text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200"
                }`}>
                {k === "HK1" ? "Học Kỳ I" : "Học Kỳ II"}
              </button>
            ))}
          </div>
          <span className="text-[12px] font-medium text-stone-400 dark:text-stone-500 hidden md:inline ml-2">
            Enter hoặc ↓ để nhảy ô tiếp theo
          </span>
        </div>

        {/* Nút Bấm Chính */}
        <button type="button" disabled={isLocked || saving || changedCount === 0} onClick={save}
          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-[14px] font-bold bg-amber-900 text-amber-50 dark:bg-amber-600 dark:text-white shadow-sm transition-all duration-300 active:scale-[0.98] md:hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0 w-full sm:w-auto">
          {saving && <Spinner className="h-4 w-4" />}
          {saving ? "Đang lưu…" : changedCount > 0 ? `Lưu (${changedCount})` : "Lưu bảng điểm"}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {isLocked && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }} 
            animate={{ height: "auto", opacity: 1 }} 
            exit={{ height: 0, opacity: 0 }} 
            transition={{ duration: 0.35, ease: APPLE_EASE }}
            className="overflow-hidden"
          >
            <div className="px-5 py-3 border-b border-amber-900/10 dark:border-amber-100/10 bg-stone-100/50 dark:bg-stone-800/50 text-[13px] font-medium text-stone-600 dark:text-stone-300 flex items-center gap-2">
              <span className="text-lg">🔒</span> Học kỳ này đã bị khóa sổ — chỉ xem được, không nhập điểm được cho đến khi Admin mở khóa lại.
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
      {loading ? (
        <motion.div 
            key="loading"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex items-center justify-center gap-3 py-20 text-amber-900 dark:text-amber-500"
        >
          <Spinner className="h-6 w-6" />
          <span className="text-[14px] font-medium font-sans">Đang tải bảng điểm…</span>
        </motion.div>
      ) : (
        <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, ease: APPLE_EASE }}>
          
          {/* MOBILE LIST */}
          <div className={`md:hidden divide-y divide-amber-900/5 dark:divide-amber-100/5 ${isLocked ? "opacity-60 pointer-events-none" : ""}`} data-lenis-prevent>
            {rosterStudents.map((s, rowIdx) => {
              const g = rows[s.username] ?? {};
              const isDirty = JSON.stringify(g) !== JSON.stringify(initial[s.username]);
              return (
                <motion.div 
                  initial={{ opacity: 0, y: isMobile ? 16 : 0 }} 
                  whileInView={{ opacity: 1, y: 0 }} 
                  viewport={{ once: true, margin: isMobile ? "-20px" : "0px" }}
                  transition={{ duration: 0.5, delay: rowIdx * 0.05, ease: APPLE_EASE }}
                  key={s.username} 
                  className={`px-5 py-4 transition-colors duration-500 ${isDirty ? "bg-amber-50/60 dark:bg-amber-900/20" : ""}`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-[12px] font-bold text-amber-800/50 dark:text-amber-400/50 w-5 text-center">{rowIdx + 1}</span>
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white dark:border-stone-800 flex-shrink-0 bg-stone-100 shadow-sm">
                      <img src={s.avatar || "/images/avatarDefault.avif"} alt="" className="w-full h-full object-cover" />
                    </div>
                    <p className="text-[15px] font-bold text-stone-800 dark:text-stone-200 truncate flex-1">
                      {s.tenThanh ? <span className="text-stone-500 font-medium mr-1">{s.tenThanh}</span> : ""}{s.hoTen}
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-3 pl-[52px]">
                    {scoreFields.map((f) => (
                      <label key={f.key} className="flex flex-col gap-1.5">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800/70 dark:text-amber-400/70">{f.label}</span>
                        <input
                          type="number" min="0" max="10" step="0.1" inputMode="decimal"
                          value={g[f.key] ?? ""}
                          onChange={(e) => updateCell(s.username, f.key, e.target.value)}
                          className="w-full text-center rounded-xl border border-amber-900/10 dark:border-amber-100/10 bg-white/50 dark:bg-stone-900/50 text-stone-900 dark:text-stone-100 py-2.5 text-[14px] font-medium focus:outline-none focus:ring-2 focus:ring-amber-600/50 dark:focus:ring-amber-500/50 transition-shadow"
                        />
                      </label>
                    ))}
                    <label className="flex flex-col gap-1.5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800/70 dark:text-amber-400/70">TB</span>
                      <div className="flex items-center gap-1">
                        <input
                          type="number" min="0" max="10" step="0.01" inputMode="decimal"
                          value={g.diem_tb ?? ""}
                          onChange={(e) => updateTBManual(s.username, e.target.value)}
                          className={`w-full text-center rounded-xl border py-2.5 text-[14px] font-bold focus:outline-none focus:ring-2 focus:ring-amber-600/50 dark:focus:ring-amber-500/50 transition-shadow ${tbColorClass(g.diem_tb)} ${
                            manualTB[s.username] ? "border-amber-600 dark:border-amber-500 bg-amber-50/40 dark:bg-amber-950/20" : "border-amber-900/10 dark:border-amber-100/10 bg-white/50 dark:bg-stone-900/50"
                          }`}
                        />
                        {manualTB[s.username] && (
                          <button type="button" title="Tính lại tự động" onClick={() => resetTBAuto(s.username)}
                            className="text-[13px] text-stone-400 dark:text-stone-500 hover:text-amber-800 dark:text-amber-400 flex-shrink-0">↺</button>
                        )}
                      </div>
                    </label>
                  </div>
                </motion.div>
              );
            })}
            {rosterStudents.length === 0 && (
              <p className="text-center text-[14px] text-stone-500 dark:text-stone-400 py-12 px-5">Lớp chưa có học sinh nào.</p>
            )}
          </div>

          {/* DESKTOP TABLE */}
          <div className={`hidden md:block overflow-auto max-h-[65vh] ${isLocked ? "opacity-60" : ""}`} data-lenis-prevent>
            <table className={`w-full text-sm border-collapse min-w-[760px] ${isLocked ? "pointer-events-none" : ""}`}>
              <thead>
                <tr className="text-[11px] font-bold uppercase tracking-wider text-amber-800/70 dark:text-amber-400/70">
                  <th className="text-center px-3 py-4 sticky top-0 left-0 bg-white/90 dark:bg-[#1C1917]/90 backdrop-blur-xl z-20 w-14 border-b border-amber-900/10 dark:border-amber-100/10">STT</th>
                  <th className="text-left px-4 py-4 sticky top-0 left-[56px] bg-white/90 dark:bg-[#1C1917]/90 backdrop-blur-xl z-20 border-b border-amber-900/10 dark:border-amber-100/10">Họ & Tên</th>
                  {scoreFields.map((f) => (
                    <th key={f.key} className="px-2 py-4 text-center min-w-[90px] sticky top-0 bg-white/90 dark:bg-[#1C1917]/90 backdrop-blur-xl z-10 border-b border-amber-900/10 dark:border-amber-100/10">{f.label}</th>
                  ))}
                  <th className="px-2 py-4 text-center min-w-[100px] sticky top-0 bg-white/90 dark:bg-[#1C1917]/90 backdrop-blur-xl z-10 border-b border-amber-900/10 dark:border-amber-100/10">TB</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-900/5 dark:divide-amber-100/5">
                {rosterStudents.map((s, rowIdx) => {
                  const g = rows[s.username] ?? {};
                  const isDirty = JSON.stringify(g) !== JSON.stringify(initial[s.username]);
                  const rowBg   = isDirty ? "bg-amber-50/60 dark:bg-amber-900/20" : "bg-transparent hover:bg-stone-50 dark:hover:bg-stone-800/50";
                  return (
                    <motion.tr 
                      initial={{ opacity: 0 }} 
                      whileInView={{ opacity: 1 }} 
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: rowIdx * 0.02, ease: APPLE_EASE }}
                      key={s.username} 
                      className={`transition-colors duration-300 ${rowBg}`}
                    >
                      <td className={`px-3 py-3 text-center sticky left-0 z-10 text-[12px] font-bold text-amber-800/50 dark:text-amber-400/50 w-14 ${isDirty ? "bg-amber-50 dark:bg-[#2A2318]" : "bg-white dark:bg-[#1C1917]"}`}>
                        {rowIdx + 1}
                      </td>
                      <td className={`px-4 py-3 sticky left-[56px] z-10 ${isDirty ? "bg-amber-50 dark:bg-[#2A2318]" : "bg-white dark:bg-[#1C1917]"}`}>
                        <div className="flex items-center gap-3 min-w-[180px]">
                          <div className="w-8 h-8 rounded-full overflow-hidden border border-stone-200 dark:border-stone-700 flex-shrink-0 bg-stone-100">
                            <img src={s.avatar || "/images/avatarDefault.avif"} alt="" className="w-full h-full object-cover" />
                          </div>
                          <span className="text-[14px] font-bold text-stone-800 dark:text-stone-100 truncate">{s.tenThanh ? <span className="text-stone-500 font-medium mr-1">{s.tenThanh}</span> : ""}{s.hoTen}</span>
                        </div>
                      </td>
                      {scoreFields.map((f) => (
                        <td key={f.key} className="px-2 py-3 text-center">
                          <input
                            ref={(el) => { cellRefs.current[`${s.username}-${f.key}`] = el; }}
                            type="number" min="0" max="10" step="0.1"
                            value={g[f.key] ?? ""}
                            onChange={(e) => updateCell(s.username, f.key, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, rowIdx, f.key)}
                            className="w-16 text-center rounded-xl border border-amber-900/10 dark:border-amber-100/10 bg-white/50 dark:bg-stone-900/50 text-stone-900 dark:text-stone-100 py-2 text-[14px] font-medium focus:outline-none focus:ring-2 focus:ring-amber-600/50 dark:focus:ring-amber-500/50 transition-shadow"
                          />
                        </td>
                      ))}
                      <td className="px-2 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <input
                            ref={(el) => { cellRefs.current[`${s.username}-diem_tb`] = el; }}
                            type="number" min="0" max="10" step="0.01"
                            value={g.diem_tb ?? ""}
                            onChange={(e) => updateTBManual(s.username, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, rowIdx, "diem_tb")}
                            className={`w-16 text-center rounded-xl border py-2 text-[14px] font-bold focus:outline-none focus:ring-2 focus:ring-amber-600/50 dark:focus:ring-amber-500/50 transition-shadow ${tbColorClass(g.diem_tb)} ${
                              manualTB[s.username] ? "border-amber-600 dark:border-amber-500 bg-amber-50/40 dark:bg-amber-950/20" : "border-amber-900/10 dark:border-amber-100/10 bg-white/50 dark:bg-stone-900/50"
                            }`}
                          />
                          {manualTB[s.username] && (
                            <button type="button" title="Tính lại tự động" onClick={() => resetTBAuto(s.username)}
                              className="text-[12px] font-bold text-stone-400 dark:text-stone-500 hover:text-amber-800 dark:text-amber-400 flex-shrink-0 transition-colors">↺</button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
      </AnimatePresence>

      <div className="px-5 py-3.5 border-t border-amber-900/10 dark:border-amber-100/10 bg-[#FDFBF7]/50 dark:bg-stone-900/50 flex items-start gap-2">
        <AlertCircle className="w-4 h-4 text-stone-400 dark:text-stone-500 flex-shrink-0 mt-0.5" />
        <span className="text-[12px] font-medium text-stone-500 dark:text-stone-400">
          Điểm TB tự tính theo công thức: Miệng×1, Vở×1, 15'×1, 1 Tiết×2, Thi×3 — có thể sửa tay (ô sẽ viền cam), bấm ↺ để tính lại tự động.
        </span>
      </div>
    </motion.div>
  );
}