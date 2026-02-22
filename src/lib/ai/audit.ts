/**
 * AI Audit Engine — builds prompts and calls Llama 3.3 70B via Groq.
 * Server-side only.
 */
import { getGroqClient, LLAMA_MODEL } from './groq'
import type { AuditResult } from './types'
import type { AssetRequest, Submission } from '@/lib/supabase/types'

// ── Prompt builders ───────────────────────────────────────────────

function formatBytes(bytes: number | null): string {
  if (!bytes) return 'unknown size'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

function buildSystemPrompt(): string {
  return `You are an expert creative asset auditor for a digital agency.
Your job is to evaluate client asset submissions and determine whether they meet the stated requirements.
Be constructive, specific, and professional. Focus on actionable feedback.

CRITICAL: Always respond with ONLY valid JSON matching this exact schema — no markdown, no extra text:
{
  "quality_score": <integer 1-10>,
  "summary": "<one sentence verdict>",
  "issues": [{"severity": "error"|"warning"|"info", "message": "<specific issue>"}],
  "suggestions": ["<concrete suggestion>", ...],
  "auto_approve": <true|false>,
  "explanation": "<2-3 sentence detailed explanation for the agency>"
}

Scoring guide:
- 9-10: Perfect, auto-approve
- 7-8: Good, minor issues, can approve
- 5-6: Acceptable but has problems, needs review  
- 3-4: Significant issues, likely reject
- 1-2: Wrong file/content entirely`
}

function buildUserPrompt(request: AssetRequest, submission: Submission): string {
  const lines: string[] = [
    `=== ASSET REQUEST ===`,
    `Title: ${request.title}`,
    request.description ? `Description: ${request.description}` : '',
    `Type: ${request.request_type}`,
    request.allowed_file_types?.length
      ? `Expected file types: ${request.allowed_file_types.join(', ')}`
      : '',
    request.max_file_size_mb
      ? `Max file size: ${request.max_file_size_mb} MB`
      : '',
    `Required: ${request.required ? 'YES' : 'No'}`,
    '',
    `=== CLIENT SUBMISSION ===`,
    `Submitted by: ${submission.client_name}`,
  ]

  if (submission.client_note) {
    lines.push(`Client note: ${submission.client_note}`)
  }

  if (request.request_type === 'file') {
    lines.push(
      `File name: ${submission.file_name ?? 'unknown'}`,
      `File type: ${submission.file_mime_type ?? 'unknown'}`,
      `File size: ${formatBytes(submission.file_size_bytes)}`,
    )

    // Heuristic checks
    if (submission.file_name) {
      const ext = submission.file_name.split('.').pop()?.toLowerCase()
      lines.push(`File extension: .${ext ?? 'unknown'}`)
    }

    lines.push(
      '',
      `=== YOUR TASK ===`,
      `Evaluate whether this file submission meets the requirements.`,
      `Consider: file type match, naming conventions, file size, and any red flags.`,
      `Note: You cannot view the file contents — evaluate based on metadata only.`,
    )
  } else if (request.request_type === 'url') {
    lines.push(
      `URL submitted: ${submission.value_text ?? '(empty)'}`,
      '',
      `=== YOUR TASK ===`,
      `Evaluate whether this URL looks valid, relevant, and appropriate for the request.`,
      `Check: URL format, domain relevance, protocol (https preferred).`,
    )
  } else if (request.request_type === 'text') {
    const text = submission.value_text ?? ''
    lines.push(
      `Response length: ${text.length} characters`,
      `Content:\n---\n${text.slice(0, 2000)}${text.length > 2000 ? '\n[truncated]' : ''}\n---`,
      '',
      `=== YOUR TASK ===`,
      `Evaluate this text response for completeness, clarity, and relevance to the request.`,
    )
  } else if (request.request_type === 'password') {
    const pwd = submission.value_text ?? ''
    lines.push(
      `Credential length: ${pwd.length} characters`,
      `Has uppercase: ${/[A-Z]/.test(pwd)}`,
      `Has digits: ${/\d/.test(pwd)}`,
      `Has special chars: ${/[^a-zA-Z0-9]/.test(pwd)}`,
      '',
      `=== YOUR TASK ===`,
      `Evaluate whether this looks like a real credential was submitted (not a placeholder).`,
      `Do NOT repeat or include the credential value in your response.`,
    )
  } else if (request.request_type === 'multiple_choice') {
    lines.push(
      `Selected option: ${submission.value_text ?? '(none)'}`,
      request.choices?.length ? `Available options: ${request.choices.join(', ')}` : '',
      '',
      `=== YOUR TASK ===`,
      `Verify the selected option is from the available list and seems appropriate.`,
    )
  }

  return lines.filter((l) => l !== undefined).join('\n')
}

// ── Main audit function ───────────────────────────────────────────

export async function auditSubmission(
  request: AssetRequest,
  submission: Submission,
): Promise<AuditResult> {
  const groq = getGroqClient()

  const completion = await groq.chat.completions.create({
    model: LLAMA_MODEL,
    messages: [
      { role: 'system', content: buildSystemPrompt() },
      { role: 'user',   content: buildUserPrompt(request, submission) },
    ],
    temperature: 0.2,
    max_tokens: 1024,
    response_format: { type: 'json_object' },
  })

  const raw = completion.choices[0]?.message?.content ?? '{}'

  let parsed: Partial<AuditResult>
  try {
    parsed = JSON.parse(raw)
  } catch {
    // Malformed JSON — return a safe fallback
    return {
      quality_score: 5,
      summary: 'AI audit could not parse the response.',
      issues: [{ severity: 'warning', message: 'Automated audit failed — manual review required.' }],
      suggestions: ['Review submission manually.'],
      auto_approve: false,
      explanation: `Raw model output: ${raw.slice(0, 300)}`,
    }
  }

  // Sanitise and fill defaults
  return {
    quality_score: Math.min(10, Math.max(1, Number(parsed.quality_score) || 5)),
    summary: typeof parsed.summary === 'string' ? parsed.summary : 'No summary provided.',
    issues: Array.isArray(parsed.issues) ? parsed.issues : [],
    suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
    auto_approve: Boolean(parsed.auto_approve),
    explanation: typeof parsed.explanation === 'string' ? parsed.explanation : '',
  }
}
