# Parte 2: Montagem do Núcleo

Implementação física do banco `hotel_nebula` em **MySQL 8**. Os scripts foram testados no MySQL 8.0.46, com o modo estrito padrão, e no MariaDB 10.11.

## Scripts

| Ordem | Arquivo | O que faz |
|---|---|---|
| 1 | [`01_criacao_banco.sql`](01_criacao_banco.sql) | Cria o banco, as 9 tabelas, PKs, FKs, `UNIQUE`, `CHECK`, índice, 5 triggers e 1 view |
| 2 | [`02_insercao_dados.sql`](02_insercao_dados.sql) | Insere os dados iniciais de teste |
| — | [`04_testes_regras_negocio.sql`](04_testes_regras_negocio.sql) | Tenta violar as regras de negócio. Cada comando deve ser recusado |

**Como executar:**

```bash
mysql -u root -p < 01_criacao_banco.sql
mysql -u root -p < 02_insercao_dados.sql
mysql -u root -p --force < 04_testes_regras_negocio.sql   # opcional
```

No **MySQL Workbench**, abra cada arquivo e execute-o inteiro com o raio (⚡), na ordem acima. O script 01 começa com `DROP DATABASE IF EXISTS`, então pode ser rodado de novo para recomeçar do zero.

## Estrutura criada

| Tabela | Chave primária | Chaves estrangeiras | Principais restrições |
|---|---|---|---|
| `hospedes` | `id_hospede` | — | e-mail, CPF e passaporte únicos; CPF **ou** passaporte obrigatório |
| `quartos` | `id_quarto` | — | número único; tipo, vista e status de listas fixas; capacidade 1–8; preço > 0 |
| `funcionarios` | `id_funcionario` | — | CPF e e-mail únicos; departamento de lista fixa; salário > 0 |
| `reservas` | `id_reserva` | hóspede, quarto, funcionário (opcional) | código único; checkout > checkin; status e canal de listas fixas; cancelada exige data de cancelamento |
| `hospedagens` | `id_hospedagem` | reserva (única → 1:1), funcionário do check-in e do check-out | encerrada exige horário e funcionário do check-out |
| `servicos` | `id_servico` | — | nome único; categoria de lista fixa; preço ≥ 0 |
| `consumos_servicos` | `id_consumo` | hospedagem, serviço, funcionário | quantidade > 0; `valor_total` calculado |
| `pagamentos` | `id_pagamento` | hospedagem | valor > 0; método de lista fixa; só cartão de crédito parcela (1–12x) |
| `feedbacks` | `id_feedback` | hospedagem (única → 1 avaliação por estadia), funcionário que respondeu | notas de 1 a 5; resposta exige funcionário |

O diagrama e o dicionário de dados completo (todas as colunas) estão na [Parte 1](../parte-1-origem-do-sistema/README.md#6-modelo-lógico-relacional).

### Tipos de dados escolhidos

- **`DECIMAL(10,2)`** para dinheiro. É exato; `FLOAT` gera erros de arredondamento em centavos.
- **`DATE`** para as datas previstas da reserva e **`DATETIME`** para o que tem hora (check-in real, pagamento, consumo).
- **`TINYINT`/`SMALLINT`** para números pequenos (notas, capacidade, parcelas, quantidade).
- **`BOOLEAN`** para indicadores (banheira, ativo).
- **`VARCHAR`** com tamanho pensado para cada campo, e **`TEXT`** só para comentários livres.
- **Colunas geradas** (`num_noites`, `valor_total`): o banco calcula sozinho, sem risco de alguém digitar um valor errado.
- **`utf8mb4`**: aceita acentos e qualquer caractere.

### Triggers

Um `CHECK` só enxerga a própria linha. Regras que dependem de outras linhas ou tabelas ficaram em triggers:

| Trigger | Quando | Regra |
|---|---|---|
| `trg_reservas_validar_insert` | antes de inserir reserva | quarto ativo, sem sobreposição de datas, hóspedes ≤ capacidade |
| `trg_reservas_validar_update` | antes de alterar reserva | sem sobreposição de datas e capacidade, também ao mudar a reserva |
| `trg_hospedagens_validar_insert` | antes do check-in | a reserva precisa estar confirmada |
| `trg_hospedagens_concluir_reserva` | depois do check-out | muda a reserva para `concluida` |
| `trg_feedbacks_validar_insert` | antes de inserir avaliação | a hospedagem precisa estar encerrada |

### View

`vw_conta_hospedagem` mostra a conta de cada hospedagem: diárias + serviços = total devido, total pago e saldo. É usada nas consultas de faturamento e de saldo em aberto da Parte 3.

### Índice

`idx_reservas_quarto_periodo (id_quarto, data_checkin, data_checkout)` acelera a verificação de sobreposição feita pelo trigger e pela consulta de disponibilidade.

## Dados de teste

A data de referência é **25/11/2026** ("hoje"). Os dados cobrem o ano de 2026:

| Tabela | Registros | Destaques |
|---|---|---|
| hospedes | 15 | 2 estrangeiros com passaporte no lugar do CPF |
| quartos | 12 | 4 tipos e 4 vistas; o 104 está em manutenção |
| funcionarios | 10 | recepção, governança, A&B, bem-estar e gerência |
| servicos | 11 | café da manhã, minibar, spa, transfer, passeio de barco... |
| reservas | 70 | 54 concluídas, 6 canceladas (com motivo), 3 no-show, 6 confirmadas e 1 pendente (futuras ou em andamento) |
| hospedagens | 55 | 54 encerradas e 1 em andamento hoje |
| consumos_servicos | 114 | preço do dia registrado em cada consumo |
| pagamentos | 76 | pagamentos divididos (cartão + pix), parcelados e algumas tentativas de cartão recusadas |
| feedbacks | 42 | notas de 1 a 5, com respostas do gerente |

Os dados são coerentes entre si:
- nenhuma reserva ativa se sobrepõe;
- todo consumo acontece dentro da estadia;
- toda hospedagem encerrada está quitada, com saldo 0 na view;
- toda avaliação é posterior ao check-out.

As evidências estão em [`../evidencias/`](../evidencias/):
- [`01_carga_dos_dados.txt`](../evidencias/01_carga_dos_dados.txt): contagem de registros e conferência de saldos.
- [`02_testes_regras_de_negocio.txt`](../evidencias/02_testes_regras_de_negocio.txt): 11 violações recusadas e o trigger de check-out funcionando.
