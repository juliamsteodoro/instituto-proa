-- =====================================================================
-- HOTEL NEBULA — Testes das regras de negócio
-- Cada comando abaixo TENTA violar uma regra e DEVE ser recusado pelo banco.
--
-- Como executar:
--   * Terminal:  mysql -u root -p --force < 04_testes_regras_negocio.sql
--     (--force continua depois de cada erro esperado)
--   * Workbench: execute um comando de cada vez (Ctrl+Enter na linha)
--
-- Nenhum teste altera os dados: os que passariam ficam dentro de uma
-- transação que termina em ROLLBACK.
-- =====================================================================

USE hotel_nebula;

-- RN01 — hóspede sem CPF e sem passaporte
-- Esperado: Check constraint 'chk_hospedes_documento' is violated
INSERT INTO hospedes (nome, email) VALUES ('Sem Documento', 'semdoc@email.com');

-- RN01 — e-mail repetido
-- Esperado: Duplicate entry ... for key 'hospedes.uq_hospedes_email'
INSERT INTO hospedes (nome, email, cpf) VALUES ('Outro Carlos', 'carlos.andrade@email.com', '999.999.999-99');

-- RN02 — quarto 301 já está ocupado de 23/11 a 28/11/2026
-- Esperado: 'Quarto já reservado em parte deste período.'
INSERT INTO reservas (codigo, id_hospede, id_quarto, data_checkin, data_checkout, num_hospedes, valor_diaria, status)
VALUES ('TESTE-01', 2, 9, '2026-11-24', '2026-11-26', 2, 750.00, 'confirmada');

-- RN03 — 5 pessoas num quarto para 2
-- Esperado: 'Número de hóspedes maior que a capacidade do quarto.'
INSERT INTO reservas (codigo, id_hospede, id_quarto, data_checkin, data_checkout, num_hospedes, valor_diaria, status)
VALUES ('TESTE-02', 2, 1, '2026-12-10', '2026-12-12', 5, 280.00, 'confirmada');

-- RN04 — quarto 104 está em manutenção
-- Esperado: 'Quarto indisponível para reserva (manutenção ou inativo).'
INSERT INTO reservas (codigo, id_hospede, id_quarto, data_checkin, data_checkout, num_hospedes, valor_diaria, status)
VALUES ('TESTE-03', 2, 4, '2026-12-10', '2026-12-12', 1, 260.00, 'confirmada');

-- RN05 — check-out antes do check-in
-- Esperado: Check constraint 'chk_reservas_datas' is violated
INSERT INTO reservas (codigo, id_hospede, id_quarto, data_checkin, data_checkout, num_hospedes, valor_diaria)
VALUES ('TESTE-04', 2, 1, '2026-12-12', '2026-12-10', 1, 280.00);

-- RN08 — cancelar sem informar a data de cancelamento
-- Esperado: Check constraint 'chk_reservas_cancelamento' is violated
UPDATE reservas SET status = 'cancelada' WHERE codigo = 'HN-2026-0001';

-- RN09 — check-in de uma reserva cancelada
-- Esperado: 'Check-in permitido apenas para reservas confirmadas.'
INSERT INTO hospedagens (id_reserva, id_funcionario_checkin, checkin_real)
VALUES ((SELECT id_reserva FROM reservas WHERE status = 'cancelada' LIMIT 1), 1, '2026-11-25 14:00:00');

-- RN12 — pix parcelado em 3x
-- Esperado: Check constraint 'chk_pagamentos_parcelado' is violated
INSERT INTO pagamentos (id_hospedagem, valor, metodo, num_parcelas, data_pagamento)
VALUES (1, 100.00, 'pix', 3, '2026-11-25 10:00:00');

-- RN13 — avaliar uma hospedagem que ainda não terminou
-- Esperado: 'Só é possível avaliar hospedagens encerradas.'
INSERT INTO feedbacks (id_hospedagem, nota_geral)
VALUES ((SELECT id_hospedagem FROM hospedagens WHERE status = 'em_andamento' LIMIT 1), 5);

-- RN13 — nota fora da escala de 1 a 5
-- Esperado: Check constraint 'chk_feedbacks_geral' is violated
INSERT INTO feedbacks (id_hospedagem, nota_geral) VALUES (1, 6);

-- ---------------------------------------------------------------------
-- Fluxo válido (deve funcionar): check-out da hospedagem em andamento.
-- O trigger trg_hospedagens_concluir_reserva muda a reserva para
-- 'concluida'. Tudo é desfeito no ROLLBACK.
-- ---------------------------------------------------------------------
START TRANSACTION;

SELECT r.codigo, r.status AS status_reserva_antes
  FROM hospedagens h JOIN reservas r USING (id_reserva)
 WHERE h.status = 'em_andamento';

UPDATE hospedagens
   SET status = 'encerrada', checkout_real = '2026-11-28 11:00:00', id_funcionario_checkout = 2
 WHERE status = 'em_andamento';

SELECT r.codigo, r.status AS status_reserva_depois
  FROM reservas r WHERE r.codigo = 'HN-2026-0064';

ROLLBACK;
