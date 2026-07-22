import { createMiddlewareClient } from './infrastructure/supabase/supabase-middleware-client';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request });
  const supabase = createMiddlewareClient(request, response);
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const { pathname } = request.nextUrl;
  const isAuthRoute =
    pathname.startsWith('/sign-in') || pathname.startsWith('/auth');
  if (!session && !isAuthRoute) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }
  if (session && pathname === '/sign-in') {
    return NextResponse.redirect(new URL('/notes', request.url));
  }
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
