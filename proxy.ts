import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // Login admin sempre acessível (sem autenticação)
    if (pathname === "/admin/login") return NextResponse.next();

    // Rotas /admin/* exigem autenticação E role ADMIN
    if (pathname.startsWith("/admin")) {
      if (!token) {
        const url = req.nextUrl.clone();
        url.pathname = "/admin/login";
        url.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(url);
      }
      if (token.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    // Rotas do usuário exigem apenas autenticação
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // Deixa tudo passar — a lógica de redirect está no middleware acima
      authorized: () => true,
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/agente/:path*",
    "/conversas/:path*",
    "/whatsapp/:path*",
    "/plano/:path*",
    "/configuracoes/:path*",
    "/onboarding/:path*",
  ],
};
