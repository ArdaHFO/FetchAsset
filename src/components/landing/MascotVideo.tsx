'use client'

/**
 * MascotVideo — looping paperclip mascot video between Hero and ChaosTable.
 * Fades in on scroll with a wobbly border frame.
 */

import { motion } from 'framer-motion'

export default function MascotVideo() {
  return (
    <section className="border-y-[3px] border-dashed border-muted bg-white/50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14 md:py-20 flex flex-col items-center gap-6">

        {/* Heading */}
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="font-heading text-2xl md:text-3xl text-ink text-center"
        >
          Meet your new assistant&nbsp;📎
        </motion.p>

        {/* Video */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="relative"
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
              className="w-[260px] h-[260px] sm:w-[320px] sm:h-[320px] md:w-[380px] md:h-[380px] object-cover"
              style={{ mixBlendMode: 'multiply' }}
            />
          </div>

          {/* Floating speech bubble */}
          <motion.div
            initial={{ opacity: 0, scale: 0.7, x: 16 }}
            whileInView={{ opacity: 1, scale: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.35, type: 'spring', stiffness: 180, damping: 16 }}
            className="absolute -top-3 -right-4 sm:-right-12 bg-[#fffde7] border-[3px] border-ink px-4 py-2.5 font-body text-xs text-ink max-w-[160px] text-left"
            style={{
              borderRadius: '20px 20px 20px 4px',
              boxShadow: '3px 3px 0 0 #2d2d2d',
              lineHeight: 1.4,
            }}
          >
            I&rsquo;ll handle the boring stuff! ✨
            <div
              className="absolute -bottom-[11px] left-4 w-4 h-4 bg-[#fffde7] border-r-[3px] border-b-[3px] border-ink rotate-45"
            />
          </motion.div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="font-body text-sm text-ink/45 text-center max-w-xs"
        >
          Collecting files, chasing clients, checking formats — let AI do the work.
        </motion.p>
      </div>
    </section>
  )
}
