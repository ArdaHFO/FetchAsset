import type { PlanTier } from '@/lib/supabase/types'

// ── Plan meta ────────────────────────────────────────────────────────────────

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
    tagline: 'Try it out',
    monthlyPrice: 0,
    priceEnvKey: null,
    projectLimit: 2,
    requestsPerProject: 5,
    aiAuditsPerMonth: 20,
    teamMembers: 1,
    whiteLabel: false,
    features: [
      '2 active projects',
      '5 requests per project',
      '20 AI audits / month',
      'Magic-link client portal',
      'Email notifications',
    ],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    tagline: 'For growing agencies',
    monthlyPrice: 2900,
    priceEnvKey: 'STRIPE_PRO_PRICE_ID',
    projectLimit: 20,
    requestsPerProject: -1,
    aiAuditsPerMonth: -1,
    teamMembers: 1,
    whiteLabel: false,
    features: [
      '20 active projects',
      'Unlimited requests',
      'Unlimited AI audits',
      'Magic-link client portal',
      'Email notifications',
      'Priority support',
    ],
  },
  agency: {
    id: 'agency',
    name: 'Agency',
    tagline: 'Scale without limits',
    monthlyPrice: 7900,
    priceEnvKey: 'STRIPE_AGENCY_PRICE_ID',
    projectLimit: -1,
    requestsPerProject: -1,
    aiAuditsPerMonth: -1,
    teamMembers: -1,
    whiteLabel: true,
    features: [
      'Unlimited projects',
      'Unlimited requests',
      'Unlimited AI audits',
      'White-label portal',
      'Custom domain support',
      'Team members',
      'Priority support',
    ],
  },
}

// ── Helpers ──────────────────────────────────────────────────────────────────

export function getStripePriceId(plan: PlanTier): string | null {
  const meta = PLANS[plan]
  if (!meta.priceEnvKey) return null
  return process.env[meta.priceEnvKey] ?? null
}

export function formatPrice(cents: number): string {
  if (cents === 0) return 'Free'
  return `$${(cents / 100).toFixed(0)}`
}

export function canCreateProject(plan: PlanTier, currentProjectCount: number): boolean {
  const limit = PLANS[plan].projectLimit
  return limit === -1 || currentProjectCount < limit
}

export function canAddRequest(plan: PlanTier, currentRequestCount: number): boolean {
  const limit = PLANS[plan].requestsPerProject
  return limit === -1 || currentRequestCount < limit
}
