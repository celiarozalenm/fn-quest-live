-- Migration: Add users table to track user logins

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  user_type TEXT CHECK (user_type IN ('employee', 'community')),
  first_login TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ DEFAULT NOW(),
  login_count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login DESC);

-- RLS for users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow public insert/update for users (login tracking)
CREATE POLICY "Allow public upsert for users"
  ON users FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update for users"
  ON users FOR UPDATE
  USING (true);

-- Service role bypass for admin operations
CREATE POLICY "Service role bypass for users"
  ON users FOR ALL
  USING (current_setting('role') = 'service_role');

-- Service role bypass for results (admin needs to read all results)
CREATE POLICY "Service role bypass for results"
  ON results FOR ALL
  USING (current_setting('role') = 'service_role');
