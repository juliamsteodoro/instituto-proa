function autenticar() {
    const nomeHotel = 'Terabithia';
    alert('Bem-vindo ao ' + nomeHotel);
    const nomeUsuario = lerTexto('Nome do usuário:');
    if (nomeUsuario === null) return;
    for (let tentativa = 1; tentativa <= 3; tentativa++) {
        if (prompt('Senha:') === '2678') {
            alert(`Bem-vindo ao Hotel ${nomeHotel}, ${nomeUsuario}. É um imenso prazer ter você por aqui!`);
            // Estado em memória pertencente à sessão, passado explicitamente aos módulos.
            inicio(nomeUsuario, { quartos: Array(20).fill(null), reservas: [], hospedes: [], eventos: [] });
            return;
        }
        if (tentativa < 3) alert('Senha incorreta. Tente novamente.');
    }
    alert('Sistema bloqueado.');
}
autenticar();
