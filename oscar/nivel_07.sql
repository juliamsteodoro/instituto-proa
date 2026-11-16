-- =============================================
-- NÍVEL 7: Operações de Atualização
-- =============================================
USE oscar_database;

-- Desliga o safe update para conseguir fazer UPDATE/DELETE sem usar a chave primária
SET SQL_SAFE_UPDATES = 0;

-- 7.1 Converter "true"/"false" (texto) para booleano
-- Nessa base o campo vencedor já foi criado como BOOLEAN, então já está certo.
-- Primeiro conferi os valores que existem:
SELECT vencedor, COUNT(*) FROM indicados_ao_oscar GROUP BY vencedor;

-- Se o campo estivesse como texto, o comando seria esse:
-- UPDATE indicados_ao_oscar SET vencedor = true  WHERE vencedor = 'true';
-- UPDATE indicados_ao_oscar SET vencedor = false WHERE vencedor = 'false';
-- ALTER TABLE indicados_ao_oscar MODIFY vencedor BOOLEAN NOT NULL;

-- 7.2 Incluir 3 filmes que nunca foram indicados (dados fictícios)
-- Antes conferi que nenhum deles está na base
SELECT * FROM indicados_ao_oscar
WHERE nome_filme IN ('O Auto da Compadecida', 'Paddington 2', 'Memories of Murder');

INSERT INTO indicados_ao_oscar (ano_filmagem, ano_cerimonia, edicao_cerimonia, categoria, nome_indicado, nome_filme, vencedor) VALUES
(2000, 2001, 73, 'FOREIGN LANGUAGE FILM', 'Brazil', 'O Auto da Compadecida', false),
(2017, 2018, 90, 'BEST PICTURE', 'David Heyman, Producer', 'Paddington 2', false),
(2003, 2004, 76, 'FOREIGN LANGUAGE FILM', 'South Korea', 'Memories of Murder', false);

SELECT * FROM indicados_ao_oscar
WHERE nome_filme IN ('O Auto da Compadecida', 'Paddington 2', 'Memories of Murder');

-- 7.3 Categoria "BEST INTERNATIONAL FEATURE FILM" com vencedores de 2020 a 2024
-- (a base já tem "INTERNATIONAL FEATURE FILM", mas o exercício pede uma categoria nova com esse nome)
INSERT INTO indicados_ao_oscar (ano_filmagem, ano_cerimonia, edicao_cerimonia, categoria, nome_indicado, nome_filme, vencedor) VALUES
(2019, 2020, 92, 'BEST INTERNATIONAL FEATURE FILM', 'South Korea', 'Parasite', true),
(2020, 2021, 93, 'BEST INTERNATIONAL FEATURE FILM', 'Denmark', 'Another Round', true),
(2021, 2022, 94, 'BEST INTERNATIONAL FEATURE FILM', 'Japan', 'Drive My Car', true),
(2022, 2023, 95, 'BEST INTERNATIONAL FEATURE FILM', 'Germany', 'All Quiet on the Western Front', true),
(2023, 2024, 96, 'BEST INTERNATIONAL FEATURE FILM', 'United Kingdom', 'The Zone of Interest', true);

SELECT * FROM indicados_ao_oscar WHERE categoria = 'BEST INTERNATIONAL FEATURE FILM';

-- 7.4 Corrigir erros de digitação nos nomes dos filmes
-- Antes: filmes com ";" no final, espaço no começo/fim ou espaço duplo
SELECT nome_filme FROM indicados_ao_oscar
WHERE nome_filme LIKE '%;'
   OR nome_filme LIKE ' %'
   OR nome_filme LIKE '% '
   OR nome_filme LIKE '%  %';

-- Tira o ";" do final
UPDATE indicados_ao_oscar
SET nome_filme = LEFT(nome_filme, LENGTH(nome_filme) - 1)
WHERE nome_filme LIKE '%;';

-- Tira espaços do começo e do fim
UPDATE indicados_ao_oscar
SET nome_filme = TRIM(nome_filme);

-- Troca espaço duplo por espaço simples
UPDATE indicados_ao_oscar
SET nome_filme = REPLACE(nome_filme, '  ', ' ')
WHERE nome_filme LIKE '%  %';

-- Depois: conferindo se sobrou algum
SELECT COUNT(*) AS ainda_com_erro FROM indicados_ao_oscar
WHERE nome_filme LIKE '%;'
   OR nome_filme LIKE ' %'
   OR nome_filme LIKE '% '
   OR nome_filme LIKE '%  %';

-- 7.5 Remover registros com nome_filme NULL
SELECT COUNT(*) AS registros_null FROM indicados_ao_oscar WHERE nome_filme IS NULL;

DELETE FROM indicados_ao_oscar WHERE nome_filme IS NULL;

SELECT COUNT(*) AS registros_null FROM indicados_ao_oscar WHERE nome_filme IS NULL;

SET SQL_SAFE_UPDATES = 1;
