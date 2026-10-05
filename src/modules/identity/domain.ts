// Module identity — DOMAIN (thuần, không firebase/next/react).
// Auth thật do Firebase Auth quản; role đọc từ users/{uid}. Policy role +
// map lỗi sang tiếng Việt nằm ở đây để presentation dùng chung.

export type UserRole = "admin" | "teacher" | "student";
export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: UserRole;
  phoneNumber?: string;
  createdAt?: string;
}

const ROLE_RANK: Record<UserRole, number> = { student: 1, teacher: 2, admin: 3 };

export function hasRole(user: UserProfile | null, allowed: UserRole[]): boolean {
  if (!user) return false;
  return allowed.includes(user.role);
}

export function requireRole(user: UserProfile | null, allowed: UserRole[]): void {
  if (!user) throw new Error("Chưa đăng nhập.");
  if (!allowed.includes(user.role)) throw new Error("Bạn không có quyền truy cập trang này.");
}

export function canManageStudents(role: UserRole): boolean {
  return ROLE_RANK[role] >= ROLE_RANK.admin;
}

export function canTakeAttendance(role: UserRole): boolean {
  return role === "admin" || role === "teacher";
}

export function normalizeRole(v: unknown): UserRole {
  return v === "admin" || v === "teacher" || v === "student" ? v : "student";
}

export function toVietnameseAuthError(code?: string): string {
  switch (code) {
    case "auth/invalid-email":
      return "Định dạng email không hợp lệ.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Email hoặc mật khẩu không đúng.";
    case "auth/email-already-in-use":
      return "Email này đã được đăng ký. Hãy đăng nhập hoặc dùng email khác.";
    case "auth/weak-password":
      return "Mật khẩu quá yếu (tối thiểu 6 ký tự).";
    case "auth/too-many-requests":
      return "Tài khoản tạm khóa do đăng nhập sai nhiều lần. Vui lòng thử lại sau.";
    case "auth/popup-closed-by-user":
      return "Bạn đã đóng cửa sổ Google. Hãy thử lại.";
    case "auth/unauthorized-domain":
      return "Domain chưa được cho phép trong Firebase Auth (Authorized domains). Thêm localhost/domain này trong Console.";
    case "auth/network-request-failed":
      return "Mất mạng. Kiểm tra kết nối rồi thử lại.";
    case "auth/requires-recent-login":
      return "Phiên đăng nhập đã cũ. Hãy đăng xuất rồi đăng nhập lại trước khi đổi mật khẩu.";
    case "app/firebase-not-configured":
      return "Chưa cấu hình Firebase (.env.local). Liên hệ quản trị viên.";
    case "app/profile-missing":
      return "Tài khoản chưa có hồ sơ trong Firestore. Liên hệ admin để gán quyền.";
    case "permission-denied":
    case "firestore/permission-denied":
      return "Bạn không có quyền đọc hồ sơ (Rules chặn). Liên hệ admin kiểm tra role trong users/{uid}.";
    case "unavailable":
    case "firestore/unavailable":
      return "Mất kết nối Firestore. Kiểm tra mạng rồi thử lại.";
    default:
      return "Đã xảy ra lỗi khi xác thực. Vui lòng thử lại.";
  }
}
