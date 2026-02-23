'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Loader2 } from 'lucide-react'

interface PortalLandingProps {
  token: string
  projectTitle: string
  clientName: string          // pre-filled from project (editable)
  agencyName: string
  brandColor: string
  logoUrl: string | null
  welcomeMsg: string
  deadline: string | null
  fontHeading: string
  fontBody: string
  wobbleR: string
}

const localKey = (token: string) => `fetchasset_portal_name_${token}`

export default function PortalLanding({
  token,
  clientName,
  agencyName,
  brandColor,
  logoUrl,
  welcomeMsg,
  deadline,
  fontHeading,
  fontBody,
  wobbleR,
}: PortalLandingProps) {
  const router = useRouter()
  const [name, setName] = useState(clientName)
  const [loading, setLoading] = useState(false)

  // On mount: if we previously saved a name for this portal, skip landing
  useEffect(() => {
    try {
      const saved = localStorage.getItem(localKey(token))
      if (saved) {
        router.replace(`/portal/${token}?name=${encodeURIComponent(saved)}`)
      }
    } catch {
      // localStorage not available (private mode etc.) — that's fine
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  function handleAccess() {
    if (!name.trim()) return
    setLoading(true)
    try {
      localStorage.setItem(localKey(token), name.trim())
    } catch { /* ignore */ }
    router.push(`/portal/${token}?name=${encodeURIComponent(name.trim())}`)
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: fontBody }}>
      {/* Top bar */}
      <header
        className="sticky top-0 z-30 flex items-center justify-between px-5 py-3 border-b-2 border-ink/10"
        style={{ background: 'rgba(253,251,247,0.96)', backdropFilter: 'blur(8px)' }}
      >
        <div>
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={agencyName} className="h-9 w-auto object-contain max-w-[160px]" />
          ) : (
            <span style={{ fontFamily: fontHeading, fontSize: '22px', fontWeight: 700, color: '#2d2d2d' }}>
              {agencyName === 'FetchAsset'
                ? <><span>Fetch</span><span style={{ color: brandColor }}>Asset</span></>
                : agencyName}
            </span>
          )}
        </div>
        <span className="text-xs text-ink/35">🔒 Secure</span>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md flex flex-col gap-6">

          {/* Welcome card */}
          <div
            className="p-7 border-2 border-ink/20 bg-postit"
            style={{
              borderRadius: wobbleR,
              boxShadow: '5px 5px 0px 0px #2d2d2d',
              transform: 'rotate(-0.5deg)',
            }}
          >
            <p className="text-xs text-ink/45 uppercase tracking-wider mb-2" style={{ fontFamily: fontBody }}>
              Asset Collection Portal
            </p>
            <h1 className="text-3xl text-ink leading-tight" style={{ fontFamily: fontHeading }}>
              {welcomeMsg}
            </h1>
            {deadline && (
              <p className="text-sm text-ink/65 mt-3 flex items-center gap-1.5" style={{ fontFamily: fontBody }}>
                📅 <strong>Deadline:</strong>&nbsp;{deadline}
              </p>
            )}
          </div>

          {/* Access form */}
          <div
            className="p-6 border-2 border-ink/20 bg-paper flex flex-col gap-5"
            style={{
              borderRadius: '220px 30px 240px 20px / 25px 230px 20px 215px',
              boxShadow: '4px 4px 0px 0px #2d2d2d',
            }}
          >
            <div>
              <h2 className="font-heading text-xl text-ink">Access your portal</h2>
              <p className="font-body text-sm text-ink/55 mt-1">
                Enter your name to get your personal portal link.
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-body text-xs text-ink/50 uppercase tracking-wider">Your name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. John Smith"
                autoFocus
                onKeyDown={(e) => { if (e.key === 'Enter') handleAccess() }}
                className="w-full px-4 py-3 font-body text-sm text-ink bg-paper border-2 border-ink/50 outline-none focus:border-ink transition-all"
                style={{ borderRadius: '220px 30px 220px 30px / 30px 220px 30px 220px' }}
              />
            </div>

            <button
              onClick={handleAccess}
              disabled={!name.trim() || loading}
              className="w-full flex items-center justify-center gap-2 px-5 py-4 font-body font-bold text-white text-base border-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px',
                background: name.trim() ? brandColor : '#9ca3af',
                borderColor: name.trim() ? brandColor : '#9ca3af',
                boxShadow: name.trim() ? '4px 4px 0px 0px #2d2d2d' : 'none',
              }}
            >
              {loading
                ? <><Loader2 size={16} className="animate-spin" /> Opening portal…</>
                : <>Access My Portal <ArrowRight size={16} /></>
              }
            </button>

            <p className="font-body text-xs text-ink/35 text-center">
              Your unique portal link will be created — you can bookmark it to come back anytime.
            </p>
          </div>
        </div>
      </main>

      <footer className="py-4 text-center border-t-2 border-ink/10" style={{ background: 'rgba(253,251,247,0.8)' }}>
        <p className="text-xs text-ink/25" style={{ fontFamily: fontBody }}>
          Your files are encrypted in transit and at rest. 🔒
        </p>
      </footer>
    </div>
  )
}
