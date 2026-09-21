import React from "react";
import { CheckCircle2, UserCheck, School } from "lucide-react";
import { motion as Motion, useReducedMotion } from "framer-motion";
import { ENROLLMENT_WORKFLOW_STEPS } from "../enrollmentConfig.js";

const STEP_ICONS = [CheckCircle2, UserCheck, School];

export function EnrollmentWorkflow() {
  const prefersReducedMotion = useReducedMotion();

  const containerVariants = {
    hidden: { opacity: prefersReducedMotion ? 1 : 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.06,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: prefersReducedMotion ? 1 : 0,
      y: prefersReducedMotion ? 0 : 12,
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

  return (
    <section className="py-10 sm:py-16 bg-ui-bg border-t border-ui-border">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Header căn trái tạo nhịp thị giác tự nhiên */}
        <div className="mb-8 sm:mb-12">
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-ui-accent-text mb-1">
            Quy trình tiếp nhận
          </p>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-serif font-bold text-ui-text">
            3 Bước tham gia lớp Giáo lý
          </h2>
        </div>

        {/* Timeline với đường nối dọc trên mobile và đường nối ngang trên desktop */}
        <Motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="relative grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-8"
        >
          {/* Đường timeline ngang trên desktop */}
          <div
            className="hidden md:block absolute top-4 left-[15%] right-[15%] h-0.5 bg-ui-border -z-0"
            aria-hidden="true"
          />

          {ENROLLMENT_WORKFLOW_STEPS.map((step, index) => {
            const StepIcon = STEP_ICONS[index] || CheckCircle2;
            return (
              <Motion.div
                key={step.step}
                variants={itemVariants}
                className="relative z-10 flex flex-row md:flex-col items-start text-left gap-4 md:gap-3"
              >
                {/* Đường timeline dọc nối các bước trên mobile */}
                {index < ENROLLMENT_WORKFLOW_STEPS.length - 1 && (
                  <div
                    className="md:hidden absolute top-9 left-4 bottom-[-24px] w-0.5 bg-ui-border"
                    aria-hidden="true"
                  />
                )}

                {/* Number badge & Icon */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="w-8 h-8 rounded-full bg-ui-primary text-ui-on-primary font-bold text-sm flex items-center justify-center shadow-xs">
                    {step.step}
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-ui-surface border border-ui-border flex items-center justify-center text-ui-accent-text">
                    <StepIcon className="w-4 h-4" aria-hidden="true" />
                  </div>
                </div>

                {/* Text Content */}
                <div className="flex-1">
                  <h3 className="font-bold text-base text-ui-text mb-1.5">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-ui-muted leading-relaxed max-w-sm">
                    {step.desc}
                  </p>
                </div>
              </Motion.div>
            );
          })}
        </Motion.div>
      </div>
    </section>
  );
}
