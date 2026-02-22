'use client'

/**
 * StickyCta — Appears after hero scroll.
 * Desktop: fixed bottom-right button.
 * Mobile: fixed bottom bar spanning full width.
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

export default function StickyCta() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      // Show after scrolling ~400px (past the hero)
      setVisible(window.scrollY > 400)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Desktop — bottom-right floating button */}
          <motion.div
            key="desktop-cta"
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            className="fixed bottom-7 right-6 z-[100] hidden md:block"
          >
            <Link href="/demo">
              <button
                className="font-body font-bold text-sm text-paper bg-[#ff4d4d] border-[3px] border-ink px-5 py-3 flex items-center gap-2 cursor-pointer hover:brightness-105 active:translate-y-px transition-all"
                style={{
                  borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px',
                  boxShadow: '4px 4px 0 0 #2d2d2d',
                }}
              >
                Try Demo Now 🚀
              </button>
            </Link>
          </motion.div>

          {/* Mobile — full-width fixed bottom bar */}
          <motion.div
            key="mobile-cta"
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            className="fixed bottom-0 left-0 right-0 z-[100] md:hidden border-t-[3px] border-ink bg-[#ff4d4d] px-4 py-3"
            style={{ boxShadow: '0 -4px 0 0 #2d2d2d' }}
          >
            <Link href="/demo" className="block">
              <div className="flex items-center justify-center gap-2">
                <span className="font-body font-bold text-base text-paper">Try Demo Now 🚀</span>
              </div>
            </Link>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
