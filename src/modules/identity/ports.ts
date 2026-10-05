// Module identity — PORTS (interfaces, application phụ thuộc vào đây).
// FirebaseUserLike tách riêng để domain/use-case không import "firebase/auth".

import type { UserProfile } from "./domain";

export interface FirebaseUserLike {
  uid: string;
  email: string | null;
  displayName: string | null;
}

export interface IAuthProvider {
  signInWithEmail(email: string, password: string): Promise<FirebaseUserLike>;
  signInWithGooglePopup(): Promise<FirebaseUserLike>;
  signUpWithEmail(email: string, password: string): Promise<FirebaseUserLike>;
  sendPasswordReset(email: string): Promise<void>;
  updatePasswordForCurrentUser(newPassword: string): Promise<void>;
  hasCurrentUser(): boolean;
  signOut(): Promise<void>;
  subscribeFirebaseUser(cb: (u: FirebaseUserLike | null) => void): () => void;
}

export interface IUserProfileRepository {
  fetchOrCreate(fbUser: FirebaseUserLike): Promise<UserProfile>;
  createStudentProfile(uid: string, email: string | null, displayName: string): Promise<void>;
}

export interface IProfileCache {
  read(): UserProfile | null;
  write(profile: UserProfile | null): void;
  subscribe(cb: () => void): () => void;
}
