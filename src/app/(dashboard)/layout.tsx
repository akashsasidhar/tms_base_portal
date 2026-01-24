'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading, checkAuth } = useAuth();
  const hasCheckedAuth = useRef(false);

  useEffect(() => {
    if (hasCheckedAuth.current) return;
    hasCheckedAuth.current = true;
    checkAuth().catch(() => {});
  }, [checkAuth]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  return (
    // 🔒 Lock full viewport
    <div className="h-screen flex overflow-hidden">
      {/* Sidebar: fixed height, own scroll */}
      <aside className="h-full overflow-y-auto shrink-0">
        <Sidebar />
      </aside>

      {/* Right side */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Header: fixed */}
        <header className="shrink-0">
          {isAuthenticated && <Header />}
        </header>

        {/* MAIN: ONLY SCROLL AREA */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 min-h-0">
          {children}
        </main>

        {/* Footer: fixed */}
        <footer className="shrink-0">
          <Footer />
        </footer>
      </div>
    </div>
  );
}
