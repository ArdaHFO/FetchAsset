'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Copy, Check, ExternalLink, Clock } from 'lucide-react'
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
  const [copied, setCopied] = useState(false)
  const status = STATUS_STYLES[project.status] ?? STATUS_STYLES.draft
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

  const rotateVal = (['none', '-0.5', '0.5'] as const)[
    Math.abs(project.id.charCodeAt(0)) % 3
  ]

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
          <span
            className={cn(
              'font-body text-xs px-2.5 py-0.5 flex-shrink-0',
              status.classes
            )}
            style={{ borderRadius: '20px 5px 20px 5px / 5px 20px 5px 20px' }}
          >
            {status.label}
          </span>
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
                className="h-full bg-ink transition-all"
                style={{
                  width: `${pct}%`,
                  borderRadius: '10px 2px 10px 2px / 2px 10px 2px 10px',
                }}
              />
            </div>
          </div>
        )}

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
                {copied ? <Check size={13} className="text-ink" /> : <Copy size={13} />}
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
