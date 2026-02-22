-- FetchAsset — Migration 004: Add 'solo' to plan_tier enum
-- Run this in Supabase SQL Editor after the initial migrations.

alter type plan_tier add value if not exists 'solo';
