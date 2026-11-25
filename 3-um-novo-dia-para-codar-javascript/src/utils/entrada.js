'use strict';

const readline = require('readline');
const { normalizarTexto, textoObrigatorio } = require('./texto');

/** Lançado quando a entrada padrão termina (ex.: fim de um arquivo de testes). */
class EntradaEncerradaError extends Error {
  constructor() {
    super('Entrada de dados encerrada.');
    this.name = 'EntradaEncerradaError';
  }
}

/**
 * Camada de entrada/saída do terminal.
 * Usa uma fila de linhas para funcionar tanto digitando quanto com entrada
 * redirecionada de arquivo (útil para gerar evidências de teste).
 */
class Terminal {
  constructor({ input = process.stdin, output = process.stdout, ecoar } = {}) {
    this.output = output;
    // Quando a entrada não é um terminal (arquivo/pipe), ecoa as respostas no log.
    this.ecoar = ecoar !== undefined ? ecoar : !input.isTTY;
    this.fila = [];
    this.pendente = null;
    this.encerrado = false;

    this.rl = readline.createInterface({ input, terminal: false });
    this.rl.on('line', (linha) => {
      const texto = linha.replace(/\r$/, '');
      if (this.pendente) {
        const { resolver } = this.pendente;
        this.pendente = null;
        resolver(texto);
      } else {
        this.fila.push(texto);
      }
    });
    this.rl.on('close', () => {
      this.encerrado = true;
      if (this.pendente) {
        const { rejeitar } = this.pendente;
        this.pendente = null;
        rejeitar(new EntradaEncerradaError());
      }
    });
  }

  escrever(texto = '') {
    this.output.write(`${texto}\n`);
  }

  /** Exibe a mensagem e aguarda uma linha. `oculto` mascara o eco (senha). */
  async perguntar(mensagem, { oculto = false } = {}) {
    this.output.write(mensagem);
    const resposta = await this.lerLinha();
    if (this.ecoar) this.output.write(`${oculto ? '*'.repeat(resposta.length) : resposta}\n`);
    return resposta;
  }

  lerLinha() {
    if (this.fila.length > 0) return Promise.resolve(this.fila.shift());
    if (this.encerrado) return Promise.reject(new EntradaEncerradaError());
    return new Promise((resolver, rejeitar) => {
      this.pendente = { resolver, rejeitar };
    });
  }

  fechar() {
    this.rl.close();
  }
}

/**
 * Pergunta repetidamente até que `converter` devolva um valor diferente de null.
 * Reaproveitado por todos os módulos para validar entradas.
 */
async function perguntarValidado(io, mensagem, converter, mensagemErro) {
  for (;;) {
    const valor = converter(await io.perguntar(mensagem));
    if (valor !== null && valor !== undefined) return valor;
    io.escrever(mensagemErro);
  }
}

function perguntarTexto(io, mensagem, campo) {
  return perguntarValidado(io, mensagem, textoObrigatorio, `${campo} não pode ficar em branco.`);
}

function converterSimNao(texto) {
  const t = normalizarTexto(texto);
  if (t === 's' || t === 'sim') return true;
  if (t === 'n' || t === 'nao') return false;
  return null;
}

function perguntarSimNao(io, mensagem) {
  return perguntarValidado(io, mensagem, converterSimNao, 'Resposta inválida. Digite S ou N.');
}

module.exports = {
  Terminal,
  EntradaEncerradaError,
  perguntarValidado,
  perguntarTexto,
  perguntarSimNao,
  converterSimNao,
};
