-- =============================================
-- NÍVEL 9: Questões Históricas e Sociais
-- =============================================
USE oscar_database;

-- ---------- Representatividade ----------
-- 9.1 Primeira indicação de Sidney Poitier
SELECT ano_cerimonia, categoria, nome_filme FROM indicados_ao_oscar
WHERE nome_indicado = 'Sidney Poitier'
ORDER BY ano_cerimonia
LIMIT 1;

-- 9.2 Ele ganhou nessa indicação?
SELECT ano_cerimonia, nome_filme, vencedor FROM indicados_ao_oscar
WHERE nome_indicado = 'Sidney Poitier'
ORDER BY ano_cerimonia;

-- 9.3 Atores/atrizes negros indicados em ACTOR ou ACTRESS antes de 1970
-- A base não tem coluna de etnia, então pesquisei os nomes e filtrei por eles
SELECT ano_cerimonia, categoria, nome_indicado, nome_filme, vencedor
FROM indicados_ao_oscar
WHERE categoria IN ('ACTOR', 'ACTRESS')
AND ano_cerimonia < 1970
AND nome_indicado IN ('Dorothy Dandridge', 'Sidney Poitier');

SELECT COUNT(DISTINCT nome_indicado) AS total
FROM indicados_ao_oscar
WHERE categoria IN ('ACTOR', 'ACTRESS')
AND ano_cerimonia < 1970
AND nome_indicado IN ('Dorothy Dandridge', 'Sidney Poitier');

-- 9.4 Filmes dirigidos por mulheres que ganharam algum Oscar
-- Peguei as diretoras indicadas em DIRECTING e vi quais filmes delas venceram alguma categoria
SELECT DISTINCT d.nome_indicado AS diretora, d.nome_filme, v.categoria AS oscar_ganho, v.ano_cerimonia
FROM indicados_ao_oscar d
JOIN indicados_ao_oscar v
  ON d.nome_filme = v.nome_filme
 AND d.ano_cerimonia = v.ano_cerimonia
WHERE d.categoria = 'DIRECTING'
AND d.nome_indicado IN ('Lina Wertmüller', 'Jane Campion', 'Sofia Coppola', 'Kathryn Bigelow',
                        'Greta Gerwig', 'Emerald Fennell', 'Chloé Zhao', 'Justine Triet')
AND v.vencedor = true
ORDER BY v.ano_cerimonia;

-- ---------- Coincidências ----------
-- 9.5 Denzel Washington e Jamie Foxx concorreram no mesmo ano?
SELECT DISTINCT a.ano_cerimonia
FROM indicados_ao_oscar a
JOIN indicados_ao_oscar b ON a.ano_cerimonia = b.ano_cerimonia
WHERE a.nome_indicado = 'Denzel Washington'
AND b.nome_indicado = 'Jamie Foxx';

-- 9.6 Em qual ano e quem ganhou
-- A 9.5 voltou vazia, então listei as indicações dos dois por ano para confirmar
SELECT ano_cerimonia, nome_indicado, categoria, nome_filme, vencedor
FROM indicados_ao_oscar
WHERE nome_indicado IN ('Denzel Washington', 'Jamie Foxx')
ORDER BY ano_cerimonia;

-- 9.7 Filmes que ganharam em várias categorias na mesma cerimônia
SELECT ano_cerimonia, nome_filme, COUNT(DISTINCT categoria) AS categorias_vencidas
FROM indicados_ao_oscar
WHERE vencedor = true
GROUP BY ano_cerimonia, nome_filme
HAVING COUNT(DISTINCT categoria) > 1
ORDER BY categorias_vencidas DESC;
