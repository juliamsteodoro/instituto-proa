'use strict';

/* Exercício 1 — Estudantes: cadastro sem limite até o usuário digitar PARE. */
const { textoObrigatorio, ehComando, listaNumerada } = require('./utils/texto');
const { executarSozinho } = require('./utils/executar');

// ---------- Regras (sem entrada/saída) ----------

/** Adiciona o estudante ao array e devolve a nova quantidade. */
function cadastrarEstudante(estudantes, nome) {
  estudantes.push(nome);
  return estudantes.length;
}

function montarResumo(estudantes) {
  if (estudantes.length === 0) return 'Nenhum estudante cadastrado.';
  return `Quantidade de estudantes cadastrados: ${estudantes.length}\n`
    + `Lista de estudantes:\n${listaNumerada(estudantes)}`;
}

// ---------- Fluxo ----------

async function executarEstudantes(io) {
  io.escrever('');
  io.escrever('[1 - Estudantes]');
  io.escrever('Digite o nome de cada estudante. Para encerrar, digite PARE.');

  const estudantes = [];
  for (;;) {
    const resposta = await io.perguntar(`Nome do estudante ${estudantes.length + 1}: `);
    if (ehComando(resposta, 'PARE')) break;

    const nome = textoObrigatorio(resposta);
    if (nome === null) {
      io.escrever('O nome não pode ficar em branco.');
      continue;
    }
    cadastrarEstudante(estudantes, nome);
    io.escrever(`Estudante ${nome} cadastrado.`);
  }

  io.escrever('');
  io.escrever(montarResumo(estudantes));
}

if (require.main === module) executarSozinho(executarEstudantes);

module.exports = { executarEstudantes, cadastrarEstudante, montarResumo };
