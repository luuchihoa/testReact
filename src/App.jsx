import React, { lazy, Suspense, useEffect, useState } from "react";
import { ToastProvider } from "./components/ui/ToastContext.jsx";
import { Routes, Route, useLocation, Outlet } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

const ReactLenisLazy = lazy(() => 
  import("lenis/react").then(mod => {
    const WrappedComponent = (props) => {
      return <mod.ReactLenis {...props} ref={(inst) => { if (inst) window.lenis = inst.lenis; }} />;
    };
    return { default: WrappedComponent };
  })
);

import Header from "./components/Header1.jsx";
import Home from "./components/Home.jsx";
import Footer from "./components/Footer.jsx";
import ScrollToTop from "./components/ui/ScrollToTop.jsx";

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
const ModalUser     = lazyWithRetry(() => import("./components/ModalUser.jsx"));
const Contact       = lazyWithRetry(() => import("./components/Contact.jsx"));
const Setting       = lazyWithRetry(() => import("./components/Setting.jsx"));
const KhoiChienCon  = lazyWithRetry(() => import("./components/KhoiChienCon.jsx"));
const KhoiRuocLe    = lazyWithRetry(() => import("./components/KhoiRuocLe.jsx"));
const KhoiThemSuc   = lazyWithRetry(() => import("./components/KhoiThemSuc1.jsx"));
const KhoiPhungVu   = lazyWithRetry(() => import("./components/KhoiPhungVu1.jsx"));
const KhoiKinhThanh = lazyWithRetry(() => import("./components/KhoiKinhThanh1.jsx"));
const KhoiVaoDoi    = lazyWithRetry(() => import("./components/KhoiVaoDoi.jsx"));
const TaiLieu       = lazyWithRetry(() => import("./components/TaiLieu1.jsx"));
const TestQuiz      = lazyWithRetry(() => import("./components/TestQuiz.jsx"));
const BaoMat        = lazyWithRetry(() => import("./components/BaoMat.jsx"));
const QuyDinh       = lazyWithRetry(() => import("./components/QuyDinh.jsx"));
const GioiThieu     = lazyWithRetry(() => import("./components/GioiThieu.jsx"));
const TuyenSinh     = lazyWithRetry(() => import("./components/TuyenSinh.jsx"));
const LichSinhHoat  = lazyWithRetry(() => import("./components/LichSinhHoat.jsx"));

function PageLoader() {
  return (
    <div className="min-h-[60vh] w-full flex flex-col items-center justify-center bg-[#faf8f5]/50 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3">
        <svg className="w-8 h-8 animate-spin text-orange-600" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
        <p className="text-sm text-stone-400 font-medium tracking-wide animate-pulse">Đang tải...</p>
      </div>
    </div>
  );
}

const fontSizeMap = {
  sm: "text-sm",
  base: "text-base",
  lg: "text-lg",
  xl: "text-xl",
};

const AppLayout = ({ fontSize, toggleModal, isLogin, setIsLogin, handleClose }) => (
  <div className={`${fontSizeMap[fontSize]} min-h-screen flex flex-col bg-[#faf8f5] text-stone-900 antialiased transition-all duration-300 selection:bg-orange-100 selection:text-orange-900`}>
    <Header toggleModal={toggleModal} isLogin={isLogin} setIsLogin={setIsLogin} handleClose={handleClose}/>
    <main className="w-full flex-grow pb-16">
      <Suspense fallback={<PageLoader />}>
        <Outlet />
      </Suspense>
    </main>
    <Footer />
  </div>
);

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
          <Route path="tài-liệu" element={<TaiLieu />} />
          <Route path="lịch-sinh-hoạt" element={<LichSinhHoat />} />
          <Route path="liên-hệ" element={<Contact />} />
          <Route path="cài-đặt" element={<Setting fontSize={fontSize} setFontSize={handleFontSizeChange} />} />
          <Route path="bảo-mật" element={<BaoMat />} />
          <Route path="quy-định" element={<QuyDinh />} />
        </Route>
        <Route
          path="/:khoi/:type"
          element={
            <div className={`${fontSizeMap[fontSize]} min-h-screen bg-stone-50 antialiased`}>
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
          {isLogin && turnOnModal && (
            <ModalUser key="modal-user" setIsLogin={setIsLogin} handleClose={handleClose} />
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