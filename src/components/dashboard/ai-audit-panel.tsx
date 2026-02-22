'use client'

import { cn } from '@/lib/utils'
import { AlertTriangle, Info, XCircle, CheckCircle2, Sparkles, Loader2, AlertCircle } from 'lucide-react'
import type { AuditResult, AuditIssue } from '@/lib/ai/types'

// ── Quality score ring ────────────────────────────────────────────

function scoreColor(score: number): string {
  if (score >= 8) return '#22c55e'   // green
  if (score >= 6) return '#f59e0b'   // amber
  if (score >= 4) return '#f97316'   // orange
  return '#ef4444'                   // red
}

function ScoreRing({ score }: { score: number }) {
  const color = scoreColor(score)
  const radius = 22
  const circumference = 2 * Math.PI * radius
  const filled = (score / 10) * circumference

  return (
    <svg width="60" height="60" viewBox="0 0 60 60" className="flex-shrink-0">
      {/* Track */}
      <circle
        cx="30" cy="30" r={radius}
        fill="none" stroke="#e5e0d8" strokeWidth="5"
      />
      {/* Fill */}
      <circle
        cx="30" cy="30" r={radius}
        fill="none"
        stroke={color}
        strokeWidth="5"
        strokeDasharray={`${filled} ${circumference - filled}`}
        strokeDashoffset={circumference * 0.25}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.6s ease' }}
      />
      {/* Text */}
      <text x="30" y="35" textAnchor="middle" fontSize="14" fontFamily="Kalam, cursive" fill="#2d2d2d" fontWeight="bold">
        {score}
      </text>
    </svg>
  )
}

// ── Issue row ─────────────────────────────────────────────────────

const ISSUE_CONFIG = {
  error:   { icon: XCircle,       color: 'text-accent',     bg: 'bg-accent/8' },
  warning: { icon: AlertTriangle, color: 'text-amber-600',  bg: 'bg-amber-50' },
  info:    { icon: Info,          color: 'text-blue',       bg: 'bg-blue/8'   },
}

function IssueRow({ issue }: { issue: AuditIssue }) {
  const cfg = ISSUE_CONFIG[issue.severity] ?? ISSUE_CONFIG.info
  const Icon = cfg.icon
  return (
    <div
      className={cn('flex items-start gap-2 px-3 py-2 rounded', cfg.bg)}
      style={{ borderRadius: '8px 2px 8px 2px / 2px 8px 2px 8px' }}
    >
      <Icon size={14} className={cn('mt-0.5 flex-shrink-0', cfg.color)} />
      <span className="font-body text-xs text-ink/80">{issue.message}</span>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────

interface AiAuditPanelProps {
  auditStatus: string
  auditResult: AuditResult | null
  onRerun?: () => void
  rerunning?: boolean
}

export function AiAuditPanel({ auditStatus, auditResult, onRerun, rerunning }: AiAuditPanelProps) {
  if (auditStatus === 'pending' || auditStatus === 'processing') {
    return (
      <div
        className="flex items-center gap-3 px-4 py-3 bg-muted/40 border border-ink/15"
        style={{ borderRadius: '12px 3px 12px 3px / 3px 12px 3px 12px' }}
      >
        <Loader2 size={16} className="text-ink/50 animate-spin flex-shrink-0" />
        <div>
          <p className="font-body text-sm text-ink/70">
            {auditStatus === 'processing' ? 'Llama 3.3 is reviewing…' : 'AI audit queued…'}
          </p>
          <p className="font-body text-xs text-ink/40">Usually takes 5–15 seconds</p>
        </div>
      </div>
    )
  }

  if (auditStatus === 'error' || !auditResult) {
    return (
      <div
        className="flex items-center justify-between gap-3 px-4 py-3 bg-accent/8 border border-accent/25"
        style={{ borderRadius: '12px 3px 12px 3px / 3px 12px 3px 12px' }}
      >
        <div className="flex items-center gap-2">
          <AlertCircle size={16} className="text-accent flex-shrink-0" />
          <p className="font-body text-sm text-ink/70">AI audit failed</p>
        </div>
        {onRerun && (
          <button
            onClick={onRerun}
            disabled={rerunning}
            className="font-body text-xs text-blue hover:underline disabled:opacity-50"
          >
            {rerunning ? 'Retrying…' : 'Retry'}
          </button>
        )}
      </div>
    )
  }

  return (
    <div
      className="border-2 border-ink/15 overflow-hidden"
      style={{ borderRadius: '16px 4px 16px 4px / 4px 16px 4px 16px' }}
    >
      {/* Header */}
      <div className="flex items-start gap-4 px-5 py-4 bg-muted/30 border-b border-ink/10">
        <ScoreRing score={auditResult.quality_score} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={14} className="text-ink/50 flex-shrink-0" />
            <span className="font-body text-xs text-ink/50 uppercase tracking-wide">
              Llama 3.3 Audit
            </span>
            {auditResult.auto_approve && (
              <span
                className="font-body text-[10px] px-2 py-0.5 bg-ink text-paper"
                style={{ borderRadius: '20px 4px 20px 4px / 4px 20px 4px 20px' }}
              >
                ✓ Auto-approve suggested
              </span>
            )}
          </div>
          <p className="font-body text-sm text-ink font-medium leading-tight">
            {auditResult.summary}
          </p>
        </div>
        {onRerun && (
          <button
            onClick={onRerun}
            disabled={rerunning}
            className="font-body text-xs text-ink/40 hover:text-ink transition-colors flex-shrink-0 disabled:opacity-50"
          >
            {rerunning ? <Loader2 size={12} className="animate-spin" /> : '↺ Re-run'}
          </button>
        )}
      </div>

      {/* Body */}
      <div className="px-5 py-4 flex flex-col gap-4">
        {/* Explanation */}
        {auditResult.explanation && (
          <p className="font-body text-sm text-ink/65 leading-relaxed">
            {auditResult.explanation}
          </p>
        )}

        {/* Issues */}
        {auditResult.issues.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <p className="font-body text-xs text-ink/45 uppercase tracking-wide">Issues</p>
            {auditResult.issues.map((issue, i) => (
              <IssueRow key={i} issue={issue} />
            ))}
          </div>
        )}

        {/* Suggestions */}
        {auditResult.suggestions.length > 0 && (
          <div>
            <p className="font-body text-xs text-ink/45 uppercase tracking-wide mb-1.5">
              Suggestions
            </p>
            <ul className="flex flex-col gap-1">
              {auditResult.suggestions.map((s, i) => (
                <li key={i} className="font-body text-xs text-ink/70 flex gap-2">
                  <span className="text-ink/30 flex-shrink-0">→</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
