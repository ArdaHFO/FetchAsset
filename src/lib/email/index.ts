/**
 * FetchAsset — Email Service (MailerSend)
 * Handles all transactional emails: submission notifications, approvals, rejections.
 * Magic-link auth emails are handled directly by Supabase Auth.
 */

import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend'

// ── Singleton ──────────────────────────────────────────────────────────────────

let _client: MailerSend | null = null

function getClient(): MailerSend {
  if (!_client) {
    const apiKey = process.env.MAILERSEND_API_KEY
    if (!apiKey) throw new Error('MAILERSEND_API_KEY is not set')
    _client = new MailerSend({ apiKey })
  }
  return _client
}

const SENDER_EMAIL = process.env.MAILERSEND_SENDER_EMAIL ?? 'hello@fetchasset.com'
const SENDER_NAME  = process.env.MAILERSEND_SENDER_NAME  ?? 'FetchAsset'

// ── Shared template shell ────────────────────────────────────────────────────

function shell(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f0ece4;font-family:Georgia,'Times New Roman',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
    style="background:#f0ece4;padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" role="presentation"
        style="max-width:600px;width:100%;background:#faf8f5;border:2px solid #2d2d2d;
               border-radius:20px 4px 20px 4px / 4px 20px 4px 20px;
               box-shadow:5px 5px 0 0 #2d2d2d;">
        <!-- Header -->
        <tr>
          <td style="padding:28px 36px 20px;border-bottom:2px solid #e8e3da;">
            <span style="font-size:22px;font-weight:700;color:#2d2d2d;letter-spacing:-0.5px;">
            Fetch<span style="color:#e63946;">Asset</span>
            </span>
          </td>
        </tr>
        <!-- Body -->
        <tr><td style="padding:28px 36px 32px;">${body}</td></tr>
        <!-- Footer -->
        <tr>
          <td style="padding:16px 36px 24px;border-top:2px solid #e8e3da;">
            <p style="margin:0;font-size:12px;color:#9e9589;">
              Powered by FetchAsset &middot; AI-assisted client onboarding<br/>
              <span style="font-size:11px;">You received this because you are part of a FetchAsset project.</span>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

// Helper for the chunky CTA button
function ctaButton(href: string, label: string): string {
  return `<a href="${href}"
    style="display:inline-block;margin-top:24px;padding:12px 28px;
           background:#2d2d2d;color:#faf8f5;font-family:Georgia,serif;
           font-size:15px;font-weight:700;text-decoration:none;
           border-radius:255px 15px 225px 15px / 15px 225px 15px 255px;
           box-shadow:4px 4px 0 0 #e63946;">
    ${label}
  </a>`
}

function h1(text: string): string {
  return `<h1 style="margin:0 0 12px;font-size:22px;color:#2d2d2d;font-weight:700;line-height:1.3;">${text}</h1>`
}

function p(text: string, muted = false): string {
  return `<p style="margin:0 0 10px;font-size:15px;color:${muted ? '#9e9589' : '#2d2d2d'};line-height:1.6;">${text}</p>`
}

function pill(label: string): string {
  return `<span style="display:inline-block;padding:3px 12px;font-size:12px;font-weight:700;
    background:#fff7c2;color:#2d2d2d;border:1.5px solid #2d2d2d;
    border-radius:20px 3px 20px 3px / 3px 20px 3px 20px;">${label}</span>`
}

function infoBox(text: string): string {
  return `<div style="margin:16px 0;padding:14px 18px;background:#f0ece4;
    border-left:4px solid #2d2d2d;border-radius:0 8px 8px 0;">
    <p style="margin:0;font-size:14px;color:#2d2d2d;line-height:1.5;">${text}</p>
  </div>`
}

function rejectionBox(reason: string): string {
  return `<div style="margin:16px 0;padding:14px 18px;background:#fff0f0;
    border:1.5px solid #e63946;border-radius:8px 2px 8px 2px / 2px 8px 2px 8px;">
    <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#e63946;text-transform:uppercase;
      letter-spacing:0.08em;">Reason</p>
    <p style="margin:0;font-size:14px;color:#2d2d2d;line-height:1.5;">${reason}</p>
  </div>`
}

// ── Core send helper ────────────────────────────────────────────────────────────

interface SendOptions {
  to: string
  toName?: string
  subject: string
  html: string
}

async function send(opts: SendOptions): Promise<void> {
  const client     = getClient()
  const from       = new Sender(SENDER_EMAIL, SENDER_NAME)
  const recipients = [new Recipient(opts.to, opts.toName ?? opts.to)]

  const params = new EmailParams()
    .setFrom(from)
    .setTo(recipients)
    .setSubject(opts.subject)
    .setHtml(opts.html)

  try {
    await client.email.send(params)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    throw new Error(`MailerSend delivery failed: ${message}`)
  }
}

// ── Email: Agency notified of new submission ─────────────────────────────────

interface NewSubmissionEmailOpts {
  agencyEmail: string
  agencyName?: string
  clientName: string
  projectTitle: string
  requestTitle: string
  projectUrl: string
}

export async function sendNewSubmissionToAgency(opts: NewSubmissionEmailOpts): Promise<void> {
  const html = shell(
    `New submission for ${opts.projectTitle}`,
    `
      ${h1(`📬 New submission from ${opts.clientName}`)}
      ${p(`<strong>${opts.clientName}</strong> just submitted a file for your project:`)}
      ${infoBox(`
        <strong>Project:</strong> ${opts.projectTitle}<br/>
        <strong>Request:</strong> ${opts.requestTitle}
      `)}
      ${p('Click below to review it — the AI audit will be ready in a few seconds.', true)}
      ${ctaButton(opts.projectUrl, 'Review Submission →')}
    `
  )

  await send({
    to: opts.agencyEmail,
    toName: opts.agencyName,
    subject: `${opts.clientName} submitted "${opts.requestTitle}" — ${opts.projectTitle}`,
    html,
  })
}

// ── Email: Client confirmation after submitting ──────────────────────────────

interface SubmissionConfirmEmailOpts {
  clientEmail: string
  clientName: string
  projectTitle: string
  requestTitle: string
  portalUrl: string
}

export async function sendSubmissionConfirmToClient(opts: SubmissionConfirmEmailOpts): Promise<void> {
  const PORTAL_BASE = process.env.NEXT_PUBLIC_PORTAL_URL ?? 'https://portal.fetchasset.com'
  const portalUrl   = opts.portalUrl.startsWith('http') ? opts.portalUrl : `${PORTAL_BASE}${opts.portalUrl}`

  const html = shell(
    'We got it!',
    `
      ${h1(`We got it, ${opts.clientName}! ✅`)}
      ${p(`Your submission for <strong>${opts.requestTitle}</strong> has been received.`)}
      ${infoBox(`<strong>Project:</strong> ${opts.projectTitle}<br/><strong>Item:</strong> ${opts.requestTitle}`)}
      ${p("We'll review it and let you know if anything needs to be updated. You can re-upload or add more items any time using the portal link.", true)}
      ${ctaButton(portalUrl, 'Back to Portal →')}
    `
  )

  await send({
    to: opts.clientEmail,
    toName: opts.clientName,
    subject: `Received: "${opts.requestTitle}" for ${opts.projectTitle}`,
    html,
  })
}

// ── Email: Client asset approved ─────────────────────────────────────────────

interface ApprovalEmailOpts {
  clientEmail: string
  clientName: string
  projectTitle: string
  requestTitle: string
  portalUrl: string
}

export async function sendApprovalToClient(opts: ApprovalEmailOpts): Promise<void> {
  const html = shell(
    'Approved!',
    `
      ${h1(`Great news, ${opts.clientName}! 🎉`)}
      ${p(`Your submission for <strong>${opts.requestTitle}</strong> has been <strong>approved</strong>.`)}
      ${infoBox(`<strong>Project:</strong> ${opts.projectTitle}<br/><strong>Status:</strong> ✅ Approved`)}
      ${p("You're all done with this item! Head back to the portal to check if anything else is needed.", true)}
      ${ctaButton(opts.portalUrl, 'View Portal →')}
    `
  )

  await send({
    to: opts.clientEmail,
    toName: opts.clientName,
    subject: `✅ Approved: "${opts.requestTitle}" — ${opts.projectTitle}`,
    html,
  })
}

// ── Email: Client asset rejected (needs revision) ───────────────────────────

interface RejectionEmailOpts {
  clientEmail: string
  clientName: string
  projectTitle: string
  requestTitle: string
  rejectionReason?: string | null
  portalUrl: string
}

export async function sendRejectionToClient(opts: RejectionEmailOpts): Promise<void> {
  const html = shell(
    'Update needed',
    `
      ${h1(`One more round, ${opts.clientName} 🔄`)}
      ${p(`Your submission for <strong>${opts.requestTitle}</strong> needs a small update before it's approved.`)}
      ${opts.rejectionReason
        ? rejectionBox(opts.rejectionReason)
        : infoBox(`<strong>Project:</strong> ${opts.projectTitle}<br/><strong>Item:</strong> ${opts.requestTitle}`)
      }
      ${p('No worries — just head back to the portal and re-upload or update your submission.', true)}
      ${ctaButton(opts.portalUrl, 'Update Submission →')}
    `
  )

  await send({
    to: opts.clientEmail,
    toName: opts.clientName,
    subject: `Update needed: "${opts.requestTitle}" — ${opts.projectTitle}`,
    html,
  })
}
