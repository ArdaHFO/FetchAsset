/**
 * Supabase Browser Client
 * Use in Client Components ('use client').
 * Creates a singleton so it's not re-instantiated on every render.
 */
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './types'

let client: ReturnType<typeof createBrowserClient<Database>> | undefined

export function createClient() {
  if (client) return client

  client = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  return client
}
