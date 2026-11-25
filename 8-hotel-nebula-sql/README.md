# Hotel Nebula — Projeto de Banco de Dados Relacional

A rede Hotel Nebula quer organizar num banco de dados as informações que hoje estão espalhadas (hóspedes, quartos, reservas, hospedagens, serviços, pagamentos, funcionários e avaliações), como base para uma futura API de gestão hoteleira.

Este repositório percorre as etapas de compreensão do problema, modelagem, implementação e extração de dados, em **MySQL 8**.

## Estrutura do repositório

```text
.
├── parte-1-origem-do-sistema/        Compreensão, modelo conceitual e lógico
│   ├── README.md                     entidades, relacionamentos, regras de negócio, dicionário de dados
│   ├── diagrama-er-conceitual.png    DER (notação de Chen)        (+ .svg)
│   └── diagrama-er-logico.png        modelo lógico relacional      (+ .svg)
├── parte-2-montagem-do-nucleo/       Implementação física
│   ├── README.md                     documentação da estrutura criada
│   ├── 01_criacao_banco.sql          banco, tabelas, PK/FK, CHECK, triggers, view
│   ├── 02_insercao_dados.sql         dados iniciais de teste
│   └── 04_testes_regras_negocio.sql  tentativas de violar as regras (devem falhar)
├── parte-3-radar-de-comando/         Consultas para a gestão
│   ├── README.md                     cada pergunta com a consulta e o resultado
│   └── 03_consultas.sql
└── evidencias/                       saídas reais da execução dos scripts
```

## Entregáveis

| Parte | Entregável pedido | Onde está |
|---|---|---|
| 1 | Diagrama ER | [`diagrama-er-conceitual.png`](parte-1-origem-do-sistema/diagrama-er-conceitual.png), [`diagrama-er-logico.png`](parte-1-origem-do-sistema/diagrama-er-logico.png) e versão Mermaid no README |
| 1 | Descrição das entidades e relacionamentos | [`parte-1-origem-do-sistema/README.md`](parte-1-origem-do-sistema/README.md) |
| 2 | Script de criação do banco | [`01_criacao_banco.sql`](parte-2-montagem-do-nucleo/01_criacao_banco.sql) |
| 2 | Script de inserção de dados | [`02_insercao_dados.sql`](parte-2-montagem-do-nucleo/02_insercao_dados.sql) |
| 2 | Documentação da estrutura | [`parte-2-montagem-do-nucleo/README.md`](parte-2-montagem-do-nucleo/README.md) |
| 3 | Consultas SQL | [`03_consultas.sql`](parte-3-radar-de-comando/03_consultas.sql) + [resultados comentados](parte-3-radar-de-comando/README.md) |

## Como executar

Pré-requisito: MySQL 8 (pelo terminal ou pelo MySQL Workbench).

```bash
mysql -u root -p < parte-2-montagem-do-nucleo/01_criacao_banco.sql
mysql -u root -p < parte-2-montagem-do-nucleo/02_insercao_dados.sql
mysql -u root -p < parte-3-radar-de-comando/03_consultas.sql
```

No Workbench, abra os arquivos e execute-os nessa mesma ordem.

## Resumo do modelo

```text
hospedes ─1:N─ reservas ─N:1─ quartos
                   │1:0..1
               hospedagens ─1:N─ pagamentos
                │      │ 1:0..1
                │      └──────── feedbacks
                └─N:N─ servicos   (via consumos_servicos)

funcionarios: registram reservas, fazem check-in/check-out, prestam serviços e respondem avaliações
```

- 9 tabelas, 12 chaves estrangeiras, 31 restrições `CHECK`, 11 `UNIQUE`, 5 triggers e 1 view.
- 15 regras de negócio documentadas e garantidas pelo próprio banco.
- 12 consultas que respondem às 7 perguntas da gestão, mais 3 extras.

## Publicando no GitHub

O enunciado pede um repositório no GitHub. A partir desta pasta:

```bash
git init
git add .
git commit -m "Hotel Nebula: modelagem, implementação e consultas"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/hotel-nebula.git
git push -u origin main
```

O GitHub mostra os README, as imagens e o diagrama Mermaid já formatados.
