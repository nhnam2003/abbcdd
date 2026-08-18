import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/auth-context";
import { ThemeProvider } from "@/components/theme-context";
import ServiceWorkerRegister from "@/components/pwa/service-worker-register";

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
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "May Center",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: process.env.NEXT_PUBLIC_COLOR_PRIMARY ?? "#A07828",
  colorScheme: "light dark",
};

const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem("may_guitar_theme");if(t==="dark"){document.documentElement.classList.add("dark");document.documentElement.style.colorScheme="dark";}else{document.documentElement.style.colorScheme="light";}}catch(e){}})();`;

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
      suppressHydrationWarning
      style={brandStyle}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50">
        <ThemeProvider>
          <AuthProvider>
            {children}
            <ServiceWorkerRegister />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
