import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const admin = createAdminClient()

  // Fetch all user projects
  const { data: projects } = await (admin as any)
    .from('projects')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })

  const projectIds = (projects ?? []).map((p: { id: string }) => p.id)

  let requests: unknown[] = []
  let submissions: unknown[] = []

  if (projectIds.length > 0) {
    const { data: reqRows } = await (admin as any)
      .from('asset_requests')
      .select('*')
      .in('project_id', projectIds)
    requests = reqRows ?? []

    const { data: subRows } = await (admin as any)
      .from('submissions')
      .select('id, created_at, updated_at, asset_request_id, project_id, client_name, value_text, file_name, file_size_bytes, file_mime_type, status, ai_audit_status, client_note, agency_note')
      .in('project_id', projectIds)
    submissions = subRows ?? []
  }

  const exportData = {
    exported_at: new Date().toISOString(),
    account_email: user.email,
    projects: (projects ?? []).map((p: Record<string, unknown>) => ({
      ...p,
      asset_requests: requests.filter((r: any) => r.project_id === p.id).map((r: any) => ({
        ...r,
        submissions: submissions.filter((s: any) => s.asset_request_id === r.id),
      })),
    })),
  }

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="fetchasset-export-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  })
}
