'use client';

import { useEffect, useRef, useState } from 'react';
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (hasCheckedAuth.current) return;
    
    // Don't check auth if we're already logged out (prevents API calls after logout)
    if (typeof window !== 'undefined') {
      const hasAuthStorage = localStorage.getItem('auth-storage');
      if (!hasAuthStorage) {
        // No auth storage means user is logged out - redirect to login
        window.location.href = '/login';
        return;
      }
    }
    
    hasCheckedAuth.current = true;
    checkAuth().catch(() => {
      // If checkAuth fails, redirect to login
      // This will happen automatically via the middleware, but we ensure it here too
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    });
  }, [checkAuth]);

  // Show loading only if we're actively checking auth and not authenticated yet
  // If checkAuth completed and user is not authenticated, middleware will redirect
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  // If not authenticated after loading completes, show loading (middleware will redirect)
  if (!isAuthenticated) {
    return (
      <div className="h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Redirecting..." />
      </div>
    );
  }

  return (
    // 🔒 Lock full viewport
    <div className="h-screen flex overflow-hidden">
      {/* Sidebar: fixed height, own scroll */}
      <aside className="h-full overflow-y-auto shrink-0">
      <Sidebar isOpen={sidebarOpen} onOpenChange={setSidebarOpen} />
      </aside>

      {/* Right side */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Header: fixed */}
        <header className="shrink-0">
          {isAuthenticated && <Header onMenuClick={() => setSidebarOpen(true)} />}
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
