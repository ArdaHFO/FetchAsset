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
      '1 active project — perfect to test the magic',
      'Magic-link portal — no login needed for clients, ever',
      'Collect any file type (.doc, .pdf, .zip, you name it)',
      'AI scans every upload and flags issues',
      'Approve, reject & leave comments on submissions',
      'Automated reminder emails — stop chasing clients',
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
      '3 active projects — built for busy freelancers',
      'Unlimited file requests per project',
      'Smart AI audit — wrong files auto-rejected for you',
      'Your logo, colors & custom welcome message',
      'Remove "Powered by FetchAsset" branding',
      'Instant email alerts when files arrive',
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
      '15 active projects — scale your whole agency',
      'Unlimited AI file reviews — every upload, every time',
      'White-label portal — your brand front and center',
      'Toggle contact button for client communication',
      'Custom Branding Hub: logo, colors, tagline',
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
      'Unlimited projects & file requests — no ceilings',
      'Everything in Pro, including white-label branding',
      'Highest priority AI processing',
      'Direct founder support (real human, fast)',
      'Early access to every new feature we ship',
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