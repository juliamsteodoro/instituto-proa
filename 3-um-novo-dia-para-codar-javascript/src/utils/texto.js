'use strict';

/** Minúsculas, sem acentos e sem espaços nas pontas: "  Júpiter " -> "jupiter". */
function normalizarTexto(texto) {
  return String(texto ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

/** Texto obrigatório: remove espaços extras; vazio vira null. */
function textoObrigatorio(texto) {
  const t = String(texto ?? '').trim().replace(/\s+/g, ' ');
  return t.length > 0 ? t : null;
}

/** Compara dois textos ignorando maiúsculas/minúsculas e acentos. */
function mesmoTexto(a, b) {
  return normalizarTexto(a) === normalizarTexto(b);
}

/** Verifica se o usuário digitou a palavra de parada (PARE, SAIR...). */
function ehComando(texto, comando) {
  return mesmoTexto(texto, comando);
}

/** Lista numerada: ["Ana", "Bia"] -> "1. Ana\n2. Bia". */
function listaNumerada(itens) {
  return itens.map((item, i) => `${i + 1}. ${item}`).join('\n');
}

module.exports = { normalizarTexto, textoObrigatorio, mesmoTexto, ehComando, listaNumerada };
