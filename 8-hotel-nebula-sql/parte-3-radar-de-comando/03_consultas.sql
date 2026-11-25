-- =====================================================================
-- HOTEL NEBULA — Parte 3: Radar de Comando
-- Script 03: consultas para a gestão
-- Execute depois dos scripts 01 e 02.
-- =====================================================================

USE hotel_nebula;

-- ---------------------------------------------------------------------
-- 1. Quais quartos estão disponíveis em determinado período?
-- Basta trocar as datas abaixo. O período vale de @inicio (check-in)
-- até @fim (check-out). Um quarto está livre quando está ativo e não
-- tem reserva ativa que se sobreponha ao período (canceladas e no-show
-- liberam o quarto).
-- ---------------------------------------------------------------------
SET @inicio = '2026-12-20';
SET @fim    = '2026-12-27';

SELECT
    q.numero,
    q.tipo,
    q.capacidade,
    q.vista,
    IF(q.possui_banheira, 'sim', 'não')                  AS banheira,
    q.preco_diaria,
    DATEDIFF(@fim, @inicio) * q.preco_diaria            AS valor_periodo
FROM quartos q
WHERE q.status = 'ativo'
  AND NOT EXISTS (
        SELECT 1
          FROM reservas r
         WHERE r.id_quarto = q.id_quarto
           AND r.status NOT IN ('cancelada', 'no_show')
           AND r.data_checkin  < @fim
           AND r.data_checkout > @inicio)
ORDER BY q.preco_diaria, q.numero;

-- ---------------------------------------------------------------------
-- 2. Quais hóspedes mais realizaram reservas?
-- Mostra o total e separa as efetivadas (concluídas/confirmadas) das
-- canceladas/no-show, além do valor gasto em diárias concluídas.
-- ---------------------------------------------------------------------
SELECT
    h.nome                                                           AS hospede,
    h.cidade,
    COUNT(r.id_reserva)                                              AS total_reservas,
    SUM(r.status IN ('concluida', 'confirmada', 'pendente'))         AS efetivadas_ou_futuras,
    SUM(r.status IN ('cancelada', 'no_show'))                        AS canceladas_ou_no_show,
    SUM(CASE WHEN r.status = 'concluida' THEN r.valor_total ELSE 0 END) AS gasto_diarias
FROM hospedes h
JOIN reservas r ON r.id_hospede = h.id_hospede
GROUP BY h.id_hospede, h.nome, h.cidade
ORDER BY total_reservas DESC, gasto_diarias DESC
LIMIT 10;

-- ---------------------------------------------------------------------
-- 3. Qual foi o faturamento por mês?
-- Regime de caixa: soma dos pagamentos APROVADOS pelo mês do pagamento.
-- O UNION ALL acrescenta uma última linha com o total do período.
-- ---------------------------------------------------------------------
SELECT mes, hospedagens_pagas, faturamento
FROM (
    SELECT DATE_FORMAT(data_pagamento, '%Y-%m') AS mes,
           COUNT(DISTINCT id_hospedagem)        AS hospedagens_pagas,
           SUM(valor)                           AS faturamento
      FROM pagamentos
     WHERE status = 'aprovado'
     GROUP BY DATE_FORMAT(data_pagamento, '%Y-%m')
    UNION ALL
    SELECT 'TOTAL', COUNT(DISTINCT id_hospedagem), SUM(valor)
      FROM pagamentos
     WHERE status = 'aprovado'
) AS faturamento_mensal
ORDER BY mes = 'TOTAL', mes;

-- 3b. Mesma pergunta, separando diárias e serviços (por mês do check-out)
SELECT
    DATE_FORMAT(h.checkout_real, '%Y-%m')   AS mes,
    COUNT(*)                                AS hospedagens_encerradas,
    SUM(v.total_diarias)                    AS receita_diarias,
    SUM(v.total_servicos)                   AS receita_servicos,
    SUM(v.total_devido)                     AS receita_total
FROM vw_conta_hospedagem v
JOIN hospedagens h ON h.id_hospedagem = v.id_hospedagem
WHERE h.status = 'encerrada'
GROUP BY DATE_FORMAT(h.checkout_real, '%Y-%m')
ORDER BY mes;

-- ---------------------------------------------------------------------
-- 4. Quais serviços extras são mais consumidos?
-- LEFT JOIN para aparecer também o que nunca foi pedido.
-- ---------------------------------------------------------------------
SELECT
    s.nome                                   AS servico,
    s.categoria,
    COUNT(c.id_consumo)                      AS pedidos,
    COALESCE(SUM(c.quantidade), 0)           AS quantidade_total,
    COALESCE(SUM(c.valor_total), 0)          AS receita
FROM servicos s
LEFT JOIN consumos_servicos c ON c.id_servico = s.id_servico
GROUP BY s.id_servico, s.nome, s.categoria
ORDER BY pedidos DESC, receita DESC;

-- ---------------------------------------------------------------------
-- 5. Quais quartos receberam melhores avaliações?
-- feedback -> hospedagem -> reserva -> quarto
-- ---------------------------------------------------------------------
SELECT
    q.numero,
    q.tipo,
    q.vista,
    COUNT(f.id_feedback)              AS avaliacoes,
    ROUND(AVG(f.nota_geral), 2)       AS media_geral,
    ROUND(AVG(f.nota_limpeza), 2)     AS media_limpeza,
    ROUND(AVG(f.nota_atendimento), 2) AS media_atendimento,
    ROUND(AVG(f.nota_conforto), 2)    AS media_conforto
FROM feedbacks f
JOIN hospedagens h ON h.id_hospedagem = f.id_hospedagem
JOIN reservas r    ON r.id_reserva = h.id_reserva
JOIN quartos q     ON q.id_quarto = r.id_quarto
GROUP BY q.id_quarto, q.numero, q.tipo, q.vista
ORDER BY media_geral DESC, avaliacoes DESC;

-- ---------------------------------------------------------------------
-- 6. Quais reservas foram canceladas?
-- Inclui a antecedência do cancelamento e a receita que deixou de entrar.
-- ---------------------------------------------------------------------
SELECT
    r.codigo,
    h.nome                                         AS hospede,
    q.numero                                       AS quarto,
    r.data_checkin,
    r.data_checkout,
    DATE(r.data_cancelamento)                      AS cancelada_em,
    DATEDIFF(r.data_checkin, r.data_cancelamento)  AS dias_de_antecedencia,
    r.valor_total                                  AS receita_perdida,
    r.motivo_cancelamento
FROM reservas r
JOIN hospedes h ON h.id_hospede = r.id_hospede
JOIN quartos q  ON q.id_quarto = r.id_quarto
WHERE r.status = 'cancelada'
ORDER BY r.data_cancelamento;

-- 6b. Resumo: taxa de cancelamento por canal de venda
SELECT
    r.canal,
    COUNT(*)                                                   AS reservas,
    SUM(r.status = 'cancelada')                                AS canceladas,
    ROUND(100 * SUM(r.status = 'cancelada') / COUNT(*), 1)     AS taxa_cancelamento_pct
FROM reservas r
GROUP BY r.canal
ORDER BY taxa_cancelamento_pct DESC;

-- ---------------------------------------------------------------------
-- 7. Quantas hospedagens cada profissional atendeu?
-- Um profissional "atende" uma hospedagem quando faz o check-in, o
-- check-out ou presta algum serviço nela. O UNION junta os três papéis
-- e o COUNT(DISTINCT) evita contar a mesma hospedagem duas vezes.
-- ---------------------------------------------------------------------
SELECT
    f.nome                                                  AS profissional,
    f.cargo,
    COUNT(DISTINCT a.id_hospedagem)                         AS hospedagens_atendidas,
    COUNT(DISTINCT CASE WHEN a.papel = 'checkin'  THEN a.id_hospedagem END) AS checkins,
    COUNT(DISTINCT CASE WHEN a.papel = 'checkout' THEN a.id_hospedagem END) AS checkouts,
    COUNT(DISTINCT CASE WHEN a.papel = 'servico'  THEN a.id_hospedagem END) AS com_servico
FROM funcionarios f
LEFT JOIN (
    SELECT id_hospedagem, id_funcionario_checkin  AS id_funcionario, 'checkin'  AS papel FROM hospedagens
    UNION ALL
    SELECT id_hospedagem, id_funcionario_checkout, 'checkout' FROM hospedagens WHERE id_funcionario_checkout IS NOT NULL
    UNION ALL
    SELECT id_hospedagem, id_funcionario, 'servico' FROM consumos_servicos WHERE id_funcionario IS NOT NULL
) a ON a.id_funcionario = f.id_funcionario
GROUP BY f.id_funcionario, f.nome, f.cargo
ORDER BY hospedagens_atendidas DESC, f.nome;

-- =====================================================================
-- CONSULTAS EXTRAS
-- =====================================================================

-- 8. Quem está hospedado agora e quanto falta pagar (usa a view)
SELECT v.codigo_reserva, v.hospede, v.quarto, h.checkin_real, r.data_checkout AS checkout_previsto,
       v.total_devido, v.total_pago, v.saldo
FROM vw_conta_hospedagem v
JOIN hospedagens h ON h.id_hospedagem = v.id_hospedagem
JOIN reservas r    ON r.id_reserva = h.id_reserva
WHERE v.status = 'em_andamento';

-- 9. Receita e diária média por tipo de quarto (estadias concluídas)
SELECT
    q.tipo,
    COUNT(*)                               AS estadias,
    SUM(r.num_noites)                      AS noites_vendidas,
    SUM(r.valor_total)                     AS receita_diarias,
    ROUND(SUM(r.valor_total) / SUM(r.num_noites), 2) AS diaria_media
FROM reservas r
JOIN quartos q ON q.id_quarto = r.id_quarto
WHERE r.status = 'concluida'
GROUP BY q.tipo
ORDER BY receita_diarias DESC;

-- 10. Meses com mais reservas (pela data de check-in, sem canceladas)
SELECT
    DATE_FORMAT(r.data_checkin, '%Y-%m') AS mes,
    COUNT(*)                             AS reservas,
    SUM(r.num_noites)                    AS noites
FROM reservas r
WHERE r.status <> 'cancelada'
GROUP BY DATE_FORMAT(r.data_checkin, '%Y-%m')
ORDER BY reservas DESC, mes;
