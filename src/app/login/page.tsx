"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { AuthService, toVietnameseAuthError } from "@/services/auth.service";
import { AlertCircle, Loader2, CheckCircle2 } from "lucide-react";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import OfflineBanner from "@/components/pwa/offline-banner";

type Mode = "login" | "signup" | "forgot";

export default function LoginPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/dashboard");
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (!email) {
      setError("Vui lòng nhập email.");
      return;
    }
    if (mode !== "forgot" && !password) {
      setError("Vui lòng nhập mật khẩu.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "login") {
        await AuthService.signIn(email, password);
        router.push("/dashboard");
      } else if (mode === "signup") {
        if (!displayName.trim()) {
          setError("Vui lòng nhập họ tên.");
          return;
        }
        await AuthService.signUp(email, password, displayName);
        router.push("/dashboard");
      } else {
        await AuthService.resetPassword(email);
        setInfo("Đã gửi email đặt lại mật khẩu. Kiểm tra hộp thư (kể cả Spam).");
      }
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      setError(toVietnameseAuthError(code));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    setInfo(null);
    setGoogleLoading(true);
    try {
      await AuthService.signInWithGoogle();
      router.push("/dashboard");
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      setError(toVietnameseAuthError(code));
    } finally {
      setGoogleLoading(false);
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
            {mode === "login" ? "Đăng nhập hệ thống" : mode === "signup" ? "Tạo tài khoản học viên" : "Quên mật khẩu"}
          </h2>
          <p className="mt-1.5 text-center text-xs text-neutral-400">
            Dành cho Quản trị viên, Giáo viên và Học viên
          </p>
        </div>

        <div className="apple-glass rounded-2xl border border-neutral-200 bg-white p-8 shadow-lg dark:border-neutral-800 dark:bg-neutral-900/60">
          <Button
            type="button"
            size="xl"
            className="w-full"
            onClick={handleGoogle}
            disabled={googleLoading || loading}
          >
            {googleLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang mở Google...
              </>
            ) : (
              "Đăng nhập bằng Google"
            )}
          </Button>

          <div className="my-5 flex items-center gap-3 text-[11px] text-neutral-400">
            <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
            <span>hoặc bằng email</span>
            <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 p-3.5 text-xs text-red-600 dark:border-red-950 dark:bg-red-950/30 dark:text-red-400">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {info && (
              <div className="flex items-start gap-2.5 rounded-xl border border-green-100 bg-green-50 p-3.5 text-xs text-green-700 dark:border-green-950 dark:bg-green-950/30 dark:text-green-400">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{info}</span>
              </div>
            )}

            {mode === "signup" && (
              <Input
                label="Họ tên"
                size="md"
                id="displayName"
                name="displayName"
                autoComplete="name"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Nguyễn Văn A"
              />
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
              placeholder="ban@example.com"
            />

            {mode !== "forgot" && (
              <Input
                label="Mật khẩu"
                size="md"
                id="password"
                name="password"
                type="password"
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            )}

            <Button type="submit" size="xl" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : mode === "login" ? (
                "Đăng nhập"
              ) : mode === "signup" ? (
                "Tạo tài khoản"
              ) : (
                "Gửi email đặt lại"
              )}
            </Button>
          </form>

          <div className="mt-6 flex flex-col items-center gap-2 text-xs">
            {mode === "login" && (
              <>
                <button
                  type="button"
                  className="font-medium text-neutral-500 transition-colors hover:text-neutral-950 dark:hover:text-white"
                  onClick={() => {
                    setMode("forgot");
                    setError(null);
                    setInfo(null);
                  }}
                >
                  Quên mật khẩu?
                </button>
                <button
                  type="button"
                  className="font-medium text-neutral-500 transition-colors hover:text-neutral-950 dark:hover:text-white"
                  onClick={() => {
                    setMode("signup");
                    setError(null);
                    setInfo(null);
                  }}
                >
                  Chưa có tài khoản? Đăng ký học viên mới
                </button>
              </>
            )}
            {mode !== "login" && (
              <button
                type="button"
                className="font-medium text-neutral-500 transition-colors hover:text-neutral-950 dark:hover:text-white"
                onClick={() => {
                  setMode("login");
                  setError(null);
                  setInfo(null);
                }}
              >
                ← Về đăng nhập
              </button>
            )}
          </div>

          <p className="mx-auto mt-4 max-w-xs text-center text-[11px] leading-relaxed text-neutral-400/90">
            Tài khoản do Firebase Auth quản lý. Phân quyền (admin/teacher/student) do admin gán trong
            Firestore collection <span className="font-mono">users</span>.
          </p>
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
