import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PLANS, formatPrice } from '@/lib/stripe/plans'
import type { PlanTier, Profile } from '@/lib/supabase/types'
import SettingsTabs from '@/components/settings/SettingsTabs'
import type { BrandingValues } from '@/components/settings/BrandingHub'

export const dynamic = 'force-dynamic'

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: { checkout?: string; tab?: string }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const profileResult = await supabase
    .from('profiles')
    .select('full_name, plan, stripe_subscription_status, stripe_customer_id, stripe_subscription_id, logo_url, brand_color, custom_welcome_msg, preferred_font, wobble_intensity')
    .eq('id', user.id)
    .single()

  const profile = profileResult.data as Partial<Profile> | null
  const plan: PlanTier = (profile?.plan as PlanTier) ?? 'free'
  const didJustUpgrade = searchParams.checkout === 'success'
  const defaultTab = (
    searchParams.tab === 'branding' ? 'branding' :
    searchParams.tab === 'billing'  ? 'billing'  : 'account'
  ) as 'account' | 'billing' | 'branding'

  const branding: BrandingValues = {
    logo_url: profile?.logo_url ?? null,
    brand_color: profile?.brand_color ?? '#e63946',
    custom_welcome_msg: profile?.custom_welcome_msg ?? '',
    preferred_font: (profile?.preferred_font as BrandingValues['preferred_font']) ?? 'sketchy',
    wobble_intensity: profile?.wobble_intensity ?? 50,
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div>
        <h1 className="font-heading text-3xl text-ink">Settings</h1>
        <p className="font-body text-sm text-ink/55 mt-1">Manage your account, billing, and portal branding.</p>
      </div>

      {didJustUpgrade && (
        <div
          className="px-5 py-4 bg-green-50 border-2 border-green-400 flex items-center gap-3"
          style={{ borderRadius: '12px 3px 12px 3px / 3px 12px 3px 12px' }}
        >
          <span className="text-xl">🎉</span>
          <div>
            <p className="font-body text-sm font-bold text-green-900">You&apos;re upgraded!</p>
            <p className="font-body text-xs text-green-700">
              Welcome to {PLANS[plan].name}. Your new limits are active immediately.
            </p>
          </div>
        </div>
      )}

      <SettingsTabs
        activeDefault={defaultTab}
        agencyName={profile?.full_name ?? ''}
        branding={branding}
        plan={plan}
        userEmail={user.email ?? ''}
        fullName={profile?.full_name ?? null}
        subStatus={profile?.stripe_subscription_status ?? null}
        hasPaidPlan={plan !== 'free'}
      />
    </div>
  )
}