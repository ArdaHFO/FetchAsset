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

export default function Home() {
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
      <LandingNav />

      {/* â”€â”€ HERO + STATS (client component â€” handles Demo overlay) â”€â”€ */}
      <HeroSection />

      {/* â”€â”€ CHAOS TABLE: Old Way vs FetchAsset Way â”€â”€ */}
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
                    <span className="font-body text-xs font-bold px-4 py-1 bg-ink text-paper whitespace-nowrap" style={{ borderRadius: '20px 4px 20px 4px / 4px 20px 4px 20px' }}>
                       Most popular
                    </span>
                  </div>
                )}
                <div className="h-full flex flex-col bg-paper border-2 border-ink overflow-hidden" style={{ borderRadius: radius, boxShadow: isPro ? '6px 6px 0 0 #2d2d2d' : '4px 4px 0 0 #2d2d2d' }}>
                  {isPro && <div className="h-1.5 bg-ink w-full" />}
                  <div className="flex flex-col flex-1 p-7">
                    <div className="mb-5">
                      <h3 className="font-heading text-2xl text-ink">{plan.name}</h3>
                      <p className="font-body text-sm text-ink/50 mt-0.5">{plan.tagline}</p>
                    </div>
                    <div className="mb-7">
                      <span className="font-heading text-4xl text-ink">{formatPrice(plan.monthlyPrice)}</span>
                      {plan.monthlyPrice > 0 && <span className="font-body text-sm text-ink/50"> / mo</span>}
                      {isPro && (
                        <p className="font-body text-xs text-ink/40 mt-1.5 leading-snug">
                          Got a code? Apply it at checkout for a special launch discount.
                        </p>
                      )}
                    </div>
                    <ul className="flex flex-col gap-2.5 mb-7 flex-1">
                      {plan.features.map((feat) => (
                        <li key={feat} className="flex items-start gap-2">
                          <Check size={13} className="text-ink mt-0.5 flex-shrink-0" strokeWidth={3} />
                          <span className="font-body text-sm text-ink/80">{feat}</span>
                        </li>
                      ))}
                    </ul>
                    {tier === 'free' ? (
                      <Link href="/login" className="block">
                        <WobblyButton variant="secondary" size="md" className="w-full">Start for free</WobblyButton>
                      </Link>
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
        <p className="font-body text-sm text-ink/40 text-center mt-10">
          Upgrade or downgrade any time &middot; Cancel anytime
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
