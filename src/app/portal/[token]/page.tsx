import React from 'react'
import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { PortalChecklist } from '@/components/portal/portal-checklist'
import ContactCard from '@/components/portal/ContactCard'
import type { Project, AssetRequest, Submission, Profile, PlanTier } from '@/lib/supabase/types'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: { token: string }
}

// ── Wobble radius helper ─────────────────────────────────────────
function getWobblyRadius(intensity: number): string {
  if (intensity < 10) return '6px'
  const t = intensity / 100
  const a = Math.round(80 + t * 140)
  const b = Math.round(5 + t * 40)
  const c = Math.round(70 + t * 150)
  const d = Math.round(5 + t * 10)
  const e = Math.round(5 + t * 35)
  const f = Math.round(60 + t * 165)
  return `${a}px ${b}px ${c}px ${d}px / ${e}px ${f}px ${b}px ${a}px`
}

export default async function PortalPage({ params }: PageProps) {
  const admin = createAdminClient()

  // ── Fetch project by token ─────────────────────────────────────
  const { data: projectRows } = await (admin as any)
    .rpc('get_project_by_token', { token: params.token })

  const project: Project | null =
    Array.isArray(projectRows) && projectRows.length > 0
      ? (projectRows[0] as Project)
      : null

  if (!project) notFound()

  // ── Fetch owner branding ───────────────────────────────────────
  const { data: profileRow } = await (admin as any)
    .from('profiles')
    .select('full_name, plan, logo_url, brand_color, custom_welcome_msg, preferred_font, wobble_intensity')
    .eq('id', project.owner_id)
    .single()

  const ownerProfile = profileRow as Partial<Profile> | null
  const ownerPlan: PlanTier = (ownerProfile?.plan as PlanTier) ?? 'free'
  const isPaidPlan = ownerPlan !== 'free'

  const logoUrl: string | null = ownerProfile?.logo_url ?? null
  const brandColor: string = ownerProfile?.brand_color ?? '#e63946'
  const welcomeMsg: string =
    ownerProfile?.custom_welcome_msg?.trim() ||
    project.custom_message?.trim() ||
    project.title
  const preferredFont: 'sketchy' | 'professional' =
    (ownerProfile?.preferred_font as 'sketchy' | 'professional') ?? 'sketchy'
  const wobbleIntensity: number = ownerProfile?.wobble_intensity ?? 50
  const agencyName: string = ownerProfile?.full_name ?? 'FetchAsset'
  const wobbleR = getWobblyRadius(wobbleIntensity)

  const fontHeading =
    preferredFont === 'professional'
      ? "'Inter', 'Roboto', sans-serif"
      : "'Kalam', cursive"
  const fontBody =
    preferredFont === 'professional'
      ? "'Inter', 'Roboto', sans-serif"
      : "'Patrick Hand', cursive"

  // ── Fetch asset requests ───────────────────────────────────────
  const { data: requestRows } = await (admin as any)
    .from('asset_requests')
    .select('*')
    .eq('project_id', project.id)
    .order('sort_order', { ascending: true })

  const requests: AssetRequest[] = (requestRows ?? []) as AssetRequest[]

  // ── Fetch existing submissions ─────────────────────────────────
  const { data: submissionRows } = await (admin as any)
    .from('submissions')
    .select('*')
    .eq('project_id', project.id)

  const submissions: Submission[] = (submissionRows ?? []) as Submission[]

  const submissionMap: Record<string, Submission> = {}
  for (const sub of submissions) {
    submissionMap[sub.asset_request_id] = sub
  }

  const total = requests.length
  const submitted = requests.filter((r) => submissionMap[r.id]).length
  const pct = total > 0 ? Math.round((submitted / total) * 100) : 0
  const isDone = submitted === total && total > 0

  // ── Client-visible deadline ─────────────────────────────────────
  const clientVisibleDeadline: string | null = (() => {
    if (!project.due_date) return null
    const bufferDays: number = (project as any).buffer_days ?? 0
    const d = new Date(project.due_date)
    d.setDate(d.getDate() - bufferDays)
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  })()

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ fontFamily: fontBody } as React.CSSProperties}
    >
      {/* ── Top bar ──────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-30 flex items-center justify-between px-5 py-3 border-b-2 border-ink/10"
        style={{ background: 'rgba(253,251,247,0.96)', backdropFilter: 'blur(8px)' }}
      >
        <div className="flex items-center gap-3">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt={agencyName}
              className="h-9 w-auto object-contain max-w-[160px]"
            />
          ) : (
            <span
              className="select-none"
              style={{ fontFamily: fontHeading, fontSize: '22px', fontWeight: 700, color: '#2d2d2d' }}
            >
              {agencyName === 'FetchAsset' ? (
                <>Fetch<span style={{ color: brandColor }}>Asset</span></>
              ) : agencyName}
            </span>
          )}
        </div>

        {/* Progress pill */}
        {total > 0 && (
          <div
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 border-2 border-ink/15"
            style={{ borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px' }}
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{ background: isDone ? '#22c55e' : brandColor }}
            />
            <span className="text-xs font-bold text-ink" style={{ fontFamily: fontBody }}>
              {isDone ? 'Complete 🎉' : `${pct}% · ${total - submitted} to go`}
            </span>
          </div>
        )}

        <span className="text-xs text-ink/35" style={{ fontFamily: fontBody }}>🔒 Secure</span>
      </header>

      {/* ── Main content ─────────────────────────────────────────── */}
      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-8 md:px-6 flex flex-col gap-7">

        {/* Project greeting card */}
        <div
          className="p-6 border-2 border-ink/20 bg-postit"
          style={{
            borderRadius: wobbleR,
            boxShadow: '4px 4px 0px 0px #2d2d2d',
            transform: 'rotate(-0.5deg)',
          }}
        >
          <p className="text-xs text-ink/50 uppercase tracking-wider mb-1" style={{ fontFamily: fontBody }}>
            Asset Collection Portal
          </p>
          <h1 className="text-3xl text-ink leading-tight" style={{ fontFamily: fontHeading }}>
            {welcomeMsg}
          </h1>
          {project.client_name && (
            <p className="text-sm text-ink/65 mt-1" style={{ fontFamily: fontBody }}>
              Hey, {project.client_name}! 👋
            </p>
          )}
          {clientVisibleDeadline && (
            <p className="text-sm text-ink/70 mt-3 flex items-center gap-1.5" style={{ fontFamily: fontBody }}>
              📅 <strong>Deadline:</strong>&nbsp;{clientVisibleDeadline}
            </p>
          )}
        </div>

        {/* Empty state */}
        {total === 0 && (
          <div
            className="py-12 text-center border-2 border-dashed border-ink/20"
            style={{ borderRadius: wobbleR }}
          >
            <p className="text-sm text-ink/45" style={{ fontFamily: fontBody }}>
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
            accentColor={brandColor}
            wobbleIntensity={wobbleIntensity}
            fontBody={fontBody}
            fontHeading={fontHeading}
          />
        )}
      </main>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer
        className="py-5 text-center border-t-2 border-ink/10"
        style={{ background: 'rgba(253,251,247,0.8)' }}
      >
        {!isPaidPlan ? (
          <p className="text-xs text-ink/30" style={{ fontFamily: fontBody }}>
            Powered by{' '}
            <a href="https://fetchasset.com" target="_blank" rel="noreferrer" className="hover:text-ink/60 transition-colors">
              FetchAsset
            </a>
            {' '}· Your files are encrypted in transit and at rest.
          </p>
        ) : (
          <p className="text-xs text-ink/25" style={{ fontFamily: fontBody }}>
            Your files are encrypted in transit and at rest. 🔒
          </p>
        )}
      </footer>

      {/* ── Contact Card (floats after 5 s) ──────────────────────── */}
      {project.contact_visible !== false && project.contact_method && project.contact_value && (
        <ContactCard
          method={project.contact_method as 'email' | 'whatsapp'}
          value={project.contact_value}
          agencyName={agencyName}
          projectTitle={project.title}
          brandColor={brandColor}
        />
      )}
    </div>
  )
}
