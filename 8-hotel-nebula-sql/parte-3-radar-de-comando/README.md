# Parte 3: Radar de Comando

Consultas SQL para a gestão do Hotel Nebula. O script completo está em [`03_consultas.sql`](03_consultas.sql).

**Como executar:** rode `01_criacao_banco.sql` e `02_insercao_dados.sql` (Parte 2) e depois `03_consultas.sql`. A consulta de disponibilidade usa as variáveis `@inicio` e `@fim`; troque as datas para consultar outro período.

Os resultados abaixo saíram de uma execução real sobre os dados de teste, com "hoje" = 25/11/2026. A saída completa do terminal está em [`../evidencias/03_resultados_das_consultas.txt`](../evidencias/03_resultados_das_consultas.txt).

| # | Pergunta da gestão | Técnicas usadas |
|---|---|---|
| 1 | Quartos disponíveis num período | variáveis, `NOT EXISTS`, teste de sobreposição de datas |
| 2 | Hóspedes que mais reservam | `JOIN`, `GROUP BY`, soma condicional |
| 3 | Faturamento por mês | `DATE_FORMAT`, `GROUP BY ... WITH ROLLUP`, view |
| 4 | Serviços mais consumidos | `LEFT JOIN` (inclui os nunca pedidos) |
| 5 | Quartos mais bem avaliados | `JOIN` em cadeia, `AVG` |
| 6 | Reservas canceladas | filtro de status, `DATEDIFF`, taxa por canal |
| 7 | Hospedagens por profissional | `UNION ALL`, `COUNT(DISTINCT)`, `LEFT JOIN` |
| 8–10 | Extras: quem está hospedado agora, receita por tipo de quarto, meses com mais reservas | view, agregações |

---

### 1. Quais quartos estão disponíveis em determinado período?

Basta trocar as datas abaixo. O período vale de @inicio (check-in) até @fim (check-out). Um quarto está livre quando está ativo e não tem reserva ativa que se sobreponha ao período (canceladas e no-show liberam o quarto).

```sql
SET @inicio = '2026-12-20';
SET @fim = '2026-12-27';

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
```

**Resultado:**

| numero | tipo | capacidade | vista | banheira | preco_diaria | valor_periodo |
|---|---|---|---|---|---|---|
| 101 | standard | 2 | jardim | não | 280.00 | 1960.00 |
| 102 | standard | 2 | cidade | não | 280.00 | 1960.00 |
| 103 | standard | 3 | jardim | não | 320.00 | 2240.00 |
| 203 | luxo | 2 | cidade | não | 450.00 | 3150.00 |
| 204 | luxo | 2 | jardim | sim | 460.00 | 3220.00 |
| 303 | suite | 3 | cidade | não | 690.00 | 4830.00 |
| 302 | suite | 4 | montanha | sim | 720.00 | 5040.00 |
| 301 | suite | 4 | mar | sim | 750.00 | 5250.00 |
| 401 | presidencial | 6 | mar | sim | 1800.00 | 12600.00 |

> Para 20 a 27/12/2026 há 9 quartos livres. Ficam de fora o 104 (em manutenção), o 202 (reserva confirmada de 16 a 23/12) e o 201 (reserva pendente a partir de 26/12). Reservas pendentes também bloqueiam o quarto, para evitar vender o mesmo quarto duas vezes.

### 2. Quais hóspedes mais realizaram reservas?

Mostra o total e separa as efetivadas (concluídas/confirmadas) das canceladas/no-show, além do valor gasto em diárias concluídas.

```sql
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
```

**Resultado:**

| hospede | cidade | total_reservas | efetivadas_ou_futuras | canceladas_ou_no_show | gasto_diarias |
|---|---|---|---|---|---|
| Carlos Andrade | São Paulo | 11 | 11 | 0 | 11650.00 |
| Mariana Costa | Rio de Janeiro | 8 | 7 | 1 | 21420.00 |
| Juliana Pereira | Florianópolis | 7 | 6 | 1 | 9450.00 |
| Ricardo Gomes | Campinas | 6 | 6 | 0 | 17250.00 |
| Gustavo Ferreira | Brasília | 6 | 4 | 2 | 6490.00 |
| Beatriz Santos | Salvador | 5 | 5 | 0 | 9140.00 |
| Fernanda Rocha | Curitiba | 4 | 4 | 0 | 7090.00 |
| Pedro Henrique Lima | Belo Horizonte | 4 | 4 | 0 | 4510.00 |
| Eduardo Nunes | Goiânia | 4 | 4 | 0 | 2640.00 |
| Lucas Oliveira | Porto Alegre | 3 | 3 | 0 | 3680.00 |

> Carlos Andrade é quem mais reserva (11 reservas), mas Mariana Costa é quem mais gastou em diárias (R$ 21.420), porque prefere quartos melhores.

### 3. Qual foi o faturamento por mês?

Regime de caixa: soma dos pagamentos APROVADOS pelo mês do pagamento. O UNION ALL acrescenta uma última linha com o total do período.

```sql
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
```

**Resultado:**

| mes | hospedagens_pagas | faturamento |
|---|---|---|
| 2026-01 | 3 | 3560.00 |
| 2026-02 | 2 | 1640.00 |
| 2026-03 | 4 | 6760.00 |
| 2026-04 | 7 | 8635.00 |
| 2026-05 | 4 | 6400.00 |
| 2026-06 | 7 | 17445.00 |
| 2026-07 | 10 | 27595.00 |
| 2026-08 | 1 | 1740.00 |
| 2026-09 | 6 | 6345.00 |
| 2026-10 | 7 | 12040.00 |
| 2026-11 | 4 | 17395.00 |
| TOTAL | 55 | 109555.00 |

> Julho, mês de férias, teve o maior faturamento (R$ 27.595). O total recebido em 2026 até 25/11 é R$ 109.555.

### 3b. Mesma pergunta, separando diárias e serviços (por mês do check-out)

```sql
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
```

**Resultado:**

| mes | hospedagens_encerradas | receita_diarias | receita_servicos | receita_total |
|---|---|---|---|---|
| 2026-01 | 3 | 3000.00 | 560.00 | 3560.00 |
| 2026-02 | 2 | 1520.00 | 120.00 | 1640.00 |
| 2026-03 | 4 | 6230.00 | 530.00 | 6760.00 |
| 2026-04 | 7 | 7530.00 | 1105.00 | 8635.00 |
| 2026-05 | 4 | 5840.00 | 560.00 | 6400.00 |
| 2026-06 | 7 | 15890.00 | 1555.00 | 17445.00 |
| 2026-07 | 10 | 25530.00 | 2065.00 | 27595.00 |
| 2026-08 | 1 | 1120.00 | 620.00 | 1740.00 |
| 2026-09 | 6 | 5820.00 | 525.00 | 6345.00 |
| 2026-10 | 7 | 9360.00 | 2680.00 | 12040.00 |
| 2026-11 | 3 | 15550.00 | 1095.00 | 16645.00 |

> Em novembro, o faturamento de caixa (consulta 3) é R$ 750 maior que este. É a diária de garantia paga pela hospedagem que ainda está em andamento.

### 4. Quais serviços extras são mais consumidos?

LEFT JOIN para aparecer também o que nunca foi pedido.

```sql
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
```

**Resultado:**

| servico | categoria | pedidos | quantidade_total | receita |
|---|---|---|---|---|
| Café da manhã | alimentacao | 33 | 70 | 3150.00 |
| Minibar | alimentacao | 20 | 42 | 1050.00 |
| Estacionamento | outros | 13 | 32 | 1280.00 |
| Lavanderia | lavanderia | 11 | 11 | 880.00 |
| Transfer aeroporto | transporte | 10 | 10 | 1500.00 |
| Room service | alimentacao | 10 | 10 | 850.00 |
| Late checkout | outros | 6 | 6 | 720.00 |
| Massagem relaxante | bem_estar | 4 | 4 | 720.00 |
| Jantar no restaurante | alimentacao | 4 | 5 | 700.00 |
| Passeio de barco | lazer | 2 | 3 | 660.00 |
| Day spa | bem_estar | 1 | 1 | 350.00 |

> O café da manhã é o serviço mais pedido e o que mais fatura. O day spa só foi vendido uma vez e pode precisar de divulgação.

### 5. Quais quartos receberam melhores avaliações?

feedback -> hospedagem -> reserva -> quarto

```sql
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
```

**Resultado:**

| numero | tipo | vista | avaliacoes | media_geral | media_limpeza | media_atendimento | media_conforto |
|---|---|---|---|---|---|---|---|
| 204 | luxo | jardim | 3 | 4.33 | 4.00 | 4.00 | 3.67 |
| 301 | suite | mar | 5 | 4.00 | 3.40 | 3.60 | 4.40 |
| 303 | suite | cidade | 3 | 4.00 | 4.00 | 4.33 | 4.00 |
| 401 | presidencial | mar | 2 | 4.00 | 4.00 | 4.00 | 4.00 |
| 302 | suite | montanha | 1 | 4.00 | 4.00 | 4.00 | 5.00 |
| 101 | standard | jardim | 3 | 3.67 | 3.67 | 4.33 | 3.67 |
| 202 | luxo | mar | 4 | 3.50 | 3.25 | 3.75 | 3.25 |
| 201 | luxo | mar | 4 | 3.50 | 3.75 | 3.25 | 3.25 |
| 103 | standard | jardim | 7 | 3.14 | 3.14 | 2.71 | 2.57 |
| 203 | luxo | cidade | 1 | 3.00 | 2.00 | 3.00 | 2.00 |
| 104 | standard | cidade | 4 | 2.75 | 2.75 | 2.50 | 3.00 |
| 102 | standard | cidade | 5 | 2.60 | 2.40 | 3.20 | 3.00 |

> O 204 (luxo, vista para o jardim) tem a melhor média. Os standard 102 e 104 têm as piores notas, e o 104 já está em reforma.

### 6. Quais reservas foram canceladas?

Inclui a antecedência do cancelamento e a receita que deixou de entrar.

```sql
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
```

**Resultado:**

| codigo | hospede | quarto | data_checkin | data_checkout | cancelada_em | dias_de_antecedencia | receita_perdida | motivo_cancelamento |
|---|---|---|---|---|---|---|---|---|
| HN-2026-0003 | Aline Barbosa | 203 | 2026-01-17 | 2026-01-24 | 2025-12-12 | 36 | 3150.00 | Encontrou outra opção de hospedagem. |
| HN-2026-0002 | Gustavo Ferreira | 302 | 2026-01-04 | 2026-01-07 | 2026-01-01 | 3 | 2160.00 | Compromisso de trabalho imprevisto. |
| HN-2026-0010 | Gustavo Ferreira | 101 | 2026-03-05 | 2026-03-07 | 2026-03-03 | 2 | 560.00 | Compromisso de trabalho imprevisto. |
| HN-2026-0022 | Juliana Pereira | 101 | 2026-05-04 | 2026-05-07 | 2026-05-01 | 3 | 840.00 | Voo cancelado. |
| HN-2026-0030 | Rafaela Mendes | 102 | 2026-06-09 | 2026-06-16 | 2026-05-18 | 22 | 1960.00 | Compromisso de trabalho imprevisto. |
| HN-2026-0037 | Thiago Almeida | 202 | 2026-07-10 | 2026-07-11 | 2026-07-05 | 5 | 480.00 | Problema de saúde na família. |

> Foram 6 cancelamentos, R$ 9.150 em diárias que não entraram. 4 deles aconteceram com uma semana ou menos de antecedência, o que pode justificar uma política de multa.

### 6b. Resumo: taxa de cancelamento por canal de venda

```sql
SELECT
    r.canal,
    COUNT(*)                                                   AS reservas,
    SUM(r.status = 'cancelada')                                AS canceladas,
    ROUND(100 * SUM(r.status = 'cancelada') / COUNT(*), 1)     AS taxa_cancelamento_pct
FROM reservas r
GROUP BY r.canal
ORDER BY taxa_cancelamento_pct DESC;
```

**Resultado:**

| canal | reservas | canceladas | taxa_cancelamento_pct |
|---|---|---|---|
| balcao | 8 | 1 | 12.5 |
| telefone | 11 | 1 | 9.1 |
| app | 11 | 1 | 9.1 |
| site | 25 | 2 | 8.0 |
| agencia | 15 | 1 | 6.7 |

> O balcão tem a maior taxa de cancelamento, mas com poucas reservas a diferença entre canais ainda não é conclusiva.

### 7. Quantas hospedagens cada profissional atendeu?

Um profissional "atende" uma hospedagem quando faz o check-in, o check-out ou presta algum serviço nela. O UNION junta os três papéis e o COUNT(DISTINCT) evita contar a mesma hospedagem duas vezes.

```sql
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
```

**Resultado:**

| profissional | cargo | hospedagens_atendidas | checkins | checkouts | com_servico |
|---|---|---|---|---|---|
| Juliana Martins | Recepcionista | 37 | 24 | 18 | 8 |
| Rafael Souza | Recepcionista | 36 | 17 | 21 | 4 |
| Patrícia Lopes | Recepcionista (noturno) | 31 | 14 | 15 | 7 |
| Camila Duarte | Garçonete | 23 | 0 | 0 | 23 |
| Thiago Moreira | Chef de Cozinha | 23 | 0 | 0 | 23 |
| Bruno Teixeira | Concierge e Motorista | 11 | 0 | 0 | 11 |
| Diego Carvalho | Camareiro | 6 | 0 | 0 | 6 |
| Ana Paula Ribeiro | Governanta | 5 | 0 | 0 | 5 |
| Larissa Prado | Massoterapeuta | 5 | 0 | 0 | 5 |
| Marcos Vieira | Gerente de Operações | 0 | 0 | 0 | 0 |

> As três recepcionistas atendem mais hospedagens porque fazem todos os check-ins e check-outs. O gerente aparece com 0 porque só responde avaliações: o LEFT JOIN mostra também quem não atendeu nenhuma hospedagem.

### 8. Quem está hospedado agora e quanto falta pagar (usa a view)

```sql
SELECT v.codigo_reserva, v.hospede, v.quarto, h.checkin_real, r.data_checkout AS checkout_previsto,
       v.total_devido, v.total_pago, v.saldo
FROM vw_conta_hospedagem v
JOIN hospedagens h ON h.id_hospedagem = v.id_hospedagem
JOIN reservas r    ON r.id_reserva = h.id_reserva
WHERE v.status = 'em_andamento';
```

**Resultado:**

| codigo_reserva | hospede | quarto | checkin_real | checkout_previsto | total_devido | total_pago | saldo |
|---|---|---|---|---|---|---|---|
| HN-2026-0064 | Carlos Andrade | 301 | 2026-11-23 17:21:00 | 2026-11-28 | 4195.00 | 750.00 | 3445.00 |

> Hóspede que está no hotel agora, com o saldo que falta pagar no check-out.

### 9. Receita e diária média por tipo de quarto (estadias concluídas)

```sql
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
```

**Resultado:**

| tipo | estadias | noites_vendidas | receita_diarias | diaria_media |
|---|---|---|---|---|
| presidencial | 2 | 14 | 25200.00 | 1800.00 |
| suite | 10 | 34 | 24990.00 | 735.00 |
| luxo | 19 | 54 | 24760.00 | 458.52 |
| standard | 23 | 78 | 22440.00 | 287.69 |

> A suíte presidencial, com só 2 estadias, rende quase o mesmo que os 23 quartos standard juntos.

### 10. Meses com mais reservas (pela data de check-in, sem canceladas)

```sql
SELECT
    DATE_FORMAT(r.data_checkin, '%Y-%m') AS mes,
    COUNT(*)                             AS reservas,
    SUM(r.num_noites)                    AS noites
FROM reservas r
WHERE r.status <> 'cancelada'
GROUP BY DATE_FORMAT(r.data_checkin, '%Y-%m')
ORDER BY reservas DESC, mes;
```

**Resultado:**

| mes | reservas | noites |
|---|---|---|
| 2026-07 | 11 | 39 |
| 2026-04 | 8 | 25 |
| 2026-10 | 8 | 25 |
| 2026-06 | 7 | 32 |
| 2026-09 | 6 | 15 |
| 2026-12 | 5 | 21 |
| 2026-03 | 4 | 17 |
| 2026-05 | 4 | 10 |
| 2026-11 | 4 | 15 |
| 2026-01 | 3 | 10 |
| 2026-02 | 3 | 7 |
| 2026-08 | 1 | 4 |

> Julho é o mês com mais reservas, seguido de abril e outubro.

