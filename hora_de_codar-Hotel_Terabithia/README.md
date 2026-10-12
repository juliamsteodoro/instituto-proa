# Hotel Terabithia

Plataforma interna para colaboradores, implementada em JavaScript conforme os requisitos do enunciado fornecido em `README (4).md`.

## Execução

1. Abra `index.html` em um navegador com JavaScript habilitado.
2. Informe o nome do usuário e a senha `2678`. Após três senhas incorretas, a sessão é bloqueada.
3. Utilize os menus exibidos em `prompt` e leia os resultados em `alert`.

Os dados ficam somente em memória durante a execução. Recarregar a página inicia uma nova sessão com os 20 quartos livres.

## Arquitetura modular

- `js/auth.js`: autenticação e criação do estado da sessão.
- `js/menu.js`: menu principal e retorno após cada subprograma.
- `js/reservas.js`: cálculo, confirmação e mapa de quartos em grade 4×5.
- `js/hospedes.js`: cadastro, pesquisas, listagem, atualização e remoção por índice.
- `js/eventos.js`: auditório, agenda, garçons, buffet, relatório e confirmação.
- `js/ar_condicionado.js`: cálculo e comparação de orçamentos.
- `js/abastecimento.js`: combustível ideal por posto e ranking dos custos.
- `js/relatorio.js`: consolidação das reservas, ocupação, hóspedes, eventos e receitas.
- `js/utils.js`: entradas, validações, tratamento de opções inválidas e formatação monetária.

O estado é passado aos módulos como argumento, sem variáveis globais de dados. As funções de cálculo são separadas das funções de entrada e saída. Somente reservas e eventos confirmados entram no relatório operacional.

## Critério para divergências no enunciado

As seções detalhadas de requisitos e regras de cálculo prevalecem sobre as visões gerais e exemplos: diária maior que zero; 1 a 30 diárias; menu de hóspedes com sete opções; desconto de manutenção quando quantidade é maior ou igual ao mínimo.

O exemplo de eventos apresenta valores incompatíveis com as fórmulas especificadas. Para 192 convidados e oito horas, as regras resultam em 20 garçons, R$ 1.680,00 de garçons, R$ 526,08 de buffet e R$ 2.206,08 no total.

A data do evento é solicitada para compor o relatório técnico exigido. O dia da semana deve ser informado sem acentos e em minúsculas, conforme o enunciado.

## Evidências de teste

Com Node.js instalado, execute na pasta do projeto:

```text
node testes/verificar.cjs
```

Os 17 cenários verificam carregamento dos scripts do HTML, login, bloqueio, menus, reservas, ocupação, cadastros, índices, agenda, cálculos, confirmações, abastecimento e consolidação das receitas.

O resultado está em `testes/resultados.txt`. Os testes simulam `prompt` e `alert`; não incluem inspeção visual no navegador.
