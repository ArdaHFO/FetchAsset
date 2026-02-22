import type { Metadata } from 'next'
import React from 'react'

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to FetchAsset to manage your client onboarding portals.',
  robots: { index: true, follow: true },
  alternates: { canonical: '/login' },
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ background: 'var(--color-paper, #fdfbf7)' }}
    >
      {/* Logo */}
      <div className="mb-8 flex flex-col items-center gap-2">
        <span
          className="font-heading text-4xl text-ink select-none"
          style={{
            letterSpacing: '-0.5px',
            textShadow: '2px 2px 0px #e5e0d8',
          }}
        >
          Fetch<span className="text-accent">Asset</span>
        </span>
        <span
          className="font-body text-sm text-ink/60"
          style={{ letterSpacing: '0.5px' }}
        >
          AI-powered asset onboarding
        </span>
      </div>

      {/* Page content */}
      <div className="w-full max-w-md">{children}</div>

      {/* Footer */}
      <p className="mt-10 font-body text-xs text-ink/40 text-center">
        © {new Date().getFullYear()} FetchAsset · Built with ☕ &amp; Llama 3.3
      </p>
    </div>
  )
}
