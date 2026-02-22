'use client'

/**
 * LaunchBanner — dismissible "FETCH50 launch offer" strip at the top of the site.
 * Stored in localStorage so it stays dismissed across navigation.
 */

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import Link from 'next/link'

export default function LaunchBanner() {
  const [dismissed, setDismissed] = useState(true) // start hidden to avoid flash

  useEffect(() => {
    const stored = localStorage.getItem('fetchasset_launch_banner_dismissed')
    if (!stored) setDismissed(false)
  }, [])

  function dismiss() {
    localStorage.setItem('fetchasset_launch_banner_dismissed', '1')
    setDismissed(true)
  }

  if (dismissed) return null

  return (
    <div
      className="relative z-[60] bg-ink text-paper px-4 py-2.5 font-body text-sm flex items-center justify-center gap-3 text-center"
      style={{ borderBottom: '3px solid rgba(255,255,255,0.12)' }}
    >
      <span className="font-body text-sm leading-snug">
        🚀 <strong>Launch Special:</strong> Use code&nbsp;
        <code
          className="font-body font-bold bg-white/15 px-2 py-0.5 tracking-wider"
          style={{ borderRadius: '6px' }}
        >
          FETCH50
        </code>
        &nbsp;for 50% off your first 3 months!
      </span>
      <Link
        href="/pricing"
        className="flex-shrink-0 bg-paper text-ink font-body text-xs font-bold px-4 py-1.5 hover:bg-[#fffde7] transition-colors"
        style={{
          borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px',
          boxShadow: '2px 2px 0 0 rgba(255,255,255,0.25)',
        }}
      >
        Claim Offer ✦
      </Link>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss banner"
        className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 transition-opacity"
      >
        <X size={16} />
      </button>
    </div>
  )
}
