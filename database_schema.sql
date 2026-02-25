-- Rony.DB Database Schema
-- WARNING: This will DROP all existing tables and recreate them fresh
-- Run this SQL in your Supabase SQL Editor to restore the database structure

-- ============================================
-- DROP ALL EXISTING TABLES (CLEAN SLATE)
-- ============================================

-- Drop tables with CASCADE to remove all dependencies
-- DROP TABLE IF EXISTS handles non-existent tables gracefully
DROP TABLE IF EXISTS public.keepalive CASCADE;
DROP TABLE IF EXISTS public."backup-restore" CASCADE;
DROP TABLE IF EXISTS public.login_attempts CASCADE;
DROP TABLE IF EXISTS public.allowed_emails CASCADE;
DROP TABLE IF EXISTS public.cv_data CASCADE;

-- ============================================
-- 1. CV Data Table (Main application data)
-- ============================================
CREATE TABLE public.cv_data (
    id TEXT PRIMARY KEY,
    data TEXT NOT NULL,  -- Encrypted JSON data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.cv_data IS 'Stores encrypted CV/portfolio data';

-- ============================================
-- 2. Allowed Emails Table (Authentication)
-- ============================================
CREATE TABLE public.allowed_emails (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,  -- Encrypted
    password_hash TEXT NOT NULL,  -- Encrypted
    name TEXT,  -- Encrypted
    role TEXT DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.allowed_emails IS 'Stores encrypted user credentials for authentication';

-- ============================================
-- 3. Login Attempts Table (Security)
-- ============================================
CREATE TABLE public.login_attempts (
    email TEXT PRIMARY KEY,
    attempt_count INTEGER DEFAULT 0,
    last_attempt TIMESTAMP WITH TIME ZONE,
    lockout_until TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.login_attempts IS 'Tracks login attempts for brute force protection';

-- ============================================
-- 4. Backup-Restore Table
-- ============================================
CREATE TABLE public."backup-restore" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    data TEXT NOT NULL,  -- Encrypted backup data
    created_at TEXT,  -- Human readable timestamp (e.g., "Backup created at 2024-01-15 + 10:30:15 BD")
    backup_number INTEGER DEFAULT 0
);

COMMENT ON TABLE public."backup-restore" IS 'Stores encrypted backup snapshots of cv_data';

-- ============================================
-- 5. Keepalive Table (For cron job monitoring)
-- ============================================
CREATE TABLE public.keepalive (
    id TEXT PRIMARY KEY,
    updated TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.keepalive IS 'Timestamp for keepalive cron job';

-- ============================================
-- Enable Row Level Security (RLS)
-- ============================================
ALTER TABLE public.cv_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.allowed_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."backup-restore" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.keepalive ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS Policies for cv_data
-- ============================================

-- Allow anyone to read cv_data (public portfolio data)
CREATE POLICY "Allow public read access to cv_data"
    ON public.cv_data
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- Allow authenticated users to update cv_data
CREATE POLICY "Allow authenticated users to update cv_data"
    ON public.cv_data
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- ============================================
-- RLS Policies for allowed_emails
-- ============================================

-- Allow anonymous and authenticated users to read allowed_emails (for login validation)
-- Note: anon needs access because users are not yet authenticated during login
CREATE POLICY "Allow anonymous and authenticated users to read allowed_emails"
    ON public.allowed_emails
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- Allow authenticated users to manage allowed_emails
CREATE POLICY "Allow authenticated users to manage allowed_emails"
    ON public.allowed_emails
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- ============================================
-- RLS Policies for login_attempts
-- ============================================

-- Allow anonymous users to read login_attempts (for lockout checking during login)
CREATE POLICY "Allow anonymous users to read login_attempts"
    ON public.login_attempts
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- Allow anonymous users to insert/update login_attempts (to track failed attempts)
CREATE POLICY "Allow anonymous users to upsert login_attempts"
    ON public.login_attempts
    FOR ALL
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- ============================================
-- RLS Policies for backup-restore
-- ============================================

-- Allow authenticated users full access to backup-restore
CREATE POLICY "Allow authenticated users full access to backup-restore"
    ON public."backup-restore"
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- ============================================
-- RLS Policies for keepalive
-- ============================================

-- Allow authenticated users to manage keepalive
CREATE POLICY "Allow authenticated users to manage keepalive"
    ON public.keepalive
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Allow service role to manage keepalive (for cron jobs)
CREATE POLICY "Allow service role to manage keepalive"
    ON public.keepalive
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ============================================
-- Indexes for performance
-- ============================================
CREATE INDEX idx_cv_data_id ON public.cv_data(id);
CREATE INDEX idx_allowed_emails_email ON public.allowed_emails(email);
CREATE INDEX idx_login_attempts_email ON public.login_attempts(email);
CREATE INDEX idx_backup_restore_number ON public."backup-restore"(backup_number);

-- ============================================
-- Default Data Insertion
-- ============================================

-- Keepalive record for cron job
INSERT INTO public.keepalive (id, updated)
VALUES ('main', 'initialized');

-- ============================================
-- Demo Data Insertion
-- ============================================

INSERT INTO public.allowed_emails (email, password_hash, name, role) VALUES 
('U2FsdGVkX1+aGYgWmEL/iZGDm574lEp4gw0aGC51WNHnLMsU7c7TVe9c0XKoaJ4t', 'U2FsdGVkX1/+ZvnkPpTmy0DXJkcCUQfI7bMZb/2CTEbAZMhYQSQAO3tS1ecfSoO5KV8t+J2A0tHyoNTnecWg86jxdn/jblYhuMBCiKnt0hWeHw2w/mdc5AEdNHoewfgQ', 'U2FsdGVkX1/zyyVQ4gloZ/yEjchjuM2r+01BNfHYxn6BDG0dGARD5N0bi8donAaP', 'admin');

-- Initial CV Data (encrypted JSON)
INSERT INTO public.cv_data (id, data) VALUES 
('main', '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');
