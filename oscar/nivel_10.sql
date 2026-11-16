-- =============================================
-- NÍVEL 10: Análise Avançada
-- =============================================
USE oscar_database;

-- 10.1 Filmes que ganharam Melhor Filme e Melhor Diretor na mesma cerimônia
SELECT f.ano_cerimonia, f.nome_filme, d.nome_indicado AS diretor
FROM indicados_ao_oscar f
JOIN indicados_ao_oscar d
  ON f.nome_filme = d.nome_filme
 AND f.ano_cerimonia = d.ano_cerimonia
WHERE f.categoria IN ('OUTSTANDING PICTURE', 'OUTSTANDING PRODUCTION',
                      'OUTSTANDING MOTION PICTURE', 'BEST MOTION PICTURE', 'BEST PICTURE')
AND f.vencedor = true
AND d.categoria LIKE 'DIRECTING%'
AND d.vencedor = true
ORDER BY f.ano_cerimonia;

-- 10.2 Filme com mais indicações em uma única cerimônia
SELECT ano_cerimonia, nome_filme, COUNT(*) AS indicacoes
FROM indicados_ao_oscar
GROUP BY ano_cerimonia, nome_filme
ORDER BY indicacoes DESC
LIMIT 5;

-- 10.3 Maior taxa de conversão (vitórias / indicações)
-- Coloquei mínimo de 5 indicações, senão aparecem vários filmes com 1 indicação e 1 vitória (100%)
SELECT nome_filme,
       COUNT(*) AS indicacoes,
       SUM(vencedor) AS vitorias,
       ROUND(SUM(vencedor) / COUNT(*) * 100, 2) AS taxa_conversao
FROM indicados_ao_oscar
GROUP BY nome_filme
HAVING COUNT(*) >= 5
ORDER BY taxa_conversao DESC, vitorias DESC
LIMIT 10;

-- 10.4 Atores indicados em anos consecutivos
SELECT DISTINCT a.nome_indicado, a.ano_cerimonia AS ano, b.ano_cerimonia AS ano_seguinte
FROM indicados_ao_oscar a
JOIN indicados_ao_oscar b
  ON a.nome_indicado = b.nome_indicado
 AND b.ano_cerimonia = a.ano_cerimonia + 1
WHERE (a.categoria LIKE 'ACTOR%' OR a.categoria LIKE 'ACTRESS%')
AND (b.categoria LIKE 'ACTOR%' OR b.categoria LIKE 'ACTRESS%')
ORDER BY a.nome_indicado, a.ano_cerimonia;

-- 10.5 Média de indicações por cerimônia
SELECT ROUND(COUNT(*) / COUNT(DISTINCT edicao_cerimonia), 2) AS media_por_cerimonia
FROM indicados_ao_oscar;

-- 10.6 "Surpresas": indicados em categorias principais cujo filme só teve 1 indicação
SELECT ano_cerimonia, categoria, nome_indicado, nome_filme
FROM indicados_ao_oscar
WHERE categoria IN ('ACTOR', 'ACTRESS', 'ACTOR IN A LEADING ROLE',
                    'ACTRESS IN A LEADING ROLE', 'BEST PICTURE')
AND (nome_filme, ano_cerimonia) IN (
    SELECT nome_filme, ano_cerimonia
    FROM indicados_ao_oscar
    GROUP BY nome_filme, ano_cerimonia
    HAVING COUNT(*) = 1
)
ORDER BY ano_cerimonia;
