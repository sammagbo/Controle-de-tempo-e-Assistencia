-- ============================================
-- MIGRAÇÃO: HABILITAR RLS COM ISOLAMENTO POR USUÁRIO
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- 1. Adicionar user_id à tabela meetings
ALTER TABLE meetings
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Backfill: reuniões existentes sem user_id ficam inacessíveis por RLS.
--    Se quiser atribuir ao seu usuário, rode primeiro:
--    UPDATE meetings SET user_id = auth.uid() WHERE user_id IS NULL;
--    Ou no dashboard do Supabase: Table Editor → meetings → edite manualmente.

-- ============================================
-- 3. HABILITAR RLS EM TODAS AS TABELAS
-- ============================================

ALTER TABLE periods       ENABLE ROW LEVEL SECURITY;
ALTER TABLE weeks         ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings      ENABLE ROW LEVEL SECURITY;
ALTER TABLE agenda_items  ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance    ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments      ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants  ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 4. POLÍTICAS: periods e weeks (cronograma oficial - leitura global)
-- ============================================

DROP POLICY IF EXISTS "periods_select" ON periods;
CREATE POLICY "periods_select" ON periods
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "weeks_select" ON weeks;
CREATE POLICY "weeks_select" ON weeks
  FOR SELECT TO authenticated
  USING (true);

-- ============================================
-- 5. POLÍTICAS: meetings (isolado por user_id)
-- ============================================

DROP POLICY IF EXISTS "meetings_select" ON meetings;
CREATE POLICY "meetings_select" ON meetings
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "meetings_insert" ON meetings;
CREATE POLICY "meetings_insert" ON meetings
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "meetings_update" ON meetings;
CREATE POLICY "meetings_update" ON meetings
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "meetings_delete" ON meetings;
CREATE POLICY "meetings_delete" ON meetings
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- ============================================
-- 6. POLÍTICAS: agenda_items (acesso via propriedade da reunião)
-- ============================================

DROP POLICY IF EXISTS "agenda_items_select" ON agenda_items;
CREATE POLICY "agenda_items_select" ON agenda_items
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM meetings m WHERE m.id = meeting_id AND m.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "agenda_items_insert" ON agenda_items;
CREATE POLICY "agenda_items_insert" ON agenda_items
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM meetings m WHERE m.id = meeting_id AND m.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "agenda_items_update" ON agenda_items;
CREATE POLICY "agenda_items_update" ON agenda_items
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM meetings m WHERE m.id = meeting_id AND m.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "agenda_items_delete" ON agenda_items;
CREATE POLICY "agenda_items_delete" ON agenda_items
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM meetings m WHERE m.id = meeting_id AND m.user_id = auth.uid()
  ));

-- ============================================
-- 7. POLÍTICAS: attendance (acesso via propriedade da reunião)
-- ============================================

DROP POLICY IF EXISTS "attendance_select" ON attendance;
CREATE POLICY "attendance_select" ON attendance
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM meetings m WHERE m.id = meeting_id AND m.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "attendance_insert" ON attendance;
CREATE POLICY "attendance_insert" ON attendance
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM meetings m WHERE m.id = meeting_id AND m.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "attendance_update" ON attendance;
CREATE POLICY "attendance_update" ON attendance
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM meetings m WHERE m.id = meeting_id AND m.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "attendance_delete" ON attendance;
CREATE POLICY "attendance_delete" ON attendance
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM meetings m WHERE m.id = meeting_id AND m.user_id = auth.uid()
  ));

-- ============================================
-- 8. POLÍTICAS: comments (acesso via propriedade da reunião)
-- ============================================

DROP POLICY IF EXISTS "comments_select" ON comments;
CREATE POLICY "comments_select" ON comments
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM meetings m WHERE m.id = meeting_id AND m.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "comments_insert" ON comments;
CREATE POLICY "comments_insert" ON comments
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM meetings m WHERE m.id = meeting_id AND m.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "comments_update" ON comments;
CREATE POLICY "comments_update" ON comments
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM meetings m WHERE m.id = meeting_id AND m.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "comments_delete" ON comments;
CREATE POLICY "comments_delete" ON comments
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM meetings m WHERE m.id = meeting_id AND m.user_id = auth.uid()
  ));

-- ============================================
-- 9. POLÍTICAS: participants (leitura global)
-- ============================================

DROP POLICY IF EXISTS "participants_select" ON participants;
CREATE POLICY "participants_select" ON participants
  FOR SELECT TO authenticated
  USING (true);

-- ============================================
-- VERIFICAÇÃO FINAL
-- ============================================
SELECT
  schemaname,
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
