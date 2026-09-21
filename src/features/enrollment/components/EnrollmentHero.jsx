import React from "react";
import { ArrowRight, BookOpen, Phone } from "lucide-react";
import { motion as Motion, useReducedMotion } from "framer-motion";

export function EnrollmentHero({
  enrollmentStatus,
  config,
  onPrimaryCtaClick,
  onSecondaryCtaClick,
}) {
  const prefersReducedMotion = useReducedMotion();

  const containerVariants = {
    hidden: { opacity: prefersReducedMotion ? 1 : 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.07,
        delayChildren: prefersReducedMotion ? 0 : 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: prefersReducedMotion ? 1 : 0,
      y: prefersReducedMotion ? 0 : 16,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: prefersReducedMotion ? 0 : 0.4,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  const isOpen = enrollmentStatus === "open";
  const isUpcoming = enrollmentStatus === "upcoming";

  return (
    <section className="relative isolate overflow-hidden pt-8 pb-12 sm:pt-14 sm:pb-16 bg-ui-bg text-ui-text border-b border-ui-border">
      {/* Ambient background glow tạo chiều sâu trang nhã */}
      <div
        className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent dark:from-amber-400/5"
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <Motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center"
        >
          {/* Badge trạng thái tuyển sinh & Niên khóa (chấm tĩnh, không lặp animation) */}
          <Motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold border border-ui-border bg-ui-surface shadow-xs mb-6">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isOpen
                  ? "bg-emerald-500"
                  : isUpcoming
                  ? "bg-amber-500"
                  : "bg-stone-400"
              }`}
              aria-hidden="true"
            />
            <span className="text-ui-muted">Niên khóa {config.academicYearSpaced}</span>
            <span className="text-ui-border">·</span>
            <span
              className={
                isOpen
                  ? "text-emerald-700 dark:text-emerald-400 font-bold"
                  : isUpcoming
                  ? "text-amber-700 dark:text-amber-400 font-bold"
                  : "text-ui-muted"
              }
            >
              {isOpen
                ? "Đang nhận hồ sơ trực tuyến"
                : isUpcoming
                ? "Sắp mở đợt tuyển sinh"
                : "Đã kết thúc đợt đăng ký"}
            </span>
          </Motion.div>

          {/* H1 Mobile >= 36px (text-4xl = 2.25rem = 36px) */}
          <Motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-ui-text leading-[1.15] mb-5 max-w-3xl"
          >
            Đăng Ký Học Giáo Lý
          </Motion.h1>

          {/* Đoạn dẫn ngắn gọn */}
          <Motion.p
            variants={itemVariants}
            className="text-base sm:text-lg text-ui-muted max-w-2xl mx-auto leading-relaxed mb-8"
          >
            Xứ đoàn An Ngãi hân hoan chào đón các em thiếu nhi bước vào hành trình gieo mầm đức tin, học hỏi Lời Chúa và chuẩn bị tâm hồn đón nhận các Bí tích cứu độ.
          </Motion.p>

          {/* Nút hành động chính (CTAs) */}
          <Motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3.5 w-full max-w-md sm:max-w-none"
          >
            {isOpen ? (
              <button
                type="button"
                onClick={onPrimaryCtaClick}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-ui-primary text-ui-on-primary font-bold text-base shadow-sm hover:opacity-95 active:scale-[0.98] transition-opacity min-h-[44px]"
              >
                <span>Điền đơn đăng ký ngay</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            ) : isUpcoming ? (
              <button
                type="button"
                onClick={onPrimaryCtaClick}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-ui-primary text-ui-on-primary font-bold text-base shadow-sm hover:opacity-95 active:scale-[0.98] transition-opacity min-h-[44px]"
              >
                <span>Xem thông tin & chuẩn bị</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onPrimaryCtaClick}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-ui-primary text-ui-on-primary font-bold text-base shadow-sm hover:opacity-95 active:scale-[0.98] transition-opacity min-h-[44px]"
              >
                <Phone className="w-4 h-4" aria-hidden="true" />
                <span>Liên hệ Ban Giáo lý ({config.hotline})</span>
              </button>
            )}

            <button
              type="button"
              onClick={onSecondaryCtaClick}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-ui-surface border border-ui-border text-ui-text font-bold text-base hover:bg-ui-bg active:scale-[0.98] transition-colors min-h-[44px]"
            >
              <BookOpen className="w-4 h-4 text-ui-muted" aria-hidden="true" />
              <span>Các khối Giáo lý & Độ tuổi</span>
            </button>
          </Motion.div>
        </Motion.div>
      </div>
    </section>
  );
}
