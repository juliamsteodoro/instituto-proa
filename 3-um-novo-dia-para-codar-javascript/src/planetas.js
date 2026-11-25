'use strict';

/* Exercício 2 — Planetas: verifica se o planeta digitado está na lista. */
const { textoObrigatorio, mesmoTexto, listaNumerada } = require('./utils/texto');
const { perguntarValidado } = require('./utils/entrada');
const { executarSozinho } = require('./utils/executar');

const PLANETAS = Object.freeze([
  'Mercúrio', 'Vênus', 'Terra', 'Marte', 'Júpiter', 'Saturno', 'Urano', 'Netuno', 'Plutão',
]);

// ---------- Regras ----------

/**
 * Procura o planeta ignorando maiúsculas/minúsculas e acentos
 * ("jupiter" encontra "Júpiter"). Devolve o nome oficial ou null.
 */
function buscarPlaneta(planetas, nome) {
  return planetas.find((p) => mesmoTexto(p, nome)) ?? null;
}

// ---------- Fluxo ----------

async function executarPlanetas(io) {
  io.escrever('');
  io.escrever('[2 - Planetas]');
  io.escrever('Planetas do sistema solar:');
  io.escrever(listaNumerada(PLANETAS));
  io.escrever('');

  const nome = await perguntarValidado(io, 'Digite o nome de um planeta: ', textoObrigatorio,
    'O nome não pode ficar em branco.');
  const encontrado = buscarPlaneta(PLANETAS, nome);

  io.escrever(encontrado
    ? `O planeta ${encontrado} está na lista.`
    : `O planeta ${nome} não está na lista.`);
}

if (require.main === module) executarSozinho(executarPlanetas);

module.exports = { executarPlanetas, buscarPlaneta, PLANETAS };
