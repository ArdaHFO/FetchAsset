'use client'

import { useState } from 'react'
import { Copy, Check, ExternalLink, MoreVertical, Globe, Mail, Calendar, Info } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { WobblyCard, WobblyCardContent, WobblyButton } from '@/components/ui'
import { cn } from '@/lib/utils'
import type { Project, ProjectStatus } from '@/lib/supabase/types'

/** Subtract bufferDays from an ISO date string; return formatted locale string */
function computeClientDeadline(dueDateIso: string, bufferDays: number): string {
  const d = new Date(dueDateIso)
  d.setDate(d.getDate() - bufferDays)
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
}

const STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
  { value: 'draft',     label: 'Draft' },
  { value: 'active',    label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'archived',  label: 'Archived' },
]

const STATUS_STYLES: Record<ProjectStatus, string> = {
  draft:     'bg-muted text-ink/60',
  active:    'bg-blue/15 text-blue',
  completed: 'bg-ink/10 text-ink/60',
  archived:  'bg-muted/60 text-ink/40',
}

interface ProjectHeaderProps {
  project: Project
  magicUrl: string | null
}

export function ProjectHeader({ project, magicUrl }: ProjectHeaderProps) {
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const [status, setStatus] = useState<ProjectStatus>(project.status)
  const [statusOpen, setStatusOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  async function copyLink() {
    if (!magicUrl) return
    await navigator.clipboard.writeText(magicUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  async function changeStatus(newStatus: ProjectStatus) {
    setSaving(true)
    setStatusOpen(false)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createClient() as any
    await supabase.from('projects').update({ status: newStatus }).eq('id', project.id)
    setStatus(newStatus)
    setSaving(false)
    router.refresh()
  }

  return (
    <WobblyCard flavor="default" shadow="lg" radius="lg">
      <WobblyCardContent className="p-6 flex flex-col gap-4">
        {/* Top row */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
          <h1 className="font-heading text-2xl text-ink">{project.title}</h1>
          {project.notes && (
            <p className="font-body text-sm text-ink/55 mt-1">{project.notes}</p>
            )}
          </div>

          {/* Status picker */}
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setStatusOpen((o) => !o)}
              className={cn(
                'font-body text-sm px-3 py-1 border-2 border-ink/30 flex items-center gap-2',
                STATUS_STYLES[status]
              )}
              style={{ borderRadius: '20px 5px 20px 5px / 5px 20px 5px 20px' }}
              disabled={saving}
            >
              <span>{STATUS_OPTIONS.find((s) => s.value === status)?.label}</span>
              <MoreVertical size={12} />
            </button>

            {statusOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setStatusOpen(false)}
                />
                <div
                  className="absolute right-0 top-full mt-1 z-20 bg-paper border-2 border-ink/20 flex flex-col overflow-hidden"
                  style={{
                    boxShadow: '3px 3px 0px 0px #2d2d2d',
                    borderRadius: '12px 3px 12px 3px / 3px 12px 3px 12px',
                    minWidth: 140,
                  }}
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => changeStatus(opt.value)}
                      className={cn(
                        'px-4 py-2 font-body text-sm text-left hover:bg-muted transition-colors',
                        status === opt.value ? 'font-semibold text-ink' : 'text-ink/70'
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Client info */}
        {(project.client_name || project.client_email) && (
          <div className="flex flex-wrap items-center gap-4 text-sm font-body text-ink/60">
            {project.client_name && (
              <span className="flex items-center gap-1.5">
                <Globe size={13} /> {project.client_name}
              </span>
            )}
            {project.client_email && (
              <a
                href={`mailto:${project.client_email}`}
                className="flex items-center gap-1.5 hover:text-ink transition-colors"
              >
                <Mail size={13} /> {project.client_email}
              </a>
            )}
          </div>
        )}

        {/* Magic link */}
        {magicUrl && (
          <div
            className="flex items-center gap-2 p-3 bg-muted/50 border border-ink/15"
            style={{ borderRadius: '12px 3px 12px 3px / 3px 12px 3px 12px' }}
          >
            <span className="font-body text-xs text-ink/50 flex-1 truncate">{magicUrl}</span>
            <div className="flex items-center gap-1 flex-shrink-0">
              <WobblyButton
                variant="secondary"
                size="sm"
                onClick={copyLink}
                className="!py-1 !px-2.5 !text-xs"
              >
                {copied ? (
                  <><Check size={12} className="mr-1" /> Copied!</>
                ) : (
                  <><Copy size={12} className="mr-1" /> Copy link</>
                )}
              </WobblyButton>
              <WobblyButton
                variant="ghost"
                size="icon"
                asChild
                className="!p-1.5 !w-7 !h-7"
              >
                <a href={magicUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink size={12} />
                </a>
              </WobblyButton>
            </div>
          </div>
        )}

        {/* Deadline Buffer Display */}
        {project.due_date && (
          <div
            className="flex items-start gap-3 p-3 bg-[#fffde7] border-2 border-ink/20"
            style={{ borderRadius: '180px 45px 200px 35px / 40px 190px 30px 170px' }}
          >
            <Calendar size={14} className="text-ink/50 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              {(project.buffer_days ?? 0) > 0 ? (
                <>
                  <p className="font-body text-sm text-ink">
                    <span className="font-semibold">Müşteriye Söylenen:</span>{' '}
                    {computeClientDeadline(project.due_date, project.buffer_days ?? 0)}{' '}
                    <span className="text-ink/45">(Gerçek: {fmtDate(project.due_date)})</span>
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Info size={11} className="text-ink/35" />
                    <p className="font-body text-xs text-ink/45">
                      {project.buffer_days} günlük buffer aktif — müşteri daha erken tarihi görüyor.
                    </p>
                  </div>
                </>
              ) : (
                <p className="font-body text-sm text-ink">
                  <span className="font-semibold">Deadline:</span> {fmtDate(project.due_date)}
                </p>
              )}
              {project.auto_reminder && (
                <span
                  className="inline-block mt-1 font-body text-xs px-2 py-0.5 bg-green-50 text-green-700 border border-green-200"
                  style={{ borderRadius: '255px' }}
                >
                  🔔 Nudger aktif
                </span>
              )}
            </div>
          </div>
        )}

        <p className="font-body text-xs text-ink/35">
          Created {new Date(project.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </WobblyCardContent>
    </WobblyCard>
  )
}
