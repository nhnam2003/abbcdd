// Firebase client singleton — dùng chung cho toàn app (client components).
// Bám sát: task-P3-01 + firebase-basics/references/web_setup.md
// - Đọc config từ NEXT_PUBLIC_* (đã inline lúc build theo Next.js env guide)
// - Singleton via getApps()/getApp() để tránh init 2 lần (React StrictMode / HMR)
// - Không import file này trong Server Component nếu chưa cần (auth/db là client SDK).
// - Persistence offline (P3-05): persistentLocalCache + multi-tab manager.

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import {
  initializeFirestore,
  getFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  type Firestore,
} from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

function isPlaceholder(v: string | undefined): boolean {
  if (!v) return true;
  return v.includes("your_") || v.includes("YOUR_") || v.includes("placeholder");
}

export function isFirebaseConfigured(): boolean {
  const cfg = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
  return Object.values(cfg).every((v) => v && !isPlaceholder(v));
}

export function getFirebaseConfig() {
  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
    ...(process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
      ? { measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID }
      : {}),
  };
}

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

export function initFirebase(): FirebaseApp | null {
  if (typeof window === "undefined") return null;
  if (!isFirebaseConfigured()) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[firebase] Chưa cấu hình NEXT_PUBLIC_FIREBASE_*. App chạy chế độ localStorage fallback. Xem .env.example"
      );
    }
    return null;
  }
  if (app) return app;
  app = getApps().length > 0 ? getApp() : initializeApp(getFirebaseConfig());
  return app;
}

export function getFirebaseAuth(): Auth | null {
  if (typeof window === "undefined") return null;
  const fbApp = initFirebase();
  if (!fbApp) return null;
  if (!auth) auth = getAuth(fbApp);
  return auth;
}

export function getFirebaseDb(): Firestore | null {
  if (typeof window === "undefined") return null;
  const fbApp = initFirebase();
  if (!fbApp) return null;
  if (db) return db;
  try {
    // Bật persistence IndexedDB + multi-tab (P3-05). Nếu browser không hỗ trợ, fallback memory.
    db = initializeFirestore(fbApp, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
    });
  } catch {
    db = getFirestore(fbApp);
  }
  return db;
}

export function getFirebaseStorage(): FirebaseStorage | null {
  if (typeof window === "undefined") return null;
  const fbApp = initFirebase();
  if (!fbApp) return null;
  if (!storage) storage = getStorage(fbApp);
  return storage;
}
