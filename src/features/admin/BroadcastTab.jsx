import React, { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { Link } from "react-router";
import {
  Megaphone, Link2, Send, History, Clock, Inbox, Mail, Eye, Bell, Trash2,
  Sparkles, RefreshCw, Search, X, BookOpen, Calendar, GraduationCap, Users,
  Church, AlertTriangle, Info, Smartphone, Monitor, ChevronRight, Check
} from "lucide-react";
import { useLenis } from "lenis/react";
import { useAdminContext } from "./AdminContext.jsx";
import {
  sendBroadcastNotification, fetchRecentBroadcasts, sendNewsletter,
  deleteBroadcast, fetchBroadcastAudienceCounts
} from "./dataLayer.js";
import { Spinner } from "../../components/ui/Skeleton.jsx";

const TITLE_MAX = 120;
const MESSAGE_MAX = 1000;

function relativeTime(iso) {
  if (!iso) return "Không xác định";
  const d = new Date(iso);
  const diffMs = Date.now() - d.getTime();
  const min = Math.round(diffMs / 60000);
  if (min < 1) return "Vừa xong";
  if (min < 60) return `${min} phút trước`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr} giờ trước`;
  const day = Math.round(hr / 24);
  if (day < 7) return `${day} ngày trước`;
  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

// ── KHO MẪU THÔNG BÁO PHỤNG VỤ CHUẨN HOÁ ──
const BROADCAST_TEMPLATES = [
  {
    id: "lich-hoc",
    label: "Lịch Lễ & Giáo lý",
    icon: Calendar,
    title: "Thông báo Lịch Thánh Lễ và Giờ Học Giáo Lý Chúa Nhật",
    message: "Kính gửi quý phụ huynh và các em thiếu nhi: Sáng Chúa Nhật ngày [chọn ngày], các em tham dự Thánh Lễ lúc [chọn giờ] và vào giờ học Giáo lý từ [chọn giờ bắt đầu] – [chọn giờ kết thúc]. Xin quý phụ huynh nhắc nhở các em đi lễ đúng giờ và mang theo sách vở đầy đủ.",
    link: "/lịch-học",
    channel: "all_web",
  },
  {
    id: "tuyen-sinh",
    label: "Tuyển sinh Niên khóa",
    icon: GraduationCap,
    title: "Thông báo Tuyển sinh & Đăng ký Học Giáo Lý Niên Khóa Mới",
    message: "Ban Giáo lý Giáo xứ An Ngãi bắt đầu mở cổng tiếp nhận hồ sơ đăng ký học Giáo lý Niên khóa [chọn niên khóa] cho các em thiếu nhi trong độ tuổi [chọn độ tuổi hoặc khối lớp]. Kính mời quý phụ huynh đăng ký trực tuyến hoặc liên hệ trực tiếp tại Văn phòng Giáo xứ.",
    link: "/tuyển-sinh",
    channel: "email",
  },
  {
    id: "nghi-le",
    label: "Nghỉ lễ Phụng vụ",
    icon: Church,
    title: "Thông báo Tạm Nghỉ Học Giáo Lý Dịp Lễ Phụng Vụ",
    message: "Ban Giáo lý xin thông báo: Các lớp Giáo lý sẽ tạm nghỉ học vào ngày [chọn ngày] nhân dịp [nhập tên ngày lễ]. Các em thiếu nhi vẫn tham dự Thánh Lễ theo lịch phụng vụ của Giáo xứ.",
    link: "/lịch-sinh-hoạt",
    channel: "all_web",
  },
  {
    id: "hop-glv",
    label: "Họp Giáo lý viên",
    icon: Users,
    title: "Thư mời Họp Ban Giáo lý viên & Huynh trưởng Định kỳ",
    message: "Kính mời toàn thể quý Thầy Cô Giáo lý viên và Huynh trưởng tham dự buổi họp mục vụ giáo lý vào lúc [chọn giờ, ngày] tại [nhập địa điểm] để chuẩn bị kế hoạch sinh hoạt sắp tới.",
    link: "/lịch-sinh-hoạt",
    channel: "teachers",
  },
  {
    id: "khao-hach",
    label: "Khảo hạch Bí tích",
    icon: BookOpen,
    title: "Kế hoạch Khảo Hạch Giáo Lý & Tĩnh Tâm Chuẩn Bị Bí Tích",
    message: "Thông báo đến các em thiếu nhi Khối [chọn khối lớp] về lịch khảo hạch giáo lý và tĩnh tâm chuẩn bị đón nhận Bí tích vào ngày [chọn ngày]. Xin quý phụ huynh đồng hành và giúp các em ôn luyện kinh bổn chu đáo.",
    link: "/tài-liệu",
    channel: "all_web",
  },
];

// ── PHÍM TẮT LIÊN KẾT NỘI BỘ HỢP LỆ (VÙNG CHẠM >= 44PX) ──
const QUICK_LINKS = [
  { label: "Tuyển sinh", path: "/tuyển-sinh" },
  { label: "Lịch học", path: "/lịch-học" },
  { label: "Lịch sinh hoạt", path: "/lịch-sinh-hoạt" },
  { label: "Tài liệu", path: "/tài-liệu" },
  { label: "Bài viết", path: "/bài-viết" },
];

// ── HOOK QUẢN LÝ ACCESSIBILITY CHO BOTTOM SHEET & MODAL ──
function useSheetAccessibility(isOpen, onClose, lenis) {
  const modalRef = useRef(null);
  const previousActiveElement = useRef(null);
  const onCloseRef = useRef(onClose);
  const originalOverflowRef = useRef(null);
  const didLockRef = useRef(false);
  const wasLenisStoppedRef = useRef(false);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    previousActiveElement.current = document.activeElement;

    if (!didLockRef.current) {
      originalOverflowRef.current = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      didLockRef.current = true;
    }

    if (lenis) {
      wasLenisStoppedRef.current = Boolean(lenis.isStopped);
      if (!wasLenisStoppedRef.current) {
        lenis.stop();
      }
    }

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCloseRef.current?.();
        return;
      }

      if (e.key === "Tab") {
        const modal = modalRef.current;
        if (!modal) return;

        const focusable = modal.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    const timer = setTimeout(() => {
      if (modalRef.current) {
        const firstInput = modalRef.current.querySelector(
          'button:not([disabled]), [href], input:not([disabled])'
        );
        firstInput?.focus();
      }
    }, 50);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", handleKeyDown);

      if (didLockRef.current) {
        document.body.style.overflow = originalOverflowRef.current || "";
        didLockRef.current = false;
      }

      if (lenis && !wasLenisStoppedRef.current) {
        lenis.start();
      }

      if (previousActiveElement.current && typeof previousActiveElement.current.focus === "function") {
        previousActiveElement.current.focus();
      }
    };
  }, [isOpen, lenis]);

  return modalRef;
}

// ── MODAL CHỌN MẪU THÔNG BÁO CÓ SẴN (DISCLOSURE SHEET) ──
function TemplatePickerModal({ open, onClose, onSelectTemplate, onClearForm, lenis }) {
  const modalRef = useSheetAccessibility(open, onClose, lenis);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="template-modal-title"
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs transition-opacity"
    >
      <div
        ref={modalRef}
        data-lenis-prevent
        className="w-full sm:max-w-lg bg-[#fffefa] dark:bg-[#1e2821] rounded-t-3xl sm:rounded-3xl border border-[#dedfd4] dark:border-[#354237] shadow-2xl overflow-hidden max-h-[85dvh] flex flex-col pb-[calc(env(safe-area-inset-bottom)+1rem)] sm:pb-5"
      >
        <div className="sm:hidden mx-auto my-3 h-1.5 w-12 rounded-full bg-[#dedfd4] dark:bg-[#354237]" />

        <div className="p-5 pb-3 border-b border-[#dedfd4] dark:border-[#354237] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#927140] dark:text-[#d4b47d]" />
            <h3 id="template-modal-title" className="text-base sm:text-lg font-bold text-[#293d32] dark:text-[#ecece0] font-sans">
              Chọn mẫu thông báo phụng vụ
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng danh sách mẫu"
            className="w-10 h-10 min-w-[40px] rounded-xl flex items-center justify-center text-[#575e55] dark:text-[#b0b9ac] hover:bg-black/5 dark:hover:bg-white/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-5 overflow-y-auto flex-1 flex flex-col gap-2.5">
          {BROADCAST_TEMPLATES.map((tmpl) => {
            const TmplIcon = tmpl.icon;
            return (
              <button
                key={tmpl.id}
                type="button"
                onClick={() => {
                  onSelectTemplate(tmpl);
                  onClose();
                }}
                className="w-full p-3.5 min-h-[56px] rounded-2xl border border-[#dedfd4] dark:border-[#354237] bg-[#faf8f3] dark:bg-[#151c18] text-left hover:border-[#314e3e] dark:hover:border-[#d6b883] hover:bg-[#314e3e]/5 dark:hover:bg-[#d6b883]/10 transition-all flex items-start justify-between gap-3 group active:scale-[0.99] motion-reduce:transition-none"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-[#314e3e]/10 dark:bg-[#d6b883]/20 text-[#314e3e] dark:text-[#d6b883] mt-0.5">
                    <TmplIcon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-xs font-bold text-[#293d32] dark:text-[#ecece0]">
                        {tmpl.label}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-xs font-semibold bg-[#dedfd4]/60 dark:bg-[#354237]/60 text-[#575e55] dark:text-[#b0b9ac]">
                        {tmpl.channel === "email" ? "Email" : tmpl.channel === "teachers" ? "GLV Web" : "Toàn bộ Web"}
                      </span>
                    </div>
                    <p className="text-xs text-[#575e55] dark:text-[#b0b9ac] line-clamp-1 leading-relaxed">
                      {tmpl.title}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#575e55] dark:text-[#b0b9ac] flex-shrink-0 mt-2.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => {
              onClearForm();
              onClose();
            }}
            className="w-full p-3 min-h-[44px] rounded-xl border border-dashed border-[#dedfd4] dark:border-[#354237] text-xs font-bold text-[#575e55] dark:text-[#b0b9ac] hover:bg-black/5 dark:hover:bg-white/5 transition-all text-center mt-1"
          >
            Bắt đầu với nội dung trống (Xóa trắng form)
          </button>
        </div>
      </div>
    </div>
  );
}

// ── MODAL XÁC NHẬN PHÁT TIN MINH BẠCH ĐỐI TƯỢNG ──
function ConfirmSendModal({
  open,
  channel,
  title,
  link,
  recipientCount,
  onCancel,
  onConfirm,
  busy,
  sendError,
  lenis
}) {
  const modalRef = useSheetAccessibility(open, onCancel, lenis);

  if (!open) return null;

  const isCountZero = recipientCount === null || recipientCount === 0;

  const channelMeta = {
    email: {
      name: "Bản tin Email",
      target: "Phụ huynh & người đăng ký qua email",
      icon: Mail,
      badgeColor: "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
      warning: "Hành động này sẽ gửi email thật đến các địa chỉ đã đăng ký. Email không thể thu hồi sau khi gửi.",
      confirmText: recipientCount === null
        ? "Đang tải danh sách người nhận…"
        : isCountZero
        ? "Chưa có người nhận để gửi"
        : `Phát đến ${recipientCount} người`
    },
    all_web: {
      name: "Thông báo Web công khai",
      target: "Tất cả tài khoản hệ thống",
      icon: Megaphone,
      badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300",
      warning: "Thông báo sẽ xuất hiện trong chuông của tất cả tài khoản (Phụ huynh, Thiếu nhi, Giáo lý viên, Ban Quản trị).",
      confirmText: recipientCount === null
        ? "Đang tải danh sách tài khoản…"
        : isCountZero
        ? "Chưa có tài khoản để gửi"
        : `Phát cho ${recipientCount} tài khoản`
    },
    teachers: {
      name: "Thông báo Web nội bộ",
      target: "Giáo lý viên, Huynh trưởng & Ban Quản trị",
      icon: Users,
      badgeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300",
      warning: "Chỉ tài khoản Giáo lý viên, Huynh trưởng và Ban Quản trị mới nhận được thông báo này trong chuông Web.",
      confirmText: recipientCount === null
        ? "Đang tải danh sách Giáo lý viên…"
        : isCountZero
        ? "Chưa có Giáo lý viên để gửi"
        : `Phát cho ${recipientCount} GLV & BQT`
    }
  }[channel] || {
    name: "Thông báo",
    target: "Người nhận",
    icon: Bell,
    badgeColor: "bg-stone-100 text-stone-800",
    warning: "Vui lòng xác nhận nội dung trước khi phát tin.",
    confirmText: "Xác nhận phát"
  };

  const ChannelIcon = channelMeta.icon;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs transition-opacity"
    >
      <div
        ref={modalRef}
        data-lenis-prevent
        className="w-full sm:max-w-lg bg-[#fffefa] dark:bg-[#1e2821] rounded-t-3xl sm:rounded-3xl border border-[#dedfd4] dark:border-[#354237] shadow-2xl overflow-hidden max-h-[90dvh] flex flex-col pb-[calc(env(safe-area-inset-bottom)+1rem)] sm:pb-6"
      >
        <div className="sm:hidden mx-auto my-3 h-1.5 w-12 rounded-full bg-[#dedfd4] dark:bg-[#354237]" />

        <div className="p-5 sm:p-6 overflow-y-auto flex-1 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-[#314e3e]/10 dark:bg-[#d6b883]/20 border border-[#314e3e]/20 dark:border-[#d6b883]/30 flex-shrink-0">
              <ChannelIcon className="w-6 h-6 text-[#314e3e] dark:text-[#d6b883]" />
            </div>
            <div>
              <h3 id="confirm-modal-title" className="text-lg font-bold text-[#293d32] dark:text-[#ecece0] font-sans">
                Phát thông báo này?
              </h3>
              <p className="text-xs text-[#575e55] dark:text-[#b0b9ac] font-medium">
                Kiểm tra kỹ kênh gửi và đối tượng tiếp nhận
              </p>
            </div>
          </div>

          <div className="bg-[#faf8f3] dark:bg-[#151c18] rounded-2xl p-4 border border-[#dedfd4] dark:border-[#354237] flex flex-col gap-2.5 text-xs sm:text-sm">
            <div className="flex items-center justify-between pb-2 border-b border-[#dedfd4]/60 dark:border-[#354237]/60">
              <span className="text-[#575e55] dark:text-[#b0b9ac] font-medium">Kênh gửi:</span>
              <span className={`px-2 py-0.5 rounded-md font-bold text-xs ${channelMeta.badgeColor}`}>
                {channelMeta.name}
              </span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-[#dedfd4]/60 dark:border-[#354237]/60">
              <span className="text-[#575e55] dark:text-[#b0b9ac] font-medium">Đối tượng:</span>
              <span className="font-bold text-[#293d32] dark:text-[#ecece0] text-right">
                {channelMeta.target}
              </span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-[#dedfd4]/60 dark:border-[#354237]/60">
              <span className="text-[#575e55] dark:text-[#b0b9ac] font-medium">Số người dự kiến:</span>
              <span className={`font-bold ${isCountZero ? "text-red-600" : "text-[#314e3e] dark:text-[#d6b883]"}`}>
                {recipientCount !== null ? `${recipientCount} người` : "Chưa xác định"}
              </span>
            </div>

            <div className="flex flex-col gap-1 pt-1">
              <span className="text-[#575e55] dark:text-[#b0b9ac] font-medium">Tiêu đề:</span>
              <span className="font-bold text-[#293d32] dark:text-[#ecece0] line-clamp-2">
                "{title}"
              </span>
            </div>

            {link && (
              <div className="flex items-center gap-1.5 pt-1 text-xs text-[#575e55] dark:text-[#b0b9ac]">
                <Link2 className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">{link}</span>
              </div>
            )}
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-300">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-700 dark:text-amber-400" />
            <span className="leading-relaxed">{channelMeta.warning}</span>
          </div>

          {isCountZero && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-xs font-bold text-red-700 dark:text-red-300 leading-relaxed">
              Cảnh báo: Danh sách đối tượng nhận hiện chưa xác định hoặc bằng 0. Không thể thực hiện phát tin.
            </div>
          )}

          {sendError && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-xs text-red-700 dark:text-red-300 leading-relaxed">
              <strong>Lỗi gửi:</strong> {sendError}
            </div>
          )}
        </div>

        <div className="px-5 sm:px-6 pt-2 flex flex-col-reverse sm:flex-row gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="flex-1 min-h-[44px] px-4 py-2.5 rounded-xl text-sm font-bold bg-[#faf8f3] dark:bg-[#151c18] text-[#293d32] dark:text-[#ecece0] border border-[#dedfd4] dark:border-[#354237] hover:bg-black/5 dark:hover:bg-white/5 transition-all disabled:opacity-50"
          >
            Quay lại chỉnh sửa
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy || isCountZero}
            className="flex-1 min-h-[44px] px-4 py-2.5 rounded-xl text-sm font-bold bg-[#314e3e] text-white dark:bg-[#d6b883] dark:text-[#19251d] hover:bg-[#253d30] dark:hover:bg-[#c4a670] transition-all flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {busy ? (
              <>
                <Spinner className="w-4 h-4" />
                <span>Đang xử lý gửi…</span>
              </>
            ) : (
              <span>{channelMeta.confirmText}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── MODAL XÁC NHẬN XÓA THÔNG BÁO KHỎI LỊCH SỬ ──
function DeleteConfirmModal({ item, onCancel, onConfirm, busy, lenis }) {
  const isOpen = Boolean(item);
  const modalRef = useSheetAccessibility(isOpen, onCancel, lenis);

  if (!item) return null;

  const isEmail = item.type === "email";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs transition-opacity"
    >
      <div
        ref={modalRef}
        data-lenis-prevent
        className="w-full sm:max-w-md bg-[#fffefa] dark:bg-[#1e2821] rounded-t-3xl sm:rounded-3xl border border-red-500/20 shadow-2xl overflow-hidden flex flex-col pb-[calc(env(safe-area-inset-bottom)+1rem)] sm:pb-6"
      >
        <div className="sm:hidden mx-auto my-3 h-1.5 w-12 rounded-full bg-[#dedfd4] dark:bg-[#354237]" />

        <div className="p-5 sm:p-6 flex flex-col items-center text-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-red-100 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400">
            <Trash2 className="w-7 h-7" />
          </div>

          <div>
            <h3 id="delete-modal-title" className="text-lg font-bold text-red-700 dark:text-red-400 font-sans mb-1">
              Xóa thông báo này?
            </h3>
            <p className="text-xs sm:text-sm font-bold text-[#293d32] dark:text-[#ecece0] mb-2 line-clamp-1 px-4">
              "{item.title}"
            </p>
            <p className="text-xs text-[#575e55] dark:text-[#b0b9ac] leading-relaxed px-2">
              {isEmail
                ? "Lưu ý: Thao tác này chỉ xóa bản ghi lưu trong Lịch sử của ban quản trị. Các email đã gửi đến hộp thư cá nhân của người nhận không thể thu hồi."
                : "Thông báo sẽ bị xóa vĩnh viễn khỏi Lịch sử và gỡ bỏ hoàn toàn khỏi chuông thông báo của người nhận trên Web."}
            </p>
          </div>
        </div>

        <div className="px-5 sm:px-6 pt-2 flex flex-col-reverse sm:flex-row gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="flex-1 min-h-[44px] px-4 py-2.5 rounded-xl text-sm font-bold bg-[#faf8f3] dark:bg-[#151c18] text-[#293d32] dark:text-[#ecece0] border border-[#dedfd4] dark:border-[#354237] hover:bg-black/5 dark:hover:bg-white/5 transition-all disabled:opacity-50"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="flex-1 min-h-[44px] px-4 py-2.5 rounded-xl text-sm font-bold bg-red-600 text-white hover:bg-red-700 transition-all flex items-center justify-center gap-2 shadow-xs disabled:opacity-75"
          >
            {busy ? (
              <>
                <Spinner className="w-4 h-4 text-white" />
                <span>Đang xóa…</span>
              </>
            ) : (
              <span>Xác nhận xóa</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── COMPONENT CHÍNH ──
export default function BroadcastTab() {
  const { showToast } = useAdminContext();
  const lenis = useLenis();

  // Form State
  const [channel, setChannel] = useState("email"); // "email" | "all_web" | "teachers"
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [link, setLink] = useState("");

  // Validation State
  const [fieldErrors, setFieldErrors] = useState({});

  // Preview Mode
  const [previewDevice, setPreviewDevice] = useState("mobile"); // "mobile" | "desktop"

  // Data & History State
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState(false);
  const [audienceCounts, setAudienceCounts] = useState({
    subscribers: null,
    teachers: null,
    allUsers: null
  });
  const [audienceError, setAudienceError] = useState(false);

  // UI Flow State & Idempotency Key Ref
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [justSentId, setJustSentId] = useState(null);
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);
  const [sentBanner, setSentBanner] = useState(null); // Persistent post-send banner
  const draftIdempotencyKeyRef = useRef(null);

  // Local Tab Navigation
  const [activeDesktopTab, setActiveDesktopTab] = useState("preview"); // "preview" | "history"
  const [mobileTab, setMobileTab] = useState("compose"); // "compose" | "preview" | "history"
  const [historySearch, setHistorySearch] = useState("");
  const [historyFilterType, setHistoryFilterType] = useState("all"); // "all" | "email" | "broadcast"

  const titleRef = useRef(null);
  const messageRef = useRef(null);
  const linkRef = useRef(null);
  const submitButtonRef = useRef(null);

  // Nạp dữ liệu ban đầu
  const loadInitialData = useCallback(async () => {
    setHistoryLoading(true);
    setHistoryError(false);
    setAudienceError(false);

    try {
      const [hData, audCounts] = await Promise.all([
        fetchRecentBroadcasts(40),
        fetchBroadcastAudienceCounts()
      ]);

      setHistory(hData);
      setAudienceCounts({
        subscribers: audCounts.subscribers,
        teachers: audCounts.teachers,
        allUsers: audCounts.allUsers
      });
      if (audCounts.hasError) {
        setAudienceError(true);
      }
    } catch (err) {
      console.error("Lỗi khởi tạo BroadcastTab:", err);
      setHistoryError(true);
      showToast("Không thể tải dữ liệu thông báo", "warning");
    } finally {
      setHistoryLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    let active = true;

    async function init() {
      try {
        const [hData, audCounts] = await Promise.all([
          fetchRecentBroadcasts(40),
          fetchBroadcastAudienceCounts()
        ]);

        if (!active) return;
        setHistory(hData);
        setAudienceCounts({
          subscribers: audCounts.subscribers,
          teachers: audCounts.teachers,
          allUsers: audCounts.allUsers
        });
        if (audCounts.hasError) setAudienceError(true);
      } catch (err) {
        if (!active) return;
        console.error("Lỗi khởi tạo BroadcastTab:", err);
        setHistoryError(true);
      } finally {
        if (active) setHistoryLoading(false);
      }
    }

    init();

    return () => {
      active = false;
    };
  }, []);

  // Tự động co giãn chiều cao textarea
  useEffect(() => {
    const el = messageRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 260)}px`;
  }, [message]);

  // Tải lại lịch sử sau khi phát tin hoặc xóa
  const reloadHistory = useCallback(async () => {
    try {
      const data = await fetchRecentBroadcasts(40);
      setHistory(data);
      return data;
    } catch (err) {
      console.error("Lỗi reload lịch sử:", err);
      return [];
    }
  }, []);

  // Validation hàm thuần
  const validateForm = useCallback((t, m, l) => {
    const errors = {};
    const trimmedTitle = t.trim();
    const trimmedMsg = m.trim();
    const trimmedLink = l.trim();

    if (!trimmedTitle) {
      errors.title = "Tiêu đề thông báo không được để trống";
    } else if (trimmedTitle.length < 5) {
      errors.title = "Tiêu đề thông báo phải có ít nhất 5 ký tự";
    }

    if (!trimmedMsg) {
      errors.message = "Nội dung thông báo không được để trống";
    } else if (trimmedMsg.length < 10) {
      errors.message = "Nội dung thông báo phải có ít nhất 10 ký tự";
    } else if (/\[.*?\]/.test(trimmedMsg)) {
      errors.message = "Vui lòng thay thế các thông tin trong ngoặc vuông '[...]' trước khi gửi.";
    }

    if (trimmedLink) {
      const isInternal = trimmedLink.startsWith("/");
      const isSecureUrl = /^https:\/\/[a-zA-Z0-9-._~:/?#[\]@!$&'()*+,;=]+$/.test(trimmedLink);
      if (!isInternal && !isSecureUrl) {
        errors.link = "Đường dẫn chỉ chấp nhận route nội bộ (bắt đầu bằng /) hoặc liên kết bảo mật (bắt đầu bằng https://)";
      }
    }

    return errors;
  }, []);

  // Xử lý nạp mẫu thông báo soạn sẵn
  const handleApplyTemplate = (tmpl) => {
    setTitle(tmpl.title);
    setMessage(tmpl.message);
    setLink(tmpl.link || "");
    if (tmpl.channel) setChannel(tmpl.channel);
    setFieldErrors({});
    draftIdempotencyKeyRef.current = null;
    showToast(`Đã nạp mẫu: "${tmpl.label}"`, "info");
    if (mobileTab !== "compose") setMobileTab("compose");
    setTimeout(() => {
      titleRef.current?.focus();
    }, 100);
  };

  const handleClearForm = () => {
    setTitle("");
    setMessage("");
    setLink("");
    setFieldErrors({});
    draftIdempotencyKeyRef.current = null;
    showToast("Đã làm trống khung soạn thảo", "info");
  };

  // Tái sử dụng thông báo cũ từ Lịch sử
  const handleReuse = (item) => {
    setTitle(item.title || "");
    setMessage(item.message || "");
    setLink(item.link || "");
    if (item.type === "email") {
      setChannel("email");
    } else if (item.recipient_role === "teacher") {
      setChannel("teachers");
    } else {
      setChannel("all_web");
    }
    setFieldErrors({});
    draftIdempotencyKeyRef.current = null;
    showToast("Đã nạp lại nội dung vào khung soạn thảo", "success");
    setActiveDesktopTab("preview");
    setMobileTab("compose");
    setTimeout(() => {
      titleRef.current?.focus();
    }, 100);
  };

  // Đếm số lượng người nhận dự kiến của kênh đang chọn
  const currentRecipientCount = useMemo(() => {
    if (channel === "email") return audienceCounts.subscribers;
    if (channel === "teachers") return audienceCounts.teachers;
    return audienceCounts.allUsers;
  }, [channel, audienceCounts]);

  // Bấm nút "Kiểm tra trước khi phát"
  const handleRequestSend = (e) => {
    e.preventDefault();

    if (currentRecipientCount === null || currentRecipientCount === 0) {
      showToast("Chưa có đối tượng nhận xác định để phát tin", "warning");
      return;
    }

    const errors = validateForm(title, message, link);
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      if (errors.title) {
        titleRef.current?.focus();
      } else if (errors.message) {
        messageRef.current?.focus();
      } else if (errors.link) {
        linkRef.current?.focus();
      }
      showToast("Vui lòng hoàn thiện các trường thông tin hợp lệ", "warning");
      return;
    }

    // Tạo key một lần khi mở luồng xác nhận và giữ nguyên cho các lần retry
    if (!draftIdempotencyKeyRef.current) {
      draftIdempotencyKeyRef.current = `bcast_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    }

    setSendError(null);
    setConfirmOpen(true);
  };

  // Xác nhận gửi thông báo thực tế
  const handleConfirmSend = async () => {
    setSending(true);
    setSendError(null);

    const idempotencyKey = draftIdempotencyKeyRef.current;

    try {
      if (channel === "email") {
        const result = await sendNewsletter(title.trim(), message.trim(), link.trim(), idempotencyKey);

        if (result?.status === "partial") {
          const accepted = result.accepted ?? result.delivered ?? 0;
          const rejected = result.rejected ?? result.failed ?? 0;
          const bannerMsg = `Đã tiếp nhận ${accepted}/${result.requested} email (${rejected} địa chỉ gặp lỗi kết nối).`;
          setSentBanner({
            type: "partial",
            message: bannerMsg,
          });
          showToast(bannerMsg, "warning");
        } else {
          const accepted = result?.accepted ?? result?.delivered ?? currentRecipientCount ?? "các";
          const bannerMsg = `Đã tiếp nhận gửi Bản tin Email đến ${accepted} người nhận.`;
          setSentBanner({
            type: "success",
            message: bannerMsg,
          });
          showToast(bannerMsg, "success");
        }
      } else if (channel === "teachers") {
        await sendBroadcastNotification(title.trim(), message.trim(), link.trim(), "teacher");
        const bannerMsg = `Đã phát thông báo nội bộ tới ${audienceCounts.teachers ?? "toàn thể"} Giáo lý viên & BQT trên Web.`;
        setSentBanner({
          type: "success",
          message: bannerMsg,
        });
        showToast(bannerMsg, "success");
      } else {
        await sendBroadcastNotification(title.trim(), message.trim(), link.trim(), null);
        const bannerMsg = `Đã phát thông báo công khai tới ${audienceCounts.allUsers ?? "tất cả"} tài khoản trên Web.`;
        setSentBanner({
          type: "success",
          message: bannerMsg,
        });
        showToast(bannerMsg, "success");
      }

      // Xóa form, reset key và đóng modal
      setTitle("");
      setMessage("");
      setLink("");
      setFieldErrors({});
      draftIdempotencyKeyRef.current = null;
      setConfirmOpen(false);

      // Tải lại lịch sử và chuyển sang tab Đã gửi
      const newHistory = await reloadHistory();
      if (newHistory.length > 0) {
        setJustSentId(newHistory[0].id);
        setActiveDesktopTab("history");
        setMobileTab("history");
        setTimeout(() => setJustSentId(null), 4000);
      }
    } catch (err) {
      console.error("Lỗi khi phát thông báo:", err);
      const errMsg = err?.message || "Gửi thông báo thất bại. Vui lòng thử lại.";
      setSendError(errMsg);
      showToast(errMsg, "error");
    } finally {
      setSending(false);
    }
  };

  // Xác nhận xóa khỏi lịch sử
  const handleExecuteDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteBroadcast(deleteTarget.id);
      showToast("Đã xóa thông báo thành công", "success");
      setHistory((prev) => prev.filter((h) => h.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      console.error("Lỗi xóa thông báo:", err);
      showToast(err?.message || "Không thể xóa thông báo", "error");
    } finally {
      setDeleting(false);
    }
  };

  // Lọc danh sách lịch sử
  const filteredHistory = useMemo(() => {
    return history.filter((h) => {
      if (historyFilterType === "email" && h.type !== "email") return false;
      if (historyFilterType === "broadcast" && h.type === "email") return false;
      if (historySearch.trim()) {
        const q = historySearch.toLowerCase().trim();
        const matchTitle = h.title?.toLowerCase().includes(q);
        const matchMsg = h.message?.toLowerCase().includes(q);
        const matchLink = h.link?.toLowerCase().includes(q);
        if (!matchTitle && !matchMsg && !matchLink) return false;
      }
      return true;
    });
  }, [history, historyFilterType, historySearch]);

  const historyCounts = useMemo(() => {
    const email = history.filter((h) => h.type === "email").length;
    const web = history.filter((h) => h.type !== "email").length;
    return { email, web, total: history.length };
  }, [history]);

  return (
    <div className="pb-16 sm:pb-0 h-full flex flex-col gap-3 sm:gap-5">
      {/* ── MOBILE / TABLET TAB NAVIGATION (CHUẨN WAI-ARIA, GỌN GÀNG ĐẶT TRÊN ĐẦU) ── */}
      <div className="lg:hidden flex flex-col gap-1.5">
        <div
          role="tablist"
          aria-label="Khu vực phát thông báo"
          className="flex bg-[#faf8f3] dark:bg-[#151c18] p-1.5 rounded-2xl border border-[#dedfd4] dark:border-[#354237] shadow-2xs"
        >
          <button
            id="tab-compose"
            role="tab"
            aria-selected={mobileTab === "compose"}
            aria-controls="panel-compose"
            tabIndex={mobileTab === "compose" ? 0 : -1}
            type="button"
            onClick={() => setMobileTab("compose")}
            className={`flex-1 py-2.5 min-h-[44px] rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 motion-reduce:transition-none ${
              mobileTab === "compose"
                ? "bg-[#314e3e] dark:bg-[#d6b883] text-white dark:text-[#19251d] shadow-2xs"
                : "text-[#575e55] dark:text-[#b0b9ac]"
            }`}
          >
            <Megaphone className="w-3.5 h-3.5" />
            <span>Soạn</span>
          </button>
          <button
            id="tab-preview"
            role="tab"
            aria-selected={mobileTab === "preview"}
            aria-controls="panel-preview"
            tabIndex={mobileTab === "preview" ? 0 : -1}
            type="button"
            onClick={() => setMobileTab("preview")}
            className={`flex-1 py-2.5 min-h-[44px] rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 motion-reduce:transition-none ${
              mobileTab === "preview"
                ? "bg-[#314e3e] dark:bg-[#d6b883] text-white dark:text-[#19251d] shadow-2xs"
                : "text-[#575e55] dark:text-[#b0b9ac]"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Xem trước</span>
          </button>
          <button
            id="tab-history"
            role="tab"
            aria-selected={mobileTab === "history"}
            aria-controls="panel-history"
            tabIndex={mobileTab === "history" ? 0 : -1}
            aria-label={`Đã gửi, ${historyCounts.total} thông báo`}
            type="button"
            onClick={() => setMobileTab("history")}
            className={`flex-1 py-2.5 min-h-[44px] rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 motion-reduce:transition-none ${
              mobileTab === "history"
                ? "bg-[#314e3e] dark:bg-[#d6b883] text-white dark:text-[#19251d] shadow-2xs"
                : "text-[#575e55] dark:text-[#b0b9ac]"
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Đã gửi</span>
            <span className={`px-1.5 py-0.2 rounded-full text-xs font-bold ${
              mobileTab === "history"
                ? "bg-white/20 text-white dark:text-[#19251d]"
                : "bg-[#dedfd4] dark:bg-[#354237] text-[#293d32] dark:text-[#ecece0]"
            }`}>
              {historyCounts.total}
            </span>
          </button>
        </div>

        {mobileTab === "compose" && (
          <p className="text-xs text-[#575e55] dark:text-[#b0b9ac] px-1 font-medium">
            Soạn và phát bản tin đến đúng nhóm người nhận.
          </p>
        )}
      </div>

      {/* ── BỐ CỤC CHÍNH: SOẠN THẢO (TRÁI) & XEM TRƯỚC / ĐÃ GỬI (PHẢI) ── */}
      <div className="flex flex-col lg:flex-row gap-5 lg:gap-8 flex-1 min-h-0 items-start">

        {/* ════════ CỘT TRÁI: FORM SOẠN THẢO TIN ════════ */}
        <div
          id="panel-compose"
          role="tabpanel"
          aria-labelledby="tab-compose"
          className={`flex-1 max-w-[620px] w-full flex flex-col gap-4 ${mobileTab !== "compose" ? "hidden lg:flex" : "flex"}`}
        >
          <form
            onSubmit={handleRequestSend}
            noValidate
            className="bg-[#fffefa] dark:bg-[#1e2821] rounded-3xl border border-[#dedfd4] dark:border-[#354237] shadow-2xs p-4 sm:p-6 flex flex-col gap-4.5"
          >
            {/* 1. LỰA CHỌN ĐỐI TƯỢNG NHẬN (RADIO ROWS CẤU TRÚC GỌN GÀNG) */}
            <fieldset className="flex flex-col gap-2 border-0 p-0 m-0">
              <div className="flex items-center justify-between">
                <legend className="text-xs font-bold uppercase tracking-wider text-[#927140] dark:text-[#d4b47d]">
                  Đối tượng nhận <span className="text-red-600">*</span>
                </legend>
                {audienceError && (
                  <button
                    type="button"
                    onClick={loadInitialData}
                    className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1 min-h-[32px]"
                  >
                    <RefreshCw className="w-3 h-3" /> Tải lại số lượng
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-2">
                {/* Hàng 1: Email phụ huynh */}
                <label
                  className={`p-3 min-h-[56px] rounded-2xl border text-left flex items-start gap-3 cursor-pointer transition-all motion-reduce:transition-none ${
                    channel === "email"
                      ? "border-[#314e3e] dark:border-[#d6b883] bg-[#314e3e]/5 dark:bg-[#d6b883]/10 ring-1 ring-[#314e3e] dark:ring-[#d6b883]"
                      : "border-[#dedfd4] dark:border-[#354237] bg-[#faf8f3] dark:bg-[#151c18] text-[#575e55] dark:text-[#b0b9ac] hover:bg-black/5 dark:hover:bg-white/5"
                  }`}
                >
                  <input
                    type="radio"
                    name="broadcast-channel"
                    value="email"
                    checked={channel === "email"}
                    onChange={() => {
                      setChannel("email");
                      draftIdempotencyKeyRef.current = null;
                    }}
                    className="mt-1 w-4 h-4 text-[#314e3e] focus:ring-[#314e3e] flex-shrink-0 cursor-pointer"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap mb-0.5">
                      <span className="text-xs sm:text-sm font-bold text-[#293d32] dark:text-[#ecece0] flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-[#314e3e] dark:text-[#d6b883]" />
                        Phụ huynh qua email
                      </span>
                      {audienceCounts.subscribers !== null ? (
                        <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                          {audienceCounts.subscribers} người
                        </span>
                      ) : (
                        <span className="text-xs text-amber-700 dark:text-amber-400 font-semibold">
                          Chưa xác định
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#575e55] dark:text-[#b0b9ac] leading-relaxed">
                      Gửi đến hòm thư đã đăng ký của phụ huynh & cộng đoàn
                    </p>
                  </div>
                </label>

                {/* Hàng 2: Tất cả người dùng Web */}
                <label
                  className={`p-3 min-h-[56px] rounded-2xl border text-left flex items-start gap-3 cursor-pointer transition-all motion-reduce:transition-none ${
                    channel === "all_web"
                      ? "border-blue-600 bg-blue-50/60 dark:bg-blue-950/20 ring-1 ring-blue-600"
                      : "border-[#dedfd4] dark:border-[#354237] bg-[#faf8f3] dark:bg-[#151c18] text-[#575e55] dark:text-[#b0b9ac] hover:bg-black/5 dark:hover:bg-white/5"
                  }`}
                >
                  <input
                    type="radio"
                    name="broadcast-channel"
                    value="all_web"
                    checked={channel === "all_web"}
                    onChange={() => {
                      setChannel("all_web");
                      draftIdempotencyKeyRef.current = null;
                    }}
                    className="mt-1 w-4 h-4 text-blue-600 focus:ring-blue-600 flex-shrink-0 cursor-pointer"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap mb-0.5">
                      <span className="text-xs sm:text-sm font-bold text-[#293d32] dark:text-[#ecece0] flex items-center gap-1.5">
                        <Megaphone className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        Tất cả người dùng Web
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300">
                        Công khai ({audienceCounts.allUsers !== null ? `${audienceCounts.allUsers} tài khoản` : "Toàn bộ"})
                      </span>
                    </div>
                    <p className="text-xs text-[#575e55] dark:text-[#b0b9ac] leading-relaxed">
                      Hiển thị trong chuông thông báo của tất cả tài khoản
                    </p>
                  </div>
                </label>

                {/* Hàng 3: Chỉ Giáo lý viên Web */}
                <label
                  className={`p-3 min-h-[56px] rounded-2xl border text-left flex items-start gap-3 cursor-pointer transition-all motion-reduce:transition-none ${
                    channel === "teachers"
                      ? "border-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/20 ring-1 ring-emerald-600"
                      : "border-[#dedfd4] dark:border-[#354237] bg-[#faf8f3] dark:bg-[#151c18] text-[#575e55] dark:text-[#b0b9ac] hover:bg-black/5 dark:hover:bg-white/5"
                  }`}
                >
                  <input
                    type="radio"
                    name="broadcast-channel"
                    value="teachers"
                    checked={channel === "teachers"}
                    onChange={() => {
                      setChannel("teachers");
                      draftIdempotencyKeyRef.current = null;
                    }}
                    className="mt-1 w-4 h-4 text-emerald-600 focus:ring-emerald-600 flex-shrink-0 cursor-pointer"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap mb-0.5">
                      <span className="text-xs sm:text-sm font-bold text-[#293d32] dark:text-[#ecece0] flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        Giáo lý viên & Ban Quản trị
                      </span>
                      {audienceCounts.teachers !== null ? (
                        <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                          {audienceCounts.teachers} GLV & BQT
                        </span>
                      ) : (
                        <span className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
                          Chưa xác định
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#575e55] dark:text-[#b0b9ac] leading-relaxed">
                      Gửi riêng đến tài khoản Giáo lý viên, Huynh trưởng và Quản trị viên
                    </p>
                  </div>
                </label>
              </div>
            </fieldset>

            {/* 2. CHỌN MẪU THÔNG BÁO SOẠN SẴN (NÚT DISCLOSURE GỌN GÀNG) */}
            <div className="flex items-center justify-between bg-[#faf8f3] dark:bg-[#151c18] p-3 rounded-2xl border border-[#dedfd4] dark:border-[#354237]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#927140] dark:text-[#d4b47d]" />
                <span className="text-xs font-bold text-[#293d32] dark:text-[#ecece0]">
                  Mẫu thông báo phụng vụ
                </span>
              </div>
              <button
                type="button"
                onClick={() => setTemplatePickerOpen(true)}
                className="px-3 py-1.5 min-h-[44px] rounded-xl bg-[#fffefa] dark:bg-[#1e2821] border border-[#dedfd4] dark:border-[#354237] text-xs font-bold text-[#314e3e] dark:text-[#d6b883] hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-1 shadow-2xs"
              >
                <span>Chọn mẫu có sẵn</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 3. TIÊU ĐỀ THÔNG BÁO */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between ml-1">
                <label htmlFor="broadcast-title" className="text-xs font-bold uppercase tracking-wider text-[#927140] dark:text-[#d4b47d]">
                  Tiêu đề thông báo <span className="text-red-600">*</span>
                </label>
                <span className="text-xs font-semibold tabular-nums text-[#575e55] dark:text-[#b0b9ac]">
                  {title.length} / {TITLE_MAX}
                </span>
              </div>
              <input
                id="broadcast-title"
                name="broadcast-title"
                ref={titleRef}
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (fieldErrors.title) {
                    setFieldErrors((prev) => ({ ...prev, title: undefined }));
                  }
                }}
                placeholder="VD: Thông báo Lịch sinh hoạt Giáo lý và Thánh lễ Thiếu nhi"
                maxLength={TITLE_MAX}
                aria-invalid={Boolean(fieldErrors.title)}
                aria-describedby={fieldErrors.title ? "title-error" : undefined}
                className={`w-full rounded-2xl border bg-[#faf8f3] dark:bg-[#151c18] px-4 py-3 min-h-[44px] text-base font-medium text-[#293d32] dark:text-[#ecece0] placeholder-[#575e55]/60 focus:outline-none transition-all ${
                  fieldErrors.title
                    ? "border-red-500 focus:ring-2 focus:ring-red-400"
                    : "border-[#dedfd4] dark:border-[#354237] focus:ring-2 focus:ring-[#314e3e]/30 dark:focus:ring-[#d6b883]/30"
                }`}
              />
              {fieldErrors.title && (
                <span id="title-error" className="text-xs font-bold text-red-600 ml-1">
                  {fieldErrors.title}
                </span>
              )}
            </div>

            {/* 4. NỘI DUNG CHI TIẾT */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between ml-1">
                <label htmlFor="broadcast-message" className="text-xs font-bold uppercase tracking-wider text-[#927140] dark:text-[#d4b47d]">
                  Nội dung chi tiết <span className="text-red-600">*</span>
                </label>
                <span className="text-xs font-semibold tabular-nums text-[#575e55] dark:text-[#b0b9ac]">
                  {message.length} / {MESSAGE_MAX}
                </span>
              </div>
              <textarea
                id="broadcast-message"
                name="broadcast-message"
                ref={messageRef}
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  if (fieldErrors.message) {
                    setFieldErrors((prev) => ({ ...prev, message: undefined }));
                  }
                }}
                placeholder="Nội dung thông báo rõ ràng, trang trọng. Thay thế các phần ngoặc vuông [...] trước khi gửi."
                rows={4}
                maxLength={MESSAGE_MAX}
                aria-invalid={Boolean(fieldErrors.message)}
                aria-describedby={fieldErrors.message ? "message-error" : undefined}
                className={`w-full rounded-2xl border bg-[#faf8f3] dark:bg-[#151c18] px-4 py-3 text-base font-medium leading-relaxed text-[#293d32] dark:text-[#ecece0] placeholder-[#575e55]/60 resize-none outline-none transition-all min-h-[120px] ${
                  fieldErrors.message
                    ? "border-red-500 focus:ring-2 focus:ring-red-400"
                    : "border-[#dedfd4] dark:border-[#354237] focus:ring-2 focus:ring-[#314e3e]/30 dark:focus:ring-[#d6b883]/30"
                }`}
              />
              {fieldErrors.message && (
                <span id="message-error" className="text-xs font-bold text-red-600 ml-1">
                  {fieldErrors.message}
                </span>
              )}
            </div>

            {/* 5. ĐƯỜNG DẪN ĐÍNH KÈM & CHIP LINK NHANH */}
            <div className="flex flex-col gap-2">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#927140] dark:text-[#d4b47d] ml-1">
                  <Link2 className="w-3.5 h-3.5" />
                  <label htmlFor="broadcast-link">Đường dẫn đính kèm</label>
                  <span className="normal-case tracking-normal font-medium text-[#575e55] dark:text-[#b0b9ac] ml-1">
                    (Không bắt buộc)
                  </span>
                </div>
                <input
                  id="broadcast-link"
                  name="broadcast-link"
                  ref={linkRef}
                  type="text"
                  value={link}
                  onChange={(e) => {
                    setLink(e.target.value);
                    if (fieldErrors.link) {
                      setFieldErrors((prev) => ({ ...prev, link: undefined }));
                    }
                  }}
                  placeholder="VD: /lịch-học hoặc https://..."
                  aria-invalid={Boolean(fieldErrors.link)}
                  aria-describedby={fieldErrors.link ? "link-error" : undefined}
                  className={`w-full rounded-2xl border bg-[#faf8f3] dark:bg-[#151c18] px-4 py-3 min-h-[44px] text-base font-medium text-[#293d32] dark:text-[#ecece0] placeholder-[#575e55]/60 focus:outline-none transition-all ${
                    fieldErrors.link
                      ? "border-red-500 focus:ring-2 focus:ring-red-400"
                      : "border-[#dedfd4] dark:border-[#354237] focus:ring-2 focus:ring-[#314e3e]/30 dark:focus:ring-[#d6b883]/30"
                  }`}
                />
                {fieldErrors.link && (
                  <span id="link-error" className="text-xs font-bold text-red-600 ml-1">
                    {fieldErrors.link}
                  </span>
                )}
              </div>

              {/* Phím tắt chèn link nội bộ */}
              <div className="flex items-center gap-1.5 flex-wrap ml-1">
                <span className="text-xs text-[#575e55] dark:text-[#b0b9ac] font-medium mr-0.5">Chèn:</span>
                {QUICK_LINKS.map((ql) => (
                  <button
                    key={ql.path}
                    type="button"
                    onClick={() => {
                      setLink(ql.path);
                      if (fieldErrors.link) {
                        setFieldErrors((prev) => ({ ...prev, link: undefined }));
                      }
                    }}
                    className="px-3 py-1.5 min-h-[44px] rounded-xl bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237] text-xs font-bold text-[#314e3e] dark:text-[#d6b883] hover:underline transition-all flex items-center"
                  >
                    {ql.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 6. TÓM TẮT PHẠM VI GỬI */}
            <div className="px-3.5 py-2.5 rounded-xl bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237] text-xs font-medium text-[#575e55] dark:text-[#b0b9ac] flex items-center gap-2">
              <Info className="w-4 h-4 text-[#314e3e] dark:text-[#d6b883] flex-shrink-0" />
              <span>
                {currentRecipientCount === null
                  ? "Đang kiểm tra số lượng đối tượng nhận từ máy chủ…"
                  : currentRecipientCount === 0
                  ? "Danh sách người nhận đang bằng 0. Không thể phát tin."
                  : channel === "email"
                  ? `Sẽ gửi qua Email đến ${currentRecipientCount} phụ huynh & cộng đoàn.`
                  : channel === "teachers"
                  ? `Sẽ phát thông báo Web nội bộ đến ${currentRecipientCount} Giáo lý viên & BQT.`
                  : `Sẽ phát thông báo Web công khai đến ${currentRecipientCount} tài khoản.`}
              </span>
            </div>

            {/* 7. CTA KIỂM TRA TRƯỚC KHI PHÁT */}
            <button
              ref={submitButtonRef}
              type="submit"
              disabled={sending || currentRecipientCount === 0 || currentRecipientCount === null}
              className="mt-1 inline-flex items-center justify-center gap-2 px-8 py-3.5 min-h-[48px] rounded-2xl text-base font-bold bg-[#314e3e] text-white dark:bg-[#d6b883] dark:text-[#19251d] shadow-2xs transition-all active:scale-[0.98] hover:bg-[#253d30] dark:hover:bg-[#c4a670] disabled:opacity-40 disabled:cursor-not-allowed w-full motion-reduce:transition-none"
            >
              <Send className="w-5 h-5" />
              <span>
                {currentRecipientCount === null
                  ? "Đang kiểm tra người nhận…"
                  : currentRecipientCount === 0
                  ? "Chưa có người nhận để gửi"
                  : "Kiểm tra trước khi phát"}
              </span>
            </button>
          </form>
        </div>

        {/* ════════ CỘT PHẢI: XEM TRƯỚC (PREVIEW) & ĐÃ GỬI (HISTORY) ════════ */}
        <div
          className={`flex-1 w-full flex flex-col ${
            mobileTab === "compose" ? "hidden lg:flex" : "flex"
          }`}
        >
          {/* Tabs trên Desktop */}
          <div
            role="tablist"
            aria-label="Chuyển chế độ xem trên máy tính"
            className="hidden lg:flex items-center gap-1 bg-[#dedfd4]/50 dark:bg-[#354237]/50 p-1 rounded-t-2xl w-max self-start ml-2 mb-[-1px] relative z-10"
          >
            <button
              role="tab"
              aria-selected={activeDesktopTab === "preview"}
              aria-controls="desktop-panel-preview"
              type="button"
              onClick={() => setActiveDesktopTab("preview")}
              className={`px-4 py-2.5 min-h-[44px] text-xs font-bold rounded-t-xl transition-colors ${
                activeDesktopTab === "preview"
                  ? "bg-[#fffefa] dark:bg-[#1e2821] text-[#314e3e] dark:text-[#d6b883] shadow-2xs"
                  : "text-[#575e55] dark:text-[#b0b9ac]"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" /> Xem trước nội dung
              </span>
            </button>
            <button
              role="tab"
              aria-selected={activeDesktopTab === "history"}
              aria-controls="desktop-panel-history"
              aria-label={`Đã gửi, ${historyCounts.total} thông báo`}
              type="button"
              onClick={() => setActiveDesktopTab("history")}
              className={`px-4 py-2.5 min-h-[44px] text-xs font-bold rounded-t-xl transition-colors ${
                activeDesktopTab === "history"
                  ? "bg-[#fffefa] dark:bg-[#1e2821] text-[#314e3e] dark:text-[#d6b883] shadow-2xs"
                  : "text-[#575e55] dark:text-[#b0b9ac]"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <History className="w-3.5 h-3.5" /> Đã gửi ({historyCounts.total})
              </span>
            </button>
          </div>

          {/* Panel Nội dung */}
          <div className="flex-1 bg-[#fffefa] dark:bg-[#1e2821] rounded-3xl rounded-tl-none lg:rounded-tl-3xl border border-[#dedfd4] dark:border-[#354237] shadow-2xs overflow-hidden flex flex-col relative w-full min-h-0">

            {/* ════ 1. TAB XEM TRƯỚC (PREVIEW) ════ */}
            {((mobileTab === "preview") || (activeDesktopTab === "preview")) && (
              <div
                id="panel-preview"
                role="tabpanel"
                aria-labelledby="tab-preview"
                className="flex-1 flex flex-col p-4 sm:p-6 bg-[#faf8f3]/60 dark:bg-[#151c18]/40 overflow-y-auto min-h-0"
              >
                {/* Điều khiển Xem trước: Chọn thiết bị (Mobile / Desktop) */}
                <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-[#dedfd4] dark:border-[#354237]">
                  <span className="text-xs font-bold text-[#575e55] dark:text-[#b0b9ac] uppercase tracking-wider">
                    {channel === "email" ? "Mô phỏng Bản tin Email" : "Mô phỏng Chuông thông báo Web"}
                  </span>

                  <div className="flex items-center gap-1 bg-[#faf8f3] dark:bg-[#151c18] p-1 rounded-xl border border-[#dedfd4] dark:border-[#354237]">
                    <button
                      type="button"
                      aria-pressed={previewDevice === "mobile"}
                      onClick={() => setPreviewDevice("mobile")}
                      className={`p-2 min-h-[44px] rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                        previewDevice === "mobile"
                          ? "bg-[#314e3e] dark:bg-[#d6b883] text-white dark:text-[#19251d]"
                          : "text-[#575e55] dark:text-[#b0b9ac]"
                      }`}
                    >
                      <Smartphone className="w-4 h-4" />
                      <span>Di động</span>
                    </button>
                    <button
                      type="button"
                      aria-pressed={previewDevice === "desktop"}
                      onClick={() => setPreviewDevice("desktop")}
                      className={`p-2 min-h-[44px] rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                        previewDevice === "desktop"
                          ? "bg-[#314e3e] dark:bg-[#d6b883] text-white dark:text-[#19251d]"
                          : "text-[#575e55] dark:text-[#b0b9ac]"
                      }`}
                    >
                      <Monitor className="w-4 h-4" />
                      <span>Máy tính</span>
                    </button>
                  </div>
                </div>

                {/* Vùng Render Khung Preview */}
                {!title.trim() && !message.trim() ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-16 px-4 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237] flex items-center justify-center text-[#575e55] dark:text-[#b0b9ac]">
                      <Eye className="w-6 h-6" />
                    </div>
                    <p className="text-xs sm:text-sm font-medium text-[#575e55] dark:text-[#b0b9ac]">
                      Nhập tiêu đề và nội dung để xem trước thông báo hiển thị.
                    </p>
                  </div>
                ) : (
                  <div
                    className={`mx-auto w-full transition-all duration-300 ${
                      previewDevice === "mobile" ? "max-w-[390px]" : "max-w-[560px]"
                    }`}
                  >
                    {channel === "email" ? (
                      /* ── EMAIL PREVIEW THEO ĐÚNG TEMPLATE RESEND ── */
                      <div className="bg-[#ffffff] text-[#292524] rounded-2xl shadow-md border border-[#f5ede4] overflow-hidden">
                        <div className="bg-gradient-to-br from-[#92400e] to-[#d97706] text-white text-center py-6 px-4">
                          <h4 className="font-serif text-2xl font-bold tracking-wide">
                            BAN GIÁO LÝ
                          </h4>
                          <p className="text-xs font-semibold text-[#fef3c7] uppercase tracking-[3px] mt-1 opacity-90">
                            GIÁO XỨ AN NGÃI
                          </p>
                        </div>

                        <div className="p-5 sm:p-7 flex flex-col gap-3.5">
                          <h5 className="font-bold text-base sm:text-lg text-[#292524] leading-snug">
                            {title || "Tiêu đề bản tin phụng vụ"}
                          </h5>

                          <div className="text-sm text-[#44403c] leading-relaxed whitespace-pre-wrap break-words">
                            {message || "Nội dung bản tin phụng vụ sẽ được hiển thị ở đây."}
                          </div>

                          {link && (
                            <div className="pt-3">
                              <span className="inline-block bg-[#b45309] text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-full shadow-xs break-all">
                                Xem Chi Tiết Đính Kèm
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="bg-[#fafaf9] border-t border-[#f5ede4] p-4 text-center text-xs text-[#78716c] leading-relaxed">
                          <p>
                            Bạn nhận được thông báo này vì đã đăng ký nhận bản tin từ Ban Giáo Lý.
                          </p>
                          <p className="mt-0.5">
                            © {new Date().getFullYear()} Xứ Đoàn Hùng Tâm Dũng Chí - Giáo Xứ An Ngãi.
                          </p>
                        </div>
                      </div>
                    ) : (
                      /* ── WEB NOTIFICATION PREVIEW THEO DROPDOWN HEADER ── */
                      <div className="bg-[#fffefa] dark:bg-[#1e2821] rounded-2xl shadow-md border border-[#dedfd4] dark:border-[#354237] p-4 sm:p-5 flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-[#314e3e]/10 text-[#314e3e] dark:bg-[#d6b883]/20 dark:text-[#d6b883]">
                              <Bell className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="text-xs font-bold text-[#293d32] dark:text-[#ecece0] block">
                                Ban Giáo Lý An Ngãi
                              </span>
                              <span className="text-xs text-[#575e55] dark:text-[#b0b9ac]">
                                Vừa xong
                              </span>
                            </div>
                          </div>

                          <span
                            className={`px-2 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider ${
                              channel === "teachers"
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                                : "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300"
                            }`}
                          >
                            {channel === "teachers" ? "GLV & BQT" : "Toàn bộ Web"}
                          </span>
                        </div>

                        <div className="border-t border-[#dedfd4] dark:border-[#354237] pt-3">
                          <h5 className="font-bold text-sm text-[#293d32] dark:text-[#ecece0] mb-1.5 font-sans">
                            {title || "Tiêu đề thông báo hệ thống"}
                          </h5>
                          <p className="text-xs text-[#575e55] dark:text-[#b0b9ac] leading-relaxed whitespace-pre-wrap break-words">
                            {message || "Nội dung chi tiết thông báo sẽ xuất hiện trong chuông của người dùng."}
                          </p>
                        </div>

                        {link && (
                          <div className="pt-2 border-t border-[#dedfd4] dark:border-[#354237]">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237] text-xs font-bold text-[#314e3e] dark:text-[#d6b883] max-w-full">
                              <Link2 className="w-3.5 h-3.5 flex-shrink-0" />
                              <span className="truncate">{link}</span>
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ════ 2. TAB ĐÃ GỬI (LỊCH SỬ PHÁT TIN) ════ */}
            {((mobileTab === "history") || (activeDesktopTab === "history")) && (
              <div
                id="panel-history"
                role="tabpanel"
                aria-labelledby="tab-history"
                className="flex-1 flex flex-col p-4 sm:p-6 gap-3.5 overflow-hidden min-h-0"
              >
                {/* ── KPI TỔNG QUAN ĐƯỢC DỜI SANG ĐẦU TAB LỊCH SỬ ── */}
                <div className="grid grid-cols-3 gap-2 pb-1">
                  <div className="p-3 rounded-2xl bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237]">
                    <span className="text-xs font-bold text-[#927140] dark:text-[#d4b47d] uppercase tracking-wider block">
                      Tổng đã gửi
                    </span>
                    <p className="text-lg sm:text-2xl font-bold text-[#293d32] dark:text-[#ecece0] tabular-nums font-sans mt-0.5">
                      {historyCounts.total}
                    </p>
                  </div>
                  <div className="p-3 rounded-2xl bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237]">
                    <span className="text-xs font-bold text-[#314e3e] dark:text-[#d6b883] uppercase tracking-wider block">
                      Bản tin Email
                    </span>
                    <p className="text-lg sm:text-2xl font-bold text-[#293d32] dark:text-[#ecece0] tabular-nums font-sans mt-0.5">
                      {historyCounts.email}
                    </p>
                  </div>
                  <div className="p-3 rounded-2xl bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237]">
                    <span className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider block">
                      Thông báo Web
                    </span>
                    <p className="text-lg sm:text-2xl font-bold text-[#293d32] dark:text-[#ecece0] tabular-nums font-sans mt-0.5">
                      {historyCounts.web}
                    </p>
                  </div>
                </div>

                {/* ── STATUS BANNER BỀN VỮNG SAU KHI GỬI ── */}
                {sentBanner && (
                  <div
                    role="status"
                    className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 text-xs font-bold ${
                      sentBanner.type === "partial"
                        ? "bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-300"
                        : "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {sentBanner.type === "partial" ? (
                        <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-700 dark:text-amber-400" />
                      ) : (
                        <Check className="w-4 h-4 flex-shrink-0 text-emerald-700 dark:text-emerald-400" />
                      )}
                      <span>{sentBanner.message}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSentBanner(null)}
                      aria-label="Đóng thông báo trạng thái"
                      className="min-w-[44px] min-h-[44px] -mr-2 rounded-xl flex items-center justify-center text-current hover:bg-black/5 dark:hover:bg-white/5"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* ── THANH TÌM KIẾM & BỘ LỌC 3 NÚT CHIA ĐỀU ── */}
                <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between pb-2 border-b border-[#dedfd4] dark:border-[#354237]">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-[#575e55] dark:text-[#b0b9ac] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      name="history-search"
                      value={historySearch}
                      onChange={(e) => setHistorySearch(e.target.value)}
                      placeholder="Tìm trong lịch sử..."
                      className="w-full pl-10 pr-11 py-2.5 min-h-[44px] text-base sm:text-xs font-medium rounded-xl border border-[#dedfd4] dark:border-[#354237] bg-[#faf8f3] dark:bg-[#151c18] text-[#293d32] dark:text-[#ecece0] placeholder-[#575e55]/60 focus:outline-none"
                    />
                    {historySearch && (
                      <button
                        type="button"
                        onClick={() => setHistorySearch("")}
                        aria-label="Xóa từ khóa tìm kiếm"
                        className="absolute right-1 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center text-[#575e55] dark:text-[#b0b9ac]"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* 3 nút bộ lọc chia đều chiều ngang */}
                  <div className="grid grid-cols-3 gap-1 bg-[#faf8f3] dark:bg-[#151c18] p-1 rounded-xl border border-[#dedfd4] dark:border-[#354237] flex-shrink-0">
                    <button
                      type="button"
                      aria-pressed={historyFilterType === "all"}
                      onClick={() => setHistoryFilterType("all")}
                      className={`px-3 py-2 min-h-[44px] text-xs font-bold rounded-lg transition-all text-center ${
                        historyFilterType === "all"
                          ? "bg-[#314e3e] dark:bg-[#d6b883] text-white dark:text-[#19251d]"
                          : "text-[#575e55] dark:text-[#b0b9ac]"
                      }`}
                    >
                      Tất cả ({historyCounts.total})
                    </button>
                    <button
                      type="button"
                      aria-pressed={historyFilterType === "email"}
                      onClick={() => setHistoryFilterType("email")}
                      className={`px-3 py-2 min-h-[44px] text-xs font-bold rounded-lg transition-all text-center flex items-center justify-center gap-1 ${
                        historyFilterType === "email"
                          ? "bg-[#314e3e] dark:bg-[#d6b883] text-white dark:text-[#19251d]"
                          : "text-[#575e55] dark:text-[#b0b9ac]"
                      }`}
                    >
                      <Mail className="w-3 h-3" /> Email ({historyCounts.email})
                    </button>
                    <button
                      type="button"
                      aria-pressed={historyFilterType === "broadcast"}
                      onClick={() => setHistoryFilterType("broadcast")}
                      className={`px-3 py-2 min-h-[44px] text-xs font-bold rounded-lg transition-all text-center flex items-center justify-center gap-1 ${
                        historyFilterType === "broadcast"
                          ? "bg-[#314e3e] dark:bg-[#d6b883] text-white dark:text-[#19251d]"
                          : "text-[#575e55] dark:text-[#b0b9ac]"
                      }`}
                    >
                      <Megaphone className="w-3 h-3" /> Web ({historyCounts.web})
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-[#575e55] dark:text-[#b0b9ac] px-1">
                  <span>40 thông báo gần nhất</span>
                  <span>Hiển thị {filteredHistory.length} mục</span>
                </div>

                {/* Danh sách Card Mobile & List Desktop */}
                <div className="flex-1 overflow-y-auto pr-1" data-lenis-prevent>
                  {historyLoading ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-16 text-[#314e3e] dark:text-[#d6b883] h-full">
                      <Spinner className="w-6 h-6" />
                      <span className="text-xs font-medium">Đang tải lịch sử phát tin…</span>
                    </div>
                  ) : historyError ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-16 px-6 text-center h-full">
                      <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 flex items-center justify-center text-red-600">
                        <AlertTriangle className="w-6 h-6" />
                      </div>
                      <p className="text-xs sm:text-sm font-medium text-[#575e55] dark:text-[#b0b9ac]">
                        Không thể tải lịch sử thông báo do sự cố kết nối.
                      </p>
                      <button
                        type="button"
                        onClick={loadInitialData}
                        className="px-4 py-2 min-h-[44px] rounded-xl bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237] text-xs font-bold text-[#314e3e] dark:text-[#d6b883] hover:bg-black/5 flex items-center gap-1.5"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> Thử tải lại
                      </button>
                    </div>
                  ) : filteredHistory.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-16 px-6 text-center h-full">
                      <div className="w-14 h-14 rounded-2xl bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237] flex items-center justify-center">
                        <Inbox className="w-6 h-6 text-[#575e55] dark:text-[#b0b9ac]" />
                      </div>
                      <p className="text-xs sm:text-sm font-medium text-[#575e55] dark:text-[#b0b9ac]">
                        {historySearch
                          ? `Không tìm thấy thông báo khớp với "${historySearch}"`
                          : historyFilterType === "email"
                          ? "Chưa có bản tin Email nào trong lịch sử."
                          : historyFilterType === "broadcast"
                          ? "Chưa có thông báo Web nào trong lịch sử."
                          : "Chưa có thông báo phát tin nào."}
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3 py-1">
                      {filteredHistory.map((h) => {
                        const isEmail = h.type === "email";
                        const isTeacherOnly = h.recipient_role === "teacher";

                        return (
                          <div
                            key={h.id}
                            className={`p-4 rounded-2xl bg-[#faf8f3] dark:bg-[#151c18] border shadow-2xs flex flex-col gap-2.5 transition-all motion-reduce:transition-none ${
                              justSentId === h.id
                                ? "border-emerald-500 ring-1 ring-emerald-500/50 bg-emerald-50/20"
                                : "border-[#dedfd4] dark:border-[#354237]"
                            }`}
                          >
                            {/* Card Header: Channel Badge + Time */}
                            <div className="flex items-center justify-between gap-2">
                              {isEmail ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold bg-[#314e3e]/10 text-[#314e3e] dark:bg-[#d6b883]/20 dark:text-[#d6b883] uppercase tracking-wider">
                                  <Mail className="w-3 h-3" /> Bản tin Email
                                </span>
                              ) : isTeacherOnly ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 uppercase tracking-wider">
                                  <Users className="w-3 h-3" /> GLV & BQT Web
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 uppercase tracking-wider">
                                  <Megaphone className="w-3 h-3" /> Tất cả Web
                                </span>
                              )}

                              <span className="text-xs font-semibold text-[#575e55] dark:text-[#b0b9ac] flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {relativeTime(h.created_at)}
                              </span>
                            </div>

                            {/* Card Body: Title + Message */}
                            <div>
                              <h5 className="text-sm font-bold text-[#293d32] dark:text-[#ecece0] leading-snug font-sans mb-1">
                                {h.title}
                              </h5>
                              <p className="text-xs text-[#575e55] dark:text-[#b0b9ac] leading-relaxed whitespace-pre-wrap line-clamp-3">
                                {h.message}
                              </p>
                            </div>

                            {/* Optional Link Chip */}
                            {h.link && (
                              <div>
                                {h.link.startsWith("/") ? (
                                  <Link
                                    to={h.link}
                                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#314e3e] dark:text-[#d6b883] bg-[#fffefa] dark:bg-[#1e2821] border border-[#dedfd4] dark:border-[#354237] px-3 py-2 min-h-[44px] rounded-xl hover:underline max-w-full"
                                  >
                                    <Link2 className="w-3.5 h-3.5 flex-shrink-0" />
                                    <span className="truncate">{h.link}</span>
                                  </Link>
                                ) : (
                                  <a
                                    href={h.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#314e3e] dark:text-[#d6b883] bg-[#fffefa] dark:bg-[#1e2821] border border-[#dedfd4] dark:border-[#354237] px-3 py-2 min-h-[44px] rounded-xl hover:underline max-w-full"
                                  >
                                    <Link2 className="w-3.5 h-3.5 flex-shrink-0" />
                                    <span className="truncate">{h.link}</span>
                                  </a>
                                )}
                              </div>
                            )}

                            {/* Card Footer: Status & Actions */}
                            <div className="flex items-center justify-between pt-2 border-t border-[#dedfd4]/60 dark:border-[#354237]/60 mt-0.5">
                              <span className="text-xs font-medium text-[#575e55] dark:text-[#b0b9ac]">
                                {isEmail ? "Đã lưu lịch sử Email" : "Đang phát trên Web"}
                              </span>

                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleReuse(h)}
                                  className="px-3 py-1.5 min-h-[44px] rounded-xl text-xs font-bold text-[#314e3e] dark:text-[#d6b883] bg-[#fffefa] dark:bg-[#1e2821] border border-[#dedfd4] dark:border-[#354237] hover:bg-black/5 dark:hover:bg-white/5 transition-all flex items-center gap-1.5 shadow-2xs"
                                >
                                  <RefreshCw className="w-3.5 h-3.5" />
                                  <span>Dùng lại</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeleteTarget(h)}
                                  disabled={deleting && deleteTarget?.id === h.id}
                                  className="px-3 py-1.5 min-h-[44px] rounded-xl text-xs font-bold text-red-600 dark:text-red-400 bg-red-50/60 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 hover:bg-red-100 dark:hover:bg-red-950/40 transition-all flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Xóa</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── MODALS: CHỌN MẪU, XÁC NHẬN PHÁT & XÁC NHẬN XÓA ── */}
      <TemplatePickerModal
        open={templatePickerOpen}
        onClose={() => setTemplatePickerOpen(false)}
        onSelectTemplate={handleApplyTemplate}
        onClearForm={handleClearForm}
        lenis={lenis}
      />

      <ConfirmSendModal
        open={confirmOpen}
        channel={channel}
        title={title}
        link={link}
        recipientCount={currentRecipientCount}
        busy={sending}
        sendError={sendError}
        onCancel={() => {
          if (!sending) setConfirmOpen(false);
        }}
        onConfirm={handleConfirmSend}
        lenis={lenis}
      />

      <DeleteConfirmModal
        item={deleteTarget}
        busy={deleting}
        onCancel={() => {
          if (!deleting) setDeleteTarget(null);
        }}
        onConfirm={handleExecuteDelete}
        lenis={lenis}
      />
    </div>
  );
}
