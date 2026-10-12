let lista_hospedes = [];

function menu_hospedes(nomeUsuario) {
    let escolha = parseInt(prompt("Escolha uma opção:\n 1.) Cadastrar hóspede\n 2.) Pesquisar hóspede por nome\n 3.) Pesquisar hóspede por prefixo\n 4.) Listar ordenado (A-Z)\n 5.) Atualizar cadastro\n 6.) Remover cadastro\n 7.) Voltar"));
    
    switch (escolha) { 
        case 1:
            cadastrar_hospede(nomeUsuario);
            break;
        case 2:
            pesquisar_nome(nomeUsuario);
            break;
        case 3:
            pesquisar_prefixo(nomeUsuario);
            break;
        case 4:
            listar_hospedes(nomeUsuario);
            break;
        case 5:
            atualizar_cadastro(nomeUsuario);
            break;
        case 6:
            remover_cadastro(nomeUsuario);
            break;
        case 7:
            inicio(nomeUsuario);
            break;
        default:
            alert("Opção inválida, " + nomeUsuario + ".");
            menu_hospedes(nomeUsuario);
            break;
    }
}

function cadastrar_hospede(nomeUsuario){
    let nomeHospede;
    if (lista_hospedes.length >= 15){
        alert("Máximo de cadastros atingido");
    } else{
        nomeHospede = prompt("Nome do hóspede:");
        if (lista_hospedes.includes(nomeHospede)){
            alert("Hóspede já cadastrado");
        } else {
            lista_hospedes.push(nomeHospede);
            alert("Hóspede cadastrado com sucesso.")
        }
    }
    menu_hospedes(nomeUsuario);
}

function pesquisar_nome(nomeUsuario){
    let nome = prompt("Insira o nome:")
    if(lista_hospedes.includes(nome)){
        alert("Hospede " + nome + " foi encontrado")
    }else {
        alert("Hóspede não encontrado.")
    }
    menu_hospedes(nomeUsuario);
}

function pesquisar_prefixo(nomeUsuario){
    let prefixo = prompt("Digite o prefixo para pesquisa:");

    let resultadosEncontrados = "Resultados\n";

    for(let i = 0; i < lista_hospedes.length; i++){
        let nomeAtual = lista_hospedes[i];

        if(nomeAtual.startsWith(prefixo)){
            resultadosEncontrados += "[" + i + "] " + nomeAtual + "\n";
        }
    }
    alert(resultadosEncontrados);
    menu_hospedes(nomeUsuario);
}

function lista_hospedes(nomeUsuario){
    lista_hospedes.sort();
    let listaTexto = "Hóspedes cadastrados\n";
    for (let i = 0; i < lista_hospedes.length; i++){
        let nomeAtual = lista_hospedes[i];
        listaTexto += "[" + i + "] " + nomeAtual + "\n"

    }
    alert(listaTexto);
    menu_hospedes(nomeUsuario);
}

function atualizar_cadastro(nomeUsuario){
    let nomeAntigo = prompt("Qual o nome do hóspede que deseja atualizar?");
    let indice = lista_hospedes.indexOf(nomeAntigo);

    if (indice !== -1){
        let nomeNovo = prompt("Informe o novo nome:")
        lista_hospedes[indice] = nomeNovo;
        alert("Cadastrado atualizado com sucesso.")
    } else {
        alert("Hóspede não encontrado.")
    }
    menu_hospedes(nomeUsuario);
}

function remover_cadastro(nomeUsuario){
    let nomeRemover = prompt("Qual o nome dos hóspede que deseja remover?");
    let indice = lista_hospedes.indexOf(nomeRemover);

    if(indice !== -1){
        lista_hospedes.splice(indice, 1);
        alert("Hóspede removido com sucesso.");
    } else{
        alert("Hóspede não encontado.")
    }
    menu_hospedes(nomeUsuario);
}