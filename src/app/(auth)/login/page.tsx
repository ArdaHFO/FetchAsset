'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, ArrowRight, Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { WobblyButton, WobblyCard, WobblyCardContent } from '@/components/ui'
import { WobblyFormField } from '@/components/ui'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!email.trim()) {
      setError('Please enter your email address.')
      return
    }

    setLoading(true)
    const supabase = createClient()

    const { error: authError } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        shouldCreateUser: true,
      },
    })

    setLoading(false)

    if (authError) {
      setError(authError.message)
      return
    }

    router.push(`/verify?email=${encodeURIComponent(email.trim().toLowerCase())}`)
  }

  return (
    <div className="relative">
      {/* Floating doodle decorations */}
      <div
        aria-hidden
        className="absolute -top-6 -left-4 font-heading text-5xl text-accent/20 pointer-events-none select-none rotate-[-15deg]"
      >
        ✦
      </div>
      <div
        aria-hidden
        className="absolute -bottom-4 -right-6 font-heading text-4xl text-blue/20 pointer-events-none select-none rotate-[10deg]"
      >
        ✶
      </div>

      <WobblyCard
        flavor="default"
        shadow="lg"
        radius="lg"
        decoration="tape"
        rotate="-0.5"
        className="relative"
      >
        <WobblyCardContent className="p-8">
          {/* Header */}
          <div className="mb-7 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles size={20} className="text-accent" />
              <h1 className="font-heading text-2xl text-ink">Welcome back!</h1>
            </div>
            <p className="font-body text-sm text-ink/60">
              Enter your email and we&apos;ll send you a magic link — no password needed ✨
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <WobblyFormField
              label="Email address"
              htmlFor="email"
              errorMessage={error ?? undefined}
            >
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40 pointer-events-none">
                  <Mail size={16} />
                </span>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@agency.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className={[
                    'w-full pl-9 pr-4 py-3',
                    'font-body text-sm text-ink placeholder:text-ink/40',
                    'bg-paper border-2 border-ink/70',
                    'outline-none transition-all',
                    'focus:border-ink focus:shadow-hard',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                  ].join(' ')}
                  style={{
                    borderRadius: '220px 30px 240px 20px / 25px 230px 20px 215px',
                  }}
                />
              </div>
            </WobblyFormField>

            <WobblyButton
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full"
            >
              {!loading && (
                <>
                  Send Magic Link
                  <ArrowRight size={16} className="ml-2" />
                </>
              )}
            </WobblyButton>
          </form>

          {/* Divider note */}
          <p className="mt-6 font-body text-xs text-center text-ink/40">
            New here? An account will be created automatically.
          </p>
        </WobblyCardContent>
      </WobblyCard>
    </div>
  )
}
