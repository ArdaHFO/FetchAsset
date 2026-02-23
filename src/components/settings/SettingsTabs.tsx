'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Loader2, Check, AlertTriangle, KeyRound, Download,
  Mail, Lock, ShieldCheck, Zap, Crown, Infinity,
} from 'lucide-react'
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

  // Password reset
  const [pwResetState, setPwResetState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  async function sendPasswordReset() {
    setPwResetState('sending')
    try {
      const res = await fetch('/api/settings/reset-password', { method: 'POST' })
      setPwResetState(res.ok ? 'sent' : 'error')
    } catch {
      setPwResetState('error')
    }
  }

  // Data export
  const [exporting, setExporting] = useState(false)

  async function handleExport() {
    setExporting(true)
    try {
      const res = await fetch('/api/settings/export')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `fetchasset-export-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setExporting(false)
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

          {/* Profile card */}
          <WobblyCard flavor="default" shadow="DEFAULT" radius="md">
            <WobblyCardContent className="p-6 flex flex-col gap-5">
              <h2 className="font-heading text-lg text-ink">Profile</h2>

              {/* Email (read-only) */}
              <div className="flex flex-col gap-1">
                <span className="font-body text-xs text-ink/45 uppercase tracking-wider">Email</span>
                <div className="flex items-center gap-2">
                  <Mail size={13} className="text-ink/30" />
                  <span className="font-body text-sm text-ink">{userEmail}</span>
                </div>
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
                <p className="font-body text-xs text-ink/35">Shown on your portal and in emails to clients.</p>
              </div>
            </WobblyCardContent>
          </WobblyCard>

          {/* Security card */}
          <WobblyCard flavor="default" shadow="DEFAULT" radius="md">
            <WobblyCardContent className="p-6 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-ink/50" />
                <h2 className="font-heading text-lg text-ink">Security</h2>
              </div>

              <div className="flex items-center justify-between gap-4 py-2">
                <div>
                  <p className="font-body text-sm text-ink font-medium">Password</p>
                  <p className="font-body text-xs text-ink/45 mt-0.5">
                    We&apos;ll send a secure reset link to <strong>{userEmail}</strong>
                  </p>
                </div>
                <WobblyButton
                  variant="secondary"
                  size="sm"
                  className="flex-shrink-0"
                  onClick={sendPasswordReset}
                  disabled={pwResetState === 'sending' || pwResetState === 'sent'}
                >
                  {pwResetState === 'sending' && <Loader2 size={13} className="mr-1.5 animate-spin" />}
                  {pwResetState === 'sent'    && <Check size={13} className="mr-1.5 text-green-600" />}
                  {pwResetState === 'sent'
                    ? 'Email sent!'
                    : pwResetState === 'sending'
                    ? 'Sending…'
                    : <><KeyRound size={13} className="mr-1.5" />Change password</>}
                </WobblyButton>
              </div>
              {pwResetState === 'sent' && (
                <p className="font-body text-xs text-green-700 bg-green-50 border border-green-200 px-3 py-2"
                  style={{ borderRadius: '8px 2px 8px 2px / 2px 8px 2px 8px' }}>
                  ✅ Check your inbox — password reset link sent to {userEmail}
                </p>
              )}
              {pwResetState === 'error' && (
                <p className="font-body text-xs text-accent">Failed to send reset email. Try again.</p>
              )}
            </WobblyCardContent>
          </WobblyCard>

          {/* Data & Privacy card */}
          <WobblyCard flavor="default" shadow="DEFAULT" radius="md">
            <WobblyCardContent className="p-6 flex flex-col gap-4">
              <h2 className="font-heading text-lg text-ink">Data &amp; Privacy</h2>

              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-body text-sm text-ink font-medium">Export all data</p>
                  <p className="font-body text-xs text-ink/45 mt-0.5">
                    Download all your projects, requests, and submissions as JSON.
                  </p>
                </div>
                <WobblyButton
                  variant="secondary"
                  size="sm"
                  className="flex-shrink-0"
                  onClick={handleExport}
                  disabled={exporting}
                >
                  {exporting
                    ? <><Loader2 size={13} className="mr-1.5 animate-spin" />Exporting…</>
                    : <><Download size={13} className="mr-1.5" />Export JSON</>}
                </WobblyButton>
              </div>

              <div
                className="flex flex-col gap-1.5 p-3 bg-muted/30 border border-ink/10 font-body text-xs text-ink/50"
                style={{ borderRadius: '8px 2px 8px 2px / 2px 8px 2px 8px' }}
              >
                <p>🔒 Your data belongs to you and can be exported at any time.</p>
                <p>📁 Export includes: projects, asset requests, submission metadata.</p>
                <p>🚫 File contents are not included (only file names and metadata).</p>
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
                      This will delete <strong>all your projects, submissions, and data</strong>. Type <strong>{deleteConfirmWord}</strong> to confirm:
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
                    <WobblyButton variant="ghost" size="sm" onClick={() => { setDeletePhase('idle'); setDeleteInput('') }} disabled={deletePhase === 'deleting'}>Cancel</WobblyButton>
                    <WobblyButton variant="primary" size="sm" className="!bg-accent !border-accent" onClick={handleDeleteAccount} disabled={deleteInput !== deleteConfirmWord || deletePhase === 'deleting'}>
                      {deletePhase === 'deleting' ? <><Loader2 size={13} className="mr-1.5 animate-spin" />Deleting…</> : 'Delete everything'}
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
        <div className="flex flex-col gap-5">

          {/* Current plan card */}
          <WobblyCard flavor="default" shadow="DEFAULT" radius="md">
            <WobblyCardContent className="p-6 flex flex-col gap-5">
              <div className="flex items-center justify-between gap-4">
                <h2 className="font-heading text-lg text-ink">Current Plan</h2>
                <PlanBadge plan={plan} />
              </div>

              <div
                className="flex flex-col gap-2 p-4 bg-muted/40 border border-ink/10"
                style={{ borderRadius: '10px 3px 10px 3px / 3px 10px 3px 10px' }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-body text-sm text-ink font-medium">{planMeta.name} plan</span>
                  <span className="font-body text-sm text-ink">
                    {planMeta.monthlyPrice === 0 ? 'Free forever' : `${formatPrice(planMeta.monthlyPrice)} / mo`}
                  </span>
                </div>
                {subStatus && (
                  <div className="flex items-center justify-between">
                    <span className="font-body text-xs text-ink/50">Status</span>
                    <span className="font-body text-xs text-ink/70">{STATUS_LABELS[subStatus] ?? subStatus}</span>
                  </div>
                )}
                {[
                  { label: 'Projects', val: planMeta.projectLimit === -1 ? 'Unlimited' : `${planMeta.projectLimit}` },
                  { label: 'AI audits / mo', val: planMeta.aiAuditsPerMonth === -1 ? 'Unlimited' : `${planMeta.aiAuditsPerMonth}` },
                  { label: 'Requests / project', val: planMeta.requestsPerProject === -1 ? 'Unlimited' : `${planMeta.requestsPerProject}` },
                  { label: 'White-label portal', val: planMeta.whiteLabel ? '✓ Included' : '✗ Not included' },
                ].map(({ label, val }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="font-body text-xs text-ink/50">{label}</span>
                    <span className={cn('font-body text-xs', val.startsWith('✓') ? 'text-green-700' : val.startsWith('✗') ? 'text-ink/30' : 'text-ink/70')}>{val}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-2">
                {hasPaidPlan ? (
                  <form action="/api/stripe/portal" method="POST">
                    <WobblyButton variant="secondary" size="sm" type="submit" className="w-full">Manage subscription →</WobblyButton>
                  </form>
                ) : (
                  <Link href="/pricing">
                    <WobblyButton variant="primary" size="sm" className="w-full">Upgrade plan →</WobblyButton>
                  </Link>
                )}
              </div>
            </WobblyCardContent>
          </WobblyCard>

          {/* Plan comparison table */}
          <WobblyCard flavor="default" shadow="DEFAULT" radius="md">
            <WobblyCardContent className="p-6 flex flex-col gap-4">
              <h2 className="font-heading text-lg text-ink">Plan Comparison</h2>

              <div className="overflow-x-auto -mx-2">
                <table className="w-full font-body text-sm min-w-[520px]">
                  <thead>
                    <tr>
                      <th className="text-left px-2 py-2 text-xs text-ink/40 uppercase tracking-wider font-normal w-40">Feature</th>
                      {(['free', 'solo', 'pro', 'agency'] as PlanTier[]).map((p) => (
                        <th key={p} className="px-2 py-2 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span
                              className={cn(
                                'font-body text-xs font-bold px-2 py-0.5',
                                p === plan
                                  ? 'bg-ink text-paper border-2 border-ink'
                                  : 'bg-muted text-ink/60'
                              )}
                              style={{ borderRadius: '20px 5px 20px 5px / 5px 20px 5px 20px' }}
                            >
                              {PLANS[p].name}
                              {p === plan && ' ✓'}
                            </span>
                            <span className="font-body text-xs text-ink/40">
                              {PLANS[p].monthlyPrice === 0 ? 'Free' : `${formatPrice(PLANS[p].monthlyPrice)}/mo`}
                            </span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      {
                        label: 'Projects',
                        icon: '📁',
                        vals: (['free', 'solo', 'pro', 'agency'] as PlanTier[]).map(p =>
                          PLANS[p].projectLimit === -1 ? '∞' : String(PLANS[p].projectLimit)
                        ),
                      },
                      {
                        label: 'Requests / project',
                        icon: '📋',
                        vals: (['free', 'solo', 'pro', 'agency'] as PlanTier[]).map(p =>
                          PLANS[p].requestsPerProject === -1 ? '∞' : String(PLANS[p].requestsPerProject)
                        ),
                      },
                      {
                        label: 'AI audits / mo',
                        icon: '🤖',
                        vals: (['free', 'solo', 'pro', 'agency'] as PlanTier[]).map(p =>
                          PLANS[p].aiAuditsPerMonth === -1 ? '∞' : String(PLANS[p].aiAuditsPerMonth)
                        ),
                      },
                      {
                        label: 'White-label portal',
                        icon: '🎨',
                        vals: (['free', 'solo', 'pro', 'agency'] as PlanTier[]).map(p =>
                          PLANS[p].whiteLabel ? '✓' : '—'
                        ),
                      },
                      {
                        label: 'Team members',
                        icon: '👥',
                        vals: (['free', 'solo', 'pro', 'agency'] as PlanTier[]).map(p =>
                          PLANS[p].teamMembers === -1 ? '∞' : String(PLANS[p].teamMembers)
                        ),
                      },
                    ].map((row, i) => (
                      <tr key={row.label} className={i % 2 === 0 ? 'bg-muted/20' : ''}>
                        <td className="px-2 py-2.5 font-body text-xs text-ink/60">
                          <span className="mr-1.5">{row.icon}</span>{row.label}
                        </td>
                        {row.vals.map((val, j) => {
                          const colPlan = (['free', 'solo', 'pro', 'agency'] as PlanTier[])[j]
                          const isCurrent = colPlan === plan
                          return (
                            <td
                              key={j}
                              className={cn(
                                'px-2 py-2.5 text-center font-body text-xs font-semibold',
                                val === '∞' || val === '✓' ? 'text-green-700' :
                                val === '—' ? 'text-ink/20' :
                                isCurrent ? 'text-ink' : 'text-ink/50'
                              )}
                              style={isCurrent ? { background: 'rgba(45,45,45,0.04)' } : {}}
                            >
                              {val === '∞' ? <Infinity size={13} className="inline" /> : val}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {plan !== 'agency' && (
                <div
                  className="flex items-center justify-between gap-4 p-4 border-2 border-ink/15 bg-postit"
                  style={{
                    borderRadius: '12px 3px 12px 3px / 3px 12px 3px 12px',
                    boxShadow: '3px 3px 0 0 #2d2d2d',
                  }}
                >
                  <div>
                    <p className="font-body text-sm font-bold text-ink">
                      {plan === 'free' ? '🚀 Start growing — upgrade to Solo' :
                       plan === 'solo' ? '⚡ Need more? Upgrade to Pro' :
                       '👑 Go unlimited with Agency'}
                    </p>
                    <p className="font-body text-xs text-ink/60 mt-0.5">
                      {plan === 'free' ? '3 projects · unlimited requests · 50 AI audits' :
                       plan === 'solo' ? '15 projects · unlimited AI audits · white-label portal' :
                       'Unlimited everything · custom domain · team members'}
                    </p>
                  </div>
                  <Link href="/pricing" className="flex-shrink-0">
                    <WobblyButton variant="primary" size="sm">
                      <Zap size={13} className="mr-1.5" />
                      Upgrade
                    </WobblyButton>
                  </Link>
                </div>
              )}
            </WobblyCardContent>
          </WobblyCard>
        </div>
      )}

      {/* Branding tab */}
      {tab === 'branding' && (
        hasBranding ? (
          <BrandingHub initial={branding} agencyName={agencyName} plan={plan} />
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
