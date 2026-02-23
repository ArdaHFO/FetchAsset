import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { ProjectHeader } from '@/components/dashboard/project-header'
import { ProjectDetailClient } from '@/components/dashboard/project-detail-client'
import type { RequestWithSubmissions } from '@/components/dashboard/asset-request-list'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: { id: string }
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch project
  const projectResult = await supabase
    .from('projects')
    .select('*')
    .eq('id', params.id)
    .eq('owner_id', user.id)
    .single()

  const project = projectResult.data as import('@/lib/supabase/types').Project | null
  if (!project) notFound()

  // Fetch asset requests + full submission data (admin client bypasses RLS on joined submissions)
  const admin = createAdminClient()
  const requestsResult = await (admin as any)
    .from('asset_requests')
    .select(`
      *,
      submissions ( * )
    `)
    .eq('project_id', project.id)
    .order('sort_order', { ascending: true })

  // PostgREST returns submissions as object (one-to-one FK) — normalize to array
  const requests = ((requestsResult.data ?? []) as any[]).map(r => ({
    ...r,
    submissions: r.submissions
      ? Array.isArray(r.submissions) ? r.submissions : [r.submissions]
      : []
  })) as RequestWithSubmissions[]

  const submittedCount = requests.filter(r => (r.submissions?.length ?? 0) > 0).length

  const magicUrl = project.magic_token
    ? `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/portal/${project.magic_token}`
    : null

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      {/* Back */}
      <Link
        href="/projects"
        className="font-body text-sm text-ink/50 hover:text-ink flex items-center gap-1.5 transition-colors w-fit"
      >
        <ArrowLeft size={14} />
        All Projects
      </Link>

      {/* Project header card */}
      <ProjectHeader project={project} magicUrl={magicUrl} />

      {/* Asset requests + submission drawer (client) */}
      <section>
        <ProjectDetailClient
          requests={requests}
          projectId={project.id}
          submittedCount={submittedCount}
          totalCount={requests.length}
        />
      </section>
    </div>
  )
}

