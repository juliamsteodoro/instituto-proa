'use strict';

const { numeroNaFaixa } = require('./utils/validacao');
const { perguntarValidado } = require('./utils/entrada');
const { arredondar, formatarMoeda } = require('./utils/formatacao');

const TANQUE_LITROS = 42;
const LIMITE_ETANOL = 0.70; // etanol compensa se custar até 70% da gasolina (30% mais barato)
const POSTOS = Object.freeze(['Wayne Oil', 'Stark Petrol']);

// ---------- Regras de negócio ----------

function escolherCombustivel(precoAlcool, precoGasolina) {
  return precoAlcool <= arredondar(precoGasolina * LIMITE_ETANOL, 4) ? 'Álcool' : 'Gasolina';
}

function analisarPosto({ posto, alcool, gasolina }) {
  const combustivel = escolherCombustivel(alcool, gasolina);
  const precoLitro = combustivel === 'Álcool' ? alcool : gasolina;
  return {
    posto,
    combustivel,
    precoLitro,
    total: arredondar(precoLitro * TANQUE_LITROS),
    totalAlcool: arredondar(alcool * TANQUE_LITROS),
    totalGasolina: arredondar(gasolina * TANQUE_LITROS),
  };
}

/** Ranking do menor para o maior custo da opção ideal de cada posto. */
function montarRanking(analises) {
  return [...analises].sort((a, b) => a.total - b.total);
}

// ---------- Fluxo ----------

const precoValido = numeroNaFaixa(0, Infinity, { minimoExclusivo: true });

async function executarAbastecimento(ctx) {
  const { io, usuario } = ctx;
  io.escrever('');
  io.escrever('[Abastecimento]');

  const precos = [];
  for (const posto of POSTOS) {
    const alcool = await perguntarValidado(io, `${posto} — preço do álcool (R$/L): `, precoValido,
      'Preço inválido. Informe um valor maior que zero.');
    const gasolina = await perguntarValidado(io, `${posto} — preço da gasolina (R$/L): `, precoValido,
      'Preço inválido. Informe um valor maior que zero.');
    precos.push({ posto, alcool, gasolina });
  }

  io.escrever('');
  precos.forEach((p) => io.escrever(
    `${p.posto} -> Álcool: ${formatarMoeda(p.alcool).replace('R$ ', '')} | Gasolina: ${formatarMoeda(p.gasolina).replace('R$ ', '')}`,
  ));
  io.escrever('');

  const analises = precos.map(analisarPosto);
  analises.forEach((a) => io.escrever(
    `${a.posto}: melhor opção = ${a.combustivel} | Total (${TANQUE_LITROS}L) = ${formatarMoeda(a.total)}`
    + `   [álcool ${formatarMoeda(a.totalAlcool)} / gasolina ${formatarMoeda(a.totalGasolina)}]`,
  ));

  const ranking = montarRanking(analises);
  io.escrever('');
  io.escrever('Ranking (menor para maior custo):');
  ranking.forEach((a, i) => io.escrever(`${i + 1}º ${a.posto} — ${a.combustivel} — ${formatarMoeda(a.total)}`));
  io.escrever('');

  const [primeiro, segundo] = ranking;
  if (segundo && primeiro.total === segundo.total) {
    io.escrever(`${usuario}, os dois postos têm o mesmo custo (${formatarMoeda(primeiro.total)}). Qualquer um serve.`);
  } else {
    io.escrever(`${usuario}, é mais barato abastecer com ${primeiro.combustivel.toLowerCase()} no posto ${primeiro.posto}.`);
  }
}

module.exports = { executarAbastecimento, escolherCombustivel, analisarPosto, montarRanking, TANQUE_LITROS };
