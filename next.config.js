/** @type {import('next').NextConfig} */

// ── Security headers ──────────────────────────────────────────────────────────
const SUPABASE_HOST = 'eqapzucdvwqnklhryila.supabase.co'

const securityHeaders = [
  // Prevent clickjacking
  { key: 'X-Frame-Options', value: 'DENY' },
  // Prevent MIME sniffing
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Referrer leakage control
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // DNS prefetch control
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  // Disable browser features not needed
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(self "https://js.stripe.com")',
  },
  // HSTS — only active once deployed on HTTPS (ignored on localhost)
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  // Remove powered-by header (set via next config below as well)
  { key: 'X-Powered-By', value: '' },
  // Content Security Policy
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      // Next.js requires unsafe-inline for its runtime scripts; nonces are the stricter alternative
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      // Allow images from Supabase storage + data URIs + blob (file previews)
      `img-src 'self' data: blob: https://${SUPABASE_HOST} https://*.supabase.co`,
      // API connections: Supabase (REST + realtime WS), Stripe, Groq, Resend (server-side only)
      `connect-src 'self' https://${SUPABASE_HOST} wss://${SUPABASE_HOST} https://*.supabase.co https://api.stripe.com https://js.stripe.com`,
      // Stripe checkout iframe
      "frame-src https://js.stripe.com https://hooks.stripe.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests",
    ].join('; '),
  },
]

const nextConfig = {
  // Remove X-Powered-By: Next.js header
  poweredByHeader: false,

  // Canonical URL normalisation — never serve trailing slashes
  trailingSlash: false,

  images: {
    domains: [SUPABASE_HOST],
    formats: ['image/avif', 'image/webp'],
  },

  experimental: {
    serverComponentsExternalPackages: ['stripe'],
  },

  async headers() {
    return [
      {
        // Apply security headers to ALL routes
        source: '/(.*)',
        headers: securityHeaders.filter((h) => h.value !== ''),
      },
    ]
  },

  async redirects() {
    return [
      // NOTE: www → apex redirect is handled at Vercel CDN level (domain settings),
      // NOT here — having both causes ERR_TOO_MANY_REDIRECTS.
      // Legacy / alternative paths → canonical
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
      {
        source: '/signup',
        destination: '/login',
        permanent: true,
      },
      {
        source: '/register',
        destination: '/login',
        permanent: true,
      },
      {
        source: '/billing',
        destination: '/settings',
        permanent: true,
      },
      {
        source: '/upgrade',
        destination: '/pricing',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig

