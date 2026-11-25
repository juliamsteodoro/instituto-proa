'use strict';

const { Terminal, EntradaEncerradaError } = require('./entrada');

/**
 * Permite rodar um exercício sozinho (ex.: node src/estudantes.js),
 * cuidando da abertura/fechamento do terminal e de erros.
 */
async function executarSozinho(exercicio) {
  const io = new Terminal();
  try {
    await exercicio(io);
  } catch (erro) {
    if (erro instanceof EntradaEncerradaError) io.escrever('\nEntrada encerrada.');
    else {
      io.escrever(`\nErro inesperado: ${erro.message}`);
      process.exitCode = 1;
    }
  } finally {
    io.fechar();
  }
}

module.exports = { executarSozinho };
