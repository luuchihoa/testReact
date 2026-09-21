import React, { useRef, useCallback, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useLenis } from "lenis/react";
import { useReducedMotion } from "framer-motion";
import {
  ENROLLMENT_CONFIG,
  getEnrollmentStatus,
} from "../features/enrollment/enrollmentConfig.js";
import { useEnrollmentForm } from "../features/enrollment/useEnrollmentForm.js";
import { EnrollmentHero } from "../features/enrollment/components/EnrollmentHero.jsx";
import { EnrollmentEssentials } from "../features/enrollment/components/EnrollmentEssentials.jsx";
import { EnrollmentFormSection } from "../features/enrollment/components/EnrollmentFormSection.jsx";
import { EnrollmentWorkflow } from "../features/enrollment/components/EnrollmentWorkflow.jsx";
import { EnrollmentSectorGrid } from "../features/enrollment/components/EnrollmentSectorGrid.jsx";
import { EnrollmentFaq } from "../features/enrollment/components/EnrollmentFaq.jsx";
import { EnrollmentContact } from "../features/enrollment/components/EnrollmentContact.jsx";

export default function TuyenSinh() {
  const location = useLocation();
  const lenis = useLenis();
  const prefersReducedMotion = useReducedMotion();

  const enrollmentStatus = getEnrollmentStatus();
  const formState = useEnrollmentForm();

  // Refs quản lý focus cho các khu vực đích khi cuộn
  const formHeadingRef = useRef(null);
  const contactHeadingRef = useRef(null);
  const sectorsHeadingRef = useRef(null);

  /**
   * Helper cuộn trang mượt kèm quản lý focus cho accessibility
   */
  const scrollToTarget = useCallback((targetId, focusRef) => {
    const el = document.getElementById(targetId);
    if (!el) return;

    if (lenis && !prefersReducedMotion) {
      lenis.scrollTo(el, {
        offset: -40,
        duration: 0.5,
        onComplete: () => {
          focusRef?.current?.focus({ preventScroll: true });
        },
      });
    } else {
      el.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" });
      if (focusRef?.current) {
        setTimeout(() => {
          focusRef.current.focus({ preventScroll: true });
        }, prefersReducedMotion ? 50 : 500);
      }
    }
  }, [lenis, prefersReducedMotion]);

  // Hành động CTA chính ở Hero
  const handlePrimaryCta = useCallback(() => {
    if (enrollmentStatus === "closed") {
      scrollToTarget("lien-he-giao-ly", contactHeadingRef);
    } else {
      scrollToTarget("form-dang-ky", formHeadingRef);
    }
  }, [enrollmentStatus, scrollToTarget]);

  // Hành động CTA phụ ở Hero
  const handleSecondaryCta = useCallback(() => {
    scrollToTarget("cac-khoi-hoc", sectorsHeadingRef);
  }, [scrollToTarget]);

  // Chọn khối từ Sector Grid và cuộn vào Form
  const handleSelectSector = useCallback((khoiFormValue) => {
    if (khoiFormValue) {
      formState.setKhoiDangKy(khoiFormValue);
    }
    scrollToTarget("form-dang-ky", formHeadingRef);
  }, [formState, scrollToTarget]);

  // Cuộn đến khối liên hệ
  const handleGoToContact = useCallback(() => {
    scrollToTarget("lien-he-giao-ly", contactHeadingRef);
  }, [scrollToTarget]);

  // Cuộn đến form
  const handleGoToForm = useCallback(() => {
    scrollToTarget("form-dang-ky", formHeadingRef);
  }, [scrollToTarget]);

  // Cuộn đến danh sách khối
  const handleGoToSectors = useCallback(() => {
    scrollToTarget("cac-khoi-hoc", sectorsHeadingRef);
  }, [scrollToTarget]);

  // Xử lý hash URL khi người dùng truy cập trực tiếp (ví dụ /tuyển-sinh#form)
  useEffect(() => {
    let timerId = null;
    if (location.hash === "#form" || location.hash === "#form-dang-ky") {
      timerId = setTimeout(() => {
        scrollToTarget("form-dang-ky", formHeadingRef);
      }, 150);
    } else if (location.hash === "#khoi" || location.hash === "#cac-khoi-hoc") {
      timerId = setTimeout(() => {
        scrollToTarget("cac-khoi-hoc", sectorsHeadingRef);
      }, 150);
    }

    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, [location.hash, scrollToTarget]);

  return (
    <div className="min-h-screen bg-ui-bg text-ui-text flex flex-col selection:bg-ui-primary selection:text-ui-on-primary">
      {/* 1. Hero Section */}
      <EnrollmentHero
        enrollmentStatus={enrollmentStatus}
        config={ENROLLMENT_CONFIG}
        onPrimaryCtaClick={handlePrimaryCta}
        onSecondaryCtaClick={handleSecondaryCta}
      />

      {/* 2. Unified Panel Thông Tin Thiết Yếu */}
      <EnrollmentEssentials />

      {/* 3. Form Đăng Ký Trực Tuyến hoặc Hướng Dẫn Khi Đóng / Sắp Mở */}
      <EnrollmentFormSection
        enrollmentStatus={enrollmentStatus}
        config={ENROLLMENT_CONFIG}
        formState={formState}
        onGoToContact={handleGoToContact}
        onGoToSectors={handleGoToSectors}
        headingRef={formHeadingRef}
      />

      {/* 4. Quy Trình Tiếp Nhận 3 Bước */}
      <EnrollmentWorkflow />

      {/* 5. 6 Khối Giáo Lý với Màu Ngành Chuẩn & Ma Trận CTA */}
      <EnrollmentSectorGrid
        enrollmentStatus={enrollmentStatus}
        onSelectSector={handleSelectSector}
        onGoToContact={handleGoToContact}
        onGoToForm={handleGoToForm}
      />

      {/* 6. Câu Hỏi Thường Gặp (FAQ) */}
      <EnrollmentFaq />

      {/* 7. Khối Hotline & Liên Hệ Hỗ Trợ */}
      <EnrollmentContact
        config={ENROLLMENT_CONFIG}
        headingRef={contactHeadingRef}
      />
    </div>
  );
}