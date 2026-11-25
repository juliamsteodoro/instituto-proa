'use strict';

const { Terminal, EntradaEncerradaError } = require('./utils/entrada');
const { criarEstado } = require('./estado');
const { autenticar } = require('./auth');
const { executarMenuPrincipal } = require('./menu');

/** Ponto de entrada (inicio): login -> menu principal -> saída. */
async function inicio() {
  const io = new Terminal();
  try {
    const usuario = await autenticar(io);
    if (usuario === null) {
      process.exitCode = 1;
      return;
    }
    const contexto = { io, usuario, estado: criarEstado() };
    await executarMenuPrincipal(contexto);
  } catch (erro) {
    if (erro instanceof EntradaEncerradaError) {
      io.escrever('\nEntrada encerrada. Sistema finalizado.');
    } else {
      io.escrever(`\nErro inesperado: ${erro.message}`);
      process.exitCode = 1;
    }
  } finally {
    io.fechar();
  }
}

if (require.main === module) inicio();

module.exports = { inicio };
