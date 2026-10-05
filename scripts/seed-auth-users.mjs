// Seed 5 user Auth + doc users/{uid} đúng role (task-P3-02).
// Chạy: npm run seed:users  (tự load .env/.env.local)
// - Idempotent: user đã tồn tại → chỉ đảm bảo doc users đúng role, không đổi password.
// - Password tạm chỉ in ra cho user MỚI tạo — đăng nhập xong đổi ngay ở /dashboard/profile.

import nextEnv from "@next/env";
nextEnv.loadEnvConfig(process.cwd());

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

function mustEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Thiếu env ${name}. Xem .env.example`);
  return v;
}

const projectId = mustEnv("FIREBASE_PROJECT_ID");
const clientEmail = mustEnv("FIREBASE_CLIENT_EMAIL");
const privateKey = mustEnv("FIREBASE_PRIVATE_KEY").replace(/\\n/g, "\n");

if (getApps().length === 0) {
  initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
}
const auth = getAuth();
const db = getFirestore();

const seeds = [
  { email: "admin@mayguitar.com", role: "admin", displayName: "Quản Trị Viên" },
  { email: "teacher@mayguitar.com", role: "teacher", displayName: "Thầy Tiến Guitar" },
  { email: "phuongcam@mayguitar.com", role: "teacher", displayName: "Cô Phương Cầm" },
  { email: "student@mayguitar.com", role: "student", displayName: "Nguyễn Minh Đức" },
  { email: "baonam@mayguitar.com", role: "student", displayName: "Trần Bảo Nam" },
];

import { randomBytes } from "crypto";

function tempPassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  const bytes = randomBytes(12);
  let s = "";
  for (let i = 0; i < 12; i++) s += chars[bytes[i] % chars.length];
  return s;
}

async function main() {
  for (const s of seeds) {
    let uid;
    let isNew = false;
    try {
      const existing = await auth.getUserByEmail(s.email);
      uid = existing.uid;
      console.log(`[skip] auth ${s.email} đã tồn tại (uid=${uid}) — không đổi password`);
    } catch (e) {
      if (e.code !== "auth/user-not-found") throw e;
      const pw = tempPassword();
      const created = await auth.createUser({
        email: s.email,
        password: pw,
        displayName: s.displayName,
        emailVerified: false,
      });
      uid = created.uid;
      isNew = true;
      console.log(`[create] auth ${s.email} (uid=${uid}) password-tam=${pw}  <-- đổi ngay sau khi login`);
    }
    const ref = db.collection("users").doc(uid);
    const snap = await ref.get();
    const now = new Date().toISOString();
    if (!snap.exists) {
      await ref.set({
        email: s.email,
        displayName: s.displayName,
        role: s.role,
        createdAt: now,
        serverCreatedAt: FieldValue.serverTimestamp(),
      });
      console.log(`[create] users/${uid} role=${s.role}`);
    } else if (snap.data().role !== s.role) {
      await ref.update({ role: s.role });
      console.log(`[update] users/${uid} role -> ${s.role}${isNew ? "" : " (user cũ, password giữ nguyên)"}`);
    } else {
      console.log(`[skip] users/${uid} đã đúng role=${s.role}`);
    }
  }
  console.log("[seed] DONE. User mới PHẢI đổi mật khẩu ở /dashboard/profile sau lần login đầu.");
}

main().catch((e) => {
  console.error("[seed] FAILED:", e.message);
  process.exit(1);
});
