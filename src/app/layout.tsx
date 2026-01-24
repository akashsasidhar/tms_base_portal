import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/providers/QueryProvider";
import { ToastProvider } from "@/providers/ToastProvider";
import appConfig from "@/config/app.config";
import { validateServerEnv } from "@/config/env.config";
// app/layout.tsx

validateServerEnv();

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: appConfig.APP_NAME,
  description: "RBAC-based admin platform for task management",
  keywords: ["admin", "dashboard", "RBAC", "task management"],
  authors: [{ name: "Admin Dashboard" }],
  creator: "Admin Dashboard",
  publisher: "Admin Dashboard",
  robots: {
    index: false, // Don't index admin dashboard
    follow: false,
  },
  // Security headers
  other: {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "SAMEORIGIN",
    "X-XSS-Protection": "1; mode=block",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full overflow-hidden">
      <body className={`${inter.className} h-full overflow-hidden`}>
        <QueryProvider>
          {children}
          <ToastProvider />
        </QueryProvider>
      </body>
    </html>
  );
}
