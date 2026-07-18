-- V3: Cronograma oficial 2026 (Marco-Abril e Maio-Junho)
-- Fonte: lib/data/officialSchedule2026.ts. Janeiro-Fevereiro ja existe no V2 e nao e alterado.

INSERT INTO periods (id, name, start_date, end_date)
VALUES ('00000000-0000-0000-0000-000000000003', 'Março - Abril 2026', '2026-03-01', '2026-04-30')
ON CONFLICT (id) DO NOTHING;

INSERT INTO weeks (period_id, label, date_range, theme)
SELECT v.period_id::uuid, v.label, v.date_range, v.theme FROM (VALUES
  ('00000000-0000-0000-0000-000000000003', 'Semana 01', '2-8 de Março',    'Isaías 41-42'),
  ('00000000-0000-0000-0000-000000000003', 'Semana 02', '9-15 de Março',   'Isaías 43-44'),
  ('00000000-0000-0000-0000-000000000003', 'Semana 03', '16-22 de Março',  'Isaías 45-47'),
  ('00000000-0000-0000-0000-000000000003', 'Semana 04', '23-29 de Março',  'Isaías 48-49'),
  ('00000000-0000-0000-0000-000000000003', 'Semana 05', '30 Mar - 5 Abr',  'Isaías 50-51'),
  ('00000000-0000-0000-0000-000000000003', 'Semana 06', '6-12 de Abril',   'Isaías 52-53'),
  ('00000000-0000-0000-0000-000000000003', 'Semana 07', '13-19 de Abril',  'Isaías 54-55'),
  ('00000000-0000-0000-0000-000000000003', 'Semana 08', '20-26 de Abril',  'Isaías 56-57'),
  ('00000000-0000-0000-0000-000000000003', 'Semana 09', '27 Abr - 3 Mai',  'Isaías 58-59')
) AS v(period_id, label, date_range, theme)
WHERE NOT EXISTS (
  SELECT 1 FROM weeks w WHERE w.period_id = '00000000-0000-0000-0000-000000000003'
);

INSERT INTO periods (id, name, start_date, end_date)
VALUES ('00000000-0000-0000-0000-000000000004', 'Maio - Junho 2026', '2026-05-01', '2026-06-30')
ON CONFLICT (id) DO NOTHING;

INSERT INTO weeks (period_id, label, date_range, theme)
SELECT v.period_id::uuid, v.label, v.date_range, v.theme FROM (VALUES
  ('00000000-0000-0000-0000-000000000004', 'Semana 01', '4-10 de Maio',    'Isaías 58-59'),
  ('00000000-0000-0000-0000-000000000004', 'Semana 02', '11-17 de Maio',   'Isaías 60-61'),
  ('00000000-0000-0000-0000-000000000004', 'Semana 03', '18-24 de Maio',   'Isaías 62-64'),
  ('00000000-0000-0000-0000-000000000004', 'Semana 04', '25-31 de Maio',   'Isaías 65-66'),
  ('00000000-0000-0000-0000-000000000004', 'Semana 05', '1-7 de Junho',    'Jeremias 1-3'),
  ('00000000-0000-0000-0000-000000000004', 'Semana 06', '8-14 de Junho',   'Jeremias 4-6'),
  ('00000000-0000-0000-0000-000000000004', 'Semana 07', '15-21 de Junho',  'Jeremias 7-8'),
  ('00000000-0000-0000-0000-000000000004', 'Semana 08', '22-28 de Junho',  'Jeremias 9-10'),
  ('00000000-0000-0000-0000-000000000004', 'Semana 09', '29 Jun - 5 Jul',  'Jeremias 11-12')
) AS v(period_id, label, date_range, theme)
WHERE NOT EXISTS (
  SELECT 1 FROM weeks w WHERE w.period_id = '00000000-0000-0000-0000-000000000004'
);
