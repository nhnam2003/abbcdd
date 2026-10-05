// FACADE (strangler) — giữ chữ ký cũ cho UI/context, ruột delegate sang
// modules/identity (domain + ports + use-cases + infra + container).
// Không thêm logic mới ở đây. Không import firebase trực tiếp.

export type { UserRole, UserProfile } from "@/modules/identity/domain";
export { toVietnameseAuthError } from "@/modules/identity/domain";

import {
  identitySignIn,
  identitySignInWithGoogle,
  identitySignUp,
  identityResetPassword,
  identityChangePassword,
  identitySignOut,
  identityGetCurrentUser,
  identitySubscribeAuth,
} from "@/modules/identity/container";
import type { UserProfile } from "@/modules/identity/domain";

export const AuthService = {
  signIn(email: string, password: string): Promise<UserProfile> {
    return identitySignIn(email, password);
  },

  signInWithGoogle(): Promise<UserProfile> {
    return identitySignInWithGoogle();
  },

  signUp(email: string, password: string, displayName: string): Promise<UserProfile> {
    return identitySignUp(email, password, displayName);
  },

  resetPassword(email: string): Promise<void> {
    return identityResetPassword(email);
  },

  changePassword(newPassword: string): Promise<void> {
    return identityChangePassword(newPassword);
  },

  signOut(): Promise<void> {
    return identitySignOut();
  },

  getCurrentUser(): UserProfile | null {
    return identityGetCurrentUser();
  },

  subscribeAuth(callback: (profile: UserProfile | null) => void): () => void {
    return identitySubscribeAuth(callback);
  },
};
