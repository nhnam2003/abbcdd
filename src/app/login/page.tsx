"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { AuthService } from "@/services/auth.service";
import { AlertCircle, Loader2, KeyRound } from "lucide-react";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import OfflineBanner from "@/components/pwa/offline-banner";

const demoAccounts = [
  { role: "Quản trị viên", email: "admin@mayguitar.com", password: "admin123" },
  { role: "Giáo viên", email: "teacher@mayguitar.com", password: "teacher123" },
  { role: "Học viên", email: "student@mayguitar.com", password: "student123" },
];

export default function LoginPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/dashboard");
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Vui lòng nhập email và mật khẩu.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await AuthService.signIn(email, password);
      router.push("/dashboard");
    } catch (err: unknown) {
      const errorCode = (err as { code?: string }).code;
      switch (errorCode) {
        case "auth/invalid-email":
          setError("Định dạng email không hợp lệ.");
          break;
        case "auth/user-not-found":
        case "auth/wrong-password":
        case "auth/invalid-credential":
          setError("Email hoặc mật khẩu không đúng.");
          break;
        case "auth/too-many-requests":
          setError("Tài khoản tạm khóa do đăng nhập sai nhiều lần. Vui lòng thử lại sau.");
          break;
        default:
          setError("Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-800 dark:text-neutral-200" />
      </div>
    );
  }

  if (user) return null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 py-12 dark:bg-neutral-950 sm:px-6 lg:px-8">
      <OfflineBanner />
      <div className="fade-in w-full max-w-md space-y-8">
        <div className="flex flex-col items-center">
          <Link href="/" className="mb-2 flex items-center gap-2 text-xl font-semibold tracking-tight">
            <div className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-brand-subtle/60 shadow-md">
              <Image
                src="/logo/logo.jpg"
                alt="May Center"
                width={56}
                height={56}
                className="h-full w-full object-cover"
              />
            </div>
          </Link>
          <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Đăng nhập hệ thống
          </h2>
          <p className="mt-1.5 text-center text-xs text-neutral-400">
            Dành cho Quản trị viên, Giáo viên và Học viên
          </p>
        </div>

        <div className="apple-glass rounded-2xl border border-neutral-200 bg-white p-8 shadow-lg dark:border-neutral-800 dark:bg-neutral-900/60">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 p-3.5 text-xs text-red-600 dark:border-red-950 dark:bg-red-950/30 dark:text-red-400">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Input
              label="Địa chỉ Email"
              size="md"
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@mayguitar.com"
            />

            <Input
              label="Mật khẩu"
              size="md"
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />

            <Button type="submit" size="xl" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang đăng nhập...
                </>
              ) : (
                "Đăng nhập"
              )}
            </Button>
          </form>

          <div className="mt-8 border-t border-neutral-200 pt-6 text-center dark:border-neutral-800">
            <div className="inline-flex items-center gap-1.5 text-xs text-neutral-400 dark:text-neutral-500">
              <KeyRound className="h-3.5 w-3.5" />
              <span>Tài khoản demo (dữ liệu giả lập)</span>
            </div>
            <div className="mt-3 space-y-2 text-left">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => {
                    setEmail(acc.email);
                    setPassword(acc.password);
                    setError(null);
                  }}
                  className="flex w-full flex-col items-start gap-1 rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-2.5 text-[11px] transition-all hover:border-brand hover:bg-white dark:border-neutral-800 dark:bg-neutral-950 dark:hover:border-brand-light dark:hover:bg-neutral-900 sm:flex-row sm:items-center sm:justify-between"
                >
                  <span className="font-semibold text-neutral-700 dark:text-neutral-300">{acc.role}</span>
                  <span className="break-all font-mono text-neutral-500 dark:text-neutral-500 sm:break-normal">
                    {acc.email} / {acc.password}
                  </span>
                </button>
              ))}
            </div>
            <p className="mx-auto mt-3 max-w-xs text-[11px] leading-relaxed text-neutral-400/90">
              Bấm vào tài khoản để tự động điền thông tin, sau đó nhấn nút Đăng nhập.
            </p>
          </div>
        </div>

        <p className="text-center text-xs">
          <Link href="/" className="font-medium text-neutral-500 transition-colors hover:text-neutral-950 dark:hover:text-white">
            ← Về trang chủ
          </Link>
        </p>
      </div>
    </div>
  );
}
