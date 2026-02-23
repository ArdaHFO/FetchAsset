'use client'

/**
 * FetchAsset  Full Product Tour — Interactive Demo
 * PRE-START + 7 guided steps showcasing every feature.
 *
 * Steps:
 *   PRE  → Welcome mascot + music start
 *   0    → Agency Dashboard (click New Project)
 *   1    → Smart Setup (deadline buffer slider, Nudger toggle)
 *   2    → AI Specification (Logo request, AI Suggest, file types, rename toggle)
 *   3    → Magic Link Generated (email preview, no-password button)
 *   4    → Client Experience (progress bar 0→50%, file drag)
 *   5    → AI Audit Wow (low-res error → SVG green check + rename)
 *   6    → Success & Organisation (agency view, mascot celebration, CTA)
 */

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Volume2, VolumeX, Zap, Check, Upload, AlertTriangle,
  ArrowRight, CheckCircle, Calendar, RotateCcw, Link2,
  FileType, PenLine, Video, Code2, Camera, Music2, Plus,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import {
  WobblyButton, WobblyCard, WobblyCardContent,
  WobblyCardHeader, WobblyCardTitle, WobblyCardDescription,
} from '@/components/ui'
import { capture, EVENTS } from '@/lib/posthog'

// ─────────────────────────────────────────────────────────────────────────────
//  CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const TOTAL_STEPS = 7 // steps 0-6
const REAL_DATE = new Date('2026-02-27')  // Friday
// CLIENT_DATE unused at module level — computed per-step from buffer

const STEP_LABELS = [
  'Agency Dashboard',
  'Smart Setup',
  'AI Specifications',
  'The Magic Link',
  'Client Experience',
  'AI Audit',
  'Done! 🎉',
]

const fmt = (d: Date) =>
  d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })

// ─────────────────────────────────────────────────────────────────────────────
//  DEMO STATE — shared across all steps
// ─────────────────────────────────────────────────────────────────────────────

export interface DemoState {
  niche: 'agency' | 'writer' | 'video' | 'developer' | 'photo' | 'music' | 'other'
  customNicheLabel: string
  assetName: string
  formats: string[]
  customFormat: string
  instructions: string
  assetQty: number
}

export const DEFAULT_DEMO_STATE: DemoState = {
  niche: 'agency',
  customNicheLabel: '',
  assetName: 'Logo Files',
  formats: [],
  customFormat: '',
  instructions: '',
  assetQty: 1,
}

// Blank preset used when freelancer picks a custom niche
const CUSTOM_NICHE_PRESET = {
  id: 'other' as const,
  label: 'Custom',
  icon: null,
  assetName: '',
  formats: [] as string[],
  instructions: '',
}

const NICHES = [
  { id: 'agency',    label: 'Agency',   icon: <FileType size={15} />,  assetName: 'Logo Files',           formats: ['SVG','AI','EPS','PNG'],         instructions: 'Vector format required. Must include all variations. Max 10 MB.' },
  { id: 'writer',    label: 'Writer',   icon: <PenLine  size={15} />,  assetName: '500-word Blog Post',   formats: ['DOCX','PDF','TXT'],            instructions: 'Word count: 500 words min. Must include headings and metadata.' },
  { id: 'video',     label: 'Video Ed', icon: <Video    size={15} />,  assetName: '4K Footage',           formats: ['MP4','MOV','PRORES'],          instructions: '4K resolution minimum (3840×2160). 24fps or 30fps. No watermarks.' },
  { id: 'developer', label: 'Dev',      icon: <Code2    size={15} />,  assetName: 'Python Script',        formats: ['PY','ZIP','TAR.GZ'],           instructions: 'Include requirements.txt. All functions must be documented.' },
  { id: 'photo',     label: 'Photo',    icon: <Camera   size={15} />,  assetName: 'Product Photos',       formats: ['RAW','DNG','TIFF','JPEG'],     instructions: 'High-res only (min 3000px on longest side). No heavy editing.' },
  { id: 'music',     label: 'Audio',    icon: <Music2   size={15} />,  assetName: 'Stems & Master',       formats: ['WAV','AIFF','FLAC'],           instructions: '24-bit / 48kHz minimum. Provide both wet and dry stems.' },
] as const

// ─────────────────────────────────────────────────────────────────────────────
//  SHARED ANIMATION VARIANTS
// ─────────────────────────────────────────────────────────────────────────────

const stepVariants = {
  initial: { opacity: 0, y: 32, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.38, ease: 'easeOut' as const } },
  exit:    { opacity: 0, y: -20, scale: 0.97, transition: { duration: 0.26, ease: 'easeIn' as const } },
}

// ─────────────────────────────────────────────────────────────────────────────
//  REUSABLE SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function WobblyTooltip({ children, delay = 0.4, side = 'bottom' }: {
  children: React.ReactNode; delay?: number; side?: 'bottom' | 'top'
}) {
  return (
    <motion.div
      initial={{ scale: 0.75, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay, type: 'spring', stiffness: 220, damping: 16 }}
      className="pointer-events-none"
    >
      {side === 'top' && (
        <div className="flex justify-center">
          <div className="w-3 h-3 bg-[#fffde7] border-l-[3px] border-t-[3px] border-ink rotate-45" style={{ marginBottom: '-6px' }} />
        </div>
      )}
      <div
        className="bg-[#fffde7] border-[3px] border-ink px-3 py-2 font-body text-xs text-ink text-center leading-snug"
        style={{ borderRadius: '180px 45px 200px 35px / 40px 190px 30px 170px', boxShadow: '3px 3px 0 0 #2d2d2d' }}
      >
        {children}
      </div>
      {side === 'bottom' && (
        <div className="flex justify-center">
          <div className="w-3 h-3 bg-[#fffde7] border-r-[3px] border-b-[3px] border-ink rotate-45" style={{ marginTop: '-6px' }} />
        </div>
      )}
    </motion.div>
  )
}

function StepBadge({ step, label }: { step: number; label: string }) {
  return (
    <div className="text-center mb-7">
      <span className="font-body text-[11px] uppercase tracking-widest text-ink/35">
        Step {step} of {TOTAL_STEPS} &middot; {label}
      </span>
    </div>
  )
}

function ToggleSwitch({ on, onToggle, label, sub }: {
  on: boolean; onToggle: () => void; label: string; sub: string
}) {
  return (
    <div
      className="flex items-start gap-3 p-3.5 border-2 border-ink/20 bg-paper/60 cursor-pointer select-none"
      style={{ borderRadius: '12px 3px 12px 3px / 3px 12px 3px 12px' }}
      onClick={onToggle}
    >
      <div className="flex-1">
        <p className="font-body text-sm font-semibold text-ink">{label}</p>
        <p className="font-body text-xs text-ink/50 mt-0.5">{sub}</p>
      </div>
      <button
        type="button"
        className={`relative border-2 border-ink transition-colors flex-shrink-0 mt-0.5 ${on ? 'bg-ink' : 'bg-paper'}`}
        style={{ borderRadius: '20px', width: 44, height: 24 }}
        onClick={(e) => { e.stopPropagation(); onToggle() }}
      >
        <motion.span
          animate={{ left: on ? 'calc(100% - 20px)' : '2px' }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="absolute top-[2px] w-4 h-4 bg-paper border border-ink/30"
          style={{ borderRadius: '50%', position: 'absolute' }}
        />
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  PRE-START: Mascot welcome screen
// ─────────────────────────────────────────────────────────────────────────────

function PreStart({ onStart }: { onStart: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1, transition: { duration: 0.5, type: 'spring', stiffness: 160, damping: 22 } }}
      className="flex flex-col items-center text-center max-w-md"
    >
      {/* Mascot */}
      <motion.div
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 130, damping: 14 }}
        className="relative mb-6"
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' as const }}
        >
          <Image
            src="/paperclip1.png"
            alt="FetchAsset Mascot"
            width={140}
            height={140}
            style={{ mixBlendMode: 'multiply' }}
          />
        </motion.div>
        {/* Speech bubble */}
        <motion.div
          initial={{ opacity: 0, scale: 0.7, x: 20 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ delay: 0.55, type: 'spring', stiffness: 200, damping: 18 }}
          className="absolute -bottom-2 -right-14 sm:-right-20 bg-[#fffde7] border-[3px] border-ink px-4 py-2.5 font-body text-xs text-ink max-w-[180px] text-left z-10"
          style={{
            borderRadius: '20px 20px 20px 4px',
            boxShadow: '3px 3px 0 0 #2d2d2d',
            lineHeight: 1.4,
          }}
        >
          Hey! Ready to see everything FetchAsset can do? 🎉
          <div
            className="absolute -bottom-[11px] left-4 w-4 h-4 bg-[#fffde7] border-r-[3px] border-b-[3px] border-ink rotate-45"
          />
        </motion.div>
      </motion.div>

      {/* Headline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.38 }}
      >
        <h2 className="font-heading text-5xl md:text-6xl text-ink leading-tight mt-6">
          Full Product Tour
        </h2>
        <p className="font-body text-lg text-ink/55 mt-3 mb-8 leading-relaxed">
          7 steps. Every feature. No signup required.<br />
          <span className="text-ink/40 text-sm">Music included 🎷</span>
        </p>

        {/* Feature preview pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {[
            'Deadline Buffer ⏳',
            'AI Suggest ✨',
            'Magic Link 🔗',
            'Client Emails 📧',
            'AI Audit 🤖',
            'Approve & Reject ✅',
            'Auto-Rename 🏷️',
            'Portal Branding 🎨',
          ].map((tag, i) => (
            <motion.span
              key={tag}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 + i * 0.06 }}
              className="font-body text-xs bg-muted border-2 border-ink/20 px-3 py-1 text-ink/60"
              style={{ borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px' }}
            >
              {tag}
            </motion.span>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <WobblyButton size="xl" className="gap-3" onClick={onStart}>
            Start the Tour 🚀
            <ArrowRight strokeWidth={3} className="w-5 h-5" />
          </WobblyButton>
          <p className="font-body text-xs text-ink/30 mt-3">Takes about 90 seconds</p>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  STEP 0: Agency Dashboard
// ─────────────────────────────────────────────────────────────────────────────

function Step0Dashboard({ onNext }: { onNext: () => void }) {
  return (
    <motion.div variants={stepVariants} initial="initial" animate="animate" exit="exit" className="w-full max-w-3xl">
      <StepBadge step={1} label={STEP_LABELS[0]} />
      <div className="text-center mb-8">
        <h2 className="font-heading text-4xl md:text-5xl text-ink">Your Agency HQ</h2>
        <p className="font-body text-ink/50 mt-2">All your client projects, tracked in one place.</p>
      </div>

      {/* Dashboard mockup */}
      <div
        className="border-[3px] border-ink overflow-hidden"
        style={{ borderRadius: '12px 3px 14px 3px / 3px 14px 3px 12px', boxShadow: '5px 5px 0 0 #2d2d2d' }}
      >
        {/* Chrome bar */}
        <div className="bg-ink text-paper px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              {['bg-red-400','bg-yellow-400','bg-green-400'].map(c => (
                <div key={c} className={`w-2.5 h-2.5 rounded-full ${c} opacity-70`} />
              ))}
            </div>
            <span className="font-heading text-base ml-2">FetchAsset Dashboard</span>
            <span className="font-body text-[11px] opacity-40">3 Active Projects</span>
          </div>
          <div className="font-body text-xs opacity-40">jane@agency.com</div>
        </div>

        {/* Project grid */}
        <div className="bg-[#FAFAF7] p-5 grid sm:grid-cols-3 gap-4">
          {[
            { client: 'Acme Corp', status: 'Waiting on client', pct: 40, color: 'bg-amber-400' },
            { client: 'Nike Rebrand', status: 'Submitted — review', pct: 80, color: 'bg-green-400' },
          ].map((p) => (
            <div
              key={p.client}
              className="border-2 border-ink/20 p-4 bg-paper"
              style={{ borderRadius: '180px 45px 200px 35px / 40px 190px 30px 170px' }}
            >
              <p className="font-heading text-base text-ink mb-0.5">{p.client}</p>
              <p className="font-body text-xs text-ink/45 mb-3">{p.status}</p>
              <div className="w-full h-2 bg-muted overflow-hidden border border-ink/15" style={{ borderRadius: '255px' }}>
                <div className={`h-full ${p.color}`} style={{ width: `${p.pct}%`, borderRadius: '255px' }} />
              </div>
            </div>
          ))}

          {/* New Project CTA */}
          <div className="relative flex flex-col items-center justify-end gap-2">
            <WobblyTooltip delay={0.5}>
              First, let&apos;s create a project. <strong>Click here!</strong>
            </WobblyTooltip>
            <motion.button
              onClick={onNext}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="w-full min-h-[80px] border-[3px] border-dashed border-ink/40 flex flex-col items-center justify-center gap-1.5 font-body text-ink/50 hover:border-ink hover:text-ink hover:bg-amber-50 transition-all cursor-pointer bg-paper"
              style={{ borderRadius: '180px 45px 200px 35px / 40px 190px 30px 170px' }}
            >
              <span className="text-3xl leading-none font-heading">+</span>
              <span className="text-sm">New Project</span>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  STEP 1: Smart Setup — Deadline Buffer + Nudger
// ─────────────────────────────────────────────────────────────────────────────

function Step1SmartSetup({ onNext }: { onNext: () => void }) {
  const [bufferDays, setBufferDays] = useState(0)
  const [nudgerOn, setNudgerOn] = useState(false)
  const [confirmed, setConfirmed] = useState(false)

  // Auto-slide the buffer to 2 after mount to demo the feature
  useEffect(() => {
    const t1 = setTimeout(() => setBufferDays(2), 900)
    const t2 = setTimeout(() => setNudgerOn(true), 1600)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  const clientDate = new Date(REAL_DATE)
  clientDate.setDate(clientDate.getDate() - bufferDays)

  function handleConfirm() {
    setConfirmed(true)
    setTimeout(() => onNext(), 1200)
  }

  return (
    <motion.div variants={stepVariants} initial="initial" animate="animate" exit="exit" className="w-full max-w-xl">
      <StepBadge step={2} label={STEP_LABELS[1]} />
      <div className="text-center mb-8">
        <h2 className="font-heading text-4xl md:text-5xl text-ink">Smart Project Setup</h2>
        <p className="font-body text-ink/50 mt-2">Set a buffer. Let the system chase stragglers for you.</p>
      </div>

      <WobblyCard flavor="postit" decoration="tack" rotate="-0.5" shadow="lg">
        <WobblyCardHeader>
          <WobblyCardTitle>Acme Corp &mdash; Brand Identity</WobblyCardTitle>
          <WobblyCardDescription>Configure deadline &amp; reminders</WobblyCardDescription>
        </WobblyCardHeader>
        <WobblyCardContent>
          <div className="flex flex-col gap-5">

            {/* Real deadline row */}
            <div
              className="flex items-center gap-3 p-3 bg-paper/70 border-2 border-ink/20"
              style={{ borderRadius: '12px 3px 12px 3px / 3px 12px 3px 12px' }}
            >
              <Calendar size={16} className="text-ink/50 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-body text-xs text-ink/40 uppercase">Your real deadline</p>
                <p className="font-heading text-lg text-ink capitalize">{fmt(REAL_DATE)}</p>
              </div>
              <span
                className="font-body text-xs bg-ink/10 px-2 py-1 text-ink/50"
                style={{ borderRadius: '20px' }}
              >
                internal only
              </span>
            </div>

            {/* Buffer slider */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <motion.div animate={{ rotate: [0, -8, 8, 0] }} transition={{ duration: 1.2, delay: 0.9 }}>
                  <Image src="/paperclip1.png" alt="" width={30} height={30} style={{ mixBlendMode: 'multiply' }} />
                </motion.div>
                <div className="flex-1">
                  <p className="font-body text-sm font-semibold text-ink">
                    Deadline Buffer&nbsp;
                    <span className="text-ink/40 font-normal">({bufferDays} {bufferDays === 1 ? 'day' : 'days'})</span>
                  </p>
                  <p className="font-body text-xs text-ink/40">Days to subtract from the client-visible deadline</p>
                </div>
              </div>
              <input
                type="range" min={0} max={7} value={bufferDays}
                onChange={(e) => setBufferDays(parseInt(e.target.value))}
                className="w-full accent-ink"
              />
              <div className="flex justify-between font-body text-xs text-ink/30">
                <span>No buffer</span><span>7 days</span>
              </div>
            </div>

            {/* Client-visible result */}
            <AnimatePresence mode="wait">
              {bufferDays > 0 ? (
                <motion.div
                  key="show"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 border-[3px] border-ink bg-[#fffde7]"
                  style={{ borderRadius: '180px 45px 200px 35px / 40px 190px 30px 170px', boxShadow: '4px 4px 0 0 #2d2d2d' }}
                >
                  <p className="font-body text-xs text-ink/45 uppercase tracking-wider mb-1">Client sees:</p>
                  <p className="font-heading text-2xl text-ink capitalize">{fmt(clientDate)} 😉</p>
                  <p className="font-body text-xs text-ink/55 mt-1">
                    Real deadline <span className="line-through">{fmt(REAL_DATE)}</span>&nbsp;&mdash;&nbsp;
                    <strong>{bufferDays} days</strong> of breathing room secured.
                  </p>
                  <div
                    className="mt-2 inline-block bg-amber-100 border border-amber-300 px-3 py-1 font-body text-xs text-amber-800"
                    style={{ borderRadius: '20px' }}
                  >
                    💡 Real deadline is Friday, but the client sees Wednesday. 48 hours of peace.
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-3 border-2 border-dashed border-ink/20 text-center"
                  style={{ borderRadius: '12px' }}
                >
                  <p className="font-body text-sm text-ink/35">Slide ↑ to set a buffer</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Nudger toggle */}
            <ToggleSwitch
              on={nudgerOn}
              onToggle={() => setNudgerOn(n => !n)}
              label="🔔 The Nudger™"
              sub="Auto-remind client 48h & 24h before their deadline"
            />

            {/* Nudge email preview — shows when nudger is on */}
            <AnimatePresence>
              {nudgerOn && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div
                    className="border-[3px] border-ink/20 overflow-hidden"
                    style={{ borderRadius: '12px 3px 12px 3px / 3px 12px 3px 12px', boxShadow: '3px 3px 0 0 rgba(45,45,45,0.15)' }}
                  >
                    <div className="bg-ink/80 text-paper px-3 py-1.5 flex items-center gap-2">
                      <span className="font-body text-[10px] opacity-60">📧 Auto-email preview</span>
                      <span className="ml-auto font-body text-[10px] bg-amber-400 text-ink px-1.5 py-0.5" style={{ borderRadius: '20px' }}>48h BEFORE</span>
                    </div>
                    <div className="p-3 bg-[#faf8f5] flex flex-col gap-1.5">
                      <p className="font-body text-[11px] text-ink/40">
                        <strong>To:</strong> client@email.com · <strong>Subject:</strong> ⏰ Gentle reminder — files due {fmt(clientDate)}
                      </p>
                      <p className="font-body text-xs text-ink/70">
                        Hey! Just a friendly nudge — your <strong>Acme Corp</strong> assets are due <strong>{fmt(clientDate)}</strong>.
                        Click below to upload them now.
                      </p>
                      <div
                        className="text-center py-1.5 font-body text-[10px] font-bold text-paper bg-ink/80 mt-1"
                        style={{ borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px' }}
                      >
                        🔗 Open My Portal
                      </div>
                    </div>
                  </div>
                  <p className="font-body text-[10px] text-ink/30 mt-1.5 text-center">
                    A second reminder is sent 24h before deadline automatically
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Confirm */}
            {!confirmed ? (
              <WobblyButton size="md" className="w-full gap-2" onClick={handleConfirm} disabled={bufferDays === 0}>
                {bufferDays === 0 ? 'Set a buffer to continue' : (
                  <>Looks good, continue <ArrowRight size={15} strokeWidth={3} /></>
                )}
              </WobblyButton>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center gap-2 text-green-700 font-body text-sm py-2"
              >
                <CheckCircle size={16} /> Setup confirmed! Moving on…
              </motion.div>
            )}
          </div>
        </WobblyCardContent>
      </WobblyCard>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  STEP 2: AI Specifications — Universal Asset Builder
// ─────────────────────────────────────────────────────────────────────────────

function Step2AiSpec({
  onNext,
  demoState,
  setDemoState,
}: {
  onNext: () => void
  demoState: DemoState
  setDemoState: (s: DemoState) => void
}) {
  const [aiSuggested, setAiSuggested]   = useState(false)
  const [aiLoading, setAiLoading]       = useState(false)
  const [renameOn, setRenameOn]         = useState(false)
  const [customInput, setCustomInput]   = useState('')
  const [showCustom, setShowCustom]     = useState(false)
  const [nicheInput, setNicheInput]     = useState('')
  const [showNicheInput, setShowNicheInput] = useState(false)

  // When niche changes, reset AI state and fill preset
  function selectNiche(nicheId: DemoState['niche'], customLabel = '') {
    const preset = NICHES.find(n => n.id === nicheId) ?? CUSTOM_NICHE_PRESET
    setDemoState({
      ...demoState,
      niche: nicheId,
      customNicheLabel: customLabel,
      assetName: nicheId === 'other' ? (demoState.assetName || '') : preset.assetName,
      formats: [],
      instructions: '',
    })
    setAiSuggested(false)
  }

  function confirmCustomNiche() {
    const label = nicheInput.trim()
    if (!label) return
    selectNiche('other', label)
    setShowNicheInput(false)
    setNicheInput('')
  }

  function toggleFormat(fmt: string) {
    const cur = demoState.formats
    setDemoState({
      ...demoState,
      formats: cur.includes(fmt) ? cur.filter(x => x !== fmt) : [...cur, fmt],
    })
  }

  function addCustomFormat() {
    const val = customInput.trim().toUpperCase().replace(/^\./, '')
    if (!val) return
    if (!demoState.formats.includes(val)) {
      setDemoState({ ...demoState, formats: [...demoState.formats, val], customFormat: val })
    }
    setCustomInput('')
    setShowCustom(false)
  }

  function handleAiSuggest() {
    if (aiSuggested) return
    setAiLoading(true)
    const preset = NICHES.find(n => n.id === demoState.niche) ?? CUSTOM_NICHE_PRESET
    const snapFormats = demoState.formats
    const snapInstructions = demoState.instructions
    setTimeout(() => {
      setAiLoading(false)
      setAiSuggested(true)
      setDemoState({
        ...demoState,
        formats: preset.formats.length > 0 ? [...Array.from(preset.formats)] : snapFormats,
        instructions: preset.instructions || snapInstructions,
      })
      setTimeout(() => setRenameOn(true), 700)
    }, 1800)
  }

  const preset    = NICHES.find(n => n.id === demoState.niche) ?? CUSTOM_NICHE_PRESET
  const allFmts   = preset.formats as unknown as string[]
  const canSubmit = demoState.assetName.trim().length > 0

  return (
    <motion.div variants={stepVariants} initial="initial" animate="animate" exit="exit" className="w-full max-w-xl">
      <StepBadge step={3} label={STEP_LABELS[2]} />
      <div className="text-center mb-8">
        <h2 className="font-heading text-4xl md:text-5xl text-ink">AI Builds the Spec</h2>
        <p className="font-body text-ink/50 mt-2">Works for every type of freelancer. One click fills everything.</p>
      </div>

      <WobblyCard flavor="default" decoration="tape" rotate="0.5" shadow="lg">
        <WobblyCardHeader>
          <WobblyCardTitle className="text-lg">Asset Request Builder</WobblyCardTitle>
          <WobblyCardDescription>What kind of freelancer are you?</WobblyCardDescription>
        </WobblyCardHeader>
        <WobblyCardContent>
          <div className="flex flex-col gap-5">

            {/* Niche selector */}
            <div>
              <p className="font-body text-xs text-ink/45 uppercase tracking-wider mb-2">Your niche</p>
              <div className="flex flex-wrap gap-2">
                {NICHES.map(n => (
                  <motion.button
                    key={n.id}
                    animate={
                      demoState.niche === n.id
                        ? { backgroundColor: '#2d2d2d', color: '#FAFAF7', borderColor: '#2d2d2d', scale: 1.06 }
                        : { backgroundColor: '#FAFAF7', color: '#2d2d2d', borderColor: 'rgba(45,45,45,0.2)', scale: 1 }
                    }
                    transition={{ type: 'spring', stiffness: 320 }}
                    onClick={() => selectNiche(n.id as DemoState['niche'])}
                    className="font-body text-xs px-3 py-1.5 border-2 font-semibold flex items-center gap-1.5"
                    style={{ borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px' }}
                  >
                    {n.icon}
                    {n.label}
                  </motion.button>
                ))}

                {/* Custom / Other niche */}
                {showNicheInput ? (
                  <div className="flex items-center gap-1">
                    <input
                      autoFocus
                      value={nicheInput}
                      onChange={e => setNicheInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') confirmCustomNiche(); if (e.key === 'Escape') { setShowNicheInput(false); setNicheInput('') } }}
                      placeholder="e.g. Architect, Coach…"
                      className="w-36 px-2 py-1 border-2 border-ink/30 font-body text-xs outline-none focus:border-ink"
                      style={{ borderRadius: '8px' }}
                    />
                    <button
                      onClick={confirmCustomNiche}
                      className="font-body text-xs px-2 py-1 bg-ink text-paper border-2 border-ink"
                      style={{ borderRadius: '8px' }}
                    >✓</button>
                  </div>
                ) : (
                  <motion.button
                    animate={
                      demoState.niche === 'other'
                        ? { backgroundColor: '#7c3aed', color: '#fff', borderColor: '#7c3aed', scale: 1.06 }
                        : { backgroundColor: '#FAFAF7', color: '#2d2d2d', borderColor: 'rgba(45,45,45,0.2)', scale: 1 }
                    }
                    transition={{ type: 'spring', stiffness: 320 }}
                    onClick={() => setShowNicheInput(true)}
                    className="font-body text-xs px-3 py-1.5 border-2 font-semibold flex items-center gap-1.5 border-dashed"
                    style={{ borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px' }}
                  >
                    <Plus size={11} />
                    {demoState.niche === 'other' && demoState.customNicheLabel
                      ? demoState.customNicheLabel
                      : 'Other'}
                  </motion.button>
                )}
              </div>
            </div>

            {/* Asset name input */}
            <div>
              <p className="font-body text-xs text-ink/45 uppercase tracking-wider mb-2">Asset name</p>
              <input
                value={demoState.assetName}
                onChange={e => setDemoState({ ...demoState, assetName: e.target.value })}
                placeholder="e.g. 500-word Blog Post, 4K Drone Footage, Python Script…"
                className="w-full p-3 border-2 border-ink/25 font-body text-sm text-ink bg-paper/80 outline-none focus:border-ink"
                style={{ borderRadius: '12px 3px 12px 3px / 3px 12px 3px 12px' }}
              />
            </div>

            {/* Quantity stepper */}
            <div className="flex items-center gap-3">
              <p className="font-body text-xs text-ink/45 uppercase tracking-wider flex-1">Quantity</p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDemoState({ ...demoState, assetQty: Math.max(1, demoState.assetQty - 1) })}
                  disabled={demoState.assetQty <= 1}
                  className="w-7 h-7 flex items-center justify-center border-2 border-ink/40 font-body text-sm text-ink hover:border-ink disabled:opacity-30 transition-all"
                  style={{ borderRadius: '8px 2px 8px 2px / 2px 8px 2px 8px' }}
                >−</button>
                <span className="font-heading text-lg text-ink w-6 text-center">{demoState.assetQty}</span>
                <button
                  type="button"
                  onClick={() => setDemoState({ ...demoState, assetQty: Math.min(10, demoState.assetQty + 1) })}
                  disabled={demoState.assetQty >= 10}
                  className="w-7 h-7 flex items-center justify-center border-2 border-ink/40 font-body text-sm text-ink hover:border-ink disabled:opacity-30 transition-all"
                  style={{ borderRadius: '8px 2px 8px 2px / 2px 8px 2px 8px' }}
                >+</button>
              </div>
              {demoState.assetQty > 1 && (
                <span className="font-body text-xs text-blue-600">{demoState.assetQty} upload slots</span>
              )}
            </div>

            {/* Format chips */}
            <div>
              <p className="font-body text-xs text-ink/45 uppercase tracking-wider mb-2">Accepted formats</p>
              <div className="flex flex-wrap gap-2">
                {allFmts.map(t => (
                  <motion.button
                    key={t}
                    animate={
                      demoState.formats.includes(t)
                        ? { backgroundColor: '#2d2d2d', color: '#FAFAF7', borderColor: '#2d2d2d', scale: 1.06 }
                        : { backgroundColor: '#FAFAF7', color: '#2d2d2d', borderColor: 'rgba(45,45,45,0.2)', scale: 1 }
                    }
                    transition={{ type: 'spring', stiffness: 320 }}
                    onClick={() => toggleFormat(t)}
                    className="font-body text-xs px-3 py-1.5 border-2 font-semibold"
                    style={{ borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px' }}
                  >
                    .{t.toLowerCase()}
                  </motion.button>
                ))}

                {/* Custom format badges */}
                {demoState.formats.filter(f => !allFmts.includes(f)).map(f => (
                  <motion.button
                    key={f}
                    animate={{ backgroundColor: '#7c3aed', color: '#fff', borderColor: '#7c3aed', scale: 1 }}
                    onClick={() => toggleFormat(f)}
                    className="font-body text-xs px-3 py-1.5 border-2 font-semibold"
                    style={{ borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px' }}
                    title="Click to remove"
                  >
                    .{f.toLowerCase()} ✕
                  </motion.button>
                ))}

                {/* Add custom format */}
                {showCustom ? (
                  <div className="flex items-center gap-1">
                    <input
                      autoFocus
                      value={customInput}
                      onChange={e => setCustomInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addCustomFormat()}
                      placeholder=".ext"
                      className="w-20 px-2 py-1 border-2 border-ink/30 font-body text-xs outline-none focus:border-ink"
                      style={{ borderRadius: '8px' }}
                    />
                    <button
                      onClick={addCustomFormat}
                      className="font-body text-xs px-2 py-1 bg-ink text-paper border-2 border-ink"
                      style={{ borderRadius: '8px' }}
                    >
                      Add
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowCustom(true)}
                    className="font-body text-xs px-3 py-1.5 border-2 border-dashed border-ink/30 text-ink/50 flex items-center gap-1 hover:border-ink hover:text-ink transition-colors"
                    style={{ borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px' }}
                    title="Add a custom file extension"
                  >
                    <Plus size={11} /> custom
                  </button>
                )}
              </div>
            </div>

            {/* Instructions box */}
            <div>
              <p className="font-body text-xs text-ink/45 uppercase tracking-wider mb-2">Custom instructions</p>
              <div
                className="w-full p-3 border-2 border-ink/25 font-body text-sm text-ink/70 bg-muted/30 min-h-[60px]"
                style={{ borderRadius: '12px 3px 12px 3px / 3px 12px 3px 12px' }}
              >
                {aiLoading ? (
                  <motion.span animate={{ opacity: [0.3,1,0.3] }} transition={{ duration: 0.9, repeat: Infinity }}>
                    Llama 3.3 is writing instructions…
                  </motion.span>
                ) : demoState.instructions || (
                  <span className="text-ink/30">AI will fill this in for you…</span>
                )}
              </div>
            </div>

            {/* AI Suggest button */}
            {!aiSuggested && (
              <WobblyButton size="md" className="w-full gap-2" onClick={handleAiSuggest} disabled={aiLoading || !canSubmit}>
                {aiLoading ? (
                  <>
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' as const }}>
                      <Image src="/meta-llama.png" alt="" width={16} height={16} />
                    </motion.div>
                    Llama 3.3 is thinking…
                  </>
                ) : (
                  <>
                    <Image src="/meta-llama.png" alt="" width={16} height={16} />
                    ✨ AI Suggest — auto-fill formats &amp; instructions
                  </>
                )}
              </WobblyButton>
            )}

            {aiSuggested && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 bg-green-50 border-2 border-green-300"
                style={{ borderRadius: '12px 3px 12px 3px / 3px 12px 3px 12px' }}
              >
                <CheckCircle size={15} className="text-green-600" />
                <p className="font-body text-xs text-green-700">
                  <strong>Llama 3.3 auto-filled:</strong> {demoState.formats.join(', ')} formats + instructions for <em>{demoState.assetName}</em>.
                </p>
              </motion.div>
            )}

            {/* Rename toggle */}
            <ToggleSwitch
              on={renameOn}
              onToggle={() => setRenameOn(r => !r)}
              label="🏷️ Professional Auto-Rename"
              sub="Files renamed: ClientName_Asset_Project_Date on upload"
            />

            {aiSuggested && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <WobblyButton size="md" className="w-full gap-2" onClick={onNext}>
                  Create &amp; Generate Magic Link <ArrowRight size={15} strokeWidth={3} />
                </WobblyButton>
              </motion.div>
            )}
          </div>
        </WobblyCardContent>
      </WobblyCard>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  STEP 3: Magic Link Generated
// ─────────────────────────────────────────────────────────────────────────────

function Step3MagicLink({
  onNext,
  demoState,
}: {
  onNext: () => void
  demoState: DemoState
}) {
  const [emailVisible, setEmailVisible] = useState(false)
  const MAGIC_URL = 'fetchasset.com/demo/preview-portal'

  useEffect(() => {
    const t = setTimeout(() => setEmailVisible(true), 1200)
    return () => clearTimeout(t)
  }, [])

  return (
    <motion.div variants={stepVariants} initial="initial" animate="animate" exit="exit" className="w-full max-w-xl">
      <StepBadge step={4} label={STEP_LABELS[3]} />
      <div className="text-center mb-8">
        <h2 className="font-heading text-4xl md:text-5xl text-ink">Magic Link Ready ✨</h2>
        <p className="font-body text-ink/50 mt-2">No password. No app. Just one link &mdash; and the client is in.</p>
      </div>

      <WobblyCard flavor="postit" decoration="tack" rotate="-1" shadow="lg">
        <WobblyCardHeader>
          <div className="flex items-center gap-2">
            <Link2 size={16} className="text-ink/60" />
            <WobblyCardTitle className="text-lg">Link Generated</WobblyCardTitle>
          </div>
          <WobblyCardDescription>Asset: <strong>{demoState.assetName || 'Your Asset'}</strong></WobblyCardDescription>
        </WobblyCardHeader>
        <WobblyCardContent>
          <div className="flex flex-col gap-5">

            {/* Clickable URL pill */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            >
              <WobblyTooltip delay={0.6} side="top">
                👆 Click to open the real demo client portal!
              </WobblyTooltip>
              <Link
                href="/demo/preview-portal"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 w-full flex items-center gap-2 p-3 bg-paper border-[3px] border-ink hover:bg-[#fffde7] transition-colors group"
                style={{ borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px', boxShadow: '4px 4px 0 0 #2d2d2d' }}
              >
                <Link2 size={14} className="text-ink/40 flex-shrink-0" />
                <span className="font-body text-sm text-ink flex-1 truncate text-left group-hover:underline">{MAGIC_URL}</span>
                <span
                  className="font-body text-xs px-2 py-0.5 flex-shrink-0 bg-ink text-paper"
                  style={{ borderRadius: '20px' }}
                >
                  Open ↗
                </span>
              </Link>
            </motion.div>

            {/* No-password badge */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-3 p-3 bg-green-50 border-2 border-green-300"
              style={{ borderRadius: '12px 3px 12px 3px / 3px 12px 3px 12px' }}
            >
              <CheckCircle size={16} className="text-green-600 flex-shrink-0" />
              <p className="font-body text-sm text-green-800">
                <strong>No Password Required.</strong> Client clicks link &rarr; immediately inside their portal.
              </p>
            </motion.div>

            {/* Email preview card */}
            <AnimatePresence>
              {emailVisible && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border-[3px] border-ink overflow-hidden"
                  style={{ borderRadius: '12px 3px 12px 3px / 3px 12px 3px 12px', boxShadow: '4px 4px 0 0 #2d2d2d' }}
                >
                  <div className="bg-ink/90 text-paper px-4 py-2 flex items-center gap-2">
                    <span className="font-body text-xs opacity-60">📧 Email sent to client</span>
                    <motion.div
                      animate={{ x: [0, 3, 0, -3, 0] }}
                      transition={{ delay: 0.4, duration: 0.5 }}
                      className="ml-auto font-body text-xs bg-green-400 text-ink px-2 py-0.5"
                      style={{ borderRadius: '20px' }}
                    >
                      DELIVERED
                    </motion.div>
                  </div>
                  <div className="p-5 bg-[#faf8f5] flex flex-col gap-3">
                    <div className="font-body text-xs text-ink/40 flex gap-4 flex-wrap">
                      <span><strong>To:</strong> you@client.com</span>
                      <span><strong>Subject:</strong> Your files are needed &mdash; {demoState.assetName || 'Asset Request'}</span>
                    </div>
                    <p className="font-heading text-lg text-ink">Hey! 👋 Your portal is ready.</p>
                    <p className="font-body text-sm text-ink/70 leading-relaxed">
                      Please upload: <strong>{demoState.assetName || 'the requested asset'}</strong>.
                      {demoState.formats.length > 0 && (
                        <> Accepted formats: <em>{demoState.formats.map(f => `.${f.toLowerCase()}`).join(', ')}</em>.</>
                      )}
                      {' '}Deadline: <em>Wednesday, 25 February</em>.
                    </p>
                    {/* Big CTA button mockup */}
                    <Link
                      href="/demo/preview-portal"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 px-6 py-3 bg-ink text-paper font-body text-sm font-bold text-center w-full flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                      style={{ borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px', boxShadow: '3px 3px 0 0 #e63946' }}
                    >
                      🔗 Open My Portal &mdash; No Password Needed
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {emailVisible && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <WobblyButton size="md" className="w-full gap-2" onClick={onNext}>
                  See the client experience <ArrowRight size={15} strokeWidth={3} />
                </WobblyButton>
              </motion.div>
            )}
          </div>
        </WobblyCardContent>
      </WobblyCard>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  STEP 4: Client Experience — Progress Bar + File Upload
// ─────────────────────────────────────────────────────────────────────────────

function Step4ClientView({ onNext, demoState }: { onNext: () => void; demoState: DemoState }) {
  const [progress, setProgress] = useState(0)
  const [fileArrived, setFileArrived] = useState(false)
  const [uploaded, setUploaded] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setFileArrived(true), 1000)
    const t2 = setTimeout(() => {
      setUploaded(true)
      setProgress(50)
    }, 3200)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  const progressColor =
    progress === 100 ? '#22c55e' :
    progress >= 60   ? '#f59e0b' : '#2d2d2d'

  const fmtList = demoState.formats.length > 0
    ? demoState.formats.map(f => f.toUpperCase()).join(', ')
    : 'Any format'

  return (
    <motion.div variants={stepVariants} initial="initial" animate="animate" exit="exit" className="w-full max-w-xl">
      <StepBadge step={5} label={STEP_LABELS[4]} />
      <div className="text-center mb-8">
        <h2 className="font-heading text-4xl md:text-5xl text-ink">What Your Client Sees</h2>
        <p className="font-body text-ink/50 mt-2">No login. No app install. Just a magic link and a clean UI.</p>
      </div>

      {/* Client portal mockup */}
      <div
        className="border-[3px] border-ink overflow-hidden bg-paper"
        style={{ borderRadius: '12px 3px 14px 3px / 3px 14px 3px 12px', boxShadow: '5px 5px 0 0 #2d2d2d' }}
      >
        {/* Portal header */}
        <div className="bg-[#FAFAF7] border-b-2 border-ink/10 px-5 py-4">
          <div className="flex items-center justify-between mb-0.5">
            <p className="font-heading text-xl text-ink">{demoState.assetName || 'Asset Request'}</p>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, type: 'spring', stiffness: 200 }}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 border-2 border-ink/20 bg-[#fffde7]"
              style={{ borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px' }}
            >
              <span className="w-3 h-3 rounded-full border border-ink/30" style={{ background: '#2d5da1' }} />
              <span className="font-body text-[10px] text-ink/60">Your brand, your colors ✦</span>
            </motion.div>
          </div>
          <p className="font-body text-xs text-ink/40 mt-0.5">Deadline: Wednesday, 25 February &middot; Powered by FetchAsset</p>
          <div className="mt-3">
            <div className="flex justify-between font-body text-xs text-ink/45 mb-1">
              <span>{progress === 0 ? 'No files uploaded yet' : progress === 50 ? 'Great start! ✨' : 'All done! 🎉'}</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full h-3 bg-muted border-2 border-ink/20 overflow-hidden" style={{ borderRadius: '255px' }}>
              <motion.div
                animate={{ width: `${progress}%`, backgroundColor: progressColor }}
                transition={{ duration: 0.7, ease: 'easeOut' as const }}
                className="h-full"
                style={{ borderRadius: '255px' }}
              />
            </div>
          </div>
        </div>

        {/* Upload area */}
        <div className="p-5">
          <p className="font-body text-sm text-ink/60 mb-3">
            <strong className="text-ink">Asset 1 of 1:</strong> {demoState.assetName || 'Requested Asset'} ({fmtList})
          </p>
          <motion.div
            animate={
              uploaded
                ? { backgroundColor: '#f0fdf4', borderColor: '#22c55e' }
                : { backgroundColor: 'transparent', borderColor: 'rgba(45,45,45,0.25)' }
            }
            className="border-[3px] border-dashed p-8 flex flex-col items-center justify-center gap-3 relative overflow-hidden min-h-[160px]"
            style={{ borderRadius: '180px 45px 200px 35px / 40px 190px 30px 170px' }}
          >
            {!uploaded ? (
              <>
                <Upload className="w-9 h-9 text-ink/22" />
                <p className="font-body text-sm text-ink/40 text-center">Drop files here or click to browse</p>
                <p className="font-body text-xs text-ink/30">Accepted: {fmtList}</p>
                {fileArrived && (
                  <motion.div
                    initial={{ x: 200, y: -40, opacity: 0, rotate: 15 }}
                    animate={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 70, damping: 13 }}
                    className="absolute"
                  >
                    <div
                      className="bg-amber-50 border-2 border-amber-400 px-4 py-1.5 font-body text-xs text-amber-800 flex items-center gap-2"
                      style={{ borderRadius: '180px 45px 200px 35px / 40px 190px 30px 170px', boxShadow: '2px 2px 0 0 #d97706' }}
                    >
                      ⚠️ wrong_file.jpg &mdash; dropping…
                    </div>
                  </motion.div>
                )}
              </>
            ) : (
              <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 240 }}
                className="flex flex-col items-center gap-2"
              >
                <CheckCircle className="w-12 h-12 text-green-500" strokeWidth={2} />
                <p className="font-heading text-xl text-green-700">Uploaded!</p>
                <p className="font-body text-xs text-ink/40">wrong_file.jpg &middot; 1.2 MB</p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      {uploaded && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mt-5">
          <WobblyButton size="md" className="w-full gap-2" onClick={onNext}>
            AI is now scanning this file 🤖 <ArrowRight size={15} strokeWidth={3} />
          </WobblyButton>
        </motion.div>
      )}
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  STEP 5: AI Audit — Universal, context-aware error + reupload + green check
// ─────────────────────────────────────────────────────────────────────────────

function getAuditScenario(ds: DemoState) {
  switch (ds.niche) {
    case 'writer':    return {
      badFile:    'blog_draft.pdf',
      error:      'Wrong format',
      detail:     'PDF received — DOCX required for collaborative editing and revision tracking.',
      suggestion: 'Export from Google Docs / Word as .docx.',
      goodFile:   'blog_post_final.docx',
      okMsg:      'DOCX confirmed — 512 words, headings present, metadata complete.',
    }
    case 'video':     return {
      badFile:    'clip_720p.mov',
      error:      'Resolution too low',
      detail:     '1280×720 found — 4K (3840×2160) minimum required.',
      suggestion: 'Re-export from your NLE at full 4K. No compression.',
      goodFile:   '4k_footage_final.mp4',
      okMsg:      '3840×2160 @ 30fps — format and resolution confirmed.',
    }
    case 'developer': return {
      badFile:    'script_no_deps.zip',
      error:      'Missing requirements.txt',
      detail:     'No dependency manifest found inside the .zip archive.',
      suggestion: 'Run `pip freeze > requirements.txt` and re-zip with it included.',
      goodFile:   'project_with_deps.zip',
      okMsg:      'requirements.txt found — all 7 dependencies listed. README included.',
    }
    case 'photo':     return {
      badFile:    'photo_compressed.jpg',
      error:      'Resolution too low',
      detail:     '800×600px found — minimum 3000px on the longest side required.',
      suggestion: 'Export from Lightroom at full resolution (no compression preset).',
      goodFile:   'product_shot.dng',
      okMsg:      '6000×4000px DNG — print-ready quality confirmed.',
    }
    case 'music':     return {
      badFile:    'master_export.mp3',
      error:      'Wrong format / bit depth',
      detail:     'MP3 received — 24-bit WAV/AIFF required for mastering.',
      suggestion: 'Bounce from your DAW as 24-bit 48kHz WAV.',
      goodFile:   'master_24bit.wav',
      okMsg:      '24-bit 48kHz WAV — studio quality confirmed. Wet + dry stems included.',
    }
    default:          return {
      badFile:    'logo_low_res.jpg',
      error:      'Image too low resolution for print',
      detail:     '72 DPI found — 300 DPI minimum required.',
      suggestion: 'Upload a vector file (SVG or AI) instead of a raster image.',
      goodFile:   'logo_final.svg',
      okMsg:      'Vector format confirmed — scalable, print-ready, all variations included.',
    }
  }
}

function Step5AiAudit({ onNext, demoState }: { onNext: () => void; demoState: DemoState }) {
  const [phase, setPhase] = useState<'scanning' | 'error' | 'reupload' | 'success'>('scanning')
  const scenario = getAuditScenario(demoState)

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('error'), 2400)
    return () => clearTimeout(t1)
  }, [])

  function handleReupload() {
    setPhase('reupload')
    setTimeout(() => setPhase('success'), 2200)
  }

  const aiPrompt = `Verify if this file matches the user's request: "${demoState.assetName || 'Asset'}"${demoState.formats.length > 0 ? ` in ${demoState.formats.join('/')} format` : ''}${demoState.instructions ? ` — constraints: ${demoState.instructions.slice(0, 60)}…` : ''}`

  return (
    <motion.div variants={stepVariants} initial="initial" animate="animate" exit="exit" className="w-full max-w-xl">
      <StepBadge step={6} label={STEP_LABELS[5]} />
      <div className="text-center mb-8">
        <h2 className="font-heading text-4xl md:text-5xl text-ink">Llama 3.3 is on it 🤖</h2>
        <p className="font-body text-ink/50 mt-2 text-xs">{aiPrompt}</p>
      </div>

      <WobblyCard flavor="postit" decoration="tack" rotate="-1" shadow="lg">
        <WobblyCardContent>
          <AnimatePresence mode="wait">

            {/* Scanning */}
            {phase === 'scanning' && (
              <motion.div key="scanning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-6 py-10"
              >
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' as const }}>
                  <Image src="/meta-llama.png" alt="AI scanning" width={52} height={52} />
                </motion.div>
                <div className="text-center">
                  <p className="font-heading text-2xl text-ink">Scanning: {scenario.badFile}</p>
                  <p className="font-body text-xs text-ink/40 mt-1">Checking against: <em>{demoState.assetName || 'Asset'}</em> requirements…</p>
                  <div className="flex justify-center gap-1.5 mt-4">
                    {[0,1,2,3,4].map((i) => (
                      <motion.div key={i} className="w-2 h-2 bg-ink rounded-full"
                        animate={{ opacity: [0.1, 1, 0.1], y: [0, -4, 0] }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Error found */}
            {phase === 'error' && (
              <motion.div key="error" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 320, delay: 0.1 }}
                    className="w-11 h-11 bg-red-500 text-paper flex items-center justify-center flex-shrink-0" style={{ borderRadius: '50%' }}
                  >
                    <AlertTriangle size={20} strokeWidth={2.5} />
                  </motion.div>
                  <div>
                    <p className="font-heading text-lg text-red-600">Issue Detected ⚠️</p>
                    <p className="font-body text-xs text-ink/45">{scenario.badFile}</p>
                  </div>
                </div>

                <motion.div initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}
                  className="border-[3px] border-red-400 bg-red-50 px-4 py-3"
                  style={{ borderRadius: '180px 45px 200px 35px / 40px 190px 30px 170px' }}
                >
                  <div className="flex items-start gap-2">
                    <Zap size={14} className="text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" />
                    <div>
                      <p className="font-body text-sm font-bold text-red-700">{scenario.error}</p>
                      <p className="font-body text-xs text-red-400 mt-0.5">{scenario.detail}</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.35 }}
                  className="border-2 border-ink/15 bg-amber-50/60 px-4 py-3"
                  style={{ borderRadius: '180px 45px 200px 35px / 40px 190px 30px 170px' }}
                >
                  <p className="font-body text-xs text-ink/65">
                    <strong>🤖 AI Suggestion:</strong> {scenario.suggestion}
                  </p>
                </motion.div>

                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                  <WobblyButton size="md" className="w-full gap-2" onClick={handleReupload} variant="secondary">
                    Upload the correct file ({scenario.goodFile}) <ArrowRight size={14} strokeWidth={3} />
                  </WobblyButton>
                </motion.div>
              </motion.div>
            )}

            {/* Re-scanning */}
            {phase === 'reupload' && (
              <motion.div key="reupload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-6 py-10"
              >
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' as const }}>
                  <Image src="/meta-llama.png" alt="AI scanning" width={52} height={52} />
                </motion.div>
                <div className="text-center">
                  <p className="font-heading text-2xl text-ink">Scanning: {scenario.goodFile}</p>
                  <p className="font-body text-xs text-ink/40 mt-1">Verifying against requirements…</p>
                  <div className="flex justify-center gap-1.5 mt-4">
                    {[0,1,2,3,4].map((i) => (
                      <motion.div key={i} className="w-2 h-2 bg-green-500 rounded-full"
                        animate={{ opacity: [0.1, 1, 0.1], y: [0, -4, 0] }}
                        transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.12 }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Success */}
            {phase === 'success' && (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 320 }}
                    className="w-11 h-11 bg-green-500 text-paper flex items-center justify-center flex-shrink-0" style={{ borderRadius: '50%' }}
                  >
                    <Check size={20} strokeWidth={3} />
                  </motion.div>
                  <div>
                    <p className="font-heading text-lg text-green-600">Perfect File ✅</p>
                    <p className="font-body text-xs text-ink/45">{scenario.goodFile}</p>
                  </div>
                </div>

                <motion.div initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}
                  className="border-[3px] border-green-400 bg-green-50 px-4 py-3"
                  style={{ borderRadius: '180px 45px 200px 35px / 40px 190px 30px 170px' }}
                >
                  <p className="font-body text-sm font-bold text-green-700">{scenario.okMsg}</p>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                  className="p-3 bg-[#f0fdf4] border-2 border-green-200" style={{ borderRadius: '12px 3px 12px 3px / 3px 12px 3px 12px' }}
                >
                  <p className="font-body text-xs text-green-600 mb-1">🏷️ Auto-renamed on arrival:</p>
                  <p className="font-body text-sm font-bold text-green-800">Client_{demoState.assetName.replace(/\s+/g,'')}_20260225{scenario.goodFile.slice(scenario.goodFile.lastIndexOf('.'))}</p>
                  <p className="font-body text-xs text-green-500 mt-0.5">ClientSlug_Asset_Date &middot; No manual sorting needed</p>
                </motion.div>

                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
                  <WobblyButton size="md" className="w-full gap-2" onClick={onNext}>
                    See the final result 🎉 <ArrowRight size={15} strokeWidth={3} />
                  </WobblyButton>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </WobblyCardContent>
      </WobblyCard>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  STEP 6: Success & Organisation — Agency view + CTA
// ─────────────────────────────────────────────────────────────────────────────

function Step6Success({ onRestart, demoState }: { onRestart: () => void; demoState: DemoState }) {
  const scenario = getAuditScenario(demoState)
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.45 } }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-lg text-center"
    >
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <h2 className="font-heading text-4xl md:text-5xl text-ink mb-2">{"That's the magic! 🎉"}</h2>
        <p className="font-body text-lg text-ink/60 mb-5 max-w-sm mx-auto leading-snug">
          Collect client assets in minutes, not days. AI catches every problem before it costs you.
        </p>

        {/* Dashboard done-state mockup */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="mb-8 border-[3px] border-ink overflow-hidden text-left"
          style={{ borderRadius: '12px 3px 14px 3px / 3px 14px 3px 12px', boxShadow: '4px 4px 0 0 #2d2d2d' }}
        >
          <div className="bg-ink text-paper px-4 py-2 flex items-center gap-2">
            <span className="font-body text-xs opacity-60">📁 Agency Dashboard &mdash; {demoState.assetName || 'Asset Request'}</span>
            <span className="ml-auto font-body text-xs bg-green-400 text-ink px-2 py-0.5" style={{ borderRadius: '20px' }}>COMPLETE</span>
          </div>
          <div className="p-4 bg-[#faf8f5] flex flex-col gap-2">
            <div className="flex items-center gap-2 font-body text-sm">
              <CheckCircle size={14} className="text-green-600" strokeWidth={2.5} />
              <span className="text-ink/80 line-through">{scenario.badFile}</span>
              <span className="text-red-400 text-xs">rejected by AI</span>
            </div>
            <div className="flex items-center gap-2 font-body text-sm">
              <CheckCircle size={14} className="text-green-600" strokeWidth={2.5} />
              <span className="text-green-700 font-semibold">Client_{demoState.assetName.replace(/\s+/g,'')}_20260225{scenario.goodFile.slice(scenario.goodFile.lastIndexOf('.'))}</span>
              <span className="font-body text-xs bg-green-100 text-green-700 px-2 py-0.5" style={{ borderRadius: '20px' }}>✅ AI approved</span>
            </div>

            {/* Approve / Reject controls */}
            <div className="mt-2 pt-2 border-t border-ink/10 flex items-center gap-2">
              <span className="font-body text-xs text-ink/40 mr-auto">Your review:</span>
              <span
                className="flex items-center gap-1 px-3 py-1 font-body text-xs font-bold text-paper bg-green-600"
                style={{ borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px', boxShadow: '2px 2px 0 0 #2d2d2d' }}
              >
                <Check size={11} strokeWidth={3} /> Approve
              </span>
              <span
                className="flex items-center gap-1 px-3 py-1 font-body text-xs font-bold text-ink border-2 border-ink/30"
                style={{ borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px' }}
              >
                <X size={11} strokeWidth={3} /> Reject
              </span>
            </div>
            <div className="mt-1 pt-2 border-t border-ink/10 font-body text-xs text-ink/45">
              Files auto-organised &middot; Deadline buffer secured &middot; Zero manual work
            </div>
          </div>
        </motion.div>


        {/* Agency notification email */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-6 border-[3px] border-ink overflow-hidden text-left"
          style={{ borderRadius: '12px 3px 14px 3px / 3px 14px 3px 12px', boxShadow: '4px 4px 0 0 #2d2d2d' }}
        >
          <div className="bg-ink text-paper px-4 py-2 flex items-center gap-2">
            <span className="font-body text-xs opacity-60">📧 You received an email</span>
            <span className="ml-auto font-body text-xs bg-green-400 text-ink px-2 py-0.5" style={{ borderRadius: '20px' }}>INSTANT</span>
          </div>
          <div className="p-4 bg-[#faf8f5] flex flex-col gap-2">
            <p className="font-body text-xs text-ink/40">
              <strong>Subject:</strong> ✅ New submission — {demoState.assetName || 'Asset'}
            </p>
            <p className="font-body text-sm text-ink/70">
              Your client just submitted <strong>{scenario.goodFile}</strong>. Llama 3.3 has audited it and everything looks good. Click below to review.
            </p>
            <div
              className="text-center py-2 font-body text-xs font-bold text-paper bg-ink mt-1"
              style={{ borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px', boxShadow: '2px 2px 0 0 #e63946' }}
            >
              Review in Dashboard →
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.55 }}
          className="mb-5 p-4 border-[3px] border-ink bg-[#fffde7]"
          style={{ borderRadius: '180px 45px 200px 35px / 40px 190px 30px 170px', boxShadow: '4px 4px 0 0 #2d2d2d' }}
        >
          <p className="font-heading text-xl text-ink">Stop Chasing.</p>
          <p className="font-heading text-xl text-ink">Start Fetching. ✦</p>
        </motion.div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-3">
          <Link href="/login">
            <WobblyButton size="xl" className="gap-3">
              Get Started for Free
              <ArrowRight strokeWidth={3} className="w-5 h-5" />
            </WobblyButton>
          </Link>
          <WobblyButton variant="secondary" size="lg" className="gap-2" onClick={onRestart}>
            <RotateCcw size={15} /> Restart Tour
          </WobblyButton>
        </div>
        <p className="font-body text-sm text-ink/35">
          Free forever &nbsp;&middot;&nbsp; No credit card &nbsp;&middot;&nbsp; Ready in 2 minutes
        </p>
      </motion.div>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  DEMO PORTAL MODAL — "Live link" preview: client-side interactive portal
// ─────────────────────────────────────────────────────────────────────────────

function DemoPortalModal({ demoState, onClose }: { demoState: DemoState; onClose: () => void }) {
  const [phase, setPhase] = useState<'portal' | 'uploading' | 'scanning' | 'success'>('portal')
  const scenario  = getAuditScenario(demoState)
  const fmtList   = demoState.formats.length > 0
    ? demoState.formats.map(f => `.${f.toLowerCase()}`).join(', ')
    : 'Any format accepted'

  function handleMockUpload() {
    setPhase('uploading')
    setTimeout(() => setPhase('scanning'), 1400)
    setTimeout(() => setPhase('success'), 3600)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[300] bg-ink/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 28 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
        className="w-full max-w-lg bg-paper border-[3px] border-ink overflow-hidden"
        style={{ borderRadius: '12px 3px 14px 3px / 3px 14px 3px 12px', boxShadow: '8px 8px 0 0 #2d2d2d' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Browser chrome */}
        <div className="bg-ink text-paper px-5 py-3 flex items-center justify-between">
          <div>
            <p className="font-body text-xs">🔗 fetchasset.com/demo/preview-portal</p>
            <p className="font-body text-[10px] opacity-40">Demo Client View — no account needed</p>
          </div>
          <button onClick={onClose} className="opacity-50 hover:opacity-100 transition-opacity p-1">
            <X size={15} />
          </button>
        </div>

        {/* Portal header */}
        <div className="bg-[#FAFAF7] border-b-2 border-ink/10 px-5 py-4">
          <p className="font-heading text-xl text-ink mb-0.5">{demoState.assetName || 'Asset Request'}</p>
          <p className="font-body text-xs text-ink/40">Deadline: Wednesday, 25 February &middot; Powered by FetchAsset</p>
          {demoState.instructions && (
            <p className="font-body text-xs text-ink/55 mt-1.5 italic">&ldquo;{demoState.instructions}&rdquo;</p>
          )}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {demoState.formats.map(f => (
              <span key={f} className="font-body text-[10px] bg-ink/8 border border-ink/15 px-2 py-0.5 text-ink/60"
                style={{ borderRadius: '20px' }}>.{f.toLowerCase()}</span>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">

            {/* Upload prompt */}
            {phase === 'portal' && (
              <motion.div key="portal" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <p className="font-body text-sm text-ink/60 mb-4">
                  Click the button below to simulate your client uploading a file.
                </p>
                <motion.div
                  className="border-[3px] border-dashed border-ink/25 p-8 flex flex-col items-center gap-4 mb-5"
                  style={{ borderRadius: '180px 45px 200px 35px / 40px 190px 30px 170px' }}
                >
                  <Upload className="w-10 h-10 text-ink/20" />
                  <p className="font-body text-sm text-ink/40 text-center">
                    Requested: <strong className="text-ink">{demoState.assetName}</strong><br/>
                    <span className="text-xs">{fmtList}</span>
                  </p>
                </motion.div>
                <WobblyButton size="lg" className="w-full gap-2" onClick={handleMockUpload}>
                  <Upload size={16} /> Mock Upload &mdash; Simulate Client
                </WobblyButton>
              </motion.div>
            )}

            {/* Uploading */}
            {phase === 'uploading' && (
              <motion.div key="uploading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-4 py-8"
              >
                <motion.div
                  className="w-14 h-14 border-[3px] border-ink border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' as const }}
                />
                <p className="font-heading text-xl text-ink">Uploading…</p>
                <p className="font-body text-xs text-ink/40">{scenario.badFile}</p>
              </motion.div>
            )}

            {/* AI Scanning */}
            {phase === 'scanning' && (
              <motion.div key="scanning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-4 py-8"
              >
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' as const }}>
                  <Image src="/meta-llama.png" alt="AI" width={52} height={52} />
                </motion.div>
                <p className="font-heading text-xl text-ink">Llama 3.3 Scanning…</p>
                <p className="font-body text-xs text-ink/40 text-center">
                  Checking: <em>{demoState.assetName}</em> requirements
                </p>
                <div className="flex gap-1.5">
                  {[0,1,2,3,4].map(i => (
                    <motion.div key={i} className="w-2 h-2 bg-ink rounded-full"
                      animate={{ opacity: [0.1,1,0.1], y: [0,-4,0] }}
                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Result */}
            {phase === 'success' && (
              <motion.div key="success" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4">
                {/* Error found first */}
                <div className="border-[3px] border-red-400 bg-red-50 px-4 py-3"
                  style={{ borderRadius: '180px 45px 200px 35px / 40px 190px 30px 170px' }}
                >
                  <p className="font-body text-sm font-bold text-red-700">⚠️ {scenario.error}</p>
                  <p className="font-body text-xs text-red-400 mt-0.5">{scenario.detail}</p>
                </div>
                {/* AI suggestion */}
                <div className="border-2 border-amber-300 bg-amber-50 px-4 py-3"
                  style={{ borderRadius: '12px 3px 12px 3px / 3px 12px 3px 12px' }}
                >
                  <p className="font-body text-xs text-amber-800">
                    <strong>🤖 AI to client:</strong> {scenario.suggestion}
                  </p>
                </div>
                {/* Success after correction note */}
                <div className="border-2 border-green-300 bg-green-50 px-4 py-3"
                  style={{ borderRadius: '12px 3px 12px 3px / 3px 12px 3px 12px' }}
                >
                  <p className="font-body text-xs text-green-700">
                    <strong>✅ After re-upload ({scenario.goodFile}):</strong> {scenario.okMsg}
                  </p>
                </div>
                <WobblyButton variant="secondary" size="md" className="w-full" onClick={onClose}>
                  Close Preview &rarr; Back to Tour
                </WobblyButton>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  MAIN OVERLAY
// ─────────────────────────────────────────────────────────────────────────────

export default function DemoOverlay() {
  const [started, setStarted]         = useState(false)
  const [step, setStep]               = useState(0)
  const [muted, setMuted]             = useState(false)
  const [demoState, setDemoState]     = useState<DemoState>(DEFAULT_DEMO_STATE)
  const [portalOpen, setPortalOpen]   = useState(false)
  const audioRef                      = useRef<HTMLAudioElement>(null)

  const next    = useCallback(() => setStep(s => Math.min(s + 1, TOTAL_STEPS - 1)), [])
  const prev    = useCallback(() => setStep(s => Math.max(s - 1, 0)), [])
  const restart = useCallback(() => { setStep(0); setStarted(false); setDemoState(DEFAULT_DEMO_STATE); setPortalOpen(false) }, [])

  // Fire demo_completed when user reaches the final success step
  useEffect(() => {
    if (started && step === TOTAL_STEPS - 1) {
      capture(EVENTS.DEMO_COMPLETED)
    }
  }, [started, step])

  const handleStart = useCallback(() => {
    setStarted(true)
    if (audioRef.current) {
      audioRef.current.muted  = false
      audioRef.current.volume = 0.35
      audioRef.current.play().catch(() => {/* autoplay blocked */})
    }
  }, [])

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !muted
      setMuted(m => !m)
    }
  }

  return (
    <div className="fixed inset-0 z-[200] bg-paper flex flex-col overflow-hidden">
      {/* Graph-paper texture overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: [
            'linear-gradient(to right,  rgba(45,45,45,0.038) 1px, transparent 1px)',
            'linear-gradient(to bottom, rgba(45,45,45,0.038) 1px, transparent 1px)',
          ].join(','),
          backgroundSize: '28px 28px',
        }}
      />

      {/* ── TOP BAR ── */}
      <div className="relative z-10 bg-paper/95 backdrop-blur-sm border-b-[3px] border-dashed border-muted flex items-center justify-between px-5 py-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Link href="/" className="font-heading text-xl text-ink hover:opacity-80 transition-opacity">
            Fetch<span style={{ color: '#e63946' }}>Asset</span>
          </Link>
          <span
            className="font-body text-[10px] text-ink/40 ml-1 px-2 py-0.5 bg-muted border border-ink/15"
            style={{ borderRadius: '20px' }}
          >
            Full Product Tour
          </span>
        </div>
        <div className="flex items-center gap-2">
          {started && step > 0 && (
            <button
              type="button"
              onClick={restart}
              className="border-2 border-ink px-3 py-1.5 font-body text-xs flex items-center gap-1.5 hover:bg-muted transition-colors active:translate-y-px"
              style={{ borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px', boxShadow: '2px 2px 0 0 #2d2d2d' }}
            >
              <RotateCcw size={12} />
              <span className="hidden sm:inline">Restart</span>
            </button>
          )}
          <button
            type="button"
            onClick={toggleMute}
            className="border-2 border-ink px-3 py-1.5 font-body text-xs flex items-center gap-1.5 hover:bg-muted transition-colors active:translate-y-px"
            style={{ borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px', boxShadow: '2px 2px 0 0 #2d2d2d' }}
          >
            {muted ? <VolumeX size={13} /> : <Volume2 size={13} />}
            <span className="hidden sm:inline">{muted ? 'Unmute' : 'Mute'}</span>
          </button>
          <Link
            href="/"
            className="border-2 border-ink px-3 py-1.5 font-body text-xs flex items-center gap-1.5 hover:bg-muted transition-colors active:translate-y-px"
            style={{ borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px', boxShadow: '2px 2px 0 0 #2d2d2d' }}
          >
            <X size={13} />
            <span className="hidden sm:inline">Exit</span>
          </Link>
        </div>
      </div>

      {/* ── PROGRESS DOTS (only when tour started) ── */}
      {started && (
        <div className="relative z-10 flex items-center justify-center gap-2 py-3 flex-shrink-0">
          {STEP_LABELS.map((label, i) => (
            <motion.button
              key={i}
              type="button"
              onClick={() => setStep(i)}
              title={label}
              animate={{
                width:           i === step ? 36 : 10,
                backgroundColor: i <= step  ? '#2d2d2d' : '#e5e3dc',
                opacity:         i <= step  ? 1 : 0.45,
              }}
              transition={{ duration: 0.28 }}
              className="h-2.5 border-2 border-ink/30 cursor-pointer"
              style={{ borderRadius: '255px', minWidth: 10 }}
            />
          ))}
          <span className="font-body text-xs text-ink/30 ml-2 tabular-nums">
            {step + 1}/{TOTAL_STEPS}
          </span>
        </div>
      )}

      {/* ── STEP CONTENT ── */}
      <div className="relative z-10 flex-1 overflow-y-auto flex items-center justify-center p-5 md:p-10">
        <AnimatePresence mode="wait">
          {!started && (
            <motion.div key="prestart" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -20 }}>
              <PreStart onStart={handleStart} />
            </motion.div>
          )}
          {started && step === 0 && <Step0Dashboard  key="s0" onNext={next} />}
          {started && step === 1 && <Step1SmartSetup key="s1" onNext={next} />}
          {started && step === 2 && (
            <Step2AiSpec key="s2" onNext={next} demoState={demoState} setDemoState={setDemoState} />
          )}
          {started && step === 3 && (
            <Step3MagicLink key="s3" onNext={next} demoState={demoState} />
          )}
          {started && step === 4 && <Step4ClientView key="s4" onNext={next} demoState={demoState} />}
          {started && step === 5 && <Step5AiAudit    key="s5" onNext={next} demoState={demoState} />}
          {started && step === 6 && <Step6Success    key="s6" onRestart={restart} demoState={demoState} />}
        </AnimatePresence>
      </div>

      {/* ── BOTTOM NAV (steps 0-5) ── */}
      {started && step < TOTAL_STEPS - 1 && (
        <div className="relative z-10 bg-paper/95 backdrop-blur-sm border-t-[3px] border-dashed border-muted flex items-center justify-between px-6 py-3 flex-shrink-0">
          {step === 0 ? (
            <Link href="/" className="font-body text-sm text-ink/35 hover:text-ink transition-colors px-2 py-1">
              &larr; Home
            </Link>
          ) : (
            <button
              type="button"
              onClick={prev}
              className="font-body text-sm text-ink/35 hover:text-ink transition-colors px-2 py-1"
            >
              &larr; Back
            </button>
          )}
          <div className="font-body text-xs text-ink/35 hidden sm:block">
            {STEP_LABELS[step]}
          </div>
          <button
            type="button"
            onClick={next}
            className="font-body text-sm text-ink/40 hover:text-ink transition-colors px-2 py-1"
          >
            Skip &rarr;
          </button>
        </div>
      )}

      {/* ── DEMO PORTAL MODAL ── */}
      <AnimatePresence>
        {portalOpen && (
          <DemoPortalModal demoState={demoState} onClose={() => setPortalOpen(false)} />
        )}
      </AnimatePresence>

      {/* Background audio — muted until user clicks Start */}
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio ref={audioRef} src="/jazz.mp3" loop muted />
    </div>
  )
}
