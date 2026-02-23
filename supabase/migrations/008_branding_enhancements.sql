-- Migration 008: Extended Branding Hub
-- Adds portal background color, card color, tagline, and branding visibility

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS portal_bg_color   TEXT    DEFAULT '#fdfbf7',
  ADD COLUMN IF NOT EXISTS portal_card_color TEXT    DEFAULT '#fff9c4',
  ADD COLUMN IF NOT EXISTS agency_tagline    TEXT    DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS hide_branding     BOOLEAN DEFAULT false;
