const formu = {email: () => document.getElementById("email")}

export function names() {
    const formu = { email: () => document.getElementById("email") };

    const nome = formu.email().value;
    console.log(nome);
    return nome;
}


dono = names();
