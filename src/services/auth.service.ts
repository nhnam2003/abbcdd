export type UserRole = "admin" | "teacher" | "student";

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: UserRole;
  phoneNumber?: string;
  createdAt?: string;
}

interface MockAccount extends UserProfile {
  password: string;
}

const SESSION_KEY = "may_guitar_session";
const AUTH_EVENT = "may-guitar-auth-change";

const mockAccounts: MockAccount[] = [
  {
    uid: "u-admin",
    email: "admin@mayguitar.com",
    password: "admin123",
    displayName: "Quản Trị Viên",
    role: "admin",
    createdAt: "2026-01-01",
  },
  {
    uid: "u-teacher-1",
    email: "teacher@mayguitar.com",
    password: "teacher123",
    displayName: "Thầy Tiến Guitar",
    role: "teacher",
    createdAt: "2026-01-05",
  },
  {
    uid: "u-teacher-2",
    email: "phuongcam@mayguitar.com",
    password: "teacher123",
    displayName: "Cô Phương Cầm",
    role: "teacher",
    createdAt: "2026-01-05",
  },
  {
    uid: "u-student-1",
    email: "student@mayguitar.com",
    password: "student123",
    displayName: "Nguyễn Minh Đức",
    role: "student",
    createdAt: "2026-01-10",
  },
  {
    uid: "u-student-2",
    email: "baonam@mayguitar.com",
    password: "student123",
    displayName: "Trần Bảo Nam",
    role: "student",
    createdAt: "2026-02-15",
  },
];

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

function toProfile(account: MockAccount): UserProfile {
  return {
    uid: account.uid,
    email: account.email,
    displayName: account.displayName,
    role: account.role,
    phoneNumber: account.phoneNumber,
    createdAt: account.createdAt,
  };
}

function readSession(): UserProfile | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserProfile;
  } catch {
    return null;
  }
}

function writeSession(profile: UserProfile | null): void {
  if (typeof window === "undefined") return;
  if (profile) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(profile));
  } else {
    localStorage.removeItem(SESSION_KEY);
  }
  window.dispatchEvent(new Event(AUTH_EVENT));
}

export const AuthService = {
  async signIn(email: string, password: string): Promise<UserProfile> {
    await delay(400);
    const normalized = email.trim().toLowerCase();
    const account = mockAccounts.find((a) => a.email === normalized && a.password === password);
    if (!account) {
      const error = new Error("Email hoặc mật khẩu không đúng.");
      (error as { code?: string }).code = "auth/invalid-credential";
      throw error;
    }
    const profile = toProfile(account);
    writeSession(profile);
    return profile;
  },

  async signOut(): Promise<void> {
    await delay(200);
    writeSession(null);
  },

  getCurrentUser(): UserProfile | null {
    return readSession();
  },

  subscribeAuth(callback: (profile: UserProfile | null) => void): () => void {
    const emit = () => callback(readSession());
    if (typeof window !== "undefined") {
      emit();
      window.addEventListener(AUTH_EVENT, emit);
      return () => window.removeEventListener(AUTH_EVENT, emit);
    }
    callback(null);
    return () => { };
  },
};