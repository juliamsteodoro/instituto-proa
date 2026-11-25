'use strict';

/** Arredonda para 2 casas evitando erros de ponto flutuante (ex.: 1.005). */
function arredondar(valor, casas = 2) {
  const fator = 10 ** casas;
  return Math.round((valor + Number.EPSILON) * fator) / fator;
}

function separarMilhar(inteiro) {
  return String(inteiro).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/** Formato monetário padrão do sistema: "R$ 1.254,00". */
function formatarMoeda(valor) {
  const centavos = Math.round(Math.abs(valor) * 100);
  const inteiro = separarMilhar(Math.floor(centavos / 100));
  const decimal = String(centavos % 100).padStart(2, '0');
  return `${valor < 0 ? '-' : ''}R$ ${inteiro},${decimal}`;
}

/** Número decimal com vírgula: 38.4 -> "38,4". */
function formatarDecimal(valor, casas = 1) {
  const [inteiro, decimal] = arredondar(Math.abs(valor), casas).toFixed(casas).split('.');
  const sinal = valor < 0 ? '-' : '';
  return decimal ? `${sinal}${separarMilhar(inteiro)},${decimal}` : `${sinal}${separarMilhar(inteiro)}`;
}

function formatarPercentual(valor, casas = 2) {
  return `${formatarDecimal(valor, casas)}%`;
}

function formatarDataHora(data) {
  const p = (n) => String(n).padStart(2, '0');
  return `${p(data.getDate())}/${p(data.getMonth() + 1)}/${data.getFullYear()} `
    + `${p(data.getHours())}:${p(data.getMinutes())}:${p(data.getSeconds())}`;
}

/**
 * Tabela textual alinhada.
 * @param {string[]} cabecalho
 * @param {Array<Array<string|number>>} linhas
 * @param {Array<'esq'|'dir'>} alinhamentos
 */
function formatarTabela(cabecalho, linhas, alinhamentos = []) {
  const todas = [cabecalho, ...linhas].map((l) => l.map(String));
  const larguras = cabecalho.map((_, c) => Math.max(...todas.map((l) => l[c].length)));
  const montar = (l) => l
    .map((celula, c) => (alinhamentos[c] === 'dir' ? celula.padStart(larguras[c]) : celula.padEnd(larguras[c])))
    .join(' | ');
  const separador = larguras.map((w) => '-'.repeat(w)).join('-+-');
  return [montar(todas[0]), separador, ...todas.slice(1).map(montar)].join('\n');
}

module.exports = {
  arredondar,
  formatarMoeda,
  formatarDecimal,
  formatarPercentual,
  formatarDataHora,
  formatarTabela,
};
