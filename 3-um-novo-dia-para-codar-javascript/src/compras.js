'use strict';

/* Exercício 3 — Compras: remove frutas da lista até PARE ou até a lista acabar. */
const { textoObrigatorio, mesmoTexto, ehComando, listaNumerada } = require('./utils/texto');
const { executarSozinho } = require('./utils/executar');

const FRUTAS_INICIAIS = Object.freeze(['Maçã', 'Banana', 'Laranja', 'Uva', 'Manga', 'Abacaxi']);

const MSG = Object.freeze({
  RETIRADA: 'Fruta foi retirada da lista',
  INDISPONIVEL: 'Fruta indisponível no nosso mercado',
  FINALIZADA: 'Lista de compras finalizada',
});

// ---------- Regras ----------

/**
 * Remove a fruta do array (ignorando maiúsculas/minúsculas e acentos).
 * Devolve true se removeu e false se ela não estava na lista.
 */
function removerFruta(frutas, nome) {
  const indice = frutas.findIndex((f) => mesmoTexto(f, nome));
  if (indice === -1) return false;
  frutas.splice(indice, 1);
  return true;
}

function exibirLista(io, frutas) {
  io.escrever('Lista de frutas:');
  io.escrever(listaNumerada(frutas));
}

// ---------- Fluxo ----------

async function executarCompras(io, frutasIniciais = FRUTAS_INICIAIS) {
  io.escrever('');
  io.escrever('[3 - Compras]');
  const frutas = [...frutasIniciais];
  exibirLista(io, frutas);
  io.escrever('Digite o nome de uma fruta para retirá-la da lista. Para encerrar, digite PARE.');

  for (;;) {
    io.escrever('');
    const resposta = await io.perguntar('Fruta: ');

    if (ehComando(resposta, 'PARE')) {
      io.escrever('Frutas restantes:');
      io.escrever(listaNumerada(frutas));
      return;
    }

    const nome = textoObrigatorio(resposta);
    if (nome === null) {
      io.escrever('Digite o nome de uma fruta ou PARE.');
    } else if (removerFruta(frutas, nome)) {
      io.escrever(MSG.RETIRADA);
      if (frutas.length === 0) {
        io.escrever(MSG.FINALIZADA);
        return;
      }
      exibirLista(io, frutas);
    } else {
      io.escrever(MSG.INDISPONIVEL);
    }
  }
}

if (require.main === module) executarSozinho(executarCompras);

module.exports = { executarCompras, removerFruta, FRUTAS_INICIAIS, MSG };
