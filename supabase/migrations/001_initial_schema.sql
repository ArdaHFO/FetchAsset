-- =====================================================================
-- FetchAsset — Migration 001: Initial Schema
-- Run this in Supabase SQL Editor or via: supabase db push
-- =====================================================================

-- Enable required extensions
create extension if not exists "pgcrypto";
create extension if not exists "vector";         -- for RAG in Step 6

-- ─────────────────────────────────────────────────────────────────────
-- Custom Enum Types
-- ─────────────────────────────────────────────────────────────────────

create type plan_tier as enum ('free', 'pro', 'agency');

create type project_status as enum ('draft', 'active', 'completed', 'archived');

create type request_type as enum (
  'file',
  'text',
  'password',
  'multiple_choice',
  'url'
);

create type submission_status as enum (
  'pending_review',
  'approved',
  'rejected'
);

create type ai_audit_status as enum (
  'pending',
  'processing',
  'complete',
  'error'
);

create type comment_author_type as enum ('agency', 'client');

create type notification_type as enum (
  'submission_received',
  'submission_approved',
  'submission_rejected',
  'ai_audit_complete',
  'reminder_sent',
  'project_completed',
  'magic_link_opened'
);

-- ─────────────────────────────────────────────────────────────────────
-- TABLE: profiles
-- Extends auth.users one-to-one. Created automatically on sign-up.
-- ─────────────────────────────────────────────────────────────────────

create table public.profiles (
  id                            uuid        primary key references auth.users(id) on delete cascade,
  created_at                    timestamptz not null default now(),
  updated_at                    timestamptz not null default now(),
  email                         text        not null,
  full_name                     text,
  avatar_url                    text,

  -- Subscription
  plan                          plan_tier   not null default 'free',
  stripe_customer_id            text        unique,
  stripe_subscription_id        text        unique,
  stripe_subscription_status    text,       -- 'active' | 'trialing' | 'past_due' | 'canceled'

  -- White-label (Agency plan only)
  white_label_domain            text        unique,
  white_label_logo_url          text,
  white_label_primary_color     text,
  white_label_accent_color      text,
  white_label_company_name      text
);

comment on table public.profiles is 'One profile per agency/freelancer account. Extends auth.users.';

-- ─────────────────────────────────────────────────────────────────────
-- TABLE: projects
-- Each onboarding portal = one project.
-- ─────────────────────────────────────────────────────────────────────

create table public.projects (
  id                    uuid            primary key default gen_random_uuid(),
  created_at            timestamptz     not null default now(),
  updated_at            timestamptz     not null default now(),
  owner_id              uuid            not null references public.profiles(id) on delete cascade,

  -- Client info
  client_name           text            not null,
  client_email          text            not null,

  -- Project metadata
  project_type          text,           -- e.g. 'Web Design', 'SEO Project', 'Branding'
  title                 text            not null,
  status                project_status  not null default 'draft',

  -- Magic link (client portal access)
  magic_token           text            not null unique default encode(gen_random_bytes(32), 'hex'),
  magic_token_expires_at timestamptz,   -- null = no expiry

  -- Scheduling
  due_date              timestamptz,

  -- Messaging
  notes                 text,           -- internal agency notes (not shown to client)
  custom_message        text            -- shown on portal open (e.g. "Hi Sarah, please upload...")
);

comment on table public.projects is 'Each row is one client onboarding portal.';
comment on column public.projects.magic_token is 'Unique token embedded in the magic link URL. Grants client access without auth.';

-- ─────────────────────────────────────────────────────────────────────
-- TABLE: asset_requests
-- Items in the project checklist that the client needs to complete.
-- ─────────────────────────────────────────────────────────────────────

create table public.asset_requests (
  id                    uuid            primary key default gen_random_uuid(),
  created_at            timestamptz     not null default now(),
  updated_at            timestamptz     not null default now(),
  project_id            uuid            not null references public.projects(id) on delete cascade,

  -- Ordering
  sort_order            integer         not null default 0,

  -- Request definition
  title                 text            not null,     -- e.g. "Logo Files"
  description           text,                        -- e.g. "Please provide SVG and PNG at 300dpi"
  request_type          request_type    not null default 'file',
  required              boolean         not null default true,

  -- File upload constraints (for request_type = 'file')
  allowed_file_types    text[],                      -- e.g. ARRAY['svg','png','pdf']
  max_file_size_mb      integer         default 50,
  multiple_files        boolean         not null default false,

  -- Multiple choice options (for request_type = 'multiple_choice')
  choices               text[],

  -- Example reference
  example_url           text,
  example_file_path     text
);

comment on table public.asset_requests is 'Checklist items the client must complete for a project.';

-- ─────────────────────────────────────────────────────────────────────
-- TABLE: submissions
-- Client responses/uploads for each asset_request.
-- ─────────────────────────────────────────────────────────────────────

create table public.submissions (
  id                    uuid              primary key default gen_random_uuid(),
  created_at            timestamptz       not null default now(),
  updated_at            timestamptz       not null default now(),
  asset_request_id      uuid              not null references public.asset_requests(id) on delete cascade,
  project_id            uuid              not null references public.projects(id) on delete cascade,

  -- Client identity (no auth account — captured from portal session)
  client_name           text              not null,

  -- Content (only one will be populated based on request_type)
  value_text            text,             -- for: text | password | multiple_choice | url

  -- File upload info (for request_type = 'file')
  file_name             text,
  file_path             text,             -- Supabase Storage path (bucket/path)
  file_size_bytes       bigint,
  file_mime_type        text,
  file_url              text,             -- cached public or signed URL

  -- Review status
  status                submission_status not null default 'pending_review',
  rejection_reason      text,

  -- AI analysis
  ai_audit_result       jsonb,            -- structured output from Llama 3.3
  ai_audit_status       ai_audit_status   not null default 'pending',

  -- Client note
  client_note           text,

  -- Unique constraint: one submission per request (client can re-submit by updating)
  unique (asset_request_id)
);

comment on table public.submissions is 'Client responses and file uploads for asset requests.';

-- ─────────────────────────────────────────────────────────────────────
-- TABLE: comments
-- Thread on a submission (agency <-> client dialogue).
-- ─────────────────────────────────────────────────────────────────────

create table public.comments (
  id                    uuid                primary key default gen_random_uuid(),
  created_at            timestamptz         not null default now(),
  submission_id         uuid                not null references public.submissions(id) on delete cascade,
  author_type           comment_author_type not null,
  author_id             uuid,               -- null for client comments (unauthenticated)
  content               text                not null check (char_length(content) > 0)
);

comment on table public.comments is 'Comment thread on a submission between agency and client.';

-- ─────────────────────────────────────────────────────────────────────
-- TABLE: notifications
-- In-app notifications for agency users.
-- ─────────────────────────────────────────────────────────────────────

create table public.notifications (
  id                    uuid              primary key default gen_random_uuid(),
  created_at            timestamptz       not null default now(),
  profile_id            uuid              not null references public.profiles(id) on delete cascade,
  project_id            uuid              references public.projects(id) on delete set null,
  type                  notification_type not null,
  title                 text              not null,
  body                  text              not null,
  read                  boolean           not null default false,
  link                  text
);

comment on table public.notifications is 'In-app notifications for agency users.';

-- ─────────────────────────────────────────────────────────────────────
-- TABLE: document_embeddings  (used in Step 6 — RAG)
-- Stores vector embeddings of uploaded documents for semantic search.
-- ─────────────────────────────────────────────────────────────────────

create table public.document_embeddings (
  id                    uuid          primary key default gen_random_uuid(),
  created_at            timestamptz   not null default now(),
  submission_id         uuid          not null references public.submissions(id) on delete cascade,
  project_id            uuid          not null references public.projects(id) on delete cascade,
  owner_id              uuid          not null references public.profiles(id) on delete cascade,
  content               text          not null,       -- extracted text chunk
  embedding             vector(1536),                 -- OpenAI/Nomic embedding dimension
  metadata              jsonb                         -- page number, chunk index, etc.
);

comment on table public.document_embeddings is 'Vector embeddings for RAG / semantic document search.';

-- ─────────────────────────────────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────────────────────────────────

-- Project lookups
create index idx_projects_owner_id    on public.projects (owner_id);
create index idx_projects_status      on public.projects (status);
create index idx_projects_magic_token on public.projects (magic_token);
create unique index idx_projects_magic_token_unique on public.projects (magic_token);

-- Asset request ordering
create index idx_asset_requests_project_id on public.asset_requests (project_id, sort_order);

-- Submission lookups
create index idx_submissions_project_id      on public.submissions (project_id);
create index idx_submissions_request_id      on public.submissions (asset_request_id);
create index idx_submissions_ai_audit_status on public.submissions (ai_audit_status)
  where ai_audit_status in ('pending', 'processing');

-- Comments
create index idx_comments_submission_id on public.comments (submission_id, created_at);

-- Notifications (unread fast query)
create index idx_notifications_profile_unread
  on public.notifications (profile_id, read, created_at desc)
  where read = false;

-- Vector similarity search
create index idx_embeddings_submission_id on public.document_embeddings (submission_id);
create index idx_embeddings_project_id    on public.document_embeddings (project_id);
create index idx_embeddings_owner_id      on public.document_embeddings (owner_id);
-- IVFFlat index for vector search (build after data is loaded)
-- create index idx_embeddings_vector on public.document_embeddings
--   using ivfflat (embedding vector_cosine_ops) with (lists = 100);

-- ─────────────────────────────────────────────────────────────────────
-- FUNCTIONS & TRIGGERS
-- ─────────────────────────────────────────────────────────────────────

-- Auto-update updated_at on any row change
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

create trigger trg_projects_updated_at
  before update on public.projects
  for each row execute function public.handle_updated_at();

create trigger trg_asset_requests_updated_at
  before update on public.asset_requests
  for each row execute function public.handle_updated_at();

create trigger trg_submissions_updated_at
  before update on public.submissions
  for each row execute function public.handle_updated_at();

-- Auto-create profile when auth.users row is inserted (on sign-up)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─────────────────────────────────────────────────────────────────────
-- DATABASE FUNCTIONS (exposed to API layer)
-- ─────────────────────────────────────────────────────────────────────

-- Get a project by magic token (used by client portal — bypasses RLS)
create or replace function public.get_project_by_token(token text)
returns setof public.projects
language sql
security definer set search_path = public
as $$
  select *
  from public.projects
  where magic_token = token
    and (magic_token_expires_at is null or magic_token_expires_at > now())
    and status in ('active', 'completed');
$$;

comment on function public.get_project_by_token is
  'Returns project for a valid magic token. Used by unauthenticated client portal.';

-- Get project progress summary
create or replace function public.get_project_progress(project_uuid uuid)
returns table (
  total       bigint,
  completed   bigint,
  percentage  integer
)
language sql
stable security definer set search_path = public
as $$
  select
    count(ar.id)                                          as total,
    count(s.id)  filter (where s.status = 'approved')    as completed,
    case
      when count(ar.id) = 0 then 0
      else round(
        (count(s.id) filter (where s.status = 'approved'))::numeric
        / count(ar.id) * 100
      )::integer
    end                                                   as percentage
  from public.asset_requests ar
  left join public.submissions s on s.asset_request_id = ar.id
  where ar.project_id = project_uuid;
$$;

comment on function public.get_project_progress is
  'Returns completion progress for a project: total requests, approved count, percentage.';

-- Regenerate a project magic token (security reset)
create or replace function public.regenerate_magic_token(project_uuid uuid)
returns text
language plpgsql
security definer set search_path = public
as $$
declare
  new_token text;
begin
  new_token := encode(gen_random_bytes(32), 'hex');
  update public.projects
  set magic_token = new_token,
      updated_at  = now()
  where id = project_uuid
    and owner_id = auth.uid();

  if not found then
    raise exception 'Project not found or permission denied';
  end if;

  return new_token;
end;
$$;

comment on function public.regenerate_magic_token is
  'Generates a new magic token for a project, invalidating the old client link.';
