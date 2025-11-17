const formu = {email: () => document.getElementById("email")}

function names() {
    nome = formu.email().value;
    console.log(nome);
    return nome;
}

dono = names();