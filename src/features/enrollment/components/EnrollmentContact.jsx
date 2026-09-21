import React from "react";
import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, MessageSquare, ArrowRight, HelpCircle } from "lucide-react";

export function EnrollmentContact({ config, headingRef }) {
  return (
    <section
      id="lien-he-giao-ly"
      className="py-12 sm:py-16 bg-ui-bg border-t border-ui-border scroll-mt-20"
      aria-label="Khu vực liên hệ hỗ trợ"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Bố cục 2 cột bất đối xứng trên desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Cột trái: Tiêu đề & Thông tin kênh liên hệ */}
          <div className="lg:col-span-7">
            <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-ui-accent-text mb-1">
              Hỗ trợ phụ huynh
            </p>
            <h2
              ref={headingRef}
              tabIndex={-1}
              className="text-2xl sm:text-3xl font-serif font-bold text-ui-text focus:outline-none mb-3"
            >
              Liên hệ Ban Giáo lý Xứ đoàn
            </h2>
            <p className="text-xs sm:text-sm text-ui-muted leading-relaxed mb-6 max-w-lg">
              Nếu Quý phụ huynh cần tư vấn xếp lớp, giải đáp thủ tục chuyển xứ hoặc có nguyện vọng đặc biệt cho con em, xin vui lòng liên hệ trực tiếp:
            </p>

            <div className="space-y-3">
              {/* Hotline */}
              <a
                href={`tel:${config.hotline.replace(/\s+/g, "")}`}
                className="flex items-center gap-3.5 p-3.5 rounded-xl bg-ui-surface border border-ui-border [@media(hover:hover)_and_(pointer:fine)]:hover:border-ui-primary/50 transition-colors min-h-[44px]"
              >
                <div className="w-9 h-9 rounded-lg bg-ui-bg border border-ui-border flex items-center justify-center text-ui-primary shrink-0">
                  <Phone className="w-4 h-4" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-xs text-ui-muted font-medium">Hotline Ban Giáo lý</p>
                  <p className="text-sm font-bold text-ui-text">{config.hotline}</p>
                </div>
              </a>

              {/* Email */}
              <a
                href={`mailto:${config.email}`}
                className="flex items-center gap-3.5 p-3.5 rounded-xl bg-ui-surface border border-ui-border [@media(hover:hover)_and_(pointer:fine)]:hover:border-ui-primary/50 transition-colors min-h-[44px]"
              >
                <div className="w-9 h-9 rounded-lg bg-ui-bg border border-ui-border flex items-center justify-center text-ui-primary shrink-0">
                  <Mail className="w-4 h-4" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-ui-muted font-medium">Email giải đáp</p>
                  <p className="text-sm font-bold text-ui-text truncate">{config.email}</p>
                </div>
              </a>

              {/* Địa chỉ */}
              <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-ui-surface border border-ui-border">
                <div className="w-9 h-9 rounded-lg bg-ui-bg border border-ui-border flex items-center justify-center text-ui-primary shrink-0">
                  <MapPin className="w-4 h-4" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-xs text-ui-muted font-medium">Văn phòng Giáo lý</p>
                  <p className="text-xs sm:text-sm font-bold text-ui-text">Nhà xứ An Ngãi ({config.address})</p>
                </div>
              </div>
            </div>
          </div>

          {/* Cột phải: Hộp gửi câu hỏi trực tuyến nổi bật */}
          <div className="lg:col-span-5 bg-ui-surface rounded-2xl border border-ui-border p-6 sm:p-7 shadow-xs flex flex-col justify-between h-full">
            <div>
              <div className="w-10 h-10 rounded-xl bg-ui-bg border border-ui-border flex items-center justify-center text-ui-accent-text mb-4">
                <HelpCircle className="w-5 h-5" aria-hidden="true" />
              </div>
              <h3 className="font-bold text-base sm:text-lg text-ui-text mb-2">
                Bạn có câu hỏi riêng?
              </h3>
              <p className="text-xs sm:text-sm text-ui-muted leading-relaxed mb-6">
                Gửi lời nhắn hoặc thắc mắc về thời gian học, thủ tục nhập học của thiếu nhi qua biểu mẫu liên hệ trực tuyến.
              </p>
            </div>

            <Link
              to="/liên-hệ"
              className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-ui-primary text-ui-on-primary font-bold text-sm sm:text-base [@media(hover:hover)_and_(pointer:fine)]:hover:opacity-95 active:scale-[0.98] motion-reduce:transform-none transition-[opacity,transform] min-h-[44px] w-full"
            >
              <MessageSquare className="w-4 h-4" aria-hidden="true" />
              <span>Gửi lời nhắn tới Ban Giáo lý</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
