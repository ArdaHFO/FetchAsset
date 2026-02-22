import { createAdminClient } from '@/lib/supabase/admin'
import { PLANS } from '@/lib/stripe/plans'
import type { PlanTier } from '@/lib/supabase/types'

// ── Fetch user plan ───────────────────────────────────────────────────────────

export async function getUserPlan(userId: string): Promise<PlanTier> {
  const admin = createAdminClient()
  const { data } = await (admin as any)
    .from('profiles')
    .select('plan')
    .eq('id', userId)
    .single()
  return (data?.plan as PlanTier) ?? 'free'
}

// ── Project limit check ───────────────────────────────────────────────────────

export async function assertCanCreateProject(userId: string): Promise<void> {
  const plan = await getUserPlan(userId)
  const limit = PLANS[plan].projectLimit
  if (limit === -1) return

  const admin = createAdminClient()
  const { count } = await (admin as any)
    .from('projects')
    .select('id', { count: 'exact', head: true })
    .eq('owner_id', userId)
    .in('status', ['draft', 'active'])

  if ((count ?? 0) >= limit) {
    throw new PlanLimitError(
      `Your ${PLANS[plan].name} plan allows up to ${limit} active project${limit !== 1 ? 's' : ''}. Upgrade to create more.`,
      'project_limit'
    )
  }
}

// ── Request limit check ───────────────────────────────────────────────────────

export async function assertCanAddRequest(
  userId: string,
  projectId: string
): Promise<void> {
  const plan = await getUserPlan(userId)
  const limit = PLANS[plan].requestsPerProject
  if (limit === -1) return

  const admin = createAdminClient()
  const { count } = await (admin as any)
    .from('asset_requests')
    .select('id', { count: 'exact', head: true })
    .eq('project_id', projectId)

  if ((count ?? 0) >= limit) {
    throw new PlanLimitError(
      `Your ${PLANS[plan].name} plan allows up to ${limit} request${limit !== 1 ? 's' : ''} per project. Upgrade to add more.`,
      'request_limit'
    )
  }
}

// ── AI audit limit check ─────────────────────────────────────────────────────

export async function assertCanAudit(userId: string): Promise<void> {
  const plan = await getUserPlan(userId)
  const limit = PLANS[plan].aiAuditsPerMonth
  if (limit === -1) return

  const admin = createAdminClient()
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  // Count completed AI audits this month across all user's projects
  const { count } = await (admin as any)
    .from('submissions')
    .select('id', { count: 'exact', head: true })
    .eq('ai_audit_status', 'complete')
    .gte('updated_at', startOfMonth.toISOString())
    .in(
      'project_id',
      (admin as any)
        .from('projects')
        .select('id')
        .eq('owner_id', userId)
    )

  if ((count ?? 0) >= limit) {
    throw new PlanLimitError(
      `Your ${PLANS[plan].name} plan allows ${limit} AI audit${limit !== 1 ? 's' : ''} per month. Upgrade to continue.`,
      'audit_limit'
    )
  }
}

// ── Usage stats for dashboard ─────────────────────────────────────────────────

export interface UsageStats {
  plan: PlanTier
  projects: { used: number; limit: number }       // limit -1 = unlimited
  auditsThisMonth: { used: number; limit: number }
}

export async function getUsageStats(userId: string): Promise<UsageStats> {
  const admin = createAdminClient()
  const plan = await getUserPlan(userId)
  const meta = PLANS[plan]

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const [{ count: projectCount }, { count: auditCount }] = await Promise.all([
    (admin as any)
      .from('projects')
      .select('id', { count: 'exact', head: true })
      .eq('owner_id', userId)
      .in('status', ['draft', 'active']),
    (admin as any)
      .from('submissions')
      .select('id', { count: 'exact', head: true })
      .eq('ai_audit_status', 'complete')
      .gte('updated_at', startOfMonth.toISOString())
      .in(
        'project_id',
        (admin as any).from('projects').select('id').eq('owner_id', userId)
      ),
  ])

  return {
    plan,
    projects: { used: projectCount ?? 0, limit: meta.projectLimit },
    auditsThisMonth: { used: auditCount ?? 0, limit: meta.aiAuditsPerMonth },
  }
}

// ── Error type ────────────────────────────────────────────────────────────────

export class PlanLimitError extends Error {
  constructor(
    message: string,
    public readonly code: 'project_limit' | 'request_limit' | 'audit_limit'
  ) {
    super(message)
    this.name = 'PlanLimitError'
  }
}
