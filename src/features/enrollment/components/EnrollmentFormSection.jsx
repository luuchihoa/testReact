import React, { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  Info,
  Phone,
  RotateCcw,
  Send,
  ShieldCheck,
} from "lucide-react";
import { motion as Motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ENROLLMENT_FORM_OPTIONS } from "../enrollmentConfig.js";

export function EnrollmentFormSection({
  enrollmentStatus,
  config,
  formState,
  onGoToContact,
  onGoToSectors,
  headingRef,
}) {
  const prefersReducedMotion = useReducedMotion();

  const {
    formData,
    errors,
    touched,
    submissionStatus,
    errorMessage,
    successData,
    ageRecommendation,
    handleChange,
    handleBlur,
    handleSubmit,
    handleResetForm,
  } = formState;

  // Local field refs cho accessibility & focus management
  const hoTenRef = useRef(null);
  const namSinhRef = useRef(null);
  const sdtRef = useRef(null);
  const giaoXomRef = useRef(null);
  const khoiDangKyRef = useRef(null);
  const ghiChuRef = useRef(null);
  const successHeadingRef = useRef(null);
  const errorBannerRef = useRef(null);

  const isOpen = enrollmentStatus === "open";
  const isUpcoming = enrollmentStatus === "upcoming";
  const isSubmitting = submissionStatus === "submitting";

  // Tự động focus vào tiêu đề thành công khi gửi đơn thành công
  useEffect(() => {
    if (submissionStatus === "success" && successHeadingRef.current) {
      successHeadingRef.current.focus();
    }
  }, [submissionStatus]);

  // Tự động focus vào banner lỗi khi phát sinh lỗi
  useEffect(() => {
    if ((submissionStatus === "error" || submissionStatus === "uncertain") && errorBannerRef.current) {
      errorBannerRef.current.focus();
    }
  }, [submissionStatus]);

  const onFormSubmit = (e) => {
    handleSubmit(e, (validationErrors) => {
      const firstField = Object.keys(validationErrors)[0];
      const refMap = {
        hoTen: hoTenRef,
        namSinh: namSinhRef,
        sdt: sdtRef,
        giaoXom: giaoXomRef,
        khoiDangKy: khoiDangKyRef,
        ghiChu: ghiChuRef,
      };
      if (firstField && refMap[firstField]?.current) {
        refMap[firstField].current.focus();
      }
    });
  };

  const onResetAndFocus = () => {
    handleResetForm();
    setTimeout(() => {
      if (hoTenRef.current) {
        hoTenRef.current.focus();
      }
    }, 100);
  };

  const formTransitionVariants = {
    initial: {
      opacity: prefersReducedMotion ? 1 : 0,
      y: prefersReducedMotion ? 0 : 8,
    },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: prefersReducedMotion ? 0 : 0.25,
        ease: [0.16, 1, 0.3, 1],
      },
    },
    exit: {
      opacity: prefersReducedMotion ? 1 : 0,
      y: prefersReducedMotion ? 0 : -8,
      transition: {
        duration: prefersReducedMotion ? 0 : 0.2,
      },
    },
  };

  const bannerVariants = {
    initial: {
      opacity: prefersReducedMotion ? 1 : 0,
      height: prefersReducedMotion ? "auto" : 0,
    },
    animate: {
      opacity: 1,
      height: "auto",
      transition: {
        duration: prefersReducedMotion ? 0 : 0.25,
      },
    },
    exit: {
      opacity: prefersReducedMotion ? 1 : 0,
      height: prefersReducedMotion ? "auto" : 0,
      transition: {
        duration: prefersReducedMotion ? 0 : 0.2,
      },
    },
  };

  return (
    <section
      id="form-dang-ky"
      className="py-10 sm:py-16 bg-ui-bg scroll-mt-20"
      aria-label="Khu vực đăng ký học giáo lý"
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Tiêu đề mục chính */}
        <div className="text-center mb-8">
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-ui-accent-text mb-1">
            {isOpen ? "Biểu mẫu trực tuyến" : isUpcoming ? "Chuẩn bị tuyển sinh" : "Thông báo tuyển sinh"}
          </p>
          <h2
            ref={headingRef}
            tabIndex={-1}
            className="text-2xl sm:text-3xl font-serif font-bold text-ui-text focus:outline-none"
          >
            {isOpen
              ? "Đăng Ký Học Giáo Lý Trực Tuyến"
              : isUpcoming
              ? "Kế Hoạch Tuyển Sinh Giáo Lý"
              : "Tình Trạng Tiếp Nhận Hồ Sơ"}
          </h2>
          <p className="text-xs sm:text-sm text-ui-muted mt-2 max-w-lg mx-auto leading-relaxed">
            {isOpen
              ? "Phụ huynh vui lòng điền chính xác thông tin bên dưới để Ban Giáo lý liên hệ và sắp xếp lớp học cho thiếu nhi."
              : isUpcoming
              ? `Đợt tuyển sinh niên khóa ${config.academicYearSpaced} dự kiến sẽ mở trong thời gian tới. Quý phụ huynh có thể tìm hiểu trước các khối học và chuẩn bị thông tin.`
              : `Hiện tại đợt tuyển sinh hè niên khóa ${config.academicYearSpaced} đã kết thúc. Quý phụ huynh có nhu cầu đăng ký bổ sung xin vui lòng liên hệ trực tiếp Ban Giáo lý.`}
          </p>
        </div>

        {/* Khối nội dung chính (Form hoặc Thông báo tương ứng 3 trạng thái) */}
        <div className="bg-ui-surface rounded-2xl sm:rounded-3xl border border-ui-border shadow-xs p-5 sm:p-8 md:p-10">
          <AnimatePresence mode="wait">
            {isUpcoming ? (
              /* TRƯỜNG HỢP 1: SẮP MỞ ĐỢT TUYỂN SINH */
              <Motion.div
                key="upcoming-state"
                variants={formTransitionVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="text-center py-6 sm:py-8 flex flex-col items-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-700 dark:text-amber-400 mb-5">
                  <Calendar className="w-7 h-7" aria-hidden="true" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-ui-text mb-2">
                  Sắp Mở Đợt Đăng Ký Niên Khóa {config.academicYearSpaced}
                </h3>
                <p className="text-xs sm:text-sm text-ui-muted max-w-md mx-auto mb-6 leading-relaxed">
                  Cổng đăng ký trực tuyến sẽ sớm mở tiếp nhận hồ sơ. Quý phụ huynh có thể xem trước danh sách khối lớp, độ tuổi và chuẩn bị thông tin cho các em.
                </p>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full max-w-md">
                  <button
                    type="button"
                    onClick={onGoToSectors}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-ui-primary text-ui-on-primary font-bold text-sm sm:text-base hover:opacity-95 active:scale-[0.98] transition-opacity min-h-[44px]"
                  >
                    <span>Xem 6 khối học & độ tuổi</span>
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={onGoToContact}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-ui-bg border border-ui-border text-ui-text font-bold text-sm sm:text-base hover:bg-ui-surface active:scale-[0.98] transition-colors min-h-[44px]"
                  >
                    <Phone className="w-4 h-4" aria-hidden="true" />
                    <span>Liên hệ Ban Giáo lý</span>
                  </button>
                </div>
              </Motion.div>
            ) : !isOpen ? (
              /* TRƯỜNG HỢP 2: ĐÃ ĐÓNG TUYỂN SINH */
              <Motion.div
                key="closed-state"
                variants={formTransitionVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="text-center py-6 sm:py-8 flex flex-col items-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-700 dark:text-amber-400 mb-5">
                  <Clock className="w-7 h-7" aria-hidden="true" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-ui-text mb-2">
                  Đợt Tuyển Sinh Hè Đã Khép Lại
                </h3>
                <p className="text-xs sm:text-sm text-ui-muted max-w-md mx-auto mb-6 leading-relaxed">
                  Lớp học Giáo lý niên khóa {config.academicYearSpaced} đã bước vào chương trình học chính thức. Nếu gia đình có nhu cầu đăng ký bổ sung hoặc chuyển xứ, xin vui lòng liên hệ trực tiếp Ban Giáo lý.
                </p>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full max-w-md">
                  <a
                    href={`tel:${config.hotline.replace(/\s+/g, "")}`}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-ui-primary text-ui-on-primary font-bold text-sm sm:text-base hover:opacity-95 active:scale-[0.98] transition-opacity min-h-[44px]"
                  >
                    <Phone className="w-4 h-4" aria-hidden="true" />
                    <span>Gọi Hotline: {config.hotline}</span>
                  </a>
                  <button
                    type="button"
                    onClick={onGoToContact}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-ui-bg border border-ui-border text-ui-text font-bold text-sm sm:text-base hover:bg-ui-surface active:scale-[0.98] transition-colors min-h-[44px]"
                  >
                    <span>Xem thông tin liên hệ</span>
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              </Motion.div>
            ) : submissionStatus === "success" && successData ? (
              /* TRƯỜNG HỢP 3: MÀN HÌNH GỬI THÀNH CÔNG */
              <Motion.div
                key="success-state"
                variants={formTransitionVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="text-center py-6 sm:py-8 flex flex-col items-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-5">
                  <CheckCircle2 className="w-7 h-7" aria-hidden="true" />
                </div>
                <h3
                  ref={successHeadingRef}
                  tabIndex={-1}
                  className="text-xl sm:text-2xl font-serif font-bold text-ui-text mb-2 focus:outline-none"
                >
                  Tiếp Nhận Đơn Đăng Ký Thành Công!
                </h3>
                <p className="text-xs sm:text-sm text-ui-muted max-w-md mx-auto mb-6 leading-relaxed">
                  Cảm ơn Quý phụ huynh đã gửi thông tin đăng ký cho em{" "}
                  <strong className="text-ui-text">{successData.hoTen}</strong> vào{" "}
                  <strong className="text-ui-text">{successData.khoi}</strong>. Ban Giáo lý sẽ liên hệ theo SĐT{" "}
                  <strong className="text-ui-text">{successData.sdt}</strong> để xác nhận hồ sơ.
                </p>

                {/* Hướng dẫn ngắn gọn */}
                <div className="w-full bg-ui-bg rounded-xl border border-ui-border p-4 text-left text-xs sm:text-sm text-ui-muted mb-6 space-y-1.5">
                  <p className="font-bold text-ui-text flex items-center gap-2">
                    <Info className="w-4 h-4 text-ui-accent-text shrink-0" aria-hidden="true" />
                    <span>Lưu ý dành cho phụ huynh:</span>
                  </p>
                  <p className="leading-relaxed">
                    Ban Giáo lý sẽ liên hệ xác nhận thông tin và hướng dẫn chi tiết về lịch sinh hoạt trước ngày khai giảng.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full max-w-md">
                  <button
                    type="button"
                    onClick={onResetAndFocus}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-ui-primary text-ui-on-primary font-bold text-sm sm:text-base hover:opacity-95 active:scale-[0.98] transition-opacity min-h-[44px]"
                  >
                    <RotateCcw className="w-4 h-4" aria-hidden="true" />
                    <span>Gửi thêm hồ sơ khác</span>
                  </button>
                  <Link
                    to="/"
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-ui-bg border border-ui-border text-ui-text font-bold text-sm sm:text-base hover:bg-ui-surface active:scale-[0.98] transition-colors min-h-[44px]"
                  >
                    <span>Về Trang chủ</span>
                  </Link>
                </div>
              </Motion.div>
            ) : (
              /* TRƯỜNG HỢP 4: BIỂU MẪU ĐĂNG KÝ TRỰC TUYẾN */
              <Motion.form
                key="form-state"
                variants={formTransitionVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                onSubmit={onFormSubmit}
                noValidate
                className="space-y-5 sm:space-y-6"
              >
                {/* Banner Thông báo Lỗi API hoặc Kết nối */}
                <AnimatePresence>
                  {(submissionStatus === "error" || submissionStatus === "uncertain") && (
                    <Motion.div
                      ref={errorBannerRef}
                      tabIndex={-1}
                      variants={bannerVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-800 dark:text-rose-300 text-xs sm:text-sm flex items-start gap-3 focus:outline-none"
                      role="alert"
                      aria-live="assertive"
                    >
                      <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" aria-hidden="true" />
                      <div className="flex-1">
                        <p className="font-bold mb-0.5">
                          {submissionStatus === "uncertain" ? "Chưa thể xác nhận gửi đơn" : "Không thể gửi hồ sơ"}
                        </p>
                        <p className="leading-relaxed">{errorMessage}</p>
                      </div>
                    </Motion.div>
                  )}
                </AnimatePresence>

                {/* 1. Họ và tên thiếu nhi */}
                <div>
                  <label
                    htmlFor="field-ho-ten"
                    className="block text-xs sm:text-sm font-bold text-ui-text mb-1.5"
                  >
                    Tên Thánh và họ tên thiếu nhi <span className="text-rose-600" aria-hidden="true">*</span>
                  </label>
                  <input
                    ref={hoTenRef}
                    id="field-ho-ten"
                    name="hoTen"
                    type="text"
                    required
                    maxLength={100}
                    placeholder="Ví dụ: Maria Nguyễn Thị Mai"
                    autoComplete="name"
                    value={formData.hoTen}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    aria-invalid={Boolean(touched.hoTen && errors.hoTen)}
                    aria-describedby={errors.hoTen ? "error-ho-ten" : "hint-ho-ten"}
                    className={`w-full px-4 py-3 rounded-xl bg-ui-bg border text-base text-ui-text placeholder:text-ui-muted/60 transition-colors focus:outline-none focus:ring-2 focus:ring-ui-primary min-h-[44px] ${
                      touched.hoTen && errors.hoTen
                        ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500"
                        : "border-ui-border"
                    }`}
                  />
                  {touched.hoTen && errors.hoTen ? (
                    <p id="error-ho-ten" className="mt-1 text-xs text-rose-600 dark:text-rose-400 font-medium">
                      {errors.hoTen}
                    </p>
                  ) : (
                    <p id="hint-ho-ten" className="mt-1 text-xs text-ui-muted">
                      Nhập kèm Tên Thánh của em (nếu có).
                    </p>
                  )}
                </div>

                {/* 2. Năm sinh & Số điện thoại phụ huynh (2 cột trên sm) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <div>
                    <label
                      htmlFor="field-nam-sinh"
                      className="block text-xs sm:text-sm font-bold text-ui-text mb-1.5"
                    >
                      Năm sinh <span className="text-rose-600" aria-hidden="true">*</span>
                    </label>
                    <input
                      ref={namSinhRef}
                      id="field-nam-sinh"
                      name="namSinh"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={4}
                      required
                      placeholder="Ví dụ: 2018"
                      value={formData.namSinh}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      aria-invalid={Boolean(touched.namSinh && errors.namSinh)}
                      aria-describedby={errors.namSinh ? "error-nam-sinh" : undefined}
                      className={`w-full px-4 py-3 rounded-xl bg-ui-bg border text-base text-ui-text placeholder:text-ui-muted/60 transition-colors focus:outline-none focus:ring-2 focus:ring-ui-primary min-h-[44px] ${
                        touched.namSinh && errors.namSinh
                          ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500"
                          : "border-ui-border"
                      }`}
                    />
                    {touched.namSinh && errors.namSinh && (
                      <p id="error-nam-sinh" className="mt-1 text-xs text-rose-600 dark:text-rose-400 font-medium">
                        {errors.namSinh}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="field-sdt"
                      className="block text-xs sm:text-sm font-bold text-ui-text mb-1.5"
                    >
                      Số điện thoại phụ huynh <span className="text-rose-600" aria-hidden="true">*</span>
                    </label>
                    <input
                      ref={sdtRef}
                      id="field-sdt"
                      name="sdt"
                      type="tel"
                      inputMode="tel"
                      maxLength={15}
                      required
                      placeholder="Ví dụ: 0905 123 456"
                      autoComplete="tel"
                      value={formData.sdt}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      aria-invalid={Boolean(touched.sdt && errors.sdt)}
                      aria-describedby={errors.sdt ? "error-sdt" : undefined}
                      className={`w-full px-4 py-3 rounded-xl bg-ui-bg border text-base text-ui-text placeholder:text-ui-muted/60 transition-colors focus:outline-none focus:ring-2 focus:ring-ui-primary min-h-[44px] ${
                        touched.sdt && errors.sdt
                          ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500"
                          : "border-ui-border"
                      }`}
                    />
                    {touched.sdt && errors.sdt && (
                      <p id="error-sdt" className="mt-1 text-xs text-rose-600 dark:text-rose-400 font-medium">
                        {errors.sdt}
                      </p>
                    )}
                  </div>
                </div>

                {/* 3. Giáo họ / Giáo xóm */}
                <div>
                  <label
                    htmlFor="field-giao-xom"
                    className="block text-xs sm:text-sm font-bold text-ui-text mb-1.5"
                  >
                    Giáo họ / Giáo xóm cư trú <span className="text-rose-600" aria-hidden="true">*</span>
                  </label>
                  <input
                    ref={giaoXomRef}
                    id="field-giao-xom"
                    name="giaoXom"
                    type="text"
                    required
                    maxLength={100}
                    placeholder="Ví dụ: Giáo họ An Ngãi Tây, Xóm 2..."
                    value={formData.giaoXom}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    aria-invalid={Boolean(touched.giaoXom && errors.giaoXom)}
                    aria-describedby={errors.giaoXom ? "error-giao-xom" : undefined}
                    className={`w-full px-4 py-3 rounded-xl bg-ui-bg border text-base text-ui-text placeholder:text-ui-muted/60 transition-colors focus:outline-none focus:ring-2 focus:ring-ui-primary min-h-[44px] ${
                      touched.giaoXom && errors.giaoXom
                        ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500"
                        : "border-ui-border"
                    }`}
                  />
                  {touched.giaoXom && errors.giaoXom && (
                    <p id="error-giao-xom" className="mt-1 text-xs text-rose-600 dark:text-rose-400 font-medium">
                      {errors.giaoXom}
                    </p>
                  )}
                </div>

                {/* 4. Khối đăng ký học (Native Select với option đầu hướng dẫn) */}
                <div>
                  <label
                    htmlFor="field-khoi"
                    className="block text-xs sm:text-sm font-bold text-ui-text mb-1.5"
                  >
                    Khối học đăng ký <span className="text-rose-600" aria-hidden="true">*</span>
                  </label>
                  <select
                    ref={khoiDangKyRef}
                    id="field-khoi"
                    name="khoiDangKy"
                    value={formData.khoiDangKy}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    aria-invalid={Boolean(touched.khoiDangKy && errors.khoiDangKy)}
                    aria-describedby={errors.khoiDangKy ? "error-khoi" : "hint-khoi"}
                    className={`w-full px-4 py-3 rounded-xl bg-ui-bg border text-base text-ui-text transition-colors focus:outline-none focus:ring-2 focus:ring-ui-primary min-h-[44px] ${
                      touched.khoiDangKy && errors.khoiDangKy
                        ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500"
                        : "border-ui-border"
                    }`}
                  >
                    <option value="" disabled>
                      -- Chọn khối Giáo lý muốn đăng ký --
                    </option>
                    {ENROLLMENT_FORM_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label} ({opt.recommendedAge})
                      </option>
                    ))}
                  </select>
                  {touched.khoiDangKy && errors.khoiDangKy ? (
                    <p id="error-khoi" className="mt-1 text-xs text-rose-600 dark:text-rose-400 font-medium">
                      {errors.khoiDangKy}
                    </p>
                  ) : (
                    <p id="hint-khoi" className="mt-1 text-xs text-ui-muted">
                      Đăng ký trực tuyến áp dụng cho các khối từ Khai Tâm đến Phụng Vụ.
                    </p>
                  )}
                </div>

                {/* Cảnh báo gợi ý lệch độ tuổi (Soft Age Warning) */}
                <AnimatePresence>
                  {ageRecommendation?.isUnusual && (
                    <Motion.div
                      variants={bannerVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs sm:text-sm flex items-start gap-2.5 overflow-hidden"
                    >
                      <Info className="w-4 h-4 shrink-0 text-amber-700 dark:text-amber-400 mt-0.5" aria-hidden="true" />
                      <div className="leading-relaxed">
                        <span>{ageRecommendation.message}</span>
                      </div>
                    </Motion.div>
                  )}
                </AnimatePresence>

                {/* 5. Ghi chú thêm (Tùy chọn) kèm bộ đếm ký tự */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="field-ghi-chu"
                      className="block text-xs sm:text-sm font-bold text-ui-text"
                    >
                      Ghi chú thêm <span className="text-ui-muted font-normal text-xs">(Không bắt buộc)</span>
                    </label>
                    <span className={`text-xs ${formData.ghiChu?.length >= 450 ? "text-amber-600 dark:text-amber-400 font-medium" : "text-ui-muted"}`}>
                      {formData.ghiChu?.length || 0}/500
                    </span>
                  </div>
                  <textarea
                    ref={ghiChuRef}
                    id="field-ghi-chu"
                    name="ghiChu"
                    rows={3}
                    maxLength={500}
                    placeholder="Ví dụ: Em đã học xong lớp Khai Tâm tại Giáo xứ khác, nguyện vọng học cùng anh/chị..."
                    value={formData.ghiChu}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="w-full px-4 py-2.5 rounded-xl bg-ui-bg border border-ui-border text-base text-ui-text placeholder:text-ui-muted/60 transition-colors focus:outline-none focus:ring-2 focus:ring-ui-primary"
                  />
                </div>

                {/* Cam kết bảo mật & Nút gửi hồ sơ */}
                <div className="pt-2 flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-xs text-ui-muted">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />
                    <span>Thông tin được sử dụng để tiếp nhận hồ sơ và hỗ trợ xếp lớp Giáo lý tại Giáo xứ An Ngãi.</span>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-ui-primary text-ui-on-primary font-bold text-base shadow-sm [@media(hover:hover)_and_(pointer:fine)]:hover:opacity-95 active:scale-[0.98] motion-reduce:transform-none transition-[opacity,transform] disabled:opacity-60 disabled:cursor-not-allowed min-h-[44px]"
                  >
                    {isSubmitting ? (
                      <>
                        <div
                          className="w-5 h-5 border-2 border-ui-on-primary/30 border-t-ui-on-primary rounded-full animate-spin motion-reduce:animate-none"
                          aria-hidden="true"
                        />
                        <span>Đang gửi hồ sơ...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" aria-hidden="true" />
                        <span>Xác nhận nộp đơn đăng ký</span>
                      </>
                    )}
                  </button>
                </div>
              </Motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
