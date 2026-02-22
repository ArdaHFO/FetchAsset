'use client'

/**
 * FaqAccordion — Wobbly bordered FAQ items that expand/collapse.
 * Uses Framer Motion for smooth height animation.
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const FAQS = [
  {
    q: 'Do my clients need to create an account?',
    a: "No! Clients receive a secure Magic Link and can upload everything without signing up, creating a password, or installing anything. One click and they're in.",
  },
  {
    q: 'Is there a file size limit?',
    a: "We handle large assets with ease — up to 5 GB per file. Whether it's a raw video export, a massive Figma archive, or a full photography library, FetchAsset won't choke.",
  },
  {
    q: 'Can I use my own branding?',
    a: "Yes! Pro and Agency plans include full white-labeling: custom logo, custom domain, your brand colors. Your clients will never know FetchAsset is running under the hood.",
  },
  {
    q: 'How does the AI audit work?',
    a: 'Every file is analyzed by Llama 3.3 the moment it is uploaded. The AI checks resolution, format, file integrity, expiry dates (for contracts/IDs), and content relevance — then flags anything that might cause problems downstream.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Absolutely. No contracts, no lock-in. Cancel from your account settings in two clicks. Your data remains accessible for 30 days after cancellation for export.',
  },
]

export default function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section id="faq" className="section-container border-t-[3px] border-dashed border-muted">
      <div className="text-center mb-12">
        <span className="tag-label">Got questions?</span>
        <h2 className="section-title mt-4">Frequently asked</h2>
      </div>

      <div className="max-w-2xl mx-auto flex flex-col gap-4">
        {FAQS.map((faq, i) => {
          const isOpen = open === i
          return (
            <div
              key={i}
              className="border-[3px] border-ink overflow-hidden bg-paper"
              style={{
                borderRadius: i % 2 === 0
                  ? '220px 30px 240px 20px / 25px 230px 20px 215px'
                  : '180px 45px 200px 35px / 40px 190px 30px 170px',
                boxShadow: isOpen ? '5px 5px 0 0 #2d2d2d' : '4px 4px 0 0 #2d2d2d',
                transform: i % 2 === 0 ? 'rotate(-0.3deg)' : 'rotate(0.3deg)',
                transition: 'box-shadow 0.15s',
              }}
            >
              {/* Question row */}
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                className="w-full flex items-center justify-between gap-4 px-6 py-4 cursor-pointer text-left"
              >
                <span className="font-heading text-lg text-ink leading-snug">{faq.q}</span>
                <motion.span
                  animate={{ rotate: isOpen ? 45 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="font-heading text-3xl text-ink/40 flex-shrink-0 leading-none select-none"
                >
                  +
                </motion.span>
              </button>

              {/* Answer (animated height) */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key="answer"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.28, ease: 'easeInOut' }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div className="px-6 pb-5 border-t-2 border-dashed border-ink/15 pt-4">
                      <p className="font-body text-base text-ink/70 leading-relaxed">{faq.a}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </section>
  )
}
