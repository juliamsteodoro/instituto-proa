'use strict';

const { converterInteiro, normalizarTexto, inteiroNaFaixa } = require('./utils/validacao');
const { perguntarTexto, perguntarValidado, perguntarSimNao } = require('./utils/entrada');
const { arredondar, formatarMoeda, formatarDecimal } = require('./utils/formatacao');

const AUDITORIOS = Object.freeze({
  LARANJA: { nome: 'Laranja', lugares: 150, cadeirasExtras: 70 },
  COLORADO: { nome: 'Colorado', lugares: 350, cadeirasExtras: 0 },
});
const CAPACIDADE_MAXIMA = AUDITORIOS.COLORADO.lugares;

const DIAS = Object.freeze({
  segunda: { nome: 'Segunda-feira', fimDeSemana: false },
  terca: { nome: 'Terça-feira', fimDeSemana: false },
  quarta: { nome: 'Quarta-feira', fimDeSemana: false },
  quinta: { nome: 'Quinta-feira', fimDeSemana: false },
  sexta: { nome: 'Sexta-feira', fimDeSemana: false },
  sabado: { nome: 'Sábado', fimDeSemana: true },
  domingo: { nome: 'Domingo', fimDeSemana: true },
});
const HORA_ABERTURA = 7;
const HORA_FECHAMENTO_SEMANA = 23;
const HORA_FECHAMENTO_FIM_DE_SEMANA = 15;
const DURACAO_MIN = 1;
const DURACAO_MAX = 12;

const CONVIDADOS_POR_GARCOM = 12;
const HORAS_POR_GARCOM_EXTRA = 2;
const CUSTO_GARCOM_HORA = 10.5;

const BUFFET = Object.freeze({
  CAFE_LITROS_POR_PESSOA: 0.2,
  AGUA_LITROS_POR_PESSOA: 0.5,
  SALGADOS_POR_PESSOA: 7,
  PRECO_CAFE_LITRO: 0.8,
  PRECO_AGUA_LITRO: 0.4,
  PRECO_CENTO_SALGADOS: 34,
});

// ---------- Parte A: capacidade ----------

function selecionarAuditorio(convidados) {
  if (!Number.isInteger(convidados) || convidados < 0) {
    return { valido: false, erro: 'Número de convidados inválido' };
  }
  if (convidados > CAPACIDADE_MAXIMA) {
    return { valido: false, erro: `Número de convidados inválido: capacidade máxima de ${CAPACIDADE_MAXIMA} excedida` };
  }
  const { LARANJA, COLORADO } = AUDITORIOS;
  if (convidados <= LARANJA.lugares + LARANJA.cadeirasExtras) {
    return { valido: true, auditorio: LARANJA.nome, cadeirasAdicionais: Math.max(0, convidados - LARANJA.lugares) };
  }
  return { valido: true, auditorio: COLORADO.nome, cadeirasAdicionais: 0 };
}

// ---------- Parte B: agenda ----------

function converterDia(texto) {
  const dia = normalizarTexto(texto).replace(/-feira$/, '');
  return DIAS[dia] ? dia : null;
}

function janelaDoDia(dia) {
  return {
    abertura: HORA_ABERTURA,
    fechamento: DIAS[dia].fimDeSemana ? HORA_FECHAMENTO_FIM_DE_SEMANA : HORA_FECHAMENTO_SEMANA,
  };
}

function verificarDisponibilidade({ dia, horaInicio, duracao, auditorio, agenda = [] }) {
  const { abertura, fechamento } = janelaDoDia(dia);
  const horaFim = horaInicio + duracao;
  if (horaInicio < abertura || horaInicio >= fechamento) {
    return { disponivel: false, motivo: `o auditório funciona das ${abertura}h às ${fechamento}h neste dia` };
  }
  if (horaFim > fechamento) {
    return { disponivel: false, motivo: `o evento terminaria às ${horaFim}h, após o fechamento (${fechamento}h)` };
  }
  const conflito = agenda.find((e) => e.auditorio === auditorio && e.dia === dia
    && horaInicio < e.horaFim && e.horaInicio < horaFim);
  if (conflito) {
    return { disponivel: false, motivo: `já existe evento de ${conflito.empresa} das ${conflito.horaInicio}h às ${conflito.horaFim}h` };
  }
  return { disponivel: true, horaFim };
}

// ---------- Parte C: garçons ----------

function calcularGarcons(convidados, duracao) {
  const base = Math.ceil(convidados / CONVIDADOS_POR_GARCOM);
  const reforco = Math.floor(duracao / HORAS_POR_GARCOM_EXTRA);
  const total = base + reforco;
  return { base, reforco, total, custo: arredondar(total * duracao * CUSTO_GARCOM_HORA) };
}

// ---------- Parte D: buffet ----------

function calcularBuffet(convidados) {
  const cafeLitros = arredondar(convidados * BUFFET.CAFE_LITROS_POR_PESSOA, 2);
  const aguaLitros = arredondar(convidados * BUFFET.AGUA_LITROS_POR_PESSOA, 2);
  const salgados = convidados * BUFFET.SALGADOS_POR_PESSOA;
  const custoCafe = arredondar(cafeLitros * BUFFET.PRECO_CAFE_LITRO);
  const custoAgua = arredondar(aguaLitros * BUFFET.PRECO_AGUA_LITRO);
  const custoSalgados = arredondar((salgados / 100) * BUFFET.PRECO_CENTO_SALGADOS);
  return {
    cafeLitros, aguaLitros, salgados, custoCafe, custoAgua, custoSalgados,
    custoTotal: arredondar(custoCafe + custoAgua + custoSalgados),
  };
}

// ---------- Fluxo (pipeline A -> E) ----------

async function executarEventos(ctx) {
  const { io, usuario, estado } = ctx;
  io.escrever('');
  io.escrever('[Eventos]');

  // Parte A
  const convidados = converterInteiro(await io.perguntar('Convidados: '));
  const selecao = selecionarAuditorio(convidados);
  if (!selecao.valido) {
    io.escrever(selecao.erro);
    return;
  }
  const extras = selecao.cadeirasAdicionais > 0 ? ` (${selecao.cadeirasAdicionais} cadeiras adicionais)` : '';
  io.escrever(`Auditório selecionado: ${selecao.auditorio}${extras}`);
  io.escrever('');

  // Parte B
  const dia = await perguntarValidado(io, 'Dia: ', converterDia,
    'Dia inválido. Informe: segunda, terca, quarta, quinta, sexta, sabado ou domingo.');
  const horaInicio = await perguntarValidado(io, 'Hora inicial: ', inteiroNaFaixa(0, 23),
    'Hora inválida. Informe um número inteiro entre 0 e 23.');
  const duracao = await perguntarValidado(io, `Duração (${DURACAO_MIN}-${DURACAO_MAX} horas): `,
    inteiroNaFaixa(DURACAO_MIN, DURACAO_MAX), `Duração inválida. Informe um inteiro entre ${DURACAO_MIN} e ${DURACAO_MAX}.`);

  const disp = verificarDisponibilidade({ dia, horaInicio, duracao, auditorio: selecao.auditorio, agenda: estado.eventos });
  if (!disp.disponivel) {
    io.escrever(`Status: Auditório indisponível — ${disp.motivo}.`);
    io.escrever('Reserva não efetuada.');
    return;
  }
  const empresa = await perguntarTexto(io, 'Empresa: ', 'O nome da empresa');
  io.escrever('Status: Auditório reservado.');
  io.escrever(`Auditório reservado para ${empresa}: ${dia} às ${horaInicio}hs`);
  io.escrever('');

  // Parte C
  const garcons = calcularGarcons(convidados, duracao);
  io.escrever(`Garçons necessários: ${garcons.total} (${garcons.base} pelos convidados + ${garcons.reforco} pela duração)`);
  io.escrever(`Custo com garçons: ${formatarMoeda(garcons.custo)}`);
  io.escrever('');

  // Parte D
  const buffet = calcularBuffet(convidados);
  io.escrever('Buffet:');
  io.escrever(`Café: ${formatarDecimal(buffet.cafeLitros, 1)} L (${formatarMoeda(buffet.custoCafe)})`);
  io.escrever(`Água: ${formatarDecimal(buffet.aguaLitros, 1)} L (${formatarMoeda(buffet.custoAgua)})`);
  io.escrever(`Salgados: ${buffet.salgados} un (${formatarMoeda(buffet.custoSalgados)})`);
  io.escrever(`Custo buffet: ${formatarMoeda(buffet.custoTotal)}`);

  // Parte E
  const total = arredondar(garcons.custo + buffet.custoTotal);
  io.escrever('');
  io.escrever('===== RELATÓRIO TÉCNICO DO EVENTO =====');
  io.escrever(`Auditório: ${selecao.auditorio}${extras}`);
  io.escrever(`Empresa: ${empresa}`);
  io.escrever(`Data: ${DIAS[dia].nome}`);
  io.escrever(`Horário: ${horaInicio}h às ${disp.horaFim}h`);
  io.escrever(`Convidados: ${convidados}`);
  io.escrever(`Garçons: ${garcons.total}`);
  io.escrever(`Duração: ${duracao}h`);
  io.escrever(`Custo garçons: ${formatarMoeda(garcons.custo)}`);
  io.escrever(`Custo buffet: ${formatarMoeda(buffet.custoTotal)}`);
  io.escrever(`Total do evento: ${formatarMoeda(total)}`);

  if (await perguntarSimNao(io, `${usuario}, confirmar reserva? (S/N): `)) {
    estado.eventos.push({
      id: estado.eventos.length + 1,
      auditorio: selecao.auditorio,
      empresa,
      dia,
      horaInicio,
      horaFim: disp.horaFim,
      convidados,
      duracao,
      garcons: garcons.total,
      custoGarcons: garcons.custo,
      custoBuffet: buffet.custoTotal,
      total,
    });
    io.escrever('Reserva efetuada com sucesso.');
  } else {
    io.escrever('Reserva não efetuada.');
  }
}

module.exports = {
  executarEventos,
  AUDITORIOS,
  selecionarAuditorio,
  converterDia,
  janelaDoDia,
  verificarDisponibilidade,
  calcularGarcons,
  calcularBuffet,
};
