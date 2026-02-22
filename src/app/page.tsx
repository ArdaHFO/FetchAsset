/**
 * FetchAsset — Landing Page
 */

import type { Metadata } from 'next'
import {
  ArrowRight,
  Zap,
  FileCheck,
  Users,
  Upload,
  CheckCircle,
  AlertCircle,
  Mail,
  Lock,
  Building2,
} from 'lucide-react'
import Image from 'next/image'
import {
  WobblyButton,
  WobblyCard,
  WobblyCardHeader,
  WobblyCardTitle,
  WobblyCardDescription,
  WobblyCardContent,
  WobblyCardFooter,
  WobblyInput,
  WobblyTextarea,
  WobblyFormField,
} from '@/components/ui'

export const metadata: Metadata = {
  alternates: { canonical: '/' },
}

export default function Home() {
  return (
    <main className="min-h-screen bg-paper">

      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-paper/90 backdrop-blur-sm border-b-[3px] border-dashed border-muted">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-10 h-10 bg-ink flex items-center justify-center"
              style={{ borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px' }}
            >
              <Zap className="w-5 h-5 text-paper" strokeWidth={3} />
            </div>
            <span className="font-heading text-2xl text-ink">FetchAsset</span>
          </div>
          <div className="hidden md:flex items-center gap-8 font-body text-ink/70">
            <a href="#features" className="hover:text-ink transition-colors">Features</a>
            <a href="#showcase" className="hover:text-ink transition-colors">Components</a>
          </div>
          <WobblyButton size="sm">Start Free</WobblyButton>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="section-container pt-20 pb-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">

          {/* Left: Copy */}
          <div className="flex flex-col gap-6">
            <span className="tag-label w-fit">AI-Powered Onboarding</span>
            <h1 className="font-heading text-5xl md:text-6xl text-ink leading-none">
              Stop chasing<br />
              clients for{' '}
              <span className="underline-sketch">files</span>!
            </h1>
            <p className="font-body text-xl text-ink/70 max-w-md">
              FetchAsset creates magic-link portals that collect every asset,
              credential, and file your agency needs — automatically organized
              by Llama 3.3 AI.{' '}
              <strong className="text-ink">No passwords. No email chaos.</strong>
            </p>
            <div className="flex flex-wrap gap-4 items-center">
              <WobblyButton size="lg" className="gap-3">
                Get Started Free
                <ArrowRight strokeWidth={3} className="w-5 h-5" />
              </WobblyButton>
              <WobblyButton variant="secondary" size="lg">Watch Demo</WobblyButton>
            </div>
            <p className="font-body text-sm text-ink/50">
              No credit card &nbsp;&nbsp; 14-day trial &nbsp;&nbsp; Cancel anytime
            </p>
          </div>

          {/* Right: Hero card mock-up */}
          <div className="relative flex items-center justify-center py-10">
            <div
              className="hidden md:block absolute -top-4 -right-4 w-20 h-20 border-[3px] border-dashed border-muted animate-bounce pointer-events-none"
              style={{ borderRadius: '50% 40% 60% 45% / 50% 55% 45% 50%' }}
              aria-hidden="true"
            />
            <WobblyCard
              decoration="tack"
              flavor="postit"
              rotate="-1"
              shadow="lg"
              className="w-full max-w-sm mt-6"
            >
              <WobblyCardHeader>
                <WobblyCardTitle className="text-2xl">Project Checklist</WobblyCardTitle>
                <WobblyCardDescription>Acme Corp — Web Redesign</WobblyCardDescription>
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
                      <div
                        className="w-5 h-5 border-[3px] border-ink flex-shrink-0"
                        style={{ borderRadius: '50% 45% 55% 48% / 50% 52% 48% 50%' }}
                      />
                    )}
                    <span className={item.done ? 'line-through text-ink/50' : 'text-ink'}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </WobblyCardContent>
              <WobblyCardFooter>
                <div className="w-full">
                  <div className="flex justify-between text-sm font-body text-ink/60 mb-1">
                    <span>2 of 5 complete</span><span>40%</span>
                  </div>
                  <div
                    className="w-full h-3 bg-muted border-2 border-ink overflow-hidden"
                    style={{ borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px' }}
                  >
                    <div
                      className="h-full bg-ink"
                      style={{ width: '40%', borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px' }}
                    />
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

      {/* STATS STRIP */}
      <section className="border-y-[3px] border-dashed border-muted bg-white/60 py-10">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '12min', label: 'Avg. onboarding time' },
              { value: '94%',   label: 'Client completion rate' },
              { value: '3.2x',  label: 'Faster asset collection' },
              { value: '500+',  label: 'Agencies use FetchAsset' },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className={`flex flex-col items-center gap-1 ${i % 2 === 1 ? 'rotate-[0.5deg]' : 'rotate-[-0.5deg]'}`}
              >
                <span className="font-heading text-4xl md:text-5xl text-ink">{stat.value}</span>
                <span className="font-body text-sm text-ink/60">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="section-container">
        <div className="text-center mb-16">
          <span className="tag-label">Why FetchAsset</span>
          <h2 className="section-title mt-4">
            Everything you need,<br />nothing you don&apos;t
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: <Zap className="w-7 h-7" strokeWidth={2.5} />,
              title: 'Magic Link Portals',
              desc: "Clients click one link. No accounts, no passwords. They're in and uploading in seconds.",
              flavor: 'default' as const, decoration: 'tape' as const, rotate: '-1' as const,
            },
            {
              icon: <Image src="/meta-llama.png" alt="AI" width={28} height={28} />,
              title: 'Llama 3.3 AI Audit',
              desc: 'AI reads every uploaded document and flags issues. Expired tax IDs, missing brand colors, wrong formats.',
              flavor: 'postit' as const, decoration: 'tack' as const, rotate: '1' as const,
            },
            {
              icon: <FileCheck className="w-7 h-7" strokeWidth={2.5} />,
              title: 'Smart Checklists',
              desc: 'Type your project type, AI generates the exact 10-point asset checklist. No more manual lists.',
              flavor: 'default' as const, decoration: 'tape' as const, rotate: '-0.5' as const,
            },
            {
              icon: <Upload className="w-7 h-7" strokeWidth={2.5} />,
              title: 'Drag & Drop Upload',
              desc: 'Clients drop files, FetchAsset auto-validates size, format, and resolution — client side, instant.',
              flavor: 'muted' as const, decoration: 'none' as const, rotate: '0.5' as const,
            },
            {
              icon: <Users className="w-7 h-7" strokeWidth={2.5} />,
              title: 'Agency Dashboard',
              desc: 'Kanban view shows every client and exactly which assets are missing. One-click bulk ZIP download.',
              flavor: 'default' as const, decoration: 'tack' as const, rotate: '-1' as const,
            },
            {
              icon: <Lock className="w-7 h-7" strokeWidth={2.5} />,
              title: 'GDPR & Encrypted',
              desc: 'End-to-end encryption for passwords. Supabase RLS ensures zero data leakage between accounts.',
              flavor: 'postit' as const, decoration: 'tape' as const, rotate: '1' as const,
            },
          ].map((feature) => (
            <WobblyCard
              key={feature.title}
              flavor={feature.flavor}
              decoration={feature.decoration}
              rotate={feature.rotate}
              hoverable
              className="mt-4"
            >
              <div
                className="w-12 h-12 bg-ink text-paper flex items-center justify-center mb-4"
                style={{ borderRadius: '50% 45% 55% 48% / 50% 52% 48% 50%' }}
              >
                {feature.icon}
              </div>
              <h3 className="font-heading text-xl text-ink mb-2">{feature.title}</h3>
              <p className="font-body text-ink/70 text-base">{feature.desc}</p>
            </WobblyCard>
          ))}
        </div>
      </section>

      {/* DESIGN SYSTEM SHOWCASE */}
      <section id="showcase" className="section-container border-t-[3px] border-dashed border-muted pt-20">
        <div className="mb-10">
          <span className="tag-label rotate-[1deg]">Step 1 Proof</span>
          <h2 className="section-title mt-4">Design System Showcase</h2>
          <p className="font-body text-ink/60 text-lg">
            All primitives rendered. Wobbly radii, hard shadows, correct fonts.
          </p>
        </div>

        {/* Buttons */}
        <div className="mb-16">
          <h3 className="font-heading text-2xl text-ink mb-6">
            <span className="tag-label text-base -rotate-1">Buttons</span>
          </h3>
          <div className="flex flex-wrap gap-5 items-center">
            <WobblyButton variant="primary"   size="lg">Primary Action</WobblyButton>
            <WobblyButton variant="secondary" size="lg">Secondary</WobblyButton>
            <WobblyButton variant="danger"    size="lg">Danger / Delete</WobblyButton>
            <WobblyButton variant="postit"    size="lg">Post-it</WobblyButton>
            <WobblyButton variant="ghost"     size="lg">Ghost</WobblyButton>
            <WobblyButton variant="primary"   size="sm">Small</WobblyButton>
            <WobblyButton variant="primary"   size="xl">Extra Large</WobblyButton>
            <WobblyButton variant="primary"   loading>Loading</WobblyButton>
            <WobblyButton variant="primary"   disabled>Disabled</WobblyButton>
          </div>
        </div>

        {/* Cards */}
        <div className="mb-16">
          <h3 className="font-heading text-2xl text-ink mb-6">
            <span className="tag-label text-base rotate-1">Cards</span>
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <WobblyCard decoration="tape" rotate="-1" className="mt-5">
              <WobblyCardHeader>
                <WobblyCardTitle>Default + Tape</WobblyCardTitle>
                <WobblyCardDescription>White background, black border</WobblyCardDescription>
              </WobblyCardHeader>
              <WobblyCardContent><p>Hard offset shadow. Wobbly border radius. Dashed divider.</p></WobblyCardContent>
              <WobblyCardFooter><WobblyButton size="sm">Action</WobblyButton></WobblyCardFooter>
            </WobblyCard>

            <WobblyCard decoration="tack" flavor="postit" rotate="1" className="mt-5">
              <WobblyCardHeader>
                <WobblyCardTitle>Post-it + Tack</WobblyCardTitle>
                <WobblyCardDescription>Post-it yellow, thumbtack pin</WobblyCardDescription>
              </WobblyCardHeader>
              <WobblyCardContent><p>Great for feature highlights and key callouts.</p></WobblyCardContent>
              <WobblyCardFooter><WobblyButton variant="secondary" size="sm">Read More</WobblyButton></WobblyCardFooter>
            </WobblyCard>

            <WobblyCard flavor="muted" rotate="-0.5" hoverable>
              <WobblyCardHeader>
                <WobblyCardTitle>Muted + Hoverable</WobblyCardTitle>
                <WobblyCardDescription>Hover to see lift effect</WobblyCardDescription>
              </WobblyCardHeader>
              <WobblyCardContent><p>Shadow grows, card rotates slightly on hover.</p></WobblyCardContent>
            </WobblyCard>
          </div>
        </div>

        {/* Form Inputs */}
        <div className="mb-16">
          <h3 className="font-heading text-2xl text-ink mb-6">
            <span className="tag-label text-base -rotate-1">Form Inputs</span>
          </h3>
          <div className="grid md:grid-cols-2 gap-8 max-w-2xl">
            <WobblyFormField label="Agency Name" htmlFor="agency" required>
              <WobblyInput id="agency" placeholder="e.g. Pixel & Co." leftIcon={<Building2 className="w-4 h-4" />} />
            </WobblyFormField>
            <WobblyFormField label="Client Email" htmlFor="email" required>
              <WobblyInput id="email" type="email" placeholder="client@company.com" leftIcon={<Mail className="w-4 h-4" />} />
            </WobblyFormField>
            <WobblyFormField label="Password" htmlFor="pass" errorMessage="Password must be at least 8 characters">
              <WobblyInput id="pass" type="password" placeholder="error state" leftIcon={<Lock className="w-4 h-4" />} error />
            </WobblyFormField>
            <WobblyFormField label="Confirmed" htmlFor="confirmed" helperText="Looks good!">
              <WobblyInput id="confirmed" placeholder="success state" success rightIcon={<CheckCircle className="w-4 h-4 text-green-600" />} />
            </WobblyFormField>
            <WobblyFormField label="Project Brief" htmlFor="brief" className="md:col-span-2" helperText="AI Brain-to-Brief converter will format this automatically">
              <WobblyTextarea id="brief" placeholder="Dump your messy notes here... AI will clean it up!" rows={4} />
            </WobblyFormField>
          </div>
        </div>

        {/* Color Palette Swatches */}
        <div className="mb-16">
          <h3 className="font-heading text-2xl text-ink mb-6">
            <span className="tag-label text-base rotate-1">Color Palette</span>
          </h3>
          <div className="flex flex-wrap gap-5">
            {[
              { name: 'Paper',    bg: '#fdfbf7', border: true  },
              { name: 'Ink',      bg: '#2d2d2d', border: false },
              { name: 'Muted',    bg: '#e5e0d8', border: true  },
              { name: 'Accent',   bg: '#ff4d4d', border: false },
              { name: 'Blue Pen', bg: '#2d5da1', border: false },
              { name: 'Post-it',  bg: '#fff9c4', border: true  },
              { name: 'White',    bg: '#ffffff', border: true  },
            ].map((swatch) => (
              <div key={swatch.name} className="flex flex-col items-center gap-2">
                <div
                  className={`w-16 h-16 ${swatch.border ? 'border-[3px] border-ink' : ''}`}
                  style={{ backgroundColor: swatch.bg, borderRadius: '50% 45% 55% 48% / 50% 52% 48% 50%', boxShadow: '3px 3px 0px 0px #2d2d2d' }}
                />
                <span className="font-body text-sm text-ink/70">{swatch.name}</span>
                <code className="font-body text-xs text-ink/40">{swatch.bg}</code>
              </div>
            ))}
          </div>
        </div>

        {/* Typography Scale */}
        <div className="mb-16">
          <h3 className="font-heading text-2xl text-ink mb-6">
            <span className="tag-label text-base -rotate-1">Typography</span>
          </h3>
          <div className="flex flex-col gap-4 max-w-2xl">
            <div>
              <span className="font-body text-xs text-ink/40 uppercase tracking-widest">Kalam 700 — Heading font</span>
              <h1 className="font-heading text-5xl text-ink">H1: The quick fox</h1>
              <h2 className="font-heading text-4xl text-ink">H2: Jumps over</h2>
              <h3 className="font-heading text-3xl text-ink">H3: A lazy dog</h3>
              <h4 className="font-heading text-2xl text-ink">H4: Section title</h4>
            </div>
            <div
              className="p-4 border-[3px] border-dashed border-muted"
              style={{ borderRadius: '220px 30px 240px 20px / 25px 230px 20px 215px' }}
            >
              <span className="font-body text-xs text-ink/40 uppercase tracking-widest block mb-2">
                Patrick Hand 400 — Body font
              </span>
              <p className="font-body text-xl text-ink">Large: AI extracts your project brief automatically.</p>
              <p className="font-body text-base text-ink">Base: Clients see a simple checklist of required assets.</p>
              <p className="font-body text-sm text-ink/70">Small: Supporting metadata and helper text.</p>
              <p className="font-body text-xs text-ink/50">XS: Timestamps, IDs, and micro-copy labels.</p>
            </div>
          </div>
        </div>

        {/* AI Engine Preview Card */}
        <div className="mb-16">
          <h3 className="font-heading text-2xl text-ink mb-6">
            <span className="tag-label text-base rotate-1">AI Engine Preview</span>
          </h3>
          <WobblyCard flavor="postit" shadow="lg" decoration="tack" className="max-w-xl mt-5 rotate-[-0.5deg]">
            <WobblyCardHeader>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 bg-ink flex items-center justify-center flex-shrink-0"
                  style={{ borderRadius: '50% 45% 55% 48% / 50% 52% 48% 50%' }}
                >
                  <Image src="/meta-llama.png" alt="AI" width={20} height={20} className="invert" />
                </div>
                <WobblyCardTitle>Llama 3.3 Smart Audit</WobblyCardTitle>
              </div>
            </WobblyCardHeader>
            <WobblyCardContent>
              <div
                className="bg-white border-[3px] border-ink p-4 mb-3 font-body text-sm"
                style={{ borderRadius: '220px 30px 240px 20px / 25px 230px 20px 215px' }}
              >
                <span className="text-ink/50">Analyzing: </span>
                <span className="font-bold">tax_id_2021.pdf</span>
              </div>
              <div className="flex items-start gap-3 font-body text-base text-accent">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                <p>
                  <strong>Warning:</strong> This document expired on{' '}
                  <span className="underline-sketch">March 2023</span>. Please upload a current version.
                </p>
              </div>
            </WobblyCardContent>
            <WobblyCardFooter>
              <WobblyButton size="sm" variant="secondary">Re-upload</WobblyButton>
              <WobblyButton size="sm" variant="ghost">Dismiss</WobblyButton>
            </WobblyCardFooter>
          </WobblyCard>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t-[3px] border-dashed border-muted bg-white/40 py-12">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 bg-ink flex items-center justify-center"
              style={{ borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px' }}
            >
              <Zap className="w-4 h-4 text-paper" strokeWidth={3} />
            </div>
            <span className="font-heading text-xl text-ink">FetchAsset</span>
          </div>
          <p className="font-body text-sm text-ink/50 text-center">
            STEP 1 Complete — Design System initialized. All primitives rendered.
          </p>
          <p className="font-body text-sm text-ink/40">2026 FetchAsset</p>
        </div>
      </footer>
    </main>
  )
}