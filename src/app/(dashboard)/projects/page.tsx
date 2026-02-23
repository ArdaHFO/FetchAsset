import Link from 'next/link'
import { Plus, FolderKanban } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { WobblyButton } from '@/components/ui'
import { ProjectCard } from '@/components/dashboard/project-card'
import { ProjectFilters } from '@/components/dashboard/project-filters'

export const dynamic = 'force-dynamic'

const STATUS_FILTERS = ['all', 'active', 'draft', 'completed', 'archived'] as const
type StatusFilter = (typeof STATUS_FILTERS)[number]

type SortOption = 'newest' | 'oldest' | 'deadline' | 'client' | 'title'

interface PageProps {
  searchParams: { status?: string; q?: string; sort?: string }
}

export default async function ProjectsPage({ searchParams }: PageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const activeFilter = (searchParams.status ?? 'all') as StatusFilter
  const query = searchParams.q?.trim() ?? ''
  const sort = (searchParams.sort ?? 'newest') as SortOption

  // Fetch status counts for filter badges
  const { data: allRows } = await supabase
    .from('projects')
    .select('status')
    .eq('owner_id', user!.id)

  const statusCounts: Record<string, number> = {}
  for (const row of (allRows ?? []) as Array<{ status: string }>) {
    statusCounts[row.status] = (statusCounts[row.status] ?? 0) + 1
  }

  let dbQuery = supabase
    .from('projects')
    .select('*')
    .eq('owner_id', user!.id)

  if (activeFilter !== 'all') {
    dbQuery = dbQuery.eq('status', activeFilter)
  }
  if (query) {
    dbQuery = dbQuery.or(`title.ilike.%${query}%,client_name.ilike.%${query}%`)
  }

  // Apply sort
  if (sort === 'oldest') {
    dbQuery = dbQuery.order('created_at', { ascending: true })
  } else if (sort === 'deadline') {
    dbQuery = dbQuery.order('due_date', { ascending: true, nullsFirst: false })
  } else if (sort === 'client') {
    dbQuery = dbQuery.order('client_name', { ascending: true })
  } else if (sort === 'title') {
    dbQuery = dbQuery.order('title', { ascending: true })
  } else {
    dbQuery = dbQuery.order('created_at', { ascending: false })
  }

  const projectsResult = await dbQuery
  const projects = (projectsResult.data ?? []) as import('@/lib/supabase/types').Project[]

  // Fetch progress for all projects
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

  return (
    <div className="flex flex-col gap-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl text-ink">Projects</h1>
          <p className="font-body text-sm text-ink/55 mt-0.5">
            {projects.length} project{projects.length !== 1 ? 's' : ''}
            {activeFilter !== 'all' ? ` · ${activeFilter}` : ''}
          </p>
        </div>
        <WobblyButton variant="primary" size="md" asChild>
          <Link href="/projects/new">
            <Plus size={16} className="mr-2" />
            New Project
          </Link>
        </WobblyButton>
      </div>

      {/* Filter + Search bar */}
      <ProjectFilters
        currentQuery={query}
        currentStatus={activeFilter}
        currentSort={sort}
        statusCounts={statusCounts}
      />

      {/* Projects grid */}
      {projects.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-ink/20 text-center"
          style={{ borderRadius: '220px 30px 240px 20px / 25px 230px 20px 215px' }}
        >
          <FolderKanban size={40} className="text-ink/20 mb-3" />
          <p className="font-heading text-lg text-ink/50">
            {query ? `No projects matching "${query}"` : 'No projects yet'}
          </p>
          {!query && (
            <>
              <p className="font-body text-sm text-ink/35 mb-5">
                Create a project to get your magic portal link.
              </p>
              <WobblyButton variant="primary" size="sm" asChild>
                <Link href="/projects/new">
                  <Plus size={14} className="mr-1.5" />
                  Create Project
                </Link>
              </WobblyButton>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projectsWithProgress.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  )
}
