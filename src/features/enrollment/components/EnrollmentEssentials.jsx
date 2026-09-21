import React from "react";
import { Heart, Clock, MapPin, BookOpen } from "lucide-react";
import { motion as Motion, useReducedMotion } from "framer-motion";
import { ESSENTIAL_INFO_ITEMS } from "../enrollmentConfig.js";

const ICONS_MAP = {
  target: Heart,
  schedule: Clock,
  location: MapPin,
  fees: BookOpen,
};

export function EnrollmentEssentials() {
  const prefersReducedMotion = useReducedMotion();

  const containerVariants = {
    hidden: { opacity: prefersReducedMotion ? 1 : 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.05,
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
    <section className="py-10 sm:py-14 bg-ui-bg">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Phân cấp heading chuẩn ngữ nghĩa */}
        <div className="text-center mb-6 sm:mb-8">
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-ui-accent-text mb-1">
            Thông tin cần biết
          </p>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-serif font-bold text-ui-text">
            Những điều phụ huynh cần chuẩn bị
          </h2>
        </div>

        {/* Unified Panel với đường phân cách viền sắc nét ở mọi kích thước màn hình */}
        <Motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="grid grid-cols-1 min-[390px]:grid-cols-2 lg:grid-cols-4 gap-px bg-ui-border rounded-2xl overflow-hidden border border-ui-border shadow-xs"
        >
          {ESSENTIAL_INFO_ITEMS.map((item) => {
            const IconComponent = ICONS_MAP[item.id] || Heart;
            return (
              <Motion.div
                key={item.id}
                variants={itemVariants}
                className="bg-ui-surface p-4 sm:p-5 flex flex-col gap-2.5"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-ui-bg border border-ui-border flex items-center justify-center text-ui-accent-text shrink-0">
                    <IconComponent className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <h3 className="font-bold text-sm sm:text-base text-ui-text">
                    {item.title}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-ui-muted leading-relaxed">
                  {item.desc}
                </p>
              </Motion.div>
            );
          })}
        </Motion.div>
      </div>
    </section>
  );
}
