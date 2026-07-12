import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Table, ArrowLeft } from "lucide-react";
import { supabase } from "../../lib/supabase.js";
import { useToast } from "../ui/ToastContext.jsx";
import { Spinner } from "../ui/StudentShared.jsx";
import { useTeacherContext } from "./TeacherContext.jsx";
import { fetchClassTermRanges, fetchTermLocks } from "./api.js";
import { sortStudentsByTen, mostRecentSunday, resolveActiveHocKy, computeDiemTB, tbColorClass } from "./utils.js";
import { ACCENT, HK_INT_MAP, GRADE_FIELDS } from "./constants.js";

/* ============================================================
   NHẬP ĐIỂM NHANH — dạng bảng tính, Enter/↓ nhảy xuống học sinh kế
   tiếp trong cùng cột, tự động tính điểm TB theo công thức nhưng vẫn
   cho phép sửa tay (ô sẽ viền cam khi đã override).
   ============================================================ */
export default function GradesTab() {
  const { students, context } = useTeacherContext();
  const namHoc = context.namHoc;
  const lop    = context.lop;
  const { showToast } = useToast();
  const navigate = useNavigate();
  const onBack = () => navigate("../tổng-quan");

  const [hocKy, setHocKy] = useState("HK1");
  const hocKyInt           = HK_INT_MAP[hocKy];
  const [rows,    setRows]    = useState({}); // username -> { diem_mieng, ..., diem_tb }
  const [initial, setInitial] = useState({});
  const [manualTB, setManualTB] = useState({}); // username -> true nếu điểm TB đã bị sửa tay
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  // Trạng thái khóa sổ theo học kỳ.
  const [termLocks, setTermLocks] = useState({});
  const isLocked = !!termLocks[hocKyInt];
  const cellRefs = useRef({});
  const didAutoSelectHocKy = useRef(false);

  // Danh sách cố định, xếp theo Tên (không theo Họ) — cùng thứ tự với bảng điểm danh nhanh
  const rosterStudents = useMemo(() => sortStudentsByTen(students), [students]);

  // Tự chọn học kỳ hiện tại dựa trên ngày bắt đầu HK2 của lớp (giống Điểm danh nhanh)
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

  // Tải trạng thái khóa sổ của lớp (cả HK1 + HK2) 1 lần, không phụ thuộc hocKy đang chọn.
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
          // Nếu điểm TB đã lưu khác với công thức tự tính -> coi như giáo viên
          // từng sửa tay, giữ nguyên khi vừa tải để không âm thầm ghi đè.
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
    <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-100 dark:border-stone-800 shadow-sm overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4 border-b border-stone-100 dark:border-stone-800">
        <button type="button" onClick={onBack}
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 flex-shrink-0">
          <ArrowLeft className="w-4 h-4" /> Quay lại
        </button>
        <div className="hidden sm:block w-px h-5 bg-stone-200 dark:bg-stone-800" />
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <Table className="w-4 h-4 flex-shrink-0" style={{ color: ACCENT }} />
          <div className="flex gap-1 bg-stone-100 dark:bg-stone-800 rounded-xl p-1">
            {["HK1", "HK2"].map((k) => (
              <button key={k} type="button" onClick={() => setHocKy(k)}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors ${
                  hocKy === k ? "bg-white dark:bg-stone-700 text-[#FF6B35] dark:text-orange-400 shadow-sm" : "text-stone-500 dark:text-stone-400"
                }`}>
                {k === "HK1" ? "Học Kỳ I" : "Học Kỳ II"}
              </button>
            ))}
          </div>
          <span className="text-[11px] text-stone-400 dark:text-stone-500 hidden md:inline">
            Enter hoặc ↓ để nhảy xuống học sinh tiếp theo
          </span>
        </div>
        <button type="button" disabled={isLocked || saving || changedCount === 0} onClick={save}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF6B35] text-white text-[13px] font-bold hover:bg-[#E85E28] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0 w-full sm:w-auto">
          {saving && <Spinner className="h-4 w-4" />}
          {saving ? "Đang lưu…" : changedCount > 0 ? `Lưu (${changedCount} thay đổi)` : "Lưu bảng điểm"}
        </button>
      </div>

      {isLocked && (
        <div className="px-5 py-2.5 border-b border-stone-100 dark:border-stone-800 bg-stone-100 dark:bg-stone-800 text-[12px] text-stone-600 dark:text-stone-300">
          🔒 Học kỳ này đã bị khóa sổ — chỉ xem được, không nhập điểm được cho đến khi admin mở khóa lại.
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center gap-2.5 py-14" style={{ color: ACCENT }}>
          <Spinner className="h-5 w-5" />
          <span className="text-sm text-stone-500 dark:text-stone-400">Đang tải bảng điểm…</span>
        </div>
      ) : (
        <>
          {/* MOBILE: mỗi học sinh 1 thẻ, các ô điểm xếp lưới để chạm dễ hơn bảng ngang */}
          <div className={`md:hidden divide-y divide-stone-50 dark:divide-stone-850 ${isLocked ? "opacity-60 pointer-events-none" : ""}`} data-lenis-prevent>
            {rosterStudents.map((s, rowIdx) => {
              const g = rows[s.username] ?? {};
              const isDirty = JSON.stringify(g) !== JSON.stringify(initial[s.username]);
              return (
                <div key={s.username} className={`px-4 py-3.5 ${isDirty ? "bg-orange-50/30 dark:bg-orange-950/10" : ""}`}>
                  <div className="flex items-center gap-2.5 mb-3">
                    <span className="text-[11px] font-medium text-stone-400 dark:text-stone-550 w-4 flex-shrink-0 text-center">{rowIdx + 1}</span>
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-stone-200 dark:border-stone-800 flex-shrink-0 bg-stone-100 dark:bg-stone-800">
                      <img src={s.avatar || "/images/avatarDefault.avif"} alt="" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-[13px] font-semibold text-stone-800 dark:text-stone-200 truncate min-w-0 flex-1">
                      {s.tenThanh ? `${s.tenThanh} ` : ""}{s.hoTen}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 pl-[42px]">
                    {scoreFields.map((f) => (
                      <label key={f.key} className="flex flex-col gap-1">
                        <span className="text-[10px] text-stone-400 dark:text-stone-500 font-medium">{f.label}</span>
                        <input
                          type="number" min="0" max="10" step="0.1" inputMode="decimal"
                          value={g[f.key] ?? ""}
                          onChange={(e) => updateCell(s.username, f.key, e.target.value)}
                          className="w-full text-center rounded-lg border border-stone-200 dark:border-stone-750 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 py-2 text-[14px] font-medium focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                        />
                      </label>
                    ))}
                    <label className="flex flex-col gap-1">
                      <span className="text-[10px] text-stone-400 dark:text-stone-500 font-medium">TB</span>
                      <div className="flex items-center gap-1">
                        <input
                          type="number" min="0" max="10" step="0.01" inputMode="decimal"
                          value={g.diem_tb ?? ""}
                          onChange={(e) => updateTBManual(s.username, e.target.value)}
                          className={`w-full text-center rounded-lg border py-2 text-[14px] font-bold focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent ${tbColorClass(g.diem_tb)} ${
                            manualTB[s.username] ? "border-[#FF6B35] bg-orange-50/40 dark:bg-orange-950/20" : "border-stone-200 dark:border-stone-750 bg-white dark:bg-stone-900"
                          }`}
                        />
                        {manualTB[s.username] && (
                          <button type="button" title="Tính lại tự động" onClick={() => resetTBAuto(s.username)}
                            className="text-[13px] text-stone-400 dark:text-stone-505 hover:text-[#FF6B35] flex-shrink-0">↺</button>
                        )}
                      </div>
                    </label>
                  </div>
                </div>
              );
            })}
            {rosterStudents.length === 0 && (
              <p className="text-center text-sm text-stone-400 dark:text-stone-550 py-10 px-4">Lớp chưa có học sinh nào.</p>
            )}
          </div>

          {/* DESKTOP: bảng tính, Enter/↓ nhảy dòng */}
          <div className={`hidden md:block overflow-auto max-h-[65vh] ${isLocked ? "opacity-60 pointer-events-none" : ""}`} data-lenis-prevent>
            <table className="w-full text-sm border-collapse min-w-[760px]">
              <thead>
                <tr className="bg-[#F9F9F9] dark:bg-stone-850 text-[11px] text-stone-400 dark:text-stone-550 uppercase tracking-wide">
                  <th className="text-center font-semibold px-3 py-3 sticky top-0 left-0 bg-[#F9F9F9] dark:bg-stone-850 z-20 w-12">STT</th>
                  <th className="text-left font-semibold px-4 py-3 sticky top-0 left-[48px] bg-[#F9F9F9] dark:bg-stone-850 z-20">Họ & Tên</th>
                  {scoreFields.map((f) => (
                    <th key={f.key} className="font-semibold px-2 py-3 text-center min-w-[84px] sticky top-0 bg-[#F9F9F9] dark:bg-stone-850 z-10">{f.label}</th>
                  ))}
                  <th className="font-semibold px-2 py-3 text-center min-w-[90px] sticky top-0 bg-[#F9F9F9] dark:bg-stone-850 z-10">TB</th>
                </tr>
              </thead>
              <tbody>
                {rosterStudents.map((s, rowIdx) => {
                  const g = rows[s.username] ?? {};
                  const isDirty = JSON.stringify(g) !== JSON.stringify(initial[s.username]);
                  const rowBg   = isDirty ? "bg-orange-50/30 dark:bg-orange-950/10" : "bg-white dark:bg-stone-900";
                  return (
                    <tr key={s.username} className="border-b border-stone-50 dark:border-stone-850">
                      <td className={`px-3 py-2 text-center sticky left-0 z-10 text-[12px] font-medium text-stone-400 dark:text-stone-550 w-12 ${rowBg}`}>
                        {rowIdx + 1}
                      </td>
                      <td className={`px-4 py-2 sticky left-[48px] z-10 ${rowBg}`}>
                        <div className="flex items-center gap-2.5 min-w-[160px]">
                          <div className="w-7 h-7 rounded-full overflow-hidden border border-stone-200 dark:border-stone-800 flex-shrink-0 bg-stone-100 dark:bg-stone-800">
                            <img src={s.avatar || "/images/avatarDefault.avif"} alt="" className="w-full h-full object-cover" />
                          </div>
                          <span className="text-[13px] font-semibold text-stone-800 dark:text-stone-200 truncate">{s.tenThanh ? `${s.tenThanh} ` : ""}{s.hoTen}</span>
                        </div>
                      </td>
                      {scoreFields.map((f) => (
                        <td key={f.key} className="px-2 py-2 text-center">
                          <input
                            ref={(el) => { cellRefs.current[`${s.username}-${f.key}`] = el; }}
                            type="number" min="0" max="10" step="0.1"
                            value={g[f.key] ?? ""}
                            onChange={(e) => updateCell(s.username, f.key, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, rowIdx, f.key)}
                            className="w-16 text-center rounded-lg border border-stone-200 dark:border-stone-750 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 py-1.5 text-[13px] font-medium focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                          />
                        </td>
                      ))}
                      <td className="px-2 py-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <input
                            ref={(el) => { cellRefs.current[`${s.username}-diem_tb`] = el; }}
                            type="number" min="0" max="10" step="0.01"
                            value={g.diem_tb ?? ""}
                            onChange={(e) => updateTBManual(s.username, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, rowIdx, "diem_tb")}
                            className={`w-16 text-center rounded-lg border py-1.5 text-[13px] font-bold focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent ${tbColorClass(g.diem_tb)} ${
                              manualTB[s.username] ? "border-[#FF6B35] bg-orange-50/40 dark:bg-orange-950/20" : "border-stone-200 dark:border-stone-750 bg-white dark:bg-stone-900"
                            }`}
                          />
                          {manualTB[s.username] && (
                            <button type="button" title="Tính lại tự động" onClick={() => resetTBAuto(s.username)}
                              className="text-[11px] text-stone-400 dark:text-stone-505 hover:text-[#FF6B35] flex-shrink-0">↺</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      <div className="px-5 py-3 border-t border-stone-100 dark:border-stone-800 bg-[#F9F9F9] dark:bg-stone-850/50 text-[11px] text-stone-400 dark:text-stone-500">
        Điểm TB tự tính theo công thức: Miệng×1, Vở×1, 15'×1, 1 Tiết×2, Thi×3 — có thể sửa tay (ô sẽ viền cam), bấm ↺ để tính lại tự động.
      </div>
    </div>
  );
}