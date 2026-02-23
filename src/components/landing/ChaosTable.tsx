'use client'

/**
 * ChaosTable — "The Old Way vs. The FetchAsset Way" + mascot video.
 * Two-column layout: comparison rows left, looping mascot video right.
 * Client component for Framer Motion animations.
 */

import { X, Check } from 'lucide-react'
import { motion } from 'framer-motion'

const ROWS: { bad: string; good: string; tag: string }[] = [
  {
    bad:  '50+ emails just to collect files',
    good: 'One magic link — uploads in seconds',
    tag:  '🔗 Magic Links',
  },
  {
    bad:  'Wrong formats, wrong sizes',
    good: 'AI flags every issue instantly',
    tag:  '🤖 AI Audit',
  },
  {
    bad:  'Chasing clients every few days',
    good: 'Automatic smart follow-ups',
    tag:  '⏰ Nudger',
  },
  {
    bad:  'Generic unprofessional links',
    good: 'Branded portal — your agency, your style',
    tag:  '🎨 Branding',
  },
]

export default function ChaosTable() {
  return (
    <section className="section-container border-t-[3px] border-dashed border-muted">
      <div className="text-center mb-10">
        <span className="tag-label">Why switch?</span>
        <h2 className="section-title mt-4">The old way vs. the FetchAsset way</h2>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-10 lg:gap-14 items-center">

        {/* ── LEFT: Comparison rows ── */}
        <div>
          {/* Column headers */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4">
            <div
              className="text-center py-2 font-heading text-xs sm:text-sm text-ink/50 bg-muted border-2 border-ink/20"
              style={{ borderRadius: '180px 45px 200px 35px / 40px 190px 30px 170px' }}
            >
              ✉️ The Old Way
            </div>
            <div
              className="text-center py-2 font-heading text-xs sm:text-sm text-paper bg-ink border-2 border-ink"
              style={{ borderRadius: '180px 45px 200px 35px / 40px 190px 30px 170px', boxShadow: '4px 4px 0 0 #2d2d2d' }}
            >
              ✦ The FetchAsset Way
            </div>
          </div>

          {/* Rows */}
          <div className="flex flex-col gap-2.5">
            {ROWS.map((row, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -18 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ delay: i * 0.08, duration: 0.4, ease: 'easeOut' }}
                className="grid grid-cols-2 gap-2 sm:gap-3"
                style={{ transform: i % 2 === 0 ? 'rotate(-0.15deg)' : 'rotate(0.15deg)' }}
              >
                {/* Bad side */}
                <div
                  className="flex items-start gap-2 px-3 sm:px-4 py-2.5 bg-[#f5f0ea] border-2 border-ink/15"
                  style={{ borderRadius: '220px 30px 240px 20px / 25px 230px 20px 215px' }}
                >
                  <div className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 rounded-full bg-red-100 border-2 border-red-300 flex items-center justify-center mt-0.5">
                    <X size={8} strokeWidth={3} className="text-red-500" />
                  </div>
                  <span className="font-body text-[11px] sm:text-sm text-ink/50 line-through leading-snug">{row.bad}</span>
                </div>

                {/* Good side */}
                <div
                  className="flex items-start gap-2 px-3 sm:px-4 py-2.5 bg-[#f0fdf4] border-2 border-green-300"
                  style={{
                    borderRadius: '220px 30px 240px 20px / 25px 230px 20px 215px',
                    boxShadow: '3px 3px 0 0 #2d2d2d',
                  }}
                >
                  <div className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 rounded-full bg-green-100 border-2 border-green-400 flex items-center justify-center mt-0.5">
                    <Check size={8} strokeWidth={3} className="text-green-600" />
                  </div>
                  <div className="min-w-0">
                    <span className="font-body text-[11px] sm:text-sm text-ink font-bold leading-snug block">{row.good}</span>
                    <span
                      className="font-body text-[9px] sm:text-[10px] text-green-700/70 mt-0.5 inline-block px-1.5 py-0.5 bg-green-100 border border-green-200"
                      style={{ borderRadius: '20px' }}
                    >
                      {row.tag}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── RIGHT: Mascot video ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 24 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.65, ease: 'easeOut' }}
          className="relative hidden lg:block flex-shrink-0"
        >
          <div
            className="overflow-hidden border-[3px] border-ink bg-paper"
            style={{
              borderRadius: '180px 45px 200px 35px / 40px 190px 30px 170px',
              boxShadow: '6px 6px 0 0 #2d2d2d',
            }}
          >
            <video
              src="/Video-Paperclip2.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="w-[280px] h-[280px] object-cover"
              style={{ mixBlendMode: 'multiply' }}
            />
          </div>

          {/* Speech bubble */}
          <motion.div
            initial={{ opacity: 0, scale: 0.7, x: 16 }}
            whileInView={{ opacity: 1, scale: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, type: 'spring', stiffness: 180, damping: 16 }}
            className="absolute -top-3 -right-6 bg-[#fffde7] border-[3px] border-ink px-3.5 py-2 font-body text-xs text-ink max-w-[150px] text-left z-10"
            style={{
              borderRadius: '18px 18px 18px 4px',
              boxShadow: '3px 3px 0 0 #2d2d2d',
              lineHeight: 1.4,
            }}
          >
            I&rsquo;ll handle the boring stuff! ✨
            <div
              className="absolute -bottom-[10px] left-4 w-3.5 h-3.5 bg-[#fffde7] border-r-[3px] border-b-[3px] border-ink rotate-45"
            />
          </motion.div>

          {/* Subtext under video */}
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="font-body text-xs text-ink/40 text-center mt-4 max-w-[240px] mx-auto leading-relaxed"
          >
            Let AI collect, check &amp; organize — so you don&rsquo;t have to.
          </motion.p>
        </motion.div>
      </div>
    </section>
  )
}
