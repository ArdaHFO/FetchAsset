import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendNudgeToClient } from '@/lib/email'

/**
 * POST /api/nudge
 * Checks for projects with auto_reminder=true whose client-visible deadline
 * (due_date - buffer_days) is within 48h or 24h, and sends nudge emails
 * for any asset requests that are still missing submissions.
 *
 * Can be triggered manually from the dashboard or via a cron job.
 * Body: { projectId?: string }  — optional; if omitted, checks all owned projects.
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json().catch(() => ({}))
    const { projectId } = body as { projectId?: string }

    const admin = createAdminClient()

    // Fetch relevant projects
    let query = (admin as any)
      .from('projects')
      .select('id, title, client_name, client_email, due_date, buffer_days, auto_reminder, magic_token, owner_id')
      .eq('owner_id', user.id)
      .eq('auto_reminder', true)
      .eq('status', 'active')
      .not('due_date', 'is', null)

    if (projectId) {
      query = query.eq('id', projectId)
    }

    const { data: projects } = await query

    if (!projects?.length) {
      return NextResponse.json({ sent: 0, message: 'No auto-reminder projects found.' })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://fetchasset.com'
    const now = new Date()
    let sentCount = 0

    for (const project of projects) {
      const bufferDays: number = project.buffer_days ?? 0
      const internalDeadline = new Date(project.due_date)

      // Client-visible deadline = internal_deadline - buffer_days
      const clientDeadline = new Date(internalDeadline)
      clientDeadline.setDate(clientDeadline.getDate() - bufferDays)

      const msUntilClientDeadline = clientDeadline.getTime() - now.getTime()
      const hoursUntil = msUntilClientDeadline / (1000 * 60 * 60)

      // Only nudge if within the 48h window (but not past deadline)
      if (hoursUntil <= 0 || hoursUntil > 50) continue

      const nudgeWindow = hoursUntil <= 25 ? 24 : 48

      if (!project.client_email) continue

      // Find missing submissions
      const { data: assetRequests } = await (admin as any)
        .from('asset_requests')
        .select('id, title')
        .eq('project_id', project.id)
        .eq('required', true)

      if (!assetRequests?.length) continue

      const { data: submissions } = await (admin as any)
        .from('submissions')
        .select('asset_request_id')
        .eq('project_id', project.id)
        .in('status', ['pending_review', 'approved'])

      const submittedIds = new Set((submissions ?? []).map((s: { asset_request_id: string }) => s.asset_request_id))
      const missingItems: string[] = assetRequests
        .filter((r: { id: string; title: string }) => !submittedIds.has(r.id))
        .map((r: { id: string; title: string }) => r.title)

      if (!missingItems.length) continue

      const clientDeadlineStr = clientDeadline.toLocaleDateString('tr-TR', {
        day: 'numeric', month: 'long', year: 'numeric',
      })
      const portalUrl = `${appUrl}/portal/${project.magic_token}`

      await sendNudgeToClient({
        clientEmail: project.client_email,
        clientName: project.client_name ?? 'Client',
        projectTitle: project.title,
        clientDeadline: clientDeadlineStr,
        missingItems,
        portalUrl,
        hoursUntilDeadline: nudgeWindow,
      }).catch((err) => console.error('[api/nudge] Email send error:', err))

      sentCount++
    }

    return NextResponse.json({ sent: sentCount })
  } catch (err) {
    console.error('[api/nudge] Error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
