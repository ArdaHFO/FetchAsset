-- =====================================================================
-- FetchAsset — Migration 002: Row Level Security Policies
-- Run AFTER 001_initial_schema.sql
-- =====================================================================

-- ─────────────────────────────────────────────────────────────────────
-- Enable RLS on all tables
-- ─────────────────────────────────────────────────────────────────────

alter table public.profiles           enable row level security;
alter table public.projects           enable row level security;
alter table public.asset_requests     enable row level security;
alter table public.submissions        enable row level security;
alter table public.comments           enable row level security;
alter table public.notifications      enable row level security;
alter table public.document_embeddings enable row level security;

-- ─────────────────────────────────────────────────────────────────────
-- PROFILES
-- ─────────────────────────────────────────────────────────────────────

-- Users can only see their own profile
create policy "profiles: owner select"
  on public.profiles for select
  using (auth.uid() = id);

-- Users can only update their own profile
create policy "profiles: owner update"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Profiles are auto-inserted by the handle_new_user trigger (security definer)
-- No INSERT policy needed for authenticated users — trigger handles it.

-- ─────────────────────────────────────────────────────────────────────
-- PROJECTS
-- ─────────────────────────────────────────────────────────────────────

-- Agency: full CRUD on own projects
create policy "projects: owner select"
  on public.projects for select
  using (auth.uid() = owner_id);

create policy "projects: owner insert"
  on public.projects for insert
  with check (auth.uid() = owner_id);

create policy "projects: owner update"
  on public.projects for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "projects: owner delete"
  on public.projects for delete
  using (auth.uid() = owner_id);

-- NOTE: Client portal access (magic token) is handled server-side via:
--   get_project_by_token() function (security definer) in API routes
--   The admin client (service role) is used for all client portal operations.

-- ─────────────────────────────────────────────────────────────────────
-- ASSET REQUESTS
-- ─────────────────────────────────────────────────────────────────────

-- Agency: full CRUD on requests belonging to their projects
create policy "asset_requests: owner select"
  on public.asset_requests for select
  using (
    exists (
      select 1 from public.projects p
      where p.id = asset_requests.project_id
        and p.owner_id = auth.uid()
    )
  );

create policy "asset_requests: owner insert"
  on public.asset_requests for insert
  with check (
    exists (
      select 1 from public.projects p
      where p.id = asset_requests.project_id
        and p.owner_id = auth.uid()
    )
  );

create policy "asset_requests: owner update"
  on public.asset_requests for update
  using (
    exists (
      select 1 from public.projects p
      where p.id = asset_requests.project_id
        and p.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.projects p
      where p.id = asset_requests.project_id
        and p.owner_id = auth.uid()
    )
  );

create policy "asset_requests: owner delete"
  on public.asset_requests for delete
  using (
    exists (
      select 1 from public.projects p
      where p.id = asset_requests.project_id
        and p.owner_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────────────────────────────────
-- SUBMISSIONS
-- ─────────────────────────────────────────────────────────────────────

-- Agency: select/update submissions for their projects
create policy "submissions: owner select"
  on public.submissions for select
  using (
    exists (
      select 1 from public.projects p
      where p.id = submissions.project_id
        and p.owner_id = auth.uid()
    )
  );

create policy "submissions: owner update"
  on public.submissions for update
  using (
    exists (
      select 1 from public.projects p
      where p.id = submissions.project_id
        and p.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.projects p
      where p.id = submissions.project_id
        and p.owner_id = auth.uid()
    )
  );

-- Agency: delete submissions (e.g. asking client to re-upload)
create policy "submissions: owner delete"
  on public.submissions for delete
  using (
    exists (
      select 1 from public.projects p
      where p.id = submissions.project_id
        and p.owner_id = auth.uid()
    )
  );

-- NOTE: Client INSERT/UPDATE for submissions uses the admin client (service role)
-- in the /api/portal/* route handlers after validating the magic token.
-- This avoids needing anon-role INSERT policies which are a security footgun.

-- ─────────────────────────────────────────────────────────────────────
-- COMMENTS
-- ─────────────────────────────────────────────────────────────────────

-- Agency can see and add comments on submissions they own
create policy "comments: owner select"
  on public.comments for select
  using (
    exists (
      select 1
      from public.submissions s
      join public.projects p on p.id = s.project_id
      where s.id = comments.submission_id
        and p.owner_id = auth.uid()
    )
  );

create policy "comments: owner insert"
  on public.comments for insert
  with check (
    auth.uid() is not null
    and author_type = 'agency'
    and author_id = auth.uid()
    and exists (
      select 1
      from public.submissions s
      join public.projects p on p.id = s.project_id
      where s.id = comments.submission_id
        and p.owner_id = auth.uid()
    )
  );

-- NOTE: Client comments ('client' author_type) use the admin client in API routes.

-- ─────────────────────────────────────────────────────────────────────
-- NOTIFICATIONS
-- ─────────────────────────────────────────────────────────────────────

create policy "notifications: owner select"
  on public.notifications for select
  using (auth.uid() = profile_id);

create policy "notifications: owner update"
  on public.notifications for update
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

-- Notifications are created by API routes / triggers (service role)
-- No user INSERT policy needed.

-- ─────────────────────────────────────────────────────────────────────
-- DOCUMENT EMBEDDINGS
-- ─────────────────────────────────────────────────────────────────────

-- Agency can only search/read their own document embeddings
create policy "embeddings: owner select"
  on public.document_embeddings for select
  using (auth.uid() = owner_id);

-- Embeddings are inserted by server-side AI pipeline (service role)
-- No user INSERT policy needed.

-- ─────────────────────────────────────────────────────────────────────
-- REALTIME (enable for live dashboard updates)
-- ─────────────────────────────────────────────────────────────────────

-- Allow realtime subscriptions for authenticated users on these tables
alter publication supabase_realtime add table public.submissions;
alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.projects;
