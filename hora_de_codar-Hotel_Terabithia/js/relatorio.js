function calcularRelatorio(estado) {
    const ocupados = estado.quartos.filter(quarto => quarto !== null).length;
    const hospedagem = estado.reservas.reduce((total, reserva) => total + reserva.total, 0);
    const eventos = estado.eventos.reduce((total, evento) => total + evento.total, 0);
    return { reservas: estado.reservas.length, ocupacao: ocupados / 20, hospedes: estado.hospedes.length, eventosConfirmados: estado.eventos.length, hospedagem, eventos, total: hospedagem + eventos };
}
function relatorios(estado) {
    const dados = calcularRelatorio(estado);
    const linhas = [
        ['Reservas confirmadas', dados.reservas],
        ['Taxa de ocupação', (dados.ocupacao * 100).toLocaleString('pt-BR') + '%'],
        ['Hóspedes cadastrados', dados.hospedes],
        ['Eventos confirmados', dados.eventosConfirmados],
        ['Receita hospedagem', moeda(dados.hospedagem)],
        ['Receita eventos', moeda(dados.eventos)],
        ['Receita total', moeda(dados.total)]
    ];
    alert('RELATÓRIO OPERACIONAL\n' + linhas.map(([rotulo, valor]) => rotulo.padEnd(24) + ' | ' + valor).join('\n'));
}
