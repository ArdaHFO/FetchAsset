import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendApprovalToClient, sendRejectionToClient } from '@/lib/email'

/**
 * POST /api/submissions/review
 * Body: { submissionId, action: 'approve' | 'reject', rejectionReason?: string }
 * Requires an authenticated agency session.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
    }

    const body = await request.json()
    const { submissionId, action, rejectionReason } = body as {
      submissionId?: string
      action?: 'approve' | 'reject'
      rejectionReason?: string
    }

    if (!submissionId || !action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
    }

    const admin = createAdminClient()

    // Fetch submission + a bit of context for emails
    const { data: sub } = await (admin as any)
      .from('submissions')
      .select('id, project_id, asset_request_id')
      .eq('id', submissionId)
      .single()

    if (!sub) {
      return NextResponse.json({ error: 'Submission not found.' }, { status: 404 })
    }

    const { data: project } = await (admin as any)
      .from('projects')
      .select('id, owner_id, title, client_email, client_name, magic_token')
      .eq('id', sub.project_id)
      .single()

    if (!project || project.owner_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })
    }

    await (admin as any)
      .from('submissions')
      .update({
        status: action === 'approve' ? 'approved' : 'rejected',
        rejection_reason: action === 'reject' ? (rejectionReason ?? null) : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', submissionId)

    // Fire-and-forget email to client
    if (project.client_email) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
      ;(async () => {
        try {
          const { data: assetReq } = await (admin as any)
            .from('asset_requests')
            .select('title')
            .eq('id', sub.asset_request_id)
            .single()

          const portalUrl = `${appUrl}/portal/${project.magic_token}`
          const requestTitle = assetReq?.title ?? 'Your submission'

          if (action === 'approve') {
            await sendApprovalToClient({
              clientEmail: project.client_email,
              clientName: project.client_name ?? 'Client',
              projectTitle: project.title,
              requestTitle,
              portalUrl,
            })
          } else {
            await sendRejectionToClient({
              clientEmail: project.client_email,
              clientName: project.client_name ?? 'Client',
              projectTitle: project.title,
              requestTitle,
              rejectionReason: rejectionReason ?? null,
              portalUrl,
            })
          }
        } catch (err) {
          console.error('[api/submissions/review] Email error:', err)
        }
      })()
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[api/submissions/review] Error:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
