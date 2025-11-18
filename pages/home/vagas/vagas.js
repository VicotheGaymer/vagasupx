const dono = sessionStorage.getItem("emaillogado");
//----------------------------------------------------------------------------------

function teste() {
    console.log(dono);
}

const link = "https://vagas-fb9c4-default-rtdb.firebaseio.com/";

async function http(method, url, body) {
    const r = await fetch(url, {
        method,
        headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    if (!r.ok) throw new Error(`HTTP ${r.status} - ${await r.text()}`);
    return r.json();
}

function log(msg)
{ 
    document.getElementById("log").textContent = msg; 
}

async function funcaoexecutar(id) {
    try {
        const urlGet = link + 'vaga/0' + id + '/reservada.json';
        const urlDono = link + 'vaga/0' + id + '/dono.json';
        const atual = await http("GET", urlGet);
        if (atual === true) {
            console.log("vaga ja reservada");
            return;
        }
        const urlPatch = link + 'vaga/0' + id + '/reservada.json';
        await http("PUT", urlPatch, true);
        await http("PUT", urlDono, dono);
        console.log("reserva feita com sucesso");
    } catch (e) {
        console.log("erro ao fazer reserva: " + e.message);
    }      
}

async function funcaoliberar(id) {
    // Sua função personalizada ao LIBERAR uma vaga
    try {
        const url = link + 'vaga/0' + id + '/ocupacao.json';
        const atual = await http("GET", url);
        if (atual !== false) {
        await http("PUT", url, false);
        }
        console.log("poste abaixado");
    } catch (e) {
        console.log("erro ao abaixar: " + e.message);
    }
}

async function funcaofechar(id) {
    const spot = spots.find(s => s.id === id);
    try {
        const urlGet = link + 'vaga/0' + id + '/reservada.json';
        const url = link + 'vaga/0' + id + '/ocupacao.json';
        const atual = await http("GET", url);
        if (atual !== true) {
            await http("PUT", url, true);
            await http("PUT", urlGet, false);
        }
        console.log("poste levantado");
    } catch (e) {
        console.log("erro ao desocupar vaga: " + e.message);
    }
}

// ==========================================
async function getstatus(tipo, id) {
    if(tipo == 0)
    {
        const urlGet = link + 'vaga/0' + id + '/reservada.json';
        const atual = await http("GET", urlGet);

        if(atual === true)
        {
            return 'reservada';
        }
        else{
            return 'disponivel';
        }
    }
    if(tipo == 1)
    {
        const urlGet2 = link + 'vaga/0' + id + '/ocupacao.json';
        const atual2 = await http("GET", urlGet2);
        return atual2;
    }
}

// Estado das vagas
const spots = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    status: 'disponivel', 
    liberado: false // controla se já foi clicado em liberar
}));

// Ícone do carro SVG
const carIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/>
        <circle cx="7" cy="17" r="2"/>
        <path d="M9 17h6"/>
        <circle cx="17" cy="17" r="2"/>
    </svg>
`;

function updateStats() {
    const counts = {
        disponivel: spots.filter(s => s.status === 'disponivel').length,
        reservada: spots.filter(s => s.status === 'reservada').length,
        ocupada: spots.filter(s => s.status === 'ocupada').length
    };

    document.getElementById('count-disponivel').textContent = counts.disponivel;
    document.getElementById('count-reservada').textContent = counts.reservada;
    document.getElementById('count-ocupada').textContent = counts.ocupada;
}

// ---------- HANDLE RESERVAR (verifica dono atual antes de gravar) ----------
async function handleReservar(id) {
    try {
        const urlDono = link + `vaga/0${id}/dono.json`;
        const urlReservada = link + `vaga/0${id}/reservada.json`; // se usar este campo
        const currentDono = await http("GET", urlDono);

        if (currentDono && currentDono !== null) {
            console.log("vaga já tem dono:", currentDono);
            await renderSpots();
            return;
        }

        // grava dono e (se usar) reservada
        await http("PUT", urlDono, dono);
        // Se você mantiver o campo reservada no DB, atualize também:
        // await http("PUT", urlReservada, true);

        console.log("Reserva feita com sucesso por:", dono);
        await renderSpots();
    } catch (e) {
        console.error("erro ao reservar:", e);
    }
}

async function handleLiberar(id) {
    try {
        const urlDono = link + `vaga/0${id}/dono.json`;
        const urlOcup = link + `vaga/0${id}/ocupacao.json`;

        const donoVaga = await http("GET", urlDono);
        // se não for dono, não faz nada (só re-render)
        if (!donoVaga || donoVaga !== dono) {
            console.log("Você não é dono desta vaga.");
            await renderSpots();
            return;
        }

        const ocupacao = await http("GET", urlOcup);

        // Regra do Vinicius:
        // ocupacao === true  -> pino em pé -> botão mostra "Liberar" -> ação: abaixar (set ocupacao = false)
        // ocupacao === false -> pino abaixado -> botão mostra "Fechar"  -> ação: levantar (set ocupacao = true)
        if (ocupacao === true) {
            // chamar a função que já tem (abaixa o pino)
            await funcaoliberar(id); // essa função faz PUT ocupacao=false
        } else {
            // chama a função que levanta o pino e também limpa a flag de reservada (conforme seu código)
            await funcaofechar(id); // essa função faz PUT ocupacao=true e PUT reservada=false no seu DB
        }

        // Re-render para atualizar UI após alteração
        await renderSpots();
    } catch (e) {
        console.error("erro no handleLiberar:", e);
    }
}

function getButtonText(status, liberado) {
    if (status === 'reservada' && liberado) {
        return 'Fechar';
    } else if (status === 'reservada' && !liberado) {
        return 'Liberar';
    }
    return 'Fechar';
}

async function renderSpots() {
    try {
        const vagas = await http("GET", link + "vaga.json") || {};
        const grid = document.getElementById("parking-grid");
        grid.innerHTML = "";

        // recalcula contadores locais
        let disponivelCount = 0, reservadaCount = 0, ocupadaCount = 0;

        for (let i = 1; i <= 10; i++) {
            const key = "0" + i;
            const v = vagas[key] || {};

            // valores do Firebase (tratando undefined)
            const ocupacao = (v.ocupacao === true); // true = pino em pé
            const donoVaga = v.dono === undefined ? null : v.dono;
            const reservada = donoVaga !== null; // considera reservada se houver dono

            // decide status visual
            let statusClass = "disponivel";
            if (ocupacao) {
                statusClass = "ocupada";
                ocupadaCount++;
            } else if (reservada) {
                statusClass = "reservada";
                reservadaCount++;
            } else {
                statusClass = "disponivel";
                disponivelCount++;
            }

            const ehDono = donoVaga === dono;

            const spotDiv = document.createElement("div");
            spotDiv.className = `parking-spot ${statusClass}`;
            spotDiv.innerHTML = `
                <div class="spot-header">
                    ${carIcon}
                    <span class="spot-number">Vaga ${i}</span>
                </div>
                <div class="spot-buttons" id="btn-area-${i}"></div>
            `;

            const btnArea = spotDiv.querySelector(`#btn-area-${i}`);

            // Se ocupada -> nenhum botão
            if (statusClass === "ocupada") {
                btnArea.innerHTML = "";
            }
            // Se reservada por outro -> nenhum botão (fica vermelha)
            else if (statusClass === "reservada" && !ehDono) {
                btnArea.innerHTML = "";
            }
            // Se reservada e sou dono -> botão Liberar/Fechar dependendo de ocupacao
            else if (statusClass === "reservada" && ehDono) {
                const text = ocupacao ? "Liberar" : "Fechar";
                // Chamamos handleLiberar para re-verificar estado atual antes de agir
                btnArea.innerHTML = `<button class="btn-liberar" onclick="handleLiberar(${i})">${text}</button>`;
            }
            // Disponível -> botão Reservar
            else if (statusClass === "disponivel") {
                btnArea.innerHTML = `<button class="btn-reservar" onclick="handleReservar(${i})">Reservar</button>`;
            }

            grid.appendChild(spotDiv);
        }

        // atualiza contadores na tela
        document.getElementById('count-disponivel').textContent = disponivelCount;
        document.getElementById('count-reservada').textContent = reservadaCount;
        document.getElementById('count-ocupada').textContent = ocupadaCount;
    } catch (err) {
        console.error("Erro ao renderizar vagas:", err);
    }
}

async function refreshAll() {
    await renderSpots();
}

// Render inicial
refreshAll();

updateStats();











