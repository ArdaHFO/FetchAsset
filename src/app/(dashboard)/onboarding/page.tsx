import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { WobblyButton } from '@/components/ui'
import {
  UserCircle,
  FolderPlus,
  Palette,
  Share2,
  CheckCircle2,
  ArrowRight,
  Rocket,
  Sparkles,
  BookOpen,
  ExternalLink,
} from 'lucide-react'
import type { Profile } from '@/lib/supabase/types'

export const dynamic = 'force-dynamic'

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()

  // ── Fetch profile ──────────────────────────────────────────────
  const { data: profileRow } = await (admin as any)
    .from('profiles')
    .select('full_name, brand_color, logo_url, custom_welcome_msg, preferred_font')
    .eq('id', user.id)
    .single()

  const profile = profileRow as Partial<Profile> | null

  // ── Fetch projects count ───────────────────────────────────────
  const { count: projectCount } = await (admin as any)
    .from('projects')
    .select('id', { count: 'exact', head: true })
    .eq('owner_id', user.id)

  // ── Determine step completion ──────────────────────────────────
  const steps = [
    {
      id: 'profile',
      icon: UserCircle,
      title: 'Set your display name',
      description: 'Add your name or agency name so clients know who they\'re working with.',
      href: '/settings?tab=account',
      cta: 'Go to Account settings',
      done: !!profile?.full_name?.trim(),
      rotateCard: '-0.8deg',
      cardBg: '#fff9c4',
    },
    {
      id: 'branding',
      icon: Palette,
      title: 'Customise your portal',
      description: 'Pick a brand color and welcome message. Clients see this when they upload files.',
      href: '/settings?tab=branding',
      cta: 'Open Brand Hub',
      done: !!profile?.brand_color && profile.brand_color !== '#e63946',
      rotateCard: '0.6deg',
      cardBg: '#fce7f3',
    },
    {
      id: 'project',
      icon: FolderPlus,
      title: 'Create your first project',
      description: 'Add a client, enter a title, list the files you need. Done in under 2 minutes.',
      href: '/projects',
      cta: 'Create a project',
      done: (projectCount ?? 0) > 0,
      rotateCard: '-0.4deg',
      cardBg: '#dbeafe',
    },
    {
      id: 'share',
      icon: Share2,
      title: 'Share the magic link',
      description: 'Send the auto-generated portal link to your client. They upload — you review.',
      href: '/projects',
      cta: 'Open your projects',
      done: false,
      rotateCard: '0.9deg',
      cardBg: '#d1fae5',
    },
  ]

  const completedCount = steps.filter(s => s.done).length
  const allDone = completedCount === steps.length
  const pct = Math.round((completedCount / steps.length) * 100)

  return (
    <div className="flex flex-col gap-8 max-w-3xl">

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden p-7 border-2 border-ink/20"
        style={{
          borderRadius: '180px 45px 200px 35px / 40px 190px 30px 170px',
          boxShadow: '5px 5px 0px 0px #2d2d2d',
          background: '#fff9c4',
          transform: 'rotate(-0.3deg)',
        }}
      >
        {/* Dot grid */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: 'radial-gradient(circle, #2d2d2d 0.8px, transparent 0.8px)',
            backgroundSize: '20px 20px',
          }}
        />
        <div className="relative flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Rocket size={22} className="text-ink/70" />
            <span className="font-body text-sm text-ink/50 uppercase tracking-wider">Getting Started</span>
          </div>
          <h1 className="font-heading text-3xl text-ink leading-tight">
            Welcome to FetchAsset{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}! 👋
          </h1>
          <p className="font-body text-sm text-ink/65 mt-1 max-w-lg">
            You&apos;re {completedCount === 0 ? 'all set to begin' : `${pct}% of the way there`}. Follow the steps below to send your first client portal in minutes.
          </p>

          {/* Progress bar */}
          <div className="mt-4 flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="font-body text-xs text-ink/50">{completedCount} of {steps.length} steps complete</span>
              <span className="font-body text-xs font-bold text-ink">{pct}%</span>
            </div>
            <div
              className="h-3 w-full bg-ink/10 overflow-hidden"
              style={{ borderRadius: '8px 2px 8px 2px / 2px 8px 2px 8px' }}
            >
              <div
                className="h-full transition-all duration-500"
                style={{
                  width: `${pct}%`,
                  background: '#2d2d2d',
                  borderRadius: '8px 2px 8px 2px',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Steps ─────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4">
        {steps.map((step, i) => {
          const Icon = step.icon
          return (
            <div
              key={step.id}
              className="relative flex items-start gap-5 p-5 border-2 transition-all"
              style={{
                borderRadius: '220px 30px 240px 20px / 25px 230px 20px 215px',
                background: step.done ? '#f9f9f9' : step.cardBg,
                borderColor: step.done ? 'rgba(45,45,45,0.12)' : 'rgba(45,45,45,0.22)',
                boxShadow: step.done ? 'none' : '4px 4px 0px 0px #2d2d2d',
                transform: step.done ? 'none' : `rotate(${step.rotateCard})`,
                opacity: step.done ? 0.65 : 1,
              }}
            >
              {/* Step number / check */}
              <div
                className="flex-shrink-0 w-10 h-10 flex items-center justify-center border-2 transition-all"
                style={{
                  borderRadius: '50%',
                  background: step.done ? '#2d2d2d' : '#fff',
                  borderColor: step.done ? '#2d2d2d' : 'rgba(45,45,45,0.25)',
                }}
              >
                {step.done
                  ? <CheckCircle2 size={18} className="text-paper" />
                  : <span className="font-heading text-base text-ink/60">{i + 1}</span>
                }
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Icon size={15} className={step.done ? 'text-ink/30' : 'text-ink/60'} />
                  <h3 className="font-heading text-lg text-ink leading-tight">
                    {step.title}
                  </h3>
                  {step.done && (
                    <span
                      className="font-body text-xs text-white bg-ink/60 px-2 py-0.5"
                      style={{ borderRadius: '20px' }}
                    >
                      Done ✓
                    </span>
                  )}
                </div>
                <p className="font-body text-sm text-ink/60 mb-3">{step.description}</p>

                {!step.done && (
                  <Link href={step.href}>
                    <WobblyButton variant="primary" size="sm">
                      {step.cta} <ArrowRight size={13} className="ml-1.5" />
                    </WobblyButton>
                  </Link>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Completed state ───────────────────────────────────────── */}
      {allDone && (
        <div
          className="flex flex-col items-center gap-4 p-8 border-2 border-ink/20 text-center"
          style={{
            borderRadius: '180px 45px 200px 35px / 40px 190px 30px 170px',
            boxShadow: '5px 5px 0px 0px #2d2d2d',
            background: '#d1fae5',
          }}
        >
          <Sparkles size={32} className="text-green-700" />
          <h2 className="font-heading text-2xl text-ink">You&apos;re all set! 🎉</h2>
          <p className="font-body text-sm text-ink/65 max-w-md">
            Your agency portal is live and ready. Clients can upload files the moment you share the link.
          </p>
          <Link href="/dashboard">
            <WobblyButton variant="primary" size="md">
              Go to Dashboard <ArrowRight size={14} className="ml-1.5" />
            </WobblyButton>
          </Link>
        </div>
      )}

      {/* ── Quick links ───────────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        <h2 className="font-heading text-lg text-ink">Quick Links</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: 'Dashboard', desc: 'Recent activity & stats', href: '/dashboard', icon: BookOpen },
            { label: 'All Projects', desc: 'Manage client projects', href: '/projects', icon: FolderPlus },
            { label: 'Brand Hub', desc: 'Customise your portal', href: '/settings?tab=branding', icon: Palette },
          ].map((link) => {
            const Icon = link.icon
            return (
              <Link
                key={link.href}
                href={link.href}
                className="group flex items-center gap-3 px-4 py-3 border-2 border-ink/15 bg-paper hover:border-ink/40 hover:shadow-[3px_3px_0_0_#2d2d2d] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
                style={{ borderRadius: '245px 18px 200px 20px / 22px 210px 14px 240px' }}
              >
                <Icon size={16} className="text-ink/40 group-hover:text-ink transition-colors flex-shrink-0" />
                <div className="min-w-0">
                  <p className="font-body text-sm font-bold text-ink truncate">{link.label}</p>
                  <p className="font-body text-xs text-ink/40 truncate">{link.desc}</p>
                </div>
                <ExternalLink size={11} className="ml-auto text-ink/20 group-hover:text-ink/50 flex-shrink-0 transition-colors" />
              </Link>
            )
          })}
        </div>
      </div>

    </div>
  )
}
