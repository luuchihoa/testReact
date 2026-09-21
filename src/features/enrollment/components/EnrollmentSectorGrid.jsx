import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, Phone } from "lucide-react";
import { motion as Motion, useReducedMotion } from "framer-motion";
import { ENROLLMENT_ALL_SECTORS } from "../enrollmentConfig.js";

export function EnrollmentSectorGrid({
  enrollmentStatus,
  onSelectSector,
  onGoToContact,
  onGoToForm,
}) {
  const prefersReducedMotion = useReducedMotion();

  const containerVariants = {
    hidden: { opacity: prefersReducedMotion ? 1 : 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.04,
      },
    },
  };

  const cardVariants = {
    hidden: {
      opacity: prefersReducedMotion ? 1 : 0,
      y: prefersReducedMotion ? 0 : 14,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: prefersReducedMotion ? 0 : 0.35,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  const isOpen = enrollmentStatus === "open";
  const isUpcoming = enrollmentStatus === "upcoming";

  return (
    <section id="cac-khoi-hoc" className="py-10 sm:py-16 bg-ui-bg scroll-mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header căn trái trên md để nhịp thị giác tự nhiên, phong phú */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 sm:mb-10">
          <div>
            <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-ui-accent-text mb-1">
              Chương trình Giáo lý
            </p>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-serif font-bold text-ui-text">
              6 Khối học tại Xứ đoàn An Ngãi
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-ui-muted max-w-md leading-relaxed">
            Chương trình giáo dục đức tin được biên soạn phù hợp với tâm sinh lý và từng chặng đường trưởng thành của thiếu nhi.
          </p>
        </div>

        <Motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6"
        >
          {ENROLLMENT_ALL_SECTORS.map((sector) => {
            const SectorIcon = sector.icon;

            return (
              <Motion.div
                key={sector.id}
                variants={cardVariants}
                className="bg-ui-surface rounded-2xl border border-ui-border p-5 sm:p-6 shadow-xs flex flex-col justify-between transition-[box-shadow,transform] duration-200 [@media(hover:hover)_and_(pointer:fine)]:hover:shadow-md [@media(hover:hover)_and_(pointer:fine)]:hover:-translate-y-0.5 motion-reduce:transform-none"
              >
                <div>
                  {/* Top Bar: Icon ngành & Badge tuổi/khối */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${sector.iconBg}`}>
                      <SectorIcon className="w-5 h-5" aria-hidden="true" />
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs font-bold text-ui-muted bg-ui-bg border border-ui-border px-2.5 py-0.5 rounded-full">
                        {sector.age || sector.ageText}
                      </span>
                      {sector.isOpenOnline ? (
                        <span className="text-[0.75rem] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-md">
                          {isOpen ? "Đang nhận online" : isUpcoming ? "Sắp mở đăng ký" : "Hỗ trợ trực tiếp"}
                        </span>
                      ) : (
                        <span className="text-[0.75rem] font-medium text-ui-muted bg-ui-bg border border-ui-border px-2 py-0.5 rounded-md">
                          Đăng ký trực tiếp
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Tên khối & Lớp */}
                  <div className="mb-2.5">
                    <h3 className="font-bold text-base sm:text-lg text-ui-text">
                      {sector.name}
                    </h3>
                    <p className="text-xs text-ui-muted font-medium mt-0.5">
                      {sector.grades}
                    </p>
                  </div>

                  {/* Mô tả ngắn */}
                  <p className="text-xs sm:text-sm text-ui-muted leading-relaxed mb-5 line-clamp-3">
                    {sector.desc}
                  </p>
                </div>

                {/* Footer Buttons: CTA đăng ký & Link chi tiết khối */}
                <div className="pt-3 border-t border-ui-border flex items-center justify-between gap-2 mt-auto">
                  {isOpen && sector.isOpenOnline ? (
                    <button
                      type="button"
                      onClick={() => onSelectSector(sector.formValue)}
                      className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-ui-primary [@media(hover:hover)_and_(pointer:fine)]:hover:opacity-80 transition-opacity min-h-[44px]"
                    >
                      <span>Điền hồ sơ khối này</span>
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  ) : isOpen && !sector.isOpenOnline ? (
                    <button
                      type="button"
                      onClick={onGoToContact}
                      className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-ui-muted [@media(hover:hover)_and_(pointer:fine)]:hover:text-ui-text transition-colors min-h-[44px]"
                    >
                      <span>Liên hệ Ban Giáo lý</span>
                      <Phone className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  ) : isUpcoming && sector.isOpenOnline ? (
                    <button
                      type="button"
                      onClick={onGoToForm}
                      className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-ui-muted [@media(hover:hover)_and_(pointer:fine)]:hover:text-ui-text transition-colors min-h-[44px]"
                    >
                      <span>Xem thông tin chuẩn bị</span>
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={onGoToContact}
                      className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-ui-muted [@media(hover:hover)_and_(pointer:fine)]:hover:text-ui-text transition-colors min-h-[44px]"
                    >
                      <span>Liên hệ đăng ký bổ sung</span>
                      <Phone className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  )}

                  <Link
                    to={sector.path}
                    className="inline-flex items-center gap-1 text-xs text-ui-muted [@media(hover:hover)_and_(pointer:fine)]:hover:text-ui-text transition-colors min-h-[44px] px-2"
                  >
                    <span>Chi tiết</span>
                    <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </Link>
                </div>
              </Motion.div>
            );
          })}
        </Motion.div>
      </div>
    </section>
  );
}
