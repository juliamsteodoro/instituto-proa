function calcularEvento(convidados, duracao) {
    const auditorio = convidados <= 220 ? 'Laranja' : 'Colorado';
    const cadeiras = auditorio === 'Laranja' ? Math.max(0, convidados - 150) : 0;
    const garcons = Math.ceil(convidados / 12) + Math.floor(duracao / 2);
    const custoGarcons = garcons * duracao * 10.50;
    const cafe = convidados * 0.2;
    const agua = convidados * 0.5;
    const salgados = convidados * 7;
    const custoBuffet = cafe * 0.80 + agua * 0.40 + salgados / 100 * 34;
    return { auditorio, cadeiras, garcons, custoGarcons, cafe, agua, salgados, custoBuffet, total: custoGarcons + custoBuffet };
}
function horarioDisponivel(dia, inicio, duracao) {
    const dias = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'];
    const fechamento = dia === 'sabado' || dia === 'domingo' ? 15 : 23;
    return dias.includes(dia) && numeroValido(inicio, 7, 23, true) && numeroValido(duracao, 1, 12) && inicio + duracao <= fechamento;
}
function eventos(estado) {
    const convidados = lerNumero('Convidados:');
    if (!numeroValido(convidados, 0, 350, true)) {
        erro(convidados > 350 ? 'Capacidade excedida. Número de convidados inválido' : 'Número de convidados inválido');
        return;
    }
    const selecao = calcularEvento(convidados, 0);
    alert(`Auditório selecionado: ${selecao.auditorio} (${selecao.cadeiras} cadeiras adicionais)`);
    const dia = lerTexto('Dia da semana (sem acentos, em minúsculas):');
    if (dia === null) return;
    // A data integra o relatório técnico exigido no enunciado.
    const dataTexto = lerTexto('Data do evento (DD/MM/AAAA):');
    if (dataTexto === null) return;
    const partes = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(dataTexto);
    const data = partes ? new Date(Number(partes[3]), Number(partes[2]) - 1, Number(partes[1])) : null;
    if (!data || data.getFullYear() !== Number(partes[3]) || data.getMonth() !== Number(partes[2]) - 1 || data.getDate() !== Number(partes[1])) {
        erro('Data inválida.');
        return;
    }
    const horaInicio = lerNumero('Hora inicial (inteiro):');
    const duracao = lerNumero('Duração (1 a 12 horas):');
    if (!horarioDisponivel(dia, horaInicio, duracao)) {
        erro('Auditório indisponível. Verifique o dia, o horário e a duração.');
        return;
    }
    alert('Auditório disponível.');
    const empresa = lerTexto('Nome da empresa:');
    if (empresa === null) return;
    const custos = calcularEvento(convidados, duracao);
    const evento = { ...custos, empresa, data: dataTexto, dia, horaInicio, horaFim: horaInicio + duracao, convidados, duracao };
    alert(`Relatório do evento:\nAuditório: ${evento.auditorio}\nEmpresa: ${empresa}\nData: ${dataTexto} (${dia})\nHorário: ${horaInicio}h–${evento.horaFim}h\nConvidados: ${convidados}\nGarçons: ${evento.garcons}\nDuração: ${duracao}h\nCusto garçons: ${moeda(evento.custoGarcons)}\nCafé: ${evento.cafe.toLocaleString('pt-BR')} L\nÁgua: ${evento.agua.toLocaleString('pt-BR')} L\nSalgados: ${evento.salgados} un\nCusto buffet: ${moeda(evento.custoBuffet)}\nTotal geral: ${moeda(evento.total)}`);
    if (lerOpcao('Confirmar reserva? (S/N):', ['S', 'N']) === 'S') {
        estado.eventos.push(evento);
        alert(`Auditório reservado para ${empresa}: ${dia} às ${horaInicio}hs`);
        alert('Reserva efetuada com sucesso.');
    } else { alert('Reserva não efetuada.'); }
}
