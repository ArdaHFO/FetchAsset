'use client'

import { useState, useCallback, useEffect } from 'react'
import { RefreshCw, Download, Loader2, CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react'
import { WobblyButton } from '@/components/ui'
import { AssetRequestList, type RequestWithSubmissions } from './asset-request-list'
import { SubmissionDrawer } from './submission-drawer'
import type { AssetRequest, Submission } from '@/lib/supabase/types'

interface ProjectDetailClientProps {
  requests: RequestWithSubmissions[]
  projectId: string
  submittedCount: number
  totalCount: number
}

export function ProjectDetailClient({
  requests: initialRequests,
  projectId,
  submittedCount: _initialSubmitted,
  totalCount,
}: ProjectDetailClientProps) {
  const [requests, setRequests] = useState<RequestWithSubmissions[]>(initialRequests)
  const [drawerReq, setDrawerReq] = useState<AssetRequest | null>(null)
  const [drawerSub, setDrawerSub] = useState<Submission | null>(null)

  const submittedCount = requests.filter(r => r.submissions?.length > 0).length

  const handleOpenSubmission = useCallback((req: AssetRequest, sub: Submission) => {
    setDrawerReq(req)
    setDrawerSub(sub)
  }, [])

  const handleClose = useCallback(() => {
    setDrawerReq(null)
    setDrawerSub(null)
  }, [])

  const [refreshing, setRefreshing] = useState(false)
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null)

  const fetchRequests = useCallback(async (silent = false) => {
    if (!silent) setRefreshing(true)
    try {
      const res = await fetch(`/api/projects/${projectId}/requests`)
      if (res.ok) {
        const data = await res.json()
        if (data.requests) {
          setRequests(data.requests as RequestWithSubmissions[])
          setLastRefreshed(new Date())
        }
      }
    } catch {
      // Silent
    } finally {
      if (!silent) setRefreshing(false)
    }
  }, [projectId])

  const handleReviewComplete = useCallback(() => fetchRequests(), [fetchRequests])

  // Auto-poll every 20 s so new client submissions appear without a page reload
  useEffect(() => {
    const id = setInterval(() => fetchRequests(true), 20_000)
    return () => clearInterval(id)
  }, [fetchRequests])

  // Status counts
  const approvedCount = requests.filter(r => r.submissions?.[0]?.status === 'approved').length
  const rejectedCount = requests.filter(r => r.submissions?.[0]?.status === 'rejected').length
  const pendingCount  = requests.filter(r => r.submissions?.[0] && r.submissions[0].status !== 'approved' && r.submissions[0].status !== 'rejected').length
  const awaitingCount = totalCount - submittedCount
  const hasFiles = requests.some(r => r.submissions?.[0]?.file_path)

  // Download all handler
  const [downloading, setDownloading] = useState(false)
  async function downloadAll() {
    setDownloading(true)
    try {
      const res = await fetch(`/api/projects/${projectId}/download-all`)
      if (!res.ok) return
      const data = await res.json()
      // Download each file via hidden link click
      for (const file of data.files) {
        if (file.url) {
          const a = document.createElement('a')
          a.href = file.url
          a.download = file.fileName
          a.style.display = 'none'
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          await new Promise(r => setTimeout(r, 300))
        }
      }
    } catch { /* silent */ }
    setDownloading(false)
  }

  return (
    <>
      {/* Status summary bar */}
      {submittedCount > 0 && (
        <div className="flex flex-wrap items-center gap-3 mb-4 font-body text-sm">
          {approvedCount > 0 && (
            <span className="flex items-center gap-1.5 text-green-600">
              <CheckCircle2 size={14} /> {approvedCount} approved
            </span>
          )}
          {pendingCount > 0 && (
            <span className="flex items-center gap-1.5 text-blue">
              <Clock size={14} /> {pendingCount} under review
            </span>
          )}
          {rejectedCount > 0 && (
            <span className="flex items-center gap-1.5 text-accent">
              <XCircle size={14} /> {rejectedCount} needs revision
            </span>
          )}
          {awaitingCount > 0 && (
            <span className="flex items-center gap-1.5 text-ink/40">
              <AlertCircle size={14} /> {awaitingCount} awaiting
            </span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <h2 className="font-heading text-xl text-ink">Asset Checklist</h2>
        <div className="flex items-center gap-3">
          {lastRefreshed && (
            <span className="font-body text-xs text-ink/35 hidden sm:block">
              Updated {lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <span className="font-body text-sm text-ink/50">{submittedCount}/{totalCount} submitted</span>
          <button
            onClick={() => fetchRequests()}
            disabled={refreshing}
            className="flex items-center gap-1.5 font-body text-xs text-ink/50 hover:text-ink transition-colors disabled:opacity-40"
            title="Refresh submissions"
          >
            <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </div>

      <AssetRequestList
        requests={requests}
        projectId={projectId}
        onOpenSubmission={handleOpenSubmission}
      />

      {/* Download all files button */}
      {hasFiles && (
        <div className="mt-4">
          <WobblyButton
            variant="secondary"
            size="sm"
            onClick={downloadAll}
            disabled={downloading}
            className="flex items-center gap-2"
          >
            {downloading
              ? <><Loader2 size={14} className="animate-spin" /> Downloading…</>
              : <><Download size={14} /> Download all files</>
            }
          </WobblyButton>
        </div>
      )}

      {drawerReq && drawerSub && (
        <SubmissionDrawer
          request={drawerReq}
          submission={drawerSub}
          onClose={handleClose}
          onReviewComplete={handleReviewComplete}
        />
      )}
    </>
  )
}
