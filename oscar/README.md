# Exercícios SQL - Oscar 🏆

Resolução dos exercícios da base de dados do Oscar (níveis 1 ao 10).

Banco usado: **MySQL**, banco `oscar_database`, tabela `indicados_ao_oscar`.

## Como rodar

1. Rodar o arquivo `indicados_ao_oscar_orchestra.sql` (arquivo da base de dados do Oscar) para criar o banco e a tabela.
2. Rodar os arquivos na ordem: `nivel_01.sql`, `nivel_02.sql` ... até `nivel_10.sql`.

> A ordem importa: no nível 1 eu adiciono os dados de 2025 e 2026 e no nível 7 eu altero e apago alguns registros, então os números dos níveis seguintes já levam isso em conta.

## Arquivos

| Arquivo | Assunto |
|---|---|
| `nivel_01.sql` | Primeiros passos (COUNT, DISTINCT, MIN, MAX, INSERT) |
| `nivel_02.sql` | Explorando categorias (GROUP BY, ORDER BY, LIKE) |
| `nivel_03.sql` | Atores e atrizes famosos (WHERE, LIKE) |
| `nivel_04.sql` | Vencedores históricos |
| `nivel_05.sql` | Análise de indicações (HAVING, subquery) |
| `nivel_06.sql` | Análise de filmes (Toy Story, Crash, Central do Brasil) |
| `nivel_07.sql` | Operações de atualização (INSERT, UPDATE, DELETE) |
| `nivel_08.sql` | Análise temporal (por década) |
| `nivel_09.sql` | Questões históricas e sociais (JOIN) |
| `nivel_10.sql` | Análise avançada |

## Respostas

### Nível 1
- **1.1** 10.889 registros
- **1.2** 115 categorias únicas
- **1.3** Primeiro ano: 1928
- **1.4** Último ano: 2024
- **1.5** 96 cerimônias
- **1.6** Adicionei os vencedores das 10 categorias principais de 2025 (Anora ganhou Melhor Filme) e de 2026 (One Battle After Another ganhou Melhor Filme)

### Nível 2
- **2.1** Lista no arquivo
- **2.2** DIRECTING, com 471 indicações
- **2.3** Várias categorias empatadas com só 1 indicação (ex: GORDON E. SAWYER AWARD, AWARD OF COMMENDATION)
- **2.4** A última cerimônia com "ACTRESS" foi em 1976. Depois ela virou "ACTRESS IN A LEADING ROLE"
- **2.5** ACTOR, ACTRESS, ART DIRECTION, DIRECTING (Comedy/Dramatic Picture), ENGINEERING EFFECTS, OUTSTANDING PICTURE, UNIQUE AND ARTISTIC PICTURE, WRITING (Adaptation / Original Story / Title Writing), SPECIAL AWARD
- **2.6** DIRECTING (Comedy Picture), DIRECTING (Dramatic Picture) e DIRECTING

### Nível 3
- **Natalie Portman:** 3 indicações, 1 vitória (Black Swan, 2011). Indicada por Closer (2005), Black Swan (2011) e Jackie (2017)
- **Viola Davis:** 4 indicações, 1 vitória. Filmes: Doubt, The Help, Fences, Ma Rainey's Black Bottom
- **Amy Adams:** nunca ganhou. 6 indicações sem ganhar
- **Denzel Washington:** ganhou 2 Oscars. 10 indicações (9 como ator + 1 como produtor de Fences). Venceu por Glory (1990, ator coadjuvante) e Training Day (2002, ator principal)

### Nível 4
- **4.1** Janet Gaynor, 1928, por 7th Heaven
- **4.2** Emil Jannings, 1928, por The Last Command
- **4.3** 2.485 vencedores
- **4.4** Lista no arquivo (98 filmes). Obs: o nome da categoria mudou várias vezes (OUTSTANDING PICTURE, OUTSTANDING PRODUCTION, OUTSTANDING MOTION PICTURE, BEST MOTION PICTURE, BEST PICTURE), então usei todos
- **4.5** 1.341 filmes diferentes

### Nível 5
*Nas perguntas de atores usei só as categorias ACTOR/ACTRESS, porque nas outras o nome vem com várias pessoas juntas.*
- **5.1** Lista no arquivo
- **5.2** Meryl Streep, com 21 indicações
- **5.3** Ex: Peter O'Toole e Glenn Close (8 cada), Richard Burton (7), Amy Adams (6)...
- **5.4** Lista no arquivo. Fiz uma segunda query só com quem foi indicado como ator e como diretor (Clint Eastwood, George Clooney, Kevin Costner, Laurence Olivier...)
- **5.5** 5.594 indicados com exatamente 1 indicação
- **5.6** 1943, com 186 indicados

### Nível 6
- **6.1** Toy Story ganhou em 2011 (Toy Story 3) e 2020 (Toy Story 4)
- **6.2** 11 indicações
- **6.3** Música, canção original, roteiro, animação, melhor filme e edição de som
- **6.4** 78ª edição (2006)
- **6.5** 6 indicações
- **6.6** Sim, ganhou Melhor Filme
- **6.7** Sim, mas com o nome em inglês: "Central Station"
- **6.8** 2 indicações (Atriz - Fernanda Montenegro e Filme Estrangeiro)

### Nível 7
- **7.1** O campo `vencedor` já foi criado como BOOLEAN, então já estava como true/false. Deixei comentado como seria o UPDATE se fosse texto
- **7.2** Adicionei O Auto da Compadecida, Paddington 2 e Memories of Murder
- **7.3** Criei a categoria com Parasite, Another Round, Drive My Car, All Quiet on the Western Front e The Zone of Interest
- **7.4** Tirei ";" do final dos nomes, espaços no começo/fim e espaços duplos
- **7.5** Apaguei 319 registros com nome_filme NULL

### Nível 8
- **8.1** Lista no arquivo
- **8.2** Década de 1940, com 1.459 indicações
- **8.3** Começou com 14 categorias (1920s), chegou a 46 nos anos 70 e hoje fica perto de 30
- **8.4** 1943, com 182 indicações (depois das alterações do nível 7)
- **8.5** De 67 (1920s) para 1.211 (2010s) = crescimento de 1707,46%

### Nível 9
- **9.1** 1959, por The Defiant Ones
- **9.2** Não ganhou. Ele ganhou depois, em 1964, por Lilies of the Field
- **9.3** 2 (Dorothy Dandridge e Sidney Poitier). A base não tem coluna de etnia, então pesquisei os nomes
- **9.4** The Piano, Lost in Translation, The Hurt Locker, Nomadland, Promising Young Woman, The Power of the Dog e Anatomy of a Fall
- **9.5** Não, eles nunca concorreram no mesmo ano
- **9.6** Não se aplica. Jamie Foxx ganhou em 2005 (Ray), ano em que Denzel não foi indicado
- **9.7** Lista no arquivo. Os maiores são Ben-Hur, Titanic e O Senhor dos Anéis: O Retorno do Rei, com 11 cada

### Nível 10
- **10.1** Lista no arquivo (ex: Titanic, Schindler's List, Oppenheimer, Anora...)
- **10.2** Titanic, La La Land e All about Eve, com 14 indicações
- **10.3** Considerando filmes com pelo menos 5 indicações: O Senhor dos Anéis: O Retorno do Rei (11 de 11 = 100%)
- **10.4** Lista no arquivo (ex: Al Pacino de 1973 a 1976)
- **10.5** Média de 108,14 indicações por cerimônia
- **10.6** Lista no arquivo
