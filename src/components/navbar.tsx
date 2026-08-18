"use client";

import { useAuth } from "@/context/auth-context";
import ThemeToggle from "@/components/theme-toggle";
import { LogOut, Sparkles } from "lucide-react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const getPageTitle = (path: string) => {
    if (path.startsWith("/dashboard/schedule")) return "Lịch học Guitar";
    if (path.startsWith("/dashboard/classes")) return "Quản lý Lớp học";
    if (path.startsWith("/dashboard/students")) return "Danh sách Học viên";
    if (path.startsWith("/dashboard/attendance")) return "Điểm danh học tập";
    if (path.startsWith("/dashboard/billing")) return "Học phí & Hóa đơn";
    return "Tổng quan hệ thống";
  };

  const translateRole = (role?: string) => {
    if (role === "admin") return "Quản trị viên";
    if (role === "teacher") return "Giảng viên";
    return "Học viên";
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between gap-3 border-b border-neutral-200/50 bg-white/70 px-4 backdrop-blur-md dark:border-neutral-800/50 dark:bg-neutral-950/70 sm:px-6">
      <div className="min-w-0">
        <h1 className="truncate text-sm font-semibold tracking-tight text-neutral-900 dark:text-white">
          {getPageTitle(pathname)}
        </h1>
      </div>

      <div className="flex shrink-0 items-center gap-3 sm:gap-4">
        <div className="hidden items-center gap-1 rounded-full border border-neutral-200/60 bg-neutral-50 px-3 py-1 text-[10px] font-semibold text-neutral-500 sm:flex dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
          <Sparkles className="h-3 w-3 text-yellow-500" />
          <span>Trung tâm May Center</span>
        </div>

<div className="flex items-center gap-2 border-l border-neutral-200 pl-3 dark:border-neutral-800 sm:pl-4">
            <div className="hidden text-right md:block">
              <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                {user?.displayName || "Người dùng"}
              </p>
              <p className="mt-0.5 text-[10px] text-neutral-500 dark:text-neutral-500">
                {translateRole(user?.role)}
              </p>
            </div>
            <ThemeToggle />
            <button
            onClick={logout}
            title="Đăng xuất"
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-neutral-100 text-neutral-600 transition-all hover:bg-red-50 hover:text-red-500 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:bg-red-950/30 dark:hover:text-red-300"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
