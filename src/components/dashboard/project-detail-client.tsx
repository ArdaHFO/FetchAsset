'use client'

import { useState, useCallback, useEffect } from 'react'
import { RefreshCw } from 'lucide-react'
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

  return (
    <>
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
