import { NextRequest, NextResponse } from 'next/server';

/**
 * Protege tudo em /portal — a autorização "de verdade" (RBAC) é sempre
 * validada no backend a cada requisição; isto aqui é só a barreira de UX
 * para não deixar a página nem renderizar sem sessão.
 */
export function middleware(request: NextRequest) {
  const hasSession = request.cookies.get('ejc.hasSession')?.value === '1';

  if (!hasSession) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/portal/:path*'],
};
