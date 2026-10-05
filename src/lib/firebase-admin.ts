// Firebase Admin singleton — chỉ dùng phía server (Route Handler / Server Action / script).
// Đọc từ FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY.
// Không bao giờ import file này trong Client Component.

import { getApps, initializeApp, cert, type App } from "firebase-admin/app";
import { getAuth as getAdminAuth } from "firebase-admin/auth";
import { getFirestore as getAdminFirestore } from "firebase-admin/firestore";

let adminApp: App | null = null;

export function isAdminConfigured(): boolean {
  return Boolean(
    process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY &&
      !process.env.FIREBASE_PRIVATE_KEY.includes("YOUR_PRIVATE_KEY")
  );
}

export function initAdmin(): App | null {
  if (adminApp) return adminApp;
  if (!isAdminConfigured()) return null;
  if (getApps().length > 0) {
    adminApp = getApps()[0];
    return adminApp;
  }
  const privateKey = (process.env.FIREBASE_PRIVATE_KEY ?? "").replace(/\\n/g, "\n");
  adminApp = initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey,
    }),
  });
  return adminApp;
}

export function getAdminDb() {
  const app = initAdmin();
  if (!app) return null;
  return getAdminFirestore(app);
}

export function getAdminAuthInstance() {
  const app = initAdmin();
  if (!app) return null;
  return getAdminAuth(app);
}
