-- ============================================
-- Neon Database Schema for MegaPixel AI
-- ============================================
-- Run this SQL in your Neon SQL Editor
-- Console -> SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Users Table
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  images_processed INTEGER DEFAULT 0,
  tools_used JSONB DEFAULT '[]'::jsonb,
  has_discount BOOLEAN DEFAULT true,
  plan TEXT DEFAULT 'free',
  CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- ============================================
-- User History Table
-- ============================================
CREATE TABLE IF NOT EXISTS user_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tool_name TEXT NOT NULL,
  thumbnail TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Indexes for faster history queries
CREATE INDEX IF NOT EXISTS idx_user_history_user_id ON user_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_history_created_at ON user_history(created_at DESC);

-- ============================================
-- User Sessions Table (for JWT alternative)
-- ============================================
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_session_user FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Index for session lookups
CREATE INDEX IF NOT EXISTS idx_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON user_sessions(expires_at);

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================
-- DISABLED: Using custom authentication with service_role key
-- RLS is not needed since API validates users server-side

-- Disable RLS on all tables (for custom auth)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions DISABLE ROW LEVEL SECURITY;

-- Note: In production, consider implementing API-level access controls
-- instead of database-level RLS when using custom authentication.

-- ============================================
-- Functions for automatic timestamp updates
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Cleanup function for expired sessions
-- ============================================
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM user_sessions WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Sample Data (Optional - for testing)
-- ============================================
-- Uncomment to insert test user (password: "test123")
-- INSERT INTO users (email, name, password_hash, has_discount) 
-- VALUES (
--   'test@example.com', 
--   'Test User', 
--   '$2a$10$XYZ...', -- Use bcrypt hash for "test123"
--   true
-- );

-- ============================================
-- Verification Queries
-- ============================================
-- Run these to verify setup:
-- SELECT * FROM users;
-- SELECT * FROM user_history;
-- SELECT * FROM user_sessions;
