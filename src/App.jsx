import React, { lazy, Suspense, useEffect, useState } from "react";
import { ToastProvider } from "./components/ui/ToastContext.jsx";
import { Routes, Route, useLocation, Outlet } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { ReactLenis } from "lenis/react"; // 1. Import Lenis

// ─── Luôn tải ngay (Critical Path) ──────────────────────────────
import Header from "./components/Header.jsx";
import Home from "./components/Home.jsx";
import Footer from "./components/Footer.jsx";
import ScrollToTop from "./components/ui/ScrollToTop.jsx";

// ─── Hàm bọc Lazy Load tự động reload khi bị lỗi bộ nhớ đệm (Chunk Error) ───
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

// ─── Lazy load các trang con để tối ưu tốc độ tải trang đầu ──────────
const ModalLogin   = lazyWithRetry(() => import("./components/ModalLogin.jsx"));
const ModalUser    = lazyWithRetry(() => import("./components/ModalUser.jsx"));
const Contact       = lazyWithRetry(() => import("./components/Contact.jsx"));
const Setting       = lazyWithRetry(() => import("./components/Setting.jsx"));
const KhoiKinhThanh = lazyWithRetry(() => import("./components/KhoiKinhThanh.jsx"));
const KhoiPhungVu   = lazyWithRetry(() => import("./components/KhoiPhungVu.jsx"));
const KhoiThemSuc   = lazyWithRetry(() => import("./components/KhoiThemSuc.jsx"));
const TaiLieu       = lazyWithRetry(() => import("./components/TaiLieu.jsx"));
const TestQuiz      = lazyWithRetry(() => import("./components/TestQuiz.jsx"));
const BaoMat        = lazyWithRetry(() => import("./components/BaoMat.jsx"));
const QuyDinh       = lazyWithRetry(() => import("./components/QuyDinh.jsx"));
const GioiThieu     = lazyWithRetry(() => import("./components/GioiThieu.jsx"));
const TuyenSinh     = lazyWithRetry(() => import("./components/TuyenSinh.jsx"));
const LichSinhHoat  = lazyWithRetry(() => import("./components/LichSinhHoat.jsx"));

// ─── Fallback Loader Giao diện khi đang tải trang con ──────────────
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

export default function App() {
  const [fontSize, setFontSize] = useState("base");
  const [turnOnModal, setTurnOnModal] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const location = useLocation();

  // Thêm kiểm tra xem có phải là mobile không (chạy ngay trong component)
  const isMobile = typeof window !== "undefined" && /Mobi|Android|iPhone/i.test(navigator.userAgent);

  const toggleModal = () => setTurnOnModal(true);
  const handleClose = () => setTurnOnModal(false);

  // Khởi tạo kiểm tra dữ liệu cũ từ máy người dùng
  useEffect(() => {
    const username = localStorage.getItem("username");
    if (username) setIsLogin(true);

    const savedFontSize = localStorage.getItem("fontSize");
    if (savedFontSize && fontSizeMap[savedFontSize]) {
      setFontSize(savedFontSize);
    }
  }, []);

  // Hàm thay đổi Font Size kết hợp tự động cập nhật LocalStorage
  const handleFontSizeChange = (size) => {
    if (fontSizeMap[size]) {
      setFontSize(size);
      localStorage.setItem("fontSize", size);
    }
  };

  return (
    <ToastProvider>
      {/* 2. Bọc toàn bộ ứng dụng bằng ReactLenis với thuộc tính root */}
      <ReactLenis root options={{ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) }}>
        
        {/* ScrollToTop nằm trong Router, ngoài Routes */}
        <ScrollToTop />

        {/* AnimatePresence #1 — CHỈ cho route transitions */}
        <AnimatePresence mode="wait" initial={!isMobile}>
          <Routes location={location} key={isMobile ? undefined : location.pathname}>
            {/* Layout có Header + Footer */}
            <Route
              element={
                <div className={`${fontSizeMap[fontSize]} min-h-screen flex flex-col bg-[#faf8f5] text-stone-900 antialiased transition-all duration-300 selection:bg-orange-100 selection:text-orange-900`}>
                  <Header toggleModal={toggleModal} isLogin={isLogin} />
                  <main className="w-full flex-grow pb-16">
                    <Suspense fallback={<PageLoader />}>
                      {/* Truyền hàm bọc mới xuống Outlet */}
                      <Outlet context={{ fontSize, setFontSize: handleFontSizeChange }} />
                    </Suspense>
                  </main>
                  <Footer />
                </div>
              }
            >
              {/* Trang chủ chạy trực tiếp */}
              <Route index element={<Home />} />
              
              {/* Các route con chạy qua lazy load */}
              <Route path="khối-kinh-thánh" element={<KhoiKinhThanh />} />
              <Route path="khối-phụng-vụ" element={<KhoiPhungVu />} />
              <Route path="khối-thêm-sức" element={<KhoiThemSuc />} />
              <Route path="tuyển-sinh" element={<TuyenSinh />} />
              <Route path="tài-liệu" element={<TaiLieu />} />
              <Route path="liên-hệ" element={<Contact />} />
              <Route path="cài-đặt" element={<Setting />} />
              <Route path="bảo-mật" element={<BaoMat />} />
              <Route path="quy-định" element={<QuyDinh />} />
              <Route path="giới-thiệu" element={<GioiThieu />} />
              <Route path="lịch-sinh-hoạt" element={<LichSinhHoat />} />
            </Route>

            {/* Quiz KHÔNG có Header / Footer — Vẫn được áp dụng kích thước font chữ */}
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
        </AnimatePresence>

        {/* AnimatePresence #2 — RIÊNG cho modal, độc lập với route transitions */}
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
        
      </ReactLenis>
    </ToastProvider>
  );
}