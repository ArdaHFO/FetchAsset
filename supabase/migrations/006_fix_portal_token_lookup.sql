-- ─────────────────────────────────────────────────────────────────────
-- MIGRATION 006: Fix get_project_by_token to include draft status
-- Portal was returning 404 because new projects are created as 'draft'
-- Run this in Supabase SQL Editor
-- ─────────────────────────────────────────────────────────────────────

create or replace function public.get_project_by_token(token text)
returns setof public.projects
language sql
security definer set search_path = public
as $$
  select *
  from public.projects
  where magic_token = token
    and (magic_token_expires_at is null or magic_token_expires_at > now())
    and status in ('draft', 'active', 'completed');
$$;

comment on function public.get_project_by_token is
  'Returns project for a valid magic token. Used by unauthenticated client portal.';
