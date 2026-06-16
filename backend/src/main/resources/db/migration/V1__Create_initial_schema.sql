-- V1: Criação Inicial do Schema
-- Banco desvinculado de funções nativas do Supabase (sem auth.users, sem policies na tabela)

CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- Para gen_random_uuid() caso precise em verões mais antigas, nativo no PG13+

-- 1. USERS (Substitui auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. PERIODS
CREATE TABLE periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. WEEKS
CREATE TABLE weeks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_id UUID REFERENCES periods(id) ON DELETE CASCADE,
  label VARCHAR(255) NOT NULL,
  date_range VARCHAR(255) NOT NULL,
  theme VARCHAR(255),
  status VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. MEETINGS
CREATE TABLE meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_id UUID REFERENCES weeks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  meeting_day VARCHAR(255) NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE,
  finished_at TIMESTAMP WITH TIME ZONE,
  total_duration_seconds INTEGER,
  president VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. AGENDA_ITEMS
CREATE TABLE agenda_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  estimated_minutes INTEGER NOT NULL,
  actual_seconds INTEGER DEFAULT 0,
  position INTEGER NOT NULL,
  status VARCHAR(50) DEFAULT 'upcoming',
  section VARCHAR(100) NOT NULL DEFAULT 'abertura',
  allows_comments BOOLEAN DEFAULT false,
  requires_post_comment BOOLEAN DEFAULT false,
  assigned_names VARCHAR(255) DEFAULT '',
  skip_timing BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. ATTENDANCE
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  count INTEGER NOT NULL DEFAULT 0,
  presencial INTEGER NOT NULL DEFAULT 0,
  zoom INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. COMMENTS
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  agenda_item_id UUID REFERENCES agenda_items(id) ON DELETE SET NULL,
  duration_seconds INTEGER NOT NULL,
  comment_type VARCHAR(50) DEFAULT 'manual',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
