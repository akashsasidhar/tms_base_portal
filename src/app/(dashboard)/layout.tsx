'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { hasRefreshToken } from '@/utils/cookie.util';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading, checkAuth } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const hasCheckedAuth = useRef(false);
  const redirectingRef = useRef(false);

  // Immediate check for refresh token on mount - redirect before any API calls
  useEffect(() => {
    if (typeof window !== 'undefined' && !hasRefreshToken() && !redirectingRef.current) {
      redirectingRef.current = true;
      // Use router for virtual DOM navigation
      router.replace('/login');
      // Fallback: if router doesn't redirect quickly, use window.location
      const fallbackTimeout = setTimeout(() => {
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }, 100);
      return () => clearTimeout(fallbackTimeout);
    }
  }, [router]);

  // Check authentication on mount - only once
  useEffect(() => {
    // Skip if already checked
    if (hasCheckedAuth.current) {
      return;
    }

    // Skip checkAuth if refresh token is missing (already handled above)
    if (typeof window !== 'undefined' && !hasRefreshToken()) {
      hasCheckedAuth.current = true;
      return;
    }

    // Mark as checked immediately to prevent re-runs
    hasCheckedAuth.current = true;

    // Verify authentication once on mount to ensure session is valid
    // This ensures cookies are properly set and session is maintained after login
    checkAuth().catch(() => {
      // If checkAuth fails (e.g., no refresh token), redirect to login immediately
      if (!redirectingRef.current) {
        redirectingRef.current = true;
        router.replace('/login');
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Handle logout - redirect when authentication state changes to false
  // This handles cases where refresh token is missing or session is invalid
  useEffect(() => {
    // Only redirect if we've checked auth and user is not authenticated
    // Skip if we're still checking or already redirecting
    if (!hasCheckedAuth.current || redirectingRef.current || isLoading) {
      return;
    }

    // Redirect if not authenticated (after initial check or when state changes)
    // But only if there's no refresh token (let middleware handle it if token exists)
    if (!isAuthenticated && !hasRefreshToken()) {
      redirectingRef.current = true;
      // Use replace to avoid adding to history (virtual DOM navigation)
      router.replace('/login');
      // Fallback: if router doesn't redirect quickly, use window.location
      const fallbackTimeout = setTimeout(() => {
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }, 150);
      return () => clearTimeout(fallbackTimeout);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isLoading]); // Only depend on auth state, not router

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Show loading while redirecting (virtual DOM handles the transition)
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner size="lg" text="Redirecting..." />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-auto p-4 sm:p-6">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}
