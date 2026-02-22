import Link from 'next/link'
import Image from 'next/image'
import { Plus, Search } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { WobblyButton } from '@/components/ui'
import { ProjectCard } from '@/components/dashboard/project-card'

export const dynamic = 'force-dynamic'

const STATUS_FILTERS = ['all', 'active', 'draft', 'completed', 'archived'] as const
type StatusFilter = (typeof STATUS_FILTERS)[number]

interface PageProps {
  searchParams: { status?: string; q?: string }
}

export default async function ProjectsPage({ searchParams }: PageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const activeFilter = (searchParams.status ?? 'all') as StatusFilter
  const query = searchParams.q?.trim() ?? ''

  let dbQuery = supabase
    .from('projects')
    .select('*')
    .eq('owner_id', user!.id)
    .order('created_at', { ascending: false })

  if (activeFilter !== 'all') {
    dbQuery = dbQuery.eq('status', activeFilter)
  }
  if (query) {
    dbQuery = dbQuery.ilike('name', `%${query}%`)
  }

  const projectsResult = await dbQuery
  const projects = (projectsResult.data ?? []) as import('@/lib/supabase/types').Project[]

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

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2">
        {STATUS_FILTERS.map((filter) => (
          <Link
            key={filter}
            href={`/projects?status=${filter}${query ? `&q=${encodeURIComponent(query)}` : ''}`}
            className="font-body text-sm px-3 py-1.5 border-2 border-ink/30 transition-all capitalize"
            style={{
              borderRadius: '245px 18px 200px 20px / 22px 210px 14px 240px',
              background: activeFilter === filter ? '#2d2d2d' : 'transparent',
              color: activeFilter === filter ? '#fdfbf7' : '#2d2d2d99',
              boxShadow: activeFilter === filter ? '2px 2px 0px 0px #2d2d2d' : 'none',
            }}
          >
            {filter}
          </Link>
        ))}
      </div>

      {/* Projects grid */}
      {projects.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-ink/20 text-center"
          style={{ borderRadius: '220px 30px 240px 20px / 25px 230px 20px 215px' }}
        >
          <div style={{ filter: 'drop-shadow(4px 4px 0px #2d2d2d)' }} className="mb-4">
            <Image
              src="/paperclip1.png"
              alt="Mascot"
              width={90}
              height={90}
              style={{ mixBlendMode: 'multiply', objectFit: 'contain' }}
            />
          </div>
          <p className="font-heading text-lg text-ink/60">
            {query ? `No projects matching "${query}"` : "It's quiet here… Let's fetch some assets!"}
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
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  )
}
