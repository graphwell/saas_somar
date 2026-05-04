import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ─── Security Headers ────────────────────────────────────────────────────
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Previne clickjacking
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          // Previne MIME type sniffing
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // Controla informações de referrer
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // Força HTTPS em produção
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          // Restringe permissões de browser features
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          // CSP básico — permite Next.js funcionar + WhatsApp/Stripe externos
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https:",
              "connect-src 'self' https://api.stripe.com https://wasenderapi.com https://api.ultramsg.com",
              "frame-src https://js.stripe.com",
            ].join("; "),
          },
        ],
      },
    ];
  },

  // ─── Image Optimization ──────────────────────────────────────────────────
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.pinimg.com",
      },
      {
        protocol: "https",
        hostname: "www.transparenttextures.com",
      },
    ],
  },

  // ─── TypeScript ───────────────────────────────────────────────────────────
  typescript: {
    // Ativar em CI para bloquear deploys com erros de tipo
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
