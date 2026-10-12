function erro(mensagem = 'Opção inválida.') { alert(mensagem); }
function lerTexto(mensagem) {
    while (true) {
        const texto = prompt(mensagem);
        if (texto === null) return null;
        if (texto.trim()) return texto.trim();
        erro('Valor inválido.');
    }
}
function lerNumero(mensagem) {
    const texto = prompt(mensagem);
    return texto === null || !texto.trim() ? NaN : Number(texto.trim().replace(',', '.'));
}
function numeroValido(numero, minimo, maximo = Infinity, inteiro = false) {
    return Number.isFinite(numero) && numero >= minimo && numero <= maximo && (!inteiro || Number.isInteger(numero));
}
function lerOpcao(mensagem, opcoes) {
    while (true) {
        const texto = prompt(mensagem);
        if (texto === null) return null;
        const opcao = texto.trim().toUpperCase();
        if (opcoes.includes(opcao)) return opcao;
        erro();
    }
}
function moeda(valor) { return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); }
