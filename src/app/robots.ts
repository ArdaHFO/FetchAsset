import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://fetchasset.app'
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/pricing', '/login', '/verify', '/demo', '/privacy-policy', '/terms-of-service', '/cookie-policy'],
        // Block all authenticated / client portal routes from indexing
        disallow: [
          '/dashboard',
          '/projects/',
          '/settings',
          '/portal/',
          '/api/',
          '/_next/',
          '/auth/',
        ],
      },
      // Block AI training crawlers
      {
        userAgent: [
          'GPTBot',
          'ChatGPT-User',
          'Google-Extended',
          'CCBot',
          'anthropic-ai',
          'Claude-Web',
          'Omgilibot',
        ],
        disallow: ['/'],
      },
    ],
    sitemap: `${appUrl}/sitemap.xml`,
    host: appUrl,
  }
}
