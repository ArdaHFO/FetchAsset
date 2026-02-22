'use client'

import { WobblyButton } from '@/components/ui'
import { capture, EVENTS } from '@/lib/posthog'
import type { PlanTier } from '@/lib/supabase/types'

export default function CheckoutButton({ tier, label, variant }: {
  tier: PlanTier
  label: string
  variant?: 'primary' | 'secondary'
}) {
  function handleClick() {
    capture(EVENTS.CHECKOUT_INITIATED, { plan: tier })
    // Submit the hidden form after tracking
    const form = document.getElementById(`checkout-form-${tier}`) as HTMLFormElement | null
    form?.submit()
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
