const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const raiz = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(raiz, 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script src="([^"]+)"/g)].map(item => item[1]);
let entradas = [];
let mensagens = [];
const contexto = vm.createContext({
    prompt() { assert.ok(entradas.length, 'Solicitação inesperada de entrada'); return entradas.shift(); },
    alert(mensagem) { mensagens.push(mensagem); }
});
function executar(codigo, respostas = []) {
    entradas = respostas;
    mensagens = [];
    const resultado = vm.runInContext(codigo, contexto, { timeout: 1000 });
    assert.equal(entradas.length, 0, 'Entradas não consumidas');
    return resultado;
}
function teste(nome, verificacao) { verificacao(); console.log('OK — ' + nome); }
function novoEstado() {
    executar('estado = { quartos: Array(20).fill(null), reservas: [], hospedes: [], eventos: [] }');
}
// Carrega os mesmos scripts do HTML e executa autenticação e menu inicial.
entradas = ['Ana', '2678', '7'];
for (const script of scripts) {
    vm.runInContext(fs.readFileSync(path.join(raiz, script), 'utf8'), contexto, { filename: script, timeout: 1000 });
}
assert.equal(entradas.length, 0);
assert.ok(mensagens.includes('Muito obrigado e até logo, Ana.'));
console.log('OK — scripts do HTML, login válido e saída');

teste('bloqueio após três senhas incorretas', () => {
    executar('autenticar()', ['Ana', '0', '1', '2']);
    assert.ok(mensagens.includes('Sistema bloqueado.'));
});
teste('opção inválida retorna ao menu pela função de erro', () => {
    executar('inicio("Ana", { quartos: Array(20).fill(null), reservas: [], hospedes: [], eventos: [] })', ['9', '7']);
    assert.ok(mensagens.includes('Opção inválida.'));
});
teste('reserva executiva, taxa de serviço e mapa 4x5', () => {
    novoEstado();
    executar('reserva_quartos("Ana", estado)', ['200', '3', 'Carla Souza', 'E', '7', 'S']);
    assert.equal(executar('estado.reservas[0].total'), 891);
    assert.equal(executar('estado.quartos[6].hospede'), 'Carla Souza');
    const mapa = executar('mapaQuartos(estado.quartos)').split('\n').slice(1);
    assert.equal(mapa.length, 4);
    assert.ok(mapa.every(linha => linha.split(' | ').length === 5));
});
teste('quarto ocupado oferece quartos livres e nova escolha', () => {
    executar('reserva_quartos("Ana", estado)', ['100', '1', 'João Silva', 'S', '7', '8', 'S']);
    assert.ok(mensagens.some(texto => texto.includes('Quarto já está ocupado\nQuartos livres:')));
    assert.equal(executar('estado.reservas.length'), 2);
});
teste('reserva recusada não ocupa quarto nem gera receita', () => {
    executar('reserva_quartos("Ana", estado)', ['100', '1', 'Maria Silva', 'L', '9', 'N']);
    assert.equal(executar('estado.quartos[8]'), null);
    assert.equal(executar('estado.reservas.length'), 2);
});
teste('diária zero, negativa, inválida e mais de 30 dias são rejeitados', () => {
    for (const valores of [['0', '1'], ['-10', '1'], ['abc', '1'], ['100', '31'], ['100', '1.5']]) {
        executar('reserva_quartos("Ana", estado)', valores);
        assert.ok(mensagens.includes('Valor inválido, Ana'));
    }
});
teste('cadastro, duplicidade, prefixo e ordem alfabética', () => {
    novoEstado();
    executar('cadastrar_hospede(estado)', ['Rosani Albuquerque']);
    executar('cadastrar_hospede(estado)', ['Ana Silva']);
    executar('cadastrar_hospede(estado)', ['Rosani Albuquerque']);
    assert.ok(mensagens.includes('Hóspede já cadastrado'));
    assert.equal(executar('estado.hospedes.length'), 2);
    assert.equal(executar('hospedesOrdenados(estado)[0].nome'), 'Ana Silva');
    executar('pesquisar_hospedes(estado, true)', ['Ro']);
    assert.ok(mensagens[0].includes('Rosani Albuquerque'));
    assert.ok(!mensagens[0].includes('Ana Silva'));
    executar('pesquisar_hospedes(estado, false)', ['Ana Silva']);
    assert.ok(mensagens[0].includes('foi encontrado'));
});
teste('atualização e remoção usam índice da listagem ordenada', () => {
    executar('alterar_hospede(estado, false)', ['1', 'Beatriz Silva']);
    assert.equal(executar('hospedesOrdenados(estado)[0].nome'), 'Beatriz Silva');
    executar('alterar_hospede(estado, false)', ['1', 'Rosani Albuquerque']);
    assert.ok(mensagens.includes('Hóspede já cadastrado'));
    executar('alterar_hospede(estado, true)', ['2']);
    assert.equal(executar('estado.hospedes.length'), 1);
    assert.equal(executar('estado.hospedes[0].nome'), 'Beatriz Silva');
});
teste('máximo de 15 hóspedes ativos', () => {
    novoEstado();
    for (let i = 1; i <= 15; i++) executar('cadastrar_hospede(estado)', ['Hóspede ' + i]);
    executar('cadastrar_hospede(estado)');
    assert.ok(mensagens.includes('Máximo de cadastros atingido'));
    assert.equal(executar('estado.hospedes.length'), 15);
});
teste('auditórios, garçons e buffet conforme fórmulas do README', () => {
    assert.equal(executar('calcularEvento(192, 8).cadeiras'), 42);
    assert.equal(executar('calcularEvento(192, 8).garcons'), 20);
    assert.equal(executar('calcularEvento(192, 8).custoGarcons'), 1680);
    assert.equal(executar('calcularEvento(192, 8).agua'), 96);
    assert.equal(executar('calcularEvento(192, 8).salgados'), 1344);
    assert.ok(Math.abs(executar('calcularEvento(192, 8).custoBuffet') - 526.08) < 0.000001);
    assert.equal(executar('calcularEvento(220, 1).auditorio'), 'Laranja');
    assert.equal(executar('calcularEvento(221, 1).auditorio'), 'Colorado');
});
teste('janelas de agenda, hora inteira e duração', () => {
    assert.equal(executar('horarioDisponivel("segunda", 22, 1)'), true);
    assert.equal(executar('horarioDisponivel("segunda", 22, 2)'), false);
    assert.equal(executar('horarioDisponivel("sabado", 14, 1)'), true);
    assert.equal(executar('horarioDisponivel("domingo", 14, 2)'), false);
    assert.equal(executar('horarioDisponivel("segunda", 7.5, 1)'), false);
    assert.equal(executar('horarioDisponivel("segunda", 7, 13)'), false);
});
teste('eventos só entram na agenda e receita após confirmação', () => {
    novoEstado();
    const respostas = ['192', 'segunda', '12/10/2026', '13', '8', 'Lojas Transilvânia'];
    executar('eventos(estado)', [...respostas, 'N']);
    assert.equal(executar('estado.eventos.length'), 0);
    executar('eventos(estado)', [...respostas, 'S']);
    assert.equal(executar('estado.eventos.length'), 1);
    assert.ok(Math.abs(executar('estado.eventos[0].total') - 2206.08) < 0.000001);
    for (const convidados of ['-1', '351', 'abc']) {
        executar('eventos(estado)', [convidados]);
        assert.ok(mensagens[0].includes('Número de convidados inválido'));
    }
});
teste('desconto no limite mínimo, deslocamento e comparação de propostas', () => {
    assert.equal(executar('calcularOrcamento(120, 10, 8, 8, 150)'), 1254);
    assert.equal(executar('calcularOrcamento(100, 8, 10, 8, 50)'), 770);
    assert.equal(executar('calcularOrcamento(100, 7, 10, 8, 50)'), 750);
    executar('ar_condicionado("Ana")', ['Clima Forte', '120', '10', '8', '8', '150', 'S', 'Clima Sul', '150', '10', '0', '8', '0', 'N']);
    assert.ok(mensagens.at(-1).includes('Clima Forte'));
    assert.ok(mensagens.at(-1).includes('Clima Sul'));
    assert.ok(mensagens.at(-1).includes('19,62%'));
});
teste('etanol no limite de 70%, tanque de 42 L e ranking', () => {
    assert.equal(executar('calcularAbastecimento("Wayne Oil", 4.2, 6).combustivel'), 'álcool');
    executar('abastecimento("Ana")', ['4,20', '5,82', '4,35', '6,17']);
    assert.ok(mensagens[0].includes('1. Wayne Oil'));
    assert.ok(mensagens[0].includes('244,44'));
    assert.ok(mensagens.at(-1).includes('gasolina no posto Wayne Oil'));
});
teste('relatório consolida apenas reservas e eventos confirmados', () => {
    executar('reserva_quartos("Ana", estado)', ['200', '3', 'Carla Souza', 'E', '7', 'S']);
    executar('cadastrar_hospede(estado)', ['Carla Souza']);
    assert.equal(executar('calcularRelatorio(estado).reservas'), 1);
    assert.equal(executar('calcularRelatorio(estado).ocupacao'), 0.05);
    assert.equal(executar('calcularRelatorio(estado).hospedes'), 1);
    assert.equal(executar('calcularRelatorio(estado).eventosConfirmados'), 1);
    assert.ok(Math.abs(executar('calcularRelatorio(estado).total') - 3097.08) < 0.000001);
    executar('relatorios(estado)');
    assert.ok(mensagens[0].includes('3.097,08'));
});
teste('cancelamento de entrada e confirmação inválida são tratados', () => {
    executar('reserva_quartos("Ana", estado)', [null, null]);
    assert.ok(mensagens[0].includes('Valor inválido'));
    executar('lerOpcao("Confirmar?", ["S", "N"])', ['X', 'N']);
    assert.ok(mensagens.includes('Opção inválida.'));
});
console.log('Todos os 17 cenários passaram. Interação simulada com prompt/alert; sem teste visual de navegador.');
