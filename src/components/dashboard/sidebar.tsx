'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FolderKanban,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Zap,
} from 'lucide-react'
import type { PlanTier } from '@/lib/supabase/types'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
}

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/projects', label: 'Projects', icon: FolderKanban },
  { href: '/settings', label: 'Settings', icon: Settings },
]

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon
  return (
    <Link
      href={item.href}
      className={cn(
        'group flex items-center gap-3 px-4 py-2.5 font-body text-sm transition-all relative',
        active
          ? 'bg-ink text-paper'
          : 'text-ink/70 hover:text-ink hover:bg-ink/5'
      )}
      style={{
        borderRadius: active
          ? '245px 18px 200px 20px / 22px 210px 14px 240px'
          : '245px 18px 200px 20px / 22px 210px 14px 240px',
        boxShadow: active ? '2px 2px 0px 0px #2d2d2d' : 'none',
      }}
    >
      <Icon size={16} className={cn(active ? 'text-paper' : 'text-ink/50 group-hover:text-ink')} />
      <span>{item.label}</span>
      {active && <ChevronRight size={12} className="ml-auto text-paper/60" />}
    </Link>
  )
}

interface SidebarProps {
  userEmail?: string
  plan?: PlanTier
}

export function Sidebar({ userEmail, plan = 'free' }: SidebarProps) {
  const pathname = usePathname()
  const [signingOut, setSigningOut] = useState(false)

  async function handleSignOut() {
    setSigningOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    // Full page reload ensures server-side session is cleared before redirect
    window.location.href = '/login'
  }

  const activeHref = NAV_ITEMS.find((item) =>
    item.href === '/dashboard'
      ? pathname === '/dashboard'
      : pathname.startsWith(item.href)
  )?.href

  return (
    <aside
      className="flex flex-col h-full bg-paper border-r-2 border-ink/15 px-3 py-5 gap-2"
      style={{ minWidth: 220 }}
    >
      {/* Logo */}
      <Link href="/onboarding" className="px-3 mb-4 flex items-center gap-2">
        <span className="font-heading text-2xl text-ink leading-none">
          Fetch<span className="text-accent">Asset</span>
        </span>
      </Link>

      {/* Nav */}
      <nav className="flex flex-col gap-1 flex-1">
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.href} item={item} active={activeHref === item.href} />
        ))}
      </nav>

      {/* Upgrade nudge for free plan */}
      {plan === 'free' && (
        <Link
          href="/pricing"
          className="mx-1 flex items-center gap-2.5 px-3 py-2.5 bg-postit border-2 border-ink transition-all hover:shadow-[2px_2px_0_0_#2d2d2d]"
          style={{
            borderRadius: '12px 3px 12px 3px / 3px 12px 3px 12px',
            boxShadow: '3px 3px 0 0 #2d2d2d',
          }}
        >
          <Zap size={14} className="flex-shrink-0 text-ink" />
          <div className="min-w-0">
            <p className="font-body text-xs font-bold text-ink leading-tight">Upgrade plan</p>
            <p className="font-body text-[10px] text-ink/60 leading-tight">More projects &amp; AI audits</p>
          </div>
        </Link>
      )}

      {/* User + sign out */}
      <div
        className="mt-auto pt-4 border-t-2 border-ink/10 flex flex-col gap-2"
      >
        {userEmail && (
          <div className="px-4 py-2">
            <p className="font-body text-xs text-ink/40 truncate">{userEmail}</p>
          </div>
        )}
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="flex items-center gap-3 px-4 py-2.5 font-body text-sm text-ink/60 hover:text-accent hover:bg-accent/5 transition-all w-full"
          style={{ borderRadius: '245px 18px 200px 20px / 22px 210px 14px 240px' }}
        >
          <LogOut size={15} />
          <span>{signingOut ? 'Signing out…' : 'Sign out'}</span>
        </button>
      </div>
    </aside>
  )
}

export function MobileSidebar({ userEmail, plan }: SidebarProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="p-2 text-ink"
        style={{ borderRadius: '12px 3px 10px 4px / 4px 12px 3px 10px' }}
        aria-label="Open menu"
      >
        <Menu size={22} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-ink/30"
            onClick={() => setOpen(false)}
          />
          {/* Drawer */}
          <div
            className="relative z-10 w-64 h-full"
            style={{ boxShadow: '4px 0 0 0 #2d2d2d' }}
          >
            <div className="absolute top-3 right-3">
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 text-ink hover:bg-muted"
                style={{ borderRadius: '8px 2px 8px 2px / 2px 8px 2px 8px' }}
              >
                <X size={18} />
              </button>
            </div>
            <Sidebar userEmail={userEmail} plan={plan} />
          </div>
        </div>
      )}
    </>
  )
}
