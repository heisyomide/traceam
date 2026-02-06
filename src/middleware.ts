import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // --- LAYER 1: ADMIN SECURITY (Hidden Gateway) ---
  // Protect all /admin routes except the verification page itself
  if (pathname.startsWith('/admin') && pathname !== '/admin/verify') {
    const adminSession = request.cookies.get('admin-access');

    if (!adminSession || adminSession.value !== 'authorized') {
      // If unauthorized, we redirect to home (404-style deflection) 
      // so they don't even know the admin route exists.
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // --- LAYER 2: USER DASHBOARD SECURITY ---
  if (pathname.startsWith('/dashboard')) {
    const kycStatus = request.cookies.get('user-kyc-status')?.value;
    const session = request.cookies.get('auth-token'); // Your main auth token

    // If not logged in or KYC isn't approved, kick back to login/kyc
    if (!session) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
    
    if (kycStatus !== 'APPROVED') {
      return NextResponse.redirect(new URL('/kyc', request.url));
    }
  }

  return NextResponse.next();
}

// Ensure middleware monitors both admin and dashboard paths
export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
};