'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Loader2, Check, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PLANS, formatPrice } from '@/lib/stripe/plans'
import { WobblyCard, WobblyCardContent, WobblyButton } from '@/components/ui'
import BrandingHub, { type BrandingValues } from '@/components/settings/BrandingHub'
import type { PlanTier } from '@/lib/supabase/types'

// ── Tab types ──────────────────────────────────────────────────────

type Tab = 'account' | 'billing' | 'branding'

interface SettingsTabsProps {
  activeDefault?: Tab
  agencyName: string
  branding: BrandingValues
  plan: PlanTier
  userEmail: string
  fullName: string | null
  subStatus: string | null
  hasPaidPlan: boolean
}

// ── Status label map ──────────────────────────────────────────────

const STATUS_LABELS: Record<string, string> = {
  active:             '✅ Active',
  trialing:           '🎁 Trial',
  past_due:           '⚠️ Past due',
  canceled:           '✗ Canceled',
  incomplete:         '⏳ Incomplete',
  incomplete_expired: '✗ Expired',
  unpaid:             '⚠️ Unpaid',
}

// ── Plan badge ────────────────────────────────────────────────────

function PlanBadge({ plan }: { plan: PlanTier }) {
  const colors: Record<PlanTier, string> = {
    free:   'bg-muted text-ink/70',
    solo:   'bg-postit text-ink',
    pro:    'bg-blue/10 text-blue',
    agency: 'bg-ink text-paper',
  }
  return (
    <span
      className={`font-body text-sm font-bold px-3 py-0.5 ${colors[plan]}`}
      style={{ borderRadius: '20px 5px 20px 5px / 5px 20px 5px 20px' }}
    >
      {PLANS[plan].name}
    </span>
  )
}

// ── Tab button ────────────────────────────────────────────────────

function TabBtn({
  id, label, active, onClick, badge,
}: {
  id: Tab; label: string; active: boolean; onClick: () => void; badge?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative px-5 py-2.5 font-body text-sm font-bold transition-all border-2',
        active
          ? 'bg-ink text-paper border-ink shadow-[3px_3px_0px_0px_#2d2d2d] translate-x-[-1px] translate-y-[-1px]'
          : 'bg-paper text-ink/60 border-ink/20 hover:border-ink/50 hover:text-ink'
      )}
      style={{ borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px' }}
    >
      {label}
      {badge && (
        <span
          className="absolute -top-2 -right-2 font-body text-[9px] font-bold px-1.5 py-0.5 bg-accent text-white border border-accent"
          style={{ borderRadius: '20px' }}
        >
          {badge}
        </span>
      )}
    </button>
  )
}

// ── Main SettingsTabs component ───────────────────────────────────

export default function SettingsTabs({
  activeDefault = 'account',
  agencyName,
  branding,
  plan,
  userEmail,
  fullName,
  subStatus,
  hasPaidPlan,
}: SettingsTabsProps) {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>(activeDefault)

  // Account tab — editable name
  const [nameVal, setNameVal] = useState(fullName ?? '')
  const [nameSaving, setNameSaving] = useState(false)
  const [nameSaved, setNameSaved] = useState(false)
  const [nameError, setNameError] = useState('')

  async function saveName() {
    if (!nameVal.trim()) return
    setNameSaving(true)
    setNameError('')
    try {
      const res = await fetch('/api/settings/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: nameVal.trim() }),
      })
      const json = await res.json()
      if (!res.ok) { setNameError(json.error ?? 'Save failed.'); return }
      setNameSaved(true)
      router.refresh()
      setTimeout(() => setNameSaved(false), 2500)
    } catch {
      setNameError('Save failed. Try again.')
    } finally {
      setNameSaving(false)
    }
  }

  // Danger zone — delete account
  const [deletePhase, setDeletePhase] = useState<'idle' | 'confirm' | 'deleting'>('idle')
  const [deleteInput, setDeleteInput] = useState('')
  const deleteConfirmWord = 'DELETE'

  async function handleDeleteAccount() {
    if (deleteInput !== deleteConfirmWord) return
    setDeletePhase('deleting')
    try {
      await fetch('/api/settings/profile', { method: 'DELETE' })
      window.location.href = '/'
    } catch {
      setDeletePhase('confirm')
    }
  }

  const hasBranding = plan === 'solo' || plan === 'pro' || plan === 'agency'
  const planMeta = PLANS[plan]

  return (
    <div className="flex flex-col gap-6">
      {/* Tab bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <TabBtn id="account"  label="Account"  active={tab === 'account'}  onClick={() => setTab('account')} />
        <TabBtn id="billing"  label="Billing"  active={tab === 'billing'}  onClick={() => setTab('billing')} />
        <TabBtn
          id="branding"
          label="✦ Branding"
          active={tab === 'branding'}
          onClick={() => setTab('branding')}
          badge={!hasBranding ? 'PRO' : undefined}
        />
      </div>

      {/* Account tab */}
      {tab === 'account' && (
        <div className="flex flex-col gap-5">
          <WobblyCard flavor="default" shadow="DEFAULT" radius="md">
            <WobblyCardContent className="p-6 flex flex-col gap-5">
              <h2 className="font-heading text-lg text-ink">Account</h2>

              {/* Email (read-only) */}
              <div className="flex flex-col gap-1">
                <span className="font-body text-xs text-ink/45 uppercase tracking-wider">Email</span>
                <span className="font-body text-sm text-ink">{userEmail}</span>
              </div>

              {/* Editable name */}
              <div className="flex flex-col gap-2">
                <label className="font-body text-xs text-ink/45 uppercase tracking-wider">Display Name</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={nameVal}
                    onChange={(e) => { setNameVal(e.target.value); setNameSaved(false) }}
                    onKeyDown={(e) => { if (e.key === 'Enter') saveName() }}
                    placeholder="Your name or agency name"
                    className="flex-1 px-4 py-2.5 font-body text-sm text-ink bg-paper border-2 border-ink/30 outline-none focus:border-ink transition-all"
                    style={{ borderRadius: '220px 30px 240px 20px / 25px 230px 20px 215px' }}
                  />
                  <WobblyButton
                    variant="primary"
                    size="sm"
                    onClick={saveName}
                    disabled={nameSaving || !nameVal.trim() || nameVal.trim() === (fullName ?? '')}
                    className="flex-shrink-0"
                  >
                    {nameSaving
                      ? <Loader2 size={14} className="animate-spin" />
                      : nameSaved
                      ? <><Check size={14} className="mr-1" />Saved!</>
                      : 'Save'}
                  </WobblyButton>
                </div>
                {nameError && <p className="font-body text-xs text-accent">{nameError}</p>}
                <p className="font-body text-xs text-ink/35">
                  Shown on your portal and in emails to clients.
                </p>
              </div>
            </WobblyCardContent>
          </WobblyCard>

          {/* Danger zone */}
          <WobblyCard flavor="default" shadow="DEFAULT" radius="md">
            <WobblyCardContent className="p-6 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} className="text-accent flex-shrink-0" />
                <h2 className="font-heading text-lg text-accent">Danger Zone</h2>
              </div>

              {deletePhase === 'idle' && (
                <>
                  <p className="font-body text-sm text-ink/60">
                    Permanently delete your account, all projects, and all uploaded files. This cannot be undone.
                  </p>
                  <WobblyButton
                    variant="ghost"
                    size="sm"
                    className="self-start !border-accent !text-accent hover:!bg-accent/10"
                    onClick={() => setDeletePhase('confirm')}
                  >
                    Delete my account
                  </WobblyButton>
                </>
              )}

              {(deletePhase === 'confirm' || deletePhase === 'deleting') && (
                <div className="flex flex-col gap-3">
                  <div
                    className="p-4 bg-accent/5 border-2 border-accent/30"
                    style={{ borderRadius: '10px 3px 10px 3px / 3px 10px 3px 10px' }}
                  >
                    <p className="font-body text-sm text-ink/80 mb-3">
                      This will delete <strong>all your projects, submissions, and data</strong>. To confirm, type <strong>{deleteConfirmWord}</strong> below:
                    </p>
                    <input
                      type="text"
                      value={deleteInput}
                      onChange={(e) => setDeleteInput(e.target.value.toUpperCase())}
                      placeholder={deleteConfirmWord}
                      disabled={deletePhase === 'deleting'}
                      className="w-full px-4 py-2.5 font-body text-sm text-ink bg-paper border-2 border-accent/40 outline-none focus:border-accent transition-all"
                      style={{ borderRadius: '220px 30px 240px 20px / 25px 230px 20px 215px' }}
                    />
                  </div>
                  <div className="flex gap-2">
                    <WobblyButton
                      variant="ghost"
                      size="sm"
                      onClick={() => { setDeletePhase('idle'); setDeleteInput('') }}
                      disabled={deletePhase === 'deleting'}
                    >
                      Cancel
                    </WobblyButton>
                    <WobblyButton
                      variant="primary"
                      size="sm"
                      className="!bg-accent !border-accent"
                      onClick={handleDeleteAccount}
                      disabled={deleteInput !== deleteConfirmWord || deletePhase === 'deleting'}
                    >
                      {deletePhase === 'deleting'
                        ? <><Loader2 size={13} className="mr-1.5 animate-spin" />Deleting…</>
                        : 'Delete everything'}
                    </WobblyButton>
                  </div>
                </div>
              )}
            </WobblyCardContent>
          </WobblyCard>
        </div>
      )}

      {/* Billing tab */}
      {tab === 'billing' && (
        <WobblyCard flavor="default" shadow="DEFAULT" radius="md">
          <WobblyCardContent className="p-6 flex flex-col gap-5">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-heading text-lg text-ink">Billing</h2>
              <PlanBadge plan={plan} />
            </div>

            <div
              className="flex flex-col gap-2 p-4 bg-muted/40 border border-ink/10"
              style={{ borderRadius: '10px 3px 10px 3px / 3px 10px 3px 10px' }}
            >
              <div className="flex items-center justify-between">
                <span className="font-body text-sm text-ink font-medium">{planMeta.name} plan</span>
                <span className="font-body text-sm text-ink">
                  {planMeta.monthlyPrice === 0 ? 'Free' : `${formatPrice(planMeta.monthlyPrice)} / mo`}
                </span>
              </div>
              {subStatus && (
                <div className="flex items-center justify-between">
                  <span className="font-body text-xs text-ink/50">Subscription status</span>
                  <span className="font-body text-xs text-ink/70">
                    {STATUS_LABELS[subStatus] ?? subStatus}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="font-body text-xs text-ink/50">Projects</span>
                <span className="font-body text-xs text-ink/70">
                  {planMeta.projectLimit === -1 ? 'Unlimited' : `Up to ${planMeta.projectLimit}`}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-body text-xs text-ink/50">AI audits</span>
                <span className="font-body text-xs text-ink/70">
                  {planMeta.aiAuditsPerMonth === -1 ? 'Unlimited' : `${planMeta.aiAuditsPerMonth} / month`}
                </span>
              </div>
              {planMeta.whiteLabel && (
                <div className="flex items-center justify-between">
                  <span className="font-body text-xs text-ink/50">White-label portal</span>
                  <span className="font-body text-xs text-green-700">✓ Included</span>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              {hasPaidPlan ? (
                <form action="/api/stripe/portal" method="POST">
                  <WobblyButton variant="secondary" size="sm" type="submit" className="w-full">
                    Manage subscription →
                  </WobblyButton>
                </form>
              ) : (
                <Link href="/pricing">
                  <WobblyButton variant="primary" size="sm" className="w-full">
                    Upgrade plan →
                  </WobblyButton>
                </Link>
              )}
              {!hasPaidPlan && (
                <p className="font-body text-xs text-ink/40 text-center">
                  Free plan · {planMeta.projectLimit} projects · {planMeta.aiAuditsPerMonth} AI audits/mo
                </p>
              )}
            </div>
          </WobblyCardContent>
        </WobblyCard>
      )}

      {/* Branding tab */}
      {tab === 'branding' && (
        hasBranding ? (
          <BrandingHub initial={branding} agencyName={agencyName} />
        ) : (
          <div
            className="p-8 border-2 border-ink/15 text-center bg-muted/20"
            style={{ borderRadius: '220px 30px 240px 20px / 25px 230px 20px 215px' }}
          >
            <p className="text-4xl mb-3">🎨</p>
            <h3 className="font-heading text-2xl text-ink mb-1">White-Label Your Portal</h3>
            <p className="font-body text-sm text-ink/60 max-w-md mx-auto mb-5">
              Upload your agency logo, set your brand colors, and make clients think you built a custom product.
              Available on Solo plan and above.
            </p>
            <Link href="/pricing">
              <button
                type="button"
                className="px-6 py-3 font-body text-sm font-bold bg-ink text-paper border-2 border-ink shadow-[4px_4px_0px_0px_#2d2d2d] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#2d2d2d] transition-all"
                style={{ borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px' }}
              >
                Upgrade to unlock Branding →
              </button>
            </Link>
          </div>
        )
      )}
    </div>
  )
}
