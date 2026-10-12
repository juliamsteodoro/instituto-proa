function calcularAbastecimento(posto, alcool, gasolina) {
    const combustivel = alcool * 100 <= gasolina * 70 ? 'álcool' : 'gasolina';
    return { posto, combustivel, total: (combustivel === 'álcool' ? alcool : gasolina) * 42, totalAlcool: alcool * 42, totalGasolina: gasolina * 42 };
}
function abastecimento(nomeUsuario) {
    const opcoes = [];
    for (const posto of ['Wayne Oil', 'Stark Petrol']) {
        const alcool = lerNumero(`Preço do álcool no ${posto}:`);
        const gasolina = lerNumero(`Preço da gasolina no ${posto}:`);
        if (!numeroValido(alcool, Number.MIN_VALUE) || !numeroValido(gasolina, Number.MIN_VALUE)) { erro('Valor inválido.'); return; }
        opcoes.push(calcularAbastecimento(posto, alcool, gasolina));
    }
    opcoes.sort((a, b) => a.total - b.total);
    alert('Ranking de abastecimento (42 L):\n' + opcoes.map((opcao, indice) =>
        `${indice + 1}. ${opcao.posto}: melhor opção = ${opcao.combustivel} | Total = ${moeda(opcao.total)}\nÁlcool: ${moeda(opcao.totalAlcool)} | Gasolina: ${moeda(opcao.totalGasolina)}`
    ).join('\n'));
    alert(`${nomeUsuario}, é mais barato abastecer com ${opcoes[0].combustivel} no posto ${opcoes[0].posto}.`);
}
