'use strict';

const { CONFIG } = require('./config');
const { perguntarTexto } = require('./utils/entrada');

/** Regra de negócio: a senha confere? */
function senhaCorreta(senha) {
  return String(senha ?? '').trim() === CONFIG.SENHA;
}

/**
 * Fluxo de login. Devolve o nome do usuário autenticado ou null
 * quando as tentativas de senha se esgotam.
 */
async function autenticar(io) {
  const hotel = CONFIG.NOME_HOTEL;
  io.escrever(`Bem-vindo ao Hotel ${hotel}`);
  io.escrever('');

  const nome = await perguntarTexto(io, 'Informe seu nome: ', 'O nome');

  for (let tentativa = 1; tentativa <= CONFIG.MAX_TENTATIVAS_SENHA; tentativa += 1) {
    const senha = await io.perguntar('Informe a senha: ', { oculto: true });
    if (senhaCorreta(senha)) {
      io.escrever('');
      io.escrever(`Bem-vindo ao Hotel ${hotel}, ${nome}. É um imenso prazer ter você por aqui!`);
      return nome;
    }
    const restantes = CONFIG.MAX_TENTATIVAS_SENHA - tentativa;
    if (restantes > 0) io.escrever(`Senha incorreta. Tentativas restantes: ${restantes}.`);
  }

  io.escrever('Número máximo de tentativas excedido. Acesso bloqueado. O sistema será encerrado.');
  return null;
}

module.exports = { autenticar, senhaCorreta };
