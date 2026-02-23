'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, FileCheck2, FileX2, FileClock, File, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { WobblyButton } from '@/components/ui'
import { cn } from '@/lib/utils'
import type { AssetRequest, RequestType, Submission } from '@/lib/supabase/types'

type SubmissionStatus = 'pending' | 'approved' | 'rejected' | 'reviewing'

export interface RequestWithSubmissions extends AssetRequest {
  submissions: Submission[]
}

const TYPE_EMOJI: Record<string, string> = {
  file:            '📎',
  text:            '✏️',
  url:             '🔗',
  password:        '🔐',
  multiple_choice: '☑️',
}

const FILE_TYPES = ['SVG', 'PNG', 'JPG', 'PDF', 'AI', 'EPS', 'DOCX', 'MP4', 'ZIP']
const SIZE_OPTIONS = [
  { label: '5 MB',   value: 5 },
  { label: '50 MB',  value: 50 },
  { label: '500 MB', value: 500 },
  { label: '2 GB',   value: 2048 },
]

function getRowStatus(req: RequestWithSubmissions): SubmissionStatus {
  const sub = req.submissions?.[0]
  if (!sub) return 'pending'
  if (sub.status === 'approved') return 'approved'
  if (sub.status === 'rejected') return 'rejected'
  return 'reviewing'
}

function StatusIcon({ status }: { status: SubmissionStatus }) {
  if (status === 'approved') return <FileCheck2 size={16} className="text-green-600" />
  if (status === 'rejected') return <FileX2 size={16} className="text-accent" />
  if (status === 'reviewing') return <FileClock size={16} className="text-blue" />
  return <File size={16} className="text-ink/30" />
}

function AuditStatusDot({ status }: { status: string | null | undefined }) {
  if (!status || status === 'pending') return null
  if (status === 'processing') return <Loader2 size={11} className="text-blue animate-spin" />
  if (status === 'complete') return <Image src="/meta-llama.png" alt="AI" width={11} height={11} />
  if (status === 'error') return <span className="text-[10px] text-accent">!</span>
  return null
}

interface AssetRequestListProps {
  requests: RequestWithSubmissions[]
  projectId: string
  onOpenSubmission?: (req: AssetRequest, sub: Submission) => void
}

export function AssetRequestList({ requests: initial, projectId, onOpenSubmission }: AssetRequestListProps) {
  const router = useRouter()
  const [requests, setRequests] = useState<RequestWithSubmissions[]>(initial)

  // Sync from parent when initial prop changes (e.g. after polling)
  useEffect(() => {
    setRequests(initial)
  }, [initial])
  const [adding, setAdding] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [addError, setAddError] = useState<string | null>(null)

  // ── New request form state ────────────────────────────────
  const [newTitle, setNewTitle] = useState('')
  const [newType, setNewType] = useState<RequestType>('file')
  const [newDescription, setNewDescription] = useState('')
  const [newRequired, setNewRequired] = useState(true)
  const [newAllowedTypes, setNewAllowedTypes] = useState<string[]>([])
  const [newMaxSizeMb, setNewMaxSizeMb] = useState(50)
  const [newMinWidth, setNewMinWidth] = useState('')
  const [newMinHeight, setNewMinHeight] = useState('')
  const [newCustomInstructions, setNewCustomInstructions] = useState('')
  const [newNamingRule, setNewNamingRule] = useState(false)
  const [newChoices, setNewChoices] = useState('')
  const [customTypeInput, setCustomTypeInput] = useState('')
  const [showCustomType, setShowCustomType] = useState(false)

  function resetForm() {
    setNewTitle('')
    setNewType('file')
    setNewDescription('')
    setNewRequired(true)
    setNewAllowedTypes([])
    setNewMaxSizeMb(50)
    setNewMinWidth('')
    setNewMinHeight('')
    setNewCustomInstructions('')
    setNewNamingRule(false)
    setNewChoices('')
    setCustomTypeInput('')
    setShowCustomType(false)
    setAddError(null)
    setAdding(false)
  }

  function toggleFileType(type: string) {
    setNewAllowedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    )
  }

  function addCustomFileType() {
    const val = customTypeInput.trim().toUpperCase().replace(/^\./, '')
    if (!val) return
    if (!newAllowedTypes.includes(val)) {
      setNewAllowedTypes(prev => [...prev, val])
    }
    setCustomTypeInput('')
    setShowCustomType(false)
  }

  async function addRequest() {
    if (!newTitle.trim()) return
    setSaving(true)
    setAddError(null)

    const payload: Record<string, unknown> = {
      project_id: projectId,
      title: newTitle.trim(),
      request_type: newType,
      required: newRequired,
      sort_order: requests.length,
      description: newDescription.trim() || null,
      custom_instructions: newCustomInstructions.trim() || null,
      naming_rule: newNamingRule,
    }

    // File-specific fields
    if (newType === 'file') {
      payload.allowed_file_types = newAllowedTypes.length > 0 ? newAllowedTypes : null
      payload.max_file_size_mb = newMaxSizeMb
      const w = parseInt(newMinWidth, 10)
      const h = parseInt(newMinHeight, 10)
      if (!isNaN(w) && w > 0) payload.min_width = w
      if (!isNaN(h) && h > 0) payload.min_height = h
    }

    // Multiple choice
    if (newType === 'multiple_choice') {
      const parsed = newChoices.split('\n').map(c => c.trim()).filter(Boolean)
      payload.choices = parsed.length > 0 ? parsed : null
    }

    try {
      const res = await fetch('/api/asset-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const result = await res.json()

      if (!res.ok) {
        console.error('[addRequest] API error:', result.error)
        setAddError(result.error || 'Failed to add request')
        setSaving(false)
        return
      }

      setRequests((prev) => [...prev, { ...result.data, submissions: [] }])
      resetForm()
    } catch (err) {
      console.error('[addRequest] Network error:', err)
      setAddError('Network error — please try again')
    }
    setSaving(false)
    router.refresh()
  }

  async function deleteRequest(id: string) {
    try {
      const res = await fetch(`/api/asset-requests?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
      if (!res.ok) {
        const result = await res.json()
        console.error('[deleteRequest] API error:', result.error)
      }
    } catch (err) {
      console.error('[deleteRequest] Network error:', err)
    }
    setRequests((prev) => prev.filter((r) => r.id !== id))
    setDeleteConfirmId(null)
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-2">
      {requests.length === 0 && !adding && (
        <div
          className="py-10 text-center border-2 border-dashed border-ink/20"
          style={{ borderRadius: '20px 5px 20px 5px / 5px 20px 5px 20px' }}
        >
          <p className="font-body text-sm text-ink/40">No asset requests yet.</p>
        </div>
      )}

      {requests.map((req, idx) => {
        const status = getRowStatus(req)
        const firstSub = req.submissions?.[0] ?? null
        const hasSubmission = !!firstSub

        return (
          <div
            key={req.id}
            className={cn(
              'flex items-center gap-3 px-4 py-3 border-2 transition-all',
              status === 'reviewing'
                ? 'border-blue/30 bg-blue/5'
                : status === 'approved'
                  ? 'border-green-300/50 bg-green-50/40'
                  : status === 'rejected'
                    ? 'border-accent/20 bg-accent/5'
                    : 'border-ink/15 bg-paper hover:border-ink/30'
            )}
            style={{ borderRadius: '12px 3px 12px 3px / 3px 12px 3px 12px' }}
          >
            {/* Row number */}
            <span className="text-ink/20 font-body text-xs w-4 text-center flex-shrink-0">
              {idx + 1}
            </span>

            {/* Type emoji */}
            <span className="text-lg flex-shrink-0">
              {TYPE_EMOJI[req.request_type] ?? '📦'}
            </span>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-body text-sm text-ink font-medium truncate">
                  {req.title}
                </span>
                {req.required && (
                  <span
                    className="font-body text-[10px] px-1.5 py-0.5 bg-accent/10 text-accent"
                    style={{ borderRadius: '6px 2px 6px 2px / 2px 6px 2px 6px' }}
                  >
                    required
                  </span>
                )}
                {(req.min_width || req.min_height) && (
                  <span
                    className="font-body text-[10px] px-1.5 py-0.5 bg-blue/10 text-blue"
                    style={{ borderRadius: '6px 2px 6px 2px / 2px 6px 2px 6px' }}
                  >
                    {req.min_width ?? '?'}×{req.min_height ?? '?'}px
                  </span>
                )}
                {req.allowed_file_types && req.allowed_file_types.length > 0 && (
                  <span
                    className="font-body text-[10px] px-1.5 py-0.5 bg-ink/5 text-ink/40 hidden sm:inline"
                    style={{ borderRadius: '6px 2px 6px 2px / 2px 6px 2px 6px' }}
                  >
                    {req.allowed_file_types.slice(0, 3).join(', ')}{req.allowed_file_types.length > 3 ? '…' : ''}
                  </span>
                )}
              </div>
              {(req.description || req.custom_instructions) && (
                <p className="font-body text-xs text-ink/50 mt-0.5 truncate">
                  {req.description || req.custom_instructions}
                </p>
              )}
            </div>

            {/* Status + review button */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {firstSub && (
                <AuditStatusDot status={firstSub.ai_audit_status} />
              )}
              <StatusIcon status={status} />
              {hasSubmission && onOpenSubmission && (
                <button
                  onClick={() => onOpenSubmission(req, firstSub!)}
                  className="font-body text-xs text-blue hover:underline"
                >
                  Review
                </button>
              )}
            </div>

            {/* Delete */}
            {deleteConfirmId === req.id ? (
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="font-body text-xs text-accent mr-1">Delete?</span>
                <WobblyButton
                  variant="primary"
                  size="sm"
                  className="!bg-accent !text-paper !text-[11px] !px-2 !py-0.5"
                  onClick={() => deleteRequest(req.id)}
                >
                  Yes
                </WobblyButton>
                <WobblyButton
                  variant="ghost"
                  size="sm"
                  className="!text-[11px] !px-2 !py-0.5"
                  onClick={() => setDeleteConfirmId(null)}
                >
                  No
                </WobblyButton>
              </div>
            ) : (
              <button
                onClick={() => setDeleteConfirmId(req.id)}
                className="p-1.5 text-ink/25 hover:text-accent hover:bg-accent/10 transition-colors flex-shrink-0"
                style={{ borderRadius: '6px 2px 6px 2px / 2px 6px 2px 6px' }}
                title="Remove request"
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>
        )
      })}

      {/* Add new — detailed form */}
      {adding && (
        <div
          className="border-2 border-ink/40 bg-paper overflow-hidden"
          style={{
            borderRadius: '20px 5px 20px 5px / 5px 20px 5px 20px',
            boxShadow: '4px 4px 0 0 #2d2d2d',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border-b-2 border-dashed border-ink/10">
            <span className="font-heading text-base text-ink">New Asset Request</span>
            <div className="flex items-center gap-2">
              <WobblyButton variant="primary" size="sm" loading={saving} onClick={addRequest} disabled={!newTitle.trim()}>
                <Plus size={13} className="mr-1" /> Add
              </WobblyButton>
              <WobblyButton variant="ghost" size="sm" onClick={resetForm}>
                Cancel
              </WobblyButton>
            </div>
          </div>

          <div className="flex flex-col gap-3 px-4 py-4">
            {/* Error message */}
            {addError && (
              <div
                className="font-body text-xs text-white bg-accent/90 px-3 py-2"
                style={{ borderRadius: '12px 3px 12px 3px / 3px 12px 3px 12px' }}
              >
                ⚠️ {addError}
              </div>
            )}
            {/* Type + Title row */}
            <div className="flex gap-2">
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as RequestType)}
                className="font-body text-xs text-ink bg-paper border-2 border-ink/40 px-2 py-1.5 outline-none"
                style={{ borderRadius: '12px 3px 12px 3px / 3px 12px 3px 12px' }}
              >
                {Object.entries(TYPE_EMOJI).map(([val, emoji]) => (
                  <option key={val} value={val}>
                    {emoji} {val.replace('_', ' ')}
                  </option>
                ))}
              </select>
              <input
                autoFocus
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newTitle.trim()) addRequest()
                  if (e.key === 'Escape') resetForm()
                }}
                placeholder="Asset name…"
                className="flex-1 min-w-0 px-3 py-1.5 font-body text-sm text-ink bg-paper border-2 border-ink/40 outline-none focus:border-ink transition-all"
                style={{ borderRadius: '12px 3px 12px 3px / 3px 12px 3px 12px' }}
              />
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1">
              <label className="font-body text-xs text-ink/50 uppercase tracking-wider">Description</label>
              <input
                type="text"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="e.g. Please provide SVG and high-res PNG"
                className="w-full px-3 py-1.5 font-body text-xs text-ink bg-paper border border-ink/25 outline-none focus:border-ink/50 transition-all"
                style={{ borderRadius: '8px 2px 8px 2px / 2px 8px 2px 8px' }}
              />
            </div>

            {/* File-specific fields */}
            {newType === 'file' && (
              <div className="flex flex-col gap-3">
                {/* Allowed file types */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-body text-xs text-ink/50 uppercase tracking-wider">Allowed file types</label>
                  <div className="flex flex-wrap gap-1.5">
                    {FILE_TYPES.map((type) => {
                      const selected = newAllowedTypes.includes(type)
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => toggleFileType(type)}
                          className={cn(
                            'font-body text-xs px-2.5 py-1 border-2 transition-all',
                            selected
                              ? 'bg-ink text-paper border-ink'
                              : 'bg-paper text-ink/50 border-ink/20 hover:border-ink/50'
                          )}
                          style={{ borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px' }}
                        >
                          {selected && <span className="mr-1">✓</span>}{type}
                        </button>
                      )
                    })}

                    {/* Custom file type badges */}
                    {newAllowedTypes
                      .filter(t => !FILE_TYPES.includes(t))
                      .map(t => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setNewAllowedTypes(prev => prev.filter(x => x !== t))}
                          className="font-body text-xs px-2.5 py-1 border-2 bg-[#7c3aed] text-white border-[#7c3aed]"
                          style={{ borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px' }}
                          title="Click to remove"
                        >
                          .{t.toLowerCase()} ✕
                        </button>
                      ))
                    }

                    {/* Add custom extension */}
                    {showCustomType ? (
                      <div className="flex items-center gap-1">
                        <input
                          autoFocus
                          value={customTypeInput}
                          onChange={e => setCustomTypeInput(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') addCustomFileType()
                            if (e.key === 'Escape') { setShowCustomType(false); setCustomTypeInput('') }
                          }}
                          placeholder=".ext"
                          className="w-20 px-2 py-1 border-2 border-ink/30 font-body text-xs outline-none focus:border-ink bg-paper"
                          style={{ borderRadius: '8px' }}
                        />
                        <button type="button" onClick={addCustomFileType}
                          className="font-body text-xs px-2 py-1 bg-ink text-paper border-2 border-ink"
                          style={{ borderRadius: '8px' }}
                        >Add</button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowCustomType(true)}
                        className="font-body text-xs px-2.5 py-1 border-2 border-dashed border-ink/30 text-ink/50 flex items-center gap-1 hover:border-ink hover:text-ink transition-colors"
                        style={{ borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px' }}
                      >
                        <Plus size={10} /> custom
                      </button>
                    )}
                  </div>
                </div>

                {/* Size limit */}
                <div className="flex items-center gap-2">
                  <span className="font-body text-xs text-ink/50 w-20 flex-shrink-0">Max size</span>
                  <div className="flex gap-1.5 flex-wrap">
                    {SIZE_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setNewMaxSizeMb(opt.value)}
                        className={cn(
                          'font-body text-xs px-2.5 py-1 border-2 transition-all',
                          newMaxSizeMb === opt.value
                            ? 'bg-ink text-paper border-ink'
                            : 'bg-paper text-ink/50 border-ink/20 hover:border-ink/50'
                        )}
                        style={{ borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px' }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Resolution constraints */}
                <div className="flex items-center gap-2">
                  <span className="font-body text-xs text-ink/50 flex-shrink-0">Min resolution</span>
                  <input
                    type="number"
                    min={1}
                    value={newMinWidth}
                    onChange={(e) => setNewMinWidth(e.target.value)}
                    placeholder="Width px"
                    className="w-24 px-2 py-1 font-body text-xs text-ink bg-paper border border-ink/20 outline-none focus:border-ink/40 transition-all"
                    style={{ borderRadius: '6px 2px 6px 2px / 2px 6px 2px 6px' }}
                  />
                  <span className="font-body text-xs text-ink/30">×</span>
                  <input
                    type="number"
                    min={1}
                    value={newMinHeight}
                    onChange={(e) => setNewMinHeight(e.target.value)}
                    placeholder="Height px"
                    className="w-24 px-2 py-1 font-body text-xs text-ink bg-paper border border-ink/20 outline-none focus:border-ink/40 transition-all"
                    style={{ borderRadius: '6px 2px 6px 2px / 2px 6px 2px 6px' }}
                  />
                  <span className="font-body text-[10px] text-ink/35">(optional)</span>
                </div>
              </div>
            )}

            {/* Multiple choice options */}
            {newType === 'multiple_choice' && (
              <div className="flex flex-col gap-1">
                <label className="font-body text-xs text-ink/50 uppercase tracking-wider">Choices (one per line)</label>
                <textarea
                  rows={3}
                  value={newChoices}
                  onChange={(e) => setNewChoices(e.target.value)}
                  placeholder={"Option A\nOption B\nOption C"}
                  className="w-full px-3 py-2 font-body text-xs text-ink bg-paper border border-ink/25 outline-none focus:border-ink/60 transition-all resize-none"
                  style={{ borderRadius: '8px 2px 8px 2px / 2px 8px 2px 8px' }}
                />
              </div>
            )}

            {/* Custom instructions */}
            <div className="flex flex-col gap-1">
              <label className="font-body text-xs text-ink/50 uppercase tracking-wider">Custom instructions for client</label>
              <textarea
                rows={2}
                value={newCustomInstructions}
                onChange={(e) => setNewCustomInstructions(e.target.value)}
                placeholder="e.g. Must be vector format, transparent background"
                className="w-full px-3 py-2 font-body text-xs text-ink bg-paper border border-ink/25 outline-none focus:border-ink/60 transition-all resize-none"
                style={{ borderRadius: '8px 2px 8px 2px / 2px 8px 2px 8px' }}
              />
            </div>

            {/* Toggles */}
            <div className="flex items-center gap-5 flex-wrap">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <div
                  className={cn('relative border-2 border-ink transition-colors', newRequired ? 'bg-ink' : 'bg-paper')}
                  style={{ borderRadius: '20px', width: 36, height: 20 }}
                  onClick={() => setNewRequired(!newRequired)}
                >
                  <span
                    className="absolute top-[2px] w-3.5 h-3.5 bg-paper border border-ink/30 transition-all"
                    style={{ borderRadius: '50%', left: newRequired ? 'calc(100% - 17px)' : '2px' }}
                  />
                </div>
                <span className="font-body text-sm text-ink/70">Required</span>
              </label>
              {newType === 'file' && (
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <div
                    className={cn('relative border-2 border-ink transition-colors', newNamingRule ? 'bg-ink' : 'bg-paper')}
                    style={{ borderRadius: '20px', width: 36, height: 20 }}
                    onClick={() => setNewNamingRule(!newNamingRule)}
                  >
                    <span
                      className="absolute top-[2px] w-3.5 h-3.5 bg-paper border border-ink/30 transition-all"
                      style={{ borderRadius: '50%', left: newNamingRule ? 'calc(100% - 17px)' : '2px' }}
                    />
                  </div>
                  <span className="font-body text-sm text-ink/70">Auto-rename file</span>
                </label>
              )}
            </div>
          </div>
        </div>
      )}

      {!adding && (
        <WobblyButton
          variant="secondary"
          size="sm"
          className="self-start mt-1"
          onClick={() => setAdding(true)}
        >
          <Plus size={14} className="mr-1.5" />
          Add request
        </WobblyButton>
      )}
    </div>
  )
}
