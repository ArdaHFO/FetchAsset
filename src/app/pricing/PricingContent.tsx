'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Check, Tag, X } from 'lucide-react'
import { WobblyButton } from '@/components/ui'
import { PLANS, formatPrice } from '@/lib/stripe/plans'
import CheckoutButton from '@/components/CheckoutButton'
import type { PlanTier } from '@/lib/supabase/types'

const PROMO_KEY = 'fetchasset_promo_code'
const PLAN_ORDER: PlanTier[] = ['free', 'solo', 'pro', 'agency']

const CARD_STYLES: Record<PlanTier, { radius: string; shadow: string }> = {
  free:   { radius: '220px 30px 240px 20px / 25px 230px 20px 215px', shadow: '4px 4px 0 0 #2d2d2d' },
  solo:   { radius: '245px 18px 200px 20px / 22px 210px 14px 240px', shadow: '4px 4px 0 0 #2d2d2d' },
  pro:    { radius: '180px 45px 200px 35px / 40px 190px 30px 170px',  shadow: '6px 6px 0 0 #2d2d2d' },
  agency: { radius: '240px 20px 220px 30px / 20px 215px 25px 230px',  shadow: '4px 4px 0 0 #2d2d2d' },
}

export default function PricingContent() {
  const router = useRouter()
  const [promoInput, setPromoInput]     = useState('')
  const [savedPromo, setSavedPromo]     = useState<string | null>(null)
  const [promoApplied, setPromoApplied] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(PROMO_KEY)
    if (stored) { setSavedPromo(stored); setPromoInput(stored) }
  }, [])

  function applyPromo() {
    const code = promoInput.trim().toUpperCase()
    if (!code) return
    localStorage.setItem(PROMO_KEY, code)
    setSavedPromo(code)
    setPromoApplied(true)
    setTimeout(() => setPromoApplied(false), 2000)
  }

  function clearPromo() {
    localStorage.removeItem(PROMO_KEY)
    setSavedPromo(null)
    setPromoInput('')
  }

  return (
    <main className="min-h-screen bg-paper px-4 py-10 md:py-16">
      <div className="max-w-5xl mx-auto">

        {/* ── Back button ── */}
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-1.5 font-body text-sm text-ink/60 hover:text-ink transition-colors mb-10 group"
        >
          <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
          Back
        </button>

        {/* ── Header ── */}
        <div className="text-center mb-12">
          <span
            className="inline-block font-body text-xs uppercase tracking-widest text-ink/50 px-3 py-1 border-2 border-ink/20 mb-4"
            style={{ borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px' }}
          >
            Pricing
          </span>
          <h1 className="font-heading text-4xl md:text-5xl text-ink leading-tight">
            Simple, honest pricing
          </h1>
          <p className="font-body text-base text-ink/60 max-w-sm mx-auto mt-3">
            Start free. Upgrade when you need more. No hidden fees.
          </p>
        </div>

        {/* ── Promo code box ── */}
        <div
          className="max-w-sm mx-auto mb-12 p-4 border-2 border-ink/20 bg-paper"
          style={{
            borderRadius: '220px 30px 240px 20px / 25px 230px 20px 215px',
            boxShadow: '3px 3px 0 0 #2d2d2d',
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Tag size={14} className="text-ink/50" />
            <span className="font-body text-sm font-semibold text-ink">Got a promo code?</span>
          </div>

          {savedPromo ? (
            <>
              <div
                className="flex items-center justify-between gap-2 px-3 py-2 bg-muted border-2 border-ink/20"
                style={{ borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px' }}
              >
                <span className="font-body text-sm text-ink font-bold tracking-widest">{savedPromo}</span>
                <button
                  type="button"
                  onClick={clearPromo}
                  className="text-ink/40 hover:text-accent transition-colors"
                  aria-label="Remove promo code"
                >
                  <X size={14} />
                </button>
              </div>
              <p className="font-body text-xs text-ink/50 mt-2">
                ✓ Code <strong>{savedPromo}</strong> applied — discount added at checkout.
              </p>
            </>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. FETCH50"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && applyPromo()}
                className="flex-1 px-3 py-2 font-body text-sm text-ink placeholder:text-ink/40 bg-paper border-2 border-ink/60 outline-none focus:border-ink transition-all uppercase tracking-widest"
                style={{ borderRadius: '220px 30px 240px 20px / 25px 230px 20px 215px' }}
              />
              <WobblyButton
                type="button"
                variant="secondary"
                size="sm"
                onClick={applyPromo}
                disabled={!promoInput.trim()}
              >
                {promoApplied ? '✓ Done!' : 'Apply'}
              </WobblyButton>
            </div>
          )}
        </div>

        {/* ── Plan cards ── */}
        <div className="flex flex-col md:flex-row gap-6 justify-center items-stretch">
          {PLAN_ORDER.map((tier) => {
            const plan  = PLANS[tier]
            const style = CARD_STYLES[tier]
            const isPro = tier === 'pro'

            return (
              <div
                key={tier}
                className="relative flex-1 md:max-w-xs"
                style={{ transform: isPro ? 'translateY(-10px)' : undefined }}
              >
                {isPro && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <span
                      className="font-body text-xs font-bold px-4 py-1 bg-ink text-paper whitespace-nowrap"
                      style={{ borderRadius: '20px 4px 20px 4px / 4px 20px 4px 20px' }}
                    >
                      ⭐ Most popular
                    </span>
                  </div>
                )}

                <div
                  className="h-full flex flex-col bg-paper border-2 border-ink overflow-hidden"
                  style={{ borderRadius: style.radius, boxShadow: style.shadow }}
                >
                  {isPro && <div className="h-1.5 bg-ink w-full" />}

                  <div className="flex flex-col flex-1 p-7">
                    <div className="mb-5">
                      <h2 className="font-heading text-2xl text-ink">{plan.name}</h2>
                      <p className="font-body text-sm text-ink/60 mt-0.5">{plan.tagline}</p>
                    </div>

                    <div className="mb-7">
                      <span className="font-heading text-4xl text-ink">
                        {formatPrice(plan.monthlyPrice)}
                      </span>
                      {plan.monthlyPrice > 0 && (
                        <span className="font-body text-sm text-ink/55"> / mo</span>
                      )}
                      {savedPromo && tier !== 'free' && (
                        <p className="font-body text-xs text-green-700 mt-2 font-semibold">
                          🏷️ &quot;{savedPromo}&quot; applied at checkout
                        </p>
                      )}
                    </div>

                    <ul className="flex flex-col gap-2.5 mb-7 flex-1">
                      {plan.features.map((feat) => (
                        <li key={feat} className="flex items-start gap-2">
                          <Check size={13} className="text-ink mt-0.5 flex-shrink-0" strokeWidth={3} />
                          <span className="font-body text-sm text-ink/80">{feat}</span>
                        </li>
                      ))}
                    </ul>

                    {tier === 'free' ? (
                      <Link href="/login" className="block">
                        <WobblyButton variant="secondary" size="md" className="w-full">
                          Get started free
                        </WobblyButton>
                      </Link>
                    ) : (
                      <CheckoutButton
                        tier={tier}
                        label={isPro ? `Get ${plan.name}` : `Upgrade to ${plan.name}`}
                        variant={isPro ? 'primary' : 'secondary'}
                      />
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <p className="font-body text-sm text-ink/40 text-center mt-12">
          Upgrade or downgrade any time · Cancel anytime
        </p>
      </div>
    </main>
  )
}
