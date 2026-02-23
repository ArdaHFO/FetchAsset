import Link from 'next/link'
import { FolderKanban, Plus, Clock, CheckCircle, AlertCircle, Activity, FileCheck, Inbox } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { WobblyButton } from '@/components/ui'
import { StatCard } from '@/components/dashboard/stat-card'
import { ProjectCard } from '@/components/dashboard/project-card'
import { UsageMeter } from '@/components/dashboard/UsageMeter'
import { ActivityFeed, type ActivityItem } from '@/components/dashboard/activity-feed'
import { getUsageStats } from '@/lib/stripe/limits'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch projects
  const projectsResult = await supabase
    .from('projects')
    .select('*')
    .eq('owner_id', user!.id)
    .order('created_at', { ascending: false })
    .limit(6)

  const projects = (projectsResult.data ?? []) as import('@/lib/supabase/types').Project[]

  // Fetch progress for recent projects (asset_requests count + submissions count)
  const admin = createAdminClient()
  const projectIds = projects.map(p => p.id)
  let progressMap: Record<string, { total: number; completed: number }> = {}

  if (projectIds.length > 0) {
    const { data: reqRows } = await (admin as any)
      .from('asset_requests')
      .select('id, project_id')
      .in('project_id', projectIds)

    const { data: subRows } = await (admin as any)
      .from('submissions')
      .select('asset_request_id, project_id')
      .in('project_id', projectIds)

    const requests = reqRows ?? []
    const submissions = subRows ?? []

    for (const pid of projectIds) {
      const total = requests.filter((r: { project_id: string }) => r.project_id === pid).length
      const submittedRequestIds = new Set(
        submissions.filter((s: { project_id: string }) => s.project_id === pid).map((s: { asset_request_id: string }) => s.asset_request_id)
      )
      progressMap[pid] = { total, completed: submittedRequestIds.size }
    }
  }

  const projectsWithProgress = projects.map(p => ({
    ...p,
    progress: progressMap[p.id] ?? { total: 0, completed: 0 },
  }))

  // Fetch all project counts for stats
  const { data: allProjectsData } = await supabase
    .from('projects')
    .select('id, status')
    .eq('owner_id', user!.id)

  const allProjects: Array<{ id: string; status: string }> = allProjectsData ?? []

  // Fetch ALL submissions across user projects for activity feed + stats
  const allProjectIds = allProjects.map(p => p.id)
  let allSubmissions: Array<{
    id: string; created_at: string; updated_at: string; client_name: string;
    file_name: string | null; status: string; ai_audit_status: string | null;
    value_text: string | null; project_id: string; asset_request_id: string;
  }> = []
  let allRequestsMap: Record<string, { title: string; request_type: string }> = {}

  if (allProjectIds.length > 0) {
    const { data: subRows } = await (admin as any)
      .from('submissions')
      .select('id, created_at, updated_at, client_name, file_name, status, ai_audit_status, value_text, project_id, asset_request_id')
      .in('project_id', allProjectIds)
      .order('updated_at', { ascending: false })
      .limit(20)

    allSubmissions = subRows ?? []

    // Fetch request titles for the activity items
    if (allSubmissions.length > 0) {
      const requestIds = Array.from(new Set(allSubmissions.map(s => s.asset_request_id)))
      const { data: reqTitles } = await (admin as any)
        .from('asset_requests')
        .select('id, title, request_type')
        .in('id', requestIds)

      for (const r of (reqTitles ?? []) as Array<{ id: string; title: string; request_type: string }>) {
        allRequestsMap[r.id] = { title: r.title, request_type: r.request_type }
      }
    }
  }

  // Count pending review across all projects
  let pendingReviewCount = 0
  let totalFilesReceived = 0
  if (allProjectIds.length > 0) {
    const { count: pendingCount } = await (admin as any)
      .from('submissions')
      .select('id', { count: 'exact', head: true })
      .in('project_id', allProjectIds)
      .eq('status', 'pending_review')
    pendingReviewCount = pendingCount ?? 0

    const { count: totalCount } = await (admin as any)
      .from('submissions')
      .select('id', { count: 'exact', head: true })
      .in('project_id', allProjectIds)
    totalFilesReceived = totalCount ?? 0
  }

  // Build project title map for activity feed
  const projectTitleMap: Record<string, string> = {}
  for (const p of allProjects) {
    projectTitleMap[p.id] = (p as any).title ?? 'Untitled'
  }
  // Also fetch titles for projects not in the recent 6 if needed
  for (const p of projects) {
    projectTitleMap[p.id] = p.title
  }

  // Build activity feed items
  const activityItems: ActivityItem[] = allSubmissions.map(sub => ({
    id: sub.id,
    submissionId: sub.id,
    timestamp: sub.updated_at,
    clientName: sub.client_name,
    requestTitle: allRequestsMap[sub.asset_request_id]?.title ?? 'Asset',
    requestType: allRequestsMap[sub.asset_request_id]?.request_type ?? 'file',
    projectId: sub.project_id,
    projectTitle: projectTitleMap[sub.project_id] ?? 'Project',
    status: sub.status,
    aiAuditStatus: sub.ai_audit_status,
    fileName: sub.file_name,
  }))

  const stats = {
    total: allProjects.length,
    active: allProjects.filter((p) => p.status === 'active').length,
    pendingReview: pendingReviewCount,
    filesReceived: totalFilesReceived,
    completed: allProjects.filter((p) => p.status === 'completed').length,
  }

  // Fetch profile for name
  const profileResult = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user!.id)
    .single()

  const profileData = profileResult.data as { full_name: string | null } | null
  const firstName = profileData?.full_name?.split(' ')[0] ?? user!.email?.split('@')[0] ?? 'there'

  // Fetch usage stats
  const usageStats = await getUsageStats(user!.id)

  return (
    <div className="flex flex-col gap-8 max-w-6xl">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl text-ink">
            Hey, {firstName}! 👋
          </h1>
          <p className="font-body text-sm text-ink/70 mt-1">
            Here&apos;s what&apos;s happening with your projects today.
          </p>
        </div>
        <WobblyButton variant="primary" size="md" asChild>
          <Link href="/projects/new">
            <Plus size={16} className="mr-2" />
            New Project
          </Link>
        </WobblyButton>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Projects" value={stats.total}         icon={FolderKanban} rotate="none" />
        <StatCard label="Active"         value={stats.active}        icon={Activity}     rotate="0.5"  flavor="default" />
        <StatCard label="Pending Review" value={stats.pendingReview} icon={Inbox}        rotate="-0.5" flavor="postit" />
        <StatCard label="Files Received" value={stats.filesReceived} icon={FileCheck}    rotate="none" />
      </div>

      {/* Usage meter */}
      <UsageMeter stats={usageStats} />

      {/* Activity Feed */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-xl text-ink">Recent Activity</h2>
          {activityItems.length > 0 && (
            <span className="font-body text-xs text-ink/40">
              Showing last {activityItems.length} events
            </span>
          )}
        </div>
        <div
          className="p-5 border-2 border-ink/15 bg-paper"
          style={{
            borderRadius: '220px 30px 240px 20px / 25px 230px 20px 215px',
            boxShadow: '3px 3px 0px 0px #2d2d2d',
          }}
        >
          <ActivityFeed items={activityItems} />
        </div>
      </section>

      {/* Recent projects */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-xl text-ink">Recent Projects</h2>
          <WobblyButton variant="ghost" size="sm" asChild>
            <Link href="/projects">
              View all
            </Link>
          </WobblyButton>
        </div>

        {projects.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-ink/20 text-center"
            style={{ borderRadius: '220px 30px 240px 20px / 25px 230px 20px 215px' }}
          >
            <FolderKanban size={36} className="text-ink/20 mb-3" />
            <p className="font-heading text-lg text-ink/50">No projects yet</p>
            <p className="font-body text-sm text-ink/60 mb-5">
              Create your first project and generate a magic link for your client.
            </p>
            <WobblyButton variant="primary" size="sm" asChild>
              <Link href="/projects/new">
                <Plus size={14} className="mr-1.5" />
                Create Project
              </Link>
            </WobblyButton>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projectsWithProgress.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </section>

      {/* Quick tips (only shown when no projects) */}
      {stats.total === 0 && (
        <section
          className="p-6 bg-postit border-2 border-ink/15"
          style={{
            borderRadius: '180px 45px 200px 35px / 40px 190px 30px 170px',
            boxShadow: '4px 4px 0px 0px #2d2d2d',
            transform: 'rotate(-0.5deg)',
          }}
        >
          <h3 className="font-heading text-lg text-ink mb-3">How FetchAsset works ✦</h3>
          <ol className="font-body text-sm text-ink/70 flex flex-col gap-2 list-decimal list-inside">
            <li>Create a project and define the assets you need.</li>
            <li>Share the magic portal link with your client.</li>
            <li>Client uploads files — Llama 3.3 audits and labels them.</li>
            <li>Review, approve, and download everything in one place.</li>
          </ol>
        </section>
      )}
    </div>
  )
}
