// Module identity — Firebase Auth adapter (infrastructure).
// Nơi duy nhất được import "firebase/auth". Map user Firebase → FirebaseUserLike.

import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updatePassword,
  signOut as fbSignOut,
  onAuthStateChanged,
} from "firebase/auth";
import { getFirebaseAuth, isFirebaseConfigured } from "@/lib/firebase-client";
import type { IAuthProvider, FirebaseUserLike } from "./ports";

function ensureConfigured(): void {
  if (!isFirebaseConfigured()) {
    const error = new Error(
      "Chưa cấu hình Firebase. Copy .env.example thành .env.local và điền key thật (task P3-01)."
    );
    (error as { code?: string }).code = "app/firebase-not-configured";
    throw error;
  }
}

function toLike(u: { uid: string; email: string | null; displayName: string | null }): FirebaseUserLike {
  return { uid: u.uid, email: u.email, displayName: u.displayName };
}

export class FirebaseAuthProvider implements IAuthProvider {
  async signInWithEmail(email: string, password: string): Promise<FirebaseUserLike> {
    ensureConfigured();
    const auth = getFirebaseAuth();
    if (!auth) {
      const e = new Error("Chưa cấu hình Firebase.");
      (e as { code?: string }).code = "app/firebase-not-configured";
      throw e;
    }
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return toLike(cred.user);
  }

  async signInWithGooglePopup(): Promise<FirebaseUserLike> {
    ensureConfigured();
    const auth = getFirebaseAuth();
    if (!auth) {
      const e = new Error("Chưa cấu hình Firebase.");
      (e as { code?: string }).code = "app/firebase-not-configured";
      throw e;
    }
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    const cred = await signInWithPopup(auth, provider);
    return toLike(cred.user);
  }

  async signUpWithEmail(email: string, password: string): Promise<FirebaseUserLike> {
    ensureConfigured();
    const auth = getFirebaseAuth();
    if (!auth) {
      const e = new Error("Chưa cấu hình Firebase.");
      (e as { code?: string }).code = "app/firebase-not-configured";
      throw e;
    }
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    return toLike(cred.user);
  }

  async sendPasswordReset(email: string): Promise<void> {
    ensureConfigured();
    const auth = getFirebaseAuth();
    if (!auth) {
      const e = new Error("Chưa cấu hình Firebase.");
      (e as { code?: string }).code = "app/firebase-not-configured";
      throw e;
    }
    await sendPasswordResetEmail(auth, email);
  }

  async updatePasswordForCurrentUser(newPassword: string): Promise<void> {
    ensureConfigured();
    const auth = getFirebaseAuth();
    if (!auth?.currentUser) {
      const e = new Error("Chưa đăng nhập.");
      (e as { code?: string }).code = "auth/user-not-found";
      throw e;
    }
    await updatePassword(auth.currentUser, newPassword);
  }

  hasCurrentUser(): boolean {
    return getFirebaseAuth()?.currentUser != null;
  }

  async signOut(): Promise<void> {
    const auth = getFirebaseAuth();
    if (auth) await fbSignOut(auth);
  }

  subscribeFirebaseUser(cb: (u: FirebaseUserLike | null) => void): () => void {
    const auth = getFirebaseAuth();
    if (!auth) return () => {};
    return onAuthStateChanged(auth, (u) => cb(u ? toLike(u) : null));
  }
}
