import React, { lazy, Suspense, useEffect, useState } from "react";
import { ToastProvider } from "./components/ui/ToastContext.jsx";
import { Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

const ReactLenisLazy = lazy(() => 
  import("lenis/react").then(mod => {
    const WrappedComponent = (props) => {
      return <mod.ReactLenis {...props} ref={(inst) => { if (inst) window.lenis = inst.lenis; }} />;
    };
    return { default: WrappedComponent };
  })
);

import Header from "./components/Header.jsx";
import Home from "./components/Home.jsx";
import Footer from "./components/Footer.jsx";
import ScrollToTop from "./components/ui/ScrollToTop.jsx";
import { PageContentSkeleton } from "./components/ui/Skeleton.jsx";
import TeacherLayout , { RequireTeacherRoute } from "./components/teacher/TeacherLayout.jsx";
import AdminLayout , { RequireAdminRoute } from "./components/admin/AdminLayout.jsx";

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

const ModalLogin    = lazyWithRetry(() => import("./components/ModalLogin.jsx"));
const TaiKhoanLayout = lazyWithRetry(() => import("./components/TaiKhoanLayout.jsx"));
const Contact       = lazyWithRetry(() => import("./components/Contact.jsx"));
const Setting       = lazyWithRetry(() => import("./components/Setting.jsx"));
const KhoiChienCon  = lazyWithRetry(() => import("./components/KhoiChienCon.jsx"));
const KhoiRuocLe    = lazyWithRetry(() => import("./components/KhoiRuocLe.jsx"));
const KhoiThemSuc   = lazyWithRetry(() => import("./components/KhoiThemSuc.jsx"));
const KhoiPhungVu   = lazyWithRetry(() => import("./components/KhoiPhungVu.jsx"));
const KhoiKinhThanh = lazyWithRetry(() => import("./components/KhoiKinhThanh.jsx"));
const KhoiVaoDoi    = lazyWithRetry(() => import("./components/KhoiVaoDoi.jsx"));
const TaiLieu       = lazyWithRetry(() => import("./components/TaiLieu.jsx"));
const TestQuiz      = lazyWithRetry(() => import("./components/TestQuiz.jsx"));
const BaoMat        = lazyWithRetry(() => import("./components/BaoMat.jsx"));
const QuyDinh       = lazyWithRetry(() => import("./components/QuyDinh.jsx"));
const GioiThieu     = lazyWithRetry(() => import("./components/GioiThieu.jsx"));
const TuyenSinh     = lazyWithRetry(() => import("./components/TuyenSinh.jsx"));
const LichSinhHoat  = lazyWithRetry(() => import("./components/LichSinhHoat.jsx"));
const LichHoc       = lazyWithRetry(() => import("./components/LichHoc.jsx"));
const GioiTre       = lazyWithRetry(() => import("./components/GioiTre.jsx"));

// ── Bài viết ──
const ArticleList   = lazyWithRetry(() => import("./components/articles/ArticleList.jsx"));
const ArticleDetail = lazyWithRetry(() => import("./components/articles/ArticleDetail.jsx"));
const MyArticles    = lazyWithRetry(() => import("./components/articles/MyArticles.jsx"));
const ArticleEditor = lazyWithRetry(() => import("./components/articles/ArticleEditor.jsx"));

const DashboardTab    = lazyWithRetry(() => import("./components/admin/DashboardTab.jsx"));
const UsersTab        = lazyWithRetry(() => import("./components/admin/UsersTab.jsx"));
const ClassesTab      = lazyWithRetry(() => import("./components/admin/ClassesTab.jsx"));
const AdminGradesTab  = lazyWithRetry(() => import("./components/admin/GradesTab.jsx"));
const ReportsTab      = lazyWithRetry(() => import("./components/admin/reports/ReportsTab.jsx"));
const BroadcastTab    = lazyWithRetry(() => import("./components/admin/BroadcastTab.jsx"));
const ArticlesTab     = lazyWithRetry(() => import("./components/admin/articles/ArticlesTab.jsx"));
const DangKyTab       = lazyWithRetry(() => import("./components/admin/DangKyTab.jsx"));
const GopYTab         = lazyWithRetry(() => import("./components/admin/GopYTab.jsx"));

const TeacherSummaryTab   = lazyWithRetry(() => import("./components/teacher/SummaryTab.jsx"));
const TeacherRosterTab    = lazyWithRetry(() => import("./components/teacher/RosterTab.jsx"));
const TeacherAttendanceTab= lazyWithRetry(() => import("./components/teacher/AttendanceTab.jsx"));
const TeacherGradesTab    = lazyWithRetry(() => import("./components/teacher/GradesTab.jsx"));

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

    const username = localStorage.getItem("username");
    if (username) setIsLogin(true);

    const savedFontSize = localStorage.getItem("fontSize");
    if (savedFontSize && fontSizeMap[savedFontSize]) {
      setFontSize(savedFontSize);
    }
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