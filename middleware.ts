import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Só age em rotas /admin
  if (!pathname.startsWith('/admin')) return NextResponse.next();

  // Login admin é público — passa sem verificação
  if (pathname.startsWith('/admin/login')) return NextResponse.next();

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: process.env.NODE_ENV === 'production',
  });

  // Sem sessão → redireciona para login admin
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = '/admin/login';
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  // Tem sessão mas não é ADMIN → dashboard do usuário
  if (token.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
