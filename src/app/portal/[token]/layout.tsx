import type { Metadata } from 'next'
import React from 'react'

// Client portals are private magic-link pages — never index
export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: 'Client Portal',
}

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'var(--color-paper, #fdfbf7)' }}
    >
      {/* Topbar */}
      <header
        className="flex items-center justify-between px-6 py-4 border-b-2 border-ink/10"
        style={{ background: '#fdfbf7' }}
      >
        <span
          className="font-heading text-2xl text-ink select-none"
          style={{ letterSpacing: '-0.5px' }}
        >
          Fetch<span className="text-accent">Asset</span>
        </span>
        <span className="font-body text-xs text-ink/35">Secure asset portal</span>
      </header>

      {/* Content */}
      <main className="flex-1 px-4 py-8 md:px-8 max-w-2xl mx-auto w-full">
        {children}
      </main>

      {/* Footer */}
      <footer className="py-5 text-center border-t border-ink/10">
        <p className="font-body text-xs text-ink/30">
          Powered by FetchAsset · Your files are encrypted in transit and at rest.
        </p>
      </footer>
    </div>
  )
}
