import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Allow auth API route
  if (request.nextUrl.pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  // Check for auth cookie
  const authCookie = request.cookies.get('nps-auth');
  if (authCookie?.value === 'authenticated') {
    return NextResponse.next();
  }

  // Allow the login page itself
  if (request.nextUrl.pathname === '/login') {
    return NextResponse.next();
  }

  // Redirect to login
  return NextResponse.redirect(new URL('/login', request.url));
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
