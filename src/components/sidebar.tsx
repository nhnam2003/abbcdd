"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import {
  LayoutDashboard,
  Calendar,
  BookOpen,
  Users,
  CheckSquare,
  CreditCard,
  LogOut,
  User,
} from "lucide-react";

interface SidebarProps {
  className?: string;
  onNavigate?: () => void;
}

const roleLabels: Record<string, string> = {
  admin: "Quản trị",
  teacher: "Giáo viên",
  student: "Học viên",
};

const menuItems = [
  {
    name: "Tổng quan",
    path: "/dashboard",
    icon: LayoutDashboard,
    roles: ["admin", "teacher", "student"],
  },
  {
    name: "Lịch học",
    path: "/dashboard/schedule",
    icon: Calendar,
    roles: ["admin", "teacher", "student"],
  },
  {
    name: "Quản lý Lớp học",
    path: "/dashboard/classes",
    icon: BookOpen,
    roles: ["admin"],
  },
  {
    name: "Quản lý Học viên",
    path: "/dashboard/students",
    icon: Users,
    roles: ["admin"],
  },
  {
    name: "Điểm danh",
    path: "/dashboard/attendance",
    icon: CheckSquare,
    roles: ["admin", "teacher"],
  },
  {
    name: "Học phí & Hóa đơn",
    path: "/dashboard/billing",
    icon: CreditCard,
    roles: ["admin", "student"],
  },
];

export default function Sidebar({ className = "", onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const role = user?.role ?? "student";
  const allowedItems = menuItems.filter((item) => item.roles.includes(role));

  return (
    <aside className={`flex h-screen w-64 flex-col border-r border-neutral-200/50 bg-white/70 backdrop-blur-md dark:border-neutral-800/50 dark:bg-neutral-950/70 ${className}`}>
      <div className="flex h-16 items-center gap-2.5 border-b border-neutral-200/50 px-6 dark:border-neutral-800/50">
        <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-brand-subtle/60 shadow-sm">
          <Image
            src="/logo/logo.jpg"
            alt="May Center"
            width={36}
            height={36}
            className="h-full w-full object-cover"
          />
        </div>
        <span className="text-sm font-semibold tracking-tight text-neutral-900 dark:text-white">
          May Center
        </span>
      </div>

      <div className="border-b border-neutral-200/50 bg-neutral-50/50 p-4 dark:border-neutral-800/50 dark:bg-neutral-900/30">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
            <User className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-neutral-800 dark:text-neutral-200">
              {user?.displayName || "Guitarist"}
            </p>
            <p className="mt-0.5 flex items-center gap-1 truncate text-[10px] font-medium text-neutral-500 dark:text-neutral-500">
              <span
                className={`inline-block h-1.5 w-1.5 rounded-full ${
                  role === "admin" ? "bg-red-500" : role === "teacher" ? "bg-indigo-500" : "bg-emerald-500"
                }`}
              />
              {roleLabels[role] || "Khách"}
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1.5 overflow-y-auto p-4">
        {allowedItems.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              href={item.path}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-xs font-semibold tracking-wide transition-all ${
                isActive
                  ? "bg-brand text-white shadow-sm dark:bg-brand dark:text-white"
                  : "text-neutral-500 hover:bg-brand-subtle/40 hover:text-brand-dark dark:hover:bg-brand/10 dark:hover:text-brand-light"
              }`}
            >
              <Icon className="h-4.5 w-4.5 shrink-0" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-neutral-200/50 bg-neutral-50/20 p-4 dark:border-neutral-800/50 dark:bg-neutral-900/10">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-xs font-semibold text-red-500 transition-all hover:bg-red-50 hover:text-red-600 dark:text-red-400 dark:hover:bg-red-950/20 dark:hover:text-red-300"
        >
          <LogOut className="h-4.5 w-4.5 shrink-0" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}
