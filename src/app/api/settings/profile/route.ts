import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { ProfileUpdate } from '@/lib/supabase/types'

export async function PATCH(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const body = await req.json()
  const updates: ProfileUpdate = {}

  // Only allow specific fields
  if (typeof body.full_name === 'string') {
    const name = body.full_name.trim()
    if (name.length < 1 || name.length > 100) {
      return NextResponse.json({ error: 'Name must be 1-100 characters' }, { status: 400 })
    }
    updates.full_name = name
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('profiles')
    .update(updates)
    .eq('id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  // Delete all user data in order: submissions → asset_requests → projects → profile
  // Then sign out. We use the admin client to bypass RLS.
  const { createAdminClient } = await import('@/lib/supabase/admin')
  const admin = createAdminClient()

  // Get all project IDs
  const { data: projects } = await (admin as any)
    .from('projects')
    .select('id')
    .eq('owner_id', user.id)

  const projectIds = (projects ?? []).map((p: { id: string }) => p.id)

  if (projectIds.length > 0) {
    // Delete submissions for these projects
    await (admin as any).from('submissions').delete().in('project_id', projectIds)
    // Delete asset_requests for these projects
    await (admin as any).from('asset_requests').delete().in('project_id', projectIds)
    // Delete notifications
    await (admin as any).from('notifications').delete().eq('profile_id', user.id)
  }

  // Delete projects
  await (admin as any).from('projects').delete().eq('owner_id', user.id)
  // Delete profile
  await (admin as any).from('profiles').delete().eq('id', user.id)
  // Delete auth user
  await (admin as any).auth.admin.deleteUser(user.id)

  // Sign out
  await supabase.auth.signOut()

  return NextResponse.json({ ok: true })
}
