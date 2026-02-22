/**
 * LegalPageWrapper — shared layout shell for Privacy, ToS, Cookie pages.
 * Wobbly border, paperclip mascot speech bubble, structured body.
 */

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface Props {
  title: string
  emoji: string
  mascotSpeech: string
  lastUpdated: string
  children: React.ReactNode
}

export default function LegalPageWrapper({ title, emoji, mascotSpeech, lastUpdated, children }: Props) {
  return (
    <div className="min-h-screen bg-paper relative overflow-x-hidden" style={{
      backgroundImage: [
        'linear-gradient(to right,  rgba(45,45,45,0.035) 1px, transparent 1px)',
        'linear-gradient(to bottom, rgba(45,45,45,0.035) 1px, transparent 1px)',
      ].join(','),
      backgroundSize: '28px 28px',
    }}>

      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-paper/90 backdrop-blur-sm border-b-[3px] border-dashed border-muted">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center gap-4">
          <Link href="/" className="font-heading text-xl text-ink hover:opacity-70 transition-opacity">
            FetchAsset
          </Link>
          <span className="text-ink/25">/</span>
          <span className="font-body text-sm text-ink/50">{title}</span>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-16">

        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 font-body text-xs text-ink/40 hover:text-ink transition-colors mb-10"
        >
          <ArrowLeft size={13} /> Back to home
        </Link>

        {/* Mascot + speech bubble */}
        <div className="flex items-start gap-5 mb-12">
          <div className="relative flex-shrink-0">
            <Image
              src="/paperclip1.png"
              alt="FetchAsset Mascot"
              width={100}
              height={100}
              style={{ mixBlendMode: 'multiply' }}
            />
          </div>
          <div className="relative mt-4">
            {/* Tail */}
            <div
              className="absolute -left-3 top-4 w-4 h-4 bg-[#fffde7] border-l-[3px] border-b-[3px] border-ink"
              style={{ transform: 'rotate(45deg)' }}
            />
            <div
              className="bg-[#fffde7] border-[3px] border-ink px-5 py-3 font-body text-sm text-ink leading-relaxed max-w-xs"
              style={{
                borderRadius: '180px 45px 200px 35px / 40px 190px 30px 170px',
                boxShadow: '4px 4px 0 0 #2d2d2d',
              }}
            >
              {mascotSpeech}
            </div>
          </div>
        </div>

        {/* Main content card */}
        <div
          className="border-[4px] border-ink bg-paper px-8 py-10 md:px-12 md:py-14"
          style={{
            borderRadius: '22px 6px 26px 6px / 6px 24px 6px 22px',
            boxShadow: '6px 6px 0 0 #2d2d2d',
          }}
        >
          {/* Page title */}
          <div className="mb-10 pb-8 border-b-[3px] border-dashed border-muted">
            <h1 className="font-heading text-5xl md:text-6xl text-ink mb-3">
              {emoji} {title}
            </h1>
            <p className="font-body text-sm text-ink/40">
              Last updated: <time>{lastUpdated}</time> &nbsp;·&nbsp; FetchAsset, Inc.
            </p>
          </div>

          {/* Injected section content */}
          <div className="legal-body font-body text-ink leading-relaxed space-y-8">
            {children}
          </div>
        </div>

        {/* Footer links */}
        <div className="mt-12 flex flex-wrap gap-5 font-body text-sm text-ink/40">
          <Link href="/privacy-policy" className="hover:text-ink transition-colors">Privacy Policy</Link>
          <Link href="/terms-of-service" className="hover:text-ink transition-colors">Terms of Service</Link>
          <Link href="/cookie-policy" className="hover:text-ink transition-colors">Cookie Policy</Link>
          <Link href="/" className="hover:text-ink transition-colors ml-auto">&larr; Back to FetchAsset</Link>
        </div>
      </div>
    </div>
  )
}

// Reusable section component
export function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-heading text-2xl text-ink mb-2">{title}</h2>
      <div className="font-body text-sm text-ink/70 leading-7 space-y-2">{children}</div>
    </section>
  )
}
