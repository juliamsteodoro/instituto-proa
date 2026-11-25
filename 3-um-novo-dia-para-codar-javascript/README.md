# Hora de Codar 3: Um Novo Dia Para Codar (JavaScript)

Exercícios de **arrays** em **JavaScript (Node.js)**, rodando no terminal. Cada exercício está num módulo próprio e pode ser executado pelo menu ou sozinho.

## 1. Como executar

Pré-requisito: **Node.js 18 ou superior**. Não há dependências, então não é preciso `npm install`.

```bash
npm start              # menu com os 4 exercícios
npm run estudantes     # 1 - Estudantes
npm run planetas       # 2 - Planetas
npm run compras        # 3 - Compras
npm run agenda         # 4 - Agenda de Contatos
npm test               # testes automatizados
```

Para reproduzir as evidências (entrada lida de arquivo):

```bash
node src/main.js  < evidencias/entradas/sessao-completa.txt
node src/agenda.js < evidencias/entradas/agenda-exemplo-enunciado.txt
```

## 2. Estrutura

```text
src/
├── main.js          # menu principal (1–4 exercícios, 5 sair)
├── estudantes.js    # 1 - cadastro ilimitado até "PARE"
├── planetas.js      # 2 - verifica se o planeta está na lista
├── compras.js       # 3 - retira frutas da lista
├── agenda.js        # 4 - agenda de contatos (objetos { nome, telefone })
└── utils/
    ├── entrada.js   # Terminal (readline) + perguntarTexto/perguntarValidado
    ├── texto.js     # normalizar texto, comparar sem acento, lista numerada
    └── executar.js  # executa um exercício sozinho com tratamento de erro
tests/regras.test.js # testes das regras (node:test)
evidencias/          # logs de execução e entradas usadas
```

Assim como no projeto do hotel, cada módulo separa **regras** (funções puras, como `removerFruta`, `buscarPlaneta` e `adicionarContato`, cobertas pelos testes) do **fluxo** (`executarXxx(io)`, que conversa com o usuário). Não há variáveis globais: cada exercício cria o próprio array quando começa.

## 3. Como cada exercício funciona

| Exercício | Métodos de array usados | Comportamento |
|---|---|---|
| 1 - Estudantes | `push`, `map`, `length` | Cadastra nomes sem limite. Com `PARE`, mostra a quantidade e a lista numerada. Nome em branco não é aceito. |
| 2 - Planetas | `find` | Mostra os 9 planetas e diz se o planeta digitado está na lista. A busca ignora maiúsculas e acentos ("jupiter" encontra "Júpiter"). |
| 3 - Compras | `findIndex`, `splice` | Lista inicial: Maçã, Banana, Laranja, Uva, Manga, Abacaxi. Fruta encontrada → `Fruta foi retirada da lista`. Fruta ausente → `Fruta indisponível no nosso mercado`. Com `PARE`, mostra as frutas restantes. Quando a lista esvazia → `Lista de compras finalizada`. |
| 4 - Agenda | `push`, `find`, `findIndex`, `splice`, `forEach` | Comandos `ADICIONAR`, `BUSCAR`, `REMOVER`, `LISTAR` e `SAIR`, com as mesmas mensagens do exemplo do enunciado. Também não aceita contato repetido e avisa quando o comando é inválido. |

Os comandos (`PARE`, `LISTAR`, `SAIR`...) funcionam em maiúsculas ou minúsculas.

## 4. Evidências de teste

| Arquivo | Conteúdo |
|---|---|
| `evidencias/log-sessao-completa.txt` | Passa pelos 4 exercícios: opção inválida, nome em branco, planeta com e sem acento, planeta inexistente, fruta indisponível, `PARE` com frutas restantes, lista esvaziada até "Lista de compras finalizada", todos os comandos da agenda, contato duplicado, comando inválido e `PARE` sem estudantes |
| `evidencias/log-agenda-exemplo-enunciado.txt` | Mesma sequência do exemplo do enunciado, com a mesma saída |
| `evidencias/log-testes-automatizados.txt` | Saída do `npm test` |
| `evidencias/entradas/*.txt` | Entradas usadas para gerar os logs |
