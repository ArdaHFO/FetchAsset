'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Copy, Check, ExternalLink, Clock, Calendar, AlertTriangle, MoreHorizontal, Archive, CheckCircle2, Zap, Loader2 } from 'lucide-react'
import { WobblyCard, WobblyCardContent, WobblyButton } from '@/components/ui'
import { cn } from '@/lib/utils'
import type { Project } from '@/lib/supabase/types'

const STATUS_STYLES: Record<Project['status'], { label: string; classes: string }> = {
  draft:      { label: 'Draft',      classes: 'bg-muted text-ink/60' },
  active:     { label: 'Active',     classes: 'bg-blue/15 text-blue' },
  completed:  { label: 'Completed',  classes: 'bg-ink/10 text-ink/60' },
  archived:   { label: 'Archived',   classes: 'bg-muted/60 text-ink/40' },
}

interface ProjectCardProps {
  project: Project & { progress?: { total: number; completed: number } }
}

export function ProjectCard({ project }: ProjectCardProps) {
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [statusChanging, setStatusChanging] = useState(false)
  const [currentStatus, setCurrentStatus] = useState(project.status)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [menuOpen])

  const status = STATUS_STYLES[currentStatus] ?? STATUS_STYLES.draft
  const progress = project.progress ?? { total: 0, completed: 0 }
  const pct = progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0
  const magicUrl = project.magic_token
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/portal/${project.magic_token}`
    : null

  async function copyLink() {
    if (!magicUrl) return
    await navigator.clipboard.writeText(magicUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function changeStatus(newStatus: Project['status']) {
    setMenuOpen(false)
    setStatusChanging(true)
    try {
      const res = await fetch(`/api/projects/${project.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        setCurrentStatus(newStatus)
        router.refresh()
      }
    } finally {
      setStatusChanging(false)
    }
  }

  const rotateVal = (['none', '-0.5', '0.5'] as const)[
    Math.abs(project.id.charCodeAt(0)) % 3
  ]

  // Quick-action items based on current status
  const menuItems: Array<{ label: string; icon: React.ElementType; status: Project['status']; color?: string }> = [
    currentStatus !== 'active'    && { label: 'Mark Active',    icon: Zap,          status: 'active' as const },
    currentStatus !== 'completed' && { label: 'Mark Complete',  icon: CheckCircle2, status: 'completed' as const, color: 'text-green-600' },
    currentStatus !== 'archived'  && { label: 'Archive',        icon: Archive,      status: 'archived' as const, color: 'text-ink/50' },
  ].filter(Boolean) as Array<{ label: string; icon: React.ElementType; status: Project['status']; color?: string }>

  return (
    <WobblyCard
      flavor="default"
      shadow="DEFAULT"
      radius="md"
      rotate={rotateVal}
      hoverable
      className="flex flex-col"
    >
      <WobblyCardContent className="p-5 flex flex-col gap-3 flex-1">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <Link href={`/projects/${project.id}`}>
              <h3 className="font-heading text-lg text-ink leading-tight hover:text-accent transition-colors truncate">
                {project.title}
              </h3>
            </Link>
            {project.client_name && (
              <p className="font-body text-xs text-ink/50 mt-0.5 truncate">
                {project.client_name}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span
              className={cn('font-body text-xs px-2.5 py-0.5', status.classes)}
              style={{ borderRadius: '20px 5px 20px 5px / 5px 20px 5px 20px' }}
            >
              {status.label}
            </span>
            {/* Quick actions menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((o) => !o)}
                disabled={statusChanging}
                className="p-1 text-ink/25 hover:text-ink hover:bg-muted transition-colors"
                style={{ borderRadius: '6px 2px 6px 2px / 2px 6px 2px 6px' }}
                title="Quick actions"
              >
                {statusChanging
                  ? <Loader2 size={14} className="animate-spin" />
                  : <MoreHorizontal size={14} />}
              </button>
              {menuOpen && (
                <div
                  className="absolute right-0 top-full mt-1 z-20 flex flex-col gap-0.5 p-1.5 bg-paper border-2 border-ink/20"
                  style={{
                    borderRadius: '10px 3px 10px 3px / 3px 10px 3px 10px',
                    boxShadow: '3px 3px 0 0 #2d2d2d',
                    minWidth: 148,
                  }}
                >
                  {menuItems.map((item) => {
                    const Icon = item.icon
                    return (
                      <button
                        key={item.status}
                        onClick={() => changeStatus(item.status)}
                        className={cn(
                          'flex items-center gap-2 px-3 py-2 font-body text-sm hover:bg-muted transition-colors text-left w-full',
                          item.color ?? 'text-ink'
                        )}
                        style={{ borderRadius: '6px 2px 6px 2px / 2px 6px 2px 6px' }}
                      >
                        <Icon size={13} />
                        {item.label}
                      </button>
                    )
                  })}
                  <div className="my-0.5 border-t border-ink/10" />
                  <Link
                    href={`/projects/${project.id}`}
                    className="flex items-center gap-2 px-3 py-2 font-body text-sm text-ink hover:bg-muted transition-colors"
                    style={{ borderRadius: '6px 2px 6px 2px / 2px 6px 2px 6px' }}
                    onClick={() => setMenuOpen(false)}
                  >
                    <ExternalLink size={13} />
                    Open project
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        {progress.total > 0 && (
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center">
              <span className="font-body text-xs text-ink/50">Assets</span>
              <span className="font-body text-xs text-ink/50">
                {progress.completed}/{progress.total}
              </span>
            </div>
            <div
              className="h-2.5 w-full bg-muted overflow-hidden"
              style={{ borderRadius: '10px 2px 10px 2px / 2px 10px 2px 10px' }}
            >
              <div
                className="h-full transition-all"
                style={{
                  width: `${pct}%`,
                  borderRadius: '10px 2px 10px 2px / 2px 10px 2px 10px',
                  background: pct === 100 ? '#22c55e' : pct > 50 ? '#3b82f6' : '#2d2d2d',
                }}
              />
            </div>
          </div>
        )}

        {/* Deadline warning */}
        {project.due_date && (() => {
          const daysLeft = Math.ceil((new Date(project.due_date).getTime() - Date.now()) / (1000*60*60*24))
          if (daysLeft < 0 && project.status === 'active') {
            return (
              <div className="flex items-center gap-1.5 font-body text-xs text-accent">
                <AlertTriangle size={12} />
                Overdue by {Math.abs(daysLeft)} day{Math.abs(daysLeft) !== 1 ? 's' : ''}
              </div>
            )
          }
          if (daysLeft <= 3 && daysLeft >= 0 && project.status === 'active') {
            return (
              <div className="flex items-center gap-1.5 font-body text-xs text-amber-600">
                <Calendar size={12} />
                {daysLeft === 0 ? 'Due today' : `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`}
              </div>
            )
          }
          return null
        })()}

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 mt-auto pt-1">
          <div className="flex items-center gap-1 text-ink/40">
            <Clock size={11} />
            <span className="font-body text-xs">
              {new Date(project.created_at).toLocaleDateString('en-GB', {
                day: 'numeric', month: 'short', year: 'numeric',
              })}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {magicUrl && (
              <WobblyButton
                variant="ghost"
                size="icon"
                onClick={copyLink}
                title="Copy client portal link"
                className="!p-1.5 !h-7 !w-7"
              >
                {copied ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
              </WobblyButton>
            )}
            <WobblyButton
              variant="ghost"
              size="icon"
              asChild
              className="!p-1.5 !h-7 !w-7"
            >
              <Link href={`/projects/${project.id}`} title="Open project">
                <ExternalLink size={13} />
              </Link>
            </WobblyButton>
          </div>
        </div>
      </WobblyCardContent>
    </WobblyCard>
  )
}
