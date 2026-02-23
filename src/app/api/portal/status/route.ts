import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * GET /api/portal/status?token=xxx&projectId=yyy
 * Returns the current submission statuses for a portal project.
 * Used by client-side polling so the portal updates when the agency reviews/approves/rejects.
 */
export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get('token')
    const projectId = req.nextUrl.searchParams.get('projectId')

    if (!token || !projectId) {
      return NextResponse.json({ error: 'Missing token or projectId' }, { status: 400 })
    }

    const admin = createAdminClient()

    // Verify token matches the project
    const { data: projectRows } = await (admin as any).rpc('get_project_by_token', { token })
    if (!Array.isArray(projectRows) || projectRows.length === 0 || projectRows[0].id !== projectId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 403 })
    }

    // Fetch all submissions for this project
    const { data: submissions, error } = await (admin as any)
      .from('submissions')
      .select('id, asset_request_id, status, rejection_reason, agency_note, file_name, file_size_bytes, value_text, client_note')
      .eq('project_id', projectId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ submissions: submissions ?? [] })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
