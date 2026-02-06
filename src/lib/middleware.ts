import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Get cookies (Next.js 15 treats these as standard access)
  const session = request.cookies.get('auth-token')?.value; 
  const kycStatus = request.cookies.get('user-kyc-status')?.value; 
  const adminSession = request.cookies.get('admin-access')?.value;

  // --- LAYER 1: ADMIN SECURITY ---
  if (pathname.startsWith('/admin') && pathname !== '/admin/verify') {
    if (adminSession !== 'authorized') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // --- LAYER 2: AUTH & KYC REDIRECTS ---
  
  // If no session and trying to access protected routes
  if (!session && (pathname.startsWith('/dashboard') || pathname.startsWith('/kyc') || pathname.startsWith('/review'))) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // If logged in, handle KYC state routing
  if (session) {
    if (kycStatus === 'PENDING' && pathname !== '/review') {
      return NextResponse.redirect(new URL('/review', request.url));
    }
    
    if (kycStatus === 'APPROVED' && (pathname === '/review' || pathname === '/kyc')) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    if ((kycStatus === 'NONE' || !kycStatus) && pathname.startsWith('/dashboard')) {
       return NextResponse.redirect(new URL('/kyc', request.url));
    }
  }

  return NextResponse.next();
}

// MATCH ALL PROTECTED PATHS
export const config = {
  matcher: [
    '/dashboard/:path*', 
    '/kyc/:path*', 
    '/review/:path*',
    '/admin/:path*'
  ],
};