"use client";

import Sidebar from "@/components/sidebar";
import Navbar from "@/components/navbar";
import ProtectedRoute from "@/components/protected-route";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!sidebarOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  return (
    <ProtectedRoute>
      <div className="flex h-dvh w-full overflow-hidden bg-neutral-50 dark:bg-neutral-950">
        <Sidebar className="hidden lg:flex" />

        {sidebarOpen && (
          <div
            className="fade-in-fast fixed inset-0 z-50 bg-neutral-900/50 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <div
              className="slide-in-left relative h-full w-72 max-w-[85vw] bg-white dark:bg-neutral-950"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                aria-label="Đóng menu"
                className="absolute -right-3 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-600 shadow-md transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-4 w-4" />
              </button>
              <Sidebar className="w-full" onNavigate={() => setSidebarOpen(false)} />
            </div>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <div className="flex items-center">
            <button
              type="button"
              aria-label="Mở menu"
              className="flex h-16 w-14 shrink-0 items-center justify-center border-b border-neutral-200 bg-white/70 text-neutral-500 backdrop-blur-md focus:outline-none lg:hidden dark:border-neutral-800 dark:bg-neutral-950/70 dark:text-neutral-400"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="min-w-0 flex-1">
              <Navbar />
            </div>
          </div>

          <main className="no-scrollbar flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="fade-in mx-auto max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
