import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { RequestWithSubmissions } from '@/components/dashboard/asset-request-list'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Auth check with user client
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Verify ownership with user client (RLS enforced)
    const { data: project } = await (supabase as any)
      .from('projects')
      .select('id, owner_id')
      .eq('id', params.id)
      .eq('owner_id', user.id)
      .single()

    if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Use admin client to fetch submissions — bypasses RLS which blocks nested joins
    const admin = createAdminClient()
    const { data: requests, error } = await (admin as any)
      .from('asset_requests')
      .select('*, submissions(*)')
      .eq('project_id', params.id)
      .order('sort_order', { ascending: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // PostgREST returns submissions as a single object when FK is unique (one-to-one).
    // Normalize to always be an array.
    const normalized = (requests ?? []).map((r: any) => ({
      ...r,
      submissions: r.submissions
        ? Array.isArray(r.submissions) ? r.submissions : [r.submissions]
        : []
    }))

    return NextResponse.json({ requests: normalized as RequestWithSubmissions[] })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
