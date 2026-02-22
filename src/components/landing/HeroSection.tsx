/**
 * HeroSection — Landing page hero, "use client" for Framer Motion + Demo overlay trigger.
 * Headline: "Stop chasing files. Start your projects."
 */
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, CheckCircle } from 'lucide-react'
import {
  WobblyButton,
  WobblyCard,
  WobblyCardHeader,
  WobblyCardTitle,
  WobblyCardDescription,
  WobblyCardContent,
  WobblyCardFooter,
} from '@/components/ui'
import DemoOverlay from '@/components/demo/DemoOverlay'
import { capture, EVENTS } from '@/lib/posthog'

const CHECKLIST = [
  { label: 'Logo files (SVG/PNG)', done: true },
  { label: 'Brand color guide', done: true },
  { label: 'Website copy deck', done: false },
  { label: 'Contract signed', done: false },
  { label: 'Domain credentials', done: false },
]

const STATS = [
  { value: '12 min', label: 'Avg. onboarding time' },
  { value: '94%',   label: 'Client completion rate' },
  { value: '3.2×',  label: 'Faster asset collection' },
  { value: '500+',  label: 'Agencies on FetchAsset' },
]

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.10 } },
}
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' as const } },
}
const fadeIn = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { duration: 0.6, ease: 'easeOut' as const } },
}

export default function HeroSection() {
  const [showDemo, setShowDemo] = useState(false)

  // Close demo on Escape
  useEffect(() => {
    if (!showDemo) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setShowDemo(false) }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [showDemo])

  return (
    <>
      {/* Demo overlay — mounted on top of page when triggered */}
      {showDemo && (
        <div className="fixed inset-0 z-[999]">
          {/* Escape button */}
          <button
            onClick={() => setShowDemo(false)}
            className="fixed top-5 right-5 z-[1001] font-body text-xs bg-paper border-2 border-ink px-3 py-1.5 hover:bg-muted transition-colors"
            style={{ borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px', boxShadow: '2px 2px 0 0 #2d2d2d' }}
          >
            ✕ Close Demo
          </button>
          <DemoOverlay />
        </div>
      )}

      {/* ── HERO ── */}
      <section className="max-w-5xl mx-auto px-6 pt-24 pb-20">
        <div className="grid md:grid-cols-2 gap-14 items-center">

          {/* Left: copy */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="flex flex-col gap-7"
          >
            <motion.span
              variants={fadeUp}
              className="tag-label w-fit"
            >
              AI-Powered Client Onboarding
            </motion.span>

            <motion.h1
              variants={fadeUp}
              className="font-heading text-5xl md:text-[4rem] lg:text-[4.5rem] text-ink leading-[1.02]"
            >
              Stop chasing files.<br />
              <span className="underline-sketch">Start your projects.</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="font-body text-xl text-ink/65 max-w-md leading-relaxed"
            >
              Professional file collection for agencies and freelancers.{' '}
              <strong className="text-ink">No passwords</strong>, just Magic Links
              and AI-powered auditing by Llama&nbsp;3.3.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-wrap gap-4 items-center">
              <WobblyButton
                size="lg"
                className="gap-3 text-base"
                onClick={() => {
                  capture(EVENTS.DEMO_STARTED)
                  setShowDemo(true)
                }}
              >
                Try Interactive Demo 🚀
              </WobblyButton>
              <Link href="/login">
                <WobblyButton variant="secondary" size="lg" className="gap-2">
                  Get Started Free
                  <ArrowRight strokeWidth={3} className="w-4 h-4" />
                </WobblyButton>
              </Link>
            </motion.div>

            <motion.p variants={fadeUp} className="font-body text-sm text-ink/45">
              No credit card &nbsp;·&nbsp; 14-day trial &nbsp;·&nbsp; Cancel anytime
            </motion.p>
          </motion.div>

          {/* Right: checklist card */}
          <motion.div
            variants={fadeIn}
            initial="hidden"
            animate="show"
            className="relative flex items-center justify-center py-10"
          >
            <WobblyCard
              decoration="tack"
              flavor="postit"
              rotate="-1"
              shadow="lg"
              className="w-full max-w-sm mt-6"
            >
              <WobblyCardHeader>
                <WobblyCardTitle className="text-2xl">Project Checklist</WobblyCardTitle>
                <WobblyCardDescription>Acme Corp · Web Redesign</WobblyCardDescription>
              </WobblyCardHeader>
              <WobblyCardContent className="flex flex-col gap-3">
                {CHECKLIST.map((item, i) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.1, ease: 'easeOut' as const }}
                    className="flex items-center gap-3 font-body text-base"
                  >
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
                  </motion.div>
                ))}
              </WobblyCardContent>
              <WobblyCardFooter>
                <div className="w-full">
                  <div className="flex justify-between text-sm font-body text-ink/60 mb-1">
                    <span>2 of 5 complete</span>
                    <span>40%</span>
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

            {/* AI badge */}
            <div
              className="absolute -bottom-2 -right-2 md:-right-4 bg-ink text-paper px-3 py-1.5 font-body text-sm font-bold rotate-[2deg]"
              style={{
                borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px',
                boxShadow: '3px 3px 0px 0px #ff4d4d',
              }}
            >
              Llama 3.3 AI ✦
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="border-y-[3px] border-dashed border-muted bg-white/50 py-10">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, ease: 'easeOut' as const }}
                className={`flex flex-col items-center gap-1 ${i % 2 === 1 ? 'rotate-[0.5deg]' : 'rotate-[-0.5deg]'}`}
              >
                <span className="font-heading text-4xl md:text-5xl text-ink">{stat.value}</span>
                <span className="font-body text-sm text-ink/60">{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
