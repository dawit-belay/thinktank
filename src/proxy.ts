import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  
  // 1. Get the 'user_id' cookie
  const userId = request.cookies.get('user_id')?.value;

  // 2. Define which paths are "Protected"
  const isProtectedPath = request.nextUrl.pathname.startsWith('/group');

  // LOGIC: If trying to access a protected room without a cookie -> Redirect to home
  if (isProtectedPath && !userId) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Do not redirect /login or /signup based on cookie alone: a stale `user_id` cookie
  // (e.g. after DB reset) would bounce users back to "/" and make auth links feel broken.
  // Real sessions are handled in `redirectIfSignedIn()` on those pages.

  return NextResponse.next();
}

// This "matcher" prevents the middleware from running on images, CSS, or internal files
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};