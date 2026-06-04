import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Allow login & auth APIs through regardless of base path ──
  if (
    pathname.endsWith('/admin/login') ||
    pathname.includes('/api/admin/login') ||
    pathname.includes('/api/admin/logout')
  ) {
    return NextResponse.next();
  }

  // ── Protect any route that contains /admin ───────────────────
  // Uses .includes() so it works for both /admin and /account/admin
  // without depending on the BASE env var being set at startup time.
  if (pathname.includes('/admin')) {
    const token = request.cookies.get(COOKIE_NAME)?.value;

    if (!token) {
      // Derive login URL from current pathname so basePath is preserved:
      //   /admin/anything        → /admin/login
      //   /account/admin/anything → /account/admin/login
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = pathname.replace(/\/admin.*$/, '/admin/login');
      return NextResponse.redirect(loginUrl);
    }

    const payload = await verifyToken(token);
    if (!payload) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = pathname.replace(/\/admin.*$/, '/admin/login');
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  // Matches: /admin, /admin/*, /account/admin, /account/admin/*
  matcher: ['/(account/)?admin(.*)'],
};
