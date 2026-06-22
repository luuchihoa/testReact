import React from "react";
import { useEffect, useState } from "react";
import { ToastProvider } from "./components/ui/ToastContext.jsx";
import { Routes, Route, useLocation, Outlet } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { ReactLenis } from "lenis/react"; // 1. Import Lenis
import Header from "./components/Header.jsx";
import ModalLogin from "./components/ModalLogin.jsx";
import ModalUser from "./components/ModalUser.jsx";
import Home from "./components/Home.jsx";
import Contact from "./components/Contact.jsx";
import Setting from "./components/Setting.jsx";
import KhoiKinhThanh from "./components/KhoiKinhThanh.jsx";
import KhoiPhungVu from "./components/KhoiPhungVu.jsx";
import KhoiThemSuc from "./components/KhoiThemSuc.jsx";
import TaiLieu from "./components/TaiLieu.jsx";
import TestQuiz from "./components/TestQuiz.jsx";
import Footer from "./components/Footer.jsx";
import BaoMat from "./components/BaoMat.jsx";
import QuyDinh from "./components/QuyDinh.jsx";
import GioiThieu from "./components/GioiThieu1.jsx";
import LichSinhHoat from "./components/LichSinhHoat.jsx";
import ScrollToTop from "./components/ui/ScrollToTop.jsx";

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

  const toggleModal = () => setTurnOnModal(true);
  const handleClose = () => setTurnOnModal(false);

  useEffect(() => {
    const username = localStorage.getItem("username");
    if (username) setIsLogin(true);

    const savedFontSize = localStorage.getItem("fontSize");
    if (savedFontSize && fontSizeMap[savedFontSize]) {
      setFontSize(savedFontSize);
    }
  }, []);

  return (
    <ToastProvider>
      {/* 2. Bọc toàn bộ ứng dụng bằng ReactLenis với thuộc tính root */}
      <ReactLenis root options={{ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) }}>
        
        {/* ScrollToTop nằm trong Router, ngoài Routes */}
        <ScrollToTop />

        {/* AnimatePresence #1 — CHỈ cho route transitions */}
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            {/* Layout có Header + Footer */}
            <Route
              element={
                <div className={`${fontSizeMap[fontSize]} min-h-screen flex flex-col bg-[#faf8f5] text-stone-900 antialiased transition-all duration-200`}>
                  <Header toggleModal={toggleModal} isLogin={isLogin} />
                  <main className="w-full flex-grow pb-16">
                    <Outlet context={{ fontSize, setFontSize }} />
                  </main>
                  <Footer />
                </div>
              }
            >
              <Route index element={<Home />} />
              <Route path="khối-kinh-thánh" element={<KhoiKinhThanh />} />
              <Route path="khối-phụng-vụ" element={<KhoiPhungVu />} />
              <Route path="khối-thêm-sức" element={<KhoiThemSuc />} />
              <Route path="tài-liệu" element={<TaiLieu />} />
              <Route path="liên-hệ" element={<Contact />} />
              <Route path="cài-đặt" element={<Setting />} />
              <Route path="bảo-mật" element={<BaoMat />} />
              <Route path="quy-định" element={<QuyDinh />} />
              <Route path="giới-thiệu" element={<GioiThieu />} />
              <Route path="lịch-sinh-hoạt" element={<LichSinhHoat />} />
            </Route>

            {/* Quiz KHÔNG có Header / Footer */}
            <Route path="/:khoi/:type" element={<TestQuiz />} />
          </Routes>
        </AnimatePresence>

        {/* AnimatePresence #2 — RIÊNG cho modal, độc lập với route transitions */}
        <AnimatePresence>
          {!isLogin && turnOnModal && (
            <ModalLogin key="modal-login" handleClose={handleClose} setIsLogin={setIsLogin} />
          )}
          {isLogin && turnOnModal && (
            <ModalUser key="modal-user" setIsLogin={setIsLogin} handleClose={handleClose} />
          )}
        </AnimatePresence>
        
      </ReactLenis>
    </ToastProvider>
  );
}