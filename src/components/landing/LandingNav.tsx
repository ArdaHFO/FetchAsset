'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { WobblyButton } from '@/components/ui'

const NAV_LINKS = [
  { href: '#how',     label: 'How It Works' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#faq',     label: 'FAQ' },
]

export default function LandingNav() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-paper/90 backdrop-blur-sm border-b-[3px] border-dashed border-muted">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="font-heading text-2xl text-ink no-underline">
          FetchAsset
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8 font-body text-ink/70">
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} className="hover:text-ink transition-colors">
              {l.label}
            </a>
          ))}
        </div>

        {/* Right: Log In text link + Get Started CTA */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden sm:block font-body text-sm text-ink/60 hover:text-ink transition-colors"
          >
            Log In
          </Link>
          <Link href="/login">
            <WobblyButton size="sm">Get Started Free</WobblyButton>
          </Link>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="md:hidden p-2 text-ink"
            aria-label={open ? 'Close menu' : 'Open menu'}
            style={{ borderRadius: '10px 3px 10px 3px / 3px 10px 3px 10px' }}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden border-t-2 border-dashed border-muted bg-paper/95 px-4 py-4 flex flex-col gap-1">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="font-body text-base text-ink/70 hover:text-ink px-3 py-2.5 rounded-sm transition-colors hover:bg-muted/40"
              style={{ borderRadius: '12px 3px 12px 3px / 3px 12px 3px 12px' }}
            >
              {l.label}
            </a>
          ))}
          <Link
            href="/login"
            onClick={() => setOpen(false)}
            className="font-body text-base text-ink px-3 py-2.5 font-semibold hover:bg-muted/40 transition-colors"
            style={{ borderRadius: '12px 3px 12px 3px / 3px 12px 3px 12px' }}
          >
            🔑 Log In / Sign Up
          </Link>
        </div>
      )}
    </nav>
  )
}
