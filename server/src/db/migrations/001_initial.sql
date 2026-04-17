-- Initial migration for NexaDial
-- Run this in the Supabase SQL Editor

-- Calls Table
CREATE TABLE IF NOT EXISTS calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_sid TEXT UNIQUE,           -- Twilio Call SID
  direction TEXT,                  -- 'inbound' | 'outbound'
  status TEXT,                     -- 'initiated'|'ringing'|'in-progress'|'completed'|'failed'|'busy'|'no-answer'
  from_number TEXT NOT NULL,
  to_number TEXT NOT NULL,
  twilio_number TEXT,              -- which Twilio number was used
  duration INTEGER DEFAULT 0,     -- seconds
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages Table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_sid TEXT UNIQUE,        -- Twilio Message SID
  direction TEXT,                  -- 'inbound' | 'outbound'
  status TEXT,                     -- 'queued'|'sending'|'sent'|'delivered'|'failed'|'received'
  from_number TEXT NOT NULL,
  to_number TEXT NOT NULL,
  twilio_number TEXT,
  body TEXT,
  num_media INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Settings Table
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_sid TEXT,
  auth_token TEXT,
  api_key TEXT,
  api_secret TEXT,
  twiml_app_sid TEXT,
  phone_numbers JSONB DEFAULT '[]',   -- array of {number, label, isPrimary}
  primary_number TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indices for performance
CREATE INDEX idx_calls_sid ON calls(call_sid);
CREATE INDEX idx_messages_sid ON messages(message_sid);
CREATE INDEX idx_messages_participants ON messages(from_number, to_number);
