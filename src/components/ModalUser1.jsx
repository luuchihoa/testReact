import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { modalVariant, pressable } from "./ui/variant.jsx";
import { useToast } from "./ui/ToastContext.jsx";
import { createPortal } from "react-dom";
import { ExitButton } from "./ui/Feedback.jsx";
import Backdrop from "./ui/Backdrop.jsx";

const API_URL =
  "https://script.google.com/macros/s/AKfycbxGHSrh9HCFcKxfPqDnmYuMRxRHeoIeztowkZ6km8SKiJikm0AXioNWek97vhUlO6A/exec";

const SCORES_API_URL =
  "https://script.google.com/macros/s/AKfycbz9EIf1zX4_kA8TfGk6dao48y5CbjJpdYGjOEu_jrV-lpueeFnuYBKXnimawMW7pCSzpw/exec";

const PROFILE_FIELDS = [
  "username","tenThanh","hoTen","ngaySinh","ngayRuaToi",
  "avatar","giaoXom","gioiTinh","ngayRuocLe","ngayThemSuc",
  "sdt","tenCha","tenMe",
];

function transferDateForView(value) {
  if (!value) return "";
  const d = new Date(value);
  return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;
}

function Spinner({ className = "h-4 w-4" }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
    </svg>
  );
}

// ====================== CHANGE PASSWORD =========================
export function ChangePassword({ setIsOpenChangePass }) {
  const { showToast } = useToast();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);
  const [show, setShow] = useState({ old: false, new: false, confirm: false });

  const close = () => setIsOpenChangePass(false);

  const submit = async () => {
    const username = localStorage.getItem("username");
    if (!oldPassword || !newPassword || !confirmPassword)
      return showToast("Vui lòng nhập đầy đủ thông tin", "warning");
    if (newPassword.length < 8)
      return showToast("Mật khẩu mới phải ≥ 8 ký tự", "warning");
    if (newPassword !== confirmPassword)
      return showToast("Mật khẩu mới không khớp", "warning");
    if (newPassword.includes(" "))
      return showToast("Mật khẩu không được chứa dấu cách", "warning");

    setSaveLoading(true);
    try {
      // FIX #7: Apps Script nhận qua query string thay vì POST body JSON
      const params = new URLSearchParams({
        action: "changePassword", username, oldPassword, newPassword,
      });
      const res = await fetch(`${API_URL}?${params}`);
      const data = await res.json();
      if (!data.success) { showToast("Mật khẩu hiện tại không đúng", "error"); return; }
      showToast("Đổi mật khẩu thành công", "success");
      close();
    } catch {
      showToast("Lỗi kết nối server", "warning");
    } finally {
      setSaveLoading(false);
    }
  };

  const fields = [
    { id: "old",     label: "Mật khẩu hiện tại",    placeholder: "Nhập mật khẩu hiện tại", value: oldPassword, set: setOldPassword, showKey: "old",     autoFocus: true },
    { id: "new",     label: "Mật khẩu mới",          placeholder: "Tối thiểu 8 ký tự",      value: newPassword, set: setNewPassword, showKey: "new"     },
    { id: "confirm", label: "Nhập lại mật khẩu mới", placeholder: "Nhập lại mật khẩu",      value: confirmPassword, set: setConfirmPassword, showKey: "confirm" },
  ];

  return createPortal(
    <Backdrop handleClose={saveLoading ? undefined : close}>
      <motion.div
        {...modalVariant()}
        className="w-full max-w-md mx-4 rounded-3xl bg-white overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* accent bar */}
        <div className="h-1 bg-gradient-to-r from-[#FF6B35] via-[#FF8C5A] to-[#FF6B35]" />

        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FFF0E8] flex items-center justify-center text-xl">🔒</div>
              <div>
                <h2 className="text-[17px] font-bold text-gray-900 leading-tight">Đổi mật khẩu</h2>
                <p className="text-[12px] text-gray-400 mt-0.5">Tối thiểu 8 ký tự, không có dấu cách</p>
              </div>
            </div>
            <button
              onClick={close} disabled={saveLoading}
              className="w-8 h-8 rounded-full bg-[#F2F2F7] hover:bg-[#E5E5EA] text-gray-500 text-[13px] font-bold flex items-center justify-center transition-colors active:scale-90 disabled:opacity-40"
            >✕</button>
          </div>

          <div className="flex flex-col gap-3.5">
            {fields.map((f) => (
              <div key={f.id}>
                <label className="text-[12px] font-semibold text-gray-500 uppercase tracking-wide">{f.label}</label>
                <div className="relative mt-1.5">
                  <input
                    type={show[f.showKey] ? "text" : "password"}
                    placeholder={f.placeholder}
                    value={f.value}
                    onChange={(e) => f.set(e.target.value)}
                    autoFocus={f.autoFocus}
                    disabled={saveLoading}
                    className="w-full rounded-2xl border border-[#E5E5EA] bg-[#F9F9F9] px-4 py-3 pr-14 text-[15px] text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent focus:bg-white transition-all disabled:opacity-60"
                  />
                  <button
                    type="button" tabIndex={-1}
                    onClick={() => setShow((v) => ({ ...v, [f.showKey]: !v[f.showKey] }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 rounded-lg text-[12px] font-semibold text-gray-400 hover:text-[#FF6B35] hover:bg-[#FFF0E8] transition-colors"
                  >{show[f.showKey] ? "Ẩn" : "Hiện"}</button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex gap-3">
            <motion.button
              {...(saveLoading ? {} : pressable())} disabled={saveLoading} onClick={close}
              className="flex-1 py-3 rounded-2xl bg-[#F2F2F7] text-gray-700 text-[14px] font-semibold hover:bg-[#E5E5EA] transition-colors disabled:opacity-40"
            >Hủy</motion.button>
            <motion.button
              {...(saveLoading ? {} : pressable())} disabled={saveLoading} onClick={submit}
              className="flex-1 py-3 rounded-2xl bg-[#FF6B35] text-white text-[14px] font-bold hover:bg-[#E85E28] transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {saveLoading && <Spinner />}
              {saveLoading ? "Đang lưu…" : "Lưu thay đổi"}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </Backdrop>,
    document.getElementById("modal-user")
  );
}

// ====================== SAVE CONFIRM =========================
export function SaveBox({ setIsSaveBoxOn, user, setIsAnyChange, onSaveSuccess }) {
  const { showToast } = useToast();
  const [isSaveData, setIsSaveData] = useState(false);

  const close = () => setIsSaveBoxOn(false);

  const confirm = async () => {
    setIsSaveData(true);
    try {
      const res = await fetch(`${API_URL}?action=updateprofile&data=${encodeURIComponent(JSON.stringify(user))}`);
      const result = await res.json();
      if (!result.success) { showToast("Lưu dữ liệu thất bại", "error"); return; }
      showToast("Lưu dữ liệu thành công", "success");
      localStorage.setItem("user", JSON.stringify(user));
      setIsAnyChange(false);
      onSaveSuccess?.(); // FIX #5: callback thay vì isSave state
      close();
    } catch {
      showToast("Lỗi kết nối server", "error");
    } finally {
      setIsSaveData(false);
    }
  };

  return createPortal(
    <Backdrop handleClose={isSaveData ? undefined : close}>
      <motion.div
        {...modalVariant()}
        className="bg-white w-full max-w-sm mx-4 rounded-3xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-1 bg-gradient-to-r from-[#FF6B35] via-[#FF8C5A] to-[#FF6B35]" />
        <div className="p-6">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-3xl bg-[#FFF0E8] flex items-center justify-center text-3xl shadow-inner">💾</div>
          </div>
          <h3 className="text-[18px] font-bold text-gray-900 mb-1.5 text-center">
            {isSaveData ? "Đang xử lý…" : "Lưu thông tin?"}
          </h3>
          {!isSaveData && (
            <p className="text-[13px] text-gray-400 mb-6 text-center leading-relaxed">
              Thông tin chỉnh sửa sẽ được cập nhật vào hệ thống.
            </p>
          )}
          {isSaveData && (
            <div className="flex items-center justify-center gap-2.5 text-[#FF6B35] mb-6">
              <Spinner className="h-5 w-5" />
              <span className="text-[14px] font-medium">Đang lưu dữ liệu...</span>
            </div>
          )}
          <div className="flex gap-3">
            <motion.button
              {...(isSaveData ? {} : pressable())} disabled={isSaveData} onClick={close}
              className="flex-1 py-3 rounded-2xl bg-[#F2F2F7] text-gray-700 text-[14px] font-semibold hover:bg-[#E5E5EA] transition-colors disabled:opacity-40"
            >Hủy</motion.button>
            <motion.button
              {...(isSaveData ? {} : pressable())} disabled={isSaveData} onClick={confirm}
              className="flex-1 py-3 rounded-2xl bg-[#FF6B35] text-white text-[14px] font-bold hover:bg-[#E85E28] transition-colors disabled:opacity-70"
            >Lưu</motion.button>
          </div>
        </div>
      </motion.div>
    </Backdrop>,
    document.getElementById("modal-user")
  );
}

// ====================== PROFILE FIELD ROW =========================
const GENDER_ICON = { "": "👤", "Nam": "👦🏻", "Nữ": "👧🏻" };

function FieldRow({ icon, label, field, value, displayValue, type = "text", editingField, tempValue, setTempValue, onEdit, onBlur, options }) {
  const isEditing = editingField === field;
  return (
    <div className={`flex items-center justify-between rounded-2xl px-4 py-3.5 transition-colors ${isEditing ? "bg-[#FFF8F5] ring-2 ring-[#FF6B35]/30" : "bg-[#F9F9F9] hover:bg-[#F4F4F4]"}`}>
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        <span className="text-lg flex-shrink-0 w-6 text-center">{icon}</span>
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">{label}</div>
          {!isEditing && (
            <div className="text-[14px] font-semibold text-gray-900 truncate">
              {displayValue ?? value ?? <span className="text-gray-300 font-normal">Chưa cập nhật</span>}
            </div>
          )}
          {isEditing && options && (
            <select
              value={tempValue} onChange={(e) => setTempValue(e.target.value)} onBlur={onBlur} autoFocus
              className="mt-0.5 px-2.5 py-1.5 rounded-xl border border-[#FF6B35]/50 text-[14px] bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B35] w-full"
            >
              {options.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          )}
          {isEditing && !options && (
            <input
              type={type} value={tempValue}
              onChange={(e) => setTempValue(e.target.value)} onBlur={onBlur} autoFocus
              className="mt-0.5 px-2.5 py-1.5 rounded-xl border border-[#FF6B35]/50 text-[14px] bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B35] w-full"
            />
          )}
        </div>
      </div>
      {!isEditing && (
        <motion.button
          {...pressable(1.15)} onClick={onEdit}
          className="flex-shrink-0 w-8 h-8 rounded-full hover:bg-[#FFE8DC] flex items-center justify-center text-[14px] transition-colors ml-2"
        >✏️</motion.button>
      )}
    </div>
  );
}

// ====================== PROFILE =========================
export function Profile({ handleLogout, user, setUser, setIsAnyChange, onSaveSuccess }) {
  const [editingField, setEditingField] = useState(null);
  const [tempValue, setTempValue] = useState("");
  const [isSaveBoxOn, setIsSaveBoxOn] = useState(false);
  const [isOpenChangePass, setIsOpenChangePass] = useState(false);

  const editField = (field) => (e) => {
    e.preventDefault();
    setEditingField(field);
    setTempValue(user[field] ?? "");
  };

  const handleBlur = (field) => {
    if (tempValue !== user[field]) setIsAnyChange(true);
    setUser((prev) => ({ ...prev, [field]: tempValue }));
    setEditingField(null);
    setTempValue("");
  };

  const rows = [
    { icon: GENDER_ICON[user.gioiTinh] ?? "👤", label: "Họ và tên",       field: "hoTen" },
    { icon: "✝️",                                 label: "Tên Thánh",       field: "tenThanh" },
    { icon: "🎂",                                 label: "Ngày sinh",       field: "ngaySinh",   type: "date", displayValue: transferDateForView(user.ngaySinh) },
    { icon: "💦",                                 label: "Ngày Rửa Tội",   field: "ngayRuaToi", type: "date", displayValue: transferDateForView(user.ngayRuaToi) },
    { icon: "🫓",                                 label: "Ngày Rước Lễ",   field: "ngayRuocLe", type: "date", displayValue: transferDateForView(user.ngayRuocLe) },
    { icon: "🕊️",                                label: "Ngày Thêm Sức",  field: "ngayThemSuc",type: "date", displayValue: transferDateForView(user.ngayThemSuc) },
    { icon: "👨🏻",                               label: "Họ & Tên Cha",    field: "tenCha" },
    { icon: "👩🏻",                               label: "Họ & Tên Mẹ",    field: "tenMe" },
    { icon: "📞",                                 label: "Số điện thoại",   field: "sdt" },
    { icon: "🏠",                                 label: "Giáo Xóm",        field: "giaoXom" },
    { icon: "⚧️",                                label: "Giới tính",        field: "gioiTinh",   options: ["Nam","Nữ"] },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Info grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {rows.map((r) => (
          <FieldRow
            key={r.field} {...r}
            value={user[r.field]}
            editingField={editingField} tempValue={tempValue}
            setTempValue={setTempValue}
            onEdit={editField(r.field)}
            onBlur={() => handleBlur(r.field)}
          />
        ))}

        {/* Password row */}
        <div className="flex items-center justify-between bg-[#F9F9F9] hover:bg-[#F4F4F4] rounded-2xl px-4 py-3.5 transition-colors">
          <div className="flex items-center gap-3.5">
            <span className="text-lg w-6 text-center">🔒</span>
            <div>
              <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Mật khẩu</div>
              <div className="text-[14px] font-semibold text-gray-900 tracking-widest">••••••••</div>
            </div>
          </div>
          <motion.button
            {...pressable()}
            onClick={() => setIsOpenChangePass(true)}
            className="text-[12px] font-semibold px-3 py-1.5 rounded-xl bg-[#F2F2F7] text-gray-600 hover:bg-[#E5E5EA] transition-colors"
          >Thay đổi</motion.button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-1">
        <motion.button
          {...pressable()}
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[13px] font-semibold text-[#FF375F] bg-[#FFF1F3] hover:bg-[#FFE4E8] transition-colors"
        >
          <span>🚪</span> Đăng xuất
        </motion.button>

        <motion.button
          {...pressable()}
          onClick={() => setIsSaveBoxOn(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#FF6B35] text-white text-[13px] font-bold hover:bg-[#E85E28] transition-colors shadow-sm shadow-[#FF6B35]/30"
        >
          <span>💾</span> Lưu thông tin
        </motion.button>
      </div>

      <AnimatePresence>
        {isSaveBoxOn && (
          <SaveBox
            setIsSaveBoxOn={setIsSaveBoxOn} user={user}
            setIsAnyChange={setIsAnyChange} onSaveSuccess={onSaveSuccess}
          />
        )}
        {isOpenChangePass && <ChangePassword setIsOpenChangePass={setIsOpenChangePass} />}
      </AnimatePresence>
    </div>
  );
}

// ====================== ACHIEVEMENT CONSTANTS =========================
const SEMESTERS = {
  HK1: { start: new Date(2025,8,14), end: new Date(2026,0,24) },
  HK2: { start: new Date(2026,0,25), end: new Date(2026,4,30) },
};

const RANK_COLORS = {
  hocLuc:   { "Giỏi":"text-[#34C759]","Khá":"text-[#007AFF]","Trung Bình":"text-[#FFD60A]","Yếu":"text-[#FF9500]","Kém":"text-[#FF375F]" },
  hanhKiem: { "Tốt":"text-[#34C759]","Khá":"text-[#007AFF]","Trung Bình":"text-[#FFD60A]","Yếu":"text-[#FF375F]" },
};

const ATTENDANCE_STATUS = {
  0:    { color:"bg-[#34C759]",                                  label:"Có mặt" },
  1:    { color:"bg-[#FFD60A]",                                  label:"Nghỉ có phép" },
  2:    { color:"bg-[#FF375F]",                                  label:"Nghỉ không phép" },
  3:    { color:"bg-[#93C5FD]",                                  label:"Ngày nghỉ lễ" },
  null: { color:"bg-[#E5E5EA] border border-dashed border-[#C7C7CC]", label:"Chưa cập nhật" },
};

const GL_HOCLUC_COMMENTS = {
  "Giỏi":       ["Em tiếp thu giáo lý rất tốt, hiểu bài nhanh và biết áp dụng giáo huấn vào đời sống.","Em học giáo lý nghiêm túc, nắm vững nội dung và có tinh thần chia sẻ trong lớp.","Em có khả năng hiểu sâu giáo lý và thể hiện đức tin qua hành vi cụ thể."],
  "Khá":        ["Em nắm được nội dung giáo lý và tham gia học tập khá đều đặn.","Em có ý thức học giáo lý, cần mạnh dạn hơn khi phát biểu và chia sẻ.","Em hiểu bài và có tinh thần hợp tác tốt trong các sinh hoạt lớp."],
  "Trung Bình": ["Em hiểu được những nội dung giáo lý cơ bản, cần cố gắng hơn trong việc ôn bài.","Em cần chú ý hơn trong giờ học để hiểu sâu và nhớ lâu giáo lý.","Em nên dành thêm thời gian học bài để theo kịp chương trình."],
  "Yếu":        ["Em còn gặp khó khăn trong việc tiếp thu giáo lý, cần được quan tâm và nhắc nhở thêm.","Em cần cố gắng hơn trong việc học và tham dự các buổi giáo lý.","Em nên chủ động hơn trong việc học bài và hỏi khi chưa hiểu."],
  "Kém":        ["Em chưa theo kịp chương trình giáo lý, cần sự đồng hành của gia đình và giáo lý viên.","Em cần được quan tâm nhiều hơn để cải thiện việc học giáo lý.","Em cần sắp xếp thời gian học giáo lý nghiêm túc hơn."],
};

const GL_HANHKIEM_COMMENTS = {
  "Tốt":        ["Em ngoan ngoãn, lễ phép và tham dự tích cực các buổi học giáo lý.","Em có tinh thần vâng lời và ý thức giữ kỷ luật tốt.","Em sống chan hòa, biết tôn trọng bạn bè và giáo lý viên."],
  "Khá":        ["Em chấp hành nội quy lớp khá tốt, cần chủ động hơn trong sinh hoạt.","Em có ý thức giữ kỷ luật, cần cố gắng duy trì sự đều đặn.","Em cư xử đúng mực, cần phát huy tinh thần tự giác hơn."],
  "Trung Bình": ["Em cần rèn luyện thêm tính tự giác và chú ý hơn trong giờ học.","Em tham dự chưa đều, cần cố gắng sắp xếp thời gian tốt hơn.","Em cần nghiêm túc hơn trong các sinh hoạt của lớp."],
  "Yếu":        ["Em tham dự chưa nghiêm túc, cần được nhắc nhở và đồng hành thêm.","Em cần cố gắng hơn trong việc giữ kỷ luật và tham dự học giáo lý.","Em cần sự phối hợp của gia đình để giúp em tiến bộ."],
};

function pickRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function getCurrentSemester(date = new Date()) {
  if (date >= SEMESTERS.HK1.start && date <= SEMESTERS.HK1.end) return "HK1";
  if (date >= SEMESTERS.HK2.start && date <= SEMESTERS.HK2.end) return "HK2";
  return "HK1";
}

function StatCard({ label, value, colorClass = "text-gray-900" }) {
  return (
    <div className="bg-white rounded-2xl border border-[#F0F0F0] shadow-sm p-4">
      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">{label}</p>
      <p className={`text-[22px] font-bold ${colorClass}`}>{value || "—"}</p>
    </div>
  );
}

function ScoreCell({ label, value }) {
  return (
    <div className="bg-[#F9F9F9] rounded-xl px-3 py-2.5 text-center flex-1 min-w-[64px]">
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-[16px] font-bold text-gray-900">{value || "—"}</p>
    </div>
  );
}

// ====================== ACHIEVEMENT =========================
export function Achievement({ user, studentData }) {
  const [semester, setSemester] = useState("HK1");
  const [student, setStudent] = useState({});
  const [isFinal, setIsFinal] = useState(false);
  // FIX #4: loading & error states
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(false);

  const start = useMemo(() => SEMESTERS[semester]?.start ?? SEMESTERS.HK1.start, [semester]);

  const loadSemesterData = async (sms, cancelled) => {
    const username = user?.username;
    if (!username) return;

    setLoading(true);
    setFetchError(false);
    try {
      if (!studentData.current) {
        const res = await fetch(SCORES_API_URL, { cache: "no-store" });
        if (!res.ok) throw new Error("Fetch failed");
        const json = await res.json();
        // FIX #10: guard after await
        if (cancelled?.current) return;
        studentData.current = json;
        localStorage.setItem("studentData", JSON.stringify(json));
      }

      if (cancelled?.current) return;
      const list = studentData.current[sms] ?? [];
      const st = list.find((sv) => sv.username === username);
      if (!st) { setStudent({}); return; }
      setStudent(st);
      setIsFinal(st.hocLuc !== "-" && st.hanhKiem !== "-");
    } catch {
      if (!cancelled?.current) setFetchError(true);
    } finally {
      if (!cancelled?.current) setLoading(false);
    }
  };

  useEffect(() => {
    const cancelled = { current: false };
    loadSemesterData(semester, cancelled);
    return () => { cancelled.current = true; };
  }, [semester]);

  useEffect(() => {
    const saved = localStorage.getItem("studentData");
    if (saved) studentData.current = JSON.parse(saved);
    setSemester(getCurrentSemester());
  }, []);

  const hocLucText   = useMemo(() => pickRandom(GL_HOCLUC_COMMENTS[student.hocLuc]   || [""]), [student.hocLuc]);
  const hanhKiemText = useMemo(() => pickRandom(GL_HANHKIEM_COMMENTS[student.hanhKiem] || [""]), [student.hanhKiem]);
  const attendance   = student.attendance || [];

  return (
    <div className="flex flex-col gap-4">
      {/* HEADER */}
      <div className="bg-white rounded-2xl border border-[#F0F0F0] shadow-sm p-4 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-[17px] font-bold text-gray-900 truncate">{student.hoTen || "—"}</h1>
          <p className="text-[12px] text-gray-400 mt-0.5">
            {student.lopHoc || "Phụng Vụ 1/2"} · {student.khoaHoc || "2025 – 2026"}
          </p>
        </div>
        <select
          value={semester} onChange={(e) => setSemester(e.target.value)}
          className="flex-shrink-0 border border-[#E5E5EA] rounded-xl px-3 py-2 text-[13px] font-medium bg-[#F9F9F9] focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
        >
          <option value="HK1">Học kỳ I</option>
          <option value="HK2">Học kỳ II</option>
        </select>
      </div>

      {/* Loading / Error states */}
      {loading && (
        <div className="flex items-center justify-center gap-3 py-8 text-gray-400">
          <Spinner className="h-5 w-5" />
          <span className="text-[14px]">Đang tải dữ liệu…</span>
        </div>
      )}

      {fetchError && !loading && (
        <div className="bg-[#FFF1F3] rounded-2xl px-4 py-3 text-[13px] text-[#FF375F] font-medium text-center">
          ⚠️ Không tải được dữ liệu. Vui lòng thử lại sau.
        </div>
      )}

      {!loading && !fetchError && (
        <>
          {/* SUMMARY */}
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Điểm TB" value={student.diemTB} colorClass="text-[#007AFF]" />
            <StatCard label="Học lực"  value={student.hocLuc}  colorClass={RANK_COLORS.hocLuc[student.hocLuc]   || "text-gray-900"} />
            <StatCard label="Hạnh kiểm" value={student.hanhKiem} colorClass={RANK_COLORS.hanhKiem[student.hanhKiem] || "text-gray-900"} />
            <StatCard label="Vị thứ"   value={student.viThu}   colorClass="text-[#007AFF]" />
          </div>

          {/* STATUS BANNER */}
          <div className={`rounded-2xl px-4 py-3 text-[13px] font-medium ${isFinal ? "bg-[#EFF6FF] text-[#1D4ED8]" : "bg-[#FFF8E1] text-[#92700A]"}`}>
            {isFinal ? "ℹ️ Thông tin đã cập nhật đầy đủ!" : "⚠️ Điểm thi và điểm danh đang được cập nhật thêm"}
          </div>

          {/* ATTENDANCE */}
          <div className="bg-white rounded-2xl border border-[#F0F0F0] shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[15px] font-bold text-gray-900">
                Điểm danh <span className="text-gray-400 font-normal text-[13px]">({attendance.length || "—"} tuần)</span>
              </h2>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 mb-4">
              {Object.entries(ATTENDANCE_STATUS).filter(([k]) => k !== "null").map(([k, v]) => (
                <span key={k} className="flex items-center gap-1.5 text-[11px] text-gray-500">
                  <span className={`w-2.5 h-2.5 rounded-full ${v.color}`} />{v.label}
                </span>
              ))}
            </div>
            {attendance.length > 0 ? (
              <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-thin">
                {attendance.map((value, index) => {
                  const sunday = new Date(start);
                  sunday.setDate(start.getDate() + index * 7);
                  const status = ATTENDANCE_STATUS[value] ?? ATTENDANCE_STATUS[null];
                  return (
                    <div key={index} className="flex flex-col items-center gap-1.5 flex-shrink-0 w-11">
                      <span className={`w-7 h-7 rounded-full ${status.color}`} title={status.label} />
                      <span className="text-[10px] text-gray-400 whitespace-nowrap">
                        {sunday.getDate()}/{sunday.getMonth()+1}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-[13px] text-gray-400 text-center py-4">Chưa có dữ liệu điểm danh</p>
            )}
            <div className="mt-4 pt-4 border-t border-[#F0F0F0] flex flex-wrap gap-x-6 gap-y-1.5 text-[13px]">
              <span className="text-gray-500">Nghỉ không phép: <strong className="text-[#FF375F]">{student.nghiKhongPhep ?? "—"}</strong></span>
              <span className="text-gray-500">Nghỉ có phép: <strong className="text-[#92700A]">{student.nghiCoPhep ?? "—"}</strong></span>
              <span className="text-gray-500">Tổng nghỉ: <strong className="text-[#FF375F]">{student.tongBuoiVang ?? "—"}</strong></span>
            </div>
          </div>

          {/* SCORE DETAIL */}
          <div className="bg-white rounded-2xl border border-[#F0F0F0] shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[15px] font-bold text-gray-900">Bảng điểm chi tiết</h2>
              <span className="bg-[#EFF6FF] text-[#007AFF] text-[12px] font-bold px-2.5 py-1 rounded-full">
                TBM {student.diemTB || "—"}
              </span>
            </div>
            <p className="text-[13px] font-semibold text-gray-500 mb-3">Môn học: Phụng Vụ</p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              <ScoreCell label="Miệng"  value={student.diemMieng}  />
              <ScoreCell label="Vở"     value={student.diemVo}     />
              <ScoreCell label="15'"    value={student.diem15Phut} />
              <ScoreCell label="1 Tiết" value={student.diem1Tiet}  />
              <ScoreCell label="Thi"    value={student.diemThi}    />
            </div>
          </div>

          {/* COMMENT */}
          {isFinal && (
            <div className="bg-[#F9F9F9] rounded-2xl p-4 border border-[#F0F0F0]">
              <p className="text-[12px] font-bold text-gray-500 uppercase tracking-wide mb-2">Nhận xét Giáo lý viên</p>
              <p className="text-[13px] text-gray-600 leading-relaxed">
                {hocLucText} {hanhKiemText} Xin Chúa chúc lành và đồng hành cùng em trên hành trình đức tin!
              </p>
            </div>
          )}

          {/* VERSE CARD */}
          <div className="bg-white rounded-3xl border border-[#FCE7F3] p-6 text-center">
            <div className="text-4xl mb-3">🌸</div>
            <p className="text-[15px] font-semibold text-gray-700 leading-relaxed italic">
              "Mọi việc anh em làm,<br/>hãy làm trong tình yêu thương."
            </p>
            <p className="mt-2 text-[12px] text-gray-400">(1 Cr 16,14)</p>
            <div className="mt-4 bg-[#FDF2F8] rounded-2xl p-4">
              <p className="text-[#DB2777] text-[13px] font-medium leading-relaxed">
                Chúc các bạn học giỏi, sống tốt và lan tỏa yêu thương qua từng việc làm mỗi ngày 💖
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ====================== IMAGE HELPERS =========================
function resizeImage(file, maxSize = 100, quality = 0.7) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = () => { img.src = reader.result; };
    reader.onerror = reject;
    img.onload = () => {
      let { width, height } = img;
      if (width > maxSize || height > maxSize) {
        if (width > height) { height = Math.round(height * (maxSize / width)); width = maxSize; }
        else { width = Math.round(width * (maxSize / height)); height = maxSize; }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width; canvas.height = height;
      canvas.getContext("2d").drawImage(img, 0, 0, width, height);

      // FIX #8: thử từng format, resolve ngay khi blob hợp lệ (< 10kb)
      const formats = [["image/avif",0.6],["image/webp",0.6],["image/jpeg",0.5]];
      const tryEncode = (idx = 0) => {
        if (idx >= formats.length) { reject(new Error("Encode failed")); return; }
        const [mime, q] = formats[idx];
        canvas.toBlob((blob) => {
          if (!blob) { tryEncode(idx + 1); return; }
          if (blob.size < 10 * 1024 || idx === formats.length - 1) resolve(blob);
          else tryEncode(idx + 1);
        }, mime, q);
      };
      tryEncode();
    };
    reader.readAsDataURL(file);
  });
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// ====================== MODAL USER =========================
export default function ModalUser({ setIsLogin, handleClose }) {
  const { showToast } = useToast();
  const fileRef = useRef(null);
  const prevBlobUrl = useRef(null); // FIX #2
  const [loadingAva, setLoadingAva] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [user, setUser] = useState({});
  const [switchTab, setSwitchTab] = useState("Profile");
  const [isOpenExit, setIsOpenExit] = useState(false);
  const [isAnyChange, setIsAnyChange] = useState(false);
  const studentData = useRef(null);

  const openExitButton = () => (isAnyChange ? setIsOpenExit(true) : handleClose());

  // FIX #1: loadUser với cancel guard
  const loadUser = async (savedData, cancelled) => {
    const username = localStorage.getItem("username");
    if (!username) return;
    try {
      const res = await fetch(`${API_URL}?action=getUser&username=${username}`);
      const data = await res.json();
      if (cancelled.current) return;
      if (!localStorage.getItem("username")) return;

      const hasChanged = !savedData || PROFILE_FIELDS.some((key) => data[key] !== savedData[key]);
      if (!hasChanged) return;

      setUser(data);
      localStorage.setItem("user", JSON.stringify(data));
      if (data.avatar) {
        localStorage.setItem("avatar", data.avatar);
        window.dispatchEvent(new Event("avatar-updated"));
      }
    } catch { /* silent fail — local data đã được set trước */ }
  };

  useEffect(() => {
    const cancelled = { current: false };
    const savedData = JSON.parse(localStorage.getItem("user") || "null");
    if (savedData) setUser(savedData);
    loadUser(savedData, cancelled);
    return () => { cancelled.current = true; };
  }, []);

  // Lenis scroll lock
  useEffect(() => {
    const lenis = window.lenis;
    if (lenis) lenis.stop();
    const block = (e) => e.stopPropagation();
    window.addEventListener("wheel", block, { capture: true });
    window.addEventListener("touchmove", block, { capture: true, passive: false });
    return () => {
      if (lenis?.start) lenis.start();
      window.removeEventListener("wheel", block, { capture: true });
      window.removeEventListener("touchmove", block, { capture: true });
    };
  }, []);

  // FIX #2: revoke blob URL cũ trước khi set mới
  const uploadAvatar = async (base64) => {
    const username = localStorage.getItem("username");
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        body: JSON.stringify({ action: "updateAvatar", username, avatar: base64.split(",")[1] }),
      });
      const data = await res.json();
      if (data.success) {
        setUser((prev) => ({ ...prev, avatar: data.avatar }));
        const saved = JSON.parse(localStorage.getItem("user") || "{}");
        localStorage.setItem("user", JSON.stringify({ ...saved, avatar: data.avatar }));
        localStorage.setItem("avatar", data.avatar);
        window.dispatchEvent(new Event("avatar-updated"));
        showToast("Cập nhật ảnh đại diện thành công", "success");
      } else {
        showToast("Lỗi cập nhật ảnh đại diện", "warning");
      }
    } catch {
      showToast("Không thể upload ảnh", "error");
    }
  };

  const handleAvatar = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { showToast("Chỉ chọn ảnh", "warning"); return; }

    setLoadingAva(true);
    try {
      const blob = await resizeImage(file);
      // FIX #2: revoke blob cũ
      if (prevBlobUrl.current) URL.revokeObjectURL(prevBlobUrl.current);
      const imgUrl = URL.createObjectURL(blob);
      prevBlobUrl.current = imgUrl;
      setAvatarUrl(imgUrl);
      const base64 = await blobToBase64(blob);
      await uploadAvatar(base64);
    } catch {
      showToast("Resize ảnh thất bại", "error");
    } finally {
      setLoadingAva(false);
      e.target.value = ""; // reset input để chọn lại cùng file
    }
  };

  // FIX #2: revoke khi unmount
  useEffect(() => {
    return () => { if (prevBlobUrl.current) URL.revokeObjectURL(prevBlobUrl.current); };
  }, []);

  // FIX #6: logout clear đủ keys
  const handleLogout = () => {
    ["username","user","avatar","sessionKey","studentData"].forEach((k) =>
      localStorage.removeItem(k)
    );
    setUser({});
    setIsLogin(false);
    showToast("Đã đăng xuất", "success");
    handleClose();
  };

  const displayAvatar = avatarUrl || user.avatar;

  return (
    <div id="modal-user">
      <Backdrop handleClose={openExitButton}>
        <motion.div
          initial={{ scale: 0.95, y: 16, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.95, y: 16, opacity: 0 }}
          transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
          className="relative bg-[#F2F2F7] rounded-3xl shadow-2xl w-full max-w-[95vw] md:w-[80vw] lg:w-[62vw] max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <AnimatePresence>
            {isOpenExit && (
              <ExitButton handleClose={() => setIsOpenExit(false)} handleExit={handleClose} />
            )}
          </AnimatePresence>

          {/* Sticky header */}
          <div className="sticky top-0 z-20 bg-[#F2F2F7]/95 backdrop-blur-sm flex items-center justify-between px-5 py-3.5 border-b border-black/[0.06]">
            <span className="text-[15px] font-bold text-gray-800">Tài khoản</span>
            <button
              type="button" onClick={openExitButton}
              className="w-8 h-8 rounded-full bg-black/[0.06] hover:bg-black/10 text-gray-600 text-[13px] font-bold flex items-center justify-center transition-colors active:scale-90"
              aria-label="Đóng"
            >✕</button>
          </div>

          <div className="px-4 md:px-7 py-5">
            {/* Avatar + name + tab */}
            <div className="flex flex-col items-center gap-4 mb-6">
              {/* Avatar */}
              <div className="relative">
                <div className={`relative w-24 h-24 rounded-full overflow-hidden ring-4 ring-white shadow-md ${loadingAva ? "opacity-70" : ""}`}>
                  {/* FIX #3: fallback avatar */}
                  <img
                    src={displayAvatar || "/images/default-avatar.png"}
                    alt={user.hoTen || "Avatar"}
                    className="w-full h-full object-cover bg-[#E5E5EA]"
                    onError={(e) => { e.currentTarget.src = "/images/default-avatar.png"; }}
                  />
                  {loadingAva && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 rounded-full">
                      <Spinner className="h-6 w-6 text-white" />
                    </div>
                  )}
                </div>
                <button
                  type="button" onClick={() => fileRef.current?.click()} disabled={loadingAva}
                  className="absolute bottom-0 right-0 w-8 h-8 rounded-full shadow-md flex items-center justify-center text-[14px] bg-[#FF6B35] hover:bg-[#E85E28] text-white disabled:opacity-50 transition-colors"
                  aria-label="Đổi ảnh đại diện"
                >📷</button>
                <input type="file" ref={fileRef} accept="image/*" hidden onChange={handleAvatar} />
              </div>

              {/* Name + username */}
              <div className="text-center">
                <p className="text-[17px] font-bold text-gray-900">{user.hoTen || "—"}</p>
                <p className="text-[12px] text-gray-400 mt-0.5">@{localStorage.getItem("username") || "—"}</p>
              </div>

              {/* Segmented control */}
              <div className="relative w-full max-w-xs h-11 rounded-2xl bg-black/[0.07] p-1 flex cursor-pointer select-none">
                <motion.div
                  className="absolute top-1 left-1 h-9 w-[calc(50%-4px)] rounded-xl bg-white shadow-sm"
                  animate={{ x: switchTab === "Profile" ? 0 : "100%" }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
                <div className="relative z-10 grid grid-cols-2 w-full text-[13px] font-semibold">
                  {["Profile","Achievement"].map((tab) => (
                    <button
                      key={tab} type="button" onClick={() => setSwitchTab(tab)}
                      className={`rounded-xl transition-colors ${switchTab === tab ? "text-[#FF6B35]" : "text-gray-500"}`}
                    >{tab === "Profile" ? "Hồ sơ" : "Thành tích"}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* Tab content */}
            <AnimatePresence mode="wait">
              {switchTab === "Profile" && (
                <motion.div key="profile"
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                >
                  <Profile
                    user={user} handleLogout={handleLogout}
                    setUser={setUser} setIsAnyChange={setIsAnyChange}
                    onSaveSuccess={() => {/* FIX #5: không cần isSave state */}}
                  />
                </motion.div>
              )}
              {switchTab === "Achievement" && (
                <motion.div key="achievement"
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                >
                  <Achievement user={user} studentData={studentData} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </Backdrop>
    </div>
  );
}