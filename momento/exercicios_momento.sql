-- =====================================================================
-- EXERCÍCIOS SQL - MOMENTO
-- Autora: Julia Teodoro
--
-- Antes de rodar: executar o arquivo 0_Base.sql (cria o banco "momento").
-- Os níveis devem ser rodados em ordem, porque alguns níveis alteram os dados
-- (nível 1 me adiciona, nível 6 altera e apaga funcionários, nível 11 carrega o CSV).
-- Antes do nível 12, rodar o 0_Base.sql de novo (explico lá no nível 12 o motivo).
--
-- Obs: quando o exercício fala "Departamento de Tecnologia", usei o
-- departamento "Tecnologia da Informação" (departamento_id = 6).
-- =====================================================================

USE momento;

-- Desliga o safe update do Workbench para conseguir fazer UPDATE/DELETE
SET SQL_SAFE_UPDATES = 0;


-- =====================================================================
-- ETAPA 0: EXPLORAR (Análise Exploratória)
-- =====================================================================

-- Quantos registros tem nas principais tabelas
SELECT 'funcionarios' AS tabela, COUNT(*) AS registros FROM funcionarios
UNION ALL SELECT 'departamentos', COUNT(*) FROM departamentos
UNION ALL SELECT 'escritorios', COUNT(*) FROM escritorios
UNION ALL SELECT 'cargos', COUNT(*) FROM cargos
UNION ALL SELECT 'dependentes', COUNT(*) FROM dependentes
UNION ALL SELECT 'suprimentos', COUNT(*) FROM suprimentos
UNION ALL SELECT 'produtos', COUNT(*) FROM produtos
UNION ALL SELECT 'vendas', COUNT(*) FROM vendas
UNION ALL SELECT 'itens_venda', COUNT(*) FROM itens_venda
UNION ALL SELECT 'alunos', COUNT(*) FROM alunos
UNION ALL SELECT 'stg_vendas_csv', COUNT(*) FROM stg_vendas_csv;

-- Funcionários sem telefone (dado faltante)
SELECT COUNT(*) AS sem_telefone FROM funcionarios WHERE telefone IS NULL;

-- Os salários estão em moedas diferentes, então somar tudo junto não é exato
SELECT moeda_salario, COUNT(*) AS funcionarios
FROM funcionarios
GROUP BY moeda_salario;

-- Funcionários com salário fora da faixa do cargo (min/max)
SELECT f.primeiro_nome, f.sobrenome, c.cargo_nome, f.salario, c.min_salario, c.max_salario
FROM funcionarios f
JOIN cargos c ON c.cargo_id = f.cargo_id
WHERE f.salario < c.min_salario OR f.salario > c.max_salario;

-- Anomalia: algumas tabelas de status têm o nome "1" ou "3" em vez de um texto
SELECT 'status_venda' AS tabela, status_venda_id AS id, nome FROM status_venda
UNION ALL SELECT 'status_pagamento', status_pagamento_id, nome FROM status_pagamento
UNION ALL SELECT 'status_entrega', status_entrega_id, nome FROM status_entrega;

-- Status dos funcionários
SELECT s.nome AS status, COUNT(*) AS funcionarios
FROM funcionarios f
JOIN status_funcionario s ON s.status_funcionario_id = f.status_funcionario_id
GROUP BY s.nome;


-- =====================================================================
-- NÍVEL 1: Conhecendo a Empresa
-- =====================================================================

-- 1.1 Me incluindo no sistema
-- Escolhi o departamento Dados e Inteligência (14), cargo Aprendiz (40)
-- e salário de 2500 (dentro da faixa do cargo, de 1800 a 2800)
SELECT MAX(funcionario_id) FROM funcionarios;  -- para escolher um id livre

INSERT INTO funcionarios (funcionario_id, primeiro_nome, sobrenome, email, telefone,
                          data_contratacao, cargo_id, salario, moeda_salario,
                          gerente_id, departamento_id, status_funcionario_id)
VALUES (301, 'Julia', 'Teodoro', 'julia.teodoro@momento.org', NULL,
        CURDATE(), 40, 2500.00, 'USD', 145, 14, 1);

SELECT * FROM funcionarios WHERE funcionario_id = 301;

-- 1.2 Total de funcionários
SELECT COUNT(*) AS total_funcionarios FROM funcionarios;

-- 1.3 Funcionários do Departamento de Tecnologia
SELECT COUNT(*) AS funcionarios_tecnologia
FROM funcionarios f
JOIN departamentos d ON d.departamento_id = f.departamento_id
WHERE d.departamento_nome = 'Tecnologia da Informação';

-- 1.4 Departamentos da empresa e quantos são
SELECT departamento_id, departamento_nome FROM departamentos;

SELECT COUNT(*) AS total_departamentos FROM departamentos;

-- Obs: "Recursos Humanos" aparece 2 vezes (em escritórios diferentes)
SELECT COUNT(DISTINCT departamento_nome) AS nomes_diferentes FROM departamentos;

-- 1.5 Quantos escritórios e em quais países
SELECT COUNT(*) AS total_escritorios FROM escritorios;

SELECT p.pais_nome, COUNT(*) AS escritorios
FROM escritorios e
JOIN paises p ON p.pais_id = e.pais_id
GROUP BY p.pais_nome
ORDER BY escritorios DESC;


-- =====================================================================
-- NÍVEL 2: Análise Financeira Básica
-- =====================================================================

-- 2.1 Funcionários do Departamento de Vendas
SELECT COUNT(*) AS funcionarios_vendas
FROM funcionarios f
JOIN departamentos d ON d.departamento_id = f.departamento_id
WHERE d.departamento_nome = 'Vendas';

-- 2.2 Custo total com salários do Departamento de Vendas
SELECT SUM(f.salario) AS custo_salarios_vendas
FROM funcionarios f
JOIN departamentos d ON d.departamento_id = f.departamento_id
WHERE d.departamento_nome = 'Vendas';

-- 2.3 Média salarial sem CEO, CMO e CFO
SELECT ROUND(AVG(f.salario), 2) AS media_salarial
FROM funcionarios f
JOIN cargos c ON c.cargo_id = f.cargo_id
WHERE c.cargo_nome NOT IN ('CEO', 'CMO', 'CFO');

-- 2.4 Média salarial do Departamento de Tecnologia
SELECT ROUND(AVG(f.salario), 2) AS media_tecnologia
FROM funcionarios f
JOIN departamentos d ON d.departamento_id = f.departamento_id
WHERE d.departamento_nome = 'Tecnologia da Informação';

-- 2.5 Departamento com a maior média salarial
SELECT d.departamento_nome, ROUND(AVG(f.salario), 2) AS media_salarial
FROM funcionarios f
JOIN departamentos d ON d.departamento_id = f.departamento_id
GROUP BY d.departamento_id, d.departamento_nome
ORDER BY media_salarial DESC
LIMIT 1;

-- 2.6 Departamento com menos funcionários
-- (vários empatados com 1, então mostro todos com o menor número)
SELECT d.departamento_nome, e.escritorio_nome, COUNT(f.funcionario_id) AS funcionarios
FROM departamentos d
JOIN escritorios e ON e.escritorio_id = d.escritorio_id
LEFT JOIN funcionarios f ON f.departamento_id = d.departamento_id
GROUP BY d.departamento_id, d.departamento_nome, e.escritorio_nome
ORDER BY funcionarios ASC
LIMIT 5;


-- =====================================================================
-- NÍVEL 3: Recursos Humanos
-- =====================================================================

-- Primeiro vi quais tipos de relacionamento existem
SELECT relacionamento, COUNT(*) FROM dependentes GROUP BY relacionamento;

-- 3.1 Funcionários com cônjuge
SELECT COUNT(DISTINCT funcionario_id) AS funcionarios_com_conjuge
FROM dependentes
WHERE relacionamento = 'Cônjuge';

-- 3.2 Funcionários com filhos
SELECT COUNT(DISTINCT funcionario_id) AS funcionarios_com_filhos
FROM dependentes
WHERE relacionamento = 'Filha(o)';

-- 3.3 Funcionário contratado há mais tempo
SELECT primeiro_nome, sobrenome, data_contratacao
FROM funcionarios
ORDER BY data_contratacao ASC
LIMIT 1;

-- 3.4 Funcionário contratado há menos tempo
-- (sem contar eu, que entrei hoje no 1.1)
SELECT primeiro_nome, sobrenome, data_contratacao
FROM funcionarios
WHERE funcionario_id <> 301
ORDER BY data_contratacao DESC
LIMIT 1;

-- 3.5 Os 5 com mais tempo de casa
SELECT primeiro_nome, sobrenome, data_contratacao
FROM funcionarios
ORDER BY data_contratacao ASC
LIMIT 5;

-- 3.6 Contratados na década de 1990
SELECT COUNT(*) AS contratados_anos_90
FROM funcionarios
WHERE YEAR(data_contratacao) BETWEEN 1990 AND 1999;

-- 3.7 Média salarial por ano de contratação
SELECT YEAR(data_contratacao) AS ano, COUNT(*) AS contratados, ROUND(AVG(salario), 2) AS media_salarial
FROM funcionarios
GROUP BY YEAR(data_contratacao)
ORDER BY ano;


-- =====================================================================
-- NÍVEL 4: Operações e Escritórios
-- =====================================================================

-- 4.1 Custo total de suprimentos por escritório
SELECT e.escritorio_nome, SUM(s.quantidade_estoque * s.custo_unitario) AS custo_total
FROM suprimentos s
JOIN escritorios e ON e.escritorio_id = s.escritorio_id
GROUP BY e.escritorio_nome
ORDER BY custo_total DESC;

-- 4.2 Escritório com mais tipos diferentes de suprimentos
SELECT e.escritorio_nome, COUNT(DISTINCT s.suprimento_nome) AS tipos_suprimentos
FROM suprimentos s
JOIN escritorios e ON e.escritorio_id = s.escritorio_id
GROUP BY e.escritorio_nome
ORDER BY tipos_suprimentos DESC;
-- Deu empate: os 15 escritórios que têm suprimentos têm os mesmos 7 tipos

-- 4.3 Suprimento mais caro (preço unitário)
SELECT s.suprimento_nome, s.custo_unitario, e.escritorio_nome
FROM suprimentos s
JOIN escritorios e ON e.escritorio_id = s.escritorio_id
ORDER BY s.custo_unitario DESC
LIMIT 1;

-- 4.4 Valor total do inventário de suprimentos
SELECT SUM(quantidade_estoque * custo_unitario) AS valor_total_inventario
FROM suprimentos;


-- =====================================================================
-- NÍVEL 5: Produtos e Vendas
-- =====================================================================

-- 5.1 Produtos que foram vendidos
SELECT DISTINCT p.produto_nome
FROM itens_venda i
JOIN produtos p ON p.produto_id = i.produto_id
ORDER BY p.produto_nome;

-- 5.2 Produto mais vendido (quantidade)
SELECT p.produto_nome, SUM(i.quantidade) AS quantidade_total
FROM itens_venda i
JOIN produtos p ON p.produto_id = i.produto_id
GROUP BY p.produto_nome
ORDER BY quantidade_total DESC
LIMIT 1;

-- 5.3 Produto menos vendido
-- (vários produtos empatam, então mostro os primeiros)
SELECT p.produto_nome, SUM(i.quantidade) AS quantidade_total
FROM itens_venda i
JOIN produtos p ON p.produto_id = i.produto_id
GROUP BY p.produto_nome
ORDER BY quantidade_total ASC
LIMIT 5;

-- 5.4 Produto que gerou mais receita (quantidade x preço)
SELECT p.produto_nome, SUM(i.quantidade * i.preco_unitario) AS receita
FROM itens_venda i
JOIN produtos p ON p.produto_id = i.produto_id
GROUP BY p.produto_nome
ORDER BY receita DESC
LIMIT 1;

-- 5.5 Produto mais caro do catálogo
SELECT produto_nome, preco_catalogo
FROM produtos
ORDER BY preco_catalogo DESC
LIMIT 1;

-- 5.6 Faturamento total
SELECT SUM(quantidade * preco_unitario) AS faturamento_total
FROM itens_venda;

-- Também calculei sem as vendas canceladas, que não deveriam contar como faturamento
SELECT SUM(i.quantidade * i.preco_unitario) AS faturamento_sem_canceladas
FROM itens_venda i
JOIN vendas v ON v.venda_id = i.venda_id
JOIN status_venda s ON s.status_venda_id = v.status_venda_id
WHERE s.nome <> 'CANCELADA';

-- 5.7 Vendas em junho de 2023
SELECT COUNT(*) AS vendas_junho_2023
FROM vendas
WHERE YEAR(data_venda) = 2023 AND MONTH(data_venda) = 6;

-- 5.8 Vendedor com mais vendas (transações)
SELECT f.primeiro_nome, f.sobrenome, COUNT(*) AS total_vendas
FROM vendas v
JOIN funcionarios f ON f.funcionario_id = v.funcionario_id
GROUP BY f.funcionario_id, f.primeiro_nome, f.sobrenome
ORDER BY total_vendas DESC;

-- 5.9 Vendedor que gerou mais receita
SELECT f.primeiro_nome, f.sobrenome, SUM(i.quantidade * i.preco_unitario) AS receita
FROM vendas v
JOIN itens_venda i ON i.venda_id = v.venda_id
JOIN funcionarios f ON f.funcionario_id = v.funcionario_id
GROUP BY f.funcionario_id, f.primeiro_nome, f.sobrenome
ORDER BY receita DESC
LIMIT 1;


-- =====================================================================
-- NÍVEL 6: Operações de Atualização
-- =====================================================================

-- 6.1 Novo departamento Inovações no escritório Wayne Offices
SELECT escritorio_id FROM escritorios WHERE escritorio_nome = 'Wayne Offices';  -- 1400
SELECT MAX(departamento_id) FROM departamentos;                                -- 30

INSERT INTO departamentos (departamento_id, departamento_nome, educacional, escritorio_id)
VALUES (31, 'Inovações', 0, 1400);

SELECT * FROM departamentos WHERE departamento_id = 31;

-- 6.2 Transferir 2 funcionários de Tecnologia para Inovações
-- Escolhi a Valli Stark e a Diana Lorentz (não escolhi a Ariel Nunes porque ela
-- acabou de ser contratada pela escola, e nem o Bruce Ernst porque ele vai ser promovido)
SELECT funcionario_id, primeiro_nome, sobrenome FROM funcionarios WHERE departamento_id = 6;

UPDATE funcionarios
SET departamento_id = 31
WHERE funcionario_id IN (106, 107);

SELECT funcionario_id, primeiro_nome, sobrenome, departamento_id
FROM funcionarios WHERE departamento_id = 31;

-- 6.3 Aumento de 10% para quem está em Tecnologia
SELECT funcionario_id, primeiro_nome, salario, salario * 1.10 AS novo_salario
FROM funcionarios WHERE departamento_id = 6;

UPDATE funcionarios
SET salario = salario * 1.10
WHERE departamento_id = 6;

SELECT funcionario_id, primeiro_nome, salario FROM funcionarios WHERE departamento_id = 6;

-- 6.4 Promover Bruce Ernst para Senior Web Developer com salário de 5000
-- O cargo já existe na tabela cargos (cargo_id 26)
SELECT cargo_id, cargo_nome, min_salario, max_salario FROM cargos WHERE cargo_nome = 'Senior Web Developer';

UPDATE funcionarios
SET cargo_id = 26, salario = 5000.00
WHERE primeiro_nome = 'Bruce' AND sobrenome = 'Ernst';

-- Obs: 5000 está abaixo do mínimo do cargo (7000) e abaixo do que ele já ganhava (6000).
-- Fiz como o exercício pediu, mas no nível 12 corrijo isso.
SELECT primeiro_nome, sobrenome, cargo_id, salario FROM funcionarios WHERE sobrenome = 'Ernst';

-- 6.5 Novo suprimento: 15 Headsets a $150 no Wayne Offices
SELECT MAX(suprimento_id) FROM suprimentos;

INSERT INTO suprimentos (suprimento_id, referencia_compra, suprimento_nome, quantidade_estoque,
                         custo_unitario, moeda, data_compra, escritorio_id)
VALUES (106, 'PO-1400-HEADSET', 'Headsets', 15, 150.00, 'USD', CURDATE(), 1400);

SELECT * FROM suprimentos WHERE suprimento_id = 106;

-- 6.6 Remover funcionários contratados antes de 1990
-- Primeiro o SELECT para ver quantos serão afetados
SELECT funcionario_id, primeiro_nome, sobrenome, data_contratacao
FROM funcionarios
WHERE data_contratacao < '1990-01-01';   -- 8 funcionários

-- Eles têm dependentes, e a chave estrangeira de dependentes é RESTRICT
-- (não deixa apagar o funcionário). Então apago os dependentes primeiro.
SELECT COUNT(*) AS dependentes_afetados
FROM dependentes
WHERE funcionario_id IN (SELECT funcionario_id FROM funcionarios WHERE data_contratacao < '1990-01-01');

DELETE FROM dependentes
WHERE funcionario_id IN (
    SELECT funcionario_id FROM (
        SELECT funcionario_id FROM funcionarios WHERE data_contratacao < '1990-01-01'
    ) AS t
);

-- Os subordinados ficam com gerente_id NULL e o audit_log também (ON DELETE SET NULL)
DELETE FROM funcionarios
WHERE data_contratacao < '1990-01-01';

SELECT COUNT(*) AS restantes_antes_1990 FROM funcionarios WHERE data_contratacao < '1990-01-01';
SELECT COUNT(*) AS total_funcionarios FROM funcionarios;


-- =====================================================================
-- NÍVEL 7: Da sala de aula ao impacto corporativo
-- =====================================================================

-- 7.1 Cursos ativos com carga horária, nível e número de turmas
SELECT c.curso_nome, c.carga_horaria, n.nome AS nivel, COUNT(t.turma_id) AS turmas
FROM cursos c
JOIN niveis_curso n ON n.nivel_curso_id = c.nivel_curso_id
LEFT JOIN turmas t ON t.curso_id = c.curso_id
WHERE c.ativo = true
GROUP BY c.curso_id, c.curso_nome, c.carga_horaria, n.nome;

-- 7.2 Cada turma com curso, professor, capacidade e matrículas
SELECT t.codigo AS turma, c.curso_nome,
       CONCAT(f.primeiro_nome, ' ', f.sobrenome) AS professor,
       t.capacidade, COUNT(m.matricula_id) AS matriculas
FROM turmas t
JOIN cursos c ON c.curso_id = t.curso_id
JOIN funcionarios f ON f.funcionario_id = t.professor_funcionario_id
LEFT JOIN matriculas m ON m.turma_id = t.turma_id
GROUP BY t.turma_id, t.codigo, c.curso_nome, f.primeiro_nome, f.sobrenome, t.capacidade;

-- 7.3 Estudantes com bolsa, percentual e curso
SELECT a.nome AS aluno, c.curso_nome, b.percentual_desconto, b.criterio
FROM bolsas b
JOIN alunos a ON a.aluno_id = b.aluno_id
JOIN cursos c ON c.curso_id = b.curso_id;

SELECT COUNT(DISTINCT aluno_id) AS alunos_com_bolsa FROM bolsas;

-- 7.4 Por curso e turma: matrículas, concluintes, certificados e nota média
SELECT c.curso_nome, t.codigo AS turma,
       COUNT(m.matricula_id) AS matriculas,
       SUM(CASE WHEN sm.nome = 'CONCLUIDA' THEN 1 ELSE 0 END) AS concluintes,
       SUM(m.certificado_emitido) AS certificados,
       ROUND(AVG(m.nota_final), 2) AS nota_media
FROM turmas t
JOIN cursos c ON c.curso_id = t.curso_id
LEFT JOIN matriculas m ON m.turma_id = t.turma_id
LEFT JOIN status_matricula sm ON sm.status_matricula_id = m.status_matricula_id
GROUP BY c.curso_nome, t.codigo;
-- Antes de dizer que um curso teve "mais sucesso" eu precisaria saber:
--   - se as turmas já terminaram (algumas ainda estão em andamento, sem nota)
--   - quantos alunos cada turma tem (com 1 ou 2 alunos a média não diz muita coisa)
--   - se os cursos têm o mesmo nível e a mesma forma de avaliação
--   - o que é "sucesso": nota, conclusão, ou o aluno conseguir estágio/emprego

-- 7.5 Trajetória da Ariel Nunes
SELECT a.nome, c.curso_nome, t.codigo AS turma, m.data_matricula, sm.nome AS status_matricula,
       m.nota_final, b.percentual_desconto AS bolsa
FROM alunos a
JOIN matriculas m ON m.aluno_id = a.aluno_id
JOIN turmas t ON t.turma_id = m.turma_id
JOIN cursos c ON c.curso_id = t.curso_id
JOIN status_matricula sm ON sm.status_matricula_id = m.status_matricula_id
LEFT JOIN bolsas b ON b.aluno_id = a.aluno_id AND b.curso_id = c.curso_id
WHERE a.nome = 'Ariel Nunes';

SELECT a.nome, tv.nome AS tipo_vinculo, d.departamento_nome, v.data_inicio, v.data_fim,
       sv.nome AS status_vinculo, v.funcionario_id
FROM vinculos_talentos v
JOIN alunos a ON a.aluno_id = v.aluno_id
JOIN tipos_vinculo tv ON tv.tipo_vinculo_id = v.tipo_vinculo_id
JOIN status_vinculo sv ON sv.status_vinculo_id = v.status_vinculo_id
JOIN departamentos d ON d.departamento_id = v.departamento_id
WHERE a.nome = 'Ariel Nunes'
ORDER BY v.data_inicio;
-- Linha do tempo: cadastro (10/01/2025) -> bolsa de 100% (12/01) -> matrícula em
-- Tecnologia Criativa (15/01) -> turma TEC-2025-01 (fev a abr, nota 91,5 e certificado)
-- -> estágio em Tecnologia da Informação (05/05 a 11/05) -> contratada em 12/05/2025.
-- A formação se conecta com a empresa no estágio, logo depois do fim da turma.

-- 7.6 Vínculos de talentos
SELECT a.nome AS estudante, tv.nome AS tipo_vinculo, d.departamento_nome, sv.nome AS status,
       CONCAT(f.primeiro_nome, ' ', f.sobrenome) AS funcionario_associado
FROM vinculos_talentos v
JOIN alunos a ON a.aluno_id = v.aluno_id
JOIN tipos_vinculo tv ON tv.tipo_vinculo_id = v.tipo_vinculo_id
JOIN status_vinculo sv ON sv.status_vinculo_id = v.status_vinculo_id
JOIN departamentos d ON d.departamento_id = v.departamento_id
LEFT JOIN funcionarios f ON f.funcionario_id = v.funcionario_id;

SELECT tv.nome AS tipo_vinculo, COUNT(DISTINCT v.aluno_id) AS pessoas
FROM vinculos_talentos v
JOIN tipos_vinculo tv ON tv.tipo_vinculo_id = v.tipo_vinculo_id
GROUP BY tv.nome;

-- 7.7 Departamentos que recebem talentos da escola
SELECT DISTINCT d.departamento_nome
FROM vinculos_talentos v
JOIN departamentos d ON d.departamento_id = v.departamento_id;

-- 7.8 Uma única consulta com os indicadores da escola
SELECT
    (SELECT COUNT(*) FROM alunos) AS total_alunos,
    (SELECT COUNT(*) FROM matriculas m JOIN status_matricula s ON s.status_matricula_id = m.status_matricula_id
      WHERE s.nome = 'ATIVA') AS matriculas_ativas,
    (SELECT COUNT(*) FROM matriculas m JOIN status_matricula s ON s.status_matricula_id = m.status_matricula_id
      WHERE s.nome = 'CONCLUIDA') AS concluintes,
    (SELECT COUNT(*) FROM bolsas) AS bolsas_concedidas,
    (SELECT COUNT(*) FROM vinculos_talentos v JOIN tipos_vinculo t ON t.tipo_vinculo_id = v.tipo_vinculo_id
      WHERE t.nome = 'ESTAGIO') AS estagios,
    (SELECT COUNT(*) FROM vinculos_talentos v JOIN tipos_vinculo t ON t.tipo_vinculo_id = v.tipo_vinculo_id
      WHERE t.nome = 'CONTRATACAO') AS contratacoes,
    (SELECT COUNT(DISTINCT departamento_id) FROM vinculos_talentos) AS departamentos_com_talentos;

-- 7.11 O que faz a tabela vinculos_talentos?
-- Ela liga um aluno da escola a um departamento da empresa quando ele tem uma
-- oportunidade formal (estágio ou contratação). Guarda o tipo do vínculo, as datas,
-- o status e, quando a pessoa vira funcionária, o funcionario_id dela.
-- Ou seja, é a "ponte" entre a parte educacional e a parte corporativa,
-- já que aluno e funcionário são tabelas separadas.


-- =====================================================================
-- NÍVEL 8: Duas Frentes, Duas Operações
-- =====================================================================
-- A coluna departamentos.educacional separa as frentes: 1 = escola, 0 = comercial.
-- Obs: os valores estão em moedas diferentes (USD, BRL, EUR, GBP), então separei
-- por moeda para não somar coisas diferentes.

-- 8.1 Custo de cada frente: salários por departamento
SELECT CASE WHEN d.educacional = 1 THEN 'Educacional' ELSE 'Comercial' END AS frente,
       d.departamento_nome, f.moeda_salario, COUNT(*) AS funcionarios, SUM(f.salario) AS custo_salarios
FROM funcionarios f
JOIN departamentos d ON d.departamento_id = f.departamento_id
GROUP BY frente, d.departamento_nome, f.moeda_salario
ORDER BY frente, custo_salarios DESC;

-- Total de salários por frente
SELECT CASE WHEN d.educacional = 1 THEN 'Educacional' ELSE 'Comercial' END AS frente,
       f.moeda_salario, SUM(f.salario) AS custo_salarios
FROM funcionarios f
JOIN departamentos d ON d.departamento_id = f.departamento_id
GROUP BY frente, f.moeda_salario;

-- Suprimentos ficam no escritório e não no departamento. Então separei os escritórios
-- que só têm departamentos educacionais, só comerciais, ou os dois (misto)
SELECT tipo_escritorio, SUM(custo) AS custo_suprimentos
FROM (
    SELECT e.escritorio_id,
           CASE WHEN MIN(d.educacional) = 1 THEN 'Educacional'
                WHEN MAX(d.educacional) = 0 THEN 'Comercial'
                ELSE 'Misto' END AS tipo_escritorio,
           (SELECT SUM(s.quantidade_estoque * s.custo_unitario)
              FROM suprimentos s WHERE s.escritorio_id = e.escritorio_id) AS custo
    FROM escritorios e
    JOIN departamentos d ON d.escritorio_id = e.escritorio_id
    GROUP BY e.escritorio_id
) AS t
GROUP BY tipo_escritorio;
-- Não encontrei tabela de "despesas gerais", então considerei só salários e suprimentos.

-- 8.2 Escritórios com equipes comerciais e com equipes da escola
SELECT e.escritorio_nome,
       SUM(CASE WHEN d.educacional = 0 THEN 1 ELSE 0 END) AS deptos_comerciais,
       SUM(CASE WHEN d.educacional = 1 THEN 1 ELSE 0 END) AS deptos_educacionais
FROM escritorios e
JOIN departamentos d ON d.escritorio_id = e.escritorio_id
GROUP BY e.escritorio_nome
ORDER BY deptos_educacionais DESC, deptos_comerciais DESC;

-- 8.3 A receita das vendas sustenta a escola?
-- Comparei a receita das vendas (sem canceladas) com o custo de salários da escola em USD
SELECT
    (SELECT SUM(i.quantidade * i.preco_unitario)
       FROM itens_venda i
       JOIN vendas v ON v.venda_id = i.venda_id
       JOIN status_venda s ON s.status_venda_id = v.status_venda_id
      WHERE s.nome <> 'CANCELADA') AS receita_vendas_usd,
    (SELECT SUM(f.salario)
       FROM funcionarios f
       JOIN departamentos d ON d.departamento_id = f.departamento_id
      WHERE d.educacional = 1 AND f.moeda_salario = 'USD') AS salarios_escola_usd;
-- Obs: a receita é de mais de 2 anos de vendas e o salário é mensal, e parte dos salários
-- da escola está em outras moedas. Então é só uma comparação aproximada.

-- 8.4 Cargos compartilhados pelas duas frentes
SELECT c.cargo_nome
FROM funcionarios f
JOIN cargos c ON c.cargo_id = f.cargo_id
JOIN departamentos d ON d.departamento_id = f.departamento_id
GROUP BY c.cargo_nome
HAVING COUNT(DISTINCT d.educacional) = 2;

-- Departamentos com o mesmo nome nas duas frentes
SELECT departamento_nome
FROM departamentos
GROUP BY departamento_nome
HAVING COUNT(DISTINCT educacional) = 2;
-- Não voltou nenhum: os departamentos têm nomes diferentes em cada frente.
-- Na consulta de cargos só apareceu "Aprendiz", e só por minha causa (me cadastrei
-- como Aprendiz em Dados e Inteligência no 1.1). Na base original as duas frentes
-- não compartilham nenhum cargo nem departamento.

-- 8.5 Expansão internacional: por país, funcionários, departamentos da escola e vendas
SELECT p.pais_nome,
       COUNT(DISTINCT f.funcionario_id) AS funcionarios,
       COUNT(DISTINCT CASE WHEN d.educacional = 1 THEN d.departamento_id END) AS deptos_escola,
       COUNT(DISTINCT CASE WHEN d.educacional = 0 THEN d.departamento_id END) AS deptos_comerciais,
       COUNT(DISTINCT v.venda_id) AS vendas
FROM paises p
JOIN escritorios e ON e.pais_id = p.pais_id
JOIN departamentos d ON d.escritorio_id = e.escritorio_id
LEFT JOIN funcionarios f ON f.departamento_id = d.departamento_id
LEFT JOIN vendas v ON v.funcionario_id = f.funcionario_id
GROUP BY p.pais_nome
ORDER BY funcionarios DESC;
-- As vendas são todas feitas pelo Departamento de Vendas (Umbrella Corp, Reino Unido),
-- enquanto a escola está espalhada em vários países. A expansão aumenta as equipes
-- e o projeto educacional, mas as vendas ainda estão concentradas em um lugar só.


-- =====================================================================
-- NÍVEL 9: Análise Avançada com Agregações
-- =====================================================================

-- 9.1 Relatório por departamento
SELECT d.departamento_nome, e.escritorio_nome,
       COUNT(f.funcionario_id) AS funcionarios,
       SUM(f.salario) AS salario_total,
       ROUND(AVG(f.salario), 2) AS media_salarial
FROM departamentos d
JOIN escritorios e ON e.escritorio_id = d.escritorio_id
LEFT JOIN funcionarios f ON f.departamento_id = d.departamento_id
GROUP BY d.departamento_id, d.departamento_nome, e.escritorio_nome
ORDER BY funcionarios DESC;

-- 9.2 Os 3 cargos mais comuns
SELECT c.cargo_nome, COUNT(*) AS funcionarios
FROM funcionarios f
JOIN cargos c ON c.cargo_id = f.cargo_id
GROUP BY c.cargo_nome
ORDER BY funcionarios DESC
LIMIT 3;

-- 9.3 Funcionários que ganham acima da média do próprio departamento
SELECT f.primeiro_nome, f.sobrenome, d.departamento_nome, f.salario
FROM funcionarios f
JOIN departamentos d ON d.departamento_id = f.departamento_id
WHERE f.salario > (
    SELECT AVG(f2.salario)
    FROM funcionarios f2
    WHERE f2.departamento_id = f.departamento_id
)
ORDER BY d.departamento_nome;

-- 9.4 Contratações por ano e crescimento
-- Usei LAG para pegar o valor do ano anterior
SELECT ano, contratados,
       SUM(contratados) OVER (ORDER BY ano) AS total_acumulado,
       contratados - LAG(contratados) OVER (ORDER BY ano) AS diferenca_ano_anterior
FROM (
    SELECT YEAR(data_contratacao) AS ano, COUNT(*) AS contratados
    FROM funcionarios
    GROUP BY YEAR(data_contratacao)
) AS t
ORDER BY ano;

-- 9.5 Ranking dos vendedores
SELECT f.primeiro_nome, f.sobrenome,
       COUNT(DISTINCT v.venda_id) AS vendas,
       SUM(i.quantidade * i.preco_unitario) AS receita
FROM vendas v
JOIN itens_venda i ON i.venda_id = v.venda_id
JOIN funcionarios f ON f.funcionario_id = v.funcionario_id
GROUP BY f.funcionario_id, f.primeiro_nome, f.sobrenome
ORDER BY receita DESC;

-- 9.6 Produtos vendidos por apenas um vendedor
SELECT p.produto_nome, MIN(CONCAT(f.primeiro_nome, ' ', f.sobrenome)) AS vendedor
FROM itens_venda i
JOIN vendas v ON v.venda_id = i.venda_id
JOIN produtos p ON p.produto_id = i.produto_id
JOIN funcionarios f ON f.funcionario_id = v.funcionario_id
GROUP BY p.produto_nome
HAVING COUNT(DISTINCT v.funcionario_id) = 1;


-- =====================================================================
-- NÍVEL 10: Auditoria de Vendas
-- =====================================================================

-- 10.1 Vendas sem vendedor
SELECT * FROM vendas WHERE funcionario_id IS NULL;
-- Não volta nada: funcionario_id é NOT NULL na tabela vendas.

-- Aproveitei e conferi vendas sem nenhum item
SELECT v.venda_id, v.referencia_origem
FROM vendas v
LEFT JOIN itens_venda i ON i.venda_id = v.venda_id
WHERE i.item_venda_id IS NULL;

-- 10.2 Vendedores nas vendas que não existem em funcionarios
SELECT v.venda_id, v.funcionario_id
FROM vendas v
LEFT JOIN funcionarios f ON f.funcionario_id = v.funcionario_id
WHERE f.funcionario_id IS NULL;
-- Também não volta nada, porque a chave estrangeira não deixa.

-- 10.3 Produtos com preço muito diferente entre transações (variação > 10%)
SELECT p.produto_nome,
       MIN(i.preco_unitario) AS menor_preco,
       MAX(i.preco_unitario) AS maior_preco,
       ROUND((MAX(i.preco_unitario) - MIN(i.preco_unitario)) / MIN(i.preco_unitario) * 100, 2) AS variacao_pct
FROM itens_venda i
JOIN produtos p ON p.produto_id = i.produto_id
GROUP BY p.produto_nome
HAVING (MAX(i.preco_unitario) - MIN(i.preco_unitario)) / MIN(i.preco_unitario) > 0.10
ORDER BY variacao_pct DESC;

-- Também comparei com o preço de catálogo
SELECT p.produto_nome, p.preco_catalogo, i.preco_unitario, v.venda_id,
       ROUND((i.preco_unitario - p.preco_catalogo) / p.preco_catalogo * 100, 2) AS diferenca_pct
FROM itens_venda i
JOIN produtos p ON p.produto_id = i.produto_id
JOIN vendas v ON v.venda_id = i.venda_id
WHERE ABS(i.preco_unitario - p.preco_catalogo) / p.preco_catalogo > 0.10
ORDER BY diferenca_pct DESC;

-- 10.4 Dashboard do CEO em uma única query
SELECT
    (SELECT COUNT(*) FROM funcionarios) AS total_funcionarios,
    (SELECT SUM(salario) FROM funcionarios) AS custo_total_salarios,
    (SELECT COUNT(*) FROM departamentos) AS departamentos,
    (SELECT COUNT(*) FROM escritorios) AS escritorios,
    (SELECT SUM(quantidade * preco_unitario) FROM itens_venda) AS receita_total,
    (SELECT p.produto_nome
       FROM itens_venda i JOIN produtos p ON p.produto_id = i.produto_id
      GROUP BY p.produto_nome
      ORDER BY SUM(i.quantidade) DESC
      LIMIT 1) AS produto_mais_vendido;


-- =====================================================================
-- NÍVEL 11: ETL do CSV
-- =====================================================================

-- ---------- 1. EXTRACT ----------
-- Carreguei o CSV na stg_vendas_csv sem mudar nenhum valor.
-- No Workbench dá para usar o Table Data Import Wizard (delimitador ";").
-- Para o arquivo ficar reproduzível, deixei também os INSERTs com os valores exatos do CSV
-- (os espaços e formatos estão iguais ao arquivo original).

INSERT INTO stg_vendas_csv (source_row_id, lote_origem, pedido_ref, item_seq, data_venda_raw, locale_origem,
                            sku_raw, quantidade_raw, preco_unitario_raw, moeda_raw, email_vendedor_raw,
                            canal_raw, status_raw) VALUES
(1,'LOJA_2025_08','EXT-9001','1','2025-08-10','ISO','pop-001','2','US$ 300.13','USD',' john.russell@momento.org ','web','paid'),
(2,'LOJA_2025_08','EXT-9001','2','2025-08-10','ISO','PKM-002','1','$ 80.50','USD','john.russell@momento.org','Online','concluída'),
(3,'LOJA_2025_08','EXT-9001','1','2025-08-10','ISO','POP-001','2','300.13','USD','john.russell@momento.org','WEB','CONCLUIDA'),
(4,'BRASIL_2025_08','EXT-9002','1','10/08/2025','pt-BR','SW-001','3','R$ 1.250,00','BRL','KAREN.PARTNERS@MOMENTO.ORG','loja física','pago'),
(5,'LEGADO_2025_08','EXT-9003','1','05/06/25','?','BAT-001','1','239,29','USD','john.russell@momento.org','web','pago'),
(6,'LEGADO_2025_08','EXT-9004','1','31/02/2025','pt-BR','WEB-001','1','237,19','USD','john.russell@momento.org','web','pago'),
(7,'LOJA_2025_08','EXT-9005','1','2025-08-11','ISO','SKU-404','1','250.00','USD','john.russell@momento.org','app','pago'),
(8,'LOJA_2025_08','EXT-9006','1','2025-08-11','ISO','ANT-001','1','289.29','USD','nao.existe@momento.org','app','pago'),
(9,'LOJA_2025_08','EXT-9007','1','2025-08-12','ISO','COS-001','0','750.19','USD','john.russell@momento.org','web','pago'),
(10,'LOJA_2025_08','EXT-9008','1','2025-08-12','ISO','WW-001','-2','325.13','USD','john.russell@momento.org','web','pago'),
(11,'BRASIL_2025_08','EXT-9009','1','12/08/2025','pt-BR','IM-005','2','R$ 1.234,50','BRL','karen.partners@momento.org','Loja','concluída'),
(12,'US_WEB_2025_08','EXT-9010','1','08/13/2025','en-US','SW-002','1','4,500.00','USD','john.russell@momento.org','Online','Paid'),
(13,'LOJA_2025_08','EXT-9001','1','2025-08-10','ISO','POP-001','3','300.13','USD','john.russell@momento.org','WEB','CONCLUIDA'),
(14,'LOJA_2025_08','EXT-9011','1','2025-08-13','ISO','SW-003','1','750.00','USD','john.russell@momento.org','marketplace','cancelado'),
(15,'LOJA_2025_08','EXT-9012','1','2025-08-13','ISO','MAR-001','1','4,250.00','USD','  KAREN.PARTNERS@momento.org  ','Marketplace','paid'),
(16,'LOJA_2025_08','EXT-9013','1','2025-08-14','ISO','LOTR-001','1','999.99','USD','john.russell@momento.org','TikTok Shop','pending'),
(17,'LOJA_2025_08','EXT-9014','1','2025-08-14','ISO','DBZ-001','1','500.00','USD','john.russell@momento.org','web','pago'),
(18,'LEGADO_2025_08','EXT-9015','1','2025-08-14','ISO','ZEL-001','1','$ 1,800.00','','john.russell@momento.org','web','pago'),
(19,'LOJA_2025_08','EXT-9016','1','2025-08-15','ISO','FF-001','1','1299','XYZ','john.russell@momento.org','web','pago'),
(20,'LOJA_2025_08','EXT-9017','1','2025-08-15','ISO','HP-001','1','N/A','USD','john.russell@momento.org','web','pago'),
(21,'LOJA_2025_08','EXT-9018','1','2025-08-15','ISO','SW-004','dois','400.00','USD','john.russell@momento.org','web','pago'),
(22,'LOJA_2025_08','EXT-9019','1','2025-08-16','ISO','  mar-002  ','1','7,000.00','USD','john.russell@momento.org','web','pago'),
(23,'BRASIL_2025_08','EXT-9020','1','16/08/2025','pt-BR','DC-003','1','R$ 1.200,00','BRL','karen.partners@momento.org','loja','pago'),
(24,'LOJA_2025_08','EXT-9021','1','2025-08-17','ISO','BEN-001','1','300.00','USD','john.russell@momento.org','web','pago'),
(25,'LOJA_2025_08','EXT-9022','1','2025-08-17','ISO','GOW-001','1','3,000.00','USD','john.russell@momento.org','web','pago'),
(26,'LOJA_2025_08','EXT-9023','1','2025-08-18','ISO','DBZ-002','1','60.00','USD','john.russell@momento.org','web','pago'),
(27,'LOJA_2025_08','EXT-9024','1','2025-08-18','ISO','SW-005','1','850.00','USD','john.russell@momento.org','web','pago'),
(28,'LOJA_2025_08','EXT-9025','1','2025-08-19','ISO','MAR-003','1','5,000.00','USD','john.russell@momento.org','web','pago');

SELECT COUNT(*) AS linhas_importadas FROM stg_vendas_csv;  -- 28, igual ao CSV
SELECT * FROM stg_vendas_csv;

-- ---------- 2. TRANSFORM ----------
-- Criei uma tabela de apoio com os valores tratados, sem mexer na stg (ela continua bruta).
-- Regras:
--   - texto: TRIM para tirar espaços e UPPER/LOWER para padronizar
--   - data: o formato depende do locale (ISO = aaaa-mm-dd, pt-BR = dd/mm/aaaa, en-US = mm/dd/aaaa).
--     Primeiro monto o texto aaaa-mm-dd e só converto para DATE se a data existir.
--     Locale desconhecido ("?") fica sem data, não tentei adivinhar.
--   - preço: tirei "R$", "US$", "$" e espaços. No pt-BR o ponto é milhar e a vírgula é decimal;
--     no ISO/en-US a vírgula é milhar.
--   - quantidade: só aceita número inteiro maior que zero
--   - canal e status: troquei os nomes variados pelos nomes das tabelas canais_venda e status_venda
--     (o status_venda 2 está com o nome "1" na base, considerei que é o pendente)

DROP TABLE IF EXISTS stg_vendas_tratada;

CREATE TABLE stg_vendas_tratada AS
SELECT
    s.source_row_id,
    TRIM(s.pedido_ref) AS pedido_ref,
    CAST(TRIM(s.item_seq) AS UNSIGNED) AS item_seq,
    s.locale_origem,
    -- data montada no formato aaaa-mm-dd (ainda como texto)
    CASE
        WHEN s.locale_origem = 'ISO'   THEN TRIM(s.data_venda_raw)
        WHEN s.locale_origem = 'pt-BR' THEN CONCAT(SUBSTRING(TRIM(s.data_venda_raw), 7, 4), '-',
                                                   SUBSTRING(TRIM(s.data_venda_raw), 4, 2), '-',
                                                   SUBSTRING(TRIM(s.data_venda_raw), 1, 2))
        WHEN s.locale_origem = 'en-US' THEN CONCAT(SUBSTRING(TRIM(s.data_venda_raw), 7, 4), '-',
                                                   SUBSTRING(TRIM(s.data_venda_raw), 1, 2), '-',
                                                   SUBSTRING(TRIM(s.data_venda_raw), 4, 2))
        ELSE NULL
    END AS data_texto,
    UPPER(TRIM(s.sku_raw)) AS sku,
    CASE WHEN TRIM(s.quantidade_raw) REGEXP '^-?[0-9]+$'
         THEN CAST(TRIM(s.quantidade_raw) AS SIGNED) ELSE NULL END AS quantidade,
    CASE
        WHEN s.locale_origem = 'pt-BR'
             THEN REPLACE(REPLACE(REPLACE(REPLACE(TRIM(s.preco_unitario_raw), 'R$', ''), ' ', ''), '.', ''), ',', '.')
        WHEN s.locale_origem IN ('ISO', 'en-US')
             THEN REPLACE(REPLACE(REPLACE(REPLACE(TRIM(s.preco_unitario_raw), 'US$', ''), '$', ''), ' ', ''), ',', '')
        ELSE NULL
    END AS preco_texto,
    UPPER(TRIM(s.moeda_raw)) AS moeda,
    LOWER(TRIM(s.email_vendedor_raw)) AS email_vendedor,
    CASE
        WHEN LOWER(TRIM(s.canal_raw)) IN ('web', 'online') THEN 'WEB'
        WHEN LOWER(TRIM(s.canal_raw)) IN ('loja', 'loja física') THEN 'LOJA'
        WHEN LOWER(TRIM(s.canal_raw)) = 'app' THEN 'APP'
        WHEN LOWER(TRIM(s.canal_raw)) = 'marketplace' THEN 'MARKETPLACE'
        ELSE NULL
    END AS canal,
    CASE
        WHEN LOWER(TRIM(s.status_raw)) IN ('paid', 'pago', 'concluida', 'concluída') THEN 1
        WHEN LOWER(TRIM(s.status_raw)) IN ('pending', 'pendente') THEN 2
        WHEN LOWER(TRIM(s.status_raw)) IN ('cancelado', 'cancelada') THEN 3
        ELSE NULL
    END AS status_venda_id
FROM stg_vendas_csv s;

-- Adiciono as colunas com o preço convertido e os ids encontrados nas tabelas da base
ALTER TABLE stg_vendas_tratada
    ADD data_venda DATE,
    ADD preco_unitario DECIMAL(10,2),
    ADD produto_id INT,
    ADD funcionario_id INT,
    ADD canal_venda_id TINYINT;

-- Só converto a data se o mês for de 1 a 12 e o dia existir naquele mês
-- (LAST_DAY devolve o último dia do mês, então 31/02 não passa)
UPDATE stg_vendas_tratada
SET data_venda = CAST(data_texto AS DATE)
WHERE data_texto REGEXP '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
  AND CAST(SUBSTRING(data_texto, 6, 2) AS UNSIGNED) BETWEEN 1 AND 12
  AND CAST(SUBSTRING(data_texto, 9, 2) AS UNSIGNED)
      BETWEEN 1 AND DAY(LAST_DAY(CONCAT(SUBSTRING(data_texto, 1, 7), '-01')));

UPDATE stg_vendas_tratada
SET preco_unitario = CAST(preco_texto AS DECIMAL(10,2))
WHERE preco_texto REGEXP '^[0-9]+(\\.[0-9]+)?$';

UPDATE stg_vendas_tratada t
JOIN produtos p ON p.sku = t.sku
SET t.produto_id = p.produto_id;

UPDATE stg_vendas_tratada t
JOIN funcionarios f ON LOWER(f.email) = t.email_vendedor
SET t.funcionario_id = f.funcionario_id;

UPDATE stg_vendas_tratada t
JOIN canais_venda c ON c.nome = t.canal
SET t.canal_venda_id = c.canal_venda_id;

SELECT * FROM stg_vendas_tratada;

-- Duplicatas e conflitos: mesmo pedido + item aparecendo mais de uma vez
SELECT pedido_ref, item_seq, COUNT(*) AS linhas,
       GROUP_CONCAT(source_row_id) AS linhas_csv,
       COUNT(DISTINCT CONCAT(sku, '|', quantidade, '|', preco_unitario, '|', data_venda)) AS versoes_diferentes
FROM stg_vendas_tratada
GROUP BY pedido_ref, item_seq
HAVING COUNT(*) > 1;
-- EXT-9001 item 1 aparece 3 vezes (linhas 1, 3 e 13):
--   linhas 1 e 3 são iguais depois de tratar -> a 3 é DUPLICATA
--   linha 13 tem quantidade 3 em vez de 2 -> conflito, vai para REVISAR

-- ---------- Registrando as rejeições ----------
-- acoes_etl: 1 = REVISAR, 2 = REJEITAR, 3 = DUPLICATA
-- Critério que usei:
--   REJEITAR  -> valor impossível ou sem como interpretar (data que não existe,
--               quantidade zero/negativa/texto, preço "N/A")
--   REVISAR   -> pode ser corrigido por alguém (locale desconhecido, SKU ou vendedor
--               não encontrado, moeda vazia ou inválida, canal desconhecido, conflito)
--   DUPLICATA -> linha igual a outra já existente
-- O rejeicao_id é o source_row_id * 10 + um número da regra, para não repetir.

-- Locale não identificado
INSERT INTO etl_rejeicoes (rejeicao_id, source_row_id, campo, valor_original, motivo, acao_etl_id)
SELECT s.source_row_id * 10 + 1, s.source_row_id, 'locale_origem', s.locale_origem,
       'Localidade não identificada: não dá para saber o formato da data e do preço', 1
FROM stg_vendas_csv s
WHERE s.locale_origem NOT IN ('ISO', 'pt-BR', 'en-US');

-- Data impossível (locale conhecido, mas a data não converte)
INSERT INTO etl_rejeicoes (rejeicao_id, source_row_id, campo, valor_original, motivo, acao_etl_id)
SELECT t.source_row_id * 10 + 2, t.source_row_id, 'data_venda_raw', s.data_venda_raw,
       'Data impossível', 2
FROM stg_vendas_tratada t
JOIN stg_vendas_csv s ON s.source_row_id = t.source_row_id
WHERE t.data_venda IS NULL AND s.locale_origem IN ('ISO', 'pt-BR', 'en-US');

-- SKU desconhecido
INSERT INTO etl_rejeicoes (rejeicao_id, source_row_id, campo, valor_original, motivo, acao_etl_id)
SELECT t.source_row_id * 10 + 3, t.source_row_id, 'sku_raw', s.sku_raw,
       'SKU não existe na tabela produtos', 1
FROM stg_vendas_tratada t
JOIN stg_vendas_csv s ON s.source_row_id = t.source_row_id
WHERE t.produto_id IS NULL;

-- Vendedor sem correspondência
INSERT INTO etl_rejeicoes (rejeicao_id, source_row_id, campo, valor_original, motivo, acao_etl_id)
SELECT t.source_row_id * 10 + 4, t.source_row_id, 'email_vendedor_raw', s.email_vendedor_raw,
       'E-mail do vendedor não encontrado em funcionarios', 1
FROM stg_vendas_tratada t
JOIN stg_vendas_csv s ON s.source_row_id = t.source_row_id
WHERE t.funcionario_id IS NULL;

-- Quantidade inválida
INSERT INTO etl_rejeicoes (rejeicao_id, source_row_id, campo, valor_original, motivo, acao_etl_id)
SELECT t.source_row_id * 10 + 5, t.source_row_id, 'quantidade_raw', s.quantidade_raw,
       'Quantidade inválida (precisa ser número inteiro maior que zero)', 2
FROM stg_vendas_tratada t
JOIN stg_vendas_csv s ON s.source_row_id = t.source_row_id
WHERE t.quantidade IS NULL OR t.quantidade <= 0;

-- Preço não interpretável (só quando o locale é conhecido)
INSERT INTO etl_rejeicoes (rejeicao_id, source_row_id, campo, valor_original, motivo, acao_etl_id)
SELECT t.source_row_id * 10 + 6, t.source_row_id, 'preco_unitario_raw', s.preco_unitario_raw,
       'Preço não interpretável', 2
FROM stg_vendas_tratada t
JOIN stg_vendas_csv s ON s.source_row_id = t.source_row_id
WHERE t.preco_unitario IS NULL AND s.locale_origem IN ('ISO', 'pt-BR', 'en-US');

-- Moeda vazia ou não identificada
INSERT INTO etl_rejeicoes (rejeicao_id, source_row_id, campo, valor_original, motivo, acao_etl_id)
SELECT t.source_row_id * 10 + 7, t.source_row_id, 'moeda_raw', s.moeda_raw,
       'Moeda vazia ou não identificada', 1
FROM stg_vendas_tratada t
JOIN stg_vendas_csv s ON s.source_row_id = t.source_row_id
WHERE t.moeda IS NULL OR t.moeda NOT IN ('USD', 'BRL', 'EUR', 'GBP');

-- Canal desconhecido
INSERT INTO etl_rejeicoes (rejeicao_id, source_row_id, campo, valor_original, motivo, acao_etl_id)
SELECT t.source_row_id * 10 + 8, t.source_row_id, 'canal_raw', s.canal_raw,
       'Canal de venda não existe em canais_venda', 1
FROM stg_vendas_tratada t
JOIN stg_vendas_csv s ON s.source_row_id = t.source_row_id
WHERE t.canal_venda_id IS NULL;

-- Duplicata: mesma linha (pedido, item e valores tratados iguais) que outra com id menor
INSERT INTO etl_rejeicoes (rejeicao_id, source_row_id, campo, valor_original, motivo, acao_etl_id)
SELECT b.source_row_id * 10 + 9, b.source_row_id, 'pedido_ref/item_seq',
       CONCAT(b.pedido_ref, ' / ', b.item_seq),
       CONCAT('Duplicata da linha ', a.source_row_id), 3
FROM stg_vendas_tratada a
JOIN stg_vendas_tratada b
  ON a.pedido_ref = b.pedido_ref AND a.item_seq = b.item_seq
 AND a.source_row_id < b.source_row_id
WHERE a.sku = b.sku AND a.quantidade = b.quantidade
  AND a.preco_unitario = b.preco_unitario AND a.data_venda = b.data_venda;

-- Conflito: mesmo pedido e item, mas com valores diferentes (marca as duas versões)
INSERT INTO etl_rejeicoes (rejeicao_id, source_row_id, campo, valor_original, motivo, acao_etl_id)
SELECT DISTINCT a.source_row_id * 10, a.source_row_id, 'pedido_ref/item_seq',
       CONCAT(a.pedido_ref, ' / ', a.item_seq),
       'Conflito: mesmo pedido e item com quantidade/preço diferentes', 1
FROM stg_vendas_tratada a
JOIN stg_vendas_tratada b
  ON a.pedido_ref = b.pedido_ref AND a.item_seq = b.item_seq
 AND a.source_row_id <> b.source_row_id
WHERE NOT (a.sku = b.sku AND a.quantidade = b.quantidade
           AND a.preco_unitario = b.preco_unitario AND a.data_venda = b.data_venda)
  AND a.source_row_id NOT IN (SELECT source_row_id FROM etl_rejeicoes WHERE acao_etl_id = 3);

-- Critério do pedido com linha pendente: se uma linha do pedido tem problema,
-- o pedido inteiro fica em revisão (não carrego pedido pela metade).
-- Registro as outras linhas desse pedido que não tinham problema.
INSERT INTO etl_rejeicoes (rejeicao_id, source_row_id, campo, valor_original, motivo, acao_etl_id)
SELECT t.source_row_id * 10, t.source_row_id, 'pedido_ref', t.pedido_ref,
       'Linha válida, mas o pedido tem outra linha pendente: pedido inteiro em revisão', 1
FROM stg_vendas_tratada t
WHERE t.source_row_id NOT IN (SELECT source_row_id FROM etl_rejeicoes)
  AND t.pedido_ref IN (
      SELECT pedido_ref FROM (
          SELECT DISTINCT t2.pedido_ref
          FROM stg_vendas_tratada t2
          JOIN etl_rejeicoes r ON r.source_row_id = t2.source_row_id
      ) AS x
  );

-- Resumo das rejeições
SELECT r.source_row_id, r.campo, r.valor_original, r.motivo, a.nome AS acao
FROM etl_rejeicoes r
JOIN acoes_etl a ON a.acao_etl_id = r.acao_etl_id
ORDER BY r.source_row_id;

SELECT a.nome AS acao, COUNT(DISTINCT r.source_row_id) AS linhas
FROM etl_rejeicoes r
JOIN acoes_etl a ON a.acao_etl_id = r.acao_etl_id
GROUP BY a.nome;

-- ---------- 3. LOAD ----------
-- Linhas aceitas = linhas que não têm nenhum registro em etl_rejeicoes
SELECT * FROM stg_vendas_tratada
WHERE source_row_id NOT IN (SELECT source_row_id FROM etl_rejeicoes);

-- Conferi se algum pedido do CSV já existe na tabela vendas
SELECT referencia_origem FROM vendas
WHERE referencia_origem IN (SELECT pedido_ref FROM stg_vendas_tratada);

-- venda_id e item_venda_id não são AUTO_INCREMENT, então continuo a partir do maior id.
-- Usei ROW_NUMBER para numerar as linhas aceitas.
SELECT MAX(venda_id) FROM vendas;            -- 7054
SELECT MAX(item_venda_id) FROM itens_venda;  -- 80

-- Um registro em vendas para cada pedido aceito
INSERT INTO vendas (venda_id, referencia_origem, data_venda, cliente_id, funcionario_id,
                    canal_venda_id, status_venda_id)
SELECT (SELECT MAX(venda_id) FROM vendas) + ROW_NUMBER() OVER (ORDER BY pedido_ref),
       pedido_ref, data_venda, NULL, funcionario_id, canal_venda_id, status_venda_id
FROM (
    SELECT pedido_ref, MIN(data_venda) AS data_venda, MIN(funcionario_id) AS funcionario_id,
           MIN(canal_venda_id) AS canal_venda_id, MIN(status_venda_id) AS status_venda_id
    FROM stg_vendas_tratada
    WHERE source_row_id NOT IN (SELECT source_row_id FROM etl_rejeicoes)
    GROUP BY pedido_ref
) AS pedidos;

-- Um registro em itens_venda para cada linha aceita, guardando o source_row_id
INSERT INTO itens_venda (item_venda_id, venda_id, numero_item, produto_id, quantidade,
                         preco_unitario, moeda, source_row_id)
SELECT (SELECT MAX(item_venda_id) FROM itens_venda) + ROW_NUMBER() OVER (ORDER BY t.source_row_id),
       v.venda_id, t.item_seq, t.produto_id, t.quantidade, t.preco_unitario, t.moeda, t.source_row_id
FROM stg_vendas_tratada t
JOIN vendas v ON v.referencia_origem = t.pedido_ref
WHERE t.source_row_id NOT IN (SELECT source_row_id FROM etl_rejeicoes);

-- Conferindo a carga
SELECT v.venda_id, v.referencia_origem, v.data_venda, i.numero_item, p.sku,
       i.quantidade, i.preco_unitario, i.moeda, i.source_row_id
FROM vendas v
JOIN itens_venda i ON i.venda_id = v.venda_id
JOIN produtos p ON p.produto_id = i.produto_id
WHERE i.source_row_id IS NOT NULL
ORDER BY i.source_row_id;

-- Toda linha do CSV tem que ter ido para itens_venda ou para etl_rejeicoes
SELECT
    (SELECT COUNT(*) FROM stg_vendas_csv) AS linhas_csv,
    (SELECT COUNT(*) FROM itens_venda WHERE source_row_id IS NOT NULL) AS carregadas,
    (SELECT COUNT(DISTINCT source_row_id) FROM etl_rejeicoes) AS rejeitadas_ou_revisao;


-- =====================================================================
-- NÍVEL 12: Alterações seguras (com transação)
-- =====================================================================
-- IMPORTANTE: antes deste nível rodei o 0_Base.sql de novo.
-- Motivo: no nível 6 eu já mudei esses mesmos dados e apaguei quem foi contratado
-- antes de 1990 (inclusive o Bruce Ernst). Aqui eu refaço as alterações do jeito seguro,
-- começando da base original.
--
-- Em cada bloco: START TRANSACTION -> alteração -> SELECT para conferir -> COMMIT.
-- Se o SELECT mostrasse algo errado, eu usaria ROLLBACK no lugar do COMMIT.

USE momento;
SET SQL_SAFE_UPDATES = 0;

-- ---------- 12.1 Criar um departamento novo em um escritório existente ----------
START TRANSACTION;

INSERT INTO departamentos (departamento_id, departamento_nome, educacional, escritorio_id)
VALUES (31, 'Inovações', 0, 1400);  -- Wayne Offices

SELECT d.*, e.escritorio_nome
FROM departamentos d JOIN escritorios e ON e.escritorio_id = d.escritorio_id
WHERE d.departamento_id = 31;

COMMIT;

-- ---------- 12.2 Cargo "Senior Web Developer" e promoção do Bruce Ernst ----------
-- O cargo já existe (cargo_id 26, faixa de 7000 a 16000), então não precisei cadastrar.
-- Se não existisse seria:
-- INSERT INTO cargos (cargo_id, cargo_nome, min_salario, max_salario)
-- VALUES (41, 'Senior Web Developer', 7000.00, 16000.00);
SELECT * FROM cargos WHERE cargo_nome = 'Senior Web Developer';

-- Usei 7000 (mínimo do cargo), porque os 5000 do nível 6 ficavam abaixo da faixa
-- e abaixo do salário que ele já tinha (6000).
START TRANSACTION;

UPDATE funcionarios
SET cargo_id = (SELECT cargo_id FROM cargos WHERE cargo_nome = 'Senior Web Developer'),
    salario = 7000.00
WHERE funcionario_id = 104;  -- Bruce Ernst

SELECT f.primeiro_nome, f.sobrenome, c.cargo_nome, f.salario, c.min_salario, c.max_salario
FROM funcionarios f JOIN cargos c ON c.cargo_id = f.cargo_id
WHERE f.funcionario_id = 104;

COMMIT;

-- ---------- 12.3 Transferir 2 pessoas de Tecnologia para o novo departamento ----------
-- Escolhi Valli Stark (106) e Diana Lorentz (107): são desenvolvedoras web com bastante
-- experiência, então podem começar o departamento novo sem precisar de treinamento.
-- Não escolhi a Ariel Nunes (acabou de ser contratada) nem o Bruce Ernst (acabou de ser promovido).
START TRANSACTION;

UPDATE funcionarios
SET departamento_id = 31
WHERE funcionario_id IN (106, 107);

SELECT funcionario_id, primeiro_nome, sobrenome, departamento_id
FROM funcionarios WHERE funcionario_id IN (106, 107);

SELECT COUNT(*) AS ficaram_em_tecnologia FROM funcionarios WHERE departamento_id = 6;  -- 7

COMMIT;

-- ---------- 12.4 Reajuste de 10% para quem ficou em Tecnologia ----------
START TRANSACTION;

SELECT funcionario_id, primeiro_nome, salario AS salario_atual, ROUND(salario * 1.10, 2) AS novo_salario
FROM funcionarios WHERE departamento_id = 6;

UPDATE funcionarios
SET salario = ROUND(salario * 1.10, 2)
WHERE departamento_id = 6;

SELECT funcionario_id, primeiro_nome, salario FROM funcionarios WHERE departamento_id = 6;

COMMIT;

-- ---------- 12.5 Compra de headsets ----------
START TRANSACTION;

INSERT INTO suprimentos (suprimento_id, referencia_compra, suprimento_nome, quantidade_estoque,
                         custo_unitario, moeda, data_compra, escritorio_id)
VALUES (106, 'PO-1400-HEADSET', 'Headsets', 15, 150.00, 'USD', CURDATE(), 1400);

SELECT * FROM suprimentos WHERE referencia_compra = 'PO-1400-HEADSET';

COMMIT;

-- ---------- 12.6 Aposentadoria: status INATIVO sem apagar ninguém ----------
-- Obs: o Bruce Ernst foi contratado em 1989, então ele também entra nessa lista.
START TRANSACTION;

SELECT funcionario_id, primeiro_nome, sobrenome, data_contratacao, status_funcionario_id
FROM funcionarios
WHERE data_contratacao < '1990-01-01';

UPDATE funcionarios
SET status_funcionario_id = (SELECT status_funcionario_id FROM status_funcionario WHERE nome = 'INATIVO')
WHERE data_contratacao < '1990-01-01';

-- Conferindo: eles continuam na tabela, só mudou o status, e os dependentes continuam lá
SELECT f.funcionario_id, f.primeiro_nome, f.sobrenome, s.nome AS status
FROM funcionarios f
JOIN status_funcionario s ON s.status_funcionario_id = f.status_funcionario_id
WHERE f.data_contratacao < '1990-01-01';

SELECT COUNT(*) AS dependentes_mantidos
FROM dependentes
WHERE funcionario_id IN (SELECT funcionario_id FROM funcionarios WHERE data_contratacao < '1990-01-01');

COMMIT;

SET SQL_SAFE_UPDATES = 1;
