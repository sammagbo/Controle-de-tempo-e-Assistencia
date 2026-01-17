-- =============================================================
-- SEED DATA: Reuniões de MARÇO a JUNHO de 2026
-- Baseado nos PDFs oficiais mwb_T_202603.pdf e mwb_T_202605.pdf
-- =============================================================

-- 1. CRIAR PERÍODO MARÇO-ABRIL 2026
INSERT INTO periods (id, name) VALUES 
  (gen_random_uuid(), 'Março - Abril 2026')
ON CONFLICT DO NOTHING;

-- Guardar o ID do período para usar nas semanas
DO $$
DECLARE
  march_april_period_id UUID;
  may_june_period_id UUID;
BEGIN
  -- Buscar ou criar período Março-Abril
  SELECT id INTO march_april_period_id FROM periods WHERE name = 'Março - Abril 2026' LIMIT 1;
  
  IF march_april_period_id IS NULL THEN
    INSERT INTO periods (name) VALUES ('Março - Abril 2026') RETURNING id INTO march_april_period_id;
  END IF;

  -- Criar semanas de MARÇO 2026
  INSERT INTO weeks (period_id, label, date_range, theme) VALUES
    (march_april_period_id, 'Semana 1', '2-8 Março', 'ISAÍAS 58-59 | "Eis que a mão de Jeová não é curta demais para salvar"'),
    (march_april_period_id, 'Semana 2', '9-15 Março', 'ISAÍAS 60-62 | "Levantem-se e brilhem"'),
    (march_april_period_id, 'Semana 3', '16-22 Março', 'ISAÍAS 63-66 | "Novos céus e uma nova terra"'),
    (march_april_period_id, 'Semana 4', '23-29 Março', 'JEREMIAS 1-3 | "Uma sentinela para a casa de Israel"'),
    (march_april_period_id, 'Semana 5', '30 Março - 5 Abril', 'JEREMIAS 4-6 | "Perguntem pelos caminhos antigos"')
  ON CONFLICT DO NOTHING;

  -- Criar semanas de ABRIL 2026
  INSERT INTO weeks (period_id, label, date_range, theme) VALUES
    (march_april_period_id, 'Semana 6', '6-12 Abril', 'JEREMIAS 7-9 | "Não confiem em palavras enganosas"'),
    (march_april_period_id, 'Semana 7', '13-19 Abril', 'JEREMIAS 10-12 | "Os pensamentos de Jeová"'),
    (march_april_period_id, 'Semana 8', '20-26 Abril', 'JEREMIAS 13-16 | "Eu os ouvi e os livro"'),
    (march_april_period_id, 'Semana 9', '27 Abril - 3 Maio', 'JEREMIAS 17-20 | "Jeová é minha força"')
  ON CONFLICT DO NOTHING;

  -- Buscar ou criar período Maio-Junho
  SELECT id INTO may_june_period_id FROM periods WHERE name = 'Maio - Junho 2026' LIMIT 1;
  
  IF may_june_period_id IS NULL THEN
    INSERT INTO periods (name) VALUES ('Maio - Junho 2026') RETURNING id INTO may_june_period_id;
  END IF;

  -- Criar semanas de MAIO 2026
  INSERT INTO weeks (period_id, label, date_range, theme) VALUES
    (may_june_period_id, 'Semana 1', '4-10 Maio', 'JEREMIAS 21-23 | "Seus pastores os apascentarão"'),
    (may_june_period_id, 'Semana 2', '11-17 Maio', 'JEREMIAS 24-26 | "Eu os trarei de volta"'),
    (may_june_period_id, 'Semana 3', '18-24 Maio', 'JEREMIAS 27-29 | "Busquem a paz da cidade"'),
    (may_june_period_id, 'Semana 4', '25-31 Maio', 'JEREMIAS 30-31 | "Uma nova aliança"')
  ON CONFLICT DO NOTHING;

  -- Criar semanas de JUNHO 2026
  INSERT INTO weeks (period_id, label, date_range, theme) VALUES
    (may_june_period_id, 'Semana 5', '1-7 Junho', 'JEREMIAS 32-34 | "Nada é impossível para Jeová"'),
    (may_june_period_id, 'Semana 6', '8-14 Junho', 'JEREMIAS 35-37 | "Os recabitas deram o exemplo"'),
    (may_june_period_id, 'Semana 7', '15-21 Junho', 'JEREMIAS 38-40 | "Jeová estava com Jeremias"'),
    (may_june_period_id, 'Semana 8', '22-28 Junho', 'JEREMIAS 41-44 | "Não voltem para o Egito"'),
    (may_june_period_id, 'Semana 9', '29 Junho - 5 Julho', 'JEREMIAS 45-48 | "Baruc, não busque grandes coisas"')
  ON CONFLICT DO NOTHING;

END $$;

-- =============================================================
-- VERIFICAÇÃO: Listar todos os períodos e semanas criados
-- =============================================================
-- SELECT p.name as periodo, w.label, w.date_range, w.theme 
-- FROM periods p 
-- JOIN weeks w ON w.period_id = p.id 
-- ORDER BY p.name, w.label;
