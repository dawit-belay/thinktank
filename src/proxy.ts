import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  
  // 1. Get the 'user_id' cookie
  const userId = request.cookies.get('user_id')?.value;

  // 2. Define which paths are "Protected"
  const isProtectedPath = request.nextUrl.pathname.startsWith('/meeting');

  // 3. Define which paths are "Public" (Login/Signup)
  const isAuthPath = request.nextUrl.pathname.startsWith('/login') || 
                     request.nextUrl.pathname.startsWith('/signup');

  // LOGIC: If trying to access a protected room without a cookie -> Redirect to Login
  if (isProtectedPath && !userId) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // LOGIC: If already logged in and trying to go to Login/Signup -> Redirect to Home
  if (isAuthPath && userId) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

// This "matcher" prevents the middleware from running on images, CSS, or internal files
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};