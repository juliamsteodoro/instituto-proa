'use strict';

const { CONFIG } = require('./config');
const { converterInteiro } = require('./utils/validacao');
const { exibirOpcaoInvalida } = require('./utils/erros');
const { EntradaEncerradaError } = require('./utils/entrada');

const { executarReservas } = require('./reservas');
const { executarCadastroHospedes } = require('./hospedes');
const { executarEventos } = require('./eventos');
const { executarArCondicionado } = require('./arCondicionado');
const { executarAbastecimento } = require('./abastecimento');
const { executarRelatorios } = require('./relatorios');

const OPCOES = [
  { numero: 1, rotulo: 'Reservas de Quartos', executar: executarReservas },
  { numero: 2, rotulo: 'Cadastro de Hóspedes', executar: executarCadastroHospedes },
  { numero: 3, rotulo: 'Eventos', executar: executarEventos },
  { numero: 4, rotulo: 'Ar-Condicionado', executar: executarArCondicionado },
  { numero: 5, rotulo: 'Abastecimento', executar: executarAbastecimento },
  { numero: 6, rotulo: 'Relatórios Operacionais', executar: executarRelatorios },
];
const OPCAO_SAIR = 7;

function exibirMenu(io) {
  io.escrever('');
  io.escrever(`===== HOTEL ${CONFIG.NOME_HOTEL.toUpperCase()} — MENU PRINCIPAL =====`);
  OPCOES.forEach((o) => io.escrever(`${o.numero}. ${o.rotulo}`));
  io.escrever(`${OPCAO_SAIR}. Sair`);
}

/**
 * Laço do menu principal. Cada subprograma roda isolado num try/catch:
 * um erro inesperado é informado e o usuário volta ao menu (sem encerrar).
 */
async function executarMenuPrincipal(ctx) {
  const { io, usuario } = ctx;
  for (;;) {
    exibirMenu(io);
    const opcao = converterInteiro(await io.perguntar('Opção: '));

    if (opcao === OPCAO_SAIR) {
      io.escrever(`Muito obrigado e até logo, ${usuario}.`);
      return;
    }

    const item = OPCOES.find((o) => o.numero === opcao);
    if (!item) {
      exibirOpcaoInvalida(io, usuario, OPCAO_SAIR);
      continue;
    }

    try {
      await item.executar(ctx);
    } catch (erro) {
      if (erro instanceof EntradaEncerradaError) throw erro;
      io.escrever(`Ocorreu um erro inesperado (${erro.message}). Retornando ao menu principal.`);
    }
  }
}

module.exports = { executarMenuPrincipal, OPCOES, OPCAO_SAIR };
