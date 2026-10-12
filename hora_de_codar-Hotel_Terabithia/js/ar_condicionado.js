function ar_condicionado(nomeUsuario){
    let continuar = "S";

    let menorValor = Infinity;
    let nomeMenor = "";

    let maiorValor = 0; 
    let nomeMaior = "";

    while (continuar.toUpperCase() === "S"){
    let nomeEmpresa = prompt("Qual o nome da empresa?");
    let valorAparelho = parseFloat(prompt("Qual o valor por aparelho?"));
    let quantidadeAparelhos = parseInt(prompt("Qual a quantidade de aparelhos?"));
    let percentualDesconto = parseFloat(prompt("Qual o percentual de desconto?"));
    let quantidadeMinima = parseInt(prompt("Qual a quantidade mínima para desconto?"))
    const valorDeslocamento = parseFloat(prompt("Qual o valor de deslocamento?"));
    let valorDesconto = 0;

    if(quantidadeAparelhos >= quantidadeMinima){
        valorDesconto = (quantidadeAparelhos * valorAparelho) * (percentualDesconto / 100);
    }
    let valorTotal = (quantidadeAparelhos * valorAparelho) - valorDesconto + valorDeslocamento;
    alert("O serviço da " + nomeEmpresa + "custará R$" + valorTotal)
    if (valorTotal < menorValor) {
        menorValor = valorTotal;
        nomeMenor = nomeEmpresa;
    }
    if (valorTotal > maiorValor) {
        maiorValor = valorTotal;
        nomeMaior = nomeEmpresa;
    }
    continuar = prompt("Deseja informar novos dados? (S/N)");
}
    alert("A empresa com o maior orçamento foi " + nomeMaior + ", no valor de R$" + maiorValor);
    alert("A empresa com o menor orçamento foi " + nomeMenor + ", no valor de R$" + menorValor);
    alert("A diferença de percentual entre elas é de "+ (((maiorValor - menorValor)/menorValor ) * (100).toFixed(2) + "%"))
    inicio(nomeUsuario);
}
    

