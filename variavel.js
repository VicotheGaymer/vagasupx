const formu = {email: () => document.getElementById("email")}
const nome = formu.email().value;

sessionStorage.setItem("emaillogado", nome);
window.location.href = "pages/home/vagas/vaga.html";

