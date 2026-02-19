"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function SWRegister() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isOnline, setIsOnline] = useState(() => {
    if (typeof window === "undefined") return true;
    return navigator.onLine;
  });
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === "undefined") return false;
    return Boolean(localStorage.getItem("pwa-install-dismissed"));
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").then((registration) => {
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (!newWorker) return;
          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              setUpdateAvailable(true);
            }
          });
        });
      });
    }

    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    const onInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onInstallPrompt);

    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("beforeinstallprompt", onInstallPrompt);
    };
  }, []);

  async function handleInstall() {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "dismissed") {
      localStorage.setItem("pwa-install-dismissed", "1");
      setDismissed(true);
    }
    setInstallPrompt(null);
  }

  function handleDismissInstall() {
    localStorage.setItem("pwa-install-dismissed", "1");
    setDismissed(true);
    setInstallPrompt(null);
  }

  function handleUpdate() {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.controller?.postMessage({ type: "SKIP_WAITING" });
    }
    window.location.reload();
  }

  return (
    <>
      {!isOnline && (
        <div className="fixed top-12 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
          <div className="bg-destructive text-destructive-foreground text-xs font-medium px-3 py-1.5 rounded-full shadow-lg pointer-events-auto">
            You&apos;re offline — using cached data
          </div>
        </div>
      )}

      {updateAvailable && (
        <div className="fixed bottom-4 inset-x-4 md:inset-x-auto md:right-4 md:left-auto md:w-80 z-50 animate-in slide-in-from-bottom-2 duration-300">
          <div className="bg-card border border-border rounded-xl shadow-2xl p-4 flex flex-col gap-3">
            <div>
              <p className="text-sm font-semibold">Update available</p>
              <p className="text-xs text-muted-foreground mt-0.5">A new version is ready to load.</p>
            </div>
            <button
              onClick={handleUpdate}
              className="w-full bg-primary text-primary-foreground text-sm font-medium py-2 rounded-lg hover:opacity-90 active:opacity-70 transition-opacity"
            >
              Refresh
            </button>
          </div>
        </div>
      )}

      {installPrompt && !dismissed && (
        <div className="fixed bottom-4 inset-x-4 md:inset-x-auto md:right-4 md:left-auto md:w-80 z-50 animate-in slide-in-from-bottom-2 duration-300">
          <div className="bg-card border border-border rounded-xl shadow-2xl p-4 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">Install app</p>
                <p className="text-xs text-muted-foreground mt-0.5">Add to home screen for quick access, offline use, and no browser UI chrome.</p>
              </div>
              <button
                onClick={handleDismissInstall}
                aria-label="Dismiss"
                className="text-muted-foreground hover:text-foreground transition-colors shrink-0 mt-0.5 p-0.5"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <button
              onClick={handleInstall}
              className="w-full bg-primary text-primary-foreground text-sm font-medium py-2 rounded-lg hover:opacity-90 active:opacity-70 transition-opacity"
            >
              Install
            </button>
          </div>
        </div>
      )}
    </>
  );
}
