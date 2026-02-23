'use client'

/**
 * /demo/preview-portal
 * Interactive demo client portal — mirrors the real portal experience exactly.
 * No auth, no DB. All data is hardcoded for demonstration.
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle2, Circle, ChevronDown, ChevronUp, Upload, ArrowLeft,
  Paperclip, FileText, Link2, KeyRound, ExternalLink,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import ContactCard from '@/components/portal/ContactCard'

// ─────────────────────────────────────────────────────────────────────────────
//  DEMO DATA
// ─────────────────────────────────────────────────────────────────────────────

const BRAND_COLOR = '#e63946'
const AGENCY_NAME = 'Studio Demo'
const CLIENT_NAME = 'You'
const PROJECT_TITLE = 'Acme Corp Rebrand 2026'
const DEADLINE = '27 February 2026'

interface DemoAsset {
  id: string
  title: string
  type: 'file' | 'text' | 'url'
  required: boolean
  formats: string[]
  instructions: string
  auditError: string
  auditDetail: string
  auditFix: string
  auditOkMsg: string
  badFile: string
  goodFile: string
}

const DEMO_ASSETS: DemoAsset[] = [
  {
    id: 'logo',
    title: 'Logo Files',
    type: 'file',
    required: true,
    formats: ['SVG', 'AI', 'EPS', 'PNG'],
    instructions: 'Vector format required. Must include all variations: primary, inverted, monochrome. Max 10 MB.',
    auditError: 'Image too low resolution for print',
    auditDetail: '72 DPI raster image found — 300 DPI minimum or vector format required.',
    auditFix: 'Upload a vector file (SVG or AI). Scalable, print-ready.',
    auditOkMsg: 'Vector SVG confirmed — scalable, print-ready, all brand variations included. ✅',
    badFile: 'logo_72dpi.jpg',
    goodFile: 'logo_final.svg',
  },
  {
    id: 'colors',
    title: 'Brand Color Palette',
    type: 'file',
    required: true,
    formats: ['PDF', 'PNG', 'ASE'],
    instructions: 'Include HEX, RGB, and CMYK values. Pantone equivalents if available.',
    auditError: 'Missing CMYK values',
    auditDetail: 'Provided palette only contains HEX codes — CMYK required for print production.',
    auditFix: 'Export from Adobe Color with all modes, or add a CMYK column to the PDF.',
    auditOkMsg: 'Palette contains HEX, RGB, CMYK — all 6 brand colors confirmed. ✅',
    badFile: 'brand_hex_only.png',
    goodFile: 'brand_palette_full.pdf',
  },
  {
    id: 'copy',
    title: 'Website Copy',
    type: 'file',
    required: true,
    formats: ['DOCX', 'PDF'],
    instructions: 'All page copy in a single document. Include headings, subheadings, and CTAs per section.',
    auditError: 'Missing homepage H1 copy',
    auditDetail: 'Document has 4 pages but no hero/H1 section detected for the homepage.',
    auditFix: 'Add a "Homepage Hero" section with headline, subheadline, and primary CTA text.',
    auditOkMsg: 'All 5 sections present — headings, body, and CTAs detected on every page. ✅',
    badFile: 'copy_draft_v1.docx',
    goodFile: 'website_copy_final.docx',
  },
  {
    id: 'domain',
    title: 'Domain Credentials',
    type: 'text',
    required: false,
    formats: [],
    instructions: 'Registrar login URL and access credentials, or DNS manager invite link.',
    auditError: '',
    auditDetail: '',
    auditFix: '',
    auditOkMsg: 'Text response saved — credentials stored securely. ✅',
    badFile: '',
    goodFile: '',
  },
]

// ─────────────────────────────────────────────────────────────────────────────
//  ASSET CARD
// ─────────────────────────────────────────────────────────────────────────────

type Phase = 'idle' | 'uploading' | 'scanning' | 'error' | 'success'

function AssetCard({
  asset,
  index,
  onComplete,
}: {
  asset: DemoAsset
  index: number
  onComplete: () => void
}) {
  const [open, setOpen] = useState(index === 0)
  const [phase, setPhase] = useState<Phase>('idle')
  const [textVal, setTextVal] = useState('')
  const [done, setDone] = useState(false)

  const Icon = asset.type === 'file' ? Paperclip : asset.type === 'url' ? Link2 : FileText

  function simulateUpload() {
    setPhase('uploading')
    setTimeout(() => setPhase('scanning'), 1500)
    setTimeout(() => {
      if (asset.auditError) {
        setPhase('error')
      } else {
        setPhase('success')
        setDone(true)
        onComplete()
      }
    }, 3200)
  }

  function simulateReupload() {
    setPhase('uploading')
    setTimeout(() => setPhase('scanning'), 1500)
    setTimeout(() => {
      setPhase('success')
      setDone(true)
      onComplete()
    }, 3200)
  }

  function submitText() {
    if (!textVal.trim()) return
    setPhase('scanning')
    setTimeout(() => {
      setPhase('success')
      setDone(true)
      onComplete()
    }, 1800)
  }

  return (
    <div
      className="border-2 overflow-hidden transition-all"
      style={{
        borderRadius: '20px 5px 20px 5px / 5px 20px 5px 20px',
        borderColor: done ? '#22c55e' : '#2d2d2d33',
        boxShadow: open ? '4px 4px 0 0 #2d2d2d' : '2px 2px 0 0 rgba(45,45,45,0.15)',
      }}
    >
      {/* Header */}
      <button
        type="button"
        className="w-full flex items-center gap-3 px-4 py-3 bg-paper text-left"
        onClick={() => setOpen(o => !o)}
      >
        <span className="flex-shrink-0">
          {done
            ? <CheckCircle2 size={18} className="text-green-500" />
            : <Circle size={18} className="text-ink/25" />}
        </span>
        <Icon size={15} className="text-ink/40 flex-shrink-0" />
        <span className="flex-1 font-body text-sm font-semibold text-ink">
          {asset.title}
        </span>
        {asset.formats.length > 0 && (
          <span className="hidden sm:block font-body text-xs text-ink/35 mr-1">
            {asset.formats.join(', ')}
          </span>
        )}
        {asset.required && !done && (
          <span
            className="font-body text-[10px] text-[#e63946] border border-[#e63946]/40 px-1.5 py-0.5 flex-shrink-0"
            style={{ borderRadius: '255px' }}
          >
            required
          </span>
        )}
        {done && (
          <span
            className="font-body text-[10px] text-green-700 border border-green-300 bg-green-50 px-1.5 py-0.5 flex-shrink-0"
            style={{ borderRadius: '255px' }}
          >
            submitted ✓
          </span>
        )}
        {open ? <ChevronUp size={14} className="text-ink/35 flex-shrink-0" /> : <ChevronDown size={14} className="text-ink/35 flex-shrink-0" />}
      </button>

      {/* Body */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.22 }}
            style={{ overflow: 'hidden' }}
          >
            <div className="px-4 pb-5 pt-1 border-t-2 border-dashed border-ink/10 bg-muted/20 flex flex-col gap-4">
              {asset.instructions && (
                <p className="font-body text-xs text-ink/55 italic">
                  &ldquo;{asset.instructions}&rdquo;
                </p>
              )}

              <AnimatePresence mode="wait">
                {/* Idle — show upload / text area */}
                {phase === 'idle' && asset.type === 'file' && (
                  <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div
                      className="border-[3px] border-dashed border-ink/20 p-8 flex flex-col items-center gap-3 mb-4"
                      style={{ borderRadius: '180px 45px 200px 35px / 40px 190px 30px 170px' }}
                    >
                      <Upload className="w-8 h-8 text-ink/20" />
                      <p className="font-body text-sm text-ink/40 text-center">
                        Drop files here or click to browse<br />
                        <span className="text-xs">
                          {asset.formats.length > 0
                            ? `Accepted: ${asset.formats.map(f => `.${f.toLowerCase()}`).join(', ')}`
                            : 'Any format accepted'}
                        </span>
                      </p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={simulateUpload}
                      className="w-full py-3 font-body text-sm font-bold text-paper flex items-center justify-center gap-2"
                      style={{
                        background: BRAND_COLOR,
                        borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px',
                        boxShadow: '3px 3px 0 0 #2d2d2d',
                      }}
                    >
                      <Upload size={15} /> Simulate Client Upload
                    </motion.button>
                  </motion.div>
                )}

                {phase === 'idle' && asset.type === 'text' && (
                  <motion.div key="idle-text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-3">
                    <textarea
                      rows={3}
                      value={textVal}
                      onChange={e => setTextVal(e.target.value)}
                      placeholder="Type your response here…"
                      className="w-full px-3 py-2 font-body text-sm text-ink bg-paper border-2 border-ink/30 outline-none focus:border-ink transition-all resize-none"
                      style={{ borderRadius: '12px 3px 12px 3px / 3px 12px 3px 12px' }}
                    />
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={submitText}
                      disabled={!textVal.trim()}
                      className="w-full py-3 font-body text-sm font-bold text-paper flex items-center justify-center gap-2 disabled:opacity-40"
                      style={{
                        background: BRAND_COLOR,
                        borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px',
                        boxShadow: '3px 3px 0 0 #2d2d2d',
                      }}
                    >
                      Submit Response
                    </motion.button>
                  </motion.div>
                )}

                {/* Uploading */}
                {phase === 'uploading' && (
                  <motion.div key="uploading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="flex flex-col items-center gap-3 py-8"
                  >
                    <motion.div
                      className="w-12 h-12 border-[3px] border-ink border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
                    />
                    <p className="font-body text-sm font-semibold text-ink">Uploading…</p>
                    <p className="font-body text-xs text-ink/40">{asset.badFile || 'file.dat'}</p>
                  </motion.div>
                )}

                {/* AI Scanning */}
                {phase === 'scanning' && (
                  <motion.div key="scanning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="flex flex-col items-center gap-3 py-8"
                  >
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}>
                      <Image src="/meta-llama.png" alt="AI" width={44} height={44} />
                    </motion.div>
                    <p className="font-body text-sm font-semibold text-ink">Llama 3.3 Auditing…</p>
                    <p className="font-body text-xs text-ink/40 text-center">Checking format, quality &amp; requirements</p>
                    <div className="flex gap-1.5 mt-1">
                      {[0, 1, 2, 3, 4].map(i => (
                        <motion.div key={i} className="w-1.5 h-1.5 bg-ink rounded-full"
                          animate={{ opacity: [0.1, 1, 0.1], y: [0, -4, 0] }}
                          transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Audit Error phase */}
                {phase === 'error' && (
                  <motion.div key="error" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-3">
                    <div
                      className="border-[3px] border-red-400 bg-red-50 px-4 py-3"
                      style={{ borderRadius: '12px 3px 12px 3px / 3px 12px 3px 12px' }}
                    >
                      <p className="font-body text-sm font-bold text-red-700">⚠️ {asset.auditError}</p>
                      <p className="font-body text-xs text-red-500 mt-0.5">{asset.auditDetail}</p>
                    </div>
                    <div
                      className="border-2 border-amber-300 bg-amber-50 px-4 py-3"
                      style={{ borderRadius: '12px 3px 12px 3px / 3px 12px 3px 12px' }}
                    >
                      <p className="font-body text-xs text-amber-800">
                        <strong>🤖 Llama 3.3 suggests:</strong> {asset.auditFix}
                      </p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={simulateReupload}
                      className="w-full py-3 font-body text-sm font-bold text-paper flex items-center justify-center gap-2"
                      style={{
                        background: '#2d2d2d',
                        borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px',
                        boxShadow: '3px 3px 0 0 #e63946',
                      }}
                    >
                      <Upload size={15} /> Re-upload Fixed File ({asset.goodFile})
                    </motion.button>
                  </motion.div>
                )}

                {/* Success */}
                {phase === 'success' && (
                  <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-3 py-6"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 280 }}
                    >
                      <CheckCircle2 className="w-14 h-14 text-green-500" />
                    </motion.div>
                    <p className="font-body text-sm font-bold text-green-700 text-center">{asset.auditOkMsg}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function DemoPreviewPortal() {
  const [submitted, setSubmitted] = useState<Set<string>>(new Set())
  const [showContact, setShowContact] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setShowContact(true), 5000)
    return () => clearTimeout(t)
  }, [])

  const total = DEMO_ASSETS.length
  const done = submitted.size
  const pct = total > 0 ? Math.round((done / total) * 100) : 0
  const isDone = done === total

  function markDone(id: string) {
    setSubmitted(prev => new Set([...Array.from(prev), id]))
  }

  const progressColor = isDone ? '#22c55e' : BRAND_COLOR

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF7]">

      {/* ── Sticky Header ──────────────────────────────────────── */}
      <header
        className="sticky top-0 z-30 flex items-center justify-between px-5 py-3 border-b-2 border-ink/10"
        style={{ background: 'rgba(253,251,247,0.96)', backdropFilter: 'blur(8px)' }}
      >
        <span className="font-heading text-xl text-ink">
          Fetch<span style={{ color: BRAND_COLOR }}>Asset</span>
        </span>

        {/* Progress pill */}
        <div
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 border-2 border-ink/15"
          style={{ borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px' }}
        >
          <div className="w-2 h-2 rounded-full" style={{ background: isDone ? '#22c55e' : BRAND_COLOR }} />
          <span className="font-body text-xs font-bold text-ink">
            {isDone ? 'Complete 🎉' : `${pct}% · ${total - done} to go`}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-body text-xs text-ink/35">🔒 Secure</span>
          <span
            className="font-body text-[10px] text-amber-700 bg-amber-50 border border-amber-300 px-2 py-0.5"
            style={{ borderRadius: '255px' }}
          >
            Demo Mode
          </span>
        </div>
      </header>

      {/* ── Main ───────────────────────────────────────────────── */}
      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-8 md:px-6 flex flex-col gap-7">

        {/* Back link */}
        <Link
          href="/"
          className="font-body text-sm text-ink/45 hover:text-ink transition-colors flex items-center gap-1 w-fit"
        >
          <ArrowLeft size={14} /> Back to homepage
        </Link>

        {/* Greeting card */}
        <div
          className="p-6 border-2 border-ink/20 bg-[#fffde7]"
          style={{
            borderRadius: '180px 45px 200px 35px / 40px 190px 30px 170px',
            boxShadow: '4px 4px 0px 0px #2d2d2d',
            transform: 'rotate(-0.5deg)',
          }}
        >
          <p className="font-body text-xs text-ink/50 uppercase tracking-wider mb-1">
            Asset Collection Portal
          </p>
          <h1 className="font-heading text-3xl text-ink leading-tight">
            {PROJECT_TITLE}
          </h1>
          <p className="font-body text-sm text-ink/65 mt-1">
            Hey, {CLIENT_NAME}! 👋
          </p>
          <p className="font-body text-sm text-ink/70 mt-3 flex items-center gap-1.5">
            📅 <strong>Deadline:</strong>&nbsp;{DEADLINE}
          </p>
        </div>

        {/* Progress bar */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span className="font-body text-sm text-ink/60">
              {done} of {total} asset{total !== 1 ? 's' : ''} submitted
            </span>
            <span className="font-body text-sm font-bold text-ink">{pct}%</span>
          </div>
          <div
            className="h-4 w-full bg-muted overflow-hidden"
            style={{ borderRadius: '12px 2px 12px 2px / 2px 12px 2px 12px', boxShadow: '2px 2px 0px #2d2d2d' }}
          >
            <motion.div
              animate={{ width: `${pct}%`, backgroundColor: progressColor }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="h-full relative"
              style={{ borderRadius: '12px 2px 12px 2px / 2px 12px 2px 12px' }}
            >
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(255,255,255,0.5) 4px, rgba(255,255,255,0.5) 5px)',
                }}
              />
            </motion.div>
          </div>
          <AnimatePresence>
            {pct > 0 && (
              <motion.p
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-body text-sm text-center"
                style={{ color: isDone ? '#16a34a' : pct >= 60 ? '#b45309' : '#6b7280' }}
              >
                {isDone
                  ? '🎉 All done! You\'re amazing — thank you!'
                  : pct >= 60
                  ? `${pct}% — Almost there! Just a little more 💪`
                  : `${pct}% — Great start! Keep going ✨`}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Explainer banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-start gap-3 px-4 py-3 border-2 border-ink/15 bg-[#f0fdf4]"
          style={{ borderRadius: '180px 45px 200px 35px / 40px 190px 30px 170px' }}
        >
          <Image src="/meta-llama.png" alt="AI" width={22} height={22} className="flex-shrink-0 mt-0.5" />
          <p className="font-body text-xs text-ink/70 leading-relaxed">
            <strong>This is what your client sees.</strong> Each asset has an upload area. After uploading, <strong>Llama 3.3 automatically audits</strong> the file for format, quality, and completeness — instantly catching issues your client needs to fix.
          </p>
        </motion.div>

        {/* Asset list */}
        <div className="flex flex-col gap-4">
          {DEMO_ASSETS.map((asset, i) => (
            <motion.div
              key={asset.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08 }}
            >
              <AssetCard
                asset={asset}
                index={i}
                onComplete={() => markDone(asset.id)}
              />
            </motion.div>
          ))}
        </div>

        {/* All done celebration */}
        <AnimatePresence>
          {isDone && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-6 border-[3px] border-green-400 bg-green-50 flex flex-col items-center gap-3 text-center"
              style={{ borderRadius: '180px 45px 200px 35px / 40px 190px 30px 170px', boxShadow: '4px 4px 0 0 #16a34a' }}
            >
              <span className="text-4xl">🎉</span>
              <p className="font-heading text-2xl text-green-800">All Assets Submitted!</p>
              <p className="font-body text-sm text-green-700">
                Your agency gets an instant notification, and all files are organized automatically.
              </p>
              <Link
                href="/login"
                className="mt-2 px-6 py-3 font-body text-sm font-bold text-paper inline-flex items-center gap-2"
                style={{
                  background: '#16a34a',
                  borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px',
                  boxShadow: '3px 3px 0 0 #2d2d2d',
                }}
              >
                🚀 Get this for your own clients — start free <ExternalLink size={14} />
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CTA — shown only before completion; targets freelancers trying the demo as a client */}
        {!isDone && (
          <div
            className="flex items-center justify-between gap-3 px-4 py-3 bg-[#fffde7] border-2 border-ink/15"
            style={{ borderRadius: '180px 45px 200px 35px / 40px 190px 30px 170px' }}
          >
            <p className="font-body text-xs text-ink/50">
              💡 <strong className="text-ink">Are you a freelancer?</strong> This is what your clients would see.
            </p>
            <Link
              href="/login"
              className="flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 font-body text-xs font-bold text-paper"
              style={{
                background: BRAND_COLOR,
                borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px',
                boxShadow: '2px 2px 0 0 #2d2d2d',
              }}
            >
              Get FetchAsset free <ExternalLink size={11} />
            </Link>
          </div>
        )}
      </main>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="py-5 text-center border-t-2 border-ink/10">
        <p className="font-body text-xs text-ink/30">
          Powered by{' '}
          <a href="https://fetchasset.com" className="hover:text-ink/60 transition-colors">FetchAsset</a>
          {' '}· Files are encrypted in transit and at rest. 🔒
        </p>
      </footer>

      {/* ── Floating Contact Card ───────────────────────────────── */}
      <AnimatePresence>
        {showContact && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-6 right-5 z-50"
          >
            <div
              className="bg-[#fffde7] border-[3px] border-ink px-4 py-3 flex flex-col gap-2 max-w-[220px]"
              style={{
                borderRadius: '220px 30px 240px 20px / 25px 230px 20px 215px',
                boxShadow: '4px 4px 0 0 #2d2d2d',
              }}
            >
              <p className="font-body text-xs text-ink font-semibold">Got a question? 💬</p>
              <p className="font-body text-[10px] text-ink/55">Reach {AGENCY_NAME} directly</p>
              <a
                href={`mailto:demo@studio.com?subject=Question about ${PROJECT_TITLE}`}
                className="font-body text-xs font-bold text-paper text-center py-1.5 px-3"
                style={{
                  background: BRAND_COLOR,
                  borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px',
                  boxShadow: '2px 2px 0 0 #2d2d2d',
                }}
              >
                ✉️ Email Us
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
