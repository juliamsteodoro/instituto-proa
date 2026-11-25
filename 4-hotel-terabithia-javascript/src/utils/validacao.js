'use strict';

/**
 * Conversões e validações comuns. Todas devolvem `null` quando a entrada é
 * inválida, o que permite reaproveitá-las com perguntarValidado().
 */

/** Aceita "200", "4,20", "4.20" e "1.254,50". */
function converterNumero(texto) {
  let t = String(texto ?? '').trim().replace(/\s/g, '');
  if (!t) return null;
  if (t.includes(',')) t = t.replace(/\./g, '').replace(',', '.');
  if (!/^[-+]?\d+(\.\d+)?$/.test(t)) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

/** Aceita apenas números inteiros (sem casas decimais). */
function converterInteiro(texto) {
  const t = String(texto ?? '').trim();
  if (!/^[-+]?\d+$/.test(t)) return null;
  return Number(t);
}

/** Minúsculas, sem acentos e sem espaços nas pontas. */
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

function estaEntre(valor, minimo, maximo) {
  return typeof valor === 'number' && Number.isFinite(valor) && valor >= minimo && valor <= maximo;
}

/** Fábricas de conversores com faixa, para uso com perguntarValidado(). */
function numeroNaFaixa(minimo, maximo = Infinity, { minimoExclusivo = false } = {}) {
  return (texto) => {
    const n = converterNumero(texto);
    if (n === null) return null;
    if (minimoExclusivo ? n <= minimo : n < minimo) return null;
    return n <= maximo ? n : null;
  };
}

function inteiroNaFaixa(minimo, maximo = Infinity) {
  return (texto) => {
    const n = converterInteiro(texto);
    return n !== null && estaEntre(n, minimo, maximo) ? n : null;
  };
}

module.exports = {
  converterNumero,
  converterInteiro,
  normalizarTexto,
  textoObrigatorio,
  estaEntre,
  numeroNaFaixa,
  inteiroNaFaixa,
};
