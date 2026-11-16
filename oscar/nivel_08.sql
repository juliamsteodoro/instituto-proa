-- =============================================
-- NÍVEL 8: Análise Temporal
-- =============================================
USE oscar_database;

-- Para achar a década: divido o ano por 10, tiro a parte decimal e multiplico por 10
-- Ex: 1987 -> FLOOR(198.7) = 198 -> 1980

-- 8.1 Indicações por década
SELECT FLOOR(ano_cerimonia / 10) * 10 AS decada, COUNT(*) AS total_indicacoes
FROM indicados_ao_oscar
GROUP BY decada
ORDER BY decada;

-- 8.2 Década com mais indicações
SELECT FLOOR(ano_cerimonia / 10) * 10 AS decada, COUNT(*) AS total_indicacoes
FROM indicados_ao_oscar
GROUP BY decada
ORDER BY total_indicacoes DESC
LIMIT 1;

-- 8.3 Quantas categorias únicas existiam em cada década
SELECT FLOOR(ano_cerimonia / 10) * 10 AS decada, COUNT(DISTINCT categoria) AS categorias
FROM indicados_ao_oscar
GROUP BY decada
ORDER BY decada;

-- 8.4 Ano com mais indicações
SELECT ano_cerimonia, COUNT(*) AS total_indicacoes
FROM indicados_ao_oscar
GROUP BY ano_cerimonia
ORDER BY total_indicacoes DESC
LIMIT 1;

-- 8.5 Taxa de crescimento: primeira década (1920s) x última década completa (2010s)
-- Uso a 2010s porque a 2020s ainda não terminou
SELECT
    (SELECT COUNT(*) FROM indicados_ao_oscar WHERE ano_cerimonia BETWEEN 1920 AND 1929) AS decada_1920,
    (SELECT COUNT(*) FROM indicados_ao_oscar WHERE ano_cerimonia BETWEEN 2010 AND 2019) AS decada_2010,
    ROUND(
        ((SELECT COUNT(*) FROM indicados_ao_oscar WHERE ano_cerimonia BETWEEN 2010 AND 2019)
       - (SELECT COUNT(*) FROM indicados_ao_oscar WHERE ano_cerimonia BETWEEN 1920 AND 1929))
       / (SELECT COUNT(*) FROM indicados_ao_oscar WHERE ano_cerimonia BETWEEN 1920 AND 1929) * 100
    , 2) AS crescimento_percentual;
