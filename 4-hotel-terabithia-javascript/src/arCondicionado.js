'use strict';

const { numeroNaFaixa, inteiroNaFaixa } = require('./utils/validacao');
const { perguntarTexto, perguntarValidado, perguntarSimNao } = require('./utils/entrada');
const { arredondar, formatarMoeda, formatarPercentual } = require('./utils/formatacao');

// ---------- Regras de negócio ----------

/** Desconto aplicado somente se quantidade >= mínimo (requisito 7.2). */
function calcularOrcamento({ valorAparelho, quantidade, percentualDesconto, minimoDesconto, deslocamento }) {
  const bruto = arredondar(valorAparelho * quantidade);
  const descontoAplicado = quantidade >= minimoDesconto && percentualDesconto > 0;
  const desconto = descontoAplicado ? arredondar(bruto * (percentualDesconto / 100)) : 0;
  return { bruto, desconto, descontoAplicado, total: arredondar(bruto - desconto + deslocamento) };
}

/** Menor, maior e diferença percentual (pior em relação ao melhor). */
function compararOrcamentos(orcamentos) {
  if (orcamentos.length === 0) return null;
  const melhor = orcamentos.reduce((a, b) => (b.total < a.total ? b : a));
  const pior = orcamentos.reduce((a, b) => (b.total > a.total ? b : a));
  const diferencaPercentual = melhor.total > 0 ? ((pior.total - melhor.total) / melhor.total) * 100 : 0;
  return { melhor, pior, diferencaPercentual: arredondar(diferencaPercentual) };
}

// ---------- Fluxo ----------

async function lerEmpresa(io) {
  const empresa = await perguntarTexto(io, 'Empresa: ', 'O nome da empresa');
  const valorAparelho = await perguntarValidado(io, 'Valor por aparelho: ',
    numeroNaFaixa(0, Infinity, { minimoExclusivo: true }), 'Valor inválido. Informe um número maior que zero.');
  const quantidade = await perguntarValidado(io, 'Quantidade: ', inteiroNaFaixa(1),
    'Quantidade inválida. Informe um número inteiro maior que zero.');
  const percentualDesconto = await perguntarValidado(io, 'Desconto (%): ', numeroNaFaixa(0, 100),
    'Desconto inválido. Informe um valor entre 0 e 100.');
  const minimoDesconto = await perguntarValidado(io, 'Mínimo para desconto: ', inteiroNaFaixa(0),
    'Mínimo inválido. Informe um número inteiro maior ou igual a zero.');
  const deslocamento = await perguntarValidado(io, 'Deslocamento: ', numeroNaFaixa(0),
    'Deslocamento inválido. Informe um valor maior ou igual a zero.');
  return { empresa, valorAparelho, quantidade, percentualDesconto, minimoDesconto, deslocamento };
}

function exibirOrcamento(io, dados, calculo) {
  io.escrever(`Valor bruto: ${formatarMoeda(calculo.bruto)}`);
  io.escrever(calculo.descontoAplicado
    ? `Desconto (${dados.percentualDesconto}%): -${formatarMoeda(calculo.desconto)}`
    : `Desconto: não aplicado (mínimo de ${dados.minimoDesconto} aparelhos)`);
  io.escrever(`Deslocamento: ${formatarMoeda(dados.deslocamento)}`);
  io.escrever(`Total: ${formatarMoeda(calculo.total)}`);
  io.escrever(`O serviço de ${dados.empresa} custará ${formatarMoeda(calculo.total)}`);
}

async function executarArCondicionado(ctx) {
  const { io, usuario } = ctx;
  io.escrever('');
  io.escrever('[Ar-Condicionado]');
  const orcamentos = [];

  do {
    io.escrever('');
    const dados = await lerEmpresa(io);
    const calculo = calcularOrcamento(dados);
    exibirOrcamento(io, dados, calculo);
    orcamentos.push({ empresa: dados.empresa, total: calculo.total });
    io.escrever('');
  } while (await perguntarSimNao(io, `Deseja informar novos dados, ${usuario}? (S/N): `));

  const comparativo = compararOrcamentos(orcamentos);
  io.escrever('');
  io.escrever(`Melhor orçamento: ${comparativo.melhor.empresa} — ${formatarMoeda(comparativo.melhor.total)}`);
  io.escrever(`Pior orçamento: ${comparativo.pior.empresa} — ${formatarMoeda(comparativo.pior.total)}`);
  io.escrever(`Diferença percentual entre melhor e pior proposta: ${formatarPercentual(comparativo.diferencaPercentual)}`);
  if (orcamentos.length < 2) io.escrever('Observação: apenas uma empresa informada; o comparativo é limitado.');
  io.escrever(`O orçamento de menor valor é o de ${comparativo.melhor.empresa} por ${formatarMoeda(comparativo.melhor.total)}`);
}

module.exports = { executarArCondicionado, calcularOrcamento, compararOrcamentos };
