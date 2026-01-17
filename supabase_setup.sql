-- ============================================
-- SCRIPT SQL PARA ESTRUTURA DA REUNIÃO
-- ============================================
-- Cole este script no SQL Editor do Supabase e clique "Run"

-- 1. PERIODS (Períodos)
CREATE TABLE IF NOT EXISTS periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. WEEKS (Semanas)
CREATE TABLE IF NOT EXISTS weeks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_id UUID REFERENCES periods(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  date_range TEXT NOT NULL,
  theme TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. MEETINGS (Reuniões)
CREATE TABLE IF NOT EXISTS meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_id UUID REFERENCES weeks(id) ON DELETE CASCADE,
  meeting_day TEXT NOT NULL,
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  total_duration_seconds INTEGER,
  president TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Migração para corrigir constraint em bancos existentes
DO $$
BEGIN
  -- Remove constraint antiga se existir (mesmo a padrão ou incorreta)
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'meetings_week_id_fkey') THEN
    ALTER TABLE meetings DROP CONSTRAINT meetings_week_id_fkey;
  END IF;

  -- Adiciona nova constraint com CASCADE para permitir deletar semanas
  ALTER TABLE meetings 
    ADD CONSTRAINT meetings_week_id_fkey 
    FOREIGN KEY (week_id) 
    REFERENCES weeks(id) 
    ON DELETE CASCADE;
END $$;

-- 4. AGENDA_ITEMS (Partes da reunião) - ATUALIZADO COM SEÇÕES
CREATE TABLE IF NOT EXISTS agenda_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  estimated_minutes INTEGER NOT NULL,
  actual_seconds INTEGER DEFAULT 0,
  position INTEGER NOT NULL,
  status TEXT DEFAULT 'upcoming',
  -- NOVOS CAMPOS PARA ESTRUTURA DA REUNIÃO
  section TEXT NOT NULL DEFAULT 'abertura',  -- abertura, tesouros, ministerio, vida_crista, encerramento
  allows_comments BOOLEAN DEFAULT false,      -- true se parte aceita comentários
  requires_post_comment BOOLEAN DEFAULT false, -- true para partes de alunos
  assigned_names TEXT DEFAULT '',              -- nomes dos irmãos designados (ex: "Ionara / Laura")
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Adicionar colunas se não existirem (para bancos existentes)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'agenda_items' AND column_name = 'section') THEN
    ALTER TABLE agenda_items ADD COLUMN section TEXT NOT NULL DEFAULT 'abertura';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'agenda_items' AND column_name = 'allows_comments') THEN
    ALTER TABLE agenda_items ADD COLUMN allows_comments BOOLEAN DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'agenda_items' AND column_name = 'requires_post_comment') THEN
    ALTER TABLE agenda_items ADD COLUMN requires_post_comment BOOLEAN DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'agenda_items' AND column_name = 'assigned_names') THEN
    ALTER TABLE agenda_items ADD COLUMN assigned_names TEXT DEFAULT '';
  END IF;
END $$;

-- 5. ATTENDANCE (Assistência)
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  count INTEGER NOT NULL DEFAULT 0,  -- Legacy, keep for compatibility
  presencial INTEGER NOT NULL DEFAULT 0,
  zoom INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Adicionar colunas presencial/zoom se não existirem (para bancos existentes)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'attendance' AND column_name = 'presencial') THEN
    ALTER TABLE attendance ADD COLUMN presencial INTEGER NOT NULL DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'attendance' AND column_name = 'zoom') THEN
    ALTER TABLE attendance ADD COLUMN zoom INTEGER NOT NULL DEFAULT 0;
  END IF;
END $$;

-- 6. COMMENTS (Comentários)
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  agenda_item_id UUID REFERENCES agenda_items(id) ON DELETE SET NULL,
  duration_seconds INTEGER NOT NULL,
  comment_type TEXT DEFAULT 'manual', -- manual, post_student (após parte de aluno)
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Adicionar coluna comment_type se não existir
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'comments' AND column_name = 'comment_type') THEN
    ALTER TABLE comments ADD COLUMN comment_type TEXT DEFAULT 'manual';
  END IF;
END $$;

-- 7. PARTICIPANTS (Participantes - opcional)
CREATE TABLE IF NOT EXISTS participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- DADOS DE EXEMPLO
-- ============================================

-- Inserir período se não existir
INSERT INTO periods (name, start_date, end_date)
SELECT 'Janeiro - Fevereiro 2026', '2026-01-01', '2026-02-28'
WHERE NOT EXISTS (SELECT 1 FROM periods WHERE name = 'Janeiro - Fevereiro 2026');

-- Inserir semanas vinculadas ao período
DO $$
DECLARE
  period_uuid UUID;
BEGIN
  SELECT id INTO period_uuid FROM periods WHERE name = 'Janeiro - Fevereiro 2026' LIMIT 1;
  
  IF period_uuid IS NOT NULL THEN
    DELETE FROM weeks WHERE period_id = period_uuid;
    
    INSERT INTO weeks (period_id, label, date_range, theme) VALUES
      (period_uuid, 'Semana 01', '6-12 Janeiro', 'O que aprendemos com a queda de Sebna'),
      (period_uuid, 'Semana 02', '13-19 Janeiro', 'Lições do profeta Isaías'),
      (period_uuid, 'Semana 03', '20-26 Janeiro', 'Permaneça fiel a Jeová'),
      (period_uuid, 'Semana 04', '27 Jan - 2 Fev', 'A importância da oração'),
      (period_uuid, 'Semana 05', '3-9 Fevereiro', 'Confiando nas promessas de Deus'),
      (period_uuid, 'Semana 06', '10-16 Fevereiro', 'O valor da humildade'),
      (period_uuid, 'Semana 07', '17-23 Fevereiro', 'Mantendo a integridade'),
      (period_uuid, 'Semana 08', '24-28 Fevereiro', 'Amor ao próximo');
  END IF;
END $$;

-- Desabilitar RLS para desenvolvimento
ALTER TABLE periods DISABLE ROW LEVEL SECURITY;
ALTER TABLE weeks DISABLE ROW LEVEL SECURITY;
ALTER TABLE meetings DISABLE ROW LEVEL SECURITY;
ALTER TABLE agenda_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE attendance DISABLE ROW LEVEL SECURITY;
ALTER TABLE comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE participants DISABLE ROW LEVEL SECURITY;

-- Verificar resultado
SELECT 'Schema atualizado com sucesso!' AS resultado;

-- ============================================
-- LIMPEZA DE DUPLICATAS (EXECUÇÃO OPCIONAL)
-- ============================================
-- Remove períodos duplicados que não possuem semanas vinculadas
DO $$
BEGIN
  DELETE FROM periods 
  WHERE name = 'Janeiro - Fevereiro 2026' 
  AND id NOT IN (SELECT DISTINCT period_id FROM weeks);
END $$;

-- Adicionar coluna (president - Presidente) à tabela meetings se não existir
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'meetings' AND column_name = 'president') THEN
    ALTER TABLE meetings ADD COLUMN president TEXT;
  END IF;
END $$;
