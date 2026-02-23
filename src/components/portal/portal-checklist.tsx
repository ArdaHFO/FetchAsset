'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Clock,
  XCircle,
  Circle,
  Link2,
  KeyRound,
  FileText,
  ToggleLeft,
  Paperclip,
  Send,
  Loader2,
  RefreshCw,
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
  liveStatus,
  liveData,
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
  liveStatus?: 'pending_review' | 'approved' | 'rejected' | null
  liveData?: {
    rejection_reason?: string | null
    agency_note?: string | null
    file_name?: string | null
    file_size_bytes?: number | null
    value_text?: string | null
    client_note?: string | null
  } | null
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
  const [open, setOpen] = useState(!existing || existing.status === 'rejected')
  const [submitted, setSubmitted] = useState<boolean>(!!existing)
  const [submissionStatus, setSubmissionStatus] = useState<'pending_review' | 'approved' | 'rejected' | null>(existing?.status ?? null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [valueText, setValueText] = useState(existing?.value_text ?? '')
  const [clientNote, setClientNote] = useState(existing?.client_note ?? '')
  const [chosenChoice, setChosenChoice] = useState(existing?.value_text ?? '')
  const [editing, setEditing] = useState(false)

  // Sync from live polling data
  useEffect(() => {
    if (liveStatus && liveStatus !== submissionStatus) {
      setSubmissionStatus(liveStatus)
      setSubmitted(true)
      if (liveStatus === 'rejected') {
        setOpen(true)
        setEditing(false)
      }
    }
  }, [liveStatus]) // eslint-disable-line react-hooks/exhaustive-deps

  // Use live data for display when available
  const displayData = liveData ?? existing

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
      setSubmissionStatus('pending_review')
      setEditing(false)
      setOpen(false)
      onDone?.(request.id)
    } catch {
      setError('Network error. Please try again.')
    }
    setSubmitting(false)
  }

  function onUploadSuccess() {
    setSubmitted(true)
    setSubmissionStatus('pending_review')
    setEditing(false)
    setOpen(false)
    onDone?.(request.id)
  }

  const isRejected = submissionStatus === 'rejected'
  const isApproved = submissionStatus === 'approved'
  const isPending  = submissionStatus === 'pending_review'

  return (
    <div
      className={cn(
        'border-2 transition-all overflow-hidden',
        isApproved  ? 'border-green-300 bg-green-50/40'
        : isRejected ? 'border-accent/50 bg-accent/5'
        : submitted  ? 'border-ink/20 bg-paper'
        : 'border-ink/30 bg-paper',
        open && isRejected ? 'shadow-[4px_4px_0px_0px_#e63946]'
        : open && !isApproved && !isPending ? 'shadow-[4px_4px_0px_0px_#2d2d2d]' : ''
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
          {isApproved ? (
            <CheckCircle2 size={20} className="text-green-500" />
          ) : isRejected ? (
            <XCircle size={20} className="text-accent" />
          ) : isPending ? (
            <Clock size={20} className="text-amber-400" />
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
                isApproved ? 'text-ink/55 line-through'
                : isRejected ? 'text-accent font-medium'
                : submitted  ? 'text-ink/55'
                : 'text-ink font-medium'
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
          {isApproved && (
            <span className="font-body text-xs text-green-600 font-semibold">✅ Approved</span>
          )}
          {isRejected && (
            <span className="font-body text-xs text-accent font-semibold">❌ Rejected — please re-submit</span>
          )}
          {isPending && (
            <span className="font-body text-xs text-amber-500">⏳ Under review</span>
          )}
          {submitted && displayData?.agency_note && (
            <span className="font-body text-xs text-blue/80 flex items-center gap-1">💬 Note from agency</span>
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
          {/* Agency note */}
          {displayData?.agency_note && (
            <div
              className="flex flex-col gap-1 px-4 py-3 border-2"
              style={{ borderRadius: '12px 3px 12px 3px / 3px 12px 3px 12px', borderColor: accentColor + '40', background: accentColor + '08' }}
            >
              <p className="font-body text-xs font-semibold" style={{ color: accentColor }}>💬 Note from your agency</p>
              <p className="font-body text-sm text-ink/80">{displayData.agency_note}</p>
            </div>
          )}

          {/* Custom instructions from agency */}
          {request.custom_instructions && !submitted && (
            <div
              className="flex items-start gap-2 px-4 py-3 bg-blue/5 border border-blue/20"
              style={{ borderRadius: '10px 3px 10px 3px / 3px 10px 3px 10px' }}
            >
              <span className="text-sm flex-shrink-0 mt-0.5">💡</span>
              <div>
                <p className="font-body text-xs text-blue font-semibold mb-0.5">Instructions</p>
                <p className="font-body text-sm text-ink/70">{request.custom_instructions}</p>
              </div>
            </div>
          )}

          {/* File type/size/resolution hints */}
          {request.request_type === 'file' && !submitted && (
            <div className="flex flex-wrap items-center gap-2 font-body text-xs text-ink/45">
              {request.allowed_file_types && request.allowed_file_types.length > 0 && (
                <span className="px-2 py-0.5 bg-muted border border-ink/10" style={{ borderRadius: '6px' }}>
                  {request.allowed_file_types.map(t => t.toUpperCase()).join(', ')}
                </span>
              )}
              {request.max_file_size_mb && (
                <span className="px-2 py-0.5 bg-muted border border-ink/10" style={{ borderRadius: '6px' }}>
                  Max {request.max_file_size_mb} MB
                </span>
              )}
              {(request.min_width || request.min_height) && (
                <span className="px-2 py-0.5 bg-blue/8 border border-blue/15 text-blue/70" style={{ borderRadius: '6px' }}>
                  Min {request.min_width ?? '—'}×{request.min_height ?? '—'} px
                </span>
              )}
            </div>
          )}

          {/* Rejection reason */}
          {isRejected && displayData?.rejection_reason && (
            <div
              className="flex items-start gap-2 px-4 py-3 bg-accent/8 border border-accent/30"
              style={{ borderRadius: '10px 3px 10px 3px / 3px 10px 3px 10px' }}
            >
              <XCircle size={14} className="text-accent mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-body text-xs text-accent font-semibold mb-0.5">Feedback from agency</p>
                <p className="font-body text-sm text-ink">{displayData.rejection_reason}</p>
              </div>
            </div>
          )}
          {isRejected && (
            <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200" style={{ borderRadius: '8px 2px 8px 2px / 2px 8px 2px 8px' }}>
              <RefreshCw size={13} className="text-amber-600 flex-shrink-0" />
              <p className="font-body text-xs text-amber-700">Please update and re-submit below.</p>
            </div>
          )}

          {/* ── Submitted value preview (for approved/pending) ─── */}
          {submitted && !isRejected && !editing && (
            <div className="flex flex-col gap-2">
              <p className="font-body text-xs text-ink/45 uppercase tracking-wide">Your submission</p>
              {request.request_type === 'file' && displayData?.file_name && (
                <div className="flex items-center gap-3 px-3 py-2 bg-muted/40" style={{ borderRadius: '8px 2px 8px 2px / 2px 8px 2px 8px' }}>
                  <Paperclip size={14} className="text-ink/50 flex-shrink-0" />
                  <span className="font-body text-sm text-ink truncate">{displayData.file_name}</span>
                  {displayData.file_size_bytes && (
                    <span className="font-body text-xs text-ink/40 flex-shrink-0">
                      {(displayData.file_size_bytes / 1024 / 1024).toFixed(1)} MB
                    </span>
                  )}
                </div>
              )}
              {request.request_type !== 'file' && displayData?.value_text && (
                <div className="px-3 py-2 bg-muted/40" style={{ borderRadius: '8px 2px 8px 2px / 2px 8px 2px 8px' }}>
                  <p className="font-body text-sm text-ink">
                    {request.request_type === 'password' ? '••••••••' : displayData.value_text}
                  </p>
                </div>
              )}
              {displayData?.client_note && (
                <p className="font-body text-xs text-ink/50 italic">Note: {displayData.client_note}</p>
              )}

              {/* Edit button — only for pending_review (not approved) */}
              {isPending && (
                <button
                  onClick={() => setEditing(true)}
                  className="self-start flex items-center gap-1.5 font-body text-xs text-ink/50 hover:text-ink transition-colors mt-1"
                >
                  <RefreshCw size={11} />
                  Change submission
                </button>
              )}

              {isApproved && (
                <p className="font-body text-xs text-green-600 mt-1">
                  ✅ This item has been approved — no changes needed.
                </p>
              )}
            </div>
          )}

          {/* ── Editable form (for not-submitted, rejected, or editing) ─── */}
          {(!submitted || isRejected || editing) && (
            <>
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
                  minWidth={request.min_width}
                  minHeight={request.min_height}
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

              {/* Client note (for all non-file types) */}
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
                    : <><Send size={14} />{editing ? 'Update' : 'Submit'}</>
                  }
                </button>
              )}

              {/* Cancel edit */}
              {editing && (
                <button
                  onClick={() => setEditing(false)}
                  className="font-body text-xs text-ink/40 hover:text-ink text-center transition-colors"
                >
                  Cancel
                </button>
              )}
            </>
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
  const [liveRequests, setLiveRequests] = useState<AssetRequest[]>(requests)

  // Persist client name to localStorage so refresh doesn't lose it
  useEffect(() => {
    if (localClientName) {
      try { localStorage.setItem(`fetchasset_portal_name_${token}`, localClientName) } catch { /* ignore */ }
    }
  }, [localClientName, token])
  const [doneIds, setDoneIds] = useState<string[]>(
    () => Object.keys(submissionMap)
  )
  const [statusMap, setStatusMap] = useState<Record<string, 'pending_review' | 'approved' | 'rejected'>>(
    () => Object.fromEntries(
      Object.entries(submissionMap).map(([id, sub]) => [id, sub.status as 'pending_review' | 'approved' | 'rejected'])
    )
  )
  const [liveSubmissions, setLiveSubmissions] = useState<Record<string, {
    status: string
    rejection_reason?: string | null
    agency_note?: string | null
    file_name?: string | null
    file_size_bytes?: number | null
    value_text?: string | null
    client_note?: string | null
  }>>(
    () => Object.fromEntries(
      Object.entries(submissionMap).map(([id, sub]) => [id, sub])
    )
  )

  // Poll for status updates every 30s
  const pollStatuses = useCallback(async () => {
    try {
      const res = await fetch(`/api/portal/status?token=${encodeURIComponent(token)}&projectId=${encodeURIComponent(projectId)}`, { cache: 'no-store' })
      if (!res.ok) return
      const data = await res.json()
      if (!data.submissions) return
      const newStatusMap: Record<string, 'pending_review' | 'approved' | 'rejected'> = {}
      const newLive: Record<string, typeof liveSubmissions[string]> = {}
      const newDoneIds: string[] = []
      for (const sub of data.submissions as Array<{ asset_request_id: string; status: string; rejection_reason?: string | null; agency_note?: string | null; file_name?: string | null; file_size_bytes?: number | null; value_text?: string | null; client_note?: string | null }>) {
        newStatusMap[sub.asset_request_id] = sub.status as 'pending_review' | 'approved' | 'rejected'
        newLive[sub.asset_request_id] = sub
        newDoneIds.push(sub.asset_request_id)
      }
      setStatusMap(newStatusMap)
      setLiveSubmissions(newLive)
      setDoneIds(newDoneIds)
      if (data.requests && Array.isArray(data.requests) && data.requests.length > 0) {
        setLiveRequests(data.requests as AssetRequest[])
      }
    } catch {
      // Silent
    }
  }, [token, projectId])

  useEffect(() => {
    // Poll immediately on mount so new requests added after initial render appear instantly
    pollStatuses()
    const id = setInterval(pollStatuses, 30_000)
    return () => clearInterval(id)
  }, [pollStatuses])

  function handleDone(id: string) {
    setDoneIds((prev) => prev.includes(id) ? prev : [...prev, id])
    setStatusMap((prev) => ({ ...prev, [id]: 'pending_review' }))
  }

  const total = liveRequests.length
  const submitted = doneIds.length
  const pct = total > 0 ? Math.round((submitted / total) * 100) : 0
  const isDone = submitted === total && total > 0

  // Broadcast progress to header pill via custom DOM event
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('portal-progress', {
      detail: { total, submitted, pct, isDone },
    }))
  }, [total, submitted, pct, isDone])

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
            We've received everything. Your agency will review and get back to you soon.
          </p>
          <p className="font-body text-xs text-green-600 mt-1">
            💡 Bookmark this page — you can check back here at any time to see the status of your files.
          </p>
        </div>
      )}

      {/* ── Status summary bar ─────────────────────────────── */}
      {Object.keys(statusMap).length > 0 && (() => {
        const approvedCount = Object.values(statusMap).filter(s => s === 'approved').length
        const pendingCount = Object.values(statusMap).filter(s => s === 'pending_review').length
        const rejectedCount = Object.values(statusMap).filter(s => s === 'rejected').length
        return (
          <div className="flex flex-wrap gap-3 font-body text-sm">
            {approvedCount > 0 && <span className="text-green-600 font-semibold">✅ {approvedCount} approved</span>}
            {pendingCount > 0 && <span className="text-amber-500 font-semibold">⏳ {pendingCount} under review</span>}
            {rejectedCount > 0 && <span className="text-accent font-semibold">❌ {rejectedCount} needs re-submit</span>}
          </div>
        )
      })()}

      <h2 className="text-xl text-ink" style={{ fontFamily: fontHeading }}>Your asset list</h2>
      {liveRequests.map((req, idx) => (
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
          liveStatus={statusMap[req.id] ?? null}
          liveData={liveSubmissions[req.id] ?? null}
        />
      ))}
    </div>
  )
}
