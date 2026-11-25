'use strict';

/**
 * Função dedicada ao tratamento de opções inválidas de menu
 * (requisito 3.2). Usada pelo menu principal e pelo submenu de hóspedes.
 */
function exibirOpcaoInvalida(io, nomeUsuario, opcaoMaxima) {
  io.escrever(`Opção inválida, ${nomeUsuario}. Por favor, informe um número entre 1 e ${opcaoMaxima}.`);
}

/** Mensagem padrão de valor inválido (Reservas e demais módulos). */
function exibirValorInvalido(io, nomeUsuario) {
  io.escrever(`Valor inválido, ${nomeUsuario}`);
}

module.exports = { exibirOpcaoInvalida, exibirValorInvalido };
