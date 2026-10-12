function hospedesOrdenados(estado) {
    return [...estado.hospedes].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
}
function exibirHospedes(hospedes) {
    if (!hospedes.length) { alert('Hóspede não encontrado'); return; }
    alert(hospedes.map((hospede, indice) => `[${indice + 1}] ${hospede.nome} — ${hospede.cadastradoEm.toLocaleString('pt-BR')}`).join('\n'));
}
function cadastrar_hospede(estado) {
    if (estado.hospedes.length >= 15) { alert('Máximo de cadastros atingido'); return; }
    const nome = lerTexto('Nome do hóspede:');
    if (nome === null) return;
    if (estado.hospedes.some(hospede => hospede.nome === nome)) { alert('Hóspede já cadastrado'); return; }
    estado.hospedes.push({ nome, cadastradoEm: new Date() });
    alert('Operação realizada com sucesso');
}
function pesquisar_hospedes(estado, porPrefixo) {
    const texto = lerTexto(porPrefixo ? 'Prefixo:' : 'Nome exato:');
    if (texto === null) return;
    const encontrados = hospedesOrdenados(estado).filter(hospede => porPrefixo ? hospede.nome.startsWith(texto) : hospede.nome === texto);
    if (!porPrefixo && encontrados.length) alert(`Hóspede ${texto} foi encontrado`);
    else exibirHospedes(encontrados);
}
function alterar_hospede(estado, remover) {
    const ordenados = hospedesOrdenados(estado);
    exibirHospedes(ordenados);
    if (!ordenados.length) return;
    const indice = lerNumero('Informe o índice da listagem:');
    if (!numeroValido(indice, 1, ordenados.length, true)) { erro('Índice inválido.'); return; }
    const hospede = ordenados[indice - 1];
    if (remover) { estado.hospedes.splice(estado.hospedes.indexOf(hospede), 1); }
    else {
        const nome = lerTexto('Informe o novo nome:');
        if (nome === null) return;
        if (estado.hospedes.some(outro => outro !== hospede && outro.nome === nome)) { alert('Hóspede já cadastrado'); return; }
        hospede.nome = nome;
    }
    alert('Operação realizada com sucesso');
}
function menu_hospedes(estado) {
    while (true) {
        const opcao = lerNumero('[Cadastro de Hóspedes]\n1. Cadastrar\n2. Pesquisar por nome exato\n3. Pesquisar por prefixo\n4. Listar ordenado (A-Z)\n5. Atualizar cadastro\n6. Remover cadastro\n7. Voltar');
        switch (opcao) {
            case 1: cadastrar_hospede(estado); break;
            case 2: pesquisar_hospedes(estado, false); break;
            case 3: pesquisar_hospedes(estado, true); break;
            case 4: exibirHospedes(hospedesOrdenados(estado)); break;
            case 5: alterar_hospede(estado, false); break;
            case 6: alterar_hospede(estado, true); break;
            case 7: return;
            default: erro();
        }
    }
}
