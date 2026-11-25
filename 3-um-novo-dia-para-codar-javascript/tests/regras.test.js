'use strict';

/* Testes das regras de negócio (sem entrada/saída). Executar: npm test */
const test = require('node:test');
const assert = require('node:assert/strict');

const texto = require('../src/utils/texto');
const { cadastrarEstudante, montarResumo } = require('../src/estudantes');
const { buscarPlaneta, PLANETAS } = require('../src/planetas');
const { removerFruta, FRUTAS_INICIAIS } = require('../src/compras');
const agenda = require('../src/agenda');

test('texto: normalização e palavra de parada', () => {
  assert.equal(texto.normalizarTexto('  Júpiter '), 'jupiter');
  assert.equal(texto.ehComando('pare', 'PARE'), true);
  assert.equal(texto.ehComando('parei', 'PARE'), false);
  assert.equal(texto.textoObrigatorio('   '), null);
  assert.equal(texto.textoObrigatorio('  Ana   Clara '), 'Ana Clara');
});

test('1 - Estudantes: cadastro sem limite e resumo', () => {
  const estudantes = [];
  for (let i = 1; i <= 100; i += 1) cadastrarEstudante(estudantes, `Aluno ${i}`);
  assert.equal(estudantes.length, 100);
  assert.match(montarResumo(estudantes), /Quantidade de estudantes cadastrados: 100/);
  assert.match(montarResumo(['Ana', 'Bia']), /1\. Ana\n2\. Bia/);
  assert.equal(montarResumo([]), 'Nenhum estudante cadastrado.');
});

test('2 - Planetas: busca com e sem acento', () => {
  assert.equal(PLANETAS.length, 9);
  assert.equal(buscarPlaneta(PLANETAS, 'jupiter'), 'Júpiter');
  assert.equal(buscarPlaneta(PLANETAS, 'TERRA'), 'Terra');
  assert.equal(buscarPlaneta(PLANETAS, 'Plutão'), 'Plutão');
  assert.equal(buscarPlaneta(PLANETAS, 'Pokémon'), null);
});

test('3 - Compras: remoção, fruta indisponível e lista vazia', () => {
  const frutas = [...FRUTAS_INICIAIS];
  assert.equal(removerFruta(frutas, 'maca'), true);
  assert.equal(frutas.includes('Maçã'), false);
  assert.equal(removerFruta(frutas, 'Maçã'), false); // já foi retirada
  assert.equal(removerFruta(frutas, 'Morango'), false);
  ['Banana', 'Laranja', 'Uva', 'Manga', 'Abacaxi'].forEach((f) => removerFruta(frutas, f));
  assert.equal(frutas.length, 0);
  assert.equal(FRUTAS_INICIAIS.length, 6); // a lista original não é alterada
});

test('4 - Agenda: adicionar, buscar, remover e comandos', () => {
  const contatos = [];
  assert.equal(agenda.adicionarContato(contatos, 'Ana', '99999-8888').ok, true);
  assert.deepEqual(contatos[0], { nome: 'Ana', telefone: '99999-8888' });
  assert.equal(agenda.adicionarContato(contatos, 'ana', '1111').ok, false);
  assert.equal(agenda.buscarContato(contatos, 'ANA').telefone, '99999-8888');
  assert.equal(agenda.buscarContato(contatos, 'Zeca'), null);
  assert.equal(agenda.removerContato(contatos, 'Zeca'), false);
  assert.equal(agenda.removerContato(contatos, 'Ana'), true);
  assert.equal(contatos.length, 0);
  assert.equal(agenda.converterComando('listar'), 'LISTAR');
  assert.equal(agenda.converterComando('APAGAR'), null);
});
