import { cn } from '@/lib/utils'
import { WobblyCard, WobblyCardContent } from '@/components/ui'
import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  flavor?: 'default' | 'postit' | 'muted' | 'accent' | 'blue'
  rotate?: '0.5' | '-0.5' | '1' | '-1' | 'none'
  trend?: { value: number; label: string }
}

export function StatCard({ label, value, icon: Icon, flavor = 'default', rotate = 'none', trend }: StatCardProps) {
  return (
    <WobblyCard flavor={flavor} shadow="DEFAULT" radius="md" rotate={rotate} hoverable>
      <WobblyCardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <p className="font-body text-xs text-ink/50 uppercase tracking-wide">{label}</p>
            <p className="font-heading text-3xl text-ink leading-none">{value}</p>
            {trend && (
              <p
                className={cn(
                  'font-body text-xs mt-1',
                  trend.value >= 0 ? 'text-ink/50' : 'text-accent'
                )}
              >
                {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)} {trend.label}
              </p>
            )}
          </div>
          <div
            className="p-2.5 bg-ink/8 flex items-center justify-center flex-shrink-0"
            style={{ borderRadius: '12px 3px 12px 3px / 3px 12px 3px 12px' }}
          >
            <Icon size={20} className="text-ink/60" />
          </div>
        </div>
      </WobblyCardContent>
    </WobblyCard>
  )
}
