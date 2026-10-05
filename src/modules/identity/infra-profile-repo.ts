// Module identity — Firestore users/{uid} adapter (infrastructure).
// Nơi duy nhất trong module identity được import "firebase/firestore".

import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase-client";
import { normalizeRole, type UserProfile } from "./domain";
import type { IUserProfileRepository, FirebaseUserLike } from "./ports";

export class FirestoreUserProfileRepository implements IUserProfileRepository {
  async fetchOrCreate(fbUser: FirebaseUserLike): Promise<UserProfile> {
    const db = getFirebaseDb();
    if (!db) {
      return { uid: fbUser.uid, email: fbUser.email, displayName: fbUser.displayName, role: "student" };
    }
    const ref = doc(db, "users", fbUser.uid);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data() as Record<string, unknown>;
      return {
        uid: fbUser.uid,
        email: (data.email as string) ?? fbUser.email,
        displayName: (data.displayName as string) ?? fbUser.displayName,
        role: normalizeRole(data.role),
        phoneNumber: data.phoneNumber as string | undefined,
        createdAt: data.createdAt as string | undefined,
      };
    }
    // User mới (signup/Google lần đầu): role mặc định student, admin đổi sau trong Console.
    const created: Record<string, unknown> = {
      email: fbUser.email,
      displayName: fbUser.displayName ?? fbUser.email?.split("@")[0] ?? "Học viên mới",
      role: "student",
      createdAt: new Date().toISOString(),
      serverCreatedAt: serverTimestamp(),
    };
    await setDoc(ref, created);
    return {
      uid: fbUser.uid,
      email: fbUser.email,
      displayName: created.displayName as string,
      role: "student",
      createdAt: created.createdAt as string,
    };
  }

  async createStudentProfile(uid: string, email: string | null, displayName: string): Promise<void> {
    const db = getFirebaseDb();
    if (!db) return;
    await setDoc(doc(db, "users", uid), {
      email,
      displayName,
      role: "student",
      createdAt: new Date().toISOString(),
      serverCreatedAt: serverTimestamp(),
    });
  }
}
