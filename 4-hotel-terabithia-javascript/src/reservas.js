'use strict';

const { CONFIG } = require('./config');
const { converterNumero, converterInteiro } = require('./utils/validacao');
const { perguntarTexto, perguntarValidado, perguntarSimNao } = require('./utils/entrada');
const { arredondar, formatarMoeda } = require('./utils/formatacao');
const { exibirValorInvalido } = require('./utils/erros');

const TIPOS_QUARTO = Object.freeze({
  S: { nome: 'Standard', fator: 1.0 },
  E: { nome: 'Executivo', fator: 1.35 },
  L: { nome: 'Luxo', fator: 1.65 },
});
const TAXA_SERVICO = 0.10;
const MAX_DIARIAS = 30;

// ---------- Regras de negócio (sem entrada/saída) ----------

function diariaValida(valor) {
  return typeof valor === 'number' && Number.isFinite(valor) && valor > 0;
}

function quantidadeDiariasValida(qtd) {
  return Number.isInteger(qtd) && qtd >= 1 && qtd <= MAX_DIARIAS;
}

function calcularValoresReserva(valorDiaria, quantidadeDiarias, fator) {
  const subtotal = arredondar(valorDiaria * quantidadeDiarias * fator);
  const taxa = arredondar(subtotal * TAXA_SERVICO);
  return { subtotal, taxa, total: arredondar(subtotal + taxa) };
}

function quartoOcupado(quartos, numero) {
  return quartos[numero - 1] !== null;
}

function listarQuartosLivres(quartos) {
  return quartos.map((ocupante, i) => (ocupante === null ? i + 1 : null)).filter((n) => n !== null);
}

function registrarReserva(estado, dados) {
  const reserva = { id: estado.reservas.length + 1, ...dados, criadaEm: new Date() };
  estado.reservas.push(reserva);
  estado.quartos[dados.quarto - 1] = reserva.id;
  return reserva;
}

/** Mapa em grade 4x5 (4 linhas com 5 quartos). */
function montarMapaQuartos(quartos) {
  const linhas = [];
  for (let linha = 0; linha < 4; linha += 1) {
    const celulas = [];
    for (let coluna = 0; coluna < 5; coluna += 1) {
      const numero = linha * 5 + coluna + 1;
      const status = quartos[numero - 1] === null ? 'L' : 'O';
      celulas.push(`${String(numero).padStart(2, '0')}[${status}]`);
    }
    linhas.push(celulas.join('  '));
  }
  return linhas.join('\n');
}

// ---------- Fluxo de entrada/saída ----------

async function escolherQuarto(io, quartos) {
  for (;;) {
    const numero = converterInteiro(await io.perguntar(`Escolha um quarto (1-${CONFIG.TOTAL_QUARTOS}): `));
    if (numero === null || numero < 1 || numero > CONFIG.TOTAL_QUARTOS) {
      io.escrever(`Quarto inválido. Informe um número de 1 a ${CONFIG.TOTAL_QUARTOS}.`);
    } else if (quartoOcupado(quartos, numero)) {
      io.escrever('Quarto já está ocupado.');
      io.escrever(`Quartos livres: ${listarQuartosLivres(quartos).join(', ')}`);
    } else {
      return numero;
    }
  }
}

function exibirMapa(io, quartos) {
  io.escrever('');
  io.escrever('Mapa de quartos (L = livre, O = ocupado):');
  io.escrever(montarMapaQuartos(quartos));
}

async function executarReservas(ctx) {
  const { io, usuario, estado } = ctx;
  io.escrever('');
  io.escrever('[Reservas]');

  const valorDiaria = converterNumero(await io.perguntar('Informe o valor da diária: '));
  if (!diariaValida(valorDiaria)) {
    exibirValorInvalido(io, usuario);
    return;
  }

  const quantidade = converterInteiro(await io.perguntar(`Informe a quantidade de diárias (1-${MAX_DIARIAS}): `));
  if (!quantidadeDiariasValida(quantidade)) {
    exibirValorInvalido(io, usuario);
    return;
  }

  if (listarQuartosLivres(estado.quartos).length === 0) {
    io.escrever(`Não há quartos livres no momento, ${usuario}.`);
    return;
  }

  const hospede = await perguntarTexto(io, 'Informe o nome do hóspede: ', 'O nome do hóspede');
  const tipo = await perguntarValidado(
    io,
    'Tipo de quarto (S/E/L): ',
    (t) => { const k = String(t).trim().toUpperCase(); return TIPOS_QUARTO[k] ? k : null; },
    'Tipo inválido. Informe S (Standard), E (Executivo) ou L (Luxo).',
  );
  const quarto = await escolherQuarto(io, estado.quartos);
  const { subtotal, taxa, total } = calcularValoresReserva(valorDiaria, quantidade, TIPOS_QUARTO[tipo].fator);

  io.escrever('');
  io.escrever('Resumo:');
  io.escrever(`Hóspede: ${hospede}`);
  io.escrever(`Quarto: ${quarto} (${TIPOS_QUARTO[tipo].nome})`);
  io.escrever(`Diárias: ${quantidade} x ${formatarMoeda(valorDiaria)}`);
  io.escrever(`Subtotal: ${formatarMoeda(subtotal)}`);
  io.escrever(`Taxa de serviço (10%): ${formatarMoeda(taxa)}`);
  io.escrever(`Total: ${formatarMoeda(total)}`);
  io.escrever('');

  if (await perguntarSimNao(io, `${usuario}, confirma a reserva? (S/N): `)) {
    registrarReserva(estado, {
      hospede, quarto, tipo: TIPOS_QUARTO[tipo].nome, diarias: quantidade, valorDiaria, subtotal, taxa, total,
    });
    io.escrever('Reserva efetuada com sucesso.');
  } else {
    io.escrever('Reserva não efetuada.');
  }

  exibirMapa(io, estado.quartos);
}

module.exports = {
  executarReservas,
  TIPOS_QUARTO,
  diariaValida,
  quantidadeDiariasValida,
  calcularValoresReserva,
  quartoOcupado,
  listarQuartosLivres,
  registrarReserva,
  montarMapaQuartos,
};
