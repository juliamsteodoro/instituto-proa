function inicio(nomeUsuario, estado) {
    while (true) {
        const opcao = lerNumero('Selecione uma opção:\n1. Reservas de Quartos\n2. Cadastro de Hóspedes\n3. Eventos\n4. Ar-Condicionado\n5. Abastecimento\n6. Relatórios Operacionais\n7. Sair');
        switch (opcao) {
            case 1: reserva_quartos(nomeUsuario, estado); break;
            case 2: menu_hospedes(estado); break;
            case 3: eventos(estado); break;
            case 4: ar_condicionado(nomeUsuario); break;
            case 5: abastecimento(nomeUsuario); break;
            case 6: relatorios(estado); break;
            case 7: alert(`Muito obrigado e até logo, ${nomeUsuario}.`); return;
            default: erro();
        }
    }
}
