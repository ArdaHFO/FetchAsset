/**
 * FetchAsset  Landing Page
 * World-class B2B SaaS landing with graph-paper texture, Framer Motion,
 * HeroSection + 3-Step Magic + Client Portal Preview.
 */

import React from 'react'
import type { Metadata } from 'next'
import {
  ArrowRight,
  Check,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import {
  WobblyButton,
  WobblyCard,
} from '@/components/ui'
import { PLANS, formatPrice } from '@/lib/stripe/plans'
import type { PlanTier } from '@/lib/supabase/types'
import ChaosTable from '@/components/landing/ChaosTable'
import AiAuditPreview from '@/components/landing/AiAuditPreview'
import TrustBadges from '@/components/landing/TrustBadges'
import FaqAccordion from '@/components/landing/FaqAccordion'
import StickyCta from '@/components/landing/StickyCta'
import HeroSection from '@/components/landing/HeroSection'
import ThreeStepMagic from '@/components/landing/ThreeStepMagic'
import ClientPortalPreview from '@/components/landing/ClientPortalPreview'
import CheckoutButton from '@/components/CheckoutButton'
import LandingNav from '@/components/landing/LandingNav'
import MascotVideo from '@/components/landing/MascotVideo'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  alternates: { canonical: '/' },
}

const PLAN_ORDER: PlanTier[] = ['free', 'solo', 'pro', 'agency']

// Graph-paper background: subtle grid lines on the paper texture
const GRAPH_BG: React.CSSProperties = {
  backgroundImage: [
    'linear-gradient(to right,  rgba(45,45,45,0.045) 1px, transparent 1px)',
    'linear-gradient(to bottom, rgba(45,45,45,0.045) 1px, transparent 1px)',
  ].join(','),
  backgroundSize: '28px 28px',
}

export default async function Home() {
  // Fetch user — but do NOT redirect; let logged-in users browse the landing page too
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let userName: string | null = null
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()
    userName = (profile as any)?.full_name || user.email || null
  }

  return (
    <main className="min-h-screen bg-paper relative overflow-x-hidden" style={GRAPH_BG}>

      {/* Background floating deco */}
      <div aria-hidden="true" className="pointer-events-none select-none">
        <div className="absolute top-16 right-[4%] opacity-[0.10] animate-float hidden md:block" style={{ transform: 'rotate(12deg)' }}>
          <Image src="/file1.png" alt="" width={200} height={200} />
        </div>
        <div className="absolute top-40 left-[1%] opacity-[0.08] animate-float-slow hidden md:block" style={{ transform: 'rotate(-9deg)' }}>
          <Image src="/paperclip1.png" alt="" width={160} height={160} />
        </div>
        <div className="absolute top-[280px] right-[14%] opacity-[0.07] animate-float hidden lg:block" style={{ transform: 'rotate(20deg)' }}>
          <Image src="/paperclip2.png" alt="" width={130} height={130} />
        </div>
        <div className="absolute top-[900px] right-[2%] opacity-[0.09] animate-float hidden lg:block" style={{ transform: 'rotate(6deg)' }}>
          <Image src="/file2.png" alt="" width={150} height={150} />
        </div>
        <div className="absolute top-[1100px] left-[3%] opacity-[0.08] animate-float-slow hidden lg:block" style={{ transform: 'rotate(-14deg)' }}>
          <Image src="/file3.png" alt="" width={130} height={130} />
        </div>
        <div className="absolute top-[1800px] left-[2%] opacity-[0.07] animate-float-slow hidden xl:block" style={{ transform: 'rotate(8deg)' }}>
          <Image src="/paperclip2.png" alt="" width={120} height={120} />
        </div>
        <div className="absolute top-[2200px] right-[3%] opacity-[0.08] animate-float hidden xl:block" style={{ transform: 'rotate(-11deg)' }}>
          <Image src="/file1.png" alt="" width={140} height={140} />
        </div>
      </div>

      {/* NAVBAR */}
      <LandingNav userName={userName} />

      {/* ── HERO + STATS (client component — handles Demo overlay) ── */}
      <HeroSection />

      {/* ── MASCOT VIDEO ── */}
      <MascotVideo />

      {/* ── CHAOS TABLE: Old Way vs FetchAsset Way ── */}
      <ChaosTable />

      {/* â”€â”€ 3-STEP MAGIC (framer motion scroll, mascot peek) â”€â”€ */}
      <ThreeStepMagic />

      {/* â”€â”€ AI AUDIT PREVIEW â”€â”€ */}
      <AiAuditPreview />

      {/* â”€â”€ CLIENT PORTAL PREVIEW: "Your clients will love you." â”€â”€ */}
      <ClientPortalPreview />

      {/* â”€â”€ PRICING â”€â”€ */}
      <section id="pricing" className="max-w-5xl mx-auto px-6 py-28 border-t-[3px] border-dashed border-muted">
        <div className="text-center mb-16">
          <span className="tag-label">Pricing</span>
          <h2 className="font-heading text-5xl md:text-6xl text-ink mt-4 leading-tight">Simple, honest pricing</h2>
          <p className="font-body text-lg text-ink/60 max-w-md mx-auto mt-3">
            Start free. Upgrade when you grow. No hidden fees.
          </p>
        </div>
        <div className="flex flex-col md:flex-row gap-6 justify-center items-stretch max-w-5xl mx-auto">
          {PLAN_ORDER.map((tier) => {
            const plan = PLANS[tier]
            const isPro = tier === 'pro'
            const isAgency = tier === 'agency'
            const radius = isPro
              ? '180px 45px 200px 35px / 40px 190px 30px 170px'
              : isAgency
              ? '240px 20px 220px 30px / 20px 215px 25px 230px'
              : '220px 30px 240px 20px / 25px 230px 20px 215px'
            return (
              <div key={tier} className="relative w-full md:flex-1 md:max-w-xs" style={{ transform: isPro ? 'translateY(-10px)' : undefined }}>
                {isPro && (
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-10">
                    <span
                      className="font-heading text-sm font-bold px-5 py-1.5 bg-[#e63946] text-white whitespace-nowrap"
                      style={{ borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px', boxShadow: '3px 3px 0 0 #2d2d2d' }}
                    >
                      ✦ Most Popular
                    </span>
                  </div>
                )}
                <div
                  className="h-full flex flex-col bg-paper overflow-hidden"
                  style={{
                    borderRadius: radius,
                    boxShadow: isPro ? '6px 6px 0 0 #e63946' : '4px 4px 0 0 #2d2d2d',
                    border: isPro ? '3px solid #e63946' : '2px solid rgba(45,45,45,0.7)',
                  }}
                >
                  {isPro && <div className="h-1.5 bg-[#e63946] w-full" />}
                  <div className="flex flex-col flex-1 p-7">
                    {/* Price — top */}
                    <div className="mb-4">
                      <span className="font-heading text-4xl text-ink">{formatPrice(plan.monthlyPrice)}</span>
                      {plan.monthlyPrice > 0 && <span className="font-body text-sm text-ink/50"> / mo</span>}
                    </div>
                    {/* Name + tagline */}
                    <div className="mb-6 pb-5 border-b-2 border-dashed border-ink/10">
                      <h3 className="font-heading text-2xl text-ink">{plan.name}</h3>
                      <p className="font-body text-sm text-ink/50 mt-0.5">{plan.tagline}</p>
                    </div>
                    {/* Short highlight bullets */}
                    <ul className="flex flex-col gap-2 mb-6 flex-1">
                      {plan.features.slice(0, 3).map((feat) => (
                        <li key={feat} className="flex items-start gap-2">
                          <Check
                            size={14}
                            className={`mt-0.5 flex-shrink-0 ${isPro || isAgency ? 'text-green-600' : 'text-ink/60'}`}
                            strokeWidth={2.5}
                          />
                          <span className="font-body text-sm text-ink/80 leading-snug">{feat}</span>
                        </li>
                      ))}
                    </ul>
                    {tier === 'free' ? (
                      <div>
                        <Link href="/login" className="block">
                          <WobblyButton variant="secondary" size="md" className="w-full">Start for free</WobblyButton>
                        </Link>
                        <p className="font-body text-[11px] text-ink/40 text-center mt-2">No credit card required.</p>
                      </div>
                    ) : (
                      <CheckoutButton
                        tier={tier}
                        label={isPro ? `Get ${plan.name}` : `Upgrade to ${plan.name}`}
                        variant={isPro ? 'primary' : 'secondary'}
                      />
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        {/* ── Feature comparison grid ── */}
        <div
          className="mt-20 overflow-x-auto border-2 border-ink/15 bg-paper"
          style={{ borderRadius: '20px 5px 20px 5px / 5px 20px 5px 20px', boxShadow: '4px 4px 0 0 #2d2d2d' }}
        >
          <table className="w-full font-body text-sm min-w-[600px]">
            <thead>
              <tr className="border-b-2 border-ink/10">
                <th className="text-left px-6 py-4 text-xs font-normal text-ink/40 uppercase tracking-widest w-48">Feature</th>
                {PLAN_ORDER.map((tier) => (
                  <th key={tier} className="px-4 py-4 text-center">
                    <div className="flex flex-col items-center gap-1.5">
                      <span className="font-heading text-2xl text-ink">
                        {PLANS[tier].monthlyPrice === 0 ? 'Free' : `$${PLANS[tier].monthlyPrice / 100}`}
                      </span>
                      {PLANS[tier].monthlyPrice > 0 && (
                        <span className="font-body text-[10px] text-ink/40">/mo</span>
                      )}
                      <span
                        className="font-body text-xs font-bold px-3 py-0.5 border-2"
                        style={{
                          borderRadius: '20px 5px 20px 5px / 5px 20px 5px 20px',
                          background: tier === 'pro' ? '#e63946' : 'transparent',
                          color: tier === 'pro' ? '#fff' : '#2d2d2d',
                          borderColor: tier === 'pro' ? '#e63946' : 'rgba(45,45,45,0.2)',
                        }}
                      >
                        {PLANS[tier].name}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {([
                {
                  group: '📁 Projects & Capacity',
                  rows: [
                    { label: 'Active projects',        vals: ['1',  '3',  '15', '∞'] },
                    { label: 'File requests / project',   vals: ['3',  '∞',  '∞',  '∞'] },
                    { label: 'AI file reviews / month',   vals: ['5',  '50', '∞',  '∞'] },
                    { label: 'Bulk download all files',   vals: ['✓',  '✓',  '✓',  '✓'] },
                    { label: 'Approve & reject uploads',  vals: ['✓',  '✓',  '✓',  '✓'] },
                    { label: 'Client reminder emails',    vals: ['✓',  '✓',  '✓',  '✓'] },
                  ],
                },
                {
                  group: '🎨 Portal Branding',
                  rows: [
                    { label: 'Accent color & font',               vals: ['✓', '✓', '✓', '✓'] },
                    { label: 'Custom welcome message',            vals: ['✓', '✓', '✓', '✓'] },
                    { label: 'Portal animation style',            vals: ['✓', '✓', '✓', '✓'] },
                    { label: 'Custom agency logo',               vals: ['—', '✓', '✓', '✓'] },
                    { label: 'Background & card colors',          vals: ['—', '✓', '✓', '✓'] },
                    { label: 'Agency tagline in portal',          vals: ['—', '✓', '✓', '✓'] },
                    { label: 'Remove "Powered by FetchAsset"',   vals: ['—', '✓', '✓', '✓'] },
                    { label: 'Per-request instructions',          vals: ['—', '—', '✓', '✓'] },
                  ],
                },
                {
                  group: '🛠️ Account & Support',
                  rows: [
                    { label: 'Email support',              vals: ['✓', '✓', '✓', '✓'] },
                    { label: 'Priority email support',     vals: ['—', '—', '✓', '✓'] },
                    { label: 'Direct founder support',     vals: ['—', '—', '—', '✓'] },
                    { label: 'Data export (JSON)',         vals: ['✓', '✓', '✓', '✓'] },
                  ],
                },
              ] as { group: string; rows: { label: string; vals: string[] }[] }[]).map((group, gi) => (
                <>
                  <tr key={`g${gi}`} className="border-t-2 border-dashed border-ink/15">
                    <td colSpan={5} className="px-6 py-2.5 font-body text-xs font-bold text-ink/60 uppercase tracking-widest bg-muted/30">
                      {group.group}
                    </td>
                  </tr>
                  {group.rows.map((row, ri) => (
                    <tr key={`${gi}-${ri}`} className={ri % 2 === 0 ? 'bg-paper' : 'bg-muted/10'}>
                      <td className="px-6 py-3.5 font-body text-sm text-ink/80 font-medium">{row.label}</td>
                      {row.vals.map((val, vi) => (
                        <td
                          key={vi}
                          className="px-4 py-3.5 text-center font-body text-sm"
                          style={vi === 2 ? { background: 'rgba(230,57,70,0.04)' } : {}}
                        >
                          {val === '✓' ? (
                            <span
                              className="inline-flex items-center justify-center w-5 h-5 text-paper"
                              style={{
                                borderRadius: '50%',
                                fontSize: '10px',
                                fontWeight: 700,
                                background: vi === 2 ? '#e63946' : '#2d2d2d',
                              }}
                            >✓</span>
                          ) : val === '—' ? (
                            <span className="text-ink/25 text-lg leading-none">&ndash;</span>
                          ) : val === '∞' ? (
                            <span className="font-heading text-lg text-ink">∞</span>
                          ) : (
                            <span className="font-heading text-base text-ink/85">{val}</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
        </div>

        <p className="font-body text-sm text-ink/40 text-center mt-8">
          Upgrade or downgrade any time &middot; Cancel anytime &middot; No credit card required for Free
        </p>
      </section>

      {/* â”€â”€ TRUST BADGES â”€â”€ */}
      <TrustBadges />

      {/* â”€â”€ FAQ â”€â”€ */}
      <FaqAccordion />

      {/* â”€â”€ FINAL CTA â”€â”€ */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-20 md:py-32 border-t-[3px] border-dashed border-muted">
        <div className="max-w-xl mx-auto text-center">
          <span className="tag-label">Ready?</span>
          <h2 className="font-heading text-3xl sm:text-5xl md:text-6xl text-ink mt-4 leading-tight">
            First portal live<br />in under 5 minutes
          </h2>
          <p className="font-body text-xl text-ink/60 max-w-md mx-auto mb-10 mt-4 leading-relaxed">
            No onboarding call. No setup fee. Just sign in and start fetching assets.
          </p>
          <Link href="/login">
            <WobblyButton size="xl" className="gap-3">
              Get Started Free
              <ArrowRight strokeWidth={3} className="w-5 h-5" />
            </WobblyButton>
          </Link>
          <p className="font-body text-sm text-ink/40 mt-5">Free forever for solo agencies</p>
        </div>
      </section>

      {/* STICKY CTA */}
      <StickyCta />

      {/* FOOTER */}
      <footer className="border-t-[3px] border-dashed border-muted bg-white/40 pt-12 pb-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          {/* 3-column grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 pb-10 border-b-2 border-dashed border-muted">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <span className="font-heading text-2xl text-ink">FetchAsset</span>
              <p className="font-body text-xs text-ink/40 mt-2 leading-relaxed max-w-[180px]">
                AI-powered client asset onboarding. Stop chasing files.
              </p>
            </div>
            {/* Product */}
            <div>
              <p className="font-body text-xs uppercase tracking-widest text-ink/35 mb-3">Product</p>
              <div className="flex flex-col gap-2">
                <a href="/#how" className="font-body text-sm text-ink/50 hover:text-ink transition-colors">How It Works</a>
                <Link href="/pricing" className="font-body text-sm text-ink/50 hover:text-ink transition-colors">Pricing</Link>
                <Link href="/demo" className="font-body text-sm text-ink/50 hover:text-ink transition-colors">Live Demo</Link>
              </div>
            </div>
            {/* Company */}
            <div>
              <p className="font-body text-xs uppercase tracking-widest text-ink/35 mb-3">Company</p>
              <div className="flex flex-col gap-2">
                <Link href="/privacy-policy" className="font-body text-sm text-ink/50 hover:text-ink transition-colors">Privacy Policy</Link>
                <Link href="/terms-of-service" className="font-body text-sm text-ink/50 hover:text-ink transition-colors">Terms of Service</Link>
                <Link href="/cookie-policy" className="font-body text-sm text-ink/50 hover:text-ink transition-colors">Cookie Policy</Link>
                <a href="mailto:hfoai@proton.me" className="font-body text-sm text-ink/50 hover:text-ink transition-colors">Contact</a>
              </div>
            </div>
            {/* Account */}
            <div>
              <p className="font-body text-xs uppercase tracking-widest text-ink/35 mb-3">Account</p>
              <div className="flex flex-col gap-2">
                <Link href="/login" className="font-body text-sm text-ink/50 hover:text-ink transition-colors">Login</Link>
                <Link href="/login" className="font-body text-sm text-ink/50 hover:text-ink transition-colors">Sign Up Free</Link>
                <Link href="/dashboard" className="font-body text-sm text-ink/50 hover:text-ink transition-colors">Dashboard</Link>
              </div>
            </div>
          </div>
          {/* Bottom row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6">
            <p className="font-body text-xs text-ink/35">&copy; 2026 FetchAsset, Inc. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <a href="mailto:hfoai@proton.me" className="font-body text-xs text-ink/50 hover:text-ink transition-colors">hfoai@proton.me</a>
              <Link href="/privacy-policy" className="font-body text-xs text-ink/35 hover:text-ink transition-colors">Privacy</Link>
              <Link href="/terms-of-service" className="font-body text-xs text-ink/35 hover:text-ink transition-colors">Terms</Link>
              <Link href="/cookie-policy" className="font-body text-xs text-ink/35 hover:text-ink transition-colors">Cookies</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
