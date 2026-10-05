// Module identity — USE-CASES (nghiệp vụ, nhận ports qua tham số = DI thủ công).
// Không import firebase ở đây. Lỗi giữ nguyên .code để presentation map tiếng Việt.

import type {
  IAuthProvider,
  IUserProfileRepository,
  IProfileCache,
  FirebaseUserLike,
} from "./ports";
import type { UserProfile } from "./domain";

export async function signIn(
  provider: IAuthProvider,
  repo: IUserProfileRepository,
  cache: IProfileCache,
  email: string,
  password: string
): Promise<UserProfile> {
  const fbUser = await provider.signInWithEmail(email.trim(), password);
  const profile = await repo.fetchOrCreate(fbUser);
  cache.write(profile);
  return profile;
}

export async function signInWithGoogle(
  provider: IAuthProvider,
  repo: IUserProfileRepository,
  cache: IProfileCache
): Promise<UserProfile> {
  const fbUser = await provider.signInWithGooglePopup();
  const profile = await repo.fetchOrCreate(fbUser);
  cache.write(profile);
  return profile;
}

export async function signUp(
  provider: IAuthProvider,
  repo: IUserProfileRepository,
  cache: IProfileCache,
  email: string,
  password: string,
  displayName: string
): Promise<UserProfile> {
  const fbUser = await provider.signUpWithEmail(email.trim(), password);
  await repo.createStudentProfile(
    fbUser.uid,
    fbUser.email,
    displayName.trim() || fbUser.email?.split("@")[0] || "Học viên mới"
  );
  // Đọc lại để chắc chắn role/createdAt đúng doc vừa tạo.
  const profile = await repo.fetchOrCreate(fbUser);
  cache.write(profile);
  return profile;
}

export async function resetPassword(
  provider: IAuthProvider,
  email: string
): Promise<void> {
  await provider.sendPasswordReset(email.trim());
}

export async function changePassword(
  provider: IAuthProvider,
  newPassword: string
): Promise<void> {
  if (!provider.hasCurrentUser()) {
    const e = new Error("Chưa đăng nhập.");
    (e as { code?: string }).code = "auth/user-not-found";
    throw e;
  }
  await provider.updatePasswordForCurrentUser(newPassword);
}

export async function signOut(
  provider: IAuthProvider,
  cache: IProfileCache
): Promise<void> {
  await provider.signOut();
  cache.write(null);
  // Xóa session mock cũ nếu còn sót (migration P3-02).
  if (typeof window !== "undefined") localStorage.removeItem("may_guitar_session");
}

export function getCurrentUser(cache: IProfileCache): UserProfile | null {
  return cache.read();
}

export function subscribeAuth(
  provider: IAuthProvider,
  repo: IUserProfileRepository,
  cache: IProfileCache,
  callback: (profile: UserProfile | null) => void
): () => void {
  // Phát cache ngay để UI không trắng, sau đó sync với Firebase.
  callback(cache.read());
  const unsubFb = provider.subscribeFirebaseUser(async (fbUser: FirebaseUserLike | null) => {
    if (!fbUser) {
      cache.write(null);
      callback(null);
      return;
    }
    try {
      const profile = await repo.fetchOrCreate(fbUser);
      cache.write(profile);
      callback(profile);
    } catch {
      // Offline: giữ cache cũ để vẫn xem được (P3-05).
      callback(cache.read());
    }
  });
  const unsubCache = cache.subscribe(() => callback(cache.read()));
  return () => {
    unsubFb();
    unsubCache();
  };
}
