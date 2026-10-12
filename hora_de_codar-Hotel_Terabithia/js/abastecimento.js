function abastecimento(nomeUsuario){
    let alcool_wayne = parseFloat(prompt("Qual o preço do Álcool no Wayne Oil?"));
    let gasolina_wayne = parseFloat(prompt("Qual o preço da Gasolina no Wayne Oil?"));
    let alcool_stark = parseFloat(prompt("Qual o preço do Álcool na StarK Oil?"));
    let gasolina_stark = parseFloat(prompt("Qual o preço da Gasolina na Stark Oil?"));

    let valorWayne;
    let combWayne;
    if(alcool_wayne <= (gasolina_wayne  * 0.70)){
        combWayne = "Álcool";
        valorWayne = (alcool_wayne * 42);
    }else {
        combWayne = "Gasolina";
        valorWayne = (gasolina_wayne * 42);
    }
    let combStark;
    let valorStark;
    if (alcool_stark <= (gasolina_stark * 0.70)){
        combStark = "Álcool"
        valorStark = (alcool_stark * 42);
    }else {
        combStark = "Gasolina";
        valorStark = (gasolina_stark * 42);
    }

    if (valorWayne > valorStark){
        alert(nomeUsuario + ", é mais barato abastecer com " + combStark + " no posto Stark Oil.")
    }else {
        alert(nomeUsuario + ", é mais barato abastecer com " + combWayne + " no posto Wayne Oil.")
    }
    inicio(nomeUsuario)
}