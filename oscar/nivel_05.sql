-- =============================================
-- NÍVEL 5: Análise de Indicações
-- =============================================
USE oscar_database;

-- Para esse nível usei só as categorias de atuação (ACTOR/ACTRESS),
-- porque nas outras o nome_indicado vem com vários nomes juntos

-- 5.1 Atores/atrizes indicados mais de uma vez
SELECT nome_indicado, COUNT(*) AS indicacoes
FROM indicados_ao_oscar
WHERE categoria LIKE 'ACTOR%' OR categoria LIKE 'ACTRESS%'
GROUP BY nome_indicado
HAVING COUNT(*) > 1
ORDER BY indicacoes DESC;

-- 5.2 Ator ou atriz com mais indicações
SELECT nome_indicado, COUNT(*) AS indicacoes
FROM indicados_ao_oscar
WHERE categoria LIKE 'ACTOR%' OR categoria LIKE 'ACTRESS%'
GROUP BY nome_indicado
ORDER BY indicacoes DESC
LIMIT 1;

-- 5.3 Atores indicados mais de 3 vezes que nunca ganharam
SELECT nome_indicado, COUNT(*) AS indicacoes, SUM(vencedor) AS vitorias
FROM indicados_ao_oscar
WHERE categoria LIKE 'ACTOR%' OR categoria LIKE 'ACTRESS%'
GROUP BY nome_indicado
HAVING COUNT(*) > 3 AND SUM(vencedor) = 0
ORDER BY indicacoes DESC;

-- 5.4 Artistas indicados em categorias diferentes
SELECT nome_indicado, COUNT(DISTINCT categoria) AS qtd_categorias,
       GROUP_CONCAT(DISTINCT categoria SEPARATOR ' | ') AS categorias
FROM indicados_ao_oscar
WHERE nome_indicado IS NOT NULL
GROUP BY nome_indicado
HAVING COUNT(DISTINCT categoria) > 1
ORDER BY qtd_categorias DESC;

-- Como a lista acima vem cheia de estúdios (MGM, Warner...), fiz também
-- uma só com quem foi indicado como ator/atriz E como diretor
SELECT nome_indicado, GROUP_CONCAT(DISTINCT categoria SEPARATOR ' | ') AS categorias
FROM indicados_ao_oscar
WHERE nome_indicado IN (
    SELECT nome_indicado FROM indicados_ao_oscar
    WHERE categoria LIKE 'ACTOR%' OR categoria LIKE 'ACTRESS%'
)
AND nome_indicado IN (
    SELECT nome_indicado FROM indicados_ao_oscar
    WHERE categoria LIKE 'DIRECTING%'
)
GROUP BY nome_indicado;

-- 5.5 Quantos indicados têm exatamente 1 indicação
SELECT COUNT(*) AS indicados_com_1_indicacao
FROM (
    SELECT nome_indicado
    FROM indicados_ao_oscar
    WHERE nome_indicado IS NOT NULL
    GROUP BY nome_indicado
    HAVING COUNT(*) = 1
) AS t;

-- 5.6 Maior número de indicados em um único ano
SELECT ano_cerimonia, COUNT(*) AS total_indicados
FROM indicados_ao_oscar
GROUP BY ano_cerimonia
ORDER BY total_indicados DESC
LIMIT 1;
