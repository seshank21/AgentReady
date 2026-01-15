-- Migration to add currency column to existing scans table
-- Run this in your Supabase SQL Editor

ALTER TABLE scans 
ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'USD';

-- Update existing records to have USD as default
UPDATE scans 
SET currency = 'USD' 
WHERE currency IS NULL;
