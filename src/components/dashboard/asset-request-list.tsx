'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, FileCheck2, FileX2, FileClock, File, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
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
  const [newTitle, setNewTitle] = useState('')
  const [newType, setNewType] = useState<'file' | 'text' | 'password' | 'multiple_choice' | 'url'>('file')
  const [newDescription, setNewDescription] = useState('')
  const [newRequired, setNewRequired] = useState(true)
  const [newAllowedTypes, setNewAllowedTypes] = useState('')
  const [newMaxSizeMb, setNewMaxSizeMb] = useState('')
  const [newMinWidth, setNewMinWidth] = useState('')
  const [newMinHeight, setNewMinHeight] = useState('')
  const [newCustomInstructions, setNewCustomInstructions] = useState('')
  const [newChoices, setNewChoices] = useState('')
  const [newExampleUrl, setNewExampleUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  function resetAddForm() {
    setNewTitle('')
    setNewDescription('')
    setNewRequired(true)
    setNewType('file')
    setNewAllowedTypes('')
    setNewMaxSizeMb('')
    setNewMinWidth('')
    setNewMinHeight('')
    setNewCustomInstructions('')
    setNewChoices('')
    setNewExampleUrl('')
    setAdding(false)
  }

  async function addRequest() {
    if (!newTitle.trim()) return
    setSaving(true)
    const supabaseClient = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = supabaseClient as any

    const payload: Record<string, unknown> = {
      project_id: projectId,
      title: newTitle.trim(),
      request_type: newType,
      required: newRequired,
      sort_order: requests.length,
    }

    if (newDescription.trim()) payload.description = newDescription.trim()
    if (newCustomInstructions.trim()) payload.custom_instructions = newCustomInstructions.trim()
    if (newExampleUrl.trim()) payload.example_url = newExampleUrl.trim()

    // File-specific fields
    if (newType === 'file') {
      const w = parseInt(newMinWidth, 10)
      const h = parseInt(newMinHeight, 10)
      if (!isNaN(w) && w > 0) payload.min_width = w
      if (!isNaN(h) && h > 0) payload.min_height = h
      const sizeMb = parseInt(newMaxSizeMb, 10)
      if (!isNaN(sizeMb) && sizeMb > 0) payload.max_file_size_mb = sizeMb
      if (newAllowedTypes.trim()) {
        payload.allowed_file_types = newAllowedTypes
          .split(',')
          .map((t) => t.trim().toLowerCase().replace(/^\./, ''))
          .filter(Boolean)
      }
    }

    // Multiple choice options
    if (newType === 'multiple_choice' && newChoices.trim()) {
      payload.choices = newChoices
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean)
    }

    const { data, error } = await supabase
      .from('asset_requests')
      .insert(payload)
      .select()
      .single()

    if (!error && data) {
      setRequests((prev) => [...prev, { ...data, submissions: [] }])
      resetAddForm()
    }
    setSaving(false)
    router.refresh()
  }

  async function deleteRequest(id: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createClient() as any
    await supabase.from('asset_requests').delete().eq('id', id)
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
                    className="font-body text-[10px] px-1.5 py-0.5 bg-ink/5 text-ink/50"
                    style={{ borderRadius: '6px 2px 6px 2px / 2px 6px 2px 6px' }}
                  >
                    {req.allowed_file_types.map(t => t.toUpperCase()).join(', ')}
                  </span>
                )}
              </div>
              {req.description && (
                <p className="font-body text-xs text-ink/50 mt-0.5 truncate">{req.description}</p>
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

      {/* Add new — expanded panel */}
      {adding && (
        <div
          className="flex flex-col gap-3 p-4 border-2 border-ink/30 bg-muted/20"
          style={{ borderRadius: '12px 3px 12px 3px / 3px 12px 3px 12px' }}
        >
          {/* Row 1: Type + Title */}
          <div className="flex items-center gap-2">
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value as RequestType)}
              className="font-body text-xs text-ink bg-paper border border-ink/30 px-2 py-1.5 outline-none"
              style={{ borderRadius: '8px 2px 8px 2px / 2px 8px 2px 8px' }}
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
                if (e.key === 'Escape') resetAddForm()
              }}
              placeholder="Asset name…  e.g. Logo Files"
              className="flex-1 px-3 py-1.5 font-body text-sm text-ink bg-paper border border-ink/30 outline-none focus:border-ink transition-all"
              style={{ borderRadius: '8px 2px 8px 2px / 2px 8px 2px 8px' }}
            />
            <label className="flex items-center gap-1.5 cursor-pointer flex-shrink-0">
              <input
                type="checkbox"
                checked={newRequired}
                onChange={(e) => setNewRequired(e.target.checked)}
                className="accent-accent w-3.5 h-3.5"
              />
              <span className="font-body text-[11px] text-ink/60">Required</span>
            </label>
          </div>

          {/* Row 2: Description */}
          <textarea
            rows={2}
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            placeholder="Description for the client… e.g. Please provide SVG and high-res PNG versions"
            className="w-full px-3 py-2 font-body text-xs text-ink bg-paper border border-ink/20 outline-none focus:border-ink/40 transition-all resize-none"
            style={{ borderRadius: '8px 2px 8px 2px / 2px 8px 2px 8px' }}
          />

          {/* File-specific fields */}
          {newType === 'file' && (
            <div className="flex flex-col gap-2 pl-1">
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  value={newAllowedTypes}
                  onChange={(e) => setNewAllowedTypes(e.target.value)}
                  placeholder="Allowed types: png, svg, pdf"
                  className="flex-1 min-w-[140px] px-2 py-1 font-body text-xs text-ink bg-paper border border-ink/20 outline-none focus:border-ink/40 transition-all"
                  style={{ borderRadius: '6px 2px 6px 2px / 2px 6px 2px 6px' }}
                />
                <input
                  type="number"
                  min={1}
                  value={newMaxSizeMb}
                  onChange={(e) => setNewMaxSizeMb(e.target.value)}
                  placeholder="Max MB"
                  className="w-20 px-2 py-1 font-body text-xs text-ink bg-paper border border-ink/20 outline-none focus:border-ink/40 transition-all"
                  style={{ borderRadius: '6px 2px 6px 2px / 2px 6px 2px 6px' }}
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-body text-[11px] text-ink/50">Min resolution:</span>
                <input
                  type="number"
                  min={1}
                  value={newMinWidth}
                  onChange={(e) => setNewMinWidth(e.target.value)}
                  placeholder="W px"
                  className="w-16 px-2 py-1 font-body text-xs text-ink bg-paper border border-ink/20 outline-none focus:border-ink/40 transition-all"
                  style={{ borderRadius: '6px 2px 6px 2px / 2px 6px 2px 6px' }}
                />
                <span className="font-body text-xs text-ink/30">×</span>
                <input
                  type="number"
                  min={1}
                  value={newMinHeight}
                  onChange={(e) => setNewMinHeight(e.target.value)}
                  placeholder="H px"
                  className="w-16 px-2 py-1 font-body text-xs text-ink bg-paper border border-ink/20 outline-none focus:border-ink/40 transition-all"
                  style={{ borderRadius: '6px 2px 6px 2px / 2px 6px 2px 6px' }}
                />
                <span className="font-body text-[10px] text-ink/35">(optional)</span>
              </div>
            </div>
          )}

          {/* Multiple choice options */}
          {newType === 'multiple_choice' && (
            <input
              type="text"
              value={newChoices}
              onChange={(e) => setNewChoices(e.target.value)}
              placeholder="Options (comma-separated): Option A, Option B, Option C"
              className="w-full px-3 py-1.5 font-body text-xs text-ink bg-paper border border-ink/20 outline-none focus:border-ink/40 transition-all"
              style={{ borderRadius: '6px 2px 6px 2px / 2px 6px 2px 6px' }}
            />
          )}

          {/* Custom instructions */}
          <input
            type="text"
            value={newCustomInstructions}
            onChange={(e) => setNewCustomInstructions(e.target.value)}
            placeholder="💡 Custom instructions shown to client (optional)"
            className="w-full px-3 py-1.5 font-body text-xs text-ink bg-paper border border-ink/20 outline-none focus:border-ink/40 transition-all"
            style={{ borderRadius: '6px 2px 6px 2px / 2px 6px 2px 6px' }}
          />

          {/* Example URL */}
          <input
            type="url"
            value={newExampleUrl}
            onChange={(e) => setNewExampleUrl(e.target.value)}
            placeholder="🔗 Example/reference URL (optional)"
            className="w-full px-3 py-1.5 font-body text-xs text-ink bg-paper border border-ink/20 outline-none focus:border-ink/40 transition-all"
            style={{ borderRadius: '6px 2px 6px 2px / 2px 6px 2px 6px' }}
          />

          {/* Actions */}
          <div className="flex items-center gap-2 pt-1">
            <WobblyButton variant="primary" size="sm" loading={saving} onClick={addRequest} disabled={!newTitle.trim()}>
              <Plus size={13} className="mr-1" />
              Add Request
            </WobblyButton>
            <WobblyButton variant="ghost" size="sm" onClick={resetAddForm}>
              Cancel
            </WobblyButton>
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
