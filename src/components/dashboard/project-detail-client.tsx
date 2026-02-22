'use client'

import { useState, useCallback } from 'react'
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
  submittedCount: initialSubmitted,
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

  const handleReviewComplete = useCallback(async () => {
    // Re-fetch submissions for all requests after a review action
    try {
      const res = await fetch(`/api/projects/${projectId}/requests`)
      if (res.ok) {
        const data = await res.json()
        if (data.requests) setRequests(data.requests as RequestWithSubmissions[])
      }
    } catch {
      // Silent — the list will update on next page load
    }
  }, [projectId])

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-heading text-xl text-ink">Asset Checklist</h2>
        <span className="font-body text-sm text-ink/50">
          {submittedCount}/{totalCount} submitted
        </span>
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
