import { NextResponse } from 'next/dist/server/web/spec-extension/response';
import type { NextRequest } from 'next/dist/server/web/spec-extension/request';

function hasSupabaseSession(request: NextRequest): boolean {
  for (const cookie of request.cookies.getAll()) {
    if (cookie.name.startsWith('sb-') && cookie.name.endsWith('-auth-token')) {
      if (cookie.value && cookie.value !== '') return true;
    }
  }
  return false;
}

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isProtected =
    path === '/' ||
    path.startsWith('/briefings') ||
    path.startsWith('/templates') ||
    path.startsWith('/drafts');
  const isLogin = path === '/login';
  const hasSession = hasSupabaseSession(request);

  if (isProtected && !hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', path + request.nextUrl.search);
    return NextResponse.redirect(url);
  }

  if (isLogin && hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/briefings/:path*', '/templates/:path*', '/drafts/:path*', '/login'],
};
