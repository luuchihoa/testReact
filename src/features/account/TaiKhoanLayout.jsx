import React, { useState, useEffect, useRef } from "react";
import { Routes, Route, Navigate, NavLink, useNavigate, useOutletContext } from "react-router-dom";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { Camera, UserCheck, Lock } from "lucide-react";
import { supabase } from "../../lib/supabase.js";
import { useToast } from "../../components/ui/ToastContext.jsx";
import { safeParse, safeStore, normalizeStudent, getDefaultAvatarByGender, resizeImage } from "./utils.js";
import { LoginRequired } from "./components/SharedComponents.jsx";
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
  
  const [user, setUser] = useState(() => safeParse("user", {}) || {});
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isAnyChange, setIsAnyChange] = useState(false);
  const [loadingAva, setLoadingAva] = useState(false);
  const [achievementCache, setAchievementCache] = useState({});
  const fileRef = useRef(null);
  const [profileLoaded, setProfileLoaded] = useState(() => Object.keys(safeParse("user", {}) || {}).length > 0);

  const isStaff = user.role === "admin" || user.role === "teacher";
  const isLocked = Boolean((user.is_profile_locked || user.isProfileLocked) && !isStaff);
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

  useEffect(() => {
    if (!isLogin) return;
    let isCancelled = false;

    const fetchUser = async () => {
      try {
        const { data: { user: authUser }, error: authErr } = await supabase.auth.getUser();
        if (isCancelled || authErr || !authUser) return;
        const { data, error } = await supabase.from("users").select("*").eq("auth_id", authUser.id).single();
        if (isCancelled) return;
        if (error) {
          showToast("Không tải được thông tin tài khoản, thử lại sau", "error");
          return;
        }
        const normalized = normalizeStudent(data);
        normalized.email = authUser.email;
        setUser(normalized);
        safeStore("user",   JSON.stringify(normalized));
        safeStore("avatar", normalized.avatar);
        safeStore("role",   normalized.role);
      } catch {
        if (!isCancelled) {
          showToast("Lỗi kết nối, không tải được tài khoản", "error");
        }
      } finally {
        if (!isCancelled) {
          setProfileLoaded(true);
        }
      }
    };

    fetchUser();
    return () => {
      isCancelled = true;
    };
  }, [isLogin, showToast]);

  useEffect(() => { return () => { if (avatarUrl) URL.revokeObjectURL(avatarUrl); }; }, [avatarUrl]);

  const handleLogout = async () => {
    try { await supabase.auth.signOut(); } catch { /* ignore */ }
    ["username", "user", "avatar", "sessionKey", "role", "studentData"].forEach((k) => localStorage.removeItem(k));
    setUser({}); setIsAnyChange(false); setIsLogin(false);
    showToast("Đã đăng xuất", "success");
    navigate("/");
  };

  if (!isLogin) return <div className="min-h-screen bg-[#faf8f3] dark:bg-[#151c18]"><LoginRequired toggleModal={toggleModal} /></div>;

  return (
    <div className="min-h-screen w-full min-w-0 bg-[#faf8f3] dark:bg-[#151c18] text-[#293d32] dark:text-[#ecece0] transition-colors duration-300">
      <div id="tai-khoan-page" className="w-full max-w-4xl mx-auto px-3.5 sm:px-6 py-5 md:py-8 relative z-10 min-w-0">
        <div className="md:bg-[#fffefa] md:dark:bg-[#1e2821] md:rounded-3xl md:shadow-xs md:border md:border-[#dedfd4] md:dark:border-[#354237] md:px-8 pb-8 pt-3 md:py-8 min-w-0">
          <div className="flex flex-col items-center gap-4 mb-6 md:mb-8 min-w-0">
            <div className="relative">
              <div className={`relative w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden ring-4 ring-[#faf8f3] dark:ring-[#151c18] shadow-sm border border-[#dedfd4] dark:border-[#354237] ${loadingAva ? "opacity-70" : ""}`}>
                <img src={avatarUrl || user.avatar} alt={user.hoTen || "Avatar"} className="w-full h-full object-cover bg-stone-100 dark:bg-stone-800" onError={(e) => { if (e.currentTarget.dataset.fallbackApplied) return; e.currentTarget.dataset.fallbackApplied = "1"; e.currentTarget.src = getDefaultAvatarByGender(user.gioiTinh); }} />
                {loadingAva && <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40"><div className="w-8 h-8 border-[3px] border-[#d6b883] border-t-transparent rounded-full animate-spin" /></div>}
              </div>
              {!isLocked ? (
                <button 
                  type="button" 
                  onClick={selectAvatar} 
                  disabled={loadingAva} 
                  aria-label="Đổi ảnh đại diện" 
                  title="Đổi ảnh đại diện"
                  className={`absolute bottom-0 right-0 w-8.5 h-8.5 rounded-full shadow-md flex items-center justify-center border-2 border-[#faf8f3] dark:border-[#151c18] transition-all ${
                    loadingAva 
                      ? "bg-stone-300 cursor-not-allowed" 
                      : "bg-[#314e3e] hover:bg-[#253d30] dark:bg-[#d6b883] dark:hover:bg-[#c4a671] text-white dark:text-[#19251d] active:scale-90 cursor-pointer"
                  }`}
                >
                  <Camera className="w-4 h-4" strokeWidth={2.2} />
                </button>
              ) : (
                <div 
                  title="Hồ sơ đã khóa, không thể đổi ảnh đại diện"
                  aria-label="Hồ sơ đã khóa"
                  className="absolute bottom-0 right-0 w-7.5 h-7.5 rounded-full shadow-md flex items-center justify-center border-2 border-[#faf8f3] dark:border-[#151c18] bg-[#927140] text-white dark:bg-[#d4b47d] dark:text-[#19251d]"
                >
                  <Lock className="w-3.5 h-3.5" />
                </div>
              )}
              <input type="file" ref={fileRef} accept="image/*" hidden onChange={handleAvatar} />
            </div>

            <div className="text-center min-w-0 max-w-full px-2">
              <h1 className="text-[18px] md:text-[20px] font-bold text-[#293d32] dark:text-[#ecece0] leading-tight truncate">
                {user.tenThanh ? `${user.tenThanh} ` : ""}{user.hoTen || "Thành viên"}
              </h1>
              <div className="flex items-center justify-center gap-2 mt-1 flex-wrap">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#575e55] dark:text-[#b0b9ac] bg-stone-500/10 dark:bg-stone-400/10 px-2.5 py-0.5 rounded-full border border-[#dedfd4]/60 dark:border-[#354237]/60">
                  <UserCheck className="w-3 h-3 text-[#314e3e] dark:text-[#d4b47d]" />
                  {user.role === "admin" ? "Quản trị viên" : user.role === "teacher" ? "Giáo lý viên" : user.role === "student" ? "Thiếu nhi" : "Thành viên"}
                </span>
                {user.username && (
                  <span className="text-[11px] font-medium text-[#575e55] dark:text-[#b0b9ac]">
                    • @{user.username}
                  </span>
                )}
              </div>
            </div>

            {/* TAB SWITCHER */}
            <div className={`relative w-full ${isStaff ? "max-w-xs" : "max-w-sm md:max-w-md"} rounded-2xl bg-[#dedfd4]/40 dark:bg-[#354237]/50 p-1 select-none border border-[#dedfd4] dark:border-[#354237]`}>
              <div className={`grid ${isStaff ? "grid-cols-2" : "grid-cols-3"} gap-1 w-full text-xs sm:text-[13px] font-bold`}>
                <NavLink
                  to={TAB_PROFILE_URL}
                  end
                  className={({ isActive }) =>
                    `relative flex items-center justify-center py-2 px-1 sm:px-3 rounded-xl transition-colors duration-200 whitespace-nowrap cursor-pointer ${
                      isActive
                        ? "text-[#314e3e] dark:text-[#d4b47d]"
                        : "text-[#575e55] dark:text-[#b0b9ac] hover:text-[#293d32] dark:hover:text-[#ecece0]"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <Motion.span
                          layoutId="accountActiveTabIndicator"
                          className="absolute inset-0 rounded-xl bg-white dark:bg-[#1e2821] shadow-xs border border-[#dedfd4] dark:border-[#354237]"
                          transition={{ type: "spring", stiffness: 450, damping: 32 }}
                        />
                      )}
                      <span className="relative z-10 truncate">Hồ sơ</span>
                    </>
                  )}
                </NavLink>

                {!isStaff && (
                  <NavLink
                    to={TAB_ACHIEVEMENT_URL}
                    className={({ isActive }) =>
                      `relative flex items-center justify-center py-2 px-1 sm:px-3 rounded-xl transition-colors duration-200 whitespace-nowrap cursor-pointer ${
                        isActive
                          ? "text-[#314e3e] dark:text-[#d4b47d]"
                          : "text-[#575e55] dark:text-[#b0b9ac] hover:text-[#293d32] dark:hover:text-[#ecece0]"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <Motion.span
                            layoutId="accountActiveTabIndicator"
                            className="absolute inset-0 rounded-xl bg-white dark:bg-[#1e2821] shadow-xs border border-[#dedfd4] dark:border-[#354237]"
                            transition={{ type: "spring", stiffness: 450, damping: 32 }}
                          />
                        )}
                        <span className="relative z-10 truncate">Thành tích</span>
                      </>
                    )}
                  </NavLink>
                )}

                <NavLink
                  to={TAB_NOTIFICATION_URL}
                  className={({ isActive }) =>
                    `relative flex items-center justify-center py-2 px-1 sm:px-3 rounded-xl transition-colors duration-200 whitespace-nowrap cursor-pointer ${
                      isActive
                        ? "text-[#314e3e] dark:text-[#d4b47d]"
                        : "text-[#575e55] dark:text-[#b0b9ac] hover:text-[#293d32] dark:hover:text-[#ecece0]"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <Motion.span
                          layoutId="accountActiveTabIndicator"
                          className="absolute inset-0 rounded-xl bg-white dark:bg-[#1e2821] shadow-xs border border-[#dedfd4] dark:border-[#354237]"
                          transition={{ type: "spring", stiffness: 450, damping: 32 }}
                        />
                      )}
                      <span className="relative z-10 truncate">Thông báo</span>
                    </>
                  )}
                </NavLink>
              </div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <Routes>
              <Route index element={<Navigate to={TAB_PROFILE_URL} replace />} />
              <Route path={TAB_PROFILE_PATH} element={<Motion.div key="profile" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>{profileLoaded ? <ProfileTab user={user} handleLogout={handleLogout} setUser={setUser} setIsAnyChange={setIsAnyChange} isAnyChange={isAnyChange} /> : <ProfileSkeleton />}</Motion.div>} />
              <Route path={TAB_ACHIEVEMENT_PATH} element={isStaff ? (<Navigate to={TAB_PROFILE_URL} replace />) : (<Motion.div key="achievement" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}><AchievementTab user={user} cache={achievementCache} setCache={setAchievementCache} /></Motion.div>)} />
              <Route path={TAB_NOTIFICATION_PATH} element={<Motion.div key="notification" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}><NotificationTab user={user} navigate={navigate} /></Motion.div>} />
              <Route path="*" element={<Navigate to={TAB_PROFILE_URL} replace />} />
            </Routes>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
