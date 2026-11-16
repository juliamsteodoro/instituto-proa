# Exercícios SQL - Momento

Resolução dos exercícios da base de dados da empresa **Momento** (Etapa 0 e níveis 1 ao 12).

Banco usado: **MySQL 8**, banco `momento`.

Todos os exercícios estão em um arquivo só: **`exercicios_momento.sql`**, separado por nível e com o número de cada pergunta em comentário.

## Como rodar

1. Rodar o `0_Base.sql` (arquivo da base de dados da Momento) para criar o banco.
2. Rodar o `exercicios_momento.sql` do começo até o fim do **nível 11**.
3. Rodar o `0_Base.sql` de novo e depois rodar o **nível 12**.

> Por que rodar a base de novo? No nível 6 eu altero e apago funcionários (incluindo o Bruce Ernst). O nível 12 pede as mesmas alterações, só que feitas com segurança, então ele precisa começar da base original.

> A ordem importa: no 1.1 eu me cadastro como funcionária e no nível 6 eu apago quem foi contratado antes de 1990. Por isso, alguns números depois do nível 6 são diferentes dos números do começo.

Obs: quando o exercício fala "Departamento de Tecnologia", usei o departamento **Tecnologia da Informação** (id 6).

## Respostas

### Etapa 0 - Explorar
- 123 funcionários, 30 departamentos, 20 escritórios, 54 vendas e 80 itens de venda
- 11 funcionários sem telefone
- Os salários estão em 4 moedas (USD, GBP, EUR, BRL), então somar todos juntos não é exato
- 9 funcionários ganham fora da faixa salarial do cargo (ex: um Diretor com 45000, sendo que o máximo é 20000)
- Nas tabelas `status_venda`, `status_pagamento` e `status_entrega`, alguns status estão com o nome "1" ou "3" em vez de um texto

### Nível 1
- **1.1** Me cadastrei como Julia Teodoro: Aprendiz em Dados e Inteligência, com salário de 2500
- **1.2** 124 funcionários (123 + eu)
- **1.3** 9 funcionários em Tecnologia da Informação
- **1.4** 30 departamentos. "Recursos Humanos" aparece 2 vezes, em escritórios diferentes
- **1.5** 20 escritórios em 16 países (Estados Unidos e Reino Unido têm 3 cada)

### Nível 2
- **2.1** 5 funcionários em Vendas
- **2.2** 59.390,76 em salários
- **2.3** Média de 9.712,90 sem CEO, CMO e CFO
- **2.4** Média de 7.484,51 em Tecnologia
- **2.5** Biotecnologia, com média de 29.263,48
- **2.6** Empate entre Contabilidade, Recursos Humanos (Shuri's Palace) e Administração Executiva, com 1 funcionário cada

### Nível 3
- **3.1** 15 funcionários têm cônjuge
- **3.2** 61 funcionários têm filhos
- **3.3** Madeleine Prior (1987-03-23)
- **3.4** Ariel Nunes (2025-05-12), sem contar eu
- **3.5** Madeleine Prior, Noah Kim, Yuki Tanaka, Neena Kochhar e Lex T.Challa
- **3.6** 28 contratados entre 1990 e 1999
- **3.7** Tabela no arquivo. A média varia muito de um ano para outro e não segue um padrão claro

### Nível 4
- **4.1** O mais caro é Koboa Koboa (70.605,50) e o mais barato é Wayne Offices (17.948,00)
- **4.2** Empate: os 15 escritórios que têm suprimentos têm os mesmos 7 tipos
- **4.3** Computadores no Koboa Koboa, a 909,50 cada
- **4.4** O inventário vale 700.535,50 no total

### Nível 5
- **5.1** 24 produtos diferentes foram vendidos
- **5.2** Reator Arc decorativo (48 unidades)
- **5.3** Chapéu Seletor (1 unidade)
- **5.4** Tesseract decorativo (236.788,65)
- **5.5** Tesseract decorativo (7.000,00)
- **5.6** 863.042,05 no total, ou 805.121,32 sem as vendas canceladas
- **5.7** 2 vendas em junho de 2023
- **5.8** Empate entre John Russell, Karen Partners, Jonathon Taylor e Jack Livingston, com 11 vendas cada
- **5.9** John Russell (196.953,14)

### Nível 6
- **6.1** Criei o departamento Inovações (id 31) no Wayne Offices
- **6.2** Transferi Valli Stark e Diana Lorentz
- **6.3** Dei 10% de aumento para os 7 funcionários que ficaram em Tecnologia
- **6.4** O Bruce Ernst virou Senior Web Developer com salário de 5000. Obs: esse valor fica abaixo do mínimo do cargo (7000) e abaixo do que ele já ganhava, e no nível 12 eu corrijo isso
- **6.5** Adicionei 15 Headsets a 150 no Wayne Offices
- **6.6** Antes do DELETE, o SELECT mostrou 8 funcionários. Tive que apagar os 12 dependentes deles primeiro, porque a chave estrangeira não deixa apagar o funcionário. Depois disso ficaram 116 funcionários

### Nível 7
- **7.1** São 3 cursos ativos (Tecnologia Criativa, Narrativas e Cultura Pop, Laboratório de Dados), com 1 turma cada
- **7.2** A TEC-2025-01 tem 2 matrículas (capacidade 30) e as outras duas turmas têm 1 matrícula cada
- **7.3** 2 alunos têm bolsa: Ariel Nunes (100% em Tecnologia Criativa) e Diego Ramos (50% em Narrativas e Cultura Pop)
- **7.4** Só a TEC-2025-01 tem concluintes: 2 alunos, 2 certificados e nota média 88,75. Para dizer que um curso teve "mais sucesso", antes eu precisaria saber se as turmas já terminaram, quantos alunos cada uma tem, se a avaliação é igual e o que conta como sucesso (nota, conclusão ou emprego)
- **7.5** Ariel Nunes: cadastro → bolsa de 100% → matrícula em Tecnologia Criativa → turma concluída com nota 91,5 e certificado → estágio em Tecnologia da Informação (05/05 a 11/05/2025) → contratada em 12/05/2025. A formação se conecta com a empresa no estágio, logo depois do fim da turma
- **7.6** São 2 vínculos, os dois da Ariel. 1 pessoa fez estágio e 1 chegou à contratação
- **7.7** Só Tecnologia da Informação
- **7.8** 4 alunos, 2 matrículas ativas, 2 concluintes, 2 bolsas, 1 estágio, 1 contratação e 1 departamento
- **7.11** A `vinculos_talentos` é a ponte entre a escola e a empresa. Ela liga um aluno a um departamento quando ele faz estágio ou é contratado e, quando ele vira funcionário, guarda o `funcionario_id` dele

### Nível 8
- **8.1** A frente comercial gasta 721.661,79 em salários (tudo em USD). A educacional tem salários em 4 moedas: 111.300 USD, 124.300 BRL, 113.800 GBP e 56.700 EUR. Em suprimentos, os escritórios só comerciais somam 525.553,50, os só educacionais 70.605,50 e os mistos 106.626,50. Não encontrei tabela de despesas gerais
- **8.2** A escola fica em 8 escritórios (Torre de Paris, Tokyo Lab, Instituto Rio etc.). Verstebona e Castelo Encantado têm as duas frentes. Os outros escritórios são só comerciais
- **8.3** A receita de vendas (805 mil, sem as canceladas) é bem maior que os salários da escola em USD (111 mil). Mas é só uma comparação aproximada, porque a receita é de mais de 2 anos e as moedas são diferentes
- **8.4** Nenhum, na base original. O único cargo que aparece nas duas frentes é "Aprendiz", e só porque eu me cadastrei como Aprendiz em um departamento comercial
- **8.5** As vendas estão todas em um país só (Reino Unido, onde fica o Departamento de Vendas). Já a escola está em vários países. A expansão aumentou as equipes e o projeto educacional, mas não as vendas

### Nível 9
- **9.1** Relatório no arquivo. Administração Educacional é o departamento com mais funcionários (10)
- **9.2** Cientista de Dados (8), Professor Assistente (8) e Aprendiz (6)
- **9.3** Lista no arquivo
- **9.4** Até 2010 a empresa contratava quase sempre 2 ou 3 pessoas por ano. De 2015 a 2019 foram 6 por ano, e depois disso o número caiu
- **9.5** 1º John Russell, 2º Jack Livingston, 3º Jonathon Taylor, 4º Kimberly Grant e 5º Karen Partners (ordem por receita)
- **9.6** 8 produtos foram vendidos por um vendedor só (ex: Chapéu Seletor, Capacete Darth Vader)

### Nível 10
- **10.1** Nenhuma venda sem vendedor, porque `funcionario_id` é NOT NULL
- **10.2** Nenhum vendedor inexistente, porque a chave estrangeira não deixa
- **10.3** 15 produtos têm variação de preço maior que 10%. A maior é do Batarang de treino, com 25%. Também comparei com o preço de catálogo
- **10.4** 116 funcionários, 1.127.761,79 em salários (com moedas misturadas), 31 departamentos, 20 escritórios, receita de 863.042,05 e o produto mais vendido é o Reator Arc decorativo

### Nível 11 - ETL
- **Extract:** importei as 28 linhas do CSV na `stg_vendas_csv` do jeito que vieram
- **Transform:** criei a tabela `stg_vendas_tratada`, onde fiz:
  - padronização de espaços, maiúsculas e minúsculas
  - conversão de datas e preços de acordo com o `locale_origem`
  - padronização de canal e status
  - busca do SKU e do e-mail do vendedor nas tabelas da base
- **Load:** carreguei 13 linhas em `vendas` e `itens_venda`. As outras 15 linhas foram para a `etl_rejeicoes`

| Ação | Linhas | Casos |
|---|---|---|
| DUPLICATA | 1 | linha 3 (igual à linha 1) |
| REJEITAR | 5 | data 31/02, quantidade 0, -2 e "dois", preço "N/A" |
| REVISAR | 9 | locale "?", SKU-404, vendedor inexistente, moeda vazia/XYZ, canal "TikTok Shop", conflito no EXT-9001 |

Critérios que usei:
- **REJEITAR:** quando o valor é impossível ou não tem como ser interpretado
- **REVISAR:** quando alguém pode corrigir o valor
- **Pedido com linha pendente:** o pedido inteiro fica em revisão, sem carregar pela metade. Foi o caso do EXT-9001
- **Locale desconhecido:** não escolhi um formato de data por palpite
- **Moeda:** mantive a moeda original de cada linha (BRL continua BRL)

### Nível 12 - Alterações seguras
Fiz cada alteração dentro de `START TRANSACTION`, conferi com SELECT e só então usei `COMMIT`:
- **Departamento novo:** criei o Inovações no Wayne Offices
- **Promoção do Bruce Ernst:** o cargo Senior Web Developer já existia. Ele foi promovido com salário de 7000, que é o mínimo do cargo
- **Transferência:** Valli Stark e Diana Lorentz foram para o departamento novo. Escolhi as duas porque são desenvolvedoras com bastante experiência
- **Reajuste:** os 7 que ficaram em Tecnologia receberam 10%
- **Headsets:** cadastrei a compra com referência, moeda e data
- **Aposentadoria:** os 8 contratados antes de 1990 ficaram com status INATIVO, sem apagar ninguém (os dependentes continuam lá). O Bruce Ernst também entra nessa lista, porque foi contratado em 1989
