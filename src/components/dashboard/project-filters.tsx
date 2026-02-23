'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useCallback, useTransition, useState } from 'react'
import { Search, X, ArrowUpDown } from 'lucide-react'

interface ProjectFiltersProps {
  currentQuery: string
  currentStatus: string
  currentSort: string
  statusCounts: Record<string, number>
}

const STATUS_FILTERS = ['all', 'active', 'draft', 'completed', 'archived'] as const

const SORT_OPTIONS = [
  { value: 'newest',   label: 'Newest first' },
  { value: 'oldest',   label: 'Oldest first' },
  { value: 'deadline', label: 'Deadline ↑' },
  { value: 'client',   label: 'Client name' },
  { value: 'title',    label: 'Project title' },
]

export function ProjectFilters({
  currentQuery,
  currentStatus,
  currentSort,
  statusCounts,
}: ProjectFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [, startTransition] = useTransition()
  const [inputVal, setInputVal] = useState(currentQuery)

  function buildUrl(overrides: Record<string, string>) {
    const params = new URLSearchParams()
    const merged = {
      status: currentStatus,
      q: currentQuery,
      sort: currentSort,
      ...overrides,
    }
    if (merged.status && merged.status !== 'all') params.set('status', merged.status)
    if (merged.q) params.set('q', merged.q)
    if (merged.sort && merged.sort !== 'newest') params.set('sort', merged.sort)
    const qs = params.toString()
    return qs ? `${pathname}?${qs}` : pathname
  }

  const handleSearch = useCallback(
    (val: string) => {
      setInputVal(val)
      startTransition(() => {
        router.push(buildUrl({ q: val }))
      })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentStatus, currentSort]
  )

  return (
    <div className="flex flex-col gap-3">
      {/* Search + Sort row */}
      <div className="flex flex-col sm:flex-row gap-2">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/35 pointer-events-none" />
          <input
            type="text"
            value={inputVal}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search by project or client name…"
            className="w-full pl-9 pr-9 py-2.5 font-body text-sm text-ink bg-paper border-2 border-ink/25 outline-none focus:border-ink transition-all"
            style={{ borderRadius: '220px 30px 240px 20px / 25px 230px 20px 215px' }}
          />
          {inputVal && (
            <button
              onClick={() => handleSearch('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink/30 hover:text-ink transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Sort */}
        <div className="relative flex-shrink-0">
          <ArrowUpDown size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/35 pointer-events-none" />
          <select
            value={currentSort}
            onChange={(e) =>
              startTransition(() => router.push(buildUrl({ sort: e.target.value })))
            }
            className="pl-9 pr-4 py-2.5 font-body text-sm text-ink bg-paper border-2 border-ink/25 outline-none focus:border-ink transition-all appearance-none cursor-pointer"
            style={{ borderRadius: '220px 30px 240px 20px / 25px 230px 20px 215px' }}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Status filter pills */}
      <div className="flex flex-wrap items-center gap-2">
        {STATUS_FILTERS.map((filter) => {
          const count = filter === 'all'
            ? Object.values(statusCounts).reduce((a, b) => a + b, 0)
            : (statusCounts[filter] ?? 0)
          const isActive = currentStatus === filter
          return (
            <button
              key={filter}
              onClick={() =>
                startTransition(() =>
                  router.push(buildUrl({ status: filter }))
                )
              }
              className="font-body text-sm px-3 py-1.5 border-2 transition-all capitalize flex items-center gap-2"
              style={{
                borderRadius: '245px 18px 200px 20px / 22px 210px 14px 240px',
                background: isActive ? '#2d2d2d' : 'transparent',
                color: isActive ? '#fdfbf7' : 'rgba(45,45,45,0.6)',
                borderColor: isActive ? '#2d2d2d' : 'rgba(45,45,45,0.25)',
                boxShadow: isActive ? '2px 2px 0px 0px #2d2d2d' : 'none',
              }}
            >
              {filter}
              <span
                className="text-[11px] font-bold px-1.5 py-0.5 leading-none"
                style={{
                  borderRadius: '20px',
                  background: isActive ? 'rgba(255,255,255,0.2)' : 'rgba(45,45,45,0.08)',
                  color: isActive ? '#fdfbf7' : 'rgba(45,45,45,0.5)',
                }}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
