'use client'

/**
 * LaunchBanner — dismissible "FETCH50 launch offer" strip at the top of the site.
 * Clicking "Claim Offer" saves the promo code to localStorage so CheckoutButton
 * can auto-apply it when the user hits Stripe Checkout.
 */

import { useState, useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { useRouter } from 'next/navigation'

const PROMO_CODE = 'FETCH50'
const PROMO_KEY = 'fetchasset_promo_code'

export default function LaunchBanner() {
  const [dismissed, setDismissed] = useState(true) // start hidden to avoid flash
  const [toastVisible, setToastVisible] = useState(false)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const router = useRouter()

  useEffect(() => {
    const stored = localStorage.getItem('fetchasset_launch_banner_dismissed')
    if (!stored) setDismissed(false)
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current)
    }
  }, [])

  function dismiss() {
    localStorage.setItem('fetchasset_launch_banner_dismissed', '1')
    setDismissed(true)
  }

  function claimOffer() {
    // Persist promo code so CheckoutButton can auto-apply it
    localStorage.setItem(PROMO_KEY, PROMO_CODE)

    // Show confirmation toast
    setToastVisible(true)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToastVisible(false), 4000)

    // Navigate to pricing section
    router.push('/#pricing')
  }

  if (dismissed) return null

  return (
    <div
      className="relative z-[60] bg-ink text-paper px-4 py-2.5 font-body text-sm flex items-center justify-center gap-3 text-center"
      style={{ borderBottom: '3px solid rgba(255,255,255,0.12)' }}
    >
      {/* Toast notification */}
      {toastVisible && (
        <div
          className="absolute top-full left-1/2 -translate-x-1/2 mt-2 font-body text-xs bg-ink text-paper px-4 py-2.5 whitespace-nowrap z-[70]"
          style={{
            borderRadius: '245px 18px 200px 20px / 22px 210px 14px 240px',
            boxShadow: '3px 3px 0 0 rgba(255,255,255,0.25)',
            border: '1.5px solid rgba(255,255,255,0.3)',
          }}
        >
          Discount code &ldquo;<strong>{PROMO_CODE}</strong>&rdquo; saved! Applied automatically at checkout. 🚀
        </div>
      )}

      <span className="font-body text-sm leading-snug">
        🚀 <strong>First 100 users only:</strong> Use code&nbsp;
        <code
          className="font-body font-bold bg-white/15 px-2 py-0.5 tracking-wider"
          style={{ borderRadius: '6px' }}
        >
          {PROMO_CODE}
        </code>
        &nbsp;for 50% off — first login, first month free!
      </span>
      <button
        type="button"
        onClick={claimOffer}
        className="flex-shrink-0 bg-paper text-ink font-body text-xs font-bold px-4 py-1.5 hover:bg-[#fffde7] transition-colors"
        style={{
          borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px',
          boxShadow: '2px 2px 0 0 rgba(255,255,255,0.25)',
        }}
      >
        Claim Offer ✦
      </button>
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
