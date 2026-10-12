function calcularOrcamento(valor, quantidade, percentual, minimo, deslocamento) {
    const bruto = valor * quantidade;
    const desconto = quantidade >= minimo ? bruto * percentual / 100 : 0;
    return bruto - desconto + deslocamento;
}
function exibirOrcamento(orcamento) {
    alert(`O serviço de ${orcamento.empresa} custará ${moeda(orcamento.total)}`);
}
function ar_condicionado(nomeUsuario) {
    const orcamentos = [];
    while (true) {
        const empresa = lerTexto('Nome da empresa:');
        if (empresa === null) return;
        const valor = lerNumero('Valor por aparelho:');
        const quantidade = lerNumero('Quantidade de aparelhos:');
        const percentual = lerNumero('Percentual de desconto (0-100):');
        const minimo = lerNumero('Quantidade mínima para desconto:');
        const deslocamento = lerNumero('Valor fixo de deslocamento:');
        if (!numeroValido(valor, 0) || !numeroValido(quantidade, 1, Infinity, true) || !numeroValido(percentual, 0, 100) || !numeroValido(minimo, 0, Infinity, true) || !numeroValido(deslocamento, 0)) {
            erro('Valor inválido.');
            continue;
        }
        const orcamento = { empresa, total: calcularOrcamento(valor, quantidade, percentual, minimo, deslocamento) };
        orcamentos.push(orcamento);
        exibirOrcamento(orcamento);
        if (lerOpcao(`Deseja informar novos dados, ${nomeUsuario}? (S/N):`, ['S', 'N']) !== 'S') break;
    }
    orcamentos.sort((a, b) => a.total - b.total);
    const menor = orcamentos[0];
    const maior = orcamentos[orcamentos.length - 1];
    const diferenca = menor.total === 0 ? (maior.total === 0 ? '0,00%' : 'Não calculável (menor orçamento igual a zero)') : ((maior.total - menor.total) / menor.total * 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%';
    alert(`O orçamento de menor valor é o de ${menor.empresa} por ${moeda(menor.total)}\nMaior orçamento: ${maior.empresa} por ${moeda(maior.total)}\nDiferença percentual: ${diferenca}`);
}
