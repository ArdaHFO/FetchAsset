'use client'

import { useState } from 'react'
import {
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Circle,
  Link2,
  KeyRound,
  FileText,
  ToggleLeft,
  Paperclip,
  Send,
  Loader2,
} from 'lucide-react'
import { FileUploader } from '@/components/portal/file-uploader'
import { WobblyButton, WobblyCard, WobblyCardContent } from '@/components/ui'
import { cn } from '@/lib/utils'
import type { AssetRequest, Submission } from '@/lib/supabase/types'

// ── Helpers ───────────────────────────────────────────────────────

const REQUEST_TYPE_CONFIG: Record<
  string,
  { icon: React.ElementType; label: string; placeholder: string }
> = {
  file:            { icon: Paperclip,   label: 'File Upload',    placeholder: '' },
  text:            { icon: FileText,    label: 'Text',           placeholder: 'Type your response…' },
  url:             { icon: Link2,       label: 'URL / Link',     placeholder: 'https://…' },
  password:        { icon: KeyRound,    label: 'Password/Token', placeholder: '••••••••' },
  multiple_choice: { icon: ToggleLeft,  label: 'Multiple Choice', placeholder: '' },
}

interface PortalChecklistProps {
  requests: AssetRequest[]
  submissionMap: Record<string, Submission>
  projectId: string
  token: string
  clientName: string
  accentColor?: string
  wobbleIntensity?: number
  fontBody?: string
  fontHeading?: string
}

// ── Single request item ───────────────────────────────────────────

function RequestItem({
  request,
  existing,
  projectId,
  token,
  clientName,
  index,
  accentColor = '#e63946',
  wobbleIntensity = 50,
  fontBody,
  fontHeading,
  onDone,
}: {
  request: AssetRequest
  existing: Submission | null
  projectId: string
  token: string
  clientName: string
  index: number
  accentColor?: string
  wobbleIntensity?: number
  fontBody?: string
  fontHeading?: string
  onDone?: (id: string) => void
}) {
  function getR(mul = 1): string {
    const intensity = wobbleIntensity * mul
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
  const [open, setOpen] = useState(!existing)
  const [submitted, setSubmitted] = useState<boolean>(!!existing)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [valueText, setValueText] = useState(existing?.value_text ?? '')
  const [clientNote, setClientNote] = useState(existing?.client_note ?? '')
  const [chosenChoice, setChosenChoice] = useState(existing?.value_text ?? '')

  const cfg = REQUEST_TYPE_CONFIG[request.request_type] ?? REQUEST_TYPE_CONFIG.text
  const Icon = cfg.icon

  async function submitValue() {
    if (!valueText.trim() && request.request_type !== 'multiple_choice') return
    if (request.request_type === 'multiple_choice' && !chosenChoice) return

    setSubmitting(true)
    setError('')

    const fd = new FormData()
    fd.append('token', token)
    fd.append('requestId', request.id)
    fd.append('projectId', projectId)
    fd.append('clientName', clientName)
    fd.append('requestType', request.request_type)
    fd.append('valueText', request.request_type === 'multiple_choice' ? chosenChoice : valueText.trim())
    if (clientNote.trim()) fd.append('clientNote', clientNote.trim())

    try {
      const res = await fetch('/api/portal/submit', { method: 'POST', body: fd })
      const json = await res.json()
      if (!res.ok || json.error) {
        setError(json.error ?? 'Submission failed.')
        setSubmitting(false)
        return
      }
      setSubmitted(true)
      setOpen(false)
      onDone?.(request.id)
    } catch {
      setError('Network error. Please try again.')
    }
    setSubmitting(false)
  }

  function onUploadSuccess() {
    setSubmitted(true)
    setOpen(false)
    onDone?.(request.id)
  }

  return (
    <div
      className={cn(
        'border-2 transition-all overflow-hidden',
        submitted
          ? 'border-ink/20 bg-paper'
          : 'border-ink/30 bg-paper',
        open && !submitted ? 'shadow-[4px_4px_0px_0px_#2d2d2d]' : ''
      )}
      style={{ borderRadius: getR(0.7), fontFamily: fontBody }}
    >
      {/* Header row */}
      <button
        className="w-full flex items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-muted/30"
        onClick={() => setOpen((o) => !o)}
      >
        {/* Status icon */}
        <span className="flex-shrink-0">
          {submitted ? (
            <CheckCircle2 size={20} style={{ color: accentColor }} />
          ) : (
            <Circle size={20} className="text-ink/25" />
          )}
        </span>

        {/* Number */}
        <span className="font-body text-xs text-ink/40 flex-shrink-0 w-5 text-center">
          {index + 1}
        </span>

        {/* Title */}
        <div className="flex-1 min-w-0 flex flex-col gap-0.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={cn(
                'font-body text-sm',
                submitted ? 'text-ink/55 line-through' : 'text-ink font-medium'
              )}
            >
              {request.title}
            </span>
            {request.required && !submitted && (
              <span
                className="font-body text-[10px] px-1.5 py-0.5"
                style={{ borderRadius: '4px 1px 4px 1px / 1px 4px 1px 4px', background: `${accentColor}18`, color: accentColor }}
              >
                required
              </span>
            )}
          </div>
          {submitted && (
            <span className="font-body text-xs text-ink/45">✓ Submitted</span>
          )}
        </div>

        {/* Type badge */}
        <span className="hidden sm:flex items-center gap-1.5 font-body text-xs text-ink/40 flex-shrink-0">
          <Icon size={12} />
          {cfg.label}
        </span>

        {/* Chevron */}
        <span className="text-ink/35 flex-shrink-0">
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </button>

      {/* Expanded form */}
      {open && (
        <div className="px-4 pb-5 pt-1 border-t border-ink/10 flex flex-col gap-4">
          {/* Description */}
          {request.description && (
            <p className="font-body text-sm text-ink/60">{request.description}</p>
          )}

          {/* File upload */}
          {request.request_type === 'file' && (
            <FileUploader
              requestId={request.id}
              projectId={projectId}
              token={token}
              clientName={clientName}
              allowedTypes={request.allowed_file_types}
              maxSizeMb={request.max_file_size_mb}
              clientNote={clientNote}
              onSuccess={onUploadSuccess}
              onError={setError}
              submitting={submitting}
              setSubmitting={setSubmitting}
            />
          )}

          {/* Text input */}
          {request.request_type === 'text' && (
            <textarea
              rows={4}
              value={valueText}
              onChange={(e) => setValueText(e.target.value)}
              placeholder={cfg.placeholder}
              disabled={submitting}
              className="w-full px-4 py-3 font-body text-sm text-ink bg-paper border-2 border-ink/40 outline-none focus:border-ink transition-all resize-none"
              style={{ borderRadius: '12px 3px 12px 3px / 3px 12px 3px 12px' }}
            />
          )}

          {/* URL input */}
          {request.request_type === 'url' && (
            <input
              type="url"
              value={valueText}
              onChange={(e) => setValueText(e.target.value)}
              placeholder={cfg.placeholder}
              disabled={submitting}
              className="w-full px-4 py-3 font-body text-sm text-ink bg-paper border-2 border-ink/40 outline-none focus:border-ink transition-all"
              style={{ borderRadius: '220px 30px 220px 30px / 30px 220px 30px 220px' }}
            />
          )}

          {/* Password/Token input */}
          {request.request_type === 'password' && (
            <input
              type="password"
              value={valueText}
              onChange={(e) => setValueText(e.target.value)}
              placeholder={cfg.placeholder}
              disabled={submitting}
              className="w-full px-4 py-3 font-body text-sm text-ink bg-paper border-2 border-ink/40 outline-none focus:border-ink transition-all"
              style={{ borderRadius: '220px 30px 220px 30px / 30px 220px 30px 220px' }}
            />
          )}

          {/* Multiple choice */}
          {request.request_type === 'multiple_choice' && request.choices && (
            <div className="flex flex-col gap-2">
              {request.choices.map((choice) => (
                <label
                  key={choice}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 border-2 cursor-pointer transition-all',
                    chosenChoice === choice
                      ? 'text-white'
                      : 'border-ink/25 hover:border-ink/50'
                  )}
                  style={{
                    borderRadius: getR(0.5),
                    borderColor: chosenChoice === choice ? accentColor : undefined,
                    background: chosenChoice === choice ? accentColor : undefined,
                  }}
                >
                  <input
                    type="radio"
                    name={`choice-${request.id}`}
                    value={choice}
                    checked={chosenChoice === choice}
                    onChange={() => setChosenChoice(choice)}
                    className="hidden"
                    disabled={submitting}
                  />
                  <span
                    className={cn(
                      'w-4 h-4 border-2 flex-shrink-0 flex items-center justify-center',
                      chosenChoice === choice ? 'border-paper bg-paper' : 'border-ink/40'
                    )}
                    style={{ borderRadius: '50%' }}
                  >
                    {chosenChoice === choice && (
                      <span className="w-2 h-2 bg-ink rounded-full" />
                    )}
                  </span>
                  <span className="font-body text-sm">{choice}</span>
                </label>
              ))}
            </div>
          )}

          {/* Client note (for all non-file types, shown below; for file, passed to uploader) */}
          {request.request_type !== 'file' && (
            <input
              type="text"
              value={clientNote}
              onChange={(e) => setClientNote(e.target.value)}
              placeholder="Add a note (optional)…"
              disabled={submitting}
              className="w-full px-4 py-2 font-body text-xs text-ink/70 bg-muted/30 border border-ink/20 outline-none focus:border-ink/50 transition-all"
              style={{ borderRadius: '8px 2px 8px 2px / 2px 8px 2px 8px' }}
            />
          )}

          {/* Error */}
          {error && (
            <p className="font-body text-sm text-accent">{error}</p>
          )}

          {/* Submit button (non-file) — branded */}
          {request.request_type !== 'file' && (
            <button
              type="button"
              onClick={submitValue}
              disabled={
                submitting ||
                (request.request_type === 'multiple_choice' ? !chosenChoice : !valueText.trim())
              }
              className="w-full flex items-center justify-center gap-2 px-4 py-3 font-body font-bold text-white border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                borderRadius: getR(0.8),
                background: accentColor,
                borderColor: accentColor,
                boxShadow: `3px 3px 0px 0px #2d2d2d`,
              }}
            >
              {submitting
                ? <Loader2 size={14} className="animate-spin" />
                : <><Send size={14} />Submit</>
              }
            </button>
          )}

          {/* Re-submit note */}
          {submitted && (
            <p className="font-body text-xs text-ink/40 text-center">
              You can update your submission by submitting again.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

// ── Checklist root ─────────────────────────────────────────────────

export function PortalChecklist({
  requests,
  submissionMap,
  projectId,
  token,
  clientName,
  accentColor = '#e63946',
  wobbleIntensity = 50,
  fontBody,
  fontHeading,
}: PortalChecklistProps) {
  const [localClientName, setLocalClientName] = useState(clientName)
  const [nameSet, setNameSet] = useState(!!clientName)
  const [doneIds, setDoneIds] = useState<string[]>(
    () => Object.keys(submissionMap)
  )

  function handleDone(id: string) {
    setDoneIds((prev) => prev.includes(id) ? prev : [...prev, id])
  }

  const total = requests.length
  const submitted = doneIds.length
  const pct = total > 0 ? Math.round((submitted / total) * 100) : 0
  const isDone = submitted === total && total > 0

  if (!nameSet) {
    return (
      <WobblyCard flavor="default" shadow="DEFAULT" radius="md" rotate="-0.5">
        <WobblyCardContent className="p-6 flex flex-col gap-4">
          <div>
            <h2 className="font-heading text-xl text-ink">Before we start</h2>
            <p className="font-body text-sm text-ink/60 mt-1">
              Enter your name so we can label your files correctly.
            </p>
          </div>
          <input
            type="text"
            value={localClientName}
            onChange={(e) => setLocalClientName(e.target.value)}
            placeholder="Your name…"
            className="w-full px-4 py-3 font-body text-sm text-ink bg-paper border-2 border-ink/50 outline-none focus:border-ink transition-all"
            style={{ borderRadius: '220px 30px 220px 30px / 30px 220px 30px 220px' }}
            onKeyDown={(e) => { if (e.key === 'Enter' && localClientName.trim()) setNameSet(true) }}
          />
          <WobblyButton
            variant="primary"
            size="md"
            className="w-full"
            disabled={!localClientName.trim()}
            onClick={() => setNameSet(true)}
          >
            Continue →
          </WobblyButton>
        </WobblyCardContent>
      </WobblyCard>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* ── Reactive progress bar ─────────────────────────── */}
      {total > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-ink/60" style={{ fontFamily: fontBody }}>
              {submitted} of {total} asset{total !== 1 ? 's' : ''} submitted
            </span>
            <span className="text-sm font-bold text-ink" style={{ fontFamily: fontBody }}>{pct}%</span>
          </div>
          <div
            className="h-4 w-full bg-muted overflow-hidden"
            style={{ borderRadius: '12px 2px 12px 2px / 2px 12px 2px 12px', boxShadow: '2px 2px 0px #2d2d2d' }}
          >
            <div
              className="h-full transition-all duration-700 ease-in-out relative"
              style={{
                width: `${pct}%`,
                background: isDone ? '#22c55e' : accentColor,
                borderRadius: '12px 2px 12px 2px / 2px 12px 2px 12px',
              }}
            >
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(255,255,255,0.5) 4px, rgba(255,255,255,0.5) 5px)',
                }}
              />
            </div>
          </div>
          {pct > 0 && !isDone && (
            <p className="text-sm text-center pt-0.5" style={{ fontFamily: fontBody, color: pct >= 60 ? '#b45309' : '#6b7280' }}>
              {pct >= 60 ? `${pct}% — Almost there! Just a little more 💪` : `${pct}% — Great start! Keep going ✨`}
            </p>
          )}
        </div>
      )}

      {/* ── All done banner ───────────────────────────────── */}
      {isDone && (
        <div
          className="p-5 border-2 border-green-400 bg-green-50 flex flex-col gap-2"
          style={{ borderRadius: '220px 30px 240px 20px / 25px 230px 20px 215px', boxShadow: '3px 3px 0px 0px #16a34a' }}
        >
          <p className="font-heading text-xl text-green-800">🎉 All done — you're amazing!</p>
          <p className="font-body text-sm text-green-700">
            We've received everything. <strong>Check your email</strong> — we've sent you a confirmation with a link to revisit your portal at any time.
          </p>
        </div>
      )}

      <h2 className="text-xl text-ink" style={{ fontFamily: fontHeading }}>Your asset list</h2>
      {requests.map((req, idx) => (
        <RequestItem
          key={req.id}
          request={req}
          existing={submissionMap[req.id] ?? null}
          projectId={projectId}
          token={token}
          clientName={localClientName}
          index={idx}
          accentColor={accentColor}
          wobbleIntensity={wobbleIntensity}
          fontBody={fontBody}
          fontHeading={fontHeading}
          onDone={handleDone}
        />
      ))}
    </div>
  )
}
