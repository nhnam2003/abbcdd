"use client";

import { useOffline } from "next/offline";
import { WifiOff } from "lucide-react";

export default function OfflineBanner() {
  const isOffline = useOffline();

  if (!isOffline) return null;

  return (
    <div className="fixed inset-x-0 top-0 z-[60] flex items-center justify-center gap-2 bg-amber-500/95 px-4 py-2 text-center text-xs font-semibold text-white shadow-md backdrop-blur-sm">
      <WifiOff className="h-3.5 w-3.5 shrink-0" />
      <span>Bạn đang ngoại tuyến. Dữ liệu sẽ tự đồng bộ khi có mạng lại.</span>
    </div>
  );
}
