'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, LayoutDashboard } from 'lucide-react'
import { WobblyButton } from '@/components/ui'

const NAV_LINKS = [
  { href: '#how',     label: 'How It Works' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#faq',     label: 'FAQ' },
]

interface LandingNavProps {
  userName?: string | null
}

export default function LandingNav({ userName }: LandingNavProps) {
  const [open, setOpen] = useState(false)

  // Truncate long email/name for display
  const displayName = userName
    ? (userName.length > 22 ? userName.slice(0, 20) + '…' : userName)
    : null

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

        {/* Right: auth-aware CTA */}
        <div className="flex items-center gap-3">
          {displayName ? (
            /* Logged-in: show user chip that links back to dashboard */
            <Link
              href="/dashboard"
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 border-2 border-ink/20 bg-paper hover:bg-muted/40 hover:border-ink/50 transition-all font-body text-sm text-ink"
              style={{
                borderRadius: '245px 18px 200px 20px / 22px 210px 14px 240px',
                boxShadow: '2px 2px 0 0 #2d2d2d',
              }}
            >
              <LayoutDashboard size={14} className="text-ink/50" />
              <span className="font-semibold">{displayName}</span>
              <span className="text-ink/40">→ Dashboard</span>
            </Link>
          ) : (
            /* Logged-out: standard Log In + Get Started */
            <>
              <Link
                href="/login"
                className="hidden sm:block font-body text-sm text-ink/60 hover:text-ink transition-colors"
              >
                Log In
              </Link>
              <Link href="/login">
                <WobblyButton size="sm">Get Started Free</WobblyButton>
              </Link>
            </>
          )}
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
          {displayName ? (
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="font-body text-base text-ink px-3 py-2.5 font-semibold hover:bg-muted/40 transition-colors flex items-center gap-2"
              style={{ borderRadius: '12px 3px 12px 3px / 3px 12px 3px 12px' }}
            >
              <LayoutDashboard size={16} />
              {displayName} → Dashboard
            </Link>
          ) : (
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="font-body text-base text-ink px-3 py-2.5 font-semibold hover:bg-muted/40 transition-colors"
              style={{ borderRadius: '12px 3px 12px 3px / 3px 12px 3px 12px' }}
            >
              🔑 Log In / Sign Up
            </Link>
          )}
        </div>
      )}
    </nav>
  )
}
