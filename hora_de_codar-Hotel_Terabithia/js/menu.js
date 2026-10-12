function inicio(nomeUsuario){
	let escolha = parseInt(prompt('Selecione uma opção:\n 1.) Reserva de Quartos\n 2.) Cadastro de Hóspedes\n 3.) Eventos\n 4.) Ar-Condicionado\n 5.) Abastecimento\n 6.) Relatórios Operacionais\n 7.) Sair\n'));
    switch (escolha) {
        case 1:
            reserva_quartos(nomeUsuario);
            break;
        case 2:
            menu_hospedes(nomeUsuario)
            break;
        case 3:
            eventos(nomeUsuario)
            break;
        case 4:
            ar_condicionado(nomeUsuario)
            break;
        case 5:
            abastecimento(nomeUsuario)
            break;
        case 6:
            relatorios(nomeUsuario)
            break;
        case 7:
            alert("Muito obrigado e até logo," + nomeUsuario)
            break;
        default:
            erro(nomeUsuario); 
            break;
    }
}

function erro(nomeUsuario){
	alert('Por favor, informe um número entre 1 e 7');
    inicio(nomeUsuario);
}