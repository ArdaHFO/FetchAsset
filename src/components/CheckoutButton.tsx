'use client'

import { WobblyButton } from '@/components/ui'
import { capture, EVENTS } from '@/lib/posthog'
import type { PlanTier } from '@/lib/supabase/types'

const PROMO_KEY = 'fetchasset_promo_code'

export default function CheckoutButton({ tier, label, variant }: {
  tier: PlanTier
  label: string
  variant?: 'primary' | 'secondary'
}) {
  function handleClick() {
    capture(EVENTS.CHECKOUT_INITIATED, { plan: tier })

    // Auto-apply any saved promo code
    const promoCode = typeof window !== 'undefined'
      ? localStorage.getItem(PROMO_KEY)
      : null

    const form = document.getElementById(`checkout-form-${tier}`) as HTMLFormElement | null
    if (form) {
      // Update action URL with promo code if present
      const baseAction = `/api/stripe/checkout?plan=${tier}`
      form.action = promoCode
        ? `${baseAction}&promoCode=${encodeURIComponent(promoCode)}`
        : baseAction
      form.submit()
    }
  }

  return (
    <>
      <form
        id={`checkout-form-${tier}`}
        action={`/api/stripe/checkout?plan=${tier}`}
        method="POST"
        style={{ display: 'none' }}
      />
      <WobblyButton
        variant={variant ?? 'secondary'}
        size="md"
        className="w-full"
        type="button"
        onClick={handleClick}
      >
        {label}
      </WobblyButton>
    </>
  )
}
