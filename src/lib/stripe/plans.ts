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
    projectLimit: 1,
    requestsPerProject: 3,
    aiAuditsPerMonth: 5,
    teamMembers: 1,
    whiteLabel: false,
    features: [
      '1 active project',
      '3 requests per project',
      '5 AI file audits / month',
      'Magic-link client portal',
      'Bulk file download',
      'Basic branding — color, font, welcome text',
      'Email submission notifications',
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
      '3 active projects',
      'Unlimited requests per project',
      '50 AI file audits / month',
      'Magic-link client portal',
      'Bulk file download',
      'Full branding — logo, background, card color, tagline',
      'Hide “Powered by FetchAsset” footer',
      'Email submission notifications',
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
      '15 active projects',
      'Unlimited requests per project',
      'Unlimited AI file audits',
      'Magic-link client portal',
      'Bulk file download',
      'Full branding + white-label portal',
      'Up to 5 team members',
      'Priority support',
    ],
  },
  agency: {
    id: 'agency',
    name: 'Agency',
    tagline: 'Elite — scale without limits',
    monthlyPrice: 12900,
    priceEnvKey: 'STRIPE_AGENCY_PRICE_ID',
    projectLimit: -1,
    requestsPerProject: -1,
    aiAuditsPerMonth: -1,
    teamMembers: -1,
    whiteLabel: true,
    features: [
      'Unlimited projects',
      'Unlimited requests per project',
      'Unlimited AI file audits',
      'Magic-link client portal',
      'Bulk file download',
      'Full branding + white-label portal',
      'Unlimited team members',
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
