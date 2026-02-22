'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

interface ContactCardProps {
  method: 'email' | 'whatsapp'
  value: string
  agencyName: string
  projectTitle: string
  brandColor: string
}

export default function ContactCard({
  method,
  value,
  agencyName,
  projectTitle,
  brandColor,
}: ContactCardProps) {
  const href =
    method === 'whatsapp'
      ? `https://wa.me/${value.replace(/\D/g, '')}?text=${encodeURIComponent(
          `Hi! I have a question about "${projectTitle}" 🙋`
        )}`
      : `mailto:${value}?subject=${encodeURIComponent(`Question about ${projectTitle}`)}`

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 5, duration: 0.45, ease: 'easeOut' }}
      className="fixed bottom-5 right-4 z-50 max-w-[260px] w-[calc(100vw-32px)] sm:w-auto"
    >
      <div
        className="flex items-center gap-3 px-4 py-3 bg-paper border-2 border-ink/25"
        style={{
          borderRadius: '220px 30px 240px 20px / 25px 230px 20px 215px',
          boxShadow: '4px 4px 0px 0px #2d2d2d',
        }}
      >
        {/* Mascot */}
        <div className="flex-shrink-0">
          <Image
            src="/paperclip1.png"
            alt=""
            width={36}
            height={36}
            style={{ mixBlendMode: 'multiply' }}
          />
        </div>

        {/* Text + button */}
        <div className="flex flex-col gap-1.5 min-w-0">
          <p
            className="text-ink leading-tight text-sm"
            style={{ fontFamily: 'var(--font-heading, Kalam, cursive)', fontWeight: 700 }}
          >
            Got a question?
          </p>
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold text-paper transition-opacity hover:opacity-85 active:opacity-70"
            style={{
              fontFamily: 'var(--font-body, "Patrick Hand", sans-serif)',
              borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px',
              boxShadow: '2px 2px 0px 0px #2d2d2d',
              background: brandColor,
              color: '#ffffff',
              textDecoration: 'none',
            }}
          >
            {method === 'whatsapp' ? '📱' : '✉️'} Contact {agencyName}
          </a>
        </div>
      </div>
    </motion.div>
  )
}
