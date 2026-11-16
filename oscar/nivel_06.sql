-- =============================================
-- NÍVEL 6: Análise de Filmes
-- =============================================
USE oscar_database;

-- ---------- Toy Story ----------
-- 6.1 Em quais anos a série Toy Story ganhou Oscar
SELECT ano_cerimonia, nome_filme, categoria FROM indicados_ao_oscar
WHERE nome_filme LIKE '%Toy Story%'
AND vencedor = true;

-- 6.2 Total de indicações da franquia
SELECT COUNT(*) AS total_indicacoes FROM indicados_ao_oscar
WHERE nome_filme LIKE '%Toy Story%';

-- 6.3 Categorias em que foi indicado
SELECT DISTINCT categoria FROM indicados_ao_oscar
WHERE nome_filme LIKE '%Toy Story%';

-- ---------- Crash ----------
-- Usei = 'Crash' para não pegar "Crash Dive" e outros filmes parecidos

-- 6.4 Em qual edição concorreu
SELECT DISTINCT edicao_cerimonia, ano_cerimonia FROM indicados_ao_oscar
WHERE nome_filme = 'Crash';

-- 6.5 Quantas indicações recebeu
SELECT COUNT(*) AS indicacoes FROM indicados_ao_oscar
WHERE nome_filme = 'Crash';

-- 6.6 Ganhou Melhor Filme?
SELECT categoria, vencedor FROM indicados_ao_oscar
WHERE nome_filme = 'Crash'
AND categoria = 'BEST PICTURE';

-- ---------- Central do Brasil ----------
-- 6.7 Aparece no banco? (procurei pelo nome em português e pelo nome em inglês)
SELECT * FROM indicados_ao_oscar
WHERE nome_filme LIKE '%Central do Brasil%'
   OR nome_filme LIKE '%Central Station%';

-- 6.8 Quantas indicações recebeu
SELECT COUNT(*) AS indicacoes FROM indicados_ao_oscar
WHERE nome_filme = 'Central Station';
