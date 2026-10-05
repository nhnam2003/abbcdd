"use client";

import { useEffect, useState } from "react";
import { useOffline } from "next/offline";
import { WifiOff, RefreshCw } from "lucide-react";
import { getPendingCount, flushPendingQueue } from "@/shared/infra/cache/offline-queue";
import { subscribeSync } from "@/shared/infra/cache/multi-tab-sync";

export default function OfflineBanner() {
  const isOffline = useOffline();
  const [pending, setPending] = useState(() => getPendingCount());
  const [flushing, setFlushing] = useState(false);
  const [tabMsg, setTabMsg] = useState<string | null>(null);

  useEffect(() => {
    const onPending = () => setPending(getPendingCount());
    window.addEventListener("may-guitar-pending", onPending as EventListener);
    const unsub = subscribeSync((msg) => {
      if (msg.type === "pending-changed") setPending(getPendingCount());
      if (msg.type === "data-changed") {
        setTabMsg("Dữ liệu vừa được cập nhật ở tab khác.");
        setTimeout(() => setTabMsg(null), 4000);
      }
    });
    const onOnline = async () => {
      setFlushing(true);
      try {
        await flushPendingQueue();
      } finally {
        setPending(getPendingCount());
        setFlushing(false);
      }
    };
    window.addEventListener("online", onOnline);
    return () => {
      window.removeEventListener("may-guitar-pending", onPending as EventListener);
      window.removeEventListener("online", onOnline);
      unsub();
    };
  }, []);

  if (!isOffline && pending === 0 && !tabMsg) return null;

  return (
    <div className="fixed inset-x-0 top-0 z-[60] flex flex-col items-center justify-center gap-1 bg-amber-500/95 px-4 py-2 text-center text-xs font-semibold text-white shadow-md backdrop-blur-sm">
      {isOffline && (
        <span className="flex items-center gap-2">
          <WifiOff className="h-3.5 w-3.5 shrink-0" />
          Bạn đang ngoại tuyến. Dữ liệu sẽ tự đồng bộ khi có mạng lại.
        </span>
      )}
      {pending > 0 && (
        <span className="flex items-center gap-2">
          <RefreshCw className={`h-3.5 w-3.5 ${flushing ? "animate-spin" : ""}`} />
          {flushing ? "Đang đồng bộ..." : `Chưa đồng bộ (${pending})`}
        </span>
      )}
      {tabMsg && <span>{tabMsg}</span>}
    </div>
  );
}
