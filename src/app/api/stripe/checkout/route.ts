import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getStripe } from '@/lib/stripe'
import { getStripePriceId, PLANS } from '@/lib/stripe/plans'
import type { PlanTier, Profile } from '@/lib/supabase/types'

/**
 * POST /api/stripe/checkout?plan=pro|agency
 *
 * Creates a Stripe Checkout session and redirects to it.
 * Requires an authenticated agency session.
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    const plan = req.nextUrl.searchParams.get('plan') as PlanTier | null
    if (!plan || !['pro', 'agency'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const priceId = getStripePriceId(plan)
    if (!priceId) {
      return NextResponse.json({ error: 'Price not configured' }, { status: 500 })
    }

    const admin = createAdminClient()
    const { data: profile } = await (admin as any)
      .from('profiles')
      .select('stripe_customer_id, plan')
      .eq('id', user.id)
      .single() as { data: Pick<Profile, 'stripe_customer_id' | 'plan'> | null }

    const stripe = getStripe()
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

    // Reuse existing Stripe customer or create a new one
    let customerId: string | undefined = profile?.stripe_customer_id ?? undefined

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabaseUserId: user.id },
      })
      customerId = customer.id

      // Persist customer ID immediately
      await (admin as any)
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id)
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: {
        trial_period_days: 14,
        metadata: { supabaseUserId: user.id, plan },
      },
      success_url: `${appUrl}/settings?checkout=success`,
      cancel_url: `${appUrl}/pricing?checkout=cancelled`,
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
    })

    if (!session.url) {
      return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
    }

    return NextResponse.redirect(session.url, { status: 303 })
  } catch (err) {
    console.error('[api/stripe/checkout]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
