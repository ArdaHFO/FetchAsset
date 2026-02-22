import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { WobblyCard, WobblyCardContent, WobblyButton } from '@/components/ui'
import { PLANS, formatPrice } from '@/lib/stripe/plans'
import type { PlanTier, Profile } from '@/lib/supabase/types'

export const dynamic = 'force-dynamic'

const STATUS_LABELS: Record<string, string> = {
  active:             '✅ Active',
  trialing:           '🎁 Trial',
  past_due:           '⚠️ Past due',
  canceled:           '✗ Canceled',
  incomplete:         '⏳ Incomplete',
  incomplete_expired: '✗ Expired',
  unpaid:             '⚠️ Unpaid',
}

function PlanBadge({ plan }: { plan: PlanTier }) {
  const colors: Record<PlanTier, string> = {
    free:   'bg-muted text-ink/70',
    solo:   'bg-postit text-ink',
    pro:    'bg-blue/10 text-blue',
    agency: 'bg-ink text-paper',
  }
  return (
    <span
      className={`font-body text-sm font-bold px-3 py-0.5 ${colors[plan]}`}
      style={{ borderRadius: '20px 5px 20px 5px / 5px 20px 5px 20px' }}
    >
      {PLANS[plan].name}
    </span>
  )
}

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: { checkout?: string }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const profileResult = await supabase
    .from('profiles')
    .select('full_name, plan, stripe_subscription_status, stripe_customer_id, stripe_subscription_id')
    .eq('id', user.id)
    .single()

  const profile = profileResult.data as Pick<
    Profile,
    'full_name' | 'plan' | 'stripe_subscription_status' | 'stripe_customer_id' | 'stripe_subscription_id'
  > | null

  const plan: PlanTier = (profile?.plan as PlanTier) ?? 'free'
  const planMeta = PLANS[plan]
  const hasPaidPlan = plan !== 'free'
  const subStatus = profile?.stripe_subscription_status ?? null
  const didJustUpgrade = searchParams.checkout === 'success'

  return (
    <div className="flex flex-col gap-6 max-w-xl">
      <div>
        <h1 className="font-heading text-3xl text-ink">Settings</h1>
        <p className="font-body text-sm text-ink/55 mt-1">Manage your account and billing.</p>
      </div>

      {/* Checkout success banner */}
      {didJustUpgrade && (
        <div
          className="px-5 py-4 bg-green-50 border-2 border-green-400 flex items-center gap-3"
          style={{ borderRadius: '12px 3px 12px 3px / 3px 12px 3px 12px' }}
        >
          <span className="text-xl">🎉</span>
          <div>
            <p className="font-body text-sm font-bold text-green-900">You&apos;re upgraded!</p>
            <p className="font-body text-xs text-green-700">
              Welcome to {planMeta.name}. Your new limits are active immediately.
            </p>
          </div>
        </div>
      )}

      {/* Account card */}
      <WobblyCard flavor="default" shadow="DEFAULT" radius="md">
        <WobblyCardContent className="p-6 flex flex-col gap-4">
          <h2 className="font-heading text-lg text-ink">Account</h2>
          <div className="flex flex-col gap-1">
            <span className="font-body text-xs text-ink/45 uppercase tracking-wider">Email</span>
            <span className="font-body text-sm text-ink">{user.email}</span>
          </div>
          {profile?.full_name && (
            <div className="flex flex-col gap-1">
              <span className="font-body text-xs text-ink/45 uppercase tracking-wider">Name</span>
              <span className="font-body text-sm text-ink">{profile.full_name}</span>
            </div>
          )}
        </WobblyCardContent>
      </WobblyCard>

      {/* Billing card */}
      <WobblyCard flavor="default" shadow="DEFAULT" radius="md">
        <WobblyCardContent className="p-6 flex flex-col gap-5">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-heading text-lg text-ink">Billing</h2>
            <PlanBadge plan={plan} />
          </div>

          {/* Plan details */}
          <div
            className="flex flex-col gap-2 p-4 bg-muted/40 border border-ink/10"
            style={{ borderRadius: '10px 3px 10px 3px / 3px 10px 3px 10px' }}
          >
            <div className="flex items-center justify-between">
              <span className="font-body text-sm text-ink font-medium">{planMeta.name} plan</span>
              <span className="font-body text-sm text-ink">
                {planMeta.monthlyPrice === 0 ? 'Free' : `${formatPrice(planMeta.monthlyPrice)} / mo`}
              </span>
            </div>
            {subStatus && (
              <div className="flex items-center justify-between">
                <span className="font-body text-xs text-ink/50">Subscription status</span>
                <span className="font-body text-xs text-ink/70">
                  {STATUS_LABELS[subStatus] ?? subStatus}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="font-body text-xs text-ink/50">Projects</span>
              <span className="font-body text-xs text-ink/70">
                {planMeta.projectLimit === -1 ? 'Unlimited' : `Up to ${planMeta.projectLimit}`}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-body text-xs text-ink/50">AI audits</span>
              <span className="font-body text-xs text-ink/70">
                {planMeta.aiAuditsPerMonth === -1 ? 'Unlimited' : `${planMeta.aiAuditsPerMonth} / month`}
              </span>
            </div>
            {planMeta.whiteLabel && (
              <div className="flex items-center justify-between">
                <span className="font-body text-xs text-ink/50">White-label portal</span>
                <span className="font-body text-xs text-green-700">✓ Included</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            {hasPaidPlan ? (
              <form action="/api/stripe/portal" method="POST">
                <WobblyButton variant="secondary" size="sm" type="submit" className="w-full">
                  Manage subscription →
                </WobblyButton>
              </form>
            ) : (
              <Link href="/pricing">
                <WobblyButton variant="primary" size="sm" className="w-full">
                  Upgrade plan →
                </WobblyButton>
              </Link>
            )}
            {!hasPaidPlan && (
              <p className="font-body text-xs text-ink/40 text-center">
                Free plan · {planMeta.projectLimit} projects · {planMeta.aiAuditsPerMonth} AI audits/mo
              </p>
            )}
          </div>
        </WobblyCardContent>
      </WobblyCard>
    </div>
  )
}
