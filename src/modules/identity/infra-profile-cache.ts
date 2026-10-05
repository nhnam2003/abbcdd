// Module identity — profile cache adapter (infrastructure).
// Cache nhẹ cho offline (P3-05): phát cache ngay, sync Firebase sau.

import type { UserProfile } from "./domain";
import type { IProfileCache } from "./ports";

const PROFILE_CACHE_KEY = "may_guitar_profile_cache";
const AUTH_EVENT = "may-guitar-auth-change";

export class LocalProfileCache implements IProfileCache {
  read(): UserProfile | null {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(PROFILE_CACHE_KEY);
      return raw ? (JSON.parse(raw) as UserProfile) : null;
    } catch {
      return null;
    }
  }

  write(profile: UserProfile | null): void {
    if (typeof window === "undefined") return;
    if (profile) localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(profile));
    else localStorage.removeItem(PROFILE_CACHE_KEY);
    window.dispatchEvent(new Event(AUTH_EVENT));
  }

  subscribe(cb: () => void): () => void {
    if (typeof window === "undefined") return () => {};
    window.addEventListener(AUTH_EVENT, cb);
    window.addEventListener("storage", cb);
    return () => {
      window.removeEventListener(AUTH_EVENT, cb);
      window.removeEventListener("storage", cb);
    };
  }
}
