/**
 * ThreeStepMagic — Horizontal 3-column "How It Works" with hand-drawn SVG icons,
 * Framer Motion scroll animations, and the Paperclip Mascot peeking from column 2.
 */
'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { WobblyCard } from '@/components/ui'

// ── Inline SVG icons (hand-drawn feel via irregular strokes) ─────────────────

function IconAI() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      {/* Robot head */}
      <rect x="10" y="14" width="28" height="22" rx="5" ry="6"
        stroke="#2d2d2d" strokeWidth="2.8" fill="#fffde7" strokeLinejoin="round" />
      {/* Eyes */}
      <circle cx="19" cy="24" r="3.5" fill="#2d2d2d" />
      <circle cx="29" cy="24" r="3.5" fill="#2d2d2d" />
      <circle cx="20.2" cy="22.8" r="1.1" fill="white" />
      <circle cx="30.2" cy="22.8" r="1.1" fill="white" />
      {/* Antenna */}
      <line x1="24" y1="14" x2="24" y2="7" stroke="#2d2d2d" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="24" cy="6" r="2.5" fill="#2d2d2d" />
      {/* Mouth */}
      <path d="M18 30 Q24 34 30 30" stroke="#2d2d2d" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      {/* Sparkles */}
      <path d="M6 10 L7.5 7 L9 10 L7.5 11.5Z" fill="#2d2d2d" opacity="0.5" />
      <path d="M39 8 L40 6 L41 8 L40 9Z" fill="#2d2d2d" opacity="0.4" />
      <path d="M42 20 L43.5 18 L45 20 L43.5 21Z" fill="#2d2d2d" opacity="0.35" />
    </svg>
  )
}

function IconMagicLink() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      {/* Envelope body */}
      <rect x="5" y="13" width="38" height="26" rx="4" ry="5"
        stroke="#2d2d2d" strokeWidth="2.8" fill="#e8f4fd" strokeLinejoin="round" />
      {/* Envelope flap */}
      <path d="M5 16 L24 28 L43 16" stroke="#2d2d2d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* Magic lightning bolt badge */}
      <circle cx="37" cy="12" r="8.5" fill="#fffde7" stroke="#2d2d2d" strokeWidth="2.2" />
      <path d="M39 6 L35.5 12.5 L38.5 12.5 L36 18 L41.5 11 L38 11Z" fill="#2d2d2d" />
    </svg>
  )
}

function IconAudit() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      {/* Document */}
      <rect x="9" y="5" width="24" height="32" rx="3" ry="4"
        stroke="#2d2d2d" strokeWidth="2.8" fill="#f5f5f5" strokeLinejoin="round" />
      {/* Folded corner */}
      <path d="M25 5 L33 13 L25 13 Z" fill="#ddd" stroke="#2d2d2d" strokeWidth="1.8" strokeLinejoin="round" />
      {/* Lines */}
      <line x1="14" y1="20" x2="27" y2="20" stroke="#2d2d2d" strokeWidth="2" strokeLinecap="round" />
      <line x1="14" y1="25" x2="24" y2="25" stroke="#2d2d2d" strokeWidth="2" strokeLinecap="round" />
      <line x1="14" y1="30" x2="21" y2="30" stroke="#2d2d2d" strokeWidth="2" strokeLinecap="round" />
      {/* Magnifying glass */}
      <circle cx="36" cy="37" r="8.5" fill="white" stroke="#2d2d2d" strokeWidth="2.8" />
      <circle cx="36" cy="37" r="4.5" fill="#e8f4fd" stroke="#2d2d2d" strokeWidth="2" />
      <line x1="43" y1="43" x2="46" y2="46.5" stroke="#2d2d2d" strokeWidth="3" strokeLinecap="round" />
      {/* Tick inside lens */}
      <path d="M33.5 37 L35.5 39 L39 35" stroke="#22c55e" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  )
}

function IconLock() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      {/* Shackle */}
      <path d="M15 22 V16 C15 9 33 9 33 16 V22" stroke="#2d2d2d" strokeWidth="2.8" strokeLinecap="round" fill="none" />
      {/* Body */}
      <rect x="9" y="21" width="30" height="22" rx="4" ry="5"
        stroke="#2d2d2d" strokeWidth="2.8" fill="#fffde7" strokeLinejoin="round" />
      {/* Keyhole */}
      <circle cx="24" cy="30" r="3.8" fill="#2d2d2d" />
      <rect x="22.2" y="30" width="3.6" height="5.5" rx="1" fill="#2d2d2d" />
      {/* Shield sparkle */}
      <path d="M39 10 L40 8 L41 10 L40 11Z" fill="#2d2d2d" opacity="0.45" />
      <path d="M7 15 L8 13 L9 15 L8 16Z" fill="#2d2d2d" opacity="0.35" />
    </svg>
  )
}

// ── Steps data ───────────────────────────────────────────────────────────────

const STEPS = [
  {
    num: '1',
    icon: <IconAI />,
    title: 'AI Drafts the List',
    desc: 'Describe your project. Llama 3.3 generates the exact files, formats, and specs your client needs to send. No guessing.',
    tag: 'Llama 3.3 powered',
    rotate: '-1' as const,
    flavor: 'default' as const,
    decoration: 'tape' as const,
  },
  {
    num: '2',
    icon: <IconMagicLink />,
    title: 'Send Magic Link',
    desc: 'One link. Zero friction. Your client opens it in any browser — no account, no app install, no passwords ever.',
    tag: 'Zero-friction for clients',
    rotate: '1' as const,
    flavor: 'postit' as const,
    decoration: 'tack' as const,
    hasMascot: true,
  },
  {
    num: '3',
    icon: <IconAudit />,
    title: 'AI Audits & Organizes',
    desc: 'Every file is validated the moment it arrives. Auto-renaming, resolution checks, format validation — done before you even look.',
    tag: 'Auto-organised & checked',
    rotate: '-0.5' as const,
    flavor: 'default' as const,
    decoration: 'tape' as const,
  },
]

// ── Component ────────────────────────────────────────────────────────────────

export default function ThreeStepMagic() {
  return (
    <section id="how" className="max-w-5xl mx-auto px-4 sm:px-6 py-16 md:py-28">

      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.5, ease: 'easeOut' as const }}
        className="text-center mb-10 md:mb-16"
      >
        <span className="tag-label">Dead simple</span>
        <h2 className="font-heading text-3xl sm:text-5xl md:text-6xl text-ink mt-4 leading-tight">
          The 3-Step Magic
        </h2>
        <p className="font-body text-lg text-ink/55 mt-4 max-w-lg mx-auto">
          From &ldquo;I need X from the client&rdquo; to &ldquo;all files delivered and verified&rdquo; — in minutes.
        </p>
      </motion.div>

      {/* Cards grid */}
      <div className="grid md:grid-cols-3 gap-8 relative">
        {STEPS.map((step, i) => (
          <motion.div
            key={step.num}
            initial={{ opacity: 0, y: 36 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ delay: i * 0.12, duration: 0.55, ease: 'easeOut' as const }}
            className="relative"
          >
            {/* Paperclip mascot peeking above column 2 */}
            {step.hasMascot && (
              <motion.div
                initial={{ y: 60, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.45, duration: 0.7, type: 'spring', stiffness: 90, damping: 14 }}
                className="absolute -top-16 left-1/2 -translate-x-1/2 z-10 pointer-events-none"
                style={{ filter: 'drop-shadow(2px 2px 0px rgba(45,45,45,0.2))' }}
              >
                <motion.div
                  animate={{ rotate: [-4, 4, -4] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' as const }}
                >
                  <Image
                    src="/paperclip1.png"
                    alt="FetchAsset Mascot"
                    width={70}
                    height={70}
                    style={{ mixBlendMode: 'multiply' }}
                  />
                </motion.div>
              </motion.div>
            )}

            <WobblyCard
              flavor={step.flavor}
              decoration={step.decoration}
              rotate={step.rotate}
              hoverable
              className="h-full"
            >
              {/* Step number */}
              <span className="font-heading text-6xl text-ink/08 leading-none block mb-2 select-none">
                {step.num}
              </span>

              {/* Icon */}
              <div
                className="w-14 h-14 bg-paper border-[3px] border-ink flex items-center justify-center mb-5"
                style={{ borderRadius: '50% 45% 55% 48% / 50% 52% 48% 50%', boxShadow: '3px 3px 0 0 #2d2d2d' }}
              >
                {step.icon}
              </div>

              <h3 className="font-heading text-2xl text-ink mb-3">{step.title}</h3>
              <p className="font-body text-ink/65 text-base leading-relaxed mb-5">{step.desc}</p>

              {/* Tag badge */}
              <span
                className="font-body text-xs bg-ink text-paper px-3 py-1 inline-block mt-auto"
                style={{ borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px' }}
              >
                {step.tag}
              </span>
            </WobblyCard>
          </motion.div>
        ))}
      </div>

      {/* Security callout — unique feature not covered in the 3 steps above */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ delay: 0.25, duration: 0.5, ease: 'easeOut' as const }}
        className="mt-6"
      >
        <WobblyCard flavor="default" decoration="tape" rotate="0.5" className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div
            className="w-14 h-14 shrink-0 bg-paper border-[3px] border-ink flex items-center justify-center"
            style={{ borderRadius: '50% 45% 55% 48% / 50% 52% 48% 50%', boxShadow: '3px 3px 0 0 #2d2d2d' }}
          >
            <IconLock />
          </div>
          <div className="flex-1">
            <h3 className="font-heading text-2xl text-ink mb-1">Secure by Default</h3>
            <p className="font-body text-ink/65 text-base leading-relaxed">
              End-to-end encrypted. Passwords never stored in plain text. Row-level security ensures zero data leakage between your clients.
            </p>
          </div>
          <span
            className="font-body text-xs bg-ink text-paper px-3 py-1 inline-block shrink-0"
            style={{ borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px' }}
          >
            Enterprise-ready
          </span>
        </WobblyCard>
      </motion.div>

      {/* Connecting arrow doodles (desktop) */}
      <div className="hidden md:flex justify-between px-[calc(33.33%-20px)] mt-4 pointer-events-none" aria-hidden="true">
        {[0, 1].map(i => (
          <svg key={i} width="80" height="30" viewBox="0 0 80 30" fill="none" className="opacity-25">
            <path
              d="M4 15 Q30 4 56 15 Q65 20 72 14"
              stroke="#2d2d2d"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray="5 4"
              fill="none"
            />
            <path d="M70 9 L76 14 L69 18" stroke="#2d2d2d" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        ))}
      </div>
    </section>
  )
}
