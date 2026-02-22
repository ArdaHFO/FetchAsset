/**
 * AI Audit Types — matches the JSON schema that Llama 3.3 returns.
 * Stored verbatim in submissions.ai_audit_result (jsonb).
 */

export interface AuditIssue {
  severity: 'error' | 'warning' | 'info'
  message: string
}

export interface AuditResult {
  /** 1–10 quality score */
  quality_score: number
  /** One-sentence verdict */
  summary: string
  /** List of issues found */
  issues: AuditIssue[]
  /** Concrete improvement suggestions */
  suggestions: string[]
  /** Whether the AI thinks this should be auto-approved */
  auto_approve: boolean
  /** Raw explanation for the agency */
  explanation: string
}

/** What the API endpoint accepts */
export interface AuditRequest {
  submissionId: string
}

/** What the API endpoint returns */
export interface AuditResponse {
  success: true
  result: AuditResult
  submissionId: string
}

export interface AuditErrorResponse {
  error: string
}
