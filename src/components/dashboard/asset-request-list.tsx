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
  const [saving, setSaving] = useState(false)

  async function addRequest() {
    if (!newTitle.trim()) return
    setSaving(true)
    const supabaseClient = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = supabaseClient as any
    const { data, error } = await supabase
      .from('asset_requests')
      .insert({
        project_id: projectId,
        title: newTitle.trim(),
        request_type: newType,
        required: true,
        sort_order: requests.length,
      })
      .select()
      .single()

    if (!error && data) {
      setRequests((prev) => [...prev, { ...data, submissions: [] }])
      setNewTitle('')
      setAdding(false)
    }
    setSaving(false)
    router.refresh()
  }

  async function deleteRequest(id: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createClient() as any
    await supabase.from('asset_requests').delete().eq('id', id)
    setRequests((prev) => prev.filter((r) => r.id !== id))
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
            <button
              onClick={() => deleteRequest(req.id)}
              className="p-1.5 text-ink/25 hover:text-accent hover:bg-accent/10 transition-colors flex-shrink-0"
              style={{ borderRadius: '6px 2px 6px 2px / 2px 6px 2px 6px' }}
              title="Remove request"
            >
              <Trash2 size={13} />
            </button>
          </div>
        )
      })}

      {/* Add new inline */}
      {adding && (
        <div
          className="flex items-center gap-2 p-3 border-2 border-ink/30 bg-muted/30"
          style={{ borderRadius: '12px 3px 12px 3px / 3px 12px 3px 12px' }}
        >
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
              if (e.key === 'Enter') addRequest()
              if (e.key === 'Escape') { setAdding(false); setNewTitle('') }
            }}
            placeholder="Asset name…"
            className="flex-1 px-3 py-1.5 font-body text-sm text-ink bg-paper border border-ink/30 outline-none focus:border-ink transition-all"
            style={{ borderRadius: '8px 2px 8px 2px / 2px 8px 2px 8px' }}
          />
          <WobblyButton variant="primary" size="sm" loading={saving} onClick={addRequest}>
            Add
          </WobblyButton>
          <WobblyButton
            variant="ghost"
            size="sm"
            onClick={() => { setAdding(false); setNewTitle('') }}
          >
            Cancel
          </WobblyButton>
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
