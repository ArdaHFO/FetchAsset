import Link from 'next/link'
import { FolderKanban, Plus, Clock, CheckCircle, AlertCircle, Activity } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { WobblyButton } from '@/components/ui'
import { StatCard } from '@/components/dashboard/stat-card'
import { ProjectCard } from '@/components/dashboard/project-card'

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

  // Fetch all project counts for stats
  const { data: allProjectsData } = await supabase
    .from('projects')
    .select('id, status')
    .eq('owner_id', user!.id)

  const allProjects: Array<{ id: string; status: string }> = allProjectsData ?? []

  const stats = {
    total: allProjects.length,
    active: allProjects.filter((p) => p.status === 'active').length,
    archived: allProjects.filter((p) => p.status === 'archived').length,
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

  return (
    <div className="flex flex-col gap-8 max-w-6xl">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl text-ink">
            Hey, {firstName}! 👋
          </h1>
          <p className="font-body text-sm text-ink/55 mt-1">
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
        <StatCard label="Total Projects" value={stats.total}     icon={FolderKanban} rotate="none" />
        <StatCard label="Active"         value={stats.active}    icon={Activity}     rotate="0.5"  flavor="default" />
        <StatCard label="Archived"       value={stats.archived}  icon={AlertCircle}  rotate="-0.5" />
        <StatCard label="Completed"      value={stats.completed} icon={CheckCircle}  rotate="none" />
      </div>

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
            <p className="font-body text-sm text-ink/35 mb-5">
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
            {projects.map((project) => (
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
