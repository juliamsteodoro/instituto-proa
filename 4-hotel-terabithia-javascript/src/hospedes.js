'use strict';

const { CONFIG } = require('./config');
const { converterInteiro } = require('./utils/validacao');
const { perguntarTexto, perguntarSimNao } = require('./utils/entrada');
const { formatarDataHora } = require('./utils/formatacao');
const { exibirOpcaoInvalida } = require('./utils/erros');

const MSG = Object.freeze({
  MAXIMO: 'Máximo de cadastros atingido',
  DUPLICADO: 'Hóspede já cadastrado',
  NAO_ENCONTRADO: 'Hóspede não encontrado',
  SUCESSO: 'Operação realizada com sucesso',
  LISTA_VAZIA: 'Nenhum hóspede cadastrado.',
  INDICE_INVALIDO: 'Índice inválido.',
});

// ---------- Regras de negócio (sem entrada/saída) ----------

/** Listagem ordenada A-Z (cópia). Os índices exibidos (1..n) vêm desta ordem. */
function listarOrdenado(hospedes) {
  return [...hospedes].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' }));
}

function buscarExato(hospedes, nome) {
  return hospedes.find((h) => h.nome === nome) || null;
}

/** Prefixo sem diferenciar maiúsculas/minúsculas. Devolve {indice, hospede}. */
function buscarPorPrefixo(hospedes, prefixo) {
  const p = prefixo.toLocaleLowerCase('pt-BR');
  return listarOrdenado(hospedes)
    .map((hospede, i) => ({ indice: i + 1, hospede }))
    .filter(({ hospede }) => hospede.nome.toLocaleLowerCase('pt-BR').startsWith(p));
}

function cadastrarHospede(hospedes, nome, data = new Date()) {
  if (hospedes.length >= CONFIG.MAX_HOSPEDES) return { ok: false, erro: MSG.MAXIMO };
  if (buscarExato(hospedes, nome)) return { ok: false, erro: MSG.DUPLICADO };
  const hospede = { nome, cadastradoEm: data };
  hospedes.push(hospede);
  return { ok: true, hospede };
}

function obterPorIndice(hospedes, indice) {
  const lista = listarOrdenado(hospedes);
  return Number.isInteger(indice) && indice >= 1 && indice <= lista.length ? lista[indice - 1] : null;
}

function atualizarHospede(hospedes, indice, novoNome) {
  const alvo = obterPorIndice(hospedes, indice);
  if (!alvo) return { ok: false, erro: MSG.INDICE_INVALIDO };
  const existente = buscarExato(hospedes, novoNome);
  if (existente && existente !== alvo) return { ok: false, erro: MSG.DUPLICADO };
  alvo.nome = novoNome;
  return { ok: true, hospede: alvo };
}

function removerHospede(hospedes, indice) {
  const alvo = obterPorIndice(hospedes, indice);
  if (!alvo) return { ok: false, erro: MSG.INDICE_INVALIDO };
  hospedes.splice(hospedes.indexOf(alvo), 1);
  return { ok: true, hospede: alvo };
}

// ---------- Fluxo de entrada/saída ----------

function exibirListagem(io, hospedes) {
  const lista = listarOrdenado(hospedes);
  if (lista.length === 0) {
    io.escrever(MSG.LISTA_VAZIA);
    return false;
  }
  io.escrever(`Hóspedes cadastrados (${lista.length}/${CONFIG.MAX_HOSPEDES}):`);
  lista.forEach((h, i) => io.escrever(`[${i + 1}] ${h.nome} — cadastrado em ${formatarDataHora(h.cadastradoEm)}`));
  return true;
}

async function opcaoCadastrar(io, hospedes) {
  if (hospedes.length >= CONFIG.MAX_HOSPEDES) {
    io.escrever(MSG.MAXIMO);
    return;
  }
  const nome = await perguntarTexto(io, 'Nome do hóspede: ', 'O nome do hóspede');
  const r = cadastrarHospede(hospedes, nome);
  io.escrever(r.ok ? 'Hóspede cadastrado com sucesso.' : r.erro);
}

async function opcaoPesquisarExato(io, hospedes) {
  const nome = await perguntarTexto(io, 'Nome exato: ', 'O nome');
  io.escrever(buscarExato(hospedes, nome) ? `Hóspede ${nome} foi encontrado` : MSG.NAO_ENCONTRADO);
}

async function opcaoPesquisarPrefixo(io, hospedes) {
  const prefixo = await perguntarTexto(io, 'Prefixo: ', 'O prefixo');
  const resultados = buscarPorPrefixo(hospedes, prefixo);
  if (resultados.length === 0) {
    io.escrever(MSG.NAO_ENCONTRADO);
    return;
  }
  io.escrever('Resultados:');
  resultados.forEach(({ indice, hospede }) => io.escrever(`[${indice}] ${hospede.nome}`));
}

async function lerIndice(io, hospedes) {
  if (!exibirListagem(io, hospedes)) return null;
  const indice = converterInteiro(await io.perguntar('Índice: '));
  if (!obterPorIndice(hospedes, indice)) {
    io.escrever(MSG.INDICE_INVALIDO);
    return null;
  }
  return indice;
}

async function opcaoAtualizar(io, hospedes) {
  const indice = await lerIndice(io, hospedes);
  if (indice === null) return;
  const novoNome = await perguntarTexto(io, 'Novo nome: ', 'O novo nome');
  const r = atualizarHospede(hospedes, indice, novoNome);
  io.escrever(r.ok ? MSG.SUCESSO : r.erro);
}

async function opcaoRemover(io, hospedes) {
  const indice = await lerIndice(io, hospedes);
  if (indice === null) return;
  const alvo = obterPorIndice(hospedes, indice);
  if (!(await perguntarSimNao(io, `Confirma a remoção de ${alvo.nome}? (S/N): `))) {
    io.escrever('Remoção cancelada.');
    return;
  }
  const r = removerHospede(hospedes, indice);
  io.escrever(r.ok ? MSG.SUCESSO : r.erro);
}

const ACOES = {
  1: opcaoCadastrar,
  2: opcaoPesquisarExato,
  3: opcaoPesquisarPrefixo,
  4: (io, hospedes) => { exibirListagem(io, hospedes); },
  5: opcaoAtualizar,
  6: opcaoRemover,
};
const OPCAO_VOLTAR = 7;

async function executarCadastroHospedes(ctx) {
  const { io, usuario, estado } = ctx;
  io.escrever('');
  io.escrever('[Cadastro de Hóspedes]');
  for (;;) {
    io.escrever('');
    io.escrever('1-Cadastrar 2-Pesquisar exato 3-Pesquisar prefixo 4-Listar 5-Atualizar 6-Remover 7-Voltar');
    const opcao = converterInteiro(await io.perguntar('Opção: '));
    if (opcao === OPCAO_VOLTAR) return;
    const acao = ACOES[opcao];
    if (acao) await acao(io, estado.hospedes);
    else exibirOpcaoInvalida(io, usuario, OPCAO_VOLTAR);
  }
}

module.exports = {
  executarCadastroHospedes,
  MSG,
  listarOrdenado,
  buscarExato,
  buscarPorPrefixo,
  cadastrarHospede,
  atualizarHospede,
  removerHospede,
};
