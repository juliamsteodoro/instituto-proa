'use strict';

/**
 * Constantes de configuração do sistema.
 * São constantes imutáveis (Object.freeze), não variáveis globais de estado:
 * centralizam regras de negócio que aparecem em mais de um módulo.
 */
const CONFIG = Object.freeze({
  NOME_HOTEL: 'Terabithia',
  SENHA: '2678',
  MAX_TENTATIVAS_SENHA: 3,
  TOTAL_QUARTOS: 20,
  MAX_HOSPEDES: 15,
});

module.exports = { CONFIG };
