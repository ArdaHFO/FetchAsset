'use client'

import { useState, useCallback, useEffect } from 'react'
import { X, FileIcon, Link2, AlignLeft, Key, ListChecks, CheckCircle2, XCircle, Loader2, MessageSquare, Eye, EyeOff, Copy, Check } from 'lucide-react'
import { WobblyButton, WobblyCard } from '@/components/ui'
import { AiAuditPanel } from './ai-audit-panel'
import type { AssetRequest, Submission } from '@/lib/supabase/types'
import type { AuditResult } from '@/lib/ai/types'

interface SubmissionDrawerProps {
  submission: Submission
  request: AssetRequest
  onClose: () => void
  onReviewComplete: () => void
}

function formatBytes(bytes: number | null | undefined): string {
  if (!bytes) return 'Unknown size'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function requestTypeIcon(type: string) {
  const props = { size: 15, className: 'flex-shrink-0 text-ink/50' }
  switch (type) {
    case 'file':             return <FileIcon {...props} />
    case 'url':              return <Link2 {...props} />
    case 'text':             return <AlignLeft {...props} />
    case 'password':         return <Key {...props} />
    case 'multiple_choice':  return <ListChecks {...props} />
    default:                 return <FileIcon {...props} />
  }
}

export function SubmissionDrawer({ submission, request, onClose, onReviewComplete }: SubmissionDrawerProps) {
  const [rejecting, setRejecting] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [actionLoading, setActionLoading] = useState<'approve' | 'reject' | null>(null)
  const [rerunning, setRerunning] = useState(false)
  const [currentSubmission, setCurrentSubmission] = useState<Submission>(submission)
  const [agencyNote, setAgencyNote] = useState(submission.agency_note ?? '')
  const [noteSaving, setNoteSaving] = useState(false)
  const [noteSaved, setNoteSaved] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [valueCopied, setValueCopied] = useState(false)

  // ESC key closes drawer
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    // Prevent body scroll while drawer is open
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [onClose])

  async function copyValue(text: string) {
    await navigator.clipboard.writeText(text)
    setValueCopied(true)
    setTimeout(() => setValueCopied(false), 2000)
  }

  const auditResult = currentSubmission.ai_audit_result
    ? (currentSubmission.ai_audit_result as unknown as AuditResult)
    : null

  const refreshSubmission = useCallback(async () => {
    try {
      const res = await fetch(`/api/submissions/${currentSubmission.id}`)
      if (res.ok) {
        const data = await res.json()
        if (data.submission) setCurrentSubmission(data.submission as Submission)
      }
    } catch {}
  }, [currentSubmission.id])

  const handleSaveNote = async () => {
    setNoteSaving(true)
    setNoteSaved(false)
    try {
      await fetch(`/api/submissions/${currentSubmission.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agency_note: agencyNote }),
      })
      setNoteSaved(true)
      setTimeout(() => setNoteSaved(false), 2500)
    } finally {
      setNoteSaving(false)
    }
  }

  const handleRerun = async () => {    setRerunning(true)
    try {
      await fetch('/api/ai/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId: currentSubmission.id }),
      })
      // Poll once after 6 seconds
      await new Promise(r => setTimeout(r, 6000))
      await refreshSubmission()
    } finally {
      setRerunning(false)
    }
  }

  const handleApprove = async () => {
    setActionLoading('approve')
    try {
      const res = await fetch('/api/submissions/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId: currentSubmission.id, action: 'approve' }),
      })
      if (res.ok) {
        onReviewComplete()
        onClose()
      }
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async () => {
    if (!rejecting) { setRejecting(true); return }
    setActionLoading('reject')
    try {
      const res = await fetch('/api/submissions/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId: currentSubmission.id,
          action: 'reject',
          rejectionReason: rejectReason.trim() || undefined,
        }),
      })
      if (res.ok) {
        onReviewComplete()
        onClose()
      }
    } finally {
      setActionLoading(null)
      setRejecting(false)
    }
  }

  const isAlreadyReviewed = currentSubmission.status === 'approved' || currentSubmission.status === 'rejected'

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink/20 z-40 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className="fixed top-0 right-0 h-full w-full max-w-[520px] bg-paper z-50 flex flex-col"
        style={{ boxShadow: '-6px 0 0 0 #2d2d2d' }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-6 py-5 border-b-2 border-ink/10 flex-shrink-0">
          <div className="flex items-start gap-2">
            {requestTypeIcon(request.request_type)}
            <div>
              <h2 className="font-heading text-lg text-ink leading-tight">{request.title}</h2>
              {request.description && (
                <p className="font-body text-xs text-ink/50 mt-0.5 leading-snug">{request.description}</p>
              )}
              <div className="flex items-center gap-3 mt-1">
                {currentSubmission.client_name && (
                  <span className="font-body text-xs text-ink/45">
                    by {currentSubmission.client_name}
                  </span>
                )}
                <span className="font-body text-xs text-ink/35">
                  {new Date(currentSubmission.created_at).toLocaleDateString('en-GB', {
                    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-ink/40 hover:text-ink transition-colors flex-shrink-0 mt-0.5"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">

          {/* Submission value */}
          <WobblyCard size="sm" className="flex flex-col gap-3">
            <p className="font-body text-xs text-ink/45 uppercase tracking-wide">Submitted value</p>

            {/* File */}
            {request.request_type === 'file' && currentSubmission.file_name && (
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 bg-muted flex items-center justify-center flex-shrink-0"
                  style={{ borderRadius: '10px 2px 10px 2px / 2px 10px 2px 10px' }}
                >
                  <FileIcon size={18} className="text-ink/50" />
                </div>
                <div className="min-w-0">
                  <p className="font-body text-sm text-ink font-medium truncate">{currentSubmission.file_name}</p>
                  <p className="font-body text-xs text-ink/45">
                    {currentSubmission.file_mime_type ?? 'Unknown type'} · {formatBytes(currentSubmission.file_size_bytes)}
                  </p>
                </div>
                {currentSubmission.file_path && (
                  <a
                    href={`/api/submissions/download?path=${encodeURIComponent(currentSubmission.file_path)}`}
                    className="font-body text-xs text-blue hover:underline ml-auto flex-shrink-0"
                  >
                    Download
                  </a>
                )}
              </div>
            )}

            {/* Text / password */}
            {(request.request_type === 'text' || request.request_type === 'password') && currentSubmission.value_text && (
              <div className="flex items-center gap-2">
                <p
                  className="font-body text-sm text-ink bg-muted/40 px-3 py-2 flex-1 min-w-0"
                  style={{ borderRadius: '8px 2px 8px 2px / 2px 8px 2px 8px' }}
                >
                  {request.request_type === 'password' && !showPassword
                    ? '••••••••••••'
                    : currentSubmission.value_text}
                </p>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {request.request_type === 'password' && (
                    <button
                      onClick={() => setShowPassword(p => !p)}
                      className="p-1.5 text-ink/40 hover:text-ink transition-colors"
                      title={showPassword ? 'Hide' : 'Reveal'}
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  )}
                  <button
                    onClick={() => copyValue(currentSubmission.value_text!)}
                    className="p-1.5 text-ink/40 hover:text-ink transition-colors"
                    title="Copy to clipboard"
                  >
                    {valueCopied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            )}

            {/* URL */}
            {request.request_type === 'url' && currentSubmission.value_text && (
              <a
                href={currentSubmission.value_text}
                target="_blank"
                rel="noopener noreferrer"
                className="font-body text-sm text-blue hover:underline break-all"
              >
                {currentSubmission.value_text}
              </a>
            )}

            {/* Multiple choice */}
            {request.request_type === 'multiple_choice' && currentSubmission.value_text && (
              <span
                className="font-body text-sm text-ink bg-postit px-3 py-1 self-start"
                style={{ borderRadius: '20px 4px 20px 4px / 4px 20px 4px 20px' }}
              >
                {currentSubmission.value_text}
              </span>
            )}

            {/* Client note */}
            {currentSubmission.client_note && (
              <div className="border-t border-ink/10 pt-3">
                <p className="font-body text-xs text-ink/45 mb-1">Client note</p>
                <p className="font-body text-sm text-ink/70 italic">{currentSubmission.client_note}</p>
              </div>
            )}
          </WobblyCard>

          {/* Agency note for client */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <MessageSquare size={13} className="text-ink/50" />
              <p className="font-body text-xs text-ink/50 uppercase tracking-wide">Note for client</p>
            </div>
            <textarea
              rows={3}
              value={agencyNote}
              onChange={(e) => { setAgencyNote(e.target.value); setNoteSaved(false) }}
              placeholder="Leave a note that the client will see on their portal (e.g. feedback, next steps)…"
              className="w-full font-body text-sm text-ink bg-muted/40 border border-ink/20 px-3 py-2 resize-none focus:outline-none focus:border-ink/50 transition-colors"
              style={{ borderRadius: '8px 2px 8px 2px / 2px 8px 2px 8px' }}
            />
            <div className="flex items-center gap-3">
              <WobblyButton
                variant="secondary"
                size="sm"
                onClick={handleSaveNote}
                disabled={noteSaving}
                className="flex items-center gap-1.5"
              >
                {noteSaving
                  ? <><Loader2 size={12} className="animate-spin" /> Saving…</>
                  : noteSaved
                    ? <>✓ Saved</>
                    : <>Save note</>
                }
              </WobblyButton>
              {agencyNote && !noteSaving && (
                <button
                  className="font-body text-xs text-ink/40 hover:text-accent transition-colors"
                  onClick={() => { setAgencyNote(''); setNoteSaved(false) }}
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* AI Audit panel */}
          <AiAuditPanel
            auditStatus={currentSubmission.ai_audit_status ?? 'pending'}
            auditResult={auditResult}
            onRerun={handleRerun}
            rerunning={rerunning}
          />

          {/* Rejected reason (if already rejected) */}
          {currentSubmission.status === 'rejected' && currentSubmission.rejection_reason && (
            <div
              className="flex items-start gap-2 px-4 py-3 bg-accent/8 border border-accent/20"
              style={{ borderRadius: '10px 3px 10px 3px / 3px 10px 3px 10px' }}
            >
              <XCircle size={14} className="text-accent mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-body text-xs text-ink/50 mb-0.5">Rejection reason</p>
                <p className="font-body text-sm text-ink">{currentSubmission.rejection_reason}</p>
              </div>
            </div>
          )}

          {currentSubmission.status === 'approved' && (
            <div
              className="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-300"
              style={{ borderRadius: '10px 3px 10px 3px / 3px 10px 3px 10px' }}
            >
              <CheckCircle2 size={14} className="text-green-600 flex-shrink-0" />
              <p className="font-body text-sm text-green-800">Submission approved</p>
            </div>
          )}
        </div>

        {/* Footer — actions */}
        {!isAlreadyReviewed && (
          <div className="px-6 py-4 border-t-2 border-ink/10 flex-shrink-0">

            {/* Rejection reason input */}
            {rejecting && (
              <div className="mb-3">
                <label className="font-body text-xs text-ink/50 mb-1 block">
                  Rejection reason (optional)
                </label>
                <textarea
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  placeholder="Tell the client what to fix…"
                  rows={2}
                  className="w-full font-body text-sm text-ink bg-muted/40 border border-ink/20 px-3 py-2 resize-none focus:outline-none focus:border-ink/50 transition-colors"
                  style={{ borderRadius: '8px 2px 8px 2px / 2px 8px 2px 8px' }}
                />
              </div>
            )}

            <div className="flex items-center gap-3">
              {/* Reject */}
              <WobblyButton
                variant="danger"
                size="sm"
                onClick={handleReject}
                disabled={actionLoading !== null}
                className="flex items-center gap-1.5"
              >
                {actionLoading === 'reject'
                  ? <><Loader2 size={13} className="animate-spin" /> Rejecting…</>
                  : rejecting
                    ? <>Confirm reject</>
                    : <><XCircle size={13} /> Reject</>
                }
              </WobblyButton>

              {rejecting && (
                <button
                  onClick={() => { setRejecting(false); setRejectReason('') }}
                  className="font-body text-xs text-ink/40 hover:text-ink transition-colors"
                >
                  Cancel
                </button>
              )}

              {/* Approve */}
              <WobblyButton
                variant="primary"
                size="sm"
                onClick={handleApprove}
                disabled={actionLoading !== null || rejecting}
                className="ml-auto flex items-center gap-1.5"
              >
                {actionLoading === 'approve'
                  ? <><Loader2 size={13} className="animate-spin" /> Approving…</>
                  : <><CheckCircle2 size={13} /> Approve</>
                }
              </WobblyButton>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
