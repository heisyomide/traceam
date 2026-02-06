import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
// Note: If you're using NextAuth, you'd import 'getToken' here.
// For this example, we'll assume you're using a standard JWT or session cookie.

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Get the session/token from cookies
  const session = request.cookies.get('auth-token')?.value; 
  // Get KYC status (In a real app, you might decode a JWT or hit a small verify endpoint)
  const kycStatus = request.cookies.get('user-kyc-status')?.value; 

  // 2. Define Public Routes (accessible by anyone)
  const isPublicRoute = pathname === '/login' || pathname === '/register' || pathname === '/';

  // 3. Logic: No Session?
  if (!session && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 4. Logic: Logged in but PENDING?
  if (session && kycStatus === 'PENDING') {
    // If they try to go anywhere except the /review page, kick them back
    if (pathname !== '/review') {
      return NextResponse.redirect(new URL('/review', request.url));
    }
  }

  // 5. Logic: Logged in and APPROVED?
  if (session && kycStatus === 'APPROVED') {
    // If they try to go to /review or /kyc, send them to dashboard
    if (pathname === '/review' || pathname === '/kyc') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

// 6. Matcher: Only run middleware on these routes
export const config = {
  matcher: [
    '/dashboard/:path*', 
    '/kyc/:path*', 
    '/review/:path*',
    '/admin/:path*'
  ],
};