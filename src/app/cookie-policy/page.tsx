import type { Metadata } from 'next'
import LegalPageWrapper, { LegalSection } from '@/components/LegalPageWrapper'

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'How FetchAsset uses cookies and similar tracking technologies.',
  alternates: { canonical: '/cookie-policy' },
}

export default function CookiePolicy() {
  return (
    <LegalPageWrapper
      title="Cookie Policy"
      emoji="🍪"
      lastUpdated="22 February 2026"
      mascotSpeech="Not the chocolate chip kind, sadly. But these cookies help keep things running smoothly! 📎"
    >
      <LegalSection title="1. What Are Cookies?">
        <p>
          Cookies are small text files placed on your device when you visit a website. They allow the site to recognise your device, remember your preferences, and provide core functionality. We also use similar technologies such as local storage and session storage.
        </p>
      </LegalSection>

      <LegalSection title="2. Cookies We Use">
        <p>We use the following categories of cookies:</p>

        <div
          className="border-2 border-ink/20 overflow-hidden mt-3"
          style={{ borderRadius: '12px 3px 12px 3px / 3px 12px 3px 12px' }}
        >
          {[
            {
              name: 'Essential',
              icon: '🔑',
              desc: 'Required for the platform to function. Cannot be disabled.',
              examples: 'Supabase auth session, CSRF tokens, secure user session cookies.',
              canDisable: false,
            },
            {
              name: 'Analytics',
              icon: '📊',
              desc: 'Help us understand how users interact with our product so we can improve it.',
              examples: 'PostHog session tracking, pageview events, funnel analytics (anonymised).',
              canDisable: true,
            },
            {
              name: 'Preferences',
              icon: '⚙️',
              desc: 'Remember your settings and choices between visits.',
              examples: 'Launch banner dismissed state (localStorage), UI preferences.',
              canDisable: true,
            },
          ].map((cat, i) => (
            <div key={cat.name} className={`p-4 ${i > 0 ? 'border-t-2 border-ink/10' : ''}`}>
              <div className="flex items-center gap-2 mb-1">
                <span>{cat.icon}</span>
                <strong className="font-body text-sm text-ink">{cat.name} Cookies</strong>
                <span
                  className={`ml-auto font-body text-xs px-2 py-0.5 ${cat.canDisable ? 'bg-amber-100 text-amber-700 border border-amber-300' : 'bg-green-50 text-green-700 border border-green-200'}`}
                  style={{ borderRadius: '20px' }}
                >
                  {cat.canDisable ? 'Optional' : 'Required'}
                </span>
              </div>
              <p className="font-body text-xs text-ink/55 mb-0.5">{cat.desc}</p>
              <p className="font-body text-xs text-ink/35"><em>Examples: {cat.examples}</em></p>
            </div>
          ))}
        </div>
      </LegalSection>

      <LegalSection title="3. Third-Party Cookies">
        <p>Some cookies are set by third-party services we use:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>PostHog</strong> — product analytics (eu.i.posthog.com). <a href="https://posthog.com/privacy" target="_blank" rel="noopener noreferrer" className="underline">PostHog Privacy Policy</a></li>
          <li><strong>Stripe</strong> — payment processing. <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="underline">Stripe Privacy Policy</a></li>
          <li><strong>Vercel</strong> — CDN and hosting performance. <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="underline">Vercel Privacy Policy</a></li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Managing Cookies">
        <p>You can control and manage cookies in several ways:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Browser settings:</strong> Most browsers allow you to refuse or delete cookies. See your browser&apos;s help documentation for instructions.</li>
          <li><strong>Opt-out tools:</strong> For PostHog analytics, you can opt out by contacting us at <a href="mailto:privacy@fetchasset.app" className="underline">privacy@fetchasset.app</a>.</li>
          <li><strong>Local storage:</strong> You can clear local storage data via your browser&apos;s developer tools or settings.</li>
        </ul>
        <p>Note: Disabling essential cookies will prevent core platform features from working correctly.</p>
      </LegalSection>

      <LegalSection title="5. Cookie Retention">
        <p>The retention period of cookies varies:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Session cookies</strong> — deleted when you close your browser</li>
          <li><strong>Persistent cookies</strong> — retained for a fixed period (typically 30 days to 1 year)</li>
          <li><strong>Local storage items</strong> — retained until manually cleared or per our application logic</li>
        </ul>
      </LegalSection>

      <LegalSection title="6. Changes to This Policy">
        <p>We may update this Cookie Policy periodically to reflect changes in our practices or applicable law. We will notify you of significant changes via a notice on our website or by email.</p>
      </LegalSection>

      <LegalSection title="7. Contact">
        <p>
          Questions about our cookie use?<br />
          <strong>FetchAsset, Inc.</strong><br />
          Email: <a href="mailto:privacy@fetchasset.app" className="underline">privacy@fetchasset.app</a>
        </p>
      </LegalSection>
    </LegalPageWrapper>
  )
}
