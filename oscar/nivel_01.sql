-- =============================================
-- NÍVEL 1: Primeiros Passos
-- =============================================
USE oscar_database;

-- 1.1 Quantos registros existem na tabela?
SELECT COUNT(*) AS total_registros FROM indicados_ao_oscar;

-- 1.2.1 Categorias únicas
SELECT DISTINCT categoria FROM indicados_ao_oscar;

-- 1.2.2 Quantas categorias únicas existem?
SELECT COUNT(DISTINCT categoria) AS total_categorias FROM indicados_ao_oscar;

-- 1.3 Primeiro ano de cerimônia
SELECT MIN(ano_cerimonia) AS primeiro_ano FROM indicados_ao_oscar;

-- 1.4 Último ano de cerimônia
SELECT MAX(ano_cerimonia) AS ultimo_ano FROM indicados_ao_oscar;

-- 1.5 Quantas cerimônias estão registradas
SELECT COUNT(DISTINCT edicao_cerimonia) AS total_cerimonias FROM indicados_ao_oscar;

-- 1.6 Adicionando os vencedores do Oscar 2025 (97ª edição) e 2026 (98ª edição)
-- Coloquei só os vencedores das categorias principais

-- Oscar 2025
INSERT INTO indicados_ao_oscar (ano_filmagem, ano_cerimonia, edicao_cerimonia, categoria, nome_indicado, nome_filme, vencedor) VALUES
(2024, 2025, 97, 'BEST PICTURE', 'Alex Coco, Samantha Quan and Sean Baker, Producers', 'Anora', true),
(2024, 2025, 97, 'DIRECTING', 'Sean Baker', 'Anora', true),
(2024, 2025, 97, 'ACTOR IN A LEADING ROLE', 'Adrien Brody', 'The Brutalist', true),
(2024, 2025, 97, 'ACTRESS IN A LEADING ROLE', 'Mikey Madison', 'Anora', true),
(2024, 2025, 97, 'ACTOR IN A SUPPORTING ROLE', 'Kieran Culkin', 'A Real Pain', true),
(2024, 2025, 97, 'ACTRESS IN A SUPPORTING ROLE', 'Zoe Saldaña', 'Emilia Pérez', true),
(2024, 2025, 97, 'WRITING (Original Screenplay)', 'Written by Sean Baker', 'Anora', true),
(2024, 2025, 97, 'WRITING (Adapted Screenplay)', 'Screenplay by Peter Straughan', 'Conclave', true),
(2024, 2025, 97, 'INTERNATIONAL FEATURE FILM', 'Brazil', 'I''m Still Here', true),
(2024, 2025, 97, 'ANIMATED FEATURE FILM', 'Gints Zilbalodis', 'Flow', true);

-- Oscar 2026
INSERT INTO indicados_ao_oscar (ano_filmagem, ano_cerimonia, edicao_cerimonia, categoria, nome_indicado, nome_filme, vencedor) VALUES
(2025, 2026, 98, 'BEST PICTURE', 'Adam Somner, Sara Murphy and Paul Thomas Anderson, Producers', 'One Battle After Another', true),
(2025, 2026, 98, 'DIRECTING', 'Paul Thomas Anderson', 'One Battle After Another', true),
(2025, 2026, 98, 'ACTOR IN A LEADING ROLE', 'Michael B. Jordan', 'Sinners', true),
(2025, 2026, 98, 'ACTRESS IN A LEADING ROLE', 'Jessie Buckley', 'Hamnet', true),
(2025, 2026, 98, 'ACTOR IN A SUPPORTING ROLE', 'Sean Penn', 'One Battle After Another', true),
(2025, 2026, 98, 'ACTRESS IN A SUPPORTING ROLE', 'Amy Madigan', 'Weapons', true),
(2025, 2026, 98, 'WRITING (Original Screenplay)', 'Written by Ryan Coogler', 'Sinners', true),
(2025, 2026, 98, 'WRITING (Adapted Screenplay)', 'Written by Paul Thomas Anderson', 'One Battle After Another', true),
(2025, 2026, 98, 'INTERNATIONAL FEATURE FILM', 'Norway', 'Sentimental Value', true),
(2025, 2026, 98, 'ANIMATED FEATURE FILM', 'Maggie Kang and Chris Appelhans', 'KPop Demon Hunters', true);

-- Conferindo se entrou
SELECT * FROM indicados_ao_oscar WHERE ano_cerimonia >= 2025;
