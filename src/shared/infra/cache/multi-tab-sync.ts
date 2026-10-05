// Sync đa tab (P3-05): BroadcastChannel + storage event fallback.
// Kênh: 'may-guitar-sync'. Message: { type, payload, at }.

"use client";

export type SyncMessage = {
  type: "pending-changed" | "data-changed" | "auth-changed";
  payload?: Record<string, unknown>;
  at: string;
};

const CHANNEL = "may-guitar-sync";
let bc: BroadcastChannel | null = null;

function getChannel(): BroadcastChannel | null {
  if (typeof window === "undefined" || !("BroadcastChannel" in window)) return null;
  if (!bc) bc = new BroadcastChannel(CHANNEL);
  return bc;
}

export function notify(type: SyncMessage["type"], payload?: Record<string, unknown>): void {
  const msg: SyncMessage = { type, payload, at: new Date().toISOString() };
  getChannel()?.postMessage(msg);
  // Fallback cho browser không có BroadcastChannel: dùng storage event.
  try {
    localStorage.setItem(`${CHANNEL}:last`, JSON.stringify(msg));
  } catch {}
}

export function subscribeSync(cb: (msg: SyncMessage) => void): () => void {
  if (typeof window === "undefined") return () => {};
  const ch = getChannel();
  const onMsg = (e: MessageEvent<SyncMessage>) => cb(e.data);
  ch?.addEventListener("message", onMsg);
  const onStorage = (e: StorageEvent) => {
    if (e.key === `${CHANNEL}:last` && e.newValue) {
      try {
        cb(JSON.parse(e.newValue) as SyncMessage);
      } catch {}
    }
    // Auth đổi ở tab khác → báo để tab này refresh profile.
    if (e.key === "may_guitar_profile_cache") cb({ type: "auth-changed", at: new Date().toISOString() });
  };
  window.addEventListener("storage", onStorage);
  return () => {
    ch?.removeEventListener("message", onMsg);
    window.removeEventListener("storage", onStorage);
  };
}
