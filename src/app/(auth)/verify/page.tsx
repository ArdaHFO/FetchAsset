'use client'

import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Mail, RefreshCw, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { WobblyButton, WobblyCard, WobblyCardContent } from '@/components/ui'

function VerifyContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') ?? ''
  const [resending, setResending] = useState(false)
  const [resentAt, setResentAt] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleResend() {
    if (!email) return
    setResending(true)
    setError(null)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        shouldCreateUser: true,
      },
    })

    setResending(false)

    if (authError) {
      setError(authError.message)
      return
    }

    setResentAt(new Date())
  }

  return (
    <div className="relative">
      {/* Doodle stars */}
      <div
        aria-hidden
        className="absolute -top-8 right-4 font-heading text-6xl text-blue/20 pointer-events-none select-none rotate-[20deg]"
      >
        ✦
      </div>

      <WobblyCard
        flavor="postit"
        shadow="lg"
        radius="lg"
        decoration="tack"
        rotate="0.5"
        className="relative"
      >
        <WobblyCardContent className="p-8 text-center">
          {/* Icon */}
          <div className="flex justify-center mb-5">
            <div
              className="w-16 h-16 flex items-center justify-center bg-paper border-2 border-ink/70"
              style={{
                borderRadius: '220px 30px 240px 20px / 25px 230px 20px 215px',
                boxShadow: '3px 3px 0px 0px #2d2d2d',
              }}
            >
              <Mail size={28} className="text-ink" />
            </div>
          </div>

          {/* Heading */}
          <h1 className="font-heading text-2xl text-ink mb-2">Check your inbox!</h1>

          <p className="font-body text-sm text-ink/70 mb-1">
            We sent a magic link to:
          </p>
          <p
            className="font-body text-sm font-semibold text-ink mb-6 px-3 py-1 inline-block bg-paper/80 border border-ink/20"
            style={{ borderRadius: '8px 2px 8px 2px / 2px 8px 2px 8px' }}
          >
            {email || 'your email'}
          </p>

          <p className="font-body text-xs text-ink/50 mb-8">
            Click the link in the email to sign in. It expires in&nbsp;10&nbsp;minutes.
            <br />
            Don&apos;t forget to check your spam folder!
          </p>

          {/* Resent confirmation */}
          {resentAt && (
            <p className="font-body text-xs text-ink/60 mb-4">
              ✓ Email resent at {resentAt.toLocaleTimeString()}
            </p>
          )}

          {/* Error */}
          {error && (
            <p className="font-body text-xs text-accent mb-4">{error}</p>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <WobblyButton
              variant="secondary"
              size="md"
              loading={resending}
              onClick={handleResend}
              className="w-full"
            >
              {!resending && (
                <>
                  <RefreshCw size={14} className="mr-2" />
                  Resend magic link
                </>
              )}
            </WobblyButton>

            <WobblyButton
              variant="ghost"
              size="sm"
              onClick={() => router.push('/login')}
              className="w-full"
            >
              <ArrowLeft size={14} className="mr-1" />
              Back to login
            </WobblyButton>
          </div>
        </WobblyCardContent>
      </WobblyCard>
    </div>
  )
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="font-body text-sm text-ink/60 text-center">Loading…</div>}>
      <VerifyContent />
    </Suspense>
  )
}
