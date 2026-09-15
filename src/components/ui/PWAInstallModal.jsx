import React, { useEffect, useRef, useState, useCallback } from "react";
import { X, Smartphone, Download, CheckCircle2, Sparkles, Zap, WifiOff, Bell, HardDrive } from "lucide-react";

export default function PWAInstallModal({
  isOpen,
  onClose,
  onInstallNative,
  hasNativePrompt,
  isIOS,
  isInstalled,
}) {
  const modalRef = useRef(null);

  const getInitialTab = useCallback(() => {
    return isIOS ? "ios" : "android";
  }, [isIOS]);

  const [tabOverride, setTabOverride] = useState(null);
  const activeTab = tabOverride ?? getInitialTab();

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    if (typeof window !== "undefined" && window.lenis) {
      window.lenis.stop();
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
      if (typeof window !== "undefined" && window.lenis) {
        window.lenis.start();
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pwa-install-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        className="w-full sm:max-w-lg bg-[#FAF8F3] dark:bg-[#18201B] text-stone-800 dark:text-stone-200 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-stone-200/80 dark:border-stone-800 flex flex-col overflow-hidden max-h-[94vh] animate-in fade-in slide-in-from-bottom-6 duration-200"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {/* Top Bar with App Badge */}
        <div className="px-6 pt-5 pb-3 border-b border-stone-200/70 dark:border-stone-800/80 bg-white/70 dark:bg-[#1E2822]/80 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="relative shrink-0">
                <img
                  src={`${import.meta.env.BASE_URL}images/pwa-v2/icon-192.png`}
                  alt="Logo Ban Giáo Lý"
                  className="w-12 h-12 rounded-2xl p-0.5 bg-[#FAF8F3] dark:bg-[#141B16] border border-stone-200/80 dark:border-stone-700/80 shadow-sm object-contain"
                />
                <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#314e3e] text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                  ✓
                </span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h2 id="pwa-install-title" className="text-base font-bold text-stone-900 dark:text-stone-100 font-serif truncate">
                    Ban Giáo Lý An Ngãi
                  </h2>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 shrink-0">
                    Ứng dụng PWA
                  </span>
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 truncate">
                  Xứ Đoàn Mẹ Mân Côi · HTDC
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng"
              className="w-9 h-9 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Platform Switcher Tabs: 2 Tabs Only (iOS & Android) */}
          <div
            role="tablist"
            aria-label="Chọn hệ điều hành"
            className="flex items-center p-1 mt-4 bg-stone-200/70 dark:bg-stone-800/70 rounded-xl gap-1 text-xs font-semibold"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "ios"}
              onClick={() => setTabOverride("ios")}
              className={`flex-1 py-2.5 px-2 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === "ios"
                  ? "bg-white dark:bg-[#25322A] text-stone-900 dark:text-stone-100 shadow-xs font-bold"
                  : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>iPhone / iPad (iOS)</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "android"}
              onClick={() => setTabOverride("android")}
              className={`flex-1 py-2.5 px-2 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === "android"
                  ? "bg-white dark:bg-[#25322A] text-stone-900 dark:text-stone-100 shadow-xs font-bold"
                  : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Điện thoại Android</span>
            </button>
          </div>
        </div>

        {/* Modal Body Scrollable */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* 4 Feature Badges */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white dark:bg-[#1E2822] border border-stone-200/70 dark:border-stone-800 shadow-xs">
              <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center text-xs shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <div className="text-left leading-tight min-w-0">
                <div className="text-[12px] font-bold text-stone-800 dark:text-stone-200 truncate">Mở tức thì 1 chạm</div>
                <div className="text-[10px] text-stone-500 dark:text-stone-400 truncate">Không cần gõ web</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white dark:bg-[#1E2822] border border-stone-200/70 dark:border-stone-800 shadow-xs">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-xs shrink-0">
                <WifiOff className="w-4 h-4" />
              </div>
              <div className="text-left leading-tight min-w-0">
                <div className="text-[12px] font-bold text-stone-800 dark:text-stone-200 truncate">Dùng ngoại tuyến</div>
                <div className="text-[10px] text-stone-500 dark:text-stone-400 truncate">Xem lịch cả khi mất mạng</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white dark:bg-[#1E2822] border border-stone-200/70 dark:border-stone-800 shadow-xs">
              <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 flex items-center justify-center text-xs shrink-0">
                <Bell className="w-4 h-4" />
              </div>
              <div className="text-left leading-tight min-w-0">
                <div className="text-[12px] font-bold text-stone-800 dark:text-stone-200 truncate">Nhận thông báo</div>
                <div className="text-[10px] text-stone-500 dark:text-stone-400 truncate">Lịch lễ & bài tập mới</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white dark:bg-[#1E2822] border border-stone-200/70 dark:border-stone-800 shadow-xs">
              <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 flex items-center justify-center text-xs shrink-0">
                <HardDrive className="w-4 h-4" />
              </div>
              <div className="text-left leading-tight min-w-0">
                <div className="text-[12px] font-bold text-stone-800 dark:text-stone-200 truncate">Siêu nhẹ máy</div>
                <div className="text-[10px] text-stone-500 dark:text-stone-400 truncate">Không tốn dung lượng</div>
              </div>
            </div>
          </div>

          {/* Installed Notification state */}
          {isInstalled && (
            <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/50 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="min-w-0 text-left">
                <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                  Ứng dụng đã được cài đặt trên thiết bị này!
                </p>
                <p className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80 mt-0.5">
                  Bạn có thể mở trực tiếp từ biểu tượng ngoài màn hình chính.
                </p>
              </div>
            </div>
          )}

          {/* TAB 1: iOS */}
          {activeTab === "ios" && (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#927140] dark:text-[#d4b47d]">
                  3 Bước thêm vào màn hình chính iPhone:
                </span>
                <span className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">
                  Trình duyệt Safari
                </span>
              </div>

              {/* Step 1 */}
              <div className="p-3.5 rounded-2xl bg-white dark:bg-[#1E2822] border border-stone-200/80 dark:border-stone-800 shadow-xs">
                <div className="flex items-start gap-3.5">
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 shadow-xs">
                    1
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-bold text-stone-900 dark:text-stone-100">
                      Bấm nút "Chia sẻ" ở thanh dưới Safari
                    </div>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                      Tìm biểu tượng ô vuông có mũi tên trỏ lên ở thanh công cụ dưới cùng Safari.
                    </p>
                  </div>
                  {/* Apple Safari Share Icon mockup */}
                  <div className="shrink-0 p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/60">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
                      <polyline points="16 6 12 2 8 6" />
                      <line x1="12" x2="12" y1="2" y2="15" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-3.5 rounded-2xl bg-white dark:bg-[#1E2822] border border-stone-200/80 dark:border-stone-800 shadow-xs">
                <div className="flex items-start gap-3.5">
                  <div className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 shadow-xs">
                    2
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-bold text-stone-900 dark:text-stone-100">
                      Cuộn xuống chọn "Thêm vào MH chính"
                    </div>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                      Tiếng Anh là: <em>"Add to Home Screen"</em> (kèm biểu tượng dấu cộng).
                    </p>
                  </div>
                  {/* Apple Add to Home Screen mockup */}
                  <div className="shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 text-xs font-bold">
                    <svg className="w-4 h-4 text-stone-700 dark:text-stone-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <rect width="18" height="18" x="3" y="3" rx="2" />
                      <line x1="12" x2="12" y1="8" y2="16" />
                      <line x1="8" x2="16" y1="12" y2="12" />
                    </svg>
                    <span>+ Thêm</span>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-3.5 rounded-2xl bg-white dark:bg-[#1E2822] border border-stone-200/80 dark:border-stone-800 shadow-xs">
                <div className="flex items-start gap-3.5">
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 shadow-xs">
                    3
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-bold text-stone-900 dark:text-stone-100">
                      Nhấn nút "Thêm" (Add) góc trên
                    </div>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                      Biểu tượng Ban Giáo Lý sẽ xuất hiện ngay trên màn hình chính của bạn.
                    </p>
                  </div>
                  <div className="shrink-0 px-3 py-1.5 rounded-xl bg-[#314e3e] text-white text-xs font-bold shadow-xs">
                    Thêm
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Android (Nâng cấp trực quan tương đương iOS) */}
          {activeTab === "android" && (
            <div className="space-y-4">
              {/* Banner Cài đặt tự động 1-chạm nếu trình duyệt hỗ trợ */}
              {hasNativePrompt && !isInstalled && (
                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50/60 dark:from-emerald-950/40 dark:to-[#1E2822] border border-emerald-200/80 dark:border-emerald-800/60 shadow-xs text-left">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
                        <h4 className="text-xs font-bold text-emerald-950 dark:text-emerald-200 uppercase tracking-wide">
                          Cài đặt nhanh 1 chạm
                        </h4>
                      </div>
                      <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80 mt-1 leading-snug">
                        Nhấn cài đặt trực tiếp không cần mở menu trình duyệt:
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onInstallNative();
                        onClose();
                      }}
                      className="shrink-0 py-2.5 px-4 rounded-xl bg-[#314e3e] hover:bg-[#253d30] active:scale-[0.98] text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Cài đặt ngay</span>
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-0.5">
                <span className="text-xs font-bold uppercase tracking-wider text-[#927140] dark:text-[#d4b47d]">
                  3 Bước cài đặt trực quan trên Android (Chrome / Cốc Cốc):
                </span>
                <span className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">
                  Hình minh họa
                </span>
              </div>

              {/* Step 1 Android */}
              <div className="p-3.5 rounded-2xl bg-white dark:bg-[#1E2822] border border-stone-200/80 dark:border-stone-800 shadow-xs">
                <div className="flex items-start gap-3.5">
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 shadow-xs">
                    1
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-bold text-stone-900 dark:text-stone-100">
                      Bấm Menu dấu 3 chấm (⋮) ở góc trên Chrome
                    </div>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                      Nằm ở góc trên cùng bên phải màn hình cạnh thanh địa chỉ URL.
                    </p>
                  </div>
                  {/* Mockup Chrome 3-dots */}
                  <div className="shrink-0 p-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700 flex items-center gap-1">
                    <span className="text-[10px] font-mono font-bold px-1 py-0.5 rounded bg-stone-200 dark:bg-stone-700">
                      URL
                    </span>
                    <span className="font-black text-emerald-600 dark:text-emerald-400 text-base leading-none">
                      ⋮
                    </span>
                  </div>
                </div>
              </div>

              {/* Step 2 Android */}
              <div className="p-3.5 rounded-2xl bg-white dark:bg-[#1E2822] border border-stone-200/80 dark:border-stone-800 shadow-xs">
                <div className="flex items-start gap-3.5">
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 shadow-xs">
                    2
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-bold text-stone-900 dark:text-stone-100">
                      Chọn "Cài đặt ứng dụng" (hoặc Thêm vào MH chính)
                    </div>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                      Tiếng Anh là: <em>"Install app"</em> hoặc <em>"Add to Home screen"</em>.
                    </p>
                  </div>
                  {/* Mockup Chrome Menu Item */}
                  <div className="shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
                    <Download className="w-4 h-4" />
                    <span>Cài đặt</span>
                  </div>
                </div>
              </div>

              {/* Step 3 Android */}
              <div className="p-3.5 rounded-2xl bg-white dark:bg-[#1E2822] border border-stone-200/80 dark:border-stone-800 shadow-xs">
                <div className="flex items-start gap-3.5">
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 shadow-xs">
                    3
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-bold text-stone-900 dark:text-stone-100">
                      Nhấn nút "Cài đặt" xác nhận
                    </div>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                      Android sẽ tự động đưa biểu tượng Ban Giáo Lý ra màn hình chính.
                    </p>
                  </div>
                  {/* Mockup Android Confirm Dialog */}
                  <div className="shrink-0 px-3 py-1.5 rounded-xl bg-[#314e3e] text-white text-xs font-bold shadow-xs">
                    Cài đặt
                  </div>
                </div>
              </div>

              {/* Mẹo dành cho Samsung Internet */}
              <div className="p-3 rounded-xl bg-stone-100 dark:bg-stone-800/60 border border-stone-200/70 dark:border-stone-700/70 text-left text-xs text-stone-600 dark:text-stone-400 flex items-start gap-2">
                <span className="text-base shrink-0">💡</span>
                <p className="leading-relaxed">
                  <strong>Mẹo cho máy Samsung (Samsung Internet):</strong> Nhấn nút <strong>Menu 3 gạch (≡)</strong> ở góc dưới cùng bên phải ➔ Chọn <strong>"+ Thêm trang vào"</strong> ➔ Chọn <strong>"Màn hình chờ"</strong>.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-stone-100/80 dark:bg-[#141B16] border-t border-stone-200/70 dark:border-stone-800 flex items-center justify-between">
          <span className="text-xs text-stone-500 dark:text-stone-400 hidden sm:inline">
            Giáo Xứ An Ngãi · Ban Giáo Lý
          </span>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#314e3e] hover:bg-[#253d30] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            {isInstalled ? "Đóng" : "Tôi đã hiểu"}
          </button>
        </div>
      </div>
    </div>
  );
}
