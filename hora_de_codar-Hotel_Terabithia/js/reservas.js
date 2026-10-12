function calcularReserva(diaria, diarias, fator) {
    const subtotal = diaria * diarias * fator;
    const taxa = subtotal * 0.10;
    return { subtotal, taxa, total: subtotal + taxa };
}
function mapaQuartos(quartos) {
    const linhas = [];
    for (let linha = 0; linha < 4; linha++) {
        linhas.push(quartos.slice(linha * 5, linha * 5 + 5).map((quarto, coluna) =>
            `${String(linha * 5 + coluna + 1).padStart(2, '0')}: ${quarto === null ? 'L' : 'O'}`
        ).join(' | '));
    }
    return 'Mapa de quartos (L = livre; O = ocupado)\n' + linhas.join('\n');
}
function reserva_quartos(nomeUsuario, estado) {
    const diaria = lerNumero('Informe o valor da diária:');
    const diarias = lerNumero('Informe a quantidade de diárias (1-30):');
    if (!numeroValido(diaria, Number.MIN_VALUE) || !numeroValido(diarias, 1, 30, true)) {
        erro(`Valor inválido, ${nomeUsuario}`);
        return;
    }
    const hospede = lerTexto('Informe o nome completo do hóspede:');
    if (hospede === null) return;
    const tipo = lerOpcao('Tipo de quarto (S/E/L):', ['S', 'E', 'L']);
    if (tipo === null) return;
    const tipos = { S: { nome: 'Standard', fator: 1 }, E: { nome: 'Executivo', fator: 1.35 }, L: { nome: 'Luxo', fator: 1.65 } };
    let quarto;
    while (true) {
        const livres = estado.quartos.map((ocupante, indice) => ocupante === null ? indice + 1 : null).filter(numero => numero !== null);
        if (!livres.length) { alert('Não há quartos livres.'); return; }
        quarto = lerNumero('Escolha um quarto (1-20):');
        if (!numeroValido(quarto, 1, 20, true)) { erro(`Valor inválido, ${nomeUsuario}`); return; }
        if (estado.quartos[quarto - 1] === null) break;
        alert('Quarto já está ocupado\nQuartos livres: ' + livres.join(', '));
    }
    const valores = calcularReserva(diaria, diarias, tipos[tipo].fator);
    alert(`Resumo:\nHóspede: ${hospede}\nQuarto: ${quarto} (${tipos[tipo].nome})\nSubtotal: ${moeda(valores.subtotal)}\nTaxa de serviço (10%): ${moeda(valores.taxa)}\nTotal: ${moeda(valores.total)}`);
    if (lerOpcao(`${nomeUsuario}, confirma a reserva? (S/N):`, ['S', 'N']) === 'S') {
        const reserva = { hospede, quarto, diarias, total: valores.total };
        estado.quartos[quarto - 1] = reserva;
        estado.reservas.push(reserva);
        alert('Reserva efetuada com sucesso.');
    } else { alert('Reserva não efetuada.'); }
    alert(mapaQuartos(estado.quartos));
}
