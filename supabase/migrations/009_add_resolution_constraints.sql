-- ─────────────────────────────────────────────────────────────────────
-- MIGRATION 009: Add image resolution constraint fields to asset_requests
-- Run this in Supabase SQL Editor
-- ─────────────────────────────────────────────────────────────────────

alter table public.asset_requests
  add column if not exists min_width   integer,   -- minimum image width in pixels (e.g. 1920)
  add column if not exists min_height  integer;   -- minimum image height in pixels (e.g. 1080)
