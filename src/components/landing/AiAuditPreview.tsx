'use client'

/**
 * AiAuditPreview — Live mock of the Llama 3.3 audit flow.
 * Scanning animation → mascot speech bubble with the error.
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { AlertTriangle, FileImage } from 'lucide-react'

type Phase = 'idle' | 'scanning' | 'result'

export default function AiAuditPreview() {
  const [phase, setPhase] = useState<Phase>('idle')

  // Auto-run on mount (no user interaction needed for passive demo)
  useEffect(() => {
    const t1 = setTimeout(() => setPhase('scanning'), 600)
    const t2 = setTimeout(() => setPhase('result'), 3400)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  return (
    <section className="section-container border-t-[3px] border-dashed border-muted">
      <div className="text-center mb-12">
        <span className="tag-label">Llama 3.3 in Action</span>
        <h2 className="section-title mt-4">We audit files so you don&apos;t have to</h2>
        <p className="font-body text-lg text-ink/55 max-w-md mx-auto mt-3">
          Every file is checked the moment it arrives. Problems caught before they waste your time.
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <div
          className="border-[3px] border-ink bg-paper overflow-hidden"
          style={{ borderRadius: '12px 3px 12px 3px / 3px 12px 3px 12px', boxShadow: '5px 5px 0 0 #2d2d2d' }}
        >
          {/* Mock browser bar */}
          <div className="bg-ink px-5 py-3 flex items-center gap-3">
            <div className="flex gap-1.5">
              {['bg-red-400', 'bg-yellow-400', 'bg-green-400'].map((c) => (
                <div key={c} className={`w-2.5 h-2.5 rounded-full ${c}`} />
              ))}
            </div>
            <div
              className="flex-1 bg-paper/10 px-3 py-1 font-body text-xs text-paper/50"
              style={{ borderRadius: '255px' }}
            >
              fetchasset.com/portal/acme-corp
            </div>
          </div>

          {/* Content area */}
          <div className="p-6 md:p-10 flex flex-col items-center gap-6 min-h-[280px] justify-center">

            {/* The "uploaded" file card */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 180 }}
              className="flex items-center gap-3 px-5 py-3 border-[3px] border-ink bg-blue-50 self-start"
              style={{
                borderRadius: '180px 45px 200px 35px / 40px 190px 30px 170px',
                boxShadow: '3px 3px 0 0 #2d2d2d',
              }}
            >
              <FileImage size={22} className="text-blue-500" strokeWidth={2} />
              <div>
                <p className="font-body text-sm text-ink font-bold">logo.jpg</p>
                <p className="font-body text-xs text-ink/40">72 kB · image/jpeg</p>
              </div>
            </motion.div>

            {/* Scanning phase */}
            <AnimatePresence mode="wait">
              {phase === 'scanning' && (
                <motion.div
                  key="scanning"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex flex-col items-center gap-4 py-2"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }}
                  >
                    <Image src="/meta-llama.png" alt="Llama 3.3 scanning" width={48} height={48} />
                  </motion.div>
                  <div className="text-center">
                    <p className="font-heading text-xl text-ink">Scanning with Llama 3.3&hellip;</p>
                    <div className="flex justify-center gap-1.5 mt-2">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-2 h-2 bg-ink/40 rounded-full"
                          animate={{ opacity: [0.2, 1, 0.2] }}
                          transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.22 }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {phase === 'result' && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="w-full flex flex-col sm:flex-row items-start sm:items-end gap-5"
                >
                  {/* Mascot */}
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1, type: 'spring', stiffness: 140 }}
                    className="flex-shrink-0 animate-float-slow"
                  >
                    <Image
                      src="/paperclip1.png"
                      alt="FetchAsset AI Mascot"
                      width={90}
                      height={90}
                      style={{ mixBlendMode: 'multiply' }}
                    />
                  </motion.div>

                  {/* Speech bubble */}
                  <motion.div
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.25, type: 'spring', stiffness: 200, damping: 18 }}
                    className="relative flex-1"
                  >
                    {/* Tail pointing left */}
                    <div
                      className="absolute -left-3 bottom-5 w-4 h-4 bg-[#fffde7] border-l-[3px] border-b-[3px] border-ink"
                      style={{ transform: 'rotate(45deg)' }}
                    />
                    <div
                      className="bg-[#fffde7] border-[3px] border-ink px-5 py-4"
                      style={{
                        borderRadius: '18px 3px 18px 3px / 3px 18px 3px 18px',
                        boxShadow: '4px 4px 0 0 #2d2d2d',
                      }}
                    >
                      <div className="flex items-start gap-2 mb-2">
                        <AlertTriangle size={15} className="text-red-500 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                        <p className="font-body text-sm font-bold text-red-700">Issue found in logo.jpg</p>
                      </div>
                      <p className="font-body text-sm text-ink/80 leading-relaxed">
                        Hey! This is a low-res JPG (72 DPI). Your client needs to provide a{' '}
                        <strong>high-res SVG or PNG</strong> for best print quality.
                      </p>
                      <p className="font-body text-xs text-ink/40 mt-2">
                        Required: 300 DPI · Found: 72 DPI
                      </p>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <p className="font-body text-sm text-ink/45 text-center mt-5 italic">
          We don&apos;t just collect files — we audit them for you.
        </p>
      </div>
    </section>
  )
}
