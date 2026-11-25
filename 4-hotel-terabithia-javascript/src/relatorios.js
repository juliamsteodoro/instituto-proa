'use strict';

const { CONFIG } = require('./config');
const { arredondar, formatarMoeda, formatarPercentual, formatarTabela } = require('./utils/formatacao');

// ---------- Regras de negócio ----------

function gerarIndicadores(estado) {
  const quartosOcupados = estado.quartos.filter((q) => q !== null).length;
  const receitaHospedagem = arredondar(estado.reservas.reduce((soma, r) => soma + r.total, 0));
  const receitaEventos = arredondar(estado.eventos.reduce((soma, e) => soma + e.total, 0));
  return {
    reservasConfirmadas: estado.reservas.length,
    quartosOcupados,
    taxaOcupacao: (quartosOcupados / CONFIG.TOTAL_QUARTOS) * 100,
    hospedesCadastrados: estado.hospedes.length,
    eventosConfirmados: estado.eventos.length,
    receitaHospedagem,
    receitaEventos,
    receitaTotal: arredondar(receitaHospedagem + receitaEventos),
  };
}

// ---------- Fluxo ----------

function executarRelatorios(ctx) {
  const { io, estado } = ctx;
  const ind = gerarIndicadores(estado);

  io.escrever('');
  io.escrever('[Relatórios Operacionais]');
  io.escrever(formatarTabela(['Indicador', 'Valor'], [
    ['Reservas de quartos confirmadas', ind.reservasConfirmadas],
    ['Taxa de ocupação atual', `${formatarPercentual(ind.taxaOcupacao, 1)} (${ind.quartosOcupados}/${CONFIG.TOTAL_QUARTOS})`],
    ['Hóspedes cadastrados', ind.hospedesCadastrados],
    ['Eventos confirmados', ind.eventosConfirmados],
    ['Receita — hospedagem', formatarMoeda(ind.receitaHospedagem)],
    ['Receita — eventos', formatarMoeda(ind.receitaEventos)],
    ['Receita — total geral', formatarMoeda(ind.receitaTotal)],
  ], ['esq', 'dir']));

  if (estado.reservas.length > 0) {
    io.escrever('');
    io.escrever('Reservas de quartos:');
    io.escrever(formatarTabela(['Quarto', 'Hóspede', 'Tipo', 'Diárias', 'Total'],
      estado.reservas.map((r) => [r.quarto, r.hospede, r.tipo, r.diarias, formatarMoeda(r.total)]),
      ['dir', 'esq', 'esq', 'dir', 'dir']));
  }

  if (estado.eventos.length > 0) {
    io.escrever('');
    io.escrever('Eventos:');
    io.escrever(formatarTabela(['Empresa', 'Auditório', 'Dia', 'Horário', 'Convidados', 'Total'],
      estado.eventos.map((e) => [e.empresa, e.auditorio, e.dia, `${e.horaInicio}h-${e.horaFim}h`, e.convidados, formatarMoeda(e.total)]),
      ['esq', 'esq', 'esq', 'esq', 'dir', 'dir']));
  }
}

module.exports = { executarRelatorios, gerarIndicadores };
