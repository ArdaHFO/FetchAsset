/**
 * FetchAsset — Supabase Database Types
 * Hand-written to exactly match the SQL migration schema.
 * When you run `supabase gen types typescript`, replace this file.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// ── Plan tiers ────────────────────────────────────────────────────────
export type PlanTier = 'free' | 'solo' | 'pro' | 'agency'

// ── Project statuses ──────────────────────────────────────────────────
export type ProjectStatus = 'draft' | 'active' | 'completed' | 'archived'

// ── Asset request types ───────────────────────────────────────────────
export type RequestType = 'file' | 'text' | 'password' | 'multiple_choice' | 'url'

// ── Submission statuses ───────────────────────────────────────────────
export type SubmissionStatus = 'pending_review' | 'approved' | 'rejected'

// ── AI audit statuses ─────────────────────────────────────────────────
export type AiAuditStatus = 'pending' | 'processing' | 'complete' | 'error'

// ── Comment author types ──────────────────────────────────────────────
export type CommentAuthorType = 'agency' | 'client'

// ── Notification types ────────────────────────────────────────────────
export type NotificationType =
  | 'submission_received'
  | 'submission_approved'
  | 'submission_rejected'
  | 'ai_audit_complete'
  | 'reminder_sent'
  | 'project_completed'
  | 'magic_link_opened'

// ─────────────────────────────────────────────────────────────────────
// Table Row Types
// ─────────────────────────────────────────────────────────────────────

export interface Profile {
  id: string                        // uuid — matches auth.users.id
  created_at: string
  updated_at: string
  email: string
  full_name: string | null
  avatar_url: string | null
  plan: PlanTier
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  stripe_subscription_status: string | null
  // White-label customization (Agency plan)
  white_label_domain: string | null
  white_label_logo_url: string | null
  white_label_primary_color: string | null
  white_label_accent_color: string | null
  white_label_company_name: string | null
  // Agency Branding Hub
  logo_url: string | null              // uploaded agency logo
  brand_color: string | null           // e.g. '#e63946'
  custom_welcome_msg: string | null    // custom portal heading
  preferred_font: 'sketchy' | 'professional' | null  // portal font
  wobble_intensity: number | null      // 0–100, default 50
  portal_bg_color: string | null       // portal background color
  portal_card_color: string | null     // welcome card / sticky-note color
  agency_tagline: string | null        // short tagline in portal header
  hide_branding: boolean | null        // hide "Powered by FetchAsset" footer
}

export interface Project {
  id: string
  created_at: string
  updated_at: string
  owner_id: string                  // FK -> profiles.id
  client_name: string
  client_email: string
  project_type: string | null       // e.g. 'Web Design', 'SEO', 'Branding'
  title: string                     // Portal title shown to client
  status: ProjectStatus
  magic_token: string               // unique token for client portal URL
  magic_token_expires_at: string | null
  due_date: string | null           // internal deadline (real deadline)
  buffer_days: number               // days to subtract for client-visible deadline
  auto_reminder: boolean            // enable The Nudger™ email reminders
  notes: string | null              // internal agency notes
  custom_message: string | null     // shown to client on portal open
  contact_method: 'email' | 'whatsapp' | null  // how the client should reach the agency
  contact_value: string | null                  // email address or WhatsApp number
  contact_visible: boolean                      // freelancer toggle — shows/hides card in portal
  // Computed / join fields (not in DB, added by queries)
  asset_requests?: AssetRequest[]
  submissions_count?: number
  completed_submissions_count?: number
}

export interface AssetRequest {
  id: string
  created_at: string
  updated_at: string
  project_id: string                // FK -> projects.id
  sort_order: number
  title: string                     // e.g. "Logo Files"
  description: string | null        // e.g. "Please provide SVG and PNG"
  request_type: RequestType
  required: boolean
  // File type constraints (for 'file' type)
  allowed_file_types: string[] | null  // e.g. ['svg', 'png', 'pdf']
  max_file_size_mb: number | null
  multiple_files: boolean
  // Smart Builder extras
  custom_instructions: string | null  // Agency notes shown to client
  naming_rule: boolean                // Auto-rename uploaded files
  // Multiple choice options
  choices: string[] | null
  // Example reference
  example_url: string | null
  example_file_path: string | null
  // Computed
  submission?: Submission | null
}

export interface Submission {
  id: string
  created_at: string
  updated_at: string
  asset_request_id: string          // FK -> asset_requests.id
  project_id: string                // FK -> projects.id (denormalized for perf)
  client_name: string               // snapshot at submission time
  // Content (only one of these will be populated based on RequestType)
  value_text: string | null         // for text | password | multiple_choice | url
  // File info (for 'file' type)
  file_name: string | null
  file_path: string | null          // Supabase Storage path
  file_size_bytes: number | null
  file_mime_type: string | null
  file_url: string | null           // cached public/signed URL
  // Status
  status: SubmissionStatus
  rejection_reason: string | null
  // AI audit
  ai_audit_result: Json | null      // structured AI output
  ai_audit_status: AiAuditStatus
  // Client note
  client_note: string | null
  // Agency note (shown to client in portal)
  agency_note: string | null
  // Version control (multiple uploads for the same request)
  version: number                   // 1-based; latest upload increments this
  // Computed
  comments?: Comment[]
}

export interface Comment {
  id: string
  created_at: string
  submission_id: string             // FK -> submissions.id
  author_type: CommentAuthorType
  author_id: string | null          // agency profile id (null for client)
  content: string
}

export interface Notification {
  id: string
  created_at: string
  profile_id: string                // FK -> profiles.id (agency)
  project_id: string | null
  type: NotificationType
  title: string
  body: string
  read: boolean
  link: string | null
}

// ─────────────────────────────────────────────────────────────────────
// Insert / Update types (omit server-generated fields)
// ─────────────────────────────────────────────────────────────────────

export type ProfileUpdate = Partial<
  Pick<
    Profile,
    | 'full_name'
    | 'avatar_url'
    | 'white_label_domain'
    | 'white_label_logo_url'
    | 'white_label_primary_color'
    | 'white_label_accent_color'
    | 'white_label_company_name'
    | 'logo_url'
    | 'brand_color'
    | 'custom_welcome_msg'
    | 'preferred_font'
    | 'wobble_intensity'
  >
>

export type ProjectInsert = Omit<Project, 'id' | 'created_at' | 'updated_at' | 'magic_token' | 'asset_requests' | 'submissions_count' | 'completed_submissions_count'>

export type ProjectUpdate = Partial<
  Omit<Project, 'id' | 'created_at' | 'owner_id' | 'magic_token' | 'asset_requests' | 'submissions_count' | 'completed_submissions_count'>
>

export type AssetRequestInsert = Omit<AssetRequest, 'id' | 'created_at' | 'updated_at' | 'submission'>

export type AssetRequestUpdate = Partial<Omit<AssetRequest, 'id' | 'created_at' | 'project_id' | 'submission'>>

export type SubmissionInsert = Omit<Submission, 'id' | 'created_at' | 'updated_at' | 'status' | 'rejection_reason' | 'ai_audit_result' | 'ai_audit_status' | 'comments' | 'version'>

export type CommentInsert = Omit<Comment, 'id' | 'created_at'>

// ─────────────────────────────────────────────────────────────────────
// Supabase Database type (for typed client)
// ─────────────────────────────────────────────────────────────────────

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Partial<Profile> & { id: string; email: string }
        Update: ProfileUpdate
      }
      projects: {
        Row: Project
        Insert: ProjectInsert
        Update: ProjectUpdate
      }
      asset_requests: {
        Row: AssetRequest
        Insert: AssetRequestInsert
        Update: AssetRequestUpdate
      }
      submissions: {
        Row: Submission
        Insert: SubmissionInsert
        Update: Partial<Omit<Submission, 'id' | 'created_at' | 'asset_request_id' | 'project_id'>>
      }
      comments: {
        Row: Comment
        Insert: CommentInsert
        Update: never
      }
      notifications: {
        Row: Notification
        Insert: Omit<Notification, 'id' | 'created_at' | 'read'>
        Update: Pick<Notification, 'read'>
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_project_by_token: {
        Args: { token: string }
        Returns: Project[]
      }
      get_project_progress: {
        Args: { project_uuid: string }
        Returns: { total: number; completed: number; percentage: number }[]
      }
    }
    Enums: {
      plan_tier: PlanTier
      project_status: ProjectStatus
      request_type: RequestType
      submission_status: SubmissionStatus
      ai_audit_status: AiAuditStatus
    }
  }
}
