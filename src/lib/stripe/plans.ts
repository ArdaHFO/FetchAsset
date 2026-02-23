import type { PlanTier } from '@/lib/supabase/types'

//  Plan meta 

export interface PlanMeta {
  id: PlanTier
  name: string
  tagline: string
  monthlyPrice: number            // USD cents (0 = free)
  priceEnvKey: string | null      // env var holding Stripe Price ID
  projectLimit: number            // -1 = unlimited
  requestsPerProject: number      // -1 = unlimited
  aiAuditsPerMonth: number        // -1 = unlimited
  teamMembers: number             // -1 = unlimited
  whiteLabel: boolean
  features: string[]
}

export const PLANS: Record<PlanTier, PlanMeta> = {
  free: {
    id: 'free',
    name: 'Free',
    tagline: 'Perfect for your first client',
    monthlyPrice: 0,
    priceEnvKey: null,
    projectLimit: 1,
    requestsPerProject: 3,
    aiAuditsPerMonth: 5,
    teamMembers: 1,
    whiteLabel: false,
    features: [
      '1 project + 3 file requests',
      'Magic-link portal  no login required for clients',
      'AI reviews every uploaded file (5 / mo)',
      'Approve, reject & comment on submissions',
      'Bulk download all files with one click',
      'Nudge clients with reminder emails',
      'Basic portal branding (color, font, welcome text)',
      'Data export (JSON)',
    ],
  },
  solo: {
    id: 'solo',
    name: 'Solo',
    tagline: 'For freelancers & solopreneurs',
    monthlyPrice: 1900,
    priceEnvKey: 'STRIPE_SOLO_PRICE_ID',
    projectLimit: 3,
    requestsPerProject: -1,
    aiAuditsPerMonth: 50,
    teamMembers: 1,
    whiteLabel: false,
    features: [
      '3 projects + unlimited file requests',
      'Magic-link portal  no login required for clients',
      'AI reviews every uploaded file (50 / mo)',
      'Approve, reject & comment on submissions',
      'Bulk download all files with one click',
      'Nudge clients with reminder emails',
      'Full branding: logo, colors, tagline',
      'Remove "Powered by FetchAsset" footer',
      'Data export (JSON)',
    ],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    tagline: 'Best value for growing agencies',
    monthlyPrice: 4900,
    priceEnvKey: 'STRIPE_PRO_PRICE_ID',
    projectLimit: 15,
    requestsPerProject: -1,
    aiAuditsPerMonth: -1,
    teamMembers: 5,
    whiteLabel: true,
    features: [
      '15 projects + unlimited file requests',
      'Magic-link portal  no login required for clients',
      'Unlimited AI file reviews',
      'Approve, reject & comment on submissions',
      'Bulk download all files with one click',
      'Nudge clients with reminder emails',
      'Full branding + white-label portal',
      'Custom instructions & file hints per request',
      'Priority email support',
    ],
  },
  agency: {
    id: 'agency',
    name: 'Agency',
    tagline: 'Built to scale  no ceilings',
    monthlyPrice: 12900,
    priceEnvKey: 'STRIPE_AGENCY_PRICE_ID',
    projectLimit: -1,
    requestsPerProject: -1,
    aiAuditsPerMonth: -1,
    teamMembers: -1,
    whiteLabel: true,
    features: [
      'Unlimited projects & file requests',
      'Magic-link portal  no login required for clients',
      'Unlimited AI file reviews',
      'Approve, reject & comment on submissions',
      'Bulk download all files with one click',
      'Nudge clients with reminder emails',
      'Full branding + white-label portal',
      'Custom instructions & file hints per request',
      'Priority email support',
    ],
  },
}

//  Helpers 

export function getStripePriceId(plan: PlanTier): string | null {
  const meta = PLANS[plan]
  if (!meta.priceEnvKey) return null
  return process.env[meta.priceEnvKey] ?? null
}

export function formatPrice(cents: number): string {
  if (cents === 0) return 'Free'
  return `$${cents / 100}`
}

export const PLAN_ORDER: PlanTier[] = ['free', 'solo', 'pro', 'agency']