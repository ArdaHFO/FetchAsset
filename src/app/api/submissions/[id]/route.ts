import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Submission } from '@/lib/supabase/types'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Verify the submission belongs to a project owned by this user
    const { data, error } = await (supabase as any)
      .from('submissions')
      .select(`
        *,
        asset_requests (
          project_id,
          projects ( owner_id )
        )
      `)
      .eq('id', params.id)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    // Check ownership
    const ownerIdPath = data.asset_requests?.projects?.owner_id
    if (ownerIdPath && ownerIdPath !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Strip the join and return just the submission
    const { asset_requests: _ar, ...submission } = data
    return NextResponse.json({ submission: submission as Submission })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { agency_note } = body as { agency_note?: string | null }

    // Verify ownership via join
    const { data: existing } = await (supabase as any)
      .from('submissions')
      .select('id, asset_requests(projects(owner_id))')
      .eq('id', params.id)
      .single()

    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const ownerId = existing.asset_requests?.projects?.owner_id
    if (ownerId && ownerId !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { error } = await (supabase as any)
      .from('submissions')
      .update({ agency_note: agency_note?.trim() || null, updated_at: new Date().toISOString() })
      .eq('id', params.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
