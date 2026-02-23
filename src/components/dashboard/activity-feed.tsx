'use client'

import Link from 'next/link'
import {
  Upload,
  CheckCircle2,
  XCircle,
  Clock,
  Bot,
  FileText,
  KeyRound,
  Link2,
  ToggleLeft,
  Paperclip,
} from 'lucide-react'
import { WobblyCard, WobblyCardContent } from '@/components/ui'

// ── Types ──────────────────────────────────────────────────────────

export interface ActivityItem {
  id: string
  submissionId: string
  timestamp: string
  clientName: string
  requestTitle: string
  requestType: string
  projectId: string
  projectTitle: string
  status: string
  aiAuditStatus: string | null
  fileName: string | null
}

interface ActivityFeedProps {
  items: ActivityItem[]
}

// ── Helpers ────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days === 1) return 'yesterday'
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

const TYPE_ICON: Record<string, React.ElementType> = {
  file: Paperclip,
  text: FileText,
  url: Link2,
  password: KeyRound,
  multiple_choice: ToggleLeft,
}

function getActivityInfo(item: ActivityItem) {
  // Determine what happened based on status
  if (item.status === 'approved') {
    return {
      icon: CheckCircle2,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      verb: 'Approved',
      description: `${item.requestTitle}`,
      emphasis: 'positive' as const,
    }
  }
  if (item.status === 'rejected') {
    return {
      icon: XCircle,
      iconColor: 'text-accent',
      bgColor: 'bg-accent/5',
      borderColor: 'border-accent/20',
      verb: 'Needs revision',
      description: `${item.requestTitle}`,
      emphasis: 'negative' as const,
    }
  }
  // pending_review with AI audit complete
  if (item.aiAuditStatus === 'complete') {
    return {
      icon: Bot,
      iconColor: 'text-blue',
      bgColor: 'bg-blue/5',
      borderColor: 'border-blue/20',
      verb: 'AI audited',
      description: `${item.requestTitle}`,
      emphasis: 'info' as const,
    }
  }
  // pending_review — new submission
  return {
    icon: Upload,
    iconColor: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    verb: `${item.clientName} submitted`,
    description: item.fileName ?? item.requestTitle,
    emphasis: 'neutral' as const,
  }
}

// ── Component ──────────────────────────────────────────────────────

export function ActivityFeed({ items }: ActivityFeedProps) {
  if (items.length === 0) {
    return (
      <div
        className="py-10 text-center border-2 border-dashed border-ink/15"
        style={{ borderRadius: '20px 5px 20px 5px / 5px 20px 5px 20px' }}
      >
        <Clock size={24} className="mx-auto text-ink/20 mb-2" />
        <p className="font-body text-sm text-ink/40">No activity yet. Once clients start uploading, it'll show here.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-0">
      {items.map((item, idx) => {
        const info = getActivityInfo(item)
        const Icon = info.icon
        const TypeIcon = TYPE_ICON[item.requestType] ?? Paperclip
        const isLast = idx === items.length - 1

        return (
          <div key={item.id} className="flex gap-3 group">
            {/* Timeline line + dot */}
            <div className="flex flex-col items-center flex-shrink-0 w-8">
              <div
                className={`w-8 h-8 flex items-center justify-center rounded-full border-2 ${info.bgColor} ${info.borderColor} flex-shrink-0`}
              >
                <Icon size={14} className={info.iconColor} />
              </div>
              {!isLast && (
                <div className="w-0.5 flex-1 bg-ink/10 min-h-[20px]" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pb-4 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-body text-sm text-ink leading-tight">
                    <span className="font-semibold">{info.verb}</span>
                    {' '}
                    <span className="text-ink/70">{info.description}</span>
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <TypeIcon size={10} className="text-ink/30 flex-shrink-0" />
                    <Link
                      href={`/projects/${item.projectId}`}
                      className="font-body text-xs text-ink/40 hover:text-blue transition-colors truncate"
                    >
                      {item.projectTitle}
                    </Link>
                  </div>
                </div>
                <span className="font-body text-[11px] text-ink/35 whitespace-nowrap flex-shrink-0 pt-0.5">
                  {timeAgo(item.timestamp)}
                </span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
