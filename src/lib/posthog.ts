/**
 * PostHog analytics helper — centralised event names & capture utility.
 * Import `posthog` from here (never import posthog-js directly).
 *
 * EVENTS:
 *   demo_started         – "Try Demo" button clicked
 *   demo_completed       – final step of the interactive demo reached
 *   checkout_initiated   – Subscribe / Get Started plan button clicked
 *   magic_link_sent      – agency successfully generates a magic link
 */

import posthog from 'posthog-js'

export { posthog }

/** All typed event names for autocomplete safety */
export const EVENTS = {
  DEMO_STARTED:       'demo_started',
  DEMO_COMPLETED:     'demo_completed',
  CHECKOUT_INITIATED: 'checkout_initiated',
  MAGIC_LINK_SENT:    'magic_link_sent',
} as const

export type EventName = (typeof EVENTS)[keyof typeof EVENTS]

/** Thin wrapper — no-ops server-side, safe in any context. */
export function capture(event: EventName, props?: Record<string, unknown>) {
  if (typeof window === 'undefined') return
  posthog.capture(event, props ?? {})
}
