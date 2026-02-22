'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Trash2, ArrowRight, ArrowLeft, Check,
  ChevronDown, ChevronUp, Zap, Calendar, Bell,
  LayoutTemplate, ToggleLeft, ToggleRight,
} from 'lucide-react'
import Image from 'next/image'
import { WobblyButton, WobblyCard, WobblyCardContent } from '@/components/ui'
import { cn } from '@/lib/utils'
import { capture, EVENTS } from '@/lib/posthog'

//  Types 
type RequestType = 'file' | 'text' | 'password' | 'multiple_choice' | 'url' | 'custom'

interface AssetItem {
  id: string
  title: string
  description: string
  request_type: RequestType
  required: boolean
  allowed_file_types: string[]
  max_size_mb: number
  custom_instructions: string
  naming_rule: boolean
  quantity: number
}

interface ProjectForm {
  title: string
  client_name: string
  client_email: string
  notes: string
  due_date: string
  buffer_days: number
  auto_reminder: boolean
  global_naming_rule: boolean
  contact_method: 'email' | 'whatsapp' | ''
  contact_value: string
  freelancer_niche: string
}

// Helper: subtract buffer from ISO date → locale string
function clientDate(iso: string, bufferDays: number): string {
  const d = new Date(iso)
  d.setDate(d.getDate() - bufferDays)
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
}
function fmtIso(iso: string): string {
  return new Date(iso).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
}

//  Constants 
const REQUEST_TYPES: { value: RequestType; label: string; emoji: string }[] = [
  { value: 'file',            label: 'File Upload',    emoji: '' },
  { value: 'text',            label: 'Text Input',     emoji: '' },
  { value: 'url',             label: 'URL / Link',     emoji: '' },
  { value: 'password',        label: 'Password/Token', emoji: '' },
  { value: 'multiple_choice', label: 'Multiple Choice',emoji: '' },
  { value: 'custom',          label: 'Custom Request', emoji: '✏️' },
]

const FILE_TYPES = ['SVG', 'PNG', 'JPG', 'PDF', 'AI', 'EPS', 'DOCX', 'MP4', 'ZIP']

const SIZE_OPTIONS = [
  { label: '5 MB',   value: 5 },
  { label: '50 MB',  value: 50 },
  { label: '500 MB', value: 500 },
  { label: '2 GB',   value: 2048 },
]

// Niche quick-select options — each maps to a starter template
const NICHE_OPTS = [
  { label: 'Design Agency',   icon: '🎨', template: 'web'      },
  { label: 'Branding Studio', icon: '✨', template: 'branding' },
  { label: 'Social Media',    icon: '📱', template: 'social'   },
  { label: 'Copywriter',      icon: '✍️', template: 'none'     },
  { label: 'Video Editor',    icon: '🎬', template: 'none'     },
  { label: 'Developer',       icon: '💻', template: 'none'     },
  { label: 'Photographer',    icon: '📷', template: 'none'     },
  { label: 'Musician',        icon: '🎵', template: 'none'     },
] as const

const TEMPLATES: Record<string, { label: string; emoji: string; assets: Partial<AssetItem>[] }> = {
  none: { label: 'No template', emoji: '', assets: [] },
  web: {
    label: 'Web Design Pack',
    emoji: '',
    assets: [
      { title: 'Logo Files', request_type: 'file', allowed_file_types: ['SVG', 'PNG'], max_size_mb: 50, required: true, custom_instructions: 'Please provide SVG and high-res PNG (2x).' },
      { title: 'Brand Color Palette', request_type: 'file', allowed_file_types: ['PDF', 'PNG'], max_size_mb: 5, required: true, custom_instructions: 'Include HEX/RGB values.' },
      { title: 'Website Copy', request_type: 'file', allowed_file_types: ['DOCX', 'PDF'], max_size_mb: 5, required: true, custom_instructions: 'All page copy in a single document.' },
      { title: 'Domain Credentials', request_type: 'text', allowed_file_types: [], max_size_mb: 50, required: false, custom_instructions: 'Registrar login details or DNS access.' },
    ],
  },
  branding: {
    label: 'Branding Kit',
    emoji: '',
    assets: [
      { title: 'Logo (Vector)', request_type: 'file', allowed_file_types: ['SVG', 'AI', 'EPS'], max_size_mb: 50, required: true, custom_instructions: 'Must be vector format. Include source files.' },
      { title: 'Color Palette', request_type: 'file', allowed_file_types: ['PDF', 'PNG'], max_size_mb: 5, required: true, custom_instructions: 'HEX, CMYK, and Pantone values.' },
      { title: 'Typography Guide', request_type: 'file', allowed_file_types: ['PDF'], max_size_mb: 5, required: true, custom_instructions: 'Font names, weights, and usage rules.' },
      { title: 'Brand Guidelines', request_type: 'file', allowed_file_types: ['PDF'], max_size_mb: 50, required: false, custom_instructions: 'Full brand guidelines document if available.' },
    ],
  },
  social: {
    label: 'Social Media Pack',
    emoji: '',
    assets: [
      { title: 'Profile Photo', request_type: 'file', allowed_file_types: ['JPG', 'PNG'], max_size_mb: 5, required: true, custom_instructions: 'Square format, minimum 500x500px.' },
      { title: 'Cover / Banner Image', request_type: 'file', allowed_file_types: ['JPG', 'PNG'], max_size_mb: 5, required: true, custom_instructions: '1500x500px recommended.' },
      { title: 'Bio / About Text', request_type: 'text', allowed_file_types: [], max_size_mb: 5, required: true, custom_instructions: 'Max 160 characters for Twitter/X.' },
    ],
  },
}

//  AI Smart Suggest 
function aiSuggest(title: string, item: AssetItem): Partial<AssetItem> {
  const t = title.toLowerCase()
  if (t.includes('logo') || t.includes('icon')) {
    return { allowed_file_types: ['SVG', 'AI', 'EPS'], custom_instructions: 'Must be vector format. Include SVG and AI source file.' }
  }
  if (t.includes('web') || t.includes('site') || t.includes('banner')) {
    return { allowed_file_types: ['SVG', 'PNG', 'JPG'], custom_instructions: 'Export at 2x resolution for retina displays.' }
  }
  if (t.includes('brand') || t.includes('guideline') || t.includes('style')) {
    return { allowed_file_types: ['SVG', 'AI', 'PDF'], custom_instructions: 'Include both source files and print-ready PDF.' }
  }
  if (t.includes('photo') || t.includes('image') || t.includes('headshot')) {
    return { allowed_file_types: ['JPG', 'PNG'], custom_instructions: 'Minimum 300 DPI for print quality.' }
  }
  if (t.includes('contract') || t.includes('legal') || t.includes('agreement')) {
    return { allowed_file_types: ['PDF', 'DOCX'], custom_instructions: 'Must be signed. PDF preferred.' }
  }
  return { allowed_file_types: ['PNG', 'JPG', 'PDF'], custom_instructions: 'Please provide in the highest quality available.' }
}

//  Helpers 
function uid() { return Math.random().toString(36).slice(2, 9) }

function makeAsset(partial: Partial<AssetItem> = {}): AssetItem {
  return {
    id: uid(),
    title: '',
    description: '',
    request_type: 'file',
    required: true,
    allowed_file_types: [],
    max_size_mb: 50,
    custom_instructions: '',
    naming_rule: false,
    quantity: 1,
    ...partial,
  }
}

//  Step dot 
function StepDot({ n, active, done }: { n: number; active: boolean; done: boolean }) {
  return (
    <div
      className={cn(
        'w-8 h-8 flex items-center justify-center border-2 border-ink font-heading text-sm transition-all',
        done  ? 'bg-ink text-paper' : '',
        active ? 'bg-paper text-ink shadow-hard' : '',
        !active && !done ? 'bg-muted text-ink/40 border-ink/20' : ''
      )}
      style={{ borderRadius: '12px 3px 12px 3px / 3px 12px 3px 12px' }}
    >
      {done ? <Check size={14} /> : n}
    </div>
  )
}

//  Toggle component 
function WobblyToggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer select-none w-fit">
      <div
        className={cn('relative border-2 border-ink transition-colors', on ? 'bg-ink' : 'bg-paper')}
        style={{ borderRadius: '20px', width: 36, height: 20 }}
        onClick={() => onChange(!on)}
      >
        <span
          className="absolute top-[2px] w-3.5 h-3.5 bg-paper border border-ink/30 transition-all"
          style={{ borderRadius: '50%', left: on ? 'calc(100% - 17px)' : '2px' }}
        />
      </div>
      <span className="font-body text-sm text-ink/70">{label}</span>
    </label>
  )
}

//  STEP 1: Basics + Deadline + Templates 
function StepBasics({
  form, onChange,
  template, onTemplate,
}: {
  form: ProjectForm
  onChange: (f: ProjectForm) => void
  template: string
  onTemplate: (t: string, assets: AssetItem[]) => void
}) {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [customNiche, setCustomNiche]   = useState('')
  const [showCustomNiche, setShowCustomNiche] = useState(false)

  function set(key: keyof ProjectForm, val: string | boolean | number) {
    onChange({ ...form, [key]: val })
  }

  function loadTemplate(key: string) {
    const tpl = TEMPLATES[key]
    if (!tpl) return
    onTemplate(key, key === 'none' ? [] : tpl.assets.map((a) => makeAsset(a)))
  }

  function selectNiche(label: string, tmpl: string) {
    set('freelancer_niche', label)
    // Auto-load the matching template only if no template chosen yet
    if (template === 'none' && tmpl !== 'none') loadTemplate(tmpl)
  }

  function confirmCustomNiche() {
    const label = customNiche.trim()
    if (!label) return
    set('freelancer_niche', label)
    setShowCustomNiche(false)
    setCustomNiche('')
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-heading text-2xl text-ink">Project basics</h2>
      <p className="font-body text-sm text-ink/55">Give your project a name and tell us about the client.</p>

      {/* Freelancer niche quick-select */}
      <div className="flex flex-col gap-1.5">
        <label className="font-body text-xs text-ink/50 uppercase tracking-wider">Your niche / specialty</label>
        <div className="flex flex-wrap gap-2">
          {NICHE_OPTS.map(n => (
            <button
              key={n.label}
              type="button"
              onClick={() => selectNiche(n.label, n.template)}
              className={cn(
                'font-body text-xs px-3 py-1.5 border-2 transition-all flex items-center gap-1.5',
                form.freelancer_niche === n.label
                  ? 'bg-ink text-paper border-ink'
                  : 'bg-paper text-ink border-ink/25 hover:border-ink'
              )}
              style={{ borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px', boxShadow: '2px 2px 0 0 #2d2d2d' }}
            >
              {n.icon} {n.label}
            </button>
          ))}
          {/* Custom niche */}
          {showCustomNiche ? (
            <div className="flex items-center gap-1">
              <input
                autoFocus
                value={customNiche}
                onChange={e => setCustomNiche(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') confirmCustomNiche(); if (e.key === 'Escape') { setShowCustomNiche(false); setCustomNiche('') } }}
                placeholder="e.g. Architect, Coach…"
                className="w-36 px-2 py-1 border-2 border-ink/30 font-body text-xs outline-none focus:border-ink bg-paper"
                style={{ borderRadius: '8px' }}
              />
              <button type="button" onClick={confirmCustomNiche}
                className="font-body text-xs px-2 py-1 bg-ink text-paper border-2 border-ink"
                style={{ borderRadius: '8px' }}
              >✓</button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowCustomNiche(true)}
              className={cn(
                'font-body text-xs px-3 py-1.5 border-2 border-dashed flex items-center gap-1.5 transition-all',
                !NICHE_OPTS.some(n => n.label === form.freelancer_niche) && form.freelancer_niche
                  ? 'bg-ink text-paper border-ink'
                  : 'border-ink/30 text-ink/50 hover:border-ink hover:text-ink'
              )}
              style={{ borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px' }}
            >
              <Plus size={11} />
              {!NICHE_OPTS.some(n => n.label === form.freelancer_niche) && form.freelancer_niche
                ? form.freelancer_niche
                : 'Other'}
            </button>
          )}
        </div>
      </div>

      {/* Template loader */}
      <div className="flex flex-col gap-1.5">
        <label className="font-body text-xs text-ink/50 uppercase tracking-wider flex items-center gap-1.5">
          <LayoutTemplate size={12} /> Load a starter template
        </label>
        <div className="flex flex-wrap gap-2">
          {Object.entries(TEMPLATES).map(([key, tpl]) => (
            <button
              key={key}
              type="button"
              onClick={() => loadTemplate(key)}
              className={cn(
                'font-body text-xs px-3 py-1.5 border-2 border-ink/25 transition-all hover:border-ink',
                template === key && key !== 'none' ? 'bg-ink text-paper border-ink' : 'bg-paper text-ink'
              )}
              style={{ borderRadius: '180px 45px 200px 35px / 40px 190px 30px 170px', boxShadow: '2px 2px 0 0 #2d2d2d' }}
            >
              {tpl.emoji} {tpl.label}
            </button>
          ))}
        </div>
      </div>

      {/* Core fields */}
      {[
        { key: 'title'        as const, label: 'Project name *', placeholder: 'Acme Rebrand 2026', type: 'text' },
        { key: 'client_name'  as const, label: 'Client name',    placeholder: 'Acme Corp',          type: 'text' },
        { key: 'client_email' as const, label: 'Client email',   placeholder: 'hello@acme.com',     type: 'email' },
      ].map(({ key, label, placeholder, type }) => (
        <div key={key} className="flex flex-col gap-1">
          <label className="font-body text-sm text-ink/70" htmlFor={key}>{label}</label>
          <input
            id={key}
            type={type}
            value={form[key] as string}
            onChange={(e) => set(key, e.target.value)}
            placeholder={placeholder}
            className="w-full px-4 py-2.5 font-body text-sm text-ink bg-paper border-2 border-ink/60 outline-none focus:border-ink transition-all"
            style={{ borderRadius: '220px 30px 240px 20px / 25px 230px 20px 215px' }}
          />
        </div>
      ))}

      {/* Notes */}
      <div className="flex flex-col gap-1">
        <label className="font-body text-sm text-ink/70" htmlFor="notes">Internal notes</label>
        <textarea
          id="notes"
          rows={2}
          value={form.notes}
          onChange={(e) => set('notes', e.target.value)}
          placeholder="Brief notes about this project"
          className="w-full px-4 py-2.5 font-body text-sm text-ink bg-paper border-2 border-ink/60 outline-none focus:border-ink transition-all resize-none"
          style={{ borderRadius: '20px 5px 20px 5px / 5px 20px 5px 20px' }}
        />
      </div>

      {/* Client Support */}
      <div
        className="flex flex-col gap-3 p-4 bg-[#f0fbff] border-2 border-ink/10"
        style={{ borderRadius: '20px 5px 20px 5px / 5px 20px 5px 20px' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-base">💬</span>
          <p className="font-body text-sm text-ink font-semibold">Client Support <span className="font-normal text-ink/45">(optional)</span></p>
        </div>
        <p className="font-body text-xs text-ink/50 -mt-1">
          Give your client a way to reach you directly from the portal. A &ldquo;Got a question?&rdquo; card will appear after 5 seconds.
        </p>
        <div className="flex flex-col gap-1">
          <label className="font-body text-xs text-ink/50 uppercase tracking-wider">Contact Method</label>
          <div className="flex gap-2">
            {([['', 'None'], ['email', '✉️ Email'], ['whatsapp', '📱 WhatsApp']] as const).map(([val, label]) => (
              <button
                key={val}
                type="button"
                onClick={() => set('contact_method', val)}
                className={cn(
                  'font-body text-xs px-3 py-1.5 border-2 transition-all',
                  form.contact_method === val
                    ? 'bg-ink text-paper border-ink'
                    : 'bg-paper text-ink border-ink/25 hover:border-ink'
                )}
                style={{ borderRadius: '180px 45px 200px 35px / 40px 190px 30px 170px', boxShadow: '2px 2px 0 0 #2d2d2d' }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        {form.contact_method !== '' && (
          <div className="flex flex-col gap-1">
            <label className="font-body text-xs text-ink/50 uppercase tracking-wider" htmlFor="contact_value">
              {form.contact_method === 'whatsapp' ? 'WhatsApp number (with country code)' : 'Your email address'}
            </label>
            <input
              id="contact_value"
              type={form.contact_method === 'email' ? 'email' : 'tel'}
              value={form.contact_value}
              onChange={(e) => set('contact_value', e.target.value)}
              placeholder={form.contact_method === 'whatsapp' ? '+44 7700 900123' : 'you@studio.com'}
              className="w-full px-4 py-2.5 font-body text-sm text-ink bg-paper border-2 border-ink/60 outline-none focus:border-ink transition-all"
              style={{ borderRadius: '220px 30px 240px 20px / 25px 230px 20px 215px' }}
            />
            <p className="font-body text-xs text-ink/40">
              {form.contact_method === 'whatsapp'
                ? 'Client taps a button → opens WhatsApp chat with you pre-filled.'
                : 'Client taps a button → opens their mail app with subject pre-filled.'}
            </p>
          </div>
        )}
      </div>

      {/* Advanced settings toggle */}
      <button
        type="button"
        onClick={() => setShowAdvanced((p) => !p)}
        className="flex items-center gap-1.5 font-body text-sm text-ink/50 hover:text-ink transition-colors w-fit"
      >
        {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        Deadline & automation settings
      </button>

      <AnimatePresence initial={false}>
        {showAdvanced && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: 'hidden' }}
          >
            <div
              className="flex flex-col gap-4 p-4 bg-muted/40 border-2 border-ink/10"
              style={{ borderRadius: '20px 5px 20px 5px / 5px 20px 5px 20px' }}
            >
              {/* Deadline */}
              <div className="flex flex-col gap-1">
                <label className="font-body text-sm text-ink/70 flex items-center gap-1.5" htmlFor="due_date">
                  <Calendar size={13} /> Deadline (optional)
                </label>
                <input
                  id="due_date"
                  type="date"
                  value={form.due_date}
                  onChange={(e) => set('due_date', e.target.value)}
                  className="w-full px-4 py-2.5 font-body text-sm text-ink bg-paper border-2 border-ink/60 outline-none focus:border-ink transition-all"
                  style={{ borderRadius: '220px 30px 240px 20px / 25px 230px 20px 215px' }}
                />
              </div>

              {/* Deadline Buffer Slider */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Image src="/paperclip1.png" alt="" width={20} height={20} style={{ mixBlendMode: 'multiply' }} />
                  <label className="font-body text-sm text-ink/70 flex-1">
                    Strategic Buffer
                  </label>
                  <span
                    className="font-heading text-base text-ink px-2 py-0.5 bg-[#fffde7] border border-ink/20"
                    style={{ borderRadius: '20px' }}
                    title="Müşteriye daha erken bir tarih göstererek kendinize nefes payı bırakın."
                  >
                    {form.buffer_days} gün
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={7}
                  value={form.buffer_days}
                  onChange={(e) => set('buffer_days', parseInt(e.target.value))}
                  className="w-full accent-ink"
                />
                {form.buffer_days > 0 && form.due_date && (
                  <div
                    className="p-3 bg-[#fffde7] border-2 border-ink/20 font-body text-xs text-ink"
                    style={{ borderRadius: '180px 45px 200px 35px / 40px 190px 30px 170px' }}
                  >
                    <span className="text-base mr-1">😉</span>
                    <strong>Müşteriye söylenen:</strong> {clientDate(form.due_date, form.buffer_days)}{' '}
                    &mdash; Gerçek deadline: {fmtIso(form.due_date)}<br />
                    <span className="text-ink/50">
                      {form.buffer_days} günlük nefes payı bıraktınız. Müşteri daha erken tarihi görüyor.
                    </span>
                  </div>
                )}
                {form.buffer_days === 0 && (
                  <p className="font-body text-xs text-ink/40">Slide to add a strategic buffer — client sees an earlier date. 😉</p>
                )}
              </div>

              {/* Auto-reminder */}
              <div
                className="flex items-start gap-3 p-3 bg-[#fffde7] border-2 border-ink/20"
                style={{ borderRadius: '180px 45px 200px 35px / 40px 190px 30px 170px' }}
              >
                <Bell size={16} className="text-ink/40 flex-shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1.5 flex-1">
                  <WobblyToggle
                    on={form.auto_reminder}
                    onChange={(v) => set('auto_reminder', v)}
                    label="Enable The Nudger"
                  />
                  <p className="font-body text-xs text-ink/50">
                    Auto-remind your client 24 h before the deadline. Let us chase them for you.
                  </p>
                </div>
              </div>

              {/* Global naming rule */}
              <div
                className="flex items-start gap-3 p-3 bg-[#f0fdf4] border-2 border-green-200"
                style={{ borderRadius: '180px 45px 200px 35px / 40px 190px 30px 170px' }}
              >
                <span className="text-lg leading-none flex-shrink-0"></span>
                <div className="flex flex-col gap-1.5 flex-1">
                  <WobblyToggle
                    on={form.global_naming_rule}
                    onChange={(v) => set('global_naming_rule', v)}
                    label="Professional File Renaming"
                  />
                  <p className="font-body text-xs text-ink/50">
                    When ON, all uploads are automatically renamed to:{' '}
                    <em>{form.client_name || 'ClientName'}_{'{AssetName}'}_{'{'}{new Date().toISOString().slice(0, 10)}{'}'}.ext</em>
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

//  STEP 2: Smart Asset Checklist 
function StepAssets({
  items, onChange, projectTitle,
}: {
  items: AssetItem[]
  onChange: (i: AssetItem[]) => void
  projectTitle: string
}) {
  const [expandedId, setExpandedId]               = useState<string | null>(null)
  const [aiLoading, setAiLoading]                   = useState<string | null>(null)
  const [customTypeInput, setCustomTypeInput]       = useState<Record<string, string>>({})
  const [showCustomType, setShowCustomType]         = useState<Record<string, boolean>>({})

  function toggleCustomTypeInput(id: string, show: boolean) {
    setShowCustomType(prev => ({ ...prev, [id]: show }))
    if (!show) setCustomTypeInput(prev => ({ ...prev, [id]: '' }))
  }

  function addCustomFileType(item: AssetItem) {
    const val = (customTypeInput[item.id] ?? '').trim().toUpperCase().replace(/^\./, '')
    if (!val) return
    if (!item.allowed_file_types.includes(val)) {
      update(item.id, { allowed_file_types: [...item.allowed_file_types, val] })
    }
    toggleCustomTypeInput(item.id, false)
  }

  function add() {
    const newItem = makeAsset()
    onChange([...items, newItem])
    setExpandedId(newItem.id)
  }

  function update(id: string, patch: Partial<AssetItem>) {
    onChange(items.map((it) => (it.id === id ? { ...it, ...patch } : it)))
  }

  function remove(id: string) {
    onChange(items.filter((it) => it.id !== id))
    if (expandedId === id) setExpandedId(null)
  }

  function toggleFileType(item: AssetItem, type: string) {
    const current = item.allowed_file_types
    const next = current.includes(type)
      ? current.filter((t) => t !== type)
      : [...current, type]
    update(item.id, { allowed_file_types: next })
  }

  async function handleAiSuggest(item: AssetItem) {
    setAiLoading(item.id)
    // Simulate a 1.2s mock call
    await new Promise((r) => setTimeout(r, 1200))
    const suggestion = aiSuggest(projectTitle, item)
    update(item.id, suggestion)
    setAiLoading(null)
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="font-heading text-2xl text-ink">Smart asset checklist</h2>
        <p className="font-body text-sm text-ink/55">
          Define exactly what your client needs to deliver  with file type rules, size limits, and AI-powered suggestions.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {items.map((item, idx) => {
          const isExpanded = expandedId === item.id
          const isAiLoading = aiLoading === item.id

          return (
            <div
              key={item.id}
              className={cn('border-2 border-ink/20 overflow-hidden transition-all', isExpanded ? 'border-ink/60' : '')}
              style={{
                borderRadius: '20px 5px 20px 5px / 5px 20px 5px 20px',
                boxShadow: isExpanded ? '4px 4px 0 0 #2d2d2d' : '2px 2px 0 0 rgba(45,45,45,0.2)',
              }}
            >
              {/* Header row */}
              <div
                className="flex items-center gap-2 px-3 py-2.5 bg-paper cursor-pointer"
                onClick={() => setExpandedId(isExpanded ? null : item.id)}
              >
                <span className="font-body text-base text-ink/30 w-5 text-center flex-shrink-0">
                  {REQUEST_TYPES.find((t) => t.value === item.request_type)?.emoji ?? ''}
                </span>
                <span className="flex-1 font-body text-sm text-ink truncate">
                  {item.title || <span className="text-ink/35 italic">Asset {idx + 1}</span>}
                </span>
                {item.quantity > 1 && (
                  <span className="font-body text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 flex-shrink-0" style={{ borderRadius: '255px' }}>
                    ×{item.quantity}
                  </span>
                )}
                {item.required && (
                  <span className="font-body text-[10px] text-accent border border-accent/40 px-1.5 py-0.5 flex-shrink-0" style={{ borderRadius: '255px' }}>
                    required
                  </span>
                )}
                {item.request_type !== 'custom' && item.allowed_file_types.length > 0 && (
                  <span className="font-body text-[10px] text-ink/40 flex-shrink-0 hidden sm:block">
                    {item.allowed_file_types.slice(0, 3).join(', ')}{item.allowed_file_types.length > 3 ? '' : ''}
                  </span>
                )}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); remove(item.id) }}
                  className="p-1 text-ink/25 hover:text-accent transition-colors flex-shrink-0"
                >
                  <Trash2 size={13} />
                </button>
                {isExpanded ? <ChevronUp size={13} className="text-ink/40" /> : <ChevronDown size={13} className="text-ink/40" />}
              </div>

              {/* Expanded body */}
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    transition={{ duration: 0.22 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div className="flex flex-col gap-3 px-3 pb-4 pt-1 border-t-2 border-dashed border-ink/10 bg-muted/20">
                      {/* Type + Title */}
                      <div className="flex gap-2">
                        <select
                          value={item.request_type}
                          onChange={(e) => update(item.id, { request_type: e.target.value as RequestType })}
                          className="font-body text-xs text-ink bg-paper border-2 border-ink/40 px-2 py-1.5 outline-none"
                          style={{ borderRadius: '12px 3px 12px 3px / 3px 12px 3px 12px' }}
                        >
                          {REQUEST_TYPES.map(({ value, label, emoji }) => (
                            <option key={value} value={value}>{emoji} {label}</option>
                          ))}
                        </select>
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => update(item.id, { title: e.target.value })}
                          placeholder={`Asset name`}
                          className="flex-1 min-w-0 px-3 py-1.5 font-body text-sm text-ink bg-paper border-2 border-ink/40 outline-none focus:border-ink transition-all"
                          style={{ borderRadius: '12px 3px 12px 3px / 3px 12px 3px 12px' }}
                        />
                      </div>

                      {/* Quantity stepper */}
                      <div className="flex items-center gap-3">
                        <span className="font-body text-xs text-ink/50 uppercase tracking-wider">Quantity</span>
                        <div className="flex items-center gap-1.5 ml-auto">
                          <button
                            type="button"
                            onClick={() => update(item.id, { quantity: Math.max(1, item.quantity - 1) })}
                            disabled={item.quantity <= 1}
                            className="w-6 h-6 flex items-center justify-center border-2 border-ink/40 font-body text-sm text-ink hover:border-ink disabled:opacity-30 transition-all"
                            style={{ borderRadius: '8px 2px 8px 2px / 2px 8px 2px 8px' }}
                          >−</button>
                          <span className="font-heading text-base text-ink w-5 text-center">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => update(item.id, { quantity: Math.min(10, item.quantity + 1) })}
                            disabled={item.quantity >= 10}
                            className="w-6 h-6 flex items-center justify-center border-2 border-ink/40 font-body text-sm text-ink hover:border-ink disabled:opacity-30 transition-all"
                            style={{ borderRadius: '8px 2px 8px 2px / 2px 8px 2px 8px' }}
                          >+</button>
                        </div>
                        {item.quantity > 1 && (
                          <p className="font-body text-xs text-blue-600">{item.quantity} separate upload slots will be created</p>
                        )}
                      </div>

                      {/* AI Suggest button  only for file type */}
                      {item.request_type === 'file' && (
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-body text-xs text-ink/50 uppercase tracking-wider">Allowed file types</span>
                            <button
                              type="button"
                              onClick={() => handleAiSuggest(item)}
                              disabled={isAiLoading}
                              className="ml-auto flex items-center gap-1.5 px-2.5 py-1 font-body text-xs text-paper bg-ink border-2 border-ink disabled:opacity-50 transition-all hover:bg-ink/80"
                              style={{ borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px', boxShadow: '2px 2px 0 0 #2d2d2d' }}
                            >
                              {isAiLoading ? (
                                <>
                                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                                    <Image src="/meta-llama.png" alt="AI" width={12} height={12} className="invert" />
                                  </motion.div>
                                  Thinking
                                </>
                              ) : (
                                <>
                                  <Image src="/meta-llama.png" alt="AI" width={12} height={12} className="invert" />
                                   AI Suggest
                                </>
                              )}
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {FILE_TYPES.map((type) => {
                              const selected = item.allowed_file_types.includes(type)
                              return (
                                <button
                                  key={type}
                                  type="button"
                                  onClick={() => toggleFileType(item, type)}
                                  className={cn(
                                    'font-body text-xs px-2.5 py-1 border-2 transition-all',
                                    selected
                                      ? 'bg-ink text-paper border-ink'
                                      : 'bg-paper text-ink/50 border-ink/20 hover:border-ink/50'
                                  )}
                                  style={{ borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px' }}
                                >
                                  {selected && <span className="mr-1">✓</span>}{type}
                                </button>
                              )
                            })}

                            {/* Custom file type badges (purple, click to remove) */}
                            {item.allowed_file_types
                              .filter(t => !FILE_TYPES.includes(t))
                              .map(t => (
                                <button
                                  key={t}
                                  type="button"
                                  onClick={() => update(item.id, { allowed_file_types: item.allowed_file_types.filter(x => x !== t) })}
                                  className="font-body text-xs px-2.5 py-1 border-2 bg-[#7c3aed] text-white border-[#7c3aed]"
                                  style={{ borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px' }}
                                  title="Click to remove"
                                >
                                  .{t.toLowerCase()} ✕
                                </button>
                              ))
                            }

                            {/* Add custom extension */}
                            {showCustomType[item.id] ? (
                              <div className="flex items-center gap-1">
                                <input
                                  autoFocus
                                  value={customTypeInput[item.id] ?? ''}
                                  onChange={e => setCustomTypeInput(prev => ({ ...prev, [item.id]: e.target.value }))}
                                  onKeyDown={e => {
                                    if (e.key === 'Enter') addCustomFileType(item)
                                    if (e.key === 'Escape') toggleCustomTypeInput(item.id, false)
                                  }}
                                  placeholder=".ext"
                                  className="w-20 px-2 py-1 border-2 border-ink/30 font-body text-xs outline-none focus:border-ink bg-paper"
                                  style={{ borderRadius: '8px' }}
                                />
                                <button type="button" onClick={() => addCustomFileType(item)}
                                  className="font-body text-xs px-2 py-1 bg-ink text-paper border-2 border-ink"
                                  style={{ borderRadius: '8px' }}
                                >Add</button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => toggleCustomTypeInput(item.id, true)}
                                className="font-body text-xs px-2.5 py-1 border-2 border-dashed border-ink/30 text-ink/50 flex items-center gap-1 hover:border-ink hover:text-ink transition-colors"
                                style={{ borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px' }}
                              >
                                <Plus size={10} /> custom
                              </button>
                            )}
                          </div>

                          {/* Size limit */}
                          <div className="flex items-center gap-2">
                            <span className="font-body text-xs text-ink/50 w-20 flex-shrink-0">Max size</span>
                            <div className="flex gap-1.5 flex-wrap">
                              {SIZE_OPTIONS.map((opt) => (
                                <button
                                  key={opt.value}
                                  type="button"
                                  onClick={() => update(item.id, { max_size_mb: opt.value })}
                                  className={cn(
                                    'font-body text-xs px-2.5 py-1 border-2 transition-all',
                                    item.max_size_mb === opt.value
                                      ? 'bg-ink text-paper border-ink'
                                      : 'bg-paper text-ink/50 border-ink/20 hover:border-ink/50'
                                  )}
                                  style={{ borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px' }}
                                >
                                  {opt.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Custom request type notice */}
                      {item.request_type === 'custom' && (
                        <div
                          className="p-3 bg-[#fffde7] border-2 border-ink/20 font-body text-xs text-ink/70"
                          style={{ borderRadius: '12px 3px 12px 3px / 3px 12px 3px 12px' }}
                        >
                          ✏️ <strong>Custom request</strong> — describe what you need in the instructions below. The client can upload any file type or paste text.
                        </div>
                      )}

                      {/* Custom instructions */}
                      <div className="flex flex-col gap-1">
                        <label className="font-body text-xs text-ink/50 uppercase tracking-wider">Custom instructions for client</label>
                        <textarea
                          rows={2}
                          value={item.custom_instructions}
                          onChange={(e) => update(item.id, { custom_instructions: e.target.value })}
                          placeholder="e.g. Must be vector format, transparent background"
                          className="w-full px-3 py-2 font-body text-xs text-ink bg-paper border border-ink/25 outline-none focus:border-ink/60 transition-all resize-none"
                          style={{ borderRadius: '8px 2px 8px 2px / 2px 8px 2px 8px' }}
                        />
                      </div>

                      {/* Per-asset naming rule + required */}
                      <div className="flex items-center gap-4 flex-wrap">
                        <WobblyToggle
                          on={item.required}
                          onChange={(v) => update(item.id, { required: v })}
                          label="Required"
                        />
                        <WobblyToggle
                          on={item.naming_rule}
                          onChange={(v) => update(item.id, { naming_rule: v })}
                          label="Auto-rename this file"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>

      <WobblyButton type="button" variant="secondary" size="sm" onClick={add} className="self-start">
        <Plus size={14} className="mr-1.5" /> Add asset
      </WobblyButton>

      {items.length === 0 && (
        <div
          className="py-8 text-center border-2 border-dashed border-ink/15"
          style={{ borderRadius: '20px 5px 20px 5px / 5px 20px 5px 20px' }}
        >
          <p className="font-body text-xs text-ink/40">No assets yet  add one or load a template.</p>
        </div>
      )}
    </div>
  )
}

//  STEP 3: Review 
function StepReview({ form, items }: { form: ProjectForm; items: AssetItem[] }) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-heading text-2xl text-ink">Review & create</h2>
      <p className="font-body text-sm text-ink/55">Check everything before generating the magic link.</p>

      <div
        className="p-5 bg-muted/30 border-2 border-ink/15 flex flex-col gap-4"
        style={{ borderRadius: '20px 5px 20px 5px / 5px 20px 5px 20px' }}
      >
        <div>
          <p className="font-body text-xs text-ink/40 uppercase tracking-wider mb-0.5">Project</p>
          <p className="font-heading text-xl text-ink">{form.title}</p>
          {form.notes && <p className="font-body text-sm text-ink/55 mt-0.5">{form.notes}</p>}
        </div>

        {(form.client_name || form.client_email) && (
          <div>
            <p className="font-body text-xs text-ink/40 uppercase tracking-wider mb-0.5">Client</p>
            <p className="font-body text-sm text-ink">{form.client_name}</p>
            {form.client_email && <p className="font-body text-xs text-ink/50">{form.client_email}</p>}
          </div>
        )}

        {form.contact_method && form.contact_value && (
          <div>
            <p className="font-body text-xs text-ink/40 uppercase tracking-wider mb-0.5">Client Support</p>
            <p className="font-body text-sm text-ink">
              {form.contact_method === 'whatsapp' ? '📱 WhatsApp' : '✉️ Email'}: {form.contact_value}
            </p>
          </div>
        )}

        {form.due_date && (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Calendar size={13} className="text-ink/40" />
              {(form.buffer_days ?? 0) > 0 ? (
                <p className="font-body text-sm text-ink">
                  <span className="font-semibold">Müşteriye Söylenen:</span>{' '}
                  {clientDate(form.due_date, form.buffer_days)}{' '}
                  <span className="text-ink/45">(Gerçek: {fmtIso(form.due_date)})</span>
                </p>
              ) : (
                <p className="font-body text-sm text-ink">Deadline: <strong>{form.due_date}</strong></p>
              )}
              {form.auto_reminder && (
                <span className="font-body text-xs text-green-700 bg-green-50 border border-green-200 px-2 py-0.5" style={{ borderRadius: '255px' }}>
                  🔔 Nudger ON
                </span>
              )}
            </div>
          </div>
        )}

        {form.global_naming_rule && (
          <div className="flex items-center gap-2">
            <span className="text-sm"></span>
            <p className="font-body text-xs text-ink/60">Auto-rename enabled for all files</p>
          </div>
        )}

        <div>
          <p className="font-body text-xs text-ink/40 uppercase tracking-wider mb-1">
            Asset requests ({items.reduce((sum, it) => sum + (it.quantity ?? 1), 0)} total)
          </p>
          {items.length === 0 ? (
            <p className="font-body text-sm text-ink/40">None added.</p>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {items.map((it) => (
                <li key={it.id} className="font-body text-sm text-ink flex items-start gap-2">
                  <span className="text-ink/40 flex-shrink-0">
                    {REQUEST_TYPES.find((o) => o.value === it.request_type)?.emoji ?? ''}
                  </span>
                  <span className="flex-1">{it.title || <span className="italic text-ink/35">Unnamed</span>}</span>
                  {it.quantity > 1 && (
                    <span className="font-body text-xs font-bold text-blue-700 flex-shrink-0">×{it.quantity}</span>
                  )}
                  {it.request_type !== 'custom' && it.allowed_file_types.length > 0 && (
                    <span className="font-body text-xs text-ink/35">{it.allowed_file_types.join(', ')}</span>
                  )}
                  {it.required && <span className="text-xs text-accent ml-auto flex-shrink-0">required</span>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

//  Main wizard 
export default function NewProjectPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState('none')

  const [form, setForm] = useState<ProjectForm>({
    title: '', client_name: '', client_email: '', notes: '',
    due_date: '', buffer_days: 0, auto_reminder: false, global_naming_rule: false,
    contact_method: '', contact_value: '', freelancer_niche: '',
  })
  const [assets, setAssets] = useState<AssetItem[]>([])

  function handleTemplateLoad(key: string, templateAssets: AssetItem[]) {
    setSelectedTemplate(key)
    if (templateAssets.length > 0) setAssets(templateAssets)
  }

  function canAdvance() {
    if (step === 1) return form.title.trim().length > 0
    return true
  }

  async function handleCreate() {
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title.trim(),
          client_name: form.client_name.trim(),
          client_email: form.client_email.trim(),
          notes: form.notes.trim() || null,
          due_date: form.due_date || null,
          buffer_days: form.buffer_days,
          auto_reminder: form.auto_reminder,
          contact_method: form.contact_method || null,
          contact_value: form.contact_value.trim() || null,
          assets: assets.filter((a) => a.title.trim()).flatMap((a, i) => {
            // Expand quantity into N separate requests
            const dbType = a.request_type === 'custom' ? 'file' : a.request_type
            const count = Math.max(1, a.quantity ?? 1)
            return Array.from({ length: count }, (_, qi) => ({
              title: count > 1 ? `${a.title.trim()} (${qi + 1}/${count})` : a.title.trim(),
              description: a.description.trim() || null,
              request_type: dbType,
              required: a.required,
              sort_order: i * 10 + qi,
              allowed_file_types: a.request_type !== 'custom' && a.allowed_file_types.length > 0
                ? a.allowed_file_types.map((t) => t.toLowerCase())
                : null,
              max_file_size_mb: a.max_size_mb,
              custom_instructions: a.custom_instructions.trim() || null,
              naming_rule: a.naming_rule || form.global_naming_rule,
            }))
          }),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(res.status === 403 ? data.error + '  Upgrade in Settings.' : (data.error ?? 'Failed to create project.'))
        setSubmitting(false)
        return
      }
      capture(EVENTS.MAGIC_LINK_SENT, { projectId: data.project.id })
      router.push(`/projects/${data.project.id}`)
    } catch {
      setError('Unexpected error. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      <button
        onClick={() => router.back()}
        className="font-body text-sm text-ink/50 hover:text-ink mb-6 flex items-center gap-1 transition-colors"
      >
        <ArrowLeft size={14} /> Back
      </button>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map((n) => (
          <div key={n} className="flex items-center gap-2">
            <StepDot n={n} active={step === n} done={step > n} />
            {n < 3 && <div className={cn('h-0.5 w-10 transition-colors', step > n ? 'bg-ink' : 'bg-ink/20')} />}
          </div>
        ))}
        <span className="font-body text-xs text-ink/40 ml-2">Step {step} of 3</span>
      </div>

      <WobblyCard flavor="default" shadow="lg" radius="lg" rotate="-0.5">
        <WobblyCardContent className="p-7">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                <StepBasics form={form} onChange={setForm} template={selectedTemplate} onTemplate={handleTemplateLoad} />
              </motion.div>
            )}
            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                <StepAssets items={assets} onChange={setAssets} projectTitle={form.title} />
              </motion.div>
            )}
            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                <StepReview form={form} items={assets} />
              </motion.div>
            )}
          </AnimatePresence>

          {error && <p className="mt-4 font-body text-sm text-accent">{error}</p>}

          <div className="flex items-center justify-between mt-8">
            {step > 1 ? (
              <WobblyButton variant="secondary" size="sm" onClick={() => setStep((s) => s - 1)}>
                <ArrowLeft size={14} className="mr-1.5" /> Back
              </WobblyButton>
            ) : <span />}

            {step < 3 ? (
              <WobblyButton variant="primary" size="sm" disabled={!canAdvance()} onClick={() => setStep((s) => s + 1)}>
                Next <ArrowRight size={14} className="ml-1.5" />
              </WobblyButton>
            ) : (
              <WobblyButton variant="primary" size="md" loading={submitting} onClick={handleCreate}>
                {!submitting && <>Create Project </>}
              </WobblyButton>
            )}
          </div>
        </WobblyCardContent>
      </WobblyCard>
    </div>
  )
}
