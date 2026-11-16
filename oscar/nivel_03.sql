-- =============================================
-- NÍVEL 3: Atores e Atrizes Famosos
-- =============================================
USE oscar_database;

-- ---------- Natalie Portman ----------
-- 3.1 Quantas vezes foi indicada
SELECT COUNT(*) AS indicacoes FROM indicados_ao_oscar
WHERE nome_indicado LIKE '%Natalie Portman%';

-- 3.2 Quantos Oscars ganhou
SELECT COUNT(*) AS vitorias FROM indicados_ao_oscar
WHERE nome_indicado LIKE '%Natalie Portman%'
AND vencedor = true;

-- 3.3 Anos e filmes das indicações
SELECT ano_cerimonia, nome_filme FROM indicados_ao_oscar
WHERE nome_indicado LIKE '%Natalie Portman%';

-- 3.4 Todas as indicações: ano, categoria, filme e se venceu
SELECT ano_cerimonia, categoria, nome_filme, vencedor FROM indicados_ao_oscar
WHERE nome_indicado LIKE '%Natalie Portman%';

-- ---------- Viola Davis ----------
-- 3.5 Quantas vezes foi indicada
SELECT COUNT(*) AS indicacoes FROM indicados_ao_oscar
WHERE nome_indicado LIKE '%Viola Davis%';

-- 3.6 Quantos Oscars ganhou
SELECT COUNT(*) AS vitorias FROM indicados_ao_oscar
WHERE nome_indicado LIKE '%Viola Davis%'
AND vencedor = true;

-- 3.7 Por quais filmes foi indicada
SELECT ano_cerimonia, nome_filme FROM indicados_ao_oscar
WHERE nome_indicado LIKE '%Viola Davis%';

-- ---------- Amy Adams ----------
-- 3.8 Já ganhou algum Oscar?
SELECT COUNT(*) AS vitorias FROM indicados_ao_oscar
WHERE nome_indicado LIKE '%Amy Adams%'
AND vencedor = true;

-- 3.9 Quantas vezes foi indicada sem ganhar
SELECT COUNT(*) AS indicacoes_sem_ganhar FROM indicados_ao_oscar
WHERE nome_indicado LIKE '%Amy Adams%'
AND vencedor = false;

-- ---------- Denzel Washington ----------
-- 3.10 Já ganhou algum Oscar?
SELECT COUNT(*) AS vitorias FROM indicados_ao_oscar
WHERE nome_indicado LIKE '%Denzel Washington%'
AND vencedor = true;

-- 3.11 Quantas vezes foi indicado
SELECT COUNT(*) AS indicacoes FROM indicados_ao_oscar
WHERE nome_indicado LIKE '%Denzel Washington%';

-- 3.12 Oscars que ganhou (ano, categoria, filme)
SELECT ano_cerimonia, categoria, nome_filme FROM indicados_ao_oscar
WHERE nome_indicado LIKE '%Denzel Washington%'
AND vencedor = true;
