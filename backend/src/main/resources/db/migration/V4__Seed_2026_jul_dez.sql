-- V4: Cronograma oficial 2026 (Julho-Agosto, Setembro-Outubro e Novembro-Dezembro)
-- Fonte: lib/data/officialSchedule2026.ts (mwb_T_202607/202609/202611).
-- Periodos anteriores (V2/V3) nao sao alterados.

INSERT INTO periods (id, name, start_date, end_date)
VALUES ('00000000-0000-0000-0000-000000000005', 'Julho - Agosto 2026', '2026-07-01', '2026-08-31')
ON CONFLICT (id) DO NOTHING;

INSERT INTO weeks (period_id, label, date_range, theme)
SELECT v.period_id::uuid, v.label, v.date_range, v.theme FROM (VALUES
  ('00000000-0000-0000-0000-000000000005', 'Semana 01', '6-12 de Julho',     'Jeremias 13-15'),
  ('00000000-0000-0000-0000-000000000005', 'Semana 02', '13-19 de Julho',    'Jeremias 16-17'),
  ('00000000-0000-0000-0000-000000000005', 'Semana 03', '20-26 de Julho',    'Jeremias 18-19'),
  ('00000000-0000-0000-0000-000000000005', 'Semana 04', '27 Jul - 2 Ago',    'Jeremias 20-21'),
  ('00000000-0000-0000-0000-000000000005', 'Semana 05', '3-9 de Agosto',     'Jeremias 22-23'),
  ('00000000-0000-0000-0000-000000000005', 'Semana 06', '10-16 de Agosto',   'Jeremias 24-25'),
  ('00000000-0000-0000-0000-000000000005', 'Semana 07', '17-23 de Agosto',   'Jeremias 26-28'),
  ('00000000-0000-0000-0000-000000000005', 'Semana 08', '24-30 de Agosto',   'Jeremias 29-30'),
  ('00000000-0000-0000-0000-000000000005', 'Semana 09', '31 Ago - 6 Set',    'Jeremias 31')
) AS v(period_id, label, date_range, theme)
WHERE NOT EXISTS (
  SELECT 1 FROM weeks w WHERE w.period_id = '00000000-0000-0000-0000-000000000005'
);

INSERT INTO periods (id, name, start_date, end_date)
VALUES ('00000000-0000-0000-0000-000000000006', 'Setembro - Outubro 2026', '2026-09-01', '2026-10-31')
ON CONFLICT (id) DO NOTHING;

INSERT INTO weeks (period_id, label, date_range, theme)
SELECT v.period_id::uuid, v.label, v.date_range, v.theme FROM (VALUES
  ('00000000-0000-0000-0000-000000000006', 'Semana 01', '7-13 de Setembro',  'Jeremias 32-33'),
  ('00000000-0000-0000-0000-000000000006', 'Semana 02', '14-20 de Setembro', 'Jeremias 34-35'),
  ('00000000-0000-0000-0000-000000000006', 'Semana 03', '21-27 de Setembro', 'Jeremias 36-37'),
  ('00000000-0000-0000-0000-000000000006', 'Semana 04', '28 Set - 4 Out',    'Jeremias 38-39'),
  ('00000000-0000-0000-0000-000000000006', 'Semana 05', '5-11 de Outubro',   'Jeremias 40-41'),
  ('00000000-0000-0000-0000-000000000006', 'Semana 06', '12-18 de Outubro',  'Jeremias 42-44'),
  ('00000000-0000-0000-0000-000000000006', 'Semana 07', '19-25 de Outubro',  'Jeremias 45-46'),
  ('00000000-0000-0000-0000-000000000006', 'Semana 08', '26 Out - 1 Nov',    'Jeremias 47-48')
) AS v(period_id, label, date_range, theme)
WHERE NOT EXISTS (
  SELECT 1 FROM weeks w WHERE w.period_id = '00000000-0000-0000-0000-000000000006'
);

INSERT INTO periods (id, name, start_date, end_date)
VALUES ('00000000-0000-0000-0000-000000000007', 'Novembro - Dezembro 2026', '2026-11-01', '2026-12-31')
ON CONFLICT (id) DO NOTHING;

INSERT INTO weeks (period_id, label, date_range, theme)
SELECT v.period_id::uuid, v.label, v.date_range, v.theme FROM (VALUES
  ('00000000-0000-0000-0000-000000000007', 'Semana 01', '2-8 de Novembro',   'Jeremias 49-50'),
  ('00000000-0000-0000-0000-000000000007', 'Semana 02', '9-15 de Novembro',  'Jeremias 51-52'),
  ('00000000-0000-0000-0000-000000000007', 'Semana 03', '16-22 de Novembro', 'Lamentações 1-2'),
  ('00000000-0000-0000-0000-000000000007', 'Semana 04', '23-29 de Novembro', 'Lamentações 3-5'),
  ('00000000-0000-0000-0000-000000000007', 'Semana 05', '30 Nov - 6 Dez',    'Ezequiel 1-2'),
  ('00000000-0000-0000-0000-000000000007', 'Semana 06', '7-13 de Dezembro',  'Ezequiel 3-4'),
  ('00000000-0000-0000-0000-000000000007', 'Semana 07', '14-20 de Dezembro', 'Ezequiel 5-6'),
  ('00000000-0000-0000-0000-000000000007', 'Semana 08', '21-27 de Dezembro', 'Ezequiel 7-8'),
  ('00000000-0000-0000-0000-000000000007', 'Semana 09', '28 Dez - 3 Jan',    'Ezequiel 9-10')
) AS v(period_id, label, date_range, theme)
WHERE NOT EXISTS (
  SELECT 1 FROM weeks w WHERE w.period_id = '00000000-0000-0000-0000-000000000007'
);
