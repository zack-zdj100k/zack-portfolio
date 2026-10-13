import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const isProd = process.env.NODE_ENV === "production";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  // Tell browsers to use HTTPS only (production — Vercel adds this too, but explicit is safer)
  ...(isProd
    ? [{ key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" }]
    : []),
  // Content-Security-Policy: restrict what can load on each page
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Scripts: self + Next.js inline scripts (required) + Vercel analytics/speed insights
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live https://*.vercel-insights.com",
      // Styles: self + inline (Tailwind injects style attrs) + Google Fonts
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      // Fonts: self + Google Fonts CDN
      "font-src 'self' https://fonts.gstatic.com",
      // Images: self + Cloudinary CDN + data URIs (Three.js uses data: textures)
      "img-src 'self' data: blob: https://res.cloudinary.com",
      // Media (video/audio if any): self
      "media-src 'self' blob:",
      // Connections (fetch/XHR): self + Vercel analytics
      "connect-src 'self' https://*.vercel-insights.com https://vitals.vercel-insights.com",
      // Workers (Three.js draco decoder uses a worker)
      "worker-src 'self' blob:",
      // Frames: deny (matches X-Frame-Options: DENY)
      "frame-src 'none'",
      // Object embeds: none
      "object-src 'none'",
      // Base tag: only self
      "base-uri 'self'",
      // Form actions: only self
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }],
    localPatterns: [{ pathname: "/hero/**" }, { pathname: "/media/**" }, { pathname: "/profile/**" }, { pathname: "/projects/**" }],
  },
  experimental: {
    serverActions: { bodySizeLimit: "26mb" },
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default withNextIntl(nextConfig);
