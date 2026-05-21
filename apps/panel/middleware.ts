import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const hasToken = req.cookies.has('access_token');
  const { pathname } = req.nextUrl;

  // Authenticated user landing on login → skip to dashboard (no flash)
  if (hasToken && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // Unauthenticated user on protected page → login
  if (!hasToken && pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/onboarding/:path*',
    '/register/:path*',
    '/login',
  ],
};
