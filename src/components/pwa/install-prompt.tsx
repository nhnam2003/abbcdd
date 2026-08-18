"use client";

import { useEffect, useState } from "react";
import { Download, Share, Plus, X } from "lucide-react";
import Button from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function getIsIOS(): boolean {
  if (typeof window === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream;
}

function getIsStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(display-mode: standalone)").matches;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS] = useState(getIsIOS);
  const [isStandalone] = useState(getIsStandalone);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  if (isStandalone || dismissed) return null;
  if (!deferredPrompt && !isIOS) return null;

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") {
      setDismissed(true);
    }
    setDeferredPrompt(null);
  };

  return (
    <div className="fixed bottom-4 right-4 z-[60] w-80 max-w-[calc(100vw-2rem)] rounded-2xl border border-neutral-200 bg-white p-4 shadow-xl dark:border-neutral-800 dark:bg-neutral-900">
      <button
        type="button"
        aria-label="Đóng"
        className="absolute right-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800 dark:hover:text-neutral-300"
        onClick={() => setDismissed(true)}
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-center gap-3 pr-6">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-subtle/60 text-brand-dark dark:bg-brand/15 dark:text-brand-light">
          <Download className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Cài đặt ứng dụng</h3>
          <p className="mt-0.5 text-[11px] text-neutral-500 dark:text-neutral-400">
            Cài May Center để dùng nhanh như app trên điện thoại.
          </p>
        </div>
      </div>

      {deferredPrompt ? (
        <Button size="lg" className="mt-3 w-full" onClick={handleInstall}>
          <Download className="h-4 w-4" />
          Cài đặt ngay
        </Button>
      ) : (
        <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-neutral-200 bg-neutral-50 p-3 text-[11px] leading-relaxed text-neutral-500 dark:border-neutral-800 dark:bg-neutral-950/40 dark:text-neutral-400">
          <Share className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand dark:text-brand-light" />
          <span>
            Mở trình duyệt <span className="font-semibold">Safari</span>, bấm nút{" "}
            <span className="font-semibold">Chia sẻ</span>{" "}
            <Plus className="inline h-3 w-3 align-[-1px]" />, sau đó chọn{" "}
            <span className="font-semibold">Thêm vào Màn hình chính</span>.
          </span>
        </div>
      )}
    </div>
  );
}
