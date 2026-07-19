import React, { useState, useEffect, useRef } from "react";
import { Routes, Route, Navigate, NavLink, useNavigate, useMatch, useOutletContext } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../lib/supabase.js";
import { useToast } from "../../components/ui/ToastContext.jsx";
import { safeParse, safeStore, normalizeStudent, getDefaultAvatarByGender, resizeImage } from "./utils.js";
import { LoginRequired, TabIndicator } from "./components/SharedComponents.jsx";
import { ProfileTab, ProfileSkeleton } from "./components/ProfileTab.jsx";
import { AchievementTab } from "./components/AchievementTab.jsx";
import { NotificationTab } from "./components/NotificationTab.jsx";

const TAB_PROFILE_PATH = "hồ-sơ";
const TAB_PROFILE_URL  = `/tài-khoản/${TAB_PROFILE_PATH}`;
const TAB_ACHIEVEMENT_PATH = "thành-tích";
const TAB_ACHIEVEMENT_URL  = `/tài-khoản/${TAB_ACHIEVEMENT_PATH}`;
const TAB_NOTIFICATION_PATH = "thông-báo";
const TAB_NOTIFICATION_URL  = `/tài-khoản/${TAB_NOTIFICATION_PATH}`;

export default function TaiKhoanLayout() {
  const { isLogin, setIsLogin, toggleModal } = useOutletContext();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [user, setUser] = useState({});
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isAnyChange, setIsAnyChange] = useState(false);
  const [loadingAva, setLoadingAva] = useState(false);
  const [achievementCache, setAchievementCache] = useState({});
  
  const isAchievementActive = useMatch(TAB_ACHIEVEMENT_URL);
  const isNotificationActive = useMatch(TAB_NOTIFICATION_URL);
  const fileRef = useRef(null);
  const [profileLoaded, setProfileLoaded] = useState(() => Object.keys(safeParse("user", {}) || {}).length > 0);

  const isStaff = user.role === "admin" || user.role === "teacher";
  const selectAvatar = () => fileRef.current?.click();

  useEffect(() => {
    if (!isAnyChange) return;
    const handler = (e) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isAnyChange]);

  const avatarUploadCancelRef = useRef(() => {});
  useEffect(() => { return () => { avatarUploadCancelRef.current(); }; }, []);

  const uploadAvatar = async (resizedBlob, username, ext) => {
    const filePath = `avatars/${username}.${ext}`;
    const staleExts = ["webp", "jpeg", "jpg", "avif"].filter((e) => e !== ext);
    await supabase.storage.from("user-assets").remove(staleExts.map((e) => `avatars/${username}.${e}`)).catch(() => {});
    const { error: uploadError } = await supabase.storage.from("user-assets").upload(filePath, resizedBlob, { upsert: true, contentType: resizedBlob.type });
    if (uploadError) throw uploadError;
    const { data: urlData } = supabase.storage.from("user-assets").getPublicUrl(filePath);
    const publicUrl = urlData?.publicUrl;
    if (!publicUrl) throw new Error("Không lấy được public URL");
    const bustedUrl = `${publicUrl}?v=${Date.now()}`;
    const { error: updateError } = await supabase.from("users").update({ avatar: bustedUrl }).eq("username", username);
    if (updateError) throw updateError;
    return bustedUrl;
  };

  const MAX_AVATAR_FILE_SIZE = 8 * 1024 * 1024;
  const handleAvatar = async (e) => {
    const inputEl = e.target;
    const file    = inputEl.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { showToast("Chỉ chọn ảnh", "warning"); inputEl.value = ""; return; }
    if (file.size > MAX_AVATAR_FILE_SIZE) { showToast("Ảnh quá lớn (tối đa 8MB)", "warning"); inputEl.value = ""; return; }

    let cancelled = false;
    avatarUploadCancelRef.current = () => { cancelled = true; };
    const previousAvatarUrl  = avatarUrl;
    const previousUserAvatar = user.avatar;

    setLoadingAva(true);
    try {
      const { blob: resizedBlob, ext } = await resizeImage(file);
      if (cancelled) return;
      const previewUrl = URL.createObjectURL(resizedBlob);
      setAvatarUrl(previewUrl); 
      const username = user.username;
      if (!username) throw new Error("Không tìm thấy username");
      const publicUrl = await uploadAvatar(resizedBlob, username, ext);
      if (cancelled) return;
      setUser((prev) => ({ ...prev, avatar: publicUrl }));
      const savedUser = safeParse("user", {});
      safeStore("user",   JSON.stringify({ ...savedUser, avatar: publicUrl }));
      safeStore("avatar", publicUrl);
      safeStore("role", user.role);
      window.dispatchEvent(new Event("avatar-updated"));
      showToast("Cập nhật avatar thành công", "success");
    } catch (err) {
      if (!cancelled) { setAvatarUrl(previousAvatarUrl); setUser((prev) => ({ ...prev, avatar: previousUserAvatar })); showToast(err.message || "Không thể upload avatar", "error"); }
    } finally {
      if (!cancelled) setLoadingAva(false);
      inputEl.value = ""; 
    }
  };

  const loadUser = async () => {
    try {
      const { data: { user: authUser }, error: authErr } = await supabase.auth.getUser();
      if (authErr || !authUser) return;
      const { data, error } = await supabase.from("users").select("*").eq("auth_id", authUser.id).single();
      if (error) { showToast("Không tải được thông tin tài khoản, thử lại sau", "error"); return; }
      const normalized = normalizeStudent(data);
      normalized.email = authUser.email;
      setUser(normalized);
      safeStore("user",   JSON.stringify(normalized));
      safeStore("avatar", normalized.avatar);
      safeStore("role",   normalized.role);
    } catch (err) {
      showToast("Lỗi kết nối, không tải được tài khoản", "error");
    } finally {
      setProfileLoaded(true);
    }
  };

  useEffect(() => {
    if (!isLogin) return;
    const savedData = safeParse("user", null);
    if (savedData) setUser(savedData);
    loadUser();
  }, [isLogin]);

  useEffect(() => { return () => { if (avatarUrl) URL.revokeObjectURL(avatarUrl); }; }, [avatarUrl]);

  const handleLogout = async () => {
    try { await supabase.auth.signOut(); } catch (err) {}
    ["username", "user", "avatar", "sessionKey", "role", "studentData"].forEach((k) => localStorage.removeItem(k));
    setUser({}); setIsAnyChange(false); setIsLogin(false);
    showToast("Đã đăng xuất", "success");
    navigate("/");
  };

  if (!isLogin) return <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#1C1917]"><LoginRequired toggleModal={toggleModal} /></div>;

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#1C1917] text-stone-800 dark:text-stone-200 transition-colors duration-500">
      <div id="tai-khoan-page" className="w-full max-w-4xl mx-auto px-4 md:px-6 py-8 relative z-10">
        <div className="flex items-center justify-center mb-6 md:mb-10">
          <h1 className="text-[24px] md:text-[28px] font-extrabold text-amber-950 dark:text-amber-50 font-serif tracking-tight text-center">
            Tài khoản của tôi
          </h1>
        </div>

        <div className="md:bg-white/60 md:dark:bg-stone-900/40 md:backdrop-blur-xl md:rounded-[2rem] md:shadow-sm md:border md:border-amber-900/10 md:dark:border-amber-100/10 md:px-8 pb-8 pt-4 md:py-8">
          <div className="flex flex-col items-center gap-6 mb-8">
            <div className="relative">
              <div className={`relative w-28 h-28 rounded-full overflow-hidden ring-[6px] ring-[#FDFBF7] dark:ring-[#1C1917] shadow-md border border-amber-900/10 dark:border-amber-100/10 ${loadingAva ? "opacity-70" : ""}`}>
                <img src={avatarUrl || user.avatar} alt={user.hoTen || "Avatar"} className="w-full h-full object-cover bg-amber-50 dark:bg-stone-800" onError={(e) => { if (e.currentTarget.dataset.fallbackApplied) return; e.currentTarget.dataset.fallbackApplied = "1"; e.currentTarget.src = getDefaultAvatarByGender(user.gioiTinh); }} />
                {loadingAva && <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40"><div className="w-8 h-8 border-[3px] border-amber-400 border-t-transparent rounded-full animate-spin" /></div>}
              </div>
              <button type="button" onClick={selectAvatar} disabled={loadingAva} aria-label="Đổi ảnh đại diện" className={`absolute bottom-1 right-1 w-9 h-9 rounded-full shadow-lg flex items-center justify-center text-[15px] border-2 border-[#FDFBF7] dark:border-[#1C1917] transition-all ${loadingAva ? "bg-stone-300 cursor-not-allowed" : "bg-amber-900 hover:bg-amber-950 dark:bg-amber-600 dark:hover:bg-amber-500 text-white"}`}>✏️</button>
              <input type="file" ref={fileRef} accept="image/*" hidden onChange={handleAvatar} />
            </div>

            <div className={`relative w-full ${isStaff ? "max-w-xs" : "max-w-md"} h-12 rounded-[1rem] bg-stone-200/60 dark:bg-stone-800/80 p-1 flex select-none shadow-inner border border-black/5 dark:border-white/5`}>
              <TabIndicator activeTab={isAchievementActive ? "thanh-tich" : (isNotificationActive ? "thong-bao" : "ho-so")} isStaff={isStaff} />
              <div className={`relative z-10 grid ${isStaff ? "grid-cols-2" : "grid-cols-3"} w-full text-[14px] font-bold`}>
                <NavLink to={TAB_PROFILE_URL} end className={({ isActive }) => `flex items-center justify-center rounded-[14px] transition-colors ${isActive ? "text-amber-950 dark:text-amber-950" : "text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"}`}>Hồ sơ</NavLink>
                {!isStaff && (
                  <NavLink to={TAB_ACHIEVEMENT_URL} className={({ isActive }) => `flex items-center justify-center rounded-[14px] transition-colors ${isActive ? "text-amber-950 dark:text-amber-950" : "text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"}`}>Thành tích</NavLink>
                )}
                <NavLink to={TAB_NOTIFICATION_URL} className={({ isActive }) => `flex items-center justify-center rounded-[14px] transition-colors ${isActive ? "text-amber-950 dark:text-amber-950" : "text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"}`}>Thông báo</NavLink>
              </div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <Routes>
              <Route index element={<Navigate to={TAB_PROFILE_URL} replace />} />
              <Route path={TAB_PROFILE_PATH} element={<motion.div key="profile" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>{profileLoaded ? <ProfileTab user={user} handleLogout={handleLogout} setUser={setUser} setIsAnyChange={setIsAnyChange} isAnyChange={isAnyChange} /> : <ProfileSkeleton />}</motion.div>} />
              <Route path={TAB_ACHIEVEMENT_PATH} element={isStaff ? (<Navigate to={TAB_PROFILE_URL} replace />) : (<motion.div key="achievement" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}><AchievementTab user={user} cache={achievementCache} setCache={setAchievementCache} /></motion.div>)} />
              <Route path={TAB_NOTIFICATION_PATH} element={<motion.div key="notification" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}><NotificationTab user={user} navigate={navigate} /></motion.div>} />
              <Route path="*" element={<Navigate to={TAB_PROFILE_URL} replace />} />
            </Routes>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
