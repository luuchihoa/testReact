import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import PWAInstallModal from "./PWAInstallModal.jsx";

const PWAInstallContext = createContext(null);

// Lưu trữ sự kiện trước khi React mount để không bị mất sự kiện
let globalDeferredPrompt = null;
const promptListeners = new Set();

function checkIsStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true ||
    document.referrer.includes("android-app://")
  );
}

function checkIsInstalled() {
  if (typeof window === "undefined") return false;
  if (checkIsStandalone()) {
    try {
      localStorage.setItem("pwa_installed", "true");
    } catch {
      // ignore
    }
    return true;
  }
  try {
    return localStorage.getItem("pwa_installed") === "true";
  } catch {
    return false;
  }
}

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    globalDeferredPrompt = e;
    // Khi beforeinstallprompt kích hoạt, trình duyệt xác nhận app chưa được cài đặt
    try {
      localStorage.removeItem("pwa_installed");
    } catch {
      // ignore
    }
    promptListeners.forEach((fn) => fn());
  });

  window.addEventListener("appinstalled", () => {
    try {
      localStorage.setItem("pwa_installed", "true");
    } catch {
      // ignore
    }
    globalDeferredPrompt = null;
    promptListeners.forEach((fn) => fn());
  });
}

function checkIsIOS() {
  if (typeof navigator === "undefined") return false;
  return (
    (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)) &&
    !window.MSStream
  );
}

export function PWAInstallProvider({ children }) {
  const [isInstalled, setIsInstalled] = useState(checkIsInstalled);
  const [hasNativePrompt, setHasNativePrompt] = useState(() => !!globalDeferredPrompt);
  const [isIOS] = useState(checkIsIOS);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const handlePromptChange = () => {
      setHasNativePrompt(!!globalDeferredPrompt);
      setIsInstalled(checkIsInstalled());
    };

    promptListeners.add(handlePromptChange);

    const mediaQuery = window.matchMedia("(display-mode: standalone)");
    const handleDisplayModeChange = (e) => {
      if (e.matches) {
        try {
          localStorage.setItem("pwa_installed", "true");
        } catch {
          // ignore
        }
      }
      setIsInstalled(checkIsInstalled());
    };

    mediaQuery.addEventListener("change", handleDisplayModeChange);

    return () => {
      promptListeners.delete(handlePromptChange);
      mediaQuery.removeEventListener("change", handleDisplayModeChange);
    };
  }, []);

  const openInstallModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const closeInstallModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const install = useCallback(async () => {
    if (checkIsStandalone()) {
      openInstallModal();
      return;
    }

    if (globalDeferredPrompt) {
      try {
        await globalDeferredPrompt.prompt();
        const { outcome } = await globalDeferredPrompt.userChoice;
        if (outcome === "accepted") {
          try {
            localStorage.setItem("pwa_installed", "true");
          } catch {
            // ignore
          }
          globalDeferredPrompt = null;
          setHasNativePrompt(false);
          setIsInstalled(true);
        }
      } catch (err) {
        console.error("PWA install error:", err);
        openInstallModal();
      }
    } else {
      // Trên iOS hoặc các trình duyệt khác không có beforeinstallprompt
      openInstallModal();
    }
  }, [openInstallModal]);

  const value = {
    isInstalled,
    isInstallable: !isInstalled,
    hasNativePrompt,
    isIOS,
    install,
    openInstallModal,
    closeInstallModal,
  };

  return (
    <PWAInstallContext.Provider value={value}>
      {children}
      <PWAInstallModal
        isOpen={isModalOpen}
        onClose={closeInstallModal}
        onInstallNative={install}
        hasNativePrompt={hasNativePrompt}
        isIOS={isIOS}
        isInstalled={isInstalled}
      />
    </PWAInstallContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function usePWAInstall() {
  const context = useContext(PWAInstallContext);
  if (!context) {
    throw new Error("usePWAInstall must be used within a PWAInstallProvider");
  }
  return context;
}
