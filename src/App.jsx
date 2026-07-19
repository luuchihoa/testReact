import React, { lazy, Suspense, useEffect, useState } from "react";
import { ToastProvider } from "./components/ui/ToastContext.jsx";
import { Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { supabase } from "./lib/supabase.js";

const ReactLenisLazy = lazy(() => 
  import("lenis/react").then(mod => {
    const WrappedComponent = (props) => {
      return <mod.ReactLenis {...props} ref={(inst) => { if (inst) window.lenis = inst.lenis; }} />;
    };
    return { default: WrappedComponent };
  })
);

import Header from "./components/layout/Header.jsx";
import Home from "./pages/Home.jsx";
import Footer from "./components/layout/Footer.jsx";
import ScrollToTop from "./components/ui/ScrollToTop.jsx";
import { PageContentSkeleton } from "./components/ui/Skeleton.jsx";
import TeacherLayout , { RequireTeacherRoute } from "./features/teacher/TeacherLayout.jsx";
import AdminLayout , { RequireAdminRoute } from "./features/admin/AdminLayout.jsx";

const lazyWithRetry = (componentImport) =>
  lazy(() =>
    componentImport().catch((error) => {
      if (
        error.name === "ChunkLoadError" || 
        error.message.includes("Failed to fetch dynamically imported module")
      ) {
        window.location.reload();
      }
      throw error;
    })
  );

const ModalLogin    = lazyWithRetry(() => import("./components/ui/ModalLogin.jsx"));
const TaiKhoanLayout = lazyWithRetry(() => import("./features/account/TaiKhoanLayout.jsx"));
const Contact       = lazyWithRetry(() => import("./pages/Contact.jsx"));
const Setting       = lazyWithRetry(() => import("./pages/Setting.jsx"));
const KhoiChienCon  = lazyWithRetry(() => import("./pages/KhoiChienCon.jsx"));
const KhoiRuocLe    = lazyWithRetry(() => import("./pages/KhoiRuocLe.jsx"));
const KhoiThemSuc   = lazyWithRetry(() => import("./pages/KhoiThemSuc.jsx"));
const KhoiPhungVu   = lazyWithRetry(() => import("./pages/KhoiPhungVu.jsx"));
const KhoiKinhThanh = lazyWithRetry(() => import("./pages/KhoiKinhThanh.jsx"));
const KhoiVaoDoi    = lazyWithRetry(() => import("./pages/KhoiVaoDoi.jsx"));
const TaiLieu       = lazyWithRetry(() => import("./pages/TaiLieu.jsx"));
const TestQuiz      = lazyWithRetry(() => import("./components/shared/TestQuiz.jsx"));
const BaoMat        = lazyWithRetry(() => import("./pages/BaoMat.jsx"));
const QuyDinh       = lazyWithRetry(() => import("./pages/QuyDinh.jsx"));
const GioiThieu     = lazyWithRetry(() => import("./pages/GioiThieu.jsx"));
const TuyenSinh     = lazyWithRetry(() => import("./pages/TuyenSinh.jsx"));
const LichSinhHoat  = lazyWithRetry(() => import("./pages/LichSinhHoat.jsx"));
const LichHoc       = lazyWithRetry(() => import("./pages/LichHoc.jsx"));
const GioiTre       = lazyWithRetry(() => import("./pages/GioiTre.jsx"));
const ResetPassword = lazyWithRetry(() => import("./pages/ResetPassword.jsx"));

// ── Lời Chúa ──
const LiturgyPage   = lazyWithRetry(() => import("./pages/LiturgyPage.jsx"));

// ── Bài viết ──
const ArticleList   = lazyWithRetry(() => import("./features/articles/ArticleList.jsx"));
const ArticleDetail = lazyWithRetry(() => import("./features/articles/ArticleDetail.jsx"));
const MyArticles    = lazyWithRetry(() => import("./features/articles/MyArticles.jsx"));
const ArticleEditor = lazyWithRetry(() => import("./features/articles/ArticleEditor.jsx"));

const DashboardTab    = lazyWithRetry(() => import("./features/admin/DashboardTab.jsx"));
const UsersTab        = lazyWithRetry(() => import("./features/admin/UsersTab.jsx"));
const ClassesTab      = lazyWithRetry(() => import("./features/admin/ClassesTab.jsx"));
const AdminGradesTab  = lazyWithRetry(() => import("./features/admin/GradesTab.jsx"));
const ReportsTab      = lazyWithRetry(() => import("./features/admin/reports/ReportsTab.jsx"));
const BroadcastTab    = lazyWithRetry(() => import("./features/admin/BroadcastTab.jsx"));
const ArticlesTab     = lazyWithRetry(() => import("./features/admin/articles/ArticlesTab.jsx"));
const DangKyTab       = lazyWithRetry(() => import("./features/admin/DangKyTab.jsx"));
const GopYTab         = lazyWithRetry(() => import("./features/admin/GopYTab.jsx"));
const AdminLiturgyTab = lazyWithRetry(() => import("./features/admin/LiturgyTab.jsx"));

const TeacherSummaryTab   = lazyWithRetry(() => import("./features/teacher/SummaryTab.jsx"));
const TeacherRosterTab    = lazyWithRetry(() => import("./features/teacher/RosterTab.jsx"));
const TeacherAttendanceTab= lazyWithRetry(() => import("./features/teacher/AttendanceTab.jsx"));
const TeacherGradesTab    = lazyWithRetry(() => import("./features/teacher/GradesTab.jsx"));

function PageLoader() {
  return <PageContentSkeleton />;
}

const fontSizeMap = {
  sm: "text-sm",
  base: "text-base",
  lg: "text-lg",
  xl: "text-xl",
};

const AppLayout = ({ fontSize, toggleModal, isLogin, setIsLogin, handleClose }) => {
  const location = useLocation();
  const decodedPath = decodeURIComponent(location.pathname);
  const isDashboard = decodedPath.startsWith("/quản-trị") || decodedPath.startsWith("/quản-lý-học-sinh");

  return (
    <div className={`${fontSizeMap[fontSize]} min-h-screen flex flex-col bg-[#faf8f5] dark:bg-stone-950 text-stone-900 dark:text-stone-100 antialiased transition-colors duration-300 selection:bg-amber-500/30 selection:text-amber-900 dark:selection:text-amber-100`}>
      {/* Thanh điều hướng Header */}
      {!isDashboard && (
        <Header 
          toggleModal={toggleModal} 
          isLogin={isLogin} 
          setIsLogin={setIsLogin} 
          handleClose={handleClose}
        />
      )}
      
      {/* Không gian nội dung chính tối ưu hóa khoảng cách thiết bị di động */}
      <main className="w-full flex-grow">
        <Suspense fallback={<PageLoader />}>
          <Outlet context={{ toggleModal, isLogin, setIsLogin }} />
        </Suspense>
      </main>
      
      {/* Chân trang Footer */}
      {!isDashboard && <Footer />}
    </div>
  );
};

export default function App() {
  const [fontSize, setFontSize] = useState("base");
  const [turnOnModal, setTurnOnModal] = useState(false);
  const [isLogin, setIsLogin] = useState(false);

  const isMobile = typeof window !== "undefined" && /Mobi|Android|iPhone/i.test(navigator.userAgent);

  const toggleModal = () => setTurnOnModal(true);
  const handleClose = () => setTurnOnModal(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    // Kiểm tra nếu user đã lưu 'dark' HOẶC hệ thống máy tính của user đang để dark mode mặc định
    const isDark = savedTheme === "dark" || 
      (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches);
    
    document.documentElement.classList.toggle("dark", isDark);

    const savedFontSize = localStorage.getItem("fontSize");
    if (savedFontSize && fontSizeMap[savedFontSize]) {
      setFontSize(savedFontSize);
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsLogin(true);
      } else {
        setIsLogin(false);
        ["sessionKey", "role", "username", "user", "avatar", "studentData"].forEach((k) => localStorage.removeItem(k));
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        setIsLogin(false);
        ["sessionKey", "role", "username", "user", "avatar", "studentData"].forEach((k) => localStorage.removeItem(k));
      } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        setIsLogin(true);
      }
    });

    return () => subscription?.unsubscribe();
  }, []);
  useEffect(() => {
    const sizeMap = { sm: "14px", base: "16px", lg: "18px", xl: "20px" };
    document.documentElement.style.fontSize = sizeMap[fontSize] || "16px";
  }, [fontSize]);

  const handleFontSizeChange = (size) => {
    if (fontSizeMap[size]) {
      setFontSize(size);
      localStorage.setItem("fontSize", size);
    }
  };

  const renderAppContent = () => (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<AppLayout fontSize={fontSize} toggleModal={toggleModal} isLogin={isLogin} setIsLogin={setIsLogin} handleClose={handleClose}/>}>
          <Route index element={<Home />} />
          <Route path="lời-chúa-hàng-ngày" element={<LiturgyPage />} />
          <Route path="tuyển-sinh" element={<TuyenSinh />} />
          <Route path="giới-thiệu" element={<GioiThieu />} />
          <Route path="khối-chiên-con" element={<KhoiChienCon />} />
          <Route path="khối-rước-lễ" element={<KhoiRuocLe />} />
          <Route path="khối-thêm-sức" element={<KhoiThemSuc />} />
          <Route path="khối-phụng-vụ" element={<KhoiPhungVu />} />
          <Route path="khối-kinh-thánh" element={<KhoiKinhThanh />} />
          <Route path="khối-vào-đời" element={<KhoiVaoDoi />} />
          <Route path="giới-trẻ-công-giáo" element={<GioiTre />} />
          <Route path="tài-liệu" element={<TaiLieu />} />
          <Route path="lịch-học" element={<LichHoc />} />
          <Route path="lịch-sinh-hoạt" element={<LichSinhHoat />} />
          <Route path="liên-hệ" element={<Contact />} />
          <Route path="cài-đặt" element={<Setting fontSize={fontSize} setFontSize={handleFontSizeChange} />} />
          <Route path="bảo-mật" element={<BaoMat />} />
          <Route path="quy-định" element={<QuyDinh />} />
          <Route path="tài-khoản/*" element={<TaiKhoanLayout />} />
          <Route path="reset-password" element={<ResetPassword />} />

          {/* ── Bài viết ── */}
          <Route path="bài-viết" element={<ArticleList />} />
          <Route path="bài-viết/:slug" element={<ArticleDetail />} />
          <Route path="bài-viết-của-tôi" element={<MyArticles />} />
          <Route path="bài-viết-của-tôi/soạn" element={<ArticleEditor />} />
          <Route path="bài-viết-của-tôi/soạn/:id" element={<ArticleEditor />} />

          <Route
            path="quản-trị"
            element={
              <RequireAdminRoute>
                <AdminLayout />
              </RequireAdminRoute>
            }
          >
            <Route index element={<Navigate to="tổng-quan" replace />} />
            <Route path="tổng-quan"  element={<DashboardTab />} />
            <Route path="người-dùng" element={<UsersTab />} />
            <Route path="lớp-học"    element={<ClassesTab />} />
            <Route path="sổ-điểm"    element={<AdminGradesTab />} />
            <Route path="báo-cáo"    element={<ReportsTab />} />
            <Route path="thông-báo"  element={<BroadcastTab />} />
            <Route path="bài-viết"   element={<ArticlesTab />} />
            <Route path="đăng-ký"    element={<DangKyTab />} />
            <Route path="góp-ý"      element={<GopYTab />} />
            <Route path="lời-chúa"   element={<AdminLiturgyTab />} />
          </Route>
          
          {/* Thay thế đoạn Route /quản-lý-học-sinh cũ bằng đoạn mã tối ưu này */}
          <Route
            path="/quản-lý-học-sinh"
            element={
              <RequireTeacherRoute>
                <TeacherLayout />
              </RequireTeacherRoute>
            }
          >
            <Route index element={<Navigate to="tổng-quan" replace />} />
            <Route path="tổng-quan"  element={<TeacherSummaryTab />} />
            <Route path="học-sinh"   element={<TeacherRosterTab />} />
            <Route path="điểm-danh"  element={<TeacherAttendanceTab />} />
            <Route path="nhập-điểm"  element={<TeacherGradesTab />} />
          </Route>
        </Route>
        <Route
          path="/:khoi/:type"
          element={
            <div className={`${fontSizeMap[fontSize]} min-h-screen bg-[#faf8f5] dark:bg-stone-950 text-stone-900 dark:text-stone-100 antialiased transition-colors duration-300 selection:bg-amber-500/30 selection:text-amber-900 dark:selection:text-amber-100`}>
              <Suspense fallback={<PageLoader />}>
                <TestQuiz />
              </Suspense>
            </div>
          }
        />
      </Routes>

      <Suspense fallback={null}>
        <AnimatePresence>
          {!isLogin && turnOnModal && (
            <ModalLogin key="modal-login" handleClose={handleClose} setIsLogin={setIsLogin} />
          )}
        </AnimatePresence>
      </Suspense>
    </>
  );

  return (
    <ToastProvider>
      {isMobile ? (
        renderAppContent()
      ) : (
        <Suspense fallback={renderAppContent()}>
          <ReactLenisLazy
            root
            options={{
              duration: 1.2,
              easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
              smoothTouch: false,
              touchMultiplier: 1.5,
            }}
          >
            {renderAppContent()}
          </ReactLenisLazy>
        </Suspense>
      )}
    </ToastProvider>
  );
}