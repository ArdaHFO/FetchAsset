'use client'

import { useCallback, useRef, useState, useTransition } from 'react'
import Image from 'next/image'
import { UploadCloud, Palette, Type, Sliders, Eye, Check, Loader2, X } from 'lucide-react'
import { WobblyButton, WobblyCard, WobblyCardContent } from '@/components/ui'
import { cn } from '@/lib/utils'

// ── Types ──────────────────────────────────────────────────────────

export interface BrandingValues {
  logo_url: string | null
  brand_color: string
  custom_welcome_msg: string
  preferred_font: 'sketchy' | 'professional'
  wobble_intensity: number
}

interface BrandingHubProps {
  initial: BrandingValues
  agencyName: string
}

// ── Preset accent colors ──────────────────────────────────────────

const COLOR_PRESETS = [
  '#e63946', '#2d5da1', '#2a9d8f', '#e9c46a',
  '#f4a261', '#6a4c93', '#1a936f', '#3a3a3a',
]

// ── Wobble radius helper (scales with intensity) ──────────────────

function getWobblyRadius(intensity: number): string {
  if (intensity < 10) return '6px'
  const t = intensity / 100
  const a = Math.round(80 + t * 140)
  const b = Math.round(5 + t * 40)
  const c = Math.round(70 + t * 150)
  const d = Math.round(5 + t * 10)
  const e = Math.round(5 + t * 35)
  const f = Math.round(60 + t * 165)
  return `${a}px ${b}px ${c}px ${d}px / ${e}px ${f}px ${b}px ${a}px`
}

// ── Mini Portal Preview ───────────────────────────────────────────

function PortalPreview({ brand, agencyName }: { brand: BrandingValues; agencyName: string }) {
  const r = getWobblyRadius(brand.wobble_intensity)
  const shadowColor = '#2d2d2d'
  const fontFamily =
    brand.preferred_font === 'professional'
      ? "'Inter', 'Roboto', sans-serif"
      : "'Kalam', cursive"
  const bodyFont =
    brand.preferred_font === 'professional'
      ? "'Inter', 'Roboto', sans-serif"
      : "'Patrick Hand', cursive"

  return (
    <div
      className="w-[340px] h-[460px] overflow-hidden bg-[#fdfbf7] border-2 border-ink/20 relative select-none"
      style={{ borderRadius: '12px', fontFamily: bodyFont }}
    >
      {/* Graph-paper dots */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: 'radial-gradient(circle, #2d2d2d 0.8px, transparent 0.8px)',
          backgroundSize: '18px 18px',
        }}
      />

      {/* Top bar */}
      <div
        className="relative flex items-center justify-between px-4 py-3 border-b-2 border-ink/10"
        style={{ background: '#fdfbf7' }}
      >
        {brand.logo_url ? (
          <img src={brand.logo_url} alt="Logo" className="h-7 w-auto object-contain max-w-[120px]" />
        ) : (
          <span style={{ fontFamily, fontSize: '15px', fontWeight: 700, color: '#2d2d2d' }}>
            {agencyName || 'Your Agency'}
          </span>
        )}
        <span style={{ fontSize: '9px', color: '#9ca3af', fontFamily: bodyFont }}>Secure portal</span>
      </div>

      {/* Content */}
      <div className="relative px-4 py-4 flex flex-col gap-3">
        {/* Welcome card */}
        <div
          className="p-3 border-2 border-ink/20"
          style={{
            borderRadius: r,
            boxShadow: `3px 3px 0px 0px ${shadowColor}`,
            background: '#fff9c4',
            transform: 'rotate(-0.5deg)',
          }}
        >
          <p style={{ fontSize: '8px', color: '#6b7280', fontFamily: bodyFont, marginBottom: 2 }}>
            Asset Collection Portal
          </p>
          <p style={{ fontSize: '13px', fontFamily, color: '#2d2d2d', fontWeight: 700, lineHeight: 1.2 }}>
            {brand.custom_welcome_msg || 'Welcome! Please upload your files'}
          </p>
          <p style={{ fontSize: '9px', color: '#9ca3af', fontFamily: bodyFont, marginTop: 4 }}>
            📅 Deadline: March 15, 2026
          </p>
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex justify-between mb-1">
            <span style={{ fontSize: '8px', color: '#6b7280', fontFamily: bodyFont }}>1 of 3 submitted</span>
            <span style={{ fontSize: '8px', color: '#2d2d2d', fontFamily: bodyFont }}>33%</span>
          </div>
          <div
            className="h-2 w-full bg-[#e5e0d8] overflow-hidden"
            style={{ borderRadius: '8px 1px 8px 1px / 1px 8px 1px 8px' }}
          >
            <div
              className="h-full transition-all"
              style={{ width: '33%', background: brand.brand_color, borderRadius: '8px 1px 8px 1px' }}
            />
          </div>
        </div>

        {/* Request cards */}
        {[
          { label: 'Company Logo', types: 'SVG, PNG', done: true },
          { label: 'Brand Guidelines', types: 'PDF', done: false },
          { label: 'Product Photos', types: 'JPG, PNG', done: false },
        ].map((r2, i) => (
          <div
            key={i}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-ink/15"
            style={{ borderRadius: getWobblyRadius(brand.wobble_intensity * 0.6) }}
          >
            <div
              className="w-4 h-4 flex-shrink-0 flex items-center justify-center"
              style={{
                borderRadius: '50%',
                background: r2.done ? brand.brand_color : 'transparent',
                border: `1.5px solid ${r2.done ? brand.brand_color : '#d1d5db'}`,
              }}
            >
              {r2.done && <span style={{ fontSize: '8px', color: '#fff' }}>✓</span>}
            </div>
            <div className="flex-1 min-w-0">
              <p style={{ fontSize: '9px', fontWeight: 600, color: '#2d2d2d', fontFamily: bodyFont }}>{r2.label}</p>
              <p style={{ fontSize: '7px', color: '#9ca3af', fontFamily: bodyFont }}>{r2.types}</p>
            </div>
            {!r2.done && (
              <div
                className="px-2 py-0.5 text-white"
                style={{
                  fontSize: '7px',
                  background: brand.brand_color,
                  borderRadius: getWobblyRadius(brand.wobble_intensity * 0.8),
                  fontFamily: bodyFont,
                }}
              >
                Upload
              </div>
            )}
          </div>
        ))}

        {/* Powered by */}
        <p style={{ fontSize: '7px', color: '#c4c4c4', textAlign: 'center', fontFamily: bodyFont, marginTop: 2 }}>
          Powered by FetchAsset
        </p>
      </div>
    </div>
  )
}

// ── Main BrandingHub Component ────────────────────────────────────

export default function BrandingHub({ initial, agencyName }: BrandingHubProps) {
  const [brand, setBrand] = useState<BrandingValues>(initial)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [logoUploading, setLogoUploading] = useState(false)
  const [logoDragging, setLogoDragging] = useState(false)
  const logoInputRef = useRef<HTMLInputElement>(null)
  const [, startTransition] = useTransition()

  function set<K extends keyof BrandingValues>(key: K, val: BrandingValues[K]) {
    setSaved(false)
    setBrand((prev) => ({ ...prev, [key]: val }))
  }

  // ── Logo upload ───────────────────────────────────────────────

  const handleLogoFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return
    const file = files[0]
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setError('Logo must be PNG, JPG, SVG, or WEBP.')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('Logo must be under 2 MB.')
      return
    }
    setLogoUploading(true)
    setError('')
    const fd = new FormData()
    fd.append('file', file)
    try {
      const res = await fetch('/api/branding/logo', { method: 'POST', body: fd })
      const json = await res.json()
      if (!res.ok) { setError(json.error ?? 'Upload failed.'); return }
      set('logo_url', json.url)
    } catch {
      setError('Upload failed. Try again.')
    } finally {
      setLogoUploading(false)
    }
  }, [])

  // ── Save branding ─────────────────────────────────────────────

  async function handleSave() {
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/branding', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand_color: brand.brand_color,
          custom_welcome_msg: brand.custom_welcome_msg,
          preferred_font: brand.preferred_font,
          wobble_intensity: brand.wobble_intensity,
        }),
      })
      const json = await res.json()
      if (!res.ok) { setError(json.error ?? 'Save failed.'); return }
      setSaved(true)
      startTransition(() => { setTimeout(() => setSaved(false), 2500) })
    } catch {
      setError('Save failed. Try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-8 xl:flex-row xl:items-start xl:gap-10">

      {/* ── Controls ─────────────────────────────────────────────── */}
      <div className="flex flex-col gap-6 flex-1 min-w-0">

        {/* Section header */}
        <div>
          <h2 className="font-heading text-2xl text-ink">Agency Brand Hub</h2>
          <p className="font-body text-sm text-ink/55 mt-1">
            Customise how your clients experience the portal. Changes appear in the live preview →
          </p>
        </div>

        {/* Logo upload */}
        <div className="flex flex-col gap-2">
          <label className="font-body text-xs text-ink/50 uppercase tracking-wider flex items-center gap-1.5">
            <UploadCloud size={13} /> Agency Logo
          </label>
          <div
            className={cn(
              'relative flex flex-col items-center justify-center gap-3 p-6 border-2 border-dashed cursor-pointer transition-colors',
              logoDragging ? 'border-ink bg-muted/40' : 'border-ink/30 hover:border-ink/60'
            )}
            style={{ borderRadius: '20px 5px 20px 5px / 5px 20px 5px 20px' }}
            onClick={() => logoInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setLogoDragging(true) }}
            onDragLeave={() => setLogoDragging(false)}
            onDrop={(e) => { e.preventDefault(); setLogoDragging(false); handleLogoFiles(e.dataTransfer.files) }}
          >
            <input
              ref={logoInputRef}
              type="file"
              accept="image/png,image/jpeg,image/svg+xml,image/webp"
              className="hidden"
              onChange={(e) => handleLogoFiles(e.target.files)}
            />
            {logoUploading ? (
              <Loader2 size={24} className="animate-spin text-ink/50" />
            ) : brand.logo_url ? (
              <div className="flex flex-col items-center gap-2">
                <img src={brand.logo_url} alt="Logo" className="h-12 w-auto object-contain max-w-[180px]" />
                <div className="flex items-center gap-2">
                  <p className="font-body text-xs text-ink/50">Click to replace</p>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); set('logo_url', null) }}
                    className="p-0.5 rounded-full hover:bg-ink/10 transition-colors"
                  >
                    <X size={12} className="text-ink/40" />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <UploadCloud size={28} className="text-ink/30" />
                <div className="text-center">
                  <p className="font-body text-sm text-ink/60">Drop your logo here or click to browse</p>
                  <p className="font-body text-xs text-ink/35 mt-0.5">PNG, JPG, SVG, WEBP · Max 2 MB</p>
                </div>
              </>
            )}
          </div>
          <p className="font-body text-xs text-ink/35">
            Shown in the portal header. Defaults to &quot;FetchAsset&quot; if not set.
          </p>
        </div>

        {/* Brand color */}
        <div className="flex flex-col gap-2">
          <label className="font-body text-xs text-ink/50 uppercase tracking-wider flex items-center gap-1.5">
            <Palette size={13} /> Brand / Accent Color
          </label>
          <div className="flex items-center gap-3 flex-wrap">
            {COLOR_PRESETS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => set('brand_color', c)}
                className="w-8 h-8 border-2 transition-all"
                style={{
                  background: c,
                  borderColor: brand.brand_color === c ? '#2d2d2d' : 'transparent',
                  borderRadius: '50%',
                  boxShadow: brand.brand_color === c ? '2px 2px 0 0 #2d2d2d' : 'none',
                  transform: brand.brand_color === c ? 'translate(-1px,-1px)' : 'none',
                }}
                title={c}
              />
            ))}
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={brand.brand_color}
                onChange={(e) => set('brand_color', e.target.value)}
                className="w-8 h-8 border-2 border-ink/30 cursor-pointer"
                style={{ borderRadius: '50%', padding: '1px' }}
                title="Custom color"
              />
              <span
                className="font-body text-sm text-ink/70 px-2 py-0.5 border border-ink/20"
                style={{ borderRadius: '4px', fontVariantNumeric: 'tabular-nums' }}
              >
                {brand.brand_color.toUpperCase()}
              </span>
            </div>
          </div>
          <p className="font-body text-xs text-ink/35">
            Applied to the progress bar, upload buttons, and active borders.
          </p>
        </div>

        {/* Welcome message */}
        <div className="flex flex-col gap-2">
          <label className="font-body text-xs text-ink/50 uppercase tracking-wider flex items-center gap-1.5">
            <Type size={13} /> Portal Welcome Text
          </label>
          <input
            type="text"
            value={brand.custom_welcome_msg}
            onChange={(e) => set('custom_welcome_msg', e.target.value)}
            placeholder="e.g. Welcome to the Brand Portal — thanks for partnering with us!"
            maxLength={120}
            className="w-full px-4 py-2.5 font-body text-sm text-ink bg-paper border-2 border-ink/40 outline-none focus:border-ink transition-all"
            style={{ borderRadius: '220px 30px 240px 20px / 25px 230px 20px 215px' }}
          />
          <div className="flex justify-between">
            <p className="font-body text-xs text-ink/35">Shown as the main headline on your portal.</p>
            <span className="font-body text-xs text-ink/30">{brand.custom_welcome_msg.length}/120</span>
          </div>
        </div>

        {/* Font toggle */}
        <div className="flex flex-col gap-2">
          <label className="font-body text-xs text-ink/50 uppercase tracking-wider flex items-center gap-1.5">
            <Type size={13} /> Portal Font Style
          </label>
          <div className="flex gap-3">
            {(
              [
                { val: 'sketchy', label: 'Sketchy', subLabel: 'Kalam · Hand-drawn', preview: 'Aa' },
                { val: 'professional', label: 'Professional', subLabel: 'Inter · Clean & modern', preview: 'Aa' },
              ] as const
            ).map(({ val, label, subLabel, preview }) => (
              <button
                key={val}
                type="button"
                onClick={() => set('preferred_font', val)}
                className={cn(
                  'flex-1 flex flex-col items-center gap-2 p-4 border-2 transition-all',
                  brand.preferred_font === val
                    ? 'border-ink bg-ink text-paper shadow-[3px_3px_0px_0px_#2d2d2d]'
                    : 'border-ink/20 bg-paper text-ink hover:border-ink/50'
                )}
                style={{ borderRadius: '220px 30px 240px 20px / 25px 230px 20px 215px' }}
              >
                <span
                  className="text-3xl"
                  style={{
                    fontFamily: val === 'sketchy' ? "'Kalam', cursive" : "'Inter', sans-serif",
                    color: 'inherit',
                  }}
                >
                  {preview}
                </span>
                <div>
                  <p className="font-body text-sm font-bold">{label}</p>
                  <p className="font-body text-xs opacity-60">{subLabel}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Wobble slider */}
        <div className="flex flex-col gap-2">
          <label className="font-body text-xs text-ink/50 uppercase tracking-wider flex items-center gap-1.5">
            <Sliders size={13} /> Wobble Intensity
            <span
              className="ml-auto font-heading text-base text-ink px-2 py-0.5 bg-[#fffde7] border border-ink/20"
              style={{ borderRadius: '20px' }}
            >
              {brand.wobble_intensity}
            </span>
          </label>
          <input
            type="range"
            min={0}
            max={100}
            value={brand.wobble_intensity}
            onChange={(e) => set('wobble_intensity', parseInt(e.target.value))}
            className="w-full accent-ink"
          />
          <div className="flex justify-between font-body text-xs text-ink/35">
            <span>None (clean corners)</span>
            <span>Maximum wobble 🌀</span>
          </div>
          <p className="font-body text-xs text-ink/35">
            Controls the hand-drawn, wobbly border curvature on portal cards and buttons.
          </p>
        </div>

        {/* Error */}
        {error && (
          <p className="font-body text-sm text-accent">{error}</p>
        )}

        {/* Save button */}
        <WobblyButton
          variant="primary"
          size="md"
          onClick={handleSave}
          disabled={saving}
          className="self-start"
        >
          {saving
            ? <><Loader2 size={14} className="mr-2 animate-spin" />Saving…</>
            : saved
            ? <><Check size={14} className="mr-2" />Saved!</>
            : 'Save Branding'
          }
        </WobblyButton>
      </div>

      {/* ── Live Preview ──────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Eye size={13} className="text-ink/40" />
          <span className="font-body text-xs text-ink/50 uppercase tracking-wider">Live Preview</span>
        </div>
        <div
          className="relative border-2 border-ink/15 bg-muted/30 p-4"
          style={{ borderRadius: '20px 5px 20px 5px / 5px 20px 5px 20px' }}
        >
          <PortalPreview brand={brand} agencyName={agencyName} />
          <p className="font-body text-xs text-ink/30 text-center mt-3">
            This is how your clients will see the portal
          </p>
        </div>
      </div>
    </div>
  )
}
