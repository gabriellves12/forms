import { NextResponse, type NextRequest } from 'next/server';

/**
 * Middleware: apenas gate baseado em presence de cookie de sessão.
 *
 * O SDK do Supabase (createServerClient) traz process.version / __dirname
 * pro bundle Edge e derrubava o middleware com MIDDLEWARE_INVOCATION_FAILED.
 * A validação real do token acontece nos server components / actions via
 * createServerSupabase, que continua rodando em Node runtime.
 */
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
    path === '/' || path.startsWith('/briefings') || path.startsWith('/templates') || path.startsWith('/drafts');
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
