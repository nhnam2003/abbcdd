"use client";

import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ("admin" | "teacher" | "student")[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-200 border-t-neutral-800 dark:border-neutral-800 dark:border-t-neutral-200" />
          <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Đang tải cấu hình...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-neutral-50 p-6 text-center dark:bg-neutral-950">
        <div className="max-w-md rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Truy cập bị từ chối</h2>
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            Tài khoản của bạn với vai trò <span className="font-semibold text-orange-500">{user.role}</span> không được
            phép truy cập trang này.
          </p>
          <button
            onClick={() => router.replace("/")}
            className="mt-6 rounded-xl bg-brand px-4 py-2 text-sm font-medium text-white transition-all hover:bg-brand-dark"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}