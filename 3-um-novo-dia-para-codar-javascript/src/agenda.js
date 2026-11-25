'use strict';

/* Exercício 4 — Agenda de Contatos: contatos como objetos { nome, telefone } em um array. */
const { textoObrigatorio, mesmoTexto, normalizarTexto } = require('./utils/texto');
const { perguntarTexto } = require('./utils/entrada');
const { executarSozinho } = require('./utils/executar');

const COMANDOS = Object.freeze(['ADICIONAR', 'BUSCAR', 'REMOVER', 'LISTAR', 'SAIR']);

// ---------- Regras ----------

function buscarContato(contatos, nome) {
  return contatos.find((c) => mesmoTexto(c.nome, nome)) ?? null;
}

function adicionarContato(contatos, nome, telefone) {
  if (buscarContato(contatos, nome)) return { ok: false, erro: 'Contato já cadastrado.' };
  const contato = { nome, telefone };
  contatos.push(contato);
  return { ok: true, contato };
}

function removerContato(contatos, nome) {
  const indice = contatos.findIndex((c) => mesmoTexto(c.nome, nome));
  if (indice === -1) return false;
  contatos.splice(indice, 1);
  return true;
}

/** "adicionar" -> "ADICIONAR"; comando desconhecido -> null. */
function converterComando(texto) {
  const c = normalizarTexto(texto).toUpperCase();
  return COMANDOS.includes(c) ? c : null;
}

// ---------- Fluxo ----------

async function comandoAdicionar(io, contatos) {
  const nome = await perguntarTexto(io, 'Nome: ', 'O nome');
  const telefone = await perguntarTexto(io, 'Telefone: ', 'O telefone');
  const r = adicionarContato(contatos, nome, telefone);
  io.escrever(r.ok ? 'Contato adicionado!' : r.erro);
}

async function comandoBuscar(io, contatos) {
  const contato = buscarContato(contatos, await perguntarTexto(io, 'Nome: ', 'O nome'));
  io.escrever(contato ? `Telefone: ${contato.telefone}` : 'Contato não encontrado');
}

async function comandoRemover(io, contatos) {
  const removido = removerContato(contatos, await perguntarTexto(io, 'Nome: ', 'O nome'));
  io.escrever(removido ? 'Contato removido!' : 'Contato não encontrado');
}

function comandoListar(io, contatos) {
  if (contatos.length === 0) {
    io.escrever('Nenhum contato cadastrado.');
    return;
  }
  io.escrever(`Contatos cadastrados (${contatos.length}):`);
  contatos.forEach((c, i) => io.escrever(`${i + 1}. ${c.nome} — ${c.telefone}`));
}

const ACOES = {
  ADICIONAR: comandoAdicionar,
  BUSCAR: comandoBuscar,
  REMOVER: comandoRemover,
  LISTAR: comandoListar,
};

async function executarAgenda(io) {
  io.escrever('');
  io.escrever('[4 - Agenda de Contatos]');
  const contatos = [];
  let primeiraVez = true;

  for (;;) {
    const mensagem = primeiraVez ? `Digite um comando (${COMANDOS.join(', ')}): ` : 'Digite um comando: ';
    primeiraVez = false;
    const comando = converterComando(textoObrigatorio(await io.perguntar(mensagem)) ?? '');

    if (comando === 'SAIR') {
      io.escrever(`Agenda encerrada. Total de contatos: ${contatos.length}`);
      return;
    }
    if (comando === null) io.escrever(`Comando inválido! Use: ${COMANDOS.join(', ')}.`);
    else await ACOES[comando](io, contatos);
    io.escrever('');
  }
}

if (require.main === module) executarSozinho(executarAgenda);

module.exports = {
  executarAgenda, adicionarContato, buscarContato, removerContato, converterComando, COMANDOS,
};
