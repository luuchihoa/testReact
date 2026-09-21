import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion as Motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ENROLLMENT_FAQS } from "../enrollmentConfig.js";

function FaqItem({ faq, isOpen, onToggle }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="bg-ui-surface rounded-xl sm:rounded-2xl border border-ui-border overflow-hidden transition-colors">
      <button
        type="button"
        id={`faq-trigger-${faq.id}`}
        aria-expanded={isOpen}
        aria-controls={`faq-panel-${faq.id}`}
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-3 p-4 sm:p-5 text-left font-bold text-sm sm:text-base text-ui-text focus:outline-none focus-visible:ring-2 focus-visible:ring-ui-primary min-h-[44px]"
      >
        <span className="leading-snug pr-2">{faq.question}</span>
        <span
          className={`shrink-0 w-8 h-8 rounded-full bg-ui-bg border border-ui-border flex items-center justify-center text-ui-muted transition-transform duration-200 motion-reduce:transition-none ${
            isOpen ? "rotate-180 text-ui-primary" : ""
          }`}
          aria-hidden="true"
        >
          <ChevronDown className="w-4 h-4" />
        </span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <Motion.div
            id={`faq-panel-${faq.id}`}
            role="region"
            aria-labelledby={`faq-trigger-${faq.id}`}
            initial={prefersReducedMotion ? false : { height: 0, opacity: 0 }}
            animate={prefersReducedMotion ? false : { height: "auto", opacity: 1 }}
            exit={prefersReducedMotion ? false : { height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-1 text-xs sm:text-sm text-ui-muted leading-relaxed border-t border-ui-border">
              {faq.answer}
            </div>
          </Motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function EnrollmentFaq() {
  const [openId, setOpenId] = useState(ENROLLMENT_FAQS[0]?.id || null);

  const handleToggle = (id) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="py-10 sm:py-16 bg-ui-bg border-t border-ui-border">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="mb-8 sm:mb-10 text-center sm:text-left">
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-ui-accent-text mb-1">
            Giải đáp thắc mắc
          </p>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-serif font-bold text-ui-text">
            Câu hỏi thường gặp
          </h2>
          <p className="text-xs sm:text-sm text-ui-muted mt-1.5 leading-relaxed">
            Các thắc mắc phổ biến của phụ huynh về chương trình và thủ tục học Giáo lý.
          </p>
        </div>

        <div className="space-y-3">
          {ENROLLMENT_FAQS.map((faq) => (
            <FaqItem
              key={faq.id}
              faq={faq}
              isOpen={openId === faq.id}
              onToggle={() => handleToggle(faq.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
