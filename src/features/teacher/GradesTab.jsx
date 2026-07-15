import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { Table, ArrowLeft, AlertCircle, RefreshCw, Check, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../lib/supabase.js";
import { useToast } from "../../components/ui/ToastContext.jsx";
import { Spinner } from "../../components/ui/Skeleton.jsx";
import { useTeacherContext } from "./TeacherContext.jsx";
import { fetchClassTermRanges, fetchTermLocks } from "./api.js";
import { sortStudentsByTen, mostRecentSunday, resolveActiveHocKy, computeDiemTB } from "./utils.js";
import { HK_INT_MAP, GRADE_FIELDS } from "./constants.js";

const APPLE_EASE = [0.16, 1, 0.3, 1];

// 🎨 Helper: Hệ màu Earth/Stone/Amber phân loại điểm số
const getScoreTheme = (tb) => {
  if (tb === null || tb === undefined || tb === "") return { bg: "bg-stone-100 dark:bg-stone-800", text: "text-stone-500", border: "border-stone-200 dark:border-stone-700" };
  const n = Number(tb);
  if (n >= 8.0) return { bg: "bg-emerald-50 dark:bg-emerald-900/20", text: "text-emerald-700 dark:text-emerald-400", border: "border-emerald-200 dark:border-emerald-800/50" };
  if (n >= 6.5) return { bg: "bg-amber-50 dark:bg-amber-900/20", text: "text-amber-700 dark:text-amber-500", border: "border-amber-200 dark:border-amber-800/50" };
  if (n >= 5.0) return { bg: "bg-stone-50 dark:bg-stone-800/50", text: "text-stone-700 dark:text-stone-300", border: "border-stone-200 dark:border-stone-700" };
  return { bg: "bg-red-50 dark:bg-red-900/20", text: "text-red-700/80 dark:text-red-400", border: "border-red-200 dark:border-red-900/50" }; // Yếu - Đỏ gạch
};

export default function GradesTab() {
  const { students, context } = useTeacherContext();
  const namHoc = context.namHoc;
  const lop = context.lop;
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [hocKy, setHocKy] = useState("HK1");
  const hocKyInt = HK_INT_MAP[hocKy];
  const [rows, setRows] = useState({}); 
  const [initial, setInitial] = useState({});
  const [manualTB, setManualTB] = useState({}); 
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [shakeField, setShakeField] = useState(null); // Quản lý animation rung
  
  const [termLocks, setTermLocks] = useState({});
  const isLocked = !!termLocks[hocKyInt];
  const cellRefs = useRef({});
  const didAutoSelect = useRef(false);

  const rosterStudents = useMemo(() => sortStudentsByTen(students), [students]);

  // Load Data... (Logic giữ nguyên)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const ranges = await fetchClassTermRanges(lop, namHoc);
        if (cancelled || didAutoSelect.current) return;
        didAutoSelect.current = true;
        setHocKy(resolveActiveHocKy(ranges, mostRecentSunday()));
      } catch (err) {}
    })();
    return () => { cancelled = true; };
  }, [lop, namHoc]);

  useEffect(() => {
    let cancelled = false;
    fetchTermLocks(lop, namHoc).then(locks => { if (!cancelled) setTermLocks(locks); });
    return () => { cancelled = true; };
  }, [lop, namHoc]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const usernames = rosterStudents.map((s) => s.username);
        const { data, error } = await supabase.from("grades").select("*").eq("nam_hoc", namHoc).eq("hoc_ky", hocKyInt).in("username", usernames);
        if (error) throw error;

        const byUser = {}; (data ?? []).forEach((r) => { byUser[r.username] = r; });
        const full = {}; const manual = {};
        
        rosterStudents.forEach((s) => {
          const g = byUser[s.username] ?? {};
          full[s.username] = { diem_mieng: g.diem_mieng, diem_vo: g.diem_vo, diem_15_phut: g.diem_15_phut, diem_1_tiet: g.diem_1_tiet, diem_thi: g.diem_thi, diem_tb: g.diem_tb };
          const auto = computeDiemTB(full[s.username]);
          if (g.diem_tb != null && auto != null && Number(g.diem_tb) !== auto) manual[s.username] = true;
        });

        if (!cancelled) { setRows(full); setInitial(full); setManualTB(manual); }
      } catch (err) {
        if (!cancelled) showToast("Không tải được bảng điểm", "error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [rosterStudents, namHoc, hocKyInt, showToast]);

  // 💡 Cải tiến: Validate điểm số và kích hoạt Shake Animation
  const handleScoreChange = useCallback((username, field, raw, isTB = false) => {
    if (isLocked) return;
    
    // Rung lắc và từ chối nếu nhập bậy
    if (raw !== "" && (Number(raw) > 10 || Number(raw) < 0)) {
      setShakeField(`${username}-${field}`);
      setTimeout(() => setShakeField(null), 400); // Reset sau 400ms
      return; 
    }

    const value = raw === "" ? null : Number(raw);
    
    if (isTB) {
      setManualTB(prev => ({ ...prev, [username]: true }));
      setRows(prev => ({ ...prev, [username]: { ...prev[username], diem_tb: value } }));
    } else {
      setRows((prev) => {
        const g = { ...prev[username], [field]: value };
        if (!manualTB[username]) g.diem_tb = computeDiemTB(g);
        return { ...prev, [username]: g };
      });
    }
  }, [isLocked, manualTB]);

  const resetTBAuto = (username) => {
    if (isLocked) return;
    setManualTB(prev => ({ ...prev, [username]: false }));
    setRows(prev => ({ ...prev, [username]: { ...prev[username], diem_tb: computeDiemTB(prev[username]) } }));
  };

  const changedCount = useMemo(() => rosterStudents.filter((s) => JSON.stringify(rows[s.username]) !== JSON.stringify(initial[s.username])).length, [rosterStudents, rows, initial]);

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const triggerSave = () => {
    if (isLocked || changedCount === 0) return;
    setShowConfirmModal(true);
  };

  const confirmSave = async () => {
    setShowConfirmModal(false);
    if (isLocked || changedCount === 0) return;
    setSaving(true);
    try {
      const payload = rosterStudents.map((s) => ({
        username: s.username, nam_hoc: namHoc, hoc_ky: hocKyInt, lop: lop, ...rows[s.username], updated_at: new Date().toISOString()
      }));
      const { error } = await supabase.from("grades").upsert(payload, { onConflict: "username,nam_hoc,hoc_ky" });
      if (error) throw error;
      setInitial(rows);
      showToast(`Đã lưu bảng điểm thành công!`, "success");
    } catch (err) {
      showToast("Lưu điểm thất bại", "error");
    } finally {
      setSaving(false);
    }
  };

  const scoreFields = GRADE_FIELDS.filter((f) => f.key !== "diem_tb");

  const totalCount = rosterStudents.length * scoreFields.length;
  const filledCount = useMemo(() => {
    let count = 0;
    rosterStudents.forEach(s => {
      const g = rows[s.username] || {};
      scoreFields.forEach(f => {
        if (g[f.key] !== undefined && g[f.key] !== null && g[f.key] !== "") count++;
      });
    });
    return count;
  }, [rosterStudents, rows, scoreFields]);
  const progressRate = totalCount === 0 ? 0 : Math.round((filledCount / totalCount) * 100);

  const classAverage = useMemo(() => {
    let sum = 0;
    let count = 0;
    rosterStudents.forEach(s => {
      const g = rows[s.username];
      if (g && g.diem_tb && !isNaN(parseFloat(g.diem_tb))) {
        sum += parseFloat(g.diem_tb);
        count++;
      }
    });
    return count > 0 ? (sum / count).toFixed(1) : "-";
  }, [rosterStudents, rows]);

  const handleKeyDown = (e, rowIdx, colIdx) => {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Enter"].includes(e.key)) {
      e.preventDefault();
      let nextRow = rowIdx;
      let nextCol = colIdx;
      
      const ALL_FIELDS = [...scoreFields.map(f => f.key), "diem_tb"];
      
      if (e.key === "ArrowUp") nextRow = Math.max(0, rowIdx - 1);
      if (e.key === "ArrowDown" || e.key === "Enter") nextRow = Math.min(rosterStudents.length - 1, rowIdx + 1);
      if (e.key === "ArrowLeft") nextCol = Math.max(0, colIdx - 1);
      if (e.key === "ArrowRight") nextCol = Math.min(ALL_FIELDS.length - 1, colIdx + 1);

      const nextField = ALL_FIELDS[nextCol];
      const nextUsername = rosterStudents[nextRow].username;
      
      const targetId = `input-${nextUsername}-${nextField}`;
      const el = document.getElementById(targetId);
      if (el) {
        el.focus();
        // Cố gắng đặt con trỏ ở cuối số nếu có thể
        setTimeout(() => {
          if (el.value) {
            el.setSelectionRange(el.value.length, el.value.length);
          } else {
            el.select();
          }
        }, 10);
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: APPLE_EASE }}
      className="bg-white/80 dark:bg-[#1C1917]/80 backdrop-blur-xl sm:rounded-[28px] sm:border border-amber-900/10 dark:border-amber-100/10 sm:shadow-sm overflow-hidden"
    >
      {/* --- HEADER --- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 sm:px-8 py-5 sm:py-6 border-b border-amber-900/10 dark:border-amber-100/10 bg-gradient-to-br from-stone-50/50 to-amber-50/30 dark:from-stone-900/50 dark:to-stone-800/30">
        <div className="flex items-center gap-4">
            <button onClick={() => navigate("../tổng-quan")} className="inline-flex items-center justify-center gap-2 p-2.5 rounded-full text-stone-500 dark:text-stone-400 bg-white dark:bg-stone-800 border border-black/5 dark:border-white/5 transition-all duration-300 active:scale-[0.98] md:hover:bg-stone-100 dark:md:hover:bg-stone-700 flex-shrink-0 shadow-sm">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-amber-950 dark:text-amber-50 font-serif leading-tight">Bảng điểm</h2>
              <p className="text-[13px] font-medium text-stone-500 mt-0.5 hidden sm:block">Cập nhật kết quả học tập nhanh chóng</p>
            </div>
        </div>

        <div className="flex items-center justify-between gap-4 w-full sm:w-auto mt-2 sm:mt-0">
          {/* Progress Ring */}
          {totalCount > 0 && (
            <div className="hidden md:flex items-center gap-3 shrink-0">
              <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="16" fill="none" className="stroke-stone-200 dark:stroke-stone-750" strokeWidth="3.5" />
                  <circle cx="18" cy="18" r="16" fill="none" className="stroke-amber-500" strokeWidth="3.5" strokeDasharray={`${progressRate} 100`} strokeLinecap="round" />
                </svg>
                <span className="absolute text-[11px] font-extrabold text-amber-950 dark:text-amber-50">{progressRate}%</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[14px] font-bold text-stone-800 dark:text-stone-200">{filledCount}/{totalCount}</span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Đã nhập</span>
              </div>
            </div>
          )}

          <div className="relative flex gap-1 p-1 bg-stone-100 dark:bg-stone-800 rounded-xl shadow-inner border border-amber-900/10 dark:border-amber-100/10 w-full sm:w-fit shrink-0">
            {["HK1", "HK2"].map((k) => (
              <button key={k} type="button" onClick={() => setHocKy(k)}
                className={`flex-1 sm:flex-none relative px-4 py-2 rounded-lg text-[13px] font-semibold transition-colors duration-300 z-10 ${
                  hocKy === k 
                    ? "text-amber-950 dark:text-amber-50" 
                    : "text-stone-500 dark:text-stone-400 hover:text-amber-950 dark:hover:text-amber-50"
                }`}>
                {hocKy === k && (
                  <motion.div
                    layoutId="active-grades-hk-tab"
                    className="absolute inset-0 bg-white dark:bg-stone-900 rounded-lg shadow-sm border border-amber-900/10 dark:border-amber-100/10"
                    initial={false}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-20">{k === "HK1" ? "Học kỳ I" : "Học kỳ II"}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {isLocked && (
        <div className="px-5 py-3 bg-stone-100/50 dark:bg-stone-800/50 text-[13px] font-medium text-stone-600 dark:text-stone-300 flex items-center gap-2 border-b border-amber-900/10">
          🔒 Học kỳ này đã bị khóa sổ — chỉ xem được, không nhập điểm được.
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-amber-900 dark:text-amber-500"><Spinner className="w-6 h-6 mb-2" /> Đang tải dữ liệu...</div>
      ) : (
        <>
          {/* --- MOBILE LAYOUT (Cards) --- */}
          <div className="md:hidden divide-y divide-amber-900/5 dark:divide-amber-100/5 pb-20">
            {rosterStudents.map((s, idx) => {
              const g = rows[s.username] ?? {};
              const isDirty = JSON.stringify(g) !== JSON.stringify(initial[s.username]);
              const theme = getScoreTheme(g.diem_tb);

              return (
                <div key={s.username} className={`p-4 transition-colors duration-500 ${isDirty ? "bg-amber-50/40 dark:bg-amber-900/10" : ""}`}>
                  {/* Header thẻ học sinh */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-10 h-10 rounded-full border-2 border-white dark:border-stone-800 bg-stone-100 shadow-sm shrink-0 overflow-hidden">
                        <img src={s.avatar || "/images/avatarDefault.avif"} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[15px] font-bold text-stone-800 dark:text-stone-100">
                          {s.tenThanh ? <span className="font-normal text-stone-500 mr-1">{s.tenThanh}</span> : null}
                          {s.hoTen}
                        </p>
                        <p className="text-[12px] text-stone-500">STT: {idx + 1}</p>
                      </div>
                    </div>
                    {/* Badge Điểm TB */}
                    <div className={`flex flex-col items-center justify-center shrink-0 w-12 h-12 rounded-xl border ${theme.bg} ${theme.border}`}>
                      <span className="text-[9px] font-bold uppercase text-stone-500 mb-0.5">TB</span>
                      <span className={`text-[15px] font-black leading-none ${theme.text}`}>{g.diem_tb ?? "-"}</span>
                    </div>
                  </div>

                  {/* Grid nhập điểm Mobile */}
                  <div className="grid grid-cols-6 gap-2 pt-1">
                    {scoreFields.map((f, i) => {
                      const colSpanClass = i < 3 ? "col-span-2" : "col-span-3";
                      return (
                      <div key={f.key} className={`${colSpanClass} relative bg-stone-50 dark:bg-stone-900/50 rounded-xl overflow-hidden border border-stone-200/50 dark:border-stone-700/50 focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-500/20 transition-all`}>
                        <div className="pt-2 pb-1 text-center">
                          <span className="text-[9px] font-bold uppercase tracking-tight text-stone-500">{f.label}</span>
                        </div>
                        <motion.input
                          variants={{ shake: { x: [-3, 3, -3, 3, 0], transition: { duration: 0.3 } } }}
                          animate={shakeField === `${s.username}-${f.key}` ? "shake" : ""}
                          type="text" inputMode="decimal" placeholder="-"
                          value={g[f.key] ?? ""}
                          onChange={(e) => handleScoreChange(s.username, f.key, e.target.value)}
                          disabled={isLocked}
                          className={`w-full h-8 text-center bg-transparent text-[16px] font-black focus:outline-none transition-all ${
                            shakeField === `${s.username}-${f.key}` ? "text-red-600 bg-red-50" : "text-stone-800 dark:text-stone-100"
                          } disabled:opacity-50`}
                        />
                      </div>
                      );
                    })}
                    
                    {/* Nút Reset tự động nếu có sửa tay điểm TB */}
                    {manualTB[s.username] && (
                      <button onClick={() => resetTBAuto(s.username)} className="col-span-6 mt-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-amber-100/50 dark:bg-amber-900/30 text-amber-700 text-[12px] font-bold">
                        <RefreshCw className="w-3.5 h-3.5" /> Tính lại ĐTB tự động
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* --- DESKTOP LAYOUT (Table Spreadsheet) --- */}
          <div className="hidden md:block overflow-auto max-h-[75vh]" data-lenis-prevent>
            <table className="w-full text-sm border-collapse min-w-[900px] bg-white dark:bg-[#1C1917]">
              <thead className="sticky top-0 z-30 bg-white dark:bg-[#1C1917] shadow-[0_1px_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_0_rgba(255,255,255,0.05)] text-[12px] font-extrabold uppercase tracking-wider text-stone-500">
                <tr>
                  <th className="sticky left-0 z-40 bg-white dark:bg-[#1C1917] px-4 py-4 text-center w-12 border-b border-r border-stone-200/50 dark:border-stone-700/50">STT</th>
                  <th className="sticky left-[48px] z-40 bg-white dark:bg-[#1C1917] px-4 py-4 text-left border-b border-r border-stone-200/50 dark:border-stone-700/50 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">Họ & Tên Học Sinh</th>
                  {scoreFields.map(f => <th key={f.key} className="px-2 py-4 text-center w-24 border-b border-r border-stone-200/50 dark:border-stone-700/50">{f.label}</th>)}
                  <th className="px-4 py-4 text-center w-28 border-b border-stone-200/50 dark:border-stone-700/50 bg-stone-50/50 dark:bg-stone-800/20 text-stone-600 dark:text-stone-300">Điểm TB (Hệ 10)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200/50 dark:divide-stone-700/50">
                {rosterStudents.map((s, rowIdx) => {
                  const g = rows[s.username] ?? {};
                  const isDirty = JSON.stringify(g) !== JSON.stringify(initial[s.username]);
                  const theme = getScoreTheme(g.diem_tb);

                  return (
                    <tr key={s.username} className={`transition-colors duration-300 group ${isDirty ? "bg-amber-50/60 dark:bg-amber-900/20" : "hover:bg-stone-50/50 dark:hover:bg-stone-800/30"}`}>
                      <td className="sticky left-0 z-20 bg-white dark:bg-[#1C1917] px-4 py-3 text-center text-[13px] font-bold text-stone-400 border-r border-stone-200/50 dark:border-stone-700/50 group-hover:bg-stone-50/50 dark:group-hover:bg-stone-800/30 transition-colors">{rowIdx + 1}</td>
                      <td className="sticky left-[48px] z-20 bg-white dark:bg-[#1C1917] px-4 py-3 border-r border-stone-200/50 dark:border-stone-700/50 shadow-[2px_0_5px_rgba(0,0,0,0.02)] group-hover:bg-stone-50/50 dark:group-hover:bg-stone-800/30 transition-colors">
                        <div className="flex items-center gap-3">
                          <img src={s.avatar || "/images/avatarDefault.avif"} alt="" className="w-8 h-8 rounded-full border border-stone-200 dark:border-stone-700 object-cover shrink-0" />
                          <span className="font-bold text-[14px] text-stone-800 dark:text-stone-100 whitespace-nowrap">
                            {s.tenThanh ? <span className="font-normal text-stone-500 mr-1">{s.tenThanh}</span> : null}
                            {s.hoTen}
                          </span>
                        </div>
                      </td>
                      {scoreFields.map((f, colIdx) => (
                        <td key={f.key} className="px-1 py-1 border-r border-stone-200/50 dark:border-stone-700/50 relative">
                          <motion.input
                            id={`input-${s.username}-${f.key}`}
                            variants={{ shake: { x: [-4, 4, -4, 4, 0], transition: { duration: 0.3 } } }}
                            animate={shakeField === `${s.username}-${f.key}` ? "shake" : ""}
                            type="text" inputMode="decimal"
                            value={g[f.key] ?? ""}
                            onChange={(e) => handleScoreChange(s.username, f.key, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, rowIdx, colIdx)}
                            disabled={isLocked}
                            className={`w-full text-center py-2.5 text-[15px] font-bold bg-transparent border-2 border-transparent focus:outline-none focus:border-amber-500 rounded-lg transition-all ${
                              shakeField === `${s.username}-${f.key}` ? "border-red-500 bg-red-50 text-red-700" : "text-stone-800 dark:text-stone-100 hover:bg-stone-100/50 dark:hover:bg-stone-800/50"
                            } disabled:opacity-50`}
                          />
                        </td>
                      ))}
                      <td className={`px-1 py-1 relative ${theme.bg} transition-colors`}>
                        <div className="flex items-center justify-center gap-1">
                          <motion.input
                            id={`input-${s.username}-diem_tb`}
                            variants={{ shake: { x: [-4, 4, -4, 4, 0] } }}
                            animate={shakeField === `${s.username}-diem_tb` ? "shake" : ""}
                            type="text" inputMode="decimal"
                            value={g.diem_tb ?? ""}
                            onChange={(e) => handleScoreChange(s.username, "diem_tb", e.target.value, true)}
                            onKeyDown={(e) => handleKeyDown(e, rowIdx, scoreFields.length)}
                            disabled={isLocked}
                            className={`w-16 text-center py-2.5 text-[16px] font-black bg-transparent border-2 border-transparent focus:outline-none focus:border-amber-500 rounded-lg transition-all ${theme.text} ${manualTB[s.username] ? "border-amber-500/50 border-dashed" : ""} hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-50`}
                          />
                          {manualTB[s.username] && (
                            <button onClick={() => resetTBAuto(s.username)} className="absolute right-1 p-1 text-stone-400 hover:text-amber-600 transition-colors" title="Tính tự động">
                              <RefreshCw className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* INFO FOOTER */}
          {rosterStudents.length > 0 && (
            <div className="mt-8 mx-4 sm:mx-6 mb-2 px-4 py-3 bg-stone-100/50 dark:bg-stone-800/50 border border-stone-200/50 dark:border-stone-700/50 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-md">
              <div className="flex flex-wrap justify-center sm:justify-start items-center gap-3 sm:gap-4 text-[13px] font-medium text-stone-500 dark:text-stone-400">
                <span className="font-bold text-stone-800 dark:text-stone-200">Màu sắc Điểm TB:</span>
                <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span><span>Giỏi (≥8.0)</span></div>
                <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span><span>Khá/TB (6.5-7.9)</span></div>
                <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500"></span><span>Yếu (&lt;5.0)</span></div>
              </div>
              <div className="flex flex-wrap justify-center sm:justify-end items-center gap-3 sm:gap-4 text-[14px] font-bold w-full sm:w-auto mt-2 sm:mt-0">
                <div className="px-4 py-1.5 bg-stone-200/50 dark:bg-stone-700/50 rounded-xl text-stone-600 dark:text-stone-300">Sĩ số: {rosterStudents.length}</div>
                <div className="px-4 py-1.5 bg-amber-900 text-amber-50 dark:bg-amber-100 dark:text-amber-900 rounded-xl">Trung bình lớp: {classAverage}</div>
              </div>
            </div>
          )}
        </>
      )}

      {/* FLOATING SAVE BUTTON */}
      {createPortal(
        <AnimatePresence>
          {changedCount > 0 && !isLocked && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="fixed bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 z-[90]"
            >
              <button type="button" onClick={triggerSave} disabled={saving}
                className="flex items-center gap-2.5 px-6 py-3.5 rounded-full shadow-2xl bg-amber-900 text-amber-50 dark:bg-amber-600 dark:text-white font-bold text-[15px] hover:scale-105 active:scale-95 transition-all duration-300">
                {saving ? <Spinner className="w-5 h-5" /> : <Check className="w-5 h-5 drop-shadow-sm" />}
                {saving ? "Đang lưu…" : `Lưu thay đổi (${changedCount})`}
              </button>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* CONFIRM MODAL */}
      {createPortal(
        <AnimatePresence>
          {showConfirmModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setShowConfirmModal(false)}
                className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="relative w-full max-w-sm bg-white dark:bg-stone-800 rounded-3xl shadow-2xl overflow-hidden border border-stone-200/50 dark:border-stone-700/50"
              >
                <div className="p-6">
                  <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center mb-4">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-extrabold text-stone-800 dark:text-stone-100 mb-2 font-serif">Xác nhận thay đổi?</h3>
                  <p className="text-[14px] text-stone-500 dark:text-stone-400 mb-6 leading-relaxed">
                    Bạn đang cập nhật điểm của <strong>{changedCount}</strong> học sinh. Hành động này sẽ được ghi nhận vào hệ thống.
                  </p>
                  <div className="flex gap-3">
                    <button type="button" onClick={() => setShowConfirmModal(false)}
                      className="flex-1 px-4 py-3 rounded-xl font-bold text-stone-600 dark:text-stone-300 bg-stone-100 dark:bg-stone-700/50 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors">
                      Hủy bỏ
                    </button>
                    <button type="button" onClick={confirmSave}
                      className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-amber-600 hover:bg-amber-700 shadow-sm transition-colors">
                      Lưu
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </motion.div>
  );
}