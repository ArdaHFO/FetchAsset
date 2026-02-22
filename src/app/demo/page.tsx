/**
 * FetchAsset — /demo
 * Full-screen interactive demo. No sign-up required.
 */

import type { Metadata } from 'next'
import DemoOverlay from '@/components/demo/DemoOverlay'

export const metadata: Metadata = {
  title: 'Interactive Demo — FetchAsset',
  description: 'Try FetchAsset without signing up. See the magic in 5 guided steps.',
  robots: { index: false }, // don't index demo in search
}

export default function DemoPage() {
  return <DemoOverlay />
}
