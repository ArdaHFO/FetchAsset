import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { assertCanAudit, PlanLimitError } from '@/lib/stripe/limits'
import { auditSubmission } from '@/lib/ai/audit'
import type { AssetRequest, Submission } from '@/lib/supabase/types'

/**
 * POST /api/ai/audit
 * Body: { submissionId: string }
 *
 * Fetches the submission + its asset_request, runs Llama 3.3 audit,
 * saves the result back to submissions.ai_audit_result, and
 * optionally auto-approves if quality_score >= 8.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { submissionId } = body as { submissionId?: string }

    if (!submissionId) {
      return NextResponse.json({ error: 'submissionId is required.' }, { status: 400 })
    }

    const admin = createAdminClient()

    // Mark as processing
    await (admin as any)
      .from('submissions')
      .update({ ai_audit_status: 'processing' })
      .eq('id', submissionId)

    // Fetch submission
    const { data: subRow } = await (admin as any)
      .from('submissions')
      .select('*')
      .eq('id', submissionId)
      .single()

    if (!subRow) {
      return NextResponse.json({ error: 'Submission not found.' }, { status: 404 })
    }

    const submission = subRow as Submission

    // Enforce audit limit for project owner
    const { data: proj } = await (admin as any)
      .from('projects')
      .select('owner_id')
      .eq('id', submission.project_id)
      .single()
    if (proj?.owner_id) {
      try {
        await assertCanAudit(proj.owner_id)
      } catch (limitErr) {
        if (limitErr instanceof PlanLimitError) {
          await (admin as any).from('submissions').update({ ai_audit_status: 'error' }).eq('id', submissionId)
          return NextResponse.json({ error: limitErr.message, code: limitErr.code }, { status: 403 })
        }
      }
    }

    // Fetch asset request
    const { data: reqRow } = await (admin as any)
      .from('asset_requests')
      .select('*')
      .eq('id', submission.asset_request_id)
      .single()

    if (!reqRow) {
      return NextResponse.json({ error: 'Asset request not found.' }, { status: 404 })
    }

    const assetRequest = reqRow as AssetRequest

    // Run audit
    const result = await auditSubmission(assetRequest, submission)

    // Determine new status
    const newStatus = result.auto_approve && result.quality_score >= 8
      ? 'approved'
      : submission.status

    // Save result
    await (admin as any)
      .from('submissions')
      .update({
        ai_audit_result: result as unknown as Record<string, unknown>,
        ai_audit_status: 'complete',
        status: newStatus,
      })
      .eq('id', submissionId)

    return NextResponse.json({ success: true, result, submissionId })
  } catch (err) {
    console.error('[api/ai/audit] Error:', err)

    // Mark as error
    const body = await request.text().catch(() => '{}')
    const parsed = JSON.parse(body || '{}')
    if (parsed.submissionId) {
      const admin = createAdminClient()
      await (admin as any)
        .from('submissions')
        .update({ ai_audit_status: 'error' })
        .eq('id', parsed.submissionId)
    }

    const message = err instanceof Error ? err.message : 'Audit failed.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
