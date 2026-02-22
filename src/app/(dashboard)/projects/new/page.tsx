'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, ArrowRight, ArrowLeft, Check, GripVertical } from 'lucide-react'
import { WobblyButton, WobblyCard, WobblyCardContent } from '@/components/ui'
import { cn } from '@/lib/utils'

// ── Types ─────────────────────────────────────────────────────────
type RequestType = 'file' | 'text' | 'password' | 'multiple_choice' | 'url'

interface AssetItem {
  id: string
  title: string
  description: string
  request_type: RequestType
  required: boolean
}

interface ProjectForm {
  title: string
  client_name: string
  client_email: string
  notes: string
}

const REQUEST_TYPE_OPTIONS: { value: RequestType; label: string; emoji: string }[] = [
  { value: 'file',            label: 'File Upload',    emoji: '📎' },
  { value: 'text',            label: 'Text Input',     emoji: '✏️' },
  { value: 'url',             label: 'URL / Link',     emoji: '🔗' },
  { value: 'password',        label: 'Password/Token', emoji: '🔐' },
  { value: 'multiple_choice', label: 'Multiple Choice',emoji: '☑️' },
]

function uid() {
  return Math.random().toString(36).slice(2, 9)
}

// ── Step indicator ────────────────────────────────────────────────
function StepDot({ n, active, done }: { n: number; active: boolean; done: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          'w-8 h-8 flex items-center justify-center border-2 border-ink font-heading text-sm transition-all',
          done  ? 'bg-ink text-paper' : '',
          active ? 'bg-paper text-ink shadow-hard' : '',
          !active && !done ? 'bg-muted text-ink/40 border-ink/20' : ''
        )}
        style={{ borderRadius: '12px 3px 12px 3px / 3px 12px 3px 12px' }}
      >
        {done ? <Check size={14} /> : n}
      </div>
    </div>
  )
}

// ── Steps ─────────────────────────────────────────────────────────
function StepBasics({ form, onChange }: { form: ProjectForm; onChange: (f: ProjectForm) => void }) {
  function set(key: keyof ProjectForm, val: string) {
    onChange({ ...form, [key]: val })
  }
  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-heading text-xl text-ink">Project basics</h2>
      <p className="font-body text-sm text-ink/55">Give your project a name and tell us about the client.</p>

      {[
        { key: 'title'        as const, label: 'Project name *', placeholder: 'Acme Rebrand 2026', type: 'text' },
        { key: 'client_name'  as const, label: 'Client name',    placeholder: 'Acme Corp',          type: 'text' },
        { key: 'client_email' as const, label: 'Client email',   placeholder: 'hello@acme.com',     type: 'email' },
      ].map(({ key, label, placeholder, type }) => (
        <div key={key} className="flex flex-col gap-1">
          <label className="font-body text-sm text-ink/70" htmlFor={key}>{label}</label>
          <input
            id={key}
            type={type}
            value={form[key]}
            onChange={(e) => set(key, e.target.value)}
            placeholder={placeholder}
            className="w-full px-4 py-2.5 font-body text-sm text-ink bg-paper border-2 border-ink/60 outline-none focus:border-ink focus:shadow-hard transition-all"
            style={{ borderRadius: '220px 30px 240px 20px / 25px 230px 20px 215px' }}
          />
        </div>
      ))}

      <div key="notes" className="flex flex-col gap-1">
        <label className="font-body text-sm text-ink/70" htmlFor="notes">Notes</label>
        <textarea
          id="notes"
          rows={3}
          value={form.notes}
          onChange={(e) => set('notes', e.target.value)}
          placeholder="Brief notes about the project…"
          className="w-full px-4 py-2.5 font-body text-sm text-ink bg-paper border-2 border-ink/60 outline-none focus:border-ink focus:shadow-hard transition-all resize-none"
          style={{ borderRadius: '20px 5px 20px 5px / 5px 20px 5px 20px' }}
        />
      </div>
    </div>
  )
}

function StepAssets({ items, onChange }: { items: AssetItem[]; onChange: (i: AssetItem[]) => void }) {
  function add() {
      onChange([...items, { id: uid(), title: '', description: '', request_type: 'file', required: true }])
  }
  function update(id: string, patch: Partial<AssetItem>) {
    onChange(items.map((it) => (it.id === id ? { ...it, ...patch } : it)))
  }
  function remove(id: string) {
    onChange(items.filter((it) => it.id !== id))
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="font-heading text-xl text-ink">Asset checklist</h2>
        <p className="font-body text-sm text-ink/55">
          Define what files your client needs to provide.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {items.map((item, idx) => (
          <div
            key={item.id}
            className="flex gap-3 p-4 bg-muted/40 border-2 border-ink/15"
            style={{ borderRadius: '20px 5px 20px 5px / 5px 20px 5px 20px' }}
          >
            <div className="flex flex-col gap-2 flex-1 min-w-0">
              {/* Row 1: type selector + title */}
              <div className="flex gap-2">
                <select
                  value={item.request_type}
                  onChange={(e) => update(item.id, { request_type: e.target.value as RequestType })}
                  className="font-body text-xs text-ink bg-paper border-2 border-ink/40 px-2 py-1.5 outline-none"
                  style={{ borderRadius: '12px 3px 12px 3px / 3px 12px 3px 12px' }}
                >
                  {REQUEST_TYPE_OPTIONS.map(({ value, label, emoji }) => (
                    <option key={value} value={value}>{emoji} {label}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={item.title}
                  onChange={(e) => update(item.id, { title: e.target.value })}
                  placeholder={`Asset ${idx + 1} name…`}
                  className="flex-1 min-w-0 px-3 py-1.5 font-body text-sm text-ink bg-paper border-2 border-ink/40 outline-none focus:border-ink transition-all"
                  style={{ borderRadius: '12px 3px 12px 3px / 3px 12px 3px 12px' }}
                />
              </div>
              {/* Row 2: description */}
              <input
                type="text"
                value={item.description}
                onChange={(e) => update(item.id, { description: e.target.value })}
                placeholder="Instructions or requirements (optional)…"
                className="w-full px-3 py-1.5 font-body text-xs text-ink bg-paper border border-ink/25 outline-none focus:border-ink/60 transition-all"
                style={{ borderRadius: '8px 2px 8px 2px / 2px 8px 2px 8px' }}
              />
              {/* Row 3: required toggle */}
              <label className="flex items-center gap-2 cursor-pointer w-fit">
                <div
                  className={cn(
                    'w-8 h-4.5 relative border-2 border-ink/50 transition-colors',
                    item.required ? 'bg-ink' : 'bg-paper'
                  )}
                  style={{ borderRadius: '20px', height: '18px' }}
                  onClick={() => update(item.id, { required: !item.required })}
                >
                  <span
                    className="absolute top-0.5 w-3 h-3 bg-paper border border-ink/40 transition-all"
                    style={{
                      borderRadius: '50%',
                      left: item.required ? 'calc(100% - 14px)' : '1px',
                    }}
                  />
                </div>
                <span className="font-body text-xs text-ink/60">Required</span>
              </label>
            </div>

            <button
              type="button"
              onClick={() => remove(item.id)}
              className="p-1.5 text-ink/30 hover:text-accent hover:bg-accent/10 transition-colors flex-shrink-0 self-start mt-0.5"
              style={{ borderRadius: '8px 2px 8px 2px / 2px 8px 2px 8px' }}
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      <WobblyButton type="button" variant="secondary" size="sm" onClick={add} className="self-start">
        <Plus size={14} className="mr-1.5" />
        Add asset
      </WobblyButton>

      {items.length === 0 && (
        <p className="font-body text-xs text-ink/40 text-center py-4">
          No assets yet — add at least one for your client to upload.
        </p>
      )}
    </div>
  )
}

function StepReview({ form, items }: { form: ProjectForm; items: AssetItem[] }) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-heading text-xl text-ink">Review & create</h2>
      <p className="font-body text-sm text-ink/55">Check everything looks right before generating the magic link.</p>

      <div
        className="p-5 bg-muted/30 border-2 border-ink/15 flex flex-col gap-3"
        style={{ borderRadius: '20px 5px 20px 5px / 5px 20px 5px 20px' }}
      >
        <div>
          <span className="font-body text-xs text-ink/45 uppercase tracking-wider">Project</span>
          <span className="font-heading text-lg text-ink">{form.title}</span>
          {form.notes && <p className="font-body text-sm text-ink/60 mt-0.5">{form.notes}</p>}
        </div>
        {(form.client_name || form.client_email) && (
          <div>
            <span className="font-body text-xs text-ink/45 uppercase tracking-wider">Client</span>
            <p className="font-body text-sm text-ink">{form.client_name}</p>
            {form.client_email && <p className="font-body text-xs text-ink/55">{form.client_email}</p>}
          </div>
        )}
        <div>
          <span className="font-body text-xs text-ink/45 uppercase tracking-wider">
            Asset requests ({items.length})
          </span>
          {items.length === 0 ? (
            <p className="font-body text-sm text-ink/40 mt-1">None added yet.</p>
          ) : (
            <ul className="mt-1 flex flex-col gap-1">
              {items.map((it) => (
                <li key={it.id} className="font-body text-sm text-ink flex items-center gap-2">
                  <span className="text-ink/40">
                    {REQUEST_TYPE_OPTIONS.find((opt) => opt.value === it.request_type)?.emoji ?? '📦'}
                  </span>
                  {it.title || <span className="italic text-ink/35">Unnamed</span>}
                  {it.required && (
                    <span className="text-xs text-accent ml-auto">required</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main wizard ───────────────────────────────────────────────────
export default function NewProjectPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState<ProjectForm>({
    title: '', client_name: '', client_email: '', notes: '',
  })
  const [assets, setAssets] = useState<AssetItem[]>([])

  function canAdvance() {
    if (step === 1) return form.title.trim().length > 0
    return true
  }

  async function handleCreate() {
    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title.trim(),
          client_name: form.client_name.trim(),
          client_email: form.client_email.trim(),
          notes: form.notes.trim() || null,
          assets: assets.filter((a) => a.title.trim()).map((a, i) => ({
            title: a.title.trim(),
            description: a.description.trim() || null,
            request_type: a.request_type,
            required: a.required,
            sort_order: i,
          })),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (res.status === 403) {
          // Plan limit hit
          setError(data.error + ' → Upgrade your plan in Settings.')
        } else {
          setError(data.error ?? 'Failed to create project.')
        }
        setSubmitting(false)
        return
      }

      router.push(`/projects/${data.project.id}`)
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      {/* Back link */}
      <button
        onClick={() => router.back()}
        className="font-body text-sm text-ink/50 hover:text-ink mb-6 flex items-center gap-1 transition-colors"
      >
        <ArrowLeft size={14} /> Back
      </button>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map((n) => (
          <div key={n} className="flex items-center gap-2">
            <StepDot n={n} active={step === n} done={step > n} />
            {n < 3 && (
              <div
                className={cn(
                  'h-0.5 w-10 transition-colors',
                  step > n ? 'bg-ink' : 'bg-ink/20'
                )}
              />
            )}
          </div>
        ))}
        <span className="font-body text-xs text-ink/40 ml-2">
          Step {step} of 3
        </span>
      </div>

      {/* Card */}
      <WobblyCard flavor="default" shadow="lg" radius="lg" rotate="-0.5">
        <WobblyCardContent className="p-7">
          {step === 1 && <StepBasics form={form} onChange={setForm} />}
          {step === 2 && <StepAssets items={assets} onChange={setAssets} />}
          {step === 3 && <StepReview form={form} items={assets} />}

          {error && (
            <p className="mt-4 font-body text-sm text-accent">{error}</p>
          )}

          {/* Nav */}
          <div className="flex items-center justify-between mt-8">
            {step > 1 ? (
              <WobblyButton variant="secondary" size="sm" onClick={() => setStep((s) => s - 1)}>
                <ArrowLeft size={14} className="mr-1.5" /> Back
              </WobblyButton>
            ) : (
              <span />
            )}

            {step < 3 ? (
              <WobblyButton
                variant="primary"
                size="sm"
                disabled={!canAdvance()}
                onClick={() => setStep((s) => s + 1)}
              >
                Next <ArrowRight size={14} className="ml-1.5" />
              </WobblyButton>
            ) : (
              <WobblyButton
                variant="primary"
                size="md"
                loading={submitting}
                onClick={handleCreate}
              >
                {!submitting && (
                  <>
                    Create Project ✦
                  </>
                )}
              </WobblyButton>
            )}
          </div>
        </WobblyCardContent>
      </WobblyCard>
    </div>
  )
}
