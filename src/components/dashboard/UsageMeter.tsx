import Link from 'next/link'
import { Zap } from 'lucide-react'
import type { UsageStats } from '@/lib/stripe/limits'
import { PLANS } from '@/lib/stripe/plans'

function MeterBar({
  label,
  used,
  limit,
  accentColor,
}: {
  label: string
  used: number
  limit: number
  accentColor: string
}) {
  const isUnlimited = limit === -1
  const pct = isUnlimited ? 0 : Math.min(100, Math.round((used / limit) * 100))
  const isWarning = !isUnlimited && pct >= 80
  const isFull = !isUnlimited && used >= limit

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="font-body text-xs text-ink/60">{label}</span>
        <span
          className="font-body text-xs font-bold"
          style={{ color: isFull ? '#e63946' : isWarning ? '#b45309' : '#2d2d2d' }}
        >
          {isUnlimited ? (
            <span className="text-ink/40">Unlimited</span>
          ) : (
            `${used} / ${limit}`
          )}
        </span>
      </div>

      {!isUnlimited && (
        <div
          className="h-3 w-full bg-muted overflow-hidden"
          style={{
            borderRadius: '12px 2px 12px 2px / 2px 12px 2px 12px',
            boxShadow: '1px 1px 0px #2d2d2d',
          }}
        >
          <div
            className="h-full transition-all duration-500 relative"
            style={{
              width: `${pct}%`,
              background: isFull ? '#e63946' : isWarning ? '#d97706' : accentColor,
              borderRadius: '12px 2px 12px 2px / 2px 12px 2px 12px',
            }}
          >
            {pct > 15 && (
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(255,255,255,0.6) 3px, rgba(255,255,255,0.6) 4px)',
                }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

interface UsageMeterProps {
  stats: UsageStats
}

export function UsageMeter({ stats }: UsageMeterProps) {
  const planMeta = PLANS[stats.plan]
  const isFree = stats.plan === 'free'
  const isSolo = stats.plan === 'solo'
  const needsUpgrade =
    (stats.projects.limit !== -1 && stats.projects.used >= stats.projects.limit) ||
    (stats.auditsThisMonth.limit !== -1 && stats.auditsThisMonth.used >= stats.auditsThisMonth.limit)

  const accentColor = needsUpgrade ? '#e63946' : '#2d2d2d'

  return (
    <div
      className="p-5 border-2 border-ink/15 bg-paper flex flex-col gap-4"
      style={{
        borderRadius: '220px 30px 240px 20px / 25px 230px 20px 215px',
        boxShadow: '3px 3px 0px 0px #2d2d2d',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            className="font-body text-xs font-bold px-2.5 py-1 border-2 border-ink/20"
            style={{
              borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px',
              background: stats.plan === 'pro' || stats.plan === 'agency' ? '#2d2d2d' : '#f5f0e8',
              color: stats.plan === 'pro' || stats.plan === 'agency' ? '#faf8f5' : '#2d2d2d',
            }}
          >
            {planMeta.name} Plan
          </span>
          {needsUpgrade && (
            <span className="font-body text-xs text-accent font-semibold">⚠️ Limit reached</span>
          )}
        </div>

        {(isFree || isSolo) && (
          <Link
            href="/settings#billing"
            className="flex items-center gap-1 font-body text-xs px-2.5 py-1.5 border-2 border-ink bg-ink text-paper hover:opacity-85 transition-opacity"
            style={{
              borderRadius: '180px 45px 200px 35px / 40px 190px 30px 170px',
              boxShadow: '2px 2px 0 0 #e63946',
            }}
          >
            <Zap size={11} />
            Upgrade
          </Link>
        )}
      </div>

      {/* Meters */}
      <div className="flex flex-col gap-3">
        <MeterBar
          label="Active projects"
          used={stats.projects.used}
          limit={stats.projects.limit}
          accentColor={accentColor}
        />
        <MeterBar
          label="AI audits this month"
          used={stats.auditsThisMonth.used}
          limit={stats.auditsThisMonth.limit}
          accentColor={accentColor}
        />
      </div>
    </div>
  )
}
