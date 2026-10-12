const nomeHotel = "Chateau Marmont"; 

function autenticar() {
    alert("Bem vindo ao " + nomeHotel + "!");
    let user = prompt("Insira o seu nome de usuário:");
    let passwrd = prompt("Insira a sua senha:")
	let tries = 1
	while (passwrd !== "2678" && tries  < 3) {
		alert("Senha incorreta! Tentei novamente")
		passwrd = prompt("Insira a sua senha:")
		tries++;
		} 
	if (passwrd === "2678"){
        alert("Bem-vindo ao " + nomeHotel + ", " + user + ". É um imenso prazer ter você por aqui!")    		
        inicio(user)
	} else{
		alert("Sistema bloqueado.");
		}
}

autenticar(); 


