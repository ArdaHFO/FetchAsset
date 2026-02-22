'use client'

import { useState } from 'react'
import { Copy, Check, ExternalLink, MoreVertical, Globe, Mail, Calendar, Info, MessageCircle, Pencil, X, Save, ToggleLeft, ToggleRight } from 'lucide-react'
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

  // ── Contact Support state ──────────────────────────────────────
  const [contactVisible, setContactVisible] = useState<boolean>(project.contact_visible ?? true)
  const [contactMethod, setContactMethod] = useState<'email' | 'whatsapp' | ''>(project.contact_method ?? '')
  const [contactValue, setContactValue] = useState<string>(project.contact_value ?? '')
  const [contactEditing, setContactEditing] = useState(false)
  const [contactSaving, setContactSaving] = useState(false)

  async function toggleContactVisible() {
    const next = !contactVisible
    setContactVisible(next)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createClient() as any
    await supabase.from('projects').update({ contact_visible: next }).eq('id', project.id)
    router.refresh()
  }

  async function saveContactInfo() {
    setContactSaving(true)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createClient() as any
    await supabase.from('projects').update({
      contact_method: contactMethod || null,
      contact_value: contactValue.trim() || null,
    }).eq('id', project.id)
    setContactSaving(false)
    setContactEditing(false)
    router.refresh()
  }

  function cancelContactEdit() {
    setContactMethod(project.contact_method ?? '')
    setContactValue(project.contact_value ?? '')
    setContactEditing(false)
  }

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

        {/* ── Contact Support panel ─────────────────────────── */}
        <div
          className="flex flex-col gap-3 p-4 border-2 border-ink/10 bg-[#f0fbff]"
          style={{ borderRadius: '20px 5px 20px 5px / 5px 20px 5px 20px' }}
        >
          {/* Header row */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <MessageCircle size={14} className="text-ink/50" />
              <span className="font-body text-sm font-semibold text-ink">Client Support</span>
              {contactMethod && contactValue ? (
                <span
                  className="font-body text-xs px-2 py-0.5 border"
                  style={{
                    borderRadius: '255px',
                    background: contactVisible ? '#dcfce7' : '#f3f4f6',
                    color: contactVisible ? '#16a34a' : '#6b7280',
                    borderColor: contactVisible ? '#bbf7d0' : '#e5e7eb',
                  }}
                >
                  {contactVisible ? '👁 Visible to client' : '🙈 Hidden from client'}
                </span>
              ) : (
                <span className="font-body text-xs text-ink/35">Not configured</span>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {contactMethod && contactValue && (
                <button
                  type="button"
                  onClick={toggleContactVisible}
                  className="flex items-center gap-1.5 font-body text-xs text-ink/60 hover:text-ink transition-colors"
                  title={contactVisible ? 'Hide from client' : 'Show to client'}
                >
                  {contactVisible
                    ? <ToggleRight size={18} className="text-green-600" />
                    : <ToggleLeft size={18} className="text-ink/30" />}
                </button>
              )}
              {!contactEditing ? (
                <button
                  type="button"
                  onClick={() => setContactEditing(true)}
                  className="flex items-center gap-1 font-body text-xs px-2.5 py-1 border-2 border-ink/20 hover:border-ink text-ink/60 hover:text-ink transition-all bg-paper"
                  style={{ borderRadius: '180px 45px 200px 35px / 40px 190px 30px 170px', boxShadow: '2px 2px 0 0 #2d2d2d' }}
                >
                  <Pencil size={11} /> Edit
                </button>
              ) : (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={saveContactInfo}
                    disabled={contactSaving}
                    className="flex items-center gap-1 font-body text-xs px-2.5 py-1 border-2 border-ink bg-ink text-paper transition-all"
                    style={{ borderRadius: '180px 45px 200px 35px / 40px 190px 30px 170px', boxShadow: '2px 2px 0 0 #2d2d2d' }}
                  >
                    <Save size={11} /> {contactSaving ? 'Saving…' : 'Save'}
                  </button>
                  <button
                    type="button"
                    onClick={cancelContactEdit}
                    className="flex items-center gap-1 font-body text-xs px-2 py-1 border-2 border-ink/20 text-ink/50 hover:text-ink transition-all"
                    style={{ borderRadius: '180px 45px 200px 35px / 40px 190px 30px 170px' }}
                  >
                    <X size={11} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Edit form */}
          {contactEditing && (
            <div className="flex flex-col gap-3">
              <div className="flex gap-2">
                {(['', 'email', 'whatsapp'] as const).map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setContactMethod(val)}
                    className={cn(
                      'font-body text-xs px-3 py-1.5 border-2 transition-all',
                      contactMethod === val
                        ? 'bg-ink text-paper border-ink'
                        : 'bg-paper text-ink border-ink/25 hover:border-ink'
                    )}
                    style={{ borderRadius: '180px 45px 200px 35px / 40px 190px 30px 170px', boxShadow: '2px 2px 0 0 #2d2d2d' }}
                  >
                    {val === '' ? 'None' : val === 'email' ? '✉️ Email' : '📱 WhatsApp'}
                  </button>
                ))}
              </div>
              {contactMethod !== '' && (
                <input
                  type={contactMethod === 'email' ? 'email' : 'tel'}
                  value={contactValue}
                  onChange={(e) => setContactValue(e.target.value)}
                  placeholder={contactMethod === 'whatsapp' ? '+44 7700 900123' : 'you@studio.com'}
                  className="w-full px-3 py-2 font-body text-sm text-ink bg-paper border-2 border-ink/60 outline-none focus:border-ink transition-all"
                  style={{ borderRadius: '220px 30px 240px 20px / 25px 230px 20px 215px' }}
                />
              )}
            </div>
          )}

          {/* Display row (not editing) */}
          {!contactEditing && contactMethod && contactValue && (
            <div className="flex items-center gap-2 font-body text-sm text-ink/70">
              <span>{contactMethod === 'whatsapp' ? '📱' : '✉️'}</span>
              <span>{contactValue}</span>
            </div>
          )}
          {!contactEditing && (!contactMethod || !contactValue) && (
            <p className="font-body text-xs text-ink/40">
              Click &ldquo;Edit&rdquo; to add a contact method — your client will see a &ldquo;Got a question?&rdquo; card in their portal.
            </p>
          )}
        </div>

        <p className="font-body text-xs text-ink/35">
          Created {new Date(project.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </WobblyCardContent>
    </WobblyCard>
  )
}
