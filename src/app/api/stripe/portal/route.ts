import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getStripe } from '@/lib/stripe'
import type { Profile } from '@/lib/supabase/types'

/**
 * POST /api/stripe/portal
 *
 * Creates a Stripe Billing Portal session and redirects to it.
 * Lets customers manage their subscription, payment method, invoices.
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    const admin = createAdminClient()
    const { data: profile } = await (admin as any)
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single() as { data: Pick<Profile, 'stripe_customer_id'> | null }

    if (!profile?.stripe_customer_id) {
      // No subscription yet — send to pricing page
      return NextResponse.redirect(new URL('/pricing', req.url), { status: 303 })
    }

    const stripe = getStripe()
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${appUrl}/settings`,
    })

    return NextResponse.redirect(session.url, { status: 303 })
  } catch (err) {
    console.error('[api/stripe/portal]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
