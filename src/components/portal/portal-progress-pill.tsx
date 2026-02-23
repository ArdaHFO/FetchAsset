'use client'

import { useState, useEffect } from 'react'

interface PortalProgressPillProps {
  initialTotal: number
  initialSubmitted: number
  brandColor: string
  fontBody: string
}

export function PortalProgressPill({
  initialTotal,
  initialSubmitted,
  brandColor,
  fontBody,
}: PortalProgressPillProps) {
  const [total, setTotal] = useState(initialTotal)
  const [submitted, setSubmitted] = useState(initialSubmitted)

  useEffect(() => {
    function handleProgress(e: Event) {
      const detail = (e as CustomEvent).detail
      if (detail) {
        setTotal(detail.total ?? 0)
        setSubmitted(detail.submitted ?? 0)
      }
    }
    window.addEventListener('portal-progress', handleProgress)
    return () => window.removeEventListener('portal-progress', handleProgress)
  }, [])

  if (total <= 0) return null

  const pct = Math.round((submitted / total) * 100)
  const isDone = submitted === total

  return (
    <div
      className="hidden sm:flex items-center gap-2 px-3 py-1.5 border-2 border-ink/15"
      style={{ borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px' }}
    >
      <div
        className="w-2 h-2 rounded-full"
        style={{ background: isDone ? '#22c55e' : brandColor }}
      />
      <span className="text-xs font-bold text-ink" style={{ fontFamily: fontBody }}>
        {isDone
          ? 'Complete 🎉'
          : `${pct}% · ${total - submitted} to go`}
      </span>
    </div>
  )
}
