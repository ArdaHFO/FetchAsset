import type { Metadata } from 'next'
import LegalPageWrapper, { LegalSection } from '@/components/LegalPageWrapper'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Learn how FetchAsset collects, uses, and protects your personal data.',
  alternates: { canonical: '/privacy-policy' },
}

export default function PrivacyPolicy() {
  return (
    <LegalPageWrapper
      title="Privacy Policy"
      emoji="🔒"
      lastUpdated="22 February 2026"
      mascotSpeech="The legal stuff — keeping us both safe! Your data belongs to you, always. 📎"
    >
      <LegalSection title="1. Introduction">
        <p>
          Welcome to <strong>FetchAsset, Inc.</strong> (&quot;FetchAsset&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website at <strong>fetchasset.app</strong> and use our SaaS platform.
        </p>
        <p>Please read this policy carefully. If you disagree with its terms, please discontinue use of our services.</p>
      </LegalSection>

      <LegalSection title="2. Information We Collect">
        <p>We collect information you provide directly to us when you:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Create an account (name, email address, company name)</li>
          <li>Subscribe to a paid plan (billing details processed via Stripe)</li>
          <li>Use our platform to create projects and send client portals</li>
          <li>Upload files or assets through a client portal</li>
          <li>Contact us for support</li>
        </ul>
        <p>We also collect certain information automatically, including IP addresses, browser type, pages visited, and analytics data via our product analytics provider (PostHog).</p>
      </LegalSection>

      <LegalSection title="3. How We Use Your Information">
        <p>We use the information we collect to:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Provide, operate, and improve our Services</li>
          <li>Process billing transactions and manage subscriptions</li>
          <li>Send transactional emails (magic links, nudge reminders)</li>
          <li>Monitor usage for security and fraud prevention</li>
          <li>Comply with legal obligations</li>
          <li>Communicate product updates and offers (you may opt out at any time)</li>
        </ul>
      </LegalSection>

      <LegalSection title="4. AI Processing & File Data">
        <p>
          When files are uploaded through a client portal, they may be temporarily processed by our AI audit service (powered by Llama 3.3) to check format, quality, and compliance against your project requirements. <strong>We do not use your client files to train AI models.</strong> Files are stored securely and only accessible to the designated project owner.
        </p>
      </LegalSection>

      <LegalSection title="5. Data Sharing & Third Parties">
        <p>We do not sell your personal data. We share data only with trusted service providers who help us operate the platform:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Supabase</strong> — database and authentication</li>
          <li><strong>Stripe</strong> — payment processing</li>
          <li><strong>MailerSend</strong> — transactional email delivery</li>
          <li><strong>PostHog</strong> — product analytics (anonymised)</li>
          <li><strong>Vercel</strong> — hosting and infrastructure</li>
        </ul>
        <p>Each provider is bound by their own privacy policies and data processing agreements.</p>
      </LegalSection>

      <LegalSection title="6. Data Retention">
        <p>We retain your account data for as long as your account is active. Upon account deletion, we will delete your personal data within 30 days, except where retention is required by law. Client-uploaded files are deleted when the associated project is archived or deleted.</p>
      </LegalSection>

      <LegalSection title="7. Your Rights (GDPR / CCPA)">
        <p>Depending on your location, you may have the following rights:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Access</strong> — request a copy of your personal data</li>
          <li><strong>Rectification</strong> — correct inaccurate data</li>
          <li><strong>Erasure</strong> — request deletion of your data</li>
          <li><strong>Portability</strong> — receive your data in a portable format</li>
          <li><strong>Objection</strong> — object to certain processing activities</li>
        </ul>
        <p>To exercise any right, contact us at <strong>privacy@fetchasset.app</strong>.</p>
      </LegalSection>

      <LegalSection title="8. Security">
        <p>We implement industry-standard security measures including TLS encryption in transit, AES-256 encryption at rest, row-level security on our database, and regular security audits. No method of transmission over the Internet is 100% secure; we cannot guarantee absolute security.</p>
      </LegalSection>

      <LegalSection title="9. Children's Privacy">
        <p>Our Services are not directed to individuals under the age of 16. We do not knowingly collect personal information from children. If you believe we have inadvertently collected such data, contact us immediately.</p>
      </LegalSection>

      <LegalSection title="10. Changes to This Policy">
        <p>We may update this Privacy Policy from time to time. We will notify you of significant changes via email or a notice on our website. Continued use of the Services after changes constitutes acceptance of the updated policy.</p>
      </LegalSection>

      <LegalSection title="11. Contact Us">
        <p>
          For privacy-related questions, contact us at:<br />
          <strong>FetchAsset, Inc.</strong><br />
          Email: <a href="mailto:privacy@fetchasset.app" className="underline">privacy@fetchasset.app</a>
        </p>
      </LegalSection>
    </LegalPageWrapper>
  )
}
