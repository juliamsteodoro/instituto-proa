'use strict';

/* Testes das regras de negócio (sem entrada/saída). Executar: npm test */
const test = require('node:test');
const assert = require('node:assert/strict');

const { criarEstado } = require('../src/estado');
const { senhaCorreta } = require('../src/auth');
const val = require('../src/utils/validacao');
const fmt = require('../src/utils/formatacao');
const reservas = require('../src/reservas');
const hosp = require('../src/hospedes');
const eventos = require('../src/eventos');
const ar = require('../src/arCondicionado');
const abast = require('../src/abastecimento');
const { gerarIndicadores } = require('../src/relatorios');

test('autenticação: senha 2678', () => {
  assert.equal(senhaCorreta('2678'), true);
  assert.equal(senhaCorreta(' 2678 '), true);
  assert.equal(senhaCorreta('1234'), false);
  assert.equal(senhaCorreta(''), false);
});

test('utils: conversões e formatação', () => {
  assert.equal(val.converterNumero('4,20'), 4.2);
  assert.equal(val.converterNumero('1.254,50'), 1254.5);
  assert.equal(val.converterNumero('abc'), null);
  assert.equal(val.converterInteiro('3.5'), null);
  assert.equal(val.normalizarTexto('  Sábado '), 'sabado');
  assert.equal(fmt.formatarMoeda(1254), 'R$ 1.254,00');
  assert.equal(fmt.formatarMoeda(0.1 + 0.2), 'R$ 0,30');
  assert.equal(fmt.formatarDecimal(96, 1), '96,0');
});

test('reservas: validações de diária e quantidade', () => {
  assert.equal(reservas.diariaValida(0), false);
  assert.equal(reservas.diariaValida(-10), false);
  assert.equal(reservas.diariaValida(200), true);
  assert.equal(reservas.quantidadeDiariasValida(0), false);
  assert.equal(reservas.quantidadeDiariasValida(31), false);
  assert.equal(reservas.quantidadeDiariasValida(30), true);
});

test('reservas: cálculo do exemplo (200 x 3 x Executivo)', () => {
  const r = reservas.calcularValoresReserva(200, 3, reservas.TIPOS_QUARTO.E.fator);
  assert.deepEqual(r, { subtotal: 810, taxa: 81, total: 891 });
});

test('reservas: ocupação de quartos e mapa 4x5', () => {
  const estado = criarEstado();
  assert.equal(reservas.listarQuartosLivres(estado.quartos).length, 20);
  reservas.registrarReserva(estado, { hospede: 'Carla', quarto: 7, total: 891 });
  assert.equal(reservas.quartoOcupado(estado.quartos, 7), true);
  assert.equal(reservas.listarQuartosLivres(estado.quartos).includes(7), false);
  const mapa = reservas.montarMapaQuartos(estado.quartos).split('\n');
  assert.equal(mapa.length, 4);
  assert.match(mapa[1], /07\[O\]/);
});

test('hóspedes: limite, duplicidade, busca, atualização e remoção', () => {
  const lista = [];
  assert.equal(hosp.cadastrarHospede(lista, 'Rosani Albuquerque').ok, true);
  assert.equal(hosp.cadastrarHospede(lista, 'Rosani Albuquerque').erro, hosp.MSG.DUPLICADO);
  hosp.cadastrarHospede(lista, 'Ana');
  assert.deepEqual(hosp.listarOrdenado(lista).map((h) => h.nome), ['Ana', 'Rosani Albuquerque']);
  assert.deepEqual(hosp.buscarPorPrefixo(lista, 'ro').map((r) => r.indice), [2]);
  assert.equal(hosp.buscarExato(lista, 'rosani albuquerque'), null);
  assert.equal(hosp.atualizarHospede(lista, 1, 'Rosani Albuquerque').erro, hosp.MSG.DUPLICADO);
  assert.equal(hosp.atualizarHospede(lista, 1, 'Beatriz').ok, true);
  assert.equal(hosp.removerHospede(lista, 9).ok, false);
  assert.equal(hosp.removerHospede(lista, 1).ok, true);
  assert.deepEqual(lista.map((h) => h.nome), ['Rosani Albuquerque']);

  const cheia = [];
  for (let i = 0; i < 15; i += 1) hosp.cadastrarHospede(cheia, `Hóspede ${i}`);
  assert.equal(hosp.cadastrarHospede(cheia, 'Extra').erro, hosp.MSG.MAXIMO);
});

test('eventos A: seleção de auditório', () => {
  assert.deepEqual(eventos.selecionarAuditorio(192), { valido: true, auditorio: 'Laranja', cadeirasAdicionais: 42 });
  assert.equal(eventos.selecionarAuditorio(150).cadeirasAdicionais, 0);
  assert.equal(eventos.selecionarAuditorio(220).auditorio, 'Laranja');
  assert.equal(eventos.selecionarAuditorio(221).auditorio, 'Colorado');
  assert.equal(eventos.selecionarAuditorio(350).valido, true);
  assert.equal(eventos.selecionarAuditorio(351).valido, false);
  assert.equal(eventos.selecionarAuditorio(-1).valido, false);
});

test('eventos B: janela de horários e conflitos', () => {
  assert.equal(eventos.converterDia('Terça-feira'), 'terca');
  assert.equal(eventos.converterDia('feriado'), null);
  const base = { auditorio: 'Laranja', agenda: [] };
  assert.equal(eventos.verificarDisponibilidade({ ...base, dia: 'segunda', horaInicio: 13, duracao: 8 }).disponivel, true);
  assert.equal(eventos.verificarDisponibilidade({ ...base, dia: 'segunda', horaInicio: 6, duracao: 2 }).disponivel, false);
  assert.equal(eventos.verificarDisponibilidade({ ...base, dia: 'segunda', horaInicio: 20, duracao: 4 }).disponivel, false);
  assert.equal(eventos.verificarDisponibilidade({ ...base, dia: 'sabado', horaInicio: 8, duracao: 7 }).disponivel, true);
  assert.equal(eventos.verificarDisponibilidade({ ...base, dia: 'domingo', horaInicio: 13, duracao: 4 }).disponivel, false);
  const agenda = [{ auditorio: 'Laranja', dia: 'segunda', horaInicio: 13, horaFim: 21, empresa: 'X' }];
  assert.equal(eventos.verificarDisponibilidade({ auditorio: 'Laranja', agenda, dia: 'segunda', horaInicio: 20, duracao: 2 }).disponivel, false);
  assert.equal(eventos.verificarDisponibilidade({ auditorio: 'Laranja', agenda, dia: 'segunda', horaInicio: 8, duracao: 5 }).disponivel, true);
  assert.equal(eventos.verificarDisponibilidade({ auditorio: 'Colorado', agenda, dia: 'segunda', horaInicio: 14, duracao: 2 }).disponivel, true);
});

test('eventos C e D: garçons e buffet', () => {
  assert.deepEqual(eventos.calcularGarcons(192, 8), { base: 16, reforco: 4, total: 20, custo: 1680 });
  assert.equal(eventos.calcularGarcons(13, 1).total, 2);
  const b = eventos.calcularBuffet(192);
  assert.equal(b.cafeLitros, 38.4);
  assert.equal(b.aguaLitros, 96);
  assert.equal(b.salgados, 1344);
  assert.equal(b.custoTotal, 526.08); // 30,72 + 38,40 + 456,96
});

test('ar-condicionado: orçamento e comparativo', () => {
  const o = ar.calcularOrcamento({ valorAparelho: 120, quantidade: 10, percentualDesconto: 8, minimoDesconto: 8, deslocamento: 150 });
  assert.equal(o.total, 1254);
  const semDesconto = ar.calcularOrcamento({ valorAparelho: 100, quantidade: 7, percentualDesconto: 10, minimoDesconto: 8, deslocamento: 0 });
  assert.equal(semDesconto.descontoAplicado, false);
  assert.equal(semDesconto.total, 700);
  const c = ar.compararOrcamentos([{ empresa: 'A', total: 1254 }, { empresa: 'B', total: 1000 }]);
  assert.equal(c.melhor.empresa, 'B');
  assert.equal(c.pior.empresa, 'A');
  assert.equal(c.diferencaPercentual, 25.4);
});

test('abastecimento: regra dos 70% e ranking', () => {
  assert.equal(abast.escolherCombustivel(4.20, 5.82), 'Gasolina');
  assert.equal(abast.escolherCombustivel(4.07, 5.82), 'Álcool');
  assert.equal(abast.escolherCombustivel(3.5, 5), 'Álcool'); // exatamente 70%
  const ranking = abast.montarRanking([
    abast.analisarPosto({ posto: 'Stark Petrol', alcool: 4.35, gasolina: 6.17 }),
    abast.analisarPosto({ posto: 'Wayne Oil', alcool: 4.20, gasolina: 5.82 }),
  ]);
  assert.equal(ranking[0].posto, 'Wayne Oil');
  assert.equal(ranking[0].total, 244.44);
  assert.equal(ranking[1].total, 259.14);
});

test('relatórios: indicadores consolidados', () => {
  const estado = criarEstado();
  reservas.registrarReserva(estado, { hospede: 'Carla', quarto: 7, total: 891 });
  estado.eventos.push({ total: 2206.08 });
  hosp.cadastrarHospede(estado.hospedes, 'Rosani');
  const ind = gerarIndicadores(estado);
  assert.equal(ind.reservasConfirmadas, 1);
  assert.equal(ind.taxaOcupacao, 5);
  assert.equal(ind.hospedesCadastrados, 1);
  assert.equal(ind.eventosConfirmados, 1);
  assert.equal(ind.receitaTotal, 3097.08);
});
