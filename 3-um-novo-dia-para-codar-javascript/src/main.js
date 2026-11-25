'use strict';

/* Menu que reúne os 4 exercícios. Cada um também pode ser executado sozinho. */
const { executarSozinho } = require('./utils/executar');
const { executarEstudantes } = require('./estudantes');
const { executarPlanetas } = require('./planetas');
const { executarCompras } = require('./compras');
const { executarAgenda } = require('./agenda');

const EXERCICIOS = [
  { numero: 1, rotulo: 'Estudantes', executar: executarEstudantes },
  { numero: 2, rotulo: 'Planetas', executar: executarPlanetas },
  { numero: 3, rotulo: 'Compras', executar: executarCompras },
  { numero: 4, rotulo: 'Agenda de Contatos', executar: executarAgenda },
];
const OPCAO_SAIR = 5;

async function inicio(io) {
  io.escrever('Hora de Codar 3 — Um Novo Dia Para Codar (arrays)');
  for (;;) {
    io.escrever('');
    io.escrever('===== MENU =====');
    EXERCICIOS.forEach((e) => io.escrever(`${e.numero}. ${e.rotulo}`));
    io.escrever(`${OPCAO_SAIR}. Sair`);

    const opcao = Number((await io.perguntar('Escolha um exercício: ')).trim());
    if (opcao === OPCAO_SAIR) {
      io.escrever('Até a próxima!');
      return;
    }
    const exercicio = EXERCICIOS.find((e) => e.numero === opcao);
    if (!exercicio) {
      io.escrever(`Opção inválida. Digite um número de 1 a ${OPCAO_SAIR}.`);
      continue;
    }
    try {
      await exercicio.executar(io);
    } catch (erro) {
      if (erro.name === 'EntradaEncerradaError') throw erro;
      io.escrever(`Ocorreu um erro inesperado (${erro.message}). Voltando ao menu.`);
    }
  }
}

if (require.main === module) executarSozinho(inicio);

module.exports = { inicio, EXERCICIOS };
