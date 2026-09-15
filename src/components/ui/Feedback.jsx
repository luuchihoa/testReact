import React, { useState } from "react";
import { motion as Motion, AnimatePresence, useDragControls } from "framer-motion";
import Backdrop from "./Backdrop.jsx";

// Hằng số Easing chuyển động chuẩn hệ thống Apple HIG
const APPLE_EASE = [0.16, 1, 0.3, 1];

const ICONS = {
  bolt: (
    <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" strokeLinejoin="round" strokeLinecap="round" />
  ),
  alert: (
    <>
      <path d="M12 8.5v4.5" strokeLinecap="round" />
      <circle cx="12" cy="16.5" r="0.9" fill="currentColor" stroke="none" />
      <path d="M10.7 3.9 2.4 18.2c-.6 1 .1 2.3 1.3 2.3h16.6c1.2 0 1.9-1.3 1.3-2.3L13.3 3.9a1.5 1.5 0 0 0-2.6 0Z" strokeLinejoin="round" />
    </>
  ),
  door: (
    <>
      <path d="M14 3.5 6 5v15l8 1.5V3.5Z" strokeLinejoin="round" />
      <path d="M14 4h5.5v16H14" strokeLinejoin="round" />
      <circle cx="11.3" cy="13" r="0.9" fill="currentColor" stroke="none" />
    </>
  ),
  book: (
    <>
      <path d="M4 5.5C4 4.7 4.7 4 5.5 4H12v16H5.5C4.7 20 4 19.3 4 18.5v-13Z" strokeLinejoin="round" />
      <path d="M20 5.5c0-.8-.7-1.5-1.5-1.5H12v16h6.5c.8 0 1.5-.7 1.5-1.5v-13Z" strokeLinejoin="round" />
    </>
  ),
  clipboard: (
    <>
      <rect width="14" height="18" x="5" y="3" rx="2" strokeLinejoin="round" />
      <path d="M9 3V2a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" strokeLinejoin="round" />
      <path d="m9 12 2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
};

function LineIcon({ name, size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      {ICONS[name]}
    </svg>
  );
}

function IconBadge({ icon }) {
  return (
    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white flex-shrink-0 ring-1 ring-[#314e3e]/20 dark:ring-[#d6b883]/30 shadow-md bg-gradient-to-br from-[#314e3e] via-[#284033] to-[#1e3127] dark:from-[#d6b883] dark:via-[#cbb07c] dark:to-[#b89b65] dark:text-[#19251d]">
      <LineIcon name={icon} />
    </div>
  );
}

function StatusPill({ children }) {
  return (
    <span className="inline-block text-[11px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full shadow-xs bg-[#927140]/10 dark:bg-[#d4b47d]/15 text-[#7c5c2d] dark:text-[#d4b47d] border border-[#927140]/25 dark:border-[#d4b47d]/30">
      {children}
    </span>
  );
}

function Sheet({ onClose, showClose = true, maxWidth = "sm:max-w-md", children }) {
  const dragControls = useDragControls();

  const handleDragEnd = (_e, info) => {
    if (onClose && (info.offset.y > 80 || info.velocity.y > 400)) onClose();
  };

  return (
    <Motion.div
      role="dialog"
      aria-modal="true"
      drag="y"
      dragListener={false}
      dragControls={dragControls}
      dragDirectionLock
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={{ top: 0, bottom: 0.6 }}
      onDragEnd={handleDragEnd}
      initial={{ y: "100%", opacity: 0.5 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: "100%", opacity: 0 }}
      transition={{ duration: 0.4, ease: APPLE_EASE }}
      // TỐI ƯU MOBILE: rounded-t-[32px] mượt mà, viền border thích ứng, min width thoải mái
      className={`relative w-full ${maxWidth} rounded-t-[32px] sm:rounded-[24px] shadow-2xl flex flex-col overflow-hidden max-h-[92dvh] sm:max-h-[88vh] sm:!translate-y-0 bg-[#fffefa] dark:bg-[#1e2821] border border-[#dedfd4] dark:border-[#354237]`}
      onClick={(e) => e.stopPropagation()}
    >
      {showClose && onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng"
          // TỐI ƯU MOBILE: Vùng chạm chuẩn tối thiểu 44x44 CSS px
          className="absolute top-4 right-4 z-10 w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90 bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237] text-[#575e55] dark:text-[#b0b9ac] hover:text-[#293d32] dark:hover:text-[#ecece0] cursor-pointer shadow-xs"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      )}

      {/* TỐI ƯU MOBILE: Thanh kéo Pull-Tab điều khiển cử chỉ kéo vuốt đóng Sheet */}
      <div
        onPointerDown={(e) => dragControls.start(e)}
        className="flex justify-center pt-4 pb-1 sm:hidden flex-shrink-0 touch-none cursor-grab active:cursor-grabbing"
      >
        <div className="w-12 h-1.5 rounded-full bg-[#dedfd4] dark:bg-[#354237]" />
      </div>

      {/* TỐI ƯU MOBILE: Cuộn native hoàn toàn tự do và mượt mà, không bị drag listener cản trở */}
      <div
        className="px-5 sm:px-6 pt-3 sm:pt-6 overflow-y-auto overscroll-contain flex-1 touch-pan-y"
        style={{
          paddingBottom: "max(1.75rem, env(safe-area-inset-bottom))",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {children}
      </div>
    </Motion.div>
  );
}

const sheetWrapClass = "fixed inset-0 z-50 flex flex-col justify-end sm:items-center sm:justify-center";

const iconPop = {
  initial: { scale: 0.6, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  transition: { type: "spring", damping: 15, stiffness: 260, delay: 0.05 },
};

// ====================== ERROR BOX =========================
export function ErrorBox({ message, handleClose, onRetry }) {
  return (
    <Backdrop handleClose={handleClose}>
      <div className={sheetWrapClass} onClick={(e) => e.stopPropagation()}>
        <Sheet onClose={handleClose}>
          <div className="text-center space-y-5 pb-1">
            <Motion.div className="flex justify-center" {...iconPop}>
              <IconBadge icon="alert" />
            </Motion.div>
            <div className="space-y-1.5">
              <StatusPill>Lỗi hệ thống</StatusPill>
              <h2 className="text-xl font-extrabold font-serif tracking-tight text-[#293d32] dark:text-[#ecece0]">
                Có lỗi xảy ra
              </h2>
            </div>
            <p className="text-[14px] font-medium leading-relaxed text-[#575e55] dark:text-[#b0b9ac]">
              {message}
            </p>
            {/* TỐI ƯU MOBILE: Trên mobile ưu tiên xếp nút theo chiều dọc (flex-col) để diện tích bấm nút dài rộng và thoải mái nhất */}
            <div className="flex flex-col gap-2.5 pt-2 sm:flex-row sm:gap-3">
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="w-full min-h-[44px] py-3.5 rounded-xl text-[14px] font-bold transition-all duration-300 active:scale-[0.98] bg-[#314e3e] text-[#ffffff] hover:bg-[#273e31] dark:bg-[#d6b883] dark:text-[#19251d] dark:hover:bg-[#cbb07c] shadow-xs cursor-pointer"
                >
                  Thử lại
                </button>
              )}
              <button
                type="button"
                onClick={handleClose}
                className="w-full min-h-[44px] py-3.5 rounded-xl text-[14px] font-bold transition-all duration-300 active:scale-[0.98] bg-[#faf8f3] dark:bg-[#151c18] text-[#293d32] dark:text-[#ecece0] border border-[#dedfd4] dark:border-[#354237] hover:bg-[#f3f0e6] dark:hover:bg-[#1e2821] shadow-xs cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </Sheet>
      </div>
    </Backdrop>
  );
}

// ====================== EXIT CONFIRM =========================
export function ExitButton({
  handleExit,
  handleClose,
  pill = "Thoát bài thi",
  title = "Bạn muốn rời khỏi bài thi?",
  message = "Tiến trình làm bài của bạn sẽ không được lưu lại. Bạn có chắc chắn muốn thoát?",
  cancelLabel = "Ở lại làm tiếp bài thi",
  confirmLabel = "Xác nhận thoát bài",
}) {
  return (
    <Backdrop handleClose={handleClose}>
      <div className={sheetWrapClass} onClick={(e) => e.stopPropagation()}>
        <Sheet onClose={handleClose} maxWidth="sm:max-w-md">
          <div className="text-center space-y-4 pb-1">
            <Motion.div className="flex justify-center" {...iconPop}>
              <IconBadge icon="door" />
            </Motion.div>
            <div className="space-y-1.5">
              <StatusPill>{pill}</StatusPill>
              <h3 className="text-xl font-extrabold font-serif tracking-tight text-[#293d32] dark:text-[#ecece0]">
                {title}
              </h3>
            </div>
            <p className="text-[14px] font-medium leading-relaxed text-[#575e55] dark:text-[#b0b9ac]">
              {message}
            </p>
            {/* TỐI ƯU MOBILE: Nút an toàn ở lại ưu tiên hàng đầu, nút xác nhận thoát là nút thứ cấp để tránh chạm nhầm */}
            <div className="flex flex-col gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="w-full min-h-[48px] py-3.5 rounded-xl text-[14.5px] font-bold transition-all duration-200 active:scale-[0.98] bg-[#314e3e] text-[#ffffff] hover:bg-[#273e31] dark:bg-[#d6b883] dark:text-[#19251d] dark:hover:bg-[#cbb07c] shadow-xs cursor-pointer"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={handleExit}
                className="w-full min-h-[44px] py-3 rounded-xl text-[13.5px] font-semibold transition-all duration-200 active:scale-[0.98] text-red-700 dark:text-red-300 border border-red-300 dark:border-red-900/40 hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer"
              >
                {confirmLabel}
              </button>
            </div>
          </div>
        </Sheet>
      </div>
    </Backdrop>
  );
}

// ====================== LOADING BOX =========================
export function LoadingBox() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 bg-[#faf8f3] dark:bg-[#151c18]">
      <div className="relative w-14 h-14">
        <svg className="w-full h-full animate-spin" viewBox="0 0 56 56" fill="none">
          <circle cx="28" cy="28" r="22" stroke="currentColor" className="stroke-[#dedfd4] dark:stroke-[#354237]" strokeWidth="4.5" />
          <path d="M28 6 a22 22 0 0 1 22 22" className="stroke-[#314e3e] dark:stroke-[#d6b883]" strokeWidth="4.5" strokeLinecap="round" />
        </svg>
      </div>
      <div className="text-center px-6">
        <p className="text-[17px] font-extrabold font-serif tracking-tight text-[#293d32] dark:text-[#ecece0]">
          Đang tải dữ liệu…
        </p>
        <p className="text-[13px] font-medium mt-1 text-[#575e55] dark:text-[#b0b9ac]">
          Vui lòng đợi trong giây lát
        </p>
      </div>
    </div>
  );
}

// ====================== START BOX (HỖ TRỢ CẢ BÀI THI & ĐỐ VUI THEO AGENTS.MD) =========================
export function StartBox({ startQuiz, config, isOpen = true, onClose, mode = "quiz" }) {
  const isGame = mode === "game" || Boolean(config?.isGame) || config?.type === "đố-vui-giáo-lý";
  const durationMinutes = Math.round((config?.time || 900) / 60);
  const mcqCount = config?.mcqCount ?? 10;
  const essayCount = config?.essayCount ?? 0;
  const title = config?.title || (isGame ? "ĐỐ VUI GIÁO LÝ" : "ÔN TẬP GIÁO LÝ");
  const khoiBadge = config?.khoiLabel || config?.badge || (isGame ? "Đố Vui Giáo Lý" : null);
  const semesterBadge = !isGame ? (config?.semesterLabel || null) : null;
  const maxScore = config?.maxScore ?? ((config?.mcqPoint || 0) + (config?.essayPoint || 0) || 10.0);

  return (
    <AnimatePresence>
      {isOpen && (
        <Backdrop handleClose={onClose}>
          <div className={sheetWrapClass} onClick={(e) => e.stopPropagation()}>
            <Sheet onClose={onClose} maxWidth="sm:max-w-md">
              <div className="text-center space-y-4 pb-1">
                <Motion.div className="flex justify-center" {...iconPop}>
                  <IconBadge icon="bolt" />
                </Motion.div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-center gap-1.5 flex-wrap">
                    {khoiBadge && <StatusPill>{khoiBadge}</StatusPill>}
                    {semesterBadge && <StatusPill>{semesterBadge}</StatusPill>}
                    {isGame && <StatusPill>Đua Top Bảng Vàng</StatusPill>}
                  </div>
                  <h2 className="text-2xl font-extrabold font-serif tracking-tight leading-tight text-[#293d32] dark:text-[#ecece0]">
                    {title}
                  </h2>
                </div>

                <p className="text-[13.5px] font-medium leading-relaxed text-[#575e55] dark:text-[#b0b9ac]">
                  {isGame
                    ? "Sẵn sàng thử thách kiến thức Giáo lý với chuỗi câu hỏi nhanh, tích lũy combo điểm thưởng và đua top bảng vàng!"
                    : "Chúc bạn làm bài thật tốt! Đọc kỹ thông số đề thi trước khi bắt đầu tính giờ nhé."}
                </p>

                {/* BẢNG THÔNG SỐ (PHÂN BIỆT RÕ RÀNG ĐỐ VUI vs BÀI THI) */}
                <div className="grid grid-cols-2 gap-2.5 p-3.5 rounded-2xl bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237] text-left text-[12.5px]">
                  {/* Ô 1: Thời gian */}
                  <div className="flex items-center gap-2 p-1">
                    <span className="text-base flex-shrink-0">⏱️</span>
                    <div>
                      <div className="text-[#575e55] dark:text-[#b0b9ac] text-[11px] font-medium">
                        {isGame ? "Thời gian" : "Thời lượng"}
                      </div>
                      <div className="font-bold text-[#293d32] dark:text-[#ecece0]">
                        {isGame
                          ? (config?.timerSeconds ? `${config.timerSeconds}s / câu` : "15 giây / câu")
                          : `${durationMinutes} phút`}
                      </div>
                    </div>
                  </div>

                  {/* Ô 2: Cấu trúc / Số câu */}
                  <div className="flex items-center gap-2 p-1">
                    <span className="text-base flex-shrink-0">📝</span>
                    <div>
                      <div className="text-[#575e55] dark:text-[#b0b9ac] text-[11px] font-medium">
                        {isGame ? "Số lượng" : "Cấu trúc"}
                      </div>
                      <div className="font-bold text-[#293d32] dark:text-[#ecece0]">
                        {isGame
                          ? `${mcqCount} câu trắc nghiệm`
                          : `${mcqCount} TN${essayCount > 0 ? ` + ${essayCount} TL` : ""}`}
                      </div>
                    </div>
                  </div>

                  {/* Ô 3: Điểm số (Game: Thưởng tốc độ, Quiz: Thang điểm 10) */}
                  <div className="flex items-center gap-2 p-1">
                    <span className="text-base flex-shrink-0">{isGame ? "⚡" : "🎯"}</span>
                    <div>
                      <div className="text-[#575e55] dark:text-[#b0b9ac] text-[11px] font-medium">
                        {isGame ? "Cơ chế điểm" : "Thang điểm"}
                      </div>
                      <div className="font-bold text-[#293d32] dark:text-[#ecece0]">
                        {isGame ? "+100đ & Thưởng tốc độ" : `${Number(maxScore).toFixed(1)} điểm`}
                      </div>
                    </div>
                  </div>

                  {/* Ô 4: Xếp hạng / Chấm điểm */}
                  <div className="flex items-center gap-2 p-1">
                    <span className="text-base flex-shrink-0">{isGame ? "🏆" : "🔄"}</span>
                    <div>
                      <div className="text-[#575e55] dark:text-[#b0b9ac] text-[11px] font-medium">
                        {isGame ? "Xếp hạng" : "Chấm điểm"}
                      </div>
                      <div className="font-bold text-[#293d32] dark:text-[#ecece0]">
                        {isGame ? "Tuần & Tháng" : "Tự động"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* HỘP LƯU Ý / MẸO TRỢ GIÚP */}
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#927140]/10 dark:bg-[#d4b47d]/15 border border-[#927140]/25 dark:border-[#d4b47d]/30 text-left text-[12.5px] leading-relaxed text-[#7c5c2d] dark:text-[#d4b47d]">
                  <span className="text-sm mt-0.5 flex-shrink-0">💡</span>
                  <div>
                    {isGame ? (
                      <>
                        Có 2 quyền trợ giúp: <strong>🪄 50:50</strong> và <strong>⏱️ +10s</strong>. Bấm nút <strong>[ ? ]</strong> trong khi chơi để xem lại luật tính điểm.
                      </>
                    ) : (
                      <>
                        Đồng hồ đếm ngược sẽ <strong>bắt đầu chạy ngay lập tức</strong> khi bạn bấm nút Bắt đầu.
                      </>
                    )}
                  </div>
                </div>

                {/* CỤM NÚT BẤM (>= 44px TOUCH TARGET CHO MOBILE) */}
                <div className="flex flex-col gap-2.5 pt-1">
                  <Motion.button
                    type="button"
                    onClick={startQuiz}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.2, ease: APPLE_EASE }}
                    className="w-full min-h-[48px] py-3.5 rounded-xl text-[15px] font-bold tracking-wide transition-all duration-200 bg-[#314e3e] text-[#ffffff] hover:bg-[#273e31] dark:bg-[#d6b883] dark:text-[#19251d] dark:hover:bg-[#cbb07c] shadow-xs cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>{isGame ? "Sẵn sàng, bắt đầu chơi" : "Bắt đầu làm bài"}</span>
                    <span>{isGame ? "🚀" : "→"}</span>
                  </Motion.button>
                  {onClose && (
                    <button
                      type="button"
                      onClick={onClose}
                      className="w-full min-h-[44px] py-3 rounded-xl text-[13.5px] font-semibold text-[#293d32] dark:text-[#ecece0] bg-[#fffefa] dark:bg-[#1e2821] hover:bg-[#faf8f3] dark:hover:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237] transition-colors cursor-pointer"
                    >
                      Chưa sẵn sàng, quay lại
                    </button>
                  )}
                </div>
              </div>
            </Sheet>
          </div>
        </Backdrop>
      )}
    </AnimatePresence>
  );
}

// ====================== SUBMIT CONFIRM BOX (XÁC NHẬN NỘP BÀI) =========================
export function SubmitConfirmBox({
  isOpen = true,
  onConfirm,
  onCancel,
  mcqTotal = 0,
  mcqAnswered = 0,
  essayTotal = 0,
  essayAnswered = 0,
}) {
  const hasUnanswered = mcqAnswered < mcqTotal || (essayTotal > 0 && essayAnswered < essayTotal);

  return (
    <AnimatePresence>
      {isOpen && (
        <Backdrop handleClose={onCancel}>
          <div className={sheetWrapClass} onClick={(e) => e.stopPropagation()}>
            <Sheet onClose={onCancel} maxWidth="sm:max-w-md">
              <div className="text-center space-y-4 pb-1">
                <Motion.div className="flex justify-center" {...iconPop}>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white flex-shrink-0 ring-1 ring-[#314e3e]/20 dark:ring-[#d6b883]/30 shadow-md bg-gradient-to-br from-[#314e3e] via-[#284033] to-[#1e3127] dark:from-[#d6b883] dark:via-[#cbb07c] dark:to-[#b89b65] dark:text-[#19251d]">
                    <LineIcon name="clipboard" />
                  </div>
                </Motion.div>

                <div className="space-y-1.5">
                  <span className="inline-block text-[11px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full shadow-xs bg-[#927140]/10 dark:bg-[#d4b47d]/15 text-[#7c5c2d] dark:text-[#d4b47d] border border-[#927140]/25 dark:border-[#d4b47d]/30">
                    Kiểm tra trước khi nộp
                  </span>
                  <h2 className="text-2xl font-extrabold font-serif tracking-tight text-[#293d32] dark:text-[#ecece0]">
                    Xác nhận nộp bài?
                  </h2>
                </div>

                <p className="text-[13.5px] font-medium leading-relaxed text-[#575e55] dark:text-[#b0b9ac]">
                  Vui lòng kiểm tra lại tiến độ bài làm trước khi gửi kết quả chấm điểm.
                </p>

                {/* BẢNG TIẾN ĐỘ THỰC TẾ */}
                <div className="p-3.5 rounded-2xl bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237] space-y-2 text-[13px] text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-[#575e55] dark:text-[#b0b9ac] font-medium">Trắc nghiệm:</span>
                    <span className={`font-bold ${mcqAnswered >= mcqTotal ? "text-emerald-700 dark:text-emerald-400" : "text-[#7c5c2d] dark:text-[#d4b47d]"}`}>
                      {mcqAnswered >= mcqTotal ? `Đã làm ${mcqAnswered}/${mcqTotal} câu ✓` : `Mới làm ${mcqAnswered}/${mcqTotal} câu ⚠️`}
                    </span>
                  </div>
                  {essayTotal > 0 && (
                    <div className="flex items-center justify-between pt-1 border-t border-[#dedfd4]/60 dark:border-[#354237]/60">
                      <span className="text-[#575e55] dark:text-[#b0b9ac] font-medium">Tự luận:</span>
                      <span className={`font-bold ${essayAnswered >= essayTotal ? "text-emerald-700 dark:text-emerald-400" : "text-[#7c5c2d] dark:text-[#d4b47d]"}`}>
                        {essayAnswered >= essayTotal ? `Đã điền ${essayAnswered}/${essayTotal} câu ✓` : `Mới điền ${essayAnswered}/${essayTotal} câu ⚠️`}
                      </span>
                    </div>
                  )}
                </div>

                {hasUnanswered && (
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#927140]/10 dark:bg-[#d4b47d]/15 border border-[#927140]/25 dark:border-[#d4b47d]/30 text-left text-[12.5px] leading-relaxed text-[#7c5c2d] dark:text-[#d4b47d]">
                    <span className="text-base flex-shrink-0">⚠️</span>
                    <div>
                      Bạn vẫn còn câu chưa hoàn thành. Bạn có chắc chắn muốn nộp bài ngay lúc này?
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-2.5 pt-1">
                  <Motion.button
                    type="button"
                    onClick={onConfirm}
                    whileTap={{ scale: 0.98 }}
                    className="w-full min-h-[48px] py-3.5 rounded-xl text-[14.5px] font-bold transition-all duration-200 bg-[#314e3e] text-[#ffffff] hover:bg-[#273e31] dark:bg-[#d6b883] dark:text-[#19251d] dark:hover:bg-[#cbb07c] shadow-xs cursor-pointer"
                  >
                    Nộp bài ngay
                  </Motion.button>
                  <button
                    type="button"
                    onClick={onCancel}
                    className="w-full min-h-[44px] py-3 rounded-xl text-[13.5px] font-semibold text-[#293d32] dark:text-[#ecece0] bg-[#fffefa] dark:bg-[#1e2821] hover:bg-[#faf8f3] dark:hover:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237] transition-colors cursor-pointer"
                  >
                    ← Tiếp tục kiểm tra lại bài
                  </button>
                </div>
              </div>
            </Sheet>
          </div>
        </Backdrop>
      )}
    </AnimatePresence>
  );
}

// ====================== GUIDE BOX =========================
export function GuideBox({
  setShowGuide,
  onConfirm,
  skipStorageKey = "skipQuizGuide",
  showCheckbox = true,
  mode = "quiz",
  isMidQuiz = false,
}) {
  const [skipGuide, setSkipGuide] = useState(false);

  const closeGuide = () => {
    if (onConfirm) {
      onConfirm(skipGuide);
      return;
    }
    if (skipGuide && !isMidQuiz) {
      try {
        localStorage.setItem(skipStorageKey, "true");
      } catch (err) {
        console.warn("Không thể lưu trạng thái hướng dẫn:", err);
      }
    }
    setShowGuide?.(false);
  };

  const isGame = mode === "game";

  const quizCards = [
    {
      icon: "⏱️",
      title: "Thời gian làm bài liên tục",
      desc: (
        <>
          Đồng hồ đếm ngược chạy liên tục. Khi hết giờ, hệ thống sẽ <strong>tự động nộp và khóa bài</strong> để chấm điểm.
        </>
      ),
    },
    {
      icon: "🔘",
      title: "Phần I — Trắc nghiệm",
      desc: (
        <>
          Chọn 1 đáp án bạn tin là đúng. Có thể bấm <strong>"Bỏ qua câu này"</strong> để chuyển câu tiếp theo nếu cần suy nghĩ thêm.
        </>
      ),
    },
    {
      icon: "✍️",
      title: "Phần II — Tự luận",
      desc: (
        <>
          Điền câu trả lời ngắn gọn, nêu đúng các <strong>từ khóa giáo lý chính</strong> để hệ thống tự động ghi nhận điểm số.
        </>
      ),
    },
    {
      icon: "🎯",
      title: "Thang điểm 10.0 & Xem đáp án",
      desc: (
        <>
          Bấm <strong>"Nộp bài ✓"</strong> sẽ có hộp kiểm tra nhắc câu chưa làm. Sau khi nộp, bạn có thể xem lại kết quả và lời giải chi tiết.
        </>
      ),
    },
  ];

  const gameCards = [
    {
      icon: "⚡",
      title: "Điểm cơ bản & Thưởng tốc độ",
      desc: (
        <>
          Đúng mỗi câu nhận <strong>+100 điểm base</strong>. Trả lời thần tốc <strong>&lt; 5 giây</strong> nhận thêm <strong>+50 điểm bonus</strong>.
        </>
      ),
    },
    {
      icon: "🔥",
      title: "Chuỗi thắng Combo Streak",
      desc: (
        <>
          Trả lời đúng liên tiếp nhiều câu để nhận <strong>Combo Streak (+20đ/nấc)</strong> bứt phá số điểm.
        </>
      ),
    },
    {
      icon: "🪄",
      title: "2 Quyền trợ giúp đặc biệt",
      desc: (
        <>
          Được dùng <strong>1 lần 50:50</strong> (ẩn 2 phương án sai) và <strong>1 lần +10s</strong> thời gian suy nghĩ mỗi lượt chơi.
        </>
      ),
    },
    {
      icon: "🏆",
      title: "Bảng Xếp Hạng Tuần & Tháng",
      desc: (
        <>
          Điểm số sau mỗi lượt chơi được tích lũy vào hệ thống <strong>Bảng Xếp Hạng</strong> để vinh danh các cá nhân xuất sắc.
        </>
      ),
    },
  ];

  const cards = isGame ? gameCards : quizCards;

  return (
    <Backdrop handleClose={closeGuide}>
      <div className={sheetWrapClass} onClick={(e) => e.stopPropagation()}>
        <Sheet onClose={closeGuide} maxWidth="sm:max-w-md">
          <div className="space-y-4 pb-1 text-left">
            {/* Tiêu đề & Icon Header */}
            <div className="flex items-center gap-3.5">
              <Motion.div {...iconPop}>
                <IconBadge icon="book" />
              </Motion.div>
              <div className="space-y-1 min-w-0">
                <StatusPill>
                  {isGame ? "Cơ chế tính điểm & Trợ giúp" : "Quy cách bài thi giáo lý"}
                </StatusPill>
                <h2 className="text-xl font-extrabold font-serif tracking-tight text-[#293d32] dark:text-[#ecece0] leading-tight">
                  {isGame ? "Luật Chơi Đố Vui Giáo Lý" : "Hướng Dẫn Làm Bài Thi"}
                </h2>
              </div>
            </div>

            {/* Danh sách 4 thẻ trực quan (Visual Cards Layout) */}
            <div className="flex flex-col gap-2.5 pt-1">
              {cards.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-2xl bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237] shadow-xs"
                >
                  <span className="text-xl flex-shrink-0 mt-0.5 select-none" aria-hidden="true">
                    {item.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-[13.5px] font-bold text-[#293d32] dark:text-[#ecece0] leading-snug mb-0.5">
                      {item.title}
                    </h4>
                    <p className="text-[12.5px] font-medium leading-relaxed text-[#575e55] dark:text-[#b0b9ac]">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Hộp thông báo lời khuyên */}
            <div className="flex items-start gap-2.5 text-[12.5px] font-medium leading-relaxed rounded-xl p-3 shadow-xs bg-[#927140]/10 dark:bg-[#d4b47d]/15 border border-[#927140]/25 dark:border-[#d4b47d]/30 text-[#7c5c2d] dark:text-[#d4b47d]">
              <span className="text-sm mt-0.5 flex-shrink-0" aria-hidden="true">💡</span>
              <div>
                {isMidQuiz ? (
                  <>Đồng hồ bài thi vẫn đang tính giờ. Hãy quay lại làm bài ngay khi đã nắm rõ quy cách.</>
                ) : (
                  <>Bạn có thể mở lại hướng dẫn này bất kỳ lúc nào bằng nút <strong>[ ? ]</strong> trên thanh đầu trang.</>
                )}
              </div>
            </div>

            {/* Hộp kiểm ghi nhớ (chỉ hiện trước khi bắt đầu thi) */}
            {showCheckbox && !isMidQuiz && (
              <label className="flex items-center gap-2.5 cursor-pointer select-none py-1 ml-0.5">
                <input
                  type="checkbox"
                  checked={skipGuide}
                  onChange={(e) => setSkipGuide(e.target.checked)}
                  className="w-4.5 h-4.5 rounded border-[#dedfd4] dark:border-[#354237] text-[#314e3e] dark:text-[#d6b883] cursor-pointer accent-[#314e3e] dark:accent-[#d6b883]"
                />
                <span className="text-[13px] font-medium text-[#575e55] dark:text-[#b0b9ac]">
                  Ghi nhớ, không tự động mở lại trước mỗi bài thi
                </span>
              </label>
            )}

            {/* Nút hành động chính thông minh theo ngữ cảnh */}
            <Motion.button
              type="button"
              onClick={closeGuide}
              whileTap={{ scale: 0.98 }}
              className="w-full min-h-[48px] py-3.5 rounded-xl text-[14.5px] font-bold transition-all duration-200 bg-[#314e3e] text-[#ffffff] hover:bg-[#273e31] dark:bg-[#d6b883] dark:text-[#19251d] dark:hover:bg-[#cbb07c] shadow-xs cursor-pointer flex items-center justify-center gap-2"
            >
              <span>
                {isMidQuiz
                  ? (isGame ? "Đã hiểu, tiếp tục chơi ✓" : "Đã hiểu, tiếp tục làm bài ✓")
                  : (isGame ? "Đã hiểu, bắt đầu chơi →" : "Đã hiểu, sẵn sàng làm bài →")}
              </span>
            </Motion.button>
          </div>
        </Sheet>
      </div>
    </Backdrop>
  );
}