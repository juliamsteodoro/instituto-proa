let lista_quartos = [];
let receita_hospedagem = 0;

function reserva_quartos(nomeUsuario) {
    let escolha = parseInt(prompt("O que deseja fazer?\n1.) Reservar quarto\n2.) Listar quartos\n3.) Voltar"));
    
    switch (escolha) {
        case 1:
            reservar_quartos(nomeUsuario);
            break;
        case 2:
            listar_quartos(nomeUsuario);
            break;
        case 3:
            inicio(nomeUsuario);
            break;
        default:
            alert("Opção inválida, " + nomeUsuario + ".");
            reserva_quartos(nomeUsuario);
            break;
    }
}

function inicializar_quartos() {
    if (lista_quartos.length === 0) {
        for (let i = 0; i < 20; i++) {
            lista_quartos.push("livre");
        }
    }
}

function reservar_quartos(nomeUsuario) {
    inicializar_quartos();

    let valor_diaria = parseFloat(prompt("Insira o valor da diária:"));
    let nome_hospede = prompt("Insira o nome do hóspede que vai ocupar o espaço:");
    let numero_quarto = parseInt(prompt("Qual o número do quarto? (1 a 20)")) - 1;

    if (numero_quarto >= 0 && numero_quarto < 20) {
        if (lista_quartos[numero_quarto] === "livre") {
            let quantidadeDias = parseInt(prompt("Quantas diárias o hóspede vai ficar?"));
            if (quantidadeDias > 0) {
                let valorTotal = valor_diaria * quantidadeDias;
                lista_quartos[numero_quarto] = nome_hospede;
                receita_hospedagem += valorTotal;
                alert("Reserva efetuada para " + nome_hospede + " no quarto " + (numero_quarto + 1) + ". O valor total foi de R$ " + valorTotal.toFixed(2));
            } else {
                alert("Quantidade de dias inválida.");
            }
        } else {
            alert("Quarto já reservado por " + lista_quartos[numero_quarto] + ".");
        }
    } else {
        alert("Número de quarto inválido. Escolha entre 1 e 20.");
    }
    
    reserva_quartos(nomeUsuario);
}

function listar_quartos(nomeUsuario) {
    inicializar_quartos();

    let relatorioQuartos = "Lista de Quartos:\n";

    for (let i = 0; i < lista_quartos.length; i++) {
        relatorioQuartos += "Quarto " + (i + 1) + ": " + lista_quartos[i] + "\n";
    }

    alert(relatorioQuartos);
    reserva_quartos(nomeUsuario);
}