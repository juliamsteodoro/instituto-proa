'use strict';

const { CONFIG } = require('./config');

/**
 * Cria o estado em memória da execução. O objeto é criado uma única vez em
 * main.js e repassado aos módulos pelo "contexto" — não há variável global.
 */
function criarEstado() {
  return {
    // quartos[i] === null -> livre; caso contrário guarda o id da reserva
    quartos: Array(CONFIG.TOTAL_QUARTOS).fill(null),
    reservas: [],
    hospedes: [],
    eventos: [],
  };
}

module.exports = { criarEstado };
