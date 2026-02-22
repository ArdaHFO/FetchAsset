import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { RequestWithSubmissions } from '@/components/dashboard/asset-request-list'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Verify ownership
    const { data: project } = await (supabase as any)
      .from('projects')
      .select('id, owner_id')
      .eq('id', params.id)
      .eq('owner_id', user.id)
      .single()

    if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Fetch requests with full submission data
    const { data: requests, error } = await (supabase as any)
      .from('asset_requests')
      .select('*, submissions(*)')
      .eq('project_id', params.id)
      .order('sort_order', { ascending: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ requests: (requests ?? []) as RequestWithSubmissions[] })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
