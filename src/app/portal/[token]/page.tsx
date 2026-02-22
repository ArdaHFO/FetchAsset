import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { PortalChecklist } from '@/components/portal/portal-checklist'
import type { Project, AssetRequest, Submission } from '@/lib/supabase/types'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: { token: string }
}

export default async function PortalPage({ params }: PageProps) {
  const admin = createAdminClient()

  // Fetch project by magic token (SECURITY DEFINER function)
  // Falls back to direct query with service role
  const { data: projectRows } = await (admin as any)
    .rpc('get_project_by_token', { token: params.token })

  const project: Project | null = Array.isArray(projectRows) && projectRows.length > 0
    ? projectRows[0] as Project
    : null

  if (!project) notFound()

  // Fetch asset requests
  const { data: requestRows } = await (admin as any)
    .from('asset_requests')
    .select('*')
    .eq('project_id', project.id)
    .order('sort_order', { ascending: true })

  const requests: AssetRequest[] = (requestRows ?? []) as AssetRequest[]

  // Fetch existing submissions for this project
  const { data: submissionRows } = await (admin as any)
    .from('submissions')
    .select('*')
    .eq('project_id', project.id)

  const submissions: Submission[] = (submissionRows ?? []) as Submission[]

  // Build a map of requestId → latest submission
  const submissionMap: Record<string, Submission> = {}
  for (const sub of submissions) {
    submissionMap[sub.asset_request_id] = sub
  }

  const total = requests.length
  const submitted = requests.filter((r) => submissionMap[r.id]).length

  return (
    <div className="flex flex-col gap-8">
      {/* Project greeting card */}
      <div
        className="p-6 border-2 border-ink/20 bg-postit"
        style={{
          borderRadius: '180px 45px 200px 35px / 40px 190px 30px 170px',
          boxShadow: '4px 4px 0px 0px #2d2d2d',
          transform: 'rotate(-0.5deg)',
        }}
      >
        <p className="font-body text-xs text-ink/50 uppercase tracking-wider mb-1">
          Asset Collection Portal
        </p>
        <h1 className="font-heading text-3xl text-ink leading-tight">
          {project.title}
        </h1>
        {project.client_name && (
          <p className="font-body text-sm text-ink/65 mt-1">
            Hey, {project.client_name}! 👋
          </p>
        )}
        {project.custom_message && (
          <p className="font-body text-sm text-ink/75 mt-3 p-3 bg-paper/60 rounded-[8px_2px_8px_2px/2px_8px_2px_8px]">
            {project.custom_message}
          </p>
        )}
      </div>

      {/* Progress bar */}
      {total > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span className="font-body text-sm text-ink/60">
              {submitted} of {total} asset{total !== 1 ? 's' : ''} submitted
            </span>
            <span className="font-body text-sm font-medium text-ink">
              {Math.round((submitted / total) * 100)}%
            </span>
          </div>
          <div
            className="h-3 w-full bg-muted overflow-hidden"
            style={{ borderRadius: '12px 2px 12px 2px / 2px 12px 2px 12px', boxShadow: '2px 2px 0px #2d2d2d' }}
          >
            <div
              className="h-full bg-ink transition-all duration-500"
              style={{
                width: `${Math.round((submitted / total) * 100)}%`,
                borderRadius: '12px 2px 12px 2px / 2px 12px 2px 12px',
              }}
            />
          </div>
          {submitted === total && total > 0 && (
            <p className="font-body text-sm text-ink/60 text-center pt-1">
              ✓ All assets submitted — thank you!
            </p>
          )}
        </div>
      )}

      {total === 0 && (
        <div
          className="py-12 text-center border-2 border-dashed border-ink/20"
          style={{ borderRadius: '20px 5px 20px 5px / 5px 20px 5px 20px' }}
        >
          <p className="font-body text-sm text-ink/45">
            No assets have been requested yet. Check back soon!
          </p>
        </div>
      )}

      {/* Interactive checklist */}
      {requests.length > 0 && (
        <PortalChecklist
          requests={requests}
          submissionMap={submissionMap}
          projectId={project.id}
          token={params.token}
          clientName={project.client_name ?? ''}
        />
      )}
    </div>
  )
}
