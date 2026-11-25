-- =====================================================================
-- HOTEL NEBULA — Parte 2: Montagem do Núcleo
-- Script 01: criação do banco, tabelas, chaves, restrições, triggers e view
-- SGBD: MySQL 8.0+ (testado no MySQL 8.0.46 e no MariaDB 10.11)
-- =====================================================================

DROP DATABASE IF EXISTS hotel_nebula;
CREATE DATABASE hotel_nebula
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE hotel_nebula;

-- ---------------------------------------------------------------------
-- 1. HÓSPEDES
-- Regra: todo hóspede precisa de um documento (CPF ou passaporte).
-- ---------------------------------------------------------------------
CREATE TABLE hospedes (
    id_hospede        INT           NOT NULL AUTO_INCREMENT,
    nome              VARCHAR(100)  NOT NULL,
    email             VARCHAR(100)  NOT NULL,
    cpf               VARCHAR(14)   NULL,
    passaporte        VARCHAR(20)   NULL,
    telefone          VARCHAR(20)   NULL,
    data_nascimento   DATE          NULL,
    nacionalidade     VARCHAR(50)   NOT NULL DEFAULT 'Brasileira',
    cidade            VARCHAR(80)   NULL,
    estado            VARCHAR(50)   NULL,
    pais              VARCHAR(50)   NOT NULL DEFAULT 'Brasil',
    data_cadastro     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ativo             BOOLEAN       NOT NULL DEFAULT TRUE,
    CONSTRAINT pk_hospedes            PRIMARY KEY (id_hospede),
    CONSTRAINT uq_hospedes_email      UNIQUE (email),
    CONSTRAINT uq_hospedes_cpf        UNIQUE (cpf),
    CONSTRAINT uq_hospedes_passaporte UNIQUE (passaporte),
    CONSTRAINT chk_hospedes_documento CHECK (cpf IS NOT NULL OR passaporte IS NOT NULL)
);

-- ---------------------------------------------------------------------
-- 2. QUARTOS
-- O status indica se o quarto pode ser reservado (ativo / manutenção /
-- inativo). Se ele está ocupado numa data é calculado pelas reservas.
-- ---------------------------------------------------------------------
CREATE TABLE quartos (
    id_quarto        INT            NOT NULL AUTO_INCREMENT,
    numero           VARCHAR(10)    NOT NULL,
    andar            TINYINT        NOT NULL,
    tipo             VARCHAR(20)    NOT NULL,
    capacidade       TINYINT        NOT NULL,
    preco_diaria     DECIMAL(10,2)  NOT NULL,
    vista            VARCHAR(20)    NOT NULL DEFAULT 'cidade',
    possui_banheira  BOOLEAN        NOT NULL DEFAULT FALSE,
    area_m2          DECIMAL(5,1)   NULL,
    descricao        VARCHAR(255)   NULL,
    status           VARCHAR(20)    NOT NULL DEFAULT 'ativo',
    CONSTRAINT pk_quartos             PRIMARY KEY (id_quarto),
    CONSTRAINT uq_quartos_numero      UNIQUE (numero),
    CONSTRAINT chk_quartos_tipo       CHECK (tipo IN ('standard', 'luxo', 'suite', 'presidencial')),
    CONSTRAINT chk_quartos_capacidade CHECK (capacidade BETWEEN 1 AND 8),
    CONSTRAINT chk_quartos_preco      CHECK (preco_diaria > 0),
    CONSTRAINT chk_quartos_vista      CHECK (vista IN ('mar', 'cidade', 'jardim', 'montanha')),
    CONSTRAINT chk_quartos_status     CHECK (status IN ('ativo', 'manutencao', 'inativo'))
);

-- ---------------------------------------------------------------------
-- 3. FUNCIONÁRIOS (profissionais)
-- ---------------------------------------------------------------------
CREATE TABLE funcionarios (
    id_funcionario  INT            NOT NULL AUTO_INCREMENT,
    nome            VARCHAR(100)   NOT NULL,
    cpf             VARCHAR(14)    NOT NULL,
    email           VARCHAR(100)   NOT NULL,
    telefone        VARCHAR(20)    NULL,
    cargo           VARCHAR(50)    NOT NULL,
    departamento    VARCHAR(30)    NOT NULL,
    data_admissao   DATE           NOT NULL,
    salario         DECIMAL(10,2)  NOT NULL,
    ativo           BOOLEAN        NOT NULL DEFAULT TRUE,
    CONSTRAINT pk_funcionarios         PRIMARY KEY (id_funcionario),
    CONSTRAINT uq_funcionarios_cpf     UNIQUE (cpf),
    CONSTRAINT uq_funcionarios_email   UNIQUE (email),
    CONSTRAINT chk_funcionarios_depto  CHECK (departamento IN
        ('recepcao', 'governanca', 'alimentos_bebidas', 'bem_estar', 'manutencao', 'gerencia')),
    CONSTRAINT chk_funcionarios_salario CHECK (salario > 0)
);

-- ---------------------------------------------------------------------
-- 4. RESERVAS
-- valor_diaria guarda o preço combinado na hora da reserva (o preço do
-- quarto pode mudar depois). num_noites e valor_total são calculados.
-- id_funcionario = quem registrou (NULL quando veio pelo site/app).
-- ---------------------------------------------------------------------
CREATE TABLE reservas (
    id_reserva           INT            NOT NULL AUTO_INCREMENT,
    codigo               VARCHAR(20)    NOT NULL,
    id_hospede           INT            NOT NULL,
    id_quarto            INT            NOT NULL,
    id_funcionario       INT            NULL,
    data_checkin         DATE           NOT NULL,
    data_checkout        DATE           NOT NULL,
    num_hospedes         TINYINT        NOT NULL DEFAULT 1,
    valor_diaria         DECIMAL(10,2)  NOT NULL,
    num_noites           INT            AS (DATEDIFF(data_checkout, data_checkin)) STORED,
    valor_total          DECIMAL(10,2)  AS (DATEDIFF(data_checkout, data_checkin) * valor_diaria) STORED,
    canal                VARCHAR(20)    NOT NULL DEFAULT 'site',
    status               VARCHAR(20)    NOT NULL DEFAULT 'pendente',
    data_criacao         DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_cancelamento    DATETIME       NULL,
    motivo_cancelamento  VARCHAR(255)   NULL,
    observacoes          VARCHAR(255)   NULL,
    CONSTRAINT pk_reservas              PRIMARY KEY (id_reserva),
    CONSTRAINT uq_reservas_codigo       UNIQUE (codigo),
    CONSTRAINT fk_reservas_hospede      FOREIGN KEY (id_hospede)     REFERENCES hospedes (id_hospede),
    CONSTRAINT fk_reservas_quarto       FOREIGN KEY (id_quarto)      REFERENCES quartos (id_quarto),
    CONSTRAINT fk_reservas_funcionario  FOREIGN KEY (id_funcionario) REFERENCES funcionarios (id_funcionario),
    CONSTRAINT chk_reservas_datas       CHECK (data_checkout > data_checkin),
    CONSTRAINT chk_reservas_hospedes    CHECK (num_hospedes >= 1),
    CONSTRAINT chk_reservas_valor       CHECK (valor_diaria > 0),
    CONSTRAINT chk_reservas_canal       CHECK (canal IN ('site', 'app', 'telefone', 'balcao', 'agencia')),
    CONSTRAINT chk_reservas_status      CHECK (status IN ('pendente', 'confirmada', 'cancelada', 'concluida', 'no_show')),
    CONSTRAINT chk_reservas_cancelamento CHECK (status <> 'cancelada' OR data_cancelamento IS NOT NULL)
);

-- Acelera a busca de disponibilidade (quarto + período)
CREATE INDEX idx_reservas_quarto_periodo ON reservas (id_quarto, data_checkin, data_checkout);

-- ---------------------------------------------------------------------
-- 5. HOSPEDAGENS — a estadia de fato (check-in realizado)
-- Relação 1:1 com reservas (UNIQUE em id_reserva). Guarda quem fez o
-- check-in e o check-out.
-- ---------------------------------------------------------------------
CREATE TABLE hospedagens (
    id_hospedagem            INT           NOT NULL AUTO_INCREMENT,
    id_reserva               INT           NOT NULL,
    id_funcionario_checkin   INT           NOT NULL,
    id_funcionario_checkout  INT           NULL,
    checkin_real             DATETIME      NOT NULL,
    checkout_real            DATETIME      NULL,
    status                   VARCHAR(20)   NOT NULL DEFAULT 'em_andamento',
    observacoes              VARCHAR(255)  NULL,
    CONSTRAINT pk_hospedagens               PRIMARY KEY (id_hospedagem),
    CONSTRAINT uq_hospedagens_reserva       UNIQUE (id_reserva),
    CONSTRAINT fk_hospedagens_reserva       FOREIGN KEY (id_reserva)              REFERENCES reservas (id_reserva),
    CONSTRAINT fk_hospedagens_func_checkin  FOREIGN KEY (id_funcionario_checkin)  REFERENCES funcionarios (id_funcionario),
    CONSTRAINT fk_hospedagens_func_checkout FOREIGN KEY (id_funcionario_checkout) REFERENCES funcionarios (id_funcionario),
    CONSTRAINT chk_hospedagens_status       CHECK (status IN ('em_andamento', 'encerrada')),
    CONSTRAINT chk_hospedagens_datas        CHECK (checkout_real IS NULL OR checkout_real > checkin_real),
    CONSTRAINT chk_hospedagens_encerrada    CHECK (status = 'em_andamento'
        OR (checkout_real IS NOT NULL AND id_funcionario_checkout IS NOT NULL))
);

-- ---------------------------------------------------------------------
-- 6. SERVIÇOS — catálogo de serviços extras
-- ---------------------------------------------------------------------
CREATE TABLE servicos (
    id_servico  INT            NOT NULL AUTO_INCREMENT,
    nome        VARCHAR(80)    NOT NULL,
    categoria   VARCHAR(30)    NOT NULL,
    descricao   VARCHAR(255)   NULL,
    preco       DECIMAL(10,2)  NOT NULL,
    unidade     VARCHAR(20)    NOT NULL DEFAULT 'unidade',
    ativo       BOOLEAN        NOT NULL DEFAULT TRUE,
    CONSTRAINT pk_servicos           PRIMARY KEY (id_servico),
    CONSTRAINT uq_servicos_nome      UNIQUE (nome),
    CONSTRAINT chk_servicos_categoria CHECK (categoria IN
        ('alimentacao', 'lavanderia', 'bem_estar', 'transporte', 'lazer', 'outros')),
    CONSTRAINT chk_servicos_preco    CHECK (preco >= 0)
);

-- ---------------------------------------------------------------------
-- 7. CONSUMOS_SERVICOS — tabela associativa N:N hospedagens x servicos
-- preco_unitario guarda o preço cobrado no dia (histórico).
-- ---------------------------------------------------------------------
CREATE TABLE consumos_servicos (
    id_consumo      INT            NOT NULL AUTO_INCREMENT,
    id_hospedagem   INT            NOT NULL,
    id_servico      INT            NOT NULL,
    id_funcionario  INT            NULL,
    quantidade      SMALLINT       NOT NULL DEFAULT 1,
    preco_unitario  DECIMAL(10,2)  NOT NULL,
    valor_total     DECIMAL(10,2)  AS (quantidade * preco_unitario) STORED,
    data_consumo    DATETIME       NOT NULL,
    CONSTRAINT pk_consumos             PRIMARY KEY (id_consumo),
    CONSTRAINT fk_consumos_hospedagem  FOREIGN KEY (id_hospedagem)  REFERENCES hospedagens (id_hospedagem) ON DELETE CASCADE,
    CONSTRAINT fk_consumos_servico     FOREIGN KEY (id_servico)     REFERENCES servicos (id_servico),
    CONSTRAINT fk_consumos_funcionario FOREIGN KEY (id_funcionario) REFERENCES funcionarios (id_funcionario),
    CONSTRAINT chk_consumos_quantidade CHECK (quantidade > 0),
    CONSTRAINT chk_consumos_preco      CHECK (preco_unitario >= 0)
);

-- ---------------------------------------------------------------------
-- 8. PAGAMENTOS — uma hospedagem pode ter vários (ex.: cartão + pix)
-- ---------------------------------------------------------------------
CREATE TABLE pagamentos (
    id_pagamento      INT            NOT NULL AUTO_INCREMENT,
    id_hospedagem     INT            NOT NULL,
    valor             DECIMAL(10,2)  NOT NULL,
    metodo            VARCHAR(20)    NOT NULL,
    num_parcelas      TINYINT        NOT NULL DEFAULT 1,
    status            VARCHAR(20)    NOT NULL DEFAULT 'aprovado',
    data_pagamento    DATETIME       NOT NULL,
    codigo_transacao  VARCHAR(40)    NULL,
    CONSTRAINT pk_pagamentos            PRIMARY KEY (id_pagamento),
    CONSTRAINT uq_pagamentos_transacao  UNIQUE (codigo_transacao),
    CONSTRAINT fk_pagamentos_hospedagem FOREIGN KEY (id_hospedagem) REFERENCES hospedagens (id_hospedagem),
    CONSTRAINT chk_pagamentos_valor     CHECK (valor > 0),
    CONSTRAINT chk_pagamentos_metodo    CHECK (metodo IN ('pix', 'cartao_credito', 'cartao_debito', 'dinheiro', 'transferencia')),
    CONSTRAINT chk_pagamentos_parcelas  CHECK (num_parcelas BETWEEN 1 AND 12),
    CONSTRAINT chk_pagamentos_parcelado CHECK (metodo = 'cartao_credito' OR num_parcelas = 1),
    CONSTRAINT chk_pagamentos_status    CHECK (status IN ('pendente', 'aprovado', 'recusado', 'estornado'))
);

-- ---------------------------------------------------------------------
-- 9. FEEDBACKS — uma avaliação por hospedagem (UNIQUE).
-- O hóspede e o quarto são obtidos pela hospedagem -> reserva, sem
-- duplicar dados (3ª forma normal).
-- ---------------------------------------------------------------------
CREATE TABLE feedbacks (
    id_feedback              INT       NOT NULL AUTO_INCREMENT,
    id_hospedagem            INT       NOT NULL,
    nota_geral               TINYINT   NOT NULL,
    nota_limpeza             TINYINT   NULL,
    nota_atendimento         TINYINT   NULL,
    nota_conforto            TINYINT   NULL,
    comentario               TEXT      NULL,
    data_avaliacao           DATETIME  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resposta_hotel           TEXT      NULL,
    id_funcionario_resposta  INT       NULL,
    CONSTRAINT pk_feedbacks              PRIMARY KEY (id_feedback),
    CONSTRAINT uq_feedbacks_hospedagem   UNIQUE (id_hospedagem),
    CONSTRAINT fk_feedbacks_hospedagem   FOREIGN KEY (id_hospedagem)           REFERENCES hospedagens (id_hospedagem) ON DELETE CASCADE,
    CONSTRAINT fk_feedbacks_funcionario  FOREIGN KEY (id_funcionario_resposta) REFERENCES funcionarios (id_funcionario),
    CONSTRAINT chk_feedbacks_geral       CHECK (nota_geral BETWEEN 1 AND 5),
    CONSTRAINT chk_feedbacks_limpeza     CHECK (nota_limpeza IS NULL OR nota_limpeza BETWEEN 1 AND 5),
    CONSTRAINT chk_feedbacks_atendimento CHECK (nota_atendimento IS NULL OR nota_atendimento BETWEEN 1 AND 5),
    CONSTRAINT chk_feedbacks_conforto    CHECK (nota_conforto IS NULL OR nota_conforto BETWEEN 1 AND 5),
    CONSTRAINT chk_feedbacks_resposta    CHECK (resposta_hotel IS NULL OR id_funcionario_resposta IS NOT NULL)
);

-- =====================================================================
-- TRIGGERS — regras de negócio que envolvem mais de uma tabela
-- (um CHECK só enxerga a própria linha)
-- =====================================================================
DELIMITER $$

-- RN: não pode haver duas reservas ativas do mesmo quarto no mesmo período;
--     o número de hóspedes não pode passar da capacidade do quarto;
--     só se reserva quarto com status 'ativo'.
CREATE TRIGGER trg_reservas_validar_insert
BEFORE INSERT ON reservas
FOR EACH ROW
BEGIN
    DECLARE v_capacidade INT;
    DECLARE v_status_quarto VARCHAR(20);

    SELECT capacidade, status INTO v_capacidade, v_status_quarto
      FROM quartos WHERE id_quarto = NEW.id_quarto;

    IF NEW.status NOT IN ('cancelada', 'no_show') THEN
        IF v_status_quarto <> 'ativo' THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Quarto indisponível para reserva (manutenção ou inativo).';
        END IF;
        IF EXISTS (SELECT 1 FROM reservas r
                    WHERE r.id_quarto = NEW.id_quarto
                      AND r.status NOT IN ('cancelada', 'no_show')
                      AND r.data_checkin  < NEW.data_checkout
                      AND r.data_checkout > NEW.data_checkin) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Quarto já reservado em parte deste período.';
        END IF;
    END IF;

    IF NEW.num_hospedes > v_capacidade THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Número de hóspedes maior que a capacidade do quarto.';
    END IF;
END$$

CREATE TRIGGER trg_reservas_validar_update
BEFORE UPDATE ON reservas
FOR EACH ROW
BEGIN
    DECLARE v_capacidade INT;
    SELECT capacidade INTO v_capacidade FROM quartos WHERE id_quarto = NEW.id_quarto;

    IF NEW.status NOT IN ('cancelada', 'no_show') AND EXISTS (
        SELECT 1 FROM reservas r
         WHERE r.id_quarto = NEW.id_quarto
           AND r.id_reserva <> NEW.id_reserva
           AND r.status NOT IN ('cancelada', 'no_show')
           AND r.data_checkin  < NEW.data_checkout
           AND r.data_checkout > NEW.data_checkin) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Quarto já reservado em parte deste período.';
    END IF;

    IF NEW.num_hospedes > v_capacidade THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Número de hóspedes maior que a capacidade do quarto.';
    END IF;
END$$

-- RN: só existe hospedagem (check-in) para reserva confirmada ou concluída.
CREATE TRIGGER trg_hospedagens_validar_insert
BEFORE INSERT ON hospedagens
FOR EACH ROW
BEGIN
    IF (SELECT status FROM reservas WHERE id_reserva = NEW.id_reserva) NOT IN ('confirmada', 'concluida') THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Check-in permitido apenas para reservas confirmadas.';
    END IF;
END$$

-- RN: ao encerrar a hospedagem (check-out), a reserva passa a 'concluida'.
CREATE TRIGGER trg_hospedagens_concluir_reserva
AFTER UPDATE ON hospedagens
FOR EACH ROW
BEGIN
    IF NEW.status = 'encerrada' AND OLD.status <> 'encerrada' THEN
        UPDATE reservas SET status = 'concluida' WHERE id_reserva = NEW.id_reserva;
    END IF;
END$$

-- RN: só é possível avaliar uma hospedagem encerrada.
CREATE TRIGGER trg_feedbacks_validar_insert
BEFORE INSERT ON feedbacks
FOR EACH ROW
BEGIN
    IF (SELECT status FROM hospedagens WHERE id_hospedagem = NEW.id_hospedagem) <> 'encerrada' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Só é possível avaliar hospedagens encerradas.';
    END IF;
END$$

DELIMITER ;

-- =====================================================================
-- VIEW — conta de cada hospedagem (diárias + serviços x pagamentos)
-- =====================================================================
CREATE VIEW vw_conta_hospedagem AS
SELECT
    h.id_hospedagem,
    r.codigo                                   AS codigo_reserva,
    hs.nome                                    AS hospede,
    q.numero                                   AS quarto,
    h.status,
    r.valor_total                              AS total_diarias,
    COALESCE(c.total_servicos, 0)              AS total_servicos,
    r.valor_total + COALESCE(c.total_servicos, 0) AS total_devido,
    COALESCE(p.total_pago, 0)                  AS total_pago,
    r.valor_total + COALESCE(c.total_servicos, 0) - COALESCE(p.total_pago, 0) AS saldo
FROM hospedagens h
JOIN reservas r  ON r.id_reserva = h.id_reserva
JOIN hospedes hs ON hs.id_hospede = r.id_hospede
JOIN quartos q   ON q.id_quarto = r.id_quarto
LEFT JOIN (SELECT id_hospedagem, SUM(valor_total) AS total_servicos
             FROM consumos_servicos GROUP BY id_hospedagem) c ON c.id_hospedagem = h.id_hospedagem
LEFT JOIN (SELECT id_hospedagem, SUM(valor) AS total_pago
             FROM pagamentos WHERE status = 'aprovado' GROUP BY id_hospedagem) p ON p.id_hospedagem = h.id_hospedagem;
