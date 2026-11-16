-- =============================================
-- NÍVEL 2: Explorando Categorias
-- =============================================
USE oscar_database;

-- 2.1 Indicações por categoria (da mais frequente para a menos)
SELECT categoria, COUNT(*) AS total_indicacoes
FROM indicados_ao_oscar
GROUP BY categoria
ORDER BY total_indicacoes DESC;

-- 2.2 Categoria com mais indicações
SELECT categoria, COUNT(*) AS total_indicacoes
FROM indicados_ao_oscar
GROUP BY categoria
ORDER BY total_indicacoes DESC
LIMIT 1;

-- 2.3 Categoria com menos indicações
-- (tem várias empatadas com 1, então mostro todas que têm o menor valor)
SELECT categoria, COUNT(*) AS total_indicacoes
FROM indicados_ao_oscar
GROUP BY categoria
ORDER BY total_indicacoes ASC
LIMIT 10;

-- 2.4 Última cerimônia com a categoria "ACTRESS"
SELECT MAX(ano_cerimonia) AS ultimo_ano_actress
FROM indicados_ao_oscar
WHERE categoria = 'ACTRESS';

-- 2.5 Categorias da primeira cerimônia (1928) que não existem mais hoje
SELECT DISTINCT categoria
FROM indicados_ao_oscar
WHERE ano_cerimonia = 1928
AND categoria NOT IN (
    SELECT DISTINCT categoria FROM indicados_ao_oscar WHERE ano_cerimonia = 2024
);

-- 2.6 Categorias que contêm "DIRECTING"
SELECT DISTINCT categoria
FROM indicados_ao_oscar
WHERE categoria LIKE '%DIRECTING%';
