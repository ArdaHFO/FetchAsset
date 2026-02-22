/**
 * Supabase Admin Client (Service Role)
 * NEVER import this in client-side code or expose to the browser.
 * Use only in:
 *  - API route handlers (/api/*)
 *  - Server Actions (with validation)
 *  - Cron job handlers
 * Bypasses ALL Row Level Security policies.
 */
import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

// Singleton — prevents creating multiple clients in dev hot-reload
let adminClient: ReturnType<typeof createClient<Database>> | undefined

export function createAdminClient() {
  if (adminClient) return adminClient

  adminClient = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )

  return adminClient
}
