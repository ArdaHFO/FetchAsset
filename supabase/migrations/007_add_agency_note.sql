-- ─────────────────────────────────────────────────────────────────────
-- MIGRATION 007: Add agency_note to submissions
-- Freelancer can leave a note per submission that the client sees in portal
-- Run this in Supabase SQL Editor
-- ─────────────────────────────────────────────────────────────────────

alter table public.submissions
  add column if not exists agency_note text;
