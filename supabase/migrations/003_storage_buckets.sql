-- =====================================================================
-- FetchAsset — Migration 003: Storage Buckets & Policies
-- Run AFTER 002_rls_policies.sql
-- =====================================================================

-- ─────────────────────────────────────────────────────────────────────
-- Storage Buckets
-- ─────────────────────────────────────────────────────────────────────

-- Main bucket for client-uploaded assets
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'submissions',
  'submissions',
  false,    -- private: access via signed URLs
  104857600, -- 100 MB max per file
  array[
    -- Documents
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv',
    -- Images
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'image/tiff',
    -- Design files
    'application/postscript',     -- .ai, .eps
    'application/zip',            -- .zip (design packages)
    'application/x-zip-compressed',
    -- Video
    'video/mp4',
    'video/quicktime',
    -- Audio
    'audio/mpeg',
    'audio/wav',
    -- Fonts
    'font/ttf',
    'font/otf',
    'font/woff',
    'font/woff2',
    'application/font-woff',
    'application/font-woff2'
  ]
)
on conflict (id) do nothing;

-- Bucket for agency white-label assets (logos, etc.)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'branding',
  'branding',
  true,     -- public: logos need to be served directly
  5242880,  -- 5 MB max
  array[
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml'
  ]
)
on conflict (id) do nothing;

-- Bucket for example files attached to asset_requests
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'examples',
  'examples',
  true,     -- public: clients need to see example files without auth
  20971520, -- 20 MB max
  null      -- allow all types for examples
)
on conflict (id) do nothing;

-- ─────────────────────────────────────────────────────────────────────
-- Storage RLS Policies: submissions bucket
-- ─────────────────────────────────────────────────────────────────────

-- Agency: can read files in their projects' folders
-- Path pattern: submissions/{project_id}/{asset_request_id}/{filename}
create policy "submissions bucket: owner select"
  on storage.objects for select
  using (
    bucket_id = 'submissions'
    and auth.uid() is not null
    and exists (
      select 1 from public.projects p
      where p.id::text = (string_to_array(name, '/'))[1]
        and p.owner_id = auth.uid()
    )
  );

-- Agency: can delete files in their projects' folders (e.g. asking for re-upload)
create policy "submissions bucket: owner delete"
  on storage.objects for delete
  using (
    bucket_id = 'submissions'
    and auth.uid() is not null
    and exists (
      select 1 from public.projects p
      where p.id::text = (string_to_array(name, '/'))[1]
        and p.owner_id = auth.uid()
    )
  );

-- Client uploads go through the server-side API (/api/portal/upload)
-- which uses the admin client (service role) — no anon INSERT policy needed.

-- ─────────────────────────────────────────────────────────────────────
-- Storage RLS Policies: branding bucket (public reads)
-- ─────────────────────────────────────────────────────────────────────

create policy "branding bucket: public select"
  on storage.objects for select
  using (bucket_id = 'branding');

-- Agency: can upload/update/delete their own branding files
-- Path pattern: branding/{profile_id}/{filename}
create policy "branding bucket: owner insert"
  on storage.objects for insert
  with check (
    bucket_id = 'branding'
    and auth.uid() is not null
    and (string_to_array(name, '/'))[1] = auth.uid()::text
  );

create policy "branding bucket: owner update"
  on storage.objects for update
  using (
    bucket_id = 'branding'
    and auth.uid() is not null
    and (string_to_array(name, '/'))[1] = auth.uid()::text
  );

create policy "branding bucket: owner delete"
  on storage.objects for delete
  using (
    bucket_id = 'branding'
    and auth.uid() is not null
    and (string_to_array(name, '/'))[1] = auth.uid()::text
  );

-- ─────────────────────────────────────────────────────────────────────
-- Storage RLS Policies: examples bucket (public reads, agency writes)
-- ─────────────────────────────────────────────────────────────────────

create policy "examples bucket: public select"
  on storage.objects for select
  using (bucket_id = 'examples');

create policy "examples bucket: owner insert"
  on storage.objects for insert
  with check (
    bucket_id = 'examples'
    and auth.uid() is not null
  );

create policy "examples bucket: owner delete"
  on storage.objects for delete
  using (
    bucket_id = 'examples'
    and auth.uid() is not null
    and exists (
      select 1 from public.projects p
      where p.owner_id = auth.uid()
        and p.id::text = (string_to_array(name, '/'))[1]
    )
  );
