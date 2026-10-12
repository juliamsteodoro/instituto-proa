function relatorios(nomeUsuario) {
    let quartos_ocupados = 0;
    for (let i = 0; i < lista_quartos.length; i++) {
        if (lista_quartos[i] !== "livre") {
            quartos_ocupados++;
        }
    }
    let taxa_ocupacao = (quartos_ocupados / 20) * 100;
    let total_hospedes = lista_hospedes.length;
    let receita_total = receita_hospedagem + receita_eventos;

    let painel = "================================\n";
    painel += "     RELATÓRIO OPERACIONAL      \n";
    painel += "================================\n";
    painel += "Total de reservas (quartos ocupados): " + quartos_ocupados + "\n";
    painel += "Taxa de ocupação: " + taxa_ocupacao.toFixed(0) + "%\n";
    painel += "Hóspedes cadastrados: " + total_hospedes + "\n";
    painel += "Eventos confirmados: " + total_eventos + "\n";
    painel += "--------------------------------\n";
    painel += "Receita Hospedagem: R$ " + receita_hospedagem.toFixed(2) + "\n";
    painel += "Receita Eventos: R$ " + receita_eventos.toFixed(2) + "\n";
    painel += "Receita Total: R$ " + receita_total.toFixed(2) + "\n";
    painel += "================================\n";

    alert(painel);
    inicio(nomeUsuario);
    }