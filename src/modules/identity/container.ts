// Module identity — CONTAINER (DI thủ công).
// Singletons wire provider + repo + cache. Facade services/auth.service.ts gọi vào đây.

import { FirebaseAuthProvider } from "./infra-auth-provider";
import { FirestoreUserProfileRepository } from "./infra-profile-repo";
import { LocalProfileCache } from "./infra-profile-cache";
import * as UC from "./use-cases";
import type { UserProfile } from "./domain";

let provider: FirebaseAuthProvider | null = null;
let repo: FirestoreUserProfileRepository | null = null;
let cache: LocalProfileCache | null = null;

function getProvider(): FirebaseAuthProvider {
  if (!provider) provider = new FirebaseAuthProvider();
  return provider;
}

function getRepo(): FirestoreUserProfileRepository {
  if (!repo) repo = new FirestoreUserProfileRepository();
  return repo;
}

function getCache(): LocalProfileCache {
  if (!cache) cache = new LocalProfileCache();
  return cache;
}

export function identitySignIn(email: string, password: string): Promise<UserProfile> {
  return UC.signIn(getProvider(), getRepo(), getCache(), email, password);
}

export function identitySignInWithGoogle(): Promise<UserProfile> {
  return UC.signInWithGoogle(getProvider(), getRepo(), getCache());
}

export function identitySignUp(email: string, password: string, displayName: string): Promise<UserProfile> {
  return UC.signUp(getProvider(), getRepo(), getCache(), email, password, displayName);
}

export function identityResetPassword(email: string): Promise<void> {
  return UC.resetPassword(getProvider(), email);
}

export function identityChangePassword(newPassword: string): Promise<void> {
  return UC.changePassword(getProvider(), newPassword);
}

export function identitySignOut(): Promise<void> {
  return UC.signOut(getProvider(), getCache());
}

export function identityGetCurrentUser(): UserProfile | null {
  return UC.getCurrentUser(getCache());
}

export function identitySubscribeAuth(callback: (profile: UserProfile | null) => void): () => void {
  return UC.subscribeAuth(getProvider(), getRepo(), getCache(), callback);
}
