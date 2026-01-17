import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public routes that don't require authentication
const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password', '/setup-password'];

// Auth routes (redirect to dashboard if already authenticated)
const authRoutes = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for auth cookies (backend uses camelCase: accessToken, refreshToken)
  const accessToken = request.cookies.get('accessToken');
  const refreshToken = request.cookies.get('refreshToken');
  
  // Require refresh token for authentication (access token can be refreshed)
  // If refresh token is not available, user must be logged out
  const isAuthenticated = !!refreshToken;

  // Handle public routes
  if (publicRoutes.includes(pathname)) {
    // If user is authenticated and tries to access auth pages, redirect to dashboard
    if (isAuthenticated && authRoutes.includes(pathname)) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    // Allow access to public routes
    return NextResponse.next();
  }

  // Handle protected routes
  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    const loginUrl = new URL('/login', request.url);
    // Add redirect parameter to return to original page after login
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Allow access to protected routes
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
