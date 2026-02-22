'use client'

/**
 * FetchAsset — Interactive Demo Overlay
 * 5-step guided walkthrough of the product (no signup required).
 */

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Volume2,
  VolumeX,
  Zap,
  Check,
  Upload,
  AlertTriangle,
  ArrowRight,
  CheckCircle,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import {
  WobblyButton,
  WobblyCard,
  WobblyCardContent,
  WobblyCardHeader,
  WobblyCardTitle,
  WobblyCardDescription,
} from '@/components/ui'

const TOTAL_STEPS = 5

// ─── Shared step wrapper ───────────────────────────────────────────────────
const stepVariants = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
  exit:    { opacity: 0, y: -18, transition: { duration: 0.25, ease: 'easeIn' as const } },
}

// ─── Wobbly Tooltip ────────────────────────────────────────────────────────
function WobblyTooltip({ children, delay = 0.4 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ scale: 0.75, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay, type: 'spring', stiffness: 220, damping: 16 }}
      className="pointer-events-none"
    >
      <div
        className="bg-[#fffde7] border-[3px] border-ink px-3 py-2 font-body text-xs text-ink text-center leading-snug"
        style={{
          borderRadius: '180px 45px 200px 35px / 40px 190px 30px 170px',
          boxShadow: '3px 3px 0 0 #2d2d2d',
        }}
      >
        {children}
      </div>
      {/* Arrow pointing down */}
      <div className="flex justify-center" style={{ marginTop: '-2px' }}>
        <div
          className="w-3 h-3 bg-[#fffde7] border-r-[3px] border-b-[3px] border-ink rotate-45"
          style={{ marginTop: '-6px' }}
        />
      </div>
    </motion.div>
  )
}

// ─── STEP 0: Agency Dashboard ─────────────────────────────────────────────
function Step0Dashboard({ onNext }: { onNext: () => void }) {
  return (
    <motion.div
      variants={stepVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full max-w-3xl"
    >
      <div className="text-center mb-8">
        <span className="font-body text-xs uppercase tracking-widest text-ink/40">Step 1 of 5 — Agency Dashboard</span>
        <h2 className="font-heading text-4xl md:text-5xl text-ink mt-2">Your Agency HQ</h2>
        <p className="font-body text-ink/50 mt-2">All your client projects, in one place.</p>
      </div>

      {/* Mock dashboard window */}
      <div
        className="border-[3px] border-ink overflow-hidden"
        style={{ borderRadius: '12px 3px 12px 3px / 3px 12px 3px 12px', boxShadow: '5px 5px 0 0 #2d2d2d' }}
      >
        {/* Title bar */}
        <div className="bg-ink text-paper px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="" width={20} height={20} className="opacity-80" />
            <span className="font-heading text-base">Dashboard</span>
            <span className="font-body text-xs opacity-40">3 Active Projects</span>
          </div>
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-2.5 h-2.5 rounded-full bg-paper/25" />
            ))}
          </div>
        </div>

        {/* Project grid */}
        <div className="bg-[#FAFAF7] p-5 grid sm:grid-cols-3 gap-4">
          {[
            { client: 'Acme Corp', status: 'In Progress', pct: 60 },
            { client: 'Nike Rebrand', status: 'Waiting on client', pct: 20 },
          ].map((p) => (
            <div
              key={p.client}
              className="border-2 border-ink/25 p-4 bg-paper"
              style={{ borderRadius: '180px 45px 200px 35px / 40px 190px 30px 170px' }}
            >
              <p className="font-heading text-base text-ink mb-0.5">{p.client}</p>
              <p className="font-body text-xs text-ink/45 mb-3">{p.status}</p>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden border border-ink/15">
                <div className="h-full bg-ink/60 rounded-full" style={{ width: `${p.pct}%` }} />
              </div>
            </div>
          ))}

          {/* New Project — clickable with tooltip */}
          <div className="relative flex flex-col items-center justify-end gap-2">
            <div className="w-full">
              <WobblyTooltip delay={0.5}>
                ✏️ First, let&apos;s create a project. <strong>Click here!</strong>
              </WobblyTooltip>
            </div>
            <button
              onClick={onNext}
              className="w-full min-h-[80px] border-[3px] border-dashed border-ink/40 flex flex-col items-center justify-center gap-1.5 font-body text-ink/50 hover:border-ink hover:text-ink hover:bg-muted transition-all cursor-pointer bg-paper"
              style={{ borderRadius: '180px 45px 200px 35px / 40px 190px 30px 170px' }}
            >
              <span className="text-3xl leading-none font-heading">+</span>
              <span className="text-sm">New Project</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ─── STEP 1: AI Request + Magic Link ──────────────────────────────────────
function Step1MagicLink({ aiItems, onNext }: { aiItems: string[]; onNext: () => void }) {
  const allDone = aiItems.length >= 5
  return (
    <motion.div
      variants={stepVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full max-w-xl"
    >
      <div className="text-center mb-8">
        <span className="font-body text-xs uppercase tracking-widest text-ink/40">Step 2 of 5 — AI Request Generator</span>
        <h2 className="font-heading text-4xl md:text-5xl text-ink mt-2">AI builds your checklist</h2>
        <p className="font-body text-ink/50 mt-2">Describe the project — Llama 3.3 generates the exact files you need.</p>
      </div>

      <WobblyCard flavor="postit" decoration="tack" rotate="-0.5" shadow="lg">
        <WobblyCardHeader>
          <div className="flex items-center gap-2">
            <Image src="/meta-llama.png" alt="AI" width={18} height={18} />
            <WobblyCardDescription>Generating checklist for &ldquo;Acme Corp Web Redesign&rdquo;…</WobblyCardDescription>
          </div>
        </WobblyCardHeader>
        <WobblyCardContent>
          <div className="flex flex-col gap-2 min-h-[160px]">
            <AnimatePresence>
              {aiItems.map((item) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 font-body text-sm border-b border-ink/10 pb-1.5"
                >
                  <Check size={13} strokeWidth={3} className="text-green-600 flex-shrink-0" />
                  {item}
                </motion.div>
              ))}
            </AnimatePresence>
            {!allDone && (
              <motion.div
                className="flex gap-1 mt-2"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                {[0, 1, 2].map((i) => (
                  <div key={i} className="w-1.5 h-1.5 bg-ink/40 rounded-full" />
                ))}
              </motion.div>
            )}
          </div>

          {allDone && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-5 pt-4 border-t-2 border-dashed border-ink/20"
            >
              <div className="relative mb-12">
                <div className="absolute -top-14 left-0 right-0 flex justify-center">
                  <WobblyTooltip delay={0.2}>
                    No passwords needed. Your client gets a &apos;Magic Link&apos; to this portal.
                  </WobblyTooltip>
                </div>
                <WobblyButton size="md" className="w-full gap-2" onClick={onNext}>
                  📬 Send Magic Link to Client
                  <ArrowRight size={15} strokeWidth={3} />
                </WobblyButton>
              </div>
            </motion.div>
          )}
        </WobblyCardContent>
      </WobblyCard>
    </motion.div>
  )
}

// ─── STEP 2: Client Portal View ───────────────────────────────────────────
function Step2ClientView({ fileDropped, onNext }: { fileDropped: boolean; onNext: () => void }) {
  return (
    <motion.div
      variants={stepVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full max-w-xl"
    >
      <div className="text-center mb-8">
        <span className="font-body text-xs uppercase tracking-widest text-ink/40">Step 3 of 5 — Client Portal</span>
        <h2 className="font-heading text-4xl md:text-5xl text-ink mt-2">What your client sees</h2>
        <p className="font-body text-ink/50 mt-2">👆 No login. No app install. Just a magic link.</p>
      </div>

      <WobblyCard flavor="default" decoration="tape" rotate="0.5" shadow="lg">
        <WobblyCardHeader>
          <WobblyCardTitle className="text-xl">Upload: Logo files (SVG/PNG)</WobblyCardTitle>
          <WobblyCardDescription>Acme Corp Web Redesign — Asset 1 of 5</WobblyCardDescription>
        </WobblyCardHeader>
        <WobblyCardContent>
          {/* Drop zone */}
          <motion.div
            animate={
              fileDropped
                ? { backgroundColor: '#f0fdf4', borderColor: '#22c55e' }
                : { backgroundColor: 'transparent', borderColor: 'rgba(45,45,45,0.3)' }
            }
            className="border-[3px] border-dashed p-10 flex flex-col items-center justify-center gap-3 relative overflow-hidden min-h-[180px]"
            style={{ borderRadius: '180px 45px 200px 35px / 40px 190px 30px 170px' }}
          >
            {!fileDropped ? (
              <>
                <Upload className="w-10 h-10 text-ink/25" />
                <p className="font-body text-ink/45 text-sm text-center">Drop files here or click to browse</p>

                {/* Animated file flying in */}
                <motion.div
                  initial={{ x: 180, y: -50, opacity: 0, rotate: 18 }}
                  animate={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
                  transition={{ delay: 0.5, duration: 1.1, type: 'spring', stiffness: 70, damping: 12 }}
                  className="absolute"
                >
                  <div
                    className="bg-blue-50 border-2 border-ink px-4 py-2 font-body text-xs text-ink flex items-center gap-2"
                    style={{
                      borderRadius: '180px 45px 200px 35px / 40px 190px 30px 170px',
                      boxShadow: '2px 2px 0 0 #2d2d2d',
                    }}
                  >
                    📄 acme_logo_v3.png
                  </div>
                </motion.div>
              </>
            ) : (
              <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 250 }}
                className="flex flex-col items-center gap-2"
              >
                <CheckCircle className="w-14 h-14 text-green-500" strokeWidth={2} />
                <p className="font-heading text-2xl text-green-700">File uploaded!</p>
                <p className="font-body text-xs text-ink/45">acme_logo_v3.png &nbsp;·&nbsp; 2.4 MB</p>
              </motion.div>
            )}
          </motion.div>

          {fileDropped && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-5"
            >
              <WobblyButton size="md" className="w-full gap-2" onClick={onNext}>
                AI is now reviewing this file →
              </WobblyButton>
            </motion.div>
          )}
        </WobblyCardContent>
      </WobblyCard>
    </motion.div>
  )
}

// ─── STEP 3: AI Audit Wow Moment ──────────────────────────────────────────
function Step3AiAudit({ scanComplete, onNext }: { scanComplete: boolean; onNext: () => void }) {
  return (
    <motion.div
      variants={stepVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full max-w-xl"
    >
      <div className="text-center mb-8">
        <span className="font-body text-xs uppercase tracking-widest text-ink/40">Step 4 of 5 — AI Audit</span>
        <h2 className="font-heading text-4xl md:text-5xl text-ink mt-2">Llama 3.3 is on it</h2>
        <p className="font-body text-ink/50 mt-2">Every file reviewed the moment it arrives.</p>
      </div>

      <WobblyCard flavor="postit" decoration="tack" rotate="-1" shadow="lg">
        <WobblyCardContent>
          {!scanComplete ? (
            <div className="flex flex-col items-center gap-6 py-10">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
              >
                <Image src="/meta-llama.png" alt="AI scanning" width={52} height={52} />
              </motion.div>
              <div className="text-center">
                <p className="font-heading text-2xl text-ink">Scanning with Llama 3.3…</p>
                <div className="flex justify-center gap-1.5 mt-3">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 bg-ink rounded-full"
                      animate={{ opacity: [0.15, 1, 0.15] }}
                      transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.25 }}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col gap-4"
            >
              {/* Error header */}
              <div className="flex items-center gap-3 mb-1">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
                  className="w-11 h-11 bg-red-500 text-paper flex items-center justify-center flex-shrink-0"
                  style={{ borderRadius: '50%' }}
                >
                  <Zap size={20} strokeWidth={2.5} fill="currentColor" />
                </motion.div>
                <div>
                  <p className="font-heading text-lg text-red-600">Issue Detected</p>
                  <p className="font-body text-xs text-ink/45">acme_logo_v3.png</p>
                </div>
              </div>

              {/* Error card */}
              <motion.div
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="border-[3px] border-red-400 bg-red-50 px-4 py-3"
                style={{ borderRadius: '180px 45px 200px 35px / 40px 190px 30px 170px' }}
              >
                <div className="flex items-start gap-2">
                  <AlertTriangle size={15} className="text-red-500 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                  <div>
                    <p className="font-body text-sm font-bold text-red-700">
                      Error: This image is too low resolution for print
                    </p>
                    <p className="font-body text-xs text-red-400 mt-0.5">
                      Found: 72 DPI &nbsp;·&nbsp; Required: 300 DPI minimum
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* AI suggestion */}
              <motion.div
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.35 }}
                className="border-2 border-ink/15 bg-white/70 px-4 py-3"
                style={{ borderRadius: '180px 45px 200px 35px / 40px 190px 30px 170px' }}
              >
                <p className="font-body text-xs text-ink/60">
                  💡 <strong>AI Suggestion:</strong> Ask client to export from Illustrator at 300+ DPI, or
                  provide the original vector file (AI/EPS/SVG).
                </p>
              </motion.div>

              <p className="font-body text-xs text-ink/35 text-center italic">
                Our AI checks every file so you don&apos;t have to.
              </p>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <WobblyButton size="md" className="w-full mt-1 gap-2" onClick={onNext}>
                  See what comes next →
                </WobblyButton>
              </motion.div>
            </motion.div>
          )}
        </WobblyCardContent>
      </WobblyCard>
    </motion.div>
  )
}

// ─── STEP 4: Conversion ───────────────────────────────────────────────────
function Step4Conversion() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.4 } }}
      exit={{ opacity: 0, y: -18 }}
      className="w-full max-w-lg text-center"
    >
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15, type: 'spring', stiffness: 140 }}
        className="flex justify-center mb-4"
      >
        <div className="animate-float-slow">
          <Image
            src="/paperclip1.png"
            alt="FetchAsset Mascot"
            width={170}
            height={170}
            style={{ mixBlendMode: 'multiply' }}
          />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <h2 className="font-heading text-5xl md:text-6xl text-ink mb-3">🎉 That&apos;s the magic!</h2>
        <p className="font-body text-xl text-ink/60 mb-8 max-w-sm mx-auto leading-snug">
          Collect client assets in minutes, not days. AI catches problems before they cost you.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/login">
            <WobblyButton size="xl" className="gap-3">
              Start Your Real Project Now
              <ArrowRight strokeWidth={3} className="w-5 h-5" />
            </WobblyButton>
          </Link>
          <Link href="/">
            <WobblyButton variant="secondary" size="lg">
              Back to Home
            </WobblyButton>
          </Link>
        </div>

        <p className="font-body text-sm text-ink/35 mt-5">
          Free forever &nbsp;·&nbsp; No credit card &nbsp;·&nbsp; Ready in 2 minutes
        </p>
      </motion.div>
    </motion.div>
  )
}

// ─── Main Overlay Component ───────────────────────────────────────────────
export default function DemoOverlay() {
  const [step, setStep] = useState(0)
  const [muted, setMuted] = useState(false)
  const [aiItems, setAiItems] = useState<string[]>([])
  const [fileDropped, setFileDropped] = useState(false)
  const [scanComplete, setScanComplete] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  // Step-specific side-effects
  useEffect(() => {
    if (step === 1) {
      const items = [
        'Logo files (SVG, PNG)',
        'Brand color palette (PDF)',
        'Website copy document (DOCX)',
        'Contract / NDA (signed)',
        'Domain & hosting credentials',
      ]
      setAiItems([])
      items.forEach((item, i) => {
        setTimeout(() => setAiItems((prev) => [...prev, item]), 350 + i * 480)
      })
    }
    if (step === 2) {
      setFileDropped(false)
      setTimeout(() => setFileDropped(true), 1600)
    }
    if (step === 3) {
      setScanComplete(false)
      setTimeout(() => setScanComplete(true), 2600)
    }
  }, [step])

  const next = useCallback(() => setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1)), [])
  const prev = useCallback(() => setStep((s) => Math.max(s - 1, 0)), [])

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !muted
      setMuted((m) => !m)
    }
  }

  return (
    <div className="fixed inset-0 z-[200] bg-paper flex flex-col overflow-hidden">
      {/* Background texture dots */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(circle, #2d2d2d 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* === TOP BAR === */}
      <div className="relative z-10 bg-paper/95 backdrop-blur-sm border-b-[3px] border-dashed border-muted flex items-center justify-between px-5 py-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="FetchAsset" width={28} height={28} />
          <span className="font-heading text-xl text-ink">FetchAsset</span>
          <span
            className="font-body text-[10px] text-ink/40 ml-1 px-2 py-0.5 bg-muted border border-ink/15"
            style={{ borderRadius: '20px' }}
          >
            Interactive Demo
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Mute toggle */}
          <button
            onClick={toggleMute}
            className="border-2 border-ink px-3 py-1.5 font-body text-xs flex items-center gap-1.5 hover:bg-muted transition-colors active:translate-y-px"
            style={{
              borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px',
              boxShadow: '2px 2px 0 0 #2d2d2d',
            }}
          >
            {muted ? <VolumeX size={13} /> : <Volume2 size={13} />}
            <span className="hidden sm:inline">{muted ? 'Unmute' : 'Mute'}</span>
          </button>
          {/* Exit */}
          <Link href="/">
            <button
              className="border-2 border-ink px-3 py-1.5 font-body text-xs flex items-center gap-1.5 hover:bg-muted transition-colors active:translate-y-px"
              style={{
                borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px',
                boxShadow: '2px 2px 0 0 #2d2d2d',
              }}
            >
              <X size={13} />
              <span className="hidden sm:inline">Exit Demo</span>
            </button>
          </Link>
        </div>
      </div>

      {/* === PROGRESS DOTS === */}
      <div className="relative z-10 flex items-center justify-center gap-2.5 py-3 flex-shrink-0">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <motion.div
            key={i}
            animate={{
              width: i === step ? 28 : 10,
              backgroundColor: i <= step ? '#2d2d2d' : '#e5e3dc',
            }}
            transition={{ duration: 0.3 }}
            className="h-2.5 border-2 border-ink"
            style={{ borderRadius: '255px', minWidth: 10 }}
          />
        ))}
        <span className="font-body text-xs text-ink/30 ml-2">
          {step + 1}/{TOTAL_STEPS}
        </span>
      </div>

      {/* === STEP CONTENT === */}
      <div className="relative z-10 flex-1 overflow-y-auto flex items-center justify-center p-5 md:p-8">
        <AnimatePresence mode="wait">
          {step === 0 && <Step0Dashboard key="s0" onNext={next} />}
          {step === 1 && <Step1MagicLink key="s1" aiItems={aiItems} onNext={next} />}
          {step === 2 && <Step2ClientView key="s2" fileDropped={fileDropped} onNext={next} />}
          {step === 3 && <Step3AiAudit key="s3" scanComplete={scanComplete} onNext={next} />}
          {step === 4 && <Step4Conversion key="s4" />}
        </AnimatePresence>
      </div>

      {/* === BOTTOM NAV (skip/back) — hidden on final step === */}
      {step < TOTAL_STEPS - 1 && (
        <div className="relative z-10 bg-paper/95 backdrop-blur-sm border-t-[3px] border-dashed border-muted flex items-center justify-between px-6 py-3 flex-shrink-0">
          <button
            onClick={prev}
            disabled={step === 0}
            className="font-body text-sm text-ink/35 hover:text-ink disabled:opacity-0 transition-colors"
          >
            ← Back
          </button>
          <div className="flex gap-1">
            {Array.from({ length: TOTAL_STEPS - 1 }).map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full border border-ink/30 ${i < step ? 'bg-ink/50' : i === step ? 'bg-ink' : 'bg-paper'}`}
              />
            ))}
          </div>
          <button
            onClick={next}
            className="font-body text-sm text-ink/45 hover:text-ink transition-colors"
          >
            Skip →
          </button>
        </div>
      )}

      {/* Audio (autoplay on mount — starts because user clicked the demo button) */}
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio ref={audioRef} src="/jazz.mp3" autoPlay loop muted={false} />
    </div>
  )
}
