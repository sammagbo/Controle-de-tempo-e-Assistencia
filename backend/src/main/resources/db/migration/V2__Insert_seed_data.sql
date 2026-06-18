-- V2: Dados Iniciais (Seeds)

-- Inserir usuário administrador inicial com UUID fixo 00000000-0000-0000-0000-000000000001
-- Password Hash BCrypt verificado para a senha 'password' (bcrypt.checkpw validado)
INSERT INTO users (id, email, password_hash)
VALUES ('00000000-0000-0000-0000-000000000001', 'admin@meeting.local', '$2a$10$uW8MHNQlRWvWrHt1pph6oecXtDeASBbYEyFtoRH5hRh4/vuzCCOg.');

-- Inserir Período de Janeiro - Fevereiro 2026 com UUID fixo para as semanas referenciarem
INSERT INTO periods (id, name, start_date, end_date)
VALUES ('00000000-0000-0000-0000-000000000002', 'Janeiro - Fevereiro 2026', '2026-01-01', '2026-02-28');

-- Inserir Semanas do Período
INSERT INTO weeks (period_id, label, date_range, theme) VALUES
('00000000-0000-0000-0000-000000000002', 'Semana 01', '6-12 Janeiro', 'O que aprendemos com a queda de Sebna'),
('00000000-0000-0000-0000-000000000002', 'Semana 02', '13-19 Janeiro', 'Lições do profeta Isaías'),
('00000000-0000-0000-0000-000000000002', 'Semana 03', '20-26 Janeiro', 'Permaneça fiel a Jeová'),
('00000000-0000-0000-0000-000000000002', 'Semana 04', '27 Jan - 2 Fev', 'A importância da oração'),
('00000000-0000-0000-0000-000000000002', 'Semana 05', '3-9 Fevereiro', 'Confiando nas promessas de Deus'),
('00000000-0000-0000-0000-000000000002', 'Semana 06', '10-16 Fevereiro', 'O valor da humildade'),
('00000000-0000-0000-0000-000000000002', 'Semana 07', '17-23 Fevereiro', 'Mantendo a integridade'),
('00000000-0000-0000-0000-000000000002', 'Semana 08', '24-28 Fevereiro', 'Amor ao próximo');
