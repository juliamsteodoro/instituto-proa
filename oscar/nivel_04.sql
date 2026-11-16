-- =============================================
-- NÍVEL 4: Vencedores Históricos
-- =============================================
USE oscar_database;

-- 4.1 Primeira vencedora de Melhor Atriz (ACTRESS)
SELECT ano_cerimonia, nome_indicado, nome_filme FROM indicados_ao_oscar
WHERE categoria = 'ACTRESS' AND vencedor = true
ORDER BY ano_cerimonia
LIMIT 1;

-- 4.2 Primeiro vencedor de Melhor Ator (ACTOR)
SELECT ano_cerimonia, nome_indicado, nome_filme FROM indicados_ao_oscar
WHERE categoria = 'ACTOR' AND vencedor = true
ORDER BY ano_cerimonia
LIMIT 1;

-- 4.3 Quantos vencedores existem ao todo
SELECT COUNT(*) AS total_vencedores FROM indicados_ao_oscar
WHERE vencedor = true;

-- 4.4 Filmes que ganharam Melhor Filme
SELECT ano_cerimonia, nome_filme FROM indicados_ao_oscar
WHERE categoria IN ('OUTSTANDING PICTURE', 'BEST PICTURE')
AND vencedor = true
ORDER BY ano_cerimonia;

-- Obs: o nome da categoria mudou ao longo dos anos, então conferi todas
-- que têm "PICTURE" no nome para não deixar nenhum ano de fora
SELECT DISTINCT categoria FROM indicados_ao_oscar WHERE categoria LIKE '%PICTURE%';

SELECT ano_cerimonia, categoria, nome_filme FROM indicados_ao_oscar
WHERE categoria IN ('OUTSTANDING PICTURE', 'OUTSTANDING PRODUCTION',
                    'OUTSTANDING MOTION PICTURE', 'BEST MOTION PICTURE', 'BEST PICTURE')
AND vencedor = true
ORDER BY ano_cerimonia;

-- 4.5 Quantos filmes diferentes já ganharam o Oscar
SELECT COUNT(DISTINCT nome_filme) AS filmes_vencedores FROM indicados_ao_oscar
WHERE vencedor = true;
