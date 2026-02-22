'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, ArrowRight, Lock, Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { WobblyButton, WobblyCard, WobblyCardContent } from '@/components/ui'
import { WobblyFormField } from '@/components/ui'

type AuthMode = 'signin' | 'signup' | 'magic'

/* ── Inline Google G logo (lucide has no Google icon) ── */
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.34-8.16 2.34-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  )
}

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<AuthMode>('signin')

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)

  const [loading, setLoading]               = useState(false)
  const [googleLoading, setGoogleLoading]   = useState(false)

  const [error, setError]     = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  function switchMode(m: AuthMode) {
    setMode(m)
    setError(null)
    setSuccess(null)
  }

  /* ── Google OAuth ── */
  async function handleGoogle() {
    setGoogleLoading(true)
    setError(null)
    const supabase = createClient()
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (oauthError) {
      setError(oauthError.message)
      setGoogleLoading(false)
    }
    // On success the browser redirects — no need to reset loading
  }

  /* ── Password sign-in / sign-up ── */
  async function handlePassword(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!email.trim())  { setError('Please enter your email address.'); return }
    if (!password)      { setError('Please enter your password.'); return }
    if (mode === 'signup' && password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    const supabase = createClient()

    if (mode === 'signin') {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      })
      setLoading(false)
      if (authError) {
        const msg = authError.message.toLowerCase()
        if (msg.includes('invalid') || msg.includes('credentials') || msg.includes('not found')) {
          setError('Wrong email or password. No account? Switch to "Create Account" or use a magic link.')
        } else {
          setError(authError.message)
        }
        return
      }
      router.push('/dashboard')
      router.refresh()

    } else {
      /* sign up */
      const { error: authError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      })
      setLoading(false)
      if (authError) { setError(authError.message); return }
      setSuccess('Account created! Check your email for a confirmation link, then sign in.')
    }
  }

  /* ── Magic link ── */
  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!email.trim()) { setError('Please enter your email address.'); return }

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
    if (authError) { setError(authError.message); return }
    router.push(`/verify?email=${encodeURIComponent(email.trim().toLowerCase())}`)
  }

  /* ── Shared email input ── */
  const emailField = (
    <WobblyFormField label="Email address" htmlFor="email">
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
          style={{ borderRadius: '220px 30px 240px 20px / 25px 230px 20px 215px' }}
        />
      </div>
    </WobblyFormField>
  )

  /* ── Tab pill helper ── */
  const tabClass = (t: AuthMode) =>
    [
      'px-4 py-1.5 font-body text-sm transition-all border-2 cursor-pointer',
      mode === t
        ? 'bg-ink text-paper border-ink shadow-[2px_2px_0px_0px_#2d2d2d]'
        : 'bg-paper text-ink/60 border-ink/40 hover:text-ink hover:border-ink',
    ].join(' ')

  return (
    <div className="relative">
      {/* Doodle decorations */}
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
          <div className="mb-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <h1 className="font-heading text-2xl text-ink">Welcome to FetchAsset</h1>
            </div>
            <p className="font-body text-sm text-ink/60">
              Sign in or create your free account below.
            </p>
          </div>

          {/* ── Google button ── */}
          <WobblyButton
            type="button"
            variant="secondary"
            size="lg"
            loading={googleLoading}
            onClick={handleGoogle}
            className="w-full mb-5 flex items-center justify-center gap-2"
          >
            {!googleLoading && <GoogleIcon />}
            {googleLoading ? 'Redirecting…' : 'Continue with Google'}
          </WobblyButton>

          {/* ── Divider ── */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 border-t-2 border-dashed border-ink/20" />
            <span className="font-body text-xs text-ink/40 shrink-0">or with email</span>
            <div className="flex-1 border-t-2 border-dashed border-ink/20" />
          </div>

          {/* ── Mode tabs ── */}
          <div className="flex gap-2 mb-5">
            <button
              type="button"
              className={tabClass('signin')}
              style={{ borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px' }}
              onClick={() => switchMode('signin')}
            >
              Sign In
            </button>
            <button
              type="button"
              className={tabClass('signup')}
              style={{ borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px' }}
              onClick={() => switchMode('signup')}
            >
              Create Account
            </button>
            <button
              type="button"
              className={tabClass('magic')}
              style={{ borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px' }}
              onClick={() => switchMode('magic')}
            >
              Magic Link
            </button>
          </div>

          {/* ── Error / Success banners ── */}
          {error && (
            <div
              className="mb-4 px-4 py-2.5 font-body text-sm text-ink bg-postit border-2 border-ink/70"
              style={{ borderRadius: '12px 4px 10px 4px / 4px 10px 4px 12px' }}
            >
              {error}
            </div>
          )}
          {success && (
            <div
              className="mb-4 px-4 py-2.5 font-body text-sm text-ink bg-muted border-2 border-ink/70"
              style={{ borderRadius: '12px 4px 10px 4px / 4px 10px 4px 12px' }}
            >
              {success}
            </div>
          )}

          {/* ── Password form (Sign In + Create Account) ── */}
          {(mode === 'signin' || mode === 'signup') && (
            <form onSubmit={handlePassword} className="flex flex-col gap-4">
              {emailField}

              <WobblyFormField label="Password" htmlFor="password">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40 pointer-events-none">
                    <Lock size={16} />
                  </span>
                  <input
                    id="password"
                    type={showPw ? 'text' : 'password'}
                    autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                    placeholder={mode === 'signup' ? 'Min. 6 characters' : '••••••••'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className={[
                      'w-full pl-9 pr-10 py-3',
                      'font-body text-sm text-ink placeholder:text-ink/40',
                      'bg-paper border-2 border-ink/70',
                      'outline-none transition-all',
                      'focus:border-ink focus:shadow-hard',
                      'disabled:opacity-50 disabled:cursor-not-allowed',
                    ].join(' ')}
                    style={{ borderRadius: '220px 30px 240px 20px / 25px 230px 20px 215px' }}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink transition-colors"
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
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
                    {mode === 'signin' ? 'Sign In' : 'Create Account'}
                    <ArrowRight size={16} className="ml-2" />
                  </>
                )}
              </WobblyButton>

              {mode === 'signin' && (
                <p className="font-body text-xs text-center text-ink/50">
                  No account yet?{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('signup')}
                    className="underline hover:text-ink"
                  >
                    Create one →
                  </button>
                </p>
              )}
            </form>
          )}

          {/* ── Magic link form ── */}
          {mode === 'magic' && (
            <form onSubmit={handleMagicLink} className="flex flex-col gap-4">
              {emailField}
              <p className="font-body text-xs text-ink/50 -mt-2">
                We&apos;ll email you a one-click sign-in link. No password needed. New accounts are created automatically.
              </p>
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
          )}

          {/* Footer note */}
          <p className="mt-6 font-body text-xs text-center text-ink/40">
            By signing up you agree to our{' '}
            <a href="/terms-of-service" className="underline hover:text-ink/60">Terms</a>
            {' '}&amp;{' '}
            <a href="/privacy-policy" className="underline hover:text-ink/60">Privacy Policy</a>.
          </p>
        </WobblyCardContent>
      </WobblyCard>
    </div>
  )
}
