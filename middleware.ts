import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Só age em rotas /admin
  if (!pathname.startsWith('/admin')) return NextResponse.next();

  // Página de login do admin é sempre pública (agora no grupo (auth), não precisa desta linha,
  // mas mantemos como segurança para qualquer variação de URL)
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

  // Sessão existe mas não é ADMIN → redireciona para dashboard do usuário
  if (token.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
}

export const config = {
  // Protege /admin/* mas não /admin/login
  matcher: ['/admin/((?!login).*)'],
};
