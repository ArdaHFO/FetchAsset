-- ─────────────────────────────────────────────────────────────────────
-- MIGRATION 005: Add missing columns to projects and asset_requests
-- Run this in Supabase SQL Editor
-- ─────────────────────────────────────────────────────────────────────

-- projects: scheduling / reminder / contact support fields
alter table public.projects
  add column if not exists buffer_days     integer      not null default 0,
  add column if not exists auto_reminder   boolean      not null default false,
  add column if not exists contact_method  text         check (contact_method in ('email', 'whatsapp')),
  add column if not exists contact_value   text,
  add column if not exists contact_visible boolean      not null default true;

-- asset_requests: AI naming rule + custom instructions
alter table public.asset_requests
  add column if not exists custom_instructions  text,
  add column if not exists naming_rule          boolean  not null default false;
