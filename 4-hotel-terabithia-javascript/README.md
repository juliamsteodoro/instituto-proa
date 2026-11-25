# Hotel Terabithia — Plataforma Interna de Operações Hoteleiras (JavaScript)

Sistema de terminal para os funcionários do **Hotel Terabithia**, feito em **JavaScript (Node.js)** com arquitetura modular: cada subprograma é um módulo independente, e o menu principal apenas os orquestra.

## 1. Como executar

Pré-requisito: **Node.js 18 ou superior** (não há dependências externas, então não é preciso `npm install`).

```bash
# dentro desta pasta
npm start            # ou: node src/main.js
```

- Usuário: qualquer nome
- Senha: **2678** (máximo de 3 tentativas)

Rodar os testes automatizados das regras de negócio:

```bash
npm test
```

Reproduzir as sessões usadas como evidência (entrada lida de arquivo):

```bash
node src/main.js < evidencias/entradas/sessao-completa.txt
node src/main.js < evidencias/entradas/bloqueio-senha.txt
```

## 2. Estrutura de pastas

```text
src/
├── main.js            # inicio: cria terminal + estado, faz login e abre o menu
├── config.js          # constantes (nome do hotel, senha, 20 quartos, 15 hóspedes)
├── estado.js          # criarEstado(): dados em memória (quartos, reservas, hóspedes, eventos)
├── auth.js            # login com 3 tentativas
├── menu.js            # menu principal (1–7) e despacho para os subprogramas
├── reservas.js        # Subprograma 1 — Reservas de Quartos
├── hospedes.js        # Subprograma 2 — Cadastro de Hóspedes
├── eventos.js         # Subprograma 3 — Eventos (partes A a E)
├── arCondicionado.js  # Subprograma 4 — Ar-Condicionado
├── abastecimento.js   # Subprograma 5 — Abastecimento
├── relatorios.js      # Subprograma 6 — Relatórios Operacionais
└── utils/
    ├── entrada.js     # Terminal (entrada/saída) + perguntarValidado/SimNao/Texto
    ├── validacao.js   # conversão de números/inteiros, normalização de texto, faixas
    ├── formatacao.js  # moeda (R$ 1.234,56), decimais, data/hora, tabela alinhada
    └── erros.js       # exibirOpcaoInvalida() e exibirValorInvalido()
tests/regras.test.js   # 12 testes das regras de negócio (node:test)
evidencias/            # logs de execução e entradas usadas nos testes
```

## 3. Arquitetura modular adotada

**Separação entre regra de negócio e entrada/saída.** Cada módulo tem duas partes:

1. **Funções puras**, que só calculam e não leem nem escrevem nada (ex.: `calcularValoresReserva`, `selecionarAuditorio`, `calcularGarcons`, `calcularOrcamento`, `escolherCombustivel`, `gerarIndicadores`). São elas que os testes automatizados verificam.
2. **Uma função de fluxo** `executarXxx(ctx)`, que conversa com o usuário e usa as funções puras.

**Sem variáveis globais.** O estado em memória é criado uma única vez em `main.js` e passa pelo objeto `contexto = { io, usuario, estado }` para cada subprograma. O `config.js` só tem constantes congeladas (`Object.freeze`), não estado mutável.

**Validações reaproveitadas.** `perguntarValidado(io, mensagem, conversor, mensagemErro)` repete a pergunta até que o conversor devolva um valor válido. Os conversores (`converterNumero`, `inteiroNaFaixa`, `numeroNaFaixa`, `converterDia`…) são compartilhados por todos os módulos.

**Erros sem encerrar o programa.** O menu executa cada subprograma dentro de `try/catch`. Se acontecer um erro inesperado, ele é informado e o usuário volta ao menu principal. Opções inválidas são tratadas pela função dedicada `exibirOpcaoInvalida()`.

**Entrada pelo terminal.** A classe `Terminal` usa `readline` com uma fila de linhas. Assim, funciona tanto digitando quanto com a entrada redirecionada de um arquivo (é assim que os logs de evidência foram gerados). Quando a entrada vem de arquivo, as respostas são ecoadas no log e a senha aparece como `****`.

```text
main.js ──► auth.js ──► menu.js ──┬─► reservas.js
   │                              ├─► hospedes.js
   └─ criarEstado()               ├─► eventos.js
                                  ├─► arCondicionado.js
                                  ├─► abastecimento.js
                                  └─► relatorios.js
                (todos usam utils/: entrada, validacao, formatacao, erros)
```

## 4. Requisitos atendidos (resumo)

| Requisito | Onde | Observação |
|---|---|---|
| Boas-vindas, login, senha 2678, 3 tentativas, bloqueio | `auth.js` | |
| Menu 1–7, erro dedicado, retorno ao menu, despedida | `menu.js`, `utils/erros.js` | |
| Reservas: validação, tipos S/E/L, quarto ocupado + livres, taxa 10%, S/N, mapa 4x5 | `reservas.js` | Dado inválido → `Valor inválido, {Nome}` e volta ao menu |
| Hóspedes: 15 ativos, sem duplicados, busca exata/prefixo, lista A-Z com data/hora, atualizar/remover por índice | `hospedes.js` | Prefixo ignora maiúsculas/minúsculas; busca exata diferencia |
| Eventos A–E: auditório, cadeiras extras, janela de horário, duração 1–12, garçons, buffet, relatório, S/N | `eventos.js` | Também bloqueia horário em conflito com evento já confirmado no mesmo auditório/dia |
| Ar-condicionado: várias empresas, deslocamento, desconto se qtd ≥ mínimo, melhor/pior/diferença % | `arCondicionado.js` | |
| Abastecimento: 42 L, regra dos 70%, combustível ideal por posto, ranking | `abastecimento.js` | |
| Relatórios: reservas, ocupação, hóspedes, eventos, receitas | `relatorios.js` | Tabela textual alinhada |

## 5. Observações sobre o enunciado

- **Buffet do exemplo 6.6.** Com os custos unitários informados (café R$ 0,80/L, água R$ 0,40/L e salgados R$ 34,00 o cento), 192 convidados dão R$ 30,72 + R$ 38,40 + R$ 456,96 = **R$ 526,08**. O exemplo do enunciado mostra R$ 540,96, um valor que não sai desses preços. O sistema segue os preços unitários do enunciado, então o total do evento fica R$ 2.206,08.
- **Desconto do ar-condicionado.** A seção 7.2 diz `quantidade >= minimo`, e essa foi a regra usada (o texto introdutório fala em "maior que").
- **Nome do hotel.** `{Hotel}` = "Terabithia", então a abertura é "Bem-vindo ao Hotel Terabithia".
- **"Data" do evento.** O enunciado pede apenas o dia da semana, que é o que aparece no relatório como data.

## 6. Evidências de teste

Ficam na pasta `evidencias/`:

| Arquivo | Conteúdo |
|---|---|
| `log-sessao-completa.txt` | Sessão percorrendo todos os módulos: senha errada e depois certa, opções inválidas, reserva do exemplo (R$ 891,00), quarto ocupado, reserva recusada, valores inválidos, CRUD de hóspedes, evento do exemplo (Laranja + 42 cadeiras, 20 garçons, R$ 1.680,00), capacidade excedida, horário fora da janela, conflito de agenda, 3 orçamentos de ar-condicionado (incluindo o do exemplo, R$ 1.254,00), abastecimento (exemplo: gasolina na Wayne Oil, R$ 244,44), relatórios e saída |
| `log-bloqueio-senha.txt` | 3 senhas erradas → bloqueio e encerramento |
| `log-testes-automatizados.txt` | Saída do `npm test` (12 testes, todos passando) |
| `entradas/*.txt` | Entradas usadas para gerar os logs acima |
