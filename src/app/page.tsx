/**
 * FetchAsset  Landing Page
 * Clean, conversion-focused. No dev scaffolding.
 */

import React from 'react'
import type { Metadata } from 'next'
import {
  ArrowRight,
  Zap,
  Check,
  CheckCircle,
  Lock,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import {
  WobblyButton,
  WobblyCard,
  WobblyCardHeader,
  WobblyCardTitle,
  WobblyCardDescription,
  WobblyCardContent,
  WobblyCardFooter,
} from '@/components/ui'
import { PLANS, formatPrice } from '@/lib/stripe/plans'
import type { PlanTier } from '@/lib/supabase/types'

export const metadata: Metadata = {
  alternates: { canonical: '/' },
}

const PLAN_ORDER: PlanTier[] = ['free', 'solo', 'pro', 'agency']

export default function Home() {
  return (
    <main className="min-h-screen bg-paper relative overflow-x-hidden">

      {/* Background floating deco */}
      <div aria-hidden="true" className="pointer-events-none select-none">
        <div className="absolute top-16 right-[4%] opacity-[0.13] animate-float hidden md:block" style={{ transform: 'rotate(12deg)' }}>
          <Image src="/file1.png" alt="" width={200} height={200} />
        </div>
        <div className="absolute top-40 left-[1%] opacity-[0.11] animate-float-slow hidden md:block" style={{ transform: 'rotate(-9deg)' }}>
          <Image src="/paperclip1.png" alt="" width={160} height={160} />
        </div>
        <div className="absolute top-[280px] right-[14%] opacity-[0.09] animate-float hidden lg:block" style={{ transform: 'rotate(20deg)' }}>
          <Image src="/paperclip2.png" alt="" width={130} height={130} />
        </div>
        <div className="absolute top-[900px] right-[2%] opacity-[0.11] animate-float hidden lg:block" style={{ transform: 'rotate(6deg)' }}>
          <Image src="/file2.png" alt="" width={150} height={150} />
        </div>
        <div className="absolute top-[1100px] left-[3%] opacity-[0.10] animate-float-slow hidden lg:block" style={{ transform: 'rotate(-14deg)' }}>
          <Image src="/file3.png" alt="" width={130} height={130} />
        </div>
        <div className="absolute top-[1800px] left-[2%] opacity-[0.09] animate-float-slow hidden xl:block" style={{ transform: 'rotate(8deg)' }}>
          <Image src="/paperclip2.png" alt="" width={120} height={120} />
        </div>
        <div className="absolute top-[2200px] right-[3%] opacity-[0.10] animate-float hidden xl:block" style={{ transform: 'rotate(-11deg)' }}>
          <Image src="/file1.png" alt="" width={140} height={140} />
        </div>
      </div>

      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-paper/90 backdrop-blur-sm border-b-[3px] border-dashed border-muted">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="FetchAsset" width={36} height={36} />
            <span className="font-heading text-2xl text-ink">FetchAsset</span>
          </div>
          <div className="hidden md:flex items-center gap-8 font-body text-ink/70">
            <a href="#features" className="hover:text-ink transition-colors">Features</a>
            <a href="#how" className="hover:text-ink transition-colors">How it works</a>
            <a href="#pricing" className="hover:text-ink transition-colors">Pricing</a>
          </div>
          <Link href="/login">
            <WobblyButton size="sm">Start Free</WobblyButton>
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="section-container pt-20 pb-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col gap-6">
            <span className="tag-label w-fit">AI-Powered Client Onboarding</span>
            <h1 className="font-heading text-5xl md:text-6xl text-ink leading-none">
              Stop chasing<br />
              clients for{' '}
              <span className="underline-sketch">files</span>!
            </h1>
            <p className="font-body text-xl text-ink/70 max-w-md">
              Send one magic link. Clients upload everything. Llama 3.3 AI
              flags issues <em>before</em> they cost you time.{' '}
              <strong className="text-ink">No passwords. No back-and-forth.</strong>
            </p>
            <div className="flex flex-wrap gap-4 items-center">
              <Link href="/login">
                <WobblyButton size="lg" className="gap-3">
                  Get Started Free
                  <ArrowRight strokeWidth={3} className="w-5 h-5" />
                </WobblyButton>
              </Link>
              <a href="#demo">
                <WobblyButton variant="secondary" size="lg">Watch Demo </WobblyButton>
              </a>
            </div>
            <p className="font-body text-sm text-ink/50">
              No credit card &nbsp;&nbsp; 14-day trial &nbsp;&nbsp; Cancel anytime
            </p>
          </div>

          <div className="relative flex items-center justify-center py-10">
            {/* Mascot video  autoplay loop, emotional warmth / anthropomorphism */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-8 -left-10 z-20 hidden md:block animate-float-slow"
            >
              <video
                src="/Video-Paperclip.mp4"
                autoPlay
                muted
                loop
                playsInline
                width={110}
                style={{ transform: 'rotate(-6deg)', objectFit: 'contain' }}
              />
            </div>

            <WobblyCard decoration="tack" flavor="postit" rotate="-1" shadow="lg" className="w-full max-w-sm mt-6">
              <WobblyCardHeader>
                <WobblyCardTitle className="text-2xl">Project Checklist</WobblyCardTitle>
                <WobblyCardDescription>Acme Corp  Web Redesign</WobblyCardDescription>
              </WobblyCardHeader>
              <WobblyCardContent className="flex flex-col gap-3">
                {[
                  { label: 'Logo files (SVG/PNG)', done: true },
                  { label: 'Brand color guide', done: true },
                  { label: 'Website copy deck', done: false },
                  { label: 'Contract signed', done: false },
                  { label: 'Domain credentials', done: false },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3 font-body text-base">
                    {item.done ? (
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" strokeWidth={2.5} />
                    ) : (
                      <div className="w-5 h-5 border-[3px] border-ink flex-shrink-0" style={{ borderRadius: '50% 45% 55% 48% / 50% 52% 48% 50%' }} />
                    )}
                    <span className={item.done ? 'line-through text-ink/50' : 'text-ink'}>{item.label}</span>
                  </div>
                ))}
              </WobblyCardContent>
              <WobblyCardFooter>
                <div className="w-full">
                  <div className="flex justify-between text-sm font-body text-ink/60 mb-1">
                    <span>2 of 5 complete</span><span>40%</span>
                  </div>
                  <div className="w-full h-3 bg-muted border-2 border-ink overflow-hidden" style={{ borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px' }}>
                    <div className="h-full bg-ink" style={{ width: '40%', borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px' }} />
                  </div>
                </div>
              </WobblyCardFooter>
            </WobblyCard>

            <div
              className="absolute -bottom-4 -right-2 md:-right-6 bg-ink text-paper px-3 py-1.5 font-body text-sm font-bold rotate-[2deg] shadow-[3px_3px_0px_0px_#ff4d4d]"
              style={{ borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px' }}
            >
              Llama 3.3 AI 
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="border-y-[3px] border-dashed border-muted bg-white/60 py-10">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '12 min', label: 'Avg. onboarding time' },
              { value: '94%',    label: 'Client completion rate' },
              { value: '3.2',   label: 'Faster asset collection' },
              { value: '500+',   label: 'Agencies on FetchAsset' },
            ].map((stat, i) => (
              <div key={stat.label} className={`flex flex-col items-center gap-1 ${i % 2 === 1 ? 'rotate-[0.5deg]' : 'rotate-[-0.5deg]'}`}>
                <span className="font-heading text-4xl md:text-5xl text-ink">{stat.value}</span>
                <span className="font-body text-sm text-ink/60">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="section-container">
        <div className="text-center mb-14">
          <span className="tag-label">Dead simple</span>
          <h2 className="section-title mt-4">Up and running in 3 steps</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {[
            { step: '01', title: 'Create a project', desc: 'Name it, describe what you need. AI auto-generates your exact asset checklist.', rotate: '-1' as const },
            { step: '02', title: 'Send a magic link', desc: 'One link. No login required. Clients see exactly what to upload and why.', rotate: '1' as const },
            { step: '03', title: 'AI does the review', desc: 'Llama 3.3 audits every file on arrival. Flags issues, scores quality, suggests fixes.', rotate: '-0.5' as const },
          ].map((s) => (
            <WobblyCard key={s.step} flavor="default" decoration="tape" rotate={s.rotate} hoverable className="mt-4">
              <span className="font-heading text-5xl text-ink/10 leading-none block mb-3">{s.step}</span>
              <h3 className="font-heading text-xl text-ink mb-2">{s.title}</h3>
              <p className="font-body text-ink/70 text-base">{s.desc}</p>
            </WobblyCard>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="section-container border-t-[3px] border-dashed border-muted">
        <div className="text-center mb-14">
          <span className="tag-label">Why agencies switch</span>
          <h2 className="section-title mt-4">Everything you need,<br />nothing you don&apos;t</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {([
            {
              icon: <Zap className="w-7 h-7" strokeWidth={2.5} />,
              title: 'Magic Link Portals',
              desc: "Clients click one link. No sign-up, no password reset emails. Uploading in under 30 seconds.",
              flavor: 'default' as const, decoration: 'tape' as const, rotate: '-1' as const,
            },
            {
              icon: <Image src="/meta-llama.png" alt="AI" width={28} height={28} className="invert" />,
              title: 'Llama 3.3 AI Audit',
              desc: 'Every file reviewed the moment it arrives. Expired docs, wrong formats, missing info  caught automatically.',
              flavor: 'postit' as const, decoration: 'tack' as const, rotate: '1' as const,
            },
            {
              icon: <Lock className="w-7 h-7" strokeWidth={2.5} />,
              title: 'Secure by Default',
              desc: 'End-to-end encrypted. Passwords never stored in plain text. RLS ensures zero data leakage.',
              flavor: 'default' as const, decoration: 'tape' as const, rotate: '-0.5' as const,
            },
          ] as Array<{ icon: React.ReactNode; title: string; desc: string; flavor: 'default' | 'postit'; decoration: 'tape' | 'tack'; rotate: '-1' | '1' | '-0.5' }>).map((f) => (
            <WobblyCard key={f.title} flavor={f.flavor} decoration={f.decoration} rotate={f.rotate} hoverable className="mt-4">
              <div className="w-12 h-12 bg-ink text-paper flex items-center justify-center mb-4" style={{ borderRadius: '50% 45% 55% 48% / 50% 52% 48% 50%' }}>
                {f.icon}
              </div>
              <h3 className="font-heading text-xl text-ink mb-2">{f.title}</h3>
              <p className="font-body text-ink/70 text-base">{f.desc}</p>
            </WobblyCard>
          ))}
        </div>
      </section>

      {/* DEMO VIDEO  desire before price ask */}
      <section id="demo" className="section-container border-t-[3px] border-dashed border-muted">
        <div className="text-center mb-10">
          <span className="tag-label">See it live</span>
          <h2 className="section-title mt-4">Watch the magic happen</h2>
          <p className="font-body text-lg text-ink/60 max-w-md mx-auto mt-3">
            From project creation to client upload to AI audit  under 60 seconds.
          </p>
        </div>
        <div className="max-w-2xl mx-auto">
          <WobblyCard flavor="postit" shadow="lg" decoration="tack" rotate="-0.5" className="overflow-hidden p-0">
            <div className="px-5 pt-5 pb-3 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-accent" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="font-body text-xs text-ink/40 ml-2">fetchasset.com/portal/acme-corp</span>
            </div>
            <div className="mx-4 mb-4 overflow-hidden border-2 border-ink" style={{ borderRadius: '12px 3px 12px 3px / 3px 12px 3px 12px' }}>
              <video
                src="/Video-Paperclip2.mp4"
                autoPlay
                muted
                loop
                playsInline
                className="w-full block"
                style={{ maxHeight: 380, objectFit: 'cover' }}
              />
            </div>
          </WobblyCard>
          <div className="mt-8 text-center">
            <p className="font-heading text-xl text-ink/70 italic rotate-[-0.5deg]">
              &ldquo;We cut client onboarding from 3 days to 20 minutes.&rdquo;
            </p>
            <p className="font-body text-sm text-ink/40 mt-2"> Design Lead, mid-size creative agency</p>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="section-container border-t-[3px] border-dashed border-muted">
        <div className="text-center mb-14">
          <span className="tag-label">Pricing</span>
          <h2 className="section-title mt-4">Simple, honest pricing</h2>
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
              <div key={tier} className="relative flex-1 max-w-xs" style={{ transform: isPro ? 'translateY(-10px)' : undefined }}>
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
                      <form action={`/api/stripe/checkout?plan=${tier}`} method="POST">
                        <WobblyButton variant={isPro ? 'primary' : 'secondary'} size="md" className="w-full" type="submit">
                          {isPro ? `Get ${plan.name} ` : `Upgrade to ${plan.name}`}
                        </WobblyButton>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        <p className="font-body text-sm text-ink/40 text-center mt-10">
          All paid plans include a 14-day free trial  Cancel anytime  No contracts
        </p>
      </section>

      {/* FINAL CTA */}
      <section className="section-container border-t-[3px] border-dashed border-muted py-24">
        <div className="max-w-xl mx-auto text-center">
          <span className="tag-label">Ready?</span>
          <h2 className="section-title mt-4">First portal live<br />in under 5 minutes</h2>
          <p className="font-body text-xl text-ink/60 max-w-md mx-auto mb-8">
            No onboarding call. No setup fee. Just sign in and start fetching assets.
          </p>
          <Link href="/login">
            <WobblyButton size="xl" className="gap-3">
              Get Started Free
              <ArrowRight strokeWidth={3} className="w-5 h-5" />
            </WobblyButton>
          </Link>
          <p className="font-body text-sm text-ink/40 mt-4">Free forever for solo agencies  No credit card</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t-[3px] border-dashed border-muted bg-white/40 py-10">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="FetchAsset" width={28} height={28} />
            <span className="font-heading text-xl text-ink">FetchAsset</span>
          </div>
          <div className="flex items-center gap-6 font-body text-sm text-ink/50">
            <a href="#features" className="hover:text-ink transition-colors">Features</a>
            <a href="#how" className="hover:text-ink transition-colors">How it works</a>
            <a href="#pricing" className="hover:text-ink transition-colors">Pricing</a>
            <Link href="/login" className="hover:text-ink transition-colors">Login</Link>
          </div>
          <p className="font-body text-sm text-ink/40"> 2026 FetchAsset</p>
        </div>
      </footer>
    </main>
  )
}
