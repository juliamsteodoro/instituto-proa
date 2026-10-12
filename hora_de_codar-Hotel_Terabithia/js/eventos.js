let receita_eventos = 0;
let total_eventos = 0;

function eventos(nomeUsuario){
    let quantidadeConvidados = parseInt(prompt("Quantos convidados irão comparecer?"));
    if (quantidadeConvidados > 350){
        alert("A quantidade de convidados excede a capacidade máxima do hotel.");

    } else {
        let duraçãoEvento = parseInt(prompt("Qual a duração do evento em horas?"))
        let garcons_porConvidado = Math.ceil(quantidadeConvidados / 12)
        let garconsTotal = garcons_porConvidado + duraçãoEvento;
        let custoGarcons = garconsTotal * 10.50 * duraçãoEvento;
    if (quantidadeConvidados <= 150){
        alert("O audiório Laranja será usado sem necessidade de cadeiras extras")
    }
    if (quantidadeConvidados >= 151 && quantidadeConvidados <= 220){
        alert("O auditório Laranja será usado, mas haverá necessidade de " + (quantidadeConvidados - 150) + "cadeiras extras.")
    }
    if (quantidadeConvidados >= 221 && quantidadeConvidados <= 350){
        alert("O auditório Colorado será usado")
    }
    let litrosAgua = quantidadeConvidados * 0.2;
    let custoAgua = litrosAgua * 0.4;
    let litrosCafe = quantidadeConvidados * 0.2;
    let custoCafe = litrosCafe * 0.8
    let quantidadeSalgados = quantidadeConvidados * 40
    let custoSalgados = quantidadeSalgados * 0.32

    let valorTotalEvento = custoGarcons + custoAgua + custoCafe + custoSalgados

    receita_eventos += valorTotalEvento;
    total_eventos++;
    alert("Custo total do evento será de R$" + valorTotalEvento.toFixed(2));
    inicio(nomeUsuario)
    }

   
}