import type { Metadata, Viewport } from 'next'
import { Kalam, Patrick_Hand } from 'next/font/google'
import './globals.css'

// ── Google Fonts ─────────────────────────────────────────────────────
const kalam = Kalam({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-kalam',
  display: 'swap',
})

const patrickHand = Patrick_Hand({
  weight: ['400'],
  subsets: ['latin'],
  variable: '--font-patrick-hand',
  display: 'swap',
})

// ── Site-wide constants ───────────────────────────────────────────────
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://fetchasset.app'
const SITE_NAME = 'FetchAsset'
const TITLE_TEMPLATE = '%s — FetchAsset'
const DEFAULT_TITLE = 'FetchAsset — AI-Powered Client Onboarding'
const DEFAULT_DESCRIPTION =
  'Stop chasing clients for files. FetchAsset creates frictionless asset onboarding portals powered by Llama 3.3 AI — so your agency runs on magic links, not email chaos.'

// ── Root Metadata ─────────────────────────────────────────────────────
export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: DEFAULT_TITLE,
    template: TITLE_TEMPLATE,
  },
  description: DEFAULT_DESCRIPTION,
  keywords: [
    'client onboarding',
    'asset collection',
    'agency portal',
    'AI file audit',
    'magic link portal',
    'freelancer tool',
    'file management automation',
    'client file request',
    'onboarding automation',
    'AI document review',
  ],
  authors: [{ name: SITE_NAME, url: APP_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: 'Business Software',
  applicationName: SITE_NAME,
  generator: 'Next.js',
  referrer: 'strict-origin-when-cross-origin',

  // ── Canonical + Alternates ─────────────────────────────────────────
  alternates: {
    canonical: '/',
  },

  // ── Robots ────────────────────────────────────────────────────────
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // ── Open Graph ─────────────────────────────────────────────────────
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: APP_URL,
    siteName: SITE_NAME,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'FetchAsset — AI-Powered Client Onboarding',
        type: 'image/png',
      },
    ],
  },

  // ── Twitter / X ──────────────────────────────────────────────────
  twitter: {
    card: 'summary_large_image',
    site: '@fetchasset',
    creator: '@fetchasset',
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: ['/og-image.png'],
  },

  // ── Icons ─────────────────────────────────────────────────────────
  icons: {
    icon: [
      { url: '/logo.png', type: 'image/png' },
    ],
    apple: [{ url: '/logo.png', sizes: '180x180' }],
  },

  // ── Manifest ──────────────────────────────────────────────────────
  manifest: '/manifest.json',

  // ── Verification (add keys when ready) ────────────────────────────
  // verification: {
  //   google: 'YOUR_GOOGLE_SITE_VERIFICATION_TOKEN',
  // },
}

// ── Viewport (separate export in Next.js 14) ─────────────────────────
export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#faf8f5' },
    { media: '(prefers-color-scheme: dark)',  color: '#2d2d2d' },
  ],
  colorScheme: 'light',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

// ── Root Layout ───────────────────────────────────────────────────────
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${kalam.variable} ${patrickHand.variable}`}
    >
      <body className="font-body bg-paper text-ink antialiased">
        {children}
      </body>
    </html>
  )
}

