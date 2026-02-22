'use client'

/**
 * PostHogProvider — initialises PostHog once on the client,
 * wrapped around the whole app via root layout.tsx.
 */

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'

const PH_KEY  = process.env.NEXT_PUBLIC_POSTHOG_KEY  ?? ''
const PH_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://eu.i.posthog.com'

function PostHogPageView() {
  const pathname     = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!pathname) return
    const url = pathname + (searchParams.toString() ? `?${searchParams}` : '')
    posthog.capture('$pageview', { '$current_url': url })
  }, [pathname, searchParams])

  return null
}

export default function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!PH_KEY) return          // skip in dev when key is not set
    posthog.init(PH_KEY, {
      api_host:              PH_HOST,
      person_profiles:       'identified_only',
      capture_pageview:      false,   // we handle manually above
      capture_pageleave:     true,
      persistence:           'localStorage',
      autocapture:           false,   // we only fire explicit events
      disable_session_recording: false,
    })
  }, [])

  return (
    <PHProvider client={posthog}>
      <PostHogPageView />
      {children}
    </PHProvider>
  )
}
