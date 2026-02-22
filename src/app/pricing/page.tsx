import type { Metadata } from 'next'
import PricingContent from './PricingContent'

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Simple, transparent pricing for freelancers and agencies. Start free, upgrade when you grow.',
  alternates: { canonical: '/pricing' },
  openGraph: {
    title: 'FetchAsset Pricing — Solo, Pro & Agency Plans',
    description: 'From $19/mo for freelancers to $129/mo for high-volume agencies. All plans include AI-powered file audits and magic-link client portals.',
    url: '/pricing',
  },
}

export default function PricingPage() {
  return <PricingContent />
}
