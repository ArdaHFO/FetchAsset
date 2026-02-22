import type { Metadata } from 'next'
import React from 'react'

// Client portals are private magic-link pages — never index
export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: 'Client Portal',
}

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen"
      style={{
        background: '#fdfbf7',
        backgroundImage: 'radial-gradient(circle, #2d2d2d 0.7px, transparent 0.7px)',
        backgroundSize: '20px 20px',
        backgroundAttachment: 'local',
      }}
    >
      {children}
    </div>
  )
}
