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

  // Check authentication on mount - only once
  useEffect(() => {
    // Skip if already checked
    if (hasCheckedAuth.current) {
      return;
    }

    // Mark as checked immediately to prevent re-runs
    hasCheckedAuth.current = true;

    // Verify authentication - this makes an API call which will automatically
    // send HTTP-only cookies via withCredentials: true
    // If cookies are invalid/missing, API will return 401 and checkAuth will fail
    checkAuth().catch(() => {
      // If checkAuth fails, state will be cleared by checkAuth
      // Middleware will handle redirect on next navigation if needed
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  // If not authenticated after check, show loading (middleware will redirect if needed)
  // Trust middleware - if it allowed this page, cookies exist
  if (!isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner size="lg" text="Redirecting..." />
      </div>
    );
  }

  // Show content - middleware has already verified cookies exist
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-4 sm:p-6">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}
