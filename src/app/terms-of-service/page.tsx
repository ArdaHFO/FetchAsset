import type { Metadata } from 'next'
import LegalPageWrapper, { LegalSection } from '@/components/LegalPageWrapper'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'The terms that govern your use of the FetchAsset platform.',
  alternates: { canonical: '/terms-of-service' },
}

export default function TermsOfService() {
  return (
    <LegalPageWrapper
      title="Terms of Service"
      emoji="📋"
      lastUpdated="22 February 2026"
      mascotSpeech="The rules of the game — fair for you, fair for us. Let's do great work together! 📎"
    >
      <LegalSection title="1. Acceptance of Terms">
        <p>
          By accessing or using <strong>FetchAsset</strong> (the &quot;Service&quot;), operated by FetchAsset, Inc. (&quot;Company&quot;, &quot;we&quot;, &quot;us&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, you may not use the Service. These Terms apply to all users including agencies, freelancers, and their clients.
        </p>
      </LegalSection>

      <LegalSection title="2. Description of Service">
        <p>
          FetchAsset provides a SaaS platform that enables agencies and freelancers to create passwordless client asset collection portals, automate file auditing via artificial intelligence, manage project deadlines with deadline buffers, and organise received assets — all without requiring client logins or app installations.
        </p>
      </LegalSection>

      <LegalSection title="3. Account Registration">
        <ul className="list-disc pl-5 space-y-1">
          <li>You must provide accurate, current, and complete information during registration.</li>
          <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
          <li>You must be at least 18 years of age to create an account.</li>
          <li>One person or legal entity may not maintain more than one free account.</li>
          <li>You are responsible for all activity that occurs under your account.</li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Acceptable Use">
        <p>You agree NOT to use the Service to:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Upload, transmit, or distribute illegal, harmful, or infringing content</li>
          <li>Harass, spam, or deceive clients via the magic link portal system</li>
          <li>Attempt to reverse-engineer, decompile, or extract source code</li>
          <li>Use automated bots or scrapers against our infrastructure</li>
          <li>Exceed your plan&apos;s resource limits through abuse or circumvention</li>
          <li>Resell or white-label the Service without a written reseller agreement</li>
        </ul>
      </LegalSection>

      <LegalSection title="5. Subscription Plans & Billing">
        <p>FetchAsset offers Free, Solo, Pro, and Agency plans. Paid subscriptions are billed monthly or annually via Stripe. By subscribing, you authorise us to charge your payment method on a recurring basis.</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Free Trial:</strong> Paid plans include a 14-day free trial. No charge until the trial expires.</li>
          <li><strong>Cancellation:</strong> You may cancel at any time. Access continues until the end of the billing period.</li>
          <li><strong>Refunds:</strong> We offer a 7-day refund window after the first charge of a new plan. Contact support to request.</li>
          <li><strong>Price Changes:</strong> We will provide 30 days notice of any price changes via email.</li>
        </ul>
      </LegalSection>

      <LegalSection title="6. Intellectual Property">
        <p>
          <strong>Your Content:</strong> You retain all ownership rights to content you upload or create through the Service. By using the Service, you grant FetchAsset a limited, non-exclusive licence to host, process, and display your content solely to provide the Service.
        </p>
        <p>
          <strong>Our IP:</strong> The FetchAsset platform, including its code, design, branding, and AI models, is owned exclusively by FetchAsset, Inc. and protected by copyright and trademark law.
        </p>
      </LegalSection>

      <LegalSection title="7. AI Features & Accuracy">
        <p>
          FetchAsset uses AI (including Llama 3.3) to audit uploaded files. AI-generated recommendations are provided for informational purposes and <strong>do not constitute a guarantee</strong> that files meet any specific professional, legal, or technical standard. You remain responsible for reviewing all received assets.
        </p>
      </LegalSection>

      <LegalSection title="8. Limitation of Liability">
        <p>
          To the maximum extent permitted by applicable law, FetchAsset shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or goodwill, arising from your use of or inability to use the Service. Our total aggregate liability shall not exceed the amount you paid to us in the 12 months preceding the claim.
        </p>
      </LegalSection>

      <LegalSection title="9. Warranties Disclaimer">
        <p>
          The Service is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind, express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement. We do not guarantee uninterrupted or error-free operation.
        </p>
      </LegalSection>

      <LegalSection title="10. Termination">
        <p>
          We may suspend or terminate your account immediately without notice if you breach these Terms, engage in fraudulent activity, or if required by law. Upon termination, your right to use the Service ceases immediately. We will retain your data for 30 days to allow export before permanent deletion.
        </p>
      </LegalSection>

      <LegalSection title="11. Governing Law">
        <p>
          These Terms shall be governed by and construed in accordance with the laws of the State of Delaware, United States, without regard to its conflict of law provisions. Any disputes shall be resolved in the state or federal courts located in Delaware.
        </p>
      </LegalSection>

      <LegalSection title="12. Changes to Terms">
        <p>
          We reserve the right to update these Terms. We will notify you of material changes via email at least 14 days before they take effect. Continued use of the Service after changes constitute acceptance.
        </p>
      </LegalSection>

      <LegalSection title="13. Contact">
        <p>
          Questions about these Terms?<br />
          <strong>FetchAsset, Inc.</strong><br />
          Email: <a href="mailto:legal@fetchasset.app" className="underline">legal@fetchasset.app</a>
        </p>
      </LegalSection>
    </LegalPageWrapper>
  )
}
