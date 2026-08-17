import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/auth-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "May Center - Dạy đàn Guitar tại Đà Nẵng",
  description: "Trung tâm dạy đàn guitar tại Đà Nẵng — khóa học từ cơ bản đến nâng cao, giảng viên tận tâm, lộ trình bài bản.",
  icons: {
    icon: "/logo/logo.jpg",
    apple: "/logo/logo.jpg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const brandStyle = {
    "--brand-primary": process.env.NEXT_PUBLIC_COLOR_PRIMARY ?? "#A07828",
    "--brand-primary-dark": process.env.NEXT_PUBLIC_COLOR_PRIMARY_DARK ?? "#5A3C0E",
    "--brand-primary-light": process.env.NEXT_PUBLIC_COLOR_PRIMARY_LIGHT ?? "#D4B896",
    "--brand-primary-subtle": process.env.NEXT_PUBLIC_COLOR_PRIMARY_SUBTLE ?? "#EAD8BE",
    "--brand-charcoal": process.env.NEXT_PUBLIC_COLOR_CHARCOAL ?? "#383838",
  } as React.CSSProperties;

  return (
    <html
      lang="vi"
      style={brandStyle}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
