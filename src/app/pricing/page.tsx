import type { Metadata } from 'next'
import Link from 'next/link'
import { Check } from 'lucide-react'
import { WobblyButton, WobblyCard, WobblyCardContent } from '@/components/ui'
import { PLANS, formatPrice } from '@/lib/stripe/plans'
import type { PlanTier } from '@/lib/supabase/types'

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Simple, transparent pricing for agencies of every size. Start free, upgrade when you grow.',
  alternates: { canonical: '/pricing' },
  openGraph: {
    title: 'FetchAsset Pricing — Simple Plans for Agencies',
    description: 'Start free. No credit card required. Upgrade to Pro or Agency when you need more portals and AI audits.',
    url: '/pricing',
  },
}

const PLAN_ORDER: PlanTier[] = ['free', 'pro', 'agency']

const CARD_STYLES: Record<PlanTier, { radius: string; shadow: string; badge?: string }> = {
  free: {
    radius: '220px 30px 240px 20px / 25px 230px 20px 215px',
    shadow: '4px 4px 0 0 #2d2d2d',
  },
  pro: {
    radius: '180px 45px 200px 35px / 40px 190px 30px 170px',
    shadow: '6px 6px 0 0 #2d2d2d',
    badge: 'Most popular',
  },
  agency: {
    radius: '240px 20px 220px 30px / 20px 215px 25px 230px',
    shadow: '4px 4px 0 0 #2d2d2d',
  },
}

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-paper px-4 py-20">
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="font-heading text-5xl text-ink mb-4 leading-tight">
          Simple, honest pricing
        </h1>
        <p className="font-body text-lg text-ink/60 max-w-lg mx-auto">
          Start free. Upgrade when you need more. No hidden fees, no surprises.
        </p>
      </div>

      {/* Cards */}
      <div className="flex flex-col md:flex-row gap-6 justify-center items-stretch max-w-5xl mx-auto">
        {PLAN_ORDER.map((tier) => {
          const plan = PLANS[tier]
          const style = CARD_STYLES[tier]
          const isPro = tier === 'pro'

          return (
            <div
              key={tier}
              className="relative flex-1 max-w-sm"
              style={{ transform: isPro ? 'translateY(-8px)' : undefined }}
            >
              {/* Popular badge */}
              {style.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <span
                    className="font-body text-xs font-bold px-4 py-1 bg-ink text-paper whitespace-nowrap"
                    style={{ borderRadius: '20px 4px 20px 4px / 4px 20px 4px 20px' }}
                  >
                    {style.badge}
                  </span>
                </div>
              )}

              <div
                className="h-full flex flex-col bg-paper border-2 border-ink overflow-hidden"
                style={{
                  borderRadius: style.radius,
                  boxShadow: style.shadow,
                }}
              >
                {isPro && <div className="h-1.5 bg-ink w-full" />}

                <div className="flex flex-col flex-1 p-8">
                  {/* Plan name */}
                  <div className="mb-6">
                    <h2 className="font-heading text-2xl text-ink">{plan.name}</h2>
                    <p className="font-body text-sm text-ink/50 mt-0.5">{plan.tagline}</p>
                  </div>

                  {/* Price */}
                  <div className="mb-8">
                    <span className="font-heading text-5xl text-ink">
                      {formatPrice(plan.monthlyPrice)}
                    </span>
                    {plan.monthlyPrice > 0 && (
                      <span className="font-body text-sm text-ink/50"> / month</span>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="flex flex-col gap-3 mb-8 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5">
                        <span className="mt-0.5 flex-shrink-0">
                          <Check size={14} className="text-ink" strokeWidth={3} />
                        </span>
                        <span className="font-body text-sm text-ink/80">{f}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  {tier === 'free' ? (
                    <Link href="/login" className="block">
                      <WobblyButton variant="secondary" size="md" className="w-full">
                        Get started free
                      </WobblyButton>
                    </Link>
                  ) : (
                    <form action={`/api/stripe/checkout?plan=${tier}`} method="POST">
                      <WobblyButton
                        variant={isPro ? 'primary' : 'secondary'}
                        size="md"
                        className="w-full"
                        type="submit"
                      >
                        Upgrade to {plan.name}
                      </WobblyButton>
                    </form>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer note */}
      <p className="font-body text-sm text-ink/40 text-center mt-16">
        All plans include a 14-day free trial. Cancel anytime.
        {' '}
        <Link href="/dashboard" className="underline hover:text-ink transition-colors">
          Back to dashboard
        </Link>
      </p>
    </main>
  )
}
